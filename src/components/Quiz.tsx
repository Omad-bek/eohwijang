import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Check, CircleHelp, CornerDownLeft, Flame, Keyboard, RotateCcw, Sparkles, SkipForward, Star, X } from 'lucide-react';
import type { PromptLang, Settings, Stage, VocabEntry } from '../types';
import type { Strings } from '../lib/i18n';
import type { Outcome } from '../lib/srs';
import { checkAnswer, isCorrect, type DiffResult } from '../utils/hangulDiff';
import { backspaceJamo, DUBEOLSIK, typeJamo } from '../utils/hangulInput';
import { useTouchOnly } from '../lib/hooks';
import { clearSession, saveSession, stageSignature, type SavedSession } from '../lib/session';
import { DiffView } from './DiffView';
import { KoreanKeyboard } from './KoreanKeyboard';
import { Seal } from './Seal';
import { Burst } from './Ring';
import { XP_PER_WORD } from '../lib/activity';
import { playCombo, playCorrect, playPop, playWrong } from '../lib/soundEngine';

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
  /** An unfinished run of this stage to continue instead of starting over. */
  resume?: SavedSession | null;
}

interface Item {
  word: VocabEntry;
  /** Position in the stage's word list; stable identity across re-queues. */
  n: number;
}

/** Combo counts that earn a celebration. */
const MILESTONES = new Set([3, 5, 10, 15, 20, 25, 30]);

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
            <dd lang={l} className="text-[24px] font-black leading-tight">
              {word[l]}
            </dd>
          </div>
        ))}
      </dl>
    );
  }
  const l = lang as 'uz' | 'ru' | 'en';
  return (
    <p lang={l} className="text-[36px] font-black leading-[1.1] tracking-[-0.01em]">
      {word[l]}
    </p>
  );
}

export function Quiz({ t, stage, settings, onResult, onComplete, onExit, nextStage, onNext, resume }: Props) {
  const items = (ns: number[]) => ns.map((n) => ({ word: stage.words[n], n }));
  /** The current round, in order. Misses wait in `nextRound` (FIFO) until every word in this round has been seen. */
  const [queue, setQueue] = useState<Item[]>(() => (resume ? items(resume.queue) : shuffle(stage.words.map((word, n) => ({ word, n })))));
  const [nextRound, setNextRound] = useState<Item[]>(() => (resume ? items(resume.nextRound) : []));
  const [round, setRound] = useState(resume?.round ?? 1);
  const [phase, setPhase] = useState<Phase>(() =>
    resume && resume.reviewTyped !== null
      ? { kind: 'review', result: checkAnswer(resume.reviewTyped, stage.words[resume.queue[0]].ko), typed: resume.reviewTyped }
      : { kind: 'ask' },
  );
  const [value, setValue] = useState('');
  const [missed, setMissed] = useState<Set<number>>(() => new Set(resume?.missed));
  /** Set once the learner answers, so merely opening (or resuming) a stage saves nothing. */
  const answered = useRef(false);
  /** Bumped by answers that change nothing else (a wrong retype), so they still refresh `lastActive`. */
  const [attempts, setAttempts] = useState(0);
  /** The encouragement badge; `id` restarts its animation on every right answer. */
  const [praise, setPraise] = useState<{ id: number; text: string; hot?: boolean } | null>(null);
  /** First-try answers in a row, the best run this session, and XP earned (not saved; the activity log is). */
  const [combo, setCombo] = useState(0);
  const [best, setBest] = useState(0);
  const [xp, setXp] = useState(0);
  /** Restarts the +XP float on every recalled word. */
  const [gain, setGain] = useState(0);
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

  // Keep the run resumable: saved after every answer, dropped once the stage is done.
  useEffect(() => {
    if (!answered.current) return;
    if (phase.kind === 'done') return clearSession();
    saveSession({
      stageKey: stage.key,
      signature: stageSignature(stage),
      queue: queue.map((q) => q.n),
      nextRound: nextRound.map((q) => q.n),
      round,
      missed: [...missed],
      reviewTyped: phase.kind === 'review' ? phase.typed : null,
      lastActive: Date.now(),
    });
  }, [stage, queue, nextRound, round, missed, phase, attempts]);

  const flashEdge = (kind: EdgeKind) => setEdge((e) => ({ id: (e?.id ?? 0) + 1, kind }));

  const cheer = (streak: number) => {
    glow(inputRef.current);
    flashEdge('right');
    setXp((x) => x + XP_PER_WORD);
    setGain((g) => g + 1);
    const hot = MILESTONES.has(streak);
    setPraise((prev) => {
      const pool = t.praise.filter((p) => p !== prev?.text);
      return { id: (prev?.id ?? 0) + 1, text: hot ? t.inARow(streak) : pool[Math.floor(Math.random() * pool.length)], hot };
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
    answered.current = true;

    if (phase.kind === 'ask') {
      const result = checkAnswer(typed, current.word.ko);
      if (result.correct) {
        const first = !missed.has(current.n);
        onResult(current.word, first ? 'firstTry' : 'relearned');
        setLastRight({ prompt: gloss(current.word), ko: result.target });
        // Only first-try recalls grow the combo; a word recovered after a miss neither grows nor breaks it.
        const streak = first ? combo + 1 : combo;
        if (first) {
          setCombo(streak);
          setBest((b) => Math.max(b, streak));
        }
        if (first && MILESTONES.has(streak)) playCombo();
        else playCorrect(first ? streak : 0);
        cheer(first ? streak : 0);
        setValue('');
        advance(queue.slice(1), nextRound);
      } else {
        miss();
        setCombo(0);
        setLastRight(null);
        setPraise(null);
        setPhase({ kind: 'review', result, typed });
        setValue('');
        playWrong();
        shake(answerRow.current, inputRef.current);
        flashEdge('wrong');
      }
      return;
    }

    // Review: the learner must type the correct word before moving on; it then waits for the next round.
    if (isCorrect(typed, current.word.ko)) {
      playCorrect();
      glow(inputRef.current);
      flashEdge('right');
      setValue('');
      setPhase({ kind: 'ask' });
      advance(queue.slice(1), [...nextRound, current]);
    } else {
      playWrong();
      shake(answerRow.current, inputRef.current);
      flashEdge('wrong');
      setValue('');
      setAttempts((a) => a + 1);
    }
  };

  /** "Don't know": reveal the answer as a miss; the retype step then requeues it to the end of the stage. */
  const skip = () => {
    if (!current || phase.kind !== 'ask') return;
    setImeHint(false);
    answered.current = true;
    miss();
    setCombo(0);
    setLastRight(null);
    setPraise(null);
    setPhase({ kind: 'review', result: checkAnswer('', current.word.ko), typed: '' });
    setValue('');
    playWrong();
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
              className={`block h-3 w-full rounded-full transition-all duration-300 ${
                done
                  ? 'bg-accent'
                  : now
                    ? `bg-hanji ${missed.has(n) ? 'ring-2 ring-flame ring-offset-1 ring-offset-ink' : ''}`
                    : missed.has(n)
                      ? 'bg-flame-wash ring-2 ring-inset ring-flame'
                      : 'bg-rule'
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
          onClick={() => {
            playPop();
            onExit();
          }}
          onMouseDown={(e) => e.preventDefault()}
          className="press -ml-1 flex h-9 shrink-0 items-center gap-1.5 rounded-full border-2 border-rule bg-ink-2 px-3 text-[13px] font-extrabold text-hanji hover:border-hanji-2/40"
        >
          <ArrowLeft size={16} aria-hidden />
          <span className="hidden sm:inline">{t.backToLevels}</span>
          <span className="sr-only sm:hidden">{t.backToLevels}</span>
        </button>
        <p className="min-w-0 flex-1 truncate text-[12px] font-extrabold uppercase tracking-[0.12em] text-hanji-2">
          {stage.review ? (
            <>
              {stage.bookId} · {t.review}
            </>
          ) : (
            <>
              {stage.bookId} · <span className="font-serif text-[16px] normal-case tracking-normal text-hanji">{stage.unit}</span> · {t.stage(stage.index + 1)}
            </>
          )}
        </p>
        {phase.kind !== 'done' && (
          <span
            key={combo >= 2 ? `c${combo}` : 'off'}
            role="status"
            aria-label={t.combo(combo)}
            className={`flex h-9 shrink-0 items-center gap-1 rounded-full px-2.5 text-[15px] font-black transition-colors ${
              combo >= 2 ? 'anim-bump bg-flame text-on-bright shadow-[0_3px_0_var(--color-flame-lip)]' : 'bg-ink-3 text-hanji-2/70'
            }`}
          >
            <Flame size={16} strokeWidth={2.5} className={combo >= 2 ? 'fill-gold' : ''} aria-hidden />
            <span className="tabular">×{combo}</span>
          </span>
        )}
        <p className="tabular shrink-0 text-[14px] font-black text-hanji">
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
  const cardCls = `relative flex min-h-0 flex-1 flex-col md:rounded-[28px] md:border-2 md:border-rule md:bg-ink-2 md:shadow-[0_5px_0_var(--color-rule)] ${kbOpen ? 'md:mb-3' : 'md:mb-6'}`;

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
                <h2 className="text-[28px] font-black leading-tight">{t.stageDone}</h2>
                <p className="tabular mt-1 text-[14px] font-bold text-hanji-2">{t.firstTry(pct)}</p>
              </div>
            </div>
            <dl className="mt-7 grid grid-cols-2 gap-3">
              <div className="anim-rise rounded-2xl border-2 border-gold bg-gold/15 px-4 py-3" style={{ ['--i' as string]: 2 }}>
                <dt className="flex items-center gap-1.5 text-[12px] font-extrabold uppercase tracking-wide text-hanji-2">
                  <Star size={14} className="fill-gold text-gold-lip" aria-hidden />
                  {t.xpEarned}
                </dt>
                <dd className="tabular mt-1 text-[26px] font-black">+{xp}</dd>
              </div>
              <div className="anim-rise rounded-2xl border-2 border-flame bg-flame-wash px-4 py-3" style={{ ['--i' as string]: 3 }}>
                <dt className="flex items-center gap-1.5 text-[12px] font-extrabold uppercase tracking-wide text-hanji-2">
                  <Flame size={14} className="fill-flame text-flame-ink" aria-hidden />
                  {t.bestCombo}
                </dt>
                <dd className="tabular mt-1 text-[26px] font-black">×{best}</dd>
              </div>
            </dl>
            {missedWords.length > 0 && (
              <>
                <h3 className="mt-9 text-[11px] font-extrabold uppercase tracking-[0.12em] text-hanji-2">{t.missedWords}</h3>
                <ul className="mt-2 border-t border-rule">
                  {missedWords.map((w) => (
                    <li key={w.ko} className="flex items-baseline gap-4 border-b border-rule-soft py-2.5">
                      <span lang="ko" className="w-32 shrink-0 font-serif text-[20px]">
                        {w.ko}
                      </span>
                      <span className="min-w-0 text-[14px] text-hanji-2">{gloss(w)}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
          <footer className="grid shrink-0 gap-3 border-t-2 border-rule pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 md:grid-cols-2 md:px-8 md:pb-7 md:pt-5">
            <button
              type="button"
              onClick={() => {
                playPop();
                onExit();
              }}
              className={`juicy h-12 rounded-2xl text-[15px] font-black md:order-1 ${nextStage ? 'lip-rule border-2 border-rule bg-ink-2 text-hanji-2 hover:text-hanji' : 'lip-accent bg-accent text-white md:col-span-2'}`}
            >
              {t.backToLevels}
            </button>
            {nextStage && (
              <button
                type="button"
                onClick={() => {
                  playPop();
                  onNext();
                }}
                className="juicy lip-accent h-12 rounded-2xl bg-accent text-[15px] font-black text-white md:order-2">
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
              className={`anim-praise relative flex items-center gap-2 whitespace-nowrap rounded-full px-5 py-2.5 text-[19px] font-black ${
                praise.hot ? 'bg-flame text-on-bright shadow-[0_4px_0_var(--color-flame-lip)]' : 'bg-accent text-white shadow-[0_4px_0_var(--color-accent-lip)]'
              }`}
            >
              {praise.hot ? <Flame size={20} strokeWidth={2.4} className="fill-gold" aria-hidden /> : <Sparkles size={20} strokeWidth={2.4} aria-hidden />}
              {praise.text}
              {praise.hot && <Burst colors={['#ffc233', '#14834a', '#1a6cc0', '#ff8a1f']} count={14} radius={90} />}
            </span>
          </div>
        )}
        <div className={`relative min-h-0 flex-1 overflow-y-auto overscroll-contain px-1 pb-4 pt-6 md:px-8 ${kbOpen ? 'md:pt-6' : 'md:pt-8'}`}>
          <div className="relative">
            <div className="flex items-start justify-between gap-4">
              <Prompt word={current.word} lang={settings.promptLang} />
              <span className="mt-0.5 shrink-0 rounded-lg bg-ink px-2.5 py-1 font-serif text-[15px] text-hanji-2" title={current.word.unit}>
                {current.word.unit}
              </span>
            </div>

            <div aria-live="polite" className={kbOpen ? 'mt-5' : 'mt-7'}>
              {phase.kind === 'review' ? (
                <div>
                  {phase.typed ? (
                    <p className="anim-cell mb-4 flex items-center gap-2 text-[15px] font-bold text-danger-text">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-danger text-white">
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
                  <div className="mt-5 flex items-baseline gap-3 border-t-2 border-rule pt-4">
                    <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-hanji-2">{t.correctAnswer}</span>
                    <span lang="ko" className="font-serif text-[34px] leading-none text-accent-text">
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
                    <span lang="ko" className="font-serif text-[21px] text-accent-text">
                      {lastRight.ko}
                    </span>
                  </p>
                )
              )}
            </div>
          </div>
        </div>

        <form
          className={`relative shrink-0 border-t-2 border-rule bg-ink pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 md:rounded-b-[28px] md:bg-transparent md:px-8 ${kbOpen ? 'md:pb-4 md:pt-4' : 'md:pb-6 md:pt-5'}`}
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          {gain > 0 && (
            <span key={gain} aria-hidden className="anim-float pointer-events-none absolute -top-9 right-2 flex items-center gap-1 text-[17px] font-black text-gold-lip md:right-8 dark:text-gold">
              <Star size={17} className="fill-gold" /> {t.xpGained(XP_PER_WORD)}
            </span>
          )}
          <div className="mb-1.5 flex items-center gap-3 text-[11px] font-extrabold uppercase tracking-[0.12em] text-hanji-2">
            <label htmlFor="answer" className={`min-w-0 flex-1 truncate ${phase.kind === 'review' ? 'text-flame-ink' : ''}`}>
              {phase.kind === 'review' ? t.retypeLabel : t.typeInKorean}
            </label>
            <span className="tabular shrink-0 whitespace-nowrap normal-case tracking-normal">{t.remaining(left)}</span>
            {!touch && (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                playPop();
                toggleKeyboard();
              }}
              aria-pressed={kbOpen}
              aria-label={t.keyboard}
              title={t.keyboard}
              className={`-my-1 flex h-8 shrink-0 items-center gap-1.5 rounded-full border-2 px-2.5 text-[12px] font-extrabold normal-case tracking-normal transition-colors ${
                kbOpen ? 'border-accent/50 bg-accent-wash text-accent-text' : 'border-rule bg-ink-2 text-hanji-2 hover:text-hanji'
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
              className={`h-14 min-w-0 flex-1 rounded-2xl border-2 bg-ink-2 px-4 font-serif text-[26px] text-hanji transition-colors duration-300 placeholder:text-hanji-2/70 focus:outline-none ${
                phase.kind === 'review' ? 'border-flame' : 'border-rule focus:border-sky'
              }`}
            />
            <button
              id="answer-submit"
              type="submit"
              onMouseDown={(e) => e.preventDefault()}
              aria-label={phase.kind === 'review' ? t.continue : t.check}
              className="juicy lip-accent flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-accent text-white md:w-auto md:gap-2 md:px-6 md:text-[17px] md:font-black md:uppercase md:tracking-wide"
            >
              <CornerDownLeft size={22} strokeWidth={2.4} aria-hidden />
              <span className="hidden md:inline">{phase.kind === 'review' ? t.continue : t.check}</span>
            </button>
          </div>
          {imeHint && (
            <div role="alert" className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl border-2 border-flame/50 bg-flame-wash px-3 py-2 text-[13px] font-semibold leading-snug text-hanji">
              <p className="min-w-0 flex-1">{t.notHangul}</p>
              {!kbOpen && (
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    playPop();
                    setImeHint(false);
                    setValue('');
                    toggleKeyboard(true);
                  }}
                  className="flex h-9 shrink-0 items-center gap-1.5 rounded-xl bg-accent px-3 text-[13px] font-black text-white hover:bg-accent-text"
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
                  className="juicy lip-rule mt-1 flex h-10 items-center gap-1.5 rounded-xl border-2 border-rule bg-ink-2 px-3.5 text-[13px] font-extrabold text-hanji-2 hover:text-hanji"
                >
                  <SkipForward size={15} aria-hidden /> {t.dontKnow}
                  {!touch && <kbd aria-hidden className="ml-1 hidden rounded-md border border-rule bg-ink-3 px-1.5 py-0.5 font-sans text-[11px] font-bold text-hanji md:inline">Esc</kbd>}
                </button>
              ) : (
                <span />
              )}
              {!kbOpen && (
                <p className="hidden items-center gap-1.5 text-[12px] text-hanji-2 md:flex" aria-hidden>
                  <kbd className="rounded-md border border-rule bg-ink-3 px-1.5 py-0.5 font-sans text-[11px] font-bold text-hanji">Enter ↵</kbd>
                  {phase.kind === 'review' ? t.continue.toLowerCase() : t.enterToCheck}
                </p>
              )}
            </div>
          )}
          {kbOpen && (
            <KoreanKeyboard
              t={t}
              onKey={(key) => {
                playPop();
                pressKey(key);
              }}
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
