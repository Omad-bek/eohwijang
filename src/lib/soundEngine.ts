import { useCallback, useState } from 'react';

/**
 * Quiet, synthesized feedback sounds: no audio files, only Web Audio oscillators shaped by soft
 * envelopes and low-pass filters. The palette is "soft tactile": a frosted tap, a warm mallet
 * note, a muted thud, and an ambient swell, all well under conversation level.
 */

/** Per-device choice; sound is on until the learner mutes it. */
export const SOUND_KEY = 'project-vocab:sound';

/** Notes of the pentatonic scale C D F G A, in Hz, across two octaves (C4 to A5). */
const PENTA = [261.63, 293.66, 349.23, 392.0, 440.0, 523.25, 587.33, 698.46, 783.99, 880.0];

function readSoundOn(): boolean {
  try {
    return localStorage.getItem(SOUND_KEY) !== '0';
  } catch {
    return true;
  }
}

let enabled = readSoundOn();
let ctx: AudioContext | null = null;
let bus: AudioNode | null = null;
let noise: AudioBuffer | null = null;

/**
 * The shared context and its output bus, created on the first sound (always inside a tap or key
 * press, so browsers allow it). Everything passes a gentle master low-pass, then a soft compressor
 * so overlapping sounds never stack into a harsh peak.
 */
function out(): { ac: AudioContext; dest: AudioNode } | null {
  if (!enabled) return null;
  const AC = typeof window !== 'undefined' ? window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext : undefined;
  if (!AC) return null;
  try {
    if (!ctx) {
      ctx = new AC();
      const master = ctx.createGain();
      master.gain.value = 0.55;
      const tone = ctx.createBiquadFilter();
      tone.type = 'lowpass';
      tone.frequency.value = 5200;
      tone.Q.value = 0.5;
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -18;
      comp.knee.value = 12;
      comp.ratio.value = 4;
      comp.attack.value = 0.003;
      comp.release.value = 0.25;
      master.connect(tone).connect(comp).connect(ctx.destination);
      bus = master;
    }
    if (ctx.state !== 'running') ctx.resume().catch(() => {});
    return { ac: ctx, dest: bus! };
  } catch {
    return null;
  }
}

interface Voice {
  freq: number;
  type?: OscillatorType;
  /** Start offset from now, seconds. */
  at?: number;
  attack: number;
  /** Time for the level to fall away after the attack, seconds. */
  release: number;
  peak: number;
  /** Low-pass cutoff in Hz; keeps every tone round. */
  cutoff: number;
  /** Optional pitch glide target, reached over `glide` seconds. */
  glideTo?: number;
  glide?: number;
  detune?: number;
}

/** One oscillator through its own low-pass and an attack / exponential-release envelope. */
function voice(ac: BaseAudioContext, dest: AudioNode, v: Voice) {
  const t = ac.currentTime + (v.at ?? 0);
  const osc = ac.createOscillator();
  osc.type = v.type ?? 'sine';
  osc.frequency.setValueAtTime(v.freq, t);
  if (v.glideTo) osc.frequency.exponentialRampToValueAtTime(v.glideTo, t + (v.glide ?? 0.05));
  if (v.detune) osc.detune.value = v.detune;

  const lp = ac.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = v.cutoff;
  lp.Q.value = 0.3;

  const env = ac.createGain();
  env.gain.setValueAtTime(0.0001, t);
  env.gain.linearRampToValueAtTime(v.peak, t + v.attack);
  env.gain.exponentialRampToValueAtTime(0.0001, t + v.attack + v.release);

  osc.connect(lp).connect(env).connect(dest);
  osc.start(t);
  osc.stop(t + v.attack + v.release + 0.05);
}

/** A short burst of filtered noise: the "contact" texture of a tap or a book landing. */
function grain(ac: BaseAudioContext, dest: AudioNode, opts: { type: BiquadFilterType; freq: number; q: number; peak: number; length: number; at?: number }) {
  if (!noise || noise.sampleRate !== ac.sampleRate) {
    noise = ac.createBuffer(1, Math.ceil(ac.sampleRate * 0.25), ac.sampleRate);
    const d = noise.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const t = ac.currentTime + (opts.at ?? 0);
  const src = ac.createBufferSource();
  src.buffer = noise;
  const f = ac.createBiquadFilter();
  f.type = opts.type;
  f.frequency.value = opts.freq;
  f.Q.value = opts.q;
  const env = ac.createGain();
  env.gain.setValueAtTime(0.0001, t);
  env.gain.linearRampToValueAtTime(opts.peak, t + 0.002);
  env.gain.exponentialRampToValueAtTime(0.0001, t + opts.length);
  src.connect(f).connect(env).connect(dest);
  src.start(t);
  src.stop(t + opts.length + 0.02);
}

/** Frosted-glass tap for UI presses: a tiny falling sine with a breath of high, soft noise. */
export function playPop() {
  const o = out();
  if (!o) return;
  voice(o.ac, o.dest, { freq: 1240, glideTo: 720, glide: 0.035, type: 'sine', attack: 0.002, release: 0.07, peak: 0.2, cutoff: 2600 });
  grain(o.ac, o.dest, { type: 'bandpass', freq: 3800, q: 1.2, peak: 0.035, length: 0.018 });
}

/**
 * A warm mallet note, like a soft marimba bar: a round fundamental, a quiet octave that fades
 * sooner, and a brief strike partial. `streak` walks the note up the pentatonic scale, so a run of
 * right answers quietly climbs.
 */
export function playCorrect(streak = 0) {
  const o = out();
  if (!o) return;
  const f = PENTA[3 + (Math.max(0, streak - 1) % 5)]; // G4 A4 C5 D5 F5
  voice(o.ac, o.dest, { freq: f, type: 'sine', attack: 0.004, release: 0.95, peak: 0.26, cutoff: 2400 });
  voice(o.ac, o.dest, { freq: f * 2, type: 'sine', attack: 0.003, release: 0.4, peak: 0.07, cutoff: 3000, detune: 3 });
  voice(o.ac, o.dest, { freq: f * 3.98, type: 'sine', attack: 0.001, release: 0.09, peak: 0.035, cutoff: 4000 });
  // A softer answering fifth just behind, so it reads as a chime rather than a single blip.
  voice(o.ac, o.dest, { freq: f * 1.5, type: 'triangle', at: 0.075, attack: 0.006, release: 0.7, peak: 0.07, cutoff: 1800 });
}

/** A muted thud, like a book set down on a desk: a low, falling sine and a dull slap of paper. */
export function playWrong() {
  const o = out();
  if (!o) return;
  voice(o.ac, o.dest, { freq: 120, glideTo: 58, glide: 0.14, type: 'sine', attack: 0.004, release: 0.28, peak: 0.5, cutoff: 320 });
  voice(o.ac, o.dest, { freq: 196, glideTo: 110, glide: 0.08, type: 'triangle', attack: 0.003, release: 0.12, peak: 0.08, cutoff: 500 });
  grain(o.ac, o.dest, { type: 'lowpass', freq: 700, q: 0.4, peak: 0.12, length: 0.07 });
}

/**
 * An ambient swell for combo milestones: pentatonic notes bloom one after another with slow
 * attacks and long tails, each doubled by a slightly detuned twin for a gentle chorus.
 */
export function playCombo() {
  const o = out();
  if (!o) return;
  const notes = [PENTA[0], PENTA[3], PENTA[4], PENTA[6], PENTA[7]]; // C4 G4 A4 D5 F5
  notes.forEach((f, i) => {
    const at = i * 0.07;
    const peak = 0.055 - i * 0.006;
    voice(o.ac, o.dest, { freq: f, type: 'sine', at, attack: 0.22, release: 1.6, peak, cutoff: 1800 });
    voice(o.ac, o.dest, { freq: f, type: 'triangle', at, attack: 0.28, release: 1.4, peak: peak * 0.45, cutoff: 1200, detune: 7 });
  });
  // A soft bell on top, struck as the swell crests.
  voice(o.ac, o.dest, { freq: PENTA[9], type: 'sine', at: 0.3, attack: 0.008, release: 1.2, peak: 0.04, cutoff: 3200 });
}

/** The speaker toggle in the navbar. Muting takes effect immediately for every sound. */
export function useSound() {
  const [on, setOn] = useState(enabled);
  const toggle = useCallback(() => {
    const next = !enabled;
    enabled = next;
    setOn(next);
    try {
      localStorage.setItem(SOUND_KEY, next ? '1' : '0');
    } catch {
      /* the switch still works for this visit */
    }
    if (next) playPop();
  }, []);
  return { on, toggle };
}
