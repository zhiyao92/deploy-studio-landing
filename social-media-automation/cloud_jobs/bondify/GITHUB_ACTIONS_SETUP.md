# GitHub Actions Setup for Bondify Social

Automatically publish Bondify conversation starters to Instagram on a schedule using GitHub Actions.

## Overview

**Two workflows included:**

1. **Daily Post** (`.github/workflows/daily-post.yml`)
   - Runs every day at 10 AM UTC
   - Auto-publishes to Instagram
   - Notifies Slack
   - Saves drafts as artifacts

2. **Test Workflow** (`.github/workflows/test-workflow.yml`)
   - Manual trigger (run from GitHub UI anytime)
   - Dry-run mode (generates graphic, doesn't publish)
   - For testing before going live

## Prerequisites

1. **GitHub Repository**
   - Push Bondify Social to GitHub
   - Must be your own repository (not a fork)

2. **API Keys & Tokens**
   - Anthropic API key
   - Slack Bot token
   - Meta (Instagram) access token
   - Instagram Business Account ID
   - Bondify App Store URL

## Step 1: Create GitHub Repository

```bash
cd "/Users/kelvintan/AI Project/Bondify Social"

# Initialize and commit
git add .
git commit -m "Initial Bondify Social setup with Workflow 3"

# Create repo on GitHub.com (https://github.com/new)
# Then add remote and push:

git remote add origin https://github.com/YOUR_USERNAME/bondify-social.git
git branch -M main
git push -u origin main
```

## Step 2: Add Secrets to GitHub

Go to your repository on GitHub.com:

1. Click **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret** and add each:

| Secret Name | Value |
|------------|-------|
| `ANTHROPIC_API_KEY` | Your Claude API key (sk-ant-...) |
| `LDS_QUOTES_API_KEY` | Your LDS Quotes API key |
| `SLACK_BOT_TOKEN` | Your Slack bot token (xoxb-...) |
| `META_ACCESS_TOKEN` | Your Meta Graph API token (EAABs...) |
| `INSTAGRAM_BUSINESS_ACCOUNT_ID` | Your IG Business Account ID |
| `BONDIFY_APP_STORE_URL` | Your app store URL |

**Never commit these to git!** They stay secure in GitHub's secret manager.

## Step 3: Enable GitHub Actions

1. Go to **Actions** tab in your repository
2. Click **I understand my workflows, go ahead and enable them**
3. You should see:
   - ✅ Bondify Daily Post (Workflow 3)
   - ✅ Test Workflow (Dry-Run)

## Step 4: Test Before Going Live

1. Click **Actions** tab
2. Select **Test Workflow (Dry-Run)**
3. Click **Run workflow** → **Run workflow**
4. Watch the execution:
   - Should complete in 1-2 minutes
   - Check logs for any errors
   - Verify no Instagram post was created (dry-run mode)

If test succeeds, you're ready for daily posts!

## Step 5: Schedule Daily Posts

The daily post workflow is already configured to run at **10 AM UTC** every day.

To change the time, edit `.github/workflows/daily-post.yml`:

```yaml
schedule:
  - cron: '0 10 * * *'  # 10 AM UTC
```

### Cron Examples

| Time | Cron |
|------|------|
| 9 AM UTC | `0 9 * * *` |
| 10 AM UTC | `0 10 * * *` |
| 3 PM UTC | `0 15 * * *` |
| 6 PM UTC (2 PM EST) | `0 18 * * *` |

Find your timezone UTC offset and adjust accordingly.

## Monitoring

### View Workflow Runs

**Actions** tab → Select workflow → See all past runs with:
- ✅ Success / ❌ Failure status
- Execution time
- Logs for debugging

### Download Artifacts

After each run:
- **Success**: `published-drafts/` contains the graphic + metadata
- **Failure**: `workflow-logs/` contains debug info

Click the workflow run → **Artifacts** to download.

### Slack Notifications

Each successful post notifies Slack with:
- ✅ Post confirmation
- Mode & intensity
- Conversation starter question
- Instagram post ID

## Troubleshooting

### "Workflow doesn't run at scheduled time"

GitHub Actions schedules are based on **repository activity**. If your repo has no commits, scheduled workflows might be delayed.

**Solution**: Ensure you have at least one commit in the past week. You can:
1. Make a small README update and push
2. Or manually trigger the workflow to confirm it works

### "Secret not found" errors

Make sure:
1. Secret names match exactly (case-sensitive)
2. Secrets are added to the correct repository (not a fork)
3. You're in the **Settings** → **Secrets** section (not **Actions** settings)

### "Instagram publishing failed"

In GitHub Actions logs, check:
1. `META_ACCESS_TOKEN` is not expired
2. Token has `instagram_content_publish` permission
3. `INSTAGRAM_BUSINESS_ACCOUNT_ID` is correct

### "Bondify scripts not found"

GitHub Actions runs on Ubuntu, not your Mac. The scripts path must be in the repo:

```bash
# Make sure these exist in your repo:
bondify_data_client.py
bondify_workflow3_agent.py
bondify_graphics_engine.py
```

The agent expects to load Bondify data from your local path. You have two options:

**Option A: Store Bondify data in this repo**
```bash
# Copy Bondify scripts to this repo
cp -r /Users/kelvintan/DaddyCoding/Bondify/scripts ./data/bondify/

# Update bondify_workflow3_agent.py:
bondify_scripts_dir = Path(__file__).parent / "data" / "bondify" / "scripts"
```

**Option B: Use LDS Quotes API instead**
```bash
# Use the original agent.py with LDS Quotes
python3 agent.py
```

## Advanced: Custom Workflows

### Publish on demand

Create `.github/workflows/manual-post.yml`:

```yaml
name: Publish Now

on:
  workflow_dispatch:
    inputs:
      mode:
        description: 'Bondify mode (chill, deep, etc.)'
        required: false
        default: ''

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - run: pip install -r requirements.txt
      - run: python3 bondify_workflow3_agent.py
        env:
          # ... all secrets ...
```

Then trigger manually from **Actions** tab with optional mode selection.

### Multiple schedules

Add more schedules to `daily-post.yml`:

```yaml
on:
  schedule:
    - cron: '0 9 * * *'    # 9 AM
    - cron: '0 18 * * *'   # 6 PM
```

### Notifications on failure

Add step before `Run Bondify`:

```yaml
- name: Notify Slack on failure
  if: failure()
  run: |
    curl -X POST ${{ secrets.SLACK_WEBHOOK }} \
      -d '{"text":"❌ Bondify post failed"}'
```

## File Structure

```
Bondify Social/
├── .github/workflows/
│   ├── daily-post.yml          # Daily at 10 AM UTC
│   └── test-workflow.yml       # Manual test (dry-run)
├── bondify_workflow3_agent.py
├── bondify_data_client.py
├── bondify_graphics_engine.py
├── instagram_handler.py
├── slack_handler.py
├── caption_generator.py
├── config.py
├── requirements.txt
├── GITHUB_ACTIONS_SETUP.md     # This file
└── ...
```

## Environment Variables

GitHub Actions sets these for every run (in the workflow YAML):

```yaml
env:
  LLM_MODEL: 'claude-opus-4-8'
  AUTO_PUBLISH_INSTAGRAM: 'true'
  REQUIRE_SLACK_APPROVAL: 'false'
  DEBUG: 'false'
  DRY_RUN: 'false'
```

Change these in the workflow file if needed (don't use secrets for these—they're not sensitive).

## Security Best Practices

✅ **Do:**
- Store API keys as GitHub Secrets
- Don't commit `.env` file
- Rotate tokens periodically
- Review workflow logs for errors

❌ **Don't:**
- Hardcode secrets in workflow files
- Commit `.env` file to GitHub
- Share repository access carelessly
- Store secrets in plaintext

## Support

If workflows fail:

1. Check the **Actions** tab for logs
2. Look for error messages about missing secrets
3. Verify all environment variables are set
4. Run the test workflow to confirm setup

For more help, see `BONDIFY_WORKFLOW3.md` or `README.md`.
