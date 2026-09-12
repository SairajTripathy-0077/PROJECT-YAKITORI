import type { FC } from 'react';
import { useGame } from '../context/GameContext';
import { Brain, Dumbbell, Palette, Zap, Shield, Sparkles, Award, Coins, User, ShoppingBag } from 'lucide-react';
import type { AttributeType } from '../types/game';
import { SpriteCharacter } from './SpriteCharacter';

const ATTRIBUTE_DESCRIPTIONS: Record<AttributeType, { name: string; desc: string; color: string; icon: any }> = {
  intellect: {
    name: 'Intellect',
    desc: 'Coding, Reading & Research',
    color: 'text-blue-700',
    icon: Brain,
  },
  strength: {
    name: 'Strength',
    desc: 'Gym, Workouts & Fitness',
    color: 'text-red-700',
    icon: Dumbbell,
  },
  creativity: {
    name: 'Creativity',
    desc: 'Design, Art & Brainstorming',
    color: 'text-purple-700',
    icon: Palette,
  },
  vitality: {
    name: 'Vitality',
    desc: 'Health, Sleep & Meditation',
    color: 'text-emerald-700',
    icon: Zap,
  },
  discipline: {
    name: 'Discipline',
    desc: 'Habits, Chores & Organization',
    color: 'text-amber-700',
    icon: Shield,
  },
};

interface PlayerCardProps {
  onOpenShop?: () => void;
}

export const PlayerCard: FC<PlayerCardProps> = ({ onOpenShop }) => {
  const { playerStats, attributes } = useGame();

  const xpPercent = Math.min(100, Math.round((playerStats.xp / playerStats.xpToNextLevel) * 100));


  return (
    <div className="double-bezel h-full">
      <div className="double-bezel-inner bg-[#ebeae4] text-[#111113] p-3.5 sm:p-5 border border-[#18181c] flex flex-col justify-between h-full space-y-4">
        
        <div>
          {/* Character Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-[#18181c]/20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#18181c] text-[#f5f4ef] border-2 border-black flex items-center justify-center shadow-pixel shrink-0 overflow-hidden relative">
                {playerStats.equippedCharacter !== undefined ? (
                  <SpriteCharacter index={playerStats.equippedCharacter} size={48} alt="Player Avatar" />
                ) : (
                  <User className="w-6 h-6 text-amber-400" />
                )}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-pixel text-lg font-bold tracking-wide text-[#111113]">
                    {playerStats.name}
                  </h2>
                </div>
                <p className="font-mono text-xs text-[#111113]">
                  Level {playerStats.level} Questmaster • {playerStats.totalCompletedQuests} Quests Completed
                </p>
              </div>
            </div>

            {/* Quick Currency Counter & Inventory Button */}
            <div className="flex items-center gap-2 self-start sm:self-auto font-mono text-xs">
              <span className="flex items-center gap-1 bg-[#f5f4ef] border border-[#18181c] px-2.5 py-1 text-[#111113] font-bold shadow-pixel-sm">
                <Coins className="w-3.5 h-3.5 text-[#111113]" />
                <span className="text-[#111113]">{playerStats.gold} Gold</span>
              </span>
              {onOpenShop && (
                <button
                  onClick={onOpenShop}
                  className="flex items-center gap-1.5 bg-[#18181c] text-[#f5f4ef] hover:bg-[#2c2c33] border-2 border-black px-3 py-1 font-pixel text-xs font-bold uppercase shadow-pixel-sm transition-all cursor-pointer"
                  title="Open Character Inventory & Marketplace"
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
                  <span>INVENTORY</span>
                </button>
              )}
            </div>
          </div>

          {/* Level XP Progress Bar */}
          <div className="mb-5">
            <div className="flex justify-between items-center text-xs font-mono mb-1">
              <span className="flex items-center gap-1 font-bold text-[#111113] font-pixel">
                <Sparkles className="w-3.5 h-3.5 text-[#111113]" />
                CHARACTER LEVEL {playerStats.level} XP
              </span>
              <span className="text-[#111113] font-bold">
                {playerStats.xp} / {playerStats.xpToNextLevel} XP ({xpPercent}%)
              </span>
            </div>
            <div className="w-full bg-[#f5f4ef] border-2 border-[#18181c] h-4 p-0.5 shadow-pixel-sm">
              <div 
                className="h-full bg-[#18181c] transition-all duration-300 ease-out" 
                style={{ width: `${xpPercent}%` }}
              ></div>
            </div>
          </div>

          {/* RPG Attributes Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b-2 border-[#18181c] pb-1">
              <h3 className="font-pixel text-xs font-bold text-[#111113] uppercase tracking-widest flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-[#111113]" />
                RPG Attribute Stats (5-Category Matrix)
              </h3>
              <span className="font-mono text-[10px] text-[#111113] hidden sm:inline">
                Completing tasks directly levels up corresponding stats
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-2.5">
              {(['intellect', 'strength', 'creativity', 'vitality', 'discipline'] as AttributeType[]).map(attrKey => {
                const meta = ATTRIBUTE_DESCRIPTIONS[attrKey];
                const Icon = meta.icon;
                const stat = attributes[attrKey] || { level: 1, xp: 0, xpToNextLevel: 80 };
                const percent = Math.min(100, Math.round((stat.xp / stat.xpToNextLevel) * 100));

                return (
                  <div key={attrKey} className="p-2.5 bg-[#f5f4ef] border border-[#18181c] font-mono text-xs shadow-pixel-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          <Icon className="w-3.5 h-3.5 text-[#111113]" />
                          <span className="font-bold text-[#111113] capitalize font-pixel text-xs">
                            {meta.name}
                          </span>
                        </div>
                        <span className="font-pixel font-bold text-[#111113] text-[11px] px-1.5 py-0.5 bg-[#ebeae4] border border-[#18181c]">
                          Lv.{stat.level}
                        </span>
                      </div>
                      
                      <p className="font-serif text-[11px] text-[#111113] italic mb-2 line-clamp-1">
                        {meta.desc}
                      </p>
                    </div>

                    <div>
                      <div className="flex justify-between text-[10px] text-[#111113] mb-1 font-bold">
                        <span>XP Progress</span>
                        <span>{stat.xp} / {stat.xpToNextLevel}</span>
                      </div>
                      <div className="w-full bg-[#ebeae4] h-2 border border-[#18181c]">
                        <div 
                          className="h-full bg-[#18181c] transition-all duration-300"
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

