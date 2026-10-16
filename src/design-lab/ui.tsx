import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { CellKind, DiffResult } from '../utils/hangulDiff';
import { decompose } from '../utils/hangulDiff';
import type { LabQuiz } from './quiz';

/**
 * Answer field wiring shared by every concept: Enter checks (never mid-syllable while the
 * Korean IME is composing), Escape is "don't know", the field clears after each verdict.
 */
export function useAnswerField(quiz: LabQuiz) {
  const [value, setValue] = useState('');
  const composing = useRef(false);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (quiz.phase.kind !== 'done') ref.current?.focus({ preventScroll: true });
  }, [quiz.phase.kind, quiz.current]);

  const check = () => {
    if (quiz.submit(value)) setValue('');
  };

  const props = {
    ref,
    value,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value),
    onCompositionStart: () => {
      composing.current = true;
    },
    onCompositionEnd: () => {
      composing.current = false;
    },
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
      const busy = composing.current || e.nativeEvent.isComposing || e.keyCode === 229;
      if (busy) return;
      if (e.key === 'Enter') {
        e.preventDefault();
        check();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        quiz.skip();
      }
    },
    lang: 'ko',
    // The shake wrapper remounts the field; take focus back on every mount.
    autoFocus: true,
    autoComplete: 'off',
    autoCorrect: 'off',
    autoCapitalize: 'off',
    spellCheck: false,
    enterKeyHint: 'done' as const,
  };

  return { value, props, check, focus: () => ref.current?.focus({ preventScroll: true }) };
}

/** Progress ring: a track and an arc that eases to its value. */
export function Ring({
  value,
  max,
  size,
  stroke,
  track,
  color,
  children,
  label,
}: {
  value: number;
  max: number;
  size: number;
  stroke: number;
  track: string;
  color: string;
  children?: ReactNode;
  label: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const share = max ? Math.min(1, value / max) : 0;
  return (
    <div className="relative grid shrink-0 place-items-center" style={{ width: size, height: size }} role="img" aria-label={label}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - share)}
          style={{ transition: 'stroke-dashoffset 900ms cubic-bezier(0.16, 1, 0.3, 1)' }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">{children}</div>
    </div>
  );
}

/** The right answer, one syllable per cell, each cell toned by how the learner's attempt matched it. */
export function DiffWord({ result, tone, cellClass }: { result: DiffResult; tone: Record<CellKind, string>; cellClass: string }) {
  const cells = result.cells.filter((c) => c.kind !== 'extra');
  return (
    <span className="inline-flex flex-wrap gap-1.5" aria-label={result.target}>
      {cells.map((c, i) => (
        <span key={i} aria-hidden className={`${cellClass} ${tone[c.kind]} anim-pop`} style={{ animationDelay: `${i * 60}ms` }}>
          {c.expected === ' ' ? ' ' : c.expected}
        </span>
      ))}
    </span>
  );
}

/** 초성 · 중성 · 종성 of each syllable, for the jamo breakdowns. */
export function jamoOf(word: string) {
  return Array.from(word)
    .map((ch) => ({ ch, j: decompose(ch) }))
    .filter((x) => x.j);
}

/** A ring of particles flying out from the center; remount (via key) to fire again. */
export function Burst({ colors, count = 12, radius = 70 }: { colors: string[]; count?: number; radius?: number }) {
  return (
    <span aria-hidden className="pointer-events-none absolute inset-0 grid place-items-center">
      {Array.from({ length: count }, (_, i) => {
        const a = (i / count) * Math.PI * 2;
        const d = radius * (0.75 + ((i * 37) % 10) / 20);
        return (
          <span
            key={i}
            className="anim-burst absolute block size-2.5 rounded-full"
            style={{ background: colors[i % colors.length], ['--dx' as string]: `${Math.cos(a) * d}px`, ['--dy' as string]: `${Math.sin(a) * d}px` }}
          />
        );
      })}
    </span>
  );
}
