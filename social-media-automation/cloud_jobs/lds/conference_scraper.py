"""
LDS General Conference Quote Scraper

Scrapes quotes from LDS General Conference talks and saves them organized by category.
Uses Claude AI to intelligently extract and categorize quotes.
"""

import json
import logging
import os
import random
import re
from datetime import datetime
from typing import Optional
from urllib.parse import urljoin

import requests
from anthropic import Anthropic
from bs4 import BeautifulSoup
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

BASE_URL = "https://www.churchofjesuschrist.org"
CONFERENCE_INDEX = f"{BASE_URL}/study/general-conference?lang=eng"


class ConferenceQuoteScraper:
    def __init__(self):
        self.client = Anthropic()
        self.session = requests.Session()
        self.session.headers.update({
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"
        })
        self.quotes_by_category = {}
        self.next_id = self._get_next_id()

    def _get_next_id(self) -> int:
        """Get next available quote ID from existing quotes."""
        try:
            with open("quotes_data.json") as f:
                data = json.load(f)
                if data.get("quotes"):
                    return max(q.get("id", 0) for q in data["quotes"]) + 1
        except (FileNotFoundError, json.JSONDecodeError):
            pass
        return 70000

    def scrape_conference_links(self) -> list[str]:
        """Scrape all general conference links from index page."""
        logger.info(f"Fetching conference index: {CONFERENCE_INDEX}")
        resp = self.session.get(CONFERENCE_INDEX, timeout=10)
        resp.raise_for_status()

        soup = BeautifulSoup(resp.content, "html.parser")
        links = []

        # Find all links to conference sessions
        for link in soup.find_all("a", href=re.compile(r"/study/general-conference/\d{4}")):
            href = link.get("href")
            if href:
                full_url = urljoin(BASE_URL, href)
                if full_url not in links:
                    links.append(full_url)

        logger.info(f"Found {len(links)} conference links")
        return links

    def scrape_session_articles(self, session_url: str) -> list[str]:
        """Scrape all article links from a conference session."""
        logger.info(f"Fetching session: {session_url}")
        resp = self.session.get(session_url, timeout=10)
        resp.raise_for_status()

        soup = BeautifulSoup(resp.content, "html.parser")
        articles = []

        # Find article links in the session
        for link in soup.find_all("a", href=re.compile(r"/study/general-conference/\d{4}/\d{2}/\d{2}")):
            href = link.get("href")
            if href and "lang=eng" in href:
                full_url = urljoin(BASE_URL, href)
                if full_url not in articles:
                    articles.append(full_url)

        logger.info(f"Found {len(articles)} articles in session")
        return articles

    def extract_article_text(self, article_url: str) -> Optional[dict]:
        """Extract text content from an article."""
        try:
            logger.info(f"Fetching article: {article_url}")
            resp = self.session.get(article_url, timeout=10)
            resp.raise_for_status()

            soup = BeautifulSoup(resp.content, "html.parser")

            # Extract title
            title_elem = soup.find("h1")
            title = title_elem.get_text(strip=True) if title_elem else "Unknown"

            # Extract author from URL or page
            author_match = re.search(r"/(\d{2})([a-z]+)\?", article_url)
            author_name = None
            if author_match:
                # Try to find speaker name in page
                speaker_elem = soup.find("span", class_="speaker-name")
                if speaker_elem:
                    author_name = speaker_elem.get_text(strip=True)

            # Extract main article text
            article_body = soup.find("div", class_="article-body")
            if not article_body:
                article_body = soup.find("div", class_="content")

            if not article_body:
                logger.warning(f"Could not find article body in {article_url}")
                return None

            text = article_body.get_text(separator="\n", strip=True)

            return {
                "url": article_url,
                "title": title,
                "author": author_name or "Unknown",
                "text": text
            }
        except Exception as e:
            logger.error(f"Error extracting article {article_url}: {e}")
            return None

    def extract_and_categorize_quotes(self, article_data: dict) -> list[dict]:
        """Use Claude to extract and categorize quotes from article text."""
        prompt = f"""Extract meaningful quotes from this LDS General Conference talk.

Article Title: {article_data['title']}
Author: {article_data['author']}
URL: {article_data['url']}

Article Text:
{article_data['text']}

Instructions:
1. Extract 2-5 of the most impactful quotes
2. Quotes should be 15-30 words (concise but complete thoughts)
3. Each quote should be a direct quote from the text
4. Categorize each quote with ONE of these categories:
   - Faith
   - Repentance
   - Love
   - Service
   - Agency
   - Obedience
   - Testimony
   - Family
   - Priesthood
   - Charity
   - Endurance
   - Conversion
   - Leadership
   - Personal Growth
   - Hope

Return ONLY valid JSON array with no markdown formatting:
[
  {
    "quote": "exact quote from text",
    "category": "category name"
  }
]

Return empty array [] if no suitable quotes found."""

        try:
            response = self.client.messages.create(
                model="claude-opus-4-8",
                max_tokens=1500,
                messages=[{"role": "user", "content": prompt}]
            )

            response_text = response.content[0].text.strip()
            # Handle markdown code blocks
            if response_text.startswith("```"):
                response_text = response_text.split("```")[1]
                if response_text.startswith("json"):
                    response_text = response_text[4:]
                response_text = response_text.strip()

            quotes = json.loads(response_text)

            result = []
            for q in quotes:
                if q.get("quote") and q.get("category"):
                    result.append({
                        "quote": q["quote"],
                        "category": q["category"],
                        "author": article_data["author"],
                        "source": article_data["url"]
                    })

            return result
        except Exception as e:
            logger.error(f"Error categorizing quotes from {article_data['url']}: {e}")
            return []

    def save_quotes_by_category(self):
        """Save extracted quotes organized by category."""
        if not self.quotes_by_category:
            logger.info("No quotes to save")
            return

        os.makedirs("conference_quotes", exist_ok=True)

        for category, quotes in self.quotes_by_category.items():
            filename = f"conference_quotes/{category.lower().replace(' ', '_')}.json"

            data = {"quotes": quotes}

            with open(filename, "w") as f:
                json.dump(data, f, indent=2)

            logger.info(f"Saved {len(quotes)} quotes to {filename}")

    def add_quote(self, quote_data: dict):
        """Add a quote with auto-incremented ID."""
        quote_data["id"] = self.next_id
        self.next_id += 1

        category = quote_data.get("category", "Uncategorized")
        if category not in self.quotes_by_category:
            self.quotes_by_category[category] = []

        self.quotes_by_category[category].append(quote_data)

    def scrape_all(self, limit_sessions: Optional[int] = None):
        """Scrape all general conference talks."""
        try:
            conference_links = self.scrape_conference_links()

            if limit_sessions:
                conference_links = conference_links[:limit_sessions]

            total_quotes = 0

            for session_url in conference_links:
                try:
                    articles = self.scrape_session_articles(session_url)

                    for article_url in articles:
                        article_data = self.extract_article_text(article_url)
                        if not article_data:
                            continue

                        quotes = self.extract_and_categorize_quotes(article_data)
                        for quote in quotes:
                            self.add_quote(quote)
                            total_quotes += 1

                        # Rate limiting
                        import time
                        time.sleep(0.5)

                except Exception as e:
                    logger.error(f"Error processing session {session_url}: {e}")
                    continue

            logger.info(f"Extracted {total_quotes} quotes total")
            self.save_quotes_by_category()
            return total_quotes

        except Exception as e:
            logger.error(f"Fatal error in scrape_all: {e}")
            raise


def main():
    """Main entry point."""
    import sys

    limit = None
    if len(sys.argv) > 1:
        try:
            limit = int(sys.argv[1])
        except ValueError:
            print(f"Usage: {sys.argv[0]} [limit_sessions]")
            sys.exit(1)

    scraper = ConferenceQuoteScraper()
    count = scraper.scrape_all(limit_sessions=limit)
    print(f"\n✓ Scraping complete! Extracted {count} quotes.")


if __name__ == "__main__":
    main()
