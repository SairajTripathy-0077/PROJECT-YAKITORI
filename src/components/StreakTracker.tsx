import { useState, useEffect, useMemo, type FC } from 'react';
import { useGame } from '../context/GameContext';
import { Flame, ChevronLeft, ChevronRight, HelpCircle, ShieldCheck, X } from 'lucide-react';
import { getMonthCalendarGrid, type MonthCalendarDay } from '../utils/rpgEngine';

export const StreakTracker: FC = () => {
  const { playerStats, theme } = useGame();
  const isEink = theme === 'eink';

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

  const todayNum = now.getDate();

  return (
    <div className="double-bezel h-full">
      <div className={`double-bezel-inner p-4 sm:p-5 border flex flex-col justify-between h-full space-y-4 shadow-2xl relative overflow-hidden transition-colors ${
        isEink ? 'bg-[#ebeae4] text-[#111113] border-[#18181c]' : 'bg-[#18181c] text-[#f5f4ef] border-[#33322d]'
      }`}>
        
        <div>
          {/* Header Row */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className={`font-pixel text-xl sm:text-2xl font-bold tracking-wide ${
                  isEink ? 'text-[#111113]' : 'text-[#f5f4ef]'
                }`}>
                  Day {playerStats.streakDays > 0 ? playerStats.streakDays : 1}
                </span>
                <span className={`font-mono text-[10px] sm:text-[11px] px-2 py-0.5 border rounded-full ${
                  isEink ? 'text-[#33322d] bg-[#deddd6] border-[#18181c]' : 'text-zinc-400 bg-[#26252a] border-[#3c3a42]'
                }`}>
                  {timeLeft}
                </span>
              </div>
              <p className={`font-serif italic text-xs mt-0.5 ${
                isEink ? 'text-amber-800 font-semibold' : 'text-amber-400/90'
              }`}>
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
                className={`p-1 transition-colors ${
                  isEink ? 'text-[#4a4943] hover:text-[#111113]' : 'text-zinc-400 hover:text-white'
                }`}
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Pixel Month Badge */}
              <div className={`w-12 h-12 border-2 rounded-xl flex flex-col items-center justify-center shadow-md relative group cursor-pointer transition-colors ${
                isEink 
                  ? 'bg-[#deddd6] border-[#18181c] text-[#111113]' 
                  : 'bg-gradient-to-b from-[#2a2736] to-[#1a1824] border-purple-500/60 text-purple-300'
              }`}>
                <div className="font-pixel text-xs font-bold leading-none">
                  {todayNum}
                </div>
                <div className={`font-mono text-[9px] font-bold tracking-wider uppercase mt-0.5 ${
                  isEink ? 'text-amber-900' : 'text-purple-400'
                }`}>
                  {monthLabel}
                </div>
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full animate-ping" />
              </div>

              <button
                onClick={handleNextMonth}
                className={`p-1 transition-colors ${
                  isEink ? 'text-[#4a4943] hover:text-[#111113]' : 'text-zinc-400 hover:text-white'
                }`}
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Month Calendar Grid */}
          <div className={`p-3 border rounded-lg space-y-2 transition-colors ${
            isEink ? 'bg-[#f5f4ef] border-[#18181c]' : 'bg-[#212026] border-[#33322d]'
          }`}>
            {/* Days Header */}
            <div className={`grid grid-cols-7 text-center font-mono text-[11px] font-bold border-b pb-1.5 ${
              isEink ? 'text-[#4a4943] border-[#18181c]' : 'text-zinc-400 border-[#33322d]'
            }`}>
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
                        ? isEink 
                          ? 'bg-[#18181c] text-[#f5f4ef] font-bold shadow-md ring-2 ring-amber-600' 
                          : 'bg-emerald-500 text-black font-bold shadow-md ring-2 ring-emerald-300'
                        : isSelected
                        ? isEink 
                          ? 'bg-[#deddd6] text-[#111113] font-bold border border-[#18181c]' 
                          : 'bg-[#3e3c47] text-white font-bold border border-amber-400'
                        : isEink 
                          ? 'text-[#33322d] hover:bg-[#deddd6]' 
                          : 'text-zinc-300 hover:bg-[#2e2d36]'
                    }`}
                  >
                    <span>{day.dayNum}</span>

                    {/* Red Dot under completed active days (inspired by reference image) */}
                    {day.isActive && !day.isToday && (
                      <span className={`w-1.5 h-1.5 rounded-full absolute bottom-0.5 shadow-sm ${
                        isEink ? 'bg-red-700' : 'bg-red-500 animate-pulse'
                      }`} />
                    )}

                    {/* Today active dot */}
                    {day.isActive && day.isToday && (
                      <span className={`w-1.5 h-1.5 rounded-full absolute bottom-0.5 ${
                        isEink ? 'bg-amber-400' : 'bg-black'
                      }`} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Weekly Premium / Milestone Banner (W1..W5) */}
          <div className={`mt-3.5 p-3 border rounded-lg space-y-2 transition-colors ${
            isEink 
              ? 'bg-[#deddd6] border-[#18181c] text-[#111113]' 
              : 'bg-gradient-to-r from-[#2e2316] to-[#1c1815] border-amber-900/60 text-amber-400'
          }`}>
            <div className="flex items-center justify-between font-mono text-xs">
              <div className="flex items-center gap-1.5 font-bold font-pixel tracking-wide">
                <span>Weekly RPG Bonus</span>
                <button 
                  onClick={() => setShowRulesModal(true)}
                  className={`transition-colors ${
                    isEink ? 'text-amber-900 hover:text-black' : 'text-amber-500/80 hover:text-amber-300'
                  }`}
                  title="View Streak Rules"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                </button>
              </div>
              <span className={`text-[10px] ${isEink ? 'text-[#4a4943]' : 'text-amber-200/70'}`}>
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
                        ? isEink 
                          ? 'bg-[#18181c] text-amber-400 font-pixel font-bold ring-2 ring-amber-600 shadow-pixel-sm' 
                          : 'bg-amber-500 text-black font-pixel font-bold ring-2 ring-amber-300 shadow-pixel-sm animate-pulse'
                        : isCompletedWeek
                        ? isEink 
                          ? 'bg-emerald-800 text-white font-bold border border-[#18181c]' 
                          : 'bg-amber-950 text-amber-400 border border-amber-800/80 font-bold'
                        : isEink 
                          ? 'bg-[#ebeae4] text-[#4a4943] border border-[#18181c]/50' 
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
        <div className={`pt-3 border-t flex items-center justify-between font-mono text-xs ${
          isEink ? 'border-[#18181c] text-[#4a4943]' : 'border-[#33322d] text-zinc-400'
        }`}>
          <div className={`flex items-center gap-1.5 font-bold ${
            isEink ? 'text-emerald-900' : 'text-emerald-400'
          }`}>
            <ShieldCheck className="w-4 h-4" />
            <span>{playerStats.gold} Gold Reward</span>
          </div>

          <button
            onClick={() => setShowRulesModal(true)}
            className={`transition-colors underline text-[11px] ${
              isEink ? 'text-[#111113] hover:text-amber-800' : 'text-zinc-400 hover:text-amber-400'
            }`}
          >
            Rules & Multiplier
          </button>
        </div>

      </div>

      {/* Rules & Multiplier Info Modal */}
      {showRulesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
          <div className={`max-w-md w-full p-5 border-2 shadow-pixel-lg space-y-4 font-mono text-xs relative ${
            isEink 
              ? 'bg-[#f5f4ef] border-[#18181c] text-[#111113]' 
              : 'bg-[#18181c] border-amber-500 text-[#f5f4ef]'
          }`}>
            <button
              onClick={() => setShowRulesModal(false)}
              className={`absolute top-3 right-3 p-1 ${
                isEink ? 'text-[#33322d] hover:text-black' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <X className="w-4 h-4" />
            </button>

            <div className={`flex items-center gap-2 border-b pb-3 ${
              isEink ? 'border-[#18181c]' : 'border-[#33322d]'
            }`}>
              <Flame className="w-5 h-5 text-orange-500 animate-pulse" />
              <h3 className={`font-pixel text-sm font-bold uppercase tracking-wider ${
                isEink ? 'text-amber-900' : 'text-amber-400'
              }`}>
                Daily Streak & Multiplier Rules
              </h3>
            </div>

            <div className={`space-y-2.5 leading-relaxed text-[11px] ${
              isEink ? 'text-[#33322d]' : 'text-zinc-300'
            }`}>
              <p>
                <strong className={isEink ? 'text-[#111113]' : 'text-white'}>1. Daily Activation:</strong> Complete at least 1 main, daily, or side quest each day before midnight to maintain your streak.
              </p>
              <p>
                <strong className={isEink ? 'text-[#111113]' : 'text-white'}>2. XP Multipliers:</strong>
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
                <strong className={isEink ? 'text-[#111113]' : 'text-white'}>3. Red Dots & Today Badge:</strong> Red dots mark days with completed quests. Today's date is highlighted with a green or high-contrast badge!
              </p>
            </div>

            <button
              onClick={() => setShowRulesModal(false)}
              className={`w-full py-2 font-pixel font-bold text-xs uppercase tracking-wider transition-colors ${
                isEink 
                  ? 'bg-[#18181c] text-[#f5f4ef] hover:bg-black' 
                  : 'bg-amber-500 hover:bg-amber-400 text-black'
              }`}
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
