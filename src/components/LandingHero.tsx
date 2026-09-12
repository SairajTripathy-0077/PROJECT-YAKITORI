import { useState, type FC } from 'react';
import { LogIn, ArrowRight } from 'lucide-react';
import { AuthModal } from './AuthModal';
import { useAuth } from '../context/AuthContext';
import { playSound } from '../utils/sound';
import lofiBgGif from '../assets/lofi-bg-gif.gif';

interface LandingHeroProps {
  onEnterApp?: () => void;
}

export const LandingHero: FC<LandingHeroProps> = ({ onEnterApp }) => {
  const { user } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <div 
      className="w-full flex-1 min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-6 sm:p-12 text-center bg-cover bg-center bg-no-repeat relative animate-fade-in"
      style={{ 
        backgroundImage: `url('${lofiBgGif}')`,
      }}
    >
      {/* Centered Hero Content */}
      <div className="relative z-10 space-y-8 max-w-3xl mx-auto my-auto flex flex-col items-center">
        
        <h1 className="font-pixel text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#f5f4ef] uppercase leading-none drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)] inline-block">
          TURN TASKS INTO <br />
          <span className="bg-[#18181c] text-[#f5f4ef] px-4 py-2 inline-block mt-3 border border-black shadow-pixel">
            AN EPIC RPG QUEST
          </span>
        </h1>

        {/* CTA Authentication Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          {user ? (
            <button
              onClick={() => {
                playSound('click');
                onEnterApp?.();
              }}
              className="px-8 py-4 bg-[#18181c] text-[#f5f4ef] font-pixel text-lg uppercase font-bold border-2 border-black hover:bg-black transition-transform hover:-translate-y-0.5 shadow-pixel flex items-center gap-3"
            >
              <span>ENTER APP DASHBOARD</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={() => {
                playSound('click');
                setIsAuthModalOpen(true);
              }}
              className="w-full sm:w-auto px-8 py-4 bg-[#18181c] text-[#f5f4ef] font-pixel text-base uppercase font-bold border-2 border-black hover:bg-black transition-transform hover:-translate-y-0.5 shadow-pixel flex items-center justify-center gap-3"
            >
              <LogIn className="w-5 h-5 text-amber-400" />
              <span>SIGN IN / REGISTER</span>
            </button>
          )}
        </div>

      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => onEnterApp?.()}
      />
    </div>
  );
};

