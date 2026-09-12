import type { FC } from 'react';
import lofiHero from '../assets/lofi hero.png';

interface LandingHeroProps {
  onEnterApp?: () => void;
}

// Animated GIF asset from Pinterest pin 806003664587269059
const PINTEREST_GIF_URL = "https://i.pinimg.com/originals/d8/4f/0e/d84f0e0e2ec7fe05a43b8e0e1fcdc74a.gif";

export const LandingHero: FC<LandingHeroProps> = () => {
  return (
    <div 
      className="w-full min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center p-6 sm:p-12 text-center bg-cover bg-center bg-no-repeat relative border-b-2 border-[#18181c] animate-fade-in"
      style={{ 
        backgroundImage: `url('${PINTEREST_GIF_URL}'), url('${lofiHero}')`,
      }}
    >
      {/* Centered Hero Content */}
      <div className="relative z-10 space-y-6 max-w-3xl mx-auto my-auto">
        
        <h1 className="font-pixel text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#111113] uppercase leading-none drop-shadow-md bg-[#f5f4ef]/95 p-4 sm:p-6 border-2 border-[#18181c] shadow-pixel inline-block">
          TURN TASKS INTO <br />
          <span className="bg-[#18181c] text-[#f5f4ef] px-4 py-2 inline-block mt-3 border border-black">
            AN EPIC RPG QUEST
          </span>
        </h1>

        {/* Bookerly Serif Subhead */}
        <div className="p-4 sm:p-6 bg-[#f5f4ef]/95 border-2 border-[#18181c] shadow-pixel-sm max-w-xl mx-auto">
          <p className="font-serif italic text-lg sm:text-2xl text-[#111113] leading-relaxed font-bold">
            "Level up your stats, maintain daily streaks, and earn gold in a minimal E-Ink monochrome world."
          </p>
        </div>

      </div>
    </div>
  );
};



