#!/usr/bin/env python3
"""
caption_generator.py — Generates Instagram captions for quotes using Claude.

Creates engaging captions with hashtags optimized for Instagram.
"""

import logging
import os
from typing import Optional

import anthropic

logger = logging.getLogger("caption_generator")


class CaptionGenerator:
    """Generates Instagram captions using Claude."""

    def __init__(self, model: str = "claude-opus-4-8", api_key: Optional[str] = None):
        """Initialize the caption generator.

        Args:
            model: Claude model to use
            api_key: Anthropic API key (defaults to env var)
        """
        self.model = model
        self.api_key = api_key or os.environ.get("ANTHROPIC_API_KEY")
        if not self.api_key:
            raise EnvironmentError("ANTHROPIC_API_KEY not set")

        self.client = anthropic.Anthropic(api_key=self.api_key)

    def generate_caption_and_hashtags(
        self,
        quote_text: str,
        author: str,
        category: str,
    ) -> dict:
        """Generate an Instagram caption and hashtags for a quote.

        Args:
            quote_text: The quote text
            author: Quote author/speaker
            category: Quote category (e.g., "Faith", "Family")

        Returns:
            Dict with 'caption' and 'hashtags' (list of 5 hashtags max)

        Raises:
            RuntimeError: If generation fails
        """
        prompt = f"""Generate an engaging Instagram caption for this quote from {author} in the {category} category:

"{quote_text}"

Guidelines:
- Caption should be 1-2 sentences, inspiring and relatable
- Should feel personal and conversational, not preachy
- Focus on the emotional impact or practical application
- Generate exactly 5 hashtags that are relevant and Instagram-friendly
- Keep hashtags concise (2-3 words each)

Respond in this format:
CAPTION: [your caption here]
HASHTAGS: #tag1 #tag2 #tag3 #tag4 #tag5"""

        try:
            response = self.client.messages.create(
                model=self.model,
                max_tokens=300,
                messages=[
                    {
                        "role": "user",
                        "content": prompt,
                    }
                ],
            )

            text = response.content[0].text

            # Parse response
            caption = ""
            hashtags = []

            for line in text.split("\n"):
                if line.startswith("CAPTION:"):
                    caption = line.replace("CAPTION:", "").strip()
                elif line.startswith("HASHTAGS:"):
                    hashtags_text = line.replace("HASHTAGS:", "").strip()
                    hashtags = [tag.strip() for tag in hashtags_text.split()]

            logger.info(f"Generated caption ({len(caption)} chars) and {len(hashtags)} hashtags")

            return {
                "caption": caption,
                "hashtags": hashtags[:5],  # Ensure max 5
            }

        except anthropic.APIError as e:
            logger.error(f"Claude API error: {e}")
            raise RuntimeError(f"Caption generation failed: {e}")

    def generate_full_instagram_caption(
        self,
        quote_text: str,
        author: str,
        category: str,
        app_store_url: str,
    ) -> str:
        """Generate the complete Instagram caption including quote and CTA.

        Args:
            quote_text: The quote text
            author: Quote author
            category: Quote category
            app_store_url: URL to the Bondify app

        Returns:
            Complete Instagram caption ready to post
        """
        caption_data = self.generate_caption_and_hashtags(quote_text, author, category)
        caption = caption_data["caption"]
        hashtags = caption_data["hashtags"]

        cta = (
            "📱 Get daily inspiration with Bondify\n"
            "Daily quotes to uplift and strengthen your faith\n"
            f"{app_store_url}"
        )

        full_caption = (
            f'{caption}\n\n'
            f'"{quote_text}"\n'
            f'— {author}\n\n'
            f'{cta}\n\n'
            f'{" ".join(hashtags)}'
        )

        return full_caption
