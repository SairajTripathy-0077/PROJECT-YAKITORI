import { useState, useEffect, useMemo, type FC } from 'react';
import { useGame } from '../context/GameContext';
import { Flame, Zap, ChevronLeft, ChevronRight, HelpCircle, ShieldCheck, Sparkles, X } from 'lucide-react';
import { getMonthCalendarGrid, type MonthCalendarDay } from '../utils/rpgEngine';

export const StreakTracker: FC = () => {
  const { playerStats } = useGame();

  const now = new Date();
  const [currentYear, setCurrentYear] = useState<number>(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(now.getMonth());
  const [selectedDayStr, setSelectedDayStr] = useState<string | null>(null);
  const [showRulesModal, setShowRulesModal] = useState<boolean>(false);

  // Live countdown timer until midnight
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight.getTime() - now.getTime();

      const hours = String(Math.floor((diff / (1000 * 60 * 60)) % 24)).padStart(2, '0');
      const minutes = String(Math.floor((diff / (1000 * 60)) % 60)).padStart(2, '0');
      const seconds = String(Math.floor((diff / 1000) % 60)).padStart(2, '0');

      setTimeLeft(`${hours}:${minutes}:${seconds} left`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // Month Calendar Data
  const { days, monthLabel } = useMemo(() => {
    return getMonthCalendarGrid(currentYear, currentMonth, playerStats.activityHistory || []);
  }, [currentYear, currentMonth, playerStats.activityHistory]);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  // Calculate current week index (W1..W5)
  const currentDayOfMonth = now.getDate();
  const currentWeekIdx = Math.min(5, Math.ceil(currentDayOfMonth / 7));

  // Days left in current week (Sunday = end of week)
  const dayOfWeek = now.getDay();
  const daysLeftInWeek = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;

  const isStreakHot = playerStats.streakDays >= 3;
  const todayNum = now.getDate();

  return (
    <div className="double-bezel h-full">
      <div className="double-bezel-inner bg-[#18181c] text-[#f5f4ef] p-4 sm:p-5 border border-[#33322d] flex flex-col justify-between h-full space-y-4 shadow-2xl relative overflow-hidden">
        
        <div>
          {/* Header Row */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-pixel text-xl sm:text-2xl font-bold tracking-wide text-[#f5f4ef]">
                  Day {playerStats.streakDays > 0 ? playerStats.streakDays : 1}
                </span>
                <span className="font-mono text-[10px] sm:text-[11px] text-zinc-400 bg-[#26252a] px-2 py-0.5 border border-[#3c3a42] rounded-full">
                  {timeLeft}
                </span>
              </div>
              <p className="font-serif italic text-xs text-amber-400/90 mt-0.5">
                {playerStats.streakDays >= 7 
                  ? '🔥 Legendary 7+ day streak active!' 
                  : playerStats.streakDays >= 3 
                  ? '⚡ Hot streak! 1.3x XP bonus engaged.' 
                  : 'Complete 1 daily task to ignite your fire!'}
              </p>
            </div>

            {/* Month Navigation Badge */}
            <div className="flex items-center gap-1">
              <button
                onClick={handlePrevMonth}
                className="p-1 text-zinc-400 hover:text-white transition-colors"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Pixel Month Hexagon Badge */}
              <div className="w-12 h-12 bg-gradient-to-b from-[#2a2736] to-[#1a1824] border-2 border-purple-500/60 rounded-xl flex flex-col items-center justify-center shadow-lg relative group cursor-pointer">
                <div className="font-pixel text-xs font-bold text-purple-300 leading-none">
                  {todayNum}
                </div>
                <div className="font-mono text-[9px] font-bold text-purple-400 tracking-wider uppercase mt-0.5">
                  {monthLabel}
                </div>
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full animate-ping" />
              </div>

              <button
                onClick={handleNextMonth}
                className="p-1 text-zinc-400 hover:text-white transition-colors"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Month Calendar Grid */}
          <div className="bg-[#212026] p-3 border border-[#33322d] rounded-lg space-y-2">
            {/* Days Header */}
            <div className="grid grid-cols-7 text-center font-mono text-[11px] text-zinc-400 font-bold border-b border-[#33322d] pb-1.5">
              <span>S</span>
              <span>M</span>
              <span>T</span>
              <span>W</span>
              <span>T</span>
              <span>F</span>
              <span>S</span>
            </div>

            {/* Monthly Dates Grid */}
            <div className="grid grid-cols-7 gap-y-1.5 gap-x-1 text-center font-mono text-xs pt-1">
              {days.map((day: MonthCalendarDay, idx: number) => {
                if (day.dayNum === null) {
                  return <div key={`empty-${idx}`} className="h-7" />;
                }

                const isSelected = selectedDayStr === day.dateStr;

                return (
                  <button
                    key={day.dateStr || idx}
                    onClick={() => setSelectedDayStr(day.dateStr)}
                    title={`${day.dateStr} ${day.isActive ? '(Completed)' : ''}${day.isToday ? ' - Today' : ''}`}
                    className={`h-7 flex flex-col items-center justify-center relative transition-all rounded-full ${
                      day.isToday
                        ? 'bg-emerald-500 text-black font-bold shadow-md ring-2 ring-emerald-300'
                        : isSelected
                        ? 'bg-[#3e3c47] text-white font-bold border border-amber-400'
                        : 'text-zinc-300 hover:bg-[#2e2d36]'
                    }`}
                  >
                    <span>{day.dayNum}</span>

                    {/* Red Dot under completed active days (inspired by reference image) */}
                    {day.isActive && !day.isToday && (
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full absolute bottom-0.5 shadow-sm animate-pulse" />
                    )}

                    {/* Today active dot */}
                    {day.isActive && day.isToday && (
                      <span className="w-1.5 h-1.5 bg-black rounded-full absolute bottom-0.5" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Weekly Premium / Milestone Banner (W1..W5) */}
          <div className="mt-3.5 bg-gradient-to-r from-[#2e2316] to-[#1c1815] p-3 border border-amber-900/60 rounded-lg space-y-2">
            <div className="flex items-center justify-between font-mono text-xs">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold font-pixel tracking-wide">
                <span>Weekly RPG Bonus</span>
                <button 
                  onClick={() => setShowRulesModal(true)}
                  className="text-amber-500/80 hover:text-amber-300 transition-colors"
                  title="View Streak Rules"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                </button>
              </div>
              <span className="text-[10px] text-amber-200/70">
                {daysLeftInWeek === 0 ? 'Last day of week' : `${daysLeftInWeek} days left`}
              </span>
            </div>

            {/* Weeks Row W1..W5 */}
            <div className="flex items-center justify-between px-1">
              {[1, 2, 3, 4, 5].map((w) => {
                const isCurrentWeek = w === currentWeekIdx;
                const isCompletedWeek = w < currentWeekIdx || (w === currentWeekIdx && playerStats.streakDays >= 7);

                return (
                  <div
                    key={w}
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-[11px] transition-all ${
                      isCurrentWeek
                        ? 'bg-amber-500 text-black font-pixel font-bold ring-2 ring-amber-300 shadow-pixel-sm animate-pulse'
                        : isCompletedWeek
                        ? 'bg-amber-950 text-amber-400 border border-amber-800/80 font-bold'
                        : 'bg-[#212026] text-zinc-500 border border-[#33322d]'
                    }`}
                    title={`Week ${w} Streak Milestone`}
                  >
                    W{w}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Bar */}
        <div className="pt-3 border-t border-[#33322d] flex items-center justify-between font-mono text-xs text-zinc-400">
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>{playerStats.gold} Gold Reward</span>
          </div>

          <button
            onClick={() => setShowRulesModal(true)}
            className="text-zinc-400 hover:text-amber-400 transition-colors underline text-[11px]"
          >
            Rules & Multiplier
          </button>
        </div>

      </div>

      {/* Rules & Multiplier Info Modal */}
      {showRulesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-[#18181c] border-2 border-amber-500 text-[#f5f4ef] max-w-md w-full p-5 shadow-pixel-lg space-y-4 font-mono text-xs relative">
            <button
              onClick={() => setShowRulesModal(false)}
              className="absolute top-3 right-3 text-zinc-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 border-b border-[#33322d] pb-3">
              <Flame className="w-5 h-5 text-orange-500 animate-pulse" />
              <h3 className="font-pixel text-sm font-bold text-amber-400 uppercase tracking-wider">
                Daily Streak & Multiplier Rules
              </h3>
            </div>

            <div className="space-y-2.5 text-zinc-300 leading-relaxed text-[11px]">
              <p>
                <strong className="text-white">1. Daily Activation:</strong> Complete at least 1 main, daily, or side quest each day before midnight to maintain your streak.
              </p>
              <p>
                <strong className="text-white">2. XP Multipliers:</strong>
                <br />
                • Day 1: 1.00x Base XP
                <br />
                • Day 3+: 1.30x XP Boost
                <br />
                • Day 7+: 1.90x XP Bonus
                <br />
                • Day 10+: Up to 3.00x Maximum Multiplier!
              </p>
              <p>
                <strong className="text-white">3. Red Dots & Green Circle:</strong> Red dots represent days where you successfully logged completed quests. The green circle highlights today!
              </p>
            </div>

            <button
              onClick={() => setShowRulesModal(false)}
              className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-black font-pixel font-bold text-xs uppercase tracking-wider transition-colors"
            >
              GOT IT, HERO!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
export default StreakTracker;
