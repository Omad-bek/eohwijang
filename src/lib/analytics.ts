import { SITE_URL } from './route';

/**
 * Privacy-friendly usage counts through Umami: no cookies, no personal data, no cross-site
 * tracking, and Do Not Track is honoured. Off unless the build sets UMAMI_WEBSITE_ID (a repo
 * variable, like the Supabase ones), never in development, and only on the real domain, so
 * forks and local previews never count. Events carry no word lists, answers or Sync IDs.
 */
const WEBSITE_ID = String(import.meta.env.VITE_UMAMI_WEBSITE_ID ?? '').trim();
const SCRIPT_URL = String(import.meta.env.VITE_UMAMI_SCRIPT_URL ?? '').trim() || 'https://cloud.umami.is/script.js';

/** Set up for this build: what the privacy page describes, including in the prerendered copy. */
export const ANALYTICS_CONFIGURED = !!WEBSITE_ID;
/** Actually loading: production builds only. */
export const ANALYTICS_ENABLED = ANALYTICS_CONFIGURED && import.meta.env.PROD;

export type AnalyticsEvent = 'practice-started' | 'round-completed' | 'collection-created' | 'sync-enabled';

declare global {
  interface Window {
    umami?: { track: (event: string, data?: Record<string, string | number | boolean>) => void };
  }
}

export function initAnalytics() {
  if (!ANALYTICS_ENABLED || document.querySelector('script[data-website-id]')) return;
  const s = document.createElement('script');
  s.defer = true;
  s.src = SCRIPT_URL;
  s.dataset.websiteId = WEBSITE_ID;
  s.dataset.domains = new URL(SITE_URL).hostname;
  s.dataset.doNotTrack = 'true';
  // Page views are counted by path only: no query strings, and never the #admin hash.
  s.dataset.excludeSearch = 'true';
  s.dataset.excludeHash = 'true';
  document.head.appendChild(s);
}

/** Count one event. A no-op when analytics is off, blocked, or still loading. */
export function track(event: AnalyticsEvent, data?: Record<string, string | number | boolean>) {
  try {
    window.umami?.track(event, data);
  } catch {
    /* counting must never break the app */
  }
}
