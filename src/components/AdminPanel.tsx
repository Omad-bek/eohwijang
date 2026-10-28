import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Download, EyeOff, FileUp, Lock, LogOut, Pencil, RotateCcw, Save, Trash2, Upload } from 'lucide-react';
import type { Book, VocabEntry } from '../types';
import { BUILT_IN_BOOKS } from '../lib/books';
import type { GlobalWord } from '../lib/global';
import { DEFAULT_UNIT, downloadText, parseWords, wordFileText } from '../lib/storage';
import { SYNC_AVAILABLE, SyncError, rpc } from '../lib/sync';
import { ConfirmButton } from './ConfirmButton';

/**
 * Author-only editor for the global vocabulary, opened with #admin. The panel is merely hidden;
 * what protects the data is the server: every write sends the admin token to Supabase, which
 * checks it against a stored hash (supabase/schema.sql). The token stays in this tab's
 * sessionStorage and is never part of the app bundle. English only, since only the author sees it.
 */
interface Props {
  shared: Book[];
  rows: GlobalWord[];
  refresh: () => Promise<void>;
  onExit: () => void;
}

const TOKEN_KEY = 'project-vocab:admin-token';
const NEW = '__new__';
/** admin_put_words refuses more than this many words per call. */
const MAX_PUT = 2000;
const fieldCls = 'w-full border border-rule bg-ink-2 px-3 text-[15px] text-hanji placeholder:text-hanji-2/85 focus:border-hanji focus:outline-none';
const labelCls = 'mb-1.5 block text-[11px] font-bold uppercase tracking-[0.12em] text-hanji-2';
const btn = 'flex h-10 items-center gap-2 border border-rule px-3.5 text-[13px] font-semibold hover:border-hanji-2 disabled:cursor-not-allowed disabled:text-hanji-2';
const primary = 'flex h-10 items-center gap-2 bg-accent px-4 text-[13px] font-bold text-ink hover:bg-accent-text disabled:cursor-not-allowed disabled:bg-ink-3 disabled:text-hanji-2';

type Put = Partial<GlobalWord> & { book: string; unit: string; ko: string; revert?: boolean };

function readToken(): string {
  try {
    return sessionStorage.getItem(TOKEN_KEY) ?? '';
  } catch {
    return '';
  }
}

function keepToken(token: string | null) {
  try {
    if (token) sessionStorage.setItem(TOKEN_KEY, token);
    else sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    /* re-enter it next time */
  }
}

const same = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();
const EMPTY: VocabEntry = { unit: '', ko: '', uz: '', ru: '', en: '' };
const LIST_KEY = 'project-vocab:admin-word-list';

/** Old answers a fix file retires (`{ "book", "words", "remove": [{ "unit", "ko" }] }`), removed in the same publish. */
function removalsIn(text: string): { unit: string; ko: string }[] {
  const t = text.replace(/^﻿/, '').trim();
  if (!t.startsWith('{')) return [];
  try {
    const list: unknown = JSON.parse(t)?.remove;
    if (!Array.isArray(list)) return [];
    return list
      .filter((r): r is { unit: string; ko: string } => !!r && typeof r.unit === 'string' && typeof r.ko === 'string' && !!r.ko.trim())
      .map((r) => ({ unit: r.unit.trim(), ko: r.ko.trim().normalize('NFC') }));
  } catch {
    return [];
  }
}

export function AdminPanel({ shared, rows, refresh, onExit }: Props) {
  const [token, setToken] = useState(readToken);
  const [unlocked, setUnlocked] = useState(false);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ tone: 'ok' | 'err'; text: string } | null>(null);
  /** Which section the message belongs to, so it shows next to the button that caused it. */
  const [msgAt, setMsgAt] = useState<'edit' | 'remove'>('edit');

  const [bookSel, setBookSel] = useState(shared[0]?.id ?? NEW);
  const [newBook, setNewBook] = useState('');
  const [unitSel, setUnitSel] = useState('');
  const [newUnit, setNewUnit] = useState('');
  const [form, setForm] = useState<VocabEntry>(EMPTY);
  const [bulk, setBulk] = useState('');
  const [bulkFile, setBulkFile] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const [showList, setShowList] = useState(() => {
    try {
      return localStorage.getItem(LIST_KEY) !== 'hidden';
    } catch {
      return true;
    }
  });
  const toggleList = () => {
    const next = !showList;
    setShowList(next);
    try {
      localStorage.setItem(LIST_KEY, next ? 'shown' : 'hidden');
    } catch {
      /* just not remembered */
    }
  };

  /** Load a word file into the bulk box. A file naming its book (JSON) selects that book, so it can't land in another one. */
  const loadFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const text = wordFileText(file.name, String(reader.result ?? ''));
      setBulk(text);
      setBulkFile(file.name);
      setMsg(null);
      let name: string | undefined;
      try {
        name = parseWords(text).book;
      } catch {
        /* shown as 0 words below */
      }
      const known = name ? shared.find((b) => same(b.id, name)) : undefined;
      if (known) setBookSel(known.id);
      else if (name) {
        setBookSel(NEW);
        setNewBook(name.slice(0, 24));
      } else if (bookSel === NEW && !newBook.trim()) setNewBook(file.name.replace(/\.[^.]+$/, '').slice(0, 24));
    };
    reader.onerror = () => setMsg({ tone: 'err', text: `Could not read ${file.name}.` });
    reader.readAsText(file);
  };

  const fail = (e: unknown) =>
    setMsg({ tone: 'err', text: e instanceof SyncError && e.code === 'forbidden' ? 'The server rejected the admin token.' : 'Could not reach the server.' });

  const check = async (candidate: string) => {
    setBusy(true);
    setMsg(null);
    try {
      const ok = await rpc<boolean>('admin_check', { p_token: candidate });
      if (ok) {
        keepToken(candidate);
        setToken(candidate);
        setUnlocked(true);
      } else {
        keepToken(null);
        setMsg({ tone: 'err', text: 'Wrong admin token.' });
      }
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (token && SYNC_AVAILABLE) void check(token);
    // Only re-check the remembered token once, on open.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const book = bookSel === NEW ? newBook.replace(/\|/g, '').trim().slice(0, 24) : bookSel;
  const current = shared.find((b) => same(b.id, book));
  const units = current?.units ?? [];
  const unit = (unitSel === NEW || !units.includes(unitSel) ? newUnit : unitSel).replace(/\|/g, '').trim();

  useEffect(() => {
    if (unitSel !== NEW && !units.includes(unitSel)) setUnitSel(units[0] ?? NEW);
  }, [units, unitSel]);

  // A removed book leaves the list: fall back to the first one still there.
  useEffect(() => {
    if (bookSel !== NEW && !shared.some((b) => b.id === bookSel)) setBookSel(shared[0]?.id ?? NEW);
  }, [shared, bookSel]);

  const bundled = BUILT_IN_BOOKS.find((b) => same(b.id, book));
  const rowFor = (u: string, ko: string) => rows.find((r) => same(r.book, book) && r.unit === u && r.ko === ko);
  const list = useMemo(() => {
    const live = (current?.words ?? []).filter((w) => w.unit === unit);
    const hidden = rows.filter((r) => same(r.book, book) && r.unit === unit && r.deleted);
    return [...live.map((w) => ({ w, hidden: false })), ...hidden.map((w) => ({ w: w as VocabEntry, hidden: true }))];
  }, [current, rows, book, unit]);

  const put = async (words: Put[], done: string, at: 'edit' | 'remove' = 'edit') => {
    setBusy(true);
    setMsg(null);
    setMsgAt(at);
    try {
      let n = 0;
      for (let i = 0; i < words.length; i += MAX_PUT) n += await rpc<number>('admin_put_words', { p_token: token, p_words: words.slice(i, i + MAX_PUT) });
      await refresh();
      setMsg({ tone: 'ok', text: `${done} (${n}). Live for every learner on their next refresh.` });
      return true;
    } catch (e) {
      fail(e);
      return false;
    } finally {
      setBusy(false);
    }
  };

  const lock = () => {
    keepToken(null);
    setToken('');
    setUnlocked(false);
  };

  const header = (
    <header className="mx-auto flex w-full max-w-4xl shrink-0 items-center gap-2 px-4 pb-2 pt-4 md:px-8 md:pt-6">
      <h1 className="mr-auto text-[20px] font-bold">Admin · global vocabulary</h1>
      {unlocked && (
        <button type="button" onClick={lock} className={btn}>
          <Lock size={15} aria-hidden /> Lock
        </button>
      )}
      <button type="button" onClick={onExit} className={btn}>
        <LogOut size={15} aria-hidden /> Exit
      </button>
    </header>
  );

  const status = msg && (
    <p aria-live="polite" className={`mt-3 text-[13px] ${msg.tone === 'ok' ? 'text-accent-text' : 'text-danger-text'}`}>
      {msg.text}
    </p>
  );

  if (!SYNC_AVAILABLE) {
    return (
      <div className="flex h-full flex-col">
        {header}
        <p className="mx-auto w-full max-w-4xl px-4 text-[14px] text-hanji-2 md:px-8">Admin mode needs the Supabase backend (see README → Cloud Sync).</p>
      </div>
    );
  }

  if (!unlocked) {
    return (
      <div className="flex h-full flex-col">
        {header}
        <form
          className="mx-auto w-full max-w-4xl px-4 md:px-8"
          onSubmit={(e) => {
            e.preventDefault();
            if (input.trim()) void check(input.trim());
          }}
        >
          <label htmlFor="admintoken" className={labelCls}>
            Admin token
          </label>
          <div className="flex max-w-md gap-2">
            <input id="admintoken" type="password" value={input} onChange={(e) => setInput(e.target.value)} autoComplete="off" className={`${fieldCls} h-10`} />
            <button type="submit" disabled={busy || !input.trim()} className={primary}>
              Unlock
            </button>
          </div>
          <p className="mt-2 max-w-[60ch] text-[13px] text-hanji-2">Checked by the server against the hash in admin_secrets. Kept only in this tab until you lock or close it.</p>
          {status}
        </form>
      </div>
    );
  }

  const isBundled = (w: VocabEntry) => !!bundled?.words.some((b) => b.unit === w.unit && b.ko === w.ko);
  // Taking down a book or unit deletes its global rows: words that exist only globally go away for
  // everyone, and bundled words (1A) fall back to the version shipped with the app.
  const bookRows = rows.filter((r) => same(r.book, book));
  const unitRows = bookRows.filter((r) => r.unit === unit);
  const unitBundled = !!bundled?.words.some((w) => w.unit === unit);
  const takeDown = (list: GlobalWord[], done: string) => put(list.map((r) => ({ book: r.book, unit: r.unit, ko: r.ko, revert: true })), done, 'remove');
  const canSave = !!book && !!unit && !!form.ko.trim() && !!(form.uz.trim() || form.ru.trim() || form.en.trim());
  const parsed = (() => {
    if (!bulk.trim()) return null;
    try {
      return parseWords(bulk);
    } catch {
      return null;
    }
  })();
  const removals = removalsIn(bulk);
  // The phone's onscreen keyboard has only Hangul and space ("/" separates accepted answers), so anything else can't be answered there.
  const untypeable = (parsed?.words ?? []).filter((w) => /[^가-힣ㄱ-ㆎ\s/]/.test(w.ko)).map((w) => w.ko);
  // A file that names its book only goes into that book.
  const wrongBook = !!parsed?.book && !!book && !same(parsed.book, book);

  return (
    <div className="flex h-full flex-col">
      {header}
      <div className="mx-auto min-h-0 w-full max-w-4xl flex-1 overflow-y-auto overscroll-contain px-4 pb-10 md:px-8">
        <div className="grid gap-4 border-b border-rule py-4 sm:grid-cols-2">
          <div>
            <label htmlFor="abook" className={labelCls}>
              Book
            </label>
            <select id="abook" value={bookSel} onChange={(e) => setBookSel(e.target.value)} className={`${fieldCls} h-10`}>
              {shared.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title}
                </option>
              ))}
              <option value={NEW}>New book…</option>
            </select>
            {bookSel === NEW && <input value={newBook} onChange={(e) => setNewBook(e.target.value)} placeholder="1B" className={`${fieldCls} mt-2 h-10`} />}
          </div>
          <div>
            <label htmlFor="aunit" className={labelCls}>
              Unit
            </label>
            <select id="aunit" value={units.includes(unitSel) ? unitSel : NEW} onChange={(e) => setUnitSel(e.target.value)} className={`${fieldCls} h-10`}>
              {units.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
              <option value={NEW}>New unit…</option>
            </select>
            {(unitSel === NEW || !units.includes(unitSel)) && (
              <input value={newUnit} onChange={(e) => setNewUnit(e.target.value)} placeholder="9과" className={`${fieldCls} mt-2 h-10`} />
            )}
          </div>
        </div>

        <section className="border-b border-rule py-4">
          <h2 className="mb-3 text-[15px] font-bold">Add or edit a word{book && unit ? ` in ${book} · ${unit}` : ''}</h2>
          <div className="grid gap-2 sm:grid-cols-4">
            {(['ko', 'uz', 'ru', 'en'] as const).map((k) => (
              <input
                key={k}
                value={form[k]}
                onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                placeholder={k === 'ko' ? '한국어' : k.toUpperCase()}
                lang={k}
                className={`${fieldCls} h-10`}
              />
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy || !canSave}
              onClick={async () => {
                if (await put([{ book, unit, ko: form.ko.trim(), uz: form.uz, ru: form.ru, en: form.en }], 'Saved')) setForm(EMPTY);
              }}
              className={primary}
            >
              <Save size={15} aria-hidden /> Save for everyone
            </button>
            <button type="button" onClick={() => setForm(EMPTY)} className={btn}>
              Clear
            </button>
          </div>
          <p className="mt-2 text-[12px] text-hanji-2">Saving a Korean word that already exists in this unit updates its translations; learners keep their progress on it.</p>
          {msgAt === 'edit' && status}
        </section>

        <section className="border-b border-rule py-4">
          <h2 className="text-[15px] font-bold">
            <button type="button" onClick={toggleList} aria-expanded={showList} aria-controls="admin-word-list" className="flex items-center gap-2 text-left hover:text-hanji">
              <ChevronDown size={16} aria-hidden className={`shrink-0 text-hanji-2 transition-transform ${showList ? '' : '-rotate-90'}`} />
              {book || '—'} · {unit || '—'} <span className="font-normal text-hanji-2">({list.filter((x) => !x.hidden).length} words)</span>
              <span className="text-[12px] font-semibold text-hanji-2">{showList ? 'Hide list' : 'Show list'}</span>
            </button>
          </h2>
          <ul id="admin-word-list" hidden={!showList} className="mt-2 border-t border-rule-soft">
            {list.map(({ w, hidden }) => {
              const row = rowFor(w.unit, w.ko);
              const tag = hidden ? 'hidden' : row ? (isBundled(w) ? 'edited' : 'added') : 'bundled';
              return (
                <li key={`${w.unit}|${w.ko}|${hidden}`} className={`flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-rule-soft py-2 ${hidden ? 'opacity-60' : ''}`}>
                  <span lang="ko" className="min-w-24 font-serif text-[17px] font-bold">
                    {w.ko}
                  </span>
                  <span className="min-w-0 flex-1 text-[13px] text-hanji-2">{[w.uz, w.ru, w.en].filter(Boolean).join(' · ')}</span>
                  <span className={`text-[11px] font-bold uppercase tracking-[0.1em] ${tag === 'bundled' ? 'text-hanji-2' : tag === 'hidden' ? 'text-danger-text' : 'text-accent-text'}`}>{tag}</span>
                  <span className="flex gap-1">
                    {!hidden && (
                      <button type="button" title="Edit" aria-label={`Edit ${w.ko}`} onClick={() => setForm({ ...w })} className="p-1.5 text-hanji-2 hover:text-hanji">
                        <Pencil size={15} />
                      </button>
                    )}
                    {!hidden && isBundled(w) && (
                      <button
                        type="button"
                        title="Hide for everyone"
                        aria-label={`Hide ${w.ko}`}
                        disabled={busy}
                        onClick={() => void put([{ ...w, book, deleted: true }], 'Hidden')}
                        className="p-1.5 text-hanji-2 hover:text-danger-text"
                      >
                        <EyeOff size={15} />
                      </button>
                    )}
                    {row && (
                      <button
                        type="button"
                        title={isBundled(w) ? 'Revert to bundled' : 'Remove for everyone'}
                        aria-label={`Revert ${w.ko}`}
                        disabled={busy}
                        onClick={() => void put([{ book: row.book, unit: w.unit, ko: w.ko, revert: true }], isBundled(w) ? 'Reverted' : 'Removed')}
                        className="p-1.5 text-hanji-2 hover:text-hanji"
                      >
                        <RotateCcw size={15} />
                      </button>
                    )}
                  </span>
                </li>
              );
            })}
            {!list.length && <li className="py-3 text-[13px] text-hanji-2">No words yet.</li>}
          </ul>
        </section>

        <section className="border-b border-rule py-4">
          <h2 className="mb-1 text-[15px] font-bold">Bulk add</h2>
          <p className="mb-2 max-w-[70ch] text-[13px] text-hanji-2">
            Same formats as the learner import (`ko - uz - ru - en`, tab columns or JSON). Heading lines such as “9과” start a unit; lines before any heading go to the
            selected unit.
          </p>
          <div className="mb-2 flex flex-wrap items-center gap-3">
            <button type="button" onClick={() => fileInput.current?.click()} className={btn}>
              <FileUp size={15} aria-hidden /> Choose file (.txt, .json, .csv)
            </button>
            {bulkFile && <span className="text-[13px] text-hanji-2">Loaded {bulkFile}. Check the preview count, then publish.</span>}
            <input
              ref={fileInput}
              type="file"
              accept=".txt,.json,.csv,.tsv,text/plain,application/json,text/csv"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                e.target.value = '';
                if (f) loadFile(f);
              }}
            />
          </div>
          <textarea
            value={bulk}
            onChange={(e) => {
              setBulk(e.target.value);
              if (!e.target.value) setBulkFile(null);
            }}
            onDragOver={(e) => e.dataTransfer.types.includes('Files') && e.preventDefault()}
            onDrop={(e) => {
              const f = e.dataTransfer.files[0];
              if (!f) return;
              e.preventDefault();
              loadFile(f);
            }}
            rows={6}
            spellCheck={false}
            placeholder="Paste words, choose a file, or drop one here"
            className={`${fieldCls} resize-y py-2 font-mono text-[13px]`}
          />
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={busy || !book || wrongBook || !(parsed?.words.length || removals.length)}
              onClick={async () => {
                const words: Put[] = parsed!.words.map((w) => ({ ...w, book, unit: w.unit === DEFAULT_UNIT && unit ? unit : w.unit }));
                const gone: Put[] = removals.map((r) => ({ book, unit: r.unit, ko: r.ko, revert: true }));
                if (await put([...words, ...gone], gone.length ? `Published, ${gone.length} old answers removed` : 'Published')) {
                  setBulk('');
                  setBulkFile(null);
                }
              }}
              className={primary}
            >
              <Upload size={15} aria-hidden /> Publish {parsed?.words.length ?? 0} words
              {removals.length > 0 && ` and remove ${removals.length} old answers`} to {book || '…'}
            </button>
            {parsed && parsed.skipped > 0 && <span className="text-[13px] text-hanji-2">{parsed.skipped} lines skipped</span>}
          </div>
          {untypeable.length > 0 && (
            <p className="mt-2 max-w-[70ch] text-[13px] font-semibold text-amber">
              {untypeable.length} {untypeable.length === 1 ? 'answer has' : 'answers have'} symbols the phone keyboard can&apos;t type, so learners can&apos;t get{' '}
              {untypeable.length === 1 ? 'it' : 'them'} right on a phone: {untypeable.slice(0, 6).join(' · ')}
              {untypeable.length > 6 ? ' …' : ''}. Write optional parts as two answers instead, e.g. 노래를 부르다/부르다.
            </p>
          )}
          {wrongBook && (
            <p role="alert" className="mt-2 text-[13px] font-semibold text-danger-text">
              This file is for {parsed!.book}, but {book} is selected. Choose {parsed!.book} under Book to publish it.
            </p>
          )}
        </section>

        <section className="border-b border-rule py-4">
          <h2 className="mb-1 text-[15px] font-bold">Remove from the site</h2>
          <p className="mb-3 max-w-[70ch] text-[13px] text-hanji-2">
            Deletes every published word in the unit or book for every learner on their next refresh. Words bundled with the app (1A) cannot be deleted this way; they
            return to their shipped version. Learners keep their progress and their own added words. Download the JSON below first if you may want it back.
          </p>
          <div className="flex flex-wrap gap-2">
            {unitRows.length > 0 && (
              <ConfirmButton
                label={unitBundled ? `Revert ${unit} to bundled (${unitRows.length})` : `Remove ${unit} (${unitRows.length} words)`}
                confirmLabel={`${unitBundled ? 'Revert' : 'Remove'} ${unit} for everyone?`}
                icon={<Trash2 size={15} aria-hidden />}
                onConfirm={() => void takeDown(unitRows, unitBundled ? `Reverted ${unit}` : `Removed ${unit}`)}
              />
            )}
            {bookRows.length > 0 && (
              <ConfirmButton
                label={bundled ? `Revert ${book} to bundled (${bookRows.length})` : `Remove book ${book} (${bookRows.length} words)`}
                confirmLabel={`${bundled ? 'Revert' : 'Remove'} all of ${book} for everyone?`}
                icon={<Trash2 size={15} aria-hidden />}
                onConfirm={() => void takeDown(bookRows, bundled ? `Reverted ${book}` : `Removed ${book}`)}
              />
            )}
            {!bookRows.length && <p className="text-[13px] text-hanji-2">Nothing published in {book || 'this book'} yet.</p>}
          </div>
          {msgAt === 'remove' && status}
        </section>

        <section className="py-4">
          <h2 className="mb-1 text-[15px] font-bold">Export for the repository</h2>
          <p className="mb-2 max-w-[70ch] text-[13px] text-hanji-2">
            Downloads the book as it now looks to learners (bundled + global edits), as {'{ book, words }'} JSON, so it can be committed to src/data and shipped with the
            app.
          </p>
          <button
            type="button"
            disabled={!current}
            onClick={() => current && downloadText(`${current.id}-vocab.json`, JSON.stringify({ book: current.id, units: current.units, words: current.words }, null, 1))}
            className={btn}
          >
            <Download size={15} aria-hidden /> Download {current?.id ?? ''} JSON
          </button>
        </section>
      </div>
    </div>
  );
}
