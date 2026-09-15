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
  { id: "friends", title: "👫 Friends", tagline: "Laugh & learn together" }
];

const decks = [
  // ── FRIENDS ──
  { id: "friends_ice_breakers", modeId: "friends", title: "🧊 Ice Breakers", description: "Break the ice with these fun questions", isLocked: false },
  { id: "friends_nostalgia", modeId: "friends", title: "📟 Nostalgia Trip", description: "Talk about the good old days & school", isLocked: false },
  { id: "friends_loyalty_test", modeId: "friends", title: "🤝 Ride or Die", description: "How far would you go for your bestie?", isLocked: false },
  { id: "friends_travel_buddies", modeId: "friends", title: "🎒 Road Trip", description: "Hypothetical trips and travel habits", isLocked: false },
  { id: "friends_hype_man", modeId: "friends", title: "📣 The Hype Man", description: "Everyone shares what they love about you", isLocked: false },
  { id: "friends_secret_confessions", modeId: "friends", title: "🤫 Secret Confessions", description: "Spill the tea with your inner circle", isLocked: true },
  { id: "friends_what_would_you_do", modeId: "friends", title: "🤔 Scenarios", description: "Wild 'What Would You Do' situations", isLocked: true },
  { id: "friends_pop_culture", modeId: "friends", title: "🍿 Screen & Sound", description: "Debate movies, music, and celebrities", isLocked: true }
];
const cards = [
  //   Category: Debates & Hot Takes
  { id: "ice_001", deckId: "friends_ice_breakers", question: "Is a hot dog a sandwich? Defend your answer.", category: "Debates", intensity: "mild" },
  { id: "ice_002", deckId: "friends_ice_breakers", question: "What is the most overrated 'classic' movie of all time?", category: "Debates", intensity: "mild" },
  { id: "ice_003", deckId: "friends_ice_breakers", question: "Does pineapple belong on pizza, or is it a crime against humanity?", category: "Debates", intensity: "mild" },
  { id: "ice_004", deckId: "friends_ice_breakers", question: "If you had to delete one social media app forever, which one goes first?", category: "Debates", intensity: "medium" },
  { id: "ice_005", deckId: "friends_ice_breakers", question: "Cereal first or milk first? There is only one right answer.", category: "Debates", intensity: "mild" },

  //   Category: Hypotheticals
  { id: "ice_006", deckId: "friends_ice_breakers", question: "If you were a ghost, who would you haunt just to be mildly annoying?", category: "Hypotheticals", intensity: "mild" },
  { id: "ice_007", deckId: "friends_ice_breakers", question: "If you could win an Olympic medal for any 'non-sport' activity, what would it be?", category: "Hypotheticals", intensity: "mild" },
  { id: "ice_008", deckId: "friends_ice_breakers", question: "You’re stranded on an island and can only bring one condiment. What is it?", category: "Hypotheticals", intensity: "mild" },
  { id: "ice_009", deckId: "friends_ice_breakers", question: "If you had to live in a video game for a week, which one would you choose?", category: "Hypotheticals", intensity: "medium" },
  { id: "ice_010", deckId: "friends_ice_breakers", question: "If animals could talk, which one would be the rudest?", category: "Hypotheticals", intensity: "mild" },

  //   Category: Personality Snapshots
  { id: "ice_011", deckId: "friends_ice_breakers", question: "What’s the most 'out of character' thing you’ve ever done?", category: "Personality", intensity: "medium" },
  { id: "ice_012", deckId: "friends_ice_breakers", question: "Are you a 'let’s stay in' person or a 'where are we going next' person?", category: "Personality", intensity: "mild" },
  { id: "ice_013", deckId: "friends_ice_breakers", question: "What’s your 'walk-out' song if you were a professional wrestler?", category: "Personality", intensity: "mild" },
  { id: "ice_014", deckId: "friends_ice_breakers", question: "What is one thing you’re surprisingly competitive about?", category: "Personality", intensity: "medium" },
  { id: "ice_015", deckId: "friends_ice_breakers", question: "If you were a city, which one would you be and why?", category: "Personality", intensity: "medium" },

  //   Category: Skills & Talents
  { id: "ice_016", deckId: "friends_ice_breakers", question: "What is your most useless 'stupid human trick'?", category: "Skills", intensity: "mild" },
  { id: "ice_017", deckId: "friends_ice_breakers", question: "What’s a hobby you’d pick up if you had unlimited time and money?", category: "Skills", intensity: "mild" },
  { id: "ice_018", deckId: "friends_ice_breakers", question: "If you could instantly be fluent in any language, which would it be?", category: "Skills", intensity: "mild" },
  { id: "ice_019", deckId: "friends_ice_breakers", question: "What’s the one thing you can cook better than anyone else here?", category: "Skills", intensity: "mild" },
  { id: "ice_020", deckId: "friends_ice_breakers", question: "If you were a spy, what would your code name be?", category: "Skills", intensity: "mild" },

  //   Category: Pop Culture
  { id: "ice_021", deckId: "friends_ice_breakers", question: "What was the last show you binge-watched in a single weekend?", category: "Pop Culture", intensity: "mild" },
  { id: "ice_022", deckId: "friends_ice_breakers", question: "Which fictional character do you relate to way too much?", category: "Pop Culture", intensity: "medium" },
  { id: "ice_023", deckId: "friends_ice_breakers", question: "What’s the worst movie you’ve ever sat through until the end?", category: "Pop Culture", intensity: "mild" },
  { id: "ice_024", deckId: "friends_ice_breakers", question: "If you could replace the lead actor in any movie with yourself, which one?", category: "Pop Culture", intensity: "medium" },
  { id: "ice_025", deckId: "friends_ice_breakers", question: "What’s your go-to karaoke song?", category: "Pop Culture", intensity: "mild" },

  //   Category: Travel Vibes
  { id: "ice_026", deckId: "friends_ice_breakers", question: "Would you rather have a beach vacation or a mountain hike?", category: "Travel", intensity: "mild" },
  { id: "ice_027", deckId: "friends_ice_breakers", question: "What’s the weirdest thing you’ve ever seen at an airport?", category: "Travel", intensity: "mild" },
  { id: "ice_028", deckId: "friends_ice_breakers", question: "Window seat or aisle seat? Be careful, your answer matters.", category: "Travel", intensity: "mild" },
  { id: "ice_029", deckId: "friends_ice_breakers", question: "What is the most 'touristy' thing you’ve ever done and actually liked?", category: "Travel", intensity: "mild" },
  { id: "ice_030", deckId: "friends_ice_breakers", question: "If you could live anywhere for 3 months, where would you go?", category: "Travel", intensity: "medium" },

  //   Category: Social Scenarios
  { id: "ice_031", deckId: "friends_ice_breakers", question: "What’s your go-to move when you want to leave a boring party?", category: "Social", intensity: "medium" },
  { id: "ice_032", deckId: "friends_ice_breakers", question: "What is the best 'white elephant' gift you’ve ever given or received?", category: "Social", intensity: "mild" },
  { id: "ice_033", deckId: "friends_ice_breakers", question: "Who in this group is most likely to survive a zombie apocalypse?", category: "Social", intensity: "mild" },
  { id: "ice_034", deckId: "friends_ice_breakers", question: "What’s your favorite ice-breaker question to ask strangers?", category: "Social", intensity: "mild" },
  { id: "ice_035", deckId: "friends_ice_breakers", question: "Are you a 'reply instantly' person or a 'reply in 3-5 business days' person?", category: "Social", intensity: "medium" },

  //   Category: Wildcards
  { id: "ice_036", deckId: "friends_ice_breakers", question: "What’s the most embarrassing song in your recently played list?", category: "Wildcard", intensity: "medium" },
  { id: "ice_037", deckId: "friends_ice_breakers", question: "If you could have dinner with one person, dead or alive, who is it?", category: "Wildcard", intensity: "medium" },
  { id: "ice_038", deckId: "friends_ice_breakers", question: "What’s your most controversial 'unpopular opinion'?", category: "Wildcard", intensity: "medium" },
  { id: "ice_039", deckId: "friends_ice_breakers", question: "What’s the weirdest dream you’ve ever had that you still remember?", category: "Wildcard", intensity: "medium" },
  { id: "ice_040", deckId: "friends_ice_breakers", question: "If you were a superhero, what would your one 'minor' power be?", category: "Wildcard", intensity: "mild" },

  //   Category: Preferences
  { id: "ice_041", deckId: "friends_ice_breakers", question: "Coffee or tea to start your day?", category: "Preferences", intensity: "mild" },
  { id: "ice_042", deckId: "friends_ice_breakers", question: "Are you a Kindle person or a physical book person?", category: "Preferences", intensity: "mild" },
  { id: "ice_043", deckId: "friends_ice_breakers", question: "Dark mode or light mode on your phone?", category: "Preferences", intensity: "mild" },
  { id: "ice_044", deckId: "friends_ice_breakers", question: "Would you rather have more time or more money?", category: "Preferences", intensity: "medium" },
  { id: "ice_045", deckId: "friends_ice_breakers", question: "Winter or summer? Choose a side.", category: "Preferences", intensity: "mild" },

  //   Category: Funny Failures
  { id: "ice_046", deckId: "friends_ice_breakers", question: "What’s the most ridiculous reason you’ve ever been late to something?", category: "Funny Failures", intensity: "medium" },
  { id: "ice_047", deckId: "friends_ice_breakers", question: "What is your most epic 'cooking fail'?", category: "Funny Failures", intensity: "mild" },
  { id: "ice_048", deckId: "friends_ice_breakers", question: "Have you ever walked into a glass door? Be honest.", category: "Funny Failures", intensity: "mild" },
  { id: "ice_049", deckId: "friends_ice_breakers", question: "What’s the most embarrassing thing you’ve done in front of a crush?", category: "Funny Failures", intensity: "medium" },
  { id: "ice_050", deckId: "friends_ice_breakers", question: "What’s a fashion trend you followed that you now deeply regret?", category: "Funny Failures", intensity: "mild" },

  //   Category: Modern Life
  { id: "ice_051", deckId: "friends_ice_breakers", question: "What’s your current screen time average? (Highest or lowest wins!)", category: "Modern Life", intensity: "mild" },
  { id: "ice_052", deckId: "friends_ice_breakers", question: "What is the weirdest thing you’ve ever bought online?", category: "Modern Life", intensity: "mild" },
  { id: "ice_053", deckId: "friends_ice_breakers", question: "How many unread emails are in your inbox right now?", category: "Modern Life", intensity: "mild" },
  { id: "ice_054", deckId: "friends_ice_breakers", question: "If you could ban one word from the dictionary, what would it be?", category: "Modern Life", intensity: "medium" },
  { id: "ice_055", deckId: "friends_ice_breakers", question: "What’s the best app on your phone that no one else knows about?", category: "Modern Life", intensity: "mild" },

  //   Category: Inner Thoughts
  { id: "ice_056", deckId: "friends_ice_breakers", question: "If you could change your name to anything, what would it be?", category: "Inner Thoughts", intensity: "medium" },
  { id: "ice_057", deckId: "friends_ice_breakers", question: "What’s one thing you always carry with you that isn’t a phone or wallet?", category: "Inner Thoughts", intensity: "mild" },
  { id: "ice_058", deckId: "friends_ice_breakers", question: "What’s the best piece of advice you’ve ever ignored?", category: "Inner Thoughts", intensity: "medium" },
  { id: "ice_059", deckId: "friends_ice_breakers", question: "If you could have any animal as a pet (and it was tamed), what would it be?", category: "Inner Thoughts", intensity: "mild" },
  { id: "ice_060", deckId: "friends_ice_breakers", question: "What’s one thing you want to be remembered for?", category: "Inner Thoughts", intensity: "deep" },

  //   Category: Childhood Classics
  { id: "nostalgia_001", deckId: "friends_nostalgia", question: "What was your go-to Saturday morning cartoon?", category: "Childhood", intensity: "mild" },
  { id: "nostalgia_002", deckId: "friends_nostalgia", question: "What was the one toy you desperately wanted but never got?", category: "Childhood", intensity: "medium" },
  { id: "nostalgia_003", deckId: "friends_nostalgia", question: "What did your childhood bedroom look like? What posters were on the walls?", category: "Childhood", intensity: "mild" },
  { id: "nostalgia_004", deckId: "friends_nostalgia", question: "What was your favorite playground game during recess?", category: "Childhood", intensity: "mild" },
  { id: "nostalgia_005", deckId: "friends_nostalgia", question: "What’s a snack from your childhood that tastes like pure nostalgia?", category: "Childhood", intensity: "mild" },

  //   Category: School Days
  { id: "nostalgia_006", deckId: "friends_nostalgia", question: "Who was your first 'serious' school crush and why?", category: "School", intensity: "medium" },
  { id: "nostalgia_007", deckId: "friends_nostalgia", question: "Were you a 'teacher’s pet,' a rebel, or somewhere in the middle?", category: "School", intensity: "medium" },
  { id: "nostalgia_008", deckId: "friends_nostalgia", question: "What was the most embarrassing thing that happened to you in the cafeteria?", category: "School", intensity: "deep" },
  { id: "nostalgia_009", deckId: "friends_nostalgia", question: "Which subject did you absolutely hate with a passion?", category: "School", intensity: "mild" },
  { id: "nostalgia_010", deckId: "friends_nostalgia", question: "If you could go back and talk to your high school self for one minute, what would you say?", category: "School", intensity: "deep" },

  //   Category: Teenage Years
  { id: "nostalgia_011", deckId: "friends_nostalgia", question: "What was your first screen name or email address? (Be honest!)", category: "Teenage", intensity: "medium" },
  { id: "nostalgia_012", deckId: "friends_nostalgia", question: "What was your favorite 'angsty' song during your teen years?", category: "Teenage", intensity: "mild" },
  { id: "nostalgia_013", deckId: "friends_nostalgia", question: "What was the first concert you ever attended?", category: "Teenage", intensity: "mild" },
  { id: "nostalgia_014", deckId: "friends_nostalgia", question: "What was the most rebellious thing you did to upset your parents?", category: "Teenage", intensity: "medium" },
  { id: "nostalgia_015", deckId: "friends_nostalgia", question: "What was your 'dream car' when you were 16?", category: "Teenage", intensity: "mild" },

  //   Category: Tech & Trends
  { id: "nostalgia_016", deckId: "friends_nostalgia", question: "What was the first cell phone you ever owned?", category: "Tech", intensity: "mild" },
  { id: "nostalgia_017", deckId: "friends_nostalgia", question: "Do you remember the first viral video you ever saw on the internet?", category: "Tech", intensity: "mild" },
  { id: "nostalgia_018", deckId: "friends_nostalgia", question: "What’s a fashion trend you followed that makes you cringe when you see photos?", category: "Tech", intensity: "medium" },
  { id: "nostalgia_019", deckId: "friends_nostalgia", question: "Did you have a MySpace, Tumblr, or a physical diary?", category: "Tech", intensity: "mild" },
  { id: "nostalgia_020", deckId: "friends_nostalgia", question: "What was your favorite video game console growing up?", category: "Tech", intensity: "mild" },

  //   Category: Family Traditions
  { id: "nostalgia_021", deckId: "friends_nostalgia", question: "What was a quirky holiday tradition your family had?", category: "Family", intensity: "mild" },
  { id: "nostalgia_022", deckId: "friends_nostalgia", question: "What’s the best piece of advice your grandparents ever gave you?", category: "Family", intensity: "medium" },
  { id: "nostalgia_023", deckId: "friends_nostalgia", question: "Who was the 'fun' relative you always looked forward to seeing?", category: "Family", intensity: "mild" },
  { id: "nostalgia_024", deckId: "friends_nostalgia", question: "What was your favorite home-cooked meal that you can’t quite replicate?", category: "Family", intensity: "mild" },
  { id: "nostalgia_025", deckId: "friends_nostalgia", question: "What’s a story your family tells about you that you wish they’d forget?", category: "Family", intensity: "medium" },

  //   Category: Pop Culture Rewind
  { id: "nostalgia_026", deckId: "friends_nostalgia", question: "Which celebrity did you have a poster of on your wall?", category: "Pop Culture", intensity: "mild" },
  { id: "nostalgia_027", deckId: "friends_nostalgia", question: "What was the first movie that ever made you cry?", category: "Pop Culture", intensity: "medium" },
  { id: "nostalgia_028", deckId: "friends_nostalgia", question: "If you could bring back one defunct brand or store, which would it be?", category: "Pop Culture", intensity: "mild" },
  { id: "nostalgia_029", deckId: "friends_nostalgia", question: "What was the most iconic 'fad' you ever participated in?", category: "Pop Culture", intensity: "mild" },
  { id: "nostalgia_030", deckId: "friends_nostalgia", question: "Which fictional character was your ultimate role model growing up?", category: "Pop Culture", intensity: "medium" },

  //   Category: Small Victories
  { id: "nostalgia_031", deckId: "friends_nostalgia", question: "What’s a childhood accomplishment you’re still strangely proud of?", category: "Victories", intensity: "mild" },
  { id: "nostalgia_032", deckId: "friends_nostalgia", question: "What was the first thing you ever bought with your own earned money?", category: "Victories", intensity: "mild" },
  { id: "nostalgia_033", deckId: "friends_nostalgia", question: "Do you remember the first time you felt like an 'adult'?", category: "Victories", intensity: "medium" },
  { id: "nostalgia_034", deckId: "friends_nostalgia", question: "What was your favorite 'win' from a sports team or competition?", category: "Victories", intensity: "mild" },
  { id: "nostalgia_035", deckId: "friends_nostalgia", question: "What’s the most difficult thing you successfully 'survived' in your youth?", category: "Victories", intensity: "deep" },

  //   Category: Travel & Places
  { id: "nostalgia_036", deckId: "friends_nostalgia", question: "Where was your first-ever family vacation?", category: "Travel", intensity: "mild" },
  { id: "nostalgia_037", deckId: "friends_nostalgia", question: "Is there a place from your childhood that doesn't exist anymore?", category: "Travel", intensity: "medium" },
  { id: "nostalgia_038", deckId: "friends_nostalgia", question: "What was the longest road trip you ever took as a kid?", category: "Travel", intensity: "mild" },
  { id: "nostalgia_039", deckId: "friends_nostalgia", question: "What’s a city or country you visited that changed your perspective?", category: "Travel", intensity: "deep" },
  { id: "nostalgia_040", deckId: "friends_nostalgia", question: "What was your 'hideout' or favorite secret spot growing up?", category: "Travel", intensity: "medium" },

  //   Category: First Times
  { id: "nostalgia_041", deckId: "friends_nostalgia", question: "What was your first job and what was the worst part of it?", category: "Firsts", intensity: "medium" },
  { id: "nostalgia_042", deckId: "friends_nostalgia", question: "Do you remember your first real 'heartbreak'?", category: "Firsts", intensity: "deep" },
  { id: "nostalgia_043", deckId: "friends_nostalgia", question: "What was the first CD or digital song you ever purchased?", category: "Firsts", intensity: "mild" },
  { id: "nostalgia_044", deckId: "friends_nostalgia", question: "What was the first big risk you ever took?", category: "Firsts", intensity: "deep" },
  { id: "nostalgia_045", deckId: "friends_nostalgia", question: "What was the first apartment or house you lived in like?", category: "Firsts", intensity: "medium" },

  //   Category: Forgotten Hobbies
  { id: "nostalgia_046", deckId: "friends_nostalgia", question: "What’s a talent you had as a kid that you’ve totally lost now?", category: "Hobbies", intensity: "medium" },
  { id: "nostalgia_047", deckId: "friends_nostalgia", question: "Did you ever collect something weird (like rocks or stamps)?", category: "Hobbies", intensity: "mild" },
  { id: "nostalgia_048", deckId: "friends_nostalgia", question: "What was your favorite book series growing up?", category: "Hobbies", intensity: "mild" },
  { id: "nostalgia_049", deckId: "friends_nostalgia", question: "Were you a 'sports' kid, a 'music' kid, or an 'art' kid?", category: "Hobbies", intensity: "medium" },
  { id: "nostalgia_050", deckId: "friends_nostalgia", question: "What’s a game you used to play that you wish adults could still play?", category: "Hobbies", intensity: "mild" },

  //   Category: Smell & Sound
  { id: "nostalgia_051", deckId: "friends_nostalgia", question: "What smell instantly reminds you of your childhood home?", category: "Senses", intensity: "medium" },
  { id: "nostalgia_052", deckId: "friends_nostalgia", question: "What song instantly takes you back to a specific summer?", category: "Senses", intensity: "mild" },
  { id: "nostalgia_053", deckId: "friends_nostalgia", question: "What was the 'sound' of your house growing up (e.g., a creaky floor)?", category: "Senses", intensity: "medium" },
  { id: "nostalgia_054", deckId: "friends_nostalgia", question: "What food smell makes you feel safe and comforted?", category: "Senses", intensity: "mild" },
  { id: "nostalgia_055", deckId: "friends_nostalgia", question: "What sound reminds you of being at school?", category: "Senses", intensity: "mild" },

  //   Category: Reflection
  { id: "nostalgia_056", deckId: "friends_nostalgia", question: "What’s the biggest way your personality has changed since you were 10?", category: "Reflection", intensity: "deep" },
  { id: "nostalgia_057", deckId: "friends_nostalgia", question: "What’s one thing you miss about being a child?", category: "Reflection", intensity: "medium" },
  { id: "nostalgia_058", deckId: "friends_nostalgia", question: "What’s one thing you *don't* miss about being a teenager?", category: "Reflection", intensity: "medium" },
  { id: "nostalgia_059", deckId: "friends_nostalgia", question: "If you could relive one single day from your past, which would it be?", category: "Reflection", intensity: "deep" },
  { id: "nostalgia_060", deckId: "friends_nostalgia", question: "What’s a childhood dream you actually managed to achieve?", category: "Reflection", intensity: "medium" },

  //   Category: White Lies & Social Faux Pas
  { id: "secrets_001", deckId: "friends_secret_confessions", question: "What is a lie you told to get out of a social event that no one ever found out about?", category: "White Lies", intensity: "medium" },
  { id: "secrets_002", deckId: "friends_secret_confessions", question: "Have you ever 'accidentally' seen a text on someone's phone and never mentioned it?", category: "White Lies", intensity: "medium" },
  { id: "secrets_003", deckId: "friends_secret_confessions", question: "What’s a gift someone gave you that you secretly hated or regifted immediately?", category: "White Lies", intensity: "mild" },
  { id: "secrets_004", deckId: "friends_secret_confessions", question: "Have you ever pretended to like a movie or song just to fit in with a group?", category: "White Lies", intensity: "mild" },
  { id: "secrets_005", deckId: "friends_secret_confessions", question: "What’s the most embarrassing thing you’ve done while 'stalking' someone on social media?", category: "White Lies", intensity: "medium" },

  //   Category: Spilling the Tea
  { id: "secrets_006", deckId: "friends_secret_confessions", question: "What’s the most scandalous piece of gossip you know that you’ve never repeated?", category: "Spilling Tea", intensity: "deep" },
  { id: "secrets_007", deckId: "friends_secret_confessions", question: "Is there a friend in our wider circle that you secretly can't stand?", category: "Spilling Tea", intensity: "deep" },
  { id: "secrets_008", deckId: "friends_secret_confessions", question: "Who is the one person you regret dating the most?", category: "Spilling Tea", intensity: "medium" },
  { id: "secrets_009", deckId: "friends_secret_confessions", question: "Have you ever been the 'villain' in someone else’s story?", category: "Spilling Tea", intensity: "deep" },
  { id: "secrets_010", deckId: "friends_secret_confessions", question: "What’s a secret about your family that you usually keep under wraps?", category: "Spilling Tea", intensity: "deep" },

  //   Category: Petty Grievances
  { id: "secrets_011", deckId: "friends_secret_confessions", question: "What’s a petty reason you’ve ghosted or stopped talking to someone?", category: "Petty", intensity: "medium" },
  { id: "secrets_012", deckId: "friends_secret_confessions", question: "What’s something 'annoying' I do that you’ve never told me about?", category: "Petty", intensity: "deep" },
  { id: "secrets_013", deckId: "friends_secret_confessions", question: "Have you ever muted someone on social media because their posts annoyed you too much?", category: "Petty", intensity: "mild" },
  { id: "secrets_014", deckId: "friends_secret_confessions", question: "What is a 'childish' grudge you are still holding onto?", category: "Petty", intensity: "medium" },
  { id: "secrets_015", deckId: "friends_secret_confessions", question: "What’s the meanest thing you’ve ever said behind someone's back?", category: "Petty", intensity: "deep" },

  //   Category: Work & Professional Secrets
  { id: "secrets_016", deckId: "friends_secret_confessions", question: "Have you ever taken credit for something at work that you didn't actually do?", category: "Work", intensity: "medium" },
  { id: "secrets_017", deckId: "friends_secret_confessions", question: "What’s the most 'unprofessional' thing you’ve done while on the clock?", category: "Work", intensity: "medium" },
  { id: "secrets_018", deckId: "friends_secret_confessions", question: "Have you ever lied on your resume? What was the lie?", category: "Work", intensity: "medium" },
  { id: "secrets_019", deckId: "friends_secret_confessions", question: "Who is the coworker you secretly wish would get fired?", category: "Work", intensity: "medium" },
  { id: "secrets_020", deckId: "friends_secret_confessions", question: "Have you ever called in sick when you were perfectly fine just because you wanted a 'me' day?", category: "Work", intensity: "mild" },

  //   Category: Romantic Confessions
  { id: "secrets_021", deckId: "friends_secret_confessions", question: "Who was your most 'inappropriate' crush (e.g., a friend's parent or an ex's sibling)?", category: "Romance", intensity: "deep" },
  { id: "secrets_022", deckId: "friends_secret_confessions", question: "Have you ever sent a risky text and immediately regretted it?", category: "Romance", intensity: "medium" },
  { id: "secrets_023", deckId: "friends_secret_confessions", question: "What is your biggest 'red flag' that you try to hide on first dates?", category: "Romance", intensity: "medium" },
  { id: "secrets_024", deckId: "friends_secret_confessions", question: "What’s the weirdest place you’ve ever hooked up with someone?", category: "Romance", intensity: "deep" },
  { id: "secrets_025", deckId: "friends_secret_confessions", question: "Have you ever stayed in a relationship long after you knew it was over?", category: "Romance", intensity: "deep" },

  //   Category: Guilt & Regret
  { id: "secrets_026", deckId: "friends_secret_confessions", question: "What is something you’ve done that you still feel guilty about today?", category: "Guilt", intensity: "deep" },
  { id: "secrets_027", deckId: "friends_secret_confessions", question: "If you could erase one day from your life, which one would it be?", category: "Guilt", intensity: "deep" },
  { id: "secrets_028", deckId: "friends_secret_confessions", question: "Have you ever betrayed someone’s trust to get ahead?", category: "Guilt", intensity: "deep" },
  { id: "secrets_029", deckId: "friends_secret_confessions", question: "What’s a secret you’re currently keeping from your parents?", category: "Guilt", intensity: "medium" },
  { id: "secrets_030", deckId: "friends_secret_confessions", question: "What is the biggest 'bridge' you’ve ever burned?", category: "Guilt", intensity: "deep" },

  //   Category: Money & Greed
  { id: "secrets_031", deckId: "friends_secret_confessions", question: "What’s the most money you’ve ever spent on something completely useless?", category: "Money", intensity: "mild" },
  { id: "secrets_032", deckId: "friends_secret_confessions", question: "Have you ever found money and kept it instead of trying to find the owner?", category: "Money", intensity: "medium" },
  { id: "secrets_033", deckId: "friends_secret_confessions", question: "What is your current bank account balance? (Only if you're brave!)", category: "Money", intensity: "deep" },
  { id: "secrets_034", deckId: "friends_secret_confessions", question: "Have you ever 'forgotten' to pay someone back, hoping they’d forget too?", category: "Money", intensity: "medium" },
  { id: "secrets_035", deckId: "friends_secret_confessions", question: "What’s the most expensive thing you’ve ever stolen (even as a kid)?", category: "Money", intensity: "medium" },

  //   Category: Personal Insecurities
  { id: "secrets_036", deckId: "friends_secret_confessions", question: "What’s an insecurity you have that no one would ever guess?", category: "Insecurity", intensity: "deep" },
  { id: "secrets_037", deckId: "friends_secret_confessions", question: "Do you ever feel like an 'imposter' in your own life?", category: "Insecurity", intensity: "deep" },
  { id: "secrets_038", deckId: "friends_secret_confessions", question: "What is one thing you’re jealous of in one of the people in this room?", category: "Insecurity", intensity: "deep" },
  { id: "secrets_039", deckId: "friends_secret_confessions", question: "What’s a physical feature of yours that you secretly hate but people compliment?", category: "Insecurity", intensity: "medium" },
  { id: "secrets_040", deckId: "friends_secret_confessions", question: "What is your biggest fear about the future?", category: "Insecurity", intensity: "medium" },

  //   Category: Habits & Quirks
  { id: "secrets_041", deckId: "friends_secret_confessions", question: "What’s a 'gross' habit you have when you’re completely alone?", category: "Quirks", intensity: "medium" },
  { id: "secrets_042", deckId: "friends_secret_confessions", question: "What’s a weird ritual you have to do before you go to sleep?", category: "Quirks", intensity: "mild" },
  { id: "secrets_043", deckId: "friends_secret_confessions", question: "What is the most 'childish' thing you still do as an adult?", category: "Quirks", intensity: "mild" },
  { id: "secrets_044", deckId: "friends_secret_confessions", question: "Do you have a 'burner' social media account? What do you use it for?", category: "Quirks", intensity: "medium" },
  { id: "secrets_045", deckId: "friends_secret_confessions", question: "What’s the longest you’ve ever gone without showering?", category: "Quirks", intensity: "mild" },

  //   Category: Deep Thoughts
  { id: "secrets_046", deckId: "friends_secret_confessions", question: "If you could know the exact date of your death, would you want to know?", category: "Deep Thoughts", intensity: "deep" },
  { id: "secrets_047", deckId: "friends_secret_confessions", question: "What is a belief you hold that most people would find controversial?", category: "Deep Thoughts", intensity: "deep" },
  { id: "secrets_048", deckId: "friends_secret_confessions", question: "Do you believe in life after death, or is this it?", category: "Deep Thoughts", intensity: "deep" },
  { id: "secrets_049", deckId: "friends_secret_confessions", question: "What’s a secret dream you have that you’re too scared to say out loud?", category: "Deep Thoughts", intensity: "deep" },
  { id: "secrets_050", deckId: "friends_secret_confessions", question: "If you could be anyone else for a week, would you actually do it?", category: "Deep Thoughts", intensity: "medium" },

  //   Category: Friendship Dynamics
  { id: "secrets_051", deckId: "friends_secret_confessions", question: "Who in this group do you think will be the first to get married (or married again)?", category: "Group Dynamics", intensity: "medium" },
  { id: "secrets_052", deckId: "friends_secret_confessions", question: "Have you ever felt left out of a group activity and didn't say anything?", category: "Group Dynamics", intensity: "medium" },
  { id: "secrets_053", deckId: "friends_secret_confessions", question: "Who in this room would you trust most with a literal 'life or death' secret?", category: "Group Dynamics", intensity: "deep" },
  { id: "secrets_054", deckId: "friends_secret_confessions", question: "What was your first honest impression of me, and how has it changed?", category: "Group Dynamics", intensity: "medium" },
  { id: "secrets_055", deckId: "friends_secret_confessions", question: "Have you ever lied to one of us to avoid hanging out?", category: "Group Dynamics", intensity: "medium" },

  //   Category: The 'Ultimate' Confessions
  { id: "secrets_056", deckId: "friends_secret_confessions", question: "What is the one thing you hope nobody ever finds out about you?", category: "Ultimate", intensity: "deep" },
  { id: "secrets_057", deckId: "friends_secret_confessions", question: "If you were arrested today, what would your friends think you did?", category: "Ultimate", intensity: "medium" },
  { id: "secrets_058", deckId: "friends_secret_confessions", question: "What’s the most 'illegal' thing you’ve ever done and gotten away with?", category: "Ultimate", intensity: "deep" },
  { id: "secrets_059", deckId: "friends_secret_confessions", question: "Have you ever ghosted a job or a landlord?", category: "Ultimate", intensity: "medium" },
  { id: "secrets_060", deckId: "friends_secret_confessions", question: "If you could tell one person in your life the absolute truth without consequences, who would it be and what would you say?", category: "Ultimate", intensity: "deep" },
  
  //   Category: 3 AM Calls
  { id: "loyalty_001", deckId: "friends_loyalty_test", question: "If I called you at 3 AM and said 'I need you to come pick me up, no questions asked,' would you do it?", category: "Reliability", intensity: "medium" },
  { id: "loyalty_002", deckId: "friends_loyalty_test", question: "Who in this group is the first person you call when you get amazing news?", category: "Reliability", intensity: "mild" },
  { id: "loyalty_003", deckId: "friends_loyalty_test", question: "Who is the first person you call when your life is falling apart?", category: "Reliability", intensity: "deep" },
  { id: "loyalty_004", deckId: "friends_loyalty_test", question: "What is the longest distance you would drive just to help a friend in a minor crisis?", category: "Reliability", intensity: "medium" },
  { id: "loyalty_005", deckId: "friends_loyalty_test", question: "If I was arrested, would you be the one sitting in the cell next to me or the one bailing me out?", category: "Reliability", intensity: "medium" },
  { id: "loyalty_006", deckId: "friends_loyalty_test", question: "Have you ever kept a secret for a friend that actually made you feel uncomfortable?", category: "Reliability", intensity: "deep" },
  { id: "loyalty_007", deckId: "friends_loyalty_test", question: "What is one thing I could do that would make you instantly stop being my friend?", category: "Reliability", intensity: "deep" },
  { id: "loyalty_008", deckId: "friends_loyalty_test", question: "Do you trust me enough to give me the password to your phone?", category: "Reliability", intensity: "medium" },
  { id: "loyalty_009", deckId: "friends_loyalty_test", question: "If we were in a survival situation, what is the one 'useful' skill you’d count on me for?", category: "Reliability", intensity: "mild" },
  { id: "loyalty_010", deckId: "friends_loyalty_test", question: "How many 'second chances' are you willing to give a best friend?", category: "Reliability", intensity: "deep" },

  //   Category: Hard Truths
  { id: "loyalty_011", deckId: "friends_loyalty_test", question: "If I was dating someone who was clearly bad for me, would you tell me even if it made me mad?", category: "Truth", intensity: "deep" },
  { id: "loyalty_012", deckId: "friends_loyalty_test", question: "Do you feel like you can tell me when I'm being an annoying person?", category: "Truth", intensity: "medium" },
  { id: "loyalty_013", deckId: "friends_loyalty_test", question: "What is a 'hard truth' about my personality that you think I need to hear?", category: "Truth", intensity: "deep" },
  { id: "loyalty_014", deckId: "friends_loyalty_test", question: "If I had food in my teeth or a fashion disaster, would you tell me immediately or wait for me to find out?", category: "Truth", intensity: "mild" },
  { id: "loyalty_015", deckId: "friends_loyalty_test", question: "Do you think I am a better listener or a better talker?", category: "Truth", intensity: "medium" },
  { id: "loyalty_016", deckId: "friends_loyalty_test", question: "What’s one habit of mine that you’ve just 'accepted' even though it bothers you?", category: "Truth", intensity: "medium" },
  { id: "loyalty_017", deckId: "friends_loyalty_test", question: "If I asked you for your honest opinion on my dream project, would you sugarcoat it?", category: "Truth", intensity: "medium" },
  { id: "loyalty_018", deckId: "friends_loyalty_test", question: "Do you think I've changed for the better or worse since we met?", category: "Truth", intensity: "deep" },
  { id: "loyalty_019", deckId: "friends_loyalty_test", question: "What is the biggest 'mistake' you’ve seen me make that you didn't comment on?", category: "Truth", intensity: "deep" },
  { id: "loyalty_020", deckId: "friends_loyalty_test", question: "If we had a major falling out, what is the first thing you’d miss about me?", category: "Truth", intensity: "deep" },

  //   Category: Support & Sacrifice
  { id: "loyalty_021", deckId: "friends_loyalty_test", question: "If I was short on rent this month, would you lend me the money without a return date?", category: "Support", intensity: "medium" },
  { id: "loyalty_022", deckId: "friends_loyalty_test", question: "What is the most 'boring' thing you’ve done with me just because you knew I wanted to do it?", category: "Support", intensity: "mild" },
  { id: "loyalty_023", deckId: "friends_loyalty_test", question: "If someone was talking trash about me behind my back, how would you react?", category: "Support", intensity: "medium" },
  { id: "loyalty_024", deckId: "friends_loyalty_test", question: "Have you ever lied to cover for me? What was the lie?", category: "Support", intensity: "medium" },
  { id: "loyalty_025", deckId: "friends_loyalty_test", question: "If I moved to a different country, how would you keep our friendship alive?", category: "Support", intensity: "medium" },
  { id: "loyalty_026", deckId: "friends_loyalty_test", question: "What’s the kindest thing I’ve ever done for you that you’ve never properly thanked me for?", category: "Support", intensity: "deep" },
  { id: "loyalty_027", deckId: "friends_loyalty_test", question: "Would you let me sleep on your couch for a month if I had nowhere else to go?", category: "Support", intensity: "medium" },
  { id: "loyalty_028", deckId: "friends_loyalty_test", question: "Do you feel like the 'emotional labor' in our friendship is equal?", category: "Support", intensity: "deep" },
  { id: "loyalty_029", deckId: "friends_loyalty_test", question: "What is a 'burden' you feel comfortable sharing with me but no one else?", category: "Support", intensity: "deep" },
  { id: "loyalty_030", deckId: "friends_loyalty_test", question: "If I was going through a breakup, would you stay on the phone with me all night?", category: "Support", intensity: "medium" },

  //   Category: Shared History
  { id: "loyalty_031", deckId: "friends_loyalty_test", question: "What was the exact moment you realized we were going to be 'real' friends?", category: "History", intensity: "medium" },
  { id: "loyalty_032", deckId: "friends_loyalty_test", question: "What is a 'phase' I went through that you are glad is over?", category: "History", intensity: "mild" },
  { id: "loyalty_033", deckId: "friends_loyalty_test", question: "Which of my ex-partners did you secretly dislike the most?", category: "History", intensity: "medium" },
  { id: "loyalty_034", deckId: "friends_loyalty_test", question: "If we had to describe our friendship as a movie genre, what would it be?", category: "History", intensity: "mild" },
  { id: "loyalty_035", deckId: "friends_loyalty_test", question: "What is the most 'adventurous' thing we’ve ever done together?", category: "History", intensity: "mild" },
  { id: "loyalty_036", deckId: "friends_loyalty_test", question: "What’s a secret I told you years ago that you still remember perfectly?", category: "History", intensity: "deep" },
  { id: "loyalty_037", deckId: "friends_loyalty_test", question: "What is the biggest 'near-miss' fight we almost had that could have ended the friendship?", category: "History", intensity: "deep" },
  { id: "loyalty_038", deckId: "friends_loyalty_test", question: "How has our relationship changed since the day we met?", category: "History", intensity: "medium" },
  { id: "loyalty_039", deckId: "friends_loyalty_test", question: "What was your first impression of my family or other friends?", category: "History", intensity: "medium" },
  { id: "loyalty_040", deckId: "friends_loyalty_test", question: "What is one 'tradition' we’ve accidentally started?", category: "History", intensity: "mild" },

  //   Category: Hypotheticals
  { id: "loyalty_041", deckId: "friends_loyalty_test", question: "If you won $10 million, what is the first thing you’d buy for me?", category: "Hypotheticals", intensity: "mild" },
  { id: "loyalty_042", deckId: "friends_loyalty_test", question: "If I was framed for a crime, would you help me hide or help me find the real killer?", category: "Hypotheticals", intensity: "medium" },
  { id: "loyalty_043", deckId: "friends_loyalty_test", question: "If you could switch lives with me for one week, what is the first thing you’d do?", category: "Hypotheticals", intensity: "medium" },
  { id: "loyalty_044", deckId: "friends_loyalty_test", question: "If we were both single and 80 years old, would you want to live in a retirement home together?", category: "Hypotheticals", intensity: "mild" },
  { id: "loyalty_045", deckId: "friends_loyalty_test", question: "If we were on a reality TV show, what would our 'team name' be?", category: "Hypotheticals", intensity: "mild" },
  { id: "loyalty_046", deckId: "friends_loyalty_test", question: "If you had to sacrifice your favorite hobby to help me through a crisis, would you?", category: "Hypotheticals", intensity: "deep" },
  { id: "loyalty_047", deckId: "friends_loyalty_test", question: "If I forgot your birthday, how long would you stay mad?", category: "Hypotheticals", intensity: "mild" },
  { id: "loyalty_048", deckId: "friends_loyalty_test", question: "If we were in a horror movie, who would die first and why?", category: "Hypotheticals", intensity: "mild" },
  { id: "loyalty_049", deckId: "friends_loyalty_test", question: "If you had to pick one person in this room to be your lawyer, who is it?", category: "Hypotheticals", intensity: "medium" },
  { id: "loyalty_050", deckId: "friends_loyalty_test", question: "If I wrote a book, what would the chapter about our friendship be titled?", category: "Hypotheticals", intensity: "medium" },

  //   Category: Deep Connection
  { id: "loyalty_051", deckId: "friends_loyalty_test", question: "What is a part of your identity that I understand better than anyone else?", category: "Connection", intensity: "deep" },
  { id: "loyalty_052", deckId: "friends_loyalty_test", question: "Do you think we’ll still be friends in 20 years?", category: "Connection", intensity: "medium" },
  { id: "loyalty_053", deckId: "friends_loyalty_test", question: "What is the biggest 'risk' you’ve taken on me?", category: "Connection", intensity: "deep" },
  { id: "loyalty_054", deckId: "friends_loyalty_test", question: "In what way have I helped you become a better person?", category: "Connection", intensity: "medium" },
  { id: "loyalty_055", deckId: "friends_loyalty_test", question: "What is one thing you’re jealous of when it comes to my life?", category: "Connection", intensity: "deep" },
  { id: "loyalty_056", deckId: "friends_loyalty_test", question: "What is the most 'vulnerable' you’ve ever been with me?", category: "Connection", intensity: "deep" },
  { id: "loyalty_057", deckId: "friends_loyalty_test", question: "Do you trust my judgment more than your own in certain areas?", category: "Connection", intensity: "medium" },
  { id: "loyalty_058", deckId: "friends_loyalty_test", question: "How would you describe the 'vibe' of our friendship to a stranger?", category: "Connection", intensity: "mild" },
  { id: "loyalty_059", deckId: "friends_loyalty_test", question: "What is one thing you hope we never stop doing together?", category: "Connection", intensity: "medium" },
  { id: "loyalty_060", deckId: "friends_loyalty_test", question: "What is the 'test' our friendship has already passed?", category: "Connection", intensity: "deep" },

  //   Category: Travel Habits
  { id: "travel_001", deckId: "friends_travel_buddies", question: "Are you the person who shows up 3 hours early for a flight or 30 minutes before the gate closes?", category: "Habits", intensity: "mild" },
  { id: "travel_002", deckId: "friends_travel_buddies", question: "Window seat, middle seat, or aisle? Defend your choice.", category: "Habits", intensity: "mild" },
  { id: "travel_003", deckId: "friends_travel_buddies", question: "What is your 'hard limit' for how many days we can spend together in one room before you need a break?", category: "Habits", intensity: "medium" },
  { id: "travel_004", deckId: "friends_travel_buddies", question: "Carry-on only or did you bring three suitcases for a weekend trip?", category: "Habits", intensity: "mild" },
  { id: "travel_005", deckId: "friends_travel_buddies", question: "Are you a 'let's wake up at 6 AM to see everything' person or a 'let's sleep in and find brunch' person?", category: "Habits", intensity: "mild" },
  { id: "travel_006", deckId: "friends_travel_buddies", question: "Physical map or Google Maps? Who is the designated navigator?", category: "Habits", intensity: "mild" },
  { id: "travel_007", deckId: "friends_travel_buddies", question: "What is the one snack that *must* be in the car for a road trip?", category: "Habits", intensity: "mild" },
  { id: "travel_008", deckId: "friends_travel_buddies", question: "How long can we drive in total silence before it gets awkward for you?", category: "Habits", intensity: "medium" },
  { id: "travel_009", deckId: "friends_travel_buddies", question: "Are you okay with 'hostel life' or is it 4-star hotels and above only?", category: "Habits", intensity: "medium" },
  { id: "travel_010", deckId: "friends_travel_buddies", question: "Who is in charge of the aux cord/music for the entire trip?", category: "Habits", intensity: "mild" },

  //   Category: Planning Style
  { id: "travel_011", deckId: "friends_travel_buddies", question: "Do you need a spreadsheet itinerary or are we just 'winging it'?", category: "Planning", intensity: "medium" },
  { id: "travel_012", deckId: "friends_travel_buddies", question: "What is a 'dealbreaker' location that you would never want to visit?", category: "Planning", intensity: "mild" },
  { id: "travel_013", deckId: "friends_travel_buddies", question: "How do you handle splitting bills? App like Splitwise or just taking turns?", category: "Planning", intensity: "medium" },
  { id: "travel_014", deckId: "friends_travel_buddies", question: "What’s the most 'adventurous' activity you’d actually agree to (e.g., skydiving, eating bugs)?", category: "Planning", intensity: "medium" },
  { id: "travel_015", deckId: "friends_travel_buddies", question: "Museums and history or bars and nightlife? Choose one for the whole trip.", category: "Planning", intensity: "mild" },
  { id: "travel_016", deckId: "friends_travel_buddies", question: "If we found a 'secret' spot that required a 4-hour hike, would you do it?", category: "Planning", intensity: "medium" },
  { id: "travel_017", deckId: "friends_travel_buddies", question: "What’s your budget style: 'Save every penny' or 'Treat ourselves, we’re on vacation'?", category: "Planning", intensity: "medium" },
  { id: "travel_018", deckId: "friends_travel_buddies", question: "Would you rather travel to a place where you speak the language or somewhere completely foreign?", category: "Planning", intensity: "mild" },
  { id: "travel_019", deckId: "friends_travel_buddies", question: "If we have a layover, are we staying in the airport or exploring the city?", category: "Planning", intensity: "mild" },
  { id: "travel_020", deckId: "friends_travel_buddies", question: "What is your #1 'must-pack' item that no one else thinks of?", category: "Planning", intensity: "mild" },

  //   Category: Nightmare Scenarios
  { id: "travel_021", deckId: "friends_travel_buddies", question: "If we lose our luggage on day one, how long before you start crying?", category: "Stress", intensity: "medium" },
  { id: "travel_022", deckId: "friends_travel_buddies", question: "We get a flat tire in the middle of nowhere. What is your first reaction?", category: "Stress", intensity: "medium" },
  { id: "travel_023", deckId: "friends_travel_buddies", question: "If I get 'hangry' and start being mean, how do you handle me?", category: "Stress", intensity: "medium" },
  { id: "travel_024", deckId: "friends_travel_buddies", question: "What is the worst 'travel fail' you’ve ever experienced?", category: "Stress", intensity: "mild" },
  { id: "travel_025", deckId: "friends_travel_buddies", question: "If we miss our flight, whose fault is it most likely going to be?", category: "Stress", intensity: "medium" },
  { id: "travel_026", deckId: "friends_travel_buddies", question: "How do you react to a hotel room that is significantly worse than the pictures?", category: "Stress", intensity: "medium" },
  { id: "travel_027", deckId: "friends_travel_buddies", question: "What is your 'social battery' like on day 5 of a group trip?", category: "Stress", intensity: "medium" },
  { id: "travel_028", deckId: "friends_travel_buddies", question: "If we get separated in a foreign city with no phone battery, what is the plan?", category: "Stress", intensity: "deep" },
  { id: "travel_029", deckId: "friends_travel_buddies", question: "Who is more likely to lose their passport?", category: "Stress", intensity: "mild" },
  { id: "travel_030", deckId: "friends_travel_buddies", question: "What’s the most 'disgusting' thing you’d tolerate for a good travel story?", category: "Stress", intensity: "medium" },

  //   Category: Interaction & Dynamics
  { id: "travel_031", deckId: "friends_travel_buddies", question: "What’s the best thing about traveling with me specifically?", category: "Dynamics", intensity: "mild" },
  { id: "travel_032", deckId: "friends_travel_buddies", question: "What’s the one thing I do that would make you want to go home early?", category: "Dynamics", intensity: "deep" },
  { id: "travel_033", deckId: "friends_travel_buddies", question: "Are we the type of travel buddies who can sit in a cafe for 3 hours and not talk?", category: "Dynamics", intensity: "mild" },
  { id: "travel_034", deckId: "friends_travel_buddies", question: "Who is the 'mom/dad' of the trip (the one with the sunscreen and water)?", category: "Dynamics", intensity: "mild" },
  { id: "travel_035", deckId: "friends_travel_buddies", question: "How do you feel about meeting new 'travel friends' and inviting them to hang out with us?", category: "Dynamics", intensity: "medium" },
  { id: "travel_036", deckId: "friends_travel_buddies", question: "Do you prefer to share a bed to save money or do we need our own space?", category: "Dynamics", intensity: "medium" },
  { id: "travel_037", deckId: "friends_travel_buddies", question: "What is your favorite travel memory of us (or what would you want it to be)?", category: "Dynamics", intensity: "medium" },
  { id: "travel_038", deckId: "friends_travel_buddies", question: "Who is more likely to get us scammed by a street vendor?", category: "Dynamics", intensity: "mild" },
  { id: "travel_039", deckId: "friends_travel_buddies", question: "What is your 'pet peeve' in a travel companion?", category: "Dynamics", intensity: "medium" },
  { id: "travel_040", deckId: "friends_travel_buddies", question: "If we had to take a 12-hour bus ride, how would we entertain ourselves?", category: "Dynamics", intensity: "mild" },

  //   Category: The 'Deep' Side of Travel
  { id: "travel_041", deckId: "friends_travel_buddies", question: "Does traveling make you feel more or less connected to your 'real life'?", category: "Deep", intensity: "deep" },
  { id: "travel_042", deckId: "friends_travel_buddies", question: "What is one thing you’ve learned about yourself only through traveling?", category: "Deep", intensity: "deep" },
  { id: "travel_043", deckId: "friends_travel_buddies", question: "Do you think a friendship can truly survive a month-long trip without a fight?", category: "Deep", intensity: "medium" },
  { id: "travel_044", deckId: "friends_travel_buddies", question: "Which city in the world do you think 'feels' most like me?", category: "Deep", intensity: "medium" },
  { id: "travel_045", deckId: "friends_travel_buddies", question: "If you could move to any city we’ve visited together, would you?", category: "Deep", intensity: "medium" },
  { id: "travel_046", deckId: "friends_travel_buddies", question: "What is the most 'spiritual' or emotional travel experience you’ve ever had?", category: "Deep", intensity: "deep" },
  { id: "travel_047", deckId: "friends_travel_buddies", question: "Do you prefer to 'find yourself' while traveling or just lose yourself?", category: "Deep", intensity: "deep" },
  { id: "travel_048", deckId: "friends_travel_buddies", question: "What’s one thing you miss most about home when you're away?", category: "Deep", intensity: "medium" },
  { id: "travel_049", deckId: "friends_travel_buddies", question: "If we could travel back in time to any era, where are we going?", category: "Deep", intensity: "mild" },
  { id: "travel_050", deckId: "friends_travel_buddies", question: "How do you want to be remembered as a traveler?", category: "Deep", intensity: "deep" },

  //   Category: Food & Culture
  { id: "travel_051", deckId: "friends_travel_buddies", question: "Are we eating street food every meal or do we need one 'fancy' dinner?", category: "Experience", intensity: "mild" },
  { id: "travel_052", deckId: "friends_travel_buddies", question: "What’s the weirdest thing you’ve ever eaten abroad?", category: "Experience", intensity: "mild" },
  { id: "travel_053", deckId: "friends_travel_buddies", question: "If we had to learn a local dance or craft, would you be embarrassed?", category: "Experience", intensity: "mild" },
  { id: "travel_054", deckId: "friends_travel_buddies", question: "Do you like to visit 'tourist traps' just to say you did?", category: "Experience", intensity: "mild" },
  { id: "travel_055", deckId: "friends_travel_buddies", question: "What is your favorite local drink from another country?", category: "Experience", intensity: "mild" },
  { id: "travel_056", deckId: "friends_travel_buddies", question: "How much of the local language do you try to learn before we land?", category: "Experience", intensity: "medium" },
  { id: "travel_057", deckId: "friends_travel_buddies", question: "Do you prefer visiting crowded cities or empty nature?", category: "Experience", intensity: "mild" },
  { id: "travel_058", deckId: "friends_travel_buddies", question: "What’s the one souvenir you *always* buy?", category: "Experience", intensity: "mild" },
  { id: "travel_059", deckId: "friends_travel_buddies", question: "What is the most beautiful thing you’ve ever seen with your own eyes?", category: "Experience", intensity: "medium" },
  { id: "travel_060", deckId: "friends_travel_buddies", question: "Where is the very first place we should go after we finish this game?", category: "Experience", intensity: "mild" },

  //   Category: Main Character Energy
  { id: "hype_001", deckId: "friends_hype_man", question: "If [Name] was the lead in a movie, what would the title be?", category: "Main Character", intensity: "mild" },
  { id: "hype_002", deckId: "friends_hype_man", question: "What is a 'superpower' I have that I don’t seem to realize?", category: "Main Character", intensity: "medium" },
  { id: "hype_003", deckId: "friends_hype_man", question: "Which historical figure or celebrity shares the most 'vibe' with me?", category: "Main Character", intensity: "mild" },
  { id: "hype_004", deckId: "friends_hype_man", question: "What is the most 'iconic' thing I’ve ever said or done in this group?", category: "Main Character", intensity: "medium" },
  { id: "hype_005", deckId: "friends_hype_man", question: "If I was a brand, what would my slogan be?", category: "Main Character", intensity: "mild" },
  { id: "hype_006", deckId: "friends_hype_man", question: "What is one thing I’m so good at that I should charge people for it?", category: "Main Character", intensity: "mild" },
  { id: "hype_007", deckId: "friends_hype_man", question: "In a heist movie, what specific role would I play because of my skills?", category: "Main Character", intensity: "mild" },
  { id: "hype_008", deckId: "friends_hype_man", question: "What is the 'aura' I give off when I first walk into a room?", category: "Main Character", intensity: "medium" },
  { id: "hype_009", deckId: "friends_hype_man", question: "If I wrote an autobiography, which one of you would write the foreword?", category: "Main Character", intensity: "medium" },
  { id: "hype_010", deckId: "friends_hype_man", question: "What is a talent of mine that you find genuinely intimidating?", category: "Main Character", intensity: "medium" },

  //   Category: Hidden Gems (Underrated Traits)
  { id: "hype_011", deckId: "friends_hype_man", question: "What is an underrated quality I have that people often overlook?", category: "Hidden Gems", intensity: "deep" },
  { id: "hype_012", deckId: "friends_hype_man", question: "What is a small, quiet way that I show I care about people?", category: "Hidden Gems", intensity: "deep" },
  { id: "hype_013", deckId: "friends_hype_man", question: "What is something I’m 'low-key' the best at in this room?", category: "Hidden Gems", intensity: "medium" },
  { id: "hype_014", deckId: "friends_hype_man", question: "Which part of my 'growth' over the last year have you been most impressed by?", category: "Hidden Gems", intensity: "deep" },
  { id: "hype_015", deckId: "friends_hype_man", question: "What is a secret 'nerdy' topic I know way too much about that makes me cooler?", category: "Hidden Gems", intensity: "mild" },
  { id: "hype_016", deckId: "friends_hype_man", question: "How do I make people feel safe without even trying?", category: "Hidden Gems", intensity: "deep" },
  { id: "hype_017", deckId: "friends_hype_man", question: "What is the best piece of advice I’ve ever given that you actually followed?", category: "Hidden Gems", intensity: "medium" },
  { id: "hype_018", deckId: "friends_hype_man", question: "What is a physical feature of mine that I’m probably insecure about but shouldn't be?", category: "Hidden Gems", intensity: "medium" },
  { id: "hype_019", deckId: "friends_hype_man", question: "What is the most 'pure' or wholesome thing about my personality?", category: "Hidden Gems", intensity: "deep" },
  { id: "hype_020", deckId: "friends_hype_man", question: "If I disappeared, what is the one specific 'gap' in our friend group that no one else could fill?", category: "Hidden Gems", intensity: "deep" },

  //   Category: Social Superpowers
  { id: "hype_021", deckId: "friends_hype_man", question: "Who is the person I could introduce to anyone and they’d be friends in 5 minutes?", category: "Social", intensity: "mild" },
  { id: "hype_022", deckId: "friends_hype_man", question: "What is my 'social superpower'—the thing I do that makes people like me?", category: "Social", intensity: "medium" },
  { id: "hype_023", deckId: "friends_hype_man", question: "If we were in a high-stress situation, why would I be the one to keep everyone calm?", category: "Social", intensity: "medium" },
  { id: "hype_024", deckId: "friends_hype_man", question: "What is the funniest thing I’ve ever said when I wasn't even trying to be funny?", category: "Social", intensity: "mild" },
  { id: "hype_025", deckId: "friends_hype_man", question: "How would you describe my 'laugh' to someone who has never heard it?", category: "Social", intensity: "mild" },
  { id: "hype_026", deckId: "friends_hype_man", question: "What is the best 'vibe' I’ve ever brought to a party?", category: "Social", intensity: "mild" },
  { id: "hype_027", deckId: "friends_hype_man", question: "Why do you think strangers feel comfortable talking to me?", category: "Social", intensity: "medium" },
  { id: "hype_028", deckId: "friends_hype_man", question: "If I was a host of a talk show, who would be my first guest?", category: "Social", intensity: "mild" },
  { id: "hype_029", deckId: "friends_hype_man", question: "What is one social situation that I 'dominate' in the best way possible?", category: "Social", intensity: "medium" },
  { id: "hype_030", deckId: "friends_hype_man", question: "What is my 'signature move' when I’m out in public?", category: "Social", intensity: "mild" },

  //   Category: Accomplishments & Future
  { id: "hype_031", deckId: "friends_hype_man", question: "What is a major goal I have that you 100% believe I will achieve?", category: "Future", intensity: "medium" },
  { id: "hype_032", deckId: "friends_hype_man", question: "What will my life look like when I’m 'at my peak'?", category: "Future", intensity: "medium" },
  { id: "hype_033", deckId: "friends_hype_man", question: "If I won an award today, what would it be for?", category: "Future", intensity: "mild" },
  { id: "hype_034", deckId: "friends_hype_man", question: "Which one of my current 'projects' am I going to be famous for?", category: "Future", intensity: "medium" },
  { id: "hype_035", deckId: "friends_hype_man", question: "What is a 'world record' I could actually break if I tried?", category: "Future", intensity: "mild" },
  { id: "hype_036", deckId: "friends_hype_man", question: "How would you describe my 'legacy' if you were giving a speech about me?", category: "Future", intensity: "deep" },
  { id: "hype_037", deckId: "friends_hype_man", question: "What is one thing I’m doing right now that is going to pay off big time later?", category: "Future", intensity: "medium" },
  { id: "hype_038", deckId: "friends_hype_man", question: "If I were to start a movement, what would it be about?", category: "Future", intensity: "deep" },
  { id: "hype_039", deckId: "friends_hype_man", question: "Who is my 'biggest fan' in this room (besides me)?", category: "Future", intensity: "mild" },
  { id: "hype_040", deckId: "friends_hype_man", question: "Where do you see me living in 10 years based on my vibe?", category: "Future", intensity: "mild" },

  //   Category: Reliable Vibes (Support)
  { id: "hype_041", deckId: "friends_hype_man", question: "What was a time I showed up for you when you really needed it?", category: "Support", intensity: "deep" },
  { id: "hype_042", deckId: "friends_hype_man", question: "What is the 'smartest' thing I’ve ever helped you realize?", category: "Support", intensity: "medium" },
  { id: "hype_043", deckId: "friends_hype_man", question: "If you were in a crisis, why would I be the first person you'd call?", category: "Support", intensity: "deep" },
  { id: "hype_044", deckId: "friends_hype_man", question: "What is the most 'selfless' thing you’ve seen me do?", category: "Support", intensity: "deep" },
  { id: "hype_045", deckId: "friends_hype_man", question: "How do I make you feel like a better version of yourself?", category: "Support", intensity: "deep" },
  { id: "hype_046", deckId: "friends_hype_man", question: "What’s one thing I’m 'always right' about?", category: "Support", intensity: "medium" },
  { id: "hype_047", deckId: "friends_hype_man", question: "If you were writing my Tinder/Dating profile, what’s the first 'selling point' you’d list?", category: "Support", intensity: "mild" },
  { id: "hype_048", deckId: "friends_hype_man", question: "What is one way I’ve changed your perspective on life?", category: "Support", intensity: "deep" },
  { id: "hype_049", deckId: "friends_hype_man", question: "What is a 'hard truth' I told you that actually helped you grow?", category: "Support", intensity: "deep" },
  { id: "hype_050", deckId: "friends_hype_man", question: "How do you know I’m 'on your team' even when we aren't talking?", category: "Support", intensity: "deep" },

  //   Category: Quick Hits
  { id: "hype_051", deckId: "friends_hype_man", question: "What’s my best outfit?", category: "Style", intensity: "mild" },
  { id: "hype_052", deckId: "friends_hype_man", question: "What is my 'spirit animal' and why is it something majestic?", category: "Style", intensity: "mild" },
  { id: "hype_053", deckId: "friends_hype_man", question: "Which fictional universe would I 'run' within a week of arriving?", category: "Style", intensity: "mild" },
  { id: "hype_054", deckId: "friends_hype_man", question: "What is the coolest thing about my house or my room?", category: "Style", intensity: "mild" },
  { id: "hype_055", deckId: "friends_hype_man", question: "If I were a cocktail, what would I be (and why is it top-shelf)?", category: "Style", intensity: "mild" },
  { id: "hype_056", deckId: "friends_hype_man", question: "What is one 'quirk' of mine that you find incredibly charming?", category: "Style", intensity: "medium" },
  { id: "hype_057", deckId: "friends_hype_man", question: "If I were an Olympian, which sport would I win gold in?", category: "Style", intensity: "mild" },
  { id: "hype_058", deckId: "friends_hype_man", question: "What is the best thing about my 'aesthetic'?", category: "Style", intensity: "mild" },
  { id: "hype_059", deckId: "friends_hype_man", question: "What is one way I’m 'built different' than most people?", category: "Style", intensity: "medium" },
  { id: "hype_060", deckId: "friends_hype_man", question: "In one word, what is my 'essence'?", category: "Style", intensity: "deep" },

  //   Category: Moral Dilemmas
  { id: "scenario_001", deckId: "friends_what_would_you_do", question: "You find a bag with $50,000 in cash. You know it belongs to a 'bad' person. Do you keep it?", category: "Moral", intensity: "medium" },
  { id: "scenario_002", deckId: "friends_what_would_you_do", question: "You can save the life of a complete stranger, but you have to give up your favorite hobby forever. Do you do it?", category: "Moral", intensity: "deep" },
  { id: "scenario_003", deckId: "friends_what_would_you_do", question: "Your best friend’s partner is cheating. If you tell them, your friendship might end. Do you keep the secret?", category: "Moral", intensity: "deep" },
  { id: "scenario_004", deckId: "friends_what_would_you_do", question: "You have the chance to be famous, but you have to betray one person from your past. Who is it and do you do it?", category: "Moral", intensity: "deep" },
  { id: "scenario_005", deckId: "friends_what_would_you_do", question: "You find out a local business you love is doing something unethical. Do you boycott them or keep going because you love the product?", category: "Moral", intensity: "medium" },
  { id: "scenario_006", deckId: "friends_what_would_you_do", question: "If you could eliminate one major world problem but had to stay anonymous and never get credit, which would it be?", category: "Moral", intensity: "medium" },
  { id: "scenario_007", deckId: "friends_what_would_you_do", question: "You see someone drop a $20 bill. They are clearly very wealthy. Do you return it or keep it?", category: "Moral", intensity: "mild" },
  { id: "scenario_008", deckId: "friends_what_would_you_do", question: "You could live in perfect happiness forever, but one person you don't know will be miserable for life. Do you accept?", category: "Moral", intensity: "deep" },
  { id: "scenario_009", deckId: "friends_what_would_you_do", question: "You have to choose between saving a rare animal species or a historical landmark. Which one stays?", category: "Moral", intensity: "medium" },
  { id: "scenario_010", deckId: "friends_what_would_you_do", question: "Would you lie under oath to protect a family member from a minor crime?", category: "Moral", intensity: "deep" },

  //   Category: Apocalypse & Survival
  { id: "scenario_011", deckId: "friends_what_would_you_do", question: "The zombie apocalypse starts right now. What is the first item in this room you use as a weapon?", category: "Survival", intensity: "mild" },
  { id: "scenario_012", deckId: "friends_what_would_you_do", question: "We are all stranded on a desert island. Who is the first person to get voted off and why?", category: "Survival", intensity: "medium" },
  { id: "scenario_013", deckId: "friends_what_would_you_do", question: "You can only save one person in this room from a sinking ship. How do you choose?", category: "Survival", intensity: "deep" },
  { id: "scenario_014", deckId: "friends_what_would_you_do", question: "You have to live in the woods for a year with nothing but a knife. Do you survive?", category: "Survival", intensity: "medium" },
  { id: "scenario_015", deckId: "friends_what_would_you_do", question: "Aliens land and want one person from Earth to represent humanity. Who in this room are we sending?", category: "Survival", intensity: "medium" },
  { id: "scenario_016", deckId: "friends_what_would_you_do", question: "A global blackout happens. No tech for a month. What is your 'new' daily hobby?", category: "Survival", intensity: "mild" },
  { id: "scenario_017", deckId: "friends_what_would_you_do", question: "You have to build a new society from scratch. What is the very first law you pass?", category: "Survival", intensity: "medium" },
  { id: "scenario_018", deckId: "friends_what_would_you_do", question: "If we were in a 'Hunger Games' situation, who in this room wins and what was their strategy?", category: "Survival", intensity: "medium" },
  { id: "scenario_019", deckId: "friends_what_would_you_do", question: "You can have a bunker that protects you from anything, but you have to live there alone for 10 years. Do you go?", category: "Survival", intensity: "deep" },
  { id: "scenario_020", deckId: "friends_what_would_you_do", question: "What is your 'Plan B' if your current career suddenly becomes obsolete?", category: "Survival", intensity: "medium" },

  //   Category: Social Awkwardness
  { id: "scenario_021", deckId: "friends_what_would_you_do", question: "You realize you’ve been talking for 10 minutes with your fly down. How do you recover?", category: "Social", intensity: "mild" },
  { id: "scenario_022", deckId: "friends_what_would_you_do", question: "You accidentally send a text complaining about someone *to* that person. What is your follow-up text?", category: "Social", intensity: "medium" },
  { id: "scenario_023", deckId: "friends_what_would_you_do", question: "You’re at a fancy dinner and you hate the food. Do you finish it to be polite or find an excuse?", category: "Social", intensity: "mild" },
  { id: "scenario_024", deckId: "friends_what_would_you_do", question: "A stranger thinks you are a celebrity and asks for an autograph. Do you sign it or explain the mistake?", category: "Social", intensity: "mild" },
  { id: "scenario_025", deckId: "friends_what_would_you_do", question: "You’re at a party and you forget the host's name. How do you find out without asking?", category: "Social", intensity: "mild" },
  { id: "scenario_026", deckId: "friends_what_would_you_do", question: "You walk into a bathroom and see someone you know crying. Do you stay and help or quietly leave?", category: "Social", intensity: "medium" },
  { id: "scenario_027", deckId: "friends_what_would_you_do", question: "You have to give a 5-minute speech right now on a topic you know nothing about. What topic do you pick to 'fake' it?", category: "Social", intensity: "medium" },
  { id: "scenario_028", deckId: "friends_what_would_you_do", question: "You are on a date and your ex walks in. What is your move?", category: "Social", intensity: "medium" },
  { id: "scenario_029", deckId: "friends_what_would_you_do", question: "Someone tells a joke that isn't funny. Do you fake laugh or stare in silence?", category: "Social", intensity: "mild" },
  { id: "scenario_030", deckId: "friends_what_would_you_do", question: "You’re stuck in an elevator for 2 hours with your 'arch-nemesis.' What do you talk about?", category: "Social", intensity: "medium" },

  //   Category: Wealth & Fame
  { id: "scenario_031", deckId: "friends_what_would_you_do", question: "You win $100 million but you can never speak to your family again. Do you take it?", category: "Wealth", intensity: "deep" },
  { id: "scenario_032", deckId: "friends_what_would_you_do", question: "You can be the most famous person on Earth for one day, but then you are forgotten by everyone. Do you do it?", category: "Wealth", intensity: "medium" },
  { id: "scenario_033", deckId: "friends_what_would_you_do", question: "If you had to spend $1 million in 24 hours (no investments allowed), what are you buying?", category: "Wealth", intensity: "mild" },
  { id: "scenario_034", deckId: "friends_what_would_you_do", question: "You can have any job in the world with a $1M salary, but you have to work 80 hours a week. What is the job?", category: "Wealth", intensity: "medium" },
  { id: "scenario_035", deckId: "friends_what_would_you_do", question: "You have to choose between being 'rich and hated' or 'poor and loved.' Which is it?", category: "Wealth", intensity: "deep" },
  { id: "scenario_036", deckId: "friends_what_would_you_do", question: "If you could buy one historical artifact, what would it be?", category: "Wealth", intensity: "mild" },
  { id: "scenario_037", deckId: "friends_what_would_you_do", question: "You win a lifetime supply of one thing, but it’s something you currently dislike. What is it?", category: "Wealth", intensity: "mild" },
  { id: "scenario_038", deckId: "friends_what_would_you_do", question: "Would you rather have a personal chef, a personal driver, or a personal assistant?", category: "Wealth", intensity: "mild" },
  { id: "scenario_039", deckId: "friends_what_would_you_do", question: "If you could fund one scientific breakthrough, what would it be?", category: "Wealth", intensity: "medium" },
  { id: "scenario_040", deckId: "friends_what_would_you_do", question: "You can retire tomorrow, but you have to move to a country where you don't know the language. Are you going?", category: "Wealth", intensity: "medium" },

  //   Category: Magic & Sci-Fi
  { id: "scenario_041", deckId: "friends_what_would_you_do", question: "You can go back in time and change one thing about your own life. What is it?", category: "Sci-Fi", intensity: "deep" },
  { id: "scenario_042", deckId: "friends_what_would_you_do", question: "You can hear people’s thoughts, but you can’t turn it off. Is this a gift or a curse?", category: "Sci-Fi", intensity: "medium" },
  { id: "scenario_043", deckId: "friends_what_would_you_do", question: "You find a remote that can pause, rewind, and fast-forward time. What’s the first thing you pause?", category: "Sci-Fi", intensity: "medium" },
  { id: "scenario_044", deckId: "friends_what_would_you_do", question: "You can teleport anywhere in the world, but every time you do, you lose one random memory. Do you use it?", category: "Sci-Fi", intensity: "deep" },
  { id: "scenario_045", deckId: "friends_what_would_you_do", question: "You can live forever, but you stop aging at 90 years old. Do you take the deal?", category: "Sci-Fi", intensity: "deep" },
  { id: "scenario_046", deckId: "friends_what_would_you_do", question: "You can speak every language fluently, but you lose the ability to read and write. Do you accept?", category: "Sci-Fi", intensity: "medium" },
  { id: "scenario_047", deckId: "friends_what_would_you_do", question: "If you could switch bodies with one person in this room for a day, who would it be?", category: "Sci-Fi", intensity: "medium" },
  { id: "scenario_048", deckId: "friends_what_would_you_do", question: "You find out that the world is a simulation. What’s the first 'glitch' you try to exploit?", category: "Sci-Fi", intensity: "medium" },
  { id: "scenario_049", deckId: "friends_what_would_you_do", question: "You can have a dragon as a pet, but you have to feed it $1,000 worth of food a day. Do you keep it?", category: "Sci-Fi", intensity: "mild" },
  { id: "scenario_050", deckId: "friends_what_would_you_do", question: "If you could see 5 minutes into the future at all times, how would you change your life?", category: "Sci-Fi", intensity: "medium" },

  //   Category: Wildcard
  { id: "scenario_051", deckId: "friends_what_would_you_do", question: "You have to choose one food to eat for every meal for the rest of your life. What is it?", category: "Wildcard", intensity: "mild" },
  { id: "scenario_052", deckId: "friends_what_would_you_do", question: "You can only use one app on your phone for the next year. Which one stays?", category: "Wildcard", intensity: "medium" },
  { id: "scenario_053", deckId: "friends_what_would_you_do", question: "If you were a ghost and could only communicate through one item in a house, what would it be?", category: "Wildcard", intensity: "mild" },
  { id: "scenario_054", deckId: "friends_what_would_you_do", question: "You have to spend a week living as the opposite gender. What’s the first thing you do?", category: "Wildcard", intensity: "medium" },
  { id: "scenario_055", deckId: "friends_what_would_you_do", question: "You are offered a one-way trip to Mars to start a colony. Are you going?", category: "Wildcard", intensity: "deep" },
  { id: "scenario_056", deckId: "friends_what_would_you_do", question: "You can change one physical law of the universe (e.g., gravity, speed of light). What do you change?", category: "Wildcard", intensity: "medium" },
  { id: "scenario_057", deckId: "friends_what_would_you_do", question: "If you were reincarnated as an animal, which one would you choose to be?", category: "Wildcard", intensity: "mild" },
  { id: "scenario_058", deckId: "friends_what_would_you_do", question: "You have to give up one of your 5 senses. Which one goes?", category: "Wildcard", intensity: "deep" },
  { id: "scenario_059", deckId: "friends_what_would_you_do", question: "If you could merge two animals together to create the ultimate pet, what are they?", category: "Wildcard", intensity: "mild" },
  { id: "scenario_060", deckId: "friends_what_would_you_do", question: "If you were the last person on Earth, what is the very first thing you’d do?", category: "Wildcard", intensity: "deep" },

  //   Category: Movie Magic
  { id: "pop_001", deckId: "friends_pop_culture", question: "What is one 'classic' movie that you’ve never seen and refuse to watch?", category: "Movies", intensity: "mild" },
  { id: "pop_002", deckId: "friends_pop_culture", question: "If you could live in any fictional movie world, which one would it be?", category: "Movies", intensity: "medium" },
  { id: "pop_003", deckId: "friends_pop_culture", question: "What movie have you watched at least 10 times and could quote line-for-line?", category: "Movies", intensity: "mild" },
  { id: "pop_004", deckId: "friends_pop_culture", question: "Who is the greatest movie villain of all time?", category: "Movies", intensity: "medium" },
  { id: "pop_005", deckId: "friends_pop_culture", question: "What is the best movie snack/drink combo? Defend your choice.", category: "Movies", intensity: "mild" },
  { id: "pop_006", deckId: "friends_pop_culture", question: "If they made a movie of your life, which actor would play you?", category: "Movies", intensity: "medium" },
  { id: "pop_007", deckId: "friends_pop_culture", question: "What’s the most 'emotionally damaging' movie you’ve ever seen?", category: "Movies", intensity: "deep" },
  { id: "pop_008", deckId: "friends_pop_culture", question: "Is 'Die Hard' a Christmas movie? Let’s settle this.", category: "Movies", intensity: "mild" },
  { id: "pop_009", deckId: "friends_pop_culture", question: "What is the worst casting choice in cinematic history?", category: "Movies", intensity: "medium" },
  { id: "pop_010", deckId: "friends_pop_culture", question: "If you could change the ending of any movie, which one would it be?", category: "Movies", intensity: "medium" },

  //   Category: Music & Soundtracks
  { id: "pop_011", deckId: "friends_pop_culture", question: "What is your absolute 'guilty pleasure' song that you’d never play on the aux?", category: "Music", intensity: "medium" },
  { id: "pop_012", deckId: "friends_pop_culture", question: "If you could only listen to one album for the rest of your life, what is it?", category: "Music", intensity: "deep" },
  { id: "pop_013", deckId: "friends_pop_culture", question: "What was the first concert you ever went to? Was it actually good?", category: "Music", intensity: "mild" },
  { id: "pop_014", deckId: "friends_pop_culture", question: "Which artist or band do you think is completely overrated?", category: "Music", intensity: "medium" },
  { id: "pop_015", deckId: "friends_pop_culture", question: "What’s your 'walk-out' song if you were a pro athlete?", category: "Music", intensity: "mild" },
  { id: "pop_016", deckId: "friends_pop_culture", question: "Vinyl, CDs, or Streaming? What is the superior way to hear music?", category: "Music", intensity: "mild" },
  { id: "pop_017", deckId: "friends_pop_culture", question: "If you could attend any concert in history (dead or alive), who are you seeing?", category: "Music", intensity: "medium" },
  { id: "pop_018", deckId: "friends_pop_culture", question: "What song instantly makes you think of this friend group?", category: "Music", intensity: "medium" },
  { id: "pop_019", deckId: "friends_pop_culture", question: "Who is the 'Greatest of All Time' in your favorite genre?", category: "Music", intensity: "medium" },
  { id: "pop_020", deckId: "friends_pop_culture", question: "What’s the best movie soundtrack ever made?", category: "Music", intensity: "mild" },

  //   Category: Binge-worthy TV
  { id: "pop_021", deckId: "friends_pop_culture", question: "What is the best TV show finale you’ve ever seen? And the worst?", category: "TV", intensity: "medium" },
  { id: "pop_022", deckId: "friends_pop_culture", question: "If you could join any sitcom friend group, which one would it be?", category: "TV", intensity: "mild" },
  { id: "pop_023", deckId: "friends_pop_culture", question: "What is your 'comfort' show that you put on when you’re stressed?", category: "TV", intensity: "mild" },
  { id: "pop_024", deckId: "friends_pop_culture", question: "Reality TV: Love it, hate it, or 'it’s a trainwreck I can’t stop watching'?", category: "TV", intensity: "medium" },
  { id: "pop_025", deckId: "friends_pop_culture", question: "Which TV character is basically you in another universe?", category: "TV", intensity: "medium" },
  { id: "pop_026", deckId: "friends_pop_culture", question: "What show did everyone love that you just couldn't get into?", category: "TV", intensity: "medium" },
  { id: "pop_027", deckId: "friends_pop_culture", question: "Do you skip the intro or watch it every time?", category: "TV", intensity: "mild" },
  { id: "pop_028", deckId: "friends_pop_culture", question: "What’s a show that was canceled too soon?", category: "TV", intensity: "mild" },
  { id: "pop_029", deckId: "friends_pop_culture", question: "HBO, Netflix, or Disney+? If you could only keep one.", category: "TV", intensity: "medium" },
  { id: "pop_030", deckId: "friends_pop_culture", question: "What is the most 'underrated' show that more people need to watch?", category: "TV", intensity: "medium" },

  //   Category: Internet & Memes
  { id: "pop_031", deckId: "friends_pop_culture", question: "What is the weirdest YouTube rabbit hole you’ve ever fallen down?", category: "Internet", intensity: "medium" },
  { id: "pop_032", deckId: "friends_pop_culture", question: "What was your first favorite meme or viral video?", category: "Internet", intensity: "mild" },
  { id: "pop_033", deckId: "friends_pop_culture", question: "What is your most used emoji? (Be honest!)", category: "Internet", intensity: "mild" },
  { id: "pop_034", deckId: "friends_pop_culture", question: "TikTok or Reels? Or are you a 'stay away from short-form' person?", category: "Internet", intensity: "mild" },
  { id: "pop_035", deckId: "friends_pop_culture", question: "What is the 'best' corner of the internet for you?", category: "Internet", intensity: "medium" },
  { id: "pop_036", deckId: "friends_pop_culture", question: "Which viral trend or 'challenge' did you actually participate in?", category: "Internet", intensity: "mild" },
  { id: "pop_037", deckId: "friends_pop_culture", question: "If you had to delete every app on your phone except for one, what stays?", category: "Internet", intensity: "medium" },
  { id: "pop_038", deckId: "friends_pop_culture", question: "Who is the most 'wholesome' celebrity on the internet?", category: "Internet", intensity: "mild" },
  { id: "pop_039", deckId: "friends_pop_culture", question: "What’s an 'internet slang' word that you hate but find yourself using anyway?", category: "Internet", intensity: "mild" },
  { id: "pop_040", deckId: "friends_pop_culture", question: "Do you believe the internet has made us more or less connected as friends?", category: "Internet", intensity: "deep" },

  //   Category: Fandoms & Gaming
  { id: "pop_041", deckId: "friends_pop_culture", question: "Marvel or DC? Choose a side.", category: "Fandom", intensity: "mild" },
  { id: "pop_042", deckId: "friends_pop_culture", question: "What is your Hogwarts House? (And do you actually agree with it?)", category: "Fandom", intensity: "mild" },
  { id: "pop_043", deckId: "friends_pop_culture", question: "What is the first video game you ever fell in love with?", category: "Gaming", intensity: "mild" },
  { id: "pop_044", deckId: "friends_pop_culture", question: "If you could only play one board game for the rest of your life, what is it?", category: "Gaming", intensity: "medium" },
  { id: "pop_045", deckId: "friends_pop_culture", question: "Are you a 'casual gamer' or 'competitive gamer'?", category: "Gaming", intensity: "medium" },
  { id: "pop_046", deckId: "friends_pop_culture", question: "What is the most 'toxic' fandom you’ve ever encountered?", category: "Fandom", intensity: "medium" },
  { id: "pop_047", deckId: "friends_pop_culture", question: "If you could be any Pokemon, which one are you?", category: "Fandom", intensity: "mild" },
  { id: "pop_048", deckId: "friends_pop_culture", question: "Star Wars or Star Trek?", category: "Fandom", intensity: "mild" },
  { id: "pop_049", deckId: "friends_pop_culture", question: "What is a 'theory' about a movie or show that you 100% believe is true?", category: "Fandom", intensity: "medium" },
  { id: "pop_050", deckId: "friends_pop_culture", question: "What is your #1 desert island video game?", category: "Gaming", intensity: "medium" },

  //   Category: Celebrity & Gossip
  { id: "pop_051", deckId: "friends_pop_culture", question: "Who was your first celebrity crush? Do you still see it?", category: "Celebrity", intensity: "mild" },
  { id: "pop_052", deckId: "friends_pop_culture", question: "If you could have dinner with any celebrity, who is it?", category: "Celebrity", intensity: "medium" },
  { id: "pop_053", deckId: "friends_pop_culture", question: "What celebrity 'scandal' were you most invested in?", category: "Celebrity", intensity: "medium" },
  { id: "pop_054", deckId: "friends_pop_culture", question: "Which celebrity do people say you look like (even if they're lying)?", category: "Celebrity", intensity: "mild" },
  { id: "pop_055", deckId: "friends_pop_culture", question: "If you were famous, what would you be famous for?", category: "Celebrity", intensity: "medium" },
  { id: "pop_056", deckId: "friends_pop_culture", question: "What’s the most 'unhinged' thing you’ve seen a celebrity do?", category: "Celebrity", intensity: "medium" },
  { id: "pop_057", deckId: "friends_pop_culture", question: "Who is the most 'untouchable' celebrity that nobody could ever hate?", category: "Celebrity", intensity: "mild" },
  { id: "pop_058", deckId: "friends_pop_culture", question: "What is the best 'star-studded' event you'd love to be invited to?", category: "Celebrity", intensity: "mild" },
  { id: "pop_059", deckId: "friends_pop_culture", question: "If you could swap lives with a celebrity for a week, who is it?", category: "Celebrity", intensity: "medium" },
  { id: "pop_060", deckId: "friends_pop_culture", question: "Which celebrity's career do you respect the most?", category: "Celebrity", intensity: "deep" }
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