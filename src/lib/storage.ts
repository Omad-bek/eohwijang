import type { Book, Example, PromptLang, Settings, UiLang, UserData, VocabEntry, WordMemory } from '../types';
import { DEFAULT_STAGE, MAX_STAGE, MIN_STAGE, builtInBook } from './books';

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
    deletedBooks: {},
    activity: {},
  };
}

/** Day keys (`YYYY-MM-DD`) with a positive whole count; anything else is dropped. */
export function sanitizeActivity(raw: unknown): Record<string, number> {
  const out: Record<string, number> = {};
  if (!raw || typeof raw !== 'object') return out;
  for (const [day, v] of Object.entries(raw as Record<string, unknown>)) {
    const n = Math.floor(Number(v));
    if (/^\d{4}-\d{2}-\d{2}$/.test(day) && Number.isFinite(n) && n > 0) out[day] = n;
  }
  return out;
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

/** A usable example sentence (Korean plus at least one translation), or undefined. */
export function cleanExample(raw: unknown): Example | undefined {
  const x = raw as Partial<Example> | null;
  if (!x || typeof x !== 'object' || typeof x.ko !== 'string' || !x.ko.trim()) return undefined;
  const s = (v: unknown) => (typeof v === 'string' ? v.trim() : '');
  const ex = { ko: x.ko.trim().normalize('NFC'), uz: s(x.uz), ru: s(x.ru), en: s(x.en) };
  return ex.uz || ex.ru || ex.en ? ex : undefined;
}

function cleanEntry(e: VocabEntry): VocabEntry {
  const example = cleanExample(e.example);
  return {
    unit: e.unit.trim().normalize('NFC'),
    ko: e.ko.trim().normalize('NFC'),
    uz: String(e.uz ?? '').trim(),
    ru: String(e.ru ?? '').trim(),
    en: String(e.en ?? '').trim(),
    ...(example ? { example } : {}),
  };
}

function sanitizeBook(raw: unknown): Book | null {
  const b = raw as Book;
  if (!b || typeof b.id !== 'string' || !b.id.trim() || !Array.isArray(b.words)) return null;
  const words = b.words.filter(isEntry).map(cleanEntry);
  const units = Array.isArray(b.units) ? b.units.filter((u) => typeof u === 'string') : [];
  for (const w of words) if (!units.includes(w.unit)) units.push(w.unit);
  const addedAt = Number(b.addedAt);
  return {
    id: b.id.trim(),
    title: typeof b.title === 'string' && b.title.trim() ? b.title.trim() : b.id.trim(),
    units,
    words,
    builtIn: false,
    ...(Number.isFinite(addedAt) && addedAt > 0 ? { addedAt } : {}),
  };
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
  // Words the learner added to a shared collection (bundled, or published later as a global update).
  const extraWords: Record<string, VocabEntry[]> = {};
  const addExtra = (bookId: string, words: VocabEntry[]) => {
    const list = (extraWords[bookId] ??= []);
    const seen = new Set(list.map((w) => `${w.unit}|${w.ko}`));
    for (const w of words) if (!seen.has(`${w.unit}|${w.ko}`)) (seen.add(`${w.unit}|${w.ko}`), list.push(w));
  };
  if (d.extraWords && typeof d.extraWords === 'object') {
    for (const [k, v] of Object.entries(d.extraWords)) {
      if (Array.isArray(v) && k.trim()) addExtra(builtInBook(k)?.id ?? k.trim(), v.filter(isEntry).map(cleanEntry));
    }
  }
  // A personal collection may never share a built-in's name: fold its words into the learner's additions instead.
  const customBooks: Book[] = [];
  for (const b of Array.isArray(d.customBooks) ? d.customBooks : []) {
    const book = sanitizeBook(b);
    if (!book) continue;
    const target = builtInBook(book.id);
    if (target) addExtra(target.id, book.words);
    else if (!customBooks.some((x) => x.id === book.id)) customBooks.push(book);
  }
  const deletedBooks: Record<string, number> = {};
  if (d.deletedBooks && typeof d.deletedBooks === 'object') {
    for (const [k, v] of Object.entries(d.deletedBooks)) if (Number.isFinite(Number(v))) deletedBooks[k] = Number(v);
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
    customBooks,
    extraWords,
    deletedBooks,
    activity: sanitizeActivity(d.activity),
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

/** Unit used for plain word lists that never name a unit. */
export const DEFAULT_UNIT = '1';

const HANGUL = /[\u1100-\u11ff\u3130-\u318f\uac00-\ud7af]/;
/** "1과", "한글", "# Food", "Unit 2", "Урок 3", "Dars 4", "2단원" on a line of their own start a new unit. */
const UNIT_HEADING = /^(#+\s*\S.*|\d+\s*과|한글|\d+\s*단원|(unit|lesson|урок|dars)\s*\d+.*)$/i;
const HEADER_ROW = /^(unit|ko|korean|한국어|корейский|koreyscha)$/i;

function splitColumns(line: string): string[] {
  if (line.includes('\t')) return line.split('\t').map((c) => c.trim());
  // Dashes need spaces around them so hyphenated words ("e-mail", "по-русски") survive.
  return line.split(/\s+[-–—|]\s+/).map((c) => c.trim());
}

/**
 * Accepts:
 *  - JSON: an array of { unit, ko, uz, ru, en }, or { book?: "1B", words: [...] } (`id` or `title` also name the collection)
 *  - Plain lines: `ko - uz - ru - en` (spaced dash, en/em dash, "|" or tab between columns); missing
 *    translations may be left out. A heading line such as "1과" or "# Unit 2" starts a new unit.
 *  - Legacy tab lines with the unit first: unit, ko, uz, ru, en
 */
export function parseWords(text: string): ParsedWords {
  const trimmed = text.replace(/^\uFEFF/, '').trim();
  if (!trimmed) return { words: [], skipped: 0 };
  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    const json = JSON.parse(trimmed);
    const list: unknown[] = Array.isArray(json) ? json : Array.isArray(json?.words) ? json.words : [];
    const fallbackUnit = (x: unknown) => (x && typeof x === 'object' && !('unit' in x) ? { ...x, unit: DEFAULT_UNIT } : x);
    const words = list.map(fallbackUnit).filter(isEntry).map(cleanEntry);
    const name = Array.isArray(json) ? undefined : [json?.book, json?.id, json?.title].find((v) => typeof v === 'string' && v.trim());
    return { words, skipped: list.length - words.length, book: name?.trim() };
  }
  const words: VocabEntry[] = [];
  let skipped = 0;
  let unit = DEFAULT_UNIT;
  for (const raw of trimmed.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    const cols = splitColumns(line);
    if (cols.length === 1) {
      const heading = line.replace(/[:：]$/, '').trim();
      if (UNIT_HEADING.test(heading)) unit = heading.replace(/^#+\s*/, '');
      else skipped++;
      continue;
    }
    if (HEADER_ROW.test(cols[0])) continue;
    // Unit-first rows: five columns, or a unit-looking first column followed by a Hangul word.
    const unitFirst = cols.length >= 5 || (cols.length >= 3 && UNIT_HEADING.test(cols[0]) && !cols[0].startsWith('#') && HANGUL.test(cols[1]));
    const [u, ko = '', uz = '', ru = '', en = ''] = unitFirst ? cols : [unit, ...cols];
    const entry = { unit: u, ko, uz, ru, en };
    if (isEntry(entry) && (uz || ru || en)) words.push(cleanEntry(entry));
    else skipped++;
  }
  return { words, skipped };
}

/**
 * Turn CSV (comma or semicolon separated, "quoted" cells allowed) into the tab-separated lines
 * parseWords understands. Text from other file types is returned unchanged.
 */
export function wordFileText(name: string, text: string): string {
  const body = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
  if (!/\.csv$/i.test(name)) return body;
  return body
    .split(/\r?\n/)
    .map((line) => {
      const delim = line.includes(';') && !line.includes(',') ? ';' : ',';
      const cells: string[] = [];
      let cell = '';
      let quoted = false;
      for (let i = 0; i < line.length; i++) {
        const c = line[i];
        if (quoted) {
          if (c === '"' && line[i + 1] === '"') (cell += '"'), i++;
          else if (c === '"') quoted = false;
          else cell += c;
        } else if (c === '"') quoted = true;
        else if (c === delim) cells.push(cell.trim()), (cell = '');
        else cell += c;
      }
      cells.push(cell.trim());
      // A line with one cell is a unit heading such as "9과" and stays as it is.
      return cells.length > 1 ? cells.map((x) => x.replace(/\t/g, ' ')).join('\t') : cells[0];
    })
    .join('\n');
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
