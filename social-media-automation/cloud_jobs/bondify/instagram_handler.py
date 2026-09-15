#!/usr/bin/env python3
"""
instagram_handler.py — Publishes posts directly to Instagram via Meta Graph API.

Handles automatic publishing to Instagram Business Account.
"""

import io
import logging
import os
import requests
import tempfile
from pathlib import Path
from typing import Optional

logger = logging.getLogger("instagram_handler")


class InstagramHandler:
    """Manages publishing to Instagram via Meta Graph API."""

    def __init__(
        self,
        access_token: Optional[str] = None,
        business_account_id: Optional[str] = None,
    ):
        """Initialize Instagram handler.

        Args:
            access_token: Meta Graph API access token
            business_account_id: Instagram Business Account ID
        """
        self.access_token = access_token or os.environ.get("META_ACCESS_TOKEN")
        self.business_account_id = business_account_id or os.environ.get(
            "INSTAGRAM_BUSINESS_ACCOUNT_ID"
        )

        if not self.access_token:
            raise EnvironmentError("META_ACCESS_TOKEN not set")
        if not self.business_account_id:
            raise EnvironmentError("INSTAGRAM_BUSINESS_ACCOUNT_ID not set")

        self.graph_api_base = "https://graph.instagram.com/v18.0"

    def publish(
        self,
        image_bytes: bytes,
        caption: str,
    ) -> dict:
        """Publish image and caption to Instagram.

        Instagram requires a two-step process:
        1. Create a media object
        2. Publish the media

        Args:
            image_bytes: PNG image data as bytes
            caption: Caption text for the post

        Returns:
            Dict with 'id' (post ID), 'status', and 'platform'

        Raises:
            RuntimeError: If publishing fails
        """
        try:
            logger.info(f"Publishing to Instagram ({len(image_bytes)} bytes)")

            # Upload image to temporary location to get a URL
            image_url = self._upload_image_temp(image_bytes)
            logger.info(f"Image uploaded temporarily: {image_url}")

            # Step 1: Create media container
            media_id = self._create_media_container(image_url, caption)
            logger.info(f"Created media container: {media_id}")

            # Step 2: Publish the media
            post_id = self._publish_media_container(media_id)
            logger.info(f"Published to Instagram: {post_id}")

            return {
                "id": post_id,
                "status": "published",
                "platform": "instagram",
            }

        except Exception as e:
            logger.error(f"Failed to publish to Instagram: {e}")
            raise RuntimeError(f"Instagram publishing failed: {e}")

    def _upload_image_temp(self, image_bytes: bytes) -> str:
        """Upload image to temporary hosting for Meta Graph API.

        For production, use a real CDN (S3, Cloudinary, etc).
        For testing, we'll encode as data URI or use a temp file.

        Args:
            image_bytes: Image data as bytes

        Returns:
            URL to the image
        """
        # For production deployment, you'd upload to S3/Cloudinary and return the URL
        # For now, we'll use a simple approach: write to temp file and serve via local URL
        # In a real scenario, this would be replaced with:
        # - Upload to S3: boto3 s3 client
        # - Return CloudFront CDN URL
        # - Or use Cloudinary API

        try:
            # Write to a temporary location
            with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp:
                tmp.write(image_bytes)
                tmp_path = tmp.name

            # In a serverless environment, you'd upload to S3 here
            # For local testing, just return a placeholder or use base64
            logger.warning(
                "Using local temp file for image. "
                "In production, upload to S3/Cloudinary instead."
            )

            # Return a data URI for testing
            import base64

            b64_image = base64.b64encode(image_bytes).decode("utf-8")
            # Note: Meta Graph API requires a publicly accessible HTTPS URL
            # This is just for development. Use S3 in production.
            return f"data:image/png;base64,{b64_image}"

        except Exception as e:
            logger.error(f"Failed to upload temp image: {e}")
            raise

    def _create_media_container(self, image_url: str, caption: str) -> str:
        """Create a media container for Instagram publishing.

        Args:
            image_url: URL to image (must be publicly accessible)
            caption: Caption text

        Returns:
            Media container ID

        Raises:
            RuntimeError: If creation fails
        """
        url = f"{self.graph_api_base}/{self.business_account_id}/media"

        payload = {
            "image_url": image_url,
            "caption": caption,
            "access_token": self.access_token,
        }

        try:
            resp = requests.post(url, data=payload, timeout=30)
            resp.raise_for_status()
            data = resp.json()

            if "id" not in data:
                raise RuntimeError(f"Meta API error: {data.get('error', {}).get('message')}")

            return data["id"]

        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to create media container: {e}")
            raise RuntimeError(f"Meta Graph API error: {e}")

    def _publish_media_container(self, media_id: str) -> str:
        """Publish the media container to make it live.

        Args:
            media_id: Media container ID

        Returns:
            Instagram post ID

        Raises:
            RuntimeError: If publishing fails
        """
        url = f"{self.graph_api_base}/{self.business_account_id}/media_publish"

        payload = {
            "creation_id": media_id,
            "access_token": self.access_token,
        }

        try:
            resp = requests.post(url, data=payload, timeout=30)
            resp.raise_for_status()
            data = resp.json()

            if "id" not in data:
                raise RuntimeError(f"Meta API error: {data.get('error', {}).get('message')}")

            return data["id"]

        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to publish media container: {e}")
            raise RuntimeError(f"Meta Graph API error: {e}")
