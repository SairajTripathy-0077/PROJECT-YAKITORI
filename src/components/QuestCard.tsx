import { useState, type FC } from 'react';
import type { Quest, AttributeType } from '../types/game';
import { useGame } from '../context/GameContext';
import { 
  CheckSquare, 
  Square, 
  Trash2, 
  Brain, 
  Dumbbell, 
  Palette, 
  Zap, 
  Shield, 
  ChevronDown, 
  ChevronUp, 
  Plus, 
  Sparkles, 
  Coins 
} from 'lucide-react';

export const QuestCard: FC<{ quest: Quest }> = ({ quest }) => {
  const { toggleQuest, deleteQuest, toggleSubtask, addSubtask } = useGame();
  const [expanded, setExpanded] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  const getAttributeBadge = (type: AttributeType) => {
    switch (type) {
      case 'intellect':
        return { label: 'Intellect', icon: Brain, color: 'text-blue-700 border-blue-700 bg-blue-50' };
      case 'strength':
        return { label: 'Strength', icon: Dumbbell, color: 'text-red-700 border-red-700 bg-red-50' };
      case 'creativity':
        return { label: 'Creativity', icon: Palette, color: 'text-purple-700 border-purple-700 bg-purple-50' };
      case 'vitality':
        return { label: 'Vitality', icon: Zap, color: 'text-emerald-700 border-emerald-700 bg-emerald-50' };
      case 'discipline':
        return { label: 'Discipline', icon: Shield, color: 'text-amber-700 border-amber-700 bg-amber-50' };
    }
  };

  const attrBadge = getAttributeBadge(quest.attribute);
  const AttrIcon = attrBadge.icon;

  const completedSubtasksCount = quest.subtasks.filter(s => s.completed).length;
  const subtaskPercent = quest.subtasks.length > 0 
    ? Math.round((completedSubtasksCount / quest.subtasks.length) * 100)
    : 0;

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSubtaskTitle.trim()) {
      addSubtask(quest.id, newSubtaskTitle);
      setNewSubtaskTitle('');
    }
  };

  return (
    <div className={`double-bezel transition-all duration-200 ${quest.completed ? 'opacity-65' : ''}`}>
      <div className={`double-bezel-inner p-4 border-2 transition-colors ${quest.completed ? 'bg-[#e2e1d7] border-[#18181c]' : 'bg-[#ebeae4] border-[#18181c]'}`}>
        
        {/* Top Header Row */}
        <div className="flex items-start justify-between gap-3 mb-2">
          
          <div className="flex items-start gap-3">
            {/* Completion Checkbox */}
            <button
              onClick={() => toggleQuest(quest.id)}
              className="mt-0.5 p-1 text-[#18181c] hover:text-black focus:outline-none transition-colors"
              title={quest.completed ? 'Mark as incomplete' : 'Complete quest & earn rewards!'}
              aria-label={`Toggle completion for ${quest.title}`}
            >
              {quest.completed ? (
                <CheckSquare className="w-6 h-6 text-[#18181c]" />
              ) : (
                <Square className="w-6 h-6 text-[#4a4943] hover:text-black" />
              )}
            </button>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                {/* Attribute Tag */}
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 border text-[10px] font-mono font-bold uppercase tracking-wider ${attrBadge.color}`}>
                  <AttrIcon className="w-3 h-3" />
                  {attrBadge.label}
                </span>

                {/* Quest Type Tag */}
                <span className="px-2 py-0.5 bg-[#18181c] text-[#f5f4ef] text-[10px] font-pixel uppercase">
                  {quest.questType}
                </span>

                {/* Difficulty Tag */}
                <span className="px-2 py-0.5 bg-[#f5f4ef] text-[#111113] border border-[#18181c] text-[10px] font-mono uppercase font-bold">
                  {quest.difficulty}
                </span>
              </div>

              {/* Title */}
              <h3 className={`font-serif text-base sm:text-lg font-bold leading-snug ${quest.completed ? 'line-through text-[#4a4943]' : 'text-[#111113]'}`}>
                {quest.title}
              </h3>

              {/* Description */}
              {quest.description && (
                <p className={`font-serif text-xs sm:text-sm mt-1 leading-relaxed ${quest.completed ? 'text-[#4a4943]' : 'text-[#2a2925]'}`}>
                  {quest.description}
                </p>
              )}
            </div>
          </div>

          {/* Right Action & Rewards */}
          <div className="flex flex-col items-end gap-2 shrink-0">
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="flex items-center gap-1 text-[#111113] font-bold" title="XP Reward">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                +{quest.xpReward} XP
              </span>
              <span className="flex items-center gap-1 text-amber-700 font-bold" title="Gold Reward">
                <Coins className="w-3.5 h-3.5" />
                +{quest.goldReward}g
              </span>
            </div>

            <div className="flex items-center gap-1">
              {quest.subtasks.length > 0 && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="p-1 text-[#4a4943] hover:text-black font-mono text-xs flex items-center gap-1"
                  title="Toggle subtasks"
                >
                  <span className="text-[11px] font-bold">{completedSubtasksCount}/{quest.subtasks.length}</span>
                  {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              )}

              <button
                onClick={() => deleteQuest(quest.id)}
                className="p-1 text-[#4a4943] hover:text-red-700 transition-colors"
                title="Delete quest"
                aria-label={`Delete quest ${quest.title}`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

        {/* Subtask Progress Bar if any subtasks */}
        {quest.subtasks.length > 0 && (
          <div className="mt-2 pt-2 border-t border-[#18181c]/30">
            <div className="w-full bg-[#f5f4ef] h-2 border border-[#18181c]">
              <div 
                className="h-full bg-[#18181c] transition-all duration-200" 
                style={{ width: `${subtaskPercent}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Expanded Checklist */}
        {expanded && (
          <div className="mt-3 pt-3 border-t-2 border-[#18181c] space-y-2 font-mono text-xs">
            <div className="text-[11px] font-pixel text-[#4a4943] uppercase tracking-wider mb-2 font-bold">
              Sub-Task Objectives ({completedSubtasksCount}/{quest.subtasks.length}):
            </div>

            {quest.subtasks.map(sub => (
              <div key={sub.id} className="flex items-center justify-between gap-2 p-2 bg-[#f5f4ef] border border-[#18181c]">
                <label className="flex items-center gap-2 cursor-pointer flex-1 text-[#111113]">
                  <input
                    type="checkbox"
                    checked={sub.completed}
                    onChange={() => toggleSubtask(quest.id, sub.id)}
                    className="accent-[#18181c] w-3.5 h-3.5 cursor-pointer"
                  />
                  <span className={sub.completed ? 'line-through text-[#4a4943]' : 'font-bold'}>
                    {sub.title}
                  </span>
                </label>
              </div>
            ))}

            {/* Quick Add Subtask Form */}
            <form onSubmit={handleAddSubtask} className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={e => setNewSubtaskTitle(e.target.value)}
                placeholder="+ Add sub-task..."
                className="flex-1 bg-[#f5f4ef] border border-[#18181c] px-3 py-1.5 text-xs text-[#111113] focus:outline-none font-serif"
              />
              <button
                type="submit"
                className="p-1.5 pixel-btn font-pixel text-xs"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};
