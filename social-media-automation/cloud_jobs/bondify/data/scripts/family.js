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
  { id: "family", title: "👨‍👩‍👧 Family", tagline: "Create lasting memories" }
];

const decks = [
  // ── FAMILY ──
{ id: "family_childhood", modeId: "family", title: "🏡 Childhood Stories", description: "Relive your favourite memories", isLocked: false },
  { id: "family_values", modeId: "family", title: "🌳 Family Values", description: "Discover what matters most to each other", isLocked: false },
  { id: "family_generations", modeId: "family", title: "👴 Time Capsule", description: "Ask the elders things you never knew", isLocked: false },
  { id: "family_traditions", modeId: "family", title: "🕯️ Traditions", description: "The rituals that make us who we are", isLocked: false },
  { id: "family_sibling_rivalry", modeId: "family", title: "🥊 Sibling Vibes", description: "Lighthearted fun for the brothers and sisters", isLocked: false },
  { id: "family_gratitude", modeId: "family", title: "🙏 Gratitude Circle", description: "Celebrate love and appreciation", isLocked: true },
  { id: "family_legacy", modeId: "family", title: "📜 The Legacy", description: "How do we want to be remembered?", isLocked: true },
  { id: "family_unspoken", modeId: "family", title: "🤐 Unspoken", description: "Clearing the air and moving forward", isLocked: true }
];
const cards = [
  //   Category: Early Memories
  { id: "fam_child_001", deckId: "family_childhood", question: "What is your very earliest memory, and how old were you?", category: "Early Memories", intensity: "mild" },
  { id: "fam_child_002", deckId: "family_childhood", question: "What was your favorite bedtime story or book growing up?", category: "Early Memories", intensity: "mild" },
  { id: "fam_child_003", deckId: "family_childhood", question: "Did you have a 'security blanket' or a specific stuffed animal you couldn't sleep without?", category: "Early Memories", intensity: "mild" },
  { id: "fam_child_004", deckId: "family_childhood", question: "What was the first 'big kid' thing you remember being proud of doing?", category: "Early Memories", intensity: "medium" },
  { id: "fam_child_005", deckId: "family_childhood", question: "Who was the first friend you ever made outside of the family?", category: "Early Memories", intensity: "mild" },

  //   Category: Mischief & Lessons
  { id: "fam_child_006", deckId: "family_childhood", question: "What is the biggest trouble you ever got into as a kid?", category: "Mischief", intensity: "medium" },
  { id: "fam_child_007", deckId: "family_childhood", question: "Did you ever try to 'run away' from home? How far did you get?", category: "Mischief", intensity: "mild" },
  { id: "fam_child_008", deckId: "family_childhood", question: "What was the funniest lie you told your parents that they eventually figured out?", category: "Mischief", intensity: "medium" },
  { id: "fam_child_009", deckId: "family_childhood", question: "Which sibling (or cousin) was the 'instigator' of trouble?", category: "Mischief", intensity: "mild" },
  { id: "fam_child_010", deckId: "family_childhood", question: "What was your most memorable 'grounded' or punishment story?", category: "Mischief", intensity: "medium" },

  //   Category: The Family Home
  { id: "fam_child_011", deckId: "family_childhood", question: "What did your childhood home smell like during the holidays?", category: "Home Life", intensity: "mild" },
  { id: "fam_child_012", deckId: "family_childhood", question: "Who was the 'cook' in the house, and what was their signature dish?", category: "Home Life", intensity: "mild" },
  { id: "fam_child_013", deckId: "family_childhood", question: "What was the 'unspoken rule' in your house growing up?", category: "Home Life", intensity: "medium" },
  { id: "fam_child_014", deckId: "family_childhood", question: "Did you share a room? What was the best and worst part about that?", category: "Home Life", intensity: "medium" },
  { id: "fam_child_015", deckId: "family_childhood", question: "What was your favorite 'secret spot' in or around the house?", category: "Home Life", intensity: "mild" },

  //   Category: School & Growing Up
  { id: "fam_child_016", deckId: "family_childhood", question: "What did you want to be when you grew up when you were 8 years old?", category: "School Years", intensity: "mild" },
  { id: "fam_child_017", deckId: "family_childhood", question: "Who was the teacher that had the biggest impact on you?", category: "School Years", intensity: "medium" },
  { id: "fam_child_018", deckId: "family_childhood", question: "What was your favorite school lunch or snack?", category: "School Years", intensity: "mild" },
  { id: "fam_child_019", deckId: "family_childhood", question: "Were you a 'brainy' kid, a 'sporty' kid, or a 'creative' kid?", category: "School Years", intensity: "medium" },
  { id: "fam_child_020", deckId: "family_childhood", question: "What was your most embarrassing school photo or outfit?", category: "School Years", intensity: "mild" },

  //   Category: Traditions & Holidays
  { id: "fam_child_021", deckId: "family_childhood", question: "What is one family tradition that we still do today that you love?", category: "Traditions", intensity: "mild" },
  { id: "fam_child_022", deckId: "family_childhood", question: "What was the most 'failed' family vacation we ever took?", category: "Traditions", intensity: "medium" },
  { id: "fam_child_023", deckId: "family_childhood", question: "How did the family celebrate birthdays when you were young?", category: "Traditions", intensity: "mild" },
  { id: "fam_child_024", deckId: "family_childhood", question: "Is there a tradition from your past that we’ve stopped doing that you miss?", category: "Traditions", intensity: "medium" },
  { id: "fam_child_025", deckId: "family_childhood", question: "What was the 'big event' your family prepared for every year?", category: "Traditions", intensity: "mild" },

  //   Category: Parents & Grandparents
  { id: "fam_child_026", deckId: "family_childhood", question: "What is a story about your grandparents that always makes you laugh?", category: "Ancestry", intensity: "medium" },
  { id: "fam_child_027", deckId: "family_childhood", question: "What was the 'catchphrase' your parents always used to say?", category: "Ancestry", intensity: "mild" },
  { id: "fam_child_028", deckId: "family_childhood", question: "How did your parents meet? Do you know the full story?", category: "Ancestry", intensity: "medium" },
  { id: "fam_child_029", deckId: "family_childhood", question: "Which ancestor do you think you are most like in personality?", category: "Ancestry", intensity: "medium" },
  { id: "fam_child_030", deckId: "family_childhood", question: "What is one thing your parents did for you that you didn't appreciate until you were older?", category: "Ancestry", intensity: "deep" },

  //   Category: Toys & Entertainment
  { id: "fam_child_031", deckId: "family_childhood", question: "If you could bring back one toy from your childhood, what would it be?", category: "Play", intensity: "mild" },
  { id: "fam_child_032", deckId: "family_childhood", question: "What was the first movie you remember seeing in a theater?", category: "Play", intensity: "mild" },
  { id: "fam_child_033", deckId: "family_childhood", question: "What video game or board game caused the most arguments in the family?", category: "Play", intensity: "medium" },
  { id: "fam_child_034", deckId: "family_childhood", question: "Did you ever have a 'secret club' or build fortresses out of blankets?", category: "Play", intensity: "mild" },
  { id: "fam_child_035", deckId: "family_childhood", question: "What song instantly reminds you of your teenage years?", category: "Play", intensity: "mild" },

  //   Category: Hard Times & Resilience
  { id: "fam_child_036", deckId: "family_childhood", question: "What was the hardest thing the family went through together?", category: "Resilience", intensity: "deep" },
  { id: "fam_child_037", deckId: "family_childhood", question: "Who was the 'rock' of the family during stressful times?", category: "Resilience", intensity: "deep" },
  { id: "fam_child_038", deckId: "family_childhood", question: "What is a major world event you remember living through as a child?", category: "Resilience", intensity: "medium" },
  { id: "fam_child_039", deckId: "family_childhood", question: "When did you first realize that your parents were just 'regular people'?", category: "Resilience", intensity: "deep" },
  { id: "fam_child_040", deckId: "family_childhood", question: "What struggle from your childhood made you stronger today?", category: "Resilience", intensity: "deep" },

  //   Category: Quirks & Personalities
  { id: "fam_child_041", deckId: "family_childhood", question: "Who was the 'clown' of the family?", category: "Personalities", intensity: "mild" },
  { id: "fam_child_042", deckId: "family_childhood", question: "Which family member has the most 'unbelievable' life story?", category: "Personalities", intensity: "medium" },
  { id: "fam_child_043", deckId: "family_childhood", question: "What is a 'hidden talent' someone in this family has that others might not know?", category: "Personalities", intensity: "medium" },
  { id: "fam_child_044", deckId: "family_childhood", question: "Who is the most 'stubborn' person in the family tree?", category: "Personalities", intensity: "mild" },
  { id: "fam_child_045", deckId: "family_childhood", question: "What was your childhood nickname, and how did you get it?", category: "Personalities", intensity: "mild" },

  //   Category: Teenage Rebellion
  { id: "fam_child_046", deckId: "family_childhood", question: "What was your first job, and what did you do with your first paycheck?", category: "Teen Years", intensity: "mild" },
  { id: "fam_child_047", deckId: "family_childhood", question: "What was the most 'rebellious' phase you went through?", category: "Teen Years", intensity: "medium" },
  { id: "fam_child_048", deckId: "family_childhood", question: "Did you ever 'borrow' the family car without asking?", category: "Teen Years", intensity: "medium" },
  { id: "fam_child_049", deckId: "family_childhood", question: "Who was your first real heartbreak, and how did the family help (or not)?", category: "Teen Years", intensity: "deep" },
  { id: "fam_child_050", deckId: "family_childhood", question: "What is a fashion choice from your youth that you’d like to delete from history?", category: "Teen Years", intensity: "mild" },

  //   Category: Reflection
  { id: "fam_child_051", deckId: "family_childhood", question: "If you could go back and relive one family dinner, which one would it be?", category: "Reflection", intensity: "medium" },
  { id: "fam_child_052", deckId: "family_childhood", question: "What is the biggest difference between kids today and when you were young?", category: "Reflection", intensity: "medium" },
  { id: "fam_child_053", deckId: "family_childhood", question: "What do you wish you had asked your own parents before they passed (or before you moved out)?", category: "Reflection", intensity: "deep" },
  { id: "fam_child_054", deckId: "family_childhood", question: "What is the most 'family' thing we do that makes you feel at home?", category: "Reflection", intensity: "medium" },
  { id: "fam_child_055", deckId: "family_childhood", question: "What part of your childhood do you hope to pass on to your own children?", category: "Reflection", intensity: "medium" },

  //   Category: Fun & Random
  { id: "fam_child_056", deckId: "family_childhood", question: "What was your favorite 'pretend' game to play?", category: "Fun", intensity: "mild" },
  { id: "fam_child_057", deckId: "family_childhood", question: "Did you have a family pet growing up? What was their name and personality?", category: "Fun", intensity: "mild" },
  { id: "fam_child_058", deckId: "family_childhood", question: "What was the 'big treat' you would get for a good report card?", category: "Fun", intensity: "mild" },
  { id: "fam_child_059", deckId: "family_childhood", question: "Who was your favorite superhero or fictional character?", category: "Fun", intensity: "mild" },
  { id: "fam_child_060", deckId: "family_childhood", question: "If you could spend one more day as a 10-year-old, what would you do?", category: "Fun", intensity: "medium" },

  //   Category: Core Principles
  { id: "fam_val_001", deckId: "family_values", question: "What are the three most important values our family stands for?", category: "Principles", intensity: "medium" },
  { id: "fam_val_002", deckId: "family_values", question: "In our family, is it better to be brutally honest or to protect someone's feelings?", category: "Principles", intensity: "deep" },
  { id: "fam_val_003", deckId: "family_values", question: "How do we define 'success' as a family? Is it wealth, happiness, or something else?", category: "Principles", intensity: "medium" },
  { id: "fam_val_004", deckId: "family_values", question: "What is one 'rule' our family lives by that isn't officially written down?", category: "Principles", intensity: "medium" },
  { id: "fam_val_005", deckId: "family_values", question: "What does the word 'loyalty' mean in the context of our family?", category: "Principles", intensity: "deep" },

  //   Category: Work & Ambition
  { id: "fam_val_006", deckId: "family_values", question: "What is our family’s attitude toward hard work versus leisure time?", category: "Work Ethic", intensity: "medium" },
  { id: "fam_val_007", deckId: "family_values", question: "How do we handle failure? Is it seen as a lesson or a disappointment?", category: "Work Ethic", intensity: "deep" },
  { id: "fam_val_008", deckId: "family_values", question: "What’s more important: following your passion or finding financial stability?", category: "Work Ethic", intensity: "medium" },
  { id: "fam_val_009", deckId: "family_values", question: "Who is the hardest worker you know in our family tree?", category: "Work Ethic", intensity: "mild" },
  { id: "fam_val_010", deckId: "family_values", question: "How do we celebrate professional or academic achievements?", category: "Work Ethic", intensity: "mild" },

  //   Category: Money & Materialism
  { id: "fam_val_011", deckId: "family_values", question: "What was the 'money philosophy' in our house growing up?", category: "Finance", intensity: "medium" },
  { id: "fam_val_012", deckId: "family_values", question: "Is it better to save every penny for the future or spend it on experiences today?", category: "Finance", intensity: "medium" },
  { id: "fam_val_013", deckId: "family_values", question: "How does our family feel about debt—is it a tool or something to be avoided at all costs?", category: "Finance", intensity: "deep" },
  { id: "fam_val_014", deckId: "family_values", question: "What is the one thing our family will always find the money for, no matter what?", category: "Finance", intensity: "medium" },
  { id: "fam_val_015", deckId: "family_values", question: "What does 'generosity' look like to you?", category: "Finance", intensity: "medium" },

  //   Category: Community & Service
  { id: "fam_val_016", deckId: "family_values", question: "How important is it for us to give back to our community?", category: "Community", intensity: "medium" },
  { id: "fam_val_017", deckId: "family_values", question: "If our family had a million dollars to donate, which cause would we choose together?", category: "Community", intensity: "mild" },
  { id: "fam_val_018", deckId: "family_values", question: "Do you think our family is more focused on our internal bond or our external reputation?", category: "Community", intensity: "deep" },
  { id: "fam_val_019", deckId: "family_values", question: "What does 'being a good neighbor' mean to you?", category: "Community", intensity: "mild" },
  { id: "fam_val_020", deckId: "family_values", question: "How do we treat strangers or people who are less fortunate than us?", category: "Community", intensity: "medium" },

  //   Category: Traditions & Legacy
  { id: "fam_val_021", deckId: "family_values", question: "Which family tradition do you feel is the most 'sacred'?", category: "Legacy", intensity: "medium" },
  { id: "fam_val_022", deckId: "family_values", question: "If you could start a brand new family tradition today, what would it be?", category: "Legacy", intensity: "mild" },
  { id: "fam_val_023", deckId: "family_values", question: "What is one thing about our family history that we should never forget?", category: "Legacy", intensity: "deep" },
  { id: "fam_val_024", deckId: "family_values", question: "How do we want to be remembered by future generations of this family?", category: "Legacy", intensity: "deep" },
  { id: "fam_val_025", deckId: "family_values", question: "Which 'family heirloom' (physical or story) is the most valuable to you?", category: "Legacy", intensity: "medium" },

  //   Category: Communication & Conflict
  { id: "fam_val_026", deckId: "family_values", question: "How does our family handle disagreements? Do we yell, go silent, or sit down and talk?", category: "Conflict", intensity: "deep" },
  { id: "fam_val_027", deckId: "family_values", question: "Is there a topic that is 'off-limits' in our family? Should it stay that way?", category: "Conflict", intensity: "deep" },
  { id: "fam_val_028", deckId: "family_values", question: "What’s the best way to apologize to a family member?", category: "Conflict", intensity: "medium" },
  { id: "fam_val_029", deckId: "family_values", question: "Who is the 'peacemaker' in the family, and how do they do it?", category: "Conflict", intensity: "medium" },
  { id: "fam_val_030", deckId: "family_values", question: "What is the 'golden rule' for communication when we're all together?", category: "Conflict", intensity: "medium" },

  //   Category: Health & Wellness
  { id: "fam_val_031", deckId: "family_values", question: "How much of a priority is physical and mental health in our family?", category: "Well-being", intensity: "medium" },
  { id: "fam_val_032", deckId: "family_values", question: "How do we support each other when someone is going through a hard time mentally?", category: "Well-being", intensity: "deep" },
  { id: "fam_val_033", deckId: "family_values", question: "What is our family’s 'comfort food' during a crisis?", category: "Well-being", intensity: "mild" },
  { id: "fam_val_034", deckId: "family_values", question: "Do we value rest and 'doing nothing' as much as being productive?", category: "Well-being", intensity: "medium" },
  { id: "fam_val_035", deckId: "family_values", question: "What is one healthy habit you wish the whole family would adopt?", category: "Well-being", intensity: "medium" },

  //   Category: Relationships & Outsiders
  { id: "fam_val_036", deckId: "family_values", question: "How do we decide if someone new is 'part of the family'?", category: "Social", intensity: "medium" },
  { id: "fam_val_037", deckId: "family_values", question: "What qualities do we look for in our family members' partners?", category: "Social", intensity: "medium" },
  { id: "fam_val_038", deckId: "family_values", question: "How do we handle it when someone 'outsider' disrespects a family member?", category: "Social", intensity: "deep" },
  { id: "fam_val_039", deckId: "family_values", question: "Do you feel like you can be your 100% authentic self with us?", category: "Social", intensity: "deep" },
  { id: "fam_val_040", deckId: "family_values", question: "What is our family’s policy on 'second chances'?", category: "Social", intensity: "deep" },

  //   Category: Education & Curiosity
  { id: "fam_val_041", deckId: "family_values", question: "How important is formal education versus 'life experience' to our family?", category: "Learning", intensity: "medium" },
  { id: "fam_val_042", deckId: "family_values", question: "What’s one thing you’ve learned from a family member that you didn't learn in school?", category: "Learning", intensity: "medium" },
  { id: "fam_val_043", deckId: "family_values", question: "Is it okay to change your mind about big beliefs in this family?", category: "Learning", intensity: "deep" },
  { id: "fam_val_044", deckId: "family_values", question: "What is the most 'intellectual' thing we enjoy doing together?", category: "Learning", intensity: "mild" },
  { id: "fam_val_045", deckId: "family_values", question: "What is a skill you think every member of this family should possess?", category: "Learning", intensity: "mild" },

  //   Category: Religion & Spirituality
  { id: "fam_val_046", deckId: "family_values", question: "What role does faith or spirituality play in our daily lives?", category: "Spirituality", intensity: "deep" },
  { id: "fam_val_047", deckId: "family_values", question: "How do we handle it when a family member has different spiritual beliefs than the rest?", category: "Spirituality", intensity: "deep" },
  { id: "fam_val_048", deckId: "family_values", question: "Where do you feel the most 'at peace' as a family?", category: "Spirituality", intensity: "medium" },
  { id: "fam_val_049", deckId: "family_values", question: "What is one spiritual or moral lesson you want to leave behind?", category: "Spirituality", intensity: "deep" },
  { id: "fam_val_050", deckId: "family_values", question: "How do we celebrate the 'miracles' or good luck that happens to us?", category: "Spirituality", intensity: "medium" },

  //   Category: Parenting & Growth
  { id: "fam_val_051", deckId: "family_values", question: "What was the most important lesson you learned from your parents?", category: "Growth", intensity: "medium" },
  { id: "fam_val_052", deckId: "family_values", question: "What is one thing about your upbringing you would change for your own kids?", category: "Growth", intensity: "deep" },
  { id: "fam_val_053", deckId: "family_values", question: "What does it mean to be a 'good' parent in this family?", category: "Growth", intensity: "medium" },
  { id: "fam_val_054", deckId: "family_values", question: "How do we help each other grow without being overbearing?", category: "Growth", intensity: "deep" },
  { id: "fam_val_055", deckId: "family_values", question: "What is the proudest moment you’ve had as a member of this family?", category: "Growth", intensity: "medium" },

  //   Category: The Future of the Family
  { id: "fam_val_056", deckId: "family_values", question: "What is the biggest challenge facing our family in the next 5 years?", category: "Future", intensity: "deep" },
  { id: "fam_val_057", deckId: "family_values", question: "Where do you see us all gathering for the holidays in 10 years?", category: "Future", intensity: "mild" },
  { id: "fam_val_058", deckId: "family_values", question: "What is one dream you have for the younger generation of our family?", category: "Future", intensity: "medium" },
  { id: "fam_val_059", deckId: "family_values", question: "How can we better support each other’s individual dreams this year?", category: "Future", intensity: "medium" },
  { id: "fam_val_060", deckId: "family_values", question: "If our family had a motto, what would it be?", category: "Future", intensity: "medium" },

  //   Category: Individual Appreciation
  { id: "grat_001", deckId: "family_gratitude", question: "What is one quality in the person to your left that you truly admire?", category: "Appreciation", intensity: "medium" },
  { id: "grat_002", deckId: "family_gratitude", question: "Who in this family always knows how to make you laugh when you’re down?", category: "Appreciation", intensity: "mild" },
  { id: "grat_003", deckId: "family_gratitude", question: "Which family member has taught you the most about kindness?", category: "Appreciation", intensity: "medium" },
  { id: "grat_004", deckId: "family_gratitude", question: "What is a 'small thing' someone here does regularly that you really appreciate?", category: "Appreciation", intensity: "medium" },
  { id: "grat_005", deckId: "family_gratitude", question: "Who in this room is the best at listening without judging?", category: "Appreciation", intensity: "medium" },

  //   Category: Memories & Milestones
  { id: "grat_006", deckId: "family_gratitude", question: "What is a family memory that always makes you feel warm and fuzzy?", category: "Memories", intensity: "mild" },
  { id: "grat_007", deckId: "family_gratitude", question: "Looking back at the last year, what is one family win you are most thankful for?", category: "Memories", intensity: "medium" },
  { id: "grat_008", deckId: "family_gratitude", question: "What was a time the family 'showed up' for you when you needed it most?", category: "Memories", intensity: "deep" },
  { id: "grat_009", deckId: "family_gratitude", question: "What is the best piece of advice a family member gave you this year?", category: "Memories", intensity: "medium" },
  { id: "grat_010", deckId: "family_gratitude", question: "Which family tradition are you most grateful we still practice?", category: "Memories", intensity: "mild" },

  //   Category: Shared Strengths
  { id: "grat_011", deckId: "family_gratitude", question: "What do you think is our family's greatest 'superpower'?", category: "Strengths", intensity: "medium" },
  { id: "grat_012", deckId: "family_gratitude", question: "What is one thing our family has overcome that made you proud to be a part of it?", category: "Strengths", intensity: "deep" },
  { id: "grat_013", deckId: "family_gratitude", question: "How has being part of this family made you a better person?", category: "Strengths", intensity: "deep" },
  { id: "grat_014", deckId: "family_gratitude", question: "What is a value we all share that you are most thankful for?", category: "Strengths", intensity: "medium" },
  { id: "grat_015", deckId: "family_gratitude", question: "What is one 'unspoken' strength our family has?", category: "Strengths", intensity: "medium" },

  //   Category: Acts of Service
  { id: "grat_016", deckId: "family_gratitude", question: "Who is the 'unsung hero' of our family who does so much behind the scenes?", category: "Service", intensity: "medium" },
  { id: "grat_017", deckId: "family_gratitude", question: "What’s the most thoughtful gift or gesture you’ve ever received from a family member?", category: "Service", intensity: "medium" },
  { id: "grat_018", deckId: "family_gratitude", question: "Who in the family is always the first to volunteer to help out?", category: "Service", intensity: "mild" },
  { id: "grat_019", deckId: "family_gratitude", question: "What is one way the family supports your dreams or hobbies?", category: "Service", intensity: "medium" },
  { id: "grat_020", deckId: "family_gratitude", question: "Thank a family member right now for something they did recently.", category: "Service", intensity: "medium" },

  //   Category: Presence & Belonging
  { id: "grat_021", deckId: "family_gratitude", question: "What does 'home' mean to you, and how does this family create that feeling?", category: "Belonging", intensity: "deep" },
  { id: "grat_022", deckId: "family_gratitude", question: "What is a 'quirk' of our family that you actually find really endearing?", category: "Belonging", intensity: "mild" },
  { id: "grat_023", deckId: "family_gratitude", question: "When do you feel most 'seen' and 'understood' by this family?", category: "Belonging", intensity: "deep" },
  { id: "grat_024", deckId: "family_gratitude", question: "What is the best part about being a [Your Last Name]?", category: "Belonging", intensity: "medium" },
  { id: "grat_025", deckId: "family_gratitude", question: "How does our family make you feel safe?", category: "Belonging", intensity: "deep" },

  //   Category: Future Gratitude
  { id: "grat_026", deckId: "family_gratitude", question: "What are you most looking forward to doing with the family in the next year?", category: "Future", intensity: "mild" },
  { id: "grat_027", deckId: "family_gratitude", question: "What is one legacy from this family you hope to pass on to others?", category: "Future", intensity: "deep" },
  { id: "grat_028", deckId: "family_gratitude", question: "How can we continue to show more appreciation for each other every day?", category: "Future", intensity: "medium" },
  { id: "grat_029", deckId: "family_gratitude", question: "What is a hope you have for the person sitting across from you?", category: "Future", intensity: "medium" },
  { id: "grat_030", deckId: "family_gratitude", question: "If you could tell the 'future version' of our family one thing to be grateful for, what would it be?", category: "Future", intensity: "deep" },

  //   Category: Small Joys
  { id: "grat_031", deckId: "family_gratitude", question: "What is your favorite 'family meal' that always brings everyone together?", category: "Small Joys", intensity: "mild" },
  { id: "grat_032", deckId: "family_gratitude", question: "Which family pet (past or present) are you most thankful for?", category: "Small Joys", intensity: "mild" },
  { id: "grat_033", deckId: "family_gratitude", question: "What is the funniest thing that has happened at a family gathering?", category: "Small Joys", intensity: "mild" },
  { id: "grat_034", deckId: "family_gratitude", question: "What is one 'inside joke' we have that you love?", category: "Small Joys", intensity: "mild" },
  { id: "grat_035", deckId: "family_gratitude", question: "What is a song or movie that always reminds you of a happy family time?", category: "Small Joys", intensity: "mild" },

  //   Category: Deep Recognition
  { id: "grat_036", deckId: "family_gratitude", question: "Who in the family has overcome the most, and how does that inspire you?", category: "Recognition", intensity: "deep" },
  { id: "grat_037", deckId: "family_gratitude", question: "What is a sacrifice a family member made for you that you're only now beginning to understand?", category: "Recognition", intensity: "deep" },
  { id: "grat_038", deckId: "family_gratitude", question: "In what way has a family member been a 'hero' in your life?", category: "Recognition", intensity: "deep" },
  { id: "grat_039", deckId: "family_gratitude", question: "If you had to write a 'thank you' note to the whole family, what would the first sentence say?", category: "Recognition", intensity: "medium" },
  { id: "grat_040", deckId: "family_gratitude", question: "What is the most beautiful thing about our family dynamic?", category: "Recognition", intensity: "medium" },

  //   Category: Growth & Change
  { id: "grat_041", deckId: "family_gratitude", question: "How has our family grown closer in the last few years?", category: "Growth", intensity: "medium" },
  { id: "grat_042", deckId: "family_gratitude", question: "What is one thing you used to take for granted about this family but now cherish?", category: "Growth", intensity: "medium" },
  { id: "grat_043", deckId: "family_gratitude", question: "Which family member has helped you change your perspective for the better?", category: "Growth", intensity: "deep" },
  { id: "grat_044", deckId: "family_gratitude", question: "What is a new tradition or habit we’ve started that you’re thankful for?", category: "Growth", intensity: "mild" },
  { id: "grat_045", deckId: "family_gratitude", question: "How do you think our family will continue to evolve in a positive way?", category: "Growth", intensity: "medium" },

  //   Category: Wisdom & Mentorship
  { id: "grat_046", deckId: "family_gratitude", question: "Who is the wisest person in the family, and what is one 'gem' they’ve shared?", category: "Wisdom", intensity: "medium" },
  { id: "grat_047", deckId: "family_gratitude", question: "Which family member's life story is most inspiring to you?", category: "Wisdom", intensity: "medium" },
  { id: "grat_048", deckId: "family_gratitude", question: "What is a skill you learned from a family member that you use every day?", category: "Wisdom", intensity: "mild" },
  { id: "grat_049", deckId: "family_gratitude", question: "How does our family encourage you to be your best self?", category: "Wisdom", intensity: "deep" },
  { id: "grat_050", deckId: "family_gratitude", question: "What is one lesson about love you’ve learned just by watching this family?", category: "Wisdom", intensity: "deep" },

  //   Category: Parenting & Ancestry
  { id: "grat_051", deckId: "family_gratitude", question: "What is something our parents/grandparents did 'right' that you want to mirror?", category: "Ancestry", intensity: "medium" },
  { id: "grat_052", deckId: "family_gratitude", question: "What ancestor’s story are you most grateful was passed down to you?", category: "Ancestry", intensity: "medium" },
  { id: "grat_053", deckId: "family_gratitude", question: "How does knowing our family history make you feel more grounded?", category: "Ancestry", intensity: "deep" },
  { id: "grat_054", deckId: "family_gratitude", question: "What is one thing the older generation has taught the younger generation here?", category: "Ancestry", intensity: "medium" },
  { id: "grat_055", deckId: "family_gratitude", question: "What is one thing the younger generation has taught the older generation here?", category: "Ancestry", intensity: "medium" },

  //   Category: Final Reflections
  { id: "grat_056", deckId: "family_gratitude", question: "What’s one thing you want to make sure you say to everyone here today?", category: "Reflection", intensity: "deep" },
  { id: "grat_057", deckId: "family_gratitude", question: "If you could summarize our family in one word, what would it be?", category: "Reflection", intensity: "medium" },
  { id: "grat_058", deckId: "family_gratitude", question: "How do you feel right now after sharing these gratitudes?", category: "Reflection", intensity: "medium" },
  { id: "grat_059", deckId: "family_gratitude", question: "What is one promise you can make to the family to keep this positive energy going?", category: "Reflection", intensity: "deep" },
  { id: "grat_060", deckId: "family_gratitude", question: "Finish this sentence: 'I am lucky to be in this family because...'", category: "Reflection", intensity: "deep" },

  //   Category: Back in My Day
  { id: "gen_001", deckId: "family_generations", question: "What was considered 'cool' when you were a teenager that is embarrassing now?", category: "Back in My Day", intensity: "mild" },
  { id: "gen_002", deckId: "family_generations", question: "What was your very first car, and how much did it cost?", category: "Back in My Day", intensity: "mild" },
  { id: "gen_003", deckId: "family_generations", question: "How did you spend your Friday nights before the internet existed?", category: "Back in My Day", intensity: "medium" },
  { id: "gen_004", deckId: "family_generations", question: "What was the most scandalous thing you ever did as a young adult?", category: "Back in My Day", intensity: "medium" },
  { id: "gen_005", deckId: "family_generations", question: "What was the 'must-have' fashion item when you were in high school?", category: "Back in My Day", intensity: "mild" },
  { id: "gen_006", deckId: "family_generations", question: "How did you stay in touch with friends before cell phones?", category: "Back in My Day", intensity: "mild" },
  { id: "gen_007", deckId: "family_generations", question: "What was your first job, and what was the hourly wage?", category: "Back in My Day", intensity: "mild" },
  { id: "gen_008", deckId: "family_generations", question: "Who was the 'it' celebrity when you were 20?", category: "Back in My Day", intensity: "mild" },
  { id: "gen_009", deckId: "family_generations", question: "What is a piece of technology you remember being 'cutting edge' that is now obsolete?", category: "Back in My Day", intensity: "mild" },
  { id: "gen_010", deckId: "family_generations", question: "What was the first major news event you remember seeing on TV?", category: "Back in My Day", intensity: "medium" },

  //   Category: Youth to Elder
  { id: "gen_011", deckId: "family_generations", question: "To an elder: What is one thing about today’s world that confuses you the most?", category: "Youth to Elder", intensity: "medium" },
  { id: "gen_012", deckId: "family_generations", question: "To an elder: What was the hardest year of your life, and how did you get through it?", category: "Youth to Elder", intensity: "deep" },
  { id: "gen_013", deckId: "family_generations", question: "To an elder: If you could go back to any age for one day, what age would it be?", category: "Youth to Elder", intensity: "medium" },
  { id: "gen_014", deckId: "family_generations", question: "To an elder: What is the secret to a long-lasting friendship or marriage?", category: "Youth to Elder", intensity: "deep" },
  { id: "gen_015", deckId: "family_generations", question: "To an elder: What was your favorite song to dance to at our age?", category: "Youth to Elder", intensity: "mild" },
  { id: "gen_016", deckId: "family_generations", question: "To an elder: What did your parents tell you that you finally realize was true?", category: "Youth to Elder", intensity: "medium" },
  { id: "gen_017", deckId: "family_generations", question: "To an elder: What is the biggest risk you ever took?", category: "Youth to Elder", intensity: "deep" },
  { id: "gen_018", deckId: "family_generations", question: "To an elder: What was the first 'big purchase' you ever saved up for?", category: "Youth to Elder", intensity: "mild" },
  { id: "gen_019", deckId: "family_generations", question: "To an elder: What is one thing you miss about the world as it was 30 years ago?", category: "Youth to Elder", intensity: "medium" },
  { id: "gen_020", deckId: "family_generations", question: "To an elder: What is your proudest non-work achievement?", category: "Youth to Elder", intensity: "deep" },

  //   Category: Elder to Youth
  { id: "gen_021", deckId: "family_generations", question: "To a younger person: What do you think is the hardest part about being an adult?", category: "Elder to Youth", intensity: "medium" },
  { id: "gen_022", deckId: "family_generations", question: "To a younger person: What is a slang word you use that you think I don't know?", category: "Elder to Youth", intensity: "mild" },
  { id: "gen_023", deckId: "family_generations", question: "To a younger person: What is your biggest dream for your future?", category: "Elder to Youth", intensity: "medium" },
  { id: "gen_024", deckId: "family_generations", question: "To a younger person: How do you decide who to trust online?", category: "Elder to Youth", intensity: "medium" },
  { id: "gen_025", deckId: "family_generations", question: "To a younger person: What is one thing you wish your parents understood about your world?", category: "Elder to Youth", intensity: "deep" },
  { id: "gen_026", deckId: "family_generations", question: "To a younger person: What is your favorite way to spend your 'screen time'?", category: "Elder to Youth", intensity: "mild" },
  { id: "gen_027", deckId: "family_generations", question: "To a younger person: Do you feel more or less pressure to succeed than your parents did?", category: "Elder to Youth", intensity: "deep" },
  { id: "gen_028", deckId: "family_generations", question: "To a younger person: What is the 'best' app on your phone right now?", category: "Elder to Youth", intensity: "mild" },
  { id: "gen_029", deckId: "family_generations", question: "To a younger person: What do you think life will be like when you are my age?", category: "Elder to Youth", intensity: "medium" },
  { id: "gen_030", deckId: "family_generations", question: "To a younger person: What is one 'old person' habit you hope you never get?", category: "Elder to Youth", intensity: "mild" },

  //   Category: Then vs Now
  { id: "gen_031", deckId: "family_generations", question: "What is cheaper now than it was when you were a kid?", category: "Then vs Now", intensity: "mild" },
  { id: "gen_032", deckId: "family_generations", question: "Compare your first 'date' stories—who had it easier?", category: "Then vs Now", intensity: "medium" },
  { id: "gen_033", deckId: "family_generations", question: "What was the 'internet' of your generation? (Radio? Encyclopedia?)", category: "Then vs Now", intensity: "mild" },
  { id: "gen_034", deckId: "family_generations", question: "Which generation had the best music? Fight for your decade.", category: "Then vs Now", intensity: "mild" },
  { id: "gen_035", deckId: "family_generations", question: "What is a 'skill' that used to be common but is now rare?", category: "Then vs Now", intensity: "medium" },
  { id: "gen_036", deckId: "family_generations", question: "Is the world safer or more dangerous now than it was 40 years ago?", category: "Then vs Now", intensity: "deep" },
  { id: "gen_037", deckId: "family_generations", question: "Compare your favorite school lunches—who was eating better?", category: "Then vs Now", intensity: "mild" },
  { id: "gen_038", deckId: "family_generations", question: "What was the 'viral trend' of your youth (e.g. Pet Rocks, Pogs)?", category: "Then vs Now", intensity: "mild" },
  { id: "gen_039", deckId: "family_generations", question: "Who had the harder chores growing up?", category: "Then vs Now", intensity: "mild" },
  { id: "gen_040", deckId: "family_generations", question: "If we traded places for a day, who would survive longer?", category: "Then vs Now", intensity: "medium" },

  //   Category: Wisdom & Regrets
  { id: "gen_041", deckId: "family_generations", question: "What is the best piece of advice your own grandparents gave you?", category: "Wisdom", intensity: "medium" },
  { id: "gen_042", deckId: "family_generations", question: "What is one thing you spent too much time worrying about when you were younger?", category: "Wisdom", intensity: "deep" },
  { id: "gen_043", deckId: "family_generations", question: "What is the secret to staying young at heart?", category: "Wisdom", intensity: "medium" },
  { id: "gen_044", deckId: "family_generations", question: "If you could change one decision from your 20s, what would it be?", category: "Wisdom", intensity: "deep" },
  { id: "gen_045", deckId: "family_generations", question: "What is the most important thing you’ve learned about money over the years?", category: "Wisdom", intensity: "medium" },
  { id: "gen_046", deckId: "family_generations", question: "What is one thing you’ve learned to 'let go' of as you’ve aged?", category: "Wisdom", intensity: "deep" },
  { id: "gen_047", deckId: "family_generations", question: "What is the most beautiful place you’ve ever seen with your own eyes?", category: "Wisdom", intensity: "mild" },
  { id: "gen_048", deckId: "family_generations", question: "What do you want your great-grandchildren to know about you?", category: "Wisdom", intensity: "deep" },
  { id: "gen_049", deckId: "family_generations", question: "What is the one thing you are most grateful for in your life right now?", category: "Wisdom", intensity: "deep" },
  { id: "gen_050", deckId: "family_generations", question: "What is a 'hard truth' you’ve come to accept about life?", category: "Wisdom", intensity: "deep" },

  //   Category: Tech & The Future
  { id: "gen_051", deckId: "family_generations", question: "What invention from your lifetime has changed your life the most?", category: "Future", intensity: "medium" },
  { id: "gen_052", deckId: "family_generations", question: "Do you think AI will be good or bad for our family’s future?", category: "Future", intensity: "medium" },
  { id: "gen_053", deckId: "family_generations", question: "What is one thing you hope *never* changes about the world?", category: "Future", intensity: "deep" },
  { id: "gen_054", deckId: "family_generations", question: "If you could see 50 years into the future, what would you look for first?", category: "Future", intensity: "medium" },
  { id: "gen_055", deckId: "family_generations", question: "What is one 'old' tradition you think we should bring back for the new age?", category: "Future", intensity: "medium" },
  { id: "gen_056", deckId: "family_generations", question: "What is the most 'science fiction' thing that has actually come true?", category: "Future", intensity: "mild" },
  { id: "gen_057", deckId: "family_generations", question: "How do you think families will communicate 100 years from now?", category: "Future", intensity: "medium" },
  { id: "gen_058", deckId: "family_generations", question: "What is a 'future problem' you are glad you won't have to deal with?", category: "Future", intensity: "medium" },
  { id: "gen_059", deckId: "family_generations", question: "What is one thing the youth can teach the elders about the modern world?", category: "Future", intensity: "medium" },
  { id: "gen_060", deckId: "family_generations", question: "If we were to put one item from this room into a 100-year time capsule, what should it be?", category: "Future", intensity: "mild" },

  //   Category: Holiday Magic
  { id: "trad_001", deckId: "family_traditions", question: "What is the most 'non-negotiable' part of our holiday celebrations?", category: "Holiday", intensity: "mild" },
  { id: "trad_002", deckId: "family_traditions", question: "What is the funniest thing that has ever happened during a family holiday?", category: "Holiday", intensity: "mild" },
  { id: "trad_003", deckId: "family_traditions", question: "Who is the 'official' host of the holidays, and what would happen if they stopped?", category: "Holiday", intensity: "medium" },
  { id: "trad_004", deckId: "family_traditions", question: "Do we have a 'secret' tradition that we don't tell people outside the family about?", category: "Holiday", intensity: "medium" },
  { id: "trad_005", deckId: "family_traditions", question: "What is the worst gift anyone in this family has ever received?", category: "Holiday", intensity: "mild" },
  { id: "trad_006", deckId: "family_traditions", question: "If we could spend one holiday in a different country, where are we going?", category: "Holiday", intensity: "mild" },
  { id: "trad_007", deckId: "family_traditions", question: "What was the best 'surprise' that ever happened during a family gathering?", category: "Holiday", intensity: "medium" },
  { id: "trad_008", deckId: "family_traditions", question: "Do we have any holiday traditions that you secretly find annoying?", category: "Holiday", intensity: "deep" },
  { id: "trad_009", deckId: "family_traditions", question: "What is the first holiday memory that comes to mind right now?", category: "Holiday", intensity: "mild" },
  { id: "trad_010", deckId: "family_traditions", question: "How has our way of celebrating changed as the kids have gotten older?", category: "Holiday", intensity: "medium" },

  //   Category: The Secret Ingredient
  { id: "trad_011", deckId: "family_traditions", question: "Which family recipe is the most 'sacred' to us?", category: "Food", intensity: "mild" },
  { id: "trad_012", deckId: "family_traditions", question: "Who in the family is the 'gatekeeper' of the best recipes?", category: "Food", intensity: "mild" },
  { id: "trad_013", deckId: "family_traditions", question: "What is the one dish that *must* be on the table for us to feel at home?", category: "Food", intensity: "medium" },
  { id: "trad_014", deckId: "family_traditions", question: "What was the biggest 'food disaster' in family history?", category: "Food", intensity: "mild" },
  { id: "trad_015", deckId: "family_traditions", question: "Is there a specific 'smell' that instantly reminds you of a family Sunday?", category: "Food", intensity: "mild" },
  { id: "trad_016", deckId: "family_traditions", question: "If we were to open a family restaurant, what would it be called and what’s the star dish?", category: "Food", intensity: "mild" },
  { id: "trad_017", deckId: "family_traditions", question: "Which family member is surprisingly the best cook (or worst)?", category: "Food", intensity: "mild" },
  { id: "trad_018", deckId: "family_traditions", question: "Do we have a 'tradition' of going to a specific restaurant for special occasions?", category: "Food", intensity: "mild" },
  { id: "trad_019", deckId: "family_traditions", question: "What is the weirdest food combination that our family actually likes?", category: "Food", intensity: "medium" },
  { id: "trad_020", deckId: "family_traditions", question: "If you could only eat one family meal for the rest of your life, what is it?", category: "Food", intensity: "medium" },

  //   Category: Everyday Rituals
  { id: "trad_021", deckId: "family_traditions", question: "What is our family’s 'unspoken ritual' on a Saturday morning?", category: "Daily", intensity: "mild" },
  { id: "trad_022", deckId: "family_traditions", question: "How does our family handle 'bad days'? Is there a ritual for cheering each other up?", category: "Daily", intensity: "medium" },
  { id: "trad_023", deckId: "family_traditions", question: "What is the first thing we do when we all get back together after being apart?", category: "Daily", intensity: "medium" },
  { id: "trad_024", deckId: "family_traditions", question: "Do we have a 'signature' family movie or TV show we watch together?", category: "Daily", intensity: "mild" },
  { id: "trad_025", deckId: "family_traditions", question: "What is the one 'chore' that someone in this family always does without being asked?", category: "Daily", intensity: "mild" },
  { id: "trad_026", deckId: "family_traditions", question: "Do we have a 'family group chat' ritual or habit?", category: "Daily", intensity: "mild" },
  { id: "trad_027", deckId: "family_traditions", question: "What is the most 'us' way to spend a rainy afternoon?", category: "Daily", intensity: "mild" },
  { id: "trad_028", deckId: "family_traditions", question: "How do we celebrate 'small wins' (like a good grade or a promotion)?", category: "Daily", intensity: "medium" },
  { id: "trad_029", deckId: "family_traditions", question: "What is one 'quirk' of our home that you’ve grown to love?", category: "Daily", intensity: "mild" },
  { id: "trad_030", deckId: "family_traditions", question: "Who is the 'official' timekeeper of the family who makes sure we’re never late?", category: "Daily", intensity: "mild" },

  //   Category: Birthdays & Milestones
  { id: "trad_031", deckId: "family_traditions", question: "What is our family’s 'standard' birthday breakfast?", category: "Milestones", intensity: "mild" },
  { id: "trad_032", deckId: "family_traditions", question: "Do we have a 'special' way of opening gifts in this family?", category: "Milestones", intensity: "mild" },
  { id: "trad_033", deckId: "family_traditions", question: "What was the most memorable 'milestone' birthday we ever celebrated?", category: "Milestones", intensity: "medium" },
  { id: "trad_034", deckId: "family_traditions", question: "How do we handle 'coming of age' moments (graduation, first job, etc)?", category: "Milestones", intensity: "medium" },
  { id: "trad_035", deckId: "family_traditions", question: "If you could invent a new 'Family Holiday,' what would it celebrate?", category: "Milestones", intensity: "mild" },
  { id: "trad_036", deckId: "family_traditions", question: "What is the one thing we *always* say to each other on birthdays?", category: "Milestones", intensity: "mild" },
  { id: "trad_037", deckId: "family_traditions", question: "Which family member is the 'party planner' of the group?", category: "Milestones", intensity: "mild" },
  { id: "trad_038", deckId: "family_traditions", question: "What is the best surprise party we’ve ever thrown?", category: "Milestones", intensity: "medium" },
  { id: "trad_039", deckId: "family_traditions", question: "How do we honor those in the family who are no longer with us during milestones?", category: "Milestones", intensity: "deep" },
  { id: "trad_040", deckId: "family_traditions", question: "What is the most 'over-the-top' celebration we’ve ever had?", category: "Milestones", intensity: "medium" },

  //   Category: Travel & Adventures
  { id: "trad_041", deckId: "family_traditions", question: "What is the 'official' family road trip snack?", category: "Travel", intensity: "mild" },
  { id: "trad_042", deckId: "family_traditions", question: "Who is the 'designated driver' and who is the 'designated DJ' on trips?", category: "Travel", intensity: "mild" },
  { id: "trad_043", deckId: "family_traditions", question: "What is the one place we’ve visited that we *must* go back to?", category: "Travel", intensity: "medium" },
  { id: "trad_044", deckId: "family_traditions", question: "Do we have a travel 'tradition' (like a specific photo we always take)?", category: "Travel", intensity: "mild" },
  { id: "trad_045", deckId: "family_traditions", question: "What was the most 'unplanned' adventure our family ever had?", category: "Travel", intensity: "medium" },
  { id: "trad_046", deckId: "family_traditions", question: "What is the one thing everyone in this family packs that we never actually use?", category: "Travel", intensity: "mild" },
  { id: "trad_047", deckId: "family_traditions", question: "Who is the most likely to get 'lost' on a family vacation?", category: "Travel", intensity: "mild" },
  { id: "trad_048", deckId: "family_traditions", question: "What is the 'best' family trip we ever took on a budget?", category: "Travel", intensity: "medium" },
  { id: "trad_049", deckId: "family_traditions", question: "What is our 'dream' family vacation if money were no object?", category: "Travel", intensity: "mild" },
  { id: "trad_050", deckId: "family_traditions", question: "What is the 'lesson' we learn every single time we travel together?", category: "Travel", intensity: "medium" },

  //   Category: The Future of 'Us'
  { id: "trad_051", deckId: "family_traditions", question: "Which current tradition do you hope the younger generation keeps forever?", category: "Future", intensity: "deep" },
  { id: "trad_052", deckId: "family_traditions", question: "What is a 'new' tradition we started recently that you actually like?", category: "Future", intensity: "medium" },
  { id: "trad_053", deckId: "family_traditions", question: "If we had to retire one old tradition today, which one would it be?", category: "Future", intensity: "deep" },
  { id: "trad_054", deckId: "family_traditions", question: "How do we make sure our traditions stay inclusive as the family grows?", category: "Future", intensity: "deep" },
  { id: "trad_055", deckId: "family_traditions", question: "What is one thing about our family dynamic that you hope *never* changes?", category: "Future", intensity: "deep" },
  { id: "trad_056", deckId: "family_traditions", question: "What is the 'legacy' of our traditions? What do they say about us?", category: "Future", intensity: "deep" },
  { id: "trad_057", deckId: "family_traditions", question: "If you could pick one 'theme song' for our family traditions, what is it?", category: "Future", intensity: "mild" },
  { id: "trad_058", deckId: "family_traditions", question: "How do we want our holiday table to look in 20 years?", category: "Future", intensity: "medium" },
  { id: "trad_059", deckId: "family_traditions", question: "What is one 'story' we tell at every gathering that we should write down?", category: "Future", intensity: "medium" },
  { id: "trad_060", deckId: "family_traditions", question: "If we were a 'tradition' ourselves, what would we be?", category: "Future", intensity: "deep" },

  //   Category: Growing Up Together
  { id: "sib_001", deckId: "family_sibling_rivalry", question: "Who was actually the 'favorite child' growing up?", category: "History", intensity: "medium" },
  { id: "sib_002", deckId: "family_sibling_rivalry", question: "What was the most ridiculous thing we ever fought over?", category: "History", intensity: "mild" },
  { id: "sib_003", deckId: "family_sibling_rivalry", question: "Who was more likely to get away with 'murder' when it came to chores?", category: "History", intensity: "mild" },
  { id: "sib_004", deckId: "family_sibling_rivalry", question: "What is a secret we kept from our parents that they still don't know today?", category: "History", intensity: "deep" },
  { id: "sib_005", deckId: "family_sibling_rivalry", question: "Who was the 'tattletale' and who was the 'rebel'?", category: "History", intensity: "mild" },
  { id: "sib_006", deckId: "family_sibling_rivalry", question: "What was our go-to game to play when we were bored as kids?", category: "History", intensity: "mild" },
  { id: "sib_007", deckId: "family_sibling_rivalry", question: "Which one of us was the messiest in our shared spaces?", category: "History", intensity: "mild" },
  { id: "sib_008", deckId: "family_sibling_rivalry", question: "Do you remember the first time we actually got along as friends, not just siblings?", category: "History", intensity: "medium" },
  { id: "sib_009", deckId: "family_sibling_rivalry", question: "Who had the more embarrassing 'angsty teen' phase?", category: "History", intensity: "mild" },
  { id: "sib_010", deckId: "family_sibling_rivalry", question: "What is one item of yours I 'borrowed' and never actually returned?", category: "History", intensity: "mild" },

  //   Category: Most Likely To...
  { id: "sib_011", deckId: "family_sibling_rivalry", question: "Who is most likely to forget a parent’s birthday?", category: "Most Likely", intensity: "mild" },
  { id: "sib_012", deckId: "family_sibling_rivalry", question: "Who is most likely to end up 'hosting' the family in the future?", category: "Most Likely", intensity: "medium" },
  { id: "sib_013", deckId: "family_sibling_rivalry", question: "Who is most likely to cry during a sentimental movie?", category: "Most Likely", intensity: "mild" },
  { id: "sib_014", deckId: "family_sibling_rivalry", question: "Who is most likely to survive a horror movie based on their childhood survival skills?", category: "Most Likely", intensity: "mild" },
  { id: "sib_015", deckId: "family_sibling_rivalry", question: "Who is most likely to be the 'fun' aunt or uncle?", category: "Most Likely", intensity: "mild" },
  { id: "sib_016", deckId: "family_sibling_rivalry", question: "Who is most likely to spend their inheritance on something completely impractical?", category: "Most Likely", intensity: "medium" },
  { id: "sib_017", deckId: "family_sibling_rivalry", question: "Who is most likely to win an argument with our parents today?", category: "Most Likely", intensity: "medium" },
  { id: "sib_018", deckId: "family_sibling_rivalry", question: "Who is most likely to disappear to a different country without telling anyone?", category: "Most Likely", intensity: "medium" },
  { id: "sib_019", deckId: "family_sibling_rivalry", question: "Who is most likely to start a family group chat and then never reply to it?", category: "Most Likely", intensity: "mild" },
  { id: "sib_020", deckId: "family_sibling_rivalry", question: "Who was most likely to be the 'leader' of our childhood adventures?", category: "Most Likely", intensity: "mild" },

  //   Category: Personalities & Roles
  { id: "sib_021", deckId: "family_sibling_rivalry", question: "Which of our parents do you think you take after more?", category: "Roles", intensity: "medium" },
  { id: "sib_022", deckId: "family_sibling_rivalry", question: "What is one personality trait of mine that you find most annoying but very 'us'?", category: "Roles", intensity: "medium" },
  { id: "sib_023", deckId: "family_sibling_rivalry", question: "How would you describe my 'role' in the family in just three words?", category: "Roles", intensity: "medium" },
  { id: "sib_024", deckId: "family_sibling_rivalry", question: "What is a 'hidden talent' of yours that I’ve always been secretly jealous of?", category: "Roles", intensity: "medium" },
  { id: "sib_025", deckId: "family_sibling_rivalry", question: "Do you think we’d be friends if we weren't actually related?", category: "Roles", intensity: "deep" },
  { id: "sib_026", deckId: "family_sibling_rivalry", question: "What is one thing I do that makes you feel like an 'older/younger' sibling regardless of age?", category: "Roles", intensity: "medium" },
  { id: "sib_027", deckId: "family_sibling_rivalry", question: "Who is the 'peacekeeper' when the family starts bickering?", category: "Roles", intensity: "mild" },
  { id: "sib_028", deckId: "family_sibling_rivalry", question: "What’s the best piece of advice I’ve ever given you (even if you didn't follow it)?", category: "Roles", intensity: "medium" },
  { id: "sib_029", deckId: "family_sibling_rivalry", question: "How has our relationship changed since we became adults?", category: "Roles", intensity: "deep" },
  { id: "sib_030", deckId: "family_sibling_rivalry", question: "What is one thing you’ve always wanted to say to me but haven't?", category: "Roles", intensity: "deep" },

  //   Category: Shared Scandals
  { id: "sib_031", deckId: "family_sibling_rivalry", question: "What was the biggest lie we ever told together to cover for each other?", category: "Scandals", intensity: "medium" },
  { id: "sib_032", deckId: "family_sibling_rivalry", question: "Who was the 'bad influence' on who?", category: "Scandals", intensity: "mild" },
  { id: "sib_033", deckId: "family_sibling_rivalry", question: "Which one of us got the worst grades, and how did we hide it?", category: "Scandals", intensity: "medium" },
  { id: "sib_034", deckId: "family_sibling_rivalry", question: "Who was the first one to get caught 'sneaking out'?", category: "Scandals", intensity: "mild" },
  { id: "sib_035", deckId: "family_sibling_rivalry", question: "What was the most epic prank one of us pulled on the other?", category: "Scandals", intensity: "mild" },
  { id: "sib_036", deckId: "family_sibling_rivalry", question: "Have you ever blamed me for something YOU did? Time to confess.", category: "Scandals", intensity: "medium" },
  { id: "sib_037", deckId: "family_sibling_rivalry", question: "Who is better at lying to our parents today?", category: "Scandals", intensity: "medium" },
  { id: "sib_038", deckId: "family_sibling_rivalry", question: "What is the most 'illegal' thing we did as kids that seemed normal at the time?", category: "Scandals", intensity: "medium" },
  { id: "sib_039", deckId: "family_sibling_rivalry", question: "Who was more likely to lose their cool during a long car ride?", category: "Scandals", intensity: "mild" },
  { id: "sib_040", deckId: "family_sibling_rivalry", question: "What was our biggest 'team win' against our parents' rules?", category: "Scandals", intensity: "medium" },

  //   Category: Sibling Support
  { id: "sib_041", deckId: "family_sibling_rivalry", question: "When did you first realize I would always have your back?", category: "Support", intensity: "deep" },
  { id: "sib_042", deckId: "family_sibling_rivalry", question: "What is one thing I’m going through right now that you want to support me with?", category: "Support", intensity: "deep" },
  { id: "sib_043", deckId: "family_sibling_rivalry", question: "If I needed a kidney, would you give me yours? (No pressure!)", category: "Support", intensity: "medium" },
  { id: "sib_044", deckId: "family_sibling_rivalry", question: "What is one strength of mine that you hope our future kids inherit?", category: "Support", intensity: "deep" },
  { id: "sib_045", deckId: "family_sibling_rivalry", question: "If you were in trouble, why would I be the first person you'd call?", category: "Support", intensity: "medium" },
  { id: "sib_046", deckId: "family_sibling_rivalry", question: "How can I be a better sibling to you in this stage of our lives?", category: "Support", intensity: "deep" },
  { id: "sib_047", deckId: "family_sibling_rivalry", question: "What is one thing you’re proud of me for that I don’t know about?", category: "Support", intensity: "deep" },
  { id: "sib_048", deckId: "family_sibling_rivalry", question: "Who is more protective of the other?", category: "Support", intensity: "medium" },
  { id: "sib_049", deckId: "family_sibling_rivalry", question: "What is our 'safest' topic of conversation when we're stressed?", category: "Support", intensity: "mild" },
  { id: "sib_050", deckId: "family_sibling_rivalry", question: "What is one 'tradition' just for us that we should start this year?", category: "Support", intensity: "medium" },

  //   Category: Fun Wildcards
  { id: "sib_051", deckId: "family_sibling_rivalry", question: "If we were in a survival game, who dies first and why?", category: "Wildcards", intensity: "mild" },
  { id: "sib_052", deckId: "family_sibling_rivalry", question: "What is my most annoying habit when I’m at home?", category: "Wildcards", intensity: "mild" },
  { id: "sib_053", deckId: "family_sibling_rivalry", question: "If we traded lives for a day, what’s the first thing you’d do as me?", category: "Wildcards", intensity: "medium" },
  { id: "sib_054", deckId: "family_sibling_rivalry", question: "What’s the 'worst' meal I’ve ever made or forced you to eat?", category: "Wildcards", intensity: "mild" },
  { id: "sib_055", deckId: "family_sibling_rivalry", question: "Which one of us is our parents' 'backup plan'?", category: "Wildcards", intensity: "medium" },
  { id: "sib_056", deckId: "family_sibling_rivalry", question: "What is the funniest face I make when I’m angry?", category: "Wildcards", intensity: "mild" },
  { id: "sib_057", deckId: "family_sibling_rivalry", question: "If we were a two-person band, what would we be called?", category: "Wildcards", intensity: "mild" },
  { id: "sib_058", deckId: "family_sibling_rivalry", question: "What’s my most used emoji in our texts?", category: "Wildcards", intensity: "mild" },
  { id: "sib_059", deckId: "family_sibling_rivalry", question: "Who is the 'main character' in our sibling dynamic?", category: "Wildcards", intensity: "medium" },
  { id: "sib_060", deckId: "family_sibling_rivalry", question: "What is the one thing we can always agree on, no matter what?", category: "Wildcards", intensity: "medium" },

  //   Category: Ancestry & Roots
  { id: "leg_001", deckId: "family_legacy", question: "Which ancestor's story should we never stop telling?", category: "Roots", intensity: "medium" },
  { id: "leg_002", deckId: "family_legacy", question: "What is one physical trait in our family that you hope never disappears?", category: "Roots", intensity: "mild" },
  { id: "leg_003", deckId: "family_legacy", question: "If you could ask a great-grandparent one question, what would it be?", category: "Roots", intensity: "deep" },
  { id: "leg_004", deckId: "family_legacy", question: "What is the 'scariest' or 'boldest' thing an ancestor did to get us where we are today?", category: "Roots", intensity: "medium" },
  { id: "leg_005", deckId: "family_legacy", question: "Which family member (living or dead) do you think embodies our 'family spirit' most?", category: "Roots", intensity: "medium" },
  { id: "leg_006", deckId: "family_legacy", question: "Do you believe we are carrying on a 'legacy' or starting a new one?", category: "Roots", intensity: "deep" },
  { id: "leg_007", deckId: "family_legacy", question: "What is one 'family mystery' you wish we could solve?", category: "Roots", intensity: "medium" },
  { id: "leg_008", deckId: "family_legacy", question: "How has our family's cultural or geographic background shaped your values?", category: "Roots", intensity: "deep" },
  { id: "leg_009", deckId: "family_legacy", question: "What is the oldest family heirloom we have, and why is it important?", category: "Roots", intensity: "mild" },
  { id: "leg_010", deckId: "family_legacy", question: "What is a 'hardship' our family survived that we should be proud of?", category: "Roots", intensity: "deep" },

  //   Category: Lessons & Wisdom
  { id: "leg_011", deckId: "family_legacy", question: "What is the most important piece of wisdom we should pass to our children?", category: "Wisdom", intensity: "deep" },
  { id: "leg_012", deckId: "family_legacy", question: "What 'mistake' has our family made in the past that we should ensure stays in the past?", category: "Wisdom", intensity: "deep" },
  { id: "leg_013", deckId: "family_legacy", question: "If you had to write a 'Family Code of Conduct,' what is Rule #1?", category: "Wisdom", intensity: "medium" },
  { id: "leg_014", deckId: "family_legacy", question: "What does 'honor' look like in our family?", category: "Wisdom", intensity: "medium" },
  { id: "leg_015", deckId: "family_legacy", question: "What is a lesson about love that you learned specifically from this family?", category: "Wisdom", intensity: "deep" },
  { id: "leg_016", deckId: "family_legacy", question: "How do we want our family to be described by people 100 years from now?", category: "Wisdom", intensity: "medium" },
  { id: "leg_017", deckId: "family_legacy", question: "What is one 'old-fashioned' value you hope we never lose?", category: "Wisdom", intensity: "medium" },
  { id: "leg_018", deckId: "family_legacy", question: "What have you learned about resilience just by being in this family?", category: "Wisdom", intensity: "deep" },
  { id: "leg_019", deckId: "family_legacy", question: "If you were to create a 'family crest' today, what three symbols would be on it?", category: "Wisdom", intensity: "mild" },
  { id: "leg_020", deckId: "family_legacy", question: "What is the biggest 'truth' you've discovered about our family as you've gotten older?", category: "Wisdom", intensity: "deep" },

  //   Category: Future Generations
  { id: "leg_021", deckId: "family_legacy", question: "What is one dream you have for the next generation of our family?", category: "Future", intensity: "medium" },
  { id: "leg_022", deckId: "family_legacy", question: "How will we ensure our family stories don't get lost as time goes on?", category: "Future", intensity: "medium" },
  { id: "leg_023", deckId: "family_legacy", question: "If we could leave a 'time capsule' for the family in 2076, what would go in it?", category: "Future", intensity: "mild" },
  { id: "leg_024", deckId: "family_legacy", question: "What is one habit we have now that you hope your grandkids *don't* have?", category: "Future", intensity: "medium" },
  { id: "leg_025", deckId: "family_legacy", question: "How can we make our family gatherings more meaningful for the younger ones?", category: "Future", intensity: "medium" },
  { id: "leg_026", deckId: "family_legacy", question: "What is a 'skill' (cooking, building, speaking) you want to be the one to teach the kids?", category: "Future", intensity: "mild" },
  { id: "leg_027", deckId: "family_legacy", question: "Do you think our family name carries a specific responsibility?", category: "Future", intensity: "deep" },
  { id: "leg_028", deckId: "family_legacy", question: "What do you hope the family 'motto' becomes in the future?", category: "Future", intensity: "medium" },
  { id: "leg_029", deckId: "family_legacy", question: "What kind of world are we leaving for the next [Your Last Name]?", category: "Future", intensity: "deep" },
  { id: "leg_030", deckId: "family_legacy", question: "If you could write a letter to your unborn great-grandchild, what is the first sentence?", category: "Future", intensity: "deep" },

  //   Category: Personal Impact
  { id: "leg_031", deckId: "family_legacy", question: "What do you want your individual legacy within this family to be?", category: "Individual", intensity: "deep" },
  { id: "leg_032", deckId: "family_legacy", question: "How do you want to be remembered at family gatherings when you're gone?", category: "Individual", intensity: "deep" },
  { id: "leg_033", deckId: "family_legacy", question: "What is one thing you’ve done that you hope is talked about for generations?", category: "Individual", intensity: "medium" },
  { id: "leg_034", deckId: "family_legacy", question: "What part of your personality is 'pure' [Your Last Name]?", category: "Individual", intensity: "mild" },
  { id: "leg_035", deckId: "family_legacy", question: "What is a 'sacrifice' you've made for this family that you're proud of?", category: "Individual", intensity: "deep" },
  { id: "leg_036", deckId: "family_legacy", question: "How has your definition of 'family' changed since you were 10?", category: "Individual", intensity: "deep" },
  { id: "leg_037", deckId: "family_legacy", question: "What is one thing I’ve done that you think has positively changed our family's path?", category: "Individual", intensity: "deep" },
  { id: "leg_038", deckId: "family_legacy", question: "Which family member has had the biggest impact on your moral compass?", category: "Individual", intensity: "deep" },
  { id: "leg_039", deckId: "family_legacy", question: "What is the most 'heroic' thing anyone in this family has done in your lifetime?", category: "Individual", intensity: "medium" },
  { id: "leg_040", deckId: "family_legacy", question: "What does it mean to you to 'carry the name'?", category: "Individual", intensity: "deep" },

  //   Category: Shared Values
  { id: "leg_041", deckId: "family_legacy", question: "If our family was a country, what would its national anthem sound like?", category: "Values", intensity: "mild" },
  { id: "leg_042", deckId: "family_legacy", question: "What is the 'golden rule' in our house that we should never break?", category: "Values", intensity: "medium" },
  { id: "leg_043", deckId: "family_legacy", question: "How do we define 'wealth' as a family—is it money, time, or relationships?", category: "Values", intensity: "deep" },
  { id: "leg_044", deckId: "family_legacy", question: "What is the most important tradition we’ve created in YOUR lifetime?", category: "Values", intensity: "medium" },
  { id: "leg_045", deckId: "family_legacy", question: "How do we handle 'outsiders' becoming family? What is the initiation?", category: "Values", intensity: "medium" },
  { id: "leg_046", deckId: "family_legacy", question: "What is one thing we always forgive in this family?", category: "Values", intensity: "deep" },
  { id: "leg_047", deckId: "family_legacy", question: "What is one thing we NEVER tolerate in this family?", category: "Values", intensity: "deep" },
  { id: "leg_048", deckId: "family_legacy", question: "How do we want to support each other’s big dreams in the coming decade?", category: "Values", intensity: "medium" },
  { id: "leg_049", deckId: "family_legacy", question: "What is the 'soul' of our family?", category: "Values", intensity: "deep" },
  { id: "leg_050", deckId: "family_legacy", question: "If we had a family flag, what color would it be and why?", category: "Values", intensity: "mild" },

  //   Category: Final Reflections
  { id: "leg_051", deckId: "family_legacy", question: "What is one question you wish you could ask our future descendants?", category: "Reflection", intensity: "medium" },
  { id: "leg_052", deckId: "family_legacy", question: "If we were to write a 'Family History' book, what would the current chapter be titled?", category: "Reflection", intensity: "medium" },
  { id: "leg_053", deckId: "family_legacy", question: "What is the one thing about 'us' that you hope never, ever changes?", category: "Reflection", intensity: "deep" },
  { id: "leg_054", deckId: "family_legacy", question: "How has our family story made you the person you are today?", category: "Reflection", intensity: "deep" },
  { id: "leg_055", deckId: "family_legacy", question: "What is the best thing about being a part of this specific group of people?", category: "Reflection", intensity: "medium" },
  { id: "leg_056", deckId: "family_legacy", question: "What is the 'light' our family brings into the world?", category: "Reflection", intensity: "deep" },
  { id: "leg_057", deckId: "family_legacy", question: "If you could change one thing about our family's history, what would it be?", category: "Reflection", intensity: "deep" },
  { id: "leg_058", deckId: "family_legacy", question: "How do you want to celebrate our family 10 years from now?", category: "Reflection", intensity: "medium" },
  { id: "leg_059", deckId: "family_legacy", question: "What is the most 'spiritual' or meaningful moment we’ve shared?", category: "Reflection", intensity: "deep" },
  { id: "leg_060", deckId: "family_legacy", question: "If you had to leave one final message for everyone here, what would it be?", category: "Reflection", intensity: "deep" },

  //   Category: Things Left Unsaid
  { id: "unspk_001", deckId: "family_unspoken", question: "What is one thing you’ve wanted to tell me for years but didn't know how?", category: "Truths", intensity: "deep" },
  { id: "unspk_002", deckId: "family_unspoken", question: "Do you ever feel like you have to 'perform' a certain version of yourself when you’re with the family?", category: "Truths", intensity: "deep" },
  { id: "unspk_003", deckId: "family_unspoken", question: "What is a 'hidden burden' you’ve been carrying that the family doesn't know about?", category: "Truths", intensity: "deep" },
  { id: "unspk_004", deckId: "family_unspoken", question: "When was a time you felt completely misunderstood by us?", category: "Truths", intensity: "deep" },
  { id: "unspk_005", deckId: "family_unspoken", question: "Is there a specific moment from our past that you’re still trying to make peace with?", category: "Truths", intensity: "deep" },
  { id: "unspk_006", deckId: "family_unspoken", question: "Do you feel like your role in the family is appreciated, or do you feel taken for granted?", category: "Truths", intensity: "medium" },
  { id: "unspk_007", deckId: "family_unspoken", question: "What is one thing you wish I would stop doing, but you’ve been too polite to mention?", category: "Truths", intensity: "medium" },
  { id: "unspk_008", deckId: "family_unspoken", question: "Do you ever feel like you're 'competing' with anyone else in the family?", category: "Truths", intensity: "medium" },
  { id: "unspk_009", deckId: "family_unspoken", question: "What is the biggest 'secret' you’ve kept to protect the family's feelings?", category: "Truths", intensity: "deep" },
  { id: "unspk_010", deckId: "family_unspoken", question: "How do you really feel about the way we handle family conflicts?", category: "Truths", intensity: "medium" },

  //   Category: Regrets & Apologies
  { id: "unspk_011", deckId: "family_unspoken", question: "What is one thing you did to me in the past that you still feel guilty about?", category: "Regrets", intensity: "deep" },
  { id: "unspk_012", deckId: "family_unspoken", question: "Is there an apology you’ve been waiting for that you haven't received yet?", category: "Regrets", intensity: "deep" },
  { id: "unspk_013", deckId: "family_unspoken", question: "If you could go back and change one interaction between us, which would it be?", category: "Regrets", intensity: "deep" },
  { id: "unspk_014", deckId: "family_unspoken", question: "What is a 'missed opportunity' for connection that you regret letting pass?", category: "Regrets", intensity: "medium" },
  { id: "unspk_015", deckId: "family_unspoken", question: "When was a time you needed me to show up for you, but I wasn't there?", category: "Regrets", intensity: "deep" },
  { id: "unspk_016", deckId: "family_unspoken", question: "What is the hardest thing you’ve ever had to forgive a family member for?", category: "Regrets", intensity: "deep" },
  { id: "unspk_017", deckId: "family_unspoken", question: "Do you think we hold onto grudges for too long in this family?", category: "Regrets", intensity: "medium" },
  { id: "unspk_018", deckId: "family_unspoken", question: "What is one thing you wish you had said to a family member before they passed?", category: "Regrets", intensity: "deep" },
  { id: "unspk_019", deckId: "family_unspoken", question: "How can I make up for a time I let you down?", category: "Regrets", intensity: "deep" },
  { id: "unspk_020", deckId: "family_unspoken", question: "Do you believe we are truly honest with each other, or do we walk on eggshells?", category: "Regrets", intensity: "medium" },

  //   Category: Healing & Reconciliation
  { id: "unspk_021", deckId: "family_unspoken", question: "What would it take for us to move past a recurring argument we have?", category: "Healing", intensity: "medium" },
  { id: "unspk_022", deckId: "family_unspoken", question: "What is the 'elephant in the room' in our family right now?", category: "Healing", intensity: "deep" },
  { id: "unspk_023", deckId: "family_unspoken", question: "How can we start a 'new chapter' in our relationship today?", category: "Healing", intensity: "medium" },
  { id: "unspk_024", deckId: "family_unspoken", question: "What part of our family history do you find the most painful to talk about?", category: "Healing", intensity: "deep" },
  { id: "unspk_025", deckId: "family_unspoken", question: "What is one thing I can do to earn more of your trust?", category: "Healing", intensity: "deep" },
  { id: "unspk_026", deckId: "family_unspoken", question: "Do you feel like you have 'permission' to change and grow in this family?", category: "Healing", intensity: "deep" },
  { id: "unspk_027", deckId: "family_unspoken", question: "What is a boundary of yours that I’ve crossed without realizing it?", category: "Healing", intensity: "medium" },
  { id: "unspk_028", deckId: "family_unspoken", question: "How can we create a 'safer' space for emotional honesty?", category: "Healing", intensity: "medium" },
  { id: "unspk_029", deckId: "family_unspoken", question: "Which relationship in the family do you think needs the most 'work' right now?", category: "Healing", intensity: "medium" },
  { id: "unspk_030", deckId: "family_unspoken", question: "What is the first step toward healing a rift you see in the family?", category: "Healing", intensity: "deep" },

  //   Category: Expectations & Pressure
  { id: "unspk_031", deckId: "family_unspoken", question: "What is the biggest 'expectation' you feel from the family that you wish you didn't?", category: "Pressure", intensity: "medium" },
  { id: "unspk_032", deckId: "family_unspoken", question: "Do you feel like your successes are celebrated as much as everyone else's?", category: "Pressure", intensity: "medium" },
  { id: "unspk_033", deckId: "family_unspoken", question: "What is one 'family label' you’ve been given (e.g., 'the smart one', 'the mess') that you hate?", category: "Pressure", intensity: "medium" },
  { id: "unspk_034", deckId: "family_unspoken", question: "Do you feel pressured to follow in anyone's footsteps?", category: "Pressure", intensity: "medium" },
  { id: "unspk_035", deckId: "family_unspoken", question: "What is the hardest part about being 'the oldest/youngest/middle' child in this family?", category: "Pressure", intensity: "medium" },
  { id: "unspk_036", deckId: "family_unspoken", question: "Do you feel like you can disagree with the 'family consensus' without being judged?", category: "Pressure", intensity: "deep" },
  { id: "unspk_037", deckId: "family_unspoken", question: "What is one thing you’ve done just to make the family proud, even if you didn't want to?", category: "Pressure", intensity: "medium" },
  { id: "unspk_038", deckId: "family_unspoken", question: "How do you handle the fear of 'disappointing' the family?", category: "Pressure", intensity: "deep" },
  { id: "unspk_039", deckId: "family_unspoken", question: "Do you feel like your life choices are supported, even if they aren't understood?", category: "Pressure", intensity: "deep" },
  { id: "unspk_040", deckId: "family_unspoken", question: "If you could change one 'expectation' we have of each other, what would it be?", category: "Pressure", intensity: "medium" },

  //   Category: Deep Curiosities
  { id: "unspk_041", deckId: "family_unspoken", question: "What is the one question you’ve been too scared to ask your parents?", category: "Curiosity", intensity: "deep" },
  { id: "unspk_042", deckId: "family_unspoken", question: "How did you really feel during the most difficult year our family faced?", category: "Curiosity", intensity: "deep" },
  { id: "unspk_043", deckId: "family_unspoken", question: "What is a 'family story' that you suspect isn't 100% true?", category: "Curiosity", intensity: "medium" },
  { id: "unspk_044", deckId: "family_unspoken", question: "What was your honest first impression of a new member joining our family?", category: "Curiosity", intensity: "medium" },
  { id: "unspk_045", deckId: "family_unspoken", question: "Do you ever feel like an 'outsider' in your own family? When?", category: "Curiosity", intensity: "deep" },
  { id: "unspk_046", deckId: "family_unspoken", question: "What is the one thing about our family dynamic that you find the most confusing?", category: "Curiosity", intensity: "medium" },
  { id: "unspk_047", deckId: "family_unspoken", question: "Who do you think has changed the most in this family over the last 10 years?", category: "Curiosity", intensity: "medium" },
  { id: "unspk_048", deckId: "family_unspoken", question: "What is the 'nicest' thing anyone in the family has done for you that you've never mentioned?", category: "Curiosity", intensity: "medium" },
  { id: "unspk_049", deckId: "family_unspoken", question: "If we had a 'truth serum' for one hour, what is the first thing you’d ask?", category: "Curiosity", intensity: "deep" },
  { id: "unspk_050", deckId: "family_unspoken", question: "How do you think our family will handle the next 'big' life transition?", category: "Curiosity", intensity: "medium" },

  //   Category: Appreciation & Final Words
  { id: "unspk_051", deckId: "family_unspoken", question: "What is a strength of mine that you’ve never told me you admire?", category: "Appreciation", intensity: "medium" },
  { id: "unspk_052", deckId: "family_unspoken", question: "When was a time you were incredibly proud of me, but didn't say it?", category: "Appreciation", intensity: "medium" },
  { id: "unspk_053", deckId: "family_unspoken", question: "What is the 'best' part of our relationship that we don't talk about enough?", category: "Appreciation", intensity: "medium" },
  { id: "unspk_054", deckId: "family_unspoken", question: "How has being in this family saved you or helped you in a way we don't know?", category: "Appreciation", intensity: "deep" },
  { id: "unspk_055", deckId: "family_unspoken", question: "What is one thing you hope we 'never' stop doing together?", category: "Appreciation", intensity: "medium" },
  { id: "unspk_056", deckId: "family_unspoken", question: "What is the most 'heroic' thing you’ve seen a family member do?", category: "Appreciation", intensity: "medium" },
  { id: "unspk_057", deckId: "family_unspoken", question: "If this was our last conversation, what is the one thing you’d want me to know?", category: "Appreciation", intensity: "deep" },
  { id: "unspk_058", deckId: "family_unspoken", question: "How do you want to be remembered within this family circle?", category: "Appreciation", intensity: "deep" },
  { id: "unspk_059", deckId: "family_unspoken", question: "What is the 'legacy' of our love that you are most proud of?", category: "Appreciation", intensity: "deep" },
  { id: "unspk_060", deckId: "family_unspoken", question: "Tell the person to your left one 'unspoken' reason why you love them.", category: "Appreciation", intensity: "deep" }
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