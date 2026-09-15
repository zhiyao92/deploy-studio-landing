import json

import pytest

from automation.lds_conference import ConferenceSource, generate_content, render_slide, source_from_env


class Response:
    status_code = 200

    def json(self):
        return {
            "content": [
                {
                    "type": "text",
                    "text": json.dumps({
                        "content_type": "Carousel",
                        "content_angle": "A practical reflection is strongest for this talk.",
                        "hook": "A Conference message worth revisiting",
                        "slides": [
                            "A Conference message worth revisiting",
                            "The speaker teaches a principle from the supplied source.",
                            "This reflection is an application, not a direct quote.",
                        ],
                        "caption": (
                            "A short reflection from General Conference.\n\n"
                            "Source: Test Talk — Test Speaker, April 2026\n\n"
                            "What stood out to you?\n\n"
                            "#GeneralConference #LDSConference #ChurchOfJesusChrist "
                            "#ComeUntoChrist #LatterDaySaints #ChristianInspiration"
                        ),
                        "discussion_reflection_question": "What stood out to you?",
                        "cta": "Save this for your next Conference study.",
                        "visual_direction": "Warm editorial carousel.",
                        "reel_script": {
                            "duration_seconds": 28,
                            "scenes": [
                                {
                                    "time": "0-3s",
                                    "on_screen_text": "Too many worries?",
                                    "voiceover": "Sometimes life gives you too many things to chase.",
                                    "visual": "Creator looking at a busy notes app.",
                                }
                            ],
                            "voiceover_full": "Sometimes life gives you too many things to chase.",
                            "editing_notes": "Fast cuts, gentle music, burned-in subtitles.",
                        },
                        "source_verification": {
                            "talk_title_verified": True,
                            "speaker_verified": True,
                            "conference_verified": True,
                            "direct_quotes_used": False,
                            "direct_quotes": [],
                            "ai_interpretations_clearly_separated": True,
                            "do_not_publish": False,
                        },
                    }),
                }
            ]
        }


def test_source_from_env_requires_official_source(monkeypatch) -> None:
    monkeypatch.delenv("LDS_CONFERENCE_TALK_TITLE", raising=False)

    with pytest.raises(RuntimeError, match="DO_NOT_PUBLISH"):
        source_from_env()


def test_generate_content_uses_conference_claude_rules(monkeypatch) -> None:
    calls = []
    monkeypatch.setenv("ANTHROPIC_API_KEY", "test-key\n")
    monkeypatch.setenv("ANTHROPIC_MODEL", "test-model")
    source = ConferenceSource(
        title="Test Talk",
        speaker="Test Speaker",
        conference="April 2026",
        session="Sunday Morning",
        official_url="https://www.churchofjesuschrist.org/study/general-conference/test",
        transcript="This is the complete supplied official transcript for testing.",
    )

    def fake_request(url, **kwargs):
        calls.append((url, kwargs))
        return Response()

    content = generate_content(source, request=fake_request)

    prompt = calls[0][1]["json"]["messages"][0]["content"]
    assert calls[0][1]["headers"]["x-api-key"] == "test-key"
    assert "official General Conference source" in prompt
    assert "#GeneralConference" in prompt
    assert "Never invent quotations" in prompt
    assert "maximum 70 characters per slide" in prompt
    assert "max 70 characters" in prompt
    assert "modern Malaysian Christian creator post" in prompt
    assert "Caption format must be clean" in prompt
    assert content.slides[0] == "A Conference message worth revisiting"
    assert len(content.slides[0]) <= 70
    assert "#LDSConference" in content.caption
    assert "Source: Test Talk" in content.caption
    assert content.reel_script is not None
    assert content.reel_script["scenes"][0]["on_screen_text"] == "Too many worries?"


def test_prompt_can_force_reel_script_mode(monkeypatch) -> None:
    calls = []
    monkeypatch.setenv("ANTHROPIC_API_KEY", "test-key")
    monkeypatch.setenv("LDS_CONFERENCE_CONTENT_FORMAT", "reel-script")
    source = ConferenceSource(
        title="Test Talk",
        speaker="Test Speaker",
        conference="April 2026",
        session="Sunday Morning",
        official_url="https://www.churchofjesuschrist.org/study/general-conference/test",
        transcript="This is the complete supplied official transcript for testing.",
    )

    def fake_request(url, **kwargs):
        calls.append((url, kwargs))
        return Response()

    generate_content(source, request=fake_request)

    prompt = calls[0][1]["json"]["messages"][0]["content"]
    assert "choose CONTENT TYPE: Reel Script" in prompt
    assert "complete reel_script object" in prompt


def test_render_slide_outputs_png() -> None:
    png = render_slide("A Conference message worth revisiting", slide_number=1, total_slides=3)

    assert png.startswith(b"\x89PNG")
    assert len(png) > 10_000
