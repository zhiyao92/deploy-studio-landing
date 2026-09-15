from datetime import datetime, timedelta, timezone
import os

import pytest
from google.cloud import firestore

from automation.firestore_state import FirestoreState


pytestmark = pytest.mark.skipif(
    not os.getenv("FIRESTORE_EMULATOR_HOST"),
    reason="requires the Firestore emulator",
)


def client() -> firestore.Client:
    return firestore.Client(project="social-media-automation-5c9db")


def test_duplicate_live_lease_is_blocked() -> None:
    store = FirestoreState(client())
    scheduled = datetime(2026, 9, 7, 0, 0, tzinfo=timezone.utc)
    now = datetime(2026, 9, 7, 0, 1, tzinfo=timezone.utc)

    first = store.acquire_run(
        stream_id="kelvintanzy", scheduled_for=scheduled, slot="morning", now=now
    )
    duplicate = store.acquire_run(
        stream_id="kelvintanzy", scheduled_for=scheduled, slot="morning", now=now
    )

    assert first.acquired is True
    assert duplicate.acquired is False
    assert duplicate.run_id == first.run_id


def test_expired_unsealed_lease_can_be_reclaimed() -> None:
    store = FirestoreState(client())
    scheduled = datetime(2026, 9, 8, 0, 0, tzinfo=timezone.utc)
    first_now = datetime(2026, 9, 8, 0, 1, tzinfo=timezone.utc)

    first = store.acquire_run(
        stream_id="kelvintanzy",
        scheduled_for=scheduled,
        slot="morning",
        lease_minutes=5,
        now=first_now,
    )
    reclaimed = store.acquire_run(
        stream_id="kelvintanzy",
        scheduled_for=scheduled,
        slot="morning",
        now=first_now + timedelta(minutes=6),
    )

    assert first.acquired is True
    assert reclaimed.acquired is True
    assert reclaimed.run_id == first.run_id


def test_sealed_slot_is_never_reclaimed() -> None:
    store = FirestoreState(client())
    scheduled = datetime(2026, 9, 9, 0, 0, tzinfo=timezone.utc)
    now = datetime(2026, 9, 9, 0, 1, tzinfo=timezone.utc)
    first = store.acquire_run(
        stream_id="kelvintanzy",
        scheduled_for=scheduled,
        slot="morning",
        lease_minutes=1,
        now=now,
    )
    store.seal_run(first, completed_at=now + timedelta(seconds=30))

    retry = store.acquire_run(
        stream_id="kelvintanzy",
        scheduled_for=scheduled,
        slot="morning",
        now=now + timedelta(days=1),
    )

    assert retry.acquired is False
    assert retry.run_id == first.run_id


def test_partial_failure_retries_only_failed_platform() -> None:
    store = FirestoreState(client())
    now = datetime(2026, 9, 10, 0, 1, tzinfo=timezone.utc)
    run = store.acquire_run(
        stream_id="kelvintanzy",
        scheduled_for=datetime(2026, 9, 10, 0, 0, tzinfo=timezone.utc),
        slot="morning",
        now=now,
    )

    instagram = store.acquire_publish(
        run_id=run.run_id or "", stream_id="kelvintanzy", platform="instagram", now=now
    )
    threads = store.acquire_publish(
        run_id=run.run_id or "", stream_id="kelvintanzy", platform="threads", now=now
    )
    store.record_publish_result(instagram, succeeded=True, external_post_id="buffer-ig")
    store.record_publish_result(threads, succeeded=False, error="temporary failure")

    instagram_retry = store.acquire_publish(
        run_id=run.run_id or "", stream_id="kelvintanzy", platform="instagram", now=now
    )
    threads_retry = store.acquire_publish(
        run_id=run.run_id or "", stream_id="kelvintanzy", platform="threads", now=now
    )

    assert instagram_retry.acquired is False
    assert instagram_retry.attempt == 1
    assert threads_retry.acquired is True
    assert threads_retry.attempt == 2


def test_active_platform_publish_lease_blocks_concurrent_attempt() -> None:
    store = FirestoreState(client())
    now = datetime(2026, 9, 11, 0, 0, tzinfo=timezone.utc)
    first = store.acquire_publish(
        run_id="run-concurrent",
        stream_id="kelvintanzy",
        platform="x",
        now=now,
    )
    duplicate = store.acquire_publish(
        run_id="run-concurrent",
        stream_id="kelvintanzy",
        platform="x",
        now=now,
    )

    assert first.acquired is True
    assert duplicate.acquired is False
    assert duplicate.attempt == 1
