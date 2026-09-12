import type { FC } from 'react';
import { useGame } from '../context/GameContext';
import { Brain, Dumbbell, Palette, Zap, Shield, Sparkles, Award } from 'lucide-react';
import type { AttributeType } from '../types/game';

export const PlayerCard: FC = () => {
  const { playerStats, attributes, shopItems } = useGame();

  const xpPercent = Math.min(100, Math.round((playerStats.xp / playerStats.xpToNextLevel) * 100));

  const equippedItems = shopItems.filter(i => i.purchased && i.equipped);

  const getAttributeIcon = (type: AttributeType) => {
    switch (type) {
      case 'intellect': return <Brain className="w-4 h-4 text-blue-600" />;
      case 'strength': return <Dumbbell className="w-4 h-4 text-red-600" />;
      case 'creativity': return <Palette className="w-4 h-4 text-purple-600" />;
      case 'vitality': return <Zap className="w-4 h-4 text-emerald-600" />;
      case 'discipline': return <Shield className="w-4 h-4 text-amber-600" />;
    }
  };

  return (
    <div className="double-bezel h-full">
      <div className="double-bezel-inner bg-[#ebeae4] text-[#111113] p-5 border border-[#18181c] flex flex-col justify-between h-full space-y-4">
        
        <div>
          {/* Character Header */}
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#18181c] text-[#f5f4ef] border-2 border-black flex items-center justify-center text-2xl shadow-pixel">
                {playerStats.avatar}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-pixel text-lg font-bold tracking-wide text-[#111113]">
                    {playerStats.name}
                  </h2>
                  <span className="px-2 py-0.5 bg-[#18181c] text-[#f5f4ef] font-pixel text-[10px] font-bold uppercase">
                    {playerStats.title}
                  </span>
                </div>
                <p className="font-mono text-xs text-[#4a4943]">
                  Level {playerStats.level} Questmaster • {playerStats.totalCompletedQuests} Quests Finished
                </p>
              </div>
            </div>
          </div>

          {/* Level XP Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center text-xs font-mono mb-1">
              <span className="flex items-center gap-1 font-bold text-[#111113]">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                CHARACTER XP
              </span>
              <span className="text-[#4a4943]">
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
            <h3 className="font-pixel text-xs font-bold text-[#4a4943] uppercase tracking-widest flex items-center gap-1.5 border-b-2 border-[#18181c] pb-1">
              <Award className="w-3.5 h-3.5 text-amber-600" />
              Character Stats & Attributes
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {(['intellect', 'strength', 'creativity', 'vitality', 'discipline'] as AttributeType[]).map(attrKey => {
                const stat = attributes[attrKey] || { level: 1, xp: 0, xpToNextLevel: 100 };
                const percent = Math.min(100, Math.round((stat.xp / stat.xpToNextLevel) * 100));

                return (
                  <div key={attrKey} className="p-3 bg-[#f5f4ef] border border-[#18181c] font-mono text-xs shadow-pixel-sm">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        {getAttributeIcon(attrKey)}
                        <span className="font-bold text-[#111113] capitalize font-pixel">
                          {attrKey}
                        </span>
                      </div>
                      <span className="font-pixel font-bold text-[#111113] text-xs px-1.5 py-0.5 bg-[#ebeae4] border border-[#18181c]">
                        Lv.{stat.level}
                      </span>
                    </div>

                    <div className="w-full bg-[#ebeae4] h-2.5 border border-[#18181c]">
                      <div 
                        className="h-full bg-[#18181c] transition-all duration-300"
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Equipped Loadout & Buffs */}
        {equippedItems.length > 0 && (
          <div className="pt-3 border-t border-[#18181c]/40 flex flex-wrap items-center gap-2 text-xs font-mono">
            <span className="text-[#4a4943] text-[11px] uppercase tracking-wider font-pixel">Equipped Gear:</span>
            {equippedItems.map(item => (
              <span key={item.id} className="px-2 py-1 bg-[#18181c] text-[#f5f4ef] border border-black flex items-center gap-1">
                <span>{item.icon}</span>
                <span>{item.name}</span>
              </span>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
