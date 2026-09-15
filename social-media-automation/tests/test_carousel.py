from pathlib import Path

import pytest
import json

from automation.carousel import render_deck


ASSETS = Path(__file__).parents[1] / "assets" / "kelvintanzy"


@pytest.mark.parametrize("deck", sorted((ASSETS / "decks").glob("*.json")))
def test_kelvintanzy_deck_renders_all_slides(deck: Path, tmp_path: Path) -> None:
    rendered = render_deck(deck, tmp_path / deck.stem)
    assert rendered
    assert all(path.exists() and path.stat().st_size > 10_000 for path in rendered)


@pytest.mark.parametrize("deck", sorted((ASSETS / "decks").glob("*.json")))
def test_every_packaged_deck_passes_quality_gate(deck: Path) -> None:
    from automation.kelvintanzy import validate_deck

    validate_deck(json.loads(deck.read_text()))
