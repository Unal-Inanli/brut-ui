# BRUT — A Neo-Brutalist UI Kit

> Build it like you mean it.

[![npm version](https://img.shields.io/npm/v/@sprtn/ui.svg?style=flat-square&color=000)](https://www.npmjs.com/package/@sprtn/ui)
[![npm downloads](https://img.shields.io/npm/dm/@sprtn/ui.svg?style=flat-square&color=000)](https://www.npmjs.com/package/@sprtn/ui)
[![bundle size](https://img.shields.io/bundlephobia/minzip/@sprtn/ui?style=flat-square&color=000&label=min%2Bgzip)](https://bundlephobia.com/package/@sprtn/ui)
[![license](https://img.shields.io/npm/l/@sprtn/ui.svg?style=flat-square&color=000)](./LICENSE)

Hard borders. Hard offset shadows. Loud color. No gradients, no soft drop-shadows, no rounded-corner-with-left-accent-stripe cliché. 150+ components. Vanilla HTML, CSS, and JS — no React, no build step required.

**[→ Browse components](https://unal-inanli.github.io/brut-ui/components/)** &nbsp;·&nbsp; **[→ Live examples](https://unal-inanli.github.io/brut-ui/examples)** &nbsp;·&nbsp; **[→ Get started](https://unal-inanli.github.io/brut-ui/get-started)**

---

## Quick start

Three install paths. Pick the one that matches how you ship.

### CDN — zero install

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@sprtn/ui@1/dist/brut.css" />
<script src="https://cdn.jsdelivr.net/npm/@sprtn/ui@1/dist/brut.js" defer></script>
```

`@1` resolves to the latest 1.x release. Pin to an exact version (`@1.0.1`) for production.

### npm — for any bundler

```bash
npm install @sprtn/ui
# or: pnpm add @sprtn/ui
# or: yarn add @sprtn/ui
```

```js
import '@sprtn/ui/css'  // styles
import '@sprtn/ui'      // optional JS runtime (data-brut auto-init)
```

The `exports` map covers Vite, webpack, esbuild, Rollup, Next.js, Astro, SvelteKit, and Nuxt out of the box. See **[integration guides](https://unal-inanli.github.io/brut-ui/integrations/)** for stack-specific walkthroughs.

**One-shot config scaffold.** Run `npx brut init` and you get `brut.config.js` (for the optional Vite plugin) plus a `.mcp.json` that registers the [`@sprtn/mcp`](https://www.npmjs.com/package/@sprtn/mcp) server with Claude Code, Cursor, and Claude Desktop — so AI agents can read your component manifest without crawling source. Flags: `--no-mcp`, `--no-config`, `--force`.

### Download

Grab the two files from the [latest GitHub release](https://github.com/Unal-Inanli/brut-ui/releases/latest) or copy them out of `node_modules/@sprtn/ui/dist/`.

---

## Your first component

```html
<button type="button" class="brut-btn brut-btn--primary">SHIP IT.</button>

<form class="brut-form">
  <div class="brut-field">
    <label class="brut-field__label" for="email">Email</label>
    <input id="email" class="brut-input" type="email" />
  </div>

  <label class="brut-switch" data-brut="switch">
    <input type="checkbox" name="notify" hidden />
    <span class="brut-switch__knob"></span>
  </label>
</form>
```

Static visuals (button, input) need no JS. Anything carrying `data-brut="…"` (switch, tabs, dialog, stepper, combobox, dropzone, …) auto-inits on `DOMContentLoaded` from the loaded `brut.js`. For markup added later, call `Brut.init(rootElement)` after insertion. Re-init is a no-op.

---

## What's in the box

- **One CSS file** — `dist/brut.css`. 80+ design tokens, every component styled, no preprocessor.
- **Optional JS runtime** — `dist/brut.js`. Adds keyboard, ARIA, and form-mirroring to interactive components. Skip the file if you only use static visuals.
- **AI-native manifest** — `dist/components.json` enumerates every component, its modifiers, events, copy-paste examples, and **declared responsive shape**. Backed by `dist/manifest-schema.json`.
- **Themeable** — three layers of CSS variables. Swap visual identity via a single `data-theme` attribute or by overriding tokens in your own stylesheet.
- **Responsive by default** — every interactive component declares one of nine canonical responsive shapes (fullscreen-modal on phones, bottom-sheet for anchored overlays, horizontal-scroll for wide rows, …) and is verified at 320/375/640/768/1024/1440 in CI. See [docs/responsive-shapes.md](./docs/responsive-shapes.md).

---

## Use it in your stack

| Stack | Import line | Walkthrough |
| --- | --- | --- |
| Vite (vanilla / Vue / React / Svelte) | `import '@sprtn/ui/css'` | [vite.md](https://unal-inanli.github.io/brut-ui/integrations/vite) |
| Plain HTML + npm | `<link href="node_modules/@sprtn/ui/dist/brut.css">` or import map | [plain-html.md](https://unal-inanli.github.io/brut-ui/integrations/plain-html) |
| Next.js (App + Pages Router) | `import '@sprtn/ui/css'` in `layout.tsx` / `_app.js` | [nextjs.md](https://unal-inanli.github.io/brut-ui/integrations/nextjs) |
| Astro | `import '@sprtn/ui/css'` in a layout | [astro.md](https://unal-inanli.github.io/brut-ui/integrations/astro) |
| SvelteKit | `import '@sprtn/ui/css'` in `+layout.svelte` | [sveltekit.md](https://unal-inanli.github.io/brut-ui/integrations/sveltekit) |
| Nuxt | `css: ['@sprtn/ui/css']` in `nuxt.config.ts` | [nuxt.md](https://unal-inanli.github.io/brut-ui/integrations/nuxt) |

Every walkthrough is a copy-paste starter. If your stack isn't listed, the npm install + `import '@sprtn/ui/css'` pattern works in any bundler that resolves the `exports` field (Node ≥18).

---

## Customize via tokens

Every value in BRUT is a CSS variable. Override the ones you want — no recompile, no source patch.

```css
/* your-theme.css — load AFTER brut.css */
:root {
  --primary:      #FF6B9D;                   /* swap yellow → pink */
  --font-display: 'Arial Black', sans-serif;
  --shadow-md:    6px 6px 0 0 #FF6B9D;       /* match the accent */
}
```

That single block changes the entire UI. The token system is split across three layers (primitives, semantic, intent) so themes override only what they need. See the [manifest schema](https://unal-inanli.github.io/brut-ui/reference/manifest) for the full enumeration.

---

## Mental model

Four layers, in order:

1. **Tokens** — every color, type step, space, shadow, border, radius, motion, z-index, and semantic alias is a CSS variable.
2. **Classes** — `.brut-<name>` blocks compose tokens into the visual system. No class hardcodes a value. Modifiers are BEM (`.brut-btn--primary`).
3. **Optional JS hook** — interactivity opts in via `data-brut="<name>"`. The runtime auto-inits on `DOMContentLoaded`.
4. **Custom event + hidden input** — every form-state component dispatches `brut:change` with `event.detail.value` and mirrors its value to a hidden `<input>` so `<form>` submission just works.

That's the entire shape.

---

## Documentation

- **[Get started](https://unal-inanli.github.io/brut-ui/get-started)** — install, first component, CSS-side `@import`, troubleshooting.
- **[Components](https://unal-inanli.github.io/brut-ui/components/)** — 150+ components, organized by category, with live previews.
- **[Integrations](https://unal-inanli.github.io/brut-ui/integrations/)** — Vite, Next.js, Astro, SvelteKit, Nuxt, plain HTML.
- **[Examples](https://unal-inanli.github.io/brut-ui/examples)** — full-page templates (landing, login, dashboard).
- **[Foundations](https://unal-inanli.github.io/brut-ui/foundations/visual)** — the visual rules every screen obeys.
- **[Manifest schema](https://unal-inanli.github.io/brut-ui/reference/manifest)** — the source of truth for tooling and AI agents.
- **[Changelog](https://unal-inanli.github.io/brut-ui/changelog)** — release notes, semver-strict.

For tooling: `dist/components.json` is a machine-readable enumeration of every component. The companion [`@sprtn/mcp`](./packages/mcp) MCP server consumes it so AI agents can scaffold pages without crawling source.

---

## Contributing

```bash
git clone https://github.com/Unal-Inanli/brut-ui.git
cd brut-ui && pnpm install && pnpm bootstrap
```

That's the full local setup — `pnpm bootstrap` builds `dist/`, runs `brut doctor`, and primes the MCP server. Each `git worktree` needs its own `pnpm install && pnpm bootstrap` because `node_modules/` is per-worktree.

PRs welcome. Read **[CONTRIBUTING.md](./CONTRIBUTING.md)** before opening one — it covers the four surfaces every component touches (CSS, JS, preview, docs) and the hard constraints (no deps, no gradients, no soft shadows, no transitions over 140ms).

For AI-orchestrated contributions, **[AGENTS.md](./AGENTS.md)** is the authoritative recipe and **[CLAUDE.md](./CLAUDE.md)** is the orchestration playbook.

---

## License

[MIT](./LICENSE) © BRUT contributors.

## Caveats

- **All three default fonts are substitutes** loaded from Google Fonts. Replace them with your own `.woff2` files by overriding the `--font-*` tokens. See [foundations/fonts](https://unal-inanli.github.io/brut-ui/foundations/fonts).
- **No icon set ships with the kit yet.** Loading a third-party set from a CDN is *not* part of the supported install path. See [foundations/iconography](https://unal-inanli.github.io/brut-ui/foundations/iconography).
- **No dark mode yet.** A "dark paper" reverse mode is the obvious next step.
