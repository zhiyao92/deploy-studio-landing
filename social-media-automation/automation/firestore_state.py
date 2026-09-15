"""Firestore persistence for run records and idempotency locks."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import Any

from google.cloud import firestore

from .idempotency import scheduled_slot_key


@dataclass(frozen=True)
class LockResult:
    acquired: bool
    key: str
    run_id: str | None


@dataclass(frozen=True)
class PublishClaim:
    acquired: bool
    post_id: str
    attempt: int


class FirestoreState:
    """Owns the transaction that must succeed before any external API call."""

    def __init__(self, client: firestore.Client) -> None:
        self.client = client

    def get_stream(self, stream_id: str) -> dict[str, Any]:
        if not stream_id.strip():
            raise ValueError("stream_id must not be empty")
        snapshot = self.client.collection("streams").document(stream_id).get()
        if not snapshot.exists:
            raise KeyError(f"stream not found: {stream_id}")
        return snapshot.to_dict() or {}

    def acquire_run(
        self,
        *,
        stream_id: str,
        scheduled_for: datetime,
        slot: str,
        lease_minutes: int = 30,
        now: datetime | None = None,
    ) -> LockResult:
        if lease_minutes <= 0:
            raise ValueError("lease_minutes must be positive")
        now = now or datetime.now(timezone.utc)
        if now.tzinfo is None or now.utcoffset() is None:
            raise ValueError("now must be timezone-aware")
        now = now.astimezone(timezone.utc)
        scheduled_utc = scheduled_for.astimezone(timezone.utc)
        key = scheduled_slot_key(stream_id, scheduled_utc, slot)
        lock_ref = self.client.collection("locks").document(key)
        new_run_ref = self.client.collection("runs").document()
        transaction = self.client.transaction()

        @firestore.transactional
        def acquire(txn: Any) -> LockResult:
            snapshot = lock_ref.get(transaction=txn)
            if snapshot.exists:
                existing = snapshot.to_dict() or {}
                expires_at = existing.get("expiresAt")
                # A completed/accepted slot is permanent. An abandoned lease can
                # be reclaimed only if no external publish was recorded.
                if existing.get("sealed") or not expires_at or expires_at > now:
                    return LockResult(False, key, existing.get("runId"))

            existing_run_id = existing.get("runId") if snapshot.exists else None
            run_ref = self.client.collection("runs").document(
                existing_run_id or new_run_ref.id
            )
            expires_at = now + timedelta(minutes=lease_minutes)
            txn.set(
                lock_ref,
                {
                    "streamId": stream_id,
                    "scheduledFor": scheduled_utc,
                    "slot": slot,
                    "runId": run_ref.id,
                    "acquiredAt": now,
                    "expiresAt": expires_at,
                    "sealed": False,
                },
                merge=True,
            )
            txn.set(
                run_ref,
                {
                    "streamId": stream_id,
                    "scheduledFor": scheduled_utc,
                    "slot": slot,
                    "startedAt": now,
                    "status": "acquired",
                    "idempotencyKey": key,
                },
            )
            return LockResult(True, key, run_ref.id)

        return acquire(transaction)

    def acquire_publish(
        self,
        *,
        run_id: str,
        stream_id: str,
        platform: str,
        lease_minutes: int = 10,
        now: datetime | None = None,
    ) -> PublishClaim:
        """Claim one platform publish without replaying successful platforms."""
        platform = platform.strip().lower()
        if not run_id.strip() or not stream_id.strip() or not platform:
            raise ValueError("run_id, stream_id, and platform must not be empty")
        if lease_minutes <= 0:
            raise ValueError("lease_minutes must be positive")
        now = now or datetime.now(timezone.utc)
        if now.tzinfo is None or now.utcoffset() is None:
            raise ValueError("now must be timezone-aware")
        now = now.astimezone(timezone.utc)
        post_id = f"{run_id}_{platform}"
        post_ref = self.client.collection("posts").document(post_id)
        transaction = self.client.transaction()

        @firestore.transactional
        def acquire(txn: Any) -> PublishClaim:
            snapshot = post_ref.get(transaction=txn)
            existing = snapshot.to_dict() or {}
            attempt = int(existing.get("attemptCount", 0))
            if existing.get("status") == "succeeded":
                return PublishClaim(False, post_id, attempt)
            expires_at = existing.get("leaseExpiresAt")
            if existing.get("status") == "publishing" and expires_at and expires_at > now:
                return PublishClaim(False, post_id, attempt)

            attempt += 1
            txn.set(
                post_ref,
                {
                    "runId": run_id,
                    "streamId": stream_id,
                    "platform": platform,
                    "status": "publishing",
                    "attemptCount": attempt,
                    "attemptedAt": now,
                    "leaseExpiresAt": now + timedelta(minutes=lease_minutes),
                },
                merge=True,
            )
            return PublishClaim(True, post_id, attempt)

        return acquire(transaction)

    def record_publish_result(
        self,
        claim: PublishClaim,
        *,
        succeeded: bool,
        external_post_id: str | None = None,
        error: str | None = None,
        completed_at: datetime | None = None,
    ) -> None:
        if not claim.acquired:
            raise ValueError("only an acquired publish can record a result")
        if succeeded and not external_post_id:
            raise ValueError("successful publishes require an external_post_id")
        completed_at = completed_at or datetime.now(timezone.utc)
        if completed_at.tzinfo is None or completed_at.utcoffset() is None:
            raise ValueError("completed_at must be timezone-aware")
        update: dict[str, Any] = {
            "status": "succeeded" if succeeded else "failed",
            "completedAt": completed_at.astimezone(timezone.utc),
            "leaseExpiresAt": firestore.DELETE_FIELD,
        }
        if succeeded:
            update["externalPostId"] = external_post_id
            update["error"] = firestore.DELETE_FIELD
        else:
            update["error"] = error or "unknown publish failure"
        self.client.collection("posts").document(claim.post_id).update(update)

    def seal_run(self, result: LockResult, *, completed_at: datetime | None = None) -> None:
        if not result.acquired or not result.run_id:
            raise ValueError("only an acquired run can be sealed")
        completed_at = (completed_at or datetime.now(timezone.utc)).astimezone(timezone.utc)
        batch = self.client.batch()
        batch.update(
            self.client.collection("locks").document(result.key),
            {"sealed": True, "completedAt": completed_at},
        )
        batch.update(
            self.client.collection("runs").document(result.run_id),
            {"status": "completed", "completedAt": completed_at},
        )
        batch.commit()
