---
name: brut-design
description: Use this skill when designing interfaces with BRUT — a neo-brutalist HTML+CSS+JS UI kit (hard borders, hard offset shadows, loud color, no gradients) — or when adding/refining components inside the kit itself. Ships as one CSS bundle (dist/brut.css) plus an optional vanilla-JS runtime (dist/brut.js) that auto-wires interactive form components via data-brut hooks. No frameworks, no transpilers, no dependencies.
license: MIT
compatibility: opencode
metadata:
  domain: design
  style: neo-brutalist
  output: html-css-js
---

Read the README.md and AGENTS.md at the repo root before making non-trivial changes. This file is a quick-reference; those two are authoritative.

## Two modes — pick the right one

**Mode A — Designing with the kit** (mocks, prototypes, marketing pages, app screens). Link `dist/brut.css` and `dist/brut.js`, compose with the `.brut-*` classes and `data-brut="<name>"` hooks documented below. Don't hand-edit anything in `dist/`.

**Mode B — Working on the kit itself** (adding or refining components). Edit sources under `src/`, then rebuild. The full add-component recipe is in [AGENTS.md](../../../AGENTS.md). See "Build-phase rules" at the bottom of this file.

If the user invokes the skill without guidance, ask which mode and what they want to build.

---

## Quick reference for BRUT

- **Source of truth:** `src/tokens.css` (every color, font, spacing, shadow, border, motion lives here as a CSS variable) and `src/components.css` (every `.brut-*` class).
- **Bundles:** `dist/brut.css` = `tokens.css + components.css` concatenated; `dist/brut.js` = `src/js/core.js + src/js/components/*.js` concatenated. Rebuild with `npm run build` or `bash build.sh` after any `src/` edit.
- **Install** (consumer):
  ```html
  <link rel="stylesheet" href="dist/brut.css"/>
  <script src="dist/brut.js" defer></script>  <!-- only if you use any data-brut="…" component -->
  ```
- **Hero rules:** `--font-display` (Archivo Black) for ALL CAPS headlines at 48px+. `--primary` (`#FFD23F`) for primary actions. `--shadow-md` (`6px 6px 0 0 var(--ink)`) is the default elevation.
- **Don'ts:** No gradients. No soft/blurred shadows — `rgba()` shadows are forbidden, only `Xpx Ypx 0 0 var(--ink)`. No rounded corners except small radii on inputs/chips and pill 999px on tags. No emoji. No serif. No fades or 300ms ease-outs. No JS frameworks, JSX, transpilers, npm dependencies, or CSS preprocessors.
- **Do's:** Translate-on-press, snap-on-hover (80–140ms on `cubic-bezier(0.2, 0.8, 0.2, 1)` — use `var(--dur-fast)` + `var(--ease-snap)`). 4px ink borders by default (3px small, 6–8px hero). Colored borders only for `--err` state. Pop colors used sparingly for category, never for decoration.
- **Voice:** Imperative, second-person, terse. Periods. No exclamation points.

---

## Components ready to use

All classes ship in `dist/brut.css`; JS-bound components auto-wire via `data-brut="<name>"` when `dist/brut.js` is loaded. Rebuilds run alphabetically — see [src/js/components/](../../../src/js/components/) for the canonical list.

### Static (CSS only)

- **Buttons:** `.brut-btn` + `--primary`/`--ink`/`--pink`/`--lime`/`--sm`/`--lg`.
- **Badges:** `.brut-badge` + `--ok`/`--warn`/`--err`/`--info`.
- **Card:** `.brut-card`.
- **Alert:** `.brut-alert` + `.brut-alert__icon` + `--ok`/`--warn`/`--err`/`--info`.
- **Avatar:** `.brut-avatar`.
- **Tags (read-only):** `.brut-tag` + `.brut-tag__x`, color modifiers `--lime`/`--pink`/etc.
- **Form scaffolding:** `.brut-form`, `.brut-field` + `.brut-field__label`/`__hint`/`__error`/`__counter`, `.brut-input` (+ `--sm`/`--lg`/`--err`/`--ok`), `.brut-textarea`, `.brut-select`, `.brut-input-group` + `.brut-input-group__addon`, `.brut-fieldset` + `.brut-fieldset__legend`, `.brut-range`, `.brut-color`.

### JS-bound (require `dist/brut.js`, hook on `data-brut="…"`)

| Component | `data-brut` | Class root |
| --- | --- | --- |
| Switch | `switch` | `.brut-switch` + `__knob` + `--on` |
| Checkbox | `checkbox` | `.brut-cb` + `--on` |
| Radio | `radio` | `.brut-radio` + `--on` |
| Segmented | `segmented` | `.brut-seg` + `__btn` |
| Tabs | `tabs` | `.brut-tabs` + `.brut-tab` |
| Stepper (numeric) | `stepper` | `.brut-stepper` + `__btn`/`__input` |
| Password (show/hide) | `password` | `.brut-password` + `__toggle` |
| Search (clear button) | `search` | `.brut-search` + `__clear` |
| OTP / PIN | `otp` | `.brut-otp` |
| Tag input | `tag-input` | `.brut-tag-input` + `__field` |
| Combobox | `combobox` | `.brut-combobox` + `__list`/`__opt`/`__empty` |
| File | `file` | `.brut-file` + `__btn`/`__name` |
| Dropzone | `dropzone` | `.brut-dropzone` + `__hint`/`__sub` |
| Character counter | `counter` | `.brut-field__counter` (paired with `data-brut-for="<id>"`) |
| Rating | `rating` | `.brut-rating` + `__star` |
| Dialog | `dialog` | `.brut-dialog` + `__head`/`__x`, with `.brut-scrim` sibling |

All JS-bound components dispatch `CustomEvent('brut:change', { detail })` on commit; OTP also dispatches `brut:complete`; dialog dispatches `brut:open`/`brut:close`. The hidden `<input>` inside each is the source of truth — value posts cleanly with the surrounding form.

### Layout primitives

`.brut-container`, `.brut-section` (+ `--ink`/`--primary`/`--lime`/`--pink`), `.brut-stack` (+ `--xs`/`--sm`/`--md`/`--lg`/`--xl`/`--2xl`), `.brut-cluster` (+ size + `--end`/`--center`/`--between`), `.brut-bar`, `.brut-grid` (+ `--2`/`--3`/`--4`/`--6` + `--tight`/`--loose`), `.brut-split` + `.brut-split__main`/`__side`, `.brut-rule`, `.brut-aspect`, `.brut-scrim`, `.brut-shape`, `.brut-spacer`. Compose pages with these — don't reach for inline flexbox.

### Typography

`.brut-display-1`/`-2`/`-3`, `.brut-h1`–`.brut-h6`, `.brut-lead`, `.brut-body`, `.brut-small`, `.brut-caption`, `.brut-eyebrow`, `.brut-kicker`, `.brut-overline`, `.brut-quote`, `.brut-pull-quote`, `.brut-link`, `.brut-code`, `.brut-kbd`, `.brut-pre` (with `.tok-comment`/`.tok-keyword`/`.tok-string`/`.tok-num` highlight tokens), `.brut-list` (+ `--ord`/`--check`), `.brut-drop-cap`, `.brut-highlight`, `.brut-num`, `.brut-prose`.

### Reference pages

- `docs/index.html` — single-page docs with sidebar + live previews + escaped snippets.
- `preview/components-*.html` — per-component playgrounds (one HTML file per component).
- `demos/` — full-page compositions (`landing.html`, `login.html`, …) showing the kit in real layouts.

---

## Build-phase rules (Mode B — adding/refining components)

When editing the kit itself, [AGENTS.md](../../../AGENTS.md) is the authoritative recipe. The constraints below are the ones most often violated mid-build — keep them green.

### File layout — what goes where

```
src/tokens.css                # add new design tokens here, under the right :root group
src/components.css            # add CSS under the right /* BANNER */ — don't invent a home if one fits
src/js/components/<name>.js   # one IIFE per JS-bound component (mirror src/js/components/switch.js)
preview/components-<name>.html  # playground demoing every variant
docs/index.html               # add a sidebar <a href="#<id>"> + a <section class="docs-section" id="<id>">
dist/brut.css, dist/brut.js   # NEVER hand-edit — produced by build.sh
```

### Component conventions (must match every existing component)

- **Hook on `data-brut="<name>"`** — never on a class name. Class names are visual; data attributes are behavioral.
- **One component per JS file.** Filename = component name. Single IIFE that calls `Brut.register(name, { selector, init })`.
- **Idempotent init.** The `__brutInit` flag handles this for you — don't fight it.
- **Always `setAttribute('type', 'button')`** on any `<button>` you wire so it doesn't submit forms accidentally.
- **Mirror state to a hidden `<input>`** if the value should post with a form. Read `data-brut-name` for the input name.
- **Dispatch `CustomEvent('brut:change', { detail })`** on every committed state change. Open/close pairs use `brut:open` / `brut:close`. Completion-style components also dispatch `brut:complete`.
- **Keyboard support.** Click handlers must also respond to Space and Enter. Set `role`, `tabindex`, and `aria-checked`/`aria-selected`/`aria-expanded` where appropriate.
- **Fail soft.** If required child elements are missing, return early — don't throw.
- **No animations longer than 140ms.** Snap, don't ease. No fades.
- **Use only tokens.** No hex/px/rem literals that aren't already tokens. If you need a value that doesn't exist, **add the token first** in `src/tokens.css`.

### Hard constraints — do not cross

- No JS frameworks (React, Vue, Svelte, jQuery, Alpine, htmx).
- No JSX. No transpilers (Babel, esbuild, swc, tsc). Source runs in browsers as-is.
- No npm dependencies — runtime or dev. `package.json` exists only to expose the build script.
- No CSS preprocessors. No Tailwind, Sass, Less, PostCSS, lightningcss.
- No hardcoded design values in components. If you reach for a hex/px/rem that isn't a token, add a token first.

If a request would require any of the above, **pause and ask the user** rather than working around it.

### Build + verify before declaring done

```bash
npm run build     # or: bash build.sh
```

- Build exits 0 and prints non-zero byte counts for both `dist/brut.css` and `dist/brut.js`.
- Open `docs/index.html` and `preview/components-<name>.html` — every section renders, no 404s, no console errors.
- JS-bound components respond to clicks and Space/Enter; the hidden `<input>` reflects state changes.
- Sanity grep — must return nothing:
  ```bash
  grep -r "ui_kits\|jsx\|text/babel\|React\|require(\|import .* from " src/ docs/ preview/
  ```

### When in doubt

- Use existing tokens before inventing new ones.
- Use existing layout primitives (`.brut-stack`, `.brut-cluster`, `.brut-grid`, `.brut-split`) before writing inline `display: flex`.
- For a JS component, copy the closest existing one and adapt — pick by state model: `switch.js` for booleans, `combobox.js` for searchable selects, `tag-input.js` for collections, `dialog.js` for open/close.
- Match the existing voice in copy: imperative, second-person, terse, periods, no exclamation points.
