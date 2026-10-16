import { useEffect, useState } from 'react';
import { ArrowUpRight, FlaskConical } from 'lucide-react';
import type { Stage } from '../types';
import { useLabModel } from './model';
import { WarmConcept } from './WarmConcept';
import { BentoConcept } from './BentoConcept';
import { HangulConcept } from './HangulConcept';

export type Screen = { kind: 'home' } | { kind: 'quiz'; stage: Stage; run: number };

export interface ConceptProps {
  m: ReturnType<typeof useLabModel>;
  screen: Screen;
  onStart: (s: Stage) => void;
  onHome: () => void;
}

const CONCEPTS = [
  { id: 1, short: 'Warm', name: 'Warm & addictive', Comp: WarmConcept },
  { id: 2, short: 'Bento', name: 'Clean bento', Comp: BentoConcept },
  { id: 3, short: '한글', name: 'Modern Korean', Comp: HangulConcept },
] as const;

type ConceptId = (typeof CONCEPTS)[number]['id'];

const STORE = 'design-lab:concept';

function initialConcept(): ConceptId {
  const fromUrl = Number(new URLSearchParams(location.search).get('c'));
  if (fromUrl === 1 || fromUrl === 2 || fromUrl === 3) return fromUrl;
  try {
    const saved = Number(localStorage.getItem(STORE));
    if (saved === 1 || saved === 2 || saved === 3) return saved;
  } catch {
    /* lab convenience only */
  }
  return 1;
}

export function Lab() {
  const m = useLabModel();
  const [concept, setConcept] = useState<ConceptId>(initialConcept);
  const [screen, setScreen] = useState<Screen>({ kind: 'home' });

  useEffect(() => {
    const url = new URL(location.href);
    url.searchParams.set('c', String(concept));
    history.replaceState(null, '', url);
    try {
      localStorage.setItem(STORE, String(concept));
    } catch {
      /* lab convenience only */
    }
    document.title = `${CONCEPTS[concept - 1].name} · Design lab · 어휘장`;
  }, [concept]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === '1' || e.key === '2' || e.key === '3') setConcept(Number(e.key) as ConceptId);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const { Comp } = CONCEPTS[concept - 1];
  const onStart = (stage: Stage) => {
    setScreen({ kind: 'quiz', stage, run: Date.now() });
    window.scrollTo({ top: 0 });
  };
  const onHome = () => setScreen({ kind: 'home' });

  return (
    <div data-concept={concept} className="min-h-dvh">
      <nav
        aria-label="Design lab"
        className="fixed inset-x-0 top-0 z-50 flex justify-center px-2 pt-[max(8px,env(safe-area-inset-top))] font-[system-ui,sans-serif]"
      >
        <div className="flex max-w-full items-center gap-1 rounded-2xl bg-zinc-900/92 p-1 text-white shadow-[0_8px_30px_-6px_rgb(0_0_0/0.45)] ring-1 ring-white/10 backdrop-blur-md">
          <span className="hidden items-center gap-1.5 pl-2.5 pr-1.5 text-[12px] font-semibold text-zinc-300 sm:flex">
            <FlaskConical size={14} aria-hidden />
            Design lab
          </span>
          <div role="radiogroup" aria-label="Concept" className="flex gap-0.5">
            {CONCEPTS.map((c) => {
              const on = c.id === concept;
              return (
                <button
                  key={c.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => setConcept(c.id)}
                  title={`${c.name} (key ${c.id})`}
                  className={`flex h-9 items-center gap-1.5 rounded-xl px-2.5 text-[13px] font-semibold transition-colors sm:px-3 ${
                    on ? 'bg-white text-zinc-900' : 'text-zinc-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span className={`tabular grid size-5 place-items-center rounded-md text-[11px] ${on ? 'bg-zinc-900 text-white' : 'bg-white/12'}`}>{c.id}</span>
                  <span className="whitespace-nowrap">{c.short}</span>
                </button>
              );
            })}
          </div>
          <span className="mx-1 h-5 w-px bg-white/15" aria-hidden />
          <label className="flex h-9 cursor-pointer items-center gap-2 rounded-xl px-2 text-[12px] font-medium text-zinc-300 hover:bg-white/10" title="Demo progress overlays a sample learner on the real word list. Off shows this browser's real progress.">
            <input type="checkbox" className="peer sr-only" checked={m.demo} onChange={(e) => m.setDemo(e.target.checked)} />
            <span className="relative h-4 w-7 rounded-full bg-white/20 transition-colors peer-checked:bg-amber-400 peer-focus-visible:ring-2 peer-focus-visible:ring-white" aria-hidden>
              <span className={`absolute top-0.5 size-3 rounded-full bg-white transition-[left] ${m.demo ? 'left-3.5' : 'left-0.5'}`} />
            </span>
            <span className="whitespace-nowrap">
              Demo<span className="hidden sm:inline"> progress</span>
            </span>
          </label>
          <a
            href="/"
            className="flex h-9 items-center gap-1 rounded-xl px-2 text-[12px] font-medium text-zinc-300 hover:bg-white/10 hover:text-white"
            title="Open the current app"
          >
            <span className="hidden sm:inline">Real app</span>
            <ArrowUpRight size={14} aria-label="Real app" />
          </a>
        </div>
      </nav>

      <Comp key={`${concept}-${screen.kind === 'quiz' ? screen.run : 'home'}`} m={m} screen={screen} onStart={onStart} onHome={onHome} />
    </div>
  );
}
