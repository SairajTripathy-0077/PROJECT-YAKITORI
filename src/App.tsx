import { useState, useRef, useEffect, type FC } from 'react';
import { AuthProvider } from './context/AuthContext';
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
import { StudyRoomModal } from './components/StudyRoomModal';
import { StudyRoomPage } from './components/StudyRoomPage';

const MainAppContent: FC = () => {
  const { 
    scanlineEnabled, 
    toggleSound
  } = useGame();

  const [viewMode, setViewMode] = useState<'landing' | 'app' | 'study'>('landing');
  const [isQuestModalOpen, setIsQuestModalOpen] = useState(false);
  const [isShopModalOpen, setIsShopModalOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  const [isStudyRoomOpen, setIsStudyRoomOpen] = useState(false);

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
        onOpenStudyRoom={() => setViewMode('study')}
        viewMode={viewMode}
        onToggleViewMode={(mode) => {
          if (mode) {
            setViewMode(mode);
          } else {
            setViewMode(prev => prev === 'landing' ? 'app' : 'landing');
          }
        }}
      />

      {/* Main Content Container */}
      <main className={viewMode === 'landing' ? 'flex-1 w-full flex flex-col' : 'flex-1 max-w-[1700px] w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8'}>
        
        {viewMode === 'landing' ? (
          /* Landing Hero View - Full Edge-to-Edge Image */
          <LandingHero onEnterApp={() => setViewMode('app')} />
        ) : viewMode === 'study' ? (
          /* Hero Guild Study Room Page - All Heroes, Levels, XP, Avatars */
          <StudyRoomPage onBackToDashboard={() => setViewMode('app')} />
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

      <StudyRoomModal
        isOpen={isStudyRoomOpen}
        onClose={() => setIsStudyRoomOpen(false)}
      />

    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <GameProvider>
        <MainAppContent />
      </GameProvider>
    </AuthProvider>
  );
}

export default App;
