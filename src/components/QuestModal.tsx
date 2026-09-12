import { useState, useEffect, type FC } from 'react';
import { useGame } from '../context/GameContext';
import type { Quest, AttributeType, QuestDifficulty, QuestType } from '../types/game';
import { 
  X, 
  Plus, 
  Trash2, 
  Sparkles, 
  Brain, 
  Dumbbell, 
  Palette, 
  Zap, 
  Shield, 
  Calendar, 
  Repeat, 
  Clock 
} from 'lucide-react';

interface QuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  questToEdit?: Quest | null;
  defaultDueDate?: string;
}

export const QuestModal: FC<QuestModalProps> = ({ isOpen, onClose, questToEdit, defaultDueDate }) => {
  const { addQuest, updateQuest } = useGame();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [attribute, setAttribute] = useState<AttributeType>('intellect');
  const [difficulty, setDifficulty] = useState<QuestDifficulty>('medium');
  const [questType, setQuestType] = useState<QuestType>('main');
  const [dueDate, setDueDate] = useState<string>('');
  const [subtasks, setSubtasks] = useState<{ id: string; title: string; completed: boolean }[]>([]);
  const [newSubtaskInput, setNewSubtaskInput] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (questToEdit) {
        setTitle(questToEdit.title);
        setDescription(questToEdit.description || '');
        setAttribute(questToEdit.attribute);
        setDifficulty(questToEdit.difficulty);
        setQuestType(questToEdit.questType);
        setDueDate(questToEdit.dueDate || '');
        setSubtasks(questToEdit.subtasks || []);
      } else {
        setTitle('');
        setDescription('');
        setAttribute('intellect');
        setDifficulty('medium');
        setQuestType('main');
        setDueDate(defaultDueDate || '');
        setSubtasks([]);
      }
    }
  }, [isOpen, questToEdit, defaultDueDate]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleAddSubtask = () => {
    if (newSubtaskInput.trim()) {
      setSubtasks(prev => [...prev, { id: `sub-${Date.now()}`, title: newSubtaskInput.trim(), completed: false }]);
      setNewSubtaskInput('');
    }
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(prev => prev.filter(s => s.id !== id));
  };

  const handleSetQuickDate = (offsetDays: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    setDueDate(d.toISOString().split('T')[0]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (questToEdit) {
      updateQuest(questToEdit.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        attribute,
        difficulty,
        questType,
        dueDate: questType === 'daily' ? undefined : (dueDate || undefined),
        subtasks,
      });
    } else {
      addQuest({
        title: title.trim(),
        description: description.trim() || undefined,
        attribute,
        difficulty,
        questType,
        dueDate: questType === 'daily' ? undefined : (dueDate || undefined),
        subtasks,
      });
    }

    // Reset Form
    setTitle('');
    setDescription('');
    setAttribute('intellect');
    setDifficulty('medium');
    setQuestType('main');
    setDueDate('');
    setSubtasks([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="double-bezel max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="double-bezel-inner bg-[#ebeae4] text-[#111113] p-5 border border-[#18181c] relative shadow-pixel">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-[#18181c] pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-600" />
              <h2 className="font-pixel text-base font-bold uppercase tracking-wider text-[#111113]">
                {questToEdit ? 'EDIT QUEST OBJECTIVE' : 'CREATE NEW QUEST'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-[#4a4943] hover:text-black font-bold"
              title="Close modal (Esc)"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
            
            {/* Title */}
            <div>
              <label className="block text-[11px] font-pixel text-[#111113] font-bold uppercase mb-1">
                Quest Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Master GSAP Animations & Lenis Scroll..."
                className="w-full px-3 py-2 bg-[#f5f4ef] border border-[#18181c] text-[#111113] text-sm focus:outline-none font-serif font-bold shadow-pixel-sm"
                autoFocus
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-[11px] font-pixel text-[#111113] font-bold uppercase mb-1">
                Description (Optional)
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Details, resources, or notes for completing this quest..."
                className="w-full px-3 py-2 bg-[#f5f4ef] border border-[#18181c] text-[#111113] text-xs focus:outline-none font-serif"
              />
            </div>

            {/* Quest Type (Main, Side, Daily Habit) */}
            <div>
              <label className="block text-[11px] font-pixel text-[#111113] font-bold uppercase mb-1">
                Quest Type
              </label>
              <div className="flex gap-2">
                {[
                  { key: 'main', label: 'Main Quest', icon: Sparkles },
                  { key: 'side', label: 'Side Quest', icon: Clock },
                  { key: 'daily', label: 'Daily Habit', icon: Repeat },
                ].map(type => {
                  const Icon = type.icon;
                  const isSelected = questType === type.key;
                  return (
                    <button
                      key={type.key}
                      type="button"
                      onClick={() => setQuestType(type.key as QuestType)}
                      className={`flex-1 py-2 px-2 border text-xs font-pixel uppercase text-center flex items-center justify-center gap-1.5 transition-all ${isSelected ? 'bg-[#18181c] text-[#f5f4ef] font-bold shadow-pixel-sm border-black' : 'bg-[#f5f4ef] text-[#111113] border-[#18181c]'}`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{type.label}</span>
                    </button>
                  );
                })}
              </div>

              {questType === 'daily' && (
                <div className="mt-2 p-2 bg-[#f5f4ef] border border-dashed border-[#18181c] text-[11px] font-serif text-[#4a4943] flex items-center gap-2">
                  <Repeat className="w-4 h-4 text-emerald-700 shrink-0 animate-spin" style={{ animationDuration: '6s' }} />
                  <span>
                    <strong>Daily Habit Active:</strong> Resets automatically as fresh each morning, so you never have to re-enter it!
                  </span>
                </div>
              )}
            </div>

            {/* Due Date / Deadline (Only for non-daily quests) */}
            {questType !== 'daily' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-pixel text-[#111113] font-bold uppercase flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-700" />
                    <span>Target Deadline (Optional)</span>
                  </label>
                  {dueDate && (
                    <button
                      type="button"
                      onClick={() => setDueDate('')}
                      className="text-[10px] text-zinc-500 hover:text-red-700 underline"
                    >
                      Clear Deadline
                    </button>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <input
                    type="date"
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    className="px-3 py-1.5 bg-[#f5f4ef] border border-[#18181c] text-xs text-[#111113] font-mono focus:outline-none shadow-pixel-sm"
                  />
                  
                  {/* Quick Pick Pills */}
                  <div className="flex items-center gap-1 flex-wrap text-[10px]">
                    <button
                      type="button"
                      onClick={() => handleSetQuickDate(0)}
                      className="px-2 py-1 bg-[#f5f4ef] border border-[#18181c] hover:bg-[#18181c] hover:text-[#f5f4ef] transition-colors"
                    >
                      Today
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSetQuickDate(1)}
                      className="px-2 py-1 bg-[#f5f4ef] border border-[#18181c] hover:bg-[#18181c] hover:text-[#f5f4ef] transition-colors"
                    >
                      Tomorrow
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSetQuickDate(3)}
                      className="px-2 py-1 bg-[#f5f4ef] border border-[#18181c] hover:bg-[#18181c] hover:text-[#f5f4ef] transition-colors"
                    >
                      +3 Days
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSetQuickDate(7)}
                      className="px-2 py-1 bg-[#f5f4ef] border border-[#18181c] hover:bg-[#18181c] hover:text-[#f5f4ef] transition-colors"
                    >
                      +1 Week
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Attribute Tagger */}
            <div>
              <label className="block text-[11px] font-pixel text-[#111113] font-bold uppercase mb-1">
                Character Attribute Category
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { key: 'intellect', label: 'Intellect', icon: Brain },
                  { key: 'strength', label: 'Strength', icon: Dumbbell },
                  { key: 'creativity', label: 'Creativity', icon: Palette },
                  { key: 'vitality', label: 'Vitality', icon: Zap },
                  { key: 'discipline', label: 'Discipline', icon: Shield },
                ].map(item => {
                  const Icon = item.icon;
                  const isSelected = attribute === item.key;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setAttribute(item.key as AttributeType)}
                      className={`p-2 border flex items-center gap-1.5 transition-all text-xs ${isSelected ? 'bg-[#18181c] text-[#f5f4ef] border-black font-bold shadow-pixel-sm' : 'bg-[#f5f4ef] text-[#111113] border-[#18181c]'}`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Difficulty Selector */}
            <div>
              <label className="block text-[11px] font-pixel text-[#111113] font-bold uppercase mb-1">
                Difficulty Level & Reward Tier
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { key: 'easy', label: 'Easy', xp: '+25 XP', gold: '+15g' },
                  { key: 'medium', label: 'Medium', xp: '+50 XP', gold: '+35g' },
                  { key: 'hard', label: 'Hard', xp: '+100 XP', gold: '+75g' },
                  { key: 'boss', label: 'Boss', xp: '+220 XP', gold: '+150g' },
                ].map(item => {
                  const isSelected = difficulty === item.key;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setDifficulty(item.key as QuestDifficulty)}
                      className={`p-2 border text-center transition-all ${isSelected ? 'bg-[#18181c] text-[#f5f4ef] border-black font-bold shadow-pixel-sm' : 'bg-[#f5f4ef] text-[#111113] border-[#18181c]'}`}
                    >
                      <div className="font-pixel uppercase text-xs">{item.label}</div>
                      <div className="text-[10px] opacity-80">{item.xp} • {item.gold}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Subtasks Builder */}
            <div>
              <label className="block text-[11px] font-pixel text-[#111113] font-bold uppercase mb-1">
                Sub-Task Objectives
              </label>
              
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={newSubtaskInput}
                  onChange={e => setNewSubtaskInput(e.target.value)}
                  placeholder="Add sub-task objective..."
                  className="flex-1 px-3 py-1.5 bg-[#f5f4ef] border border-[#18181c] text-xs text-[#111113] focus:outline-none"
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSubtask();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddSubtask}
                  className="p-1.5 pixel-btn font-pixel text-xs flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>

              {subtasks.length > 0 && (
                <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                  {subtasks.map((sub, idx) => (
                    <div key={sub.id} className="flex items-center justify-between bg-[#f5f4ef] p-1.5 border border-[#18181c] text-xs">
                      <span>{idx + 1}. {sub.title}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSubtask(sub.id)}
                        className="text-[#4a4943] hover:text-red-700 font-bold"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t-2 border-[#18181c]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 pixel-btn font-pixel text-xs uppercase"
              >
                CANCEL
              </button>
              <button
                type="submit"
                className="px-5 py-2 pixel-btn-primary font-pixel text-xs uppercase tracking-wider font-bold"
              >
                {questToEdit ? 'SAVE QUEST CHANGES' : 'CONFIRM & START QUEST'}
              </button>
            </div>

          </form>

        </div>
      </div>
    </div>
  );
};
