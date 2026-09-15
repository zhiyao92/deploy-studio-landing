"""Cloud Run Job entry point. Live mode stays locked until cutover approval."""

from __future__ import annotations

from datetime import datetime, timezone
import json
import os
from zoneinfo import ZoneInfo

from google.cloud import firestore

from .adapters import DryRunPublisher, DryRunStorage, FirebaseStorage, GitHubStorage
from .buffer import BufferPublisher, BufferTarget
from .beam import execute_beam
from .firestore_state import FirestoreState
from .kelvintanzy import execute_kelvintanzy, reconcile_kelvintanzy_delivery
from .lds_conference import execute_lds_conference
from .slack import send_bot_dry_run_status, send_dry_run_status
from .worker import execute


def main() -> None:
    try:
        _main()
    except Exception as exc:
        _send_unhandled_error_status(exc)
        raise


def _main() -> None:
    dry_run = os.getenv("DRY_RUN", "true").lower() == "true"
    project = os.environ["FIREBASE_PROJECT_ID"]
    scheduled = _scheduled_for()
    targets = [item.strip() for item in os.environ["PUBLISH_TARGETS"].split(",") if item.strip()]
    publisher = _publisher(dry_run)
    storage = _storage(dry_run)
    if os.environ["STREAM_ID"] == "kelvintanzy":
        state = FirestoreState(firestore.Client(project=project))
        if os.getenv("KELVINTANZY_RECONCILE_ONLY", "false").lower() == "true":
            outcome = reconcile_kelvintanzy_delivery(
                state=state, publisher=publisher, scheduled_for=scheduled,
                slot=os.getenv("SLOT", "morning"), platforms=targets,
            )
            _send_status(
                stream="kelvintanzy", deck="daily-delivery-check",
                status=outcome.status, slides=0, targets=targets,
                run_id=outcome.run_id, dry_run=False,
            )
            print(json.dumps({
                "status": outcome.status, "runId": outcome.run_id,
                "deliveryStates": outcome.states,
            }))
            return
        stream = state.get_stream("kelvintanzy")
        if not dry_run and (not stream.get("enabled") or not stream.get("autoPublish")):
            _send_status(
                stream="kelvintanzy", deck=os.getenv("KELVINTANZY_DECK", "rotation"),
                status="paused", slides=0, targets=targets, run_id=None, dry_run=False,
            )
            print(json.dumps({"status": "paused", "stream": "kelvintanzy"}))
            return
        outcome = execute_kelvintanzy(
            state=state,
            publisher=publisher,
            storage=storage,
            scheduled_for=scheduled,
            slot=os.getenv("SLOT", "morning"),
            platforms=targets,
            deck_name=os.getenv("KELVINTANZY_DECK") or None,
        )
        _send_status(
            stream="kelvintanzy",
            deck=outcome.deck,
            status=outcome.status,
            slides=outcome.slides,
            targets=targets,
            run_id=outcome.run_id,
            dry_run=dry_run,
        )
        if outcome.run_id and (os.getenv("SLACK_WEBHOOK_URL") or os.getenv("SLACK_BOT_TOKEN")):
            state.client.collection("runs").document(outcome.run_id).update(
                {"slackVerified": True}
            )
        print(json.dumps({
            "status": outcome.status,
            "runId": outcome.run_id,
            "targets": targets,
            "publishRequests": len(getattr(publisher, "requests", [])),
            "uploads": len(getattr(storage, "uploads", [])),
            "renderedSlides": outcome.slides,
            "deck": outcome.deck,
            "publishedTargets": list(outcome.succeeded),
            "failedTargets": list(outcome.failed),
        }))
        return

    if os.environ["STREAM_ID"] == "beam-learn-thai":
        outcome = execute_beam(
            state=FirestoreState(firestore.Client(project=project)),
            publisher=publisher,
            storage=storage,
            scheduled_for=scheduled,
            slot=os.getenv("SLOT", "daily"),
            platform=targets[0],
        )
        _send_status(
            stream="beam-learn-thai",
            deck="daily-curated-rotation",
            status=outcome.status,
            slides=1,
            targets=targets,
            run_id=outcome.run_id,
            dry_run=dry_run,
        )
        print(json.dumps({
            "status": outcome.status,
            "runId": outcome.run_id,
            "targets": targets,
            "publishRequests": len(getattr(publisher, "requests", [])),
            "uploads": len(getattr(storage, "uploads", [])),
            "renderedSlides": 1,
        }))
        return

    if os.environ["STREAM_ID"] == "lds-conference":
        outcome = execute_lds_conference(
            state=FirestoreState(firestore.Client(project=project)),
            publisher=publisher,
            storage=storage,
            scheduled_for=scheduled,
            slot=os.getenv("SLOT", "daily"),
            platform=targets[0],
        )
        _send_status(
            stream="lds-conference",
            deck="content-direction-pending",
            status=outcome.status,
            slides=1,
            targets=targets,
            run_id=outcome.run_id,
            dry_run=dry_run,
        )
        print(json.dumps({
            "status": outcome.status,
            "runId": outcome.run_id,
            "targets": targets,
            "publishRequests": len(getattr(publisher, "requests", [])),
            "uploads": len(getattr(storage, "uploads", [])),
            "renderedSlides": 1,
        }))
        return

    outcome = execute(
        state=FirestoreState(firestore.Client(project=project)),
        publisher=publisher,
        storage=storage,
        stream_id=os.environ["STREAM_ID"],
        scheduled_for=scheduled,
        slot=os.getenv("SLOT", "manual-dry-run"),
        platforms=targets,
        caption=os.getenv("DRY_RUN_CAPTION", "Buffer migration dry run"),
        media=b"dry-run-placeholder",
        content_type="image/png",
    )
    _send_status(
        stream=os.environ["STREAM_ID"],
        deck=os.getenv("KELVINTANZY_DECK", "n/a"),
        status=outcome.status,
        slides=0,
        targets=targets,
        run_id=outcome.run_id,
        dry_run=dry_run,
    )
    print(json.dumps({
        "status": outcome.status,
        "runId": outcome.run_id,
        "targets": targets,
        "publishRequests": len(getattr(publisher, "requests", [])),
        "uploads": len(getattr(storage, "uploads", [])),
        "renderedSlides": 0,
    }))


def _scheduled_for() -> datetime:
    if os.getenv("SCHEDULED_FOR"):
        return datetime.fromisoformat(os.environ["SCHEDULED_FOR"])
    zone = ZoneInfo(os.getenv("SCHEDULE_TIMEZONE", "UTC"))
    now = datetime.now(zone)
    hour, minute = (int(part) for part in os.getenv("SCHEDULE_TIME", "00:00").split(":", 1))
    return now.replace(hour=hour, minute=minute, second=0, microsecond=0).astimezone(timezone.utc)


def _publisher(dry_run: bool):
    if dry_run:
        return DryRunPublisher()
    stream_id = os.environ["STREAM_ID"]
    if stream_id == "kelvintanzy":
        targets = {
            "kelvintanzy.instagram": BufferTarget(os.environ["BUFFER_INSTAGRAM_CHANNEL"], "instagram"),
            "kelvintanzy.threads": BufferTarget(os.environ["BUFFER_THREADS_CHANNEL"], "threads"),
            "kelvintanzy.x": BufferTarget(os.environ["BUFFER_X_CHANNEL"], "x"),
        }
    elif stream_id == "beam-learn-thai":
        targets = {
            "beam.instagram": BufferTarget(os.environ["BEAM_INSTAGRAM_CHANNEL"], "instagram"),
        }
    elif stream_id == "lds-conference":
        targets = {
            "lds-conference.instagram": BufferTarget(os.environ["LDS_CONFERENCE_INSTAGRAM_CHANNEL"], "instagram"),
        }
    else:
        raise ValueError(f"no Buffer targets configured for stream {stream_id!r}")
    return BufferPublisher(
        api_token=os.environ["BUFFER_ACCESS_TOKEN"],
        targets=targets,
    )


def _storage(dry_run: bool):
    if dry_run:
        return DryRunStorage()
    if os.getenv("MEDIA_STORAGE", "github").lower() == "firebase":
        return FirebaseStorage(bucket_name=os.environ["MEDIA_BUCKET"])
    stream_id = os.environ["STREAM_ID"]
    default_repos = {
        "beam-learn-thai": "beam-learn-thai-images",
        "lds-conference": "lds-conference-images",
    }
    default_repo = default_repos.get(stream_id, "kelvintanzy-social-assets")
    return GitHubStorage(
        token=os.environ["GITHUB_TOKEN"],
        username=os.environ["GITHUB_USERNAME"],
        repo=os.getenv("GITHUB_MEDIA_REPO", default_repo),
    )


def _send_status(
    *,
    stream: str,
    deck: str,
    status: str,
    slides: int,
    targets: list[str],
    run_id: str | None,
    dry_run: bool,
) -> None:
    webhook = os.getenv("SLACK_WEBHOOK_URL")
    if webhook:
        send_dry_run_status(
            webhook,
            stream=stream,
            deck=deck,
            status=status,
            slides=slides,
            targets=targets,
            run_id=run_id,
            dry_run=dry_run,
        )
    elif os.getenv("SLACK_BOT_TOKEN") and os.getenv("SLACK_CHANNEL"):
        send_bot_dry_run_status(
            os.environ["SLACK_BOT_TOKEN"], os.environ["SLACK_CHANNEL"],
            stream=stream, status=status,
            targets=targets, run_id=run_id,
        )


def _send_unhandled_error_status(exc: Exception) -> None:
    stream = os.getenv("STREAM_ID", "unknown")
    targets = [item.strip() for item in os.getenv("PUBLISH_TARGETS", "").split(",") if item.strip()]
    deck = os.getenv("KELVINTANZY_DECK") or (
        "daily-curated-rotation" if stream == "beam-learn-thai"
        else "content-direction-pending" if stream == "lds-conference"
        else "n/a"
    )
    try:
        _send_status(
            stream=stream,
            deck=deck,
            status=f"error:{type(exc).__name__}",
            slides=0,
            targets=targets,
            run_id=None,
            dry_run=os.getenv("DRY_RUN", "true").lower() == "true",
        )
    except Exception as slack_exc:
        print(json.dumps({
            "status": "slack_error_notification_failed",
            "stream": stream,
            "originalError": type(exc).__name__,
            "slackError": type(slack_exc).__name__,
        }))


if __name__ == "__main__":
    main()
