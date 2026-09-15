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
  { id: "party", title: "🎉 Party", tagline: "Chaos, laughter & wild stories" }
];

const decks = [
  // ── PARTY (Action/Game oriented) ──
  { id: "party_wild_stories", modeId: "party", title: "🍻 Wild Stories", description: "Tell your craziest life stories", isLocked: false },
  { id: "party_truth_bombs", modeId: "party", title: "🔥 Truth Bombs", description: "Questions that expose the truth", isLocked: false },
  { id: "party_most_likely", modeId: "party", title: "👉 Most Likely To...", description: "Point to the person who fits best", isLocked: false },
  { id: "party_roast_me", modeId: "party", title: "🔥 Friendly Roast", description: "Playful jabs at your friends' habits", isLocked: false },
  { id: "party_never_have_i_light", modeId: "party", title: "✋ Never Have I", description: "The classic game to find the rebels", isLocked: false },
  { id: "party_unpopular_opinions", modeId: "party", title: "😈 Hot Takes", description: "Debates that spark chaos", isLocked: true },
  { id: "party_dares", modeId: "party", title: "🃏 Wild Dares", description: "Action-oriented cards for the brave", isLocked: true },
  { id: "party_paranoia", modeId: "party", title: "🤫 Paranoia", description: "Whispered questions that demand names", isLocked: true },

];
const cards = [
  //   Category: Nights to Remember
  // { id: "wild_001", deckId: "party_wild_stories", question: "What is the most 'main character' moment you’ve ever had in public?", category: "Nights Out", intensity: "medium" },
  // { id: "wild_002", deckId: "party_wild_stories", question: "What’s the most legendary party you’ve ever attended? What made it so wild?", category: "Nights Out", intensity: "medium" },
  // { id: "wild_003", deckId: "party_wild_stories", question: "Have you ever woken up in a place you didn't recognize? Tell the story.", category: "Nights Out", intensity: "high" },
  // { id: "wild_004", deckId: "party_wild_stories", question: "What is the most expensive mistake you’ve ever made while partying?", category: "Nights Out", intensity: "medium" },
  // { id: "wild_005", deckId: "party_wild_stories", question: "What’s the weirdest thing you’ve ever seen happen at a wedding?", category: "Nights Out", intensity: "medium" },

  // //   Category: Travel Chaos
  // { id: "wild_006", deckId: "party_wild_stories", question: "What’s your 'vacation from hell' story?", category: "Travel", intensity: "medium" },
  // { id: "wild_007", deckId: "party_wild_stories", question: "Have you ever been stranded in a foreign country? How did you get home?", category: "Travel", intensity: "medium" },
  // { id: "wild_008", deckId: "party_wild_stories", question: "What’s the sketchiest transportation you’ve ever taken?", category: "Travel", intensity: "medium" },
  // { id: "wild_009", deckId: "party_wild_stories", question: "Have you ever snuck into somewhere you weren't supposed to be?", category: "Travel", intensity: "high" },
  // { id: "wild_010", deckId: "party_wild_stories", question: "What is the most 'I shouldn't have survived that' thing you've done abroad?", category: "Travel", intensity: "high" },

  // //   Category: Close Calls & Law
  // { id: "wild_011", deckId: "party_wild_stories", question: "What’s your closest brush with the law that didn't end in an arrest?", category: "Close Calls", intensity: "high" },
  // { id: "wild_012", deckId: "party_wild_stories", question: "Have you ever been kicked out of a venue? What for?", category: "Close Calls", intensity: "medium" },
  // { id: "wild_013", deckId: "party_wild_stories", question: "What’s the biggest lie you’ve ever told to get out of trouble?", category: "Close Calls", intensity: "high" },
  // { id: "wild_014", deckId: "party_wild_stories", question: "Have you ever had a run-in with a celebrity? How did it go?", category: "Close Calls", intensity: "mild" },
  // { id: "wild_015", deckId: "party_wild_stories", question: "What’s the most illegal thing you’ve ever done (and gotten away with)?", category: "Close Calls", intensity: "high" },

  // //   Category: Dating Disasters
  // { id: "wild_016", deckId: "party_wild_stories", question: "What is your absolute worst first date story?", category: "Dating", intensity: "medium" },
  // { id: "wild_017", deckId: "party_wild_stories", question: "Have you ever been 'catfished' or realized you were the catfish?", category: "Dating", intensity: "medium" },
  // { id: "wild_018", deckId: "party_wild_stories", question: "What’s the most awkward way you’ve been 'caught' with someone?", category: "Dating", intensity: "high" },
  // { id: "wild_019", deckId: "party_wild_stories", question: "Have you ever been on a date with someone who turned out to be a complete lunatic?", category: "Dating", intensity: "medium" },
  // { id: "wild_020", deckId: "party_wild_stories", question: "What’s the cringiest pickup line you’ve ever used (or had used on you)?", category: "Dating", intensity: "mild" },

  // //   Category: Work & School Fails
  // { id: "wild_021", deckId: "party_wild_stories", question: "What is the most 'unprofessional' thing you’ve ever done at a job?", category: "Fails", intensity: "medium" },
  // { id: "wild_022", deckId: "party_wild_stories", question: "Have you ever accidentally sent a text *about* someone *to* that person?", category: "Fails", intensity: "medium" },
  // { id: "wild_023", deckId: "party_wild_stories", question: "What was your most epic 'failing grade' or 'fired' story?", category: "Fails", intensity: "medium" },
  // { id: "wild_024", deckId: "party_wild_stories", question: "Have you ever pulled a prank that went way too far?", category: "Fails", intensity: "high" },
  // { id: "wild_025", deckId: "party_wild_stories", question: "What’s the most embarrassing thing that happened to you in a Zoom meeting?", category: "Fails", intensity: "mild" },

  // //   Category: Modern Chaos
  // { id: "wild_026", deckId: "party_wild_stories", question: "What is the most unhinged thing you’ve ever seen on a group chat?", category: "Modern", intensity: "medium" },
  // { id: "wild_027", deckId: "party_wild_stories", question: "Have you ever gone viral for something you regret?", category: "Modern", intensity: "medium" },
  // { id: "wild_028", deckId: "party_wild_stories", question: "What’s the weirdest DM you’ve ever received from a stranger?", category: "Modern", intensity: "mild" },
  // { id: "wild_029", deckId: "party_wild_stories", question: "Have you ever 'stalked' someone online and accidentally liked a photo from 3 years ago?", category: "Modern", intensity: "mild" },
  // { id: "wild_030", deckId: "party_wild_stories", question: "What is the strangest purchase you’ve ever made while under the influence?", category: "Modern", intensity: "medium" },

  // //   Category: Party Tricks & Talents
  // { id: "wild_031", deckId: "party_wild_stories", question: "What is your go-to 'party trick' that always gets a reaction?", category: "Skills", intensity: "mild" },
  // { id: "wild_032", deckId: "party_wild_stories", question: "What’s the most impressive thing you’ve done purely to show off?", category: "Skills", intensity: "medium" },
  // { id: "wild_033", deckId: "party_wild_stories", question: "Have you ever entered a competition you had no business being in?", category: "Skills", intensity: "mild" },
  // { id: "wild_034", deckId: "party_wild_stories", question: "What is the most useless talent you possess?", category: "Skills", intensity: "mild" },
  // { id: "wild_035", deckId: "party_wild_stories", question: "Have you ever won a bet that seemed impossible?", category: "Skills", intensity: "medium" },

  // //   Category: The Morning After
  // { id: "wild_036", deckId: "party_wild_stories", question: "What is your most legendary hangover cure that actually works?", category: "Regret", intensity: "mild" },
  // { id: "wild_037", deckId: "party_wild_stories", question: "What is the most 'shameful' breakfast you’ve ever eaten?", category: "Regret", intensity: "mild" },
  // { id: "wild_038", deckId: "party_wild_stories", question: "Have you ever had to apologize to a neighbor for something that happened the night before?", category: "Regret", intensity: "medium" },
  // { id: "wild_039", deckId: "party_wild_stories", question: "What is the most 'out of character' thing you've ever done while drinking?", category: "Regret", intensity: "high" },
  // { id: "wild_040", deckId: "party_wild_stories", question: "What is a story you’ve been told about yourself that you have zero memory of?", category: "Regret", intensity: "high" },

  // //   Category: Adrenaline & Risks
  // { id: "wild_041", deckId: "party_wild_stories", question: "What’s the most dangerous thing you’ve ever done for fun?", category: "Risks", intensity: "high" },
  // { id: "wild_042", deckId: "party_wild_stories", question: "Have you ever trespassed to get a good photo or view?", category: "Risks", intensity: "medium" },
  // { id: "wild_043", deckId: "party_wild_stories", question: "What’s the biggest gamble you’ve ever taken with your money?", category: "Risks", intensity: "medium" },
  // { id: "wild_044", deckId: "party_wild_stories", question: "Have you ever been skydiving, bungee jumping, or something similar? Any fails?", category: "Risks", intensity: "medium" },
  // { id: "wild_045", deckId: "party_wild_stories", question: "What is the 'scariest' person you’ve ever had to talk your way out of a situation with?", category: "Risks", intensity: "high" },

  // //   Category: Small Victories
  // { id: "wild_046", deckId: "party_wild_stories", question: "What is the coolest thing you’ve ever found on the ground?", category: "Wins", intensity: "mild" },
  // { id: "wild_047", deckId: "party_wild_stories", question: "Have you ever bluffed your way into a VIP section or an exclusive event?", category: "Wins", intensity: "medium" },
  // { id: "wild_048", deckId: "party_wild_stories", question: "What’s the best 'freebie' you’ve ever talked someone into giving you?", category: "Wins", intensity: "medium" },
  // { id: "wild_049", deckId: "party_wild_stories", question: "What’s the most 'luck' you’ve ever had in a single 24-hour period?", category: "Wins", intensity: "medium" },
  // { id: "wild_050", deckId: "party_wild_stories", question: "Have you ever met a hero and actually had a good experience?", category: "Wins", intensity: "mild" },

  // //   Category: Animal Encounters
  // { id: "wild_051", deckId: "party_wild_stories", question: "What is the scariest animal you’ve ever encountered in the wild?", category: "Animals", intensity: "medium" },
  // { id: "wild_052", deckId: "party_wild_stories", question: "Have you ever been attacked by a common animal (like a goose or a squirrel)?", category: "Animals", intensity: "mild" },
  // { id: "wild_053", deckId: "party_wild_stories", question: "What’s the weirdest thing you’ve ever seen a pet do?", category: "Animals", intensity: "mild" },
  // { id: "wild_054", deckId: "party_wild_stories", question: "If you had to fight a bear or a shark, which are you choosing and why?", category: "Animals", intensity: "medium" },
  // { id: "wild_055", deckId: "party_wild_stories", question: "What’s your best 'pet-sitting gone wrong' story?", category: "Animals", intensity: "medium" },

  // //   Category: Ultimate Party Finisher
  // { id: "wild_056", deckId: "party_wild_stories", question: "What is the one story you tell everyone to prove you’ve lived a wild life?", category: "Legacy", intensity: "high" },
  // { id: "wild_057", deckId: "party_wild_stories", question: "What’s the most 'illegal-sounding' thing that is actually perfectly legal?", category: "Legacy", intensity: "medium" },
  // { id: "wild_058", deckId: "party_wild_stories", question: "If your life was a movie, what would the trailer for your wild years look like?", category: "Legacy", intensity: "medium" },
  // { id: "wild_059", deckId: "party_wild_stories", question: "What’s a secret you’ve never told anyone because you’re afraid they won’t believe you?", category: "Legacy", intensity: "high" },
  // { id: "wild_060", deckId: "party_wild_stories", question: "If you could do it all over again, which 'wild' choice would you definitely repeat?", category: "Legacy", intensity: "high" },

  // //   Category: Hard Truths
  // { id: "truth_001", deckId: "party_truth_bombs", question: "If everyone in this room was in a horror movie, who would be the first to die?", category: "Hard Truths", intensity: "medium" },
  // { id: "truth_002", deckId: "party_truth_bombs", question: "What is the most 'fake' thing about your social media presence?", category: "Hard Truths", intensity: "medium" },
  // { id: "truth_003", deckId: "party_truth_bombs", question: "Who in this room do you think is the most likely to be a secret millionaire?", category: "Hard Truths", intensity: "mild" },
  // { id: "truth_004", deckId: "party_truth_bombs", question: "What is a harsh truth that you think I need to hear?", category: "Hard Truths", intensity: "high" },
  // { id: "truth_005", deckId: "party_truth_bombs", question: "If you had to delete one person in this room from your life, who would it be?", category: "Hard Truths", intensity: "high" },
  // { id: "truth_006", deckId: "party_truth_bombs", question: "What’s the most shallow reason you’ve ever stopped talking to someone?", category: "Hard Truths", intensity: "medium" },
  // { id: "truth_007", deckId: "party_truth_bombs", question: "Who do you think has the worst taste in music in this group?", category: "Hard Truths", intensity: "mild" },
  // { id: "truth_008", deckId: "party_truth_bombs", question: "If you could change one thing about your partner (or ex) without them knowing, what would it be?", category: "Hard Truths", intensity: "high" },
  // { id: "truth_009", deckId: "party_truth_bombs", question: "What is the most 'basic' thing about you?", category: "Hard Truths", intensity: "mild" },
  // { id: "truth_010", deckId: "party_truth_bombs", question: "Have you ever let someone take the blame for something you did?", category: "Hard Truths", intensity: "high" },

  // //   Category: Ego & Image
  // { id: "truth_011", deckId: "party_truth_bombs", question: "What’s the most embarrassing thing you’ve done to get a crush's attention?", category: "Ego", intensity: "medium" },
  // { id: "truth_012", deckId: "party_truth_bombs", question: "Do you think you are the most attractive person in this room right now?", category: "Ego", intensity: "high" },
  // { id: "truth_013", deckId: "party_truth_bombs", question: "What is one thing you’re incredibly jealous of regarding someone else's life?", category: "Ego", intensity: "medium" },
  // { id: "truth_014", deckId: "party_truth_bombs", question: "How many selfies do you take before you find one you like?", category: "Ego", intensity: "mild" },
  // { id: "truth_015", deckId: "party_truth_bombs", question: "What is the most expensive thing you’ve bought just to flex on others?", category: "Ego", intensity: "medium" },
  // { id: "truth_016", deckId: "party_truth_bombs", question: "Have you ever lied about your age or income to impress someone?", category: "Ego", intensity: "medium" },
  // { id: "truth_017", deckId: "party_truth_bombs", question: "Who here do you think is the 'weakest link' in a survival situation?", category: "Ego", intensity: "medium" },
  // { id: "truth_018", deckId: "party_truth_bombs", question: "Do you actually like your friends' kids, or are you just being polite?", category: "Ego", intensity: "medium" },
  // { id: "truth_019", deckId: "party_truth_bombs", question: "What’s the most you’ve ever spent to fix a mistake before anyone noticed?", category: "Ego", intensity: "medium" },
  // { id: "truth_020", deckId: "party_truth_bombs", question: "If you could trade lives with one person here, who would it be?", category: "Ego", intensity: "medium" },

  // //   Category: Secret Behaviors
  // { id: "truth_021", deckId: "party_truth_bombs", question: "What is the longest you’ve gone without brushing your teeth?", category: "Secrets", intensity: "mild" },
  // { id: "truth_022", deckId: "party_truth_bombs", question: "Have you ever snooped through a partner's phone?", category: "Secrets", intensity: "high" },
  // { id: "truth_023", deckId: "party_truth_bombs", question: "What is the weirdest thing you’ve ever done while home alone?", category: "Secrets", intensity: "medium" },
  // { id: "truth_024", deckId: "party_truth_bombs", question: "Do you have a 'finsta' or a burner account? What’s on it?", category: "Secrets", intensity: "medium" },
  // { id: "truth_025", deckId: "party_truth_bombs", question: "Have you ever stolen something from a workplace?", category: "Secrets", intensity: "medium" },
  // { id: "truth_026", deckId: "party_truth_bombs", question: "What’s the most 'illegal' thing you’ve done in the last 12 months?", category: "Secrets", intensity: "high" },
  // { id: "truth_027", deckId: "party_truth_bombs", question: "Who was the last person you 'hate-followed' on Instagram?", category: "Secrets", intensity: "medium" },
  // { id: "truth_028", deckId: "party_truth_bombs", question: "Have you ever ghosted someone you were actually dating?", category: "Secrets", intensity: "high" },
  // { id: "truth_029", deckId: "party_truth_bombs", question: "What is the biggest lie you told your parents that they still believe?", category: "Secrets", intensity: "high" },
  // { id: "truth_030", deckId: "party_truth_bombs", question: "Do you wash your feet in the shower, or just let the soapy water run over them?", category: "Secrets", intensity: "mild" },

  // //   Category: Social Dynamics
  // { id: "truth_031", deckId: "party_truth_bombs", question: "Who in this room would you least want to be stuck in an elevator with?", category: "Dynamics", intensity: "high" },
  // { id: "truth_032", deckId: "party_truth_bombs", question: "Which person here do you think has the most 'main character syndrome'?", category: "Dynamics", intensity: "medium" },
  // { id: "truth_033", deckId: "party_truth_bombs", question: "Have you ever muted someone’s stories because they were too annoying?", category: "Dynamics", intensity: "mild" },
  // { id: "truth_034", deckId: "party_truth_bombs", question: "If you had to borrow $10,000, who in this room would you ask first?", category: "Dynamics", intensity: "medium" },
  // { id: "truth_035", deckId: "party_truth_bombs", question: "Who here is the 'mom' or 'dad' of the group?", category: "Dynamics", intensity: "mild" },
  // { id: "truth_036", deckId: "party_truth_bombs", question: "Who in this room is the most likely to get arrested for something stupid?", category: "Dynamics", intensity: "medium" },
  // { id: "truth_037", deckId: "party_truth_bombs", question: "What is the first thing people usually get wrong about you when they meet you?", category: "Dynamics", intensity: "medium" },
  // { id: "truth_038", deckId: "party_truth_bombs", question: "Have you ever pretended to be busy just to avoid hanging out with us?", category: "Dynamics", intensity: "high" },
  // { id: "truth_039", deckId: "party_truth_bombs", question: "Who here do you think will be the most successful in 10 years?", category: "Dynamics", intensity: "medium" },
  // { id: "truth_040", deckId: "party_truth_bombs", question: "What’s the meanest thing you’ve ever said behind a friend’s back?", category: "Dynamics", intensity: "high" },

  // //   Category: Relationships & Romance
  // { id: "truth_041", deckId: "party_truth_bombs", question: "Have you ever been the 'other person' in an affair?", category: "Romance", intensity: "high" },
  // { id: "truth_042", deckId: "party_truth_bombs", question: "What is the most 'toxic' trait you have in a relationship?", category: "Romance", intensity: "high" },
  // { id: "truth_043", deckId: "party_truth_bombs", question: "Who is the 'one that got away' for you?", category: "Romance", intensity: "medium" },
  // { id: "truth_044", deckId: "party_truth_bombs", question: "Have you ever dated someone just because they were rich/successful?", category: "Romance", intensity: "high" },
  // { id: "truth_045", deckId: "party_truth_bombs", question: "What’s the fastest you’ve ever fallen 'in love'?", category: "Romance", intensity: "medium" },
  // { id: "truth_046", deckId: "party_truth_bombs", question: "Do you still look at your ex's social media? How often?", category: "Romance", intensity: "medium" },
  // { id: "truth_047", deckId: "party_truth_bombs", question: "What is your biggest 'red flag' that you ignore in other people?", category: "Romance", intensity: "medium" },
  // { id: "truth_048", deckId: "party_truth_bombs", question: "Have you ever sent a 'risky' text and then turned your phone off because you were too scared to see the reply?", category: "Romance", intensity: "mild" },
  // { id: "truth_049", deckId: "party_truth_bombs", question: "What is the most 'cringeworthy' thing you’ve done for love?", category: "Romance", intensity: "medium" },
  // { id: "truth_050", deckId: "party_truth_bombs", question: "If your partner gave you a 'hall pass' for one celebrity, who would it be?", category: "Romance", intensity: "mild" },

  // //   Category: Deep & Dark
  // { id: "truth_051", deckId: "party_truth_bombs", question: "What is one secret you will take to your grave?", category: "Deep", intensity: "high" },
  // { id: "truth_052", deckId: "party_truth_bombs", question: "Do you ever feel like you’re just 'acting' like an adult?", category: "Deep", intensity: "medium" },
  // { id: "truth_053", deckId: "party_truth_bombs", question: "What is your biggest regret that you haven’t made peace with yet?", category: "Deep", intensity: "high" },
  // { id: "truth_054", deckId: "party_truth_bombs", question: "If you could commit one crime and get away with it, what would it be?", category: "Deep", intensity: "high" },
  // { id: "truth_055", deckId: "party_truth_bombs", question: "What do you want your last words to be?", category: "Deep", intensity: "medium" },
  // { id: "truth_056", deckId: "party_truth_bombs", question: "Do you actually believe in 'The One,' or is it just timing?", category: "Deep", intensity: "medium" },
  // { id: "truth_057", deckId: "party_truth_bombs", question: "What is the most 'scandalous' thing you’ve ever seen with your own eyes?", category: "Deep", intensity: "high" },
  // { id: "truth_058", deckId: "party_truth_bombs", question: "If you died today, what would be the most embarrassing thing found in your search history?", category: "Deep", intensity: "high" },
  // { id: "truth_059", deckId: "party_truth_bombs", question: "What is the one thing you’re most afraid of losing?", category: "Deep", intensity: "medium" },
  // { id: "truth_060", deckId: "party_truth_bombs", question: "Are you truly happy with where you are in life right now?", category: "Deep", intensity: "high" },

  // //   Category: Social & Lifestyle
  // { id: "likely_001", deckId: "party_most_likely", question: "Most likely to go viral for something incredibly stupid?", category: "Social", intensity: "mild" },
  // { id: "likely_002", deckId: "party_most_likely", question: "Most likely to spend their entire paycheck in one weekend?", category: "Social", intensity: "medium" },
  // { id: "likely_003", deckId: "party_most_likely", question: "Most likely to have a secret burner account for 'investigating' people?", category: "Social", intensity: "medium" },
  // { id: "likely_004", deckId: "party_most_likely", question: "Most likely to become a high-end cult leader?", category: "Social", intensity: "medium" },
  // { id: "likely_005", deckId: "party_most_likely", question: "Most likely to accidentally join a gang while on vacation?", category: "Social", intensity: "medium" },
  // { id: "likely_006", deckId: "party_most_likely", question: "Most likely to win a reality TV show?", category: "Social", intensity: "mild" },
  // { id: "likely_007", deckId: "party_most_likely", question: "Most likely to own 10+ cats and talk to them like humans?", category: "Social", intensity: "mild" },
  // { id: "likely_008", deckId: "party_most_likely", question: "Most likely to end up on the news for 'Florida Man' behavior?", category: "Social", intensity: "medium" },
  // { id: "likely_009", deckId: "party_most_likely", question: "Most likely to ghost everyone and move to a different country without notice?", category: "Social", intensity: "medium" },
  // { id: "likely_010", deckId: "party_most_likely", question: "Most likely to stay in bed for 48 hours straight watching Netflix?", category: "Social", intensity: "mild" },

  // //   Category: Party & Nightlife
  // { id: "likely_011", deckId: "party_most_likely", question: "Most likely to lose their phone, keys, and dignity in one night?", category: "Nightlife", intensity: "medium" },
  // { id: "likely_012", deckId: "party_most_likely", question: "Most likely to start a fight with a bouncer because of a 'misunderstanding'?", category: "Nightlife", intensity: "medium" },
  // { id: "likely_013", deckId: "party_most_likely", question: "Most likely to be the last one standing at a party?", category: "Nightlife", intensity: "mild" },
  // { id: "likely_014", deckId: "party_most_likely", question: "Most likely to try to get everyone to do shots at 3 AM?", category: "Nightlife", intensity: "mild" },
  // { id: "likely_015", deckId: "party_most_likely", question: "Most likely to wake up in the morning with a tattoo they don't remember getting?", category: "Nightlife", intensity: "high" },
  // { id: "likely_016", deckId: "party_most_likely", question: "Most likely to cry in a taxi on the way home?", category: "Nightlife", intensity: "medium" },
  // { id: "likely_017", deckId: "party_most_likely", question: "Most likely to steal the microphone at a karaoke bar and refuse to give it back?", category: "Nightlife", intensity: "mild" },
  // { id: "likely_018", deckId: "party_most_likely", question: "Most likely to accidentally break something expensive at a house party?", category: "Nightlife", intensity: "medium" },
  // { id: "likely_019", deckId: "party_most_likely", question: "Most likely to spend the whole night 'networking' instead of partying?", category: "Nightlife", intensity: "mild" },
  // { id: "likely_020", deckId: "party_most_likely", question: "Most likely to fall asleep in the club?", category: "Nightlife", intensity: "mild" },

  // //   Category: Relationships & Romance
  // { id: "likely_021", deckId: "party_most_likely", question: "Most likely to get married in Vegas on a whim?", category: "Romance", intensity: "medium" },
  // { id: "likely_022", deckId: "party_most_likely", question: "Most likely to go on a date with someone just for the free meal?", category: "Romance", intensity: "medium" },
  // { id: "likely_023", deckId: "party_most_likely", question: "Most likely to fall in love with a stranger on a train?", category: "Romance", intensity: "mild" },
  // { id: "likely_024", deckId: "party_most_likely", question: "Most likely to be a 'serial dater'?", category: "Romance", intensity: "medium" },
  // { id: "likely_025", deckId: "party_most_likely", question: "Most likely to stay friends with all their exes?", category: "Romance", intensity: "mild" },
  // { id: "likely_026", deckId: "party_most_likely", question: "Most likely to get caught in a 'cheating' scandal (even if it's a misunderstanding)?", category: "Romance", intensity: "high" },
  // { id: "likely_027", deckId: "party_most_likely", question: "Most likely to have the most 'red flags' but hide them well?", category: "Romance", intensity: "medium" },
  // { id: "likely_028", deckId: "party_most_likely", question: "Most likely to marry for money?", category: "Romance", intensity: "medium" },
  // { id: "likely_029", deckId: "party_most_likely", question: "Most likely to forget their own anniversary?", category: "Romance", intensity: "mild" },
  // { id: "likely_030", deckId: "party_most_likely", question: "Most likely to be the one who gets 'dumped' via text?", category: "Romance", intensity: "medium" },

  // //   Category: Success & Survival
  // { id: "likely_031", deckId: "party_most_likely", question: "Most likely to survive a zombie apocalypse?", category: "Survival", intensity: "medium" },
  // { id: "likely_032", deckId: "party_most_likely", question: "Most likely to be the first one eaten in a zombie apocalypse?", category: "Survival", intensity: "medium" },
  // { id: "likely_033", deckId: "party_most_likely", question: "Most likely to become a billionaire and forget all our names?", category: "Survival", intensity: "medium" },
  // { id: "likely_034", deckId: "party_most_likely", question: "Most likely to end up on the Forbes '30 Under 30' list?", category: "Survival", intensity: "mild" },
  // { id: "likely_035", deckId: "party_most_likely", question: "Most likely to win the lottery and lose the ticket?", category: "Survival", intensity: "medium" },
  // { id: "likely_036", deckId: "party_most_likely", question: "Most likely to be the first one to go to jail?", category: "Survival", intensity: "high" },
  // { id: "likely_037", deckId: "party_most_likely", question: "Most likely to fake their own death and start a new life?", category: "Survival", intensity: "high" },
  // { id: "likely_038", deckId: "party_most_likely", question: "Most likely to survive on a deserted island because of their weird skills?", category: "Survival", intensity: "mild" },
  // { id: "likely_039", deckId: "party_most_likely", question: "Most likely to get fired for something they said on a 'hot mic'?", category: "Survival", intensity: "medium" },
  // { id: "likely_040", deckId: "party_most_likely", question: "Most likely to become a successful professional gambler?", category: "Survival", intensity: "medium" },

  // //   Category: Personality & Quirks
  // { id: "likely_041", deckId: "party_most_likely", question: "Most likely to start an argument over something they know nothing about?", category: "Quirks", intensity: "mild" },
  // { id: "likely_042", deckId: "party_most_likely", question: "Most likely to have the most embarrassing search history?", category: "Quirks", intensity: "high" },
  // { id: "likely_043", deckId: "party_most_likely", question: "Most likely to be a secret agent?", category: "Quirks", intensity: "medium" },
  // { id: "likely_044", deckId: "party_most_likely", question: "Most likely to believe in every conspiracy theory they hear?", category: "Quirks", intensity: "mild" },
  // { id: "likely_045", deckId: "party_most_likely", question: "Most likely to talk to themselves in public?", category: "Quirks", intensity: "mild" },
  // { id: "likely_046", deckId: "party_most_likely", question: "Most likely to laugh at the absolute wrong moment (like a funeral)?", category: "Quirks", intensity: "medium" },
  // { id: "likely_047", deckId: "party_most_likely", question: "Most likely to own a cursed object and not know it?", category: "Quirks", intensity: "mild" },
  // { id: "likely_048", deckId: "party_most_likely", question: "Most likely to fall for a pyramid scheme?", category: "Quirks", intensity: "medium" },
  // { id: "likely_049", deckId: "party_most_likely", question: "Most likely to have been an alien in a past life?", category: "Quirks", intensity: "mild" },
  // { id: "likely_050", deckId: "party_most_likely", question: "Most likely to spend 4 hours in the grocery store and come out with one item?", category: "Quirks", intensity: "mild" },

  // //   Category: The 'Ultimate' Takes
  // { id: "likely_051", deckId: "party_most_likely", question: "Most likely to be the 'villain' in someone else’s autobiography?", category: "Ultimate", intensity: "high" },
  // { id: "likely_052", deckId: "party_most_likely", question: "Most likely to be the first one to say 'I love you'?", category: "Ultimate", intensity: "mild" },
  // { id: "likely_053", deckId: "party_most_likely", question: "Most likely to live until they're 100 out of pure spite?", category: "Ultimate", intensity: "medium" },
  // { id: "likely_054", deckId: "party_most_likely", question: "Most likely to write a tell-all book about everyone in this room?", category: "Ultimate", intensity: "high" },
  // { id: "likely_055", deckId: "party_most_likely", question: "Most likely to go to their grave with a massive secret?", category: "Ultimate", intensity: "high" },
  // { id: "likely_056", deckId: "party_most_likely", question: "Most likely to be the 'unreliable' narrator of their own life?", category: "Ultimate", intensity: "medium" },
  // { id: "likely_057", deckId: "party_most_likely", question: "Most likely to get into a heated debate with a child and lose?", category: "Ultimate", intensity: "mild" },
  // { id: "likely_058", deckId: "party_most_likely", question: "Most likely to be the one we all have to bail out of jail?", category: "Ultimate", intensity: "medium" },
  // { id: "likely_059", deckId: "party_most_likely", question: "Most likely to actually be a ghost haunting this party right now?", category: "Ultimate", intensity: "mild" },
  // { id: "likely_060", deckId: "party_most_likely", question: "Most likely to find this game the most stressful?", category: "Ultimate", intensity: "mild" },

  // //   Category: Food Debates
  // { id: "hot_001", deckId: "party_unpopular_opinions", question: "Pineapple absolutely belongs on pizza. Yes or No?", category: "Food", intensity: "mild" },
  // { id: "hot_002", deckId: "party_unpopular_opinions", question: "Cereal is technically a cold soup. Thoughts?", category: "Food", intensity: "mild" },
  // { id: "hot_003", deckId: "party_unpopular_opinions", question: "Ketchup is the most overrated condiment in existence.", category: "Food", intensity: "mild" },
  // { id: "hot_004", deckId: "party_unpopular_opinions", question: "Steak is better when it's cooked Medium-Well than Medium-Rare.", category: "Food", intensity: "medium" },
  // { id: "hot_005", deckId: "party_unpopular_opinions", question: "Cold pizza is better than fresh, hot pizza.", category: "Food", intensity: "mild" },
  // { id: "hot_006", deckId: "party_unpopular_opinions", question: "Boneless wings are just expensive chicken nuggets.", category: "Food", intensity: "medium" },
  // { id: "hot_007", deckId: "party_unpopular_opinions", question: "Coffee tastes better when it’s 90% sugar and cream.", category: "Food", intensity: "mild" },
  // { id: "hot_008", deckId: "party_unpopular_opinions", question: "Chocolate-covered fruit is a waste of both chocolate and fruit.", category: "Food", intensity: "mild" },
  // { id: "hot_009", deckId: "party_unpopular_opinions", question: "Sparkling water tastes like static and is objectively bad.", category: "Food", intensity: "mild" },
  // { id: "hot_010", deckId: "party_unpopular_opinions", question: "The crust is the best part of the pizza.", category: "Food", intensity: "mild" },

  // //   Category: Pop Culture & Entertainment
  // { id: "hot_011", deckId: "party_unpopular_opinions", question: "Friends is a boring show that wouldn't survive today.", category: "Pop Culture", intensity: "medium" },
  // { id: "hot_012", deckId: "party_unpopular_opinions", question: "The book is NOT always better than the movie.", category: "Pop Culture", intensity: "medium" },
  // { id: "hot_013", deckId: "party_unpopular_opinions", question: "Beyoncé is overrated. (Be careful with this one!)", category: "Pop Culture", intensity: "high" },
  // { id: "hot_014", deckId: "party_unpopular_opinions", question: "Movie theaters are a dying medium and should just be replaced by home streaming.", category: "Pop Culture", intensity: "medium" },
  // { id: "hot_015", deckId: "party_unpopular_opinions", question: "Modern music is better than 'classic' 80s or 90s music.", category: "Pop Culture", intensity: "medium" },
  // { id: "hot_016", deckId: "party_unpopular_opinions", question: "The Marvel Cinematic Universe should have ended after Endgame.", category: "Pop Culture", intensity: "medium" },
  // { id: "hot_017", deckId: "party_unpopular_opinions", question: "Reality TV is more educational than most documentaries.", category: "Pop Culture", intensity: "medium" },
  // { id: "hot_018", deckId: "party_unpopular_opinions", question: "Remakes/Reboots are usually better than the originals.", category: "Pop Culture", intensity: "medium" },
  // { id: "hot_019", deckId: "party_unpopular_opinions", question: "Video games are a higher form of art than literature.", category: "Pop Culture", intensity: "high" },
  // { id: "hot_020", deckId: "party_unpopular_opinions", question: "Celebrities should have zero influence on politics.", category: "Pop Culture", intensity: "high" },

  // //   Category: Lifestyle & Society
  // { id: "hot_021", deckId: "party_unpopular_opinions", question: "Social media has done more harm to the world than good.", category: "Society", intensity: "high" },
  // { id: "hot_022", deckId: "party_unpopular_opinions", question: "A 4-day work week should be the global law, not a perk.", category: "Society", intensity: "medium" },
  // { id: "hot_023", deckId: "party_unpopular_opinions", question: "Working from home makes people less productive, even if they won't admit it.", category: "Society", intensity: "high" },
  // { id: "hot_024", deckId: "party_unpopular_opinions", question: "Weddings are a giant waste of money and should be private.", category: "Society", intensity: "medium" },
  // { id: "hot_025", deckId: "party_unpopular_opinions", question: "Children should not be allowed in fancy restaurants or first class.", category: "Society", intensity: "high" },
  // { id: "hot_026", deckId: "party_unpopular_opinions", question: "It is perfectly okay to ghost people after a first date.", category: "Society", intensity: "high" },
  // { id: "hot_027", deckId: "party_unpopular_opinions", question: "College degrees are becoming obsolete in the modern world.", category: "Society", intensity: "medium" },
  // { id: "hot_028", deckId: "party_unpopular_opinions", question: "Birthday parties for adults are unnecessary and cringey.", category: "Society", intensity: "medium" },
  // { id: "hot_029", deckId: "party_unpopular_opinions", question: "Tipping culture has gotten completely out of control.", category: "Society", intensity: "medium" },
  // { id: "hot_030", deckId: "party_unpopular_opinions", question: "Honesty is NOT the best policy in a relationship.", category: "Society", intensity: "high" },

  // //   Category: Tech & Future
  // { id: "hot_031", deckId: "party_unpopular_opinions", question: "AI will eventually be better at being 'human' than we are.", category: "Tech", intensity: "high" },
  // { id: "hot_032", deckId: "party_unpopular_opinions", question: "Apple products are just status symbols for people who don't understand tech.", category: "Tech", intensity: "medium" },
  // { id: "hot_033", deckId: "party_unpopular_opinions", question: "Paper books are inferior to Kindles/E-readers.", category: "Tech", intensity: "mild" },
  // { id: "hot_034", deckId: "party_unpopular_opinions", question: "The 'Metaverse' is a nightmare that no one actually wants.", category: "Tech", intensity: "medium" },
  // { id: "hot_035", deckId: "party_unpopular_opinions", question: "Privacy is a myth and we should stop pretending we care about it.", category: "Tech", intensity: "high" },
  // { id: "hot_036", deckId: "party_unpopular_opinions", question: "Voice notes are superior to texting in every way.", category: "Tech", intensity: "mild" },
  // { id: "hot_037", deckId: "party_unpopular_opinions", question: "Smartphones have actually made us dumber.", category: "Tech", intensity: "medium" },
  // { id: "hot_038", deckId: "party_unpopular_opinions", question: "Gaming is a waste of time once you turn 30.", category: "Tech", intensity: "high" },
  // { id: "hot_039", deckId: "party_unpopular_opinions", question: "Electric cars are not actually better for the environment yet.", category: "Tech", intensity: "high" },
  // { id: "hot_040", deckId: "party_unpopular_opinions", question: "We should stop trying to colonize Mars and fix Earth first.", category: "Tech", intensity: "medium" },

  // //   Category: Random & Quirky
  // { id: "hot_041", deckId: "party_unpopular_opinions", question: "Sleeping with socks on is more comfortable than being barefoot.", category: "Random", intensity: "mild" },
  // { id: "hot_042", deckId: "party_unpopular_opinions", question: "The toilet paper should hang 'under' not 'over'.", category: "Random", intensity: "mild" },
  // { id: "hot_043", deckId: "party_unpopular_opinions", question: "Summer is the worst season; Winter is the best.", category: "Random", intensity: "medium" },
  // { id: "hot_044", deckId: "party_unpopular_opinions", question: "Disneyland is for children, and adults who go there without kids are weird.", category: "Random", intensity: "high" },
  // { id: "hot_045", deckId: "party_unpopular_opinions", question: "Dogs are better than cats. (Or vice versa, pick your side!)", category: "Random", intensity: "medium" },
  // { id: "hot_046", deckId: "party_unpopular_opinions", question: "Shower in the morning is objectively better than showering at night.", category: "Random", intensity: "mild" },
  // { id: "hot_047", deckId: "party_unpopular_opinions", question: "Pulp in orange juice is disgusting.", category: "Random", intensity: "mild" },
  // { id: "hot_048", deckId: "party_unpopular_opinions", question: "Making your bed every morning is a complete waste of time.", category: "Random", intensity: "mild" },
  // { id: "hot_049", deckId: "party_unpopular_opinions", question: "Jeans are the most uncomfortable clothing item ever invented.", category: "Random", intensity: "mild" },
  // { id: "hot_050", deckId: "party_unpopular_opinions", question: "Mayo is better than Mustard on everything.", category: "Random", intensity: "mild" },

  // //   Category: Relationship Hot Takes
  // { id: "hot_051", deckId: "party_unpopular_opinions", question: "Open relationships are the future; monogamy is outdated.", category: "Relationships", intensity: "high" },
  // { id: "hot_052", deckId: "party_unpopular_opinions", question: "You should live with someone for at least 2 years before getting engaged.", category: "Relationships", intensity: "medium" },
  // { id: "hot_053", deckId: "party_unpopular_opinions", question: "Long-distance relationships never actually work out.", category: "Relationships", intensity: "high" },
  // { id: "hot_054", deckId: "party_unpopular_opinions", question: "Your partner should NOT be your 'best friend'.", category: "Relationships", intensity: "high" },
  // { id: "hot_055", deckId: "party_unpopular_opinions", question: "Eloping is always better than having a big wedding.", category: "Relationships", intensity: "medium" },
  // { id: "hot_056", deckId: "party_unpopular_opinions", question: "Prenups should be mandatory for every marriage.", category: "Relationships", intensity: "high" },
  // { id: "hot_057", deckId: "party_unpopular_opinions", question: "It’s okay to check your partner's phone if you have a bad feeling.", category: "Relationships", intensity: "high" },
  // { id: "hot_058", deckId: "party_unpopular_opinions", question: "Arguments are a sign of a healthy relationship.", category: "Relationships", intensity: "medium" },
  // { id: "hot_059", deckId: "party_unpopular_opinions", question: "The 'honeymoon phase' is the only part of a relationship that matters.", category: "Relationships", intensity: "high" },
  // { id: "hot_060", deckId: "party_unpopular_opinions", question: "Soulmates don't exist; you just pick someone and work at it.", category: "Relationships", intensity: "high" },

  //   Category: Lifestyle & Choices
  { id: "roast_001", deckId: "party_roast_me", question: "Who is most likely to buy something because an Instagram ad told them to?", category: "Choices", intensity: "mild" },
  { id: "roast_002", deckId: "party_roast_me", question: "Which person here has the most 'chaotic' kitchen cupboards?", category: "Habits", intensity: "mild" },
  { id: "roast_003", deckId: "party_roast_me", question: "Who still uses a primitive piece of technology because they refuse to upgrade?", category: "Tech", intensity: "mild" },
  { id: "roast_004", deckId: "party_roast_me", question: "Roast the person who takes the longest to reply to a simple 'Yes or No' text.", category: "Communication", intensity: "medium" },
  { id: "roast_005", deckId: "party_roast_me", question: "Who here is most likely to be a 'secret' Karen when talking to customer service?", category: "Personality", intensity: "medium" },
  { id: "roast_006", deckId: "party_roast_me", question: "Which friend’s car is basically a mobile trash can?", category: "Habits", intensity: "mild" },
  { id: "roast_007", deckId: "party_roast_me", question: "Who has the most questionable taste in romantic partners?", category: "Romance", intensity: "high" },
  { id: "roast_008", deckId: "party_roast_me", question: "Roast the person who is most likely to 'ghost' the group for a month when they get a new partner.", category: "Social", intensity: "medium" },
  { id: "roast_009", deckId: "party_roast_me", question: "Who is the 'I know a spot' friend who always takes you to a terrible restaurant?", category: "Taste", intensity: "mild" },
  { id: "roast_010", deckId: "party_roast_me", question: "Who here thinks they are much funnier than they actually are?", category: "Personality", intensity: "medium" },

  //   Category: Fashion & Aesthetic
  { id: "roast_011", deckId: "party_roast_me", question: "Who here is still dressing like it's 2012?", category: "Fashion", intensity: "mild" },
  { id: "roast_012", deckId: "party_roast_me", question: "Roast the person who spends the most money on clothes that all look exactly the same.", category: "Fashion", intensity: "mild" },
  { id: "roast_013", deckId: "party_roast_me", question: "Who is most likely to show up to a 'casual' hangout looking like they're going to a gala?", category: "Fashion", intensity: "mild" },
  { id: "roast_014", deckId: "party_roast_me", question: "Which person here has a 'signature look' that they really need to retire?", category: "Fashion", intensity: "medium" },
  { id: "roast_015", deckId: "party_roast_me", question: "Who is most likely to wear gym clothes but hasn't stepped foot in a gym in months?", category: "Fashion", intensity: "mild" },
  { id: "roast_016", deckId: "party_roast_me", question: "Roast the friend who takes 45 minutes to get ready just to go to the grocery store.", category: "Habits", intensity: "mild" },
  { id: "roast_017", deckId: "party_roast_me", question: "Who has the most 'Live, Laugh, Love' energy in their home decor?", category: "Aesthetic", intensity: "medium" },
  { id: "roast_018", deckId: "party_roast_me", question: "Which friend is most likely to accidentally wear their shirt inside out all day?", category: "Fashion", intensity: "mild" },
  { id: "roast_019", deckId: "party_roast_me", question: "Roast the person with the most 'main character' sunglasses.", category: "Fashion", intensity: "mild" },
  { id: "roast_020", deckId: "party_roast_me", question: "Who here looks the most like their pet?", category: "Look", intensity: "mild" },

  //   Category: Social Media & Tech
  { id: "roast_021", deckId: "party_roast_me", question: "Who posts way too many 'vague' emotional quotes on their story?", category: "Social Media", intensity: "medium" },
  { id: "roast_022", deckId: "party_roast_me", question: "Roast the person who takes 50 photos of their food before anyone is allowed to eat.", category: "Social Media", intensity: "mild" },
  { id: "roast_023", deckId: "party_roast_me", question: "Who is the biggest 'LinkedIn' personality in real life?", category: "Career", intensity: "medium" },
  { id: "roast_024", deckId: "party_roast_me", question: "Which friend has a screen time average that is genuinely concerning?", category: "Tech", intensity: "mild" },
  { id: "roast_025", deckId: "party_roast_me", question: "Roast the person who leaves people on 'read' but then posts on their story 5 minutes later.", category: "Social Media", intensity: "high" },
  { id: "roast_026", deckId: "party_roast_me", question: "Who is most likely to be a secret 'Reply Guy' to celebrities on Twitter?", category: "Tech", intensity: "medium" },
  { id: "roast_027", deckId: "party_roast_me", question: "Which friend has a desktop that is just 400 unsorted icons?", category: "Tech", intensity: "mild" },
  { id: "roast_028", deckId: "party_roast_me", question: "Roast the person who still uses a very outdated slang term incorrectly.", category: "Communication", intensity: "mild" },
  { id: "roast_029", deckId: "party_roast_me", question: "Who is most likely to start an 'inspirational' podcast that no one asked for?", category: "Choices", intensity: "medium" },
  { id: "roast_030", deckId: "party_roast_me", question: "Who here would be the first to fall for a very obvious phishing scam?", category: "Tech", intensity: "mild" },

  //   Category: Adulting (Or Lack Thereof)
  { id: "roast_031", deckId: "party_roast_me", question: "Who is the most 'functionally incompetent' adult in the room?", category: "Adulting", intensity: "medium" },
  { id: "roast_032", deckId: "party_roast_me", question: "Roast the friend who still lets their parents do their taxes/laundry.", category: "Adulting", intensity: "medium" },
  { id: "roast_033", deckId: "party_roast_me", question: "Who is most likely to have cereal for dinner four nights a week?", category: "Adulting", intensity: "mild" },
  { id: "roast_034", deckId: "party_roast_me", question: "Which friend's plant-parenting skills are actually plant-homicide skills?", category: "Habits", intensity: "mild" },
  { id: "roast_035", deckId: "party_roast_me", question: "Who is the 'I’m 5 minutes away' friend when they haven't even put shoes on yet?", category: "Reliability", intensity: "medium" },
  { id: "roast_036", deckId: "party_roast_me", question: "Roast the person who would rather buy new socks than do a load of laundry.", category: "Adulting", intensity: "mild" },
  { id: "roast_037", deckId: "party_roast_me", question: "Who here is most likely to have a mini-breakdown because they have to make a phone call to a doctor?", category: "Adulting", intensity: "mild" },
  { id: "roast_038", deckId: "party_roast_me", question: "Which friend has a bank account that is 90% takeout orders?", category: "Finance", intensity: "mild" },
  { id: "roast_039", deckId: "party_roast_me", question: "Roast the person who 'reinvents' themselves every 6 months with a new personality.", category: "Personality", intensity: "high" },
  { id: "roast_040", deckId: "party_roast_me", question: "Who is most likely to be late to their own funeral?", category: "Reliability", intensity: "mild" },

  //   Category: Party Fouls
  { id: "roast_041", deckId: "party_roast_me", question: "Who is the most 'lightweight' drinker in this group?", category: "Partying", intensity: "mild" },
  { id: "roast_042", deckId: "party_roast_me", question: "Roast the friend who always requests the most 'vibekiller' songs at a party.", category: "Partying", intensity: "mild" },
  { id: "roast_043", deckId: "party_roast_me", question: "Who is the 'Irish Exit' master who disappears without saying goodbye every single time?", category: "Partying", intensity: "medium" },
  { id: "roast_044", deckId: "party_roast_me", question: "Who here is the most 'aggressive' dancer (not necessarily good, just aggressive)?", category: "Partying", intensity: "mild" },
  { id: "roast_045", deckId: "party_roast_me", question: "Roast the friend who always 'forgets their wallet' when it’s time to pay for the Uber.", category: "Partying", intensity: "medium" },
  { id: "roast_046", deckId: "party_roast_me", question: "Who is most likely to start a deep, emotional conversation in the middle of a loud club?", category: "Partying", intensity: "medium" },
  { id: "roast_047", deckId: "party_roast_me", question: "Which friend is most likely to be found sleeping in the bathroom at 1 AM?", category: "Partying", intensity: "mild" },
  { id: "roast_048", deckId: "party_roast_me", question: "Roast the person who thinks they are a professional bartender after two cocktails.", category: "Partying", intensity: "mild" },
  { id: "roast_049", deckId: "party_roast_me", question: "Who is most likely to 'spill the tea' and then say 'don't tell anyone I told you'?", category: "Personality", intensity: "medium" },
  { id: "roast_050", deckId: "party_roast_me", question: "Who here is the most 'clumsy' person? (Describe their last epic fail).", category: "Look", intensity: "mild" },

  //   Category: Final Jabs
  { id: "roast_051", deckId: "party_roast_me", question: "Roast the person who has the most 'basic' Netflix profile.", category: "Taste", intensity: "mild" },
  { id: "roast_052", deckId: "party_roast_me", question: "Who here is most likely to talk to a stranger for 20 minutes and learn their whole life story?", category: "Personality", intensity: "mild" },
  { id: "roast_053", deckId: "party_roast_me", question: "Roast the friend who is 'always on a diet' but is currently eating the most snacks.", category: "Habits", intensity: "medium" },
  { id: "roast_054", deckId: "party_roast_me", question: "Which friend has the most 'I want to speak to the manager' haircut/energy?", category: "Look", intensity: "medium" },
  { id: "roast_055", deckId: "party_roast_me", question: "Who is most likely to get lost in their own hometown?", category: "Adulting", intensity: "mild" },
  { id: "roast_056", deckId: "party_roast_me", question: "Roast the person with the most unhinged 'notes app' on their phone.", category: "Tech", intensity: "medium" },
  { id: "roast_057", deckId: "party_roast_me", question: "Who is the 'I'm not a regular mom/dad, I'm a cool mom/dad' of the group?", category: "Personality", intensity: "mild" },
  { id: "roast_058", deckId: "party_roast_me", question: "Which friend is most likely to be the 'villain' in a romantic comedy?", category: "Choices", intensity: "medium" },
  { id: "roast_059", deckId: "party_roast_me", question: "Roast yourself: What is your own most 'roastable' quality?", category: "Self", intensity: "medium" },
  { id: "roast_060", deckId: "party_roast_me", question: "Who here is the 'final boss' of being annoying? (With love!).", category: "Personality", intensity: "high" },

  //   Category: Travel & Adventure
  { id: "never_001", deckId: "party_never_have_i_light", question: "Never have I ever been to more than 5 countries.", category: "Travel", intensity: "mild" },
  { id: "never_002", deckId: "party_never_have_i_light", question: "Never have I ever missed a flight.", category: "Travel", intensity: "medium" },
  { id: "never_003", deckId: "party_never_have_i_light", question: "Never have I ever lied about my age to get a discount.", category: "Ethics", intensity: "mild" },
  { id: "never_004", deckId: "party_never_have_i_light", question: "Never have I ever slept in an airport.", category: "Travel", intensity: "mild" },
  { id: "never_005", deckId: "party_never_have_i_light", question: "Never have I ever taken a solo trip to a foreign country.", category: "Travel", intensity: "medium" },
  { id: "never_006", deckId: "party_never_have_i_light", question: "Never have I ever been lost in a city where I didn't speak the language.", category: "Travel", intensity: "medium" },
  { id: "never_007", deckId: "party_never_have_i_light", question: "Never have I ever used a fake name while traveling.", category: "Travel", intensity: "medium" },
  { id: "never_008", deckId: "party_never_have_i_light", question: "Never have I ever been to a nude beach.", category: "Travel", intensity: "medium" },
  { id: "never_009", deckId: "party_never_have_i_light", question: "Never have I ever gone camping and hated every second of it.", category: "Adventure", intensity: "mild" },
  { id: "never_010", deckId: "party_never_have_i_light", question: "Never have I ever tried an 'extreme' sport (skydiving, bungee, etc.).", category: "Adventure", intensity: "medium" },

  //   Category: Social & Relationships
  { id: "never_011", deckId: "party_never_have_i_light", question: "Never have I ever ghosted someone I was dating.", category: "Dating", intensity: "high" },
  { id: "never_012", deckId: "party_never_have_i_light", question: "Never have I ever been caught checking my own reflection in a window.", category: "Social", intensity: "mild" },
  { id: "never_013", deckId: "party_never_have_i_light", question: "Never have I ever lied to get out of a date.", category: "Dating", intensity: "medium" },
  { id: "never_014", deckId: "party_never_have_i_light", question: "Never have I ever 'stalked' an ex on social media.", category: "Social", intensity: "medium" },
  { id: "never_015", deckId: "party_never_have_i_light", question: "Never have I ever had a crush on a friend's sibling.", category: "Social", intensity: "medium" },
  { id: "never_016", deckId: "party_never_have_i_light", question: "Never have I ever pretended to be busy when I was actually just at home in bed.", category: "Social", intensity: "mild" },
  { id: "never_017", deckId: "party_never_have_i_light", question: "Never have I ever sent a text to the wrong person about that person.", category: "Social", intensity: "high" },
  { id: "never_018", deckId: "party_never_have_i_light", question: "Never have I ever cried at a movie in public.", category: "Social", intensity: "mild" },
  { id: "never_019", deckId: "party_never_have_i_light", question: "Never have I ever used a pickup line that actually worked.", category: "Dating", intensity: "mild" },
  { id: "never_020", deckId: "party_never_have_i_light", question: "Never have I ever regifted a birthday present.", category: "Social", intensity: "mild" },

  //   Category: Work & School
  { id: "never_021", deckId: "party_never_have_i_light", question: "Never have I ever fallen asleep during a meeting or class.", category: "Work", intensity: "mild" },
  { id: "never_022", deckId: "party_never_have_i_light", question: "Never have I ever cheated on a test.", category: "School", intensity: "medium" },
  { id: "never_023", deckId: "party_never_have_i_light", question: "Never have I ever lied on my resume.", category: "Work", intensity: "medium" },
  { id: "never_024", deckId: "party_never_have_i_light", question: "Never have I ever called in sick when I was perfectly fine.", category: "Work", intensity: "mild" },
  { id: "never_025", deckId: "party_never_have_i_light", question: "Never have I ever had a 'work spouse'.", category: "Work", intensity: "mild" },
  { id: "never_026", deckId: "party_never_have_i_light", question: "Never have I ever 'Reply All' emailed by accident.", category: "Work", intensity: "mild" },
  { id: "never_027", deckId: "party_never_have_i_light", question: "Never have I ever stolen food from the office fridge.", category: "Work", intensity: "medium" },
  { id: "never_028", deckId: "party_never_have_i_light", question: "Never have I ever had a crush on a teacher/professor.", category: "School", intensity: "mild" },
  { id: "never_029", deckId: "party_never_have_i_light", question: "Never have I ever quit a job on the first day.", category: "Work", intensity: "medium" },
  { id: "never_030", deckId: "party_never_have_i_light", question: "Never have I ever presented a project I didn't actually finish.", category: "Work", intensity: "medium" },

  //   Category: Daily Habits & Fails
  { id: "never_031", deckId: "party_never_have_i_light", question: "Never have I ever walked into a glass door.", category: "Daily", intensity: "mild" },
  { id: "never_032", deckId: "party_never_have_i_light", question: "Never have I ever googled my own name to see what comes up.", category: "Daily", intensity: "mild" },
  { id: "never_033", deckId: "party_never_have_i_light", question: "Never have I ever forgotten where I parked my car for more than 10 minutes.", category: "Daily", intensity: "mild" },
  { id: "never_034", deckId: "party_never_have_i_light", question: "Never have I ever worn the same outfit two days in a row.", category: "Habits", intensity: "mild" },
  { id: "never_035", deckId: "party_never_have_i_light", question: "Never have I ever used a toothbrush that wasn't mine.", category: "Habits", intensity: "high" },
  { id: "never_036", deckId: "party_never_have_i_light", question: "Never have I ever liked a photo from 3 years ago while 'researching' someone.", category: "Daily", intensity: "medium" },
  { id: "never_037", deckId: "party_never_have_i_light", question: "Never have I ever accidentally shoplifted something.", category: "Ethics", intensity: "medium" },
  { id: "never_038", deckId: "party_never_have_i_light", question: "Never have I ever eaten food that fell on the floor.", category: "Habits", intensity: "mild" },
  { id: "never_039", deckId: "party_never_have_i_light", question: "Never have I ever talked to myself out loud in public.", category: "Daily", intensity: "mild" },
  { id: "never_040", deckId: "party_never_have_i_light", question: "Never have I ever broken a bone.", category: "Daily", intensity: "mild" },

  //   Category: Food & Drink
  { id: "never_041", deckId: "party_never_have_i_light", question: "Never have I ever eaten a whole pizza by myself.", category: "Food", intensity: "mild" },
  { id: "never_042", deckId: "party_never_have_i_light", question: "Never have I ever tried a food I knew I would hate just to be polite.", category: "Food", intensity: "mild" },
  { id: "never_043", deckId: "party_never_have_i_light", question: "Never have I ever been a vegetarian/vegan for more than a week.", category: "Food", intensity: "mild" },
  { id: "never_044", deckId: "party_never_have_i_light", question: "Never have I ever finished a bottle of wine by myself in one night.", category: "Drink", intensity: "medium" },
  { id: "never_045", deckId: "party_never_have_i_light", question: "Never have I ever dine-and-dashed.", category: "Ethics", intensity: "high" },
  { id: "never_046", deckId: "party_never_have_i_light", question: "Never have I ever sent food back at a restaurant.", category: "Food", intensity: "mild" },
  { id: "never_047", deckId: "party_never_have_i_light", question: "Never have I ever eaten at a restaurant alone.", category: "Food", intensity: "mild" },
  { id: "never_048", deckId: "party_never_have_i_light", question: "Never have I ever used a coupon on a first date.", category: "Dating", intensity: "mild" },
  { id: "never_049", deckId: "party_never_have_i_light", question: "Never have I ever eaten an entire pint of ice cream in one sitting.", category: "Food", intensity: "mild" },
  { id: "never_050", deckId: "party_never_have_i_light", question: "Never have I ever worked as a server/waiter.", category: "Work", intensity: "mild" },

  //   Category: Tech & Misc
  { id: "never_051", deckId: "party_never_have_i_light", question: "Never have I ever broken a phone screen.", category: "Tech", intensity: "mild" },
  { id: "never_052", deckId: "party_never_have_i_light", question: "Never have I ever had a YouTube channel.", category: "Tech", intensity: "mild" },
  { id: "never_053", deckId: "party_never_have_i_light", question: "Never have I ever spent more than $200 on a single mobile game.", category: "Tech", intensity: "medium" },
  { id: "never_054", deckId: "party_never_have_i_light", question: "Never have I ever been on TV.", category: "Misc", intensity: "mild" },
  { id: "never_055", deckId: "party_never_have_i_light", question: "Never have I ever met someone famous.", category: "Misc", intensity: "mild" },
  { id: "never_056", deckId: "party_never_have_i_light", question: "Never have I ever won a trophy or medal as an adult.", category: "Misc", intensity: "mild" },
  { id: "never_057", deckId: "party_never_have_i_light", question: "Never have I ever lied during this game.", category: "Misc", intensity: "high" },
  { id: "never_058", deckId: "party_never_have_i_light", question: "Never have I ever been to a professional sports game.", category: "Misc", intensity: "mild" },
  { id: "never_059", deckId: "party_never_have_i_light", question: "Never have I ever dyed my hair a bright color.", category: "Misc", intensity: "mild" },
  { id: "never_060", deckId: "party_never_have_i_light", question: "Never have I ever had a paranormal experience.", category: "Misc", intensity: "medium" },

  //   Category: Physical & Movement
  { id: "dare_001", deckId: "party_dares", question: "Do your best 'catwalk' walk across the room and back.", category: "Physical", intensity: "mild" },
  { id: "dare_002", deckId: "party_dares", question: "Balance a spoon on your nose for 30 seconds without dropping it.", category: "Physical", intensity: "mild" },
  { id: "dare_003", deckId: "party_dares", question: "Give a piggyback ride to the person to your left across the room.", category: "Physical", intensity: "medium" },
  { id: "dare_004", deckId: "party_dares", question: "Try to touch your nose with your tongue. If you can't, do 10 pushups.", category: "Physical", intensity: "mild" },
  { id: "dare_005", deckId: "party_dares", question: "Do your best interpretive dance to the next song that plays.", category: "Physical", intensity: "medium" },
  { id: "dare_006", deckId: "party_dares", question: "Hold a plank for 60 seconds while someone tells a joke to try and make you laugh.", category: "Physical", intensity: "medium" },
  { id: "dare_007", deckId: "party_dares", question: "Let someone else style your hair however they want for the next three rounds.", category: "Physical", intensity: "medium" },
  { id: "dare_008", deckId: "party_dares", question: "Spin around 10 times and then try to walk in a straight line.", category: "Physical", intensity: "mild" },
  { id: "dare_009", deckId: "party_dares", question: "Speak in a fake accent of the group's choosing for the next 10 minutes.", category: "Physical", intensity: "medium" },
  { id: "dare_010", deckId: "party_dares", question: "Act like a mime for the next 2 minutes. No talking allowed.", category: "Physical", intensity: "mild" },

  //   Category: Social & Acting
  { id: "dare_011", deckId: "party_dares", question: "Give a 2-minute 'TED Talk' on why the person to your right is a legend.", category: "Social", intensity: "medium" },
  { id: "dare_012", deckId: "party_dares", question: "Let the person to your right draw a tiny tattoo on your arm with a pen.", category: "Social", intensity: "mild" },
  { id: "dare_013", deckId: "party_dares", question: "Whisper a secret (or a fake secret) into the ear of the person across from you.", category: "Social", intensity: "medium" },
  { id: "dare_014", deckId: "party_dares", question: "Serenade the person to your left with a 30-second love song.", category: "Social", intensity: "medium" },
  { id: "dare_015", deckId: "party_dares", question: "Trade a piece of clothing with the person to your right for the next 15 minutes.", category: "Social", intensity: "high" },
  { id: "dare_016", deckId: "party_dares", question: "Stare into the eyes of the person opposite you for 60 seconds without laughing.", category: "Social", intensity: "medium" },
  { id: "dare_017", deckId: "party_dares", question: "Pretend to be a waiter/waitress and take 'drink orders' from everyone in the room.", category: "Social", intensity: "mild" },
  { id: "dare_018", deckId: "party_dares", question: "Tell the group your most embarrassing 'fart' story.", category: "Social", intensity: "medium" },
  { id: "dare_019", deckId: "party_dares", question: "Call a random contact in your phone and sing them 'Happy Birthday.'", category: "Social", intensity: "high" },
  { id: "dare_020", deckId: "party_dares", question: "Let someone in the group rewrite your Instagram/dating profile bio for the rest of the night.", category: "Social", intensity: "high" },

  //   Category: Digital & Phone
  { id: "dare_021", deckId: "party_dares", question: "Show the group the last 5 photos in your camera roll.", category: "Digital", intensity: "high" },
  { id: "dare_022", deckId: "party_dares", question: "Post a selfie on your story with the caption 'I'm a little teapot.'", category: "Digital", intensity: "medium" },
  { id: "dare_023", deckId: "party_dares", question: "Let the group send a message of their choosing to one of your recent DMs.", category: "Digital", intensity: "high" },
  { id: "dare_024", deckId: "party_dares", question: "Show the group your screen time average for the week.", category: "Digital", intensity: "medium" },
  { id: "dare_025", deckId: "party_dares", question: "Go to your 'Suggested' page on Instagram and let the group pick someone for you to follow.", category: "Digital", intensity: "medium" },
  { id: "dare_026", deckId: "party_dares", question: "Read out the last 3 text messages you received.", category: "Digital", intensity: "high" },
  { id: "dare_027", deckId: "party_dares", question: "Change your phone wallpaper to a photo of the person to your left until the game ends.", category: "Digital", intensity: "mild" },
  { id: "dare_028", deckId: "party_dares", question: "Let the person to your left look through your search history for 30 seconds.", category: "Digital", intensity: "high" },
  { id: "dare_029", deckId: "party_dares", question: "Text your crush/partner and say 'I have a confession...' then don't reply for 5 minutes.", category: "Digital", intensity: "high" },
  { id: "dare_030", deckId: "party_dares", question: "Record a voice note of yourself making animal noises and send it to your best friend.", category: "Digital", intensity: "medium" },

  //   Category: Food & Senses
  { id: "dare_031", deckId: "party_dares", question: "Eat a teaspoon of mustard or hot sauce.", category: "Food", intensity: "medium" },
  { id: "dare_032", deckId: "party_dares", question: "Let the group create a 'mystery drink' for you using 3 ingredients from the kitchen.", category: "Food", intensity: "high" },
  { id: "dare_033", deckId: "party_dares", question: "Try to eat a cracker or a piece of bread in 30 seconds without drinking water.", category: "Food", intensity: "mild" },
  { id: "dare_034", deckId: "party_dares", question: "Smell the feet of the person to your right. (Keep it weird!).", category: "Food", intensity: "high" },
  { id: "dare_035", deckId: "party_dares", question: "Eat a piece of fruit like an animal (no hands).", category: "Food", intensity: "medium" },
  { id: "dare_036", deckId: "party_dares", question: "Keep an ice cube in your mouth until it melts completely.", category: "Food", intensity: "medium" },
  { id: "dare_037", deckId: "party_dares", question: "Blindfold yourself and let someone feed you a 'mystery' snack from the kitchen.", category: "Food", intensity: "medium" },
  { id: "dare_038", deckId: "party_dares", question: "Lick the wall. (Make sure it's clean-ish?).", category: "Food", intensity: "medium" },
  { id: "dare_039", deckId: "party_dares", question: "Drink a glass of water without using your hands.", category: "Food", intensity: "mild" },
  { id: "dare_040", deckId: "party_dares", question: "Act like you're in a luxury food commercial while eating a plain piece of bread.", category: "Food", intensity: "mild" },

  //   Category: Risk & Random
  { id: "dare_041", deckId: "party_dares", question: "Go outside and shout 'I LOVE THIS GROUP' at the top of your lungs.", category: "Risk", intensity: "medium" },
  { id: "dare_042", deckId: "party_dares", question: "Let the group look through your wallet or purse for 1 minute.", category: "Risk", intensity: "medium" },
  { id: "dare_043", deckId: "party_dares", question: "Give your phone to the person to your right and let them unlock it for 2 minutes.", category: "Risk", intensity: "high" },
  { id: "dare_044", deckId: "party_dares", question: "Allow someone to draw a funny face on your cheek with lipstick or pen.", category: "Risk", intensity: "medium" },
  { id: "dare_045", deckId: "party_dares", question: "Swap shoes with the person across from you for the rest of the game.", category: "Risk", intensity: "mild" },
  { id: "dare_046", deckId: "party_dares", question: "Perform a 30-second stand-up comedy routine about your own life.", category: "Risk", intensity: "medium" },
  { id: "dare_047", deckId: "party_dares", question: "Try to juggle three random items chosen by the group.", category: "Risk", intensity: "mild" },
  { id: "dare_048", deckId: "party_dares", question: "Let someone use your social media to like the first 10 posts on your feed.", category: "Risk", intensity: "medium" },
  { id: "dare_049", deckId: "party_dares", question: "Do an impression of another person in this room until someone guesses who it is.", category: "Risk", intensity: "medium" },
  { id: "dare_050", deckId: "party_dares", question: "Walk outside and wave at the first car or person you see.", category: "Risk", intensity: "mild" },

  //   Category: The 'Ultimate' Dares
  { id: "dare_051", deckId: "party_dares", question: "Let the group choose your new nickname, and you must answer to it all night.", category: "Ultimate", intensity: "medium" },
  { id: "dare_052", deckId: "party_dares", question: "Call your mom/dad and tell them you’re getting a tattoo of a potato.", category: "Ultimate", intensity: "high" },
  { id: "dare_053", deckId: "party_dares", question: "Do a handstand (or attempt one) against the wall.", category: "Ultimate", intensity: "medium" },
  { id: "dare_054", deckId: "party_dares", question: "Wear your socks on your hands for the next 10 minutes.", category: "Ultimate", intensity: "mild" },
  { id: "dare_055", deckId: "party_dares", question: "Allow the group to 'Roast' you for 60 seconds while you say nothing.", category: "Ultimate", intensity: "high" },
  { id: "dare_056", deckId: "party_dares", question: "Do 20 squats while holding a full drink.", category: "Ultimate", intensity: "mild" },
  { id: "dare_057", deckId: "party_dares", question: "Let someone scroll through your 'Hidden' folder in your photos.", category: "Ultimate", intensity: "high" },
  { id: "dare_058", deckId: "party_dares", question: "Try to wrap your leg around your head.", category: "Ultimate", intensity: "medium" },
  { id: "dare_059", deckId: "party_dares", question: "Let the person to your left draw a 'mustache' on you with a marker.", category: "Ultimate", intensity: "medium" },
  { id: "dare_060", deckId: "party_dares", question: "If you refuse any dare before this, you must do a 'forfeit' shot or drink.", category: "Ultimate", intensity: "high" },

  //   Category: Group Dynamics
  { id: "para_001", deckId: "party_paranoia", question: "Who in this room would you least want to be stranded on a desert island with?", category: "Dynamics", intensity: "medium" },
  { id: "para_002", deckId: "party_paranoia", question: "Who do you think has the most 'main character' energy in the group?", category: "Dynamics", intensity: "medium" },
  { id: "para_003", deckId: "party_paranoia", question: "Who is the most likely to be a secret undercover agent?", category: "Dynamics", intensity: "mild" },
  { id: "para_004", deckId: "party_paranoia", question: "Who here has the best fashion sense (or the worst)?", category: "Dynamics", intensity: "mild" },
  { id: "para_005", deckId: "party_paranoia", question: "Who in the group is the biggest 'drama magnet'?", category: "Dynamics", intensity: "high" },
  { id: "para_006", deckId: "party_paranoia", question: "Who is most likely to win a Nobel Prize?", category: "Dynamics", intensity: "mild" },
  { id: "para_007", deckId: "party_paranoia", question: "Who do you think would be the first person to betray the group for $1 million?", category: "Dynamics", intensity: "high" },
  { id: "para_008", deckId: "party_paranoia", question: "Who here is the most 'intimidating' when you first meet them?", category: "Dynamics", intensity: "medium" },
  { id: "para_009", deckId: "party_paranoia", question: "Who in this group is the best listener?", category: "Dynamics", intensity: "mild" },
  { id: "para_010", deckId: "party_paranoia", question: "Who would you trust to manage your bank account for a month?", category: "Dynamics", intensity: "medium" },

  //   Category: Secrets & Cringe
  { id: "para_011", deckId: "party_paranoia", question: "Who here do you think has the most embarrassing search history?", category: "Secrets", intensity: "high" },
  { id: "para_012", deckId: "party_paranoia", question: "Who is most likely to still own a physical diary?", category: "Secrets", intensity: "mild" },
  { id: "para_013", deckId: "party_paranoia", question: "Who here do you think was a 'bully' in high school?", category: "Secrets", intensity: "medium" },
  { id: "para_014", deckId: "party_paranoia", question: "Who is the most likely to have a secret tattoo they haven't shown anyone?", category: "Secrets", intensity: "medium" },
  { id: "para_015", deckId: "party_paranoia", question: "Who here would be the most 'unreliable' witness in a court case?", category: "Secrets", intensity: "medium" },
  { id: "para_016", deckId: "party_paranoia", question: "Who is the most likely to 'ghost' a group hangout at the last second?", category: "Secrets", intensity: "medium" },
  { id: "para_017", deckId: "party_paranoia", question: "Who here do you think talks the most behind people's backs?", category: "Secrets", intensity: "high" },
  { id: "para_018", deckId: "party_paranoia", question: "Who is the most likely to lie during a game of Truth or Dare?", category: "Secrets", intensity: "medium" },
  { id: "para_019", deckId: "party_paranoia", question: "Who would you least want to meet your parents?", category: "Secrets", intensity: "medium" },
  { id: "para_020", deckId: "party_paranoia", question: "Who here do you think has the highest body count? (Or lowest?)", category: "Secrets", intensity: "high" },

  //   Category: Lifestyle & Future
  { id: "para_021", deckId: "party_paranoia", question: "Who in this group will be the first to move to another country?", category: "Lifestyle", intensity: "mild" },
  { id: "para_022", deckId: "party_paranoia", question: "Who here is most likely to win the lottery and never tell anyone?", category: "Lifestyle", intensity: "medium" },
  { id: "para_023", deckId: "party_paranoia", question: "Who do you think would be the best parent in the group?", category: "Lifestyle", intensity: "medium" },
  { id: "para_024", deckId: "party_paranoia", question: "Who here is the most likely to start their own successful business?", category: "Lifestyle", intensity: "mild" },
  { id: "para_025", deckId: "party_paranoia", question: "Who is most likely to own a yacht in 20 years?", category: "Lifestyle", intensity: "mild" },
  { id: "para_026", deckId: "party_paranoia", question: "Who is the most likely to end up on a reality TV show?", category: "Lifestyle", intensity: "mild" },
  { id: "para_027", deckId: "party_paranoia", question: "Who here do you think spends the most money on clothes?", category: "Lifestyle", intensity: "mild" },
  { id: "para_028", deckId: "party_paranoia", question: "Who would you want with you during a zombie apocalypse?", category: "Lifestyle", intensity: "medium" },
  { id: "para_029", deckId: "party_paranoia", question: "Who here is the most likely to write a best-selling book?", category: "Lifestyle", intensity: "mild" },
  { id: "para_030", deckId: "party_paranoia", question: "Who here do you think is the most 'financially stable'?", category: "Lifestyle", intensity: "medium" },

  //   Category: Romance & Vibe
  { id: "para_031", deckId: "party_paranoia", question: "Who here do you think is the best kisser?", category: "Romance", intensity: "high" },
  { id: "para_032", deckId: "party_paranoia", question: "Who here is the most likely to fall in love with someone they just met?", category: "Romance", intensity: "medium" },
  { id: "para_033", deckId: "party_paranoia", question: "Who in this group has the most 'chaotic' dating life?", category: "Romance", intensity: "high" },
  { id: "para_034", deckId: "party_paranoia", question: "Who would you most want to go on a double date with?", category: "Romance", intensity: "mild" },
  { id: "para_035", deckId: "party_paranoia", question: "Who here do you think is a 'secret romantic'?", category: "Romance", intensity: "medium" },
  { id: "para_036", deckId: "party_paranoia", question: "Who in the group do you think has a crush on someone in this room?", category: "Romance", intensity: "high" },
  { id: "para_037", deckId: "party_paranoia", question: "Who is the most likely to get married in Vegas on a whim?", category: "Romance", intensity: "medium" },
  { id: "para_038", deckId: "party_paranoia", question: "Who here do you think is the most 'loyal' partner?", category: "Romance", intensity: "medium" },
  { id: "para_039", deckId: "party_paranoia", question: "Who would you trust to set you up on a blind date?", category: "Romance", intensity: "medium" },
  { id: "para_040", deckId: "party_paranoia", question: "Who here is most likely to be a 'serial dater'?", category: "Romance", intensity: "medium" },

  //   Category: Quirks & Funny
  { id: "para_041", deckId: "party_paranoia", question: "Who here is most likely to cry during a cartoon movie?", category: "Quirks", intensity: "mild" },
  { id: "para_042", deckId: "party_paranoia", question: "Who here has the loudest or weirdest laugh?", category: "Quirks", intensity: "mild" },
  { id: "para_043", deckId: "party_paranoia", question: "Who is most likely to talk to themselves when they think no one is watching?", category: "Quirks", intensity: "mild" },
  { id: "para_044", deckId: "party_paranoia", question: "Who here is the most likely to believe in ghosts or aliens?", category: "Quirks", intensity: "mild" },
  { id: "para_045", deckId: "party_paranoia", question: "Who would win an eating contest in this group?", category: "Quirks", intensity: "mild" },
  { id: "para_046", deckId: "party_paranoia", question: "Who here is the most 'accident-prone' or clumsy?", category: "Quirks", intensity: "mild" },
  { id: "para_047", deckId: "party_paranoia", question: "Who is most likely to get lost in their own neighborhood?", category: "Quirks", intensity: "mild" },
  { id: "para_048", deckId: "party_paranoia", question: "Who here has the weirdest food combination they actually enjoy?", category: "Quirks", intensity: "mild" },
  { id: "para_049", deckId: "party_paranoia", question: "Who is the most likely to be late to their own wedding?", category: "Quirks", intensity: "medium" },
  { id: "para_050", deckId: "party_paranoia", question: "Who here is the 'life of the party' (and who is the wallflower)?", category: "Quirks", intensity: "mild" },

  //   Category: The 'Deep' Paranoia
  { id: "para_051", deckId: "party_paranoia", question: "Who in this group do you think is the most 'misunderstood'?", category: "Deep", intensity: "deep" },
  { id: "para_052", deckId: "party_paranoia", question: "Who here has the most 'dark' sense of humor?", category: "Deep", intensity: "medium" },
  { id: "para_053", deckId: "party_paranoia", question: "Who would you want to call for help if you were arrested at 3 AM?", category: "Deep", intensity: "medium" },
  { id: "para_054", deckId: "party_paranoia", question: "Who here has changed the most since you first met them?", category: "Deep", intensity: "medium" },
  { id: "para_055", deckId: "party_paranoia", question: "Who here do you think is the 'glue' that keeps the group together?", category: "Deep", intensity: "medium" },
  { id: "para_056", deckId: "party_paranoia", question: "Who would you trust with your deepest, darkest secret?", category: "Deep", intensity: "deep" },
  { id: "para_057", deckId: "party_paranoia", question: "Who here do you think is the most 'honest' person you know?", category: "Deep", intensity: "medium" },
  { id: "para_058", deckId: "party_paranoia", question: "Who here do you think is the most 'spiritual' or deep-thinking?", category: "Deep", intensity: "medium" },
  { id: "para_059", deckId: "party_paranoia", question: "Who in this room would you say has the best 'aura'?", category: "Deep", intensity: "medium" },
  { id: "para_060", deckId: "party_paranoia", question: "If you had to switch lives with one person here for a year, who would it be?", category: "Deep", intensity: "deep" }
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