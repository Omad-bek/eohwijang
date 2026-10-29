/**
 * Build-time only, loaded by scripts/prerender.mjs through Vite's SSR loader and never part of
 * the app bundle. Renders the public pages to static HTML, so search engines and slow
 * connections see real text before any JavaScript runs, with coverage claims taken from the
 * live shared word lists at build time (the bundled ones when the server can't be reached).
 */
import { renderToString } from 'react-dom/server';
import { AmbientParticles } from './components/AmbientParticles';
import Privacy from './pages/privacy/Privacy';
import WelcomeA from './pages/welcome/WelcomeA';
import { BUILT_IN_BOOKS } from './lib/books';
import { bookSpan, coverageOf, type Coverage } from './lib/coverage';
import { applyGlobal, fetchGlobalWords } from './lib/global';
import { PAGE_TITLE, type Route } from './lib/route';
import { SYNC_AVAILABLE } from './lib/sync';

export async function loadCoverage(): Promise<{ coverage: Coverage; live: boolean }> {
  if (SYNC_AVAILABLE) {
    try {
      return { coverage: coverageOf(applyGlobal(await fetchGlobalWords())), live: true };
    } catch {
      /* fall through to the bundled books */
    }
  }
  return { coverage: coverageOf(BUILT_IN_BOOKS), live: false };
}

export interface PageMeta {
  title: string;
  description: string;
}

export function metaFor(route: Route, coverage: Coverage): PageMeta {
  if (route === 'privacy') {
    return { title: PAGE_TITLE.privacy, description: 'What 어휘장 stores, where it is kept, and how to erase it. No accounts, no ads, no cookies.' };
  }
  return {
    title: PAGE_TITLE[route],
    description: `Type-to-recall Korean vocabulary for SNU Korean ${bookSpan(coverage)} (${coverage.words.toLocaleString('en')} words), with Uzbek, Russian and English prompts. Free, no account, works offline.`,
  };
}

/** The page as App.tsx first draws it, minus the learner-specific parts. */
export function render(route: Route, coverage: Coverage): string {
  return renderToString(
    <div className="relative h-full">
      <AmbientParticles />
      {route === 'privacy' ? <Privacy /> : <WelcomeA coverage={coverage} />}
    </div>,
  );
}
