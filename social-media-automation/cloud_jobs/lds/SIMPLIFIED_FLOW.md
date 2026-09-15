# Simplified Flow - Manual Sharing

This is the simplified version of the LDS Quotes Agent that requires **zero Meta API credentials**.

## How It Works

Instead of automatically publishing to Instagram, the system generates a beautiful quote graphic and posts it to Slack. You then manually share it to Instagram from Slack using native sharing features.

### The Pipeline

```
Daily Trigger (GitHub Actions 9 AM UTC)
    ↓
Generate LDS Quote + Caption + Hashtags (Claude)
    ↓
Render 1080×1080 Graphic with Random Gradient (Pillow)
    ↓
Upload to Slack & Post for Review
    ↓
You See in Slack:
  ✅ Beautiful quote graphic
  📝 Caption with hashtags
  ✅ [Approved] [Request Amendment] buttons
    ↓
[Click Approved]
    ↓
You Can Now:
  1. Long-click the image in Slack
  2. Tap "Copy image" or "Share"
  3. Open Instagram
  4. Paste or share directly
  5. Done! 🎉

OR [Click Request Amendment]
    ↓
Enter your feedback in modal
    ↓
Claude regenerates caption
    ↓
New graphic posted to Slack
    ↓
Review again
```

## Benefits

✅ **$0 Cost** - No Meta API fees  
✅ **Simpler Setup** - Only 2 API keys (Anthropic + Slack)  
✅ **Faster Deployment** - No webhook server needed  
✅ **More Control** - You decide when and how to post  
✅ **Better Timing** - Post at optimal times for your audience  
✅ **Easy Feedback Loop** - Request amendments without code changes  

## Setup (30 seconds)

1. Copy `.env.example` to `.env`
2. Add your Anthropic API key
3. Add your Slack bot token
4. Done!

No Meta configuration needed.

## Daily Workflow

1. **9 AM UTC**: GitHub Actions triggers
2. **Wait 30 seconds**: Agent generates and posts to Slack
3. **Review in Slack**: See the beautiful graphic with caption
4. **Approve or Request Amendment**: Click button in Slack
5. **Share to Instagram**: Long-click image → Share to Instagram

## Manual Sharing Steps (More Detail)

### On iPhone
1. Open Slack app
2. Find the quote graphic in `#lds-quotes-drafts`
3. Long-press (hold) the image
4. Tap "Copy image" or "Share"
5. Open Instagram
6. Tap "+" to create new post
7. Paste image
8. Add caption (or use the one from Slack)
9. Post!

### On Android
1. Open Slack app
2. Find the quote graphic
3. Long-press the image
4. Tap "Copy" or "Share"
5. Open Instagram
6. Tap "+" to create post
7. Select the image or paste
8. Add caption
9. Post!

### On Desktop (Mac/Windows)
1. Open Slack in browser or app
2. Right-click the image
3. Select "Copy image" or "Save image"
4. Open Instagram.com
5. Click "+" to create post
6. Upload or paste image
7. Add caption
8. Post!

## Cost Breakdown

| Service | Cost |
|---------|------|
| Claude API | $0-50/month (1-2 quotes/day) |
| GitHub Actions | $0 (free tier) |
| Slack | Included in workspace |
| Meta API | $0 (not used) |
| **Total** | **~$0-50/month** |

## Customization

### Change the Schedule

Edit `.github/workflows/schedule_agent.yml`:

```yaml
schedule:
  - cron: "0 9 * * *"  # Daily 9 AM UTC
  # Other examples:
  # - cron: "0 6,18 * * *"  # Twice daily (6 AM & 6 PM UTC)
  # - cron: "0 9 * * 0"  # Sundays only
```

[Cron helper](https://crontab.guru/)

### Modify Quote Focus

Edit the prompt in `quote_generator.py::LDSQuoteGenerator.generate_quote()` to focus on specific topics:
- Family and parenting
- Faith and testimony
- Service and compassion
- Repentance and forgiveness
- Personal growth

### Customize Graphics

Edit `graphics_engine.py`:
- Change color palettes (line 70-80)
- Adjust font sizes and margins
- Add custom fonts (place TTF files in `fonts/` directory)

### Tweak Captions

Edit the prompt in `quote_generator.py::CaptionGenerator.generate_caption_and_hashtags()` to adjust:
- Tone (more casual, more formal, more conversational)
- Hashtag mix (more popular vs. more niche)
- Length preferences

## Approval Feedback Examples

When you click [Request Amendment], you can write feedback like:

- "Make the tone more uplifting"
- "Add a question at the end to engage readers"
- "Use simpler language"
- "Make it more focused on faith"
- "Shorter hashtags please"
- "More emphasis on the family aspect"
- "Make it more relatable to younger audience"

Claude will regenerate the caption incorporating your feedback.

## Troubleshooting

### "Long-click didn't work on image in Slack"

Try these alternatives:
- **Right-click** (on desktop/web)
- **Tap and hold** (on mobile)
- **Swipe left** on the message (iOS)
- Tap the **⋯ (more)** menu next to the image

### "Can't share directly from Slack to Instagram"

Slack's native Instagram sharing is limited. Instead:
1. Copy the image from Slack
2. Go to Instagram manually
3. Create new post
4. Paste the image
5. Add caption (copy it from Slack too)

### "The image looks low quality on Instagram"

- Instagram compresses images. This is normal.
- We render at 1080×1080 (Instagram's recommended size)
- Check your Instagram compression settings
- Try posting from a different device

### "Amendment regeneration takes too long"

This is expected - Claude API takes 1-2 seconds. You can:
- Go make coffee while it regenerates ☕
- Monitor the workflow logs to see progress
- Click [Request Amendment] again if you see an error

### "Slack image upload keeps failing"

Check:
- Bot has `files:write` permission
- Bot is in the `#lds-quotes-drafts` channel
- Slack workspace has storage available
- Network connection is stable

## What About Stories vs. Feed?

### Instagram Feed Posts
- Best for longer-form quotes
- More permanent visibility
- The 1080×1080 square works great

### Instagram Stories
- Time-limited (24 hours)
- More casual, authentic feel
- Can add stickers, text overlays in Instagram
- Also works great with our graphic!

You can post the same graphic to both:
1. **Feed**: Copy image → Create post → Upload
2. **Stories**: Copy image → Create story → Tap sticker → Image → Done

## FAQ

**Q: Can I schedule posts for a specific time?**  
A: Not automatically. The system generates daily at 9 AM UTC. You can manually time your Instagram posting whenever you want.

**Q: What if I want to post multiple quotes per day?**  
A: You can manually create more posts using the same graphics/captions. Or modify the workflow to run multiple times.

**Q: Can I use these graphics elsewhere?**  
A: Absolutely! The PNG files are saved locally in `drafts/`. Use them however you want - email, website, Pinterest, etc.

**Q: What if I want to regenerate a quote?**  
A: Click [Request Amendment] and ask Claude to completely rewrite it.

**Q: Can I use this for other Instagram accounts?**  
A: Yes! Just change the Slack channel or create multiple channels for different accounts.

## Next Steps

1. ✅ Read this file (done!)
2. Copy `.env.example` to `.env`
3. Get API credentials (Anthropic + Slack)
4. Run `python validate_setup.py`
5. Test: `DRY_RUN=true python agent.py`
6. Push to GitHub
7. Add secrets to GitHub
8. Enable GitHub Actions
9. Wait for first run (9 AM UTC tomorrow)
10. Share first graphic to Instagram! 🎉

---

**That's it!** You now have a quote generation + design pipeline that requires minimal setup and zero API management for publishing.

Enjoy! 📱✨
