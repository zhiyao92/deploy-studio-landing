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
  { id: "coworkers", title: "💼 Coworkers", tagline: "Break the office ice" }
];

const decks = [
  // ── COWORKERS ──
{ id: "coworkers_watercooler", modeId: "coworkers", title: "☕ Watercooler", description: "Casual chat for coffee breaks", isLocked: false },
  { id: "coworkers_team_bonding", modeId: "coworkers", title: "🤝 Team Bonding", description: "Build stronger workplace relationships", isLocked: false },
  { id: "coworkers_wfh_struggles", modeId: "coworkers", title: "🏠 Zoom Life", description: "The highs and lows of remote work", isLocked: false },
  { id: "coworkers_hidden_talents", modeId: "coworkers", title: "🎸 Side Hustles", description: "Who are you outside of the 9-to-5?", isLocked: false },
  { id: "coworkers_office_superlatives", modeId: "coworkers", title: "🏆 Superlatives", description: "Who is most likely to answer an email at 2 AM?", isLocked: false },
  { id: "coworkers_career_growth", modeId: "coworkers", title: "📈 Career Path", description: "Professional goals and motivations", isLocked: true },
  { id: "coworkers_leadership", modeId: "coworkers", title: "👑 The Vision", description: "Ideas on how to lead and inspire", isLocked: true },
  { id: "coworkers_productivity", modeId: "coworkers", title: "⚡ Flow State", description: "Hacks for staying focused and creative", isLocked: true }
];
const cards = [
    //   Category: Work Habits
    { id: "work_001", deckId: "coworkers_watercooler", question: "What is your 'go-to' snack to get through a long afternoon?", category: "Work Habits", intensity: "mild" },
    { id: "work_002", deckId: "coworkers_watercooler", question: "Are you a 'camera on' or 'camera off' person during virtual meetings?", category: "Work Habits", intensity: "mild" },
    { id: "work_003", deckId: "coworkers_watercooler", question: "What’s the most impressive thing about your home office setup?", category: "Work Habits", intensity: "mild" },
    { id: "work_004", deckId: "coworkers_watercooler", question: "Do you listen to music while you work, or do you need total silence?", category: "Work Habits", intensity: "mild" },
    { id: "work_005", deckId: "coworkers_watercooler", question: "What’s your favorite way to spend a lunch break when you aren't working through it?", category: "Work Habits", intensity: "mild" },
  
    //   Category: Small Talk Plus
    { id: "work_006", deckId: "coworkers_watercooler", question: "What was the last show you binge-watched that you’d actually recommend?", category: "Small Talk", intensity: "mild" },
    { id: "work_007", deckId: "coworkers_watercooler", question: "If you could pick the office music for one day, what genre would it be?", category: "Small Talk", intensity: "mild" },
    { id: "work_008", deckId: "coworkers_watercooler", question: "What’s the most interesting thing you did over the weekend?", category: "Small Talk", intensity: "mild" },
    { id: "work_009", deckId: "coworkers_watercooler", question: "Are you a morning person or a 'don't talk to me until I've had coffee' person?", category: "Small Talk", intensity: "mild" },
    { id: "work_010", deckId: "coworkers_watercooler", question: "What’s the best piece of trivial information you know?", category: "Small Talk", intensity: "mild" },
  
    //   Category: Travel & Life
    { id: "work_011", deckId: "coworkers_watercooler", question: "If you could work remotely from any country for a month, where would you go?", category: "Lifestyle", intensity: "medium" },
    { id: "work_012", deckId: "coworkers_watercooler", question: "What’s your favorite local spot near the office for food?", category: "Lifestyle", intensity: "mild" },
    { id: "work_013", deckId: "coworkers_watercooler", question: "Do you have any pets? (Bonus points for showing a photo!)", category: "Lifestyle", intensity: "mild" },
    { id: "work_014", deckId: "coworkers_watercooler", question: "What’s a hobby you have that has absolutely nothing to do with your job?", category: "Lifestyle", intensity: "medium" },
    { id: "work_015", deckId: "coworkers_watercooler", question: "What’s the best vacation you’ve ever taken?", category: "Lifestyle", intensity: "mild" },
  
    //   Category: Office Fun
    { id: "work_016", deckId: "coworkers_watercooler", question: "What’s your favorite 'corporate' buzzword to use ironically?", category: "Office Fun", intensity: "mild" },
    { id: "work_017", deckId: "coworkers_watercooler", question: "If we had an office talent show, what would your act be?", category: "Office Fun", intensity: "medium" },
    { id: "work_018", deckId: "coworkers_watercooler", question: "What is your most-used emoji in Slack or Teams?", category: "Office Fun", intensity: "mild" },
    { id: "work_019", deckId: "coworkers_watercooler", question: "What’s the best team-building event you’ve ever actually enjoyed?", category: "Office Fun", intensity: "mild" },
    { id: "work_020", deckId: "coworkers_watercooler", question: "If you could change one minor thing about the office layout, what would it be?", category: "Office Fun", intensity: "medium" },
  
    //   Category: Productivity & Tech
    { id: "work_021", deckId: "coworkers_watercooler", question: "What’s one app or tool you can’t live without for work?", category: "Tech", intensity: "mild" },
    { id: "work_022", deckId: "coworkers_watercooler", question: "Are you a 'zero inbox' person or do you have 5,000 unread emails?", category: "Tech", intensity: "mild" },
    { id: "work_023", deckId: "coworkers_watercooler", question: "What is the most useful keyboard shortcut you know?", category: "Tech", intensity: "mild" },
    { id: "work_024", deckId: "coworkers_watercooler", question: "Do you prefer physical notebooks or digital notes?", category: "Tech", intensity: "mild" },
    { id: "work_025", deckId: "coworkers_watercooler", question: "What’s the weirdest thing you’ve ever seen in a background during a video call?", category: "Tech", intensity: "medium" },
  
    //   Category: Getting to Know You
    { id: "work_026", deckId: "coworkers_watercooler", question: "What was your very first job?", category: "History", intensity: "mild" },
    { id: "work_027", deckId: "coworkers_watercooler", question: "What’s one thing you’re surprisingly good at?", category: "History", intensity: "medium" },
    { id: "work_028", deckId: "coworkers_watercooler", question: "Are you a 'strictly business' person or do you like to chat before a meeting starts?", category: "History", intensity: "mild" },
    { id: "work_029", deckId: "coworkers_watercooler", question: "What is one skill you’re currently trying to learn?", category: "History", intensity: "medium" },
    { id: "work_030", deckId: "coworkers_watercooler", question: "If you weren't in this career, what would you be doing instead?", category: "History", intensity: "medium" },
  
    //   Category: Career Beginnings & Pivot
    { id: "work_031", deckId: "coworkers_watercooler", question: "What’s the most valuable lesson you learned from a job you hated?", category: "History", intensity: "medium" },
    { id: "work_032", deckId: "coworkers_watercooler", question: "What was your very first 'professional' email address?", category: "History", intensity: "mild" },
    { id: "work_033", deckId: "coworkers_watercooler", question: "If you could go back to your first day of work ever, what advice would you give yourself?", category: "History", intensity: "medium" },
    { id: "work_034", deckId: "coworkers_watercooler", question: "What is the most unusual job you’ve ever heard of someone having?", category: "History", intensity: "mild" },
    { id: "work_035", deckId: "coworkers_watercooler", question: "Have you ever had a job that required you to wear a funny uniform?", category: "History", intensity: "mild" },
  
    //   Category: Preferences & Routine
    { id: "work_036", deckId: "coworkers_watercooler", question: "Are you a 'pack your lunch' person or a 'buy lunch every day' person?", category: "Routine", intensity: "mild" },
    { id: "work_037", deckId: "coworkers_watercooler", question: "What is your 'peak productivity' time during the day?", category: "Routine", intensity: "medium" },
    { id: "work_038", deckId: "coworkers_watercooler", question: "How many browser tabs do you have open right now?", category: "Routine", intensity: "mild" },
    { id: "work_039", deckId: "coworkers_watercooler", question: "What’s the first thing you do when you close your laptop for the day?", category: "Routine", intensity: "mild" },
    { id: "work_040", deckId: "coworkers_watercooler", question: "Do you prefer a standing desk or a comfortable chair?", category: "Routine", intensity: "mild" },
  
    //   Category: Modern Work Life
    { id: "work_041", deckId: "coworkers_watercooler", question: "What’s the most 'millennial' or 'Gen Z' thing about our workplace?", category: "Modern Work", intensity: "medium" },
    { id: "work_042", deckId: "coworkers_watercooler", question: "What is your favorite 'work from home' perk?", category: "Modern Work", intensity: "mild" },
    { id: "work_043", deckId: "coworkers_watercooler", question: "If you could automate one boring part of your job, what would it be?", category: "Modern Work", intensity: "medium" },
    { id: "work_044", deckId: "coworkers_watercooler", question: "What’s your stance on 'Reply All' emails?", category: "Modern Work", intensity: "mild" },
    { id: "work_045", deckId: "coworkers_watercooler", question: "How do you stay focused when you have 100 distractions around you?", category: "Modern Work", intensity: "medium" },
  
    //   Category: Fun Hypotheticals
    { id: "work_046", deckId: "coworkers_watercooler", question: "If the office was hosting a potluck, what is the one dish you’d bring?", category: "Office Fun", intensity: "mild" },
    { id: "work_047", deckId: "coworkers_watercooler", question: "If you were the CEO for one day, what’s the first change you’d make?", category: "Office Fun", intensity: "medium" },
    { id: "work_048", deckId: "coworkers_watercooler", question: "What fictional office (from a TV show or movie) would you most like to work in?", category: "Office Fun", intensity: "mild" },
    { id: "work_049", deckId: "coworkers_watercooler", question: "What would your 'dream' office snack bar be stocked with?", category: "Office Fun", intensity: "mild" },
    { id: "work_050", deckId: "coworkers_watercooler", question: "If we had an office pet, what animal should it be?", category: "Office Fun", intensity: "mild" },
  
    //   Category: Travel & Global
    { id: "work_051", deckId: "coworkers_watercooler", question: "What’s the furthest you’ve ever traveled for a job?", category: "Travel", intensity: "mild" },
    { id: "work_052", deckId: "coworkers_watercooler", question: "Do you enjoy business travel, or do you prefer to stay put?", category: "Travel", intensity: "medium" },
    { id: "work_053", deckId: "coworkers_watercooler", question: "What is the best 'hidden gem' restaurant in the city we work in?", category: "Travel", intensity: "mild" },
    { id: "work_054", deckId: "coworkers_watercooler", question: "What is your favorite souvenir you’ve ever brought back from a trip?", category: "Travel", intensity: "mild" },
    { id: "work_055", deckId: "coworkers_watercooler", question: "If you could have an office in any city in the world, where would it be?", category: "Travel", intensity: "medium" },
  
    //   Category: Final Wrap-up
    { id: "work_056", deckId: "coworkers_watercooler", question: "What is one thing you’re looking forward to this week?", category: "Wrap-up", intensity: "mild" },
    { id: "work_057", deckId: "coworkers_watercooler", question: "What’s a 'small win' you had recently that made you happy?", category: "Wrap-up", intensity: "mild" },
    { id: "work_058", deckId: "coworkers_watercooler", question: "What is one piece of 'work' advice that you actually find useful?", category: "Wrap-up", intensity: "medium" },
    { id: "work_059", deckId: "coworkers_watercooler", question: "How do you recharge your energy after a busy work week?", category: "Wrap-up", intensity: "medium" },
    { id: "work_060", deckId: "coworkers_watercooler", question: "What is the most interesting thing you’ve learned recently (work-related or not)?", category: "Wrap-up", intensity: "medium" },
  
    //   Category: Collaboration Style
    { id: "bond_001", deckId: "coworkers_team_bonding", question: "Do you prefer to brainstorm ideas out loud or write them down first?", category: "Collaboration", intensity: "mild" },
    { id: "bond_002", deckId: "coworkers_team_bonding", question: "What’s the most important quality a team leader can have?", category: "Collaboration", intensity: "medium" },
    { id: "bond_003", deckId: "coworkers_team_bonding", question: "Are you a 'big picture' thinker or a 'details' person?", category: "Collaboration", intensity: "mild" },
    { id: "bond_004", deckId: "coworkers_team_bonding", question: "What is your biggest pet peeve when working in a group?", category: "Collaboration", intensity: "medium" },
    { id: "bond_005", deckId: "coworkers_team_bonding", question: "How do you prefer to receive feedback: in the moment or in a scheduled meeting?", category: "Collaboration", intensity: "medium" },
    { id: "bond_006", deckId: "coworkers_team_bonding", question: "What is one thing this team does better than any other team you’ve been on?", category: "Collaboration", intensity: "medium" },
    { id: "bond_007", deckId: "coworkers_team_bonding", question: "Do you feel more energized working alone or in a collaborative group?", category: "Collaboration", intensity: "mild" },
    { id: "bond_008", deckId: "coworkers_team_bonding", question: "What is a 'hidden strength' you bring to this team that people might not notice?", category: "Collaboration", intensity: "medium" },
    { id: "bond_009", deckId: "coworkers_team_bonding", question: "How do you handle it when a project changes direction at the last minute?", category: "Collaboration", intensity: "medium" },
    { id: "bond_010", deckId: "coworkers_team_bonding", question: "What is the 'golden rule' for a successful meeting, in your opinion?", category: "Collaboration", intensity: "mild" },
  
    //   Category: Trust & Support
    { id: "bond_011", deckId: "coworkers_team_bonding", question: "When you’re feeling overwhelmed, how can the team best support you?", category: "Trust", intensity: "deep" },
    { id: "bond_012", deckId: "coworkers_team_bonding", question: "What does 'psychological safety' in a workplace mean to you?", category: "Trust", intensity: "deep" },
    { id: "bond_013", deckId: "coworkers_team_bonding", question: "Who was a mentor that helped you get where you are today?", category: "Trust", intensity: "medium" },
    { id: "bond_014", deckId: "coworkers_team_bonding", question: "What is one thing you’ve learned from a coworker in this room?", category: "Trust", intensity: "medium" },
    { id: "bond_015", deckId: "coworkers_team_bonding", question: "How do you define a 'successful' team win?", category: "Trust", intensity: "mild" },
    { id: "bond_016", deckId: "coworkers_team_bonding", question: "Do you feel comfortable asking for help when you’re stuck, or do you try to figure it out alone?", category: "Trust", intensity: "medium" },
    { id: "bond_017", deckId: "coworkers_team_bonding", question: "What is one work achievement you’re proud of but rarely talk about?", category: "Trust", intensity: "medium" },
    { id: "bond_018", deckId: "coworkers_team_bonding", question: "What is the best way to celebrate a major project completion?", category: "Trust", intensity: "mild" },
    { id: "bond_019", deckId: "coworkers_team_bonding", question: "In your opinion, what is the biggest 'trust-breaker' in a professional setting?", category: "Trust", intensity: "deep" },
    { id: "bond_020", deckId: "coworkers_team_bonding", question: "What is one thing we could do to make our team communication clearer?", category: "Trust", intensity: "medium" },
  
    //   Category: Personality & Dynamics
    { id: "bond_021", deckId: "coworkers_team_bonding", question: "If our team was a cast of characters in a movie, what role would you play?", category: "Dynamics", intensity: "mild" },
    { id: "bond_022", deckId: "coworkers_team_bonding", question: "What’s one thing about your personality that people often misunderstand at work?", category: "Dynamics", intensity: "deep" },
    { id: "bond_023", deckId: "coworkers_team_bonding", question: "Are you someone who likes to 'talk through' problems or 'process' them internally first?", category: "Dynamics", intensity: "medium" },
    { id: "bond_024", deckId: "coworkers_team_bonding", question: "What’s a hobby you have that actually helps you with your work skills?", category: "Dynamics", intensity: "mild" },
    { id: "bond_025", deckId: "coworkers_team_bonding", question: "If you could trade jobs with anyone on this team for a week, who would it be and why?", category: "Dynamics", intensity: "medium" },
    { id: "bond_026", deckId: "coworkers_team_bonding", question: "What was your first impression of this team compared to how you feel now?", category: "Dynamics", intensity: "medium" },
    { id: "bond_027", deckId: "coworkers_team_bonding", question: "What is one non-work topic you’re an absolute 'expert' in?", category: "Dynamics", intensity: "mild" },
    { id: "bond_028", deckId: "coworkers_team_bonding", question: "Do you prefer a fast-paced environment or a steady, predictable one?", category: "Dynamics", intensity: "medium" },
    { id: "bond_029", deckId: "coworkers_team_bonding", question: "What is one thing that instantly puts you in a good mood at work?", category: "Dynamics", intensity: "mild" },
    { id: "bond_030", deckId: "coworkers_team_bonding", question: "What is a workplace tradition (real or imaginary) you’d like to see us start?", category: "Dynamics", intensity: "mild" },
  
    //   Category: Resilience & Challenges
    { id: "bond_031", deckId: "coworkers_team_bonding", question: "What was the hardest work challenge you’ve faced this year?", category: "Resilience", intensity: "medium" },
    { id: "bond_032", deckId: "coworkers_team_bonding", question: "How do you stay motivated during a slow or repetitive season?", category: "Resilience", intensity: "medium" },
    { id: "bond_033", deckId: "coworkers_team_bonding", question: "What’s the best piece of career advice you’ve ever received from a peer?", category: "Resilience", intensity: "medium" },
    { id: "bond_034", deckId: "coworkers_team_bonding", question: "How do you balance being productive with avoiding burnout?", category: "Resilience", intensity: "deep" },
    { id: "bond_035", deckId: "coworkers_team_bonding", question: "What is a 'work fail' you’ve had that you can laugh about now?", category: "Resilience", intensity: "medium" },
    { id: "bond_036", deckId: "coworkers_team_bonding", question: "When a team project fails, what is the first thing you think we should do?", category: "Resilience", intensity: "medium" },
    { id: "bond_037", deckId: "coworkers_team_bonding", question: "What is one way you’ve grown professionally since joining this company?", category: "Resilience", intensity: "medium" },
    { id: "bond_038", deckId: "coworkers_team_bonding", question: "How do you handle workplace stress—do you go for a walk, vent, or lock in?", category: "Resilience", intensity: "medium" },
    { id: "bond_039", deckId: "coworkers_team_bonding", question: "What does 'integrity' in the workplace mean to you personally?", category: "Resilience", intensity: "deep" },
    { id: "bond_040", deckId: "coworkers_team_bonding", question: "If you could change one thing about our team's workflow, what would it be?", category: "Resilience", intensity: "medium" },
  
    //   Category: Fun & Hypotheticals
    { id: "bond_041", deckId: "coworkers_team_bonding", question: "If this team was stranded on a desert island, what would each person’s role be?", category: "Fun", intensity: "mild" },
    { id: "bond_042", deckId: "coworkers_team_bonding", question: "What is your 'work superpower'—the one thing you can do effortlessly?", category: "Fun", intensity: "mild" },
    { id: "bond_043", deckId: "coworkers_team_bonding", question: "If we had an unlimited budget for a team outing, where are we going?", category: "Fun", intensity: "mild" },
    { id: "bond_044", deckId: "coworkers_team_bonding", question: "Which coworker would be the most likely to survive a zombie apocalypse?", category: "Fun", intensity: "mild" },
    { id: "bond_045", deckId: "coworkers_team_bonding", question: "If we had to name our team like a sports team, what would our mascot be?", category: "Fun", intensity: "mild" },
    { id: "bond_046", deckId: "coworkers_team_bonding", question: "What is the funniest thing that has ever happened during a team meeting?", category: "Fun", intensity: "mild" },
    { id: "bond_047", deckId: "coworkers_team_bonding", question: "If you could win an award for any non-work related category, what would it be?", category: "Fun", intensity: "mild" },
    { id: "bond_048", deckId: "coworkers_team_bonding", question: "What’s the most unusual skill you have that you don't use at work?", category: "Fun", intensity: "mild" },
    { id: "bond_049", deckId: "coworkers_team_bonding", question: "If you could choose any famous person to be our team's honorary member, who would it be?", category: "Fun", intensity: "mild" },
    { id: "bond_050", deckId: "coworkers_team_bonding", question: "What’s your favorite 'insider joke' our team has?", category: "Fun", intensity: "mild" },
  
    //   Category: Deep Reflection
    { id: "bond_051", deckId: "coworkers_team_bonding", question: "What is one thing you wish your coworkers knew about your daily life?", category: "Reflection", intensity: "medium" },
    { id: "bond_052", deckId: "coworkers_team_bonding", question: "How has your perspective on our industry changed over time?", category: "Reflection", intensity: "medium" },
    { id: "bond_053", deckId: "coworkers_team_bonding", question: "What is the most rewarding part of your current role?", category: "Reflection", intensity: "medium" },
    { id: "bond_054", deckId: "coworkers_team_bonding", question: "If you were writing a book about your career journey, what would this chapter be called?", category: "Reflection", intensity: "deep" },
    { id: "bond_055", deckId: "coworkers_team_bonding", question: "What is one value you look for in every person you work with?", category: "Reflection", intensity: "medium" },
    { id: "bond_056", deckId: "coworkers_team_bonding", question: "How do you want to be remembered by the people you work with?", category: "Reflection", intensity: "deep" },
    { id: "bond_057", deckId: "coworkers_team_bonding", question: "What is the biggest risk you’ve ever taken in your professional life?", category: "Reflection", intensity: "deep" },
    { id: "bond_058", deckId: "coworkers_team_bonding", question: "What motivates you to do your best work every single day?", category: "Reflection", intensity: "medium" },
    { id: "bond_059", deckId: "coworkers_team_bonding", question: "What is one goal you have for this team for the next six months?", category: "Reflection", intensity: "medium" },
    { id: "bond_060", deckId: "coworkers_team_bonding", question: "If you could give one word of encouragement to everyone here, what would it be?", category: "Reflection", intensity: "medium" },
  
    //   Category: Ambition & Goals
    { id: "career_001", deckId: "coworkers_career_growth", question: "What was your very first 'dream job' when you were a kid?", category: "Ambition", intensity: "mild" },
    { id: "career_002", deckId: "coworkers_career_growth", question: "If you could master one new professional skill by tomorrow, what would it be?", category: "Ambition", intensity: "medium" },
    { id: "career_003", deckId: "coworkers_career_growth", question: "Where do you honestly see yourself in five years, career-wise?", category: "Ambition", intensity: "medium" },
    { id: "career_004", deckId: "coworkers_career_growth", question: "Is your current career path what you studied for in school?", category: "Ambition", intensity: "mild" },
    { id: "career_005", deckId: "coworkers_career_growth", question: "What is the biggest 'career milestone' you’ve hit so far?", category: "Ambition", intensity: "medium" },
    { id: "career_006", deckId: "coworkers_career_growth", question: "Do you want to lead a large team one day, or remain a specialist?", category: "Ambition", intensity: "medium" },
    { id: "career_007", deckId: "coworkers_career_growth", question: "What does 'making it' look like to you?", category: "Ambition", intensity: "deep" },
    { id: "career_008", deckId: "coworkers_career_growth", question: "What is one project you’d love to spearhead if budget wasn't an issue?", category: "Ambition", intensity: "medium" },
    { id: "career_009", deckId: "coworkers_career_growth", question: "What is a industry trend you are currently following closely?", category: "Ambition", intensity: "mild" },
    { id: "career_010", deckId: "coworkers_career_growth", question: "If you could have a coffee with any leader in our field, who would it be?", category: "Ambition", intensity: "medium" },
  
    //   Category: Motivation & Driver
    { id: "career_011", deckId: "coworkers_career_growth", question: "What motivates you more: public recognition or personal satisfaction?", category: "Motivation", intensity: "medium" },
    { id: "career_012", deckId: "coworkers_career_growth", question: "On a Monday morning, what is the one thing that gets you out of bed?", category: "Motivation", intensity: "medium" },
    { id: "career_013", deckId: "coworkers_career_growth", question: "How much of your identity is tied to your job title?", category: "Motivation", intensity: "deep" },
    { id: "career_014", deckId: "coworkers_career_growth", question: "What is the best compliment you’ve ever received about your work?", category: "Motivation", intensity: "medium" },
    { id: "career_015", deckId: "coworkers_career_growth", question: "Would you rather have a high-paying job you dislike or a low-paying job you love?", category: "Motivation", intensity: "deep" },
    { id: "career_016", deckId: "coworkers_career_growth", question: "What is the most rewarding part of your workday?", category: "Motivation", intensity: "mild" },
    { id: "career_017", deckId: "coworkers_career_growth", question: "Do you prefer to be the 'smartest person in the room' or the one with the most to learn?", category: "Motivation", intensity: "medium" },
    { id: "career_018", deckId: "coworkers_career_growth", question: "What is one work-related 'fear' you’ve successfully overcome?", category: "Motivation", intensity: "medium" },
    { id: "career_019", deckId: "coworkers_career_growth", question: "How do you define 'work-life balance' for yourself?", category: "Motivation", intensity: "medium" },
    { id: "career_020", deckId: "coworkers_career_growth", question: "What is a passion project you’re working on outside of work?", category: "Motivation", intensity: "mild" },
  
    //   Category: Professional Development
    { id: "career_021", deckId: "coworkers_career_growth", question: "What was the most difficult feedback you’ve ever had to hear?", category: "Development", intensity: "deep" },
    { id: "career_022", deckId: "coworkers_career_growth", question: "How do you stay updated with changes in our industry?", category: "Development", intensity: "mild" },
    { id: "career_023", deckId: "coworkers_career_growth", question: "What is one 'soft skill' you’re currently trying to improve?", category: "Development", intensity: "medium" },
    { id: "career_024", deckId: "coworkers_career_growth", question: "Do you prefer learning through doing or through formal training?", category: "Development", intensity: "mild" },
    { id: "career_025", deckId: "coworkers_career_growth", question: "What is the biggest risk you’ve ever taken for your career?", category: "Development", intensity: "deep" },
    { id: "career_026", deckId: "coworkers_career_growth", question: "Who has been the most influential mentor in your life so far?", category: "Development", intensity: "medium" },
    { id: "career_027", deckId: "coworkers_career_growth", question: "What is a book or podcast that changed the way you think about work?", category: "Development", intensity: "mild" },
    { id: "career_028", deckId: "coworkers_career_growth", question: "If you could go back to the start of your career, what would you do differently?", category: "Development", intensity: "deep" },
    { id: "career_029", deckId: "coworkers_career_growth", question: "What is one 'failure' that actually ended up helping your career?", category: "Development", intensity: "deep" },
    { id: "career_030", deckId: "coworkers_career_growth", question: "What do you want to be known for in your professional circle?", category: "Development", intensity: "medium" },
  
    //   Category: The Future of Work
    { id: "career_031", deckId: "coworkers_career_growth", question: "How do you think AI will change your specific job in the next 10 years?", category: "Future", intensity: "medium" },
    { id: "career_032", deckId: "coworkers_career_growth", question: "If you could invent a job title that doesn't exist yet, what would it be?", category: "Future", intensity: "mild" },
    { id: "career_033", deckId: "coworkers_career_growth", question: "Do you believe the '9-to-5' will still exist in 20 years?", category: "Future", intensity: "medium" },
    { id: "career_034", deckId: "coworkers_career_growth", question: "What is one skill that you think will be 'future-proof'?", category: "Future", intensity: "medium" },
    { id: "career_035", deckId: "coworkers_career_growth", question: "Would you ever consider being a digital nomad?", category: "Future", intensity: "mild" },
    { id: "career_036", deckId: "coworkers_career_growth", question: "What industry (other than ours) do you think is ripe for a total revolution?", category: "Future", intensity: "medium" },
    { id: "career_037", deckId: "coworkers_career_growth", question: "How do you feel about the 'four-day work week' concept?", category: "Future", intensity: "mild" },
    { id: "career_038", deckId: "coworkers_career_growth", question: "What is the biggest threat to our industry right now?", category: "Future", intensity: "deep" },
    { id: "career_039", deckId: "coworkers_career_growth", question: "If you could retire tomorrow, what would you spend your time doing?", category: "Future", intensity: "medium" },
    { id: "career_040", deckId: "coworkers_career_growth", question: "What is the most exciting technology you've seen recently?", category: "Future", intensity: "mild" },
  
    //   Category: Work-Life Dynamics
    { id: "career_041", deckId: "coworkers_career_growth", question: "What’s the best piece of advice you’ve received on avoiding burnout?", category: "Balance", intensity: "medium" },
    { id: "career_042", deckId: "coworkers_career_growth", question: "Do you find it easy or hard to 'unplug' after work hours?", category: "Balance", intensity: "medium" },
    { id: "career_043", deckId: "coworkers_career_growth", question: "What is one thing that is a 'non-negotiable' for your workplace happiness?", category: "Balance", intensity: "deep" },
    { id: "career_044", deckId: "coworkers_career_growth", question: "How do you manage your time when you have too many priorities?", category: "Balance", intensity: "medium" },
    { id: "career_045", deckId: "coworkers_career_growth", question: "What is your 'guilty pleasure' that helps you de-stress from work?", category: "Balance", intensity: "mild" },
    { id: "career_046", deckId: "coworkers_career_growth", question: "What’s the most important boundary you’ve set at work?", category: "Balance", intensity: "medium" },
    { id: "career_047", deckId: "coworkers_career_growth", question: "How do you handle a toxic work environment or colleague?", category: "Balance", intensity: "deep" },
    { id: "career_048", deckId: "coworkers_career_growth", question: "What does 'mental health day' look like for you?", category: "Balance", intensity: "mild" },
    { id: "career_049", deckId: "coworkers_career_growth", question: "Do you prefer a job that is very challenging or one that allows you to be very comfortable?", category: "Balance", intensity: "medium" },
    { id: "career_050", deckId: "coworkers_career_growth", question: "What is your favorite way to celebrate a personal career win?", category: "Balance", intensity: "mild" },
  
    //   Category: Legacy & Philosophy
    { id: "career_051", deckId: "coworkers_career_growth", question: "What do you want to be the 'headline' of your career story?", category: "Legacy", intensity: "deep" },
    { id: "career_052", deckId: "coworkers_career_growth", question: "Is it more important to be respected or to be liked at work?", category: "Legacy", intensity: "deep" },
    { id: "career_053", deckId: "coworkers_career_growth", question: "What is the biggest lesson your career has taught you about people?", category: "Legacy", intensity: "deep" },
    { id: "career_054", deckId: "coworkers_career_growth", question: "If you could leave one piece of advice for the person who takes your job next, what would it be?", category: "Legacy", intensity: "medium" },
    { id: "career_055", deckId: "coworkers_career_growth", question: "What does 'ethical work' mean to you?", category: "Legacy", intensity: "deep" },
    { id: "career_056", deckId: "coworkers_career_growth", question: "What is the most 'meaningful' project you have ever worked on?", category: "Legacy", intensity: "medium" },
    { id: "career_057", deckId: "coworkers_career_growth", question: "How has your career changed your worldview?", category: "Legacy", intensity: "deep" },
    { id: "career_058", deckId: "coworkers_career_growth", question: "What is one thing you hope to achieve that has nothing to do with money?", category: "Legacy", intensity: "medium" },
    { id: "career_059", deckId: "coworkers_career_growth", question: "What is the best leadership lesson you’ve learned by observing a bad leader?", category: "Legacy", intensity: "deep" },
    { id: "career_060", deckId: "coworkers_career_growth", question: "When you retire, what is the one thing you want your colleagues to say about you?", category: "Legacy", intensity: "deep" },  

  //   Category: Remote Chaos
  { id: "wfh_001", deckId: "coworkers_wfh_struggles", question: "What is the most embarrassing thing that has happened in the background of your video call?", category: "Chaos", intensity: "medium" },
  { id: "wfh_002", deckId: "coworkers_wfh_struggles", question: "Have you ever been caught talking while on mute? Or worse, talking while NOT on mute?", category: "Chaos", intensity: "mild" },
  { id: "wfh_003", deckId: "coworkers_wfh_struggles", question: "What is your 'emergency' procedure when the Wi-Fi goes down during a big meeting?", category: "Chaos", intensity: "medium" },
  { id: "wfh_004", deckId: "coworkers_wfh_struggles", question: "Have you ever 'filtered' your face or background to hide the fact that you just woke up?", category: "Chaos", intensity: "mild" },
  { id: "wfh_005", deckId: "coworkers_wfh_struggles", question: "What is the weirdest place you’ve taken a meeting from? (Closet? Car? Bathroom?)", category: "Chaos", intensity: "medium" },
  { id: "wfh_006", deckId: "coworkers_wfh_struggles", question: "How often do you 'talk' to your pets or plants during the workday?", category: "Chaos", intensity: "mild" },
  { id: "wfh_007", deckId: "coworkers_wfh_struggles", question: "What’s the most distracting thing in your home when you're trying to focus?", category: "Chaos", intensity: "medium" },
  { id: "wfh_008", deckId: "coworkers_wfh_struggles", question: "Have you ever pretended your camera wasn't working just because you didn't want to be seen?", category: "Chaos", intensity: "medium" },
  { id: "wfh_009", deckId: "coworkers_wfh_struggles", question: "What is your go-to 'I’m working' pose for when someone walks into the room?", category: "Chaos", intensity: "mild" },
  { id: "wfh_010", deckId: "coworkers_wfh_struggles", question: "Has a delivery driver ever ruined your 'big moment' in a presentation?", category: "Chaos", intensity: "mild" },

  //   Category: Fashion & Comfort
  { id: "wfh_011", deckId: "coworkers_wfh_struggles", question: "What’s the percentage of time you’re wearing pajama bottoms during a call?", category: "Fashion", intensity: "mild" },
  { id: "wfh_012", deckId: "coworkers_wfh_struggles", question: "What is your 'business on top, party on the bottom' outfit of choice?", category: "Fashion", intensity: "mild" },
  { id: "wfh_013", deckId: "coworkers_wfh_struggles", question: "Do you actually get fully dressed to 'set the mood' for work, or is that a myth?", category: "Fashion", intensity: "medium" },
  { id: "wfh_014", deckId: "coworkers_wfh_struggles", question: "How many days in a row have you worn the same sweatshirt while working?", category: "Fashion", intensity: "mild" },
  { id: "wfh_015", deckId: "coworkers_wfh_struggles", question: "What is the most 'unprofessional' item of clothing within arm's reach right now?", category: "Fashion", intensity: "mild" },
  { id: "wfh_016", deckId: "coworkers_wfh_struggles", question: "Shoes, socks, or bare feet while working from home?", category: "Fashion", intensity: "mild" },
  { id: "wfh_017", deckId: "coworkers_wfh_struggles", question: "Do you have a 'work hat' or 'work glasses' that make you feel more official?", category: "Fashion", intensity: "mild" },
  { id: "wfh_018", deckId: "coworkers_wfh_struggles", question: "What is the best 'comfort' purchase you've made for your home office?", category: "Fashion", intensity: "mild" },
  { id: "wfh_019", deckId: "coworkers_wfh_struggles", question: "How long can you go without looking in a mirror during the workday?", category: "Fashion", intensity: "medium" },
  { id: "wfh_020", deckId: "coworkers_wfh_struggles", question: "What is your 'Zoom-ready' hair routine?", category: "Fashion", intensity: "mild" },

  //   Category: Boundaries & Loneliness
  { id: "wfh_021", deckId: "coworkers_wfh_struggles", question: "What is the hardest part about 'switching off' when your office is your home?", category: "Boundaries", intensity: "deep" },
  { id: "wfh_022", deckId: "coworkers_wfh_struggles", question: "Do you ever feel 'guilty' for taking a break at home, even if you’ve finished your tasks?", category: "Boundaries", intensity: "medium" },
  { id: "wfh_023", deckId: "coworkers_wfh_struggles", question: "How do you handle family members or roommates who don't 'get' that you're working?", category: "Boundaries", intensity: "medium" },
  { id: "wfh_024", deckId: "coworkers_wfh_struggles", question: "What is the one thing you miss most about a physical office environment?", category: "Boundaries", intensity: "medium" },
  { id: "wfh_025", deckId: "coworkers_wfh_struggles", question: "Do you ever find yourself working MUCH longer hours just because you're already home?", category: "Boundaries", intensity: "deep" },
  { id: "wfh_026", deckId: "coworkers_wfh_struggles", question: "What’s your trick for staying sane when you haven't left the house in three days?", category: "Boundaries", intensity: "deep" },
  { id: "wfh_027", deckId: "coworkers_wfh_struggles", question: "How do you 'commute' from your bed to your desk? Is there a ritual?", category: "Boundaries", intensity: "mild" },
  { id: "wfh_028", deckId: "coworkers_wfh_struggles", question: "What is the best way a coworker has supported you remotely?", category: "Boundaries", intensity: "medium" },
  { id: "wfh_029", deckId: "coworkers_wfh_struggles", question: "Do you prefer scheduled social calls or do they feel like more work?", category: "Boundaries", intensity: "medium" },
  { id: "wfh_030", deckId: "coworkers_wfh_struggles", question: "What is your 'signal' to the people you live with that you are in a 'Do Not Disturb' meeting?", category: "Boundaries", intensity: "mild" },

  //   Category: Digital Etiquette
  { id: "wfh_031", deckId: "coworkers_wfh_struggles", question: "What is your stance on 'unscheduled' video calls? (Yay or absolute Nay?)", category: "Etiquette", intensity: "medium" },
  { id: "wfh_032", deckId: "coworkers_wfh_struggles", question: "How do you politely tell someone their mic is making a weird noise?", category: "Etiquette", intensity: "mild" },
  { id: "wfh_033", deckId: "coworkers_wfh_struggles", question: "What is the 'Slack' or 'Teams' behavior that annoys you the most?", category: "Etiquette", intensity: "medium" },
  { id: "wfh_034", deckId: "coworkers_wfh_struggles", question: "Is it okay to eat during a video call if your camera is off? What if it's on?", category: "Etiquette", intensity: "mild" },
  { id: "wfh_035", deckId: "coworkers_wfh_struggles", question: "How do you signal that you're done talking in a meeting without the awkward silence?", category: "Etiquette", intensity: "mild" },
  { id: "wfh_036", deckId: "coworkers_wfh_struggles", question: "What’s the most 'unnecessary' meeting you’ve attended this month?", category: "Etiquette", intensity: "medium" },
  { id: "wfh_037", deckId: "coworkers_wfh_struggles", question: "Do you use 'emojis' in professional emails, or is that a crime?", category: "Etiquette", intensity: "mild" },
  { id: "wfh_038", deckId: "coworkers_wfh_struggles", question: "How do you handle 'ghosting' in a professional digital setting?", category: "Etiquette", intensity: "deep" },
  { id: "wfh_039", deckId: "coworkers_wfh_struggles", question: "What’s the proper way to 'leave' a meeting that is running way over time?", category: "Etiquette", intensity: "medium" },
  { id: "wfh_040", deckId: "coworkers_wfh_struggles", question: "How many browser windows (not tabs) do you have open right now?", category: "Etiquette", intensity: "mild" },

  //   Category: Habits & Health
  { id: "wfh_041", deckId: "coworkers_wfh_struggles", question: "How many cups of coffee/tea do you actually drink when no one is watching?", category: "Habits", intensity: "mild" },
  { id: "wfh_042", deckId: "coworkers_wfh_struggles", question: "What is your 'ultimate' WFH snack that would be too embarrassing to bring to a real office?", category: "Habits", intensity: "mild" },
  { id: "wfh_043", deckId: "coworkers_wfh_struggles", question: "Do you have a 'work-from-couch' habit, or are you strictly at a desk?", category: "Habits", intensity: "mild" },
  { id: "wfh_044", deckId: "coworkers_wfh_struggles", question: "What is the longest you’ve gone without speaking to another human in person?", category: "Habits", intensity: "deep" },
  { id: "wfh_045", deckId: "coworkers_wfh_struggles", question: "How do you keep yourself from 'doomscrolling' during work hours?", category: "Habits", intensity: "medium" },
  { id: "wfh_046", deckId: "coworkers_wfh_struggles", question: "What is your 'productivity' hack for when you're feeling zero motivation at home?", category: "Habits", intensity: "medium" },
  { id: "wfh_047", deckId: "coworkers_wfh_struggles", question: "Do you ever work from bed? (Be honest, we won't tell HR).", category: "Habits", intensity: "mild" },
  { id: "wfh_048", deckId: "coworkers_wfh_struggles", question: "What’s the weirdest 'lunch' you’ve assembled from random fridge scraps?", category: "Habits", intensity: "mild" },
  { id: "wfh_049", deckId: "coworkers_wfh_struggles", question: "Do you exercise during the day, or does 'exercise' just mean walking to the kitchen?", category: "Habits", intensity: "mild" },
  { id: "wfh_050", deckId: "coworkers_wfh_struggles", question: "What is your #1 rule for a successful 'Work From Home' day?", category: "Habits", intensity: "medium" },

  //   Category: Reflection & Future
  { id: "wfh_051", deckId: "coworkers_wfh_struggles", question: "If you could only work from an office OR from home for the rest of your life, which would you pick?", category: "Reflection", intensity: "medium" },
  { id: "wfh_052", deckId: "coworkers_wfh_struggles", question: "What is the biggest 'lesson' remote work has taught you about yourself?", category: "Reflection", intensity: "deep" },
  { id: "wfh_053", deckId: "coworkers_wfh_struggles", question: "How has your relationship with your coworkers changed since going remote/hybrid?", category: "Reflection", intensity: "medium" },
  { id: "wfh_054", deckId: "coworkers_wfh_struggles", question: "Do you think you’re more or less productive without a manager looking over your shoulder?", category: "Reflection", intensity: "deep" },
  { id: "wfh_055", deckId: "coworkers_wfh_struggles", question: "What’s the one thing you’d bring from your home office to a 'real' office to make it better?", category: "Reflection", intensity: "mild" },
  { id: "wfh_056", deckId: "coworkers_wfh_struggles", question: "Do you feel like 'Zoom fatigue' is real, or are we just tired of meetings in general?", category: "Reflection", intensity: "medium" },
  { id: "wfh_057", deckId: "coworkers_wfh_struggles", question: "How do you maintain a 'work culture' when everyone is in different zip codes?", category: "Reflection", intensity: "deep" },
  { id: "wfh_058", deckId: "coworkers_wfh_struggles", question: "What is the 'dream' remote work destination for you?", category: "Reflection", intensity: "mild" },
  { id: "wfh_059", deckId: "coworkers_wfh_struggles", question: "What do you think is the future of 'The Office'? Will it even exist in 50 years?", category: "Reflection", intensity: "medium" },
  { id: "wfh_060", deckId: "coworkers_wfh_struggles", question: "What’s one WFH struggle you’re actually grateful for because it’s funny?", category: "Reflection", intensity: "medium" },

  //   Category: Secret Talents
  { id: "side_001", deckId: "coworkers_hidden_talents", question: "What is a 'useless' talent you have that would never go on a resume?", category: "Talents", intensity: "mild" },
  { id: "side_002", deckId: "coworkers_hidden_talents", question: "If we had an office talent show, what would your 3-minute act be?", category: "Talents", intensity: "medium" },
  { id: "side_003", deckId: "coworkers_hidden_talents", question: "Are you a 'secret' expert in anything totally unrelated to your job? (History? Gardening? Sci-fi?)", category: "Talents", intensity: "medium" },
  { id: "side_004", deckId: "coworkers_hidden_talents", question: "What is the most 'impressive' physical feat you can do? (Backflip? Touch your nose with your tongue?)", category: "Talents", intensity: "mild" },
  { id: "side_005", deckId: "coworkers_hidden_talents", question: "If you were a character in a fantasy RPG, what would your 'special ability' be?", category: "Talents", intensity: "mild" },
  { id: "side_006", deckId: "coworkers_hidden_talents", question: "Can you speak any other languages, including 'dead' or fictional ones?", category: "Talents", intensity: "mild" },
  { id: "side_007", deckId: "coworkers_hidden_talents", question: "What is a skill you picked up as a kid that you surprisingly still remember?", category: "Talents", intensity: "medium" },
  { id: "side_008", deckId: "coworkers_hidden_talents", question: "Do you have a 'party trick' that always gets a reaction?", category: "Talents", intensity: "mild" },
  { id: "side_009", deckId: "coworkers_hidden_talents", question: "What’s the most 'niche' hobby you’ve ever tried?", category: "Talents", intensity: "medium" },
  { id: "side_010", deckId: "coworkers_hidden_talents", question: "If you could win a gold medal in any 'non-sport' activity, what would it be?", category: "Talents", intensity: "mild" },

  //   Category: Creative Pursuits
  { id: "side_011", deckId: "coworkers_hidden_talents", question: "Do you have a 'creative' outlet that you wish was your full-time job?", category: "Creative", intensity: "deep" },
  { id: "side_012", deckId: "coworkers_hidden_talents", question: "Have you ever written a book, a song, or a piece of code just for fun?", category: "Creative", intensity: "medium" },
  { id: "side_013", deckId: "coworkers_hidden_talents", question: "If I looked at your 'Saved' folder on social media, what kind of art or projects would I see?", category: "Creative", intensity: "medium" },
  { id: "side_014", deckId: "coworkers_hidden_talents", question: "Are you a 'maker' (woodworking, knitting, DIY) or a 'consumer' of art?", category: "Creative", intensity: "mild" },
  { id: "side_015", deckId: "coworkers_hidden_talents", question: "What’s the most 'creative' thing you’ve done this year that had nothing to do with work?", category: "Creative", intensity: "medium" },
  { id: "side_016", deckId: "coworkers_hidden_talents", question: "If you could have a studio for anything (music, painting, yoga), what would it look like?", category: "Creative", intensity: "mild" },
  { id: "side_017", deckId: "coworkers_hidden_talents", question: "What’s a piece of work you’ve created that you’re most proud of?", category: "Creative", intensity: "deep" },
  { id: "side_018", deckId: "coworkers_hidden_talents", question: "Do you have an 'alter ego' online (e.g., a gaming handle or a pseudonymous blog)?", category: "Creative", intensity: "medium" },
  { id: "side_019", deckId: "coworkers_hidden_talents", question: "What is your 'dream' project that you haven't started yet?", category: "Creative", intensity: "deep" },
  { id: "side_020", deckId: "coworkers_hidden_talents", question: "If you were to start a YouTube channel tomorrow, what would be your 'niche'?", category: "Creative", intensity: "mild" },

  //   Category: The Weekend Life
  { id: "side_021", deckId: "coworkers_hidden_talents", question: "Who are you when you aren't [Job Title]? How would your neighbors describe you?", category: "Weekend", intensity: "deep" },
  { id: "side_022", deckId: "coworkers_hidden_talents", question: "What is your 'perfect' Saturday morning from start to finish?", category: "Weekend", intensity: "mild" },
  { id: "side_023", deckId: "coworkers_hidden_talents", question: "Do you have a 'side hustle' or a small business you run on the weekends?", category: "Weekend", intensity: "medium" },
  { id: "side_024", deckId: "coworkers_hidden_talents", question: "Are you a 'weekend warrior' (intense sports/activities) or a 'weekend sloth'?", category: "Weekend", intensity: "mild" },
  { id: "side_025", deckId: "coworkers_hidden_talents", question: "What is the one thing you do on the weekend that completely recharges your batteries?", category: "Weekend", intensity: "medium" },
  { id: "side_026", deckId: "coworkers_hidden_talents", question: "Do you volunteer or belong to any interesting clubs or communities?", category: "Weekend", intensity: "medium" },
  { id: "side_027", deckId: "coworkers_hidden_talents", question: "What’s the most 'adventurous' thing you’ve done recently outside of work hours?", category: "Weekend", intensity: "mild" },
  { id: "side_028", deckId: "coworkers_hidden_talents", question: "If we ran into each other at 8:00 PM on a Friday, where would we most likely be?", category: "Weekend", intensity: "mild" },
  { id: "side_029", deckId: "coworkers_hidden_talents", question: "What is the one chore you actually enjoy doing on your time off?", category: "Weekend", intensity: "mild" },
  { id: "side_030", deckId: "coworkers_hidden_talents", question: "How long does it take you to stop thinking about work once the weekend starts?", category: "Weekend", intensity: "deep" },

  //   Category: Hypothetical Pivots
  { id: "side_031", deckId: "coworkers_hidden_talents", question: "If you were forced to retire today, what would you do with all your free time?", category: "Pivots", intensity: "medium" },
  { id: "side_032", deckId: "coworkers_hidden_talents", question: "What’s a 'dream job' you had as a teenager that you completely abandoned?", category: "Pivots", intensity: "medium" },
  { id: "side_033", deckId: "coworkers_hidden_talents", question: "If money were no object, what would you spend your life learning?", category: "Pivots", intensity: "deep" },
  { id: "side_034", deckId: "coworkers_hidden_talents", question: "Would you rather be a famous musician, a world-class chef, or a brilliant scientist?", category: "Pivots", intensity: "mild" },
  { id: "side_035", deckId: "coworkers_hidden_talents", question: "If you could 'download' one skill into your brain Matrix-style, what would it be?", category: "Pivots", intensity: "medium" },
  { id: "side_036", deckId: "coworkers_hidden_talents", question: "What is the most 'random' certificate or award you’ve ever won?", category: "Pivots", intensity: "mild" },
  { id: "side_037", deckId: "coworkers_hidden_talents", question: "If you had to join a circus, what would your job be?", category: "Pivots", intensity: "mild" },
  { id: "side_038", deckId: "coworkers_hidden_talents", question: "What is a career you find fascinating but would never actually want to do?", category: "Pivots", intensity: "medium" },
  { id: "side_039", deckId: "coworkers_hidden_talents", question: "If you could be a professional athlete for one day, which sport would you pick?", category: "Pivots", intensity: "mild" },
  { id: "side_040", deckId: "coworkers_hidden_talents", question: "What is one 'pipe dream' you still haven't given up on?", category: "Pivots", intensity: "deep" },

  //   Category: Fun & Quirky
  { id: "side_041", deckId: "coworkers_hidden_talents", question: "What’s the most 'illegal' (but harmless) thing you’ve ever done?", category: "Quirky", intensity: "medium" },
  { id: "side_042", deckId: "coworkers_hidden_talents", question: "Do you have a 'collection' of anything weird? (Rocks? Vintage tech? Strange socks?)", category: "Quirky", intensity: "mild" },
  { id: "side_043", deckId: "coworkers_hidden_talents", question: "What is the most 'unusual' food you know how to make perfectly?", category: "Quirky", intensity: "mild" },
  { id: "side_044", deckId: "coworkers_hidden_talents", question: "If you could communicate with one species of animal, which one would it be?", category: "Quirky", intensity: "mild" },
  { id: "side_045", deckId: "coworkers_hidden_talents", question: "What’s the weirdest 'rabbit hole' you’ve ever fallen down on Wikipedia?", category: "Quirky", intensity: "medium" },
  { id: "side_046", deckId: "coworkers_hidden_talents", question: "What is your 'guilty pleasure' movie that you know is bad but love anyway?", category: "Quirky", intensity: "mild" },
  { id: "side_047", deckId: "coworkers_hidden_talents", question: "If you were a ghost, where would you haunt and why?", category: "Quirky", intensity: "mild" },
  { id: "side_048", deckId: "coworkers_hidden_talents", question: "What’s the best 'prank' you’ve ever pulled (or had pulled on you)?", category: "Quirky", intensity: "medium" },
  { id: "side_049", deckId: "coworkers_hidden_talents", question: "If you could travel back in time to one era just for the fashion, which would it be?", category: "Quirky", intensity: "mild" },
  { id: "side_050", deckId: "coworkers_hidden_talents", question: "What is your 'signature' dish that you bring to every potluck?", category: "Quirky", intensity: "mild" },

  //   Category: Personal Philosophy
  { id: "side_051", deckId: "coworkers_hidden_talents", question: "What is a 'mantra' or quote you live by outside of the office?", category: "Philosophy", intensity: "deep" },
  { id: "side_052", deckId: "coworkers_hidden_talents", question: "What is the most 'meaningful' experience you’ve had that had nothing to do with your career?", category: "Philosophy", intensity: "deep" },
  { id: "side_053", deckId: "coworkers_hidden_talents", question: "How do you define 'success' for your personal life?", category: "Philosophy", intensity: "deep" },
  { id: "side_054", deckId: "coworkers_hidden_talents", question: "What is one thing you’ve learned recently that changed your perspective on the world?", category: "Philosophy", intensity: "medium" },
  { id: "side_055", deckId: "coworkers_hidden_talents", question: "Do you believe in 'destiny' or are we just making it up as we go?", category: "Philosophy", intensity: "deep" },
  { id: "side_056", deckId: "coworkers_hidden_talents", question: "What is one thing you want to be remembered for that isn't your work?", category: "Philosophy", intensity: "deep" },
  { id: "side_057", deckId: "coworkers_hidden_talents", question: "If you could tell the whole world one thing, what would it be?", category: "Philosophy", intensity: "deep" },
  { id: "side_058", deckId: "coworkers_hidden_talents", question: "What is the biggest 'risk' you’ve ever taken in your personal life?", category: "Philosophy", intensity: "deep" },
  { id: "side_059", deckId: "coworkers_hidden_talents", question: "Who is the 'real' you that most people don't get to see?", category: "Philosophy", intensity: "deep" },
  { id: "side_060", deckId: "coworkers_hidden_talents", question: "What is one thing you’re deeply grateful for today?", category: "Philosophy", intensity: "medium" },

  //   Category: Daily Office Habits
  { id: "super_001", deckId: "coworkers_office_superlatives", question: "Most likely to be on their third cup of coffee by 9:00 AM?", category: "Daily Habits", intensity: "mild" },
  { id: "super_002", deckId: "coworkers_office_superlatives", question: "Most likely to have the messiest desk in the office?", category: "Daily Habits", intensity: "mild" },
  { id: "super_003", deckId: "coworkers_office_superlatives", question: "Most likely to have a snack drawer better stocked than a grocery store?", category: "Daily Habits", intensity: "mild" },
  { id: "super_004", deckId: "coworkers_office_superlatives", question: "Most likely to start a meeting with a 5-minute story about their weekend?", category: "Daily Habits", intensity: "mild" },
  { id: "super_005", deckId: "coworkers_office_superlatives", question: "Most likely to be the first one to say 'Happy Friday' on a Monday?", category: "Daily Habits", intensity: "mild" },
  { id: "super_006", deckId: "coworkers_office_superlatives", question: "Most likely to have exactly zero unread emails?", category: "Daily Habits", intensity: "medium" },
  { id: "super_007", deckId: "coworkers_office_superlatives", question: "Most likely to still be working 30 minutes after they said they were leaving?", category: "Daily Habits", intensity: "medium" },
  { id: "super_008", deckId: "coworkers_office_superlatives", question: "Most likely to remember everyone's birthday without a calendar reminder?", category: "Daily Habits", intensity: "mild" },
  { id: "super_009", deckId: "coworkers_office_superlatives", question: "Most likely to have a color-coded calendar?", category: "Daily Habits", intensity: "mild" },
  { id: "super_010", deckId: "coworkers_office_superlatives", question: "Most likely to be the 'office DJ' if we had a shared speaker?", category: "Daily Habits", intensity: "mild" },

  //   Category: Tech & Communication
  { id: "super_011", deckId: "coworkers_office_superlatives", question: "Most likely to accidentally reply to a 'Reply All' email chain?", category: "Tech", intensity: "mild" },
  { id: "super_012", deckId: "coworkers_office_superlatives", question: "Most likely to stay on mute while they’ve been talking for a full minute?", category: "Tech", intensity: "mild" },
  { id: "super_013", deckId: "coworkers_office_superlatives", question: "Most likely to send the perfect emoji reaction for every situation?", category: "Tech", intensity: "mild" },
  { id: "super_014", deckId: "coworkers_office_superlatives", question: "Most likely to have 50+ tabs open at all times?", category: "Tech", intensity: "medium" },
  { id: "super_015", deckId: "coworkers_office_superlatives", question: "Most likely to be the first person to try a new AI tool or software?", category: "Tech", intensity: "medium" },
  { id: "super_016", deckId: "coworkers_office_superlatives", question: "Most likely to have the best virtual background during a call?", category: "Tech", intensity: "mild" },
  { id: "super_017", deckId: "coworkers_office_superlatives", question: "Most likely to send a Slack message at 11:00 PM (and expect a reply)?", category: "Tech", intensity: "medium" },
  { id: "super_018", deckId: "coworkers_office_superlatives", question: "Most likely to fix the office printer without calling IT?", category: "Tech", intensity: "mild" },
  { id: "super_019", deckId: "coworkers_office_superlatives", question: "Most likely to use 'corporate speak' ironically in real life?", category: "Tech", intensity: "mild" },
  { id: "super_020", deckId: "coworkers_office_superlatives", question: "Most likely to be 'away' on Teams/Slack but actually working?", category: "Tech", intensity: "medium" },

  //   Category: Crisis & Chaos
  { id: "super_021", deckId: "coworkers_office_superlatives", question: "Most likely to stay calm when a major deadline is 10 minutes away?", category: "Chaos", intensity: "medium" },
  { id: "super_022", deckId: "coworkers_office_superlatives", question: "Most likely to find the one typo in a 50-page document?", category: "Chaos", intensity: "medium" },
  { id: "super_023", deckId: "coworkers_office_superlatives", question: "Most likely to have a 'Plan B, C, and D' for every project?", category: "Chaos", intensity: "medium" },
  { id: "super_024", deckId: "coworkers_office_superlatives", question: "Most likely to make a joke to break the tension during a stressful meeting?", category: "Chaos", intensity: "medium" },
  { id: "super_025", deckId: "coworkers_office_superlatives", question: "Most likely to be the 'rock' that keeps the team grounded?", category: "Chaos", intensity: "deep" },
  { id: "super_026", deckId: "coworkers_office_superlatives", question: "Most likely to solve a problem that isn't even in their job description?", category: "Chaos", intensity: "deep" },
  { id: "super_027", deckId: "coworkers_office_superlatives", question: "Most likely to survive an office zombie apocalypse?", category: "Chaos", intensity: "mild" },
  { id: "super_028", deckId: "coworkers_office_superlatives", question: "Most likely to be the first one to say 'I told you so' (politely)?", category: "Chaos", intensity: "medium" },
  { id: "super_029", deckId: "coworkers_office_superlatives", question: "Most likely to volunteer for a task no one else wants to do?", category: "Chaos", intensity: "medium" },
  { id: "super_030", deckId: "coworkers_office_superlatives", question: "Most likely to lead the charge during a pivot in strategy?", category: "Chaos", intensity: "deep" },

  //   Category: Social & Fun
  { id: "super_031", deckId: "coworkers_office_superlatives", question: "Most likely to organize an unsanctioned happy hour?", category: "Social", intensity: "mild" },
  { id: "super_032", deckId: "coworkers_office_superlatives", question: "Most likely to win a game of office trivia?", category: "Social", intensity: "mild" },
  { id: "super_033", deckId: "coworkers_office_superlatives", question: "Most likely to have the best pet photos to share?", category: "Social", intensity: "mild" },
  { id: "super_034", deckId: "coworkers_office_superlatives", question: "Most likely to know the best hidden lunch spot in the city?", category: "Social", intensity: "mild" },
  { id: "super_035", deckId: "coworkers_office_superlatives", question: "Most likely to be the 'life of the party' at the holiday event?", category: "Social", intensity: "mild" },
  { id: "super_036", deckId: "coworkers_office_superlatives", question: "Most likely to remember everyone's name on the first day?", category: "Social", intensity: "medium" },
  { id: "super_037", deckId: "coworkers_office_superlatives", question: "Most likely to be the first one on the dance floor?", category: "Social", intensity: "mild" },
  { id: "super_038", deckId: "coworkers_office_superlatives", question: "Most likely to start a 'lunch club'?", category: "Social", intensity: "mild" },
  { id: "super_039", deckId: "coworkers_office_superlatives", question: "Most likely to be friends with the CEO AND the janitor?", category: "Social", intensity: "deep" },
  { id: "super_040", deckId: "coworkers_office_superlatives", question: "Most likely to have a secret side-hustle that will make them famous?", category: "Social", intensity: "medium" },

  //   Category: Ambition & Future
  { id: "super_041", deckId: "coworkers_office_superlatives", question: "Most likely to be the CEO of this company in 10 years?", category: "Future", intensity: "deep" },
  { id: "super_042", deckId: "coworkers_office_superlatives", question: "Most likely to write a best-selling business book?", category: "Future", intensity: "medium" },
  { id: "super_043", deckId: "coworkers_office_superlatives", question: "Most likely to retire by the age of 45?", category: "Future", intensity: "medium" },
  { id: "super_044", deckId: "coworkers_office_superlatives", question: "Most likely to give a TED Talk?", category: "Future", intensity: "medium" },
  { id: "super_045", deckId: "coworkers_office_superlatives", question: "Most likely to be the one who finally figures out 'the secret' to productivity?", category: "Future", intensity: "medium" },
  { id: "super_046", deckId: "coworkers_office_superlatives", question: "Most likely to mentor the next generation of workers?", category: "Future", intensity: "deep" },
  { id: "super_047", deckId: "coworkers_office_superlatives", question: "Most likely to win an 'Employee of the Year' award?", category: "Future", intensity: "medium" },
  { id: "super_048", deckId: "coworkers_office_superlatives", question: "Most likely to move to a different country for a job?", category: "Future", intensity: "medium" },
  { id: "super_049", deckId: "coworkers_office_superlatives", question: "Most likely to invent a new way of working that we all adopt?", category: "Future", intensity: "deep" },
  { id: "super_050", deckId: "coworkers_office_superlatives", question: "Most likely to be the person people 'brag' about having worked with?", category: "Future", intensity: "deep" },

  //   Category: Miscellaneous
  { id: "super_051", deckId: "coworkers_office_superlatives", question: "Most likely to have a surprisingly cool car?", category: "Misc", intensity: "mild" },
  { id: "super_052", deckId: "coworkers_office_superlatives", question: "Most likely to bring the best leftovers for lunch?", category: "Misc", intensity: "mild" },
  { id: "super_053", deckId: "coworkers_office_superlatives", question: "Most likely to be a 'hidden gem' of a singer at karaoke?", category: "Misc", intensity: "mild" },
  { id: "super_054", deckId: "coworkers_office_superlatives", question: "Most likely to be mistaken for a celebrity?", category: "Misc", intensity: "mild" },
  { id: "super_055", deckId: "coworkers_office_superlatives", question: "Most likely to have the coolest weekend hobby (skydiving, pottery, etc.)?", category: "Misc", intensity: "mild" },
  { id: "super_056", deckId: "coworkers_office_superlatives", question: "Most likely to be the 'best dressed' in a casual office?", category: "Misc", intensity: "mild" },
  { id: "super_057", deckId: "coworkers_office_superlatives", question: "Most likely to keep a secret for the team?", category: "Misc", intensity: "medium" },
  { id: "super_058", deckId: "coworkers_office_superlatives", question: "Most likely to be the one we all call for tech support first?", category: "Misc", intensity: "mild" },
  { id: "super_059", deckId: "coworkers_office_superlatives", question: "Most likely to have the best sense of humor in a crisis?", category: "Misc", intensity: "medium" },
  { id: "super_060", deckId: "coworkers_office_superlatives", question: "Most likely to be the heart of this team?", category: "Misc", intensity: "deep" },

  //   Category: Leadership Philosophy
  { id: "vision_001", deckId: "coworkers_leadership", question: "Do you believe leaders are born or made through experience?", category: "Philosophy", intensity: "medium" },
  { id: "vision_002", deckId: "coworkers_leadership", question: "What is the single most important quality a leader must have during a crisis?", category: "Philosophy", intensity: "deep" },
  { id: "vision_003", deckId: "coworkers_leadership", question: "Would you rather be a leader who is loved or a leader who is respected?", category: "Philosophy", intensity: "deep" },
  { id: "vision_004", deckId: "coworkers_leadership", question: "What does 'servant leadership' mean to you in a practical sense?", category: "Philosophy", intensity: "medium" },
  { id: "vision_005", deckId: "coworkers_leadership", question: "How do you define 'integrity' in a professional setting?", category: "Philosophy", intensity: "deep" },
  { id: "vision_006", deckId: "coworkers_leadership", question: "Is it a leader’s job to be part of the team or to stand outside of it?", category: "Philosophy", intensity: "medium" },
  { id: "vision_007", deckId: "coworkers_leadership", question: "What is the biggest mistake modern leaders make?", category: "Philosophy", intensity: "medium" },
  { id: "vision_008", deckId: "coworkers_leadership", question: "How do you balance being 'approachable' with maintaining authority?", category: "Philosophy", intensity: "medium" },
  { id: "vision_009", deckId: "coworkers_leadership", question: "What is your personal 'leadership mantra'?", category: "Philosophy", intensity: "medium" },
  { id: "vision_010", deckId: "coworkers_leadership", question: "Who is the most inspiring leader (living or dead) you’ve ever observed?", category: "Philosophy", intensity: "medium" },

  //   Category: Decision Making & Ethics
  { id: "vision_011", deckId: "coworkers_leadership", question: "When you have to make a hard choice, do you follow your gut or the data?", category: "Decisions", intensity: "medium" },
  { id: "vision_012", deckId: "coworkers_leadership", question: "How do you handle the weight of making a decision that affects people’s lives?", category: "Decisions", intensity: "deep" },
  { id: "vision_013", deckId: "coworkers_leadership", question: "What is your process for admitting you made a wrong decision?", category: "Decisions", intensity: "deep" },
  { id: "vision_014", deckId: "coworkers_leadership", question: "Is it ever okay to lie to your team for the 'greater good'?", category: "Ethics", intensity: "deep" },
  { id: "vision_015", deckId: "coworkers_leadership", question: "How do you handle an ethical dilemma where the 'right' thing is bad for business?", category: "Ethics", intensity: "deep" },
  { id: "vision_016", deckId: "coworkers_leadership", question: "What do you do when you disagree with a decision from someone above you?", category: "Decisions", intensity: "medium" },
  { id: "vision_017", deckId: "coworkers_leadership", question: "How do you ensure you are hearing the voices of the quietest people on the team?", category: "Decisions", intensity: "medium" },
  { id: "vision_018", deckId: "coworkers_leadership", question: "What is the most difficult conversation you’ve ever had to lead?", category: "Decisions", intensity: "deep" },
  { id: "vision_019", deckId: "coworkers_leadership", question: "How do you define 'fairness' in a workplace?", category: "Ethics", intensity: "deep" },
  { id: "vision_020", deckId: "coworkers_leadership", question: "What is your 'red line' that you would never cross for a job?", category: "Ethics", intensity: "deep" },

  //   Category: Strategy & Future
  { id: "vision_021", deckId: "coworkers_leadership", question: "What is the biggest 'blind spot' our industry has right now?", category: "Strategy", intensity: "medium" },
  { id: "vision_022", deckId: "coworkers_leadership", question: "If you were starting our company from scratch today, what would you do differently?", category: "Strategy", intensity: "deep" },
  { id: "vision_023", deckId: "coworkers_leadership", question: "How do you stay ahead of the curve when everything is changing so fast?", category: "Strategy", intensity: "medium" },
  { id: "vision_024", deckId: "coworkers_leadership", question: "What is one 'crazy' idea you have for our team that might actually work?", category: "Strategy", intensity: "medium" },
  { id: "vision_025", deckId: "coworkers_leadership", question: "How do you balance short-term wins with long-term vision?", category: "Strategy", intensity: "medium" },
  { id: "vision_026", deckId: "coworkers_leadership", question: "What is the 'next big thing' that will disrupt our work?", category: "Strategy", intensity: "medium" },
  { id: "vision_027", deckId: "coworkers_leadership", question: "How do you build a team that is 'future-proof'?", category: "Strategy", intensity: "deep" },
  { id: "vision_028", deckId: "coworkers_leadership", question: "What does 'innovation' actually mean to you, beyond the buzzword?", category: "Strategy", intensity: "medium" },
  { id: "vision_029", deckId: "coworkers_leadership", question: "If you had a $1 million budget to fix ONE thing in our workflow, what is it?", category: "Strategy", intensity: "medium" },
  { id: "vision_030", deckId: "coworkers_leadership", question: "What is the legacy you want to leave behind in your professional career?", category: "Strategy", intensity: "deep" },

  //   Category: People & Culture
  { id: "vision_031", deckId: "coworkers_leadership", question: "What is the most common reason good people leave a company?", category: "Culture", intensity: "deep" },
  { id: "vision_032", deckId: "coworkers_leadership", question: "How do you motivate someone who has completely lost interest?", category: "Culture", intensity: "medium" },
  { id: "vision_033", deckId: "coworkers_leadership", question: "Is it a leader’s job to manage work or to manage emotions?", category: "Culture", intensity: "deep" },
  { id: "vision_034", deckId: "coworkers_leadership", question: "How do you handle 'toxic' high-performers?", category: "Culture", intensity: "deep" },
  { id: "vision_035", deckId: "coworkers_leadership", question: "What is the best way to deliver hard feedback so it actually lands?", category: "Culture", intensity: "medium" },
  { id: "vision_036", deckId: "coworkers_leadership", question: "How do you celebrate failure in a way that encourages growth?", category: "Culture", intensity: "medium" },
  { id: "vision_037", deckId: "coworkers_leadership", question: "What does 'true diversity' look like in a team beyond just numbers?", category: "Culture", intensity: "deep" },
  { id: "vision_038", deckId: "coworkers_leadership", question: "How do you build trust with someone who has been burned by a past boss?", category: "Culture", intensity: "deep" },
  { id: "vision_039", deckId: "coworkers_leadership", question: "What is the one thing you would never tolerate in a team environment?", category: "Culture", intensity: "medium" },
  { id: "vision_040", deckId: "coworkers_leadership", question: "How do you define a 'high-performing' team?", category: "Culture", intensity: "medium" },

  //   Category: Growth & Mentorship
  { id: "vision_041", deckId: "coworkers_leadership", question: "Who was the first person to truly believe in your professional potential?", category: "Mentorship", intensity: "deep" },
  { id: "vision_042", deckId: "coworkers_leadership", question: "What is the best piece of career advice you’ve ever given to someone else?", category: "Mentorship", intensity: "medium" },
  { id: "vision_043", deckId: "coworkers_leadership", question: "How do you mentor someone who is older or more experienced than you?", category: "Mentorship", intensity: "medium" },
  { id: "vision_044", deckId: "coworkers_leadership", question: "What is one skill you wish someone had taught you 10 years ago?", category: "Mentorship", intensity: "medium" },
  { id: "vision_045", deckId: "coworkers_leadership", question: "Do you believe in giving 'second chances' to under-performers?", category: "Mentorship", intensity: "medium" },
  { id: "vision_046", deckId: "coworkers_leadership", question: "What is the most rewarding part of seeing someone you trained succeed?", category: "Mentorship", intensity: "deep" },
  { id: "vision_047", deckId: "coworkers_leadership", question: "How do you push people to grow without making them feel inadequate?", category: "Mentorship", intensity: "medium" },
  { id: "vision_048", deckId: "coworkers_leadership", question: "What is your 'coaching style' in three words?", category: "Mentorship", intensity: "medium" },
  { id: "vision_049", deckId: "coworkers_leadership", question: "If you could only teach one thing to a new hire, what would it be?", category: "Mentorship", intensity: "medium" },
  { id: "vision_050", deckId: "coworkers_leadership", question: "How has being a mentor changed YOUR perspective on work?", category: "Mentorship", intensity: "deep" },

  //   Category: Final Reflections
  { id: "vision_051", deckId: "coworkers_leadership", question: "What is the 'scariest' part about having power?", category: "Reflection", intensity: "deep" },
  { id: "vision_052", deckId: "coworkers_leadership", question: "What is one thing you’ve learned about yourself only by leading others?", category: "Reflection", intensity: "deep" },
  { id: "vision_053", deckId: "coworkers_leadership", question: "If you could change one thing about your leadership style, what would it be?", category: "Reflection", intensity: "medium" },
  { id: "vision_054", deckId: "coworkers_leadership", question: "How do you handle the isolation that sometimes comes with being in charge?", category: "Reflection", intensity: "deep" },
  { id: "vision_055", deckId: "coworkers_leadership", question: "What is the biggest sacrifice you’ve made for your career vision?", category: "Reflection", intensity: "deep" },
  { id: "vision_056", deckId: "coworkers_leadership", question: "What does 'success' mean to you now compared to when you started?", category: "Reflection", intensity: "deep" },
  { id: "vision_057", deckId: "coworkers_leadership", question: "What do you want people to say about you at your retirement party?", category: "Reflection", intensity: "medium" },
  { id: "vision_058", deckId: "coworkers_leadership", question: "What is one thing you want to achieve before you leave this company?", category: "Reflection", intensity: "medium" },
  { id: "vision_059", deckId: "coworkers_leadership", question: "What is the 'why' behind everything you do at work?", category: "Reflection", intensity: "deep" },
  { id: "vision_060", deckId: "coworkers_leadership", question: "If you could leave one message for the future leaders of this world, what is it?", category: "Reflection", intensity: "deep" },

  //   Category: Morning & Getting Started
  { id: "flow_001", deckId: "coworkers_productivity", question: "What is your 'startup ritual' to get your brain in work mode?", category: "Morning", intensity: "mild" },
  { id: "flow_002", deckId: "coworkers_productivity", question: "Are you more productive immediately after waking up or after a few hours of being awake?", category: "Morning", intensity: "mild" },
  { id: "flow_003", deckId: "coworkers_productivity", question: "What is the very first task you tackle every day—the easiest or the hardest?", category: "Morning", intensity: "medium" },
  { id: "flow_004", deckId: "coworkers_productivity", question: "Caffeine: Is it a productivity requirement or just a habit for you?", category: "Morning", intensity: "mild" },
  { id: "flow_005", deckId: "coworkers_productivity", question: "Do you check your emails/messages before you even get out of bed?", category: "Morning", intensity: "medium" },
  { id: "flow_006", deckId: "coworkers_productivity", question: "What is your #1 tip for avoiding the 'morning slump'?", category: "Morning", intensity: "mild" },
  { id: "flow_007", deckId: "coworkers_productivity", question: "Do you prefer a structured to-do list or a mental map of your day?", category: "Morning", intensity: "mild" },
  { id: "flow_008", deckId: "coworkers_productivity", question: "What’s the one song that always gets you pumped to work?", category: "Morning", intensity: "mild" },
  { id: "flow_009", deckId: "coworkers_productivity", question: "How long is your ideal 'commute' (even if it's just to the living room)?", category: "Morning", intensity: "mild" },
  { id: "flow_010", deckId: "coworkers_productivity", question: "If you have 10 minutes before a meeting, what do you do with that time?", category: "Morning", intensity: "medium" },

  //   Category: Focus & Environment
  { id: "flow_011", deckId: "coworkers_productivity", question: "What is the biggest 'flow-killer' in your current environment?", category: "Focus", intensity: "medium" },
  { id: "flow_012", deckId: "coworkers_productivity", question: "Total silence, white noise, or a specific playlist for deep work?", category: "Focus", intensity: "mild" },
  { id: "flow_013", deckId: "coworkers_productivity", question: "Can you work in a public place (like a cafe) or do you need a private 'bunker'?", category: "Focus", intensity: "mild" },
  { id: "flow_014", deckId: "coworkers_productivity", question: "What is your 'emergency' trick to regain focus when your mind starts wandering?", category: "Focus", intensity: "medium" },
  { id: "flow_015", deckId: "coworkers_productivity", question: "How many browser tabs do you usually have open before you start feeling stressed?", category: "Focus", intensity: "mild" },
  { id: "flow_016", deckId: "coworkers_productivity", question: "Do you use 'Do Not Disturb' modes religiously or do you like being reachable?", category: "Focus", intensity: "medium" },
  { id: "flow_017", deckId: "coworkers_productivity", question: "What is the most 'distracting' app on your phone during work hours?", category: "Focus", intensity: "mild" },
  { id: "flow_018", deckId: "coworkers_productivity", question: "Does a messy desk help your creativity or hinder your productivity?", category: "Focus", intensity: "mild" },
  { id: "flow_019", deckId: "coworkers_productivity", question: "What is your opinion on 'body doubling' (working alongside someone else to stay focused)?", category: "Focus", intensity: "medium" },
  { id: "flow_020", deckId: "coworkers_productivity", question: "How long can you truly stay in a deep-focus state before needing a break?", category: "Focus", intensity: "medium" },

  //   Category: Tools & Hacks
  { id: "flow_021", deckId: "coworkers_productivity", question: "What is the one 'unusual' productivity tool or app you swear by?", category: "Tools", intensity: "mild" },
  { id: "flow_022", deckId: "coworkers_productivity", question: "Are you a 'keyboard shortcut' master or a 'point and click' person?", category: "Tools", intensity: "mild" },
  { id: "flow_023", deckId: "coworkers_productivity", question: "What is the best browser extension you've ever installed?", category: "Tools", intensity: "mild" },
  { id: "flow_024", deckId: "coworkers_productivity", question: "Physical planner, digital calendar, or sticky notes everywhere?", category: "Tools", intensity: "mild" },
  { id: "flow_025", deckId: "coworkers_productivity", question: "How do you use AI to speed up your daily workflow?", category: "Tools", intensity: "medium" },
  { id: "flow_026", deckId: "coworkers_productivity", question: "What is your 'must-have' hardware for a productive day?", category: "Tools", intensity: "mild" },
  { id: "flow_027", deckId: "coworkers_productivity", question: "Do you have a specific method for naming files so you can actually find them later?", category: "Tools", intensity: "mild" },
  { id: "flow_028", deckId: "coworkers_productivity", question: "What is the one 'low-tech' hack that saves you the most time?", category: "Tools", intensity: "medium" },
  { id: "flow_029", deckId: "coworkers_productivity", question: "How do you manage your 'to-read' or 'to-watch' list for professional growth?", category: "Tools", intensity: "medium" },
  { id: "flow_030", deckId: "coworkers_productivity", question: "What is the one software feature you wish existed but doesn't?", category: "Tools", intensity: "mild" },

  //   Category: Time Management & Priorities
  { id: "flow_031", deckId: "coworkers_productivity", question: "How do you decide what is 'urgent' versus what is 'important'?", category: "Management", intensity: "medium" },
  { id: "flow_032", deckId: "coworkers_productivity", question: "What is your 'hard no' when it comes to taking on new tasks?", category: "Management", intensity: "deep" },
  { id: "flow_033", deckId: "coworkers_productivity", question: "Do you use the Pomodoro technique or another specific time-blocking method?", category: "Management", intensity: "mild" },
  { id: "flow_034", deckId: "coworkers_productivity", question: "What’s the best way to decline a meeting that could have been an email?", category: "Management", intensity: "medium" },
  { id: "flow_035", deckId: "coworkers_productivity", question: "How do you handle 'productivity guilt' on days when you just can't get anything done?", category: "Management", intensity: "deep" },
  { id: "flow_036", deckId: "coworkers_productivity", question: "What is your strategy for tackling a project that feels completely overwhelming?", category: "Management", intensity: "medium" },
  { id: "flow_037", deckId: "coworkers_productivity", question: "Are you a multitasker or a single-tasker?", category: "Management", intensity: "medium" },
  { id: "flow_038", deckId: "coworkers_productivity", question: "How do you 'protect' your time from interruptions?", category: "Management", intensity: "medium" },
  { id: "flow_039", deckId: "coworkers_productivity", question: "What is the biggest 'time-waster' you’ve successfully cut out of your life?", category: "Management", intensity: "medium" },
  { id: "flow_040", deckId: "coworkers_productivity", question: "How many hours of 'real' work do you think the average person actually does in an 8-hour day?", category: "Management", intensity: "deep" },

  //   Category: Energy & The Zone
  { id: "flow_041", deckId: "coworkers_productivity", question: "What does being 'in the zone' physically feel like for you?", category: "The Zone", intensity: "deep" },
  { id: "flow_042", deckId: "coworkers_productivity", question: "What is your 'prime time'—the hours when your brain is sharpest?", category: "The Zone", intensity: "medium" },
  { id: "flow_043", deckId: "coworkers_productivity", question: "How do you 'reset' your energy after a draining meeting?", category: "The Zone", intensity: "medium" },
  { id: "flow_044", deckId: "coworkers_productivity", question: "What is your 'afternoon slump' survival strategy?", category: "The Zone", intensity: "mild" },
  { id: "flow_045", deckId: "coworkers_productivity", question: "Do you get your best ideas while working, or while doing something else (like showering or walking)?", category: "The Zone", intensity: "medium" },
  { id: "flow_046", deckId: "coworkers_productivity", question: "How do you recognize when you've hit the point of 'diminishing returns' for the day?", category: "The Zone", intensity: "deep" },
  { id: "flow_047", deckId: "coworkers_productivity", question: "What is the most 'satisfying' type of work for you to complete?", category: "The Zone", intensity: "medium" },
  { id: "flow_048", deckId: "coworkers_productivity", question: "Do you work better under a tight deadline or with plenty of breathing room?", category: "The Zone", intensity: "medium" },
  { id: "flow_049", deckId: "coworkers_productivity", question: "What is one thing that instantly 'drains your battery' at work?", category: "The Zone", intensity: "deep" },
  { id: "flow_050", deckId: "coworkers_productivity", question: "What is the 'perfect' lunch to keep your energy high for the rest of the day?", category: "The Zone", intensity: "mild" },

  //   Category: Reflection & Boundaries
  { id: "flow_051", deckId: "coworkers_productivity", question: "What is the biggest 'myth' about productivity you used to believe?", category: "Reflection", intensity: "deep" },
  { id: "flow_052", deckId: "coworkers_productivity", question: "How has your definition of a 'productive day' changed over the years?", category: "Reflection", intensity: "deep" },
  { id: "flow_053", deckId: "coworkers_productivity", question: "What is the first thing you do to 'wind down' and signal that work is over?", category: "Reflection", intensity: "mild" },
  { id: "flow_054", deckId: "coworkers_productivity", question: "Do you believe in 'hustle culture' or do you prefer the 'slow productivity' approach?", category: "Reflection", intensity: "deep" },
  { id: "flow_055", deckId: "coworkers_productivity", question: "What is one thing you’ve started doing that has drastically improved your work-life balance?", category: "Reflection", intensity: "medium" },
  { id: "flow_056", deckId: "coworkers_productivity", question: "If you could work 4 hours a day but had to be twice as productive, could you do it?", category: "Reflection", intensity: "medium" },
  { id: "flow_057", deckId: "coworkers_productivity", question: "What do you want your 'work legacy' to be in terms of how you operated?", category: "Reflection", intensity: "deep" },
  { id: "flow_058", deckId: "coworkers_productivity", question: "What is the best piece of productivity advice you’ve ever ignored?", category: "Reflection", intensity: "medium" },
  { id: "flow_059", deckId: "coworkers_productivity", question: "How do you stay motivated when the work itself is repetitive or boring?", category: "Reflection", intensity: "deep" },
  { id: "flow_060", deckId: "coworkers_productivity", question: "What is the most 'meaningful' productive moment you’ve had this month?", category: "Reflection", intensity: "deep" }
  
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