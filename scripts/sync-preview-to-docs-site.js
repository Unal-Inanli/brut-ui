#!/usr/bin/env node
// Mirrors preview/ and demos/ into docs-site/public/ so the docs site can
// iframe component fixtures and full-page demos. VitePress treats public/
// as a static dir. We don't symlink because Windows runners can't follow
// symlinks reliably.

import { readFileSync, writeFileSync, readdirSync, mkdirSync, statSync, existsSync, rmSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const publicRoot = join(root, 'docs-site', 'public')

// Relative paths inside the synced HTML. With the fixture at
// public/<name>/<file>.html, "../brut.css" resolves to public/brut.css
// regardless of the VitePress base (none in dev, /brut-ui/ in prod).
function syncDir(name) {
  const src = join(root, name)
  const dst = join(publicRoot, name)
  if (existsSync(dst)) rmSync(dst, { recursive: true, force: true })
  mkdirSync(dst, { recursive: true })
  let n = 0
  for (const entry of readdirSync(src)) {
    const sp = join(src, entry)
    const dp = join(dst, entry)
    if (statSync(sp).isFile()) {
      let content = readFileSync(sp)
      if (entry.endsWith('.html')) {
        const text = content.toString('utf8')
          .replaceAll('"../dist/brut.css"', '"../brut.css"')
          .replaceAll('"../dist/brut.js"', '"../brut.js"')
          .replaceAll("'../dist/brut.css'", "'../brut.css'")
          .replaceAll("'../dist/brut.js'", "'../brut.js'")
        content = Buffer.from(text, 'utf8')
      }
      writeFileSync(dp, content)
      n++
    }
  }
  return n
}

const previewCount = syncDir('preview')
const demosCount = syncDir('demos')

// Also copy dist/brut.css and dist/brut.js to docs-site/public so the
// rewritten fixtures can find them.
const distSrc = join(root, 'dist')
for (const f of ['brut.css', 'brut.js']) {
  const sp = join(distSrc, f)
  if (existsSync(sp)) {
    writeFileSync(join(publicRoot, f), readFileSync(sp))
  }
}

console.log(
  `Synced ${previewCount} preview + ${demosCount} demo files + dist/brut.{css,js} into docs-site/public/.`
)
