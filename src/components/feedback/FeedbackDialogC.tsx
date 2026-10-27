/**
 * Feedback, variant C, "Note": a compact panel that docks to the bottom-right corner on wider
 * screens, like a chat widget, so the page stays visible; a bottom sheet on phones. The topic is
 * a short dropdown and the message is the star: a large lined note with Send beside the counter.
 */
import { useRef } from 'react';
import { ChevronDown, SendHorizontal, X } from 'lucide-react';
import { CONTACT_MAX, FEEDBACK_CATEGORIES, type FeedbackCategory } from '../../lib/feedback';
import { useFeedbackForm } from './useFeedbackForm';
import { CATEGORY_ICON, Captcha, Counter, DevLink, Honeypot, SentView, StatusLine, useDialog, type FeedbackDialogProps } from './parts';

export default function FeedbackDialogC({ t, context, online, onClose, send, siteKey }: FeedbackDialogProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useDialog(onClose, closeRef);
  const form = useFeedbackForm({ context, online, send, siteKey });
  const Icon = form.category ? CATEGORY_ICON[form.category] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:justify-end sm:p-6" style={{ height: 'var(--app-h, 100%)' }}>
      <button type="button" aria-label={t.close} onClick={onClose} className="absolute inset-0 bg-hanji/30 sm:bg-hanji/15" />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="fb-title"
        className="anim-sheet relative flex max-h-[92%] w-full flex-col overflow-hidden rounded-t-[24px] border-2 border-b-0 border-rule bg-ink-2 sm:max-h-full sm:w-[400px] sm:rounded-[24px] sm:border-b-2 sm:shadow-[0_18px_50px_-12px_rgb(0_0_0/0.35)]"
      >
        <header className="flex items-center gap-2 bg-accent px-4 py-3 text-white">
          <h2 id="fb-title" className="flex-1 text-[17px] font-black">
            {t.sendFeedback}
          </h2>
          <button ref={closeRef} type="button" onClick={onClose} aria-label={t.close} className="-mr-1.5 rounded-full p-1.5 text-white/85 hover:bg-white/15 hover:text-white">
            <X size={19} />
          </button>
        </header>

        <div className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-4">
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
              <p className="text-[13px] leading-relaxed text-hanji-2">{t.fbLead}</p>

              <label htmlFor="fb-category" className="sr-only">
                {t.fbCategory}
              </label>
              <div className="relative mt-3">
                {Icon && <Icon size={17} strokeWidth={2.5} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-accent-text" aria-hidden />}
                <select
                  id="fb-category"
                  value={form.category ?? ''}
                  onChange={(e) => form.setCategory((e.target.value || null) as FeedbackCategory | null)}
                  className={`h-11 w-full appearance-none rounded-xl border-2 border-rule bg-ink pr-10 text-[15px] font-extrabold focus:border-accent focus:outline-none ${
                    Icon ? 'pl-10' : 'pl-3.5'
                  } ${form.category ? 'text-hanji' : 'text-hanji-2'}`}
                >
                  <option value="" disabled>
                    {t.fbCategory}
                  </option>
                  {FEEDBACK_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {t.fbCategories[c]}
                    </option>
                  ))}
                </select>
                <ChevronDown size={17} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-hanji-2" aria-hidden />
              </div>

              <div className="mt-3 rounded-xl border-2 border-rule bg-ink focus-within:border-accent">
                <label htmlFor="fb-message" className="sr-only">
                  {t.fbMessage}
                </label>
                <textarea
                  id="fb-message"
                  value={form.message}
                  onChange={(e) => form.setMessage(e.target.value)}
                  rows={6}
                  placeholder={t.fbMessagePlaceholder}
                  className="block w-full resize-none bg-transparent px-3.5 pt-2.5 text-[16px] leading-[28px] text-hanji placeholder:text-hanji-2/80 focus:outline-none"
                  style={{ backgroundImage: 'repeating-linear-gradient(transparent 0 27px, var(--color-rule-soft) 27px 28px)', backgroundAttachment: 'local' }}
                />
                <div className="flex items-center justify-between gap-2 border-t border-rule-soft px-3 py-2">
                  <Counter t={t} form={form} />
                  <button
                    type="submit"
                    disabled={!form.canSend}
                    className="juicy lip-accent flex h-10 shrink-0 items-center gap-1.5 rounded-xl bg-accent px-4 text-[14px] font-black text-white"
                  >
                    {form.phase === 'sending' ? t.fbSending : t.fbSend}
                    <SendHorizontal size={16} strokeWidth={2.6} aria-hidden />
                  </button>
                </div>
              </div>

              <label htmlFor="fb-contact" className="mt-3 block text-[12px] font-extrabold text-hanji-2">
                {t.fbContact} · <span className="font-semibold">{t.fbContactHint}</span>
              </label>
              <input
                id="fb-contact"
                value={form.contact}
                onChange={(e) => form.setContact(e.target.value)}
                maxLength={CONTACT_MAX}
                autoComplete="off"
                placeholder="@username · name@example.com"
                className="mt-1.5 h-11 w-full rounded-xl border-2 border-rule bg-ink px-3.5 text-[16px] text-hanji placeholder:text-hanji-2/80 focus:border-accent focus:outline-none"
              />

              <div className="mt-3 space-y-2">
                <Captcha form={form} />
                <StatusLine t={t} form={form} />
                <p className="text-[11px] leading-relaxed text-hanji-2">{t.fbAttached}</p>
                <DevLink t={t} />
              </div>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
