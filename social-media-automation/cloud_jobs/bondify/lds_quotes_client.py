#!/usr/bin/env python3
"""
lds_quotes_client.py — Client for fetching quotes from LDS Quotes API.

Handles authentication and quote retrieval from the LDS Quotes Daily Inspiration app.
"""

import logging
import os
from datetime import date
from typing import Optional

import requests

logger = logging.getLogger("lds_quotes_client")


class Quote:
    """Represents a single quote from LDS Quotes app."""

    def __init__(self, quote_id: str, text: str, author: str, category: str, source: str = ""):
        self.id = quote_id
        self.text = text
        self.author = author
        self.category = category
        self.source = source

    def __repr__(self) -> str:
        return f"Quote(id={self.id}, author={self.author}, category={self.category})"


class LDSQuotesClient:
    """Client for LDS Quotes API."""

    def __init__(self, api_url: str, api_key: str):
        """Initialize the client.

        Args:
            api_url: Base URL for LDS Quotes API
            api_key: API key for authentication
        """
        self.api_url = api_url.rstrip("/")
        self.api_key = api_key
        self.session = requests.Session()
        self.session.headers.update({
            "Authorization": f"Bearer {api_key}",
            "User-Agent": "Bondify-Social/1.0",
        })

    def get_daily_quote(self) -> Quote:
        """Fetch the daily quote.

        Returns:
            Quote object

        Raises:
            RuntimeError: If API call fails
        """
        try:
            resp = self.session.get(
                f"{self.api_url}/api/quotes/daily",
                timeout=30
            )
            resp.raise_for_status()
            data = resp.json()

            return Quote(
                quote_id=data.get("id", ""),
                text=data.get("quote", ""),
                author=data.get("author", "Unknown"),
                category=data.get("category", "General"),
                source=data.get("source", ""),
            )
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to fetch daily quote: {e}")
            raise RuntimeError(f"LDS Quotes API error: {e}")

    def get_random_quote(self, category: Optional[str] = None) -> Quote:
        """Fetch a random quote, optionally filtered by category.

        Args:
            category: Optional category filter

        Returns:
            Quote object

        Raises:
            RuntimeError: If API call fails
        """
        try:
            params = {}
            if category:
                params["category"] = category

            resp = self.session.get(
                f"{self.api_url}/api/quotes/random",
                params=params,
                timeout=30
            )
            resp.raise_for_status()
            data = resp.json()

            return Quote(
                quote_id=data.get("id", ""),
                text=data.get("quote", ""),
                author=data.get("author", "Unknown"),
                category=data.get("category", "General"),
                source=data.get("source", ""),
            )
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to fetch random quote: {e}")
            raise RuntimeError(f"LDS Quotes API error: {e}")

    def get_quote_by_id(self, quote_id: str) -> Quote:
        """Fetch a specific quote by ID.

        Args:
            quote_id: The quote ID

        Returns:
            Quote object

        Raises:
            RuntimeError: If API call fails
        """
        try:
            resp = self.session.get(
                f"{self.api_url}/api/quotes/{quote_id}",
                timeout=30
            )
            resp.raise_for_status()
            data = resp.json()

            return Quote(
                quote_id=data.get("id", ""),
                text=data.get("quote", ""),
                author=data.get("author", "Unknown"),
                category=data.get("category", "General"),
                source=data.get("source", ""),
            )
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to fetch quote {quote_id}: {e}")
            raise RuntimeError(f"LDS Quotes API error: {e}")

    def get_categories(self) -> list[str]:
        """Fetch available quote categories.

        Returns:
            List of category names

        Raises:
            RuntimeError: If API call fails
        """
        try:
            resp = self.session.get(
                f"{self.api_url}/api/categories",
                timeout=30
            )
            resp.raise_for_status()
            data = resp.json()
            return data.get("categories", [])
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to fetch categories: {e}")
            raise RuntimeError(f"LDS Quotes API error: {e}")
