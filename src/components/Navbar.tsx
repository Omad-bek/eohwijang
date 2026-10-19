import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Check, ChevronDown, Cloud, CloudAlert, CloudOff, Database, Ellipsis, Info, Languages, Moon, RefreshCw, Settings2, Sun, Volume2, VolumeX, WifiOff } from 'lucide-react';
import type { PromptLang, Settings, UiLang } from '../types';
import type { Strings } from '../lib/i18n';
import type { CloudSync } from '../lib/hooks';
import type { Theme } from '../lib/theme';

interface Props {
  t: Strings;
  settings: Settings;
  online: boolean;
  onChange: (patch: Partial<Settings>) => void;
  onHome: () => void;
  onData: () => void;
  /** Opens the Welcome page (#about). The button shows from md up; phones get a link at the foot of the dashboard. */
  onAbout?: () => void;
  sync: CloudSync;
  onSync: () => void;
  /** Admin view (#admin): only the logo and Cloud Sync status, no learner controls. */
  admin?: boolean;
  theme: Theme;
  onToggleTheme: () => void;
  soundOn: boolean;
  onToggleSound: () => void;
  /**
   * Design Lab only: how phones (below md) make room for the About button. Unset is the live layout.
   * a: every control in the row, buttons 32px below 400px; b: Data and About share a "more" menu;
   * c: sound and theme share a settings menu.
   */
  phoneVariant?: 'a' | 'b' | 'c';
}

const UI_LANGS: { value: UiLang; code: string; name: string }[] = [
  { value: 'en', code: 'EN', name: 'English' },
  { value: 'ru', code: 'RU', name: 'Русский' },
  { value: 'uz', code: 'UZ', name: "O'zbekcha" },
  { value: 'ko', code: 'KO', name: '한국어' },
];

/** Prompt languages, i.e. what the quiz shows before the Korean answer. */
function promptOptions(t: Strings): { value: PromptLang; code: string; name: string; title: string }[] {
  return [
    { value: 'uz', code: 'UZ', name: "O'zbekcha", title: `${t.langName.uz} → 한국어` },
    { value: 'ru', code: 'RU', name: 'Русский', title: `${t.langName.ru} → 한국어` },
    { value: 'en', code: 'EN', name: 'English', title: `${t.langName.en} → 한국어` },
    { value: 'all', code: t.all.toUpperCase(), name: 'UZ · RU · EN', title: 'UZ · RU · EN → 한국어' },
  ];
}

/** Open / close state for a header menu: closes on Escape or a press outside it. */
function useMenu() {
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

  return { open, setOpen, ref };
}

const MENU_TRIGGER =
  'press flex h-(--hb) items-center gap-1 rounded-full border-2 border-rule bg-ink-2 px-2.5 text-[12px] font-extrabold tracking-[0.06em] text-hanji hover:border-hanji-2/40 sm:gap-1.5 sm:px-3';
const MENU_PANEL =
  'anim-sheet absolute top-[calc(100%+8px)] z-50 max-h-[calc(100dvh-5rem)] overflow-y-auto rounded-2xl border-2 border-rule bg-ink-2 py-1.5 shadow-[0_5px_0_var(--color-rule)]';

function MenuHeading({ children }: { children: ReactNode }) {
  return <p className="px-3 pb-1.5 pt-1 text-[11px] font-bold uppercase tracking-[0.12em] text-hanji-2">{children}</p>;
}

function MenuItem({ code, name, lang, checked, title, onSelect }: { code: string; name: string; lang?: string; checked: boolean; title?: string; onSelect: () => void }) {
  return (
    <button
      type="button"
      role="menuitemradio"
      aria-checked={checked}
      title={title}
      onClick={onSelect}
      className="flex w-full items-center gap-3 rounded-none px-3 py-2 text-left text-[14px] font-semibold hover:bg-ink-3"
    >
      <span className="min-w-6 text-[11px] font-bold tracking-[0.06em] text-hanji-2">{code}</span>
      <span lang={lang} className="flex-1">
        {name}
      </span>
      {checked && <Check size={15} className="text-accent-text" aria-hidden />}
    </button>
  );
}

/** Interface language (md and up): a compact code button that opens a small menu of full names. */
function UiLangMenu({ t, value, onChange }: { t: Strings; value: UiLang; onChange: (v: UiLang) => void }) {
  const { open, setOpen, ref } = useMenu();
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
        className={MENU_TRIGGER}
      >
        <Languages size={15} aria-hidden className="text-hanji-2" />
        {current.code}
        <ChevronDown size={13} aria-hidden className={`hidden text-hanji-2 transition-transform sm:block ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div role="menu" aria-label={t.uiLang} className={`${MENU_PANEL} right-0 w-48`}>
          <MenuHeading>{t.uiLang}</MenuHeading>
          {UI_LANGS.map((l) => (
            <MenuItem
              key={l.value}
              code={l.code}
              name={l.name}
              lang={l.value}
              checked={l.value === value}
              onSelect={() => {
                onChange(l.value);
                setOpen(false);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Below md, one button holds both language choices so the header fits a phone:
 * it shows the prompt language (the one switched most) and opens a menu with
 * the prompt languages first, then the interface languages.
 */
function LangMenu({ t, settings, onChange }: { t: Strings; settings: Settings; onChange: (patch: Partial<Settings>) => void }) {
  const { open, setOpen, ref } = useMenu();
  const prompt = promptOptions(t);
  const currentPrompt = prompt.find((o) => o.value === settings.promptLang)!;
  const currentUi = UI_LANGS.find((l) => l.value === settings.uiLang)!;
  const pick = (patch: Partial<Settings>) => {
    onChange(patch);
    setOpen(false);
  };
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`${t.promptLang}: ${currentPrompt.title} · ${t.uiLang}: ${currentUi.name}`}
        title={`${t.promptLang}: ${currentPrompt.title}`}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setOpen((o) => !o)}
        className={MENU_TRIGGER}
      >
        <Languages size={15} aria-hidden className="text-hanji-2" />
        {currentPrompt.code}
        <ChevronDown size={13} aria-hidden className={`hidden text-hanji-2 transition-transform sm:block ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div role="menu" aria-label={`${t.promptLang} · ${t.uiLang}`} className={`${MENU_PANEL} right-0 w-56`}>
          <div role="group" aria-label={`${t.promptLang} → 한국어`}>
            <MenuHeading>
              {t.promptLang} <span lang="ko" className="normal-case tracking-normal">→ 한국어</span>
            </MenuHeading>
            {prompt.map((o) => (
              <MenuItem key={o.value} code={o.code} name={o.name} lang={o.value === 'all' ? undefined : o.value} title={o.title} checked={o.value === settings.promptLang} onSelect={() => pick({ promptLang: o.value })} />
            ))}
          </div>
          <div aria-hidden className="mx-3 my-1.5 border-t-2 border-rule" />
          <div role="group" aria-label={t.uiLang}>
            <MenuHeading>{t.uiLang}</MenuHeading>
            {UI_LANGS.map((l) => (
              <MenuItem key={l.value} code={l.code} name={l.name} lang={l.value} checked={l.value === settings.uiLang} onSelect={() => pick({ uiLang: l.value })} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const ROUND_BUTTON =
  'press grid size-(--hb) shrink-0 place-items-center rounded-full border-2 border-rule bg-ink-2 text-hanji-2 hover:border-hanji-2/40 hover:text-hanji';

function MenuAction({ icon, label, onSelect }: { icon: ReactNode; label: string; onSelect: () => void }) {
  return (
    <button type="button" role="menuitem" onClick={onSelect} className="flex w-full items-center gap-3 rounded-none px-3 py-2.5 text-left text-[14px] font-semibold hover:bg-ink-3">
      <span className="grid w-6 place-items-center text-hanji-2">{icon}</span>
      <span className="flex-1">{label}</span>
    </button>
  );
}

/** A round icon button that opens a short menu of actions (phone layouts in the Design Lab). `align` is the edge the menu hangs from. */
function IconMenu({ icon, label, items, align = 'right' }: { icon: ReactNode; label: string; items: { icon: ReactNode; label: string; onSelect: () => void }[]; align?: 'left' | 'right' }) {
  const { open, setOpen, ref } = useMenu();
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={label}
        title={label}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setOpen((o) => !o)}
        className={`${ROUND_BUTTON} ${open ? 'border-hanji-2/40 text-hanji' : ''}`}
      >
        {icon}
      </button>
      {open && (
        <div role="menu" aria-label={label} className={`${MENU_PANEL} w-52 ${align === 'left' ? 'left-0' : 'right-0'}`}>
          {items.map((item) => (
            <MenuAction
              key={item.label}
              icon={item.icon}
              label={item.label}
              onSelect={() => {
                item.onSelect();
                setOpen(false);
              }}
            />
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
      className={`press relative flex h-(--hb) shrink-0 items-center gap-1.5 rounded-full border-2 bg-ink-2 px-3 text-[13px] font-extrabold hover:border-hanji-2/40 ${
        state === 'ok' ? 'border-accent/50' : state === 'error' ? 'border-danger/60' : 'border-rule'
      } ${tone}`}
    >
      {icon}
      <span className="hidden whitespace-nowrap sm:inline">{label}</span>
      {state === 'ok' && <span aria-hidden className="absolute -right-[3px] -top-[3px] h-[7px] w-[7px] rounded-full bg-accent sm:hidden" />}
    </button>
  );
}

/** Light / dark switch: shows where a tap takes you (a moon by day, a sun at night). */
function ThemeButton({ t, theme, onToggle }: { t: Strings; theme: Theme; onToggle: () => void }) {
  const dark = theme === 'dark';
  const label = dark ? t.lightMode : t.darkMode;
  return (
    <button
      type="button"
      onClick={onToggle}
      onMouseDown={(e) => e.preventDefault()}
      aria-label={label}
      title={label}
      className={ROUND_BUTTON}
    >
      <span key={theme} className="anim-pop grid place-items-center">
        {dark ? <Sun size={17} strokeWidth={2.4} className="text-gold" aria-hidden /> : <Moon size={16} strokeWidth={2.4} aria-hidden />}
      </span>
    </button>
  );
}

/** Sound on / off: shows the current state (a speaker with waves, or crossed out). */
function SoundButton({ t, on, onToggle }: { t: Strings; on: boolean; onToggle: () => void }) {
  const label = on ? t.muteSounds : t.unmuteSounds;
  return (
    <button
      type="button"
      onClick={onToggle}
      onMouseDown={(e) => e.preventDefault()}
      aria-label={label}
      title={label}
      className={ROUND_BUTTON}
    >
      <span key={on ? 'on' : 'off'} className="anim-pop grid place-items-center">
        {on ? <Volume2 size={17} strokeWidth={2.4} aria-hidden /> : <VolumeX size={17} strokeWidth={2.4} className="text-hanji-2/70" aria-hidden />}
      </span>
    </button>
  );
}

export function Navbar({ t, settings, online, onChange, onHome, onData, onAbout, sync, onSync, admin = false, theme, onToggleTheme, soundOn, onToggleSound, phoneVariant }: Props) {
  const prompt = promptOptions(t);
  const v = admin ? undefined : phoneVariant;
  const dark = theme === 'dark';
  // Below md, which controls sit in the row and which fold into a menu.
  const aboutOnPhones = v === 'a' || v === 'c';
  const dataInMenu = v === 'b' && onAbout;
  const settingsInMenu = v === 'c';

  return (
    <header className="shrink-0 border-b-2 border-rule bg-ink">
      <div
        className={`mx-auto flex h-14 w-full max-w-7xl items-center [--hb:2.25rem] sm:gap-3 md:h-16 md:px-5 ${
          v === 'a' ? 'gap-1 px-2 max-[399px]:[--hb:2rem] min-[400px]:gap-2 min-[400px]:px-3' : 'gap-1.5 px-3 min-[400px]:gap-2'
        }`}
      >
        <button type="button" onClick={onHome} className="mr-auto flex min-w-0 shrink-0 items-baseline gap-2 text-left" aria-label={`${t.appName} — ${t.books}`}>
          <span className={`whitespace-nowrap font-serif leading-none text-accent sm:text-[26px] md:text-[30px] ${v === 'a' ? 'text-[20px] min-[400px]:text-[24px]' : 'text-[24px]'}`}>어휘장</span>
          {t.appName !== '어휘장' && <span className="hidden text-[13px] font-bold text-hanji-2 lg:inline">{t.appName}</span>}
        </button>

        {settingsInMenu && (
          <div className="md:hidden">
            <IconMenu
              icon={<Settings2 size={17} strokeWidth={2.4} aria-hidden />}
              label={t.settings}
              align="left"
              items={[
                { icon: soundOn ? <VolumeX size={17} aria-hidden /> : <Volume2 size={17} aria-hidden />, label: soundOn ? t.muteSounds : t.unmuteSounds, onSelect: onToggleSound },
                { icon: dark ? <Sun size={17} className="text-gold" aria-hidden /> : <Moon size={17} aria-hidden />, label: dark ? t.lightMode : t.darkMode, onSelect: onToggleTheme },
              ]}
            />
          </div>
        )}

        <div className={settingsInMenu ? 'hidden md:contents' : 'contents'}>
          {!admin && <SoundButton t={t} on={soundOn} onToggle={onToggleSound} />}

          <ThemeButton t={t} theme={theme} onToggle={onToggleTheme} />
        </div>

        <SyncButton t={t} sync={sync} online={online} onClick={onSync} />

        {!admin && (
          <>
          {!online && !sync.syncId && (
            <span className="hidden items-center gap-1 text-[12px] font-semibold text-hanji-2 sm:flex" title={t.offline}>
              <WifiOff size={14} aria-hidden /> <span className="hidden lg:inline">{t.offline}</span>
            </span>
          )}

          <div className="md:hidden">
            <LangMenu t={t} settings={settings} onChange={onChange} />
          </div>

          <div className="hidden md:block">
            <UiLangMenu t={t} value={settings.uiLang} onChange={(uiLang) => onChange({ uiLang })} />
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <span className="hidden text-[11px] font-extrabold uppercase tracking-[0.12em] text-hanji-2 lg:inline">{t.promptLang}</span>
            <div role="radiogroup" aria-label={`${t.promptLang} → 한국어`} className="flex rounded-full border-2 border-rule bg-ink-2 p-0.5">
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
                    className={`h-[30px] min-w-10 rounded-full px-2 text-[11px] font-black tracking-[0.05em] transition-colors ${
                      on ? 'bg-accent text-white' : 'text-hanji-2 hover:bg-ink-3 hover:text-hanji'
                    }`}
                  >
                    {o.code}
                  </button>
                );
              })}
            </div>
            <span lang="ko" className="text-[12px] font-bold text-hanji">
              → 한국어
            </span>
          </div>

          {onAbout && (
            <button
              type="button"
              onClick={onAbout}
              aria-label={t.about}
              title={t.about}
              className={`${ROUND_BUTTON} ${aboutOnPhones ? '' : 'max-md:hidden'}`}
            >
              <Info size={17} strokeWidth={2.4} aria-hidden />
            </button>
          )}

          {dataInMenu && (
            <div className="md:hidden">
              <IconMenu
                icon={<Ellipsis size={18} strokeWidth={2.6} aria-hidden />}
                label={`${t.data} · ${t.about}`}
                items={[
                  { icon: <Database size={16} aria-hidden />, label: t.data, onSelect: onData },
                  { icon: <Info size={17} aria-hidden />, label: t.about, onSelect: onAbout },
                ]}
              />
            </div>
          )}

          <button
            type="button"
            onClick={onData}
            title={t.data}
            aria-label={t.data}
            className={`press flex size-(--hb) shrink-0 items-center justify-center gap-1.5 rounded-full border-2 border-rule bg-ink-2 text-[13px] font-extrabold text-hanji hover:border-hanji-2/40 xl:w-auto xl:px-3 ${dataInMenu ? 'max-md:hidden' : ''}`}
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
