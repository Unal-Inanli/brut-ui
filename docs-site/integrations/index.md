# Integrations

Pick your stack. Every page is a copy-paste starter — the snippets shown
are the actual config a fresh project needs, with no abridgements.

## Bundlers and frameworks

- **[Vite (vanilla / Vue / React / Svelte)](./vite)** — the canonical
  walkthrough. Covers JS-side `import` and CSS-side `@import`.
- **[Plain HTML + npm](./plain-html)** — for projects that install via
  npm but don't run a bundler. Two paths: copy from `node_modules/`,
  or use a browser import map.
- **[Next.js (App + Pages Router)](./nextjs)** — global CSS import,
  client-component requirement for `data-brut` JS.
- **[Astro](./astro)** — import in a layout, JS runtime works at the
  document level.
- **[SvelteKit](./sveltekit)** — import in `+layout.svelte`, use
  components in any `.svelte` file.
- **[Nuxt](./nuxt)** — `css: ['@sprtn/ui/css']` in `nuxt.config.ts`.

## What you can import

The `package.json` `exports` map defines five subpaths.

| Specifier | Resolves to | When to use |
| --- | --- | --- |
| `@sprtn/ui` | `dist/brut.esm.js` | The JS runtime — `data-brut` auto-init for interactive components. |
| `@sprtn/ui/css` | `dist/brut.css` | The single stylesheet. Always load this. |
| `@sprtn/ui/manifest` | `dist/components.json` | Component metadata for tooling and AI agents. |
| `@sprtn/ui/vite` | `src/config/vite-plugin.js` | Optional Vite plugin for config-driven builds (prefix renaming, opt-out). |
| `@sprtn/ui/config` | `src/config/define.js` | `defineConfig` helper for `brut.config.js`. |

`require('@sprtn/ui')` works too (CommonJS resolves to `dist/brut.js`).

## A note on Node version

The `exports` field requires **Node ≥18**. Older versions will fail with
`Cannot find module '@sprtn/ui/css'`. If you must support Node 16, fall
back to deep paths (`@sprtn/ui/dist/brut.css`) — those work on every
Node version because they're plain file references.

## Stack not listed?

Any bundler that resolves the `exports` field works the same way. The
two-line pattern is universal:

```js
import '@sprtn/ui/css'
import '@sprtn/ui'  // omit if you only use static visuals
```

If something doesn't work, check the [troubleshooting section in Get
started](/get-started#troubleshooting) before opening an issue.
