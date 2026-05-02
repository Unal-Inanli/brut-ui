# AGENTS.md — Repository Instructions

## What this project is

**BRUT** is a neo-brutalist UI library distributed as one CSS bundle and one optional JS bundle. Think Bootstrap, but stripped down — `dist/brut.css` is the visual system; `dist/brut.js` is a tiny vanilla-JS runtime that wires the interactive form components (switch, checkbox, radio, stepper, OTP, combobox, file/dropzone, etc.). Static visual components and CSS-only form controls (textarea, select, range, color, fieldset, …) work with no script.

## Project layout

```
src/                  # source — edit these
  tokens.css          # design tokens (colors, type, spacing, shadows, borders, motion)
  components.css      # component classes + layout primitives
  js/
    core.js           # Brut runtime (registry + init + ready)
    components/       # one file per JS-bound component
      switch.js
      checkbox.js
      radio.js
      segmented.js
      tabs.js
      stepper.js
      password.js
      search.js
      otp.js
      tag-input.js
      combobox.js
      file.js
      dropzone.js
      counter.js
      rating.js
      dialog.js
dist/                 # built bundles — DO NOT hand-edit
  brut.css            # tokens.css + components.css concatenated
  brut.js             # core.js + every components/*.js concatenated
docs/index.html       # static Bootstrap-style docs page — links ../dist/brut.css and ../dist/brut.js
preview/*.html        # per-component playground demos — each links the dist bundles it needs
assets/               # brand marks (logo.svg, monogram.svg)
build.sh              # build script (concatenates CSS and JS sources into dist/)
package.json          # exposes `npm run build` (which calls bash build.sh)
README.md             # human docs — design philosophy, install, usage
SKILL.md              # agent skill manifest
```

## Build

After **any** edit to `src/`, rebuild:

```bash
npm run build      # or: bash build.sh
```

The build is intentionally trivial — it concatenates `tokens.css + components.css` into `dist/brut.css`, and `core.js + components/*.js` (alphabetical) into `dist/brut.js`, with a version banner on each. There are no preprocessors, no minifiers, no bundlers, no transpilers. If you find yourself wanting one, stop and ask the user first.

## How to add a new component

1. **Add the CSS** to `src/components.css` under the `FORMS — extended` banner (or the right component-group banner). Use only tokens from `src/tokens.css` (`var(--ink)`, `var(--sp-3)`, `var(--shadow-sm)`, …) — never hardcode hex/px/rgb.
2. **If the component needs interactivity**, add a JS file at `src/js/components/<name>.js` following the conventions in the next section.
3. **Create a preview page** at `preview/components-<name>.html` mirroring the existing pattern: `<link rel="stylesheet" href="../dist/brut.css"/>`, optional `<script src="../dist/brut.js"></script>` if the component is JS-bound, plus a minimal `<body>` that renders every variant. Use `preview/components-forms.html` as the template for form components, `preview/components-buttons.html` for static visual components.
4. **Add a docs section** to `docs/index.html` with:
   - Sidebar anchor (`<a href="#yourname">…</a>`) under the right `<h2>` group (`Forms`, `Components`, `Feedback`, …).
   - A `<section class="docs-section" id="yourname">` containing a `<h2>`, optional `<p class="lead">`, a `.docs-preview` block with a live render, and a `<pre class="docs-snippet">` with the raw HTML (HTML-entity-escape `<` and `>`).
5. **Rebuild** with `npm run build`.
6. **Verify** by opening `docs/index.html` and `preview/components-<name>.html` in a browser. Both must render with no console errors. JS-bound components must respond to clicks/keys; the hidden `<input>` should reflect state.

## How to refine an existing component

1. Edit `src/components.css` for visuals, `src/js/components/<name>.js` for behavior. Keep using existing tokens.
2. If the visible HTML shape changes, update both `preview/components-<name>.html` and the matching `<section>` in `docs/index.html` (live preview AND `<pre>` snippet) so they stay in sync.
3. Rebuild.
4. Open the docs page and the preview page and visually verify.

## How to add a new design token

1. Add the variable to `src/tokens.css` under the right `:root` section (color / type / spacing / shadow / border / motion).
2. If it deserves to be visible in the docs, add a row to the relevant Foundations section in `docs/index.html` (e.g. a swatch, a shadow card, a scale row).
3. Rebuild.

## JavaScript components

Behavior lives in `src/js/components/<name>.js`. Every file is a single IIFE that registers a component with the `Brut` runtime defined in `src/js/core.js`.

### The registration pattern

```js
(function () {
  if (!window.Brut) return;
  Brut.register('<name>', {
    selector: '[data-brut="<name>"]',
    init: function (el) {
      // wire `el` once
    }
  });
})();
```

`Brut.init(root = document)` runs every registered `init(el)` against every matching element under `root`, exactly once per element (a `__brutInit` flag is stamped to make re-init a no-op). On page load, `Brut.init(document)` runs automatically. For markup added later (modal contents, infinite scroll, etc.), call `Brut.init(newRoot)` after insertion.

### Conventions — match these in every new component

- **One component per file.** Filename is the component name (`stepper.js`, `tag-input.js`).
- **Hook on `data-brut="<name>"`.** Never select on a class name. Class names are visual; data attributes are behavioral. A consumer must be able to opt in by adding the attribute, and opt out by removing it.
- **No external dependencies.** No npm imports, no CDN links, no polyfills. Standard DOM and ES2015+ that runs everywhere modern browsers do (`addEventListener`, `querySelectorAll`, `classList`, `CustomEvent`, `dispatchEvent`, optional chaining is fine).
- **Idempotent init.** The `__brutInit` flag handles this for you — don't fight it. Don't bind global listeners on every init; if you need a global keydown listener, scope it to the element's open/close state.
- **Always `setAttribute('type', 'button')`** on any `<button>` you wire so it doesn't submit forms accidentally.
- **Mirror state to a hidden `<input>`** so the value posts cleanly with the surrounding form. Read `data-brut-name` to derive the input name; if no hidden input exists, create one. The hidden input is the source of truth.
- **Dispatch `CustomEvent('brut:change', { detail })`** on every committed state change. Components with a "completion" notion (OTP) also dispatch `brut:complete`. Consumers wire callbacks via `el.addEventListener('brut:change', …)`.
- **Keyboard support.** Click handlers should also respond to Space and Enter on focusable elements. Set `role`, `tabindex`, and `aria-checked` / `aria-selected` / `aria-expanded` where appropriate. The runtime won't add these for you.
- **Fail soft.** If required child elements are missing, return early — don't throw. The runtime catches throws and logs to the console, but a bad selector that matches nothing is the better outcome than a noisy error.
- **No animations longer than 140ms.** No fades. Match the visual language: snap, don't ease.

### Public events the runtime expects

| Event | When | Detail |
| --- | --- | --- |
| `brut:change` | A committed state change (after click, after Enter, after select). | Component-specific. Use `value` for single value, `checked` for booleans, `tags`/`files` for collections. |
| `brut:complete` | All required input collected (e.g. OTP fully filled). | `{ value }` |
| `brut:open` / `brut:close` | Dialog/popover transitions. | none |

### Hard constraints — do not cross these

- **No JS frameworks.** No React, Vue, Svelte, jQuery, Alpine, htmx. Plain DOM only.
- **No JSX.** All previously-existing JSX has been removed. Don't reintroduce it.
- **No transpilers.** No Babel, esbuild, swc, tsc. Source files run in the browser as-is. Stick to syntax that current evergreen browsers support natively (no decorators, no class fields beyond what V8 ships, etc.).
- **No new package dependencies.** `package.json` exists only to expose the `build` script. Do not add deps — runtime or dev.
- **No CSS preprocessors.** No Sass, Less, PostCSS, Tailwind, lightningcss. Plain CSS only.
- **No hardcoded design values in components.** If you reach for a hex, px, or rem that isn't a token, add a token first.
- **Visual rules** (carry over from the design system — see README.md for the full philosophy):
  - No gradients, no soft `rgba()` shadows, no rounded corners (except small radii for inputs/chips, pill 999px for tags), no emoji, no serif fonts.
  - Borders are 4px ink (3px small, 6–8px hero); colored borders only for error states.
  - Shadows are hard offset only (`Xpx Ypx 0 0 var(--ink)`), never blurred.
  - Hover lifts up-and-left and grows the shadow; press translates down-and-right and collapses the shadow. Snap, don't ease — 80–140ms transitions on `cubic-bezier(0.2, 0.8, 0.2, 1)`.

## Verifying changes

Before declaring work done:

1. `bash build.sh` exits 0 and prints non-zero byte counts for both `dist/brut.css` and `dist/brut.js`.
2. `docs/index.html` opens in a browser and every section renders. No 404s in the network panel, no console errors.
3. JS-bound components in the docs page actually respond to clicks/keys. The hidden inputs reflect state changes.
4. The component's `preview/*.html` opens and renders.
5. `grep -r "ui_kits\|jsx\|text/babel\|React\|require(\|import .* from " src/ docs/ preview/ AGENTS.md SKILL.md README.md` returns nothing.
6. Smoke test: drop `dist/brut.css` and `dist/brut.js` into a fresh HTML file, paste a snippet from the docs, and confirm it renders and behaves correctly with no other dependencies.

## When in doubt

- Use existing tokens before inventing new ones.
- Use existing layout primitives (`.brut-stack`, `.brut-cluster`, `.brut-grid`, `.brut-split`) before writing inline `display: flex`.
- For a JS component, copy the closest existing one and adapt — every component file in `src/js/components/` is small, documented at the top, and follows the same shape. Pick the one whose state model matches yours (`switch.js` for booleans, `combobox.js` for searchable selects, `tag-input.js` for collections, `dialog.js` for open/close).
- Match the existing voice in copy: imperative, second-person, terse, periods, no exclamation points.
- If a request would require a JS framework, a transpiler, a new dependency, or violating a visual rule above, **pause and ask the user** rather than working around the constraint.
