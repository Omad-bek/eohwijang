/**
 * Feedback, variant A, "Sheet": the same frame as the Cloud Sync dialog (a bottom sheet on
 * phones, a centered card on wider screens), topics as a row of chips, one column of fields.
 */
import { useRef } from 'react';
import { Send, X } from 'lucide-react';
import { CONTACT_MAX, FEEDBACK_CATEGORIES } from '../../lib/feedback';
import { useFeedbackForm } from './useFeedbackForm';
import { CATEGORY_ICON, Captcha, Counter, DevLink, Honeypot, SentView, StatusLine, useDialog, type FeedbackDialogProps } from './parts';

const field = 'w-full rounded-2xl border-2 border-rule bg-ink px-4 text-[16px] text-hanji placeholder:text-hanji-2/80 focus:border-accent focus:outline-none';
const label = 'mb-2 block text-[12px] font-extrabold uppercase tracking-[0.1em] text-hanji-2';

export default function FeedbackDialogA({ t, context, online, onClose, send, siteKey }: FeedbackDialogProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useDialog(onClose, closeRef);
  const form = useFeedbackForm({ context, online, send, siteKey });

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" style={{ height: 'var(--app-h, 100%)' }}>
      <button type="button" aria-label={t.close} onClick={onClose} className="absolute inset-0 bg-hanji/45 backdrop-blur-[2px]" />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="fb-title"
        className="anim-sheet relative flex max-h-[92%] w-full max-w-xl flex-col overflow-hidden rounded-t-[28px] border-2 border-b-0 border-rule bg-ink-2 sm:max-h-[88%] sm:rounded-[28px] sm:border-b-2"
      >
        <header className="flex items-start gap-3 border-b border-rule px-5 pb-4 pt-5">
          <div className="min-w-0 flex-1">
            <h2 id="fb-title" className="text-[22px] font-bold leading-tight">
              {t.sendFeedback}
            </h2>
            <p className="mt-1 text-[13px] leading-relaxed text-hanji-2">{t.fbLead}</p>
          </div>
          <button ref={closeRef} type="button" onClick={onClose} aria-label={t.close} className="-mr-2 -mt-1 p-2 text-hanji-2 hover:text-hanji">
            <X size={20} />
          </button>
        </header>

        <div className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-5">
          {form.phase === 'sent' ? (
            <SentView t={t} onClose={onClose} cooldown={form.cooldown} />
          ) : (
            <form
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                void form.submit();
              }}
            >
              <Honeypot form={form} />
              <fieldset>
                <legend className={label}>{t.fbCategory}</legend>
                <div className="flex flex-wrap gap-2">
                  {FEEDBACK_CATEGORIES.map((c) => {
                    const Icon = CATEGORY_ICON[c];
                    const on = form.category === c;
                    return (
                      <label
                        key={c}
                        className={`press flex h-10 cursor-pointer items-center gap-2 rounded-full border-2 px-3.5 text-[14px] font-extrabold has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent ${
                          on ? 'border-accent bg-accent-wash text-accent-text' : 'border-rule bg-ink text-hanji hover:border-hanji-2/50'
                        }`}
                      >
                        <input type="radio" name="fb-category" value={c} checked={on} onChange={() => form.setCategory(c)} className="sr-only" />
                        <Icon size={16} strokeWidth={2.5} aria-hidden />
                        {t.fbCategories[c]}
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              <div className="mt-5">
                <div className="flex items-baseline justify-between gap-3">
                  <label htmlFor="fb-message" className={label}>
                    {t.fbMessage}
                  </label>
                  <Counter t={t} form={form} />
                </div>
                <textarea
                  id="fb-message"
                  value={form.message}
                  onChange={(e) => form.setMessage(e.target.value)}
                  rows={5}
                  placeholder={t.fbMessagePlaceholder}
                  className={`${field} resize-y py-3 leading-relaxed`}
                />
              </div>

              <div className="mt-4">
                <label htmlFor="fb-contact" className={label}>
                  {t.fbContact}
                </label>
                <input
                  id="fb-contact"
                  value={form.contact}
                  onChange={(e) => form.setContact(e.target.value)}
                  maxLength={CONTACT_MAX}
                  autoComplete="off"
                  placeholder="@username · name@example.com"
                  aria-describedby="fb-contact-hint"
                  className={`${field} h-12`}
                />
                <p id="fb-contact-hint" className="mt-1.5 text-[12px] text-hanji-2">
                  {t.fbContactHint}
                </p>
              </div>

              <p className="mt-4 rounded-2xl bg-ink-3/60 px-4 py-3 text-[12px] leading-relaxed text-hanji-2">{t.fbAttached}</p>

              <div className="mt-4 space-y-3">
                <Captcha form={form} />
                <StatusLine t={t} form={form} />
                <button
                  type="submit"
                  disabled={!form.canSend}
                  className="juicy lip-accent flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-accent text-[16px] font-black text-white"
                >
                  <Send size={18} strokeWidth={2.6} aria-hidden />
                  {form.phase === 'sending' ? t.fbSending : t.fbSend}
                </button>
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
