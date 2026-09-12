import React from 'react';
import { Volume2, VolumeX, RotateCcw, X, Sparkles } from 'lucide-react';
import { isSoundEnabled } from '../../utils/sound';

interface SpeechBubbleProps {
  displayedText: string;
  isSpeaking: boolean;
  isTypingComplete: boolean;
  onDismiss: () => void;
  onReplay?: () => void;
  speakerName?: string;
  className?: string;
  tailDirection?: 'left' | 'right' | 'bottom';
}

export const SpeechBubble: React.FC<SpeechBubbleProps> = ({
  displayedText,
  isSpeaking,
  isTypingComplete,
  onDismiss,
  onReplay,
  speakerName = 'COMPANION // YAKITODO',
  className = '',
  tailDirection = 'right',
}) => {
  const soundActive = isSoundEnabled();

  return (
    <div
      className={`relative z-20 transition-all duration-300 animate-fade-in ${className}`}
      role="region"
      aria-live="polite"
      aria-label="Companion Dialogue"
    >
      <div className="double-bezel shadow-pixel max-w-sm sm:max-w-md w-full">
        <div className="double-bezel-inner bg-[#f5f4ef] p-3.5 sm:p-4 text-[#111113] relative border border-[#18181c]">
          
          {/* Header Bar with Speaker Name and Controls */}
          <div className="flex items-center justify-between border-b border-[#18181c]/25 pb-1.5 mb-2 gap-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-amber-600 inline-block border border-black shadow-pixel-sm" />
              <span className="font-pixel text-[11px] font-bold uppercase tracking-wider text-[#111113] flex items-center gap-1">
                <span>{speakerName}</span>
                <Sparkles className="w-3 h-3 text-amber-600" />
              </span>
            </div>

            {/* Audio Wave & Controls */}
            <div className="flex items-center gap-1.5">
              {/* Animated Sound Wave Equalizer */}
              {isSpeaking && soundActive && (
                <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-[#ebeae4] border border-[#18181c] shadow-pixel-sm" title="Voice Playing">
                  <div className="w-1 bg-[#18181c] sound-bar-1" />
                  <div className="w-1 bg-[#18181c] sound-bar-2" />
                  <div className="w-1 bg-[#18181c] sound-bar-3" />
                </div>
              )}

              {/* Sound status indicator */}
              {!soundActive && (
                <span className="text-[#88867f]" title="Sound Muted">
                  <VolumeX className="w-3.5 h-3.5" />
                </span>
              )}

              {/* Replay Button */}
              {onReplay && isTypingComplete && (
                <button
                  onClick={onReplay}
                  className="p-1 hover:bg-[#ebeae4] border border-[#18181c] transition-colors text-[#111113] shadow-pixel-sm"
                  title="Replay dialogue"
                  aria-label="Replay dialogue"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              )}

              {/* Dismiss Button */}
              <button
                onClick={onDismiss}
                className="p-1 hover:bg-[#18181c] hover:text-[#f5f4ef] border border-[#18181c] transition-colors text-[#111113] shadow-pixel-sm"
                title="Close dialogue"
                aria-label="Dismiss dialogue"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Dialogue Text Content with Typewriter Cursor */}
          <div className="font-mono text-xs sm:text-sm text-[#111113] leading-relaxed min-h-[44px]">
            <span>{displayedText}</span>
            {!isTypingComplete && (
              <span className="inline-block w-1.5 h-3.5 ml-0.5 bg-[#18181c] animate-pulse align-middle" />
            )}
          </div>

          {/* Status Subtitle */}
          <div className="mt-2 pt-1 border-t border-[#18181c]/15 flex items-center justify-between text-[9px] font-mono text-[#5f5d56]">
            <span>{isSpeaking ? 'VOICE SYNCHRONIZED' : 'DIALOGUE COMPLETE'}</span>
            <span className="text-[8px] uppercase tracking-wider text-[#88867f]">YAKITODO RPG</span>
          </div>

        </div>
      </div>

      {/* Speech Bubble Tail Pointer (Connected to Character) */}
      {tailDirection === 'right' && (
        <div
          className="absolute -right-3 top-8 w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-l-[12px] border-l-[#18181c] hidden sm:block"
          aria-hidden="true"
        >
          <div className="absolute -left-[13px] -top-[7px] w-0 h-0 border-t-[7px] border-t-transparent border-b-[7px] border-b-transparent border-l-[11px] border-l-[#f5f4ef]" />
        </div>
      )}

      {tailDirection === 'left' && (
        <div
          className="absolute -left-3 top-8 w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-r-[12px] border-r-[#18181c] hidden sm:block"
          aria-hidden="true"
        >
          <div className="absolute -right-[13px] -top-[7px] w-0 h-0 border-t-[7px] border-t-transparent border-b-[7px] border-b-transparent border-r-[11px] border-r-[#f5f4ef]" />
        </div>
      )}

      {tailDirection === 'bottom' && (
        <div
          className="absolute left-1/2 -translate-x-1/2 -bottom-3 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[12px] border-t-[#18181c]"
          aria-hidden="true"
        >
          <div className="absolute -left-[7px] -top-[13px] w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-t-[11px] border-t-[#f5f4ef]" />
        </div>
      )}
    </div>
  );
};
