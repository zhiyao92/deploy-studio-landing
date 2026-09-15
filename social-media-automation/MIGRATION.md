# Migration status

## Phase 1 — Firebase foundation

- [x] Create a central local project directory.
- [x] Bind it to `social-media-automation-5c9db`.
- [x] Add deny-by-default Firestore and Storage rules.
- [x] Add local emulator configuration.
- [x] Enable the Firestore API and create the default database in `us-central1`.
- [x] Provision the default Storage bucket in `us-central1` and deploy deny-all
  Storage rules.
- [x] Configure and locally validate the Firebase MCP server. A fresh Codex
  session is still required for its tools to appear in the active tool list.
- [x] Verify billing protection before deploying compute. The project already
  has an RM25 monthly budget with alerts at 50%, 90%, and 100%.

## Phase 2 — Shared worker foundation

- [x] Add deterministic scheduled-slot idempotency keys.
- [x] Add a transactional Firestore run lease and permanent completion seal.
- [x] Cover duplicate triggers, expired lease recovery, and sealed-run behavior
  with Firestore emulator tests.
- [x] Add per-platform publish attempt records and partial-failure retry tests.
- [x] Add credential-free dry-run adapters for publishing and Cloud Storage media
  handling. These adapters only capture intended operations in memory.
- [x] Add an end-to-end dry-run worker and verify that an expired partial run
  reuses its original run ID and retries only the failed platform.
- [x] Add an account-aware Buffer GraphQL adapter compatible with the existing
  channel IDs and request format.
- [x] Package and deploy the worker as Cloud Run Job
  `social-publisher-dry-run`, with one task, zero retries, 512 MiB, and a hard
  `DRY_RUN=true` runtime gate. The job has not been executed.

Verification: `20 passed` against the Firestore emulator on 2026-09-04.

## Phase 3 — Kelvintanzy

- [x] Package the six reviewed carousel decks and eight referenced screenshots.
- [x] Port the carousel renderer to Linux using a redistributable DejaVu font.
- [x] Render-test every packaged deck without AI calls or simulator capture.
- [x] Add multi-slide Instagram/Threads Buffer mutations and native X-thread
  payload generation to the shared publishing adapter.
- [x] Wire the carousel adapter into the retry-safe Kelvintanzy cloud
  orchestration and publish rendered slide URLs through free public GitHub
  media hosting instead of Firebase Storage.
- [x] Deploy `kelvintanzy-publisher` as a Cloud Run Job with one task, zero
  retries, a 600 second timeout, and no always-on instances.
- [x] Run a full cloud dry-run through the same orchestration used by live mode.
- [x] Schedule Kelvintanzy for Monday/Wednesday/Friday at 06:50 Malaysia time.

First cloud smoke dry-run: execution `social-publisher-dry-run-ctplk` completed
successfully on 2026-09-04, rendered 8 DishSpin slides, simulated the three
Kelvintanzy targets, wrote the run state, and sent an explicit no-post Slack
status. Buffer was not called.

Additional cloud smoke dry-runs on 2026-09-04:

- LDS Quotes `lds-quotes-dry-run-svzmd`: completed, simulated Instagram,
  Threads, and Facebook, and sent status through the Umbrella Slack webhook.
- Bondify `bondify-dry-run-4pkqr`: completed, simulated Instagram, and sent
  status through the Umbrella Slack webhook.
- Direct delivery to each project's approval channel was attempted first, but
  both Slack bots returned `not_in_channel`. Those failed executions published
  nothing. Invite each bot to its channel before switching status delivery from
  the temporary Umbrella webhook.

## Explicit live validation — 2026-09-04

At the user's explicit request, one real run was launched through each proven
legacy publisher (not the incomplete cloud publisher):

- Kelvintanzy: `bondify_family`, seven-slide Instagram/Threads carousel and an
  eight-tweet X thread; workflow exited successfully.
- LDS Quotes: quote `506` by Thomas S. Monson; Buffer accepted Instagram post
  `6a9abb5a3aa9acec7f3e31a5`, Threads post `6a9abb639e905e8210a3d537`, and
  Facebook post `6a9abb6edaf7c7188fd560ca`. Social publishing succeeded; the
  process exit was nonzero only because Slack returned `not_in_channel`.
- Bondify: reel for card `career_043`; Buffer accepted post
  `6a9abb8fdaf7c7188fd56267` with status `sending`. Slack separately returned
  `not_in_channel`.

These live validations did not constitute cloud cutover and must not be repeated
automatically for the same slot. The legacy schedulers were subsequently paused
as recorded below.

## Laptop scheduler pause — 2026-09-04

At the user's explicit request, the following laptop services were stopped and
persistently disabled with launchd:

- `com.daddycoding.ai.autopost.morning`
- `com.daddycoding.ai.autopost.evening`
- `actions.runner.zhiyao92-LDS-Quotes.Kelvins-MacBook-Pro-Max-lds-quotes`
- `actions.runner.zhiyao92-lds-quotes-agent.Kelvins-MacBook-Pro-Max-lds-quotes-agent`
- `actions.runner.zhiyao92-Bondify-card.Kelvins-MacBook-Pro-Max-bondify-card`

The listed GitHub runners and Umbrella agents are unloaded or stopped, and all
five labels report `disabled`. Other laptop runners were left untouched.

## Cloud Scheduler cutover — 2026-09-05

Production-equivalent Cloud Run Jobs were dry-run validated in Cloud Run using
the migrated legacy publisher containers, then switched to live mode without
manual execution:

- `lds-quotes-publisher`: `DRY_RUN=false`, one task, zero retries, 600 second
  timeout, secrets attached from Secret Manager, and status routed through the
  Umbrella Slack webhook fallback.
- `bondify-publisher`: `DRY_RUN=false`, one task, zero retries, 600 second
  timeout, secrets attached from Secret Manager, and status routed through the
  Umbrella Slack webhook fallback.

Cloud Scheduler API was enabled and the scheduler service account
`social-automation-scheduler@social-media-automation-5c9db.iam.gserviceaccount.com`
was created with `roles/run.invoker`.

The following Cloud Scheduler jobs are enabled in `us-central1`:

- `lds-quotes-daily`: `0 17 * * *`, timezone `Asia/Kuala_Lumpur`, invokes
  `lds-quotes-publisher`.
- `bondify-daily`: `0 18 * * *`, timezone `Asia/Kuala_Lumpur`, invokes
  `bondify-publisher`.

LDS incident on 2026-09-05: Cloud Scheduler invoked
`lds-quotes-publisher-6vvrc` at 17:00 Malaysia time. The job generated quote
`174`, uploaded `quote_174.png` to `zhiyao92/lds-quotes-images`, then skipped
Instagram, Threads, and Facebook because the Cloud Run Job was missing the
`BUFFER_INSTAGRAM_CHANNEL_ID`, `BUFFER_THREADS_CHANNEL_ID`, and
`BUFFER_FACEBOOK_CHANNEL_ID` secret environment variables expected by
`cloud_jobs/lds/buffer_handler.py`. The job was patched the same day to attach
those three channel secrets from Secret Manager.

Kelvintanzy/Umbrella cloud orchestration was completed on 2026-09-05. The job
uses packaged deck/app-image assets only and does not call Apple Simulator
tooling, `xcrun`, `simctl`, or runtime screenshot capture.

Cloud dry-run execution `kelvintanzy-publisher-ptqtd` completed successfully
with deck `dishspin`, rendered 8 slides, simulated 8 Storage uploads, and
simulated 3 Buffer publish requests.

Deploy Studio builder journey was added on 2026-09-05 after the user reported
Apple approval. The deck is builder-journey copy only: no simulator screenshots,
no screenshot assets, and no image/shot slide types. It is included in the
Kelvintanzy rotation. Monday 2026-09-07 at 06:50 Malaysia time selects
`deploy-studio`.

Cloud dry-run execution `kelvintanzy-publisher-rjgw2` completed successfully
with deck `deploy-studio`, rendered 8 slides, simulated 8 media uploads, and
simulated 3 Buffer publish requests. The job was restored to `DRY_RUN=false`
after validation; no manual live Kelvintanzy post was sent.

Scheduler job `kelvintanzy-mwf` is enabled in `us-central1` with schedule
`50 6 * * 1,3,5`, timezone `Asia/Kuala_Lumpur`, invoking
`kelvintanzy-publisher`.

Billing guardrails: the project now has exactly three Cloud Scheduler jobs, one
Kelvintanzy Cloud Run Job configured with one task and zero retries, and no
always-on service. Kelvintanzy media is hosted in the public GitHub repository
`zhiyao92/kelvintanzy-social-assets`, so generated carousel images do not
consume Firebase Storage quota. This keeps the scheduler count at the documented
free-tier threshold and the compute usage in short-lived Cloud Run Jobs.

## Required external gates

- Confirm the existing Buffer plan accepts the required number of channels and
  monthly posts. The migration cannot bypass Buffer account limits.
- Invite the LDS and Bondify Slack bots into their intended approval/status
  channels before removing the temporary Umbrella Slack webhook fallback.
- Monitor the first Kelvintanzy scheduled run on Monday 2026-09-07 at 06:50
  Malaysia time.

## Safety gates

- Existing Buffer credentials are stored in Secret Manager for migration and
  rollback and are attached only to the relevant Cloud Run Jobs.
- [x] Import 15 whitelisted legacy credentials into Secret Manager as
  stream-specific secrets without exposing their values.
- [x] Import existing Buffer and Slack channel mappings into Secret Manager. The
  attempted Firestore config import made no writes because local ADC lacked
  production Firestore access.
- Existing local posting LaunchAgents and relevant GitHub runners are disabled.
- Production Firestore and Storage deny all client SDK access.
