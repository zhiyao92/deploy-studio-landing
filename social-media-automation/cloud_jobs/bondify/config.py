#!/usr/bin/env python3
"""
config.py — Centralized configuration management for Bondify Social.

All configuration comes from environment variables. This module validates
and provides typed access to configuration.
"""

import logging
import os
from pathlib import Path
from typing import Optional

logger = logging.getLogger("config")


class Config:
    """Application configuration from environment variables."""

    # LLM Configuration
    ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY", "")
    LLM_MODEL = os.environ.get("LLM_MODEL", "claude-opus-4-8")

    # LDS Quotes API Configuration
    LDS_QUOTES_API_URL = os.environ.get(
        "LDS_QUOTES_API_URL",
        "https://api.ldsquotes.com",
    )
    LDS_QUOTES_API_KEY = os.environ.get("LDS_QUOTES_API_KEY", "")

    # Slack Configuration
    SLACK_BOT_TOKEN = os.environ.get("SLACK_BOT_TOKEN", "")
    SLACK_APPROVAL_CHANNEL = os.environ.get("SLACK_APPROVAL_CHANNEL", "#bondify-drafts")

    # Buffer Configuration (Instagram publishing)
    BUFFER_ACCESS_TOKEN = os.environ.get("BUFFER_ACCESS_TOKEN", "")
    BUFFER_CHANNEL_ID = os.environ.get("BUFFER_CHANNEL_ID", "")

    # Cloudinary Configuration (public image hosting for Buffer)
    CLOUDINARY_CLOUD_NAME = os.environ.get("CLOUDINARY_CLOUD_NAME", "")
    CLOUDINARY_UPLOAD_PRESET = os.environ.get("CLOUDINARY_UPLOAD_PRESET", "")

    # Legacy Instagram Configuration (Meta Graph API — superseded by Buffer)
    META_ACCESS_TOKEN = os.environ.get("META_ACCESS_TOKEN", "")
    INSTAGRAM_BUSINESS_ACCOUNT_ID = os.environ.get("INSTAGRAM_BUSINESS_ACCOUNT_ID", "")

    # Publishing Configuration
    AUTO_PUBLISH_INSTAGRAM = os.environ.get("AUTO_PUBLISH_INSTAGRAM", "false").lower() == "true"
    REQUIRE_SLACK_APPROVAL = os.environ.get("REQUIRE_SLACK_APPROVAL", "true").lower() == "true"

    # Data Configuration
    DRAFTS_DIR = Path(__file__).parent / "drafts"
    LOGS_DIR = Path(__file__).parent / "logs"

    # Bondify App Configuration
    BONDIFY_APP_STORE_URL = os.environ.get(
        "BONDIFY_APP_STORE_URL",
        "https://apps.apple.com/app/bondify/id1234567890",
    )

    # Runtime Configuration
    DEBUG = os.environ.get("DEBUG", "false").lower() == "true"
    DRY_RUN = os.environ.get("DRY_RUN", "false").lower() == "true"

    @classmethod
    def validate(cls) -> list[str]:
        """Validate configuration.

        Returns:
            List of validation errors (empty if all required vars are set).
        """
        errors = []

        # Core requirements
        if not cls.SLACK_BOT_TOKEN:
            errors.append("SLACK_BOT_TOKEN is required")

        if not cls.ANTHROPIC_API_KEY:
            errors.append("ANTHROPIC_API_KEY is required")

        # Instagram requirements via Buffer (if auto-publishing)
        if cls.AUTO_PUBLISH_INSTAGRAM:
            if not cls.BUFFER_ACCESS_TOKEN:
                errors.append("BUFFER_ACCESS_TOKEN is required for Instagram publishing")
            if not cls.CLOUDINARY_CLOUD_NAME:
                errors.append("CLOUDINARY_CLOUD_NAME is required to host images for Buffer")
            if not cls.CLOUDINARY_UPLOAD_PRESET:
                errors.append("CLOUDINARY_UPLOAD_PRESET is required to host images for Buffer")

        # Create directories if possible
        try:
            cls.DRAFTS_DIR.mkdir(parents=True, exist_ok=True)
            cls.LOGS_DIR.mkdir(parents=True, exist_ok=True)
        except OSError as e:
            logger.warning(f"Could not create directories (read-only filesystem?): {e}")

        return errors

    @classmethod
    def log_config(cls) -> None:
        """Log current configuration (secrets are masked)."""
        logger.info("=" * 60)
        logger.info("Bondify Social Configuration")
        logger.info("=" * 60)
        logger.info(f"LLM Model: {cls.LLM_MODEL}")
        logger.info(f"LDS Quotes API: {cls.LDS_QUOTES_API_URL}")
        logger.info(f"Slack Channel: {cls.SLACK_APPROVAL_CHANNEL}")
        logger.info(f"Buffer channel ID: {cls.BUFFER_CHANNEL_ID or '(auto-discover Instagram)'}")
        logger.info(f"Auto-publish to Instagram: {cls.AUTO_PUBLISH_INSTAGRAM}")
        logger.info(f"Require Slack approval: {cls.REQUIRE_SLACK_APPROVAL}")
        logger.info(f"Debug mode: {cls.DEBUG}")
        logger.info(f"Dry run mode: {cls.DRY_RUN}")
        logger.info("=" * 60)
