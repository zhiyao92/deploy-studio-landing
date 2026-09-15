#!/usr/bin/env python3
"""
buffer_handler.py — Publishes quotes to Instagram, Threads, and Facebook via Buffer.

Uses Buffer's GraphQL API (https://api.buffer.com/) to publish a post to each
connected channel immediately. Each platform is its own Buffer "channel" with
its own ID and its own required metadata, so we publish to each separately.
"""

import logging
import os
from typing import Optional

import requests

logger = logging.getLogger("buffer_handler")

BUFFER_API_URL = "https://api.buffer.com/"


class BufferHandler:
    """Publishes posts to Instagram, Threads, and Facebook via Buffer."""

    def __init__(self, api_token: Optional[str] = None):
        """Initialize Buffer handler.

        Reads the API token and per-platform channel IDs from the environment.

        Args:
            api_token: Buffer API token (defaults to BUFFER_API_TOKEN env var).
        """
        self.api_token = api_token or os.environ.get("BUFFER_API_TOKEN")
        if not self.api_token:
            raise EnvironmentError("BUFFER_API_TOKEN not set")

        # Each social account is a separate Buffer channel with its own ID.
        self.channels = {
            "instagram": os.environ.get("BUFFER_INSTAGRAM_CHANNEL_ID"),
            "threads": os.environ.get("BUFFER_THREADS_CHANNEL_ID"),
            "facebook": os.environ.get("BUFFER_FACEBOOK_CHANNEL_ID"),
        }

    def _headers(self) -> dict:
        return {
            "Authorization": f"Bearer {self.api_token}",
            "Content-Type": "application/json",
            "x-buffer-client-id": "buffertools-graphql-docs",
            "x-buffer-buffertools": "true",
        }

    # Per-platform metadata for the createPost mutation. Facebook and Instagram
    # both require a post `type`; Instagram also requires `shouldShareToFeed`.
    PLATFORM_METADATA = {
        "instagram": "{instagram: {type: post, shouldShareToFeed: true}}",
        "threads": "{threads: {type: post}}",
        "facebook": "{facebook: {type: post}}",
    }

    def publish_to_channel(
        self,
        platform: str,
        channel_id: str,
        text: str,
        image_url: str,
    ) -> dict:
        """Publish a single post to one Buffer channel immediately.

        Args:
            platform: One of "instagram", "threads", "facebook".
            channel_id: Buffer channel ID for that platform.
            text: Post caption/text (body). Any clickable download link should
                already be part of this text (callers build it per platform).
            image_url: Publicly accessible image URL.

        Returns:
            Dict with 'success' bool and post 'id' when successful.

        Raises:
            RuntimeError: If publishing fails.
        """
        metadata = self.PLATFORM_METADATA.get(platform, "{}")

        mutation = f"""
mutation CreatePost($channelId: ChannelId!, $schedulingType: SchedulingType!, $mode: ShareMode!, $text: String!, $imageUrl: String!) {{
  createPost(input: {{
    channelId: $channelId
    schedulingType: $schedulingType
    mode: $mode
    text: $text
    assets: [{{image: {{url: $imageUrl}}}}]
    metadata: {metadata}
  }}) {{
    __typename
    ... on PostActionSuccess {{
      post {{
        id
      }}
    }}
    ... on InvalidInputError {{
      message
    }}
  }}
}}
"""

        variables = {
            "channelId": channel_id,
            "schedulingType": "automatic",
            "mode": "shareNow",
            "text": text,
            "imageUrl": image_url,
        }

        try:
            response = requests.post(
                BUFFER_API_URL,
                headers=self._headers(),
                json={"query": mutation, "variables": variables},
                timeout=30,
            )
            response.raise_for_status()
            result = response.json()

            if "errors" in result:
                error_msg = result["errors"][0].get("message", "Unknown error")
                raise RuntimeError(f"{platform}: {error_msg}")

            data = result.get("data", {}).get("createPost", {})

            if data.get("__typename") == "PostActionSuccess":
                post_id = data.get("post", {}).get("id", "unknown")
                logger.info(f"Published to {platform}: {post_id}")
                return {"success": True, "id": post_id}

            # InvalidInputError or anything else
            error_msg = data.get("message", f"Unexpected response: {data}")
            raise RuntimeError(f"{platform}: {error_msg}")

        except requests.RequestException as e:
            raise RuntimeError(f"{platform}: request failed: {e}")

    def publish_to_all(self, image_url: str, posts: dict) -> dict:
        """Publish a tailored post to every configured platform.

        Each platform is published independently — if one fails, the others
        still go out. Returns a per-platform result map.

        Args:
            image_url: Publicly accessible image URL (shared by all platforms).
            posts: Mapping of platform -> {"text": str, "link_url": Optional[str]}.

        Returns:
            Dict mapping platform -> {"success": bool, "id"/"error": ...}.
        """
        results = {}
        for platform, payload in posts.items():
            channel_id = self.channels.get(platform)
            if not channel_id:
                logger.warning(f"No channel ID configured for {platform}, skipping")
                results[platform] = {"success": False, "error": "no channel ID"}
                continue

            try:
                results[platform] = self.publish_to_channel(
                    platform,
                    channel_id,
                    payload["text"],
                    image_url,
                )
            except RuntimeError as e:
                logger.error(f"Failed to publish to {platform}: {e}")
                results[platform] = {"success": False, "error": str(e)}

        return results
