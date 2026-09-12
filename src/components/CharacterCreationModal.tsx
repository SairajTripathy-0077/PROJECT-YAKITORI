import { useState, useEffect, type FC } from 'react';
import { useGame } from '../context/GameContext';
import { useAuth } from '../context/AuthContext';
import { SpriteCharacter } from './SpriteCharacter';
import { playSound } from '../utils/sound';
import { api } from '../utils/api';
import { 
  Sparkles, 
  RotateCcw, 
  CheckCircle2, 
  Brain, 
  Dumbbell, 
  Palette, 
  Zap, 
  Shield, 
  User, 
  Award,
  Dice5,
  Wand2,
  X
} from 'lucide-react';
import type { CharacterClass, AttributeType } from '../types/game';

interface CharacterCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompleted?: () => void;
}

const CLASS_DESCRIPTIONS: Record<CharacterClass, { title: string; desc: string; icon: string; bonus: string }> = {
  Warrior: {
    title: 'Warrior Archon',
    desc: 'Master of physical feats, discipline, and heavy endurance.',
    icon: '⚔️',
    bonus: '+15 Strength, +10 Discipline',
  },
  Mage: {
    title: 'Arcane Scholar',
    desc: 'Master of deep intellect, research, and technical mastery.',
    icon: '🧙‍♂️',
    bonus: '+15 Intellect, +10 Creativity',
  },
  Rogue: {
    title: 'Shadow Assassin',
    desc: 'Master of agile habits, speed, and creative strategy.',
    icon: '🥷',
    bonus: '+15 Creativity, +10 Vitality',
  },
  Paladin: {
    title: 'Sovereign Sentinel',
    desc: 'Master of steadfast vitality, protection, and leadership.',
    icon: '🛡️',
    bonus: '+15 Vitality, +10 Strength',
  },
};

export const CharacterCreationModal: FC<CharacterCreationModalProps> = ({
  isOpen,
  onClose,
  onCompleted,
}) => {
  const { playerStats, attributes, updatePlayerCharacter, updateAttributes } = useGame();
  const { user, dbProfile, refreshProfile } = useAuth();

  // Generate initial random sprite index (0 - 191)
  const getRandomSpriteIndex = () => Math.floor(Math.random() * 192);

  const [heroName, setHeroName] = useState<string>('');
  const [spriteIndex, setSpriteIndex] = useState<number>(getRandomSpriteIndex());
  const [characterClass, setCharacterClass] = useState<CharacterClass>('Warrior');
  const [isRerolling, setIsRerolling] = useState(false);

  // Initialize form values from active user or current stats
  useEffect(() => {
    if (isOpen) {
      const defaultName = dbProfile?.displayName || user?.displayName || user?.email?.split('@')[0] || playerStats.name || 'Pixel Adventurer';
      setHeroName(defaultName);
      setSpriteIndex(playerStats.equippedCharacter ?? getRandomSpriteIndex());
      setCharacterClass((playerStats.characterClass as CharacterClass) || 'Warrior');
    }
  }, [isOpen, user, dbProfile, playerStats.name, playerStats.equippedCharacter, playerStats.characterClass]);

  if (!isOpen) return null;

  // Handle Reroll random character avatar
  const handleRerollSprite = () => {
    playSound('click');
    setIsRerolling(true);
    let count = 0;
    const interval = setInterval(() => {
      setSpriteIndex(getRandomSpriteIndex());
      count++;
      if (count > 8) {
        clearInterval(interval);
        setIsRerolling(false);
      }
    }, 60);
  };

  // Submit and save updated character stats
  const handleSaveCharacter = () => {
    playSound('levelUp');
    const cleanName = heroName.trim() || 'Hero';
    const avatarIcon = CLASS_DESCRIPTIONS[characterClass].icon;

    // Apply class bonuses to attributes
    const updatedAttrs = { ...attributes };
    if (characterClass === 'Warrior') {
      updatedAttrs.strength.level += 1;
      updatedAttrs.discipline.level += 1;
    } else if (characterClass === 'Mage') {
      updatedAttrs.intellect.level += 1;
      updatedAttrs.creativity.level += 1;
    } else if (characterClass === 'Rogue') {
      updatedAttrs.creativity.level += 1;
      updatedAttrs.vitality.level += 1;
    } else if (characterClass === 'Paladin') {
      updatedAttrs.vitality.level += 1;
      updatedAttrs.strength.level += 1;
    }

    // Update global game state
    updatePlayerCharacter({
      name: cleanName,
      characterClass,
      equippedCharacter: spriteIndex,
      avatar: avatarIcon,
    });

    updateAttributes(updatedAttrs);


    // Sync to backend MongoDB database asynchronously
    if (user) {
      api.post('/api/auth/sync', {
        displayName: cleanName,
        characterClass,
        avatarIcon: String(spriteIndex),
        equippedCharacter: spriteIndex,
        level: playerStats.level,
        xp: playerStats.xp,
        streakDays: playerStats.streakDays,
      }).then(() => {
        refreshProfile();
      }).catch(() => {});
    }

    onCompleted?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in select-none">
      <div className="double-bezel w-full max-w-xl shadow-2xl">
        <div className="double-bezel-inner bg-[#ebeae4] p-5 sm:p-7 border-2 border-[#18181c] space-y-6 text-[#111113] relative overflow-hidden">
          
          {/* Header Banner */}
          <div className="flex items-center justify-between border-b-2 border-[#18181c] pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#18181c] text-amber-400 flex items-center justify-center font-pixel text-lg border-2 border-black shadow-pixel-sm">
                <Sparkles className="w-5 h-5 animate-spin" />
              </div>
              <div>
                <h2 className="font-pixel text-lg sm:text-xl font-bold uppercase tracking-wider text-[#111113]">
                  CHARACTER ASCENSION // ORIGIN
                </h2>
                <p className="font-mono text-[11px] text-[#4a4943] uppercase tracking-widest font-semibold">
                  Customize Hero Avatar, Name & Attributes
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                playSound('click');
                onClose();
              }}
              className="p-1 border-2 border-[#18181c] bg-[#ebeae4] hover:bg-[#18181c] hover:text-[#f5f4ef] transition-colors shadow-pixel-sm"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>


          {/* Avatar Sprite Randomizer + Hero Name Input */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 items-center bg-[#f5f4ef] p-4 border-2 border-[#18181c]">
            
            {/* Random Sprite Avatar Box */}
            <div className="sm:col-span-1 flex flex-col items-center gap-2">
              <div className="w-24 h-24 bg-[#ebeae4] border-2 border-[#18181c] shadow-pixel flex items-center justify-center relative overflow-hidden group">
                <SpriteCharacter 
                  index={spriteIndex} 
                  size={80} 
                  alt="Random Assigned Hero Sprite" 
                  className={isRerolling ? 'animate-bounce' : ''}
                />
              </div>

              <button
                type="button"
                onClick={handleRerollSprite}
                disabled={isRerolling}
                className="px-3 py-1.5 bg-[#18181c] text-[#f5f4ef] font-pixel text-[11px] font-bold uppercase tracking-wider border border-black hover:bg-black transition-all flex items-center gap-1.5 active:scale-[0.96] shadow-pixel-sm"
              >
                <Dice5 className={`w-3.5 h-3.5 text-amber-400 ${isRerolling ? 'animate-spin' : ''}`} />
                <span>REROLL SPRITE</span>
              </button>
            </div>

            {/* Hero Name & Custom Identity Input */}
            <div className="sm:col-span-2 space-y-3 font-mono">
              <div>
                <label className="block font-bold text-xs uppercase text-[#111113] mb-1 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-amber-700" />
                  <span>Hero Name Attribute:</span>
                </label>
                <input
                  type="text"
                  value={heroName}
                  onChange={(e) => setHeroName(e.target.value)}
                  placeholder="Enter Hero Name..."
                  className="w-full px-3 py-2 bg-[#ebeae4] border-2 border-[#18181c] text-sm font-bold text-[#111113] focus:outline-none focus:ring-2 focus:ring-[#18181c]"
                />
              </div>

              <div className="text-[11px] text-[#4a4943] bg-[#ebeae4] p-2 border border-[#18181c]/30 font-semibold">
                <span>Assigned Sprite Index: </span>
                <span className="font-bold text-[#111113]"># {spriteIndex + 1} / 192</span>
              </div>
            </div>

          </div>

          {/* RPG Character Class Selector */}
          <div className="space-y-2">
            <label className="block font-pixel text-xs font-bold uppercase tracking-wider text-[#111113] flex items-center gap-1.5">
              <Wand2 className="w-4 h-4 text-amber-700" />
              <span>Select Hero Specialization Class:</span>
            </label>

            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(CLASS_DESCRIPTIONS) as CharacterClass[]).map((cls) => {
                const info = CLASS_DESCRIPTIONS[cls];
                const isSelected = characterClass === cls;

                return (
                  <button
                    key={cls}
                    type="button"
                    onClick={() => {
                      playSound('click');
                      setCharacterClass(cls);
                    }}
                    className={`p-3 text-left border-2 transition-all font-mono text-xs flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#18181c] text-[#f5f4ef] border-black shadow-pixel-sm'
                        : 'bg-[#f5f4ef] text-[#111113] border-[#18181c] hover:bg-[#deddd6]'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold font-pixel mb-1">
                      <span className="flex items-center gap-1.5">
                        <span>{info.icon}</span>
                        <span>{info.title}</span>
                      </span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                    </div>
                    <p className={`text-[10px] ${isSelected ? 'text-zinc-300' : 'text-[#4a4943]'}`}>
                      {info.desc}
                    </p>
                    <span className={`text-[9px] font-bold mt-1.5 inline-block ${isSelected ? 'text-amber-300' : 'text-amber-800'}`}>
                      {info.bonus}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Confirm & Save Button */}
          <div className="pt-2 border-t border-[#18181c]/20 flex justify-end gap-3">
            <button
              type="button"
              onClick={handleSaveCharacter}
              className="w-full sm:w-auto px-6 py-3 pixel-btn-primary font-pixel text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-pixel"
            >
              <CheckCircle2 className="w-4 h-4 text-amber-400" />
              <span>COMPLETE ASCENSION & START QUESTING</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
