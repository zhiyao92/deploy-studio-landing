#!/usr/bin/env python3
"""
agent.py — LDS Quotes Daily Inspiration Agent.

Complete pipeline:
  1. Select a quote (deterministic daily pick from quotes_data.json)
  2. Generate Instagram caption and hashtags (max 5)
  3. Render 1080x1350px (4:5 portrait) graphic with random gradient background
  4. Post to Slack with a copy-ready caption
  5. [Choose a different one] button re-runs the pipeline with a new quote

Publishing to Instagram is manual: copy the image + caption from Slack.
"""

# Load environment variables from .env file FIRST before any other imports
from dotenv import load_dotenv
load_dotenv()

import json
import logging
import os
import random
import requests
import sys
from datetime import date
from io import BytesIO
from pathlib import Path
from typing import Optional

from buffer_handler import BufferHandler
from config import Config
from github_image_handler import GitHubImageHandler
from graphics_engine import QuoteGraphicsEngine
from quote_generator import CaptionGenerator, Quote, QuoteRepository
from slack_handler import SlackHandler, SlackPostError

logging.basicConfig(
    level=logging.DEBUG if Config.DEBUG else logging.INFO,
    format="%(asctime)s [%(name)s] [%(levelname)s] %(message)s",
)
logger = logging.getLogger("agent")

# Soft CTA variants. The account should earn followers through useful spiritual
# content first; app promotion is intentionally occasional and gentle.
CTA_VARIANTS = [
    "Save this for a harder morning.",
    "Share this with someone who needs a gentle reminder today.",
    "Keep this close for your next quiet moment.",
    "For more daily reminders, the LDS Quotes app is free — link in bio.",
    "Save it now, come back to it later.",
]


def annotate_error(message: str) -> None:
    """Surface an error as a GitHub Actions annotation.

    Log lines are easy to miss on a green run; annotations show at the top of
    the run summary. No-op outside Actions.
    """
    if os.environ.get("GITHUB_ACTIONS") == "true":
        # Newlines would end the workflow command early.
        print(f"::error::{message}".replace("\n", " "), flush=True)


class QuotePipeline:
    """Orchestrates the complete quote generation and approval pipeline."""

    def __init__(self):
        """Initialize the pipeline."""
        # Validate configuration
        errors = Config.validate()
        if errors:
            for error in errors:
                logger.error(f"Configuration error: {error}")
            raise EnvironmentError("Configuration validation failed")

        Config.log_config()

        self.quote_repo = QuoteRepository(Config.QUOTES_FILE)
        self.caption_gen = CaptionGenerator(model=Config.LLM_MODEL)
        self.graphics_engine = QuoteGraphicsEngine()
        self.slack = SlackHandler(bot_token=Config.SLACK_BOT_TOKEN)
        # Publishing handlers aren't needed for a dry run, which stops before
        # uploading or posting — so don't require their credentials then.
        if Config.DRY_RUN:
            self.github = None
            self.buffer = None
        else:
            self.github = GitHubImageHandler(
                github_token=Config.GITHUB_TOKEN,
                github_username=os.environ.get("GITHUB_USERNAME"),
                repo_name=os.environ.get("GITHUB_REPO", "lds-quotes-images"),
            )
            self.buffer = BufferHandler(api_token=Config.BUFFER_API_TOKEN)

    def run(self, exclude_quote_id: Optional[str] = None) -> int:
        """Run the pipeline.

        Args:
            exclude_quote_id: If set (from the "Choose a different one"
                button), pick a random quote that is NOT this one instead
                of the deterministic daily pick.

        Returns:
            0 on success, 1 on failure.
        """
        try:
            # Step 1: Get or generate quote
            quote = self._get_quote(exclude_id=exclude_quote_id)
            logger.info(f"Selected quote {quote.id} by {quote.speaker}")

            # Step 2: Generate caption and hashtags (hard cap of 5 hashtags)
            caption_data = self.caption_gen.generate_caption_and_hashtags(quote)
            caption = caption_data["caption"]
            hashtags = caption_data["hashtags"][:5]
            # Build a tailored post per platform. The quote text lives on the
            # graphic, so no caption repeats it.
            hashtag_str = " ".join(hashtags)

            # Instagram: caption links aren't clickable, so keep the rotating
            # "link in bio" CTA in the body and no raw URL.
            # The caption generator supplies exactly one action. Do not append
            # another CTA or habitual app promotion.
            attribution = (
                "— Original devotional reflection"
                if quote.source.lower().startswith("original")
                else f"— {quote.speaker}, {quote.source}".rstrip(", ")
            )
            instagram_text = f"{caption.strip()}\n\n{attribution}\n\n{hashtag_str}".rstrip()

            # Threads & Facebook: links in the body ARE clickable (unlike
            # Instagram), so append the campaign-tagged download link. Each
            # platform gets its own `ct` token for install attribution.
            threads_link = (
                "📱 Get the app (free):\n" f"{Config.app_store_url('thread')}"
            )
            facebook_link = (
                "📱 Get the LDS Quotes app — free daily inspiration:\n"
                f"{Config.app_store_url('facebook')}"
            )

            # Threads caps posts at 500 chars; trim hashtags first if needed so
            # the link always survives.
            threads_tags = list(hashtags)
            threads_text = (
                f"{caption}\n\n{' '.join(threads_tags)}\n\n{threads_link}".rstrip()
            )
            while len(threads_text) > 500 and threads_tags:
                threads_tags = threads_tags[:-1]
                threads_text = (
                    f"{caption}\n\n{' '.join(threads_tags)}\n\n{threads_link}".rstrip()
                )

            facebook_text = f"{caption}\n\n{hashtag_str}\n\n{facebook_link}".rstrip()

            posts = {
                "instagram": {"text": instagram_text},
                "threads": {"text": threads_text},
                "facebook": {"text": facebook_text},
            }

            logger.info(
                f"Built captions — IG: {len(instagram_text)}, "
                f"Threads: {len(threads_text)}, FB: {len(facebook_text)} chars"
            )

            # Step 3: Render graphic
            graphic_bytes = self.graphics_engine.render(
                quote_text=quote.text,
                author_name=quote.speaker,
            )

            logger.info(f"Rendered graphic ({len(graphic_bytes.getvalue())} bytes)")

            # Step 4: Save draft for records
            self._save_draft(quote, caption, hashtags, graphic_bytes)

            if Config.DRY_RUN:
                logger.info("[DRY RUN] Would upload to GitHub and post to Buffer")
                # Still exercise Slack: a dry run is how the channel wiring
                # gets verified without publishing anything to social.
                return self._post_status(
                    status="amended",
                    message=(
                        "[DRY RUN] Nothing was published — would have posted "
                        f"'{quote.speaker}' to Instagram, Threads, and Facebook"
                    ),
                    quote_id=quote.id,
                )

            # Step 5: Upload image to GitHub
            filename = f"quote_{quote.id}.png"
            image_url = self.github.upload_image(graphic_bytes, filename)
            logger.info(f"Uploaded image: {image_url}")

            # Step 6: Publish to each platform via Buffer (Instagram, Threads, Facebook)
            results = self.buffer.publish_to_all(image_url=image_url, posts=posts)

            succeeded = [p for p, r in results.items() if r.get("success")]
            failed = [p for p, r in results.items() if not r.get("success")]
            logger.info(f"Published to: {succeeded or 'none'}; failed: {failed or 'none'}")

            # Step 7: Notify via Slack (for visibility)
            if failed:
                detail = "; ".join(f"{p}: {results[p].get('error')}" for p in failed)
                slack_status = self._post_status(
                    status="error" if not succeeded else "amended",
                    message=f"Published to {succeeded}; failed — {detail}",
                    quote_id=quote.id,
                )
            else:
                slack_status = self._post_status(
                    status="success",
                    message="Published to Instagram, Threads, and Facebook",
                    quote_id=quote.id,
                )

            return 0 if succeeded and slack_status == 0 else 1

        except Exception as e:
            logger.exception("Pipeline failed")
            self._notify_slack_error(str(e))
            return 1

    def _get_quote(self, exclude_id: Optional[str] = None) -> Quote:
        """Get a quote from the repository (or generate one as fallback).

        Args:
            exclude_id: If set, pick a random quote other than this one
                (used by the "Choose a different one" re-run).

        Returns:
            Quote object.

        Raises:
            RuntimeError: If no quote can be obtained.
        """
        if exclude_id:
            quote = self.quote_repo.pick_random_excluding(exclude_id)
            if quote:
                logger.info(f"Re-run: picked different quote {quote.id}")
                return quote
            logger.warning(f"No alternative quotes to {exclude_id} in repository")

        quote = self.quote_repo.pick_for_today()
        if quote:
            logger.info(f"Using quote from repository: {quote.id}")
            return quote

        logger.info("No quotes in repository; generating new quote")
        # If repo is empty, generate
        from quote_generator import LDSQuoteGenerator

        generator = LDSQuoteGenerator(model=Config.LLM_MODEL)
        quote = generator.generate_quote()
        logger.info(f"Generated new quote: {quote.id}")
        return quote

    def _save_draft(
        self,
        quote: Quote,
        caption: str,
        hashtags: list[str],
        graphic_bytes: BytesIO,
    ) -> None:
        """Save draft to local storage for records.

        Skipped in read-only environments (e.g., Vercel).

        Args:
            quote: Quote object.
            caption: Caption text.
            hashtags: List of hashtags.
            graphic_bytes: PNG image data as BytesIO.
        """
        try:
            draft_dir = Config.GENERATED_DRAFTS_DIR / date.today().isoformat()
            draft_dir.mkdir(parents=True, exist_ok=True)

            # Save metadata
            metadata = {
                "quote_id": quote.id,
                "quote_text": quote.text,
                "speaker": quote.speaker,
                "source": quote.source,
                "year": quote.year,
                "caption": caption,
                "hashtags": hashtags,
                "created_at": date.today().isoformat(),
            }

            metadata_path = draft_dir / f"{quote.id}_metadata.json"
            with open(metadata_path, "w", encoding="utf-8") as f:
                json.dump(metadata, f, indent=2)

            # Save graphic
            graphic_path = draft_dir / f"{quote.id}_graphic.png"
            with open(graphic_path, "wb") as f:
                f.write(graphic_bytes.getvalue())

            logger.info(f"Saved draft to {draft_dir}")
        except OSError as e:
            logger.warning(f"Could not save draft (read-only filesystem?): {e}")

    def _post_status(self, status: str, message: str, quote_id: str) -> int:
        """Post a status update to Slack, loudly if it doesn't land.

        A Slack failure here means the notification never reached anyone, so
        it fails the job rather than passing quietly — publishing itself has
        already happened and is logged above.

        Returns:
            0 if the update posted, 1 if Slack rejected it.
        """
        webhook = os.environ.get("SLACK_WEBHOOK_URL")
        if webhook:
            try:
                response = requests.post(webhook, json={"text": f"LDS Quotes — {status}: {message}"}, timeout=15)
                response.raise_for_status()
                return 0
            except requests.RequestException as e:
                logger.error(f"Slack webhook notification failed: {e}")
                return 1
        try:
            self.slack.post_status_update(
                status=status, message=message, quote_id=quote_id
            )
            return 0
        except SlackPostError as e:
            logger.error(f"Slack notification did not post: {e}")
            annotate_error(
                f"Slack notification did not post to "
                f"'{Config.SLACK_APPROVAL_CHANNEL}': {e}. Check the channel ID "
                "and that the bot has been invited to it."
            )
            return 1

    def _notify_slack_error(self, error_message: str) -> None:
        """Send error notification to Slack.

        Args:
            error_message: Error description.
        """
        try:
            self.slack.post_status_update(
                status="error",
                message=f"Pipeline error: {error_message}",
                quote_id="error",
            )
        except Exception as e:
            logger.error(f"Failed to notify Slack of error: {e}")
            annotate_error(f"Slack error notification did not post either: {e}")

    def choose_different_quote(self, current_quote_id: str) -> int:
        """Re-run the pipeline with a different quote.

        Called when [🔄 Choose a different one] is clicked in Slack.

        Args:
            current_quote_id: The quote the user rejected.

        Returns:
            0 on success, 1 on failure.
        """
        logger.info(f"User requested a different quote (rejecting {current_quote_id})")
        return self.run(exclude_quote_id=current_quote_id)


def main() -> int:
    """Main entry point."""
    pipeline = QuotePipeline()
    return pipeline.run()


if __name__ == "__main__":
    sys.exit(main())
