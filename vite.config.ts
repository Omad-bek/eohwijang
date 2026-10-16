import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

/**
 * Public base path. The site is served from the custom root domain
 * (eohwijang.fyi), so it defaults to '/'; set BASE_PATH to serve from a subpath.
 */
const base = normalizeBase(process.env.BASE_PATH ?? '/');

function normalizeBase(p: string): string {
  const withLead = p.startsWith('/') ? p : `/${p}`;
  return withLead.endsWith('/') ? withLead : `${withLead}/`;
}

/**
 * Cloud Sync settings. Vite only exposes VITE_* variables to the browser, so the
 * unprefixed SUPABASE_URL / SUPABASE_ANON_KEY are passed through by name. Not via
 * envPrefix, which would also leak secrets such as SUPABASE_SERVICE_ROLE_KEY.
 */
const PUBLIC_ENV = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'] as const;

export default defineConfig(({ mode }) => {
  const env = { ...loadEnv(mode, process.cwd(), ''), ...process.env };
  return {
  base,
  define: Object.fromEntries(PUBLIC_ENV.map((k) => [`import.meta.env.${k}`, JSON.stringify(env[k] ?? '')])),
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        id: base,
        name: '어휘장 · Korean vocabulary',
        short_name: '어휘장',
        description: 'Type-to-recall Korean vocabulary trainer with Uzbek, Russian and English prompts.',
        lang: 'ko',
        start_url: base,
        scope: base,
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#fff8ee',
        theme_color: '#fff8ee',
        // Relative to the manifest, so they resolve under the base path.
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2,webmanifest}'],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        navigateFallback: `${base}index.html`,
        cleanupOutdatedCaches: true,
      },
    }),
  ],
};
});
