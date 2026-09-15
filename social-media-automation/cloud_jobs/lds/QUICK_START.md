# Quick Start Guide

Get the LDS Quotes Agent running in 5 minutes.

## Prerequisites

- Python 3.11+
- A GitHub account (for CI/CD)
- A Slack workspace (for approvals)
- Anthropic Claude API key (for quote generation)
- Meta Business Account (for publishing to Instagram/Facebook/Threads)

## Step 1: Local Setup (5 minutes)

```bash
# Clone or navigate to project
cd lds-quotes-agent

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy configuration template
cp .env.example .env
```

## Step 2: Get API Credentials (10 minutes)

### Anthropic Claude API Key

1. Go to [console.anthropic.com/account/keys](https://console.anthropic.com/account/keys)
2. Create new key (if needed) and copy it
3. Paste into `.env`:
   ```
   ANTHROPIC_API_KEY=sk-ant-XXXXXXXXXXXXX
   ```

### Slack Bot Token

1. Go to [api.slack.com/apps](https://api.slack.com/apps)
2. Click **Create New App** → **From scratch**
3. Enter name: `LDS Quotes Agent`, choose your workspace
4. Go to **OAuth & Permissions** in left sidebar
5. Under **Scopes → Bot Token Scopes**, add:
   - `chat:write`
   - `files:write`
6. Click **Install to Workspace** at the top
7. Copy the **Bot User OAuth Token** (starts with `xoxb-`)
8. Paste into `.env`:
   ```
   SLACK_BOT_TOKEN=xoxb-XXXXXXXXXXXXX
   ```
9. In Slack, create a channel `#lds-quotes-drafts` and add the bot

### Meta Access Token (Optional, for Publishing)

1. Go to [developers.facebook.com](https://developers.facebook.com)
2. Create app or select existing
3. Add **Instagram** product
4. Go to **Settings → Basic**, copy App ID
5. Go to **Roles & Seats → Admins**, generate User Access Token
6. Request these permissions:
   - `instagram_business`
   - `instagram_content_publish`
   - `pages_manage_posts`
   - `pages_read_engagement`
7. Copy token into `.env`:
   ```
   META_ACCESS_TOKEN=EAAxxxxxxxxxx
   ```
8. Find Instagram Business Account ID and paste:
   ```
   INSTAGRAM_BUSINESS_ACCOUNT_ID=17841xxxxxxx
   ```
9. Same for Facebook Page ID:
   ```
   FACEBOOK_PAGE_ID=1234567890
   ```

## Step 3: Test Locally (2 minutes)

```bash
# Dry run (generates locally, doesn't post to Slack)
DRY_RUN=true python agent.py

# Check output
ls -la drafts/
```

You should see a new directory with quote metadata and PNG graphic.

## Step 4: Deploy to GitHub (3 minutes)

```bash
# Initialize git repo (if not already)
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

## Step 5: Add GitHub Secrets (2 minutes)

1. Go to your GitHub repo → **Settings → Secrets and variables → Actions**
2. Add these secrets:
   - `ANTHROPIC_API_KEY`: (from .env)
   - `SLACK_BOT_TOKEN`: (from .env)
   - `META_ACCESS_TOKEN`: (from .env, if publishing)
   - `INSTAGRAM_BUSINESS_ACCOUNT_ID`: (from .env, if publishing)
   - `FACEBOOK_PAGE_ID`: (from .env, if publishing)
   - `THREADS_ACCOUNT_ID`: (from .env, if publishing)

## Step 6: Enable GitHub Actions

1. Go to **Actions** tab in your repo
2. Click **I understand my workflows, go ahead and enable them**

## Step 7: Test Full Run

1. Go to **Actions** → **LDS Quotes Daily Agent**
2. Click **Run workflow** → **Run workflow**
3. Wait 1-2 minutes
4. Check your Slack `#lds-quotes-drafts` channel
5. You should see a draft with **[✅ Approve & Publish]** and **[✏️ Request Amendment]** buttons

## Step 8: Deploy Webhook (Optional, for Amendments)

The approval workflow only works with the webhook deployed. Without it, you can approve but not request amendments.

**Quick Deploy to AWS Lambda:**

```bash
# Install AWS CLI
pip install awscli

# Create Lambda function
aws lambda create-function \
  --function-name lds-quotes-webhook \
  --runtime python3.11 \
  --role arn:aws:iam::ACCOUNT_ID:role/lambda-basic-execution \
  --handler slack_webhook_handler.lambda_handler \
  --zip-file fileb://lambda.zip

# Set environment variables
aws lambda update-function-configuration \
  --function-name lds-quotes-webhook \
  --environment Variables='{
    SLACK_BOT_TOKEN=xoxb-...,
    SLACK_SIGNING_SECRET=...,
    ANTHROPIC_API_KEY=sk-ant-...,
    META_ACCESS_TOKEN=...
  }'

# Get the function URL or create API Gateway trigger
aws lambda create-function-url-config \
  --function-name lds-quotes-webhook \
  --auth-type NONE
```

See [WEBHOOK_DEPLOYMENT.md](WEBHOOK_DEPLOYMENT.md) for more platforms.

## That's It! 🎉

Your agent is now:
- ✅ Running on schedule (daily at 9 AM UTC)
- ✅ Posting drafts to Slack for approval
- ✅ Ready to publish to Instagram/Facebook/Threads

## Troubleshooting

### "DRY_RUN=true" fails
- Check `.env` file has `ANTHROPIC_API_KEY` set
- Verify dependencies installed: `pip install -r requirements.txt`

### "python agent.py" fails with import error
- Activate virtual environment: `source venv/bin/activate`
- Reinstall: `pip install -r requirements.txt`

### Slack integration not working
- Verify `SLACK_BOT_TOKEN` is correct
- Check bot is in `#lds-quotes-drafts` channel
- Test manually: `SLACK_BOT_TOKEN=xoxb-... python agent.py`

### GitHub Actions failing
- Check secrets are added to repo Settings
- View logs in Actions tab for detailed errors
- Enable `DEBUG=true` in workflow for verbose output

## Next Steps

- [ ] Customize quotes in `quotes_data.json`
- [ ] Adjust graphics style in `graphics_engine.py`
- [ ] Change schedule in `.github/workflows/schedule_agent.yml`
- [ ] Deploy webhook for amendment workflow
- [ ] Set up monitoring/alerts
- [ ] Test approval/publish workflow end-to-end

## Documentation

- **README.md**: Full documentation and configuration reference
- **CLAUDE.md**: Architecture and design decisions
- **WEBHOOK_DEPLOYMENT.md**: Webhook deployment guide for different platforms

---

**Having issues?** Check the README.md Troubleshooting section or enable DEBUG mode for detailed logs.
