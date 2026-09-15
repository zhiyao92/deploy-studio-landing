import pytest

from automation.buffer import BufferPublisher, BufferTarget


def test_buffer_routes_logical_account_to_channel() -> None:
    calls = []

    def fake_request(url, payload, headers):
        calls.append((url, payload, headers))
        return {"data": {"createPost": {"__typename": "PostActionSuccess", "post": {"id": "post-1"}}}}

    publisher = BufferPublisher(
        api_token="test-token\n",
        targets={"kelvintanzy.instagram": BufferTarget("channel-1", "instagram")},
        request=fake_request,
    )
    post_id = publisher.publish(
        platform="kelvintanzy.instagram", caption="Hello", media_url="https://example/image.png"
    )

    assert post_id == "post-1"
    assert calls[0][2]["Authorization"] == "Bearer test-token"
    assert calls[0][1]["variables"]["channelId"] == "channel-1"
    assert "shouldShareToFeed: true" in calls[0][1]["query"]


def test_buffer_rejects_unknown_logical_target() -> None:
    publisher = BufferPublisher(api_token="test-token", targets={})
    with pytest.raises(ValueError, match="no Buffer channel"):
        publisher.publish(platform="bondify.instagram", caption="x", media_url="https://example/x")


def test_buffer_builds_carousel_and_x_thread_payloads() -> None:
    calls = []
    def fake_request(url, payload, headers):
        calls.append(payload)
        return {"data": {"createPost": {"__typename": "PostActionSuccess", "post": {"id": "ok"}}}}
    publisher = BufferPublisher(api_token="test", targets={
        "kelvintanzy.instagram": BufferTarget("ig", "instagram"),
        "kelvintanzy.x": BufferTarget("x", "x"),
    }, request=fake_request)
    publisher.publish_carousel(platform="kelvintanzy.instagram", caption="c", media_urls=["u1", "u2"])
    publisher.publish_thread(platform="kelvintanzy.x", tweets=[
        {"text": "head", "image_url": None}, {"text": "slide", "image_url": "u1"}
    ])
    assert calls[0]["variables"]["img1"] == "u2"
    assert "CreateCarousel" in calls[0]["query"]
    assert calls[1]["variables"]["replyImg0"] == "u1"
    assert "twitter" in calls[1]["query"]


def test_buffer_reads_post_delivery_status() -> None:
    calls = []
    def fake_request(url, payload, headers):
        calls.append(payload)
        return {"data": {"post": {"id": "post-1", "status": "sent"}}}
    publisher = BufferPublisher(api_token="test", targets={}, request=fake_request)
    assert publisher.get_status("post-1") == "sent"
    assert calls[0]["variables"] == {"id": "post-1"}
