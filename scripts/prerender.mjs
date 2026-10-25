// Runs after `vite build` (see package.json). Writes the public pages with their content already
// in the HTML, so crawlers and link previews see text without running JavaScript:
//
//   dist/index.html    /          the landing page, shown only to visitors who are new here
//   dist/about.html    /about     (GitHub Pages serves foo.html at /foo)
//   dist/privacy.html  /privacy
//
// The static copy sits in #prerender, over the empty app root. The page removes it once React has
// drawn the same page (dropPrerender in src/lib/route.ts). A small inline script removes it before
// the first paint when it doesn't apply: a returning learner on /, or a different path served
// index.html by the offline fallback.
import { readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createServer } from 'vite';

const SITE = 'https://eohwijang.fyi';
const DIST = 'dist';
const BASE = (() => {
  const p = process.env.BASE_PATH ?? '/';
  const lead = p.startsWith('/') ? p : `/${p}`;
  return lead.endsWith('/') ? lead : `${lead}/`;
})();

const PAGES = [
  { route: 'app', file: 'index.html', path: '' },
  { route: 'about', file: 'about.html', path: 'about' },
  { route: 'privacy', file: 'privacy.html', path: 'privacy' },
];

const escapeAttr = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const escapeText = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

/** Remove the static copy when it is not the page this visitor will get. Runs before first paint. */
const guard = (route) => `<script>
      (function () {
        try {
          var el = document.getElementById('prerender');
          var base = ${JSON.stringify(BASE)};
          var path = location.pathname.indexOf(base) === 0 ? location.pathname.slice(base.length) : location.pathname;
          path = path.replace(/\\.html$/, '').replace(/\\/+$/, '');
          var here = location.hash === '#about' ? 'about' : path === 'about' || path === 'privacy' ? path : path === '' ? 'app' : 'other';
          var ls = window.localStorage;
          var returning = ls.getItem('project-vocab:welcomed') === '1' || !!ls.getItem('project-vocab:v1') || !!ls.getItem('project-vocab:session');
          if (here !== ${JSON.stringify(route)} || location.hash === '#admin' || (here === 'app' && returning)) el.remove();
        } catch (e) {}
      })();
    </script>`;

/** The Welcome page's lazily loaded stylesheet, so the static copy is styled exactly like the live one. */
function chunkCss(entry) {
  try {
    const manifest = JSON.parse(readFileSync(`${DIST}/.vite/manifest.json`, 'utf8'));
    const seen = new Set();
    const css = [];
    const walk = (key) => {
      const chunk = manifest[key];
      if (!chunk || seen.has(key)) return;
      seen.add(key);
      css.push(...(chunk.css ?? []));
      (chunk.imports ?? []).forEach(walk);
    };
    walk(entry);
    return [...new Set(css)];
  } catch {
    return [];
  }
}

function setMeta(html, { title, description, url }) {
  const t = escapeAttr(title);
  const d = escapeAttr(description);
  return html
    .replace(/<title>[^<]*<\/title>/, `<title>${escapeText(title)}</title>`)
    .replace(/(<meta name="description" content=")[^"]*"/, `$1${d}"`)
    .replace(/(<link rel="canonical" href=")[^"]*"/, `$1${url}"`)
    .replace(/(<meta property="og:title" content=")[^"]*"/, `$1${t}"`)
    .replace(/(<meta property="og:description" content=")[^"]*"/, `$1${d}"`)
    .replace(/(<meta property="og:url" content=")[^"]*"/, `$1${url}"`)
    .replace(/(<meta name="twitter:title" content=")[^"]*"/, `$1${t}"`)
    .replace(/(<meta name="twitter:description" content=")[^"]*"/, `$1${d}"`);
}

const template = readFileSync(`${DIST}/index.html`, 'utf8');
if (!template.includes('<!-- prerender -->')) throw new Error('dist/index.html has no <!-- prerender --> marker');

const vite = await createServer({ configFile: false, logLevel: 'error', server: { middlewareMode: true }, appType: 'custom', optimizeDeps: { noDiscovery: true, entries: [] } });
try {
  const { loadCoverage, metaFor, render } = await vite.ssrLoadModule('/src/prerender.tsx');
  const { coverage, live } = await loadCoverage();
  console.log(`prerender: ${coverage.books.map((b) => `${b.id} (${b.words})`).join(', ')}${live ? '' : ' [bundled only: shared lists unreachable]'}`);

  const welcomeCss = chunkCss('src/pages/welcome/WelcomeA.tsx');
  for (const page of PAGES) {
    const meta = metaFor(page.route, coverage);
    const url = `${SITE}${BASE}${page.path}`;
    // The chunk's imports include the main entry, whose stylesheet the template already links.
    const css = page.route === 'privacy' ? [] : welcomeCss.filter((href) => !template.includes(`${BASE}${href}`));
    const links = css.map((href) => `<link rel="stylesheet" href="${BASE}${href}" />`).join('\n    ');
    const body = `<div id="prerender" style="position:fixed;inset:0;z-index:10">${render(page.route, coverage)}</div>
    ${guard(page.route)}`;
    let html = setMeta(template, { ...meta, url });
    if (links) html = html.replace('</head>', `  ${links}\n  </head>`);
    html = html.replace('<!-- prerender -->', body);
    writeFileSync(`${DIST}/${page.file}`, html);
    console.log(`prerender: wrote ${DIST}/${page.file} (${Math.round(html.length / 1024)} kB)`);
  }
} finally {
  await vite.close();
}

// Build bookkeeping only; nothing on the site needs it.
rmSync(`${DIST}/.vite`, { recursive: true, force: true });
