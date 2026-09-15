"""Import Buffer channel identifiers into Secret Manager without logging values."""

from pathlib import Path
import subprocess


PROJECT = "social-media-automation-5c9db"
SOURCES = {
    Path("/Users/kelvintan/DaddyCoding/ai/.env"): {
        "BUFFER_MY_INSTAGRAM": "umbrella-buffer-instagram-channel",
        "BUFFER_MY_THREAD": "umbrella-buffer-threads-channel",
        "BUFFER_MY_X": "umbrella-buffer-x-channel",
    },
    Path("/Users/kelvintan/AI Project/Quotes Social/.env"): {
        "BUFFER_INSTAGRAM_CHANNEL_ID": "lds-buffer-instagram-channel",
        "BUFFER_THREADS_CHANNEL_ID": "lds-buffer-threads-channel",
        "BUFFER_FACEBOOK_CHANNEL_ID": "lds-buffer-facebook-channel",
        "SLACK_APPROVAL_CHANNEL": "lds-slack-approval-channel",
    },
    Path("/Users/kelvintan/AI Project/Bondify Social/.env"): {
        "BUFFER_CHANNEL_ID": "bondify-buffer-instagram-channel",
        "SLACK_APPROVAL_CHANNEL": "bondify-slack-approval-channel",
    },
}


def load(path: Path) -> dict[str, str]:
    result = {}
    for raw in path.read_text().splitlines():
        line = raw.strip()
        if line and not line.startswith("#") and "=" in line:
            key, value = line.removeprefix("export ").split("=", 1)
            result[key.strip()] = value.strip().strip("\"").strip("'")
    return result


def call(args: list[str], value: str | None = None) -> int:
    return subprocess.run(
        args, input=value.encode() if value is not None else None,
        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
    ).returncode


def main() -> None:
    imported = []
    for path, mapping in SOURCES.items():
        values = load(path)
        for key, name in mapping.items():
            value = values.get(key, "")
            if not value:
                raise SystemExit(f"Missing populated {key} in {path}")
            if call(["gcloud", "secrets", "describe", name, "--project", PROJECT]):
                if call(["gcloud", "secrets", "create", name, "--replication-policy=automatic", "--project", PROJECT]):
                    raise SystemExit(f"Could not create {name}")
            if call(["gcloud", "secrets", "versions", "add", name, "--data-file=-", "--project", PROJECT], value):
                raise SystemExit(f"Could not add version for {name}")
            imported.append(name)
    print(f"Imported {len(imported)} channel mappings")


if __name__ == "__main__":
    main()
