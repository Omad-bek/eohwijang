import { useState } from 'react';
import { ArrowRight, Check, Eye, Languages, RotateCcw, X } from 'lucide-react';
import type { Stage } from '../types';
import type { ConceptProps } from './Lab';
import { DAILY_GOAL, firstForm, LANG_LABEL, PROMPT_LANGS, promptOf, stageName, type LabModel, type UnitInfo } from './model';
import { useLabQuiz } from './quiz';
import { Burst, DiffWord, jamoOf, useAnswerField } from './ui';

/**
 * Concept 3: Modern Korean. 한지 paper, 오방색-derived accents (cobalt, persimmon, yellow, mint),
 * and the Korean word itself as the centerpiece in heavy display type. Home is three steps in
 * order, one open at a time; the quiz is one word per screen with a 도장 stamp for combos.
 */

const ORDINAL = ['하나', '둘', '셋'];
const SLOT = {
  cho: 'bg-hj-blue text-white',
  jung: 'bg-hj-red text-white',
  jong: 'bg-hj-yellow text-hj-ink',
};

function Header({ m }: { m: LabModel }) {
  return (
    <header className="flex items-center gap-3">
      <span className="font-hj-display text-[26px] leading-none">어휘장</span>
      <div className="flex gap-1">
        {m.books.map((b) => (
          <button
            key={b.id}
            type="button"
            onClick={() => m.chooseBook(b.id)}
            aria-pressed={b.id === m.book.id}
            className={`press h-8 rounded-lg px-2.5 text-[13px] font-bold ${b.id === m.book.id ? 'bg-hj-ink text-hj-paper' : 'text-hj-mute hover:bg-hj-line/60'}`}
          >
            {b.title}
          </button>
        ))}
      </div>
      <span className="ml-auto flex items-center gap-1.5 rounded-full bg-hj-card px-2.5 py-1.5 text-[13px] font-bold ring-1 ring-hj-line sm:gap-2 sm:px-3" title={`${m.streak}-day streak · ${m.today} of ${DAILY_GOAL} words today`}>
        <span className="size-2 rounded-full bg-hj-red" aria-hidden />
        <span className="tabular whitespace-nowrap">{m.streak}일 연속</span>
        <span className="text-hj-mute" aria-hidden>·</span>
        <span className="tabular text-hj-mute">
          {m.today}/{DAILY_GOAL}
        </span>
      </span>
      <button
        type="button"
        onClick={() => m.setLang(PROMPT_LANGS[(PROMPT_LANGS.indexOf(m.lang) + 1) % PROMPT_LANGS.length])}
        className="press flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[13px] font-bold text-hj-mute ring-1 ring-hj-line hover:text-hj-ink"
        title="Prompt language"
      >
        <Languages size={15} aria-hidden />
        {LANG_LABEL[m.lang]}
      </button>
    </header>
  );
}

/** The word of the day as the page's centerpiece, with its syllables broken into jamo tiles. */
function Centerpiece({ m, revealed, onReveal }: { m: LabModel; revealed: boolean; onReveal: () => void }) {
  const w = m.wordOfDay;
  if (!w) return null;
  const ko = firstForm(w.ko);
  const p = promptOf(w, m.lang === 'all' ? 'uz' : m.lang);
  const syllables = jamoOf(ko);
  const size = ko.length <= 2 ? 'text-[clamp(104px,30vw,220px)]' : ko.length <= 4 ? 'text-[clamp(84px,20vw,176px)]' : 'text-[clamp(60px,13vw,128px)]';
  return (
    <section aria-labelledby="hj-wotd" className="relative isolate pt-6 text-center">
      <span aria-hidden className="anim-drift absolute left-[6%] top-[18%] -z-10 size-24 rounded-full bg-hj-yellow sm:size-36" />
      <span aria-hidden className="anim-drift absolute right-[8%] top-[8%] -z-10 size-16 rotate-12 rounded-2xl bg-hj-blue/85 sm:size-24" style={{ animationDelay: '-3s' }} />
      <span aria-hidden className="anim-drift absolute left-[10%] top-[44%] -z-10 h-7 w-16 rotate-[-8deg] rounded-full bg-hj-pink sm:left-[22%] sm:top-[40%] sm:h-10 sm:w-28" style={{ animationDelay: '-6s' }} />
      <h2 id="hj-wotd" className="text-[14px] font-bold text-hj-mute">
        오늘의 단어 · today&rsquo;s word
      </h2>
      <p lang="ko" className={`mt-2 font-hj-display leading-[0.95] tracking-[-0.02em] ${size}`}>
        {ko}
      </p>
      <ul className="mt-5 flex flex-wrap justify-center gap-3" aria-label="Jamo">
        {syllables.map(({ ch, j }, i) => (
          <li key={i} className="anim-rise flex gap-1 rounded-2xl bg-hj-card p-1.5 shadow-[0_2px_0_var(--color-hj-line)] ring-1 ring-hj-line" style={{ ['--i' as string]: i + 2 }} title={ch}>
            {(['cho', 'jung', 'jong'] as const)
              .filter((s) => j![s])
              .map((s) => (
                <span key={s} className={`grid size-9 place-items-center rounded-xl text-[19px] font-extrabold ${SLOT[s]}`}>
                  {j![s]}
                </span>
              ))}
          </li>
        ))}
      </ul>
      <div className="mt-6 flex min-h-[64px] items-start justify-center">
        {revealed ? (
          <p className="anim-pop max-w-md text-[22px] font-bold leading-snug balance">
            <span lang={p.mainLang}>{p.main}</span>
            {(['uz', 'ru', 'en'] as const)
              .filter((l) => l !== p.mainLang && w[l])
              .map((l) => (
                <span key={l} lang={l} className="ml-3 text-[16px] font-semibold text-hj-mute">
                  {w[l]}
                </span>
              ))}
          </p>
        ) : (
          <button type="button" onClick={onReveal} className="press flex h-12 items-center gap-2 rounded-full bg-hj-ink px-6 text-[15px] font-bold text-hj-paper hover:bg-hj-blue">
            <Eye size={18} aria-hidden />
            What does it mean?
          </button>
        )}
      </div>
    </section>
  );
}

function Step({
  n,
  title,
  open,
  done,
  onOpen,
  children,
  aside,
}: {
  n: number;
  title: string;
  open: boolean;
  done: boolean;
  onOpen: () => void;
  children?: React.ReactNode;
  aside?: React.ReactNode;
}) {
  return (
    <li
      className={`anim-rise rounded-[22px] transition-[background-color,box-shadow] duration-300 ${
        open ? 'bg-hj-card p-5 shadow-[0_3px_0_var(--color-hj-line)] ring-1 ring-hj-line sm:p-6' : 'px-5 py-2 hover:bg-hj-card/60'
      }`}
      style={{ ['--i' as string]: n }}
      aria-current={open ? 'step' : undefined}
    >
      <div className="flex items-center gap-3">
        <button type="button" onClick={onOpen} disabled={open} aria-expanded={open} className="flex min-h-11 min-w-0 flex-1 items-center gap-3 text-left disabled:cursor-default">
          <span
            className={`grid h-8 min-w-12 shrink-0 place-items-center rounded-full px-2 text-[13px] font-extrabold ${
              done ? 'bg-hj-mint-wash text-hj-mint-ink' : open ? 'bg-hj-red text-white' : 'bg-hj-line/70 text-hj-mute'
            }`}
          >
            {done ? <Check size={16} strokeWidth={3} aria-label="done" /> : ORDINAL[n - 1]}
          </span>
          <h3 className={`truncate text-[17px] font-bold ${open ? '' : 'text-hj-mute'}`}>{title}</h3>
        </button>
        {aside && <span className="shrink-0">{aside}</span>}
      </div>
      {open && children && <div className="mt-4">{children}</div>}
    </li>
  );
}

function Badges({ m, onStart }: { m: LabModel; onStart: (s: Stage) => void }) {
  const tones = ['bg-hj-blue text-white', 'bg-hj-red text-white', 'bg-hj-yellow text-hj-ink', 'bg-hj-mint text-hj-ink', 'bg-hj-pink text-hj-ink'];
  const pick = (u: UnitInfo) => u.stages[u.stats.findIndex((s, j) => s.learned < u.stages[j].words.length)] ?? u.stages[0];
  return (
    <section aria-labelledby="hj-badges" className="mt-14">
      <h2 id="hj-badges" className="text-center text-[14px] font-bold text-hj-mute">
        {m.book.title} 배지 · unit badges
      </h2>
      <ul className="mt-5 flex flex-wrap justify-center gap-4">
        {m.units.map((u, i) => {
          const done = u.pct === 100;
          const current = m.next?.unit.unit === u.unit;
          const tilt = i % 2 ? 'rotate-3' : '-rotate-3';
          return (
            <li key={u.unit} className="anim-pop" style={{ animationDelay: `${120 + i * 50}ms` }}>
              <button
                type="button"
                onClick={() => onStart(pick(u))}
                className={`group relative grid size-[88px] place-items-center rounded-[26px] transition-transform duration-300 ease-[var(--ease-spring)] hover:-translate-y-1 hover:rotate-0 ${tilt} ${
                  done ? `${tones[i % tones.length]} shadow-[0_4px_0_rgb(0_0_0/0.16)]` : current ? 'bg-hj-card shadow-[0_4px_0_var(--color-hj-ink)] ring-2 ring-hj-ink' : 'bg-hj-card ring-1 ring-hj-line'
                }`}
                aria-label={`${u.unit}: ${done ? 'complete' : `${u.pct}%`}`}
              >
                <span className="font-hj-display text-[26px] leading-none">{u.unit}</span>
                <span className={`tabular absolute bottom-2.5 text-[11px] font-extrabold ${done ? '' : 'text-hj-mute'}`}>{done ? '완료' : `${u.pct}%`}</span>
                {!done && u.pct > 0 && (
                  <span aria-hidden className="absolute inset-x-4 bottom-1.5 h-1 overflow-hidden rounded-full bg-hj-line">
                    <span className="block h-full rounded-full bg-hj-red" style={{ width: `${u.pct}%` }} />
                  </span>
                )}
                {current && <span aria-hidden className="absolute -right-1 -top-1 size-4 animate-ping rounded-full bg-hj-red/60 motion-reduce:animate-none" />}
                {current && <span aria-hidden className="absolute -right-1 -top-1 size-4 rounded-full bg-hj-red ring-2 ring-hj-paper" />}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function Home({ m, onStart }: { m: LabModel; onStart: (s: Stage) => void }) {
  const [revealed, setRevealed] = useState(false);
  const next = m.next;
  const steps = [
    { title: 'Meet today’s word', done: revealed },
    { title: next ? `Continue ${next.unit.unit} · ${stageName(next.stage)}` : 'Continue', done: false },
    { title: m.review ? `Review ${m.review.words.length} words` : 'Review', done: !m.review },
  ];
  const [chosen, setChosen] = useState<number | null>(null);
  const open = chosen ?? steps.findIndex((s) => !s.done);

  return (
    <div className="mx-auto max-w-3xl px-4 pb-20 pt-[72px] sm:px-6">
      <Header m={m} />
      <Centerpiece
        m={m}
        revealed={revealed}
        onReveal={() => {
          setRevealed(true);
          setChosen(null);
        }}
      />

      <ol className="mx-auto mt-10 max-w-xl space-y-2" aria-label="Today, step by step">
        <Step n={1} title={steps[0].title} open={open === 0} done={steps[0].done} onOpen={() => setChosen(0)}>
          <p className="text-[15px] text-hj-mute">Look at the word above and guess before you reveal it. Each tile is one jamo: blue starts the syllable, red is the vowel, yellow is the 받침.</p>
        </Step>
        <Step
          n={2}
          title={steps[1].title}
          open={open === 1}
          done={false}
          onOpen={() => setChosen(1)}
          aside={
            next && open !== 1 ? (
              <button type="button" onClick={() => onStart(next.stage)} className="press flex h-9 items-center gap-1 rounded-full bg-hj-blue px-3.5 text-[13px] font-extrabold text-white hover:brightness-110">
                시작 <ArrowRight size={14} strokeWidth={3} aria-hidden />
              </button>
            ) : null
          }
        >
          {next && (
            <>
              <p className="flex flex-wrap gap-2" aria-label="Words in this stage">
                {next.stage.words.slice(0, 6).map((w) => (
                  <span key={w.ko} lang="ko" className="rounded-lg bg-hj-paper px-2.5 py-1 font-hj-display text-[18px] leading-tight">
                    {firstForm(w.ko)}
                  </span>
                ))}
              </p>
              <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-hj-paper">
                <div className="h-full rounded-full bg-hj-blue transition-[width] duration-700" style={{ width: `${(next.stats.learned / next.stage.words.length) * 100}%` }} />
              </div>
              <p className="tabular mt-2 text-[13px] font-semibold text-hj-mute">
                {next.stats.learned} of {next.stage.words.length} words learned
              </p>
              <button
                type="button"
                onClick={() => onStart(next.stage)}
                className="press mt-5 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-hj-blue text-[17px] font-extrabold text-white shadow-[0_4px_0_#2238b0] hover:brightness-110 active:translate-y-0.5 active:shadow-[0_2px_0_#2238b0]"
              >
                시작 · Start
                <ArrowRight size={20} strokeWidth={2.75} aria-hidden />
              </button>
            </>
          )}
        </Step>
        <Step n={3} title={steps[2].title} open={open === 2} done={steps[2].done} onOpen={() => setChosen(2)} aside={m.review && open !== 2 ? <span className="rounded-full bg-hj-yellow-wash px-2 py-0.5 text-[12px] font-bold">{m.review.words.length}</span> : null}>
          {m.review && (
            <button type="button" onClick={() => onStart(m.review!)} className="press flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-hj-yellow text-[16px] font-extrabold text-hj-ink">
              <RotateCcw size={18} aria-hidden />
              복습 · Review
            </button>
          )}
        </Step>
      </ol>
      {open === 1 && m.review && (
        <p className="mx-auto mt-3 max-w-xl px-5 text-[13px] text-hj-mute">Then {m.review.words.length} words are waiting to level up.</p>
      )}

      <Badges m={m} onStart={onStart} />
      {m.demo && <p className="mt-10 text-center text-[12px] text-hj-mute">Demo progress on the real {m.book.title} word list. Streak and daily goal are concept features.</p>}
    </div>
  );
}

const TONE = {
  exact: 'bg-hj-mint-wash text-hj-mint-ink',
  partial: 'bg-hj-yellow-wash text-hj-ink',
  wrong: 'bg-hj-red-wash text-hj-red-ink',
  missing: 'bg-hj-card text-hj-ink ring-1 ring-hj-line',
  extra: '',
};

function QuizScreen({ m, stage, onHome, onStart }: { m: LabModel; stage: Stage; onHome: () => void; onStart: (s: Stage) => void }) {
  const q = useLabQuiz(stage);
  const field = useAnswerField(q);
  const fb = q.feedback;
  const review = q.phase.kind === 'review' ? q.phase : null;
  const ordered = m.units.flatMap((u) => u.stages);
  const after = ordered[ordered.findIndex((s) => s.key === stage.key) + 1] ?? null;
  const label = stage.unit === 'review' ? '복습 · Review' : `${stage.unit} · ${stageName(stage)}`;

  if (q.phase.kind === 'done') {
    return (
      <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center px-5 pb-10 pt-[96px] text-center">
        <span className="anim-stamp relative grid size-36 place-items-center rounded-[18px] bg-hj-red font-hj-display text-[44px] leading-none text-white shadow-[0_0_0_4px_var(--color-hj-paper),0_0_0_6px_var(--color-hj-red)]">
          완료
          <Burst colors={['#3653e8', '#ffcf3d', '#5fcea5', '#ff9ec4']} count={14} radius={120} />
        </span>
        <h1 className="mt-10 text-[30px] font-extrabold leading-tight">{label}</h1>
        <p className="mt-2 text-[16px] font-semibold text-hj-mute">Every word, spelled exactly right.</p>
        <dl className="mt-8 flex w-full justify-center gap-6">
          <div>
            <dt className="text-[12px] font-bold text-hj-mute">first try</dt>
            <dd className="tabular font-hj-display text-[40px] leading-none">{Math.round((q.firstTry / q.total) * 100)}%</dd>
          </div>
          <div>
            <dt className="text-[12px] font-bold text-hj-mute">best combo</dt>
            <dd className="tabular font-hj-display text-[40px] leading-none text-hj-red">{q.best}</dd>
          </div>
        </dl>
        <div className="mt-auto grid w-full gap-3 pt-10">
          {after && (
            <button type="button" onClick={() => onStart(after)} className="press h-14 rounded-2xl bg-hj-blue text-[17px] font-extrabold text-white shadow-[0_4px_0_#2238b0]">
              다음 · Next stage
            </button>
          )}
          <button type="button" onClick={onHome} className="press h-12 rounded-2xl text-[15px] font-bold text-hj-mute ring-1 ring-hj-line hover:text-hj-ink">
            Home
          </button>
        </div>
      </div>
    );
  }

  const w = q.current!;
  const p = promptOf(w, m.lang);
  const bad = fb && (fb.kind === 'wrong' || fb.kind === 'retype-wrong' || fb.kind === 'ime');
  const dots = Math.min(q.total, 30);

  return (
    <div className="mx-auto flex min-h-dvh max-w-2xl flex-col px-4 pb-8 pt-[72px] sm:px-6">
      <div className="flex items-center gap-3">
        <button type="button" onClick={onHome} className="press grid size-10 shrink-0 place-items-center rounded-xl text-hj-mute ring-1 ring-hj-line hover:text-hj-ink" aria-label="Quit to home">
          <X size={20} strokeWidth={2.5} />
        </button>
        <ol className="flex flex-1 flex-wrap gap-1" aria-label={`${q.cleared} of ${q.total} words cleared`}>
          {Array.from({ length: dots }, (_, i) => {
            const filled = i < Math.round((q.cleared / q.total) * dots);
            return <li key={i} className={`h-2 flex-1 rounded-full transition-colors duration-300 ${filled ? 'bg-hj-ink' : 'bg-hj-line'}`} />;
          })}
        </ol>
        <span className="tabular min-w-[56px] text-right text-[13px] font-bold text-hj-mute">
          {q.cleared}/{q.total}
        </span>
      </div>

      <div className="relative flex flex-1 flex-col items-center justify-center py-8 text-center">
        <div className="absolute right-0 top-2" aria-live="polite">
          {q.combo >= 2 && (
            <span key={fb?.id} className={`relative grid size-[76px] place-items-center rounded-[16px] font-hj-display leading-none text-white ${fb?.milestone ? 'anim-stamp bg-hj-red' : 'anim-bump bg-hj-ink'}`}>
              <span className="text-[13px]">콤보</span>
              <span className="tabular text-[30px]">{q.combo}</span>
              {fb?.milestone && <Burst colors={['#ffcf3d', '#3653e8', '#5fcea5']} radius={64} />}
            </span>
          )}
        </div>
        {fb?.milestone && (
          <p key={`milestone-${fb.id}`} className="anim-float pointer-events-none absolute left-0 top-4 font-hj-display text-[26px] text-hj-red">
            잘했어요
          </p>
        )}
        <p className="text-[13px] font-bold text-hj-mute">{label}</p>
        <div key={review ? 'review' : w.ko} className="anim-rise mt-5" data-answer={firstForm(w.ko)}>
          <p lang={p.mainLang} className="text-[40px] font-extrabold leading-[1.08] tracking-[-0.02em] balance sm:text-[52px]">
            {p.main}
          </p>
          {p.rest.length > 0 && (
            <p className="mt-3 flex flex-wrap justify-center gap-x-4 text-[17px] font-semibold text-hj-mute">
              {p.rest.map((r) => (
                <span key={r.lang} lang={r.lang}>
                  {r.text}
                </span>
              ))}
            </p>
          )}
        </div>
        {review && (
          <div className="anim-rise mt-7">
            <p className="text-[14px] font-bold text-hj-red-ink">{review.skipped ? '정답 · type it once to continue' : '거의! · almost, retype it'}</p>
            <div className="mt-3">
              <DiffWord result={review.result} tone={TONE} cellClass="grid h-16 min-w-14 place-items-center rounded-2xl px-2 font-hj-display text-[36px] leading-none shadow-[0_3px_0_var(--color-hj-line)]" />
            </div>
          </div>
        )}
        {fb && (fb.kind === 'right' || fb.kind === 'relearned') && !review && (
          <p key={`right-${fb.id}`} className="anim-float pointer-events-none mt-6 flex items-center gap-2 rounded-full bg-hj-mint-wash px-4 py-1.5 font-hj-display text-[22px] text-hj-mint-ink" aria-hidden>
            <Check size={18} strokeWidth={3} /> {firstForm(fb.word.ko)}
          </p>
        )}
      </div>

      <div className="mx-auto w-full max-w-md">
        {fb?.kind === 'ime' && <p className="mb-2 text-center text-[14px] font-bold text-hj-red-ink">한국어 키보드로 바꿔 주세요 · switch to a Korean keyboard</p>}
        <div key={bad ? fb!.id : 'calm'} className={bad ? 'anim-shake' : ''}>
          <input
            {...field.props}
            aria-label="Your answer in Korean"
            placeholder="여기에 쓰세요"
            className={`h-20 w-full rounded-none border-b-4 bg-transparent text-center font-hj-display text-[44px] outline-none transition-colors placeholder:text-[28px] placeholder:text-hj-line ${
              review ? 'border-hj-red' : 'border-hj-ink/80 focus:border-hj-blue'
            }`}
          />
        </div>
        <div className="mt-6 flex gap-3">
          <button type="button" onClick={q.skip} disabled={!!review} className="press h-14 flex-1 rounded-2xl text-[15px] font-bold text-hj-mute ring-1 ring-hj-line hover:text-hj-ink disabled:opacity-40">
            몰라요 · Don&rsquo;t know
          </button>
          <button
            type="button"
            onClick={field.check}
            disabled={!field.value.trim()}
            className="press h-14 flex-1 rounded-2xl bg-hj-ink text-[16px] font-extrabold text-hj-paper shadow-[0_4px_0_rgb(0_0_0/0.25)] active:translate-y-0.5 disabled:opacity-40"
          >
            확인 · Check
          </button>
        </div>
      </div>
    </div>
  );
}

export function HangulConcept({ m, screen, onStart, onHome }: ConceptProps) {
  return (
    <div className="min-h-dvh overflow-x-clip bg-hj-paper font-hj text-hj-ink">
      {screen.kind === 'home' ? <Home m={m} onStart={onStart} /> : <QuizScreen m={m} stage={screen.stage} onHome={onHome} onStart={onStart} />}
    </div>
  );
}
