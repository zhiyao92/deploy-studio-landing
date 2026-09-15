"""Import whitelisted legacy credentials into Google Secret Manager.

Values are passed to gcloud over stdin and are never logged by this script.
"""

from __future__ import annotations

from pathlib import Path
import subprocess


PROJECT = "social-media-automation-5c9db"
SOURCES = {
    Path("/Users/kelvintan/DaddyCoding/ai/.env"): {
        "ANTHROPIC_API_KEY": "umbrella-anthropic-api-key",
        "BUFFER_ACCESS_TOKEN": "umbrella-buffer-access-token",
        "GITHUB_TOKEN": "umbrella-github-token",
        "GOOGLE_API_KEY": "umbrella-google-api-key",
        "OPENAI_API_KEY": "umbrella-openai-api-key",
        "SLACK_WEBHOOK_URL": "umbrella-slack-webhook-url",
    },
    Path("/Users/kelvintan/AI Project/Quotes Social/.env"): {
        "ANTHROPIC_API_KEY": "lds-anthropic-api-key",
        "BUFFER_API_TOKEN": "lds-buffer-api-token",
        "GITHUB_TOKEN": "lds-github-token",
        "SLACK_BOT_TOKEN": "lds-slack-bot-token",
    },
    Path("/Users/kelvintan/AI Project/Bondify Social/.env"): {
        "ANTHROPIC_API_KEY": "bondify-anthropic-api-key",
        "BUFFER_ACCESS_TOKEN": "bondify-buffer-access-token",
        "CLOUDINARY_CLOUD_NAME": "bondify-cloudinary-cloud-name",
        "CLOUDINARY_UPLOAD_PRESET": "bondify-cloudinary-upload-preset",
        "SLACK_BOT_TOKEN": "bondify-slack-bot-token",
    },
}


def load_env(path: Path) -> dict[str, str]:
    result: dict[str, str] = {}
    for raw in path.read_text().splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.removeprefix("export ").split("=", 1)
        value = value.strip()
        if len(value) >= 2 and value[0] == value[-1] and value[0] in "\"'":
            value = value[1:-1]
        result[key.strip()] = value
    return result


def run(args: list[str], *, value: str | None = None) -> subprocess.CompletedProcess[bytes]:
    return subprocess.run(
        args,
        input=value.encode() if value is not None else None,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.PIPE,
        check=False,
    )


def main() -> None:
    imported: list[str] = []
    for path, mapping in SOURCES.items():
        values = load_env(path)
        for key, secret_name in mapping.items():
            value = values.get(key, "")
            if not value:
                raise SystemExit(f"Missing populated {key} in {path}")
            exists = run(
                ["gcloud", "secrets", "describe", secret_name, "--project", PROJECT]
            ).returncode == 0
            if not exists:
                created = run(
                    [
                        "gcloud", "secrets", "create", secret_name,
                        "--replication-policy=automatic", "--project", PROJECT,
                    ]
                )
                if created.returncode:
                    raise SystemExit(f"Could not create secret {secret_name}")
            added = run(
                [
                    "gcloud", "secrets", "versions", "add", secret_name,
                    "--data-file=-", "--project", PROJECT,
                ],
                value=value,
            )
            if added.returncode:
                raise SystemExit(f"Could not add version for {secret_name}")
            imported.append(secret_name)
    print(f"Imported {len(imported)} secrets: " + ", ".join(imported))


if __name__ == "__main__":
    main()
