import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Check, CircleHelp, CornerDownLeft, Keyboard, RotateCcw, Sparkles, SkipForward, X } from 'lucide-react';
import type { PromptLang, Settings, Stage, VocabEntry } from '../types';
import type { Strings } from '../lib/i18n';
import type { Outcome } from '../lib/srs';
import { checkAnswer, isCorrect, type DiffResult } from '../utils/hangulDiff';
import { backspaceJamo, DUBEOLSIK, typeJamo } from '../utils/hangulInput';
import { useTouchOnly } from '../lib/hooks';
import { DiffView } from './DiffView';
import { KoreanKeyboard } from './KoreanKeyboard';
import { Seal } from './Seal';

interface Props {
  t: Strings;
  stage: Stage;
  settings: Settings;
  /** Called as each word's fate in this session is decided (see Outcome). */
  onResult: (w: VocabEntry, outcome: Outcome) => void;
  onComplete: (firstTryShare: number) => void;
  onExit: () => void;
  nextStage: Stage | null;
  onNext: () => void;
}

interface Item {
  word: VocabEntry;
  /** Position in the stage's word list; stable identity across re-queues. */
  n: number;
}

type Phase = { kind: 'ask' } | { kind: 'review'; result: DiffResult; typed: string } | { kind: 'done'; firstTry: number };

function shuffle<T>(xs: T[]): T[] {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const reducedMotion = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/** A ring that holds, then fades; `bloom` adds a soft halo spreading outward. Linear overall, eased per keyframe. */
function ring(el: HTMLElement | null, rgb: string, bloom: boolean, duration: number) {
  const halo = (spread: number, a: number) => (bloom ? `, 0 0 0 ${spread}px rgb(${rgb} / ${a})` : '');
  el?.animate(
    [
      { boxShadow: `0 0 0 2px rgb(${rgb} / 0.5)${halo(0, 0.35)}`, easing: 'ease-out' },
      { boxShadow: `0 0 0 2px rgb(${rgb} / 0.5)${halo(10, 0)}`, offset: 0.55, easing: 'ease-in' },
      { boxShadow: `0 0 0 2px rgb(${rgb} / 0)${halo(10, 0)}` },
    ],
    { duration, easing: 'linear' },
  );
}

/** Emerald glow on a right answer: "yes, that's it". */
const glow = (el: HTMLElement | null) => ring(el, '16 185 129', !reducedMotion(), 800);

/**
 * A small, damped side-to-side shake: "try again", not "wrong!". With reduced motion it becomes
 * a still amber ring flash on the field, so the signal survives without movement.
 */
function shake(row: HTMLElement | null, field: HTMLElement | null) {
  if (reducedMotion()) return ring(field, '251 191 36', false, 700);
  row?.animate(
    [{ transform: 'none' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(5px)' }, { transform: 'translateX(-3px)' }, { transform: 'translateX(2px)' }, { transform: 'none' }],
    { duration: 380, easing: 'ease-out' },
  );
}

const KEYBOARD_KEY = 'project-vocab:keyboard';

function readKeyboardOpen(): boolean {
  try {
    return localStorage.getItem(KEYBOARD_KEY) === '1';
  } catch {
    return false;
  }
}

type EdgeKind = 'right' | 'wrong' | 'skip';

const EDGE_TONE: Record<EdgeKind, { glow: string; bar: string }> = {
  right: { glow: 'from-accent/45 via-accent/12', bar: 'bg-accent shadow-[0_-20px_50px_rgba(16,185,129,0.55)]' },
  wrong: { glow: 'from-danger/40 via-danger/10', bar: 'bg-danger shadow-[0_-20px_50px_rgba(239,68,68,0.5)]' },
  skip: { glow: 'from-amber/35 via-amber/10', bar: 'bg-amber shadow-[0_-20px_50px_rgba(251,191,36,0.45)]' },
};

function Prompt({ word, lang }: { word: VocabEntry; lang: PromptLang }) {
  const langs = (['uz', 'ru', 'en'] as const).filter((l) => word[l]);
  if (lang === 'all' || !word[lang as 'uz' | 'ru' | 'en']) {
    return (
      <dl className="space-y-2.5">
        {langs.map((l) => (
          <div key={l} className="flex items-baseline gap-3">
            <dt className="w-7 shrink-0 text-[11px] font-bold uppercase tracking-[0.12em] text-accent-text">{l}</dt>
            <dd lang={l} className="text-[24px] font-bold leading-tight">
              {word[l]}
            </dd>
          </div>
        ))}
      </dl>
    );
  }
  const l = lang as 'uz' | 'ru' | 'en';
  return (
    <p lang={l} className="text-[34px] font-bold leading-[1.1] tracking-[-0.01em]">
      {word[l]}
    </p>
  );
}

export function Quiz({ t, stage, settings, onResult, onComplete, onExit, nextStage, onNext }: Props) {
  /** The current round, in order. Misses wait in `nextRound` (FIFO) until every word in this round has been seen. */
  const [queue, setQueue] = useState<Item[]>(() => shuffle(stage.words.map((word, n) => ({ word, n }))));
  const [nextRound, setNextRound] = useState<Item[]>([]);
  const [round, setRound] = useState(1);
  const [phase, setPhase] = useState<Phase>({ kind: 'ask' });
  const [value, setValue] = useState('');
  const [missed, setMissed] = useState<Set<number>>(() => new Set());
  /** The encouragement badge; `id` restarts its animation on every right answer. */
  const [praise, setPraise] = useState<{ id: number; text: string } | null>(null);
  const [lastRight, setLastRight] = useState<{ prompt: string; ko: string } | null>(null);
  const [imeHint, setImeHint] = useState(false);
  /** Onscreen 두벌식 keyboard; remembered per device. */
  const [kbPref, setKbPref] = useState(readKeyboardOpen);
  /** Phones and tablets always use the onscreen keyboard; the field is read-only so the system keyboard never opens. */
  const touch = useTouchOnly();
  const kbOpen = touch || kbPref;
  /** Full-width glow rising from the bottom edge of the screen; `id` restarts it. */
  const [edge, setEdge] = useState<{ id: number; kind: EdgeKind } | null>(null);
  const [keyFlash, setKeyFlash] = useState<{ code: string; n: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const answerRow = useRef<HTMLDivElement>(null);
  const composing = useRef(false);
  const pendingSubmit = useRef(false);

  const glossLang = settings.promptLang !== 'all' ? settings.promptLang : settings.uiLang === 'ko' ? 'en' : settings.uiLang;
  const gloss = (w: VocabEntry) => w[glossLang] || w.uz || w.ru || w.en;
  const total = stage.words.length;
  const current = queue[0];
  const pendingSet = new Set([...queue, ...nextRound].map((q) => q.n));
  const cleared = total - pendingSet.size;
  const left = pendingSet.size;

  useEffect(() => {
    if (phase.kind !== 'done') inputRef.current?.focus({ preventScroll: true });
  }, [phase.kind, current]);

  const flashEdge = (kind: EdgeKind) => setEdge((e) => ({ id: (e?.id ?? 0) + 1, kind }));

  const cheer = () => {
    glow(inputRef.current);
    flashEdge('right');
    setPraise((prev) => {
      const pool = t.praise.filter((p) => p !== prev?.text);
      return { id: (prev?.id ?? 0) + 1, text: pool[Math.floor(Math.random() * pool.length)] };
    });
  };

  const finish = (missedSet: Set<number>) => {
    const share = (total - missedSet.size) / total;
    setPhase({ kind: 'done', firstTry: share });
    onComplete(share);
  };

  /** Move past the current word; when the round runs out, the misses become the next round. */
  const advance = (rest: Item[], later: Item[]) => {
    if (rest.length) {
      setQueue(rest);
      setNextRound(later);
    } else if (later.length) {
      setQueue(later);
      setNextRound([]);
      setRound((r) => r + 1);
    } else {
      setQueue([]);
      setNextRound([]);
      finish(missed);
    }
  };

  /** Count a miss once per word: the first one also drops a learned word back to level 1. */
  const miss = () => {
    if (missed.has(current.n)) return;
    const next = new Set(missed);
    next.add(current.n);
    setMissed(next);
    onResult(current.word, 'missed');
  };

  const submit = () => {
    if (!current || phase.kind === 'done') return;
    const typed = value;
    if (!typed.trim()) return;

    // Latin/Cyrillic input means the keyboard isn't on Korean: say so instead of scoring a miss.
    if (!/[ᄀ-ᇿ㄰-㆏가-힣]/.test(typed)) {
      setImeHint(true);
      shake(answerRow.current, inputRef.current);
      return;
    }
    setImeHint(false);

    if (phase.kind === 'ask') {
      const result = checkAnswer(typed, current.word.ko);
      if (result.correct) {
        onResult(current.word, missed.has(current.n) ? 'relearned' : 'firstTry');
        setLastRight({ prompt: gloss(current.word), ko: result.target });
        cheer();
        setValue('');
        advance(queue.slice(1), nextRound);
      } else {
        miss();
        setLastRight(null);
        setPraise(null);
        setPhase({ kind: 'review', result, typed });
        setValue('');
        shake(answerRow.current, inputRef.current);
        flashEdge('wrong');
      }
      return;
    }

    // Review: the learner must type the correct word before moving on; it then waits for the next round.
    if (isCorrect(typed, current.word.ko)) {
      glow(inputRef.current);
      flashEdge('right');
      setValue('');
      setPhase({ kind: 'ask' });
      advance(queue.slice(1), [...nextRound, current]);
    } else {
      shake(answerRow.current, inputRef.current);
      flashEdge('wrong');
      setValue('');
    }
  };

  /** "Don't know": reveal the answer as a miss; the retype step then requeues it to the end of the stage. */
  const skip = () => {
    if (!current || phase.kind !== 'ask') return;
    setImeHint(false);
    miss();
    setLastRight(null);
    setPraise(null);
    setPhase({ kind: 'review', result: checkAnswer('', current.word.ko), typed: '' });
    setValue('');
    shake(answerRow.current, inputRef.current);
    flashEdge('skip');
    inputRef.current?.focus({ preventScroll: true });
  };

  const toggleKeyboard = (open = !kbOpen) => {
    setKbPref(open);
    try {
      localStorage.setItem(KEYBOARD_KEY, open ? '1' : '0');
    } catch {
      /* per-device convenience only */
    }
    inputRef.current?.focus({ preventScroll: true });
  };

  /** Apply an onscreen (or remapped physical) key at the caret: a jamo, " ", or "back". */
  const pressKey = (key: string) => {
    const el = inputRef.current;
    const start = el?.selectionStart ?? value.length;
    const end = el?.selectionEnd ?? value.length;
    let before = value.slice(0, start);
    if (start === end) before = key === 'back' ? backspaceJamo(before) : key === ' ' ? `${before} ` : typeJamo(before, key);
    else if (key !== 'back') before = key === ' ' ? `${before} ` : typeJamo(before, key);
    setValue(before + value.slice(end));
    setImeHint(false);
    if (lastRight) setLastRight(null);
    requestAnimationFrame(() => {
      el?.focus({ preventScroll: true });
      el?.setSelectionRange(before.length, before.length);
    });
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const imeBusy = composing.current || e.nativeEvent.isComposing || e.keyCode === 229;
    // With the onscreen keyboard open, letter keys type 두벌식 by position (e.code), whatever the OS layout is.
    if (kbOpen && !imeBusy && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const jamo = DUBEOLSIK[e.code];
      const collapsed = e.currentTarget.selectionStart === e.currentTarget.selectionEnd;
      if (jamo || (e.key === 'Backspace' && collapsed)) {
        e.preventDefault();
        pressKey(jamo ? jamo[e.shiftKey ? 1 : 0] : 'back');
        const code = jamo ? e.code : 'Backspace';
        setKeyFlash((f) => ({ code, n: (f?.n ?? 0) + 1 }));
        return;
      }
    }
    if (e.key === 'Escape') {
      // Escape mid-composition belongs to the IME (it cancels the syllable).
      if (composing.current || e.nativeEvent.isComposing || e.keyCode === 229) return;
      e.preventDefault();
      skip();
      return;
    }
    if (e.key !== 'Enter') return;
    e.preventDefault();
    // Korean IME: Enter while a syllable is still composing commits it first; check after commit.
    if (composing.current || e.nativeEvent.isComposing || e.keyCode === 229) {
      pendingSubmit.current = true;
      return;
    }
    submit();
  };

  const onCompositionEnd = (e: React.CompositionEvent<HTMLInputElement>) => {
    composing.current = false;
    if (pendingSubmit.current) {
      pendingSubmit.current = false;
      const v = (e.target as HTMLInputElement).value;
      setValue(v);
      // Let React apply the committed value, then submit.
      requestAnimationFrame(() => document.getElementById('answer-submit')?.click());
    }
  };

  const reviewTarget = phase.kind === 'review' ? phase.result.target : '';
  const correctForm = phase.kind === 'review' ? current.word.ko : '';

  const track = (
    /* One seal per word: the stage visibly fills as words are mastered. */
    <ol className="flex items-center gap-[3px]" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={cleared} aria-label={t.remaining(left)}>
      {stage.words.map((_, n) => {
        const done = !pendingSet.has(n);
        const now = current?.n === n && phase.kind !== 'done';
        return (
          <li key={n} className="flex flex-1 justify-center">
            <span
              className={`block aspect-square w-full max-w-[14px] transition-all duration-300 ${
                done
                  ? 'rotate-[-6deg] bg-accent'
                  : now
                    ? `bg-hanji ${missed.has(n) ? 'ring-2 ring-amber ring-offset-1 ring-offset-ink' : ''}`
                    : missed.has(n)
                      ? 'ring-1 ring-inset ring-amber'
                      : 'bg-rule-soft'
              }`}
            />
          </li>
        );
      })}
    </ol>
  );

  const header = (
    <header className="shrink-0 pb-3 pt-3 md:pb-4 md:pt-6">
      <div className="mb-3 flex items-center gap-3">
        <button
          type="button"
          onClick={onExit}
          onMouseDown={(e) => e.preventDefault()}
          className="-ml-1 flex h-9 shrink-0 items-center gap-1.5 border border-rule px-2.5 text-[13px] font-semibold text-hanji hover:border-hanji-2"
        >
          <ArrowLeft size={16} aria-hidden />
          <span className="hidden sm:inline">{t.backToLevels}</span>
          <span className="sr-only sm:hidden">{t.backToLevels}</span>
        </button>
        <p className="min-w-0 flex-1 truncate text-[12px] font-semibold uppercase tracking-[0.12em] text-hanji-2">
          {stage.bookId} · <span className="font-serif text-[15px] normal-case tracking-normal text-hanji">{stage.unit}</span> · {t.stage(stage.index + 1)}
        </p>
        <p className="tabular shrink-0 text-[14px] font-bold text-hanji">
          {cleared}
          <span className="font-semibold text-hanji-2"> / {total}</span>
        </p>
      </div>
      {track}
      {phase.kind !== 'done' && (
        <p aria-live="polite" className="tabular mt-2 flex items-center gap-2 text-[12px] font-semibold text-hanji-2">
          <span className={round > 1 ? 'text-amber' : ''}>{t.round(round)}</span>
          {round > 1 && (
            <>
              <span aria-hidden>·</span>
              <span>{t.mistakesLeft(left)}</span>
            </>
          )}
        </p>
      )}
    </header>
  );

  const missedWords = useMemo(() => stage.words.filter((_, n) => missed.has(n)), [missed, stage.words]);

  /** The flashcard: full-bleed on phones, a bordered centered card on wider screens. Tighter while the keyboard is open, so the jamo diff keeps its room. */
  const cardCls = `relative flex min-h-0 flex-1 flex-col md:border md:border-rule md:bg-ink-2 ${kbOpen ? 'md:mb-3' : 'md:mb-6'}`;

  if (phase.kind === 'done') {
    const pct = Math.round(phase.firstTry * 100);
    return (
      <div className="mx-auto flex h-full w-full max-w-2xl flex-col px-4">
        {header}
        <section className={cardCls}>
          <div className="min-h-0 flex-1 overflow-y-auto px-1 py-8 md:px-8">
            <div className="flex items-center gap-5">
              <Seal size={84} animate />
              <div>
                <h2 className="text-[26px] font-bold leading-tight">{t.stageDone}</h2>
                <p className="tabular mt-1 text-[14px] text-hanji-2">{t.firstTry(pct)}</p>
              </div>
            </div>
            {missedWords.length > 0 && (
              <>
                <h3 className="mt-9 text-[11px] font-bold uppercase tracking-[0.12em] text-hanji-2">{t.missedWords}</h3>
                <ul className="mt-2 border-t border-rule">
                  {missedWords.map((w) => (
                    <li key={w.ko} className="flex items-baseline gap-4 border-b border-rule-soft py-2.5">
                      <span lang="ko" className="w-32 shrink-0 font-serif text-[19px] font-bold">
                        {w.ko}
                      </span>
                      <span className="min-w-0 text-[14px] text-hanji-2">{gloss(w)}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
          <footer className="grid shrink-0 gap-2 border-t border-rule pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 md:grid-cols-2 md:px-8 md:pb-6 md:pt-5">
            <button
              type="button"
              onClick={onExit}
              className={`h-12 border text-[14px] font-semibold md:order-1 ${nextStage ? 'border-rule text-hanji hover:border-hanji-2' : 'border-accent bg-accent text-ink md:col-span-2'}`}
            >
              {t.backToLevels}
            </button>
            {nextStage && (
              <button type="button" onClick={onNext} className="h-12 bg-accent text-[15px] font-bold text-ink hover:bg-accent-text md:order-2">
                {t.nextStage} · <span className="font-serif">{nextStage.unit}</span> {t.stage(nextStage.index + 1)}
              </button>
            )}
          </footer>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-full w-full max-w-2xl flex-col px-4">
      {edge && (
        <div
          key={edge.id}
          aria-hidden
          onAnimationEnd={() => setEdge((e) => (e?.id === edge.id ? null : e))}
          className="anim-edge pointer-events-none fixed inset-x-0 bottom-0 z-[45] h-[42vh]"
        >
          <div className={`absolute inset-0 bg-gradient-to-t to-transparent ${EDGE_TONE[edge.kind].glow}`} />
          <div className={`absolute inset-x-0 bottom-0 h-1.5 ${EDGE_TONE[edge.kind].bar}`} />
        </div>
      )}
      {header}

      <section className={cardCls}>
        {praise && (
          <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1/2">
            <span
              key={praise.id}
              lang={/[가-힣]/.test(praise.text) ? 'ko' : undefined}
              onAnimationEnd={() => setPraise((p) => (p?.id === praise.id ? null : p))}
              className="anim-praise flex items-center gap-2 whitespace-nowrap rounded-full border border-accent/60 bg-accent-wash px-5 py-2.5 text-[19px] font-bold text-accent-text shadow-[0_0_28px_rgba(16,185,129,0.35)]"
            >
              <Sparkles size={20} strokeWidth={2.4} aria-hidden />
              {praise.text}
            </span>
          </div>
        )}
        <div className={`relative min-h-0 flex-1 overflow-y-auto overscroll-contain px-1 pb-4 pt-6 md:px-8 ${kbOpen ? 'md:pt-6' : 'md:pt-8'}`}>
          <div aria-hidden className="pointer-events-none absolute inset-0 flex px-1 md:px-8">
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className="flex-1 border-l border-rule-soft/60 last:border-r" />
            ))}
          </div>

          <div className="relative">
            <div className="flex items-start justify-between gap-4">
              <Prompt word={current.word} lang={settings.promptLang} />
              <span className="mt-0.5 shrink-0 border border-rule bg-ink px-2 py-1 font-serif text-[14px] font-bold text-hanji-2" title={stage.unit}>
                {stage.unit}
              </span>
            </div>

            <div aria-live="polite" className={kbOpen ? 'mt-5' : 'mt-7'}>
              {phase.kind === 'review' ? (
                <div>
                  {phase.typed ? (
                    <p className="anim-cell mb-4 flex items-center gap-2 text-[15px] font-bold text-danger-text">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-danger text-ink">
                        <X size={15} strokeWidth={3} aria-hidden />
                      </span>
                      {t.notQuite}
                    </p>
                  ) : (
                    <p className="anim-cell mb-1 flex items-center gap-2 text-[15px] font-bold text-amber">
                      <CircleHelp size={22} aria-hidden className="shrink-0" />
                      {t.revealed}
                    </p>
                  )}
                  {phase.typed ? <DiffView key={`${current.n}-${reviewTarget}-${phase.typed}`} t={t} cells={phase.result.cells} /> : null}
                  <div className="mt-5 flex items-baseline gap-3 border-t border-rule pt-4">
                    <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-hanji-2">{t.correctAnswer}</span>
                    <span lang="ko" className="font-serif text-[30px] font-bold leading-none text-hanji">
                      {correctForm}
                    </span>
                  </div>
                  <p className="mt-2 flex items-center gap-1.5 text-[13px] text-hanji-2">
                    <RotateCcw size={14} aria-hidden /> {t.retypeHint}
                  </p>
                </div>
              ) : (
                lastRight && (
                  <p key={lastRight.ko + cleared} className="anim-cell flex items-center gap-2 border-t border-rule-soft pt-3 text-[14px] text-hanji-2">
                    <Check size={16} strokeWidth={2.6} className="text-accent-text" aria-label={t.correct} />
                    <span className="truncate">{lastRight.prompt}</span>
                    <span aria-hidden>→</span>
                    <span lang="ko" className="font-serif text-[19px] font-bold text-accent-text">
                      {lastRight.ko}
                    </span>
                  </p>
                )
              )}
            </div>
          </div>
        </div>

        <form
          className={`shrink-0 border-t border-rule bg-ink pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 md:bg-transparent md:px-8 ${kbOpen ? 'md:pb-4 md:pt-4' : 'md:pb-6 md:pt-5'}`}
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <div className="mb-1.5 flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.12em] text-hanji-2">
            <label htmlFor="answer" className={`min-w-0 flex-1 truncate ${phase.kind === 'review' ? 'text-amber' : ''}`}>
              {phase.kind === 'review' ? t.retypeLabel : t.typeInKorean}
            </label>
            <span className="tabular shrink-0 whitespace-nowrap normal-case tracking-normal">{t.remaining(left)}</span>
            {!touch && (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => toggleKeyboard()}
              aria-pressed={kbOpen}
              aria-label={t.keyboard}
              title={t.keyboard}
              className={`-my-1 flex h-8 shrink-0 items-center gap-1.5 border px-2 text-[12px] font-semibold normal-case tracking-normal transition-colors ${
                kbOpen ? 'border-accent/50 bg-accent-wash text-accent-text' : 'border-rule text-hanji-2 hover:border-hanji-2 hover:text-hanji'
              }`}
            >
              <Keyboard size={16} aria-hidden />
              <span lang="ko" aria-hidden>
                한글
              </span>
            </button>
            )}
          </div>
          <div ref={answerRow} className="flex gap-2">
            <input
              ref={inputRef}
              id="answer"
              lang="ko"
              // An open onscreen keyboard replaces the phone's own, so it doesn't cover the screen.
              inputMode={kbOpen ? 'none' : 'text'}
              readOnly={touch}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              enterKeyHint="done"
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                if (imeHint) setImeHint(false);
                if (lastRight) setLastRight(null);
              }}
              onKeyDown={onKeyDown}
              onCompositionStart={() => (composing.current = true)}
              onCompositionEnd={onCompositionEnd}
              placeholder={phase.kind === 'review' ? correctForm : '한국어'}
              className={`h-14 min-w-0 flex-1 border-[1.5px] bg-ink-2 px-4 transition-colors duration-300 text-[24px] font-semibold text-hanji placeholder:font-normal placeholder:text-hanji-2/85 focus:outline-none md:bg-ink ${
                phase.kind === 'review' ? 'border-amber' : 'border-hanji/70 focus:border-hanji'
              }`}
            />
            <button
              id="answer-submit"
              type="submit"
              onMouseDown={(e) => e.preventDefault()}
              aria-label={phase.kind === 'review' ? t.continue : t.check}
              className="flex h-14 w-14 shrink-0 items-center justify-center bg-accent text-ink hover:bg-accent-text md:w-auto md:gap-2 md:px-5 md:text-[15px] md:font-bold"
            >
              <CornerDownLeft size={22} strokeWidth={2.4} aria-hidden />
              <span className="hidden md:inline">{phase.kind === 'review' ? t.continue : t.check}</span>
            </button>
          </div>
          {imeHint && (
            <div role="alert" className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 border border-rule bg-ink-2 px-3 py-2 text-[13px] leading-snug text-hanji">
              <p className="min-w-0 flex-1">{t.notHangul}</p>
              {!kbOpen && (
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setImeHint(false);
                    setValue('');
                    toggleKeyboard(true);
                  }}
                  className="flex h-9 shrink-0 items-center gap-1.5 bg-accent px-3 text-[13px] font-bold text-ink hover:bg-accent-text"
                >
                  <Keyboard size={16} aria-hidden /> {t.openKeyboard}
                </button>
              )}
            </div>
          )}
          {(phase.kind === 'ask' || !kbOpen) && (
            <div className="mt-2 flex items-center justify-between gap-3">
              {phase.kind === 'ask' ? (
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={skip}
                  aria-keyshortcuts="Escape"
                  className="flex h-9 items-center gap-1.5 border border-rule px-3 text-[13px] font-semibold text-hanji-2 hover:border-hanji-2 hover:text-hanji"
                >
                  <SkipForward size={15} aria-hidden /> {t.dontKnow}
                  {!touch && <kbd aria-hidden className="ml-1 hidden border border-rule bg-ink-3 px-1.5 py-0.5 font-sans text-[11px] font-bold text-hanji md:inline">Esc</kbd>}
                </button>
              ) : (
                <span />
              )}
              {!kbOpen && (
                <p className="hidden items-center gap-1.5 text-[12px] text-hanji-2 md:flex" aria-hidden>
                  <kbd className="border border-rule bg-ink-3 px-1.5 py-0.5 font-sans text-[11px] font-bold text-hanji">Enter ↵</kbd>
                  {phase.kind === 'review' ? t.continue.toLowerCase() : t.enterToCheck}
                </p>
              )}
            </div>
          )}
          {kbOpen && (
            <KoreanKeyboard
              t={t}
              onKey={pressKey}
              onEnter={() => document.getElementById('answer-submit')?.click()}
              enterLabel={phase.kind === 'review' ? t.continue : t.check}
              flash={keyFlash}
              touch={touch}
            />
          )}
        </form>
      </section>
    </div>
  );
}
