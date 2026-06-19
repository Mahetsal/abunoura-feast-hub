import { useState, useCallback, useRef } from 'react';

type SoundType = 'ding' | 'pop' | 'tick' | 'fanfare' | 'flip' | 'match' | 'success';

const SOUND_CONFIGS: Record<SoundType, { freq: number; type: OscillatorType; duration: number; gain: number; ramp?: number; secondFreq?: number }> = {
  ding: { freq: 1200, type: 'sine', duration: 0.15, gain: 0.25 },
  pop: { freq: 300, type: 'triangle', duration: 0.1, gain: 0.2 },
  tick: { freq: 600, type: 'square', duration: 0.03, gain: 0.08 },
  flip: { freq: 500, type: 'sine', duration: 0.08, gain: 0.15 },
  match: { freq: 880, type: 'sine', duration: 0.25, gain: 0.2, secondFreq: 1100 },
  fanfare: { freq: 523, type: 'sine', duration: 0.6, gain: 0.25, secondFreq: 784 },
  success: { freq: 660, type: 'sine', duration: 0.3, gain: 0.2, secondFreq: 880 },
};

export function useGameSounds() {
  const [isMuted, setIsMuted] = useState(() => {
    return localStorage.getItem('game-sounds-muted') === 'true';
  });
  const audioCtxRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  const playGameSound = useCallback((sound: SoundType) => {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      const config = SOUND_CONFIGS[sound];
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = config.freq;
      osc.type = config.type;
      gain.gain.setValueAtTime(config.gain, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + config.duration);
      osc.start(now);
      osc.stop(now + config.duration);

      // Play a second note for chime/fanfare effects
      if (config.secondFreq) {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.frequency.value = config.secondFreq;
        osc2.type = config.type;
        gain2.gain.setValueAtTime(0, now + config.duration * 0.3);
        gain2.gain.linearRampToValueAtTime(config.gain, now + config.duration * 0.4);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + config.duration * 1.5);
        osc2.start(now + config.duration * 0.3);
        osc2.stop(now + config.duration * 1.5);
      }
    } catch (e) {
      // Audio not available
    }
  }, [isMuted, getAudioContext]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const next = !prev;
      localStorage.setItem('game-sounds-muted', String(next));
      return next;
    });
  }, []);

  return { playGameSound, isMuted, toggleMute };
}
