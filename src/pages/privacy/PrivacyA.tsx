/**
 * Privacy, variant A, "Document": one calm reading column, like a well-set letter. The four
 * facts sit up top as a checklist, then each topic is a short headed section. App.tsx serves it
 * at /privacy; the design lab previews it at #design-lab/privacy/a.
 */
import { useEffect } from 'react';
import { ArrowLeft, Check, MessageSquareText } from 'lucide-react';
import { FEEDBACK_URL, GITHUB_URL, dropPrerender, hrefFor } from '../../lib/route';
import { GLANCE, INTRO, SECTIONS, UPDATED } from './content';

const ICON_SRC = `${import.meta.env.BASE_URL}favicon.svg`;

export function BackLink({ onBack, className = '' }: { onBack?: () => void; className?: string }) {
  return (
    <a
      href={hrefFor('app')}
      onClick={(e) => {
        if (!onBack) return;
        e.preventDefault();
        onBack();
      }}
      className={`press flex items-center gap-2 rounded-full py-2 pr-3 text-[14px] font-extrabold text-hanji-2 hover:text-hanji ${className}`}
    >
      <ArrowLeft size={18} strokeWidth={2.6} aria-hidden />
      <img src={ICON_SRC} alt="" width={24} height={24} className="size-6" />
      <span className="font-serif text-[19px] leading-none text-hanji">어휘장</span>
    </a>
  );
}

export function FeedbackButton() {
  return (
    <a
      href={FEEDBACK_URL}
      target="_blank"
      rel="noreferrer"
      className="juicy lip-accent inline-flex h-12 items-center gap-2 bg-accent px-5 text-[15px] font-black text-white"
    >
      <MessageSquareText size={18} strokeWidth={2.5} aria-hidden /> Send feedback
    </a>
  );
}

export function PrivacyFooter() {
  return (
    <footer className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t-2 border-rule-soft pt-6 text-[13px] font-bold text-hanji-2">
      <span>Last updated {UPDATED}</span>
      <nav aria-label="Site" className="flex gap-5">
        <a href={hrefFor('about')} className="hover:text-hanji">
          About
        </a>
        <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="hover:text-hanji">
          Source code
        </a>
      </nav>
    </footer>
  );
}

export default function PrivacyA({ onBack }: { onBack?: () => void }) {
  useEffect(dropPrerender, []);
  return (
    <div className="scroll-smooth-motion h-full overflow-y-auto text-hanji">
      <div className="mx-auto max-w-2xl px-5 pb-16 pt-5 sm:px-8 sm:pt-8">
        <BackLink onBack={onBack} className="-ml-1" />

        <header className="mt-10">
          <h1 className="text-[44px] font-black leading-none tracking-[-0.03em] sm:text-[56px]">{INTRO.title}</h1>
          <p className="mt-5 text-[19px] font-semibold leading-snug sm:text-[21px]">{INTRO.lead}</p>
          <ul className="mt-6 grid gap-2 sm:grid-cols-2" aria-label="In short">
            {GLANCE.map((g) => (
              <li key={g} className="flex items-center gap-2.5 rounded-2xl border-2 border-rule bg-ink-2 px-3.5 py-2.5 text-[14px] font-extrabold">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-accent text-white">
                  <Check size={14} strokeWidth={3.2} aria-hidden />
                </span>
                {g}
              </li>
            ))}
          </ul>
        </header>

        <main className="mt-12 space-y-10">
          {SECTIONS.map(({ id, icon: Icon, title, body, list }) => (
            <section key={id} aria-labelledby={`p-${id}`}>
              <h2 id={`p-${id}`} className="flex items-center gap-2.5 text-[22px] font-black leading-tight">
                <Icon size={21} strokeWidth={2.4} className="shrink-0 text-accent-text" aria-hidden />
                {title}
              </h2>
              {/* The list belongs after the first paragraph; any further paragraphs follow it. */}
              <p className="mt-3 text-[16px] leading-relaxed text-hanji-2">{body[0]}</p>
              {list && (
                <ul className="mt-3 space-y-2 pl-1">
                  {list.map((item) => (
                    <li key={item} className="flex gap-3 text-[16px] leading-relaxed text-hanji-2">
                      <span aria-hidden className="mt-[0.7em] size-1.5 shrink-0 rounded-full bg-accent" />
                      {item}
                    </li>
                  ))}
                </ul>
              )}
              {body.slice(1).map((p) => (
                <p key={p} className="mt-3 text-[16px] leading-relaxed text-hanji-2">
                  {p}
                </p>
              ))}
              {id === 'contact' && (
                <div className="mt-5">
                  <FeedbackButton />
                </div>
              )}
            </section>
          ))}
        </main>

        <div className="mt-14">
          <PrivacyFooter />
        </div>
      </div>
    </div>
  );
}
