#!/usr/bin/env python3
"""
bondify_graphics_engine.py — Renders Bondify-branded graphics.

Spec (matches the Bondify card design):
  - 1080x1350 (4:5 portrait)
  - Diagonal purple gradient background
  - Soft translucent circles in the top-right and bottom-left corners
  - "💞 Bondify" wordmark centered at the top
  - Large bold question text centered in the middle
  - Letterspaced category label (e.g. FUTURE) near the bottom
  - "From deck: ❤️ Getting Deeper" line under the label
"""

import io
import logging
from pathlib import Path

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    raise ImportError("Pillow is required. Install with: pip install Pillow")

logger = logging.getLogger("bondify_graphics_engine")


class BondifyGraphicsEngine:
    """Renders Bondify conversation starter graphics."""

    WIDTH = 1080
    HEIGHT = 1350

    # Diagonal gradient (top-left → bottom-right), Bondify purple
    GRADIENT_START = (154, 103, 242)  # lighter violet
    GRADIENT_END = (104, 71, 223)     # deeper purple

    TEXT_MAX_WIDTH = 900
    QUESTION_SIZES = (72, 66, 60, 54, 48, 42)

    def __init__(self, logo_path: Path = None):
        """Initialize the graphics engine.

        Args:
            logo_path: Optional path to Bondify logo image. If present, it is
                used in place of the 💞 emoji in the header wordmark.
        """
        self.logo = None
        if logo_path and Path(logo_path).exists():
            try:
                self.logo = Image.open(logo_path).convert("RGBA")
                logger.info(f"Loaded logo from {logo_path}")
            except Exception as e:
                logger.warning(f"Could not load logo: {e}")

        self._bold_cache: dict[int, ImageFont.FreeTypeFont] = {}
        self._regular_cache: dict[int, ImageFont.FreeTypeFont] = {}
        self.emoji_font, self.emoji_native_size = self._load_emoji_font()

    # ------------------------------------------------------------------
    # Fonts
    # ------------------------------------------------------------------

    BOLD_CANDIDATES = [
        "/System/Library/Fonts/Supplemental/Arial Rounded Bold.ttf",
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    ]
    REGULAR_CANDIDATES = [
        "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    ]

    def _font(self, candidates: list, cache: dict, size: int) -> ImageFont.FreeTypeFont:
        if size in cache:
            return cache[size]
        for path in candidates:
            try:
                font = ImageFont.truetype(path, size)
                cache[size] = font
                return font
            except (IOError, OSError):
                continue
        logger.warning("No system fonts found, using PIL default")
        font = ImageFont.load_default()
        cache[size] = font
        return font

    def _bold(self, size: int) -> ImageFont.FreeTypeFont:
        return self._font(self.BOLD_CANDIDATES, self._bold_cache, size)

    def _regular(self, size: int) -> ImageFont.FreeTypeFont:
        return self._font(self.REGULAR_CANDIDATES, self._regular_cache, size)

    def _load_emoji_font(self):
        """Load a color emoji font if available (Apple on macOS, Noto on Linux)."""
        candidates = [
            ("/System/Library/Fonts/Apple Color Emoji.ttc", (160, 137, 96, 64, 48, 32)),
            ("/usr/share/fonts/truetype/noto/NotoColorEmoji.ttf", (109,)),
        ]
        for path, sizes in candidates:
            if not Path(path).exists():
                continue
            for size in sizes:
                try:
                    return ImageFont.truetype(path, size), size
                except (IOError, OSError):
                    continue
        logger.warning("No color emoji font available — emoji will be skipped")
        return None, 0

    # ------------------------------------------------------------------
    # Emoji-aware text rendering
    # ------------------------------------------------------------------

    @staticmethod
    def _is_emoji_cp(cp: int) -> bool:
        return (
            0x1F000 <= cp <= 0x1FAFF
            or 0x2600 <= cp <= 0x27BF
            or 0x2B00 <= cp <= 0x2BFF
        )

    def _tokenize(self, text: str) -> list:
        """Split text into ("text", str) and ("emoji", cluster) tokens."""
        tokens = []
        for ch in text:
            if ch in ("️", "‍"):
                if tokens and tokens[-1][0] == "emoji":
                    tokens[-1] = ("emoji", tokens[-1][1] + ch)
                continue
            if self._is_emoji_cp(ord(ch)):
                if tokens and tokens[-1][0] == "emoji" and tokens[-1][1].endswith("‍"):
                    tokens[-1] = ("emoji", tokens[-1][1] + ch)
                else:
                    tokens.append(("emoji", ch))
            else:
                if tokens and tokens[-1][0] == "text":
                    tokens[-1] = ("text", tokens[-1][1] + ch)
                else:
                    tokens.append(("text", ch))
        return tokens

    def _render_emoji(self, cluster: str, target_size: int):
        """Render an emoji cluster to an RGBA image of roughly target_size."""
        if not self.emoji_font:
            return None
        pad = 40
        canvas = Image.new(
            "RGBA",
            (self.emoji_native_size + pad, self.emoji_native_size + pad),
            (0, 0, 0, 0),
        )
        draw = ImageDraw.Draw(canvas)
        try:
            draw.text((0, 0), cluster, font=self.emoji_font, embedded_color=True)
        except TypeError:
            return None
        bbox = canvas.getbbox()
        if not bbox:
            return None
        canvas = canvas.crop(bbox)
        canvas.thumbnail((target_size, target_size), Image.Resampling.LANCZOS)
        return canvas

    def _draw_mixed_line(
        self,
        layer: Image.Image,
        center_x: int,
        top_y: int,
        text: str,
        font: ImageFont.FreeTypeFont,
        fill: tuple,
        emoji_size: int = 0,
        emoji_gap: int = 12,
        leading_image: Image.Image = None,
    ) -> None:
        """Draw one line (text + emoji mix) centered horizontally on `layer`."""
        draw = ImageDraw.Draw(layer)
        emoji_size = emoji_size or font.size
        tokens = self._tokenize(text)

        # Measure
        pieces = []  # (kind, payload, width)
        total = 0
        if leading_image is not None:
            pieces.append(("image", leading_image, leading_image.width + emoji_gap))
            total += leading_image.width + emoji_gap
        for kind, value in tokens:
            if kind == "emoji":
                img = self._render_emoji(value, emoji_size)
                if img is None:
                    continue
                pieces.append(("image", img, img.width + emoji_gap))
                total += img.width + emoji_gap
            else:
                w = draw.textlength(value, font=font)
                pieces.append(("text", value, w))
                total += w

        ascent, _ = font.getmetrics()
        x = center_x - total / 2
        for kind, payload, width in pieces:
            if kind == "image":
                img_y = top_y + (ascent - payload.height) // 2 + 4
                layer.paste(payload, (int(x), int(img_y)), payload)
                x += width
            else:
                draw.text((x, top_y), payload, font=font, fill=fill)
                x += width

    # ------------------------------------------------------------------
    # Layout helpers
    # ------------------------------------------------------------------

    def _create_gradient(self) -> Image.Image:
        """Diagonal gradient, rendered small then upscaled for speed."""
        sw, sh = 216, 270
        img = Image.new("RGB", (sw, sh))
        px = img.load()
        sr, sg, sb = self.GRADIENT_START
        er, eg, eb = self.GRADIENT_END
        for y in range(sh):
            for x in range(sw):
                t = (x / sw + y / sh) / 2
                px[x, y] = (
                    int(sr + (er - sr) * t),
                    int(sg + (eg - sg) * t),
                    int(sb + (eb - sb) * t),
                )
        return img.resize((self.WIDTH, self.HEIGHT), Image.Resampling.LANCZOS).convert("RGBA")

    def _draw_corner_circles(self, base: Image.Image) -> Image.Image:
        overlay = Image.new("RGBA", (self.WIDTH, self.HEIGHT), (0, 0, 0, 0))
        draw = ImageDraw.Draw(overlay)
        # Top-right large circle
        draw.ellipse(
            [self.WIDTH - 560, -260, self.WIDTH + 220, 520],
            fill=(255, 255, 255, 22),
        )
        # Bottom-left circle
        draw.ellipse(
            [-300, self.HEIGHT - 420, 180, self.HEIGHT + 60],
            fill=(255, 255, 255, 18),
        )
        return Image.alpha_composite(base, overlay)

    def _wrap_question(self, draw: ImageDraw.ImageDraw, text: str):
        """Pick the largest font size where the wrapped block fits nicely."""
        for size in self.QUESTION_SIZES:
            font = self._bold(size)
            words = text.split()
            lines, current = [], []
            for word in words:
                candidate = " ".join(current + [word])
                if draw.textlength(candidate, font=font) <= self.TEXT_MAX_WIDTH:
                    current.append(word)
                else:
                    if current:
                        lines.append(" ".join(current))
                    current = [word]
            if current:
                lines.append(" ".join(current))

            line_height = int(size * 1.3)
            block_height = len(lines) * line_height
            if block_height <= 700 and len(lines) <= 7:
                return lines, font, line_height
        return lines, font, line_height  # smallest size fallback

    # ------------------------------------------------------------------
    # Render
    # ------------------------------------------------------------------

    def render(
        self,
        question: str,
        category: str = "",
        deck_title: str = "",
        mode: str = "",
        intensity: str = "",
    ) -> io.BytesIO:
        """Render a Bondify conversation starter graphic per the card spec.

        Args:
            question: The conversation starter question
            category: Card category (e.g. "Future") — shown as the footer label
            deck_title: Deck title (e.g. "❤️ Getting Deeper")
            mode: Mode name — fallback for deck title
            intensity: Intensity — fallback for category label

        Returns:
            BytesIO object containing PNG image data
        """
        try:
            image = self._create_gradient()
            image = self._draw_corner_circles(image)
            draw = ImageDraw.Draw(image)

            # ── Header wordmark: 💞 Bondify ──
            wordmark_font = self._bold(52)
            leading = None
            header_text = "💞 Bondify"
            if self.logo is not None:
                logo = self.logo.copy()
                logo.thumbnail((60, 60), Image.Resampling.LANCZOS)
                leading = logo
                header_text = "Bondify"
            self._draw_mixed_line(
                image,
                center_x=self.WIDTH // 2,
                top_y=104,
                text=header_text,
                font=wordmark_font,
                fill=(255, 255, 255, 255),
                emoji_size=58,
                leading_image=leading,
            )

            # ── Question (centered block) ──
            lines, q_font, line_height = self._wrap_question(draw, question)
            block_height = len(lines) * line_height
            y = (self.HEIGHT - block_height) // 2 - 20
            for line in lines:
                w = draw.textlength(line, font=q_font)
                draw.text(
                    ((self.WIDTH - w) / 2, y),
                    line,
                    font=q_font,
                    fill=(255, 255, 255, 255),
                )
                y += line_height

            # ── Footer (translucent, on its own overlay for clean alpha) ──
            footer = Image.new("RGBA", (self.WIDTH, self.HEIGHT), (0, 0, 0, 0))

            label_source = (category or intensity or mode or "").strip()
            if label_source:
                label = " ".join(label_source.upper())
                label_font = self._bold(30)
                fdraw = ImageDraw.Draw(footer)
                w = fdraw.textlength(label, font=label_font)
                fdraw.text(
                    ((self.WIDTH - w) / 2, self.HEIGHT - 205),
                    label,
                    font=label_font,
                    fill=(255, 255, 255, 165),
                )

            deck_line = deck_title.strip() or (mode.title() if mode else "")
            if deck_line:
                self._draw_mixed_line(
                    footer,
                    center_x=self.WIDTH // 2,
                    top_y=self.HEIGHT - 150,
                    text=f"From deck: {deck_line}",
                    font=self._regular(36),
                    fill=(255, 255, 255, 210),
                    emoji_size=38,
                )

            image = Image.alpha_composite(image, footer)

            # ── Save ──
            output = io.BytesIO()
            image.convert("RGB").save(output, format="PNG")
            output.seek(0)

            logger.info(f"Rendered Bondify graphic: {len(output.getvalue())} bytes")
            return output

        except Exception as e:
            logger.error(f"Failed to render graphic: {e}")
            raise RuntimeError(f"Graphics rendering failed: {e}")
