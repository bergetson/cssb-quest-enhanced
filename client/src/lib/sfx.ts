// Lightweight WebAudio sound effects — no assets, generated tones.
// All calls are best-effort and guarded so they never throw in SSR or
// browsers that block audio before a user gesture.

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    if (!ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function beep(freq: number, start: number, duration: number, type: OscillatorType = 'sine', gain = 0.07) {
  const audio = getCtx();
  if (!audio) return;
  try {
    const osc = audio.createOscillator();
    const g = audio.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audio.currentTime + start);
    g.gain.setValueAtTime(0.0001, audio.currentTime + start);
    g.gain.exponentialRampToValueAtTime(gain, audio.currentTime + start + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + start + duration);
    osc.connect(g);
    g.connect(audio.destination);
    osc.start(audio.currentTime + start);
    osc.stop(audio.currentTime + start + duration + 0.02);
  } catch {
    // ignore
  }
}

export type Sfx = 'correct' | 'streak' | 'break' | 'loot' | 'gold';

export function playSfx(kind: Sfx) {
  switch (kind) {
    case 'correct':
      beep(660, 0, 0.12, 'triangle');
      beep(880, 0.08, 0.14, 'triangle');
      break;
    case 'streak':
      // brighter, rising — rewards momentum
      beep(784, 0, 0.1, 'square', 0.05);
      beep(1047, 0.07, 0.12, 'square', 0.05);
      beep(1319, 0.15, 0.16, 'triangle', 0.06);
      break;
    case 'break':
      // loud, descending thud — loss aversion
      beep(196, 0, 0.18, 'sawtooth', 0.09);
      beep(130, 0.1, 0.3, 'sawtooth', 0.09);
      break;
    case 'loot':
      beep(523, 0, 0.1, 'triangle', 0.06);
      beep(659, 0.09, 0.1, 'triangle', 0.06);
      beep(784, 0.18, 0.18, 'triangle', 0.06);
      break;
    case 'gold':
      beep(659, 0, 0.1, 'triangle', 0.07);
      beep(880, 0.09, 0.1, 'triangle', 0.07);
      beep(1047, 0.18, 0.1, 'triangle', 0.07);
      beep(1319, 0.27, 0.28, 'triangle', 0.08);
      break;
  }
}
