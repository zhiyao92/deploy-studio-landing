# LDS Quotes Agent - Project Documentation

This file documents the architecture, design decisions, and key implementation details of the LDS Quotes Daily Inspiration agent pipeline.

## Project Overview

An autonomous social media agent that:
1. Generates or selects inspirational LDS quotes
2. Crafts engaging Instagram captions with hashtags (via Claude LLM)
3. Renders 1080x1350px (4:5 portrait) graphics with random gradients
4. Routes content to Slack for manual approval **before posting to social media**
5. Publishes to Instagram, Facebook, and Threads (Meta Graph API)
6. Supports iterative amendments via Slack feedback loop

**Key Constraint**: No content goes live without manual approval. All posts route through Slack first.

## Architecture

### File Structure

```
agent.py                    # Main orchestration (QuotePipeline class)
graphics_engine.py         # PIL-based image rendering (GradientGenerator, QuoteGraphicsEngine)
quote_generator.py         # LLM-powered quote generation (LDSQuoteGenerator, CaptionGenerator)
slack_handler.py           # Slack API integration (SlackHandler)
meta_handler.py            # Meta Graph API (MetaGraphHandler)
config.py                  # Configuration validation (Config class)
slack_webhook_handler.py   # Async webhook handler for Slack actions
requirements.txt           # Python dependencies
quotes_data.json          # LDS quotes database
.env.example              # Configuration template
README.md                 # User-facing documentation
WEBHOOK_DEPLOYMENT.md     # Webhook deployment guide
.github/workflows/schedule_agent.yml  # GitHub Actions CI/CD
.gitignore               # Secrets + build artifacts
```

### Data Flow

```
Scheduled Trigger (GitHub Actions)
    ↓
agent.py::QuotePipeline.run()
    ├─ QuoteRepository.pick_for_today()  [loads quotes_data.json]
    ├─ LDSQuoteGenerator.generate_quote()  [Claude API]
    ├─ CaptionGenerator.generate_caption_and_hashtags()  [Claude API]
    ├─ QuoteGraphicsEngine.render()  [Pillow]
    ├─ QuotePipeline._save_draft()  [local drafts/ directory]
    └─ SlackHandler.post_draft_for_approval()  [Slack API]
         ├─ Upload image to Slack
         └─ Post message with [Approve] [Amend] buttons
                ↓
        Slack User Interaction (Webhook)
                ├─ [Approve & Publish]
                │     └─ MetaGraphHandler.publish_all()
                │         ├─ publish_to_instagram()
                │         ├─ publish_to_facebook_group()
                │         └─ publish_to_threads()
                │
                └─ [Request Amendment]
                      └─ slack_webhook_handler.py
                          └─ QuotePipeline.regenerate_with_feedback()
                              └─ [Re-post to Slack]
```

## Design Decisions

### 1. Slack-First Approval (No Direct Posting)

**Decision**: All content routes through Slack before going live.

**Rationale**:
- Manual review prevents brand misalignment
- Asynchronous approval workflow (no blocking on agent)
- Amendment loop preserves content quality
- Easy to disable platforms if needed

**Implementation**:
- `agent.py` runs on schedule, posts drafts to Slack
- `slack_webhook_handler.py` runs as separate serverless function
- User clicks buttons → webhook handles async actions
- Webhooks call back to agent logic for publishing/regeneration

### 2. LDS Quote Generation via Claude

**Decision**: Use Claude (Anthropic) instead of fixed database-only approach.

**Rationale**:
- Generates authentic, thematically-aligned quotes on demand
- Reduces dependency on manual quote curation
- Supports context-aware caption generation
- Fallback to `quotes_data.json` if needed

**Implementation**:
- `LDSQuoteGenerator` uses Claude Opus 4.8 (most capable model)
- Prompts emphasize LDS teachings, prophets, scriptures
- Fallback chain: `quotes_data.json` → LLM generation → error
- Captions are generated fresh per quote (context-aware)

### 3. Pillow-Only Graphics Engine

**Decision**: Use PIL/Pillow for image rendering, no external design tools.

**Rationale**:
- Self-contained, no API dependencies
- Deterministic output (reproducible builds)
- Random gradient generation is lightweight
- Can be extended with custom fonts

**Implementation**:
- `GradientGenerator` creates random CSS-style smooth gradients
- 8 angles (0°, 45°, 90°, 135°, 180°, 225°, 270°, 315°)
- 5 color palettes (vibrant, warm, cool, pastel, deep)
- Text rendering with semi-transparent background overlay
- Automatic line wrapping for quotes
- Configurable font sizes and margins

### 4. Deterministic Daily Quote Selection

**Decision**: Seed random number generator with date, ensuring same quote per day.

**Rationale**:
- Re-runs on same day produce consistent output
- Sequence varies day-to-day (not boring/predictable)
- Supports dry-run testing without duplicates
- Simple to understand and debug

**Implementation**:
```python
seed = int(date.today().strftime("%Y%m%d"))
rng = random.Random(seed)
quote = rng.choice(quotes)
```

### 5. Meta Graph API for Multi-Platform Publishing

**Decision**: Use Meta Graph API instead of separate platform-specific APIs.

**Rationale**:
- Single API handles Instagram, Facebook, Threads
- One token for all platforms
- Consistent error handling
- Easier to maintain than multiple integrations

**Limitation**: Threads doesn't support image attachments yet (text-only).

### 6. Environment-Based Configuration

**Decision**: All secrets and config via environment variables.

**Rationale**:
- No secrets in code
- Easy to rotate credentials
- GitHub Secrets integration
- Supports multiple deployment environments

**Files**:
- `.env.example`: Template for local development
- GitHub Secrets: Production credentials
- `config.py`: Validation and centralized access

### 7. Async Webhook Handler Separate from Scheduler

**Decision**: `slack_webhook_handler.py` runs as serverless function, not in GitHub Actions.

**Rationale**:
- GitHub Actions doesn't have persistent webhooks
- Slack needs to reach us to handle button clicks
- Serverless (Lambda/GCP/Azure) is always available
- Decouples scheduling from approval workflow

**Deployment**:
- Deploy to AWS Lambda, GCP Cloud Functions, or self-hosted
- Configure Slack Request URL to point to webhook endpoint
- Must be publicly accessible with HTTPS

### 8. Local Draft Storage with Optional Cloud Backup

**Decision**: Save drafts locally in `drafts/YYYY-MM-DD/` directory.

**Rationale**:
- Keeps history for debugging
- No external storage dependency for basic operation
- Can migrate to S3/GCS for production reliability

**Enhancement**:
- Can add `S3_BUCKET` env var to upload drafts to cloud
- Webhook can retrieve images from cloud for publishing

## Key Components

### QuotePipeline (agent.py)

Main orchestration class. Methods:

- `run()`: Execute full pipeline (quote → caption → graphic → Slack)
- `publish_approved_post()`: Called by webhook after Slack approval
- `regenerate_with_feedback()`: Called by webhook for amendments
- `_get_quote()`: Load or generate quote
- `_save_draft()`: Persist draft to local storage

### GradientGenerator (graphics_engine.py)

Creates random smooth gradient backgrounds.

- 8 angle options for linear/diagonal gradients
- 5 color palettes (vibrant, warm, cool, pastel, deep)
- Linear color interpolation between two RGB values
- Deterministic but visually unique each time

### QuoteGraphicsEngine (graphics_engine.py)

Renders text on gradients.

- 1080x1350px output (Instagram 4:5 portrait format)
- Font loading with fallbacks
- Text wrapping to fit width
- Semi-transparent dark overlay for readability
- Centered quote + smaller author name

### LDSQuoteGenerator (quote_generator.py)

Generates authentic LDS quotes via Claude.

- Prompt emphasizes prophets, apostles, scriptures
- Returns JSON with text, speaker, source, year
- Defensive JSON parsing with fallbacks

### CaptionGenerator (quote_generator.py)

Generates Instagram captions and hashtags.

- Context-aware per-quote generation
- 8-12 hashtags with mix of popular and niche
- Feedback-aware regeneration for amendments
- 2200 char limit (Instagram technical max)

### SlackHandler (slack_handler.py)

Posts drafts to Slack for approval.

- Uploads PNG image to Slack workspace
- Posts message with interactive buttons
- Buttons trigger webhook POST requests
- Post status updates for success/error

### MetaGraphHandler (meta_handler.py)

Publishes to Instagram, Facebook, Threads.

- Instagram: Two-step (create container → publish)
- Facebook: Direct feed post
- Threads: Text-only (images not yet supported)
- `publish_all()`: Publishes to multiple platforms

### SlackActionHandler (slack_webhook_handler.py)

Handles Slack interactive events.

- Verifies Slack request signatures (security)
- Routes to approve or amend handlers
- Opens modal for feedback entry
- Validates request timestamps (replay attack prevention)

## Environment Variables

**Required:**
- `ANTHROPIC_API_KEY`: Claude API key
- `SLACK_BOT_TOKEN`: Slack bot token (scopes: chat:write, files:write)
- `SLACK_APPROVAL_CHANNEL`: Slack channel for drafts (default: #lds-quotes-drafts)

**Optional (for publishing):**
- `META_ACCESS_TOKEN`: Meta Graph API token
- `INSTAGRAM_BUSINESS_ACCOUNT_ID`: Instagram account ID
- `FACEBOOK_PAGE_ID`: Facebook page ID
- `THREADS_ACCOUNT_ID`: Threads account ID

**Publishing Control:**
- `PUBLISH_TO_INSTAGRAM`: true/false
- `PUBLISH_TO_FACEBOOK`: true/false
- `PUBLISH_TO_THREADS`: true/false

**Runtime:**
- `DEBUG`: true/false
- `DRY_RUN`: true/false (generate locally only)
- `LLM_MODEL`: Claude model (default: claude-opus-4-8)

## Testing Strategy

### Unit Testing (Optional)

Add pytest tests for:
- Gradient generation (verify RGB interpolation)
- Text wrapping logic
- JSON parsing (caption generation)
- URL construction (Meta API)

### Integration Testing

Local dry-run:
```bash
DRY_RUN=true DEBUG=true python agent.py
```

This generates everything locally without posting to Slack.

### End-to-End Testing

1. Create test channel in Slack
2. Set `SLACK_APPROVAL_CHANNEL` to test channel
3. Run `python agent.py`
4. Verify draft appears in Slack
5. Click buttons and verify webhook is called

## Deployment Checklist

### GitHub Setup
- [ ] Push code to private repository
- [ ] Add all required secrets to Settings → Secrets and variables → Actions
- [ ] Enable GitHub Actions
- [ ] Verify workflow runs on schedule or manual trigger

### Slack Setup
- [ ] Create Slack bot app
- [ ] Add bot to approval channel
- [ ] Configure Interactivity & Shortcuts → Request URL (webhook endpoint)
- [ ] Subscribe to block_actions events
- [ ] Get bot token and signing secret

### Meta Setup (if publishing)
- [ ] Create Meta Business Account
- [ ] Set up Instagram Business Account
- [ ] Create Facebook Page
- [ ] Generate access token with required permissions
- [ ] Get account IDs for Instagram and Facebook

### Webhook Deployment
- [ ] Deploy `slack_webhook_handler.py` to Lambda/GCP/Azure
- [ ] Set all environment variables
- [ ] Get public HTTPS endpoint
- [ ] Configure Slack with endpoint URL
- [ ] Test button clicks

### Monitoring
- [ ] Set up logs in Lambda/GCP/Azure
- [ ] Create Slack alerts for failures
- [ ] Monitor GitHub Actions workflow runs

## Future Enhancements

- [ ] Support TikTok and YouTube Shorts
- [ ] Add image filters/effects (vignette, blur, etc.)
- [ ] Batch scheduling (queue multiple posts)
- [ ] Multi-language support
- [ ] Analytics integration (track post performance)
- [ ] Custom font library
- [ ] Preview before publishing
- [ ] Scheduling for future dates
- [ ] A/B testing captions

## Security Considerations

1. **API Keys**: Never commit `.env`. All secrets via GitHub Secrets.
2. **Slack Verification**: Always verify request signatures.
3. **Timestamp Checks**: Prevent replay attacks (±5 min window).
4. **HTTPS Only**: Webhook must use HTTPS.
5. **Rate Limiting**: Add to webhook to prevent abuse.
6. **IAM Least Privilege**: Restrict Lambda/GCP service account permissions.

## Monitoring & Logging

- GitHub Actions: View logs in Actions tab
- Webhook: CloudWatch (Lambda) / Cloud Logging (GCP)
- Slack: Errors posted to approval channel
- Local: DEBUG=true for verbose output

## Common Issues & Solutions

### "No quotes found in quotes_data.json"
- File is empty or missing
- Agent falls back to LLM generation
- Add entries to `quotes_data.json` or ensure API works

### "Meta publishing failed"
- Token expired: Regenerate in Meta app settings
- Wrong account ID: Verify in Instagram Business settings
- Permission missing: Check token has all required scopes

### "Webhook URL invalid"
- Not HTTPS: Use HTTPS only
- Wrong URL in Slack settings: Copy directly from Lambda/GCP
- Firewall blocking: Check deployment platform allows webhooks

### "Signature verification failed"
- `SLACK_SIGNING_SECRET` mismatch: Verify in Slack app settings
- Request too old: Check server time is in sync

---

**Last Updated**: July 2024
**Version**: 1.0 (Production-Ready)
