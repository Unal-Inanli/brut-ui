---
title: Configuration
description: Configure the BRUT Vite plugin via brut.config.js — prefix, components, themes, tokens, variants, and output.
---

# Configuration

Reach for `brut.config.js` when you want a renamed class prefix,
build-time tree-shaking, programmatic component variants, or a
manifest the MCP server and AI tooling can resolve. Everything else
— recoloring, swapping fonts, retuning shadows — is a plain `:root`
override in your own stylesheet and needs none of the plumbing on
this page. See [`/get-started#customize-tokens`](/get-started#customize-tokens)
for the no-plugin path.

The config layer is a thin Vite plugin. It reads `brut.config.js`
from your project root, rewrites the bundle, and emits the manifest.
If you don't run Vite, nothing on this page applies.

## Prerequisites

- Node ≥20 (the engines field in `package.json`).
- A Vite project (Vite ≥6.0.0 — peer dependency of the plugin).
- `@sprtn/ui` installed:

  ```bash
  npm install @sprtn/ui
  ```

- The optional Vite plugin — auto-resolved when you import
  `@sprtn/ui/vite`. Skip the plugin entirely if your only goal is
  static CSS-token overrides; a `:root { … }` block in your own
  stylesheet works without any of this.

---

## Setup

### 1. Scaffold the config

```bash
npx brut init
```

This writes two files at your project root:

- `brut.config.js` — every option commented out, ready to enable.
- `.mcp.json` — registers the `@sprtn/mcp` server entry so AI
  agents can query the manifest. Optional. See
  [`/reference/manifest`](/reference/manifest) for what the MCP
  server exposes.

Flags:

- `--force` — overwrite existing files instead of skipping.
- `--no-config` — skip writing `brut.config.js`.
- `--no-mcp` — skip writing `.mcp.json`.

### 2. Wire the plugin into Vite

```js
// vite.config.js
import { defineConfig } from 'vite'
import brut from '@sprtn/ui/vite'

export default defineConfig({
  plugins: [brut()],
})
```

The plugin reads `brut.config.js` from `process.cwd()` during
`configResolved`. No path argument is needed — the file just has to
sit next to `vite.config.js`.

### 3. Rebuild

```bash
npm run dev
# or
npm run build
```

`npx brut build` is the alternate path: it drives Vite directly with
the plugin pre-wired, so you don't need to edit `vite.config.js`
yourself.

---

## Configuration reference

Every option is optional. Defaults match the unconfigured build, so
an empty `defineConfig({})` produces the same bundle as no config at
all. Source: `src/config/define.js`.

### prefix

Default: `'brut'`. Renames every `.brut-*` class root and every
`data-brut` attribute in the emitted CSS and JS.

```js
import { defineConfig } from '@sprtn/ui/config'

export default defineConfig({
  prefix: 'ui',
})
```

After rebuilding, `.brut-btn` becomes `.ui-btn`, `data-brut="switch"`
becomes `data-ui="switch"`, and `dist/components.json` reports the
new prefix. The runtime registers itself against the renamed
attribute, so `Brut.init()` continues to wire interactive components
correctly.

### components

Default: `'all'`. Either the literal string `'all'` or an array of
component names from the master registry.

```js
export default defineConfig({
  components: ['btn', 'card', 'input', 'switch'],
})
```

When you list components explicitly, only their CSS lands in
`dist/brut.css` — the rest is tree-shaken. The full name list lives
in `KNOWN_COMPONENTS` (`src/config/define.js`); the
[components index](/components/) is a readable mirror.

### theme

Default: `'brutalist'`. Allowed values today: `'brutalist'`,
`'corporate'`, `'minimal'` — the entries in `KNOWN_THEMES`.

```js
export default defineConfig({
  theme: 'corporate',
})
```

The theme picks the semantic-token layer that ships in the build.
See [`/foundations/visual`](/foundations/visual) for what each theme
actually changes.

### themes

Default: `[]`. Reserved for registering additional custom themes
once the themes system lands. Leave it empty for now; a dedicated
themes guide will cover it.

### tokens.override

Default: `{}`. Replace existing CSS variables. Each entry maps a
token name to a new value.

```js
export default defineConfig({
  tokens: {
    override: {
      '--primary': '#FF6B9D',
    },
  },
})
```

The plugin appends a `:root { … }` block to `dist/brut.css` at build
time, so the overrides win against the original token definitions
without changing source order in your own stylesheet.

### tokens.extend

Default: `{}`. Add brand-new CSS variables that don't exist in
BRUT. Useful for project-specific tokens consumed by your own
stylesheets.

```js
export default defineConfig({
  tokens: {
    extend: {
      '--brand': '#007AFF',
      '--brand-soft': '#E0EEFF',
    },
  },
})
```

`override` and `extend` can both be set. They land as two separate
`:root` blocks at the end of `brut.css`.

### variants

Default: `{}`. Define new component modifier classes by overriding
intent tokens. Each key is a component, each sub-key is a modifier
name, each value is a token-override map.

```js
export default defineConfig({
  variants: {
    btn: {
      brand: {
        '--btn-bg': 'var(--brand)',
        '--btn-fg': '#fff',
      },
    },
  },
})
```

This produces a usable `.brut-btn--brand` (or `.ui-btn--brand` if
you also set `prefix: 'ui'`). Apply it the same way you'd apply
`.brut-btn--primary`.

### output.dir

Default: `'dist'`. The build output directory. The plugin doesn't
read this directly — it's a hint for tooling that walks your build
output.

### output.minify

Default: `true`. Minify the emitted CSS and JS. Set to `false` when
you need a readable bundle for debugging.

### output.manifest

Default: `true`. Emit `dist/components.json` — the manifest the MCP
server and AI agents query. Disable only when you're embedding BRUT
into a larger artifact and don't want the metadata bytes.

---

## Worked example

A complete config that renames the prefix, overrides one token,
adds a brand variant for buttons, and tree-shakes the build to a
small component set:

```js
// brut.config.js
import { defineConfig } from '@sprtn/ui/config'

export default defineConfig({
  prefix: 'ui',

  components: ['btn', 'card', 'input', 'switch', 'dialog'],

  tokens: {
    override: {
      '--primary': '#FF6B9D',
    },
    extend: {
      '--brand': '#007AFF',
    },
  },

  variants: {
    btn: {
      brand: {
        '--btn-bg': 'var(--brand)',
        '--btn-fg': '#fff',
      },
    },
  },
})
```

The resulting markup uses the new prefix and the new variant:

```html
<button class="ui-btn ui-btn--brand">Brand action</button>
<div class="ui-card">…</div>
```

---

## What to expect

The shape of `dist/` does not change when you add a config. You
still get `brut.css`, `brut.js`, `brut.esm.js`, and (unless you
disable it) `components.json`. What changes is the contents:

- **Class names** are rewritten if `prefix` is set. The plugin's
  `transform()` step replaces `brut-`, `data-brut`, and `brut:`
  occurrences in CSS and JS at build time.
- **Override CSS** is appended to `brut.css`. Look at the bottom of
  the file — you'll see one or two trailing `:root { … }` blocks
  for `tokens.override` and `tokens.extend`, plus any
  `.<prefix>-<component>--<modifier>` rules from `variants`.
- **`components.json`** reflects the renamed prefix in every
  component's `class` and `selector` fields. The MCP server and any
  AI tooling continue to resolve correctly because they read the
  manifest, not the source.
- **Runtime ordering** — `generateBundle()` reorders the JS chunk so
  `core.js` lands first, ahead of every component module that
  registers against it. Auto-init keeps working.

---

## Verify

Run the doctor to confirm the config is being read:

```bash
npx brut doctor
```

If you set `prefix: 'ui'`, the rebuilt output should contain zero
references to the old prefix:

```bash
grep -r "brut-" dist/   # should be empty
```

A non-empty result means the plugin didn't run — recheck Step 2.

---

## Troubleshooting

### Config seems ignored

The `brut()` plugin isn't in `vite.config.js`'s `plugins` array, or
you're using a non-Vite build pipeline (webpack, esbuild standalone,
Rollup without Vite). Recheck Step 2. The plugin only runs when
Vite calls it.

### `Vite not found`

`npx brut build` requires Vite ≥6 in your project as a peer
dependency. Install it:

```bash
npm install -D vite
```

### Classes still say `brut-`

`prefix` only takes effect after a rebuild. Restart `npm run dev` or
rerun `npm run build`. The transform runs once per file load, so
stale dev-server caches can also linger — clear them with a fresh
`npm run dev`.

### `brut.config.js` not picked up

The file must sit at the project root (the same directory as
`vite.config.js`). The plugin loads it via `process.cwd()`, so a
nested location is invisible. If you keep configs in a subfolder,
re-export from the root:

```js
// brut.config.js (at project root)
export { default } from './config/brut.config.js'
```

---

## What's next?

- [Use BRUT with Vite](/integrations/vite) — the framework
  walkthrough that pairs with this page.
- [Manifest schema](/reference/manifest) — the contract
  `dist/components.json` follows.
- [Foundations: visual](/foundations/visual) — what each theme's
  semantic tokens control.
