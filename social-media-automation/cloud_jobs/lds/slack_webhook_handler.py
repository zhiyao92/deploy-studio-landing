#!/usr/bin/env python3
"""
slack_webhook_handler.py — Serverless webhook handler for Slack interactive actions.

Handles the [🔄 Choose a different one] button click from Slack, which re-runs
the pipeline with a different quote.
Designed to run as AWS Lambda, Google Cloud Functions, or similar serverless platform.

Environment Variables (in addition to config.py):
  - SLACK_SIGNING_SECRET: Used to verify Slack request signatures
  - S3_BUCKET: Bucket for storing draft metadata (optional, for persistence)

Deployment Example (AWS Lambda):
  1. Create a Lambda function with Python 3.11 runtime
  2. Set environment variables above
  3. Point API Gateway to this function's handler
  4. In Slack app settings, set Request URL to the API Gateway endpoint
  5. Subscribe to 'block_actions' events in Slack app
"""

import hashlib
import hmac
import json
import logging
import os
import time
from typing import Any, Optional
from urllib.parse import parse_qs

from dotenv import load_dotenv
import requests

# Load environment variables from .env file
load_dotenv()

logger = logging.getLogger("slack_webhook_handler")


class SlackRequestVerifier:
    """Verifies that requests come from Slack."""

    @staticmethod
    def verify_signature(
        body: str,
        timestamp: str,
        signature: str,
        signing_secret: str,
    ) -> bool:
        """Verify Slack request signature.

        Args:
            body: Raw request body as string.
            timestamp: X-Slack-Request-Timestamp header.
            signature: X-Slack-Signature header.
            signing_secret: Slack app signing secret.

        Returns:
            True if signature is valid, False otherwise.
        """
        # Check timestamp is within 5 minutes (prevent replay attacks)
        request_time = int(timestamp)
        current_time = int(time.time())
        if abs(current_time - request_time) > 300:
            logger.warning(f"Request timestamp too old: {request_time} vs {current_time}")
            return False

        # Verify signature
        sig_basestring = f"v0:{timestamp}:{body}"
        expected_signature = f"v0={hmac.new(
            signing_secret.encode(),
            sig_basestring.encode(),
            hashlib.sha256
        ).hexdigest()}"

        return hmac.compare_digest(signature, expected_signature)


class SlackActionHandler:
    """Handles interactive Slack actions."""

    def __init__(self):
        """Initialize handler."""
        self.signing_secret = os.environ.get("SLACK_SIGNING_SECRET", "")
        if not self.signing_secret:
            logger.warning("SLACK_SIGNING_SECRET not set; signature verification disabled")

    def handle_block_action(self, payload: dict) -> dict:
        """Handle block action (button click).

        Args:
            payload: Parsed JSON payload from Slack.

        Returns:
            Response dict with 'status' and optional 'error'.
        """
        try:
            action_id = payload["actions"][0]["action_id"]

            if action_id.startswith("regenerate_"):
                return self._handle_regenerate(payload)
            else:
                return {"status": "error", "error": f"Unknown action: {action_id}"}

        except (KeyError, IndexError) as e:
            logger.error(f"Failed to parse action: {e}")
            return {"status": "error", "error": str(e)}

    def _handle_regenerate(self, payload: dict) -> dict:
        """Handle [🔄 Choose a different one] button click.

        Re-runs the pipeline with a different quote and posts the new
        draft to Slack.

        Args:
            payload: Slack action payload.

        Returns:
            Response dict.
        """
        try:
            quote_id = payload["actions"][0]["value"].split("_", 1)[1]
            channel = payload["channel"]["id"]
            message_ts = payload["message"]["ts"]

            logger.info(f"Different quote requested (rejecting {quote_id})")

            # Mark the old buttons message so it can't be clicked twice
            self._update_approval_message(
                channel,
                message_ts,
                "Picking a different quote…",
            )

            # Import here to avoid circular dependency
            from agent import QuotePipeline

            pipeline = QuotePipeline()
            result = pipeline.choose_different_quote(quote_id)

            logger.info(f"Re-run result: {result}")
            return {"status": "ok"} if result == 0 else {
                "status": "error",
                "error": "Pipeline re-run failed; check logs",
            }

        except Exception as e:
            logger.exception("Regenerate handling failed")
            return {"status": "error", "error": str(e)}

    def _update_approval_message(
        self,
        channel: str,
        message_ts: str,
        status: str,
    ) -> None:
        """Update the approval message to show status.

        Args:
            channel: Slack channel ID.
            message_ts: Message timestamp.
            status: Status text to display.
        """
        from config import Config

        url = "https://slack.com/api/chat.update"
        headers = {
            "Authorization": f"Bearer {Config.SLACK_BOT_TOKEN}",
            "Content-Type": "application/json",
        }

        payload = {
            "channel": channel,
            "ts": message_ts,
            "text": f"✅ {status}",
            "blocks": [
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": f":white_check_mark: {status}",
                    },
                }
            ],
        }

        try:
            resp = requests.post(url, headers=headers, json=payload, timeout=10)
            resp.raise_for_status()
            logger.info(f"Updated message {message_ts} with status: {status}")
        except requests.RequestException as e:
            logger.error(f"Failed to update message: {e}")


# ============================================================================
# AWS Lambda Handler
# ============================================================================

def lambda_handler(event: dict, context: Any) -> dict:
    """AWS Lambda handler for Slack webhook.

    Args:
        event: Lambda event from API Gateway.
        context: Lambda context.

    Returns:
        Response dict with statusCode and body.
    """
    logging.basicConfig(level=logging.INFO)

    try:
        # Parse request
        body = event.get("body", "")
        headers = event.get("headers", {})
        content_type = headers.get("Content-Type", headers.get("content-type", ""))

        timestamp = headers.get("X-Slack-Request-Timestamp", "")
        signature = headers.get("X-Slack-Signature", "")

        # Verify request
        verifier = SlackRequestVerifier()
        signing_secret = os.environ.get("SLACK_SIGNING_SECRET", "")

        if signing_secret and not verifier.verify_signature(body, timestamp, signature, signing_secret):
            logger.warning("Invalid Slack signature")
            return {"statusCode": 401, "body": json.dumps({"error": "Unauthorized"})}

        # Slack interactive requests arrive as form-encoded payload=<json>.
        # URL verification arrives as raw JSON.
        if "application/x-www-form-urlencoded" in content_type:
            payload_raw = parse_qs(body).get("payload", ["{}"])[0]
            payload = json.loads(payload_raw)
        else:
            payload = json.loads(body) if body else {}

        # Handle Slack URL verification challenge
        if payload.get("type") == "url_verification":
            return {
                "statusCode": 200,
                "body": json.dumps({"challenge": payload.get("challenge")}),
            }

        # Handle actions
        handler = SlackActionHandler()

        if payload.get("type") == "block_actions":
            result = handler.handle_block_action(payload)
        else:
            result = {"status": "error", "error": f"Unknown type: {payload.get('type')}"}

        return {
            "statusCode": 200 if result.get("status") == "ok" else 400,
            "body": json.dumps(result),
        }

    except Exception as e:
        logger.exception("Lambda handler failed")
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)}),
        }


# ============================================================================
# Local Testing
# ============================================================================

if __name__ == "__main__":
    logging.basicConfig(level=logging.DEBUG)

    # Test Slack URL verification
    test_challenge = {
        "type": "url_verification",
        "challenge": "test-challenge-token",
    }

    result = lambda_handler(
        {
            "body": json.dumps(test_challenge),
            "headers": {
                "X-Slack-Request-Timestamp": str(int(time.time())),
                "X-Slack-Signature": "v0=test",  # Skipped if not set in env
            },
        },
        None,
    )

    print(json.dumps(result, indent=2))
