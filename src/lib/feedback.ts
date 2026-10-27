import type { UiLang } from '../types';
import { SYNC_AVAILABLE, callFunction } from './sync';

/**
 * The feedback form's client side. Messages go to the send-feedback edge function
 * (supabase/functions/send-feedback), which checks them and forwards them to the developer on
 * Telegram. The Turnstile site key is public and comes from the repo variable
 * VITE_TURNSTILE_SITE_KEY at build time; without it (or without Supabase) the form stays hidden and
 * the old GitHub link is shown instead. Nothing here ever reads the Sync ID.
 */
export const TURNSTILE_SITE_KEY = String(import.meta.env.VITE_TURNSTILE_SITE_KEY ?? '').trim();
/** Cloudflare's always-pass test key, for the design lab only. */
export const TURNSTILE_TEST_KEY = '1x00000000000000000000AA';
export const FEEDBACK_AVAILABLE = SYNC_AVAILABLE && !!TURNSTILE_SITE_KEY;

export type FeedbackCategory = 'bug' | 'word' | 'idea' | 'other';
export const FEEDBACK_CATEGORIES: FeedbackCategory[] = ['bug', 'word', 'idea', 'other'];

// Same limits as the edge function and the feedback table.
export const MESSAGE_MIN = 10;
export const MESSAGE_MAX = 2000;
export const CONTACT_MAX = 100;
export const COOLDOWN_MS = 60_000;

/** Characters as the server counts them, so an emoji is one, not two. */
export const charCount = (s: string) => Array.from(s.trim()).length;

/** Where the learner was when they opened the form. */
export interface FeedbackContext {
  book: string;
  unit: string;
  lang: UiLang;
  version: string;
  ua: string;
}

export interface FeedbackPayload {
  category: FeedbackCategory;
  message: string;
  contact: string;
  context: FeedbackContext;
  token: string;
  /** The hidden honeypot field: always empty for people. */
  website: string;
  /** How long the form was open. Sent as a duration, so a wrong device clock can't trip the check. */
  elapsedMs: number;
}

export type SendResult = 'ok' | 'rate_limited' | 'captcha' | 'error';

export async function postFeedback(payload: FeedbackPayload): Promise<SendResult> {
  try {
    const res = await callFunction('send-feedback', { ...payload });
    if (res.ok) return 'ok';
    if (res.status === 429) return 'rate_limited';
    if (res.status === 403) return 'captcha';
    return 'error';
  } catch {
    return 'error';
  }
}

// The prerender script runs the app without vite.config.ts, where the constant is defined.
export const APP_VERSION = typeof __APP_VERSION__ === 'string' ? __APP_VERSION__ : 'dev';

/** A short "Chrome 130 · Android · app" string: enough to reproduce a bug, nothing that identifies anyone. */
export function deviceSummary(): string {
  if (typeof navigator === 'undefined') return '';
  const ua = navigator.userAgent;
  const browsers: [RegExp, string][] = [
    [/Edg(?:A|iOS)?\/(\d+)/, 'Edge'],
    [/OPR\/(\d+)/, 'Opera'],
    [/SamsungBrowser\/(\d+)/, 'Samsung Internet'],
    [/YaBrowser\/(\d+)/, 'Yandex'],
    [/(?:Firefox|FxiOS)\/(\d+)/, 'Firefox'],
    [/(?:Chrome|CriOS)\/(\d+)/, 'Chrome'],
    [/Version\/(\d+).*Safari/, 'Safari'],
  ];
  const hit = browsers.find(([re]) => re.test(ua));
  const browser = hit ? `${hit[1]} ${ua.match(hit[0])![1]}` : 'Other browser';
  const os = /iPhone|iPad|iPod/.test(ua)
    ? 'iOS'
    : /Android/.test(ua)
      ? 'Android'
      : /CrOS/.test(ua)
        ? 'ChromeOS'
        : /Windows/.test(ua)
          ? 'Windows'
          : /Mac OS X|Macintosh/.test(ua)
            ? navigator.maxTouchPoints > 1
              ? 'iPadOS'
              : 'macOS'
            : /Linux/.test(ua)
              ? 'Linux'
              : 'Other OS';
  const installed = typeof matchMedia === 'function' && matchMedia('(display-mode: standalone)').matches;
  return [browser, os, installed ? 'app' : ''].filter(Boolean).join(' · ');
}

const SENT_KEY = 'project-vocab:feedback-sent-at';

/** Milliseconds until another message may be sent from this browser. */
export function cooldownLeft(now = Date.now()): number {
  try {
    const at = Number(localStorage.getItem(SENT_KEY));
    return Number.isFinite(at) && at > 0 ? Math.max(0, at + COOLDOWN_MS - now) : 0;
  } catch {
    return 0;
  }
}

export function startCooldown() {
  try {
    localStorage.setItem(SENT_KEY, String(Date.now()));
  } catch {
    /* the server still limits how often anyone can send */
  }
}
