export type PromptLang = 'uz' | 'ru' | 'en' | 'all';
export type UiLang = 'en' | 'ru' | 'uz' | 'ko';
export type GlossLang = 'uz' | 'ru' | 'en';

/** One vocabulary entry. `ko` may hold alternatives separated by "/" (e.g. "아래/ 밑"). */
export interface VocabEntry {
  unit: string;
  ko: string;
  uz: string;
  ru: string;
  en: string;
}

export interface Book {
  id: string;
  title: string;
  /** Unit order as it appears in the textbook. */
  units: string[];
  words: VocabEntry[];
  builtIn: boolean;
}

export interface Stage {
  /** `${bookId}|${unit}|${index}` */
  key: string;
  bookId: string;
  unit: string;
  index: number;
  /** 1-based position of the first and last word within the unit. */
  from: number;
  to: number;
  words: VocabEntry[];
}

export interface Settings {
  uiLang: UiLang;
  promptLang: PromptLang;
  stageSize: number;
}

export interface StageRecord {
  completions: number;
  lastCompletedAt?: number;
  /** Share of words recalled right on the first try in the best run, 0–1. */
  bestFirstTry?: number;
}

export interface UserData {
  version: 1;
  settings: Settings;
  /** Word ids (`${bookId}|${unit}|${ko}`) recalled correctly from memory at least once. */
  mastered: string[];
  stages: Record<string, StageRecord>;
  /** Books the learner added (1B, 2A …). */
  customBooks: Book[];
  /** Words appended to built-in books, keyed by book id. */
  extraWords: Record<string, VocabEntry[]>;
}
