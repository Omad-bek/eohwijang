# Feedback form setup

The feedback form sends each message to your Telegram as a private message from your own bot.

```
Feedback form on eohwijang.fyi
  │  message + Turnstile token (no Sync ID)
  ▼
Supabase Edge Function "send-feedback"
  │  1. checks the origin, size, honeypot and open time
  │  2. checks the Turnstile token with Cloudflare
  │  3. feedback_submit(): rate limits + duplicate check + save   (supabase/feedback.sql)
  │  4. sends the Telegram message, then marks the row sent / unsent
  ▼
Your private Telegram chat
```

The bot only sends. It never polls or receives messages, and nothing runs when nobody sends feedback.
The secrets live only in Supabase. The repo and the website contain just the Turnstile **site** key, which is public by design.

Until you finish step 7, the site keeps working exactly as before, with the old GitHub link.

You'll collect five values. Keep them in a password manager or a private note, never in the repo:

| Name | Where it comes from | Secret? |
|---|---|---|
| `TELEGRAM_BOT_TOKEN` | Step 1, @BotFather | **yes** |
| `TELEGRAM_CHAT_ID` | Step 2 | yes (keep private) |
| `TURNSTILE_SECRET_KEY` | Step 3, Cloudflare | **yes** |
| Turnstile **site key** | Step 3, Cloudflare | no, it goes into GitHub as `VITE_TURNSTILE_SITE_KEY` |
| `IP_HASH_SALT` | Step 4, you generate it | **yes** |

---

## 1. Create the bot with @BotFather

1. In Telegram, open **@BotFather** (it has a blue check mark) and press **Start**.
2. Send `/newbot`.
3. Enter a display name, e.g. `Eohwijang Feedback`.
4. Enter a username that ends in `bot`, e.g. `eohwijang_feedback_bot`.
5. BotFather replies with a token like `7412345678:AAH...`. That is your **`TELEGRAM_BOT_TOKEN`**. Anyone who has it controls the bot, so never paste it into chats, screenshots or the repo.
6. Open your new bot (BotFather's reply has a `t.me/...` link) and press **Start**. **This step is required:** a bot can't message you until you have started a chat with it.

## 2. Find your chat ID

1. Send any message to your bot, e.g. `hi`.
2. Open this address in your browser, with your token pasted in place of `<TOKEN>` (keep the word `bot` in front of it):

   ```
   https://api.telegram.org/bot<TOKEN>/getUpdates
   ```

3. In the text that appears, find `"chat":{"id":123456789,...`. That number is your **`TELEGRAM_CHAT_ID`**. For a private chat it's a plain positive number.
   - If you see `"result":[]`, send the bot another message and reload the page.
4. Close the tab. The address contains your token, so don't share it.

## 3. Create the Turnstile keys (Cloudflare)

1. Sign in at <https://dash.cloudflare.com> (a free account is enough; your domain doesn't need to be on Cloudflare).
2. In the left menu, open **Turnstile** and click **Add widget**.
3. Fill in:
   - **Widget name:** `eohwijang feedback`
   - **Hostnames:** add `eohwijang.fyi`. Also add `localhost` and `127.0.0.1` if you want to test the form on your computer (step 8).
   - **Widget mode:** **Managed**. It stays invisible for most people and only shows a checkbox when Cloudflare is unsure.
   - **Pre-clearance:** No.
4. Click **Create**. You get two keys:
   - **Site key** (starts with `0x4AAAA…`): public. It goes into GitHub in step 7.
   - **Secret key**: this is **`TURNSTILE_SECRET_KEY`**. Keep it private.

## 4. Generate the IP hash salt

This random string makes the stored IP hashes impossible to reverse. Run **one** of these and copy the 64-character result. That is your **`IP_HASH_SALT`**:

- Git Bash: `openssl rand -hex 32`
- PowerShell:
  ```powershell
  $b = New-Object byte[] 32; [Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($b); ($b | ForEach-Object { $_.ToString('x2') }) -join ''
  ```

## 5. Create the tables (Supabase SQL editor)

1. Open your project at <https://supabase.com/dashboard>, then **SQL Editor** → **New query**.
2. Paste the whole of [`supabase/feedback.sql`](supabase/feedback.sql) and click **Run**. It is safe to run again later.
3. Optional check: run the two `select` queries from the comment at the bottom of that file. Both tables should show `relrowsecurity = true`, and only `service_role` should be listed for the two `feedback_*` functions.

## 6. Set the secrets and deploy the function (Supabase CLI)

You need Node.js, which you already use for this project. `npx supabase` runs the Supabase CLI without installing it. Run these from the project folder, `C:\Default\работа\Project-Vocab`.

1. Log in. A browser window opens and asks you to confirm:
   ```
   npx supabase login
   ```
2. Link the project. Your **project ref** is the 20-letter id in your dashboard URL (`supabase.com/dashboard/project/<ref>`), also under **Project Settings → General**:
   ```
   npx supabase link --project-ref <your-project-ref>
   ```
   If it asks for the database password, press Enter to skip; it isn't needed here.
3. Put the four secrets in a temporary file, so they don't end up in your shell history. Create `supabase/functions/.env` (it's git-ignored) with exactly these four lines, using your own values and no quotes or spaces around `=`:
   ```
   TELEGRAM_BOT_TOKEN=7412345678:AAH...
   TELEGRAM_CHAT_ID=123456789
   TURNSTILE_SECRET_KEY=0x4AAAA...
   IP_HASH_SALT=3f9c...
   ```
4. Upload them, then delete the file:
   ```
   npx supabase secrets set --env-file supabase/functions/.env
   ```
   ```
   del supabase\functions\.env
   ```
   (In Git Bash, use `rm supabase/functions/.env` instead.)
5. Deploy the function:
   ```
   npx supabase functions deploy send-feedback --no-verify-jwt
   ```
   `--no-verify-jwt` is intentional: anyone may *submit* feedback, and the function itself does the protecting (Turnstile, limits, duplicate check). It never returns stored data.
6. Check: `npx supabase secrets list` should show the four names (values are hidden). In the dashboard, **Edge Functions** should list `send-feedback`.

**If something complains:**
- *"Docker is not running"* during deploy: add `--use-api`, i.e. `npx supabase functions deploy send-feedback --no-verify-jwt --use-api`.
- *"Cannot find config file"* or similar: run `npx supabase init`, answer **N** to every question, then repeat the step that failed. Don't commit the new `supabase/config.toml` unless you want to.

## 7. Add the site key to GitHub

1. On GitHub, open the repo → **Settings** → **Secrets and variables** → **Actions** → the **Variables** tab → **New repository variable**.
2. **Name:** `VITE_TURNSTILE_SITE_KEY`. **Value:** the Turnstile **site key** from step 3, not the secret key.
3. Deploy: **Actions** → **Deploy to GitHub Pages** → **Run workflow** on `main` (or push a commit). As with the other variables, don't use "Re-run" on an old run.

When the deploy finishes, **Words & data → Privacy & feedback → Send feedback**, the **Feedback & contact** link in the About page footer, and the button on /privacy open the form. The privacy page also gains its "If you send feedback" section.

## 8. (Optional) Test on your computer

1. Make sure `localhost` and `127.0.0.1` are in the widget's hostnames (step 3).
2. Add to `.env.local` (git-ignored), next to your Supabase values:
   ```
   VITE_TURNSTILE_SITE_KEY=0x4AAAA...
   ```
3. `npm run dev` and open the app. Local messages really are sent to Telegram.

## Where to look later

- **Messages that didn't reach Telegram** (all of them are saved first). Run in the SQL editor:
  ```sql
  select id, created_at, category, message, contact, send_error from public.feedback where not sent order by id desc;
  ```
- **Every message:** `select * from public.feedback order by id desc limit 50;`
- **Function logs:** Dashboard → **Edge Functions** → `send-feedback` → **Logs**. They only ever say things like `delivered`, `dropped: bot trap` or `rejected: rate limit`, never message text, contacts or IP data.
- **Rotating a secret** (e.g. a leaked bot token: send `/revoke` to @BotFather for a new one): `npx supabase secrets set TELEGRAM_BOT_TOKEN=<new token>`. No redeploy needed.

## Limits built in

| Rule | Value | What the sender sees |
|---|---|---|
| Message length | 10–2000 characters | Send stays disabled |
| Contact length | up to 100 characters | input stops |
| Per browser | 1 per 60 seconds | countdown |
| Per IP | 3 per 10 minutes, 10 per 24 hours | "Too many messages…" |
| Whole site | 100 saved messages per 24 hours | "Too many messages…" |
| Same text again within 24 hours | dropped | success (silently dropped) |
| Hidden honeypot filled, or sent < 3 s after opening | dropped | success (silently dropped) |
| Turnstile fails | rejected | "We could not confirm you are not a robot…" |
| Request body | up to 8 KB | — |

---

# Test plan

Do these after steps 1–7, on the live site. The test messages count toward your own IP's limits; step T6 resets them.

**Before you start:** the form allows one message per 60 seconds per browser. To skip the wait between tests, run this in the browser's DevTools console (F12 → Console) and reload:

```js
localStorage.removeItem('project-vocab:feedback-sent-at')
```

### T1. A normal message arrives

1. Open <https://eohwijang.fyi> → **Words & data** → **Send feedback**.
2. Choose **Bug** and type `Test 1: the form works`. In Contact, type `@yourname`.
3. Click **Send**. The button reads "Sending…", then the "Thank you!" panel appears with a 60-second countdown.
4. **Expect** within a few seconds in Telegram:
   ```
   📝 Bug
   Test 1: the form works

   👤 @yourname
   📚 1A/1과 · 🌐 en · v0.1.0+abc1234
   💻 Chrome 130 · Windows
   🕒 27 Oct 2026, 18:05 KST
   ```
5. SQL check: `select id, sent, send_error from public.feedback order by id desc limit 1;` should show `sent = true`.

### T2. The honeypot drops a bot

1. Clear the cooldown (above), reload, and open the form. Choose **Other** and type `Test 2: honeypot`.
2. Fill the hidden field by running this in the console:
   ```js
   const i = document.querySelector('input[name=website]');
   Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(i, 'http://spam.example');
   i.dispatchEvent(new Event('input', { bubbles: true }));
   ```
3. Click **Send**.
4. **Expect:** the form shows "Thank you!" (bots are told it worked), but **no** Telegram message arrives, and `select count(*) from public.feedback where message like 'Test 2%';` returns `0`. The function log shows `dropped: bot trap`.

### T3. The 4th message within 10 minutes is blocked

1. Run T6 first so you start from zero.
2. Send three different messages (`Test 3a …`, `Test 3b …`, `Test 3c …`, each at least 10 characters), clearing the cooldown and reloading between them. All three arrive in Telegram.
3. Send a fourth, `Test 3d …`, within 10 minutes of the first.
4. **Expect:** a red "Too many messages for now. Please try again later." under the form, no Telegram message, and `rejected: rate limit` in the function log.

### T4. An invalid Turnstile token is rejected

This one bypasses the website. In **Git Bash**, with your project ref filled in (no secrets involved):

```bash
curl -i -X POST "https://<your-project-ref>.supabase.co/functions/v1/send-feedback" \
  -H "Origin: https://eohwijang.fyi" -H "Content-Type: application/json" \
  -d '{"category":"bug","message":"Test 4: fake captcha token","contact":"","context":{},"token":"fake-token","website":"","elapsedMs":5000}'
```

**Expect:** `HTTP/2 403` and `{"error":"captcha"}`, with no Telegram message and no new row.
Bonus: change the Origin to `https://evil.example` and run it again. **Expect** `403 Forbidden` before anything else is checked.

### T5. HTML shows as plain text

1. Clear the cooldown, reload, open the form, choose **Idea**, and send:
   ```
   Test 5: <b>HTML</b> & <i>tags</i> <a href="https://example.com">link</a>
   ```
2. **Expect** the Telegram message to show those characters literally, `<b>HTML</b> & <i>tags</i> …`, with nothing bold, nothing italic and no clickable link.

### T6. Reset your test limits (afterwards)

In the SQL editor:

```sql
delete from public.feedback_hits;                          -- per-IP counters
delete from public.feedback where message like 'Test %';  -- the test messages (optional)
```

### Optional extras

- **Duplicate:** send the exact same text twice (clear the cooldown in between). The second shows "Thank you!", but only one Telegram message arrives.
- **Too fast:** a message sent less than 3 seconds after opening the form is silently dropped. It's hard to do by hand; bots trip it.
- **Offline:** in DevTools → Network, set throttling to **Offline**. The form shows "You need internet to send feedback."
- **Telegram down:** run `npx supabase secrets set TELEGRAM_CHAT_ID=1` and send a message. The form still says "Thank you!", and the row has `sent = false, send_error = 'telegram 400'`. Then set your real chat ID back.
