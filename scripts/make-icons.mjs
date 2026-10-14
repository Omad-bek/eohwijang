// Renders the app icon (the syllable 어 built from a ㅇ ring and a ㅓ stem inside
// an emerald double frame) to PNG without native deps. Run: node scripts/make-icons.mjs
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';

const INK = [0x0f, 0x17, 0x2a];
const HANJI = [0xe2, 0xe8, 0xf0];
const CINNABAR = [0x10, 0xb9, 0x81];

// Geometry in a 0..1 unit square. `pad` shrinks the art for maskable safe zones.
function shapes(pad) {
  const s = (v) => pad + v * (1 - 2 * pad);
  const len = (v) => v * (1 - 2 * pad);
  return [
    // outer frame (stroke) and inner hairline frame
    { kind: 'frame', x0: s(0.06), y0: s(0.06), x1: s(0.94), y1: s(0.94), w: len(0.035), color: CINNABAR },
    { kind: 'frame', x0: s(0.115), y0: s(0.115), x1: s(0.885), y1: s(0.885), w: len(0.012), color: CINNABAR },
    // ㅇ ring
    { kind: 'ring', cx: s(0.355), cy: s(0.5), r: len(0.14), w: len(0.06), color: HANJI },
    // ㅓ: stem and the stroke pointing left
    { kind: 'rect', x0: s(0.655), y0: s(0.24), x1: s(0.713), y1: s(0.76), color: HANJI },
    { kind: 'rect', x0: s(0.565), y0: s(0.471), x1: s(0.66), y1: s(0.529), color: HANJI },
  ];
}

function inside(sh, x, y) {
  switch (sh.kind) {
    case 'rect':
      return x >= sh.x0 && x <= sh.x1 && y >= sh.y0 && y <= sh.y1;
    case 'frame': {
      const inOuter = x >= sh.x0 && x <= sh.x1 && y >= sh.y0 && y <= sh.y1;
      const inInner = x >= sh.x0 + sh.w && x <= sh.x1 - sh.w && y >= sh.y0 + sh.w && y <= sh.y1 - sh.w;
      return inOuter && !inInner;
    }
    case 'ring': {
      const d = Math.hypot(x - sh.cx, y - sh.cy);
      return d <= sh.r + sh.w / 2 && d >= sh.r - sh.w / 2;
    }
  }
  return false;
}

function render(size, pad) {
  const ss = 4;
  const list = shapes(pad);
  const raw = Buffer.alloc(size * (size * 3 + 1));
  for (let py = 0; py < size; py++) {
    raw[py * (size * 3 + 1)] = 0;
    for (let px = 0; px < size; px++) {
      let r = 0, g = 0, b = 0;
      for (let sy = 0; sy < ss; sy++) {
        for (let sx = 0; sx < ss; sx++) {
          const x = (px + (sx + 0.5) / ss) / size;
          const y = (py + (sy + 0.5) / ss) / size;
          let c = INK;
          for (const sh of list) if (inside(sh, x, y)) c = sh.color;
          r += c[0]; g += c[1]; b += c[2];
        }
      }
      const n = ss * ss;
      const o = py * (size * 3 + 1) + 1 + px * 3;
      raw[o] = Math.round(r / n);
      raw[o + 1] = Math.round(g / n);
      raw[o + 2] = Math.round(b / n);
    }
  }
  return png(size, size, raw);
}

const CRC = new Uint32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
function crc32(buf) {
  let c = 0xffffffff;
  for (const byte of buf) c = CRC[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
function png(w, h, raw) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // truecolor RGB
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

function svg() {
  const hex = (c) => '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('');
  const U = 64;
  const parts = shapes(0).map((sh) => {
    if (sh.kind === 'rect') return `<rect x="${sh.x0 * U}" y="${sh.y0 * U}" width="${(sh.x1 - sh.x0) * U}" height="${(sh.y1 - sh.y0) * U}" fill="${hex(sh.color)}"/>`;
    if (sh.kind === 'frame') {
      const h = sh.w / 2;
      return `<rect x="${(sh.x0 + h) * U}" y="${(sh.y0 + h) * U}" width="${(sh.x1 - sh.x0 - sh.w) * U}" height="${(sh.y1 - sh.y0 - sh.w) * U}" fill="none" stroke="${hex(sh.color)}" stroke-width="${sh.w * U}"/>`;
    }
    return `<circle cx="${sh.cx * U}" cy="${sh.cy * U}" r="${sh.r * U}" fill="none" stroke="${hex(sh.color)}" stroke-width="${sh.w * U}"/>`;
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${U} ${U}"><rect width="${U}" height="${U}" fill="${hex(INK)}"/>${parts.join('')}</svg>\n`;
}

mkdirSync('public', { recursive: true });
writeFileSync('public/pwa-192.png', render(192, 0));
writeFileSync('public/pwa-512.png', render(512, 0));
writeFileSync('public/pwa-maskable-512.png', render(512, 0.1));
writeFileSync('public/apple-touch-icon.png', render(180, 0.04));
writeFileSync('public/favicon.svg', svg());
console.log('icons written to public/');
