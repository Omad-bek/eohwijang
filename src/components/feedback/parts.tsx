import { useEffect, type RefObject } from 'react';
import { Bug, CircleCheck, Languages, Lightbulb, MessageCircle, WifiOff, type LucideIcon } from 'lucide-react';
import type { Strings } from '../../lib/i18n';
import { GITHUB_URL } from '../../lib/route';
import type { FeedbackCategory, FeedbackContext, FeedbackPayload, SendResult } from '../../lib/feedback';
import { MESSAGE_MAX, MESSAGE_MIN } from '../../lib/feedback';
import type { FeedbackForm } from './useFeedbackForm';

/** What every dialog variant receives. */
export interface FeedbackDialogProps {
  t: Strings;
  context: FeedbackContext;
  online: boolean;
  onClose: () => void;
  /** Design lab only. */
  send?: (payload: FeedbackPayload) => Promise<SendResult>;
  siteKey?: string;
}

export const CATEGORY_ICON: Record<FeedbackCategory, LucideIcon> = { bug: Bug, word: Languages, idea: Lightbulb, other: MessageCircle };

/** Escape closes; focus moves in on open and back to whatever opened the dialog on close. */
export function useDialog(onClose: () => void, firstFocus: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    firstFocus.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      prev?.focus?.();
    };
  }, [onClose, firstFocus]);
}

/** A field only bots fill in: off screen, out of the tab order, hidden from screen readers. */
export function Honeypot({ form }: { form: FeedbackForm }) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute -left-[9999px] top-0 h-px w-px overflow-hidden">
      <label>
        Website
        <input type="text" name="website" tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => form.setWebsite(e.target.value)} />
      </label>
    </div>
  );
}

/** Characters used, and why Send is still off. */
export function Counter({ t, form, className = '' }: { t: Strings; form: FeedbackForm; className?: string }) {
  return (
    <span className={`tabular text-[12px] font-bold ${form.tooShort ? 'text-amber' : 'text-hanji-2'} ${className}`}>
      {form.tooShort ? `${t.fbTooShort(MESSAGE_MIN)} · ` : ''}
      {form.count} / {MESSAGE_MAX}
    </span>
  );
}

/** Offline, error and cooldown messages, read out when they change. */
export function StatusLine({ t, form }: { t: Strings; form: FeedbackForm }) {
  const text =
    form.error === 'offline'
      ? t.fbOffline
      : form.error === 'rate_limited'
        ? t.fbRateLimited
        : form.error === 'captcha'
          ? t.fbCaptcha
          : form.error === 'error'
            ? t.fbError
            : form.cooldown > 0
              ? t.fbCooldown(form.cooldown)
              : '';
  return (
    <p aria-live="polite" className={`min-h-5 text-[13px] font-semibold ${form.error ? 'text-danger-text' : 'text-hanji-2'}`}>
      {form.error === 'offline' && <WifiOff size={14} className="mr-1.5 inline -translate-y-px" aria-hidden />}
      {text}
    </p>
  );
}

/** Where the invisible Turnstile check lives; it shows a box only when Cloudflare asks for one. */
export function Captcha({ form }: { form: FeedbackForm }) {
  return <div ref={form.captchaRef} className="flex justify-center empty:hidden" />;
}

export function SentView({ t, onClose, cooldown }: { t: Strings; onClose: () => void; cooldown: number }) {
  return (
    <div className="flex flex-col items-center px-2 py-8 text-center" role="status">
      <span className="anim-pop grid size-16 place-items-center rounded-full bg-accent-wash text-accent-text">
        <CircleCheck size={34} strokeWidth={2.4} aria-hidden />
      </span>
      <h3 className="mt-4 text-[22px] font-black">{t.fbSentTitle}</h3>
      <p className="mt-1.5 max-w-[34ch] text-[15px] leading-relaxed text-hanji-2">{t.fbSentBody}</p>
      {cooldown > 0 && <p className="tabular mt-3 text-[12px] font-semibold text-hanji-2">{t.fbCooldown(cooldown)}</p>}
      <button type="button" onClick={onClose} className="juicy lip-rule mt-6 h-12 rounded-2xl border-2 border-rule bg-ink-2 px-7 text-[15px] font-extrabold">
        {t.close}
      </button>
    </div>
  );
}

export function DevLink({ t }: { t: Strings }) {
  return (
    <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="text-[12px] font-bold text-hanji-2 underline-offset-2 hover:text-hanji hover:underline">
      {t.fbDevelopers}
    </a>
  );
}
