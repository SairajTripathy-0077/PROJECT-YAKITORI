export type AttributeType = 'intellect' | 'strength' | 'creativity' | 'vitality' | 'discipline';

export type QuestDifficulty = 'easy' | 'medium' | 'hard' | 'boss';

export type QuestType = 'main' | 'side' | 'daily';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Quest {
  id: string;
  title: string;
  description?: string;
  category?: string;
  attribute: AttributeType;
  difficulty: QuestDifficulty;
  questType: QuestType;
  completed: boolean;
  createdAt: number;
  completedAt?: number;
  lastCompletedDate?: string; // YYYY-MM-DD date when quest was completed
  dueDate?: string; // YYYY-MM-DD or ISO date string
  subtasks: Subtask[];
  xpReward: number;
  goldReward: number;
}

export interface AttributeStat {
  level: number;
  xp: number;
  xpToNextLevel: number;
}

export interface AttributeMap {
  intellect: AttributeStat;
  strength: AttributeStat;
  creativity: AttributeStat;
  vitality: AttributeStat;
  discipline: AttributeStat;
}

export interface PlayerStats {
  name: string;
  title: string;
  avatar: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  nextLevelXp?: number;
  totalXpEarned?: number;
  gold: number;
  totalCompletedQuests: number;
  streakDays: number;
  characterClass?: string;
  lastActiveDate: string; // YYYY-MM-DD
  activeMultiplier: number;
  activityHistory?: string[]; // Array of YYYY-MM-DD completion dates
  equippedTheme: string;
  equippedBadge: string;
  equippedDroneSkin: string;
  inventory: string[]; // item IDs
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: string;
  category: 'equipment' | 'theme' | 'badge' | 'drone';
  effect: string;
  statBonus?: { attribute: AttributeType | 'all' | 'gold'; boost: number; type?: 'percent' | 'flat' };
  purchased: boolean;
  equipped?: boolean;
}

export type DroneExpression = 'HAPPY' | 'CHILL' | 'MOTIVATED' | 'VICTORY' | 'THINKING';

export interface DroneState {
  name: string;
  expression: DroneExpression;
  currentMessage: string;
  isSpeaking: boolean;
}

export interface LevelUpModalData {
  show: boolean;
  newLevel: number;
  rewardGold: number;
  unlockedTitle?: string;
  attributeLevelUps?: { attribute: AttributeType; newLevel: number }[];
}

