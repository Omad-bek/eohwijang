import type { CSSProperties } from 'react';

/**
 * The app-wide ambient layer: a few faint jamo, slow sparkles and two soft color washes that
 * drift behind every screen. Fixed to the viewport, behind all content (it is rendered first in
 * the shell, so every later sibling paints over it), invisible to pointers and screen readers,
 * and still under reduced motion. Only transform and opacity animate, so it stays on the GPU
 * and never competes with typing.
 */

interface Glyph {
  ch: string;
  /** Position in % of the viewport. */
  x: number;
  y: number;
  /** Font size in px. */
  size: number;
  /** Seconds per float cycle, and a phase offset so they never move in step. */
  dur: number;
  delay: number;
  /** Resting tilt in degrees. */
  r: number;
}

// Hand-placed and biased to the edges, where the content column leaves room.
const GLYPHS: Glyph[] = [
  { ch: 'ㅎ', x: 4, y: 14, size: 52, dur: 34, delay: 0, r: -8 },
  { ch: 'ㅏ', x: 93, y: 9, size: 44, dur: 40, delay: -12, r: 6 },
  { ch: 'ㄴ', x: 13, y: 40, size: 36, dur: 38, delay: -5, r: 10 },
  { ch: 'ㄱ', x: 87, y: 32, size: 58, dur: 44, delay: -20, r: -6 },
  { ch: 'ㅡ', x: 6, y: 72, size: 40, dur: 36, delay: -9, r: 4 },
  { ch: 'ㄹ', x: 95, y: 64, size: 46, dur: 42, delay: -27, r: -10 },
  { ch: 'ㅇ', x: 21, y: 91, size: 54, dur: 46, delay: -14, r: 0 },
  { ch: 'ㅓ', x: 79, y: 89, size: 38, dur: 33, delay: -3, r: 8 },
  { ch: 'ㅂ', x: 47, y: 4, size: 32, dur: 39, delay: -22, r: -4 },
  { ch: 'ㅗ', x: 55, y: 97, size: 42, dur: 41, delay: -8, r: 6 },
  { ch: 'ㅅ', x: 33, y: 20, size: 30, dur: 37, delay: -30, r: 12 },
  { ch: 'ㅣ', x: 68, y: 16, size: 36, dur: 35, delay: -17, r: -2 },
  { ch: 'ㅁ', x: 30, y: 63, size: 34, dur: 43, delay: -25, r: -8 },
  { ch: 'ㅜ', x: 71, y: 76, size: 40, dur: 38, delay: -11, r: 10 },
];

const SPARKS = [
  { x: 11, y: 25, size: 14, dur: 9, delay: 0 },
  { x: 89, y: 47, size: 12, dur: 11, delay: -4 },
  { x: 39, y: 84, size: 16, dur: 10, delay: -7 },
  { x: 62, y: 8, size: 10, dur: 12, delay: -2 },
  { x: 18, y: 54, size: 11, dur: 8, delay: -5 },
];

/** A four-point sparkle, drawn inline so the layer has no icon dependency. */
function Spark({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className="fill-gold">
      <path d="M12 0c.9 6.5 5.5 11.1 12 12-6.5.9-11.1 5.5-12 12-.9-6.5-5.5-11.1-12-12C6.5 11.1 11.1 6.5 12 0Z" />
    </svg>
  );
}

export function AmbientParticles() {
  return (
    <div aria-hidden className="ambient pointer-events-none fixed inset-0 z-0 select-none overflow-hidden">
      <div
        className="ambient-anim absolute -left-[18vmax] -top-[18vmax] size-[60vmax] rounded-full"
        style={{
          background: 'radial-gradient(circle, color-mix(in srgb, var(--color-accent) 12%, transparent) 0%, transparent 68%)',
          animation: 'ambient-wash 52s ease-in-out infinite',
        }}
      />
      <div
        className="ambient-anim absolute -bottom-[20vmax] -right-[16vmax] size-[56vmax] rounded-full"
        style={{
          background: 'radial-gradient(circle, color-mix(in srgb, var(--color-gold) 13%, transparent) 0%, transparent 68%)',
          animation: 'ambient-wash 60s ease-in-out -24s infinite reverse',
        }}
      />

      {GLYPHS.map((g, i) => (
        <span
          key={i}
          className="ambient-anim ambient-glyph absolute font-serif leading-none text-accent-text"
          style={
            {
              left: `${g.x}%`,
              top: `${g.y}%`,
              fontSize: g.size,
              opacity: 0.09,
              '--r': `${g.r}deg`,
              animation: `ambient-float ${g.dur}s ease-in-out ${g.delay}s infinite`,
            } as CSSProperties
          }
        >
          {g.ch}
        </span>
      ))}

      {SPARKS.map((s, i) => (
        <span
          key={i}
          className="ambient-anim absolute"
          style={{ left: `${s.x}%`, top: `${s.y}%`, animation: `ambient-twinkle ${s.dur}s ease-in-out ${s.delay}s infinite` }}
        >
          <Spark size={s.size} />
        </span>
      ))}
    </div>
  );
}
