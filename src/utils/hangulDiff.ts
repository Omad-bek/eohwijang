const SYLLABLE_BASE = 0xac00;
const SYLLABLE_LAST = 0xd7a3;

export const CHOSEONG = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
export const JUNGSEONG = ['ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'];
export const JONGSEONG = ['', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];

export type JamoSlot = 'cho' | 'jung' | 'jong';

export interface Jamo {
  cho: string;
  jung: string;
  /** Empty string when the syllable has no 받침. */
  jong: string;
}

export interface JamoCheck {
  slot: JamoSlot;
  expected: string;
  typed: string;
  ok: boolean;
}

export type CellKind = 'exact' | 'partial' | 'wrong' | 'missing' | 'extra';

export interface DiffCell {
  kind: CellKind;
  /** Syllable the answer needed here (absent for `extra`). */
  expected?: string;
  /** Syllable the learner typed here (absent for `missing`). */
  typed?: string;
  /** Per-jamo verdict, present for `partial` cells. */
  jamo?: JamoCheck[];
}

export interface DiffResult {
  correct: boolean;
  /** The accepted form the input was compared against. */
  target: string;
  cells: DiffCell[];
}

export function normalize(s: string): string {
  return s.trim().normalize('NFC');
}

/** Collapse runs of whitespace and remove spaces around "/", so "다음날/ 다음 날" and "다음날 / 다음 날" compare equal. */
function canonical(s: string): string {
  return normalize(s).replace(/\s*\/\s*/g, '/').replace(/\s+/g, ' ');
}

export function isHangulSyllable(ch: string): boolean {
  const code = ch.codePointAt(0) ?? 0;
  return code >= SYLLABLE_BASE && code <= SYLLABLE_LAST;
}

export function decompose(ch: string): Jamo | null {
  if (!isHangulSyllable(ch)) return null;
  const offset = (ch.codePointAt(0) as number) - SYLLABLE_BASE;
  return {
    cho: CHOSEONG[Math.floor(offset / 588)],
    jung: JUNGSEONG[Math.floor((offset % 588) / 28)],
    jong: JONGSEONG[offset % 28],
  };
}

/**
 * Every form accepted for a target. "다음날/다음 날" accepts "다음날", "다음 날", and "다음날/다음 날".
 */
export function acceptedAnswers(target: string): string[] {
  const full = canonical(target);
  const parts = full.split('/').map((p) => p.trim()).filter(Boolean);
  return Array.from(new Set([...parts, full]));
}

export function isCorrect(input: string, target: string): boolean {
  const typed = canonical(input);
  if (!typed) return false;
  return acceptedAnswers(target).includes(typed);
}

function jamoChecks(expected: string, typed: string): JamoCheck[] | null {
  const e = decompose(expected);
  const t = decompose(typed);
  if (!e || !t) return null;
  return (['cho', 'jung', 'jong'] as const).map((slot) => ({
    slot,
    expected: e[slot],
    typed: t[slot],
    ok: e[slot] === t[slot],
  }));
}

/** Substitution cost: 0 for equal, a fraction for jamo-level near misses, 1.5 for unrelated. */
function subCost(expected: string, typed: string): number {
  if (expected === typed) return 0;
  const checks = jamoChecks(expected, typed);
  if (!checks) return 1.5;
  const wrong = checks.filter((c) => !c.ok).length;
  return wrong === 3 ? 1.5 : wrong / 3;
}

/**
 * Syllable-aligned diff (weighted edit distance), so a dropped syllable
 * in the middle doesn't push every later syllable out of place.
 */
export function diffSyllables(typedRaw: string, expectedRaw: string): DiffCell[] {
  const typed = Array.from(normalize(typedRaw));
  const expected = Array.from(normalize(expectedRaw));
  const n = expected.length;
  const m = typed.length;
  const cost: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0));
  for (let i = 1; i <= n; i++) cost[i][0] = i;
  for (let j = 1; j <= m; j++) cost[0][j] = j;
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      cost[i][j] = Math.min(
        cost[i - 1][j - 1] + subCost(expected[i - 1], typed[j - 1]),
        cost[i - 1][j] + 1,
        cost[i][j - 1] + 1,
      );
    }
  }

  const cells: DiffCell[] = [];
  let i = n;
  let j = m;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && cost[i][j] === cost[i - 1][j - 1] + subCost(expected[i - 1], typed[j - 1])) {
      const e = expected[i - 1];
      const t = typed[j - 1];
      if (e === t) {
        cells.push({ kind: 'exact', expected: e, typed: t });
      } else {
        const checks = jamoChecks(e, t);
        const anyOk = checks?.some((c) => c.ok) ?? false;
        cells.push(anyOk ? { kind: 'partial', expected: e, typed: t, jamo: checks! } : { kind: 'wrong', expected: e, typed: t });
      }
      i--;
      j--;
    } else if (i > 0 && cost[i][j] === cost[i - 1][j] + 1) {
      cells.push({ kind: 'missing', expected: expected[i - 1] });
      i--;
    } else {
      cells.push({ kind: 'extra', typed: typed[j - 1] });
      j--;
    }
  }
  return cells.reverse();
}

function distance(cells: DiffCell[]): number {
  return cells.reduce((sum, c) => {
    if (c.kind === 'exact') return sum;
    if (c.kind === 'partial') return sum + (c.jamo?.filter((x) => !x.ok).length ?? 3) / 3;
    return sum + 1;
  }, 0);
}

/**
 * Check an answer and, when wrong, diff it against the closest accepted form.
 */
export function checkAnswer(input: string, target: string): DiffResult {
  const accepted = acceptedAnswers(target);
  const typed = canonical(input);
  if (typed && accepted.includes(typed)) {
    return { correct: true, target: typed, cells: diffSyllables(typed, typed) };
  }
  let best: DiffResult | null = null;
  let bestScore = Infinity;
  for (const form of accepted) {
    const cells = diffSyllables(typed, form);
    const score = distance(cells);
    if (score < bestScore) {
      bestScore = score;
      best = { correct: false, target: form, cells };
    }
  }
  return best as DiffResult;
}
