import { useEffect, type FC } from 'react';
import { X, Keyboard } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: FC<KeyboardShortcutsModalProps> = ({ isOpen, onClose }) => {
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

  const shortcuts = [
    { key: 'N', action: 'Create New Quest' },
    { key: '/', action: 'Focus Search Bar' },
    { key: 'M', action: 'Toggle 8-Bit Sound Effects' },
    { key: 'Tab', action: 'Navigate Keyboard Focus' },
    { key: 'Space / Enter', action: 'Toggle Quest Completion' },
    { key: 'Esc', action: 'Close Modals / Overlays' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="double-bezel max-w-md w-full">
        <div className="double-bezel-inner bg-[#ebeae4] text-[#111113] p-5 border border-[#18181c] relative">
          
          <div className="flex items-center justify-between border-b-2 border-[#18181c] pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Keyboard className="w-5 h-5 text-amber-600" />
              <h2 className="font-pixel text-base font-bold uppercase tracking-wider text-[#111113]">
                KEYBOARD HOTKEYS
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-[#4a4943] hover:text-black font-bold"
              title="Close modal (Esc)"
              aria-label="Close keyboard shortcuts modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="font-serif text-xs text-[#4a4943] mb-4 leading-relaxed italic">
            YAKITODO is fully accessible and navigable via keyboard hotkeys for maximum productivity.
          </p>

          <div className="space-y-2 font-mono text-xs mb-6">
            {shortcuts.map((sc, idx) => (
              <div key={idx} className="flex items-center justify-between p-2.5 bg-[#f5f4ef] border border-[#18181c]">
                <span className="text-[#111113] font-serif font-bold">{sc.action}</span>
                <kbd className="px-2 py-1 bg-[#18181c] text-[#f5f4ef] font-pixel font-bold text-xs shadow-pixel-sm">
                  {sc.key}
                </kbd>
              </div>
            ))}
          </div>

          <button
            onClick={onClose}
            className="w-full py-2.5 pixel-btn-primary font-pixel font-bold text-xs uppercase tracking-wider"
          >
            GOT IT
          </button>

        </div>
      </div>
    </div>
  );
};
