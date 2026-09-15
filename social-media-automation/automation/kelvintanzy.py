"""Kelvintanzy carousel orchestration without simulator capture."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date, datetime
import copy
import json
import os
from pathlib import Path
import tempfile
from typing import Protocol
from zoneinfo import ZoneInfo

import requests
from google.cloud import firestore

from .carousel import render_deck
from .firestore_state import FirestoreState
from .idempotency import scheduled_slot_key


DECKS_DIR = Path("/app/assets/kelvintanzy/decks")
DEFAULT_DECK_ORDER = (
    "duolingo-streak",
    "dishspin",
    "spotify-wrapped",
    "swiftui-mapstyle",
    "deploy-studio",
    "linear-mobile",
    "bondify",
    "airbnb-categories",
    "beam",
    "malaysia-pocket",
    "instantmessage",
    "provision",
    "ai-foundation-models",
    "passkeys-product-design",
)
ROTATION_EPOCH = date(2026, 9, 7)


class CarouselPublisher(Protocol):
    def publish_carousel(self, *, platform: str, caption: str, media_urls: list[str]) -> str: ...
    def publish_thread(self, *, platform: str, tweets: list[dict[str, str | None]]) -> str: ...


class MediaStorage(Protocol):
    def upload(self, *, object_name: str, content: bytes, content_type: str) -> str: ...


@dataclass(frozen=True)
class KelvintanzyOutcome:
    status: str
    run_id: str | None
    deck: str
    slides: int
    succeeded: tuple[str, ...] = ()
    failed: tuple[str, ...] = ()


@dataclass(frozen=True)
class DeliveryOutcome:
    status: str
    run_id: str | None
    states: dict[str, str]


@dataclass(frozen=True)
class StoryProfile:
    product: str
    problem: str
    struggle: str
    audience: str = "both"
    tone: str = "honest and human"
    primary_angle: str = "product"

    @classmethod
    def from_dict(cls, data: dict[str, object] | None) -> "StoryProfile":
        data = data or {}
        return cls(
            product=str(data.get("product", "")).strip(),
            problem=str(data.get("problem", "")).strip(),
            struggle=str(data.get("struggle", "")).strip(),
            audience=str(data.get("audience", "both")).strip() or "both",
            tone=str(data.get("tone", "honest and human")).strip() or "honest and human",
            primary_angle=str(data.get("primaryAngle", "product")).strip() or "product",
        )

    def headline(self) -> str:
        parts = [self.product, self.problem, self.struggle]
        return " ".join(part for part in parts if part)

    def caption_head(self, fallback: str) -> str:
        # Curated deck captions are the approved public story. Firebase profile
        # facts are a fallback only, never a replacement for that formatting.
        return fallback.strip() or self.headline()


def format_caption(value: str, platform: str) -> str:
    """Give legacy builder captions a readable hook/story/lesson structure."""
    parts = [part.strip() for part in value.split("\n\n") if part.strip()]
    if platform != "instagram" or not parts:
        return "\n\n".join(parts)
    lesson_index = next(
        (i for i, part in enumerate(parts) if part.lower().startswith("builder lesson:")),
        None,
    )
    if lesson_index is None:
        return "\n\n".join(parts)
    hashtags = parts[-1] if parts[-1].startswith("#") else ""
    end = len(parts) - 1 if hashtags else len(parts)
    story = parts[1:lesson_index]
    lesson = parts[lesson_index].split(":", 1)[1].strip()
    formatted = [parts[0]]
    if story:
        formatted.append("What changed:\n" + "\n\n".join(story))
    formatted.extend([
        "Builder lesson:\n" + lesson,
        "What would you have done differently?",
    ])
    formatted.extend(parts[lesson_index + 1:end])
    if hashtags:
        formatted.append(hashtags)
    return "\n\n".join(formatted)


def _story_profile_for(stream: dict[str, object], deck: str) -> StoryProfile:
    profiles = stream.get("storyProfiles")
    if isinstance(profiles, dict):
        profile = profiles.get(deck)
        if isinstance(profile, dict):
            return StoryProfile.from_dict(profile)
    profile = stream.get("storyProfile")
    if isinstance(profile, dict):
        return StoryProfile.from_dict(profile)
    return StoryProfile.from_dict(None)


def validate_deck(deck: dict[str, object]) -> None:
    """Reject posts that have a hook but no useful reason to save or share."""
    slides = deck.get("slides")
    captions = deck.get("captions")
    if not deck.get("angle") or not deck.get("shareValue"):
        raise ValueError("KelvinTanZY deck requires an angle and explicit share value")
    if not deck.get("lens") or not deck.get("analysisType"):
        raise ValueError("KelvinTanZY deck requires a product lens and analysis type")
    if not isinstance(slides, list) or not slides or slides[0].get("kind") not in ("hook", "single"):
        raise ValueError("KelvinTanZY deck must begin with a hook or single-image explainer")
    if deck.get("problemSolutionRequired"):
        if not deck.get("problemStatement") or not deck.get("solutionStatement"):
            raise ValueError("Technical explainers require explicit problem and solution statements")
        roles = {slide.get("role") for slide in slides if isinstance(slide, dict)}
        if not {"problem", "solution"}.issubset(roles):
            raise ValueError("Technical explainers require visible problem and solution slides")
    hook = str(slides[0].get("text", "")).strip()
    if not hook or hook.lower().startswith(("i built", "i am building", "i'm building")):
        raise ValueError("KelvinTanZY hook must create curiosity, not announce building")
    if not any(slide.get("kind") in ("utility", "single") and len(slide.get("items", [])) >= 3 for slide in slides):
        raise ValueError("KelvinTanZY deck needs a three-part saveable utility slide")
    if any(slide.get("kind") == "shot" for slide in slides):
        raise ValueError("KelvinTanZY strategy forbids uncredited app screenshots")
    reference_slides = [slide for slide in slides if slide.get("kind") == "reference"]
    for slide in reference_slides:
        if not all(slide.get(key) for key in ("image", "product", "screen", "sourceUrl")):
            raise ValueError("Reference screens require image, product, screen, and sourceUrl")
        source_url = str(slide["sourceUrl"])
        if not source_url.startswith("https://"):
            raise ValueError("Reference screen source must be an HTTPS URL")
    if any(slide.get("image") and slide.get("kind") != "reference" for slide in slides):
        raise ValueError("Images are allowed only on sourced reference-screen slides")
    if deck.get("scope") == "external":
        source = deck.get("source")
        if not isinstance(source, dict) or not all(source.get(key) for key in ("publisher", "title", "url", "published")):
            raise ValueError("External app analysis requires a dated primary source")
        if deck.get("sourceQuality") != "primary" or deck.get("reviewStatus") != "verified" or not deck.get("verifiedOn"):
            raise ValueError("External analysis requires verified primary-source metadata")
        fact_checks = deck.get("factChecks")
        if not isinstance(fact_checks, list) or not any(item.get("type") == "fact" for item in fact_checks):
            raise ValueError("External analysis requires claim-level fact checks")
        for item in fact_checks:
            if item.get("type") == "fact" and not str(item.get("sourceUrl", "")).startswith("https://"):
                raise ValueError("Each factual claim requires an HTTPS source")
    if not isinstance(captions, dict) or not captions.get("instagram"):
        raise ValueError("KelvinTanZY deck requires platform captions")
    instagram = str(captions["instagram"])
    if "?" not in instagram or "Builder lesson:" in instagram or "What changed:" in instagram:
        raise ValueError("Instagram caption needs a natural question without stock headings")
    hashtag_count = sum(1 for token in instagram.split() if token.startswith("#"))
    if not 3 <= hashtag_count <= 5 or "\n\n" not in instagram:
        raise ValueError("Instagram caption requires readable paragraphs and 3-5 focused hashtags")
    if deck.get("scope") == "external" and str(deck["source"]["url"]) not in instagram:
        raise ValueError("External app caption must include its primary source")
    for slide in slides:
        if slide.get("kind") == "single":
            if len(str(slide.get("text", "")).split()) > 12:
                raise ValueError("Single-image headline must stay at 12 words or fewer")
            if len(str(slide.get("kicker", "")).split()) > 24:
                raise ValueError("Single-image explanation must stay at 24 words or fewer")
            if any(len(str(item).split()) > 8 for item in slide.get("items", [])):
                raise ValueError("Single-image takeaways must stay at 8 words or fewer")
        if slide.get("kind") == "code":
            if not slide.get("code") or not slide.get("previews"):
                raise ValueError("Code slides require a snippet and visual previews")
            explanation = str(slide.get("explanation", "")).strip()
            if not explanation or len(explanation.split()) > 22:
                raise ValueError("Code slides require a brief explanation of 22 words or fewer")
            if not all(preview.get("image") for preview in slide.get("previews", [])):
                raise ValueError("Code slides require real result images, not abstract placeholders")
            if "swiftui" in str(deck.get("lens", "")).lower():
                if deck.get("codeOrigin") != "apple-documentation":
                    raise ValueError("SwiftUI code posts must be based on Apple documentation")
                if deck.get("codeVerification") != "swiftc-typechecked":
                    raise ValueError("SwiftUI usage examples must be compiler-verified")
                if not slide.get("sourceLabel"):
                    raise ValueError("SwiftUI code slides must identify Apple documentation")
        if slide.get("kind") == "comparison":
            if len(slide.get("options", [])) != 2:
                raise ValueError("Comparison slides require exactly two options")
        if slide.get("kind") == "example":
            if not slide.get("input") or len(slide.get("items", [])) != 4:
                raise ValueError("Concrete examples require one input and four visible results")


def claude_refine_deck(deck: dict[str, object], *, request=requests.post) -> dict[str, object]:
    """Let Claude vary the hook/question while verified teaching copy stays locked."""
    if not deck.get("claudeEditorial") or not os.getenv("ANTHROPIC_API_KEY"):
        return deck
    source = deck.get("source", {})
    brief = deck.get("editorialBrief", {})
    locked_examples = [
        {"kind": slide.get("kind"), "code": slide.get("code"), "options": slide.get("options")}
        for slide in deck.get("slides", [])
        if slide.get("kind") in ("code", "comparison")
    ]
    prompt = f"""You edit one practical SwiftUI social carousel for @KelvinTanZY.
Return JSON only with keys hook and question.

Rules:
- Do not invent APIs, availability, behavior, performance claims, or Apple guidance.
- Use only the supplied verified facts. Never modify or reproduce the locked code in your response.
- Hook: concrete curiosity, at most 90 characters, never 'I built' or vague hype.
- Question: at most 140 characters, invite an opinion about the implementation tradeoff, and end with a question mark.
- Do not add facts, availability claims, results, performance claims, hashtags, or links.
- The reviewed caption body, source, code, and visual examples remain locked outside this request.

Source: {json.dumps(source, ensure_ascii=False)}
Verified editorial brief: {json.dumps(brief, ensure_ascii=False)}
Locked examples: {json.dumps(locked_examples, ensure_ascii=False)}
"""
    response = request(
        "https://api.anthropic.com/v1/messages",
        headers={
            "x-api-key": os.environ["ANTHROPIC_API_KEY"].strip(),
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
        },
        json={
            "model": os.getenv("ANTHROPIC_MODEL", "claude-haiku-4-5-20251001"),
            "max_tokens": 250,
            "messages": [{"role": "user", "content": prompt}],
        },
        timeout=90,
    )
    if response.status_code >= 400:
        raise RuntimeError(f"Claude returned HTTP {response.status_code}")
    raw = response.json()["content"][0]["text"].strip()
    start, end = raw.find("{"), raw.rfind("}")
    if start < 0 or end < start:
        raise ValueError("Claude did not return JSON")
    editorial = json.loads(raw[start:end + 1])
    if not all(isinstance(editorial.get(key), str) and editorial[key].strip()
               for key in ("hook", "question")):
        raise ValueError("Claude returned incomplete editorial copy")
    question = editorial["question"].strip()
    if len(question) > 140 or not question.endswith("?"):
        raise ValueError("Claude question failed quality limits")
    revised = copy.deepcopy(deck)
    accepted_fields = ["question"]
    hook = editorial["hook"].strip()
    if len(hook) <= 90 and not hook.lower().startswith(("i built", "i'm building")):
        revised["slides"][0]["text"] = hook
        accepted_fields.insert(0, "hook")
    instagram_parts = [part.strip() for part in revised["captions"]["instagram"].split("\n\n")]
    instagram_parts[0] = editorial["hook"].strip()
    question_index = next((i for i, part in enumerate(instagram_parts) if part.endswith("?")), None)
    if question_index is None:
        raise ValueError("Curated caption has no replaceable discussion question")
    instagram_parts[question_index] = question
    revised["captions"]["instagram"] = "\n\n".join(instagram_parts)
    revised["_claudeFields"] = accepted_fields
    return revised


def select_deck(scheduled_for: datetime, deck_order: tuple[str, ...] = DEFAULT_DECK_ORDER) -> str:
    if not deck_order:
        raise ValueError("deck_order must not be empty")
    # The production schedule is daily. Advancing by the local calendar date
    # guarantees one new deck per day and avoids weekday-specific duplicates.
    local_day = scheduled_for.astimezone(ZoneInfo("Asia/Kuala_Lumpur")).date()
    position = (local_day - ROTATION_EPOCH).days
    return deck_order[position % len(deck_order)]


def _discussion_question(instagram_caption: str) -> str | None:
    return next(
        (part.strip() for part in instagram_caption.split("\n\n") if part.strip().endswith("?")),
        None,
    )


def _platform_caption(captions: dict[str, str], platform: str) -> str:
    value = captions.get(platform, captions.get("instagram", ""))
    if platform == "threads" and "?" not in value:
        question = _discussion_question(captions.get("instagram", ""))
        if question:
            parts = value.split("\n\n")
            source_index = next((i for i, part in enumerate(parts) if part.startswith("Source:")), len(parts))
            parts.insert(source_index, question)
            value = "\n\n".join(parts)
    return format_caption(value, platform)


def execute_kelvintanzy(
    *,
    state: FirestoreState,
    publisher: CarouselPublisher,
    storage: MediaStorage,
    scheduled_for: datetime,
    slot: str,
    platforms: list[str],
    decks_dir: Path = DECKS_DIR,
    deck_name: str | None = None,
) -> KelvintanzyOutcome:
    deck = deck_name or select_deck(scheduled_for)
    deck_path = decks_dir / f"{deck}.json"
    if not deck_path.exists():
        raise ValueError(f"unknown Kelvintanzy deck: {deck}")

    run = state.acquire_run(
        stream_id="kelvintanzy",
        scheduled_for=scheduled_for,
        slot=slot,
    )
    if not run.acquired or not run.run_id:
        return KelvintanzyOutcome("duplicate", run.run_id, deck, 0)
    state.client.collection("runs").document(run.run_id).update({
        "image": os.getenv("PUBLISHER_IMAGE", "local"),
        "dryRun": os.getenv("DRY_RUN", "true").lower() == "true",
        "captionFormatVersion": 3,
    })

    deck_config = json.loads(deck_path.read_text())
    editorial_mode = "curated"
    if deck_config.get("claudeEditorial"):
        attempts = max(1, min(2, int(os.getenv("CLAUDE_EDITORIAL_ATTEMPTS", "2"))))
        last_error: Exception | None = None
        for _ in range(attempts):
            try:
                deck_config = claude_refine_deck(deck_config)
                fields = deck_config.pop("_claudeFields", [])
                editorial_mode = "claude:" + ",".join(fields) if fields else "curated-no-key"
                last_error = None
                break
            except Exception as exc:
                last_error = exc
        if last_error is not None:
            editorial_mode = f"curated-fallback:{type(last_error).__name__}:{last_error}"
    validate_deck(deck_config)
    state.client.collection("runs").document(run.run_id).update({"editorialMode": editorial_mode})
    captions = deck_config.get("captions", {})
    stream = state.get_stream("kelvintanzy")
    story = _story_profile_for(stream, deck)
    with tempfile.TemporaryDirectory() as directory:
        rendered = render_deck(deck_path, Path(directory), deck_config)
        media_urls = [
            storage.upload(
                object_name=f"drafts/kelvintanzy/{run.run_id}/{index:02d}.png",
                content=path.read_bytes(),
                content_type="image/png",
            )
            for index, path in enumerate(rendered, 1)
        ]

    succeeded: list[str] = []
    failed: list[str] = []
    for platform in platforms:
        claim = state.acquire_publish(
            run_id=run.run_id,
            stream_id="kelvintanzy",
            platform=platform,
        )
        if not claim.acquired:
            continue
        try:
            if platform.endswith(".x"):
                external_id = publisher.publish_thread(
                    platform=platform,
                    tweets=_x_thread(
                        format_caption(story.caption_head(captions.get("x", captions.get("instagram", ""))), "x"),
                        media_urls,
                    ),
                )
            else:
                caption_key = platform.rsplit(".", 1)[-1]
                external_id = publisher.publish_carousel(
                    platform=platform,
                    caption=_platform_caption(
                        {key: story.caption_head(value) for key, value in captions.items()},
                        caption_key,
                    ),
                    media_urls=media_urls,
                )
        except Exception as exc:
            state.record_publish_result(claim, succeeded=False, error=str(exc))
            failed.append(platform)
        else:
            state.record_publish_result(
                claim, succeeded=True, external_post_id=external_id
            )
            succeeded.append(platform)

    if failed:
        state.client.collection("runs").document(run.run_id).update(
            {"status": "partial_failure", "failedPlatforms": failed, "deck": deck,
             "contentAngle": deck_config.get("angle", "builder story"),
             "publishedTargets": succeeded, "failedTargets": failed}
        )
        return KelvintanzyOutcome("partial_failure", run.run_id, deck, len(media_urls), tuple(succeeded), tuple(failed))

    state.client.collection("runs").document(run.run_id).update(
        {"deck": deck, "contentAngle": deck_config.get("angle", "builder story"),
         "publishedTargets": succeeded, "failedTargets": []}
    )
    state.seal_run(run)
    return KelvintanzyOutcome("completed", run.run_id, deck, len(media_urls), tuple(succeeded))


def reconcile_kelvintanzy_delivery(
    *, state: FirestoreState, publisher, scheduled_for: datetime,
    slot: str, platforms: list[str],
) -> DeliveryOutcome:
    """Check Buffer delivery without generating content or reposting anything."""
    key = scheduled_slot_key("kelvintanzy", scheduled_for, slot)
    lock = state.client.collection("locks").document(key).get()
    if not lock.exists:
        return DeliveryOutcome("missing_run", None, {platform: "missing" for platform in platforms})
    run_id = (lock.to_dict() or {}).get("runId")
    if not run_id:
        return DeliveryOutcome("incomplete_run", None, {platform: "missing" for platform in platforms})

    states: dict[str, str] = {}
    for platform in platforms:
        ref = state.client.collection("posts").document(f"{run_id}_{platform}")
        snap = ref.get()
        post = snap.to_dict() if snap.exists else {}
        current = str((post or {}).get("status", "missing"))
        if current == "sent":
            states[platform] = "sent"
            continue
        external_id = str((post or {}).get("externalPostId", "")).strip()
        if current == "succeeded" and external_id:
            buffer_status = publisher.get_status(external_id)
            update = {
                "bufferStatus": buffer_status,
                "deliveryCheckedAt": firestore.SERVER_TIMESTAMP,
            }
            if buffer_status == "sent":
                update["status"] = "sent"
            elif buffer_status in ("failed", "error", "notSent"):
                update["status"] = "delivery_failed"
            ref.update(update)
            states[platform] = str(update.get("status", buffer_status))
        else:
            states[platform] = current

    if all(value == "sent" for value in states.values()):
        status = "sent"
    elif any(value in ("delivery_failed", "failed", "error", "notSent") for value in states.values()):
        status = "delivery_failed"
    else:
        status = "incomplete_delivery"
    state.client.collection("runs").document(run_id).set({
        "deliveryStatus": status,
        "deliveryStates": states,
        "deliveryCheckedAt": firestore.SERVER_TIMESTAMP,
    }, merge=True)
    return DeliveryOutcome(status, str(run_id), states)


def _x_thread(head_text: str, media_urls: list[str]) -> list[dict[str, str | None]]:
    head = head_text.strip()[:275] or "Building in public, one small shipped lesson at a time."
    tweets: list[dict[str, str | None]] = [{"text": head, "image_url": None}]
    # X displays each carousel image as a reply, so replace generic “Slide N”
    # labels with short navigational context that tells readers why to swipe.
    labels = (
        "The problem.",
        "Why it matters.",
        "A practical example.",
        "A useful starting point.",
        "The trade-off.",
        "Your turn.",
    )
    for index, url in enumerate(media_urls, 1):
        label = labels[index - 1] if index <= len(labels) else f"One more useful detail ({index})."
        tweets.append({"text": label, "image_url": url})
    return tweets
