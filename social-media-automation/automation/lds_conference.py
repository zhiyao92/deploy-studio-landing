"""LDS Conferences content engine for General Conference social posts."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
from io import BytesIO
import json
import os
from typing import Any, Callable

from PIL import Image, ImageDraw, ImageFont
import requests

from .firestore_state import FirestoreState
from .worker import RunOutcome


STREAM_ID = "lds-conference"


@dataclass(frozen=True)
class ConferenceSource:
    title: str
    speaker: str
    conference: str
    session: str
    official_url: str
    transcript: str


@dataclass(frozen=True)
class ConferenceContent:
    content_type: str
    angle: str
    hook: str
    slides: tuple[str, ...]
    caption: str
    question: str
    cta: str
    visual_direction: str
    source_verification: dict[str, Any]
    reel_script: dict[str, Any] | None = None


def source_from_env() -> ConferenceSource:
    required = {
        "LDS_CONFERENCE_TALK_TITLE": os.getenv("LDS_CONFERENCE_TALK_TITLE"),
        "LDS_CONFERENCE_SPEAKER": os.getenv("LDS_CONFERENCE_SPEAKER"),
        "LDS_CONFERENCE_CONFERENCE": os.getenv("LDS_CONFERENCE_CONFERENCE"),
        "LDS_CONFERENCE_SESSION": os.getenv("LDS_CONFERENCE_SESSION"),
        "LDS_CONFERENCE_OFFICIAL_URL": os.getenv("LDS_CONFERENCE_OFFICIAL_URL"),
        "LDS_CONFERENCE_TRANSCRIPT": os.getenv("LDS_CONFERENCE_TRANSCRIPT"),
    }
    missing = [name for name, value in required.items() if not value or not value.strip()]
    if missing:
        raise RuntimeError(
            "DO_NOT_PUBLISH: missing official LDS Conference source fields: "
            + ", ".join(missing)
        )
    return ConferenceSource(
        title=required["LDS_CONFERENCE_TALK_TITLE"].strip(),
        speaker=required["LDS_CONFERENCE_SPEAKER"].strip(),
        conference=required["LDS_CONFERENCE_CONFERENCE"].strip(),
        session=required["LDS_CONFERENCE_SESSION"].strip(),
        official_url=required["LDS_CONFERENCE_OFFICIAL_URL"].strip(),
        transcript=required["LDS_CONFERENCE_TRANSCRIPT"].strip(),
    )


def generate_content(source: ConferenceSource, *, request: Callable[..., Any] = requests.post) -> ConferenceContent:
    api_key = os.environ["ANTHROPIC_API_KEY"].strip()
    model = os.getenv("ANTHROPIC_MODEL", "claude-haiku-4-5-20251001").strip()
    response = request(
        "https://api.anthropic.com/v1/messages",
        headers={
            "x-api-key": api_key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
        },
        json={
            "model": model,
            "max_tokens": 1600,
            "messages": [{"role": "user", "content": _prompt(source)}],
        },
        timeout=60,
    )
    if response.status_code >= 400:
        raise RuntimeError(f"Claude returned HTTP {response.status_code}")
    text = next(
        block.get("text", "")
        for block in response.json().get("content", [])
        if block.get("type") == "text"
    ).strip()
    if text.startswith("```"):
        text = text.strip("`").removeprefix("json").strip()
    parsed = json.loads(text)
    verification = parsed.get("source_verification", {})
    if not _verification_passed(verification):
        raise RuntimeError(f"DO_NOT_PUBLISH: source verification failed: {verification}")
    slides = tuple(_safe_slide_text(slide) for slide in parsed.get("slides", []) if str(slide).strip())
    if not slides:
        raise RuntimeError("DO_NOT_PUBLISH: Claude returned no slide content")
    return ConferenceContent(
        content_type=_safe_text(parsed.get("content_type", "Carousel"), 40),
        angle=_safe_text(parsed.get("content_angle", ""), 240),
        hook=_safe_text(parsed.get("hook", slides[0]), 120),
        slides=slides[:8],
        caption=_format_caption(_safe_text(parsed.get("caption", ""), 2200), source),
        question=_safe_text(parsed.get("discussion_reflection_question", ""), 240),
        cta=_safe_text(parsed.get("cta", "None"), 120),
        visual_direction=_safe_text(parsed.get("visual_direction", ""), 240),
        source_verification=verification,
        reel_script=_normalize_reel_script(parsed.get("reel_script")),
    )


def _prompt(source: ConferenceSource) -> str:
    desired_format = os.getenv("LDS_CONFERENCE_CONTENT_FORMAT", "").strip().lower()
    format_instruction = (
        "For this run, choose CONTENT TYPE: Reel Script. Return a complete reel_script object. "
        "Do not optimize this output for carousel publishing."
        if desired_format == "reel-script"
        else "Choose the strongest content type based on the supplied talk."
    )
    return f"""You are the AI content strategist and social media editor for LDS Conferences, an app that helps people discover, watch, revisit, save, and engage with General Conference messages from The Church of Jesus Christ of Latter-day Saints.

Your workflow is: Read -> Understand -> Identify -> Decide -> Create -> Verify.

FORMAT DIRECTION:
{format_instruction}

SOURCE OF TRUTH:
Use only the supplied official General Conference source below. Claude is the editorial layer, not the source of truth. Never invent quotations, doctrine, speaker statements, stories, statistics, scriptures, dates, titles, or context.

OFFICIAL SOURCE METADATA:
Talk: {source.title}
Speaker: {source.speaker}
Conference: {source.conference}
Session: {source.session}
Official URL: {source.official_url}

OFFICIAL TRANSCRIPT:
{source.transcript}

EDITORIAL RULES:
- Read and understand the entire supplied talk before writing.
- Identify central message, supporting ideas, human problem, spiritual principle, application, memorable moments, and emotional tone.
- Choose the best social format for this talk. Do not force a rigid rotation.
- Optimize for follower growth through thoughtful, useful, source-verified Conference content, not hard app promotion.
- Create posts people would save for study, share with a friend, or use for a Sunday lesson/reflection.
- App promotion should be rare, occasional, and soft; LDS Conferences does not need to appear in every post.
- Avoid generic filler, corporate language, and manipulative clickbait.
- Never use hooks like "The Church doesn't want you to forget this" or "Most members don't know this."
- Do not exaggerate Church teachings for engagement.
- If using quotation marks, exact wording must match the supplied transcript.
- Never make an AI-generated summary look like a quotation from a Church leader.
- Clearly separate speaker statements from original reflection/application.
- Keep carousel slide text concise enough for Instagram: 3 to 10 words per slide, maximum 70 characters per slide.
- Visual style should feel like a modern Malaysian Christian creator post: direct, clean, human, practical, and easy to understand at a glance.
- Slide 1 must be a short hook, not a paragraph.
- Each slide must be one direct thought. No long sentences. No semicolons. No academic wording.
- Avoid "Elder X teaches..." phrasing on slides unless attribution is needed. Make the insight feel immediate.
- Do not put full paragraphs on slides. Put nuance in the caption instead.
- Prefer 5 to 7 slides.
- Slide copy examples of the desired length:
  "Too many worries?"
  "Not everything deserves equal weight."
  "Focus changes what feels heavy."
  "Jesus Christ brings clarity."
  "What needs less of your attention today?"
- Add relevant Instagram discovery hashtags in the caption. Use a natural mix of broad and niche tags such as #GeneralConference, #LDSConference, #ChurchOfJesusChrist, #ComeUntoChrist, #LatterDaySaints, #ChristianInspiration, #FaithInChrist, #JesusChrist, #SpiritualReflection, #ConferenceStudy, but only when relevant. Do not overstuff; use about 8 to 14 hashtags.
- Prefer content angles with clear utility: "one idea to remember", "a question for study", "what this talk helps with", "a principle for a hard week", "save this for Come Follow Me", or "short study notes".
- Caption format must be clean and readable:
  1. Short hook line
  2. Blank line
  3. 2 to 4 short value lines
  4. Blank line
  5. "Source: [Talk] — [Speaker], [Conference]"
  6. Blank line
  7. One reflection question
  8. Blank line
  9. Hashtags
- If asked for Reel content, generate a 20 to 35 second Reel script first. Keep it human, direct, and easy to film.
- Reel scripts must include timestamps, on-screen text, voiceover, B-roll/visual notes, caption, hashtags, and source verification.
- Reel on-screen text should be even shorter than carousel slides: 3 to 8 words per scene.
- Reel voiceover should sound conversational, like a thoughtful Malaysian Christian creator speaking clearly, not like a sermon summary.

Return ONLY valid JSON:
{{
  "content_type": "Carousel / Reflection / Discussion / Quote + Context / etc.",
  "content_angle": "one sentence explaining why this angle was selected",
  "hook": "final hook",
  "slides": ["short slide 1 text, max 70 characters", "short slide 2 text, max 70 characters"],
  "caption": "properly formatted Instagram caption with line breaks and discovery hashtags",
  "discussion_reflection_question": "question",
  "cta": "CTA or None",
  "visual_direction": "simple visual direction",
  "reel_script": {{
    "duration_seconds": 30,
    "scenes": [
      {{
        "time": "0-3s",
        "on_screen_text": "short overlay",
        "voiceover": "spoken line",
        "visual": "simple filming or motion direction"
      }}
    ],
    "voiceover_full": "complete voiceover script",
    "editing_notes": "music, pacing, cuts, subtitles"
  }},
  "source_verification": {{
    "talk_title_verified": true,
    "speaker_verified": true,
    "conference_verified": true,
    "direct_quotes_used": false,
    "direct_quotes": [],
    "ai_interpretations_clearly_separated": true,
    "do_not_publish": false
  }}
}}

If any important information cannot be verified, set do_not_publish true and explain why in caption."""


def _verification_passed(verification: dict[str, Any]) -> bool:
    return (
        verification.get("talk_title_verified") is True
        and verification.get("speaker_verified") is True
        and verification.get("conference_verified") is True
        and verification.get("ai_interpretations_clearly_separated") is True
        and verification.get("do_not_publish") is not True
    )


def _safe_text(value: object, limit: int) -> str:
    text = " ".join(str(value or "").split())
    if len(text) <= limit:
        return text
    trimmed = text[:limit].rstrip()
    if " " in trimmed:
        trimmed = trimmed.rsplit(" ", 1)[0]
    return trimmed.rstrip(" ,.;:-")


def _safe_slide_text(value: object) -> str:
    text = _safe_text(value, 70)
    words = text.split()
    if len(words) <= 12:
        return text
    return " ".join(words[:12]).rstrip(" ,.;:-")


def _normalize_reel_script(value: object) -> dict[str, Any] | None:
    if not isinstance(value, dict):
        return None
    scenes = []
    for scene in value.get("scenes", []):
        if not isinstance(scene, dict):
            continue
        scenes.append({
            "time": _safe_text(scene.get("time", ""), 20),
            "on_screen_text": _safe_text(scene.get("on_screen_text", ""), 50),
            "voiceover": _safe_text(scene.get("voiceover", ""), 220),
            "visual": _safe_text(scene.get("visual", ""), 180),
        })
    return {
        "duration_seconds": int(value.get("duration_seconds", 30) or 30),
        "scenes": scenes[:8],
        "voiceover_full": _safe_text(value.get("voiceover_full", ""), 1200),
        "editing_notes": _safe_text(value.get("editing_notes", ""), 400),
    }


def _format_caption(caption: str, source: ConferenceSource) -> str:
    caption = caption.replace("\\n", "\n")
    hashtags = [part for part in caption.split() if part.startswith("#")]
    body = " ".join(part for part in caption.split() if not part.startswith("#")).strip()
    body = body.replace(" Source:", "\n\nSource:")
    body = body.replace(" Reflection:", "\n\nReflection:")
    if "Source:" not in body:
        body = f"{body}\n\nSource: {source.title} — {source.speaker}, {source.conference}".strip()
    if "?" in body and "Reflection:" not in body:
        before, question = body.rsplit("?", 1)
        body = f"{before.strip()}?\n\nReflection:{question.strip()}"
    if not hashtags:
        hashtags = [
            "#GeneralConference",
            "#LDSConference",
            "#ChurchOfJesusChrist",
            "#ComeUntoChrist",
            "#LatterDaySaints",
            "#ChristianInspiration",
            "#FaithInChrist",
            "#JesusChrist",
            "#SpiritualReflection",
            "#ConferenceStudy",
        ]
    return f"{body}\n\n{' '.join(hashtags[:14])}".strip()


def _font(size: int, bold: bool = False) -> ImageFont.ImageFont:
    candidates = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/noto/NotoSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/noto/NotoSans-Regular.ttf",
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf" if bold else "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/System/Library/Fonts/Supplemental/Avenir Next Bold.ttf" if bold else "/System/Library/Fonts/Supplemental/Avenir Next.ttc",
    ]
    for path in candidates:
        try:
            return ImageFont.truetype(path, size)
        except OSError:
            continue
    return ImageFont.load_default()


def _wrap(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.ImageFont, max_width: int) -> str:
    lines: list[str] = []
    for paragraph in str(text).splitlines() or [str(text)]:
        current = ""
        for word in paragraph.split():
            candidate = word if not current else f"{current} {word}"
            if draw.textbbox((0, 0), candidate, font=font)[2] <= max_width:
                current = candidate
            else:
                if current:
                    lines.append(current)
                current = word
        if current:
            lines.append(current)
    return "\n".join(lines)


def render_slide(text: str, *, slide_number: int, total_slides: int) -> bytes:
    width, height = 1080, 1350
    cream, navy, gold, ink = "#f7f0df", "#18364a", "#d2a73f", "#1d2730"
    image = Image.new("RGB", (width, height), cream)
    draw = ImageDraw.Draw(image)
    draw.rectangle((0, 0, width, 250), fill=navy)
    draw.rectangle((0, 1240, width, height), fill=navy)
    draw.text((72, 80), "LDS Conferences", font=_font(40, True), fill=cream)
    draw.text((870, 82), f"{slide_number}/{total_slides}", font=_font(34, True), fill=gold)
    draw.text((72, 155), "General Conference, made simple", font=_font(30), fill="#ead99f")
    draw.rectangle((72, 330, 1008, 340), fill=gold)
    font = _fit_font(draw, text, bold=False, start_size=80 if slide_number == 1 else 68)
    draw.multiline_text((72, 455), _wrap(draw, text, font, 900), font=font, fill=ink, spacing=22)
    draw.text((72, 1160), "Save this for Conference study", font=_font(30, True), fill=gold)
    output = BytesIO()
    image.save(output, format="PNG", optimize=True)
    return output.getvalue()


def _fit_font(draw: ImageDraw.ImageDraw, text: str, *, bold: bool, start_size: int) -> ImageFont.ImageFont:
    max_height = 520
    for size in range(start_size, 29, -2):
        font = _font(size, bold)
        wrapped = _wrap(draw, text, font, 900)
        bbox = draw.multiline_textbbox((72, 390), wrapped, font=font, spacing=18)
        if bbox[3] - bbox[1] <= max_height:
            return font
    return _font(30, bold)


def execute_lds_conference(*, state: FirestoreState, publisher, storage, scheduled_for: datetime, slot: str, platform: str):
    source = source_from_env()
    content = generate_content(source)
    run = state.acquire_run(stream_id=STREAM_ID, scheduled_for=scheduled_for, slot=slot)
    if not run.acquired or not run.run_id:
        return RunOutcome("duplicate", run.run_id)

    if os.getenv("LDS_CONFERENCE_CONTENT_FORMAT", "").lower() == "reel-script":
        state.client.collection("runs").document(run.run_id).set(
            _run_content_payload(source, content) | {
                "completedAt": datetime.now(timezone.utc),
                "status": "script_generated",
            },
            merge=True,
        )
        state.seal_run(run)
        print(json.dumps({
            "status": "script_generated",
            "runId": run.run_id,
            "contentType": content.content_type,
            "reelScript": content.reel_script,
            "caption": content.caption,
        }))
        return RunOutcome("script_generated", run.run_id)

    media_urls = []
    for index, slide in enumerate(content.slides, start=1):
        media_urls.append(storage.upload(
            object_name=f"drafts/{STREAM_ID}/{run.run_id}/slide-{index}.png",
            content=render_slide(slide, slide_number=index, total_slides=len(content.slides)),
            content_type="image/png",
        ))

    claim = state.acquire_publish(run_id=run.run_id, stream_id=STREAM_ID, platform=platform)
    if claim.acquired:
        try:
            if hasattr(publisher, "publish_carousel") and len(media_urls) > 1:
                external_id = publisher.publish_carousel(platform=platform, caption=content.caption, media_urls=media_urls)
            else:
                external_id = publisher.publish(platform=platform, caption=content.caption, media_url=media_urls[0])
        except Exception as exc:
            state.record_publish_result(claim, succeeded=False, error=str(exc))
            state.client.collection("runs").document(run.run_id).update(
                {"status": "partial_failure", "failedPlatforms": [platform]}
            )
            return RunOutcome("partial_failure", run.run_id, failed=(platform,))
        state.record_publish_result(claim, succeeded=True, external_post_id=external_id)

    state.client.collection("runs").document(run.run_id).set(
        _run_content_payload(source, content) | {
            "completedAt": datetime.now(timezone.utc),
            "status": "completed",
        },
        merge=True,
    )
    state.seal_run(run)
    return RunOutcome("completed", run.run_id, succeeded=(platform,))


def _run_content_payload(source: ConferenceSource, content: ConferenceContent) -> dict[str, Any]:
    return {
        "contentType": content.content_type,
        "contentAngle": content.angle,
        "source": {
            "talk": source.title,
            "speaker": source.speaker,
            "conference": source.conference,
            "session": source.session,
            "officialUrl": source.official_url,
        },
        "sourceVerification": content.source_verification,
        "caption": content.caption,
        "slides": list(content.slides),
        "slideCount": len(content.slides),
        "reelScript": content.reel_script,
    }
