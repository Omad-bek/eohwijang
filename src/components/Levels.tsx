import { ArrowUp } from 'lucide-react';
import type { Strings } from '../lib/i18n';
import type { MemoryStats } from '../lib/srs';

/** Level 1 is amber, level 2 indigo, level 3 the emerald seal. */
const TONE: Record<1 | 2 | 3, { chip: string; bar: string }> = {
  1: { chip: 'border-flame/50 bg-flame-wash text-flame-ink', bar: 'bg-flame' },
  2: { chip: 'border-indigo/40 bg-indigo-wash text-indigo', bar: 'bg-indigo' },
  3: { chip: 'rotate-[-3deg] border-gold-lip bg-gold text-on-bright', bar: 'bg-gold' },
};

/** `compact` shows just the digit, for narrow table cells; the full name stays in the tooltip. */
export function LevelBadge({ t, level, count, compact = false }: { t: Strings; level: 1 | 2 | 3; count?: number; compact?: boolean }) {
  return (
    <span
      title={compact ? t.level(level) : undefined}
      className={`tabular inline-flex h-6 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-2 text-[11px] font-extrabold leading-none ${TONE[level].chip} ${
        count === 0 ? 'opacity-35' : ''
      } ${compact ? 'min-w-6 justify-center' : ''}`}
    >
      {compact ? (
        <>
          <span aria-hidden>{level}</span>
          <span className="sr-only">{t.level(level)}</span>
        </>
      ) : (
        t.level(level)
      )}
      {count !== undefined && <span className="font-semibold">×{count}</span>}
    </span>
  );
}

/** One segment per level, so the stage visibly moves from bronze to the seal. */
export function LevelBar({ stats, total }: { stats: MemoryStats; total: number }) {
  return (
    <div className="flex h-2.5 overflow-hidden rounded-full bg-rule" aria-hidden>
      {([3, 2, 1] as const).map((l) =>
        stats.levels[l] ? <div key={l} className={`h-full transition-[width] duration-500 ${TONE[l].bar}`} style={{ width: `${(stats.levels[l] / total) * 100}%` }} /> : null,
      )}
    </div>
  );
}

export function LevelChips({ t, stats }: { t: Strings; stats: MemoryStats }) {
  return (
    <ul className="flex flex-wrap items-center gap-1.5" aria-label={t.memoryLevels}>
      {([1, 2, 3] as const).map((l) => (
        <li key={l}>
          <LevelBadge t={t} level={l} count={stats.levels[l]} />
        </li>
      ))}
    </ul>
  );
}

export function DueBadge({ t, due, short = false }: { t: Strings; due: number; short?: boolean }) {
  if (!due) return null;
  return (
    <span
      title={t.dueReview(due)}
      className="tabular inline-flex shrink-0 items-center gap-1 rounded-full border border-sky/40 bg-sky-wash px-2.5 py-1 text-[12px] font-extrabold leading-tight text-sky"
    >
      <ArrowUp size={13} strokeWidth={2.6} aria-hidden className="shrink-0" />
      {short ? t.dueShort(due) : t.dueReview(due)}
    </span>
  );
}
