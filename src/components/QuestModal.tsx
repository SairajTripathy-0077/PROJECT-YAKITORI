import { useState, useEffect, type FC } from 'react';
import { useGame } from '../context/GameContext';
import type { AttributeType, QuestDifficulty, QuestType } from '../types/game';
import { X, Plus, Trash2, Sparkles, Brain, Dumbbell, Palette, Zap, Shield } from 'lucide-react';

interface QuestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuestModal: FC<QuestModalProps> = ({ isOpen, onClose }) => {
  const { addQuest } = useGame();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [attribute, setAttribute] = useState<AttributeType>('intellect');
  const [difficulty, setDifficulty] = useState<QuestDifficulty>('medium');
  const [questType, setQuestType] = useState<QuestType>('main');
  const [subtasks, setSubtasks] = useState<{ id: string; title: string; completed: boolean }[]>([]);
  const [newSubtaskInput, setNewSubtaskInput] = useState('');

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addQuest({
      title: title.trim(),
      description: description.trim() || undefined,
      attribute,
      difficulty,
      questType,
      subtasks,
    });

    // Reset Form
    setTitle('');
    setDescription('');
    setAttribute('intellect');
    setDifficulty('medium');
    setQuestType('main');
    setSubtasks([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="double-bezel max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="double-bezel-inner bg-[#ebeae4] text-[#111113] p-5 border border-[#18181c] relative">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-[#18181c] pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-600" />
              <h2 className="font-pixel text-base font-bold uppercase tracking-wider text-[#111113]">
                CREATE NEW QUEST
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
                className="w-full px-3 py-2 bg-[#f5f4ef] border border-[#18181c] text-[#111113] text-sm focus:outline-none font-serif font-bold"
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
                  { key: 'easy', label: 'Easy', xp: '+20 XP', gold: '+15g' },
                  { key: 'medium', label: 'Medium', xp: '+45 XP', gold: '+30g' },
                  { key: 'hard', label: 'Hard', xp: '+90 XP', gold: '+65g' },
                  { key: 'boss', label: 'Boss', xp: '+180 XP', gold: '+120g' },
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

            {/* Quest Type */}
            <div>
              <label className="block text-[11px] font-pixel text-[#111113] font-bold uppercase mb-1">
                Quest Type
              </label>
              <div className="flex gap-2">
                {[
                  { key: 'main', label: 'Main Quest' },
                  { key: 'side', label: 'Side Quest' },
                  { key: 'daily', label: 'Daily Habit' },
                ].map(type => (
                  <button
                    key={type.key}
                    type="button"
                    onClick={() => setQuestType(type.key as QuestType)}
                    className={`flex-1 py-1.5 px-2 border text-xs font-pixel uppercase text-center ${questType === type.key ? 'bg-[#18181c] text-[#f5f4ef] font-bold' : 'bg-[#f5f4ef] text-[#111113] border-[#18181c]'}`}
                  >
                    {type.label}
                  </button>
                ))}
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
                  placeholder="Add sub-task..."
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
                CONFIRM & START QUEST
              </button>
            </div>

          </form>

        </div>
      </div>
    </div>
  );
};
