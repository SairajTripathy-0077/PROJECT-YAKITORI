import { useState, type FC, type RefObject } from 'react';
import { useGame } from '../context/GameContext';
import { QuestCard } from './QuestCard';
import type { AttributeType } from '../types/game';
import { Search, Plus, ScrollText } from 'lucide-react';

interface QuestListProps {
  onOpenNewQuest: () => void;
  searchInputRef: RefObject<HTMLInputElement | null>;
}

export const QuestList: FC<QuestListProps> = ({ onOpenNewQuest, searchInputRef }) => {
  const { quests } = useGame();
  const [searchQuery, setSearchQuery] = useState('');
  const [tabFilter, setTabFilter] = useState<'all' | 'active' | 'completed' | 'main' | 'daily'>('active');
  const [selectedAttribute, setSelectedAttribute] = useState<AttributeType | 'all'>('all');

  const filteredQuests = quests.filter(quest => {
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

    // Tab Filter
    switch (tabFilter) {
      case 'active': return !quest.completed;
      case 'completed': return quest.completed;
      case 'main': return quest.questType === 'main';
      case 'daily': return quest.questType === 'daily';
      case 'all': default: return true;
    }
  });

  return (
    <div className="space-y-4">
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

      {/* Tab Selector Row */}
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

      {/* Quest Cards Feed */}
      {filteredQuests.length > 0 ? (
        <div className="space-y-3">
          {filteredQuests.map(quest => (
            <QuestCard key={quest.id} quest={quest} />
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
              NO QUESTS FOUND
            </h3>
            <p className="font-serif text-sm text-[#4a4943] max-w-sm mb-6 italic">
              Your quest log is clear for this filter! Create a new quest to earn XP and level up your RPG stats.
            </p>
            <button
              onClick={onOpenNewQuest}
              className="px-6 py-3 pixel-btn-primary font-pixel font-bold text-xs uppercase tracking-wider flex items-center gap-2"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              CREATE NEW QUEST
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
