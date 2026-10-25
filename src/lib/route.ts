import { useCallback, useEffect, useState } from 'react';

/**
 * Real paths for the pages search engines and links should reach: / (the app), /about (the
 * Welcome page) and /privacy. The build writes about.html and privacy.html with their content
 * already in the HTML (scripts/prerender.mjs), which GitHub Pages serves at /about and /privacy;
 * the dev server and the offline service worker fall back to index.html, and this module picks
 * the page from the path. #admin stays a hash: it is never linked or indexed.
 */
export type Route = 'app' | 'about' | 'privacy';

const BASE = import.meta.env.BASE_URL;

export const SITE_URL = 'https://eohwijang.fyi';
export const GITHUB_URL = 'https://github.com/Omad-bek/eohwijang';
/** Where the Feedback / Contact links go. A GitHub issue form for now; swap for an email or form link. */
export const FEEDBACK_URL = `${GITHUB_URL}/issues/new`;

/** Document titles for the public pages; the app itself is titled by its interface language. */
export const PAGE_TITLE: Record<Route, string> = {
  app: '어휘장 · Korean vocabulary trainer for the SNU textbooks',
  about: 'About 어휘장 · Korean vocabulary trainer for the SNU textbooks',
  privacy: 'Privacy · 어휘장',
};

export function hrefFor(route: Route): string {
  return route === 'app' ? BASE : `${BASE}${route}`;
}

export function routeOf(pathname: string, hash = ''): Route {
  // Old links used #about.
  if (hash === '#about') return 'about';
  const path = pathname.startsWith(BASE) ? pathname.slice(BASE.length) : pathname.replace(/^\//, '');
  const page = path.replace(/\.html$/, '').replace(/\/+$/, '');
  return page === 'about' || page === 'privacy' ? page : 'app';
}

/** The current page, and a way to move between pages without a reload. */
export function useRoute(): [Route, (to: Route) => void] {
  const [route, setRoute] = useState<Route>(() => routeOf(window.location.pathname, window.location.hash));

  useEffect(() => {
    // Rewrite #about to /about once, so the address bar shows the shareable path.
    if (window.location.hash === '#about') history.replaceState(null, '', hrefFor('about'));
    const onPop = () => setRoute(routeOf(window.location.pathname, window.location.hash));
    window.addEventListener('popstate', onPop);
    window.addEventListener('hashchange', onPop);
    return () => {
      window.removeEventListener('popstate', onPop);
      window.removeEventListener('hashchange', onPop);
    };
  }, []);

  const go = useCallback((to: Route) => {
    const href = hrefFor(to);
    if (window.location.pathname !== href || window.location.hash) history.pushState(null, '', href);
    setRoute(to);
  }, []);

  return [route, go];
}

/**
 * The build puts a static copy of the page in #prerender (over the empty app root) so crawlers
 * and slow connections see content at once. A page calls this once it has rendered itself.
 */
export function dropPrerender() {
  document.getElementById('prerender')?.remove();
}
