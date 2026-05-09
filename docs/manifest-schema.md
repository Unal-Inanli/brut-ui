# BRUT components manifest — schema reference

## Overview

`dist/components.json` is the build-time manifest of every component shipped by BRUT. It enumerates each component's class root, JS selector, data-attributes, dispatched events, form-state, accessibility surface, and copy-pasteable HTML examples. The manifest is the source of truth for `@sprtn/mcp`, `npx brut doctor`, and any external tool that needs to discover BRUT primitives without reading source. The machine-readable JSON Schema lives next to the manifest at `docs/manifest-schema.json`.

## Top-level shape

```json
{
  "$schema": "https://brut.dev/schema/components-v1.json",
  "version": "0.2.0",
  "prefix": "brut",
  "themes": ["brutalist", "corporate", "minimal"],
  "components": [ /* … */ ]
}
```

| Field | Type | Required | Purpose |
|---|---|---|---|
| `$schema` | `const` URL | yes | Pinned schema URL — `https://brut.dev/schema/components-v1.json`. Bumps with the manifest's major version. |
| `version` | string | yes | Semver of the `brut` package the manifest was emitted from. |
| `prefix` | string | yes | Class and data-attribute prefix. Default `brut`; consumers can rename via `brut.config.js` and the manifest reflects the rename. |
| `themes` | string[] | yes | Theme names shipped in this build. Applied at runtime via `[data-theme="<name>"]` on `<html>`. |
| `components` | object[] | yes | Every component recognised by the build, in `KNOWN_COMPONENTS` order. |

Each entry in `components` is either an **interactive component** (full record, sourced from a sidecar `<name>.meta.js`) or a **static component** (4-field stub). The discriminator is `kind`.

## Interactive component fields

Every interactive component carries every field listed below. There are no optional top-level fields on an interactive entry — when nothing applies, use an empty array (`modifiers: []`) or an explicit shape (`formState: { hiddenInput: false }`).

| Field | Type | Required | Purpose |
|---|---|---|---|
| `kind` | `"interactive"` | yes | Discriminator. |
| `name` | string | yes | Kebab-case identifier. Matches the `data-brut` hook and the file name (`carousel`, `tag-input`, `theme-switcher`). |
| `description` | string | yes | One-sentence summary of what the component does. |
| `useCases` | string[] (≥1) | yes | Concrete situations where this component is the right pick. Helps agents disambiguate similar components. |
| `class` | string | yes | Selector for the root class with leading dot (`.brut-carousel`). Renamed when `prefix` is non-default. |
| `selector` | string | yes | CSS selector the runtime mounts on (`[data-brut="carousel"]`). |
| `modifiers` | string[] | yes | BEM-style suffixes (`["--sm", "--lg"]`). Empty array if none. |
| `dataAttributes` | object[] | yes | Configuration attributes consumed at mount time. See sub-shape below. |
| `events` | object[] | yes | Custom DOM events the component dispatches. Empty array if none. |
| `formState` | object | yes | How the component participates in form submission. |
| `a11y` | object | yes | Accessibility surface — only the dimensions the component actively manages. |
| `examples` | object[] (≥1) | yes | Authoritative HTML snippets. At least one. |
| `responsive` | object | yes | Declared responsive shape (one of nine canonical values) + the tier at which it engages. See sub-shape below and [responsive-shapes.md](./responsive-shapes.md). |

### `dataAttributes[]`

```js
{ name: 'data-current', values: 'integer (default 0)', description: 'Initial slide index; clamped to slide count' }
```

| Field | Type | Required | Purpose |
|---|---|---|---|
| `name` | string | yes | Full attribute name including the `data-` prefix. |
| `values` | string \| array | no | Accepted values. Either a free-form description (`'integer ms (omit or 0 to disable)'`) or an explicit list of literals (`['true', 'false']`). |
| `description` | string | no | Human-readable purpose. |

### `events[]`

```js
{ name: 'brut:change', detail: { value: 'integer (current slide index)' } }
```

| Field | Type | Required | Purpose |
|---|---|---|---|
| `name` | string | yes | Event name. Always prefixed `brut:`. |
| `detail` | object | no | Map of `event.detail` keys to their type description. By convention `brut:change` always carries a `value` key. |

### `formState`

```js
{ hiddenInput: true, name: 'inherits from data-name' }
```

| Field | Type | Required | Purpose |
|---|---|---|---|
| `hiddenInput` | boolean | yes | True if the component creates or maintains a hidden `<input>` mirroring its current value. |
| `name` | string | no | Free-form note describing how the form name is resolved (`'inherits from data-name'`, `'submits via the wrapped native <input type="file">'`). |

### `a11y`

```js
{
  role: 'region',
  roledescription: 'carousel',
  keyboard: ['ArrowLeft', 'ArrowRight', 'Home', 'End'],
  aria: ['aria-roledescription', 'aria-live (on track)', 'aria-current (on active dot)'],
  notes: 'Autoplay respects prefers-reduced-motion and pauses on hover, focus, and tab visibility change.'
}
```

| Field | Type | Required | Purpose |
|---|---|---|---|
| `role` | string | no | ARIA role applied to the root, if any. |
| `roledescription` | string | no | Value of `aria-roledescription`, if used. |
| `keyboard` | string[] | no | Key names the runtime handles. Use the standard `KeyboardEvent.key` spelling (`ArrowLeft`, `Enter`, `Space`, `Home`, `End`, `Escape`). |
| `aria` | string[] | no | ARIA attributes the runtime sets or syncs. Placement notes are allowed (`'aria-current (on active dot)'`). |
| `notes` | string | no | Reduced-motion behaviour, focus management, RTL handling, anything else worth knowing. |

### `examples[]`

```js
{ title: 'Default — clamp at edges', html: '<div class="brut-carousel" …>…</div>' }
```

| Field | Type | Required | Purpose |
|---|---|---|---|
| `title` | string | yes | Short label distinguishing this example from siblings. |
| `html` | string | yes | Raw HTML markup. Newlines preserved. Markup only — no `<style>` or `<script>`. |

### `responsive`

```js
{ shape: 'fullscreen-modal', breakpoint: 'sm', notes: 'Edge-to-edge sheet on phones; centered modal at sm and above.' }
```

| Field | Type | Required | Purpose |
|---|---|---|---|
| `shape` | string | yes | One of nine canonical shapes: `static`, `stack`, `fullscreen-modal`, `bottom-sheet`, `horizontal-scroll`, `ellipsis-collapse`, `disclosure-toggle`, `wrap`, `hover-fallback`. See [responsive-shapes.md](./responsive-shapes.md) for the behavior contract of each. |
| `breakpoint` | string | no | Tier at which the shape engages: `sm` (640px), `md` (768px), or `lg` (1024px). Required for shapes that flip; omitted for `static` and `wrap`. |
| `notes` | string | no | Plain-language note (≤120 chars) describing the responsive behavior in this component. |

## Static component fields

Static components (purely CSS, no runtime — `alert`, `badge`, `card`, `divider`, …) ship the 4-field stub in M7. Richer metadata is backfilled in a follow-up.

| Field | Type | Required | Purpose |
|---|---|---|---|
| `kind` | `"static"` | yes | Discriminator. |
| `name` | string | yes | Kebab-case identifier. |
| `class` | string | yes | Selector for the root class with leading dot. |
| `selector` | `null` | yes | Always `null` — static components have no JS hook. |

`brut doctor` flags missing static metadata as informational, not as a failure.

## Authoring

Each interactive component declares its manifest entry in a sidecar file `src/js/components/<name>.meta.js` that `export default`s an object with the fields above. Naming convention is camelCase throughout (`useCases`, `dataAttributes`, `formState`).

```js
// src/js/components/<name>.meta.js
export default {
  name: '<name>',
  description: '…',
  useCases: ['…'],
  kind: 'interactive',
  class: '.brut-<name>',
  selector: '[data-brut="<name>"]',
  modifiers: [],
  dataAttributes: [],
  events: [],
  formState: { hiddenInput: false },
  a11y: {},
  examples: [{ title: 'Default', html: '…' }],
};
```

The Vite plugin (`src/config/vite-plugin.js#generateManifest`) globs `src/js/components/*.meta.js` at build time, dynamic-imports each, validates required fields, applies the configured `prefix`, and emits the merged manifest to `dist/components.json`. Components without a `.meta.js` fall back to the static stub.

## Validation

Two automated checks gate the manifest:

- **`scripts/check-manifest.js`** — manifest-completeness assertion. Walks every interactive component and exits non-zero if any required field is missing or empty. Run via `pnpm check:manifest`.
- **`npx brut doctor`** — surfaces these manifest-related findings:
  - `MISSING_META` — interactive component has no `.meta.js`. Warning in M7, error in M8.
  - `META_DRIFT` — `.meta.js` declares modifiers, events, or data-attributes not present in source. Informational.
  - `RESPONSIVE_META_MISSING` — interactive component meta has no `responsive` block. Warning during the responsive rollout (RR1–RR4); promotes to failure once backfill is complete.
  - `RESPONSIVE_SHAPE_INVALID` — `responsive.shape` is set but not one of the nine canonical values. Warning.
  - `RESPONSIVE_BREAKPOINT_INVALID` — `responsive.breakpoint` is set but not `sm`/`md`/`lg`. Warning.

Both checks read `docs/manifest-schema.json` for structural validation. Hand-edit the schema only when bumping the manifest's major version.

## Example — full carousel entry

The canonical fully-populated entry. Verbatim from `src/js/components/carousel.meta.js`.

```js
export default {
  name: 'carousel',
  description: 'Single-track slide carousel with prev/next, dots, keyboard, autoplay, optional loop, and pointer-driven swipe.',
  useCases: ['image gallery', 'feature showcase', 'testimonial rotator', 'onboarding screens', 'product highlights'],
  kind: 'interactive',
  class: '.brut-carousel',
  selector: '[data-brut="carousel"]',
  modifiers: [],
  dataAttributes: [
    { name: 'data-current',  values: 'integer (default 0)',           description: 'Initial slide index; clamped to slide count' },
    { name: 'data-autoplay', values: 'integer ms (omit or 0 to disable)', description: 'Autoplay interval in milliseconds' },
    { name: 'data-loop',     values: 'boolean attribute',              description: 'When present, prev/next wrap at edges instead of clamping' },
  ],
  events: [
    { name: 'brut:change', detail: { value: 'integer (current slide index)' } },
  ],
  formState: { hiddenInput: false },
  a11y: {
    role: 'region',
    roledescription: 'carousel',
    keyboard: ['ArrowLeft', 'ArrowRight', 'Home', 'End'],
    aria: ['aria-roledescription', 'aria-live (on track)', 'aria-current (on active dot)'],
    notes: 'Autoplay respects prefers-reduced-motion and pauses on hover, focus, and tab visibility change. Arrow keys are RTL-aware.',
  },
  examples: [
    {
      title: 'Default — clamp at edges',
      html: '<div class="brut-carousel" data-brut="carousel" data-current="0">\n  <div class="brut-carousel__viewport">\n    <div class="brut-carousel__track">\n      <div class="brut-carousel__slide">Slide 1</div>\n      <div class="brut-carousel__slide">Slide 2</div>\n      <div class="brut-carousel__slide">Slide 3</div>\n    </div>\n  </div>\n  <div class="brut-carousel__nav">\n    <button class="brut-carousel__btn brut-carousel__btn--prev" aria-label="Previous slide"></button>\n    <button class="brut-carousel__btn brut-carousel__btn--next" aria-label="Next slide"></button>\n  </div>\n  <div class="brut-carousel__dots" role="tablist"></div>\n</div>',
    },
    {
      title: 'Autoplay + loop',
      html: '<div class="brut-carousel" data-brut="carousel" data-autoplay="5000" data-loop>\n  <div class="brut-carousel__viewport">\n    <div class="brut-carousel__track">\n      <div class="brut-carousel__slide">Slide 1</div>\n      <div class="brut-carousel__slide">Slide 2</div>\n      <div class="brut-carousel__slide">Slide 3</div>\n    </div>\n  </div>\n  <div class="brut-carousel__nav">\n    <button class="brut-carousel__btn brut-carousel__btn--prev" aria-label="Previous slide"></button>\n    <button class="brut-carousel__btn brut-carousel__btn--next" aria-label="Next slide"></button>\n  </div>\n  <div class="brut-carousel__dots" role="tablist"></div>\n</div>',
    },
    {
      title: 'Image content',
      html: '<div class="brut-carousel" data-brut="carousel" data-current="0">\n  <div class="brut-carousel__viewport">\n    <div class="brut-carousel__track">\n      <div class="brut-carousel__slide"><img src="/img/1.jpg" alt="First"></div>\n      <div class="brut-carousel__slide"><img src="/img/2.jpg" alt="Second"></div>\n      <div class="brut-carousel__slide"><img src="/img/3.jpg" alt="Third"></div>\n    </div>\n  </div>\n  <div class="brut-carousel__nav">\n    <button class="brut-carousel__btn brut-carousel__btn--prev" aria-label="Previous slide"></button>\n    <button class="brut-carousel__btn brut-carousel__btn--next" aria-label="Next slide"></button>\n  </div>\n  <div class="brut-carousel__dots" role="tablist"></div>\n</div>',
    },
  ],
};
```
