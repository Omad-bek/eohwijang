import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Book, VocabEntry } from '../types';
import { BUILT_IN_BOOKS } from './books';
import { SYNC_AVAILABLE, rpc } from './sync';

/**
 * Global vocabulary updates published by the author through admin mode: the same for every
 * learner, read-only, and kept apart from anyone's personal data (never part of UserData or a
 * Sync ID vault). A row overrides the bundled word with the same book + unit + ko, adds a word
 * (or a whole new book such as 1B), or hides a bundled word with `deleted`.
 */
export interface GlobalWord extends VocabEntry {
  book: string;
  deleted: boolean;
}

const CACHE_KEY = 'project-vocab:global-words';

function clean(raw: unknown): GlobalWord | null {
  const r = raw as Partial<GlobalWord> | null;
  if (!r || typeof r.book !== 'string' || typeof r.unit !== 'string' || typeof r.ko !== 'string') return null;
  const s = (v: unknown) => (typeof v === 'string' ? v.trim() : '');
  const w = { book: s(r.book), unit: s(r.unit).normalize('NFC'), ko: s(r.ko).normalize('NFC'), uz: s(r.uz), ru: s(r.ru), en: s(r.en), deleted: r.deleted === true };
  return w.book && w.unit && w.ko && !w.book.includes('|') && !w.unit.includes('|') ? w : null;
}

function readCache(): GlobalWord[] {
  try {
    const list = JSON.parse(localStorage.getItem(CACHE_KEY) ?? '[]');
    return Array.isArray(list) ? (list.map(clean).filter(Boolean) as GlobalWord[]) : [];
  } catch {
    return [];
  }
}

function writeCache(rows: GlobalWord[]) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(rows));
  } catch {
    /* falls back to the bundled lists offline */
  }
}

export async function fetchGlobalWords(): Promise<GlobalWord[]> {
  const rows = await rpc<unknown[] | null>('get_global_words', {});
  return Array.isArray(rows) ? (rows.map(clean).filter(Boolean) as GlobalWord[]) : [];
}

const byNumber = (a: string, b: string) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });

/** The shared read-only collections: bundled books with global updates applied, plus books that exist only globally. */
export function applyGlobal(rows: GlobalWord[], bundled: readonly Book[] = BUILT_IN_BOOKS): Book[] {
  if (!rows.length) return [...bundled];
  const books = new Map<string, Book>();
  for (const b of bundled) books.set(b.id.toLowerCase(), b);
  const byBook = new Map<string, GlobalWord[]>();
  for (const r of rows) {
    const k = r.book.toLowerCase();
    byBook.set(k, [...(byBook.get(k) ?? []), r]);
  }
  for (const [k, list] of byBook) {
    const base = books.get(k);
    const id = base?.id ?? list[0].book;
    const words = [...(base?.words ?? [])];
    const index = new Map(words.map((w, i) => [`${w.unit}|${w.ko}`, i]));
    const gone = new Set<number>();
    const added: VocabEntry[] = [];
    for (const r of list) {
      const entry: VocabEntry = { unit: r.unit, ko: r.ko, uz: r.uz, ru: r.ru, en: r.en };
      const at = index.get(`${r.unit}|${r.ko}`);
      if (at !== undefined) {
        if (r.deleted) gone.add(at);
        else words[at] = entry;
      } else if (!r.deleted) added.push(entry);
    }
    const kept = words.filter((_, i) => !gone.has(i));
    const units = [...(base?.units ?? [])];
    const newUnits = [...new Set(added.map((w) => w.unit))].filter((u) => !units.includes(u)).sort(byNumber);
    units.push(...newUnits);
    // Added words sit in their unit, after the bundled ones, so stage boundaries stay stable.
    const all = [...kept, ...added];
    const ordered = units.flatMap((u) => all.filter((w) => w.unit === u));
    const live = units.filter((u) => ordered.some((w) => w.unit === u));
    if (ordered.length || base) books.set(k, Object.freeze({ id, title: base?.title ?? id, units: live, words: ordered, builtIn: true }));
  }
  return [...books.values()];
}

/** Shared collections for this session: cached global updates at once, refreshed from the server when online. */
export function useSharedBooks(online: boolean) {
  const [rows, setRows] = useState<GlobalWord[]>(() => (SYNC_AVAILABLE ? readCache() : []));

  const refresh = useCallback(async () => {
    if (!SYNC_AVAILABLE) return;
    const next = await fetchGlobalWords();
    writeCache(next);
    setRows(next);
  }, []);

  useEffect(() => {
    if (online) refresh().catch(() => {});
  }, [online, refresh]);

  const books = useMemo(() => applyGlobal(rows), [rows]);
  return { books, rows, refresh };
}
