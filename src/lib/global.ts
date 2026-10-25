import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Book, VocabEntry } from '../types';
import { BUILT_IN_BOOKS } from './books';
import { SYNC_AVAILABLE, SyncError, rpc, rpcResponse } from './sync';
import { cleanExample } from './storage';

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
  const example = cleanExample(r.example);
  const w = { book: s(r.book), unit: s(r.unit).normalize('NFC'), ko: s(r.ko).normalize('NFC'), uz: s(r.uz), ru: s(r.ru), en: s(r.en), deleted: r.deleted === true, ...(example ? { example } : {}) };
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

/** PostgREST caps every response at its max-rows setting (1000 on Supabase), so longer lists come in pages. */
export const PAGE_SIZE = 1000;

export interface GlobalFetch {
  /** Rows as the server sent them, before cleaning. */
  raw: unknown[];
  /** How many rows the server says it holds, when it says. */
  total: number | null;
}

/**
 * Every row, however many there are. Prefers get_global_words_all (supabase/global-words-json.sql),
 * which returns the whole list as one JSON value and so is never cut at max-rows. Until that SQL
 * is run, pages through get_global_words with limit / offset, asking for the exact count once.
 */
export async function fetchGlobalRows(): Promise<GlobalFetch> {
  try {
    const all = await rpc<{ total?: unknown; words?: unknown } | null>('get_global_words_all', {});
    if (all && Array.isArray(all.words)) return { raw: all.words, total: typeof all.total === 'number' ? all.total : null };
  } catch (e) {
    if (!(e instanceof SyncError && e.code === 'missing')) throw e;
  }
  const raw: unknown[] = [];
  let total: number | null = null;
  for (let offset = 0; ; offset += PAGE_SIZE) {
    const res = await rpcResponse('get_global_words', {}, {
      query: `limit=${PAGE_SIZE}&offset=${offset}`,
      headers: offset === 0 ? { Prefer: 'count=exact' } : {},
    });
    // "0-999/1001": the total after the slash ("*" when not counted).
    const count = Number(res.headers.get('Content-Range')?.split('/')[1]);
    if (offset === 0 && Number.isFinite(count)) total = count;
    const text = await res.text();
    const page = text ? JSON.parse(text) : [];
    if (!Array.isArray(page)) break;
    raw.push(...page);
    if (page.length < PAGE_SIZE) break;
  }
  return { raw, total };
}

export async function fetchGlobalWords(): Promise<GlobalWord[]> {
  const { raw, total } = await fetchGlobalRows();
  const rows = raw.map(clean).filter(Boolean) as GlobalWord[];
  // A short count means rows were cut off in transit (max-rows) or dropped as malformed.
  if (total !== null && rows.length !== total) console.warn(`[global words] server has ${total} rows, client kept ${rows.length}`);
  return rows;
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
      const entry: VocabEntry = { unit: r.unit, ko: r.ko, uz: r.uz, ru: r.ru, en: r.en, ...(r.example ? { example: r.example } : {}) };
      const at = index.get(`${r.unit}|${r.ko}`);
      if (at !== undefined) {
        // An edit without its own example keeps the bundled one.
        if (r.deleted) gone.add(at);
        else words[at] = { ...words[at], ...entry };
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
