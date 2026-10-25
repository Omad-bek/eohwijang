/**
 * The link-preview image (og:image, 1200 × 630) as live markup, so it uses the app's own fonts
 * and tokens. scripts/make-og.mjs screenshots #og-card of the chosen variant to public/og-image.png.
 * It names no book list on purpose: an image can't update when books are added.
 */
import { Check } from 'lucide-react';

const ICON_SRC = `${import.meta.env.BASE_URL}favicon.svg`;
const WORD = ['호', '주'];

function Frame({ children, className }: { children: React.ReactNode; className: string }) {
  return (
    <div className="h-full overflow-auto p-4 md:p-6">
      <p className="mb-3 text-[13px] font-semibold text-hanji-2">
        1200 × 630, shown at full size. Make the PNG with <code className="text-hanji">npx -p playwright node scripts/make-og.mjs a</code> (or b).
      </p>
      <div id="og-card" style={{ width: 1200, height: 630 }} className={`relative isolate shrink-0 overflow-hidden ${className}`}>
        {children}
      </div>
    </div>
  );
}

/** A: the product in one picture: the prompt on the left, the typed word checked letter by letter on the right. */
export function OgA() {
  return (
    <Frame className="bg-ink text-hanji">
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_80%_at_78%_50%,var(--color-accent-wash),transparent_75%)]" />
      <div className="flex h-full items-center gap-14 px-20">
        <div className="w-[560px] shrink-0">
          <div className="flex items-center gap-4">
            <img src={ICON_SRC} alt="" width={72} height={72} className="size-[72px]" />
            <span className="font-serif text-[64px] leading-none text-accent">어휘장</span>
          </div>
          <p className="mt-10 text-[54px] font-black leading-[1.02] tracking-[-0.03em]">
            Type Korean words from memory, <span className="text-accent">letter by letter.</span>
          </p>
          <p className="mt-8 text-[24px] font-bold text-hanji-2">For the SNU Korean textbooks · UZ · RU · EN</p>
        </div>
        <div className="flex flex-1 flex-col items-center gap-6">
          <span className="rounded-full bg-ink-2 px-6 py-2.5 text-[26px] font-black shadow-[0_4px_0_var(--color-rule)]">Australia</span>
          <div className="flex gap-5">
            {WORD.map((s) => (
              <span
                key={s}
                className="relative grid size-[170px] place-items-center rounded-[40px] bg-accent font-serif text-[110px] leading-none text-white shadow-[0_10px_0_var(--color-accent-lip)]"
              >
                {s}
                <span className="absolute -right-3 -top-3 grid size-12 place-items-center rounded-full bg-gold text-on-bright">
                  <Check size={28} strokeWidth={3.4} />
                </span>
              </span>
            ))}
          </div>
          <span className="text-[22px] font-extrabold text-hanji-2">Free · No account · Works offline</span>
        </div>
      </div>
    </Frame>
  );
}

/** B: the brand, loud: the wordmark huge on the green, drifting jamo, one line of promise. */
export function OgB() {
  return (
    <Frame className="bg-accent text-white">
      <div aria-hidden className="absolute inset-0 -z-10 font-serif text-white/12">
        {[
          ['ㅎ', 'left-[6%] top-[8%] text-[160px] rotate-[-8deg]'],
          ['ㅗ', 'left-[78%] top-[4%] text-[130px] rotate-[10deg]'],
          ['ㅈ', 'left-[86%] top-[58%] text-[180px] rotate-[-6deg]'],
          ['ㅜ', 'left-[12%] top-[62%] text-[140px] rotate-[12deg]'],
          ['ㅇ', 'left-[60%] top-[70%] text-[110px]'],
        ].map(([j, c]) => (
          <span key={j} className={`absolute leading-none ${c}`}>
            {j}
          </span>
        ))}
      </div>
      <div className="flex h-full flex-col items-center justify-center text-center">
        <span className="rounded-full bg-gold px-6 py-2.5 text-[24px] font-black text-on-bright shadow-[0_5px_0_var(--color-gold-lip)]">Based on the SNU Korean textbooks</span>
        <span className="mt-8 font-serif text-[200px] leading-none drop-shadow-[0_8px_0_var(--color-accent-lip)]">어휘장</span>
        <p className="mt-8 text-[44px] font-black tracking-[-0.02em]">Every letter, from memory.</p>
        <p className="mt-3 text-[24px] font-bold text-white/80">Uzbek · Russian · English prompts · Free, no account</p>
      </div>
    </Frame>
  );
}
