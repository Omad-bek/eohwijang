/**
 * The About page's "Bugs & feedback" band: how to report a bug or a wrong word in three steps,
 * drawn with the real floating button and the form's own topics.
 */
import type { CSSProperties } from 'react';
import { Bug, Languages, Lightbulb, MessageCircle, Send, type LucideIcon } from 'lucide-react';
import { BUBBLE, BUG_INK } from '../../components/feedback/FeedbackFab';
import { useReveal } from '../../lib/hooks';
import { STRINGS } from '../../lib/i18n';

const T = STRINGS.en;
const TOPICS: { id: keyof typeof T.fbCategories; icon: LucideIcon; tone: string }[] = [
  { id: 'bug', icon: Bug, tone: 'bg-flame-wash text-flame-ink' },
  { id: 'word', icon: Languages, tone: 'bg-accent-wash text-accent-text' },
  { id: 'idea', icon: Lightbulb, tone: 'bg-amber-wash text-amber' },
  { id: 'other', icon: MessageCircle, tone: 'bg-sky-wash text-sky' },
];

const LEAD = 'Found a bug or a wrong word?';
const PRIVATE = 'No account needed. Leave a Telegram username or email only if you want a reply.';

/** The floating feedback button as it looks in the corner, drawn still. */
function MiniBubble({ size = 64 }: { size?: number }) {
  return (
    <span aria-hidden className="relative inline-block shrink-0" style={{ width: size, height: size * 0.94 }}>
      <svg viewBox="0 0 64 60" className="absolute inset-0 size-full overflow-visible fill-accent drop-shadow-[0_4px_0_var(--color-accent-lip)]">
        <path d={BUBBLE} />
      </svg>
      <span className={`absolute inset-x-0 top-0 grid place-items-center ${BUG_INK}`} style={{ height: size * 0.81 }}>
        <Bug size={size * 0.42} strokeWidth={2.4} />
      </span>
    </span>
  );
}

function TopicChips({ small = false }: { small?: boolean }) {
  return (
    <ul className="flex flex-wrap gap-2" aria-label="Feedback topics">
      {TOPICS.map(({ id, icon: Icon, tone }) => (
        <li key={id} className={`flex items-center gap-2 rounded-full border-2 border-rule bg-ink-2 font-extrabold ${small ? 'h-9 pl-1 pr-3 text-[13px]' : 'h-10 pl-1.5 pr-4 text-[14px]'}`}>
          <span className={`grid place-items-center rounded-full ${tone} size-7`}>
            <Icon size={15} strokeWidth={2.5} aria-hidden />
          </span>
          {T.fbCategories[id]}
        </li>
      ))}
    </ul>
  );
}

function FeedbackButton({ onFeedback, label = 'Send feedback', tone = 'accent' }: { onFeedback?: () => void; label?: string; tone?: 'accent' | 'gold' }) {
  return (
    <button
      type="button"
      onClick={onFeedback}
      className={`juicy flex h-12 items-center gap-2 px-6 text-[15px] font-black ${tone === 'gold' ? 'lip-gold bg-gold text-on-bright' : 'lip-accent bg-accent text-white'}`}
    >
      <Send size={16} strokeWidth={2.6} aria-hidden /> {label}
    </button>
  );
}

/** A full-width band with three numbered steps (tap the bubble, pick a topic, say what happened). */
export function FeedbackSteps({ onFeedback }: { onFeedback?: () => void }) {
  const { ref, revealed } = useReveal<HTMLElement>();
  const steps = [
    {
      title: 'Tap the bug bubble',
      body: 'It sits in the bottom-right corner of every screen. During a quiz on a phone it tucks into a small tab on the right edge.',
      visual: (
        <div className="grid h-28 place-items-center rounded-2xl bg-ink">
          <MiniBubble size={64} />
        </div>
      ),
    },
    {
      title: 'Pick a topic',
      body: 'A bug, a wrong word or translation, an idea, or anything else.',
      visual: (
        <div className="grid h-28 content-center rounded-2xl bg-ink px-3">
          <TopicChips small />
        </div>
      ),
    },
    {
      title: 'Say what happened',
      body: 'A sentence is enough. The book and unit you were on are attached for you, and a fixed word goes live for everyone.',
      visual: (
        <div className="flex h-28 flex-col justify-center gap-2 rounded-2xl bg-ink px-4">
          <span className="rounded-xl border-2 border-rule bg-ink-2 px-3 py-2 text-[13px] font-semibold text-hanji-2">“대세” shows the wrong Russian…</span>
          <span className="self-start rounded-full bg-accent-wash px-2.5 py-1 text-[11px] font-black text-accent-text">6A · 1과 attached</span>
        </div>
      ),
    },
  ];
  return (
    <section ref={ref} id="feedback-a" aria-labelledby="feedback-b-title" className="scroll-mt-4 border-y-2 border-rule-soft bg-ink-3/60">
      <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
        <p className="text-[12px] font-black uppercase tracking-[0.16em] text-accent-text">Bugs &amp; feedback</p>
        <h2 id="feedback-b-title" className="mt-3 max-w-[22ch] text-[30px] font-black leading-[1.1] tracking-[-0.02em] sm:text-[40px]">
          {LEAD} Three taps to tell me.
        </h2>
        <ol className="mt-12 grid gap-8 md:grid-cols-3">
          {steps.map((s, i) => (
            <li key={s.title} style={{ '--i': i } as CSSProperties} className={`reveal ${revealed ? 'is-revealed' : ''}`}>
              {s.visual}
              <p className="mt-5 flex items-baseline gap-3">
                <span className="text-[13px] font-black text-accent-text tabular">0{i + 1}</span>
                <span className="text-[19px] font-black leading-tight">{s.title}</span>
              </p>
              <p className="mt-1.5 pl-8 text-[15px] leading-relaxed text-hanji-2">{s.body}</p>
            </li>
          ))}
        </ol>
        <div className="mt-12 flex flex-wrap items-center gap-x-5 gap-y-3">
          <FeedbackButton onFeedback={onFeedback} />
          <span className="text-[13px] font-semibold text-hanji-2">{PRIVATE}</span>
        </div>
      </div>
    </section>
  );
}
