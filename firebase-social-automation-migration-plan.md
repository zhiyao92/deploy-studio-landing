# Firebase Social Automation Migration Plan

Status: Planning

Target Firebase project: `social-media-automation-5c9db`

Cost objective: Keep routine Firebase and Google Cloud infrastructure usage within no-cost quotas. Configure billing budgets and alerts before deploying any scheduled workload. Billing-enabled Blaze services are still pay-as-you-go and cannot be guaranteed to remain free.

## Scope

Consolidate these three systems without changing their public posting behavior:

1. Kelvintanzy Umbrella (`/Users/kelvintan/DaddyCoding/ai`)
   - Currently scheduled by two macOS LaunchAgents.
   - Current live rotation: Kelvintanzy three times weekly, Monday/Wednesday/Friday morning.
   - Publishes to Instagram, Threads, and X through Buffer.
2. LDS Quotes (`/Users/kelvintan/AI Project/Quotes Social`)
   - Currently scheduled daily by GitHub Actions on a self-hosted runner.
   - Publishes to Instagram, Threads, and Facebook through Buffer.
3. Bondify Social (`/Users/kelvintan/AI Project/Bondify Social`)
   - Currently scheduled daily by GitHub Actions on a self-hosted runner.
   - Publishes to the dedicated Bondify Instagram channel through Buffer.

## Proposed architecture

- Cloud Scheduler triggers one dispatcher in `us-central1`.
- Cloud Run Job runs the Python orchestration worker and scales to zero.
- Buffer retains the existing social account connections and performs platform
  delivery during this migration.
- Firestore stores stream configuration, schedules, drafts, runs, post results, and idempotency locks.
- Cloud Storage stores generated media and published artifacts.
- Secret Manager stores Buffer, Anthropic, Google AI, Slack, and GitHub transition credentials.
- Cloud Logging receives structured execution logs.
- Firebase MCP provides read/write administration of the Firebase project from Codex.

Use `us-central1` initially to maximize eligibility for no-cost Cloud Storage usage. Social posting is asynchronous, so regional latency is not important.

## Firestore model

```text
streams/{streamId}
  enabled, name, timezone, postsPerWeek, platforms, generator, configVersion

schedules/{scheduleId}
  streamId, cron, timezone, enabled, nextRunAt

drafts/{draftId}
  streamId, status, captions, mediaPaths, fingerprint, createdAt

runs/{runId}
  streamId, scheduledFor, startedAt, completedAt, status, errors

posts/{postId}
  runId, streamId, platform, bufferPostId, status, publishedAt

locks/{idempotencyKey}
  streamId, scheduledSlot, acquiredAt, expiresAt
```

The idempotency key must be deterministic, such as `{streamId}:{scheduled-date}:{slot}`. Creating the lock and run record must happen in one Firestore transaction before any paid API call or Buffer publish.

## Migration phases

### Phase 0 — Protect the existing system

- Review and commit or deliberately discard the existing uncommitted changes in `DaddyCoding/ai`.
- Resolve contradictory comments versus `enabled: true` in the Kelvintanzy configuration.
- Export a redacted inventory of schedules, platform mappings, model choices, and environment variable names.
- Record current Buffer channel display names and IDs without copying secret values into source control.
- Create billing budgets and alerts at $1, $5, and $10. Add service quotas where supported.
- Do not disable LaunchAgents or GitHub workflows.

Exit condition: the current behavior is reproducible and every existing publisher has an explicit owner and schedule.

### Phase 1 — Connect MCP and initialize Firebase

- Add the official Firebase MCP server to Codex using `firebase-tools@latest mcp`.
- Pin its working directory to the new central automation repository.
- Bind that repository to `social-media-automation-5c9db` with `.firebaserc`.
- Initialize Firestore, Storage, Functions/Cloud Run deployment files, and local emulators.
- Limit MCP tools initially to Firestore, Storage, and Functions.

Exit condition: Codex can read the project configuration and query an empty development collection through MCP.

### Phase 2 — Build the shared cloud worker

- Extract common adapters for Buffer, Slack, text generation, image generation, and media storage.
- Replace local `state.json` and draft manifests with Firestore repositories.
- Replace local draft/image paths and GitHub/Cloudinary image hosting with Cloud Storage objects.
- Emit structured run and per-platform results.
- Add transactional idempotency and retry-safe Buffer channel publishing.
- Package the worker as a Cloud Run Job with zero minimum instances.

Exit condition: emulator tests cover scheduling, locking, retry after partial failure, and duplicate-trigger prevention.

### Phase 3 — Migrate Kelvintanzy first

- Import only the Kelvintanzy stream configuration and its three weekly slots.
- Upload required fonts and static assets to the deployable worker image or Cloud Storage.
- Run cloud dry-runs alongside the existing LaunchAgents for at least seven days.
- Compare generated captions/media and confirm no Buffer mutation occurs in dry-run mode.
- Enable real publishing for one manually triggered post.
- Observe one full scheduled week.
- Disable the two local LaunchAgents only after successful parity.

Exit condition: three scheduled posts complete without duplicates, missing media, or manual Mac dependency.

### Phase 4 — Migrate LDS Quotes

- Import quote selection state and posting history.
- Preserve platform-specific captions for Instagram, Threads, and Facebook.
- Move quote images from GitHub hosting to Cloud Storage.
- Shadow the GitHub workflow in dry-run mode, then perform one controlled live post.
- Disable the GitHub schedule while retaining manual dispatch as temporary rollback.

Exit condition: seven consecutive daily runs succeed from Firebase.

### Phase 5 — Migrate Bondify Social

- Preserve the dedicated Bondify Instagram Buffer channel; do not confuse it with the Kelvintanzy umbrella channels.
- Validate static image, carousel, and reel handling separately.
- Shadow the GitHub workflow, perform a controlled live post, then disable its schedule.

Exit condition: seven consecutive daily runs succeed and all media types used by the rotation are verified.

### Phase 6 — Consolidate operations

- Add a small Firebase-hosted dashboard only if Firestore/MCP inspection is insufficient.
- Remove obsolete GitHub image-hosting steps after retention requirements are met.
- Archive local logs only after Cloud Logging retention is confirmed.
- Keep old schedulers disabled—not deleted—for a 30-day rollback window.
- Review actual billing after 7 and 30 days.

## Cloud compatibility boundary

Static composition and AI-generated media can run in Cloud Run. `xcrun`, Xcode, and iOS Simulator cannot. Any stream with `capture_mode: ios_simulator` needs one of these designs:

1. Preferred: pre-generate approved screenshots and store them in Cloud Storage.
2. Hybrid: retain a Mac capture worker that only uploads screenshots; Firebase performs scheduling, composition, and publishing.
3. CI capture: use a macOS GitHub Actions job to create assets, but never let it publish directly.

No currently enabled Umbrella stream requires iOS Simulator capture.

## Cost controls

- Cloud Run: zero minimum instances, one maximum instance initially, explicit timeout and memory limits.
- Cloud Scheduler: start with no more than two jobs; let the dispatcher derive individual stream schedules.
- Firestore: avoid listeners and collection scans; use keyed run and schedule lookups.
- Storage: lifecycle-delete failed drafts and temporary assets after 30 days; retain published assets according to policy.
- Logging: exclude verbose dependency and HTTP debug logs; retain operational summaries.
- AI: cap retries and record generation fingerprints so retries reuse existing artifacts.
- Budget alerts are notifications, not hard spending caps; service quotas and application limits are the actual safeguards.

## Rollback

- Every migration changes only one publisher at a time.
- Before cloud live publishing, disable the corresponding legacy schedule but preserve manual execution.
- If a cloud run fails, leave its deterministic idempotency record intact until the failure is inspected.
- Re-enable the legacy scheduler only after confirming Buffer did not accept the failed cloud request.
- Never run legacy and cloud publishers live for the same stream and slot.

## Immediate next actions

1. Clean and baseline the uncommitted Umbrella working tree.
2. Create a central repository/directory for `social-media-automation-5c9db`.
3. Configure Firebase MCP against that directory.
4. Create budget alerts and initialize emulators.
5. Implement the Firestore schema and idempotency tests before deploying a worker.
