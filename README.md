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

`unit` must be one of `UNITS_1A` (`한글`, `1과` … `8과`). The "sample words" notice on the home screen disappears once the book has 100+ words.

## Adding books or words from the app

**Words & data → Add words** takes either:

- JSON: `[{ "unit": "1과", "ko": "학교", "uz": "maktab", "ru": "школа", "en": "school" }]`
- Tab-separated lines: `unit⇥ko⇥uz⇥ru⇥en` (a header row is skipped)

Choose an existing book or "New book…" (e.g. `1B`). Duplicate `unit + ko` pairs are skipped.

## Progress

Stored in `localStorage` per browser, per word, so changing the stage size (20–30) never loses progress. **Words & data → Backup** exports and restores everything (settings, mastery, added books and words) as one JSON file.

## Icons

`node scripts/make-icons.mjs` regenerates `public/` icons (the 어 mark in the emerald frame).
