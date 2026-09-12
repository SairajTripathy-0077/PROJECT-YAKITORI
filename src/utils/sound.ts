// Native Web Audio API 8-Bit Retro Synthesizer
let audioCtx: AudioContext | null = null;
let soundEnabled = true;

const getAudioContext = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

export const setSoundEnabled = (enabled: boolean) => {
  soundEnabled = enabled;
};

export const isSoundEnabled = () => soundEnabled;

export const playTone = (freq: number, type: OscillatorType, duration: number, startVol = 0.1, endVol = 0.001) => {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(startVol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(endVol, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    console.warn('Audio play error:', e);
  }
};

export const playClick = () => {
  playTone(800, 'square', 0.04, 0.05);
};

export const playQuestComplete = () => {
  if (!soundEnabled) return;
  const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
  notes.forEach((freq, idx) => {
    setTimeout(() => {
      playTone(freq, 'square', 0.12, 0.12);
    }, idx * 70);
  });
};

export const playLevelUp = () => {
  if (!soundEnabled) return;
  const arpeggio = [440, 554.37, 659.25, 880, 1108.73, 1318.51, 1760];
  arpeggio.forEach((freq, idx) => {
    setTimeout(() => {
      playTone(freq, 'triangle', 0.15, 0.15);
    }, idx * 60);
  });
};

export const playDroneBeep = () => {
  if (!soundEnabled) return;
  playTone(1200, 'sine', 0.06, 0.08);
  setTimeout(() => {
    playTone(1600, 'sine', 0.08, 0.08);
  }, 70);
};

export const playShopBuy = () => {
  if (!soundEnabled) return;
  playTone(987.77, 'square', 0.08, 0.1); // B5
  setTimeout(() => {
    playTone(1318.51, 'square', 0.2, 0.15); // E6
  }, 80);
};

export const playSubtask = () => {
  playTone(950, 'square', 0.05, 0.06);
};

export const playDeleteSound = () => {
  playTone(220, 'sawtooth', 0.12, 0.08, 0.001);
};

export type SoundType = 'click' | 'purchase' | 'buy' | 'levelUp' | 'questComplete' | 'complete' | 'error' | 'delete' | 'subtask' | 'drone';

export const playSound = (type: SoundType) => {
  switch (type) {
    case 'click':
      playClick();
      break;
    case 'purchase':
    case 'buy':
      playShopBuy();
      break;
    case 'levelUp':
      playLevelUp();
      break;
    case 'questComplete':
    case 'complete':
      playQuestComplete();
      break;
    case 'error':
    case 'delete':
      playDeleteSound();
      break;
    case 'subtask':
      playSubtask();
      break;
    case 'drone':
      playDroneBeep();
      break;
    default:
      playClick();
      break;
  }
};
