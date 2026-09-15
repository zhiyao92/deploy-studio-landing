#!/usr/bin/env python3
"""
bondify_data_client.py — Client for loading Bondify conversation starter data.

Loads question cards from Bondify script files organized by mode.
"""

import logging
import random
from pathlib import Path
from typing import Optional

import json5

logger = logging.getLogger("bondify_data_client")


class Card:
    """Represents a single Bondify conversation starter card."""

    def __init__(
        self,
        card_id: str,
        question: str,
        deck_id: str,
        mode: str,
        category: str = "",
        intensity: str = "medium",
    ):
        self.id = card_id
        self.question = question
        self.deck_id = deck_id
        self.mode = mode
        self.category = category
        self.intensity = intensity

    def __repr__(self) -> str:
        return f"Card(id={self.id}, mode={self.mode}, intensity={self.intensity})"


class BondifyDataClient:
    """Client for loading Bondify conversation starter data."""

    def __init__(self, scripts_dir: Path):
        """Initialize the client.

        Args:
            scripts_dir: Path to Bondify scripts directory
        """
        self.scripts_dir = Path(scripts_dir)
        self.cards: list[Card] = []
        self.modes: dict = {}
        self.decks: dict = {}
        self._load_data()

    def _load_data(self) -> None:
        """Load all Bondify data from script files."""
        try:
            # Find all .js files in the scripts directory
            js_files = sorted(self.scripts_dir.glob("*.js"))
            logger.info(f"Found {len(js_files)} script files")

            for js_file in js_files:
                mode_name = js_file.stem  # e.g., "chill" from "chill.js"
                self._parse_js_file(js_file, mode_name)

            logger.info(f"Loaded {len(self.cards)} cards from {len(self.modes)} modes")

        except Exception as e:
            logger.error(f"Failed to load Bondify data: {e}")
            raise RuntimeError(f"Data loading failed: {e}")

    def _parse_js_file(self, file_path: Path, mode_name: str) -> None:
        """Parse a JavaScript file to extract modes, decks, and cards.

        Args:
            file_path: Path to the .js file
            mode_name: Mode name (from filename)
        """
        try:
            with open(file_path) as f:
                content = f.read()

            # Extract modes array
            modes_data = self._extract_array_content(content, "const modes = ")
            if modes_data:
                modes = self._parse_json_array(modes_data)
                for mode in modes:
                    self.modes[mode.get("id")] = mode
                logger.debug(f"Loaded {len(modes)} modes")

            # Extract decks array
            decks_data = self._extract_array_content(content, "const decks = ")
            if decks_data:
                decks = self._parse_json_array(decks_data)
                for deck in decks:
                    self.decks[deck.get("id")] = deck
                logger.debug(f"Loaded {len(decks)} decks")

            # Extract cards array
            cards_data = self._extract_array_content(content, "const cards = ")
            if cards_data:
                cards = self._parse_json_array(cards_data)
                cards_loaded = 0

                for card_data in cards:
                    card = Card(
                        card_id=card_data.get("id", ""),
                        question=card_data.get("question", ""),
                        deck_id=card_data.get("deckId", ""),
                        mode=mode_name,
                        category=card_data.get("category", ""),
                        intensity=card_data.get("intensity", "medium"),
                    )
                    self.cards.append(card)
                    cards_loaded += 1

                logger.info(f"✓ Loaded {cards_loaded} cards from {file_path.name}")
            else:
                logger.warning(f"No cards array found in {file_path.name}")

        except Exception as e:
            logger.warning(f"Error parsing {file_path.name}: {e}")

    def _extract_array_content(self, content: str, array_declaration: str) -> str:
        """Extract array content between [ and ].

        Handles large arrays by finding the matching bracket.

        Args:
            content: File content
            array_declaration: String like "const cards = "

        Returns:
            Array content (without brackets) or empty string if not found
        """
        try:
            # Find the start of the array
            start_idx = content.find(array_declaration)
            if start_idx == -1:
                return ""

            # Find the opening bracket
            bracket_idx = content.find("[", start_idx)
            if bracket_idx == -1:
                return ""

            # Find the matching closing bracket
            bracket_count = 0
            end_idx = bracket_idx

            for i in range(bracket_idx, len(content)):
                if content[i] == "[":
                    bracket_count += 1
                elif content[i] == "]":
                    bracket_count -= 1
                    if bracket_count == 0:
                        end_idx = i
                        break

            # Extract content between brackets
            return content[bracket_idx + 1 : end_idx]

        except Exception as e:
            logger.warning(f"Error extracting array: {e}")
            return ""

    def _parse_json_array(self, json_str: str) -> list:
        """Parse an array of JavaScript object literals.

        Uses JSON5, which natively supports unquoted keys, single-quoted
        strings, trailing commas, and comments — so the JS source needs no
        regex rewriting (which corrupted strings containing colons/quotes).
        """
        try:
            json_str = json_str.strip()
            if not json_str:
                logger.warning("Empty array content")
                return []

            # Closing bracket on its own line: if the array content ends with
            # a // comment, a same-line bracket would be swallowed by it.
            result = json5.loads("[" + json_str + "\n]")
            if isinstance(result, list):
                return result

            logger.warning(f"Unexpected parsed type: {type(result)}")
            return []

        except Exception as e:
            logger.warning(f"JS array parse error: {e}")
            return []

    def get_random_card(self, mode: Optional[str] = None) -> Card:
        """Get a random card, optionally filtered by mode.

        Args:
            mode: Optional mode filter (e.g., "chill", "deep")

        Returns:
            Random Card object

        Raises:
            RuntimeError: If no cards available
        """
        if not self.cards:
            raise RuntimeError("No cards loaded")

        if mode:
            filtered = [c for c in self.cards if c.mode == mode]
            if not filtered:
                logger.warning(f"No cards for mode '{mode}', using all cards")
                return random.choice(self.cards)
            return random.choice(filtered)

        return random.choice(self.cards)

    def get_deck_title(self, deck_id: str) -> str:
        """Get the display title of a deck (e.g. "❤️ Getting Deeper").

        Args:
            deck_id: The deck ID from a card

        Returns:
            Deck title string, or "" if the deck is unknown
        """
        deck = self.decks.get(deck_id)
        if isinstance(deck, dict):
            return deck.get("title", "")
        return ""

    def get_card_by_id(self, card_id: str) -> Optional[Card]:
        """Get a specific card by ID.

        Args:
            card_id: The card ID

        Returns:
            Card object or None if not found
        """
        for card in self.cards:
            if card.id == card_id:
                return card
        return None

    def get_modes(self) -> list[str]:
        """Get list of available modes.

        Returns:
            List of mode names
        """
        return list(set(card.mode for card in self.cards))

    def get_cards_by_mode(self, mode: str) -> list[Card]:
        """Get all cards for a specific mode.

        Args:
            mode: Mode name

        Returns:
            List of Card objects
        """
        return [c for c in self.cards if c.mode == mode]

    def get_stats(self) -> dict:
        """Get statistics about loaded data.

        Returns:
            Dict with stats
        """
        modes = self.get_modes()
        return {
            "total_cards": len(self.cards),
            "total_modes": len(modes),
            "modes": modes,
            "cards_per_mode": {mode: len(self.get_cards_by_mode(mode)) for mode in modes},
        }
