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
ART_DIRECTIONS = {
    "ai": "A friendly robot head and three connected idea cards",
    "airbnb": "A traveler choosing between distinct stay cards",
    "beam": "A learner speaking with a friendly language partner",
    "bondify": "Two people exchanging thoughtful chat bubbles",
    "deploy-studio": "A builder checking a release on a phone away from a desk",
    "dishspin": "A playful dinner choice wheel with a decisive pointer",
    "duolingo": "A learner moving through a small streak calendar",
    "instantmessage": "A conversation turning into a clear success signal",
    "linear-liquid-glass": "A layered interface card with a focused action",
    "linear-mobile": "A compact mobile task board beside a laptop workflow",
    "malaysia-pocket": "A person following a route to a nearby help point",
    "passkeys": "A person unlocking a shield with a device passkey",
    "provision": "A secure identity moving safely between two devices",
    "spotify": "A listener turning personal listening into a shareable story",
    "swiftui-mapstyle": "A map screen with a route and two distinct map layers",
}
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


def _person(d, x, y, scale=1.0, shirt=(255, 147, 92), skin=(246, 194, 157)):
    """Small friendly editorial character, drawn as original vector art."""
    r = lambda n: int(n * scale)
    d.ellipse((x + r(27), y, x + r(93), y + r(66)), fill=skin)
    d.pieslice((x + r(23), y - r(7), x + r(97), y + r(53)), 180, 360, fill=(48, 43, 62))
    d.ellipse((x + r(45), y + r(28), x + r(51), y + r(34)), fill=(35, 38, 49))
    d.ellipse((x + r(70), y + r(28), x + r(76), y + r(34)), fill=(35, 38, 49))
    d.arc((x + r(49), y + r(37), x + r(73), y + r(54)), 5, 165, fill=(165, 78, 72), width=r(3))
    d.rounded_rectangle((x + r(15), y + r(70), x + r(105), y + r(190)), radius=r(28), fill=shirt)
    d.line((x + r(24), y + r(103), x - r(5), y + r(158)), fill=skin, width=r(15))
    d.line((x + r(95), y + r(105), x + r(130), y + r(145)), fill=skin, width=r(15))
    d.line((x + r(43), y + r(181), x + r(35), y + r(241)), fill=(47, 60, 91), width=r(17))
    d.line((x + r(77), y + r(181), x + r(88), y + r(241)), fill=(47, 60, 91), width=r(17))
    d.line((x + r(35), y + r(241), x + r(17), y + r(247)), fill=(42, 47, 60), width=r(12))
    d.line((x + r(88), y + r(241), x + r(108), y + r(247)), fill=(42, 47, 60), width=r(12))


def _phone(d, x, y, w, h, *, accent=(255, 147, 92), mode="cards"):
    """Draw an original, rounded phone UI that can illustrate a post concept."""
    radius = max(18, w // 12)
    d.rounded_rectangle((x + 8, y + 10, x + w + 8, y + h + 10), radius=radius,
                        fill=(219, 222, 227))
    d.rounded_rectangle((x, y, x + w, y + h), radius=radius,
                        fill=(40, 43, 55), outline=(25, 28, 38), width=3)
    inset = max(9, w // 18)
    d.rounded_rectangle((x + inset, y + inset, x + w - inset, y + h - inset),
                        radius=max(12, radius - 6), fill=(255, 253, 248))
    d.rounded_rectangle((x + w // 3, y + inset + 2, x + 2 * w // 3, y + inset + 8),
                        radius=5, fill=(40, 43, 55))
    left, right = x + inset + 10, x + w - inset - 10
    top = y + inset + 24
    if mode == "map":
        d.rounded_rectangle((left, top, right, y + h * 3 // 4), radius=12, fill=(222, 236, 224))
        for j in range(4):
            yy = top + 22 + j * (h // 8)
            d.line((left + 3, yy, right - 2, yy - 13), fill=(190, 210, 196), width=4)
        d.line((left + 16, top + 40, left + w // 5, top + h // 2,
                left + w * 2 // 5, top + h // 3), fill=accent, width=6)
        d.ellipse((left + w * 2 // 5 - 8, top + h // 3 - 8,
                   left + w * 2 // 5 + 8, top + h // 3 + 8), fill=accent)
    else:
        d.rounded_rectangle((left, top, right, top + h // 5), radius=10,
                            fill=tuple(min(255, c + 90) for c in accent))
        d.rounded_rectangle((left, top + h // 5 + 12, right, top + h // 3), radius=9,
                            fill=(234, 236, 241))
        d.rounded_rectangle((left, top + h // 3 + 22, right, top + h // 2), radius=9,
                            fill=(234, 236, 241))
        if mode == "check":
            d.ellipse((x + w // 2 - w // 8, y + h * 2 // 3, x + w // 2 + w // 8,
                       y + h * 2 // 3 + w // 4), fill=(208, 239, 218))
            d.line((x + w // 2 - 9, y + h * 2 // 3 + 10, x + w // 2 - 1,
                    y + h * 2 // 3 + 18, x + w // 2 + 15, y + h * 2 // 3 + 1),
                   fill=(47, 139, 91), width=5)
        elif mode == "chat":
            d.rounded_rectangle((left, top + h * 3 // 5, x + w * 2 // 3,
                                 top + h * 3 // 5 + 24), radius=10, fill=(222, 232, 249))
            d.rounded_rectangle((x + w // 3, top + h * 3 // 5 + 31, right,
                                 top + h * 3 // 5 + 55), radius=10, fill=tuple(min(255, c + 70) for c in accent))


def draw_hero_illustration(img, direction: str, deck_key: str) -> None:
    """Draw a topic-specific, reusable illustration on each post cover."""
    d = ImageDraw.Draw(img)
    left, top, right, bottom = PAD, 625, W - PAD, H - 132
    # Warm editorial stage, with an offset sun and a soft grounding shadow.
    palette = {
        "security": ((230, 239, 232), (94, 162, 127)),
        "map": ((228, 239, 229), (96, 157, 119)),
        "conversation": ((241, 232, 246), (157, 117, 180)),
        "ai": ((232, 234, 249), (115, 119, 194)),
        "habit": ((250, 237, 218), (230, 157, 74)),
        "choice": ((250, 232, 220), (235, 131, 91)),
        "workflow": ((231, 239, 247), (93, 143, 191)),
        "product": ((246, 235, 224), (225, 143, 96)),
    }
    if deck_key in ("passkeys", "provision"):
        theme = "security"
    elif deck_key in ("swiftui-mapstyle", "malaysia-pocket"):
        theme = "map"
    elif deck_key in ("beam", "bondify", "instantmessage"):
        theme = "conversation"
    elif deck_key == "ai":
        theme = "ai"
    elif deck_key == "duolingo":
        theme = "habit"
    elif deck_key == "dishspin":
        theme = "choice"
    elif deck_key in ("deploy-studio", "linear-mobile"):
        theme = "workflow"
    else:
        theme = "product"
    panel, accent = palette[theme]
    d.rounded_rectangle((left, top, right, bottom), radius=42, fill=panel)
    d.ellipse((right - 220, top + 25, right - 45, top + 200), fill=tuple(min(255, c + 18) for c in panel))
    d.ellipse((left + 44, bottom - 126, right - 44, bottom - 72), fill=(216, 219, 222))

    if deck_key in ("swiftui-mapstyle", "malaysia-pocket"):
        _phone(d, 385, 675, 250, 425, accent=accent, mode="map")
        d.ellipse((270, 745, 335, 810), fill=(249, 205, 104))
        d.ellipse((740, 990, 806, 1056), fill=(249, 205, 104))
        d.line((300, 780, 420, 846, 525, 756, 730, 1020), fill=accent, width=7)
        d.ellipse((714, 1004, 746, 1036), fill=(255, 255, 255))
    elif theme == "security":
        _person(d, 245, 805, .95, shirt=(116, 174, 139))
        _phone(d, 585, 710, 222, 380, accent=accent, mode="check")
        d.polygon(((700, 710), (786, 744), (779, 839), (744, 889), (700, 916),
                   (656, 889), (621, 839), (614, 744)), fill=(255, 255, 255), outline=accent)
        d.line((670, 810, 695, 834, 740, 780), fill=accent, width=11)
    elif theme == "conversation":
        _person(d, 205, 820, .75, shirt=(124, 166, 221))
        _person(d, 710, 820, .75, shirt=(232, 155, 112))
        d.rounded_rectangle((340, 720, 630, 840), radius=35, fill=(255, 255, 255))
        d.polygon(((390, 830), (420, 830), (392, 868)), fill=(255, 255, 255))
        d.rounded_rectangle((380, 870, 665, 990), radius=35, fill=tuple(min(255, c + 55) for c in accent))
        for x in (390, 430, 470):
            d.ellipse((x, 765, x + 18, 783), fill=accent)
        for x in (435, 475, 515):
            d.ellipse((x, 915, x + 18, 933), fill=(255, 255, 255))
        if deck_key == "bondify":
            d.polygon(((565, 790), (548, 773), (530, 773), (518, 787), (518, 804),
                       (565, 844), (612, 804), (612, 787), (600, 773), (582, 773)),
                      fill=(239, 116, 128))
        elif deck_key == "beam":
            for i, letter_color in enumerate(((224, 161, 78), (106, 157, 201), (142, 177, 130))):
                x = 530 + i * 38
                d.rounded_rectangle((x, 770, x + 27, 807), radius=7, fill=letter_color)
                d.ellipse((x + 9, 783, x + 17, 791), fill=(255, 255, 255))
        elif deck_key == "instantmessage":
            d.line((555, 1010, 590, 965, 625, 978, 665, 914), fill=accent, width=7)
            for x, y in ((555, 1010), (590, 965), (625, 978), (665, 914)):
                d.ellipse((x - 8, y - 8, x + 8, y + 8), fill=(255, 255, 255), outline=accent, width=3)
    elif theme == "ai":
        _person(d, 235, 820, .75, shirt=(140, 143, 212))
        d.rounded_rectangle((470, 760, 765, 1030), radius=54, fill=(255, 255, 255), outline=accent, width=5)
        d.rounded_rectangle((550, 840, 685, 970), radius=35, fill=(233, 234, 250))
        d.ellipse((584, 876, 604, 896), fill=accent)
        d.ellipse((628, 876, 648, 896), fill=accent)
        d.arc((588, 899, 644, 944), 5, 170, fill=accent, width=7)
        for x, y in ((435, 735), (782, 730), (740, 1060), (430, 1060)):
            d.line((x - 18, y, x + 18, y), fill=(245, 168, 91), width=6)
            d.line((x, y - 18, x, y + 18), fill=(245, 168, 91), width=6)
    elif deck_key == "dishspin":
        cx, cy, rad = 575, 895, 205
        colors = (accent, (250, 190, 121), (250, 218, 153), (240, 164, 142))
        for i, color in enumerate(colors):
            d.pieslice((cx - rad, cy - rad, cx + rad, cy + rad), i * 90, (i + 1) * 90,
                       fill=color, outline=(255, 255, 255), width=5)
        d.ellipse((cx - 48, cy - 48, cx + 48, cy + 48), fill=(255, 255, 255))
        d.polygon(((cx, cy - rad - 22), (cx - 27, cy - rad + 27), (cx + 27, cy - rad + 27)), fill=(49, 55, 70))
        _person(d, 225, 835, .65, shirt=(129, 177, 142))
    elif theme == "habit":
        _person(d, 225, 835, .75, shirt=(239, 164, 88))
        d.rounded_rectangle((475, 720, 800, 1050), radius=34, fill=(255, 255, 255))
        for row in range(3):
            for col in range(4):
                x, y = 515 + col * 65, 770 + row * 76
                d.rounded_rectangle((x, y, x + 44, y + 46), radius=12,
                                    fill=accent if (row * 4 + col) < 8 else (234, 237, 241))
        d.polygon(((360, 760), (379, 799), (422, 805), (390, 835), (399, 880),
                   (360, 859), (321, 880), (330, 835), (298, 805), (341, 799)), fill=(245, 174, 76))
    elif deck_key == "airbnb":
        _person(d, 165, 830, .72, shirt=(104, 157, 190))
        for x, y, color in ((395, 760, (238, 185, 133)), (580, 820, (155, 187, 160)),
                            (730, 730, (192, 169, 206))):
            d.rounded_rectangle((x, y, x + 185, y + 235), radius=24, fill=(255, 255, 255))
            d.rounded_rectangle((x + 16, y + 16, x + 169, y + 118), radius=18, fill=color)
            d.polygon(((x + 51, y + 96), (x + 91, y + 55), (x + 137, y + 96)), fill=(255, 255, 255))
            d.rectangle((x + 65, y + 91, x + 122, y + 118), fill=(255, 255, 255))
            d.line((x + 26, y + 153, x + 157, y + 153), fill=(221, 224, 229), width=7)
            d.line((x + 26, y + 178, x + 116, y + 178), fill=(233, 235, 239), width=7)
    elif deck_key == "spotify":
        _person(d, 180, 835, .72, shirt=(153, 136, 202))
        d.ellipse((480, 745, 750, 1015), fill=(44, 46, 60))
        d.ellipse((566, 831, 664, 929), fill=panel)
        for i, width in enumerate((155, 180, 130)):
            d.arc((520, 785 + i * 28, 720, 935 + i * 28), 210, 320,
                  fill=(249, 191, 87), width=12)
        d.rounded_rectangle((700, 715, 815, 850), radius=20, fill=(255, 255, 255))
        for i, height in enumerate((38, 70, 52, 93)):
            x = 720 + i * 21
            d.rounded_rectangle((x, 823 - height, x + 12, 823), radius=5, fill=accent)
    elif deck_key == "linear-liquid-glass":
        _person(d, 170, 840, .7, shirt=(163, 135, 193))
        d.rounded_rectangle((435, 720, 805, 1030), radius=34, fill=(255, 255, 255))
        d.rounded_rectangle((470, 760, 770, 842), radius=24, fill=(231, 237, 246))
        d.rounded_rectangle((495, 820, 790, 905), radius=24, fill=(244, 229, 214))
        d.rounded_rectangle((455, 888, 750, 975), radius=24, fill=(221, 237, 226))
        d.ellipse((737, 941, 783, 987), fill=accent)
        d.line((750, 964, 765, 978), fill=(255, 255, 255), width=5)
        d.line((765, 978, 777, 954), fill=(255, 255, 255), width=5)
    else:
        # Product/workflow scenes use two tiny interfaces and a clear transformation cue.
        _phone(d, 265, 710, 220, 390, accent=accent, mode="cards")
        _phone(d, 590, 710, 220, 390, accent=accent, mode="check")
        d.line((493, 895, 562, 895), fill=accent, width=9)
        d.polygon(((565, 895), (539, 877), (539, 913)), fill=accent)
        _person(d, 92, 850, .52, shirt=(234, 162, 118))

    # A small floating spark softens the systems diagram into a friendly editorial scene.
    d.ellipse((right - 142, top + 72, right - 103, top + 111), fill=(255, 207, 115))


def render(slide, handle, deck_dir, deck_key=""):
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)
    maxw = W - PAD * 2
    kind = slide["kind"]

    if kind == "hook":
        default_labels = {
            "ai": "AI, IN PRACTICE", "airbnb": "PRODUCT BREAKDOWN",
            "beam": "LANGUAGE LEARNING", "bondify": "RELATIONSHIP DESIGN",
            "deploy-studio": "BUILDER FIELD NOTE", "dishspin": "PRODUCT FOCUS",
            "duolingo": "GROWTH MECHANIC", "instantmessage": "PRODUCT METRICS",
            "linear-liquid-glass": "INTERFACE DESIGN", "linear-mobile": "TECH CHOICE",
            "malaysia-pocket": "HIGH-STRESS UX", "passkeys": "SECURITY, EXPLAINED",
            "provision": "IDENTITY SYSTEMS", "spotify": "SHARING BEHAVIOR",
            "swiftui-mapstyle": "SWIFTUI FIELD NOTE",
        }
        eyebrow = slide.get("eyebrow", default_labels.get(deck_key, "BUILDER FIELD NOTE"))
        d.rounded_rectangle((PAD, 102, PAD + 370, 154), radius=24, fill=(255, 232, 218))
        d.text((PAD + 18, 111), eyebrow.upper(), font=f(23), fill=STRIKE)
        font = f(67)
        lines = wrap(d, slide["text"], font, maxw)
        draw_block(d, slide["text"], font, 195, INK, 78, maxw)
        draw_hero_illustration(img, ART_DIRECTIONS.get(deck_key, "A curious builder exploring an idea"), deck_key)
        d = ImageDraw.Draw(img)

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
        render(slide, deck.get("handle", "@KelvinTanZY"), deck_path.parent,
               str(deck.get("illustration", deck_path.stem))).save(p)
        rendered.append(p)
    return rendered


def main():
    deck_path = Path(sys.argv[1]).resolve()
    rendered = render_deck(deck_path, Path(sys.argv[2]))
    print(f"rendered {len(rendered)} slides at {W}x{H}")


if __name__ == "__main__":
    main()
