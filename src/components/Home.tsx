import { useEffect, useMemo, useState } from 'react';
import { ChevronRight, Flame, Plus, RotateCcw, Star, StepForward } from 'lucide-react';
import type { Book, GlossLang, Stage, UserData, WordMemory } from '../types';
import type { Strings } from '../lib/i18n';
import { stagesForUnit } from '../lib/books';
import { sessionCleared, type SavedSession } from '../lib/session';
import { addStats, EMPTY_STATS, memoryStats, reviewStage, type MemoryStats } from '../lib/srs';
import { DAILY_GOAL, summarize } from '../lib/activity';
import { firstForm } from '../lib/wordOfDay';
import { DueBadge } from './Levels';
import { Ring } from './Ring';
import { Seal } from './Seal';
import { StageCard } from './StageCard';
import { WordOfTheDay } from './WordOfTheDay';

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

/** The unit last opened in a book, if any. */
export function readUnit(bookId: string): string | null {
  try {
    return localStorage.getItem(UNIT_KEY(bookId));
  } catch {
    return null;
  }
}

function BookTabs({ t, books, bookId, onBook, onAddBook }: Pick<Props, 't' | 'books' | 'bookId' | 'onBook' | 'onAddBook'>) {
  return (
    <nav aria-label={t.books} className="flex items-center gap-1.5 overflow-x-auto overflow-y-hidden pb-1">
      {books.map((b) => {
        const on = b.id === bookId;
        return (
          <button
            key={b.id}
            type="button"
            onClick={() => onBook(b.id)}
            aria-current={on ? 'page' : undefined}
            className={`press h-10 shrink-0 rounded-full px-4 font-serif text-[19px] leading-none transition-colors ${
              on ? 'bg-hanji text-ink' : 'text-hanji-2 hover:bg-ink-3 hover:text-hanji'
            }`}
          >
            {b.title}
          </button>
        );
      })}
      <button
        type="button"
        onClick={onAddBook}
        className="press ml-auto flex h-10 shrink-0 items-center gap-1.5 rounded-full border-2 border-rule bg-ink-2 px-3.5 text-[13px] font-extrabold text-hanji-2 hover:text-hanji"
      >
        <Plus size={16} strokeWidth={2.75} aria-hidden />
        {t.addBook}
      </button>
    </nav>
  );
}

/** Today at a glance: the daily goal ring, the streak with the last seven days, and total XP. */
function StatusStrip({ t, data, now }: { t: Strings; data: UserData; now: number }) {
  const s = summarize(data.activity, now);
  const left = Math.max(0, DAILY_GOAL - s.today);
  // At 0 with days behind it, "0-day streak" next to lit days reads like a bug: say it ended, and the record.
  const ended = s.streak === 0 && s.best > 0;
  const weekday = new Intl.DateTimeFormat(data.settings.uiLang, { weekday: 'narrow' });
  return (
    <section
      aria-label={t.dailyGoal(s.today, DAILY_GOAL)}
      className="anim-rise grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-3 rounded-[28px] border-2 border-rule bg-ink-2 p-4 shadow-[0_5px_0_var(--color-rule)] sm:p-5"
    >
      <Ring value={s.today} max={DAILY_GOAL} size={88} stroke={11} track="var(--color-flame-wash)" color="var(--color-flame)" label={t.dailyGoal(s.today, DAILY_GOAL)}>
        <span className="text-center leading-none">
          <span className="tabular block text-[24px] font-black">{s.today}</span>
          <span className="tabular text-[12px] font-bold text-hanji-2">/{DAILY_GOAL}</span>
        </span>
      </Ring>
      <div className="min-w-0">
        <p className={`flex items-center gap-2 font-black leading-tight ${ended ? 'text-[17px]' : 'text-[21px]'}`}>
          <Flame className={`shrink-0 ${s.streak ? 'anim-flicker fill-flame text-flame' : 'text-rule'}`} size={26} strokeWidth={2.2} aria-hidden />
          <span className="tabular">{ended ? t.streakEnded(s.best) : t.streak(s.streak)}</span>
        </p>
        <p className="mt-0.5 text-[14px] font-bold leading-snug text-hanji-2">{left > 0 ? t.goalLeft(left) : t.goalDone}</p>
        <ol className="mt-2.5 grid max-w-[280px] grid-cols-7 gap-1" aria-label={t.lastWeek}>
          {s.week.map((d) => (
            <li key={d.key} className="flex flex-col items-center gap-1" title={`${d.count}`}>
              <span
                className={`grid size-7 place-items-center rounded-full border-2 ${
                  d.count ? 'border-flame bg-flame text-white' : d.today ? 'border-dashed border-flame/60' : 'border-rule'
                }`}
              >
                {d.count > 0 && <Flame size={14} className="fill-white" strokeWidth={2.5} aria-hidden />}
              </span>
              <span className={`text-[11px] font-extrabold uppercase ${d.today ? 'text-flame-ink' : 'text-hanji-2'}`}>{weekday.format(d.date)}</span>
            </li>
          ))}
        </ol>
      </div>
      <p className="col-span-2 flex items-center gap-2.5 rounded-2xl bg-gold/25 px-4 py-2.5 dark:bg-gold/12">
        <Star className="fill-gold text-gold-lip" size={22} strokeWidth={2.2} aria-hidden />
        <span className="tabular text-[20px] font-black leading-none">{s.xp.toLocaleString(data.settings.uiLang)}</span>
        <span className="text-[13px] font-extrabold text-hanji-2">{t.totalXp}</span>
      </p>
    </section>
  );
}

/** One tap into the work: the unfinished run if there is one, else the first stage not yet learned. */
function ContinueCard({
  t,
  units,
  resumable,
  onStart,
  onResume,
}: {
  t: Strings;
  units: UnitSummary[];
  resumable: Props['resumable'];
  onStart: (s: Stage) => void;
  onResume: (s: Stage) => void;
}) {
  const all = units.flatMap((u) => u.stages.map((stage, i) => ({ stage, stats: u.stats[i] })));
  const running = all.find((x) => resumable(x.stage));
  const target = running ?? all.find((x) => x.stats.learned < x.stage.words.length) ?? all[0];
  if (!target) return null;
  const { stage, stats } = target;
  const n = stage.words.length;
  const session = running ? resumable(stage) : null;
  const doneCount = session ? sessionCleared(session, n) : stats.learned;
  const pct = Math.round((doneCount / n) * 100);
  const finished = !running && stats.learned === n;

  return (
    <section
      aria-labelledby="continue-title"
      className="anim-rise relative overflow-hidden rounded-[28px] bg-accent p-5 text-white shadow-[0_6px_0_var(--color-accent-lip)] sm:p-6"
      style={{ ['--i' as string]: 1 }}
    >
      <span aria-hidden className="pointer-events-none absolute -right-4 -top-10 select-none font-serif text-[150px] leading-none text-white/12">
        {stage.unit}
      </span>
      <h2 id="continue-title" className="relative flex flex-wrap items-baseline gap-x-3 text-[26px] font-black leading-tight">
        <span className="font-serif text-[32px]">{stage.unit}</span>
        <span>{t.stage(stage.index + 1)}</span>
      </h2>
      <p className="tabular relative mt-1 text-[15px] font-bold text-white/90">
        {session ? `${doneCount} / ${n}` : t.masteredOf(stats.learned, n)} · {pct}%
      </p>
      <ul className="relative mt-4 flex flex-wrap gap-2" aria-label={t.study}>
        {stage.words.slice(0, 5).map((w, i) => (
          <li key={`${w.ko}-${i}`} lang="ko" className="rounded-xl bg-white/18 px-3 py-1.5 font-serif text-[19px] leading-none">
            {firstForm(w.ko)}
          </li>
        ))}
        {n > 5 && <li className="tabular px-1 py-1.5 text-[14px] font-extrabold text-white/80">+{n - 5}</li>}
      </ul>
      <div className="relative mt-5 h-4 overflow-hidden rounded-full bg-accent-lip/60">
        <div className="relative h-full overflow-hidden rounded-full bg-gold transition-[width] duration-700" style={{ width: `${Math.max(pct, 4)}%` }}>
          <span className="anim-sheen absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/60 to-transparent" aria-hidden />
        </div>
      </div>
      <button
        type="button"
        onClick={() => (running ? onResume(stage) : onStart(stage))}
        className="juicy relative mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-white px-3 text-[17px] font-black uppercase tracking-wide text-accent dark:bg-ink-2 dark:text-accent-text"
        style={{ ['--lip' as string]: 'color-mix(in srgb, var(--color-accent-lip) 45%, transparent)' }}
      >
        {running ? <StepForward size={20} strokeWidth={2.75} aria-hidden /> : finished ? <RotateCcw size={19} strokeWidth={2.75} aria-hidden /> : null}
        <span className="truncate">{running ? t.resume : finished ? t.replay : t.continueLearning}</span>
        {!running && !finished && <ChevronRight size={22} strokeWidth={3} aria-hidden />}
      </button>
    </section>
  );
}

/** The units as a path of rings: tap one to see its stages below. */
function UnitPath({
  t,
  book,
  units,
  due,
  selected,
  onPick,
}: {
  t: Strings;
  book: Book;
  units: UnitSummary[];
  /** Ready words across the book: the sum of the unit badges, and the review card's number. */
  due: number;
  selected: string | undefined;
  onPick: (u: string) => void;
}) {
  return (
    <nav aria-labelledby="path-title" className="anim-rise" style={{ ['--i' as string]: 2 }}>
      <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <h2 id="path-title" className="text-[20px] font-black">
          {t.yourPath(book.title)}
        </h2>
        <DueBadge t={t} due={due} />
      </div>
      <ol className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-3 pt-2 sm:mx-0 sm:px-0">
        {units.map((u) => {
          const on = u.unit === selected;
          // One status per unit: ready words show as the ↑ badge, so "Complete" waits until there are none.
          const done = u.pct === 100 && u.due === 0;
          return (
            <li key={u.unit} className="shrink-0">
              <button
                type="button"
                onClick={() => onPick(u.unit)}
                aria-current={on ? 'true' : undefined}
                className="press group relative flex w-[88px] flex-col items-center gap-1.5"
              >
                <Ring value={u.done} max={u.total} size={80} stroke={8} track="var(--color-rule)" color={done ? 'var(--color-gold)' : 'var(--color-accent)'} label={`${u.unit}: ${u.pct}%`}>
                  <span
                    className={`grid size-[58px] place-items-center rounded-full font-serif text-[20px] leading-none transition-transform group-hover:scale-105 ${
                      on ? 'bg-accent text-white shadow-[0_4px_0_var(--color-accent-lip)]' : done ? 'bg-gold text-on-bright' : 'bg-ink-2 text-hanji ring-2 ring-rule'
                    }`}
                  >
                    {u.unit}
                  </span>
                </Ring>
                {u.due > 0 && (
                  <span title={t.dueReview(u.due)} className="tabular absolute right-0.5 top-0 grid h-6 min-w-6 place-items-center rounded-full bg-sky px-1.5 text-[11px] font-black text-white ring-2 ring-ink">
                    <span aria-hidden>↑{u.due}</span>
                    <span className="sr-only">{t.dueReview(u.due)}</span>
                  </span>
                )}
                <span className={`tabular text-[12px] font-extrabold ${on ? 'text-accent-text' : 'text-hanji-2'}`}>{done ? t.completed : `${u.pct}%`}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function MasteryCard({ t, book, stats, total, pct }: { t: Strings; book: Book; stats: MemoryStats; total: number; pct: number }) {
  const rows = [
    { label: t.level(3), n: stats.levels[3], color: 'bg-gold' },
    { label: t.level(2), n: stats.levels[2], color: 'bg-indigo' },
    { label: t.level(1), n: stats.levels[1], color: 'bg-flame' },
    { label: t.newWords, n: stats.levels[0], color: 'bg-rule' },
  ];
  return (
    <section aria-labelledby="mastery-title" className="anim-rise rounded-[28px] border-2 border-rule bg-ink-2 p-5" style={{ ['--i' as string]: 3 }}>
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="mastery-title" className="text-[19px] font-black">
          {t.wordMastery} · <span className="font-serif">{book.title}</span>
        </h2>
        <p className="tabular text-[22px] font-black">{pct}%</p>
      </div>
      <p className="tabular mt-0.5 text-[13px] font-bold text-hanji-2">{t.masteredOf(stats.learned, total)}</p>
      <ul className="mt-4 space-y-2.5" aria-label={t.memoryLevels}>
        {rows.map((r) => (
          <li key={r.label} className="grid grid-cols-[minmax(84px,auto)_1fr_40px] items-center gap-3 text-[13px] font-bold">
            <span className="text-hanji-2">{r.label}</span>
            <span className="h-3 overflow-hidden rounded-full bg-ink">
              <span className={`block h-full rounded-full ${r.color} transition-[width] duration-700`} style={{ width: `${total ? (r.n / total) * 100 : 0}%` }} />
            </span>
            <span className="tabular text-right font-black">{r.n}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ReviewCard({ t, stage, due, onStart }: { t: Strings; stage: Stage; due: number; onStart: (s: Stage) => void }) {
  return (
    <section aria-labelledby="review-title" className="anim-rise flex flex-col rounded-[28px] bg-sky-wash p-5" style={{ ['--i' as string]: 4 }}>
      <h2 id="review-title" className="text-[19px] font-black leading-tight">
        {t.levelUpReady(due)}
      </h2>
      <p className="mt-1 text-[14px] font-bold text-hanji-2">{t.levelUpHint}</p>
      {stage.words.length < due && <p className="mt-1 text-[13px] font-semibold text-hanji-2">{t.levelUpRound(stage.words.length)}</p>}
      <button type="button" onClick={() => onStart(stage)} className="juicy lip-sky mt-5 flex h-13 items-center justify-center gap-2 rounded-2xl bg-sky text-[16px] font-black uppercase tracking-wide text-white sm:mt-auto">
        <RotateCcw size={18} strokeWidth={3} aria-hidden />
        {t.review}
      </button>
    </section>
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

  const bookStats = units.flatMap((u) => u.stats).reduce(addStats, EMPTY_STATS);
  const bookTotal = units.reduce((n, u) => n + u.total, 0);
  const bookPct = bookTotal ? Math.round((bookStats.learned / bookTotal) * 100) : 0;
  const isSample = book.builtIn && book.id === '1A' && bookTotal < 100;
  const review = useMemo(() => reviewStage(book, memory, now), [book, memory, now]);
  const uiGloss: GlossLang = data.settings.uiLang === 'ko' ? 'en' : data.settings.uiLang;

  return (
    <main className="scroll-smooth-motion h-full overflow-y-auto overscroll-contain">
      <div className="mx-auto max-w-5xl space-y-5 px-4 pb-14 pt-4 sm:px-6 md:pt-6">
        <BookTabs t={t} books={books} bookId={book.id} onBook={onBook} onAddBook={onAddBook} />

        {isSample && <p className="rounded-2xl border-2 border-rule bg-ink-2 px-4 py-3 text-[13px] font-semibold leading-snug text-hanji-2">{t.sampleData}</p>}

        {units.length === 0 ? (
          <div className="rounded-[28px] border-2 border-dashed border-rule px-4 py-16 text-center">
            <p className="font-serif text-[24px]">{t.emptyBook}</p>
            <p className="mt-2 text-[14px] font-semibold text-hanji-2">{t.emptyBookHint}</p>
          </div>
        ) : (
          <>
            <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr] lg:items-start">
              <div className="lg:col-start-2">
                <StatusStrip t={t} data={data} now={now} />
              </div>
              <div className="lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:self-stretch">
                <WordOfTheDay t={t} books={books} promptLang={data.settings.promptLang} uiGloss={uiGloss} now={now} />
              </div>
              <div className="lg:col-start-2">
                <ContinueCard t={t} units={units} resumable={resumable} onStart={onStart} onResume={onResume} />
              </div>
            </div>

            <UnitPath t={t} book={book} units={units} due={bookStats.due} selected={selected?.unit} onPick={pickUnit} />

            {selected && (
              <section aria-labelledby="unit-title" className="@container">
                <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3 border-b-2 border-rule pb-4">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                    <h2 id="unit-title" className="shrink-0 whitespace-nowrap font-serif text-[40px] leading-none md:text-[48px]">
                      {selected.unit}
                    </h2>
                    {/* One status: ready words to level up, or the seal once there are none. */}
                    {selected.due > 0 ? <DueBadge t={t} due={selected.due} /> : selected.pct === 100 && <Seal size={40} />}
                  </div>
                  <div className="min-w-[12rem] flex-1 md:max-w-xs">
                    <p className="tabular flex justify-between text-[13px] font-bold text-hanji-2">
                      <span>
                        {t.wordCount(selected.total)} · {t.stagesCount(selected.stages.length)}
                      </span>
                      <span className="font-black text-hanji">{selected.pct}%</span>
                    </p>
                    <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-rule">
                      <div className="h-full rounded-full bg-accent transition-[width] duration-700" style={{ width: `${selected.pct}%` }} />
                    </div>
                  </div>
                </header>

                <div className="mt-5 grid grid-cols-1 gap-4 @xl:grid-cols-2 @4xl:grid-cols-3">
                  {selected.stages.map((s, i) => (
                    <StageCard
                      key={s.key}
                      t={t}
                      order={i}
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

            <div className={`grid gap-4 ${review ? 'sm:grid-cols-[1.4fr_1fr]' : ''}`}>
              <MasteryCard t={t} book={book} stats={bookStats} total={bookTotal} pct={bookPct} />
              {review && <ReviewCard t={t} stage={review} due={bookStats.due} onStart={onStart} />}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
