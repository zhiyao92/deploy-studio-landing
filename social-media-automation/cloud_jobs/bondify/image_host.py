#!/usr/bin/env python3
"""
image_host.py — Uploads rendered graphics to a public URL for Buffer.

Buffer's API requires images to be at a publicly accessible HTTPS URL;
it does not accept direct file uploads. This module uploads to Cloudinary
using an unsigned upload preset (free tier, no SDK needed).

Setup:
  1. Create a free account at https://cloudinary.com
  2. Settings → Upload → Upload presets → Add upload preset
     - Signing mode: Unsigned
     - Note the preset name
  3. Set CLOUDINARY_CLOUD_NAME and CLOUDINARY_UPLOAD_PRESET in .env
"""

import logging
import os
from typing import Optional

import requests

logger = logging.getLogger("image_host")


class ImageHost:
    """Uploads images to Cloudinary and returns their public URL."""

    def __init__(
        self,
        cloud_name: Optional[str] = None,
        upload_preset: Optional[str] = None,
    ):
        """Initialize the image host.

        Args:
            cloud_name: Cloudinary cloud name (from the dashboard)
            upload_preset: Name of an unsigned upload preset
        """
        self.cloud_name = cloud_name or os.environ.get("CLOUDINARY_CLOUD_NAME")
        self.upload_preset = upload_preset or os.environ.get("CLOUDINARY_UPLOAD_PRESET")

        if not self.cloud_name:
            raise EnvironmentError("CLOUDINARY_CLOUD_NAME not set")
        if not self.upload_preset:
            raise EnvironmentError("CLOUDINARY_UPLOAD_PRESET not set")

        self.upload_url = (
            f"https://api.cloudinary.com/v1_1/{self.cloud_name}/image/upload"
        )
        self.video_upload_url = (
            f"https://api.cloudinary.com/v1_1/{self.cloud_name}/video/upload"
        )

    def upload(self, image_bytes: bytes, public_id: Optional[str] = None) -> str:
        """Upload an image and return its public HTTPS URL.

        Args:
            image_bytes: PNG image data
            public_id: Optional stable name for the uploaded asset

        Returns:
            Publicly accessible secure URL of the uploaded image.

        Raises:
            RuntimeError: If the upload fails.
        """
        data = {"upload_preset": self.upload_preset}
        if public_id:
            data["public_id"] = public_id

        response = requests.post(
            self.upload_url,
            data=data,
            files={"file": ("graphic.png", image_bytes, "image/png")},
            timeout=60,
        )

        if response.status_code != 200:
            raise RuntimeError(
                f"Cloudinary upload failed (HTTP {response.status_code}): "
                f"{response.text[:500]}"
            )

        secure_url = response.json().get("secure_url")
        if not secure_url:
            raise RuntimeError(f"Cloudinary response missing secure_url: {response.text[:500]}")

        logger.info(f"Image uploaded: {secure_url}")
        return secure_url

    def upload_video(self, video_bytes: bytes, public_id: Optional[str] = None) -> str:
        """Upload an MP4 video and return its public HTTPS URL.

        Args:
            video_bytes: MP4 video data
            public_id: Optional stable name for the uploaded asset

        Returns:
            Publicly accessible secure URL of the uploaded video.

        Raises:
            RuntimeError: If the upload fails.
        """
        data = {"upload_preset": self.upload_preset}
        if public_id:
            data["public_id"] = public_id

        response = requests.post(
            self.video_upload_url,
            data=data,
            files={"file": ("reel.mp4", video_bytes, "video/mp4")},
            timeout=180,
        )

        if response.status_code != 200:
            raise RuntimeError(
                f"Cloudinary video upload failed (HTTP {response.status_code}): "
                f"{response.text[:500]}"
            )

        secure_url = response.json().get("secure_url")
        if not secure_url:
            raise RuntimeError(
                f"Cloudinary response missing secure_url: {response.text[:500]}"
            )

        logger.info(f"Video uploaded: {secure_url}")
        return secure_url
