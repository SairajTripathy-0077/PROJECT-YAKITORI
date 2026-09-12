import { useState, type FC, type RefObject } from 'react';
import { useGame } from '../context/GameContext';
import { QuestCard } from './QuestCard';
import type { AttributeType, Quest } from '../types/game';
import { Search, Plus, ScrollText, Calendar, RotateCcw } from 'lucide-react';
import { getLocalTodayStr } from '../utils/rpgEngine';

interface QuestListProps {
  onOpenNewQuest: (defaultDueDate?: string) => void;
  onEditQuest?: (quest: Quest) => void;
  searchInputRef: RefObject<HTMLInputElement | null>;
}

export const QuestList: FC<QuestListProps> = ({ onOpenNewQuest, onEditQuest, searchInputRef }) => {
  const { quests, selectedCalendarDate, setSelectedCalendarDate } = useGame();
  const [searchQuery, setSearchQuery] = useState('');
  const [tabFilter, setTabFilter] = useState<'all' | 'active' | 'completed' | 'main' | 'daily'>('active');
  const [selectedAttribute, setSelectedAttribute] = useState<AttributeType | 'all'>('all');

  const todayStr = getLocalTodayStr();

  const isPastDate = Boolean(selectedCalendarDate && selectedCalendarDate < todayStr);
  const isFutureDate = Boolean(selectedCalendarDate && selectedCalendarDate > todayStr);
  const isViewingSpecificDate = Boolean(selectedCalendarDate && selectedCalendarDate !== todayStr);

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

  return (
    <div className="space-y-4">
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
                    {isFutureDate ? `🔮 FUTURE PLANNING: ${formattedSelectedDate}` : `📜 PAST LOG: ${formattedSelectedDate}`}
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

      {/* Controls Bar: Search & Filter Tabs */}
      <div className="double-bezel">
        <div className="double-bezel-inner bg-[#ebeae4] p-3 sm:p-4 border border-[#18181c] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
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

          {/* Attribute Dropdown Filter */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={selectedAttribute}
                onChange={e => setSelectedAttribute(e.target.value as AttributeType | 'all')}
                className="bg-[#f5f4ef] border border-[#18181c] text-xs text-[#111113] px-3 py-2 focus:outline-none font-mono font-bold cursor-pointer"
              >
                <option value="all">⚡ All Attributes</option>
                <option value="intellect">🧠 Intellect</option>
                <option value="strength">💪 Strength</option>
                <option value="creativity">🎨 Creativity</option>
                <option value="vitality">⚡ Vitality</option>
                <option value="discipline">🛡️ Discipline</option>
              </select>
            </div>
          </div>

        </div>
      </div>

      {/* Tab Selector Row (Only shown when on Today / default view) */}
      {!isViewingSpecificDate ? (
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 font-mono text-xs scrollbar-none">
          <button
            onClick={() => setTabFilter('active')}
            className={`px-3 py-1.5 font-bold uppercase transition-colors whitespace-nowrap ${tabFilter === 'active' ? 'bg-[#18181c] text-[#f5f4ef] border-2 border-black pixel-border-sm' : 'bg-[#f5f4ef] text-[#4a4943] border border-[#18181c] hover:text-[#111113]'}`}
          >
            ACTIVE QUESTS ({quests.filter(q => !q.completed).length})
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

      {/* Quest Cards Feed */}
      {filteredQuests.length > 0 ? (
        <div className="space-y-3">
          {filteredQuests.map(quest => (
            <QuestCard key={quest.id} quest={quest} onEditQuest={onEditQuest} />
          ))}
        </div>
      ) : (
        /* Empty State */
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
                : 'NO QUESTS FOUND'}
            </h3>
            <p className="font-serif text-sm text-[#4a4943] max-w-sm mb-6 italic">
              {isFutureDate
                ? `You haven't scheduled any tasks for ${formattedSelectedDate} yet. Add a future task to plan ahead!`
                : isPastDate
                ? `No completed or scheduled tasks were recorded for ${formattedSelectedDate}.`
                : 'Your quest log is clear for this filter! Create a new quest to earn XP and level up your RPG stats.'}
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
