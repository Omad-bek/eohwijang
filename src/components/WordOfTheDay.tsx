import { useMemo, useState } from 'react';
import { Eye } from 'lucide-react';
import type { Book, GlossLang, PromptLang } from '../types';
import type { Strings } from '../lib/i18n';
import { dayKey } from '../lib/activity';
import { firstForm, wordOfDay } from '../lib/wordOfDay';
import { decompose } from '../utils/hangulDiff';

interface Props {
  t: Strings;
  book: Book;
  promptLang: PromptLang;
  /** Fallback meaning language when prompts show all three. */
  uiGloss: GlossLang;
  now: number;
}

/** Each slot keeps one color everywhere: initial sky, vowel flame, final (받침) gold. */
const SLOT = {
  cho: 'bg-sky text-white',
  jung: 'bg-flame text-on-bright',
  jong: 'bg-gold text-on-bright',
} as const;

const revealKey = (bookId: string, now: number) => `project-vocab:wotd:${bookId}:${dayKey(now)}`;

function readRevealed(key: string): boolean {
  try {
    return localStorage.getItem(key) === '1';
  } catch {
    return false;
  }
}

/**
 * The home screen's centerpiece: today's word in heavy display Hangul, broken into its jamo,
 * with the meaning held back until the learner has had a moment to guess it.
 */
export function WordOfTheDay({ t, book, promptLang, uiGloss, now }: Props) {
  const day = dayKey(now);
  const w = useMemo(() => wordOfDay(book, now), [book, day]);
  const key = revealKey(book.id, now);
  const [revealedKey, setRevealedKey] = useState<string | null>(() => (readRevealed(key) ? key : null));
  if (!w) return null;

  const revealed = revealedKey === key;
  const reveal = () => {
    setRevealedKey(key);
    try {
      localStorage.setItem(key, '1');
    } catch {
      /* per-device convenience only */
    }
  };

  const ko = firstForm(w.ko);
  const syllables = Array.from(ko).map((ch) => ({ ch, j: decompose(ch) }));
  const length = Array.from(ko.replace(/\s/g, '')).length;
  const cap = length <= 2 ? 190 : length <= 4 ? 150 : 110;
  const mainLang: GlossLang = promptLang !== 'all' && w[promptLang] ? promptLang : w[uiGloss] ? uiGloss : w.uz ? 'uz' : w.ru ? 'ru' : 'en';
  const others = (['uz', 'ru', 'en'] as const).filter((l) => l !== mainLang && w[l]);
  const usedSlots = (['cho', 'jung', 'jong'] as const).filter((s) => syllables.some((x) => x.j?.[s]));

  return (
    <section
      aria-labelledby="wotd-title"
      className="anim-rise @container relative isolate flex h-full flex-col items-center justify-center overflow-hidden rounded-[28px] border-2 border-rule bg-ink-2 px-4 pb-6 pt-5 text-center shadow-[0_5px_0_var(--color-rule)] sm:px-6"
    >
      <span aria-hidden className="anim-drift absolute -left-6 top-12 -z-10 size-28 rounded-full bg-gold/80 sm:size-36 dark:bg-gold/30" />
      <span aria-hidden className="anim-drift absolute -right-4 top-6 -z-10 size-20 rotate-12 rounded-[22px] bg-accent/85 sm:size-24 dark:bg-accent/45" style={{ animationDelay: '-3s' }} />
      <span aria-hidden className="anim-drift absolute -right-6 bottom-6 -z-10 h-8 w-24 -rotate-12 rounded-full bg-flame/70 sm:w-32 dark:bg-flame/35" style={{ animationDelay: '-6s' }} />

      <h2 id="wotd-title" className="text-[15px] font-extrabold text-flame-ink">
        <span lang="ko">오늘의 단어</span>
        {t.wordOfDay !== '오늘의 단어' && <span> · {t.wordOfDay}</span>}
      </h2>

      <p lang="ko" className="mt-2 max-w-full font-display leading-[0.95] tracking-[-0.02em] break-keep" style={{ fontSize: `min(${Math.floor(84 / Math.max(length, 1))}cqi, ${cap}px)` }}>
        {ko}
      </p>

      <ul className="mt-5 flex flex-wrap justify-center gap-2.5" aria-label={`${t.slot.cho} · ${t.slot.jung} · ${t.slot.jong}`}>
        {syllables
          .filter((x) => x.j)
          .map(({ ch, j }, i) => (
            <li key={i} className="anim-rise flex gap-1 rounded-2xl bg-ink-2 p-1.5 shadow-[0_3px_0_var(--color-rule)] ring-2 ring-rule" style={{ ['--i' as string]: i + 2 }} title={ch}>
              {(['cho', 'jung', 'jong'] as const)
                .filter((s) => j![s])
                .map((s) => (
                  <span key={s} lang="ko" className={`grid size-9 place-items-center rounded-xl text-[19px] font-black ${SLOT[s]}`}>
                    {j![s]}
                  </span>
                ))}
            </li>
          ))}
      </ul>
      <ul className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1 text-[12px] font-bold text-hanji-2" aria-hidden>
        {usedSlots.map((s) => (
          <li key={s} className="flex items-center gap-1.5">
            <span className={`size-2.5 rounded-full ${SLOT[s].split(' ')[0]}`} />
            {t.slot[s]}
          </li>
        ))}
      </ul>

      <div className="mt-5 flex min-h-[60px] w-full items-start justify-center">
        {revealed ? (
          <div className="anim-pop max-w-md">
            <p lang={mainLang} className="text-[22px] font-black leading-snug text-hanji">
              {w[mainLang]}
            </p>
            {others.length > 0 && (
              <p className="mt-1 flex flex-wrap justify-center gap-x-3 text-[15px] font-bold text-hanji-2">
                {others.map((l) => (
                  <span key={l} lang={l}>
                    {w[l]}
                  </span>
                ))}
              </p>
            )}
            <p className="mt-2 text-[12px] font-bold text-hanji-2">
              {book.title} · <span className="font-serif text-[13px]">{w.unit}</span>
            </p>
          </div>
        ) : (
          <button type="button" onClick={reveal} className="juicy lip-sky flex h-12 items-center gap-2 rounded-2xl bg-sky px-6 text-[16px] font-black text-white">
            <Eye size={19} strokeWidth={2.6} aria-hidden />
            {t.whatMeans}
          </button>
        )}
      </div>
    </section>
  );
}
