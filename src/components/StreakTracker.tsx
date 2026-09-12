import type { FC } from 'react';
import { useGame } from '../context/GameContext';
import { Flame, Zap, Calendar, TrendingUp } from 'lucide-react';
import { getWeeklyActivityStatus } from '../utils/rpgEngine';

export const StreakTracker: FC = () => {
  const { playerStats } = useGame();

  const weeklyStatus = getWeeklyActivityStatus(playerStats.activityHistory || []);
  const isStreakHot = playerStats.streakDays >= 3;

  return (
    <div className="double-bezel h-full">
      <div className="double-bezel-inner bg-[#ebeae4] text-[#111113] p-5 border border-[#18181c] flex flex-col justify-between h-full space-y-4">
        
        <div>
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className={`p-2.5 bg-[#18181c] border border-black shadow-pixel-sm ${isStreakHot ? 'text-orange-500' : 'text-amber-400'}`}>
                <Flame className={`w-5 h-5 ${isStreakHot ? 'animate-bounce' : 'animate-pulse'}`} />
              </div>
              <div>
                <h3 className="font-pixel text-sm font-bold tracking-wide uppercase text-[#111113]">
                  DAILY QUEST STREAK
                </h3>
                <p className="font-mono text-[11px] text-[#4a4943]">
                  Consistency RPG Engine
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="font-pixel text-2xl font-bold text-[#111113] leading-none">
                {playerStats.streakDays} {playerStats.streakDays === 1 ? 'DAY' : 'DAYS'}
              </div>
              <div className="font-mono text-[11px] text-emerald-800 font-bold flex items-center gap-0.5 justify-end mt-0.5">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>{playerStats.activeMultiplier}x XP Multiplier</span>
              </div>
            </div>
          </div>

          <p className="font-serif italic text-xs text-[#4a4943] mb-4 leading-relaxed">
            {playerStats.streakDays >= 7 
              ? '🔥 Legendary 7+ day dedication! Maximum XP streak bonus engaged.'
              : playerStats.streakDays >= 3
              ? '⚡ You are on a hot streak! Keep completing daily tasks to ramp your multiplier.'
              : 'Complete at least 1 task daily to ignite and preserve your fire multiplier!'}
          </p>

          {/* 7-Day Weekly Calendar Row */}
          <div>
            <div className="flex justify-between items-center text-[10px] font-mono font-bold text-[#4a4943] mb-1 uppercase tracking-wider">
              <span>Current Week Activity</span>
              <span>Mon - Sun</span>
            </div>

            <div className="grid grid-cols-7 gap-1.5 pt-2 border-t-2 border-[#18181c]">
              {weeklyStatus.map((day, idx) => (
                <div key={idx} className="flex flex-col items-center gap-1 font-mono text-[10px]">
                  <div 
                    title={`${day.dateStr} ${day.isActive ? '(Completed)' : '(No activity)'}${day.isToday ? ' - Today' : ''}`}
                    className={`w-full aspect-square flex items-center justify-center border-2 border-[#18181c] transition-all ${
                      day.isActive 
                        ? 'bg-[#18181c] text-orange-400 shadow-pixel-sm font-bold' 
                        : day.isToday 
                        ? 'bg-[#f5f4ef] border-dashed border-[#18181c] text-[#111113] font-bold ring-2 ring-amber-500/50' 
                        : 'bg-[#f5f4ef] text-zinc-400'
                    }`}
                  >
                    {day.isActive ? (
                      <Flame className="w-4 h-4 animate-pulse" />
                    ) : (
                      <span>{day.dayLabel}</span>
                    )}
                  </div>
                  <span className={`text-[10px] font-bold ${day.isToday ? 'text-amber-800 underline' : 'text-[#4a4943]'}`}>
                    {day.dayLabel}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Meta */}
        <div className="pt-3 border-t border-[#18181c]/40 flex items-center justify-between font-mono text-[11px] text-[#4a4943]">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            Active: {playerStats.lastActiveDate}
          </span>
          <span className="flex items-center gap-1 text-amber-800 font-bold">
            <Zap className="w-3.5 h-3.5" />
            +{(Math.round((playerStats.activeMultiplier - 1.0) * 100))}% Bonus XP
          </span>
        </div>

      </div>
    </div>
  );
};
