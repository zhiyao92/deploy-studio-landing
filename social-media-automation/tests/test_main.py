from automation.main import _publisher
from automation.buffer import BufferPublisher
import automation.main as main_module
import pytest


def test_beam_publisher_does_not_require_kelvintanzy_channels(monkeypatch) -> None:
    monkeypatch.setenv("STREAM_ID", "beam-learn-thai")
    monkeypatch.setenv("BUFFER_ACCESS_TOKEN", "buffer-token")
    monkeypatch.setenv("BEAM_INSTAGRAM_CHANNEL", "beam-channel")
    monkeypatch.delenv("BUFFER_INSTAGRAM_CHANNEL", raising=False)
    monkeypatch.delenv("BUFFER_THREADS_CHANNEL", raising=False)
    monkeypatch.delenv("BUFFER_X_CHANNEL", raising=False)

    publisher = _publisher(dry_run=False)

    assert isinstance(publisher, BufferPublisher)
    assert list(publisher.targets) == ["beam.instagram"]
    assert publisher.targets["beam.instagram"].channel_id == "beam-channel"


def test_lds_conference_uses_its_own_buffer_channel(monkeypatch) -> None:
    monkeypatch.setenv("STREAM_ID", "lds-conference")
    monkeypatch.setenv("BUFFER_ACCESS_TOKEN", "buffer-token")
    monkeypatch.setenv("LDS_CONFERENCE_INSTAGRAM_CHANNEL", "lds-conference-channel")
    monkeypatch.delenv("BEAM_INSTAGRAM_CHANNEL", raising=False)
    monkeypatch.delenv("BUFFER_INSTAGRAM_CHANNEL", raising=False)

    publisher = _publisher(dry_run=False)

    assert isinstance(publisher, BufferPublisher)
    assert list(publisher.targets) == ["lds-conference.instagram"]
    assert publisher.targets["lds-conference.instagram"].channel_id == "lds-conference-channel"


def test_main_reports_startup_failures_to_slack(monkeypatch) -> None:
    sent = []
    monkeypatch.delenv("FIREBASE_PROJECT_ID", raising=False)
    monkeypatch.setenv("STREAM_ID", "beam-learn-thai")
    monkeypatch.setenv("PUBLISH_TARGETS", "beam.instagram")
    monkeypatch.setenv("DRY_RUN", "false")
    monkeypatch.setattr(
        main_module,
        "_send_status",
        lambda **kwargs: sent.append(kwargs),
    )

    with pytest.raises(KeyError):
        main_module.main()

    assert sent[0]["stream"] == "beam-learn-thai"
    assert sent[0]["deck"] == "daily-curated-rotation"
    assert sent[0]["status"] == "error:KeyError"
