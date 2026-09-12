import type { FC } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Brain, 
  Dumbbell, 
  Palette, 
  Zap, 
  Shield, 
  Flame, 
  ShoppingBag, 
  Volume2, 
  Keyboard, 
  Gamepad2,
  CheckCircle2
} from 'lucide-react';
import { useGame } from '../context/GameContext';

interface LandingHeroProps {
  onEnterApp: () => void;
}

export const LandingHero: FC<LandingHeroProps> = ({ onEnterApp }) => {
  const { playerStats, quests } = useGame();

  const activeQuestsCount = quests.filter(q => !q.completed).length;

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] flex flex-col justify-between p-4 sm:p-8 lg:p-12 space-y-12 max-w-[1700px] mx-auto">
      
      {/* Hero Header Section */}
      <div className="space-y-6 text-center max-w-4xl mx-auto pt-4 sm:pt-8">
        
        {/* Pill Eyebrow Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#18181c] text-[#f5f4ef] font-pixel text-xs uppercase tracking-widest border border-black shadow-pixel-sm">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>YAKITORI // E-INK MONOCHROME QUEST SYSTEM</span>
        </div>

        {/* Hero Title in Bookerly & Pixel font */}
        <h1 className="font-pixel text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#111113] leading-tight uppercase">
          TURN YOUR TASKS INTO AN <br className="hidden sm:block" />
          <span className="bg-[#18181c] text-[#f5f4ef] px-3 py-1 inline-block mt-2 shadow-pixel">
            EPIC PIXEL RPG QUEST
          </span>
        </h1>

        {/* Bookerly Serif Subhead */}
        <p className="font-serif italic text-base sm:text-xl text-[#4a4943] max-w-2xl mx-auto leading-relaxed">
          Level up Intellect, Strength, Creativity, Vitality, and Discipline. Complete quests, maintain daily fire streaks, and earn Gold in a tactile off-white E-Ink paper world.
        </p>

        {/* Primary CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            onClick={onEnterApp}
            className="w-full sm:w-auto px-8 py-4 pixel-btn-primary font-pixel text-sm sm:text-base font-bold uppercase tracking-wider flex items-center justify-center gap-3 group"
          >
            <Gamepad2 className="w-5 h-5 text-amber-400" />
            <span>LAUNCH QUEST ENGINE</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>

          <a
            href="#features"
            className="w-full sm:w-auto px-6 py-4 pixel-btn font-pixel text-xs sm:text-sm font-bold uppercase tracking-wider text-center"
          >
            EXPLORE SYSTEM FEATURES
          </a>
        </div>

        {/* Status Bar */}
        <div className="pt-2 flex items-center justify-center gap-4 text-xs font-mono text-[#4a4943]">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Character Level {playerStats.level} Active
          </span>
          <span>•</span>
          <span>{activeQuestsCount} Active Quests Ready</span>
          <span>•</span>
          <span>Kindle Bookerly Fonts Loaded</span>
        </div>

      </div>

      {/* Interactive Drone Greeting Card */}
      <div className="double-bezel max-w-3xl mx-auto w-full">
        <div className="double-bezel-inner bg-[#ebeae4] p-5 flex flex-col sm:flex-row items-center gap-4 border border-[#18181c]">
          {/* Animated Pixel Drone Graphic */}
          <div className="w-16 h-16 bg-[#18181c] text-[#f5f4ef] border-2 border-black shadow-pixel flex items-center justify-center shrink-0 relative animate-float">
            <div className="w-12 h-8 bg-black text-amber-400 font-pixel font-bold text-lg flex items-center justify-center">
              (o.o)
            </div>
            <div className="absolute -bottom-2 w-3 h-2 bg-amber-400 animate-pulse"></div>
          </div>

          <div className="text-center sm:text-left flex-1 font-serif text-sm text-[#111113]">
            <div className="font-pixel text-xs font-bold text-[#4a4943] uppercase tracking-widest mb-1">
              Byte // Assistant Pixel Drone
            </div>
            <p className="italic font-serif">
              "BEEP BOOP! Greetings Adventurer! I am Byte, your pixel drone companion. I will guide you through quests, stats, level ups, and shop rewards!"
            </p>
          </div>

          <button
            onClick={onEnterApp}
            className="px-4 py-2 pixel-btn font-pixel text-xs font-bold uppercase shrink-0"
          >
            TALK TO BYTE →
          </button>
        </div>
      </div>

      {/* Full-Screen Bento Showcase (Utilizing All Screen Real Estate) */}
      <div id="features" className="space-y-6 pt-6 border-t-2 border-[#18181c]">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h2 className="font-pixel text-xl sm:text-2xl font-bold uppercase tracking-wider text-[#111113]">
              CORE GAMIFIED SYSTEM ARCHITECTURE
            </h2>
            <p className="font-serif italic text-xs sm:text-sm text-[#4a4943]">
              Tactile pixel hardware components engineered for maximum focus and daily motivation
            </p>
          </div>
          <span className="font-mono text-xs text-[#4a4943] uppercase border border-[#18181c] px-2.5 py-1 bg-[#ebeae4]">
            5 CORE MODULES
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Bento Card 1: Attributes */}
          <div className="double-bezel">
            <div className="double-bezel-inner bg-[#ebeae4] p-5 space-y-3 h-full flex flex-col justify-between border border-[#18181c]">
              <div>
                <div className="w-10 h-10 bg-[#18181c] text-[#f5f4ef] flex items-center justify-center border border-black shadow-pixel-sm mb-3">
                  <Brain className="w-5 h-5 text-amber-400" />
                </div>
                <h3 className="font-pixel text-base font-bold uppercase tracking-wide text-[#111113]">
                  1. RPG STATS & ATTRIBUTES
                </h3>
                <p className="font-serif text-xs text-[#4a4943] mt-1 leading-relaxed">
                  Categorize your real-world tasks into 5 character attributes. Watch your stats level up as you complete tasks:
                </p>
                <div className="mt-3 grid grid-cols-2 gap-1.5 font-mono text-[11px]">
                  <span className="flex items-center gap-1"><Brain className="w-3 h-3 text-blue-600" /> Intellect</span>
                  <span className="flex items-center gap-1"><Dumbbell className="w-3 h-3 text-red-600" /> Strength</span>
                  <span className="flex items-center gap-1"><Palette className="w-3 h-3 text-purple-600" /> Creativity</span>
                  <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-emerald-600" /> Vitality</span>
                  <span className="flex items-center gap-1"><Shield className="w-3 h-3 text-amber-600" /> Discipline</span>
                </div>
              </div>
              <div className="pt-3 border-t border-[#18181c]/30 font-mono text-[10px] text-[#4a4943] uppercase font-bold">
                Auto XP Progression Engine
              </div>
            </div>
          </div>

          {/* Bento Card 2: Streaks & Multiplier */}
          <div className="double-bezel">
            <div className="double-bezel-inner bg-[#ebeae4] p-5 space-y-3 h-full flex flex-col justify-between border border-[#18181c]">
              <div>
                <div className="w-10 h-10 bg-[#18181c] text-orange-400 flex items-center justify-center border border-black shadow-pixel-sm mb-3">
                  <Flame className="w-5 h-5 animate-pulse" />
                </div>
                <h3 className="font-pixel text-base font-bold uppercase tracking-wide text-[#111113]">
                  2. STREAK FIRE MULTIPLIER
                </h3>
                <p className="font-serif text-xs text-[#4a4943] mt-1 leading-relaxed">
                  Consistency is key. Maintain daily task completions to ignite your streak flame and earn up to 2.5x XP multipliers.
                </p>
                <div className="mt-4 p-2.5 bg-[#f5f4ef] border border-[#18181c] flex items-center justify-between font-mono text-xs">
                  <span className="font-bold">Active Streak: {playerStats.streakDays} Days</span>
                  <span className="text-orange-600 font-bold">{playerStats.activeMultiplier}x XP</span>
                </div>
              </div>
              <div className="pt-3 border-t border-[#18181c]/30 font-mono text-[10px] text-[#4a4943] uppercase font-bold">
                Daily Heatmap Calendar
              </div>
            </div>
          </div>

          {/* Bento Card 3: Armory Shop */}
          <div className="double-bezel">
            <div className="double-bezel-inner bg-[#ebeae4] p-5 space-y-3 h-full flex flex-col justify-between border border-[#18181c]">
              <div>
                <div className="w-10 h-10 bg-[#18181c] text-[#f5f4ef] flex items-center justify-center border border-black shadow-pixel-sm mb-3">
                  <ShoppingBag className="w-5 h-5 text-amber-400" />
                </div>
                <h3 className="font-pixel text-base font-bold uppercase tracking-wide text-[#111113]">
                  3. PIXEL ARMORY MARKETPLACE
                </h3>
                <p className="font-serif text-xs text-[#4a4943] mt-1 leading-relaxed">
                  Earn Gold Coins ($G) for every finished quest. Spend your gold on equipment buffs, custom profile badges, and drone cosmetics.
                </p>
                <div className="mt-3 flex items-center gap-2 font-mono text-xs">
                  <span className="px-2 py-1 bg-[#18181c] text-[#f5f4ef]">⚔️ Katana</span>
                  <span className="px-2 py-1 bg-[#18181c] text-[#f5f4ef]">👓 Glasses</span>
                  <span className="px-2 py-1 bg-[#18181c] text-[#f5f4ef]">👑 Badges</span>
                </div>
              </div>
              <div className="pt-3 border-t border-[#18181c]/30 font-mono text-[10px] text-[#4a4943] uppercase font-bold">
                Virtual Gold Economy
              </div>
            </div>
          </div>

          {/* Bento Card 4: Web Audio Synth */}
          <div className="double-bezel">
            <div className="double-bezel-inner bg-[#ebeae4] p-5 space-y-3 h-full flex flex-col justify-between border border-[#18181c]">
              <div>
                <div className="w-10 h-10 bg-[#18181c] text-[#f5f4ef] flex items-center justify-center border border-black shadow-pixel-sm mb-3">
                  <Volume2 className="w-5 h-5 text-amber-400" />
                </div>
                <h3 className="font-pixel text-base font-bold uppercase tracking-wide text-[#111113]">
                  4. SYNTHESIZED 8-BIT AUDIO
                </h3>
                <p className="font-serif text-xs text-[#4a4943] mt-1 leading-relaxed">
                  Native Web Audio API retro sound synthesis. Satisfying chimes, level-up victory fanfares, and drone chirps.
                </p>
              </div>
              <div className="pt-3 border-t border-[#18181c]/30 font-mono text-[10px] text-[#4a4943] uppercase font-bold">
                Zero Asset Load • Pure Synthesizer
              </div>
            </div>
          </div>

          {/* Bento Card 5: Keyboard Ergonomics */}
          <div className="double-bezel md:col-span-2 lg:col-span-2">
            <div className="double-bezel-inner bg-[#ebeae4] p-5 space-y-3 h-full flex flex-col justify-between border border-[#18181c]">
              <div>
                <div className="w-10 h-10 bg-[#18181c] text-[#f5f4ef] flex items-center justify-center border border-black shadow-pixel-sm mb-3">
                  <Keyboard className="w-5 h-5 text-amber-400" />
                </div>
                <h3 className="font-pixel text-base font-bold uppercase tracking-wide text-[#111113]">
                  5. ACCESSIBLE KEYBOARD ERGONOMICS
                </h3>
                <p className="font-serif text-xs text-[#4a4943] mt-1 leading-relaxed">
                  Designed for maximum keyboard productivity. Entirely navigable via keyboard hotkeys without leaving your workflow:
                </p>
                <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
                  <div className="p-2 bg-[#f5f4ef] border border-[#18181c]">
                    <kbd className="font-pixel font-bold text-amber-600">N</kbd> : New Quest
                  </div>
                  <div className="p-2 bg-[#f5f4ef] border border-[#18181c]">
                    <kbd className="font-pixel font-bold text-amber-600">/</kbd> : Search
                  </div>
                  <div className="p-2 bg-[#f5f4ef] border border-[#18181c]">
                    <kbd className="font-pixel font-bold text-amber-600">M</kbd> : Toggle SFX
                  </div>
                  <div className="p-2 bg-[#f5f4ef] border border-[#18181c]">
                    <kbd className="font-pixel font-bold text-amber-600">Tab</kbd> : Focus Ring
                  </div>
                </div>
              </div>
              <div className="pt-3 border-t border-[#18181c]/30 font-mono text-[10px] text-[#4a4943] uppercase font-bold">
                100% Screen Reader & Keyboard Accessible
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Bottom CTA Banner */}
      <div className="double-bezel text-center">
        <div className="double-bezel-inner bg-[#18181c] text-[#f5f4ef] p-8 border border-black flex flex-col items-center justify-center space-y-4">
          <h3 className="font-pixel text-2xl sm:text-3xl font-bold uppercase tracking-wider text-white">
            READY TO START YOUR ADVENTURE?
          </h3>
          <p className="font-serif italic text-sm text-zinc-400 max-w-xl">
            Pre-loaded starter quests are waiting for you. Experience the Kindle Bookerly typography and off-white E-Ink paper design now.
          </p>
          <button
            onClick={onEnterApp}
            className="px-8 py-3.5 bg-amber-400 text-black font-pixel font-bold text-sm uppercase tracking-wider pixel-btn hover:bg-amber-300 flex items-center gap-2"
          >
            <Gamepad2 className="w-5 h-5" />
            <span>START PLAYING NOW</span>
          </button>
        </div>
      </div>

    </div>
  );
};
