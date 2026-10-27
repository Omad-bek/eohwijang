import { useEffect, useRef, useState } from 'react';
import type { UiLang } from '../../types';
import {
  CONTACT_MAX,
  MESSAGE_MAX,
  MESSAGE_MIN,
  TURNSTILE_SITE_KEY,
  charCount,
  cooldownLeft,
  postFeedback,
  startCooldown,
  type FeedbackCategory,
  type FeedbackContext,
  type FeedbackPayload,
  type SendResult,
} from '../../lib/feedback';
import { useTurnstile } from '../../lib/turnstile';

export type FeedbackError = 'offline' | 'rate_limited' | 'captcha' | 'error';

export interface FeedbackFormOptions {
  context: FeedbackContext;
  online: boolean;
  /** The design lab swaps these for a fake sender and Cloudflare's test key. */
  send?: (payload: FeedbackPayload) => Promise<SendResult>;
  siteKey?: string;
}

/**
 * Everything the feedback dialog does, apart from how it looks: the fields and their limits,
 * the honeypot and open-time trap, Turnstile, sending, and the 60-second cooldown after a send.
 */
export function useFeedbackForm({ context, online, send = postFeedback, siteKey = TURNSTILE_SITE_KEY }: FeedbackFormOptions) {
  const [category, setCategory] = useState<FeedbackCategory | null>(null);
  const [message, setMessage] = useState('');
  const [contact, setContact] = useState('');
  const [website, setWebsite] = useState('');
  const [phase, setPhase] = useState<'editing' | 'sending' | 'sent'>('editing');
  const [error, setError] = useState<FeedbackError | null>(null);
  const [cooldown, setCooldown] = useState(() => Math.ceil(cooldownLeft() / 1000));
  const openedAt = useRef(performance.now());
  const captcha = useTurnstile(siteKey, context.lang as UiLang);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown(Math.ceil(cooldownLeft() / 1000)), 1000);
    return () => clearInterval(id);
  }, [cooldown > 0]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (online && error === 'offline') setError(null);
  }, [online, error]);

  const count = charCount(message);
  const valid = !!category && count >= MESSAGE_MIN && count <= MESSAGE_MAX && charCount(contact) <= CONTACT_MAX;
  const canSend = valid && phase === 'editing' && cooldown <= 0;

  const submit = async () => {
    if (!canSend || !category) return;
    if (!online) {
      setError('offline');
      return;
    }
    setError(null);
    setPhase('sending');
    const token = await captcha.getToken();
    if (!token) {
      setError('captcha');
      setPhase('editing');
      return;
    }
    const result = await send({
      category,
      message: message.trim(),
      contact: contact.trim(),
      context,
      token,
      website,
      elapsedMs: Math.round(performance.now() - openedAt.current),
    });
    captcha.reset();
    if (result === 'ok') {
      startCooldown();
      setCooldown(Math.ceil(cooldownLeft() / 1000));
      setPhase('sent');
      return;
    }
    setError(navigator.onLine ? result : 'offline');
    setPhase('editing');
  };

  return {
    category,
    setCategory,
    message,
    setMessage: (v: string) => setMessage(Array.from(v).slice(0, MESSAGE_MAX).join('')),
    contact,
    setContact: (v: string) => setContact(Array.from(v.replace(/[\r\n]/g, '')).slice(0, CONTACT_MAX).join('')),
    website,
    setWebsite,
    count,
    tooShort: count > 0 && count < MESSAGE_MIN,
    canSend,
    phase,
    error: !online ? ('offline' as const) : error,
    cooldown,
    submit,
    captchaRef: captcha.ref,
  };
}

export type FeedbackForm = ReturnType<typeof useFeedbackForm>;
