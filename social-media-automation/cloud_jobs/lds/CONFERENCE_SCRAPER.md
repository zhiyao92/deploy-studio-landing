# LDS General Conference Quote Scraper

Automatically scrape and extract inspirational quotes from LDS General Conference talks.

## Features

- **Automated Scraping**: Navigate the entire LDS Church conference website hierarchy
- **Intelligent Quote Extraction**: Uses Claude AI to identify and extract impactful quotes
- **Automatic Categorization**: Categorizes quotes into meaningful themes (Faith, Service, Leadership, etc.)
- **JSON Organization**: Saves quotes organized by category in JSON format
- **Duplicate Prevention**: Avoids adding duplicate quotes
- **Scheduled Execution**: Runs monthly via GitHub Actions

## File Structure

```
conference_scraper.py          # Main scraper class
merge_conference_quotes.py      # Utility to merge scraped quotes into main database
.github/workflows/scrape_conference.yml  # GitHub Actions workflow
conference_quotes/              # Output directory for category JSON files
  - faith.json
  - service.json
  - leadership.json
  - [category].json
```

## Quote Format

Each quote is saved with the following structure:

```json
{
  "quotes": [
    {
      "id": 70001,
      "quote": "Exact quote from the talk",
      "author": "Speaker Name",
      "category": "Faith",
      "source": "https://www.churchofjesuschrist.org/study/general-conference/2024/10/12speaker?lang=eng"
    }
  ]
}
```

### Categories

Available quote categories:
- **Faith** - Belief, testimony, trust in God
- **Repentance** - Redemption, forgiveness, change
- **Love** - Charity, compassion, care for others
- **Service** - Helping others, sacrifice, devotion
- **Agency** - Choice, free will, accountability
- **Obedience** - Following God's commandments
- **Testimony** - Personal spiritual experiences
- **Family** - Relationships, marriage, children
- **Priesthood** - God's authority, spiritual power
- **Charity** - Giving, generosity, kindness
- **Endurance** - Perseverance, patience, strength
- **Conversion** - Spiritual awakening, change
- **Leadership** - Guidance, responsibility, vision
- **Personal Growth** - Self-improvement, development
- **Hope** - Optimism, future, purpose

## Usage

### Local Scraping

Scrape all available conferences:
```bash
python conference_scraper.py
```

Scrape a limited number of sessions:
```bash
python conference_scraper.py 3  # Scrape only 3 sessions
```

### Merge Into Main Database

After scraping, merge the category files into your main `quotes_data.json`:

```bash
python merge_conference_quotes.py
```

This script:
1. Reads all JSON files from `conference_quotes/`
2. Deduplicates quotes based on exact text match
3. Re-assigns sequential IDs to maintain uniqueness
4. Merges into `quotes_data.json`
5. Prints merge summary

### Scheduled Scraping

The GitHub Actions workflow runs automatically:

- **Schedule**: First day of each month at 2 AM UTC
- **Trigger**: Manual via GitHub Actions UI

To trigger manually:

1. Go to **Actions** tab in GitHub
2. Select **"Scrape LDS General Conference Quotes"** workflow
3. Click **"Run workflow"**
4. (Optional) Set `limit_sessions` to limit scraping scope
5. Click **"Run workflow"** again

The workflow:
1. Scrapes all available conferences
2. Extracts and categorizes quotes using Claude
3. Merges new quotes into `quotes_data.json`
4. Commits and pushes changes automatically
5. Uploads category JSON files as artifacts

## How It Works

### 1. Conference Discovery

The scraper starts at `https://www.churchofjesuschrist.org/study/general-conference?lang=eng` and follows links to:
- Individual conference years (2024, 2023, etc.)
- Conference sessions (April, October)

### 2. Article Extraction

For each session, the scraper:
- Lists all speaker links
- Extracts article HTML

### 3. Quote Extraction

For each article, Claude AI:
- Reads the full talk text
- Identifies 2-5 impactful quotes
- Ensures quotes are 15-30 words (concise)
- Verifies quotes are direct text (not paraphrased)
- Assigns the most relevant category

### 4. Deduplication & Storage

The merger script:
- Compares new quotes against existing database
- Skips duplicates (case-insensitive)
- Assigns unique sequential IDs
- Adds `isFocusMode: true` for highlighting in your app

## Environment Setup

Required:
- `ANTHROPIC_API_KEY` - Claude API key (must have access to claude-opus-4-8)

Optional:
- `DEBUG` - Set to "true" for verbose logging

## Rate Limiting

The scraper includes built-in rate limiting:
- 0.5-second delay between article requests
- Reduces load on LDS Church servers
- Can be adjusted in `conference_scraper.py` line ~195

## Error Handling

The scraper gracefully handles:
- Network timeouts (10-second timeout per request)
- Missing or malformed HTML
- API failures (continues to next article)
- JSON parsing errors

Errors are logged to stdout with context.

## Database Integration

After scraping and merging, new quotes are ready to use:

1. **Daily Agent** automatically selects from updated `quotes_data.json`
2. **Quote Selection**: Uses date-based seed for deterministic daily rotation
3. **Caption Generation**: Claude creates fresh captions for each quote

## Performance Notes

- Scraping all conferences takes ~5-10 minutes
- Throttled requests to respect server rate limits
- API costs: ~$0.05-0.10 per full scrape (Claude Opus)
- GitHub Actions: Free tier includes 2,000 minutes/month

## Troubleshooting

### "No quotes to save"
- Check internet connection
- Verify website structure hasn't changed (LDS Church may update)
- Run with `DEBUG=true` for more info

### "JSON parse error"
- Claude response format changed
- Usually auto-resolves on next run

### "Duplicate quote detection too strict"
- Whitespace variations are normalized
- Case-insensitive matching
- Edit `merge_conference_quotes.py` line ~32 to adjust

### Workflow not triggering
- GitHub Actions enabled in repository settings
- `ANTHROPIC_API_KEY` set in GitHub Secrets
- Cron job time (2 AM UTC first of month) might not be obvious

## Extending the Scraper

Add new quote sources:

```python
def scrape_liahona_articles(self):
    """Scrape quotes from Liahona magazine"""
    # Similar pattern to scrape_session_articles()

# Call from scrape_all():
articles = self.scrape_liahona_articles()
```

Add new categories:
- Edit the prompt in `extract_and_categorize_quotes()` method
- Add category to the list of options
- Quotes will be categorized accordingly

## FAQ

**Q: Can I run this locally?**
A: Yes! `python conference_scraper.py` runs on your machine.

**Q: Will it scrape historical conferences?**
A: Yes, it scrapes all available from the index page (back to ~1990s).

**Q: How many quotes can I expect?**
A: ~100-200 per scrape run depending on conference size. Duplicates are filtered.

**Q: Can I use these quotes commercially?**
A: Yes, LDS talks are public domain. Always credit speakers and link to source.

**Q: What if the website changes?**
A: Update CSS selectors in `extract_article_text()` (lines ~95-110).

---

**Last Updated**: July 2024
**Version**: 1.0 (Stable)
