import React, { useMemo } from 'react';
import type { CompanionGesture } from '../../types/game';
import welcomeUrl from '../../assets/Welcome.png';
import taskUrl from '../../assets/Task.png';
import levelUpUrl from '../../assets/LevelUp.png';
import { Sparkles, Star, Trophy, Heart, Hand } from 'lucide-react';

interface CharacterGestureAvatarProps {
  gesture: CompanionGesture;
  size?: number;
  className?: string;
  isSpeaking?: boolean;
  onClick?: () => void;
  interactive?: boolean;
}

export const CharacterGestureAvatar: React.FC<CharacterGestureAvatarProps> = ({
  gesture,
  size = 260,
  className = '',
  isSpeaking = false,
  onClick,
  interactive = true,
}) => {
  // Dynamically select pose image based on event gesture
  const currentImage = useMemo(() => {
    switch (gesture) {
      case 'TASK_COMPLETE':
        return taskUrl;
      case 'LEVEL_UP':
        return levelUpUrl;
      case 'WELCOME':
      case 'NEW_USER':
      case 'IDLE':
      default:
        return welcomeUrl;
    }
  }, [gesture]);
  // Map gesture to corresponding CSS animation class
  const animationClass = useMemo(() => {
    switch (gesture) {
      case 'WELCOME':
        return 'companion-anim-welcome';
      case 'NEW_USER':
        return 'companion-anim-new-user';
      case 'TASK_COMPLETE':
        return 'companion-anim-task-complete';
      case 'LEVEL_UP':
        return 'companion-anim-level-up';
      case 'EXIT':
        return 'transition-all duration-300 opacity-0 scale-90';
      case 'IDLE':
      default:
        return 'companion-anim-idle';
    }
  }, [gesture]);

  // Emotion / Status Badge displayed above the character's head
  const emotionBadge = useMemo(() => {
    switch (gesture) {
      case 'WELCOME':
        return {
          icon: <Hand className="w-3.5 h-3.5 text-amber-500 animate-bounce" />,
          label: 'HELLO!',
          color: 'bg-amber-100 border-amber-700 text-amber-950',
        };
      case 'NEW_USER':
        return {
          icon: <Sparkles className="w-3.5 h-3.5 text-pink-500 animate-spin" />,
          label: 'WELCOME HERO!',
          color: 'bg-pink-100 border-pink-700 text-pink-950',
        };
      case 'TASK_COMPLETE':
        return {
          icon: <Trophy className="w-3.5 h-3.5 text-amber-600 animate-pulse" />,
          label: 'VICTORY!',
          color: 'bg-emerald-100 border-emerald-700 text-emerald-950',
        };
      case 'LEVEL_UP':
        return null;
      case 'IDLE':
      default:
        return isSpeaking
          ? {
              icon: <Heart className="w-3 h-3 text-red-500 animate-pulse" />,
              label: 'SPEAKING',
              color: 'bg-[#ebeae4] border-[#18181c] text-[#18181c]',
            }
          : null;
    }
  }, [gesture, isSpeaking]);

  return (
    <div
      onClick={onClick}
      className={`relative inline-flex flex-col items-center select-none ${
        interactive ? 'cursor-pointer group' : ''
      } ${className}`}
      style={{ width: `${size}px` }}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-label="Interactive Companion Character"
    >

      {/* Floating Sparkles for Task Complete / New User */}
      {(gesture === 'TASK_COMPLETE' || gesture === 'NEW_USER') && (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-visible">
          <Sparkles className="w-5 h-5 text-amber-400 absolute -top-4 -left-2 animate-bounce" />
          <Star className="w-4 h-4 text-emerald-400 absolute top-12 -right-3 animate-pulse" />
          <Sparkles className="w-4 h-4 text-pink-400 absolute bottom-24 -left-3 animate-spin" />
        </div>
      )}

      {/* Floating Emotion Badge */}
      {emotionBadge && (
        <div className="absolute -top-7 left-1/2 -translate-x-1/2 z-20 pointer-events-none transition-all duration-200">
          <div
            className={`px-2 py-0.5 border shadow-pixel-sm font-pixel text-[10px] flex items-center gap-1 uppercase tracking-wider ${emotionBadge.color}`}
          >
            {emotionBadge.icon}
            <span>{emotionBadge.label}</span>
          </div>
        </div>
      )}

      {/* The Character Artwork with gesture keyframes */}
      <div className={`relative z-10 transition-transform ${animationClass}`}>
        <img
          src={currentImage}
          alt={`Guild Companion Character - ${gesture}`}
          className="w-full h-auto object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.35)] group-hover:drop-shadow-[0_16px_32px_rgba(0,0,0,0.45)] transition-all duration-200"
          style={{
            maxHeight: `${size * 2.2}px`,
          }}
          loading="eager"
          draggable={false}
        />

        {/* Soft shadow under feet */}
        <div className="w-3/5 h-3 mx-auto bg-black/20 rounded-full blur-[2px] mt-[-6px]" />
      </div>
    </div>
  );
};
