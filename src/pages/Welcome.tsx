/**
 * Welcome / landing page for first-time visitors. Design-lab preview only (#design-lab/welcome):
 * nothing in App routes here yet, and the CTA and install buttons are inert until the page is approved.
 */
import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { ArrowRight, BookOpen, Download, Flame, Leaf, Moon, Quote, Volume2, WifiOff, X, type LucideIcon } from 'lucide-react';
import { Seal } from '../components/Seal';
import { useReveal } from '../lib/hooks';

const ICON_SRC = `${import.meta.env.BASE_URL}favicon.svg`;

/* ---------- Hero visual: one recall, split into jamo ---------- */

// 학생 (prompts as in vocab1A) = ㅎㅏㄱ + ㅅㅐㅇ, the app's signature diff cell.
const CELLS = [
  { syl: '학', jamo: ['ㅎ', 'ㅏ', 'ㄱ'] },
  { syl: '생', jamo: ['ㅅ', 'ㅐ', 'ㅇ'] },
];

function RecallCard() {
  return (
    <div className="relative mx-auto w-full max-w-[420px]">
      {/* A quiet wash behind the card instead of a shadow. */}
      <div aria-hidden className="absolute -inset-10 -z-10 rounded-full bg-accent-wash opacity-70 blur-3xl" />

      <div className="rounded-[28px] border-2 border-rule bg-ink-2 p-5 shadow-[0_6px_0_var(--color-rule)] sm:p-7">
        {/* Right padding keeps the streak chip clear of the seal that overhangs this corner. */}
        <div className="flex items-center justify-between gap-3 pr-9 sm:pr-7">
          <span className="text-[11px] font-black uppercase tracking-[0.14em] text-hanji-2">1A · Recall</span>
          <span className="flex items-center gap-1 rounded-full bg-flame-wash px-2.5 py-1 text-[12px] font-black text-flame-ink">
            <Flame size={13} className="anim-flicker" aria-hidden /> 12
          </span>
        </div>

        <dl className="mt-6 space-y-1.5">
          {[
            ['EN', 'student'],
            ['UZ', "o'quvchi, talaba"],
            ['RU', 'ученик, студент'],
          ].map(([code, word], i) => (
            <div key={code} className="flex items-baseline gap-3">
              <dt className="w-6 text-[11px] font-black tracking-[0.06em] text-accent-text">{code}</dt>
              <dd className={i === 0 ? 'text-[26px] font-black leading-tight' : 'text-[15px] font-semibold text-hanji-2'}>{word}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-6 flex gap-3">
          {CELLS.map((c, ci) => (
            <div key={c.syl} className="anim-cell flex-1 overflow-hidden rounded-2xl border-2 border-accent/50 bg-accent-wash" style={{ animationDelay: `${300 + ci * 90}ms` }}>
              <div className="grid h-[76px] place-items-center font-serif text-[48px] leading-none text-accent-text">{c.syl}</div>
              <div className="grid grid-cols-3 border-t-2 border-accent/30">
                {c.jamo.map((j, ji) => (
                  <span
                    key={ji}
                    className="anim-slot grid h-9 place-items-center font-serif text-[16px] text-accent-text [&:not(:first-child)]:border-l-2 [&:not(:first-child)]:border-accent/20"
                    style={{ animationDelay: `${560 + ci * 90 + ji * 60}ms` }}
                  >
                    {j}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center gap-3">
          <div className="flex flex-1 gap-1" aria-hidden>
            {Array.from({ length: 12 }, (_, i) => (
              <span key={i} className={`h-2.5 flex-1 rounded-[3px] ${i < 7 ? 'rotate-[-6deg] bg-accent' : i === 7 ? 'bg-hanji' : 'bg-rule-soft'}`} />
            ))}
          </div>
          <span className="text-[12px] font-bold text-hanji-2 tabular">7 / 12</span>
        </div>
      </div>

      <span className="absolute -right-3 -top-4 sm:-right-5 sm:-top-5">
        <Seal size={56} animate />
      </span>
    </div>
  );
}

/* ---------- Features ---------- */

interface Feature {
  icon: LucideIcon;
  tone: string;
  title: string;
  body: string;
  detail: ReactNode;
}

const FEATURES: Feature[] = [
  {
    icon: BookOpen,
    tone: 'bg-accent-wash text-accent-text',
    title: 'Curated for Textbooks',
    body: 'Every word follows the SNU Korean course, unit by unit, so what you drill tonight is what your class covers tomorrow.',
    detail: (
      <div className="flex gap-2">
        {['1A', '1B', '2A'].map((b) => (
          <span key={b} className="rounded-xl border-2 border-rule-soft bg-ink px-3 py-1 font-serif text-[17px] leading-none">
            {b}
          </span>
        ))}
      </div>
    ),
  },
  {
    icon: Leaf,
    tone: 'bg-flame-wash text-flame-ink',
    title: 'Zen & Gamified',
    body: 'Soft sounds, a daily streak and a night mode for late study. Calm enough to focus, rewarding enough to come back.',
    detail: (
      <div className="flex flex-wrap gap-2 text-[12px] font-bold text-hanji-2">
        {(
          [
            [Volume2, 'Soft sounds'],
            [Flame, 'Streaks'],
            [Moon, 'Night mode'],
          ] as const
        ).map(([Icon, label]) => (
          <span key={label} className="flex items-center gap-1.5 rounded-full bg-ink px-2.5 py-1">
            <Icon size={13} aria-hidden /> {label}
          </span>
        ))}
      </div>
    ),
  },
  {
    icon: Quote,
    tone: 'bg-sky-wash text-sky',
    title: 'Contextual Examples',
    body: 'Each word comes with a short, grammar-accurate sentence, so you learn how it is used, not just what it means.',
    detail: (
      <p className="rounded-xl bg-ink px-3 py-2">
        <span className="block font-serif text-[17px] leading-snug">
          네, 저는 <span className="text-accent-text">학생</span>이에요.
        </span>
        <span className="text-[12px] font-semibold text-hanji-2">Yes, I’m a student.</span>
      </p>
    ),
  },
];

function FeatureCard({ f, i }: { f: Feature; i: number }) {
  const { ref, revealed } = useReveal<HTMLElement>();
  const Icon = f.icon;
  return (
    <article
      ref={ref}
      style={{ '--i': i } as CSSProperties}
      className={`reveal flex flex-col gap-4 rounded-[24px] border-2 border-rule bg-ink-2 p-6 sm:p-7 ${revealed ? 'is-revealed' : ''}`}
    >
      <span className={`grid size-12 place-items-center rounded-2xl ${f.tone}`}>
        <Icon size={22} strokeWidth={2.2} aria-hidden />
      </span>
      <div>
        <h3 className="text-[19px] font-black leading-tight">{f.title}</h3>
        <p className="mt-2 text-[15px] leading-relaxed text-hanji-2">{f.body}</p>
      </div>
      <div className="mt-auto pt-2">{f.detail}</div>
    </article>
  );
}

/* ---------- PWA install banner ---------- */

function InstallBanner({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-4 pb-[max(16px,env(safe-area-inset-bottom))]">
      <aside
        aria-label="Install the app"
        className="anim-sheet pointer-events-auto mx-auto flex max-w-xl items-center gap-3 rounded-[22px] border-2 border-rule bg-ink-2 p-3 shadow-[0_5px_0_var(--color-rule)] sm:gap-4 sm:p-4"
      >
        <img src={ICON_SRC} alt="" width={48} height={48} className="size-11 shrink-0 sm:size-12" />
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-black leading-tight">Install <span className="font-serif font-normal">어휘장</span></p>
          <p className="mt-0.5 flex items-center gap-1.5 text-[13px] leading-snug text-hanji-2">
            <WifiOff size={13} className="hidden shrink-0 sm:block" aria-hidden />
            Opens in a tap and studies offline.
          </p>
        </div>
        <button type="button" className="juicy lip-accent flex h-10 shrink-0 items-center gap-1.5 bg-accent px-4 text-[14px] font-extrabold text-white">
          <Download size={15} strokeWidth={2.6} aria-hidden /> Install
        </button>
        <button type="button" onClick={onDismiss} aria-label="Not now" className="press grid size-9 shrink-0 place-items-center rounded-full text-hanji-2 hover:bg-ink-3 hover:text-hanji">
          <X size={18} aria-hidden />
        </button>
      </aside>
    </div>
  );
}

/* ---------- Page ---------- */

export default function Welcome({ onStart }: { onStart?: () => void }) {
  const [install, setInstall] = useState(false);

  // Let the hero land first; the install suggestion arrives a moment later.
  useEffect(() => {
    const id = window.setTimeout(() => setInstall(true), 1400);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <div className="scroll-smooth-motion h-full overflow-y-auto overflow-x-hidden bg-ink text-hanji">
      <header className="mx-auto flex max-w-6xl items-center gap-2.5 px-5 pt-5 sm:px-8 sm:pt-7">
        <img src={ICON_SRC} alt="" width={36} height={36} className="size-9" />
        <span className="font-serif text-[26px] leading-none text-accent">어휘장</span>
        <span className="ml-1 hidden text-[13px] font-bold text-hanji-2 sm:inline">Eohwijang</span>
      </header>

      <main>
        <section className="mx-auto grid max-w-6xl items-center gap-14 px-5 pb-20 pt-14 sm:px-8 md:pt-20 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-16 lg:pb-28 lg:pt-24">
          <div className="anim-rise max-w-xl">
            <p className="text-[12px] font-black uppercase tracking-[0.16em] text-accent-text">Korean vocabulary · SNU 1A–2A</p>
            <h1 className="mt-5 text-[44px] font-black leading-[1.02] tracking-[-0.03em] sm:text-[60px] lg:text-[68px]">
              Master Korean vocabulary. <span className="text-accent">Beautifully.</span>
            </h1>
            <p className="mt-6 max-w-[46ch] text-[17px] leading-relaxed text-hanji-2 sm:text-[18px]">
              Type each word from memory in small, calm blocks. Prompts in Uzbek, Russian or English, and every mistake shown down to the letter.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4">
              <button
                type="button"
                onClick={onStart}
                className="juicy lip-accent group flex h-14 items-center gap-2.5 bg-accent px-7 text-[16px] font-black tracking-[0.02em] text-white"
              >
                Start Learning Now
                <ArrowRight size={19} strokeWidth={2.8} className="transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden />
              </button>
              <a href="#features" onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                }}
                 className="text-[14px] font-extrabold text-hanji-2 underline decoration-rule decoration-2 underline-offset-[6px] hover:text-hanji">
                See what’s inside
              </a>
            </div>
            <p className="mt-8 text-[13px] font-semibold text-hanji-2/80">Free · No account needed · Works offline</p>
          </div>

          <div className="anim-rise [--i:2]">
            <RecallCard />
          </div>
        </section>

        <section id="features" aria-labelledby="features-title" className="border-t-2 border-rule-soft">
          <div className="mx-auto max-w-6xl px-5 pb-40 pt-20 sm:px-8 lg:pt-24">
            <div className="max-w-xl">
              <p className="text-[12px] font-black uppercase tracking-[0.16em] text-hanji-2">Why <span className="font-serif font-normal tracking-normal">어휘장</span></p>
              <h2 id="features-title" className="mt-3 text-[30px] font-black leading-tight tracking-[-0.02em] sm:text-[38px]">
                Quiet tools for exact recall.
              </h2>
            </div>
            <div className="mt-10 grid gap-5 md:grid-cols-3 md:gap-6">
              {FEATURES.map((f, i) => (
                <FeatureCard key={f.title} f={f} i={i} />
              ))}
            </div>
            <p className="mt-16 text-center text-[12px] text-hanji-2/80">Not affiliated with Seoul National University or its publisher.</p>
          </div>
        </section>
      </main>

      {install && <InstallBanner onDismiss={() => setInstall(false)} />}
    </div>
  );
}
