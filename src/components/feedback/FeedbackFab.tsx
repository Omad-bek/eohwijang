/**
 * The floating "send feedback" button: a green speech bubble with a bug, bottom right on every
 * screen, above the page and below dialogs (z-40). Picked in the design lab as variant A.
 *
 * On a phone during a quiz the answer field, its submit button and the onscreen keyboard own the
 * bottom of the screen, so it then tucks into a small tab on the right edge instead.
 */
import { useEffect, useState } from 'react';
import { Bug } from 'lucide-react';
import type { Strings } from '../../lib/i18n';

/** A soft red for the bug: a hint of "bug report" that still keeps 3:1 on the green in both themes. */
const BUG_INK = 'text-[#ffd2cc]';

/** A speech bubble with its tail at the bottom right, pointing into the corner it sits in. 64 × 60. */
const BUBBLE = 'M22 2H42A20 20 0 0 1 62 22V42Q62 52 60 58Q51 55 45 50H22A20 20 0 0 1 2 30V22A20 20 0 0 1 22 2Z';

/** Wiggles the bug once, a few seconds after the button appears, so it is noticed without nagging. */
function useWiggleOnce(delay = 2600) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const a = setTimeout(() => setOn(true), delay);
    const b = setTimeout(() => setOn(false), delay + 600);
    return () => {
      clearTimeout(a);
      clearTimeout(b);
    };
  }, [delay]);
  return on;
}

export function FeedbackFab({ t, onOpen, tucked }: { t: Strings; onOpen: () => void; tucked: boolean }) {
  const wiggle = useWiggleOnce();

  if (tucked) {
    return (
      <button
        type="button"
        onClick={onOpen}
        aria-label={t.sendFeedback}
        className={`fab anim-tab fixed right-0 top-[34%] z-40 grid h-12 w-9 place-items-center rounded-l-2xl border-2 border-r-0 border-accent-lip bg-accent pl-0.5 ${BUG_INK}`}
      >
        <Bug size={18} strokeWidth={2.5} aria-hidden className="fab-bug" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={t.sendFeedback}
      className="fab group anim-fab fixed bottom-[max(18px,calc(env(safe-area-inset-bottom)+10px))] right-[max(16px,env(safe-area-inset-right))] z-40 md:bottom-7 md:right-7"
    >
      <span className="lip-drop lip-accent relative block h-[60px] w-16">
        <svg viewBox="0 0 64 60" aria-hidden className="absolute inset-0 size-full overflow-visible fill-accent">
          <path d={BUBBLE} />
        </svg>
        <span className={`absolute inset-x-0 top-0 grid h-[52px] place-items-center ${BUG_INK}`}>
          <Bug size={27} strokeWidth={2.4} aria-hidden className={`fab-bug ${wiggle ? 'is-wiggling' : ''}`} />
        </span>
      </span>
      {/* Desktop only: the button's name slides out to its left on hover or keyboard focus. */}
      <span
        aria-hidden
        className="pointer-events-none absolute right-full top-1/2 mr-3 hidden -translate-y-1/2 translate-x-1.5 whitespace-nowrap rounded-xl bg-hanji px-3 py-1.5 text-[13px] font-extrabold text-ink opacity-0 transition duration-200 ease-out group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100 [@media(hover:hover)]:block"
      >
        {t.sendFeedback}
      </span>
    </button>
  );
}

/** Phones (below md): where the quiz's answer footer and keyboard fill the bottom of the screen. */
export function usePhone() {
  const [phone, setPhone] = useState(() => typeof matchMedia === 'function' && matchMedia('(max-width: 767px)').matches);
  useEffect(() => {
    const mq = matchMedia('(max-width: 767px)');
    const on = () => setPhone(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return phone;
}
