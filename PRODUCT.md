# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

React 18 + Vite + TypeScript + Tailwind CSS + vite-plugin-pwa. Offline-first installable PWA; all user data persisted in localStorage (no backend, no accounts).

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
- Learners type Korean (Hangul input) to answer, so the app depends on the device's Korean keyboard/IME, on both mobile and desktop.
- Sessions happen on the go: commutes, between classes, in places with no network.

## Capabilities and Constraints

- Built-in content: SNU Korean 1A vocabulary (Hangul section + Units 1–8) as the first dataset; later books to follow.
- Custom import: learners can add their own vocabulary via JSON or plain-text import.
- Each word carries Uzbek, Russian, and English prompts mapped to one Korean answer.
- Progress, mastery state, and imported decks live in localStorage; an export/backup path is advisable since clearing browser data erases progress (not yet decided).
- Offline-first: the app shell and all built-in content must work with no network after first load.
- **Open decisions:** the exercise formats beyond typed recall (spaced repetition, quizzes, audio/TTS pronunciation) were not confirmed; the exact mastery and retry rules per block; how UI language is chosen (likely matching the selected prompt language); whether romanization is shown.

## Evidence on Hand

- No vocabulary data exists in the repository yet. The SNU 1A word list must be supplied by the user; do not fabricate entries, translations, or unit assignments.
- No testimonials, user counts, or affiliation with Seoul National University. Never imply endorsement by SNU or its publisher.

## Product Principles

1. **Exactness over exposure.** A word is learned when it is spelled correctly from memory; partial credit never counts as mastery.
2. **Follow the textbook.** The structure mirrors the SNU course so learners never have to translate between the app and their class.
3. **Three languages as equals.** Uzbek, Russian, and English prompts get the same quality and completeness; none is an afterthought.
4. **Offline is the default, not a fallback.** Every core flow works with no network, and the learner's progress is never lost silently.
5. **Small blocks, clear finish lines.** Work comes in blocks of 20–30 words, each with an unambiguous "mastered" state.

## Accessibility & Inclusion

- Hangul must render with proper Korean font coverage, alongside Latin (Uzbek, English) and Cyrillic (Russian) text.
- Typed-answer flows must handle Korean IME composition correctly (no premature checking mid-syllable).
