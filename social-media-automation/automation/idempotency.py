"""Deterministic identifiers that make social publishing retry-safe."""

from __future__ import annotations

import hashlib
from datetime import datetime, timezone


def scheduled_slot_key(stream_id: str, scheduled_for: datetime, slot: str) -> str:
    """Return a stable Firestore document ID for one scheduled publishing slot.

    The timestamp is normalized to UTC so two schedulers referring to the same
    instant cannot acquire separate locks because they used different timezones.
    """
    stream = stream_id.strip().lower()
    normalized_slot = slot.strip().lower()
    if not stream:
        raise ValueError("stream_id must not be empty")
    if not normalized_slot:
        raise ValueError("slot must not be empty")
    if scheduled_for.tzinfo is None or scheduled_for.utcoffset() is None:
        raise ValueError("scheduled_for must be timezone-aware")

    instant = scheduled_for.astimezone(timezone.utc).isoformat(timespec="seconds")
    raw = f"{stream}:{instant}:{normalized_slot}"
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()
