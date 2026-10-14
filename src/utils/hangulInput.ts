import { CHOSEONG, JONGSEONG, JUNGSEONG, decompose, isHangulSyllable } from './hangulDiff';

/**
 * A 두벌식 (2-set) composition automaton for the onscreen keyboard. It is stateless: the state
 * is read back from the last character before the caret, the way a real Korean IME behaves
 * while a syllable is still open (ㄱ → 가 → 각 → 가가 …).
 */

/** Physical key (KeyboardEvent.code) → [jamo, shifted jamo]. Shift only changes the five tense consonants and ㅒ/ㅖ. */
export const DUBEOLSIK: Record<string, [string, string]> = {
  KeyQ: ['ㅂ', 'ㅃ'], KeyW: ['ㅈ', 'ㅉ'], KeyE: ['ㄷ', 'ㄸ'], KeyR: ['ㄱ', 'ㄲ'], KeyT: ['ㅅ', 'ㅆ'],
  KeyY: ['ㅛ', 'ㅛ'], KeyU: ['ㅕ', 'ㅕ'], KeyI: ['ㅑ', 'ㅑ'], KeyO: ['ㅐ', 'ㅒ'], KeyP: ['ㅔ', 'ㅖ'],
  KeyA: ['ㅁ', 'ㅁ'], KeyS: ['ㄴ', 'ㄴ'], KeyD: ['ㅇ', 'ㅇ'], KeyF: ['ㄹ', 'ㄹ'], KeyG: ['ㅎ', 'ㅎ'],
  KeyH: ['ㅗ', 'ㅗ'], KeyJ: ['ㅓ', 'ㅓ'], KeyK: ['ㅏ', 'ㅏ'], KeyL: ['ㅣ', 'ㅣ'],
  KeyZ: ['ㅋ', 'ㅋ'], KeyX: ['ㅌ', 'ㅌ'], KeyC: ['ㅊ', 'ㅊ'], KeyV: ['ㅍ', 'ㅍ'], KeyB: ['ㅠ', 'ㅠ'], KeyN: ['ㅜ', 'ㅜ'], KeyM: ['ㅡ', 'ㅡ'],
};

/** Keyboard rows in display order, as physical key codes. */
export const DUBEOLSIK_ROWS: string[][] = [
  ['KeyQ', 'KeyW', 'KeyE', 'KeyR', 'KeyT', 'KeyY', 'KeyU', 'KeyI', 'KeyO', 'KeyP'],
  ['KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyG', 'KeyH', 'KeyJ', 'KeyK', 'KeyL'],
  ['KeyZ', 'KeyX', 'KeyC', 'KeyV', 'KeyB', 'KeyN', 'KeyM'],
];

/** Two vowels typed in a row that fuse into one (ㅗ + ㅏ = ㅘ). */
const VOWEL_PAIRS: Record<string, string> = {
  'ㅗㅏ': 'ㅘ', 'ㅗㅐ': 'ㅙ', 'ㅗㅣ': 'ㅚ', 'ㅜㅓ': 'ㅝ', 'ㅜㅔ': 'ㅞ', 'ㅜㅣ': 'ㅟ', 'ㅡㅣ': 'ㅢ',
};
/** Two final consonants that fuse into a cluster 받침 (ㄹ + ㄱ = ㄺ). */
const JONG_PAIRS: Record<string, string> = {
  'ㄱㅅ': 'ㄳ', 'ㄴㅈ': 'ㄵ', 'ㄴㅎ': 'ㄶ', 'ㄹㄱ': 'ㄺ', 'ㄹㅁ': 'ㄻ', 'ㄹㅂ': 'ㄼ', 'ㄹㅅ': 'ㄽ', 'ㄹㅌ': 'ㄾ', 'ㄹㅍ': 'ㄿ', 'ㄹㅎ': 'ㅀ', 'ㅂㅅ': 'ㅄ',
};
const split = (pairs: Record<string, string>) => Object.fromEntries(Object.entries(pairs).map(([k, v]) => [v, [...k] as [string, string]]));
const VOWEL_PARTS = split(VOWEL_PAIRS);
const JONG_PARTS = split(JONG_PAIRS);

const isVowel = (j: string) => JUNGSEONG.includes(j);

function compose(cho: string, jung: string, jong = ''): string {
  return String.fromCharCode(0xac00 + (CHOSEONG.indexOf(cho) * 21 + JUNGSEONG.indexOf(jung)) * 28 + JONGSEONG.indexOf(jong));
}

/** Add one jamo to the end of `text`, merging it into the open syllable where Korean IMEs would. */
export function typeJamo(text: string, jamo: string): string {
  const head = text.slice(0, -1);
  const last = text.slice(-1);
  const syl = last && isHangulSyllable(last) ? decompose(last) : null;

  if (isVowel(jamo)) {
    if (syl && !syl.jong) {
      const fused = VOWEL_PAIRS[syl.jung + jamo];
      if (fused) return head + compose(syl.cho, fused);
    }
    if (syl?.jong) {
      // The 받침 moves over to start the new syllable: 각 + ㅏ → 가가, 갉 + ㅏ → 갈가.
      const parts = JONG_PARTS[syl.jong];
      const [stay, move] = parts ?? ['', syl.jong];
      if (CHOSEONG.includes(move)) return head + compose(syl.cho, syl.jung, stay) + compose(move, jamo);
    }
    if (CHOSEONG.includes(last)) return head + compose(last, jamo);
    if (VOWEL_PAIRS[last + jamo]) return head + VOWEL_PAIRS[last + jamo];
    return text + jamo;
  }

  // Consonant: becomes or extends the 받침 of an open syllable, otherwise starts a new one.
  if (syl && !syl.jong && JONGSEONG.includes(jamo)) return head + compose(syl.cho, syl.jung, jamo);
  if (syl?.jong) {
    const fused = JONG_PAIRS[syl.jong + jamo];
    if (fused) return head + compose(syl.cho, syl.jung, fused);
  }
  return text + jamo;
}

/** Remove the last jamo typed: 각 → 가 → ㄱ → "", 과 → 고, 갉 → 갈. */
export function backspaceJamo(text: string): string {
  if (!text) return text;
  const head = text.slice(0, -1);
  const last = text.slice(-1);
  const syl = isHangulSyllable(last) ? decompose(last) : null;
  if (syl) {
    if (syl.jong) return head + compose(syl.cho, syl.jung, JONG_PARTS[syl.jong]?.[0] ?? '');
    if (VOWEL_PARTS[syl.jung]) return head + compose(syl.cho, VOWEL_PARTS[syl.jung][0]);
    return head + syl.cho;
  }
  if (VOWEL_PARTS[last]) return head + VOWEL_PARTS[last][0];
  return head;
}
