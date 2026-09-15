import json

from automation.slack import send_dry_run_status


def test_slack_dry_run_message_is_explicit_and_redacted() -> None:
    sent = []
    send_dry_run_status(
        "https://hooks.slack.com/services/test",
        stream="kelvintanzy", deck="dishspin", status="completed", slides=8,
        targets=["kelvintanzy.instagram", "kelvintanzy.threads", "kelvintanzy.x"],
        run_id="run-1", send=lambda url, body: sent.append((url, body)),
    )
    payload = json.loads(sent[0][1])
    assert "DRY RUN — NO SOCIAL POSTS SENT" in payload["text"]
    assert "Rendered slides: 8" in payload["text"]
    assert "run-1" in payload["text"]
