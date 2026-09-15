"""Account-aware adapter for Buffer's GraphQL createPost mutation."""

from __future__ import annotations

from dataclasses import dataclass
import json
from typing import Any, Callable
from urllib.request import Request, urlopen


GraphqlRequest = Callable[[str, dict[str, Any], dict[str, str]], dict[str, Any]]


@dataclass(frozen=True)
class BufferTarget:
    channel_id: str
    provider: str


def _graphql_request(url: str, payload: dict[str, Any], headers: dict[str, str]) -> dict[str, Any]:
    request = Request(url, data=json.dumps(payload).encode(), headers=headers, method="POST")
    with urlopen(request, timeout=30) as response:  # noqa: S310 - fixed HTTPS endpoint
        return json.load(response)


class BufferPublisher:
    METADATA = {
        "instagram": "{instagram: {type: post, shouldShareToFeed: true}}",
        "threads": "{threads: {type: post}}",
        "facebook": "{facebook: {type: post}}",
        "x": "{}",
    }

    def __init__(
        self,
        *,
        api_token: str,
        targets: dict[str, BufferTarget],
        request: GraphqlRequest = _graphql_request,
        api_url: str = "https://api.buffer.com/",
    ) -> None:
        api_token = api_token.strip()
        if not api_token:
            raise ValueError("Buffer api_token must not be empty")
        self.targets = targets
        self.request = request
        self.api_url = api_url
        self.headers = {
            "Authorization": f"Bearer {api_token}",
            "Content-Type": "application/json",
            "x-buffer-client-id": "buffertools-graphql-docs",
            "x-buffer-buffertools": "true",
        }

    def publish(self, *, platform: str, caption: str, media_url: str) -> str:
        target = self.targets.get(platform)
        if target is None:
            raise ValueError(f"no Buffer channel configured for target {platform!r}")
        metadata = self.METADATA.get(target.provider)
        if metadata is None:
            raise ValueError(f"unsupported Buffer provider {target.provider!r}")
        query = f"""
mutation CreatePost($channelId: ChannelId!, $schedulingType: SchedulingType!, $mode: ShareMode!, $text: String!, $imageUrl: String!) {{
  createPost(input: {{
    channelId: $channelId
    schedulingType: $schedulingType
    mode: $mode
    text: $text
    assets: [{{image: {{url: $imageUrl}}}}]
    metadata: {metadata}
  }}) {{
    __typename
    ... on PostActionSuccess {{ post {{ id }} }}
    ... on InvalidInputError {{ message }}
  }}
}}
"""
        return self._send(query, {
            "channelId": target.channel_id,
            "schedulingType": "automatic", "mode": "shareNow",
            "text": caption, "imageUrl": media_url,
        })

    def publish_carousel(self, *, platform: str, caption: str, media_urls: list[str]) -> str:
        target = self.targets.get(platform)
        if target is None:
            raise ValueError(f"no Buffer channel configured for target {platform!r}")
        if target.provider == "x":
            raise ValueError("X decks must use publish_thread")
        if not media_urls:
            raise ValueError("carousel requires at least one image")
        metadata = self.METADATA[target.provider]
        declarations = ", ".join(f"$img{i}: String!" for i in range(len(media_urls)))
        assets = ", ".join(f"{{image: {{url: $img{i}}}}}" for i in range(len(media_urls)))
        query = f"""
mutation CreateCarousel($channelId: ChannelId!, $schedulingType: SchedulingType!, $mode: ShareMode!, $text: String!, {declarations}) {{
  createPost(input: {{channelId: $channelId schedulingType: $schedulingType mode: $mode text: $text assets: [{assets}] metadata: {metadata}}}) {{
    __typename ... on PostActionSuccess {{ post {{ id }} }} ... on InvalidInputError {{ message }}
  }}
}}"""
        variables = {"channelId": target.channel_id, "schedulingType": "automatic", "mode": "shareNow", "text": caption}
        variables.update({f"img{i}": url for i, url in enumerate(media_urls)})
        return self._send(query, variables)

    def publish_thread(self, *, platform: str, tweets: list[dict[str, str | None]]) -> str:
        target = self.targets.get(platform)
        if target is None:
            raise ValueError(f"no Buffer channel configured for target {platform!r}")
        if target.provider != "x" or not tweets:
            raise ValueError("publish_thread requires an X target and at least one tweet")
        head, replies = tweets[0], tweets[1:]
        declarations = ["$channelId: ChannelId!", "$schedulingType: SchedulingType!", "$mode: ShareMode!", "$headText: String!"]
        variables: dict[str, Any] = {"channelId": target.channel_id, "schedulingType": "automatic", "mode": "shareNow", "headText": head["text"]}
        entries = []
        for i, tweet in enumerate(replies):
            declarations.append(f"$replyText{i}: String!")
            variables[f"replyText{i}"] = tweet["text"]
            entry = f"{{text: $replyText{i}"
            if tweet.get("image_url"):
                declarations.append(f"$replyImg{i}: String!")
                variables[f"replyImg{i}"] = tweet["image_url"]
                entry += ", assets: [{image: {url: $replyImg%d}}]" % i
            entries.append(entry + "}")
        query = f"""
mutation CreateThread({', '.join(declarations)}) {{
  createPost(input: {{channelId: $channelId schedulingType: $schedulingType mode: $mode text: $headText metadata: {{twitter: {{thread: [{', '.join(entries)}]}}}}}}) {{
    __typename ... on PostActionSuccess {{ post {{ id }} }} ... on InvalidInputError {{ message }}
  }}
}}"""
        return self._send(query, variables)

    def get_status(self, post_id: str) -> str:
        """Return Buffer's terminal or pending delivery state for one post."""
        if not post_id.strip():
            raise ValueError("post_id must not be empty")
        result = self.request(
            self.api_url,
            {
                "query": "query GetPost($id: PostId!) { post(input: {id: $id}) { id status } }",
                "variables": {"id": post_id.strip()},
            },
            self.headers,
        )
        if result.get("errors"):
            raise RuntimeError(f"Buffer API error: {result['errors'][0].get('message', 'unknown')}")
        status = result.get("data", {}).get("post", {}).get("status")
        if not status:
            raise RuntimeError("Buffer post status was unavailable")
        return str(status)

    def _send(self, query: str, variables: dict[str, Any]) -> str:
        result = self.request(
            self.api_url,
            {"query": query, "variables": variables},
            self.headers,
        )
        if result.get("errors"):
            raise RuntimeError(f"Buffer API error: {result['errors'][0].get('message', 'unknown')}")
        action = result.get("data", {}).get("createPost", {})
        post_id = action.get("post", {}).get("id")
        if action.get("__typename") != "PostActionSuccess" or not post_id:
            raise RuntimeError(f"Buffer createPost failed: {action.get('message', 'unknown')}")
        return str(post_id)
