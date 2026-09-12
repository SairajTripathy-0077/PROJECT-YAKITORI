import React, { createContext, useContext, useState, useEffect } from 'react';
import type { 
  Quest, 
  PlayerStats, 
  AttributeMap, 
  ShopItem, 
  DroneState, 
  AttributeType,
  QuestDifficulty,
  QuestType,
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
  playQuestComplete, 
  playLevelUp, 
  playShopBuy, 
  playDroneBeep, 
  playClick,
  playDeleteSound,
  setSoundEnabled as setAudioEnabled
} from '../utils/sound';

interface GameContextType {
  quests: Quest[];
  playerStats: PlayerStats;
  attributes: AttributeMap;
  shopItems: ShopItem[];
  droneState: DroneState;
  soundEnabled: boolean;
  scanlineEnabled: boolean;
  theme: 'noir' | 'eink';
  levelUpModalData: { show: boolean; newLevel: number; rewardGold: number } | null;
  closeLevelUpModal: () => void;
  addQuest: (questData: Omit<Quest, 'id' | 'createdAt' | 'completed' | 'xpReward' | 'goldReward'>) => void;
  toggleQuest: (id: string) => void;
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
}

const STORAGE_KEY = 'yakitori_rpg_game_state_v2';

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [quests, setQuests] = useState<Quest[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.quests || DEFAULT_QUESTS;
      } catch (e) {
        console.error('Failed to parse saved quests', e);
      }
    }
    return DEFAULT_QUESTS;
  });

  const [playerStats, setPlayerStats] = useState<PlayerStats>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_PLAYER_STATS, ...(parsed.playerStats || {}) };
      } catch (e) {
        console.error('Failed to parse player stats', e);
      }
    }
    return DEFAULT_PLAYER_STATS;
  });

  const [attributes, setAttributes] = useState<AttributeMap>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_ATTRIBUTES, ...(parsed.attributes || {}) };
      } catch (e) {
        console.error('Failed to parse attributes', e);
      }
    }
    return DEFAULT_ATTRIBUTES;
  });

  const [shopItems, setShopItems] = useState<ShopItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.shopItems || INITIAL_SHOP_ITEMS;
      } catch (e) {
        console.error('Failed to parse shop items', e);
      }
    }
    return INITIAL_SHOP_ITEMS;
  });

  const [droneState, setDroneState] = useState<DroneState>(INITIAL_DRONE_STATE);
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(true);
  const [scanlineEnabled, setScanlineEnabled] = useState<boolean>(false);
  const [theme, setTheme] = useState<'noir' | 'eink'>('noir');
  const [levelUpModalData, setLevelUpModalData] = useState<{ show: boolean; newLevel: number; rewardGold: number } | null>(null);

  // Sync state to LocalStorage
  useEffect(() => {
    const stateToSave = {
      quests,
      playerStats,
      attributes,
      shopItems,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
  }, [quests, playerStats, attributes, shopItems]);

  // Check Daily Streak on mount
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const lastActive = playerStats.lastActiveDate;
    
    if (lastActive !== today) {
      const lastDate = new Date(lastActive);
      const currentDate = new Date(today);
      const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      let newStreak = playerStats.streakDays;
      if (diffDays === 1) {
        newStreak += 1;
      } else if (diffDays > 1) {
        newStreak = 1; // Streak reset
      }

      const multiplier = Math.min(2.5, 1.0 + (newStreak * 0.1));

      setPlayerStats(prev => ({
        ...prev,
        lastActiveDate: today,
        streakDays: newStreak,
        activeMultiplier: parseFloat(multiplier.toFixed(1)),
      }));
    }
  }, []);

  // Calculate XP & Gold rewards by difficulty
  const calculateRewards = (difficulty: QuestDifficulty) => {
    switch (difficulty) {
      case 'easy': return { xp: 20, gold: 15 };
      case 'medium': return { xp: 45, gold: 30 };
      case 'hard': return { xp: 90, gold: 65 };
      case 'boss': return { xp: 180, gold: 120 };
    }
  };

  const setDroneMessage = (msg: string, expression: DroneExpression = 'HAPPY') => {
    setDroneState({
      name: 'Byte',
      expression,
      currentMessage: msg,
      isSpeaking: true,
    });
    playDroneBeep();
  };

  const addQuest = (questData: Omit<Quest, 'id' | 'createdAt' | 'completed' | 'xpReward' | 'goldReward'>) => {
    const rewards = calculateRewards(questData.difficulty);
    const newQuest: Quest = {
      ...questData,
      id: `quest-${Date.now()}`,
      createdAt: Date.now(),
      completed: false,
      xpReward: rewards.xp,
      goldReward: rewards.gold,
      subtasks: questData.subtasks || [],
    };

    setQuests(prev => [newQuest, ...prev]);
    playClick();
    setDroneMessage(`New Quest added: "${newQuest.title}"! Finish it to gain +${newQuest.xpReward} XP!`, 'MOTIVATED');
  };

  const toggleQuest = (id: string) => {
    const targetQuest = quests.find(q => q.id === id);
    if (!targetQuest) return;

    const willBeCompleted = !targetQuest.completed;

    setQuests(prev => prev.map(q => {
      if (q.id === id) {
        return {
          ...q,
          completed: willBeCompleted,
          completedAt: willBeCompleted ? Date.now() : undefined,
          subtasks: q.subtasks.map(s => ({ ...s, completed: willBeCompleted }))
        };
      }
      return q;
    }));

    if (willBeCompleted) {
      playQuestComplete();
      
      // Calculate XP with active streak multiplier
      const finalXp = Math.round(targetQuest.xpReward * playerStats.activeMultiplier);
      const finalGold = targetQuest.goldReward;

      // Update Player Level & XP
      let newPlayerXp = playerStats.xp + finalXp;
      let newPlayerLevel = playerStats.level;
      let xpToNext = playerStats.xpToNextLevel;
      let leveledUp = false;

      while (newPlayerXp >= xpToNext) {
        newPlayerXp -= xpToNext;
        newPlayerLevel += 1;
        xpToNext = Math.round(xpToNext * 1.5);
        leveledUp = true;
      }

      setPlayerStats(prev => ({
        ...prev,
        level: newPlayerLevel,
        xp: newPlayerXp,
        xpToNextLevel: xpToNext,
        gold: prev.gold + finalGold,
        totalCompletedQuests: prev.totalCompletedQuests + 1,
      }));

      // Update Attribute Level & XP
      const attrKey = targetQuest.attribute;
      setAttributes(prev => {
        const currentAttr = prev[attrKey];
        let newAttrXp = currentAttr.xp + finalXp;
        let newAttrLevel = currentAttr.level;
        let attrXpNext = currentAttr.xpToNextLevel;

        while (newAttrXp >= attrXpNext) {
          newAttrXp -= attrXpNext;
          newAttrLevel += 1;
          attrXpNext = Math.round(attrXpNext * 1.4);
        }

        return {
          ...prev,
          [attrKey]: {
            level: newAttrLevel,
            xp: newAttrXp,
            xpToNextLevel: attrXpNext,
          }
        };
      });

      if (leveledUp) {
        playLevelUp();
        setLevelUpModalData({
          show: true,
          newLevel: newPlayerLevel,
          rewardGold: 100,
        });
        setDroneMessage(`VICTORY! You leveled up to Level ${newPlayerLevel}! Phenomenal work, Adventurer!`, 'VICTORY');
      } else {
        const quotes = DRONE_QUOTES.QUEST_COMPLETED;
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        setDroneMessage(`${randomQuote} (+${finalXp} XP, +${finalGold} Gold)`, 'HAPPY');
      }
    } else {
      playClick();
    }
  };

  const deleteQuest = (id: string) => {
    setQuests(prev => prev.filter(q => q.id !== id));
    playDeleteSound();
  };

  const toggleSubtask = (questId: string, subtaskId: string) => {
    setQuests(prev => prev.map(q => {
      if (q.id === questId) {
        const updatedSubtasks = q.subtasks.map(s => 
          s.id === subtaskId ? { ...s, completed: !s.completed } : s
        );
        const allDone = updatedSubtasks.length > 0 && updatedSubtasks.every(s => s.completed);
        return {
          ...q,
          subtasks: updatedSubtasks,
          completed: allDone ? true : q.completed,
        };
      }
      return q;
    }));
    playClick();
  };

  const addSubtask = (questId: string, title: string) => {
    if (!title.trim()) return;
    setQuests(prev => prev.map(q => {
      if (q.id === questId) {
        return {
          ...q,
          subtasks: [
            ...q.subtasks,
            { id: `sub-${Date.now()}`, title: title.trim(), completed: false }
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

    setPlayerStats(prev => ({
      ...prev,
      gold: prev.gold - item.price,
      inventory: [...prev.inventory, item.id],
    }));

    setShopItems(prev => prev.map(i => i.id === itemId ? { ...i, purchased: true } : i));
    playShopBuy();
    setDroneMessage(`Purchased "${item.name}"! Added to your inventory.`, 'HAPPY');
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
    }

    playClick();
    setDroneMessage(`Equipped ${item.name}!`, 'CHILL');
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

  const closeLevelUpModal = () => {
    setLevelUpModalData(null);
  };

  const resetAllProgress = () => {
    localStorage.removeItem(STORAGE_KEY);
    setQuests(DEFAULT_QUESTS);
    setPlayerStats(DEFAULT_PLAYER_STATS);
    setAttributes(DEFAULT_ATTRIBUTES);
    setShopItems(INITIAL_SHOP_ITEMS);
    setDroneMessage('Progress reset to default state!', 'CHILL');
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
      addQuest,
      toggleQuest,
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
