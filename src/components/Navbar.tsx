import { useState, useRef, useEffect, type FC } from 'react';
import { useGame } from '../context/GameContext';
import { useAuth } from '../context/AuthContext';
import { AuthModal } from './AuthModal';
import { SpriteCharacter } from './SpriteCharacter';
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
  BookOpen,
  BarChart3,
  Menu,
  ChevronDown,
  LayoutDashboard,
  Sparkles
} from 'lucide-react';

interface NavbarProps {
  onOpenShop: () => void;
  onOpenShortcuts: () => void;
  onOpenNewQuest: () => void;
  onOpenStudyRoom: () => void;
  onOpenAnalytics: () => void;
  viewMode: 'landing' | 'app' | 'study' | 'analytics';
  onToggleViewMode: (mode?: 'landing' | 'app' | 'study' | 'analytics') => void;
}

export const Navbar: FC<NavbarProps> = ({ 
  onOpenShop, 
  onOpenShortcuts,
  onOpenNewQuest,
  onOpenStudyRoom,
  onOpenAnalytics,
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

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
          /* APP DASHBOARD NAVBAR: Player Stats & Menu Dropdown */
          <>
            {/* Center: Player Mini Stats */}
            <div className="flex items-center gap-2 sm:gap-4 bg-[#ebeae4] px-3 py-1.5 border border-[#18181c] font-mono text-xs shadow-pixel-sm">
              {/* Level & Character Avatar */}
              <div className="flex items-center gap-1.5" title="Character Level">
                {playerStats.equippedCharacter !== undefined ? (
                  <SpriteCharacter index={playerStats.equippedCharacter} size={22} alt="Player Avatar" />
                ) : (
                  <Award className="w-4 h-4 text-amber-600" />
                )}
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

            {/* Right: Primary Action + Dropdown Menu */}
            <div className="flex items-center gap-2">
              
              {/* New Quest Button */}
              <button
                onClick={onOpenNewQuest}
                className="flex items-center gap-1.5 px-3.5 py-1.5 pixel-btn-primary font-pixel text-xs font-bold"
                title="Add New Quest (Hotkey: N)"
              >
                <Plus className="w-4 h-4 text-amber-400" />
                <span>NEW QUEST</span>
              </button>

              {/* Dropdown Menu Toggle */}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className={`px-3 py-1.5 pixel-btn flex items-center gap-1.5 font-pixel text-xs font-bold uppercase transition-all ${
                    isMenuOpen ? 'bg-[#18181c] text-[#f5f4ef]' : ''
                  }`}
                  aria-expanded={isMenuOpen}
                  aria-haspopup="true"
                  title="Open Navigation & Settings Menu"
                >
                  <Menu className="w-4 h-4 text-amber-600" />
                  <span className="hidden sm:inline">MENU</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Pixel-Art Dropdown Menu Card */}
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-[#f5f4ef] border-2 border-[#18181c] shadow-pixel-md z-50 animate-fade-in font-mono text-xs text-[#111113] overflow-hidden">
                    
                    {/* User Profile Header in Dropdown */}
                    <div className="p-3 bg-[#ebeae4] border-b border-[#18181c] space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-[#4a4943]">
                        <span>CURRENT HERO</span>
                        <span className="font-bold text-amber-700">Lv.{playerStats.level}</span>
                      </div>
                      <div className="font-bold text-[#111113] truncate">
                        {user ? (user.isAnonymous ? 'Guest Hero' : user.email) : playerStats.name}
                      </div>
                    </div>

                    {/* Navigation Views Group */}
                    <div className="p-1.5 border-b border-[#18181c]/20 space-y-0.5">
                      <div className="px-2.5 py-1 text-[10px] font-pixel text-[#4a4943] uppercase tracking-wider font-bold">
                        Navigation Views
                      </div>
                      
                      <button
                        onClick={() => {
                          onToggleViewMode('app');
                          setIsMenuOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-2 font-mono flex items-center justify-between transition-colors ${
                          viewMode === 'app' ? 'bg-[#18181c] text-[#f5f4ef] font-bold' : 'hover:bg-[#ebeae4]'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <LayoutDashboard className="w-4 h-4 text-amber-600" />
                          <span>Quest Dashboard</span>
                        </span>
                        {viewMode === 'app' && <span className="text-[10px] font-pixel text-amber-400">ACTIVE</span>}
                      </button>

                      <button
                        onClick={() => {
                          onOpenStudyRoom();
                          setIsMenuOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-2 font-mono flex items-center justify-between transition-colors ${
                          viewMode === 'study' ? 'bg-[#18181c] text-[#f5f4ef] font-bold' : 'hover:bg-[#ebeae4]'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-emerald-700" />
                          <span>Hero Study Room</span>
                        </span>
                        {viewMode === 'study' && <span className="text-[10px] font-pixel text-amber-400">ACTIVE</span>}
                      </button>

                      <button
                        onClick={() => {
                          onOpenAnalytics();
                          setIsMenuOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-2 font-mono flex items-center justify-between transition-colors ${
                          viewMode === 'analytics' ? 'bg-[#18181c] text-[#f5f4ef] font-bold' : 'hover:bg-[#ebeae4]'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <BarChart3 className="w-4 h-4 text-indigo-700" />
                          <span>Progress Charts</span>
                        </span>
                        {viewMode === 'analytics' && <span className="text-[10px] font-pixel text-amber-400">ACTIVE</span>}
                      </button>

                      <button
                        onClick={() => {
                          onOpenShop();
                          setIsMenuOpen(false);
                        }}
                        className="w-full text-left px-2.5 py-2 font-mono flex items-center justify-between hover:bg-[#ebeae4] transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <ShoppingBag className="w-4 h-4 text-amber-700" />
                          <span>Armory & Shop</span>
                        </span>
                        <span className="text-[9px] font-pixel font-bold bg-amber-200 text-amber-900 px-1.5 py-0.5 border border-amber-400">
                          192 CHARS
                        </span>
                      </button>
                    </div>

                    {/* Quick Settings & Controls Group */}
                    <div className="p-1.5 border-b border-[#18181c]/20 space-y-0.5">
                      <div className="px-2.5 py-1 text-[10px] font-pixel text-[#4a4943] uppercase tracking-wider font-bold">
                        Settings & Audio
                      </div>

                      <button
                        onClick={toggleSound}
                        className="w-full text-left px-2.5 py-2 font-mono flex items-center justify-between hover:bg-[#ebeae4] transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-700" /> : <VolumeX className="w-4 h-4 text-zinc-400" />}
                          <span>8-Bit SFX Audio</span>
                        </span>
                        <span className={`text-[10px] font-bold ${soundEnabled ? 'text-emerald-700' : 'text-zinc-500'}`}>
                          {soundEnabled ? 'ON' : 'OFF'}
                        </span>
                      </button>

                      <button
                        onClick={toggleScanlines}
                        className="w-full text-left px-2.5 py-2 font-mono flex items-center justify-between hover:bg-[#ebeae4] transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <Tv className={`w-4 h-4 ${scanlineEnabled ? 'text-amber-600' : ''}`} />
                          <span>CRT Scanlines</span>
                        </span>
                        <span className={`text-[10px] font-bold ${scanlineEnabled ? 'text-amber-700' : 'text-zinc-500'}`}>
                          {scanlineEnabled ? 'ON' : 'OFF'}
                        </span>
                      </button>

                      <button
                        onClick={() => {
                          onOpenShortcuts();
                          setIsMenuOpen(false);
                        }}
                        className="w-full text-left px-2.5 py-2 font-mono flex items-center gap-2 hover:bg-[#ebeae4] transition-colors"
                      >
                        <Keyboard className="w-4 h-4 text-indigo-700" />
                        <span>Hotkeys Guide (Esc)</span>
                      </button>
                    </div>

                    {/* Account Actions */}
                    <div className="p-1.5 bg-[#ebeae4]">
                      {user ? (
                        <button
                          onClick={() => {
                            logout();
                            setIsMenuOpen(false);
                          }}
                          className="w-full text-left px-2.5 py-2 font-mono text-red-700 font-bold flex items-center justify-between hover:bg-red-50 transition-colors"
                        >
                          <span className="flex items-center gap-2">
                            <LogOut className="w-4 h-4" />
                            <span>Sign Out</span>
                          </span>
                          <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setIsAuthModalOpen(true);
                            setIsMenuOpen(false);
                          }}
                          className="w-full text-left px-2.5 py-2 font-mono text-amber-800 font-bold flex items-center gap-2 hover:bg-amber-100 transition-colors"
                        >
                          <LogIn className="w-4 h-4" />
                          <span>Sign In / Register</span>
                        </button>
                      )}
                    </div>

                  </div>
                )}
              </div>

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
