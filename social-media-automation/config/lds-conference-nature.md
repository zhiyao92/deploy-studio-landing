# LDS Conference nature footage

Use Pexels, sharing the existing Secret Manager credential
`lds-pexels-api-key` with LDS Quotes. Never copy the credential into source files.

Preview entry point: `scripts/conference-format-samples.py --pexels`.
Search for portrait nature video, at least 24 seconds long, across six nature
queries. Download at most 90 MiB with a 120-second budget. Apply the preview's
dark readability layer and timed text; keep creator/source attribution with media.

Conference previews reserve IDs in `conferenceFootagePreview`, separately from
LDS Quotes. Selection skips IDs already recorded in LDS Quotes' live/preview
histories. This is ID-based avoidance, not a guarantee that different videos
never depict similar scenes.

This integrates Pexels into the Conference preview generator. It does not deploy
a Conference reel publisher, enable the stream, or resume its paused scheduler.
The cloud publisher integration remains part of the next implementation phase.
