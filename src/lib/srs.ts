import type { MemoryLevel, VocabEntry, WordMemory } from '../types';
import { wordId } from './books';

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
