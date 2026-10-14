import { useState } from 'react';
import { ArrowBigUp, CornerDownLeft, Delete } from 'lucide-react';
import type { Strings } from '../lib/i18n';
import { DUBEOLSIK, DUBEOLSIK_ROWS } from '../utils/hangulInput';

interface Props {
  t: Strings;
  /** A jamo, " " for space, or "back". */
  onKey: (key: string) => void;
  onEnter: () => void;
  enterLabel: string;
  /** Physical key last pressed (KeyboardEvent.code or "Backspace"), flashed on its virtual twin; `n` restarts the flash. */
  flash: { code: string; n: number } | null;
}

/** Each row is 20 columns: letter keys span 2, so rows offset by half a key like a real board. */
const keyCls =
  'relative flex h-10 select-none items-center justify-center border border-rule bg-ink text-hanji transition-[background-color,transform] duration-100 hover:bg-ink-3 active:translate-y-px active:bg-rule md:h-9';

/** Keys keep the answer field focused: they act on press without taking focus. */
const keepFocus = (e: React.MouseEvent) => e.preventDefault();

export function KoreanKeyboard({ t, onKey, onEnter, enterLabel, flash }: Props) {
  const [shift, setShift] = useState(false);

  const flashCls = (code: string) => (flash?.code === code ? 'anim-keyflash' : '');
  const flashKey = (code: string) => (flash?.code === code ? `${code}-${flash.n}` : code);

  const letter = (code: string, span: string) => {
    const [plain, shifted] = DUBEOLSIK[code];
    const jamo = shift ? shifted : plain;
    return (
      <button
        key={flashKey(code)}
        type="button"
        tabIndex={-1}
        onMouseDown={keepFocus}
        onClick={() => {
          onKey(jamo);
          setShift(false);
        }}
        className={`${keyCls} ${span} ${flashCls(code)}`}
      >
        <span lang="ko" className={`text-[20px] font-semibold leading-none ${shift && shifted !== plain ? 'text-accent-text' : ''}`}>
          {jamo}
        </span>
        <span aria-hidden className="absolute right-1 top-0.5 text-[9px] font-semibold uppercase text-hanji-2/70">
          {code.slice(3)}
        </span>
      </button>
    );
  };

  return (
    <div role="group" aria-label={t.keyboard} className="anim-sheet mt-3 grid grid-cols-20 gap-1 md:gap-1.5">
      {DUBEOLSIK_ROWS[0].map((c) => letter(c, 'col-span-2'))}

      <span aria-hidden className="col-span-1" />
      {DUBEOLSIK_ROWS[1].map((c) => letter(c, 'col-span-2'))}
      <span aria-hidden className="col-span-1" />

      <button
        type="button"
        tabIndex={-1}
        onMouseDown={keepFocus}
        onClick={() => setShift((s) => !s)}
        aria-pressed={shift}
        aria-label={t.kbShift}
        title={t.kbShift}
        className={`${keyCls} col-span-3 ${shift ? 'border-accent/60 bg-accent-wash text-accent-text hover:bg-accent-wash' : 'text-hanji-2'}`}
      >
        <ArrowBigUp size={20} aria-hidden />
      </button>
      {DUBEOLSIK_ROWS[2].map((c) => letter(c, 'col-span-2'))}
      <button
        key={flashKey('Backspace')}
        type="button"
        tabIndex={-1}
        onMouseDown={keepFocus}
        onClick={() => onKey('back')}
        aria-label={t.kbBackspace}
        title={t.kbBackspace}
        className={`${keyCls} col-span-3 text-hanji-2 ${flashCls('Backspace')}`}
      >
        <Delete size={20} aria-hidden />
      </button>

      <button
        type="button"
        tabIndex={-1}
        onMouseDown={keepFocus}
        onClick={() => onKey(' ')}
        aria-label={t.kbSpace}
        className={`${keyCls} col-span-14 text-[12px] font-semibold uppercase tracking-[0.12em] text-hanji-2`}
      >
        {t.kbSpace}
      </button>
      <button
        type="button"
        tabIndex={-1}
        onMouseDown={keepFocus}
        onClick={onEnter}
        className={`${keyCls} col-span-6 gap-1.5 border-accent/50 bg-accent-wash text-[13px] font-bold text-accent-text hover:bg-accent/20`}
      >
        <CornerDownLeft size={16} strokeWidth={2.4} aria-hidden />
        <span className="truncate">{enterLabel}</span>
      </button>

      {/* Once a physical key has been used the mapping is evidently understood; give the room back to the card. */}
      {!flash && <p className="col-span-20 mt-1 text-[12px] leading-snug text-hanji-2">{t.keyboardHint}</p>}
    </div>
  );
}
