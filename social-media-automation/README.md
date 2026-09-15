# Social Media Automation

Approved LDS Quotes content direction and pending implementation:
[LDS Quotes strategy](config/lds-quotes-strategy.md).

Central Firebase backend for the Kelvintanzy Umbrella, LDS Quotes, Bondify,
and Beam Learn Thai social publishers, with Buffer as the existing multi-account
publishing gateway.

The existing macOS LaunchAgents and GitHub Actions schedules remain authoritative
until each stream completes its dry-run and live cutover gates. The deployed
cloud worker remains hard-locked to dry-run mode.

## Publishing architecture

- Firebase owns schedules, content state, idempotency, and execution history.
- Buffer retains the existing social account connections and delivery.
- Logical targets such as `kelvintanzy.instagram` map to distinct Buffer channel
  IDs, allowing several accounts on the same platform.
- Buffer credentials are stored in Secret Manager and channel IDs in Firestore;
  neither is committed to this repository.
- Beam Learn Thai media is hosted in the public GitHub repository
  `zhiyao92/beam-learn-thai-images` so Buffer can fetch stable image URLs.

## Firebase project

- Project ID: `social-media-automation-5c9db`
- Initial region: `us-central1`
- Firestore and Storage client access: denied by default
- Local emulators: Firestore `8080`, Storage `9199`, Emulator UI `4000`

## Planned collections

- `streams`: stream configuration and enabled state
- `schedules`: timezone-aware posting schedules
- `drafts`: generated captions and media references
- `runs`: execution status and diagnostics
- `posts`: per-account Buffer delivery results
- `locks`: deterministic idempotency locks

See [MIGRATION.md](MIGRATION.md) for the staged cutover plan.

## Local verification

Create a virtual environment, install `.[test]`, then run:

```sh
npx firebase-tools@15.29.0 emulators:exec --only firestore \
  --project social-media-automation-5c9db '.venv/bin/python -m pytest -q'
```
