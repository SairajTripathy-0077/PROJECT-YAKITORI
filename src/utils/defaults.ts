import type { Quest, PlayerStats, AttributeMap, ShopItem, DroneState } from '../types/game';

export const DEFAULT_ATTRIBUTES: AttributeMap = {
  intellect: { level: 1, xp: 40, xpToNextLevel: 100 },
  strength: { level: 1, xp: 20, xpToNextLevel: 100 },
  creativity: { level: 1, xp: 60, xpToNextLevel: 100 },
  vitality: { level: 1, xp: 50, xpToNextLevel: 100 },
  discipline: { level: 1, xp: 30, xpToNextLevel: 100 },
};

export const DEFAULT_PLAYER_STATS: PlayerStats = {
  name: 'Pixel Questmaster',
  title: 'Novice Adventurer',
  avatar: '🤖',
  level: 1,
  xp: 75,
  xpToNextLevel: 200,
  gold: 150,
  totalCompletedQuests: 2,
  streakDays: 3,
  lastActiveDate: new Date().toISOString().split('T')[0],
  activeMultiplier: 1.2,
  equippedTheme: 'noir',
  equippedBadge: 'badge_novice',
  equippedDroneSkin: 'default',
  inventory: ['theme_noir', 'badge_novice'],
};

export const DEFAULT_QUESTS: Quest[] = [
  {
    id: 'quest-1',
    title: 'Master GSAP Scroll Animations',
    description: 'Implement 60fps smooth scroll triggers with Lenis for the YAKITORI app',
    attribute: 'intellect',
    difficulty: 'hard',
    questType: 'main',
    completed: false,
    createdAt: Date.now() - 86400000,
    subtasks: [
      { id: 'sub-1', title: 'Setup GSAP useGSAP hook', completed: true },
      { id: 'sub-2', title: 'Integrate Lenis smooth scrolling', completed: true },
      { id: 'sub-3', title: 'Verify mobile performance & 60fps', completed: false }
    ],
    xpReward: 75,
    goldReward: 50,
  },
  {
    id: 'quest-2',
    title: '30-Min High-Intensity Workout',
    description: 'Hit the gym or perform bodyweight exercises to boost Physical Strength attribute',
    attribute: 'strength',
    difficulty: 'medium',
    questType: 'daily',
    completed: false,
    createdAt: Date.now() - 3600000,
    subtasks: [
      { id: 'sub-2-1', title: 'Warmup & Stretching', completed: false },
      { id: 'sub-2-2', title: 'Core Workout Routine', completed: false }
    ],
    xpReward: 35,
    goldReward: 25,
  },
  {
    id: 'quest-3',
    title: 'Design Pixel Art UI Blueprint',
    description: 'Craft double-bezel off-black e-ink layouts with Bookerly typography',
    attribute: 'creativity',
    difficulty: 'boss',
    questType: 'main',
    completed: true,
    completedAt: Date.now() - 100000,
    subtasks: [
      { id: 'sub-3-1', title: 'Select Off-Black/Off-White Palette', completed: true },
      { id: 'sub-3-2', title: 'Create Drone Companion Sprite', completed: true }
    ],
    xpReward: 150,
    goldReward: 100,
  },
  {
    id: 'quest-4',
    title: 'Drink 2.5L Water & Meditate',
    description: 'Keep hydrated and complete a 10-minute mindfulness session',
    attribute: 'vitality',
    difficulty: 'easy',
    questType: 'daily',
    completed: false,
    createdAt: Date.now(),
    subtasks: [],
    xpReward: 15,
    goldReward: 10,
  },
  {
    id: 'quest-5',
    title: 'Organize Workspace & Clear Email Inbox',
    description: 'Maintain high Discipline stats by decluttering physical and digital space',
    attribute: 'discipline',
    difficulty: 'easy',
    questType: 'side',
    completed: false,
    createdAt: Date.now(),
    subtasks: [],
    xpReward: 20,
    goldReward: 15,
  }
];

export const INITIAL_SHOP_ITEMS: ShopItem[] = [
  {
    id: 'equip_katana',
    name: 'Cyber Pixel Katana',
    description: '+15% Gold boost on all completed quests',
    price: 200,
    icon: '⚔️',
    category: 'equipment',
    effect: '+15% Gold Earnings',
    statBonus: { attribute: 'strength', boost: 5 },
    purchased: false,
  },
  {
    id: 'equip_glasses',
    name: 'Bookerly Scholar Glasses',
    description: '+20% XP boost on Intellect tasks',
    price: 250,
    icon: '👓',
    category: 'equipment',
    effect: '+20% Intellect XP',
    statBonus: { attribute: 'intellect', boost: 10 },
    purchased: false,
  },
  {
    id: 'theme_eink_paper',
    name: 'Kindle Parchment Theme',
    description: 'Warm off-white paper monochrome aesthetic with deep e-ink contrast',
    price: 100,
    icon: '📜',
    category: 'theme',
    effect: 'Unlocks Paper Parchment Light Mode',
    purchased: false,
  },
  {
    id: 'theme_noir',
    name: 'Obsidian Pixel Noir',
    description: 'High-contrast deep OLED black with double-bezel silver accents',
    price: 0,
    icon: '🕶️',
    category: 'theme',
    effect: 'Default OLED Noir Theme',
    purchased: true,
    equipped: true,
  },
  {
    id: 'badge_novice',
    name: 'Pixel Novice Badge',
    description: 'Proof of starting your pixel quest journey',
    price: 0,
    icon: '🎖️',
    category: 'badge',
    effect: 'Profile Badge',
    purchased: true,
    equipped: true,
  },
  {
    id: 'badge_master',
    name: 'Awwwards Architect Badge',
    description: 'Awarded to masters of visual precision and 60fps motion',
    price: 350,
    icon: '👑',
    category: 'badge',
    effect: 'Legendary Title: "Awwwards Master"',
    purchased: false,
  },
  {
    id: 'drone_wings',
    name: 'Solar Thruster Wings',
    description: 'Equip your Drone Companion with golden solar hover wings',
    price: 300,
    icon: '🪽',
    category: 'drone',
    effect: 'Drone Skin: Solar Thruster',
    purchased: false,
  }
];

export const INITIAL_DRONE_STATE: DroneState = {
  name: 'Byte',
  expression: 'HAPPY',
  currentMessage: 'BEEP BOOP! Welcome Adventurer! I am Byte, your pixel drone companion. Complete quests to level up your stats!',
  isSpeaking: true,
};

export const DRONE_QUOTES: Record<string, string[]> = {
  WELCOME: [
    'BEEP BOOP! Ready for today\'s quest log, Adventurer?',
    'System online! Bookerly fonts loaded. Let\'s conquer some tasks!',
    'Byte here! Check off your quests to earn Gold and level up your stats.'
  ],
  QUEST_COMPLETED: [
    'GREAT JOB! XP and Gold transferred to your inventory!',
    'BEEP! Attribute leveled up! You are growing stronger every day.',
    'Quest completed! Keep the streak flame burning!'
  ],
  LEVEL_UP: [
    'LEVEL UP VICTORY! Triumphant fanfare playing!',
    'POWER OVERWHELMING! Your stats have ascended!',
    'WOOHOO! New level reached! Check the shop for new equipment.'
  ],
  STREAK_BONUS: [
    'STREAK MULTIPLIER ACTIVE! 1.2x XP bonus unlocked!',
    '3 days in a row! You\'re an unstoppable task wizard.'
  ],
  IDLE_TIPS: [
    'Tip: Press "N" anytime to quickly add a new quest!',
    'Tip: Press "D" to toggle between E-Ink Paper and OLED Noir themes.',
    'Tip: Categorize tasks into Intellect, Strength, or Vitality to level specific stats!'
  ]
};
