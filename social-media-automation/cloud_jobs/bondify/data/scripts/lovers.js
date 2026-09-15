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
  { id: "lovers", title: "💑 Lovers", tagline: "Deepen your connection" }
];

const decks = [
  // ── LOVERS ──
{ id: "lovers_getting_deeper", modeId: "lovers", title: "❤️ Getting Deeper", description: "Questions to truly know your partner", isLocked: false },
  { id: "lovers_ideal_world", modeId: "lovers", title: "🌎 Our Future", description: "Dreaming about your life together", isLocked: false },
  { id: "lovers_love_languages", modeId: "lovers", title: "🤟 Love Languages", description: "How do you best feel appreciated?", isLocked: false },
  { id: "lovers_conflict_resolution", modeId: "lovers", title: "🌊 Smooth Sailing", description: "How we handle the tough moments together", isLocked: false },
  { id: "lovers_inner_child", modeId: "lovers", title: "🧸 Inner Child", description: "Heal and connect with each other's past", isLocked: false },
  { id: "lovers_spicy_talk", modeId: "lovers", title: "🌶️ Spicy Talk", description: "Turn up the heat between you two", isLocked: true },
  { id: "lovers_vulnerability", modeId: "lovers", title: "🛡️ Guard Down", description: "The things we rarely say out loud", isLocked: true },
  { id: "lovers_daily_ritual", modeId: "lovers", title: "☕ Small Joys", description: "Appreciating the little things in your routine", isLocked: true }
];
const cards = [
  //   Category: Romance
  { id: "lovers_gd_011", deckId: "lovers_getting_deeper", question: "What’s a small way I show love that you never want me to stop doing?", category: "Romance", intensity: "medium" },
  { id: "lovers_gd_012", deckId: "lovers_getting_deeper", question: "If our love story was a movie, what would be the climax?", category: "Romance", intensity: "medium" },
  { id: "lovers_gd_013", deckId: "lovers_getting_deeper", question: "What’s the most 'us' thing we do together?", category: "Romance", intensity: "mild" },
  { id: "lovers_gd_014", deckId: "lovers_getting_deeper", question: "What was your first physical attraction to me versus your first emotional attraction?", category: "Romance", intensity: "medium" },
  { id: "lovers_gd_015", deckId: "lovers_getting_deeper", question: "When do you feel most 'at home' with me?", category: "Romance", intensity: "medium" },

  //   Category: Vulnerability
  { id: "lovers_gd_016", deckId: "lovers_getting_deeper", question: "What is a part of yourself you’ve always struggled to accept?", category: "Vulnerability", intensity: "deep" },
  { id: "lovers_gd_017", deckId: "lovers_getting_deeper", question: "What’s a secret burden you’re carrying right now that I can help with?", category: "Vulnerability", intensity: "deep" },
  { id: "lovers_gd_018", deckId: "lovers_getting_deeper", question: "What is your biggest insecurity regarding our relationship?", category: "Vulnerability", intensity: "deep" },
  { id: "lovers_gd_019", deckId: "lovers_getting_deeper", question: "What was the hardest thing you’ve ever had to forgive yourself for?", category: "Vulnerability", intensity: "deep" },
  { id: "lovers_gd_020", deckId: "lovers_getting_deeper", question: "When was the last time you cried, and what did it teach you?", category: "Vulnerability", intensity: "deep" },

  //   Category: Future
  { id: "lovers_gd_021", deckId: "lovers_getting_deeper", question: "If we could move anywhere in the world together tomorrow, where would we go?", category: "Future", intensity: "mild" },
  { id: "lovers_gd_022", deckId: "lovers_getting_deeper", question: "What is one legacy you want us to leave behind as a couple?", category: "Future", intensity: "medium" },
  { id: "lovers_gd_023", deckId: "lovers_getting_deeper", question: "How do you want our life to look different five years from now?", category: "Future", intensity: "medium" },
  { id: "lovers_gd_024", deckId: "lovers_getting_deeper", question: "What’s a goal you’re scared to chase that I can support you in?", category: "Future", intensity: "medium" },
  { id: "lovers_gd_025", deckId: "lovers_getting_deeper", question: "What kind of parents/older versions of ourselves do you think we’ll be?", category: "Future", intensity: "medium" },

  //   Category: Intimacy
  { id: "lovers_gd_026", deckId: "lovers_getting_deeper", question: "What is a non-sexual way that I touch you that makes you feel loved?", category: "Intimacy", intensity: "medium" },
  { id: "lovers_gd_027", deckId: "lovers_getting_deeper", question: "How has our physical connection evolved since we first met?", category: "Intimacy", intensity: "medium" },
  { id: "lovers_gd_028", deckId: "lovers_getting_deeper", question: "What’s a fantasy you’ve been hesitant to share with me?", category: "Intimacy", intensity: "deep" },
  { id: "lovers_gd_029", deckId: "lovers_getting_deeper", question: "What does 'great sex' mean to you—is it emotional connection, physical release, or both?", category: "Intimacy", intensity: "deep" },
  { id: "lovers_gd_030", deckId: "lovers_getting_deeper", question: "When do you feel most attractive in my eyes?", category: "Intimacy", intensity: "medium" },

  //   Category: Growth & Lessons
  { id: "lovers_gd_031", deckId: "lovers_getting_deeper", question: "What is the biggest lesson your past heartbreak taught you about love?", category: "Growth", intensity: "deep" },
  { id: "lovers_gd_032", deckId: "lovers_getting_deeper", question: "In what ways have I helped you become a better person?", category: "Growth", intensity: "medium" },
  { id: "lovers_gd_033", deckId: "lovers_getting_deeper", question: "What is a habit you’ve picked up from me that you actually like?", category: "Growth", intensity: "mild" },
  { id: "lovers_gd_034", deckId: "lovers_getting_deeper", question: "What’s one thing about your communication style you’re actively trying to improve?", category: "Growth", intensity: "medium" },
  { id: "lovers_gd_035", deckId: "lovers_getting_deeper", question: "If you could go back and give your 'first-date self' one piece of advice, what would it be?", category: "Growth", intensity: "medium" },

  //   Category: Trust & Security
  { id: "lovers_gd_036", deckId: "lovers_getting_deeper", question: "What’s one thing I do that makes you feel completely safe with me?", category: "Trust", intensity: "medium" },
  { id: "lovers_gd_037", deckId: "lovers_getting_deeper", question: "Is there a boundary you’ve been afraid to set because you didn't want to hurt me?", category: "Trust", intensity: "deep" },
  { id: "lovers_gd_038", deckId: "lovers_getting_deeper", question: "What does 'loyalty' look like to you in everyday actions?", category: "Trust", intensity: "medium" },
  { id: "lovers_gd_039", deckId: "lovers_getting_deeper", question: "Have I ever broken your trust in a small way that we haven't fully talked about?", category: "Trust", intensity: "deep" },
  { id: "lovers_gd_040", deckId: "lovers_getting_deeper", question: "What is the best way for me to support you when you're feeling anxious?", category: "Trust", intensity: "medium" },

  //   Category: Fun & Play
  { id: "lovers_gd_041", deckId: "lovers_getting_deeper", question: "If we were to start a YouTube channel together, what would it be about?", category: "Fun", intensity: "mild" },
  { id: "lovers_gd_042", deckId: "lovers_getting_deeper", question: "What’s the most ridiculous thing you’ve ever imagined us doing together?", category: "Fun", intensity: "mild" },
  { id: "lovers_gd_043", deckId: "lovers_getting_deeper", question: "Which fictional couple is most like us, and why?", category: "Fun", intensity: "mild" },
  { id: "lovers_gd_044", deckId: "lovers_getting_deeper", question: "If we won the lottery tomorrow, what is the first 'useless' thing we’d buy?", category: "Fun", intensity: "mild" },
  { id: "lovers_gd_045", deckId: "lovers_getting_deeper", question: "What is a 'secret language' or inside joke we have that you love the most?", category: "Fun", intensity: "mild" },

  //   Category: Values & Beliefs
  { id: "lovers_gd_046", deckId: "lovers_getting_deeper", question: "What is one non-negotiable value you want our home to have?", category: "Values", intensity: "medium" },
  { id: "lovers_gd_047", deckId: "lovers_getting_deeper", question: "Do you believe people can truly change, or do they just evolve?", category: "Values", intensity: "deep" },
  { id: "lovers_gd_048", deckId: "lovers_getting_deeper", question: "What is a cause or charity you’d want us to support together?", category: "Values", intensity: "medium" },
  { id: "lovers_gd_049", deckId: "lovers_getting_deeper", question: "How do you define 'success' for a long-term relationship?", category: "Values", intensity: "medium" },
  { id: "lovers_gd_050", deckId: "lovers_getting_deeper", question: "What’s one spiritual or philosophical belief that guides your life?", category: "Values", intensity: "deep" },

  //   Category: Conflict & Resolution
  { id: "lovers_gd_051", deckId: "lovers_getting_deeper", question: "When we argue, what is the one thing you wish I would do differently in the moment?", category: "Conflict", intensity: "medium" },
  { id: "lovers_gd_052", deckId: "lovers_getting_deeper", question: "How can I tell the difference between you needing space and you needing comfort?", category: "Conflict", intensity: "medium" },
  { id: "lovers_gd_053", deckId: "lovers_getting_deeper", question: "What is our 'healthiest' way of making up after a fight?", category: "Conflict", intensity: "medium" },
  { id: "lovers_gd_054", deckId: "lovers_getting_deeper", question: "Is there a recurring argument we have that you think stems from something deeper?", category: "Conflict", intensity: "deep" },
  { id: "lovers_gd_055", deckId: "lovers_getting_deeper", question: "What’s the best way for me to apologize to you so you feel truly heard?", category: "Conflict", intensity: "medium" },

  //   Category: Roots & Family
  { id: "lovers_gd_056", deckId: "lovers_getting_deeper", question: "What’s a childhood memory that shaped how you view love today?", category: "Roots", intensity: "deep" },
  { id: "lovers_gd_057", deckId: "lovers_getting_deeper", question: "Which of your parents' traits do you hope to never replicate?", category: "Roots", intensity: "deep" },
  { id: "lovers_gd_058", deckId: "lovers_getting_deeper", question: "What was your first impression of my family or closest friends?", category: "Roots", intensity: "medium" },
  { id: "lovers_gd_059", deckId: "lovers_getting_deeper", question: "What tradition from your upbringing do you want to bring into our relationship?", category: "Roots", intensity: "medium" },
  { id: "lovers_gd_060", deckId: "lovers_getting_deeper", question: "If you could change one thing about how you were raised, what would it be?", category: "Roots", intensity: "deep" },

  //   Category: Appreciation
  { id: "lovers_gd_061", deckId: "lovers_getting_deeper", question: "What’s a strength of mine that you feel complements one of your weaknesses?", category: "Appreciation", intensity: "medium" },
  { id: "lovers_gd_062", deckId: "lovers_getting_deeper", question: "What is something I’ve done recently that made you feel incredibly proud of me?", category: "Appreciation", intensity: "mild" },
  { id: "lovers_gd_063", deckId: "lovers_getting_deeper", question: "If you had to brag about me to a stranger, what would you say?", category: "Appreciation", intensity: "mild" },
  { id: "lovers_gd_064", deckId: "lovers_getting_deeper", question: "What is a 'small win' we’ve had as a couple lately that we should celebrate?", category: "Appreciation", intensity: "mild" },
  { id: "lovers_gd_065", deckId: "lovers_getting_deeper", question: "How do I make your life easier on a daily basis?", category: "Appreciation", intensity: "medium" },

  //   Category: Inner Self
  { id: "lovers_gd_066", deckId: "lovers_getting_deeper", question: "What is a dream you’ve let go of that you still think about sometimes?", category: "Inner Self", intensity: "deep" },
  { id: "lovers_gd_067", deckId: "lovers_getting_deeper", question: "How do you want to be remembered by the people who love you?", category: "Inner Self", intensity: "medium" },
  { id: "lovers_gd_068", deckId: "lovers_getting_deeper", question: "What does your 'ideal' day of solo time look like?", category: "Inner Self", intensity: "mild" },
  { id: "lovers_gd_069", deckId: "lovers_getting_deeper", question: "What’s a part of your personality that you think I haven’t fully seen yet?", category: "Inner Self", intensity: "deep" },
  { id: "lovers_gd_070", deckId: "lovers_getting_deeper", question: "If you could change one thing about yourself today, what would it be?", category: "Inner Self", intensity: "medium" },


  //   Category: Home & Sanctuary
  { id: "future_001", deckId: "lovers_ideal_world", question: "If we could design our dream home from scratch, what’s the one 'must-have' room?", category: "Home", intensity: "mild" },
  { id: "future_002", deckId: "lovers_ideal_world", question: "Would you rather live in a bustling city penthouse or a secluded cabin in the woods?", category: "Home", intensity: "mild" },
  { id: "future_003", deckId: "lovers_ideal_world", question: "What’s a small domestic habit you hope we keep forever as we age?", category: "Home", intensity: "medium" },
  { id: "future_004", deckId: "lovers_ideal_world", question: "How do you want our future home to feel to guests when they walk in?", category: "Home", intensity: "medium" },
  { id: "future_005", deckId: "lovers_ideal_world", question: "If we had to move to a different country for a year, where would you want us to land?", category: "Home", intensity: "medium" },

  //   Category: Career & Ambition
  { id: "future_006", deckId: "lovers_ideal_world", question: "If money were no object, what would your 'dream career' look like?", category: "Career", intensity: "medium" },
  { id: "future_007", deckId: "lovers_ideal_world", question: "How can I best support your professional goals in the next 3 years?", category: "Career", intensity: "medium" },
  { id: "future_008", deckId: "lovers_ideal_world", question: "Do you ever see us starting a business or project together?", category: "Career", intensity: "medium" },
  { id: "future_009", deckId: "lovers_ideal_world", question: "When you retire, what do you want to be known for in your field?", category: "Career", intensity: "deep" },
  { id: "future_010", deckId: "lovers_ideal_world", question: "How will we balance our individual ambitions so neither of us feels left behind?", category: "Career", intensity: "deep" },

  //   Category: Travel & Exploration
  { id: "future_011", deckId: "lovers_ideal_world", question: "What is the first 'big' trip you want us to save up for?", category: "Travel", intensity: "mild" },
  { id: "future_012", deckId: "lovers_ideal_world", question: "Are we the type of couple to go on a luxury cruise or a rugged backpacking trip?", category: "Travel", intensity: "mild" },
  { id: "future_013", deckId: "lovers_ideal_world", question: "If we could take a 6-month sabbatical, how would we spend it?", category: "Travel", intensity: "medium" },
  { id: "future_014", deckId: "lovers_ideal_world", question: "What’s a hidden gem in the world you’re dying to show me?", category: "Travel", intensity: "mild" },
  { id: "future_015", deckId: "lovers_ideal_world", question: "What is your ultimate 'bucket list' activity for us to do before we're 50?", category: "Travel", intensity: "medium" },

  //   Category: Family & Legacy
  { id: "future_016", deckId: "lovers_ideal_world", question: "What family traditions do you want to create that are uniquely ours?", category: "Legacy", intensity: "medium" },
  { id: "future_017", deckId: "lovers_ideal_world", question: "How do you want our future children (or pets!) to describe our relationship?", category: "Legacy", intensity: "deep" },
  { id: "future_018", deckId: "lovers_ideal_world", question: "What is the most important value you want to pass down to the next generation?", category: "Legacy", intensity: "deep" },
  { id: "future_019", deckId: "lovers_ideal_world", question: "How do you want us to handle aging parents or family responsibilities?", category: "Legacy", intensity: "deep" },
  { id: "future_020", deckId: "lovers_ideal_world", question: "What kind of grandparents do you think we will be one day?", category: "Legacy", intensity: "mild" },

  //   Category: Personal Growth
  { id: "future_021", deckId: "lovers_ideal_world", question: "What’s a skill you want us to learn together in the next year?", category: "Growth", intensity: "mild" },
  { id: "future_022", deckId: "lovers_ideal_world", question: "How do you hope your personality evolves as you get older?", category: "Growth", intensity: "medium" },
  { id: "future_023", deckId: "lovers_ideal_world", question: "What is one fear you hope to have conquered five years from now?", category: "Growth", intensity: "deep" },
  { id: "future_024", deckId: "lovers_ideal_world", question: "In what way do you want me to challenge you to grow?", category: "Growth", intensity: "medium" },
  { id: "future_025", deckId: "lovers_ideal_world", question: "What does 'self-actualization' look like for you in the future?", category: "Growth", intensity: "deep" },

  //   Category: Lifestyle & Wellness
  { id: "future_026", deckId: "lovers_ideal_world", question: "What does a perfect Saturday morning look like for us 10 years from now?", category: "Lifestyle", intensity: "mild" },
  { id: "future_027", deckId: "lovers_ideal_world", question: "How will we make sure we stay active and healthy together as we age?", category: "Lifestyle", intensity: "medium" },
  { id: "future_028", deckId: "lovers_ideal_world", question: "If we lived on a farm, what’s the first animal we’d get?", category: "Lifestyle", intensity: "mild" },
  { id: "future_029", deckId: "lovers_ideal_world", question: "How much 'alone time' do you envision needing in our ideal daily routine?", category: "Lifestyle", intensity: "medium" },
  { id: "future_030", deckId: "lovers_ideal_world", question: "What kind of 'community' or friend group do you want us to build around us?", category: "Lifestyle", intensity: "medium" },

  //   Category: Financial Dreams
  { id: "future_031", deckId: "lovers_ideal_world", question: "What’s a 'big purchase' you’re excited for us to make one day?", category: "Finance", intensity: "mild" },
  { id: "future_032", deckId: "lovers_ideal_world", question: "How do you feel about joint bank accounts versus keeping things separate?", category: "Finance", intensity: "medium" },
  { id: "future_033", deckId: "lovers_ideal_world", question: "What does 'financial freedom' mean to you?", category: "Finance", intensity: "medium" },
  { id: "future_034", deckId: "lovers_ideal_world", question: "If we had an extra $10k to spend only on 'fun,' what would we do?", category: "Finance", intensity: "mild" },
  { id: "future_035", deckId: "lovers_ideal_world", question: "What’s one thing you never want us to have to worry about money-wise?", category: "Finance", intensity: "deep" },

  //   Category: Relationship Evolution
  { id: "future_036", deckId: "lovers_ideal_world", question: "How will we keep the 'spark' alive when life gets repetitive or stressful?", category: "Relationship", intensity: "deep" },
  { id: "future_037", deckId: "lovers_ideal_world", question: "What’s one thing about our relationship now that you hope never changes?", category: "Relationship", intensity: "medium" },
  { id: "future_038", deckId: "lovers_ideal_world", question: "How do you want us to handle big life transitions (moving, new jobs, etc)?", category: "Relationship", intensity: "medium" },
  { id: "future_039", deckId: "lovers_ideal_world", question: "When we are 80, what do you think we will argue about most?", category: "Relationship", intensity: "mild" },
  { id: "future_040", deckId: "lovers_ideal_world", question: "What is your vision for our 're-marriage' or vow renewal one day?", category: "Relationship", intensity: "medium" },

  //   Category: Adventures & Risks
  { id: "future_041", deckId: "lovers_ideal_world", question: "What is a 'crazy' risk you’ve always wanted to take but haven't yet?", category: "Adventure", intensity: "medium" },
  { id: "future_042", deckId: "lovers_ideal_world", question: "If we could quit our jobs and travel for a year, would you do it?", category: "Adventure", intensity: "medium" },
  { id: "future_043", deckId: "lovers_ideal_world", question: "What’s one adrenaline-pumping activity you want to try with me?", category: "Adventure", intensity: "mild" },
  { id: "future_044", deckId: "lovers_ideal_world", question: "Where is the 'wildest' place you’d be willing to live for a short time?", category: "Adventure", intensity: "medium" },
  { id: "future_045", deckId: "lovers_ideal_world", question: "What’s an adventure we can start planning today?", category: "Adventure", intensity: "mild" },

  //   Category: Retirement & Golden Years
  { id: "future_046", deckId: "lovers_ideal_world", question: "What does your 'ideal' retirement look like?", category: "Retirement", intensity: "medium" },
  { id: "future_047", deckId: "lovers_ideal_world", question: "Where in the world do you want to retire?", category: "Retirement", intensity: "medium" },
  { id: "future_048", deckId: "lovers_ideal_world", question: "What hobbies do you see us picking up when we have all the time in the world?", category: "Retirement", intensity: "mild" },
  { id: "future_049", deckId: "lovers_ideal_world", question: "How do you want to spend our wedding anniversaries when we’re in our 70s?", category: "Retirement", intensity: "medium" },
  { id: "future_050", deckId: "lovers_ideal_world", question: "What legacy do you want to leave for our family?", category: "Retirement", intensity: "deep" },

  //   Category: What If? (Wildcards)
  { id: "future_051", deckId: "lovers_ideal_world", question: "If we were the last two people on Earth, how would we spend our days?", category: "What If", intensity: "mild" },
  { id: "future_052", deckId: "lovers_ideal_world", question: "If you could see one day of our future together in a crystal ball, which day would you choose?", category: "What If", intensity: "medium" },
  { id: "future_053", deckId: "lovers_ideal_world", question: "If we suddenly became famous, how would it change our relationship?", category: "What If", intensity: "medium" },
  { id: "future_054", deckId: "lovers_ideal_world", question: "What would we do if we won a one-way ticket to a Mars colony?", category: "What If", intensity: "mild" },
  { id: "future_055", deckId: "lovers_ideal_world", question: "If we could relive one year of our future life together over and over, which one would it be?", category: "What If", intensity: "deep" },

  //   Category: Intimate Future
  { id: "future_056", deckId: "lovers_ideal_world", question: "How do you want our physical intimacy to change or grow over the decades?", category: "Intimacy", intensity: "deep" },
  { id: "future_057", deckId: "lovers_ideal_world", question: "What is a romantic tradition you want to start next year and keep forever?", category: "Intimacy", intensity: "medium" },
  { id: "future_058", deckId: "lovers_ideal_world", question: "How will we ensure we never stop 'dating' each other?", category: "Intimacy", intensity: "medium" },
  { id: "future_059", deckId: "lovers_ideal_world", question: "What’s a new way you want to be loved in the future?", category: "Intimacy", intensity: "deep" },
  { id: "future_060", deckId: "lovers_ideal_world", question: "What does 'forever' actually feel like to you when you think about us?", category: "Intimacy", intensity: "deep" },

  //   Category: First Impressions & Chemistry
  { id: "spicy_001", deckId: "lovers_spicy_talk", question: "What was the very first thing about me that turned you on?", category: "Chemistry", intensity: "medium" },
  { id: "spicy_002", deckId: "lovers_spicy_talk", question: "What’s a specific look I give you that tells you I’m in the mood?", category: "Chemistry", intensity: "mild" },
  { id: "spicy_003", deckId: "lovers_spicy_talk", question: "How would you describe our 'sexual chemistry' in just three words?", category: "Chemistry", intensity: "medium" },
  { id: "spicy_004", deckId: "lovers_spicy_talk", question: "What is your favorite memory of our first time together?", category: "Chemistry", intensity: "medium" },
  { id: "spicy_005", deckId: "lovers_spicy_talk", question: "Which of my outfits do you find the most irresistible?", category: "Chemistry", intensity: "mild" },

  //   Category: Senses & Touch
  { id: "spicy_006", deckId: "lovers_spicy_talk", question: "Where is your most sensitive spot that I don’t touch often enough?", category: "Senses", intensity: "deep" },
  { id: "spicy_007", deckId: "lovers_spicy_talk", question: "What’s a scent or sound that instantly makes you think of being intimate with me?", category: "Senses", intensity: "medium" },
  { id: "spicy_008", deckId: "lovers_spicy_talk", question: "Do you prefer a slow, sensual touch or something a bit more intense?", category: "Senses", intensity: "medium" },
  { id: "spicy_009", deckId: "lovers_spicy_talk", question: "If I were to give you a massage, where should I start to make you melt?", category: "Senses", intensity: "medium" },
  { id: "spicy_010", deckId: "lovers_spicy_talk", question: "How does my voice change when we’re alone that you find attractive?", category: "Senses", intensity: "mild" },

  //   Category: Fantasies & What-Ifs
  { id: "spicy_011", deckId: "lovers_spicy_talk", question: "If we could act out one scene from a movie, which one would it be?", category: "Fantasies", intensity: "deep" },
  { id: "spicy_012", deckId: "lovers_spicy_talk", question: "What’s a fantasy you’ve had about me that you haven’t told me yet?", category: "Fantasies", intensity: "deep" },
  { id: "spicy_013", deckId: "lovers_spicy_talk", question: "Is there a location outside the bedroom where you’ve always wanted to try 'it'?", category: "Fantasies", intensity: "medium" },
  { id: "spicy_014", deckId: "lovers_spicy_talk", question: "If we were to roleplay, who would you want us to be?", category: "Fantasies", intensity: "deep" },
  { id: "spicy_015", deckId: "lovers_spicy_talk", question: "What’s a 'wild' idea you’ve seen or read about that you’re curious to try with me?", category: "Fantasies", intensity: "deep" },

  //   Category: Foreplay & Anticipation
  { id: "spicy_016", deckId: "lovers_spicy_talk", question: "What’s the best way for me to tease you throughout the day?", category: "Anticipation", intensity: "medium" },
  { id: "spicy_017", deckId: "lovers_spicy_talk", question: "Do you prefer a suggestive text message or a physical whisper in your ear?", category: "Anticipation", intensity: "mild" },
  { id: "spicy_018", deckId: "lovers_spicy_talk", question: "How long should the 'perfect' build-up last before we actually get to the bedroom?", category: "Anticipation", intensity: "medium" },
  { id: "spicy_019", deckId: "lovers_spicy_talk", question: "What’s a non-sexual activity we do that often leads to you feeling spicy?", category: "Anticipation", intensity: "mild" },
  { id: "spicy_020", deckId: "lovers_spicy_talk", question: "What is one thing I could do tonight to make you crave me instantly?", category: "Anticipation", intensity: "deep" },

  //   Category: Preferences & Positions
  { id: "spicy_021", deckId: "lovers_spicy_talk", question: "What is your absolute favorite position, and why does it work for you?", category: "Preferences", intensity: "medium" },
  { id: "spicy_022", deckId: "lovers_spicy_talk", question: "Is there a specific way you like to be kissed that I should do more of?", category: "Preferences", intensity: "medium" },
  { id: "spicy_023", deckId: "lovers_spicy_talk", question: "Do you prefer it when I take the lead, or when you’re in control?", category: "Preferences", intensity: "medium" },
  { id: "spicy_024", deckId: "lovers_spicy_talk", question: "What’s something 'standard' we do that you never get tired of?", category: "Preferences", intensity: "mild" },
  { id: "spicy_025", deckId: "lovers_spicy_talk", question: "Is there anything we used to do in the beginning that you’d like to bring back?", category: "Preferences", intensity: "medium" },

  //   Category: Atmosphere & Environment
  { id: "spicy_026", deckId: "lovers_spicy_talk", question: "Candlelight and silence, or a playlist and the lights on?", category: "Environment", intensity: "mild" },
  { id: "spicy_027", deckId: "lovers_spicy_talk", question: "What’s your opinion on mirrors in the bedroom?", category: "Environment", intensity: "medium" },
  { id: "spicy_028", deckId: "lovers_spicy_talk", question: "If we were to stay in a themed hotel room, what theme would you pick?", category: "Environment", intensity: "medium" },
  { id: "spicy_029", deckId: "lovers_spicy_talk", question: "How do you feel about being watched by me while you take care of yourself?", category: "Environment", intensity: "deep" },
  { id: "spicy_030", deckId: "lovers_spicy_talk", question: "What is the perfect 'aftercare' for you after a long session?", category: "Environment", intensity: "medium" },

  //   Category: Communication & Feedback
  { id: "spicy_031", deckId: "lovers_spicy_talk", question: "What is the hottest thing I’ve ever said to you in the heat of the moment?", category: "Communication", intensity: "deep" },
  { id: "spicy_032", deckId: "lovers_spicy_talk", question: "How do you feel about 'dirty talk'? Is it a turn-on or distracting?", category: "Communication", intensity: "medium" },
  { id: "spicy_033", deckId: "lovers_spicy_talk", question: "What’s a way I can give you feedback during sex that makes you feel empowered?", category: "Communication", intensity: "deep" },
  { id: "spicy_034", deckId: "lovers_spicy_talk", question: "Is there a word or phrase that is an instant 'off' for you?", category: "Communication", intensity: "medium" },
  { id: "spicy_035", deckId: "lovers_spicy_talk", question: "How do you feel when I tell you exactly what I want you to do to me?", category: "Communication", intensity: "deep" },

  //   Category: Boundaries & Safety
  { id: "spicy_036", deckId: "lovers_spicy_talk", question: "Is there anything you’ve wanted to try but were too nervous to bring up?", category: "Boundaries", intensity: "deep" },
  { id: "spicy_037", deckId: "lovers_spicy_talk", question: "What is a 'hard limit' for you that we should never cross?", category: "Boundaries", intensity: "deep" },
  { id: "lovers_spicy_038", deckId: "lovers_spicy_talk", question: "How can I best check in with you when we’re trying something new?", category: "Boundaries", intensity: "medium" },
  { id: "spicy_039", deckId: "lovers_spicy_talk", question: "What makes you feel most safe and respected while we’re being intimate?", category: "Boundaries", intensity: "deep" },
  { id: "spicy_040", deckId: "lovers_spicy_talk", question: "How do you feel about using 'safe words' even for light activities?", category: "Boundaries", intensity: "medium" },

  //   Category: Adventurousness
  { id: "spicy_041", deckId: "lovers_spicy_talk", question: "What is your opinion on incorporating toys into our routine?", category: "Adventure", intensity: "medium" },
  { id: "spicy_042", deckId: "lovers_spicy_talk", question: "Would you ever want to record us being intimate, just for our eyes only?", category: "Adventure", intensity: "deep" },
  { id: "spicy_043", deckId: "lovers_spicy_talk", question: "How do you feel about 'light' bondage (like using a necktie or scarf)?", category: "Adventure", intensity: "deep" },
  { id: "spicy_044", deckId: "lovers_spicy_talk", question: "What’s the most 'risky' thing you’ve ever done in your dating life?", category: "Adventure", intensity: "medium" },
  { id: "spicy_045", deckId: "lovers_spicy_talk", question: "If we went to an adult store together, what’s the first section you’d walk to?", category: "Adventure", intensity: "medium" },

  //   Category: The 'Morning After' & Daily Spark
  { id: "spicy_046", deckId: "lovers_spicy_talk", question: "Do you like morning sex, or are you more of a night owl?", category: "Timing", intensity: "mild" },
  { id: "spicy_047", deckId: "lovers_spicy_talk", question: "What’s the hottest thing I’ve done to you in the last week?", category: "Timing", intensity: "medium" },
  { id: "spicy_048", deckId: "lovers_spicy_talk", question: "How do you feel about 'quickies' when we’re in a rush?", category: "Timing", intensity: "mild" },
  { id: "spicy_049", deckId: "lovers_spicy_talk", question: "What’s one thing we can do to make sure our sex life stays a priority?", category: "Timing", intensity: "medium" },
  { id: "spicy_050", deckId: "lovers_spicy_talk", question: "Do you ever have 'spicy' dreams about me? What happens in them?", category: "Timing", intensity: "deep" },

  //   Category: Emotional Connection
  { id: "spicy_051", deckId: "lovers_spicy_talk", question: "Does being intimate with me make you feel more emotionally connected, or vice-versa?", category: "Connection", intensity: "deep" },
  { id: "spicy_052", deckId: "lovers_spicy_talk", question: "What is the most 'vulnerable' you’ve ever felt while we were together?", category: "Connection", intensity: "deep" },
  { id: "spicy_053", deckId: "lovers_spicy_talk", question: "What’s one way I can show you I love you without using any words during sex?", category: "Connection", intensity: "medium" },
  { id: "spicy_054", deckId: "lovers_spicy_talk", question: "How has your confidence in the bedroom changed since being with me?", category: "Connection", intensity: "medium" },
  { id: "spicy_055", deckId: "lovers_spicy_talk", question: "What is the difference between 'f***ing' and 'making love' to you?", category: "Connection", intensity: "deep" },

  //   Category: Wildcards & Fun
  { id: "spicy_056", deckId: "lovers_spicy_talk", question: "If we had to describe our sex life as a food, what food would it be?", category: "Fun", intensity: "mild" },
  { id: "spicy_057", deckId: "lovers_spicy_talk", question: "What’s a 'secret' turn-on that you’re embarrassed to admit?", category: "Fun", intensity: "deep" },
  { id: "spicy_058", deckId: "lovers_spicy_talk", question: "If you could freeze time for one hour of intimacy, what would we spend it doing?", category: "Fun", intensity: "medium" },
  { id: "spicy_059", deckId: "lovers_spicy_talk", question: "What’s the most 'adventurous' place you’ve ever fantasized about me in?", category: "Fun", intensity: "medium" },
  { id: "spicy_060", deckId: "lovers_spicy_talk", question: "On a scale of 1-10, how adventurous do you think we are? How do we get to a 10?", category: "Fun", intensity: "medium" },

  // Words of Affirmation
  { id: "love_001", deckId: "lovers_love_languages", question: "What’s a compliment I give you that never gets old?", category: "Words", intensity: "mild" },
  { id: "love_002", deckId: "lovers_love_languages", question: "Do you prefer being told 'I love you' or being told specifically why you are appreciated?", category: "Words", intensity: "medium" },
  { id: "love_003", deckId: "lovers_love_languages", question: "What is a 'love note' or text I sent that you still think about?", category: "Words", intensity: "mild" },
  { id: "love_004", deckId: "lovers_love_languages", question: "How do you feel when I brag about you in front of other people?", category: "Words", intensity: "medium" },
  { id: "love_005", deckId: "lovers_love_languages", question: "Which 'pet name' of ours is your absolute favorite?", category: "Words", intensity: "mild" },
  { id: "love_006", deckId: "lovers_love_languages", question: "What is one thing about your character you wish I noticed more often?", category: "Words", intensity: "deep" },
  { id: "love_007", deckId: "lovers_love_languages", question: "Does hearing 'I’m proud of you' hit differently than 'I love you'?", category: "Words", intensity: "medium" },
  { id: "love_008", deckId: "lovers_love_languages", question: "How do you feel when I leave you little physical notes around the house?", category: "Words", intensity: "mild" },
  { id: "love_009", deckId: "lovers_love_languages", question: "What’s a word or phrase that instantly makes you feel safe when I say it?", category: "Words", intensity: "deep" },
  { id: "love_010", deckId: "lovers_love_languages", question: "Do you prefer encouragement when you’re struggling or when you’ve succeeded?", category: "Words", intensity: "medium" },

  // Acts of Service
  { id: "love_011", deckId: "lovers_love_languages", question: "What is one chore I do that makes you feel most cared for?", category: "Service", intensity: "medium" },
  { id: "love_012", deckId: "lovers_love_languages", question: "If I could take one thing off your 'to-do' list forever, what would it be?", category: "Service", intensity: "medium" },
  { id: "love_013", deckId: "lovers_love_languages", question: "How can I better support your daily routine without you having to ask?", category: "Service", intensity: "deep" },
  { id: "love_014", deckId: "lovers_love_languages", question: "Does it mean more when I do something you hate doing, or something you're too busy to do?", category: "Service", intensity: "medium" },
  { id: "love_015", deckId: "lovers_love_languages", question: "What is the most 'heroic' small thing I’ve done for you lately?", category: "Service", intensity: "mild" },
  { id: "love_016", deckId: "lovers_love_languages", question: "Do you prefer it when I take the lead on planning or when I ask how I can help?", category: "Service", intensity: "medium" },
  { id: "love_017", deckId: "lovers_love_languages", question: "What’s a way I can 'service' your mental health when you're stressed?", category: "Service", intensity: "deep" },
  { id: "love_018", deckId: "lovers_love_languages", question: "How do you feel when I cook a meal for you after a long day?", category: "Service", intensity: "mild" },
  { id: "love_019", deckId: "lovers_love_languages", question: "What act of service do I do that you think I don't realize you appreciate?", category: "Service", intensity: "medium" },
  { id: "love_020", deckId: "lovers_love_languages", question: "If we had a personal assistant, which of your tasks would you give them first?", category: "Service", intensity: "mild" },

  // Receiving Gifts
  { id: "love_021", deckId: "lovers_love_languages", question: "What is the most thoughtful 'just because' gift I’ve ever given you?", category: "Gifts", intensity: "mild" },
  { id: "love_022", deckId: "lovers_love_languages", question: "Do you value the price tag or the sentiment behind a gift more?", category: "Gifts", intensity: "medium" },
  { id: "love_023", deckId: "lovers_love_languages", question: "What is something small I could bring home for you that would make your day?", category: "Gifts", intensity: "mild" },
  { id: "love_024", deckId: "lovers_love_languages", question: "Are you a 'surprise gift' person or do you like choosing things together?", category: "Gifts", intensity: "mild" },
  { id: "love_025", deckId: "lovers_love_languages", question: "What’s a gift you’ve received from me that you’ll never get rid of?", category: "Gifts", intensity: "medium" },
  { id: "love_026", deckId: "lovers_love_languages", question: "Do you prefer experience gifts (tickets) or physical objects?", category: "Gifts", intensity: "mild" },
  { id: "love_027", deckId: "lovers_love_languages", question: "How do you feel about 're-gifting' or second-hand gifts if they are meaningful?", category: "Gifts", intensity: "medium" },
  { id: "love_028", deckId: "lovers_love_languages", question: "What was the first gift I ever gave you, and what did you think of it?", category: "Gifts", intensity: "mild" },
  { id: "love_029", deckId: "lovers_love_languages", question: "If I were to buy you a 'treat' right now, what would it be?", category: "Gifts", intensity: "mild" },
  { id: "love_030", deckId: "lovers_love_languages", question: "How do you feel when I remember a small item you mentioned wanting months ago?", category: "Gifts", intensity: "medium" },

  // Quality Time
  { id: "love_031", deckId: "lovers_love_languages", question: "What does 'uninterrupted time' look like to you?", category: "Time", intensity: "medium" },
  { id: "love_032", deckId: "lovers_love_languages", question: "If we had 24 hours with no phones, what would we do?", category: "Time", intensity: "medium" },
  { id: "love_033", deckId: "lovers_love_languages", question: "When do you feel I am most 'present' with you?", category: "Time", intensity: "deep" },
  { id: "love_034", deckId: "lovers_love_languages", question: "Do you prefer active dates or 'parallel play' (reading in the same room)?", category: "Time", intensity: "mild" },
  { id: "love_035", deckId: "lovers_love_languages", question: "What is a hobby you wish we spent more time doing together?", category: "Time", intensity: "medium" },
  { id: "love_036", deckId: "lovers_love_languages", question: "Is there a specific time of day when you feel most connected to me?", category: "Time", intensity: "mild" },
  { id: "love_037", deckId: "lovers_love_languages", question: "What’s your favorite 'stay-at-home' date we’ve ever had?", category: "Time", intensity: "mild" },
  { id: "love_038", deckId: "lovers_love_languages", question: "How do you feel when I cancel other plans to spend time with you?", category: "Time", intensity: "medium" },
  { id: "love_039", deckId: "lovers_love_languages", question: "If we could travel anywhere just to talk, where would we go?", category: "Time", intensity: "medium" },
  { id: "love_040", deckId: "lovers_love_languages", question: "What’s one thing we do together that makes time feel like it's standing still?", category: "Time", intensity: "deep" },

  // Physical Touch
  { id: "love_041", deckId: "lovers_love_languages", question: "What is your favorite 'non-sexual' way for me to touch you?", category: "Touch", intensity: "medium" },
  { id: "love_042", deckId: "lovers_love_languages", question: "Do you prefer long hugs or frequent small touches throughout the day?", category: "Touch", intensity: "mild" },
  { id: "love_043", deckId: "lovers_love_languages", question: "How does physical touch change your mood when you're feeling down?", category: "Touch", intensity: "deep" },
  { id: "love_044", deckId: "lovers_love_languages", question: "How important is public holding of hands to you?", category: "Touch", intensity: "mild" },
  { id: "love_045", deckId: "lovers_love_languages", question: "What is the best way for me to initiate a cuddle session?", category: "Touch", intensity: "mild" },
  { id: "love_046", deckId: "lovers_love_languages", question: "Does it bother you if we don't touch for a whole day?", category: "Touch", intensity: "medium" },
  { id: "love_047", deckId: "lovers_love_languages", question: "What’s your favorite place to be kissed?", category: "Touch", intensity: "medium" },
  { id: "love_048", deckId: "lovers_love_languages", question: "How do you feel when I play with your hair or rub your shoulders?", category: "Touch", intensity: "mild" },
  { id: "love_049", deckId: "lovers_love_languages", question: "Is skin-to-skin contact important for you to feel loved?", category: "Touch", intensity: "deep" },
  { id: "love_050", deckId: "lovers_love_languages", question: "Which physical habit of mine do you find most comforting?", category: "Touch", intensity: "medium" },

  // Observation & Growth
  { id: "love_051", deckId: "lovers_love_languages", question: "What do you think is my primary love language?", category: "Observation", intensity: "medium" },
  { id: "love_052", deckId: "lovers_love_languages", question: "Have your love languages changed since we first met?", category: "Observation", intensity: "deep" },
  { id: "love_053", deckId: "lovers_love_languages", question: "When do you feel I am 'speaking your language' best?", category: "Observation", intensity: "medium" },
  { id: "love_054", deckId: "lovers_love_languages", question: "Which love language is the hardest for you to 'speak' to me?", category: "Observation", intensity: "deep" },
  { id: "love_055", deckId: "lovers_love_languages", question: "If you could add a 'sixth' love language, what would it be?", category: "Observation", intensity: "medium" },
  { id: "love_056", deckId: "lovers_love_languages", question: "How do you show yourself love?", category: "Observation", intensity: "medium" },
  { id: "love_057", deckId: "lovers_love_languages", question: "What is one thing I do that you think is a love language, but I don't?", category: "Observation", intensity: "medium" },
  { id: "love_058", deckId: "lovers_love_languages", question: "How can I tell when your 'love tank' is running low?", category: "Observation", intensity: "deep" },
  { id: "love_059", deckId: "lovers_love_languages", question: "What is your 'language' for apologizing?", category: "Observation", intensity: "medium" },
  { id: "love_060", deckId: "lovers_love_languages", question: "On a scale of 1-10, how well am I loving you right now?", category: "Observation", intensity: "deep" },

  // Argument Styles
  { id: "con_001", deckId: "lovers_conflict_resolution", question: "When we disagree, do you feel like you need to 'win,' or do you just want to be heard?", category: "Style", intensity: "medium" },
  { id: "con_002", deckId: "lovers_conflict_resolution", question: "What is your 'warning sign' that you are getting too overwhelmed to talk?", category: "Style", intensity: "medium" },
  { id: "con_003", deckId: "lovers_conflict_resolution", question: "Are you a 'stewer' (think for hours) or an 'exploder' (need to say it now)?", category: "Style", intensity: "medium" },
  { id: "con_004", deckId: "lovers_conflict_resolution", question: "How can I tell the difference between 'angry silence' and 'needing space silence'?", category: "Style", intensity: "deep" },
  { id: "con_005", deckId: "lovers_conflict_resolution", question: "What is one thing I do during an argument that makes you feel unsafe?", category: "Style", intensity: "deep" },
  { id: "con_006", deckId: "lovers_conflict_resolution", question: "Do you tend to bring up past issues when we are fighting about something new?", category: "Style", intensity: "medium" },
  { id: "con_007", deckId: "lovers_conflict_resolution", question: "What is your 'internal monologue' when I’m upset with you?", category: "Style", intensity: "deep" },
  { id: "con_008", deckId: "lovers_conflict_resolution", question: "Do you prefer to handle conflict via text or in person?", category: "Style", intensity: "medium" },
  { id: "con_009", deckId: "lovers_conflict_resolution", question: "What’s the one word I use that instantly makes you defensive?", category: "Style", intensity: "medium" },
  { id: "con_010", deckId: "lovers_conflict_resolution", question: "How did your parents handle conflict, and how does that affect us?", category: "Style", intensity: "deep" },

  // Apologies & Repair
  { id: "con_011", deckId: "lovers_conflict_resolution", question: "What does a 'perfect apology' look like to you?", category: "Repair", intensity: "medium" },
  { id: "con_012", deckId: "lovers_conflict_resolution", question: "How long does it usually take you to 'let go' of a grudge after making up?", category: "Repair", intensity: "deep" },
  { id: "con_013", deckId: "lovers_conflict_resolution", question: "What’s the fastest way to make you smile after a disagreement?", category: "Repair", intensity: "mild" },
  { id: "con_014", deckId: "lovers_conflict_resolution", question: "Do you believe in 'never going to bed angry'?", category: "Repair", intensity: "medium" },
  { id: "con_015", deckId: "lovers_conflict_resolution", question: "What is a 'repair attempt' (joke/touch) I can use to lower the tension?", category: "Repair", intensity: "medium" },
  { id: "con_016", deckId: "lovers_conflict_resolution", question: "What is the best way for us to 'reset' after a long day of bickering?", category: "Repair", intensity: "medium" },
  { id: "con_017", deckId: "lovers_conflict_resolution", question: "When I apologize, do you actually believe me right away?", category: "Repair", intensity: "deep" },
  { id: "con_018", deckId: "lovers_conflict_resolution", question: "What’s a non-verbal way I can tell you 'I’m still on your team' during a fight?", category: "Repair", intensity: "medium" },
  { id: "con_019", deckId: "lovers_conflict_resolution", question: "Do you need a hug immediately after a fight, or do you need more time?", category: "Repair", intensity: "mild" },
  { id: "con_020", deckId: "lovers_conflict_resolution", question: "How can we make 'making up' feel more like a connection and less like a chore?", category: "Repair", intensity: "medium" },

  // Triggers & Sensitive Spots
  { id: "con_021", deckId: "lovers_conflict_resolution", question: "What is one 'tone of voice' I use that instantly triggers you?", category: "Triggers", intensity: "medium" },
  { id: "con_022", deckId: "lovers_conflict_resolution", question: "Which recurring argument of ours stems from your childhood?", category: "Triggers", intensity: "deep" },
  { id: "con_023", deckId: "lovers_conflict_resolution", question: "What is one thing you are most sensitive about regarding your character?", category: "Triggers", intensity: "deep" },
  { id: "con_024", deckId: "lovers_conflict_resolution", question: "How do you feel when I bring up your family during an argument?", category: "Triggers", intensity: "deep" },
  { id: "con_025", deckId: "lovers_conflict_resolution", question: "What is a 'hidden need' you have that often comes out as anger?", category: "Triggers", intensity: "deep" },
  { id: "con_026", deckId: "lovers_conflict_resolution", question: "What is your biggest insecurity about our relationship's longevity?", category: "Triggers", intensity: "deep" },
  { id: "con_027", deckId: "lovers_conflict_resolution", question: "Does it trigger you more when I get loud or when I get quiet?", category: "Triggers", intensity: "medium" },
  { id: "con_028", deckId: "lovers_conflict_resolution", question: "What is a 'boundary' I’ve crossed recently that you didn't mention?", category: "Triggers", intensity: "deep" },
  { id: "con_029", deckId: "lovers_conflict_resolution", question: "Do you feel like you can be 100% honest about your frustrations with me?", category: "Triggers", intensity: "medium" },
  { id: "con_030", deckId: "lovers_conflict_resolution", question: "What’s one thing you do that you *know* triggers me?", category: "Triggers", intensity: "medium" },

  // Listening & Understanding
  { id: "con_031", deckId: "lovers_conflict_resolution", question: "What’s one thing you wish I understood about your perspective during fights?", category: "Listening", intensity: "deep" },
  { id: "con_032", deckId: "lovers_conflict_resolution", question: "Do you feel like I actually listen, or am I just waiting for my turn to speak?", category: "Listening", intensity: "deep" },
  { id: "con_033", deckId: "lovers_conflict_resolution", question: "How can I show you I’m listening without interrupting?", category: "Listening", intensity: "medium" },
  { id: "con_034", deckId: "lovers_conflict_resolution", question: "What is the most helpful thing I can say when you are venting?", category: "Listening", intensity: "medium" },
  { id: "con_035", deckId: "lovers_conflict_resolution", question: "Do you feel judged by me when you share your mistakes?", category: "Listening", intensity: "deep" },
  { id: "con_036", deckId: "lovers_conflict_resolution", question: "Can you summarize my 'side' of our last argument? Do you get it?", category: "Listening", intensity: "medium" },
  { id: "con_037", deckId: "lovers_conflict_resolution", question: "How do you feel when I ask clarifying questions instead of getting defensive?", category: "Listening", intensity: "medium" },
  { id: "con_038", deckId: "lovers_conflict_resolution", question: "What is a 'hard truth' you think I’m not ready to hear yet?", category: "Listening", intensity: "deep" },
  { id: "con_039", deckId: "lovers_conflict_resolution", question: "Do you feel like we are a team against the problem, or against each other?", category: "Listening", intensity: "medium" },
  { id: "con_040", deckId: "lovers_conflict_resolution", question: "How does your body feel physically when we are in a conflict?", category: "Listening", intensity: "medium" },

  // Forgiveness & Moving Forward
  { id: "con_041", deckId: "lovers_conflict_resolution", question: "Is there anything I’ve done in the past that you haven't fully forgiven?", category: "Forgiveness", intensity: "deep" },
  { id: "con_042", deckId: "lovers_conflict_resolution", question: "What makes it hard for you to forgive me?", category: "Forgiveness", intensity: "deep" },
  { id: "con_043", deckId: "lovers_conflict_resolution", question: "How can we 'leave the past in the past' more effectively?", category: "Forgiveness", intensity: "medium" },
  { id: "con_044", deckId: "lovers_conflict_resolution", question: "Do you believe 'sorry' is enough, or do you need a change in behavior?", category: "Forgiveness", intensity: "medium" },
  { id: "con_045", deckId: "lovers_conflict_resolution", question: "What’s one thing I’ve forgiven you for that meant a lot to you?", category: "Forgiveness", intensity: "medium" },
  { id: "con_046", deckId: "lovers_conflict_resolution", question: "Can we have a 'no-grudge' day? What would that look like?", category: "Forgiveness", intensity: "mild" },
  { id: "con_047", deckId: "lovers_conflict_resolution", question: "How do you feel when I remind you of an old mistake you made?", category: "Forgiveness", intensity: "medium" },
  { id: "con_048", deckId: "lovers_conflict_resolution", question: "What is the difference between 'moving on' and 'healing' to you?", category: "Forgiveness", intensity: "deep" },
  { id: "con_049", deckId: "lovers_conflict_resolution", question: "What can I do to regain your trust if I’ve broken it in a small way?", category: "Forgiveness", intensity: "deep" },
  { id: "con_050", deckId: "lovers_conflict_resolution", question: "Is there a specific action that makes you feel 'we’re okay now'?", category: "Forgiveness", intensity: "medium" },

  // Prevention & Connection
  { id: "con_051", deckId: "lovers_conflict_resolution", question: "How can we spot a fight coming before it actually starts?", category: "Prevention", intensity: "medium" },
  { id: "con_052", deckId: "lovers_conflict_resolution", question: "What’s a 'safeword' we can use when a conversation is getting too heated?", category: "Prevention", intensity: "mild" },
  { id: "con_053", deckId: "lovers_conflict_resolution", question: "How often should we check in on 'the state of our union'?", category: "Prevention", intensity: "medium" },
  { id: "con_054", deckId: "lovers_conflict_resolution", question: "What’s one way we can disagree and still be playful?", category: "Prevention", intensity: "mild" },
  { id: "con_055", deckId: "lovers_conflict_resolution", question: "How do we make sure our needs are met without it becoming a conflict?", category: "Prevention", intensity: "medium" },
  { id: "con_056", deckId: "lovers_conflict_resolution", question: "What’s one 'rule' for fighting you’d like us to adopt?", category: "Prevention", intensity: "medium" },
  { id: "con_057", deckId: "lovers_conflict_resolution", question: "How do we protect our relationship from outside stress (work/family)?", category: "Prevention", intensity: "medium" },
  { id: "con_058", deckId: "lovers_conflict_resolution", question: "When do we feel most 'in sync' as a team?", category: "Prevention", intensity: "medium" },
  { id: "con_059", deckId: "lovers_conflict_resolution", question: "What’s a compliment I can give you even when I’m mad at you?", category: "Prevention", intensity: "medium" },
  { id: "con_060", deckId: "lovers_conflict_resolution", question: "What’s the biggest 'lesson' our last big fight taught you?", category: "Prevention", intensity: "deep" },

  // Childhood Memories
  { id: "child_001", deckId: "lovers_inner_child", question: "What was your 'safe place' as a child?", category: "Memories", intensity: "medium" },
  { id: "child_002", deckId: "lovers_inner_child", question: "What was your favorite 'pretend' game to play alone?", category: "Memories", intensity: "mild" },
  { id: "child_003", deckId: "lovers_inner_child", question: "What scent or sound instantly takes you back to your childhood home?", category: "Memories", intensity: "mild" },
  { id: "child_004", deckId: "lovers_inner_child", question: "Who was the first person who made you feel truly seen as a kid?", category: "Memories", intensity: "medium" },
  { id: "child_005", deckId: "lovers_inner_child", question: "What was the most 'rebellious' thing you did before the age of 12?", category: "Memories", intensity: "mild" },
  { id: "child_006", deckId: "lovers_inner_child", question: "What was your favorite book or movie character as a child, and why?", category: "Memories", intensity: "mild" },
  { id: "child_007", deckId: "lovers_inner_child", question: "Did you have a 'blankie' or a stuffed animal that meant everything to you?", category: "Memories", intensity: "mild" },
  { id: "child_008", deckId: "lovers_inner_child", question: "What did you want to be when you grew up, and does that person still live inside you?", category: "Memories", intensity: "medium" },
  { id: "child_009", deckId: "lovers_inner_child", question: "What was a 'small win' from childhood that felt like a huge deal?", category: "Memories", intensity: "mild" },
  { id: "child_010", deckId: "lovers_inner_child", question: "What is your earliest memory, and how does it make you feel now?", category: "Memories", intensity: "medium" },

  // Upbringing & Parenting
  { id: "child_011", deckId: "lovers_inner_child", question: "What was the 'unspoken rule' in your house growing up?", category: "Upbringing", intensity: "deep" },
  { id: "child_012", deckId: "lovers_inner_child", question: "How was affection shown (or not shown) in your family?", category: "Upbringing", intensity: "deep" },
  { id: "child_013", deckId: "lovers_inner_child", question: "Which parent are you more afraid of disappointing, and why?", category: "Upbringing", intensity: "deep" },
  { id: "child_014", deckId: "lovers_inner_child", question: "What is a trait from your parents that you are working hard to *not* replicate?", category: "Upbringing", intensity: "deep" },
  { id: "child_015", deckId: "lovers_inner_child", question: "When you were sad as a child, how did the adults around you react?", category: "Upbringing", intensity: "deep" },
  { id: "child_016", deckId: "lovers_inner_child", question: "What was 'dinner time' like in your house? Stressful or happy?", category: "Upbringing", intensity: "medium" },
  { id: "child_017", deckId: "lovers_inner_child", question: "Were you the 'good kid,' the 'troublemaker,' or the 'forgotten' one?", category: "Upbringing", intensity: "medium" },
  { id: "child_018", deckId: "lovers_inner_child", question: "How did your family handle money, and how does that affect your spending now?", category: "Upbringing", intensity: "medium" },
  { id: "child_019", deckId: "lovers_inner_child", question: "What’s a 'limiting belief' you picked up from your family?", category: "Upbringing", intensity: "deep" },
  { id: "child_020", deckId: "lovers_inner_child", question: "If you could go back and give your parents one piece of advice, what would it be?", category: "Upbringing", intensity: "deep" },

  // Dreams & Play
  { id: "child_021", deckId: "lovers_inner_child", question: "What did your 8-year-old self think you would be doing right now?", category: "Play", intensity: "medium" },
  { id: "child_022", deckId: "lovers_inner_child", question: "What is one 'childish' thing you still love to do?", category: "Play", intensity: "mild" },
  { id: "child_023", deckId: "lovers_inner_child", question: "If we could spend a day at a theme park or toy store, which are you choosing?", category: "Play", intensity: "mild" },
  { id: "child_024", deckId: "lovers_inner_child", question: "How can I help you feel more 'playful' in our relationship?", category: "Play", intensity: "medium" },
  { id: "child_025", deckId: "lovers_inner_child", question: "What was your favorite 'comfort food' that your family used to make?", category: "Play", intensity: "mild" },
  { id: "child_026", deckId: "lovers_inner_child", question: "If you had no responsibilities for a day, what would your 'child self' want to do?", category: "Play", intensity: "mild" },
  { id: "child_027", deckId: "lovers_inner_child", question: "What was a 'creative' outlet you had as a kid that you've let go of?", category: "Play", intensity: "medium" },
  { id: "child_028", deckId: "lovers_inner_child", question: "Which cartoon or show from childhood do you still find comforting?", category: "Play", intensity: "mild" },
  { id: "child_029", deckId: "lovers_inner_child", question: "Do you remember your first 'crush'? What were they like?", category: "Play", intensity: "mild" },
  { id: "child_030", deckId: "lovers_inner_child", question: "What is a 'silly' skill you have that you learned when you were young?", category: "Play", intensity: "mild" },

  // Healing & Vulnerability
  { id: "child_031", deckId: "lovers_inner_child", question: "What is a part of your childhood that you are still trying to heal from?", category: "Healing", intensity: "deep" },
  { id: "child_032", deckId: "lovers_inner_child", question: "When was the first time you felt like you had to 'grow up' too fast?", category: "Healing", intensity: "deep" },
  { id: "child_033", deckId: "lovers_inner_child", question: "How do you feel when you see a photo of yourself as a toddler?", category: "Healing", intensity: "medium" },
  { id: "child_034", deckId: "lovers_inner_child", question: "What did you need to hear as a child that you never heard?", category: "Healing", intensity: "deep" },
  { id: "child_035", deckId: "lovers_inner_child", question: "How can I best 'hold space' for the younger version of you?", category: "Healing", intensity: "deep" },
  { id: "child_036", deckId: "lovers_inner_child", question: "What was a 'secret' you kept as a child that you can tell me now?", category: "Healing", intensity: "medium" },
  { id: "child_037", deckId: "lovers_inner_child", question: "Do you feel like you were allowed to be yourself when you were growing up?", category: "Healing", intensity: "deep" },
  { id: "child_038", deckId: "lovers_inner_child", question: "What is a 'pattern' you have now that started in your childhood?", category: "Healing", intensity: "deep" },
  { id: "child_039", deckId: "lovers_inner_child", question: "If you could hug your 10-year-old self right now, what would you say to them?", category: "Healing", intensity: "deep" },
  { id: "child_040", deckId: "lovers_inner_child", question: "What is one thing you 'lost' from childhood that you want to find again?", category: "Healing", intensity: "medium" },

  // Social & School
  { id: "child_041", deckId: "lovers_inner_child", question: "Were you a 'popular' kid, a 'nerdy' kid, or somewhere in between?", category: "Social", intensity: "mild" },
  { id: "child_042", deckId: "lovers_inner_child", question: "What was your favorite subject in school, and why?", category: "Social", intensity: "mild" },
  { id: "child_043", deckId: "lovers_inner_child", question: "Who was your best friend in elementary school? Are you still in touch?", category: "Social", intensity: "mild" },
  { id: "child_044", deckId: "lovers_inner_child", question: "Did you ever get into 'big trouble' at school? What happened?", category: "Social", intensity: "medium" },
  { id: "child_045", deckId: "lovers_inner_child", question: "What was the biggest 'social drama' you remember from middle school?", category: "Social", intensity: "mild" },
  { id: "child_046", deckId: "lovers_inner_child", question: "Were you an athlete, an artist, a gamer, or something else?", category: "Social", intensity: "mild" },
  { id: "child_047", deckId: "lovers_inner_child", question: "What was your 'dream' birthday party as a kid?", category: "Social", intensity: "mild" },
  { id: "child_048", deckId: "lovers_inner_child", question: "How did you handle 'fitting in' when you were younger?", category: "Social", intensity: "medium" },
  { id: "child_049", deckId: "lovers_inner_child", question: "What teacher made the biggest impact on your life?", category: "Social", intensity: "medium" },
  { id: "child_050", deckId: "lovers_inner_child", question: "If you could redo one grade in school, which would it be?", category: "Social", intensity: "mild" },

  // Adult Child
  { id: "child_051", deckId: "lovers_inner_child", question: "What's an 'adult' responsibility you're surprisingly good at because of your childhood?", category: "Adult Child", intensity: "medium" },
  { id: "child_052", deckId: "lovers_inner_child", question: "In what ways am I like one of your parents? (Good or bad!)", category: "Adult Child", intensity: "deep" },
  { id: "child_053", deckId: "lovers_inner_child", question: "How does your inner child react when I get frustrated with you?", category: "Adult Child", intensity: "deep" },
  { id: "child_054", deckId: "lovers_inner_child", question: "What's a 'tantrum' you still throw as an adult in a different way?", category: "Adult Child", intensity: "medium" },
  { id: "child_055", deckId: "lovers_inner_child", question: "What's something you do now just because you weren't allowed to as a kid?", category: "Adult Child", intensity: "medium" },
  { id: "child_056", deckId: "lovers_inner_child", question: "How can we 'play' more together in a way that satisfies our inner children?", category: "Adult Child", intensity: "medium" },
  { id: "child_057", deckId: "lovers_inner_child", question: "What part of your childhood was the most 'magical'?", category: "Adult Child", intensity: "mild" },
  { id: "child_058", deckId: "lovers_inner_child", question: "What is your inner child's 'love language'?", category: "Adult Child", intensity: "medium" },
  { id: "child_059", deckId: "lovers_inner_child", question: "If you could change one thing about your upbringing, what would it be?", category: "Adult Child", intensity: "deep" },
  { id: "child_060", deckId: "lovers_inner_child", question: "Does your inner child like me? Why or why not?", category: "Adult Child", intensity: "deep" },

  //   Category: Deep Fears
  { id: "guard_001", deckId: "lovers_vulnerability", question: "What is one thing you’re terrified of losing that you don’t talk about?", category: "Fears", intensity: "deep" },
  { id: "guard_002", deckId: "lovers_vulnerability", question: "Do you ever feel like you're 'not enough' for me? When?", category: "Fears", intensity: "deep" },
  { id: "guard_003", deckId: "lovers_vulnerability", question: "What is your biggest fear about us growing old together?", category: "Fears", intensity: "deep" },
  { id: "guard_004", deckId: "lovers_vulnerability", question: "If everything we built disappeared tomorrow, what would be the first thing you'd miss?", category: "Fears", intensity: "medium" },
  { id: "guard_005", deckId: "lovers_vulnerability", question: "What’s a nightmare you’ve had recently that felt strangely real?", category: "Fears", intensity: "medium" },
  { id: "guard_006", deckId: "lovers_vulnerability", question: "What is the fear that keeps you up at 3 AM?", category: "Fears", intensity: "deep" },
  { id: "guard_007", deckId: "lovers_vulnerability", question: "Are you more afraid of being alone or being with the wrong person?", category: "Fears", intensity: "deep" },
  { id: "guard_008", deckId: "lovers_vulnerability", question: "What is one thing you fear you’ll never achieve?", category: "Fears", intensity: "medium" },
  { id: "guard_009", deckId: "lovers_vulnerability", question: "Do you ever worry that I’ll wake up one day and feel differently about you?", category: "Fears", intensity: "deep" },
  { id: "guard_010", deckId: "lovers_vulnerability", question: "What is a fear you’ve conquered that you’re proud of?", category: "Fears", intensity: "medium" },

  //   Category: Hidden Truths
  { id: "guard_011", deckId: "lovers_vulnerability", question: "What is one thing you’ve never told me because you were afraid I’d judge you?", category: "Truths", intensity: "deep" },
  { id: "guard_012", deckId: "lovers_vulnerability", question: "When was the last time you felt truly lonely, even while we were together?", category: "Truths", intensity: "deep" },
  { id: "guard_013", deckId: "lovers_vulnerability", question: "What is a 'failure' from your past that you still haven't forgiven yourself for?", category: "Truths", intensity: "deep" },
  { id: "guard_014", deckId: "lovers_vulnerability", question: "Is there a part of your identity you feel you've suppressed for the sake of the relationship?", category: "Truths", intensity: "deep" },
  { id: "guard_015", deckId: "lovers_vulnerability", question: "What do you think is the 'darkest' part of your personality?", category: "Truths", intensity: "deep" },
  { id: "guard_016", deckId: "lovers_vulnerability", question: "What is a secret you’ve never shared with anyone else?", category: "Truths", intensity: "deep" },
  { id: "guard_017", deckId: "lovers_vulnerability", question: "What is one thing you’ve lied to me about, even if it was a small white lie?", category: "Truths", intensity: "deep" },
  { id: "guard_018", deckId: "lovers_vulnerability", question: "Do you ever feel like you have to wear a 'mask' around me?", category: "Truths", intensity: "deep" },
  { id: "guard_019", deckId: "lovers_vulnerability", question: "What is the most shameful thing you’ve ever done?", category: "Truths", intensity: "deep" },
  { id: "guard_020", deckId: "lovers_vulnerability", question: "What is one thing you want to be forgiven for?", category: "Truths", intensity: "deep" },

  //   Category: Emotional Safety
  { id: "guard_021", deckId: "lovers_vulnerability", question: "What can I do to make you feel safer when you're being vulnerable?", category: "Safety", intensity: "medium" },
  { id: "guard_022", deckId: "lovers_vulnerability", question: "When was the first time you felt you could truly be yourself around me?", category: "Safety", intensity: "medium" },
  { id: "guard_023", deckId: "lovers_vulnerability", question: "Do you trust me with your 'ugly' emotions (anger, jealousy, deep sadness)?", category: "Safety", intensity: "deep" },
  { id: "guard_024", deckId: "lovers_vulnerability", question: "What is a question you've been wanting to ask me but were too scared of the answer?", category: "Safety", intensity: "deep" },
  { id: "guard_025", deckId: "lovers_vulnerability", question: "How do you feel when I see you cry?", category: "Safety", intensity: "medium" },
  { id: "guard_026", deckId: "lovers_vulnerability", question: "What’s one thing I’ve done that made you feel like you had to put your guard back up?", category: "Safety", intensity: "deep" },
  { id: "guard_027", deckId: "lovers_vulnerability", question: "How can I better protect your heart?", category: "Safety", intensity: "deep" },
  { id: "guard_028", deckId: "lovers_vulnerability", question: "Do you feel like you can tell me when I’ve hurt you without me getting defensive?", category: "Safety", intensity: "medium" },
  { id: "guard_029", deckId: "lovers_vulnerability", question: "What does 'emotional safety' mean to you?", category: "Safety", intensity: "medium" },
  { id: "guard_030", deckId: "lovers_vulnerability", question: "Is there anything about our relationship that feels 'unstable' to you?", category: "Safety", intensity: "deep" },

  //   Category: Insecurities
  { id: "guard_031", deckId: "lovers_vulnerability", question: "What is your biggest insecurity in our relationship?", category: "Insecurities", intensity: "deep" },
  { id: "guard_032", deckId: "lovers_vulnerability", question: "How do you feel about your body right now, and how can I help you feel better about it?", category: "Insecurities", intensity: "deep" },
  { id: "guard_033", deckId: "lovers_vulnerability", question: "What’s a part of your personality you’re most self-conscious about?", category: "Insecurities", intensity: "medium" },
  { id: "guard_034", deckId: "lovers_vulnerability", question: "Do you ever feel like you're in my shadow, or vice versa?", category: "Insecurities", intensity: "medium" },
  { id: "guard_035", deckId: "lovers_vulnerability", question: "What is one thing you wish you could change about yourself?", category: "Insecurities", intensity: "medium" },
  { id: "guard_036", deckId: "lovers_vulnerability", question: "Do you feel like you have to compete for my attention?", category: "Insecurities", intensity: "medium" },
  { id: "guard_037", deckId: "lovers_vulnerability", question: "What is the meanest thing you’ve ever said to yourself?", category: "Insecurities", intensity: "deep" },
  { id: "guard_038", deckId: "lovers_vulnerability", question: "Do you ever feel like you're not 'smart' or 'successful' enough for me?", category: "Insecurities", intensity: "deep" },
  { id: "guard_039", deckId: "lovers_vulnerability", question: "What is one thing you’re jealous of in other couples?", category: "Insecurities", intensity: "medium" },
  { id: "guard_040", deckId: "lovers_vulnerability", question: "How do you handle feeling inadequate?", category: "Insecurities", intensity: "deep" },

  //   Category: Lessons from Pain
  { id: "guard_041", deckId: "lovers_vulnerability", question: "What is the most painful lesson you’ve ever had to learn?", category: "Pain", intensity: "deep" },
  { id: "guard_042", deckId: "lovers_vulnerability", question: "How has your past heartbreak changed the way you love me?", category: "Pain", intensity: "deep" },
  { id: "guard_043", deckId: "lovers_vulnerability", question: "What is one thing from your past that you’re still trying to heal from?", category: "Pain", intensity: "deep" },
  { id: "guard_044", deckId: "lovers_vulnerability", question: "When was the last time you felt truly broken?", category: "Pain", intensity: "deep" },
  { id: "guard_045", deckId: "lovers_vulnerability", question: "What is the most difficult thing you’ve ever had to survive?", category: "Pain", intensity: "deep" },
  { id: "guard_046", deckId: "lovers_vulnerability", question: "How do you deal with emotional pain when it feels like too much?", category: "Pain", intensity: "deep" },
  { id: "guard_047", deckId: "lovers_vulnerability", question: "What is the biggest regret you have in life so far?", category: "Pain", intensity: "deep" },
  { id: "guard_048", deckId: "lovers_vulnerability", question: "Who is the one person from your past you wish you could say 'sorry' to?", category: "Pain", intensity: "deep" },
  { id: "guard_049", deckId: "lovers_vulnerability", question: "What is a pain you’ve experienced that you’ve never told me about?", category: "Pain", intensity: "deep" },
  { id: "guard_050", deckId: "lovers_vulnerability", question: "How can I help you carry your burdens?", category: "Pain", intensity: "deep" },

  //   Category: Authentic Self
  { id: "guard_051", deckId: "lovers_vulnerability", question: "Who are you when no one is watching?", category: "Self", intensity: "deep" },
  { id: "guard_052", deckId: "lovers_vulnerability", question: "What is one thing you want me to know about you that I haven't asked yet?", category: "Self", intensity: "deep" },
  { id: "guard_053", deckId: "lovers_vulnerability", question: "What is the most authentic thing about our relationship?", category: "Self", intensity: "medium" },
  { id: "guard_054", deckId: "lovers_vulnerability", question: "Do you feel like you can be your 'messiest' self around me?", category: "Self", intensity: "deep" },
  { id: "guard_055", deckId: "lovers_vulnerability", question: "What is one thing you’re tired of pretending to be?", category: "Self", intensity: "deep" },
  { id: "guard_056", deckId: "lovers_vulnerability", question: "What part of your 'true self' are you most afraid of me seeing?", category: "Self", intensity: "deep" },
  { id: "guard_057", deckId: "lovers_vulnerability", question: "How do you want to be remembered by the people who truly know you?", category: "Self", intensity: "deep" },
  { id: "guard_058", deckId: "lovers_vulnerability", question: "What does 'being seen' feel like to you?", category: "Self", intensity: "deep" },
  { id: "guard_059", deckId: "lovers_vulnerability", question: "What is one thing you love about yourself that most people don't notice?", category: "Self", intensity: "medium" },
  { id: "guard_060", deckId: "lovers_vulnerability", question: "How has loving me helped you love yourself more?", category: "Self", intensity: "deep" },

  //   Category: Routine & Rituals
  { id: "ritual_001", deckId: "lovers_daily_ritual", question: "What’s your favorite part of our morning routine together?", category: "Routine", intensity: "mild" },
  { id: "ritual_002", deckId: "lovers_daily_ritual", question: "Which chore do you secretly hope I’ll do so you don’t have to?", category: "Routine", intensity: "mild" },
  { id: "ritual_003", deckId: "lovers_daily_ritual", question: "If we had to pick one 'signature meal' to cook every Sunday, what would it be?", category: "Routine", intensity: "mild" },
  { id: "ritual_004", deckId: "lovers_daily_ritual", question: "What’s the best 'insignificant' memory we have together (like a trip to the store)?", category: "Routine", intensity: "medium" },
  { id: "ritual_005", deckId: "lovers_daily_ritual", question: "How do you feel about our current 'winding down' routine before bed?", category: "Routine", intensity: "medium" },
  { id: "ritual_006", deckId: "lovers_daily_ritual", question: "What is one small habit of ours that you never want us to stop?", category: "Routine", intensity: "medium" },
  { id: "ritual_007", deckId: "lovers_daily_ritual", question: "How do you feel when we’re just sitting in the same room doing different things?", category: "Routine", intensity: "mild" },
  { id: "ritual_008", deckId: "lovers_daily_ritual", question: "What’s the one thing we do every day that makes you feel most like a couple?", category: "Routine", intensity: "medium" },
  { id: "ritual_009", deckId: "lovers_daily_ritual", question: "If we could have a 'secret handshake' or signal, what would it be?", category: "Routine", intensity: "mild" },
  { id: "ritual_010", deckId: "lovers_daily_ritual", question: "What is your favorite way for us to start the weekend?", category: "Routine", intensity: "mild" },

  //   Category: Domestic Bliss
  { id: "ritual_011", deckId: "lovers_daily_ritual", question: "What is your favorite 'spot' in our home, and why?", category: "Domestic", intensity: "mild" },
  { id: "ritual_012", deckId: "lovers_daily_ritual", question: "What’s a small way we can make our home feel more like a sanctuary?", category: "Domestic", intensity: "medium" },
  { id: "ritual_013", deckId: "lovers_daily_ritual", question: "Do you prefer a 'clean house' or a 'lived-in' house?", category: "Domestic", intensity: "mild" },
  { id: "ritual_014", deckId: "lovers_daily_ritual", question: "Which piece of furniture or decor of ours has the best story?", category: "Domestic", intensity: "mild" },
  { id: "ritual_015", deckId: "lovers_daily_ritual", question: "If we could have one 'luxury' service for our home (like a chef or cleaner), what would it be?", category: "Domestic", intensity: "mild" },
  { id: "ritual_016", deckId: "lovers_daily_ritual", question: "How do you feel about our current 'decor' style? Does it feel like both of us?", category: "Domestic", intensity: "medium" },
  { id: "ritual_017", deckId: "lovers_daily_ritual", question: "What’s the best thing about living with me (or the idea of it)?", category: "Domestic", intensity: "medium" },
  { id: "ritual_018", deckId: "lovers_daily_ritual", question: "What’s one small domestic thing I do that drives you a little crazy but you’ve learned to love?", category: "Domestic", intensity: "mild" },
  { id: "ritual_019", deckId: "lovers_daily_ritual", question: "If we could change one thing about our living situation tomorrow, what would it be?", category: "Domestic", intensity: "medium" },
  { id: "ritual_020", deckId: "lovers_daily_ritual", question: "What’s the most 'us' item in our house?", category: "Domestic", intensity: "mild" },

  //   Category: Gratitude & Connection
  { id: "ritual_021", deckId: "lovers_daily_ritual", question: "What is one small thing I did this week that made you smile?", category: "Gratitude", intensity: "medium" },
  { id: "ritual_022", deckId: "lovers_daily_ritual", question: "What is a 'daily habit' of mine that you’ve grown to love?", category: "Gratitude", intensity: "medium" },
  { id: "ritual_023", deckId: "lovers_daily_ritual", question: "What’s the best way for me to say 'goodbye' to you when I leave for the day?", category: "Gratitude", intensity: "mild" },
  { id: "ritual_024", deckId: "lovers_daily_ritual", question: "What is one 'micro-moment' of love we share that you cherish?", category: "Gratitude", intensity: "deep" },
  { id: "ritual_025", deckId: "lovers_daily_ritual", question: "How has our relationship changed your day-to-day happiness?", category: "Gratitude", intensity: "medium" },
  { id: "ritual_026", deckId: "lovers_daily_ritual", question: "What is something I do for you that you think I don't realize you appreciate?", category: "Gratitude", intensity: "medium" },
  { id: "ritual_027", deckId: "lovers_daily_ritual", question: "When was the last time you felt truly 'seen' by me in a small moment?", category: "Gratitude", intensity: "deep" },
  { id: "ritual_028", deckId: "lovers_daily_ritual", question: "What is the best 'comfort' I provide for you?", category: "Gratitude", intensity: "medium" },
  { id: "ritual_029", deckId: "lovers_daily_ritual", question: "What’s one thing I do that always makes you feel better after a bad day?", category: "Gratitude", intensity: "medium" },
  { id: "ritual_030", deckId: "lovers_daily_ritual", question: "What are you most grateful for in our relationship today?", category: "Gratitude", intensity: "deep" },

  //   Category: Small Adventures
  { id: "ritual_031", deckId: "lovers_daily_ritual", question: "What’s your favorite 'mini-adventure' we’ve ever taken (even just across town)?", category: "Adventures", intensity: "mild" },
  { id: "ritual_032", deckId: "lovers_daily_ritual", question: "If we had to pick a 'spot' (a park, a cafe) that was ours, where would it be?", category: "Adventures", intensity: "mild" },
  { id: "ritual_033", deckId: "lovers_daily_ritual", question: "What is a new place in our city you want to explore with me?", category: "Adventures", intensity: "mild" },
  { id: "ritual_034", deckId: "lovers_daily_ritual", question: "Do you prefer a spontaneous day out or a perfectly planned one?", category: "Adventures", intensity: "mild" },
  { id: "ritual_035", deckId: "lovers_daily_ritual", question: "What’s the best way for us to 'explore' without leaving the house?", category: "Adventures", intensity: "medium" },
  { id: "ritual_036", deckId: "lovers_daily_ritual", question: "If we could take a 2-hour road trip right now, which direction would we drive?", category: "Adventures", intensity: "mild" },
  { id: "ritual_037", deckId: "lovers_daily_ritual", question: "What’s a 'tourist' thing in our own city we haven’t done yet?", category: "Adventures", intensity: "mild" },
  { id: "ritual_038", deckId: "lovers_daily_ritual", question: "What’s your favorite 'date night' that costs zero dollars?", category: "Adventures", intensity: "mild" },
  { id: "ritual_039", deckId: "lovers_daily_ritual", question: "If we had a 'us' day every month, how would we spend it?", category: "Adventures", intensity: "medium" },
  { id: "ritual_040", deckId: "lovers_daily_ritual", question: "What’s one small adventure we can start today?", category: "Adventures", intensity: "mild" },

  //   Category: Food & Rituals
  { id: "ritual_041", deckId: "lovers_daily_ritual", question: "What’s our 'best' meal to cook together?", category: "Food", intensity: "mild" },
  { id: "ritual_042", deckId: "lovers_daily_ritual", question: "Which takeout place is our 'old reliable'?", category: "Food", intensity: "mild" },
  { id: "ritual_043", deckId: "lovers_daily_ritual", question: "Do you prefer it when we eat at the table or on the couch together?", category: "Food", intensity: "mild" },
  { id: "ritual_044", deckId: "lovers_daily_ritual", question: "What’s a food that instantly reminds you of a happy time we had?", category: "Food", intensity: "medium" },
  { id: "ritual_045", deckId: "lovers_daily_ritual", question: "What’s the one thing we always disagree on when it comes to food?", category: "Food", intensity: "mild" },
  { id: "ritual_046", deckId: "lovers_daily_ritual", question: "Who is the better 'sous chef' in our relationship?", category: "Food", intensity: "mild" },
  { id: "ritual_047", deckId: "lovers_daily_ritual", question: "What’s a breakfast tradition you’d like us to start?", category: "Food", intensity: "mild" },
  { id: "ritual_048", deckId: "lovers_daily_ritual", question: "What’s your favorite 'guilty pleasure' snack we share?", category: "Food", intensity: "mild" },
  { id: "ritual_049", deckId: "lovers_daily_ritual", question: "If we were a drink, what would we be?", category: "Food", intensity: "medium" },
  { id: "ritual_050", deckId: "lovers_daily_ritual", question: "How has our 'food life' changed since we met?", category: "Food", intensity: "medium" },

  //   Category: Future Daily Life
  { id: "ritual_051", deckId: "lovers_daily_ritual", question: "How do you see our daily life changing in the next 5 years?", category: "Future", intensity: "medium" },
  { id: "ritual_052", deckId: "lovers_daily_ritual", question: "What’s a daily ritual you want us to still have when we’re 80?", category: "Future", intensity: "medium" },
  { id: "ritual_053", deckId: "lovers_daily_ritual", question: "If we had kids or pets, how would our 'daily joys' change?", category: "Future", intensity: "medium" },
  { id: "ritual_054", deckId: "lovers_daily_ritual", question: "What’s one thing about our daily life now that you’ll miss in the future?", category: "Future", intensity: "medium" },
  { id: "ritual_055", deckId: "lovers_daily_ritual", question: "How can we make sure we never get 'bored' of our daily life together?", category: "Future", intensity: "deep" },
  { id: "ritual_056", deckId: "lovers_daily_ritual", question: "What’s a 'dream' routine you want us to work towards?", category: "Future", intensity: "medium" },
  { id: "ritual_057", deckId: "lovers_daily_ritual", question: "If we retired tomorrow, what would our 'new' daily ritual be?", category: "Future", intensity: "medium" },
  { id: "ritual_058", deckId: "lovers_daily_ritual", question: "How will we keep the 'magic' in our mundane life as we grow old?", category: "Future", intensity: "deep" },
  { id: "ritual_059", deckId: "lovers_daily_ritual", question: "What’s the most important daily thing for us to keep 'us'?", category: "Future", intensity: "deep" },
  { id: "ritual_060", deckId: "lovers_daily_ritual", question: "On a scale of 1-10, how happy does our everyday life make you?", category: "Future", intensity: "deep" }
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