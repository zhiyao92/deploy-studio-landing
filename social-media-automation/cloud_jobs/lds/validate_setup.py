#!/usr/bin/env python3
"""
validate_setup.py — Validates configuration before deployment.

Run this script to check if all required credentials and settings are correct:

    python validate_setup.py

Exit code 0 = All checks passed
Exit code 1 = Some checks failed (see output)
"""

import os
import sys
from pathlib import Path

from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


def check_env_var(name: str, required: bool = False, prefix: str = "") -> bool:
    """Check if an environment variable is set.

    Args:
        name: Variable name.
        required: Whether this is required for basic operation.
        prefix: Prefix for display (e.g., "  ").

    Returns:
        True if set, False otherwise.
    """
    value = os.environ.get(name)
    status = "✅" if value else "❌"
    requirement = "[REQUIRED]" if required else "[Optional]"

    if value:
        # Mask sensitive values
        if name in ["ANTHROPIC_API_KEY", "SLACK_BOT_TOKEN", "META_ACCESS_TOKEN", "SLACK_SIGNING_SECRET"]:
            display_value = f"{value[:10]}...{value[-5:]}"
        else:
            display_value = value[:50]
        print(f"{prefix}{status} {name:40} {requirement:12} = {display_value}")
    else:
        print(f"{prefix}{status} {name:40} {requirement:12}")

    return bool(value)


def check_python_version() -> bool:
    """Check Python version is 3.11+."""
    version = sys.version_info
    if version.major >= 3 and version.minor >= 11:
        print(f"✅ Python version: {version.major}.{version.minor}.{version.micro}")
        return True
    else:
        print(f"❌ Python version: {version.major}.{version.minor}.{version.micro} (need 3.11+)")
        return False


def check_dependencies() -> bool:
    """Check if required packages are installed."""
    required = ["anthropic", "requests", "PIL", "dotenv"]
    all_ok = True

    for package in required:
        try:
            if package == "PIL":
                import PIL
                print(f"✅ {package:20} (Pillow) installed")
            elif package == "dotenv":
                import dotenv
                print(f"✅ {package:20} installed")
            else:
                __import__(package)
                print(f"✅ {package:20} installed")
        except ImportError:
            print(f"❌ {package:20} NOT installed - run: pip install -r requirements.txt")
            all_ok = False

    return all_ok


def check_config_file() -> bool:
    """Check if .env file exists."""
    env_path = Path(".env")
    if env_path.exists():
        print(f"✅ .env file exists")
        return True
    else:
        print(f"❌ .env file missing - copy from .env.example:")
        print(f"     cp .env.example .env")
        return False


def check_quotes_file() -> bool:
    """Check if quotes_data.json exists and is readable."""
    quotes_path = Path("quotes_data.json")
    if quotes_path.exists():
        try:
            import json
            with open(quotes_path) as f:
                data = json.load(f)
            quote_count = len(data.get("quotes", []))
            print(f"✅ quotes_data.json exists ({quote_count} quotes)")
            return True
        except Exception as e:
            print(f"❌ quotes_data.json invalid: {e}")
            return False
    else:
        print(f"⚠️  quotes_data.json missing (will generate quotes instead)")
        return True  # Not required, agent generates


def check_slack_connectivity() -> bool:
    """Test Slack API connectivity."""
    token = os.environ.get("SLACK_BOT_TOKEN")
    if not token:
        print(f"⚠️  SLACK_BOT_TOKEN not set (skipping connectivity check)")
        return True

    try:
        import requests
        resp = requests.post(
            "https://slack.com/api/auth.test",
            headers={"Authorization": f"Bearer {token}"},
            timeout=10,
        )
        data = resp.json()

        if data.get("ok"):
            bot_user = data.get("user_id", "unknown")
            print(f"✅ Slack API reachable (bot: {bot_user})")
            return True
        else:
            error = data.get("error", "unknown error")
            print(f"❌ Slack API error: {error}")
            return False

    except Exception as e:
        print(f"❌ Slack connectivity failed: {e}")
        return False


def check_anthropic_connectivity() -> bool:
    """Test Anthropic Claude API connectivity."""
    key = os.environ.get("ANTHROPIC_API_KEY")
    if not key:
        print(f"⚠️  ANTHROPIC_API_KEY not set (skipping connectivity check)")
        return True

    try:
        import anthropic
        client = anthropic.Anthropic(api_key=key)

        # Simple test message
        msg = client.messages.create(
            model="claude-opus-4-8",
            max_tokens=50,
            messages=[{"role": "user", "content": "Say 'Hello' only"}],
        )

        if msg.content:
            print(f"✅ Claude API reachable (model: claude-opus-4-8)")
            return True
        else:
            print(f"❌ Claude API returned empty response")
            return False

    except anthropic.APIError as e:
        print(f"❌ Claude API error: {e}")
        return False
    except Exception as e:
        print(f"❌ Claude connectivity failed: {e}")
        return False


def check_meta_connectivity() -> bool:
    """Test Meta Graph API connectivity."""
    token = os.environ.get("META_ACCESS_TOKEN")
    if not token:
        print(f"⚠️  META_ACCESS_TOKEN not set (publishing disabled)")
        return True

    try:
        import requests
        resp = requests.get(
            "https://graph.instagram.com/v18.0/me",
            params={"access_token": token},
            timeout=10,
        )
        data = resp.json()

        if "id" in data:
            print(f"✅ Meta Graph API reachable (account: {data['id']})")
            return True
        elif "error" in data:
            error = data["error"].get("message", "unknown error")
            print(f"❌ Meta API error: {error}")
            return False
        else:
            print(f"❌ Meta API returned unexpected response: {data}")
            return False

    except Exception as e:
        print(f"❌ Meta connectivity failed: {e}")
        return False


def main() -> int:
    """Run all validation checks."""
    print("\n" + "=" * 70)
    print("LDS QUOTES AGENT - SETUP VALIDATION")
    print("=" * 70 + "\n")

    checks = []

    # Environment
    print("ENVIRONMENT")
    print("-" * 70)
    checks.append(("Python Version", check_python_version()))
    checks.append(("Dependencies", check_dependencies()))
    checks.append(("Config File (.env)", check_config_file()))
    checks.append(("Quotes Database", check_quotes_file()))
    print()

    # Configuration
    print("CONFIGURATION")
    print("-" * 70)
    checks.append(
        ("ANTHROPIC_API_KEY", check_env_var("ANTHROPIC_API_KEY", required=True, prefix="  "))
    )
    checks.append(
        ("SLACK_BOT_TOKEN", check_env_var("SLACK_BOT_TOKEN", required=True, prefix="  "))
    )
    checks.append(
        ("SLACK_APPROVAL_CHANNEL", check_env_var("SLACK_APPROVAL_CHANNEL", prefix="  "))
    )
    checks.append(
        ("META_ACCESS_TOKEN", check_env_var("META_ACCESS_TOKEN", prefix="  "))
    )
    checks.append(
        ("INSTAGRAM_BUSINESS_ACCOUNT_ID", check_env_var("INSTAGRAM_BUSINESS_ACCOUNT_ID", prefix="  "))
    )
    checks.append(
        ("FACEBOOK_PAGE_ID", check_env_var("FACEBOOK_PAGE_ID", prefix="  "))
    )
    checks.append(
        ("THREADS_ACCOUNT_ID", check_env_var("THREADS_ACCOUNT_ID", prefix="  "))
    )
    print()

    # Connectivity
    print("CONNECTIVITY")
    print("-" * 70)
    checks.append(("Slack API", check_slack_connectivity()))
    checks.append(("Claude API", check_anthropic_connectivity()))
    checks.append(("Meta Graph API", check_meta_connectivity()))
    print()

    # Summary
    print("=" * 70)
    passed = sum(1 for _, ok in checks if ok)
    total = len(checks)
    print(f"SUMMARY: {passed}/{total} checks passed\n")

    if passed == total:
        print("✅ All checks passed! You're ready to deploy.")
        print("\nNext steps:")
        print("  1. Test locally: python agent.py")
        print("  2. Push to GitHub: git push -u origin main")
        print("  3. Add secrets: GitHub Settings → Secrets and variables")
        print("  4. Enable Actions: GitHub Actions tab")
        return 0
    else:
        print("❌ Some checks failed. See details above.")
        print("\nFix the errors and run this script again:")
        print("  python validate_setup.py")
        return 1


if __name__ == "__main__":
    sys.exit(main())
