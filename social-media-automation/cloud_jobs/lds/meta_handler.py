#!/usr/bin/env python3
"""
meta_handler.py — Publishes approved posts to Meta platforms (Instagram, Facebook, Threads).

Uses the Meta Graph API to post to Instagram, Facebook Group, and Threads.
Requires access token with permissions: instagram_basic, instagram_content_publish,
pages_manage_posts, pages_read_engagement.
"""

import logging
import os
from typing import Optional

import requests

logger = logging.getLogger("meta_handler")


class MetaGraphHandler:
    """Manages publishing to Meta platforms via Graph API."""

    def __init__(self, access_token: Optional[str] = None):
        """Initialize Meta Graph handler.

        Args:
            access_token: Meta Graph API access token
                         (defaults to META_ACCESS_TOKEN env var).
        """
        self.access_token = access_token or os.environ.get("META_ACCESS_TOKEN")
        if not self.access_token:
            raise EnvironmentError("META_ACCESS_TOKEN not set")

        self.instagram_business_account_id = os.environ.get(
            "INSTAGRAM_BUSINESS_ACCOUNT_ID"
        )
        self.facebook_page_id = os.environ.get("FACEBOOK_PAGE_ID")
        self.threads_account_id = os.environ.get("THREADS_ACCOUNT_ID")

        self.graph_api_base = "https://graph.instagram.com"
        self.graph_api_base_v = f"{self.graph_api_base}/v18.0"

    def publish_to_instagram(
        self,
        image_url: str,
        caption: str,
    ) -> dict:
        """Publish image and caption to Instagram.

        Instagram requires a two-step process:
        1. Create a media object
        2. Publish the media

        Args:
            image_url: URL to the image (must be publicly accessible).
            caption: Caption text for the post.

        Returns:
            Dict with 'id' (post ID) and 'status'.

        Raises:
            RuntimeError: If publishing fails.
        """
        if not self.instagram_business_account_id:
            raise EnvironmentError("INSTAGRAM_BUSINESS_ACCOUNT_ID not configured")

        try:
            # Step 1: Create media container
            media_id = self._create_instagram_media_container(image_url, caption)

            # Step 2: Publish the media container
            post_id = self._publish_instagram_media_container(media_id)

            logger.info(f"Published to Instagram: {post_id}")
            return {
                "id": post_id,
                "status": "published",
                "platform": "instagram",
            }

        except Exception as e:
            logger.error(f"Failed to publish to Instagram: {e}")
            raise RuntimeError(f"Instagram publishing failed: {e}")

    def _create_instagram_media_container(self, image_url: str, caption: str) -> str:
        """Create a media container for Instagram publishing.

        Args:
            image_url: URL to image.
            caption: Caption text.

        Returns:
            Media container ID.

        Raises:
            RuntimeError: If creation fails.
        """
        url = (
            f"{self.graph_api_base_v}/{self.instagram_business_account_id}"
            "/media"
        )

        params = {
            "access_token": self.access_token,
            "image_url": image_url,
            "caption": caption,
            "user_tags": "[]",
        }

        try:
            resp = requests.post(url, params=params, timeout=30)
            resp.raise_for_status()
            result = resp.json()

            if "id" not in result:
                raise RuntimeError(f"Failed to create media container: {result}")

            return result["id"]

        except requests.RequestException as e:
            raise RuntimeError(f"Media container creation failed: {e}")

    def _publish_instagram_media_container(self, media_id: str) -> str:
        """Publish a media container to Instagram.

        Args:
            media_id: Media container ID from creation step.

        Returns:
            Published media ID.

        Raises:
            RuntimeError: If publish fails.
        """
        url = (
            f"{self.graph_api_base_v}/{self.instagram_business_account_id}"
            "/media_publish"
        )

        params = {
            "access_token": self.access_token,
            "creation_id": media_id,
        }

        try:
            resp = requests.post(url, params=params, timeout=30)
            resp.raise_for_status()
            result = resp.json()

            if "id" not in result:
                raise RuntimeError(f"Failed to publish media: {result}")

            return result["id"]

        except requests.RequestException as e:
            raise RuntimeError(f"Media publish failed: {e}")

    def publish_to_facebook_group(
        self,
        image_url: str,
        caption: str,
    ) -> dict:
        """Publish image and caption to Facebook group.

        Args:
            image_url: URL to the image.
            caption: Caption text.

        Returns:
            Dict with 'id' (post ID) and 'status'.

        Raises:
            RuntimeError: If publishing fails.
        """
        if not self.facebook_page_id:
            raise EnvironmentError("FACEBOOK_PAGE_ID not configured")

        url = f"{self.graph_api_base_v}/{self.facebook_page_id}/feed"

        params = {
            "access_token": self.access_token,
            "message": caption,
            "link": image_url,
        }

        try:
            resp = requests.post(url, params=params, timeout=30)
            resp.raise_for_status()
            result = resp.json()

            if "id" not in result:
                raise RuntimeError(f"Failed to publish to Facebook: {result}")

            logger.info(f"Published to Facebook: {result['id']}")
            return {
                "id": result["id"],
                "status": "published",
                "platform": "facebook",
            }

        except requests.RequestException as e:
            logger.error(f"Failed to publish to Facebook: {e}")
            raise RuntimeError(f"Facebook publishing failed: {e}")

    def publish_to_threads(
        self,
        caption: str,
    ) -> dict:
        """Publish caption to Threads.

        Threads doesn't support image attachments via the Graph API yet,
        so we post text-only with a note about the image.

        Args:
            caption: Caption text.

        Returns:
            Dict with 'id' (post ID) and 'status'.

        Raises:
            RuntimeError: If publishing fails.
        """
        if not self.threads_account_id:
            raise EnvironmentError("THREADS_ACCOUNT_ID not configured")

        url = (
            f"{self.graph_api_base_v}/{self.threads_account_id}/threads"
        )

        # Threads caps posts at 500 characters. Add the Instagram note only
        # if it fits; as a last resort truncate the caption itself.
        note = "\n\n(See Instagram @lds.quotes.official for the graphic)"
        if len(caption) + len(note) <= 500:
            text = f"{caption}{note}"
        elif len(caption) <= 500:
            text = caption
        else:
            text = caption[:499].rstrip() + "…"

        params = {
            "access_token": self.access_token,
            "text": text,
        }

        try:
            resp = requests.post(url, params=params, timeout=30)
            resp.raise_for_status()
            result = resp.json()

            if "id" not in result:
                raise RuntimeError(f"Failed to publish to Threads: {result}")

            logger.info(f"Published to Threads: {result['id']}")
            return {
                "id": result["id"],
                "status": "published",
                "platform": "threads",
            }

        except requests.RequestException as e:
            logger.error(f"Failed to publish to Threads: {e}")
            raise RuntimeError(f"Threads publishing failed: {e}")

    def publish_all(
        self,
        image_url: str,
        caption: str,
        platforms: Optional[list[str]] = None,
    ) -> dict:
        """Publish to all configured platforms.

        Args:
            image_url: URL to image.
            caption: Caption text.
            platforms: List of platforms to publish to.
                      Defaults to ["instagram", "facebook", "threads"].

        Returns:
            Dict mapping platform -> result dict with 'id', 'status', 'error'.
        """
        if platforms is None:
            platforms = ["instagram", "facebook", "threads"]

        results = {}

        for platform in platforms:
            try:
                if platform == "instagram":
                    results["instagram"] = self.publish_to_instagram(image_url, caption)
                elif platform == "facebook":
                    results["facebook"] = self.publish_to_facebook_group(
                        image_url, caption
                    )
                elif platform == "threads":
                    results["threads"] = self.publish_to_threads(caption)
            except RuntimeError as e:
                logger.error(f"Failed to publish to {platform}: {e}")
                results[platform] = {
                    "status": "error",
                    "error": str(e),
                    "platform": platform,
                }

        return results
