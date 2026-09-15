#!/usr/bin/env python3
"""
graphics_engine.py — Renders Instagram-ready graphics for quotes.

Creates 1080x1350px portrait images with gradient backgrounds.
"""

import io
import logging
import random
from pathlib import Path

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    raise ImportError("Pillow is required. Install with: pip install Pillow")

logger = logging.getLogger("graphics_engine")


class QuoteGraphicsEngine:
    """Renders quote graphics for Instagram."""

    # Instagram story dimensions: 1080x1920 for stories, 1080x1350 for feed
    WIDTH = 1080
    HEIGHT = 1350

    # Gradient color palettes
    GRADIENTS = [
        # (start_color, end_color)
        ("#667eea", "#764ba2"),  # Purple
        ("#f093fb", "#f5576c"),  # Pink-Red
        ("#4facfe", "#00f2fe"),  # Blue-Cyan
        ("#43e97b", "#38f9d7"),  # Green-Mint
        ("#fa709a", "#fee140"),  # Pink-Yellow
        ("#30cfd0", "#330867"),  # Cyan-Purple
        ("#a8edea", "#fed6e3"),  # Light Blue-Pink
        ("#ff9a56", "#ff6a88"),  # Orange-Red
    ]

    def __init__(self):
        """Initialize the graphics engine."""
        self.fonts = self._load_fonts()

    def _load_fonts(self) -> dict:
        """Load fonts for text rendering."""
        fonts = {}

        try:
            # Try to use system fonts, fallback to default if not available
            from PIL import ImageFont

            try:
                fonts["quote"] = ImageFont.truetype(
                    "/System/Library/Fonts/Helvetica.ttc", 60
                )
                fonts["author"] = ImageFont.truetype(
                    "/System/Library/Fonts/Helvetica.ttc", 40
                )
            except (IOError, OSError):
                # Fallback for Linux/Windows
                try:
                    fonts["quote"] = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 60)
                    fonts["author"] = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 40)
                except (IOError, OSError):
                    logger.warning("System fonts not found, using default font")
                    fonts["quote"] = ImageFont.load_default()
                    fonts["author"] = ImageFont.load_default()

        except Exception as e:
            logger.warning(f"Error loading fonts: {e}, using default")
            fonts["quote"] = ImageFont.load_default()
            fonts["author"] = ImageFont.load_default()

        return fonts

    def _hex_to_rgb(self, hex_color: str) -> tuple:
        """Convert hex color to RGB tuple."""
        hex_color = hex_color.lstrip("#")
        return tuple(int(hex_color[i : i + 2], 16) for i in (0, 2, 4))

    def _create_gradient(self, start_hex: str, end_hex: str) -> Image.Image:
        """Create a gradient background image."""
        start_rgb = self._hex_to_rgb(start_hex)
        end_rgb = self._hex_to_rgb(end_hex)

        gradient = Image.new("RGB", (self.WIDTH, self.HEIGHT))
        pixels = gradient.load()

        for y in range(self.HEIGHT):
            ratio = y / self.HEIGHT
            r = int(start_rgb[0] * (1 - ratio) + end_rgb[0] * ratio)
            g = int(start_rgb[1] * (1 - ratio) + end_rgb[1] * ratio)
            b = int(start_rgb[2] * (1 - ratio) + end_rgb[2] * ratio)

            for x in range(self.WIDTH):
                pixels[x, y] = (r, g, b)

        return gradient

    def _wrap_text(self, text: str, max_width: int, font) -> list:
        """Wrap text to fit within max width."""
        words = text.split()
        lines = []
        current_line = []

        for word in words:
            current_line.append(word)
            line_text = " ".join(current_line)

            # Estimate width (rough approximation)
            if len(line_text) > 50:  # Rough heuristic
                if len(current_line) > 1:
                    current_line.pop()
                    lines.append(" ".join(current_line))
                    current_line = [word]
                else:
                    lines.append(line_text)
                    current_line = []

        if current_line:
            lines.append(" ".join(current_line))

        return lines

    def render(self, quote_text: str, author_name: str) -> io.BytesIO:
        """Render a quote graphic.

        Args:
            quote_text: The quote text
            author_name: Author/speaker name

        Returns:
            BytesIO object containing PNG image data
        """
        try:
            # Create gradient background
            start_color, end_color = random.choice(self.GRADIENTS)
            image = self._create_gradient(start_color, end_color)

            draw = ImageDraw.Draw(image)

            # Prepare text
            quote_font = self.fonts.get("quote")
            author_font = self.fonts.get("author")

            # Wrap quote text
            quote_lines = self._wrap_text(quote_text, self.WIDTH - 80, quote_font)

            # Calculate positioning
            margin = 80
            padding = 20

            # Draw quote text
            y_pos = 200
            for line in quote_lines:
                draw.text(
                    (margin, y_pos),
                    line,
                    fill=(255, 255, 255),
                    font=quote_font,
                    align="center",
                )
                y_pos += 100

            # Draw author
            author_text = f"— {author_name}"
            y_pos += 50
            draw.text(
                (margin, y_pos),
                author_text,
                fill=(255, 255, 255),
                font=author_font,
                align="left",
            )

            # Draw branding
            branding = "BONDIFY"
            y_pos = self.HEIGHT - 100
            draw.text(
                (margin, y_pos),
                branding,
                fill=(255, 255, 255),
                font=author_font,
                align="left",
            )

            # Save to BytesIO
            output = io.BytesIO()
            image.save(output, format="PNG")
            output.seek(0)

            logger.info(f"Rendered graphic: {len(output.getvalue())} bytes")
            return output

        except Exception as e:
            logger.error(f"Failed to render graphic: {e}")
            raise RuntimeError(f"Graphics rendering failed: {e}")
