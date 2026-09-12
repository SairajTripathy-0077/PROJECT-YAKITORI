import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import type { CompanionEvent, CompanionGesture, GreetingMetadata, ActiveGreeting } from '../types/game';
import { getGreetingMessage } from '../utils/greetingData';
import { voiceService } from '../utils/voiceService';

interface CompanionContextType {
  activeGreeting: ActiveGreeting | null;
  gesture: CompanionGesture;
  isSpeaking: boolean;
  displayedText: string;
  isTypingComplete: boolean;
  typingProgress: number;
  isStageActive: boolean;
  isExiting: boolean;
  isCompanionVisible: boolean;
  triggerGreeting: (event: CompanionEvent, metadata?: GreetingMetadata) => void;
  dismissGreeting: () => void;
  repeatGreeting: () => void;
  setCompanionVisible: (visible: boolean) => void;
}

const CompanionContext = createContext<CompanionContextType | undefined>(undefined);

const EVENT_GESTURE_MAP: Record<CompanionEvent, CompanionGesture> = {
  LOGIN: 'WELCOME',
  NEW_USER: 'NEW_USER',
  TASK_COMPLETE: 'TASK_COMPLETE',
  LEVEL_UP: 'LEVEL_UP',
  INTERACTIVE_CLICK: 'WELCOME',
  STREAK: 'TASK_COMPLETE',
};

export const CompanionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeGreeting, setActiveGreeting] = useState<ActiveGreeting | null>(null);
  const [gesture, setGesture] = useState<CompanionGesture>('IDLE');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [displayedText, setDisplayedText] = useState<string>('');
  const [isTypingComplete, setIsTypingComplete] = useState<boolean>(false);
  const [typingProgress, setTypingProgress] = useState<number>(0);
  const [isStageActive, setIsStageActive] = useState<boolean>(false);
  const [isExiting, setIsExiting] = useState<boolean>(false);
  const [isCompanionVisible, setCompanionVisible] = useState<boolean>(true);

  const autoDismissTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastTriggerTimeRef = useRef<number>(0);
  const lastEventRef = useRef<CompanionEvent | null>(null);

  // Clear timers on unmount
  useEffect(() => {
    return () => {
      if (autoDismissTimerRef.current) {
        clearTimeout(autoDismissTimerRef.current);
      }
      voiceService.stop();
    };
  }, []);

  const dismissGreeting = useCallback(() => {
    if (autoDismissTimerRef.current) {
      clearTimeout(autoDismissTimerRef.current);
      autoDismissTimerRef.current = null;
    }
    voiceService.stop();
    setIsSpeaking(false);
    setIsExiting(true);
    // Smoothly return gesture to idle
    setGesture('IDLE');
    setTimeout(() => {
      setIsStageActive(false);
      setIsExiting(false);
      setActiveGreeting(null);
      setDisplayedText('');
      setIsTypingComplete(false);
      setTypingProgress(0);
    }, 280);
  }, []);

  const startDialoguePlayback = useCallback((greeting: ActiveGreeting) => {
    if (autoDismissTimerRef.current) {
      clearTimeout(autoDismissTimerRef.current);
      autoDismissTimerRef.current = null;
    }

    setIsExiting(false);
    setGesture(greeting.gesture);
    setIsStageActive(true);
    setDisplayedText('');
    setIsTypingComplete(false);
    setTypingProgress(0);
    setIsSpeaking(true);

    const fullMessage = greeting.message;

    voiceService.speak({
      text: fullMessage,
      onStart: () => {
        setIsSpeaking(true);
      },
      onWord: (charIndex, currentWord, progress) => {
        const revealedLength = Math.min(fullMessage.length, charIndex + currentWord.length);
        setDisplayedText(fullMessage.slice(0, revealedLength));
        setTypingProgress(progress);
      },
      onEnd: () => {
        setIsSpeaking(false);
        setDisplayedText(fullMessage);
        setIsTypingComplete(true);
        setTypingProgress(1);

        // Disappear after completion of her greeting (4.5s buffer for reading)
        if (autoDismissTimerRef.current) {
          clearTimeout(autoDismissTimerRef.current);
        }
        autoDismissTimerRef.current = setTimeout(() => {
          dismissGreeting();
        }, 4500);
      },
      onError: () => {
        setIsSpeaking(false);
        setDisplayedText(fullMessage);
        setIsTypingComplete(true);
        setTypingProgress(1);

        // Disappear after completion of her greeting on error/fallback too (4.5s buffer)
        if (autoDismissTimerRef.current) {
          clearTimeout(autoDismissTimerRef.current);
        }
        autoDismissTimerRef.current = setTimeout(() => {
          dismissGreeting();
        }, 4500);
      }
    });
  }, [dismissGreeting]);

  const triggerGreeting = useCallback((event: CompanionEvent, metadata?: GreetingMetadata) => {
    const now = Date.now();
    // Guard against duplicate rapid triggers (within 800ms) for identical event
    if (lastEventRef.current === event && now - lastTriggerTimeRef.current < 800) {
      return;
    }
    lastTriggerTimeRef.current = now;
    lastEventRef.current = event;

    const message = getGreetingMessage(event, metadata);
    const targetGesture = EVENT_GESTURE_MAP[event] || 'WELCOME';

    const newGreeting: ActiveGreeting = {
      id: `greet-${now}-${Math.floor(Math.random() * 1000)}`,
      event,
      message,
      gesture: targetGesture,
      metadata,
      timestamp: now,
    };

    setActiveGreeting(newGreeting);
    startDialoguePlayback(newGreeting);
  }, [startDialoguePlayback]);

  const repeatGreeting = useCallback(() => {
    if (activeGreeting) {
      startDialoguePlayback(activeGreeting);
    }
  }, [activeGreeting, startDialoguePlayback]);

  // Global window listener for companion-greeting custom events (decoupled from React context hierarchy)
  useEffect(() => {
    const handleCustomGreeting = (e: Event) => {
      const customEvt = e as CustomEvent<{ event: CompanionEvent; metadata?: GreetingMetadata }>;
      if (customEvt.detail?.event) {
        triggerGreeting(customEvt.detail.event, customEvt.detail.metadata);
      }
    };

    window.addEventListener('companion-greeting', handleCustomGreeting);
    return () => window.removeEventListener('companion-greeting', handleCustomGreeting);
  }, [triggerGreeting]);

  return (
    <CompanionContext.Provider
      value={{
        activeGreeting,
        gesture,
        isSpeaking,
        displayedText,
        isTypingComplete,
        typingProgress,
        isStageActive,
        isExiting,
        isCompanionVisible,
        triggerGreeting,
        dismissGreeting,
        repeatGreeting,
        setCompanionVisible,
      }}
    >
      {children}
    </CompanionContext.Provider>
  );
};

export const dispatchCompanionGreeting = (event: CompanionEvent, metadata?: GreetingMetadata) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('companion-greeting', { detail: { event, metadata } }));
  }
};

export const useCompanion = (): CompanionContextType => {
  const context = useContext(CompanionContext);
  if (!context) {
    throw new Error('useCompanion must be used within a CompanionProvider');
  }
  return context;
};
