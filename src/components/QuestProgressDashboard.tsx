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


// Custom Pixel styled Tooltip for Recharts (Theme Reactive)
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color?: string; fill?: string }>;
  label?: string;
  unit?: string;
  isEink?: boolean;
}

const CustomPixelTooltip: FC<CustomTooltipProps> = ({ active, payload, label, unit = '', isEink = false }) => {
  if (active && payload && payload.length) {
    return (
      <div className={`p-3 border-2 shadow-pixel-md font-mono text-xs z-50 ${
        isEink ? 'bg-[#f5f4ef] text-[#111113] border-[#18181c]' : 'bg-[#18181c] text-[#f5f4ef] border-amber-500'
      }`}>
        <p className={`font-pixel font-bold text-sm mb-1.5 pb-1 border-b ${
          isEink ? 'text-amber-900 border-[#18181c]' : 'text-amber-400 border-[#33322d]'
        }`}>
          {label}
        </p>
        <div className="space-y-1">
          {payload.map((entry, index) => (
            <div key={`tooltip-item-${index}`} className="flex items-center justify-between gap-4">
              <span className={`flex items-center gap-1.5 ${isEink ? 'text-[#33322d]' : 'text-zinc-300'}`}>
                <span 
                  className="w-2.5 h-2.5 inline-block border border-black" 
                  style={{ backgroundColor: entry.color || entry.fill || '#f59e0b' }} 
                />
                <span className="capitalize">{entry.name}:</span>
              </span>
              <span className={`font-bold ${isEink ? 'text-[#111113]' : 'text-[#f5f4ef]'}`}>
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
  const { quests, playerStats, attributes, theme } = useGame();
  const isEink = theme === 'eink';

  const [timeRange, setTimeRange] = useState<'7days' | '14days' | 'all'>('7days');
  const [activeTab, setActiveTab] = useState<'overview' | 'attributes' | 'breakdown'>('overview');

  // Chart theme tokens
  const gridColor = isEink ? '#dcdbd5' : '#33322d';
  const tickColor = isEink ? '#4a4943' : '#a1a1aa';
  const axisColor = isEink ? '#18181c' : '#52525b';
  const radarGridColor = isEink ? '#b5b3a9' : '#3f3f46';
  const radarTextColor = isEink ? '#111113' : '#f5f4ef';

  // Core metrics calculation
  const totalQuests = quests.length;
  const completedQuests = quests.filter(q => q.completed).length;
  const activeQuests = totalQuests - completedQuests;
  const completionRate = totalQuests > 0 ? Math.round((completedQuests / totalQuests) * 100) : 0;

  // 1. Attribute Radar Data (Intellect, Strength, Creativity, Vitality, Discipline)
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

      const dayXp = questsOnDay.reduce((acc, curr) => acc + (curr.xpReward || 0), 0);

      daysArray.push({
        dateStr,
        label: `${dayName} ${dayMonth}`,
        completedCount: questsOnDay.length,
        xpEarned: dayXp,
      });
    }

    return daysArray;
  }, [quests, timeRange]);

  // 3. Quest Difficulty Breakdown Data
  const questDifficultyData = useMemo(() => {
    const tiers: Record<QuestDifficulty, { label: string; completed: number; pending: number; color: string }> = {
      easy: { label: 'Novice (Easy)', completed: 0, pending: 0, color: isEink ? '#059669' : '#10b981' },
      medium: { label: 'Adept (Medium)', completed: 0, pending: 0, color: isEink ? '#d97706' : '#f59e0b' },
      hard: { label: 'Master (Hard)', completed: 0, pending: 0, color: isEink ? '#dc2626' : '#ef4444' },
      boss: { label: 'Legendary (Boss)', completed: 0, pending: 0, color: isEink ? '#7c3aed' : '#8b5cf6' },
    };

    quests.forEach(q => {
      const tier = tiers[q.difficulty] || tiers.medium;
      if (q.completed) {
        tier.completed += 1;
      } else {
        tier.pending += 1;
      }
    });

    return Object.keys(tiers).map(k => {
      const t = tiers[k as QuestDifficulty];
      return {
        difficulty: t.label,
        completed: t.completed,
        pending: t.pending,
        total: t.completed + t.pending,
        color: t.color,
      };
    });
  }, [quests, isEink]);

  // 4. Quest Type Distribution Data
  const questTypeData = useMemo(() => {
    const types: Record<QuestType, { name: string; value: number; color: string }> = {
      main: { name: 'Main Quests', value: 0, color: isEink ? '#d97706' : '#f59e0b' },
      daily: { name: 'Daily Habits', value: 0, color: isEink ? '#059669' : '#10b981' },
      side: { name: 'Side Quests', value: 0, color: isEink ? '#4f46e5' : '#6366f1' },
    };

    quests.forEach(q => {
      if (types[q.questType]) {
        types[q.questType].value += 1;
      }
    });

    return Object.values(types).filter(item => item.value > 0);
  }, [quests, isEink]);

  // 5. Attribute XP Share Data for Pie
  const attributeShareData = useMemo(() => {
    const colors: Record<AttributeType, string> = {
      intellect: '#3b82f6',
      strength: '#ef4444',
      creativity: '#a855f7',
      vitality: '#10b981',
      discipline: '#f5f4ef',
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
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Header Navigation */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 pb-4 ${
        isEink ? 'border-[#18181c]' : 'border-[#33322d]'
      }`}>
        <div className="flex items-center gap-3">
          {onBackToQuests && (
            <button
              onClick={onBackToQuests}
              className="px-3 py-2 pixel-btn font-mono text-xs flex items-center gap-1.5 active:scale-[0.96] transition-transform"
              title="Return to Quest Log"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-bold">QUEST LOG</span>
            </button>
          )}
          <div>
            <h2 className={`font-pixel text-xl sm:text-2xl font-bold tracking-wider flex items-center gap-2 text-wrap-balance ${
              isEink ? 'text-[#111113]' : 'text-[#f5f4ef]'
            }`}>
              <TrendingUp className={`w-6 h-6 ${isEink ? 'text-amber-800' : 'text-amber-500'}`} />
              <span>QUEST PROGRESS & ANALYTICS</span>
            </h2>
            <p className={`font-serif italic text-xs text-wrap-pretty ${isEink ? 'text-[#4a4943]' : 'text-zinc-400'}`}>
              Real-time RPG progression telemetry, velocity trends, and attribute stats.
            </p>
          </div>
        </div>

        {/* View Tabs & Time Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className={`flex p-1 border shadow-pixel-sm font-mono text-xs ${
            isEink ? 'bg-[#ebeae4] border-[#18181c]' : 'bg-[#212026] border-[#33322d]'
          }`}>
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1 font-bold transition-all active:scale-[0.96] ${
                activeTab === 'overview' 
                  ? isEink ? 'bg-[#18181c] text-[#f5f4ef]' : 'bg-[#f5f4ef] text-[#111113]' 
                  : isEink ? 'text-[#33322d] hover:bg-[#deddd6]' : 'text-zinc-300 hover:bg-[#2e2d36]'
              }`}
            >
              OVERVIEW
            </button>
            <button
              onClick={() => setActiveTab('attributes')}
              className={`px-3 py-1 font-bold transition-all active:scale-[0.96] ${
                activeTab === 'attributes' 
                  ? isEink ? 'bg-[#18181c] text-[#f5f4ef]' : 'bg-[#f5f4ef] text-[#111113]' 
                  : isEink ? 'text-[#33322d] hover:bg-[#deddd6]' : 'text-zinc-300 hover:bg-[#2e2d36]'
              }`}
            >
              ATTRIBUTES
            </button>
            <button
              onClick={() => setActiveTab('breakdown')}
              className={`px-3 py-1 font-bold transition-all active:scale-[0.96] ${
                activeTab === 'breakdown' 
                  ? isEink ? 'bg-[#18181c] text-[#f5f4ef]' : 'bg-[#f5f4ef] text-[#111113]' 
                  : isEink ? 'text-[#33322d] hover:bg-[#deddd6]' : 'text-zinc-300 hover:bg-[#2e2d36]'
              }`}
            >
              BREAKDOWN
            </button>
          </div>
        </div>
      </div>

      {/* Hero Character Identity & Origin Card */}
      <div className="double-bezel">
        <div className={`double-bezel-inner p-5 border flex flex-col md:flex-row items-start md:items-center justify-between gap-6 ${
          isEink ? 'bg-[#ebeae4] text-[#111113] border-[#18181c]' : 'bg-[#18181c] text-[#f5f4ef] border-[#33322d]'
        }`}>
          <div className="flex items-center gap-4">
            {/* Assigned Sprite Avatar Display */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#f5f4ef] border-2 border-[#18181c] shadow-pixel flex items-center justify-center shrink-0 relative overflow-hidden">
              <SpriteCharacter index={playerStats.equippedCharacter ?? 0} size={64} alt="Assigned Hero Sprite" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-pixel text-lg sm:text-xl font-bold uppercase tracking-wider text-amber-500">
                  {playerStats.name || 'Hero Adventurer'}
                </h3>
                <span className="font-mono text-xs px-2 py-0.5 border font-bold bg-amber-500/10 text-amber-500 border-amber-500/30 tabular-nums">
                  Lv.{playerStats.level}
                </span>
                <span className={`font-mono text-xs px-2 py-0.5 border font-bold ${
                  isEink ? 'bg-[#f5f4ef] text-[#111113] border-[#18181c]' : 'bg-[#26252a] text-zinc-300 border-zinc-700'
                }`}>
                  Class: {playerStats.characterClass || 'Warrior'}
                </span>
              </div>

              <div className="font-mono text-xs text-amber-600 font-bold flex items-center gap-2">
                <Award className="w-3.5 h-3.5" />
                <span>Title: "{playerStats.title || 'Pixel Knight'}"</span>
                <span>•</span>
                <span className="tabular-nums">{playerStats.xp} XP</span>
              </div>

              <p className={`font-mono text-[11px] ${isEink ? 'text-[#4a4943]' : 'text-zinc-400'}`}>
                Assigned Sprite Avatar: <span className="font-bold text-amber-500">#{(playerStats.equippedCharacter ?? 0) + 1} / 192</span>
              </p>
            </div>
          </div>

          {onOpenCharacterCreation && (
            <button
              onClick={onOpenCharacterCreation}
              className="px-4 py-2.5 pixel-btn font-pixel text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-pixel-sm active:scale-[0.96] transition-transform"
            >
              <Dice5 className="w-4 h-4 text-amber-500" />
              <span>CUSTOMIZE / REROLL SPRITE</span>
            </button>
          )}
        </div>
      </div>

      {/* Top 4 Metric KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Metric 1: Completion Rate */}
        <div className="double-bezel">
          <div className={`double-bezel-inner p-4 border space-y-1 ${
            isEink ? 'bg-[#f5f4ef] text-[#111113] border-[#18181c]' : 'bg-[#18181c] text-[#f5f4ef] border-[#33322d]'
          }`}>
            <div className={`flex items-center justify-between ${isEink ? 'text-[#4a4943]' : 'text-zinc-400'}`}>
              <span className="font-mono text-xs uppercase font-bold tracking-wider">Completion Rate</span>
              <Target className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="font-pixel text-2xl font-bold">
              {completionRate}%
            </div>
            <div className={`font-mono text-[11px] flex items-center justify-between ${isEink ? 'text-[#4a4943]' : 'text-zinc-400'}`}>
              <span>{completedQuests} of {totalQuests} done</span>
              <span className="text-emerald-500 font-bold">★ Active</span>
            </div>
          </div>
        </div>

        {/* Metric 2: Total Quests Completed */}
        <div className="double-bezel">
          <div className={`double-bezel-inner p-4 border space-y-1 ${
            isEink ? 'bg-[#f5f4ef] text-[#111113] border-[#18181c]' : 'bg-[#18181c] text-[#f5f4ef] border-[#33322d]'
          }`}>
            <div className={`flex items-center justify-between ${isEink ? 'text-[#4a4943]' : 'text-zinc-400'}`}>
              <span className="font-mono text-xs uppercase font-bold tracking-wider">Completed Quests</span>
              <CheckCircle2 className="w-4 h-4 text-amber-500" />
            </div>
            <div className="font-pixel text-2xl font-bold">
              {playerStats.totalCompletedQuests || completedQuests}
            </div>
            <div className={`font-mono text-[11px] ${isEink ? 'text-[#4a4943]' : 'text-zinc-400'}`}>
              <span>{activeQuests} remaining in log</span>
            </div>
          </div>
        </div>

        {/* Metric 3: Active Streak Multiplier */}
        <div className="double-bezel">
          <div className={`double-bezel-inner p-4 border space-y-1 ${
            isEink ? 'bg-[#f5f4ef] text-[#111113] border-[#18181c]' : 'bg-[#18181c] text-[#f5f4ef] border-[#33322d]'
          }`}>
            <div className={`flex items-center justify-between ${isEink ? 'text-[#4a4943]' : 'text-zinc-400'}`}>
              <span className="font-mono text-xs uppercase font-bold tracking-wider">Daily Streak</span>
              <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
            </div>
            <div className="font-pixel text-2xl font-bold flex items-baseline gap-1.5">
              <span>{playerStats.streakDays}</span>
              <span className="text-xs font-mono text-orange-500 font-semibold">{playerStats.streakDays === 1 ? 'DAY' : 'DAYS'}</span>
            </div>
            <div className="font-mono text-[11px] text-amber-500 font-bold">
              <span>{playerStats.activeMultiplier}x XP Multiplier</span>
            </div>
          </div>
        </div>

        {/* Metric 4: Total XP Earned */}
        <div className="double-bezel">
          <div className={`double-bezel-inner p-4 border space-y-1 ${
            isEink ? 'bg-[#f5f4ef] text-[#111113] border-[#18181c]' : 'bg-[#18181c] text-[#f5f4ef] border-[#33322d]'
          }`}>
            <div className={`flex items-center justify-between ${isEink ? 'text-[#4a4943]' : 'text-zinc-400'}`}>
              <span className="font-mono text-xs uppercase font-bold tracking-wider">Hero Total XP</span>
              <Sparkles className="w-4 h-4 text-purple-500" />
            </div>
            <div className="font-pixel text-2xl font-bold">
              {(playerStats.totalXpEarned || playerStats.xp).toLocaleString()}
            </div>
            <div className={`font-mono text-[11px] ${isEink ? 'text-[#4a4943]' : 'text-zinc-400'}`}>
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
            <div className={`double-bezel-inner p-5 border space-y-4 ${
              isEink ? 'bg-[#f5f4ef] text-[#111113] border-[#18181c]' : 'bg-[#18181c] text-[#f5f4ef] border-[#33322d]'
            }`}>
              <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3 ${
                isEink ? 'border-[#18181c]' : 'border-[#33322d]'
              }`}>
                <div className="flex items-center gap-2">
                  <div className={`p-2 ${isEink ? 'bg-[#18181c] text-amber-400' : 'bg-[#26252a] text-amber-400'}`}>
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-pixel text-sm font-bold uppercase tracking-wider">
                      QUEST COMPLETION & XP VELOCITY
                    </h3>
                    <p className={`font-mono text-[11px] ${isEink ? 'text-[#4a4943]' : 'text-zinc-400'}`}>
                      Animated daily quest outputs and accumulated rewards over time
                    </p>
                  </div>
                </div>

                {/* Range Filter */}
                <div className={`flex items-center gap-1 font-mono text-xs p-1 border ${
                  isEink ? 'bg-[#ebeae4] border-[#18181c]' : 'bg-[#212026] border-[#33322d]'
                }`}>
                  <button
                    onClick={() => setTimeRange('7days')}
                    className={`px-2.5 py-0.5 font-bold ${
                      timeRange === '7days' 
                        ? isEink ? 'bg-[#18181c] text-[#f5f4ef]' : 'bg-[#f5f4ef] text-[#111113]'
                        : isEink ? 'text-[#4a4943]' : 'text-zinc-400'
                    }`}
                  >
                    7D
                  </button>
                  <button
                    onClick={() => setTimeRange('14days')}
                    className={`px-2.5 py-0.5 font-bold ${
                      timeRange === '14days' 
                        ? isEink ? 'bg-[#18181c] text-[#f5f4ef]' : 'bg-[#f5f4ef] text-[#111113]'
                        : isEink ? 'text-[#4a4943]' : 'text-zinc-400'
                    }`}
                  >
                    14D
                  </button>
                  <button
                    onClick={() => setTimeRange('all')}
                    className={`px-2.5 py-0.5 font-bold ${
                      timeRange === 'all' 
                        ? isEink ? 'bg-[#18181c] text-[#f5f4ef]' : 'bg-[#f5f4ef] text-[#111113]'
                        : isEink ? 'text-[#4a4943]' : 'text-zinc-400'
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
                        <stop offset="5%" stopColor={isEink ? '#d97706' : '#f59e0b'} stopOpacity={0.45} />
                        <stop offset="95%" stopColor={isEink ? '#d97706' : '#f59e0b'} stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="questGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={isEink ? '#059669' : '#10b981'} stopOpacity={0.45} />
                        <stop offset="95%" stopColor={isEink ? '#059669' : '#10b981'} stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis 
                      dataKey="label" 
                      tick={{ fill: tickColor, fontSize: 10, fontFamily: 'monospace' }}
                      tickLine={{ stroke: axisColor }}
                      axisLine={{ stroke: axisColor, strokeWidth: 1.5 }}
                    />
                    <YAxis 
                      tick={{ fill: tickColor, fontSize: 10, fontFamily: 'monospace' }}
                      tickLine={{ stroke: axisColor }}
                      axisLine={{ stroke: axisColor, strokeWidth: 1.5 }}
                      allowDecimals={false}
                    />
                    <Tooltip content={<CustomPixelTooltip unit="XP" isEink={isEink} />} />
                    <Legend 
                      verticalAlign="top" 
                      align="right"
                      wrapperStyle={{ paddingBottom: '10px', fontSize: '11px', fontFamily: 'monospace' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="xpEarned" 
                      name="XP Earned" 
                      stroke={isEink ? '#d97706' : '#f59e0b'} 
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
                      stroke={isEink ? '#059669' : '#10b981'} 
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
              <div className={`double-bezel-inner p-5 border space-y-4 ${
                isEink ? 'bg-[#f5f4ef] text-[#111113] border-[#18181c]' : 'bg-[#18181c] text-[#f5f4ef] border-[#33322d]'
              }`}>
                <div className={`flex items-center justify-between border-b pb-3 ${
                  isEink ? 'border-[#18181c]' : 'border-[#33322d]'
                }`}>
                  <div className="flex items-center gap-2">
                    <Brain className={`w-5 h-5 ${isEink ? 'text-indigo-700' : 'text-indigo-400'}`} />
                    <div>
                      <h4 className="font-pixel text-xs font-bold uppercase tracking-wider">
                        5-ATTRIBUTE RPG RADAR
                      </h4>
                      <p className={`font-mono text-[10px] ${isEink ? 'text-[#4a4943]' : 'text-zinc-400'}`}>
                        Balanced character progression across core domains
                      </p>
                    </div>
                  </div>
                  <span className={`font-mono text-xs font-bold px-2 py-0.5 border ${
                    isEink ? 'text-indigo-800 bg-indigo-50 border-indigo-200' : 'text-indigo-300 bg-indigo-950/60 border-indigo-800'
                  }`}>
                    Pentagon Matrix
                  </span>
                </div>

                <div className="w-full h-64 sm:h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={attributeRadarData} outerRadius="75%">
                      <PolarGrid stroke={radarGridColor} strokeDasharray="2 2" />
                      <PolarAngleAxis 
                        dataKey="subject" 
                        tick={{ fill: radarTextColor, fontSize: 11, fontFamily: 'monospace', fontWeight: 600 }}
                      />
                      <PolarRadiusAxis 
                        angle={30} 
                        domain={[0, 100]} 
                        tick={{ fill: tickColor, fontSize: 9, fontFamily: 'monospace' }}
                      />
                      <Radar 
                        name="XP Progress %" 
                        dataKey="xpPercent" 
                        stroke={isEink ? '#4f46e5' : '#818cf8'} 
                        fill={isEink ? '#6366f1' : '#6366f1'} 
                        fillOpacity={0.45} 
                        strokeWidth={2}
                        animationDuration={1500}
                        animationEasing="ease-out"
                      />
                      <Tooltip content={<CustomPixelTooltip unit="%" isEink={isEink} />} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Difficulty Breakdown Bar Chart */}
            <div className="double-bezel">
              <div className={`double-bezel-inner p-5 border space-y-4 ${
                isEink ? 'bg-[#f5f4ef] text-[#111113] border-[#18181c]' : 'bg-[#18181c] text-[#f5f4ef] border-[#33322d]'
              }`}>
                <div className={`flex items-center justify-between border-b pb-3 ${
                  isEink ? 'border-[#18181c]' : 'border-[#33322d]'
                }`}>
                  <div className="flex items-center gap-2">
                    <Layers className={`w-5 h-5 ${isEink ? 'text-amber-800' : 'text-amber-400'}`} />
                    <div>
                      <h4 className="font-pixel text-xs font-bold uppercase tracking-wider">
                        DIFFICULTY TIER BREAKDOWN
                      </h4>
                      <p className={`font-mono text-[10px] ${isEink ? 'text-[#4a4943]' : 'text-zinc-400'}`}>
                        Completed vs Pending quests categorized by challenge tier
                      </p>
                    </div>
                  </div>
                  <span className={`font-mono text-xs font-bold px-2 py-0.5 border ${
                    isEink ? 'text-amber-900 bg-amber-50 border-amber-200' : 'text-amber-300 bg-amber-950/60 border-amber-800'
                  }`}>
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
                        tick={{ fill: tickColor, fontSize: 10, fontFamily: 'monospace' }}
                        tickLine={{ stroke: axisColor }}
                        axisLine={{ stroke: axisColor }}
                        allowDecimals={false}
                      />
                      <Tooltip content={<CustomPixelTooltip unit="Quests" isEink={isEink} />} />
                      <Legend 
                        verticalAlign="top" 
                        align="right" 
                        wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} 
                      />
                      <Bar 
                        dataKey="completed" 
                        name="Completed" 
                        fill={isEink ? '#059669' : '#10b981'} 
                        radius={[3, 3, 0, 0]} 
                        animationDuration={1300}
                      />
                      <Bar 
                        dataKey="pending" 
                        name="Pending" 
                        fill={isEink ? '#18181c' : '#52525b'} 
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
                intellect: <Brain className={`w-5 h-5 ${isEink ? 'text-blue-700' : 'text-blue-400'}`} />,
                strength: <Dumbbell className={`w-5 h-5 ${isEink ? 'text-red-700' : 'text-red-400'}`} />,
                creativity: <Palette className={`w-5 h-5 ${isEink ? 'text-purple-700' : 'text-purple-400'}`} />,
                vitality: <Heart className={`w-5 h-5 ${isEink ? 'text-emerald-700' : 'text-emerald-400'}`} />,
                discipline: <Clock className={`w-5 h-5 ${isEink ? 'text-amber-700' : 'text-amber-400'}`} />,
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
                  <div className={`double-bezel-inner p-5 border space-y-4 ${
                    isEink ? 'bg-[#f5f4ef] text-[#111113] border-[#18181c]' : 'bg-[#18181c] text-[#f5f4ef] border-[#33322d]'
                  }`}>
                    <div className={`flex items-center justify-between border-b pb-2 ${
                      isEink ? 'border-[#18181c]' : 'border-[#33322d]'
                    }`}>
                      <div className="flex items-center gap-2">
                        {icons[attr]}
                        <span className="font-pixel text-sm font-bold uppercase tracking-wider">
                          {attr}
                        </span>
                      </div>
                      <span className={`font-pixel text-xs font-bold px-2 py-0.5 border ${
                        isEink ? 'bg-[#ebeae4] border-[#18181c] text-amber-900' : 'bg-[#26252a] border-[#3c3a42] text-amber-400'
                      }`}>
                        Lv.{stat.level}
                      </span>
                    </div>

                    <p className={`font-serif italic text-xs min-h-[32px] ${
                      isEink ? 'text-[#4a4943]' : 'text-zinc-400'
                    }`}>
                      {descriptions[attr]}
                    </p>

                    <div className="space-y-1.5 font-mono text-xs">
                      <div className={`flex justify-between text-[11px] ${isEink ? 'text-[#4a4943]' : 'text-zinc-400'}`}>
                        <span>Level Progress:</span>
                        <span className={`font-bold ${isEink ? 'text-[#111113]' : 'text-[#f5f4ef]'}`}>{stat.xp} / {stat.xpToNextLevel || 80} XP ({progressPct}%)</span>
                      </div>
                      <div className={`w-full h-3 border overflow-hidden ${
                        isEink ? 'bg-[#d9d8d2] border-[#18181c]' : 'bg-[#26252a] border-[#33322d]'
                      }`}>
                        <div 
                          className="h-full bg-amber-600 transition-all duration-700" 
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
              <div className={`double-bezel-inner p-5 border space-y-2 flex flex-col justify-between ${
                isEink ? 'bg-[#f5f4ef] text-[#111113] border-[#18181c]' : 'bg-[#18181c] text-[#f5f4ef] border-[#33322d]'
              }`}>
                <div>
                  <h4 className="font-pixel text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-500" />
                    <span>XP SHARE BY ATTRIBUTE</span>
                  </h4>
                  <p className={`font-mono text-[10px] ${isEink ? 'text-[#4a4943]' : 'text-zinc-400'}`}>
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
                      <Tooltip content={<CustomPixelTooltip unit="XP" isEink={isEink} />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-2 gap-1 font-mono text-[10px]">
                  {attributeShareData.map(item => (
                    <div key={item.name} className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 border border-black" style={{ backgroundColor: item.color }} />
                      <span className="truncate">{item.name} (Lv.{item.level})</span>
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
            <div className={`double-bezel-inner p-5 border space-y-4 ${
              isEink ? 'bg-[#f5f4ef] text-[#111113] border-[#18181c]' : 'bg-[#18181c] text-[#f5f4ef] border-[#33322d]'
            }`}>
              <div className={`flex items-center justify-between border-b pb-3 ${
                isEink ? 'border-[#18181c]' : 'border-[#33322d]'
              }`}>
                <div className="flex items-center gap-2">
                  <Layers className={`w-5 h-5 ${isEink ? 'text-emerald-700' : 'text-emerald-400'}`} />
                  <div>
                    <h4 className="font-pixel text-xs font-bold uppercase tracking-wider">
                      QUEST CLASSIFICATION SHARE
                    </h4>
                    <p className={`font-mono text-[10px] ${isEink ? 'text-[#4a4943]' : 'text-zinc-400'}`}>
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
                      <Tooltip content={<CustomPixelTooltip unit="Quests" isEink={isEink} />} />
                      <Legend 
                        verticalAlign="bottom" 
                        wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className={`h-full flex flex-col items-center justify-center text-center p-6 font-mono text-xs ${
                    isEink ? 'text-[#4a4943]' : 'text-zinc-400'
                  }`}>
                    <p className={`font-pixel text-sm mb-1 ${isEink ? 'text-[#111113]' : 'text-[#f5f4ef]'}`}>
                      NO ACTIVE QUESTS LOGGED
                    </p>
                    <p>Create new quests to populate classification charts!</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Habit & Consistency Milestones */}
          <div className="double-bezel">
            <div className={`double-bezel-inner p-5 border space-y-4 ${
              isEink ? 'bg-[#f5f4ef] text-[#111113] border-[#18181c]' : 'bg-[#18181c] text-[#f5f4ef] border-[#33322d]'
            }`}>
              <div className={`flex items-center justify-between border-b pb-3 ${
                isEink ? 'border-[#18181c]' : 'border-[#33322d]'
              }`}>
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-500 animate-pulse" />
                  <div>
                    <h4 className="font-pixel text-xs font-bold uppercase tracking-wider">
                      MILESTONES & STREAK ACCUMULATOR
                    </h4>
                    <p className={`font-mono text-[10px] ${isEink ? 'text-[#4a4943]' : 'text-zinc-400'}`}>
                      Progress toward key RPG accomplishments
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 font-mono text-xs">
                {/* Milestone 1 */}
                <div className={`p-3 border flex items-center justify-between ${
                  isEink ? 'bg-[#ebeae4] border-[#18181c]' : 'bg-[#212026] border-[#33322d]'
                }`}>
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">⚔️</span>
                    <div>
                      <div className="font-bold">First Quest Completed</div>
                      <div className={`text-[10px] ${isEink ? 'text-[#4a4943]' : 'text-zinc-400'}`}>Begin your journey as an adventurer</div>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 font-pixel text-[10px] font-bold ${
                    completedQuests >= 1 ? 'bg-emerald-700 text-white' : isEink ? 'bg-zinc-300 text-zinc-600' : 'bg-[#26252a] text-zinc-500'
                  }`}>
                    {completedQuests >= 1 ? 'UNLOCKED' : 'LOCKED'}
                  </span>
                </div>

                {/* Milestone 2 */}
                <div className={`p-3 border flex items-center justify-between ${
                  isEink ? 'bg-[#ebeae4] border-[#18181c]' : 'bg-[#212026] border-[#33322d]'
                }`}>
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">🔥</span>
                    <div>
                      <div className="font-bold">3-Day Habit Streak</div>
                      <div className={`text-[10px] ${isEink ? 'text-[#4a4943]' : 'text-zinc-400'}`}>Attain a 1.30x XP Multiplier</div>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 font-pixel text-[10px] font-bold ${
                    playerStats.streakDays >= 3 ? 'bg-orange-600 text-white' : isEink ? 'bg-zinc-300 text-zinc-600' : 'bg-[#26252a] text-zinc-500'
                  }`}>
                    {playerStats.streakDays >= 3 ? 'UNLOCKED' : `${playerStats.streakDays}/3 DAYS`}
                  </span>
                </div>

                {/* Milestone 3 */}
                <div className={`p-3 border flex items-center justify-between ${
                  isEink ? 'bg-[#ebeae4] border-[#18181c]' : 'bg-[#212026] border-[#33322d]'
                }`}>
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">👑</span>
                    <div>
                      <div className="font-bold">Level 5 Veteran Ascendance</div>
                      <div className={`text-[10px] ${isEink ? 'text-[#4a4943]' : 'text-zinc-400'}`}>Reach hero level 5 milestone</div>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 font-pixel text-[10px] font-bold ${
                    playerStats.level >= 5 ? 'bg-purple-700 text-white' : isEink ? 'bg-zinc-300 text-zinc-600' : 'bg-[#26252a] text-zinc-500'
                  }`}>
                    {playerStats.level >= 5 ? 'UNLOCKED' : `Lv.${playerStats.level}/5`}
                  </span>
                </div>

                {/* Milestone 4 */}
                <div className={`p-3 border flex items-center justify-between ${
                  isEink ? 'bg-[#ebeae4] border-[#18181c]' : 'bg-[#212026] border-[#33322d]'
                }`}>
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">💀</span>
                    <div>
                      <div className="font-bold">Boss Tier Conquered</div>
                      <div className={`text-[10px] ${isEink ? 'text-[#4a4943]' : 'text-zinc-400'}`}>Slay at least 1 Boss quest</div>
                    </div>
                  </div>
                  {(() => {
                    const bossDone = quests.some(q => q.difficulty === 'boss' && q.completed);
                    return (
                      <span className={`px-2 py-0.5 font-pixel text-[10px] font-bold ${
                        bossDone ? 'bg-red-700 text-white' : isEink ? 'bg-zinc-300 text-zinc-600' : 'bg-[#26252a] text-zinc-500'
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
