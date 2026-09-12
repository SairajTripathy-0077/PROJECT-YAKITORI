import { useEffect, type FC } from 'react';
import { useGame } from '../context/GameContext';
import { useCompanion } from '../context/CompanionContext';
import { playSound } from '../utils/sound';

export const LevelUpOverlay: FC = () => {
  const { levelUpModalData, closeLevelUpModal } = useGame();
  const { activeGreeting, dismissGreeting } = useCompanion();

  const isLevelUpGreeting = activeGreeting?.event === 'LEVEL_UP';

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
