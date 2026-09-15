#!/usr/bin/env python3
"""
bondify_workflow3_agent.py — Bondify Social Workflow 3 (Auto-Publish + Slack).

Complete pipeline:
  1. Load a random Bondify conversation starter card
  2. Generate Instagram caption promoting the conversation starter
  3. Render 1080x1350px graphic with Bondify branding and logo
  4. Auto-publish directly to Instagram
  5. Notify Slack with status + link

No approval needed — publishes directly to Instagram.
"""

from dotenv import load_dotenv

load_dotenv()

import json
import logging
import os
import requests
import sys
from types import SimpleNamespace
from datetime import datetime
from io import BytesIO
from pathlib import Path
from typing import Optional

from bondify_data_client import BondifyDataClient
from bondify_graphics_engine import BondifyGraphicsEngine
from bondify_reel_engine import BondifyReelEngine
from buffer_handler import BufferHandler
from caption_generator import CaptionGenerator
from config import Config
from image_host import ImageHost
from slack_handler import SlackHandler

logging.basicConfig(
    level=logging.DEBUG if Config.DEBUG else logging.INFO,
    format="%(asctime)s [%(name)s] [%(levelname)s] %(message)s",
)
logger = logging.getLogger("bondify_workflow3")


RELATIONSHIP_INSIGHTS = (
    ("The small thing", "Strong relationships are often built through small, repeated signals of attention, not occasional grand gestures."),
    ("Listen to understand", "A good conversation is not a race to offer advice. Sometimes feeling understood is the first form of support."),
    ("Repair matters", "Healthy relationships are not conflict-free. They make room for accountability, repair, and trying again."),
    ("Make connection easy", "A ten-minute ritual without phones can create more connection than waiting for a perfect free weekend."),
    ("Ask a better follow-up", "Instead of replying with your own story immediately, try: ‘What was that like for you?’"),
    ("Notice the bids", "A small bid for connection can sound like a story, a joke, or a request for help. Turning toward it builds warmth."),
    ("Support is not always solving", "Before offering a solution, ask whether the other person wants advice, comfort, or simply someone to listen."),
)


RELATIONSHIP_LISTS = (
    (
        "5 things to say more often",
        [
            "I noticed how hard you tried.",
            "I am listening.",
            "That makes sense.",
            "Thank you for telling me.",
            "I love doing life with you.",
        ],
        "For your girlfriend, wife, or partner.",
    ),
    (
        "5 better replies during conflict",
        [
            "Help me understand.",
            "I need a minute, not distance.",
            "You matter more than winning.",
            "I can see why that hurt.",
            "Can we try that again?",
        ],
        "Use these when the conversation gets tense.",
    ),
    (
        "5 questions that feel less boring",
        [
            "What felt heavy today?",
            "What made you smile quietly?",
            "Where did you need support?",
            "What should we make easier?",
            "What do you want more of from us?",
        ],
        "Save these for dinner or a slow walk.",
    ),
)


SOURCED_RELATIONSHIP_FACTS = (
    {
        "title": "Phones interrupt connection",
        "visual": "51% say their partner is at least sometimes distracted by their phone during conversation.",
        "source": "Pew Research Center, 2020",
        "url": "https://www.pewresearch.org/internet/2020/05/08/dating-and-relationships-in-the-digital-age/",
        "caption": "Small distraction, big signal.\n\nPew found 51% of Americans in romantic relationships say their partner is at least sometimes distracted by their phone during conversation.\n\nTry one phone-down conversation tonight.",
    },
    {
        "title": "Gratitude protects relationships",
        "visual": "Feeling appreciated by your partner is linked with stronger relationship satisfaction.",
        "source": "University of Illinois research summary, 2022",
        "url": "https://news.illinois.edu/study-shows-the-power-of-thank-you-for-couples/",
        "caption": "A small thank-you is not small to the person carrying the weight.\n\nResearch from the University of Illinois links partner gratitude with stronger relationship satisfaction and commitment.\n\nSay the specific thank-you today.",
    },
    {
        "title": "Positive moments matter",
        "visual": "Stable couples tend to keep many more positive than negative interactions during conflict.",
        "source": "Gottman Institute research summary",
        "url": "https://www.gottman.com/blog/the-magic-relationship-ratio-according-science/",
        "caption": "Healthy conflict is not about never disagreeing.\n\nRelationship research popularized by the Gottman Institute points to the importance of many more positive than negative interactions during conflict.\n\nRepair early. Appreciate often.",
    },
)


class BondifyWorkflow3Pipeline:
    """Bondify Social Workflow 3: Auto-publish to Instagram + Slack notification."""

    def __init__(self, bondify_scripts_dir: Path, logo_path: Optional[Path] = None):
        """Initialize the pipeline.

        Args:
            bondify_scripts_dir: Path to Bondify scripts directory
            logo_path: Optional path to Bondify logo
        """
        # Validate configuration
        errors = Config.validate()
        if errors:
            for error in errors:
                logger.error(f"Configuration error: {error}")
            raise EnvironmentError("Configuration validation failed")

        Config.log_config()

        # Initialize clients
        self.bondify_client = BondifyDataClient(bondify_scripts_dir)
        self.caption_gen = CaptionGenerator(model=Config.LLM_MODEL)
        self.graphics_engine = BondifyGraphicsEngine(logo_path=logo_path)
        self.reel_engine = BondifyReelEngine(logo_path=logo_path)
        self.buffer = BufferHandler(
            access_token=Config.BUFFER_ACCESS_TOKEN,
            channel_id=Config.BUFFER_CHANNEL_ID,
        )
        self.image_host = ImageHost(
            cloud_name=Config.CLOUDINARY_CLOUD_NAME,
            upload_preset=Config.CLOUDINARY_UPLOAD_PRESET,
        )
        self.slack = SlackHandler(bot_token=Config.SLACK_BOT_TOKEN)

        logger.info("Bondify Workflow 3 Pipeline initialized")

    def run(self) -> int:
        """Run the auto-publish pipeline.

        Returns:
            0 on success, 1 on failure.
        """
        try:
            # Step 1: Pick today's format and card(s)
            post_format = self._pick_format()
            content_type = self._pick_content_type()
            logger.info(f"Post format for today: {post_format}")

            if content_type in ("list", "fact") and post_format == "carousel":
                cards = self._pick_educational_carousel(content_type)
                card = cards[0]
                logger.info(f"Selected Bondify educational carousel: {card.id}")
            elif post_format == "carousel":
                cards = self._pick_carousel_cards()
                card = cards[0]
                logger.info(
                    f"Selected {len(cards)} cards from deck '{card.deck_id}' "
                    f"({card.mode} mode) for carousel"
                )
            elif content_type in ("insight", "list", "fact") and post_format != "carousel":
                card = self._pick_insight()
                if content_type == "list":
                    card = self._pick_list_card()
                elif content_type == "fact":
                    card = self._pick_fact_card()
                cards = [card]
                logger.info(f"Selected relationship content: {card.id}")
            else:
                card = self._pick_card()
                cards = [card]
                logger.info(
                    f"Selected card {card.id} from {card.mode} mode "
                    f"(intensity: {card.intensity})"
                )

            # Step 2: Generate Instagram caption
            if post_format == "carousel":
                caption = self._generate_carousel_caption(cards)
            else:
                caption = self._generate_caption(card, content_type=content_type)
            logger.info(f"Generated caption ({len(caption)} chars)")

            # Step 3: Render media
            deck_title = self.bondify_client.get_deck_title(card.deck_id)
            video_bytes = None
            image_bytes_list = []

            if post_format == "reel":
                video_bytes = self.reel_engine.render_reel(
                    question=card.question,
                    category=card.category,
                    deck_title=deck_title,
                    mode=card.mode,
                    intensity=card.intensity,
                )
                logger.info(f"Rendered reel ({len(video_bytes.getvalue())} bytes)")
            else:
                for c in cards:
                    image_bytes_list.append(
                        self.graphics_engine.render(
                            question=c.question,
                            category=c.category,
                            deck_title=self.bondify_client.get_deck_title(c.deck_id),
                            mode=c.mode,
                            intensity=c.intensity,
                        )
                    )
                logger.info(f"Rendered {len(image_bytes_list)} graphic(s)")

            # Step 4: Save draft for records
            self._save_draft(
                card, caption, image_bytes_list, video_bytes, post_format
            )

            # Step 5: Check for dry-run
            if Config.DRY_RUN:
                logger.info(
                    f"[DRY RUN] Would publish {post_format} to Instagram via Buffer "
                    "+ notify Slack"
                )
                return 0

            # Step 6: Upload media to public URLs, then publish via Buffer
            stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            if post_format == "reel":
                logger.info("Uploading reel video for Buffer...")
                video_url = self.image_host.upload_video(
                    video_bytes.getvalue(), public_id=f"bondify_reel_{stamp}"
                )
                logger.info("Publishing reel to Instagram via Buffer...")
                result = self.buffer.publish(caption=caption, video_url=video_url)
            elif post_format == "carousel":
                logger.info(f"Uploading {len(image_bytes_list)} carousel images...")
                urls = [
                    self.image_host.upload(
                        img.getvalue(), public_id=f"bondify_{stamp}_{i}"
                    )
                    for i, img in enumerate(image_bytes_list)
                ]
                logger.info("Publishing carousel to Instagram via Buffer...")
                result = self.buffer.publish(caption=caption, image_urls=urls)
            else:
                logger.info("Uploading image for Buffer...")
                image_url = self.image_host.upload(
                    image_bytes_list[0].getvalue(), public_id=f"bondify_{stamp}"
                )
                logger.info("Publishing to Instagram via Buffer...")
                result = self.buffer.publish(caption=caption, image_url=image_url)

            post_id = result["id"]
            logger.info(f"Published via Buffer: {post_id}")

            # Step 7: Notify Slack with status
            self._notify_slack_success(card, post_id, post_format)

            return 0

        except Exception as e:
            logger.exception("Pipeline failed")
            try:
                self._notify_slack_error(str(e))
            except Exception as slack_err:
                logger.error(f"Could not notify Slack of error: {slack_err}")
            return 1

    # ------------------------------------------------------------------
    # Format + card selection
    # ------------------------------------------------------------------

    #  Weekly mix per 2026 Instagram guidance: mostly reels (non-follower
    #  reach), carousels for saves, one static. Mon=0 ... Sun=6.
    WEEKDAY_FORMATS = {
        0: "carousel",
        1: "carousel",
        2: "reel",
        3: "carousel",
        4: "reel",
        5: "carousel",
        6: "reel",
    }

    # Mix scripts, useful lists, sourced facts, habits, and occasional questions.
    # The selector is
    # deterministic by weekday so retries do not unexpectedly change theme.
    WEEKDAY_CONTENT_TYPES = {
        0: "list", 1: "fact", 2: "insight", 3: "list",
        4: "question", 5: "fact", 6: "insight",
    }

    CAROUSEL_SIZE = 5

    def _pick_format(self) -> str:
        """Today's post format: BONDIFY_FORMAT override, else weekday mix."""
        override = os.environ.get("BONDIFY_FORMAT", "").strip().lower()
        if override in ("static", "carousel", "reel"):
            return override
        return self.WEEKDAY_FORMATS[datetime.now().weekday()]

    def _pick_content_type(self) -> str:
        override = os.environ.get("BONDIFY_CONTENT_TYPE", "").strip().lower()
        if override in ("question", "insight", "list", "fact"):
            return override
        return self.WEEKDAY_CONTENT_TYPES[datetime.now().weekday()]

    @staticmethod
    def _pick_list_card():
        import random

        title, items, note = random.choice(RELATIONSHIP_LISTS)
        return SimpleNamespace(
            id=f"list_{title.lower().replace(' ', '_')}",
            question=f"{title}\n\n" + "\n".join(f"{i+1}. {item}" for i, item in enumerate(items)),
            category="Relationship Scripts",
            deck_id="relationship_scripts",
            mode="relationships",
            intensity=note,
        )

    @staticmethod
    def _pick_fact_card():
        import random

        fact = random.choice(SOURCED_RELATIONSHIP_FACTS)
        return SimpleNamespace(
            id=f"fact_{fact['title'].lower().replace(' ', '_')}",
            question=f"{fact['title']}\n\n{fact['visual']}",
            category="Research-backed",
            deck_id="relationship_facts",
            mode="relationships",
            intensity=f"{fact['source']} — {fact['url']}",
            source=fact,
        )

    @staticmethod
    def _pick_insight():
        import random

        title, body = random.choice(RELATIONSHIP_INSIGHTS)
        return SimpleNamespace(
            id=f"insight_{title.lower().replace(' ', '_')}",
            question=f"{title}\n\n{body}",
            category="Relationship Insight",
            deck_id="relationship_insights",
            mode="relationships",
            intensity="medium",
        )

    @staticmethod
    def _allowed_modes() -> list[str]:
        """BONDIFY_POST_MODES allowlist (comma-separated); empty = all modes."""
        return [
            m.strip()
            for m in os.environ.get("BONDIFY_POST_MODES", "").split(",")
            if m.strip()
        ]

    def _pick_card(self):
        """Pick one random card, respecting the mode allowlist."""
        import random

        allowed = self._allowed_modes()
        if allowed:
            return self.bondify_client.get_random_card(mode=random.choice(allowed))
        return self.bondify_client.get_random_card()

    def _pick_carousel_cards(self) -> list:
        """Pick CAROUSEL_SIZE cards from one random deck (same theme)."""
        import random

        allowed = set(self._allowed_modes())
        pool = [
            c
            for c in self.bondify_client.cards
            if not allowed or c.mode in allowed
        ]

        by_deck: dict = {}
        for c in pool:
            by_deck.setdefault(c.deck_id, []).append(c)

        eligible = {
            deck: cs for deck, cs in by_deck.items() if len(cs) >= self.CAROUSEL_SIZE
        }
        if not eligible:
            # Fall back to a single-card "carousel" rather than failing
            return [self._pick_card()]

        deck_id = random.choice(list(eligible.keys()))
        return random.sample(eligible[deck_id], self.CAROUSEL_SIZE)

    def _pick_educational_carousel(self, content_type: str) -> list:
        if content_type == "fact":
            card = self._pick_fact_card()
            source = card.source
            return [
                SimpleNamespace(id=card.id, question=source["title"], category="Research-backed", deck_id="relationship_facts", mode="relationships", intensity="", source=source),
                SimpleNamespace(id=card.id + "_data", question=source["visual"], category="The data", deck_id="relationship_facts", mode="relationships", intensity="", source=source),
                SimpleNamespace(id=card.id + "_meaning", question="Attention is not neutral.", category="What it means", deck_id="relationship_facts", mode="relationships", intensity="", source=source),
                SimpleNamespace(id=card.id + "_try", question="Try one phone-down conversation.", category="Tonight", deck_id="relationship_facts", mode="relationships", intensity="", source=source),
                SimpleNamespace(id=card.id + "_source", question=f"Source: {source['source']}", category="Source", deck_id="relationship_facts", mode="relationships", intensity=source["url"], source=source),
            ]

        title, items, note = __import__("random").choice(RELATIONSHIP_LISTS)
        slides = [title] + items
        return [
            SimpleNamespace(id=f"list_{idx}", question=text, category="Relationship Scripts", deck_id="relationship_scripts", mode="relationships", intensity=note)
            for idx, text in enumerate(slides, 1)
        ]

    def _generate_carousel_caption(self, cards) -> str:
        """Generate a caption for a multi-question carousel post."""
        if cards[0].deck_id in ("relationship_scripts", "relationship_facts"):
            return self._generate_educational_caption(cards)

        deck_title = self.bondify_client.get_deck_title(cards[0].deck_id)
        questions = "\n".join(f"- {c.question}" for c in cards)

        prompt = f"""Generate an engaging Instagram caption for a carousel post of
{len(cards)} Bondify conversation starters from the deck "{deck_title}"
({cards[0].mode} mode):

{questions}

Guidelines:
- Optimize for follower growth through useful, saveable relationship content, not hard app promotion
- 2-3 short lines introducing the set, e.g. why these questions spark connection
- Encourage swiping, saving, sharing, or sending to the person they want to ask
- Tone: friendly, inviting, emotionally intelligent, practical
- Make it feel like a relationship page people would follow even if they never download the app
- Do NOT repeat the questions in the caption
- Do NOT include hashtags in the caption sentences

Then, on a new final line starting with exactly "HASHTAGS:", give 10-14 Instagram
discovery hashtags tailored to this mode and audience. Mix broad reach tags,
niche intent tags, and relationship-topic tags. Do not include #Bondify (it is
added automatically).

Keep the caption under 360 characters."""

        response = self.caption_gen.client.messages.create(
            model=Config.LLM_MODEL,
            max_tokens=500,
            messages=[{"role": "user", "content": prompt}],
        )

        caption_text, hashtags = self._split_caption_and_hashtags(
            response.content[0].text
        )

        cta = (
            "\n\n💾 Save this post for your next hangout\n"
            "Send it to someone you want to talk with properly.\n\n"
            f"#Bondify {hashtags}"
        )
        return f"{caption_text}{cta}"

    def _generate_caption(self, card, content_type: str = "question") -> str:
        """Generate Instagram caption for the conversation starter.

        Args:
            card: Bondify Card object

        Returns:
            Complete Instagram caption
        """
        try:
            if content_type in ("list", "fact"):
                return self._generate_educational_caption([card])

            # Use Claude to generate a caption that promotes this conversation starter
            subject = "relationship insight" if content_type == "insight" else "Bondify conversation starter"
            prompt = f"""Generate an engaging Instagram caption for this Bondify {subject}:

Mode: {card.mode}
Question: "{card.question}"
Intensity: {card.intensity}

Guidelines:
- Optimize for follower growth through useful, saveable relationship content, not hard app promotion
- 2-3 short lines explaining the relationship idea in a practical, relatable way
- Should emphasize human connection, bonding, and meaningful conversations
- Tone: friendly, inviting, supportive, emotionally intelligent, and non-cringe
- Make it feel like a relationship page people would follow even if they never download the app
- For an insight, connect the idea to one small action people can try today
- For a question, include a call-to-action encouraging people to try it with friends/partners/family
- Do NOT include hashtags in the caption sentences

Then, on a new final line starting with exactly "HASHTAGS:", give 10-14 Instagram
discovery hashtags tailored to this specific mode and question — mix broad reach tags
with niche tags matching the audience (e.g. couples tags for lovers cards,
friendship tags for friends cards, family tags for family cards). Do not
include #Bondify (it is added automatically).

Keep the caption under 360 characters."""

            response = self.caption_gen.client.messages.create(
                model=Config.LLM_MODEL,
                max_tokens=500,
                messages=[{"role": "user", "content": prompt}],
            )

            raw = response.content[0].text
            caption_text, hashtags = self._split_caption_and_hashtags(raw)

            # Build full caption
            cta = (
                "\n\nSave this and ask it when the room gets quiet.\n\n"
                f"#Bondify {hashtags}"
            )

            full_caption = f"{caption_text}{cta}"

            return full_caption

        except Exception as e:
            logger.error(f"Failed to generate caption: {e}")
            raise RuntimeError(f"Caption generation failed: {e}")

    def _generate_educational_caption(self, cards) -> str:
        first = cards[0]
        source = getattr(first, "source", None)
        if source:
            body = f"{source['caption']}\n\nSource: {source['source']}\n{source['url']}"
        else:
            body = (
                "Small words can change the whole room.\n\n"
                "Try one of these with someone you love before the day ends.\n\n"
                "Save this for the conversation you do not want to rush."
            )
        hashtags = (
            "#Bondify #RelationshipAdvice #HealthyRelationships #CouplesCommunication "
            "#MarriageAdvice #DatingAdvice #LoveLanguages #BetterConversations "
            "#EmotionalConnection #RelationshipTips #QualityTime"
        )
        return f"{body}\n\n{hashtags}"

    @staticmethod
    def _split_caption_and_hashtags(raw: str) -> tuple[str, str]:
        """Split Claude's response into caption text and a hashtag line.

        Falls back to a default hashtag set if the HASHTAGS: line is missing
        or contains no valid hashtags.
        """
        default_hashtags = (
            "#ConversationStarter #DeeperConnections #MeaningfulTalk "
            "#RelationshipAdvice #QualityTime #BetterConversations "
            "#CouplesQuestions #FriendshipGoals #FamilyTime"
        )

        caption_lines = []
        hashtags = ""
        for line in raw.splitlines():
            if line.strip().upper().startswith("HASHTAGS:"):
                hashtags = line.split(":", 1)[1].strip()
            else:
                caption_lines.append(line)

        caption = "\n".join(caption_lines).strip()
        tags = [t for t in hashtags.split() if t.startswith("#") and len(t) > 1]

        if not tags:
            return caption, default_hashtags

        # Drop a duplicate #Bondify if the model added one anyway
        tags = [t for t in tags if t.lower() != "#bondify"]
        return caption, " ".join(tags)

    def _save_draft(
        self,
        card,
        caption: str,
        image_bytes_list: list,
        video_bytes: Optional[BytesIO],
        post_format: str,
    ) -> None:
        """Save draft to disk for records.

        Args:
            card: Primary Bondify Card object
            caption: Generated caption
            image_bytes_list: Rendered images (1 for static, N for carousel)
            video_bytes: Rendered MP4 (reel format only)
            post_format: "static", "carousel", or "reel"
        """
        try:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            draft_dir = Config.DRAFTS_DIR / timestamp
            draft_dir.mkdir(parents=True, exist_ok=True)

            # Save metadata
            metadata = {
                "card_id": card.id,
                "mode": card.mode,
                "intensity": card.intensity,
                "question": card.question,
                "caption": caption,
                "format": post_format,
                "timestamp": timestamp,
            }
            with open(draft_dir / "metadata.json", "w") as f:
                json.dump(metadata, f, indent=2)

            # Save media
            for i, img in enumerate(image_bytes_list):
                name = "graphic.png" if len(image_bytes_list) == 1 else f"graphic_{i}.png"
                with open(draft_dir / name, "wb") as f:
                    f.write(img.getvalue())
            if video_bytes is not None:
                with open(draft_dir / "reel.mp4", "wb") as f:
                    f.write(video_bytes.getvalue())

            logger.info(f"Saved draft to {draft_dir}")

        except Exception as e:
            logger.warning(f"Could not save draft: {e}")

    def _notify_slack_success(self, card, post_id: str, post_format: str = "static") -> None:
        """Notify Slack of successful Instagram post.

        Args:
            card: Bondify Card object
            post_id: Buffer post ID
            post_format: "static", "carousel", or "reel"
        """
        format_emoji = {"reel": "🎬", "carousel": "🖼️", "static": "📷"}
        message = (
            f"✅ Published to Instagram! "
            f"{format_emoji.get(post_format, '')} *{post_format}*\n"
            f"📌 Mode: *{card.mode}* | Intensity: `{card.intensity}`\n"
            f"💬 Question: _{card.question}_\n"
            f"🔗 Post ID: `{post_id}`"
        )

        webhook = os.environ.get("SLACK_WEBHOOK_URL")
        if webhook:
            response = requests.post(webhook, json={"text": "Bondify — " + message}, timeout=15)
            response.raise_for_status()
            return
        self.slack.post_status_update(
            status="success",
            message=message,
            quote_id=card.id,
        )

    def _notify_slack_error(self, error_msg: str) -> None:
        """Notify Slack of publishing error.

        Args:
            error_msg: Error message
        """
        self.slack.post_status_update(
            status="error",
            message=f"Publishing failed: {error_msg}",
            quote_id="workflow3",
        )


def main():
    """Main entry point."""
    # Card data: env var → repo-local data/scripts → local Bondify checkout
    repo_data_dir = Path(__file__).parent / "data" / "scripts"
    scripts_dir_env = os.environ.get("BONDIFY_SCRIPTS_DIR")

    if scripts_dir_env:
        bondify_scripts_dir = Path(scripts_dir_env)
    elif repo_data_dir.exists():
        bondify_scripts_dir = repo_data_dir
    else:
        bondify_scripts_dir = Path("/Users/kelvintan/DaddyCoding/Bondify/scripts")

    logo_path = Path(
        os.environ.get(
            "BONDIFY_LOGO_PATH",
            str(Path(__file__).parent / "assets" / "bondify-heart-light.png"),
        )
    )

    if not bondify_scripts_dir.exists():
        logger.error(f"Bondify scripts directory not found: {bondify_scripts_dir}")
        return 1

    if not logo_path.exists():
        logger.warning(f"Logo not found at {logo_path}, continuing without logo")
        logo_path = None

    pipeline = BondifyWorkflow3Pipeline(bondify_scripts_dir, logo_path)
    return pipeline.run()


if __name__ == "__main__":
    sys.exit(main())
