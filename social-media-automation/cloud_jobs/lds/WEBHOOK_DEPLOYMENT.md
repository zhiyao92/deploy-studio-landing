# Slack Webhook Deployment Guide

The `slack_webhook_handler.py` handles interactive Slack actions:
- **[✅ Approve & Publish]** button clicks
- **[✏️ Request Amendment]** button clicks & feedback submission

This webhook **must** run on a publicly accessible endpoint since Slack sends HTTP POST requests to it. GitHub Actions is not suitable for this (it's not constantly running). Instead, deploy to a serverless platform.

## Architecture

```
┌──────────────────────┐
│   Slack User         │
│   Clicks Button      │
└──────────┬───────────┘
           │
           │ POST request with action payload
           │
           ▼
┌──────────────────────────────────────┐
│  Your Webhook Endpoint               │
│  (AWS Lambda, GCP Cloud Function,    │
│   Azure Function, or similar)        │
└──────────┬───────────────────────────┘
           │
           │ Imports QuotePipeline from agent.py
           │ and executes publishing/regeneration
           │
           ▼
┌──────────────────────────────────────┐
│  GitHub Actions Runner (agent.py)    │
│  OR local QuotePipeline instance     │
└──────────────────────────────────────┘
```

## Deployment Options

### Option 1: AWS Lambda (Recommended)

**Pros:** Free tier, simple setup, integrates with API Gateway, no server management

**Setup:**

1. **Create Lambda function:**
   ```bash
   # In AWS Console: Lambda > Create function
   # Runtime: Python 3.11
   # Architecture: x86_64
   ```

2. **Deploy code:**
   ```bash
   # Create a deployment package
   mkdir lambda_package
   cd lambda_package
   pip install -r ../requirements.txt -t .
   cp ../slack_webhook_handler.py .
   cp ../agent.py .
   cp ../graphics_engine.py .
   cp ../quote_generator.py .
   cp ../slack_handler.py .
   cp ../meta_handler.py .
   cp ../config.py .
   cp ../quotes_data.json .
   
   # Zip and upload
   zip -r ../lambda_deployment.zip .
   # Upload via AWS Console or AWS CLI
   ```

3. **Set environment variables:**
   - `SLACK_BOT_TOKEN`: Your Slack bot token
   - `SLACK_SIGNING_SECRET`: Your Slack app signing secret
   - `ANTHROPIC_API_KEY`: Your Claude API key
   - `META_ACCESS_TOKEN`: Your Meta access token (if publishing)
   - `INSTAGRAM_BUSINESS_ACCOUNT_ID`: Instagram account ID
   - `FACEBOOK_PAGE_ID`: Facebook page ID
   - `THREADS_ACCOUNT_ID`: Threads account ID

4. **Create API Gateway:**
   ```bash
   # In AWS Console: API Gateway > Create REST API
   # Create POST method that triggers your Lambda
   # Get the endpoint URL (e.g., https://xxxxxxxx.execute-api.region.amazonaws.com/prod/...)
   ```

5. **Configure Slack:**
   - Go to your Slack app settings
   - **Interactivity & Shortcuts** → Enable
   - **Request URL**: Paste your API Gateway endpoint
   - **Block Actions** → Subscribe to all block actions
   - Save

### Option 2: Google Cloud Functions

**Setup:**

1. **Create function:**
   ```bash
   gcloud functions create lds-quotes-webhook \
     --runtime python311 \
     --trigger-http \
     --allow-unauthenticated \
     --entry-point lambda_handler
   ```

2. **Deploy code:**
   ```bash
   gcloud functions deploy lds-quotes-webhook \
     --runtime python311 \
     --trigger-http \
     --source . \
     --entry-point lambda_handler
   ```

3. **Set environment variables:**
   ```bash
   # In Cloud Functions UI, set environment variables as above
   ```

4. **Get endpoint URL:**
   ```bash
   gcloud functions describe lds-quotes-webhook --region us-central1
   # Use the "httpsTrigger.url"
   ```

5. **Configure Slack:** (same as AWS)

### Option 3: Azure Functions

**Setup:**

1. **Create function app:**
   ```bash
   az functionapp create \
     --resource-group myResourceGroup \
     --consumption-plan-location centralus \
     --runtime python \
     --runtime-version 3.11 \
     --functions-version 4 \
     --name lds-quotes-webhook
   ```

2. **Deploy:**
   ```bash
   func azure functionapp publish lds-quotes-webhook
   ```

3. **Set environment variables:** (in Azure Portal)

4. **Get endpoint URL:** (from Azure Portal)

5. **Configure Slack:** (same as above)

### Option 4: Self-Hosted (Docker / VPS)

**Setup:**

1. **Create Dockerfile:**
   ```dockerfile
   FROM python:3.11-slim
   
   WORKDIR /app
   
   COPY requirements.txt .
   RUN pip install -r requirements.txt
   
   COPY . .
   
   ENV FLASK_APP=slack_webhook_handler.py
   ENV PORT=8080
   
   EXPOSE 8080
   
   CMD ["gunicorn", "--bind", "0.0.0.0:8080", "slack_webhook_handler:app"]
   ```

2. **Create Flask wrapper** (`slack_webhook_handler.py` needs to be adapted):
   ```python
   from flask import Flask, request
   import json
   
   app = Flask(__name__)
   
   @app.route('/webhook', methods=['POST'])
   def webhook():
       body = request.data
       headers = request.headers
       event = {
           'body': body.decode('utf-8'),
           'headers': dict(headers)
       }
       result = lambda_handler(event, None)
       return result['body'], result['statusCode']
   ```

3. **Deploy to VPS/Docker:**
   ```bash
   docker build -t lds-quotes-webhook .
   docker run -e SLACK_BOT_TOKEN=... -e ... -p 8080:80 lds-quotes-webhook
   ```

4. **Set up reverse proxy** (nginx/Caddy with HTTPS)

5. **Configure Slack:** Use your domain URL (e.g., https://quotes.example.com/webhook)

## Integration with GitHub Actions

The webhook handler imports `QuotePipeline` from `agent.py`. When publishing:

1. Webhook reads draft metadata from local `drafts/` directory
2. Calls `pipeline.publish_approved_post()`
3. Meta Graph API publishes to Instagram/Facebook/Threads

**Important:** Drafts must be accessible to the webhook. Options:

**Option A: Shared Storage (Recommended)**
- Upload drafts to S3, GCS, or similar
- Webhook retrieves image URL from cloud storage
- Add to webhook environment: `S3_BUCKET=my-bucket`

**Option B: Embed Image in Metadata**
- Encode image as base64 in draft metadata JSON
- Webhook decodes and uploads to temp storage
- (Less efficient, but works without external storage)

**Option C: Re-upload from Slack**
- Webhook retrieves image URL from Slack API
- Uses that URL for Meta publishing
- Requires storing Slack URL in draft metadata

## Configuration Checklist

Before deploying, ensure:

- [ ] Slack app signing secret is set (`SLACK_SIGNING_SECRET`)
- [ ] Slack bot token has permissions: `chat:write`, `files:write`
- [ ] `ANTHROPIC_API_KEY` is set for LLM operations
- [ ] `META_ACCESS_TOKEN` is set for publishing
- [ ] Instagram, Facebook, Threads account IDs are configured
- [ ] Webhook endpoint is publicly accessible with HTTPS
- [ ] Slack app "Interactivity & Shortcuts" points to your webhook
- [ ] Slack app subscribes to "block_actions" event type
- [ ] Drafts directory or cloud storage is accessible to webhook

## Testing

### Local Testing

```bash
# Set environment variables
export SLACK_SIGNING_SECRET="your-secret"
export SLACK_BOT_TOKEN="xoxb-..."
export ANTHROPIC_API_KEY="sk-ant-..."

# Run test
python -c "
import json
import time
from slack_webhook_handler import lambda_handler

# Test URL verification
event = {
    'body': json.dumps({
        'type': 'url_verification',
        'challenge': 'test-challenge'
    }),
    'headers': {
        'X-Slack-Request-Timestamp': str(int(time.time())),
        'X-Slack-Signature': 'v0=test'
    }
}

result = lambda_handler(event, None)
print(json.dumps(result, indent=2))
"
```

### Slack Test

1. In Slack, go to your test channel
2. Trigger a workflow or use `/slash_command` to generate a draft
3. Click the **[✅ Approve & Publish]** button
4. Check webhook logs for execution
5. Verify post appears on Instagram/Facebook/Threads

## Troubleshooting

### "Webhook didn't respond with a challenge"

- Check webhook is publicly accessible (no firewall blocking)
- Ensure `lambda_handler` returns proper response
- Check webhook logs for errors

### "Invalid signature"

- Verify `SLACK_SIGNING_SECRET` matches your Slack app settings
- Check system time is in sync (Slack checks within 5 minutes)

### "Draft not found"

- Ensure `drafts/` directory is accessible to webhook
- If using cloud storage, verify credentials/permissions
- Check draft metadata JSON exists

### "Failed to publish to Instagram"

- Verify `META_ACCESS_TOKEN` hasn't expired
- Check Instagram Business Account ID is correct
- Ensure token has `instagram_content_publish` permission

## Monitoring

### CloudWatch (AWS Lambda)

```bash
aws logs tail /aws/lambda/lds-quotes-webhook --follow
```

### Cloud Logging (GCP)

```bash
gcloud functions logs read lds-quotes-webhook --limit 50 --follow
```

### Azure Monitor

- Go to Azure Portal → Functions → Logs

### Self-Hosted (Docker)

```bash
docker logs -f lds-quotes-webhook
```

## Cost Estimation

| Platform | Monthly Cost | Notes |
|----------|--------------|-------|
| AWS Lambda | Free* | Free tier: 1M requests/month, 400,000 GB-sec |
| GCP Cloud Functions | Free* | Free tier: 2M invocations/month |
| Azure Functions | Free* | Free tier: 1M requests/month |
| Self-Hosted (EC2 micro) | ~$10 | Minimal usage |

*Assuming usage within free tier limits

## Security Best Practices

1. **Signing Secret**: Enable Slack request signature verification
2. **HTTPS Only**: Webhook URL must use HTTPS
3. **Secrets Management**: Use platform-specific secrets managers (AWS Secrets Manager, GCP Secret Manager, etc.)
4. **Least Privilege**: Limit IAM roles to minimum required
5. **Rate Limiting**: Add rate limiting to prevent abuse
6. **Monitoring**: Set up alerts for webhook failures

## Next Steps

1. Choose a deployment platform
2. Follow setup instructions above
3. Test with local Python script
4. Deploy and configure Slack
5. Create a test quote draft and click buttons to verify

---

**Last Updated**: July 2024
