import { useState, useEffect, type FC } from 'react';
import { Terminal, Gamepad2 } from 'lucide-react';

export const LoadingScreen: FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 100);
          return 100;
        }
        return prev + 25;
      });
    }, 100);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-[#0d0d0f] text-[#f4f4f0] flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full double-bezel">
        <div className="double-bezel-inner bg-[#16161a] p-6 text-center border border-zinc-700">
          
          <div className="w-14 h-14 mx-auto mb-4 bg-zinc-900 border border-zinc-500 flex items-center justify-center text-amber-400">
            <Gamepad2 className="w-8 h-8 animate-pulse" />
          </div>

          <h1 className="font-pixel text-xl font-bold mb-2 tracking-wider text-white">
            YAKITORI // QUEST ENGINE
          </h1>

          <p className="font-serif italic text-zinc-400 text-xs sm:text-sm mb-6">
            "Every completed task is a brick in the temple of your destiny."
          </p>

          {/* Retro Progress Bar */}
          <div className="w-full bg-zinc-900 border border-zinc-700 p-1 mb-3">
            <div 
              className="h-4 bg-amber-400 transition-all duration-100 ease-out" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 uppercase">
            <span className="flex items-center gap-1">
              <Terminal className="w-3 h-3" />
              Initializing App...
            </span>
            <span>{progress}%</span>
          </div>

        </div>
      </div>
    </div>
  );
};
