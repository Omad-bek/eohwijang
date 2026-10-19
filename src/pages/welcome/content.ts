/**
 * Copy and sample data shared by the Welcome variants (A, B, C) in the design lab, so the
 * variants differ only in design. Sample prompts and the example sentence come from vocab1A.
 */
import { useEffect, useState } from 'react';
import { BookOpen, Leaf, Quote, type LucideIcon } from 'lucide-react';

export const ICON_SRC = `${import.meta.env.BASE_URL}favicon.svg`;

export const HERO = {
  eyebrow: 'Korean vocabulary · SNU 1A–2A',
  lead: 'Master Korean vocabulary.',
  accent: 'Beautifully.',
  sub: 'Type each word from memory in small, calm blocks. Prompts in Uzbek, Russian or English, and every mistake shown down to the letter.',
  cta: 'Start Learning Now',
  note: 'Free · No account needed · Works offline',
};

export const FEATURES: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: BookOpen,
    title: 'Curated for Textbooks',
    body: 'Every word follows the SNU Korean course, unit by unit, so what you drill tonight is what your class covers tomorrow.',
  },
  {
    icon: Leaf,
    title: 'Zen & Gamified',
    body: 'Soft sounds, a daily streak and a night mode for late study. Calm enough to focus, rewarding enough to come back.',
  },
  {
    icon: Quote,
    title: 'Contextual Examples',
    body: 'Each word comes with a short, grammar-accurate sentence, so you learn how it is used, not just what it means.',
  },
];

export const BOOKS = ['1A', '1B', '2A'];

/** 학생 = ㅎㅏㄱ + ㅅㅐㅇ */
export const SAMPLE = {
  prompts: [
    ['EN', 'student'],
    ['UZ', "o'quvchi, talaba"],
    ['RU', 'ученик, студент'],
  ],
  cells: [
    { syl: '학', jamo: ['ㅎ', 'ㅏ', 'ㄱ'] },
    { syl: '생', jamo: ['ㅅ', 'ㅐ', 'ㅇ'] },
  ],
  example: { before: '네, 저는 ', word: '학생', after: '이에요.', en: 'Yes, I’m a student.' },
};

export const DISCLAIMER = 'Not affiliated with Seoul National University or its publisher.';

/** The install suggestion arrives a moment after the hero lands; dismissing hides it for this visit. */
export function useInstallBanner(delay = 1400) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const id = window.setTimeout(() => setShow(true), delay);
    return () => window.clearTimeout(id);
  }, [delay]);
  return { show, dismiss: () => setShow(false) };
}
