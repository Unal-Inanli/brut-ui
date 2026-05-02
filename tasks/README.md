# Task batch — generated 2026-05-02

Findings from a Workflow B (scan & optimize) pass on the BRUT codebase, packaged as atomic task briefs. Each file is self-contained — hand to a subagent without needing this README.

## How to use
1. Pick a task. Read the file end-to-end.
2. Brief a subagent with the file path. Subagent reads `AGENTS.md`, `SKILL.md`, and the listed analogue file before editing.
3. Subagent edits **only** the listed file. No collateral changes.
4. Run the verification block from the task file.
5. Move the file to `tasks/done/` once merged.

## Tasks

| ID | Title | Severity | Files | Effort | Dependencies |
|---|---|---|---|---|---|
| [T01](T01-rename-toast-module.md) | Rename `toast.js` → `toast-host.js` | DRIFT | `src/js/components/toast.js` | XS | — |
| [T02](T02-tabs-arrow-key-nav.md) | Arrow-key nav for tabs | A11Y | `src/js/components/tabs.js` | S | — |
| [T03](T03-segmented-arrow-key-nav.md) | Arrow-key nav for segmented | A11Y | `src/js/components/segmented.js` | S | — |
| [T04](T04-stepper-keyboard-increment.md) | Up/Down keys for stepper | A11Y | `src/js/components/stepper.js` | XS | — |
| [T05](T05-rating-arrow-key-nav.md) | Arrow-key nav for rating | A11Y | `src/js/components/rating.js` | XS | — |
| [T06](T06-dropzone-keyboard-access.md) | Keyboard-accessible dropzone | A11Y | `src/js/components/dropzone.js` | XS | — |
| [T07](T07-tokenize-spacing-values.md) | Tokenize spacing literals → `--sp-*` | POLISH | `src/components.css` | M | — |
| [T08](T08-tokenize-font-size-values.md) | Tokenize font-size literals → `--fs-*` | POLISH | `src/components.css` | S | — |
| [T09](T09-audit-non-token-pixel-values.md) | Audit non-token pixel values | POLISH (analysis) | writes `tasks/TOKENIZATION-DEFER.md` | M | T07, T08 |
| [T10](T10-document-or-remove-unreferenced-classes.md) | Document or remove 13 unreferenced classes | POLISH | `docs/index.html` and/or `src/components.css` | S–M | — |

## Parallelization
- T01–T08 are independent — fan out in parallel, one subagent per task.
- T09 must run **after** T07 + T08 land (it audits what they leave behind).
- T10 is independent of all others.

## What was checked but produced no task
- **Hard-constraint scans (gradients, rgba shadows, long transitions, ease curves)** — only sanctioned exceptions found (`.brut-select` chevron via `linear-gradient`; `.brut-scrim` overlay carries an inline comment marking it the only sanctioned use of transparency; the only transition over 80ms is 100ms, well under the 140ms cap).
- **Duplicate selector blocks** — none.
- **External JS deps** — none in any `src/js/components/*.js`.
- **Bundle hygiene** — `dist/brut.css` 73 KB, `dist/brut.js` 99 KB. Healthy for a no-minifier ship.
- **Orphan preview / docs sections** — none.
- **Naming convention drift in JS modules** — only `toast.js` (T01); all others align filename ↔ register name.

## Out of scope for this batch
- Visual redesign or token-value changes.
- New components.
- Build-system changes (the concat build is intentional — see AGENTS.md).
- Touching `dist/`.
