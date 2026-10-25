/**
 * The real dashboard and quiz with made-up progress, to review states a fresh dev profile never
 * reaches: a lapsed streak with a record, a finished stage with words ready to level up next to a
 * truly complete one, more ready words than one review round takes, and a quiz word with no
 * translation in the chosen prompt language. Nothing here is saved.
 */
import { useMemo, useState } from 'react';
import { Home } from '../components/Home';
import { Quiz } from '../components/Quiz';
import { BUILT_IN_BOOKS, stagesForUnit, wordId } from '../lib/books';
import { dayKey } from '../lib/activity';
import { STRINGS } from '../lib/i18n';
import { emptyData } from '../lib/storage';
import type { Stage, UiLang, UserData, WordMemory } from '../types';

const HOUR = 60 * 60 * 1000;
const noop = () => {};

function fixture(now: number): UserData {
  const book = BUILT_IN_BOOKS[0];
  const memory: Record<string, WordMemory> = {};
  const [first, second] = stagesForUnit(book, book.units[0], 25);
  // Stage 1: every word learned, all ready for level 2 (cooldown over) → "ready to level up", no seal.
  for (const w of first.words) memory[wordId(book.id, w)] = { level: 1, lastReviewedAt: now - 30 * HOUR, nextReviewAt: now - 26 * HOUR };
  // Stage 2: every word learned, none ready yet → the seal.
  for (const w of second?.words ?? []) memory[wordId(book.id, w)] = { level: 2, lastReviewedAt: now - HOUR, nextReviewAt: now + 70 * HOUR };
  // Unit 1과: a dozen ready words, so the book has more than one review round's worth.
  for (const w of book.words.filter((x) => x.unit === book.units[1]).slice(0, 12)) {
    memory[wordId(book.id, w)] = { level: 1, lastReviewedAt: now - 30 * HOUR, nextReviewAt: now - 20 * HOUR };
  }
  // Activity: four days last week (none yesterday or today), and a nine-day run a month ago.
  const activity: Record<string, number> = {};
  for (const back of [3, 4, 5, 6]) activity[dayKey(now - back * 24 * HOUR)] = 18;
  for (let back = 30; back < 39; back++) activity[dayKey(now - back * 24 * HOUR)] = 25;
  const data = emptyData();
  return { ...data, memory, activity, stages: { [first.key]: { completions: 1, lastCompletedAt: now - 30 * HOUR } } };
}

export default function StatesLab() {
  const [uiLang, setUiLang] = useState<UiLang>('en');
  const now = useMemo(() => Date.now(), []);
  const base = useMemo(() => fixture(now), [now]);
  const data: UserData = { ...base, settings: { ...base.settings, uiLang, promptLang: 'ru' } };
  const t = STRINGS[uiLang];

  // A two-word quiz whose first word has no Russian translation, with the prompt language on Russian.
  const quizStage: Stage = useMemo(() => {
    const [a, b] = BUILT_IN_BOOKS[0].words;
    return { key: 'lab|missing|0', bookId: 'lab', unit: a.unit, index: 0, from: 1, to: 2, words: [{ ...a, ru: '' }, b] };
  }, []);

  return (
    <div className="h-full overflow-auto">
      <div className="sticky top-0 z-10 flex items-center gap-2 border-b-2 border-rule bg-ink-2/95 px-4 py-2 backdrop-blur">
        <span className="text-[12px] font-extrabold text-hanji-2">Interface</span>
        {(['en', 'ru', 'uz', 'ko'] as const).map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => setUiLang(l)}
            className={`h-7 rounded-full px-3 text-[12px] font-black uppercase ${l === uiLang ? 'bg-accent text-white' : 'text-hanji-2 hover:bg-ink-3'}`}
          >
            {l}
          </button>
        ))}
        <span className="ml-3 text-[12px] font-semibold text-hanji-2">Made-up progress; nothing is saved.</span>
      </div>

      <h2 className="px-6 pt-6 text-[13px] font-black uppercase tracking-[0.12em] text-amber">
        Dashboard · streak ended, one status per stage, one due count
      </h2>
      <div className="h-[2100px]">
        <Home
          t={t}
          books={[...BUILT_IN_BOOKS]}
          data={data}
          memory={data.memory}
          now={now}
          bookId="1A"
          onBook={noop}
          onPreview={noop}
          onStart={noop}
          resumable={() => null}
          onResume={noop}
          onAddBook={noop}
        />
      </div>

      <h2 className="px-6 pt-6 text-[13px] font-black uppercase tracking-[0.12em] text-amber">Quiz · prompt language RU, word without a Russian translation</h2>
      <div className="mx-auto flex h-[720px] max-w-5xl flex-col px-4 pb-8">
        <Quiz
          key={uiLang}
          t={t}
          stage={quizStage}
          settings={data.settings}
          resume={null}
          onResult={noop}
          onComplete={noop}
          onExit={noop}
          nextStage={null}
          onNext={noop}
        />
      </div>
    </div>
  );
}
