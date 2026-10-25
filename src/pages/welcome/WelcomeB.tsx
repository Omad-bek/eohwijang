/**
 * Welcome, variant B, "Story": a premium product page. Very large, quiet type; a minimal playable
 * equation (ㅎ + ㅗ = 호) right under the headline; four full-width chapters, one per benefit, with
 * an inverted night chapter; and "Our story" as the centerpiece, its words lighting up as you
 * scroll. Design-lab preview only (#design-lab/welcome/b); the CTA and install buttons are inert.
 */
import type { ReactNode } from 'react';
import { ArrowRight, Flame, Moon, RotateCcw, Volume2, X } from 'lucide-react';
import { useReveal } from '../../lib/hooks';
import { BENEFITS, coverageCopy, coverageOf, DEMO_STREAK, DEMO_WORD, DISCLAIMER, HERO, ICON_SRC, STORY, useCountUp, useInstallBanner, useJamoDemo, useScrollProgress } from './content';
import { BUILT_IN_BOOKS } from '../../lib/books';
import { Orb } from './fx';

/** Lab-only variant: shows the bundled books, so its claims stay true without the server. */
const COVERAGE = coverageOf(BUILT_IN_BOOKS);
const BOOKS = COVERAGE.books.map((b) => b.id);
const EYEBROW = coverageCopy(COVERAGE).eyebrow;

/* ---------- The equation demo ---------- */

function Equation() {
  const demo = useJamoDemo();
  return (
    <div className="relative mx-auto mt-14 w-full max-w-[640px] sm:mt-16">
      <p className="text-[12px] font-bold uppercase tracking-[0.24em] text-hanji-2">Try it · Write “{DEMO_WORD.gloss.en}”</p>

      {/* The word, syllable by syllable, on thin baselines. */}
      <div className="mt-8 flex justify-center gap-6 sm:gap-10" aria-live="polite">
        {demo.syllables.map((s, i) => (
          <div key={`${demo.round}-${i}`} className="flex w-[118px] flex-col items-center sm:w-[160px]">
            <span className={`grid h-[120px] place-items-center font-serif text-[104px] leading-none transition-colors duration-500 sm:h-[160px] sm:text-[144px] ${demo.done ? 'text-accent' : 'text-hanji'}`}>
              {s && (
                <span key={s} className="wl-pop">
                  {s}
                </span>
              )}
            </span>
            <span className={`mt-2 h-[3px] w-full rounded-full transition-colors duration-500 ${demo.done || i < demo.active ? 'bg-accent' : i === demo.active ? 'bg-hanji' : 'bg-rule'}`} />
          </div>
        ))}
      </div>

      <p aria-hidden className="mt-6 h-7 font-serif text-[22px] leading-none text-hanji-2">
        {demo.equation.parts.join(' + ')}
        {demo.equation.result && <span className="text-hanji"> = {demo.equation.result}</span>}
      </p>

      {!demo.done ? (
        <div className="mt-6 flex justify-center gap-3 sm:gap-4">
          {demo.tray.map(({ jamo, used }) => (
            <button
              key={`${demo.round}-${jamo}`}
              type="button"
              disabled={used}
              onClick={() => demo.tap(jamo)}
              aria-label={`Letter ${jamo}`}
              className={`press grid size-16 place-items-center rounded-full border font-serif text-[30px] leading-none transition-[background-color,border-color,color,opacity] duration-300 sm:size-[72px] ${
                used ? 'border-transparent text-hanji-2/30' : 'border-rule bg-ink-2 text-hanji hover:border-hanji'
              } ${jamo === demo.next && demo.step === 0 ? 'ring-2 ring-accent/50 ring-offset-4 ring-offset-ink' : ''} ${demo.miss === jamo ? 'wl-shake !border-danger text-danger-text' : ''}`}
            >
              {jamo}
            </button>
          ))}
        </div>
      ) : (
        <div className="wl-pop mt-6">
          <p className="font-serif text-[24px] leading-snug">{DEMO_WORD.example.ko}</p>
          <p className="mt-1 text-[15px] text-hanji-2">{DEMO_WORD.example.en} You just built it, letter by letter.</p>
          <button type="button" onClick={demo.reset} className="press mx-auto mt-4 flex items-center gap-1.5 text-[13px] font-bold text-hanji-2 hover:text-hanji">
            <RotateCcw size={14} aria-hidden /> Again
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------- Chapters ---------- */

function Chapter({ n, dark = false, visual, flip = false }: { n: number; dark?: boolean; visual: ReactNode; flip?: boolean }) {
  const { ref, revealed } = useReveal<HTMLElement>();
  const { kicker, title, body } = BENEFITS[n];
  return (
    <section
      ref={ref}
      className={`${dark ? 'bg-[#121418] text-[#ece6dc]' : ''} ${revealed ? 'is-revealed' : ''}`}
      aria-labelledby={`ch-${n}`}
    >
      <div className={`mx-auto grid max-w-6xl items-center gap-14 px-5 py-28 sm:px-8 lg:grid-cols-2 lg:gap-20 lg:py-40 ${flip ? 'lg:[&>*:first-child]:order-2' : ''}`}>
        <div className={`reveal ${revealed ? 'is-revealed' : ''}`}>
          <p className={`text-[13px] font-bold uppercase tracking-[0.22em] ${dark ? 'text-[#f0bd45]' : 'text-accent-text'}`}>
            0{n + 1} · {kicker}
          </p>
          <h2 id={`ch-${n}`} className="mt-5 text-[48px] font-black leading-[0.98] tracking-[-0.04em] sm:text-[72px]">
            {title}
          </h2>
          <p className={`mt-7 max-w-[36ch] text-[19px] leading-relaxed sm:text-[21px] ${dark ? 'text-[#a8a198]' : 'text-hanji-2'}`}>{body}</p>
        </div>
        <div className={`reveal [--i:2] ${revealed ? 'is-revealed' : ''}`}>{visual}</div>
      </div>
    </section>
  );
}

function BooksVisual() {
  return (
    <div className="flex items-end justify-center gap-4 sm:gap-6">
      {BOOKS.map((b, i) => (
        <span
          key={b}
          className={`flex w-[30%] max-w-[150px] flex-col justify-end rounded-t-[28px] px-4 pb-5 font-serif leading-none ${
            i === 0 ? 'h-72 bg-accent text-white sm:h-80' : i === 1 ? 'h-60 bg-accent-wash text-accent-text sm:h-64' : 'h-48 border-2 border-b-0 border-rule text-hanji-2 sm:h-52'
          }`}
        >
          <span className="text-[44px] sm:text-[56px]">{b}</span>
          <span className="mt-2 font-sans text-[12px] font-bold uppercase tracking-[0.14em] opacity-75">SNU</span>
        </span>
      ))}
    </div>
  );
}

function StreakVisual() {
  const { ref, revealed } = useReveal<HTMLDivElement>();
  const n = useCountUp(DEMO_STREAK, revealed, 1200);
  return (
    <div ref={ref} className="relative flex flex-col items-center text-center">
      <div aria-hidden className="absolute left-1/2 top-10 size-64 -translate-x-1/2 rounded-full bg-[#f2903f]/25 blur-3xl" />
      <Flame size={72} strokeWidth={1.8} className="anim-flicker relative fill-[#f2903f]/30 text-[#f2903f]" aria-hidden />
      <span className="relative mt-2 text-[150px] font-black leading-none tracking-[-0.06em] tabular sm:text-[200px]">{n}</span>
      <span className="relative text-[15px] font-bold text-[#a8a198]">days in a row · sample streak</span>
      <div className="relative mt-10 flex flex-wrap justify-center gap-2.5 text-[14px] font-bold">
        {(
          [
            [Moon, 'Dark mode'],
            [Volume2, 'Lo-Fi sounds'],
            [Flame, 'Streaks'],
          ] as const
        ).map(([Icon, label]) => (
          <span key={label} className="flex items-center gap-2 rounded-full border border-white/15 px-4 py-2">
            <Icon size={15} aria-hidden /> {label}
          </span>
        ))}
      </div>
    </div>
  );
}

function SentenceVisual() {
  const rest = DEMO_WORD.example.ko.slice(DEMO_WORD.ko.length);
  return (
    <figure className="rounded-[36px] border border-rule bg-ink-2 p-8 sm:p-12">
      <p className="font-serif text-[56px] leading-[1.15] sm:text-[76px]">
        <span className="wl-marker">{DEMO_WORD.ko}</span>
        {rest}
      </p>
      <figcaption className="mt-6 border-t border-rule pt-5 text-[17px] text-hanji-2">
        {DEMO_WORD.example.en}
        <span className="mt-1 block text-[14px]">
          <span className="font-serif text-[16px] text-hanji">{DEMO_WORD.ko}</span> · {DEMO_WORD.gloss.en}, from 1A
        </span>
      </figcaption>
    </figure>
  );
}

function LanguagesVisual() {
  const rows = [
    ['O‘zbekcha', DEMO_WORD.gloss.uz],
    ['Русский', DEMO_WORD.gloss.ru],
    ['English', DEMO_WORD.gloss.en],
  ];
  return (
    <div className="grid items-center gap-6 sm:grid-cols-[1fr_auto] sm:gap-10">
      <ul className="divide-y divide-rule border-y border-rule">
        {rows.map(([lang, word]) => (
          <li key={lang} className="flex items-baseline justify-between gap-4 py-5">
            <span className="text-[13px] font-bold uppercase tracking-[0.14em] text-hanji-2">{lang}</span>
            <span className="text-[24px] font-extrabold sm:text-[28px]">{word}</span>
          </li>
        ))}
      </ul>
      <span className="flex items-center gap-4 sm:gap-6">
        <ArrowRight size={28} strokeWidth={1.6} className="text-hanji-2" aria-hidden />
        <span className="whitespace-nowrap font-serif text-[72px] leading-none text-accent sm:text-[96px]">{DEMO_WORD.ko}</span>
      </span>
    </div>
  );
}

/* ---------- Our story: words light up with the scroll ---------- */

function LitStory() {
  const { ref, p } = useScrollProgress<HTMLDivElement>();
  const words = STORY.body.join(' ').split(' ');
  const lit = Math.round(p * 1.25 * words.length);
  return (
    <section aria-labelledby="story-b" className="relative overflow-hidden border-y border-rule">
      <Orb tone="accent" className="-right-32 top-16 size-80" depth={0} dur={26} />
      <div className="relative mx-auto max-w-5xl px-5 py-32 sm:px-8 lg:py-44">
        <p className="text-[13px] font-bold uppercase tracking-[0.22em] text-accent-text">{STORY.eyebrow}</p>
        <h2 id="story-b" className="mt-5 max-w-[16ch] text-[44px] font-black leading-[1] tracking-[-0.04em] sm:text-[68px]">
          {STORY.title}
        </h2>
        <div ref={ref} className="mt-12 text-[26px] font-bold leading-[1.4] tracking-[-0.01em] sm:text-[38px]">
          <p className="sr-only">{STORY.body.join(' ')}</p>
          <p aria-hidden>
            {words.map((w, i) => (
              <span key={i} className={`wl-word ${i < lit ? 'text-hanji' : 'text-hanji/15'}`}>
                {w}{' '}
              </span>
            ))}
          </p>
        </div>
        <p className="mt-12 flex items-center gap-3 text-[15px] font-semibold text-hanji-2">
          <img src={ICON_SRC} alt="" width={32} height={32} className="size-8" />
          {STORY.sign}
        </p>
      </div>
    </section>
  );
}

/* ---------- Install bar ---------- */

function InstallBar({ onDismiss }: { onDismiss: () => void }) {
  return (
    <aside aria-label="Install the app" className="anim-sheet fixed inset-x-0 bottom-0 z-40 border-t border-rule bg-ink-2/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-5 py-3 pb-[max(12px,env(safe-area-inset-bottom))] sm:gap-4 sm:px-8">
        <img src={ICON_SRC} alt="" width={32} height={32} className="size-8 shrink-0" />
        <p className="min-w-0 flex-1 text-[14px] leading-snug">
          <span className="font-extrabold">
            Keep <span className="font-serif font-normal">어휘장</span> on your home screen.
          </span>{' '}
          <span className="hidden text-hanji-2 sm:inline">It opens in a tap and works with no signal.</span>
        </p>
        <button type="button" className="h-9 shrink-0 rounded-full bg-hanji px-4 text-[13px] font-extrabold text-ink hover:opacity-90">
          Install
        </button>
        <button type="button" onClick={onDismiss} aria-label="Not now" className="grid size-9 shrink-0 place-items-center rounded-full text-hanji-2 hover:text-hanji">
          <X size={17} aria-hidden />
        </button>
      </div>
    </aside>
  );
}

/* ---------- Page ---------- */

function StartButton({ onStart, className = '' }: { onStart?: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onStart}
      className={`press group flex h-14 items-center gap-3 rounded-full bg-accent pl-7 pr-2 text-[16px] font-extrabold text-white transition-colors hover:bg-accent-lip ${className}`}
    >
      {HERO.cta}
      <span className="grid size-10 place-items-center rounded-full bg-white/15 transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:translate-x-1">
        <ArrowRight size={18} strokeWidth={2.4} aria-hidden />
      </span>
    </button>
  );
}

export default function WelcomeB({ onStart }: { onStart?: () => void }) {
  const install = useInstallBanner(2400);

  return (
    <div className="scroll-smooth-motion h-full overflow-y-auto overflow-x-hidden bg-ink text-hanji">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 pt-6 sm:px-8 sm:pt-8">
        <span className="flex items-center gap-2.5">
          <img src={ICON_SRC} alt="" width={30} height={30} className="size-[30px]" />
          <span className="font-serif text-[22px] leading-none">어휘장</span>
        </span>
        <button type="button" onClick={onStart} className="text-[14px] font-extrabold text-accent-text hover:underline hover:underline-offset-4">
          Start free
        </button>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-5 pb-28 pt-20 text-center sm:px-8 sm:pt-28 lg:pb-36">
          <p className="anim-rise text-[13px] font-bold uppercase tracking-[0.24em] text-hanji-2">{EYEBROW}</p>
          <h1 className="anim-rise mt-8 text-[54px] leading-[0.95] tracking-[-0.05em] [--i:1] sm:text-[96px] lg:text-[128px]">
            <span className="block font-light text-hanji-2">{HERO.lead}</span>
            <span className="block font-black">{HERO.accent}</span>
          </h1>
          <p className="anim-rise mx-auto mt-10 max-w-[30ch] text-[21px] font-semibold leading-snug [--i:2] sm:text-[26px]">{HERO.sub}</p>

          <div className="anim-rise [--i:3]">
            <Equation />
          </div>

          <div className="anim-rise mt-16 flex flex-col items-center gap-4 [--i:5]">
            <StartButton onStart={onStart} />
            <p className="text-[13px] text-hanji-2">{HERO.note}</p>
          </div>
        </section>

        <Chapter n={0} visual={<BooksVisual />} />
        <Chapter n={1} dark flip visual={<StreakVisual />} />
        <Chapter n={2} visual={<SentenceVisual />} />
        <Chapter n={3} flip visual={<LanguagesVisual />} />

        <LitStory />

        <section className="mx-auto max-w-6xl px-5 pb-40 pt-32 text-center sm:px-8 lg:pt-44">
          <h2 className="text-[56px] font-black leading-[0.95] tracking-[-0.05em] sm:text-[104px]">
            Start feeling it.
            <span className="block font-light text-hanji-2">Tonight.</span>
          </h2>
          <StartButton onStart={onStart} className="mx-auto mt-12" />
          <p className="mt-5 text-[13px] text-hanji-2">{HERO.note}</p>
          <p className="mt-24 text-[12px] text-hanji-2/80">{DISCLAIMER}</p>
        </section>
      </main>

      {install.show && <InstallBar onDismiss={install.dismiss} />}
    </div>
  );
}

