# 어휘장 — Korean vocabulary trainer

Offline-first PWA for typing Korean vocabulary from memory, unit by unit, alongside the SNU Korean (서울대 한국어) textbooks. Prompts in Uzbek, Russian or English; answers always in Hangul. Not affiliated with Seoul National University.

## Run

```sh
npm install
npm run dev        # development
npm run build      # typecheck + production build with service worker (dist/)
npm run preview    # serve the build; install it as an app from the browser
```

## Adding the 1A word list

Replace the sample array in `src/data/vocab1A.ts`:

```ts
export const VOCAB_1A: VocabEntry[] = [
  { unit: '한글', ko: '아이', uz: 'bola', ru: 'ребёнок', en: 'child' },
  { unit: '1과', ko: '아래/ 밑', uz: 'past', ru: 'низ', en: 'below' }, // "/" = any form accepted
  // …
];
```

`unit` must be one of `UNITS_1A` (`한글`, `1과` … `8과`). The "sample words" notice on the home screen disappears once 1A has 100+ words.

## Adding collections or words from the app

**Words & data → Add words** (or **Add new collection** on the dashboard). Drop one or more `.txt`, `.tsv` or `.json` files onto the box, pick them with **Open file**, or paste text. Accepted formats:

- Plain lines, one word each: `Korean - Uzbek - Russian - English`. Columns are separated by a spaced dash (`-`, `–`, `—`), `|` or a tab; trailing translations may be left out. A line of its own like `1과`, `# Food` or `Unit 2` starts a new unit; without one, every word goes into unit `1`.

  ```
  1과
  학교 - maktab - школа - school
  선생님 - o'qituvchi - учитель - teacher
  ```

- Unit-first tab lines: `unit⇥ko⇥uz⇥ru⇥en` (a header row is skipped)
- JSON: `[{ "unit": "1과", "ko": "학교", "uz": "maktab", "ru": "школа", "en": "school" }]`, or `{ "book": "1B", "words": [...] }` to carry the collection name

Choose an existing collection or "New collection…" and give it a name (`1B`, `2A`, `Food` …; a single dropped file pre-fills it from the file name). Duplicate `unit + ko` pairs are skipped. Each unit is split into stages of the **Words per stage** setting (25 by default, 20–30), and added collections are saved in `localStorage`.

## Progress

Stored in `localStorage` per browser, per word, so changing the stage size (20–30) never loses progress. **Words & data → Backup** exports and restores everything (settings, mastery, added collections and words) as one JSON file.

## Cloud Sync (anonymous)

**Words & data → Cloud Sync** keeps memory levels, stage records and added collections in step across devices without any account: **Connect Cloud** creates a random 20-character Sync ID, and **Link this device** on another device pulls and merges that ID's progress. Merging never loses progress: each word keeps its higher memory level (the more recent review on a tie), stage records keep their best numbers, collections and words are unioned, and a deleted collection stays deleted. Settings stay per device. The app syncs on start, a few seconds after each change, and when it returns to the foreground.

Backend setup (one time):

1. Create a free [Supabase](https://supabase.com) project and run [`supabase/schema.sql`](supabase/schema.sql) in its SQL editor. The table is closed to the public API; browsers can only call `pull_vault`, `push_vault` and `delete_vault` with an exact Sync ID.
2. In the GitHub repo, open **Settings → Secrets and variables → Actions → Variables** and add `SUPABASE_URL` (Project URL) and `SUPABASE_ANON_KEY` (the anon / publishable key, which is public by design).
3. Re-run the deploy workflow. For local dev, put the same values in `.env.local` as `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

Without these values the app builds normally and the Cloud Sync section says it is not set up.

## Icons

`node scripts/make-icons.mjs` regenerates `public/` icons (the 어 mark in the emerald frame).
