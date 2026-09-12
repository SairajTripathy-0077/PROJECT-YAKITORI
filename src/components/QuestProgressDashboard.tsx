import { useState, useMemo, type FC, type ReactNode } from 'react';
import { useGame } from '../context/GameContext';
import { SpriteCharacter } from './SpriteCharacter';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  RadarChart, 
  Radar, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { 
  TrendingUp, 
  Target, 
  Flame, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Brain, 
  Dumbbell, 
  Palette, 
  Heart, 
  ArrowLeft,
  Layers,
  Award,
  Dice5
} from 'lucide-react';
import type { AttributeType, QuestDifficulty, QuestType } from '../types/game';

interface QuestProgressDashboardProps {
  onBackToQuests?: () => void;
  onOpenCharacterCreation?: () => void;
}

// Custom Pixel styled Tooltip for Recharts (All text black)
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color?: string; fill?: string }>;
  label?: string;
  unit?: string;
}

const CustomPixelTooltip: FC<CustomTooltipProps> = ({ active, payload, label, unit = '' }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 border-2 shadow-pixel-md font-mono text-xs z-50 bg-[#f5f4ef] text-[#111113] border-[#18181c]">
        <p className="font-pixel font-bold text-sm mb-1.5 pb-1 border-b border-[#18181c] text-[#111113]">
          {label}
        </p>
        <div className="space-y-1">
          {payload.map((entry, index) => (
            <div key={`tooltip-item-${index}`} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-[#111113]">
                <span 
                  className="w-2.5 h-2.5 inline-block border border-black" 
                  style={{ backgroundColor: entry.color || entry.fill || '#18181c' }} 
                />
                <span className="capitalize text-[#111113]">{entry.name}:</span>
              </span>
              <span className="font-bold text-[#111113]">
                {entry.value.toLocaleString()} {unit}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export const QuestProgressDashboard: FC<QuestProgressDashboardProps> = ({ onBackToQuests, onOpenCharacterCreation }) => {
  const { quests, playerStats, attributes } = useGame();

  const [timeRange, setTimeRange] = useState<'7days' | '14days' | 'all'>('7days');
  const [activeTab, setActiveTab] = useState<'overview' | 'attributes' | 'breakdown'>('overview');

  // Chart theme tokens (all labels and axes black)
  const gridColor = '#18181c';
  const tickColor = '#111113';
  const axisColor = '#18181c';
  const radarGridColor = '#18181c';
  const radarTextColor = '#111113';

  // Core metrics calculation
  const totalQuests = quests.length;
  const completedQuests = quests.filter(q => q.completed).length;
  const activeQuests = totalQuests - completedQuests;
  const completionRate = totalQuests > 0 ? Math.round((completedQuests / totalQuests) * 100) : 0;

  // 1. Attribute Radar Data
  const attributeRadarData = useMemo(() => {
    const attrConfig: Record<AttributeType, { name: string; full: number; icon: string }> = {
      intellect: { name: 'Intellect', full: 100, icon: '🧠' },
      strength: { name: 'Strength', full: 100, icon: '⚔️' },
      creativity: { name: 'Creativity', full: 100, icon: '🎨' },
      vitality: { name: 'Vitality', full: 100, icon: '🍵' },
      discipline: { name: 'Discipline', full: 100, icon: '⏱️' },
    };

    return (Object.keys(attrConfig) as AttributeType[]).map(key => {
      const stat = attributes[key] || { level: 1, xp: 0, xpToNextLevel: 80 };
      const xpPercent = Math.min(100, Math.round((stat.xp / (stat.xpToNextLevel || 80)) * 100));
      return {
        subject: attrConfig[key].name,
        level: stat.level,
        xpPercent: xpPercent,
        fullMark: 100,
      };
    });
  }, [attributes]);

  // 2. Timeline Activity & XP Velocity Data
  const timelineData = useMemo(() => {
    const daysCount = timeRange === '7days' ? 7 : timeRange === '14days' ? 14 : 30;
    const daysArray: { dateStr: string; label: string; completedCount: number; xpEarned: number }[] = [];
    const now = new Date();

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayMonth = `${d.getMonth() + 1}/${d.getDate()}`;

      const questsOnDay = quests.filter(q => {
        if (!q.completed) return false;
        if (q.lastCompletedDate) return q.lastCompletedDate === dateStr;
        if (q.completedAt) {
          return new Date(q.completedAt).toISOString().split('T')[0] === dateStr;
        }
        return false;
      });

      const completedCount = questsOnDay.length;
      const xpEarned = questsOnDay.reduce((sum, q) => sum + (q.xpReward || 20), 0);

      daysArray.push({
        dateStr,
        label: `${dayName} ${dayMonth}`,
        completedCount,
        xpEarned,
      });
    }
    return daysArray;
  }, [quests, timeRange]);

  // 3. Quest Difficulty Breakdown Data
  const questDifficultyData = useMemo(() => {
    const diffs: Record<QuestDifficulty, { difficulty: string; completed: number; pending: number }> = {
      easy: { difficulty: 'Easy', completed: 0, pending: 0 },
      medium: { difficulty: 'Medium', completed: 0, pending: 0 },
      hard: { difficulty: 'Hard', completed: 0, pending: 0 },
      boss: { difficulty: 'Boss Tier', completed: 0, pending: 0 },
    };

    quests.forEach(q => {
      const dKey = q.difficulty || 'easy';
      if (diffs[dKey]) {
        if (q.completed) diffs[dKey].completed += 1;
        else diffs[dKey].pending += 1;
      }
    });

    return Object.values(diffs);
  }, [quests]);

  // 4. Quest Type Classification Share
  const questTypeData = useMemo(() => {
    const types: Record<QuestType, { name: string; value: number; color: string }> = {
      main: { name: 'Main Quests', value: 0, color: '#d97706' },
      daily: { name: 'Daily Habits', value: 0, color: '#059669' },
      side: { name: 'Side Quests', value: 0, color: '#4f46e5' },
    };

    quests.forEach(q => {
      if (types[q.questType]) {
        types[q.questType].value += 1;
      }
    });

    return Object.values(types).filter(item => item.value > 0);
  }, [quests]);

  // 5. Attribute XP Share Data
  const attributeShareData = useMemo(() => {
    const colors: Record<AttributeType, string> = {
      intellect: '#2563eb',
      strength: '#dc2626',
      creativity: '#9333ea',
      vitality: '#059669',
      discipline: '#d97706',
    };

    const labels: Record<AttributeType, string> = {
      intellect: 'Intellect',
      strength: 'Strength',
      creativity: 'Creativity',
      vitality: 'Vitality',
      discipline: 'Discipline',
    };

    return (Object.keys(attributes) as AttributeType[]).map(key => {
      const stat = attributes[key] || { level: 1, xp: 0 };
      const totalAttrXp = (stat.level - 1) * 80 + stat.xp;
      return {
        name: labels[key],
        value: Math.max(1, totalAttrXp),
        color: colors[key],
        level: stat.level,
      };
    });
  }, [attributes]);

  return (
    <div className="space-y-6 animate-fade-in pb-28 sm:pb-36 text-[#111113]">
      {/* Top Header Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b-2 border-[#18181c] pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-3">
          {onBackToQuests && (
            <button
              onClick={onBackToQuests}
              className="self-start px-3 py-1.5 sm:py-2 pixel-btn font-mono text-xs text-[#111113] inline-flex items-center gap-1.5 shrink-0 whitespace-nowrap active:scale-[0.96] transition-transform"
              title="Return to Quest Log"
            >
              <ArrowLeft className="w-4 h-4 text-[#111113] shrink-0" />
              <span className="font-bold text-[#111113] whitespace-nowrap">QUEST LOG</span>
            </button>
          )}
          <div>
            <h2 className="font-pixel text-base sm:text-xl md:text-2xl font-bold tracking-wider flex items-center gap-2 text-[#111113]">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-[#111113] shrink-0" />
              <span>QUEST PROGRESS & ANALYTICS</span>
            </h2>
            <p className="font-serif italic text-xs text-[#111113] mt-0.5">
              Real-time RPG progression telemetry, velocity trends, and attribute stats.
            </p>
          </div>
        </div>

        {/* View Tabs & Time Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex p-1 border-2 border-[#18181c] shadow-pixel-sm font-mono text-xs bg-[#ebeae4]">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1 font-bold transition-all active:scale-[0.96] ${
                activeTab === 'overview' 
                  ? 'bg-[#18181c] text-[#f5f4ef]' 
                  : 'text-[#111113] hover:bg-[#deddd6]'
              }`}
            >
              OVERVIEW
            </button>
            <button
              onClick={() => setActiveTab('attributes')}
              className={`px-3 py-1 font-bold transition-all active:scale-[0.96] ${
                activeTab === 'attributes' 
                  ? 'bg-[#18181c] text-[#f5f4ef]' 
                  : 'text-[#111113] hover:bg-[#deddd6]'
              }`}
            >
              ATTRIBUTES
            </button>
            <button
              onClick={() => setActiveTab('breakdown')}
              className={`px-3 py-1 font-bold transition-all active:scale-[0.96] ${
                activeTab === 'breakdown' 
                  ? 'bg-[#18181c] text-[#f5f4ef]' 
                  : 'text-[#111113] hover:bg-[#deddd6]'
              }`}
            >
              BREAKDOWN
            </button>
          </div>
        </div>
      </div>

      {/* Hero Character Identity & Origin Card */}
      <div className="double-bezel">
        <div className="double-bezel-inner p-5 border border-[#18181c] bg-[#ebeae4] text-[#111113] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {/* Assigned Sprite Avatar Display */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#f5f4ef] border-2 border-[#18181c] shadow-pixel flex items-center justify-center shrink-0 relative overflow-hidden">
              <SpriteCharacter index={playerStats.equippedCharacter ?? 0} size={64} alt="Assigned Hero Sprite" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-pixel text-lg sm:text-xl font-bold uppercase tracking-wider text-[#111113]">
                  {playerStats.name || 'Hero Adventurer'}
                </h3>
                <span className="font-mono text-xs px-2 py-0.5 border font-bold bg-[#f5f4ef] text-[#111113] border-[#18181c] tabular-nums">
                  Lv.{playerStats.level}
                </span>
                <span className="font-mono text-xs px-2 py-0.5 border font-bold bg-[#f5f4ef] text-[#111113] border-[#18181c]">
                  Class: {playerStats.characterClass || 'Warrior'}
                </span>
              </div>

              <div className="font-mono text-xs text-[#111113] font-bold flex items-center gap-2">
                <Award className="w-3.5 h-3.5 text-[#111113]" />
                <span>Title: "{playerStats.title || 'Pixel Knight'}"</span>
                <span>•</span>
                <span className="tabular-nums">{playerStats.xp} XP</span>
              </div>

              <p className="font-mono text-[11px] text-[#111113]">
                Assigned Sprite Avatar: <span className="font-bold text-[#111113]">#{(playerStats.equippedCharacter ?? 0) + 1} / 192</span>
              </p>
            </div>
          </div>

          {onOpenCharacterCreation && (
            <button
              onClick={onOpenCharacterCreation}
              className="px-4 py-2.5 pixel-btn font-pixel text-xs font-bold text-[#111113] uppercase tracking-wider flex items-center gap-2 shadow-pixel-sm active:scale-[0.96] transition-transform"
            >
              <Dice5 className="w-4 h-4 text-[#111113]" />
              <span>CUSTOMIZE / REROLL SPRITE</span>
            </button>
          )}
        </div>
      </div>

      {/* Top 4 Metric KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Completion Rate */}
        <div className="double-bezel h-full flex flex-col">
          <div className="double-bezel-inner p-3 sm:p-4 border border-[#18181c] bg-[#f5f4ef] text-[#111113] space-y-1 h-full flex flex-col justify-between flex-1">
            <div className="flex items-center justify-between text-[#111113]">
              <span className="font-mono text-[11px] sm:text-xs uppercase font-bold tracking-wider text-[#111113]">Completion Rate</span>
              <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#111113] shrink-0" />
            </div>
            <div className="font-pixel text-xl sm:text-2xl font-bold text-[#111113] my-1">
              {completionRate}%
            </div>
            <div className="font-mono text-[10px] sm:text-[11px] flex items-center justify-between text-[#111113]">
              <span>{completedQuests} of {totalQuests} done</span>
              <span className="font-bold text-[#111113]">★ Active</span>
            </div>
          </div>
        </div>

        {/* Metric 2: Total Quests Completed */}
        <div className="double-bezel h-full flex flex-col">
          <div className="double-bezel-inner p-3 sm:p-4 border border-[#18181c] bg-[#f5f4ef] text-[#111113] space-y-1 h-full flex flex-col justify-between flex-1">
            <div className="flex items-center justify-between text-[#111113]">
              <span className="font-mono text-[11px] sm:text-xs uppercase font-bold tracking-wider text-[#111113]">Completed Quests</span>
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#111113] shrink-0" />
            </div>
            <div className="font-pixel text-xl sm:text-2xl font-bold text-[#111113] my-1">
              {playerStats.totalCompletedQuests || completedQuests}
            </div>
            <div className="font-mono text-[10px] sm:text-[11px] text-[#111113]">
              <span>{activeQuests} remaining in log</span>
            </div>
          </div>
        </div>

        {/* Metric 3: Active Streak Multiplier */}
        <div className="double-bezel h-full flex flex-col">
          <div className="double-bezel-inner p-3 sm:p-4 border border-[#18181c] bg-[#f5f4ef] text-[#111113] space-y-1 h-full flex flex-col justify-between flex-1">
            <div className="flex items-center justify-between text-[#111113]">
              <span className="font-mono text-[11px] sm:text-xs uppercase font-bold tracking-wider text-[#111113]">Daily Streak</span>
              <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#111113] animate-pulse shrink-0" />
            </div>
            <div className="font-pixel text-xl sm:text-2xl font-bold flex items-baseline gap-1.5 text-[#111113] my-1">
              <span>{playerStats.streakDays}</span>
              <span className="text-xs font-mono text-[#111113] font-bold">{playerStats.streakDays === 1 ? 'DAY' : 'DAYS'}</span>
            </div>
            <div className="font-mono text-[10px] sm:text-[11px] text-[#111113] font-bold">
              <span>{playerStats.activeMultiplier}x XP Multiplier</span>
            </div>
          </div>
        </div>

        {/* Metric 4: Total XP Earned */}
        <div className="double-bezel h-full flex flex-col">
          <div className="double-bezel-inner p-3 sm:p-4 border border-[#18181c] bg-[#f5f4ef] text-[#111113] space-y-1 h-full flex flex-col justify-between flex-1">
            <div className="flex items-center justify-between text-[#111113]">
              <span className="font-mono text-[11px] sm:text-xs uppercase font-bold tracking-wider text-[#111113]">Hero Total XP</span>
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#111113] shrink-0" />
            </div>
            <div className="font-pixel text-xl sm:text-2xl font-bold text-[#111113] my-1">
              {(playerStats.totalXpEarned || playerStats.xp).toLocaleString()}
            </div>
            <div className="font-mono text-[10px] sm:text-[11px] text-[#111113]">
              <span>Level {playerStats.level} ({playerStats.title})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tab Views */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Main Hero Chart: Completion & XP Velocity Over Time */}
          <div className="double-bezel">
            <div className="double-bezel-inner p-5 border border-[#18181c] bg-[#f5f4ef] text-[#111113] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#18181c] pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-[#18181c] text-[#f5f4ef]">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-pixel text-sm font-bold uppercase tracking-wider text-[#111113]">
                      QUEST COMPLETION & XP VELOCITY
                    </h3>
                    <p className="font-mono text-[11px] text-[#111113]">
                      Animated daily quest outputs and accumulated rewards over time
                    </p>
                  </div>
                </div>

                {/* Range Filter */}
                <div className="flex items-center gap-1 font-mono text-xs p-1 border border-[#18181c] bg-[#ebeae4]">
                  <button
                    onClick={() => setTimeRange('7days')}
                    className={`px-2.5 py-0.5 font-bold ${
                      timeRange === '7days' 
                        ? 'bg-[#18181c] text-[#f5f4ef]'
                        : 'text-[#111113] hover:bg-[#deddd6]'
                    }`}
                  >
                    7D
                  </button>
                  <button
                    onClick={() => setTimeRange('14days')}
                    className={`px-2.5 py-0.5 font-bold ${
                      timeRange === '14days' 
                        ? 'bg-[#18181c] text-[#f5f4ef]'
                        : 'text-[#111113] hover:bg-[#deddd6]'
                    }`}
                  >
                    14D
                  </button>
                  <button
                    onClick={() => setTimeRange('all')}
                    className={`px-2.5 py-0.5 font-bold ${
                      timeRange === 'all' 
                        ? 'bg-[#18181c] text-[#f5f4ef]'
                        : 'text-[#111113] hover:bg-[#deddd6]'
                    }`}
                  >
                    30D
                  </button>
                </div>
              </div>

              {/* Recharts Area Chart */}
              <div className="w-full h-72 sm:h-80 pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="xpGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#d97706" stopOpacity={0.45} />
                        <stop offset="95%" stopColor="#d97706" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="questGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#059669" stopOpacity={0.45} />
                        <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis 
                      dataKey="label" 
                      tick={{ fill: tickColor, fontSize: 10, fontFamily: 'monospace', fontWeight: 'bold' }}
                      tickLine={{ stroke: axisColor }}
                      axisLine={{ stroke: axisColor, strokeWidth: 1.5 }}
                    />
                    <YAxis 
                      tick={{ fill: tickColor, fontSize: 10, fontFamily: 'monospace', fontWeight: 'bold' }}
                      tickLine={{ stroke: axisColor }}
                      axisLine={{ stroke: axisColor, strokeWidth: 1.5 }}
                      allowDecimals={false}
                    />
                    <Tooltip content={<CustomPixelTooltip unit="XP" />} />
                    <Legend 
                      verticalAlign="top" 
                      align="right"
                      wrapperStyle={{ paddingBottom: '10px', fontSize: '11px', fontFamily: 'monospace', color: '#111113' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="xpEarned" 
                      name="XP Earned" 
                      stroke="#d97706" 
                      strokeWidth={2.5}
                      fillOpacity={1} 
                      fill="url(#xpGradient)" 
                      animationDuration={1400}
                      animationEasing="ease-out"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="completedCount" 
                      name="Quests Done" 
                      stroke="#059669" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#questGradient)" 
                      animationDuration={1600}
                      animationEasing="ease-out"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Bottom Two-Column Split: Radar Attributes & Quest Type Share */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Attribute Pentagon / Radar Chart */}
            <div className="double-bezel">
              <div className="double-bezel-inner p-5 border border-[#18181c] bg-[#f5f4ef] text-[#111113] space-y-4">
                <div className="flex items-center justify-between border-b border-[#18181c] pb-3">
                  <div className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-[#111113]" />
                    <div>
                      <h4 className="font-pixel text-xs font-bold uppercase tracking-wider text-[#111113]">
                        5-ATTRIBUTE RPG RADAR
                      </h4>
                      <p className="font-mono text-[10px] text-[#111113]">
                        Balanced character progression across core domains
                      </p>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 border border-[#18181c] text-[#111113] bg-[#ebeae4]">
                    Pentagon Matrix
                  </span>
                </div>

                <div className="w-full h-64 sm:h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={attributeRadarData} outerRadius="75%">
                      <PolarGrid stroke={radarGridColor} strokeDasharray="2 2" />
                      <PolarAngleAxis 
                        dataKey="subject" 
                        tick={{ fill: radarTextColor, fontSize: 11, fontFamily: 'monospace', fontWeight: 700 }}
                      />
                      <PolarRadiusAxis 
                        angle={30} 
                        domain={[0, 100]} 
                        tick={{ fill: tickColor, fontSize: 9, fontFamily: 'monospace', fontWeight: 600 }}
                      />
                      <Radar 
                        name="XP Progress %" 
                        dataKey="xpPercent" 
                        stroke="#4f46e5" 
                        fill="#6366f1" 
                        fillOpacity={0.45} 
                        strokeWidth={2}
                        animationDuration={1500}
                        animationEasing="ease-out"
                      />
                      <Tooltip content={<CustomPixelTooltip unit="%" />} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Difficulty Breakdown Bar Chart */}
            <div className="double-bezel">
              <div className="double-bezel-inner p-5 border border-[#18181c] bg-[#f5f4ef] text-[#111113] space-y-4">
                <div className="flex items-center justify-between border-b border-[#18181c] pb-3">
                  <div className="flex items-center gap-2">
                    <Layers className="w-5 h-5 text-[#111113]" />
                    <div>
                      <h4 className="font-pixel text-xs font-bold uppercase tracking-wider text-[#111113]">
                        DIFFICULTY TIER BREAKDOWN
                      </h4>
                      <p className="font-mono text-[10px] text-[#111113]">
                        Completed vs Pending quests categorized by challenge tier
                      </p>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 border border-[#18181c] text-[#111113] bg-[#ebeae4]">
                    Tiers
                  </span>
                </div>

                <div className="w-full h-64 sm:h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={questDifficultyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                      <XAxis 
                        dataKey="difficulty" 
                        tick={{ fill: tickColor, fontSize: 10, fontFamily: 'monospace', fontWeight: 'bold' }}
                        tickLine={{ stroke: axisColor }}
                        axisLine={{ stroke: axisColor }}
                      />
                      <YAxis 
                        tick={{ fill: tickColor, fontSize: 10, fontFamily: 'monospace', fontWeight: 'bold' }}
                        tickLine={{ stroke: axisColor }}
                        axisLine={{ stroke: axisColor }}
                        allowDecimals={false}
                      />
                      <Tooltip content={<CustomPixelTooltip unit="Quests" />} />
                      <Legend 
                        verticalAlign="top" 
                        align="right" 
                        wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace', color: '#111113' }} 
                      />
                      <Bar 
                        dataKey="completed" 
                        name="Completed" 
                        fill="#059669" 
                        radius={[3, 3, 0, 0]} 
                        animationDuration={1300}
                      />
                      <Bar 
                        dataKey="pending" 
                        name="Pending" 
                        fill="#18181c" 
                        radius={[3, 3, 0, 0]} 
                        animationDuration={1500}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Attributes Deep Dive */}
      {activeTab === 'attributes' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Attribute Detail Cards */}
            {(['intellect', 'strength', 'creativity', 'vitality', 'discipline'] as AttributeType[]).map((attr) => {
              const stat = attributes[attr] || { level: 1, xp: 0, xpToNextLevel: 80 };
              const progressPct = Math.min(100, Math.round((stat.xp / (stat.xpToNextLevel || 80)) * 100));

              const icons: Record<AttributeType, ReactNode> = {
                intellect: <Brain className="w-5 h-5 text-[#111113]" />,
                strength: <Dumbbell className="w-5 h-5 text-[#111113]" />,
                creativity: <Palette className="w-5 h-5 text-[#111113]" />,
                vitality: <Heart className="w-5 h-5 text-[#111113]" />,
                discipline: <Clock className="w-5 h-5 text-[#111113]" />,
              };

              const descriptions: Record<AttributeType, string> = {
                intellect: 'Coding, studying, technical reading, and architectural research.',
                strength: 'Workouts, physical fitness, sports, and bodyweight exercises.',
                creativity: 'UI/UX design, writing, music, art, and creative brainstorming.',
                vitality: 'Hydration, meditation, restorative sleep, and nutritional health.',
                discipline: 'Deep work sessions, habit consistency, workspace organization.',
              };

              return (
                <div key={attr} className="double-bezel">
                  <div className="double-bezel-inner p-5 border border-[#18181c] bg-[#f5f4ef] text-[#111113] space-y-4">
                    <div className="flex items-center justify-between border-b border-[#18181c] pb-2">
                      <div className="flex items-center gap-2">
                        {icons[attr]}
                        <span className="font-pixel text-sm font-bold uppercase tracking-wider text-[#111113]">
                          {attr}
                        </span>
                      </div>
                      <span className="font-pixel text-xs font-bold px-2 py-0.5 border border-[#18181c] bg-[#ebeae4] text-[#111113]">
                        Lv.{stat.level}
                      </span>
                    </div>

                    <p className="font-serif italic text-xs min-h-[32px] text-[#111113]">
                      {descriptions[attr]}
                    </p>

                    <div className="space-y-1.5 font-mono text-xs">
                      <div className="flex justify-between text-[11px] text-[#111113]">
                        <span>Level Progress:</span>
                        <span className="font-bold text-[#111113]">{stat.xp} / {stat.xpToNextLevel || 80} XP ({progressPct}%)</span>
                      </div>
                      <div className="w-full h-3 border border-[#18181c] bg-[#d9d8d2] overflow-hidden">
                        <div 
                          className="h-full bg-[#18181c] transition-all duration-700" 
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* XP Distribution Pie Chart Card */}
            <div className="double-bezel">
              <div className="double-bezel-inner p-5 border border-[#18181c] bg-[#f5f4ef] text-[#111113] space-y-2 flex flex-col justify-between">
                <div>
                  <h4 className="font-pixel text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-[#111113]">
                    <Award className="w-4 h-4 text-[#111113]" />
                    <span>XP SHARE BY ATTRIBUTE</span>
                  </h4>
                  <p className="font-mono text-[10px] text-[#111113]">
                    Proportion of lifetime XP accumulated across all 5 stats
                  </p>
                </div>

                <div className="w-full h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={attributeShareData}
                        cx="50%"
                        cy="50%"
                        innerRadius={38}
                        outerRadius={65}
                        paddingAngle={4}
                        dataKey="value"
                        animationDuration={1400}
                      >
                        {attributeShareData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke={axisColor} strokeWidth={1.5} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomPixelTooltip unit="XP" />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-2 gap-1 font-mono text-[10px]">
                  {attributeShareData.map(item => (
                    <div key={item.name} className="flex items-center gap-1.5 text-[#111113]">
                      <span className="w-2.5 h-2.5 border border-black" style={{ backgroundColor: item.color }} />
                      <span className="truncate text-[#111113]">{item.name} (Lv.{item.level})</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Breakdown (Quest Types & Habits) */}
      {activeTab === 'breakdown' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quest Type Ratio Pie */}
          <div className="double-bezel">
            <div className="double-bezel-inner p-5 border border-[#18181c] bg-[#f5f4ef] text-[#111113] space-y-4">
              <div className="flex items-center justify-between border-b border-[#18181c] pb-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-[#111113]" />
                  <div>
                    <h4 className="font-pixel text-xs font-bold uppercase tracking-wider text-[#111113]">
                      QUEST CLASSIFICATION SHARE
                    </h4>
                    <p className="font-mono text-[10px] text-[#111113]">
                      Main Quests vs Daily Habits vs Side Quests
                    </p>
                  </div>
                </div>
              </div>

              <div className="w-full h-64">
                {questTypeData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={questTypeData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        innerRadius={45}
                        paddingAngle={5}
                        dataKey="value"
                        animationDuration={1500}
                      >
                        {questTypeData.map((entry, index) => (
                          <Cell key={`type-cell-${index}`} fill={entry.color} stroke={axisColor} strokeWidth={2} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomPixelTooltip unit="Quests" />} />
                      <Legend 
                        verticalAlign="bottom" 
                        wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace', color: '#111113' }} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 font-mono text-xs text-[#111113]">
                    <p className="font-pixel text-sm mb-1 text-[#111113]">
                      NO ACTIVE QUESTS LOGGED
                    </p>
                    <p className="text-[#111113]">Create new quests to populate classification charts!</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Habit & Consistency Milestones */}
          <div className="double-bezel">
            <div className="double-bezel-inner p-5 border border-[#18181c] bg-[#f5f4ef] text-[#111113] space-y-4">
              <div className="flex items-center justify-between border-b border-[#18181c] pb-3">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-[#111113] animate-pulse" />
                  <div>
                    <h4 className="font-pixel text-xs font-bold uppercase tracking-wider text-[#111113]">
                      MILESTONES & STREAK ACCUMULATOR
                    </h4>
                    <p className="font-mono text-[10px] text-[#111113]">
                      Progress toward key RPG accomplishments
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 font-mono text-xs text-[#111113]">
                {/* Milestone 1 */}
                <div className="p-3 border border-[#18181c] bg-[#ebeae4] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">⚔️</span>
                    <div>
                      <div className="font-bold text-[#111113]">First Quest Completed</div>
                      <div className="text-[10px] text-[#111113]">Begin your journey as an adventurer</div>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 font-pixel text-[10px] font-bold border border-[#18181c] ${
                    completedQuests >= 1 ? 'bg-[#18181c] text-[#f5f4ef]' : 'bg-[#deddd6] text-[#111113]'
                  }`}>
                    {completedQuests >= 1 ? 'UNLOCKED' : 'LOCKED'}
                  </span>
                </div>

                {/* Milestone 2 */}
                <div className="p-3 border border-[#18181c] bg-[#ebeae4] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">🔥</span>
                    <div>
                      <div className="font-bold text-[#111113]">3-Day Habit Streak</div>
                      <div className="text-[10px] text-[#111113]">Attain a 1.30x XP Multiplier</div>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 font-pixel text-[10px] font-bold border border-[#18181c] ${
                    playerStats.streakDays >= 3 ? 'bg-[#18181c] text-[#f5f4ef]' : 'bg-[#deddd6] text-[#111113]'
                  }`}>
                    {playerStats.streakDays >= 3 ? 'UNLOCKED' : `${playerStats.streakDays}/3 DAYS`}
                  </span>
                </div>

                {/* Milestone 3 */}
                <div className="p-3 border border-[#18181c] bg-[#ebeae4] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">👑</span>
                    <div>
                      <div className="font-bold text-[#111113]">Level 5 Veteran Ascendance</div>
                      <div className="text-[10px] text-[#111113]">Reach hero level 5 milestone</div>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 font-pixel text-[10px] font-bold border border-[#18181c] ${
                    playerStats.level >= 5 ? 'bg-[#18181c] text-[#f5f4ef]' : 'bg-[#deddd6] text-[#111113]'
                  }`}>
                    {playerStats.level >= 5 ? 'UNLOCKED' : `Lv.${playerStats.level}/5`}
                  </span>
                </div>

                {/* Milestone 4 */}
                <div className="p-3 border border-[#18181c] bg-[#ebeae4] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">💀</span>
                    <div>
                      <div className="font-bold text-[#111113]">Boss Tier Conquered</div>
                      <div className="text-[10px] text-[#111113]">Slay at least 1 Boss quest</div>
                    </div>
                  </div>
                  {(() => {
                    const bossDone = quests.some(q => q.difficulty === 'boss' && q.completed);
                    return (
                      <span className={`px-2 py-0.5 font-pixel text-[10px] font-bold border border-[#18181c] ${
                        bossDone ? 'bg-[#18181c] text-[#f5f4ef]' : 'bg-[#deddd6] text-[#111113]'
                      }`}>
                        {bossDone ? 'UNLOCKED' : 'LOCKED'}
                      </span>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default QuestProgressDashboard;
