# Get started

BRUT ships as two flat files — one CSS file and one optional JS runtime.
No build step required, no preprocessor, no framework.

You can drop the files in over a CDN, install from npm, or download the
artifacts directly. Pick the path that matches how you ship.

## Install

### CDN (no install)

The fastest path. Add two tags to your `<head>` and you're done.

```html
<!-- jsDelivr -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@brut/ui@1/dist/brut.css" />
<script src="https://cdn.jsdelivr.net/npm/@brut/ui@1/dist/brut.js" defer></script>
```

```html
<!-- unpkg (alternative) -->
<link rel="stylesheet" href="https://unpkg.com/@brut/ui@1/dist/brut.css" />
<script src="https://unpkg.com/@brut/ui@1/dist/brut.js" defer></script>
```

::: tip Pin the major
`@1` resolves to the latest 1.x release. Pin to an exact version
(`@1.0.0`) when you ship to production so a future minor release can't
move pixels under your users.
:::

### npm

```bash
npm install @brut/ui
# or
pnpm add @brut/ui
# or
yarn add @brut/ui
```

Then load the CSS and (optionally) the JS:

```js
import '@brut/ui/css'
import '@brut/ui'
```

Bundlers like Vite, webpack, esbuild, and Rollup pick up the
`exports` map and emit only what you import.

### Download

Grab the two files directly from the
[latest GitHub release](https://github.com/Unal-Inanli/brut-ui/releases/latest)
or copy them out of `node_modules/@brut/ui/dist/`.

::: info JS is optional
Pure CSS components (buttons, cards, badges, alerts, layout helpers) work
without the JS runtime. You only need `brut.js` for components that
maintain state — switch, tabs, dialog, drawer, combobox, stepper, and
the rest of the interactive set.
:::

---

## Your first component

Every BRUT component is an HTML element with a `.brut-*` class.
Interactive components also get a `data-brut` attribute so the JS runtime
can wire them up automatically on `DOMContentLoaded`.

### A button

```html
<button type="button" class="brut-btn brut-btn--primary">Get loud</button>
```

<div class="brut-preview-frame" style="padding: 1rem;">
  <button type="button" class="brut-btn brut-btn--primary" style="margin-right: .5rem;">Get loud</button>
  <button type="button" class="brut-btn" style="margin-right: .5rem;">Default</button>
  <button type="button" class="brut-btn brut-btn--ink">Ink</button>
</div>

### A toggle switch (interactive)

```html
<label class="brut-cluster brut-cluster--sm" style="cursor:pointer">
  <span class="brut-switch" data-brut="switch">
    <input type="checkbox" hidden />
    <span class="brut-switch__knob"></span>
  </span>
  Enable notifications
</label>
```

### A form field

```html
<div class="brut-field">
  <label class="brut-field__label" for="email">Email</label>
  <input id="email" class="brut-input" type="email" />
  <span class="brut-field__hint">We never share your email.</span>
</div>
```

---

## Customize tokens

Every value in BRUT is a CSS variable. Override the ones you want in your
own stylesheet — no recompiling, no rebasing, no source maps.

```css
/* your-theme.css — load AFTER brut.css */
:root {
  --primary: #FF6B9D;                       /* swap yellow → pink */
  --font-display: 'Arial Black', sans-serif;
  --shadow-md: 6px 6px 0 0 #FF6B9D;         /* colored shadows */
}
```

That single `:root` block changes the entire UI instantly — colors,
spacing, shadows, motion. The token system is split across three layers
(primitives, semantic, intent); see the
[manifest schema](/reference/manifest) for the full enumeration.

---

## Verify the install

Drop this snippet into a fresh `index.html`. If the button renders with a
hard offset shadow and snaps to the lower-right on click, you're set.

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>BRUT smoke test</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@brut/ui@1/dist/brut.css" />
  </head>
  <body style="padding: 2rem;">
    <button type="button" class="brut-btn brut-btn--primary brut-btn--lg">
      It works.
    </button>
    <script src="https://cdn.jsdelivr.net/npm/@brut/ui@1/dist/brut.js" defer></script>
  </body>
</html>
```

---

## What's next?

- **[Components](/components/)** — 150+ components, organized by category.
- **[Examples](/examples)** — full-page templates built with BRUT.
- **[Manifest schema](/reference/manifest)** — for tooling and AI agents.
- **[GitHub](https://github.com/Unal-Inanli/brut-ui)** — source, issues, releases.
