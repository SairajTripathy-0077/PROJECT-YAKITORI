import { useState, useEffect, type FC, type FormEvent } from 'react';
import { X, LogIn, UserPlus, Shield, AlertCircle, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { playSound } from '../utils/sound';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AuthModal: FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { 
    loginWithGoogle, 
    loginWithEmail, 
    signupWithEmail, 
    error, 
    clearError 
  } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsSubmitting(true);
    try {
      if (mode === 'signin') {
        await loginWithEmail(email, password);
      } else {
        await signupWithEmail(email, password);
      }
      onSuccess?.();
      onClose();
    } catch {
      // Error handled in AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    try {
      await loginWithGoogle();
      onSuccess?.();
      onClose();
    } catch {
      // Error handled in AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="double-bezel w-full max-w-md">
        <div className="double-bezel-inner bg-[#f5f4ef] p-6 sm:p-8 space-y-6 relative border-2 border-[#18181c] shadow-pixel">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-[#18181c] pb-4">
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-[#18181c]" />
              <h2 className="font-pixel text-xl uppercase tracking-wide text-[#111113]">
                HERO IDENTITY // AUTH
              </h2>
            </div>

            <button
              onClick={() => {
                playSound('click');
                clearError();
                onClose();
              }}
              className="p-1 border-2 border-[#18181c] bg-[#ebeae4] hover:bg-[#18181c] hover:text-[#f5f4ef] transition-colors shadow-pixel-sm"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mode Tabs */}
          <div className="flex border-2 border-[#18181c] p-1 bg-[#ebeae4]">
            <button
              type="button"
              onClick={() => {
                playSound('click');
                clearError();
                setMode('signin');
              }}
              className={`flex-1 py-2 font-pixel text-xs uppercase font-bold transition-all ${
                mode === 'signin'
                  ? 'bg-[#18181c] text-[#f5f4ef] shadow-pixel-sm'
                  : 'text-[#4a4943] hover:text-black'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                playSound('click');
                clearError();
                setMode('signup');
              }}
              className={`flex-1 py-2 font-pixel text-xs uppercase font-bold transition-all ${
                mode === 'signup'
                  ? 'bg-[#18181c] text-[#f5f4ef] shadow-pixel-sm'
                  : 'text-[#4a4943] hover:text-black'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3 bg-red-100 border-2 border-red-800 text-red-900 font-mono text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-700" />
              <span>{error}</span>
            </div>
          )}

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4 font-mono text-sm">
            <div>
              <label className="block font-bold text-xs uppercase tracking-wide mb-1 text-[#111113]">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="hero@yakitori.rpg"
                className="w-full px-3 py-2 bg-[#ebeae4] border-2 border-[#18181c] focus:outline-none focus:bg-white text-[#111113] shadow-inner font-mono text-sm"
              />
            </div>

            <div>
              <label className="block font-bold text-xs uppercase tracking-wide mb-1 text-[#111113]">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 bg-[#ebeae4] border-2 border-[#18181c] focus:outline-none focus:bg-white text-[#111113] shadow-inner font-mono text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-[#18181c] text-[#f5f4ef] font-pixel text-sm uppercase font-bold border-2 border-black hover:bg-black transition-colors shadow-pixel flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {mode === 'signin' ? (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Log In to Quest Engine</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Create Hero Profile</span>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-2">
            <div className="border-t border-[#18181c]/30 w-full"></div>
            <span className="bg-[#f5f4ef] px-3 font-mono text-xs text-zinc-500 uppercase tracking-widest absolute">
              OR
            </span>
          </div>

          {/* Quick OAuth Sign In */}
          <div>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isSubmitting}
              className="w-full py-2.5 bg-[#ebeae4] text-[#111113] font-mono text-xs font-bold uppercase border-2 border-[#18181c] hover:bg-white transition-colors shadow-pixel-sm flex items-center justify-center gap-2"
            >
              <Globe className="w-4 h-4 text-emerald-700" />
              <span>Continue with Google</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

