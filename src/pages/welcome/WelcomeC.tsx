/**
 * Welcome, variant C, "Bento": the first screen is one asymmetrical bento grid that fills the
 * viewport (green hero with drifting jamo, the playable word block, and three benefit tiles);
 * a second bento below carries the sentence, the letter-by-letter check, offline install,
 * "Our story" and the closing call, over a marquee of real 1A words. Design-lab preview only
 * (#design-lab/welcome/c); the CTA and install buttons are inert.
 */
import type { CSSProperties, ReactNode } from 'react';
import { ArrowRight, Check, Download, Flame, Moon, RotateCcw, Sparkle, Volume2 } from 'lucide-react';
import { Seal } from '../../components/Seal';
import { VOCAB_1A } from '../../data/vocab1A';
import { useReveal } from '../../lib/hooks';
import { firstForm } from '../../lib/wordOfDay';
import { checkAnswer } from '../../utils/hangulDiff';
import { BENEFITS, coverageCopy, coverageOf, DEMO_STREAK, DEMO_WORD, DISCLAIMER, HERO, ICON_SRC, STORY, useJamoDemo, useParallax } from './content';
import { BUILT_IN_BOOKS } from '../../lib/books';
import { Burst, JamoField, Orb, Sparkles } from './fx';

/** Lab-only variant: shows the bundled books, so its claims stay true without the server. */
const COVERAGE = coverageOf(BUILT_IN_BOOKS);
const BOOKS = COVERAGE.books.map((b) => b.id);
const EYEBROW = coverageCopy(COVERAGE).eyebrow;

const CELL = 'relative overflow-hidden rounded-[28px] p-6 transition-transform duration-300 ease-[var(--ease-out-expo)] motion-safe:hover:-translate-y-1 sm:p-7';
const PLAIN = `${CELL} border-2 border-rule bg-ink-2 shadow-[0_6px_0_var(--color-rule)]`;

function Head({ i, light = false }: { i: number; light?: boolean }) {
  const { icon: Icon, kicker, title, body } = BENEFITS[i];
  return (
    <>
      <p className={`flex items-center gap-2 text-[12px] font-black uppercase tracking-[0.14em] ${light ? 'text-white/70' : 'text-hanji-2'}`}>
        <Icon size={15} strokeWidth={2.6} aria-hidden /> {kicker}
      </p>
      <h3 className="mt-3 text-[24px] font-black leading-[1.1] tracking-[-0.02em] sm:text-[26px]">{title}</h3>
      <p className={`mt-2 text-[15px] leading-relaxed ${light ? 'text-white/75' : 'text-hanji-2'}`}>{body}</p>
    </>
  );
}

/* ---------- First screen ---------- */

function HeroCell({ onStart }: { onStart?: () => void }) {
  const ref = useParallax<HTMLElement>();
  return (
    <section ref={ref} className={`${CELL} anim-rise isolate flex flex-col bg-accent text-white motion-safe:hover:translate-y-0 lg:col-span-7 lg:row-span-4 lg:p-10`}>
      <Orb tone="gold" className="-right-14 top-[34%] size-36" depth={0.6} dur={18} />
      <Orb tone="sky" className="-bottom-16 right-[18%] size-36" depth={1} dur={22} />
      <JamoField onDark tiles={false} className="-z-10 left-[42%]" />
      <Sparkles className="-z-10" />

      <header className="flex items-center gap-2.5">
        <img src={ICON_SRC} alt="" width={36} height={36} className="size-9 rounded-[10px]" />
        <span className="font-serif text-[26px] leading-none">어휘장</span>
        <span className="ml-auto hidden rounded-full bg-black/15 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.14em] text-white/90 sm:block">{EYEBROW}</span>
      </header>

      <div className="mt-auto pt-14 lg:pt-8">
        <h1 className="text-[44px] font-black leading-[0.98] tracking-[-0.035em] sm:text-[60px] xl:text-[68px]">
          <span className="block">{HERO.lead}</span>
          <span className="block text-gold">{HERO.accent}</span>
        </h1>
        <p className="mt-5 max-w-[40ch] text-[18px] font-semibold leading-snug text-white/90 sm:text-[20px]">{HERO.sub}</p>
        <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
          <button type="button" onClick={onStart} className="juicy lip-gold group flex h-14 items-center gap-2.5 bg-gold px-7 text-[16px] font-black text-on-bright">
            {HERO.cta}
            <ArrowRight size={19} strokeWidth={2.8} className="transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden />
          </button>
          <span className="text-[13px] font-semibold text-white/75">{HERO.note}</span>
        </div>
      </div>
    </section>
  );
}

function DemoCell() {
  const demo = useJamoDemo();
  return (
    <section aria-label="Try it now" className={`${PLAIN} anim-rise flex flex-col [--i:1] lg:col-span-5 lg:row-span-4`}>
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-[12px] font-black uppercase tracking-[0.14em] text-accent-text">
          <Sparkle size={14} className="fill-current" aria-hidden /> Try it now
        </span>
        <span className="text-[12px] font-bold text-hanji-2 tabular">
          {demo.step} / {demo.total}
        </span>
      </div>
      <p className="mt-5 text-[14px] font-bold text-hanji-2">Tap the letters to write</p>
      <p className="mt-0.5 text-[32px] font-black leading-tight">{DEMO_WORD.gloss.en}</p>
      <p className="text-[13px] font-semibold text-hanji-2">
        {DEMO_WORD.gloss.uz} · {DEMO_WORD.gloss.ru}
      </p>

      <div className="flex flex-1 flex-col items-center justify-center py-6">
        <div className="flex gap-3" aria-live="polite">
          {demo.syllables.map((s, i) => (
            <span
              key={`${demo.round}-${i}`}
              className={`grid size-[96px] place-items-center rounded-[26px] font-serif text-[58px] leading-none transition-colors duration-300 sm:size-[112px] sm:text-[66px] ${
                demo.done || i < demo.active
                  ? 'bg-accent text-white shadow-[0_6px_0_var(--color-accent-lip)]'
                  : i === demo.active
                    ? 'bg-ink-3 text-hanji shadow-[inset_0_0_0_3px_var(--color-accent)]'
                    : 'bg-ink-3 text-hanji-2'
              }`}
            >
              {s && (
                <span key={s} className="wl-pop">
                  {s}
                </span>
              )}
            </span>
          ))}
        </div>
        <p aria-hidden className="mt-4 flex h-8 items-center gap-2 font-serif text-[24px] leading-none">
          {demo.step === 0 && <span className="font-sans text-[13px] font-bold text-hanji-2">Letters snap together into syllables.</span>}
          {demo.equation.parts.map((j, i) => (
            <span key={i} className="flex items-center gap-2">
              {i > 0 && <span className="font-sans text-[18px] font-black text-hanji-2">+</span>}
              <span className="text-accent-text">{j}</span>
            </span>
          ))}
          {demo.equation.result && (
            <>
              <span className="font-sans text-[18px] font-black text-hanji-2">=</span>
              <span className="wl-pop rounded-lg bg-gold px-2 py-0.5 text-on-bright">{demo.equation.result}</span>
            </>
          )}
        </p>
      </div>

      {!demo.done ? (
        <div className="grid grid-cols-4 gap-2.5">
          {demo.tray.map(({ jamo, used }) => (
            <span key={`${demo.round}-${jamo}`} className="relative">
              {jamo === demo.next && demo.step === 0 && (
                <span aria-hidden className="absolute -inset-1 rounded-[20px] border-[3px] border-accent motion-safe:animate-pulse" />
              )}
              <button
                type="button"
                disabled={used}
                onClick={() => demo.tap(jamo)}
                aria-label={`Letter ${jamo}`}
                className={`juicy relative grid h-[68px] w-full place-items-center rounded-[18px] font-serif text-[34px] leading-none ${
                  used ? 'bg-ink-3 text-transparent shadow-none' : 'bg-gold text-on-bright shadow-[0_5px_0_var(--color-gold-lip)]'
                } ${demo.miss === jamo ? 'wl-shake !bg-danger text-white' : ''}`}
              >
                {jamo}
              </button>
            </span>
          ))}
        </div>
      ) : (
        <div className="wl-pop flex items-center gap-3 rounded-[20px] bg-accent-wash p-4">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-accent text-white">
            <Check size={20} strokeWidth={3} aria-hidden />
          </span>
          <p className="min-w-0 flex-1">
            <span className="block font-serif text-[19px] leading-snug">{DEMO_WORD.example.ko}</span>
            <span className="text-[13px] font-semibold text-hanji-2">{DEMO_WORD.example.en}</span>
          </p>
          <button type="button" onClick={demo.reset} aria-label="Play again" className="press grid size-10 shrink-0 place-items-center rounded-full text-hanji-2 hover:bg-ink-2 hover:text-hanji">
            <RotateCcw size={17} aria-hidden />
          </button>
        </div>
      )}
      {demo.done && <Burst key={demo.round} />}
    </section>
  );
}

function ClassesCell() {
  return (
    <article className={`${PLAIN} flex flex-col lg:col-span-4 lg:row-span-2`}>
      <Head i={0} />
      <div className="mt-5 flex gap-2.5 pt-1 lg:mt-auto">
        {BOOKS.map((b, k) => (
          <span
            key={b}
            className={`grid h-12 flex-1 place-items-center rounded-2xl font-serif text-[22px] leading-none ${
              k === 0 ? 'bg-accent text-white shadow-[0_4px_0_var(--color-accent-lip)]' : 'bg-ink-3 text-hanji shadow-[0_4px_0_var(--color-rule)]'
            }`}
          >
            {b}
          </span>
        ))}
      </div>
    </article>
  );
}

function HookedCell() {
  return (
    <article className={`${CELL} flex flex-col bg-[#191c23] text-[#ece6dc] shadow-[0_6px_0_#0d0f13] lg:col-span-3 lg:row-span-2`}>
      <div aria-hidden className="absolute -right-10 -top-10 size-40 rounded-full bg-[#f2903f]/25 blur-2xl" />
      <div className="relative flex items-center gap-3">
        <span className="grid size-12 place-items-center rounded-2xl bg-[#f2903f] text-[#33261b] shadow-[0_4px_0_#a2500f]">
          <Flame size={24} strokeWidth={2.4} className="anim-flicker" aria-hidden />
        </span>
        <span className="leading-tight">
          <span className="block text-[28px] font-black tabular">{DEMO_STREAK}</span>
          <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#a8a198]">sample streak</span>
        </span>
      </div>
      <h3 className="relative mt-5 text-[22px] font-black leading-[1.1] tracking-[-0.02em]">{BENEFITS[1].title}</h3>
      <p className="relative mt-2 text-[14px] leading-relaxed text-[#a8a198]">{BENEFITS[1].body}</p>
      <div className="relative mt-4 flex gap-1.5 pt-1 text-[12px] font-bold lg:mt-auto">
        <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1">
          <Moon size={12} aria-hidden /> Night
        </span>
        <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1">
          <Volume2 size={12} aria-hidden /> Lo-Fi
        </span>
      </div>
    </article>
  );
}

function LanguagesCell() {
  return (
    <article className={`${CELL} flex flex-col bg-sky-wash lg:col-span-5 lg:row-span-2`}>
      <Head i={3} />
      <div className="mt-5 flex flex-wrap items-center gap-2 pt-1 lg:mt-auto">
        {[
          ['UZ', DEMO_WORD.gloss.uz],
          ['RU', DEMO_WORD.gloss.ru],
          ['EN', DEMO_WORD.gloss.en],
        ].map(([code, word]) => (
          <span key={code} className="flex items-center gap-1.5 rounded-full bg-ink-2 px-3 py-1.5 text-[14px] font-bold shadow-[0_3px_0_var(--color-rule)]">
            <span className="text-[11px] font-black text-sky">{code}</span> {word}
          </span>
        ))}
        <ArrowRight size={18} className="mx-1 text-hanji-2" aria-hidden />
        <span className="font-serif text-[30px] leading-none text-sky">{DEMO_WORD.ko}</span>
      </div>
    </article>
  );
}

/* ---------- Second bento ---------- */

function Reveal({ i, className, children }: { i: number; className: string; children: ReactNode }) {
  const { ref, revealed } = useReveal<HTMLDivElement>();
  return (
    <div ref={ref} style={{ '--i': i } as CSSProperties} className={`reveal ${className} ${revealed ? 'is-revealed' : ''}`}>
      {children}
    </div>
  );
}

function SentenceCell() {
  return (
    <article className={`${PLAIN} flex h-full flex-col`}>
      <Head i={2} />
      <p className="mt-6 rounded-2xl bg-ink-3 px-5 py-4">
        <span className="block font-serif text-[30px] leading-snug">
          <span className="wl-marker">{DEMO_WORD.ko}</span>
          {DEMO_WORD.example.ko.slice(DEMO_WORD.ko.length)}
        </span>
        <span className="text-[13px] font-semibold text-hanji-2">{DEMO_WORD.example.en}</span>
      </p>
    </article>
  );
}

/** A real misspelling of 학생 (1A), diffed by the app's own checker. */
const DIFF = checkAnswer('학셍', '학생');

function LettersCell() {
  return (
    <article className={`${PLAIN} flex h-full flex-col`}>
      <Head i={4} />
      <div className="mt-6 flex items-start justify-center gap-3">
        {DIFF.cells.map((c, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <span
              className={`grid size-[72px] place-items-center rounded-[20px] font-serif text-[40px] leading-none ${
                c.kind === 'exact' ? 'bg-accent text-white shadow-[0_5px_0_var(--color-accent-lip)]' : 'bg-amber-wash text-amber shadow-[inset_0_0_0_3px_var(--color-amber)]'
              }`}
            >
              {c.typed}
            </span>
            {c.jamo ? (
              <span className="flex gap-1">
                {c.jamo.map((j) => (
                  <span
                    key={j.slot}
                    title={j.ok ? undefined : `${j.typed} → ${j.expected}`}
                    className={`grid h-8 min-w-8 place-items-center rounded-lg px-1 font-serif text-[16px] leading-none ${j.ok ? 'bg-accent-wash text-accent-text' : 'bg-danger-wash text-danger-text'}`}
                  >
                    {j.ok ? j.typed : `${j.expected}`}
                  </span>
                ))}
              </span>
            ) : (
              <span className="grid h-8 place-items-center text-accent-text">
                <Check size={18} strokeWidth={3} aria-hidden />
              </span>
            )}
          </div>
        ))}
      </div>
      <p className="mt-4 text-center text-[13px] font-semibold text-hanji-2">
        Typed <span className="font-serif text-[15px] text-hanji">학셍</span>, meant <span className="font-serif text-[15px] text-hanji">{DIFF.target}</span>: only the vowel slipped.
      </p>
    </article>
  );
}

function OfflineCell() {
  return (
    <article className={`${CELL} flex h-full flex-col bg-gold text-on-bright shadow-[0_6px_0_var(--color-gold-lip)]`}>
      <Head i={5} />
      <button type="button" className="press mt-6 flex h-12 items-center justify-center gap-2 rounded-2xl bg-on-bright text-[15px] font-extrabold text-[#fff8ee] hover:opacity-90 lg:mt-auto">
        <Download size={17} strokeWidth={2.6} aria-hidden /> Install the app
      </button>
    </article>
  );
}

function StoryCell() {
  return (
    <article className={`${PLAIN} grid h-full gap-8 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] sm:p-9`}>
      <div className="flex flex-col">
        <p className="text-[12px] font-black uppercase tracking-[0.16em] text-accent-text">{STORY.eyebrow}</p>
        <h2 className="mt-3 text-[30px] font-black leading-[1.05] tracking-[-0.025em] sm:text-[38px]">{STORY.title}</h2>
        <span className="mt-6 w-fit -rotate-6 md:mt-auto">
          <Seal size={72} label="학생" />
        </span>
      </div>
      <div>
        {STORY.body.map((p) => (
          <p key={p} className="mb-4 text-[16px] leading-relaxed text-hanji-2">
            {p}
          </p>
        ))}
        <p className="mt-6 flex items-center gap-3 border-t-2 border-rule-soft pt-5 text-[14px] font-bold">
          <img src={ICON_SRC} alt="" width={26} height={26} className="size-[26px]" />
          {STORY.sign}
        </p>
      </div>
    </article>
  );
}

function CtaCell({ onStart }: { onStart?: () => void }) {
  return (
    <article className={`${CELL} flex h-full flex-col bg-accent text-white shadow-[0_6px_0_var(--color-accent-lip)]`}>
      <Sparkles />
      <h2 className="relative text-[34px] font-black leading-[1.02] tracking-[-0.03em]">Tomorrow’s test is already in here.</h2>
      <p className="relative mt-3 text-[15px] leading-relaxed text-white/80">Pick a block of 1A words and type your way through it tonight.</p>
      <button type="button" onClick={onStart} className="juicy lip-gold relative mt-8 flex h-14 items-center justify-center gap-2.5 bg-gold text-[16px] font-black text-on-bright lg:mt-auto">
        {HERO.cta} <ArrowRight size={19} strokeWidth={2.8} aria-hidden />
      </button>
    </article>
  );
}

/** Real 1A words, first forms, scrolling past as texture. */
const MARQUEE = [...new Set(VOCAB_1A.map((w) => firstForm(w.ko)))].filter((k) => k.length >= 2 && !k.includes(' ')).slice(0, 28);

function Marquee() {
  return (
    <div className="relative overflow-hidden rounded-[28px] border-2 border-rule bg-ink-2 py-5">
      <p className="sr-only">Real words from 1A</p>
      <div aria-hidden className="wl-marquee flex w-max gap-3">
        {[...MARQUEE, ...MARQUEE].map((k, i) => (
          <span key={i} className={`rounded-2xl px-4 py-2 font-serif text-[24px] leading-none ${i % 5 === 0 ? 'bg-accent-wash text-accent-text' : i % 7 === 0 ? 'bg-gold/30' : 'bg-ink-3'}`}>
            {k}
          </span>
        ))}
      </div>
      <span aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-ink-2 to-transparent" />
      <span aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-ink-2 to-transparent" />
    </div>
  );
}

/* ---------- Page ---------- */

export default function WelcomeC({ onStart }: { onStart?: () => void }) {
  return (
    <div
      className="scroll-smooth-motion h-full overflow-y-auto overflow-x-hidden bg-ink text-hanji"
      style={{ backgroundImage: 'radial-gradient(var(--color-rule) 1px, transparent 1px)', backgroundSize: '22px 22px' }}
    >
      <div className="grid gap-3 p-3 sm:gap-4 sm:p-4 lg:min-h-full lg:grid-cols-12 lg:grid-rows-[repeat(6,minmax(auto,1fr))]">
        <HeroCell onStart={onStart} />
        <DemoCell />
        <ClassesCell />
        <HookedCell />
        <LanguagesCell />
      </div>

      <main className="grid gap-3 px-3 pb-3 sm:gap-4 sm:px-4 sm:pb-4 lg:grid-cols-12">
        <Reveal i={0} className="lg:col-span-12">
          <Marquee />
        </Reveal>
        <Reveal i={0} className="lg:col-span-5">
          <SentenceCell />
        </Reveal>
        <Reveal i={1} className="lg:col-span-4">
          <LettersCell />
        </Reveal>
        <Reveal i={2} className="lg:col-span-3">
          <OfflineCell />
        </Reveal>
        <Reveal i={0} className="lg:col-span-8">
          <StoryCell />
        </Reveal>
        <Reveal i={1} className="lg:col-span-4">
          <CtaCell onStart={onStart} />
        </Reveal>
        <footer className="flex flex-col items-center justify-between gap-2 px-3 py-6 text-center sm:flex-row lg:col-span-12">
          <span className="flex items-center gap-2">
            <img src={ICON_SRC} alt="" width={22} height={22} className="size-[22px]" />
            <span className="font-serif text-[17px] leading-none">어휘장</span>
          </span>
          <p className="text-[12px] text-hanji-2/80">{DISCLAIMER}</p>
        </footer>
      </main>
    </div>
  );
}

