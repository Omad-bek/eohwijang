/**
 * Header preview: the live Navbar inside device-width frames. Media queries follow the frame's
 * own width, so each iframe shows the layout a real phone, tablet or desktop gets. Inside a
 * frame (Lab renders bare there) this page draws just the Navbar, with local, unsaved settings.
 * Variants A / B / C are ways to fit the About (info) button on phones.
 */
import { useEffect, useState } from 'react';
import { Navbar } from '../components/Navbar';
import { STRINGS } from '../lib/i18n';
import type { CloudSync } from '../lib/hooks';
import type { Settings } from '../types';

type Variant = 'a' | 'b' | 'c';

const FRAMES = [
  { width: 320, label: 'Small phone' },
  { width: 360, label: 'Android' },
  { width: 414, label: 'Large phone' },
  { width: 640, label: 'sm' },
  { width: 768, label: 'md tablet · same in every variant' },
  { width: 1280, label: 'Desktop · same in every variant' },
];

const NOTES: Record<Variant, string> = {
  a: 'Compact row: the info button sits in the header on phones too. To make room, header buttons shrink from 36px to 32px below 400px wide.',
  b: 'More menu: on phones the Data button becomes a ••• menu holding Words & data and About. Buttons keep their full size.',
  c: 'Settings menu: on phones sound and dark mode fold into one ⚙ menu, so the info button gets its own spot in the row at full size.',
};

const noop = () => {};
const SYNC: CloudSync = {
  available: false,
  syncId: null,
  status: 'idle',
  lastSyncedAt: null,
  previousSyncId: null,
  connect: async () => {},
  link: async () => {},
  syncNow: async () => {},
  disconnect: async () => {},
};

/** Follows the lab's theme switch in the parent page. */
function useParentTheme() {
  const parentRoot = window.parent.document.documentElement;
  const [dark, setDark] = useState(parentRoot.dataset.theme === 'dark');
  useEffect(() => {
    const sync = () => setDark(parentRoot.dataset.theme === 'dark');
    const observer = new MutationObserver(sync);
    observer.observe(parentRoot, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, [parentRoot]);
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  }, [dark]);
  return dark;
}

function FramedNavbar({ variant }: { variant: Variant }) {
  const dark = useParentTheme();
  const [settings, setSettings] = useState<Settings>({ uiLang: 'ru', promptLang: 'ru', stageSize: 10 });
  const [soundOn, setSoundOn] = useState(true);
  return (
    <div className="h-full bg-ink">
      <Navbar
        t={STRINGS[settings.uiLang]}
        settings={settings}
        online
        onChange={(patch) => setSettings((s) => ({ ...s, ...patch }))}
        onHome={noop}
        onData={noop}
        onAbout={noop}
        sync={SYNC}
        onSync={noop}
        theme={dark ? 'dark' : 'light'}
        onToggleTheme={() => (window.parent.document.documentElement.dataset.theme = dark ? 'light' : 'dark')}
        soundOn={soundOn}
        onToggleSound={() => setSoundOn((on) => !on)}
        phoneVariant={variant}
      />
    </div>
  );
}

function HeaderLab({ variant }: { variant: Variant }) {
  if (window.self !== window.top) return <FramedNavbar variant={variant} />;
  return (
    <div className="h-full overflow-auto p-4 md:p-6">
      <p className="mb-4 max-w-2xl text-[13px] font-semibold leading-relaxed text-hanji-2">
        <span className="text-hanji">{NOTES[variant]}</span> Below md the prompt and interface languages share one menu. Every button works, so tap around.
      </p>
      <div className="flex flex-col gap-5">
        {FRAMES.map((f) => (
          <figure key={f.width} className="m-0">
            <figcaption className="mb-1.5 text-[11px] font-black uppercase tracking-[0.12em] text-hanji-2">
              {f.width}px · {f.label}
            </figcaption>
            <iframe
              title={`Header at ${f.width}px`}
              src={`/#design-lab/header/${variant}`}
              style={{ width: f.width, height: f.width < 768 ? 460 : 300 }}
              className="box-content block max-w-none rounded-2xl border-2 border-rule bg-ink"
            />
          </figure>
        ))}
      </div>
    </div>
  );
}

export const HeaderLabA = () => <HeaderLab variant="a" />;
export const HeaderLabB = () => <HeaderLab variant="b" />;
export const HeaderLabC = () => <HeaderLab variant="c" />;
