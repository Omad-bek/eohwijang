/**
 * Copy, sample data and shared behavior for the Welcome variants (A, B, C) in the design lab, so
 * the variants differ only in design. Every Korean word shown comes from the bundled 1A book.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { GraduationCap, Flame, Keyboard, Languages, Layers, Quote, SpellCheck, WifiOff, type LucideIcon } from 'lucide-react';
import { VOCAB_1A } from '../../data/vocab1A';
import { playCombo, playCorrect, playPop, playWrong } from '../../lib/soundEngine';
import { typeJamo } from '../../utils/hangulInput';

export const ICON_SRC = `${import.meta.env.BASE_URL}favicon.svg`;

export const GITHUB_URL = 'https://github.com/Omad-bek/eohwijang';

export const HERO = {
  eyebrow: 'From SNU 1A to advanced · All textbooks covered',
  lead: 'Stop memorizing.',
  accent: 'Start feeling the language.',
  sub: 'The most beautiful, textbook-accurate way to master Korean.',
  /** The prominent textbook badge in the hero. */
  badge: 'Based on SNU Korean Textbooks',
  badgeSub: 'From 1A to advanced, every book covered',
  cta: 'Start learning free',
  note: 'Free · No account · Works offline',
};

export interface Benefit {
  icon: LucideIcon;
  kicker: string;
  title: string;
  body: string;
}

/** 0–2 and 6–7 carry the page with visuals; 3–5 are the supporting details. New entries go at the end so indices stay stable. */
export const BENEFITS: Benefit[] = [
  {
    icon: GraduationCap,
    kicker: 'Textbook-true',
    title: 'Ace your classes.',
    body: 'Perfectly synced with the SNU Korean textbooks, from 1A all the way to advanced, so you only study exactly what’s on tomorrow’s test. No filler words, no guessing which list matters.',
  },
  {
    icon: Flame,
    kicker: 'Hard to put down',
    title: 'Get addicted to learning.',
    body: 'Dark mode, Lo-Fi sounds and satisfying streaks. Like your favorite game, but for your brain.',
  },
  {
    icon: Quote,
    kicker: 'In context',
    title: 'Words that live in sentences.',
    body: 'Words come with short sentences pitched at your level, so you remember how a word is used, not only what it means.',
  },
  {
    icon: Languages,
    kicker: 'Your language',
    title: 'Learn from the language you think in.',
    body: 'Uzbek, Russian and English prompts, all treated as equals. And no romanization crutches, ever.',
  },
  {
    icon: SpellCheck,
    kicker: 'Letter by letter',
    title: 'See exactly what slipped.',
    body: 'Missed a 받침? You see the exact jamo that went wrong, so a typo turns into memory instead of frustration.',
  },
  {
    icon: WifiOff,
    kicker: 'Offline',
    title: 'Study with zero bars.',
    body: 'Once it’s loaded, it keeps working on the subway, on the plane, and in the library basement.',
  },
  {
    icon: Keyboard,
    kicker: 'Built-in keyboard',
    title: 'Built-in Hangul keyboard.',
    body: 'No need to mess with system language settings. Type Korean instantly, pain-free for beginners.',
  },
  {
    icon: Layers,
    kicker: 'Your own decks',
    title: 'Build your own collections.',
    body: 'Not limited to the textbook: add your own words, paste or import a list, create custom decks, and study exactly what you want.',
  },
];

export const BOOKS = ['1A', '1B', '2A'];

/** Every SNU Korean level, 1A to 6B. */
export const LEVELS = [1, 2, 3, 4, 5, 6].flatMap((n) => [`${n}A`, `${n}B`]);

export const STORY = {
  eyebrow: 'Our story',
  title: 'Made by a student who sits the same tests.',
  body: [
    'I’m an undergraduate at Inha University (인하대학교), and I learned fast that Korean vocabulary tests here are brutal. They demand 100% perfect spelling. Knowing how a word sounds in your head isn’t enough: one wrong vowel or a missing 받침, and the answer is marked wrong. Write 학셍 instead of 학생, and that point is gone.',
    'Flashcards never fixed that, because they only ask whether you recognize a word. So I built 어휘장 to make you type every single letter from memory, and to show you exactly which jamo slipped, until each word comes out perfect every time. No surprises on test day.',
  ],
  sign: 'Built between lectures at Inha University, Incheon.',
};

/** Demo-only engagement numbers: the landing page has no learner yet. */
export const DEMO_STREAK = 12;

export const DISCLAIMER = 'Not affiliated with Seoul National University or its publisher.';

/* ---------- The "Try it now" word: 호주 (Australia), from 1A unit 1 ---------- */

const HOJU = VOCAB_1A.find((w) => w.ko === '호주');

export const DEMO_WORD = {
  ko: '호주',
  gloss: { en: HOJU?.en ?? 'Australia', uz: HOJU?.uz ?? 'Avstraliya', ru: HOJU?.ru ?? 'Австралия' },
  example: HOJU?.example ?? { ko: '호주는 아주 커요.', en: 'Australia is very big.' },
};

/** 호주 = (ㅎ + ㅗ) (ㅈ + ㅜ), one group per syllable. */
const GROUPS = [
  ['ㅎ', 'ㅗ'],
  ['ㅈ', 'ㅜ'],
];
const SEQUENCE = GROUPS.flat();
/** The tray order, shuffled once so the first tap is a small search. */
const TRAY = ['ㅈ', 'ㅎ', 'ㅜ', 'ㅗ'];

/**
 * The playable word block: tap jamo tiles in order to build 호주. Each syllable is composed with
 * the app's own 두벌식 engine, one group at a time, so the 받침 never hops mid-demo (호 + ㅈ stays
 * 호ㅈ instead of 홎). Sounds go through the app's sound engine and follow the learner's mute.
 */
export function useJamoDemo() {
  const [step, setStep] = useState(0);
  const [miss, setMiss] = useState<string | null>(null);
  const [round, setRound] = useState(0);
  const timer = useRef(0);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const syllables = GROUPS.map((g, gi) => g.slice(0, Math.max(0, step - gi * 2)).reduce(typeJamo, ''));
  const active = Math.min(GROUPS.length - 1, Math.floor(step / 2));
  // The equation for the syllable being built: "ㅎ + ㅗ = 호".
  const parts = step === 0 ? [] : GROUPS[step <= 2 ? 0 : 1].slice(0, step <= 2 ? step : step - 2);
  const equation = { parts, result: parts.length === 2 ? syllables[step <= 2 ? 0 : 1] : '' };
  const done = step === SEQUENCE.length;

  const tap = useCallback(
    (jamo: string) => {
      if (done) return;
      if (jamo !== SEQUENCE[step]) {
        playWrong();
        setMiss(jamo);
        window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => setMiss(null), 450);
        return;
      }
      const next = step + 1;
      if (next === SEQUENCE.length) playCombo();
      else if (next % 2 === 0) playCorrect(next);
      else playPop();
      setStep(next);
    },
    [done, step],
  );

  const reset = useCallback(() => {
    playPop();
    setStep(0);
    setRound((r) => r + 1);
  }, []);

  return {
    tray: TRAY.map((jamo) => ({ jamo, used: SEQUENCE.indexOf(jamo) < step })),
    syllables,
    active,
    equation,
    next: SEQUENCE[step] ?? null,
    step,
    total: SEQUENCE.length,
    done,
    miss,
    /** Changes on every replay, for keying entrance motion. */
    round,
    tap,
    reset,
  };
}

/* ---------- Motion helpers ---------- */

const reduced = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Pointer and scroll parallax for a hero: writes --mx / --my (-1..1, pointer position over the
 * element) and --sy (pixels scrolled past its top) as CSS variables, once per frame. Layers read
 * them in their transforms. Off under reduced motion.
 */
export function useParallax<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || reduced()) return;
    let raf = 0;
    let mx = 0;
    let my = 0;
    const apply = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', mx.toFixed(3));
      el.style.setProperty('--my', my.toFixed(3));
      el.style.setProperty('--sy', Math.max(0, -r.top).toFixed(0));
    };
    const queue = () => {
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const r = el.getBoundingClientRect();
      mx = ((e.clientX - r.left) / r.width) * 2 - 1;
      my = ((e.clientY - r.top) / r.height) * 2 - 1;
      queue();
    };
    window.addEventListener('pointermove', onMove);
    document.addEventListener('scroll', queue, true);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('scroll', queue, true);
    };
  }, []);
  return ref;
}

/** A gentle 3D tilt toward the pointer, for cards. Mouse only; off under reduced motion. */
export function useTilt<T extends HTMLElement>(max = 6) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || reduced()) return;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `perspective(900px) rotateX(${(-y * max).toFixed(2)}deg) rotateY(${(x * max).toFixed(2)}deg) translateY(-4px)`;
    };
    const onLeave = () => {
      el.style.transform = '';
    };
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
    };
  }, [max]);
  return ref;
}

/**
 * How far an element has travelled through the viewport, 0 (its top just entering the lower
 * edge) to 1 (its bottom passing the upper third). Drives scroll-lit text. Reduced motion pins it to 1.
 */
export function useScrollProgress<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [p, setP] = useState(() => (reduced() ? 1 : 0));
  useEffect(() => {
    const el = ref.current;
    if (!el || reduced()) return;
    let raf = 0;
    const apply = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const v = (vh * 0.9 - r.top) / (r.height + vh * 0.45);
      setP(Math.min(1, Math.max(0, v)));
    };
    const queue = () => {
      if (!raf) raf = requestAnimationFrame(apply);
    };
    apply();
    document.addEventListener('scroll', queue, true);
    window.addEventListener('resize', queue);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('scroll', queue, true);
      window.removeEventListener('resize', queue);
    };
  }, []);
  return { ref, p };
}

/** Counts up to `to` once `run` turns true. */
export function useCountUp(to: number, run: boolean, ms = 900) {
  const [n, setN] = useState(() => (reduced() ? to : 0));
  useEffect(() => {
    if (!run || reduced()) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const k = Math.min(1, (t - t0) / ms);
      setN(Math.round(to * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, run, ms]);
  return n;
}

/** The install suggestion arrives a moment after the hero lands; dismissing hides it for this visit. */
export function useInstallBanner(delay = 1400) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const id = window.setTimeout(() => setShow(true), delay);
    return () => window.clearTimeout(id);
  }, [delay]);
  return { show, dismiss: () => setShow(false) };
}
