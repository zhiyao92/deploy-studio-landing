# 🚀 START HERE - Simplified LDS Quotes Agent

**You have a production-ready system that requires only 2 API keys.**

## What You Have

✅ **Fully automated quote generation pipeline** (Claude AI)  
✅ **Beautiful 1080×1080 graphics** with random gradients (Pillow)  
✅ **Instagram captions** with optimal hashtags  
✅ **Slack approval workflow** for daily review  
✅ **Amendment loop** - request changes, get regenerated captions  
✅ **GitHub Actions automation** - runs daily at 9 AM UTC  
✅ **Zero complexity** - just copy image to Instagram manually  

## 60-Second Overview

```
Every day at 9 AM UTC:
  1. System generates an LDS quote
  2. Claude writes Instagram caption + hashtags
  3. Pillow renders 1080×1080 graphic with gradient
  4. Posts to your Slack channel for review
  5. You click [Approved] or [Request Amendment]
  6. If approved: copy image from Slack → paste to Instagram → done!
  7. If amendment: Claude regenerates, back to Slack
```

## What You Need (Total: 5 minutes)

### 1. Anthropic Claude API Key
- Go to: https://console.anthropic.com/account/keys
- Create key or copy existing
- Cost: ~$0-50/month (for 1-2 quotes/day)

### 2. Slack Bot Token
- Go to: https://api.slack.com/apps
- Create app or use existing
- Add scopes: `chat:write`, `files:write`
- Get bot token
- Cost: Free (included in workspace)

**That's it. No Meta API needed.**

## Quickest Path to Success

**5 minutes:**
1. Copy `.env.example` to `.env`
2. Paste API keys
3. Run `pip install -r requirements.txt`

**2 minutes:**
4. Run `python validate_setup.py` (check everything is working)

**1 minute:**
5. Run `python agent.py` (test it)

**3 minutes:**
6. Push to GitHub + add secrets + enable Actions

**Total: ~11 minutes to production.**

## The Files You Need to Read

| File | Time | Purpose |
|------|------|---------|
| **This file** | 2 min | Quick overview |
| **QUICK_START_SIMPLIFIED.md** | 5 min | Step-by-step setup |
| **SIMPLIFIED_FLOW.md** | 5 min | How the workflow works |
| **README.md** | 30 min | Complete reference (optional) |

## Cost Breakdown

| Service | Cost | Notes |
|---------|------|-------|
| Claude API | $0-50/month | Main cost (quote generation) |
| GitHub Actions | $0 | Free tier (2000 min/month) |
| Slack | Included | Your workspace fee |
| **Total** | ~$0-50/month | Switch to Haiku for 90% savings |

## How to Share to Instagram

### iPhone/iPad
1. Long-press the image in Slack
2. Tap "Copy Image"
3. Open Instagram
4. Create new post
5. Paste image
6. Add caption (copy from Slack)
7. Post!

### Android
1. Long-press the image
2. Tap "Copy"
3. Open Instagram
4. Create new post
5. Paste image
6. Add caption
7. Post!

### Desktop (Mac/Windows/Linux)
1. Right-click image in Slack
2. Select "Copy image"
3. Open Instagram.com
4. Create new post
5. Paste image
6. Add caption
7. Post!

## Workflow Example

```
Mon 9 AM:  Quote: "Choose to be happy"
           You see in Slack ✅
           
Mon 10 AM: You click [✏️ Request Amendment]
           Feedback: "Make it shorter"
           
Mon 10:10 AM: New caption appears in Slack
              You click [✅ Approved]
              
Mon 10:15 AM: You copy image → share to Instagram
              Graphic goes live! 🎉
              
Tue 9 AM:  New quote generated automatically
           Repeat!
```

## Key Features

✅ **Deterministic daily selection** - same quote per day if re-run  
✅ **Amendment loop** - request feedback, get regenerated caption  
✅ **Beautiful graphics** - unique gradient every time  
✅ **Authentic LDS focus** - quotes from prophets, apostles, scriptures  
✅ **No auto-publishing** - you control when it goes live  
✅ **GitHub Actions** - runs autonomously on schedule  
✅ **Slack approval** - human review before anything public  

## Customization (Optional)

- Change schedule: Edit `.github/workflows/schedule_agent.yml`
- Modify quotes: Edit `quotes_data.json`
- Customize graphics: Edit `graphics_engine.py`
- Tweak captions: Edit `quote_generator.py`

## Troubleshooting

**"I don't have Python 3.11"**  
→ Use Python 3.10+ (older versions might work)

**"Slack bot can't post"**  
→ Check bot has `files:write` permission and is in `#lds-quotes-drafts` channel

**"Claude API returns error"**  
→ Verify API key is correct and not expired

**"GitHub Actions won't run"**  
→ Make sure you added secrets to GitHub (not local env vars)

**"Can't share from Slack to Instagram"**  
→ Use copy → paste workaround (more reliable anyway)

## What's Different from "Full" Version

- ❌ No automatic Instagram publishing (you do it manually)
- ❌ No Meta API credentials needed
- ❌ No webhook server deployment
- ✅ Simpler setup (2 secrets instead of 6+)
- ✅ More control (you decide posting time)
- ✅ Lower cost ($0 Meta fees)
- ✅ Easier troubleshooting

## Next Step

→ **Read: QUICK_START_SIMPLIFIED.md** (5 minutes)

Then follow the step-by-step setup guide.

---

**Questions?** Check the relevant guide:
- Setup help → QUICK_START_SIMPLIFIED.md
- Workflow details → SIMPLIFIED_FLOW.md
- Complete reference → README.md

**Ready?** Start with QUICK_START_SIMPLIFIED.md → You'll be done in 15 minutes! 🚀
