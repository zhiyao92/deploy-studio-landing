# Beam — approved cloud strategy

Daily at 04:10 Asia/Kuala_Lumpur (03:10 Bangkok), on the existing Beam Instagram
Buffer channel. Four days each week use an interactive five-card carousel; the
other three use a focused single-image lesson. No video or reel formats.

Carousel rhythm: set up one concrete everyday challenge; let readers guess among
three meanings; reveal the answer with romanization; show a related phrase for the
same scene; close with one short usage tip and an invitation to suggest the next
situation. Singles carry one phrase and one contextual takeaway. Captions invite
useful answers, not empty engagement bait. Borrow the teaching pattern, never
another creator's wording, graphics, illustrations, or branding.

Useful everyday Thai, situational examples and respectful cultural context take
priority over app promotion. No audio-led lessons or synthetic spoken pronunciation.
Media and captions use English and simplified ASCII romanization; tones are omitted
and that limitation is clearly displayed. Thai spelling is retained internally
for an independent AI written-language review, not native certification.

Consistent green/cream/gold layout with rounded Beam icon to the left of the name.
All text wraps and must fit; no silent truncation. Captions have three short
paragraphs, blank-line separation and five relevant hashtags.

Claude Haiku generates one lesson; Sonnet 4.6 independently reviews/refines it: at most two model
calls per daily attempt, 3,000 maximum output tokens combined. No web search,
audio, stock-video or video-generation API calls. Rejected content stops and alerts
Slack; no unreviewed fallback. A date claim prevents repeated generation/posting.

Media uses the existing Beam GitHub repository, in an isolated temporary release.
Only confirmed-sent or safely unpublished assets expire after seven days.
Limits: 80 files / 350 MiB total / 25 MiB per file. Unknown delivery is never
automatically retried. Validation cannot publish. Live activation requires both
image formats to pass against the exact deployed image, including Slack notification.

Validation also checks known written-language pitfalls found during testing.
Reference examples: [ThaiPod101: check bill](https://www.thaipod101.com/blog/2021/05/13/english-loanwords-in-thai/)
and [TruePlookpanya: polite endings](https://www.trueplookpanya.com/blogdiary/13888).
These checks supplement AI review; they do not certify every future lesson.
