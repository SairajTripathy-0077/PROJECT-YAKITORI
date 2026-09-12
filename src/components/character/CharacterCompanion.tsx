import React, { useState, useEffect } from 'react';
import { useCompanion } from '../../context/CompanionContext';
import { CharacterGestureAvatar } from './CharacterGestureAvatar';
import { SpeechBubble } from './SpeechBubble';

export const CharacterCompanion: React.FC = () => {
  const {
    activeGreeting,
    gesture,
    isSpeaking,
    displayedText,
    isTypingComplete,
    isStageActive,
    isExiting,
    isCompanionVisible,
    dismissGreeting,
    repeatGreeting,
  } = useCompanion();

  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen width for responsive speech bubble alignment
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Only render when companion is visible and actively greeting an event
  if (!isCompanionVisible || !isStageActive || !activeGreeting) {
    return null;
  }

  return (
    <>
      {/* Surrounding Background Blur Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/45 backdrop-blur-md transition-opacity duration-300 pointer-events-auto ${
          isExiting ? 'opacity-0 pointer-events-none' : 'animate-fade-in opacity-100'
        }`}
        onClick={dismissGreeting}
        aria-hidden="true"
      />

      {/* Main Interactive Character Stage on the LEFT side of the screen */}
      <aside
        aria-label="Interactive Character Greeting"
        className={`fixed bottom-0 left-2 sm:left-8 md:left-16 z-50 select-none transition-all duration-300 ${
          isExiting ? 'opacity-0 translate-y-6 pointer-events-none' : 'opacity-100 translate-y-0 pointer-events-auto'
        }`}
      >
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3 sm:gap-6 max-w-[96vw] sm:max-w-2xl md:max-w-3xl">
          
          {/* Free-standing Character Figure (No box / container) */}
          <div className="shrink-0 flex flex-col items-center">
            <CharacterGestureAvatar
              gesture={gesture}
              size={isMobile ? 180 : 270}
              isSpeaking={isSpeaking}
              interactive={false}
              className="filter drop-shadow-[0_12px_28px_rgba(0,0,0,0.5)]"
            />
          </div>

          {/* Connected Speech Bubble positioned to the right of the character */}
          <div className="w-full sm:w-auto mb-4 sm:mb-24 flex-1 min-w-[260px] sm:min-w-[340px] max-w-lg">
            <SpeechBubble
              displayedText={displayedText}
              isSpeaking={isSpeaking}
              isTypingComplete={isTypingComplete}
              onDismiss={dismissGreeting}
              onReplay={repeatGreeting}
              speakerName="COMPANION // YOUR FRIEND"
              tailDirection={isMobile ? 'bottom' : 'left'}
              className="w-full"
            />
          </div>

        </div>
      </aside>
    </>
  );
};
