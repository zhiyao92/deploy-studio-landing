"""Shared cloud state for the social publishing workers."""

from .idempotency import scheduled_slot_key

__all__ = ["scheduled_slot_key"]
