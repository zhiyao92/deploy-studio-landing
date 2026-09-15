"""Curated Beam Learn Thai daily post generation and publishing."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date, datetime
from io import BytesIO
import json
import os
from pathlib import Path
import re
from typing import Callable, Any

from PIL import Image, ImageDraw, ImageFont, features
import requests

from .worker import execute


STREAM_ID = "beam-learn-thai"
APP_STORE_URL = "https://apps.apple.com/us/app/beam-learn-thai-speak-it/id6480093061"
ASSET_DIRS = (
    Path(__file__).parent.parent / "assets" / "beam",
    Path("/app/assets/beam"),
    Path.cwd() / "assets" / "beam",
)
THAI_TEXT_RE = re.compile(r"[\u0E00-\u0E7F]+")
SAFE_THAI_VISUAL_RE = re.compile(r"^[\u0E00-\u0E7F\s]+$")


@dataclass(frozen=True)
class BeamPost:
    slug: str
    headline: str
    thai: str
    romanization: str
    meaning: str
    explanation: str
    hashtags: tuple[str, ...]


POSTS = (
    BeamPost(
        "ordering-politely", "Order politely", "ขออันนี้ครับ", "khor an-nee khrap",
        "Could I have this one, please?", "A soft phrase for asking politely. Add khrap or kha at the end to sound more natural.",
        ("#BeamLearnThai", "#LearnThai", "#ThaiLanguage", "#ThaiCulture", "#ThaiFood", "#ThailandLife"),
    ),
    BeamPost(
        "have-you-eaten", "A warm Thai greeting", "กินข้าวแล้วหรือยัง", "gin khao laew rue yang",
        "Have you eaten yet?", "This can be genuine care, not only a question about food. Relationships matter in everyday Thai.",
        ("#BeamLearnThai", "#LearnThai", "#ThaiCulture", "#SpeakThai", "#LifeInThailand"),
    ),
    BeamPost(
        "less-spicy", "Say it at the food stall", "เผ็ดน้อยครับ", "phet noi khrap",
        "A little spicy, please.", "Useful when ordering food. Add a polite ending when you want to sound warmer.",
        ("#BeamLearnThai", "#ThaiFood", "#LearnThai", "#ThaiLanguage", "#ThailandTravel"),
    ),
    BeamPost(
        "where-are-you-going", "A friendly check-in", "ไปไหนมา", "bpai nai maa",
        "Where have you been?", "Locals may use this as a friendly greeting. It does not always require a detailed answer.",
        ("#BeamLearnThai", "#ThaiLanguage", "#ThaiCulture", "#SpeakThai", "#ThailandLife"),
    ),
    BeamPost(
        "thank-you", "More than thank you", "ขอบคุณครับ", "khop khun khrap",
        "Thank you.", "The polite ending helps match the warmth and respect of the situation.",
        ("#BeamLearnThai", "#LearnThai", "#ThaiCulture", "#ThaiLanguage", "#LifeInThailand"),
    ),
    BeamPost(
        "market-price", "Ask the market price", "อันนี้เท่าไหร่ครับ/คะ", "an-nee thao-rai khrap/kha",
        "How much is this?", "Pointing and smiling are common, but the phrase makes the interaction clearer.",
        ("#BeamLearnThai", "#ThaiFood", "#LearnThai", "#ThaiLanguage", "#ThaiMarkets"),
    ),
    BeamPost(
        "listen-to-tone", "Listen to the tone", "ฟังน้ำเสียง", "fang nam-siang",
        "Listen to the tone.", "Thai meaning comes from words, tone, relationship, and situation. Translation alone is not enough.",
        ("#BeamLearnThai", "#ThaiLanguage", "#ThaiCulture", "#SpeakThai", "#CulturalLearning"),
    ),
)


ClaudeRequest = Callable[[str], BeamPost]


def post_for_day(day: date) -> BeamPost:
    if os.getenv("ANTHROPIC_API_KEY"):
        try:
            return claude_post_for_day(day)
        except Exception as exc:
            print(json.dumps({
                "status": "beam_claude_fallback",
                "error": type(exc).__name__,
            }))
    return POSTS[(day.toordinal() - 1) % len(POSTS)]


def claude_post_for_day(day: date, *, request: Callable[..., Any] = requests.post) -> BeamPost:
    """Generate a Beam post with Claude, returning a validated BeamPost."""
    api_key = os.environ["ANTHROPIC_API_KEY"].strip()
    model = os.getenv("ANTHROPIC_MODEL", os.getenv("LLM_MODEL", "claude-haiku-4-5-20251001")).strip()
    theme = (
        "ordering food politely",
        "greeting a Thai friend naturally",
        "asking directions",
        "market and price conversations",
        "showing gratitude",
        "speaking gently in daily life",
        "understanding Thai culture through language",
    )[(day.toordinal() - 1) % 7]
    prompt = f"""Create one Instagram learning card for Beam: Learn Thai & Speak It.

Date: {day.isoformat()}
Theme: {theme}

Audience: English-speaking learners, Thailand travelers, expats, and people dating/marrying into Thai culture.
Tone: warm, useful, culturally aware, direct, and highly saveable.

Return ONLY valid JSON with this exact shape:
{{
  "slug": "short-lowercase-hyphen-slug",
  "headline": "max 32 characters",
  "thai": "Thai phrase",
  "romanization": "simple readable romanization",
  "meaning": "English meaning, max 48 characters",
  "explanation": "one practical cultural/usage note, max 80 characters",
  "hashtags": ["#BeamLearnThai", "#LearnThai", "..."]
}}

Rules:
- Optimize for follower growth through useful content, not hard app promotion.
- Pick an angle people would save, share, or send to a friend: common mistake, tourist survival phrase, polite upgrade, real-life mini-dialogue, culture note, pronunciation cue, or "say this instead".
- Use one phrase a learner could realistically say or hear in Thailand.
- Keep the Thai short enough for a single visual card.
- The `thai` field must contain Thai script and spaces only. Do not use slash, ellipsis, hyphen, parentheses, Latin letters, placeholders, or multiple alternative endings.
- Choose one natural version of the Thai phrase instead of writing alternatives like ครับ/ค่ะ.
- The `romanization` field must be the complete readable romanization. Do not use ellipses or placeholders.
- The `headline`, `meaning`, `romanization`, and `explanation` fields must be English/Latin script only.
- Only the `thai` field may contain Thai script.
- Include 8 to 12 Instagram discovery hashtags mixing broad, niche, and intent tags. Include #LearnThai plus relevant tags such as #ThaiLanguage, #ThaiPhrases, #ThailandTravel, #ThaiCulture, #SpeakThai, #ThaiForBeginners, #TravelThailand, #LanguageLearning, only when relevant.
- Keep the post family-friendly, brand-safe, and suitable for Instagram.
- Do not include profanity, politics, religion, medical/legal/financial advice, or adult content.
- Do not make unverifiable claims about Beam, Apple, App Store ranking, user counts, or app performance.
- Do not quote copyrighted learning material or copy examples from another app/book/course.
- Explain culture respectfully; do not stereotype Thai people or Thailand.
- Prefer beginner-friendly daily-life situations over obscure vocabulary.
- Keep the caption useful as a standalone learning post, not a sales pitch. If mentioning Beam, make it soft and occasional; the value of the post comes first.
- Keep visual text compact enough for a 1080px-wide social card.
- Do not mention that AI generated this."""
    response = request(
        "https://api.anthropic.com/v1/messages",
        headers={
            "x-api-key": api_key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
        },
        json={
            "model": model,
            "max_tokens": 500,
            "messages": [{"role": "user", "content": prompt}],
        },
        timeout=45,
    )
    if response.status_code >= 400:
        raise RuntimeError(f"Claude returned HTTP {response.status_code}")
    payload = response.json()
    text = next(
        block.get("text", "")
        for block in payload.get("content", [])
        if block.get("type") == "text"
    ).strip()
    if text.startswith("```"):
        text = text.strip("`").removeprefix("json").strip()
    parsed = json.loads(text)
    hashtags = tuple(str(tag).strip() for tag in parsed["hashtags"] if str(tag).strip())
    return BeamPost(
        slug=_safe_text(parsed["slug"], 48).lower().replace(" ", "-"),
        headline=_safe_latin_text(parsed["headline"], 32),
        thai=_thai_field_for_post(parsed["thai"], 60),
        romanization=_safe_latin_text(parsed["romanization"], 80),
        meaning=_safe_latin_text(parsed["meaning"], 48),
        explanation=_safe_latin_text(parsed["explanation"], 80),
        hashtags=hashtags[:7] or ("#BeamLearnThai", "#LearnThai", "#ThaiLanguage"),
    )


def _safe_text(value: object, limit: int) -> str:
    text = " ".join(str(value).split())
    if not text:
        raise ValueError("Claude returned empty Beam field")
    if len(text) <= limit:
        return text
    trimmed = text[:limit].rstrip()
    if " " in trimmed:
        trimmed = trimmed.rsplit(" ", 1)[0]
    return trimmed.rstrip(" ,.;:-")


def _safe_latin_text(value: object, limit: int) -> str:
    text = THAI_TEXT_RE.sub("", str(value))
    return _safe_text(text, limit)


def _safe_thai_text(value: object, limit: int) -> str:
    text = _safe_text(value, limit)
    text = re.sub(r"[^\u0E00-\u0E7F\s]", "", text)
    text = " ".join(text.split())
    if not text:
        raise ValueError("Claude returned Thai field without usable Thai script")
    return text


def _thai_field_for_post(value: object, limit: int) -> str:
    raw = _safe_text(value, limit)
    # Preserve unsafe raw text so the renderer can intentionally fall back to
    # romanization instead of rendering Thai-font tofu boxes or a misleading
    # stripped phrase.
    if not _is_safe_thai_visual(raw):
        return raw
    return _safe_thai_text(raw, limit)


def _is_safe_thai_visual(text: str) -> bool:
    return bool(text.strip()) and bool(SAFE_THAI_VISUAL_RE.fullmatch(text))


def _primary_phrase_for_visual(post: BeamPost) -> tuple[str, bool]:
    if os.getenv("BEAM_VISUAL_SCRIPT", "romanization").strip().lower() != "romanization":
        if _is_safe_thai_visual(post.thai):
            return post.thai, True
    return post.romanization, False


def _font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    candidates = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/System/Library/Fonts/Supplemental/Arial Unicode.ttf",
        "/System/Library/Fonts/Supplemental/Thonburi.ttc",
    ]
    layout_engine = ImageFont.Layout.RAQM if features.check("raqm") else ImageFont.Layout.BASIC
    for path in candidates:
        if Path(path).exists():
            return ImageFont.truetype(path, size, layout_engine=layout_engine)
    return ImageFont.load_default()


def _thai_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    candidates = [
        "/usr/share/fonts/truetype/noto/NotoSansThai-Bold.ttf" if bold else "/usr/share/fonts/truetype/noto/NotoSansThai-Regular.ttf",
        "/usr/share/fonts/truetype/noto/NotoSansThaiUI-Bold.ttf" if bold else "/usr/share/fonts/truetype/noto/NotoSansThaiUI-Regular.ttf",
        "/usr/share/fonts/truetype/tlwg/Garuda-Bold.ttf" if bold else "/usr/share/fonts/truetype/tlwg/Garuda.ttf",
        "/usr/share/fonts/truetype/tlwg/Loma-Bold.ttf" if bold else "/usr/share/fonts/truetype/tlwg/Loma.ttf",
        "/System/Library/Fonts/Supplemental/Thonburi.ttc",
        "/System/Library/Fonts/Supplemental/Arial Unicode.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    ]
    layout_engine = ImageFont.Layout.RAQM if features.check("raqm") else ImageFont.Layout.BASIC
    for path in candidates:
        if Path(path).exists():
            return ImageFont.truetype(path, size, layout_engine=layout_engine)
    return ImageFont.load_default()


def _wrap_to_width(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.ImageFont, max_width: int) -> str:
    lines: list[str] = []
    for paragraph in text.splitlines() or [text]:
        words = paragraph.split()
        if not words:
            lines.append("")
            continue
        current = words[0]
        for word in words[1:]:
            candidate = f"{current} {word}"
            if draw.textbbox((0, 0), candidate, font=font)[2] <= max_width:
                current = candidate
            else:
                lines.append(current)
                current = word
        lines.append(current)
    return "\n".join(lines)


def _fit_single_line_font(
    draw: ImageDraw.ImageDraw,
    text: str,
    *,
    font_factory: Callable[[int], ImageFont.ImageFont],
    start_size: int,
    min_size: int,
    max_width: int,
) -> ImageFont.ImageFont:
    for size in range(start_size, min_size - 1, -2):
        font = font_factory(size)
        if draw.textbbox((0, 0), text, font=font)[2] <= max_width:
            return font
    return font_factory(min_size)


def _rounded_icon(size: int, radius: int) -> Image.Image | None:
    icon_path = next((path / "app-icon.png" for path in ASSET_DIRS if (path / "app-icon.png").exists()), None)
    if icon_path is None:
        return None
    icon = Image.open(icon_path).convert("RGBA").resize((size, size))
    mask = Image.new("L", (size, size), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.rounded_rectangle((0, 0, size, size), radius=radius, fill=255)
    icon.putalpha(mask)
    return icon


def render(post: BeamPost) -> bytes:
    width, height = 1080, 1350
    image = Image.new("RGB", (width, height), "#f6efe0")
    draw = ImageDraw.Draw(image)
    green, yellow, ink, red = "#123d2b", "#eab32e", "#1e2923", "#c94b35"
    draw.rectangle((0, 0, width, 430), fill=green)
    draw.rectangle((0, 1240, width, height), fill=green)
    header_icon = _rounded_icon(72, 18)
    title_x = 72
    if header_icon:
        image.paste(header_icon, (72, 62), header_icon)
        title_x = 164
    draw.text((title_x, 78), "Beam: Learn Thai & Speak It", font=_font(34, True), fill="#fff8e9")
    headline_font = _fit_single_line_font(
        draw, post.headline, font_factory=lambda size: _font(size, True),
        start_size=58, min_size=42, max_width=936,
    )
    draw.text((72, 175), post.headline, font=headline_font, fill="#fff8e9")
    draw.text((72, 272), "Thai for real life", font=_font(34), fill=yellow)
    meaning_font = _font(42, True)
    draw.multiline_text(
        (72, 505), _wrap_to_width(draw, post.meaning, meaning_font, 936),
        font=meaning_font, fill=ink, spacing=10,
    )
    primary_phrase, primary_is_thai = _primary_phrase_for_visual(post)
    thai_font = _fit_single_line_font(
        draw, primary_phrase,
        font_factory=lambda size: _thai_font(size, True) if primary_is_thai else _font(size, True),
        start_size=82, min_size=58, max_width=936,
    )
    draw.text((72, 610), primary_phrase, font=thai_font, fill=green)
    draw.line((72, 735, 1008, 735), fill=yellow, width=8)
    secondary_text = post.romanization if primary_is_thai else "Romanized Thai"
    romanization_font = _fit_single_line_font(
        draw, secondary_text, font_factory=lambda size: _font(size),
        start_size=42, min_size=34, max_width=936,
    )
    draw.text((72, 785), secondary_text, font=romanization_font, fill=ink)
    explanation_font = _font(31)
    draw.multiline_text(
        (72, 900), _wrap_to_width(draw, post.explanation, explanation_font, 800),
        font=explanation_font, fill=ink, spacing=12,
    )
    draw.text((72, 1155), "Save this for your next conversation.", font=_font(29, True), fill=red)
    output = BytesIO()
    image.save(output, format="PNG", optimize=True)
    return output.getvalue()


def caption(post: BeamPost) -> str:
    return (
        f"{post.meaning}\n\n{post.thai}\n{post.romanization}\n\n"
        f"{post.explanation}\n\nSave this for your next Thai conversation.\n"
        f"{ ' '.join(post.hashtags) }"
    )


def execute_beam(*, state, publisher, storage, scheduled_for: datetime, slot: str, platform: str):
    post = post_for_day(scheduled_for.date())
    return execute(
        state=state, publisher=publisher, storage=storage, stream_id=STREAM_ID,
        scheduled_for=scheduled_for, slot=slot, platforms=[platform],
        caption=caption(post), media=render(post), content_type="image/png",
    )
