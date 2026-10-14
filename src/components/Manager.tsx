import { useMemo, useRef, useState } from 'react';
import { ArrowLeft, Download, FileUp, Trash2, Upload } from 'lucide-react';
import type { Book, UserData, VocabEntry } from '../types';
import type { Strings } from '../lib/i18n';
import { MAX_STAGE, MIN_STAGE } from '../lib/books';
import { downloadText, exportJson, parseWords, sanitizeData } from '../lib/storage';

interface Props {
  t: Strings;
  data: UserData;
  books: Book[];
  startWithNewBook: boolean;
  update: (fn: (d: UserData) => UserData) => void;
  replace: (d: UserData) => void;
  /** Called after words land in a book that did not exist yet, so the dashboard can open it. */
  onBookCreated: (id: string) => void;
  onBack: () => void;
}

const NEW = '__new__';

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="border-b border-rule py-6">
      <h2 className="text-[17px] font-bold">{title}</h2>
      {hint && <p className="mt-1 max-w-[60ch] text-[13px] leading-relaxed text-hanji-2">{hint}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

/** A destructive button that asks for a second tap instead of a browser dialog. */
function ConfirmButton({ label, confirmLabel, onConfirm, icon }: { label: string; confirmLabel: string; onConfirm: () => void; icon: React.ReactNode }) {
  const [armed, setArmed] = useState(false);
  return (
    <button
      type="button"
      onClick={() => (armed ? (setArmed(false), onConfirm()) : setArmed(true))}
      onBlur={() => setArmed(false)}
      className={`flex h-11 items-center gap-2 border px-4 text-[14px] font-semibold transition-colors ${
        armed ? 'border-danger bg-danger text-ink' : 'border-rule text-hanji hover:border-hanji-2'
      }`}
    >
      {icon}
      {armed ? confirmLabel : label}
    </button>
  );
}

const fieldCls = 'w-full border border-rule bg-ink-2 px-3 text-[16px] text-hanji placeholder:text-hanji-2/85 focus:border-hanji focus:outline-none';
const labelCls = 'mb-1.5 block text-[11px] font-bold uppercase tracking-[0.12em] text-hanji-2';

export function Manager({ t, data, books, startWithNewBook, update, replace, onBookCreated, onBack }: Props) {
  const [target, setTarget] = useState(startWithNewBook ? NEW : books[0]?.id ?? NEW);
  const [newId, setNewId] = useState('');
  const [text, setText] = useState('');
  const [status, setStatus] = useState<{ tone: 'ok' | 'err'; msg: string } | null>(null);
  const [pendingBackup, setPendingBackup] = useState<UserData | null>(null);
  const [backupStatus, setBackupStatus] = useState<{ tone: 'ok' | 'err'; msg: string } | null>(null);
  const wordsFile = useRef<HTMLInputElement>(null);
  const backupFile = useRef<HTMLInputElement>(null);

  const parsed = useMemo(() => {
    if (!text.trim()) return null;
    try {
      return parseWords(text);
    } catch {
      return { words: [], skipped: -1 };
    }
  }, [text]);

  const cleanNewId = (newId.trim() || parsed?.book || '').trim().toUpperCase().slice(0, 12);
  const existingForNew = target === NEW ? books.find((b) => b.id.toUpperCase() === cleanNewId) : undefined;
  const canImport = !!parsed && parsed.words.length > 0 && (target !== NEW || cleanNewId.length > 0);

  const doImport = () => {
    if (!parsed || !canImport) return;
    const bookId = target === NEW ? existingForNew?.id ?? cleanNewId : target;
    const book = books.find((b) => b.id === bookId);
    const seen = new Set((book?.words ?? []).map((w) => `${w.unit}|${w.ko}`));
    const fresh: VocabEntry[] = [];
    for (const w of parsed.words) {
      const k = `${w.unit}|${w.ko}`;
      if (!seen.has(k)) {
        seen.add(k);
        fresh.push(w);
      }
    }
    update((d) => {
      if (book?.builtIn) {
        return { ...d, extraWords: { ...d.extraWords, [bookId]: [...(d.extraWords[bookId] ?? []), ...fresh] } };
      }
      if (book) {
        return {
          ...d,
          customBooks: d.customBooks.map((b) => {
            if (b.id !== bookId) return b;
            const units = [...b.units];
            for (const w of fresh) if (!units.includes(w.unit)) units.push(w.unit);
            return { ...b, units, words: [...b.words, ...fresh] };
          }),
        };
      }
      const units: string[] = [];
      for (const w of fresh) if (!units.includes(w.unit)) units.push(w.unit);
      return { ...d, customBooks: [...d.customBooks, { id: bookId, title: bookId, units, words: fresh, builtIn: false }] };
    });
    if (!book) onBookCreated(bookId);
    setStatus({ tone: 'ok', msg: t.imported(fresh.length) });
    setText('');
    setTarget(bookId);
    setNewId('');
  };

  const readFile = (file: File, then: (s: string) => void) => {
    const r = new FileReader();
    r.onload = () => then(String(r.result ?? ''));
    r.onerror = () => setStatus({ tone: 'err', msg: t.invalidFile });
    r.readAsText(file);
  };

  const customBooks = books.filter((b) => !b.builtIn);

  return (
    <div className="flex h-full flex-col">
      <header className="mx-auto flex w-full max-w-3xl shrink-0 items-center gap-2 px-4 pb-2 pt-4 md:px-8 md:pt-6">
        <button type="button" onClick={onBack} aria-label={t.backToUnits} className="-ml-2 p-2 text-hanji-2 hover:text-hanji">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-[22px] font-bold">{t.data}</h1>
      </header>

      <div className="mx-auto min-h-0 w-full max-w-3xl flex-1 overflow-y-auto overscroll-contain px-5 pb-10 md:px-8">
        <Section title={t.stageSize} hint={t.stageSizeHint}>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={MIN_STAGE}
              max={MAX_STAGE}
              step={1}
              value={data.settings.stageSize}
              onChange={(e) => update((d) => ({ ...d, settings: { ...d.settings, stageSize: Number(e.target.value) } }))}
              aria-label={t.stageSize}
              className="h-2 flex-1 accent-[var(--color-accent)]"
            />
            <output className="tabular w-10 text-right font-serif text-[26px] font-bold">{data.settings.stageSize}</output>
          </div>
        </Section>

        <Section title={t.addWords} hint={t.addWordsHint}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="target" className={labelCls}>
                {t.targetBook}
              </label>
              <select id="target" value={target} onChange={(e) => setTarget(e.target.value)} className={`${fieldCls} h-11`}>
                {books.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.title}
                  </option>
                ))}
                <option value={NEW}>{t.newBook}</option>
              </select>
            </div>
            {target === NEW && (
              <div>
                <label htmlFor="newbook" className={labelCls}>
                  {t.bookId}
                </label>
                <input
                  id="newbook"
                  value={newId}
                  onChange={(e) => setNewId(e.target.value)}
                  placeholder={parsed?.book ? parsed.book.toUpperCase() : t.bookIdHint}
                  maxLength={12}
                  autoFocus={startWithNewBook}
                  autoComplete="off"
                  className={`${fieldCls} h-11`}
                />
                {existingForNew && <p className="mt-1.5 text-[12px] text-hanji-2">{t.bookExists}</p>}
              </div>
            )}
          </div>

          <label htmlFor="words" className={`${labelCls} mt-4`}>
            {t.paste}
          </label>
          <textarea
            id="words"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setStatus(null);
            }}
            rows={7}
            spellCheck={false}
            placeholder={'1과\t학교\tmaktab\tшкола\tschool'}
            className={`${fieldCls} resize-y py-2.5 font-mono text-[14px] leading-relaxed`}
          />
          <div className="mt-2 min-h-5 text-[13px]" aria-live="polite">
            {parsed && parsed.skipped === -1 && <span className="text-danger-text">{t.invalidFile}</span>}
            {parsed && parsed.skipped >= 0 && <span className="text-hanji-2">{t.preview(parsed.words.length, parsed.skipped)}</span>}
            {!parsed && status && <span className={status.tone === 'ok' ? 'text-accent-text' : 'text-danger-text'}>{status.msg}</span>}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={!canImport}
              onClick={doImport}
              className="flex h-11 items-center gap-2 bg-accent px-5 text-[14px] font-bold text-ink hover:bg-accent-text disabled:cursor-not-allowed disabled:bg-ink-3 disabled:text-hanji-2"
            >
              <Upload size={16} aria-hidden /> {t.importWords}
            </button>
            <button
              type="button"
              onClick={() => wordsFile.current?.click()}
              className="flex h-11 items-center gap-2 border border-rule px-4 text-[14px] font-semibold hover:border-hanji-2"
            >
              <FileUp size={16} aria-hidden /> {t.chooseFile}
            </button>
            <input
              ref={wordsFile}
              type="file"
              accept=".json,.tsv,.txt,.csv,application/json,text/plain,text/tab-separated-values"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) readFile(f, setText);
                e.target.value = '';
              }}
            />
          </div>
        </Section>

        <Section title={t.backup} hint={t.backupHint}>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => downloadText(`eohwijang-backup-${new Date().toISOString().slice(0, 10)}.json`, exportJson(data))}
              className="flex h-11 items-center gap-2 border border-hanji/70 px-4 text-[14px] font-semibold hover:border-hanji"
            >
              <Download size={16} aria-hidden /> {t.exportBackup}
            </button>
            {pendingBackup ? (
              <ConfirmButton
                label={t.importBackup}
                confirmLabel={`${t.importBackup}?`}
                icon={<FileUp size={16} aria-hidden />}
                onConfirm={() => {
                  replace(pendingBackup);
                  setPendingBackup(null);
                  setBackupStatus({ tone: 'ok', msg: t.backupRestored });
                }}
              />
            ) : (
              <button
                type="button"
                onClick={() => backupFile.current?.click()}
                className="flex h-11 items-center gap-2 border border-rule px-4 text-[14px] font-semibold hover:border-hanji-2"
              >
                <FileUp size={16} aria-hidden /> {t.importBackup}
              </button>
            )}
            <input
              ref={backupFile}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                e.target.value = '';
                if (!f) return;
                readFile(f, (s) => {
                  try {
                    const json = JSON.parse(s);
                    if (!json || typeof json !== 'object' || !('settings' in json || 'memory' in json || 'mastered' in json)) throw new Error('not a backup');
                    setPendingBackup(sanitizeData(json));
                    setBackupStatus(null);
                  } catch {
                    setBackupStatus({ tone: 'err', msg: t.invalidFile });
                  }
                });
              }}
            />
          </div>
          {pendingBackup && (
            <p className="tabular mt-2 text-[13px] text-hanji">
              {t.mastered}: {Object.keys(pendingBackup.memory).length}
              {pendingBackup.customBooks.length > 0 && ` · ${t.books}: ${pendingBackup.customBooks.map((b) => b.id).join(', ')}`}
            </p>
          )}
          {backupStatus && (
            <p aria-live="polite" className={`mt-2 text-[13px] ${backupStatus.tone === 'ok' ? 'text-accent-text' : 'text-danger-text'}`}>
              {backupStatus.msg}
            </p>
          )}
        </Section>

        {customBooks.length > 0 && (
          <Section title={t.books}>
            <ul className="border-t border-rule-soft">
              {customBooks.map((b) => (
                <li key={b.id} className="flex items-center gap-4 border-b border-rule-soft py-3">
                  <span className="font-serif text-[22px] font-bold">{b.title}</span>
                  <span className="tabular flex-1 text-[13px] text-hanji-2">{t.wordCount(b.words.length)}</span>
                  <ConfirmButton
                    label={t.deleteBook}
                    confirmLabel={`${t.deleteBook}?`}
                    icon={<Trash2 size={16} aria-hidden />}
                    onConfirm={() => update((d) => ({ ...d, customBooks: d.customBooks.filter((x) => x.id !== b.id) }))}
                  />
                </li>
              ))}
            </ul>
          </Section>
        )}
      </div>
    </div>
  );
}
