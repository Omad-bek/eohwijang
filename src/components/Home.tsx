import { useEffect, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import type { Book, Stage, UserData, WordMemory } from '../types';
import type { Strings } from '../lib/i18n';
import { stagesForUnit } from '../lib/books';
import type { SavedSession } from '../lib/session';
import { addStats, EMPTY_STATS, memoryStats, type MemoryStats } from '../lib/srs';
import { DueBadge } from './Levels';
import { Seal } from './Seal';
import { StageCard } from './StageCard';

interface Props {
  t: Strings;
  books: Book[];
  data: UserData;
  memory: Record<string, WordMemory>;
  now: number;
  bookId: string;
  onBook: (id: string) => void;
  onPreview: (s: Stage) => void;
  onStart: (s: Stage) => void;
  /** The unfinished run of a stage, if one can still be resumed. */
  resumable: (s: Stage) => SavedSession | null;
  onResume: (s: Stage) => void;
  onAddBook: () => void;
}

interface UnitSummary {
  unit: string;
  stages: Stage[];
  stats: MemoryStats[];
  due: number;
  total: number;
  done: number;
  pct: number;
}

const UNIT_KEY = (bookId: string) => `project-vocab:unit:${bookId}`;

function readUnit(bookId: string): string | null {
  try {
    return localStorage.getItem(UNIT_KEY(bookId));
  } catch {
    return null;
  }
}

function BookTabs({ t, books, bookId, onBook, onAddBook }: Pick<Props, 't' | 'books' | 'bookId' | 'onBook' | 'onAddBook'>) {
  return (
    <nav aria-label={t.books} className="flex items-stretch overflow-x-auto overflow-y-hidden border-b border-rule">
      {books.map((b) => {
        const on = b.id === bookId;
        return (
          <button
            key={b.id}
            type="button"
            onClick={() => onBook(b.id)}
            aria-current={on ? 'page' : undefined}
            className={`relative shrink-0 px-4 pb-2.5 pt-1 font-serif text-[22px] font-bold leading-none transition-colors ${
              on ? 'text-hanji' : 'text-hanji-2 hover:text-hanji'
            }`}
          >
            {b.title}
            {on && <span className="absolute inset-x-2 bottom-0 h-[3px] bg-accent" />}
          </button>
        );
      })}
      <button
        type="button"
        onClick={onAddBook}
        className="ml-auto flex shrink-0 items-center gap-1.5 px-2 pb-2 text-[13px] font-semibold text-hanji-2 hover:text-hanji"
      >
        <Plus size={16} strokeWidth={2} aria-hidden />
        {t.addBook}
      </button>
    </nav>
  );
}

export function Home({ t, books, data, memory, now, bookId, onBook, onPreview, onStart, resumable, onResume, onAddBook }: Props) {
  const book = books.find((b) => b.id === bookId) ?? books[0];
  const size = data.settings.stageSize;

  const units: UnitSummary[] = useMemo(
    () =>
      book.units
        .map((unit) => {
          const stages = stagesForUnit(book, unit, size);
          const stats = stages.map((s) => memoryStats(s.words, book.id, memory, now));
          const sum = stats.reduce(addStats, EMPTY_STATS);
          const total = stages.reduce((n, s) => n + s.words.length, 0);
          return { unit, stages, stats, due: sum.due, total, done: sum.learned, pct: total ? Math.round((sum.learned / total) * 100) : 0 };
        })
        .filter((u) => u.total > 0),
    [book, size, memory, now],
  );

  const [picked, setPicked] = useState<string | null>(() => readUnit(book.id));
  useEffect(() => setPicked(readUnit(book.id)), [book.id]);

  const fallback = units.find((u) => u.done < u.total) ?? units[0];
  const selected = units.find((u) => u.unit === picked) ?? fallback;

  const pickUnit = (unit: string) => {
    setPicked(unit);
    try {
      localStorage.setItem(UNIT_KEY(book.id), unit);
    } catch {
      /* per-device convenience only */
    }
  };

  const bookTotal = units.reduce((n, u) => n + u.total, 0);
  const bookDone = units.reduce((n, u) => n + u.done, 0);
  const bookPct = bookTotal ? Math.round((bookDone / bookTotal) * 100) : 0;
  const isSample = book.builtIn && book.id === '1A' && bookTotal < 100;

  const progress = (
    <div>
      <div className="flex items-baseline justify-between">
        <p className="text-[13px] font-semibold text-hanji-2">{t.bookProgress}</p>
        <p className="tabular text-[22px] font-bold leading-none">{bookPct}%</p>
      </div>
      <div className="mt-2.5 h-[3px] bg-rule-soft">
        <div className="h-full bg-accent transition-[width] duration-700" style={{ width: `${bookPct}%` }} />
      </div>
      <p className="tabular mt-2 text-[12px] text-hanji-2">{t.masteredOf(bookDone, bookTotal)}</p>
    </div>
  );

  const notice = isSample ? <p className="border border-rule bg-ink-2 px-3 py-2.5 text-[13px] leading-snug text-hanji-2">{t.sampleData}</p> : null;

  return (
    <div className="flex h-full min-h-0">
      {/* Desktop sidebar */}
      <aside className="hidden w-72 shrink-0 flex-col gap-6 *:shrink-0 overflow-y-auto overscroll-contain border-r border-rule px-4 py-5 md:flex lg:w-80 lg:px-5">
        <BookTabs t={t} books={books} bookId={book.id} onBook={onBook} onAddBook={onAddBook} />
        <div className="border border-rule bg-ink-2 p-4">{progress}</div>
        {notice}
        <nav aria-label={t.units}>
          <h2 className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-hanji-2">{t.units}</h2>
          <ul className="space-y-1">
            {units.map((u) => {
              const on = u.unit === selected?.unit;
              const complete = u.pct === 100;
              return (
                <li key={u.unit}>
                  <button
                    type="button"
                    onClick={() => pickUnit(u.unit)}
                    aria-current={on ? 'true' : undefined}
                    className={`flex w-full items-center gap-3 border px-3 py-2.5 text-left transition-colors ${
                      on ? 'border-hanji-2/60 bg-ink-2' : 'border-transparent hover:bg-ink-2'
                    }`}
                  >
                    <span className={`w-14 shrink-0 font-serif text-[20px] font-bold leading-none ${on ? 'text-hanji' : 'text-hanji/80'}`}>{u.unit}</span>
                    <span className="flex min-w-0 flex-1 flex-col gap-1.5">
                      <span className="tabular flex items-center justify-between gap-2 text-[12px]">
                        <span className="text-hanji-2">{t.wordCount(u.total)}</span>
                        {u.due > 0 && <span className="ml-auto"><DueBadge t={t} due={u.due} short /></span>}
                        <span className={complete ? 'font-bold text-accent-text' : 'font-semibold text-hanji'}>{u.pct}%</span>
                      </span>
                      <span className="block h-[3px] bg-rule-soft">
                        <span className={`block h-full ${complete ? 'bg-accent' : 'bg-accent/60'}`} style={{ width: `${u.pct}%` }} />
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      <main className="min-w-0 flex-1 overflow-y-auto overscroll-contain">
        {/* Mobile: books, progress, unit pills */}
        <div className="space-y-4 px-4 pt-4 md:hidden">
          <BookTabs t={t} books={books} bookId={book.id} onBook={onBook} onAddBook={onAddBook} />
          {progress}
          {notice}
        </div>
        {units.length > 0 && (
          <nav aria-label={t.units} className="sticky top-0 z-10 mt-4 border-b border-rule bg-ink/85 backdrop-blur-sm md:hidden">
            <ul className="flex gap-2 overflow-x-auto px-4 py-3">
              {units.map((u) => {
                const on = u.unit === selected?.unit;
                return (
                  <li key={u.unit} className="shrink-0">
                    <button
                      type="button"
                      onClick={() => pickUnit(u.unit)}
                      aria-current={on ? 'true' : undefined}
                      className={`flex h-10 items-center gap-2 border px-3 transition-colors ${
                        on ? 'border-hanji bg-hanji text-ink' : 'border-rule text-hanji hover:border-hanji-2'
                      }`}
                    >
                      <span className="font-serif text-[17px] font-bold leading-none">{u.unit}</span>
                      <span className={`tabular text-[12px] font-semibold ${on ? 'text-ink/70' : u.pct === 100 ? 'text-accent-text' : 'text-hanji-2'}`}>
                        {u.pct}%
                      </span>
                      {u.due > 0 && (
                        <span title={t.dueReview(u.due)} className="tabular flex h-5 min-w-5 items-center justify-center bg-sky px-1 text-[11px] font-bold text-ink">
                          <span aria-hidden>↑{u.due}</span>
                          <span className="sr-only">{t.dueReview(u.due)}</span>
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        )}

        {units.length === 0 && (
          <div className="px-4 py-20 text-center">
            <p className="font-serif text-[22px] font-bold">{t.emptyBook}</p>
            <p className="mt-2 text-[14px] text-hanji-2">{t.emptyBookHint}</p>
          </div>
        )}

        {selected && (
          <section aria-labelledby="unit-title" className="@container px-4 pb-12 pt-5 md:px-8 md:pt-8">
            <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3 border-b border-rule pb-5">
              <div className="flex items-center gap-4">
                <h2 id="unit-title" className="font-serif text-[40px] font-bold leading-none md:text-[52px]">
                  {selected.unit}
                </h2>
                {selected.pct === 100 && <Seal size={40} />}
                <DueBadge t={t} due={selected.due} />
              </div>
              <div className="min-w-[12rem] flex-1 md:max-w-xs">
                <p className="tabular flex justify-between text-[13px] text-hanji-2">
                  <span>
                    {t.wordCount(selected.total)} · {t.stagesCount(selected.stages.length)}
                  </span>
                  <span className="font-bold text-hanji">{selected.pct}%</span>
                </p>
                <div className="mt-2 h-[3px] bg-rule-soft">
                  <div className="h-full bg-accent transition-[width] duration-700" style={{ width: `${selected.pct}%` }} />
                </div>
              </div>
            </header>

            <div className="mt-5 grid grid-cols-1 gap-4 @xl:grid-cols-2 @4xl:grid-cols-3 md:mt-6">
              {selected.stages.map((s, i) => (
                <StageCard
                  key={s.key}
                  t={t}
                  stage={s}
                  stats={selected.stats[i]}
                  onPreview={() => onPreview(s)}
                  onStart={() => onStart(s)}
                  resume={resumable(s)}
                  onResume={() => onResume(s)}
                />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
