/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  /** Unprefixed fallbacks, passed through by name in vite.config.ts. */
  readonly SUPABASE_URL?: string;
  readonly SUPABASE_ANON_KEY?: string;
  /** Umami analytics; unset ships without analytics. */
  readonly VITE_UMAMI_WEBSITE_ID?: string;
  readonly VITE_UMAMI_SCRIPT_URL?: string;
  /** Cloudflare Turnstile site key (public) for the feedback form; unset hides the form. */
  readonly VITE_TURNSTILE_SITE_KEY?: string;
}

/** package.json version, plus the short commit on CI builds ("0.1.0+c510fff"). */
declare const __APP_VERSION__: string;
