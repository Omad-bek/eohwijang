import type { Book, VocabEntry } from '../types';
import { dayKey } from './activity';

/** First form of a slash alternative, composed (NFC) so it renders and splits into syllables cleanly ("다음날/다음 날" → "다음날"). */
export const firstForm = (ko: string) => ko.normalize('NFC').split('/')[0].trim();

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

export interface DailyWord {
  word: VocabEntry;
  /** Title of the collection the word comes from. */
  book: string;
}

/**
 * One word for the whole day, whichever book is open: drawn from every collection combined
 * and seeded only by the local date. The pool is sorted and de-duplicated by the Korean word,
 * so the pick does not depend on the order the books arrive in. Words of two or more syllables
 * with a translation are preferred, so the hero always has something to break down.
 */
export function wordOfDay(books: readonly Book[], now: number): DailyWord | null {
  const seen = new Map<string, DailyWord>();
  for (const b of books) {
    for (const w of b.words) {
      const ko = firstForm(w.ko);
      if (ko && !seen.has(ko)) seen.set(ko, { word: w, book: b.title });
    }
  }
  const all = [...seen.entries()].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)).map(([, d]) => d);
  const rich = all.filter(({ word }) => firstForm(word.ko).replace(/\s/g, '').length >= 2 && (word.uz || word.ru || word.en));
  const pool = rich.length ? rich : all;
  return pool.length ? pool[hash(dayKey(now)) % pool.length] : null;
}
