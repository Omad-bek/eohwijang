/**
 * Design lab: the feedback dialog variants, open over a stand-in page. Nothing is sent: a fake
 * sender answers after a short delay with whichever outcome is picked in the control card, and
 * Turnstile runs with Cloudflare's always-pass test key.
 */
import { useState, type ComponentType } from 'react';
import { STRINGS } from '../lib/i18n';
import { APP_VERSION, TURNSTILE_TEST_KEY, deviceSummary, type SendResult } from '../lib/feedback';
import type { UiLang } from '../types';
import type { FeedbackDialogProps } from '../components/feedback/parts';
import FeedbackDialogA from '../components/feedback/FeedbackDialogA';
import FeedbackDialogB from '../components/feedback/FeedbackDialogB';
import FeedbackDialogC from '../components/feedback/FeedbackDialogC';

const OUTCOMES: SendResult[] = ['ok', 'rate_limited', 'captcha', 'error'];
const LANGS: UiLang[] = ['en', 'ru', 'uz', 'ko'];

function FeedbackLab({ Dialog }: { Dialog: ComponentType<FeedbackDialogProps> }) {
  const [outcome, setOutcome] = useState<SendResult>('ok');
  const [offline, setOffline] = useState(false);
  const [lang, setLang] = useState<UiLang>('en');
  const [open, setOpen] = useState(true);
  const [run, setRun] = useState(0);
  const t = STRINGS[lang];

  const reopen = () => {
    try {
      localStorage.removeItem('project-vocab:feedback-sent-at');
    } catch {
      /* cooldown just stays */
    }
    setRun((n) => n + 1);
    setOpen(true);
  };

  return (
    <div className="relative h-full overflow-hidden">
      <div className="mx-auto max-w-3xl px-6 pt-10 opacity-60">
        <div className="h-10 w-48 rounded-xl bg-ink-3" />
        <div className="mt-6 grid grid-cols-3 gap-3">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-ink-3" />
          ))}
        </div>
      </div>

      <aside className="fixed bottom-4 left-4 z-[60] w-64 space-y-3 rounded-2xl border-2 border-rule bg-ink-2 p-3 text-[12px] font-bold shadow-lg">
        <p className="text-[11px] font-black uppercase tracking-[0.12em] text-amber">Simulate</p>
        <div className="flex flex-wrap gap-1">
          {OUTCOMES.map((o) => (
            <button
              key={o}
              type="button"
              onClick={() => setOutcome(o)}
              className={`rounded-full px-2.5 py-1 ${outcome === o ? 'bg-hanji text-ink' : 'bg-ink-3 text-hanji-2 hover:text-hanji'}`}
            >
              {o}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={offline} onChange={(e) => setOffline(e.target.checked)} /> Offline
        </label>
        <div className="flex gap-1">
          {LANGS.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => (setLang(l), setRun((n) => n + 1))}
              className={`rounded-full px-2.5 py-1 uppercase ${lang === l ? 'bg-hanji text-ink' : 'bg-ink-3 text-hanji-2 hover:text-hanji'}`}
            >
              {l}
            </button>
          ))}
        </div>
        <button type="button" onClick={reopen} className="w-full rounded-xl bg-accent py-2 font-black text-white">
          Reopen (clears cooldown)
        </button>
      </aside>

      {open && (
        <Dialog
          key={run}
          t={t}
          online={!offline}
          context={{ book: '1B', unit: '12과', lang, version: APP_VERSION, ua: deviceSummary() }}
          onClose={() => setOpen(false)}
          siteKey={TURNSTILE_TEST_KEY}
          send={() => new Promise((resolve) => setTimeout(() => resolve(outcome), 900))}
        />
      )}
    </div>
  );
}

export const FeedbackLabA = () => <FeedbackLab Dialog={FeedbackDialogA} />;
export const FeedbackLabB = () => <FeedbackLab Dialog={FeedbackDialogB} />;
export const FeedbackLabC = () => <FeedbackLab Dialog={FeedbackDialogC} />;
