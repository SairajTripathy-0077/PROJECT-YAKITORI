import { useState, type FC } from 'react';
import type { Quest, AttributeType } from '../types/game';
import { useGame } from '../context/GameContext';
import { FloatingXpGain } from './character/FloatingXpGain';
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
  Coins,
  Calendar,
  Repeat, 
  Clock,
  Edit2
} from 'lucide-react';

interface QuestCardProps {
  quest: Quest;
  onEditQuest?: (quest: Quest) => void;
}

export const QuestCard: FC<QuestCardProps> = ({ quest, onEditQuest }) => {
  const { toggleQuest, deleteQuest, toggleSubtask, addSubtask } = useGame();
  const [expanded, setExpanded] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [showCompletionFx, setShowCompletionFx] = useState(false);

  const handleToggle = () => {
    if (!quest.completed) {
      setShowCompletionFx(true);
      setTimeout(() => setShowCompletionFx(false), 1400);
    }
    toggleQuest(quest.id);
  };

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

  const getDeadlineInfo = (dueDateStr?: string) => {
    if (!dueDateStr) return null;
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const today = new Date(todayStr);
      const due = new Date(dueDateStr);
      
      const diffTime = due.getTime() - today.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      const [year, month, day] = dueDateStr.split('-');
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const formatted = `${monthNames[parseInt(month, 10) - 1]} ${parseInt(day, 10)}`;

      if (diffDays < 0) {
        return {
          text: `Overdue: ${formatted} (${Math.abs(diffDays)}d ago)`,
          color: 'bg-red-100 text-red-900 border-red-700 font-bold',
          icon: AlertCircle,
          urgent: true,
        };
      } else if (diffDays === 0) {
        return {
          text: 'Due Today',
          color: 'bg-amber-200 text-amber-950 border-amber-800 font-bold animate-pulse',
          icon: Clock,
          urgent: true,
        };
      } else if (diffDays === 1) {
        return {
          text: `Due Tomorrow (${formatted})`,
          color: 'bg-amber-50 text-amber-900 border-amber-700 font-bold',
          icon: Clock,
          urgent: false,
        };
      } else {
        return {
          text: `Due: ${formatted} (in ${diffDays}d)`,
          color: 'bg-[#f5f4ef] text-[#111113] border-[#18181c]',
          icon: Calendar,
          urgent: false,
        };
      }
    } catch {
      return { text: `Due: ${dueDateStr}`, color: 'bg-[#f5f4ef] text-[#111113] border-[#18181c]', icon: Calendar, urgent: false };
    }
  };

  const attrBadge = getAttributeBadge(quest.attribute);
  const AttrIcon = attrBadge.icon;
  const deadlineInfo = getDeadlineInfo(quest.dueDate);

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
    <div className={`double-bezel transition-all duration-200 relative ${quest.completed ? 'opacity-65' : ''} ${showCompletionFx ? 'animate-card-flash' : ''}`}>
      {/* Floating XP Gain Badge */}
      {showCompletionFx && (
        <FloatingXpGain xp={quest.xpReward} gold={quest.goldReward} />
      )}
      <div className={`double-bezel-inner p-4 border-2 transition-colors ${quest.completed ? 'bg-[#e2e1d7] border-[#18181c]' : 'bg-[#ebeae4] border-[#18181c]'}`}>
        
        {/* Top Header Row */}
        <div className="flex items-start justify-between gap-3 mb-2">
          
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Completion Checkbox */}
            <button
              onClick={handleToggle}
              className="mt-0.5 p-1 text-[#18181c] hover:text-black focus:outline-none transition-all transform active:scale-90 hover:scale-110 shrink-0"
              title={quest.completed ? 'Mark as incomplete' : 'Complete quest & earn rewards!'}
              aria-label={`Toggle completion for ${quest.title}`}
            >
              {quest.completed ? (
                <CheckSquare className="w-6 h-6 text-[#18181c] animate-scale-in" />
              ) : (
                <Square className="w-6 h-6 text-[#4a4943] hover:text-black" />
              )}
            </button>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1.5">
                {/* Attribute Tag */}
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 border text-[10px] font-mono font-bold uppercase tracking-wider ${attrBadge.color}`}>
                  <AttrIcon className="w-3 h-3" />
                  {attrBadge.label}
                </span>

                {/* Quest Type Tag / Daily Tag */}
                {quest.questType === 'daily' ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-950 text-emerald-100 text-[10px] font-pixel uppercase shadow-pixel-sm" title="Refreshes automatically every morning">
                    <Repeat className="w-3 h-3 text-emerald-400" />
                    DAILY HABIT (REFRESHES DAILY)
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-[#18181c] text-[#f5f4ef] text-[10px] font-pixel uppercase">
                    {quest.questType}
                  </span>
                )}

                {/* Difficulty Tag */}
                <span className="px-2 py-0.5 bg-[#f5f4ef] text-[#111113] border border-[#18181c] text-[10px] font-mono uppercase font-bold">
                  {quest.difficulty}
                </span>

                {/* Deadline Badge */}
                {deadlineInfo && !quest.completed && (
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 border text-[10px] font-mono shadow-pixel-sm ${deadlineInfo.color}`}>
                    <deadlineInfo.icon className="w-3 h-3" />
                    <span>{deadlineInfo.text}</span>
                  </span>
                )}

                {/* Completed on Date Badge */}
                {(quest.lastCompletedDate || (quest.completionDates && quest.completionDates.length > 0)) && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 border border-emerald-800 bg-emerald-100 text-emerald-900 text-[10px] font-mono font-bold shadow-pixel-sm">
                    <Calendar className="w-3 h-3 text-emerald-700" />
                    <span>Done: {quest.lastCompletedDate || quest.completionDates?.[quest.completionDates.length - 1]}</span>
                  </span>
                )}
              </div>

              {/* Title */}
              <h3 className={`font-serif text-base sm:text-lg font-bold leading-snug break-words ${quest.completed ? 'line-through text-[#4a4943]' : 'text-[#111113]'}`}>
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

              {onEditQuest && (
                <button
                  onClick={() => onEditQuest(quest)}
                  className="p-1 text-[#4a4943] hover:text-amber-800 transition-colors"
                  title="Edit quest"
                  aria-label={`Edit quest ${quest.title}`}
                >
                  <Edit2 className="w-4 h-4" />
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
