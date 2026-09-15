#!/usr/bin/env python3
"""
github_image_handler.py — Uploads quote graphics to GitHub for public hosting.

Images are stored in a public GitHub repo and served via raw.githubusercontent.com
"""

import base64
import logging
import os
from io import BytesIO

import requests

logger = logging.getLogger("github_image_handler")


class GitHubImageHandler:
    """Manages uploading images to GitHub and getting public URLs."""

    def __init__(
        self,
        github_token: str,
        github_username: str,
        repo_name: str = "lds-quotes-images",
    ):
        """Initialize GitHub image handler.

        Args:
            github_token: GitHub personal access token.
            github_username: GitHub username.
            repo_name: Repository name (will be created if it doesn't exist).
        """
        self.github_token = github_token
        self.github_username = github_username
        self.repo_name = repo_name
        self.api_url = "https://api.github.com"

    def upload_image(self, image_bytes: BytesIO, filename: str) -> str:
        """Upload image to GitHub and return public URL.

        Args:
            image_bytes: Image data as BytesIO.
            filename: Filename (e.g., "quote_20240721.png").

        Returns:
            Public URL to the image via raw.githubusercontent.com.

        Raises:
            RuntimeError: If upload fails.
        """
        # Ensure repo exists
        self._ensure_repo_exists()

        # Encode image as base64
        image_bytes.seek(0)
        image_data = base64.b64encode(image_bytes.read()).decode("utf-8")

        # Upload to GitHub (store directly in root, GitHub API doesn't auto-create dirs)
        file_path = filename
        url = (
            f"{self.api_url}/repos/{self.github_username}/"
            f"{self.repo_name}/contents/{file_path}"
        )

        headers = {
            "Authorization": f"token {self.github_token}",
            "Accept": "application/vnd.github.v3+json",
        }

        # Check if file already exists to get its SHA (needed for update)
        sha = None
        try:
            check_resp = requests.get(url, headers=headers, timeout=30)
            if check_resp.status_code == 200:
                sha = check_resp.json().get("sha")
        except:
            pass  # File doesn't exist, that's fine

        payload = {
            "message": f"Add quote image: {filename}",
            "content": image_data,
            "branch": "main",
        }
        if sha:
            payload["sha"] = sha

        try:
            resp = requests.put(url, json=payload, headers=headers, timeout=30)
            resp.raise_for_status()

            result = resp.json()

            if "content" in result:
                public_url = (
                    f"https://raw.githubusercontent.com/{self.github_username}/"
                    f"{self.repo_name}/main/{file_path}"
                )
                logger.info(f"Uploaded image to GitHub: {public_url}")
                return public_url
            else:
                raise RuntimeError(f"GitHub upload response missing content: {result}")

        except requests.RequestException as e:
            error_detail = ""
            try:
                error_detail = f" — {resp.json()}"
            except:
                pass
            logger.error(f"Failed to upload image to GitHub: {e}{error_detail}")
            raise RuntimeError(f"GitHub upload failed: {e}{error_detail}")

    def _ensure_repo_exists(self) -> None:
        """Ensure the images repository exists, create if needed.

        Raises:
            RuntimeError: If repo check/creation fails.
        """
        url = f"{self.api_url}/repos/{self.github_username}/{self.repo_name}"
        headers = {
            "Authorization": f"token {self.github_token}",
            "Accept": "application/vnd.github.v3+json",
        }

        try:
            resp = requests.get(url, headers=headers, timeout=30)

            if resp.status_code == 200:
                # Repo exists
                return

            if resp.status_code == 404:
                # Repo doesn't exist, create it
                self._create_repo()
                return

            resp.raise_for_status()

        except requests.RequestException as e:
            logger.error(f"Failed to check GitHub repo: {e}")
            raise RuntimeError(f"GitHub repo check failed: {e}")

    def _create_repo(self) -> None:
        """Create the images repository.

        Raises:
            RuntimeError: If creation fails.
        """
        url = f"{self.api_url}/user/repos"
        headers = {
            "Authorization": f"token {self.github_token}",
            "Accept": "application/vnd.github.v3+json",
        }

        payload = {
            "name": self.repo_name,
            "description": "Public image hosting for LDS Quotes Daily Inspiration",
            "private": False,
            "auto_init": True,
        }

        try:
            resp = requests.post(url, json=payload, headers=headers, timeout=30)
            resp.raise_for_status()
            logger.info(f"Created GitHub repo: {self.repo_name}")

        except requests.RequestException as e:
            logger.error(f"Failed to create GitHub repo: {e}")
            raise RuntimeError(f"GitHub repo creation failed: {e}")
