/**
 * #design-lab/icons: a dev-only gallery of app icon concepts with a sandbox that shows the
 * selected one where the icon actually lives (browser tab, home screen, navbar, PWA install).
 * Lab state uses its own design-lab:* key; the learner's data is never touched.
 */
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  ArrowLeft,
  Calendar,
  Camera,
  Check,
  Clock,
  Copy,
  Download,
  Image as ImageIcon,
  Mail,
  Map as MapIcon,
  MessageCircle,
  Music,
  Phone,
  Settings,
  StickyNote,
  X,
} from 'lucide-react';
import { CATEGORIES, CONCEPTS, CurrentIcon, IconSvg, type Category, type Concept } from './icons';

const PICK_KEY = 'design-lab:icon';

const TONE: Record<Category, string> = {
  Typographic: 'bg-accent-wash text-accent-text',
  Literary: 'bg-sky-wash text-sky',
  Gamified: 'bg-flame-wash text-flame-ink',
  Mascot: 'bg-amber-wash text-amber',
  Abstract: 'bg-indigo-wash text-indigo',
};

function readPick(): string {
  try {
    const id = localStorage.getItem(PICK_KEY);
    if (id && CONCEPTS.some((c) => c.id === id)) return id;
  } catch {
    /* lab convenience only */
  }
  return CONCEPTS[0].id;
}

const svgMarkup = (c: Concept, size = 512) => renderToStaticMarkup(<IconSvg concept={c} size={size} />);
const svgDataUrl = (c: Concept) => `data:image/svg+xml,${encodeURIComponent(svgMarkup(c, 64))}`;

function Tag({ c }: { c: Concept }) {
  return <span className={`shrink-0 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-black tracking-[0.04em] tabular ${TONE[c.category]}`}>{c.id}</span>;
}

/* ---------- Gallery ---------- */

function ConceptCard({ c, on, onPick }: { c: Concept; on: boolean; onPick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onPick}
      className={`group relative flex flex-col gap-2.5 rounded-[22px] border-2 bg-ink-2 p-3 text-left transition-[transform,border-color,box-shadow] duration-200 ease-out sm:p-3.5 ${
        on ? 'border-accent shadow-[0_5px_0_var(--color-accent-lip)]' : 'border-rule shadow-[0_5px_0_var(--color-rule)] hover:-translate-y-0.5 hover:border-hanji-2/40'
      }`}
    >
      {on && (
        <span className="anim-pop absolute right-2.5 top-2.5 z-10 grid size-6 place-items-center rounded-full bg-accent text-white">
          <Check size={14} strokeWidth={3} aria-hidden />
        </span>
      )}
      <span className="grid place-items-center rounded-2xl bg-ink-3/70 py-5">
        <IconSvg concept={c} size={84} className="drop-shadow-[0_6px_10px_rgba(59,42,30,0.18)] transition-transform duration-300 ease-[var(--ease-spring)] group-hover:scale-[1.06]" />
      </span>
      <span className="flex min-w-0 items-center gap-2">
        <Tag c={c} />
        <span className="truncate text-[14px] font-extrabold">{c.name}</span>
      </span>
      <span className="line-clamp-2 text-[12.5px] leading-snug text-hanji-2">{c.blurb}</span>
    </button>
  );
}

/* ---------- Sandbox mockups ---------- */

function Panel({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <section className="rounded-[22px] border-2 border-rule bg-ink-2 p-4">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h3 className="text-[12px] font-black uppercase tracking-[0.12em] text-hanji-2">{title}</h3>
        {note && <span className="text-right text-[11.5px] font-semibold text-hanji-2/80">{note}</span>}
      </div>
      {children}
    </section>
  );
}

const CHROME = {
  light: { bar: '#dfe3e8', tab: '#ffffff', idle: '#c9ced6', text: '#1f2328', sub: '#5f6670', url: '#eef1f4' },
  dark: { bar: '#1f2023', tab: '#35363a', idle: '#2a2b2f', text: '#e8eaed', sub: '#9aa0a6', url: '#202124' },
};

function BrowserTab({ c, mode }: { c: Concept; mode: 'light' | 'dark' }) {
  const k = CHROME[mode];
  return (
    <div className="overflow-hidden rounded-xl" style={{ background: k.bar }}>
      <div className="flex items-end gap-1 px-2 pt-2">
        <div className="flex h-8 w-[52%] items-center gap-2 rounded-t-[10px] px-3" style={{ background: k.tab, color: k.text }}>
          <IconSvg concept={c} size={16} />
          <span className="truncate text-[12px] font-semibold">어휘장</span>
          <X size={12} className="ml-auto shrink-0 opacity-60" aria-hidden />
        </div>
        <div className="mb-1 flex h-6 w-[34%] items-center gap-2 rounded-md px-2.5" style={{ background: k.idle, color: k.sub }}>
          <span className="size-3.5 shrink-0 rounded-full" style={{ background: k.sub, opacity: 0.5 }} />
          <span className="truncate text-[11px] font-semibold">New Tab</span>
        </div>
      </div>
      <div className="flex items-center gap-2 px-2 pb-2 pt-1.5" style={{ background: k.tab }}>
        <div className="flex h-7 flex-1 items-center rounded-full px-3 text-[12px]" style={{ background: k.url, color: k.sub }}>
          <span style={{ color: k.text }}>eohwijang.fyi</span>
        </div>
      </div>
    </div>
  );
}

const APPS = [
  { name: 'Notes', icon: StickyNote, bg: '#ffd84d', fg: '#7a5a00' },
  { name: 'Camera', icon: Camera, bg: '#6b7280', fg: '#fff' },
  { name: 'Maps', icon: MapIcon, bg: '#4cc38a', fg: '#fff' },
  { name: 'Music', icon: Music, bg: '#ff5c7a', fg: '#fff' },
  { name: 'Clock', icon: Clock, bg: '#1f2937', fg: '#fff' },
  { name: 'Photos', icon: ImageIcon, bg: '#ffffff', fg: '#f59e0b' },
  { name: 'Calendar', icon: Calendar, bg: '#ffffff', fg: '#ef4444' },
];
const DOCK = [
  { name: 'Phone', icon: Phone, bg: '#34c759', fg: '#fff' },
  { name: 'Messages', icon: MessageCircle, bg: '#30b0ff', fg: '#fff' },
  { name: 'Mail', icon: Mail, bg: '#2f80ed', fg: '#fff' },
  { name: 'Settings', icon: Settings, bg: '#8e8e93', fg: '#fff' },
];

function AppTile({ app, label = true }: { app: (typeof APPS)[number]; label?: boolean }) {
  const Icon = app.icon;
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="grid size-[46px] place-items-center rounded-[13px] shadow-[0_2px_6px_rgba(0,0,0,0.18)]" style={{ background: app.bg, color: app.fg }}>
        <Icon size={22} strokeWidth={2.2} aria-hidden />
      </span>
      {label && <span className="text-[9.5px] font-semibold text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.45)]">{app.name}</span>}
    </div>
  );
}

function HomeScreen({ c, wall }: { c: Concept; wall: 'day' | 'night' }) {
  const bg =
    wall === 'day'
      ? 'radial-gradient(120% 80% at 20% 0%, #ffd9b8 0%, #f6a6a0 40%, #8a7cf0 100%)'
      : 'radial-gradient(120% 80% at 80% 0%, #3a4a8c 0%, #1b2140 55%, #0b0e1d 100%)';
  const mine = (
    <div key="mine" className="flex flex-col items-center gap-1">
      <IconSvg concept={c} size={46} shape="squircle" className="drop-shadow-[0_2px_6px_rgba(0,0,0,0.25)]" />
      <span className="text-[9.5px] font-semibold text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.45)]">어휘장</span>
    </div>
  );
  const tiles = [...APPS.slice(0, 5).map((a) => <AppTile key={a.name} app={a} />), mine, ...APPS.slice(5).map((a) => <AppTile key={a.name} app={a} />)];
  return (
    <div className="mx-auto w-[248px] rounded-[40px] border-[7px] border-[#1c1c1e] bg-[#1c1c1e] shadow-[0_18px_40px_rgba(0,0,0,0.25)]">
      <div className="relative flex h-[380px] flex-col overflow-hidden rounded-[33px] px-4" style={{ background: bg }}>
        <div className="flex items-center justify-between px-2 pt-2.5 text-[11px] font-bold text-white">
          <span className="tabular">9:41</span>
          <span className="h-[18px] w-[70px] rounded-full bg-black" />
          <span className="flex items-center gap-1">
            <span className="h-2 w-3 rounded-[2px] bg-white/90" />
            <span className="h-2.5 w-5 rounded-[3px] border border-white/90" />
          </span>
        </div>
        <div className="mt-6 grid grid-cols-4 gap-x-3 gap-y-4">{tiles}</div>
        <div className="mt-auto mb-3 grid grid-cols-4 gap-3 rounded-[26px] bg-white/25 p-3 backdrop-blur-md">
          {DOCK.map((a) => (
            <AppTile key={a.name} app={a} label={false} />
          ))}
        </div>
      </div>
    </div>
  );
}

const NAV = {
  light: { bg: '#fff8ee', card: '#ffffff', rule: '#f0dfc6', text: '#3b2a1e', sub: '#7a6350', mark: '#14834a' },
  dark: { bg: '#191c23', card: '#22262f', rule: '#353b48', text: '#ece6dc', sub: '#a8a198', mark: '#62d395' },
};

function NavbarMock({ c, mode }: { c: Concept; mode: 'light' | 'dark' }) {
  const k = NAV[mode];
  const pill = { background: k.card, borderColor: k.rule };
  return (
    <div className="flex h-14 items-center gap-2 rounded-xl border-2 px-3" style={{ background: k.bg, borderColor: k.rule }}>
      <IconSvg concept={c} size={32} />
      <span className="font-serif text-[24px] leading-none" style={{ color: k.mark }}>
        어휘장
      </span>
      <span className="ml-auto size-8 rounded-full border-2" style={pill} />
      <span className="size-8 rounded-full border-2" style={pill} />
      <span className="h-8 w-16 rounded-full border-2" style={pill} />
    </div>
  );
}

function InstallPrompt({ c }: { c: Concept }) {
  return (
    <div className="rounded-2xl bg-white p-4 text-[#1f2328] shadow-[0_10px_30px_rgba(0,0,0,0.16)] ring-1 ring-black/5">
      <p className="text-[15px] font-bold">Install app?</p>
      <div className="mt-3 flex items-center gap-3">
        <IconSvg concept={c} size={44} />
        <div className="min-w-0">
          <p className="truncate text-[14px] font-semibold">어휘장 · Korean vocabulary</p>
          <p className="text-[12px] text-[#5f6670]">eohwijang.fyi</p>
        </div>
      </div>
      <div aria-hidden className="mt-4 flex justify-end gap-2 text-[13px] font-semibold">
        <span className="rounded-full px-4 py-1.5 text-[#1a6cc0]">Cancel</span>
        <span className="rounded-full bg-[#1a6cc0] px-4 py-1.5 text-white">Install</span>
      </div>
    </div>
  );
}

/** Android adaptive icon: the launcher crops the full-bleed art to a circle; the dashed ring is the maskable safe zone. */
function Maskable({ c }: { c: Concept }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className="relative">
        <IconSvg concept={c} size={72} shape="circle" />
        <span aria-hidden className="absolute inset-[10%] rounded-full border-[1.5px] border-dashed border-white/80 mix-blend-difference" />
      </span>
      <span className="text-[11px] font-semibold text-hanji-2">Maskable</span>
    </div>
  );
}

function Splash({ c }: { c: Concept }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="flex h-[132px] w-[74px] flex-col items-center justify-center gap-2 rounded-[14px] border-2 border-[#f0dfc6] bg-[#fff8ee]">
        <IconSvg concept={c} size={38} />
        <span className="font-serif text-[11px] text-[#3b2a1e]">어휘장</span>
      </div>
      <span className="text-[11px] font-semibold text-hanji-2">Splash</span>
    </div>
  );
}

function Sandbox({ c }: { c: Concept }) {
  const [wall, setWall] = useState<'day' | 'night'>('day');
  const [copied, setCopied] = useState(false);

  useEffect(() => setCopied(false), [c]);

  const download = () => {
    const url = URL.createObjectURL(new Blob([svgMarkup(c)], { type: 'image/svg+xml' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `eohwijang-icon-${c.id}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(svgMarkup(c));
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <section className="rounded-[22px] border-2 border-accent/40 bg-ink-2 p-4 shadow-[0_5px_0_var(--color-rule)]">
        <div className="flex items-start gap-4">
          <IconSvg key={c.id} concept={c} size={104} title={`${c.id}: ${c.name}`} className="anim-pop shrink-0 drop-shadow-[0_8px_14px_rgba(59,42,30,0.22)]" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Tag c={c} />
              <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-hanji-2">{c.category}</span>
            </div>
            <h2 className="mt-1.5 text-[20px] font-black leading-tight">{c.name}</h2>
            <p className="mt-1 text-[13px] leading-snug text-hanji-2">{c.blurb}</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button type="button" onClick={download} className="press lip-accent flex h-9 items-center gap-1.5 rounded-full bg-accent px-4 text-[13px] font-extrabold text-white">
            <Download size={15} aria-hidden /> SVG
          </button>
          <button type="button" onClick={copy} className="press flex h-9 items-center gap-1.5 rounded-full border-2 border-rule bg-ink-2 px-4 text-[13px] font-extrabold">
            {copied ? <Check size={15} className="text-accent-text" aria-hidden /> : <Copy size={15} aria-hidden />}
            {copied ? 'Copied' : 'Copy SVG'}
          </button>
          <span className="ml-auto flex items-center gap-2 text-[11.5px] font-semibold text-hanji-2">
            <span className="flex flex-col items-center gap-0.5">
              <span className="overflow-hidden rounded-[7px]">
                <CurrentIcon size={30} />
              </span>
              old
            </span>
            <span aria-hidden>→</span>
            <span className="flex flex-col items-center gap-0.5">
              <IconSvg concept={c} size={30} />
              new
            </span>
          </span>
        </div>
      </section>

      <Panel title="Favicon" note="This tab’s real favicon is switched too">
        <div className="flex flex-col gap-2">
          <BrowserTab c={c} mode="light" />
          <BrowserTab c={c} mode="dark" />
        </div>
        <div className="mt-3 flex items-end justify-between gap-2 rounded-xl bg-ink-3/60 px-3 py-2.5">
          {[16, 24, 32, 48, 64].map((s) => (
            <span key={s} className="flex flex-col items-center gap-1">
              <IconSvg concept={c} size={s} />
              <span className="text-[10.5px] font-bold text-hanji-2 tabular">{s}px</span>
            </span>
          ))}
        </div>
      </Panel>

      <Panel title="Home screen" note="Real size: 46px on a 248px phone">
        <div role="radiogroup" aria-label="Wallpaper" className="mb-3 flex w-fit rounded-full border-2 border-rule bg-ink p-0.5">
          {(['day', 'night'] as const).map((w) => (
            <button
              key={w}
              type="button"
              role="radio"
              aria-checked={wall === w}
              onClick={() => setWall(w)}
              className={`h-7 rounded-full px-3 text-[11.5px] font-black capitalize ${wall === w ? 'bg-accent text-white' : 'text-hanji-2 hover:text-hanji'}`}
            >
              {w} wallpaper
            </button>
          ))}
        </div>
        <HomeScreen c={c} wall={wall} />
      </Panel>

      <Panel title="Navbar branding" note="Light and night study">
        <div className="flex flex-col gap-2">
          <NavbarMock c={c} mode="light" />
          <NavbarMock c={c} mode="dark" />
        </div>
      </Panel>

      <Panel title="Installed PWA" note="Chrome prompt, Android launcher, splash">
        <InstallPrompt c={c} />
        <div className="mt-4 flex items-end justify-around gap-3">
          <Maskable c={c} />
          <div className="flex flex-col items-center gap-1.5">
            <IconSvg concept={c} size={72} />
            <span className="text-[11px] font-semibold text-hanji-2">192 · any</span>
          </div>
          <Splash c={c} />
        </div>
      </Panel>
    </div>
  );
}

/* ---------- Page ---------- */

export default function IconLab() {
  const [pick, setPick] = useState(readPick);
  const [filter, setFilter] = useState<Category | 'All'>('All');
  const concept = CONCEPTS.find((c) => c.id === pick) ?? CONCEPTS[0];
  const shown = useMemo(() => (filter === 'All' ? CONCEPTS : CONCEPTS.filter((c) => c.category === filter)), [filter]);

  const choose = (id: string) => {
    setPick(id);
    try {
      localStorage.setItem(PICK_KEY, id);
    } catch {
      /* lab convenience only */
    }
  };

  useEffect(() => {
    const title = document.title;
    document.title = 'Icon lab · 어휘장';
    return () => {
      document.title = title;
    };
  }, []);

  // Swap the real favicon so the browser tab previews the pick; restore it on the way out.
  useEffect(() => {
    const link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (!link) return;
    const href = link.getAttribute('href');
    link.setAttribute('href', svgDataUrl(concept));
    return () => {
      if (href) link.setAttribute('href', href);
    };
  }, [concept]);

  return (
    <div className="h-full overflow-y-auto bg-ink text-hanji">
      <header className="border-b-2 border-rule">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-4 md:px-6">
          <a href="#" className="press flex h-9 items-center gap-1.5 rounded-full border-2 border-rule bg-ink-2 px-3 text-[13px] font-extrabold">
            <ArrowLeft size={15} aria-hidden /> App
          </a>
          <div className="min-w-0">
            <h1 className="flex items-baseline gap-2 text-[22px] font-black leading-tight">
              Icon lab <span className="font-serif text-[20px] font-normal text-accent">어휘장</span>
            </h1>
            <p className="text-[13px] text-hanji-2">{CONCEPTS.length} concepts. Pick one to see it in the tab, on a home screen, in the navbar and as an installed app.</p>
          </div>
          <span className="ml-auto rounded-full bg-amber-wash px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.1em] text-amber">dev preview</span>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-5 md:px-6 lg:grid-cols-[minmax(0,1fr)_400px]">
        <section aria-label="Icon concepts" className="min-w-0">
          <div role="radiogroup" aria-label="Theme" className="mb-4 flex flex-wrap gap-1.5">
            {(['All', ...CATEGORIES] as const).map((f) => {
              const n = f === 'All' ? CONCEPTS.length : CONCEPTS.filter((c) => c.category === f).length;
              const on = filter === f;
              return (
                <button
                  key={f}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => setFilter(f)}
                  className={`flex h-8 items-center gap-1.5 rounded-full border-2 px-3 text-[12.5px] font-extrabold transition-colors ${
                    on ? 'border-accent bg-accent text-white' : 'border-rule bg-ink-2 text-hanji-2 hover:text-hanji'
                  }`}
                >
                  {f}
                  <span className={`tabular text-[11px] ${on ? 'text-white/80' : 'text-hanji-2/70'}`}>{n}</span>
                </button>
              );
            })}
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4">
            {shown.map((c) => (
              <ConceptCard key={c.id} c={c} on={c.id === concept.id} onPick={() => choose(c.id)} />
            ))}
          </div>
        </section>

        <aside id="sandbox" aria-label="Sandbox" className="min-w-0 lg:sticky lg:top-5 lg:max-h-[calc(100dvh-40px)] lg:self-start lg:overflow-y-auto lg:pb-2">
          <Sandbox c={concept} />
        </aside>
      </main>

      <a
        href="#sandbox"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById('sandbox')?.scrollIntoView({ behavior: 'smooth' });
        }}
        className="press lip-accent fixed bottom-[max(16px,env(safe-area-inset-bottom))] right-4 flex h-11 items-center gap-2 rounded-full bg-accent pl-1.5 pr-4 text-[13px] font-extrabold text-white lg:hidden"
      >
        <IconSvg concept={concept} size={32} />
        Preview {concept.id}
      </a>
    </div>
  );
}
