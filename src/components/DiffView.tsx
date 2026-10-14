import type { DiffCell, JamoCheck } from '../utils/hangulDiff';
import { decompose } from '../utils/hangulDiff';
import type { Strings } from '../lib/i18n';

interface Props {
  t: Strings;
  cells: DiffCell[];
}

const syllableTone: Record<DiffCell['kind'], string> = {
  exact: 'text-celadon',
  partial: 'text-ochre',
  wrong: 'text-cinnabar-text line-through decoration-2',
  missing: 'text-cinnabar-text/45',
  extra: 'text-cinnabar-text line-through decoration-2',
};

const cellFrame: Record<DiffCell['kind'], string> = {
  exact: 'border-celadon/40 bg-celadon-wash',
  partial: 'border-ochre/50 bg-ochre-wash',
  wrong: 'border-cinnabar-deep/60 bg-cinnabar-wash',
  missing: 'border-dashed border-cinnabar-deep/60',
  extra: 'border-cinnabar-deep/60 bg-cinnabar-wash',
};

function Slot({ check, empty, delay }: { check: JamoCheck; empty: string; delay: number }) {
  const typed = check.typed || empty;
  const expected = check.expected || empty;
  if (check.ok) {
    return (
      <span className="anim-slot flex h-10 flex-1 items-center justify-center text-[15px] font-semibold text-celadon" style={{ animationDelay: `${delay}ms` }}>
        {typed}
      </span>
    );
  }
  return (
    <span
      className="anim-slot flex h-10 flex-1 flex-col items-center justify-center bg-cinnabar-wash leading-none"
      style={{ animationDelay: `${delay}ms` }}
    >
      <span className="text-[12px] text-cinnabar-text line-through decoration-1">{typed}</span>
      <span className="mt-1 text-[15px] font-bold text-hanji">{expected}</span>
    </span>
  );
}

/** The signature move: each syllable splits into 초성 · 중성 · 종성 with a verdict per slot. */
export function DiffView({ t, cells }: Props) {
  const notes: string[] = [];
  cells.forEach((c, i) => {
    const pos = i + 1;
    if (c.kind === 'partial' && c.jamo) {
      for (const j of c.jamo) {
        if (!j.ok) notes.push(`${pos} · ${t.slotWrong(t.slot[j.slot], j.expected || t.noBatchim, j.typed || t.noBatchim)}`);
      }
    } else if (c.kind === 'missing') {
      notes.push(`${pos} · ${c.expected} ${t.missingSyl}`);
    } else if (c.kind === 'extra') {
      notes.push(`${pos} · ${c.typed} ${t.extraSyl}`);
    } else if (c.kind === 'wrong') {
      notes.push(`${pos} · ${c.typed} → ${c.expected}`);
    }
  });

  return (
    <div>
      <ol className="flex flex-wrap gap-2" aria-label={t.youTyped}>
        {cells.map((c, i) => {
          const shown = c.kind === 'missing' ? c.expected : c.typed;
          const isSpace = shown === ' ';
          const strip = c.kind === 'exact' && shown ? decompose(shown) : null;
          return (
            <li
              key={i}
              className={`anim-cell flex w-[5.25rem] flex-col border ${cellFrame[c.kind]} ${isSpace ? 'w-8' : ''}`}
              style={{ animationDelay: `${i * 70}ms` }}
            >
              <span lang="ko" className={`flex h-16 items-center justify-center font-serif text-[40px] font-bold leading-none ${syllableTone[c.kind]}`}>
                {isSpace ? '' : shown}
              </span>
              {c.kind === 'partial' && c.jamo && (
                <span className="flex border-t border-ochre/40" lang="ko">
                  {c.jamo.map((j, k) => (
                    <Slot key={j.slot} check={j} empty="·" delay={i * 70 + 200 + k * 60} />
                  ))}
                </span>
              )}
              {strip && (
                <span className="flex border-t border-celadon/30" lang="ko">
                  {(['cho', 'jung', 'jong'] as const).map((slot, k) => (
                    <Slot key={slot} check={{ slot, expected: strip[slot], typed: strip[slot], ok: true }} empty="·" delay={i * 70 + 200 + k * 60} />
                  ))}
                </span>
              )}
              {(c.kind === 'wrong' || c.kind === 'missing' || c.kind === 'extra') && (
                <span className="flex h-10 items-center justify-center border-t border-cinnabar-deep/40 text-[12px] font-semibold text-hanji">
                  {c.kind === 'wrong' ? <span lang="ko">→ {c.expected}</span> : c.kind === 'missing' ? t.missingSyl : t.extraSyl}
                </span>
              )}
            </li>
          );
        })}
      </ol>
      {notes.length > 0 && (
        <ul className="mt-3 space-y-1 text-[13px] leading-snug text-hanji-2">
          {notes.map((n, i) => (
            <li key={i}>{n}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
