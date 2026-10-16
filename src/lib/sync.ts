import type { Book, StageRecord, UserData, VocabEntry, WordMemory } from '../types';
import { sanitizeData } from './storage';

/**
 * Anonymous cloud sync. A device holds a random Sync ID and nothing else: no account,
 * email or password. The backend is a Supabase project reached only through the RPC
 * functions in supabase/schema.sql, so a vault can be read or written only by someone
 * who knows its ID. The URL and public key come from the build environment; without
 * them the feature stays hidden.
 */
function clean(...values: unknown[]): string {
  const v = values.find((x) => typeof x === 'string' && x.trim());
  return typeof v === 'string' ? v.trim() : '';
}

// Static property accesses on purpose: Vite substitutes them at build time.
const API_URL = clean(import.meta.env.VITE_SUPABASE_URL, import.meta.env.SUPABASE_URL).replace(/\/+$/, '');
const API_KEY = clean(import.meta.env.VITE_SUPABASE_ANON_KEY, import.meta.env.SUPABASE_ANON_KEY);

export const SYNC_AVAILABLE = !!API_URL && !!API_KEY;

const ID_KEY = 'project-vocab:sync-id';
/** The Sync ID this device's data last belonged to; kept after disconnecting. */
const LAST_KEY = 'project-vocab:sync-last';
/** Crockford base32: no I, L, O or U, so a code read aloud or retyped survives. */
const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const ID_LENGTH = 20; // 100 random bits

export function newSyncId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(ID_LENGTH));
  return Array.from(bytes, (b) => ALPHABET[b & 31]).join('');
}

/** Canonical form of a typed or pasted code, or null when it cannot be one. */
export function normalizeSyncId(input: string): string | null {
  const id = input
    .toUpperCase()
    .replace(/[^0-9A-Z]/g, '')
    .replace(/O/g, '0')
    .replace(/[IL]/g, '1');
  return id.length === ID_LENGTH && [...id].every((c) => ALPHABET.includes(c)) ? id : null;
}

/** "K7QM2HDX…" → "K7QM-2HDX-…" for reading and copying. */
export function formatSyncId(id: string): string {
  return id.match(/.{1,4}/g)?.join('-') ?? id;
}

export function loadSyncId(): string | null {
  try {
    return normalizeSyncId(localStorage.getItem(ID_KEY) ?? '');
  } catch {
    return null;
  }
}

export function loadLastSyncId(): string | null {
  try {
    return normalizeSyncId(localStorage.getItem(LAST_KEY) ?? '');
  } catch {
    return null;
  }
}

export function clearLastSyncId() {
  try {
    localStorage.removeItem(LAST_KEY);
  } catch {
    /* nothing to forget */
  }
}

export function saveSyncId(id: string | null) {
  try {
    if (id) {
      localStorage.setItem(ID_KEY, id);
      localStorage.setItem(LAST_KEY, id);
    } else localStorage.removeItem(ID_KEY);
  } catch {
    /* the code is shown on screen; losing it here only means relinking */
  }
}

// ---------------------------------------------------------------------------
// Merging

function newerMemory(a: WordMemory | undefined, b: WordMemory): boolean {
  return !a || b.level > a.level || (b.level === a.level && b.lastReviewedAt > a.lastReviewedAt);
}

function mergeStage(a: StageRecord | undefined, b: StageRecord): StageRecord {
  if (!a) return b;
  const last = Math.max(a.lastCompletedAt ?? 0, b.lastCompletedAt ?? 0);
  const best = Math.max(a.bestFirstTry ?? 0, b.bestFirstTry ?? 0);
  return {
    completions: Math.max(a.completions, b.completions),
    ...(last ? { lastCompletedAt: last } : {}),
    ...(a.bestFirstTry !== undefined || b.bestFirstTry !== undefined ? { bestFirstTry: best } : {}),
  };
}

function mergeWords(a: VocabEntry[], b: VocabEntry[]): VocabEntry[] {
  const seen = new Set(a.map((w) => `${w.unit}|${w.ko}`));
  const out = [...a];
  for (const w of b) {
    const k = `${w.unit}|${w.ko}`;
    if (!seen.has(k)) {
      seen.add(k);
      out.push(w);
    }
  }
  return out;
}

function mergeBook(a: Book, b: Book): Book {
  const units = [...a.units];
  for (const u of b.units) if (!units.includes(u)) units.push(u);
  const addedAt = Math.max(a.addedAt ?? 0, b.addedAt ?? 0);
  return { ...a, units, words: mergeWords(a.words, b.words), ...(addedAt ? { addedAt } : {}) };
}

/**
 * Combine two copies of the learner's data without losing progress: each word keeps the
 * higher memory level (the more recent review on a tie), stage records keep their best
 * numbers, and collections and added words are unioned. A deleted collection stays deleted
 * unless it was created again afterwards. Settings are per device, so `local`'s are kept.
 */
export function mergeData(local: UserData, remote: UserData): UserData {
  const memory = { ...local.memory };
  for (const [id, m] of Object.entries(remote.memory)) if (newerMemory(memory[id], m)) memory[id] = m;

  const stages = { ...local.stages };
  for (const [key, r] of Object.entries(remote.stages)) {
    if (!r || typeof r !== 'object') continue;
    const clean: StageRecord = {
      completions: Number(r.completions) || 0,
      ...(Number.isFinite(Number(r.lastCompletedAt)) ? { lastCompletedAt: Number(r.lastCompletedAt) } : {}),
      ...(Number.isFinite(Number(r.bestFirstTry)) ? { bestFirstTry: Number(r.bestFirstTry) } : {}),
    };
    stages[key] = mergeStage(stages[key], clean);
  }

  const deletedBooks = { ...local.deletedBooks };
  for (const [id, at] of Object.entries(remote.deletedBooks)) deletedBooks[id] = Math.max(deletedBooks[id] ?? 0, at);

  const books = new Map<string, Book>();
  for (const b of local.customBooks) books.set(b.id, b);
  for (const b of remote.customBooks) {
    const mine = books.get(b.id);
    books.set(b.id, mine ? mergeBook(mine, b) : b);
  }
  const customBooks = [...books.values()].filter((b) => deletedBooks[b.id] === undefined || (b.addedAt ?? 0) > deletedBooks[b.id]);

  const extraWords = { ...local.extraWords };
  for (const [id, words] of Object.entries(remote.extraWords)) extraWords[id] = mergeWords(extraWords[id] ?? [], words);

  // Each day keeps the higher count: merging the same history twice never inflates it.
  const activity = { ...local.activity };
  for (const [day, n] of Object.entries(remote.activity)) activity[day] = Math.max(activity[day] ?? 0, n);

  return { ...local, memory, stages, customBooks, extraWords, deletedBooks, activity };
}

/** The part of the data that travels; settings stay on each device. */
function payload(d: UserData) {
  return { memory: d.memory, stages: d.stages, customBooks: d.customBooks, extraWords: d.extraWords, deletedBooks: d.deletedBooks, activity: d.activity };
}

function stable(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stable).join(',')}]`;
  if (value && typeof value === 'object') {
    const keys = Object.keys(value).sort();
    return `{${keys.map((k) => `${JSON.stringify(k)}:${stable((value as Record<string, unknown>)[k])}`).join(',')}}`;
  }
  return JSON.stringify(value) ?? 'null';
}

/** Order-independent snapshot of the synced fields, for "anything new since the last sync?" checks. */
export function fingerprint(d: UserData): string {
  return stable(payload(d));
}

// ---------------------------------------------------------------------------
// Transport

export class SyncError extends Error {
  constructor(public code: 'network' | 'notFound' | 'server' | 'forbidden') {
    super(code);
  }
}

export async function rpc<T>(fn: string, body: Record<string, unknown>): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json', apikey: API_KEY };
  // Legacy anon keys are JWTs and also go in Authorization; new publishable keys must not.
  if (API_KEY.startsWith('eyJ')) headers.Authorization = `Bearer ${API_KEY}`;
  let res: Response;
  try {
    res = await fetch(`${API_URL}/rest/v1/rpc/${fn}`, { method: 'POST', headers, body: JSON.stringify(body), cache: 'no-store' });
  } catch {
    throw new SyncError('network');
  }
  if (!res.ok) throw new SyncError((await res.text().catch(() => '')).includes('forbidden') ? 'forbidden' : 'server');
  const text = await res.text();
  return (text ? JSON.parse(text) : null) as T;
}

interface Vault {
  data: UserData;
  rev: number;
}

async function pull(id: string): Promise<Vault | null> {
  const rows = await rpc<{ data: unknown; rev: number }[] | null>('pull_vault', { p_id: id });
  const row = Array.isArray(rows) ? rows[0] : null;
  return row ? { data: sanitizeData(row.data), rev: Number(row.rev) } : null;
}

/** Write when the cloud copy is still at `rev` (0 creates it). Returns the new revision, or null if another device wrote first. */
async function push(id: string, data: UserData, rev: number): Promise<number | null> {
  const next = await rpc<number | null>('push_vault', { p_id: id, p_data: payload(data), p_rev: rev });
  return typeof next === 'number' ? next : null;
}

/**
 * Pull the cloud copy, merge it into `local()`, and write the result back. Retries when
 * another device writes in between. With `mustExist`, a missing vault is an error rather
 * than a new one, so a mistyped code never creates an empty vault.
 */
export async function syncNow(id: string, local: () => UserData, mustExist = false): Promise<UserData> {
  for (let attempt = 0; attempt < 4; attempt++) {
    const remote = await pull(id);
    if (!remote && mustExist) throw new SyncError('notFound');
    const merged = remote ? mergeData(local(), remote.data) : local();
    if (remote && fingerprint(merged) === fingerprint(mergeData(remote.data, remote.data))) return merged;
    const rev = await push(id, merged, remote?.rev ?? 0);
    if (rev !== null) return merged;
  }
  throw new SyncError('server');
}

export async function deleteVault(id: string): Promise<void> {
  await rpc('delete_vault', { p_id: id });
}
