import { useState, useEffect, useRef, type FC } from 'react';
import confetti from 'canvas-confetti';
import { useGame } from '../context/GameContext';
import { useAuth } from '../context/AuthContext';
import { SpriteCharacter } from './SpriteCharacter';
import { playSound } from '../utils/sound';
import { Star, Award, Coins, Sparkles, X, ChevronRight, ShieldCheck } from 'lucide-react';

const AUTO_DISMISS_MS = 7000; // 7 seconds auto-dismiss

// Dialogue quotes pool mapped by level milestones & randomized variations
const GUILD_MASTER_DIALOGUES: Record<number, string[]> = {
  2: [
    "Ah, {playerName}! You've taken your very first step into the Guild archives. Level {newLevel} already? Keep this fire burning!",
    "Welcome to Level {newLevel}, {playerName}! Every master quest starts with a single completed task. The Guild is watching your rise!",
  ],
  3: [
    "Impressive progress, {playerName}! The notice boards are buzzing about your discipline. Take these {rewardGold}g Gold coins!",
    "Level {newLevel} achieved! Your daily consistency is paying off. The Guild rewards your diligence!",
  ],
  4: [
    "By the ancient hearth! Level {newLevel} reached! You've unlocked the title '{title}'! Wear it with honor, hero.",
    "Sensational effort, {playerName}! Reaching Level {newLevel} proves your dedication. Take your {rewardGold}g Gold reward!",
  ],
  5: [
    "LEVEL 5 MILESTONE! Few novices reach this stage so rapidly. You've earned {rewardGold}g Gold from the Guild Vault!",
    "Level {newLevel}! Your focus is sharp as a forged pixel blade, {playerName}. Keep conquering those daily habits!",
  ],
  6: [
    "Your momentum is building, {playerName}! Level {newLevel} attained! The elder scouts speak highly of your quest log.",
    "Level {newLevel} reached! Step by step, attribute by attribute, you are becoming a legendary hero.",
  ],
  7: [
    "Look at that stat growth! Level {newLevel}! Every quest checked off brings you closer to true mastery.",
    "Level {newLevel}, {playerName}! Here is your {rewardGold}g Gold bounty for outstanding guild service!",
  ],
  8: [
    "Your streak is burning bright, {playerName}! Level {newLevel} achieved! Take these {rewardGold}g Gold coins from the treasury.",
    "Level {newLevel}! The Guild study room draws inspiration from your steady daily velocity!",
  ],
  9: [
    "One single step away from double digits! Level {newLevel}! Keep your focus locked on the objective!",
    "Level {newLevel} reached! You're operating at peak efficiency, {playerName}. Victory is within sight!",
  ],
  10: [
    "A MAJOR GUILD MILESTONE! Level 10! You stand now as a recognized '{title}' in the halls of the Guild!",
    "LEVEL 10 ASCENSION! Outstanding achievement, {playerName}! The Guild Vault presents you with {rewardGold}g Gold!",
  ],
  15: [
    "LEVEL 15 ARCHON MILESTONE! The Guild elders bow in respect to your mastery! Title unlocked: '{title}'!",
    "Level {newLevel}! Incredible dedication, {playerName}! You have proven yourself to be a true Master Adventurer!",
  ],
  20: [
    "GRANDMASTER RECOGNITION! Level {newLevel}! You stand among the highest-ranking Sovereign Archons of the Yakitori Guild!",
    "LEVEL 20 LEGEND! Words cannot describe your relentless task velocity, {playerName}. The entire realm honors your legacy!",
  ]
};

// Generic level-up fallback dialogue pool for intermediate levels
const GENERIC_GUILD_DIALOGUES = [
  "Superb execution, {playerName}! Reaching Level {newLevel} unlocks new potential. Take your {rewardGold}g Gold bounty!",
  "Level {newLevel} attained! Your RPG attributes are ascending rapidly. Keep the momentum alive!",
  "Another level conquered, {playerName}! Level {newLevel} is proof of your unwavering discipline.",
  "The Guild Vault honors your progress! Level {newLevel} reached along with a +{rewardGold}g Gold reward!",
  "Outstanding focus, {playerName}! Level {newLevel} unlocked. The Guild is proud of your achievements!"
];

export const LevelUpOverlay: FC = () => {
  const { levelUpModalData, closeLevelUpModal, playerStats } = useGame();
  const { user } = useAuth();
  
  const [displayedText, setDisplayedText] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [remainingMs, setRemainingMs] = useState(AUTO_DISMISS_MS);
  const [isHovered, setIsHovered] = useState(false);

  const fullTextRef = useRef('');
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  const playerName = user?.displayName || playerStats.name || 'Hero';
  const newLevel = levelUpModalData?.newLevel || 1;
  const rewardGold = levelUpModalData?.rewardGold || 50;
  const title = levelUpModalData?.unlockedTitle || playerStats.title || 'Pixel Knight';

  // Initialize dialogue & typewriter effect
  useEffect(() => {
    if (!levelUpModalData?.show) {
      setDisplayedText('');
      setIsTypingComplete(false);
      setRemainingMs(AUTO_DISMISS_MS);
      return;
    }

    // Trigger Retro Confetti Burst
    const duration = 2.0 * 1000;
    const animationEnd = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 6,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.8 },
        colors: ['#f59e0b', '#d97706', '#18181c', '#10b981', '#6366f1']
      });
      confetti({
        particleCount: 6,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.8 },
        colors: ['#f59e0b', '#d97706', '#18181c', '#10b981', '#6366f1']
      });

      if (Date.now() < animationEnd) {
        requestAnimationFrame(frame);
      }
    };
    frame();

    // Pick dialogue line
    const quotes = GUILD_MASTER_DIALOGUES[newLevel] || GENERIC_GUILD_DIALOGUES;
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const rawTemplate = quotes[randomIndex];

    const formattedText = rawTemplate
      .replace(/{playerName}/g, playerName)
      .replace(/{newLevel}/g, String(newLevel))
      .replace(/{rewardGold}/g, String(rewardGold))
      .replace(/{title}/g, title);

    fullTextRef.current = formattedText;
    setDisplayedText('');
    setIsTypingComplete(false);
    setRemainingMs(AUTO_DISMISS_MS);

    // Play retro level-up chime
    playSound('levelUp');

    // Typewriter interval
    let index = 0;
    if (typingTimerRef.current) clearInterval(typingTimerRef.current);

    typingTimerRef.current = setInterval(() => {
      if (index < formattedText.length) {
        setDisplayedText(formattedText.slice(0, index + 1));
        index++;
      } else {
        if (typingTimerRef.current) clearInterval(typingTimerRef.current);
        setIsTypingComplete(true);
      }
    }, 20);

    return () => {
      if (typingTimerRef.current) clearInterval(typingTimerRef.current);
    };
  }, [levelUpModalData, playerName, newLevel, rewardGold, title]);

  // Auto-Dismiss Countdown Timer (Runs after typewriter finishes or immediately)
  useEffect(() => {
    if (!levelUpModalData?.show) return;

    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);

    const stepMs = 100;
    countdownTimerRef.current = setInterval(() => {
      if (isHovered) return; // Pause countdown while hovering

      setRemainingMs((prev) => {
        if (prev <= stepMs) {
          if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
          closeLevelUpModal();
          return 0;
        }
        return prev - stepMs;
      });
    }, stepMs);

    return () => {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, [levelUpModalData, isHovered, closeLevelUpModal]);

  // Keyboard listeners (Space / Enter / Escape)
  useEffect(() => {
    if (!levelUpModalData?.show) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (!isTypingComplete) {
          if (typingTimerRef.current) clearInterval(typingTimerRef.current);
          setDisplayedText(fullTextRef.current);
          setIsTypingComplete(true);
        } else {
          playSound('click');
          closeLevelUpModal();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        closeLevelUpModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [levelUpModalData, isTypingComplete, closeLevelUpModal]);

  if (!levelUpModalData?.show) return null;

  const handleBoxClick = () => {
    if (!isTypingComplete) {
      if (typingTimerRef.current) clearInterval(typingTimerRef.current);
      setDisplayedText(fullTextRef.current);
      setIsTypingComplete(true);
    }
  };

  const progressPercent = Math.max(0, Math.min(100, (remainingMs / AUTO_DISMISS_MS) * 100));

  return (
    <>
      {/* Top Floating Announcement Badge */}
      <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-bounce">
        <div className="bg-[#18181c] text-amber-400 px-5 py-2 font-pixel text-xs sm:text-sm font-bold uppercase tracking-widest border-2 border-amber-500 shadow-pixel flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
          <span>LEVEL UP! LEVEL {newLevel} REACHED!</span>
          <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
        </div>
      </div>

      {/* Bottom Docked JRPG Visual Novel Dialogue Box */}
      <div 
        className="fixed bottom-3 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[95vw] max-w-3xl pointer-events-auto transition-all duration-300 select-none"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleBoxClick}
      >
        <div className="double-bezel shadow-2xl">
          <div className="double-bezel-inner bg-[#ebeae4] p-4 sm:p-5 border-2 border-[#18181c] relative overflow-hidden text-[#111113]">
            
            {/* Top Bar: Speaker Title & Header Badges (STRICTLY BLACK / DARK TEXT) */}
            <div className="relative z-10 flex items-center justify-between border-b-2 border-[#18181c]/30 pb-2.5 mb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 bg-amber-600 inline-block border border-black shadow-pixel-sm" />
                <div>
                  <h3 className="font-pixel text-xs sm:text-sm font-bold uppercase tracking-wider text-[#111113] flex items-center gap-1.5">
                    <span>GUILD MASTER IGNIS</span>
                    <span className="text-[10px] bg-[#d9d8d2] text-[#111113] px-1.5 py-0.2 border border-[#18181c] font-mono">
                      OVERSEER
                    </span>
                  </h3>
                  <p className="font-mono text-[10px] text-[#33322d] font-semibold uppercase tracking-widest">
                    Yakitori Guild Master
                  </p>
                </div>
              </div>

              {/* Right Side Stats Badges (STRICTLY BLACK TEXT) */}
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#111113] bg-[#dcdbd4] px-2.5 py-0.5 border border-[#18181c] tabular-nums">
                  Lv.{newLevel}
                </span>


                <span className="flex items-center gap-1 font-mono text-xs text-[#111113] bg-[#e4e2d8] px-2 py-0.5 border border-[#18181c] font-bold">
                  <Coins className="w-3.5 h-3.5 text-amber-700" />
                  <span>+{rewardGold}g Gold</span>
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    playSound('click');
                    closeLevelUpModal();
                  }}
                  className="ml-1 p-1 hover:bg-[#d9d8d2] border border-[#18181c] text-[#111113] transition-colors"
                  title="Close Dialogue"
                >
                  <X className="w-4 h-4 text-[#111113]" />
                </button>
              </div>
            </div>

            {/* Main Dialogue Content: Guild Master Sprite + Typewriter Speech */}
            <div className="relative z-10 flex flex-row items-start gap-3 sm:gap-5 min-h-[90px]">
              
              {/* Guild Master Portrait Frame */}
              <div className="flex flex-col items-center gap-1 shrink-0">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#f5f4ef] border-2 border-[#18181c] shadow-pixel flex items-center justify-center relative overflow-hidden">
                  <SpriteCharacter index={180} size={64} alt="Guild Master Ignis" />
                </div>
              </div>

              {/* Speech Text Container (ALWAYS SOLID BLACK FONT) */}
              <div className="flex-1 space-y-2 font-mono text-xs sm:text-sm leading-relaxed text-[#111113] w-full pt-0.5">
                <p className="min-h-[52px] text-[#111113] font-bold tracking-wide leading-snug">
                  "{displayedText}"
                  {!isTypingComplete && (
                    <span className="inline-block w-2 h-4 bg-[#111113] ml-1 animate-pulse" />
                  )}
                </p>

                {/* Footer Controls & Auto-dismiss prompt */}
                <div className="pt-2 border-t border-[#18181c]/20 flex items-center justify-between gap-2 text-[11px]">
                  <span className="font-mono text-[#33322d] font-semibold hidden sm:inline text-[10px]">
                    Press <kbd className="px-1 py-0.5 bg-[#f5f4ef] border border-[#18181c] text-[#111113] font-bold">SPACE</kbd> or click to finish
                  </span>

                  <div className="flex items-center gap-3 ml-auto">
                    {levelUpModalData.unlockedTitle && (
                      <span className="flex items-center gap-1 text-[#111113] bg-[#d9d8d2] px-2 py-0.5 border border-[#18181c] font-bold text-[10px]">
                        <Star className="w-3 h-3 text-amber-700" />
                        <span>Title: {levelUpModalData.unlockedTitle}</span>
                      </span>
                    )}

                    {isTypingComplete && (
                      <span className="text-[#111113] font-pixel text-[11px] font-bold animate-bounce flex items-center gap-1">
                        <span>DISMISS</span>
                        <ChevronRight className="w-3.5 h-3.5 text-amber-800" />
                      </span>
                    )}
                  </div>
                </div>

              </div>
            </div>

            {/* Auto-Dismiss Timer Progress Bar (Shrinks across bottom of box) */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#d9d8d2]">
              <div 
                className="h-full bg-[#18181c] transition-all duration-100 ease-linear"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

