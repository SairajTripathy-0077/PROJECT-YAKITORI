import { useState, useEffect, useMemo, type FC } from 'react';
import { useGame } from '../context/GameContext';
import { Flame, ChevronLeft, ChevronRight, ShieldCheck, X, Zap } from 'lucide-react';
import { getMonthCalendarGrid, type MonthCalendarDay } from '../utils/rpgEngine';

// XP multiplier tiers
const XP_TIERS = [
  { minDay: 1,  maxDay: 2,  multiplier: 1.0, label: 'Day 1–2',  color: 'bg-zinc-200 text-[#111113]' },
  { minDay: 3,  maxDay: 6,  multiplier: 1.3, label: 'Day 3–6',  color: 'bg-amber-200 text-amber-900' },
  { minDay: 7,  maxDay: 9,  multiplier: 1.9, label: 'Day 7–9',  color: 'bg-orange-300 text-orange-900' },
  { minDay: 10, maxDay: 999, multiplier: 3.0, label: 'Day 10+', color: 'bg-red-400 text-white' },
];

function getCurrentMultiplier(streakDays: number): number {
  const day = streakDays > 0 ? streakDays : 1;
  if (day >= 10) return 3.0;
  if (day >= 7)  return 1.9;
  if (day >= 3)  return 1.3;
  return 1.0;
}

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
  void currentDayOfMonth; // kept for future use

  const todayNum = now.getDate();
  const currentMultiplier = getCurrentMultiplier(playerStats.streakDays);
  const streakDay = playerStats.streakDays > 0 ? playerStats.streakDays : 1;

  return (
    <div className="double-bezel h-full">
      <div className={`double-bezel-inner p-4 sm:p-5 border-2 flex flex-col justify-between h-full space-y-4 shadow-[4px_4px_0px_#000] relative overflow-hidden transition-colors ${
        isEink
          ? 'bg-[#f5f4ef] text-[#111113] border-[#18181c]'
          : 'bg-white text-[#111113] border-[#111113]'
      }`}>
        
        <div>
          {/* Header Row */}
          <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-pixel text-xl sm:text-2xl font-bold tracking-wide text-[#111113]">
                Day {playerStats.streakDays > 0 ? playerStats.streakDays : 1}
              </span>
              <span className="font-mono text-[10px] sm:text-[11px] px-2 py-0.5 border-2 border-[#111113] bg-[#f5f4ef] text-[#111113]">
                {timeLeft}
              </span>
            </div>
            <p className={`font-serif italic text-xs mt-0.5 ${
              isEink ? 'text-amber-800 font-semibold' : 'text-amber-700 font-semibold'
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
                className="p-1 text-[#111113] hover:text-black transition-colors"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Month Badge — container style */}
              <div className="w-12 h-12 border-2 border-[#111113] bg-white flex flex-col items-center justify-center shadow-[2px_2px_0px_#000] relative cursor-pointer">
                <div className="font-pixel text-xs font-bold leading-none text-[#111113]">
                  {todayNum}
                </div>
                <div className="font-mono text-[9px] font-bold tracking-wider uppercase mt-0.5 text-amber-700">
                  {monthLabel}
                </div>
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full animate-ping" />
              </div>

              <button
                onClick={handleNextMonth}
                className="p-1 text-[#111113] hover:text-black transition-colors"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Month Calendar Grid — container style */}
          <div className="border-2 border-[#111113] bg-white overflow-hidden shadow-[2px_2px_0px_#000]">
            {/* Days Header */}
            <div className="grid grid-cols-7 text-center font-mono text-[11px] font-bold border-b-2 border-[#111113] py-1.5 bg-[#111113] text-white">
              <span>S</span>
              <span>M</span>
              <span>T</span>
              <span>W</span>
              <span>T</span>
              <span>F</span>
              <span>S</span>
            </div>

            {/* Monthly Dates Grid — container-style cells with float hover */}
            <div className="grid grid-cols-7 gap-1 p-2">
              {days.map((day: MonthCalendarDay, idx: number) => {
                if (day.dayNum === null) {
                  return <div key={`empty-${idx}`} className="h-8" />;
                }

                const isSelected = selectedDayStr === day.dateStr;

                return (
                  <button
                    key={day.dateStr || idx}
                    onClick={() => setSelectedDayStr(day.dateStr)}
                    title={`${day.dateStr} ${day.isActive ? '(Completed)' : ''}${day.isToday ? ' - Today' : ''}`}
                    className={`h-8 flex flex-col items-center justify-center relative border-2 font-bold text-xs font-mono
                      transition-all duration-150 ease-out
                      hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_#000]
                      ${
                        day.isToday
                          ? isEink
                            ? 'bg-[#18181c] text-[#f5f4ef] border-[#18181c] shadow-[2px_2px_0px_#18181c]'
                            : 'bg-purple-600 text-white border-[#111113] shadow-[2px_2px_0px_#111113]'
                          : isSelected
                          ? isEink
                            ? 'bg-[#deddd6] text-[#111113] border-[#18181c] shadow-[2px_2px_0px_#18181c]'
                            : 'bg-purple-900 text-purple-100 border-[#111113] shadow-[2px_2px_0px_#111113]'
                          : isEink
                            ? 'bg-[#f5f4ef] text-[#111113] border-[#18181c]'
                            : 'bg-white text-[#111113] border-[#111113]'
                      }`}
                  >
                    <span className="leading-none">{day.dayNum}</span>

                    {/* Amber dot — completed active days */}
                    {day.isActive && !day.isToday && (
                      <span className={`w-1 h-1 rounded-full absolute bottom-0.5 ${
                        isEink ? 'bg-amber-700' : 'bg-amber-500'
                      }`} />
                    )}

                    {/* Today active dot */}
                    {day.isActive && day.isToday && (
                      <span className="w-1 h-1 rounded-full absolute bottom-0.5 bg-white" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* XP Multiplier Panel */}
          <div className="mt-3.5 border-2 border-[#111113] bg-white shadow-[2px_2px_0px_#000] overflow-hidden">
            {/* Panel Header */}
            <div className="flex items-center justify-between px-3 py-2 bg-[#111113] text-white">
              <div className="flex items-center gap-1.5 font-pixel text-[11px] font-bold uppercase tracking-wider">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>XP Multiplier</span>
              </div>
              {/* Live multiplier badge */}
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[10px] text-zinc-400">Active:</span>
                <span className={`font-pixel text-sm font-bold px-2 py-0.5 border-2 border-amber-400 ${
                  currentMultiplier >= 3.0 ? 'text-red-400' :
                  currentMultiplier >= 1.9 ? 'text-orange-400' :
                  currentMultiplier >= 1.3 ? 'text-amber-400' :
                  'text-zinc-300'
                }`}>
                  {currentMultiplier.toFixed(2)}x
                </span>
              </div>
            </div>

            {/* Tier Guideline Bar */}
            <div className="flex border-t-2 border-[#111113]">
              {XP_TIERS.map((tier, i) => {
                const isActive = streakDay >= tier.minDay && streakDay <= tier.maxDay;
                const isPast   = streakDay > tier.maxDay;
                return (
                  <div
                    key={i}
                    className={`flex-1 flex flex-col items-center py-2 gap-0.5 border-r-2 border-[#111113] last:border-r-0 transition-all ${
                      isActive
                        ? tier.color + ' shadow-inner'
                        : isPast
                        ? 'bg-[#111113] text-white'
                        : 'bg-white text-[#4a4943]'
                    }`}
                    title={`${tier.label}: ${tier.multiplier}x XP`}
                  >
                    <span className="font-pixel text-[10px] font-bold leading-none">
                      {tier.multiplier.toFixed(1)}x
                    </span>
                    <span className="font-mono text-[8px] leading-none opacity-80">
                      {tier.label}
                    </span>
                    {isActive && (
                      <span className="w-1 h-1 rounded-full bg-current mt-0.5 animate-pulse" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Bar */}
        <div className="pt-3 border-t-2 border-[#111113] flex items-center justify-between font-mono text-xs text-[#111113]">
          <div className="flex items-center gap-1.5 font-bold text-amber-700">
            <ShieldCheck className="w-4 h-4" />
            <span>{playerStats.gold} Gold Reward</span>
          </div>

          <button
            onClick={() => setShowRulesModal(true)}
            className="transition-colors underline text-[11px] text-[#111113] hover:text-amber-700"
          >
            Streak Rules
          </button>
        </div>

      </div>

      {/* Rules & Multiplier Info Modal */}
      {showRulesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
          <div className="max-w-md w-full p-5 border-2 border-[#111113] bg-white shadow-[4px_4px_0px_#000] space-y-4 font-mono text-xs relative text-[#111113]">
            <button
              onClick={() => setShowRulesModal(false)}
              className="absolute top-3 right-3 p-1 text-[#111113] hover:text-black"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 border-b-2 border-[#111113] pb-3">
              <Flame className="w-5 h-5 text-orange-500 animate-pulse" />
              <h3 className={`font-pixel text-sm font-bold uppercase tracking-wider ${
                isEink ? 'text-amber-900' : 'text-amber-400'
              }`}>
                Daily Streak & Multiplier Rules
              </h3>
            </div>

            <div className="space-y-2.5 leading-relaxed text-[11px] text-[#33322d]">
              <p>
                <strong className="text-[#111113]">1. Daily Activation:</strong> Complete at least 1 main, daily, or side quest each day before midnight to maintain your streak.
              </p>
              <p><strong className="text-[#111113]">2. XP Multipliers:</strong></p>
              {/* Tier table */}
              <div className="border-2 border-[#111113] overflow-hidden">
                {XP_TIERS.map((tier, i) => (
                  <div key={i} className={`flex items-center justify-between px-3 py-1.5 border-b border-[#111113] last:border-b-0 ${
                    getCurrentMultiplier(playerStats.streakDays) === tier.multiplier ? 'bg-amber-100 font-bold' : ''
                  }`}>
                    <span className="font-pixel text-[10px]">{tier.label}</span>
                    <span className={`font-pixel text-xs px-2 py-0.5 border border-[#111113] ${tier.color}`}>
                      {tier.multiplier.toFixed(2)}x
                    </span>
                  </div>
                ))}
              </div>
              <p>
                <strong className="text-[#111113]">3. Dot Markers:</strong> Amber dots mark days with completed quests. Today is highlighted in purple.
              </p>
            </div>

            <button
              onClick={() => setShowRulesModal(false)}
              className="w-full py-2 font-pixel font-bold text-xs uppercase tracking-wider transition-colors bg-[#111113] text-white hover:bg-amber-700"
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
