import type { Quest, PlayerStats, AttributeMap, ShopItem, DroneState } from '../types/game';

export const DEFAULT_ATTRIBUTES: AttributeMap = {
  intellect: { level: 1, xp: 45, xpToNextLevel: 80 },
  strength: { level: 1, xp: 30, xpToNextLevel: 80 },
  creativity: { level: 1, xp: 55, xpToNextLevel: 80 },
  vitality: { level: 1, xp: 40, xpToNextLevel: 80 },
  discipline: { level: 1, xp: 35, xpToNextLevel: 80 },
};

const todayStr = new Date().toISOString().split('T')[0];
const yesterdayDate = new Date(Date.now() - 86400000).toISOString().split('T')[0];
const twoDaysAgoDate = new Date(Date.now() - 172800000).toISOString().split('T')[0];

export const DEFAULT_PLAYER_STATS: PlayerStats = {
  name: 'Pixel Questmaster',
  title: 'Novice Adventurer',
  avatar: '🤖',
  level: 1,
  xp: 65,
  xpToNextLevel: 150,
  totalXpEarned: 165,
  gold: 150,
  totalCompletedQuests: 2,
  streakDays: 3,
  lastActiveDate: todayStr,
  activeMultiplier: 1.3,
  activityHistory: [twoDaysAgoDate, yesterdayDate, todayStr],
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
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    subtasks: [
      { id: 'sub-1', title: 'Setup GSAP useGSAP hook', completed: true },
      { id: 'sub-2', title: 'Integrate Lenis smooth scrolling', completed: true },
      { id: 'sub-3', title: 'Verify mobile performance & 60fps', completed: false }
    ],
    xpReward: 100,
    goldReward: 75,
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
    xpReward: 50,
    goldReward: 35,
  },
  {
    id: 'quest-3',
    title: 'Design Pixel Art UI Blueprint',
    description: 'Craft double-bezel off-black e-ink layouts with Bookerly typography',
    attribute: 'creativity',
    difficulty: 'boss',
    questType: 'main',
    completed: true,
    createdAt: Date.now() - 500000,
    completedAt: Date.now() - 100000,
    subtasks: [
      { id: 'sub-3-1', title: 'Select Off-Black/Off-White Palette', completed: true },
      { id: 'sub-3-2', title: 'Create Drone Companion Sprite', completed: true }
    ],
    xpReward: 220,
    goldReward: 150,
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
    subtasks: [
      { id: 'sub-4-1', title: 'Drink 1L morning hydration', completed: true },
      { id: 'sub-4-2', title: '10-minute breathwork session', completed: false }
    ],
    xpReward: 25,
    goldReward: 15,
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
    xpReward: 25,
    goldReward: 15,
  }
];

const ROW_TITLES = [
  'Crimson Vanguard', 'Blaze Champions', 'Flame Sorcerers', 'Desert Wanderers',
  'Sunblade Paladins', 'Forest Druids', 'Jade Hunters', 'Sea Tacticians',
  'Ocean Guardians', 'Cobalt Shinobi', 'Shadow Stalkers', 'Dusk Marshals',
  'Mystic Enchanters', 'Spectral Walkers', 'Cyber Ninjas', 'Silver Champions'
];

export const SPRITE_CHARACTER_ITEMS: ShopItem[] = Array.from({ length: 192 }, (_, i) => {
  const row = Math.floor(i / 12);
  const col = (i % 12) + 1;
  const group = ROW_TITLES[row] || 'Hero Guild';
  const price = i === 0 ? 0 : 50 + (row * 10) + ((i % 5) * 5);

  return {
    id: `char_sprite_${i}`,
    name: `${group} #${col}`,
    description: `Sliced pixel character #${i + 1} from ${group}. Equippable live avatar for study room presence & leaderboards!`,
    price,
    icon: '👤',
    category: 'character',
    spriteIndex: i,
    effect: `Avatar Sprite #${i + 1}`,
    purchased: i === 0,
    equipped: i === 0,
  };
});

export const INITIAL_SHOP_ITEMS: ShopItem[] = [
  ...SPRITE_CHARACTER_ITEMS,
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
