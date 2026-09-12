import type { Quest, PlayerStats, AttributeMap, ShopItem, DroneState } from '../types/game';

export const DEFAULT_ATTRIBUTES: AttributeMap = {
  intellect: { level: 1, xp: 0, xpToNextLevel: 80 },
  strength: { level: 1, xp: 0, xpToNextLevel: 80 },
  creativity: { level: 1, xp: 0, xpToNextLevel: 80 },
  vitality: { level: 1, xp: 0, xpToNextLevel: 80 },
  discipline: { level: 1, xp: 0, xpToNextLevel: 80 },
};

const todayStr = new Date().toISOString().split('T')[0];

export const DEFAULT_PLAYER_STATS: PlayerStats = {
  name: 'Adventurer',
  title: 'Novice Adventurer',
  avatar: '🤖',
  level: 1,
  xp: 0,
  xpToNextLevel: 150,
  nextLevelXp: 150,
  characterClass: 'Warrior',
  totalXpEarned: 0,
  gold: 0,
  totalCompletedQuests: 0,
  streakDays: 0,
  lastActiveDate: todayStr,
  activeMultiplier: 1.0,
  activityHistory: [],
  equippedTheme: 'noir',
  equippedBadge: 'badge_novice',
  equippedDroneSkin: 'default',
  inventory: ['theme_noir', 'badge_novice'],
};

export const DEFAULT_QUESTS: Quest[] = [];

export const INITIAL_SHOP_ITEMS: ShopItem[] = [
  {
    id: 'equip_katana',
    name: 'Cyber Pixel Katana',
    description: 'Ancient forged pixel blade. Grants +20% Gold boost on all completed quests.',
    price: 180,
    icon: '⚔️',
    category: 'equipment',
    effect: '+20% Gold Earnings',
    statBonus: { attribute: 'gold', boost: 20, type: 'percent' },
    purchased: false,
  },
  {
    id: 'equip_glasses',
    name: 'Scholar Intellect Glasses',
    description: 'Double-bezel titanium spectacles. Grants +25% XP on all Intellect category tasks.',
    price: 200,
    icon: '👓',
    category: 'equipment',
    effect: '+25% Intellect XP',
    statBonus: { attribute: 'intellect', boost: 25, type: 'percent' },
    purchased: false,
  },
  {
    id: 'equip_quill',
    name: 'Prism Stylus Quill',
    description: 'Infused with chromatic ink. Grants +25% XP on all Creativity category quests.',
    price: 200,
    icon: '✒️',
    category: 'equipment',
    effect: '+25% Creativity XP',
    statBonus: { attribute: 'creativity', boost: 25, type: 'percent' },
    purchased: false,
  },
  {
    id: 'equip_elixir',
    name: 'Matcha Vitality Flask',
    description: 'Restorative ceremonial tea. Grants +25% XP on Vitality & Health habits.',
    price: 200,
    icon: '🍵',
    category: 'equipment',
    effect: '+25% Vitality XP',
    statBonus: { attribute: 'vitality', boost: 25, type: 'percent' },
    purchased: false,
  },
  {
    id: 'equip_stopwatch',
    name: 'Chrono Discipline Watch',
    description: 'Precision clockwork timer. Grants +25% XP on Discipline & Routine quests.',
    price: 200,
    icon: '⏱️',
    category: 'equipment',
    effect: '+25% Discipline XP',
    statBonus: { attribute: 'discipline', boost: 25, type: 'percent' },
    purchased: false,
  },
  {
    id: 'equip_belt',
    name: 'Titan Strength Belt',
    description: 'Reinforced leather championship belt. Grants +25% XP on Strength workouts.',
    price: 200,
    icon: '🥋',
    category: 'equipment',
    effect: '+25% Strength XP',
    statBonus: { attribute: 'strength', boost: 25, type: 'percent' },
    purchased: false,
  },
  {
    id: 'badge_novice',
    name: 'Pixel Novice Badge',
    description: 'Proof of starting your pixel quest journey.',
    price: 0,
    icon: '🎖️',
    category: 'badge',
    effect: 'Starter Badge',
    purchased: true,
    equipped: true,
  },
  {
    id: 'badge_streak_hero',
    name: 'Flame Streak Master',
    description: 'Consecutive consistency proof. Grants +10% bonus XP to all attributes.',
    price: 300,
    icon: '🔥',
    category: 'badge',
    effect: '+10% Global XP',
    statBonus: { attribute: 'all', boost: 10, type: 'percent' },
    purchased: false,
  },
  {
    id: 'badge_master',
    name: 'Awwwards Architect Badge',
    description: 'Master of aesthetic precision & 60fps motion. Grants +15% Global XP.',
    price: 450,
    icon: '👑',
    category: 'badge',
    effect: '+15% Global XP & Legendary Title',
    statBonus: { attribute: 'all', boost: 15, type: 'percent' },
    purchased: false,
  },
  {
    id: 'theme_eink_paper',
    name: 'Kindle Parchment Theme',
    description: 'Warm off-white paper monochrome aesthetic with deep e-ink contrast.',
    price: 100,
    icon: '📜',
    category: 'theme',
    effect: 'Paper Parchment Light Mode',
    purchased: false,
  },
  {
    id: 'theme_noir',
    name: 'Obsidian Pixel Noir',
    description: 'High-contrast deep OLED black with double-bezel silver accents.',
    price: 0,
    icon: '🕶️',
    category: 'theme',
    effect: 'Default OLED Noir Theme',
    purchased: true,
    equipped: true,
  },
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
    'STREAK MULTIPLIER ACTIVE! 1.3x XP bonus unlocked!',
    '3 days in a row! You\'re an unstoppable task wizard.'
  ],
  IDLE_TIPS: [
    'Tip: Press "N" anytime to quickly add a new quest!',
    'Tip: Press "D" to toggle between E-Ink Paper and OLED Noir themes.',
    'Tip: Categorize tasks into Intellect, Strength, Creativity, Vitality, or Discipline to level specific stats!'
  ]
};
