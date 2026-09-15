from datetime import datetime, timedelta, timezone

import pytest

from automation.idempotency import scheduled_slot_key


def test_same_instant_in_different_timezones_has_same_key() -> None:
    utc = datetime(2026, 9, 7, 0, 0, tzinfo=timezone.utc)
    malaysia = utc.astimezone(timezone(timedelta(hours=8)))

    assert scheduled_slot_key("KelvinTanZY", utc, "Morning") == scheduled_slot_key(
        "kelvintanzy", malaysia, "morning"
    )


def test_different_slots_have_different_keys() -> None:
    when = datetime(2026, 9, 7, 0, 0, tzinfo=timezone.utc)
    assert scheduled_slot_key("kelvintanzy", when, "morning") != scheduled_slot_key(
        "kelvintanzy", when, "evening"
    )


def test_naive_datetime_is_rejected() -> None:
    with pytest.raises(ValueError, match="timezone-aware"):
        scheduled_slot_key("kelvintanzy", datetime(2026, 9, 7), "morning")
