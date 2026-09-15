# Bondify research-led publisher

Entrypoint: editorial_publisher.py. Legacy question publisher is retained for rollback, not called by the new image.

Daily 04:40 Asia/Kuala_Lumpur. Monday/Thursday/Saturday five-slide carousels, Tuesday/Friday/Sunday twenty-second animated message reels, Wednesday single. Original graphics, warm ivory/charcoal/plum, no deck/category footer. Reels have four distinct scenes and quiet original synthesized audio, no purchased/generated stock video.

The first daily run of each calendar week obtains one shared seven-post plan. Three Claude calls maximum: live web search (three searches, 2200 output tokens), drafting (6500), independent model evidence review (1800). No SDK retries. Daily runs reuse the approved plan with no model calls. A failed/incomplete week stops and alerts; no automatic regeneration or paid retry. AI review reduces risk but is not a guarantee of factual accuracy. Original dialogue is not scientifically tested wording.

Source URLs must appear in actual search-tool results and belong to approved primary/educational domains. Three HTML sources maximum, allowlisted redirects, 1.5 MB download cap and 14000 retained text characters per source. Source evidence, population/year/limitations, review results and usage are saved under bondifyEditorialWeeks. Recent topics are supplied to avoid repetition. No user/customer data is sent. Secrets stay in Secret Manager.

Cloud resources: single task, 2 CPU/2 GiB, 1200 seconds maximum, zero job retries. Research is capped by calls/searches/output, not a hard dollar guarantee. Search-return input tokens also incur costs. No paid video generation. Daily date-keyed Firestore claim prevents duplicate posts. Sending is recorded before Buffer createPost; uncertain results are never retried blindly. Submitted and sent are separate states.

Dry runs validate source-reviewed content, rendering, real public uploads, exact Instagram channel access and Slack; never call createPost. BONDIFY_FORMAT overrides are dry-run only. Production activation must follow successful single/carousel/reel dry runs.

Media: dedicated bondify-editorial-media-v1 release in existing zhiyao92/lds-quotes-images repository, isolated from LDS release and Git history. Only finished media are uploaded. Max 25 MB/file, 80 assets, 350 MB total. At most 30 eligible owned files removed each run after seven days. Confirmed sent/dry runs and pre-send failures are eligible; uncertain submissions are retained, eventually stopping uploads at the cap. No legacy Cloudinary or Git files are deleted. Local render files are temporary.

Independent BONDIFY_RECONCILE_ONLY job runs at 05:10 Malaysia time and checks delivery and missing/stuck daily runs without generation or reposting. One CPU, 512 MiB, 120-second timeout, no retries. Slack failures are reflected in execution status. Inspection is required for unknown publishing outcomes and blocked research. Never delete a live run claim merely to retry it.

Launch validation used operator-reviewed corrections to the first generated week; rejected attempts remain in Firestore audit records. Future weeks must pass the same automatic content/evidence gates or stop for inspection. Manual research resume is an explicit operator-only function parameter, never configured in the scheduled job. Keep existing approved plans when debugging; no automatic regeneration after uncertain outcomes.
