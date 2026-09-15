#!/usr/bin/env python3
"""
agent.py — Bondify Social Agent.

Complete pipeline:
  1. Fetch a random quote from LDS Quotes API
  2. Generate Instagram caption and hashtags (max 5)
  3. Render 1080x1350px (4:5 portrait) graphic with gradient background
  4. Post to Slack for approval (if required)
  5. Publish directly to Instagram (if auto-publishing enabled)
  6. [Choose different] button re-runs with new quote

Supports both approval-first workflow (Slack → Instagram) and
direct auto-publishing to Instagram.
"""

# Load environment variables FIRST before any other imports
from dotenv import load_dotenv

load_dotenv()

import json
import logging
import os
import sys
from datetime import datetime
from io import BytesIO
from pathlib import Path
from typing import Optional

from config import Config
from caption_generator import CaptionGenerator
from graphics_engine import QuoteGraphicsEngine
from instagram_handler import InstagramHandler
from lds_quotes_client import LDSQuotesClient, Quote
from slack_handler import SlackHandler

logging.basicConfig(
    level=logging.DEBUG if Config.DEBUG else logging.INFO,
    format="%(asctime)s [%(name)s] [%(levelname)s] %(message)s",
)
logger = logging.getLogger("agent")


class BondifySocialPipeline:
    """Orchestrates the Bondify Social quote publishing pipeline."""

    def __init__(self):
        """Initialize the pipeline."""
        # Validate configuration
        errors = Config.validate()
        if errors:
            for error in errors:
                logger.error(f"Configuration error: {error}")
            raise EnvironmentError("Configuration validation failed")

        Config.log_config()

        # Initialize clients
        self.quotes_client = LDSQuotesClient(
            api_url=Config.LDS_QUOTES_API_URL,
            api_key=Config.LDS_QUOTES_API_KEY,
        )
        self.caption_gen = CaptionGenerator(model=Config.LLM_MODEL)
        self.graphics_engine = QuoteGraphicsEngine()
        self.slack = SlackHandler(bot_token=Config.SLACK_BOT_TOKEN)

        # Initialize Instagram handler if auto-publishing is enabled
        if Config.AUTO_PUBLISH_INSTAGRAM:
            self.instagram = InstagramHandler(
                access_token=Config.META_ACCESS_TOKEN,
                business_account_id=Config.INSTAGRAM_BUSINESS_ACCOUNT_ID,
            )
        else:
            self.instagram = None

    def run(self, exclude_quote_id: Optional[str] = None) -> int:
        """Run the publishing pipeline.

        Args:
            exclude_quote_id: If set (from "Choose different" button),
                pick a random quote that is NOT this one.

        Returns:
            0 on success, 1 on failure.
        """
        try:
            # Step 1: Get quote
            quote = self._get_quote(exclude_id=exclude_quote_id)
            logger.info(f"Selected quote {quote.id} by {quote.author}")

            # Step 2: Generate caption
            full_caption = self.caption_gen.generate_full_instagram_caption(
                quote_text=quote.text,
                author=quote.author,
                category=quote.category,
                app_store_url=Config.BONDIFY_APP_STORE_URL,
            )
            logger.info(f"Generated caption ({len(full_caption)} chars)")

            # Step 3: Render graphic
            graphic_bytes = self.graphics_engine.render(
                quote_text=quote.text,
                author_name=quote.author,
            )
            logger.info(f"Rendered graphic ({len(graphic_bytes.getvalue())} bytes)")

            # Step 4: Save draft
            self._save_draft(quote, full_caption, graphic_bytes)

            # Step 5: Handle based on workflow
            if Config.DRY_RUN:
                logger.info("[DRY RUN] Would post to Slack and/or Instagram")
                return 0

            if Config.REQUIRE_SLACK_APPROVAL:
                # Workflow 1: Post to Slack for approval
                logger.info("Posting to Slack for approval...")
                self.slack.post_draft_for_approval(
                    image_bytes=graphic_bytes.getvalue(),
                    caption=full_caption,
                    quote_id=quote.id,
                    quote_text=quote.text,
                    author=quote.author,
                    category=quote.category,
                )
                logger.info("Posted to Slack. Waiting for approval...")

            else:
                # Workflow 2: Auto-publish to Instagram directly
                logger.info("Auto-publishing to Instagram...")
                result = self.instagram.publish(
                    image_bytes=graphic_bytes.getvalue(),
                    caption=full_caption,
                )
                logger.info(f"Published to Instagram: {result['id']}")
                self.slack.post_status_update(
                    status="success",
                    message=f"Published quote {quote.id} to Instagram",
                    quote_id=quote.id,
                )

            return 0

        except Exception as e:
            logger.exception("Pipeline failed")
            try:
                self.slack.post_status_update(
                    status="error",
                    message=f"Publishing failed: {str(e)}",
                    quote_id="unknown",
                )
            except Exception as slack_err:
                logger.error(f"Could not notify Slack of error: {slack_err}")
            return 1

    def _get_quote(self, exclude_id: Optional[str] = None) -> Quote:
        """Get a quote from LDS Quotes API.

        Args:
            exclude_id: If set, pick a random quote other than this one.

        Returns:
            Quote object

        Raises:
            RuntimeError: If no quote can be obtained.
        """
        try:
            if exclude_id:
                logger.info(f"Getting different quote (excluding {exclude_id})...")
                quote = self.quotes_client.get_random_quote()
                while quote.id == exclude_id:
                    quote = self.quotes_client.get_random_quote()
                return quote
            else:
                logger.info("Getting daily quote...")
                return self.quotes_client.get_daily_quote()

        except Exception as e:
            logger.error(f"Failed to get quote: {e}")
            raise RuntimeError(f"Quote fetch failed: {e}")

    def _save_draft(
        self,
        quote: Quote,
        caption: str,
        graphic_bytes: BytesIO,
    ) -> None:
        """Save draft to disk for records.

        Args:
            quote: Quote object
            caption: Generated caption
            graphic_bytes: Image data
        """
        try:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            draft_dir = Config.DRAFTS_DIR / timestamp
            draft_dir.mkdir(parents=True, exist_ok=True)

            # Save metadata
            metadata = {
                "quote_id": quote.id,
                "author": quote.author,
                "category": quote.category,
                "quote_text": quote.text,
                "caption": caption,
                "timestamp": timestamp,
            }
            with open(draft_dir / "metadata.json", "w") as f:
                json.dump(metadata, f, indent=2)

            # Save image
            with open(draft_dir / "graphic.png", "wb") as f:
                f.write(graphic_bytes.getvalue())

            logger.info(f"Saved draft to {draft_dir}")

        except Exception as e:
            logger.warning(f"Could not save draft: {e}")


def main():
    """Main entry point."""
    pipeline = BondifySocialPipeline()

    # Check for arguments
    exclude_id = None
    if len(sys.argv) > 1:
        exclude_id = sys.argv[1]

    return pipeline.run(exclude_quote_id=exclude_id)


if __name__ == "__main__":
    sys.exit(main())
