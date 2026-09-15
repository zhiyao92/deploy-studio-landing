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
  { id: "chill", title: "☁️ Chill", tagline: "Relaxed & easy-going" }
];

const decks = [
  // ── CHILL ──
{ id: "chill_random_sparks", modeId: "chill", title: "🎲 Random Sparks", description: "Fun, quirky questions to pass the time", isLocked: false },
  { id: "chill_what_if", modeId: "chill", title: "🌀 What If...?", description: "Wild scenarios to spark imagination", isLocked: false },
  { id: "chill_hobbies", modeId: "chill", title: "🎨 The Lab", description: "Talk about your crafts, games, and passions", isLocked: false },
  { id: "chill_daydreaming", modeId: "chill", title: "☁️ Clouds", description: "Escapist questions for lazy afternoons", isLocked: false },
  { id: "chill_comfort_zone", modeId: "chill", title: "🛋️ Cozy Vibes", description: "What makes you feel most at peace?", isLocked: false },
  { id: "chill_aesthetic", modeId: "chill", title: "🖼️ Aesthetics", description: "Your taste in art, style, and living", isLocked: true },
  { id: "chill_travel_dreams", modeId: "chill", title: "🗺️ Wanderlust", description: "Places you'd go if money wasn't real", isLocked: true },
  { id: "chill_superpowers", modeId: "chill", title: "🦸 Hero Mode", description: "If you had one useless superpower...", isLocked: true },
];
const cards = [
  //   Category: Wild Scenarios
  { id: "scenario_001", deckId: "chill_what_if", question: "What if you woke up tomorrow with the ability to speak to animals, but you lost the ability to speak to humans?", category: "Wild", intensity: "medium" },
  { id: "scenario_002", deckId: "chill_what_if", question: "What if you were offered $10 million, but you could never use the internet again for the rest of your life?", category: "Wild", intensity: "deep" },
  { id: "scenario_003", deckId: "chill_what_if", question: "What if every time you snapped your fingers, you were transported to a random point in your past for 30 seconds?", category: "Wild", intensity: "medium" },
  { id: "scenario_004", deckId: "chill_what_if", question: "What if you could live forever, but you aged physically at a normal rate?", category: "Wild", intensity: "deep" },
  { id: "scenario_005", deckId: "chill_what_if", question: "What if you could change one event in history, knowing it might erase your own birth?", category: "Wild", intensity: "deep" },

  //   Category: Career & Life
  { id: "scenario_006", deckId: "chill_what_if", question: "What if you had to choose between being the best at a job you hate or being the worst at a job you love?", category: "Life", intensity: "medium" },
  { id: "scenario_007", deckId: "chill_what_if", question: "What if you were the first person to colonize Mars, but you could never return to Earth?", category: "Life", intensity: "medium" },
  { id: "scenario_008", deckId: "chill_what_if", question: "What if you could see 5 minutes into your own future at any time?", category: "Life", intensity: "medium" },
  { id: "scenario_009", deckId: "chill_what_if", question: "What if you could be world-famous for something embarrassing, or completely anonymous for something heroic?", category: "Life", intensity: "medium" },
  { id: "scenario_010", deckId: "chill_what_if", question: "What if you had to live the same day over and over for a year? Which day are you picking?", category: "Life", intensity: "deep" },

  //   Category: Superpowers & Tech
  { id: "scenario_011", deckId: "chill_what_if", question: "What if you had a remote control that could pause or rewind real life?", category: "Superpower", intensity: "mild" },
  { id: "scenario_012", deckId: "chill_what_if", question: "What if you could read minds, but only when people were thinking something negative about you?", category: "Superpower", intensity: "deep" },
  { id: "scenario_013", deckId: "chill_what_if", question: "What if you could download any skill into your brain instantly, but you forgot one core childhood memory each time?", category: "Superpower", intensity: "deep" },
  { id: "scenario_014", deckId: "chill_what_if", question: "What if you had a personal robot that did everything for you, but it had a really annoying personality?", category: "Superpower", intensity: "mild" },
  { id: "scenario_015", deckId: "chill_what_if", question: "What if you could teleport anywhere, but only while you were naked?", category: "Superpower", intensity: "medium" },

  //   Category: Society & Ethics
  { id: "scenario_016", deckId: "chill_what_if", question: "What if everyone's internal monologue was broadcast out loud for one hour every day?", category: "Society", intensity: "deep" },
  { id: "scenario_017", deckId: "chill_what_if", question: "What if money ceased to exist tomorrow and we went back to a barter system?", category: "Society", intensity: "medium" },
  { id: "scenario_018", deckId: "chill_what_if", question: "What if you could vote to delete one country from the map (non-violently)?", category: "Society", intensity: "deep" },
  { id: "scenario_019", deckId: "chill_what_if", question: "What if humans didn't need to sleep? How would the world change?", category: "Society", intensity: "medium" },
  { id: "scenario_020", deckId: "chill_what_if", question: "What if we discovered that aliens were real, but they were actually very boring?", category: "Society", intensity: "mild" },

  //   Category: Relationship Scenarios
  { id: "scenario_021", deckId: "chill_what_if", question: "What if you found out your partner was actually a high-level secret agent?", category: "Relationships", intensity: "medium" },
  { id: "scenario_022", deckId: "chill_what_if", question: "What if you could see a 'compatibility percentage' floating above every person you met?", category: "Relationships", intensity: "medium" },
  { id: "scenario_023", deckId: "chill_what_if", question: "What if you had to choose between your current life and a 'perfect' life with your ex?", category: "Relationships", intensity: "deep" },
  { id: "scenario_024", deckId: "chill_what_if", question: "What if you could hear what your pets actually thought about you?", category: "Relationships", intensity: "mild" },
  { id: "scenario_025", deckId: "chill_what_if", question: "What if you were the last human on Earth, but you had one working computer with internet access?", category: "Relationships", intensity: "deep" },

  { id: "scenario_026", deckId: "chill_what_if", question: "What if you could only eat one meal for the rest of your life?", category: "Random", intensity: "mild" },
  { id: "scenario_027", deckId: "chill_what_if", question: "What if you could talk to your 80-year-old self for ten minutes?", category: "Life", intensity: "medium" },
  { id: "scenario_028", deckId: "chill_what_if", question: "What if you could become any animal at will, but only for an hour at a time?", category: "Superpower", intensity: "mild" },
  { id: "scenario_029", deckId: "chill_what_if", question: "What if you won the lottery but had to give half to your worst enemy?", category: "Wild", intensity: "medium" },
  { id: "scenario_030", deckId: "chill_what_if", question: "What if you found a door in your house that led to a different dimension?", category: "Wild", intensity: "medium" },
  { id: "scenario_031", deckId: "chill_what_if", question: "What if your life was actually a reality show and you were the only one who didn't know?", category: "Society", intensity: "deep" },
  { id: "scenario_032", deckId: "chill_what_if", question: "What if you could visit any time period but only as an invisible observer?", category: "Wild", intensity: "medium" },
  { id: "scenario_033", deckId: "chill_what_if", question: "What if you could instantly master any musical instrument?", category: "Superpower", intensity: "mild" },
  { id: "scenario_034", deckId: "chill_what_if", question: "What if you had to live without any technology for a month in the woods?", category: "Life", intensity: "medium" },
  { id: "scenario_035", deckId: "chill_what_if", question: "What if you could change your eye color whenever you wanted?", category: "Random", intensity: "mild" },
  { id: "scenario_036", deckId: "chill_what_if", question: "What if your dreams were actually events happening in a parallel universe?", category: "Wild", intensity: "deep" },
  { id: "scenario_037", deckId: "chill_what_if", question: "What if you were the President for just one day?", category: "Life", intensity: "medium" },
  { id: "scenario_038", deckId: "chill_what_if", question: "What if you could never feel physical pain again?", category: "Superpower", intensity: "medium" },
  { id: "scenario_039", deckId: "chill_what_if", question: "What if you could speak every language, but only when you were whispering?", category: "Superpower", intensity: "mild" },
  { id: "scenario_040", deckId: "chill_what_if", question: "What if you found out you were the heir to a small, unknown island nation?", category: "Wild", intensity: "medium" },
  { id: "scenario_041", deckId: "chill_what_if", question: "What if you had to choose between losing all your past memories or never being able to make new ones?", category: "Life", intensity: "deep" },
  { id: "scenario_042", deckId: "chill_what_if", question: "What if you could freeze time, but you still aged while everything else was frozen?", category: "Superpower", intensity: "deep" },
  { id: "scenario_043", deckId: "chill_what_if", question: "What if you could trade five years of your life for the body of your dreams?", category: "Life", intensity: "medium" },
  { id: "scenario_044", deckId: "chill_what_if", question: "What if you were gifted a box that contained every item you've ever lost?", category: "Wild", intensity: "mild" },
  { id: "scenario_045", deckId: "chill_what_if", question: "What if you had to spend a year living in a submarine?", category: "Life", intensity: "medium" },
  { id: "scenario_046", deckId: "chill_what_if", question: "What if gravity worked differently for you than everyone else?", category: "Wild", intensity: "medium" },
  { id: "scenario_047", deckId: "chill_what_if", question: "What if you could hear the soundtrack of your life as it was playing?", category: "Wild", intensity: "mild" },
  { id: "scenario_048", deckId: "chill_what_if", question: "What if you had to spend 24 hours in a haunted house for a million dollars?", category: "Wild", intensity: "medium" },
  { id: "scenario_049", deckId: "chill_what_if", question: "What if you could cure one disease, but you had to take on its symptoms for a week?", category: "Society", intensity: "deep" },
  { id: "scenario_050", deckId: "chill_what_if", question: "What if you could re-live your favorite day, but everyone else in that memory was different?", category: "Life", intensity: "deep" },
  { id: "scenario_051", deckId: "chill_what_if", question: "What if you could always tell when someone was lying, but your nose grew like Pinocchio's when you lied?", category: "Superpower", intensity: "medium" },
  { id: "scenario_052", deckId: "chill_what_if", question: "What if the world was flat? How would travel change?", category: "Society", intensity: "mild" },
  { id: "scenario_053", deckId: "chill_what_if", question: "What if you had to name a new color? What would you call it?", category: "Random", intensity: "mild" },
  { id: "scenario_054", deckId: "chill_what_if", question: "What if your reflection started acting independently of you?", category: "Wild", intensity: "deep" },
  { id: "scenario_055", deckId: "chill_what_if", question: "What if you were forced to marry the last person you texted?", category: "Relationships", intensity: "medium" },
  { id: "scenario_056", deckId: "chill_what_if", question: "What if you could create a new holiday? What would we celebrate?", category: "Society", intensity: "mild" },
  { id: "scenario_057", deckId: "chill_what_if", question: "What if you could breathe underwater, but you could no longer breathe on land?", category: "Superpower", intensity: "deep" },
  { id: "scenario_058", deckId: "chill_what_if", question: "What if you had to pick a celebrity to be your parent?", category: "Random", intensity: "mild" },
  { id: "scenario_059", deckId: "chill_what_if", question: "What if you could trade your sense of smell for the ability to fly?", category: "Superpower", intensity: "medium" },
  { id: "scenario_060", deckId: "chill_what_if", question: "What if you found out you were a character in a book someone was writing right now?", category: "Life", intensity: "deep" },

  //   Category: Quirky Habits
  { id: "spk_rand_001", deckId: "chill_random_sparks", question: "What is the weirdest food combination you actually enjoy?", category: "Habits", intensity: "mild" },
  { id: "spk_rand_002", deckId: "chill_random_sparks", question: "Do you have any 'old person' habits despite your actual age?", category: "Habits", intensity: "mild" },
  { id: "spk_rand_003", deckId: "chill_random_sparks", question: "What is the most useless thing you have memorized?", category: "Habits", intensity: "mild" },
  { id: "spk_rand_004", deckId: "chill_random_sparks", question: "Do you talk to yourself when you're alone? If so, what about?", category: "Habits", intensity: "medium" },
  { id: "spk_rand_005", deckId: "chill_random_sparks", question: "What’s a 'guilty pleasure' movie that you know is bad but you love anyway?", category: "Habits", intensity: "mild" },
  { id: "spk_rand_006", deckId: "chill_random_sparks", question: "What is the strangest thing you believed as a child?", category: "Habits", intensity: "mild" },
  { id: "spk_rand_007", deckId: "chill_random_sparks", question: "How do you organize your phone apps—by color, category, or total chaos?", category: "Habits", intensity: "mild" },
  { id: "spk_rand_008", deckId: "chill_random_sparks", question: "What is your go-to 'uncomfortable silence' conversation starter?", category: "Habits", intensity: "medium" },
  { id: "spk_rand_009", deckId: "chill_random_sparks", question: "If you were a ghost, who is the first person you’d mildly annoy?", category: "Habits", intensity: "mild" },
  { id: "spk_rand_010", deckId: "chill_random_sparks", question: "What is the most niche topic you could give a 30-minute presentation on with zero prep?", category: "Habits", intensity: "medium" },

  //   Category: Petty Pet Peeves
  { id: "spk_rand_011", deckId: "chill_random_sparks", question: "What is a minor inconvenience that fills you with irrational rage?", category: "Pet Peeves", intensity: "medium" },
  { id: "spk_rand_012", deckId: "chill_random_sparks", question: "Is there a specific word that you absolutely hate the sound of?", category: "Pet Peeves", intensity: "mild" },
  { id: "spk_rand_013", deckId: "chill_random_sparks", question: "What is the worst fashion trend you actually participated in?", category: "Pet Peeves", intensity: "mild" },
  { id: "spk_rand_014", deckId: "chill_random_sparks", question: "What’s a 'small talk' question you wish was banned from society?", category: "Pet Peeves", intensity: "medium" },
  { id: "spk_rand_015", deckId: "chill_random_sparks", question: "Do you prefer it when people text first or call without warning?", category: "Pet Peeves", intensity: "mild" },

  //   Category: Random Preferences
  { id: "spk_rand_016", deckId: "chill_random_sparks", question: "If you could only use one emoji for the rest of your life, which would it be?", category: "Preferences", intensity: "mild" },
  { id: "spk_rand_017", deckId: "chill_random_sparks", question: "Would you rather always be 10 minutes late or 20 minutes early?", category: "Preferences", intensity: "mild" },
  { id: "spk_rand_018", deckId: "chill_random_sparks", question: "Are you a 'wear shoes in the house' person or a 'strictly no shoes' person?", category: "Preferences", intensity: "mild" },
  { id: "spk_rand_019", deckId: "chill_random_sparks", question: "What is the best 'bad' smell (e.g., gasoline, old books, hardware stores)?", category: "Preferences", intensity: "mild" },
  { id: "spk_rand_020", deckId: "chill_random_sparks", question: "If you could win a lifetime supply of any one snack, what are you choosing?", category: "Preferences", intensity: "mild" },

  //   Category: Deepish Sparks
  { id: "spk_rand_021", deckId: "chill_random_sparks", question: "What is the most 'random' act of kindness you’ve ever witnessed?", category: "Deepish", intensity: "medium" },
  { id: "spk_rand_022", deckId: "chill_random_sparks", question: "What is a hobby you’ve always wanted to pick up but haven’t yet?", category: "Deepish", intensity: "medium" },
  { id: "spk_rand_023", deckId: "chill_random_sparks", question: "If you had to move to a city you’ve never visited, where would you go?", category: "Deepish", intensity: "medium" },
  { id: "spk_rand_024", deckId: "chill_random_sparks", question: "What is the most 'out of character' thing you’ve done recently?", category: "Deepish", intensity: "deep" },
  { id: "spk_rand_025", deckId: "chill_random_sparks", question: "Who is the most interesting stranger you’ve ever had a conversation with?", category: "Deepish", intensity: "medium" },
  { id: "spk_rand_026", deckId: "chill_random_sparks", question: "If you could see one statistic floating above everyone’s head, what would it be?", category: "Deepish", intensity: "deep" },
  { id: "spk_rand_027", deckId: "chill_random_sparks", question: "What is the most expensive thing you’ve ever broken?", category: "Deepish", intensity: "medium" },
  { id: "spk_rand_028", deckId: "chill_random_sparks", question: "If you had to change your name, what would your new 'identity' be?", category: "Deepish", intensity: "medium" },
  { id: "spk_rand_029", deckId: "chill_random_sparks", question: "What is the most common misconception people have about you?", category: "Deepish", intensity: "deep" },
  { id: "spk_rand_030", deckId: "chill_random_sparks", question: "If you could spend a day in someone else’s shoes, whose would they be?", category: "Deepish", intensity: "medium" },

  { id: "spk_rand_031", deckId: "chill_random_sparks", question: "What's your go-to song when you are given the aux cord?", category: "Vibe", intensity: "mild" },
  { id: "spk_rand_032", deckId: "chill_random_sparks", question: "Which fictional character do you most identify with?", category: "Vibe", intensity: "medium" },
  { id: "spk_rand_033", deckId: "chill_random_sparks", question: "What is the most overrated travel destination you've been to?", category: "Travel", intensity: "medium" },
  { id: "spk_rand_034", deckId: "chill_random_sparks", question: "Do you believe in ghosts or aliens more?", category: "Beliefs", intensity: "mild" },
  { id: "spk_rand_035", deckId: "chill_random_sparks", question: "What is your 'Roman Empire'?", category: "Vibe", intensity: "medium" },
  { id: "spk_rand_036", deckId: "chill_random_sparks", question: "If you were a pro wrestler, what would your entrance theme be?", category: "Vibe", intensity: "mild" },
  { id: "spk_rand_037", deckId: "chill_random_sparks", question: "What is the best piece of useless advice you've ever received?", category: "Habits", intensity: "mild" },
  { id: "spk_rand_038", deckId: "chill_random_sparks", question: "What’s the most 'Gen Z' thing about you?", category: "Identity", intensity: "mild" },
  { id: "spk_rand_039", deckId: "chill_random_sparks", question: "If you had to live inside a video game for a week, which one are you picking?", category: "Vibe", intensity: "medium" },
  { id: "spk_rand_040", deckId: "chill_random_sparks", question: "What is your secret talent that no one in this room knows about?", category: "Identity", intensity: "medium" },
  { id: "spk_rand_041", deckId: "chill_random_sparks", question: "What was your first ever screen name or email address?", category: "Habits", intensity: "mild" },
  { id: "spk_rand_042", deckId: "chill_random_sparks", question: "What’s the weirdest gift you’ve ever received?", category: "Habits", intensity: "mild" },
  { id: "spk_rand_043", deckId: "chill_random_sparks", question: "If you could delete one social media platform from existence, which would it be?", category: "Preferences", intensity: "medium" },
  { id: "spk_rand_044", deckId: "chill_random_sparks", question: "What is your favorite 'low-stakes' conspiracy theory?", category: "Beliefs", intensity: "mild" },
  { id: "spk_rand_045", deckId: "chill_random_sparks", question: "Which 'as seen on TV' product have you actually bought?", category: "Habits", intensity: "mild" },
  { id: "spk_rand_046", deckId: "chill_random_sparks", question: "What is the longest you’ve ever gone without sleep?", category: "Habits", intensity: "medium" },
  { id: "spk_rand_047", deckId: "chill_random_sparks", question: "What’s your signature dish when you’re trying to impress someone?", category: "Preferences", intensity: "mild" },
  { id: "spk_rand_048", deckId: "chill_random_sparks", question: "If you could have any animal as a perfectly tame pet, what would it be?", category: "Preferences", intensity: "mild" },
  { id: "spk_rand_049", deckId: "chill_random_sparks", question: "What is the most boring superpower you can imagine?", category: "Vibe", intensity: "mild" },
  { id: "spk_rand_050", deckId: "chill_random_sparks", question: "Do you have a 'customer service voice'?", category: "Habits", intensity: "medium" },
  { id: "spk_rand_051", deckId: "chill_random_sparks", question: "What’s the most 'impulse' purchase you’ve made lately?", category: "Habits", intensity: "medium" },
  { id: "spk_rand_052", deckId: "chill_random_sparks", question: "Which song do you always have to sing along to?", category: "Preferences", intensity: "mild" },
  { id: "spk_rand_053", deckId: "chill_random_sparks", question: "If you could speak any language fluently overnight, which would it be?", category: "Preferences", intensity: "mild" },
  { id: "spk_rand_054", deckId: "chill_random_sparks", question: "What is the most 'middle-aged' thing you’ve done recently?", category: "Habits", intensity: "medium" },
  { id: "spk_rand_055", deckId: "chill_random_sparks", question: "If you were to write an autobiography, what would the title be?", category: "Identity", intensity: "deep" },
  { id: "spk_rand_056", deckId: "chill_random_sparks", question: "What is your favorite way to spend a rainy Sunday?", category: "Preferences", intensity: "mild" },
  { id: "spk_rand_057", deckId: "chill_random_sparks", question: "What’s the most ridiculous thing you’ve seen at a park?", category: "Habits", intensity: "mild" },
  { id: "spk_rand_058", deckId: "chill_random_sparks", question: "If you could meet your future self, what one question would you ask?", category: "Identity", intensity: "deep" },
  { id: "spk_rand_059", deckId: "chill_random_sparks", question: "What is the most satisfying thing to you?", category: "Preferences", intensity: "medium" },
  { id: "spk_rand_060", deckId: "chill_random_sparks", question: "If you could swap lives with any animal for 24 hours, what would you be?", category: "Vibe", intensity: "mild" },

  //   Category: Creative Outlets
  { id: "lab_001", deckId: "chill_hobbies", question: "What is a craft or skill you picked up during a hyper-fixation that you still actually use?", category: "Creative", intensity: "mild" },
  { id: "lab_002", deckId: "chill_hobbies", question: "If you had an unlimited budget for a 'hobby room,' what would be the centerpiece?", category: "Creative", intensity: "mild" },
  { id: "lab_003", deckId: "chill_hobbies", question: "Are you a 'master of one' or a 'jack of all trades' when it comes to hobbies?", category: "Creative", intensity: "medium" },
  { id: "lab_004", deckId: "chill_hobbies", question: "What is the most 'aesthetic' thing you've ever made with your own hands?", category: "Creative", intensity: "mild" },
  { id: "lab_005", deckId: "chill_hobbies", question: "Do you prefer hobbies that produce a physical result (like art) or an experience (like gaming)?", category: "Creative", intensity: "medium" },
  { id: "lab_006", deckId: "chill_hobbies", question: "What is the 'ugliest' thing you've ever made that you refuse to throw away?", category: "Creative", intensity: "mild" },
  { id: "lab_007", deckId: "chill_hobbies", question: "Which hobby makes you lose all track of time?", category: "Creative", intensity: "medium" },
  { id: "lab_008", deckId: "chill_hobbies", question: "If you could instantly be world-class at any art form, which would it be?", category: "Creative", intensity: "mild" },
  { id: "lab_009", deckId: "chill_hobbies", question: "Do you listen to podcasts/music while working on your hobbies or do you need focus?", category: "Creative", intensity: "mild" },
  { id: "lab_010", deckId: "chill_hobbies", question: "What is your favorite 'low-stakes' creative activity?", category: "Creative", intensity: "mild" },

  //   Category: Collections & Cravings
  { id: "lab_011", deckId: "chill_hobbies", question: "What is the most 'unusual' thing you’ve ever collected?", category: "Collecting", intensity: "mild" },
  { id: "lab_012", deckId: "chill_hobbies", question: "If you had to start a museum of your own life, what three items are in the first exhibit?", category: "Collecting", intensity: "medium" },
  { id: "lab_013", deckId: "chill_hobbies", question: "Is there something you buy every time you see it, even if you already have ten?", category: "Collecting", intensity: "mild" },
  { id: "lab_014", deckId: "chill_hobbies", question: "What is the 'holy grail' item you’re currently hunting for your collection?", category: "Collecting", intensity: "medium" },
  { id: "lab_015", deckId: "chill_hobbies", question: "Digital vs. Physical: Do you prefer collecting files/games or tangible objects?", category: "Collecting", intensity: "mild" },
  { id: "lab_016", deckId: "chill_hobbies", question: "What’s the most you’ve ever spent on a single hobby-related item?", category: "Collecting", intensity: "medium" },
  { id: "lab_017", deckId: "chill_hobbies", question: "Do you enjoy the hunt for an item more than actually owning it?", category: "Collecting", intensity: "medium" },
  { id: "lab_018", deckId: "chill_hobbies", question: "What is an 'invisible' collection you have (like screenshots or voice notes)?", category: "Collecting", intensity: "mild" },
  { id: "lab_019", deckId: "chill_hobbies", question: "Who is the most supportive person when it comes to your niche interests?", category: "Collecting", intensity: "medium" },
  { id: "lab_020", deckId: "chill_hobbies", question: "What is the oldest thing you own that still brings you joy?", category: "Collecting", intensity: "mild" },

  //   Category: Gaming & Technical
  { id: "lab_021", deckId: "chill_hobbies", question: "What is your 'comfort game' that you play when you’re stressed?", category: "Gaming", intensity: "mild" },
  { id: "lab_022", deckId: "chill_hobbies", question: "PC, Console, or Mobile? Defend your platform of choice.", category: "Gaming", intensity: "mild" },
  { id: "lab_023", deckId: "chill_hobbies", question: "What is the most difficult boss or level you’ve ever conquered?", category: "Gaming", intensity: "medium" },
  { id: "lab_024", deckId: "chill_hobbies", question: "Do you prefer competitive multiplayer or a deep single-player story?", category: "Gaming", intensity: "medium" },
  { id: "lab_025", deckId: "chill_hobbies", question: "What is a 'technical' skill (like coding or mechanics) you learned just for fun?", category: "Technical", intensity: "mild" },
  { id: "lab_026", deckId: "chill_hobbies", question: "If you could live inside the world of one game for a week, which would it be?", category: "Gaming", intensity: "mild" },
  { id: "lab_027", deckId: "chill_hobbies", question: "What is the most 'nerdy' argument you’re willing to have?", category: "Technical", intensity: "medium" },
  { id: "lab_028", deckId: "chill_hobbies", question: "Have you ever 'modded' or customized something you own to make it better?", category: "Technical", intensity: "medium" },
  { id: "lab_029", deckId: "chill_hobbies", question: "What is your #1 'quality of life' tech hack?", category: "Technical", intensity: "mild" },
  { id: "lab_030", deckId: "chill_hobbies", question: "What is a piece of gear you own that makes you feel like a professional?", category: "Technical", intensity: "mild" },

  //   Category: Niche Obsessions
  { id: "lab_031", deckId: "chill_hobbies", question: "What is a 'weird' Wikipedia rabbit hole you fell down recently?", category: "Niche", intensity: "mild" },
  { id: "lab_032", deckId: "chill_hobbies", question: "What is a topic you know way too much about that rarely comes up in conversation?", category: "Niche", intensity: "medium" },
  { id: "lab_033", deckId: "chill_hobbies", question: "If you had to teach a class on one obscure subject, what would it be?", category: "Niche", intensity: "medium" },
  { id: "lab_034", deckId: "chill_hobbies", question: "What is your favorite 'documentary' subject?", category: "Niche", intensity: "mild" },
  { id: "lab_035", deckId: "chill_hobbies", question: "Is there a specific 'era' of history you are low-key obsessed with?", category: "Niche", intensity: "mild" },
  { id: "lab_036", deckId: "chill_hobbies", question: "What is the most 'useless' but fascinating fact you know?", category: "Niche", intensity: "mild" },
  { id: "lab_037", deckId: "chill_hobbies", question: "What is a 'subculture' you find interesting but aren't actually a part of?", category: "Niche", intensity: "medium" },
  { id: "lab_038", deckId: "chill_hobbies", question: "What is the most niche subreddit or forum you follow?", category: "Niche", intensity: "mild" },
  { id: "lab_039", deckId: "chill_hobbies", question: "What’s an 'expert' skill you’ve learned purely from YouTube?", category: "Niche", intensity: "mild" },
  { id: "lab_040", deckId: "chill_hobbies", question: "If you could travel back in time to see one event just to know the 'truth' of it, what would it be?", category: "Niche", intensity: "medium" },

  //   Category: Growth & Future Skills
  { id: "lab_041", deckId: "chill_hobbies", question: "What is a hobby you’ve 'retired' from, and why?", category: "Growth", intensity: "medium" },
  { id: "lab_042", deckId: "chill_hobbies", question: "What is a skill you’re currently 'bad' at but determined to learn?", category: "Growth", intensity: "mild" },
  { id: "lab_043", deckId: "chill_hobbies", question: "If you could download one new language into your brain right now, which one?", category: "Growth", intensity: "mild" },
  { id: "lab_044", deckId: "chill_hobbies", question: "What is the most 'scary' hobby you want to try (like skydiving or public speaking)?", category: "Growth", intensity: "medium" },
  { id: "lab_045", deckId: "chill_hobbies", question: "Do your hobbies help you with your career, or are they a total escape from it?", category: "Growth", intensity: "medium" },
  { id: "lab_046", deckId: "chill_hobbies", question: "What is the best piece of advice for a 'beginner' in your favorite hobby?", category: "Growth", intensity: "mild" },
  { id: "lab_047", deckId: "chill_hobbies", question: "How do you handle the 'frustration' phase of learning something new?", category: "Growth", intensity: "medium" },
  { id: "lab_048", deckId: "chill_hobbies", question: "What hobby did you think was 'lame' as a kid but love as an adult?", category: "Growth", intensity: "mild" },
  { id: "lab_049", deckId: "chill_hobbies", question: "What is your 'dream' project that you plan to start in the next 5 years?", category: "Growth", intensity: "medium" },
  { id: "lab_050", deckId: "chill_hobbies", question: "What is the one thing you want to be known for 'outside of work'?", category: "Growth", intensity: "deep" },

  //   Category: The Vibe
  { id: "lab_051", deckId: "chill_hobbies", question: "Show & Tell: What is the most interesting thing you have in your pockets/bag right now?", category: "Vibe", intensity: "mild" },
  { id: "lab_052", deckId: "chill_hobbies", question: "What is your 'signature' creative style in one word?", category: "Vibe", intensity: "medium" },
  { id: "lab_053", deckId: "chill_hobbies", question: "Do you prefer to do your hobbies alone or with a community?", category: "Vibe", intensity: "mild" },
  { id: "lab_054", deckId: "chill_hobbies", question: "What is the 'chillest' hobby you can imagine?", category: "Vibe", intensity: "mild" },
  { id: "lab_055", deckId: "chill_hobbies", question: "If you had to pick a 'mascot' for your personality, what would it be?", category: "Vibe", intensity: "mild" },
  { id: "lab_056", deckId: "chill_hobbies", question: "What is the most 'satisfying' sound associated with your hobby?", category: "Vibe", intensity: "mild" },
  { id: "lab_057", deckId: "chill_hobbies", question: "What is your favorite 'low-power' way to spend an evening?", category: "Vibe", intensity: "mild" },
  { id: "lab_058", deckId: "chill_hobbies", question: "If you could open a small shop for anything, what would you sell?", category: "Vibe", intensity: "medium" },
  { id: "lab_059", deckId: "chill_hobbies", question: "What is the biggest lesson a hobby has taught you about life?", category: "Vibe", intensity: "deep" },
  { id: "lab_060", deckId: "chill_hobbies", question: "If your life was a video game, what would your 'XP' levels be highest in?", category: "Vibe", intensity: "medium" },

  //   Category: Escapist Dreams
  { id: "cloud_001", deckId: "chill_daydreaming", question: "If you could retire tomorrow to a small cottage anywhere, where would it be?", category: "Escapism", intensity: "mild" },
  { id: "cloud_002", deckId: "chill_daydreaming", question: "What is the one 'luxury' you would have in your dream house if money didn't matter?", category: "Escapism", intensity: "mild" },
  { id: "cloud_003", deckId: "chill_daydreaming", question: "If you could restart your life in a different century, which one would you choose?", category: "Escapism", intensity: "medium" },
  { id: "cloud_004", deckId: "chill_daydreaming", question: "What would you do if you were the last person left on Earth for exactly one week?", category: "Escapism", intensity: "medium" },
  { id: "cloud_005", deckId: "chill_daydreaming", question: "If you could be an anonymous hero who saves the day once a year, what would your 'act' be?", category: "Escapism", intensity: "medium" },
  { id: "cloud_006", deckId: "chill_daydreaming", question: "What's a 'fantasy' career you'd love to try if you knew you'd be successful?", category: "Escapism", intensity: "mild" },
  { id: "cloud_007", deckId: "chill_daydreaming", question: "If you could communicate with only one species of animal, which would it be?", category: "Escapism", intensity: "mild" },
  { id: "cloud_008", deckId: "chill_daydreaming", question: "What's the most peaceful scene you can imagine in your head right now?", category: "Escapism", intensity: "mild" },
  { id: "cloud_009", deckId: "chill_daydreaming", question: "If you could have a 'secret door' in your house, where would it lead?", category: "Escapism", intensity: "medium" },
  { id: "cloud_010", deckId: "chill_daydreaming", question: "If you were a character in a Studio Ghibli movie, what would your daily life look like?", category: "Escapism", intensity: "mild" },

  //   Category: Alternate Realities
  { id: "cloud_011", deckId: "chill_daydreaming", question: "What if you woke up and everyone spoke in song? What would be your first lyric?", category: "Imagination", intensity: "mild" },
  { id: "cloud_012", deckId: "chill_daydreaming", question: "In a parallel universe where you are a villain, what is your origin story?", category: "Imagination", intensity: "medium" },
  { id: "cloud_013", deckId: "chill_daydreaming", question: "If you could see 'alternate versions' of your life, which choice would you check on first?", category: "Imagination", intensity: "deep" },
  { id: "cloud_014", deckId: "chill_daydreaming", question: "What if we lived in a world where your hair changed color based on your mood?", category: "Imagination", intensity: "mild" },
  { id: "cloud_015", deckId: "chill_daydreaming", question: "If you could give one 'life rule' to every human on Earth, what would it be?", category: "Imagination", intensity: "medium" },
  { id: "cloud_016", deckId: "chill_daydreaming", question: "What if you could 'save' a point in your life and reload it if things went wrong?", category: "Imagination", intensity: "medium" },
  { id: "cloud_017", deckId: "chill_daydreaming", question: "If you were an AI, what would be the first thing you'd search for?", category: "Imagination", intensity: "mild" },
  { id: "cloud_018", deckId: "chill_daydreaming", question: "What if money was replaced with 'kindness points'? How rich would you be?", category: "Imagination", intensity: "deep" },
  { id: "cloud_019", deckId: "chill_daydreaming", question: "If you were a deity of something minor (like 'The Deity of Found Keys'), what would your followers do to worship you?", category: "Imagination", intensity: "mild" },
  { id: "cloud_020", deckId: "chill_daydreaming", question: "What if the world was in black and white, and only you could see one color?", category: "Imagination", intensity: "medium" },

  //   Category: Career & Life Dreams
  { id: "cloud_021", deckId: "chill_daydreaming", question: "If you could open a business that only made people happy (no profit required), what would it be?", category: "Career", intensity: "mild" },
  { id: "cloud_022", deckId: "chill_daydreaming", question: "What is your 'pipe dream' that you know will never happen but you love thinking about?", category: "Career", intensity: "medium" },
  { id: "cloud_023", deckId: "chill_daydreaming", question: "If you could be the world's leading expert on something useless, what would it be?", category: "Career", intensity: "mild" },
  { id: "cloud_024", deckId: "chill_daydreaming", question: "What would you do with your life if the internet was permanently deleted tomorrow?", category: "Career", intensity: "deep" },
  { id: "cloud_025", deckId: "chill_daydreaming", question: "If you were a professional 'taster' for a living, what would you want to taste?", category: "Career", intensity: "mild" },
  { id: "cloud_026", deckId: "chill_daydreaming", question: "What is the 'coolest' job title you can imagine?", category: "Career", intensity: "mild" },
  { id: "cloud_027", deckId: "chill_daydreaming", question: "If you could switch lives with a fictional character for a year, who would it be?", category: "Career", intensity: "medium" },
  { id: "cloud_028", deckId: "chill_daydreaming", question: "What would your 'signature' move be if you were a famous performer?", category: "Career", intensity: "mild" },
  { id: "cloud_029", deckId: "chill_daydreaming", question: "If you had a personal theme song that played whenever you walked into a room, what would it be?", category: "Career", intensity: "mild" },
  { id: "cloud_030", deckId: "chill_daydreaming", question: "What is the most 'legendary' version of your future self like?", category: "Career", intensity: "deep" },

  //   Category: Magical Realism
  { id: "cloud_031", deckId: "chill_daydreaming", question: "If you found an egg that was going to hatch into a mythical creature, which one would you hope for?", category: "Magic", intensity: "mild" },
  { id: "cloud_032", deckId: "chill_daydreaming", question: "If you could cast one 'low-level' spell (like making your coffee never go cold), what would it be?", category: "Magic", intensity: "mild" },
  { id: "cloud_033", deckId: "chill_daydreaming", question: "What if your shadow was alive and you could talk to it?", category: "Magic", intensity: "medium" },
  { id: "cloud_034", deckId: "chill_daydreaming", question: "If you could trade five years of your life for the ability to fly, would you?", category: "Magic", intensity: "deep" },
  { id: "cloud_035", deckId: "chill_daydreaming", question: "What if you could 'mute' people in real life for 10 minutes at a time?", category: "Magic", intensity: "medium" },
  { id: "cloud_036", deckId: "chill_daydreaming", question: "If you could see a floating 'status bar' above your head, what information would it show?", category: "Magic", intensity: "medium" },
  { id: "cloud_037", deckId: "chill_daydreaming", question: "What if you could summon one person (dead or alive) just for a 5-minute conversation once a month?", category: "Magic", intensity: "deep" },
  { id: "cloud_038", deckId: "chill_daydreaming", question: "If you could breathe underwater, what’s the first thing you’d go look for?", category: "Magic", intensity: "mild" },
  { id: "cloud_039", deckId: "chill_daydreaming", question: "What if you could change your appearance like a video game character customization screen?", category: "Magic", intensity: "medium" },
  { id: "cloud_040", deckId: "chill_daydreaming", question: "If you could pause time for everyone but yourself for one hour a day, how would you spend it?", category: "Magic", intensity: "medium" },

  //   Category: Quiet Reflections
  { id: "cloud_041", deckId: "chill_daydreaming", question: "When you close your eyes and think of 'peace,' what is the first image that appears?", category: "Quiet", intensity: "deep" },
  { id: "cloud_042", deckId: "chill_daydreaming", question: "Do you ever daydream about a conversation you’ll probably never have?", category: "Quiet", intensity: "medium" },
  { id: "cloud_043", deckId: "chill_daydreaming", question: "What is a 'childish' wonder you hope you never grow out of?", category: "Quiet", intensity: "medium" },
  { id: "cloud_044", deckId: "chill_daydreaming", question: "If you were a color, which one would represent your inner thoughts?", category: "Quiet", intensity: "mild" },
  { id: "cloud_045", deckId: "chill_daydreaming", question: "What is the most beautiful 'what if' in your life right now?", category: "Quiet", intensity: "deep" },
  { id: "cloud_046", deckId: "chill_daydreaming", question: "Do you believe your daydreams are messages from your subconscious or just static?", category: "Quiet", intensity: "deep" },
  { id: "cloud_047", deckId: "chill_daydreaming", question: "If you could relive your favorite memory, but only as a ghost watching, would you?", category: "Quiet", intensity: "deep" },
  { id: "cloud_048", deckId: "chill_daydreaming", question: "What is a 'secret' place in your mind you go to when you’re bored?", category: "Quiet", intensity: "medium" },
  { id: "cloud_049", deckId: "chill_daydreaming", question: "If you could see the soundtrack of your thoughts, what genre would it be?", category: "Quiet", intensity: "mild" },
  { id: "cloud_050", deckId: "chill_daydreaming", question: "In one word, what is the 'vibe' of your favorite daydream?", category: "Quiet", intensity: "medium" },

  //   Category: Wildcards
  { id: "cloud_051", deckId: "chill_daydreaming", question: "If you could be the world-record holder for anything (no matter how silly), what would it be?", category: "Wildcard", intensity: "mild" },
  { id: "cloud_052", deckId: "chill_daydreaming", question: "What if you won a planet in a lottery? What would you name it?", category: "Wildcard", intensity: "mild" },
  { id: "cloud_053", deckId: "chill_daydreaming", question: "If you could spend a day in someone else’s body, whose would it be?", category: "Wildcard", intensity: "medium" },
  { id: "cloud_054", deckId: "chill_daydreaming", question: "What if you could instantly master one musical instrument right now?", category: "Wildcard", intensity: "mild" },
  { id: "cloud_055", deckId: "chill_daydreaming", question: "If you were a flavor, what would you taste like?", category: "Wildcard", intensity: "mild" },
  { id: "cloud_056", deckId: "chill_daydreaming", question: "What if you could turn into any animal, but only while you were laughing?", category: "Wildcard", intensity: "mild" },
  { id: "cloud_057", deckId: "chill_daydreaming", question: "If you could create a new law of physics, what would it be?", category: "Wildcard", intensity: "medium" },
  { id: "cloud_058", deckId: "chill_daydreaming", question: "What if your dreams were broadcast on a TV channel for everyone to see?", category: "Wildcard", intensity: "high" },
  { id: "cloud_059", deckId: "chill_daydreaming", question: "If you could have a conversation with your 8-year-old self, what would you apologize for?", category: "Wildcard", intensity: "deep" },
  { id: "cloud_060", deckId: "chill_daydreaming", question: "What's the very next thing you're going to daydream about after this?", category: "Wildcard", intensity: "mild" },

  //   Category: Sensory Comfort
  { id: "cozy_001", deckId: "chill_comfort_zone", question: "What is the specific 'vibe' of your ideal lazy Sunday morning?", category: "Sensory", intensity: "mild" },
  { id: "cozy_002", deckId: "chill_comfort_zone", question: "Rain hitting the roof or the sound of a crackling fireplace?", category: "Sensory", intensity: "mild" },
  { id: "cozy_003", deckId: "chill_comfort_zone", question: "What is the most comfortable item of clothing you own?", category: "Sensory", intensity: "mild" },
  { id: "cozy_004", deckId: "chill_comfort_zone", question: "What scent instantly makes you feel like you can finally breathe and relax?", category: "Sensory", intensity: "mild" },
  { id: "cozy_005", deckId: "chill_comfort_zone", question: "Freshly laundered sheets or a warm towel out of the dryer?", category: "Sensory", intensity: "mild" },
  { id: "cozy_006", deckId: "chill_comfort_zone", question: "What is your 'comfort' temperature for a room?", category: "Sensory", intensity: "mild" },
  { id: "cozy_007", deckId: "chill_comfort_zone", question: "If you could live in a permanent state of one season’s weather, which would it be?", category: "Sensory", intensity: "medium" },
  { id: "cozy_008", deckId: "chill_comfort_zone", question: "What is the softest thing you’ve ever touched?", category: "Sensory", intensity: "mild" },
  { id: "cozy_009", deckId: "chill_comfort_zone", question: "Do you prefer low, warm lighting or natural sunlight filling a room?", category: "Sensory", intensity: "mild" },
  { id: "cozy_010", deckId: "chill_comfort_zone", question: "What is your ultimate 'comfort drink' (hot or cold)?", category: "Sensory", intensity: "mild" },

  //   Category: Home Sanctuary
  { id: "cozy_011", deckId: "chill_comfort_zone", question: "What is your favorite corner of your home and why?", category: "Home", intensity: "mild" },
  { id: "cozy_012", deckId: "chill_comfort_zone", question: "If you could have a 'reading nook' anywhere in the world, where would it be?", category: "Home", intensity: "mild" },
  { id: "cozy_013", deckId: "chill_comfort_zone", question: "Are you a 'minimalist' or a 'maximalist' when it comes to cozying up your space?", category: "Home", intensity: "medium" },
  { id: "cozy_014", deckId: "chill_comfort_zone", question: "What is one object in your house that holds the most sentimental 'safe' value?", category: "Home", intensity: "medium" },
  { id: "cozy_015", deckId: "chill_comfort_zone", question: "Do you prefer a perfectly clean house or 'organized chaos' to feel at home?", category: "Home", intensity: "medium" },
  { id: "cozy_016", deckId: "chill_comfort_zone", question: "If you could design a secret room for relaxation, what would be in it?", category: "Home", intensity: "medium" },
  { id: "cozy_017", deckId: "chill_comfort_zone", question: "What is the first thing you do the moment you walk through your front door?", category: "Home", intensity: "mild" },
  { id: "cozy_018", deckId: "chill_comfort_zone", question: "Plants, candles, or books: which is the most essential for a cozy room?", category: "Home", intensity: "mild" },
  { id: "cozy_019", deckId: "chill_comfort_zone", question: "What’s your 'house uniform' (the clothes you change into immediately)?", category: "Home", intensity: "mild" },
  { id: "cozy_020", deckId: "chill_comfort_zone", question: "If your home was a sanctuary for a specific animal, which animal would live there?", category: "Home", intensity: "mild" },

  //   Category: Self-Care Rituals
  { id: "cozy_021", deckId: "chill_comfort_zone", question: "What is your #1 'mental health' ritual when the world gets too loud?", category: "Self-Care", intensity: "deep" },
  { id: "cozy_022", deckId: "chill_comfort_zone", question: "Do you prefer a long hot bath or a refreshing morning shower?", category: "Self-Care", intensity: "mild" },
  { id: "cozy_023", deckId: "chill_comfort_zone", question: "What is one 'small win' you try to achieve every single day?", category: "Self-Care", intensity: "medium" },
  { id: "cozy_024", deckId: "chill_comfort_zone", question: "How do you 'unplug'—do you go for a walk, read, or just stare at a wall?", category: "Self-Care", intensity: "medium" },
  { id: "cozy_025", deckId: "chill_comfort_zone", question: "What is a 'childish' way you still soothe yourself?", category: "Self-Care", intensity: "medium" },
  { id: "cozy_026", deckId: "chill_comfort_zone", question: "How many hours of 'alone time' do you need per week to stay sane?", category: "Self-Care", intensity: "medium" },
  { id: "cozy_027", deckId: "chill_comfort_zone", question: "What’s your favorite way to 'treat yourself' that costs zero dollars?", category: "Self-Care", intensity: "mild" },
  { id: "cozy_028", deckId: "chill_comfort_zone", question: "Do you write in a journal or process your thoughts internally?", category: "Self-Care", intensity: "medium" },
  { id: "cozy_029", deckId: "chill_comfort_zone", question: "What is the best piece of self-care advice you’ve ever actually followed?", category: "Self-Care", intensity: "medium" },
  { id: "cozy_030", deckId: "chill_comfort_zone", question: "What is the most 'indulgent' thing you do for your own happiness?", category: "Self-Care", intensity: "deep" },

  //   Category: Comfort Media & Food
  { id: "cozy_031", deckId: "chill_comfort_zone", question: "What movie can you watch over and over again without ever getting bored?", category: "Media", intensity: "mild" },
  { id: "cozy_032", deckId: "chill_comfort_zone", question: "What is your ultimate 'sick day' meal?", category: "Food", intensity: "mild" },
  { id: "cozy_033", deckId: "chill_comfort_zone", question: "Is there a specific YouTuber or streamer who feels like a 'digital friend' to you?", category: "Media", intensity: "mild" },
  { id: "cozy_034", deckId: "chill_comfort_zone", question: "What book feels like a warm hug to you?", category: "Media", intensity: "mild" },
  { id: "cozy_035", deckId: "chill_comfort_zone", question: "What’s the most nostalgic snack from your childhood that you still eat?", category: "Food", intensity: "mild" },
  { id: "cozy_036", deckId: "chill_comfort_zone", question: "Do you have a 'comfort' video game that has zero stress involved?", category: "Media", intensity: "mild" },
  { id: "cozy_037", deckId: "chill_comfort_zone", question: "Which fictional town would you love to live in just for the 'cozy' vibes?", category: "Media", intensity: "mild" },
  { id: "cozy_038", deckId: "chill_comfort_zone", question: "What music do you play when you want to feel like the main character in a lo-fi video?", category: "Media", intensity: "mild" },
  { id: "cozy_039", deckId: "chill_comfort_zone", question: "Sweet or savory for a late-night snack?", category: "Food", intensity: "mild" },
  { id: "cozy_040", deckId: "chill_comfort_zone", question: "What is the 'highest' form of comfort food in your opinion?", category: "Food", intensity: "mild" },

  //   Category: People & Safety
  { id: "cozy_041", deckId: "chill_comfort_zone", question: "Who is the 'human equivalent' of a warm blanket in your life?", category: "People", intensity: "deep" },
  { id: "cozy_042", deckId: "chill_comfort_zone", question: "What is a quality in a person that makes you instantly feel safe around them?", category: "People", intensity: "deep" },
  { id: "cozy_043", deckId: "chill_comfort_zone", question: "Do you find 'parallel play' (being in the same room but doing different things) comforting?", category: "People", intensity: "medium" },
  { id: "cozy_044", deckId: "chill_comfort_zone", question: "What is the kindest thing someone has done for you when you were at your lowest?", category: "People", intensity: "deep" },
  { id: "cozy_045", deckId: "chill_comfort_zone", question: "What's your favorite 'quiet' way to spend time with someone you love?", category: "People", intensity: "medium" },
  { id: "cozy_046", deckId: "chill_comfort_zone", question: "How do you show someone else that they are safe with you?", category: "People", intensity: "deep" },
  { id: "cozy_047", deckId: "chill_comfort_zone", question: "What does 'home' look like when it’s a person, not a place?", category: "People", intensity: "deep" },
  { id: "cozy_048", deckId: "chill_comfort_zone", question: "Do you prefer a large, protective hug or a small, gentle touch?", category: "People", intensity: "medium" },
  { id: "cozy_049", deckId: "chill_comfort_zone", question: "Who was the first person who made you feel like you could truly be yourself?", category: "People", intensity: "deep" },
  { id: "cozy_050", deckId: "chill_comfort_zone", question: "If we were both having a bad day, what's the one thing we could do together to fix it?", category: "People", intensity: "medium" },

  //   Category: Mental Recharge
  { id: "cozy_051", deckId: "chill_comfort_zone", question: "What is a 'small joy' you noticed today?", category: "Mindset", intensity: "mild" },
  { id: "cozy_052", deckId: "chill_comfort_zone", question: "What is one thing you’ve forgiven yourself for recently?", category: "Mindset", intensity: "deep" },
  { id: "cozy_053", deckId: "chill_comfort_zone", question: "Do you believe 'everything will be okay,' or is that just something people say?", category: "Mindset", intensity: "deep" },
  { id: "cozy_054", deckId: "chill_comfort_zone", question: "What is your 'happy place' that you go to in your mind when you can't sleep?", category: "Mindset", intensity: "medium" },
  { id: "cozy_055", deckId: "chill_comfort_zone", question: "How do you define 'inner peace' for yourself?", category: "Mindset", intensity: "deep" },
  { id: "cozy_056", deckId: "chill_comfort_zone", question: "What is the most 'peaceful' memory you have from the last month?", category: "Mindset", intensity: "medium" },
  { id: "cozy_057", deckId: "chill_comfort_zone", question: "If you could send a 'thank you' note to your body, what would it say?", category: "Mindset", intensity: "medium" },
  { id: "cozy_058", deckId: "chill_comfort_zone", question: "What’s a 'guilty pleasure' that you refuse to feel guilty about anymore?", category: "Mindset", intensity: "mild" },
  { id: "cozy_059", deckId: "chill_comfort_zone", question: "What are you most looking forward to about 'future you'?", category: "Mindset", intensity: "medium" },
  { id: "cozy_060", deckId: "chill_comfort_zone", question: "On a scale of 1-10, how 'at peace' are you right now?", category: "Mindset", intensity: "deep" },

  //   Category: Personal Style
  { id: "aes_001", deckId: "chill_aesthetic", question: "How would you describe your 'personal brand' in just three words?", category: "Style", intensity: "mild" },
  { id: "aes_002", deckId: "chill_aesthetic", question: "If your personality was a color palette, what colors would be in it?", category: "Style", intensity: "mild" },
  { id: "aes_003", deckId: "chill_aesthetic", question: "What is the one item of clothing you wear that makes you feel most like yourself?", category: "Style", intensity: "mild" },
  { id: "aes_004", deckId: "chill_aesthetic", question: "Do you dress for comfort, for confidence, or for a specific 'vibe'?", category: "Style", intensity: "medium" },
  { id: "aes_005", deckId: "chill_aesthetic", question: "What is your 'signature' scent or perfume/cologne vibe?", category: "Style", intensity: "mild" },
  { id: "aes_006", deckId: "chill_aesthetic", question: "If you were a fictional character, what would your 'main outfit' be?", category: "Style", intensity: "mild" },
  { id: "aes_007", deckId: "chill_aesthetic", question: "Do you prefer gold or silver jewelry? (This is a deep identity question).", category: "Style", intensity: "mild" },
  { id: "aes_008", deckId: "chill_aesthetic", question: "What is a fashion trend you secretly love but are too 'scared' to wear?", category: "Style", intensity: "medium" },
  { id: "aes_009", deckId: "chill_aesthetic", question: "What is the oldest thing in your closet that you still wear?", category: "Style", intensity: "mild" },
  { id: "aes_010", deckId: "chill_aesthetic", question: "If you could have a whole wardrobe designed by one person, who would it be?", category: "Style", intensity: "mild" },

  //   Category: Atmospheric Vibes
  { id: "aes_011", deckId: "chill_aesthetic", question: "What is the most 'aesthetic' place you’ve ever physically been to?", category: "Atmosphere", intensity: "mild" },
  { id: "aes_012", deckId: "chill_aesthetic", question: "Rainy city streets at night or a sun-drenched meadow in the morning?", category: "Atmosphere", intensity: "mild" },
  { id: "aes_013", deckId: "chill_aesthetic", question: "What's the 'perfect' lighting for a deep conversation?", category: "Atmosphere", intensity: "mild" },
  { id: "aes_014", deckId: "chill_aesthetic", question: "Do you prefer a bedroom that feels like a 'dark cave' or a 'bright cloud'?", category: "Atmosphere", intensity: "mild" },
  { id: "aes_015", deckId: "chill_aesthetic", question: "What is your favorite 'low-fi' sound (e.g., trains, rain, distant chatter)?", category: "Atmosphere", intensity: "mild" },
  { id: "aes_016", deckId: "chill_aesthetic", question: "If you were a hotel, what kind of lobby would you have?", category: "Atmosphere", intensity: "medium" },
  { id: "aes_017", deckId: "chill_aesthetic", question: "What movie has your absolute favorite 'visual style'?", category: "Atmosphere", intensity: "mild" },
  { id: "aes_018", deckId: "chill_aesthetic", question: "Is there a specific time of day when the light looks most beautiful to you?", category: "Atmosphere", intensity: "mild" },
  { id: "aes_019", deckId: "chill_aesthetic", question: "What scent defines 'luxury' to you?", category: "Atmosphere", intensity: "mild" },
  { id: "aes_020", deckId: "chill_aesthetic", question: "If your life was a music video, what would the visual theme be?", category: "Atmosphere", intensity: "medium" },

  //   Category: Art & Design
  { id: "aes_021", deckId: "chill_aesthetic", question: "What is a piece of art that actually made you feel something intense?", category: "Art", intensity: "deep" },
  { id: "aes_022", deckId: "chill_aesthetic", question: "Do you prefer modern, minimalist design or vintage, ornate details?", category: "Art", intensity: "mild" },
  { id: "aes_023", deckId: "chill_aesthetic", question: "If you could own any famous painting in the world, which would it be?", category: "Art", intensity: "mild" },
  { id: "aes_024", deckId: "chill_aesthetic", question: "What is the most 'beautiful' word in your native language?", category: "Art", intensity: "medium" },
  { id: "aes_025", deckId: "chill_aesthetic", question: "Do you appreciate art more for its 'meaning' or its 'visual appeal'?", category: "Art", intensity: "medium" },
  { id: "aes_026", deckId: "chill_aesthetic", question: "If you were to create a 'statue' of a moment in your life, which moment?", category: "Art", intensity: "deep" },
  { id: "aes_027", deckId: "chill_aesthetic", question: "What is your favorite type of architecture?", category: "Art", intensity: "mild" },
  { id: "aes_028", deckId: "chill_aesthetic", question: "Is a 'messy' sketchbook more beautiful than a finished masterpiece?", category: "Art", intensity: "medium" },
  { id: "aes_029", deckId: "chill_aesthetic", question: "What color do you find most 'soothing' to look at?", category: "Art", intensity: "mild" },
  { id: "aes_030", deckId: "chill_aesthetic", question: "If you could paint a mural on your bedroom wall, what would it be?", category: "Art", intensity: "mild" },

  //   Category: Digital Aesthetic
  { id: "aes_031", deckId: "chill_aesthetic", question: "What does your 'Explore' page on social media say about your aesthetic?", category: "Digital", intensity: "medium" },
  { id: "aes_032", deckId: "chill_aesthetic", question: "Do you prefer a 'clean' phone home screen or one full of apps and widgets?", category: "Digital", intensity: "mild" },
  { id: "aes_033", deckId: "chill_aesthetic", question: "What is your current phone wallpaper? Why that specific image?", category: "Digital", intensity: "mild" },
  { id: "aes_034", deckId: "chill_aesthetic", question: "Are you a 'Dark Mode' or 'Light Mode' person for your whole life?", category: "Digital", intensity: "mild" },
  { id: "aes_035", deckId: "chill_aesthetic", question: "What is the most 'aesthetic' app you use?", category: "Digital", intensity: "mild" },
  { id: "aes_036", deckId: "chill_aesthetic", question: "Do you care about the 'grid' on your Instagram, or is it a photo dump?", category: "Digital", intensity: "medium" },
  { id: "aes_037", deckId: "chill_aesthetic", question: "If you could redesign the internet's 'vibe,' what would it look like?", category: "Digital", intensity: "medium" },
  { id: "aes_038", deckId: "chill_aesthetic", question: "What font best represents your personality?", category: "Digital", intensity: "mild" },
  { id: "aes_039", deckId: "chill_aesthetic", question: "Do you prefer physical photos or digital galleries?", category: "Digital", intensity: "mild" },
  { id: "aes_040", deckId: "chill_aesthetic", question: "What's the best 'aesthetic' account you follow?", category: "Digital", intensity: "mild" },

  //   Category: Nature & Beauty
  { id: "aes_041", deckId: "chill_aesthetic", question: "What is the most beautiful thing nature has ever shown you?", category: "Nature", intensity: "deep" },
  { id: "aes_042", deckId: "chill_aesthetic", question: "Desert, forest, ocean, or tundra: which 'nature aesthetic' is yours?", category: "Nature", intensity: "mild" },
  { id: "aes_043", deckId: "chill_aesthetic", question: "What is your favorite flower, and does it represent you in some way?", category: "Nature", intensity: "mild" },
  { id: "aes_044", deckId: "chill_aesthetic", question: "Is there beauty in 'decay' (e.g., abandoned buildings, autumn leaves)?", category: "Nature", intensity: "medium" },
  { id: "aes_045", deckId: "chill_aesthetic", question: "What animal do you think is the most 'majestic' to look at?", category: "Nature", intensity: "mild" },
  { id: "aes_046", deckId: "chill_aesthetic", question: "Stars or the Moon? Choose your night sky companion.", category: "Nature", intensity: "mild" },
  { id: "aes_047", deckId: "chill_aesthetic", question: "What is the most 'peaceful' color in nature?", category: "Nature", intensity: "mild" },
  { id: "aes_048", deckId: "chill_aesthetic", question: "Do you find mountains or flat plains more visually inspiring?", category: "Nature", intensity: "mild" },
  { id: "aes_049", deckId: "chill_aesthetic", question: "If you could be a tree, what kind of tree would you be?", category: "Nature", intensity: "medium" },
  { id: "aes_050", deckId: "chill_aesthetic", question: "What is the most 'unusual' thing you find beautiful?", category: "Nature", intensity: "deep" },

  //   Category: General Vibes
  { id: "aes_051", deckId: "chill_aesthetic", question: "If your life had a 'filter' applied to it, which one would it be?", category: "Vibes", intensity: "mild" },
  { id: "aes_052", deckId: "chill_aesthetic", question: "What's the most 'you' thing in this room right now?", category: "Vibes", intensity: "mild" },
  { id: "aes_053", deckId: "chill_aesthetic", question: "Do you prefer the aesthetic of the 'past' or the 'future'?", category: "Vibes", intensity: "medium" },
  { id: "aes_054", deckId: "chill_aesthetic", question: "What is the 'hottest' vibe someone can have?", category: "Vibes", intensity: "medium" },
  { id: "aes_055", deckId: "chill_aesthetic", question: "If you were a city, would you be old and historic or sleek and modern?", category: "Vibes", intensity: "mild" },
  { id: "aes_056", deckId: "chill_aesthetic", question: "What is the best 'aesthetic' gift you’ve ever received?", category: "Vibes", intensity: "mild" },
  { id: "aes_057", deckId: "chill_aesthetic", question: "Do you believe 'pretty' and 'beautiful' are the same thing?", category: "Vibes", intensity: "deep" },
  { id: "aes_058", deckId: "chill_aesthetic", question: "What's the 'color' of your current mood?", category: "Vibes", intensity: "mild" },
  { id: "aes_059", deckId: "chill_aesthetic", question: "What is the most 'aesthetic' dream you've ever had?", category: "Vibes", intensity: "medium" },
  { id: "aes_060", deckId: "chill_aesthetic", question: "In one word, what is your personal 'vibe'?", category: "Vibes", intensity: "medium" },

  //   Category: Dream Destinations
  { id: "wand_001", deckId: "chill_travel_dreams", question: "If you were given a first-class ticket to anywhere in the world right now, where are you going?", category: "Dreams", intensity: "mild" },
  { id: "wand_002", deckId: "chill_travel_dreams", question: "Would you rather live in a bustling Tokyo skyscraper or a remote villa in the Tuscan countryside?", category: "Dreams", intensity: "mild" },
  { id: "wand_003", deckId: "chill_travel_dreams", question: "What is the most 'Instagrammable' place you’ve ever actually been to?", category: "Dreams", intensity: "mild" },
  { id: "wand_004", deckId: "chill_travel_dreams", question: "If you could visit any fictional location (like Hogwarts or Middle Earth), which is first on the list?", category: "Dreams", intensity: "mild" },
  { id: "wand_005", deckId: "chill_travel_dreams", question: "What is one country you have zero interest in visiting, no matter how much people praise it?", category: "Dreams", intensity: "medium" },
  { id: "wand_006", deckId: "chill_travel_dreams", question: "If you could retire to a cruise ship that sails the world forever, would you do it?", category: "Dreams", intensity: "medium" },
  { id: "wand_007", deckId: "chill_travel_dreams", question: "What is your 'soul city'—the place where you feel most like yourself?", category: "Dreams", intensity: "deep" },
  { id: "wand_008", deckId: "chill_travel_dreams", question: "If you could go to the Moon for a weekend, but the food was terrible, would you still go?", category: "Dreams", intensity: "mild" },
  { id: "wand_009", deckId: "chill_travel_dreams", question: "What is the most beautiful sunrise or sunset you've ever witnessed while traveling?", category: "Dreams", intensity: "mild" },
  { id: "wand_010", deckId: "chill_travel_dreams", question: "Where is the first place you would take me if you were my tour guide?", category: "Dreams", intensity: "medium" },

  //   Category: Travel Habits
  { id: "wand_011", deckId: "chill_travel_dreams", question: "Are you a 'carry-on only' minimalist or do you pack for every possible scenario?", category: "Habits", intensity: "mild" },
  { id: "wand_012", deckId: "chill_travel_dreams", question: "Window seat for the view or Aisle seat for the freedom?", category: "Habits", intensity: "mild" },
  { id: "wand_013", deckId: "chill_travel_dreams", question: "Do you prefer a strictly planned itinerary or 'vibe-based' wandering?", category: "Habits", intensity: "medium" },
  { id: "wand_014", deckId: "chill_travel_dreams", question: "What is your #1 airport survival tip?", category: "Habits", intensity: "mild" },
  { id: "wand_015", deckId: "chill_travel_dreams", question: "How early do you actually show up to the airport?", category: "Habits", intensity: "mild" },
  { id: "wand_016", deckId: "chill_travel_dreams", question: "Are you the 'navigator' or the 'person who just follows and hopes for the best'?", category: "Habits", intensity: "mild" },
  { id: "wand_017", deckId: "chill_travel_dreams", question: "Hostels, Airbnbs, or 5-star Hotels? Which fits your personality best?", category: "Habits", intensity: "medium" },
  { id: "wand_018", deckId: "chill_travel_dreams", question: "What is the one item you ALWAYS forget to pack?", category: "Habits", intensity: "mild" },
  { id: "wand_019", deckId: "chill_travel_dreams", question: "Do you prefer to travel solo or with a big group of friends?", category: "Habits", intensity: "medium" },
  { id: "wand_020", deckId: "chill_travel_dreams", question: "What’s the most 'tourist' thing you’ve ever done and loved?", category: "Habits", intensity: "mild" },

  //   Category: Culture & Food
  { id: "wand_021", deckId: "chill_travel_dreams", question: "What is the weirdest thing you’ve ever eaten while abroad?", category: "Experience", intensity: "medium" },
  { id: "wand_022", deckId: "chill_travel_dreams", question: "If you could instantly speak one language perfectly, which would it be?", category: "Experience", intensity: "mild" },
  { id: "wand_023", deckId: "chill_travel_dreams", question: "Which culture's traditions or festivals fascinate you the most?", category: "Experience", intensity: "medium" },
  { id: "wand_024", deckId: "chill_travel_dreams", question: "Street food or fine dining? You can only choose one for a whole trip.", category: "Experience", intensity: "mild" },
  { id: "wand_025", deckId: "chill_travel_dreams", question: "What’s a cultural faux pas you’ve accidentally committed while traveling?", category: "Experience", intensity: "medium" },
  { id: "wand_026", deckId: "chill_travel_dreams", question: "What is the best 'local' drink you've ever had?", category: "Experience", intensity: "mild" },
  { id: "wand_027", deckId: "chill_travel_dreams", question: "If you had to move to another country tomorrow, which one would be easiest for you to adapt to?", category: "Experience", intensity: "deep" },
  { id: "wand_028", deckId: "chill_travel_dreams", question: "What is one thing about your own country that you only appreciated after leaving it?", category: "Experience", intensity: "deep" },
  { id: "wand_029", deckId: "chill_travel_dreams", question: "Which city has the best 'vibe' for just sitting in a cafe and people-watching?", category: "Experience", intensity: "mild" },
  { id: "wand_030", deckId: "chill_travel_dreams", question: "What is the most beautiful church, temple, or landmark you’ve stepped inside?", category: "Experience", intensity: "mild" },

  //   Category: Travel Philosophy
  { id: "wand_031", deckId: "chill_travel_dreams", question: "Do you travel to find yourself or to lose yourself?", category: "Philosophy", intensity: "deep" },
  { id: "wand_032", deckId: "chill_travel_dreams", question: "What is the most important lesson you’ve learned from a stranger in a foreign land?", category: "Philosophy", intensity: "deep" },
  { id: "wand_033", deckId: "chill_travel_dreams", question: "Does traveling change who you are, or just how you see things?", category: "Philosophy", intensity: "deep" },
  { id: "wand_034", deckId: "chill_travel_dreams", question: "Is it better to see 20 countries once, or 1 country 20 times?", category: "Philosophy", intensity: "medium" },
  { id: "wand_035", deckId: "chill_travel_dreams", question: "How do you handle 'post-vacation blues'?", category: "Philosophy", intensity: "medium" },
  { id: "wand_036", deckId: "chill_travel_dreams", question: "What is the most 'out of your comfort zone' you’ve ever been while traveling?", category: "Philosophy", intensity: "medium" },
  { id: "wand_037", deckId: "chill_travel_dreams", question: "If you could live as a nomad for one year, would you?", category: "Philosophy", intensity: "medium" },
  { id: "wand_038", deckId: "chill_travel_dreams", question: "What does 'home' mean to you when you’re thousands of miles away from it?", category: "Philosophy", intensity: "deep" },
  { id: "wand_039", deckId: "chill_travel_dreams", question: "Is travel a luxury or a necessity for a well-lived life?", category: "Philosophy", intensity: "deep" },
  { id: "wand_040", deckId: "chill_travel_dreams", question: "What is the 'heart' of a great trip: the people or the place?", category: "Philosophy", intensity: "medium" },

  //   Category: Adventure & Road Trips
  { id: "wand_041", deckId: "chill_travel_dreams", question: "What is the ultimate road trip song?", category: "Adventure", intensity: "mild" },
  { id: "wand_042", deckId: "chill_travel_dreams", question: "Would you rather have a breakdown in the middle of a desert or the middle of a snowy mountain?", category: "Adventure", intensity: "medium" },
  { id: "wand_043", deckId: "chill_travel_dreams", question: "What is the 'sketchiest' hotel or hostel you’ve ever stayed in?", category: "Adventure", intensity: "medium" },
  { id: "wand_044", deckId: "chill_travel_dreams", question: "If we were going on a road trip tomorrow, who is in charge of the snacks?", category: "Adventure", intensity: "mild" },
  { id: "wand_045", deckId: "chill_travel_dreams", question: "What is the most 'adventurous' thing you’ve done on a whim?", category: "Adventure", intensity: "medium" },
  { id: "wand_046", deckId: "chill_travel_dreams", question: "Train, Plane, or Boat? What is the most romantic way to travel?", category: "Adventure", intensity: "mild" },
  { id: "wand_047", deckId: "chill_travel_dreams", question: "Have you ever been truly lost without a phone or GPS? What happened?", category: "Adventure", intensity: "medium" },
  { id: "wand_048", deckId: "chill_travel_dreams", question: "What’s the most 'middle-of-nowhere' place you’ve ever been?", category: "Adventure", intensity: "mild" },
  { id: "wand_049", deckId: "chill_travel_dreams", question: "If you could take a cross-country trip in a vintage VW bus, would you?", category: "Adventure", intensity: "mild" },
  { id: "wand_050", deckId: "chill_travel_dreams", question: "What is your 'Mount Everest'—the one physical challenge you want to conquer?", category: "Adventure", intensity: "medium" },

  //   Category: Wildcards
  { id: "wand_051", deckId: "chill_travel_dreams", question: "What is the weirdest souvenir you’ve ever brought home?", category: "Wildcard", intensity: "mild" },
  { id: "wand_052", deckId: "chill_travel_dreams", question: "If you found a suitcase with $50,000 in a foreign country, what would you do?", category: "Wildcard", intensity: "high" },
  { id: "wand_053", deckId: "chill_travel_dreams", question: "Which celebrity would be the WORST travel companion?", category: "Wildcard", intensity: "mild" },
  { id: "wand_054", deckId: "chill_travel_dreams", question: "What is your 'airport outfit' of choice?", category: "Wildcard", intensity: "mild" },
  { id: "wand_055", deckId: "chill_travel_dreams", question: "Have you ever missed a flight or a train? Tell the story.", category: "Wildcard", intensity: "medium" },
  { id: "wand_056", deckId: "chill_travel_dreams", question: "If you could visit Earth 1,000 years in the future, would you go?", category: "Wildcard", intensity: "medium" },
  { id: "wand_057", deckId: "chill_travel_dreams", question: "What is the most 'underrated' city in the world?", category: "Wildcard", intensity: "medium" },
  { id: "wand_058", deckId: "chill_travel_dreams", question: "If money wasn't real, what would your 'bucket list' trip look like?", category: "Wildcard", intensity: "mild" },
  { id: "wand_059", deckId: "chill_travel_dreams", question: "Which movie made you want to travel to a specific place?", category: "Wildcard", intensity: "mild" },
  { id: "wand_060", deckId: "chill_travel_dreams", question: "Where is the next place on your map?", category: "Wildcard", intensity: "mild" },

  //   Category: Power Selection
  { id: "hero_001", deckId: "chill_superpowers", question: "Flight or Invisibility? Choose one and justify it.", category: "Powers", intensity: "mild" },
  { id: "hero_002", deckId: "chill_superpowers", question: "If you could have a 'useless' superpower (like making any plant grow 1 inch), what would it be?", category: "Powers", intensity: "mild" },
  { id: "hero_003", deckId: "chill_superpowers", question: "Would you rather have the ability to read minds or the ability to see 10 minutes into the future?", category: "Powers", intensity: "medium" },
  { id: "hero_004", deckId: "chill_superpowers", question: "If you could teleport anywhere, but only while you were holding a raw potato, would you do it?", category: "Powers", intensity: "mild" },
  { id: "hero_005", deckId: "chill_superpowers", question: "What is the most 'dangerous' superpower a human could have?", category: "Powers", intensity: "medium" },
  { id: "hero_006", deckId: "chill_superpowers", question: "If your power was based on your biggest fear, what would your power be?", category: "Powers", intensity: "deep" },
  { id: "hero_007", deckId: "chill_superpowers", question: "Would you rather be super fast like The Flash or super strong like Hulk?", category: "Powers", intensity: "mild" },
  { id: "hero_008", deckId: "chill_superpowers", question: "If you could talk to one specific species of animal, which would be the most useful?", category: "Powers", intensity: "mild" },
  { id: "hero_009", deckId: "chill_superpowers", question: "What would your 'Hero Name' be?", category: "Powers", intensity: "mild" },
  { id: "hero_010", deckId: "chill_superpowers", question: "If you had to pick a 'sidekick' from this room, who is it and why?", category: "Powers", intensity: "medium" },

  //   Category: Secret Identities
  { id: "hero_011", deckId: "chill_superpowers", question: "How would you hide your secret identity from your boss/coworkers?", category: "Identity", intensity: "mild" },
  { id: "hero_012", deckId: "chill_superpowers", question: "Would you tell your partner about your powers, or keep them a secret to protect them?", category: "Identity", intensity: "deep" },
  { id: "hero_013", deckId: "chill_superpowers", question: "What would your 'costume' look like? Tactical gear or spandex?", category: "Identity", intensity: "mild" },
  { id: "hero_014", deckId: "chill_superpowers", question: "Where would your secret 'Bat-Cave' be located?", category: "Identity", intensity: "mild" },
  { id: "hero_015", deckId: "chill_superpowers", question: "Could you handle the pressure of being a public hero, or would you stay a vigilante?", category: "Identity", intensity: "medium" },
  { id: "hero_016", deckId: "chill_superpowers", question: "What is your 'Kryptonite'—the one thing that makes you weak?", category: "Identity", intensity: "medium" },
  { id: "hero_017", deckId: "chill_superpowers", question: "If you accidentally went 'viral' using your powers, how would you handle the fame?", category: "Identity", intensity: "medium" },
  { id: "hero_018", deckId: "chill_superpowers", question: "Would you use your powers to make your 'civilian life' easier (like teleporting to the grocery store)?", category: "Identity", intensity: "medium" },
  { id: "hero_019", deckId: "chill_superpowers", question: "Who is the 'villain' in your superhero story?", category: "Identity", intensity: "medium" },
  { id: "hero_020", deckId: "chill_superpowers", question: "What is your 'origin story' in 3 sentences?", category: "Identity", intensity: "medium" },

  //   Category: Ethical Dilemmas
  { id: "hero_021", deckId: "chill_superpowers", question: "If you could save 1,000 strangers by sacrificing your best friend, would you do it?", category: "Ethics", intensity: "high" },
  { id: "hero_022", deckId: "chill_superpowers", question: "Is it okay to use your powers for personal financial gain if it doesn't hurt anyone?", category: "Ethics", intensity: "medium" },
  { id: "hero_023", deckId: "chill_superpowers", question: "Would you use mind control to make world leaders act more ethically?", category: "Ethics", intensity: "high" },
  { id: "hero_024", deckId: "chill_superpowers", question: "If your powers were slowly killing you, would you stop using them and let people suffer, or keep going?", category: "Ethics", intensity: "high" },
  { id: "hero_025", deckId: "chill_superpowers", question: "Would you kill one villain to save millions of innocent lives? (The Batman dilemma).", category: "Ethics", intensity: "high" },
  { id: "hero_026", deckId: "chill_superpowers", question: "Do heroes have an obligation to help, or is it a choice?", category: "Ethics", intensity: "deep" },
  { id: "hero_027", deckId: "chill_superpowers", question: "If you found out a fellow hero was doing something illegal for 'the greater good,' would you turn them in?", category: "Ethics", intensity: "deep" },
  { id: "hero_028", deckId: "chill_superpowers", question: "Would you take a 'cure' that removed your powers but let you live a normal life?", category: "Ethics", intensity: "deep" },
  { id: "hero_029", deckId: "chill_superpowers", question: "Is a hero still a hero if they enjoy the violence of the job?", category: "Ethics", intensity: "deep" },
  { id: "hero_030", deckId: "chill_superpowers", question: "What would be the first 'law' you’d break if you had no consequences?", category: "Ethics", intensity: "high" },

  //   Category: Team Dynamics
  { id: "hero_031", deckId: "chill_superpowers", question: "If we were a team of heroes, who would be the leader?", category: "Team", intensity: "medium" },
  { id: "hero_032", deckId: "chill_superpowers", question: "Who in this room is most likely to go 'rogue' and become a villain?", category: "Team", intensity: "high" },
  { id: "hero_033", deckId: "chill_superpowers", question: "What would our team's 'catchphrase' be?", category: "Team", intensity: "mild" },
  { id: "hero_034", deckId: "chill_superpowers", question: "Who is the 'gadget expert' of our group?", category: "Team", intensity: "mild" },
  { id: "hero_035", deckId: "chill_superpowers", question: "If we had to share one superpower among the whole group, which one should it be?", category: "Team", intensity: "medium" },
  { id: "hero_036", deckId: "chill_superpowers", question: "Who would be the most 'reluctant' hero in this group?", category: "Team", intensity: "medium" },
  { id: "hero_037", deckId: "chill_superpowers", question: "If one of us turned evil, who would be the most difficult to stop?", category: "Team", intensity: "high" },
  { id: "hero_038", deckId: "chill_superpowers", question: "What is our team's headquarters? (A volcano? An office building?)", category: "Team", intensity: "mild" },
  { id: "hero_039", deckId: "chill_superpowers", question: "Who would be the most popular hero with the media?", category: "Team", intensity: "mild" },
  { id: "hero_040", deckId: "chill_superpowers", question: "Which two people in this room have the best 'combo move'?", category: "Team", intensity: "medium" },

  //   Category: Everyday Heroics
  { id: "hero_041", deckId: "chill_superpowers", question: "What is a 'real life' heroic act you’ve witnessed?", category: "Real Life", intensity: "medium" },
  { id: "hero_042", deckId: "chill_superpowers", question: "Do you believe anyone can be a hero, or is it reserved for the brave few?", category: "Real Life", intensity: "deep" },
  { id: "hero_043", deckId: "chill_superpowers", question: "What’s the most 'heroic' thing you’ve ever done for a stranger?", category: "Real Life", intensity: "medium" },
  { id: "hero_044", deckId: "chill_superpowers", question: "Which 'everyday' job (doctors, firefighters, etc.) is the most heroic to you?", category: "Real Life", intensity: "mild" },
  { id: "hero_045", deckId: "chill_superpowers", question: "Can a person be a hero if they’ve also done terrible things?", category: "Real Life", intensity: "deep" },
  { id: "hero_046", deckId: "chill_superpowers", question: "Who is the 'superhero' in your actual life?", category: "Real Life", intensity: "deep" },
  { id: "hero_047", deckId: "chill_superpowers", question: "What is a 'small' act of bravery you struggle with?", category: "Real Life", intensity: "medium" },
  { id: "hero_048", deckId: "chill_superpowers", question: "If you could give everyone in the world one 'good' trait, what would it be?", category: "Real Life", intensity: "deep" },
  { id: "hero_049", deckId: "chill_superpowers", question: "Is standing up to a friend more heroic than standing up to an enemy?", category: "Real Life", intensity: "deep" },
  { id: "hero_050", deckId: "chill_superpowers", question: "What is your 'Heroic Mantra' for when things get tough?", category: "Real Life", intensity: "medium" },

  //   Category: Final Battles
  { id: "hero_051", deckId: "chill_superpowers", question: "If you had to fight a giant robot or a fire-breathing dragon, which are you choosing?", category: "Battle", intensity: "mild" },
  { id: "hero_052", deckId: "chill_superpowers", question: "What is your 'finishing move' called?", category: "Battle", intensity: "mild" },
  { id: "hero_053", deckId: "chill_superpowers", question: "Would you rather save the world but die in the process, or let it end and survive?", category: "Battle", intensity: "high" },
  { id: "hero_054", deckId: "chill_superpowers", question: "If you could pick one fictional weapon (Lightsaber, Mjolnir, etc.), which one is yours?", category: "Battle", intensity: "mild" },
  { id: "hero_055", deckId: "chill_superpowers", question: "Who is your 'Arch-Nemesis' in this room? (Playful only!)", category: "Battle", intensity: "mild" },
  { id: "hero_056", deckId: "chill_superpowers", question: "What is the background music for your final showdown?", category: "Battle", intensity: "mild" },
  { id: "hero_057", deckId: "chill_superpowers", question: "If you could travel back in time to stop your 'villain origin story,' would you?", category: "Battle", intensity: "deep" },
  { id: "hero_058", deckId: "chill_superpowers", question: "What would the headline say the day after you saved the world?", category: "Battle", intensity: "medium" },
  { id: "hero_059", deckId: "chill_superpowers", question: "If you were a God for one day, what is the first thing you’d change?", category: "Battle", intensity: "deep" },
  { id: "hero_060", deckId: "chill_superpowers", question: "Final Vote: Is the person to your left a Hero, a Villain, or a Sidekick?", category: "Battle", intensity: "medium" }
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