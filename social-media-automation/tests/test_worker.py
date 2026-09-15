from datetime import datetime, timedelta, timezone
import os

import pytest
from google.cloud import firestore

from automation.adapters import DryRunPublisher, DryRunStorage
from automation.firestore_state import FirestoreState
from automation.worker import execute


class FailThreadsOnce(DryRunPublisher):
    def __init__(self) -> None:
        super().__init__()
        self.failed = False

    def publish(self, *, platform: str, caption: str, media_url: str) -> str:
        if platform == "threads" and not self.failed:
            self.failed = True
            raise RuntimeError("temporary")
        return super().publish(platform=platform, caption=caption, media_url=media_url)


pytestmark = pytest.mark.skipif(
    not os.getenv("FIRESTORE_EMULATOR_HOST"),
    reason="requires the Firestore emulator",
)


def test_end_to_end_dry_run_seals_completed_slot() -> None:
    client = firestore.Client(project="social-media-automation-5c9db")
    publisher = DryRunPublisher()
    storage = DryRunStorage()
    scheduled = datetime(2026, 9, 14, 0, 0, tzinfo=timezone.utc)
    outcome = execute(
        state=FirestoreState(client),
        publisher=publisher,
        storage=storage,
        stream_id="kelvintanzy",
        scheduled_for=scheduled,
        slot="morning",
        platforms=["instagram", "threads", "x"],
        caption="Dry run",
        media=b"image bytes",
        content_type="image/png",
        now=scheduled,
    )

    assert outcome.status == "completed"
    assert outcome.succeeded == ("instagram", "threads", "x")
    assert len(publisher.requests) == 3
    assert len(storage.uploads) == 1

    duplicate = execute(
        state=FirestoreState(client), publisher=publisher, storage=storage,
        stream_id="kelvintanzy", scheduled_for=scheduled, slot="morning",
        platforms=["instagram", "threads", "x"], caption="Dry run",
        media=b"image bytes", content_type="image/png", now=scheduled,
    )
    assert duplicate.status == "duplicate"
    assert len(publisher.requests) == 3
    assert len(storage.uploads) == 1


def test_expired_partial_run_retries_only_failed_platform() -> None:
    client = firestore.Client(project="social-media-automation-5c9db")
    publisher = FailThreadsOnce()
    storage = DryRunStorage()
    scheduled = datetime(2026, 9, 15, 0, 0, tzinfo=timezone.utc)
    args = dict(
        state=FirestoreState(client), publisher=publisher, storage=storage,
        stream_id="kelvintanzy", scheduled_for=scheduled, slot="morning",
        platforms=["instagram", "threads"], caption="Dry run", media=b"image",
        content_type="image/png",
    )
    first = execute(**args, now=scheduled)
    retry = execute(**args, now=scheduled + timedelta(minutes=31))

    assert first.status == "partial_failure"
    assert retry.status == "completed"
    assert retry.run_id == first.run_id
    assert [request["platform"] for request in publisher.requests] == [
        "instagram", "threads"
    ]
