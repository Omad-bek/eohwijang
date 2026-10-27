/**
 * Feedback, variant B, "Topic cards": choosing a topic is the first, biggest step: four
 * colour-coded cards in a 2×2 grid, then the message and contact below. A centered card on every
 * screen size, with a playful icon badge in the header.
 */
import { useRef } from 'react';
import { MessageSquareHeart, Send, X } from 'lucide-react';
import { CONTACT_MAX, FEEDBACK_CATEGORIES, type FeedbackCategory } from '../../lib/feedback';
import { useFeedbackForm } from './useFeedbackForm';
import { CATEGORY_ICON, Captcha, Counter, DevLink, Honeypot, SentView, StatusLine, useDialog, type FeedbackDialogProps } from './parts';

const TONE: Record<FeedbackCategory, { on: string; icon: string }> = {
  bug: { on: 'border-danger bg-danger-wash', icon: 'bg-danger-wash text-danger-text' },
  word: { on: 'border-sky bg-sky-wash', icon: 'bg-sky-wash text-sky' },
  idea: { on: 'border-amber bg-amber-wash', icon: 'bg-amber-wash text-amber' },
  other: { on: 'border-indigo bg-indigo-wash', icon: 'bg-indigo-wash text-indigo' },
};

const field = 'w-full rounded-2xl border-2 border-rule bg-ink px-4 text-[16px] text-hanji placeholder:text-hanji-2/80 focus:border-accent focus:outline-none';

export default function FeedbackDialogB({ t, context, online, onClose, send, siteKey }: FeedbackDialogProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useDialog(onClose, closeRef);
  const form = useFeedbackForm({ context, online, send, siteKey });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6" style={{ height: 'var(--app-h, 100%)' }}>
      <button type="button" aria-label={t.close} onClick={onClose} className="absolute inset-0 bg-hanji/50 backdrop-blur-[3px]" />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="fb-title"
        className="anim-pop relative flex max-h-full w-full max-w-lg flex-col overflow-hidden rounded-[32px] border-2 border-rule bg-ink-2 shadow-[0_8px_0_var(--color-rule)]"
      >
        <button ref={closeRef} type="button" onClick={onClose} aria-label={t.close} className="absolute right-3 top-3 z-10 rounded-full p-2 text-hanji-2 hover:bg-ink-3 hover:text-hanji">
          <X size={20} />
        </button>

        <div className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-6 pt-6 sm:px-7">
          <header className="flex flex-col items-center text-center">
            <span className="grid size-14 -rotate-6 place-items-center rounded-2xl bg-accent text-white shadow-[0_4px_0_var(--color-accent-lip)]">
              <MessageSquareHeart size={28} strokeWidth={2.4} aria-hidden />
            </span>
            <h2 id="fb-title" className="mt-4 text-[26px] font-black leading-tight tracking-[-0.01em]">
              {t.sendFeedback}
            </h2>
            <p className="mt-1.5 max-w-[36ch] text-[14px] leading-relaxed text-hanji-2">{t.fbLead}</p>
          </header>

          {form.phase === 'sent' ? (
            <SentView t={t} onClose={onClose} cooldown={form.cooldown} />
          ) : (
            <form
              noValidate
              className="mt-6"
              onSubmit={(e) => {
                e.preventDefault();
                void form.submit();
              }}
            >
              <Honeypot form={form} />
              <fieldset>
                <legend className="mb-2.5 text-[15px] font-black">{t.fbCategory}</legend>
                <div className="grid grid-cols-2 gap-2.5">
                  {FEEDBACK_CATEGORIES.map((c) => {
                    const Icon = CATEGORY_ICON[c];
                    const on = form.category === c;
                    return (
                      <label
                        key={c}
                        className={`press flex min-h-[84px] cursor-pointer flex-col items-start justify-between gap-2 rounded-2xl border-2 p-3 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent ${
                          on ? TONE[c].on : 'border-rule bg-ink hover:border-hanji-2/50'
                        }`}
                      >
                        <input type="radio" name="fb-category" value={c} checked={on} onChange={() => form.setCategory(c)} className="sr-only" />
                        <span className={`grid size-9 place-items-center rounded-xl ${TONE[c].icon}`}>
                          <Icon size={19} strokeWidth={2.5} aria-hidden />
                        </span>
                        <span className="text-[14px] font-extrabold leading-tight">{t.fbCategories[c]}</span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              <label htmlFor="fb-message" className="mt-6 block text-[15px] font-black">
                {t.fbMessage}
              </label>
              <textarea
                id="fb-message"
                value={form.message}
                onChange={(e) => form.setMessage(e.target.value)}
                rows={4}
                placeholder={t.fbMessagePlaceholder}
                className={`${field} mt-2 resize-y py-3 leading-relaxed`}
              />
              <div className="mt-1.5 text-right">
                <Counter t={t} form={form} />
              </div>

              <label htmlFor="fb-contact" className="mt-3 block text-[15px] font-black">
                {t.fbContact}
              </label>
              <p id="fb-contact-hint" className="text-[12px] text-hanji-2">
                {t.fbContactHint}
              </p>
              <input
                id="fb-contact"
                value={form.contact}
                onChange={(e) => form.setContact(e.target.value)}
                maxLength={CONTACT_MAX}
                autoComplete="off"
                placeholder="@username · name@example.com"
                aria-describedby="fb-contact-hint"
                className={`${field} mt-2 h-12`}
              />

              <div className="mt-5 space-y-3">
                <Captcha form={form} />
                <StatusLine t={t} form={form} />
                <button
                  type="submit"
                  disabled={!form.canSend}
                  className="juicy lip-accent flex h-14 w-full items-center justify-center gap-2.5 rounded-2xl bg-accent text-[17px] font-black text-white"
                >
                  {form.phase === 'sending' ? t.fbSending : t.fbSend}
                  <Send size={18} strokeWidth={2.6} aria-hidden />
                </button>
                <p className="text-center text-[12px] leading-relaxed text-hanji-2">{t.fbAttached}</p>
                <p className="text-center">
                  <DevLink t={t} />
                </p>
              </div>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
