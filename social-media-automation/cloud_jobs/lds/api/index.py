#!/usr/bin/env python3
"""Vercel serverless handler for Slack webhook.

Vercel's Python runtime requires `handler` to be a class extending
BaseHTTPRequestHandler (not a plain function).
"""

import hashlib
import hmac
import json
import logging
import os
import sys
import time
from http.server import BaseHTTPRequestHandler
from pathlib import Path
from urllib.parse import parse_qs

# Add repo root to path so agent.py and friends are importable
sys.path.insert(0, str(Path(__file__).parent.parent))

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def verify_slack_signature(body: str, timestamp: str, signature: str, signing_secret: str) -> bool:
    """Verify Slack request signature (and reject stale requests)."""
    try:
        if abs(time.time() - int(timestamp)) > 300:
            return False
    except (ValueError, TypeError):
        return False

    sig_basestring = f"v0:{timestamp}:{body}"
    my_signature = "v0=" + hmac.new(
        signing_secret.encode(), sig_basestring.encode(), hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(my_signature, signature)


def handle_regenerate(payload: dict) -> dict:
    """Handle [🔄 Choose a different one] button click."""
    try:
        from agent import QuotePipeline

        quote_id = payload["actions"][0]["value"].split("_", 1)[1]
        logger.info(f"Regenerating: user rejected quote {quote_id}")

        pipeline = QuotePipeline()
        result = pipeline.choose_different_quote(quote_id)

        return {"status": "ok"} if result == 0 else {"status": "error", "error": "Pipeline failed"}
    except Exception as e:
        logger.exception("Regenerate failed")
        return {"status": "error", "error": str(e)}


class handler(BaseHTTPRequestHandler):
    """Vercel Python entrypoint."""

    def _respond(self, status: int, data: dict) -> None:
        body = json.dumps(data).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        # Health check
        self._respond(200, {"status": "ok", "service": "lds-quotes-slack-webhook"})

    def do_POST(self):
        try:
            length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(length).decode() if length else ""

            # Verify signature against the RAW body, before any parsing
            timestamp = self.headers.get("X-Slack-Request-Timestamp", "")
            signature = self.headers.get("X-Slack-Signature", "")
            signing_secret = os.environ.get("SLACK_SIGNING_SECRET", "")

            if signing_secret and not verify_slack_signature(body, timestamp, signature, signing_secret):
                logger.warning("Invalid Slack signature")
                self._respond(401, {"error": "Unauthorized"})
                return

            # Slack interactivity posts form-encoded data: payload=<json>.
            # URL verification (Events API) posts raw JSON.
            content_type = self.headers.get("Content-Type", "")
            if "application/x-www-form-urlencoded" in content_type:
                payload = json.loads(parse_qs(body).get("payload", ["{}"])[0])
            else:
                payload = json.loads(body) if body else {}

            if payload.get("type") == "url_verification":
                self._respond(200, {"challenge": payload.get("challenge")})
                return

            logger.info(f"Received payload type: {payload.get('type')}")
            logger.info(f"Payload: {json.dumps(payload, indent=2)}")

            if payload.get("type") == "block_actions":
                action_id = payload.get("actions", [{}])[0].get("action_id", "")
                logger.info(f"Action ID: {action_id}")
                if action_id.startswith("regenerate_"):
                    result = handle_regenerate(payload)
                else:
                    result = {"status": "error", "error": f"Unknown action: {action_id}"}
            else:
                result = {"status": "error", "error": f"Unknown type: {payload.get('type')}"}

            self._respond(200 if result.get("status") == "ok" else 400, result)

        except Exception as e:
            logger.exception("Handler failed")
            self._respond(500, {"error": str(e)})
