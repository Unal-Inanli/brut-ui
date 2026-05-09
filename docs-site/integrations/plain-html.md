---
title: Plain HTML
---

# Use BRUT in plain HTML

No bundler, no framework, no build step. Just a static page. There are
two flavors: load from a CDN, or install via npm and reference the
local files.

## TL;DR — CDN (no install)

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@sprtn/ui@1/dist/brut.css" />
<script src="https://cdn.jsdelivr.net/npm/@sprtn/ui@1/dist/brut.js" defer></script>
```

That's the entire integration. Drop those two tags into any HTML page
and start writing `.brut-*` markup.

## TL;DR — npm + local files

```bash
npm install @sprtn/ui
```

```html
<link rel="stylesheet" href="./node_modules/@sprtn/ui/dist/brut.css" />
<script src="./node_modules/@sprtn/ui/dist/brut.js" defer></script>
```

This works as long as your dev server can serve `node_modules/`. Most
do (Vite, Live Server, Python's `http.server`). If yours doesn't, use
the copy approach below.

---

## Approach A — CDN

The fastest path. Pin the major (`@1`) for floating updates, or pin
exact (`@1.0.1`) for production-stable.

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>My BRUT page</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@sprtn/ui@1/dist/brut.css" />
  </head>
  <body>
    <button type="button" class="brut-btn brut-btn--primary">SHIP IT.</button>
    <script src="https://cdn.jsdelivr.net/npm/@sprtn/ui@1/dist/brut.js" defer></script>
  </body>
</html>
```

Both jsDelivr and unpkg work. Swap the host if you have a preference:

```text
https://unpkg.com/@sprtn/ui@1/dist/brut.css
https://unpkg.com/@sprtn/ui@1/dist/brut.js
```

## Approach B — npm + copy to `public/`

For projects that want the files locally but aren't running a bundler.

```bash
npm install @sprtn/ui
mkdir -p public/brut
cp node_modules/@sprtn/ui/dist/brut.css public/brut/
cp node_modules/@sprtn/ui/dist/brut.js  public/brut/
```

```html
<link rel="stylesheet" href="/brut/brut.css" />
<script src="/brut/brut.js" defer></script>
```

Add the copy commands to a `postinstall` script so they re-run after
every `npm install`:

```json
{
  "scripts": {
    "postinstall": "cp node_modules/@sprtn/ui/dist/brut.* public/brut/"
  }
}
```

## Approach C — browser import maps (no bundler, ESM)

Modern browsers can resolve bare specifiers via [import
maps](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script/type/importmap).

```html
<script type="importmap">
{
  "imports": {
    "@sprtn/ui": "https://cdn.jsdelivr.net/npm/@sprtn/ui@1/dist/brut.esm.js"
  }
}
</script>

<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@sprtn/ui@1/dist/brut.css" />

<script type="module">
  import '@sprtn/ui'
</script>
```

This is the closest you get to "Vite imports" without actually running
Vite. CSS still loads via `<link>` because import maps don't cover
stylesheets.

## Common gotchas

- **`file://` URLs** — opening an HTML file directly with a `file://`
  URL breaks `<script src="...">` paths in some browsers. Run a tiny
  static server (`python3 -m http.server`, `npx serve`).
- **CDN behind a corporate firewall** — jsDelivr and unpkg are both
  often blocked. Switch to the npm + local-file approach.
- **Self-hosted privacy** — copy the files into your repo so no
  request leaves your origin.
