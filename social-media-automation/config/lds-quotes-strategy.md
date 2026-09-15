# LDS Quotes — approved content strategy

Saved 2026-09-08 following Kelvin's approval. This is the agreed specification; saving it does not deploy changes or enable new production formats.

## Content and formats

- Useful, comforting, Christ-centered devotional content, with occasional soft app promotion.
- Avoid repetitive “good morning”/daily-routine framing. Rotate the reader's situation and emotional entry point: waiting for an answer, recovering after a mistake, feeling unseen, choosing forgiveness, serving quietly, facing uncertainty, or finding peace in a busy day.
- Use a seven-angle rotation (comfort, courage, perspective, belonging, action, reflection, gratitude) and do not repeat the same angle or opening pattern on consecutive days. Make the first line specific enough to feel personally relevant, not generic encouragement.
- Mix single posts, carousels, and genuine nature-video reels. Proposed initial weekly mix: three singles, two carousels, two reels within the existing daily cadence. Scheduling still requires implementation.
- Single: one memorable short reflection, warm paper texture, restrained serif type.
- Carousel: a relatable opening, one clear idea per slide, and a practical closing. Five slides is a useful default.
- Reel: actual moving nature footage, not a still image with a zoom or an abstract motion-graphics substitute. About 20 seconds, short timed text, gentle transitions, permitted quiet audio.
- Original reflections must be clearly identified. Never attribute generated wording to a Church leader. Actual quotations require verified wording and verse/speaker/talk attribution.

## Mandatory branding and readability

- Every single post, every carousel slide, and every frame of the reel carries the original app icon beside “LDS Quotes” at the bottom.
- Canonical icon: cloud_jobs/lds/assets/logo.png. Rounded corners; clear readable name.
- No duplicate LDS Quotes heading at the top.
- Keep reel branding above platform controls and caption overlays, inside safe margins.
- Reel compositing order: moving footage, dark contrast tint and stronger soft gradient behind text, timed text with subtle shadow, persistent dark app badge.
- Check multiple frames, including bright frames, for contrast, clipping and safe placement. Bright snow, sky and sea foam must not make white text unreadable.

## Nature footage selection

- Search Pexels across oceans, waterfalls, rivers, forests, mountains, lakes, rain, snow, clouds, sunrises, sunsets, meadows, deserts and night skies. Match footage to the message.
- Select an unused source video for each new reel. Do not reuse clips from a small rotating library.
- Persist provider and video ID in Firestore, along with source URL, creator, license reference and usage/reservation state. Check uniqueness across categories and reserve atomically so concurrent runs cannot choose the same video.
- Retry the same draft safely without creating a second publication. Successful publication permanently marks footage used.
- Different upload IDs may contain similar footage; add similarity screening where feasible. Do not claim ID checks alone prevent all visual duplicates.
- Limit search attempts, downloads, rendering duration and retries. If no suitable unused clip is available, report the failure rather than silently reusing footage.
- Download only selected footage. Clean up temporary rendering files; retain lightweight usage history. Do not store video binaries in Firestore.
- Keep published media available long enough for Buffer to retrieve and process it; hosting and retention are still to be implemented.
- Preserve creator/source/license records and comply with the provider's API and content license requirements.

## Caption formatting — approved

Plain Instagram text with real blank lines. No Markdown emphasis or headings inside captions. Order: opening, short reflection, one action, attribution/credit, hashtags. Caption should add meaning instead of repeating every slide. Use a short relevant hashtag group at the bottom; the approved examples use five.

### Single example

You haven’t missed your chance to begin again.

Start with one honest prayer and one small step toward Christ.

Send this to someone who could use a fresh start today.

— Original devotional reflection

#LDSQuotes #ComeUntoChrist #FaithInChrist #LatterDaySaints #ChristianEncouragement

### Carousel example

When finding the words to pray feels difficult.

Swipe through five gentle reminders to help you begin. Choose one for today.

Save this for a moment when you need encouragement.

— Original devotional reflections

#LDSQuotes #DailyDevotional #Prayer #ComeUntoChrist #LatterDaySaints

### Nature reel example

You don’t need the perfect words to pray.

Take a breath.
Tell Heavenly Father what’s on your heart.
Start there.

Save this for your next quiet moment.

— Original devotional reflection
Video: Maksym Parovenko / Pexels

#LDSQuotes #Prayer #FaithInChrist #ChristianEncouragement #ComeUntoChrist

Use the actual creator and required source link for each selected video, not the example credit above. For verified quotations, replace the original-reflection attribution with the correct source.

## Saved previews and implementation status

- Branded single/carousel: previews/lds-formats-2026-09-08-branded/
- Preferred real-footage reel: previews/lds-motion-reel/lds-quotes-nature.mp4
- Source/license record: previews/lds-motion-reel/NATURE-SOURCE.md
- Preview generators: scripts/lds-format-previews.py and scripts/lds-motion-reel.py --nature
- Superseded directions: still-image zoom reel, abstract motion-graphics reel, top branding, reusable footage library.
- Cloud implementation completed 2026-09-08: multi-format rendering, Pexels footage search, permanent provider-ID reservations, contrast backing, caption enforcement, GitHub release hosting and bounded cleanup. All three cloud format dry runs passed with Slack confirmation. No live post was created during validation.
- Daily publishing: 04:30 Asia/Kuala_Lumpur; Monday/Thursday carousel, Tuesday/Friday nature reel, Wednesday/Saturday/Sunday single. Instagram uses this mix; Threads/Facebook receive static companion cards.
- Independent delivery check: 05:00 Asia/Kuala_Lumpur. Operational limits and recovery behavior are documented in cloud_jobs/lds/MULTIFORMAT.md. Firestore runtime fields record the activated image and validation runs.
