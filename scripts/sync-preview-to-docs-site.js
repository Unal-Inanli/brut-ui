#!/usr/bin/env node
// Mirrors preview/ into docs-site/public/preview/ so the docs site can
// iframe component fixtures at /preview/components-<name>.html.
//
// VitePress treats public/ as a static dir. We don't symlink because
// Windows runners can't follow symlinks reliably.

import { readFileSync, writeFileSync, readdirSync, mkdirSync, statSync, existsSync, rmSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const src = join(root, 'preview')
const dst = join(root, 'docs-site', 'public', 'preview')

if (existsSync(dst)) rmSync(dst, { recursive: true, force: true })
mkdirSync(dst, { recursive: true })

let count = 0
for (const entry of readdirSync(src)) {
  const sp = join(src, entry)
  const dp = join(dst, entry)
  if (statSync(sp).isFile()) {
    let content = readFileSync(sp)
    // The preview pages currently load `../dist/brut.css` and `../dist/brut.js`.
    // From docs-site/public/preview/ that path doesn't resolve. Rewrite to
    // absolute /brut.css / /brut.js (also synced by this script).
    if (entry.endsWith('.html')) {
      const text = content.toString('utf8')
        .replaceAll('"../dist/brut.css"', '"/brut.css"')
        .replaceAll('"../dist/brut.js"', '"/brut.js"')
        .replaceAll("'../dist/brut.css'", "'/brut.css'")
        .replaceAll("'../dist/brut.js'", "'/brut.js'")
      content = Buffer.from(text, 'utf8')
    }
    writeFileSync(dp, content)
    count++
  }
}

// Also copy dist/brut.css and dist/brut.js to docs-site/public so the
// rewritten preview pages can find them.
const distSrc = join(root, 'dist')
for (const f of ['brut.css', 'brut.js']) {
  const sp = join(distSrc, f)
  if (existsSync(sp)) {
    writeFileSync(join(root, 'docs-site', 'public', f), readFileSync(sp))
  }
}

console.log(`Synced ${count} preview files + dist/brut.{css,js} into docs-site/public/.`)
