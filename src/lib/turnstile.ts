import { useCallback, useEffect, useRef, useState } from 'react';
import type { UiLang } from '../types';

/**
 * Cloudflare Turnstile for the feedback form. The script loads only when the form opens, and
 * the widget runs in managed mode with appearance "interaction-only": most people never see it,
 * and a checkbox appears only when Cloudflare wants one. Tokens are single-use, so call reset()
 * after every send.
 */
interface TurnstileApi {
  render: (el: HTMLElement, options: Record<string, unknown>) => string;
  reset: (id: string) => void;
  remove: (id: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SCRIPT = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
let loading: Promise<TurnstileApi> | null = null;

function loadTurnstile(): Promise<TurnstileApi> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  loading ??= new Promise<TurnstileApi>((resolve, reject) => {
    const s = document.createElement('script');
    s.src = SCRIPT;
    s.async = true;
    s.onload = () => (window.turnstile ? resolve(window.turnstile) : reject(new Error('turnstile')));
    s.onerror = () => {
      s.remove();
      loading = null;
      reject(new Error('turnstile'));
    };
    document.head.appendChild(s);
  });
  return loading;
}

/** Turnstile has no Uzbek, so Uzbek follows the browser's language. */
const widgetLang = (lang: UiLang) => (lang === 'uz' ? 'auto' : lang);

export function useTurnstile(siteKey: string, lang: UiLang) {
  const ref = useRef<HTMLDivElement>(null);
  const widget = useRef<string | null>(null);
  const token = useRef<string | null>(null);
  const waiting = useRef<((t: string | null) => void)[]>([]);
  const [failed, setFailed] = useState(false);

  const settle = (t: string | null) => {
    const list = waiting.current;
    waiting.current = [];
    for (const done of list) done(t);
  };

  useEffect(() => {
    let gone = false;
    loadTurnstile()
      .then((api) => {
        if (gone || !ref.current) return;
        widget.current = api.render(ref.current, {
          sitekey: siteKey,
          action: 'feedback',
          appearance: 'interaction-only',
          theme: 'auto',
          size: 'flexible',
          language: widgetLang(lang),
          'refresh-expired': 'auto',
          callback: (t: string) => {
            token.current = t;
            setFailed(false);
            settle(t);
          },
          'expired-callback': () => {
            token.current = null;
          },
          'error-callback': () => {
            token.current = null;
            setFailed(true);
            settle(null);
            // Handled here; Turnstile keeps retrying on its own.
            return true;
          },
        });
      })
      .catch(() => {
        if (gone) return;
        setFailed(true);
        settle(null);
      });
    return () => {
      gone = true;
      if (widget.current) window.turnstile?.remove(widget.current);
      widget.current = null;
      token.current = null;
    };
  }, [siteKey, lang]);

  /** The current token, waiting for the challenge to finish if it hasn't yet; null when it fails or times out. */
  const getToken = useCallback((timeoutMs = 30_000): Promise<string | null> => {
    if (token.current) return Promise.resolve(token.current);
    return new Promise((resolve) => {
      const timer = setTimeout(() => resolve(null), timeoutMs);
      waiting.current.push((t) => {
        clearTimeout(timer);
        resolve(t);
      });
    });
  }, []);

  /** Ask for a fresh token: the last one was used up by a send. */
  const reset = useCallback(() => {
    token.current = null;
    if (widget.current) window.turnstile?.reset(widget.current);
  }, []);

  return { ref, getToken, reset, failed };
}
