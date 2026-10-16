import type { ReactNode } from 'react';

/** A progress ring: a track and an arc that eases to its value, with anything in the middle. */
export function Ring({
  value,
  max,
  size,
  stroke,
  track,
  color,
  label,
  children,
}: {
  value: number;
  max: number;
  size: number;
  stroke: number;
  track: string;
  color: string;
  label?: string;
  children?: ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const share = max ? Math.min(1, value / max) : 0;
  return (
    <span
      className="relative grid shrink-0 place-items-center"
      style={{ width: size, height: size }}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - share)}
          opacity={share ? 1 : 0}
          style={{ transition: 'stroke-dashoffset 900ms cubic-bezier(0.16, 1, 0.3, 1)' }}
        />
      </svg>
      <span className="absolute inset-0 grid place-items-center">{children}</span>
    </span>
  );
}

/** Particles flying out from the center; remount it (via `key`) to fire again. */
export function Burst({ colors, count = 12, radius = 70 }: { colors: string[]; count?: number; radius?: number }) {
  return (
    <span aria-hidden className="pointer-events-none absolute inset-0 grid place-items-center">
      {Array.from({ length: count }, (_, i) => {
        const a = (i / count) * Math.PI * 2;
        const d = radius * (0.75 + ((i * 37) % 10) / 20);
        return (
          <span
            key={i}
            className="anim-burst absolute block size-2.5 rounded-full"
            style={{ background: colors[i % colors.length], ['--dx' as string]: `${Math.cos(a) * d}px`, ['--dy' as string]: `${Math.sin(a) * d}px` }}
          />
        );
      })}
    </span>
  );
}
