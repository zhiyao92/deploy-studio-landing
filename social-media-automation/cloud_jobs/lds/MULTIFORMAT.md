# LDS Quotes production formats

Entry point: multiformat.py. Secrets are environment bindings from Secret Manager. No API key is stored in Firestore.

At 17:00 Asia/Kuala_Lumpur: Monday/Thursday carousel, Tuesday/Friday nature reel, Wednesday/Saturday/Sunday single. Instagram uses this mix. Existing Threads and Facebook destinations receive a static companion card, preserving compatibility.

All generated wording is original devotional reflection, explicitly labelled. One bounded Claude request per run (1400 maximum output tokens, no automatic SDK retries), three plain caption paragraphs, separated attribution and five relevant hashtags. Actual usage is recorded in the run document.

Reels: real 20-second footage, 1080×1920, four timed scenes, original quiet synthesized audio, dark contrast backing, and fixed bottom icon/name. Cards: 1080×1350, warm ivory, readable serif lettering and bottom icon/name. Fonts and canonical icon are bundled in the container.

Pexels: maximum six queries and 30 candidate reservation reads per run. Downloads are capped at 90 MB and 120 seconds. Provider ID reservations in ldsFootage are permanent, including uncertain outcomes. Dry runs use the separate ldsFootagePreview collection. Different uploaded IDs may depict similar scenes; no perceptual uniqueness guarantee is made.

State: ldsPublishingRuns uses the local calendar date as the unique live-run ID. A record is created atomically before generation. Each platform is marked sending before createPost. Accepted post IDs are persisted immediately. Unknown outcomes require inspection, never blind resubmission. Confirmed delivery is distinct from Buffer acceptance; reconciliation checks pending posts without posting again.

Hosting: the existing zhiyao92/lds-quotes-images repository, dedicated lds-automation-media-v1 release. Only rendered media, not stock footage, is uploaded. Public URLs are checked anonymously. Asset cap: 25 MB/file, 80 files and 350 MB total. Cleanup removes at most 30 owned assets per run after seven days, only for sent/dry-run-complete runs or failures with no publishing attempts. Unconfirmed assets remain, and the storage cap stops new uploads if unresolved failures accumulate. Legacy repository files are untouched. Local temporary files are deleted on completion/failure.

DRY_RUN=true exercises generation, rendering, footage selection, Firestore, public hosting, Buffer authentication and Slack; it never calls createPost. LDS_FORMAT overrides are accepted only in dry mode. LDS_RECONCILE_ONLY=true checks prior delivery without generating content.

Cloud bounds: one task, no automatic Cloud Run retries, 900-second timeout. No local schedules are enabled. Publisher activation is gated by contentStrategies/lds-quotes.multiformatEnabled.

Independent delivery check: 17:20 Asia/Kuala_Lumpur, one task, 512 MiB, 120-second timeout and no retries. It checks Buffer delivery and alerts Slack for a missing or stuck daily run, including workers that never start or are terminated before their exception handler runs. It never generates or reposts content.

Testing does not prove a social platform's eventual acceptance: first live deliveries must be confirmed via Buffer status. Logs and Slack must distinguish submitted from sent.
