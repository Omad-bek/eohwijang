import type { Stage } from '../types';

/** An unfinished quiz, kept so the learner can pick it up again after leaving. One per device. */
export interface SavedSession {
  stageKey: string;
  /** The stage's words when saved; a stage whose words changed since can't be resumed. */
  signature: string;
  /** Word positions (`n`) still to come in this round, current word first. */
  queue: number[];
  /** Misses waiting for the next round. */
  nextRound: number[];
  round: number;
  /** Words missed at least once this run. */
  missed: number[];
  /** Set while the current word is in its retype step; holds what was typed ('' for "don't know"). */
  reviewTyped: string | null;
  lastActive: number;
}

const KEY = 'project-vocab:session';

/** A session left alone longer than this is dropped. */
export const SESSION_TTL_MS = 30 * 60_000;

export const stageSignature = (stage: Stage) => stage.words.map((w) => w.ko).join('\u0001');

function isIndexList(x: unknown, total: number): x is number[] {
  return Array.isArray(x) && x.every((n) => Number.isInteger(n) && n >= 0 && n < total);
}

export function clearSession() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* nothing to forget */
  }
}

export function saveSession(s: SavedSession) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* resuming is a convenience; the quiz goes on without it */
  }
}

/** The saved session, if it is still fresh; an expired or unreadable one is discarded. */
export function loadSession(now = Date.now()): SavedSession | null {
  let s: Partial<SavedSession>;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    s = JSON.parse(raw);
  } catch {
    return null;
  }
  const ok =
    s &&
    typeof s.stageKey === 'string' &&
    typeof s.signature === 'string' &&
    typeof s.lastActive === 'number' &&
    typeof s.round === 'number' &&
    Array.isArray(s.queue) &&
    s.queue.length > 0 &&
    (s.reviewTyped === null || typeof s.reviewTyped === 'string') &&
    now - s.lastActive < SESSION_TTL_MS;
  if (!ok) {
    clearSession();
    return null;
  }
  return s as SavedSession;
}

/** The saved session if it belongs to this stage, as the stage is now. */
export function sessionFor(s: SavedSession | null, stage: Stage): SavedSession | null {
  if (!s || s.stageKey !== stage.key || s.signature !== stageSignature(stage)) return null;
  const total = stage.words.length;
  return isIndexList(s.queue, total) && isIndexList(s.nextRound, total) && isIndexList(s.missed, total) ? s : null;
}

/** Words already cleared in a saved run. */
export const sessionCleared = (s: SavedSession, total: number) => total - new Set([...s.queue, ...s.nextRound]).size;
