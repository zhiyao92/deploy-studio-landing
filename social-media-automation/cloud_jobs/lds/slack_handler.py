#!/usr/bin/env python3
"""
slack_handler.py — Posts draft graphics to Slack for approval/feedback.

Uploads the graphic with the ready-to-copy Instagram caption attached to the
same message (via initial_comment), then posts the approval buttons as a
follow-up message.

Uses Slack's current external-upload flow (files.getUploadURLExternal +
files.completeUploadExternal); the old files.upload API is retired.
"""

import logging
import os
from typing import Optional

import requests

logger = logging.getLogger("slack_handler")


class SlackPostError(RuntimeError):
    """Raised when Slack rejects a post (bad channel, missing scope, etc.)."""


class SlackHandler:
    """Manages posting drafts to Slack for approval."""

    def __init__(self, bot_token: Optional[str] = None):
        """Initialize Slack handler.

        Args:
            bot_token: Slack bot token (defaults to SLACK_BOT_TOKEN env var).
                      Must have chat:write and files:write scopes.
                      channels:read is needed if SLACK_APPROVAL_CHANNEL is a
                      #name rather than a channel ID.
        """
        self.bot_token = bot_token or os.environ.get("SLACK_BOT_TOKEN")
        if not self.bot_token:
            raise EnvironmentError("SLACK_BOT_TOKEN not set")

        self.slack_api_base = "https://slack.com/api"
        self.channel = os.environ.get("SLACK_APPROVAL_CHANNEL", "#lds-quotes-drafts")
        self._channel_id: Optional[str] = None

    # ------------------------------------------------------------------
    # Channel resolution
    # ------------------------------------------------------------------

    def _resolve_channel_id(self) -> str:
        """Resolve the configured channel to a channel ID.

        Accepts either a raw channel ID (C0123456789) or a #name. Names are
        resolved via conversations.list, which requires the channels:read
        scope.
        """
        if self._channel_id:
            return self._channel_id

        if not self.channel.startswith("#"):
            self._channel_id = self.channel
            return self._channel_id

        name = self.channel.lstrip("#")
        headers = {"Authorization": f"Bearer {self.bot_token}"}
        cursor = None

        while True:
            params = {"limit": 200, "types": "public_channel,private_channel"}
            if cursor:
                params["cursor"] = cursor

            resp = requests.get(
                f"{self.slack_api_base}/conversations.list",
                headers=headers,
                params=params,
                timeout=30,
            )
            data = resp.json()

            if not data.get("ok"):
                raise RuntimeError(
                    f"Could not resolve channel '{self.channel}' "
                    f"(Slack error: {data.get('error')}). Either add the "
                    "'channels:read' scope to the bot, or set "
                    "SLACK_APPROVAL_CHANNEL to the channel ID (open the "
                    "channel → click its name → the ID is at the bottom "
                    "of the About tab)."
                )

            for ch in data.get("channels", []):
                if ch.get("name") == name:
                    self._channel_id = ch["id"]
                    return self._channel_id

            cursor = data.get("response_metadata", {}).get("next_cursor")
            if not cursor:
                raise RuntimeError(
                    f"Channel '{self.channel}' not found. Make sure it exists "
                    "and the bot has been invited (/invite @YourBot)."
                )

    # ------------------------------------------------------------------
    # Draft posting
    # ------------------------------------------------------------------

    def post_draft_for_approval(
        self,
        image_bytes: bytes,
        caption: str,
        quote_id: str,
        quote_text: str,
        author: str,
    ) -> dict:
        """Post a draft quote graphic to Slack for approval.

        The image and the ready-to-copy caption arrive as ONE message, so
        sharing to Instagram is just: copy image, copy caption.

        Args:
            image_bytes: PNG image data as bytes.
            caption: Full Instagram caption (caption + quote + hashtags).
            quote_id: Unique quote identifier.
            quote_text: Full quote text.
            author: Author name.

        Returns:
            Dict containing 'ts' (buttons message timestamp) and 'channel'.

        Raises:
            RuntimeError: If any Slack API call fails.
        """
        channel_id = self._resolve_channel_id()

        # One message: the graphic with the caption attached underneath,
        # inside a code block — Slack shows a native copy button on code
        # blocks (hover top-right on desktop, long-press on mobile).
        comment = f"```{caption}```"
        self._upload_image(image_bytes, quote_id, channel_id, comment)

        # Follow-up message: the approval buttons.
        return self._post_approval_buttons(channel_id, quote_id)

    def _upload_image(
        self,
        image_bytes: bytes,
        quote_id: str,
        channel_id: str,
        initial_comment: str,
    ) -> str:
        """Upload image to Slack and post to channel with caption.

        Returns:
            The uploaded file ID.

        Raises:
            RuntimeError: If any step fails.
        """
        headers = {"Authorization": f"Bearer {self.bot_token}"}
        filename = f"quote_{quote_id}.png"

        # Step 1: reserve an upload URL
        resp = requests.post(
            f"{self.slack_api_base}/files.getUploadURLExternal",
            headers=headers,
            data={"filename": filename, "length": len(image_bytes)},
            timeout=30,
        )
        data = resp.json()
        if not data.get("ok"):
            raise RuntimeError(f"Slack upload URL request failed: {data.get('error')}")

        upload_url = data["upload_url"]
        file_id = data["file_id"]

        # Step 2: upload the raw bytes
        up = requests.post(upload_url, data=image_bytes, timeout=60)
        if up.status_code != 200:
            raise RuntimeError(f"Slack file upload failed with HTTP {up.status_code}")

        # Step 3: finalize and share into the channel with the caption attached.
        # Requires the bot to be a member of the channel (/invite @Jarvis).
        resp = requests.post(
            f"{self.slack_api_base}/files.completeUploadExternal",
            headers={**headers, "Content-Type": "application/json"},
            json={
                "files": [{"id": file_id, "title": f"Quote Draft — {quote_id}"}],
                "channel_id": channel_id,
                "initial_comment": initial_comment,
            },
            timeout=30,
        )
        data = resp.json()
        if not data.get("ok"):
            raise RuntimeError(f"Slack upload finalize failed: {data.get('error')}")

        return file_id

    def _post_approval_buttons(self, channel_id: str, quote_id: str) -> dict:
        """Post the approval buttons as a follow-up message.

        Returns:
            Dict with 'ts' and 'channel'.

        Raises:
            RuntimeError: If post fails.
        """
        headers = {
            "Authorization": f"Bearer {self.bot_token}",
            "Content-Type": "application/json",
        }

        blocks = [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "Not feeling this one?",
                },
            },
            {
                "type": "actions",
                "elements": [
                    {
                        "type": "button",
                        "text": {
                            "type": "plain_text",
                            "text": "🔄 Choose a different one",
                            "emoji": True,
                        },
                        "value": f"regenerate_{quote_id}",
                        "action_id": f"regenerate_{quote_id}",
                    },
                ],
            },
        ]

        resp = requests.post(
            f"{self.slack_api_base}/chat.postMessage",
            headers=headers,
            json={
                "channel": channel_id,
                "text": f"Quote draft {quote_id} is ready for review",
                "blocks": blocks,
            },
            timeout=30,
        )
        result = resp.json()
        if not result.get("ok"):
            raise RuntimeError(f"Slack message post failed: {result.get('error')}")

        return {"ts": result.get("ts"), "channel": result.get("channel")}

    # ------------------------------------------------------------------
    # Status updates
    # ------------------------------------------------------------------

    def post_status_update(
        self,
        status: str,
        message: str,
        quote_id: str,
    ) -> None:
        """Post a status update (e.g., approved, amended, error).

        Args:
            status: "success", "error", or "amended".
            message: Human-readable status message.
            quote_id: Quote ID for context.

        Raises:
            SlackPostError: If Slack rejects the message (e.g. not_in_channel)
                or the request fails. Callers decide how loud to be about it —
                silently swallowing this is how a misrouted channel went
                unnoticed for days.
        """
        emoji_map = {
            "success": ":white_check_mark:",
            "error": ":x:",
            "amended": ":pencil2:",
        }
        emoji = emoji_map.get(status, ":speech_balloon:")

        try:
            channel_id = self._resolve_channel_id()
            resp = requests.post(
                f"{self.slack_api_base}/chat.postMessage",
                headers={
                    "Authorization": f"Bearer {self.bot_token}",
                    "Content-Type": "application/json",
                },
                json={
                    "channel": channel_id,
                    "text": f"{emoji} Status update ({quote_id}): {message}",
                },
                timeout=30,
            )
            result = resp.json()
            if not result.get("ok"):
                error = result.get("error")
                logger.error(f"Status update failed: {error}")
                raise SlackPostError(
                    f"Slack rejected the status update for channel "
                    f"'{self.channel}': {error}"
                )
        except SlackPostError:
            raise
        except Exception as e:
            logger.error(f"Failed to post status update to Slack: {e}")
            raise SlackPostError(f"Could not post status update to Slack: {e}") from e
