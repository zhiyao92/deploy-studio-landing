"""Retry-safe orchestration shared by local dry-runs and the future Cloud Run job."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from typing import Protocol

from .firestore_state import FirestoreState


class SocialPublisher(Protocol):
    def publish(self, *, platform: str, caption: str, media_url: str) -> str: ...


class MediaStorage(Protocol):
    def upload(self, *, object_name: str, content: bytes, content_type: str) -> str: ...


@dataclass(frozen=True)
class RunOutcome:
    status: str
    run_id: str | None
    succeeded: tuple[str, ...] = ()
    failed: tuple[str, ...] = ()


def execute(
    *,
    state: FirestoreState,
    publisher: SocialPublisher,
    storage: MediaStorage,
    stream_id: str,
    scheduled_for: datetime,
    slot: str,
    platforms: list[str],
    caption: str,
    media: bytes,
    content_type: str,
    now: datetime | None = None,
) -> RunOutcome:
    run = state.acquire_run(
        stream_id=stream_id,
        scheduled_for=scheduled_for,
        slot=slot,
        now=now,
    )
    if not run.acquired or not run.run_id:
        return RunOutcome("duplicate", run.run_id)

    object_name = f"drafts/{stream_id}/{run.run_id}/media"
    media_url = storage.upload(
        object_name=object_name, content=media, content_type=content_type
    )
    succeeded: list[str] = []
    failed: list[str] = []
    for platform in platforms:
        claim = state.acquire_publish(
            run_id=run.run_id,
            stream_id=stream_id,
            platform=platform,
            now=now,
        )
        if not claim.acquired:
            continue
        try:
            external_id = publisher.publish(
                platform=platform, caption=caption, media_url=media_url
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
            {"status": "partial_failure", "failedPlatforms": failed}
        )
        return RunOutcome("partial_failure", run.run_id, tuple(succeeded), tuple(failed))

    state.seal_run(run)
    return RunOutcome("completed", run.run_id, tuple(succeeded))
