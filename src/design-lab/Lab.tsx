/**
 * Dev-only design lab shell: a slim strip of page tabs, a variant switcher (A / B / C) for pages
 * under review, and the page being previewed below it. Hashes are #design-lab/<page>/<variant>;
 * #design-lab alone opens the icon lab. The theme switch here only flips html[data-theme] for this
 * visit; the learner's saved theme is untouched.
 */
import { Suspense, lazy, useEffect, useState, type ComponentType, type LazyExoticComponent } from 'react';
import { FlaskConical, Moon, Sun } from 'lucide-react';
import { AmbientParticles } from '../components/AmbientParticles';

interface Variant {
  id: string;
  label: string;
  Page: LazyExoticComponent<ComponentType>;
}

const PAGES: { id: string; label: string; variants: Variant[] }[] = [
  { id: 'icons', label: 'Icons', variants: [{ id: 'gallery', label: 'Gallery', Page: lazy(() => import('./IconLab')) }] },
  {
    id: 'header',
    label: 'Header',
    variants: [
      { id: 'a', label: 'Compact row', Page: lazy(() => import('./HeaderLab').then((m) => ({ default: m.HeaderLabA }))) },
      { id: 'b', label: 'More menu', Page: lazy(() => import('./HeaderLab').then((m) => ({ default: m.HeaderLabB }))) },
      { id: 'c', label: 'Settings menu', Page: lazy(() => import('./HeaderLab').then((m) => ({ default: m.HeaderLabC }))) },
    ],
  },
  { id: 'phone', label: 'Phone', variants: [{ id: 'app', label: 'App', Page: lazy(() => import('./PhoneLab')) }] },
  {
    id: 'welcome',
    label: 'Welcome',
    variants: [
      { id: 'a', label: 'Playground', Page: lazy(() => import('../pages/welcome/WelcomeA')) },
      { id: 'b', label: 'Story', Page: lazy(() => import('../pages/welcome/WelcomeB')) },
      { id: 'c', label: 'Bento', Page: lazy(() => import('../pages/welcome/WelcomeC')) },
    ],
  },
];

function fromHash() {
  const [pageId, variantId] = window.location.hash.replace(/^#design-lab\/?/, '').split('/');
  const page = PAGES.find((p) => p.id === pageId) ?? PAGES[0];
  const variant = page.variants.find((v) => v.id === variantId) ?? page.variants[0];
  return { page, variant };
}

export default function Lab() {
  const [{ page, variant }, setView] = useState(fromHash);
  const [dark, setDark] = useState(() => document.documentElement.dataset.theme === 'dark');

  useEffect(() => {
    const onHash = () => setView(fromHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    // A framed preview follows the parent lab's theme itself.
    if (window.self !== window.top) return;
    const root = document.documentElement;
    const saved = root.dataset.theme;
    root.dataset.theme = dark ? 'dark' : 'light';
    return () => {
      if (saved) root.dataset.theme = saved;
    };
  }, [dark]);

  const { Page } = variant;
  // Inside a preview iframe (e.g. the Header page's device frames): the page alone, no lab strip.
  if (window.self !== window.top) {
    return (
      <Suspense fallback={null}>
        <Page />
      </Suspense>
    );
  }
  return (
    <div className="relative flex h-full flex-col bg-ink text-hanji">
      {/* The app-wide ambient layer, so previews sit on the same ground as the live app. */}
      <AmbientParticles />
      <nav aria-label="Design lab" className="relative flex h-11 shrink-0 items-center gap-1.5 overflow-x-auto border-b-2 border-rule bg-ink-2 px-3">
        <span className="mr-1.5 flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.12em] text-amber">
          <FlaskConical size={14} aria-hidden /> Lab
        </span>
        {PAGES.map((p) => (
          <a
            key={p.id}
            href={`#design-lab/${p.id}`}
            aria-current={p.id === page.id ? 'page' : undefined}
            className={`flex h-7 shrink-0 items-center rounded-full px-3 text-[12.5px] font-extrabold ${p.id === page.id ? 'bg-accent text-white' : 'text-hanji-2 hover:bg-ink-3 hover:text-hanji'}`}
          >
            {p.label}
          </a>
        ))}

        {page.variants.length > 1 && (
          <>
            <span aria-hidden className="mx-1.5 h-5 w-0.5 shrink-0 rounded-full bg-rule" />
            <div role="group" aria-label="Variant" className="flex shrink-0 rounded-full border-2 border-rule bg-ink p-0.5">
              {page.variants.map((v, i) => {
                const on = v.id === variant.id;
                return (
                  <a
                    key={v.id}
                    href={`#design-lab/${page.id}/${v.id}`}
                    aria-current={on ? 'true' : undefined}
                    title={`Variant ${v.id.toUpperCase()}: ${v.label}`}
                    className={`flex h-6 items-center gap-1.5 rounded-full px-2.5 text-[12px] font-extrabold ${on ? 'bg-hanji text-ink' : 'text-hanji-2 hover:text-hanji'}`}
                  >
                    {String.fromCharCode(65 + i)}
                    <span className={`hidden font-bold md:inline ${on ? 'opacity-70' : ''}`}>{v.label}</span>
                  </a>
                );
              })}
            </div>
          </>
        )}

        <button
          type="button"
          onClick={() => setDark((d) => !d)}
          aria-label={dark ? 'Preview light theme' : 'Preview dark theme'}
          className="press ml-auto grid size-8 shrink-0 place-items-center rounded-full text-hanji-2 hover:bg-ink-3 hover:text-hanji"
        >
          {dark ? <Sun size={16} aria-hidden /> : <Moon size={16} aria-hidden />}
        </button>
      </nav>
      <div className="relative min-h-0 flex-1">
        <Suspense fallback={null}>
          {/* Keyed so switching variants remounts: entrance motion and the install delay replay. */}
          <Page key={`${page.id}/${variant.id}`} />
        </Suspense>
      </div>
    </div>
  );
}
