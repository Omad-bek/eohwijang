/**
 * Privacy, variant B, "Cards": a green-washed hero with the four facts as big tiles, then one
 * card per topic in a two-column grid, with erasing your data given its own highlighted card.
 * Same words as variant A (./content.ts). Lab: #design-lab/privacy/b.
 */
import { useEffect } from 'react';
import { ShieldCheck } from 'lucide-react';
import { dropPrerender } from '../../lib/route';
import { BackLink, FeedbackButton, PrivacyFooter } from './PrivacyA';
import { GLANCE, INTRO, SECTIONS } from './content';

export default function PrivacyB({ onBack }: { onBack?: () => void }) {
  useEffect(dropPrerender, []);
  return (
    <div className="scroll-smooth-motion h-full overflow-y-auto text-hanji">
      <header className="relative isolate overflow-hidden border-b-2 border-rule-soft">
        <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_70%_at_50%_0%,var(--color-accent-wash),transparent_80%)]" />
        <div className="mx-auto max-w-5xl px-5 pb-12 pt-5 sm:px-8 sm:pt-7">
          <BackLink onBack={onBack} className="-ml-1" />
          <div className="mt-10 flex items-start gap-4">
            <span className="grid size-14 shrink-0 place-items-center rounded-[18px] bg-accent text-white shadow-[0_4px_0_var(--color-accent-lip)]">
              <ShieldCheck size={28} strokeWidth={2.3} aria-hidden />
            </span>
            <div>
              <h1 className="text-[40px] font-black leading-none tracking-[-0.03em] sm:text-[52px]">{INTRO.title}</h1>
              <p className="mt-4 max-w-[46ch] text-[18px] font-semibold leading-snug sm:text-[20px]">{INTRO.lead}</p>
            </div>
          </div>
          <ul className="mt-9 grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="In short">
            {GLANCE.map((g, i) => (
              <li
                key={g}
                className="flex min-h-[92px] flex-col justify-between rounded-[22px] border-2 border-rule bg-ink-2 p-4 text-[15px] font-black leading-snug shadow-[0_4px_0_var(--color-rule)]"
              >
                <span className="tabular text-[12px] font-black text-accent-text">0{i + 1}</span>
                {g}
              </li>
            ))}
          </ul>
        </div>
      </header>

      <main className="mx-auto grid max-w-5xl gap-5 px-5 py-12 sm:px-8 md:grid-cols-2">
        {SECTIONS.map(({ id, icon: Icon, title, body, list }) => {
          const erase = id === 'erase';
          const wide = erase || id === 'sync' || id === 'device';
          return (
            <section
              key={id}
              aria-labelledby={`pb-${id}`}
              className={`rounded-[26px] border-2 p-6 sm:p-7 ${wide ? 'md:col-span-2' : ''} ${
                erase ? 'border-flame/50 bg-flame-wash' : 'border-rule bg-ink-2'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`grid size-11 shrink-0 place-items-center rounded-2xl ${erase ? 'bg-flame text-on-bright' : 'bg-accent-wash text-accent-text'}`}>
                  <Icon size={21} strokeWidth={2.4} aria-hidden />
                </span>
                <h2 id={`pb-${id}`} className="text-[21px] font-black leading-tight">
                  {title}
                </h2>
              </div>
              <p className="mt-4 text-[15.5px] leading-relaxed text-hanji-2">{body[0]}</p>
              {list && (
                <ul className={`mt-3 grid gap-2 ${wide && list.length > 3 ? 'lg:grid-cols-2' : ''}`}>
                  {list.map((item) => (
                    <li key={item} className={`rounded-2xl px-4 py-2.5 text-[15px] leading-snug ${erase ? 'bg-ink-2/70' : 'bg-ink'}`}>
                      {item}
                    </li>
                  ))}
                </ul>
              )}
              {body.slice(1).map((p) => (
                <p key={p} className="mt-3 text-[15.5px] leading-relaxed text-hanji-2">
                  {p}
                </p>
              ))}
              {id === 'contact' && (
                <div className="mt-5">
                  <FeedbackButton />
                </div>
              )}
            </section>
          );
        })}
      </main>

      <div className="mx-auto max-w-5xl px-5 pb-12 sm:px-8">
        <PrivacyFooter />
      </div>
    </div>
  );
}
