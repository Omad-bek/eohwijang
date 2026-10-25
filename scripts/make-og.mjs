// Renders the link-preview image (og:image) from the design lab's Share image page
// (src/design-lab/OgLab.tsx) to public/og-image.png at 1200 × 630, in the light theme.
// Like make-icons.mjs it uses Playwright, which is not a project dependency:
//   npx -p playwright node scripts/make-og.mjs [a|b]
import { createRequire } from 'node:module';
import { delimiter, join, sep } from 'node:path';
import { createServer } from 'vite';

const variant = process.argv[2] === 'b' ? 'b' : 'a';

/** From the project, or from the temporary install `npx -p playwright` puts on PATH. */
function loadPlaywright() {
  const roots = [import.meta.url, ...(process.env.PATH ?? '').split(delimiter).filter((d) => d.endsWith(`node_modules${sep}.bin`)).map((d) => join(d, '..', '..', 'x.js'))];
  for (const root of roots) {
    try {
      return createRequire(root)('playwright');
    } catch {
      /* try the next place */
    }
  }
  return null;
}

const { chromium } = loadPlaywright() ?? {};
if (!chromium) {
  console.error('Playwright not found. Run: npx -p playwright node scripts/make-og.mjs');
  process.exit(1);
}

const server = await createServer({ logLevel: 'error', server: { host: '127.0.0.1', port: 0 } });
await server.listen();
const { port } = server.httpServer.address();
const browser = await chromium.launch().catch(() => chromium.launch({ channel: 'chrome' }));
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, colorScheme: 'light' });
  await page.addInitScript(() => localStorage.setItem('project-vocab:theme', 'light'));
  await page.goto(`http://127.0.0.1:${port}/#design-lab/og/${variant}`);
  const card = page.locator('#og-card');
  await card.waitFor();
  await page.evaluate(() => document.fonts.ready);
  await card.screenshot({ path: 'public/og-image.png' });
  console.log(`wrote public/og-image.png (variant ${variant.toUpperCase()}, 1200×630)`);
} finally {
  await browser.close();
  await server.close();
}
