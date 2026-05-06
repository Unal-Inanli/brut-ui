# Use BRUT with Vite

Works with vanilla Vite, Vue, React, Svelte, Solid, Preact, Lit — any
template Vite ships. The kit doesn't care about your framework. It's
plain HTML classes and a tiny vanilla JS runtime.

## TL;DR

```bash
npm install @sprtn/ui
```

```js
// src/main.js (or main.ts)
import '@sprtn/ui/css'
import '@sprtn/ui'
```

```html
<!-- anywhere in your markup -->
<button class="brut-btn brut-btn--primary">SHIP IT.</button>
```

That's it. `npm run dev` and you're styled.

## Full walkthrough

### 1. Scaffold a project

```bash
npm create vite@latest my-app -- --template vanilla
cd my-app
npm install
```

Use `--template vue`, `--template react`, etc. for your framework of
choice. The BRUT integration is identical.

### 2. Install the kit

```bash
npm install @sprtn/ui
```

### 3. Import the styles

In `src/main.js`:

```js
import './style.css'           // your own styles
import '@sprtn/ui/css'         // BRUT visual system
import '@sprtn/ui'             // BRUT JS runtime (interactive components)
```

Order matters when overriding tokens — load `@sprtn/ui/css` **before**
your own stylesheet so your `--primary` overrides win.

### 4. Use a component

In `index.html`:

```html
<button class="brut-btn brut-btn--primary">CLICK ME</button>

<label class="brut-switch" data-brut="switch">
  <input type="checkbox" hidden />
  <span class="brut-switch__knob"></span>
</label>
```

### 5. Run dev

```bash
npm run dev
```

The button renders with a hard offset shadow. The switch toggles on
click and on Space/Enter.

## CSS-side `@import`

Vite resolves bare module specifiers in `.css` files the same way it
does in JS. So this works inside any stylesheet processed by Vite:

```css
/* src/style.css */
@import '@sprtn/ui/css';

/* your overrides go here, after the import */
:root {
  --primary: #FF6B9D;
}
```

This is identical to the JS-side `import '@sprtn/ui/css'`. Pick the
one that matches your project's organization. **Do not** try this in
plain browser CSS — bare specifiers only resolve through a bundler.

## Tree-shaking the JS

`@sprtn/ui` is marked `sideEffects: true` because the runtime
auto-registers components on import. Don't expect tree-shaking to drop
unused interactive components today. If your bundle size matters more
than auto-init, omit `import '@sprtn/ui'` and only load the visual
CSS — every static visual component still works.

## Troubleshooting

- **`Cannot find module '@sprtn/ui/css'`** — Node ≥18 required. The
  `exports` map is a Node 18+ feature.
- **Styles look wrong / overrides don't apply** — load order. Your
  custom CSS must come after `@sprtn/ui/css`.
- **Interactive components don't activate** — `import '@sprtn/ui'` is
  missing, or the markup is being injected after `DOMContentLoaded`.
  Call `Brut.init(rootElement)` after dynamic insertion.
