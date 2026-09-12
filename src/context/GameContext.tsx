import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { 
  Quest, 
  PlayerStats, 
  AttributeMap, 
  ShopItem, 
  DroneState, 
  AttributeType,
  QuestDifficulty,
  LevelUpModalData,
  DroneExpression
} from '../types/game';
import { 
  DEFAULT_ATTRIBUTES, 
  DEFAULT_PLAYER_STATS, 
  DEFAULT_QUESTS, 
  INITIAL_SHOP_ITEMS, 
  INITIAL_DRONE_STATE,
  DRONE_QUOTES
} from '../utils/defaults';
import { 
  applyQuestCompletion, 
  revertQuestCompletion, 
  calculateBaseRewards,
  processDailyStreak,
  checkStreakBreak,
  calculateCharacterXpThreshold,
  calculateAttributeXpThreshold,
  getCharacterTitle
} from '../utils/rpgEngine';
import { 
  playQuestComplete, 
  playLevelUp, 
  playShopBuy, 
  playDroneBeep, 
  playClick,
  playSubtask,
  playDeleteSound,
  setSoundEnabled as setAudioEnabled
} from '../utils/sound';
import { useAuth } from './AuthContext';
import { api } from '../utils/api';

interface GameContextType {
  quests: Quest[];
  playerStats: PlayerStats;
  attributes: AttributeMap;
  shopItems: ShopItem[];
  droneState: DroneState;
  soundEnabled: boolean;
  scanlineEnabled: boolean;
  theme: 'noir' | 'eink';
  levelUpModalData: LevelUpModalData | null;
  closeLevelUpModal: () => void;
  updatePlayerCharacter: (data: { name?: string; characterClass?: string; equippedCharacter?: number; avatar?: string }) => void;
  updateAttributes: (newAttrs: AttributeMap) => void;
  addQuest: (questData: Omit<Quest, 'id' | 'createdAt' | 'completed' | 'xpReward' | 'goldReward'> & { xpReward?: number; goldReward?: number }) => void;
  toggleQuest: (id: string) => void;
  completeQuest: (id: string) => void;
  gainXP: (amount: number, attribute?: AttributeType) => void;
  deleteQuest: (id: string) => void;
  toggleSubtask: (questId: string, subtaskId: string) => void;
  addSubtask: (questId: string, title: string) => void;
  purchaseItem: (itemId: string) => void;
  equipItem: (itemId: string) => void;
  toggleSound: () => void;
  toggleScanlines: () => void;
  toggleTheme: () => void;
  interactWithDrone: () => void;
  resetAllProgress: () => void;
  setDroneMessage: (msg: string, expression?: DroneExpression) => void;
  selectedCalendarDate: string | null;
  setSelectedCalendarDate: (dateStr: string | null) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const storageKey = user ? `yakitori_rpg_state_${user.uid}` : 'yakitori_rpg_game_state_v3';

  const [quests, setQuests] = useState<Quest[]>(DEFAULT_QUESTS);
  const [playerStats, setPlayerStats] = useState<PlayerStats>(DEFAULT_PLAYER_STATS);
  const [attributes, setAttributes] = useState<AttributeMap>(DEFAULT_ATTRIBUTES);
  const [shopItems, setShopItems] = useState<ShopItem[]>(INITIAL_SHOP_ITEMS);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(() => new Date().toISOString().split('T')[0]);

  const [droneState, setDroneState] = useState<DroneState>(INITIAL_DRONE_STATE);
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(true);
  const [scanlineEnabled, setScanlineEnabled] = useState<boolean>(false);
  const [theme, setTheme] = useState<'noir' | 'eink'>('noir');
  const [levelUpModalData, setLevelUpModalData] = useState<LevelUpModalData | null>(null);

  // Load user data whenever storageKey changes
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.quests)) {
          const legacyDummyIds = new Set(['quest-1', 'quest-2', 'quest-3', 'quest-4', 'quest-5']);
          const cleanQuests = parsed.quests.filter(
            (q: Quest) => !legacyDummyIds.has(q.id) && !q.title.toLowerCase().includes('gsap')
          );
          setQuests(cleanQuests);
        } else {
          setQuests(DEFAULT_QUESTS);
        }
        const loadedStats: PlayerStats = { ...DEFAULT_PLAYER_STATS, ...(parsed.playerStats || {}) };
        // Purge dummy streak / mock stats: if total completed quests is 0 or legacy 3-day dummy streak
        if (!loadedStats.totalCompletedQuests || loadedStats.totalCompletedQuests <= 0) {
          loadedStats.streakDays = 0;
          loadedStats.activeMultiplier = 1.0;
          loadedStats.activityHistory = [];
        } else if (
          loadedStats.streakDays === 3 &&
          loadedStats.activeMultiplier === 1.3 &&
          (loadedStats.name === 'Pixel Questmaster' || loadedStats.totalCompletedQuests <= 2)
        ) {
          loadedStats.streakDays = 0;
          loadedStats.activeMultiplier = 1.0;
          loadedStats.activityHistory = [];
        }
        setPlayerStats(loadedStats);
        setAttributes({ ...DEFAULT_ATTRIBUTES, ...(parsed.attributes || {}) });
        if (Array.isArray(parsed.shopItems) && parsed.shopItems.length > 0) {
          const existingIds = new Set(parsed.shopItems.map((item: ShopItem) => item.id));
          const newItems = INITIAL_SHOP_ITEMS.filter(item => !existingIds.has(item.id));
          setShopItems([...parsed.shopItems, ...newItems]);
        } else {
          setShopItems(INITIAL_SHOP_ITEMS);
        }
      } catch (e) {
        console.error('Failed to load user progress', e);
      }
    } else {
      setQuests(DEFAULT_QUESTS);
      setPlayerStats(DEFAULT_PLAYER_STATS);
      setAttributes(DEFAULT_ATTRIBUTES);
      setShopItems(INITIAL_SHOP_ITEMS);
    }
  }, [storageKey]);

  // Ensure all newly added initial shop items (like the 192 characters) are guaranteed to be present in state
  useEffect(() => {
    setShopItems(prev => {
      const existingIds = new Set(prev.map(i => i.id));
      const missing = INITIAL_SHOP_ITEMS.filter(i => !existingIds.has(i.id));
      if (missing.length > 0) {
        return [...prev, ...missing];
      }
      return prev;
    });
  }, []);

  // Sync state to LocalStorage for active user
  useEffect(() => {
    try {
      const stateToSave = {
        quests,
        playerStats,
        attributes,
        shopItems,
        timestamp: Date.now(),
      };
      localStorage.setItem(storageKey, JSON.stringify(stateToSave));
    } catch (e) {
      console.error('Failed to persist RPG game state', e);
    }
  }, [quests, playerStats, attributes, shopItems, storageKey]);

  // Auto-sync level, XP, and streak to MongoDB backend whenever stats update
  useEffect(() => {
    if (user) {
      const avatarIcon = playerStats.characterClass === 'Mage' ? '🧙‍♂️' : playerStats.characterClass === 'Rogue' ? '🥷' : playerStats.characterClass === 'Paladin' ? '🛡️' : '⚔️';
      api.post('/api/auth/sync', {
        level: playerStats.level,
        xp: playerStats.xp,
        streakDays: playerStats.streakDays,
        characterClass: playerStats.characterClass,
        avatarIcon,
      }).catch(() => {});
    }
  }, [user, playerStats.level, playerStats.xp, playerStats.streakDays, playerStats.characterClass]);

  // Check Daily Streak break & Auto-refresh Daily Habits on session mount
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const { streakDays, activeMultiplier } = checkStreakBreak(
      playerStats.lastActiveDate,
      playerStats.streakDays
    );

    if (streakDays !== playerStats.streakDays || activeMultiplier !== playerStats.activeMultiplier) {
      setPlayerStats(prev => ({
        ...prev,
        streakDays,
        activeMultiplier,
      }));
    }

    // Auto-refresh daily habits completed on past days to new active state
    setQuests(prev => prev.map(q => {
      if (q.questType === 'daily' && q.completed) {
        const completedOnPastDay = q.lastCompletedDate && q.lastCompletedDate !== today;
        const fallbackPastDay = !q.lastCompletedDate && q.completedAt && (new Date(q.completedAt).toISOString().split('T')[0] !== today);
        if (completedOnPastDay || fallbackPastDay) {
          return {
            ...q,
            completed: false,
            completedAt: undefined,
            subtasks: q.subtasks.map(s => ({ ...s, completed: false }))
          };
        }
      }
      return q;
    }));
  }, []);

  const setDroneMessage = useCallback((msg: string, expression: DroneExpression = 'HAPPY') => {
    setDroneState({
      name: 'Byte',
      expression,
      currentMessage: msg,
      isSpeaking: true,
    });
    playDroneBeep();
  }, []);

  const addQuest = (questData: Omit<Quest, 'id' | 'createdAt' | 'completed' | 'xpReward' | 'goldReward'> & { xpReward?: number; goldReward?: number }) => {
    const baseReward = calculateBaseRewards(questData.difficulty);
    const newQuest: Quest = {
      ...questData,
      id: `quest-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: Date.now(),
      completed: false,
      xpReward: questData.xpReward || baseReward.xp,
      goldReward: questData.goldReward || baseReward.gold,
      subtasks: questData.subtasks || [],
    };

    setQuests(prev => [newQuest, ...prev]);
    playClick();
    const habitNote = newQuest.questType === 'daily' ? ' (Repeats daily automatically)' : '';
    setDroneMessage(`Quest logged: "${newQuest.title}"${habitNote}! Complete it to gain +${newQuest.xpReward} XP for your ${newQuest.attribute.toUpperCase()} stat!`, 'MOTIVATED');
  };

  const toggleQuest = (id: string) => {
    const targetQuest = quests.find(q => q.id === id);
    if (!targetQuest) return;

    const willBeCompleted = !targetQuest.completed;
    const today = new Date().toISOString().split('T')[0];

    // Update quest list state
    setQuests(prev => prev.map(q => {
      if (q.id === id) {
        const existingDates = q.completionDates || (q.lastCompletedDate ? [q.lastCompletedDate] : []);
        const updatedDates = willBeCompleted
          ? Array.from(new Set([...existingDates, today]))
          : existingDates.filter(d => d !== today);

        return {
          ...q,
          completed: willBeCompleted,
          completedAt: willBeCompleted ? Date.now() : undefined,
          lastCompletedDate: willBeCompleted ? today : undefined,
          completionDates: updatedDates,
          subtasks: q.subtasks.map(s => ({ ...s, completed: willBeCompleted }))
        };
      }
      return q;
    }));

    if (willBeCompleted) {
      // Execute RPG Progression Engine
      const result = applyQuestCompletion(targetQuest, playerStats, attributes, shopItems);

      setPlayerStats(result.updatedPlayerStats);
      setAttributes(result.updatedAttributes);

      playQuestComplete();

      if (result.leveledUpPlayer) {
        playLevelUp();
        setLevelUpModalData({
          show: true,
          newLevel: result.updatedPlayerStats.level,
          rewardGold: result.updatedPlayerStats.level * 50,
          unlockedTitle: result.newTitle,
          attributeLevelUps: result.attributeLevelUps,
        });
        setDroneMessage(`VICTORY! You ascended to Level ${result.updatedPlayerStats.level} (${result.newTitle})! Phenomenal performance!`, 'VICTORY');
      } else if (result.attributeLevelUps.length > 0) {
        const topAttr = result.attributeLevelUps[0];
        setDroneMessage(`STAT BOOST! Your ${topAttr.attribute.toUpperCase()} reached Level ${topAttr.newLevel}! (+${result.earnedXp} XP, +${result.earnedGold}g)`, 'MOTIVATED');
      } else {
        const quotes = DRONE_QUOTES.QUEST_COMPLETED;
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        setDroneMessage(`${randomQuote} (+${result.earnedXp} XP, +${result.earnedGold}g)`, 'HAPPY');
      }
    } else {
      // Revert completion
      const reverted = revertQuestCompletion(targetQuest, playerStats, attributes);
      setPlayerStats(reverted.updatedPlayerStats);
      setAttributes(reverted.updatedAttributes);
      playClick();
      setDroneMessage(`Quest "${targetQuest.title}" marked active.`, 'CHILL');
    }
  };

  const completeQuest = (id: string) => {
    const targetQuest = quests.find(q => q.id === id);
    if (targetQuest && !targetQuest.completed) {
      toggleQuest(id);
    }
  };

  const gainXP = (amount: number, attribute: AttributeType = 'intellect') => {
    if (amount <= 0) return;

    let currentXp = playerStats.xp + amount;
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

    setPlayerStats(prev => ({
      ...prev,
      level: currentLevel,
      title: newTitle,
      xp: currentXp,
      xpToNextLevel: xpThreshold,
      nextLevelXp: xpThreshold,
      totalXpEarned: (prev.totalXpEarned || 0) + amount,
      gold: prev.gold + levelUpBonusGold,
    }));

    setAttributes(prev => {
      const currentAttr = prev[attribute] || { level: 1, xp: 0, xpToNextLevel: calculateAttributeXpThreshold(1) };
      let attrXp = currentAttr.xp + amount;
      let attrLevel = currentAttr.level;
      let attrThreshold = currentAttr.xpToNextLevel || calculateAttributeXpThreshold(attrLevel);

      while (attrXp >= attrThreshold) {
        attrXp -= attrThreshold;
        attrLevel += 1;
        attrThreshold = calculateAttributeXpThreshold(attrLevel);
      }

      return {
        ...prev,
        [attribute]: {
          level: attrLevel,
          xp: attrXp,
          xpToNextLevel: attrThreshold,
        },
      };
    });

    if (leveledUpPlayer) {
      playLevelUp();
      setLevelUpModalData({
        show: true,
        newLevel: currentLevel,
        rewardGold: currentLevel * 50,
        unlockedTitle: newTitle,
      });
      setDroneMessage(`VICTORY! You reached Level ${currentLevel} (${newTitle})!`, 'VICTORY');
    }
  };

  const deleteQuest = (id: string) => {
    setQuests(prev => prev.filter(q => q.id !== id));
    playDeleteSound();
  };

  const toggleSubtask = (questId: string, subtaskId: string) => {
    let completedQuest = false;

    setQuests(prev => prev.map(q => {
      if (q.id === questId) {
        const updatedSubtasks = q.subtasks.map(s => 
          s.id === subtaskId ? { ...s, completed: !s.completed } : s
        );
        const allDone = updatedSubtasks.length > 0 && updatedSubtasks.every(s => s.completed);
        
        if (allDone && !q.completed) {
          completedQuest = true;
        }

        return {
          ...q,
          subtasks: updatedSubtasks,
        };
      }
      return q;
    }));

    if (completedQuest) {
      // Auto complete the whole quest if all subtasks are finished!
      toggleQuest(questId);
    } else {
      playSubtask();
    }
  };

  const addSubtask = (questId: string, title: string) => {
    if (!title.trim()) return;
    setQuests(prev => prev.map(q => {
      if (q.id === questId) {
        return {
          ...q,
          subtasks: [
            ...q.subtasks,
            { id: `sub-${Date.now()}-${Math.floor(Math.random() * 1000)}`, title: title.trim(), completed: false }
          ]
        };
      }
      return q;
    }));
    playClick();
  };

  const purchaseItem = (itemId: string) => {
    const item = shopItems.find(i => i.id === itemId);
    if (!item || item.purchased || playerStats.gold < item.price) return;

    const newGold = playerStats.gold - item.price;
    const newInventory = [...playerStats.inventory, item.id];

    setPlayerStats(prev => ({
      ...prev,
      gold: newGold,
      inventory: newInventory,
    }));

    setShopItems(prev => prev.map(i => i.id === itemId ? { ...i, purchased: true } : i));
    playShopBuy();
    setDroneMessage(`Purchased "${item.name}"! Effect active: ${item.effect}`, 'HAPPY');
  };

  const equipItem = (itemId: string) => {
    const item = shopItems.find(i => i.id === itemId);
    if (!item || !item.purchased) return;

    setShopItems(prev => prev.map(i => {
      if (i.category === item.category) {
        return { ...i, equipped: i.id === itemId };
      }
      return i;
    }));

    if (item.category === 'theme') {
      const isEink = item.id.includes('eink');
      setTheme(isEink ? 'eink' : 'noir');
      document.documentElement.classList.toggle('dark', !isEink);
    } else if (item.category === 'character' && item.spriteIndex !== undefined) {
      setPlayerStats(prev => ({ ...prev, equippedCharacter: item.spriteIndex }));
    }

    playClick();
    setDroneMessage(`Equipped ${item.name}! [${item.effect}] is now boosting your stats.`, 'CHILL');
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabledState(next);
    setAudioEnabled(next);
    if (next) playClick();
  };

  const toggleScanlines = () => {
    setScanlineEnabled(prev => !prev);
    playClick();
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'noir' ? 'eink' : 'noir';
    setTheme(nextTheme);
    document.documentElement.classList.toggle('dark', nextTheme === 'noir');
    playClick();
  };

  const interactWithDrone = () => {
    const tips = DRONE_QUOTES.IDLE_TIPS;
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    setDroneMessage(randomTip, 'THINKING');
  };

  const updatePlayerCharacter = (data: { name?: string; characterClass?: string; equippedCharacter?: number; avatar?: string }) => {
    setPlayerStats(prev => ({
      ...prev,
      ...data,
    }));
  };

  const updateAttributes = (newAttrs: AttributeMap) => {
    setAttributes(newAttrs);
  };

  const closeLevelUpModal = () => {
    setLevelUpModalData(null);
  };

  const resetAllProgress = () => {
    localStorage.removeItem(storageKey);
    setQuests(DEFAULT_QUESTS);
    setPlayerStats(DEFAULT_PLAYER_STATS);
    setAttributes(DEFAULT_ATTRIBUTES);
    setShopItems(INITIAL_SHOP_ITEMS);
    setDroneMessage('RPG progress successfully reset to initial default state!', 'CHILL');
  };

  return (
    <GameContext.Provider value={{
      quests,
      playerStats,
      attributes,
      shopItems,
      droneState,
      soundEnabled,
      scanlineEnabled,
      theme,
      levelUpModalData,
      closeLevelUpModal,
      updatePlayerCharacter,
      updateAttributes,
      addQuest,
      toggleQuest,
      completeQuest,
      gainXP,
      deleteQuest,
      toggleSubtask,
      addSubtask,
      purchaseItem,
      equipItem,
      toggleSound,
      toggleScanlines,
      toggleTheme,
      interactWithDrone,
      resetAllProgress,
      setDroneMessage,
      selectedCalendarDate,
      setSelectedCalendarDate,
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
