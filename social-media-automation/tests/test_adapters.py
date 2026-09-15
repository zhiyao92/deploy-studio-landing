from automation.adapters import DryRunPublisher, DryRunStorage, GitHubStorage


def test_dry_run_adapters_only_capture_intent() -> None:
    storage = DryRunStorage()
    media = storage.upload(
        object_name="kelvintanzy/run/image.png",
        content=b"image",
        content_type="image/png",
    )
    publisher = DryRunPublisher()
    result = publisher.publish(platform="instagram", caption="Hello", media_url=media)

    assert media == "gs://dry-run/kelvintanzy/run/image.png"
    assert result == "dry-run:instagram:1"
    assert storage.uploads[0]["size"] == 5
    assert publisher.requests[0]["platform"] == "instagram"


def test_github_storage_returns_raw_content_url(monkeypatch) -> None:
    calls = []

    class Response:
        def __init__(self, status_code, payload=None, text=""):
            self.status_code = status_code
            self.payload = payload or {}
            self.text = text

        def json(self):
            return self.payload

    def fake_get(url, **kwargs):
        calls.append(("get", url))
        if url.endswith("/repos/zhiyao92/kelvintanzy-social-assets"):
            return Response(200)
        return Response(404)

    def fake_put(url, **kwargs):
        calls.append(("put", url, kwargs["json"]["message"]))
        return Response(201, {"content": {"path": "drafts/x/01.png"}})

    monkeypatch.setattr("automation.adapters.requests.get", fake_get)
    monkeypatch.setattr("automation.adapters.requests.put", fake_put)

    storage = GitHubStorage(
        token="token",
        username="zhiyao92",
        repo="kelvintanzy-social-assets",
    )
    url = storage.upload(
        object_name="drafts/kelvintanzy/run-1/01.png",
        content=b"png",
        content_type="image/png",
    )

    assert url == (
        "https://raw.githubusercontent.com/zhiyao92/"
        "kelvintanzy-social-assets/main/drafts/kelvintanzy/run-1/01.png"
    )
    assert calls[2][0] == "put"


def test_github_storage_strips_token_whitespace(monkeypatch) -> None:
    monkeypatch.setattr("automation.adapters.requests.get", lambda *args, **kwargs: type("Response", (), {"status_code": 200})())

    storage = GitHubStorage(
        token="token-with-newline\n",
        username="zhiyao92",
        repo="beam-learn-thai-images",
    )

    assert storage.headers["Authorization"] == "token token-with-newline"
