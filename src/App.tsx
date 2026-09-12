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
import { QuestProgressDashboard } from './components/QuestProgressDashboard';
import { CharacterCreationModal } from './components/CharacterCreationModal';
import { TrendingUp, BarChart3 } from 'lucide-react';

const MainAppContent: FC = () => {
  const { 
    scanlineEnabled, 
    toggleSound
  } = useGame();

  const [viewMode, setViewMode] = useState<'landing' | 'app' | 'study' | 'analytics'>('landing');
  const [isQuestModalOpen, setIsQuestModalOpen] = useState(false);
  const [isShopModalOpen, setIsShopModalOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  const [isStudyRoomOpen, setIsStudyRoomOpen] = useState(false);
  const [isCharacterCreationOpen, setIsCharacterCreationOpen] = useState(false);

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
        onOpenAnalytics={() => setViewMode('analytics')}
        onOpenCharacterCreation={() => setIsCharacterCreationOpen(true)}
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
          <LandingHero onEnterApp={() => {
            setViewMode('app');
            setIsCharacterCreationOpen(true);
          }} />
        ) : viewMode === 'study' ? (
          /* Hero Guild Study Room Page - All Heroes, Levels, XP, Avatars */
          <StudyRoomPage onBackToDashboard={() => setViewMode('app')} />
        ) : viewMode === 'analytics' ? (
          /* Quest Progress & Recharts Analytics Dashboard */
          <QuestProgressDashboard 
            onBackToQuests={() => setViewMode('app')}
            onOpenCharacterCreation={() => setIsCharacterCreationOpen(true)}
          />
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

            {/* Quick Analytics & Quest Log Switcher */}
            <div className="flex items-center justify-between bg-[#ebeae4] p-3 border-2 border-[#18181c] shadow-pixel-sm">
              <div className="flex items-center gap-2 font-mono text-xs text-[#33322d]">
                <TrendingUp className="w-4 h-4 text-amber-700" />
                <span className="font-bold">QUEST LOG & METRICS</span>
              </div>
              <button
                onClick={() => setViewMode('analytics')}
                className="px-3 py-1.5 pixel-btn font-pixel text-xs font-bold text-[#111113] flex items-center gap-1.5 hover:bg-[#deddd6]"
                title="View animated charts and attribute radar"
              >
                <BarChart3 className="w-3.5 h-3.5 text-indigo-700" />
                <span>PROGRESS CHARTS</span>
              </button>
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

      <CharacterCreationModal
        isOpen={isCharacterCreationOpen}
        onClose={() => setIsCharacterCreationOpen(false)}
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
