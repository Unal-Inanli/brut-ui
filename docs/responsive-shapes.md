# Responsive shapes

> The canonical glossary of how every BRUT component behaves across viewport tiers. Each interactive component declares **exactly one** shape in its `<name>.meta.js` sidecar; doctor refuses missing or drifted declarations. Static components may declare `static` to make the assertion explicit.

## Why this exists

Responsiveness in BRUT is **declarative, predictable, and machine-readable**. An agent reading `dist/components.json` can know — without crawling source — that `dialog` becomes a fullscreen sheet on a phone, that `tooltip` flips from hover to tap-to-pin on a touch device, that `tabs` becomes a horizontal scroll strip when the row overflows. No surprises, no per-component pet patterns.

The same nine shapes describe every responsive transformation the kit performs. If a new component needs a tenth shape, add it here first, then to the validator (`src/config/vite-plugin.js`), then to the doctor (`src/cli/commands/doctor.js`).

## The tier system

Three tiers. Mobile-first. `min-width` only at boundaries.

| Tier | Min width | Token | Devices |
|---|---|---|---|
| (base) | 320px | — | phones |
| `sm` | 640px | `--bp-sm` | large phones, portrait small tablets |
| `md` | 768px | `--bp-md` | landscape tablets, small laptops |
| `lg` | 1024px | `--bp-lg` | desktops, standard laptops |

A shape's `breakpoint` field names the tier **at which the shape engages**. For shapes that flip downward (most of them), this means: at `breakpoint` and above, you get the desktop-shaped layout; below it, you get the mobile-shaped layout.

For `static` and `wrap`, breakpoint is informational only — those shapes apply at every width.

## The nine shapes

### `static`
**Behavior contract.** No layout change between tiers. The component works inline at any viewport from 320px up.
**CSS pattern.** Base styles only. No media queries scoping the component.
**JS hook.** None.
**Use for.** Buttons, inputs, switches, checkboxes, radios, badges, tags, alerts, cards, progress, spinners, skeletons. Anything whose layout responsibility is "fit your container, period."

### `stack`
**Behavior contract.** Multi-axis layout collapses to vertical at and below the declared tier.
**CSS pattern.** Default-stacked, then `@media (min-width: var(--bp-X))` flips to row/grid. Or: tier-and-up grid, with `@media (max-width: <tier-1>.98px)` falling back to a single column. Mobile-first preferred.
**JS hook.** None.
**Use for.** Multi-column forms, hero sections, footer, dashboard split, the 12-col grid, the `.brut-split` primitive.

```css
.brut-foo { display: flex; flex-direction: column; gap: var(--sp-4); }
@media (min-width: var(--bp-md)) {
  .brut-foo { flex-direction: row; }
}
```

### `fullscreen-modal`
**Behavior contract.** Centered modal becomes edge-to-edge sheet at and below the declared tier.
**CSS pattern.** Modal positioning at desktop; `@media (max-width: <tier-1>.98px)` overrides `inset: 0; max-width: none; height: 100dvh; border-radius: 0`.
**JS hook.** None — pure CSS flip on top of the existing dialog open/close machinery.
**Use for.** `dialog`. Larger than a sheet, smaller than a takeover.

```css
@media (max-width: 639.98px) {
  .brut-dialog[aria-modal] { inset: 0; max-width: none; height: 100dvh; border-radius: 0; }
}
```

### `bottom-sheet`
**Behavior contract.** An anchored overlay re-anchors to the bottom edge with `100vw` width and `dvh`-bounded height at and below the declared tier.
**CSS pattern.** The component's positioning rules live behind a `@media (max-width: <tier-1>.98px)` block that overrides `top/left/transform` to dock the panel at `bottom: 0; left: 0; width: 100vw`. The trigger-anchored positioner JS reads the same media query and skips collision math when the sheet is active.
**JS hook.** A shared positioner module reads `(max-width: 639.98px)` and chooses between bottom-sheet and anchored-popover behavior. One module, all consumers.
**Use for.** `popover`, `menu`, `dropdown`, `combobox`, `multiselect`, `date`, `time`, `drawer` (the `top` and `bottom` variants — `left`/`right` flip to `bottom` at the tier).

### `horizontal-scroll`
**Behavior contract.** A wide row of items becomes `overflow-x: auto` with momentum scroll and snap at and below the declared tier.
**CSS pattern.** Container gets `overflow-x: auto; scroll-snap-type: x mandatory;` plus an edge-fade hint to indicate scroll affordance. Children get `scroll-snap-align: start; flex-shrink: 0`.
**JS hook.** None. Native scroll handles it.
**Use for.** `tabs`, `segmented`, `breadcrumb` (when the row is long), `table` (when it must preserve column structure rather than stack — see `--full` opt-out).

```css
@media (max-width: 767.98px) {
  .brut-tabs {
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
  }
  .brut-tab { flex-shrink: 0; scroll-snap-align: start; }
}
```

### `ellipsis-collapse`
**Behavior contract.** Show first item + last item + an ellipsis chip in between at and below the declared tier. Full row visible above.
**CSS pattern.** Mirrors the existing `.brut-crumbs--responsive` rule: middle children become `display: none`, an ellipsis pseudo-element fills the gap.
**JS hook.** Optional — used by `pagination` to compute which window of pages to show given current state and ellipsis target.
**Use for.** `breadcrumb`, `pagination`.

### `disclosure-toggle`
**Behavior contract.** Hidden behind a button at and below the declared tier; visible above. The button toggles a panel via `aria-expanded`. Pressing the button reveals the panel inline (mobile) or has no effect (desktop, where the panel is already visible).
**CSS pattern.** Panel `display: none` below tier, panel visible at-and-above tier. Opener button visible only below tier.
**JS hook.** A shared helper updates `aria-expanded` and reveals/hides the panel. `topnav.js` is the reference implementation; the helper extracts when `sidebar` is wired up.
**Use for.** `topnav`, `sidebar`, any other navigation-style structure that hides on phones.

### `wrap`
**Behavior contract.** Items flow to the next line via `flex-wrap` from the base layer. No tier-driven flip. Distinct from `stack` because items keep their intrinsic sizing — they wrap, they don't span the full width.
**CSS pattern.** `flex-wrap: wrap; gap: var(--sp-3);` in the base styles. No media query.
**JS hook.** None.
**Use for.** `tag-input` chips, button clusters, footer link rows.

### `hover-fallback`
**Behavior contract.** Hover-driven UI degrades to tap-to-pin on coarse-pointer devices. Long-press or tap-to-show, with a clear dismiss affordance (outside-tap or close button).
**CSS pattern.** `@media (hover: none) and (pointer: coarse) { … }` overrides hover-only styles with click/focus equivalents.
**JS hook.** Component listens for `pointerdown` in addition to `mouseenter`. On coarse pointers, click toggles the visible state.
**Use for.** `tooltip`. Anywhere else hover is used to *reveal* content (vs. just *style* it).

## Declaring the shape in meta

Every interactive component's `<name>.meta.js` includes a `responsive` field:

```js
export default {
  name: 'dialog',
  description: '…',
  // …other required fields…
  responsive: {
    shape: 'fullscreen-modal',
    breakpoint: 'sm',
    notes: 'Edge-to-edge sheet on phones; centered modal at sm and above.',
  },
};
```

Field rules:
- `shape` — required, one of the nine values above.
- `breakpoint` — optional. Required for shapes that flip (`stack`, `fullscreen-modal`, `bottom-sheet`, `horizontal-scroll`, `ellipsis-collapse`, `disclosure-toggle`, `hover-fallback`). Omitted for shapes that don't flip (`static`, `wrap`).
- `notes` — optional, ≤120 characters. Plain language. Goes into `dist/components.json` and surfaces in MCP and the docs site.

`dist/components.json` carries the `responsive` block verbatim under each component entry.

## What doctor enforces

| Code | Trigger | Severity |
|---|---|---|
| `RESPONSIVE_META_MISSING` | Interactive component meta has no `responsive` block. | warning (will promote to failure post-rollout) |
| `RESPONSIVE_SHAPE_INVALID` | `responsive.shape` not in the nine-value enum. | warning |
| `RESPONSIVE_BREAKPOINT_INVALID` | `responsive.breakpoint` set but not `sm`/`md`/`lg`. | warning |
| `VIEWPORT_META_MISSING` | HTML page under `preview/`/`docs/`/`demos/`/`site/` lacks `<meta name="viewport" content="width=device-width…">` or disables zoom. | warning (will promote to failure post-RR2.1) |
| `BREAKPOINT_NON_TIER` | A media query uses a value other than 640/768/1024 (or sub-tier 639.98/767.98/1023.98). | warning |
| `MAX_WIDTH_AT_TIER` | A media query uses `(max-width: 640|768|1024 px)` exactly — collides with the corresponding min-width tier at the boundary pixel. | warning |
| `UNGUARDED_LAYOUT_DIM` | A `width`/`max-width` rule consumes a token whose value is ≥320px (`--container-*`, `--drawer-w`, `--dialog-max-w`, `--popover-max-w`) outside `@media` and outside `min(token, …)` wrapping. | warning |

The visual harness (`tests/visual/`) layers on additional runtime checks:
- **TOUCH_MIN_VIOLATION** — any `[data-brut="…"]` interactive surface < 44×44px at any tested viewport.
- **HORIZONTAL_SCROLL** — `document.documentElement.scrollWidth > clientWidth` at any of the tested viewports (320, 375, 640, 768, 1024, 1440).
- **SHAPE_DRIFT** — declared shape contradicts the rendered DOM (e.g. `fullscreen-modal` declared but `inset` is not 0 at 320px).

## When you're stuck

1. **Don't invent a shape.** If a component genuinely needs a flip pattern that none of the nine cover, that's an architecture decision — open an issue, propose the tenth shape, get it added to this glossary first.
2. **Default to `static`.** If a component has no responsive concern, declare `static` explicitly. Doctor warns about omission, not about declared statics.
3. **Multiple shapes don't compose here.** A component that "scrolls horizontally on phone but stacks on tablet" is doing too much; pick one and document the secondary behavior in `notes`. (Or split the component.)
4. **Touch-target floor is independent.** Every interactive surface must meet `--touch-min` (44px) regardless of shape. Visual harness enforces.
