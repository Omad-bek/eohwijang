import type { Book, MemoryLevel, Stage, VocabEntry, WordMemory } from '../types';
import { MAX_STAGE, wordId } from './books';

const HOUR = 60 * 60 * 1000;

/** Wait after reaching a level before a first-try recall can earn the next one. */
export const COOLDOWN: Record<1 | 2, number> = { 1: 4 * HOUR, 2: 72 * HOUR };

/**
 * How a word went in one session:
 *  - firstTry:  recalled correctly on its first appearance (round 1)
 *  - missed:    wrong or skipped (it will come back in a later round)
 *  - relearned: finally recalled after one or more misses
 */
export type Outcome = 'firstTry' | 'missed' | 'relearned';

export function levelOf(m: WordMemory | undefined): MemoryLevel {
  return m?.level ?? 0;
}

/** Ready to level up: cooldown over and not already at the max level. */
export function isDue(m: WordMemory | undefined, now: number): boolean {
  return !!m && m.level < 3 && m.nextReviewAt <= now;
}

function at(level: 1 | 2 | 3, now: number): WordMemory {
  return { level, lastReviewedAt: now, nextReviewAt: level === 3 ? now : now + COOLDOWN[level] };
}

/**
 * Next memory state. A miss drops a learned word to level 1 (a new word stays new until
 * finished); finishing after a miss lands on level 1; a first-try recall advances one level
 * only once the cooldown is over, otherwise the level and its timer stay as they were.
 */
export function applyOutcome(prev: WordMemory | undefined, outcome: Outcome, now: number): WordMemory | undefined {
  if (outcome === 'missed') return prev ? at(1, now) : undefined;
  if (outcome === 'relearned' || !prev) return at(1, now);
  if (isDue(prev, now)) return at((prev.level + 1) as 2 | 3, now);
  return { ...prev, lastReviewedAt: now };
}

export interface MemoryStats {
  /** Words at each level, index 0–3. */
  levels: [number, number, number, number];
  /** Words at level 1 or above. */
  learned: number;
  due: number;
}

export function memoryStats(words: VocabEntry[], bookId: string, memory: Record<string, WordMemory>, now: number): MemoryStats {
  const levels: MemoryStats['levels'] = [0, 0, 0, 0];
  let due = 0;
  for (const w of words) {
    const m = memory[wordId(bookId, w)];
    levels[levelOf(m)]++;
    if (isDue(m, now)) due++;
  }
  return { levels, learned: words.length - levels[0], due };
}

export function addStats(a: MemoryStats, b: MemoryStats): MemoryStats {
  return {
    levels: [a.levels[0] + b.levels[0], a.levels[1] + b.levels[1], a.levels[2] + b.levels[2], a.levels[3] + b.levels[3]],
    learned: a.learned + b.learned,
    due: a.due + b.due,
  };
}

export const EMPTY_STATS: MemoryStats = { levels: [0, 0, 0, 0], learned: 0, due: 0 };

/**
 * The one status a stage (or a unit) shows. Words ready to level up outrank "complete": a
 * finished stage with ready words asks for a review instead of showing both at once.
 */
export type StageStatus = 'new' | 'learning' | 'levelUp' | 'complete';

export function stageStatus(stats: MemoryStats, total: number): StageStatus {
  if (stats.due > 0) return 'levelUp';
  if (total > 0 && stats.learned >= total) return 'complete';
  return stats.learned > 0 ? 'learning' : 'new';
}

/** The book's words that are ready for their next level, in textbook order, as one playable set (at most one stage long). */
export function reviewStage(book: Book, memory: Record<string, WordMemory>, now: number): Stage | null {
  const words = book.words.filter((w) => isDue(memory[wordId(book.id, w)], now)).slice(0, MAX_STAGE);
  if (!words.length) return null;
  return { key: `${book.id}|~review|0`, bookId: book.id, unit: '', index: 0, from: 1, to: words.length, words, review: true };
}
