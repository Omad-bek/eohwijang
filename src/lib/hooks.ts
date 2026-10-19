import { useCallback, useEffect, useRef, useState } from 'react';
import type { UserData } from '../types';
import { emptyData, loadData, saveData } from './storage';
import { clearSession } from './session';
import { SYNC_AVAILABLE, clearLastSyncId, deleteVault, fingerprint, loadLastSyncId, loadSyncId, mergeData, newSyncId, saveSyncId, syncNow as runSync } from './sync';

/**
 * Pin the app to the *visual* viewport so the on-screen keyboard shrinks the
 * layout instead of scrolling the page (no jump when the Korean IME opens).
 */
export function useVisualViewportHeight() {
  useEffect(() => {
    const vv = window.visualViewport;
    const apply = () => {
      const h = vv ? vv.height : window.innerHeight;
      document.documentElement.style.setProperty('--app-h', `${Math.round(h)}px`);
      if (window.scrollY !== 0) window.scrollTo({ top: 0, behavior: 'instant' });
    };
    apply();
    vv?.addEventListener('resize', apply);
    vv?.addEventListener('scroll', apply);
    window.addEventListener('resize', apply);
    return () => {
      vv?.removeEventListener('resize', apply);
      vv?.removeEventListener('scroll', apply);
      window.removeEventListener('resize', apply);
    };
  }, []);
}

/**
 * Marks an element revealed the first time it scrolls into view (the `.reveal` class does the
 * fade-and-rise). Uses the viewport as root, so it also works inside nested scrollers like <main>.
 */
export function useReveal<T extends Element>() {
  const ref = useRef<T>(null);
  const [revealed, setRevealed] = useState(() => typeof IntersectionObserver === 'undefined');
  useEffect(() => {
    const el = ref.current;
    if (!el || revealed) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          io.disconnect();
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [revealed]);
  return { ref, revealed };
}

export function useUserData() {
  const [data, setData] = useState<UserData>(loadData);
  const [saveFailed, setSaveFailed] = useState(false);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setSaveFailed(!saveData(data));
  }, [data]);

  const update = useCallback((fn: (d: UserData) => UserData) => setData((d) => fn(d)), []);
  return { data, update, replace: setData, saveFailed };
}

export function useOnline() {
  const [online, setOnline] = useState(() => navigator.onLine);
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);
  return online;
}

/** Current time, refreshed every minute so review timers come due while the app stays open. */
export function useNow(intervalMs = 60_000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    const onShow = () => document.visibilityState === 'visible' && setNow(Date.now());
    document.addEventListener('visibilitychange', onShow);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onShow);
    };
  }, [intervalMs]);
  return now;
}

const TOUCH_ONLY = '(hover: none) and (pointer: coarse)';
/** Dev only: `?touch` in the URL acts as a touch-only device (the Design Lab's phone frame). */
const FORCE_TOUCH = import.meta.env.DEV && new URLSearchParams(window.location.search).has('touch');

/** True on phones and tablets without a mouse, where the onscreen keyboard is the default. */
export function useTouchOnly(): boolean {
  const [touch, setTouch] = useState(() => FORCE_TOUCH || (typeof matchMedia === 'function' && matchMedia(TOUCH_ONLY).matches));
  useEffect(() => {
    if (FORCE_TOUCH || typeof matchMedia !== 'function') return;
    const mq = matchMedia(TOUCH_ONLY);
    const on = () => setTouch(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return touch;
}

export type SyncStatus = 'idle' | 'syncing' | 'ok' | 'error';

export interface CloudSync {
  available: boolean;
  syncId: string | null;
  status: SyncStatus;
  lastSyncedAt: number | null;
  /**
   * While disconnected: the Sync ID this device's data came from. Linking a different code
   * replaces that data instead of merging it, so two people's words never mix on a shared device.
   */
  previousSyncId: string | null;
  /** Make a new vault from this device's data. */
  connect: () => Promise<void>;
  /** Join an existing vault; rejects with SyncError('notFound') for an unknown code. */
  link: (id: string) => Promise<void>;
  syncNow: () => Promise<void>;
  /** Forget the code on this device; `erase` deletes the cloud copy, `clearDevice` wipes local progress and collections. */
  disconnect: (opts?: { erase?: boolean; clearDevice?: boolean }) => Promise<void>;
}

const AUTO_SYNC_DELAY = 4000;

/**
 * Keeps local data and the anonymous cloud vault in step: syncs on start, a few seconds
 * after each change, and whenever the app comes back to the foreground.
 */
export function useCloudSync(data: UserData, update: (fn: (d: UserData) => UserData) => void, online: boolean): CloudSync {
  const [syncId, setSyncId] = useState<string | null>(() => (SYNC_AVAILABLE ? loadSyncId() : null));
  const [status, setStatus] = useState<SyncStatus>('idle');
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null);
  const [previousSyncId, setPreviousSyncId] = useState<string | null>(() => (SYNC_AVAILABLE ? loadLastSyncId() : null));
  /** Fingerprint of what the cloud holds after the last successful sync. */
  const [synced, setSynced] = useState<string | null>(null);
  const dataRef = useRef(data);
  dataRef.current = data;
  const busy = useRef(false);

  const run = useCallback(
    async (id: string, mustExist = false, replaceLocal = false) => {
      if (busy.current) return;
      busy.current = true;
      setStatus('syncing');
      try {
        // Replacing: this device contributes nothing but its settings.
        const local = replaceLocal ? () => ({ ...emptyData(), settings: dataRef.current.settings }) : () => dataRef.current;
        const merged = await runSync(id, local, mustExist);
        // The device now holds someone else's progress; an unfinished run from before doesn't belong to it.
        if (replaceLocal) clearSession();
        update((d) => {
          if (replaceLocal) return { ...merged, settings: d.settings };
          // Anything typed while the request was in flight is merged in, not overwritten.
          const next = mergeData(d, merged);
          return fingerprint(next) === fingerprint(d) ? d : next;
        });
        setSynced(fingerprint(merged));
        setLastSyncedAt(Date.now());
        setStatus('ok');
      } catch (e) {
        setStatus('error');
        throw e;
      } finally {
        busy.current = false;
      }
    },
    [update],
  );

  const quiet = useCallback((id: string) => run(id).catch(() => {}), [run]);

  useEffect(() => {
    if (!syncId || !online || fingerprint(data) === synced) return;
    const h = setTimeout(() => void quiet(syncId), synced === null ? 0 : AUTO_SYNC_DELAY);
    return () => clearTimeout(h);
  }, [data, synced, syncId, online, quiet]);

  useEffect(() => {
    if (!syncId) return;
    const onShow = () => document.visibilityState === 'visible' && navigator.onLine && void quiet(syncId);
    document.addEventListener('visibilitychange', onShow);
    return () => document.removeEventListener('visibilitychange', onShow);
  }, [syncId, quiet]);

  const adopt = async (id: string, mustExist: boolean) => {
    await run(id, mustExist, mustExist && !!previousSyncId && previousSyncId !== id);
    saveSyncId(id);
    setSyncId(id);
    setPreviousSyncId(id);
  };

  return {
    available: SYNC_AVAILABLE,
    syncId,
    status,
    lastSyncedAt,
    previousSyncId: syncId ? null : previousSyncId,
    connect: () => adopt(newSyncId(), false),
    link: (id) => adopt(id, true),
    syncNow: () => (syncId ? run(syncId) : Promise.resolve()),
    disconnect: async ({ erase = false, clearDevice = false } = {}) => {
      if (erase && syncId) await deleteVault(syncId);
      if (clearDevice) {
        update((d) => ({ ...emptyData(), settings: d.settings }));
        clearSession();
        clearLastSyncId();
        setPreviousSyncId(null);
      } else setPreviousSyncId(syncId);
      saveSyncId(null);
      setSyncId(null);
      setSynced(null);
      setLastSyncedAt(null);
      setStatus('idle');
    },
  };
}
