#!/usr/bin/env python3
"""
slack_handler.py — Posts draft graphics to Slack for approval/feedback.

Uploads the graphic with the ready-to-copy Instagram caption, then posts
approval buttons as a follow-up message.
"""

import logging
import os
from typing import Optional

import requests

logger = logging.getLogger("slack_handler")


class SlackHandler:
    """Manages posting drafts to Slack for approval."""

    def __init__(self, bot_token: Optional[str] = None):
        """Initialize Slack handler.

        Args:
            bot_token: Slack bot token (defaults to SLACK_BOT_TOKEN env var).
                      Must have chat:write and files:write scopes.
        """
        self.bot_token = bot_token or os.environ.get("SLACK_BOT_TOKEN")
        if not self.bot_token:
            raise EnvironmentError("SLACK_BOT_TOKEN not set")

        self.slack_api_base = "https://slack.com/api"
        self.channel = os.environ.get("SLACK_APPROVAL_CHANNEL", "#bondify-drafts")
        self._channel_id: Optional[str] = None

    def _resolve_channel_id(self) -> str:
        """Resolve the configured channel to a channel ID."""
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
                    f"(Slack error: {data.get('error')})"
                )

            for ch in data.get("channels", []):
                if ch.get("name") == name:
                    self._channel_id = ch["id"]
                    return self._channel_id

            cursor = data.get("response_metadata", {}).get("next_cursor")
            if not cursor:
                raise RuntimeError(
                    f"Channel '{self.channel}' not found. Make sure it exists "
                    "and the bot has been invited (/invite @Bondify)."
                )

    def post_draft_for_approval(
        self,
        image_bytes: bytes,
        caption: str,
        quote_id: str,
        quote_text: str,
        author: str,
        category: str,
    ) -> dict:
        """Post a draft quote graphic to Slack for approval.

        Args:
            image_bytes: PNG image data as bytes.
            caption: Full Instagram caption.
            quote_id: Unique quote identifier.
            quote_text: Full quote text.
            author: Author name.
            category: Quote category.

        Returns:
            Dict containing 'ts' (message timestamp) and 'channel'.

        Raises:
            RuntimeError: If any Slack API call fails.
        """
        channel_id = self._resolve_channel_id()

        # Upload image with caption in a code block
        comment = f"```{caption}```"
        self._upload_image(image_bytes, quote_id, channel_id, comment)

        # Post approval buttons
        return self._post_approval_buttons(channel_id, quote_id, author, category)

    def _upload_image(
        self,
        image_bytes: bytes,
        quote_id: str,
        channel_id: str,
        initial_comment: str,
    ) -> str:
        """Upload image to Slack and post to channel."""
        headers = {"Authorization": f"Bearer {self.bot_token}"}
        filename = f"quote_{quote_id}.png"

        # Step 1: Request upload URL
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

        # Step 2: Upload the bytes
        up = requests.post(upload_url, data=image_bytes, timeout=60)
        if up.status_code != 200:
            raise RuntimeError(f"Slack file upload failed with HTTP {up.status_code}")

        # Step 3: Finalize and share
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

        logger.info(f"Uploaded image to Slack: {file_id}")
        return file_id

    def _post_approval_buttons(
        self,
        channel_id: str,
        quote_id: str,
        author: str,
        category: str,
    ) -> dict:
        """Post the approval buttons as a follow-up message."""
        headers = {
            "Authorization": f"Bearer {self.bot_token}",
            "Content-Type": "application/json",
        }

        blocks = [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": f"Quote by *{author}* • Category: `{category}`",
                },
            },
            {
                "type": "actions",
                "elements": [
                    {
                        "type": "button",
                        "text": {
                            "type": "plain_text",
                            "text": "✅ Approve & Publish",
                            "emoji": True,
                        },
                        "value": f"approve_{quote_id}",
                        "action_id": f"approve_{quote_id}",
                        "style": "primary",
                    },
                    {
                        "type": "button",
                        "text": {
                            "type": "plain_text",
                            "text": "🔄 Choose Different",
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
                "text": f"Quote draft {quote_id} ready for review",
                "blocks": blocks,
            },
            timeout=30,
        )
        result = resp.json()
        if not result.get("ok"):
            raise RuntimeError(f"Slack message post failed: {result.get('error')}")

        logger.info(f"Posted approval buttons to Slack: ts={result.get('ts')}")
        return {"ts": result.get("ts"), "channel": result.get("channel")}

    def post_status_update(
        self,
        status: str,
        message: str,
        quote_id: str,
    ) -> None:
        """Post a status update to Slack.

        Args:
            status: "success", "error", or "amended".
            message: Human-readable status message.
            quote_id: Quote ID for context.
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
                    "text": f"{emoji} {message}",
                },
                timeout=30,
            )
            result = resp.json()
            if not result.get("ok"):
                logger.error(f"Status update failed: {result.get('error')}")
        except Exception as e:
            logger.error(f"Failed to post status to Slack: {e}")
