---
name: brut-design
description: Use this skill to generate well-branded interfaces and assets for BRUT — a neo-brutalist UI kit (hard borders, hard offset shadows, loud color, no gradients). Ships one CSS bundle (`dist/brut.css`) plus an optional vanilla-JS runtime (`dist/brut.js`) for interactive form components — switch, checkbox, radio, segmented, tabs, stepper, password toggle, search clear, OTP, tag input, combobox, file/dropzone, character counter, rating, dialog. Static visuals and CSS-only form controls (textarea, select, range, color, fieldset) work with no script. For production code or throwaway prototypes/mocks. Contains design guidelines, tokens, fonts, assets, and component classes for prototyping.
user-invocable: true
---

Read the README.md file within this skill, and explore the other available files.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy `dist/brut.css` (and `dist/brut.js` if you use any interactive form component) out and create static HTML files for the user to view. If working on production code, link the dist bundles and read the rules here to become an expert in designing with this brand.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts using the BRUT classes.

## Quick reference for BRUT

- **Tokens:** `src/tokens.css` — every color, font, spacing, shadow, border lives here as a CSS variable. The token system covers color, type, spacing, shadows, borders, motion, **z-index** (`--z-base` … `--z-toast`), **semantic state aliases** (`--bg-success`, `--text-error`, `--border-warning`, …), and **scrim** (`--scrim-bg`, `--scrim-bg-soft` — the only sanctioned `rgba` use).
- **Components & layout:** `src/components.css` — every `.brut-*` class.
- **JS runtime:** `src/js/core.js` + `src/js/components/*.js` — one file per JS-bound component. Wire on `data-brut="<name>"`.
- **Bundles:** `dist/brut.css` is `tokens.css` + `components.css`. `dist/brut.js` is `core.js` + every `components/*.js`. **Ship the CSS file always; ship the JS file when you use any interactive form component.** Rebuild after any edit with `npm run build` or `bash build.sh`.
- **Hero rules:** `--font-display` (Archivo Black) for ALL CAPS headlines at 48px+. `--primary` (`#FFD23F`) for primary actions. `--shadow-md` (6px 6px 0 0 ink) is the default elevation.
- **Don'ts:** No gradients. No soft shadows. No rounded-corner-with-left-accent stripe. No emoji. No serif. No "ease-out" 300ms fades. No JS frameworks. No JSX. No React. No build-time preprocessor or transpiler. No new npm deps.
- **Do's:** Translate-on-press (no fade). 4px ink borders. Offset decorative rotated shapes in heroes. Pop colors used sparingly for category, never for decoration. Mirror JS-component state to a hidden `<input>` so forms post cleanly.
- **Voice:** Imperative, second-person, mouthy. Short sentences. Periods. No exclamation points.

## Components ready to use

All classes live in `src/components.css` (and bundled in `dist/brut.css`):

- **Static:** `.brut-btn` (+ `--primary`/`--ink`/`--pink`/`--lime`/`--sm`/`--lg`), `.brut-badge` (+ `--ok`/`--warn`/`--err`/`--info`), `.brut-card`, `.brut-alert` + `.brut-alert__icon`, `.brut-avatar`, `.brut-tags` + `.brut-tag` (+ `--ink`/`--lime`/`--pink`/`--blue`).
- **Inputs (CSS-only — no JS needed):** `.brut-input` (+ `--sm`/`--lg`/`--err`/`--ok`), `.brut-textarea`, `.brut-select`, `.brut-input-group` + `.brut-input-group__addon`, `.brut-range`, `.brut-color`, `.brut-fieldset` + `.brut-fieldset__legend`, `.brut-form`, `.brut-field` + `.brut-field__label`/`__hint`/`__error`/`__counter`, `.brut-label`.
- **Interactive (need `dist/brut.js` and `data-brut="…"`):** `.brut-switch`, `.brut-checkbox`, `.brut-radio`, `.brut-segmented` + `.brut-segmented__btn`, `.brut-tabs` + `.brut-tab`, `.brut-stepper`, `.brut-password`, `.brut-search`, `.brut-otp`, `.brut-tag-input`, `.brut-combobox`, `.brut-file`, `.brut-dropzone`, `.brut-rating`, `.brut-field__counter[data-brut="counter"]`, `.brut-dialog`.
- **Layout primitives:** `.brut-container`, `.brut-section`, `.brut-stack`, `.brut-cluster`, `.brut-bar`, `.brut-grid`, `.brut-split`, `.brut-rule`, `.brut-aspect`, `.brut-scrim`, `.brut-shape`, `.brut-spacer`. Compose pages without inline flexbox.
- **Typography:** `.brut-display-1`/`-2`/`-3`, `.brut-h1`–`.brut-h6`, `.brut-lead`, `.brut-body`, `.brut-small`, `.brut-caption`, `.brut-eyebrow`, `.brut-kicker`, `.brut-overline`, `.brut-quote`, `.brut-pull-quote`, `.brut-link`, `.brut-code`, `.brut-kbd`, `.brut-pre`, `.brut-list` (+ `--ord`/`--check`), `.brut-drop-cap`, `.brut-highlight`, `.brut-num`, `.brut-prose`.

## Wiring an interactive component

Every JS-bound component opts in via `data-brut="<name>"`. The runtime auto-initializes on `DOMContentLoaded`; for markup added later, call `Brut.init(root)` to wire any new instances. Re-init is a no-op.

```html
<link rel="stylesheet" href="dist/brut.css">
<script src="dist/brut.js" defer></script>

<label class="brut-switch" data-brut="switch">
  <input type="checkbox" name="notifications" hidden>
  <span class="brut-switch__knob"></span>
</label>
```

The hidden `<input>` is the source of truth — it posts with the surrounding form. Listen for `el.addEventListener('brut:change', e => …)`. The event detail always includes `e.detail.value` (the single, complete state — boolean, string, array, or object), plus optional component-specific extras.
