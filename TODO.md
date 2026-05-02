# TODO — Components to add

Self-contained spec for every component below. An agent picking up one of these should be able to ship it without exploring the repo first. Read the **Quick reference** and the **Universal recipe** once, then jump to the component you're adding.

---

## Quick reference (don't go look these up)

**Repo layout** — full details in [AGENTS.md](AGENTS.md), summarized here:

```
src/
  tokens.css                # design tokens (var(--ink), var(--sp-3), …)
  components.css            # all component CSS, grouped by banner
  js/
    core.js                 # Brut runtime (don't edit unless adding to public API)
    components/<name>.js    # one IIFE per JS-bound component
dist/
  brut.css                  # built — DO NOT hand-edit
  brut.js                   # built — DO NOT hand-edit
preview/components-<name>.html   # one playground page per component
docs/index.html                  # single docs page; sidebar + sections
demos/                           # full-page composed demos (landing, login, …)
build.sh                         # concat-only build (npm run build)
```

**Build:** `npm run build` (or `bash build.sh`). After **any** edit under `src/`, run it.

**Visual rules — non-negotiable:**
- 4px ink borders (3px on small, 6–8px on hero); colored borders only on `--err` state.
- Shadows are hard offset only: `Xpx Ypx 0 0 var(--ink)`. Never blurred, never `rgba()`.
- No gradients. No rounded corners (except small chips/inputs and pill 999px for tags).
- Hover: lift up-and-left + grow shadow. Active: stamp down-and-right + collapse shadow.
- Transitions ≤ 140ms on `cubic-bezier(0.2, 0.8, 0.2, 1)` — use `var(--dur-fast)` + `var(--ease-snap)`. No fades.
- Use only tokens from `src/tokens.css`. If you need a value that isn't a token, add a token first.

**Token cheat sheet** (verify against [src/tokens.css](src/tokens.css) when in doubt):
- Color: `--ink`, `--paper`, `--paper-2`, `--bone`, `--primary`, `--primary-soft`, `--primary-deep`, `--pop-pink`, `--pop-lime`, `--pop-blue`, `--pop-orange`, `--pop-purple`, `--pop-mint`, `--concrete-50/100/200/300/400/500`, `--success`, `--success-bg`, `--warning`, `--warning-bg`, `--danger`, `--danger-bg`, `--info`, `--info-bg`.
- Spacing: `--sp-1` through `--sp-16`.
- Type sizes: `--fs-xs` 12, `--fs-sm` 14, `--fs-base` 16, `--fs-md` 18, `--fs-lg` 22, `--fs-xl` 28, `--fs-2xl` 36, `--fs-3xl` 48.
- Tracking: `--tracking-tightest/-tight/-normal/-wide/-wider/-widest`.
- Borders: `--bw-1` 2px, `--bw-2` 3px, `--bw-3` 4px, `--bw-4` 6px, `--bw-5` 8px.
- Shadow: `--shadow-sm` (4px), `--shadow-md` (6px). Larger ones — write inline `8px 8px 0 0 var(--ink)` etc.
- Motion: `--dur-fast` 80ms, `--ease-snap` cubic-bezier(.2,.8,.2,1).
- Fonts: `--font-display`, `--font-sans`, `--font-mono`.

**Existing classes you'll reuse:** `.brut-stack`, `.brut-cluster`, `.brut-grid`, `.brut-bar`, `.brut-split`, `.brut-rule`, `.brut-spacer`, `.brut-section`, `.brut-card`, `.brut-btn`, `.brut-input`, `.brut-field`, `.brut-eyebrow`, `.brut-h1`-`.brut-h6`, `.brut-display-1/-2/-3`, `.brut-lead`, `.brut-body`, `.brut-small`, `.brut-caption`, `.brut-link`, `.brut-code`, `.brut-badge`, `.brut-alert`, `.brut-avatar`, `.brut-tag`, `.brut-switch`, `.brut-cb`, `.brut-radio`, `.brut-tabs`, `.brut-segmented`, `.brut-dialog`, `.brut-scrim`.

---

## Universal recipe — every component follows these 6 steps

Read this once. It applies to every entry below.

### 1. CSS — add to [src/components.css](src/components.css)

- Find the right banner (visual list of banners below). Static visual components go under the top section; form widgets go under `FORMS — extended`; layout primitives go under `LAYOUT`. Add a new `/* COMPONENT — short blurb. */` banner if a clean home doesn't exist.
- Class naming is BEM-flat: `.brut-<name>`, `.brut-<name>__<part>`, `.brut-<name>--<modifier>`.
- Use **only** tokens. No hex, px, or rem literals that aren't tokens. (Pixel literals are fine where they match an existing token, e.g. `padding: 12px 14px` matches existing input — but prefer token vars whenever one exists.)
- For interactive surfaces, mirror the standard hover/active treatment used by `.brut-btn` (lines 320-336):
  ```css
  .brut-foo:hover  { transform: translate(-2px, -2px); box-shadow: 6px 6px 0 0 var(--ink); }
  .brut-foo:active { transform: translate( 2px,  2px); box-shadow: 0 0 0 0 var(--ink); }
  ```

**Existing banners in `src/components.css`** (line numbers approximate, find by `^/\* `):
- TYPOGRAPHY (display, headings, body, eyebrow, kicker, link, code, lists, drop-cap, highlight, num) — top of file
- BUTTON (line ~320), BADGE (~346), CARD (~365), INPUT (~372), SWITCH (~396), CHECKBOX (~414), ALERT (~431), SEGMENTED (~454), TABS (~475), AVATAR (~494), DIALOG (~506)
- FORMS — extended divider (~526): FORM container, FIELD wrapper, INPUT variants, INPUT GROUP, TEXTAREA, SELECT, RADIO, RANGE, FILE, COLOR, FIELDSET, STEPPER, PASSWORD, SEARCH, OTP, TAGS, TAG INPUT, COMBOBOX, DROPZONE, RATING
- LAYOUT divider (~1048): CONTAINER, SECTION, STACK, CLUSTER, BAR, GRID, SPLIT, RULE, ASPECT, SCRIM, SHAPE, SPACER

### 2. JS (only if interactive) — create `src/js/components/<name>.js`

Template — copy [src/js/components/switch.js](src/js/components/switch.js) and adapt:

```js
/* <name> — one-line purpose.
   Markup:
     <div class="brut-<name>" data-brut="<name>"> … </div>
*/
(function () {
  if (!window.Brut) return;
  Brut.register('<name>', {
    selector: '[data-brut="<name>"]',
    init: function (el) {
      // 1. find required children; return early (no throw) if missing
      // 2. set role/tabindex/aria-* if needed
      // 3. wire click + keydown (Space, Enter)
      // 4. mirror state to a hidden <input> if the value posts with a form
      // 5. dispatch new CustomEvent('brut:change', { detail: { … } }) on change
      // 6. always setAttribute('type', 'button') on any <button> you wire
    }
  });
})();
```

Hard rules: zero deps, no imports, no JSX, idempotent (the `__brutInit` flag handles this), one component per file. `Brut.init(root)` is called automatically on `DOMContentLoaded`; for dynamically inserted markup, the consumer calls `Brut.init(newRoot)`.

### 3. Preview — create `preview/components-<name>.html`

Template — copy [preview/components-buttons.html](preview/components-buttons.html) for static, [preview/components-forms.html](preview/components-forms.html) for form widgets:

```html
<!doctype html>
<html><head><meta charset="utf-8"/>
<title><Name></title>
<link rel="stylesheet" href="../dist/brut.css"/>
<style>
  body { margin: 0; padding: 24px; background: var(--paper); font-family: var(--font-sans); }
  .row { display: flex; gap: 14px; flex-wrap: wrap; align-items: center; }
</style></head>
<body>
  <!-- render every variant -->
<script src="../dist/brut.js"></script> <!-- only if JS-bound -->
</body></html>
```

### 4. Docs — edit [docs/index.html](docs/index.html)

- **Sidebar:** add `<a href="#<id>"><Name></a>` under the right `<h2>` group (`Components`, `Forms`, `Feedback`, `Layout`, …) — see lines 215–256 for groups.
- **Section:** add a `<section class="docs-section" id="<id>">` after the closest matching section, containing:
  ```html
  <section class="docs-section" id="<id>">
    <h2><Name></h2>
    <p class="lead">One-line philosophy.</p>
    <div class="docs-preview"> <!-- live render -->
      …
    </div>
    <pre class="docs-snippet">&lt;!-- HTML-entity-escape &lt; and &gt; --&gt;</pre>
  </section>
  ```
- Use `docs-preview--block` for vertically stacked previews, `docs-preview--start` for top-aligned.

### 5. Build

```bash
bash build.sh
```

Confirm both files print non-zero byte counts. The build is concat-only.

### 6. Verify

- Open `docs/index.html` and `preview/components-<name>.html` in a browser.
- No 404s in the network panel. No console errors.
- For JS-bound: clicking/Tab+Space/Enter mutates state; the hidden `<input>` reflects it; `el.addEventListener('brut:change', …)` fires once per committed change.
- Sanity grep — must return nothing:
  ```bash
  grep -r "ui_kits\|jsx\|text/babel\|React\|require(\|import .* from " src/ docs/ preview/
  ```

---

# Components to add

Tiers ordered by impact. Each entry is self-contained.

---

## Tier 1 — App scaffolding (highest impact)

### 1.1 Toast

Non-blocking transient notification. Programmatic API + auto-dismiss.

- **JS-bound:** yes. `data-brut="toast-host"` on a container.
- **Files:**
  - CSS in `src/components.css` under a new `/* TOAST */` banner near `ALERT` (~line 431).
  - JS at `src/js/components/toast.js`.
  - `preview/components-toast.html`
  - Docs section `id="toast"`, sidebar group **Feedback**.
- **Classes:** `.brut-toast-host`, `.brut-toast-host--top-right` (default) `--top-left` `--bottom-right` `--bottom-left`. `.brut-toast`, `.brut-toast--ok/--warn/--err/--info`, `.brut-toast__icon`, `.brut-toast__msg`, `.brut-toast__x`.
- **CSS specifics:** Host is `position: fixed; z-index: 60; display: flex; flex-direction: column; gap: var(--sp-3); padding: var(--sp-4);`. Per-corner sets `top/right/bottom/left`. Each toast: 4px ink border, 4-4-0 ink shadow, paper or color-bg fill (mirror `.brut-alert--*`), max-width 360px, padding `var(--sp-3) var(--sp-4)`. Enter animation: translateY(-8px) → 0 over 120ms ease-snap; exit: opacity-only off in ≤ 140ms (snap, no fade lingering).
- **Public API on `window.Brut`:**
  ```js
  Brut.toast({ kind: 'ok'|'warn'|'err'|'info', message: string, timeout: 4000, host: '#id' })
  ```
  - Looks up host (default: `[data-brut="toast-host"]`). If none exists, create one and append to `<body>`.
  - Each toast dispatches `brut:close` on dismiss.
  - `×` button uses `setAttribute('type', 'button')`.
- **Markup:**
  ```html
  <div class="brut-toast-host brut-toast-host--top-right" data-brut="toast-host"></div>
  <button class="brut-btn" onclick="Brut.toast({ kind: 'ok', message: 'Saved.' })">Save</button>
  ```

---

### 1.2 Topnav (formal component)

Today every demo hand-rolls one. Formalize the pattern.

- **JS-bound:** only for the mobile toggle. `data-brut="topnav"` on the `<header>`.
- **Files:**
  - CSS in `src/components.css` under a new `/* TOPNAV */` banner near `TABS` (~475) — feels like navigation-feedback territory; OK to add a new `NAVIGATION` banner just before `LAYOUT` divider.
  - JS at `src/js/components/topnav.js` (mobile menu open/close only).
  - `preview/components-topnav.html`
  - Docs section `id="topnav"`, sidebar — add a new group **Navigation** above **Layout**.
- **Classes:** `.brut-topnav` (the `<header>`), `.brut-topnav__inner` (max-width row), `.brut-topnav__brand`, `.brut-topnav__mark` (square block), `.brut-topnav__links`, `.brut-topnav__link`, `.brut-topnav__link--active`, `.brut-topnav__cta`, `.brut-topnav__burger` (button, mobile only).
- **CSS specifics:** Sticky top, 4px bottom border, `var(--paper)` bg. `.brut-topnav__inner` is `max-width: 1200px; margin: 0 auto; padding: 14px var(--sp-6); display: flex; align-items: center; gap: var(--sp-6);`. Links: `.brut-topnav__link` is `font-display`, `--fs-xs`, `--tracking-wider`, uppercase, `:hover { background: var(--primary); }`. `--active` shows a 3px ink underline. Burger only visible at `max-width: 760px`; links collapse on the same query.
- **JS:** click on `.brut-topnav__burger` toggles `.brut-topnav--open`; click outside or Esc closes.
- **Reference:** see [demos/landing.html](demos/landing.html) for a working hand-rolled version — port that into the kit.

---

### 1.3 Sidebar nav

Vertical app nav for dashboards.

- **JS-bound:** optional (collapsible groups).
- **Files:** CSS, optional JS `sidebar.js`, preview, docs section under sidebar group **Navigation**.
- **Classes:** `.brut-sidebar`, `.brut-sidebar__brand`, `.brut-sidebar__group`, `.brut-sidebar__group-title` (eyebrow style), `.brut-sidebar__item`, `.brut-sidebar__item--active`, `.brut-sidebar__icon` (16-20px slot).
- **CSS specifics:** `width: 240px;` `border-right: 4px solid var(--ink);` `padding: var(--sp-5) var(--sp-3);`. Items: `display: flex; align-items: center; gap: var(--sp-2); padding: 8px 10px; font-display, --fs-sm, uppercase`. `:hover { background: var(--primary); }`. `--active` shows a 4px ink left rail (`box-shadow: inset 4px 0 0 0 var(--ink); background: var(--primary);`).
- **Group collapse JS** (if added): toggle a `.brut-sidebar__group--closed` class on click of `.brut-sidebar__group-title`.

---

### 1.4 Footer

- **JS-bound:** no.
- **Files:** CSS, preview, docs section under **Navigation**.
- **Classes:** `.brut-footer`, `.brut-footer__inner`, `.brut-footer__links`, `.brut-footer__link`, `.brut-footer__legal`.
- **CSS specifics:** `background: var(--ink); color: var(--paper); padding: var(--sp-8) var(--sp-6); border-top: 4px solid var(--ink);`. Inner: `max-width: 1200px; margin: 0 auto; display: flex; flex-wrap: wrap; gap: var(--sp-6); align-items: center;`. Links: same style as `.brut-topnav__link`, `:hover { color: var(--primary); }`. `__legal` uses `font-mono`, `--fs-xs`, `--concrete-200` color, `margin-left: auto`.
- **Reference:** [demos/landing.html](demos/landing.html) bottom of the file.

---

### 1.5 Breadcrumbs

- **JS-bound:** no.
- **Files:** CSS, preview, docs section under **Navigation**.
- **Classes:** `.brut-crumbs` (ol), `.brut-crumbs__item`, `.brut-crumbs__link`, `.brut-crumbs__sep` (the `/`), `.brut-crumbs__current`.
- **CSS specifics:** `display: flex; flex-wrap: wrap; gap: var(--sp-2); list-style: none; padding: 0; margin: 0; font-family: var(--font-display); font-size: var(--fs-xs); text-transform: uppercase; letter-spacing: var(--tracking-wider);`. `__sep` is hard ink `/` with `color: var(--concrete-300);`. `__link:hover { background: var(--primary); }`. `__current` is `color: var(--ink); font-weight: 700;` and not a link.
- **Markup:**
  ```html
  <ol class="brut-crumbs">
    <li class="brut-crumbs__item"><a class="brut-crumbs__link" href="#">Home</a></li>
    <li class="brut-crumbs__sep">/</li>
    <li class="brut-crumbs__item"><a class="brut-crumbs__link" href="#">Settings</a></li>
    <li class="brut-crumbs__sep">/</li>
    <li class="brut-crumbs__item brut-crumbs__current">Profile</li>
  </ol>
  ```

---

## Tier 2 — Feedback & overlays

### 2.1 Tooltip

- **JS-bound:** yes. `data-brut="tooltip"` on the trigger; tip text in `data-brut-tip="…"`.
- **Files:** CSS, JS `tooltip.js`, preview, docs section under **Feedback**.
- **Classes:** `.brut-tip` (the floating bubble — appended to `<body>` by JS), `.brut-tip--top/--bottom/--left/--right`. The trigger keeps `data-brut="tooltip"`; no class change required on the trigger.
- **CSS specifics:** `position: absolute; z-index: 70; background: var(--ink); color: var(--paper); border: 3px solid var(--ink); box-shadow: 3px 3px 0 0 var(--paper); padding: 6px 10px; font-family: var(--font-display); font-size: var(--fs-xs); letter-spacing: var(--tracking-wide); text-transform: uppercase; white-space: nowrap;`. No arrow tail (keep brutalist — it's a flat block).
- **JS:** on `mouseenter` / `focus`, create the bubble, position by `getBoundingClientRect()` + scroll offsets; on `mouseleave` / `blur`, remove. Read `data-brut-tip-side="top|bottom|left|right"` (default `top`). Esc removes any visible tip.
- **A11y:** add `aria-describedby` linking trigger to a unique tip id.

### 2.2 Popover

- **JS-bound:** yes. Pattern: trigger has `data-brut-popover-open="<id>"`; popover has `id="<id>" data-brut="popover" hidden`.
- **Files:** CSS, JS `popover.js`, preview, docs **Feedback** group.
- **Classes:** `.brut-popover`, `.brut-popover__head`, `.brut-popover__body`, `.brut-popover__x`.
- **CSS specifics:** Skin is `.brut-card` (4px ink border, `--shadow-md`, paper bg) + `position: absolute; z-index: 65; min-width: 220px; max-width: 360px;`. Anchored under the trigger by JS via `getBoundingClientRect()`.
- **JS:** clicking trigger opens; click outside / Esc closes. Dispatch `brut:open` / `brut:close`. Reuse the dialog open/close pattern from [src/js/components/dialog.js](src/js/components/dialog.js).

### 2.3 Skeleton loader

- **JS-bound:** no.
- **Files:** CSS, preview, docs **Feedback** group.
- **Classes:** `.brut-skeleton`, `.brut-skeleton--text` (single line, height 1em), `.brut-skeleton--block` (rectangle), `.brut-skeleton--circle`.
- **CSS specifics:** `background: var(--concrete-100); border: 3px solid var(--ink); box-shadow: 3px 3px 0 0 var(--ink);`. Animation: a hard ink stripe sweeps left → right via `@keyframes brut-skel-sweep` (duration 800ms, ease-snap, infinite). Stripe is a `::after` pseudo with `position: absolute; top: 0; left: -40%; width: 30%; height: 100%; background: var(--ink); transform: skewX(-20deg);` animating `left: 130%`. Snap, not fade.

### 2.4 Spinner

- **JS-bound:** no (CSS animation only).
- **Files:** CSS, preview, docs **Feedback** group.
- **Classes:** `.brut-spinner`, `.brut-spinner--sm/--md/--lg`.
- **CSS specifics:** A square (24/32/48px) with 4px ink border, **no border-radius**, with a single side colored `--primary` to make rotation visible. Animation: `transform: rotate(360deg)` over 600ms `linear` infinite. Brutalist take — corners rotate visibly.

### 2.5 Empty state

- **JS-bound:** no.
- **Files:** CSS, preview, docs **Feedback** group.
- **Classes:** `.brut-empty`, `.brut-empty__shape` (decorative rotated block, reuse `.brut-shape`), `.brut-empty__title`, `.brut-empty__body`, `.brut-empty__action`.
- **CSS specifics:** `text-align: center; padding: var(--sp-8) var(--sp-5); border: 4px dashed var(--ink); background: var(--paper-2);`. Title uses `.brut-h2`. Body uses `.brut-body`. Action slot holds a `.brut-btn`.

---

## Tier 3 — Data & lists

### 3.1 Table

The single highest-payoff component for app UI.

- **JS-bound:** optional (sortable + select-all-row). `data-brut="table"`.
- **Files:** CSS in a new `/* TABLE */` banner near `CARD`; JS at `src/js/components/table.js` (only if shipping sort + select-all in v1 — split later if needed); `preview/components-table.html`; docs section under a new **Data** group in the sidebar (or **Components**).
- **Classes:** `.brut-table` (table), `.brut-table__head` (thead), `.brut-table__row` (tr), `.brut-table__cell` (td/th), `.brut-table__cell--num` (right-align tabular figures), `.brut-table__cell--sortable`, `.brut-table__cell--sorted` `.brut-table__cell--sorted-desc`. Modifier `.brut-table--compact`, `.brut-table--striped`, `.brut-table--bordered`.
- **CSS specifics:** `border-collapse: collapse; width: 100%; border: 4px solid var(--ink); background: var(--bone);`. `thead` has `background: var(--ink); color: var(--paper);` cells `padding: 10px 14px; font-family: var(--font-display); text-transform: uppercase; font-size: var(--fs-xs); letter-spacing: var(--tracking-wider); text-align: left;`. `tbody td` `padding: 10px 14px; border-top: 3px solid var(--ink);`. `--striped tbody tr:nth-child(even) { background: var(--paper-2); }`. Sortable header gets a `▲`/`▼` (use Unicode triangle, ink fill) inside `::after`.
- **JS:** click on `--sortable` toggles sort order, sets `aria-sort`, swaps `--sorted` / `--sorted-desc`. Sort uses `data-sort-key` on the cell + `data-sort-value` on each row cell. Dispatch `brut:change` with `{ key, dir }`. Select-all checkbox in header `[data-brut-select-all]` toggles all `[data-brut-row-select]` checkboxes.

### 3.2 Rows (settings-style list)

Settings-style row: leading slot + title + subtitle + trailing slot. **Note:** `.brut-list` is already taken by the typography ul/ol class — use `.brut-rows` for this component.

- **JS-bound:** no.
- **Files:** CSS, preview, docs **Components** group.
- **Classes:** `.brut-rows` (ul or div), `.brut-rows__item` (li or div), `.brut-rows__lead`, `.brut-rows__main`, `.brut-rows__title`, `.brut-rows__sub`, `.brut-rows__trail`. Modifier `.brut-rows--bordered` (4px outer border + 3px row dividers), `.brut-rows--clickable` (cursor-pointer + hover state).
- **CSS specifics:** Each item `display: grid; grid-template-columns: auto 1fr auto; gap: var(--sp-3); align-items: center; padding: var(--sp-3) var(--sp-4);`. `--bordered .brut-rows__item + .brut-rows__item { border-top: 3px solid var(--ink); }`. `:hover` on `--clickable` lights with `var(--primary)`. Title is `--fs-md, fw-bold`; sub is `.brut-small` with `var(--concrete-400)`.

### 3.3 Pagination

- **JS-bound:** no (consumer wires links).
- **Files:** CSS, preview, docs **Navigation** group.
- **Classes:** `.brut-pager` (nav), `.brut-pager__btn`, `.brut-pager__btn--active`, `.brut-pager__gap` (the `…`).
- **CSS specifics:** `display: flex; gap: var(--sp-2);`. Each `__btn` is a 36×36 square, 3px ink border, 3-3-0 ink shadow, `font-display`, `--fs-sm`. `--active { background: var(--primary); }`. Hover/active match `.brut-btn`.

### 3.4 Tag — add severity modifiers

Don't introduce a new `.brut-chip` class. `.brut-tag` at [src/components.css:897](src/components.css#L897) is already a read-only pill with hard border, and `.brut-tags` (line 896) is the wrapper. The only gap is semantic-state coloring — current modifiers are `--ink/--lime/--pink/--blue` (decorative); add `--ok/--warn/--err/--info` (semantic).

- **JS-bound:** no.
- **Files:** CSS only — extend the existing TAGS / CHIPS banner in `src/components.css`. Update `preview/components-tags.html` (or add one if missing — check first) to render the new variants. Add the variants to the existing tags docs section.
- **Add these classes:**
  ```css
  .brut-tag--ok   { background: var(--success-bg); }
  .brut-tag--warn { background: var(--warning-bg); }
  .brut-tag--err  { background: var(--danger-bg);  color: var(--paper); }
  .brut-tag--info { background: var(--info-bg);    color: var(--paper); }
  ```
  Mirror the contrast pattern from `.brut-badge--ok/--warn/--err/--info` so the two families stay visually consistent.

### 3.5 Avatar group

Overlapping avatars with `+N` overflow.

- **JS-bound:** no.
- **Files:** CSS in the AVATAR banner (~494), preview, docs **Components**.
- **Classes:** `.brut-avatar-group`, `.brut-avatar-group__more` (the `+N` count chip).
- **CSS specifics:** `display: inline-flex;`. Inner `.brut-avatar` get `margin-left: -10px;` (first-child resets to `0`), `border` already 3px ink, `box-shadow: 0 0 0 3px var(--paper);` to clip the previous avatar visibly. `__more` is an extra `.brut-avatar` with `background: var(--ink); color: var(--paper); font-family: var(--font-display);`.

---

## Tier 4 — Disclosure

### 4.1 Drawer / Side sheet

- **JS-bound:** yes. Pattern matches dialog: `[data-brut-open="<id>"]` triggers; drawer has `id data-brut="drawer" data-brut-side="right"`.
- **Files:** CSS in a new `/* DRAWER */` banner near `DIALOG` (~506); JS at `src/js/components/drawer.js` (port [src/js/components/dialog.js](src/js/components/dialog.js) and adapt — same scrim + Esc + click-outside logic, different transform).
- **Classes:** `.brut-drawer`, `.brut-drawer--right` (default), `.brut-drawer--left`, `.brut-drawer--top`, `.brut-drawer--bottom`. `.brut-drawer__head`, `.brut-drawer__body`, `.brut-drawer__x`. Open state class: `.brut-drawer--open` (JS toggles).
- **CSS specifics:** `position: fixed; z-index: 80; background: var(--bone); border: 4px solid var(--ink);`. Right: `top: 0; right: 0; bottom: 0; width: min(420px, 100vw); transform: translateX(100%); transition: transform 140ms var(--ease-snap);`. `--open` sets `transform: translateX(0)`. Other sides analogous.
- **JS:** mirrors dialog exactly. Uses `.brut-scrim`. Dispatch `brut:open` / `brut:close`.

### 4.2 Accordion

- **JS-bound:** yes. `data-brut="accordion"` on the wrapper, `data-brut-allow-multi` for multi-open.
- **Files:** CSS, JS `accordion.js`, preview, docs **Components**.
- **Classes:** `.brut-accordion`, `.brut-accordion__item`, `.brut-accordion__head` (button), `.brut-accordion__icon` (chevron block), `.brut-accordion__body`, `.brut-accordion__item--open`.
- **CSS specifics:** Item has 4px ink border; `+ .brut-accordion__item { border-top: 0; }`. Head is full-width button: `display: flex; justify-content: space-between; align-items: center; padding: var(--sp-3) var(--sp-4); background: var(--bone); font-family: var(--font-display); font-size: var(--fs-md); text-transform: uppercase; cursor: pointer;`. `:hover { background: var(--primary); }`. Body `padding: var(--sp-4); border-top: 3px solid var(--ink); display: none;`. `--open .brut-accordion__body { display: block; }`. Icon is a hard `+` / `−` (text), no SVG.
- **JS:** click on head toggles `--open`. Without `data-brut-allow-multi`, opening one closes the others. Set `aria-expanded`. Space + Enter activate.

### 4.3 Menu / Dropdown

Context menu / overflow menu (separate from `select`).

- **JS-bound:** yes. Trigger: `data-brut-menu-open="<id>"`; menu: `id data-brut="menu" hidden`.
- **Files:** CSS (near `DIALOG`), JS `menu.js`, preview, docs **Navigation**.
- **Classes:** `.brut-menu`, `.brut-menu__item`, `.brut-menu__sep` (hr), `.brut-menu__item--danger`.
- **CSS specifics:** Card-like: `position: absolute; z-index: 65; min-width: 200px; background: var(--bone); border: 4px solid var(--ink); box-shadow: var(--shadow-md); padding: var(--sp-1) 0;`. Items: `display: block; width: 100%; padding: 8px 14px; text-align: left; background: transparent; border: 0; font-family: var(--font-sans); font-size: var(--fs-sm); cursor: pointer;`. `:hover { background: var(--primary); }`. `--danger { color: var(--danger); }`. Sep: 3px ink top border, `margin: var(--sp-1) 0;`.
- **JS:** open on trigger click, position by `getBoundingClientRect()`, close on click outside / Esc / item click. Arrow keys move focus. Reuse open/close pattern from `dialog.js`.

---

## Tier 5 — Form gaps

### 5.1 Date picker

- **JS-bound:** yes. `data-brut="date"` wraps an input + popover calendar.
- **Files:** CSS in `FORMS — extended`, JS `date.js`, preview, docs **Forms**.
- **Classes:** `.brut-date` (wrapper), `.brut-date__field` (input), `.brut-date__pop` (popover), `.brut-date__head`, `.brut-date__nav-btn`, `.brut-date__grid` (7-col grid), `.brut-date__day`, `.brut-date__day--today`, `.brut-date__day--selected`, `.brut-date__day--out` (greyed prev/next month).
- **CSS specifics:** Pop is a `.brut-card` styled (4px ink border, `--shadow-md`, paper bg) anchored absolutely under the field. Day cells are 36×36 squares, `font-display, --fs-sm`, hover yellow, `--selected { background: var(--ink); color: var(--paper); }`, `--today` shows a 3px ink underline.
- **JS:** Build calendar grid for the input's current value (or today). Arrow keys navigate days; Enter commits; Esc closes. Mirrors selected ISO date to a hidden `<input>` (read `data-brut-name`). Dispatch `brut:change` with `{ value: 'YYYY-MM-DD' }`.
- **No deps:** use only `Date`. Don't pull `date-fns` or anything.

### 5.2 Time picker

- **JS-bound:** yes. Similar to date but with hour/minute steppers.
- **Files:** CSS, JS `time.js`, preview, docs **Forms**.
- **Classes:** `.brut-time`, `.brut-time__field`, `.brut-time__pop`, `.brut-time__col` (hour or minute), `.brut-time__btn`.
- **CSS specifics:** Two stacked steppers (reuse `.brut-stepper` skin). Optional 12/24h toggle uses `.brut-segmented`. Output `HH:MM` to hidden input.

### 5.3 Multi-select

Distinct from combobox: shows selected items as chips inside the field.

- **JS-bound:** yes. `data-brut="multiselect"`.
- **Files:** CSS in `FORMS — extended`, JS `multiselect.js`, preview, docs **Forms**.
- **Classes:** `.brut-multiselect`, `.brut-multiselect__field`, `.brut-multiselect__chip` (reuses `.brut-tag` skin — see 3.4), `.brut-multiselect__list`, `.brut-multiselect__opt`, `.brut-multiselect__opt--selected`.
- **CSS specifics:** Field shell mimics `.brut-input`. Chips inside, plus a typing zone. List below mimics `.brut-combobox__list`.
- **JS:** Adapt [src/js/components/combobox.js](src/js/components/combobox.js) and [src/js/components/tag-input.js](src/js/components/tag-input.js). Maintain a Set of selected values; click an option to toggle; emits `brut:change` with `{ values: [...] }`. Mirror as a multi-value hidden input list (one `<input type="hidden" name="<n>">` per value).

### 5.4 Range slider (dual-thumb)

- **JS-bound:** yes (native range can't do two thumbs without overlay).
- **Files:** CSS in `FORMS — extended`, JS `range-dual.js`, preview, docs **Forms**.
- **Classes:** `.brut-range-dual`, `.brut-range-dual__track`, `.brut-range-dual__fill`, `.brut-range-dual__thumb`, `.brut-range-dual__thumb--max`.
- **CSS specifics:** Match the existing `.brut-range` track (4px ink border, paper fill). Thumbs are 18×18 ink squares with 3-3-0 ink shadow. Fill is a primary-yellow rectangle between thumbs.
- **JS:** Two hidden inputs (`data-brut-name-min` / `-max`). Pointer-down on thumb → drag listener on `document`. Arrow keys nudge by step. Clamp min ≤ max. Dispatch `brut:change` with `{ min, max }`.

### 5.5 Form layouts

Pure CSS patterns (no new components). Add a docs section showing recipes that compose existing primitives.

- **Files:** docs section only — no CSS or JS additions.
- **Patterns to document:**
  - Stacked: `.brut-form` (already exists).
  - Two-column: `<div class="brut-grid brut-grid--2">` of `.brut-field`s.
  - Inline (label + input on one row): a `.brut-field` modifier `.brut-field--inline { display: grid; grid-template-columns: 160px 1fr; align-items: center; gap: var(--sp-3); }` — add to `FORMS — extended`.
  - Settings list rows: pair `.brut-rows` (see 3.2) with switches/inputs in the trail slot.

---

## Tier 6 — Polish

### 6.1 Icon sprite

Most-impactful polish item. Today the kit uses Unicode (`✓`, `×`, `!`, `▲`); they don't align. Ship a small sprite.

- **JS-bound:** no.
- **Files:**
  - New `assets/icons.svg` — single SVG with `<symbol id="brut-i-…">` for: arrow-right, arrow-left, arrow-down, arrow-up, chevron-right, chevron-down, check, x, plus, minus, info, warning, error, search, eye, eye-off, copy, external-link, menu (burger), more-horizontal, more-vertical. ~20 symbols. 24×24 viewBox each. Stroke-based, 2.5px stroke, `currentColor`, no fills, no rounding.
  - CSS in a new `/* ICON */` banner under `BUTTON` (~320): `.brut-i { display: inline-block; width: 1em; height: 1em; vertical-align: -0.15em; fill: none; stroke: currentColor; stroke-width: 2.5; }`. Size variants `--sm (16)`, `--md (20)`, `--lg (24)` set `font-size`.
  - `preview/components-icons.html` — render the full grid with names.
  - Docs section `id="icons"` under **Components**.
- **Markup:**
  ```html
  <svg class="brut-i brut-i--md"><use href="../assets/icons.svg#brut-i-check"/></svg>
  ```
- **Build note:** `assets/icons.svg` is referenced via `<use href>` — it stays a separate file, not bundled. The README install snippet should mention copying both the dist files AND the icons SVG.
- **Migration:** swap Unicode glyphs in existing components (alert icon, password toggle, search clear, dialog close, accordion +/−) for the SVG sprite **after** the sprite ships.

### 6.2 Kbd — already shipped

`.brut-kbd` already exists at [src/components.css:205](src/components.css#L205). **Nothing to build.** Before assuming an entry is missing in this list, grep `src/components.css` for the class name first. If you find that the docs page is missing a section for kbd, add a `<section class="docs-section" id="kbd">` to `docs/index.html` — that's the only legitimate work item here.

### 6.3 Progress bar

- **JS-bound:** no (consumer sets `style="--brut-progress: 64%"`).
- **Files:** CSS in **Feedback** area, preview, docs **Feedback**.
- **Classes:** `.brut-progress`, `.brut-progress__fill`, `.brut-progress--lime/--pink`.
- **CSS specifics:** Outer: `height: 16px; border: 4px solid var(--ink); background: var(--paper); box-shadow: 3px 3px 0 0 var(--ink); overflow: hidden;`. Fill: `height: 100%; background: var(--primary); width: var(--brut-progress, 0%); transition: width 140ms var(--ease-snap);`. Indeterminate: `.brut-progress--indeterminate .brut-progress__fill` runs a 1.2s `linear infinite` keyframe sliding a 30%-wide chunk left → right.

### 6.4 Wizard stepper (multi-step nav)

Distinct from the numeric stepper.

- **JS-bound:** no (consumer toggles `--current` / `--done`).
- **Files:** CSS in **Navigation**, preview, docs **Navigation**.
- **Classes:** `.brut-steps` (ol), `.brut-steps__step` (li), `.brut-steps__bullet` (square number block), `.brut-steps__label`, `.brut-steps__step--current`, `.brut-steps__step--done`.
- **CSS specifics:** `display: flex; gap: var(--sp-3); list-style: none; padding: 0; margin: 0;`. Each step `display: flex; align-items: center; gap: var(--sp-2);`. Bullet `width: 32px; height: 32px; border: 3px solid var(--ink); display: grid; place-items: center; font-family: var(--font-display); background: var(--bone);`. `--current .brut-steps__bullet { background: var(--primary); box-shadow: 3px 3px 0 0 var(--ink); }`. `--done .brut-steps__bullet { background: var(--ink); color: var(--paper); }`. Connectors between steps: `step::after { content: ''; width: 24px; height: 3px; background: var(--ink); }` (hide on last).

---

## Final checklist (per-component)

When you finish one component, before declaring done:

- [ ] CSS added under a labeled banner in `src/components.css`. No hex/px/rem outside tokens.
- [ ] JS file at `src/js/components/<name>.js` (if interactive). Single IIFE, registers via `Brut.register`. Uses only `data-brut="<name>"` selector. `setAttribute('type','button')` on every wired `<button>`. Dispatches `brut:change` on commit. Hidden `<input>` mirrors state if the value should post.
- [ ] `preview/components-<name>.html` exists, renders every variant, no console errors.
- [ ] Docs sidebar link added under the right `<h2>` group.
- [ ] Docs section added — `<h2>`, optional `.lead`, `.docs-preview` with live render, `<pre class="docs-snippet">` with HTML-entity-escaped snippet.
- [ ] `bash build.sh` exits 0 and reports non-zero byte counts.
- [ ] Sanity grep passes:
  ```bash
  grep -r "ui_kits\|jsx\|text/babel\|React\|require(\|import .* from " src/ docs/ preview/
  ```
- [ ] Docs page and preview open in a browser; JS-bound component responds to clicks/keys; hidden input mirrors state.

If a request would require a JS framework, transpiler, new dependency, or a visual rule violation — **pause and ask the user**. Don't work around it.
