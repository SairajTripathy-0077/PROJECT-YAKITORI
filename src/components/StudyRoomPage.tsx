import { useState, useEffect, useRef, type FC } from 'react';
import { 
  BookOpen, 
  Users, 
  Award, 
  Flame, 
  Play, 
  Pause, 
  RotateCcw, 
  Headphones, 
  Sparkles, 
  Shield, 
  Zap, 
  CheckCircle2,
  Search,
  Trophy,
  UserCheck
} from 'lucide-react';
import { useGame } from '../context/GameContext';
import { useAuth } from '../context/AuthContext';
import { playSound } from '../utils/sound';
import { api } from '../utils/api';

export interface StudyHero {
  id: string;
  displayName: string;
  email?: string | null;
  photoURL?: string | null;
  level: number;
  xp: number;
  streakDays: number;
  characterClass: string;
  avatarIcon: string;
  isOnline: boolean;
  currentTask?: string;
  isStudying?: boolean;
}

type TimerMode = 'work' | 'shortBreak' | 'longBreak';

const MODE_TIMES: Record<TimerMode, number> = {
  work: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

export const StudyRoomPage: FC<{ onBackToDashboard: () => void }> = ({ onBackToDashboard }) => {
  const { playerStats, quests, completeQuest, gainXP } = useGame();
  const { user, dbProfile } = useAuth();

  // Current logged in hero details
  const currentHeroName = dbProfile?.displayName || user?.displayName || user?.email?.split('@')[0] || 'You (Current Hero)';
  const currentHeroAvatar = playerStats.characterClass === 'Mage' ? '🧙‍♂️' : playerStats.characterClass === 'Rogue' ? '🥷' : playerStats.characterClass === 'Paladin' ? '🛡️' : '⚔️';

  // Pomodoro state
  const [mode, setMode] = useState<TimerMode>('work');
  const [timeLeft, setTimeLeft] = useState(MODE_TIMES.work);
  const [isActive, setIsActive] = useState(false);
  const [selectedQuestId, setSelectedQuestId] = useState<string>('');
  const [ambientSound, setAmbientSound] = useState<boolean>(false);
  const [completedSessions, setCompletedSessions] = useState(0);

  // Roster state - exclusively real MongoDB users
  const [roster, setRoster] = useState<StudyHero[]>([]);
  const [filterMode, setFilterMode] = useState<'all' | 'online' | 'top'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const ambientOscRef = useRef<OscillatorNode | null>(null);

  // Fetch backend members roster & sync current player stats to MongoDB
  useEffect(() => {
    const syncAndFetchMembers = async () => {
      try {
        // First sync current player stats to MongoDB so user record is live
        if (user) {
          await api.post('/api/auth/sync', {
            level: playerStats.level,
            xp: playerStats.xp,
            streakDays: playerStats.streakDays,
            characterClass: playerStats.characterClass,
            avatarIcon: currentHeroAvatar,
          }).catch(() => {});
        }

        // Fetch all actual MongoDB user documents
        const res = await api.get<{ data: Array<{
          _id?: string;
          displayName?: string;
          email?: string;
          photoURL?: string;
          level?: number;
          xp?: number;
          streakDays?: number;
          characterClass?: string;
          avatarIcon?: string;
        }> }>('/api/auth/members');

        if (res.data && Array.isArray(res.data)) {
          const apiHeroes: StudyHero[] = res.data.map((u, idx) => ({
            id: u._id || `user-${idx}`,
            displayName: u.displayName || u.email?.split('@')[0] || 'Hero',
            email: u.email,
            photoURL: u.photoURL,
            level: u.level || 1,
            xp: u.xp || 0,
            streakDays: u.streakDays || 1,
            characterClass: u.characterClass || 'Warrior',
            avatarIcon: u.avatarIcon || (u.characterClass === 'Mage' ? '🧙‍♂️' : u.characterClass === 'Rogue' ? '🥷' : u.characterClass === 'Paladin' ? '🛡️' : '⚔️'),
            isOnline: true,
            isStudying: idx === 0,
            currentTask: u.displayName === currentHeroName ? 'Active Study Session' : 'Studying in Guild',
          }));

          // Set roster directly from MongoDB actual users
          setRoster(apiHeroes);
        }
      } catch {
        // Handle offline or single player mode
      }
    };

    syncAndFetchMembers();
    const pollInterval = setInterval(syncAndFetchMembers, 10000);
    return () => clearInterval(pollInterval);
  }, [user, playerStats.level, playerStats.xp, playerStats.streakDays, playerStats.characterClass, currentHeroAvatar, currentHeroName]);

  // Pomodoro countdown timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      playSound('levelUp');
      setCompletedSessions((prev) => prev + 1);

      // Award XP to player
      gainXP(50);

      // Auto reward if active quest selected
      if (selectedQuestId && mode === 'work') {
        completeQuest(selectedQuestId);
      }

      // Reset timer for next mode
      if (mode === 'work') {
        const nextMode = (completedSessions + 1) % 4 === 0 ? 'longBreak' : 'shortBreak';
        setMode(nextMode);
        setTimeLeft(MODE_TIMES[nextMode]);
      } else {
        setMode('work');
        setTimeLeft(MODE_TIMES.work);
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, mode, selectedQuestId, completedSessions, completeQuest, gainXP]);

  // Ambient sound synthesizer
  useEffect(() => {
    if (ambientSound) {
      try {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new AudioContextClass();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(110, ctx.currentTime);
        gain.gain.setValueAtTime(0.02, ctx.currentTime);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();

        ambientOscRef.current = osc;
      } catch {
        // Ignore AudioContext issues
      }
    } else {
      if (ambientOscRef.current) {
        try {
          ambientOscRef.current.stop();
          ambientOscRef.current.disconnect();
        } catch {
          // Ignore
        }
        ambientOscRef.current = null;
      }
    }

    return () => {
      if (ambientOscRef.current) {
        try {
          ambientOscRef.current.stop();
          ambientOscRef.current.disconnect();
        } catch {
          // Ignore
        }
        ambientOscRef.current = null;
      }
    };
  }, [ambientSound]);

  const handleModeChange = (newMode: TimerMode) => {
    playSound('click');
    setMode(newMode);
    setTimeLeft(MODE_TIMES[newMode]);
    setIsActive(false);
  };

  const toggleTimer = () => {
    playSound('click');
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    playSound('click');
    setIsActive(false);
    setTimeLeft(MODE_TIMES[mode]);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = Math.round(((MODE_TIMES[mode] - timeLeft) / MODE_TIMES[mode]) * 100);

  // Filtered & Sorted roster
  const filteredRoster = roster
    .filter((hero) => {
      if (filterMode === 'online' && !hero.isOnline) return false;
      if (searchQuery) {
        return (
          (hero.displayName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (hero.characterClass || '').toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (filterMode === 'top') return b.level - a.level || b.xp - a.xp;
      return 0;
    });

  return (
    <div className="max-w-[1700px] mx-auto p-4 sm:p-6 lg:p-8 space-y-8 animate-fade-in text-[#111113]">
      
      {/* Top Banner Header */}
      <div className="double-bezel">
        <div className="double-bezel-inner bg-[#f5f4ef] p-6 sm:p-8 border-2 border-[#18181c] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#18181c] text-[#f5f4ef] flex items-center justify-center font-pixel text-xl border-2 border-black shadow-pixel-sm shrink-0">
                📖
              </div>
              <div>
                <h1 className="font-pixel text-2xl sm:text-3xl font-bold uppercase tracking-wider text-[#111113]">
                  HERO GUILD STUDY ROOM
                </h1>
                <p className="font-mono text-xs text-[#4a4943] uppercase tracking-widest font-semibold">
                  Co-Working Study Hall • Live Level & XP Leaderboard
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              playSound('click');
              onBackToDashboard();
            }}
            className="px-5 py-2.5 bg-[#18181c] text-[#f5f4ef] font-pixel text-xs font-bold uppercase tracking-wider border-2 border-black hover:bg-black transition-all duration-150 hover:-translate-y-0.5 active:scale-[0.96] flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-[#18181c] focus-visible:outline-none"
          >
            <span>← BACK TO QUEST BOARD</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Pomodoro Focus Station & Member Leaderboard Roster */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (1 Col): Interactive Pomodoro Station & Current Player Card */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Current Player Card in Study Hall */}
          <div className="double-bezel">
            <div className="double-bezel-inner bg-[#f2f7f4] p-5 border-2 border-[#18181c] space-y-4">
              <div className="flex items-center justify-between border-b-2 border-[#18181c] pb-3">
                <span className="font-pixel text-xs font-bold uppercase text-[#111113] flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-emerald-800" strokeWidth={2} />
                  YOUR STUDY HERO
                </span>
                <span className="font-mono text-[11px] bg-[#18181c] text-[#f5f4ef] px-2 py-0.5 font-bold">
                  {isActive ? '🟢 STUDYING' : '⚪ IDLE'}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-[#f5f4ef] border-2 border-[#18181c] flex items-center justify-center text-3xl shadow-pixel-sm shrink-0 transition-transform duration-150 hover:scale-105">
                  {currentHeroAvatar}
                </div>
                <div className="space-y-1 min-w-0 flex-1">
                  <h3 className="font-pixel text-sm font-bold text-[#111113] truncate">
                    {currentHeroName}
                  </h3>
                  <div className="flex items-center gap-2 font-mono text-xs text-[#33322d] font-semibold">
                    <span className="font-bold text-amber-800">Lv.{playerStats.level}</span>
                    <span>•</span>
                    <span>{playerStats.characterClass}</span>
                    <span>•</span>
                    <span className="text-amber-800 font-bold">🔥 {playerStats.streakDays}d</span>
                  </div>
                </div>
              </div>

              {/* XP Progress Bar */}
              <div className="space-y-1.5 font-mono text-xs">
                <div className="flex justify-between text-[11px]">
                  <span className="text-[#4a4943] font-semibold">XP Progress:</span>
                  <span className="font-bold text-[#111113]">{playerStats.xp} / {playerStats.nextLevelXp || playerStats.xpToNextLevel || 150} XP</span>
                </div>
                <div className="w-full h-3 bg-[#d9d8d2] border border-[#18181c] overflow-hidden">
                  <div 
                    className="h-full bg-amber-600 transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.round((playerStats.xp / (playerStats.nextLevelXp || playerStats.xpToNextLevel || 150)) * 100))}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Pomodoro Focus Timer Card */}
          <div className="double-bezel">
            <div className="double-bezel-inner bg-[#f5f4ef] p-6 border-2 border-[#18181c] space-y-5">
              <div className="flex items-center justify-between border-b-2 border-[#18181c] pb-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[#18181c]" strokeWidth={2} />
                  <h3 className="font-pixel text-sm font-bold uppercase text-[#111113]">
                    POMODORO FOCUS ENGINE
                  </h3>
                </div>
              </div>

              {/* Mode Selectors */}
              <div className="flex border-2 border-[#18181c] p-1 bg-[#ebeae4]" role="tablist">
                <button
                  role="tab"
                  aria-selected={mode === 'work'}
                  onClick={() => handleModeChange('work')}
                  className={`flex-1 py-1.5 font-pixel text-[11px] uppercase font-bold transition-all duration-150 active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-[#18181c] focus-visible:outline-none ${
                    mode === 'work' ? 'bg-[#18181c] text-[#f5f4ef] shadow-pixel-sm' : 'text-[#33322d] hover:text-black hover:bg-[#deddd6]'
                  }`}
                >
                  Focus (25m)
                </button>
                <button
                  role="tab"
                  aria-selected={mode === 'shortBreak'}
                  onClick={() => handleModeChange('shortBreak')}
                  className={`flex-1 py-1.5 font-pixel text-[11px] uppercase font-bold transition-all duration-150 active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-[#18181c] focus-visible:outline-none ${
                    mode === 'shortBreak' ? 'bg-[#18181c] text-[#f5f4ef] shadow-pixel-sm' : 'text-[#33322d] hover:text-black hover:bg-[#deddd6]'
                  }`}
                >
                  Rest (5m)
                </button>
                <button
                  role="tab"
                  aria-selected={mode === 'longBreak'}
                  onClick={() => handleModeChange('longBreak')}
                  className={`flex-1 py-1.5 font-pixel text-[11px] uppercase font-bold transition-all duration-150 active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-[#18181c] focus-visible:outline-none ${
                    mode === 'longBreak' ? 'bg-[#18181c] text-[#f5f4ef] shadow-pixel-sm' : 'text-[#33322d] hover:text-black hover:bg-[#deddd6]'
                  }`}
                >
                  Break (15m)
                </button>
              </div>

              {/* Timer Screen */}
              <div className="bg-[#ebeae4] border-2 border-[#18181c] p-6 text-center shadow-inner space-y-4">
                <div 
                  role="timer" 
                  aria-live="polite" 
                  aria-label={`Pomodoro timer: ${formatTime(timeLeft)} remaining`}
                  className="font-mono text-5xl font-bold tracking-tighter text-[#111113]"
                >
                  {formatTime(timeLeft)}
                </div>

                {/* Progress bar */}
                <div className="w-full h-2.5 bg-[#d9d8d2] border border-[#18181c] overflow-hidden" aria-hidden="true">
                  <div 
                    className="h-full bg-[#18181c] transition-all duration-1000"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-3 pt-1">
                  <button
                    onClick={toggleTimer}
                    aria-label={isActive ? 'Pause Pomodoro Timer' : 'Start Focus Timer'}
                    className="px-6 py-2.5 bg-[#18181c] text-[#f5f4ef] font-pixel text-xs uppercase font-bold border-2 border-black hover:bg-black transition-all duration-150 hover:-translate-y-0.5 active:scale-[0.96] flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-[#18181c] focus-visible:outline-none"
                  >
                    {isActive ? <Pause className="w-4 h-4 text-amber-400" strokeWidth={2} /> : <Play className="w-4 h-4 text-amber-400" strokeWidth={2} />}
                    <span>{isActive ? 'Pause' : 'Start Focus'}</span>
                  </button>

                  <button
                    onClick={resetTimer}
                    aria-label="Reset Pomodoro Timer"
                    className="p-2.5 bg-[#f5f4ef] text-[#111113] border-2 border-[#18181c] hover:bg-white transition-all duration-150 active:scale-[0.96] shadow-pixel-sm focus-visible:ring-2 focus-visible:ring-[#18181c] focus-visible:outline-none"
                    title="Reset Timer"
                  >
                    <RotateCcw className="w-4 h-4" strokeWidth={2} />
                  </button>
                </div>
              </div>

              {/* Options */}
              <div className="space-y-3 font-mono text-xs">
                <div>
                  <label 
                    htmlFor="link-quest-select" 
                    className="block font-bold uppercase mb-1 text-[#111113] flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-700" strokeWidth={2} />
                    <span>Link Quest for Completion:</span>
                  </label>
                  <select
                    id="link-quest-select"
                    value={selectedQuestId}
                    onChange={(e) => setSelectedQuestId(e.target.value)}
                    className="w-full p-2 bg-[#ebeae4] border-2 border-[#18181c] text-[#111113] font-mono text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-[#18181c]"
                  >
                    <option value="">-- Select Active Quest (Optional) --</option>
                    {quests
                      .filter((q) => !q.completed)
                      .map((q) => (
                        <option key={q.id} value={q.id}>
                          [{(q.category || 'QUEST').toUpperCase()}] {q.title} (+{q.xpReward} XP)
                        </option>
                      ))}
                  </select>
                </div>

                <div className="flex items-center justify-between bg-[#ebeae4] p-3 border-2 border-[#18181c]">
                  <div className="flex items-center gap-2">
                    <Headphones className="w-4 h-4 text-[#18181c]" strokeWidth={2} />
                    <span className="font-bold uppercase text-xs text-[#111113]">Lofi Drone Sound</span>
                  </div>
                  <button
                    onClick={() => {
                      playSound('click');
                      setAmbientSound(!ambientSound);
                    }}
                    aria-pressed={ambientSound}
                    aria-label="Toggle Lofi Drone Ambiance Sound"
                    className={`px-3 py-1 font-pixel text-xs border border-[#18181c] font-bold uppercase transition-all duration-150 active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-[#18181c] focus-visible:outline-none ${
                      ambientSound ? 'bg-[#18181c] text-[#f5f4ef]' : 'bg-[#f5f4ef] text-[#18181c]'
                    }`}
                  >
                    {ambientSound ? 'ON' : 'OFF'}
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Right Column (2 Cols): Study Room Roster & Character Cards */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Header Controls & Filters */}
          <div className="double-bezel">
            <div className="double-bezel-inner bg-[#f5f4ef] p-5 border-2 border-[#18181c] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#18181c]" strokeWidth={2} />
                <h2 className="font-pixel text-base font-bold uppercase tracking-wide text-[#111113]">
                  HERO ROSTER & LEADERBOARD ({filteredRoster.length})
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Search input */}
                <div className="relative flex-1 sm:w-48">
                  <label htmlFor="hero-search-input" className="sr-only">Filter study heroes</label>
                  <Search className="w-3.5 h-3.5 text-[#4a4943] absolute left-2.5 top-1/2 -translate-y-1/2" strokeWidth={2} />
                  <input
                    id="hero-search-input"
                    type="text"
                    placeholder="Filter heroes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-[#ebeae4] border border-[#18181c] text-xs font-mono text-[#111113] placeholder:text-[#66655e] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#18181c]"
                  />
                </div>

                {/* Filter Tabs */}
                <div className="flex border border-[#18181c] p-0.5 bg-[#ebeae4]" role="tablist">
                  <button
                    role="tab"
                    aria-selected={filterMode === 'all'}
                    onClick={() => setFilterMode('all')}
                    className={`px-2.5 py-1 font-pixel text-[10px] uppercase font-bold transition-all duration-150 active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-[#18181c] focus-visible:outline-none ${
                      filterMode === 'all' ? 'bg-[#18181c] text-[#f5f4ef]' : 'text-[#33322d] hover:text-black'
                    }`}
                  >
                    All
                  </button>
                  <button
                    role="tab"
                    aria-selected={filterMode === 'online'}
                    onClick={() => setFilterMode('online')}
                    className={`px-2.5 py-1 font-pixel text-[10px] uppercase font-bold transition-all duration-150 active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-[#18181c] focus-visible:outline-none ${
                      filterMode === 'online' ? 'bg-[#18181c] text-[#f5f4ef]' : 'text-[#33322d] hover:text-black'
                    }`}
                  >
                    🟢 Active
                  </button>
                  <button
                    role="tab"
                    aria-selected={filterMode === 'top'}
                    onClick={() => setFilterMode('top')}
                    className={`px-2.5 py-1 font-pixel text-[10px] uppercase font-bold transition-all duration-150 active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-[#18181c] focus-visible:outline-none ${
                      filterMode === 'top' ? 'bg-[#18181c] text-[#f5f4ef]' : 'text-[#33322d] hover:text-black'
                    }`}
                  >
                    🏆 Top XP
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Hero Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Empty State when filter yields no heroes */}
            {filteredRoster.length === 0 && (
              <div className="col-span-full text-center p-8 bg-[#ebeae4] border-2 border-dashed border-[#18181c]/40 space-y-2">
                <p className="font-pixel text-sm font-bold text-[#111113]">NO OTHER HEROES IN GUILD YET</p>
                <p className="font-mono text-xs text-[#4a4943]">Invite friends to sign up and join your live study room!</p>
              </div>
            )}

            {/* Current Player's Highlighted Hero Card */}
            <div className="double-bezel">
              <div className="double-bezel-inner bg-[#f2f7f4] p-5 border-2 border-emerald-800 space-y-3 hover:-translate-y-1 transition-all duration-150">
                
                {/* Header row with status & badge */}
                <div className="flex items-center justify-between border-b border-[#18181c]/15 pb-2.5">
                  <span className="font-mono text-[10px] px-2 py-0.5 font-bold border border-emerald-800 bg-emerald-100 text-emerald-950">
                    🟢 YOU (HERO)
                  </span>
                  
                  <span className="font-pixel text-xs font-bold text-amber-900 bg-[#ebeae4] px-2 py-0.5 border border-[#18181c]">
                    Lv.{playerStats.level}
                  </span>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-[#f5f4ef] border-2 border-[#18181c] flex items-center justify-center text-3xl shadow-pixel-sm shrink-0 transition-transform duration-150 hover:scale-105" aria-hidden="true">
                    {currentHeroAvatar}
                  </div>

                  <div className="space-y-1 min-w-0 flex-1">
                    <h3 className="font-pixel text-sm font-bold text-[#111113] truncate">
                      {currentHeroName}
                    </h3>

                    <p className="font-mono text-xs text-[#33322d] font-semibold">
                      Class: <span className="font-bold text-[#111113]">{playerStats.characterClass}</span>
                    </p>

                    <p className="font-mono text-[11px] text-emerald-900 font-bold truncate">
                      {isActive ? '🟢 Active Focus Session...' : 'Ready for Quest'}
                    </p>
                  </div>
                </div>

                <div className="border-t border-[#18181c]/15 pt-3 flex items-center justify-between font-mono text-xs">
                  <span className="flex items-center gap-1 text-amber-800 font-bold">
                    <Flame className="w-3.5 h-3.5" strokeWidth={2} />
                    {playerStats.streakDays}d Streak
                  </span>
                  <span className="flex items-center gap-1 text-amber-900 font-bold">
                    <Award className="w-3.5 h-3.5" strokeWidth={2} />
                    {playerStats.xp} XP Total
                  </span>
                </div>
              </div>
            </div>

            {/* Guild Roster Hero Cards with Staggered Entrance */}
            {filteredRoster.map((hero, idx) => (
              <div 
                key={hero.id} 
                className="double-bezel animate-fade-in"
                style={{ animationDelay: `${idx * 60}ms` }}
              >
                <div className="double-bezel-inner bg-[#f5f4ef] p-5 border-2 border-[#18181c] space-y-3 hover:-translate-y-1 hover:border-black transition-all duration-150 cursor-pointer">
                  
                  {/* Online Status Badge & Level Header */}
                  <div className="flex items-center justify-between border-b border-[#18181c]/15 pb-2.5">
                    <span className={`font-mono text-[10px] px-2 py-0.5 font-bold border border-[#18181c] ${
                      hero.isOnline ? 'bg-emerald-100 text-emerald-950 font-bold' : 'bg-zinc-200 text-zinc-900'
                    }`}>
                      {hero.isOnline ? '🟢 ACTIVE IN ROOM' : '⚪ OFFLINE'}
                    </span>
                    
                    <span className="font-pixel text-xs font-bold text-amber-900 bg-[#ebeae4] px-2 py-0.5 border border-[#18181c]">
                      Lv.{hero.level}
                    </span>
                  </div>

                  {/* Hero Avatar & Details */}
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-[#ebeae4] border-2 border-[#18181c] flex items-center justify-center text-3xl shadow-pixel-sm shrink-0 transition-transform duration-150 hover:scale-105" aria-hidden="true">
                      {hero.avatarIcon}
                    </div>

                    <div className="space-y-1 min-w-0 flex-1">
                      <h3 className="font-pixel text-sm font-bold text-[#111113] truncate">
                        {hero.displayName}
                      </h3>
                      
                      <p className="font-mono text-xs text-[#33322d]">
                        Class: <span className="font-bold text-[#111113]">{hero.characterClass}</span>
                      </p>

                      {hero.currentTask && (
                        <p className="font-mono text-[11px] text-[#4a4943] truncate italic font-medium">
                          "{hero.currentTask}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Stats Bar */}
                  <div className="border-t border-[#18181c]/15 pt-3 flex items-center justify-between font-mono text-xs">
                    <span className="flex items-center gap-1 text-amber-800 font-bold">
                      <Flame className="w-3.5 h-3.5" strokeWidth={2} />
                      {hero.streakDays}d Streak
                    </span>

                    <span className="flex items-center gap-1 text-amber-900 font-bold">
                      <Trophy className="w-3.5 h-3.5" strokeWidth={2} />
                      {hero.xp} XP
                    </span>
                  </div>
                </div>
              </div>
            ))}

          </div>

        </div>

      </div>

    </div>
  );
};
