# Bondify Social — Workflow 3 Setup

**Workflow 3: Auto-publish to Instagram + Slack Status Notifications**

This workflow pulls conversation starter questions from your Bondify app data, generates engaging Instagram posts with your branding/logo, and publishes directly to Instagram. Slack gets notifications of each post.

## Quick Setup

### 1. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and set:

```env
# Core requirements
ANTHROPIC_API_KEY=sk-ant-...
SLACK_BOT_TOKEN=xoxb-...

# Instagram (Meta Graph API)
META_ACCESS_TOKEN=EAABs...
INSTAGRAM_BUSINESS_ACCOUNT_ID=your-id

# Bondify-specific
BONDIFY_APP_STORE_URL=https://apps.apple.com/app/bondify/id123...

# Workflow 3 settings
AUTO_PUBLISH_INSTAGRAM=true
REQUIRE_SLACK_APPROVAL=false
DEBUG=false
DRY_RUN=false
```

### 2. Prepare Your Assets

Make sure you have your Bondify logo at:
```
/Users/kelvintan/DaddyCoding/Bondify/assets/logo.png
```

The Workflow 3 agent will automatically include it in graphics.

### 3. Run

```bash
# Dry-run first (generates, doesn't publish)
DRY_RUN=true DEBUG=true python3 bondify_workflow3_agent.py

# If dry-run succeeds, go live
python3 bondify_workflow3_agent.py
```

## Data Flow

```
Bondify Scripts (chill.js, deep.js, etc.)
          ↓
Load random conversation starter card
          ↓
Claude: Generate engaging Instagram caption
          ↓
Graphics: Render 1080x1350 image with logo
          ↓
Instagram: Direct publish (auto-live)
          ↓
Slack: Notify with mode, intensity, question, post ID
```

## What Happens

1. **Loads a random card** from your Bondify conversation starter data
   - Example: "What if you could change one event in history?" (Deep mode, intensity: deep)

2. **Generates caption** using Claude that:
   - Explains why this question matters
   - Encourages people to start the conversation
   - Includes CTA to download Bondify app
   - Adds 5 hashtags

3. **Renders graphic** with:
   - Gradient background (random from palette)
   - Mode and intensity badges
   - Question text (wrapped to fit)
   - Bondify branding
   - **Your logo** in bottom-right corner

4. **Auto-publishes** to Instagram immediately

5. **Notifies Slack** with:
   - ✅ Success confirmation
   - Mode name and intensity
   - The conversation starter question
   - Instagram post ID

## Monitoring

### Check Drafts

All posts are saved to `drafts/` with:
- `metadata.json` — Card info + caption
- `graphic.png` — The actual image posted

### Check Slack Notifications

Posts automatically notify your approval channel with success or error status.

### Logs

Debug logs go to `logs/` directory.

## Troubleshooting

### "Bondify scripts directory not found"

Make sure your Bondify project exists at:
```
/Users/kelvintan/DaddyCoding/Bondify/scripts/
```

And contains files like `chill.js`, `deep.js`, etc.

### "Logo not found at /Users/kelvintan/DaddyCoding/Bondify/assets/logo.png"

Place your Bondify logo image at that path. If it's missing, the agent continues without it (logo is optional).

### "Instagram publishing failed"

Check:
1. `META_ACCESS_TOKEN` is valid and not expired
2. Token has `instagram_content_publish` permission
3. `INSTAGRAM_BUSINESS_ACCOUNT_ID` is correct

### No cards loaded from Bondify data

Verify the script files parse correctly:

```bash
DEBUG=true python3 -c "
from pathlib import Path
from bondify_data_client import BondifyDataClient
client = BondifyDataClient(Path('/Users/kelvintan/DaddyCoding/Bondify/scripts'))
print(f'Loaded {len(client.cards)} cards')
print(f'Modes: {client.get_modes()}')
"
```

## Customization

### Change post frequency

Use cron or scheduler:

```bash
# Daily at 10 AM
0 10 * * * cd /Users/kelvintan/AI\ Project/Bondify\ Social && python3 bondify_workflow3_agent.py
```

### Filter by mode

Modify `bondify_workflow3_agent.py` line ~70:

```python
# Instead of: card = self.bondify_client.get_random_card()
# Use: card = self.bondify_client.get_random_card(mode="deep")
```

### Change graphics

Edit `bondify_graphics_engine.py` to:
- Change gradient colors in `GRADIENTS`
- Adjust text positioning
- Add more elements (background patterns, etc.)
- Change font sizes

## Files

| File | Purpose |
|------|---------|
| `bondify_workflow3_agent.py` | Main workflow 3 agent |
| `bondify_data_client.py` | Load Bondify conversation starters |
| `bondify_graphics_engine.py` | Render graphics with logo |
| `caption_generator.py` | Generate captions with Claude |
| `instagram_handler.py` | Instagram publishing |
| `slack_handler.py` | Slack notifications |
| `config.py` | Configuration |

## Next Steps

1. **Test with dry-run**: `DRY_RUN=true python3 bondify_workflow3_agent.py`
2. **Post first live**: `python3 bondify_workflow3_agent.py`
3. **Check Slack** for confirmation
4. **Schedule daily**: Add to cron or GitHub Actions
5. **Monitor performance**: Track likes, comments, saves on Instagram

## Support

For issues, check:
- `.env` configuration
- Bondify data files exist and parse correctly
- Instagram credentials are valid
- Slack bot is invited to the channel
