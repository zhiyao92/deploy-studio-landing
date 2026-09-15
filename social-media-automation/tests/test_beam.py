from datetime import date
import json

from automation.beam import POSTS, BeamPost, _primary_phrase_for_visual, claude_post_for_day, post_for_day, render


class Response:
    status_code = 200

    def json(self):
        return {
            "content": [
                {
                    "type": "text",
                    "text": json.dumps({
                        "slug": "ask-for-help",
                        "headline": "Ask for help",
                        "thai": "ช่วยหน่อยได้ไหม",
                        "romanization": "chuay noi dai mai",
                        "meaning": "Could you help me?",
                        "explanation": "A soft, practical phrase when you need help from someone nearby.",
                        "hashtags": ["#BeamLearnThai", "#LearnThai", "#ThaiLanguage"],
                    }),
                }
            ]
        }


def test_claude_post_for_day_parses_beam_content(monkeypatch) -> None:
    calls = []
    monkeypatch.setenv("ANTHROPIC_API_KEY", "test-key\n")
    monkeypatch.setenv("ANTHROPIC_MODEL", "test-model")

    def fake_request(url, **kwargs):
        calls.append((url, kwargs))
        return Response()

    post = claude_post_for_day(date(2026, 9, 7), request=fake_request)

    assert post.slug == "ask-for-help"
    assert post.thai == "ช่วยหน่อยได้ไหม"
    assert calls[0][1]["headers"]["x-api-key"] == "test-key"
    assert calls[0][1]["json"]["model"] == "test-model"


def test_claude_thai_visual_removes_punctuation(monkeypatch) -> None:
    class PunctuatedThaiResponse:
        status_code = 200

        def json(self):
            return {
                "content": [{
                    "type": "text",
                    "text": json.dumps({
                        "slug": "order-food",
                        "headline": "Order food",
                        "thai": "ขอ... หน่อยครับ/ค่ะ",
                        "romanization": "khor noi khrap kha",
                        "meaning": "Could I have some, please?",
                        "explanation": "Use one polite ending when ordering food.",
                        "hashtags": ["#BeamLearnThai", "#LearnThai"],
                    }),
                }]
            }

    monkeypatch.setenv("ANTHROPIC_API_KEY", "test-key")
    post = claude_post_for_day(date(2026, 9, 8), request=lambda *args, **kwargs: PunctuatedThaiResponse())

    assert post.thai == "ขอ... หน่อยครับ/ค่ะ"
    assert _primary_phrase_for_visual(post) == ("khor noi khrap kha", False)


def test_visual_falls_back_to_romanization_for_unsafe_thai() -> None:
    post = BeamPost(
        slug="unsafe",
        headline="Order food",
        thai="ขอ... หน่อยครับ/ค่ะ",
        romanization="khor noi khrap kha",
        meaning="Could I have some, please?",
        explanation="Use one polite ending when ordering food.",
        hashtags=("#BeamLearnThai",),
    )

    assert _primary_phrase_for_visual(post) == ("khor noi khrap kha", False)


def test_post_for_day_falls_back_to_curated_content(monkeypatch) -> None:
    monkeypatch.setenv("ANTHROPIC_API_KEY", "test-key")
    monkeypatch.setattr(
        "automation.beam.claude_post_for_day",
        lambda day: (_ for _ in ()).throw(RuntimeError("Claude unavailable")),
    )

    day = date(2026, 9, 7)
    assert post_for_day(day) == POSTS[(day.toordinal() - 1) % len(POSTS)]


def test_render_handles_long_claude_fields() -> None:
    post = BeamPost(
        slug="long-layout",
        headline="A polite phrase for a crowded Bangkok market",
        thai="ขอทางหน่อยครับ",
        romanization="khor thaang noi khrap",
        meaning="Excuse me, may I pass through here?",
        explanation=(
            "Use this when moving through a crowded place; it sounds gentle, practical, "
            "and respectful in daily Thai."
        ),
        hashtags=("#BeamLearnThai", "#LearnThai"),
    )

    png = render(post)

    assert png.startswith(b"\x89PNG")
    assert len(png) > 10_000
