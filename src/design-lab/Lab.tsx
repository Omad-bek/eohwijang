/**
 * Dev-only design lab shell: a slim tab strip over the page being previewed.
 * #design-lab and #design-lab/icons open the icon lab; #design-lab/welcome previews the landing page.
 * The theme switch here only flips html[data-theme] for this visit; the learner's saved theme is untouched.
 */
import { Suspense, lazy, useEffect, useState } from 'react';
import { FlaskConical, Moon, Sun } from 'lucide-react';

const PAGES = [
  { id: 'icons', label: 'Icons', Page: lazy(() => import('./IconLab')) },
  { id: 'welcome', label: 'Welcome', Page: lazy(() => import('../pages/Welcome')) },
] as const;

const pageFromHash = () => PAGES.find((p) => window.location.hash === `#design-lab/${p.id}`) ?? PAGES[0];

export default function Lab() {
  const [page, setPage] = useState(pageFromHash);
  const [dark, setDark] = useState(() => document.documentElement.dataset.theme === 'dark');

  useEffect(() => {
    const onHash = () => setPage(pageFromHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const saved = root.dataset.theme;
    root.dataset.theme = dark ? 'dark' : 'light';
    return () => {
      if (saved) root.dataset.theme = saved;
    };
  }, [dark]);

  const { Page } = page;
  return (
    <div className="flex h-full flex-col bg-ink text-hanji">
      <nav aria-label="Design lab" className="flex h-11 shrink-0 items-center gap-1.5 border-b-2 border-rule bg-ink-2 px-3">
        <span className="mr-1.5 flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.12em] text-amber">
          <FlaskConical size={14} aria-hidden /> Lab
        </span>
        {PAGES.map((p) => (
          <a
            key={p.id}
            href={`#design-lab/${p.id}`}
            aria-current={p.id === page.id ? 'page' : undefined}
            className={`flex h-7 items-center rounded-full px-3 text-[12.5px] font-extrabold ${p.id === page.id ? 'bg-accent text-white' : 'text-hanji-2 hover:bg-ink-3 hover:text-hanji'}`}
          >
            {p.label}
          </a>
        ))}
        <button
          type="button"
          onClick={() => setDark((d) => !d)}
          aria-label={dark ? 'Preview light theme' : 'Preview dark theme'}
          className="press ml-auto grid size-8 place-items-center rounded-full text-hanji-2 hover:bg-ink-3 hover:text-hanji"
        >
          {dark ? <Sun size={16} aria-hidden /> : <Moon size={16} aria-hidden />}
        </button>
      </nav>
      <div className="min-h-0 flex-1">
        <Suspense fallback={null}>
          <Page />
        </Suspense>
      </div>
    </div>
  );
}
