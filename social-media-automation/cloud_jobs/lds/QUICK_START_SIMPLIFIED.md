# Quick Start - Simplified Version (No Meta API)

Get the LDS Quotes Agent running in 5 minutes. **Zero Meta API configuration needed.**

## What You'll Get

- ✅ Daily LDS quote generation (via Claude)
- ✅ Beautiful 1080×1080 graphics with random gradients
- ✅ Instagram-ready captions with hashtags
- ✅ Posted to Slack for your review
- ✅ Amendment loop (request changes, regenerate)
- ✅ Manual sharing to Instagram (you control timing)

## Prerequisites

- Python 3.11+
- A GitHub account
- A Slack workspace
- Anthropic Claude API key (free tier available)

## Step 1: Local Setup (2 minutes)

```bash
# Navigate to project
cd lds-quotes-agent

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy configuration
cp .env.example .env
```

## Step 2: Get Credentials (5 minutes)

### Anthropic Claude API Key

1. Go to [console.anthropic.com/account/keys](https://console.anthropic.com/account/keys)
2. Create new key (if needed)
3. Copy it
4. Paste into `.env`:
   ```
   ANTHROPIC_API_KEY=sk-ant-XXXXXXXXXXXXX
   ```

### Slack Bot Token

1. Go to [api.slack.com/apps](https://api.slack.com/apps)
2. Click **Create New App** → **From scratch**
3. Name: `LDS Quotes`, choose your workspace
4. Go to **OAuth & Permissions** (left sidebar)
5. Add **Bot Token Scopes**:
   - `chat:write` (post messages)
   - `files:write` (upload images)
6. Click **Install to Workspace**
7. Copy **Bot User OAuth Token** (`xoxb-...`)
8. Paste into `.env`:
   ```
   SLACK_BOT_TOKEN=xoxb-XXXXXXXXXXXXX
   ```
9. Create a Slack channel `#lds-quotes-drafts`
10. Add the bot to that channel

That's it! No Meta API needed.

## Step 3: Test Locally (1 minute)

```bash
# Dry run (generates locally, doesn't post to Slack)
DRY_RUN=true python agent.py

# Check output
ls -la drafts/
```

You should see a quote graphic PNG and metadata JSON.

## Step 4: Test Slack Integration (2 minutes)

```bash
# Post to Slack (requires SLACK_BOT_TOKEN)
python agent.py
```

Check your `#lds-quotes-drafts` Slack channel. You should see:
- 📷 Beautiful quote graphic
- 📝 Caption with hashtags
- ✅ [Approved] [Request Amendment] buttons

## Step 5: Deploy to GitHub (3 minutes)

```bash
# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: LDS Quotes Agent"

# Create repo on GitHub (web or CLI)
gh repo create lds-quotes-agent --private

# Push
git push -u origin main
```

## Step 6: Add GitHub Secrets (2 minutes)

1. Go to your GitHub repo → **Settings → Secrets and variables → Actions**
2. Click **New repository secret**
3. Add:
   - **Name**: `ANTHROPIC_API_KEY`
   - **Value**: (from `.env`)
4. Click **New repository secret** again
5. Add:
   - **Name**: `SLACK_BOT_TOKEN`
   - **Value**: (from `.env`)

Done! Only 2 secrets needed.

## Step 7: Enable GitHub Actions

1. Go to **Actions** tab
2. Click **I understand my workflows, go ahead and enable them**

## Step 8: Test Automated Run

1. Go to **Actions** → **LDS Quotes Daily Agent**
2. Click **Run workflow** → **Run workflow**
3. Wait 30 seconds
4. Check your Slack channel
5. You should see a new quote draft!

## Step 9: Try Approval Workflow

In Slack, in the `#lds-quotes-drafts` channel:

**Option A: Approve**
1. Click the **✅ Approved** button
2. Slack will acknowledge
3. Long-click the image
4. Tap **Copy** or **Share**
5. Open Instagram
6. Paste and share!

**Option B: Request Amendment**
1. Click the **✏️ Request Amendment** button
2. Enter your feedback (e.g., "Make it more uplifting")
3. Click **Submit**
4. Wait ~10 seconds
5. New version appears in Slack
6. Review and approve

## That's It! 🎉

Your automated quote generator is live:
- ✅ Runs daily at 9 AM UTC (configurable)
- ✅ Generates quotes via Claude
- ✅ Posts to Slack for your review
- ✅ Supports amendments with feedback
- ✅ Ready to share to Instagram manually

## What You Don't Need

❌ Meta API token  
❌ Instagram Business Account ID  
❌ Facebook Page ID  
❌ Threads Account ID  
❌ Webhook server  
❌ Lambda/GCP/Azure  

Just copy image from Slack → Post to Instagram manually. Simple!

## Cost: ~$0-50/month

Only Claude API costs money (quote generation). Everything else is free.

## Customization

### Change Schedule

Edit `.github/workflows/schedule_agent.yml`:
```yaml
schedule:
  - cron: "0 9 * * *"  # Change this
  # Daily 9 AM UTC = "0 9 * * *"
  # Twice daily = "0 6,18 * * *"
  # Sundays only = "0 9 * * 0"
```

### Customize Quotes

Edit `quotes_data.json` to add your own quotes, or Claude will generate new ones automatically.

### Change Graphics Style

Edit `graphics_engine.py` to:
- Modify color palettes
- Adjust font sizes
- Change text positioning

## Troubleshooting

**Python 3.11 not available?**
```bash
# Use whatever version you have (3.10+ works)
python3 --version
```

**Slack bot can't post?**
- Check bot has `files:write` and `chat:write` scopes
- Verify bot is in `#lds-quotes-drafts` channel
- Check `SLACK_BOT_TOKEN` is correct

**Claude API key invalid?**
- Go to [console.anthropic.com/account/keys](https://console.anthropic.com/account/keys)
- Create new key if needed
- Check for typos in `.env`

**GitHub Actions not running?**
- Go to **Actions** tab
- Click "I understand my workflows, go ahead and enable them"
- Check that GitHub Secrets are set (not env vars)

## Next Steps

1. ✅ You've completed all 9 steps!
2. Wait for tomorrow's scheduled run (9 AM UTC)
3. Or trigger manually: go to Actions tab → Run workflow
4. Share graphics to Instagram
5. Enjoy daily inspiration quotes! 📱✨

---

**Questions?** Check:
- `SIMPLIFIED_FLOW.md` - Detailed workflow explanation
- `README.md` - Complete documentation
- `validate_setup.py` - Check your setup

You're all set! 🚀
