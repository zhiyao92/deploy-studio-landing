# Bondify Social

Automated social media content pipeline for the Bondify app. Pulls quotes from LDS Quotes Daily Inspiration API, generates beautiful Instagram graphics, and publishes to Instagram via Meta Graph API. Supports both Slack approval workflow and direct auto-publishing.

## Features

- **Quote Integration**: Fetch quotes from LDS Quotes API
- **AI-Generated Captions**: Uses Claude to generate engaging Instagram captions with hashtags
- **Graphic Rendering**: Creates 1080x1350px portrait graphics with gradient backgrounds
- **Slack Workflow**: Post drafts to Slack for team approval before publishing
- **Direct Instagram Publishing**: Automatic posting via Meta Graph API
- **Flexible Workflows**:
  - Approval-first: Slack → Instagram (review before publish)
  - Auto-publish: Instagram directly (no approval needed)
  - Hybrid: Auto-publish to Instagram, notify Slack with status

## Architecture

```
agent.py (Main Pipeline)
├── lds_quotes_client.py (Fetch quotes from API)
├── caption_generator.py (Generate captions with Claude)
├── graphics_engine.py (Render quote graphics)
├── slack_handler.py (Post to Slack channel)
└── instagram_handler.py (Publish to Instagram)
```

## Prerequisites

1. **API Keys**:
   - Anthropic API key (Claude access)
   - LDS Quotes API key
   - Slack Bot token
   - Meta Graph API access token

2. **Slack Setup**:
   - Create a Slack App: https://api.slack.com/apps
   - Add Bot scopes: `chat:write`, `files:write`, `channels:read`
   - Invite bot to your approval channel: `/invite @BondifyBot`

3. **Meta/Instagram Setup**:
   - Create Meta Business Account
   - Create Instagram Business Account
   - Generate Graph API access token with permissions:
     - `instagram_basic`
     - `instagram_content_publish`
     - `pages_manage_posts`
   - Get your Instagram Business Account ID

## Installation

1. **Clone/Setup**:
   ```bash
   cd "/Users/kelvintan/AI Project/Bondify Social"
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

2. **Configure**:
   ```bash
   cp .env.example .env
   # Edit .env with your API keys and settings
   ```

## Usage

### One-time publish with CLI

```bash
python3 agent.py
```

### Publish excluding a specific quote

```bash
python3 agent.py quote_id_123
```

### Dry-run (generate, don't publish)

```bash
DRY_RUN=true python3 agent.py
```

### Debug mode

```bash
DEBUG=true python3 agent.py
```

## Workflows

### Workflow 1: Slack Approval + Instagram Publishing

**Best for**: Teams that want to review before going live.

```env
REQUIRE_SLACK_APPROVAL=true
AUTO_PUBLISH_INSTAGRAM=false
```

**Flow**:
1. Generate quote graphic and caption
2. Post to Slack with "Approve & Publish" and "Choose Different" buttons
3. On approval: Auto-publish to Instagram
4. On "Choose Different": Generate new quote and re-post to Slack

### Workflow 2: Direct Instagram Publishing (No Approval)

**Best for**: Individual accounts or pre-approved content.

```env
REQUIRE_SLACK_APPROVAL=false
AUTO_PUBLISH_INSTAGRAM=true
```

**Flow**:
1. Generate quote graphic and caption
2. Directly publish to Instagram
3. Notify Slack with status (success/error)

### Workflow 3: Auto-Publish + Slack Status Updates

**Best for**: Publishing to Instagram while keeping team informed.

```env
REQUIRE_SLACK_APPROVAL=false
AUTO_PUBLISH_INSTAGRAM=true
```

Same as Workflow 2 — Instagram is published directly, Slack gets status notifications only.

## File Structure

```
Bondify Social/
├── agent.py                    # Main orchestration pipeline
├── config.py                   # Configuration management
├── lds_quotes_client.py       # LDS Quotes API client
├── caption_generator.py        # Claude-powered caption generation
├── graphics_engine.py          # Graphic rendering (PIL)
├── slack_handler.py            # Slack integration
├── instagram_handler.py        # Instagram publishing
├── requirements.txt            # Python dependencies
├── .env.example               # Environment template
├── .env                        # Local config (git-ignored)
├── drafts/                     # Saved drafts (metadata + images)
├── logs/                       # Application logs
└── README.md                   # This file
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `ANTHROPIC_API_KEY` | Yes | — | Claude API key |
| `LLM_MODEL` | No | `claude-opus-4-8` | Claude model to use |
| `LDS_QUOTES_API_URL` | No | `https://api.ldsquotes.com` | LDS Quotes API base URL |
| `LDS_QUOTES_API_KEY` | Yes | — | LDS Quotes API key |
| `SLACK_BOT_TOKEN` | Yes | — | Slack Bot token |
| `SLACK_APPROVAL_CHANNEL` | No | `#bondify-drafts` | Slack channel for drafts |
| `META_ACCESS_TOKEN` | Yes* | — | Meta Graph API access token |
| `INSTAGRAM_BUSINESS_ACCOUNT_ID` | Yes* | — | Instagram Business Account ID |
| `AUTO_PUBLISH_INSTAGRAM` | No | `false` | Auto-publish to Instagram |
| `REQUIRE_SLACK_APPROVAL` | No | `true` | Require Slack approval |
| `BONDIFY_APP_STORE_URL` | No | App Store URL | CTA link in captions |
| `DEBUG` | No | `false` | Enable debug logging |
| `DRY_RUN` | No | `false` | Generate but don't publish |

*Required if `AUTO_PUBLISH_INSTAGRAM=true`

## Troubleshooting

### "SLACK_BOT_TOKEN not set"

Make sure your `.env` file exists and has the token. The bot also needs to be invited to the channel:
```
/invite @BondifyBot
```

### "Could not resolve channel"

Either:
1. Add `channels:read` scope to the bot token, OR
2. Set `SLACK_APPROVAL_CHANNEL` to the channel ID (not name)

### "Instagram publishing failed"

Check:
1. `META_ACCESS_TOKEN` is valid and not expired
2. `INSTAGRAM_BUSINESS_ACCOUNT_ID` is correct (not your personal IG username)
3. Token has `instagram_content_publish` permission
4. Image URL is publicly accessible (for Meta Graph API)

### "No matching LDS Quotes API endpoint"

Verify:
1. `LDS_QUOTES_API_URL` is correct
2. `LDS_QUOTES_API_KEY` is valid
3. API server is running and accessible

## Examples

### Example 1: Preview + Approve + Publish Workflow

```bash
# Generate and post to Slack
AUTO_PUBLISH_INSTAGRAM=false REQUIRE_SLACK_APPROVAL=true python3 agent.py

# In Slack, click "Approve & Publish"
# (Separate webhook/function handles this)
```

### Example 2: Auto-publish Daily Quotes

```bash
# Schedule with cron
0 9 * * * cd /path/to/Bondify\ Social && source venv/bin/activate && AUTO_PUBLISH_INSTAGRAM=true REQUIRE_SLACK_APPROVAL=false python3 agent.py
```

### Example 3: Dry-run to Test Configuration

```bash
# Test all integrations without publishing
DRY_RUN=true DEBUG=true python3 agent.py
```

## Next Steps

1. **Setup Slack approval webhook** (for "Approve & Publish" button handling)
2. **Deploy to serverless** (AWS Lambda, Google Cloud Functions, Vercel)
3. **Add schedule** (Cloud Scheduler, GitHub Actions, cron)
4. **Expand graphics** (add logos, custom fonts, effects)
5. **Analytics** (track post performance, hashtag efficacy)

## License

Proprietary — Bondify Social

## Support

For issues or questions, open an issue or contact the development team.
