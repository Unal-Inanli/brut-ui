---
title: Get started
---

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
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@sprtn/ui@1/dist/brut.css" />
<script src="https://cdn.jsdelivr.net/npm/@sprtn/ui@1/dist/brut.js" defer></script>
```

```html
<!-- unpkg (alternative) -->
<link rel="stylesheet" href="https://unpkg.com/@sprtn/ui@1/dist/brut.css" />
<script src="https://unpkg.com/@sprtn/ui@1/dist/brut.js" defer></script>
```

::: tip Pin the major
`@1` resolves to the latest 1.x release. Pin to an exact version
(`@1.0.0`) when you ship to production so a future minor release can't
move pixels under your users.
:::

### npm

```bash
npm install @sprtn/ui
# or
pnpm add @sprtn/ui
# or
yarn add @sprtn/ui
```

Then load the CSS and (optionally) the JS:

```js
import '@sprtn/ui/css'   // styles
import '@sprtn/ui'       // optional JS runtime (data-brut auto-init)
```

Bundlers like Vite, webpack, esbuild, and Rollup pick up the
`exports` map and resolve these specifiers without further config.

#### What you can import

The package exposes five subpaths:

| Specifier | Resolves to | When to use |
| --- | --- | --- |
| `@sprtn/ui` | `dist/brut.esm.js` | The JS runtime (interactive components). |
| `@sprtn/ui/css` | `dist/brut.css` | The single stylesheet. Always load this. |
| `@sprtn/ui/manifest` | `dist/components.json` | Component metadata for tooling and AI agents. |
| `@sprtn/ui/vite` | `src/config/vite-plugin.js` | Optional Vite plugin — see [Configuration](/configuration). |
| `@sprtn/ui/config` | `src/config/define.js` | `defineConfig` helper for `brut.config.js` — see [Configuration](/configuration). |

For stack-specific walkthroughs (Vite, Next.js, Astro, SvelteKit,
Nuxt, plain HTML), see the **[Integrations](/integrations/)** pages.

::: tip CSS-side `@import` works too
If your project organizes styles in `.css` files instead of importing
them from JS, you can write:

```css
/* anywhere in a CSS file processed by Vite, webpack, esbuild, etc. */
@import '@sprtn/ui/css';
```

This is identical to `import '@sprtn/ui/css'` from JS — pick the one
that matches your project. **It does not work in vanilla browser CSS**
because bare module specifiers only resolve through a bundler.
:::

### Download

Grab the two files directly from the
[latest GitHub release](https://github.com/Unal-Inanli/brut-ui/releases/latest)
or copy them out of `node_modules/@sprtn/ui/dist/`.

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
<label class="brut-switch" data-brut="switch">
  <input type="checkbox" hidden />
  <span class="brut-switch__knob"></span>
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
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@sprtn/ui@1/dist/brut.css" />
  </head>
  <body style="padding: 2rem;">
    <button type="button" class="brut-btn brut-btn--primary brut-btn--lg">
      It works.
    </button>
    <script src="https://cdn.jsdelivr.net/npm/@sprtn/ui@1/dist/brut.js" defer></script>
  </body>
</html>
```

---

## Troubleshooting

### `Cannot find module '@sprtn/ui/css'`

Your Node version is below 18. The `exports` map in `package.json` is
a Node 18+ feature. Either upgrade Node, or fall back to deep paths
that work on every version:

```js
import '@sprtn/ui/dist/brut.css'
import '@sprtn/ui/dist/brut.js'
```

### Components don't activate (switch doesn't toggle, dialog doesn't open, …)

Three possible causes:

1. **`brut.js` isn't loaded.** Check the network tab. The runtime is
   what wires up `data-brut="…"` elements.
2. **Markup was inserted after `DOMContentLoaded`.** Auto-init only
   runs once. Call `Brut.init(rootElement)` after dynamic insertion.
   Re-init is a no-op.
3. **The component isn't actually a `data-brut` component.** Static
   visuals (button, card, badge, alert, layout primitives) need no JS
   — they work on CSS alone.

### Styles look wrong / token overrides don't apply

Load order. Your custom CSS must be loaded **after** `brut.css` so
your `:root` overrides win. Check both your import order in JS *and*
the order of `<link>` tags in HTML.

### Hover shows soft shadows, motion feels slow

You likely have a global `*` selector applying a `transition` or
`box-shadow` in your own stylesheet. BRUT's tokens use snap motion
(80–140ms) and hard offset shadows by design — anything global will
override them. Scope your `*` rules.

### `@import '@sprtn/ui/css'` in vanilla CSS gives a 404

Bare module specifiers only resolve inside a bundler. Use one of
these instead, depending on your setup:

```css
/* if your CSS is processed by Vite/webpack/esbuild/Rollup */
@import '@sprtn/ui/css';

/* if you're loading raw CSS in the browser */
@import url('https://cdn.jsdelivr.net/npm/@sprtn/ui@1/dist/brut.css');
```

---

## Dynamic content & SPA usage

`Brut.init(rootElement)` wires every `data-brut="…"` component inside
`rootElement`. The runtime stamps a `__brutInit` flag on each wired
element so re-init is a no-op — safe to call after every dynamic insert.

```js
const container = document.getElementById('dynamic-content');
container.innerHTML = '<div data-brut="dialog">…</div>';
Brut.init(container);   // wire all new components inside container
```

Pass the narrowest `root` (not `document`) to keep the scan cheap.
A `Brut.destroy(el)` cleanup hook is on the roadmap (see GitHub issue #95)
but not yet shipped — components stay wired until their elements are
detached from the DOM.

---

## What's next?

- **[Integrations](/integrations/)** — Vite, Next.js, Astro, SvelteKit, Nuxt, plain HTML.
- **[Configuration](/configuration)** — rename the prefix, add variants, override tokens at build time.
- **[Components](/components/)** — 150+ components, organized by category.
- **[Examples](/examples)** — full-page templates built with BRUT.
- **[Foundations](/foundations/visual)** — the visual rules every screen obeys.
- **[Manifest schema](/reference/manifest)** — for tooling and AI agents.
- **[GitHub](https://github.com/Unal-Inanli/brut-ui)** — source, issues, releases.
