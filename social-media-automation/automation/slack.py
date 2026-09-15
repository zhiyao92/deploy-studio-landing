"""Minimal Slack incoming-webhook notifier for operational status."""

from __future__ import annotations

import json
from typing import Callable
from urllib.parse import urlencode
from urllib.request import Request, urlopen


SendRequest = Callable[[str, bytes], None]


def _send(url: str, body: bytes) -> None:
    request = Request(url, data=body, headers={"Content-Type": "application/json"}, method="POST")
    with urlopen(request, timeout=15) as response:  # noqa: S310 - Secret Manager URL
        if response.status >= 300:
            raise RuntimeError(f"Slack webhook returned HTTP {response.status}")


def send_bot_dry_run_status(
    bot_token: str,
    channel: str,
    *,
    stream: str,
    status: str,
    targets: list[str],
    run_id: str | None,
) -> None:
    """Send status with a Slack bot, resolving a configured #channel name."""
    if not bot_token.startswith("xoxb-"):
        raise ValueError("invalid Slack bot token")
    channel_id = channel
    if channel.startswith("#"):
        query = urlencode({"limit": 200, "types": "public_channel,private_channel"})
        request = Request(
            f"https://slack.com/api/conversations.list?{query}",
            headers={"Authorization": f"Bearer {bot_token}"},
        )
        with urlopen(request, timeout=15) as response:  # noqa: S310
            result = json.load(response)
        channel_id = next(
            (item["id"] for item in result.get("channels", []) if item.get("name") == channel[1:]),
            "",
        )
        if not channel_id:
            raise RuntimeError(f"Slack channel {channel} was not found")
    text = (
        ":test_tube: *FIREBASE DRY RUN — NO SOCIAL POSTS SENT*\n"
        f"Stream: `{stream}`\nStatus: *{status}*\n"
        f"Targets checked: {', '.join(targets)}\nRun ID: `{run_id or 'none'}`"
    )
    body = json.dumps({"channel": channel_id, "text": text}).encode()
    request = Request(
        "https://slack.com/api/chat.postMessage", data=body, method="POST",
        headers={"Authorization": f"Bearer {bot_token}", "Content-Type": "application/json"},
    )
    with urlopen(request, timeout=15) as response:  # noqa: S310
        result = json.load(response)
    if not result.get("ok"):
        raise RuntimeError(f"Slack rejected status: {result.get('error', 'unknown')}")


def send_dry_run_status(
    webhook_url: str,
    *,
    stream: str,
    deck: str,
    status: str,
    slides: int,
    targets: list[str],
    run_id: str | None,
    dry_run: bool = True,
    send: SendRequest = _send,
) -> None:
    if not webhook_url.startswith("https://hooks.slack.com/"):
        raise ValueError("invalid Slack webhook URL")
    lowered = status.lower()
    headline = (
        ":test_tube: *FIREBASE DRY RUN — NO SOCIAL POSTS SENT*"
        if dry_run
        else ":rotating_light: *FIREBASE PUBLISHER ALERT*"
        if any(word in lowered for word in ("failed", "error", "missing", "incomplete"))
        else ":white_check_mark: *FIREBASE PUBLISHER STATUS*"
    )
    text = (
        f"{headline}\n"
        f"Stream: `{stream}`\nDeck: `{deck}`\nStatus: *{status}*\n"
        f"Rendered slides: {slides}\nTargets checked: {', '.join(targets)}\n"
        f"Run ID: `{run_id or 'none'}`"
    )
    send(webhook_url, json.dumps({"text": text}).encode("utf-8"))
