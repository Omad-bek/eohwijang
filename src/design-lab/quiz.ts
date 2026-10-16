import { useRef, useState } from 'react';
import type { Stage, VocabEntry } from '../types';
import { checkAnswer, isCorrect, type DiffResult } from '../utils/hangulDiff';

/**
 * The real quiz rules (typed recall, exact spelling, a miss is retyped and comes back next round)
 * plus a combo counter. A sandbox: results are never recorded and no session is saved.
 */

interface Item {
  word: VocabEntry;
  n: number;
}

export type QuizPhase = { kind: 'ask' } | { kind: 'review'; result: DiffResult; skipped: boolean } | { kind: 'done' };

export type FeedbackKind = 'right' | 'relearned' | 'wrong' | 'skip' | 'retype-ok' | 'retype-wrong' | 'ime';

export interface Feedback {
  /** Restarts animations keyed on it. */
  id: number;
  kind: FeedbackKind;
  combo: number;
  /** The combo just reached 3, 5, 10, 15, 20 … */
  milestone: boolean;
  gained: number;
  /** The word that was answered, for "you got it" echoes. */
  word: VocabEntry;
}

const MILESTONES = new Set([3, 5, 10, 15, 20, 25, 30]);

function shuffle<T>(xs: T[]): T[] {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const HANGUL = /[ᄀ-ᇿ㄰-㆏가-힣]/;

export function useLabQuiz(stage: Stage) {
  const [queue, setQueue] = useState<Item[]>(() => shuffle(stage.words.map((word, n) => ({ word, n }))));
  const [nextRound, setNextRound] = useState<Item[]>([]);
  const [round, setRound] = useState(1);
  const [phase, setPhase] = useState<QuizPhase>({ kind: 'ask' });
  const [missed, setMissed] = useState<Set<number>>(() => new Set());
  const [combo, setCombo] = useState(0);
  const [best, setBest] = useState(0);
  const [xp, setXp] = useState(0);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const seq = useRef(0);

  const total = stage.words.length;
  const current = queue[0] ?? null;
  const pending = new Set([...queue, ...nextRound].map((q) => q.n));
  const cleared = total - pending.size;

  const say = (kind: FeedbackKind, word: VocabEntry, comboNow: number, gained = 0, milestone = false) =>
    setFeedback({ id: ++seq.current, kind, combo: comboNow, milestone, gained, word });

  const advance = (rest: Item[], later: Item[]) => {
    if (rest.length) {
      setQueue(rest);
      setNextRound(later);
    } else if (later.length) {
      setQueue(later);
      setNextRound([]);
      setRound((r) => r + 1);
    } else {
      setQueue([]);
      setNextRound([]);
      setPhase({ kind: 'done' });
    }
  };

  const miss = () => {
    if (!current || missed.has(current.n)) return;
    setMissed(new Set(missed).add(current.n));
  };

  /** Returns false when the input was rejected outright (empty, or not Korean). */
  const submit = (typed: string): boolean => {
    if (!current || phase.kind === 'done' || !typed.trim()) return false;
    if (!HANGUL.test(typed)) {
      say('ime', current.word, combo);
      return false;
    }

    if (phase.kind === 'ask') {
      const result = checkAnswer(typed, current.word.ko);
      if (result.correct) {
        if (missed.has(current.n)) {
          setXp((x) => x + 5);
          say('relearned', current.word, combo, 5);
        } else {
          const c = combo + 1;
          const gained = 10 + (c >= 3 ? Math.min(c, 10) : 0);
          setCombo(c);
          setBest((b) => Math.max(b, c));
          setXp((x) => x + gained);
          say('right', current.word, c, gained, MILESTONES.has(c));
        }
        advance(queue.slice(1), nextRound);
      } else {
        miss();
        setCombo(0);
        setPhase({ kind: 'review', result, skipped: false });
        say('wrong', current.word, 0);
      }
      return true;
    }

    // Review: retype the right answer to move on; the word then waits for the next round.
    if (isCorrect(typed, current.word.ko)) {
      setPhase({ kind: 'ask' });
      say('retype-ok', current.word, combo);
      advance(queue.slice(1), [...nextRound, current]);
    } else {
      say('retype-wrong', current.word, combo);
    }
    return true;
  };

  const skip = () => {
    if (!current || phase.kind !== 'ask') return;
    miss();
    setCombo(0);
    setPhase({ kind: 'review', result: checkAnswer('', current.word.ko), skipped: true });
    say('skip', current.word, 0);
  };

  return {
    stage,
    total,
    current: current?.word ?? null,
    cleared,
    round,
    phase,
    combo,
    best,
    xp,
    feedback,
    firstTry: total - missed.size,
    missedCount: missed.size,
    submit,
    skip,
  };
}

export type LabQuiz = ReturnType<typeof useLabQuiz>;
