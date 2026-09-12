import { useState, useEffect, useRef, type FC } from 'react';
import { X, BookOpen, Play, Pause, RotateCcw, Headphones, Sparkles, Award } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { playSound, playTone } from '../utils/sound';

interface StudyRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TimerMode = 'work' | 'shortBreak' | 'longBreak';

const MODE_TIMES: Record<TimerMode, number> = {
  work: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

export const StudyRoomModal: FC<StudyRoomModalProps> = ({ isOpen, onClose }) => {
  const { quests, completeQuest } = useGame();
  const [mode, setMode] = useState<TimerMode>('work');
  const [timeLeft, setTimeLeft] = useState(MODE_TIMES.work);
  const [isActive, setIsActive] = useState(false);
  const [selectedQuestId, setSelectedQuestId] = useState<string>('');
  const [ambientSound, setAmbientSound] = useState<boolean>(false);
  const [completedSessions, setCompletedSessions] = useState(0);

  const ambientOscRef = useRef<OscillatorNode | null>(null);
  const ambientGainRef = useRef<GainNode | null>(null);

  // Keyboard shortcut (Escape to close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

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
  }, [isActive, timeLeft, mode, selectedQuestId, completedSessions, completeQuest]);

  // Toggle ambient Lofi synth drone
  useEffect(() => {
    if (ambientSound && isOpen) {
      try {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new AudioContextClass();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(110, ctx.currentTime); // Low A note drone
        gain.gain.setValueAtTime(0.02, ctx.currentTime);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();

        ambientOscRef.current = osc;
        ambientGainRef.current = gain;
      } catch (e) {
        console.warn('Ambient sound error:', e);
      }
    } else {
      if (ambientOscRef.current) {
        try {
          ambientOscRef.current.stop();
          ambientOscRef.current.disconnect();
        } catch {
          // Cleanup ignore
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
          // Cleanup ignore
        }
        ambientOscRef.current = null;
      }
    };
  }, [ambientSound, isOpen]);

  if (!isOpen) return null;

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="double-bezel w-full max-w-lg">
        <div className="double-bezel-inner bg-[#f5f4ef] p-6 sm:p-8 space-y-6 relative border-2 border-[#18181c] shadow-pixel">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-[#18181c] pb-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-[#18181c]" />
              <h2 className="font-pixel text-xl uppercase tracking-wide text-[#111113]">
                HERO STUDY ROOM // POMODORO
              </h2>
            </div>

            <button
              onClick={() => {
                playSound('click');
                onClose();
              }}
              className="p-1 border-2 border-[#18181c] bg-[#ebeae4] hover:bg-[#18181c] hover:text-[#f5f4ef] transition-colors shadow-pixel-sm"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Timer Mode Selectors */}
          <div className="flex border-2 border-[#18181c] p-1 bg-[#ebeae4]">
            <button
              onClick={() => handleModeChange('work')}
              className={`flex-1 py-2 font-pixel text-xs uppercase font-bold transition-all ${
                mode === 'work'
                  ? 'bg-[#18181c] text-[#f5f4ef] shadow-pixel-sm'
                  : 'text-[#4a4943] hover:text-black'
              }`}
            >
              Focus (25m)
            </button>
            <button
              onClick={() => handleModeChange('shortBreak')}
              className={`flex-1 py-2 font-pixel text-xs uppercase font-bold transition-all ${
                mode === 'shortBreak'
                  ? 'bg-[#18181c] text-[#f5f4ef] shadow-pixel-sm'
                  : 'text-[#4a4943] hover:text-black'
              }`}
            >
              Rest (5m)
            </button>
            <button
              onClick={() => handleModeChange('longBreak')}
              className={`flex-1 py-2 font-pixel text-xs uppercase font-bold transition-all ${
                mode === 'longBreak'
                  ? 'bg-[#18181c] text-[#f5f4ef] shadow-pixel-sm'
                  : 'text-[#4a4943] hover:text-black'
              }`}
            >
              Break (15m)
            </button>
          </div>

          {/* Main Pomodoro Display */}
          <div className="bg-[#ebeae4] border-2 border-[#18181c] p-6 text-center shadow-inner relative space-y-4">
            
            {/* Countdown Clock */}
            <div className="font-mono text-6xl font-bold tracking-tighter text-[#111113]">
              {formatTime(timeLeft)}
            </div>

            {/* Progress Bar */}
            <div className="w-full h-3 bg-[#d9d8d2] border border-[#18181c] relative overflow-hidden">
              <div 
                className="h-full bg-[#18181c] transition-all duration-1000"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={toggleTimer}
                className="px-6 py-2.5 bg-[#18181c] text-[#f5f4ef] font-pixel text-sm uppercase font-bold border-2 border-black hover:bg-black transition-transform hover:-translate-y-0.5 shadow-pixel flex items-center gap-2"
              >
                {isActive ? <Pause className="w-4 h-4 text-amber-400" /> : <Play className="w-4 h-4 text-amber-400" />}
                <span>{isActive ? 'Pause' : 'Start Focus'}</span>
              </button>

              <button
                onClick={resetTimer}
                className="p-2.5 bg-[#f5f4ef] text-[#111113] border-2 border-[#18181c] hover:bg-white transition-colors shadow-pixel-sm"
                title="Reset Timer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quest Integration & Ambiance Controls */}
          <div className="space-y-3 font-mono text-xs">
            
            {/* Quest Focus Selection */}
            <div>
              <label className="block font-bold uppercase mb-1 text-[#111113] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Link Quest for Completion Reward:</span>
              </label>
              <select
                value={selectedQuestId}
                onChange={(e) => setSelectedQuestId(e.target.value)}
                className="w-full p-2 bg-[#ebeae4] border-2 border-[#18181c] text-[#111113] font-mono text-xs focus:outline-none"
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

            {/* Ambient Sound Toggle */}
            <div className="flex items-center justify-between bg-[#ebeae4] p-3 border-2 border-[#18181c]">
              <div className="flex items-center gap-2">
                <Headphones className="w-4 h-4 text-[#18181c]" />
                <span className="font-bold uppercase text-xs">8-Bit Lofi Drone Ambiance</span>
              </div>
              <button
                onClick={() => {
                  playSound('click');
                  setAmbientSound(!ambientSound);
                }}
                className={`px-3 py-1 font-pixel text-xs border border-[#18181c] font-bold uppercase transition-all ${
                  ambientSound ? 'bg-[#18181c] text-[#f5f4ef]' : 'bg-[#f5f4ef] text-[#18181c]'
                }`}
              >
                {ambientSound ? 'ON' : 'OFF'}
              </button>
            </div>

            {/* Stats Summary */}
            <div className="flex items-center justify-between text-zinc-600 text-[11px] pt-1">
              <span className="flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-amber-600" />
                Completed Sessions: {completedSessions}
              </span>
              <span>+25 XP per Pomodoro</span>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
