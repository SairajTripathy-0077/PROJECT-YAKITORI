import type { FC } from 'react';
import { useGame } from '../context/GameContext';
import { Flame, Zap, Calendar, TrendingUp } from 'lucide-react';

export const StreakTracker: FC = () => {
  const { playerStats } = useGame();

  const daysOfWeek = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <div className="double-bezel h-full">
      <div className="double-bezel-inner bg-[#ebeae4] text-[#111113] p-5 border border-[#18181c] flex flex-col justify-between h-full">
        
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2.5 bg-[#18181c] text-orange-400 border border-black shadow-pixel-sm">
                <Flame className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="font-pixel text-sm font-bold tracking-wide uppercase text-[#111113]">
                  QUEST STREAK
                </h3>
                <p className="font-mono text-[11px] text-[#4a4943]">
                  Daily Consistency Meter
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="font-pixel text-2xl font-bold text-[#111113]">
                {playerStats.streakDays} DAYS
              </div>
              <div className="font-mono text-[10px] text-emerald-700 font-bold flex items-center gap-0.5 justify-end">
                <TrendingUp className="w-3 h-3" />
                <span>{playerStats.activeMultiplier}x XP Multiplier</span>
              </div>
            </div>
          </div>

          <p className="font-serif italic text-xs text-[#4a4943] mb-4 leading-relaxed">
            Complete at least 1 quest daily to maintain your fire multiplier!
          </p>

          {/* 7-Day Flame Activity Row */}
          <div className="grid grid-cols-7 gap-2 pt-3 border-t-2 border-[#18181c]">
            {daysOfWeek.map((day, idx) => {
              const isActive = idx < playerStats.streakDays % 7 || playerStats.streakDays >= 7;
              return (
                <div key={idx} className="flex flex-col items-center gap-1 font-mono text-[10px]">
                  <div className={`w-full aspect-square flex items-center justify-center border-2 border-[#18181c] ${isActive ? 'bg-[#18181c] text-orange-400 shadow-pixel-sm font-bold' : 'bg-[#f5f4ef] text-zinc-400'}`}>
                    {isActive ? <Flame className="w-4 h-4 animate-pulse" /> : day}
                  </div>
                  <span className="text-[#4a4943] font-bold">{day}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-[#18181c]/40 flex items-center justify-between font-mono text-[11px] text-[#4a4943]">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            Last Active: {playerStats.lastActiveDate}
          </span>
          <span className="flex items-center gap-1 text-amber-700 font-bold">
            <Zap className="w-3.5 h-3.5" />
            Bonus Active
          </span>
        </div>

      </div>
    </div>
  );
};
