import { useState } from 'react';
import { Check, Cloud, Copy, Link2, RefreshCw, ShieldCheck, Trash2 } from 'lucide-react';
import type { Strings } from '../lib/i18n';
import type { CloudSync } from '../lib/hooks';
import { SyncError, formatSyncId, normalizeSyncId } from '../lib/sync';
import { ConfirmButton } from './ConfirmButton';

const fieldCls = 'w-full border border-rule bg-ink-2 px-3 text-[16px] text-hanji placeholder:text-hanji-2/85 focus:border-hanji focus:outline-none';
const ghostBtn = 'flex h-11 items-center gap-2 border border-rule px-4 text-[14px] font-semibold hover:border-hanji-2 disabled:cursor-not-allowed disabled:text-hanji-2';

function errorText(t: Strings, e: unknown): string {
  return e instanceof SyncError && e.code === 'notFound' ? t.syncNotFound : t.syncFailed;
}

export function CloudSyncSection({ t, sync, uiLang }: { t: Strings; sync: CloudSync; uiLang: string }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const busy = sync.status === 'syncing';

  const attempt = (fn: () => Promise<void>) => {
    setError(null);
    fn().catch((e) => setError(errorText(t, e)));
  };

  const privacy = (
    <p className="mb-4 flex max-w-[60ch] gap-2.5 border-l-2 border-accent bg-ink-2/60 px-3 py-2.5 text-[13px] leading-relaxed text-hanji">
      <ShieldCheck size={18} className="mt-0.5 shrink-0 text-accent-text" aria-hidden />
      {t.privacyNote}
    </p>
  );

  if (!sync.available) {
    return (
      <>
        {privacy}
        <p className="text-[13px] text-hanji-2">{t.syncUnavailable}</p>
      </>
    );
  }

  if (!sync.syncId) {
    const id = normalizeSyncId(code);
    return (
      <>
        {privacy}
        <button
          type="button"
          disabled={busy}
          onClick={() => attempt(sync.connect)}
          className="flex h-11 items-center gap-2 bg-accent px-5 text-[14px] font-bold text-ink hover:bg-accent-text disabled:cursor-wait disabled:bg-ink-3 disabled:text-hanji-2"
        >
          <Cloud size={16} aria-hidden /> {busy ? t.syncing : t.connectCloud}
        </button>

        <div className="mt-6 max-w-md">
          <label htmlFor="syncid" className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.12em] text-hanji-2">
            {t.linkDevice}
          </label>
          <p className="mb-2 text-[13px] leading-relaxed text-hanji-2">{t.linkDeviceHint}</p>
          {sync.previousSyncId && (
            <p className="mb-2 border-l-2 border-danger/70 pl-3 text-[13px] leading-relaxed text-hanji">{t.linkReplaces(formatSyncId(sync.previousSyncId))}</p>
          )}
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!id) return setError(t.syncBadCode);
              attempt(() => sync.link(id));
            }}
          >
            <input
              id="syncid"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setError(null);
              }}
              placeholder="XXXX-XXXX-XXXX-XXXX-XXXX"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              className={`${fieldCls} h-11 font-mono tracking-[0.08em]`}
            />
            <button type="submit" disabled={busy || !code.trim()} className={`${ghostBtn} shrink-0`}>
              <Link2 size={16} aria-hidden /> {t.link}
            </button>
          </form>
        </div>
        {error && (
          <p role="alert" className="mt-2 text-[13px] text-danger-text">
            {error}
          </p>
        )}
      </>
    );
  }

  const shown = formatSyncId(sync.syncId);
  const time = sync.lastSyncedAt ? new Date(sync.lastSyncedAt).toLocaleTimeString(uiLang, { hour: '2-digit', minute: '2-digit' }) : null;

  return (
    <>
      {privacy}
      <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-hanji-2">{t.syncIdLabel}</p>
      <div className="flex flex-wrap items-center gap-2">
        <output className="select-all border border-rule bg-ink-2 px-3 py-2 font-mono text-[17px] font-bold tracking-[0.08em]">{shown}</output>
        <button
          type="button"
          onClick={() =>
            navigator.clipboard?.writeText(shown).then(
              () => {
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              },
              () => {},
            )
          }
          className={ghostBtn}
        >
          {copied ? <Check size={16} className="text-accent-text" aria-hidden /> : <Copy size={16} aria-hidden />}
          {copied ? t.copied : t.copy}
        </button>
      </div>
      <p className="mt-2 max-w-[60ch] text-[13px] leading-relaxed text-hanji-2">{t.syncIdKeep}</p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button type="button" disabled={busy} onClick={() => attempt(sync.syncNow)} className={ghostBtn}>
          <RefreshCw size={16} aria-hidden className={busy ? 'animate-spin' : ''} /> {busy ? t.syncing : t.syncNow}
        </button>
        <span aria-live="polite" className="text-[13px]">
          {sync.status === 'error' ? (
            <span className="text-danger-text">{error ?? t.syncFailed}</span>
          ) : (
            time && !busy && <span className="text-accent-text">{t.syncedAt(time)}</span>
          )}
        </span>
      </div>

      <div className="mt-6 border-t border-rule-soft pt-4">
        <p className="mb-3 max-w-[60ch] text-[13px] leading-relaxed text-hanji-2">{t.disconnectHint}</p>
        <div className="flex flex-wrap gap-2">
          <button type="button" disabled={busy} onClick={() => attempt(() => sync.disconnect())} className={ghostBtn}>
            {t.disconnect}
          </button>
          <ConfirmButton
            label={t.disconnectClear}
            confirmLabel={`${t.disconnectClear}?`}
            icon={<Trash2 size={16} aria-hidden />}
            onConfirm={() => attempt(() => sync.disconnect({ clearDevice: true }))}
          />
          <ConfirmButton
            label={t.eraseCloud}
            confirmLabel={`${t.eraseCloud}?`}
            icon={<Trash2 size={16} aria-hidden />}
            onConfirm={() => attempt(() => sync.disconnect({ erase: true }))}
          />
        </div>
      </div>
    </>
  );
}
