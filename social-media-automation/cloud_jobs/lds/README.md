# LDS Quotes: Daily Inspiration Agent

An autonomous social media agent pipeline that generates, designs, and queues inspirational quote graphics for the "LDS Quotes: Daily Inspiration" iOS app and Instagram account (@lds.quotes.official).

## Pipeline Overview

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. QUOTE GENERATION                                             │
│    - Select from quotes_data.json OR                            │
│    - Generate new authentic LDS quote via Claude API            │
└─────────────────┬───────────────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────────────┐
│ 2. CAPTION & HASHTAG GENERATION                                 │
│    - Claude generates engaging Instagram caption                │
│    - Generates 8-12 optimized hashtags                          │
│    - Maintains LDS-focused, authentic voice                     │
└─────────────────┬───────────────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────────────┐
│ 3. GRAPHICS RENDERING                                           │
│    - Generate random CSS-style smooth gradient                  │
│    - Render 1080x1350px 4:5 portrait graphic                   │
│    - Center quote text (serif, large)                           │
│    - Add author name (sans-serif, smaller)                      │
│    - Semi-transparent dark overlay for text legibility          │
└─────────────────┬───────────────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────────────┐
│ 4. SLACK APPROVAL WORKFLOW                                      │
│    - Upload graphic to Slack                                    │
│    - Post with interactive buttons:                             │
│      [✅ Approve & Publish]  [✏️ Request Amendment]             │
│    - User feedback loops back to regeneration                   │
└─────────────────┬───────────────────────────────────────────────┘
                  │
         ┌────────┴────────┐
         │                 │
    [Approve]         [Amendment]
         │                 │
         ▼                 ▼
    Publish to      Regenerate Caption
    Meta Platforms  with Feedback
         │                 │
         │            [Re-post to Slack]
         │
┌────────▼─────────────────────────────────────────────────────────┐
│ 5. META GRAPH API PUBLISHING                                     │
│    - Publish to Instagram (image + caption)                      │
│    - Cross-post to Facebook Group                                │
│    - Post to Threads (text-only for now)                         │
└──────────────────────────────────────────────────────────────────┘
```

## Features

- **Autonomous LLM-Powered Quote Generation**: Uses Claude to generate authentic LDS quotes focusing on prophets, apostles, scriptures, and respected leaders.
- **Intelligent Caption Generation**: Crafts engaging, reflective Instagram captions with optimized hashtags.
- **Dynamic Graphics Engine**: Renders 1080x1350px (4:5) graphics with unique random gradients every time.
- **Slack-First Approval**: Routes all content to Slack for manual review before publishing—no auto-posting to social media.
- **Amendment Loop**: Users can request caption improvements; AI regenerates and re-posts to Slack.
- **Multi-Platform Publishing**: Publishes to Instagram, Facebook, and Threads via Meta Graph API.
- **GitHub Actions Automation**: Runs on a configurable schedule (default: daily at 9 AM UTC).
- **Secure Credential Management**: All secrets stored in GitHub Repository Secrets.

## Setup Guide

### Prerequisites

- Python 3.11+
- A GitHub repository (private recommended for sensitive data)
- Anthropic Claude API key (for quote/caption generation)
- Slack workspace with a bot token (for approval workflow)
- Meta Business Account with Instagram Business and Facebook Page (for publishing)
- Optional: Custom fonts (TTF) for enhanced graphics

### Step 1: Clone and Local Setup

```bash
# Clone the repository
git clone https://github.com/YOUR_ORG/lds-quotes-agent.git
cd lds-quotes-agent

# Install dependencies
pip install -r requirements.txt

# Copy environment template
cp .env.example .env

# Edit .env with your credentials
nano .env  # Fill in all required fields
```

### Step 2: Obtain API Credentials

#### Anthropic Claude API

1. Go to [console.anthropic.com](https://console.anthropic.com/account/keys)
2. Create or copy your API key
3. Add to `.env`: `ANTHROPIC_API_KEY=sk-ant-...`

#### Slack Bot Token

1. Go to [api.slack.com/apps](https://api.slack.com/apps)
2. Create a new app (or select existing)
3. Navigate to **OAuth & Permissions**
4. Add these **Bot Token Scopes**:
   - `chat:write` (post messages)
   - `files:write` (upload images)
5. Install the app to your workspace
6. Copy the **Bot User OAuth Token** (`xoxb-...`)
7. Add to `.env`: `SLACK_BOT_TOKEN=xoxb-...`
8. Add the bot to your approval channel (e.g., `#lds-quotes-drafts`)

#### Meta Graph API (for publishing)

1. Go to [developers.facebook.com](https://developers.facebook.com)
2. Create a new app or select existing
3. Add **Instagram** product to your app
4. Go to **Settings → Basic** and copy your **App ID** and **App Secret**
5. Go to **Roles → Apps and Websites** and generate a **User Access Token** with these permissions:
   - `instagram_business`
   - `instagram_content_publish`
   - `pages_manage_posts`
   - `pages_read_engagement`
6. Get your **Instagram Business Account ID**:
   - Go to Instagram Settings → Business Account
   - Copy the numeric ID from the URL or settings
7. Add to `.env`:
   ```
   META_ACCESS_TOKEN=EAAxxxxxxxx...
   INSTAGRAM_BUSINESS_ACCOUNT_ID=17841xxxxxxx
   FACEBOOK_PAGE_ID=1234567890
   THREADS_ACCOUNT_ID=17841xxxxxxx
   ```

### Step 3: GitHub Repository Setup

1. Push code to your private GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: LDS Quotes Agent pipeline"
   git remote add origin https://github.com/YOUR_ORG/lds-quotes-agent.git
   git push -u origin main
   ```

2. Add Repository Secrets:
   - Go to **Settings → Secrets and variables → Actions**
   - Add each required secret:
     - `ANTHROPIC_API_KEY`
     - `SLACK_BOT_TOKEN`
     - `META_ACCESS_TOKEN` (if publishing)
     - `INSTAGRAM_BUSINESS_ACCOUNT_ID` (if publishing)
     - `FACEBOOK_PAGE_ID` (if publishing)
     - `THREADS_ACCOUNT_ID` (if publishing)

3. Enable GitHub Actions:
   - Go to **Actions** tab
   - Click **Enable Actions**

### Step 4: Test Locally

```bash
# Dry run (generates quote but doesn't post to Slack)
DRY_RUN=true python agent.py

# Full run (posts draft to Slack)
python agent.py
```

### Step 5: Deploy to GitHub Actions

The workflow at `.github/workflows/schedule_agent.yml` automatically:

- Runs daily at 9 AM UTC (configurable via cron expression)
- Can be manually triggered from Actions tab
- Uploads generated drafts as artifacts for record-keeping
- Posts failures to Slack

To adjust the schedule, edit the cron line in `.github/workflows/schedule_agent.yml`:

```yaml
schedule:
  - cron: "0 9 * * *"  # Daily at 9 AM UTC
  # Or weekly: "0 9 * * 0"  # Sundays at 9 AM UTC
  # Or twice daily: "0 6,18 * * *"  # 6 AM and 6 PM UTC
```

## Configuration

### Environment Variables

**Required:**
- `ANTHROPIC_API_KEY`: Claude API key
- `SLACK_BOT_TOKEN`: Slack bot token
- `SLACK_APPROVAL_CHANNEL`: Slack channel for approvals (default: `#lds-quotes-drafts`)

**Optional (for Meta publishing):**
- `META_ACCESS_TOKEN`: Meta Graph API token
- `INSTAGRAM_BUSINESS_ACCOUNT_ID`: Instagram account ID
- `FACEBOOK_PAGE_ID`: Facebook page ID
- `THREADS_ACCOUNT_ID`: Threads account ID
- `PUBLISH_TO_INSTAGRAM`: Enable Instagram publishing (default: `true`)
- `PUBLISH_TO_FACEBOOK`: Enable Facebook publishing (default: `true`)
- `PUBLISH_TO_THREADS`: Enable Threads publishing (default: `true`)

**Runtime:**
- `DEBUG`: Enable debug logging (default: `false`)
- `DRY_RUN`: Skip posting to Slack, just generate locally (default: `false`)

### Quotes Data

Edit `quotes_data.json` to add or update LDS quotes:

```json
{
  "quotes": [
    {
      "id": "unique-id",
      "text": "Quote text (keep < 140 chars for Instagram)",
      "speaker": "Author Name",
      "source": "Talk/Document Title",
      "year": 2024
    }
  ]
}
```

The pipeline will:
1. Pick one quote per day deterministically (same quote if re-run same day)
2. Fall back to generating a new quote if `quotes_data.json` is empty

## Usage

### Manual Run

```bash
# Post a draft to Slack (normal operation)
python agent.py

# Generate locally without posting
DRY_RUN=true python agent.py

# Run with debug logging
DEBUG=true python agent.py
```

### Slack Approval Workflow

When a draft is posted to Slack:

1. **[✅ Approve & Publish]** button: Immediately publishes to all configured platforms (Instagram, Facebook, Threads).
2. **[✏️ Request Amendment]** button: Opens a modal where you can enter feedback. The agent regenerates the caption based on your feedback and re-posts the revised version to Slack for another review cycle.

### GitHub Actions

1. **Automated Run**: Runs daily at 9 AM UTC (configurable)
2. **Manual Run**: Go to **Actions** → **LDS Quotes Daily Agent** → **Run workflow**
3. **Dry Run**: In the workflow dispatch input, set `dry_run` to `true`

## File Structure

```
lds-quotes-agent/
├── agent.py                          # Main orchestration logic
├── graphics_engine.py               # Image rendering with Pillow
├── quote_generator.py               # LLM-based quote/caption generation
├── slack_handler.py                 # Slack approval workflow
├── meta_handler.py                  # Meta Graph API publishing
├── config.py                        # Configuration management
├── requirements.txt                 # Python dependencies
├── quotes_data.json                 # LDS quotes database
├── .env.example                     # Environment template
├── .gitignore                       # Excludes .env, venv/, __pycache__
├── README.md                        # This file
├── .github/
│   └── workflows/
│       └── schedule_agent.yml       # GitHub Actions workflow
└── drafts/                          # Generated drafts (created at runtime)
    └── YYYY-MM-DD/
        ├── quote-id_metadata.json
        └── quote-id_graphic.png
```

## Architecture

### Modules

**`agent.py`**: Main pipeline orchestration
- `QuotePipeline`: Coordinates all steps
- `run()`: Execute daily pipeline
- `publish_approved_post()`: Handle Slack approval callback
- `regenerate_with_feedback()`: Handle amendment requests

**`graphics_engine.py`**: Image generation
- `GradientGenerator`: Creates random CSS-style gradients
- `QuoteGraphicsEngine`: Renders text overlays on gradients

**`quote_generator.py`**: LLM integration
- `QuoteRepository`: Loads quotes from JSON
- `LDSQuoteGenerator`: Uses Claude to create authentic LDS quotes
- `CaptionGenerator`: Generates captions and hashtags

**`slack_handler.py`**: Slack API integration
- `SlackHandler`: Posts drafts with interactive buttons
- `post_draft_for_approval()`: Upload image and create approval message
- `post_status_update()`: Send status notifications

**`meta_handler.py`**: Meta Graph API integration
- `MetaGraphHandler`: Publishes to Instagram, Facebook, Threads
- `publish_to_instagram()`: Two-step process (create container, publish)
- `publish_all()`: Publish to multiple platforms at once

**`config.py`**: Configuration validation
- `Config`: Centralized config class with validation

## Error Handling

The pipeline is resilient:

- **Missing Quote**: Falls back to generating a new quote via LLM
- **API Failures**: Logs errors, posts failure notifications to Slack
- **Slack Posting Fails**: Doesn't crash; logs and continues
- **Meta Publishing Fails**: Records error in Slack, doesn't affect future runs
- **Invalid JSON from LLM**: Defensive parsing with fallbacks

## Security

- **Never commit `.env`**: Use `.env.example` as template
- **GitHub Secrets**: All credentials stored as repository secrets, not in code
- **No hardcoded tokens**: All sensitive data from environment variables
- **Slack API scopes**: Minimal required permissions (chat:write, files:write)
- **Meta token rotation**: Store in GitHub Secrets, rotate periodically

## Customization

### Modify Quote Subjects

Edit the prompt in `quote_generator.py::LDSQuoteGenerator.generate_quote()` to focus on specific topics (e.g., family, faith, service).

### Change Graphic Style

Edit `graphics_engine.py`:
- Modify `color_palettes` to change color schemes
- Adjust `margin`, `padding`, font sizes for different layouts
- Swap fonts by placing TTF files in a `fonts/` directory

### Change Schedule

Edit `.github/workflows/schedule_agent.yml`:
```yaml
schedule:
  - cron: "0 9 * * *"  # Change the cron expression
```

[Cron helper](https://crontab.guru/) for schedule syntax.

### Disable Platforms

Set in `.env` or GitHub Secrets:
```
PUBLISH_TO_INSTAGRAM=false
PUBLISH_TO_FACEBOOK=false
PUBLISH_TO_THREADS=false
```

## Troubleshooting

### "SLACK_BOT_TOKEN not set"
- Verify token in `.env` or GitHub Secrets
- Check token hasn't expired (regenerate if needed)
- Ensure bot has access to the approval channel

### "Failed to upload image to Slack"
- Check bot has `files:write` permission
- Verify Slack API token is still valid
- Ensure image is valid PNG (pipeline generates this)

### "Meta publishing failed"
- Verify `META_ACCESS_TOKEN` hasn't expired
- Check Instagram Business Account ID is correct
- Ensure token has `instagram_content_publish` permission
- Verify image URL is publicly accessible

### "Quote generation failed"
- Check `ANTHROPIC_API_KEY` is valid
- Verify Claude API quota not exceeded
- Check network connection in GitHub Actions logs

### Quotes not changing daily
- Quote selection is deterministic per day (same seed)
- To force a new quote: manually edit `quotes_data.json` or add new entries
- Or wait until tomorrow for the seed to change

## Contributing

Contributions welcome! Areas for enhancement:

- [ ] Support for additional platforms (TikTok, YouTube Shorts, Pinterest)
- [ ] Batch scheduling (e.g., pre-generate multiple quotes)
- [ ] Advanced image effects (filters, overlays, borders)
- [ ] Multi-language quote support
- [ ] Analytics integration (track post performance)

## License

[Your License Here]

## Support

For issues or questions:
1. Check GitHub Issues
2. Review troubleshooting section above
3. Enable `DEBUG=true` for detailed logs
4. Check GitHub Actions workflow run logs

---

**Last Updated**: July 2024
**Maintained By**: [Your Organization]
