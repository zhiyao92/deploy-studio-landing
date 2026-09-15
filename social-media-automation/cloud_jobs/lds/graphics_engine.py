#!/usr/bin/env python3
"""
graphics_engine.py — Generates 1080x1350px (4:5 portrait) quote graphics.

Instagram displays feed posts at up to 4:5 and crops profile-grid tiles to
3:4. Rendering at 4:5 means the feed shows the full card, and the grid crop
only trims ~34px per side — absorbed by the side margins below.

Style modeled on the LDS Quotes app cards: a deep, muted gradient background,
a large pale decorative quotation mark, the quote in white serif type with
generous line spacing, and an italic "— Author —" line underneath.

Fonts are loaded from the OS (Georgia on macOS, DejaVu Serif on the Ubuntu
runners GitHub Actions uses), with an optional local fonts/ directory taking
priority. Quote font size adapts to the quote length so short quotes are big
and long quotes still fit comfortably.
"""

import random
from io import BytesIO
from pathlib import Path
from typing import Optional, Tuple

from PIL import Image, ImageDraw, ImageFont

# Font search order: local fonts/ dir first, then macOS, then Linux (CI).
_FONT_DIR = Path(__file__).parent / "fonts"

_SERIF_CANDIDATES = [
    _FONT_DIR / "Quote.ttf",
    Path("/System/Library/Fonts/Supplemental/Georgia.ttf"),
    Path("/System/Library/Fonts/Supplemental/Times New Roman.ttf"),
    Path("/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf"),
    Path("/usr/share/fonts/truetype/liberation/LiberationSerif-Regular.ttf"),
]

_SERIF_ITALIC_CANDIDATES = [
    _FONT_DIR / "Author.ttf",
    Path("/System/Library/Fonts/Supplemental/Georgia Italic.ttf"),
    Path("/System/Library/Fonts/Supplemental/Times New Roman Italic.ttf"),
    Path("/usr/share/fonts/truetype/dejavu/DejaVuSerif-Italic.ttf"),
    Path("/usr/share/fonts/truetype/liberation/LiberationSerif-Italic.ttf"),
]

_SERIF_BOLD_CANDIDATES = [
    _FONT_DIR / "Ornament.ttf",
    Path("/System/Library/Fonts/Supplemental/Georgia Bold.ttf"),
    Path("/System/Library/Fonts/Supplemental/Times New Roman Bold.ttf"),
    Path("/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf"),
    Path("/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf"),
]

_SANS_CANDIDATES = [
    _FONT_DIR / "Watermark.ttf",
    Path("/System/Library/Fonts/Supplemental/Arial.ttf"),
    Path("/System/Library/Fonts/Helvetica.ttc"),
    Path("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"),
    Path("/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"),
]


def _find_font(candidates: list[Path]) -> Optional[Path]:
    for path in candidates:
        if path.exists():
            return path
    return None


def _load_font(candidates: list[Path], size: int) -> ImageFont.ImageFont:
    path = _find_font(candidates)
    if path:
        try:
            return ImageFont.truetype(str(path), size=size)
        except Exception:
            pass
    return ImageFont.load_default()


class GradientGenerator:
    """Generates smooth, muted gradient backgrounds with random hues."""

    BRAND_PALETTES = (
        ((43, 73, 91), (25, 45, 62)),    # deep blue
        ((80, 71, 45), (53, 48, 31)),    # olive/gold
        ((63, 75, 63), (37, 51, 43)),    # sage
        ((74, 56, 76), (45, 35, 58)),    # plum
        ((82, 58, 47), (52, 38, 33)),    # warm brown
    )

    @staticmethod
    def _random_deep_color() -> Tuple[Tuple[int, int, int], Tuple[int, int, int]]:
        """Generate a random deep, muted color pair (top, bottom).

        Picks a fully random hue, then constrains saturation and brightness
        to the deep/muted range so white text always stays legible and the
        card keeps an elegant look. The bottom stop is the same hue, darker.
        """
        # Use a recognizable devotional palette instead of unrestricted random
        # colors. This keeps the feed cohesive while still giving daily variety.
        return random.choice(GradientGenerator.BRAND_PALETTES)

    @classmethod
    def generate_random_gradient(
        cls,
        width: int = 1080,
        height: int = 1080,
    ) -> Tuple[Image.Image, Tuple[int, int, int]]:
        """Generate a smooth diagonal/vertical gradient with a random hue.

        Returns:
            (image, base_color) — base_color is the top color, used to tint
            decorative elements so they harmonize with the background.
        """
        c1, c2 = cls._random_deep_color()

        # Render a tiny gradient strip and upscale with bilinear filtering —
        # visually identical to per-pixel interpolation but ~1000x faster.
        angle = random.choice(["vertical", "diagonal"])
        if angle == "vertical":
            strip = Image.new("RGB", (1, 256))
            for y in range(256):
                f = y / 255
                strip.putpixel(
                    (0, y),
                    tuple(int(c1[i] + (c2[i] - c1[i]) * f) for i in range(3)),
                )
            img = strip.resize((width, height), Image.BILINEAR)
        else:
            small = Image.new("RGB", (64, 64))
            for x in range(64):
                for y in range(64):
                    f = (x + y) / 126
                    small.putpixel(
                        (x, y),
                        tuple(int(c1[i] + (c2[i] - c1[i]) * f) for i in range(3)),
                    )
            img = small.resize((width, height), Image.BILINEAR)

        return img, c1


class QuoteGraphicsEngine:
    """Renders quote cards with adaptive serif typography."""

    def __init__(self, width: int = 1080, height: int = 1350):
        self.width = width
        self.height = height

    # ------------------------------------------------------------------
    # Layout helpers
    # ------------------------------------------------------------------

    def _wrap_text(self, text: str, font: ImageFont.ImageFont, max_width: int) -> list[str]:
        """Wrap text into lines that fit max_width."""
        draw = ImageDraw.Draw(Image.new("RGB", (1, 1)))
        words = text.split()
        lines: list[str] = []
        current: list[str] = []

        for word in words:
            test = " ".join(current + [word])
            if draw.textlength(test, font=font) <= max_width:
                current.append(word)
            else:
                if current:
                    lines.append(" ".join(current))
                current = [word]
        if current:
            lines.append(" ".join(current))
        return lines

    def _fit_quote_font(
        self,
        text: str,
        max_width: int,
        max_height: int,
    ) -> Tuple[ImageFont.ImageFont, list[str], int]:
        """Pick the largest font size whose wrapped text fits the box.

        Returns:
            (font, wrapped_lines, line_height)
        """
        for size in range(68, 24, -4):
            font = _load_font(_SERIF_CANDIDATES, size)
            lines = self._wrap_text(text, font, max_width)
            line_height = int(size * 1.42)  # generous, airy line spacing
            if len(lines) * line_height <= max_height:
                return font, lines, line_height

        size = 24
        font = _load_font(_SERIF_CANDIDATES, size)
        return font, self._wrap_text(text, font, max_width), int(size * 1.42)

    # ------------------------------------------------------------------
    # Rendering
    # ------------------------------------------------------------------

    def render(
        self,
        quote_text: str,
        author_name: str,
        output_path: Optional[Path] = None,
    ) -> Optional[BytesIO]:
        """Render a quote card.

        Args:
            quote_text: The quote (wrapped and sized automatically).
            author_name: Author, rendered as "— Name —" in italic.
            output_path: If given, saves PNG there and returns None.

        Returns:
            BytesIO of PNG data when output_path is None.
        """
        bg, base_color = GradientGenerator.generate_random_gradient(
            self.width, self.height
        )
        # Approved single-card direction: warm paper and restrained dark type.
        img = Image.new("RGB", (self.width, self.height), (244, 239, 227))
        draw = ImageDraw.Draw(img)

        # Side margin includes a ~34px buffer per side so Instagram's 3:4
        # profile-grid crop of the 4:5 card still leaves ~110px of padding.
        margin_x = 145
        margin_y = 110
        text_width = self.width - 2 * margin_x

        # --- Quote text (adaptive size) ---------------------------------
        author_font = _load_font(_SERIF_ITALIC_CANDIDATES, 40)
        author_text = "Original devotional reflection" if author_name == "LDS Quotes" else f"—  {author_name}  —"
        author_bbox = draw.textbbox((0, 0), author_text, font=author_font)
        author_h = author_bbox[3] - author_bbox[1]

        gap_before_author = 55
        watermark_reserve = 130  # keep clear of the pill at the bottom
        available_for_quote = (
            self.height
            - 2 * margin_y
            - watermark_reserve
            - gap_before_author
            - author_h
        )

        quote_font, lines, line_height = self._fit_quote_font(
            quote_text, text_width, available_for_quote
        )
        quote_block = len(lines) * line_height

        total = quote_block + gap_before_author + author_h
        # Center within the space above the watermark pill
        y = (self.height - watermark_reserve - total) // 2

        # Draw quote lines centered
        for line in lines:
            lw = draw.textlength(line, font=quote_font)
            draw.text(
                ((self.width - lw) // 2, y),
                line,
                font=quote_font,
                fill=(40, 69, 59),
            )
            y += line_height

        # Draw author, slightly muted white
        y += gap_before_author
        aw = draw.textlength(author_text, font=author_font)
        draw.text(
            ((self.width - aw) // 2, y),
            author_text,
            font=author_font,
            fill=(80, 96, 87),
        )

        # --- Watermark pill: "LDS Quotes" at the bottom -------------------
        img = self._draw_watermark(img)

        # --- Output ------------------------------------------------------
        if output_path:
            img.save(output_path, format="PNG")
            return None
        buffer = BytesIO()
        img.save(buffer, format="PNG")
        buffer.seek(0)
        return buffer

    def _load_logo(self, size: int) -> Optional[Image.Image]:
        """Load the app logo, resized with rounded corners, or None."""
        logo_path = Path(__file__).parent / "assets" / "logo.png"
        if not logo_path.exists():
            return None
        try:
            logo = Image.open(logo_path).convert("RGBA")
            logo = logo.resize((size, size), Image.LANCZOS)
            # Rounded-corner mask so it reads as an app icon inside the pill
            mask = Image.new("L", (size, size), 0)
            ImageDraw.Draw(mask).rounded_rectangle(
                [0, 0, size, size], radius=int(size * 0.28), fill=255
            )
            logo.putalpha(mask)
            return logo
        except Exception:
            return None

    def _draw_watermark(self, img: Image.Image) -> Image.Image:
        """Draw a translucent rounded pill with the app logo + 'LDS Quotes'."""
        wm_font = _load_font(_SANS_CANDIDATES, 34)

        overlay = Image.new("RGBA", (self.width, self.height), (0, 0, 0, 0))
        odraw = ImageDraw.Draw(overlay)

        text = "LDS Quotes"
        text_w = odraw.textlength(text, font=wm_font)

        pill_h = 72
        pad_x = 38
        logo_size = 54
        logo_gap = 16  # space between logo and text

        logo = self._load_logo(logo_size)
        if logo:
            pad_x = 12  # logo hugs the pill's left edge, like the app
            pill_w = int(pad_x + logo_size + logo_gap + text_w + 32)
        else:
            pill_w = int(text_w + 2 * pad_x)

        pill_x = (self.width - pill_w) // 2
        pill_y = self.height - pill_h - 56  # 56px from the bottom edge

        # Frosted translucent pill
        odraw.rounded_rectangle(
            [pill_x, pill_y, pill_x + pill_w, pill_y + pill_h],
            radius=pill_h // 2,
            fill=(231, 231, 218, 255),
        )

        text_x = pill_x + pad_x
        if logo:
            logo_y = pill_y + (pill_h - logo_size) // 2
            overlay.paste(logo, (pill_x + pad_x, logo_y), logo)
            text_x = pill_x + pad_x + logo_size + logo_gap

        # Watermark text (white, vertically centered in pill)
        text_bbox = odraw.textbbox((0, 0), text, font=wm_font)
        text_h = text_bbox[3] - text_bbox[1]
        text_y = pill_y + (pill_h - text_h) // 2 - text_bbox[1]
        odraw.text((text_x, text_y), text, font=wm_font, fill=(40, 69, 59, 255))

        return Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB")
