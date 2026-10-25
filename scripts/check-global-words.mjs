// Checks that the app's shared-vocabulary fetch receives every row the server holds, i.e. that
// nothing is cut off at PostgREST's max-rows (1000 on Supabase). Runs the app's own fetch code
// (src/lib/global.ts) against the live project, read-only. Exits 1 on a mismatch.
//
//   VITE_SUPABASE_URL=https://xxxx.supabase.co VITE_SUPABASE_ANON_KEY=... npm run check:words
import { createServer } from 'vite';

const vite = await createServer({ configFile: false, logLevel: 'error', server: { middlewareMode: true }, appType: 'custom', optimizeDeps: { noDiscovery: true, entries: [] } });
try {
  const { SYNC_AVAILABLE, rpcResponse } = await vite.ssrLoadModule('/src/lib/sync.ts');
  const { fetchGlobalRows, fetchGlobalWords, PAGE_SIZE } = await vite.ssrLoadModule('/src/lib/global.ts');
  if (!SYNC_AVAILABLE) throw new Error('Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY first.');

  // The server's own count, by a path independent of the app's: count=exact on a one-row page.
  const head = await rpcResponse('get_global_words', {}, { query: 'limit=1', headers: { Prefer: 'count=exact' } });
  const server = Number(head.headers.get('Content-Range')?.split('/')[1]);
  // What a single unpaged call returns, to show whether the cap is actually in play.
  const unpaged = await (await rpcResponse('get_global_words', {})).json();

  const { raw, total } = await fetchGlobalRows();
  const kept = await fetchGlobalWords();

  console.log(`server rows (count=exact):        ${server}`);
  console.log(`one unpaged get_global_words call: ${unpaged.length}${unpaged.length === PAGE_SIZE ? '  <- capped' : ''}`);
  console.log(`client fetched:                    ${raw.length} (server-reported total ${total ?? 'n/a'})`);
  console.log(`client kept after validation:      ${kept.length}`);

  if (raw.length !== server || kept.length !== server) {
    console.error('MISMATCH: the client does not see every server row.');
    process.exitCode = 1;
  } else console.log('OK: client count equals server count.');
} finally {
  await vite.close();
}
