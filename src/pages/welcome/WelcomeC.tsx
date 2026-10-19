/**
 * Welcome, variant C, "Jamo tiles": the app icon's world blown up. A green hero panel where loose
 * jamo tiles assemble into 어휘장, a bento grid of tactile feature cards, and a floating install card.
 * Design-lab preview only (#design-lab/welcome/c); the CTA and install buttons are inert.
 */
import type { CSSProperties, ReactNode } from 'react';
import { ArrowDown, ArrowRight, Download, Flame, Moon, Sparkle, Volume2 } from 'lucide-react';
import { useReveal } from '../../lib/hooks';
import { BOOKS, DISCLAIMER, FEATURES, HERO, ICON_SRC, SAMPLE, useInstallBanner } from './content';

/* ---------- Tiles (fixed icon colors: they sit on the green panel in both themes) ---------- */

const TILE = {
  cream: 'bg-[#fff8ee] text-[#3b2a1e] shadow-[0_5px_0_#d9c4a3]',
  gold: 'bg-gold text-on-bright shadow-[0_5px_0_var(--color-gold-lip)]',
  deep: 'bg-accent-lip text-white shadow-[0_5px_0_rgba(0,0,0,0.28)]',
};

function Tile({ ch, tone, className = '', style }: { ch: string; tone: keyof typeof TILE; className?: string; style?: CSSProperties }) {
  return (
    <span aria-hidden style={style} className={`anim-pop grid place-items-center font-serif leading-none ${TILE[tone]} ${className}`}>
      {ch}
    </span>
  );
}

// 어휘장 = ㅇㅓ · ㅎㅟ · ㅈㅏㅇ
const GROUPS: { jamo: string[]; syl: string; tone: keyof typeof TILE }[] = [
  { jamo: ['ㅇ', 'ㅓ'], syl: '어', tone: 'cream' },
  { jamo: ['ㅎ', 'ㅟ'], syl: '휘', tone: 'gold' },
  { jamo: ['ㅈ', 'ㅏ', 'ㅇ'], syl: '장', tone: 'cream' },
];

function TileBoard() {
  let n = 0;
  return (
    <div className="relative mx-auto flex w-full max-w-[440px] flex-col items-center gap-6 py-4">
      <Sparkle size={22} className="anim-drift absolute -top-2 left-4 fill-gold text-gold" aria-hidden />
      <Sparkle size={14} className="anim-drift absolute right-6 top-24 fill-gold text-gold [animation-delay:-4s]" aria-hidden />

      <div className="flex gap-3.5 sm:gap-5">
        {GROUPS.map((g) => (
          <div key={g.syl} className="flex gap-1.5 sm:gap-2">
            {g.jamo.map((j, i) => {
              const k = n++;
              // A slight, repeating tilt so the loose letters look scattered, not typeset.
              return (
                <Tile
                  key={i}
                  ch={j}
                  tone="deep"
                  className="size-10 rounded-xl text-[22px] sm:size-[52px] sm:rounded-2xl sm:text-[28px]"
                  style={{ animationDelay: `${250 + k * 70}ms`, rotate: `${((k % 3) - 1) * 4}deg` }}
                />
              );
            })}
          </div>
        ))}
      </div>

      <ArrowDown size={22} strokeWidth={2.6} className="text-white/60" aria-hidden />

      <div className="flex gap-3 sm:gap-4">
        {GROUPS.map((g, i) => (
          <Tile
            key={g.syl}
            ch={g.syl}
            tone={g.tone}
            className="size-[88px] rounded-[24px] text-[50px] sm:size-[112px] sm:rounded-[28px] sm:text-[64px]"
            style={{ animationDelay: `${900 + i * 110}ms` }}
          />
        ))}
      </div>
      <p className="text-[13px] font-bold text-white/75">Letters in, words out.</p>
    </div>
  );
}

/* ---------- Bento features ---------- */

const CARD = 'reveal flex flex-col rounded-[28px] border-2 border-rule bg-ink-2 p-6 shadow-[0_6px_0_var(--color-rule)] sm:p-8';

function Bento({ i, className, tone, children }: { i: number; className: string; tone: string; children: ReactNode }) {
  const { ref, revealed } = useReveal<HTMLElement>();
  const { icon: Icon, title, body } = FEATURES[i];
  return (
    <article ref={ref} style={{ '--i': i } as CSSProperties} className={`${CARD} ${className} ${revealed ? 'is-revealed' : ''}`}>
      <span className={`grid size-12 place-items-center rounded-2xl ${tone}`}>
        <Icon size={22} strokeWidth={2.4} aria-hidden />
      </span>
      <h3 className="mt-5 text-[21px] font-black leading-tight">{title}</h3>
      <p className="mt-2 max-w-[42ch] text-[15px] leading-relaxed text-hanji-2">{body}</p>
      <div className="mt-auto pt-6">{children}</div>
    </article>
  );
}

function Features() {
  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
      <Bento i={0} tone="bg-accent-wash text-accent-text" className="md:col-span-2 lg:col-span-1 lg:row-span-2">
        <div className="flex gap-3 lg:flex-col">
          {BOOKS.map((b, k) => (
            <span
              key={b}
              className={`grid h-16 flex-1 place-items-center rounded-2xl font-serif text-[28px] leading-none lg:h-20 lg:flex-none ${
                k === 0 ? 'bg-accent text-white shadow-[0_5px_0_var(--color-accent-lip)]' : 'border-2 border-rule bg-ink text-hanji shadow-[0_5px_0_var(--color-rule)]'
              }`}
            >
              {b}
            </span>
          ))}
        </div>
      </Bento>

      <Bento i={1} tone="bg-flame-wash text-flame-ink" className="lg:col-span-2">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
          <span className="flex items-center gap-2">
            <span className="grid size-12 place-items-center rounded-2xl bg-flame text-on-bright shadow-[0_5px_0_var(--color-flame-lip)]">
              <Flame size={24} strokeWidth={2.4} className="anim-flicker" aria-hidden />
            </span>
            <span className="leading-tight">
              <span className="block text-[24px] font-black tabular">12</span>
              <span className="text-[12px] font-bold text-hanji-2">day streak</span>
            </span>
          </span>
          <span className="flex gap-2 text-[12px] font-bold text-hanji-2">
            <span className="flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5">
              <Volume2 size={13} aria-hidden /> Soft sounds
            </span>
            <span className="flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5">
              <Moon size={13} aria-hidden /> Night mode
            </span>
          </span>
        </div>
      </Bento>

      <Bento i={2} tone="bg-sky-wash text-sky" className="lg:col-span-2">
        <p className="rounded-2xl border-2 border-rule-soft bg-ink px-4 py-3">
          <span className="block font-serif text-[22px] leading-snug">
            {SAMPLE.example.before}
            <span className="rounded-md bg-gold/35">{SAMPLE.example.word}</span>
            {SAMPLE.example.after}
          </span>
          <span className="text-[13px] font-semibold text-hanji-2">{SAMPLE.example.en}</span>
        </p>
      </Bento>
    </div>
  );
}

/* ---------- Floating install card ---------- */

function InstallCard({ onDismiss }: { onDismiss: () => void }) {
  return (
    <aside
      aria-label="Install the app"
      className="anim-sheet fixed inset-x-4 bottom-[max(16px,env(safe-area-inset-bottom))] z-40 rounded-[26px] border-2 border-rule bg-ink-2 p-4 shadow-[0_6px_0_var(--color-rule)] sm:left-auto sm:right-6 sm:w-[340px] sm:p-5"
    >
      <div className="flex items-center gap-3.5">
        <img src={ICON_SRC} alt="" width={56} height={56} className="size-14 shrink-0 -rotate-6" />
        <div className="min-w-0">
          <p className="text-[16px] font-black leading-tight">
            Take <span className="font-serif font-normal">어휘장</span> offline
          </p>
          <p className="mt-1 text-[13px] leading-snug text-hanji-2">Install it: one tap to open, no signal needed.</p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-[1fr_auto] gap-2">
        <button type="button" className="juicy lip-accent flex h-11 items-center justify-center gap-2 bg-accent text-[14px] font-extrabold text-white">
          <Download size={16} strokeWidth={2.6} aria-hidden /> Install app
        </button>
        <button type="button" onClick={onDismiss} className="press h-11 px-4 text-[13px] font-extrabold text-hanji-2 hover:text-hanji">
          Later
        </button>
      </div>
    </aside>
  );
}

/* ---------- Page ---------- */

export default function WelcomeC({ onStart }: { onStart?: () => void }) {
  const install = useInstallBanner();

  return (
    <div className="scroll-smooth-motion h-full overflow-y-auto overflow-x-hidden bg-ink text-hanji">
      <div className="p-3 sm:p-5">
        <section className="relative overflow-hidden rounded-[32px] bg-accent text-white sm:rounded-[40px]">
          {/* Two soft discs give the panel depth without a gradient wash. */}
          <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-white/[0.06]" />
          <div aria-hidden className="pointer-events-none absolute -bottom-32 -left-20 size-96 rounded-full bg-black/[0.06]" />

          <header className="relative mx-auto flex max-w-6xl items-center gap-2.5 px-6 pt-6 sm:px-12 sm:pt-8">
            <img src={ICON_SRC} alt="" width={36} height={36} className="size-9 rounded-[10px]" />
            <span className="font-serif text-[26px] leading-none">어휘장</span>
          </header>

          <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 pb-14 pt-12 sm:px-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:pb-20 lg:pt-16">
            <div className="anim-rise">
              <p className="inline-flex rounded-full bg-black/15 px-3 py-1.5 text-[12px] font-black uppercase tracking-[0.14em] text-white/90">{HERO.eyebrow}</p>
              <h1 className="mt-6 text-[44px] font-black leading-[1] tracking-[-0.03em] sm:text-[62px] lg:text-[70px]">
                {HERO.lead} <span className="text-gold">{HERO.accent}</span>
              </h1>
              <p className="mt-6 max-w-[44ch] text-[17px] leading-relaxed text-white/85">{HERO.sub}</p>
              <button
                type="button"
                onClick={onStart}
                className="juicy lip-gold group mt-9 flex h-14 items-center gap-2.5 bg-gold px-7 text-[16px] font-black text-on-bright"
              >
                {HERO.cta}
                <ArrowRight size={19} strokeWidth={2.8} className="transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden />
              </button>
              <p className="mt-6 text-[13px] font-semibold text-white/70">{HERO.note}</p>
            </div>
            <TileBoard />
          </div>
        </section>
      </div>

      <main className="mx-auto max-w-6xl px-5 pb-48 pt-14 sm:px-8 lg:pt-20">
        <h2 className="max-w-xl text-[30px] font-black leading-tight tracking-[-0.02em] sm:text-[40px]">
          Built for the way your <span className="text-accent-text">class</span> works.
        </h2>
        <div className="mt-10">
          <Features />
        </div>
        <p className="mt-16 text-center text-[12px] text-hanji-2/80">{DISCLAIMER}</p>
      </main>

      {install.show && <InstallCard onDismiss={install.dismiss} />}
    </div>
  );
}
