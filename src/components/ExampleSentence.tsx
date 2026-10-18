import { useState, type ReactNode } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import type { Example, GlossLang } from '../types';
import type { Strings } from '../lib/i18n';
import { playPop } from '../lib/soundEngine';

interface Props {
  t: Strings;
  example: Example;
  /** The word the sentence illustrates (may list "/" alternatives); its stem is marked in the sentence when found. */
  word: string;
  /** Translations to reveal: the learner's prompt language, or all three in "all" mode. */
  langs: GlossLang[];
  /** One quiet line, for the recap under a right answer while the next word is already up. */
  compact?: boolean;
}

/**
 * What to look for in the sentence, most specific first: the form itself (so 캐나다 stays whole), then its
 * stem ("(이름을)부르다" → "부르", "이야기하다" → "이야기"). "~에 대해서" → "에 대해서".
 */
function stems(word: string): string[] {
  return word
    .split('/')
    .map((f) => f.replace(/\([^)]*\)/g, '').replace(/^~/, '').trim())
    .flatMap((f) => [f, f.length > 2 && f.endsWith('하다') ? f.slice(0, -2) : f.length > 1 && f.endsWith('다') ? f.slice(0, -1) : f])
    .filter(Boolean);
}

/** The sentence with the first match of the word marked; conjugations that change the stem (묻다 → 물어요) just stay unmarked. */
function marked(sentence: string, word: string): ReactNode {
  for (const s of stems(word)) {
    // One-syllable words only match at the start of a token, so 성 doesn't light up inside 성함.
    const re = new RegExp(s.length === 1 ? `(^|[\\s'"‘“«(])(${s})` : `()(${s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`);
    const m = re.exec(sentence);
    if (!m) continue;
    const at = m.index + m[1].length;
    return (
      <>
        {sentence.slice(0, at)}
        <span className="text-accent-text">{m[2]}</span>
        {sentence.slice(at + m[2].length)}
      </>
    );
  }
  return sentence;
}

/** An example sentence under a revealed word; the translation stays hidden until asked for, so the Korean is read first. */
export function ExampleSentence({ t, example, word, langs, compact = false }: Props) {
  const [open, setOpen] = useState(false);
  const shown = langs.filter((l) => example[l]);
  const lines = shown.length ? shown : (['uz', 'ru', 'en'] as const).filter((l) => example[l]).slice(0, 1);
  const label = open ? t.hideTranslation : t.showTranslation;

  const toggle = lines.length > 0 && (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => {
        playPop();
        setOpen((o) => !o);
      }}
      aria-expanded={open}
      aria-label={label}
      title={label}
      className={`grid shrink-0 place-items-center rounded-full border-2 transition-colors ${compact ? 'size-7' : 'size-8 md:size-9'} ${
        open ? 'border-accent/50 bg-accent-wash text-accent-text' : 'border-rule bg-ink-2 text-hanji-2 hover:text-hanji'
      }`}
    >
      {open ? <EyeOff size={compact ? 14 : 16} aria-hidden /> : <Eye size={compact ? 14 : 16} aria-hidden />}
    </button>
  );

  const translations = open && (
    <div className={compact ? 'anim-cell mt-1 space-y-0.5' : 'anim-cell mt-2 space-y-1 border-t border-rule-soft pt-2'}>
      {lines.map((l) => (
        <p key={l} className={`flex items-baseline gap-2.5 leading-snug text-hanji-2 ${compact ? 'text-[13px]' : 'text-[14px]'}`}>
          {lines.length > 1 && <span className="w-5 shrink-0 text-[10px] font-bold uppercase tracking-[0.12em] text-accent-text">{l}</span>}
          <span lang={l}>{example[l]}</span>
        </p>
      ))}
    </div>
  );

  if (compact) {
    return (
      <figure className="anim-cell mt-1.5 pl-6" aria-label={t.example}>
        <div className="flex items-center gap-2">
          <p lang="ko" className="min-w-0 flex-1 truncate font-serif text-[16px] text-hanji-2">
            {marked(example.ko, word)}
          </p>
          {toggle}
        </div>
        {translations}
      </figure>
    );
  }

  return (
    <figure className="anim-cell mt-3 rounded-2xl border-2 border-rule-soft px-3 py-2 md:mt-4 md:px-3.5 md:py-3">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <figcaption className="text-[11px] font-bold uppercase tracking-[0.12em] text-hanji-2">{t.example}</figcaption>
          <p lang="ko" className="mt-0.5 font-serif text-[17px] leading-snug text-hanji md:text-[19px]">
            {marked(example.ko, word)}
          </p>
        </div>
        {toggle}
      </div>
      {translations}
    </figure>
  );
}
