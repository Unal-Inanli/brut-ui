---
name: brut-component-add
description: Scaffold a new BRUT component end-to-end (CSS, optional JS, meta, preview page, docs section). Use when the user asks to "add a X component", "build a X", "create a X". Follows Workflow A from CLAUDE.md.
---

# brut-component-add

Adds a new `.brut-<name>` component to the kit across all required surfaces. This skill encodes CLAUDE.md Workflow A as an executable procedure.

## When to use

- User says: "add a X component", "build a X", "create a X".
- A new component needs to be scaffolded from scratch.

## When NOT to use

- Adding a variant to an existing component — use `brut-variant-add`.
- Fixing or refreshing an existing component's docs section — use `brut-section-rewrite`.
- Generating only the metadata — use `brut-meta-backfill`.

## Inputs

One **component name** (kebab-case). Optionally the user specifies whether it's static (CSS-only) or interactive (needs JS).

## Phase 1 — Scope (before any edits)

Decide these three questions:

1. **Static or interactive?** Interactive = has state, keyboard handling, hidden input mirroring, or JS-driven behavior.
2. **Closest analogue.** Find the existing component most similar in behavior. Use its files as the structural template:
   - Boolean toggle → `switch.js`
   - Searchable select → `combobox.js`
   - Collection/multi-value → `tag-input.js`
   - Open/close overlay → `dialog.js`
   - Numeric input → `stepper.js`
   - One-of-N selection → `segmented.js` / `tabs.js`
   - CSS-only visual → `badge` or `alert` (CSS block patterns)
3. **New tokens needed?** If the component needs design values not covered by existing tokens, add them to the appropriate layer in `src/tokens/` FIRST, before any other work.

## Phase 2 — Build (sequential tasks)

Complete these in order. Each task touches exactly one file.

### Task 1: CSS class block
- **File:** `src/components.css`
- **Action:** Add the `.brut-<name>` block under the appropriate banner comment.
- **Rules:** BEM-flat naming (`.brut-<name>`, `.brut-<name>__<part>`, `.brut-<name>--<modifier>`). Use only tokens — no hex, px, or rem literals that don't match a token. Mirror hover/active treatment from `.brut-btn` for interactive surfaces.
- **Verify:** `grep -n "\.brut-<name>" src/components.css` returns the new block.

### Task 2: JS module (interactive only)
- **File:** `src/js/components/<name>.js`
- **Action:** Create a single IIFE that registers via `Brut.register('<name>', { selector: '[data-brut="<name>"]', init })`.
- **Rules:** No imports, no external libs, no `require()`. Must dispatch `brut:change` with `event.detail.value`. Must handle keyboard (Space/Enter minimum). Must mirror state to a hidden `<input>` if applicable. Must set `type="button"` on any wired buttons.
- **Template:** Copy the analogue component's JS structure, then adapt.
- **Verify:** File is a single IIFE, registers on `data-brut="<name>"`.

### Task 3: Meta sidecar (interactive only)
- **File:** `src/js/components/<name>.meta.js`
- **Action:** Create metadata file mirroring `carousel.meta.js` field order.
- **Rules:** See `brut-meta-backfill` skill for full field rules. All data must trace back to the JS/CSS just written.
- **Verify:** `node -e "import('./src/js/components/<name>.meta.js').then(m=>{const e=m.default;if(!e.name||!e.description||!e.useCases?.length||!e.kind||!e.class||!e.examples?.length)throw 0;console.log('ok')})"` prints `ok`.

### Task 4: Preview page
- **File:** `preview/components-<name>.html`
- **Action:** Create a standalone HTML page linking `../dist/brut.css` (and `../dist/brut.js` if interactive). Show every variant.
- **Template:** Copy structure from an existing preview page (e.g., `preview/components-carousel.html`).
- **Verify:** File exists, links correct dist paths, contains all variants.

### Task 5: Docs section
- **File:** `docs/index.html`
- **Action:** Add sidebar anchor + `<section class="docs-section" id="<name>">` with live preview and escaped `<pre class="docs-snippet">`.
- **Rules:** Lead paragraph comes from the component's description (manifest or meta). Snippet must match the preview div exactly.
- **Verify:** Section has `id="<name>"`, sidebar has matching anchor.

### Task 6: Build & verify
```bash
# Build
pnpm build

# Constraint check
grep -rE "jsx|text/babel|React|require\(|import .* from " src/ docs/ preview/

# Bundle exists
test -s dist/brut.css && test -s dist/brut.js && echo "ok"
```

### Task 7: Browser verify
Open `docs/index.html` and `preview/components-<name>.html` in a browser. Check:
- No 404s in console
- No JS errors
- Interactive components respond to click + Space/Enter
- Hidden input reflects state (if applicable)
- All variants render correctly

## Verification summary

All of these must pass before reporting done:
1. `pnpm build` exits 0
2. No forbidden patterns in source (`grep` above returns empty)
3. Preview page renders all variants
4. Docs section lead paragraph matches description
5. Docs snippet matches preview div
6. JS components handle click + keyboard + emit `brut:change`

## Hard rules

- No new dependencies, frameworks, transpilers, or preprocessors.
- No hardcoded colors/px/rem — use tokens from `src/tokens/`.
- No animations > 140ms (loader animations exempt with comment).
- No `rgba()` — use `--scrim-bg` / `--scrim-bg-soft` tokens.
- No gradients (checkmark glyph is sole exception).
- No rounded corners beyond input/tag radii.
- Class root must match `data-brut` hook: `.brut-<name>` ↔ `data-brut="<name>"`.
- One component per invocation.
