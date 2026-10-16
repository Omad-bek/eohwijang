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
  /** When the learner created it; a cloud-sync deletion only wins over copies made before it. */
  addedAt?: number;
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
  /** A cross-unit set of words due for their next level, not a textbook stage: no stage record is kept for it. */
  review?: boolean;
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

/** 0 = new, 1 = short-term, 2 = consolidated, 3 = long-term (max). */
export type MemoryLevel = 0 | 1 | 2 | 3;

/** Spaced-repetition state of one word. Words without a record are level 0. */
export interface WordMemory {
  level: 1 | 2 | 3;
  lastReviewedAt: number;
  /** When a first-try recall earns the next level. Not used at level 3. */
  nextReviewAt: number;
}

export interface UserData {
  version: 2;
  settings: Settings;
  /** Keyed by word id (`${bookId}|${unit}|${ko}`). */
  memory: Record<string, WordMemory>;
  stages: Record<string, StageRecord>;
  /** Books the learner added (1B, 2A …). */
  customBooks: Book[];
  /** Words appended to built-in books, keyed by book id. */
  extraWords: Record<string, VocabEntry[]>;
  /** Deleted collection ids and when, so cloud sync does not bring them back from another device. */
  deletedBooks: Record<string, number>;
  /** Words recalled per local day (`YYYY-MM-DD`): feeds the daily goal, the streak and XP. */
  activity: Record<string, number>;
}
