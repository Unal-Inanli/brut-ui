# AGENTS.md — Repository Instructions

> **Direction of travel:** BRUT is mid-evolution to a Vite-built, themeable, configurable, AI-native framework. The "no build tools / no dependencies" hard constraints below remain authoritative for any task NOT explicitly tagged with one of the 1.0 milestones (M1–M8). The *spirit* — consumer never installs a bundler, runtime stays framework-free — is permanent. See [CLAUDE.md](CLAUDE.md) "1.0 Roadmap" and the `project_brut_*` memory entries for locked decisions, rationale, and per-milestone activation rules for new workflows (Workflow C: add a theme, D: add utilities, E: bump a token, F: add a variant, G: generate a manifest entry).

> **Before significant work, read [ARCHITECTURE.md](ARCHITECTURE.md).** It is the principal-engineer review of the kit post-M7 — covers structurally-sound patterns to preserve, accumulating debt, two known class-root convention violations (counter, tooltip), and the prioritized next-quarter follow-ups. Tooling (`brut doctor`, `scripts/check-manifest.js`) catches surface drift; ARCHITECTURE.md catches the structural drift the tools can't yet see.

## What this project is

**BRUT** is a neo-brutalist UI library distributed as one CSS bundle and one optional JS bundle. Think Bootstrap, but stripped down — `dist/brut.css` is the visual system; `dist/brut.js` is a tiny vanilla-JS runtime that wires the interactive form components (switch, checkbox, radio, stepper, OTP, combobox, file/dropzone, etc.). Static visual components and CSS-only form controls (textarea, select, range, color, fieldset, …) work with no script.

## Project layout

```
src/                  # source — edit these
  tokens/             # design tokens — 3-layer architecture
    01-primitives.css # raw values (hex, px, font stacks, motion)
    02-semantic.css   # role aliases (bg/fg, state, scrim, shadows)
    03-intent.css     # component sizing + layout dimensions
    index.css         # base element styles + type utilities
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
  brut.css            # tokens/*.css + components.css concatenated
  brut.js             # core.js + every components/*.js concatenated
docs/index.html       # static Bootstrap-style docs page — links ../dist/brut.css and ../dist/brut.js
preview/*.html        # per-component playground demos — each links the dist bundles it needs
assets/               # brand marks (logo.svg, monogram.svg)
package.json          # exposes `pnpm build` (Vite lib-mode build)
README.md             # human docs — design philosophy, install, usage
SKILL.md              # agent skill manifest
```

## Build

After **any** edit to `src/`, rebuild:

```bash
pnpm build
```

The build is intentionally trivial — it concatenates `tokens/*.css + components.css` into `dist/brut.css`, and `core.js + components/*.js` (alphabetical) into `dist/brut.js`, with a version banner on each. There are no preprocessors, no minifiers, no bundlers, no transpilers. If you find yourself wanting one, stop and ask the user first.

## How to add a new component

1. **Add the CSS** to `src/components.css` under the `FORMS — extended` banner (or the right component-group banner). Use only tokens from `src/tokens/` (`var(--ink)`, `var(--sp-3)`, `var(--shadow-sm)`, …) — never hardcode hex/px/rgb.
2. **If the component needs interactivity**, add a JS file at `src/js/components/<name>.js` following the conventions in the next section.
3. **Create a preview page** at `preview/components-<name>.html` mirroring the existing pattern: `<link rel="stylesheet" href="../dist/brut.css"/>`, optional `<script src="../dist/brut.js"></script>` if the component is JS-bound, plus a minimal `<body>` that renders every variant. Use `preview/components-forms.html` as the template for form components, `preview/components-buttons.html` for static visual components.
4. **Add a docs section** to `docs/index.html` with:
   - Sidebar anchor (`<a href="#yourname">…</a>`) under the right `<h2>` group (`Forms`, `Components`, `Feedback`, …).
   - A `<section class="docs-section" id="yourname">` containing a `<h2>`, optional `<p class="lead">`, a `.docs-preview` block with a live render, and a `<pre class="docs-snippet">` with the raw HTML (HTML-entity-escape `<` and `>`).
5. **Rebuild** with `npm run build`.
6. **Verify** by opening `docs/index.html` and `preview/components-<name>.html` in a browser. Both must render with no console errors. JS-bound components must respond to clicks/keys; the hidden `<input>` should reflect state.

## How to write a `<name>.meta.js`

Every interactive component must ship a sidecar manifest at `src/js/components/<name>.meta.js`. The Vite plugin reads these at build time and merges them into `dist/components.json`, which the `@sprtn/mcp` server exposes to AI agents.

Mirror `src/js/components/carousel.meta.js` exactly — field order, schema, naming.

**Required fields** (build emits a warning if missing):

- `name` — string matching the component name (e.g. `'switch'`).
- `description` — one concrete sentence, present tense, third person. Tells what the component does, not why. Example: "Boolean toggle. On/off state mirrored to a hidden input."
- `useCases` — array of 3–5 short noun phrases describing real consumer scenarios. Example: `['theme toggle', 'feature flag', 'settings boolean']`.
- `kind` — `'interactive'` for components with JS, `'static'` for CSS-only.
- `class` — the component's root class, with leading dot. Example: `'.brut-switch'`.
- `examples` — array of `{ title, html }`. Each `html` is a complete copy-pasteable markup snippet.
- `responsive` — interactive components only. Object with `shape` (one of the nine canonical shapes — `static | stack | fullscreen-modal | bottom-sheet | horizontal-scroll | ellipsis-collapse | disclosure-toggle | wrap | hover-fallback`), optional `breakpoint` (`sm | md | lg`), optional `notes` (≤120 chars). See [docs/responsive-shapes.md](./docs/responsive-shapes.md) for the full glossary.

**Optional but recommended fields:**

- `selector` — the data-attribute selector. Always `[data-brut="<name>"]` for interactive components.
- `modifiers` — array of class-modifier strings (e.g. `['--sm', '--lg']`). Empty array if none.
- `dataAttributes` — array of `{ name, values, description }` documenting consumer-facing data-* attributes.
- `events` — array of `{ name, detail }`. Use the `brut:` prefix.
- `formState` — `{ hiddenInput: <bool>, name: <note> }`. `true` for components mirroring to a real form input.
- `a11y` — `{ role, roledescription, keyboard: [...], aria: [...], notes }`. Fields are individually optional but `keyboard` should be `[]` when no keyboard interaction exists.

**Static components in M7** ship the 4-field stub (`name, class, selector, kind`) only. Backfill is post-M7.

**Validation:** the Vite plugin's `validateMetaEntry` warns at build time. `node scripts/check-manifest.js` is the deterministic gate. `npx brut doctor` flags `MISSING_META` and `META_DRIFT`.

**See also:** `docs/manifest-schema.md` (human-readable reference), `dist/manifest-schema.json` (JSON Schema), `src/js/components/carousel.meta.js` (canonical exemplar).

## AI-native conventions

BRUT is designed so AI agents can scaffold pages without crawling source. These conventions make the kit predictable for LLMs:

- **Class root === component name.** Hook `data-brut="switch"` ⇒ class root `.brut-switch`, never `.brut-cb`. No abbreviations.
- **One selector per interactive.** Always `[data-brut="<name>"]`. No compound or attribute-based selectors.
- **Single event per state change.** Components dispatch `brut:change` (or `brut:open`/`brut:close`) with the new state in `event.detail.value`. The `value` key is always present.
- **Examples are self-contained.** Every `examples[*].html` in a manifest entry must render correctly when pasted into a page that loads `dist/brut.css` + `dist/brut.js`. No assumed parent context.
- **Manifest is canonical.** Once shipped, `dist/components.json` is the source of truth for agents. Documentation HTML and source files are fallbacks.
- **No agent-only fields.** Manifest fields are useful to humans and agents alike. If a field exists only to please LLMs, it belongs in a separate annotation file, not the manifest.

## How to refine an existing component

1. Edit `src/components.css` for visuals, `src/js/components/<name>.js` for behavior. Keep using existing tokens.
2. If the visible HTML shape changes, update both `preview/components-<name>.html` and the matching `<section>` in `docs/index.html` (live preview AND `<pre>` snippet) so they stay in sync.
3. Rebuild.
4. Open the docs page and the preview page and visually verify.

## How to add a new design token

1. Add the variable to the right layer file in `src/tokens/`: primitives in `01-primitives.css` (raw values), semantic in `02-semantic.css` (aliases), intent in `03-intent.css` (component sizing).
2. If it deserves to be visible in the docs, add a row to the relevant Foundations section in `docs/index.html` (e.g. a swatch, a shadow card, a scale row).
3. Rebuild.
- When adding a token that fits an existing scale (z-index, semantic state, scrim), match the naming pattern of that scale. Prefer extending the existing semantic alias layer (`--bg-*`, `--text-*`, `--border-*`) over exposing raw scales to consumers.

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

- **Class root MUST equal the JS hook name.** A component registered as `Brut.register('checkbox', …)` uses class `.brut-checkbox`, not `.brut-cb`. No abbreviations. Modifiers follow BEM: `.brut-<name>--<variant>`, `.brut-<name>__<part>`, `.brut-<name>--on` for toggled state.
- **One component per file.** Filename is the component name (`stepper.js`, `tag-input.js`).
- **Hook on `data-brut="<name>"`.** Never select on a class name. Class names are visual; data attributes are behavioral. A consumer must be able to opt in by adding the attribute, and opt out by removing it.
- **No external dependencies.** No npm imports, no CDN links, no polyfills. Standard DOM and ES2015+ that runs everywhere modern browsers do (`addEventListener`, `querySelectorAll`, `classList`, `CustomEvent`, `dispatchEvent`, optional chaining is fine).
- **Idempotent init.** The `__brutInit` flag handles this for you — don't fight it. Don't bind global listeners on every init; if you need a global keydown listener, scope it to the element's open/close state.
- **Always `setAttribute('type', 'button')`** on any `<button>` you wire so it doesn't submit forms accidentally.
- **Mirror state to a hidden `<input>`** so the value posts cleanly with the surrounding form. Read `data-brut-name` to derive the input name; if no hidden input exists, create one. The hidden input is the source of truth.
- **Dispatch `CustomEvent('brut:change', { detail })`** on every committed state change. **`detail.value` MUST always be present** and represent the single, complete state of the component (boolean / string / array / object). Extras are allowed (e.g. `{ value: 'q', visible: 12, total: 50 }` for a filter), but `value` is canonical and consumers can rely on it. Components with a "completion" notion (OTP) also dispatch `brut:complete` with the same `{ value }` shape.
- **Keyboard support.** Click handlers should also respond to Space and Enter on focusable elements. Set `role`, `tabindex`, and `aria-checked` / `aria-selected` / `aria-expanded` where appropriate. The runtime won't add these for you.
- **Fail soft.** If required child elements are missing, return early — don't throw. The runtime catches throws and logs to the console, but a bad selector that matches nothing is the better outcome than a noisy error.
- **No animations longer than 140ms.** No fades. Match the visual language: snap, don't ease.

### Public events the runtime expects

| Event | When | Detail (canonical shape) |
| --- | --- | --- |
| `brut:change` | A committed state change (after click, after Enter, after select). | `{ value, …extras }`. `value` is the single complete state — boolean for toggles, string for single-select, array for multiselect, `{min, max}` for ranges. Extras are allowed but `value` must always be present. |
| `brut:complete` | All required input collected (e.g. OTP fully filled). | `{ value }` |
| `brut:open` / `brut:close` | Dialog/popover/drawer/topnav transitions. | none |

### Form-component checklist

A "form-state component" carries a value the user picks/edits and that should post with a surrounding `<form>`. For these, all of the following MUST hold:

1. The component is registered on `data-brut="<name>"` and uses class root `.brut-<name>`.
2. It mirrors its value to a hidden `<input>` (or to an existing visible input like stepper's `<input type="number">`) named from `data-brut-name` on the wrapper. The input is the source of truth — submitting the surrounding form posts the value.
3. It dispatches `brut:change` with `event.detail.value` set to the current value.
4. Every focusable surface has a `role`, `tabindex`, and keyboard handler (Space/Enter for toggles, Arrow/Home/End for navigators).

A "non-form component" (dialog, popover, tooltip, drawer, topnav, sidebar, toast) is exempt from rules 2 and 3 — they emit `brut:open` / `brut:close` instead. The `password` component is also exempt: its visible `<input type="password">` is already the form field; the toggle button is presentational and only updates `aria-label`.

| Component | Form state? | Hidden input | brut:change | Notes |
| --- | --- | --- | --- | --- |
| switch | yes | yes | `{ value: boolean }` | |
| checkbox | yes | yes | `{ value: boolean }` | |
| radio | yes | yes | `{ value: string }` | |
| segmented | yes | yes | `{ value: string }` | |
| stepper | yes | uses visible `<input type="number">` | `{ value: number }` | |
| otp | yes | yes | `{ value: string }`, also `brut:complete` | |
| rating | yes | yes | `{ value: number }` | |
| combobox | yes | yes | `{ value, label }` | |
| multiselect | yes | yes (one per value) | `{ value: string[] }` | |
| range-dual | yes | yes (two inputs) | `{ value: { min, max } }` | |
| time | yes | yes | `{ value, hour, minute }` | |
| tag-input | yes | yes (one per tag) | `{ value: string[] }` | |
| dropzone / file | yes | uses real `<input type="file">` | `{ value: File[] }` | |
| password | exempt | uses real `<input type="password">` | none | toggle updates `aria-label` only |
| table sort | exempt | none | `{ value: key, key, dir }` | UI control, not a form value |
| table select-all | exempt | none | `{ value: boolean, selectAll: true }` | UI control |
| dialog / drawer / popover / tooltip / topnav / sidebar / toast | exempt | none | `brut:open`/`brut:close` | non-form |

### Hard constraints — do not cross these

- **No JS frameworks.** No React, Vue, Svelte, jQuery, Alpine, htmx. Plain DOM only.
- **No JSX.** All previously-existing JSX has been removed. Don't reintroduce it.
- **No transpilers.** No Babel, esbuild, swc, tsc. Source files run in the browser as-is. Stick to syntax that current evergreen browsers support natively (no decorators, no class fields beyond what V8 ships, etc.).
- **No new package dependencies.** `package.json` exists only to expose the `build` script. Do not add deps — runtime or dev.
- **Package carve-out**: the no-deps rule applies to the runtime `brut` package and `src/`. Standalone packages under `packages/*` (e.g., `@sprtn/mcp`) may declare their own dependencies in their own `package.json`. The spirit — consumers of `brut` install no bundler, framework, or runtime — is permanent.
- **No CSS preprocessors.** No Sass, Less, PostCSS, Tailwind, lightningcss. Plain CSS only.
- **No hardcoded design values in components.** If you reach for a hex, px, or rem that isn't a token, add a token first.
- **Visual rules** (carry over from the design system — see README.md for the full philosophy):
  - No gradients, no soft `rgba()` shadows, no rounded corners (except small radii for inputs/chips, pill 999px for tags), no emoji, no serif fonts.
  - Borders are 4px ink (3px small, 6–8px hero); colored borders only for error states.
  - Shadows are hard offset only (`Xpx Ypx 0 0 var(--ink)`), never blurred.
  - Hover lifts up-and-left and grows the shadow; press translates down-and-right and collapses the shadow. Snap, don't ease — 80–140ms transitions on `cubic-bezier(0.2, 0.8, 0.2, 1)`.

### Sanctioned exceptions

The hard rules above have a small, explicit set of carve-outs. These are the ONLY exceptions; do not invent new ones.

- **`rgba()`** is allowed only via the `--scrim-bg` and `--scrim-bg-soft` tokens in `src/tokens/02-semantic.css`. Components must reference those tokens — raw `rgba()` literals in `src/components.css` are forbidden.
- **Animations longer than 140ms** are allowed only for *loaders* (skeleton sweep, spinner). The 140ms cap applies to **transitions**, not loops. New loaders must be commented `/* Sanctioned exception: loader animations may exceed --dur-base */` so the carve-out is visible.
- **Gradients** are allowed only for the checkbox checkmark glyph until a 24px stroke-based SVG sprite ships. Do not use gradients anywhere else; new gradients require user approval.

## Responsive constraints

BRUT is **responsive by default**. Every component works at 320px and scales upward. Responsiveness is a first-class promise, not a polish step. The rules:

1. **Mobile-first.** Base styles target 320px. Tier media queries add affordances upward — never strip them downward.
2. **Three tiers, no more.** `sm` ≥ 640px, `md` ≥ 768px, `lg` ≥ 1024px — driven by `--bp-sm`, `--bp-md`, `--bp-lg`. New breakpoints require a justification in [ARCHITECTURE.md](ARCHITECTURE.md) and a token rename.
3. **Min-width only at tier boundaries.** Use `(min-width: var(--bp-md))`. For genuine "desktop-only undo" cases use the sub-tier sentinel `(max-width: 767.98px)` and justify in a comment. Never `(max-width: 768px)` — it collides with the corresponding min-width tier.
4. **Every interactive component declares one responsive shape.** The shape is one of nine canonical values (`static`, `stack`, `fullscreen-modal`, `bottom-sheet`, `horizontal-scroll`, `ellipsis-collapse`, `disclosure-toggle`, `wrap`, `hover-fallback`) listed in [docs/responsive-shapes.md](./docs/responsive-shapes.md). Doctor refuses missing or drifted declarations.
5. **44px touch-target floor on every interactive surface.** Token: `--touch-min` (alias of `--control-xl`). The visual harness verifies computed height in headless renders.
6. **Layout dimensions guard against narrow viewports.** Any token `≥ 320px` consumed as a width/max-width MUST be wrapped in `min(token, calc(100vw - var(--sp-N)))` or paired with a tier media query. Tracked tokens: `--container-*`, `--drawer-w`, `--dialog-max-w`, `--popover-max-w`. Doctor enforces.
7. **Container width tokens drive page wrappers.** No raw `max-width: 1200px` outside `src/tokens/`.
8. **Anchored overlays collision-detect against the viewport.** `popover`, `menu`, `tooltip`, `dropdown`-style menus share one positioner module — no per-component drift.
9. **Hover-only UI must have a touch fallback.** Tooltips, hover-driven popovers degrade to tap-to-pin on `(hover: none) and (pointer: coarse)`.
10. **VitePress and BRUT use the same breakpoints.** `docs-site/.vitepress/theme/brut-bridge.css` maps VitePress's responsive layer onto `--bp-*`.

### Sanctioned responsive exceptions

- The 12-col grid's `(max-width: 639px)` stack-below-sm rule is grandfathered — it pairs cleanly with `(min-width: 640px)` because the boundary at 640 belongs entirely to the min-width tier (CSS specificity wins).
- `topnav` may use `(max-width: 767.98px)` while the mobile-first refactor is pending (RR2.4); see plan.

### Verification

- `npx brut doctor` enforces `RESPONSIVE_META_MISSING`, `RESPONSIVE_SHAPE_INVALID`, `RESPONSIVE_BREAKPOINT_INVALID`, `VIEWPORT_META_MISSING`, `BREAKPOINT_NON_TIER`, `MAX_WIDTH_AT_TIER`, `UNGUARDED_LAYOUT_DIM`. Land any new responsive rule with its doctor check.
- `pnpm test:visual` (Playwright) renders every preview at 320, 375, 640, 768, 1024, 1440 and asserts no horizontal scroll, every `[data-brut]` surface ≥ 44×44, declared shape matches DOM evidence.

## Verifying changes

Before declaring work done:

1. `pnpm build` exits 0 and produces non-zero byte counts for both `dist/brut.css` and `dist/brut.js`.
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
