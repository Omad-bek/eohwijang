/**
 * The 도장 stamped on mastered words and stages: a flat emerald impression
 * with the glyph knocked out in white.
 */
export function Seal({ size = 40, label = '익힘', animate = false }: { size?: number; label?: string; animate?: boolean }) {
  return (
    <span
      aria-hidden
      className={`inline-flex shrink-0 rotate-[-6deg] items-center justify-center rounded-[22%] bg-accent font-serif leading-none text-white ring-2 ring-accent ring-offset-2 ring-offset-ink-2 ${
        animate ? 'anim-seal' : ''
      }`}
      style={{ width: size, height: size, fontSize: Math.round(size * (label.length > 1 ? 0.3 : 0.55)) }}
    >
      {label}
    </span>
  );
}
