import { useEffect, useRef } from 'react';
import { Play, X } from 'lucide-react';
import type { Stage, WordMemory } from '../types';
import type { Strings } from '../lib/i18n';
import { wordId } from '../lib/books';
import { isDue, levelOf, memoryStats } from '../lib/srs';
import { DueBadge, LevelBadge, LevelChips } from './Levels';

interface Props {
  t: Strings;
  stage: Stage;
  memory: Record<string, WordMemory>;
  now: number;
  onClose: () => void;
  onStart: () => void;
}

export function StagePreview({ t, stage, memory, now, onClose, onStart }: Props) {
  const startRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    startRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      prev?.focus?.();
    };
  }, [onClose]);

  const stats = memoryStats(stage.words, stage.bookId, memory, now);
  const done = stats.learned;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" style={{ height: 'var(--app-h)' }}>
      <button type="button" aria-label={t.close} onClick={onClose} className="absolute inset-0 bg-black/70" />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="stage-title"
        className="anim-sheet relative flex max-h-[92%] w-full max-w-2xl flex-col border-t border-rule bg-ink sm:max-h-[86%] sm:border"
      >
        <header className="flex items-start gap-3 border-b border-rule px-5 pb-4 pt-5">
          <div className="min-w-0 flex-1">
            <p className="tabular text-[13px] text-hanji-2">
              {stage.bookId} · {stage.from}–{stage.to} · {t.masteredOf(done, stage.words.length)}
            </p>
            <h2 id="stage-title" className="mt-1 flex items-baseline gap-2 text-[22px] font-bold leading-tight">
              <span className="font-serif">{stage.unit}</span>
              <span>{t.stage(stage.index + 1)}</span>
            </h2>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <LevelChips t={t} stats={stats} />
              <DueBadge t={t} due={stats.due} />
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label={t.close} className="-mr-2 -mt-1 p-2 text-hanji-2 hover:text-hanji">
            <X size={22} />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-auto overscroll-contain">
          <table className="w-full table-fixed border-collapse text-left text-[13px] sm:text-[14px]">
            <caption className="sr-only">{t.study}</caption>
            <thead className="sticky top-0 z-10 bg-ink-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-hanji-2 sm:text-[11px] sm:tracking-[0.12em]">
              <tr>
                <th scope="col" className="w-11 py-2.5 pl-4 pr-1 font-semibold">#</th>
                <th scope="col" className="w-[28%] py-2.5 pr-2 font-semibold">{t.colKo}</th>
                <th scope="col" className="py-2.5 pr-2 font-semibold">{t.colUz}</th>
                <th scope="col" className="py-2.5 pr-2 font-semibold">{t.colRu}</th>
                <th scope="col" className="py-2.5 pr-4 font-semibold">{t.colEn}</th>
              </tr>
            </thead>
            <tbody>
              {stage.words.map((w, i) => {
                const m = memory[wordId(stage.bookId, w)];
                const level = levelOf(m);
                const due = isDue(m, now);
                return (
                  <tr key={`${w.ko}-${i}`} className="border-b border-rule-soft align-top">
                    <td className="tabular py-2.5 pl-4 pr-1 text-[12px] text-hanji-2">
                      <span className="block">{stage.from + i}</span>
                      {level > 0 && (
                        <span className="mt-1.5 flex flex-col items-start gap-1">
                          <LevelBadge t={t} level={level as 1 | 2 | 3} compact />
                          {due && (
                            <span title={t.dueReview(1)} className="font-bold text-sky">
                              <span aria-hidden>↑</span>
                              <span className="sr-only">{t.dueReview(1)}</span>
                            </span>
                          )}
                        </span>
                      )}
                    </td>
                    <td lang="ko" className="break-keep py-2.5 pr-2 font-serif text-[17px] font-bold leading-snug sm:text-[18px]">
                      {w.ko}
                    </td>
                    <td lang="uz" className="break-words py-2.5 pr-2 leading-snug">{w.uz}</td>
                    <td lang="ru" className="break-words py-2.5 pr-2 leading-snug">{w.ru}</td>
                    <td lang="en" className="break-words py-2.5 pr-4 leading-snug">{w.en}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <footer className="border-t border-rule px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4">
          <button
            ref={startRef}
            type="button"
            onClick={onStart}
            className="flex h-13 w-full items-center justify-center gap-2 bg-accent text-[15px] font-bold tracking-[0.04em] text-ink transition-colors hover:bg-accent-text"
          >
            <Play size={18} fill="currentColor" aria-hidden />
            {done === stage.words.length ? t.replay : t.start}
          </button>
        </footer>
      </section>
    </div>
  );
}
