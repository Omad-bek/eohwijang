import { Eye, Play, RotateCcw, StepForward } from 'lucide-react';
import type { Stage } from '../types';
import type { Strings } from '../lib/i18n';
import type { MemoryStats } from '../lib/srs';
import { sessionCleared, type SavedSession } from '../lib/session';
import { DueBadge, LevelBar, LevelChips } from './Levels';
import { Seal } from './Seal';

interface Props {
  t: Strings;
  stage: Stage;
  stats: MemoryStats;
  onPreview: () => void;
  onStart: () => void;
  resume: SavedSession | null;
  onResume: () => void;
}

const SAMPLE = 4;

/** First form of a slash alternative, so chips stay short ("아래/ 밑" → "아래"). */
const firstForm = (ko: string) => ko.split('/')[0].trim();

export function StageCard({ t, stage, stats, onPreview, onStart, resume, onResume }: Props) {
  const total = stage.words.length;
  const mastered = stats.learned;
  const complete = mastered === total;
  const pct = total ? Math.round((mastered / total) * 100) : 0;
  const titleId = `stage-${stage.key}`;

  return (
    <article
      aria-labelledby={titleId}
      className={`group flex flex-col border bg-ink-2 p-4 transition-colors duration-200 sm:p-5 ${
        complete ? 'border-accent/45 hover:border-accent' : 'border-rule hover:border-hanji-2/70'
      }`}
    >
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 id={titleId} className="text-[16px] font-bold leading-tight">
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

      {stats.due > 0 && (
        <div className="mt-3">
          <DueBadge t={t} due={stats.due} />
        </div>
      )}

      <ul className="mt-4 flex flex-wrap gap-1.5" aria-label={t.study}>
        {stage.words.slice(0, SAMPLE).map((w, i) => (
          <li key={`${w.ko}-${i}`} lang="ko" className="border border-rule-soft bg-ink px-2 py-1 font-serif text-[15px] font-bold leading-none text-hanji/90">
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
          className="flex h-11 items-center justify-center gap-2 border border-rule text-[14px] font-semibold text-hanji transition-colors hover:border-hanji-2 hover:bg-ink-3"
        >
          <Eye size={16} aria-hidden />
          {!resume && t.previewWords}
        </button>
        <button
          type="button"
          onClick={onStart}
          className={`flex h-11 min-w-0 items-center justify-center gap-2 px-1 text-[14px] transition-colors ${
            resume ? 'border border-rule font-semibold text-hanji hover:border-hanji-2 hover:bg-ink-3' : 'bg-accent font-bold text-ink hover:bg-accent-text'
          }`}
        >
          {complete ? <RotateCcw size={16} aria-hidden className="shrink-0" /> : <Play size={15} fill="currentColor" aria-hidden className="shrink-0" />}
          <span className="truncate">{complete ? t.replay : t.startQuiz}</span>
        </button>
        {resume && (
          <button
            type="button"
            onClick={onResume}
            title={`${sessionCleared(resume, total)} / ${total}`}
            className="flex h-11 min-w-0 items-center justify-center gap-2 bg-accent px-1 text-[14px] font-bold text-ink transition-colors hover:bg-accent-text"
          >
            <StepForward size={16} aria-hidden className="shrink-0" />
            <span className="truncate">{t.resume}</span>
          </button>
        )}
      </div>
    </article>
  );
}
