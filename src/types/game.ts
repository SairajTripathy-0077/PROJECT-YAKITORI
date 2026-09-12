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
  attribute: AttributeType;
  difficulty: QuestDifficulty;
  questType: QuestType;
  completed: boolean;
  createdAt: number;
  completedAt?: number;
  dueDate?: string;
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
  gold: number;
  totalCompletedQuests: number;
  streakDays: number;
  lastActiveDate: string; // YYYY-MM-DD
  activeMultiplier: number;
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
  statBonus?: { attribute: AttributeType; boost: number };
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
