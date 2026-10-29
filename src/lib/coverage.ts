/**
 * What the shared word lists actually cover, for public claims (Welcome page, prerendered HTML,
 * meta description): which SNU textbooks have words, how many, and how many carry an example
 * sentence. Every claim about books and sentences comes from here, never from hardcoded copy.
 */
import type { Book } from '../types';

/** SNU Korean textbook ids: 1A … 6B. Other shared decks (exam prep and the like) are not textbooks. */
const TEXTBOOK = /^[1-6][AB]$/i;

/** The share of words that must carry an example sentence before the page promises them. */
export const EXAMPLES_CLAIM_AT = 0.5;

export interface Coverage {
  /** Textbooks with at least one word, in course order. */
  books: { id: string; words: number; units: number }[];
  /** Words across those textbooks. */
  words: number;
  /** Share of those words with an example sentence, 0–1. */
  exampleShare: number;
}

export function coverageOf(books: readonly Book[]): Coverage {
  const list = books
    .filter((b) => b.builtIn && TEXTBOOK.test(b.id) && b.words.length > 0)
    .sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true, sensitivity: 'base' }));
  const words = list.reduce((n, b) => n + b.words.length, 0);
  const examples = list.reduce((n, b) => n + b.words.filter((w) => w.example).length, 0);
  return {
    books: list.map((b) => ({ id: b.id.toUpperCase(), words: b.words.length, units: b.units.length })),
    words,
    exampleShare: words ? examples / words : 0,
  };
}

/** "1A", "1A and 1B", "1A, 1B and 2A". */
export function bookList(c: Coverage): string {
  const ids = c.books.map((b) => b.id);
  return ids.length < 2 ? (ids[0] ?? '') : `${ids.slice(0, -1).join(', ')} and ${ids[ids.length - 1]}`;
}

/** Every SNU Korean textbook, in course order. */
export const TEXTBOOKS = ['1A', '1B', '2A', '2B', '3A', '3B', '4A', '4B', '5A', '5B', '6A', '6B'] as const;

/** "1A to 6A" when the books run unbroken from 1A, otherwise the plain list ("1A, 2A and 3B"). */
export function bookSpan(c: Coverage): string {
  const ids = c.books.map((b) => b.id);
  const run = ids.length > 1 && ids.every((id, i) => id === TEXTBOOKS[i]);
  return run ? `${ids[0]} to ${ids[ids.length - 1]}` : bookList(c);
}

/** Textbooks with no words yet, in course order. */
export function missingBooks(c: Coverage): string[] {
  const have = new Set(c.books.map((b) => b.id));
  return TEXTBOOKS.filter((id) => !have.has(id));
}

/** The hero lines that state coverage, true to whatever the data holds today. */
export function coverageCopy(c: Coverage) {
  const list = bookList(c);
  const span = bookSpan(c);
  const words = c.words.toLocaleString('en');
  const missing = missingBooks(c);
  // 6B has no vocabulary list to type up, so every other book in means the set is complete.
  const complete = missing.length === 1 && missing[0] === '6B';
  return {
    eyebrow: `SNU Korean ${span} · ${words} words`,
    badgeSub: complete ? `Every book from ${span} · ${words} words` : `${list} so far · more books on the way`,
    textbookBody: complete
      ? `Synced unit by unit with the SNU Korean textbooks, so you study exactly what’s on tomorrow’s test. Every book from ${span} is in: ${words} words. There is no 6B vocabulary list, so 6B isn’t included.`
      : `Synced unit by unit with the SNU Korean textbooks, so you study exactly what’s on tomorrow’s test. ${list} ${c.books.length === 1 ? 'is' : 'are'} in today (${words} words), and more books are added as they’re typed up.`,
    examples: c.exampleShare >= EXAMPLES_CLAIM_AT,
  };
}
