import React from 'react';
import { Sparkles, Coins } from 'lucide-react';

interface FloatingXpGainProps {
  xp: number;
  gold: number;
  onAnimationEnd?: () => void;
}

export const FloatingXpGain: React.FC<FloatingXpGainProps> = ({ xp, gold, onAnimationEnd }) => {
  return (
    <div
      onAnimationEnd={onAnimationEnd}
      className="absolute top-0 right-4 pointer-events-none z-30 animate-float-xp flex items-center gap-2 select-none"
    >
      <div className="bg-[#18181c] text-amber-400 px-2.5 py-1 border border-amber-500 shadow-pixel-sm font-pixel text-xs font-bold flex items-center gap-1">
        <Sparkles className="w-3 h-3 text-amber-400" />
        <span>+{xp} XP</span>
      </div>
      {gold > 0 && (
        <div className="bg-[#18181c] text-yellow-300 px-2 py-1 border border-yellow-400 shadow-pixel-sm font-pixel text-xs font-bold flex items-center gap-1">
          <Coins className="w-3 h-3 text-yellow-400" />
          <span>+{gold}g</span>
        </div>
      )}
    </div>
  );
};
