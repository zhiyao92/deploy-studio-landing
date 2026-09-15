"""Import non-secret legacy Buffer channel mappings into disabled Firestore streams."""

from pathlib import Path

from google.cloud import firestore


PROJECT = "social-media-automation-5c9db"


def load_env(path: Path) -> dict[str, str]:
    values = {}
    for raw in path.read_text().splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.removeprefix("export ").split("=", 1)
        value = value.strip().strip("\"").strip("'")
        values[key.strip()] = value
    return values


def main() -> None:
    umbrella = load_env(Path("/Users/kelvintan/DaddyCoding/ai/.env"))
    lds = load_env(Path("/Users/kelvintan/AI Project/Quotes Social/.env"))
    bondify = load_env(Path("/Users/kelvintan/AI Project/Bondify Social/.env"))
    streams = {
        "kelvintanzy": {
            "name": "Kelvintanzy Umbrella", "enabled": False,
            "timezone": "Asia/Kuala_Lumpur", "configVersion": 1,
            "storyProfiles": {
                "dishspin": {
                    "product": "A food decision app that cuts the noise when you are tired and hungry.",
                    "problem": "The real problem was not food tracking. It was making one small decision easier.",
                    "struggle": "The app got better only after I deleted most of the extra features.",
                    "audience": "both",
                    "tone": "honest and human",
                    "primaryAngle": "problem",
                },
                "deploy-studio": {
                    "product": "A mobile release tool for selecting builds and submitting them to Apple.",
                    "problem": "Shipping from the phone is possible, but the web flow is awkward on mobile.",
                    "struggle": "The hard part was working around incomplete APIs and fragile IAP or build flows.",
                    "audience": "both",
                    "tone": "honest and human",
                    "primaryAngle": "product",
                },
                "bondify": {
                    "product": "A relationship app that keeps bonds warm with questions, memories, and reminders.",
                    "problem": "People need help staying connected, not just a bigger stack of prompts.",
                    "struggle": "The hardest part was writing the questions in the right tone for each category.",
                    "audience": "both",
                    "tone": "honest and human",
                    "primaryAngle": "product",
                },
                "beam": {
                    "product": "A Thai culture app that helps you use the language in real life, respectfully.",
                    "problem": "Language learning alone does not prepare you for real situations.",
                    "struggle": "The challenge was balancing culture, etiquette, food, and useful scenarios.",
                    "audience": "both",
                    "tone": "honest and human",
                    "primaryAngle": "product",
                },
                "malaysia-pocket": {
                    "product": "A pocket guide for rights, police encounters, scams, and complaint channels.",
                    "problem": "People need clear guidance when something goes wrong and time is short.",
                    "struggle": "The hard part was keeping the information accurate as laws and channels change.",
                    "audience": "both",
                    "tone": "honest and human",
                    "primaryAngle": "problem",
                },
                "instantmessage": {
                    "product": "A messaging switchboard with contact cleanup, reminders, and stronger contact management.",
                    "problem": "Messaging across apps gets messy when contacts are scattered and hard to maintain.",
                    "struggle": "The hardest part was the UI and animations, because the app needed to feel polished.",
                    "audience": "both",
                    "tone": "honest and human",
                    "primaryAngle": "product",
                },
                "provision": {
                    "product": "A finance app that puts net worth, income, spending, and commitments in one place.",
                    "problem": "Finance tools get messy when they turn into a pile of calculators.",
                    "struggle": "The hardest part was keeping it simple without losing the features people actually need.",
                    "audience": "both",
                    "tone": "honest and human",
                    "primaryAngle": "product",
                },
            },
            "bufferChannels": {
                "kelvintanzy.instagram": {"provider": "instagram", "channelId": umbrella["BUFFER_MY_INSTAGRAM"]},
                "kelvintanzy.threads": {"provider": "threads", "channelId": umbrella["BUFFER_MY_THREAD"]},
                "kelvintanzy.x": {"provider": "x", "channelId": umbrella["BUFFER_MY_X"]},
            },
        },
        "lds-quotes": {
            "name": "LDS Quotes", "enabled": False,
            "timezone": "UTC", "configVersion": 1,
            "bufferChannels": {
                "lds.instagram": {"provider": "instagram", "channelId": lds["BUFFER_INSTAGRAM_CHANNEL_ID"]},
                "lds.threads": {"provider": "threads", "channelId": lds["BUFFER_THREADS_CHANNEL_ID"]},
                "lds.facebook": {"provider": "facebook", "channelId": lds["BUFFER_FACEBOOK_CHANNEL_ID"]},
            },
        },
        "bondify": {
            "name": "Bondify Social", "enabled": True, "autoPublish": True,
            "timezone": "UTC", "configVersion": 1,
            "contentMix": {
                "conversationStarters": 35,
                "relationshipEducation": 25,
                "relatableSituations": 15,
                "relationshipHabits": 15,
                "productContent": 10,
            },
            "contentPolicy": {
                "mission": "Help people build stronger relationships through small, intentional conversations and habits.",
                "voice": "warm, supportive, practical, and emotionally intelligent",
                "formats": ["conversation starter", "relationship insight", "practical habit", "relatable situation"],
                "avoid": ["diagnosing people", "absolute relationship claims", "fear-based advice", "shame", "engagement bait"],
                "factsRule": "Use careful language and credible sources for relationship research; do not invent statistics.",
            },
            "visualBrand": {
                "appName": "Bondify",
                "iconAsset": "assets/bondify-heart-light.png",
                "headerPlacement": "left of wordmark",
                "formats": ["static", "carousel", "reel"],
            },
            "bufferChannels": {
                "bondify.instagram": {"provider": "instagram", "channelId": bondify["BUFFER_CHANNEL_ID"]},
            },
        },
        "beam-learn-thai": {
            "name": "Beam Learn Thai", "enabled": True, "autoPublish": True,
            "timezone": "Asia/Bangkok", "configVersion": 1,
            "mediaStorage": "github", "mediaRepo": "beam-learn-thai-images",
            "contentPolicy": {
                "audience": "international visitors and Thai learners",
                "mission": "Help foreigners immerse themselves in Thailand by understanding its cultures, language, food, people, local communication, and everyday patterns of life.",
                "contentLens": "Show how to participate respectfully in ordinary local situations, not just memorize tourist phrases.",
                "voice": "warm, practical, curious, humble, and respectful",
                "mustInclude": ["Thai script", "clear pronunciation", "natural English meaning", "real-life context", "cultural explanation"],
                "avoid": ["treating Thailand as a stereotype or backdrop", "mocking accents", "fake cultural claims", "tourist-versus-local superiority", "guaranteed fluency claims", "engagement bait"],
                "verification": "Prefer native usage and identify regional, generational, formal, or situation-specific variations when relevant.",
            },
            "hashtagStrategy": {
                "maxHashtags": 8,
                "mix": ["brand", "Thai learning", "specific situation", "discovery"],
                "rule": "Use only hashtags directly relevant to the post; vary them by topic and never use hashtag stuffing.",
            },
            "bufferChannels": {
                "beam.instagram": {
                    "provider": "instagram",
                    "channelId": "6a9d6548cd8b9c702c18399d",
                },
            },
        },
    }
    client = firestore.Client(project=PROJECT)
    batch = client.batch()
    for stream_id, config in streams.items():
        batch.set(client.collection("streams").document(stream_id), config)
    batch.commit()
    print("Imported 3 disabled and 1 enabled stream configuration, plus 8 Buffer channel mappings")


if __name__ == "__main__":
    main()
