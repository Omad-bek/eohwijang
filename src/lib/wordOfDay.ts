import type { Book, VocabEntry } from '../types';
import { dayKey } from './activity';

/** First form of a slash alternative, so displays stay short ("아래/ 밑" → "아래"). */
export const firstForm = (ko: string) => ko.split('/')[0].trim();

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

/**
 * The same word all day on every device for a given book: picked from words of two or more
 * syllables that carry at least one translation, so the hero always has something to break down.
 */
export function wordOfDay(book: Book, now: number): VocabEntry | null {
  const rich = book.words.filter((w) => firstForm(w.ko).replace(/\s/g, '').length >= 2 && (w.uz || w.ru || w.en));
  const pool = rich.length ? rich : book.words;
  return pool.length ? pool[hash(`${book.id}:${dayKey(now)}`) % pool.length] : null;
}
