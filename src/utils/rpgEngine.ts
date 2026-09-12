import type { 
  AttributeType, 
  QuestDifficulty, 
  PlayerStats, 
  AttributeMap, 
  ShopItem, 
  Quest 
} from '../types/game';

/**
 * Base rewards for each quest difficulty tier.
 */
export const DIFFICULTY_REWARDS: Record<QuestDifficulty, { xp: number; gold: number; label: string }> = {
  easy: { xp: 25, gold: 10, label: 'Easy' },
  medium: { xp: 50, gold: 30, label: 'Medium' },
  hard: { xp: 100, gold: 70, label: 'Hard' },
  boss: { xp: 220, gold: 150, label: 'Boss' },
};

/**
 * Calculates base XP and gold reward for a difficulty level.
 */
export const calculateBaseRewards = (difficulty: QuestDifficulty) => {
  return DIFFICULTY_REWARDS[difficulty] || DIFFICULTY_REWARDS.medium;
};

/**
 * Character Titles mapped to level milestones.
 */
export const LEVEL_TITLES: { minLevel: number; title: string }[] = [
  { minLevel: 25, title: 'Mythic Sovereign' },
  { minLevel: 20, title: 'Ascended Archon' },
  { minLevel: 15, title: 'Grandmaster Architect' },
  { minLevel: 12, title: 'Shadow Master' },
  { minLevel: 9, title: 'Cyber Samurai' },
  { minLevel: 6, title: 'Tactical Vanguard' },
  { minLevel: 4, title: 'Pixel Knight' },
  { minLevel: 2, title: 'Apprentice Tactician' },
  { minLevel: 1, title: 'Novice Adventurer' },
];

/**
 * Get title corresponding to player level.
 */
export const getCharacterTitle = (level: number): string => {
  const match = LEVEL_TITLES.find(t => level >= t.minLevel);
  return match ? match.title : 'Novice Adventurer';
};

/**
 * Formula for character XP required for next level.
 * Level 1 -> 150 XP
 * Level 2 -> 220 XP
 * Level 3 -> 310 XP
 * Scales smoothly with level.
 */
export const calculateCharacterXpThreshold = (level: number): number => {
  if (level <= 1) return 150;
  return Math.round(150 * Math.pow(1.32, level - 1));
};

/**
 * Formula for individual Attribute XP required for next level.
 * Level 1 -> 80 XP
 * Level 2 -> 115 XP
 * Level 3 -> 160 XP
 */
export const calculateAttributeXpThreshold = (level: number): number => {
  if (level <= 1) return 80;
  return Math.round(80 * Math.pow(1.28, level - 1));
};

/**
 * Calculates active streak multiplier.
 * 1 day: 1.0x
 * 2 days: 1.15x
 * 3 days: 1.30x
 * 5 days: 1.60x
 * 7 days: 1.90x
 * 10+ days: up to 3.0x Max
 */
export const calculateStreakMultiplier = (streakDays: number): number => {
  if (streakDays <= 1) return 1.0;
  const multiplier = 1.0 + (streakDays - 1) * 0.15;
  return Number(Math.min(3.0, multiplier).toFixed(2));
};

/**
 * Calculates today's date string (YYYY-MM-DD) in local client time zone.
 */
export const getLocalTodayStr = (d = new Date()): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

/**
 * Check if an existing streak was broken by missing days.
 * Safe for mount checks without artificially creating streaks.
 */
export const checkStreakBreak = (
  lastActiveDate: string | undefined,
  currentStreak: number
): { streakDays: number; activeMultiplier: number } => {
  if (!lastActiveDate || currentStreak <= 0) {
    return { streakDays: 0, activeMultiplier: 1.0 };
  }
  const today = getLocalTodayStr();
  if (lastActiveDate === today) {
    return { streakDays: currentStreak, activeMultiplier: calculateStreakMultiplier(currentStreak) };
  }
  const last = new Date(lastActiveDate);
  const now = new Date(today);
  const diffDays = Math.round((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 1) {
    // Yesterday was active, streak is still alive waiting for today's activity
    return { streakDays: currentStreak, activeMultiplier: calculateStreakMultiplier(currentStreak) };
  }
  // Missed yesterday or older -> streak broken
  return { streakDays: 0, activeMultiplier: 1.0 };
};

/**
 * Check and process daily streak upon quest completion.
 */
export const processDailyStreak = (
  lastActiveDate: string | undefined,
  currentStreak: number,
  history: string[] = []
): {
  newStreak: number;
  newMultiplier: number;
  newLastActiveDate: string;
  updatedHistory: string[];
  isNewDay: boolean;
} => {
  const today = getLocalTodayStr();
  const updatedHistory = Array.from(new Set([...history, today]));

  if (!lastActiveDate) {
    return {
      newStreak: 1,
      newMultiplier: 1.0,
      newLastActiveDate: today,
      updatedHistory,
      isNewDay: true,
    };
  }

  if (lastActiveDate === today) {
    // Already active today
    const safeStreak = Math.max(1, currentStreak);
    return {
      newStreak: safeStreak,
      newMultiplier: calculateStreakMultiplier(safeStreak),
      newLastActiveDate: today,
      updatedHistory,
      isNewDay: false,
    };
  }

  const last = new Date(lastActiveDate);
  const now = new Date(today);
  const diffTime = now.getTime() - last.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  let newStreak = currentStreak > 0 ? currentStreak : 0;
  if (diffDays === 1) {
    // Consecutive day!
    newStreak += 1;
  } else {
    // Streak broken or brand new
    newStreak = 1;
  }

  return {
    newStreak,
    newMultiplier: calculateStreakMultiplier(newStreak),
    newLastActiveDate: today,
    updatedHistory,
    isNewDay: true,
  };
};

/**
 * Calculates equipment / item buff modifiers.
 */
export const calculateEquipmentBonus = (
  equippedItems: ShopItem[],
  attribute: AttributeType
): { xpMultiplier: number; flatXpBonus: number; goldMultiplier: number; flatGoldBonus: number } => {
  let xpMultiplier = 1.0;
  let flatXpBonus = 0;
  let goldMultiplier = 1.0;
  let flatGoldBonus = 0;

  for (const item of equippedItems) {
    if (!item.statBonus) continue;
    const { attribute: targetAttr, boost, type = 'percent' } = item.statBonus;

    if (targetAttr === 'gold') {
      if (type === 'percent') {
        goldMultiplier += boost / 100;
      } else {
        flatGoldBonus += boost;
      }
    } else if (targetAttr === 'all' || targetAttr === attribute) {
      if (type === 'percent') {
        xpMultiplier += boost / 100;
      } else {
        flatXpBonus += boost;
      }
    }
  }

  return {
    xpMultiplier: Number(xpMultiplier.toFixed(2)),
    flatXpBonus,
    goldMultiplier: Number(goldMultiplier.toFixed(2)),
    flatGoldBonus,
  };
};

export interface QuestCompletionResult {
  updatedPlayerStats: PlayerStats;
  updatedAttributes: AttributeMap;
  leveledUpPlayer: boolean;
  attributeLevelUps: { attribute: AttributeType; newLevel: number }[];
  earnedXp: number;
  earnedGold: number;
  newTitle?: string;
}

/**
 * Core RPG calculation engine for completing a quest.
 */
export const applyQuestCompletion = (
  quest: Quest,
  playerStats: PlayerStats,
  attributes: AttributeMap,
  shopItems: ShopItem[]
): QuestCompletionResult => {
  const equipped = shopItems.filter(i => i.purchased && i.equipped);
  const gearBonus = calculateEquipmentBonus(equipped, quest.attribute);

  // 1. Daily Streak update
  const streakResult = processDailyStreak(
    playerStats.lastActiveDate,
    playerStats.streakDays,
    playerStats.activityHistory || []
  );

  // 2. Rewards calculation with Streak Multiplier and Gear Bonuses
  const streakMult = streakResult.newMultiplier;
  const baseReward = calculateBaseRewards(quest.difficulty);
  const rawXp = quest.xpReward || baseReward.xp;
  const rawGold = quest.goldReward || baseReward.gold;

  const earnedXp = Math.round((rawXp * streakMult * gearBonus.xpMultiplier) + gearBonus.flatXpBonus);
  const earnedGold = Math.round((rawGold * gearBonus.goldMultiplier) + gearBonus.flatGoldBonus);

  // 3. Character Level & XP Progression
  let currentXp = playerStats.xp + earnedXp;
  let currentLevel = playerStats.level;
  let xpThreshold = playerStats.xpToNextLevel || calculateCharacterXpThreshold(currentLevel);
  let leveledUpPlayer = false;

  while (currentXp >= xpThreshold) {
    currentXp -= xpThreshold;
    currentLevel += 1;
    xpThreshold = calculateCharacterXpThreshold(currentLevel);
    leveledUpPlayer = true;
  }

  const newTitle = getCharacterTitle(currentLevel);
  const levelUpBonusGold = leveledUpPlayer ? (currentLevel * 50) : 0;

  const updatedPlayerStats: PlayerStats = {
    ...playerStats,
    level: currentLevel,
    title: newTitle,
    xp: currentXp,
    xpToNextLevel: xpThreshold,
    totalXpEarned: (playerStats.totalXpEarned || 0) + earnedXp,
    gold: playerStats.gold + earnedGold + levelUpBonusGold,
    totalCompletedQuests: playerStats.totalCompletedQuests + 1,
    streakDays: streakResult.newStreak,
    lastActiveDate: streakResult.newLastActiveDate,
    activeMultiplier: streakResult.newMultiplier,
    activityHistory: streakResult.updatedHistory,
  };

  // 4. Attribute Level & XP Progression
  const attrKey = quest.attribute;
  const currentAttr = attributes[attrKey] || { level: 1, xp: 0, xpToNextLevel: calculateAttributeXpThreshold(1) };
  let attrXp = currentAttr.xp + earnedXp;
  let attrLevel = currentAttr.level;
  let attrThreshold = currentAttr.xpToNextLevel || calculateAttributeXpThreshold(attrLevel);
  const attributeLevelUps: { attribute: AttributeType; newLevel: number }[] = [];

  while (attrXp >= attrThreshold) {
    attrXp -= attrThreshold;
    attrLevel += 1;
    attrThreshold = calculateAttributeXpThreshold(attrLevel);
    attributeLevelUps.push({ attribute: attrKey, newLevel: attrLevel });
  }

  const updatedAttributes: AttributeMap = {
    ...attributes,
    [attrKey]: {
      level: attrLevel,
      xp: attrXp,
      xpToNextLevel: attrThreshold,
    },
  };

  return {
    updatedPlayerStats,
    updatedAttributes,
    leveledUpPlayer,
    attributeLevelUps,
    earnedXp,
    earnedGold,
    newTitle: leveledUpPlayer ? newTitle : undefined,
  };
};

/**
 * Reverts quest completion if unmarked.
 */
export const revertQuestCompletion = (
  quest: Quest,
  playerStats: PlayerStats,
  attributes: AttributeMap
): { updatedPlayerStats: PlayerStats; updatedAttributes: AttributeMap } => {
  const baseReward = calculateBaseRewards(quest.difficulty);
  const xpToDeduct = quest.xpReward || baseReward.xp;
  const goldToDeduct = quest.goldReward || baseReward.gold;

  // Reduce player XP safely without dropping below 0
  let newXp = Math.max(0, playerStats.xp - xpToDeduct);
  let newGold = Math.max(0, playerStats.gold - goldToDeduct);
  let newCompletedCount = Math.max(0, playerStats.totalCompletedQuests - 1);

  const updatedPlayerStats: PlayerStats = {
    ...playerStats,
    xp: newXp,
    gold: newGold,
    totalCompletedQuests: newCompletedCount,
  };

  const attrKey = quest.attribute;
  const currentAttr = attributes[attrKey];
  const newAttrXp = Math.max(0, currentAttr.xp - xpToDeduct);

  const updatedAttributes: AttributeMap = {
    ...attributes,
    [attrKey]: {
      ...currentAttr,
      xp: newAttrXp,
    },
  };

  return {
    updatedPlayerStats,
    updatedAttributes,
  };
};

/**
 * Returns formatted 7 days of the current week (Mon - Sun) with active status.
 */
export const getWeeklyActivityStatus = (activityHistory: string[] = []): { dayLabel: string; dateStr: string; isActive: boolean; isToday: boolean }[] => {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday...
  const distanceToMonday = (dayOfWeek + 6) % 7;
  
  const monday = new Date(now);
  monday.setDate(now.getDate() - distanceToMonday);

  const todayStr = getLocalTodayStr(now);
  const historySet = new Set(activityHistory);
  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return dayLabels.map((dayLabel, idx) => {
    const currentDay = new Date(monday);
    currentDay.setDate(monday.getDate() + idx);
    const dateStr = getLocalTodayStr(currentDay);
    const isActive = historySet.has(dateStr);
    const isToday = dateStr === todayStr;

    return {
      dayLabel,
      dateStr,
      isActive,
      isToday,
    };
  });
};

export interface MonthCalendarDay {
  dayNum: number | null;
  dateStr: string;
  isActive: boolean;
  isToday: boolean;
  isCurrentMonth: boolean;
}

/**
 * Returns month grid days (Sun - Sat) with active status & today marker.
 */
export const getMonthCalendarGrid = (
  year: number,
  month: number,
  activityHistory: string[] = []
): {
  days: MonthCalendarDay[];
  monthLabel: string;
  activeCount: number;
} => {
  const historySet = new Set(activityHistory);
  const todayStr = getLocalTodayStr();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  const startDayOfWeek = firstDayOfMonth.getDay(); // 0 is Sunday
  const totalDays = lastDayOfMonth.getDate();

  const monthLabel = firstDayOfMonth.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();

  const days: MonthCalendarDay[] = [];

  // Leading empty padding cells
  for (let i = 0; i < startDayOfWeek; i++) {
    days.push({
      dayNum: null,
      dateStr: '',
      isActive: false,
      isToday: false,
      isCurrentMonth: false,
    });
  }

  let activeCount = 0;
  for (let day = 1; day <= totalDays; day++) {
    const d = new Date(year, month, day);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dayFormatted = String(day).padStart(2, '0');
    const dateStr = `${y}-${m}-${dayFormatted}`;

    const isActive = historySet.has(dateStr);
    if (isActive) activeCount++;

    const isToday = dateStr === todayStr;

    days.push({
      dayNum: day,
      dateStr,
      isActive,
      isToday,
      isCurrentMonth: true,
    });
  }

  return { days, monthLabel, activeCount };
};
