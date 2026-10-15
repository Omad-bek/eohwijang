import { UNITS_1A, VOCAB_1A } from '../data/vocab1A';
import type { Book, Stage, UserData, VocabEntry } from '../types';

export const MIN_STAGE = 20;
export const MAX_STAGE = 30;
export const DEFAULT_STAGE = 25;

function deepFreeze<T>(value: T): T {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const v of Object.values(value)) deepFreeze(v);
  }
  return value;
}

/**
 * Textbook collections shipped with the app. Read-only (frozen): words a learner adds to
 * them live in `UserData.extraWords`, and their own collections in `UserData.customBooks`,
 * both on this device and in their own Sync ID's cloud copy, never in these lists.
 */
export const BUILT_IN_BOOKS: readonly Book[] = deepFreeze([
  { id: '1A', title: '1A', units: [...UNITS_1A], words: VOCAB_1A.map((w) => ({ ...w })), builtIn: true },
]);

/** The built-in collection a name refers to, ignoring case ("1a" → 1A). */
export function builtInBook(id: string): Book | undefined {
  const key = id.trim().toLowerCase();
  return BUILT_IN_BOOKS.find((b) => b.id.toLowerCase() === key);
}

export function wordId(bookId: string, w: VocabEntry): string {
  return `${bookId}|${w.unit}|${w.ko.normalize('NFC').trim()}`;
}

/**
 * Every book in textbook order (1A, 1B, 2A …): the shared read-only collections (bundled, with
 * global updates applied) followed by this learner's own words and collections. The learner's
 * part is only layered on for display; the shared lists themselves are never changed. A personal
 * collection that shares a name with a shared one shows as additions to it.
 */
export function allBooks(data: UserData, shared: readonly Book[] = BUILT_IN_BOOKS): Book[] {
  const key = (id: string) => id.trim().toLowerCase();
  const sharedIds = new Set(shared.map((b) => key(b.id)));
  const readOnly = shared.map((b) => {
    const extra = [...(data.extraWords[b.id] ?? []), ...data.customBooks.filter((c) => key(c.id) === key(b.id)).flatMap((c) => c.words)];
    if (!extra.length) return b;
    const seen = new Set(b.words.map((w) => `${w.unit}|${w.ko}`));
    const units = [...b.units];
    const words = [...b.words];
    for (const w of extra) {
      if (seen.has(`${w.unit}|${w.ko}`)) continue;
      seen.add(`${w.unit}|${w.ko}`);
      words.push(w);
      if (!units.includes(w.unit)) units.push(w.unit);
    }
    return { ...b, units, words };
  });
  const own = data.customBooks.filter((c) => !sharedIds.has(key(c.id)));
  return [...readOnly, ...own].sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true, sensitivity: 'base' }));
}

/**
 * Split each unit into balanced stages close to `size` words, never above
 * MAX_STAGE, so no unit ends on a 6-word scrap: 56 words at 25 → 28 + 28,
 * 133 → 27 + 27 + 27 + 26 + 26.
 */
export function stagesForUnit(book: Book, unit: string, size: number): Stage[] {
  const words = book.words.filter((w) => w.unit === unit);
  if (!words.length) return [];
  const n = words.length;
  const count = Math.max(1, Math.round(n / size), Math.ceil(n / MAX_STAGE));
  const base = Math.floor(n / count);
  const extra = n % count;
  const bounds: [number, number][] = [];
  let start = 0;
  for (let i = 0; i < count; i++) {
    const len = base + (i < extra ? 1 : 0);
    bounds.push([start, start + len]);
    start += len;
  }
  return bounds.map(([start, end], index) => ({
    key: `${book.id}|${unit}|${index}`,
    bookId: book.id,
    unit,
    index,
    from: start + 1,
    to: end,
    words: words.slice(start, end),
  }));
}
