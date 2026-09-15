#!/usr/bin/env node

/**
 * Bondify — Firebase Seed Script
 *
 * Uploads all modes, decks, and question cards to Firestore.
 *
 * Setup:
 *   1. npm install firebase-admin
 *   2. Download your serviceAccountKey.json from Firebase Console:
 *      Project Settings → Service Accounts → Generate New Private Key
 *   3. Place serviceAccountKey.json in the same folder as this script
 *   4. node upload_to_firebase.js
 */

const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// ───────────────────────────────────────────── 
// MARK:  - Data
// ───────────────────────────────────────────── 

const modes = [
  { id: "spicy", title: "🌶️ Spicy", tagline: "For adults only..." }
];

const decks = [
  // ── SPICY ──
{ id: "spicy_pillow_talk", modeId: "spicy", title: "🫦 Pillow Talk", description: "Intimate questions for behind closed doors", isLocked: false },
  { id: "spicy_first_times", modeId: "spicy", title: "🔞 First Times", description: "Revisiting your early adventures", isLocked: false },
  { id: "spicy_fantasies", modeId: "spicy", title: "💭 Fantasies", description: "What’s on your mind but not in your bed?", isLocked: false },
  { id: "spicy_physical", modeId: "spicy", title: "🖐️ Touchy Feely", description: "Exploring physical preferences and zones", isLocked: false },
  { id: "spicy_roleplay", modeId: "spicy", title: "🎭 Alt-Egos", description: "Stepping out of your comfort zone", isLocked: false },
  { id: "spicy_never_have_i", modeId: "spicy", title: "🖐️ Naughty Never Have I", description: "The adult version of the classic", isLocked: true },
  { id: "spicy_boundaries", modeId: "spicy", title: "🛑 Safe & Sound", description: "Consent and boundaries communication", isLocked: true },
  { id: "spicy_taboo", modeId: "spicy", title: "🚫 Crossing Lines", description: "The most provocative questions allowed", isLocked: true }
];
const cards = [
  //   Category: Attraction & Firsts
  { id: "spicy_001", deckId: "spicy_pillow_talk", question: "What was the very first thing you noticed about me physically?", category: "Attraction", intensity: "mild" },
  { id: "spicy_002", deckId: "spicy_pillow_talk", question: "What is your favorite memory of our first 'real' kiss?", category: "Attraction", intensity: "medium" },
  { id: "spicy_003", deckId: "spicy_pillow_talk", question: "When did you first realize you were attracted to me?", category: "Attraction", intensity: "mild" },
  { id: "spicy_004", deckId: "spicy_pillow_talk", question: "What scent of mine do you find the most intoxicating?", category: "Attraction", intensity: "medium" },
  { id: "spicy_005", deckId: "spicy_pillow_talk", question: "What is a 'non-physical' trait of mine that you find surprisingly sexy?", category: "Attraction", intensity: "medium" },
  { id: "spicy_006", deckId: "spicy_pillow_talk", question: "What’s the most 'electric' moment of tension we’ve ever had?", category: "Attraction", intensity: "high" },
  { id: "spicy_007", deckId: "spicy_pillow_talk", question: "Do you prefer it when I’m dressed up or when I’m wearing almost nothing?", category: "Attraction", intensity: "medium" },
  { id: "spicy_008", deckId: "spicy_pillow_talk", question: "What is your favorite part of my body to kiss?", category: "Attraction", intensity: "high" },
  { id: "spicy_009", deckId: "spicy_pillow_talk", question: "If you had to describe our chemistry in one word, what would it be?", category: "Attraction", intensity: "medium" },
  { id: "spicy_010", deckId: "spicy_pillow_talk", question: "What is the 'hottest' thing I’ve ever said to you?", category: "Attraction", intensity: "high" },

  //   Category: Intimacy & Desire
  { id: "spicy_011", deckId: "spicy_pillow_talk", question: "What is your absolute favorite position, and why?", category: "Intimacy", intensity: "high" },
  { id: "spicy_012", deckId: "spicy_pillow_talk", question: "Do you prefer lights on, lights off, or candlelight?", category: "Intimacy", intensity: "medium" },
  { id: "spicy_013", deckId: "spicy_pillow_talk", question: "What is a fantasy you’ve been too shy to tell me about?", category: "Intimacy", intensity: "high" },
  { id: "spicy_014", deckId: "spicy_pillow_talk", question: "How do you feel about public displays of affection?", category: "Intimacy", intensity: "mild" },
  { id: "spicy_015", deckId: "spicy_pillow_talk", question: "What is the best time of day for us to be intimate?", category: "Intimacy", intensity: "medium" },
  { id: "spicy_016", deckId: "spicy_pillow_talk", question: "What is one thing I do that instantly puts you in the mood?", category: "Intimacy", intensity: "high" },
  { id: "spicy_017", deckId: "spicy_pillow_talk", question: "Do you like it when I take control, or do you prefer to take the lead?", category: "Intimacy", intensity: "high" },
  { id: "spicy_018", deckId: "spicy_pillow_talk", question: "What’s your opinion on roleplay—fun or awkward?", category: "Intimacy", intensity: "medium" },
  { id: "spicy_019", deckId: "spicy_pillow_talk", question: "What is the most 'adventurous' place you’ve ever wanted to do it?", category: "Intimacy", intensity: "high" },
  { id: "spicy_020", deckId: "spicy_pillow_talk", question: "How important is 'dirty talk' to you during sex?", category: "Intimacy", intensity: "high" },

  //   Category: Connection & Romance
  { id: "spicy_021", deckId: "spicy_pillow_talk", question: "What makes you feel the most loved by me?", category: "Romance", intensity: "medium" },
  { id: "spicy_022", deckId: "spicy_pillow_talk", question: "If we could spend a whole weekend in bed, what would we do?", category: "Romance", intensity: "medium" },
  { id: "spicy_023", deckId: "spicy_pillow_talk", question: "What is your favorite way to be touched that isn't sexual?", category: "Romance", intensity: "mild" },
  { id: "spicy_024", deckId: "spicy_pillow_talk", question: "What is a song that always makes you think of our relationship?", category: "Romance", intensity: "mild" },
  { id: "spicy_025", deckId: "spicy_pillow_talk", question: "What’s the most romantic thing I’ve ever done for you?", category: "Romance", intensity: "mild" },
  { id: "spicy_026", deckId: "spicy_pillow_talk", question: "Do you remember the moment you knew you loved me?", category: "Romance", intensity: "medium" },
  { id: "spicy_027", deckId: "spicy_pillow_talk", question: "What is one thing about our relationship that you never want to change?", category: "Romance", intensity: "medium" },
  { id: "spicy_028", deckId: "spicy_pillow_talk", question: "If we were at a party, what's a 'secret signal' we could use for 'let's go home'?", category: "Romance", intensity: "mild" },
  { id: "spicy_029", deckId: "spicy_pillow_talk", question: "What is your 'love language'—and do you think I’m good at speaking it?", category: "Romance", intensity: "medium" },
  { id: "spicy_030", deckId: "spicy_pillow_talk", question: "How has our intimacy evolved since we first met?", category: "Romance", intensity: "medium" },

  //   Category: Exploration & Boundaries
  { id: "spicy_031", deckId: "spicy_pillow_talk", question: "Is there a toy or accessory you’ve been curious to try with me?", category: "Exploration", intensity: "high" },
  { id: "spicy_032", deckId: "spicy_pillow_talk", question: "What is a 'hard limit' for you that we should never cross?", category: "Exploration", intensity: "high" },
  { id: "spicy_033", deckId: "spicy_pillow_talk", question: "What is your favorite romantic movie scene—and can we recreate it?", category: "Exploration", intensity: "medium" },
  { id: "spicy_034", deckId: "spicy_pillow_talk", question: "How do you feel about morning sex versus late-night sex?", category: "Exploration", intensity: "medium" },
  { id: "spicy_035", deckId: "spicy_pillow_talk", question: "What is your favorite 'aftercare'—what do you need most after intimacy?", category: "Exploration", intensity: "medium" },
  { id: "spicy_036", deckId: "spicy_pillow_talk", question: "What is the most 'scandalous' thing you’ve ever done in public?", category: "Exploration", intensity: "high" },
  { id: "spicy_037", deckId: "spicy_pillow_talk", question: "If we could go on a 'spicy' getaway, where would we go?", category: "Exploration", intensity: "medium" },
  { id: "spicy_038", deckId: "spicy_pillow_talk", question: "What is your opinion on sending 'risqué' photos to each other?", category: "Exploration", intensity: "high" },
  { id: "spicy_039", deckId: "spicy_pillow_talk", question: "What is a 'mood' or 'vibe' you want to explore more in the bedroom?", category: "Exploration", intensity: "high" },
  { id: "spicy_040", deckId: "spicy_pillow_talk", question: "Do you ever have 'spicy' dreams about me? Tell me one.", category: "Exploration", intensity: "high" },

  //   Category: Preferences & Play
  { id: "spicy_041", deckId: "spicy_pillow_talk", question: "Lingerie, oversized t-shirt, or nothing at all in bed?", category: "Play", intensity: "medium" },
  { id: "spicy_042", deckId: "spicy_pillow_talk", question: "What is your favorite way to be woken up?", category: "Play", intensity: "medium" },
  { id: "spicy_043", deckId: "spicy_pillow_talk", question: "Do you like it when I tease you, or do you want me to get straight to it?", category: "Play", intensity: "high" },
  { id: "spicy_044", deckId: "spicy_pillow_talk", question: "What is the 'hottest' outfit I own, in your opinion?", category: "Play", intensity: "mild" },
  { id: "spicy_045", deckId: "spicy_pillow_talk", question: "How would you describe my kissing style?", category: "Play", intensity: "medium" },
  { id: "spicy_046", deckId: "spicy_pillow_talk", question: "If we were in a movie, would our story be a romance, a drama, or an erotic thriller?", category: "Play", intensity: "medium" },
  { id: "spicy_047", deckId: "spicy_pillow_talk", question: "What is the longest we’ve ever 'gone' for, and was it your favorite time?", category: "Play", intensity: "high" },
  { id: "spicy_048", deckId: "spicy_pillow_talk", question: "What’s one thing you want me to do to you more often?", category: "Play", intensity: "high" },
  { id: "spicy_049", deckId: "spicy_pillow_talk", question: "Do you like 'shower sex,' or is it more trouble than it's worth?", category: "Play", intensity: "medium" },
  { id: "spicy_050", deckId: "spicy_pillow_talk", question: "What is a secret 'spot' on your body that is surprisingly sensitive?", category: "Play", intensity: "high" },

  //   Category: Deep spicy
  { id: "spicy_051", deckId: "spicy_pillow_talk", question: "What is the most 'vulnerable' you’ve ever felt with me?", category: "Deep Spicy", intensity: "high" },
  { id: "spicy_052", deckId: "spicy_pillow_talk", question: "Does the thought of someone else being attracted to me make you jealous or turn you on?", category: "Deep Spicy", intensity: "high" },
  { id: "spicy_053", deckId: "spicy_pillow_talk", question: "What is the one thing you’re most proud of in our sex life?", category: "Deep Spicy", intensity: "medium" },
  { id: "spicy_054", deckId: "spicy_pillow_talk", question: "If we could redo our first time together, would you change anything?", category: "Deep Spicy", intensity: "medium" },
  { id: "spicy_055", deckId: "spicy_pillow_talk", question: "What is the most 'passionate' night we’ve ever had?", category: "Deep Spicy", intensity: "high" },
  { id: "spicy_056", deckId: "spicy_pillow_talk", question: "How do you feel when we make eye contact during sex?", category: "Deep Spicy", intensity: "high" },
  { id: "spicy_057", deckId: "spicy_pillow_talk", question: "What’s a 'risk' you’d be willing to take with me, just for the thrill?", category: "Deep Spicy", intensity: "high" },
  { id: "spicy_058", deckId: "spicy_pillow_talk", question: "What is the one thing that makes our physical connection unique compared to anyone else?", category: "Deep Spicy", intensity: "high" },
  { id: "spicy_059", deckId: "spicy_pillow_talk", question: "What is your favorite 'mood'—slow and romantic or fast and intense?", category: "Deep Spicy", intensity: "high" },
  { id: "spicy_060", deckId: "spicy_pillow_talk", question: "What is the one thing you want us to try tonight?", category: "Deep Spicy", intensity: "high" },

  //   Category: Risk & Public
  { id: "never_001", deckId: "spicy_naughty_never", question: "Never have I ever been caught in the act by a stranger.", category: "Risk", intensity: "high" },
  { id: "never_002", deckId: "spicy_naughty_never", question: "Never have I ever done it in a public bathroom.", category: "Risk", intensity: "medium" },
  { id: "never_003", deckId: "spicy_naughty_never", question: "Never have I ever skinny dipped in a pool that wasn't mine.", category: "Risk", intensity: "medium" },
  { id: "never_004", deckId: "spicy_naughty_never", question: "Never have I ever been 'intimate' in a movie theater.", category: "Risk", intensity: "medium" },
  { id: "never_005", deckId: "spicy_naughty_never", question: "Never have I ever done it at my place of work.", category: "Risk", intensity: "high" },
  { id: "never_006", deckId: "spicy_naughty_never", question: "Never have I ever had a 'quickie' while family was in the next room.", category: "Risk", intensity: "medium" },
  { id: "never_007", deckId: "spicy_naughty_never", question: "Never have I ever done it in the back of an Uber or taxi.", category: "Risk", intensity: "high" },
  { id: "never_008", deckId: "spicy_naughty_never", question: "Never have I ever been 'active' on a beach.", category: "Risk", intensity: "medium" },
  { id: "never_009", deckId: "spicy_naughty_never", question: "Never have I ever joined the 'Mile High Club'.", category: "Risk", intensity: "high" },
  { id: "never_010", deckId: "spicy_naughty_never", question: "Never have I ever used a 'finsta' to follow someone I used to sleep with.", category: "Risk", intensity: "medium" },

  //   Category: Digital & Tech
  { id: "never_011", deckId: "spicy_naughty_never", question: "Never have I ever sent a spicy photo to the wrong person.", category: "Digital", intensity: "high" },
  { id: "never_012", deckId: "spicy_naughty_never", question: "Never have I ever filmed myself being intimate.", category: "Digital", intensity: "high" },
  { id: "never_013", deckId: "spicy_naughty_never", question: "Never have I ever sexted someone while I was at a boring event.", category: "Digital", intensity: "medium" },
  { id: "never_014", deckId: "spicy_naughty_never", question: "Never have I ever accidentally liked a 'thirst trap' photo from 2 years ago.", category: "Digital", intensity: "mild" },
  { id: "never_015", deckId: "spicy_naughty_never", question: "Never have I ever had a 'cyber-sex' session with a stranger.", category: "Digital", intensity: "medium" },
  { id: "never_016", deckId: "spicy_naughty_never", question: "Never have I ever looked at my partner's phone for spicy messages.", category: "Digital", intensity: "deep" },
  { id: "never_017", deckId: "spicy_naughty_never", question: "Never have I ever had a crush on a person I met on a dating app but never met IRL.", category: "Digital", intensity: "mild" },
  { id: "never_018", deckId: "spicy_naughty_never", question: "Never have I ever sent a 'risky' text and then immediately regretted it.", category: "Digital", intensity: "medium" },
  { id: "never_019", deckId: "spicy_naughty_never", question: "Never have I ever Googled 'how to...' regarding a bedroom move.", category: "Digital", intensity: "medium" },
  { id: "never_020", deckId: "spicy_naughty_never", question: "Never have I ever had a spicy dream about a celebrity.", category: "Digital", intensity: "mild" },

  //   Category: The Bedroom
  { id: "never_021", deckId: "spicy_naughty_never", question: "Never have I ever used food in the bedroom.", category: "Bedroom", intensity: "medium" },
  { id: "never_022", deckId: "spicy_naughty_never", question: "Never have I ever used toys during a solo session.", category: "Bedroom", intensity: "medium" },
  { id: "never_023", deckId: "spicy_naughty_never", question: "Never have I ever pretended to be someone else (roleplay).", category: "Bedroom", intensity: "medium" },
  { id: "never_024", deckId: "spicy_naughty_never", question: "Never have I ever faked it.", category: "Bedroom", intensity: "high" },
  { id: "never_025", deckId: "spicy_naughty_never", question: "Never have I ever used handcuffs or restraints.", category: "Bedroom", intensity: "high" },
  { id: "never_026", deckId: "spicy_naughty_never", question: "Never have I ever had a one-night stand.", category: "Bedroom", intensity: "medium" },
  { id: "never_027", deckId: "spicy_naughty_never", question: "Never have I ever called out the wrong name.", category: "Bedroom", intensity: "high" },
  { id: "never_028", deckId: "spicy_naughty_never", question: "Never have I ever tried a position I saw in a movie.", category: "Bedroom", intensity: "mild" },
  { id: "never_029", deckId: "spicy_naughty_never", question: "Never have I ever been with more than one person in 24 hours.", category: "Bedroom", intensity: "high" },
  { id: "never_030", deckId: "spicy_naughty_never", question: "Never have I ever fallen asleep during the act.", category: "Bedroom", intensity: "medium" },

  //   Category: Dating & Taboo
  { id: "never_031", deckId: "spicy_naughty_never", question: "Never have I ever had a crush on a friend's partner.", category: "Taboo", intensity: "high" },
  { id: "never_032", deckId: "spicy_naughty_never", question: "Never have I ever dated someone significantly older or younger than me.", category: "Dating", intensity: "medium" },
  { id: "never_033", deckId: "spicy_naughty_never", question: "Never have I ever lied about my 'number'.", category: "Dating", intensity: "medium" },
  { id: "never_034", deckId: "spicy_naughty_never", question: "Never have I ever slept with a co-worker.", category: "Dating", intensity: "high" },
  { id: "never_035", deckId: "spicy_naughty_never", question: "Never have I ever had a 'friends with benefits' situation.", category: "Dating", intensity: "mild" },
  { id: "never_036", deckId: "spicy_naughty_never", question: "Never have I ever 'hooked up' with an ex after we broke up.", category: "Dating", intensity: "medium" },
  { id: "never_037", deckId: "spicy_naughty_never", question: "Never have I ever ghosted someone after the first time we slept together.", category: "Dating", intensity: "high" },
  { id: "never_038", deckId: "spicy_naughty_never", question: "Never have I ever had a crush on a teacher or boss.", category: "Taboo", intensity: "medium" },
  { id: "never_039", deckId: "spicy_naughty_never", question: "Never have I ever walked in on my parents doing it.", category: "Taboo", intensity: "medium" },
  { id: "never_040", deckId: "spicy_naughty_never", question: "Never have I ever been with someone whose name I didn't know.", category: "Dating", intensity: "high" },

  //   Category: Experiences
  { id: "never_041", deckId: "spicy_naughty_never", question: "Never have I ever had a dream about someone in this room.", category: "Experiences", intensity: "high" },
  { id: "never_042", deckId: "spicy_naughty_never", question: "Never have I ever been to a strip club.", category: "Experiences", intensity: "mild" },
  { id: "never_043", deckId: "spicy_naughty_never", question: "Never have I ever tried 'spanking'.", category: "Experiences", intensity: "medium" },
  { id: "never_044", deckId: "spicy_naughty_never", question: "Never have I ever had a three-way.", category: "Experiences", intensity: "high" },
  { id: "never_045", deckId: "spicy_naughty_never", question: "Never have I ever kissed someone of the same gender.", category: "Experiences", intensity: "medium" },
  { id: "never_046", deckId: "spicy_naughty_never", question: "Never have I ever worn lingerie just for myself.", category: "Experiences", intensity: "mild" },
  { id: "never_047", deckId: "spicy_naughty_never", question: "Never have I ever sent a nude.", category: "Experiences", intensity: "medium" },
  { id: "never_048", deckId: "spicy_naughty_never", question: "Never have I ever had a 'booty call' past midnight.", category: "Experiences", intensity: "medium" },
  { id: "never_049", deckId: "spicy_naughty_never", question: "Never have I ever done it in a shower.", category: "Experiences", intensity: "mild" },
  { id: "never_050", deckId: "spicy_naughty_never", question: "Never have I ever used a 'blindfold'.", category: "Experiences", intensity: "medium" },

  //   Category: Final Reveal
  { id: "never_051", deckId: "spicy_naughty_never", question: "Never have I ever told a partner a fantasy and had them be totally weirded out.", category: "Final", intensity: "medium" },
  { id: "never_052", deckId: "spicy_naughty_never", question: "Never have I ever dated two people at the same time.", category: "Final", intensity: "high" },
  { id: "never_053", deckId: "spicy_naughty_never", question: "Never have I ever been the 'other' person in a relationship.", category: "Final", intensity: "high" },
  { id: "never_054", deckId: "spicy_naughty_never", question: "Never have I ever had a crush on my best friend's sibling.", category: "Final", intensity: "medium" },
  { id: "never_055", deckId: "spicy_naughty_never", question: "Never have I ever used an 'alias' when meeting someone for a hookup.", category: "Final", intensity: "medium" },
  { id: "never_056", deckId: "spicy_naughty_never", question: "Never have I ever done it in a car.", category: "Final", intensity: "mild" },
  { id: "never_057", deckId: "spicy_naughty_never", question: "Never have I ever had a crush on someone here and not said anything.", category: "Final", intensity: "high" },
  { id: "never_058", deckId: "spicy_naughty_never", question: "Never have I ever accidentally seen a friend naked.", category: "Final", intensity: "medium" },
  { id: "never_059", deckId: "spicy_naughty_never", question: "Never have I ever lied during this game.", category: "Final", intensity: "high" },
  { id: "never_060", deckId: "spicy_naughty_never", question: "Never have I ever wanted to do it with the person to my left.", category: "Final", intensity: "high" },

  //   Category: Early Discoveries
  { id: "first_001", deckId: "spicy_first_times", question: "Who was your very first 'real' crush, and what did you think was sexy about them?", category: "Beginnings", intensity: "mild" },
  { id: "first_002", deckId: "spicy_first_times", question: "Do you remember the first time you felt a physical 'spark' with someone?", category: "Beginnings", intensity: "mild" },
  { id: "first_003", deckId: "spicy_first_times", question: "What was the first 'adult' movie or book you ever encountered?", category: "Beginnings", intensity: "medium" },
  { id: "first_004", deckId: "spicy_first_times", question: "Tell the story of your first kiss. Was it magical or a total disaster?", category: "Beginnings", intensity: "medium" },
  { id: "first_005", deckId: "spicy_first_times", question: "What was your first impression of 'the talk' your parents gave you?", category: "Beginnings", intensity: "mild" },
  { id: "first_006", deckId: "spicy_first_times", question: "When was the first time you realized you were 'good' at something in bed?", category: "Beginnings", intensity: "high" },
  { id: "first_007", deckId: "spicy_first_times", question: "What was the first 'risky' place you ever hooked up?", category: "Beginnings", intensity: "medium" },
  { id: "first_008", deckId: "spicy_first_times", question: "Who was the first person you ever had a spicy dream about?", category: "Beginnings", intensity: "medium" },
  { id: "first_009", deckId: "spicy_first_times", question: "Do you remember the first time you were caught doing something 'naughty'?", category: "Beginnings", intensity: "medium" },
  { id: "first_010", deckId: "spicy_first_times", question: "What was the first outfit you wore specifically to feel attractive?", category: "Beginnings", intensity: "mild" },

  //   Category: The 'First Time'
  { id: "first_011", deckId: "spicy_first_times", question: "On a scale of 1-10, how awkward was your literal 'first time'?", category: "The Big First", intensity: "medium" },
  { id: "first_012", deckId: "spicy_first_times", question: "Where did your first full sexual experience happen?", category: "The Big First", intensity: "medium" },
  { id: "first_013", deckId: "spicy_first_times", question: "What is one thing you wish you could tell your younger self before that first experience?", category: "The Big First", intensity: "medium" },
  { id: "first_014", deckId: "spicy_first_times", question: "Did you have a specific song or movie playing during your first time?", category: "The Big First", intensity: "mild" },
  { id: "first_015", deckId: "spicy_first_times", question: "What was the biggest misconception you had about sex before you actually did it?", category: "The Big First", intensity: "medium" },
  { id: "first_016", deckId: "spicy_first_times", question: "Who was the first person you told after you 'lost it'?", category: "The Big First", intensity: "mild" },
  { id: "first_017", deckId: "spicy_first_times", question: "What is one detail about that first partner you’ll never forget?", category: "The Big First", intensity: "medium" },
  { id: "first_018", deckId: "spicy_first_times", question: "Was your first time planned out or totally spontaneous?", category: "The Big First", intensity: "medium" },
  { id: "first_019", deckId: "spicy_first_times", question: "How long did your first actual 'session' last?", category: "The Big First", intensity: "medium" },
  { id: "first_020", deckId: "spicy_first_times", question: "What was the most embarrassing thing that happened during your first few months of being active?", category: "The Big First", intensity: "high" },

  //   Category: Milestone Firsts
  { id: "first_021", deckId: "spicy_first_times", question: "When was the first time you tried a toy? What was the verdict?", category: "Milestones", intensity: "high" },
  { id: "first_022", deckId: "spicy_first_times", question: "When was the first time you ever stayed up all night just for intimacy?", category: "Milestones", intensity: "medium" },
  { id: "first_023", deckId: "spicy_first_times", question: "Tell the story of the first time you ever sent a 'spicy' text.", category: "Milestones", intensity: "medium" },
  { id: "first_024", deckId: "spicy_first_times", question: "When was the first time you felt comfortable enough to say exactly what you wanted in bed?", category: "Milestones", intensity: "high" },
  { id: "first_025", deckId: "spicy_first_times", question: "What was the first 'taboo' thing you ever tried?", category: "Milestones", intensity: "high" },
  { id: "first_026", deckId: "spicy_first_times", question: "The first time you were ever with someone significantly older than you—how was it?", category: "Milestones", intensity: "high" },
  { id: "first_027", deckId: "spicy_first_times", question: "Do you remember the first time you were 'ghosted' after a great night?", category: "Milestones", intensity: "medium" },
  { id: "first_028", deckId: "spicy_first_times", question: "What was the first time you realized physical connection and emotional love are different?", category: "Milestones", intensity: "deep" },
  { id: "first_029", deckId: "spicy_first_times", question: "When was the first time you tried a position that felt 'advanced'?", category: "Milestones", intensity: "medium" },
  { id: "first_030", deckId: "spicy_first_times", question: "What was the first time you felt like a 'pro' in the bedroom?", category: "Milestones", intensity: "high" },

  //   Category: Awkward & Funny
  { id: "first_031", deckId: "spicy_first_times", question: "What was the first time you ever 'faked it' and why?", category: "Awkward", intensity: "high" },
  { id: "first_032", deckId: "spicy_first_times", question: "Have you ever called someone by the wrong name the first time you were together?", category: "Awkward", intensity: "high" },
  { id: "first_033", deckId: "spicy_first_times", question: "What was the first time you had a 'wardrobe malfunction' during a hookup?", category: "Awkward", intensity: "medium" },
  { id: "first_034", deckId: "spicy_first_times", question: "The first time you walked in on someone (or were walked in on)—what happened?", category: "Awkward", intensity: "high" },
  { id: "first_035", deckId: "spicy_first_times", question: "What was the first 'injury' you ever sustained during sex?", category: "Awkward", intensity: "medium" },
  { id: "first_036", deckId: "spicy_first_times", question: "Do you remember the first time a 'bedroom experiment' failed hilariously?", category: "Awkward", intensity: "medium" },
  { id: "first_037", deckId: "spicy_first_times", question: "What was the most awkward conversation you had to have with a first-time partner?", category: "Awkward", intensity: "medium" },
  { id: "first_038", deckId: "spicy_first_times", question: "When was the first time you realized you had a very specific 'type'?", category: "Awkward", intensity: "mild" },
  { id: "first_039", deckId: "spicy_first_times", question: "What was the first time you slept with someone you definitely shouldn't have?", category: "Awkward", intensity: "high" },
  { id: "first_040", deckId: "spicy_first_times", question: "What was your first 'one night stand' experience like?", category: "Awkward", intensity: "medium" },

  //   Category: Lessons & Growth
  { id: "first_041", deckId: "spicy_first_times", question: "What did your first real relationship teach you about intimacy?", category: "Growth", intensity: "deep" },
  { id: "first_042", deckId: "spicy_first_times", question: "When was the first time you realized your 'libido' was higher or lower than your partner's?", category: "Growth", intensity: "medium" },
  { id: "first_043", deckId: "spicy_first_times", question: "What was the first boundary you ever had to set with a partner?", category: "Growth", intensity: "deep" },
  { id: "first_044", deckId: "spicy_first_times", question: "When did you first realize that communication is more important than technique?", category: "Growth", intensity: "deep" },
  { id: "first_045", deckId: "spicy_first_times", question: "What was the first 'self-help' or 'how-to' info you looked up regarding sex?", category: "Growth", intensity: "medium" },
  { id: "first_046", deckId: "spicy_first_times", question: "How did your first 'breakup' affect your confidence in the bedroom?", category: "Growth", intensity: "medium" },
  { id: "first_047", deckId: "spicy_first_times", question: "When was the first time you felt truly secure in your own body around someone else?", category: "Growth", intensity: "deep" },
  { id: "first_048", deckId: "spicy_first_times", question: "What was the first 'wow' moment you had where you realized how good sex could actually be?", category: "Growth", intensity: "high" },
  { id: "first_049", deckId: "spicy_first_times", question: "When was the first time you chose yourself over a bad sexual experience?", category: "Growth", intensity: "deep" },
  { id: "first_050", deckId: "spicy_first_times", question: "Who was the first person you felt 100% safe with?", category: "Growth", intensity: "deep" },

  //   Category: Sensory & Specifics
  { id: "first_051", deckId: "spicy_first_times", question: "What was the first scent a partner wore that really turned you on?", category: "Sensory", intensity: "mild" },
  { id: "first_052", deckId: "spicy_first_times", question: "Do you remember the first time you were ever 'teased' for a long time?", category: "Sensory", intensity: "medium" },
  { id: "first_053", deckId: "spicy_first_times", question: "What was the first time you ever had 'morning-after' regrets?", category: "Sensory", intensity: "medium" },
  { id: "first_054", deckId: "spicy_first_times", question: "The first time you ever saw your current partner naked—what was your immediate thought?", category: "Sensory", intensity: "high" },
  { id: "first_055", deckId: "spicy_first_times", question: "What was the first 'spicy' item you ever bought for yourself?", category: "Sensory", intensity: "medium" },
  { id: "first_056", deckId: "spicy_first_times", question: "Do you remember the first time you ever had a 'quickie'?", category: "Sensory", intensity: "mild" },
  { id: "first_057", deckId: "spicy_first_times", question: "What was the first time you felt like an actual 'adult' in your dating life?", category: "Sensory", intensity: "medium" },
  { id: "first_058", deckId: "spicy_first_times", question: "When was the first time you realized you were into something 'weird'?", category: "Sensory", intensity: "high" },
  { id: "first_059", deckId: "spicy_first_times", question: "What was the first time you ever felt 'addicted' to a specific person?", category: "Sensory", intensity: "deep" },
  { id: "first_060", deckId: "spicy_first_times", question: "If you could redo your 'first time' with all the knowledge you have now, would you?", category: "Sensory", intensity: "deep" },

  //   Category: Locations & Settings
  { id: "fant_001", deckId: "spicy_fantasies", question: "If you could be intimate in any world-famous landmark, which would it be?", category: "Locations", intensity: "medium" },
  { id: "fant_002", deckId: "spicy_fantasies", question: "How do you feel about the idea of being 'caught' in a semi-public place?", category: "Locations", intensity: "high" },
  { id: "fant_003", deckId: "spicy_fantasies", question: "What is your ultimate 'outdoor' fantasy location?", category: "Locations", intensity: "medium" },
  { id: "fant_004", deckId: "spicy_fantasies", question: "If we were in a luxury hotel with floor-to-ceiling windows, would you leave the curtains open?", category: "Locations", intensity: "high" },
  { id: "fant_005", deckId: "spicy_fantasies", question: "Would you ever want to do it in a movie theater or a dark club?", category: "Locations", intensity: "high" },
  { id: "fant_006", deckId: "spicy_fantasies", question: "Private jet or luxury train: which 'travel' fantasy is more appealing?", category: "Locations", intensity: "mild" },
  { id: "fant_007", deckId: "spicy_fantasies", question: "Do you have a fantasy about doing it in a workplace (mine or yours)?", category: "Locations", intensity: "medium" },
  { id: "fant_008", deckId: "spicy_fantasies", question: "Is 'Mile High Club' actually on your list, or does it sound too cramped?", category: "Locations", intensity: "medium" },
  { id: "fant_009", deckId: "spicy_fantasies", question: "If we could rent a cabin in the middle of nowhere for a week of no clothes, would you do it?", category: "Locations", intensity: "medium" },
  { id: "fant_010", deckId: "spicy_fantasies", question: "What’s a location you’ve seen in a movie that you’ve imagined us in?", category: "Locations", intensity: "mild" },

  //   Category: Roleplay & Power
  { id: "fant_011", deckId: "spicy_fantasies", question: "If we were to roleplay 'strangers meeting at a bar,' who would your character be?", category: "Roleplay", intensity: "medium" },
  { id: "fant_012", deckId: "spicy_fantasies", question: "Do you have a fantasy about being completely submissive for a night?", category: "Roleplay", intensity: "high" },
  { id: "fant_013", deckId: "spicy_fantasies", question: "What is the 'hottest' professional role for a partner to play? (Doctor, Boss, Teacher, etc.)", category: "Roleplay", intensity: "medium" },
  { id: "fant_014", deckId: "spicy_fantasies", question: "How do you feel about the 'damsel in distress' or 'knight in shining armor' dynamic?", category: "Roleplay", intensity: "mild" },
  { id: "fant_015", deckId: "spicy_fantasies", question: "Would you ever want to try being 'blindfolded' and not knowing what's coming next?", category: "Roleplay", intensity: "high" },
  { id: "fant_016", deckId: "spicy_fantasies", question: "Is there a specific uniform or outfit you’ve fantasized about me wearing?", category: "Roleplay", intensity: "medium" },
  { id: "fant_017", deckId: "spicy_fantasies", question: "Do you have any 'hero/villain' fantasies?", category: "Roleplay", intensity: "medium" },
  { id: "fant_018", deckId: "spicy_fantasies", question: "How would you feel about me 'taking' what I want without asking for permission (consensual non-consent)?", category: "Roleplay", intensity: "high" },
  { id: "fant_019", deckId: "spicy_fantasies", question: "Would you ever want to be 'served' by me for an entire evening?", category: "Roleplay", intensity: "medium" },
  { id: "fant_020", deckId: "spicy_fantasies", question: "What’s the most 'theatrical' or over-the-top fantasy you’ve ever had?", category: "Roleplay", intensity: "high" },

  //   Category: Sensory & Senses
  { id: "fant_021", deckId: "spicy_fantasies", question: "Have you ever fantasized about using temperature (ice or hot wax) in the bedroom?", category: "Sensory", intensity: "high" },
  { id: "fant_022", deckId: "spicy_fantasies", question: "How do you feel about 'impact' (light spanking or scratching)?", category: "Sensory", intensity: "high" },
  { id: "fant_023", deckId: "spicy_fantasies", question: "Does the idea of being filmed or taking photos together turn you on or make you nervous?", category: "Sensory", intensity: "high" },
  { id: "fant_024", deckId: "spicy_fantasies", question: "Would you ever want to incorporate food (honey, chocolate, whip cream) into our play?", category: "Sensory", intensity: "medium" },
  { id: "fant_025", deckId: "spicy_fantasies", question: "How do you feel about the 'sensory deprivation' idea (earplugs, blindfolds, restraints)?", category: "Sensory", intensity: "high" },
  { id: "fant_026", deckId: "spicy_fantasies", question: "Have you ever wanted to try 'breath-play' or something similar?", category: "Sensory", intensity: "high" },
  { id: "fant_027", deckId: "spicy_fantasies", question: "What’s a sound you’ve fantasized about hearing me make?", category: "Sensory", intensity: "medium" },
  { id: "fant_028", deckId: "spicy_fantasies", question: "Do you have a fantasy about being touched by more than two hands?", category: "Sensory", intensity: "high" },
  { id: "fant_029", deckId: "spicy_fantasies", question: "Would you ever want to be intimate in a room full of mirrors?", category: "Sensory", intensity: "medium" },
  { id: "fant_030", deckId: "spicy_fantasies", question: "Is there a specific 'smell' (leather, latex, perfume) that drives your fantasies?", category: "Sensory", intensity: "medium" },

  //   Category: Social & Multiple
  { id: "fant_031", deckId: "spicy_fantasies", question: "Is a 'three-way' a genuine curiosity for you, or a hard no?", category: "Social", intensity: "high" },
  { id: "fant_032", deckId: "spicy_fantasies", question: "Would you ever want to go to a 'spicy' club or a party just to watch?", category: "Social", intensity: "high" },
  { id: "fant_033", deckId: "spicy_fantasies", question: "How do you feel about the idea of 'voyeurism' (watching others or being watched)?", category: "Social", intensity: "high" },
  { id: "fant_034", deckId: "spicy_fantasies", question: "If we were at a party, would you ever want to sneak off into a room together while everyone is in the next room?", category: "Social", intensity: "medium" },
  { id: "fant_035", deckId: "spicy_fantasies", question: "Would you ever want to try 'swinging' or a partner swap?", category: "Social", intensity: "high" },
  { id: "fant_036", deckId: "spicy_fantasies", question: "Do you have a fantasy about me being with someone else while you watch?", category: "Social", intensity: "high" },
  { id: "fant_037", deckId: "spicy_fantasies", question: "Is the idea of an 'audience' (real or digital) a turn-on for you?", category: "Social", intensity: "high" },
  { id: "fant_038", deckId: "spicy_fantasies", question: "Would you ever want to hire a professional for a 'guest appearance' in our bedroom?", category: "Social", intensity: "high" },
  { id: "fant_039", deckId: "spicy_fantasies", question: "What’s your opinion on 'double penetration' fantasies?", category: "Social", intensity: "high" },
  { id: "fant_040", deckId: "spicy_fantasies", question: "If you could pick one 'celebrity' to join us for an hour, who would it be?", category: "Social", intensity: "medium" },

  //   Category: Dirty & Deep
  { id: "fant_041", deckId: "spicy_fantasies", question: "What is your 'darkest' fantasy that you’ve never told a living soul?", category: "Deep", intensity: "high" },
  { id: "fant_042", deckId: "spicy_fantasies", question: "Do you have any fantasies involving 'taboo' family-dynamic roleplay?", category: "Deep", intensity: "high" },
  { id: "fant_043", deckId: "spicy_fantasies", question: "How do you feel about 'exhibitionism'—the thrill of being seen?", category: "Deep", intensity: "high" },
  { id: "fant_044", deckId: "spicy_fantasies", question: "Would you ever want to try 'age-play' or something similar?", category: "Deep", intensity: "high" },
  { id: "fant_045", deckId: "spicy_fantasies", question: "Is there a position you’ve seen in adult media that looks impossible but you want to try anyway?", category: "Deep", intensity: "medium" },
  { id: "fant_046", deckId: "spicy_fantasies", question: "Do you have a fantasy about 'over-stimulation'?", category: "Deep", intensity: "high" },
  { id: "fant_047", deckId: "spicy_fantasies", question: "How do you feel about 'dirty talk' fantasies involving being degraded or worshipped?", category: "Deep", intensity: "high" },
  { id: "fant_048", deckId: "spicy_fantasies", question: "Have you ever fantasized about being 'bought' or 'sold' for a night?", category: "Deep", intensity: "high" },
  { id: "fant_049", deckId: "spicy_fantasies", question: "What’s a fantasy that you think would be great in your head but terrible in real life?", category: "Deep", intensity: "medium" },
  { id: "fant_050", deckId: "spicy_fantasies", question: "If you had a 'magic lamp' for three sexual wishes, what would they be?", category: "Deep", intensity: "high" },

  //   Category: Fun & Quick
  { id: "fant_051", deckId: "spicy_fantasies", question: "Would you ever want to try doing it in a pool or hot tub?", category: "Fun", intensity: "mild" },
  { id: "fant_052", deckId: "spicy_fantasies", question: "How do you feel about 'cosplay' (dressing as fictional characters)?", category: "Fun", intensity: "medium" },
  { id: "fant_053", deckId: "spicy_fantasies", question: "Do you have a fantasy about being 'woken up' with intimacy?", category: "Fun", intensity: "medium" },
  { id: "fant_054", deckId: "spicy_fantasies", question: "Would you ever want to record a 'voice note' of us together to listen to later?", category: "Fun", intensity: "high" },
  { id: "fant_055", deckId: "spicy_fantasies", question: "What is your 'safest' or most 'innocent' fantasy?", category: "Fun", intensity: "mild" },
  { id: "fant_056", deckId: "spicy_fantasies", question: "Is there a toy you’ve seen online that looks absolutely terrifying but interesting?", category: "Fun", intensity: "medium" },
  { id: "fant_057", deckId: "spicy_fantasies", question: "Would you ever want to try 'edging' for a whole day?", category: "Fun", intensity: "high" },
  { id: "fant_058", deckId: "spicy_fantasies", question: "Have you ever wanted to try 'bondage' with simple household items?", category: "Fun", intensity: "high" },
  { id: "fant_059", deckId: "spicy_fantasies", question: "If I said 'we can do anything you want right now,' what's the first thing that pops into your head?", category: "Fun", intensity: "high" },
  { id: "fant_060", deckId: "spicy_fantasies", question: "On a scale of 1-10, how much of your 'fantasy life' have we actually explored together?", category: "Fun", intensity: "medium" },

  //   Category: Consent & Communication
  { id: "safe_001", deckId: "spicy_boundaries", question: "What is your preferred 'safe word' and what should my immediate reaction be when you use it?", category: "Consent", intensity: "deep" },
  { id: "safe_002", deckId: "spicy_boundaries", question: "How do you feel about a 'Yellow Light' system? (Slow down, check in, but don't stop).", category: "Consent", intensity: "medium" },
  { id: "safe_003", deckId: "spicy_boundaries", question: "Do you prefer it when I ask for permission during the act, or is a pre-negotiated plan better?", category: "Consent", intensity: "medium" },
  { id: "safe_004", deckId: "spicy_boundaries", question: "What is a non-verbal signal you give when you aren't enjoying something but are too shy to speak up?", category: "Communication", intensity: "deep" },
  { id: "safe_005", deckId: "spicy_boundaries", question: "How do you feel about 'spontaneous' intimacy when you’re asleep or just waking up?", category: "Consent", intensity: "high" },
  { id: "safe_006", deckId: "spicy_boundaries", question: "Is it okay for me to record or photograph us, provided they are deleted immediately after?", category: "Consent", intensity: "high" },
  { id: "safe_007", deckId: "spicy_boundaries", question: "How do you handle it if I suggest something you find absolutely unappealing?", category: "Communication", intensity: "medium" },
  { id: "safe_008", deckId: "spicy_boundaries", question: "Do you feel like 'No' is always an acceptable answer, even in the middle of our most intense moments?", category: "Consent", intensity: "deep" },
  { id: "safe_009", deckId: "spicy_boundaries", question: "What is the best way for me to 'check in' on you without ruining the mood?", category: "Communication", intensity: "medium" },
  { id: "safe_010", deckId: "spicy_boundaries", question: "Is there any specific word or phrase that is an instant 'mood-killer' for you?", category: "Communication", intensity: "medium" },

  //   Category: Physical Boundaries
  { id: "safe_011", deckId: "spicy_boundaries", question: "Are there any parts of your body that are strictly 'off-limits' today?", category: "Physical", intensity: "medium" },
  { id: "safe_012", deckId: "spicy_boundaries", question: "How do you feel about 'impact' play (slapping, spanking)? What is your limit on intensity?", category: "Physical", intensity: "high" },
  { id: "safe_013", deckId: "spicy_boundaries", question: "What is your stance on 'choking' or breath-play? Is this a hard 'No' or a 'Maybe'?", category: "Physical", intensity: "high" },
  { id: "safe_014", deckId: "spicy_boundaries", question: "How do you feel about hair-pulling? Does direction or strength matter?", category: "Physical", intensity: "high" },
  { id: "safe_015", deckId: "spicy_boundaries", question: "Are you comfortable with 'marks' being left on your body (bruises, hickeys)?", category: "Physical", intensity: "high" },
  { id: "safe_016", deckId: "spicy_boundaries", question: "What is your threshold for pain in the bedroom—is it a turn-on or a turn-off?", category: "Physical", intensity: "deep" },
  { id: "safe_017", deckId: "spicy_boundaries", question: "How do you feel about 'restraints'—do you need to be able to escape them instantly?", category: "Physical", intensity: "high" },
  { id: "safe_018", deckId: "spicy_boundaries", question: "Is there a specific way you hate being touched that I should always avoid?", category: "Physical", intensity: "medium" },
  { id: "safe_019", deckId: "spicy_boundaries", question: "What is your opinion on 'temperature play' (ice or hot wax)?", category: "Physical", intensity: "medium" },
  { id: "safe_020", deckId: "spicy_boundaries", question: "Are you comfortable with me using toys on you that I haven't used before?", category: "Physical", intensity: "medium" },

  //   Category: Emotional Safety & Aftercare
  { id: "safe_021", deckId: "spicy_boundaries", question: "What does your 'ideal' aftercare look like? (Cuddling, silence, snacks, a shower?)", category: "Aftercare", intensity: "medium" },
  { id: "safe_022", deckId: "spicy_boundaries", question: "Do you ever experience 'sub-drop' or post-intimacy sadness? How can I help?", category: "Aftercare", intensity: "deep" },
  { id: "safe_023", deckId: "spicy_boundaries", question: "How soon after being intimate do you like to talk about what we just did?", category: "Aftercare", intensity: "medium" },
  { id: "safe_024", deckId: "spicy_boundaries", question: "If you feel vulnerable after sex, do you prefer to be held or given space?", category: "Aftercare", intensity: "deep" },
  { id: "safe_025", deckId: "spicy_boundaries", question: "What is the most 'emotionally safe' position for you?", category: "Emotional", intensity: "medium" },
  { id: "safe_026", deckId: "spicy_boundaries", question: "Does 'dirty talk' ever make you feel degraded in a way that isn't fun? Where is that line?", category: "Emotional", intensity: "high" },
  { id: "safe_027", deckId: "spicy_boundaries", question: "How much of your sexual identity is tied to your self-worth?", category: "Emotional", intensity: "deep" },
  { id: "safe_028", deckId: "spicy_boundaries", question: "Do you feel like you can be your 'unattractive' self during sex (making weird noises, faces, etc.)?", category: "Emotional", intensity: "deep" },
  { id: "safe_029", deckId: "spicy_boundaries", question: "What is the best way for me to reassure you that you are doing a great job?", category: "Emotional", intensity: "medium" },
  { id: "safe_030", deckId: "spicy_boundaries", question: "How do you feel when we have a 'miss'—a time when things just didn't work out?", category: "Emotional", intensity: "medium" },

  //   Category: Sexual Health & External
  { id: "safe_031", deckId: "spicy_boundaries", question: "How often should we talk about our sexual health and testing?", category: "Health", intensity: "medium" },
  { id: "safe_032", deckId: "spicy_boundaries", question: "What is your stance on protection versus other forms of birth control?", category: "Health", intensity: "medium" },
  { id: "safe_033", deckId: "spicy_boundaries", question: "Are you comfortable talking about past partners' health histories?", category: "Health", intensity: "medium" },
  { id: "safe_034", deckId: "spicy_boundaries", question: "How do you feel about me bringing up a new fantasy I saw online?", category: "Communication", intensity: "mild" },
  { id: "safe_035", deckId: "spicy_boundaries", question: "Is 'pornography' a shared activity, a solo activity, or a dealbreaker in our relationship?", category: "Boundaries", intensity: "high" },
  { id: "safe_036", deckId: "spicy_boundaries", question: "How do you feel about me mentioning our sex life to our closest friends?", category: "Boundaries", intensity: "medium" },
  { id: "safe_037", deckId: "spicy_boundaries", question: "Are you comfortable with me watching you while you are in a solo session?", category: "Boundaries", intensity: "high" },
  { id: "safe_038", deckId: "spicy_boundaries", question: "What is your 'hard limit' on the involving of third parties, even just in conversation?", category: "Boundaries", intensity: "high" },
  { id: "safe_039", deckId: "spicy_boundaries", question: "How do you feel about 'thirst traps' or following spicy accounts on social media?", category: "Boundaries", intensity: "medium" },
  { id: "safe_040", deckId: "spicy_boundaries", question: "What is your 'No-Go' zone when it comes to locations or settings?", category: "Boundaries", intensity: "mild" },

  //   Category: Evolution of Boundaries
  { id: "safe_041", deckId: "spicy_boundaries", question: "Is there a 'Hard No' from our past that has recently become a 'Maybe'?", category: "Evolution", intensity: "deep" },
  { id: "safe_042", deckId: "spicy_boundaries", question: "How have your boundaries changed as you’ve gotten older and more experienced?", category: "Evolution", intensity: "deep" },
  { id: "safe_043", deckId: "spicy_boundaries", question: "What is one thing you were pressured into in the past that you will never do again?", category: "Evolution", intensity: "deep" },
  { id: "safe_044", deckId: "spicy_boundaries", question: "Do you find it easier to set physical boundaries or emotional ones?", category: "Evolution", intensity: "medium" },
  { id: "safe_045", deckId: "spicy_boundaries", question: "What can I do to help you feel more empowered to say 'No'?", category: "Evolution", intensity: "deep" },
  { id: "safe_046", deckId: "spicy_boundaries", question: "Is there a fantasy you have that you're afraid to tell me because of my possible boundaries?", category: "Evolution", intensity: "high" },
  { id: "safe_047", deckId: "spicy_boundaries", question: "How do we handle it if our libidos are mismatched for a long period of time?", category: "Evolution", intensity: "deep" },
  { id: "safe_048", deckId: "spicy_boundaries", question: "What is the 'safest' part of our relationship right now?", category: "Evolution", intensity: "medium" },
  { id: "safe_049", deckId: "spicy_boundaries", question: "If we could 'reset' one aspect of our physical relationship, what would it be?", category: "Evolution", intensity: "deep" },
  { id: "safe_050", deckId: "spicy_boundaries", question: "What makes you trust me the most?", category: "Evolution", intensity: "deep" },

  //   Category: Quick Checks
  { id: "safe_051", deckId: "spicy_boundaries", question: "Eye contact: More or less?", category: "Check-in", intensity: "mild" },
  { id: "safe_052", deckId: "spicy_boundaries", question: "Speed: Faster or slower?", category: "Check-in", intensity: "mild" },
  { id: "safe_053", deckId: "spicy_boundaries", question: "Pressure: Harder or softer?", category: "Check-in", intensity: "mild" },
  { id: "safe_054", deckId: "spicy_boundaries", question: "Talk: Dirtier or sweeter?", category: "Check-in", intensity: "mild" },
  { id: "safe_055", deckId: "spicy_boundaries", question: "Lights: Brighter or darker?", category: "Check-in", intensity: "mild" },
  { id: "safe_056", deckId: "spicy_boundaries", question: "What is your 'comfort food' of sexual positions?", category: "Check-in", intensity: "mild" },
  { id: "safe_057", deckId: "spicy_boundaries", question: "On a scale of 1-10, how adventurous are you feeling tonight?", category: "Check-in", intensity: "medium" },
  { id: "safe_058", deckId: "spicy_boundaries", question: "Do you have any physical injuries or aches I should be mindful of?", category: "Check-in", intensity: "mild" },
  { id: "safe_059", deckId: "spicy_boundaries", question: "What is the one thing I can do to make you feel like a King/Queen tonight?", category: "Check-in", intensity: "medium" },
  { id: "safe_060", deckId: "spicy_boundaries", question: "I love you. Do you feel that right now?", category: "Check-in", intensity: "deep" },

  //   Category: Forbidden Desires
  { id: "taboo_001", deckId: "spicy_taboo", question: "What is the most 'scandalous' fantasy you’ve ever had involving a complete stranger?", category: "Forbidden", intensity: "high" },
  { id: "taboo_002", deckId: "spicy_taboo", question: "Have you ever fantasized about being 'taken' by more than one person at once?", category: "Forbidden", intensity: "high" },
  { id: "taboo_003", deckId: "spicy_taboo", question: "What is a 'taboo' roleplay dynamic that you are secretly attracted to but afraid to admit?", category: "Forbidden", intensity: "high" },
  { id: "taboo_004", deckId: "spicy_taboo", question: "How do you feel about the idea of 'sharing' me with someone else for a night?", category: "Forbidden", intensity: "high" },
  { id: "taboo_005", deckId: "spicy_taboo", question: "Is there a person in our 'real life' that you’ve had a genuinely dirty dream about?", category: "Forbidden", intensity: "high" },
  { id: "taboo_006", deckId: "spicy_taboo", question: "What is your opinion on 'exhibitionism'—the thrill of being seen in the act?", category: "Forbidden", intensity: "medium" },
  { id: "taboo_007", deckId: "spicy_taboo", question: "Have you ever wanted to try something that you consider 'gross' but also 'hot'?", category: "Forbidden", intensity: "high" },
  { id: "taboo_008", deckId: "spicy_taboo", question: "What is the most 'risky' thing you’d be willing to do in a public place?", category: "Forbidden", intensity: "medium" },
  { id: "taboo_009", deckId: "spicy_taboo", question: "Do you have any 'power-play' fantasies where you are completely at my mercy?", category: "Forbidden", intensity: "high" },
  { id: "taboo_010", deckId: "spicy_taboo", question: "What is the one thing you’ve seen in a movie that you thought was 'too much' but now you want to try?", category: "Forbidden", intensity: "medium" },

  //   Category: Darker Secrets
  { id: "taboo_011", deckId: "spicy_taboo", question: "What is the largest age gap you’ve ever had in a sexual encounter?", category: "Secrets", intensity: "medium" },
  { id: "taboo_012", deckId: "spicy_taboo", question: "Have you ever had a one-night stand that you truly regret?", category: "Secrets", intensity: "medium" },
  { id: "taboo_013", deckId: "spicy_taboo", question: "What is the most 'immoral' thing you’ve done in the pursuit of pleasure?", category: "Secrets", intensity: "high" },
  { id: "taboo_014", deckId: "spicy_taboo", question: "Have you ever been the 'other person' in someone else's relationship?", category: "Secrets", intensity: "high" },
  { id: "taboo_015", deckId: "spicy_taboo", question: "What is a secret you’ve kept from me because you thought I’d be disgusted?", category: "Secrets", intensity: "high" },
  { id: "taboo_016", deckId: "spicy_taboo", question: "Have you ever lied about your 'number' to make yourself look more or less experienced?", category: "Secrets", intensity: "medium" },
  { id: "taboo_017", deckId: "spicy_taboo", question: "What is the weirdest place you’ve ever 'pleasured yourself'?", category: "Secrets", intensity: "medium" },
  { id: "taboo_018", deckId: "spicy_taboo", question: "Have you ever recorded someone without their knowledge? (Be honest).", category: "Secrets", intensity: "high" },
  { id: "taboo_019", deckId: "spicy_taboo", question: "Who was your most 'inappropriate' crush ever?", category: "Secrets", intensity: "medium" },
  { id: "taboo_020", deckId: "spicy_taboo", question: "What is the most you’ve ever paid (or been paid) for something spicy?", category: "Secrets", intensity: "high" },

  //   Category: Risky Play
  { id: "taboo_021", deckId: "spicy_taboo", question: "How do you feel about 'impact' play involving objects (paddles, crops, etc.)?", category: "Risk", intensity: "high" },
  { id: "taboo_022", deckId: "spicy_taboo", question: "What is your opinion on 'breath control' or light strangulation?", category: "Risk", intensity: "high" },
  { id: "taboo_023", deckId: "spicy_taboo", question: "Would you ever want to try 'bondage' where you are completely immobile?", category: "Risk", intensity: "high" },
  { id: "taboo_024", deckId: "spicy_taboo", question: "How do you feel about 'wax play'—the sensation of hot liquid on skin?", category: "Risk", intensity: "high" },
  { id: "taboo_025", deckId: "spicy_taboo", question: "What is the 'scariest' thing you actually want to try with me?", category: "Risk", intensity: "high" },
  { id: "taboo_026", deckId: "spicy_taboo", question: "How do you feel about 'verbal degradation' during sex? (Calling names, etc.)", category: "Risk", intensity: "high" },
  { id: "taboo_027", deckId: "spicy_taboo", question: "Is the idea of 'being hunted' or a 'chase' scenario a turn-on for you?", category: "Risk", intensity: "high" },
  { id: "taboo_028", deckId: "spicy_taboo", question: "What is your stance on 'sensory overload'—too much touch, sound, and light at once?", category: "Risk", intensity: "medium" },
  { id: "taboo_029", deckId: "spicy_taboo", question: "Would you ever want to do it in a place where we could get arrested?", category: "Risk", intensity: "high" },
  { id: "taboo_030", deckId: "spicy_taboo", question: "How do you feel about 'blood play' or using needles? (Hard taboo).", category: "Risk", intensity: "high" },

  //   Category: The 'Multiple' Taboo
  { id: "taboo_031", deckId: "spicy_taboo", question: "If we were to have a three-way, would you want the third person to be a friend or a stranger?", category: "Multiple", intensity: "high" },
  { id: "taboo_032", deckId: "spicy_taboo", question: "How would you feel about watching me have sex with someone else?", category: "Multiple", intensity: "high" },
  { id: "taboo_033", deckId: "spicy_taboo", question: "What is your 'cuckolding' or 'hot-wifing' curiosity level on a scale of 1-10?", category: "Multiple", intensity: "high" },
  { id: "taboo_034", deckId: "spicy_taboo", question: "Would you ever want to go to an 'orgy' or a lifestyle club just to see what happens?", category: "Multiple", intensity: "high" },
  { id: "taboo_035", deckId: "spicy_taboo", question: "If you could pick any person we both know to join us, who is it?", category: "Multiple", intensity: "high" },
  { id: "taboo_036", deckId: "spicy_taboo", question: "How do you feel about 'swinging'—trading partners for a night?", category: "Multiple", intensity: "high" },
  { id: "taboo_037", deckId: "spicy_taboo", question: "Would you ever want to be 'used' by a group of people while blindfolded?", category: "Multiple", intensity: "high" },
  { id: "taboo_038", deckId: "spicy_taboo", question: "What is the hottest 'threesome' configuration in your mind?", category: "Multiple", intensity: "high" },
  { id: "taboo_039", deckId: "spicy_taboo", question: "How would our relationship change if we brought a permanent third person into our bed?", category: "Multiple", intensity: "deep" },
  { id: "taboo_040", deckId: "spicy_taboo", question: "Is 'monogamy' a choice or a limitation for you?", category: "Multiple", intensity: "deep" },

  //   Category: Psychological Edges
  { id: "taboo_041", deckId: "spicy_taboo", question: "What is a 'fetish' you have that you think is completely 'un-listable'?", category: "Psychological", intensity: "high" },
  { id: "taboo_042", deckId: "spicy_taboo", question: "Do you have any fantasies involving 'non-human' elements? (Aliens, monsters, etc.)", category: "Psychological", intensity: "high" },
  { id: "taboo_043", deckId: "spicy_taboo", question: "How do you feel about 'age-play' (Daddying, etc.)? Is it a turn-on or a hard no?", category: "Psychological", intensity: "high" },
  { id: "taboo_044", deckId: "spicy_taboo", question: "Would you ever want to be 'humiliated' in a sexual context?", category: "Psychological", intensity: "high" },
  { id: "taboo_045", deckId: "spicy_taboo", question: "What is your opinion on 'voyeurism'—the desire to watch strangers?", category: "Psychological", intensity: "medium" },
  { id: "taboo_046", deckId: "spicy_taboo", question: "Do you have a fantasy about being 'bought' or 'sold' at an auction?", category: "Psychological", intensity: "high" },
  { id: "taboo_047", deckId: "spicy_taboo", question: "How do you feel about 'messy play' (using liquids, mud, etc.)?", category: "Psychological", intensity: "medium" },
  { id: "taboo_048", deckId: "spicy_taboo", question: "What is the most 'illegal-sounding' thing that turns you on?", category: "Psychological", intensity: "high" },
  { id: "taboo_049", deckId: "spicy_taboo", question: "Do you ever fantasize about 'forbidden' relatives or scenarios? (Just a fantasy!)", category: "Psychological", intensity: "high" },
  { id: "taboo_050", deckId: "spicy_taboo", question: "If there were no laws and no judgment, how would our sex life look?", category: "Psychological", intensity: "deep" },

  //   Category: Final Provocations
  { id: "taboo_051", deckId: "spicy_taboo", question: "What is the most 'perverted' thing you’ve ever done?", category: "Provocation", intensity: "high" },
  { id: "taboo_052", deckId: "spicy_taboo", question: "If I was a professional 'spicy' worker, would you still be with me?", category: "Provocation", intensity: "deep" },
  { id: "taboo_053", deckId: "spicy_taboo", question: "What is the one thing you’re too 'ashamed' to tell your best friend about us?", category: "Provocation", intensity: "high" },
  { id: "taboo_054", deckId: "spicy_taboo", question: "Have you ever wanted to try 'pegging' or similar role-reversals?", category: "Provocation", intensity: "high" },
  { id: "taboo_055", deckId: "spicy_taboo", question: "Would you ever want to live in a 'BDSM' household dynamic 24/7?", category: "Provocation", intensity: "high" },
  { id: "taboo_056", deckId: "spicy_taboo", question: "What is the 'filthiest' thing you’ve ever said in bed?", category: "Provocation", intensity: "high" },
  { id: "taboo_057", deckId: "spicy_taboo", question: "If we could have a 'no-limits' weekend, what are the first three things we do?", category: "Provocation", intensity: "high" },
  { id: "taboo_058", deckId: "spicy_taboo", question: "Is there anything you’ve seen in 'dark' internet corners that you secretly loved?", category: "Provocation", intensity: "high" },
  { id: "taboo_059", deckId: "spicy_taboo", question: "What is your 'Taboo' bucket list—top 3 items?", category: "Provocation", intensity: "high" },
  { id: "taboo_060", deckId: "spicy_taboo", question: "Are you ready to cross a line with me right now?", category: "Provocation", intensity: "high" },

//   Category: Senses & Sensations
{ id: "phys_001", deckId: "spicy_physical", question: "Do you prefer a soft, light touch that gives you chills, or a firm, grounding grip?", category: "Sensations", intensity: "medium" },
{ id: "phys_002", deckId: "spicy_physical", question: "How do you feel about the sensation of nails lightly scratching your back or scalp?", category: "Sensations", intensity: "medium" },
{ id: "phys_003", deckId: "spicy_physical", question: "Is there a specific texture (like silk, lace, or leather) that heightens your physical sensitivity?", category: "Sensations", intensity: "mild" },
{ id: "phys_004", deckId: "spicy_physical", question: "How does temperature play into your pleasure? Do you like the contrast of cold ice or warm breath?", category: "Sensations", intensity: "high" },
{ id: "phys_005", deckId: "spicy_physical", question: "What is your favorite 'non-sexual' physical sensation? (e.g., hair being brushed, feet rubbed)?", category: "Sensations", intensity: "mild" },
{ id: "phys_006", deckId: "spicy_physical", question: "Does the sound of my breathing change the way you feel touch?", category: "Sensations", intensity: "medium" },
{ id: "phys_007", deckId: "spicy_physical", question: "Do you like being touched through your clothes, or do you find it frustrating?", category: "Sensations", intensity: "medium" },
{ id: "phys_008", deckId: "spicy_physical", question: "How do you feel about 'sensory deprivation'—like being blindfolded to focus only on touch?", category: "Sensations", intensity: "high" },
{ id: "phys_009", deckId: "spicy_physical", question: "Which of your five senses is the most dominant when we are being intimate?", category: "Sensations", intensity: "deep" },
{ id: "phys_010", deckId: "spicy_physical", question: "What is the most sensitive part of your body that I *don’t* touch often enough?", category: "Sensations", intensity: "high" },

//   Category: Foreplay & Anticipation
{ id: "phys_011", deckId: "spicy_physical", question: "What is your absolute favorite way for me to initiate touch when we’re out in public?", category: "Foreplay", intensity: "medium" },
{ id: "phys_012", deckId: "spicy_physical", question: "Do you prefer a long, slow build-up or do you sometimes just want to get straight to it?", category: "Foreplay", intensity: "medium" },
{ id: "phys_013", deckId: "spicy_physical", question: "What’s a 'secret' physical signal you give when you want me to touch you a certain way?", category: "Foreplay", intensity: "medium" },
{ id: "phys_014", deckId: "spicy_physical", question: "How do you feel about 'teasing' touch that stops just before the main event?", category: "Foreplay", intensity: "high" },
{ id: "phys_015", deckId: "spicy_physical", question: "What is the hottest way I can kiss your neck?", category: "Foreplay", intensity: "high" },
{ id: "phys_016", deckId: "spicy_physical", question: "If I could only use my hands or only my mouth for 10 minutes, which would you choose?", category: "Foreplay", intensity: "high" },
{ id: "phys_017", deckId: "spicy_physical", question: "Do you like it when I whisper in your ear while touching you?", category: "Foreplay", intensity: "medium" },
{ id: "phys_018", deckId: "spicy_physical", question: "Where is the best place for me to put my hands when we are kissing?", category: "Foreplay", intensity: "medium" },
{ id: "phys_019", deckId: "spicy_physical", question: "What’s your opinion on 'clothes-on' intimacy versus total nudity?", category: "Foreplay", intensity: "medium" },
{ id: "phys_020", deckId: "spicy_physical", question: "How does the speed of my touch affect your level of arousal?", category: "Foreplay", intensity: "high" },

//   Category: Erogenous Zones
{ id: "phys_021", deckId: "spicy_physical", question: "Are your ears a 'yes' or a 'no' when it comes to spicy touch?", category: "Zones", intensity: "medium" },
{ id: "phys_022", deckId: "spicy_physical", question: "How do you feel about your inner thighs being the center of attention?", category: "Zones", intensity: "high" },
{ id: "phys_023", deckId: "spicy_physical", question: "Is the base of your spine a sensitive area for you?", category: "Zones", intensity: "medium" },
{ id: "phys_024", deckId: "spicy_physical", question: "Hands and feet: are they erogenous zones for you or just body parts?", category: "Zones", intensity: "mild" },
{ id: "phys_025", deckId: "spicy_physical", question: "What is the 'hidden gem' of your body—a spot that no one else would guess is sensitive?", category: "Zones", intensity: "high" },
{ id: "phys_026", deckId: "spicy_physical", question: "Do you like having your hair pulled during intimacy? If so, how hard?", category: "Zones", intensity: "high" },
{ id: "phys_027", deckId: "spicy_physical", question: "How do you feel about your stomach and waist area being focused on?", category: "Zones", intensity: "medium" },
{ id: "phys_028", deckId: "spicy_physical", question: "Biting: is it a turn-on or too much? If yes, where?", category: "Zones", intensity: "high" },
{ id: "phys_029", deckId: "spicy_physical", question: "Is there a part of your body that you’re insecure about being touched?", category: "Zones", intensity: "deep" },
{ id: "phys_030", deckId: "spicy_physical", question: "Which erogenous zone do you think I enjoy touching the most on you?", category: "Zones", intensity: "medium" },

//   Category: Physical Preferences
{ id: "phys_031", deckId: "spicy_physical", question: "Slow and rhythmic or fast and erratic touch? Which one builds more tension?", category: "Preferences", intensity: "medium" },
{ id: "phys_032", deckId: "spicy_physical", question: "Do you like to be the 'explorer' with your hands, or do you prefer to lie back and receive?", category: "Preferences", intensity: "medium" },
{ id: "phys_033", deckId: "spicy_physical", question: "What is your favorite 'physical' position for us to be in while we sleep?", category: "Preferences", intensity: "mild" },
{ id: "phys_034", deckId: "spicy_physical", question: "How do you feel about oil or lotion being incorporated into our touch?", category: "Preferences", intensity: "medium" },
{ id: "phys_035", deckId: "spicy_physical", question: "Massage: do you want it to be relaxing or to lead to something more?", category: "Preferences", intensity: "mild" },
{ id: "phys_036", deckId: "spicy_physical", question: "Do you like eye contact while I am touching you, or does it feel too intense?", category: "Preferences", intensity: "high" },
{ id: "phys_037", deckId: "spicy_physical", question: "Is there a specific way you like to be held after we’re done?", category: "Preferences", intensity: "deep" },
{ id: "phys_038", deckId: "spicy_physical", question: "How important is 'physical strength' to you in our intimacy?", category: "Preferences", intensity: "medium" },
{ id: "phys_039", deckId: "spicy_physical", question: "Do you prefer my touch to be predictable or surprising?", category: "Preferences", intensity: "medium" },
{ id: "phys_040", deckId: "spicy_physical", question: "What is one type of touch you’ve always wanted to try but haven't asked for?", category: "Preferences", intensity: "high" },

//   Category: Connection & Emotion
{ id: "phys_041", deckId: "spicy_physical", question: "Does a certain way I touch you make you feel more emotionally safe than others?", category: "Connection", intensity: "deep" },
{ id: "phys_042", deckId: "spicy_physical", question: "When we’re out, does a hand on your lower back make you feel protected or claimed?", category: "Connection", intensity: "medium" },
{ id: "phys_043", deckId: "spicy_physical", question: "How does our physical touch change when we are stressed versus when we are relaxed?", category: "Connection", intensity: "deep" },
{ id: "phys_044", deckId: "spicy_physical", question: "Can you tell I’m in the mood just by the way I brush past you?", category: "Connection", intensity: "medium" },
{ id: "phys_045", deckId: "spicy_physical", question: "What’s the most 'intimate' non-sexual touch we share?", category: "Connection", intensity: "medium" },
{ id: "phys_046", deckId: "spicy_physical", question: "Does my touch ever communicate things I haven’t said out loud?", category: "Connection", intensity: "deep" },
{ id: "phys_047", deckId: "spicy_physical", question: "How has your appreciation for my body changed since we first met?", category: "Connection", intensity: "deep" },
{ id: "phys_048", deckId: "spicy_physical", question: "What is the most 'vulnerable' part of your body for me to touch?", category: "Connection", intensity: "high" },
{ id: "phys_049", deckId: "spicy_physical", question: "Does being physically close to me help you process your emotions?", category: "Connection", intensity: "deep" },
{ id: "phys_050", deckId: "spicy_physical", question: "What physical habit of mine do you find most comforting when you're sad?", category: "Connection", intensity: "medium" },

//   Category: Physical Wildcards
{ id: "phys_051", deckId: "spicy_physical", question: "Give me a 10-second 'preview' of your favorite type of touch right now.", category: "Wildcard", intensity: "high" },
{ id: "phys_052", deckId: "spicy_physical", question: "If you had to choose: only kisses for a week or only hand-touching?", category: "Wildcard", intensity: "medium" },
{ id: "phys_053", deckId: "spicy_physical", question: "What is your opinion on 'tickling' in the bedroom—funny or annoying?", category: "Wildcard", intensity: "mild" },
{ id: "phys_054", deckId: "spicy_physical", question: "If we were in a zero-gravity environment, what would be the first thing you’d want to try?", category: "Wildcard", intensity: "medium" },
{ id: "phys_055", deckId: "spicy_physical", question: "Show me exactly where on your neck you like to be kissed most.", category: "Wildcard", intensity: "high" },
{ id: "phys_056", deckId: "spicy_physical", question: "What part of my physical presence do you find most intimidating?", category: "Wildcard", intensity: "medium" },
{ id: "phys_057", deckId: "spicy_physical", question: "If we could have a 'touch-only' date (no talking), what would it look like?", category: "Wildcard", intensity: "medium" },
{ id: "phys_058", deckId: "spicy_physical", question: "What’s the most 'unexpected' place where you felt a physical spark from me?", category: "Wildcard", intensity: "medium" },
{ id: "phys_059", deckId: "spicy_physical", question: "What is one 'move' I have that you think is my signature?", category: "Wildcard", intensity: "high" },
{ id: "phys_060", deckId: "spicy_physical", question: "Scale of 1-10: how well do I know your body's map?", category: "Wildcard", intensity: "deep" },

//   Category: Character Concepts
{ id: "role_001", deckId: "spicy_roleplay", question: "If we were to roleplay as 'strangers' at a hotel bar, what would your name and backstory be?", category: "Characters", intensity: "medium" },
{ id: "role_002", deckId: "spicy_roleplay", question: "What professional role do you find the most attractive in a partner? (Boss, Doctor, Teacher, etc.)", category: "Characters", intensity: "medium" },
{ id: "role_003", deckId: "spicy_roleplay", question: "Is there a fictional character (movie/book) you’ve always wanted to see me dress up as?", category: "Characters", intensity: "medium" },
{ id: "role_004", deckId: "spicy_roleplay", question: "Would you rather be the 'Hero' or the 'Villain' in our bedroom stories?", category: "Characters", intensity: "high" },
{ id: "role_005", deckId: "spicy_roleplay", question: "How do you feel about the 'French Maid' or 'Butler' tropes? Classic or boring?", category: "Characters", intensity: "mild" },
{ id: "role_006", deckId: "spicy_roleplay", question: "If I was a secret agent and you were the 'target,' how would you try to charm me?", category: "Characters", intensity: "medium" },
{ id: "role_007", deckId: "spicy_roleplay", question: "Do you have a fantasy about an 'Authority Figure' dynamic?", category: "Characters", intensity: "high" },
{ id: "role_008", deckId: "spicy_roleplay", question: "What is your 'alter ego's' primary personality trait? (Shy, Aggressive, Playful?)", category: "Characters", intensity: "medium" },
{ id: "role_009", deckId: "spicy_roleplay", question: "If we roleplayed a 'First Date' again, would you act exactly as you did or be someone else?", category: "Characters", intensity: "mild" },
{ id: "role_010", deckId: "spicy_roleplay", question: "What kind of 'accent' do you think is the sexiest for a character to have?", category: "Characters", intensity: "medium" },

//   Category: Power Dynamics
{ id: "role_011", deckId: "spicy_roleplay", question: "Do you find the idea of 'power exchange' (Dominance/Submission) intriguing or intimidating?", category: "Dynamics", intensity: "high" },
{ id: "role_012", deckId: "spicy_roleplay", question: "What is your 'safe word' or signal for when a roleplay scenario needs to stop?", category: "Dynamics", intensity: "deep" },
{ id: "role_013", deckId: "spicy_roleplay", question: "How do you feel about 'consensual non-consent' scenarios (like me taking control)?", category: "Dynamics", intensity: "high" },
{ id: "role_014", deckId: "spicy_roleplay", question: "Would you ever want to be 'interrogated' by me as part of a game?", category: "Dynamics", intensity: "high" },
{ id: "role_015", deckId: "spicy_roleplay", question: "What is the difference between 'Leader' and 'Dominant' to you?", category: "Dynamics", intensity: "deep" },
{ id: "role_016", deckId: "spicy_roleplay", question: "How much 'resistance' do you like in a roleplay scenario?", category: "Dynamics", intensity: "high" },
{ id: "role_017", deckId: "spicy_roleplay", question: "Does being 'worshipped' by a character sound more appealing than being 'commanded'?", category: "Dynamics", intensity: "medium" },
{ id: "role_018", deckId: "spicy_roleplay", question: "What is your favorite way for me to assert my 'power' in a scenario?", category: "Dynamics", intensity: "high" },
{ id: "role_019", deckId: "spicy_roleplay", question: "How do you feel about 'pet play' or animal-themed dynamics?", category: "Dynamics", intensity: "high" },
{ id: "role_020", deckId: "spicy_roleplay", question: "What is the most 'vulnerable' role you could imagine playing?", category: "Dynamics", intensity: "deep" },

//   Category: Scenarios & Plots
{ id: "role_021", deckId: "spicy_roleplay", question: "Scenario: We are stuck in an elevator together. Who makes the first move?", category: "Scenarios", intensity: "medium" },
{ id: "role_022", deckId: "spicy_roleplay", question: "Scenario: I am your personal trainer and you’ve been 'slacking off.' What is the punishment?", category: "Scenarios", intensity: "high" },
{ id: "role_023", deckId: "spicy_roleplay", question: "Scenario: We are 'rival' spies who have to share a bed to keep our cover. How does the night go?", category: "Scenarios", intensity: "medium" },
{ id: "role_024", deckId: "spicy_roleplay", question: "Scenario: You are a royal and I am your 'forbidden' guard. What is our secret signal?", category: "Scenarios", intensity: "medium" },
{ id: "role_025", deckId: "spicy_roleplay", question: "Scenario: We are at a masquerade ball and don't know each other's identities. How do we find out?", category: "Scenarios", intensity: "mild" },
{ id: "role_026", deckId: "spicy_roleplay", question: "Scenario: I am a tattoo artist and you are getting your first 'private' tattoo. What happens?", category: "Scenarios", intensity: "high" },
{ id: "role_027", deckId: "spicy_roleplay", question: "Scenario: We are 'enemies to lovers.' What was the moment the hate turned into heat?", category: "Scenarios", intensity: "medium" },
{ id: "role_028", deckId: "spicy_roleplay", question: "Scenario: You are 'lost' in the woods and stumble upon my cabin. What is the first thing I say?", category: "Scenarios", intensity: "medium" },
{ id: "role_029", deckId: "spicy_roleplay", question: "Scenario: We are in a library and have to be completely quiet while being intimate. Can you handle it?", category: "Scenarios", intensity: "high" },
{ id: "role_030", deckId: "spicy_roleplay", question: "What is your 'ultimate' scenario that you’ve never actually described to me?", category: "Scenarios", intensity: "high" },

//   Category: Costumes & Props
{ id: "role_031", deckId: "spicy_roleplay", question: "How do you feel about using wigs or makeup to completely transform your look for a night?", category: "Props", intensity: "mild" },
{ id: "role_032", deckId: "spicy_roleplay", question: "Is there a specific piece of lingerie or clothing that makes you feel like your 'spicy' self instantly?", category: "Props", intensity: "medium" },
{ id: "role_033", deckId: "spicy_roleplay", question: "What’s your opinion on 'restraints' (handcuffs, silk ties, etc.) in a roleplay context?", category: "Props", intensity: "high" },
{ id: "role_034", deckId: "spicy_roleplay", question: "Do you like using mirrors during roleplay to see the 'characters' interact?", category: "Props", intensity: "medium" },
{ id: "role_035", deckId: "spicy_roleplay", question: "If we could buy one 'prop' for a scenario today, what would it be?", category: "Props", intensity: "medium" },
{ id: "role_036", deckId: "spicy_roleplay", question: "How do you feel about masks (the mystery kind, not the COVID kind)?", category: "Props", intensity: "mild" },
{ id: "role_037", deckId: "spicy_roleplay", question: "Does the sound of 'clinking' metal or the smell of leather add to the role for you?", category: "Props", intensity: "high" },
{ id: "role_038", deckId: "spicy_roleplay", question: "Would you ever want to roleplay in a specific 'themed' room or location?", category: "Props", intensity: "medium" },
{ id: "role_039", deckId: "spicy_roleplay", question: "How do you feel about 'scripting' a scenario beforehand versus totally winging it?", category: "Props", intensity: "medium" },
{ id: "role_040", deckId: "spicy_roleplay", question: "Is there a prop you find hilarious but secretly want to use seriously?", category: "Props", intensity: "medium" },

//   Category: Psychological Play
{ id: "role_041", deckId: "spicy_roleplay", question: "Why does pretending to be someone else make us feel more comfortable exploring new things?", category: "Psychology", intensity: "deep" },
{ id: "role_042", deckId: "spicy_roleplay", question: "Do you think roleplay helps you express parts of your personality you usually suppress?", category: "Psychology", intensity: "deep" },
{ id: "role_043", deckId: "spicy_roleplay", question: "What is the biggest 'risk' you feel when stepping into a character?", category: "Psychology", intensity: "deep" },
{ id: "role_044", deckId: "spicy_roleplay", question: "Does 'aftercare' feel more important after a roleplay session than after 'normal' sex?", category: "Psychology", intensity: "medium" },
{ id: "role_045", deckId: "spicy_roleplay", question: "How do you feel when I stay in character even after we’re done?", category: "Psychology", intensity: "medium" },
{ id: "role_046", deckId: "spicy_roleplay", question: "What is the 'hottest' thing I can say while in character?", category: "Psychology", intensity: "high" },
{ id: "role_047", deckId: "spicy_roleplay", question: "Do you prefer roleplays that are more 'romantic' or more 'aggressive'?", category: "Psychology", intensity: "medium" },
{ id: "role_048", deckId: "spicy_roleplay", question: "What happens if we both start laughing during a serious scenario?", category: "Psychology", intensity: "mild" },
{ id: "role_049", deckId: "spicy_roleplay", question: "Does the idea of 'being someone else' turn you on because of the mystery or the freedom?", category: "Psychology", intensity: "deep" },
{ id: "role_050", deckId: "spicy_roleplay", question: "How do we bridge the gap between our 'real' selves and our 'characters'?", category: "Psychology", intensity: "deep" },

//   Category: Roleplay Wildcards
{ id: "role_051", deckId: "spicy_roleplay", question: "If you had to pick a name for my 'spicy' alter ego right now, what would it be?", category: "Wildcard", intensity: "mild" },
{ id: "role_052", deckId: "spicy_roleplay", question: "Describe your 'character's' favorite drink in 3 words.", category: "Wildcard", intensity: "mild" },
{ id: "role_053", deckId: "spicy_roleplay", question: "If we were in a Victorian romance novel, what would be our 'forbidden' act?", category: "Wildcard", intensity: "medium" },
{ id: "role_054", deckId: "spicy_roleplay", question: "What is the one thing your character would never do, even if my character begged?", category: "Wildcard", intensity: "deep" },
{ id: "role_055", deckId: "spicy_roleplay", question: "Quick! You are a strict librarian and I am making too much noise. What do you do?", category: "Wildcard", intensity: "medium" },
{ id: "role_056", deckId: "spicy_roleplay", question: "Would you ever want to try a 'Sci-Fi' or alien roleplay?", category: "Wildcard", intensity: "high" },
{ id: "role_057", deckId: "spicy_roleplay", question: "If we were 'strangers' meeting again, would you try to go home with me?", category: "Wildcard", intensity: "medium" },
{ id: "role_058", deckId: "spicy_roleplay", question: "What is the funniest role you can imagine us attempting?", category: "Wildcard", intensity: "mild" },
{ id: "role_059", deckId: "spicy_roleplay", question: "If you could stay in your 'spicy character' for 24 hours, would you?", category: "Wildcard", intensity: "high" },
{ id: "role_060", deckId: "spicy_roleplay", question: "Rate our acting skills on a scale of 1-10. Who is the Oscar winner?", category: "Wildcard", intensity: "mild" },

//   Category: Public & Risky
{ id: "nnh_001", deckId: "spicy_never_have_i", question: "Never have I ever been caught in the act by a total stranger.", category: "Risk", intensity: "high" },
{ id: "nnh_002", deckId: "spicy_never_have_i", question: "Never have I ever done it in a public bathroom.", category: "Risk", intensity: "medium" },
{ id: "nnh_003", deckId: "spicy_never_have_i", question: "Never have I ever skinny dipped in a pool that wasn't mine.", category: "Risk", intensity: "medium" },
{ id: "nnh_004", deckId: "spicy_never_have_i", question: "Never have I ever been 'intimate' in a movie theater.", category: "Risk", intensity: "medium" },
{ id: "nnh_005", deckId: "spicy_never_have_i", question: "Never have I ever done it at my place of work.", category: "Risk", intensity: "high" },
{ id: "nnh_006", deckId: "spicy_never_have_i", question: "Never have I ever had a 'quickie' while family was in the next room.", category: "Risk", intensity: "medium" },
{ id: "nnh_007", deckId: "spicy_never_have_i", question: "Never have I ever done it in the back of a moving car or Uber.", category: "Risk", intensity: "high" },
{ id: "nnh_008", deckId: "spicy_never_have_i", question: "Never have I ever been 'active' on a public beach at night.", category: "Risk", intensity: "medium" },
{ id: "nnh_009", deckId: "spicy_never_have_i", question: "Never have I ever joined the 'Mile High Club'.", category: "Risk", intensity: "high" },
{ id: "nnh_010", deckId: "spicy_never_have_i", question: "Never have I ever been kicked out of a hotel or venue for being too loud.", category: "Risk", intensity: "medium" },

//   Category: Digital & Mobile
{ id: "nnh_011", deckId: "spicy_never_have_i", question: "Never have I ever sent a spicy photo to the wrong person.", category: "Digital", intensity: "high" },
{ id: "nnh_012", deckId: "spicy_never_have_i", question: "Never have I ever filmed myself being intimate with a partner.", category: "Digital", intensity: "high" },
{ id: "nnh_013", deckId: "spicy_never_have_i", question: "Never have I ever sexted someone while I was at a boring family event.", category: "Digital", intensity: "medium" },
{ id: "nnh_014", deckId: "spicy_never_have_i", question: "Never have I ever accidentally liked a 'thirst trap' photo from years ago while stalking.", category: "Digital", intensity: "mild" },
{ id: "nnh_015", deckId: "spicy_never_have_i", question: "Never have I ever had a 'cyber-sex' session with a complete stranger.", category: "Digital", intensity: "medium" },
{ id: "nnh_016", deckId: "spicy_never_have_i", question: "Never have I ever looked through a partner's phone specifically for spicy messages.", category: "Digital", intensity: "deep" },
{ id: "nnh_017", deckId: "spicy_never_have_i", question: "Never have I ever sent a nude and immediately regretted it.", category: "Digital", intensity: "medium" },
{ id: "nnh_018", deckId: "spicy_never_have_i", question: "Never have I ever paid for a subscription-based spicy site (like OnlyFans).", category: "Digital", intensity: "medium" },
{ id: "nnh_019", deckId: "spicy_never_have_i", question: "Never have I ever Googled how to perform a specific move while the person was in the other room.", category: "Digital", intensity: "medium" },
{ id: "nnh_020", deckId: "spicy_never_have_i", question: "Never have I ever had a spicy dream about someone in this room.", category: "Digital", intensity: "high" },

//   Category: The Bedroom Secrets
{ id: "nnh_021", deckId: "spicy_never_have_i", question: "Never have I ever used food (chocolate, whipped cream, etc.) in the bedroom.", category: "Bedroom", intensity: "medium" },
{ id: "nnh_022", deckId: "spicy_never_have_i", question: "Never have I ever roleplayed as a 'stranger' with a partner.", category: "Bedroom", intensity: "medium" },
{ id: "nnh_023", deckId: "spicy_never_have_i", question: "Never have I ever faked it just to get the night over with.", category: "Bedroom", intensity: "high" },
{ id: "nnh_024", deckId: "spicy_never_have_i", question: "Never have I ever used handcuffs or some form of restraint.", category: "Bedroom", intensity: "high" },
{ id: "nnh_025", deckId: "spicy_never_have_i", question: "Never have I ever called out the wrong name during the heat of the moment.", category: "Bedroom", intensity: "high" },
{ id: "nnh_026", deckId: "spicy_never_have_i", question: "Never have I ever tried a position I saw in a movie that turned out to be impossible.", category: "Bedroom", intensity: "mild" },
{ id: "nnh_027", deckId: "spicy_never_have_i", question: "Never have I ever fallen asleep in the middle of being intimate.", category: "Bedroom", intensity: "medium" },
{ id: "nnh_028", deckId: "spicy_never_have_i", question: "Never have I ever cried during or immediately after sex.", category: "Bedroom", intensity: "deep" },
{ id: "nnh_029", deckId: "spicy_never_have_i", question: "Never have I ever used a 'prop' (not a toy) like a necktie or scarf.", category: "Bedroom", intensity: "medium" },
{ id: "nnh_030", deckId: "spicy_never_have_i", question: "Never have I ever had a 'quickie' in a place where I was 100% sure we'd be caught.", category: "Bedroom", intensity: "high" },

//   Category: Dating & History
{ id: "nnh_031", deckId: "spicy_never_have_i", question: "Never have I ever had a one-night stand with someone I didn't know the name of.", category: "History", intensity: "high" },
{ id: "nnh_032", deckId: "spicy_never_have_i", question: "Never have I ever dated someone significantly older (15+ years) than me.", category: "History", intensity: "medium" },
{ id: "nnh_033", deckId: "spicy_never_have_i", question: "Never have I ever lied about my 'body count'.", category: "History", intensity: "high" },
{ id: "nnh_034", deckId: "spicy_never_have_i", question: "Never have I ever slept with a co-worker.", category: "History", intensity: "high" },
{ id: "nnh_035", deckId: "spicy_never_have_i", question: "Never have I ever had a 'friends with benefits' situation that actually stayed platonic at the end.", category: "History", intensity: "medium" },
{ id: "nnh_036", deckId: "spicy_never_have_i", question: "Never have I ever ghosted someone immediately after a great night.", category: "History", intensity: "high" },
{ id: "nnh_037", deckId: "spicy_never_have_i", question: "Never have I ever been the 'other person' in someone else's relationship.", category: "History", intensity: "high" },
{ id: "nnh_038", deckId: "spicy_never_have_i", question: "Never have I ever hooked up with an ex just because I was lonely.", category: "History", intensity: "medium" },
{ id: "nnh_039", deckId: "spicy_never_have_i", question: "Never have I ever had a crush on a partner's best friend.", category: "History", intensity: "high" },
{ id: "nnh_040", deckId: "spicy_never_have_i", question: "Never have I ever been with more than one person in a 24-hour period.", category: "History", intensity: "high" },

//   Category: Taboo & Kink
{ id: "nnh_041", deckId: "spicy_never_have_i", question: "Never have I ever been to a strip club or a spicy lounge.", category: "Taboo", intensity: "mild" },
{ id: "nnh_042", deckId: "spicy_never_have_i", question: "Never have I ever tried 'impact play' (spanking, etc.).", category: "Taboo", intensity: "high" },
{ id: "nnh_043", deckId: "spicy_never_have_i", question: "Never have I ever had a three-way.", category: "Taboo", intensity: "high" },
{ id: "nnh_044", deckId: "spicy_never_have_i", question: "Never have I ever kissed someone of the same gender.", category: "Taboo", intensity: "medium" },
{ id: "nnh_045", deckId: "spicy_never_have_i", question: "Never have I ever used a 'blindfold' on a partner.", category: "Taboo", intensity: "medium" },
{ id: "nnh_046", deckId: "spicy_never_have_i", question: "Never have I ever been into a specific kink that I am still too shy to admit.", category: "Taboo", intensity: "high" },
{ id: "nnh_047", deckId: "spicy_never_have_i", question: "Never have I ever tried 'temperature play' with ice or wax.", category: "Taboo", intensity: "high" },
{ id: "nnh_048", deckId: "spicy_never_have_i", question: "Never have I ever fantasized about being 'taken' by a character from a book/movie.", category: "Taboo", intensity: "medium" },
{ id: "nnh_049", deckId: "spicy_never_have_i", question: "Never have I ever worn lingerie under my normal clothes for a whole day just for the thrill.", category: "Taboo", intensity: "medium" },
{ id: "nnh_050", deckId: "spicy_never_have_i", question: "Never have I ever done a 'striptease' for someone.", category: "Taboo", intensity: "medium" },

//   Category: Ultimate Confessions
{ id: "nnh_051", deckId: "spicy_never_have_i", question: "Never have I ever had a 'booty call' that I still occasionally think about.", category: "Final", intensity: "medium" },
{ id: "nnh_052", deckId: "spicy_never_have_i", question: "Never have I ever dated two people at the exact same time without them knowing.", category: "Final", intensity: "high" },
{ id: "nnh_053", deckId: "spicy_never_have_i", question: "Never have I ever accidentally seen a friend naked.", category: "Final", intensity: "medium" },
{ id: "nnh_054", deckId: "spicy_never_have_i", question: "Never have I ever 'walked in' on my parents or another couple.", category: "Final", intensity: "medium" },
{ id: "nnh_055", deckId: "spicy_never_have_i", question: "Never have I ever been into 'voyeurism' (watching others).", category: "Final", intensity: "high" },
{ id: "nnh_056", deckId: "spicy_never_have_i", question: "Never have I ever used an 'alias' when meeting someone for a hookup.", category: "Final", intensity: "medium" },
{ id: "nnh_057", deckId: "spicy_never_have_i", question: "Never have I ever had a crush on my best friend's sibling.", category: "Final", intensity: "medium" },
{ id: "nnh_058", deckId: "spicy_never_have_i", question: "Never have I ever wanted to do it with the person to my left.", category: "Final", intensity: "high" },
{ id: "nnh_059", deckId: "spicy_never_have_i", question: "Never have I ever lied during this entire game.", category: "Final", intensity: "high" },
{ id: "nnh_060", deckId: "spicy_never_have_i", question: "Never have I ever done 'it' in a shower.", category: "Final", intensity: "mild" }
];
// ───────────────────────────────────────────── 
// MARK:  - Upload Logic
// ───────────────────────────────────────────── 



/**
 * Standard upload for Modes and Decks (Individual documents)
 */
async function uploadCollection(collectionName, items) {
  if (!items || items.length === 0) {
    console.log(`  ⏩ skipped: 0 items found in ${collectionName}`);
    return;
  }

  const BATCH_SIZE = 400;
  const chunks = [];
  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    chunks.push(items.slice(i, i + BATCH_SIZE));
  }

  let totalWritten = 0;
  for (const chunk of chunks) {
    const batch = db.batch();
    chunk.forEach(item => {
      const ref = db.collection(collectionName).doc(item.id);
      batch.set(ref, item, { merge: true });
    });
    await batch.commit();
    totalWritten += chunk.length;
    console.log(`  ✅ ${collectionName}: uploaded ${totalWritten}/${items.length}`);
  }
}

/**
 * Optimized upload for Cards (Grouped by Deck into a single document)
 * This reduces Read operations from 60 per deck to just 1.
 */
async function uploadDeckCards(items) {
  if (!items || items.length === 0) {
    console.log(`  ⏩ skipped deck_cards: 0 items found`);
    return;
  }

  // 1. Group cards by deckId locally
  const deckGroups = items.reduce((acc, card) => {
    if (!acc[card.deckId]) acc[card.deckId] = [];
    acc[card.deckId].push(card);
    return acc;
  }, {});

  // 2. Upload each group as one document
  const batch = db.batch();
  const deckEntries = Object.entries(deckGroups);

  for (const [deckId, cardsInDeck] of deckEntries) {
    const ref = db.collection("deck_cards").doc(deckId);
    // We overwrite the 'cards' array entirely to ensure the seed is clean
    batch.set(ref, {
      deckId: deckId,
      cards: cardsInDeck,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    });
  }

  await batch.commit();
  console.log(`  ✅ deck_cards: grouped ${items.length} cards into ${deckEntries.length} documents.`);
}

/**
 * Optimized upload for Decks (Grouped by Mode into a single document)
 * Reduces Read operations when browsing a specific mode.
 */
async function uploadModeDecks(items) {
  if (!items || items.length === 0) {
    console.log(`  ⏩ skipped mode_decks: 0 items found`);
    return;
  }

  // 1. Group decks by modeId locally
  const modeGroups = items.reduce((acc, deck) => {
    if (!acc[deck.modeId]) acc[deck.modeId] = [];
    acc[deck.modeId].push(deck);
    return acc;
  }, {});

  // 2. Upload each group as one document in a new "mode_decks" collection
  const batch = db.batch();
  const modeEntries = Object.entries(modeGroups);

  for (const [modeId, decksInMode] of modeEntries) {
    const ref = db.collection("mode_decks").doc(modeId);

    batch.set(ref, {
      modeId: modeId,
      decks: decksInMode,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    });
  }

  await batch.commit();
  console.log(`  ✅ mode_decks: grouped ${items.length} decks into ${modeEntries.length} documents.`);
}

async function main() {
  console.log("\n🚀 Bondify — Firebase Seed Script\n");
  console.log("━".repeat(40));

  try {
    // 1. Modes stay individual (usually only 4-6 docs total, fetched once at launch)
    console.log("\n📂 Uploading modes...");
    await uploadCollection("modes", modes);

    // 2. Decks are now grouped by Mode (Optimized)
    console.log("\n📂 Uploading mode_decks (optimized)...");
    await uploadModeDecks(decks);

    // 3. Cards are grouped by Deck (Optimized)
    console.log("\n📂 Uploading deck_cards (optimized)...");
    await uploadDeckCards(cards);

    console.log("\n" + "━".repeat(40));
    console.log("🎉 All done!");
  } catch (error) {
    console.error("\n❌ Upload failed:", error);
    process.exit(1);
  }
  process.exit(0);
}

main();