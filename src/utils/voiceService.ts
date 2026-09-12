import { isSoundEnabled, playCuteCompanionChime } from './sound';

export interface SpeakOptions {
  text: string;
  onStart?: () => void;
  onWord?: (charIndex: number, currentWord: string, progress: number) => void;
  onEnd?: () => void;
  onError?: (error: unknown) => void;
  rate?: number;
  pitch?: number;
  volume?: number;
}

export interface VoiceController {
  stop: () => void;
  isSpeaking: () => boolean;
}

class VoiceService {
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private fallbackTimer: NodeJS.Timeout | null = null;
  private cachedVoices: SpeechSynthesisVoice[] = [];
  private selectedVoice: SpeechSynthesisVoice | null = null;
  private isSpeakingActive: boolean = false;
  private voicesLoadedPromise: Promise<SpeechSynthesisVoice[]> | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.initVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        this.initVoices();
      };
    }
  }

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  public initVoices(): void {
    if (!this.isSupported()) return;
    this.cachedVoices = window.speechSynthesis.getVoices();
    if (this.cachedVoices.length > 0) {
      this.selectedVoice = this.pickBestCuteVoice(this.cachedVoices);
    }
  }

  public async getOrWaitForVoices(): Promise<SpeechSynthesisVoice[]> {
    if (!this.isSupported()) return [];

    const existing = window.speechSynthesis.getVoices();
    if (existing && existing.length > 0) {
      this.cachedVoices = existing;
      this.selectedVoice = this.pickBestCuteVoice(existing);
      return existing;
    }

    if (this.voicesLoadedPromise) {
      return this.voicesLoadedPromise;
    }

    this.voicesLoadedPromise = new Promise((resolve) => {
      let resolved = false;
      const onVoices = () => {
        if (!resolved) {
          resolved = true;
          window.speechSynthesis.removeEventListener('voiceschanged', onVoices);
          const v = window.speechSynthesis.getVoices();
          this.cachedVoices = v;
          this.selectedVoice = this.pickBestCuteVoice(v);
          resolve(v);
        }
      };

      window.speechSynthesis.addEventListener('voiceschanged', onVoices);

      setTimeout(() => {
        if (!resolved) {
          resolved = true;
          window.speechSynthesis.removeEventListener('voiceschanged', onVoices);
          const v = window.speechSynthesis.getVoices();
          this.cachedVoices = v;
          this.selectedVoice = this.pickBestCuteVoice(v);
          resolve(v);
        }
      }, 400);
    });

    return this.voicesLoadedPromise;
  }

  public pickBestCuteVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
    if (!voices || voices.length === 0) return null;

    const englishVoices = voices.filter(v => v.lang.toLowerCase().startsWith('en'));
    const pool = englishVoices.length > 0 ? englishVoices : voices;

    // 1. High-fidelity Neural / Natural cute girl voices (Edge, Windows 11)
    // Maisie, Ana, Libby, Jenny, Michelle are expressive human young female voices
    const cuteNames = ['maisie', 'ana', 'libby', 'jenny', 'michelle', 'aria', 'sonia'];

    for (const name of cuteNames) {
      const match = pool.find(v => {
        const n = v.name.toLowerCase();
        return n.includes(name) && (n.includes('natural') || n.includes('online') || n.includes('neural'));
      });
      if (match) return match;
    }

    // 2. Any voice containing cute girl names
    for (const name of cuteNames) {
      const match = pool.find(v => v.name.toLowerCase().includes(name));
      if (match) return match;
    }

    // 3. Apple/Safari cute voices (macOS / iOS)
    const appleCute = ['zoe', 'ava', 'samantha', 'victoria', 'tessa'];
    for (const name of appleCute) {
      const match = pool.find(v => v.name.toLowerCase().includes(name));
      if (match) return match;
    }

    // 4. Google modern female voices (Chrome)
    const googleFemale = pool.find(v => {
      const n = v.name.toLowerCase();
      return n.includes('google') && (n.includes('us english') || n.includes('female'));
    });
    if (googleFemale) return googleFemale;

    // 5. Any natural / neural female
    const anyNeuralFemale = pool.find(v => {
      const n = v.name.toLowerCase();
      return (n.includes('natural') || n.includes('neural')) && n.includes('female');
    });
    if (anyNeuralFemale) return anyNeuralFemale;

    // 6. Non-desktop female (strictly avoids robotic SAPI5 Microsoft Zira Desktop)
    const nonDesktopFemale = pool.find(v => {
      const n = v.name.toLowerCase();
      return (n.includes('female') || n.includes('woman') || n.includes('girl')) && !n.includes('desktop');
    });
    if (nonDesktopFemale) return nonDesktopFemale;

    // 7. Any female voice
    const anyFemale = pool.find(v => v.name.toLowerCase().includes('female'));
    if (anyFemale) return anyFemale;

    return pool.find(v => v.default) || pool[0] || voices[0] || null;
  }

  public getCuteVoiceTuning(voice: SpeechSynthesisVoice | null): { rate: number; pitch: number } {
    if (!voice) {
      return { rate: 1.07, pitch: 1.25 };
    }
    const name = voice.name.toLowerCase();

    // Maisie, Ana, Libby are inherently sweet and youthful; slight lift sounds totally natural
    if (name.includes('maisie') || name.includes('ana') || name.includes('libby')) {
      return { rate: 1.05, pitch: 1.15 };
    }

    // Jenny: cheerful, warm anime companion voice
    if (name.includes('jenny')) {
      return { rate: 1.06, pitch: 1.22 };
    }

    // Google US English: default is flat robotic AI. Lifting pitch to 1.28 and rate to 1.08 transforms it into a bubbly cute girl!
    if (name.includes('google')) {
      return { rate: 1.08, pitch: 1.28 };
    }

    // Apple voices
    if (name.includes('zoe') || name.includes('ava')) {
      return { rate: 1.06, pitch: 1.20 };
    }
    if (name.includes('samantha')) {
      return { rate: 1.07, pitch: 1.25 };
    }

    return { rate: 1.07, pitch: 1.24 };
  }

  public stop(): void {
    this.isSpeakingActive = false;
    if (this.fallbackTimer) {
      clearInterval(this.fallbackTimer);
      this.fallbackTimer = null;
    }
    if (this.isSupported()) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {
        console.warn('[voiceService] cancel error:', e);
      }
    }
    this.currentUtterance = null;
  }

  private runFallbackTyping(
    text: string,
    rate: number,
    onStart?: () => void,
    onWord?: (charIndex: number, currentWord: string, progress: number) => void,
    onEnd?: () => void
  ): void {
    onStart?.();
    const words = text.split(/\s+/);
    const avgWordMs = Math.max(150, Math.round(240 / rate));
    let currentWordIdx = 0;

    if (this.fallbackTimer) {
      clearInterval(this.fallbackTimer);
    }

    this.fallbackTimer = setInterval(() => {
      if (!this.isSpeakingActive) {
        if (this.fallbackTimer) clearInterval(this.fallbackTimer);
        return;
      }

      currentWordIdx++;
      const progress = Math.min(1, currentWordIdx / words.length);
      const charIndex = words.slice(0, currentWordIdx).join(' ').length;
      const currentWord = words[currentWordIdx - 1] || '';

      onWord?.(charIndex, currentWord, progress);

      if (currentWordIdx >= words.length) {
        if (this.fallbackTimer) clearInterval(this.fallbackTimer);
        this.fallbackTimer = null;
        this.isSpeakingActive = false;
        setTimeout(() => {
          onEnd?.();
        }, 300);
      }
    }, avgWordMs);
  }

  public speak(options: SpeakOptions): VoiceController {
    this.stop();

    const {
      text,
      onStart,
      onWord,
      onEnd,
      onError,
    } = options;

    this.isSpeakingActive = true;

    // Check if audio sound is enabled in application settings
    const soundAllowed = isSoundEnabled();

    // Ensure voices are available
    if (this.isSupported()) {
      const currentVoices = window.speechSynthesis.getVoices();
      if (currentVoices.length > 0) {
        this.cachedVoices = currentVoices;
        this.selectedVoice = this.pickBestCuteVoice(currentVoices);
      }
    }

    const tuning = this.getCuteVoiceTuning(this.selectedVoice);
    const rate = options.rate ?? tuning.rate;
    const pitch = options.pitch ?? tuning.pitch;
    const volume = options.volume ?? 1.0;

    // If sound is disabled or speech synthesis is not supported, run animated typewriter
    if (!soundAllowed || !this.isSupported()) {
      this.runFallbackTyping(text, rate, onStart, onWord, onEnd);
      return {
        stop: () => this.stop(),
        isSpeaking: () => this.isSpeakingActive,
      };
    }

    // Play cute sparkling anime chime when she begins greeting
    playCuteCompanionChime();

    try {
      // Unfreeze browser speech synthesis if it was suspended
      window.speechSynthesis.cancel();
      window.speechSynthesis.resume();

      const utterance = new SpeechSynthesisUtterance(text);
      if (this.selectedVoice) {
        utterance.voice = this.selectedVoice;
      }
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.volume = volume;

      let hasBoundary = false;
      const words = text.split(/\s+/);
      let boundaryCount = 0;

      utterance.onstart = () => {
        this.isSpeakingActive = true;
        onStart?.();
      };

      utterance.onboundary = (e) => {
        hasBoundary = true;
        boundaryCount++;
        const charIdx = e.charIndex !== undefined ? e.charIndex : 0;
        const progress = Math.min(1, Math.max(0.1, boundaryCount / words.length));
        const currentWord = text.slice(charIdx).split(/\s+/)[0] || '';
        onWord?.(charIdx, currentWord, progress);
      };

      utterance.onend = () => {
        this.isSpeakingActive = false;
        this.currentUtterance = null;
        if (this.fallbackTimer) {
          clearInterval(this.fallbackTimer);
          this.fallbackTimer = null;
        }
        onEnd?.();
      };

      utterance.onerror = (err) => {
        this.isSpeakingActive = false;
        this.currentUtterance = null;
        if (this.fallbackTimer) {
          clearInterval(this.fallbackTimer);
          this.fallbackTimer = null;
        }

        // If error is not-allowed (e.g. browser autoplay restriction on fresh refresh before user clicks),
        // gracefully fall back to full animated reading so she doesn't disappear in 0 seconds!
        if (err.error === 'not-allowed') {
          console.warn('[voiceService] Speech autoplay blocked, switching to animated dialogue.');
          this.runFallbackTyping(text, rate, onStart, onWord, onEnd);
          return;
        }

        if (err.error !== 'canceled') {
          console.warn('[voiceService] Speech synthesis error:', err);
          onError?.(err);
        }
        onEnd?.();
      };

      this.currentUtterance = utterance;

      // Fallback word-tick timer in case browser doesn't fire onboundary
      const approxDurationMs = Math.max(1200, (words.length / (rate * 3)) * 1000);
      const stepMs = Math.max(120, Math.round(approxDurationMs / words.length));
      let stepWordIdx = 0;

      this.fallbackTimer = setInterval(() => {
        if (!this.isSpeakingActive) {
          if (this.fallbackTimer) clearInterval(this.fallbackTimer);
          return;
        }
        if (!hasBoundary) {
          stepWordIdx++;
          const progress = Math.min(1, stepWordIdx / words.length);
          const charIndex = words.slice(0, stepWordIdx).join(' ').length;
          const currentWord = words[stepWordIdx - 1] || '';
          onWord?.(charIndex, currentWord, progress);
        }
      }, stepMs);

      window.speechSynthesis.speak(utterance);

    } catch (e) {
      console.warn('[voiceService] Failed to speak with speechSynthesis, using fallback:', e);
      this.runFallbackTyping(text, rate, onStart, onWord, onEnd);
    }

    return {
      stop: () => this.stop(),
      isSpeaking: () => this.isSpeakingActive,
    };
  }
}

export const voiceService = new VoiceService();
