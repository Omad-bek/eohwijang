import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Check, CornerDownLeft, RefreshCw, RotateCcw, Shuffle } from 'lucide-react';
import type { Stage, VocabEntry } from '../types';
import { wordId } from '../lib/books';
import { checkAnswer, type DiffResult } from '../utils/hangulDiff';
import type { ConceptProps } from './Lab';
import { DAILY_GOAL, firstForm, LANG_LABEL, PROMPT_LANGS, promptOf, stageName, type LabModel } from './model';
import { useLabQuiz } from './quiz';
import { DiffWord, jamoOf } from './ui';

/**
 * Concept 2: Clean bento. Daylight paper, hairline tiles, washed pastels that carry meaning
 * (mint = learned, sky = review, sun = today, lilac = the quick word). The home screen is one
 * glanceable grid; a quick word you can type right there hooks the first second.
 */

const tile = 'rounded-xl border border-bento-line bg-bento-card';
const kbd = 'inline-grid h-5 min-w-5 place-items-center rounded border border-bento-line bg-bento-soft px-1 font-bento-mono text-[11px] text-bento-mute';

function Header({ m }: { m: LabModel }) {
  return (
    <header className="flex flex-wrap items-center gap-x-4 gap-y-3">
      <span className="font-bento-ko text-[24px] font-bold leading-none">어휘장</span>
      <nav aria-label="Books" className="flex rounded-lg border border-bento-line bg-bento-card p-0.5">
        {m.books.map((b) => (
          <button
            key={b.id}
            type="button"
            onClick={() => m.chooseBook(b.id)}
            aria-pressed={b.id === m.book.id}
            className={`h-7 rounded-md px-2.5 text-[13px] font-semibold transition-colors ${
              b.id === m.book.id ? 'bg-bento-ink text-white' : 'text-bento-mute hover:text-bento-ink'
            }`}
          >
            {b.title}
          </button>
        ))}
      </nav>
      <div className="ml-auto flex items-center gap-1.5 text-[13px] text-bento-mute">
        <span>Prompts in</span>
        <div className="flex rounded-lg border border-bento-line bg-bento-card p-0.5">
          {PROMPT_LANGS.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => m.setLang(l)}
              aria-pressed={l === m.lang}
              className={`h-7 rounded-md px-2 text-[12px] font-semibold ${l === m.lang ? 'bg-bento-soft text-bento-ink ring-1 ring-bento-line' : 'hover:text-bento-ink'}`}
            >
              {LANG_LABEL[l]}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}

function ContinueTile({ m, onStart }: { m: LabModel; onStart: (s: Stage) => void }) {
  if (!m.next) return null;
  const { stage, stats, unit } = m.next;
  const n = stage.words.length;
  const pct = Math.round((stats.learned / n) * 100);
  const learned = (w: VocabEntry) => !!m.memory[wordId(stage.bookId, w)];
  // What is still ahead comes first; learned words follow with their check.
  const shown = [...stage.words].sort((a, b) => Number(learned(a)) - Number(learned(b))).slice(0, 10);
  return (
    <section aria-labelledby="bento-continue" className={`${tile} anim-rise flex flex-col p-6 md:col-span-4 md:row-span-2 md:p-8`}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="bento-continue" className="flex items-baseline gap-3 text-[28px] font-semibold tracking-[-0.02em]">
          <span className="font-bento-ko text-[34px] font-bold">{unit.unit}</span>
          {stageName(stage)}
        </h2>
        <p className="tabular text-[14px] text-bento-mute">
          {stats.learned} of {n} learned
        </p>
      </div>
      <ul className="mt-6 grid grid-cols-1 gap-x-8 sm:grid-cols-2" aria-label="Words in this stage">
        {shown.map((w, i) => {
          const on = learned(w);
          return (
            <li key={w.ko} className={`anim-rise items-center gap-3 border-b border-bento-line py-2.5 ${i >= 5 ? 'hidden sm:flex' : 'flex'}`} style={{ ['--i' as string]: i }}>
              <span className={`grid size-5 shrink-0 place-items-center rounded-full ${on ? 'bg-bento-mint text-bento-mint-ink' : 'border border-dashed border-bento-line'}`}>
                {on && <Check size={12} strokeWidth={3} aria-label="learned" />}
              </span>
              <span lang="ko" className="font-bento-ko text-[19px] font-bold">
                {firstForm(w.ko)}
              </span>
              <span className="ml-auto truncate text-[14px] text-bento-mute">{promptOf(w, m.lang === 'all' ? 'uz' : m.lang).main}</span>
            </li>
          );
        })}
      </ul>
      <p className="mt-2 text-[13px] text-bento-mute">
        <span className="sm:hidden">and {n - Math.min(5, n)} more</span>
        <span className="hidden sm:inline">{n > shown.length ? `and ${n - shown.length} more` : ''}</span>
      </p>
      <div className="mt-auto flex flex-wrap items-center gap-4 pt-8">
        <div className="min-w-[160px] flex-1">
          <div className="h-1.5 overflow-hidden rounded-full bg-bento-soft">
            <div className="h-full rounded-full bg-bento-mint-ink transition-[width] duration-700" style={{ width: `${pct}%` }} />
          </div>
          <p className="tabular mt-2 text-[13px] text-bento-mute">{pct}% of this stage</p>
        </div>
        <button
          type="button"
          onClick={() => onStart(stage)}
          className="press group flex h-12 items-center gap-3 rounded-md bg-bento-ink pl-5 pr-3 text-[15px] font-semibold text-white hover:bg-bento-ink-2"
        >
          Continue
          <span className="grid h-7 place-items-center rounded bg-white/12 px-1.5 text-white/80">
            <CornerDownLeft size={14} aria-label="Enter" />
          </span>
        </button>
      </div>
    </section>
  );
}

function QuickWord({ m }: { m: LabModel }) {
  const pool = useMemo(() => m.book.words.filter((w) => firstForm(w.ko).length >= 2), [m.book]);
  const [word, setWord] = useState<VocabEntry | null>(m.wordOfDay);
  const [flipped, setFlipped] = useState(false);
  const [value, setValue] = useState('');
  const [verdict, setVerdict] = useState<DiffResult | null>(null);
  const [composing, setComposing] = useState(false);
  const [hint, setHint] = useState(false);
  if (!word) return null;
  const p = promptOf(word, m.lang === 'all' ? 'uz' : m.lang);
  const syllables = Array.from(firstForm(word.ko).replace(/\s/g, ''));
  const firstJamo = jamoOf(syllables[0] ?? '')[0]?.j?.cho ?? syllables[0];

  const another = () => {
    setFlipped(false);
    setHint(false);
    setVerdict(null);
    setValue('');
    window.setTimeout(() => setWord(pool[Math.floor(Math.random() * pool.length)] ?? word), flipped ? 260 : 0);
  };
  const check = () => {
    if (!value.trim()) return;
    const r = checkAnswer(value, word.ko);
    setVerdict(r);
    setFlipped(true);
  };

  return (
    <section aria-labelledby="bento-quick" className="anim-rise md:col-span-2 md:row-span-2" style={{ ['--i' as string]: 1 }}>
      <div className="flip h-full min-h-[300px]">
        <div className={`flip-inner min-h-[300px] ${flipped ? 'is-flipped' : ''}`}>
          <div className="flip-face flex flex-col rounded-xl border border-bento-line bg-bento-lilac p-6">
            <div className="flex items-center justify-between">
              <h2 id="bento-quick" className="text-[14px] font-semibold text-bento-lilac-ink">
                {word === m.wordOfDay ? 'Word of the day' : 'Quick word'}
              </h2>
              <button type="button" onClick={another} className="press grid size-8 place-items-center rounded-md text-bento-lilac-ink hover:bg-white/60" aria-label="Another word">
                <Shuffle size={16} />
              </button>
            </div>
            <div className="mt-6 flex flex-wrap gap-1.5" aria-label={`${syllables.length} syllables`}>
              {syllables.map((_, i) => (
                <span key={i} className="grid size-11 place-items-center rounded-md border border-dashed border-bento-lilac-ink/30 bg-white/50 font-bento-ko text-[20px] font-bold text-bento-lilac-ink">
                  {hint && i === 0 ? <span className="anim-pop">{firstJamo}</span> : null}
                </span>
              ))}
            </div>
            <p lang={p.mainLang} className="mt-auto pt-4 text-[30px] font-semibold leading-[1.1] tracking-[-0.02em] text-bento-ink balance">
              {p.main}
            </p>
            <form
              className="mt-5 flex items-center gap-2 rounded-lg border border-bento-lilac-ink/20 bg-white px-3 focus-within:border-bento-lilac-ink/60"
              onSubmit={(e) => {
                e.preventDefault();
                if (!composing) check();
              }}
            >
              <input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onCompositionStart={() => setComposing(true)}
                onCompositionEnd={() => setComposing(false)}
                lang="ko"
                autoComplete="off"
                spellCheck={false}
                aria-label="Type it in Korean"
                placeholder="Type it in Korean"
                className="h-11 min-w-0 flex-1 bg-transparent font-bento-ko text-[19px] font-bold outline-none placeholder:font-bento placeholder:text-[14px] placeholder:font-normal placeholder:text-bento-mute"
              />
              <button type="submit" className="press grid size-8 place-items-center rounded-md bg-bento-ink text-white" aria-label="Check">
                <ArrowRight size={16} />
              </button>
            </form>
            <div className="mt-3 flex gap-4 text-[13px] text-bento-lilac-ink">
              <button type="button" onClick={() => setHint(true)} disabled={hint} className="underline decoration-bento-lilac-ink/30 underline-offset-4 hover:decoration-bento-lilac-ink disabled:no-underline disabled:opacity-60">
                {hint ? `Starts with ${firstJamo}` : 'Hint'}
              </button>
              <button type="button" onClick={() => setFlipped(true)} className="underline decoration-bento-lilac-ink/30 underline-offset-4 hover:decoration-bento-lilac-ink">
                Just show me
              </button>
            </div>
          </div>
          <div className={`flip-face flip-back flex flex-col rounded-xl border p-6 ${verdict?.correct ? 'border-bento-mint-ink/25 bg-bento-mint' : 'border-bento-line bg-bento-card'}`}>
            <p className={`text-[14px] font-semibold ${verdict?.correct ? 'text-bento-mint-ink' : verdict ? 'text-bento-rose-ink' : 'text-bento-mute'}`}>
              {verdict?.correct ? 'Exactly right' : verdict ? 'Close. Here is the spelling' : 'The answer'}
            </p>
            <p lang="ko" className="mt-auto font-bento-ko text-[56px] font-bold leading-none">
              {firstForm(word.ko)}
            </p>
            <ul className="mt-4 space-y-1 text-[14px] text-bento-ink-2">
              {(['uz', 'ru', 'en'] as const)
                .filter((l) => word[l])
                .map((l) => (
                  <li key={l} lang={l} className="flex gap-2">
                    <span className="w-6 font-bento-mono text-[11px] leading-5 text-bento-mute uppercase">{l}</span>
                    {word[l]}
                  </li>
                ))}
            </ul>
            <button type="button" onClick={another} className="press mt-5 flex h-10 items-center justify-center gap-2 rounded-md border border-bento-line bg-white text-[14px] font-semibold hover:bg-bento-soft">
              <RefreshCw size={14} aria-hidden />
              Another word
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function GoalTile({ m }: { m: LabModel }) {
  return (
    <section aria-labelledby="bento-goal" className="anim-rise rounded-xl border border-bento-sun-ink/15 bg-bento-sun p-5 md:col-span-2" style={{ ['--i' as string]: 2 }}>
      <div className="flex items-baseline justify-between">
        <h2 id="bento-goal" className="text-[14px] font-semibold text-bento-sun-ink">
          Today
        </h2>
        <p className="tabular text-[13px] text-bento-sun-ink">{m.streak}-day streak</p>
      </div>
      <p className="tabular mt-3 text-[32px] font-semibold leading-none tracking-[-0.02em]">
        {m.today}
        <span className="text-[18px] text-bento-sun-ink/70"> / {DAILY_GOAL} words</span>
      </p>
      <div className="mt-4 grid grid-cols-10 gap-1" role="img" aria-label={`${m.today} of ${DAILY_GOAL} words today`}>
        {Array.from({ length: DAILY_GOAL }, (_, i) => (
          <span key={i} className={`h-2.5 rounded-[3px] ${i < m.today ? 'bg-bento-sun-ink' : 'bg-white/70'}`} style={{ transitionDelay: `${i * 30}ms` }} />
        ))}
      </div>
      <ol className="mt-4 flex justify-between" aria-label="Last 7 days">
        {m.week.map((d, i) => (
          <li key={i} className="flex flex-col items-center gap-1">
            <span className={`size-3 rounded-[3px] ${d.count ? 'bg-bento-sun-ink' : 'bg-white/70'} ${d.today ? 'ring-2 ring-bento-sun-ink/30 ring-offset-1 ring-offset-bento-sun' : ''}`} title={`${d.count} words`} />
            <span className="font-bento-mono text-[10px] text-bento-sun-ink/80">{d.label}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

function MasteryTile({ m }: { m: LabModel }) {
  const segs = [
    { label: 'Long-term', n: m.stats.levels[3], c: 'bg-bento-mint-ink' },
    { label: 'Settling', n: m.stats.levels[2], c: 'bg-[#7fae86]' },
    { label: 'New memory', n: m.stats.levels[1], c: 'bg-[#c5dcc6]' },
  ];
  return (
    <section aria-labelledby="bento-mastery" className={`${tile} anim-rise p-5 md:col-span-2`} style={{ ['--i' as string]: 3 }}>
      <h2 id="bento-mastery" className="text-[14px] font-semibold text-bento-mute">
        {m.book.title} mastery
      </h2>
      <p className="tabular mt-3 text-[32px] font-semibold leading-none tracking-[-0.02em]">
        {m.pct}%<span className="text-[15px] font-normal text-bento-mute"> · {m.stats.learned} of {m.total}</span>
      </p>
      <div className="mt-4 flex h-2.5 overflow-hidden rounded-full bg-bento-soft" role="img" aria-label="Words by memory level">
        {segs.map((s) => (
          <span key={s.label} className={`${s.c} h-full transition-[width] duration-700`} style={{ width: `${m.total ? (s.n / m.total) * 100 : 0}%` }} />
        ))}
      </div>
      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-bento-mute">
        {segs.map((s) => (
          <li key={s.label} className="flex items-center gap-1.5">
            <span className={`size-2 rounded-full ${s.c}`} aria-hidden />
            {s.label} <span className="tabular text-bento-ink">{s.n}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ReviewTile({ m, onStart }: { m: LabModel; onStart: (s: Stage) => void }) {
  const n = m.review?.words.length ?? 0;
  return (
    <section aria-labelledby="bento-review" className="anim-rise flex flex-col rounded-xl border border-bento-sky-ink/15 bg-bento-sky p-5 md:col-span-2" style={{ ['--i' as string]: 4 }}>
      <h2 id="bento-review" className="text-[14px] font-semibold text-bento-sky-ink">
        Ready to level up
      </h2>
      <p className="tabular mt-3 text-[32px] font-semibold leading-none tracking-[-0.02em]">
        {n}
        <span className="text-[15px] font-normal text-bento-sky-ink/80"> {n === 1 ? 'word' : 'words'}</span>
      </p>
      {m.review ? (
        <button
          type="button"
          onClick={() => onStart(m.review!)}
          className="press mt-auto flex h-10 items-center justify-center gap-2 rounded-md bg-white text-[14px] font-semibold text-bento-sky-ink ring-1 ring-bento-sky-ink/15 hover:ring-bento-sky-ink/40"
        >
          <RotateCcw size={14} aria-hidden />
          Review now
        </button>
      ) : (
        <p className="mt-auto pt-3 text-[13px] text-bento-sky-ink/80">Nothing due. Words come back here when their timer is up.</p>
      )}
    </section>
  );
}

function UnitsTile({ m, onStart }: { m: LabModel; onStart: (s: Stage) => void }) {
  return (
    <section aria-labelledby="bento-units" className={`${tile} anim-rise overflow-hidden md:col-span-6`} style={{ ['--i' as string]: 5 }}>
      <h2 id="bento-units" className="border-b border-bento-line px-5 py-3.5 text-[14px] font-semibold text-bento-mute">
        Units
      </h2>
      <ul className="grid sm:grid-cols-2 lg:grid-cols-3">
        {m.units.map((u) => {
          const i = u.stats.findIndex((s, j) => s.learned < u.stages[j].words.length);
          const target = u.stages[i] ?? u.stages[0];
          return (
            <li key={u.unit} className="border-b border-bento-line sm:odd:border-r lg:odd:border-r-0 lg:[&:not(:nth-child(3n))]:border-r">
              <button type="button" onClick={() => onStart(target)} className="group flex w-full items-center gap-4 px-5 py-3.5 text-left transition-colors hover:bg-bento-soft">
                <span className="w-12 shrink-0 font-bento-ko text-[20px] font-bold">{u.unit}</span>
                <span className="min-w-0 flex-1">
                  <span className="tabular flex justify-between text-[12px] text-bento-mute">
                    <span>
                      {u.total} words{u.due > 0 && <span className="ml-2 rounded-full bg-bento-sky px-1.5 py-px text-bento-sky-ink">{u.due} due</span>}
                    </span>
                    <span className={u.pct === 100 ? 'font-semibold text-bento-mint-ink' : 'text-bento-ink'}>{u.pct}%</span>
                  </span>
                  <span className="mt-1.5 block h-1 overflow-hidden rounded-full bg-bento-soft">
                    <span className="block h-full rounded-full bg-bento-mint-ink" style={{ width: `${u.pct}%` }} />
                  </span>
                </span>
                <ArrowRight size={16} className="shrink-0 text-bento-line transition-colors group-hover:text-bento-ink" aria-hidden />
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function Home({ m, onStart }: { m: LabModel; onStart: (s: Stage) => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === 'INPUT' || el.tagName === 'BUTTON' || el.tagName === 'A')) return;
      if (e.key === 'Enter' && m.next) onStart(m.next.stage);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [m.next, onStart]);

  const hour = new Date(m.now).getHours();
  const hello = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-[72px] sm:px-6">
      <Header m={m} />
      <h1 className="mt-8 text-[34px] font-semibold leading-tight tracking-[-0.03em] sm:text-[40px]">
        {hello}.<span className="text-bento-mute"> {m.today < DAILY_GOAL ? `${DAILY_GOAL - m.today} words to today's goal.` : 'Today’s goal is done.'}</span>
      </h1>
      <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-6">
        <ContinueTile m={m} onStart={onStart} />
        <QuickWord m={m} />
        <GoalTile m={m} />
        <MasteryTile m={m} />
        <ReviewTile m={m} onStart={onStart} />
        <UnitsTile m={m} onStart={onStart} />
      </div>
      {m.demo && <p className="mt-6 text-[12px] text-bento-mute">Demo progress on the real {m.book.title} word list. The daily goal and streak are concept features.</p>}
    </div>
  );
}

const TONE = {
  exact: 'bg-bento-mint text-bento-mint-ink',
  partial: 'bg-bento-sun text-bento-sun-ink',
  wrong: 'bg-bento-rose text-bento-rose-ink',
  missing: 'bg-white text-bento-ink ring-1 ring-bento-line',
  extra: '',
};

function QuizScreen({ m, stage, onHome, onStart }: { m: LabModel; stage: Stage; onHome: () => void; onStart: (s: Stage) => void }) {
  const q = useLabQuiz(stage);
  const fb = q.feedback;
  const review = q.phase.kind === 'review' ? q.phase : null;
  const [value, setValue] = useState('');
  const [composing, setComposing] = useState(false);
  const ordered = m.units.flatMap((u) => u.stages);
  const after = ordered[ordered.findIndex((s) => s.key === stage.key) + 1] ?? null;
  const label = stage.unit === 'review' ? 'Review' : `${stage.unit} · ${stageName(stage)}`;

  if (q.phase.kind === 'done') {
    const share = Math.round((q.firstTry / q.total) * 100);
    return (
      <div className="mx-auto max-w-xl px-4 pb-16 pt-[96px]">
        <div className={`${tile} anim-rise p-8`}>
          <p className="text-[14px] font-semibold text-bento-mint-ink">Stage complete</p>
          <h1 className="mt-2 text-[34px] font-semibold leading-tight tracking-[-0.03em]">{label}: every word spelled right.</h1>
          <dl className="mt-8 grid grid-cols-3 gap-3">
            {[
              { k: 'First try', v: `${share}%`, c: 'bg-bento-mint text-bento-mint-ink' },
              { k: 'Best streak', v: q.best, c: 'bg-bento-sun text-bento-sun-ink' },
              { k: 'Points', v: `+${q.xp}`, c: 'bg-bento-lilac text-bento-lilac-ink' },
            ].map((s) => (
              <div key={s.k} className={`rounded-lg p-4 ${s.c}`}>
                <dt className="text-[12px] font-medium">{s.k}</dt>
                <dd className="tabular mt-1 text-[26px] font-semibold text-bento-ink">{s.v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-8 flex flex-wrap gap-2">
            {after && (
              <button type="button" onClick={() => onStart(after)} className="press flex h-11 items-center gap-2 rounded-md bg-bento-ink px-5 text-[14px] font-semibold text-white hover:bg-bento-ink-2">
                Next stage <ArrowRight size={15} aria-hidden />
              </button>
            )}
            <button type="button" onClick={onHome} className="press h-11 rounded-md border border-bento-line bg-white px-5 text-[14px] font-semibold hover:bg-bento-soft">
              Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const w = q.current!;
  const p = promptOf(w, m.lang);
  const bad = fb && (fb.kind === 'wrong' || fb.kind === 'retype-wrong' || fb.kind === 'ime');
  const submit = () => {
    if (composing) return;
    if (q.submit(value)) setValue('');
  };

  return (
    <div className="mx-auto flex min-h-dvh max-w-xl flex-col px-4 pb-10 pt-[84px]">
      <div className={`${tile} relative overflow-hidden`}>
        <div className="h-0.5 bg-bento-soft" role="progressbar" aria-valuenow={q.cleared} aria-valuemax={q.total} aria-label="Words cleared">
          <div className="h-full bg-bento-ink transition-[width] duration-500 ease-out" style={{ width: `${(q.cleared / q.total) * 100}%` }} />
        </div>
        <div className="flex items-center gap-3 px-6 pt-5 text-[13px] text-bento-mute">
          <button type="button" onClick={onHome} className="hover:text-bento-ink">
            ← {label}
          </button>
          <span
            key={q.combo >= 2 ? fb?.id : 'none'}
            className={`ml-auto rounded-full px-2.5 py-1 text-[12px] font-semibold transition-colors ${
              fb?.milestone ? 'anim-bump bg-bento-lilac text-bento-lilac-ink' : q.combo >= 2 ? 'anim-pop bg-bento-sun text-bento-sun-ink' : 'invisible'
            }`}
            aria-live="polite"
          >
            {fb?.milestone ? `${q.combo} in a row` : `${q.combo} streak`}
          </span>
          <span className="tabular font-bento-mono text-[12px]">
            {q.cleared}/{q.total}
          </span>
        </div>

        <div className="px-6 pb-6 pt-10 sm:px-8">
          <div key={review ? 'review' : w.ko} className="anim-rise" data-answer={firstForm(w.ko)}>
            <p lang={p.mainLang} className="text-[36px] font-semibold leading-[1.1] tracking-[-0.025em] balance sm:text-[42px]">
              {p.main}
            </p>
            {p.rest.length > 0 && (
              <p className="mt-2 flex flex-wrap gap-x-4 text-[16px] text-bento-mute">
                {p.rest.map((r) => (
                  <span key={r.lang} lang={r.lang}>
                    {r.text}
                  </span>
                ))}
              </p>
            )}
          </div>

          {review && (
            <div className="anim-rise mt-6 rounded-lg bg-bento-rose/60 p-4">
              <p className="text-[13px] font-medium text-bento-rose-ink">{review.skipped ? 'The answer. Type it once to continue.' : 'Not quite. Retype the spelling to continue.'}</p>
              <div className="mt-3">
                <DiffWord result={review.result} tone={TONE} cellClass="grid h-12 min-w-11 place-items-center rounded-md px-2 font-bento-ko text-[26px] font-bold leading-none" />
              </div>
            </div>
          )}

          <div key={bad ? fb!.id : 'calm'} className={`mt-8 ${bad ? 'anim-shake' : ''}`}>
            <input
              autoFocus
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onCompositionStart={() => setComposing(true)}
              onCompositionEnd={() => setComposing(false)}
              onKeyDown={(e) => {
                if (composing || e.nativeEvent.isComposing || e.keyCode === 229) return;
                if (e.key === 'Enter') {
                  e.preventDefault();
                  submit();
                } else if (e.key === 'Escape') {
                  e.preventDefault();
                  q.skip();
                }
              }}
              lang="ko"
              autoComplete="off"
              spellCheck={false}
              enterKeyHint="done"
              aria-label="Your answer in Korean"
              placeholder="한국어"
              className={`h-14 w-full border-b-2 bg-transparent font-bento-ko text-[28px] font-bold outline-none transition-colors placeholder:text-bento-line ${
                review ? 'border-bento-rose-ink/60' : 'border-bento-line focus:border-bento-ink'
              }`}
            />
          </div>
          <div className="mt-3 flex min-h-6 items-center gap-3 text-[12px] text-bento-mute">
            {fb?.kind === 'ime' ? (
              <span className="text-bento-sun-ink">Switch the keyboard to Korean (한국어).</span>
            ) : fb && (fb.kind === 'right' || fb.kind === 'relearned') ? (
              <span key={fb.id} className="anim-pop flex items-center gap-1.5 rounded-full bg-bento-mint px-2 py-0.5 text-bento-mint-ink">
                <Check size={12} strokeWidth={3} aria-hidden />
                <span lang="ko" className="font-bento-ko font-bold">
                  {firstForm(fb.word.ko)}
                </span>
                <span className="tabular">+{fb.gained}</span>
              </span>
            ) : null}
            <span className="ml-auto hidden items-center gap-1.5 sm:flex">
              <kbd className={kbd}>↵</kbd> check
              <kbd className={`${kbd} ml-2`}>esc</kbd> don&rsquo;t know
            </span>
          </div>
          <div className="mt-6 flex gap-2 sm:hidden">
            <button type="button" onClick={q.skip} disabled={!!review} className="press h-12 flex-1 rounded-md border border-bento-line bg-white text-[14px] font-semibold disabled:opacity-40">
              Don&rsquo;t know
            </button>
            <button type="button" onClick={submit} className="press h-12 flex-1 rounded-md bg-bento-ink text-[14px] font-semibold text-white">
              Check
            </button>
          </div>
        </div>
      </div>
      <p className="mt-4 text-center text-[12px] text-bento-mute">Round {q.round} · missed words come back at the end</p>
    </div>
  );
}

export function BentoConcept({ m, screen, onStart, onHome }: ConceptProps) {
  return (
    <div className="min-h-dvh bg-bento-bg font-bento text-bento-ink">
      {screen.kind === 'home' ? <Home m={m} onStart={onStart} /> : <QuizScreen m={m} stage={screen.stage} onHome={onHome} onStart={onStart} />}
    </div>
  );
}
