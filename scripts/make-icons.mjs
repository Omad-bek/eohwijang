// Renders the app icon (concept C4-2nd, "Jamo Tiles": 어 split into a green ㅇ tile and a gold
// ㅓ tile) from its source in src/design-lab/icons.tsx to public/favicon.svg and the PNG icons.
//
// The SVG is rendered through Vite's SSR loader, and the PNGs are rasterized in headless
// Chromium via Playwright, which is not a project dependency. Run with:
//   npx -p playwright node scripts/make-icons.mjs
import { writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';

const ICON = 'C4-2nd';
const require = createRequire(import.meta.url);

const vite = await createServer({ configFile: false, logLevel: 'error', server: { middlewareMode: true }, appType: 'custom', optimizeDeps: { noDiscovery: true, entries: [] } });
let svgs;
try {
  const { CONCEPTS, IconSvg } = await vite.ssrLoadModule('/src/design-lab/icons.tsx');
  const concept = CONCEPTS.find((c) => c.id === ICON);
  if (!concept) throw new Error(`No icon concept ${ICON}`);
  const svg = (shape, size) => renderToStaticMarkup(createElement(IconSvg, { concept, size, shape }));
  svgs = {
    // Browsers and Android "any" icons keep the squircle and its transparent corners.
    'favicon.svg': svg('squircle', 64),
    'pwa-192.png': svg('squircle', 192),
    'pwa-512.png': svg('squircle', 512),
    // iOS rounds the corners itself and fills transparency with black, so it gets the full square.
    'apple-touch-icon.png': svg('square', 180),
    'pwa-maskable-512.png': svg('maskable', 512),
  };
} finally {
  await vite.close();
}

writeFileSync('public/favicon.svg', `${svgs['favicon.svg']}\n`);
console.log('wrote public/favicon.svg');

let chromium;
try {
  ({ chromium } = require('playwright'));
} catch {
  console.error('Playwright not found. Run: npx -p playwright node scripts/make-icons.mjs');
  process.exit(1);
}
const browser = await chromium.launch().catch(() => chromium.launch({ channel: 'chrome' }));
try {
  const page = await browser.newPage();
  for (const [file, markup] of Object.entries(svgs)) {
    if (!file.endsWith('.png')) continue;
    const size = Number(/width="(\d+)"/.exec(markup)[1]);
    await page.setViewportSize({ width: size, height: size });
    await page.setContent(`<html><body style="margin:0;background:transparent">${markup}</body></html>`);
    await page.locator('svg').screenshot({ path: `public/${file}`, omitBackground: true });
    console.log(`wrote public/${file} (${size}×${size})`);
  }
} finally {
  await browser.close();
}
