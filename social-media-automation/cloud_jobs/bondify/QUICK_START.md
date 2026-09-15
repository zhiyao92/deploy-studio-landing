# Bondify Social — Quick Start

Get up and running in 5 minutes.

## 1. Setup

```bash
cd "/Users/kelvintan/AI Project/Bondify Social"
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## 2. Configure

```bash
cp .env.example .env
# Edit .env and add your API keys:
# - ANTHROPIC_API_KEY
# - LDS_QUOTES_API_KEY
# - SLACK_BOT_TOKEN
# - META_ACCESS_TOKEN (if auto-publishing)
# - INSTAGRAM_BUSINESS_ACCOUNT_ID (if auto-publishing)
```

## 3. Test

```bash
# Dry-run (generate, don't publish)
DRY_RUN=true DEBUG=true python3 agent.py
```

If dry-run succeeds, you're ready to go.

## 4. Choose Your Workflow

### Option A: Slack Approval + Instagram (Recommended)

```bash
# Edit .env
REQUIRE_SLACK_APPROVAL=true
AUTO_PUBLISH_INSTAGRAM=false

# Run
python3 agent.py

# Check Slack — approve or choose different
```

### Option B: Auto-Publish to Instagram

```bash
# Edit .env
REQUIRE_SLACK_APPROVAL=false
AUTO_PUBLISH_INSTAGRAM=true

# Run
python3 agent.py

# Post goes live immediately to Instagram
```

## 5. Automate (Optional)

### Using cron (daily at 9 AM)

```bash
0 9 * * * cd /Users/kelvintan/AI\ Project/Bondify\ Social && source venv/bin/activate && python3 agent.py >> logs/cron.log 2>&1
```

### Using GitHub Actions

Create `.github/workflows/daily-post.yml`:

```yaml
name: Daily Bondify Post

on:
  schedule:
    - cron: '0 9 * * *'

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - run: pip install -r requirements.txt
      - run: python3 agent.py
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
          LDS_QUOTES_API_KEY: ${{ secrets.LDS_QUOTES_API_KEY }}
          SLACK_BOT_TOKEN: ${{ secrets.SLACK_BOT_TOKEN }}
          META_ACCESS_TOKEN: ${{ secrets.META_ACCESS_TOKEN }}
          INSTAGRAM_BUSINESS_ACCOUNT_ID: ${{ secrets.INSTAGRAM_BUSINESS_ACCOUNT_ID }}
```

## Troubleshooting

**Issue**: "SLACK_BOT_TOKEN not set"
- **Fix**: Copy `.env.example` to `.env` and fill in the values

**Issue**: "Could not resolve channel"
- **Fix**: Invite the bot to the Slack channel: `/invite @BondifyBot`

**Issue**: "Instagram publishing failed"
- **Fix**: Verify `META_ACCESS_TOKEN` is not expired and has correct permissions

**Issue**: "LDS Quotes API error"
- **Fix**: Check `LDS_QUOTES_API_URL` and `LDS_QUOTES_API_KEY` are correct

## Architecture Overview

```
Input: LDS Quotes API
   ↓
Claude: Generate caption + hashtags
   ↓
Graphics: Render 1080x1350 image
   ↓
Decision: Approval-first or auto-publish?
   ├─→ Slack: Post for review
   │    ├─→ Approve → Instagram
   │    └─→ Different → loop back
   └─→ Instagram: Direct publish + Slack notification
```

## What's Next?

1. **Setup approval workflow** (if using Slack approval)
2. **Test a live post** to Instagram
3. **Schedule daily** (cron or GitHub Actions)
4. **Monitor & refine** captions and graphics

## Files

| File | Purpose |
|------|---------|
| `agent.py` | Main pipeline |
| `config.py` | Configuration |
| `lds_quotes_client.py` | Fetch quotes |
| `caption_generator.py` | Generate captions |
| `graphics_engine.py` | Render images |
| `slack_handler.py` | Slack integration |
| `instagram_handler.py` | Instagram publishing |
| `.env.example` | Config template |
| `README.md` | Full documentation |

## Support

See `README.md` for detailed docs and advanced configuration.
