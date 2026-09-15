#!/usr/bin/env python3
"""
setup_buffer.py — One-time helper to verify Buffer + Cloudinary setup.

Run after filling BUFFER_ACCESS_TOKEN (and optionally the Cloudinary vars)
in .env:

    python setup_buffer.py

It verifies the token, lists your channels so you can copy the Instagram
channel ID into BUFFER_CHANNEL_ID, and (if Cloudinary is configured)
uploads a tiny test image to confirm hosting works.
"""

from dotenv import load_dotenv

load_dotenv()

import logging
import sys

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger("setup_buffer")


def check_buffer() -> bool:
    """Verify the Buffer token and list channels."""
    logger.info("=" * 60)
    logger.info("Checking Buffer API access")
    logger.info("=" * 60)

    try:
        from buffer_handler import BufferHandler

        buffer = BufferHandler()
        org_id = buffer.get_organization_id()
        logger.info(f"✓ Token valid. Organization ID: {org_id}")

        channels = buffer.get_channels()
        if not channels:
            logger.warning(
                "⚠️  No channels connected. Connect Instagram at https://buffer.com "
                "(Channels → Connect)."
            )
            return False

        logger.info(f"✓ Found {len(channels)} channel(s):")
        instagram_found = False
        for c in channels:
            marker = ""
            if c.get("service", "").lower() == "instagram":
                marker = "  ← put this ID in BUFFER_CHANNEL_ID"
                instagram_found = True
            logger.info(
                f"  - {c.get('service')}: {c.get('displayName') or c.get('name')} "
                f"(id: {c['id']}){marker}"
            )

        if not instagram_found:
            logger.warning("⚠️  No Instagram channel found — connect one in Buffer.")
            return False

        return True

    except Exception as e:
        logger.error(f"❌ Buffer check failed: {e}")
        return False


def check_cloudinary() -> bool:
    """Upload a 1x1 test image to verify Cloudinary hosting."""
    logger.info("=" * 60)
    logger.info("Checking Cloudinary image hosting")
    logger.info("=" * 60)

    try:
        from image_host import ImageHost

        # Minimal 1x1 transparent PNG
        import base64

        png_1x1 = base64.b64decode(
            "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJ"
            "AAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
        )

        host = ImageHost()
        url = host.upload(png_1x1, public_id="bondify_setup_test")
        logger.info(f"✓ Cloudinary upload works: {url}")
        return True

    except EnvironmentError as e:
        logger.warning(f"⚠️  Cloudinary not configured yet: {e}")
        return False
    except Exception as e:
        logger.error(f"❌ Cloudinary check failed: {e}")
        return False


def main() -> int:
    buffer_ok = check_buffer()
    cloudinary_ok = check_cloudinary()

    logger.info("=" * 60)
    logger.info("SUMMARY")
    logger.info("=" * 60)
    logger.info(f"{'✅' if buffer_ok else '❌'} Buffer")
    logger.info(f"{'✅' if cloudinary_ok else '❌'} Cloudinary")

    if buffer_ok and cloudinary_ok:
        logger.info("\n🎉 Buffer publishing is ready. Test with DRY_RUN=true first.")
        return 0

    logger.info("\n⚠️  Fix the items above, then run this script again.")
    return 1


if __name__ == "__main__":
    sys.exit(main())
