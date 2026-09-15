#!/usr/bin/env python3
"""
quote_generator.py — Generates authentic LDS-focused inspirational quotes using LLM.

Can generate new quotes or select from a database. Produces captions with
optimal hashtags for Instagram.
"""

import json
import logging
import os
import random
from dataclasses import dataclass
from datetime import date
from pathlib import Path
from typing import Optional

import anthropic
import requests

logger = logging.getLogger("quote_generator")


@dataclass
class Quote:
    """Represents a single quote."""

    id: str
    text: str
    speaker: str
    source: str
    year: Optional[int] = None


class QuoteRepository:
    """Loads quotes from JSON or database."""

    def __init__(self, path: Optional[Path] = None):
        """Initialize repository.

        Args:
            path: Path to quotes_data.json. Defaults to adjacent file.
        """
        self.path = path or Path(__file__).parent / "quotes_data.json"

    def _load(self) -> list[Quote]:
        """Load quotes from JSON file."""
        if not self.path.exists():
            logger.warning(f"Quotes file not found at {self.path}")
            return []

        try:
            with open(self.path, "r", encoding="utf-8") as f:
                raw = json.load(f)

            quotes = []
            for q in raw.get("quotes", []):
                # Map various field names to Quote schema
                quote = Quote(
                    id=str(q.get("id", "")),
                    text=q.get("text") or q.get("quote", ""),
                    speaker=q.get("speaker") or q.get("author", "Unknown"),
                    source=q.get("source", ""),
                    year=q.get("year"),
                )
                quotes.append(quote)
            return quotes
        except (json.JSONDecodeError, KeyError, TypeError) as e:
            logger.error(f"Failed to load quotes: {e}")
            return []

    def pick_for_today(self) -> Optional[Quote]:
        """Deterministically pick a quote for today.

        Uses a year-seeded shuffle indexed by day of year: same day always
        returns the same quote, no quote repeats within a year (while the
        pool has 366+ quotes), and each year gets a fresh order.
        """
        quotes = self._load()
        if not quotes:
            return None

        today = date.today()
        order = list(range(len(quotes)))
        random.Random(today.year).shuffle(order)
        idx = order[(today.timetuple().tm_yday - 1) % len(quotes)]
        return quotes[idx]

    def get_by_id(self, quote_id: str) -> Optional[Quote]:
        """Get a specific quote by ID."""
        quotes = self._load()
        for q in quotes:
            if q.id == quote_id:
                return q
        return None

    def pick_random_excluding(self, exclude_id: str) -> Optional[Quote]:
        """Pick a truly random quote, excluding the given ID.

        Used by the "Choose a different one" Slack button so the re-run
        never serves the same quote back.
        """
        quotes = [q for q in self._load() if q.id != exclude_id]
        if not quotes:
            return None
        return random.choice(quotes)


class LDSQuoteGenerator:
    """Generates authentic LDS-focused quotes using Claude."""

    def __init__(self, model: str = "claude-opus-4-8"):
        """Initialize quote generator.

        Args:
            model: Anthropic model to use. Defaults to Opus 4.8 (most capable).
        """
        self.model = model
        self.client = anthropic.Anthropic(
            api_key=os.environ.get("ANTHROPIC_API_KEY")
        )

    def generate_quote(self) -> Quote:
        """Generate a single authentic LDS inspirational quote.

        Returns:
            Quote object with generated text and metadata.

        Raises:
            RuntimeError: If generation fails.
        """
        prompt = """Create one original LDS-focused inspirational reflection for a social media card.

Important source-safety rule:
- Do NOT write "in the voice of" a real Church leader.
- Do NOT attribute the reflection to a real Church leader, scripture, talk, or historical source unless an exact source is supplied.
- This must be clearly original devotional reflection, not a fabricated quotation.

The reflection should be:
- 10-28 words, short enough for a single social media card
- Faithful to broad Latter-day Saint values
- Uplifting, practical, and easy to save/share
- About daily discipleship, prayer, peace, service, repentance, family, hope, or Jesus Christ
- Warm and sincere without sounding preachy or viral-bait

Return ONLY valid JSON (no markdown), exactly matching this shape:
{
  "text": "The quote text here",
  "speaker": "LDS Quotes",
  "source": "Original devotional reflection",
  "year": 2026
}"""

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

            raw = response.content[0].text.strip()

            # Clean up any markdown code fences
            if raw.startswith("```"):
                raw = raw.strip("`").lstrip("json\n")

            parsed = json.loads(raw)

            # Generate a unique ID
            quote_id = f"gen_{date.today().strftime('%Y%m%d')}_{random.randint(1000, 9999)}"

            return Quote(
                id=quote_id,
                text=parsed["text"],
                speaker=parsed["speaker"],
                source=parsed["source"],
                year=parsed.get("year"),
            )

        except (json.JSONDecodeError, KeyError, AttributeError) as e:
            logger.error(f"Failed to parse generated quote: {e}")
            raise RuntimeError(f"Quote generation failed: {e}")
        except anthropic.APIError as e:
            logger.error(f"Claude API error: {e}")
            raise RuntimeError(f"Quote generation API error: {e}")

    def batch_generate_quotes(self, count: int = 5) -> list[Quote]:
        """Generate multiple quotes at once.

        Args:
            count: Number of quotes to generate.

        Returns:
            List of Quote objects.
        """
        quotes = []
        for i in range(count):
            try:
                quote = self.generate_quote()
                quotes.append(quote)
                logger.info(f"Generated quote {i+1}/{count}")
            except RuntimeError as e:
                logger.warning(f"Failed to generate quote {i+1}: {e}")
                continue

        return quotes


class CaptionGenerator:
    """Generates engaging Instagram captions and hashtags."""

    def __init__(self, model: str = "claude-opus-4-8"):
        """Initialize caption generator.

        Args:
            model: Anthropic model to use.
        """
        self.model = model
        self.client = anthropic.Anthropic(
            api_key=os.environ.get("ANTHROPIC_API_KEY")
        )

    def generate_caption_and_hashtags(self, quote: Quote) -> dict:
        """Generate an Instagram caption and hashtags for a quote.

        Args:
            quote: Quote object to create caption for.

        Returns:
            Dict with 'caption' and 'hashtags' keys.

        Raises:
            RuntimeError: If generation fails.
        """
        prompt = f"""You are the social media voice of "LDS Quotes: Daily Inspiration"
(@lds.quotes.official on Instagram). Write a caption for a post featuring this quote:

"{quote.text}"
— {quote.speaker}, {quote.source}

Caption requirements:
1. Optimize for follower growth through peaceful, saveable spiritual content, not hard app promotion.
2. 2-4 short lines, separated by blank lines (line breaks matter on Instagram)
3. STRICT LIMIT: 320 characters total. The caption is also posted to Threads,
   which caps posts at 500 characters including hashtags and a call-to-action,
   so it must stay short.
4. Warm, sincere, reflective tone — like a trusted friend, never preachy or salesy
5. Open with a hook line that draws the reader in (a feeling, struggle, or moment)
6. Do NOT repeat or quote the quote itself; expand on its meaning for daily life
7. Include exactly one gentle closing action (save, share, or reflect), in its own paragraph.
8. NO questions anywhere in the caption — end with a gentle statement,
   affirmation, or invitation instead (e.g., "Carry this with you today.")
9. 0-2 emoji maximum, used tastefully
10. Do not pressure people to download the app. App promotion should be rare and soft.
11. Plain Instagram text only: no Markdown symbols, headings, bullets, or hashtags in the caption body.
12. Structure: opening paragraph, short reflection paragraph, one action paragraph. Separate paragraphs with actual blank lines.
13. Do not add source attribution to the body; the publisher adds a separate attribution paragraph.

Hashtag requirements:
- Use exactly 5 relevant Instagram discovery hashtags total
- Always include #ldsquotes
- Mix broad and niche tags relevant to the quote: #LatterDaySaints, #ComeUntoChrist, #JesusChrist, #FaithInChrist, #ChristianInspiration, #ScriptureStudy, #Prayer, #GeneralConference, #BookOfMormon, #DailyDevotional
- No duplicates, no spaces within tags

Respond with ONLY valid JSON (no markdown, no code fences):
{{
  "caption": "Line one.\\n\\nLine two.\\n\\nClosing invitation.",
  "hashtags": ["#ldsquotes", "#tag2", "#tag3"]
}}"""

        try:
            response = self.client.messages.create(
                model=self.model,
                max_tokens=500,
                messages=[
                    {
                        "role": "user",
                        "content": prompt,
                    }
                ],
            )

            raw = response.content[0].text.strip()

            # Clean markdown if present
            if raw.startswith("```"):
                raw = raw.strip("`").lstrip("json\n")

            parsed = json.loads(raw)

            return {
                "caption": parsed["caption"],
                "hashtags": parsed.get("hashtags", []),
            }

        except (json.JSONDecodeError, KeyError, AttributeError) as e:
            logger.error(f"Failed to parse caption: {e}")
            raise RuntimeError(f"Caption generation failed: {e}")
        except anthropic.APIError as e:
            logger.error(f"Claude API error: {e}")
            raise RuntimeError(f"Caption generation API error: {e}")

    def regenerate_with_feedback(
        self,
        quote: Quote,
        previous_caption: str,
        feedback: str,
    ) -> dict:
        """Regenerate caption based on user feedback.

        Args:
            quote: Quote object.
            previous_caption: The caption that was rejected.
            feedback: User's feedback for improvement.

        Returns:
            Dict with 'caption' and 'hashtags'.

        Raises:
            RuntimeError: If generation fails.
        """
        prompt = f"""You are revising an Instagram caption based on user feedback.

Original quote:
"{quote.text}"
— {quote.speaker}, {quote.source}

Previous caption (to improve upon):
{previous_caption}

User feedback:
{feedback}

Regenerate the caption and hashtags, incorporating the feedback.
Keep the style rules: value-first, saveable, 2-4 short lines separated by blank lines, STRICT
LIMIT of 320 characters total (the caption is also posted to Threads,
which caps posts at 500 characters), warm and reflective tone, do NOT
repeat the quote, NO questions — end with a gentle statement or
invitation, 0-2 emoji max, and 8-12 relevant discovery hashtags (always
include #ldsquotes). Avoid hard app promotion.

Respond with ONLY valid JSON:
{{
  "caption": "Revised caption here",
  "hashtags": ["#ldsquotes", "#tag2"]
}}"""

        try:
            response = self.client.messages.create(
                model=self.model,
                max_tokens=500,
                messages=[
                    {
                        "role": "user",
                        "content": prompt,
                    }
                ],
            )

            raw = response.content[0].text.strip()

            if raw.startswith("```"):
                raw = raw.strip("`").lstrip("json\n")

            parsed = json.loads(raw)

            return {
                "caption": parsed["caption"],
                "hashtags": parsed.get("hashtags", []),
            }

        except (json.JSONDecodeError, KeyError, AttributeError) as e:
            logger.error(f"Failed to parse revised caption: {e}")
            raise RuntimeError(f"Caption revision failed: {e}")
        except anthropic.APIError as e:
            logger.error(f"Claude API error: {e}")
            raise RuntimeError(f"Caption revision API error: {e}")
