import { useState, useRef, useEffect, type FC } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CompanionProvider, useCompanion } from './context/CompanionContext';
import { GameProvider, useGame } from './context/GameContext';
import { Navbar } from './components/Navbar';
import { LandingHero } from './components/LandingHero';
import { PlayerCard } from './components/PlayerCard';
import { StreakTracker } from './components/StreakTracker';
import { QuestList } from './components/QuestList';
import { LevelUpOverlay } from './components/LevelUpOverlay';
import { CharacterCompanion } from './components/character/CharacterCompanion';
import { QuestModal } from './components/QuestModal';
import { ShopModal } from './components/ShopModal';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { StudyRoomModal } from './components/StudyRoomModal';
import { StudyRoomPage } from './components/StudyRoomPage';
import { QuestProgressDashboard } from './components/QuestProgressDashboard';
import { CharacterCreationModal } from './components/CharacterCreationModal';
import { AuthModal } from './components/AuthModal';
import type { Quest } from './types/game';
import { TrendingUp, BarChart3 } from 'lucide-react';

const MainAppContent: FC = () => {
  const { 
    scanlineEnabled, 
    toggleSound,
    playerStats
  } = useGame();

  const { user, dbProfile } = useAuth();
  const { triggerGreeting } = useCompanion();
  // NOTE: triggerGreeting intentionally NOT called on refresh.
  // Character only greets on: actual sign-in, entering dashboard from landing (after customization), task completion, level-up.

  const [viewMode, setViewModeState] = useState<'landing' | 'app' | 'study' | 'analytics'>(() => {
    const saved = localStorage.getItem('yakitodo_view_mode');
    if (saved === 'app' || saved === 'study' || saved === 'analytics') {
      return saved as 'app' | 'study' | 'analytics';
    }
    return 'landing';
  });

  const setViewMode = (
    modeOrUpdater:
      | 'landing'
      | 'app'
      | 'study'
      | 'analytics'
      | ((prev: 'landing' | 'app' | 'study' | 'analytics') => 'landing' | 'app' | 'study' | 'analytics')
  ) => {
    setViewModeState((prev) => {
      const next = typeof modeOrUpdater === 'function' ? modeOrUpdater(prev) : modeOrUpdater;
      localStorage.setItem('yakitodo_view_mode', next);
      return next;
    });
  };

  const [isQuestModalOpen, setIsQuestModalOpen] = useState(false);
  const [isShopModalOpen, setIsShopModalOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  const [isStudyRoomOpen, setIsStudyRoomOpen] = useState(false);
  const [isCharacterCreationOpen, setIsCharacterCreationOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [editingQuest, setEditingQuest] = useState<Quest | null>(null);
  const [defaultDueDate, setDefaultDueDate] = useState<string>('');

  const searchInputRef = useRef<HTMLInputElement | null>(null);
  // Tracks whether CharacterCreationModal was opened by a fresh auth (sign-in/signup) flow.
  // Set to 'LOGIN' or 'NEW_USER' before opening the modal; cleared after greeting fires.
  const pendingGreetingEventRef = useRef<'LOGIN' | 'NEW_USER' | null>(null);

  const handleOpenNewQuest = (dueDate?: string) => {
    setEditingQuest(null);
    setDefaultDueDate(dueDate || '');
    setIsQuestModalOpen(true);
  };

  // Global Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger hotkeys if typing inside input / textarea
      const targetTag = (e.target as HTMLElement)?.tagName?.toUpperCase();
      if (targetTag === 'INPUT' || targetTag === 'TEXTAREA') return;

      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setViewMode('app');
        handleOpenNewQuest();
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
          handleOpenNewQuest();
        }}
        onOpenStudyRoom={() => setViewMode('study')}
        onOpenAnalytics={() => setViewMode('analytics')}
        onOpenCharacterCreation={() => {
          // Opened manually by user (not from auth) — no greeting after
          pendingGreetingEventRef.current = null;
          setIsCharacterCreationOpen(true);
        }}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onAuthSuccess={() => {
          // Triggered after sign-in from Navbar: go to app, mark greeting pending, open customization
          pendingGreetingEventRef.current = 'LOGIN';
          setViewMode('app');
          setIsCharacterCreationOpen(true);
        }}
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
      <main className={viewMode === 'landing' ? 'flex-1 w-full flex flex-col' : 'flex-1 max-w-[1700px] w-full mx-auto p-3.5 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 pb-32 sm:pb-40'}>
        
        {viewMode === 'landing' ? (
          /* Landing Hero View - Full Edge-to-Edge Image */
          <LandingHero onEnterApp={() => {
            // From landing "Enter App" — logged-in user entering dashboard
            pendingGreetingEventRef.current = 'LOGIN';
            setViewMode('app');
            // Only open character creation for brand new default characters
            if (playerStats.name === 'Adventurer') {
              setIsCharacterCreationOpen(true);
            }
          }} />
        ) : viewMode === 'study' ? (
          /* Hero Guild Study Room Page - All Heroes, Levels, XP, Avatars */
          <StudyRoomPage onBackToDashboard={() => setViewMode('app')} />
        ) : viewMode === 'analytics' ? (
          /* Quest Progress & Recharts Analytics Dashboard */
          <QuestProgressDashboard 
            onBackToQuests={() => setViewMode('app')}
          />
        ) : (
          /* App Dashboard View - Full RPG Controls & Stats */
          <div className="space-y-4 sm:space-y-6 animate-fade-in">
            {/* Top Bento Grid: Player Profile & Streak Tracker */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Player Card (Span 2) */}
              <div className="lg:col-span-2">
                <PlayerCard onOpenShop={() => setIsShopModalOpen(true)} />
              </div>

              {/* Streak Tracker (Span 1) */}
              <div className="lg:col-span-1">
                <StreakTracker />
              </div>
            </div>

            {/* Quick Analytics & Quest Log Switcher */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#ebeae4] p-3 border-2 border-[#18181c] shadow-pixel-sm">
              <div className="flex items-center gap-2 font-mono text-xs text-[#111113]">
                <TrendingUp className="w-4 h-4 text-[#111113]" />
                <span className="font-bold">QUEST LOG & METRICS</span>
              </div>
              <button
                onClick={() => setViewMode('analytics')}
                className="px-3 py-1.5 pixel-btn font-pixel text-xs font-bold text-[#111113] flex items-center justify-center gap-1.5 hover:bg-[#deddd6] w-full sm:w-auto"
                title="View animated charts and attribute radar"
              >
                <BarChart3 className="w-3.5 h-3.5 text-[#111113]" />
                <span>DASHBOARD ANALYTICS</span>
              </button>
            </div>

            {/* Main Quest Management Feed */}
            <div className="pt-2">
              <QuestList
                onOpenNewQuest={(dueDate) => handleOpenNewQuest(dueDate)}
                onEditQuest={(quest) => {
                  setEditingQuest(quest);
                  setIsQuestModalOpen(true);
                }}
                searchInputRef={searchInputRef}
              />
            </div>
          </div>
        )}

      </main>

      <LevelUpOverlay />

      {/* Interactive Character Companion (Docked & Active Speech Stage) */}
      {viewMode !== 'landing' && <CharacterCompanion />}

      {/* Modals */}
      <QuestModal
        isOpen={isQuestModalOpen}
        questToEdit={editingQuest}
        defaultDueDate={defaultDueDate}
        onClose={() => {
          setIsQuestModalOpen(false);
          setEditingQuest(null);
          setDefaultDueDate('');
        }}
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
        onCompleted={() => {
          setIsCharacterCreationOpen(false);
          const event = pendingGreetingEventRef.current;
          pendingGreetingEventRef.current = null;
          if (event) {
            // Only greet when opened from an auth flow, not manual edits
            const name = dbProfile?.displayName || playerStats.name || user?.displayName || 'Hero';
            setTimeout(() => {
              triggerGreeting(event, { playerName: name });
            }, 400);
          }
        }}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {
          setIsAuthModalOpen(false);
          // Mark greeting pending and open character customization
          pendingGreetingEventRef.current = 'LOGIN';
          setViewMode('app');
          setIsCharacterCreationOpen(true);
        }}
      />

    </div>
  );
};


export function App() {
  return (
    <AuthProvider>
      <GameProvider>
        <CompanionProvider>
          <MainAppContent />
        </CompanionProvider>
      </GameProvider>
    </AuthProvider>
  );
}

export default App;
