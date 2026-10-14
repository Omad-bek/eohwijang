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
  /** Touch-only device: bigger keys everywhere, no Latin key labels or physical-keyboard hint. */
  touch: boolean;
}

/** Each row is 20 columns: letter keys span 2, so rows offset by half a key like a real board. Phone-sized keys are 52px tall. */
const keyBase =
  'relative flex h-[52px] touch-manipulation select-none items-center justify-center border border-rule bg-ink text-hanji transition-[background-color,transform] duration-100 hover:bg-ink-3 active:translate-y-px active:bg-rule';

/** Keys keep the answer field focused: they act on press without taking focus. */
const keepFocus = (e: React.MouseEvent) => e.preventDefault();

export function KoreanKeyboard({ t, onKey, onEnter, enterLabel, flash, touch }: Props) {
  const [shift, setShift] = useState(false);
  // Desktop mice get a slightly shorter board so the jamo diff above keeps its room.
  const keyCls = touch ? keyBase : `${keyBase} md:h-10`;

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
        <span lang="ko" className={`text-[22px] font-semibold leading-none ${touch ? '' : 'md:text-[20px]'} ${shift && shifted !== plain ? 'text-accent-text' : ''}`}>
          {jamo}
        </span>
        {!touch && (
          <span aria-hidden className="absolute right-1 top-0.5 text-[9px] font-semibold uppercase text-hanji-2/70">
            {code.slice(3)}
          </span>
        )}
      </button>
    );
  };

  return (
    <div role="group" aria-label={t.keyboard} className="anim-sheet mt-3 grid grid-cols-20 gap-1.5">
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
        <ArrowBigUp size={24} aria-hidden />
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
        <Delete size={24} aria-hidden />
      </button>

      <button
        type="button"
        tabIndex={-1}
        onMouseDown={keepFocus}
        onClick={() => onKey(' ')}
        aria-label={t.kbSpace}
        className={`${keyCls} col-span-14 text-[13px] font-semibold uppercase tracking-[0.12em] text-hanji-2`}
      >
        {t.kbSpace}
      </button>
      <button
        type="button"
        tabIndex={-1}
        onMouseDown={keepFocus}
        onClick={onEnter}
        className={`${keyCls} col-span-6 gap-1.5 border-accent/50 bg-accent-wash text-[15px] font-bold text-accent-text hover:bg-accent/20`}
      >
        <CornerDownLeft size={18} strokeWidth={2.4} aria-hidden />
        <span className="truncate">{enterLabel}</span>
      </button>

      {/* Once a physical key has been used the mapping is evidently understood; give the room back to the card. */}
      {!flash && !touch && <p className="col-span-20 mt-1 text-[12px] leading-snug text-hanji-2">{t.keyboardHint}</p>}
    </div>
  );
}
