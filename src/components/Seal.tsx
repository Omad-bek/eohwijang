/**
 * The 도장 stamped on mastered words and stages: a flat cinnabar impression
 * with the glyph knocked out to the ink ground.
 */
export function Seal({ size = 40, label = '익힘', animate = false }: { size?: number; label?: string; animate?: boolean }) {
  return (
    <span
      aria-hidden
      className={`inline-flex shrink-0 rotate-[-6deg] items-center justify-center bg-cinnabar-deep font-serif font-bold leading-none text-ink ring-1 ring-cinnabar-deep ring-offset-2 ring-offset-ink ${
        animate ? 'anim-seal' : ''
      }`}
      style={{ width: size, height: size, fontSize: Math.round(size * (label.length > 1 ? 0.3 : 0.55)) }}
    >
      {label}
    </span>
  );
}
