/**
 * Decorative depth for the Welcome variants: drifting jamo at three depths, glossy 3D-like orbs,
 * twinkling sparkles and a celebratory burst. All of it is aria-hidden and pointer-transparent;
 * parallax comes from the --mx / --my / --sy variables that useParallax writes on an ancestor.
 */
import type { CSSProperties } from 'react';
import { Sparkle } from 'lucide-react';
import './welcome.css';

type Depth = 'far' | 'mid' | 'near';

interface Particle {
  ch: string;
  /** Position in % of the field. */
  x: number;
  y: number;
  depth: Depth;
  /** Seconds per float cycle, and a phase offset. */
  dur: number;
  delay: number;
  /** Resting tilt in degrees. */
  r: number;
  /** Also shown on phones; the rest appear from sm up so the hero text stays clear. */
  phone?: boolean;
}

/** A hand-placed field: near tiles hug the edges, far letters may sit behind the headline. */
const FIELD: Particle[] = [
  { ch: 'ㅎ', x: 6, y: 16, depth: 'near', dur: 11, delay: 0, r: -8, phone: true },
  { ch: 'ㅗ', x: 89, y: 12, depth: 'near', dur: 13, delay: -3, r: 7, phone: true },
  { ch: 'ㄱ', x: 92, y: 58, depth: 'near', dur: 12, delay: -6, r: -5 },
  { ch: 'ㅏ', x: 4, y: 64, depth: 'near', dur: 14, delay: -2, r: 6 },
  { ch: 'ㅈ', x: 15, y: 88, depth: 'mid', dur: 16, delay: -5, r: 10, phone: true },
  { ch: 'ㅜ', x: 82, y: 86, depth: 'mid', dur: 15, delay: -8, r: -9, phone: true },
  { ch: 'ㄴ', x: 22, y: 30, depth: 'mid', dur: 17, delay: -1, r: 12 },
  { ch: 'ㅣ', x: 76, y: 34, depth: 'mid', dur: 18, delay: -9, r: -4 },
  { ch: 'ㅁ', x: 70, y: 70, depth: 'mid', dur: 16, delay: -4, r: 8 },
  { ch: 'ㅓ', x: 30, y: 74, depth: 'mid', dur: 19, delay: -7, r: -10 },
  { ch: 'ㅅ', x: 40, y: 8, depth: 'far', dur: 22, delay: -2, r: 0, phone: true },
  { ch: 'ㅂ', x: 60, y: 18, depth: 'far', dur: 24, delay: -11, r: 0 },
  { ch: 'ㄹ', x: 50, y: 92, depth: 'far', dur: 21, delay: -6, r: 0, phone: true },
  { ch: 'ㅡ', x: 12, y: 44, depth: 'far', dur: 25, delay: -13, r: 0 },
  { ch: 'ㅐ', x: 86, y: 40, depth: 'far', dur: 23, delay: -4, r: 0 },
  { ch: 'ㄷ', x: 34, y: 52, depth: 'far', dur: 26, delay: -9, r: 0 },
  { ch: 'ㅇ', x: 64, y: 50, depth: 'far', dur: 20, delay: -15, r: 0 },
  { ch: 'ㅕ', x: 96, y: 92, depth: 'far', dur: 22, delay: -1, r: 0 },
];

const DEPTH: Record<Depth, { d: number; lift: string; cls: string }> = {
  far: { d: 0.25, lift: '-10px', cls: 'text-[26px] blur-[1.5px] sm:text-[34px]' },
  mid: { d: 0.6, lift: '-16px', cls: 'text-[34px] sm:text-[46px]' },
  near: {
    d: 1,
    lift: '-22px',
    cls: 'grid size-12 place-items-center rounded-2xl bg-ink-2 text-[26px] text-accent-text shadow-[0_5px_0_var(--color-rule),0_18px_40px_-12px_rgba(20,60,40,0.35)] ring-2 ring-rule sm:size-16 sm:rounded-[20px] sm:text-[34px]',
  },
};

/** Letter color per depth, on the page ground and on a dark or green panel. */
const TINT: Record<Depth, [string, string]> = {
  far: ['text-accent-text/20', 'text-white/20'],
  mid: ['text-accent-text/45', 'text-white/30'],
  near: ['', ''],
};

export function JamoField({ className = '', onDark = false, tiles = true }: { className?: string; onDark?: boolean; tiles?: boolean }) {
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 select-none ${className}`}>
      {FIELD.filter((p) => tiles || p.depth !== 'near').map((p, i) => {
        const depth = DEPTH[p.depth];
        const cls = `${depth.cls} ${TINT[p.depth][onDark ? 1 : 0]}`;
        return (
          <div
            key={i}
            className={`wl-layer absolute ${p.phone ? '' : 'hidden sm:block'}`}
            style={{ left: `${p.x}%`, top: `${p.y}%`, '--d': depth.d } as CSSProperties}
          >
            <span
              className={`wl-anim block -translate-x-1/2 -translate-y-1/2 font-serif leading-none ${cls}`}
              style={{ '--r': `${p.r}deg`, '--lift': depth.lift, animation: `wl-float ${p.dur}s ease-in-out ${p.delay}s infinite` } as CSSProperties}
            >
              {p.ch}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ---------- Orbs ---------- */

const ORB: Record<'accent' | 'gold' | 'sky' | 'flame', string> = {
  accent: 'var(--color-accent)',
  gold: 'var(--color-gold)',
  sky: 'var(--color-sky)',
  flame: 'var(--color-flame)',
};

/**
 * A soft, slowly breathing glow of light. Round by its own style, not by the animation, so it
 * stays a circle under reduced motion too; faint and heavily blurred so it reads as ambient light.
 */
export function Orb({ tone, className = '', depth = 0.4, dur = 20 }: { tone: keyof typeof ORB; className?: string; depth?: number; dur?: number }) {
  return (
    <div aria-hidden className={`wl-layer pointer-events-none absolute ${className}`} style={{ '--d': depth } as CSSProperties}>
      <div
        className="wl-anim size-full rounded-full opacity-[0.18] blur-3xl"
        style={{
          background: `radial-gradient(circle, ${ORB[tone]} 0%, color-mix(in srgb, ${ORB[tone]} 45%, transparent) 45%, transparent 72%)`,
          animation: `wl-blob ${dur}s ease-in-out infinite`,
        }}
      />
    </div>
  );
}

/* ---------- Sparkles ---------- */

const SPARKS = [
  { x: 18, y: 12, s: 18, dur: 3.2, delay: 0 },
  { x: 80, y: 24, s: 14, dur: 4.1, delay: -1.4 },
  { x: 72, y: 80, s: 20, dur: 3.6, delay: -2.2 },
  { x: 26, y: 62, s: 12, dur: 4.6, delay: -0.6 },
  { x: 54, y: 4, s: 10, dur: 3.9, delay: -3 },
  { x: 94, y: 74, s: 12, dur: 5, delay: -1 },
];

export function Sparkles({ className = '' }: { className?: string }) {
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 ${className}`}>
      {SPARKS.map((s, i) => (
        <Sparkle
          key={i}
          size={s.s}
          className="wl-anim absolute fill-gold text-gold"
          style={{ left: `${s.x}%`, top: `${s.y}%`, animation: `wl-twinkle ${s.dur}s ease-in-out ${s.delay}s infinite` }}
        />
      ))}
    </div>
  );
}

/* ---------- Burst ---------- */

const BURST = ['ㅎ', 'ㅗ', 'ㅈ', 'ㅜ', '✦', '✦', 'ㅎ', 'ㅗ', 'ㅈ', 'ㅜ', '✦', '✦'];

/** Letters and sparks thrown outward from the center of the nearest positioned ancestor. */
export function Burst({ className = 'text-gold' }: { className?: string }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-20">
      {BURST.map((ch, i) => {
        const a = (i / BURST.length) * Math.PI * 2;
        const dist = 110 + (i % 3) * 40;
        return (
          <span
            key={i}
            className={`wl-burst absolute left-1/2 top-1/2 font-serif text-[22px] leading-none ${className}`}
            style={
              {
                '--bx': `${Math.cos(a) * dist}px`,
                '--by': `${Math.sin(a) * dist * 0.75}px`,
                '--br': `${(i % 2 ? 1 : -1) * 120}deg`,
                animationDelay: `${(i % 4) * 30}ms`,
              } as CSSProperties
            }
          >
            {ch}
          </span>
        );
      })}
    </div>
  );
}
