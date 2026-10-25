import { Eye, Play, RotateCcw, StepForward } from 'lucide-react';
import type { Stage } from '../types';
import type { Strings } from '../lib/i18n';
import { stageStatus, type MemoryStats } from '../lib/srs';
import { sessionCleared, type SavedSession } from '../lib/session';
import { DueBadge, LevelBar, LevelChips } from './Levels';
import { Seal } from './Seal';
import { firstForm } from '../lib/wordOfDay';
import { useReveal } from '../lib/hooks';

interface Props {
  t: Strings;
  stage: Stage;
  /** Position in the grid, for staggering the scroll-in. */
  order: number;
  stats: MemoryStats;
  onPreview: () => void;
  onStart: () => void;
  resume: SavedSession | null;
  onResume: () => void;
}

const SAMPLE = 4;


export function StageCard({ t, stage, order, stats, onPreview, onStart, resume, onResume }: Props) {
  const { ref, revealed } = useReveal<HTMLDivElement>();
  const total = stage.words.length;
  const mastered = stats.learned;
  /** Every word learned at least once: the main button replays instead of starting. */
  const allLearned = mastered === total;
  // One status at a time: words ready to level up, or the seal of a complete stage, never both.
  const status = stageStatus(stats, total);
  const complete = status === 'complete';
  const pct = total ? Math.round((mastered / total) * 100) : 0;
  const titleId = `stage-${stage.key}`;

  // The wrapper owns the scroll-in transform so it never fights the card's own hover lift.
  return (
    <div ref={ref} className={`reveal flex flex-col ${revealed ? 'is-revealed' : ''}`} style={{ '--i': order % 3 } as React.CSSProperties}>
      <article
        aria-labelledby={titleId}
        className={`group relative isolate flex flex-1 flex-col rounded-[24px] border-2 bg-ink-2 p-4 transition-[border-color,translate] duration-200 hover:-translate-y-0.5 sm:p-5 ${
          complete ? 'border-gold shadow-[0_5px_0_var(--color-gold-lip)]' : 'border-rule shadow-[0_5px_0_var(--color-rule)] hover:border-hanji-2/40'
        }`}
      >
        <header className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 id={titleId} className="text-[17px] font-black leading-tight">
              {t.stage(stage.index + 1)}
            </h3>
            <p className="tabular mt-0.5 text-[13px] text-hanji-2">{t.wordsRange(stage.from, stage.to)}</p>
          </div>
          {complete && (
            <span title={t.completed} className="mt-0.5">
              <Seal size={32} />
            </span>
          )}
        </header>

        {status === 'levelUp' && (
          <div className="mt-3">
            <DueBadge t={t} due={stats.due} />
          </div>
        )}

        <ul className="mt-4 flex flex-wrap gap-1.5" aria-label={t.study}>
          {stage.words.slice(0, SAMPLE).map((w, i) => (
            <li key={`${w.ko}-${i}`} lang="ko" className="rounded-lg bg-ink px-2.5 py-1.5 font-serif text-[16px] leading-none text-hanji">
              {firstForm(w.ko)}
            </li>
          ))}
          {total > SAMPLE && <li className="tabular px-1 py-1 text-[13px] font-semibold leading-none text-hanji-2">+{total - SAMPLE}</li>}
        </ul>

        <div className="mt-5">
          <LevelBar stats={stats} total={total} />
          <p className="tabular mt-2 flex justify-between text-[13px]">
            <span className="text-hanji-2">
              {t.mastered} <span className="font-semibold text-hanji">{mastered}</span> / {total}
            </span>
            <span className={complete ? 'font-bold text-accent-text' : 'font-semibold text-hanji'}>{pct}%</span>
          </p>
          <div className="mt-2.5">
            <LevelChips t={t} stats={stats} />
          </div>
        </div>

        {/* With an unfinished run, Resume takes the primary slot and Preview shrinks to an icon to make room. */}
        <div className={`mt-auto grid gap-2 pt-5 ${resume ? 'grid-cols-[2.75rem_1fr_1fr]' : 'grid-cols-2'}`}>
          <button
            type="button"
            onClick={onPreview}
            aria-label={resume ? t.previewWords : undefined}
            title={resume ? t.previewWords : undefined}
            className="juicy lip-rule flex h-11 items-center justify-center gap-2 rounded-2xl border-2 border-rule bg-ink-2 text-[14px] font-extrabold text-hanji-2 hover:text-hanji"
          >
            <Eye size={16} aria-hidden />
            {!resume && t.previewWords}
          </button>
          <button
            type="button"
            onClick={onStart}
            className={`juicy flex h-11 min-w-0 items-center justify-center gap-2 rounded-2xl px-1 text-[14px] ${
              resume ? 'lip-rule border-2 border-rule bg-ink-2 font-extrabold text-hanji-2 hover:text-hanji' : 'lip-accent bg-accent font-black text-white'
            }`}
          >
            {allLearned ? <RotateCcw size={16} aria-hidden className="shrink-0" /> : <Play size={15} fill="currentColor" aria-hidden className="shrink-0" />}
            <span className="truncate">{allLearned ? t.replay : t.startQuiz}</span>
          </button>
          {resume && (
            <button
              type="button"
              onClick={onResume}
              title={`${sessionCleared(resume, total)} / ${total}`}
              className="juicy lip-accent flex h-11 min-w-0 items-center justify-center gap-2 rounded-2xl bg-accent px-1 text-[14px] font-black text-white"
            >
              <StepForward size={16} aria-hidden className="shrink-0" />
              <span className="truncate">{t.resume}</span>
            </button>
          )}
        </div>
      </article>
    </div>
  );
}
