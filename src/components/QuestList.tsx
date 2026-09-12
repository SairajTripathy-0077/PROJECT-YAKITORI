import { useState, type FC, type RefObject, type FormEvent } from 'react';
import { useGame } from '../context/GameContext';
import { QuestCard } from './QuestCard';
import type { AttributeType, QuestDifficulty, Quest } from '../types/game';
import { 
  Search, 
  Plus, 
  ScrollText, 
  Calendar, 
  RotateCcw, 
  ArrowUpDown, 
  Layers, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  Trash2,
  Brain,
  Dumbbell,
  Palette,
  Zap,
  Shield,
  Clock,
  Flame
} from 'lucide-react';
import { getLocalTodayStr } from '../utils/rpgEngine';

interface QuestListProps {
  onOpenNewQuest: (defaultDueDate?: string) => void;
  onEditQuest?: (quest: Quest) => void;
  searchInputRef: RefObject<HTMLInputElement | null>;
}

type SortOption = 'createdAt' | 'dueDate' | 'difficulty' | 'xp' | 'alphabetical';
type GroupOption = 'none' | 'attribute' | 'difficulty' | 'timeline';

export const QuestList: FC<QuestListProps> = ({ onOpenNewQuest, onEditQuest, searchInputRef }) => {
  const { quests, addQuest, selectedCalendarDate, setSelectedCalendarDate, deleteQuest } = useGame();
  const [searchQuery, setSearchQuery] = useState('');
  const [tabFilter, setTabFilter] = useState<'all' | 'active' | 'completed' | 'main' | 'daily'>('active');
  const [selectedAttribute, setSelectedAttribute] = useState<AttributeType | 'all'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<QuestDifficulty | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('createdAt');
  const [groupBy, setGroupBy] = useState<GroupOption>('none');

  // Inline Quick Task State
  const [quickTitle, setQuickTitle] = useState('');
  const [quickDifficulty, setQuickDifficulty] = useState<QuestDifficulty>('medium');
  const [quickAttribute, setQuickAttribute] = useState<AttributeType>('intellect');

  const todayStr = getLocalTodayStr();

  const isPastDate = Boolean(selectedCalendarDate && selectedCalendarDate < todayStr);
  const isFutureDate = Boolean(selectedCalendarDate && selectedCalendarDate > todayStr);
  const isViewingSpecificDate = Boolean(selectedCalendarDate && selectedCalendarDate !== todayStr);

  // Overdue Active Tasks Count
  const overdueQuestsCount = quests.filter(q => !q.completed && q.dueDate && q.dueDate < todayStr).length;

  // Handle Inline Quick Task Creation
  const handleQuickAdd = (e: FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    addQuest({
      title: quickTitle.trim(),
      attribute: quickAttribute,
      difficulty: quickDifficulty,
      questType: 'main',
      dueDate: selectedCalendarDate && selectedCalendarDate > todayStr ? selectedCalendarDate : undefined,
      subtasks: [],
    });

    setQuickTitle('');
  };

  // Filter Quests
  const filteredQuests = quests.filter(quest => {
    // If viewing a past date, show tasks completed OR scheduled for that past date
    if (isPastDate) {
      const completedOnDate = 
        quest.lastCompletedDate === selectedCalendarDate ||
        (quest.completionDates && quest.completionDates.includes(selectedCalendarDate!)) ||
        (quest.completedAt && getLocalTodayStr(new Date(quest.completedAt)) === selectedCalendarDate);
      
      const dueOnDate = quest.dueDate === selectedCalendarDate;

      if (!completedOnDate && !dueOnDate) return false;
    }

    // If viewing a future date, show tasks scheduled for that date OR daily habits
    if (isFutureDate) {
      const isDueOnFutureDate = quest.dueDate === selectedCalendarDate;
      const isDailyHabit = quest.questType === 'daily';
      if (!isDueOnFutureDate && !isDailyHabit) return false;
    }

    // Search Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = quest.title.toLowerCase().includes(q);
      const matchDesc = quest.description?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc) return false;
    }

    // Attribute Filter
    if (selectedAttribute !== 'all' && quest.attribute !== selectedAttribute) {
      return false;
    }

    // Difficulty Filter
    if (selectedDifficulty !== 'all' && quest.difficulty !== selectedDifficulty) {
      return false;
    }

    // Tab Filter (Only applicable when viewing Today / default view)
    if (!isViewingSpecificDate) {
      switch (tabFilter) {
        case 'active': return !quest.completed;
        case 'completed': return quest.completed;
        case 'main': return quest.questType === 'main';
        case 'daily': return quest.questType === 'daily';
        case 'all': default: return true;
      }
    }

    return true;
  });

  // Sort Quests
  const sortedQuests = [...filteredQuests].sort((a, b) => {
    switch (sortBy) {
      case 'dueDate': {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      }
      case 'difficulty': {
        const order: Record<QuestDifficulty, number> = { boss: 4, hard: 3, medium: 2, easy: 1 };
        return (order[b.difficulty] || 0) - (order[a.difficulty] || 0);
      }
      case 'xp': {
        return (b.xpReward || 0) - (a.xpReward || 0);
      }
      case 'alphabetical': {
        return a.title.localeCompare(b.title);
      }
      case 'createdAt':
      default: {
        return (b.createdAt || 0) - (a.createdAt || 0);
      }
    }
  });

  // Clear Completed Quests helper
  const handleClearCompleted = () => {
    const completedIds = quests.filter(q => q.completed).map(q => q.id);
    if (completedIds.length === 0) return;
    if (window.confirm(`Are you sure you want to clear ${completedIds.length} completed quests from your log?`)) {
      completedIds.forEach(id => deleteQuest(id));
    }
  };

  // Format date for banner header
  const formattedSelectedDate = selectedCalendarDate ? (() => {
    try {
      const [y, m, d] = selectedCalendarDate.split('-');
      const dateObj = new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10));
      return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return selectedCalendarDate;
    }
  })() : '';

  // Stats Telemetry Bar Math
  const totalInCurrentView = sortedQuests.length;
  const completedInCurrentView = sortedQuests.filter(q => q.completed).length;
  const completionPercentage = totalInCurrentView > 0 ? Math.round((completedInCurrentView / totalInCurrentView) * 100) : 0;

  // Grouping Helpers
  const renderGroupedQuests = () => {
    if (groupBy === 'none') {
      return (
        <div className="space-y-3">
          {sortedQuests.map(quest => (
            <QuestCard key={quest.id} quest={quest} onEditQuest={onEditQuest} />
          ))}
        </div>
      );
    }

    if (groupBy === 'attribute') {
      const groups: Record<AttributeType, Quest[]> = {
        intellect: [],
        strength: [],
        creativity: [],
        vitality: [],
        discipline: [],
      };

      sortedQuests.forEach(q => {
        if (groups[q.attribute]) groups[q.attribute].push(q);
      });

      const meta: Record<AttributeType, { name: string; icon: any; color: string }> = {
        intellect: { name: 'Intellect', icon: Brain, color: 'text-blue-700' },
        strength: { name: 'Strength', icon: Dumbbell, color: 'text-red-700' },
        creativity: { name: 'Creativity', icon: Palette, color: 'text-purple-700' },
        vitality: { name: 'Vitality', icon: Zap, color: 'text-emerald-700' },
        discipline: { name: 'Discipline', icon: Shield, color: 'text-amber-700' },
      };

      return (
        <div className="space-y-6">
          {(Object.keys(groups) as AttributeType[]).map(attrKey => {
            const list = groups[attrKey];
            if (list.length === 0) return null;
            const info = meta[attrKey];
            const Icon = info.icon;

            return (
              <div key={attrKey} className="space-y-3">
                <div className="flex items-center gap-2 border-b-2 border-[#18181c] pb-1.5 font-mono text-xs font-bold text-[#111113]">
                  <Icon className={`w-4 h-4 ${info.color}`} />
                  <span className="font-pixel uppercase text-sm">{info.name}</span>
                  <span className="px-2 py-0.5 bg-[#ebeae4] border border-[#18181c] text-[10px]">
                    {list.length} {list.length === 1 ? 'Task' : 'Tasks'}
                  </span>
                </div>
                <div className="space-y-3">
                  {list.map(quest => (
                    <QuestCard key={quest.id} quest={quest} onEditQuest={onEditQuest} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    if (groupBy === 'difficulty') {
      const groups: Record<QuestDifficulty, Quest[]> = {
        boss: [],
        hard: [],
        medium: [],
        easy: [],
      };

      sortedQuests.forEach(q => {
        if (groups[q.difficulty]) groups[q.difficulty].push(q);
      });

      const meta: Record<QuestDifficulty, { name: string; color: string }> = {
        boss: { name: '🔥 Boss Tier (+220 XP, +150g)', color: 'text-red-700 bg-red-100 border-red-800' },
        hard: { name: '🔴 Hard Tier (+100 XP, +75g)', color: 'text-orange-700 bg-orange-100 border-orange-800' },
        medium: { name: '🟡 Medium Tier (+50 XP, +35g)', color: 'text-amber-800 bg-amber-100 border-amber-800' },
        easy: { name: '🟢 Easy Tier (+25 XP, +15g)', color: 'text-emerald-800 bg-emerald-100 border-emerald-800' },
      };

      return (
        <div className="space-y-6">
          {(['boss', 'hard', 'medium', 'easy'] as QuestDifficulty[]).map(diffKey => {
            const list = groups[diffKey];
            if (list.length === 0) return null;
            const info = meta[diffKey];

            return (
              <div key={diffKey} className="space-y-3">
                <div className="flex items-center gap-2 border-b-2 border-[#18181c] pb-1.5 font-mono text-xs font-bold text-[#111113]">
                  <span className={`px-2 py-0.5 border font-pixel text-xs ${info.color}`}>{info.name}</span>
                  <span className="px-2 py-0.5 bg-[#ebeae4] border border-[#18181c] text-[10px]">
                    {list.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {list.map(quest => (
                    <QuestCard key={quest.id} quest={quest} onEditQuest={onEditQuest} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    if (groupBy === 'timeline') {
      const groups = {
        overdue: sortedQuests.filter(q => !q.completed && q.dueDate && q.dueDate < todayStr),
        today: sortedQuests.filter(q => q.dueDate === todayStr || q.questType === 'daily'),
        upcoming: sortedQuests.filter(q => q.dueDate && q.dueDate > todayStr),
        noDate: sortedQuests.filter(q => !q.dueDate && q.questType !== 'daily' && !q.completed),
        completed: sortedQuests.filter(q => q.completed),
      };

      const sections = [
        { key: 'overdue', title: '⚠️ OVERDUE TASKS', list: groups.overdue, color: 'text-red-700' },
        { key: 'today', title: '⭐ DUE TODAY & DAILY HABITS', list: groups.today, color: 'text-amber-800' },
        { key: 'upcoming', title: '📅 UPCOMING SCHEDULED', list: groups.upcoming, color: 'text-indigo-800' },
        { key: 'noDate', title: '📋 BACKLOG / SOMEDAY', list: groups.noDate, color: 'text-zinc-800' },
        { key: 'completed', title: '✅ COMPLETED ARCHIVE', list: groups.completed, color: 'text-emerald-800' },
      ];

      return (
        <div className="space-y-6">
          {sections.map(sec => {
            if (sec.list.length === 0) return null;
            return (
              <div key={sec.key} className="space-y-3">
                <div className="flex items-center gap-2 border-b-2 border-[#18181c] pb-1.5 font-mono text-xs font-bold text-[#111113]">
                  <span className={`font-pixel text-xs ${sec.color}`}>{sec.title}</span>
                  <span className="px-2 py-0.5 bg-[#ebeae4] border border-[#18181c] text-[10px]">
                    {sec.list.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {sec.list.map(quest => (
                    <QuestCard key={quest.id} quest={quest} onEditQuest={onEditQuest} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-4 pb-24 sm:pb-32">
      {/* Overdue Warning Alert Pill */}
      {overdueQuestsCount > 0 && !isViewingSpecificDate && (
        <div className="double-bezel bg-red-100 border-2 border-red-800 shadow-pixel-sm animate-pulse">
          <div className="double-bezel-inner bg-red-50 p-3 border border-red-800 flex items-center justify-between gap-3 text-red-900 font-mono text-xs">
            <div className="flex items-center gap-2 font-bold">
              <AlertTriangle className="w-5 h-5 text-red-700 shrink-0" />
              <span>OVERDUE ALERT: You have {overdueQuestsCount} task{overdueQuestsCount > 1 ? 's' : ''} past deadline! Complete them now to maintain your daily velocity.</span>
            </div>
            <button
              onClick={() => setGroupBy('timeline')}
              className="px-2.5 py-1 bg-red-900 text-white font-pixel text-[10px] uppercase font-bold shrink-0 hover:bg-black"
            >
              VIEW OVERDUE
            </button>
          </div>
        </div>
      )}

      {/* Historical or Future Date Notice Banner */}
      {isViewingSpecificDate && (
        <div className="double-bezel bg-amber-100 border-2 border-[#18181c] shadow-pixel-sm">
          <div className="double-bezel-inner bg-amber-50 p-3 sm:p-4 border border-[#18181c] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-[#18181c] text-amber-400 border border-black shadow-pixel-sm">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-pixel text-xs sm:text-sm font-bold uppercase tracking-wider text-[#111113]">
                    {isFutureDate ? `FUTURE PLANNING: ${formattedSelectedDate}` : `PAST LOG: ${formattedSelectedDate}`}
                  </span>
                  <span className="font-mono text-[10px] bg-amber-200 border border-amber-800 text-amber-900 px-2 py-0.5 font-bold">
                    {selectedCalendarDate}
                  </span>
                </div>
                <p className="font-serif text-xs text-[#4a4943] leading-tight mt-0.5">
                  {isFutureDate 
                    ? 'Tasks scheduled for this future date can be created and managed, but completion unlocks on that date.'
                    : 'Showing completed and scheduled tasks recorded for this past date.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {isFutureDate && (
                <button
                  onClick={() => onOpenNewQuest(selectedCalendarDate!)}
                  className="px-3.5 py-2 pixel-btn-primary font-pixel text-xs font-bold text-white flex items-center gap-1.5 shrink-0"
                  title="Add a new task scheduled for this future date"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-400" />
                  <span>ADD FUTURE TASK</span>
                </button>
              )}
              <button
                onClick={() => setSelectedCalendarDate(todayStr)}
                className="px-3.5 py-2 pixel-btn font-pixel text-xs font-bold text-[#111113] flex items-center gap-1.5 hover:bg-[#deddd6] shrink-0"
                title="Return to today's active quest list"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-700" />
                <span>RETURN TO TODAY</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Senior SDE Controls Bar: Search, Filters, Sorting & Grouping */}
      <div className="double-bezel">
        <div className="double-bezel-inner bg-[#ebeae4] p-3 sm:p-4 border border-[#18181c] space-y-3">
          
          {/* Top Controls Row */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#4a4943]" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search quests... (Hotkey: /)"
                className="w-full pl-9 pr-4 py-2 bg-[#f5f4ef] border border-[#18181c] text-xs sm:text-sm text-[#111113] placeholder-[#4a4943] focus:outline-none font-mono"
              />
            </div>

            {/* Dropdown Filters Grid */}
            <div className="grid grid-cols-2 xs:flex xs:flex-wrap items-center gap-2">
              
              {/* Attribute Filter */}
              <select
                value={selectedAttribute}
                onChange={e => setSelectedAttribute(e.target.value as AttributeType | 'all')}
                className="bg-[#f5f4ef] border border-[#18181c] text-xs text-[#111113] px-2.5 py-2 focus:outline-none font-mono font-bold cursor-pointer w-full xs:w-auto"
                title="Filter by Attribute"
              >
                <option value="all">All Attributes</option>
                <option value="intellect">Intellect</option>
                <option value="strength">Strength</option>
                <option value="creativity">Creativity</option>
                <option value="vitality">Vitality</option>
                <option value="discipline">Discipline</option>
              </select>

              {/* Difficulty Filter */}
              <select
                value={selectedDifficulty}
                onChange={e => setSelectedDifficulty(e.target.value as QuestDifficulty | 'all')}
                className="bg-[#f5f4ef] border border-[#18181c] text-xs text-[#111113] px-2.5 py-2 focus:outline-none font-mono font-bold cursor-pointer w-full xs:w-auto"
                title="Filter by Difficulty Tier"
              >
                <option value="all">All Tiers</option>
                <option value="boss">Boss Tier</option>
                <option value="hard">Hard Tier</option>
                <option value="medium">Medium Tier</option>
                <option value="easy">Easy Tier</option>
              </select>

              {/* Sort By Dropdown */}
              <div className="flex items-center gap-1 bg-[#f5f4ef] border border-[#18181c] px-2 py-1.5 w-full xs:w-auto">
                <ArrowUpDown className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as SortOption)}
                  className="bg-transparent text-xs text-[#111113] focus:outline-none font-mono font-bold cursor-pointer w-full"
                  title="Sort Order"
                >
                  <option value="createdAt">Newest First</option>
                  <option value="dueDate">Earliest Due Date</option>
                  <option value="difficulty">Highest Priority</option>
                  <option value="xp">Highest XP</option>
                  <option value="alphabetical">Alphabetical (A-Z)</option>
                </select>
              </div>

              {/* Group By Dropdown */}
              <div className="flex items-center gap-1 bg-[#f5f4ef] border border-[#18181c] px-2 py-1.5 w-full xs:w-auto">
                <Layers className="w-3.5 h-3.5 text-indigo-700 shrink-0" />
                <select
                  value={groupBy}
                  onChange={e => setGroupBy(e.target.value as GroupOption)}
                  className="bg-transparent text-xs text-[#111113] focus:outline-none font-mono font-bold cursor-pointer w-full"
                  title="Group By"
                >
                  <option value="none">Group: None</option>
                  <option value="attribute">Group by Attribute</option>
                  <option value="difficulty">Group by Tier</option>
                  <option value="timeline">Group by Timeline</option>
                </select>
              </div>

            </div>

          </div>

          {/* Quick Inline Task Addition Input (Linear/Todoist Style) */}
          <form onSubmit={handleQuickAdd} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1 border-t border-[#18181c]/20">
            <div className="relative flex-1">
              <Plus className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-amber-600" />
              <input
                type="text"
                value={quickTitle}
                onChange={e => setQuickTitle(e.target.value)}
                placeholder="⚡ Quick Add Task... (Press Enter to log instantly)"
                className="w-full pl-9 pr-3 py-1.5 bg-[#f5f4ef] border border-[#18181c] text-xs text-[#111113] placeholder-[#71717a] focus:outline-none font-serif font-bold shadow-inner"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={quickAttribute}
                onChange={e => setQuickAttribute(e.target.value as AttributeType)}
                className="flex-1 sm:flex-none bg-[#f5f4ef] border border-[#18181c] text-[11px] text-[#111113] px-2 py-1.5 font-mono font-bold cursor-pointer"
              >
                <option value="intellect">Intellect</option>
                <option value="strength">Strength</option>
                <option value="creativity">Creativity</option>
                <option value="vitality">Vitality</option>
                <option value="discipline">Discipline</option>
              </select>

              <select
                value={quickDifficulty}
                onChange={e => setQuickDifficulty(e.target.value as QuestDifficulty)}
                className="flex-1 sm:flex-none bg-[#f5f4ef] border border-[#18181c] text-[11px] text-[#111113] px-2 py-1.5 font-mono font-bold cursor-pointer"
              >
                <option value="easy">Easy (+25 XP)</option>
                <option value="medium">Medium (+50 XP)</option>
                <option value="hard">Hard (+100 XP)</option>
                <option value="boss">Boss (+220 XP)</option>
              </select>

              <button
                type="submit"
                disabled={!quickTitle.trim()}
                className="px-3 py-1.5 pixel-btn-primary font-pixel text-xs font-bold text-white uppercase disabled:opacity-50 shrink-0"
              >
                LOG
              </button>
            </div>
          </form>

        </div>
      </div>

      {/* Tab Selector Row (Only shown when on Today / default view) */}
      {!isViewingSpecificDate ? (
        <div className="flex items-center justify-between flex-wrap gap-2">
          
          {/* Main Filter Tabs */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 font-mono text-xs scrollbar-none">
            <button
              onClick={() => setTabFilter('active')}
              className={`px-3 py-1.5 font-bold uppercase transition-colors whitespace-nowrap ${tabFilter === 'active' ? 'bg-[#18181c] text-[#f5f4ef] border-2 border-black pixel-border-sm' : 'bg-[#f5f4ef] text-[#4a4943] border border-[#18181c] hover:text-[#111113]'}`}
            >
              ACTIVE TASKS ({quests.filter(q => !q.completed).length})
            </button>

            <button
              onClick={() => setTabFilter('all')}
              className={`px-3 py-1.5 font-bold uppercase transition-colors whitespace-nowrap ${tabFilter === 'all' ? 'bg-[#18181c] text-[#f5f4ef] border-2 border-black pixel-border-sm' : 'bg-[#f5f4ef] text-[#4a4943] border border-[#18181c] hover:text-[#111113]'}`}
            >
              ALL ({quests.length})
            </button>

            <button
              onClick={() => setTabFilter('main')}
              className={`px-3 py-1.5 font-bold uppercase transition-colors whitespace-nowrap ${tabFilter === 'main' ? 'bg-[#18181c] text-[#f5f4ef] border-2 border-black pixel-border-sm' : 'bg-[#f5f4ef] text-[#4a4943] border border-[#18181c] hover:text-[#111113]'}`}
            >
              MAIN QUESTS
            </button>

            <button
              onClick={() => setTabFilter('daily')}
              className={`px-3 py-1.5 font-bold uppercase transition-colors whitespace-nowrap ${tabFilter === 'daily' ? 'bg-[#18181c] text-[#f5f4ef] border-2 border-black pixel-border-sm' : 'bg-[#f5f4ef] text-[#4a4943] border border-[#18181c] hover:text-[#111113]'}`}
            >
              DAILY HABITS
            </button>

            <button
              onClick={() => setTabFilter('completed')}
              className={`px-3 py-1.5 font-bold uppercase transition-colors whitespace-nowrap ${tabFilter === 'completed' ? 'bg-[#18181c] text-[#f5f4ef] border-2 border-black pixel-border-sm' : 'bg-[#f5f4ef] text-[#4a4943] border border-[#18181c] hover:text-[#111113]'}`}
            >
              COMPLETED ({quests.filter(q => q.completed).length})
            </button>
          </div>

          {/* Quick Clear Completed Action */}
          {tabFilter === 'completed' && quests.some(q => q.completed) && (
            <button
              onClick={handleClearCompleted}
              className="px-2.5 py-1 text-[11px] font-mono font-bold text-red-700 bg-red-50 border border-red-800 hover:bg-red-100 flex items-center gap-1.5"
              title="Clear all completed quests from log"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>CLEAR COMPLETED</span>
            </button>
          )}

        </div>
      ) : (
        /* Historical / Future View Tab Indicator */
        <div className="flex items-center justify-between bg-[#18181c] text-[#f5f4ef] p-2.5 font-mono text-xs border-2 border-black pixel-border-sm">
          <span className="font-bold flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-400" />
            <span>
              {isFutureDate
                ? `SCHEDULED FOR ${selectedCalendarDate} (${filteredQuests.length})`
                : `LOGGED / COMPLETED ON ${selectedCalendarDate} (${filteredQuests.length})`}
            </span>
          </span>
          <button
            onClick={() => setSelectedCalendarDate(todayStr)}
            className="text-amber-300 hover:underline font-bold text-[11px]"
          >
            Clear Date Filter ✕
          </button>
        </div>
      )}

      {/* Progress Telemetry Bar */}
      {totalInCurrentView > 0 && (
        <div className="bg-[#ebeae4] p-2.5 border border-[#18181c] font-mono text-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 shadow-pixel-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span className="font-bold text-[#111113]">
              View Progress: {completedInCurrentView} / {totalInCurrentView} ({completionPercentage}%)
            </span>
          </div>

          <div className="flex-1 sm:max-w-xs bg-[#f5f4ef] border border-[#18181c] h-3 p-0.5">
            <div
              className="h-full bg-[#18181c] transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Quest Cards Feed / Grouped Feed */}
      {sortedQuests.length > 0 ? (
        renderGroupedQuests()
      ) : (
        /* Enhanced Empty States */
        <div className="double-bezel text-center py-12 px-6">
          <div className="double-bezel-inner bg-[#ebeae4] p-8 border border-[#18181c] flex flex-col items-center justify-center">
            <div className="w-14 h-14 bg-[#18181c] text-amber-400 border border-black flex items-center justify-center mb-4 shadow-pixel">
              <ScrollText className="w-8 h-8" />
            </div>
            <h3 className="font-pixel text-lg font-bold text-[#111113] mb-2 uppercase">
              {isFutureDate
                ? 'NO TASKS SCHEDULED FOR THIS DATE'
                : isPastDate
                ? 'NO TASKS RECORDED FOR THIS DATE'
                : tabFilter === 'active'
                ? 'ALL ACTIVE TASKS COMPLETED!'
                : tabFilter === 'completed'
                ? 'NO COMPLETED TASKS YET'
                : 'NO TASKS MATCH THIS FILTER'}
            </h3>
            <p className="font-serif text-sm text-[#4a4943] max-w-md mb-6 italic">
              {isFutureDate
                ? `You haven't scheduled any tasks for ${formattedSelectedDate} yet. Add a future task to plan ahead!`
                : isPastDate
                ? `No completed or scheduled tasks were recorded for ${formattedSelectedDate}.`
                : tabFilter === 'active'
                ? 'Fantastic job hero! Your active quest queue is completely clear. Add a new task or take a well-deserved rest!'
                : tabFilter === 'completed'
                ? 'No completed quests in this view. Complete active tasks above to build your progress history!'
                : 'No quests match your current search, attribute, or difficulty filters. Try adjusting your search criteria.'}
            </p>
            {isFutureDate ? (
              <div className="flex items-center gap-3 flex-wrap justify-center">
                <button
                  onClick={() => onOpenNewQuest(selectedCalendarDate!)}
                  className="px-6 py-3 pixel-btn-primary font-pixel font-bold text-xs uppercase tracking-wider flex items-center gap-2"
                >
                  <Plus className="w-4 h-4 text-amber-400" />
                  SCHEDULE TASK FOR {selectedCalendarDate}
                </button>
                <button
                  onClick={() => setSelectedCalendarDate(todayStr)}
                  className="px-4 py-3 pixel-btn font-pixel font-bold text-xs uppercase tracking-wider flex items-center gap-2 text-[#111113]"
                >
                  <RotateCcw className="w-4 h-4 text-amber-700" />
                  RETURN TO TODAY
                </button>
              </div>
            ) : isPastDate ? (
              <button
                onClick={() => setSelectedCalendarDate(todayStr)}
                className="px-6 py-3 pixel-btn-primary font-pixel font-bold text-xs uppercase tracking-wider flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4 text-amber-400" />
                RETURN TO TODAY'S QUEST LOG
              </button>
            ) : (
              <button
                onClick={() => onOpenNewQuest()}
                className="px-6 py-3 pixel-btn-primary font-pixel font-bold text-xs uppercase tracking-wider flex items-center gap-2"
              >
                <Plus className="w-4 h-4 text-amber-400" />
                CREATE NEW QUEST
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

