#!/usr/bin/env python3
"""
test_setup.py — Diagnostic script to verify Bondify Social setup.

Tests all components without publishing.
"""

from dotenv import load_dotenv

load_dotenv()

import logging
import os
from pathlib import Path

logging.basicConfig(
    level=logging.INFO,
    format="%(levelname)s: %(message)s",
)
logger = logging.getLogger("test_setup")


def test_bondify_data():
    """Test Bondify data loading."""
    logger.info("\n" + "=" * 60)
    logger.info("Testing Bondify Data Loading")
    logger.info("=" * 60)

    try:
        from bondify_data_client import BondifyDataClient

        bondify_scripts_dir = Path("/Users/kelvintan/DaddyCoding/Bondify/scripts")

        if not bondify_scripts_dir.exists():
            logger.error(f"❌ Scripts directory not found: {bondify_scripts_dir}")
            return False

        logger.info(f"✓ Scripts directory found: {bondify_scripts_dir}")

        # List script files
        js_files = sorted(bondify_scripts_dir.glob("*.js"))
        logger.info(f"✓ Found {len(js_files)} script files:")
        for f in js_files:
            logger.info(f"  - {f.name}")

        # Load data
        logger.info("\nLoading data...")
        client = BondifyDataClient(bondify_scripts_dir)

        stats = client.get_stats()
        logger.info(f"✓ Loaded {stats['total_cards']} total cards")
        logger.info(f"✓ Loaded {stats['total_modes']} modes:")
        for mode, count in stats["cards_per_mode"].items():
            logger.info(f"  - {mode}: {count} cards")

        # Get random card
        card = client.get_random_card()
        logger.info(f"\n✓ Sample card loaded:")
        logger.info(f"  ID: {card.id}")
        logger.info(f"  Mode: {card.mode}")
        logger.info(f"  Intensity: {card.intensity}")
        logger.info(f"  Question: {card.question[:80]}...")

        return True

    except Exception as e:
        logger.error(f"❌ Bondify data test failed: {e}")
        import traceback

        traceback.print_exc()
        return False


def test_slack():
    """Test Slack connection."""
    logger.info("\n" + "=" * 60)
    logger.info("Testing Slack Connection")
    logger.info("=" * 60)

    try:
        from slack_handler import SlackHandler

        token = os.environ.get("SLACK_BOT_TOKEN")
        channel = os.environ.get("SLACK_APPROVAL_CHANNEL", "#bondify-social")

        if not token:
            logger.error("❌ SLACK_BOT_TOKEN not set")
            return False

        logger.info(f"✓ SLACK_BOT_TOKEN is set")
        logger.info(f"✓ Channel: {channel}")

        slack = SlackHandler(bot_token=token)

        # Try to resolve channel
        logger.info("\nResolving channel ID...")
        channel_id = slack._resolve_channel_id()
        logger.info(f"✓ Channel ID: {channel_id}")

        return True

    except EnvironmentError as e:
        logger.error(f"❌ Configuration error: {e}")
        return False
    except Exception as e:
        logger.error(f"❌ Slack test failed: {e}")

        # Provide help
        if "channels:read" in str(e).lower() or "missing_scope" in str(e).lower():
            logger.info("\n💡 FIX: Your Slack bot token is missing the 'channels:read' scope.")
            logger.info("   Option 1: Add channels:read scope at https://api.slack.com/apps")
            logger.info("   Option 2: Use channel ID directly in .env (e.g., C0123456789)")

        return False


def test_buffer():
    """Test Buffer + Cloudinary configuration (live API checks)."""
    logger.info("\n" + "=" * 60)
    logger.info("Testing Buffer / Instagram Publishing")
    logger.info("=" * 60)

    try:
        from buffer_handler import BufferHandler

        buffer = BufferHandler()
        channels = buffer.get_channels()
        instagram = [
            c for c in channels if c.get("service", "").lower() == "instagram"
        ]

        if not instagram:
            logger.error(
                "❌ No Instagram channel connected in Buffer. "
                "Connect one at https://buffer.com"
            )
            return False

        logger.info(
            f"✓ Buffer token valid, Instagram channel: "
            f"{instagram[0].get('displayName')} (id: {instagram[0]['id']})"
        )

        from image_host import ImageHost

        ImageHost()  # raises if Cloudinary vars are missing
        logger.info("✓ Cloudinary image hosting configured")

        return True

    except EnvironmentError as e:
        logger.error(f"❌ Configuration error: {e}")
        return False
    except Exception as e:
        logger.error(f"❌ Buffer test failed: {e}")
        return False


def test_anthropic():
    """Test Anthropic/Claude configuration."""
    logger.info("\n" + "=" * 60)
    logger.info("Testing Anthropic Configuration")
    logger.info("=" * 60)

    try:
        import anthropic

        api_key = os.environ.get("ANTHROPIC_API_KEY")

        if not api_key:
            logger.error("❌ ANTHROPIC_API_KEY not set")
            return False

        logger.info(f"✓ ANTHROPIC_API_KEY is set")

        client = anthropic.Anthropic(api_key=api_key)
        logger.info(f"✓ Anthropic client initialized")

        return True

    except Exception as e:
        logger.error(f"❌ Anthropic test failed: {e}")
        return False


def main():
    """Run all tests."""
    logger.info("\n🧪 Bondify Social Setup Verification\n")

    results = {
        "Bondify Data": test_bondify_data(),
        "Slack": test_slack(),
        "Buffer/Instagram": test_buffer(),
        "Anthropic": test_anthropic(),
    }

    logger.info("\n" + "=" * 60)
    logger.info("SUMMARY")
    logger.info("=" * 60)

    for component, passed in results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        logger.info(f"{status}: {component}")

    all_passed = all(results.values())

    if all_passed:
        logger.info("\n🎉 All tests passed! Ready to run workflow.")
        return 0
    else:
        logger.info("\n⚠️  Fix the errors above, then run this test again.")
        return 1


if __name__ == "__main__":
    import sys

    sys.exit(main())
