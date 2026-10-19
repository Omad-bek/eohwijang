/**
 * Welcome, variant B, "Quiet hanji": an editorial, centered page. A light-weight headline, one
 * syllable taken apart as the only illustration, faint 계선 column rules behind the hero, features
 * set as ruled columns instead of cards, and an inverted install bar. Design-lab preview only
 * (#design-lab/welcome/b); the CTA and install buttons are inert.
 */
import type { CSSProperties } from 'react';
import { ArrowRight, X } from 'lucide-react';
import { useReveal } from '../../lib/hooks';
import { BOOKS, DISCLAIMER, FEATURES, HERO, ICON_SRC, SAMPLE, useInstallBanner } from './content';

const RULES: CSSProperties = {
  backgroundImage: 'repeating-linear-gradient(90deg, var(--color-rule-soft) 0 1px, transparent 1px 112px)',
  backgroundPosition: 'center top',
  maskImage: 'linear-gradient(to bottom, #000 20%, transparent 85%)',
  WebkitMaskImage: 'linear-gradient(to bottom, #000 20%, transparent 85%)',
};

const SLOTS = [
  ['초성', 'initial'],
  ['중성', 'vowel'],
  ['종성', 'final'],
];

/** 학 split into its three slots, set like a figure in a book. */
function SyllableFigure() {
  const { syl, jamo } = SAMPLE.cells[0];
  return (
    <figure className="mx-auto mt-16 w-fit sm:mt-20">
      <div className="flex items-center gap-6 sm:gap-10">
        <span className="font-serif text-[112px] leading-none sm:text-[160px]">{syl}</span>
        <span aria-hidden className="h-28 w-px bg-rule sm:h-36" />
        <dl className="grid gap-3 sm:gap-4">
          {jamo.map((j, i) => (
            <div key={j} className="anim-rise flex items-baseline gap-3" style={{ '--i': i + 4 } as CSSProperties}>
              <dt className="w-8 font-serif text-[28px] leading-none text-accent-text sm:text-[34px]">{j}</dt>
              <dd className="text-[13px] font-semibold text-hanji-2">
                <span className="font-serif text-[15px] text-hanji">{SLOTS[i][0]}</span> · {SLOTS[i][1]}
              </dd>
            </div>
          ))}
        </dl>
      </div>
      <figcaption className="mt-6 text-center text-[13px] text-hanji-2">
        <span className="font-serif text-[15px] text-hanji">학생</span> · student. Every answer checked letter by letter.
      </figcaption>
    </figure>
  );
}

const DETAILS = [
  BOOKS.join(' · '),
  'Soft sounds · Streaks · Night mode',
  `${SAMPLE.example.before}${SAMPLE.example.word}${SAMPLE.example.after}`,
];

function FeatureColumn({ i }: { i: number }) {
  const { ref, revealed } = useReveal<HTMLElement>();
  const { icon: Icon, title, body } = FEATURES[i];
  return (
    <article ref={ref} style={{ '--i': i } as CSSProperties} className={`reveal flex flex-col py-8 md:px-8 md:py-2 md:first:pl-0 md:last:pr-0 ${revealed ? 'is-revealed' : ''}`}>
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-black tracking-[0.16em] text-hanji-2 tabular">0{i + 1}</span>
        <Icon size={20} strokeWidth={1.8} className="text-accent-text" aria-hidden />
      </div>
      <h3 className="mt-8 text-[22px] font-extrabold leading-tight tracking-[-0.01em]">{title}</h3>
      <p className="mt-3 text-[15px] leading-relaxed text-hanji-2">{body}</p>
      <p className={`mt-6 border-t border-rule pt-4 text-hanji ${i === 2 ? 'font-serif text-[17px]' : i === 0 ? 'font-serif text-[18px] tracking-[0.08em]' : 'text-[13px] font-bold'}`}>
        {DETAILS[i]}
        {i === 2 && <span className="mt-1 block font-sans text-[12px] font-semibold text-hanji-2">{SAMPLE.example.en}</span>}
      </p>
    </article>
  );
}

function InstallBar({ onDismiss }: { onDismiss: () => void }) {
  return (
    <aside aria-label="Install the app" className="anim-sheet fixed inset-x-0 bottom-0 z-40 bg-hanji text-ink">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-5 py-3 pb-[max(12px,env(safe-area-inset-bottom))] sm:gap-4 sm:px-8">
        <img src={ICON_SRC} alt="" width={32} height={32} className="size-8 shrink-0" />
        <p className="min-w-0 flex-1 text-[14px] leading-snug">
          <span className="font-extrabold">
            Keep <span className="font-serif font-normal">어휘장</span> on your home screen.
          </span> <span className="hidden opacity-75 sm:inline">It opens in a tap and works with no signal.</span>
        </p>
        <button type="button" className="h-9 shrink-0 rounded-full border-2 border-ink px-4 text-[13px] font-extrabold hover:bg-ink hover:text-hanji">
          Install
        </button>
        <button type="button" onClick={onDismiss} aria-label="Not now" className="grid size-9 shrink-0 place-items-center rounded-full opacity-70 hover:opacity-100">
          <X size={17} aria-hidden />
        </button>
      </div>
    </aside>
  );
}

export default function WelcomeB({ onStart }: { onStart?: () => void }) {
  const install = useInstallBanner();

  return (
    <div className="scroll-smooth-motion h-full overflow-y-auto overflow-x-hidden bg-ink text-hanji">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-5 pt-6 sm:px-8 sm:pt-8">
        <span className="flex items-center gap-2.5">
          <img src={ICON_SRC} alt="" width={30} height={30} className="size-[30px]" />
          <span className="font-serif text-[22px] leading-none">어휘장</span>
        </span>
        <span className="text-[12px] font-bold uppercase tracking-[0.16em] text-hanji-2">Eohwijang</span>
      </header>

      <main>
        <section className="relative">
          <div aria-hidden className="pointer-events-none absolute inset-0" style={RULES} />
          <div className="anim-rise relative mx-auto max-w-4xl px-5 pb-24 pt-20 text-center sm:px-8 sm:pt-28 lg:pb-32">
            <p className="flex items-center justify-center gap-4 text-[12px] font-bold uppercase tracking-[0.2em] text-hanji-2">
              <span aria-hidden className="hidden h-px w-8 bg-rule sm:block" />
              {HERO.eyebrow}
              <span aria-hidden className="hidden h-px w-8 bg-rule sm:block" />
            </p>
            <h1 className="mx-auto mt-8 max-w-[14ch] text-[46px] font-light leading-[1.04] tracking-[-0.035em] sm:text-[68px] lg:text-[84px]">
              {HERO.lead} <span className="font-extrabold text-accent">{HERO.accent}</span>
            </h1>
            <p className="mx-auto mt-8 max-w-[44ch] text-[17px] leading-relaxed text-hanji-2">{HERO.sub}</p>
            <button
              type="button"
              onClick={onStart}
              className="press group mx-auto mt-10 flex h-14 items-center gap-3 rounded-full bg-accent pl-7 pr-2 text-[16px] font-extrabold text-white transition-colors hover:bg-accent-lip"
            >
              {HERO.cta}
              <span className="grid size-10 place-items-center rounded-full bg-white/15 transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:translate-x-1">
                <ArrowRight size={18} strokeWidth={2.4} aria-hidden />
              </span>
            </button>
            <p className="mt-6 text-[13px] text-hanji-2">{HERO.note}</p>

            <SyllableFigure />
          </div>
        </section>

        <section aria-label="Features" className="border-t border-rule">
          <div className="mx-auto max-w-5xl px-5 pb-36 pt-16 sm:px-8 lg:pt-20">
            <div className="grid divide-y divide-rule md:grid-cols-3 md:divide-x md:divide-y-0">
              {FEATURES.map((f, i) => (
                <FeatureColumn key={f.title} i={i} />
              ))}
            </div>
            <p className="mt-20 text-center text-[12px] text-hanji-2/80">{DISCLAIMER}</p>
          </div>
        </section>
      </main>

      {install.show && <InstallBar onDismiss={install.dismiss} />}
    </div>
  );
}
