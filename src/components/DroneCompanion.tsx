import { useState, type FC } from 'react';
import { useGame } from '../context/GameContext';
import { X, Sparkles } from 'lucide-react';
import type { DroneExpression } from '../types/game';

export const DroneCompanion: FC = () => {
  const { droneState, interactWithDrone } = useGame();
  const [minimized, setMinimized] = useState(false);

  // Expression eye rendering helper
  const renderEyes = (expression: DroneExpression) => {
    switch (expression) {
      case 'HAPPY':
        return (
          <g fill="currentColor">
            <path d="M14 18 L18 14 L22 18" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M26 18 L30 14 L34 18" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </g>
        );
      case 'MOTIVATED':
        return (
          <g fill="currentColor">
            <circle cx="18" cy="16" r="3.5" />
            <circle cx="30" cy="16" r="3.5" />
          </g>
        );
      case 'VICTORY':
        return (
          <g fill="currentColor">
            <path d="M14 15 L22 15 M18 13 L18 19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M26 15 L34 15 M30 13 L30 19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </g>
        );
      case 'THINKING':
        return (
          <g fill="currentColor">
            <ellipse cx="18" cy="16" rx="3" ry="1.5" />
            <circle cx="30" cy="16" r="3" />
          </g>
        );
      case 'CHILL':
      default:
        return (
          <g fill="currentColor">
            <line x1="14" y1="16" x2="22" y2="16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="26" y1="16" x2="34" y2="16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </g>
        );
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end pointer-events-none sm:pointer-events-auto">
      {/* Speech Bubble */}
      {droneState.isSpeaking && !minimized && (
        <div className="mb-3 max-w-xs sm:max-w-sm pointer-events-auto animate-fade-in">
          <div className="double-bezel">
            <div className="double-bezel-inner relative bg-[#18181c] text-[#f5f4ef] p-3.5 text-xs sm:text-sm font-mono border border-black shadow-pixel">
              {/* Close Bubble button */}
              <button
                onClick={() => setMinimized(true)}
                className="absolute top-1.5 right-1.5 p-0.5 text-zinc-400 hover:text-white"
                title="Dismiss message"
                aria-label="Dismiss message"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center gap-1.5 mb-1.5 text-[10px] font-pixel text-zinc-300 uppercase tracking-widest font-bold">
                <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
                <span>Byte // Assistant Drone</span>
              </div>

              <p className="leading-relaxed font-serif text-zinc-100 italic">
                "{droneState.currentMessage}"
              </p>

              {/* Bubble Pointer Arrow */}
              <div className="absolute -bottom-2 right-6 w-3 h-3 bg-[#18181c] border-r border-b border-black rotate-45"></div>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Pixel Drone Bot */}
      <button
        onClick={interactWithDrone}
        onMouseEnter={() => setMinimized(false)}
        className="pointer-events-auto group relative focus:outline-none transition-transform hover:scale-105 active:scale-95"
        title="Click to talk with Byte Drone"
        aria-label="Interactive Drone Companion Byte"
      >
        <div className="animate-float relative">
          {/* Top Rotor Propeller */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-10 h-1 bg-[#18181c] animate-spin" style={{ animationDuration: '0.4s' }}></div>
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-1.5 h-2 bg-zinc-600"></div>

          {/* Main Pixel Body Frame */}
          <div className="w-14 h-12 bg-[#18181c] text-[#f5f4ef] border-2 border-black shadow-pixel flex flex-col items-center justify-center relative rounded-sm">
            {/* Screen Visor */}
            <div className="w-11 h-7 bg-black text-amber-400 flex items-center justify-center border border-zinc-700 relative overflow-hidden">
              <svg viewBox="0 0 48 32" className="w-10 h-6 text-amber-300">
                {renderEyes(droneState.expression)}
              </svg>
            </div>

            {/* Bottom Thruster Glow */}
            <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1">
              <div className="w-2 h-2.5 bg-amber-400 animate-pulse rounded-b-sm shadow-[0_0_8px_rgba(251,191,36,0.8)]"></div>
              <div className="w-2 h-2.5 bg-amber-400 animate-pulse rounded-b-sm shadow-[0_0_8px_rgba(251,191,36,0.8)]" style={{ animationDelay: '0.15s' }}></div>
            </div>

            {/* Side Antennas */}
            <div className="absolute -left-1.5 top-3 w-1.5 h-3 bg-zinc-700 border-l border-black"></div>
            <div className="absolute -right-1.5 top-3 w-1.5 h-3 bg-zinc-700 border-r border-black"></div>
          </div>

          {/* Status Indicator Dot */}
          <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-emerald-400 border border-black rounded-full animate-ping"></span>
          <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-emerald-400 border border-black rounded-full"></span>
        </div>
      </button>
    </div>
  );
};
