#!/usr/bin/env python3
"""
config.py — Centralized configuration management.

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

    # Slack Configuration
    SLACK_BOT_TOKEN = os.environ.get("SLACK_BOT_TOKEN", "")
    SLACK_APPROVAL_CHANNEL = os.environ.get("SLACK_APPROVAL_CHANNEL", "#lds-quotes-drafts")

    # Publishing: images are hosted on GitHub, then published to Instagram,
    # Threads, and Facebook via Buffer.
    BUFFER_API_TOKEN = os.environ.get("BUFFER_API_TOKEN", "")
    GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN", "")

    # Data Configuration
    QUOTES_FILE = Path(__file__).parent / "quotes_data.json"
    GENERATED_DRAFTS_DIR = Path(__file__).parent / "drafts"

    # Marketing Configuration
    APP_STORE_URL = os.environ.get(
        "APP_STORE_URL",
        "https://apps.apple.com/app/apple-store/id1506121689",
    )

    # Apple provider token (pt) for App Store Analytics campaign attribution.
    # The campaign token (ct) is set per-platform at post time.
    APPLE_PROVIDER_TOKEN = os.environ.get("APPLE_PROVIDER_TOKEN", "118418326")

    @classmethod
    def app_store_url(cls, campaign: str) -> str:
        """App Store URL tagged with an App Analytics campaign token.

        Appends `ct=<campaign>` (e.g. "facebook") so App Store Connect →
        App Analytics attributes installs to each platform, plus `pt` when a
        provider token is configured and `mt=8` (App Store media type).

        Args:
            campaign: Campaign token identifying the traffic source.

        Returns:
            The App Store URL with tracking parameters appended.
        """
        from urllib.parse import urlencode

        params = {}
        if cls.APPLE_PROVIDER_TOKEN:
            params["pt"] = cls.APPLE_PROVIDER_TOKEN
        params["ct"] = campaign
        params["mt"] = "8"
        separator = "&" if "?" in cls.APP_STORE_URL else "?"
        return f"{cls.APP_STORE_URL}{separator}{urlencode(params)}"

    # Runtime Configuration
    DEBUG = os.environ.get("DEBUG", "false").lower() == "true"
    DRY_RUN = os.environ.get("DRY_RUN", "false").lower() == "true"

    # GitHub Actions Configuration
    GITHUB_RUN_ID = os.environ.get("GITHUB_RUN_ID", "")
    GITHUB_RUN_NUMBER = os.environ.get("GITHUB_RUN_NUMBER", "")
    GITHUB_SHA = os.environ.get("GITHUB_SHA", "")

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

        # Publishing credentials — not needed for a dry run, which stops
        # before uploading or posting anything.
        if not cls.DRY_RUN:
            if not cls.BUFFER_API_TOKEN:
                errors.append(
                    "BUFFER_API_TOKEN is required to publish (set it as a "
                    "repository secret when running in GitHub Actions)"
                )
            if not cls.GITHUB_TOKEN:
                errors.append(
                    "GITHUB_TOKEN is required to host images for Buffer (in "
                    "GitHub Actions, map a PAT secret to the GITHUB_TOKEN env var)"
                )

        # Quotes file should exist (but agent can generate if missing)
        if not cls.QUOTES_FILE.exists():
            logger.warning(
                f"Quotes file not found at {cls.QUOTES_FILE}; "
                "agent will generate new quotes instead"
            )

        # Create drafts directory if possible (fails gracefully in read-only environments like Vercel)
        try:
            cls.GENERATED_DRAFTS_DIR.mkdir(parents=True, exist_ok=True)
        except OSError as e:
            logger.warning(f"Could not create drafts directory (read-only filesystem?): {e}")

        return errors

    @classmethod
    def log_config(cls) -> None:
        """Log current configuration (secrets are masked)."""
        logger.info("Configuration:")
        logger.info(f"  LLM Model: {cls.LLM_MODEL}")
        logger.info(f"  Slack Channel: {cls.SLACK_APPROVAL_CHANNEL}")
        logger.info("  Publishing: Buffer → Instagram, Threads, Facebook")
        logger.info(f"  Debug: {cls.DEBUG}")
        logger.info(f"  Dry Run: {cls.DRY_RUN}")
