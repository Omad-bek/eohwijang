/**
 * Welcome, variant A, "Playground": a full-height hero full of drifting jamo, glossy orbs and
 * sparkles that lean with the pointer, and a playable word block right under the headline
 * (tap ㅎ + ㅗ = 호, then ㅈ + ㅜ = 주, and 호주 lands). Below: benefit cards that tilt, a three-beat
 * round, a short "Our story" with the GitHub link, and a green closing panel. App.tsx shows it to
 * new learners on / and to everyone on /about; the design lab still previews it at
 * #design-lab/welcome/a. The install button is hidden until the install flow is ready.
 *
 * Every claim about which books exist and whether words have sentences comes from `coverage`,
 * i.e. from the shared word lists themselves, never from hardcoded copy.
 */
import { useEffect, type CSSProperties } from 'react';
import { ArrowDown, ArrowRight, ArrowUpRight, BookOpen, Check, Download, Flame, Github, Moon, Plus, RotateCcw, Sparkle, Volume2 } from 'lucide-react';
import { DiffView } from '../../components/DiffView';
import { Seal } from '../../components/Seal';
import { BUILT_IN_BOOKS } from '../../lib/books';
import { useReveal } from '../../lib/hooks';
import { STRINGS } from '../../lib/i18n';
import { FEEDBACK_URL, dropPrerender, hrefFor } from '../../lib/route';
import { diffSyllables } from '../../utils/hangulDiff';
import { DUBEOLSIK, DUBEOLSIK_ROWS } from '../../utils/hangulInput';
import {
  BENEFITS,
  DEMO_STREAK,
  DEMO_WORD,
  DISCLAIMER,
  GITHUB_URL,
  HERO,
  ICON_SRC,
  STORY,
  coverageCopy,
  coverageOf,
  type Coverage,
  useJamoDemo,
  useParallax,
  useTilt,
} from './content';
import { Burst, JamoField, Orb, Sparkles } from './fx';

/* ---------- The playable word block ---------- */

function Playground() {
  const demo = useJamoDemo();
  return (
    <div className="relative mx-auto w-full max-w-[540px]">
      <div className="relative rounded-[32px] border-2 border-rule bg-ink-2/90 p-5 text-left shadow-[0_8px_0_var(--color-rule),0_40px_80px_-30px_rgba(20,60,40,0.45)] backdrop-blur-md sm:p-7">
        <div className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-1.5 rounded-full bg-gold px-3 py-1 text-[12px] font-black uppercase tracking-[0.12em] text-on-bright">
            <Sparkle size={13} className="fill-current" aria-hidden /> Try it now
          </span>
          <span className="flex gap-1.5" aria-label={`${demo.step} of ${demo.total} letters`}>
            {Array.from({ length: demo.total }, (_, i) => (
              <span key={i} className={`h-2 w-5 rounded-full transition-colors duration-300 ${i < demo.step ? 'bg-accent' : 'bg-rule'}`} />
            ))}
          </span>
        </div>

        <p className="mt-5 text-[14px] font-bold text-hanji-2">Build the Korean word for</p>
        <p className="mt-0.5 text-[30px] font-black leading-tight sm:text-[34px]">{DEMO_WORD.gloss.en}</p>
        <p className="text-[13px] font-semibold text-hanji-2">
          {DEMO_WORD.gloss.uz} · {DEMO_WORD.gloss.ru}
        </p>

        {/* The equation for the syllable in progress: ㅎ + ㅗ = 호 */}
        <div aria-hidden className="mt-5 flex h-9 items-center justify-center gap-2.5 font-serif text-[26px] leading-none">
          {demo.equation.parts.length === 0 ? (
            <span className="font-sans text-[13px] font-bold text-hanji-2">Letters snap together into syllables.</span>
          ) : (
            <>
              {demo.equation.parts.map((j, i) => (
                <span key={`${demo.step}-${i}`} className="flex items-center gap-2.5">
                  {i > 0 && <span className="font-sans text-[20px] font-black text-hanji-2">+</span>}
                  <span className="wl-pop text-accent-text">{j}</span>
                </span>
              ))}
              {demo.equation.result && (
                <>
                  <span className="font-sans text-[20px] font-black text-hanji-2">=</span>
                  <span key={demo.equation.result} className="wl-pop rounded-lg bg-gold/40 px-2 py-0.5">
                    {demo.equation.result}
                  </span>
                </>
              )}
            </>
          )}
        </div>

        <div className="mt-4 flex justify-center gap-3 sm:gap-4" aria-live="polite">
          {demo.syllables.map((s, i) => {
            const filled = s.length > 0;
            const complete = demo.done || i < demo.active;
            return (
              <div
                key={`${demo.round}-${i}`}
                className={`grid size-[92px] place-items-center rounded-[24px] font-serif text-[54px] leading-none transition-colors duration-300 sm:size-[108px] sm:text-[64px] ${
                  complete
                    ? 'bg-accent text-white shadow-[0_6px_0_var(--color-accent-lip)]'
                    : i === demo.active
                      ? 'border-[3px] border-dashed border-accent/60 bg-accent-wash text-accent-text'
                      : 'border-[3px] border-dashed border-rule bg-ink text-hanji-2'
                }`}
              >
                {filled && <span key={s} className="wl-pop">{s}</span>}
              </div>
            );
          })}
        </div>

        {!demo.done ? (
          <>
            <div className="mt-6 flex justify-center gap-2.5 sm:gap-3">
              {demo.tray.map(({ jamo, used }) => {
                const next = jamo === demo.next;
                return (
                  <span key={`${demo.round}-${jamo}`} className="relative">
                    {next && demo.step === 0 && (
                      <span aria-hidden className="absolute -inset-1.5 rounded-[22px] border-2 border-gold motion-safe:animate-pulse" />
                    )}
                    <button
                      type="button"
                      disabled={used}
                      onClick={() => demo.tap(jamo)}
                      aria-label={`Letter ${jamo}`}
                      className={`juicy relative grid size-[62px] place-items-center rounded-[18px] font-serif text-[32px] leading-none sm:size-[70px] sm:text-[36px] ${
                        used
                          ? 'border-2 border-dashed border-rule bg-transparent text-transparent shadow-none'
                          : 'border-2 border-rule bg-ink text-hanji shadow-[0_5px_0_var(--color-rule)] hover:border-accent/50'
                      } ${demo.miss === jamo ? 'wl-shake !border-danger text-danger-text' : ''}`}
                    >
                      {jamo}
                    </button>
                  </span>
                );
              })}
            </div>
            <p className="mt-4 text-center text-[13px] font-bold text-hanji-2">
              {demo.step === 0 ? (
                <>
                  Tap the letters in order. Start with <span className="font-serif text-[16px] text-accent-text">ㅎ</span>.
                </>
              ) : (
                <>
                  Nice. Now <span className="font-serif text-[16px] text-accent-text">{demo.next}</span>.
                </>
              )}
            </p>
          </>
        ) : (
          <div className="wl-pop mt-6 rounded-[22px] bg-accent-wash p-4 text-center sm:p-5">
            <p className="flex items-center justify-center gap-2 text-[15px] font-black text-accent-text">
              <Check size={18} strokeWidth={3} aria-hidden /> You just wrote your first Korean word.
            </p>
            <p className="mt-3 font-serif text-[22px] leading-snug">
              <span className="rounded-md bg-gold/40 px-1">{DEMO_WORD.ko}</span>
              {DEMO_WORD.example.ko.slice(DEMO_WORD.ko.length)}
            </p>
            <p className="text-[13px] font-semibold text-hanji-2">{DEMO_WORD.example.en}</p>
            <button type="button" onClick={demo.reset} className="press mx-auto mt-3 flex items-center gap-1.5 text-[13px] font-extrabold text-hanji-2 hover:text-hanji">
              <RotateCcw size={14} aria-hidden /> Play again
            </button>
          </div>
        )}
      </div>
      {demo.done && <Burst key={demo.round} />}
    </div>
  );
}

/* ---------- Benefit cards ---------- */

const TONE: Record<number, string> = {
  0: 'bg-accent-wash text-accent-text',
  1: 'bg-flame-wash text-flame-ink',
  2: 'bg-sky-wash text-sky',
  6: 'bg-indigo-wash text-indigo',
  7: 'bg-amber-wash text-amber',
};

/** The textbooks that have words today, each with its word count, and an open slot for the next. */
function LevelsVisual({ coverage }: { coverage: Coverage }) {
  return (
    <ul className="grid grid-cols-4 gap-1.5 sm:gap-2" aria-label="Textbooks available">
      {coverage.books.map((b) => (
        <li
          key={b.id}
          title={`${b.words} words in ${b.units} units`}
          className="flex h-14 flex-col items-center justify-center rounded-xl bg-accent text-white shadow-[0_4px_0_var(--color-accent-lip)]"
        >
          <span className="font-serif text-[17px] leading-none">{b.id}</span>
          <span className="tabular mt-1 text-[10px] font-extrabold leading-none text-white/80">{b.words} words</span>
        </li>
      ))}
      <li className="flex h-14 items-center justify-center rounded-xl border-2 border-dashed border-rule px-1 text-center text-[11px] font-extrabold leading-tight text-hanji-2">
        More soon
      </li>
    </ul>
  );
}

function StreakVisual() {
  return (
    <div className="rounded-2xl bg-ink p-4">
      <div className="flex items-center gap-3">
        <span className="grid size-11 place-items-center rounded-xl bg-flame text-on-bright shadow-[0_4px_0_var(--color-flame-lip)]">
          <Flame size={22} strokeWidth={2.4} className="anim-flicker" aria-hidden />
        </span>
        <span className="leading-tight">
          <span className="block text-[22px] font-black tabular">{DEMO_STREAK} days</span>
          <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-hanji-2">sample streak</span>
        </span>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5 text-[12px] font-bold text-hanji-2">
        <span className="flex items-center gap-1.5 rounded-full bg-ink-2 px-2.5 py-1">
          <Moon size={12} aria-hidden /> Dark mode
        </span>
        <span className="flex items-center gap-1.5 rounded-full bg-ink-2 px-2.5 py-1">
          <Volume2 size={12} aria-hidden /> Lo-Fi sounds
        </span>
      </div>
    </div>
  );
}

function SentenceVisual() {
  return (
    <p className="rounded-2xl bg-ink px-4 py-3">
      <span className="block font-serif text-[22px] leading-snug">
        <span className="wl-marker rounded-sm">{DEMO_WORD.ko}</span>
        {DEMO_WORD.example.ko.slice(DEMO_WORD.ko.length)}
      </span>
      <span className="text-[13px] font-semibold text-hanji-2">{DEMO_WORD.example.en}</span>
    </p>
  );
}

/** The app's own 두벌식 layout, with ㅎ and ㅗ lit as if 호 was just typed. */
const LIT = ['KeyG', 'KeyH'];

function KeyboardVisual() {
  return (
    <div aria-hidden className="rounded-[24px] bg-ink-3 p-3 sm:p-4">
      <div className="mb-3 flex items-center justify-between rounded-xl border-2 border-accent/50 bg-ink-2 px-4 py-2 lg:py-3">
        <span className="flex items-center font-serif text-[26px] leading-none text-accent-text">
          {DEMO_WORD.ko.slice(0, 1)}
          <span className="ml-0.5 h-6 w-[3px] rounded-full bg-accent motion-safe:animate-pulse" />
        </span>
        <span className="text-[11px] font-black uppercase tracking-[0.12em] text-hanji-2">
          <span className="font-serif text-[13px] normal-case tracking-normal">두벌식</span> · on screen
        </span>
      </div>
      {DUBEOLSIK_ROWS.map((row, r) => (
        <div key={r} className="mt-1.5 flex gap-1 sm:mt-2 sm:gap-1.5" style={{ paddingInline: `${r * 5}%` }}>
          {row.map((code) => (
            <span
              key={code}
              className={`grid h-10 flex-1 place-items-center rounded-lg font-serif text-[16px] leading-none sm:h-12 sm:rounded-xl sm:text-[20px] lg:h-[52px] lg:text-[21px] ${
                LIT.includes(code) ? 'bg-accent text-white shadow-[0_3px_0_var(--color-accent-lip)]' : 'bg-ink-2 text-hanji shadow-[0_3px_0_var(--color-rule)]'
              }`}
            >
              {DUBEOLSIK[code][0]}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

/** A custom deck, fanned: real 1A words a learner might group for themselves. */
const DECK = ['호주', '우유', '오이'];

function DeckVisual() {
  return (
    <div aria-hidden className="relative h-[168px]">
      <span className="absolute inset-x-6 top-0 h-[136px] rotate-[-5deg] rounded-[20px] border-2 border-rule bg-ink-3" />
      <span className="absolute inset-x-4 top-1 h-[136px] rotate-[3deg] rounded-[20px] border-2 border-rule bg-ink" />
      <div className="absolute inset-x-2 top-3 rounded-[20px] border-2 border-rule bg-ink-2 p-4 shadow-[0_5px_0_var(--color-rule)]">
        <div className="flex items-center justify-between">
          <span className="text-[14px] font-black">My words</span>
          <span className="rounded-full bg-amber-wash px-2 py-0.5 text-[11px] font-black text-amber">custom</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {DECK.map((w) => (
            <span key={w} className="rounded-xl bg-ink-3 px-3 py-1.5 font-serif text-[18px] leading-none">
              {w}
            </span>
          ))}
          <span className="flex items-center gap-1 rounded-xl border-2 border-dashed border-rule px-2.5 py-1 text-[12px] font-extrabold text-hanji-2">
            <Plus size={13} strokeWidth={3} /> Add
          </span>
        </div>
        <p className="mt-3 text-[11px] font-bold text-hanji-2">Paste a list or import .txt · .csv · .json</p>
      </div>
    </div>
  );
}

/** The app's own letter-by-letter check, on the misspelling from "Our story": 학셍 for 학생. */
const SLIP = diffSyllables('학셍', '학생');

function DiffVisual() {
  return (
    <div aria-hidden className="rounded-2xl bg-ink p-4">
      <DiffView t={STRINGS.en} cells={SLIP} />
    </div>
  );
}

const VISUAL: Record<number, (p: { coverage: Coverage }) => JSX.Element> = {
  0: LevelsVisual,
  1: StreakVisual,
  2: SentenceVisual,
  4: DiffVisual,
  6: KeyboardVisual,
  7: DeckVisual,
};

/** A big benefit card with its visual; `wide` sets text and visual side by side from lg up. `body` overrides the stock copy. */
function BenefitCard({
  i,
  n,
  coverage,
  body: bodyOverride,
  wide = false,
  className = '',
}: {
  i: number;
  n: number;
  coverage: Coverage;
  body?: string;
  wide?: boolean;
  className?: string;
}) {
  const { ref: revealRef, revealed } = useReveal<HTMLDivElement>();
  const tilt = useTilt<HTMLElement>(wide ? 3 : 6);
  const { icon: Icon, kicker, title, body: stockBody } = BENEFITS[i];
  const body = bodyOverride ?? stockBody;
  const Visual = VISUAL[i];
  return (
    <div ref={revealRef} style={{ '--i': n } as CSSProperties} className={`reveal ${className} ${revealed ? 'is-revealed' : ''}`}>
      <article
        ref={tilt}
        className={`flex h-full flex-col rounded-[30px] border-2 border-rule bg-ink-2 p-6 shadow-[0_6px_0_var(--color-rule)] transition-transform duration-300 ease-out sm:p-8 ${
          wide ? 'lg:flex-row lg:items-center lg:gap-8' : ''
        }`}
      >
        <div className={wide ? 'lg:w-[34%] lg:shrink-0' : ''}>
          <div className="flex items-center gap-3">
            <span className={`grid size-12 place-items-center rounded-2xl ${TONE[i]}`}>
              <Icon size={22} strokeWidth={2.4} aria-hidden />
            </span>
            <span className="text-[12px] font-black uppercase tracking-[0.14em] text-hanji-2">{kicker}</span>
          </div>
          <h3 className="mt-6 text-[26px] font-black leading-[1.1] tracking-[-0.02em] sm:text-[28px]">{title}</h3>
          <p className="mt-3 text-[16px] leading-relaxed text-hanji-2">{body}</p>
        </div>
        <div className={`mt-auto pt-8 ${wide ? 'lg:mt-0 lg:min-w-0 lg:flex-1 lg:pt-0' : ''}`}>
          <Visual coverage={coverage} />
        </div>
      </article>
    </div>
  );
}

function SmallBenefit({ i }: { i: number }) {
  const { ref, revealed } = useReveal<HTMLElement>();
  const { icon: Icon, title, body } = BENEFITS[i];
  return (
    <article ref={ref} style={{ '--i': i - 3 } as CSSProperties} className={`reveal flex gap-4 ${revealed ? 'is-revealed' : ''}`}>
      <span className="grid size-11 shrink-0 place-items-center rounded-2xl border-2 border-rule bg-ink-2 text-accent-text">
        <Icon size={20} strokeWidth={2.4} aria-hidden />
      </span>
      <div>
        <h3 className="text-[18px] font-black leading-tight">{title}</h3>
        <p className="mt-1.5 text-[15px] leading-relaxed text-hanji-2">{body}</p>
      </div>
    </article>
  );
}

/* ---------- A round, in three beats ---------- */

function Beats() {
  const { ref, revealed } = useReveal<HTMLOListElement>();
  const card = 'flex h-[132px] flex-col justify-center rounded-[24px] border-2 border-rule bg-ink-2 p-5 shadow-[0_5px_0_var(--color-rule)]';
  return (
    <ol ref={ref} className="grid gap-8 md:grid-cols-3 md:gap-6">
      {[
        {
          title: 'See it in your language',
          body: 'Pick Uzbek, Russian or English. Or all three.',
          visual: (
            <div className={card}>
              {[DEMO_WORD.gloss.uz, DEMO_WORD.gloss.ru, DEMO_WORD.gloss.en].map((g, k) => (
                <span key={g} className={k === 2 ? 'text-[22px] font-black leading-tight' : 'text-[14px] font-semibold text-hanji-2'}>
                  {g}
                </span>
              ))}
            </div>
          ),
        },
        {
          title: 'Type it from memory',
          body: 'No multiple choice. Recall is what makes it stick.',
          visual: (
            <div className={`${card} items-center`}>
              <span className="flex items-center rounded-2xl border-2 border-accent/60 bg-accent-wash px-5 py-2 font-serif text-[40px] leading-none text-accent-text">
                {DEMO_WORD.ko}
                <span aria-hidden className="ml-1 h-9 w-[3px] rounded-full bg-accent motion-safe:animate-pulse" />
              </span>
            </div>
          ),
        },
        {
          title: 'Every letter, checked',
          body: 'Right means spelled exactly right. Then the next word.',
          visual: (
            <div className={`${card} items-center`}>
              <span className="flex gap-2">
                {[...DEMO_WORD.ko].map((s) => (
                  <span key={s} className="relative grid size-16 place-items-center rounded-2xl bg-accent font-serif text-[36px] leading-none text-white shadow-[0_5px_0_var(--color-accent-lip)]">
                    {s}
                    <span className="absolute -right-1.5 -top-1.5 grid size-6 place-items-center rounded-full bg-gold text-on-bright">
                      <Check size={14} strokeWidth={3.4} aria-hidden />
                    </span>
                  </span>
                ))}
              </span>
            </div>
          ),
        },
      ].map((b, i) => (
        <li key={b.title} style={{ '--i': i } as CSSProperties} className={`reveal ${revealed ? 'is-revealed' : ''}`}>
          {b.visual}
          <p className="mt-5 flex items-baseline gap-3">
            <span className="text-[13px] font-black text-accent-text tabular">0{i + 1}</span>
            <span className="text-[19px] font-black leading-tight">{b.title}</span>
          </p>
          <p className="mt-1.5 pl-8 text-[15px] leading-relaxed text-hanji-2">{b.body}</p>
        </li>
      ))}
    </ol>
  );
}

/* ---------- Our story ---------- */

function Story() {
  const { ref, revealed } = useReveal<HTMLElement>();
  return (
    <section ref={ref} aria-labelledby="story-a" className={`reveal mx-auto max-w-3xl px-5 sm:px-8 ${revealed ? 'is-revealed' : ''}`}>
      <div className="relative rounded-[32px] border-2 border-rule bg-ink-2 p-7 sm:p-12">
        <span className="absolute -top-6 right-8 rotate-6">
          <Seal size={64} label="학생" />
        </span>
        <p className="text-[12px] font-black uppercase tracking-[0.16em] text-accent-text">{STORY.eyebrow}</p>
        <h2 id="story-a" className="mt-3 max-w-[20ch] text-[30px] font-black leading-[1.1] tracking-[-0.02em] sm:text-[38px]">
          {STORY.title}
        </h2>
        {STORY.body.map((p) => (
          <p key={p} className="mt-5 text-[17px] leading-relaxed text-hanji-2">
            {p}
          </p>
        ))}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-x-6 gap-y-4 border-t-2 border-rule-soft pt-6">
          <p className="flex items-center gap-3 text-[14px] font-bold">
            <img src={ICON_SRC} alt="" width={28} height={28} className="size-7" />
            {STORY.sign}
          </p>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            className="press group flex h-11 shrink-0 items-center gap-2 rounded-full bg-hanji pl-4 pr-3.5 text-[14px] font-extrabold text-ink shadow-[0_4px_0_var(--color-rule)] hover:opacity-90"
          >
            <Github size={17} strokeWidth={2.4} aria-hidden />
            View Source on GitHub
            <ArrowUpRight size={15} strokeWidth={2.6} className="opacity-70 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
          </a>
        </div>
      </div>
    </section>
  );
}

/* ---------- Page ---------- */

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}

const BUNDLED = coverageOf(BUILT_IN_BOOKS);

/**
 * `returning`: opened from the dashboard (/about), so the start buttons read as a way back.
 * `coverage`: the textbooks that really have words (App passes the shared lists; the lab and a
 * first offline visit fall back to the bundled ones).
 */
export default function WelcomeA({
  onStart,
  onFeedback,
  returning = false,
  coverage = BUNDLED,
}: {
  onStart?: () => void;
  /** Opens the feedback form; without it the footer links to GitHub. */
  onFeedback?: () => void;
  returning?: boolean;
  coverage?: Coverage;
}) {
  const cta = returning ? 'Back to learning' : HERO.cta;
  const hero = useParallax<HTMLElement>();
  const closer = useParallax<HTMLElement>();
  const copy = coverageCopy(coverage);
  // The third card promises example sentences only while most words have one; otherwise it shows the letter check.
  const third = copy.examples ? 2 : 4;
  const small = [3, 4, 5].filter((i) => i !== third);

  useEffect(dropPrerender, []);

  return (
    <div className="scroll-smooth-motion h-full overflow-y-auto overflow-x-hidden text-hanji">
      <section ref={hero} className="relative isolate flex min-h-full flex-col overflow-hidden">
        {/* Depth, back to front: a soft wash, orbs, letters, sparkles. */}
        <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_55%_at_50%_42%,var(--color-accent-wash),transparent_75%)]" />
        <div className="absolute inset-0 -z-10">
          <Orb tone="accent" className="-left-28 top-[46%] size-64 sm:-left-20 sm:size-[340px]" depth={0.5} dur={22} />
          <Orb tone="gold" className="-right-10 top-20 size-32 sm:right-[4%] sm:top-24 sm:size-44" depth={0.9} dur={17} />
          <Orb tone="sky" className="-right-16 bottom-[8%] size-40 sm:right-[6%] sm:size-52" depth={1.2} dur={24} />
          <Orb tone="flame" className="left-[10%] top-[10%] hidden size-28 sm:block" depth={1.5} dur={14} />
          <JamoField />
          <Sparkles />
        </div>

        <header className="mx-auto flex w-full max-w-6xl items-center gap-2.5 px-5 pt-5 sm:px-8 sm:pt-7">
          <img src={ICON_SRC} alt="" width={36} height={36} className="size-9" />
          <span className="font-serif text-[26px] leading-none text-accent">어휘장</span>
          <nav className="ml-auto flex items-center gap-1 text-[14px] font-extrabold text-hanji-2">
            <button type="button" onClick={() => scrollTo('why-a')} className="press hidden rounded-full px-3 py-2 hover:text-hanji sm:block">
              Why it works
            </button>
            <button type="button" onClick={() => scrollTo('story-a')} className="press hidden rounded-full px-3 py-2 hover:text-hanji sm:block">
              Our story
            </button>
            <button type="button" onClick={onStart} className="juicy lip-accent ml-1 h-10 bg-accent px-4 text-[14px] font-extrabold text-white">
              {returning ? 'My stages' : 'Start free'}
            </button>
          </nav>
        </header>

        <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center px-5 pb-16 pt-12 text-center sm:px-8 sm:pt-14">
          {/* The textbook badge: the strongest reason to trust the word lists, so it leads the hero. */}
          <p className="anim-rise inline-flex items-center gap-3 rounded-[24px] border-2 border-accent/35 bg-ink-2/90 p-2 pr-5 text-left shadow-[0_5px_0_var(--color-rule)] backdrop-blur sm:gap-4 sm:pr-7">
            <span className="grid size-12 shrink-0 place-items-center rounded-[16px] bg-accent text-white shadow-[0_4px_0_var(--color-accent-lip)] sm:size-14 sm:rounded-[18px]">
              <BookOpen size={26} strokeWidth={2.4} aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block text-[17px] font-black leading-tight tracking-[-0.01em] sm:text-[22px]">{HERO.badge}</span>
              <span className="mt-1 block text-[13px] font-bold leading-snug text-hanji-2 sm:text-[14px]">
                <span className="font-serif text-[15px] text-accent-text sm:text-[16px]">서울대 한국어</span> · {copy.badgeSub}
              </span>
            </span>
          </p>
          <h1 className="anim-rise mt-6 text-[46px] font-black leading-[0.98] tracking-[-0.035em] [--i:1] sm:text-[64px] lg:text-[76px] xl:text-[84px]">
            <span className="block">{HERO.lead}</span>
            <span className="block text-accent dark:text-accent-text">{HERO.accent}</span>
          </h1>
          <p className="anim-rise mt-6 max-w-[34ch] text-[19px] font-semibold leading-snug text-hanji [--i:2] sm:text-[22px]">{HERO.sub}</p>

          <div className="anim-rise mt-10 w-full [--i:3]">
            <Playground />
          </div>

          <div className="anim-rise mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-4 [--i:4]">
            <button
              type="button"
              onClick={onStart}
              className="juicy lip-accent group flex h-14 items-center gap-2.5 bg-accent px-8 text-[17px] font-black text-white"
            >
              {cta}
              <ArrowRight size={19} strokeWidth={2.8} className="transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden />
            </button>
            <button type="button" onClick={() => scrollTo('why-a')} className="press flex items-center gap-1.5 text-[14px] font-extrabold text-hanji-2 hover:text-hanji">
              See why it works <ArrowDown size={15} aria-hidden />
            </button>
          </div>
          <p className="mt-5 text-[13px] font-semibold text-hanji-2">{HERO.note}</p>
        </div>
      </section>

      <main>
        <section id="why-a" aria-labelledby="why-a-title" className="mx-auto max-w-6xl scroll-mt-4 px-5 pb-24 pt-24 sm:px-8 lg:pt-32">
          <p className="text-[12px] font-black uppercase tracking-[0.16em] text-accent-text">Why it works</p>
          <h2 id="why-a-title" className="mt-3 max-w-[22ch] text-[34px] font-black leading-[1.05] tracking-[-0.025em] sm:text-[50px]">
            Everything your class asks for. Nothing it doesn’t.
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <BenefitCard i={0} n={0} coverage={coverage} body={copy.textbookBody} />
            <BenefitCard i={1} n={1} coverage={coverage} />
            <BenefitCard i={third} n={2} coverage={coverage} className="md:col-span-2 lg:col-span-1" />
            <BenefitCard i={6} n={0} coverage={coverage} wide className="md:col-span-2" />
            <BenefitCard i={7} n={1} coverage={coverage} className="md:col-span-2 lg:col-span-1" />
          </div>
          <div className={`mt-16 grid gap-10 border-t-2 border-rule-soft pt-12 md:gap-8 ${small.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
            {small.map((i) => (
              <SmallBenefit key={i} i={i} />
            ))}
          </div>
        </section>

        <section aria-labelledby="beats-a" className="border-y-2 border-rule-soft bg-ink-3/60">
          <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
            <h2 id="beats-a" className="max-w-[24ch] text-[30px] font-black leading-[1.1] tracking-[-0.02em] sm:text-[40px]">
              One round. Three beats. Zero guesswork.
            </h2>
            <div className="mt-12">
              <Beats />
            </div>
          </div>
        </section>

        <div className="py-28">
          <Story />
        </div>

        <div className="px-3 pb-3 sm:px-5 sm:pb-5">
          <section ref={closer} className="relative isolate overflow-hidden rounded-[36px] bg-accent px-6 py-20 text-center text-white sm:rounded-[44px] sm:py-28">
            <JamoField onDark className="-z-10 opacity-70" />
            <Sparkles className="-z-10" />
            <h2 className="mx-auto max-w-[16ch] text-[38px] font-black leading-[1.02] tracking-[-0.03em] sm:text-[60px]">
              Tomorrow’s test is already in here.
            </h2>
            <p className="mx-auto mt-5 max-w-[40ch] text-[17px] leading-relaxed text-white/85">
              Open your textbook, pick a block of words, and type your way through it tonight. Your streak starts with the first one.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <button type="button" onClick={onStart} className="juicy lip-gold flex h-14 items-center gap-2.5 bg-gold px-8 text-[17px] font-black text-on-bright">
                {cta} <ArrowRight size={19} strokeWidth={2.8} aria-hidden />
              </button>
              {/* Hidden until the app install flow is ready: remove `hidden` to bring it back. */}
              <button type="button" className="press hidden h-14 items-center gap-2 rounded-2xl border-2 border-white/35 px-6 text-[15px] font-extrabold text-white hover:bg-white/10">
                <Download size={17} strokeWidth={2.6} aria-hidden /> Install the app
              </button>
            </div>
            <p className="mt-6 text-[13px] font-semibold text-white/70">{HERO.note}</p>
          </section>
          <footer className="flex flex-col items-center gap-2 px-5 py-10 text-center">
            <span className="flex items-center gap-2">
              <img src={ICON_SRC} alt="" width={24} height={24} className="size-6" />
              <span className="font-serif text-[18px] leading-none">어휘장</span>
            </span>
            <nav aria-label="Site" className="flex flex-wrap justify-center gap-x-5 gap-y-1 text-[13px] font-bold text-hanji-2">
              <a href={hrefFor('privacy')} className="hover:text-hanji">
                Privacy
              </a>
              {onFeedback ? (
                <button type="button" onClick={onFeedback} className="font-bold hover:text-hanji">
                  Feedback &amp; contact
                </button>
              ) : (
                <a href={FEEDBACK_URL} target="_blank" rel="noreferrer" className="hover:text-hanji">
                  Feedback &amp; contact
                </a>
              )}
              <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="hover:text-hanji">
                Source code
              </a>
            </nav>
            <p className="text-[12px] text-hanji-2/80">{DISCLAIMER}</p>
          </footer>
        </div>
      </main>
    </div>
  );
}
