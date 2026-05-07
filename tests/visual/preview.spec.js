// Pixel-diff every preview/components-*.html page against a stored baseline.
// Baselines live next to this spec under __snapshots__/ and are tracked via
// Git LFS (see .gitattributes).
//
// Loaders, autoplay, and any timer-driven UI are stabilized with
// `prefers-reduced-motion: reduce`. Default `brutalist` theme only — once
// preview pages opt into a [data-theme] toggle, this spec can iterate themes.
//
// Update baselines locally:
//   pnpm test:visual:update
// CI updates baselines via the workflow_dispatch in
//   .github/workflows/update-baselines.yml

import { test, expect } from '@playwright/test';
import { readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const previewDir = resolve(__dirname, '..', '..', 'preview');

const pages = readdirSync(previewDir)
  .filter(f => f.startsWith('components-') && f.endsWith('.html'))
  .sort();

test.use({
  viewport: { width: 1280, height: 800 },
  colorScheme: 'light',
  reducedMotion: 'reduce',
});

// Full-page screenshots of large preview pages (tables, etc.) can stress
// Vite's dev server when many run in parallel. Give each test a bigger
// budget than the 30s default; smoke/behavior keep the default.
test.describe.configure({ timeout: 60_000 });

for (const file of pages) {
  test(`${file} — pixel diff`, async ({ page }) => {
    await page.goto(`/preview/${file}`, { waitUntil: 'load' });
    // Give web fonts a tick to settle so kerning is stable across runs.
    await page.evaluate(() => document.fonts.ready);

    await expect(page).toHaveScreenshot(`${file}.png`, {
      fullPage: true,
      animations: 'disabled',
      maxDiffPixelRatio: 0.005,
    });
  });
}
