import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Cloud, CloudAlert, CloudOff, Database, Languages, RefreshCw, WifiOff } from 'lucide-react';
import type { PromptLang, Settings, UiLang } from '../types';
import type { Strings } from '../lib/i18n';
import type { CloudSync } from '../lib/hooks';

interface Props {
  t: Strings;
  settings: Settings;
  online: boolean;
  onChange: (patch: Partial<Settings>) => void;
  onHome: () => void;
  onData: () => void;
  sync: CloudSync;
  onSync: () => void;
  /** Admin view (#admin): only the logo and Cloud Sync status, no learner controls. */
  admin?: boolean;
}

const UI_LANGS: { value: UiLang; code: string; name: string }[] = [
  { value: 'en', code: 'EN', name: 'English' },
  { value: 'ru', code: 'RU', name: 'Русский' },
  { value: 'uz', code: 'UZ', name: "O'zbekcha" },
  { value: 'ko', code: 'KO', name: '한국어' },
];

/** Interface language: a compact code button that opens a small menu of full names. */
function UiLangMenu({ t, value, onChange }: { t: Strings; value: UiLang; onChange: (v: UiLang) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === 'Escape' : !ref.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener('mousedown', close);
    window.addEventListener('keydown', close);
    return () => {
      window.removeEventListener('mousedown', close);
      window.removeEventListener('keydown', close);
    };
  }, [open]);

  const current = UI_LANGS.find((l) => l.value === value)!;
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`${t.uiLang}: ${current.name}`}
        title={t.uiLang}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 items-center gap-1 border border-rule px-2 text-[12px] font-bold tracking-[0.06em] text-hanji hover:border-hanji-2 sm:gap-1.5 sm:px-2.5"
      >
        <Languages size={15} aria-hidden className="text-hanji-2" />
        {current.code}
        <ChevronDown size={13} aria-hidden className={`hidden text-hanji-2 transition-transform sm:block ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div role="menu" aria-label={t.uiLang} className="anim-sheet absolute right-0 top-[calc(100%+6px)] z-50 w-44 border border-rule bg-ink-2 py-1">
          <p className="px-3 pb-1.5 pt-1 text-[11px] font-bold uppercase tracking-[0.12em] text-hanji-2">{t.uiLang}</p>
          {UI_LANGS.map((l) => (
            <button
              key={l.value}
              type="button"
              role="menuitemradio"
              aria-checked={l.value === value}
              onClick={() => {
                onChange(l.value);
                setOpen(false);
              }}
              className="flex w-full items-center gap-3 px-3 py-2 text-left text-[14px] hover:bg-ink-3"
            >
              <span className="w-6 text-[11px] font-bold tracking-[0.06em] text-hanji-2">{l.code}</span>
              <span lang={l.value} className="flex-1">
                {l.name}
              </span>
              {l.value === value && <Check size={15} className="text-accent-text" aria-hidden />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Cloud Sync state at a glance; opens the Sync ID dialog. Always shown, even on a build without a backend (the dialog explains). */
function SyncButton({ t, sync, online, onClick }: { t: Strings; sync: CloudSync; online: boolean; onClick: () => void }) {
  const state = !sync.syncId ? 'off' : !online ? 'offline' : sync.status;
  const { icon, label, tone } = {
    off: { icon: <CloudOff size={15} aria-hidden />, label: t.syncOff, tone: 'text-hanji-2' },
    offline: { icon: <CloudOff size={15} aria-hidden />, label: t.offline, tone: 'text-hanji-2' },
    idle: { icon: <Cloud size={15} aria-hidden />, label: t.cloudSync, tone: 'text-hanji' },
    syncing: { icon: <RefreshCw size={15} aria-hidden className="animate-spin" />, label: t.syncing, tone: 'text-hanji' },
    ok: { icon: <Cloud size={15} aria-hidden />, label: t.synced, tone: 'text-accent-text' },
    error: { icon: <CloudAlert size={15} aria-hidden />, label: t.syncProblem, tone: 'text-danger-text' },
  }[state];
  return (
    <button
      type="button"
      onClick={onClick}
      title={`${t.cloudSync}: ${label}`}
      aria-label={`${t.cloudSync}: ${label}`}
      className={`relative flex h-9 shrink-0 items-center gap-1.5 border px-2.5 text-[13px] font-semibold hover:border-hanji-2 ${
        state === 'ok' ? 'border-accent/60' : state === 'error' ? 'border-danger/60' : 'border-rule'
      } ${tone}`}
    >
      {icon}
      <span className="hidden whitespace-nowrap sm:inline">{label}</span>
      {state === 'ok' && <span aria-hidden className="absolute -right-[3px] -top-[3px] h-[7px] w-[7px] rounded-full bg-accent sm:hidden" />}
    </button>
  );
}

export function Navbar({ t, settings, online, onChange, onHome, onData, sync, onSync, admin = false }: Props) {
  const prompt: { value: PromptLang; label: string; title: string }[] = [
    { value: 'uz', label: 'UZ', title: `${t.langName.uz} → 한국어` },
    { value: 'ru', label: 'RU', title: `${t.langName.ru} → 한국어` },
    { value: 'en', label: 'EN', title: `${t.langName.en} → 한국어` },
    { value: 'all', label: t.all.toUpperCase(), title: 'UZ · RU · EN → 한국어' },
  ];

  return (
    <header className="shrink-0 border-b border-rule">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center gap-2 px-3 sm:gap-3 md:h-16 md:px-5">
        <button type="button" onClick={onHome} className="mr-auto flex min-w-0 shrink-0 items-baseline gap-2 text-left" aria-label={`${t.appName} — ${t.books}`}>
          <span className="whitespace-nowrap font-serif text-[20px] font-bold leading-none tracking-tight sm:text-[22px] md:text-[26px]">어휘장</span>
          {t.appName !== '어휘장' && <span className="hidden text-[13px] font-semibold text-hanji-2 lg:inline">{t.appName}</span>}
        </button>

        <SyncButton t={t} sync={sync} online={online} onClick={onSync} />

        {!admin && (
          <>
          {!online && !sync.syncId && (
            <span className="hidden items-center gap-1 text-[12px] font-semibold text-hanji-2 sm:flex" title={t.offline}>
              <WifiOff size={14} aria-hidden /> <span className="hidden lg:inline">{t.offline}</span>
            </span>
          )}

          <UiLangMenu t={t} value={settings.uiLang} onChange={(uiLang) => onChange({ uiLang })} />

          <div className="flex items-center gap-2">
            <span className="hidden text-[11px] font-bold uppercase tracking-[0.12em] text-hanji-2 lg:inline">{t.promptLang}</span>
            <div role="radiogroup" aria-label={`${t.promptLang} → 한국어`} className="flex border border-rule">
              {prompt.map((o) => {
                const on = o.value === settings.promptLang;
                return (
                  <button
                    key={o.value}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    title={o.title}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => onChange({ promptLang: o.value })}
                    className={`h-[34px] min-w-8 px-1.5 text-[11px] font-bold tracking-[0.05em] transition-colors sm:min-w-10 sm:px-2 ${
                      on ? 'bg-accent text-ink' : 'text-hanji-2 hover:bg-ink-3 hover:text-hanji'
                    }`}
                  >
                    {o.label}
                  </button>
                );
              })}
            </div>
            <span lang="ko" className="hidden text-[12px] font-semibold text-hanji md:inline">
              → 한국어
            </span>
          </div>

          <button
            type="button"
            onClick={onData}
            title={t.data}
            aria-label={t.data}
            className="flex h-9 shrink-0 items-center gap-1.5 border border-rule px-2.5 text-[13px] font-semibold text-hanji hover:border-hanji-2"
          >
            <Database size={15} aria-hidden />
            <span className="hidden xl:inline">{t.data}</span>
          </button>
          </>
        )}
      </div>
    </header>
  );
}
