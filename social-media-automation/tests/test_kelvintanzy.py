from datetime import datetime, timedelta, timezone
from pathlib import Path

from automation.adapters import DryRunPublisher, DryRunStorage
from automation.kelvintanzy import (
    claude_refine_deck,
    execute_kelvintanzy,
    format_caption,
    _platform_caption,
    select_deck,
    validate_deck,
)


class MemoryState:
    def __init__(self) -> None:
        self.runs = {}
        self.client = MemoryClient()

    def acquire_run(self, **kwargs):
        key = f"{kwargs['stream_id']}:{kwargs['scheduled_for'].isoformat()}:{kwargs['slot']}"
        if key in self.runs:
            return Lock(False, key, self.runs[key])
        run_id = "run-1"
        self.runs[key] = run_id
        return Lock(True, key, run_id)

    def acquire_publish(self, **kwargs):
        return Claim(True, f"{kwargs['run_id']}_{kwargs['platform']}", 1)

    def record_publish_result(self, claim, **kwargs):
        pass

    def seal_run(self, result):
        pass

    def get_stream(self, stream_id):
        return {}


class MemoryClient:
    def collection(self, name):
        return self

    def document(self, name):
        return self

    def update(self, data):
        pass


class StreamStore:
    def __init__(self, stream):
        self._stream = stream

    def collection(self, name):
        return self

    def document(self, name):
        return self

    def get(self, transaction=None):
        return Snapshot(self._stream)


class Snapshot:
    def __init__(self, data):
        self.exists = True
        self._data = data

    def to_dict(self):
        return self._data


class Lock:
    def __init__(self, acquired, key, run_id):
        self.acquired = acquired
        self.key = key
        self.run_id = run_id


class Claim:
    def __init__(self, acquired, post_id, attempt):
        self.acquired = acquired
        self.post_id = post_id
        self.attempt = attempt


def test_select_deck_is_deterministic_for_slot() -> None:
    scheduled = datetime(2026, 9, 7, 22, 50, tzinfo=timezone.utc)
    assert select_deck(scheduled) == select_deck(scheduled)


def test_daily_rotation_uses_every_deck_before_repeating() -> None:
    monday = datetime(2026, 9, 6, 22, 50, tzinfo=timezone.utc)
    selected = [select_deck(monday + timedelta(days=days)) for days in range(14)]
    assert len(set(selected)) == 14


def test_kelvintanzy_uses_packaged_assets_for_carousel_and_x(tmp_path: Path) -> None:
    publisher = DryRunPublisher()
    storage = DryRunStorage()
    outcome = execute_kelvintanzy(
        state=MemoryState(),
        publisher=publisher,
        storage=storage,
        scheduled_for=datetime(2026, 9, 7, 22, 50, tzinfo=timezone.utc),
        slot="morning",
        platforms=["kelvintanzy.instagram", "kelvintanzy.threads", "kelvintanzy.x"],
        decks_dir=Path(__file__).parents[1] / "assets" / "kelvintanzy" / "decks",
        deck_name="dishspin",
    )

    assert outcome.status == "completed"
    assert outcome.slides == 8
    assert len(storage.uploads) == 8
    assert [request["kind"] for request in publisher.requests] == [
        "carousel",
        "carousel",
        "thread",
    ]


def test_kelvintanzy_prefers_curated_formatted_caption_over_profile(tmp_path: Path) -> None:
    publisher = DryRunPublisher()
    storage = DryRunStorage()
    stream = {
        "storyProfiles": {
            "dishspin": {
                "product": "Firebase product line",
                "problem": "Firebase problem line",
                "struggle": "Firebase struggle line",
            }
        }
    }

    class StoryState(MemoryState):
        def get_stream(self, stream_id):
            return stream

    outcome = execute_kelvintanzy(
        state=StoryState(),
        publisher=publisher,
        storage=storage,
        scheduled_for=datetime(2026, 9, 7, 22, 50, tzinfo=timezone.utc),
        slot="morning",
        platforms=["kelvintanzy.instagram"],
        decks_dir=Path(__file__).parents[1] / "assets" / "kelvintanzy" / "decks",
        deck_name="dishspin",
    )

    assert outcome.status == "completed"
    caption=publisher.requests[0]["caption"]
    assert caption.startswith("Five months of code")
    assert "\n\nWhat changed:\n" not in caption
    assert "\n\nBuilder lesson:\n" not in caption
    assert "Firebase product line" not in caption


def test_formatted_caption_preserves_hashtags_at_bottom() -> None:
    value="Hook.\n\nStory.\n\nBuilder lesson: Keep it small.\n\n#BuildInPublic #IndieDev"
    result=format_caption(value,"instagram")
    assert result==("Hook.\n\nWhat changed:\nStory.\n\nBuilder lesson:\nKeep it small."
      "\n\nWhat would you have done differently?\n\n#BuildInPublic #IndieDev")


def test_threads_caption_borrows_the_specific_instagram_question() -> None:
    captions = {
        "instagram": "Hook.\n\nWhy does this decision matter?\n\n#One #Two #Three",
        "threads": "Hook.\n\nA concise explanation.\n\nSource: https://example.com",
    }
    result = _platform_caption(captions, "threads")
    assert "Why does this decision matter?\n\nSource:" in result


def test_quality_gate_rejects_post_without_shareable_utility() -> None:
    import pytest
    with pytest.raises(ValueError, match="saveable utility"):
        validate_deck({
            "illustration": "ai",
            "lens": "product decision", "analysisType": "teardown",
            "angle": "update", "shareValue": "none",
            "slides": [{"kind": "hook", "text": "A curious hook"}],
            "captions": {"instagram": "Would you try it?"},
        })


def test_quality_gate_rejects_uncredited_app_screenshots() -> None:
    import pytest
    with pytest.raises(ValueError, match="forbids uncredited app screenshots"):
        validate_deck({
            "illustration": "ai",
            "scope": "own", "lens": "design", "analysisType": "teardown",
            "angle": "teardown", "shareValue": "A useful test",
            "slides": [
                {"kind": "hook", "text": "A curious hook"},
                {"kind": "shot", "text": "UI", "image": "screen.png"},
                {"kind": "utility", "text": "Use this", "items": ["One", "Two", "Three"]},
            ],
            "captions": {"instagram": "Would you try it?"},
        })


def test_quality_gate_allows_sourced_reference_screen() -> None:
    validate_deck({
        "illustration": "ai",
        "scope": "own", "lens": "design", "analysisType": "teardown",
        "angle": "specific screen", "shareValue": "A useful test",
        "slides": [
            {"kind": "hook", "text": "This screen solves the wrong problem."},
            {
                "kind": "reference", "text": "Look at the primary action",
                "image": "screen.png", "product": "Example", "screen": "Home",
                "sourceUrl": "https://example.com/product",
            },
            {"kind": "utility", "text": "Use this", "items": ["One", "Two", "Three"]},
        ],
        "captions": {"instagram": "A screen teardown.\n\nWould you change this screen?\n\n#ProductDesign #UXDesign #AppDesign"},
    })


def test_quality_gate_rejects_wordy_single_image() -> None:
    import pytest
    with pytest.raises(ValueError, match="headline must stay"):
        validate_deck({
            "illustration": "ai",
            "scope": "own", "lens": "AI", "analysisType": "single",
            "angle": "one point", "shareValue": "A short test",
            "slides": [{
                "kind": "single",
                "text": "This headline keeps adding words until the main idea is difficult to find quickly",
                "kicker": "Short explanation.",
                "items": ["One", "Two", "Three"],
            }],
            "captions": {"instagram": "A useful point.\n\nWould this help you?\n\n#ProductDesign #Tech #AI"},
        })


def test_quality_gate_rejects_code_without_real_result_images() -> None:
    import pytest
    with pytest.raises(ValueError, match="real result images"):
        validate_deck({
            "illustration": "ai",
            "scope": "own", "lens": "SwiftUI", "analysisType": "code",
            "angle": "one API", "shareValue": "Working code and result",
            "slides": [
                {"kind": "hook", "text": "This modifier changes the interface."},
                {"kind": "code", "text": "Try this", "code": "Text(\"Hi\")",
                 "explanation": "This should show what the code changes.",
                 "previews": [{"label": "RESULT", "color": [1, 2, 3]}]},
                {"kind": "utility", "text": "Use this", "items": ["One", "Two", "Three"]},
            ],
            "captions": {"instagram": "A useful point.\n\nWould this help you?\n\n#SwiftUI #iOSDev #Tech"},
        })


def test_quality_gate_rejects_swiftui_code_not_based_on_apple_docs() -> None:
    import pytest
    with pytest.raises(ValueError, match="Apple documentation"):
        validate_deck({
            "illustration": "ai",
            "scope": "own", "lens": "SwiftUI implementation", "analysisType": "code",
            "angle": "one API", "shareValue": "Working code and result",
            "slides": [
                {"kind": "hook", "text": "This modifier changes the interface."},
                {"kind": "code", "text": "Try this", "code": "Text(\"Hi\")",
                 "explanation": "This should show what the code changes.",
                 "sourceLabel": "BLOG",
                 "previews": [{"label": "RESULT", "image": "result.png"}]},
                {"kind": "utility", "text": "Use this", "items": ["One", "Two", "Three"]},
            ],
            "captions": {"instagram": "A useful point.\n\nWould this help you?\n\n#SwiftUI #iOSDev #Tech"},
        })


def test_quality_gate_rejects_unverified_swiftui_usage() -> None:
    import json
    import pytest
    deck_path = Path(__file__).parents[1] / "assets" / "kelvintanzy" / "decks" / "swiftui-mapstyle.json"
    deck = json.loads(deck_path.read_text())
    deck.pop("codeVerification")
    with pytest.raises(ValueError, match="compiler-verified"):
        validate_deck(deck)


def test_quality_gate_rejects_incomplete_concrete_example() -> None:
    import json
    import pytest
    deck_path = Path(__file__).parents[1] / "assets" / "kelvintanzy" / "decks" / "ai-foundation-models.json"
    deck = json.loads(deck_path.read_text())
    example = next(slide for slide in deck["slides"] if slide["kind"] == "example")
    example["items"] = ["Only one"]
    with pytest.raises(ValueError, match="four visible results"):
        validate_deck(deck)


def test_quality_gate_rejects_missing_solution_slide() -> None:
    import json
    import pytest
    deck_path = Path(__file__).parents[1] / "assets" / "kelvintanzy" / "decks" / "ai-foundation-models.json"
    deck = json.loads(deck_path.read_text())
    for slide in deck["slides"]:
        slide.pop("role", None)
    with pytest.raises(ValueError, match="visible problem and solution"):
        validate_deck(deck)


def test_claude_editorial_cannot_change_locked_code(monkeypatch) -> None:
    import json

    deck_path = Path(__file__).parents[1] / "assets" / "kelvintanzy" / "decks" / "swiftui-mapstyle.json"
    deck = json.loads(deck_path.read_text())
    original_code = deck["slides"][2]["code"]
    source_url = deck["source"]["url"]
    monkeypatch.setenv("ANTHROPIC_API_KEY", "test-key")

    class Response:
        status_code = 200

        def json(self):
            return {"content": [{"text": json.dumps({
                "hook": "This modifier changes what the map helps users notice.",
                "question": "Would you prioritize orientation or a sense of place?",
            })}]}

    revised = claude_refine_deck(deck, request=lambda *args, **kwargs: Response())
    assert revised["slides"][2]["code"] == original_code
    assert revised["slides"][0]["text"].startswith("This modifier")
    assert "Would you prioritize orientation" in revised["captions"]["instagram"]
    assert source_url in revised["captions"]["instagram"]
    validate_deck(revised)
