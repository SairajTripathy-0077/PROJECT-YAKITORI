import { useState, useRef, useEffect, type FC } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { Navbar } from './components/Navbar';
import { LandingHero } from './components/LandingHero';
import { PlayerCard } from './components/PlayerCard';
import { StreakTracker } from './components/StreakTracker';
import { QuestList } from './components/QuestList';
import { LevelUpOverlay } from './components/LevelUpOverlay';
import { QuestModal } from './components/QuestModal';
import { ShopModal } from './components/ShopModal';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { RotateCcw, Sparkles } from 'lucide-react';

const MainAppContent: FC = () => {
  const { 
    scanlineEnabled, 
    toggleSound, 
    resetAllProgress 
  } = useGame();

  const [viewMode, setViewMode] = useState<'landing' | 'app'>('landing');
  const [isQuestModalOpen, setIsQuestModalOpen] = useState(false);
  const [isShopModalOpen, setIsShopModalOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Global Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger hotkeys if typing inside input / textarea
      const targetTag = (e.target as HTMLElement)?.tagName?.toUpperCase();
      if (targetTag === 'INPUT' || targetTag === 'TEXTAREA') return;

      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setViewMode('app');
        setIsQuestModalOpen(true);
      } else if (e.key === '/') {
        e.preventDefault();
        setViewMode('app');
        setTimeout(() => searchInputRef.current?.focus(), 100);
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        toggleSound();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSound]);

  return (
    <div className={`min-h-screen flex flex-col ${scanlineEnabled ? 'scanlines' : ''} eink-texture bg-[#f5f4ef] text-[#111113]`}>
      
      {/* Top Navbar */}
      <Navbar
        onOpenShop={() => {
          setViewMode('app');
          setIsShopModalOpen(true);
        }}
        onOpenShortcuts={() => setIsShortcutsModalOpen(true)}
        onOpenNewQuest={() => {
          setViewMode('app');
          setIsQuestModalOpen(true);
        }}
        viewMode={viewMode}
        onToggleViewMode={() => setViewMode(prev => prev === 'landing' ? 'app' : 'landing')}
      />

      {/* Main Content Container */}
      <main className={viewMode === 'landing' ? 'flex-1 w-full' : 'flex-1 max-w-[1700px] w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8'}>
        
        {viewMode === 'landing' ? (
          /* Landing Hero View - Full Edge-to-Edge Image */
          <LandingHero onEnterApp={() => setViewMode('app')} />
        ) : (
          /* App Dashboard View - Full RPG Controls & Stats */
          <div className="space-y-6 animate-fade-in">
            {/* Top Bento Grid: Player Profile & Streak Tracker */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Player Card (Span 2) */}
              <div className="lg:col-span-2">
                <PlayerCard />
              </div>

              {/* Streak Tracker (Span 1) */}
              <div className="lg:col-span-1">
                <StreakTracker />
              </div>
            </div>

            {/* Main Quest Management Feed */}
            <div className="pt-2">
              <QuestList
                onOpenNewQuest={() => setIsQuestModalOpen(true)}
                searchInputRef={searchInputRef}
              />
            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t-2 border-[#18181c] bg-[#ebeae4] py-6 px-4 text-center font-mono text-xs text-[#4a4943] mt-12">
        <div className="max-w-[1700px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span className="font-bold text-[#111113]">YAKITORI // E-Ink Monochrome RPG Quest Engine</span>
          </div>

          <p className="font-serif italic text-zinc-600 text-xs">
            Kindle Bookerly Typography • Off-White Paper Hardware Architecture
          </p>

          <div className="flex items-center gap-4">
            {viewMode === 'app' && (
              <button
                onClick={() => setViewMode('landing')}
                className="text-[11px] underline font-pixel font-bold hover:text-black"
              >
                ← Landing Page
              </button>
            )}

            <button
              onClick={() => {
                if (window.confirm('Reset all RPG quest progress to default state?')) {
                  resetAllProgress();
                }
              }}
              className="flex items-center gap-1 text-[11px] text-zinc-600 hover:text-red-600 transition-colors"
              title="Reset progress to default"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Demo</span>
            </button>
          </div>
        </div>
      </footer>

      <LevelUpOverlay />

      {/* Modals */}
      <QuestModal
        isOpen={isQuestModalOpen}
        onClose={() => setIsQuestModalOpen(false)}
      />

      <ShopModal
        isOpen={isShopModalOpen}
        onClose={() => setIsShopModalOpen(false)}
      />

      <KeyboardShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
      />

    </div>
  );
};

export function App() {
  return (
    <GameProvider>
      <MainAppContent />
    </GameProvider>
  );
}

export default App;
