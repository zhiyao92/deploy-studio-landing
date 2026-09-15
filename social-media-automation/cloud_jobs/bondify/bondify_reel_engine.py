#!/usr/bin/env python3
"""
bondify_reel_engine.py — Renders Bondify question cards as short Reel videos.

Spec:
  - 1080x1920 (9:16 portrait), H.264 MP4 with silent AAC audio track
  - Same visual language as the static card (purple gradient, wordmark,
    corner circles) via BondifyGraphicsEngine helpers
  - Timeline (~8s @ 24fps):
      0.0-1.0s  question fades in with a slight upward slide
      1.0-5.5s  question holds
      5.5-8.0s  CTA fades in below the question

Encoding uses the ffmpeg binary bundled with imageio-ffmpeg, so no system
ffmpeg install is needed locally or on CI.
"""

import io
import logging
import subprocess
from pathlib import Path

from PIL import Image, ImageDraw

from bondify_graphics_engine import BondifyGraphicsEngine

logger = logging.getLogger("bondify_reel_engine")

FPS = 24
DURATION_S = 8.0
WIDTH = 1080
HEIGHT = 1920


class BondifyReelEngine(BondifyGraphicsEngine):
    """Renders Bondify conversation starter Reels (MP4 video)."""

    WIDTH = WIDTH
    HEIGHT = HEIGHT
    TEXT_MAX_WIDTH = 880
    QUESTION_SIZES = (84, 76, 68, 60, 52, 46)

    def render_reel(
        self,
        question: str,
        category: str = "",
        deck_title: str = "",
        mode: str = "",
        intensity: str = "",
    ) -> io.BytesIO:
        """Render the question as an 8-second Reel video.

        Returns:
            BytesIO containing MP4 data.
        """
        try:
            base = self._render_base(category, deck_title, mode, intensity)
            question_layer = self._render_question_layer(question)
            cta_layer = self._render_cta_layer()

            frames = self._compose_frames(base, question_layer, cta_layer)
            video = self._encode(frames)
            logger.info(f"Rendered Bondify reel: {len(video.getvalue())} bytes")
            return video

        except Exception as e:
            logger.error(f"Failed to render reel: {e}")
            raise RuntimeError(f"Reel rendering failed: {e}")

    # ------------------------------------------------------------------
    # Layers
    # ------------------------------------------------------------------

    def _render_base(
        self, category: str, deck_title: str, mode: str, intensity: str
    ) -> Image.Image:
        """Static background: gradient, circles, wordmark, footer labels."""
        image = self._create_gradient()
        image = self._draw_corner_circles(image)

        leading = None
        header_text = "Bondify"
        if self.logo is not None:
            leading = self.logo.copy()
            leading.thumbnail((64, 64), Image.Resampling.LANCZOS)
        else:
            header_text = "💞 Bondify"
        self._draw_mixed_line(
            image,
            center_x=self.WIDTH // 2,
            top_y=170,
            text=header_text,
            font=self._bold(58),
            fill=(255, 255, 255, 255),
            emoji_size=64,
            leading_image=leading,
        )

        footer = Image.new("RGBA", (self.WIDTH, self.HEIGHT), (0, 0, 0, 0))
        label_source = (category or intensity or mode or "").strip()
        if label_source:
            label = " ".join(label_source.upper())
            label_font = self._bold(32)
            fdraw = ImageDraw.Draw(footer)
            w = fdraw.textlength(label, font=label_font)
            fdraw.text(
                ((self.WIDTH - w) / 2, self.HEIGHT - 290),
                label,
                font=label_font,
                fill=(255, 255, 255, 165),
            )

        deck_line = deck_title.strip() or (mode.title() if mode else "")
        if deck_line:
            self._draw_mixed_line(
                footer,
                center_x=self.WIDTH // 2,
                top_y=self.HEIGHT - 225,
                text=f"From deck: {deck_line}",
                font=self._regular(38),
                fill=(255, 255, 255, 210),
                emoji_size=40,
            )

        return Image.alpha_composite(image, footer)

    def _render_question_layer(self, question: str) -> Image.Image:
        """Question text block on a transparent layer, vertically centered."""
        layer = Image.new("RGBA", (self.WIDTH, self.HEIGHT), (0, 0, 0, 0))
        draw = ImageDraw.Draw(layer)
        lines, q_font, line_height = self._wrap_question(draw, question)
        block_height = len(lines) * line_height
        y = (self.HEIGHT - block_height) // 2 - 80
        for line in lines:
            w = draw.textlength(line, font=q_font)
            draw.text(
                ((self.WIDTH - w) / 2, y),
                line,
                font=q_font,
                fill=(255, 255, 255, 255),
            )
            y += line_height
        return layer

    def _render_cta_layer(self) -> Image.Image:
        """CTA lines on a transparent layer, below the question block."""
        layer = Image.new("RGBA", (self.WIDTH, self.HEIGHT), (0, 0, 0, 0))
        self._draw_mixed_line(
            layer,
            center_x=self.WIDTH // 2,
            top_y=self.HEIGHT - 560,
            text="Could you answer this? 🤔",
            font=self._bold(46),
            fill=(255, 255, 255, 235),
            emoji_size=50,
        )
        self._draw_mixed_line(
            layer,
            center_x=self.WIDTH // 2,
            top_y=self.HEIGHT - 480,
            text="Get Bondify — link in bio 📱",
            font=self._regular(40),
            fill=(255, 255, 255, 210),
            emoji_size=42,
        )
        return layer

    # ------------------------------------------------------------------
    # Animation + encoding
    # ------------------------------------------------------------------

    @staticmethod
    def _faded(layer: Image.Image, alpha: float) -> Image.Image:
        """Return a copy of `layer` with its alpha channel scaled by `alpha`."""
        if alpha >= 1.0:
            return layer
        faded = layer.copy()
        a = faded.getchannel("A").point(lambda v: int(v * alpha))
        faded.putalpha(a)
        return faded

    def _compose_frames(
        self,
        base: Image.Image,
        question_layer: Image.Image,
        cta_layer: Image.Image,
    ):
        """Yield raw RGB frames for the timeline."""
        total_frames = int(DURATION_S * FPS)
        q_fade_frames = int(1.0 * FPS)
        cta_start = int(5.5 * FPS)
        cta_fade_frames = int(0.8 * FPS)
        slide_px = 40

        for i in range(total_frames):
            frame = base

            # Question: fade + slide up during the first second
            if i < q_fade_frames:
                t = (i + 1) / q_fade_frames
                # ease-out
                t = 1 - (1 - t) ** 2
                q = self._faded(question_layer, t)
                offset = int(slide_px * (1 - t))
                shifted = Image.new("RGBA", (self.WIDTH, self.HEIGHT), (0, 0, 0, 0))
                shifted.paste(q, (0, offset), q)
                frame = Image.alpha_composite(frame, shifted)
            else:
                frame = Image.alpha_composite(frame, question_layer)

            # CTA: fade in near the end
            if i >= cta_start:
                t = min(1.0, (i - cta_start + 1) / cta_fade_frames)
                frame = Image.alpha_composite(frame, self._faded(cta_layer, t))

            yield frame.convert("RGB").tobytes()

    @staticmethod
    def _encode(frames) -> io.BytesIO:
        """Encode raw RGB frames to H.264 MP4 with a silent audio track."""
        import imageio_ffmpeg

        ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
        cmd = [
            ffmpeg,
            "-y",
            "-f", "rawvideo",
            "-pix_fmt", "rgb24",
            "-s", f"{WIDTH}x{HEIGHT}",
            "-r", str(FPS),
            "-i", "-",
            # Silent stereo audio (some platforms reject soundless video)
            "-f", "lavfi",
            "-i", "anullsrc=channel_layout=stereo:sample_rate=44100",
            "-shortest",
            "-c:v", "libx264",
            "-preset", "medium",
            "-crf", "23",
            "-pix_fmt", "yuv420p",
            "-c:a", "aac",
            "-b:a", "64k",
            "-movflags", "+faststart",
            "-f", "mp4",
        ]

        import tempfile

        with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as tmp:
            out_path = tmp.name

        proc = subprocess.Popen(
            cmd + [out_path],
            stdin=subprocess.PIPE,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.PIPE,
        )
        for frame in frames:
            proc.stdin.write(frame)
        proc.stdin.close()
        stderr = proc.stderr.read()
        proc.wait()

        if proc.returncode != 0:
            raise RuntimeError(f"ffmpeg failed: {stderr[-500:].decode(errors='replace')}")

        data = Path(out_path).read_bytes()
        Path(out_path).unlink(missing_ok=True)

        output = io.BytesIO(data)
        output.seek(0)
        return output
