import { useEffect, type FC } from 'react';
import confetti from 'canvas-confetti';
import { useGame } from '../context/GameContext';
import { useCompanion } from '../context/CompanionContext';
import { playSound } from '../utils/sound';

export const LevelUpOverlay: FC = () => {
  const { levelUpModalData, closeLevelUpModal } = useGame();
  const { activeGreeting, dismissGreeting } = useCompanion();

  const isLevelUpGreeting = activeGreeting?.event === 'LEVEL_UP';

  // Trigger Confetti fireworks when modal opens
  useEffect(() => {
    if (!levelUpModalData?.show) return;

    // Trigger Retro Confetti Burst
    const duration = 2.5 * 1000;
    const animationEnd = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 7,
        angle: 60,
        spread: 60,
        origin: { x: 0, y: 0.8 },
        colors: ['#f59e0b', '#d97706', '#18181c', '#10b981', '#6366f1'],
      });
      confetti({
        particleCount: 7,
        angle: 120,
        spread: 60,
        origin: { x: 1, y: 0.8 },
        colors: ['#f59e0b', '#d97706', '#18181c', '#10b981', '#6366f1'],
      });

      if (Date.now() < animationEnd) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, [levelUpModalData?.show]);

  // Sync dismissal: If companion dialogue is dismissed or finished, close modal too
  useEffect(() => {
    if (!levelUpModalData?.show) return;
    if (!isLevelUpGreeting) {
      // Companion greeting is no longer active (user dismissed or timed out)
      closeLevelUpModal();
    }
  }, [levelUpModalData?.show, isLevelUpGreeting, closeLevelUpModal]);

  // Keyboard listeners (Space / Enter / Escape)
  useEffect(() => {
    if (!levelUpModalData?.show) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter' || e.key === 'Escape') {
        e.preventDefault();
        playSound('click');
        dismissGreeting();
        closeLevelUpModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [levelUpModalData?.show, closeLevelUpModal, dismissGreeting]);

  // No extra box rendered on screen — only the companion character will greet
  return null;
};
