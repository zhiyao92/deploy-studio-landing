#!/usr/bin/env python3
"""
buffer_handler.py — Publishes posts to Instagram via the Buffer API.

Buffer's API is GraphQL (https://api.buffer.com) authenticated with a
personal access key (Settings → API → Personal Keys in Buffer).

Buffer cannot accept direct file uploads — images must already be at a
publicly accessible URL (see image_host.py for Cloudinary upload).
"""

import logging
import os
from typing import Optional

import requests

logger = logging.getLogger("buffer_handler")

BUFFER_API_URL = "https://api.buffer.com"


class BufferHandler:
    """Manages publishing to Instagram (or any channel) via the Buffer API."""

    def __init__(
        self,
        access_token: Optional[str] = None,
        channel_id: Optional[str] = None,
    ):
        """Initialize Buffer handler.

        Args:
            access_token: Buffer personal API key
            channel_id: Buffer channel ID to post to (find it with setup_buffer.py).
                        If not set, the first Instagram channel is auto-discovered.
        """
        self.access_token = access_token or os.environ.get("BUFFER_ACCESS_TOKEN")
        self.channel_id = channel_id or os.environ.get("BUFFER_CHANNEL_ID")

        if not self.access_token:
            raise EnvironmentError("BUFFER_ACCESS_TOKEN not set")

    def _graphql(self, query: str, variables: Optional[dict] = None) -> dict:
        """Execute a GraphQL request against the Buffer API.

        Args:
            query: GraphQL query or mutation
            variables: Optional GraphQL variables

        Returns:
            The "data" object of the response.

        Raises:
            RuntimeError: On HTTP or GraphQL errors.
        """
        response = requests.post(
            BUFFER_API_URL,
            json={"query": query, "variables": variables or {}},
            headers={
                "Authorization": f"Bearer {self.access_token}",
                "Content-Type": "application/json",
            },
            timeout=30,
        )

        if response.status_code != 200:
            raise RuntimeError(
                f"Buffer API HTTP {response.status_code}: {response.text[:500]}"
            )

        body = response.json()
        if body.get("errors"):
            raise RuntimeError(f"Buffer API error: {body['errors']}")

        return body.get("data", {})

    def get_organization_id(self) -> str:
        """Get the first organization ID for the authenticated account."""
        data = self._graphql(
            """
            query GetAccount {
              account {
                id
                organizations {
                  id
                  name
                }
              }
            }
            """
        )
        organizations = (data.get("account") or {}).get("organizations") or []
        if not organizations:
            raise RuntimeError("No Buffer organizations found for this account")
        return organizations[0]["id"]

    def get_channels(self) -> list[dict]:
        """List all channels (connected social accounts) in the organization.

        Returns:
            List of channel dicts with id, name, service, displayName.
        """
        org_id = self.get_organization_id()
        data = self._graphql(
            """
            query GetChannels($input: ChannelsInput!) {
              channels(input: $input) {
                id
                name
                displayName
                service
                isQueuePaused
              }
            }
            """,
            {"input": {"organizationId": org_id}},
        )
        return data.get("channels") or []

    def _resolve_channel_id(self) -> str:
        """Resolve the target channel ID, auto-discovering Instagram if unset."""
        if self.channel_id:
            return self.channel_id

        channels = self.get_channels()
        instagram_channels = [
            c for c in channels if c.get("service", "").lower() == "instagram"
        ]

        if not instagram_channels:
            available = [f"{c['service']}:{c['id']}" for c in channels]
            raise RuntimeError(
                f"No Instagram channel connected in Buffer. "
                f"Available channels: {available or 'none'}. "
                f"Connect Instagram at https://buffer.com, or set BUFFER_CHANNEL_ID."
            )

        self.channel_id = instagram_channels[0]["id"]
        logger.info(
            f"Auto-discovered Instagram channel: "
            f"{instagram_channels[0].get('displayName')} ({self.channel_id})"
        )
        return self.channel_id

    def publish(
        self,
        caption: str,
        image_url: Optional[str] = None,
        image_urls: Optional[list[str]] = None,
        video_url: Optional[str] = None,
        share_now: bool = True,
    ) -> dict:
        """Create a post on the Buffer channel.

        Exactly one of image_url (single image), image_urls (carousel), or
        video_url (reel) must be provided.

        Args:
            caption: Caption text for the post
            image_url: Public HTTPS URL of a single image
            image_urls: Public HTTPS URLs for a multi-image carousel
            video_url: Public HTTPS URL of an MP4 — published as a reel
            share_now: If True, publish immediately; otherwise add to the
                       Buffer queue (published at the next queue slot).

        Returns:
            Dict with the Buffer post "id" and "status".
        """
        channel_id = self._resolve_channel_id()
        mode = "shareNow" if share_now else "addToQueue"

        if video_url:
            assets = [
                {"video": {"url": video_url, "metadata": {"thumbnailOffset": 2000}}}
            ]
            ig_type = "reel"
        elif image_urls:
            assets = [{"image": {"url": u}} for u in image_urls]
            ig_type = "post"
        elif image_url:
            assets = [{"image": {"url": image_url}}]
            ig_type = "post"
        else:
            raise ValueError("publish() needs image_url, image_urls, or video_url")

        data = self._graphql(
            """
            mutation CreatePost($input: CreatePostInput!) {
              createPost(input: $input) {
                ... on PostActionSuccess {
                  post {
                    id
                    status
                  }
                }
                ... on MutationError {
                  message
                }
              }
            }
            """,
            {
                "input": {
                    "channelId": channel_id,
                    "text": caption,
                    "mode": mode,
                    "schedulingType": "automatic",
                    "assets": assets,
                    # Instagram requires a content type: post, story, or reel
                    "metadata": {
                        "instagram": {"type": ig_type, "shouldShareToFeed": True}
                    },
                }
            },
        )

        result = data.get("createPost") or {}
        if result.get("message"):
            raise RuntimeError(f"Buffer createPost failed: {result['message']}")

        post = result.get("post")
        if not post:
            raise RuntimeError(f"Buffer createPost returned no post: {result}")

        logger.info(f"Buffer post created: {post['id']} (status: {post.get('status')})")
        return post
