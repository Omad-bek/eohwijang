import type { Book, PromptLang, Settings, UiLang, UserData, VocabEntry, WordMemory } from '../types';
import { DEFAULT_STAGE, MAX_STAGE, MIN_STAGE } from './books';

const KEY = 'project-vocab:v1';

export function defaultUiLang(): UiLang {
  const nav = (typeof navigator !== 'undefined' ? navigator.language : 'en').toLowerCase();
  if (nav.startsWith('uz')) return 'uz';
  if (nav.startsWith('ru')) return 'ru';
  if (nav.startsWith('ko')) return 'ko';
  return 'en';
}

export function emptyData(): UserData {
  const ui = defaultUiLang();
  const prompt: PromptLang = ui === 'ru' ? 'ru' : ui === 'en' ? 'en' : 'uz';
  return {
    version: 2,
    settings: { uiLang: ui, promptLang: prompt, stageSize: DEFAULT_STAGE },
    memory: {},
    stages: {},
    customBooks: [],
    extraWords: {},
  };
}

const UI_LANGS: UiLang[] = ['en', 'ru', 'uz', 'ko'];
const PROMPT_LANGS: PromptLang[] = ['uz', 'ru', 'en', 'all'];

function sanitizeSettings(raw: Partial<Settings> | undefined, fallback: Settings): Settings {
  const size = Number(raw?.stageSize);
  return {
    uiLang: UI_LANGS.includes(raw?.uiLang as UiLang) ? (raw!.uiLang as UiLang) : fallback.uiLang,
    promptLang: PROMPT_LANGS.includes(raw?.promptLang as PromptLang) ? (raw!.promptLang as PromptLang) : fallback.promptLang,
    stageSize: Number.isFinite(size) ? Math.min(MAX_STAGE, Math.max(MIN_STAGE, Math.round(size))) : fallback.stageSize,
  };
}

function isEntry(x: unknown): x is VocabEntry {
  const e = x as VocabEntry;
  return !!e && typeof e.unit === 'string' && typeof e.ko === 'string' && e.unit.trim() !== '' && e.ko.trim() !== '';
}

function cleanEntry(e: VocabEntry): VocabEntry {
  return {
    unit: e.unit.trim().normalize('NFC'),
    ko: e.ko.trim().normalize('NFC'),
    uz: String(e.uz ?? '').trim(),
    ru: String(e.ru ?? '').trim(),
    en: String(e.en ?? '').trim(),
  };
}

function sanitizeBook(raw: unknown): Book | null {
  const b = raw as Book;
  if (!b || typeof b.id !== 'string' || !b.id.trim() || !Array.isArray(b.words)) return null;
  const words = b.words.filter(isEntry).map(cleanEntry);
  const units = Array.isArray(b.units) ? b.units.filter((u) => typeof u === 'string') : [];
  for (const w of words) if (!units.includes(w.unit)) units.push(w.unit);
  return { id: b.id.trim(), title: typeof b.title === 'string' && b.title.trim() ? b.title.trim() : b.id.trim(), units, words, builtIn: false };
}

function sanitizeMemory(raw: unknown): Record<string, WordMemory> {
  const out: Record<string, WordMemory> = {};
  if (!raw || typeof raw !== 'object') return out;
  for (const [id, v] of Object.entries(raw as Record<string, Partial<WordMemory>>)) {
    const level = Number(v?.level);
    if (level !== 1 && level !== 2 && level !== 3) continue;
    const last = Number(v.lastReviewedAt);
    const next = Number(v.nextReviewAt);
    out[id] = { level, lastReviewedAt: Number.isFinite(last) ? last : 0, nextReviewAt: Number.isFinite(next) ? next : 0 };
  }
  return out;
}

/** Validate anything that claims to be UserData (from localStorage or an imported backup). */
export function sanitizeData(raw: unknown): UserData {
  const base = emptyData();
  const d = raw as Partial<UserData> | null;
  if (!d || typeof d !== 'object') return base;
  const extraWords: Record<string, VocabEntry[]> = {};
  if (d.extraWords && typeof d.extraWords === 'object') {
    for (const [k, v] of Object.entries(d.extraWords)) {
      if (Array.isArray(v)) extraWords[k] = v.filter(isEntry).map(cleanEntry);
    }
  }
  const memory = sanitizeMemory(d.memory);
  // v1 kept a flat list of mastered word ids: carry each over as level 1, due for review now.
  const legacy = (d as { mastered?: unknown }).mastered;
  if (Array.isArray(legacy)) {
    const now = Date.now();
    for (const id of legacy) if (typeof id === 'string' && !memory[id]) memory[id] = { level: 1, lastReviewedAt: now, nextReviewAt: now };
  }
  return {
    version: 2,
    settings: sanitizeSettings(d.settings, base.settings),
    memory,
    stages: d.stages && typeof d.stages === 'object' ? d.stages : {},
    customBooks: Array.isArray(d.customBooks) ? (d.customBooks.map(sanitizeBook).filter(Boolean) as Book[]) : [],
    extraWords,
  };
}

export function loadData(): UserData {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? sanitizeData(JSON.parse(raw)) : emptyData();
  } catch {
    return emptyData();
  }
}

/** Returns false when the browser refused the write (private mode, quota). */
export function saveData(data: UserData): boolean {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

export interface ParsedWords {
  words: VocabEntry[];
  skipped: number;
  /** Book name carried by a `{ "book": "1B", "words": [...] }` JSON file, if any. */
  book?: string;
}

/**
 * Accepts:
 *  - JSON: an array of { unit, ko, uz, ru, en }, or { book?: "1B", words: [...] } (`id` or `title` also name the book)
 *  - TSV/CSV-with-tabs: one word per line, columns unit, ko, uz, ru, en (a header row is skipped)
 */
export function parseWords(text: string): ParsedWords {
  const trimmed = text.trim();
  if (!trimmed) return { words: [], skipped: 0 };
  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    const json = JSON.parse(trimmed);
    const list: unknown[] = Array.isArray(json) ? json : Array.isArray(json?.words) ? json.words : [];
    const words = list.filter(isEntry).map(cleanEntry);
    const name = Array.isArray(json) ? undefined : [json?.book, json?.id, json?.title].find((v) => typeof v === 'string' && v.trim());
    return { words, skipped: list.length - words.length, book: name?.trim() };
  }
  const words: VocabEntry[] = [];
  let skipped = 0;
  for (const line of trimmed.split(/\r?\n/)) {
    if (!line.trim()) continue;
    const cols = line.split('\t');
    const [unit, ko, uz = '', ru = '', en = ''] = cols.map((c) => c.trim());
    if (/^unit$/i.test(unit ?? '') && /^ko/i.test(ko ?? '')) continue;
    const entry = { unit: unit ?? '', ko: ko ?? '', uz, ru, en };
    if (isEntry(entry)) words.push(cleanEntry(entry));
    else skipped++;
  }
  return { words, skipped };
}

export function exportJson(data: UserData): string {
  return JSON.stringify({ app: 'project-vocab', exportedAt: new Date().toISOString(), ...data }, null, 2);
}

export function downloadText(filename: string, text: string, type = 'application/json') {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
