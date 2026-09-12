import { useState, type FC } from 'react';
import { useGame } from '../context/GameContext';
import { useAuth } from '../context/AuthContext';
import { AuthModal } from './AuthModal';
import { 
  Volume2, 
  VolumeX, 
  Tv, 
  ShoppingBag, 
  Keyboard, 
  Flame, 
  Coins, 
  Award,
  Plus,
  ArrowRight,
  UserCheck,
  LogOut,
  LogIn,
  BookOpen
} from 'lucide-react';

interface NavbarProps {
  onOpenShop: () => void;
  onOpenShortcuts: () => void;
  onOpenNewQuest: () => void;
  onOpenStudyRoom: () => void;
  viewMode: 'landing' | 'app' | 'study';
  onToggleViewMode: (mode?: 'landing' | 'app' | 'study') => void;
}

export const Navbar: FC<NavbarProps> = ({ 
  onOpenShop, 
  onOpenShortcuts,
  onOpenNewQuest,
  onOpenStudyRoom,
  viewMode,
  onToggleViewMode
}) => {
  const { 
    playerStats, 
    soundEnabled, 
    toggleSound, 
    scanlineEnabled, 
    toggleScanlines 
  } = useGame();

  const { user, logout } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-[#f5f4ef]/95 backdrop-blur-md border-b-2 border-[#18181c] px-4 py-3">
      <div className="max-w-[1700px] mx-auto flex items-center justify-between gap-4">
        
        {/* Left: App Logo & Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onToggleViewMode()}
            className="flex items-center gap-3 focus:outline-none group text-left"
            title="YAKITORI Pixel RPG"
          >
            <div className="w-9 h-9 bg-[#18181c] text-[#f5f4ef] font-pixel font-bold flex items-center justify-center pixel-border text-sm group-hover:bg-black">
              焼き
            </div>
            <div>
              <h1 className="font-pixel text-base sm:text-lg font-bold tracking-wider text-[#111113] leading-none">
                YAKITORI
              </h1>
              <p className="font-mono text-[10px] text-[#4a4943] uppercase tracking-widest hidden sm:block">
                E-Ink Monochrome Edition
              </p>
            </div>
          </button>
        </div>

        {/* LANDING PAGE NAVBAR: Show Auth status or ENTER ENGINE button */}
        {viewMode === 'landing' ? (
          <div className="flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#111113] bg-[#ebeae4] px-2.5 py-1 border border-[#18181c] hidden sm:inline-block">
                  {user.isAnonymous ? 'GUEST HERO' : user.email || 'HERO'}
                </span>
                <button
                  onClick={() => onToggleViewMode('app')}
                  className="px-4 py-2 pixel-btn-primary font-pixel text-xs font-bold uppercase tracking-wider flex items-center gap-2"
                >
                  <span>ENTER APP</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="px-4 py-2 pixel-btn-primary font-pixel text-xs font-bold uppercase tracking-wider flex items-center gap-2"
              >
                <LogIn className="w-3.5 h-3.5 text-amber-400" />
                <span>SIGN IN</span>
              </button>
            )}
          </div>
        ) : (
          /* APP DASHBOARD NAVBAR: Show full RPG player stats & controls */
          <>
            {/* Center: Player Mini Stats */}
            <div className="flex items-center gap-2 sm:gap-4 bg-[#ebeae4] px-3 py-1.5 border border-[#18181c] font-mono text-xs shadow-pixel-sm">
              {/* Level */}
              <div className="flex items-center gap-1.5" title="Character Level">
                <Award className="w-4 h-4 text-amber-600" />
                <span className="font-pixel font-bold text-[#111113]">
                  Lv.{playerStats.level}
                </span>
              </div>

              <div className="h-4 w-px bg-[#18181c]/30"></div>

              {/* Gold */}
              <div className="flex items-center gap-1 text-amber-700 font-bold" title="Gold Currency">
                <Coins className="w-4 h-4" />
                <span>{playerStats.gold}g</span>
              </div>

              <div className="h-4 w-px bg-[#18181c]/30"></div>

              {/* Streak */}
              <div className="flex items-center gap-1 text-orange-600 font-bold" title={`Current Streak: ${playerStats.streakDays} Days (${playerStats.activeMultiplier}x XP)`}>
                <Flame className="w-4 h-4 animate-pulse" />
                <span>{playerStats.streakDays}d</span>
              </div>
            </div>

            {/* Right: Actions & Controls */}
            <div className="flex items-center gap-2">
              
              {/* User Identity / Logout Button */}
              {user ? (
                <button
                  onClick={() => logout()}
                  className="px-2.5 py-1.5 pixel-btn flex items-center gap-1 text-xs font-mono"
                  title={`Logged in as ${user.email || 'Guest'}. Click to Logout.`}
                >
                  <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
                  <span className="hidden lg:inline text-[11px] max-w-[100px] truncate">
                    {user.isAnonymous ? 'Guest' : user.email?.split('@')[0]}
                  </span>
                  <LogOut className="w-3.5 h-3.5 text-red-600" />
                </button>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="px-2.5 py-1.5 pixel-btn flex items-center gap-1 text-xs font-mono"
                  title="Sign In"
                >
                  <LogIn className="w-3.5 h-3.5 text-amber-600" />
                  <span className="hidden lg:inline text-[11px]">Sign In</span>
                </button>
              )}

              {/* New Quest Button */}
              <button
                onClick={onOpenNewQuest}
                className="flex items-center gap-1.5 px-3 py-1.5 pixel-btn-primary font-pixel text-xs font-bold"
                title="Add New Quest (Hotkey: N)"
              >
                <Plus className="w-4 h-4 text-amber-400" />
                <span className="hidden md:inline">NEW QUEST</span>
              </button>

              {/* Study Room */}
              <button
                onClick={onOpenStudyRoom}
                className={`p-2 pixel-btn flex items-center gap-1 text-xs font-mono transition-all ${
                  viewMode === 'study' ? 'bg-[#18181c] text-[#f5f4ef] shadow-pixel-sm' : ''
                }`}
                title="Hero Study Room & Pomodoro Timer"
                aria-label="Open Study Room"
              >
                <BookOpen className={`w-4 h-4 ${viewMode === 'study' ? 'text-amber-400' : 'text-emerald-700'}`} />
                <span className="hidden xl:inline text-[11px] font-pixel font-bold uppercase">STUDY ROOM</span>
              </button>

              {/* Shop */}
              <button
                onClick={onOpenShop}
                className="p-2 pixel-btn"
                title="Armory & Shop"
                aria-label="Open Shop"
              >
                <ShoppingBag className="w-4 h-4" />
              </button>

              {/* Sound Toggle */}
              <button
                onClick={toggleSound}
                className="p-2 pixel-btn"
                title={soundEnabled ? 'Mute SFX (Hotkey: M)' : 'Enable 8-Bit SFX (Hotkey: M)'}
                aria-label="Toggle Sound Effects"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-zinc-400" />}
              </button>

              {/* Scanline CRT Toggle */}
              <button
                onClick={toggleScanlines}
                className={`p-2 pixel-btn ${scanlineEnabled ? 'bg-amber-400 text-black' : ''}`}
                title="Toggle Scanline CRT Overlay"
                aria-label="Toggle Scanlines"
              >
                <Tv className="w-4 h-4" />
              </button>

              {/* Shortcuts Guide */}
              <button
                onClick={onOpenShortcuts}
                className="p-2 pixel-btn hidden sm:block"
                title="Keyboard Shortcuts"
                aria-label="Open Keyboard Shortcuts"
              >
                <Keyboard className="w-4 h-4" />
              </button>
            </div>
          </>
        )}

      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => onToggleViewMode()}
      />
    </header>
  );
};
