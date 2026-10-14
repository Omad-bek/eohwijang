---
name: 어휘장 Eohwijang
description: A dark Hangul recall drill, phone-first with a desktop dashboard, that takes each answer apart into its jamo, the way the 1446 Haerye explains the script.
colors:
  ink: "#0f172a"
  ink-2: "#141e33"
  ink-3: "#1e293b"
  rule: "#1e293b"
  rule-soft: "#18223a"
  hanji: "#e2e8f0"
  hanji-2: "#94a3b8"
  accent: "#10b981"
  accent-text: "#34d399"
  accent-wash: "#0c2a2a"
  danger: "#ef4444"
  danger-text: "#f87171"
  danger-wash: "#2b1622"
  amber: "#fbbf24"
  amber-wash: "#2a2416"
  indigo: "#a5b4fc"
  indigo-wash: "#1c2145"
  sky: "#7dd3fc"
  sky-wash: "#0f2639"
typography:
  display-unit:
    fontFamily: "'Gowun Batang', 'Nanum Myeongjo', 'AppleMyungjo', 'Batang', serif"
    fontSize: "52px"
    fontWeight: 700
    lineHeight: 1
  display-syllable:
    fontFamily: "'Gowun Batang', 'Nanum Myeongjo', 'AppleMyungjo', 'Batang', serif"
    fontSize: "40px"
    fontWeight: 700
    lineHeight: 1
  headline-prompt:
    fontFamily: "system-ui, -apple-system, 'Segoe UI', 'Apple SD Gothic Neo', 'Malgun Gothic', 'Noto Sans KR', 'Noto Sans CJK KR', Roboto, sans-serif"
    fontSize: "34px"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.01em"
  headline-serif:
    fontFamily: "'Gowun Batang', 'Nanum Myeongjo', 'AppleMyungjo', 'Batang', serif"
    fontSize: "22px"
    fontWeight: 700
    lineHeight: 1
  headword:
    fontFamily: "'Gowun Batang', 'Nanum Myeongjo', 'AppleMyungjo', 'Batang', serif"
    fontSize: "19px"
    fontWeight: 700
    lineHeight: 1.375
  chip-serif:
    fontFamily: "'Gowun Batang', 'Nanum Myeongjo', 'AppleMyungjo', 'Batang', serif"
    fontSize: "15px"
    fontWeight: 700
    lineHeight: 1
  title:
    fontFamily: "system-ui, -apple-system, 'Segoe UI', 'Apple SD Gothic Neo', 'Malgun Gothic', 'Noto Sans KR', 'Noto Sans CJK KR', Roboto, sans-serif"
    fontSize: "22px"
    fontWeight: 700
    lineHeight: 1.25
  answer-input:
    fontFamily: "system-ui, -apple-system, 'Segoe UI', 'Apple SD Gothic Neo', 'Malgun Gothic', 'Noto Sans KR', 'Noto Sans CJK KR', Roboto, sans-serif"
    fontSize: "24px"
    fontWeight: 600
  title-small:
    fontFamily: "system-ui, -apple-system, 'Segoe UI', 'Apple SD Gothic Neo', 'Malgun Gothic', 'Noto Sans KR', 'Noto Sans CJK KR', Roboto, sans-serif"
    fontSize: "16px"
    fontWeight: 700
    lineHeight: 1.25
  action:
    fontFamily: "system-ui, -apple-system, 'Segoe UI', 'Apple SD Gothic Neo', 'Malgun Gothic', 'Noto Sans KR', 'Noto Sans CJK KR', Roboto, sans-serif"
    fontSize: "15px"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.04em"
  body:
    fontFamily: "system-ui, -apple-system, 'Segoe UI', 'Apple SD Gothic Neo', 'Malgun Gothic', 'Noto Sans KR', 'Noto Sans CJK KR', Roboto, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.375
  body-small:
    fontFamily: "system-ui, -apple-system, 'Segoe UI', 'Apple SD Gothic Neo', 'Malgun Gothic', 'Noto Sans KR', 'Noto Sans CJK KR', Roboto, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.375
  caption:
    fontFamily: "system-ui, -apple-system, 'Segoe UI', 'Apple SD Gothic Neo', 'Malgun Gothic', 'Noto Sans KR', 'Noto Sans CJK KR', Roboto, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.33
  label:
    fontFamily: "system-ui, -apple-system, 'Segoe UI', 'Apple SD Gothic Neo', 'Malgun Gothic', 'Noto Sans KR', 'Noto Sans CJK KR', Roboto, sans-serif"
    fontSize: "11px"
    fontWeight: 700
    letterSpacing: "0.12em"
rounded:
  none: "0px"
spacing:
  frame-inset: "6px"
  shell-inset: "10px"
  gutter: "16px"
  gutter-wide: "20px"
  gutter-main: "32px"
  control-sm: "36px"
  control-md: "44px"
  control-lg: "52px"
  control-xl: "56px"
  navbar: "56px"
  navbar-md: "64px"
  sidebar: "288px"
  sidebar-lg: "320px"
  content-max: "1280px"
  column-max: "672px"
components:
  navbar:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.hanji}"
    height: "{spacing.navbar}"
    width: "{spacing.content-max}"
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.ink}"
    typography: "{typography.action}"
    rounded: "{rounded.none}"
    height: "{spacing.control-lg}"
    padding: "0 20px"
  button-primary-hover:
    backgroundColor: "{colors.accent-text}"
    textColor: "{colors.ink}"
  button-primary-disabled:
    backgroundColor: "{colors.ink-3}"
    textColor: "{colors.hanji-2}"
  button-primary-compact:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    height: "{spacing.control-md}"
    padding: "0 20px"
  button-outline:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.hanji}"
    rounded: "{rounded.none}"
    height: "{spacing.control-md}"
    padding: "0 16px"
  button-outline-hover:
    backgroundColor: "{colors.ink-3}"
    textColor: "{colors.hanji}"
  button-bar:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.hanji}"
    rounded: "{rounded.none}"
    height: "{spacing.control-sm}"
    padding: "0 10px"
  segmented-active:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    height: "34px"
  segmented-idle:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.hanji-2}"
    height: "34px"
  segmented-idle-hover:
    backgroundColor: "{colors.ink-3}"
    textColor: "{colors.hanji}"
  menu:
    backgroundColor: "{colors.ink-2}"
    textColor: "{colors.hanji}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    width: "176px"
  menu-item-hover:
    backgroundColor: "{colors.ink-3}"
    textColor: "{colors.hanji}"
  stage-card:
    backgroundColor: "{colors.ink-2}"
    textColor: "{colors.hanji}"
    rounded: "{rounded.none}"
    padding: "{spacing.gutter}"
  sample-chip:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.hanji}"
    typography: "{typography.chip-serif}"
    rounded: "{rounded.none}"
    padding: "4px 8px"
  progress-card:
    backgroundColor: "{colors.ink-2}"
    textColor: "{colors.hanji}"
    rounded: "{rounded.none}"
    padding: "{spacing.gutter}"
  progress-track:
    backgroundColor: "{colors.rule-soft}"
    height: "3px"
  progress-fill:
    backgroundColor: "{colors.hanji}"
    height: "3px"
  progress-fill-complete:
    backgroundColor: "{colors.accent}"
    height: "3px"
  unit-nav-item-active:
    backgroundColor: "{colors.ink-2}"
    textColor: "{colors.hanji}"
    rounded: "{rounded.none}"
    padding: "10px 12px"
  unit-pill:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.hanji}"
    rounded: "{rounded.none}"
    height: "40px"
    padding: "0 12px"
  unit-pill-active:
    backgroundColor: "{colors.hanji}"
    textColor: "{colors.ink}"
  quiz-card:
    backgroundColor: "{colors.ink-2}"
    textColor: "{colors.hanji}"
    rounded: "{rounded.none}"
    width: "{spacing.column-max}"
  input-answer:
    backgroundColor: "{colors.ink-2}"
    textColor: "{colors.hanji}"
    typography: "{typography.answer-input}"
    rounded: "{rounded.none}"
    height: "{spacing.control-xl}"
    padding: "0 16px"
  input-field:
    backgroundColor: "{colors.ink-2}"
    textColor: "{colors.hanji}"
    rounded: "{rounded.none}"
    height: "{spacing.control-md}"
    padding: "0 12px"
  kbd:
    backgroundColor: "{colors.ink-3}"
    textColor: "{colors.hanji}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "2px 6px"
  diff-cell-exact:
    backgroundColor: "{colors.accent-wash}"
    textColor: "{colors.accent-text}"
    typography: "{typography.display-syllable}"
    width: "84px"
  diff-cell-partial:
    backgroundColor: "{colors.amber-wash}"
    textColor: "{colors.amber}"
    typography: "{typography.display-syllable}"
    width: "84px"
  diff-cell-wrong:
    backgroundColor: "{colors.emerald-wash}"
    textColor: "{colors.accent-text}"
    typography: "{typography.display-syllable}"
    width: "84px"
  seal:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    size: "40px"
  sheet:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.hanji}"
    rounded: "{rounded.none}"
    width: "{spacing.column-max}"
---

# Design System: 어휘장 Eohwijang

## Overview

**Creative North Star: "Quiet Study Desk"**

A calm, cozy evening desk: soft slate instead of black, light slate-white type, and one warm emerald that means "go" and "you've got it". A single quiet slate outline frames the screen; thin column rules (계선) still stand behind the quiz field; mastered words and finished stages receive a tilted emerald 도장 seal. The signature move is unchanged: on a miss, each syllable becomes a cell with a Hangul syllable in serif at display size and a three-slot 초성 · 중성 · 종성 strip below it, and each slot shows its own verdict.

It is dark, flat and dense, and it should feel encouraging rather than stern. On a phone it is a single column for one hand on a commute with the Korean IME open; from 768px it opens into a study desk: a single-row top bar, a sidebar of books (1A, 1B, 2A … in textbook order) and units, and a grid of stage cards. Color appears only where it carries meaning: emerald for actions, progress, completion and the seal; amber for "almost / try again"; red only for wrong syllables in the typing diff and real errors.

**Key Characteristics:**
- Slate ground (`#0f172a`) with slate-200 type; depth comes from three slate steps, not from shadows.
- One 1px slate outline with softly rounded corners around the viewport; everything inside stays square.
- Gowun Batang 700 for Hangul words and book and unit identifiers; the system sans for everything else.
- Red never fills an action or frames the screen. It is a small error signal, nothing more.
- A rotated emerald seal is the only tilted object and the main reward.

## Colors

A calm slate palette with one motivating accent and three small signal inks.

### Primary
- **Emerald** (`accent`): fills every primary action (Start quiz, Start, Check/Continue, Next stage), the active segment of the prompt switch, the active-book underline, progress bars, mastered progress marks, completed-stage borders (45% at rest), the seal, the focus outline, the caret and text selection. Slate-900 text sits on it at about 7:1.
- **Emerald Text** (`accent-text`): emerald text on slate (correct syllables, success messages, a 100% percentage, language codes in the stacked prompt, the current-language check) and the hover fill for primary buttons.
- **Emerald Wash** (`accent-wash`): background tint of exact syllable cells.

### Signals
- **Amber** (`amber`, `amber-wash`): the gentle "not quite" ink. Partial-verdict syllables, level 1 memory badges, the retype label and answer border during review, the round counter after round 1 and the ring on missed progress marks.
- **Indigo** (`indigo`, `indigo-wash`): level 2 memory badges and bar segments.
- **Sky** (`sky`, `sky-wash`): "due for review" badges.
- **Red** (`danger`, `danger-text`, `danger-wash`): wrong, missing and extra syllables in the typing diff, invalid-file and storage errors, and the armed state of a destructive confirm button. Nothing else.

### Neutral
- **Ink** (`ink`, slate-900): the page ground, the navbar and sheet background, text on emerald fills, and inset grounds on raised panels.
- **Raised Ink** (`ink-2`): stage cards, the sidebar progress card, the active sidebar unit, the language menu, the quiz card at 768px and wider, input wells and notice boxes.
- **Lifted Ink** (`ink-3`, slate-800): hover fills, the kbd key, the disabled primary fill and the starting frame of the slot-ink animation.
- **Rule** (`rule`, slate-800): 1px structural rules, the screen outline, card and panel borders, outline-button borders and the scrollbar thumb.
- **Soft Rule** (`rule-soft`): rules between list rows, sample-chip borders, the quiz column rules, progress tracks and pending progress marks.
- **Hanji** (`hanji`, slate-200): primary text and the answer-field outline (at 70%, full on focus).
- **Muted Hanji** (`hanji-2`, slate-400): secondary text, labels, counts, idle icons and hover borders.

### Named Rules
**The Small Red Rule.** Red marks a specific mistake in a specific place (a syllable, a slot, a file) and never colors navigation, frames or primary actions. "Try again" states use amber, which reads as encouragement rather than failure.

**The Emerald Progress Rule.** Everything that moves you forward is emerald: the button that starts or continues, the bar that fills, the seal at 100%. Unfinished unit bars in the sidebar fill emerald at 60%; finished ones are full emerald.

**The Ladder Rule.** Memory levels climb amber → indigo → emerald seal, so the colors themselves tell the learner a word is settling in.

## Typography

**Display Font:** Gowun Batang 700, self-hosted with @fontsource (korean-700 and latin-700 subsets), falling back to Nanum Myeongjo, AppleMyungjo, Batang, serif
**Body Font:** the system sans stack (system-ui, -apple-system, Segoe UI, Apple SD Gothic Neo, Malgun Gothic, Noto Sans KR, Roboto, sans-serif)

**Character:** A woodblock myeongjo for the Korean words being learned, paired with a neutral native sans for every instruction, so the word you study always looks different from the interface around it.

### Hierarchy
The ramp is fixed-pixel, not fluid. Sans steps: 11 / 12 / 13 / 14 / 15 / 16 / 22 / 24 / 34px. Serif steps: 15 / 19 / 22 / 40 / 52px, with the named exceptions below.

- **Display unit** (serif 700, 52px at 768px and wider, 40px below, 1): the selected unit's name in the dashboard header.
- **Display syllable** (serif 700, 40px, 1): one Hangul syllable per diff cell.
- **Prompt** (sans 700, 34px, 1.1, -0.01em): the prompt word in the chosen prompt language, left-aligned. In "all" mode it becomes a stacked list at 24px with 11px Emerald Text language codes.
- **Serif headline** (serif 700, 22px, 1): book tabs and book titles in Data. The wordmark 어휘장 steps 20 / 22 / 26px (base / 640px / 768px) with tight tracking; the correct answer in review is 30px; the stage-size readout is 26px.
- **Headword** (serif 700, 19px): Korean words in lists (missed words, the last right answer). Unit identifiers in the sidebar list are 20px; the preview table and mobile unit pills use 17–18px.
- **Serif chip** (serif 700, 15px, 1): Korean sample chips on stage cards and the unit inside the quiz breadcrumb; the quiz unit tag uses 14px.
- **Title** (sans 700, 22px, 1.25): the Data page heading, the sheet title and the book-progress percentage. The stage-done heading is 26px.
- **Answer input** (sans 600, 24px): text typed into the answer field.
- **Title small** (sans 700, 16px, 1.25): stage-card titles. Manager section titles use 17px.
- **Action** (sans 700, 15px, 0.04em): text in thumb-zone primary buttons (sheet Start, Next stage, the labelled submit at 768px and wider). Compact buttons in cards, the quiz footer and Data use Body size at 600 (outline) or 700 (primary).
- **Body** (sans 400, 14px, ~1.375): glosses, table cells, menu items and secondary lines. **Body small** (13px) is used for counts, word ranges, hints, notes, alerts and the quiet text buttons. Hint prose is capped at 60ch.
- **Caption** (sans 400–600, 12px): tabular meta beside progress bars, unit word counts and percentages, the mastered-of line, diff notes and the struck typed jamo, the kbd hint line, and the interface-language code button (700, 0.06em). The quiz breadcrumb uses it in 600 uppercase at 0.12em.
- **Label** (sans 700, 11px, 0.12em, uppercase): form-field labels, section labels (Units, Missed words, Correct answer), the prompt-switch label, table column headers, the kbd key and the codes in the language menu (0.06em). Counts are tabular-nums.

### Named Rules
**The Hangul-In-Serif Rule.** Gowun Batang is used only for Korean words and for book and unit identifiers (1A, 3과). Sentences, labels, numbers and controls are always set in the system sans.

**The Quiz Rank Rule.** The quiz ranks its content with three sizes (34px prompt, 24px answer, 40px syllable cell) and with weight and case. It never uses color for ranking.

**The No-Fractions Rule.** Every text size is a whole-pixel step from the ramp above, and nothing functional is set below 11px.

## Layout

The app has a fixed height equal to the visual viewport (`--app-h`) so the Korean IME never pushes the layout around. The frame rule wraps the full viewport, 6px inside its edges (inside the safe-area insets top and bottom). Content sits 10px inside the frame (8px top and bottom, or the safe-area inset), and everything inside is capped at 1280px (max-w-7xl) and centered; the navbar's bottom rule still runs the full shell width.

**Navbar.** One row, 56px tall (64px at 768px and wider), 12px side padding (20px at 768px), gaps of 8px (12px from 640px). Left: the wordmark, which returns home, with the localized app name beside it from 1024px. Right: an offline marker (from 640px), the interface-language code button, the prompt switch (its label from 1024px, a "→ 한국어" target from 768px), and the Data button (icon only below 1280px). All three controls share a 36px outer height.

**Home below 768px.** One column: book tabs, the book-progress block and any notice in a 16px gutter; then a sticky horizontal scroller of unit pills (40px, 8px apart) under a 1px rule; then the selected unit's header and its stage cards in one column.

**Home at 768px and wider.** A dashboard: a 288px sidebar (320px from 1024px, 16/20px padding, 24px between blocks, a 1px rule on its right edge) holding book tabs, the progress card and the unit list, each scrolling independently of the main area. The main area has a 32px gutter: the unit header (display unit name, optional seal, and a word/stage count with a progress bar capped at 320px) above a 1px rule, then the stage-card grid. The grid is a container query on the main area: one column, two at 576px of container width (@xl), three at 896px (@4xl), with 16px gaps.

**Quiz.** A centered 672px column (max-w-2xl) with a 16px gutter. Below 768px the flashcard runs full-bleed with a fixed answer footer above a 1px rule. At 768px and wider it becomes a bordered Raised Ink card with 32px inner padding and 24px below it; the four soft column rules sit inside the card padding.

Control heights step through 36 / 44 / 48 / 52 / 56px; the prompt segments are 34px inside their 1px box so the switch matches the 36px controls beside it. The stage sheet docks to the bottom below 640px and centers at 640px and wider.

## Elevation & Depth

Fully flat. No box-shadow appears anywhere. Depth comes from three ink steps (ink, raised ink, lifted ink), from 1px rules, and for the stage sheet only from a black scrim at 70% plus a 1px Rule border. Panels (stage cards, the progress card, the quiz card, the language menu) are one ink step up from the page and bounded by a 1px rule; inset elements on a panel (sample chips, the unit tag, the answer well) step back down to Ink. The seal's 1px ring with a 2px ink offset is an impression, not a shadow.

### Named Rules
**The Flat Page Rule.** Surfaces never cast shadows. A layer separates from what is behind it by a scrim, a rule or one ink step.

## Shapes

Corners are square (0px) everywhere inside the screen outline: buttons, fields, segments, menus, cards, chips, pills, cells, sheets, progress marks and the seal. Borders are hairlines (1px) for structure and 1.5px for the answer field. The screen outline is a single 1px Rule stroke with 14px corners; it is the only rounded shape. Progress bars are 3px bars on a Soft Rule track. Missing syllables use a dashed border. The seal and completed progress marks are rotated -6°, and they are the only tilted shapes.

## Components

### Buttons
- **Shape:** square (0px).
- **Primary:** a Emerald fill with Ink text. Thumb-zone primaries use the Action style: 52px full width in the sheet, 48px in the stage-done footer, and the 56px square submit holding a return-arrow icon (it widens to icon plus label at 768px). Compact primaries (Start quiz on a stage card, Data actions) are 44px with 14px bold text.
- **Hover / Focus:** the fill lightens to Emerald Text. Focus uses the global 2px Emerald outline at a 2px offset.
- **Disabled:** a Lifted Ink fill with Muted Hanji text.
- **Outline:** a 1px Ink Rule border with Hanji text, 14px semibold, 44px tall (48px in the stage-done footer). On hover the border lightens to Muted Hanji; on a Raised Ink card it also fills Lifted Ink. A confirm-armed state fills it with Emerald.
- **Bar button:** the 36px outline used in the navbar (language code, Data) and for Back to levels in the quiz header: 1px Ink Rule border, 10px horizontal padding, a 15–16px icon plus a 12–13px label that hides at narrow widths.
- **Quiet:** icon plus 13px text in Muted Hanji that turns Hanji on hover (Show answer, Add book, close).

### Prompt switch
- **Style:** a 1px Ink Rule box holding 34px segments, at least 32px wide (40px from 640px), with bold uppercase language codes in the Label step. An optional 11px uppercase label sits to its left.
- **State:** the active segment is filled with Emerald and has Ink text. Idle segments are Muted Hanji and get a Lifted Ink fill and Hanji text on hover.

### Language menu
A bar button showing a translate icon, the current code and a chevron (from 640px) that rotates 180° when open. The menu drops 6px below, right-aligned, 176px wide on Raised Ink inside a 1px Ink Rule border, entering with the sheet-in motion. It opens with a Label heading, then one row per language: an 11px muted code, the language's own name in Body, and a Emerald Text check on the current one. Rows fill Lifted Ink on hover. It closes on outside click or Escape.

### Cards / Containers
- **Stage card:** Raised Ink, 1px Ink Rule border that lightens to Muted Hanji at 70% on hover (200ms); a completed stage uses Emerald at 45%, full on hover, and carries a 32px seal at top right. 16px padding (20px from 640px). Inside: a Title-small heading with a Body-small word range, a row of up to four Serif chips plus a "+N" count, a 3px progress bar with a Body-small mastered line and percentage, and a two-column footer of Preview (outline) and Start quiz (compact primary), pinned to the bottom so cards in a row align.
- **Sample chip:** Ink ground, 1px Soft Rule border, 4px by 8px padding, Serif chip type at 90% Hanji. It shows the first form of a slash alternative.
- **Progress card:** the sidebar's book progress: Raised Ink, 1px Ink Rule border, 16px padding, a 13px label, a 22px tabular percentage, a 3px bar and a 12px mastered-of line. Below 768px the same block appears unboxed.
- **Notice:** Raised Ink with a 1px Ink Rule border, 13px Muted Hanji text.

### Inputs / Fields
- **Answer field:** a 56px well with a 1.5px Hanji border at 70%, 24px semibold text, a Emerald caret and the placeholder at 85% Muted Hanji. It is Raised Ink on the phone footer and Ink inside the Raised Ink quiz card. On focus the border becomes full Hanji. In review the border turns Amber and the field shakes horizontally (260ms nudge) when the retype is wrong.
- **Form fields:** a Raised Ink well with a 1px Ink Rule border, 16px text and 44px height. On focus the border becomes Hanji. Labels use the Label role.
- **Key hint:** at 768px and wider, a kbd key (Lifted Ink, 1px Ink Rule border, Label type) followed by a 12px muted action word sits under the answer field.

### Navigation
- **Book tabs:** a horizontal strip of serif book titles (22px). The active title is Hanji with a 3px Emerald underline inset 8px; the others are Muted Hanji. A rule runs along the bottom of the strip, with a quiet Add book button at its end.
- **Sidebar unit list:** a Label heading, then one row per unit: the serif identifier (20px, Hanji at 80% when idle) beside a Caption word count, percentage and a 3px bar. The selected row is Raised Ink with a 1px Muted Hanji border at 60%; idle rows fill Raised Ink on hover.
- **Mobile unit pills:** 40px pills with a 17px serif identifier and a 12px percentage, 1px Ink Rule border. The selected pill is filled Hanji with Ink text (percentage at 70%).
- **Quiz header:** a Back to levels bar button, then the uppercase Caption breadcrumb (book · unit in Serif chip type · stage), then a 14px bold tabular count, then the seal progress row.

### Seal progress row (signature)
One square per word in the stage, up to 14px and shrinking to fit, 3px apart. A pending word is Soft Rule. The current word is filled Hanji, and gets a 2px Emerald ring if the learner has missed it. A word that was missed and is now queued shows an inset Emerald ring. A mastered word becomes a Emerald square rotated -6°, so the stage fills with seals.

### Jamo diff cells (signature)
Cells are 84px wide (a space becomes a 32px cell), with a 64px serif syllable above an optional 40px strip of three slots. Each cell takes the wash, border and text color of its verdict. In a partial cell, a correct slot shows the jamo in Emerald at 15px, and a wrong slot shows the typed jamo struck through at 12px above the expected jamo at 15px on a Emerald Wash. Wrong, missing and extra cells end in a 40px note row ("→ expected", 12px). Cells stagger in 70ms apart (cell-in, 420ms, expo-out). Slots fade from Lifted Ink to their verdict ink 200ms after their cell appears, then 60ms apart.

### Seal (도장)
A square of Emerald with the glyph (익힘, or 익 at small sizes) in serif 700, cut out in Ink. It has a 1px Emerald ring offset 2px by Ink and is rotated -6°. Sizes: 84px (stage complete, stamped in with seal-in over 520ms), 40px (a completed unit in the dashboard header), 32px (completed stage cards), 18px (mastered rows in the preview table). It is always aria-hidden and paired with text.

### Stage sheet
A bottom sheet on Ink, capped at 672px, with a 1px Rule top edge (a full border at 640px and wider). It slides up 24px over 320ms. Inside are a muted meta line, a title combining the serif unit and the sans stage name, a table of words with a sticky Raised Ink header row, and a full-width primary Start button.

## Do's and Don'ts

### Do:
- **Do** keep every corner square (0px) and every surface flat; separate with 1px Ink Rule or Soft Rule hairlines, and raise a panel only by one ink step inside a 1px rule.
- **Do** keep the quiet slate outline around the full viewport on every screen.
- **Do** use Emerald for filled actions, progress and completion, with Ink text on emerald fills.
- **Do** set Korean headwords and book and unit identifiers in Gowun Batang 700, and everything else in the system sans.
- **Do** show verdicts as wash plus border plus colored text, per syllable and per jamo slot.
- **Do** keep thumb-zone primary actions full width in a fixed footer on phones (48–56px tall); compact in-card actions are 44px.
- **Do** take text sizes from the documented ramp in whole pixels.
- **Do** give every animation a reduced-motion exit; motion uses the expo-out curve.

### Don't:
- **Don't** use red for anything except a specific mistake or error (the Small Red Rule).
- **Don't** add box-shadows or rounded corners inside the screen outline, and don't lift a panel with anything but one ink step and a 1px rule.
- **Don't** render verdicts as solid green or red letter chips, and don't introduce a second action color.
- **Don't** tilt anything other than the seal and mastered progress marks.
