import { useMemo, useState } from 'react';
import type { Book, PromptLang, Stage, VocabEntry, WordMemory } from '../types';
import { allBooks, stagesForUnit, wordId } from '../lib/books';
import { loadData } from '../lib/storage';
import { useSharedBooks } from '../lib/global';
import { useOnline } from '../lib/hooks';
import { addStats, EMPTY_STATS, isDue, memoryStats, type MemoryStats } from '../lib/srs';

/**
 * Read-only view of the learner's real books and progress for the design lab. Nothing here
 * writes to `project-vocab:*` storage: progress is loaded once, and "demo progress" is an
 * in-memory overlay on the real word list so the concepts can be judged with a lived-in profile.
 */

const HOUR = 3_600_000;
const DAY = 24 * HOUR;
export const DAILY_GOAL = 20;

export interface UnitInfo {
  unit: string;
  stages: Stage[];
  stats: MemoryStats[];
  total: number;
  learned: number;
  due: number;
  pct: number;
}

export interface NextUp {
  stage: Stage;
  stats: MemoryStats;
  unit: UnitInfo;
}

export interface DayActivity {
  label: string;
  count: number;
  today: boolean;
}

export interface LabModel {
  books: Book[];
  book: Book;
  chooseBook: (id: string) => void;
  lang: PromptLang;
  setLang: (l: PromptLang) => void;
  /** True while the demo overlay is shown instead of this browser's real progress. */
  demo: boolean;
  setDemo: (on: boolean) => void;
  /** Whether this browser has any real progress for the lab to show. */
  hasReal: boolean;
  memory: Record<string, WordMemory>;
  now: number;
  units: UnitInfo[];
  stats: MemoryStats;
  total: number;
  pct: number;
  next: NextUp | null;
  /** Words ready for their next memory level, as one playable stage. */
  review: Stage | null;
  wordOfDay: VocabEntry | null;
  streak: number;
  today: number;
  week: DayActivity[];
  xp: number;
}

/** First form of a slash alternative ("아래/ 밑" → "아래"). */
export const firstForm = (ko: string) => ko.split('/')[0].trim();

const startOfDay = (t: number) => {
  const d = new Date(t);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

/**
 * A believable learner a week in: the first two stages of the book settled across all three
 * levels, the third under way, some words due, and reviews spread over the last six days.
 */
function demoMemory(book: Book, size: number, now: number): Record<string, WordMemory> {
  const stages = book.units.flatMap((u) => stagesForUnit(book, u, size));
  const plan = [1, 1, 0.45];
  const today = startOfDay(now);
  const mem: Record<string, WordMemory> = {};
  let k = 0;
  stages.slice(0, plan.length).forEach((s, si) => {
    const n = Math.round(s.words.length * plan[si]);
    s.words.slice(0, n).forEach((w, i) => {
      const level = (((i * 7 + si * 3) % 3) + 1) as 1 | 2 | 3;
      const dayOffset = k < 12 ? 0 : 1 + ((k - 12) % 5);
      const reviewed = today - dayOffset * DAY + 9 * HOUR + (k % 9) * 17 * 60_000;
      const due = level < 3 && i % 4 === 1;
      mem[wordId(book.id, w)] = { level, lastReviewedAt: reviewed, nextReviewAt: level === 3 ? reviewed : due ? now - HOUR : now + 2 * DAY };
      k++;
    });
  });
  return mem;
}

/** Day-by-day review counts from each word's last review: an honest lower bound of real activity. */
function activity(memory: Record<string, WordMemory>, now: number) {
  const today = startOfDay(now);
  const byDay = new Map<number, number>();
  for (const m of Object.values(memory)) {
    const d = startOfDay(m.lastReviewedAt);
    byDay.set(d, (byDay.get(d) ?? 0) + 1);
  }
  let streak = 0;
  // A streak survives until the end of today: start from yesterday when nothing is done yet today.
  let cursor = byDay.get(today) ? today : today - DAY;
  while (byDay.get(cursor)) {
    streak++;
    cursor -= DAY;
  }
  const fmt = new Intl.DateTimeFormat('en', { weekday: 'narrow' });
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = today - (6 - i) * DAY;
    return { label: fmt.format(d), count: byDay.get(d) ?? 0, today: d === today };
  });
  return { streak, today: byDay.get(today) ?? 0, week };
}

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** The same word all day for everyone on a book: a two-syllable-or-longer word when there is one. */
function pickWordOfDay(book: Book, now: number): VocabEntry | null {
  const rich = book.words.filter((w) => firstForm(w.ko).replace(/\s/g, '').length >= 2 && (w.uz || w.ru || w.en));
  const pool = rich.length ? rich : book.words;
  if (!pool.length) return null;
  const day = new Date(now).toISOString().slice(0, 10);
  return pool[hash(`${book.id}:${day}`) % pool.length];
}

export function useLabModel(): LabModel {
  const [data] = useState(loadData);
  const online = useOnline();
  const shared = useSharedBooks(online);
  const books = useMemo(() => allBooks(data, shared.books), [data, shared.books]);
  const [bookId, setBookId] = useState(() => (books.some((b) => b.id === '1A') ? '1A' : books[0]?.id));
  const book = books.find((b) => b.id === bookId) ?? books[0];
  const [lang, setLang] = useState<PromptLang>(data.settings.promptLang);
  const [now] = useState(() => Date.now());
  const size = data.settings.stageSize;

  const hasReal = Object.keys(data.memory).length > 0;
  const [demo, setDemo] = useState(!hasReal);

  const memory = useMemo(() => (demo ? demoMemory(book, size, now) : data.memory), [demo, book, size, now, data.memory]);

  return useMemo(() => {
    const units: UnitInfo[] = book.units
      .map((unit) => {
        const stages = stagesForUnit(book, unit, size);
        const stats = stages.map((s) => memoryStats(s.words, book.id, memory, now));
        const sum = stats.reduce(addStats, EMPTY_STATS);
        const total = stages.reduce((n, s) => n + s.words.length, 0);
        return { unit, stages, stats, total, learned: sum.learned, due: sum.due, pct: total ? Math.round((sum.learned / total) * 100) : 0 };
      })
      .filter((u) => u.total > 0);

    const stats = units.flatMap((u) => u.stats).reduce(addStats, EMPTY_STATS);
    const total = units.reduce((n, u) => n + u.total, 0);

    let next: NextUp | null = null;
    for (const u of units) {
      const i = u.stats.findIndex((s, j) => s.learned < u.stages[j].words.length);
      if (i >= 0) {
        next = { stage: u.stages[i], stats: u.stats[i], unit: u };
        break;
      }
    }
    if (!next && units[0]) next = { stage: units[0].stages[0], stats: units[0].stats[0], unit: units[0] };

    const dueWords = book.words.filter((w) => isDue(memory[wordId(book.id, w)], now)).slice(0, 30);
    const review: Stage | null = dueWords.length
      ? { key: `${book.id}|review|0`, bookId: book.id, unit: 'review', index: 0, from: 1, to: dueWords.length, words: dueWords }
      : null;

    const act = activity(memory, now);
    const xp = Object.values(memory).reduce((n, m) => n + m.level * 15, 0);

    return {
      books,
      book,
      chooseBook: setBookId,
      lang,
      setLang,
      demo,
      setDemo,
      hasReal,
      memory,
      now,
      units,
      stats,
      total,
      pct: total ? Math.round((stats.learned / total) * 100) : 0,
      next,
      review,
      wordOfDay: pickWordOfDay(book, now),
      streak: act.streak,
      today: act.today,
      week: act.week,
      xp,
    };
  }, [books, book, lang, demo, hasReal, memory, now, size]);
}

/** Stage title in plain words: "Stage 3", or "Review" for the due-words set. */
export const stageName = (s: Stage) => (s.unit === 'review' ? 'Review' : `Stage ${s.index + 1}`);

export const LANG_LABEL: Record<PromptLang, string> = { uz: 'UZ', ru: 'RU', en: 'EN', all: 'ALL' };
export const PROMPT_LANGS: PromptLang[] = ['uz', 'ru', 'en', 'all'];

/** The prompt to show for a word: the chosen language, or all three stacked with Uzbek first. */
export function promptOf(w: VocabEntry, lang: PromptLang): { main: string; mainLang: 'uz' | 'ru' | 'en'; rest: { lang: 'uz' | 'ru' | 'en'; text: string }[] } {
  const langs = (['uz', 'ru', 'en'] as const).filter((l) => w[l]);
  const mainLang = lang !== 'all' && w[lang] ? lang : (langs[0] ?? 'en');
  return {
    main: w[mainLang],
    mainLang,
    rest: lang === 'all' ? langs.filter((l) => l !== mainLang).map((l) => ({ lang: l, text: w[l] })) : [],
  };
}
