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
  // THE RELATIONSHIP MODES (Who)
  { id: "first_date", title: "🌹 First Date", tagline: "Break the ice gracefully" }
];

const decks = [
  // ── FIRST DATE ──
  { id: "date_spark", modeId: "first_date", title: "✨ The Spark", description: "Light and breezy questions for new connections", isLocked: false },
  { id: "date_first_impressions", modeId: "first_date", title: "👀 First Impressions", description: "What did you really think when we met?", isLocked: false },
  { id: "date_travel_vibes", modeId: "first_date", title: "✈️ Passport Tales", description: "Adventure styles and dream destinations", isLocked: false },
  { id: "date_social_battery", modeId: "first_date", title: "🔋 Social Battery", description: "Are you a party animal or a homebody?", isLocked: false },
  { id: "date_foodie_finds", modeId: "first_date", title: "🍕 The Foodie Test", description: "Debate the best snacks and worst meals", isLocked: false },
  { id: "date_green_flags", modeId: "first_date", title: "🧪 Green Flags", description: "What makes someone instantly attractive?", isLocked: true },
  { id: "date_dealbreakers", modeId: "first_date", title: "🧩 Compatibility", description: "Find out if your futures actually align", isLocked: true },
  { id: "date_speed_dating", modeId: "first_date", title: "⏱️ Rapid Fire", description: "Fast questions for quick-fire chemistry", isLocked: true }
];
const cards = [
  //   Category: Passions & Hobbies
  { id: "spark_001", deckId: "date_spark", question: "What’s a hobby you’ve started but were absolutely terrible at?", category: "Passions", intensity: "mild" },
  { id: "spark_002", deckId: "date_spark", question: "If you had an unexpected free Sunday, how would you spend it from start to finish?", category: "Passions", intensity: "mild" },
  { id: "spark_003", deckId: "date_spark", question: "What’s something you could give a 30-minute presentation on with zero preparation?", category: "Passions", intensity: "medium" },
  { id: "spark_004", deckId: "date_spark", question: "Are you a 'collector' of anything? (Books, shoes, digital photos, etc.?)", category: "Passions", intensity: "mild" },
  { id: "spark_005", deckId: "date_spark", question: "What is the most 'nerdy' thing about you that you actually love?", category: "Passions", intensity: "medium" },

  //   Category: Travel & Escapism
  { id: "spark_006", deckId: "date_spark", question: "If you could board a plane to anywhere right now, where would you go?", category: "Travel", intensity: "mild" },
  { id: "spark_007", deckId: "date_spark", question: "Are you more of a luxury resort person or a 'lost in a foreign city' person?", category: "Travel", intensity: "mild" },
  { id: "spark_008", deckId: "date_spark", question: "What’s the best meal you’ve ever had while traveling?", category: "Travel", intensity: "mild" },
  { id: "spark_009", deckId: "date_spark", question: "What’s one place you’ve visited that you have no desire to ever return to?", category: "Travel", intensity: "medium" },
  { id: "spark_010", deckId: "date_spark", question: "If you could live in any fictional world (book/movie), which one would it be?", category: "Travel", intensity: "mild" },

  //   Category: Social Style
  { id: "spark_011", deckId: "date_spark", question: "What’s your go-to 'party trick' or fun fact about yourself?", category: "Social", intensity: "mild" },
  { id: "spark_012", deckId: "date_spark", question: "Are you a 'stay until the lights come on' person or an 'early exit' person?", category: "Social", intensity: "mild" },
  { id: "spark_013", deckId: "date_spark", question: "What’s the most spontaneous thing you’ve ever done?", category: "Social", intensity: "medium" },
  { id: "spark_014", deckId: "date_spark", question: "Who is the 'main character' in your life right now besides yourself?", category: "Social", intensity: "medium" },
  { id: "spark_015", deckId: "date_spark", question: "What’s your favorite way to meet new people?", category: "Social", intensity: "medium" },

  //   Category: Pop Culture & Tastes
  { id: "spark_016", deckId: "date_spark", question: "What is your ultimate 'comfort' movie or TV show?", category: "Tastes", intensity: "mild" },
  { id: "spark_017", deckId: "date_spark", question: "If you could only listen to one album for the rest of your life, what is it?", category: "Tastes", intensity: "medium" },
  { id: "spark_018", deckId: "date_spark", question: "What’s a popular trend that you just don’t 'get'?", category: "Tastes", intensity: "mild" },
  { id: "spark_019", deckId: "date_spark", question: "Do you have a 'guilty pleasure' that most people would find surprising?", category: "Tastes", intensity: "medium" },
  { id: "spark_020", deckId: "date_spark", question: "Who was your very first celebrity crush?", category: "Tastes", intensity: "mild" },

  //   Category: Food & Drink
  { id: "spark_021", deckId: "date_spark", question: "What’s your controversial food opinion? (e.g., Pineapple on pizza?)", category: "Food", intensity: "mild" },
  { id: "spark_022", deckId: "date_spark", question: "If you were a drink, what kind of drink would you be?", category: "Food", intensity: "mild" },
  { id: "spark_023", deckId: "date_spark", question: "What’s the one dish you’re famous for cooking (or ordering)?", category: "Food", intensity: "mild" },
  { id: "spark_024", deckId: "date_spark", question: "Breakfast, lunch, or dinner—if you could only pick one for the rest of time?", category: "Food", intensity: "mild" },
  { id: "spark_025", deckId: "date_spark", question: "What’s the best coffee shop or bar you’ve ever been to?", category: "Food", intensity: "mild" },

  //   Category: Small Ambitions
  { id: "spark_026", deckId: "date_spark", question: "What is a skill you’ve always wanted to learn but haven't yet?", category: "Ambition", intensity: "medium" },
  { id: "spark_027", deckId: "date_spark", question: "If you won $1,000 today, how would you spend it by tonight?", category: "Ambition", intensity: "mild" },
  { id: "spark_028", deckId: "date_spark", question: "What’s one thing you’re looking forward to this month?", category: "Ambition", intensity: "mild" },
  { id: "spark_029", deckId: "date_spark", question: "What was your dream job when you were 10 years old?", category: "Ambition", intensity: "medium" },
  { id: "spark_030", deckId: "date_spark", question: "What’s a 'bucket list' item you hope to cross off this year?", category: "Ambition", intensity: "medium" },

  //   Category: Work & Productivity
  { id: "spark_031", deckId: "date_spark", question: "What’s the weirdest job you’ve ever had?", category: "Work", intensity: "mild" },
  { id: "spark_032", deckId: "date_spark", question: "Are you a 'work to live' or a 'live to work' type of person?", category: "Work", intensity: "medium" },
  { id: "spark_033", deckId: "date_spark", question: "What’s your favorite way to decompress after a long day at the office?", category: "Work", intensity: "mild" },
  { id: "spark_034", deckId: "date_spark", question: "If you could switch lives with anyone for a day, who would it be?", category: "Work", intensity: "medium" },
  { id: "spark_035", deckId: "date_spark", question: "What’s the best piece of career advice you’ve ever received?", category: "Work", intensity: "medium" },

  //   Category: Personality Quirks
  { id: "spark_036", deckId: "date_spark", question: "Are you a morning person or a night owl?", category: "Quirks", intensity: "mild" },
  { id: "spark_037", deckId: "date_spark", question: "What’s a 'pet peeve' that is totally irrational but drives you crazy?", category: "Quirks", intensity: "medium" },
  { id: "spark_038", deckId: "date_spark", question: "Do you have any 'old person' habits despite your age?", category: "Quirks", intensity: "mild" },
  { id: "spark_039", deckId: "date_spark", question: "How would your best friend describe you in three words?", category: "Quirks", intensity: "medium" },
  { id: "spark_040", deckId: "date_spark", question: "What’s your most used emoji?", category: "Quirks", intensity: "mild" },

  //   Category: Childhood & Roots
  { id: "spark_041", deckId: "date_spark", question: "What was your favorite childhood toy or game?", category: "Roots", intensity: "mild" },
  { id: "spark_042", deckId: "date_spark", question: "Where did you grow up, and does it still feel like 'home' to you?", category: "Roots", intensity: "medium" },
  { id: "spark_043", deckId: "date_spark", question: "What’s the most rebellious thing you did as a teenager?", category: "Roots", intensity: "medium" },
  { id: "spark_044", deckId: "date_spark", question: "Which family member are you most like?", category: "Roots", intensity: "medium" },
  { id: "spark_045", deckId: "date_spark", question: "What was your favorite subject in school?", category: "Roots", intensity: "mild" },

  //   Category: First Impressions (Light)
  { id: "spark_046", deckId: "date_spark", question: "What was the first thing you noticed about my profile/photos?", category: "Impression", intensity: "mild" },
  { id: "spark_047", deckId: "date_spark", question: "On a scale of 1-10, how nervous were you for this date?", category: "Impression", intensity: "medium" },
  { id: "spark_048", deckId: "date_spark", question: "What’s one thing you were hoping I *wouldn't* ask you?", category: "Impression", intensity: "medium" },
  { id: "spark_049", deckId: "date_spark", question: "What’s been the best part of your week so far?", category: "Impression", intensity: "mild" },
  { id: "spark_050", deckId: "date_spark", question: "If you had to describe our vibe so far in one word, what would it be?", category: "Impression", intensity: "medium" },

  //   Category: Values (Light)
  { id: "spark_051", deckId: "date_spark", question: "What’s a quality you admire most in other people?", category: "Values", intensity: "medium" },
  { id: "spark_052", deckId: "date_spark", question: "Are you more of a 'thinker' or a 'doer'?", category: "Values", intensity: "medium" },
  { id: "spark_053", deckId: "date_spark", question: "What’s one thing you’re really proud of that happened recently?", category: "Values", intensity: "medium" },
  { id: "spark_054", deckId: "date_spark", question: "Do you believe in 'signs' or coincidences?", category: "Values", intensity: "medium" },
  { id: "spark_055", deckId: "date_spark", question: "What’s a cause or topic you’re really passionate about?", category: "Values", intensity: "medium" },

  //   Category: The 'What-Ifs'
  { id: "spark_056", deckId: "date_spark", question: "If you could have any superpower for 24 hours, what would it be?", category: "What If", intensity: "mild" },
  { id: "spark_057", deckId: "date_spark", question: "If you were to write a book, what would it be about?", category: "What If", intensity: "medium" },
  { id: "spark_058", deckId: "date_spark", question: "If you could meet any historical figure, who would it be?", category: "What If", intensity: "medium" },
  { id: "spark_059", deckId: "date_spark", question: "If you could change one thing about the world, what would it be?", category: "What If", intensity: "medium" },
  { id: "spark_060", deckId: "date_spark", question: "What would your ideal 'perfect day' look like?", category: "What If", intensity: "mild" },

  //   Category: Visuals & Style
  { id: "impress_001", deckId: "date_first_impressions", question: "What was the very first physical detail you noticed about me today?", category: "Visuals", intensity: "mild" },
  { id: "impress_002", deckId: "date_first_impressions", question: "If you had to guess my favorite color based on my outfit, what would it be?", category: "Visuals", intensity: "mild" },
  { id: "impress_003", deckId: "date_first_impressions", question: "Do I look different in person than I do in my photos?", category: "Visuals", intensity: "medium" },
  { id: "impress_004", deckId: "date_first_impressions", question: "How would you describe my 'style' in three words?", category: "Visuals", intensity: "mild" },
  { id: "impress_005", deckId: "date_first_impressions", question: "What’s one thing about my appearance that surprised you?", category: "Visuals", intensity: "medium" },

  //   Category: Personality & Vibe
  { id: "impress_006", deckId: "date_first_impressions", question: "Do I seem more like an introvert or an extrovert so far?", category: "Vibe", intensity: "medium" },
  { id: "impress_007", deckId: "date_first_impressions", question: "What was the first thing I said that made you laugh (or smile)?", category: "Vibe", intensity: "mild" },
  { id: "impress_008", deckId: "date_first_impressions", question: "Would you describe my energy as 'calm' or 'chaotic'?", category: "Vibe", intensity: "medium" },
  { id: "impress_009", deckId: "date_first_impressions", question: "What is one 'aura' or feeling I project without even trying?", category: "Vibe", intensity: "deep" },
  { id: "impress_010", deckId: "date_first_impressions", question: "Did you find me intimidating or approachable when I first walked in?", category: "Vibe", intensity: "medium" },

  //   Category: Assumptions & Guesses
  { id: "impress_011", deckId: "date_first_impressions", question: "What do you think my most listened-to artist on Spotify is?", category: "Assumptions", intensity: "mild" },
  { id: "impress_012", deckId: "date_first_impressions", question: "Guess my star sign—even if you don’t believe in astrology!", category: "Assumptions", intensity: "mild" },
  { id: "impress_013", deckId: "date_first_impressions", question: "Do I seem like someone who was a 'teacher’s pet' or a rebel in school?", category: "Assumptions", intensity: "medium" },
  { id: "impress_014", deckId: "date_first_impressions", question: "What do you think my 'go-to' drink is when I’m out with friends?", category: "Assumptions", intensity: "mild" },
  { id: "impress_015", deckId: "date_first_impressions", question: "Based on my vibe, do you think I’m a morning person or a night owl?", category: "Assumptions", intensity: "mild" },

  //   Category: Communication Style
  { id: "impress_016", deckId: "date_first_impressions", question: "What was the best text you received from me before we met?", category: "Communication", intensity: "medium" },
  { id: "impress_017", deckId: "date_first_impressions", question: "Am I a better listener or a better talker?", category: "Communication", intensity: "medium" },
  { id: "impress_018", deckId: "date_first_impressions", question: "What’s one thing about my body language that stands out to you?", category: "Communication", intensity: "medium" },
  { id: "impress_019", deckId: "date_first_impressions", question: "How do you feel when we have a moment of silence together?", category: "Communication", intensity: "deep" },
  { id: "impress_020", deckId: "date_first_impressions", question: "Do I seem like a 'texter' or someone who prefers a phone call?", category: "Communication", intensity: "mild" },

  //   Category: Interests & Intellect
  { id: "impress_021", deckId: "date_first_impressions", question: "What do you think I’m most passionate about in my life right now?", category: "Intellect", intensity: "medium" },
  { id: "impress_022", deckId: "date_first_impressions", question: "Do I seem like someone who follows their head or their heart?", category: "Intellect", intensity: "deep" },
  { id: "impress_023", deckId: "date_first_impressions", question: "What’s one topic you think we could talk about for hours?", category: "Intellect", intensity: "medium" },
  { id: "impress_024", deckId: "date_first_impressions", question: "Do you get the feeling that I’m more creative or more logical?", category: "Intellect", intensity: "medium" },
  { id: "impress_025", deckId: "date_first_impressions", question: "What’s one thing you’ve learned about me today that surprised you?", category: "Intellect", intensity: "medium" },

  //   Category: Curiosity & Mystery
  { id: "impress_026", deckId: "date_first_impressions", question: "What is one thing about me that you are still trying to figure out?", category: "Mystery", intensity: "deep" },
  { id: "impress_027", deckId: "date_first_impressions", question: "What’s a question you’ve been wanting to ask me but were too shy to say?", category: "Mystery", intensity: "deep" },
  { id: "impress_028", deckId: "date_first_impressions", question: "What do you think is my 'secret talent'?", category: "Mystery", intensity: "mild" },
  { id: "impress_029", deckId: "date_first_impressions", question: "If you had to guess my biggest pet peeve, what would it be?", category: "Mystery", intensity: "medium" },
  { id: "impress_030", deckId: "date_first_impressions", question: "Do I seem like someone who has a lot of secrets or is an open book?", category: "Mystery", intensity: "medium" },

  //   Category: The Date Itself
  { id: "impress_031", deckId: "date_first_impressions", question: "What was your 'internal monologue' when you first saw me today?", category: "The Date", intensity: "deep" },
  { id: "impress_032", deckId: "date_first_impressions", question: "On a scale of 1-10, how well do you think this date is going?", category: "The Date", intensity: "medium" },
  { id: "impress_033", deckId: "date_first_impressions", question: "What was the most 'unexpected' part of this date so far?", category: "The Date", intensity: "medium" },
  { id: "impress_034", deckId: "date_first_impressions", question: "Did you have a specific plan in mind for what we would talk about?", category: "The Date", intensity: "mild" },
  { id: "impress_035", deckId: "date_first_impressions", question: "What’s one thing you would change about our date today (if anything)?", category: "The Date", intensity: "medium" },

  //   Category: Social Circle Assumptions
  { id: "impress_036", deckId: "date_first_impressions", question: "What kind of person do you think my 'best friend' is?", category: "Social", intensity: "medium" },
  { id: "impress_037", deckId: "date_first_impressions", question: "Do you think I’m the 'mom/dad' of the friend group or the 'wild child'?", category: "Social", intensity: "medium" },
  { id: "impress_038", deckId: "date_first_impressions", question: "Do you think I’m close with my family based on how I talk?", category: "Social", intensity: "medium" },
  { id: "impress_039", deckId: "date_first_impressions", question: "What would your friends think of me if they walked in right now?", category: "Social", intensity: "medium" },
  { id: "impress_040", deckId: "date_first_impressions", question: "How do you think I act at a party where I don’t know anyone?", category: "Social", intensity: "medium" },

  //   Category: Career & Ambition Impressions
  { id: "impress_041", deckId: "date_first_impressions", question: "Do I seem like I love my job, or do I just do it for the paycheck?", category: "Work", intensity: "medium" },
  { id: "impress_042", deckId: "date_first_impressions", question: "What do you think my dream job was when I was a kid?", category: "Work", intensity: "mild" },
  { id: "impress_043", deckId: "date_first_impressions", question: "Do I seem like I would be a 'boss' or a team player?", category: "Work", intensity: "medium" },
  { id: "impress_044", deckId: "date_first_impressions", question: "What is one professional goal you think I’m currently chasing?", category: "Work", intensity: "medium" },
  { id: "impress_045", deckId: "date_first_impressions", question: "If I weren't doing my current job, what career would you place me in?", category: "Work", intensity: "medium" },

  //   Category: Attraction & Spark
  { id: "impress_046", deckId: "date_first_impressions", question: "What is the most attractive thing I’ve done during this date?", category: "Attraction", intensity: "medium" },
  { id: "impress_047", deckId: "date_first_impressions", question: "Is there a specific 'mannerism' of mine that you find cute?", category: "Attraction", intensity: "medium" },
  { id: "impress_048", deckId: "date_first_impressions", question: "How would you describe the 'spark' between us right now?", category: "Attraction", intensity: "deep" },
  { id: "impress_049", deckId: "date_first_impressions", question: "What’s one thing about me that you find most intriguing?", category: "Attraction", intensity: "medium" },
  { id: "impress_050", deckId: "date_first_impressions", question: "Do you feel more of a physical or an intellectual connection so far?", category: "Attraction", intensity: "deep" },

  //   Category: Lifestyle & Hobbies
  { id: "impress_051", deckId: "date_first_impressions", question: "What do you think my apartment looks like right now? Clean or messy?", category: "Lifestyle", intensity: "mild" },
  { id: "impress_052", deckId: "date_first_impressions", question: "Do I seem like an 'outdoor adventurer' or a 'cozy homebody'?", category: "Lifestyle", intensity: "mild" },
  { id: "impress_053", deckId: "date_first_impressions", question: "What’s one hobby you’d be surprised to find out I have?", category: "Lifestyle", intensity: "medium" },
  { id: "impress_054", deckId: "date_first_impressions", question: "Do I seem like a cat person or a dog person?", category: "Lifestyle", intensity: "mild" },
  { id: "impress_055", deckId: "date_first_impressions", question: "What do you think I spend too much money on?", category: "Lifestyle", intensity: "medium" },

  //   Category: Future Vibes
  { id: "impress_056", deckId: "date_first_impressions", question: "Can you see me living in a big city or a small town long-term?", category: "Future", intensity: "medium" },
  { id: "impress_057", deckId: "date_first_impressions", question: "What’s one thing you think we would argue about if we were a couple?", category: "Future", intensity: "deep" },
  { id: "impress_058", deckId: "date_first_impressions", question: "What’s one adventure you can already imagine us going on together?", category: "Future", intensity: "medium" },
  { id: "impress_059", deckId: "date_first_impressions", question: "If we had a second date, what kind of activity do you think would fit us best?", category: "Future", intensity: "medium" },
  { id: "impress_060", deckId: "date_first_impressions", question: "What is your honest 'final verdict' on your first impression of me?", category: "Future", intensity: "deep" },

  //   Category: Lifestyle & Habits
  { id: "comp_001", deckId: "date_dealbreakers", question: "Are you a 'live to work' or 'work to live' kind of person?", category: "Lifestyle", intensity: "medium" },
  { id: "comp_002", deckId: "date_dealbreakers", question: "How much 'alone time' do you need in a week to feel like yourself?", category: "Lifestyle", intensity: "medium" },
  { id: "comp_003", deckId: "date_dealbreakers", question: "What’s your stance on cleanliness? Are you a neat freak or 'organized chaos'?", category: "Lifestyle", intensity: "mild" },
  { id: "comp_004", deckId: "date_dealbreakers", question: "Are you a morning person or a night owl? Could you date the opposite?", category: "Lifestyle", intensity: "mild" },
  { id: "comp_005", deckId: "date_dealbreakers", question: "What is your 'ideal' weekend—recharging at home or out socializing?", category: "Lifestyle", intensity: "mild" },

  //   Category: Communication Style
  { id: "comp_006", deckId: "date_dealbreakers", question: "When you’re upset, do you need immediate space or do you want to talk it out right away?", category: "Communication", intensity: "deep" },
  { id: "comp_007", deckId: "date_dealbreakers", question: "How do you feel about 'checking in' throughout the day via text?", category: "Communication", intensity: "medium" },
  { id: "comp_008", deckId: "date_dealbreakers", question: "Do you prefer radical honesty, even if it hurts, or 'kind' honesty?", category: "Communication", intensity: "deep" },
  { id: "comp_009", deckId: "date_dealbreakers", question: "What’s a communication style that instantly turns you off?", category: "Communication", intensity: "medium" },
  { id: "comp_010", deckId: "date_dealbreakers", question: "Are you an 'over-sharer' or someone who takes time to open up?", category: "Communication", intensity: "medium" },

  //   Category: Relationship Expectations
  { id: "comp_011", deckId: "date_dealbreakers", question: "What is your 'love language'—how do you best receive affection?", category: "Expectations", intensity: "medium" },
  { id: "comp_012", deckId: "date_dealbreakers", question: "What does 'exclusivity' look like to you in the early stages?", category: "Expectations", intensity: "deep" },
  { id: "comp_013", deckId: "date_dealbreakers", question: "How much influence do your friends and family have on your relationship choices?", category: "Expectations", intensity: "medium" },
  { id: "comp_014", deckId: "date_dealbreakers", question: "What is the biggest lesson you learned from your last relationship?", category: "Expectations", intensity: "deep" },
  { id: "comp_015", deckId: "date_dealbreakers", question: "How do you define 'cheating'—where is the line for you?", category: "Expectations", intensity: "deep" },

  //   Category: Family & Future
  { id: "comp_016", deckId: "date_dealbreakers", question: "Do you see children in your future, or are you firmly 'child-free'?", category: "Family", intensity: "deep" },
  { id: "comp_017", deckId: "date_dealbreakers", question: "How close are you with your family, and how often do you see them?", category: "Family", intensity: "medium" },
  { id: "comp_018", deckId: "date_dealbreakers", question: "Do you want to live in the city, the suburbs, or the countryside long-term?", category: "Family", intensity: "medium" },
  { id: "comp_019", deckId: "date_dealbreakers", question: "What’s your opinion on pets? Are they family members or 'just animals'?", category: "Family", intensity: "mild" },
  { id: "comp_020", deckId: "date_dealbreakers", question: "Is marriage an ultimate goal for you, or just a piece of paper?", category: "Family", intensity: "deep" },

  //   Category: Money & Ambition
  { id: "comp_021", deckId: "date_dealbreakers", question: "Are you a 'saver' or a 'spender' when it comes to your finances?", category: "Money", intensity: "medium" },
  { id: "comp_022", deckId: "date_dealbreakers", question: "How do you feel about a partner who earns significantly more or less than you?", category: "Money", intensity: "medium" },
  { id: "comp_023", deckId: "date_dealbreakers", question: "Is career ambition a trait you find necessary in a partner?", category: "Money", intensity: "medium" },
  { id: "comp_024", deckId: "date_dealbreakers", question: "What is your 'splurge' item—the one thing you’ll always spend money on?", category: "Money", intensity: "mild" },
  { id: "comp_025", deckId: "date_dealbreakers", question: "How do you think a couple should handle shared expenses?", category: "Money", intensity: "deep" },

  //   Category: Values & Beliefs
  { id: "comp_026", deckId: "date_dealbreakers", question: "How important is religion or spirituality in your daily life?", category: "Values", intensity: "deep" },
  { id: "comp_027", deckId: "date_dealbreakers", question: "Are you politically active? Could you date someone with opposite views?", category: "Values", intensity: "deep" },
  { id: "comp_028", deckId: "date_dealbreakers", question: "What is one social cause you would go to a march for?", category: "Values", intensity: "medium" },
  { id: "comp_029", deckId: "date_dealbreakers", question: "What is your 'moral compass'—what guides your big decisions?", category: "Values", intensity: "deep" },
  { id: "comp_030", deckId: "date_dealbreakers", question: "How do you feel about traditional gender roles in a relationship?", category: "Values", intensity: "medium" },

  //   Category: Travel & Adventure
  { id: "comp_031", deckId: "date_dealbreakers", question: "Is travel a priority for you, or do you prefer to invest in your home?", category: "Adventure", intensity: "mild" },
  { id: "comp_032", deckId: "date_dealbreakers", question: "Are you a 'planned itinerary' traveler or a 'wing it' traveler?", category: "Adventure", intensity: "mild" },
  { id: "comp_033", deckId: "date_dealbreakers", question: "What is one place in the world you absolutely must visit before you die?", category: "Adventure", intensity: "medium" },
  { id: "comp_034", deckId: "date_dealbreakers", question: "How do you feel about moving to a new city or country for a partner?", category: "Adventure", intensity: "deep" },
  { id: "comp_035", deckId: "date_dealbreakers", question: "What’s your idea of an 'adventure'—physical risk or new experiences?", category: "Adventure", intensity: "medium" },

  //   Category: Social Life & Alcohol
  { id: "comp_036", deckId: "date_dealbreakers", question: "What’s your relationship with alcohol or substances? Is it a part of your social life?", category: "Social", intensity: "medium" },
  { id: "comp_037", deckId: "date_dealbreakers", question: "How much do you enjoy going out to clubs or bars vs. dinner parties?", category: "Social", intensity: "mild" },
  { id: "comp_038", deckId: "date_dealbreakers", question: "Do you prefer having a large group of friends or a few very close ones?", category: "Social", intensity: "medium" },
  { id: "comp_039", deckId: "date_dealbreakers", question: "How do you feel about your partner having close friends of the opposite sex?", category: "Social", intensity: "deep" },
  { id: "comp_040", deckId: "date_dealbreakers", question: "Are you the 'host' or the 'guest' in your social circle?", category: "Social", intensity: "mild" },

  //   Category: Personal Growth
  { id: "comp_041", deckId: "date_dealbreakers", question: "What is a 'work in progress' part of your personality?", category: "Growth", intensity: "deep" },
  { id: "comp_042", deckId: "date_dealbreakers", question: "Do you believe in therapy? Have you ever gone or would you go?", category: "Growth", intensity: "medium" },
  { id: "comp_043", deckId: "date_dealbreakers", question: "What is one thing you’ve changed your mind about in the last year?", category: "Growth", intensity: "medium" },
  { id: "comp_044", deckId: "date_dealbreakers", question: "How do you handle failure or a major setback?", category: "Growth", intensity: "deep" },
  { id: "comp_045", deckId: "date_dealbreakers", question: "How important is 'self-improvement' to you in a partner?", category: "Growth", intensity: "medium" },

  //   Category: Dealbreakers (Direct)
  { id: "comp_046", deckId: "date_dealbreakers", question: "What is one thing that is an 'instant no' for you on a first date?", category: "Dealbreakers", intensity: "medium" },
  { id: "comp_047", deckId: "date_dealbreakers", question: "Could you date someone who smokes or vapes?", category: "Dealbreakers", intensity: "medium" },
  { id: "comp_048", deckId: "date_dealbreakers", question: "How do you feel about 'vanity'—is excessive social media use a turn-off?", category: "Dealbreakers", intensity: "medium" },
  { id: "comp_049", deckId: "date_dealbreakers", question: "What is your biggest 'pet peeve' in a romantic partner?", category: "Dealbreakers", intensity: "mild" },
  { id: "comp_050", deckId: "date_dealbreakers", question: "Is there a specific 'lifestyle' (e.g., vegan, ultra-marathoner) you couldn't mesh with?", category: "Dealbreakers", intensity: "medium" },

  //   Category: Emotional Intel
  { id: "comp_051", deckId: "date_dealbreakers", question: "How do you express anger? Do you get quiet, loud, or analytical?", category: "EQ", intensity: "deep" },
  { id: "comp_052", deckId: "date_dealbreakers", question: "What’s the best way for a partner to support you when you’re stressed?", category: "EQ", intensity: "medium" },
  { id: "comp_053", deckId: "date_dealbreakers", question: "Do you hold grudges, or are you quick to forgive and forget?", category: "EQ", intensity: "deep" },
  { id: "comp_054", deckId: "date_dealbreakers", question: "What is one thing you’re proud of that has nothing to do with work?", category: "EQ", intensity: "medium" },
  { id: "comp_055", deckId: "date_dealbreakers", question: "What does 'emotional safety' feel like to you?", category: "EQ", intensity: "deep" },

  //   Category: Compatibility 'Gut Check'
  { id: "comp_056", deckId: "date_dealbreakers", question: "What is one 'quirk' of yours that usually takes people time to get used to?", category: "Gut Check", intensity: "medium" },
  { id: "comp_057", deckId: "date_dealbreakers", question: "Do you think we have similar energy levels so far?", category: "Gut Check", intensity: "medium" },
  { id: "comp_058", deckId: "date_dealbreakers", question: "If we lived together, what would be the number one thing we’d argue about?", category: "Gut Check", intensity: "deep" },
  { id: "comp_059", deckId: "date_dealbreakers", question: "What’s a 'green flag' you’ve noticed about me today?", category: "Gut Check", intensity: "medium" },
  { id: "comp_060", deckId: "date_dealbreakers", question: "What is the most important thing a partner needs to 'get' about you to love you well?", category: "Gut Check", intensity: "deep" },

  //   Category: Destinations
  { id: "travel_001", deckId: "date_travel_vibes", question: "If you could live in a different country for one year, where would you go?", category: "Destinations", intensity: "mild" },
  { id: "travel_002", deckId: "date_travel_vibes", question: "Mountains, beach, or big city—which one calls your name most?", category: "Destinations", intensity: "mild" },
  { id: "travel_003", deckId: "date_travel_vibes", question: "What is the most 'touristy' thing you’ve done that was actually worth it?", category: "Destinations", intensity: "mild" },
  { id: "travel_004", deckId: "date_travel_vibes", question: "Is there a place you’ve visited that felt like it was from another planet?", category: "Destinations", intensity: "medium" },
  { id: "travel_005", deckId: "date_travel_vibes", question: "What’s the top destination on your 'to-do' list for the next five years?", category: "Destinations", intensity: "mild" },

  //   Category: Travel Habits
  { id: "travel_006", deckId: "date_travel_vibes", question: "Are you a 'carry-on only' traveler or do you pack your whole life?", category: "Habits", intensity: "mild" },
  { id: "travel_007", deckId: "date_travel_vibes", question: "Do you prefer to have every hour planned or do you like to wander aimlessly?", category: "Habits", intensity: "medium" },
  { id: "travel_008", deckId: "date_travel_vibes", question: "Window seat or aisle seat—and how judged should I feel for my choice?", category: "Habits", intensity: "mild" },
  { id: "travel_009", deckId: "date_travel_vibes", question: "How do you handle it when things go wrong, like a missed flight or a lost map?", category: "Habits", intensity: "medium" },
  { id: "travel_010", deckId: "date_travel_vibes", question: "Are you the person taking 500 photos or the person living in the moment?", category: "Habits", intensity: "mild" },

  //   Category: Stories & Mishaps
  { id: "travel_011", deckId: "date_travel_vibes", question: "What’s the weirdest thing you’ve ever eaten while abroad?", category: "Stories", intensity: "mild" },
  { id: "travel_012", deckId: "date_travel_vibes", question: "Have you ever had a 'lost in translation' moment that ended awkwardly?", category: "Stories", intensity: "medium" },
  { id: "travel_013", deckId: "date_travel_vibes", question: "What is your most epic travel fail that you can laugh about now?", category: "Stories", intensity: "medium" },
  { id: "travel_014", deckId: "date_travel_vibes", question: "Who is the most interesting stranger you’ve ever met on a trip?", category: "Stories", intensity: "medium" },
  { id: "travel_015", deckId: "date_travel_vibes", question: "What’s the longest you’ve ever spent in transit, and how did you survive?", category: "Stories", intensity: "mild" },

  //   Category: Cultural Curiosity
  { id: "travel_016", deckId: "date_travel_vibes", question: "What’s a cultural tradition from another country that you find beautiful?", category: "Culture", intensity: "medium" },
  { id: "travel_017", deckId: "date_travel_vibes", question: "Do you try to learn the local language, or do you rely on apps and gestures?", category: "Culture", intensity: "mild" },
  { id: "travel_018", deckId: "date_travel_vibes", question: "If you could pick up a new accent instantly, which one would you choose?", category: "Culture", intensity: "mild" },
  { id: "travel_019", deckId: "date_travel_vibes", question: "Which city has the best 'vibe' for just sitting in a cafe and people-watching?", category: "Culture", intensity: "mild" },
  { id: "travel_020", deckId: "date_travel_vibes", question: "What’s the one thing you always bring back as a souvenir?", category: "Culture", intensity: "mild" },

  //   Category: Future Adventures
  { id: "travel_021", deckId: "date_travel_vibes", question: "What’s your idea of a 'dream' honeymoon or solo escape?", category: "Future", intensity: "medium" },
  { id: "travel_022", deckId: "date_travel_vibes", question: "Would you ever go on a trip with someone you just met?", category: "Future", intensity: "medium" },
  { id: "travel_023", deckId: "date_travel_vibes", question: "If you had an unlimited budget for one week, where are we going?", category: "Future", intensity: "mild" },
  { id: "travel_024", deckId: "date_travel_vibes", question: "Road trip across the country or a flight across the ocean?", category: "Future", intensity: "mild" },
  { id: "travel_025", deckId: "date_travel_vibes", question: "What is one 'extreme' travel activity you’d love to try (or never try)?", category: "Future", intensity: "medium" },

  //   Category: Travel Logistics
  { id: "travel_026", deckId: "date_travel_vibes", question: "Are you a 'get to the airport 3 hours early' or a 'run to the gate' person?", category: "Logistics", intensity: "mild" },
  { id: "travel_027", deckId: "date_travel_vibes", question: "Physical maps or Google Maps? Which one makes you feel more like an explorer?", category: "Logistics", intensity: "mild" },
  { id: "travel_028", deckId: "date_travel_vibes", question: "What is your #1 travel essential that most people forget to pack?", category: "Logistics", intensity: "mild" },
  { id: "travel_029", deckId: "date_travel_vibes", question: "How do you feel about sleeping on planes, trains, or buses?", category: "Logistics", intensity: "mild" },
  { id: "travel_030", deckId: "date_travel_vibes", question: "What’s the most expensive thing you’ve ever bought while on vacation?", category: "Logistics", intensity: "medium" },

  //   Category: Solo vs. Group
  { id: "travel_031", deckId: "date_travel_vibes", question: "Have you ever traveled completely solo? If not, would you?", category: "Solo vs Group", intensity: "medium" },
  { id: "travel_032", deckId: "date_travel_vibes", question: "What’s your 'limit' for spending time with friends on a trip before you need a break?", category: "Solo vs Group", intensity: "medium" },
  { id: "travel_033", deckId: "date_travel_vibes", question: "Would you rather travel with a partner, a best friend, or a group of five?", category: "Solo vs Group", intensity: "medium" },
  { id: "travel_034", deckId: "date_travel_vibes", question: "How do you make new friends when you're in a city where you don't know anyone?", category: "Solo vs Group", intensity: "medium" },
  { id: "travel_035", deckId: "date_travel_vibes", question: "What’s the worst trait a travel companion can have?", category: "Solo vs Group", intensity: "medium" },

  //   Category: Budgets & Splurges
  { id: "travel_036", deckId: "date_travel_vibes", question: "Hostel, Airbnb, or 5-star Hotel? What’s your default?", category: "Budget", intensity: "mild" },
  { id: "travel_037", deckId: "date_travel_vibes", question: "Are you more likely to splurge on a fancy meal or an adventurous activity?", category: "Budget", intensity: "mild" },
  { id: "travel_038", deckId: "date_travel_vibes", question: "What’s the best 'free' thing you’ve ever done in a foreign city?", category: "Budget", intensity: "mild" },
  { id: "travel_039", deckId: "date_travel_vibes", question: "Do you set a strict budget for trips or just 'worry about it later'?", category: "Budget", intensity: "medium" },
  { id: "travel_040", deckId: "date_travel_vibes", question: "If I paid for the flights, where would you pay for the dinner?", category: "Budget", intensity: "medium" },

  //   Category: Experience & Art
  { id: "travel_041", deckId: "date_travel_vibes", question: "Do you prefer visiting famous museums or finding hidden street art?", category: "Experience", intensity: "mild" },
  { id: "travel_042", deckId: "date_travel_vibes", question: "What’s the most beautiful sunset you’ve ever witnessed?", category: "Experience", intensity: "mild" },
  { id: "travel_043", deckId: "date_travel_vibes", question: "Is there a specific song that always reminds you of a certain trip?", category: "Experience", intensity: "mild" },
  { id: "travel_044", deckId: "date_travel_vibes", question: "Nightlife and clubs or sunrise hikes and coffee?", category: "Experience", intensity: "medium" },
  { id: "travel_045", deckId: "date_travel_vibes", question: "What’s the most 'out of your comfort zone' thing you’ve done abroad?", category: "Experience", intensity: "medium" },

  //   Category: Travel Philosophy
  { id: "travel_046", deckId: "date_travel_vibes", question: "Does travel change a person, or does it just reveal who they are?", category: "Philosophy", intensity: "deep" },
  { id: "travel_047", deckId: "date_travel_vibes", question: "If you could only travel to one continent for the rest of your life, which is it?", category: "Philosophy", intensity: "medium" },
  { id: "travel_048", deckId: "date_travel_vibes", question: "What’s the one thing you’ve learned about yourself only because you traveled?", category: "Philosophy", intensity: "deep" },
  { id: "travel_049", deckId: "date_travel_vibes", question: "Do you believe in 'staycations' or is it not a vacation unless you leave?", category: "Philosophy", intensity: "mild" },
  { id: "travel_050", deckId: "date_travel_vibes", question: "If you could disappear to a remote cabin for a month, would you be bored or happy?", category: "Philosophy", intensity: "medium" },

  //   Category: Random & Fun
  { id: "travel_051", deckId: "date_travel_vibes", question: "What’s your favorite 'airport snack' that you only buy when flying?", category: "Fun", intensity: "mild" },
  { id: "travel_052", deckId: "date_travel_vibes", question: "Have you ever missed a flight? What’s the story?", category: "Fun", intensity: "medium" },
  { id: "travel_053", deckId: "date_travel_vibes", question: "What is your 'Mount Everest'? (The one challenge you want to conquer)", category: "Fun", intensity: "medium" },
  { id: "travel_054", deckId: "date_travel_vibes", question: "If we were at a karaoke bar in Tokyo right now, what song are we singing?", category: "Fun", intensity: "mild" },
  { id: "travel_055", deckId: "date_travel_vibes", question: "What’s the most 'tourist' outfit you own?", category: "Fun", intensity: "mild" },

  //   Category: Home & Return
  { id: "travel_056", deckId: "date_travel_vibes", question: "What’s the first thing you do the moment you walk through your front door after a trip?", category: "Home", intensity: "mild" },
  { id: "travel_057", deckId: "date_travel_vibes", question: "Do you get post-vacation blues or are you usually happy to be home?", category: "Home", intensity: "medium" },
  { id: "travel_058", deckId: "date_travel_vibes", question: "What’s a habit you picked up in another country that you still do at home?", category: "Home", intensity: "medium" },
  { id: "travel_059", deckId: "date_travel_vibes", question: "If you had to move abroad tomorrow, who would you miss the most?", category: "Home", intensity: "deep" },
  { id: "travel_060", deckId: "date_travel_vibes", question: "Where is the next place we should go if this date goes well?", category: "Home", intensity: "medium" },

  //   Category: Energy Levels
  { id: "social_001", deckId: "date_social_battery", question: "How long can you be at a party before you start looking for the exit?", category: "Energy", intensity: "mild" },
  { id: "social_002", deckId: "date_social_battery", question: "After a long week, does being around people energize you or drain you?", category: "Energy", intensity: "medium" },
  { id: "social_003", deckId: "date_social_battery", question: "What’s your 'social limit'—how many days in a row can you be out?", category: "Energy", intensity: "medium" },
  { id: "social_004", deckId: "date_social_battery", question: "Do you need a 'recovery day' after a big social event?", category: "Energy", intensity: "mild" },
  { id: "social_005", deckId: "date_social_battery", question: "What’s the quickest way for someone to drain your energy?", category: "Energy", intensity: "medium" },

  //   Category: Interaction Style
  { id: "social_006", deckId: "date_social_battery", question: "Are you the person who hosts the party or the person who helps clean up?", category: "Style", intensity: "mild" },
  { id: "social_007", deckId: "date_social_battery", question: "In a group of strangers, are you the first to speak or do you wait?", category: "Style", intensity: "medium" },
  { id: "social_008", deckId: "date_social_battery", question: "Do you prefer small, intimate dinners or large, loud gatherings?", category: "Style", intensity: "mild" },
  { id: "social_009", deckId: "date_social_battery", question: "What’s your 'secret signal' to a friend when you want to leave a situation?", category: "Style", intensity: "medium" },
  { id: "social_010", deckId: "date_social_battery", question: "Are you better at one-on-one conversations or group dynamics?", category: "Style", intensity: "medium" },

  //   Category: Comfort Zones
  { id: "social_011", deckId: "date_social_battery", question: "What’s a social situation that makes you feel most awkward?", category: "Comfort", intensity: "medium" },
  { id: "social_012", deckId: "date_social_battery", question: "How do you feel about small talk? Is it a necessary evil or do you hate it?", category: "Comfort", intensity: "medium" },
  { id: "social_013", deckId: "date_social_battery", question: "If you’re at a wedding where you know no one, what’s your move?", category: "Comfort", intensity: "medium" },
  { id: "social_014", deckId: "date_social_battery", question: "Do you enjoy being the center of attention, or do you prefer the sidelines?", category: "Comfort", intensity: "medium" },
  { id: "social_015", deckId: "date_social_battery", question: "What is your favorite 'low-energy' social activity?", category: "Comfort", intensity: "mild" },

  //   Category: Relationships & Space
  { id: "social_016", deckId: "date_social_battery", question: "How often do you 'ghost' the world and put your phone on DND?", category: "Space", intensity: "medium" },
  { id: "social_017", deckId: "date_social_battery", question: "Do you think a couple needs to do everything together, or is space vital?", category: "Space", intensity: "deep" },
  { id: "social_018", deckId: "date_social_battery", question: "What does a 'perfect quiet night' look like to you?", category: "Space", intensity: "mild" },
  { id: "social_019", deckId: "date_social_battery", question: "If we were both tired, could you enjoy 'parallel play' (reading/gaming separately in the same room)?", category: "Space", intensity: "medium" },
  { id: "social_020", deckId: "date_social_battery", question: "How do you feel when plans get canceled last minute?", category: "Space", intensity: "medium" },

  //   Category: Communication Habits
  { id: "social_021", deckId: "date_social_battery", question: "Are you a 'reply in 2 seconds' person or a 'reply in 2 business days' person?", category: "Habits", intensity: "medium" },
  { id: "social_022", deckId: "date_social_battery", question: "Do you prefer voice notes, texting, or an actual phone call?", category: "Habits", intensity: "mild" },
  { id: "social_023", deckId: "date_social_battery", question: "How do you feel about 'read receipts'? Are they helpful or toxic?", category: "Habits", intensity: "medium" },
  { id: "social_024", deckId: "date_social_battery", question: "What’s your 'social media' style? Posting daily or lurking once a month?", category: "Habits", intensity: "mild" },
  { id: "social_025", deckId: "date_social_battery", question: "How many unread notifications are on your phone right now?", category: "Habits", intensity: "mild" },

  //   Category: Public vs Private
  { id: "social_026", deckId: "date_social_battery", question: "Can you go to a movie or a restaurant alone, or do you need a companion?", category: "Public", intensity: "medium" },
  { id: "social_027", deckId: "date_social_battery", question: "Do you care what strangers think of you when you're out in public?", category: "Public", intensity: "medium" },
  { id: "social_028", deckId: "date_social_battery", question: "What is your 'go-to' outfit that makes you feel most socially confident?", category: "Public", intensity: "mild" },
  { id: "social_029", deckId: "date_social_battery", question: "Are you comfortable with public displays of affection?", category: "Public", intensity: "medium" },
  { id: "social_030", deckId: "date_social_battery", question: "What’s the most 'embarrassing' thing you’ve done in public that you now laugh at?", category: "Public", intensity: "medium" },

  //   Category: Party Dynamics
  { id: "social_031", deckId: "date_social_battery", question: "What’s your role at a party? The DJ, the bartender, or the one on the couch with the dog?", category: "Parties", intensity: "mild" },
  { id: "social_032", deckId: "date_social_battery", question: "Do you prefer an organized game night or a 'just see where the night goes' vibe?", category: "Parties", intensity: "mild" },
  { id: "social_033", deckId: "date_social_battery", question: "Have you ever done an 'Irish Exit' (leaving without saying goodbye)?", category: "Parties", intensity: "medium" },
  { id: "social_034", deckId: "date_social_battery", question: "What is your absolute favorite conversation starter for someone you just met?", category: "Parties", intensity: "mild" },
  { id: "social_035", deckId: "date_social_battery", question: "If you could host a dinner party for 5 people (dead or alive), who’s on the list?", category: "Parties", intensity: "medium" },

  //   Category: Friendship & Networking
  { id: "social_036", deckId: "date_social_battery", question: "Do you have a 'work personality' that is different from your real personality?", category: "Friendship", intensity: "medium" },
  { id: "social_037", deckId: "date_social_battery", question: "What’s the biggest 'green flag' you look for in a new friend?", category: "Friendship", intensity: "medium" },
  { id: "social_038", deckId: "date_social_battery", question: "Are you the person who initiates the hangouts or the person who waits to be invited?", category: "Friendship", intensity: "medium" },
  { id: "social_039", deckId: "date_social_battery", question: "How long does it take for someone to enter your 'inner circle'?", category: "Friendship", intensity: "deep" },
  { id: "social_040", deckId: "date_social_battery", question: "What is one social skill you wish you were better at?", category: "Friendship", intensity: "medium" },

  //   Category: Boundaries & Recharging
  { id: "social_041", deckId: "date_social_battery", question: "How do you say 'no' to plans without feeling guilty?", category: "Boundaries", intensity: "deep" },
  { id: "social_042", deckId: "date_social_battery", question: "If your social battery is at 1%, what is the one thing that will fix it?", category: "Boundaries", intensity: "medium" },
  { id: "social_043", deckId: "date_social_battery", question: "Do you prefer to live alone or with others?", category: "Boundaries", intensity: "medium" },
  { id: "social_044", deckId: "date_social_battery", question: "What’s your favorite way to spend a 'mental health day'?", category: "Boundaries", intensity: "mild" },
  { id: "social_045", deckId: "date_social_battery", question: "How do you feel about people who drop by your house unannounced?", category: "Boundaries", intensity: "medium" },

  //   Category: Deep vs. Wide
  { id: "social_046", deckId: "date_social_battery", question: "Would you rather have 100 acquaintances or 3 best friends?", category: "Social Depth", intensity: "medium" },
  { id: "social_047", deckId: "date_social_battery", question: "What’s a topic you could talk about for hours with anyone?", category: "Social Depth", intensity: "mild" },
  { id: "social_048", deckId: "date_social_battery", question: "Do you prefer talking about ideas, events, or people?", category: "Social Depth", intensity: "deep" },
  { id: "social_049", deckId: "date_social_battery", question: "How comfortable are you with silence when you're with someone else?", category: "Social Depth", intensity: "medium" },
  { id: "social_050", deckId: "date_social_battery", question: "What is something you wish more people asked you about?", category: "Social Depth", intensity: "medium" },

  //   Category: Conflict & Vibes
  { id: "social_051", deckId: "date_social_battery", question: "Are you a 'people pleaser' or are you okay with being the 'villain' sometimes?", category: "Conflict", intensity: "deep" },
  { id: "social_052", deckId: "date_social_battery", question: "How do you handle it when you don't vibe with one of your partner's friends?", category: "Conflict", intensity: "deep" },
  { id: "social_053", deckId: "date_social_battery", question: "What is your 'social superpower'?", category: "Conflict", intensity: "medium" },
  { id: "social_054", deckId: "date_social_battery", question: "How do you react to awkward situations? Do you point them out or hide?", category: "Conflict", intensity: "medium" },
  { id: "social_055", deckId: "date_social_battery", question: "What kind of energy do you think you’re putting out right now?", category: "Conflict", intensity: "deep" },

  //   Category: Future Social
  { id: "social_056", deckId: "date_social_battery", question: "What’s one social event you’re dreading this year?", category: "Future", intensity: "mild" },
  { id: "social_057", deckId: "date_social_battery", question: "Do you see yourself becoming more or less social as you get older?", category: "Future", intensity: "medium" },
  { id: "social_058", deckId: "date_social_battery", question: "If you were to move to a new city tomorrow, what’s the first thing you’d do to build a community?", category: "Future", intensity: "medium" },
  { id: "social_059", deckId: "date_social_battery", question: "What’s a 'bucket list' social experience for you (e.g., Burning Man, a gala)?", category: "Future", intensity: "medium" },
  { id: "social_060", deckId: "date_social_battery", question: "On a scale of 1-10, how much of your 'true self' am I seeing tonight?", category: "Future", intensity: "deep" },

  //   Category: Cooking & Kitchen
  { id: "food_001", deckId: "date_foodie_finds", question: "If you had to cook a three-course meal for me tonight, what’s on the menu?", category: "Cooking", intensity: "medium" },
  { id: "food_002", deckId: "date_foodie_finds", question: "Are you a 'follow the recipe exactly' person or a 'measure with your heart' person?", category: "Cooking", intensity: "mild" },
  { id: "food_003", deckId: "date_foodie_finds", question: "What is the most 'illegal' thing you’ve ever done to a dish while cooking?", category: "Cooking", intensity: "mild" },
  { id: "food_004", deckId: "date_foodie_finds", question: "What’s the one kitchen gadget you couldn’t live without?", category: "Cooking", intensity: "mild" },
  { id: "food_005", deckId: "date_foodie_finds", question: "Who taught you how to cook, or are you self-taught?", category: "Cooking", intensity: "mild" },

  //   Category: Dining Out
  { id: "food_006", deckId: "date_foodie_finds", question: "What’s your go-to 'lazy' takeout order?", category: "Dining", intensity: "mild" },
  { id: "food_007", deckId: "date_foodie_finds", question: "Are you the person who looks at the menu before we even get to the restaurant?", category: "Dining", intensity: "mild" },
  { id: "food_008", deckId: "date_foodie_finds", question: "Hole-in-the-wall authentic spot or fancy fine dining with a view?", category: "Dining", intensity: "medium" },
  { id: "food_009", deckId: "date_foodie_finds", question: "What is your biggest restaurant 'pet peeve'?", category: "Dining", intensity: "medium" },
  { id: "food_010", deckId: "date_foodie_finds", question: "If you could only eat at one restaurant for the rest of your life, which is it?", category: "Dining", intensity: "medium" },

  //   Category: Controversies
  { id: "food_011", deckId: "date_foodie_finds", question: "Does pineapple belong on pizza? This is a dealbreaker.", category: "Opinions", intensity: "mild" },
  { id: "food_012", deckId: "date_foodie_finds", question: "What’s a 'fancy' food that you think is actually disgusting?", category: "Opinions", intensity: "medium" },
  { id: "food_013", deckId: "date_foodie_finds", question: "Is a hot dog a sandwich? Let’s settle this.", category: "Opinions", intensity: "mild" },
  { id: "food_014", deckId: "date_foodie_finds", question: "Ketchup on eggs: Genius or a crime against humanity?", category: "Opinions", intensity: "mild" },
  { id: "food_015", deckId: "date_foodie_finds", question: "What is your most controversial snack combination?", category: "Opinions", intensity: "medium" },

  //   Category: Sweet vs Savory
  { id: "food_016", deckId: "date_foodie_finds", question: "If you had to choose: No more salt or no more sugar forever?", category: "Preferences", intensity: "medium" },
  { id: "food_017", deckId: "date_foodie_finds", question: "What’s your ultimate 'midnight snack'?", category: "Preferences", intensity: "mild" },
  { id: "food_018", deckId: "date_foodie_finds", question: "What’s a dessert that you simply cannot say no to?", category: "Preferences", intensity: "mild" },
  { id: "food_019", deckId: "date_foodie_finds", question: "Are you a 'fries first' or a 'burger first' kind of person?", category: "Preferences", intensity: "mild" },
  { id: "food_020", deckId: "date_foodie_finds", question: "What’s the weirdest thing you’ve ever eaten just because someone dared you?", category: "Preferences", intensity: "medium" },

  //   Category: Caffeine & Drinks
  { id: "food_021", deckId: "date_foodie_finds", question: "What is your specific coffee (or tea) order? No judgment.", category: "Drinks", intensity: "mild" },
  { id: "food_022", deckId: "date_foodie_finds", question: "Are you a 'caffeine before anything' person or can you function without it?", category: "Drinks", intensity: "mild" },
  { id: "food_023", deckId: "date_foodie_finds", question: "Wine, beer, cocktails, or a mocktail—what’s your celebratory drink?", category: "Drinks", intensity: "mild" },
  { id: "food_024", deckId: "date_foodie_finds", question: "What’s a drink everyone loves that you think tastes like medicine?", category: "Drinks", intensity: "mild" },
  { id: "food_025", deckId: "date_foodie_finds", question: "Do you have a favorite local spot for a quick drink?", category: "Drinks", intensity: "mild" },

  //   Category: Grocery Habits
  { id: "food_026", deckId: "date_foodie_finds", question: "Do you shop with a strict list or do you just buy what looks good in the moment?", category: "Shopping", intensity: "mild" },
  { id: "food_027", deckId: "date_foodie_finds", question: "What is the one item that is *always* in your fridge, no matter what?", category: "Shopping", intensity: "mild" },
  { id: "food_028", deckId: "date_foodie_finds", question: "Which grocery store aisle do you spend the most time in?", category: "Shopping", intensity: "mild" },
  { id: "food_029", deckId: "date_foodie_finds", question: "Are you a brand-name loyalist or do you go for the generic versions?", category: "Shopping", intensity: "mild" },
  { id: "food_030", deckId: "date_foodie_finds", question: "If I looked in your pantry right now, what would I be most surprised to see?", category: "Shopping", intensity: "medium" },

  //   Category: Kitchen Mishaps
  { id: "food_031", deckId: "date_foodie_finds", question: "What’s the most 'un-edible' thing you’ve ever accidentally cooked?", category: "Mishaps", intensity: "medium" },
  { id: "food_032", deckId: "date_foodie_finds", question: "Have you ever set off the smoke alarm while trying to be romantic?", category: "Mishaps", intensity: "mild" },
  { id: "food_033", deckId: "date_foodie_finds", question: "What is the one dish you've tried to make multiple times but just can't get right?", category: "Mishaps", intensity: "medium" },
  { id: "food_034", deckId: "date_foodie_finds", question: "What’s your 'it’s 2 AM and I’m starving' meal?", category: "Mishaps", intensity: "mild" },
  { id: "food_035", deckId: "date_foodie_finds", question: "What’s the worst thing you’ve ever eaten at a friend's house out of politeness?", category: "Mishaps", intensity: "medium" },

  //   Category: Dining Etiquette
  { id: "food_036", deckId: "date_foodie_finds", question: "How do you feel about sharing food? Is my plate off-limits?", category: "Etiquette", intensity: "medium" },
  { id: "food_037", deckId: "date_foodie_finds", question: "Do you believe in 'the last bite' rule (whoever finished it has to offer it)?", category: "Etiquette", intensity: "mild" },
  { id: "food_038", deckId: "date_foodie_finds", question: "What’s your stance on taking photos of your food before eating?", category: "Etiquette", intensity: "mild" },
  { id: "food_039", deckId: "date_foodie_finds", question: "If the service is bad but the food is great, do you go back?", category: "Etiquette", intensity: "medium" },
  { id: "food_040", deckId: "date_foodie_finds", question: "What is a 'table manner' that you find particularly attractive or repulsive?", category: "Etiquette", intensity: "medium" },

  //   Category: Nostalgia & Comfort
  { id: "food_041", deckId: "date_foodie_finds", question: "What meal instantly reminds you of your childhood home?", category: "Nostalgia", intensity: "medium" },
  { id: "food_042", deckId: "date_foodie_finds", question: "Was there a food you hated as a kid but love now?", category: "Nostalgia", intensity: "mild" },
  { id: "food_043", deckId: "date_foodie_finds", question: "What’s your ultimate 'sick day' soup or meal?", category: "Nostalgia", intensity: "mild" },
  { id: "food_044", deckId: "date_foodie_finds", question: "What is the best thing your mom/dad/grandparent used to make for you?", category: "Nostalgia", intensity: "medium" },
  { id: "food_045", deckId: "date_foodie_finds", question: "Is there a specific 'holiday' food that you wait for all year?", category: "Nostalgia", intensity: "mild" },

  //   Category: Flavors & Philosophy
  { id: "food_046", deckId: "date_foodie_finds", question: "On a scale of 1-10, how much spice can you actually handle?", category: "Philosophy", intensity: "medium" },
  { id: "food_047", deckId: "date_foodie_finds", question: "Does cilantro taste like soap to you? (We need to check the genetics).", category: "Philosophy", intensity: "mild" },
  { id: "food_048", deckId: "date_foodie_finds", question: "If you were stranded on an island and could only have one condiment, what is it?", category: "Philosophy", intensity: "medium" },
  { id: "food_049", deckId: "date_foodie_finds", question: "Do you eat to live, or live to eat?", category: "Philosophy", intensity: "deep" },
  { id: "food_050", deckId: "date_foodie_finds", question: "What’s your 'last meal on Earth'—no limits, no calories?", category: "Philosophy", intensity: "deep" },

  //   Category: Future & Dating
  { id: "food_051", deckId: "date_foodie_finds", question: "What’s the most romantic meal you can imagine?", category: "Future", intensity: "medium" },
  { id: "food_052", deckId: "date_foodie_finds", question: "If we went to a food festival, which booth would we hit first?", category: "Future", intensity: "mild" },
  { id: "food_053", deckId: "date_foodie_finds", question: "Would you ever do a 'blind taste test' date?", category: "Future", intensity: "medium" },
  { id: "food_054", deckId: "date_foodie_finds", question: "What is a food you've always wanted to try but have been too scared to?", category: "Future", intensity: "medium" },
  { id: "food_055", deckId: "date_foodie_finds", question: "If we were to cook together, would you want to be the head chef or the sous chef?", category: "Future", intensity: "medium" },

  //   Category: Wildcard
  { id: "food_056", deckId: "date_foodie_finds", question: "What’s the best street food you’ve ever had?", category: "Wildcard", intensity: "mild" },
  { id: "food_057", deckId: "date_foodie_finds", question: "If you had to win a 'food eating contest,' which food are you choosing?", category: "Wildcard", intensity: "mild" },
  { id: "food_058", deckId: "date_foodie_finds", question: "What’s the weirdest 'food hack' you swear by?", category: "Wildcard", intensity: "medium" },
  { id: "food_059", deckId: "date_foodie_finds", question: "How many days in a row could you eat the same meal before getting bored?", category: "Wildcard", intensity: "mild" },
  { id: "food_060", deckId: "date_foodie_finds", question: "Based on our date so far, what kind of dessert do you think I am?", category: "Wildcard", intensity: "deep" },

  //   Category: Emotional Intelligence
  { id: "green_001", deckId: "date_green_flags", question: "What’s the most 'emotionally mature' thing you’ve done recently?", category: "EQ", intensity: "medium" },
  { id: "green_002", deckId: "date_green_flags", question: "How do you handle it when someone disagrees with you on a topic you’re passionate about?", category: "EQ", intensity: "medium" },
  { id: "green_003", deckId: "date_green_flags", question: "What is your proudest moment of personal growth?", category: "EQ", intensity: "deep" },
  { id: "green_004", deckId: "date_green_flags", question: "Are you able to admit when you're wrong without making excuses?", category: "EQ", intensity: "deep" },
  { id: "green_005", deckId: "date_green_flags", question: "How do you show someone you are truly listening to them?", category: "EQ", intensity: "medium" },

  //   Category: Kindness & Empathy
  { id: "green_006", deckId: "date_green_flags", question: "What is a small act of kindness you’ve witnessed lately that moved you?", category: "Kindness", intensity: "mild" },
  { id: "green_007", deckId: "date_green_flags", question: "How do you react when a stranger is going through a hard time in public?", category: "Kindness", intensity: "medium" },
  { id: "green_008", deckId: "date_green_flags", question: "What’s the nicest thing a friend has ever said about your character?", category: "Kindness", intensity: "medium" },
  { id: "green_009", deckId: "date_green_flags", question: "Do you find it easy to forgive people, or do you need a lot of time?", category: "Kindness", intensity: "medium" },
  { id: "green_010", deckId: "date_green_flags", question: "How do you treat people who can do absolutely nothing for you?", category: "Kindness", intensity: "deep" },

  //   Category: Reliability & Consistency
  { id: "green_011", deckId: "date_green_flags", question: "If you say you’re going to be somewhere at 7:00, what time do you actually arrive?", category: "Reliability", intensity: "mild" },
  { id: "green_012", deckId: "date_green_flags", question: "What does it mean to you to be a 'person of your word'?", category: "Reliability", intensity: "medium" },
  { id: "green_013", deckId: "date_green_flags", question: "How do you handle it when you have to cancel plans last minute?", category: "Reliability", intensity: "medium" },
  { id: "green_014", deckId: "date_green_flags", question: "Do your friends consider you the 'dependable' one in the group?", category: "Reliability", intensity: "mild" },
  { id: "green_015", deckId: "date_green_flags", question: "What is one promise you’ve made to yourself that you’ve actually kept?", category: "Reliability", intensity: "medium" },

  //   Category: Boundaries & Respect
  { id: "green_016", deckId: "date_green_flags", question: "How do you communicate your boundaries to someone you just started dating?", category: "Boundaries", intensity: "deep" },
  { id: "green_017", deckId: "date_green_flags", question: "What’s your reaction when someone tells you 'no'?", category: "Boundaries", intensity: "medium" },
  { id: "green_018", deckId: "date_green_flags", question: "Do you ask for consent before making a move or touching someone?", category: "Boundaries", intensity: "deep" },
  { id: "green_019", deckId: "date_green_flags", question: "How do you feel about your partner having their own separate hobbies and friends?", category: "Boundaries", intensity: "medium" },
  { id: "green_020", deckId: "date_green_flags", question: "What is a 'hard boundary' for you that you’ll never compromise on?", category: "Boundaries", intensity: "deep" },

  //   Category: Self-Care & Mental Health
  { id: "green_021", deckId: "date_green_flags", question: "What do you do to take care of your mental health on a regular basis?", category: "Self-Care", intensity: "medium" },
  { id: "green_022", deckId: "date_green_flags", question: "Can you be happy for others even when you’re going through a hard time?", category: "Self-Care", intensity: "medium" },
  { id: "green_023", deckId: "date_green_flags", question: "How do you recharge when you’re feeling completely burnt out?", category: "Self-Care", intensity: "mild" },
  { id: "green_024", deckId: "date_green_flags", question: "Are you comfortable spending time alone, or do you always need company?", category: "Self-Care", intensity: "medium" },
  { id: "green_025", deckId: "date_green_flags", question: "What’s one thing you love about yourself that has nothing to do with your appearance?", category: "Self-Care", intensity: "deep" },

  //   Category: Social Dynamics
  { id: "green_026", deckId: "date_green_flags", question: "How do you treat waitstaff and service workers when things go wrong?", category: "Social", intensity: "medium" },
  { id: "green_027", deckId: "date_green_flags", question: "Do you speak well of your friends when they aren't in the room?", category: "Social", intensity: "medium" },
  { id: "green_028", deckId: "date_green_flags", question: "How do you handle a social situation where someone is being excluded?", category: "Social", intensity: "medium" },
  { id: "green_029", deckId: "date_green_flags", question: "Are you the kind of person who cleans up after themselves at a house party?", category: "Social", intensity: "mild" },
  { id: "green_030", deckId: "date_green_flags", question: "How do you react when someone shares an opinion that is unpopular but harmless?", category: "Social", intensity: "medium" },

  //   Category: Communication Style
  { id: "green_031", deckId: "date_green_flags", question: "When you're hurt, do you use 'I feel' statements or 'You did' statements?", category: "Communication", intensity: "deep" },
  { id: "green_032", deckId: "date_green_flags", question: "Are you comfortable with difficult conversations, or do you tend to avoid them?", category: "Communication", intensity: "deep" },
  { id: "green_033", deckId: "date_green_flags", question: "How do you show appreciation for the small things people do for you?", category: "Communication", intensity: "mild" },
  { id: "green_034", deckId: "date_green_flags", question: "Do you prefer to talk about issues immediately or wait until emotions settle?", category: "Communication", intensity: "medium" },
  { id: "green_035", deckId: "date_green_flags", question: "What’s your 'green flag' for how someone communicates over text?", category: "Communication", intensity: "mild" },

  //   Category: Ambition & Passion
  { id: "green_036", deckId: "date_green_flags", question: "What is a goal you’ve set and actually achieved through hard work?", category: "Ambition", intensity: "medium" },
  { id: "green_037", deckId: "date_green_flags", question: "Are you genuinely supportive of other people’s success?", category: "Ambition", intensity: "medium" },
  { id: "green_038", deckId: "date_green_flags", question: "What’s a topic you could talk about for hours because you truly care about it?", category: "Ambition", intensity: "mild" },
  { id: "green_039", deckId: "date_green_flags", question: "Do you have a 'growth mindset'—believing you can always improve?", category: "Ambition", intensity: "medium" },
  { id: "green_040", deckId: "date_green_flags", question: "How do you stay motivated when things get boring or difficult?", category: "Ambition", intensity: "medium" },

  //   Category: Vulnerability
  { id: "green_041", deckId: "date_green_flags", question: "What is one fear you’ve shared with someone that made you feel closer to them?", category: "Vulnerability", intensity: "deep" },
  { id: "green_042", deckId: "date_green_flags", question: "Is it easy for you to ask for help when you need it?", category: "Vulnerability", intensity: "medium" },
  { id: "green_043", deckId: "date_green_flags", question: "How do you feel about showing emotion (like crying) in front of others?", category: "Vulnerability", intensity: "medium" },
  { id: "green_044", deckId: "date_green_flags", question: "What’s the most vulnerable thing you’ve ever told a partner?", category: "Vulnerability", intensity: "deep" },
  { id: "green_045", deckId: "date_green_flags", question: "Do you find strength in being open, or do you see it as a weakness?", category: "Vulnerability", intensity: "deep" },

  //   Category: Conflict Resolution
  { id: "green_046", deckId: "date_green_flags", question: "In an argument, is your goal to 'win' or to find a solution together?", category: "Conflict", intensity: "deep" },
  { id: "green_047", deckId: "date_green_flags", question: "How do you de-escalate a situation when you notice someone is getting angry?", category: "Conflict", intensity: "medium" },
  { id: "green_048", deckId: "date_green_flags", question: "Are you able to apologize sincerely without saying 'I'm sorry, BUT...'?", category: "Conflict", intensity: "deep" },
  { id: "green_049", deckId: "date_green_flags", question: "What’s the healthiest way you’ve ever ended a relationship or friendship?", category: "Conflict", intensity: "deep" },
  { id: "green_050", deckId: "date_green_flags", question: "Can you disagree with someone and still maintain respect for them?", category: "Conflict", intensity: "medium" },

  //   Category: Lifestyle & Values
  { id: "green_051", deckId: "date_green_flags", question: "How do you handle money—are you generous, cautious, or balanced?", category: "Values", intensity: "medium" },
  { id: "green_052", deckId: "date_green_flags", question: "What is your stance on social justice and helping those less fortunate?", category: "Values", intensity: "medium" },
  { id: "green_053", deckId: "date_green_flags", question: "How do you balance your personal desires with the needs of your community?", category: "Values", intensity: "deep" },
  { id: "green_054", deckId: "date_green_flags", question: "What is one 'old fashioned' value you still hold dear?", category: "Values", intensity: "mild" },
  { id: "green_055", deckId: "date_green_flags", question: "Do you live in a way that is consistent with what you say you believe?", category: "Values", intensity: "deep" },

  //   Category: Fun & Spontaneity
  { id: "green_056", deckId: "date_green_flags", question: "Are you able to laugh at yourself when you make a silly mistake?", category: "Fun", intensity: "mild" },
  { id: "green_057", deckId: "date_green_flags", question: "What’s the most spontaneous, 'living in the moment' thing you’ve done recently?", category: "Fun", intensity: "mild" },
  { id: "green_058", deckId: "date_green_flags", question: "Can you find joy in the mundane, like a trip to the grocery store?", category: "Fun", intensity: "mild" },
  { id: "green_059", deckId: "date_green_flags", question: "What’s one 'green flag' you’ve noticed about yourself today?", category: "Fun", intensity: "medium" },
  { id: "green_060", deckId: "date_green_flags", question: "If we were to look back on this date in a year, what would be the 'green flag' moment?", category: "Fun", intensity: "deep" },

  // //   Category: This or That (Classic)
  // { id: "speed_001", deckId: "date_speed_dating", question: "Coffee or tea?", category: "This or That", intensity: "mild" },
  // { id: "speed_002", deckId: "date_speed_dating", question: "Early bird or night owl?", category: "This or That", intensity: "mild" },
  // { id: "speed_003", deckId: "date_speed_dating", question: "Cats or dogs?", category: "This or That", intensity: "mild" },
  // { id: "speed_004", deckId: "date_speed_dating", question: "Call or text?", category: "This or That", intensity: "mild" },
  // { id: "speed_005", deckId: "date_speed_dating", question: "Beach or mountains?", category: "This or That", intensity: "mild" },
  // { id: "speed_006", deckId: "date_speed_dating", question: "Sweet or savory?", category: "This or That", intensity: "mild" },
  // { id: "speed_007", deckId: "date_speed_dating", question: "Couch or club?", category: "This or That", intensity: "mild" },
  // { id: "speed_008", deckId: "date_speed_dating", question: "Book or movie?", category: "This or That", intensity: "mild" },
  // { id: "speed_009", deckId: "date_speed_dating", question: "Big party or small gathering?", category: "This or That", intensity: "mild" },
  // { id: "speed_010", deckId: "date_speed_dating", question: "Introvert or extrovert?", category: "This or That", intensity: "mild" },

  // //   Category: Quick Favorites
  // { id: "speed_011", deckId: "date_speed_dating", question: "Favorite pizza topping?", category: "Favorites", intensity: "mild" },
  // { id: "speed_012", deckId: "date_speed_dating", question: "Your go-to karaoke song?", category: "Favorites", intensity: "mild" },
  // { id: "speed_013", deckId: "date_speed_dating", question: "Best movie of all time?", category: "Favorites", intensity: "mild" },
  // { id: "speed_014", deckId: "date_speed_dating", question: "Favorite season of the year?", category: "Favorites", intensity: "mild" },
  // { id: "speed_015", deckId: "date_speed_dating", question: "Top travel destination?", category: "Favorites", intensity: "mild" },
  // { id: "speed_016", deckId: "date_speed_dating", question: "Favorite childhood cartoon?", category: "Favorites", intensity: "mild" },
  // { id: "speed_017", deckId: "date_speed_dating", question: "Best flavor of ice cream?", category: "Favorites", intensity: "mild" },
  // { id: "speed_018", deckId: "date_speed_dating", question: "Your favorite app on your phone?", category: "Favorites", intensity: "mild" },
  // { id: "speed_019", deckId: "date_speed_dating", question: "The last book you actually finished?", category: "Favorites", intensity: "mild" },
  // { id: "speed_020", deckId: "date_speed_dating", question: "Favorite way to spend a Sunday?", category: "Favorites", intensity: "mild" },

  // //   Category: Lifestyle & Habits
  // { id: "speed_021", deckId: "date_speed_dating", question: "Shower in the morning or at night?", category: "Habits", intensity: "mild" },
  // { id: "speed_022", deckId: "date_speed_dating", question: "Cook at home or order in?", category: "Habits", intensity: "mild" },
  // { id: "speed_023", deckId: "date_speed_dating", question: "Messy desk or clean workspace?", category: "Habits", intensity: "mild" },
  // { id: "speed_024", deckId: "date_speed_dating", question: "Plan everything or wing it?", category: "Habits", intensity: "medium" },
  // { id: "speed_025", deckId: "date_speed_dating", question: "Save or spend?", category: "Habits", intensity: "medium" },
  // { id: "speed_026", deckId: "date_speed_dating", question: "Physical book or E-reader?", category: "Habits", intensity: "mild" },
  // { id: "speed_027", deckId: "date_speed_dating", question: "Gym or outdoor exercise?", category: "Habits", intensity: "mild" },
  // { id: "speed_028", deckId: "date_speed_dating", question: "Sleep with the window open or closed?", category: "Habits", intensity: "mild" },
  // { id: "speed_029", deckId: "date_speed_dating", question: "Snooze button or get up immediately?", category: "Habits", intensity: "mild" },
  // { id: "speed_030", deckId: "date_speed_dating", question: "Instagram or TikTok?", category: "Habits", intensity: "mild" },

  // //   Category: Snap Judgments
  // { id: "speed_031", deckId: "date_speed_dating", question: "Silver or gold?", category: "Snap Judgments", intensity: "mild" },
  // { id: "speed_032", deckId: "date_speed_dating", question: "Dressed up or dressed down?", category: "Snap Judgments", intensity: "mild" },
  // { id: "speed_033", deckId: "date_speed_dating", question: "City lights or starry nights?", category: "Snap Judgments", intensity: "mild" },
  // { id: "speed_034", deckId: "date_speed_dating", question: "Reality TV: Yes or Never?", category: "Snap Judgments", intensity: "mild" },
  // { id: "speed_035", deckId: "date_speed_dating", question: "Podcast or music while driving?", category: "Snap Judgments", intensity: "mild" },
  // { id: "speed_036", deckId: "date_speed_dating", question: "Hot coffee or iced coffee?", category: "Snap Judgments", intensity: "mild" },
  // { id: "speed_037", deckId: "date_speed_dating", question: "Summer or winter?", category: "Snap Judgments", intensity: "mild" },
  // { id: "speed_038", deckId: "date_speed_dating", question: "Airlines: Window or Aisle?", category: "Snap Judgments", intensity: "mild" },
  // { id: "speed_039", deckId: "date_speed_dating", question: "Horror movie or Rom-Com?", category: "Snap Judgments", intensity: "mild" },
  // { id: "speed_040", deckId: "date_speed_dating", question: "Spontaneous trip or staycation?", category: "Snap Judgments", intensity: "mild" },

  // //   Category: Deep (But Fast)
  // { id: "speed_041", deckId: "date_speed_dating", question: "First thing you notice about someone?", category: "Deep Fast", intensity: "medium" },
  // { id: "speed_042", deckId: "date_speed_dating", question: "Your biggest fear in one word?", category: "Deep Fast", intensity: "medium" },
  // { id: "speed_043", deckId: "date_speed_dating", question: "Your proudest achievement?", category: "Deep Fast", intensity: "medium" },
  // { id: "speed_044", deckId: "date_speed_dating", question: "One thing you’d change about yourself?", category: "Deep Fast", intensity: "medium" },
  // { id: "speed_045", deckId: "date_speed_dating", question: "Head or Heart?", category: "Deep Fast", intensity: "medium" },
  // { id: "speed_046", deckId: "date_speed_dating", question: "What’s your 'personal brand' in 3 words?", category: "Deep Fast", intensity: "medium" },
  // { id: "speed_047", deckId: "date_speed_dating", question: "One thing you can't live without?", category: "Deep Fast", intensity: "medium" },
  // { id: "speed_048", deckId: "date_speed_dating", question: "What is your secret talent?", category: "Deep Fast", intensity: "medium" },
  // { id: "speed_049", deckId: "date_speed_dating", question: "The best advice you’ve ever received?", category: "Deep Fast", intensity: "medium" },
  // { id: "speed_050", deckId: "date_speed_dating", question: "If you could have one superpower, what is it?", category: "Deep Fast", intensity: "medium" },

  // //   Category: Fun Wildcards
  // { id: "speed_051", deckId: "date_speed_dating", question: "Pineapple on pizza: Yes or No?", category: "Wildcards", intensity: "mild" },
  // { id: "speed_052", deckId: "date_speed_dating", question: "Can you touch your toes?", category: "Wildcards", intensity: "mild" },
  // { id: "speed_053", deckId: "date_speed_dating", question: "Aliens: Real or fake?", category: "Wildcards", intensity: "mild" },
  // { id: "speed_054", deckId: "date_speed_dating", question: "What’s your spirit animal?", category: "Wildcards", intensity: "mild" },
  // { id: "speed_055", deckId: "date_speed_dating", question: "Is a hot dog a sandwich?", category: "Wildcards", intensity: "mild" },
  // { id: "speed_056", deckId: "date_speed_dating", question: "Which Hogwarts house are you?", category: "Wildcards", intensity: "mild" },
  // { id: "speed_057", deckId: "date_speed_dating", question: "If you were a color, what would you be?", category: "Wildcards", intensity: "mild" },
  // { id: "speed_058", deckId: "date_speed_dating", question: "What’s your middle name?", category: "Wildcards", intensity: "mild" },
  // { id: "speed_059", deckId: "date_speed_dating", question: "Would you survive a zombie apocalypse?", category: "Wildcards", intensity: "medium" },
  // { id: "speed_060", deckId: "date_speed_dating", question: "Final verdict: Is this date a 10/10?", category: "Wildcards", intensity: "medium" },
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