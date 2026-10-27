/**
 * send-feedback: the feedback form's only backend. Checks the request, the Turnstile token and
 * the bot traps, saves the message through feedback_submit (supabase/feedback.sql: rate limits,
 * duplicate check and insert in one locked step), and then forwards it to the developer's
 * Telegram chat. A Telegram failure leaves the row marked unsent; the learner still sees success.
 *
 * Secrets (supabase secrets set …): TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, TURNSTILE_SECRET_KEY,
 * IP_HASH_SALT. SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided by Supabase.
 *
 * Logs never contain message text, contacts, IPs, IP hashes or secrets. Note that a fetch error
 * from Deno includes the request URL, which for Telegram contains the bot token, so errors are
 * logged by kind only.
 */

const SITE_ORIGIN = 'https://eohwijang.fyi';
const DEV_ORIGIN = /^http:\/\/(localhost|127\.0\.0\.1)(:\d{1,5})?$/;
/** Hostnames a Turnstile token may have been solved on. */
const TURNSTILE_HOSTS = ['eohwijang.fyi', 'localhost', '127.0.0.1'];
const MAX_BODY = 8 * 1024;
const MIN_ELAPSED_MS = 3000;
const MESSAGE_MIN = 10;
const MESSAGE_MAX = 2000;
const CONTACT_MAX = 100;
const TELEGRAM_MAX = 4096;
const TIMEOUT_MS = 8000;

const CATEGORIES: Record<string, string> = { bug: 'Bug', word: 'Wrong word or translation', idea: 'Idea', other: 'Other' };
const UI_LANGS = ['en', 'ru', 'uz', 'ko'];

// C0/C1 controls (except tab and newline), and invisible direction overrides that can disguise text.
const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F​-‏‪-‮⁦-⁩﻿]/g;

function secret(name: string): string {
  const v = Deno.env.get(name);
  if (!v) throw new Error(`missing secret ${name}`);
  return v;
}

/** Multi-line text: unified newlines, controls removed, at most two blank lines in a row. */
function cleanText(v: unknown): string {
  if (typeof v !== 'string') return '';
  return v.replace(/\r\n?/g, '\n').replace(CONTROL, '').replace(/\n{4,}/g, '\n\n\n').trim();
}

/** Single-line text, cut to `max` characters. */
function cleanLine(v: unknown, max: number): string {
  return Array.from(cleanText(v).replace(/\s+/g, ' ')).slice(0, max).join('');
}

const length = (s: string) => Array.from(s).length;

async function sha256(text: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}

const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** The body as text, or null when it is larger than `max` bytes (checked while reading, not after). */
async function readLimited(req: Request, max: number): Promise<string | null> {
  if (Number(req.headers.get('content-length') ?? 0) > max) return null;
  if (!req.body) return '';
  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > max) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  const all = new Uint8Array(size);
  let at = 0;
  for (const c of chunks) {
    all.set(c, at);
    at += c.byteLength;
  }
  return new TextDecoder().decode(all);
}

function clientIp(req: Request): string {
  return (
    req.headers.get('cf-connecting-ip') ??
    req.headers.get('x-real-ip') ??
    req.headers.get('x-forwarded-for')?.split(',')[0] ??
    'unknown'
  ).trim();
}

async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  const form = new FormData();
  form.append('secret', secret('TURNSTILE_SECRET_KEY'));
  form.append('response', token);
  if (ip !== 'unknown') form.append('remoteip', ip);
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: form,
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    const data = await res.json();
    return data?.success === true && TURNSTILE_HOSTS.includes(data.hostname) && (!data.action || data.action === 'feedback');
  } catch {
    console.error('turnstile: verification request failed');
    return false;
  }
}

/** Call a SQL function as the service role (the only role allowed to run the feedback functions). */
async function rpc<T>(fn: string, args: Record<string, unknown>): Promise<T> {
  const key = secret('SUPABASE_SERVICE_ROLE_KEY');
  const res = await fetch(`${secret('SUPABASE_URL')}/rest/v1/rpc/${fn}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: key,
      // Legacy service-role keys are JWTs and go in Authorization too; new sb_secret_ keys only in apikey.
      ...(key.startsWith('eyJ') ? { Authorization: `Bearer ${key}` } : {}),
    },
    body: JSON.stringify(args),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`rpc ${fn} ${res.status}`);
  const text = await res.text();
  return (text ? JSON.parse(text) : null) as T;
}

interface Feedback {
  category: string;
  message: string;
  contact: string;
  context: { book: string; unit: string; lang: string; version: string; ua: string };
}

function telegramText(f: Feedback): string {
  const time = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Seoul', dateStyle: 'medium', timeStyle: 'short' }).format(new Date());
  const { book, unit, lang, version, ua } = f.context;
  const build = (message: string) =>
    [
      `📝 ${escapeHtml(CATEGORIES[f.category])}`,
      escapeHtml(message),
      '',
      `👤 ${escapeHtml(f.contact) || '—'}`,
      `📚 ${escapeHtml(book || '—')}${unit ? `/${escapeHtml(unit)}` : ''} · 🌐 ${escapeHtml(lang || '—')} · v${escapeHtml(version || '?')}`,
      ...(ua ? [`💻 ${escapeHtml(ua)}`] : []),
      `🕒 ${time} KST`,
    ].join('\n');
  const full = build(f.message);
  if (full.length <= TELEGRAM_MAX) return full;
  // Too long once escaped: keep the longest start of the raw message that fits. Measuring the escaped
  // text keeps us under the limit, and cutting the raw message (never the HTML) can't split an entity
  // such as &amp;. A binary search, because each character can grow to five when escaped.
  const chars = Array.from(f.message);
  let lo = 0;
  let hi = chars.length;
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    if (build(`${chars.slice(0, mid).join('')}…`).length <= TELEGRAM_MAX) lo = mid;
    else hi = mid - 1;
  }
  return build(`${chars.slice(0, lo).join('')}…`);
}

/** null when delivered, otherwise a short reason to store with the row. */
async function sendTelegram(text: string): Promise<string | null> {
  try {
    const res = await fetch(`https://api.telegram.org/bot${secret('TELEGRAM_BOT_TOKEN')}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: secret('TELEGRAM_CHAT_ID'), text, parse_mode: 'HTML', link_preview_options: { is_disabled: true } }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    await res.body?.cancel();
    return res.ok ? null : `telegram ${res.status}`;
  } catch (e) {
    return e instanceof Error && e.name === 'TimeoutError' ? 'timeout' : 'network';
  }
}

Deno.serve(async (req) => {
  const origin = req.headers.get('origin') ?? '';
  if (origin !== SITE_ORIGIN && !DEV_ORIGIN.test(origin)) return new Response('Forbidden', { status: 403 });

  const cors = {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
  const reply = (status: number, body: Record<string, unknown>) =>
    new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });
  // Bots get the same answer as a real success, so they learn nothing from being dropped.
  const ok = () => reply(200, { ok: true });

  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  if (req.method !== 'POST') return reply(405, { error: 'method' });
  if (!(req.headers.get('content-type') ?? '').toLowerCase().startsWith('application/json')) return reply(415, { error: 'json_only' });

  try {
    const raw = await readLimited(req, MAX_BODY);
    if (raw === null) return reply(413, { error: 'too_large' });
    let body: Record<string, unknown>;
    try {
      body = JSON.parse(raw);
    } catch {
      return reply(400, { error: 'invalid' });
    }
    if (!body || typeof body !== 'object' || Array.isArray(body)) return reply(400, { error: 'invalid' });

    // Bot traps: the hidden field is filled in, or the form was sent within seconds of opening.
    const elapsed = Number(body.elapsedMs);
    if ((body.website !== undefined && body.website !== '') || !Number.isFinite(elapsed) || elapsed < MIN_ELAPSED_MS) {
      console.log('dropped: bot trap');
      return ok();
    }

    const category = typeof body.category === 'string' && body.category in CATEGORIES ? body.category : '';
    const message = cleanText(body.message);
    const contact = cleanLine(body.contact, CONTACT_MAX + 1);
    const token = typeof body.token === 'string' ? body.token : '';
    if (!category || length(message) < MESSAGE_MIN || length(message) > MESSAGE_MAX || length(contact) > CONTACT_MAX || !token || token.length > 2048) {
      return reply(400, { error: 'invalid' });
    }
    const c = (body.context && typeof body.context === 'object' ? body.context : {}) as Record<string, unknown>;
    const lang = cleanLine(c.lang, 4);
    const context = {
      book: cleanLine(c.book, 24),
      unit: cleanLine(c.unit, 40),
      lang: UI_LANGS.includes(lang) ? lang : '',
      version: cleanLine(c.version, 32).replace(/[^\w.+-]/g, ''),
      ua: cleanLine(c.ua, 80),
    };

    const ip = clientIp(req);
    if (!(await verifyTurnstile(token, ip))) return reply(403, { error: 'captcha' });

    const result = await rpc<{ status: string; id?: number }>('feedback_submit', {
      p_ip_hash: await sha256(`${secret('IP_HASH_SALT')}:${ip}`),
      p_message_hash: await sha256(message.toLowerCase().replace(/\s+/g, ' ')),
      p_category: category,
      p_message: message,
      p_contact: contact,
      p_context: context,
    });
    if (result?.status === 'limited') {
      console.log('rejected: rate limit');
      return reply(429, { error: 'rate_limited' });
    }
    if (result?.status === 'duplicate') {
      console.log('dropped: duplicate');
      return ok();
    }
    if (result?.status !== 'ok' || typeof result.id !== 'number') throw new Error('unexpected submit result');

    // Saved: from here on the learner always gets a success, whatever Telegram does.
    const failure = await sendTelegram(telegramText({ category, message, contact, context }));
    try {
      await rpc('feedback_mark', { p_id: result.id, p_sent: failure === null, p_error: failure });
    } catch {
      console.error('feedback_mark failed');
    }
    console.log(failure ? `saved, not delivered: ${failure}` : 'delivered');
    return ok();
  } catch (e) {
    console.error('internal error:', e instanceof Error ? e.message.replace(/bot[^/\s]+/g, 'bot***') : 'unknown');
    return reply(500, { error: 'server' });
  }
});
