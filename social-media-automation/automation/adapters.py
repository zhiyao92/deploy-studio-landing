"""Side-effect boundaries used by the worker and its dry-run mode."""

from __future__ import annotations

from dataclasses import dataclass, field
import base64
from urllib.parse import quote
from uuid import uuid4

from google.cloud import storage
import requests


@dataclass
class DryRunPublisher:
    """Capture intended publishes without credentials or network calls."""

    requests: list[dict[str, object]] = field(default_factory=list)

    def publish(self, *, platform: str, caption: str, media_url: str) -> str:
        self.requests.append(
            {"platform": platform, "caption": caption, "mediaUrl": media_url}
        )
        return f"dry-run:{platform}:{len(self.requests)}"

    def publish_carousel(self, *, platform: str, caption: str, media_urls: list[str]) -> str:
        self.requests.append({"platform": platform, "caption": caption, "mediaUrls": media_urls, "kind": "carousel"})
        return f"dry-run:{platform}:{len(self.requests)}"

    def publish_thread(self, *, platform: str, tweets: list[dict[str, str | None]]) -> str:
        self.requests.append({"platform": platform, "tweets": tweets, "kind": "thread"})
        return f"dry-run:{platform}:{len(self.requests)}"


@dataclass
class DryRunStorage:
    """Return a synthetic private object reference without uploading bytes."""

    uploads: list[dict[str, object]] = field(default_factory=list)

    def upload(self, *, object_name: str, content: bytes, content_type: str) -> str:
        self.uploads.append(
            {
                "objectName": object_name,
                "size": len(content),
                "contentType": content_type,
            }
        )
        return f"gs://dry-run/{object_name}"


class FirebaseStorage:
    """Upload media to Firebase Storage with a tokenized HTTPS download URL."""

    def __init__(self, *, bucket_name: str) -> None:
        if not bucket_name:
            raise ValueError("bucket_name must not be empty")
        self.bucket = storage.Client().bucket(bucket_name)

    def upload(self, *, object_name: str, content: bytes, content_type: str) -> str:
        token = str(uuid4())
        blob = self.bucket.blob(object_name)
        blob.metadata = {"firebaseStorageDownloadTokens": token}
        blob.cache_control = "public, max-age=604800"
        blob.upload_from_string(content, content_type=content_type)
        encoded = quote(object_name, safe="")
        return (
            f"https://firebasestorage.googleapis.com/v0/b/{self.bucket.name}/o/"
            f"{encoded}?alt=media&token={token}"
        )


class GitHubStorage:
    """Upload generated media to a public GitHub repository for Buffer fetches."""

    def __init__(self, *, token: str, username: str, repo: str) -> None:
        token = token.strip()
        if not token or not username or not repo:
            raise ValueError("token, username, and repo must not be empty")
        self.token = token
        self.username = username
        self.repo = repo
        self.api_url = "https://api.github.com"
        self.headers = {
            "Authorization": f"token {token}",
            "Accept": "application/vnd.github.v3+json",
        }

    def upload(self, *, object_name: str, content: bytes, content_type: str) -> str:
        self._ensure_repo_exists()
        path = object_name.removeprefix("/")
        url = f"{self.api_url}/repos/{self.username}/{self.repo}/contents/{path}"
        payload = {
            "message": f"Add automation media: {path}",
            "content": base64.b64encode(content).decode("ascii"),
            "branch": "main",
        }
        existing = requests.get(url, headers=self.headers, timeout=30)
        if existing.status_code == 200:
            payload["sha"] = existing.json()["sha"]
        response = requests.put(url, json=payload, headers=self.headers, timeout=60)
        if response.status_code >= 400:
            raise RuntimeError(f"GitHub media upload failed HTTP {response.status_code}: {response.text[:500]}")
        return f"https://raw.githubusercontent.com/{self.username}/{self.repo}/main/{path}"

    def _ensure_repo_exists(self) -> None:
        url = f"{self.api_url}/repos/{self.username}/{self.repo}"
        response = requests.get(url, headers=self.headers, timeout=30)
        if response.status_code == 200:
            return
        if response.status_code != 404:
            raise RuntimeError(f"GitHub repo check failed HTTP {response.status_code}: {response.text[:500]}")
        create = requests.post(
            f"{self.api_url}/user/repos",
            json={
                "name": self.repo,
                "description": "Public media hosting for social automation posts",
                "private": False,
                "auto_init": True,
            },
            headers=self.headers,
            timeout=30,
        )
        if create.status_code >= 400:
            raise RuntimeError(f"GitHub repo creation failed HTTP {create.status_code}: {create.text[:500]}")
