import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import type { Strings } from '../lib/i18n';
import type { CloudSync } from '../lib/hooks';
import { CloudSyncSection } from './CloudSyncSection';

export function CloudSyncDialog({ t, sync, uiLang, onClose }: { t: Strings; sync: CloudSync; uiLang: string; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      prev?.focus?.();
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" style={{ height: 'var(--app-h)' }}>
      <button type="button" aria-label={t.close} onClick={onClose} className="absolute inset-0 bg-black/70" />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="sync-title"
        className="anim-sheet relative flex max-h-[92%] w-full max-w-xl flex-col border-t border-rule bg-ink sm:max-h-[86%] sm:border"
      >
        <header className="flex items-start gap-3 border-b border-rule px-5 pb-4 pt-5">
          <div className="min-w-0 flex-1">
            <h2 id="sync-title" className="text-[22px] font-bold leading-tight">
              {t.cloudSync}
            </h2>
            <p className="mt-1 text-[13px] leading-relaxed text-hanji-2">{t.cloudSyncHint}</p>
          </div>
          <button ref={closeRef} type="button" onClick={onClose} aria-label={t.close} className="-mr-2 -mt-1 p-2 text-hanji-2 hover:text-hanji">
            <X size={20} />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-5">
          <CloudSyncSection t={t} sync={sync} uiLang={uiLang} />
        </div>
      </section>
    </div>
  );
}
