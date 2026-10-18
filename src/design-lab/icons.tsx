/**
 * Icon lab: app icon concepts for 어휘장, drawn as inline SVG on a 100×100 canvas.
 * Hangul is built from stroke paths, not a font, so every concept renders the same as a
 * favicon data URL, a PNG export or inline in the page.
 */
import { Children, isValidElement, useId, type ReactElement, type ReactNode } from 'react';

export type Category = 'Typographic' | 'Literary' | 'Gamified' | 'Mascot' | 'Abstract';

export interface Concept {
  id: string;
  name: string;
  category: Category;
  blurb: string;
  art: (p: (key: string) => string) => ReactNode;
}

// Palette, from the app's tokens (src/index.css).
const C = {
  cream: '#fff8ee',
  paper: '#fffdf8',
  brown: '#3b2a1e',
  green: '#1ea85f',
  accent: '#14834a',
  greenLip: '#0d5f34',
  flame: '#ff8a1f',
  flameLip: '#c25a00',
  gold: '#ffc233',
  goldLip: '#d99a00',
  sky: '#1a6cc0',
  skyLip: '#12528f',
  indigo: '#5b54d6',
  indigoLip: '#3d37a8',
};

/* ---------- Hangul as strokes (glyph box 0..100, round caps) ---------- */

const GLYPHS = {
  어: { d: 'M17 50a17 17 0 1 0 34 0a17 17 0 1 0 -34 0M66 50H82M82 12V88', sw: 12 },
  휘: { d: 'M30 7H40M18 20H52M27.5 40a7.5 7.5 0 1 0 15 0a7.5 7.5 0 1 0 -15 0M10 64H60M35 64V90M80 8V92', sw: 10 },
  장: { d: 'M12 12H44M28 12C27 26 20 36 10 42M30 24C34 32 40 38 48 41M66 6V56M66 30H82M24 77a20 12 0 1 0 40 0a20 12 0 1 0 -40 0', sw: 10 },
  ㅇ: { d: 'M20 50a30 30 0 1 0 60 0a30 30 0 1 0 -60 0', sw: 13 },
  ㅓ: { d: 'M64 14V86M30 50H64', sw: 13 },
} as const;

type GlyphKey = keyof typeof GLYPHS;

/** A puffy glyph: a solid lip below, the face, and a thin gloss line along each stroke. */
function Glyph({ ch, x, y, size, color, lip, gloss = 0.45, weight = 1, opacity, filter }: {
  ch: GlyphKey;
  x: number;
  y: number;
  size: number;
  color: string;
  lip?: string;
  gloss?: number;
  weight?: number;
  opacity?: number;
  filter?: string;
}) {
  const { d, sw } = GLYPHS[ch];
  const w = sw * weight;
  return (
    <g transform={`translate(${x} ${y}) scale(${size / 100})`} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={opacity} filter={filter}>
      {lip && <path d={d} stroke={lip} strokeWidth={w} transform={`translate(0 ${w * 0.42})`} />}
      <path d={d} stroke={color} strokeWidth={w} />
      {gloss > 0 && <path d={d} stroke="#fff" strokeOpacity={gloss} strokeWidth={w * 0.3} transform={`translate(${-w * 0.14} ${-w * 0.2})`} />}
    </g>
  );
}

/* ---------- Small drawing helpers ---------- */

function LG({ id, from, to, x2 = 0, y2 = 1 }: { id: string; from: string; to: string; x2?: number; y2?: number }) {
  return (
    <linearGradient id={id} x1="0" y1="0" x2={x2} y2={y2}>
      <stop offset="0" stopColor={from} />
      <stop offset="1" stopColor={to} />
    </linearGradient>
  );
}

function Blur({ id, sd }: { id: string; sd: number }) {
  return (
    <filter id={id} x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation={sd} />
    </filter>
  );
}

/** A flat slab that sits on a solid lip, like the app's tactile buttons. */
function Slab({ x, y, w, h, rx, fill, lip, dy = 4, transform, stroke }: {
  x: number;
  y: number;
  w: number;
  h: number;
  rx: number;
  fill: string;
  lip?: string;
  dy?: number;
  transform?: string;
  stroke?: string;
}) {
  return (
    <g transform={transform}>
      {lip && <rect x={x} y={y + dy} width={w} height={h} rx={rx} fill={lip} />}
      <rect x={x} y={y} width={w} height={h} rx={rx} fill={fill} stroke={stroke} strokeWidth={stroke ? 1.2 : undefined} />
    </g>
  );
}

const sparkle = (cx: number, cy: number, r: number) =>
  `M${cx} ${cy - r}Q${cx} ${cy} ${cx + r} ${cy}Q${cx} ${cy} ${cx} ${cy + r}Q${cx} ${cy} ${cx - r} ${cy}Q${cx} ${cy} ${cx} ${cy - r}Z`;

function star(cx: number, cy: number, R: number, r: number) {
  let d = '';
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rad = i % 2 ? r : R;
    d += `${i ? 'L' : 'M'}${(cx + rad * Math.cos(a)).toFixed(2)} ${(cy + rad * Math.sin(a)).toFixed(2)}`;
  }
  return `${d}Z`;
}

/** An open book in a 100×60 box, scaled to width `w`. */
function Book({ x, y, w, cover = C.accent, lip = C.greenLip, lines = true }: { x: number; y: number; w: number; cover?: string; lip?: string; lines?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${w / 100})`}>
      <path d="M0 14Q25 6 50 14Q75 6 100 14V60Q75 52 50 60Q25 52 0 60Z" fill={lip} transform="translate(0 4)" />
      <path d="M0 10Q25 2 50 10Q75 2 100 10V56Q75 48 50 56Q25 48 0 56Z" fill={cover} />
      <path d="M5 7Q28 -1 50 7V52Q28 44 5 52Z" fill={C.paper} />
      <path d="M50 7Q72 -1 95 7V52Q72 44 50 52Z" fill="#fff6e8" />
      <path d="M50 7V52" stroke="#e3d2b8" strokeWidth="1.6" />
      {lines && (
        <g stroke="#e8dcc8" strokeWidth="2.6" strokeLinecap="round" fill="none">
          <path d="M14 20Q28 15 42 19M14 30Q28 25 42 29M14 40Q28 35 36 38" />
          <path d="M58 19Q72 15 86 20M58 29Q72 25 86 30M58 39Q68 35 80 39" />
        </g>
      )}
    </g>
  );
}

/** Soft radial highlight from the top-left: the "lit from above" sheen on 3D concepts. */
function Shine({ p, opacity = 0.5 }: { p: (k: string) => string; opacity?: number }) {
  return (
    <>
      <defs>
        <radialGradient id={p('shine')} cx="28%" cy="0%" r="85%">
          <stop offset="0" stopColor="#fff" stopOpacity={opacity} />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="100" height="100" fill={`url(#${p('shine')})`} />
    </>
  );
}

function Bg({ p, from, to, x2 = 0.4, y2 = 1 }: { p: (k: string) => string; from: string; to: string; x2?: number; y2?: number }) {
  return (
    <>
      <defs>
        <LG id={p('bg')} from={from} to={to} x2={x2} y2={y2} />
      </defs>
      <rect width="100" height="100" fill={`url(#${p('bg')})`} />
    </>
  );
}

function Shadow({ p, cx, cy, rx, ry = 4, opacity = 0.14 }: { p: (k: string) => string; cx: number; cy: number; rx: number; ry?: number; opacity?: number }) {
  return (
    <>
      <defs>
        <Blur id={p('shadow')} sd={2.2} />
      </defs>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={C.brown} opacity={opacity} filter={`url(#${p('shadow')})`} />
    </>
  );
}

/** Tiger face for the mascot concepts, centered on (cx, cy) with face radius r. */
function TigerFace({ p, cx, cy, r, glasses = false }: { p: (k: string) => string; cx: number; cy: number; r: number; glasses?: boolean }) {
  const s = r / 30;
  return (
    <g transform={`translate(${cx} ${cy}) scale(${s})`}>
      <defs>
        <radialGradient id={p('fur')} cx="40%" cy="30%" r="75%">
          <stop offset="0" stopColor="#ffb05c" />
          <stop offset="1" stopColor="#f47a12" />
        </radialGradient>
      </defs>
      {/* ears */}
      <circle cx="-22" cy="-21" r="10" fill={C.flameLip} transform="translate(0 3)" />
      <circle cx="22" cy="-21" r="10" fill={C.flameLip} transform="translate(0 3)" />
      <circle cx="-22" cy="-21" r="10" fill="#ff9a35" />
      <circle cx="22" cy="-21" r="10" fill="#ff9a35" />
      <circle cx="-22" cy="-21" r="5" fill="#ffe0bf" />
      <circle cx="22" cy="-21" r="5" fill="#ffe0bf" />
      {/* head */}
      <ellipse cx="0" cy="4" rx="32" ry="27" fill={C.flameLip} />
      <ellipse cx="0" cy="0" rx="32" ry="27" fill={`url(#${p('fur')})`} />
      <g stroke={C.brown} strokeWidth="3.4" strokeLinecap="round" fill="none">
        <path d="M0 -25V-16M-8 -23L-6 -15M8 -23L6 -15" />
        <path d="M-31 -3H-22M-30 6H-23M31 -3H22M30 6H23" />
      </g>
      {/* muzzle */}
      <ellipse cx="0" cy="11" rx="13" ry="9.5" fill="#fff6ea" />
      <path d="M-4 6.5H4L0 10.5Z" fill={C.brown} stroke={C.brown} strokeWidth="2" strokeLinejoin="round" />
      <path d="M0 11Q-3 16 -7 13.5M0 11Q3 16 7 13.5" stroke={C.brown} strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <circle cx="-15" cy="9" r="3" fill="#ff7d7d" opacity="0.35" />
      <circle cx="15" cy="9" r="3" fill="#ff7d7d" opacity="0.35" />
      {glasses ? (
        <>
          <circle cx="-11" cy="-5" r="7.5" fill="#fff" fillOpacity="0.6" stroke={C.brown} strokeWidth="2.4" />
          <circle cx="11" cy="-5" r="7.5" fill="#fff" fillOpacity="0.6" stroke={C.brown} strokeWidth="2.4" />
          <path d="M-3.5 -5.5H3.5" stroke={C.brown} strokeWidth="2.4" strokeLinecap="round" />
          <circle cx="-11" cy="-2.6" r="2.7" fill={C.brown} />
          <circle cx="11" cy="-2.6" r="2.7" fill={C.brown} />
        </>
      ) : (
        <>
          <circle cx="-11" cy="-4" r="3.2" fill={C.brown} />
          <circle cx="11" cy="-4" r="3.2" fill={C.brown} />
          <circle cx="-10" cy="-5.2" r="1.1" fill="#fff" />
          <circle cx="12" cy="-5.2" r="1.1" fill="#fff" />
        </>
      )}
    </g>
  );
}

/* ---------- The concepts ---------- */

export const CONCEPTS: Concept[] = [
  // Typographic
  {
    id: 'A1',
    name: 'Minimal 어',
    category: 'Typographic',
    blurb: 'One puffy green 어 on warm cream, sitting on the same solid lip as the app’s buttons.',
    art: (p) => (
      <>
        <Bg p={p} from="#fffaf2" to="#f7e3c6" />
        <Shadow p={p} cx={50} cy={82} rx={26} />
        <Glyph ch="어" x={16} y={14} size={66} color={C.green} lip={C.greenLip} />
      </>
    ),
  },
  {
    id: 'A3',
    name: 'Fire 휘',
    category: 'Typographic',
    blurb: 'A cream 휘 on an ember gradient with a couple of rising sparks. Warm and loud.',
    art: (p) => (
      <>
        <Bg p={p} from="#ffb54a" to="#ff6a1a" />
        <Shine p={p} opacity={0.35} />
        <Glyph ch="휘" x={19} y={16} size={62} color={C.cream} lip={C.flameLip} gloss={0} />
        <path d={sparkle(80, 20, 6)} fill="#ffe7a3" />
        <circle cx="86" cy="32" r="2" fill="#ffe7a3" />
        <circle cx="14" cy="80" r="1.6" fill="#ffe7a3" opacity="0.8" />
      </>
    ),
  },
  {
    id: 'A5',
    name: 'Glass 어',
    category: 'Typographic',
    blurb: 'A frosted glass panel with a softly glowing 어, on a deep green squircle.',
    art: (p) => (
      <>
        <defs>
          <Blur id={p('glow')} sd={4} />
        </defs>
        <Bg p={p} from="#2bbd73" to="#0a4f2c" x2={0.6} />
        <circle cx="82" cy="18" r="22" fill="#7ff0b0" opacity="0.25" filter={`url(#${p('glow')})`} />
        <rect x="14" y="14" width="72" height="72" rx="20" fill="#fff" fillOpacity="0.13" stroke="#fff" strokeOpacity="0.4" strokeWidth="1.4" />
        <Glyph ch="어" x={20} y={19} size={60} color="#b6ffd5" opacity={0.7} filter={`url(#${p('glow')})`} gloss={0} />
        <Glyph ch="어" x={20} y={19} size={60} color="#effff5" lip="#0a4f2c" gloss={0} />
        <Shine p={p} opacity={0.45} />
      </>
    ),
  },
  {
    id: 'C6',
    name: 'Stamp 어휘',
    category: 'Typographic',
    blurb: 'A 도장 seal pressed on hanji paper: 어휘 knocked out of emerald ink, with a grainy texture.',
    art: (p) => (
      <>
        <Bg p={p} from="#fbf2e2" to="#efdcbd" />
        <g fill={C.brown} opacity="0.07">
          {[[12, 18], [84, 12], [90, 70], [8, 60], [30, 92], [70, 90], [52, 8]].map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r="1.3" />
          ))}
        </g>
        <g transform="rotate(-7 50 50)">
          <rect x="15" y="19" width="70" height="66" rx="16" fill={C.greenLip} />
          <rect x="15" y="15" width="70" height="66" rx="16" fill={C.accent} />
          <rect x="20.5" y="20.5" width="59" height="55" rx="11" fill="none" stroke={C.cream} strokeOpacity="0.85" strokeWidth="1.8" />
          <Glyph ch="어" x={19} y={34} size={28} color={C.cream} gloss={0} weight={1.1} />
          <Glyph ch="휘" x={50} y={34} size={28} color={C.cream} gloss={0} weight={1.15} />
          <g fill={C.accent}>
            {[[28, 38], [37, 52], [61, 41], [66, 56], [55, 33], [31, 59], [71, 36]].map(([x, y]) => (
              <circle key={`${x}-${y}`} cx={x} cy={y} r="0.9" />
            ))}
          </g>
        </g>
      </>
    ),
  },

  // Literary / vocab
  {
    id: 'A2',
    name: 'Open Book 어',
    category: 'Literary',
    blurb: 'The syllable is spread across a book: ㅇ on the left page, ㅓ on the right.',
    art: (p) => (
      <>
        <Bg p={p} from="#eaf4ff" to="#bcd8fb" />
        <Shine p={p} opacity={0.5} />
        <Book x={8} y={30} w={84} lines={false} />
        <Glyph ch="ㅇ" x={18} y={39} size={26} color={C.green} lip={C.greenLip} gloss={0.4} />
        <Glyph ch="ㅓ" x={57} y={39} size={26} color={C.green} lip={C.greenLip} gloss={0.4} />
        <path d={sparkle(50, 15, 7)} fill={C.gold} />
        <circle cx="64" cy="12" r="2" fill={C.gold} />
        <circle cx="37" cy="18" r="1.5" fill={C.gold} />
      </>
    ),
  },
  {
    id: 'A2-2nd',
    name: 'Dictionary 휘',
    category: 'Literary',
    blurb: 'A chunky dictionary with colored thumb-index tabs and 휘 embossed on the cover.',
    art: (p) => (
      <>
        <Bg p={p} from="#fff3dc" to="#ffd98c" />
        <Shadow p={p} cx={50} cy={88} rx={30} />
        {/* page block and tabs */}
        <rect x="60" y="20" width="20" height="64" rx="6" fill="#ead9bd" />
        <rect x="60" y="17" width="20" height="64" rx="6" fill="#fffaf0" />
        <g stroke="#ecdcc2" strokeWidth="1.2">
          <path d="M66 26H78M66 33H78M66 40H78M66 47H78M66 54H78M66 61H78M66 68H78" />
        </g>
        <rect x="74" y="24" width="10" height="11" rx="3" fill={C.flame} />
        <rect x="74" y="40" width="10" height="11" rx="3" fill={C.sky} />
        <rect x="74" y="56" width="10" height="11" rx="3" fill={C.indigo} />
        {/* cover */}
        <Slab x={16} y={14} w={56} h={70} rx={10} fill={C.accent} lip={C.greenLip} dy={5} />
        <rect x="16" y="70" width="56" height="4.5" fill={C.gold} />
        <rect x="22" y="20" width="44" height="44" rx="8" fill="none" stroke="#fff" strokeOpacity="0.25" strokeWidth="1.4" />
        <Glyph ch="휘" x={24} y={22} size={40} color={C.cream} lip={C.greenLip} gloss={0} />
      </>
    ),
  },
  {
    id: 'C2',
    name: 'Chat Bubble 어',
    category: 'Literary',
    blurb: 'A word you can say out loud: 어 in a speech bubble, with a gold “typing…” reply behind it.',
    art: (p) => (
      <>
        <Bg p={p} from="#53a3ec" to="#1a6cc0" />
        <Shine p={p} opacity={0.35} />
        <Slab x={48} y={14} w={40} h={26} rx={13} fill={C.gold} lip={C.goldLip} dy={3} />
        <g fill={C.brown}>
          <circle cx="60" cy="27" r="2.6" />
          <circle cx="68" cy="27" r="2.6" />
          <circle cx="76" cy="27" r="2.6" />
        </g>
        <g transform="translate(0 4)" fill={C.skyLip}>
          <rect x="12" y="32" width="64" height="50" rx="22" />
          <path d="M22 74L16 90L40 79Z" />
        </g>
        <rect x="12" y="32" width="64" height="50" rx="22" fill="#fff" />
        <path d="M22 74L16 90L40 79Z" fill="#fff" strokeLinejoin="round" />
        <Glyph ch="어" x={23} y={36} size={42} color={C.green} lip={C.greenLip} />
      </>
    ),
  },
  {
    id: 'C3',
    name: 'Vocab Card',
    category: 'Literary',
    blurb: 'A flashcard with 어 and a translation line, a gold card peeking out from the deck behind.',
    art: (p) => (
      <>
        <Bg p={p} from="#8f8aff" to="#4f48c9" />
        <Shine p={p} opacity={0.35} />
        <Slab x={30} y={14} w={48} h={62} rx={10} fill={C.gold} lip={C.goldLip} transform="rotate(11 54 45)" />
        <Slab x={20} y={22} w={50} h={62} rx={10} fill="#fff" lip={C.indigoLip} transform="rotate(-6 45 53)" />
        <g transform="rotate(-6 45 53)">
          <Glyph ch="어" x={25} y={27} size={40} color={C.green} lip={C.greenLip} />
          <rect x="29" y="71" width="24" height="4.5" rx="2.25" fill="#dcd9ff" />
          <circle cx="59" cy="73.2" r="2.25" fill="#dcd9ff" />
        </g>
      </>
    ),
  },

  // Gamified
  {
    id: 'A4',
    name: 'Check 어',
    category: 'Gamified',
    blurb: 'A mastered word: green 어 with a gold check badge, the moment a stage turns complete.',
    art: (p) => (
      <>
        <Bg p={p} from="#f2fbf5" to="#cbeed8" />
        <Glyph ch="어" x={10} y={10} size={64} color={C.green} lip={C.greenLip} />
        <circle cx="72" cy="72" r="19" fill="#e2f6e9" />
        <circle cx="72" cy="75" r="15" fill={C.goldLip} />
        <circle cx="72" cy="72" r="15" fill={C.gold} />
        <path d="M64.5 72.5L70 78L80 66.5" fill="none" stroke="#fff" strokeWidth="4.6" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
  },
  {
    id: 'A3-2nd',
    name: 'Streak Flame',
    category: 'Gamified',
    blurb: 'The daily streak flame with a cream 어 burning in its core. Come back tomorrow.',
    art: (p) => {
      const flame = 'M50 8C58 24 80 34 80 60C80 79 67 91 50 91C33 91 20 79 20 60C20 46 28 37 35 30C37 40 41 45 46 47C43 33 45 20 50 8Z';
      return (
        <>
          <defs>
            <LG id={p('fire')} from="#ffb13b" to="#ff5a1a" />
            <radialGradient id={p('core')} cx="50%" cy="65%" r="45%">
              <stop offset="0" stopColor="#ffe68a" />
              <stop offset="1" stopColor="#ffe68a" stopOpacity="0" />
            </radialGradient>
          </defs>
          <Bg p={p} from="#fff3e4" to="#ffcf9e" />
          <path d={flame} fill={C.flameLip} transform="translate(0 4)" />
          <path d={flame} fill={`url(#${p('fire')})`} />
          <ellipse cx="50" cy="66" rx="24" ry="22" fill={`url(#${p('core')})`} />
          <Glyph ch="어" x={31} y={47} size={38} color={C.cream} lip={C.flameLip} gloss={0} />
          <path d={sparkle(82, 18, 5)} fill={C.flame} />
          <circle cx="17" cy="24" r="2" fill={C.flame} opacity="0.7" />
        </>
      );
    },
  },
  {
    id: 'A4-2nd',
    name: 'Level Up',
    category: 'Gamified',
    blurb: 'A white 어 levelling up: gold chevrons, sparkles, and an XP bar that’s nearly full.',
    art: (p) => (
      <>
        <Bg p={p} from="#2fc077" to="#0f6e3c" x2={0.5} />
        <Shine p={p} opacity={0.4} />
        <Glyph ch="어" x={8} y={14} size={58} color="#fff" lip="#0b5530" gloss={0} />
        <g fill="none" stroke={C.gold} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M70 32L79 23L88 32" />
          <path d="M70 46L79 37L88 46" opacity="0.55" />
        </g>
        <path d={sparkle(66, 15, 4.5)} fill="#fff3c4" />
        <rect x="14" y="80" width="72" height="9" rx="4.5" fill="#0b5530" opacity="0.55" />
        <rect x="14" y="78.5" width="54" height="9" rx="4.5" fill={C.gold} />
        <rect x="18" y="80" width="40" height="2.4" rx="1.2" fill="#fff" opacity="0.55" />
      </>
    ),
  },

  // Mascot / cultural
  {
    id: 'C1',
    name: 'Reading Tiger',
    category: 'Mascot',
    blurb: 'A studious 호랑이 in round glasses, peeking over an open book. The friendliest option.',
    art: (p) => (
      <>
        <Bg p={p} from="#e6f8ed" to="#b5e5c7" />
        <Shine p={p} opacity={0.5} />
        <TigerFace p={p} cx={50} cy={42} r={26} glasses />
        <Book x={12} y={62} w={76} />
        <circle cx="21" cy="72" r="7" fill="#ff9a35" stroke={C.flameLip} strokeWidth="1.6" />
        <circle cx="79" cy="72" r="7" fill="#ff9a35" stroke={C.flameLip} strokeWidth="1.6" />
      </>
    ),
  },
  {
    id: 'C1-3rd',
    name: 'Tiger 어',
    category: 'Mascot',
    blurb: 'Mascot meets letter: the ㅇ of 어 is a tiger cub’s face, and the ㅓ wears its stripes.',
    art: (p) => (
      <>
        <Bg p={p} from="#fffaf2" to="#f6e1c2" />
        <Shadow p={p} cx={50} cy={88} rx={30} />
        <TigerFace p={p} cx={33} cy={55} r={21} />
        <g fill="none" strokeLinecap="round">
          <path d="M64 55H77M79 17V86" stroke={C.flameLip} strokeWidth="12" transform="translate(0 4.5)" />
          <path d="M64 55H77M79 17V86" stroke="#ff9a35" strokeWidth="12" />
          <path d="M76 29H82M75.5 44H82.5M75.5 66H82.5M76 79H82" stroke={C.brown} strokeWidth="3" />
          <path d="M77 22V40M77 60V82" stroke="#fff" strokeOpacity="0.4" strokeWidth="3" />
        </g>
      </>
    ),
  },
  {
    id: 'C2-3rd',
    name: 'Magpie Reader',
    category: 'Mascot',
    blurb: 'A 까치, the good-news bird of Korean folk art, perched on a book and reading along.',
    art: (p) => (
      <>
        <Bg p={p} from="#e2f0ff" to="#a8cdf6" />
        <g fill="#fff" opacity="0.85">
          <ellipse cx="76" cy="20" rx="12" ry="5" />
          <ellipse cx="70" cy="16" rx="7" ry="5" />
        </g>
        {/* tail */}
        <path d="M38 50C28 42 18 33 9 27C6 25 3 28 5 31C11 40 22 52 33 60Z" fill="#232a3a" />
        <path d="M33 50C25 43 17 36 10 31" stroke="#4d7fe0" strokeWidth="2.6" strokeLinecap="round" fill="none" />
        {/* body */}
        <ellipse cx="47" cy="53" rx="18" ry="13.5" fill="#232a3a" transform="rotate(-18 47 53)" />
        <ellipse cx="53" cy="58" rx="10.5" ry="8.5" fill="#fff" />
        <ellipse cx="42" cy="50" rx="11" ry="6.5" fill="#2f4a8a" transform="rotate(-18 42 50)" />
        <ellipse cx="45" cy="47.5" rx="6" ry="2.8" fill="#fff" transform="rotate(-18 45 47.5)" />
        {/* head */}
        <circle cx="63" cy="38" r="10.5" fill="#232a3a" />
        <circle cx="66" cy="37" r="2.9" fill="#fff" />
        <circle cx="66.6" cy="38" r="1.5" fill="#111" />
        <path d="M71 40L80 45.5L70 44.5Z" fill={C.gold} stroke={C.gold} strokeWidth="1.4" strokeLinejoin="round" />
        <circle cx="66" cy="43.5" r="2" fill="#ff8f9a" opacity="0.6" />
        <Book x={10} y={65} w={80} />
      </>
    ),
  },

  // Abstract / mini
  {
    id: 'C2-2nd',
    name: 'Sprout Cards',
    category: 'Abstract',
    blurb: 'A 새싹 sprout growing out of a small stack of word cards: learning as growth.',
    art: (p) => (
      <>
        <Bg p={p} from="#ecfbf2" to="#bfe9cf" />
        <Shadow p={p} cx={52} cy={90} rx={30} />
        <Slab x={16} y={40} w={50} h={42} rx={10} fill={C.gold} lip={C.goldLip} transform="rotate(-10 41 61)" />
        {/* sprout, rooted behind the front card */}
        <path d="M54 50C54 40 53 32 51 24" fill="none" stroke={C.accent} strokeWidth="4.5" strokeLinecap="round" />
        <path d="M52 32C40 34 32 26 31 15C42 14 51 20 52 32Z" fill="#33c27a" />
        <path d="M53 28C60 15 72 12 81 15C78 27 66 33 53 28Z" fill={C.accent} />
        <path d="M50 30C44 27 39 23 35 18M56 26C63 21 70 18 76 17" stroke="#fff" strokeOpacity="0.45" strokeWidth="1.6" strokeLinecap="round" fill="none" />
        <Slab x={32} y={46} w={52} h={40} rx={10} fill="#fff" lip="#a9d6ba" transform="rotate(6 58 66)" />
        <g transform="rotate(6 58 66)" fill="#d8efe0">
          <rect x="40" y="56" width="30" height="5" rx="2.5" />
          <rect x="40" y="66" width="20" height="5" rx="2.5" />
        </g>
      </>
    ),
  },
  {
    id: 'C3-2nd',
    name: 'Star Glow',
    category: 'Abstract',
    blurb: 'Two frosted glass cards under a glowing gold star, on a night-study indigo.',
    art: (p) => (
      <>
        <defs>
          <Blur id={p('glow')} sd={6} />
          <LG id={p('star')} from="#ffe58a" to="#ffae1f" />
        </defs>
        <Bg p={p} from="#34338a" to="#121339" x2={0.6} />
        <g fill="#fff">
          <circle cx="16" cy="16" r="1" opacity="0.7" />
          <circle cx="86" cy="62" r="1.2" opacity="0.6" />
          <circle cx="22" cy="86" r="0.9" opacity="0.5" />
          <circle cx="80" cy="12" r="0.8" opacity="0.6" />
        </g>
        <rect x="16" y="34" width="44" height="54" rx="10" fill="#fff" fillOpacity="0.1" stroke="#fff" strokeOpacity="0.32" strokeWidth="1.4" transform="rotate(-12 38 61)" />
        <rect x="38" y="30" width="44" height="54" rx="10" fill="#fff" fillOpacity="0.16" stroke="#fff" strokeOpacity="0.45" strokeWidth="1.4" transform="rotate(8 60 57)" />
        <circle cx="54" cy="42" r="20" fill="#ffc233" opacity="0.5" filter={`url(#${p('glow')})`} />
        <path d={star(54, 45, 17, 7.5)} fill={C.goldLip} stroke={C.goldLip} strokeWidth="3" strokeLinejoin="round" />
        <path d={star(54, 42, 17, 7.5)} fill={`url(#${p('star')})`} stroke="#ffd257" strokeWidth="3" strokeLinejoin="round" />
        <path d={sparkle(80, 30, 4)} fill="#fff4c9" />
        <path d={sparkle(26, 24, 3)} fill="#fff4c9" opacity="0.8" />
      </>
    ),
  },
  {
    id: 'C4-2nd',
    name: 'Jamo Tiles',
    category: 'Abstract',
    blurb: 'The app’s signature move: 어 split into ㅇ and ㅓ tiles, the way answers break into jamo.',
    art: (p) => (
      <>
        <Bg p={p} from="#fffaf2" to="#f7e2c4" />
        <Shadow p={p} cx={54} cy={90} rx={32} />
        <Slab x={12} y={20} w={46} h={46} rx={13} fill={C.green} lip={C.greenLip} dy={6} />
        <Glyph ch="ㅇ" x={15} y={23} size={40} color={C.cream} gloss={0} />
        <Slab x={44} y={42} w={44} h={44} rx={13} fill={C.gold} lip={C.goldLip} dy={6} />
        <Glyph ch="ㅓ" x={47} y={44} size={40} color={C.brown} gloss={0} />
        <path d={sparkle(80, 22, 7)} fill={C.gold} />
        <circle cx="68" cy="14" r="2" fill={C.gold} />
      </>
    ),
  },
];

export const CATEGORIES: Category[] = ['Typographic', 'Literary', 'Gamified', 'Mascot', 'Abstract'];

/** `maskable`: full-bleed square for Android adaptive icons, the art shrunk into the 80% safe circle. */
export type Shape = 'squircle' | 'square' | 'circle' | 'maskable';

const SHAPES: Record<Exclude<Shape, 'maskable'>, string> = {
  squircle: 'M50 0C78 0 89 0 94.5 5.5C100 11 100 22 100 50C100 78 100 89 94.5 94.5C89 100 78 100 50 100C22 100 11 100 5.5 94.5C0 89 0 78 0 50C0 22 0 11 5.5 5.5C11 0 22 0 50 0Z',
  square: 'M0 0H100V100H0Z',
  circle: 'M0 50a50 50 0 1 0 100 0a50 50 0 1 0 -100 0Z',
};

/** One concept as a standalone SVG, clipped to an icon shape, with a faint rim and base shade for depth. */
export function IconSvg({ concept, size, shape = 'squircle', className, title }: { concept: Concept; size: number | string; shape?: Shape; className?: string; title?: string }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const p = (k: string) => `${uid}-${k}`;
  const outline = shape === 'maskable' ? 'square' : shape;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <defs>
        <clipPath id={p('clip')}>
          <path d={SHAPES[outline]} />
        </clipPath>
        <linearGradient id={p('base')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0.6" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.08" />
        </linearGradient>
      </defs>
      <g clipPath={`url(#${p('clip')})`}>
        {shape === 'maskable' ? <SafeZoneArt art={concept.art(p)} /> : concept.art(p)}
        <rect width="100" height="100" fill={`url(#${p('base')})`} />
        {outline !== 'square' && <path d={SHAPES[outline]} fill="none" stroke="#fff" strokeOpacity="0.3" strokeWidth="2.4" />}
      </g>
    </svg>
  );
}

/** Keeps the background full-bleed and shrinks everything drawn on it into the maskable safe zone. */
function SafeZoneArt({ art }: { art: ReactNode }) {
  const parts = Children.toArray(isValidElement(art) ? (art as ReactElement<{ children?: ReactNode }>).props.children : art);
  const isBackdrop = (n: ReactNode) => isValidElement(n) && (n.type === Bg || n.type === Shine);
  return (
    <>
      {parts.filter(isBackdrop)}
      <g transform="translate(16 16) scale(0.68)">{parts.filter((n) => !isBackdrop(n))}</g>
    </>
  );
}

/** The icon before the C4-2nd redesign (the old public/favicon.svg), for side-by-side comparison. */
export function CurrentIcon({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden>
      <rect width="64" height="64" fill="#0f172a" />
      <rect x="4.96" y="4.96" width="54.08" height="54.08" fill="none" stroke="#10b981" strokeWidth="2.24" />
      <rect x="7.744" y="7.744" width="48.512" height="48.512" fill="none" stroke="#10b981" strokeWidth="0.768" />
      <circle cx="22.72" cy="32" r="8.96" fill="none" stroke="#e2e8f0" strokeWidth="3.84" />
      <rect x="41.92" y="15.36" width="3.712" height="33.28" fill="#e2e8f0" />
      <rect x="36.16" y="30.144" width="6.08" height="3.712" fill="#e2e8f0" />
    </svg>
  );
}
