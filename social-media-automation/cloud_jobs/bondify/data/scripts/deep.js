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
  { id: "deep", title: "🧠 Deep Talk", tagline: "Questions that make you think" }
];

const decks = [
  // ── DEEP TALK ──
{ id: "deep_reflection", modeId: "deep", title: "🪞 Life Reflection", description: "Look back at life choices", isLocked: false },
  { id: "deep_human_nature", modeId: "deep", title: "🐒 Human Nature", description: "Why do we act the way we do?", isLocked: false },
  { id: "deep_lessons", modeId: "deep", title: "🎓 Lessons Learned", description: "The hardest truths you've accepted", isLocked: false },
  { id: "deep_emotions", modeId: "deep", title: "🌊 Emotional IQ", description: "Exploring the landscape of your feelings", isLocked: false },
  { id: "deep_existence", modeId: "deep", title: "🌌 The Universe", description: "Space, time, and the meaning of it all", isLocked: false },
  { id: "deep_philosophy", modeId: "deep", title: "📚 Philosophy", description: "Questions about existence", isLocked: true },
  { id: "deep_mortality", modeId: "deep", title: "⌛ Bucket List", description: "What must you do before it's over?", isLocked: true },
  { id: "deep_identity", modeId: "deep", title: "🆔 Identity", description: "Who are you when no one is watching?", isLocked: true }
];
const cards = [
  //   Category: Childhood & Roots
  { id: "refl_001", deckId: "deep_reflection", question: "What is the earliest memory you have where you felt completely safe?", category: "Roots", intensity: "medium" },
  { id: "refl_002", deckId: "deep_reflection", question: "In what way are you exactly like your parents? In what way are you their polar opposite?", category: "Roots", intensity: "medium" },
  { id: "refl_003", deckId: "deep_reflection", question: "What was the 'turning point' in your childhood that forced you to grow up?", category: "Roots", intensity: "deep" },
  { id: "refl_004", deckId: "deep_reflection", question: "Which childhood dream did you give up on, and do you regret letting it go?", category: "Roots", intensity: "medium" },
  { id: "refl_005", deckId: "deep_reflection", question: "What is a lesson you learned the hard way as a teenager that still sticks with you?", category: "Roots", intensity: "medium" },
  { id: "refl_006", deckId: "deep_reflection", question: "If you could go back and hug your 10-year-old self, what would you whisper to them?", category: "Roots", intensity: "deep" },
  { id: "refl_007", deckId: "deep_reflection", question: "What is a family tradition you hated as a kid but cherish now?", category: "Roots", intensity: "mild" },
  { id: "refl_008", deckId: "deep_reflection", question: "Who was the first person to truly believe in your potential?", category: "Roots", intensity: "medium" },
  { id: "refl_009", deckId: "deep_reflection", question: "How much of your current personality is a reaction to your upbringing?", category: "Roots", intensity: "deep" },
  { id: "refl_010", deckId: "deep_reflection", question: "What did 'love' look like in your house growing up?", category: "Roots", intensity: "deep" },

  //   Category: Choices & Regrets
  { id: "refl_011", deckId: "deep_reflection", question: "If you could undo one decision from your past, which one would it be?", category: "Choices", intensity: "deep" },
  { id: "refl_012", deckId: "deep_reflection", question: "What is a 'sliding doors' moment in your life—a tiny choice that changed everything?", category: "Choices", intensity: "medium" },
  { id: "refl_013", deckId: "deep_reflection", question: "What have you settled for in life that you know you shouldn't have?", category: "Choices", intensity: "deep" },
  { id: "refl_014", deckId: "deep_reflection", question: "What is the biggest risk you *didn't* take, and why?", category: "Choices", intensity: "medium" },
  { id: "refl_015", deckId: "deep_reflection", question: "Which relationship (platonic or romantic) taught you the most about yourself?", category: "Choices", intensity: "medium" },
  { id: "refl_016", deckId: "deep_reflection", question: "Have you ever been the 'villain' in someone else's story? What happened?", category: "Choices", intensity: "deep" },
  { id: "refl_017", deckId: "deep_reflection", question: "What is the most difficult 'goodbye' you’ve ever had to say?", category: "Choices", intensity: "deep" },
  { id: "refl_018", deckId: "deep_reflection", question: "How much of your life is lived for yourself, and how much is lived for others?", category: "Choices", intensity: "deep" },
  { id: "refl_019", deckId: "deep_reflection", question: "When was the last time you completely changed your mind about a core belief?", category: "Choices", intensity: "medium" },
  { id: "refl_020", deckId: "deep_reflection", question: "What is a mistake you keep repeating, despite knowing better?", category: "Choices", intensity: "medium" },

  //   Category: Self-Perception
  { id: "refl_021", deckId: "deep_reflection", question: "What is the one thing you like most about yourself that has nothing to do with your appearance?", category: "Identity", intensity: "medium" },
  { id: "refl_022", deckId: "deep_reflection", question: "What is your biggest insecurity, and how does it drive your behavior?", category: "Identity", intensity: "deep" },
  { id: "refl_023", deckId: "deep_reflection", question: "Do you think you are currently the best version of yourself?", category: "Identity", intensity: "medium" },
  { id: "refl_024", deckId: "deep_reflection", question: "What is the 'mask' you wear when you’re around people you don't trust?", category: "Identity", intensity: "medium" },
  { id: "refl_025", deckId: "deep_reflection", question: "How do you want to be described when you aren't in the room?", category: "Identity", intensity: "medium" },
  { id: "refl_026", deckId: "deep_reflection", question: "What is a part of yourself that you are still trying to forgive?", category: "Identity", intensity: "deep" },
  { id: "refl_027", deckId: "deep_reflection", question: "What makes you feel the most 'alive'?", category: "Identity", intensity: "mild" },
  { id: "refl_028", deckId: "deep_reflection", question: "If your life was a book, what would the current chapter be titled?", category: "Identity", intensity: "medium" },
  { id: "refl_029", deckId: "deep_reflection", question: "What is the bravest thing you’ve ever done?", category: "Identity", intensity: "medium" },
  { id: "refl_030", deckId: "deep_reflection", question: "How do you handle being alone? Is it a relief or a burden?", category: "Identity", intensity: "medium" },

  //   Category: Life & Meaning
  { id: "refl_031", deckId: "deep_reflection", question: "What does 'success' look like to you now, compared to 10 years ago?", category: "Meaning", intensity: "medium" },
  { id: "refl_032", deckId: "deep_reflection", question: "What is the most beautiful thing you’ve ever witnessed?", category: "Meaning", intensity: "mild" },
  { id: "refl_033", deckId: "deep_reflection", question: "What are you holding onto that you know you need to let go of?", category: "Meaning", intensity: "deep" },
  { id: "refl_034", deckId: "deep_reflection", question: "Do you believe everything happens for a reason, or is it all just chaos?", category: "Meaning", intensity: "medium" },
  { id: "refl_035", deckId: "deep_reflection", question: "What is the biggest 'blessing in disguise' you’ve ever experienced?", category: "Meaning", intensity: "medium" },
  { id: "refl_036", deckId: "deep_reflection", question: "What gives your life a sense of purpose on the days you feel empty?", category: "Meaning", intensity: "deep" },
  { id: "refl_037", deckId: "deep_reflection", question: "What is the most 'human' moment you’ve ever shared with a stranger?", category: "Meaning", intensity: "medium" },
  { id: "refl_038", deckId: "deep_reflection", question: "If you could know the date of your death, would you want to?", category: "Meaning", intensity: "medium" },
  { id: "refl_039", deckId: "deep_reflection", question: "What is the one thing you want to be remembered for?", category: "Meaning", intensity: "deep" },
  { id: "refl_040", deckId: "deep_reflection", question: "What is the kindest thing anyone has ever done for you?", category: "Meaning", intensity: "medium" },

  //   Category: Fears & Future
  { id: "refl_041", deckId: "deep_reflection", question: "What is your biggest fear about getting older?", category: "Future", intensity: "medium" },
  { id: "refl_042", deckId: "deep_reflection", question: "What is one thing you hope never changes about you?", category: "Future", intensity: "medium" },
  { id: "refl_043", deckId: "deep_reflection", question: "If you lost everything tomorrow, what would you do first?", category: "Future", intensity: "deep" },
  { id: "refl_044", deckId: "deep_reflection", question: "What is a dream you’re too afraid to say out loud?", category: "Future", intensity: "high" },
  { id: "refl_045", deckId: "deep_reflection", question: "How do you want your life to look in exactly one year from today?", category: "Future", intensity: "medium" },
  { id: "refl_046", deckId: "deep_reflection", question: "What is the biggest lesson you hope to teach the next generation?", category: "Future", intensity: "medium" },
  { id: "refl_047", deckId: "deep_reflection", question: "Do you feel like you are running toward something or away from something?", category: "Future", intensity: "deep" },
  { id: "refl_048", deckId: "deep_reflection", question: "What is the one thing you’re waiting for to finally 'start' your life?", category: "Future", intensity: "deep" },
  { id: "refl_049", deckId: "deep_reflection", question: "What would you do if you knew you could not fail?", category: "Future", intensity: "medium" },
  { id: "refl_050", deckId: "deep_reflection", question: "Are you more afraid of failure or of being mediocre?", category: "Future", intensity: "medium" },

  //   Category: Inner Peace & Conflict
  { id: "refl_051", deckId: "deep_reflection", question: "What does 'home' feel like to you? Is it a place or a person?", category: "Peace", intensity: "medium" },
  { id: "refl_052", deckId: "deep_reflection", question: "How do you soothe yourself when your world feels like it’s falling apart?", category: "Peace", intensity: "deep" },
  { id: "refl_053", deckId: "deep_reflection", question: "What is the most 'unforgivable' thing you’ve ever forgiven?", category: "Peace", intensity: "high" },
  { id: "refl_054", deckId: "deep_reflection", question: "When do you feel the most at peace with yourself?", category: "Peace", intensity: "medium" },
  { id: "refl_055", deckId: "deep_reflection", question: "What is a question you’re afraid to ask yourself?", category: "Peace", intensity: "high" },
  { id: "refl_056", deckId: "deep_reflection", question: "How do you define 'enough'?", category: "Peace", intensity: "medium" },
  { id: "refl_057", deckId: "deep_reflection", question: "What is a truth about yourself that took you a long time to accept?", category: "Peace", intensity: "deep" },
  { id: "refl_058", deckId: "deep_reflection", question: "If you could change one thing about the world, but it would cost you your happiest memory, would you do it?", category: "Peace", intensity: "high" },
  { id: "refl_059", deckId: "deep_reflection", question: "What is the most important thing you’ve learned about love so far?", category: "Peace", intensity: "medium" },
  { id: "refl_060", deckId: "deep_reflection", question: "What is the one thing you are most grateful for right now, in this very moment?", category: "Peace", intensity: "medium" },

  //   Category: Ethics & Morality
  { id: "phil_001", deckId: "deep_philosophy", question: "If you could save five strangers by sacrificing one person you love, would you do it?", category: "Ethics", intensity: "deep" },
  { id: "phil_002", deckId: "deep_philosophy", question: "Does the 'end' ever truly justify the 'means'?", category: "Ethics", intensity: "medium" },
  { id: "phil_003", deckId: "deep_philosophy", question: "Is it worse to fail or to never have tried at all?", category: "Ethics", intensity: "medium" },
  { id: "phil_004", deckId: "deep_philosophy", question: "If you do a good deed for a selfish reason, is it still a good deed?", category: "Ethics", intensity: "medium" },
  { id: "phil_005", deckId: "deep_philosophy", question: "Should people be judged by their intentions or by their actions?", category: "Ethics", intensity: "medium" },
  { id: "phil_006", deckId: "deep_philosophy", question: "Is lying ever the 'most moral' choice in a situation?", category: "Ethics", intensity: "medium" },
  { id: "phil_007", deckId: "deep_philosophy", question: "If a person commits a crime but has no memory of it, should they still be punished?", category: "Ethics", intensity: "deep" },
  { id: "phil_008", deckId: "deep_philosophy", question: "Does everyone deserve a second chance, regardless of the crime?", category: "Ethics", intensity: "deep" },
  { id: "phil_009", deckId: "deep_philosophy", question: "Is it more important to be 'just' or to be 'merciful'?", category: "Ethics", intensity: "medium" },
  { id: "phil_010", deckId: "deep_philosophy", question: "If you could live in a simulation of perfect happiness, would you choose it over real life?", category: "Ethics", intensity: "deep" },

  //   Category: Reality & Existence
  { id: "phil_011", deckId: "deep_philosophy", question: "If a tree falls in a forest and no one is there to hear it, does it make a sound?", category: "Reality", intensity: "mild" },
  { id: "phil_012", deckId: "deep_philosophy", question: "Do you believe in free will, or is everything 'written'?", category: "Reality", intensity: "deep" },
  { id: "phil_013", deckId: "deep_philosophy", question: "Is time a linear path or an illusion we created to make sense of the world?", category: "Reality", intensity: "medium" },
  { id: "phil_014", deckId: "deep_philosophy", question: "What is 'the self'? Is it your body, your thoughts, or something else?", category: "Reality", intensity: "deep" },
  { id: "phil_015", deckId: "deep_philosophy", question: "If you replace every part of a ship one by one, is it still the same ship?", category: "Reality", intensity: "medium" },
  { id: "phil_016", deckId: "deep_philosophy", question: "Is the universe infinite, or is there a 'wall' at the end of it?", category: "Reality", intensity: "medium" },
  { id: "phil_017", deckId: "deep_philosophy", question: "Do numbers exist in reality, or are they just a human language?", category: "Reality", intensity: "medium" },
  { id: "phil_018", deckId: "deep_philosophy", question: "If we are in a simulation, what would the purpose of the 'program' be?", category: "Reality", intensity: "medium" },
  { id: "phil_019", deckId: "deep_philosophy", question: "Could our entire universe be a single atom in a much larger world?", category: "Reality", intensity: "medium" },
  { id: "phil_020", deckId: "deep_philosophy", question: "Is 'nothingness' actually a thing, or just the absence of things?", category: "Reality", intensity: "deep" },

  //   Category: Human Nature
  { id: "phil_021", deckId: "deep_philosophy", question: "Are humans naturally 'good' or naturally 'selfish'?", category: "Human Nature", intensity: "deep" },
  { id: "phil_022", deckId: "deep_philosophy", question: "If there were no laws, would people still choose to be kind?", category: "Human Nature", intensity: "medium" },
  { id: "phil_023", deckId: "deep_philosophy", question: "Is altruism (pure selflessness) actually possible?", category: "Human Nature", intensity: "medium" },
  { id: "phil_024", deckId: "deep_philosophy", question: "Why do humans create art?", category: "Human Nature", intensity: "mild" },
  { id: "phil_025", deckId: "deep_philosophy", question: "Is our capacity for suffering what makes us 'human'?", category: "Human Nature", intensity: "deep" },
  { id: "phil_026", deckId: "deep_philosophy", question: "If an AI could feel emotion, should it have human rights?", category: "Human Nature", intensity: "medium" },
  { id: "phil_027", deckId: "deep_philosophy", question: "Is it better to be a 'sad genius' or a 'happy fool'?", category: "Human Nature", intensity: "medium" },
  { id: "phil_028", deckId: "deep_philosophy", question: "Do we have a soul, or are we just biological machines?", category: "Human Nature", intensity: "deep" },
  { id: "phil_029", deckId: "deep_philosophy", question: "What is the biggest difference between humans and other animals?", category: "Human Nature", intensity: "medium" },
  { id: "phil_030", deckId: "deep_philosophy", question: "Is love a chemical reaction or something spiritual?", category: "Human Nature", intensity: "medium" },

  //   Category: Society & Governance
  { id: "phil_031", deckId: "deep_philosophy", question: "Would a world without borders be a utopia or a disaster?", category: "Society", intensity: "medium" },
  { id: "phil_032", deckId: "deep_philosophy", question: "Is it possible for a truly 'fair' society to exist?", category: "Society", intensity: "medium" },
  { id: "phil_033", deckId: "deep_philosophy", question: "Which is more important: individual freedom or collective security?", category: "Society", intensity: "deep" },
  { id: "phil_034", deckId: "deep_philosophy", question: "Is 'peace' just the period between two wars?", category: "Society", intensity: "medium" },
  { id: "phil_035", deckId: "deep_philosophy", question: "Should wealth have a 'cap' or 'ceiling'?", category: "Society", intensity: "medium" },
  { id: "phil_036", deckId: "deep_philosophy", question: "If you could create a new religion, what would its primary commandment be?", category: "Society", intensity: "medium" },
  { id: "phil_037", deckId: "deep_philosophy", question: "Is democracy the 'best' system, or just the 'least bad'?", category: "Society", intensity: "medium" },
  { id: "phil_038", deckId: "deep_philosophy", question: "Does power always corrupt, or does it just reveal who someone actually is?", category: "Society", intensity: "deep" },
  { id: "phil_039", deckId: "deep_philosophy", question: "Is 'progress' always good?", category: "Society", intensity: "medium" },
  { id: "phil_040", deckId: "deep_philosophy", question: "If we could live forever, would life lose its meaning?", category: "Society", intensity: "deep" },

  //   Category: Knowledge & Truth
  { id: "phil_041", deckId: "deep_philosophy", question: "Can we ever truly know anything for certain?", category: "Knowledge", intensity: "deep" },
  { id: "phil_042", deckId: "deep_philosophy", question: "Is 'truth' objective, or is it always subjective to the observer?", category: "Knowledge", intensity: "medium" },
  { id: "phil_043", deckId: "deep_philosophy", question: "Is it better to seek the truth even if it makes you miserable?", category: "Knowledge", intensity: "deep" },
  { id: "phil_044", deckId: "deep_philosophy", question: "How do you know you aren't currently dreaming?", category: "Knowledge", intensity: "medium" },
  { id: "phil_045", deckId: "deep_philosophy", question: "Is silence a form of communication?", category: "Knowledge", intensity: "mild" },
  { id: "phil_046", deckId: "deep_philosophy", question: "Does language limit our ability to think?", category: "Knowledge", intensity: "medium" },
  { id: "phil_047", deckId: "deep_philosophy", question: "Is math a discovery or an invention?", category: "Knowledge", intensity: "medium" },
  { id: "phil_048", deckId: "deep_philosophy", question: "Why is there 'something' rather than 'nothing'?", category: "Knowledge", intensity: "deep" },
  { id: "phil_049", deckId: "deep_philosophy", question: "Can a machine ever be truly 'creative'?", category: "Knowledge", intensity: "medium" },
  { id: "phil_050", deckId: "deep_philosophy", question: "If you could see the future, but couldn't change it, would you want to?", category: "Knowledge", intensity: "medium" },

  //   Category: Life & Death
  { id: "phil_051", deckId: "deep_philosophy", question: "Is death what gives life its value?", category: "Existence", intensity: "deep" },
  { id: "phil_052", deckId: "deep_philosophy", question: "If you could live your life over again exactly the same way, would you?", category: "Existence", intensity: "medium" },
  { id: "phil_053", deckId: "deep_philosophy", question: "What is the 'good life'?", category: "Existence", intensity: "medium" },
  { id: "phil_054", deckId: "deep_philosophy", question: "Is it better to have loved and lost than never to have loved at all?", category: "Existence", intensity: "medium" },
  { id: "phil_055", deckId: "deep_philosophy", question: "Does the universe care about our existence?", category: "Existence", intensity: "deep" },
  { id: "phil_056", deckId: "deep_philosophy", question: "Is suffering necessary for personal growth?", category: "Existence", intensity: "medium" },
  { id: "phil_057", deckId: "deep_philosophy", question: "If you were the only person left on Earth, would life still have meaning?", category: "Existence", intensity: "deep" },
  { id: "phil_058", deckId: "deep_philosophy", question: "What is the 'weight' of a human life?", category: "Existence", intensity: "deep" },
  { id: "phil_059", deckId: "deep_philosophy", question: "Is destiny real, or are we just shouting into the void?", category: "Existence", intensity: "medium" },
  { id: "phil_060", deckId: "deep_philosophy", question: "What is the most important question we should be asking?", category: "Existence", intensity: "deep" },

  //   Category: Social Behavior
  { id: "hnat_001", deckId: "deep_human_nature", question: "Do you think humans are naturally cooperative or naturally competitive?", category: "Behavior", intensity: "medium" },
  { id: "hnat_002", deckId: "deep_human_nature", question: "Why do we feel the need to be liked by people we don’t even like?", category: "Behavior", intensity: "medium" },
  { id: "hnat_003", deckId: "deep_human_nature", question: "Do you believe 'true altruism' exists, or is every kind act done for a self-serving reason?", category: "Behavior", intensity: "deep" },
  { id: "hnat_004", deckId: "deep_human_nature", question: "Why is it so much easier to remember a single insult than ten compliments?", category: "Behavior", intensity: "medium" },
  { id: "hnat_005", deckId: "deep_human_nature", question: "Do you think most people are fundamentally good at heart, or just held in check by laws?", category: "Behavior", intensity: "deep" },
  { id: "hnat_006", deckId: "deep_human_nature", question: "Why do we feel the urge to judge others for things we also do?", category: "Behavior", intensity: "medium" },
  { id: "hnat_007", deckId: "deep_human_nature", question: "Can people truly change their core personality, or do they just learn to hide it better?", category: "Behavior", intensity: "deep" },
  { id: "hnat_008", deckId: "deep_human_nature", question: "Why is 'the forbidden' always more attractive to us?", category: "Behavior", intensity: "medium" },
  { id: "hnat_009", deckId: "deep_human_nature", question: "Do you think humans are meant to be monogamous for an entire lifetime?", category: "Behavior", intensity: "high" },
  { id: "hnat_010", deckId: "deep_human_nature", question: "What is the most 'animalistic' thing about human beings that we try to ignore?", category: "Behavior", intensity: "medium" },

  //   Category: Perception & Ego
  { id: "hnat_011", deckId: "deep_human_nature", question: "Would you rather be the most successful person in a room of losers or the least successful in a room of geniuses?", category: "Ego", intensity: "medium" },
  { id: "hnat_012", deckId: "deep_human_nature", question: "Do you think we see the world as it is, or as we are?", category: "Perception", intensity: "deep" },
  { id: "hnat_013", deckId: "deep_human_nature", question: "Why do we feel 'second-hand embarrassment' for strangers?", category: "Ego", intensity: "mild" },
  { id: "hnat_014", deckId: "deep_human_nature", question: "If you could read minds but it meant everyone could also read yours, would you take the deal?", category: "Ego", intensity: "high" },
  { id: "hnat_015", deckId: "deep_human_nature", question: "Is our identity defined by how we see ourselves or by how others see us?", category: "Ego", intensity: "deep" },
  { id: "hnat_016", deckId: "deep_human_nature", question: "Why do we often romanticize the past even if it was miserable at the time?", category: "Perception", intensity: "medium" },
  { id: "hnat_017", deckId: "deep_human_nature", question: "Do you think power reveals a person's character, or changes it?", category: "Ego", intensity: "deep" },
  { id: "hnat_018", deckId: "deep_human_nature", question: "Why are we so afraid of being 'average'?", category: "Ego", intensity: "medium" },
  { id: "hnat_019", deckId: "deep_human_nature", question: "Do you trust your 'gut instinct' or your logical mind more?", category: "Perception", intensity: "medium" },
  { id: "hnat_020", deckId: "deep_human_nature", question: "If you knew no one would ever find out, would you do something unethical for a massive gain?", category: "Ego", intensity: "high" },

  //   Category: Fear & Survival
  { id: "hnat_021", deckId: "deep_human_nature", question: "Is the fear of death a biological necessity or a psychological burden?", category: "Survival", intensity: "deep" },
  { id: "hnat_022", deckId: "deep_human_nature", question: "Why do humans seek out scary things (horror movies, roller coasters) for fun?", category: "Survival", intensity: "mild" },
  { id: "hnat_023", deckId: "deep_human_nature", question: "What do you think is the strongest human emotion: Love, Fear, or Hate?", category: "Survival", intensity: "deep" },
  { id: "hnat_024", deckId: "deep_human_nature", question: "In a true 'every man for himself' situation, how long do you think social order would last?", category: "Survival", intensity: "high" },
  { id: "hnat_025", deckId: "deep_human_nature", question: "Is loneliness a signal that we are doing something wrong, or a natural state of being?", category: "Survival", intensity: "deep" },
  { id: "hnat_026", deckId: "deep_human_nature", question: "Why are we so resistant to change even when we know it’s good for us?", category: "Survival", intensity: "medium" },
  { id: "hnat_027", deckId: "deep_human_nature", question: "Do you think suffering is essential to appreciate happiness?", category: "Survival", intensity: "deep" },
  { id: "hnat_028", deckId: "deep_human_nature", question: "What human instinct do you wish we could 'delete' from our DNA?", category: "Survival", intensity: "medium" },
  { id: "hnat_029", deckId: "deep_human_nature", question: "Are humans the only animals that are aware of their own mortality?", category: "Survival", intensity: "medium" },
  { id: "hnat_030", deckId: "deep_human_nature", question: "Why do we crave 'belonging' so much that we’ll sacrifice our individuality for it?", category: "Survival", intensity: "deep" },

  //   Category: Morality & Justice
  { id: "hnat_031", deckId: "deep_human_nature", question: "If a person commits a 'bad' act for a 'good' reason, are they still a bad person?", category: "Morality", intensity: "deep" },
  { id: "hnat_032", deckId: "deep_human_nature", question: "Do you believe in 'an eye for an eye' or 'turn the other cheek'?", category: "Morality", intensity: "medium" },
  { id: "hnat_033", deckId: "deep_human_nature", question: "Is morality objective (set rules) or subjective (cultural/individual)?", category: "Morality", intensity: "deep" },
  { id: "hnat_034", deckId: "deep_human_nature", question: "Why do we find it easier to forgive a stranger than someone we love?", category: "Morality", intensity: "medium" },
  { id: "hnat_035", deckId: "deep_human_nature", question: "If you could save 100 people by letting one innocent person die, would you do it?", category: "Morality", intensity: "high" },
  { id: "hnat_036", deckId: "deep_human_nature", question: "Do you think the justice system should be about punishment or rehabilitation?", category: "Morality", intensity: "medium" },
  { id: "hnat_037", deckId: "deep_human_nature", question: "Is greed the root of all evil, or is it actually what drives human progress?", category: "Morality", intensity: "deep" },
  { id: "hnat_038", deckId: "deep_human_nature", question: "Can a 'monstrous' person ever truly find redemption?", category: "Morality", intensity: "deep" },
  { id: "hnat_039", deckId: "deep_human_nature", question: "Why do we feel more sympathy for those who look or act like us?", category: "Morality", intensity: "deep" },
  { id: "hnat_040", deckId: "deep_human_nature", question: "Is it more moral to be honest and hurtful, or kind and deceptive?", category: "Morality", intensity: "medium" },

  //   Category: Relationships & Bonds
  { id: "hnat_041", deckId: "deep_human_nature", question: "Why do we push away the people who care about us the most?", category: "Bonds", intensity: "deep" },
  { id: "hnat_042", deckId: "deep_human_nature", question: "Do you think we are more afraid of being alone or being known?", category: "Bonds", intensity: "deep" },
  { id: "hnat_043", deckId: "deep_human_nature", question: "Is jealousy a sign of love or a sign of insecurity?", category: "Bonds", intensity: "medium" },
  { id: "hnat_044", deckId: "deep_human_nature", question: "Why do we find it so hard to apologize even when we know we are wrong?", category: "Bonds", intensity: "medium" },
  { id: "hnat_045", deckId: "deep_human_nature", question: "Do you think technology is making us more social or more isolated?", category: "Bonds", intensity: "medium" },
  { id: "hnat_046", deckId: "deep_human_nature", question: "Is 'chemistry' between people real, or just a psychological projection?", category: "Bonds", intensity: "medium" },
  { id: "hnat_047", deckId: "deep_human_nature", question: "Can we love multiple people equally at the same time?", category: "Bonds", intensity: "high" },
  { id: "hnat_048", deckId: "deep_human_nature", question: "Why do we fall in love with people who are 'bad' for us?", category: "Bonds", intensity: "medium" },
  { id: "hnat_049", deckId: "deep_human_nature", question: "Is family loyalty a biological mandate or a social choice?", category: "Bonds", intensity: "deep" },
  { id: "hnat_050", deckId: "deep_human_nature", question: "Do you think most people are capable of a secret double life?", category: "Bonds", intensity: "high" },

  //   Category: Potential & The Void
  { id: "hnat_051", deckId: "deep_human_nature", question: "Are humans meant to be 'happy,' or just 'surviving and reproducing'?", category: "The Void", intensity: "deep" },
  { id: "hnat_052", deckId: "deep_human_nature", question: "Why do we have a sense of humor? What purpose does it serve?", category: "Potential", intensity: "mild" },
  { id: "hnat_053", deckId: "deep_human_nature", question: "Do you believe 'human potential' is infinite, or are we limited by our biology?", category: "Potential", intensity: "medium" },
  { id: "hnat_054", deckId: "deep_human_nature", question: "Why do we feel 'empty' even when we have everything we need?", category: "The Void", intensity: "deep" },
  { id: "hnat_055", deckId: "deep_human_nature", question: "If a machine could perform all your duties perfectly, what would be the purpose of your life?", category: "The Void", intensity: "deep" },
  { id: "hnat_056", deckId: "deep_human_nature", question: "What is the most 'inhumane' thing that humans do to each other?", category: "The Void", intensity: "high" },
  { id: "hnat_057", deckId: "deep_human_nature", question: "What is the most 'divine' or beautiful thing humans are capable of?", category: "Potential", intensity: "deep" },
  { id: "hnat_058", deckId: "deep_human_nature", question: "Do you think we will ever evolve into a different species?", category: "Potential", intensity: "medium" },
  { id: "hnat_059", deckId: "deep_human_nature", question: "If you were the last human on Earth, would you stay human, or start acting like an animal?", category: "The Void", intensity: "high" },
  { id: "hnat_060", deckId: "deep_human_nature", question: "In one word, what is the 'essence' of being human?", category: "The Void", intensity: "deep" },

  //   Category: Hard Truths
  { id: "less_001", deckId: "deep_lessons", question: "What is a 'hard truth' you’ve accepted about yourself this year?", category: "Hard Truths", intensity: "deep" },
  { id: "less_002", deckId: "deep_lessons", question: "What did your biggest failure teach you that a success never could?", category: "Growth", intensity: "deep" },
  { id: "less_003", deckId: "deep_lessons", question: "When was the last time you realized YOU were the toxic one in a situation?", category: "Hard Truths", intensity: "high" },
  { id: "less_004", deckId: "deep_lessons", question: "What is something you used to judge others for until it happened to you?", category: "Hard Truths", intensity: "medium" },
  { id: "less_005", deckId: "deep_lessons", question: "What is the most painful piece of feedback you’ve ever received that turned out to be true?", category: "Growth", intensity: "deep" },
  { id: "less_006", deckId: "deep_lessons", question: "What have you learned about 'forgiveness' that isn't found in books?", category: "Hard Truths", intensity: "deep" },
  { id: "less_007", deckId: "deep_lessons", question: "What is a lesson you learned from a person you no longer speak to?", category: "Growth", intensity: "medium" },
  { id: "less_008", deckId: "deep_lessons", question: "Do you believe that 'what doesn't kill you makes you stronger,' or just more tired?", category: "Hard Truths", intensity: "medium" },
  { id: "less_009", deckId: "deep_lessons", question: "What is the biggest waste of time you’ve ever engaged in?", category: "Hard Truths", intensity: "medium" },
  { id: "less_010", deckId: "deep_lessons", question: "What truth are you currently ignoring because it’s too hard to face?", category: "Hard Truths", intensity: "high" },

  //   Category: Relationships & People
  { id: "less_011", deckId: "deep_lessons", question: "What has heartbreak taught you about the way you choose partners?", category: "Love", intensity: "deep" },
  { id: "less_012", deckId: "deep_lessons", question: "What did your parents' relationship teach you about what you *don't* want?", category: "Roots", intensity: "deep" },
  { id: "less_013", deckId: "deep_lessons", question: "What is the most important lesson you’ve learned about setting boundaries?", category: "Relationships", intensity: "medium" },
  { id: "less_014", deckId: "deep_lessons", question: "How do you know when a relationship is worth saving versus when it's time to walk away?", category: "Relationships", intensity: "deep" },
  { id: "less_015", deckId: "deep_lessons", question: "What has been your biggest lesson in trust?", category: "Relationships", intensity: "deep" },
  { id: "less_016", deckId: "deep_lessons", question: "What did you learn about people during the lowest point of your life?", category: "Relationships", intensity: "deep" },
  { id: "less_017", deckId: "deep_lessons", question: "How has your definition of a 'best friend' changed as you’ve aged?", category: "Relationships", intensity: "medium" },
  { id: "less_018", deckId: "deep_lessons", question: "What lesson did you learn about 'saving' people who don't want to be saved?", category: "Relationships", intensity: "medium" },
  { id: "less_019", deckId: "deep_lessons", question: "What did you learn from your first-ever boss?", category: "Work", intensity: "mild" },
  { id: "less_020", deckId: "deep_lessons", question: "What is the kindest way you’ve learned to say 'no'?", category: "Relationships", intensity: "medium" },

  //   Category: Career & Ambition
  { id: "less_021", deckId: "deep_lessons", question: "What did you learn from the job that you were fired from (or quit in a rage)?", category: "Work", intensity: "medium" },
  { id: "less_022", deckId: "deep_lessons", question: "Is 'following your passion' actually good advice, or a recipe for burnout?", category: "Work", intensity: "medium" },
  { id: "less_023", deckId: "deep_lessons", question: "What have you learned about the relationship between money and happiness?", category: "Work", intensity: "medium" },
  { id: "less_024", deckId: "deep_lessons", question: "What is the most valuable professional skill you learned outside of school?", category: "Work", intensity: "mild" },
  { id: "less_025", deckId: "deep_lessons", question: "How do you handle the lesson of 'not being the smartest person in the room'?", category: "Work", intensity: "medium" },
  { id: "less_026", deckId: "deep_lessons", question: "What did you learn about the cost of 'climbing the ladder'?", category: "Work", intensity: "deep" },
  { id: "less_027", deckId: "deep_lessons", question: "What is a lesson you learned about office politics the hard way?", category: "Work", intensity: "medium" },
  { id: "less_028", deckId: "deep_lessons", question: "How do you define 'success' now that you’ve seen what 'stress' looks like?", category: "Work", intensity: "deep" },
  { id: "less_029", deckId: "deep_lessons", question: "What did you learn about the importance of 'unplugging'?", category: "Work", intensity: "medium" },
  { id: "less_030", deckId: "deep_lessons", question: "What is a piece of advice you’d give to someone starting their first day at your job?", category: "Work", intensity: "medium" },

  //   Category: Self & Wisdom
  { id: "less_031", deckId: "deep_lessons", question: "What is the best piece of advice you ever ignored, and why was that a mistake?", category: "Wisdom", intensity: "medium" },
  { id: "less_032", deckId: "deep_lessons", question: "What have you learned about your own 'limitations'?", category: "Self", intensity: "deep" },
  { id: "less_033", deckId: "deep_lessons", question: "What is the difference between 'growing up' and 'growing old'?", category: "Wisdom", intensity: "medium" },
  { id: "less_034", deckId: "deep_lessons", question: "How do you handle the lesson that 'you can't please everyone'?", category: "Self", intensity: "medium" },
  { id: "less_035", deckId: "deep_lessons", question: "What did a period of being completely alone teach you?", category: "Self", intensity: "deep" },
  { id: "less_036", deckId: "deep_lessons", question: "What have you learned about your physical health that you wish you knew at 18?", category: "Wisdom", intensity: "medium" },
  { id: "less_037", deckId: "deep_lessons", question: "What is the most 'expensive' lesson you’ve ever paid for (literally or figuratively)?", category: "Wisdom", intensity: "medium" },
  { id: "less_038", deckId: "deep_lessons", question: "What have you learned about 'ego' and when to set it aside?", category: "Self", intensity: "deep" },
  { id: "less_039", deckId: "deep_lessons", question: "What was the most profound realization you’ve had during a time of silence?", category: "Wisdom", intensity: "deep" },
  { id: "less_040", deckId: "deep_lessons", question: "If you could write a letter to your 20-year-old self, what would the first sentence be?", category: "Wisdom", intensity: "deep" },

  //   Category: Survival & Resilience
  { id: "less_041", deckId: "deep_lessons", question: "What did you learn about yourself when you were truly broke?", category: "Resilience", intensity: "medium" },
  { id: "less_042", deckId: "deep_lessons", question: "How do you handle the lesson of 'unavoidable grief'?", category: "Resilience", intensity: "high" },
  { id: "less_043", deckId: "deep_lessons", question: "What was your biggest takeaway from the most stressful year of your life?", category: "Resilience", intensity: "deep" },
  { id: "less_044", deckId: "deep_lessons", question: "What have you learned about the art of 'patience'?", category: "Resilience", intensity: "mild" },
  { id: "less_045", deckId: "deep_lessons", question: "How do you bounce back from being publically embarrassed?", category: "Resilience", intensity: "medium" },
  { id: "less_046", deckId: "deep_lessons", question: "What did you learn from the time you were 'rejected' from something you really wanted?", category: "Resilience", intensity: "deep" },
  { id: "less_047", deckId: "deep_lessons", question: "What have you learned about your own 'breaking point'?", category: "Resilience", intensity: "deep" },
  { id: "less_048", deckId: "deep_lessons", question: "What is your 'recovery' ritual for when life knocks you down?", category: "Resilience", intensity: "medium" },
  { id: "less_049", deckId: "deep_lessons", question: "What did you learn about the importance of 'asking for help'?", category: "Resilience", intensity: "medium" },
  { id: "less_050", deckId: "deep_lessons", question: "What is a struggle you are currently 'learning' from right now?", category: "Resilience", intensity: "high" },

  //   Category: Legacy & Final Lessons
  { id: "less_051", deckId: "deep_lessons", question: "If you were to die today, what is the most important lesson you’d be leaving behind?", category: "Legacy", intensity: "deep" },
  { id: "less_052", deckId: "deep_lessons", question: "What do you want to be 'known for' in your family line?", category: "Legacy", intensity: "medium" },
  { id: "less_053", deckId: "deep_lessons", question: "What is one mistake you hope your future children never make?", category: "Legacy", intensity: "deep" },
  { id: "less_054", deckId: "deep_lessons", question: "How do you want to be remembered by the people you work with?", category: "Legacy", intensity: "medium" },
  { id: "less_055", deckId: "deep_lessons", question: "What does 'dying with dignity' mean to you?", category: "Legacy", intensity: "high" },
  { id: "less_056", deckId: "deep_lessons", question: "What is the most important lesson your grandparents taught you by example?", category: "Roots", intensity: "medium" },
  { id: "less_057", deckId: "deep_lessons", question: "If you could change one thing about the world, what would it be based on your experiences?", category: "Legacy", intensity: "deep" },
  { id: "less_058", deckId: "deep_lessons", question: "What is the 'ultimate' lesson of your life so far in one sentence?", category: "Legacy", intensity: "deep" },
  { id: "less_059", deckId: "deep_lessons", question: "Do you believe we ever truly 'stop' learning, or is life just one long class?", category: "Legacy", intensity: "medium" },
  { id: "less_060", deckId: "deep_lessons", question: "What is the next big 'lesson' you feel you are about to encounter?", category: "Legacy", intensity: "high" },

  //   Category: Self-Awareness
  { id: "eq_001", deckId: "deep_emotions", question: "Which emotion do you find the hardest to sit with: Anger, Sadness, or Guilt?", category: "Awareness", intensity: "deep" },
  { id: "eq_002", deckId: "deep_emotions", question: "How do you know when you’ve reached your emotional 'breaking point'?", category: "Awareness", intensity: "deep" },
  { id: "eq_003", deckId: "deep_emotions", question: "What is your 'emotional default' setting when you're tired?", category: "Awareness", intensity: "medium" },
  { id: "eq_004", deckId: "deep_emotions", question: "Can you usually name what you're feeling in the moment, or does it take time to process?", category: "Awareness", intensity: "medium" },
  { id: "eq_005", deckId: "deep_emotions", question: "What physical sensation in your body tells you that you're getting anxious?", category: "Awareness", intensity: "medium" },
  { id: "eq_006", deckId: "deep_emotions", question: "Do you tend to over-intellectualize your feelings instead of actually feeling them?", category: "Awareness", intensity: "deep" },
  { id: "eq_007", deckId: "deep_emotions", question: "What is a 'trigger' for you that you haven't quite figured out yet?", category: "Awareness", intensity: "deep" },
  { id: "eq_008", deckId: "deep_emotions", question: "Which 'positive' emotion do you struggle to let yourself feel fully?", category: "Awareness", intensity: "deep" },
  { id: "eq_009", deckId: "deep_emotions", question: "If your current mood was a weather pattern, what would it be?", category: "Awareness", intensity: "mild" },
  { id: "eq_010", deckId: "deep_emotions", question: "How much of your day is spent acting based on how you feel versus what you need to do?", category: "Awareness", intensity: "medium" },

  //   Category: Empathy & Connection
  { id: "eq_011", deckId: "deep_emotions", question: "Do you consider yourself an 'empath,' or do you find it hard to feel what others feel?", category: "Empathy", intensity: "medium" },
  { id: "eq_012", deckId: "deep_emotions", question: "How do you react when someone is crying in front of you? Do you want to fix it or just sit with them?", category: "Empathy", intensity: "medium" },
  { id: "eq_013", deckId: "deep_emotions", question: "Can you feel the 'energy' of a room the moment you walk in?", category: "Empathy", intensity: "mild" },
  { id: "eq_014", deckId: "deep_emotions", question: "What is the kindest way someone has ever validated your feelings?", category: "Empathy", intensity: "medium" },
  { id: "eq_015", deckId: "deep_emotions", question: "Whose pain in your life do you feel most intensely besides your own?", category: "Empathy", intensity: "deep" },
  { id: "eq_016", deckId: "deep_emotions", question: "Are you better at giving emotional support or receiving it?", category: "Empathy", intensity: "medium" },
  { id: "eq_017", deckId: "deep_emotions", question: "What is the biggest 'empathy gap' you see in society today?", category: "Empathy", intensity: "medium" },
  { id: "eq_018", deckId: "deep_emotions", question: "How do you handle people who have a very low emotional IQ?", category: "Empathy", intensity: "medium" },
  { id: "eq_019", deckId: "deep_emotions", question: "When you disagree with someone, can you still see why they feel the way they do?", category: "Empathy", intensity: "deep" },
  { id: "eq_020", deckId: "deep_emotions", question: "What does 'being heard' actually feel like to you?", category: "Empathy", intensity: "deep" },

  //   Category: Regulation & Resilience
  { id: "eq_021", deckId: "deep_emotions", question: "What is your healthiest coping mechanism for dealing with anger?", category: "Regulation", intensity: "medium" },
  { id: "eq_022", deckId: "deep_emotions", question: "Do you have an 'emotional safety net'—a person or activity that always grounds you?", category: "Regulation", intensity: "medium" },
  { id: "eq_023", deckId: "deep_emotions", question: "How long does it take for you to recover from a major emotional setback?", category: "Regulation", intensity: "deep" },
  { id: "eq_024", deckId: "deep_emotions", question: "Are you able to 'self-soothe,' or do you always need external validation?", category: "Regulation", intensity: "deep" },
  { id: "eq_025", deckId: "deep_emotions", question: "What is one emotional habit you’re trying to break?", category: "Regulation", intensity: "deep" },
  { id: "eq_026", deckId: "deep_emotions", question: "How do you handle 'shame' when it hits you unexpectedly?", category: "Regulation", intensity: "high" },
  { id: "eq_027", deckId: "deep_emotions", question: "Can you be happy for others even when you’re going through a personal tragedy?", category: "Regulation", intensity: "deep" },
  { id: "eq_028", deckId: "deep_emotions", question: "What is your 'go-to' song for when you need to have a good cry?", category: "Regulation", intensity: "mild" },
  { id: "eq_029", deckId: "deep_emotions", question: "Do you repress your feelings until they explode, or are you a 'leaker'?", category: "Regulation", intensity: "medium" },
  { id: "eq_030", deckId: "deep_emotions", question: "What does 'inner peace' look like for you in a high-stress world?", category: "Regulation", intensity: "medium" },

  //   Category: Relationships & Conflict
  { id: "eq_031", deckId: "deep_emotions", question: "In a relationship, do you prioritize emotional safety or intellectual compatibility?", category: "Relationships", intensity: "deep" },
  { id: "eq_032", deckId: "deep_emotions", question: "What is your 'attachment style' in friendships or romance?", category: "Relationships", intensity: "deep" },
  { id: "eq_033", deckId: "deep_emotions", question: "How do you handle a partner or friend who is emotionally distant?", category: "Relationships", intensity: "medium" },
  { id: "eq_034", deckId: "deep_emotions", question: "Is it possible to love someone and not trust them emotionally?", category: "Relationships", intensity: "deep" },
  { id: "eq_035", deckId: "deep_emotions", question: "What is the 'cleanest' way to end a friendship that is no longer working?", category: "Relationships", intensity: "medium" },
  { id: "eq_036", deckId: "deep_emotions", question: "How do you communicate your needs without feeling like a burden?", category: "Relationships", intensity: "deep" },
  { id: "eq_037", deckId: "deep_emotions", question: "What is one emotional boundary you’ve set recently that you’re proud of?", category: "Relationships", intensity: "medium" },
  { id: "eq_038", deckId: "deep_emotions", question: "Do you ever hold your emotions 'hostage' during an argument?", category: "Relationships", intensity: "high" },
  { id: "eq_039", deckId: "deep_emotions", question: "How much of your past baggage do you bring into new connections?", category: "Relationships", intensity: "deep" },
  { id: "eq_040", deckId: "deep_emotions", question: "Can you love someone for who they are, or do you love their potential?", category: "Relationships", intensity: "deep" },

  //   Category: Vulnerability
  { id: "eq_041", deckId: "deep_emotions", question: "When was the last time you felt truly 'seen' by another human being?", category: "Vulnerability", intensity: "deep" },
  { id: "eq_042", deckId: "deep_emotions", question: "Is vulnerability a strength or a risk to you?", category: "Vulnerability", intensity: "medium" },
  { id: "eq_043", deckId: "deep_emotions", question: "What is one thing you’re too afraid to tell the people closest to you?", category: "Vulnerability", intensity: "high" },
  { id: "eq_044", deckId: "deep_emotions", question: "What part of your 'true self' do you hide from the public world?", category: "Vulnerability", intensity: "deep" },
  { id: "eq_045", deckId: "deep_emotions", question: "Do you find it easier to be vulnerable with strangers or with people you love?", category: "Vulnerability", intensity: "medium" },
  { id: "eq_046", deckId: "deep_emotions", question: "What is the 'scariest' emotion for you to express out loud?", category: "Vulnerability", intensity: "high" },
  { id: "eq_047", deckId: "deep_emotions", question: "What is the most 'unguarded' moment you’ve had this month?", category: "Vulnerability", intensity: "medium" },
  { id: "eq_048", deckId: "deep_emotions", question: "How do you feel when someone is being radically honest with you?", category: "Vulnerability", intensity: "deep" },
  { id: "eq_049", deckId: "deep_emotions", question: "If you could remove the fear of judgment, what would you do differently today?", category: "Vulnerability", intensity: "deep" },
  { id: "eq_050", deckId: "deep_emotions", question: "What is the price you pay for keeping your guard up?", category: "Vulnerability", intensity: "deep" },

  //   Category: Reflection & Growth
  { id: "eq_051", deckId: "deep_emotions", question: "What is the biggest emotional lesson you’ve learned from a heartbreak?", category: "Reflection", intensity: "deep" },
  { id: "eq_052", deckId: "deep_emotions", question: "How has your 'emotional vocabulary' expanded as you've gotten older?", category: "Reflection", intensity: "medium" },
  { id: "eq_053", deckId: "deep_emotions", question: "Do you believe we ever truly 'get over' grief, or do we just learn to live with it?", category: "Reflection", intensity: "deep" },
  { id: "eq_054", deckId: "deep_emotions", question: "What is one thing about your emotional nature that you hope never changes?", category: "Reflection", intensity: "medium" },
  { id: "eq_055", deckId: "deep_emotions", question: "If you could go back and give your 'angstiest' self one piece of advice, what would it be?", category: "Reflection", intensity: "medium" },
  { id: "eq_056", deckId: "deep_emotions", question: "What does 'self-love' actually look like in your daily actions?", category: "Reflection", intensity: "medium" },
  { id: "eq_057", deckId: "deep_emotions", question: "How do you want your emotional legacy to be remembered?", category: "Reflection", intensity: "deep" },
  { id: "eq_058", deckId: "deep_emotions", question: "What is the most 'emotionally intelligent' thing you’ve ever done?", category: "Reflection", intensity: "deep" },
  { id: "eq_059", deckId: "deep_emotions", question: "Is your 'heart' or your 'head' currently winning the battle of your life?", category: "Reflection", intensity: "medium" },
  { id: "eq_060", deckId: "deep_emotions", question: "What is one feeling you’re having right now that you haven't spoken yet?", category: "Reflection", intensity: "deep" },

  //   Category: Space & Scale
  { id: "univ_001", deckId: "deep_existence", question: "Does the vastness of the universe make you feel small and insignificant, or connected and special?", category: "Scale", intensity: "deep" },
  { id: "univ_002", deckId: "deep_existence", question: "If you could take a one-way trip to Mars to start a colony, would you go?", category: "Space", intensity: "medium" },
  { id: "univ_003", deckId: "deep_existence", question: "What is the most mind-blowing fact you know about space?", category: "Wonder", intensity: "mild" },
  { id: "univ_004", deckId: "deep_existence", question: "If you could see the birth of a star or the death of a galaxy, which would you choose?", category: "Wonder", intensity: "medium" },
  { id: "univ_005", deckId: "deep_existence", question: "Do you believe the universe has an 'edge,' or is it truly infinite?", category: "Space", intensity: "medium" },
  { id: "univ_006", deckId: "deep_existence", question: "What is the most beautiful thing you've ever seen in the night sky?", category: "Wonder", intensity: "mild" },
  { id: "univ_007", deckId: "deep_existence", question: "If we are alone in the universe, is that more or less scary than having neighbors?", category: "Space", intensity: "deep" },
  { id: "univ_008", deckId: "deep_existence", question: "If you could name a planet after one person, who would it be?", category: "Space", intensity: "mild" },
  { id: "univ_009", deckId: "deep_existence", question: "How would the discovery of alien life change your personal philosophy?", category: "Space", intensity: "deep" },
  { id: "univ_010", deckId: "deep_existence", question: "Would you want to live long enough to see humans colonize another solar system?", category: "Future", intensity: "medium" },

  //   Category: Time & Origins
  { id: "univ_011", deckId: "deep_existence", question: "If you could travel to the beginning of time or the end of time, which would you pick?", category: "Time", intensity: "medium" },
  { id: "univ_012", deckId: "deep_existence", question: "Do you believe time is a linear path or a loop where everything repeats?", category: "Time", intensity: "deep" },
  { id: "univ_013", deckId: "deep_existence", question: "If 'past you' could see you now, would they be surprised by the world you live in?", category: "Time", intensity: "medium" },
  { id: "univ_014", deckId: "deep_existence", question: "Is time travel theoretically possible, or is the past 'locked' forever?", category: "Time", intensity: "medium" },
  { id: "univ_015", deckId: "deep_existence", question: "If we are made of 'stardust,' does that make the universe a living thing?", category: "Origins", intensity: "deep" },
  { id: "univ_016", deckId: "deep_existence", question: "What do you think happened before the Big Bang?", category: "Origins", intensity: "deep" },
  { id: "univ_017", deckId: "deep_existence", question: "Do you think we are living in a simulation, or is this 'base reality'?", category: "Existence", intensity: "high" },
  { id: "univ_018", deckId: "deep_existence", question: "Is the universe conscious of our existence?", category: "Existence", intensity: "deep" },
  { id: "univ_019", deckId: "deep_existence", question: "If you could find the answer to one cosmic mystery, what would it be?", category: "Origins", intensity: "medium" },
  { id: "univ_020", deckId: "deep_existence", question: "Does the universe owe us anything?", category: "Existence", intensity: "deep" },

  //   Category: Human Potential & AI
  { id: "univ_021", deckId: "deep_existence", question: "Will artificial intelligence eventually become the dominant 'life form' of the universe?", category: "Future", intensity: "deep" },
  { id: "univ_022", deckId: "deep_existence", question: "Is it our destiny to leave Earth, or is this our only home?", category: "Future", intensity: "medium" },
  { id: "univ_023", deckId: "deep_existence", question: "If you could upload your consciousness to a digital universe, would you?", category: "Future", intensity: "high" },
  { id: "univ_024", deckId: "deep_existence", question: "What is the most 'dangerous' technology humanity has ever created?", category: "Future", intensity: "medium" },
  { id: "univ_025", deckId: "deep_existence", question: "Do you think we will solve the mystery of death within your lifetime?", category: "Future", intensity: "deep" },
  { id: "univ_026", deckId: "deep_existence", question: "If an alien race offered us all their knowledge in exchange for our freedom, would we take it?", category: "Hypotheticals", intensity: "medium" },
  { id: "univ_027", deckId: "deep_existence", question: "Should we be trying to contact other civilizations, or staying hidden?", category: "Future", intensity: "medium" },
  { id: "univ_028", deckId: "deep_existence", question: "What is one 'sci-fi' invention you wish was real right now?", category: "Future", intensity: "mild" },
  { id: "univ_029", deckId: "deep_existence", question: "Are humans a 'blip' in cosmic history, or the main event?", category: "Scale", intensity: "deep" },
  { id: "univ_030", deckId: "deep_existence", question: "If we created a perfect AI, would it have a soul?", category: "Existence", intensity: "high" },

  //   Category: Physics & Reality
  { id: "univ_031", deckId: "deep_existence", question: "Do you believe in the 'Multiverse'—that every choice you make creates a new reality?", category: "Physics", intensity: "medium" },
  { id: "univ_032", deckId: "deep_existence", question: "Is gravity a force, or just the way space-time curves around us?", category: "Physics", intensity: "mild" },
  { id: "univ_033", deckId: "deep_existence", question: "If you could enter a black hole and see what was on the other side, would you do it?", category: "Physics", intensity: "medium" },
  { id: "univ_034", deckId: "deep_existence", question: "Is the universe 'coded' in mathematics, or is math just a human invention?", category: "Reality", intensity: "deep" },
  { id: "univ_035", deckId: "deep_existence", question: "If 'light' is the fastest thing in the universe, why is 'darkness' always there first?", category: "Reality", intensity: "mild" },
  { id: "univ_036", deckId: "deep_existence", question: "Is it possible that there are dimensions we simply cannot perceive?", category: "Reality", intensity: "medium" },
  { id: "univ_037", deckId: "deep_existence", question: "If you could change one physical law of the universe (like gravity), what would you change?", category: "Reality", intensity: "medium" },
  { id: "univ_038", deckId: "deep_existence", question: "Does the observer change the outcome of an event just by watching it?", category: "Physics", intensity: "deep" },
  { id: "univ_039", deckId: "deep_existence", question: "If energy can never be destroyed, where does ours go when we die?", category: "Existence", intensity: "high" },
  { id: "univ_040", deckId: "deep_existence", question: "Is the 'self' just a collection of particles or something more?", category: "Reality", intensity: "deep" },

  //   Category: Existential Questions
  { id: "univ_041", deckId: "deep_existence", question: "What is the meaning of life if the universe will eventually end?", category: "Meaning", intensity: "high" },
  { id: "univ_042", deckId: "deep_existence", question: "If you could talk to the universe, what is the first thing you'd ask?", category: "Meaning", intensity: "medium" },
  { id: "univ_043", deckId: "deep_existence", question: "Is 'destiny' a cosmic script or a human comfort?", category: "Meaning", intensity: "deep" },
  { id: "univ_044", deckId: "deep_existence", question: "Why is there 'something' rather than 'nothing'?", category: "Origins", intensity: "high" },
  { id: "univ_045", deckId: "deep_existence", question: "Do you think the universe is 'fair'?", category: "Meaning", intensity: "medium" },
  { id: "univ_046", deckId: "deep_existence", question: "If you were the architect of the universe, what is the one thing you would have done differently?", category: "Hypotheticals", intensity: "medium" },
  { id: "univ_047", deckId: "deep_existence", question: "Is there a limit to human knowledge, or can we eventually know everything?", category: "Potential", intensity: "deep" },
  { id: "univ_048", deckId: "deep_existence", question: "If you found out you were the only 'real' person and everyone else was an illusion, how would you live?", category: "Reality", intensity: "high" },
  { id: "univ_049", deckId: "deep_existence", question: "Does the universe have a sense of humor?", category: "Meaning", intensity: "mild" },
  { id: "univ_050", deckId: "deep_existence", question: "What is the most 'miraculous' thing about being alive right now?", category: "Wonder", intensity: "medium" },

  //   Category: Connection & Final Thoughts
  { id: "univ_051", deckId: "deep_existence", question: "How does looking at the stars change your perspective on your daily problems?", category: "Scale", intensity: "medium" },
  { id: "univ_052", deckId: "deep_existence", question: "Do you believe in 'soulmates' across different timelines?", category: "Hypotheticals", intensity: "medium" },
  { id: "univ_053", deckId: "deep_existence", question: "If the universe is a book, what chapter are we in right now?", category: "Scale", intensity: "medium" },
  { id: "univ_054", deckId: "deep_existence", question: "What is your personal 'North Star'—the belief that guides you through the darkness?", category: "Meaning", intensity: "deep" },
  { id: "univ_055", deckId: "deep_existence", question: "If you could send a single message to the entire universe, what would it say?", category: "Scale", intensity: "deep" },
  { id: "univ_056", deckId: "deep_existence", question: "Is love a cosmic force or just a biological trick?", category: "Meaning", intensity: "deep" },
  { id: "univ_057", deckId: "deep_existence", question: "What is the 'quietest' place in the universe?", category: "Wonder", intensity: "mild" },
  { id: "univ_058", deckId: "deep_existence", question: "Do you think we are being watched by something beyond our understanding?", category: "Wonder", intensity: "high" },
  { id: "univ_059", deckId: "deep_existence", question: "If you could leave your mark on one planet, what would you leave?", category: "Scale", intensity: "medium" },
  { id: "univ_060", deckId: "deep_existence", question: "In the grand design of everything, what is the one thing that actually matters?", category: "Meaning", intensity: "high" },

  //   Category: Unfinished Business
  { id: "mort_001", deckId: "deep_mortality", question: "If you were told you had exactly one year left to live, what is the first thing you would quit?", category: "Priorities", intensity: "high" },
  { id: "mort_002", deckId: "deep_mortality", question: "What is a dream you’ve shelved 'until the time is right' that you need to start now?", category: "Dreams", intensity: "medium" },
  { id: "mort_003", deckId: "deep_mortality", question: "Who is the one person you need to forgive before you die?", category: "Relationships", intensity: "high" },
  { id: "mort_004", deckId: "deep_mortality", question: "What is a 'secret' ambition you've never told anyone because you're afraid of being laughed at?", category: "Dreams", intensity: "medium" },
  { id: "mort_005", deckId: "deep_mortality", question: "If you died tomorrow, what would be your biggest 'what if'?", category: "Regret", intensity: "high" },
  { id: "mort_006", deckId: "deep_mortality", question: "What is the one thing you want to create or build that will outlast you?", category: "Legacy", intensity: "deep" },
  { id: "mort_007", deckId: "deep_mortality", question: "Is there a place you feel a soul-deep pull to visit before you leave this earth?", category: "Adventure", intensity: "mild" },
  { id: "mort_008", deckId: "deep_mortality", question: "What is the one 'risky' thing you’ve always wanted to do but were too afraid of the consequences?", category: "Adventure", intensity: "medium" },
  { id: "mort_009", deckId: "deep_mortality", question: "If you had a 'last meal,' who would be at the table with you?", category: "Relationships", intensity: "medium" },
  { id: "mort_010", deckId: "deep_mortality", question: "What is a skill you want to master, even if you only get to use it for a day?", category: "Growth", intensity: "mild" },

  //   Category: The Reality of Time
  { id: "mort_011", deckId: "deep_mortality", question: "Does the thought of your own mortality motivate you or paralyze you?", category: "Reflection", intensity: "deep" },
  { id: "mort_012", deckId: "deep_mortality", question: "How much of your life have you spent living for other people's expectations?", category: "Reflection", intensity: "high" },
  { id: "mort_013", deckId: "deep_mortality", question: "If you could see a countdown clock of your remaining time, would you look at it?", category: "Hypothetical", intensity: "deep" },
  { id: "mort_014", deckId: "deep_mortality", question: "What is a 'small joy' you want to experience every single day for the rest of your life?", category: "Priorities", intensity: "mild" },
  { id: "mort_015", deckId: "deep_mortality", question: "What is the most 'alive' you’ve ever felt? How do you get back to that feeling?", category: "Reflection", intensity: "medium" },
  { id: "mort_016", deckId: "deep_mortality", question: "If you were given $10 million but only 24 hours to live, what would you do with the money?", category: "Priorities", intensity: "medium" },
  { id: "mort_017", deckId: "deep_mortality", question: "What is one thing you’ve been worrying about lately that won't matter at all in your final moments?", category: "Priorities", intensity: "medium" },
  { id: "mort_018", deckId: "deep_mortality", question: "How do you want your funeral or memorial to feel? Somber or a celebration?", category: "Legacy", intensity: "deep" },
  { id: "mort_019", deckId: "deep_mortality", question: "What is the most 'meaningless' thing you currently spend too much time on?", category: "Reflection", intensity: "medium" },
  { id: "mort_020", deckId: "deep_mortality", question: "If you could witness one future event 100 years from now, what would it be?", category: "Hypothetical", intensity: "mild" },

  //   Category: Legacy & Memory
  { id: "mort_021", deckId: "deep_mortality", question: "What is the single most important lesson you want to leave for the next generation?", category: "Legacy", intensity: "deep" },
  { id: "mort_022", deckId: "deep_mortality", question: "What is one thing you want to be remembered for that has nothing to do with your job?", category: "Legacy", intensity: "medium" },
  { id: "mort_023", deckId: "deep_mortality", question: "If you could record one 30-second message for everyone you love to watch after you’re gone, what would you say?", category: "Legacy", intensity: "high" },
  { id: "mort_024", deckId: "deep_mortality", question: "Whose life have you changed for the better so far?", category: "Reflection", intensity: "medium" },
  { id: "mort_025", deckId: "deep_mortality", question: "What is an heirloom or physical object of yours that you want passed down?", category: "Legacy", intensity: "mild" },
  { id: "mort_026", deckId: "deep_mortality", question: "If your life was summarized in a single sentence on a tombstone, what would it say?", category: "Legacy", intensity: "deep" },
  { id: "mort_027", deckId: "deep_mortality", question: "What is a 'bad habit' or trait you hope dies with you, rather than being passed on?", category: "Legacy", intensity: "high" },
  { id: "mort_028", deckId: "deep_mortality", question: "How much do you care about being 'famous' after you die versus being 'loved' while alive?", category: "Reflection", intensity: "medium" },
  { id: "mort_029", deckId: "deep_mortality", question: "What is the most 'heroic' thing you’ve ever done?", category: "Reflection", intensity: "medium" },
  { id: "mort_030", deckId: "deep_mortality", question: "If you could choose your own 'last words,' what would they be?", category: "Legacy", intensity: "deep" },

  //   Category: Experiences & Senses
  { id: "mort_031", deckId: "deep_mortality", question: "What is a natural phenomenon (e.g., Aurora Borealis, total eclipse) you must see in person?", category: "Adventure", intensity: "mild" },
  { id: "mort_032", deckId: "deep_mortality", question: "What is a 'fear' you want to face head-on just to say you did it?", category: "Growth", intensity: "medium" },
  { id: "mort_033", deckId: "deep_mortality", question: "If you could spend one day in the body of another species, which would it be?", category: "Hypothetical", intensity: "mild" },
  { id: "mort_034", deckId: "deep_mortality", question: "What is the most 'beautiful' experience you have left to have?", category: "Dreams", intensity: "medium" },
  { id: "mort_035", deckId: "deep_mortality", question: "If you could live one year of your life over again without changing anything, which year would it be?", category: "Reflection", intensity: "medium" },
  { id: "mort_036", deckId: "deep_mortality", question: "Is there a book you feel you *must* read before your time is up?", category: "Growth", intensity: "mild" },
  { id: "mort_037", deckId: "deep_mortality", question: "What is a conversation you’ve been avoiding that you need to have?", category: "Relationships", intensity: "high" },
  { id: "mort_038", deckId: "deep_mortality", question: "What is the most 'adventurous' version of yourself like?", category: "Reflection", intensity: "medium" },
  { id: "mort_039", deckId: "deep_mortality", question: "If you could go to space, but it was dangerous, would you do it?", category: "Adventure", intensity: "medium" },
  { id: "mort_040", deckId: "deep_mortality", question: "What is a physical challenge you want to complete while your body is able?", category: "Adventure", intensity: "mild" },

  //   Category: Relationships & Reconciliation
  { id: "mort_041", deckId: "deep_mortality", question: "Who is the first person you’d call if you found out the world was ending in 2 hours?", category: "Relationships", intensity: "high" },
  { id: "mort_042", deckId: "deep_mortality", question: "What is a 'thank you' you’ve never said that you need to say?", category: "Priorities", intensity: "medium" },
  { id: "mort_043", deckId: "deep_mortality", question: "Is there anyone you have a 'grudge' against that truly doesn't matter anymore?", category: "Reflection", intensity: "medium" },
  { id: "mort_044", deckId: "deep_mortality", question: "How would you want your children (or future generations) to describe you?", category: "Legacy", intensity: "deep" },
  { id: "mort_045", deckId: "deep_mortality", question: "What is the kindest thing you can do for someone before the week is over?", category: "Priorities", intensity: "mild" },
  { id: "mort_046", deckId: "deep_mortality", question: "If you could give one gift to the world, what would it be?", category: "Legacy", intensity: "deep" },
  { id: "mort_047", deckId: "deep_mortality", question: "What part of your 'digital life' (social media, etc.) would you want deleted immediately if you died?", category: "Reflection", intensity: "medium" },
  { id: "mort_048", deckId: "deep_mortality", question: "Who do you want to be holding your hand at the very end?", category: "Relationships", intensity: "high" },
  { id: "mort_049", deckId: "deep_mortality", question: "What is the most 'selfless' act on your bucket list?", category: "Priorities", intensity: "medium" },
  { id: "mort_050", deckId: "deep_mortality", question: "How has death (or the loss of a loved one) changed how you live your daily life?", category: "Reflection", intensity: "deep" },

  //   Category: Final Reflections
  { id: "mort_051", deckId: "deep_mortality", question: "Are you more afraid of the act of dying or of not having lived enough?", category: "Reflection", intensity: "high" },
  { id: "mort_052", deckId: "deep_mortality", question: "If you were reincarnated, what lesson would you want to carry into your next life?", category: "Hypothetical", intensity: "deep" },
  { id: "mort_053", deckId: "deep_mortality", question: "What is the one place on earth that feels like 'heaven' to you?", category: "Reflection", intensity: "mild" },
  { id: "mort_054", deckId: "deep_mortality", question: "If you could know the answer to one 'big' question before you die, what would it be?", category: "Reflection", intensity: "deep" },
  { id: "mort_055", deckId: "deep_mortality", question: "What does 'dying with no regrets' mean to you personally?", category: "Priorities", intensity: "high" },
  { id: "mort_056", deckId: "deep_mortality", question: "What is one thing you’re proud of that no one else knows about?", category: "Reflection", intensity: "medium" },
  { id: "mort_057", deckId: "deep_mortality", question: "If you could leave a 'map' for someone to find your favorite place, where would it lead?", category: "Legacy", intensity: "mild" },
  { id: "mort_058", deckId: "deep_mortality", question: "What is the most 'peaceful' version of your future you can imagine?", category: "Dreams", intensity: "medium" },
  { id: "mort_059", deckId: "deep_mortality", question: "What are you 'waiting' for?", category: "Reflection", intensity: "high" },
  { id: "mort_060", deckId: "deep_mortality", question: "If this was your final answer to your final question, what would you say to the person across from you?", category: "Priorities", intensity: "high" },

  //   Category: The True Self
  { id: "ident_001", deckId: "deep_identity", question: "Who are you when no one is watching and you have nothing to achieve?", category: "Essence", intensity: "deep" },
  { id: "ident_002", deckId: "deep_identity", question: "What is a 'label' people have put on you that you’ve spent your life trying to shake off?", category: "Perception", intensity: "deep" },
  { id: "ident_003", deckId: "deep_identity", question: "What is the most 'authentic' part of your personality?", category: "Essence", intensity: "medium" },
  { id: "ident_004", deckId: "deep_identity", question: "If you had to change your name and start a new life, what part of your character would stay the same?", category: "Essence", intensity: "deep" },
  { id: "ident_005", deckId: "deep_identity", question: "Do you define yourself more by your past or by your future potential?", category: "Perception", intensity: "medium" },
  { id: "ident_006", deckId: "deep_identity", question: "What is one 'contradiction' in your personality that you’ve made peace with?", category: "Essence", intensity: "deep" },
  { id: "ident_007", deckId: "deep_identity", question: "Which of your five senses feels most connected to your sense of self?", category: "Essence", intensity: "mild" },
  { id: "ident_008", deckId: "deep_identity", question: "What is the biggest 'lie' you tell yourself to get through the day?", category: "Self-Deception", intensity: "high" },
  { id: "ident_009", deckId: "deep_identity", question: "If you were a color, which one would represent your soul?", category: "Essence", intensity: "mild" },
  { id: "ident_010", deckId: "deep_identity", question: "What is the one thing you would never, ever do, regardless of the reward?", category: "Values", intensity: "high" },

  //   Category: Social Masks
  { id: "ident_011", deckId: "deep_identity", question: "What is the 'mask' you wear when you’re in a room full of strangers?", category: "Masks", intensity: "medium" },
  { id: "ident_012", deckId: "deep_identity", question: "Who in your life sees the 'real' you, and why them?", category: "Masks", intensity: "deep" },
  { id: "ident_013", deckId: "deep_identity", question: "Do you have a 'work personality' that is completely different from your 'home personality'?", category: "Masks", intensity: "medium" },
  { id: "ident_014", deckId: "deep_identity", question: "What is a part of yourself that you hide because you think it's 'too much' for people?", category: "Masks", intensity: "high" },
  { id: "ident_015", deckId: "deep_identity", question: "Have you ever 'performed' an emotion you didn't actually feel just to fit in?", category: "Masks", intensity: "medium" },
  { id: "ident_016", deckId: "deep_identity", question: "How much of your identity is tied to your physical appearance?", category: "Self-Image", intensity: "medium" },
  { id: "ident_017", deckId: "deep_identity", question: "What is the biggest misconception people have about you when they first meet you?", category: "Perception", intensity: "medium" },
  { id: "ident_018", deckId: "deep_identity", question: "Do you feel like an 'imposter' in your own life? When?", category: "Self-Image", intensity: "deep" },
  { id: "ident_019", deckId: "deep_identity", question: "What is one thing you’ve started doing purely because it’s 'on trend,' not because you like it?", category: "Masks", intensity: "mild" },
  { id: "ident_020", deckId: "deep_identity", question: "If everyone you know disappeared, who would you become?", category: "Essence", intensity: "high" },

  //   Category: Values & Moral Compass
  { id: "ident_021", deckId: "deep_identity", question: "What is the one value you are willing to lose everything for?", category: "Values", intensity: "high" },
  { id: "ident_022", deckId: "deep_identity", question: "In your heart of hearts, are you a leader or a follower?", category: "Essence", intensity: "medium" },
  { id: "ident_023", deckId: "deep_identity", question: "What is a 'moral grey area' where you find yourself constantly conflicted?", category: "Values", intensity: "deep" },
  { id: "ident_024", deckId: "deep_identity", question: "Do you believe your 'identity' is fixed, or is it a story you rewrite every day?", category: "Essence", intensity: "deep" },
  { id: "ident_025", deckId: "deep_identity", question: "What is the most 'disrespectful' thing someone can do to your character?", category: "Values", intensity: "medium" },
  { id: "ident_026", deckId: "deep_identity", question: "Are you more motivated by a desire for love or a desire for power?", category: "Essence", intensity: "high" },
  { id: "ident_027", deckId: "deep_identity", question: "What do you want to be 'right' about more than anything else?", category: "Values", intensity: "medium" },
  { id: "ident_028", deckId: "deep_identity", question: "How do you define 'integrity' in your own words?", category: "Values", intensity: "deep" },
  { id: "ident_029", deckId: "deep_identity", question: "Is your 'soul' older or younger than your biological age?", category: "Essence", intensity: "mild" },
  { id: "ident_030", deckId: "deep_identity", question: "What is a 'hill you are willing to die on'?", category: "Values", intensity: "medium" },

  //   Category: Transformation & Change
  { id: "ident_031", deckId: "deep_identity", question: "What is the biggest way you’ve changed in the last five years?", category: "Growth", intensity: "medium" },
  { id: "ident_032", deckId: "deep_identity", question: "What is a part of 'old you' that you miss dearly?", category: "Growth", intensity: "deep" },
  { id: "ident_033", deckId: "deep_identity", question: "Was there a single event that 'shattered' your old identity and forced you to rebuild?", category: "Growth", intensity: "high" },
  { id: "ident_034", deckId: "deep_identity", question: "What are you currently 'becoming'?", category: "Growth", intensity: "deep" },
  { id: "ident_035", deckId: "deep_identity", question: "If you could delete one memory to change who you are today, would you do it?", category: "Growth", intensity: "high" },
  { id: "ident_036", deckId: "deep_identity", question: "What is one thing you’ve learned to love about yourself that you used to hate?", category: "Growth", intensity: "medium" },
  { id: "ident_037", deckId: "deep_identity", question: "Do you feel like you are 'settling' into your identity or still searching for it?", category: "Essence", intensity: "deep" },
  { id: "ident_038", deckId: "deep_identity", question: "What is the most 'out of character' thing you’ve done that actually felt right?", category: "Growth", intensity: "medium" },
  { id: "ident_039", deckId: "deep_identity", question: "How much of your identity is tied to your cultural or family roots?", category: "Perception", intensity: "medium" },
  { id: "ident_040", deckId: "deep_identity", question: "If you lost your memory today, what would be the first thing your friends would tell you about 'you'?", category: "Essence", intensity: "deep" },

  //   Category: Fears of Being Known
  { id: "ident_041", deckId: "deep_identity", question: "What is the one thing about your character that you’re most afraid of people finding out?", category: "Self-Image", intensity: "high" },
  { id: "ident_042", deckId: "deep_identity", question: "Do you find it harder to be honest with yourself or with others?", category: "Self-Deception", intensity: "deep" },
  { id: "ident_043", deckId: "deep_identity", question: "What is the biggest 'secret' about your personality?", category: "Essence", intensity: "high" },
  { id: "ident_044", deckId: "deep_identity", question: "Does 'being known' feel like intimacy or like a threat to you?", category: "Self-Image", intensity: "deep" },
  { id: "ident_045", deckId: "deep_identity", question: "What is the most 'vulnerable' thing you’ve ever admitted about yourself?", category: "Essence", intensity: "high" },
  { id: "ident_046", deckId: "deep_identity", question: "How do you handle it when someone correctly identifies a flaw you were trying to hide?", category: "Self-Image", intensity: "deep" },
  { id: "ident_047", deckId: "deep_identity", question: "Do you believe you are a 'good person'? Why or why not?", category: "Essence", intensity: "high" },
  { id: "ident_048", deckId: "deep_identity", question: "What is one thing you want to be forgiven for, even if it’s just by yourself?", category: "Values", intensity: "high" },
  { id: "ident_049", deckId: "deep_identity", question: "What is the 'darkest' thought you’ve ever had about yourself?", category: "Self-Image", intensity: "high" },
  { id: "ident_050", deckId: "deep_identity", question: "How much of your 'self' is just a reaction to your insecurities?", category: "Essence", intensity: "deep" },

  //   Category: Final Reflection
  { id: "ident_051", deckId: "deep_identity", question: "If your life was a museum, what would be the most important exhibit?", category: "Reflection", intensity: "medium" },
  { id: "ident_052", deckId: "deep_identity", question: "What is the 'song of your soul'?", category: "Essence", intensity: "mild" },
  { id: "ident_053", deckId: "deep_identity", question: "What does 'home' look like in your mind?", category: "Essence", intensity: "medium" },
  { id: "ident_054", deckId: "deep_identity", question: "What is the one thing you want to be remembered for?", category: "Values", intensity: "deep" },
  { id: "ident_055", deckId: "deep_identity", question: "Are you your own best friend or your own worst enemy?", category: "Self-Image", intensity: "high" },
  { id: "ident_056", deckId: "deep_identity", question: "What is the biggest 'risk' you’ve taken on yourself?", category: "Growth", intensity: "medium" },
  { id: "ident_057", deckId: "deep_identity", question: "How do you want to feel when you are 80 years old looking back at 'you' today?", category: "Reflection", intensity: "deep" },
  { id: "ident_058", deckId: "deep_identity", question: "What is the most 'miraculous' thing about your existence?", category: "Essence", intensity: "medium" },
  { id: "ident_059", deckId: "deep_identity", question: "If you were a force of nature, which one would you be?", category: "Essence", intensity: "mild" },
  { id: "ident_060", deckId: "deep_identity", question: "In one word, what is your 'true' name?", category: "Essence", intensity: "high" }
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