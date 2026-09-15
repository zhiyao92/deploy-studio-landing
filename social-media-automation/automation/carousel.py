#!/usr/bin/env python3
"""Render a Threads/Instagram carousel for the Kelvintanzy builder feed.

Format follows the reference post Kelvin picked (threads.com/share/BBPY0h_yET):
portrait 4:5, text ON the slides, story told slide by slide so each one withholds
enough to earn the swipe. App shots are packaged image assets, never captured
from a simulator at runtime.

Slide kinds:
  hook    big statement, nothing else on the slide
  single  a complete one-image explainer with three compact takeaways
  beat    one story beat, optional small kicker line
  list    a set of items, optionally struck through ("strike": false to leave plain)
  diagram an original text-and-shape explanation, never a product screenshot
  code    a syntax card paired with original visual result panels
  comparison two implementation options and their visible product effect
  reference a sourced product screen inside an annotated editorial frame
  example a concrete input-to-interface product example
  close   the payoff / reflection
  utility a practical checklist or decision test worth saving

Usage: python3 scripts/make-carousel.py <deck.json> <outdir>
"""
import json, os, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

W, H = 1080, 1350
BG, INK, MUTED, STRIKE = (245, 247, 250), (15, 17, 21), (107, 114, 128), (194, 65, 12)
PAD = 88
FONT = os.getenv("CAROUSEL_FONT") or next(
    path for path in (
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/System/Library/Fonts/SFNS.ttf",
    ) if Path(path).exists()
)
MONO_FONT = next(
    (path for path in (
        "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf",
        "/System/Library/Fonts/SFNSMono.ttf",
    ) if Path(path).exists()),
    FONT,
)


def f(sz):
    return ImageFont.truetype(FONT, sz)


def mono(sz):
    return ImageFont.truetype(MONO_FONT, sz)


def wrap(d, text, font, maxw):
    lines, cur = [], ""
    for w in text.split():
        t = (cur + " " + w).strip()
        if d.textlength(t, font=font) <= maxw:
            cur = t
        else:
            lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def draw_block(d, text, font, y, fill, lh, maxw, x=PAD):
    for line in wrap(d, text, font, maxw):
        d.text((x, y), line, font=font, fill=fill)
        y += lh
    return y


def paste_cover(img, source, box):
    """Crop an image to fill a box while preserving its aspect ratio."""
    left, top, right, bottom = box
    box_w, box_h = right - left, bottom - top
    scale = max(box_w / source.width, box_h / source.height)
    resized = source.resize(
        (round(source.width * scale), round(source.height * scale)), Image.LANCZOS
    )
    crop_left = max(0, (resized.width - box_w) // 2)
    crop_top = max(0, (resized.height - box_h) // 2)
    cropped = resized.crop((crop_left, crop_top, crop_left + box_w, crop_top + box_h))
    img.paste(cropped, (left, top))


def render(slide, handle, deck_dir):
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)
    maxw = W - PAD * 2
    kind = slide["kind"]

    if kind == "hook":
        font = f(86)
        lines = wrap(d, slide["text"], font, maxw)
        y = (H - len(lines) * 100) // 2 - 60
        draw_block(d, slide["text"], font, y, INK, 100, maxw)

    elif kind == "single":
        d.text((PAD, 98), slide.get("eyebrow", "TECH, EXPLAINED"), font=f(27), fill=STRIKE)
        y = draw_block(d, slide["text"], f(72), 165, INK, 86, maxw)
        y = draw_block(d, slide.get("kicker", ""), f(37), y + 34, MUTED, 50, maxw)
        y += 58
        for item in slide.get("items", []):
            d.ellipse((PAD, y + 12, PAD + 18, y + 30), fill=STRIKE)
            y = draw_block(d, item, f(34), y, INK, 46, maxw - 48, PAD + 42) + 28
        if slide.get("sourceLabel"):
            d.text((PAD, H - 142), slide["sourceLabel"], font=f(21), fill=MUTED)

    elif kind == "beat":
        if slide.get("eyebrow"):
            d.text((PAD, 170), slide["eyebrow"], font=f(27), fill=STRIKE)
            start_y = 238
        else:
            start_y = 300
        y = draw_block(d, slide["text"], f(72), start_y, INK, 86, maxw)
        if slide.get("kicker"):
            draw_block(d, slide["kicker"], f(42), y + 40, MUTED, 56, maxw)

    elif kind == "list":
        y = draw_block(d, slide["text"], f(64), 250, INK, 78, maxw)
        y += 60
        struck = slide.get("strike", True)
        for item in slide["items"]:
            font = f(52)
            d.text((PAD, y), item, font=font, fill=MUTED if struck else INK)
            if struck:
                d.line([(PAD, y + 34), (PAD + d.textlength(item, font=font), y + 34)],
                       fill=STRIKE, width=5)
            y += 86
        if slide.get("sourceLabel"):
            d.text((PAD, H - 142), slide["sourceLabel"], font=f(21), fill=MUTED)

    elif kind == "diagram":
        if slide.get("eyebrow"):
            d.text((PAD, 105), slide["eyebrow"], font=f(27), fill=STRIKE)
        y = draw_block(d, slide["text"], f(62), 170, INK, 75, maxw)
        y += 55
        items = slide.get("items", [])
        for index, item in enumerate(items):
            d.rounded_rectangle((PAD, y, W - PAD, y + 126), radius=24,
                                fill=(255, 255, 255), outline=(205, 211, 220), width=3)
            draw_block(d, item, f(40), y + 35, INK, 50, maxw - 70, PAD + 34)
            y += 158
            if index < len(items) - 1:
                d.line((W // 2, y - 29, W // 2, y - 4), fill=STRIKE, width=5)
                d.polygon(((W // 2 - 10, y - 11), (W // 2 + 10, y - 11),
                           (W // 2, y + 3)), fill=STRIKE)

    elif kind == "example":
        d.text((PAD, 105), slide.get("eyebrow", "CONCRETE EXAMPLE"), font=f(27), fill=STRIKE)
        y = draw_block(d, slide["text"], f(60), 168, INK, 73, maxw)
        y += 38
        d.rounded_rectangle((PAD, y, W - PAD, y + 190), radius=24,
                            fill=(255, 255, 255), outline=(205, 211, 220), width=3)
        d.text((PAD + 30, y + 24), slide.get("inputLabel", "INPUT"), font=f(23), fill=STRIKE)
        draw_block(d, slide["input"], f(34), y + 72, INK, 44, maxw - 60, PAD + 30)
        arrow_y = y + 221
        d.line((W // 2, y + 196, W // 2, arrow_y + 24), fill=STRIKE, width=5)
        d.polygon(((W // 2 - 12, arrow_y + 14), (W // 2 + 12, arrow_y + 14),
                   (W // 2, arrow_y + 30)), fill=STRIKE)
        out_y = y + 250
        d.rounded_rectangle((PAD, out_y, W - PAD, out_y + 350), radius=28,
                            fill=(24, 28, 36))
        d.text((PAD + 30, out_y + 25), slide.get("outputLabel", "APP RESULT"),
               font=f(23), fill=(235, 150, 112))
        chips = slide.get("items", [])[:4]
        gap = 18
        chip_w = (maxw - 60 - gap) // 2
        for index, item in enumerate(chips):
            row, col = divmod(index, 2)
            x = PAD + 30 + col * (chip_w + gap)
            cy = out_y + 83 + row * 112
            d.rounded_rectangle((x, cy, x + chip_w, cy + 82), radius=40,
                                fill=(245, 247, 250))
            draw_block(d, item, f(25), cy + 24, INK, 32, chip_w - 36, x + 18)

    elif kind == "code":
        y = draw_block(d, slide["text"], f(54), 92, INK, 66, maxw)
        y += 30
        lines = slide.get("code", "").splitlines()
        code_font_size = 25 if len(lines) <= 8 else 19
        code_line_height = 46 if len(lines) <= 8 else 32
        code_h = max(230, len(lines) * code_line_height + 54)
        d.rounded_rectangle((PAD, y, W - PAD, y + code_h), radius=24, fill=(24, 28, 36))
        for number, line in enumerate(lines, 1):
            yy = y + 25 + (number - 1) * code_line_height
            d.text((PAD + 24, yy), f"{number:>2}",
                   font=mono(code_font_size), fill=(104, 113, 130))
            d.text((PAD + 78, yy), line,
                   font=mono(code_font_size), fill=(226, 232, 240))
        y += code_h + 28
        if slide.get("explanation"):
            y = draw_block(d, slide["explanation"], f(29), y, INK, 39, maxw) + 24
        previews = slide.get("previews", [])
        if previews:
            gap = 22
            panel_w = (maxw - gap * (len(previews) - 1)) // len(previews)
            for index, preview in enumerate(previews):
                x = PAD + index * (panel_w + gap)
                panel = (x, y, x + panel_w, y + 300)
                d.rounded_rectangle(panel, radius=24,
                                    fill=tuple(preview.get("color", [224, 232, 224])))
                if preview.get("image"):
                    shot = Image.open((deck_dir / preview["image"]).resolve()).convert("RGB")
                    paste_cover(img, shot, panel)
                    # The translucent label bar keeps context legible over either
                    # a bright or dark result image.
                    overlay = Image.new("RGBA", (panel_w, 62), (15, 17, 21, 190))
                    img.paste(overlay, (x, y), overlay)
                    label_font = f(22 if len(preview["label"]) > 20 else 25)
                    d.text((x + 20, y + 15), preview["label"], font=label_font, fill=(255, 255, 255))
                    d.rounded_rectangle(panel, radius=24, outline=(255, 255, 255), width=3)
                else:
                    d.text((x + 24, y + 22), preview["label"], font=f(27), fill=INK)
                    for n in range(5):
                        yy = y + 92 + n * 40
                        d.line((x + 24, yy, x + panel_w - 24, yy + (n % 2) * 18),
                               fill=tuple(preview.get("lineColor", [97, 120, 103])), width=6)
                    d.ellipse((x + panel_w // 2 - 13, y + 165,
                               x + panel_w // 2 + 13, y + 191), fill=STRIKE)
            if slide.get("sourceLabel"):
                d.text((PAD, y + 322), slide["sourceLabel"], font=f(20), fill=MUTED)

    elif kind == "comparison":
        y = draw_block(d, slide["text"], f(54), 92, INK, 66, maxw)
        y += 34
        options = slide.get("options", [])[:2]
        for index, option in enumerate(options):
            top = y + index * 430
            d.rounded_rectangle((PAD, top, W - PAD, top + 380), radius=26,
                                fill=(255, 255, 255), outline=(205, 211, 220), width=3)
            d.text((PAD + 30, top + 24), option["label"], font=f(30), fill=STRIKE)
            d.rounded_rectangle((PAD + 28, top + 82, W - PAD - 28, top + 225),
                                radius=16, fill=(24, 28, 36))
            for line_number, line in enumerate(option.get("code", "").splitlines()):
                d.text((PAD + 50, top + 108 + line_number * 40), line,
                       font=mono(24), fill=(226, 232, 240))
            draw_block(d, option.get("result", ""), f(31), top + 260, INK, 42,
                       maxw - 64, PAD + 32)

    elif kind == "reference":
        # A reference is evidence for a specific interface discussion, not a
        # screenshot-led post. Keep it inside our editorial frame and visibly
        # credit the product/source on the slide.
        y = draw_block(d, slide["text"], f(54), 105, INK, 66, maxw)
        top = y + 38
        footer_h = 150
        box_h = H - top - footer_h
        shot = Image.open((deck_dir / slide["image"]).resolve()).convert("RGB")
        scale = min(maxw / shot.width, box_h / shot.height)
        shot = shot.resize((int(shot.width * scale), int(shot.height * scale)), Image.LANCZOS)
        x = (W - shot.width) // 2
        sy = top + (box_h - shot.height) // 2
        d.rounded_rectangle((x - 8, sy - 8, x + shot.width + 8, sy + shot.height + 8),
                            radius=24, fill=(255, 255, 255), outline=(205, 211, 220), width=3)
        img.paste(shot, (x, sy))
        label = f"REFERENCE · {slide['product']} · {slide['screen']}"
        d.text((PAD, H - 137), label, font=f(22), fill=STRIKE)

    elif kind == "close":
        font = f(76)
        lines = wrap(d, slide["text"], font, maxw)
        y = (H - len(lines) * 92) // 2 - 40
        y = draw_block(d, slide["text"], font, y, INK, 92, maxw)
        if slide.get("kicker"):
            draw_block(d, slide["kicker"], f(40), y + 36, MUTED, 52, maxw)

    elif kind == "utility":
        d.text((PAD, 128), "SAVE THIS", font=f(28), fill=STRIKE)
        y = draw_block(d, slide["text"], f(62), 205, INK, 75, maxw)
        y += 42
        for index, item in enumerate(slide.get("items", []), 1):
            d.rounded_rectangle((PAD, y, W - PAD, y + 112), radius=20,
                                fill=(255, 255, 255), outline=(222, 226, 232), width=2)
            d.text((PAD + 26, y + 26), str(index), font=f(34), fill=STRIKE)
            draw_block(d, item, f(36), y + 29, INK, 45, maxw - 100, PAD + 80)
            y += 132

    if slide.get("sourceLabel") and kind not in ("single", "list", "code", "reference"):
        d.text((PAD, H - 142), slide["sourceLabel"], font=f(21), fill=MUTED)
    d.text((PAD, H - 96), handle, font=f(30), fill=MUTED)
    return img


def render_deck(deck_path: Path, out: Path, deck_override: dict | None = None) -> list[Path]:
    deck = deck_override or json.loads(deck_path.read_text())
    out.mkdir(parents=True, exist_ok=True)
    rendered = []
    for i, slide in enumerate(deck["slides"], 1):
        p = out / f"slide-{i:02d}.png"
        render(slide, deck.get("handle", "@KelvinTanZY"), deck_path.parent).save(p)
        rendered.append(p)
    return rendered


def main():
    deck_path = Path(sys.argv[1]).resolve()
    rendered = render_deck(deck_path, Path(sys.argv[2]))
    print(f"rendered {len(rendered)} slides at {W}x{H}")


if __name__ == "__main__":
    main()
