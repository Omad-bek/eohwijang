# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

React 18 + Vite + TypeScript + Tailwind CSS + vite-plugin-pwa. Offline-first installable PWA hosted on GitHub Pages at the root domain https://eohwijang.fyi/. Learner data lives in localStorage; an optional Supabase backend (RPC-only, no accounts) provides anonymous Cloud Sync and the shared global vocabulary.

## Users

Learners of Korean whose native or working language is Uzbek, Russian, or English. They study vocabulary stage by stage alongside the Seoul National University Korean (서울대 한국어) textbook series, often on a phone and often without a reliable connection.

Their job: reach 100% accurate Korean spelling and recall for each block of 20–30 words before moving on.

## Product Purpose

A vocabulary trainer that takes a learner from a prompt in their own language (Uzbek, Russian, or English) to the correct Korean word, spelled exactly right. Success is mastery, not exposure: a block counts as done only when every word in it is recalled and spelled correctly.

## Positioning

- Mapped to the SNU Korean textbook structure (starting with 1A: Hangul + Units 1–8), so a learner's study in the app tracks their coursework exactly.
- Trilingual prompts (Uzbek / Russian / English → Korean), with Uzbek as a first-class source language, which general Korean apps rarely support.
- A strict spelling-and-recall standard per block, rather than recognition-only flashcards.
- Works fully offline anywhere as an installed PWA.

## Operating Context

- Study is organized as textbook → book level (1A, …) → unit → block of 20–30 words.
- Learners type Korean (Hangul) to answer. Touch devices use the app's own onscreen 두벌식 keyboard with real jamo composition instead of the OS IME; desktop uses the system Korean IME.
- Sessions happen on the go: commutes, between classes, in places with no network.

## Capabilities and Constraints

- Shared content: SNU 1A, 1B and A2 vocabulary is published by the author to a `global_words` table through a hidden admin view (`/#admin`, server-verified token). It is the same for every learner, read-only, and cached for offline use. The bundled `src/data/vocab1A.ts` is empty or a sample.
- Strict data isolation: a learner's own collections and progress never mix with global content, and global content is never part of a learner's data or Sync vault.
- Custom import: learners add their own collections from `.txt`, `.tsv`, `.csv` or `.json` files or pasted text.
- Each word carries Uzbek, Russian, and English prompts mapped to one Korean answer.
- Exercise: typed recall in rounds. Missed words are re-queued and retyped, and spaced-repetition memory levels track each word. Learners can skip a word ("don't know").
- An unfinished quiz is saved after every answer and can be resumed ("Davom etish") for 30 minutes. Start, another stage, finishing, or 30 idle minutes discard it.
- Progress persistence: localStorage, plus JSON backup export, plus optional anonymous Cloud Sync keyed by a random Sync ID (no accounts, no email).
- UI language and prompt language are chosen independently (two switches). Romanization is never shown.
- Offline-first: the app shell and all content must work with no network after first load.
- **Open decisions:** audio/TTS pronunciation; the exact mastery threshold per block.

## Evidence on Hand

- Real 1A, 1B and A2 word lists exist in the `global_words` table, supplied by the author; none are committed to the repository. Do not fabricate entries, translations, or unit assignments.
- No testimonials, user counts, or affiliation with Seoul National University. Never imply endorsement by SNU or its publisher.

## Product Principles

1. **Exactness over exposure.** A word is learned when it is spelled correctly from memory; partial credit never counts as mastery.
2. **Follow the textbook.** The structure mirrors the SNU course so learners never have to translate between the app and their class.
3. **Three languages as equals.** Uzbek, Russian, and English prompts get the same quality and completeness; none is an afterthought.
4. **Offline is the default, not a fallback.** Every core flow works with no network, and the learner's progress is never lost silently.
5. **Small blocks, clear finish lines.** Work comes in blocks of 20–30 words, each with an unambiguous "mastered" state.

## Accessibility & Inclusion

- Hangul must render with proper Korean font coverage, alongside Latin (Uzbek, English) and Cyrillic (Russian) text.
- Typed-answer flows must handle Korean IME composition correctly (no premature checking mid-syllable), with both the system IME and the onscreen keyboard.
