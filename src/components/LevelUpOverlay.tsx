import { useEffect, type FC } from 'react';
import confetti from 'canvas-confetti';
import { useGame } from '../context/GameContext';
import { Trophy, Sparkles, Award, Star } from 'lucide-react';

export const LevelUpOverlay: FC = () => {
  const { levelUpModalData, closeLevelUpModal } = useGame();

  useEffect(() => {
    if (levelUpModalData?.show) {
      // Trigger Retro Pixel Confetti
      const duration = 2.5 * 1000;
      const animationEnd = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 6,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#18181c', '#f5f4ef', '#f59e0b', '#71717a', '#dc2626']
        });
        confetti({
          particleCount: 6,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#18181c', '#f5f4ef', '#f59e0b', '#71717a', '#dc2626']
        });

        if (Date.now() < animationEnd) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [levelUpModalData]);

  if (!levelUpModalData?.show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="double-bezel max-w-md w-full animate-scale-up">
        <div className="double-bezel-inner bg-[#ebeae4] text-[#111113] p-6 text-center border-2 border-[#18181c] shadow-pixel relative">
          
          <div className="w-16 h-16 mx-auto mb-4 bg-[#18181c] text-amber-400 flex items-center justify-center border-2 border-black shadow-pixel animate-bounce">
            <Trophy className="w-10 h-10" />
          </div>

          <div className="flex items-center justify-center gap-2 mb-2 text-xs font-pixel uppercase tracking-widest text-[#111113] font-bold">
            <Sparkles className="w-4 h-4 text-amber-600 animate-pulse" />
            <span>Character Ascended</span>
            <Sparkles className="w-4 h-4 text-amber-600 animate-pulse" />
          </div>

          <h2 className="text-3xl font-pixel font-bold mb-2 text-[#111113] uppercase tracking-wider">
            LEVEL UP!
          </h2>

          <div className="text-lg font-serif text-[#4a4943] mb-4">
            You reached <span className="font-pixel text-[#111113] text-xl font-bold px-2.5 py-1 bg-[#f5f4ef] border border-[#18181c] shadow-pixel-sm inline-block my-1">Level {levelUpModalData.newLevel}</span>
          </div>

          {/* Title unlocked badge */}
          {levelUpModalData.unlockedTitle && (
            <div className="mb-4 p-2 bg-[#18181c] text-[#f5f4ef] font-mono text-xs flex items-center justify-center gap-2 border border-black">
              <Star className="w-4 h-4 text-amber-400" />
              <span>New Title Earned: <strong className="font-pixel text-amber-300">{levelUpModalData.unlockedTitle}</strong></span>
            </div>
          )}

          {/* Gold Reward */}
          <div className="p-3 bg-[#f5f4ef] border border-[#18181c] mb-6 flex items-center justify-around font-mono text-sm shadow-pixel-sm">
            <div className="flex items-center gap-2 font-bold text-[#111113]">
              <Award className="w-5 h-5 text-amber-600" />
              <span>Level-up Bonus: +{levelUpModalData.rewardGold} Gold</span>
            </div>
          </div>

          <button
            onClick={closeLevelUpModal}
            className="w-full py-3.5 pixel-btn-primary font-pixel font-bold text-sm uppercase tracking-wider"
          >
            CLAIM VICTORY
          </button>
        </div>
      </div>
    </div>
  );
};
