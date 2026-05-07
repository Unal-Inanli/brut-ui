// Report-only WCAG 2.1 AA scan via axe-core, one test per preview page.
// Wired as `continue-on-error: true` in the CI workflow until existing
// preview fixtures are cleaned up. Once the violation count is zero, drop
// the continue-on-error so this becomes a hard gate.
//
// To investigate locally:   pnpm test:a11y
// To investigate one page:  pnpm exec playwright test tests/smoke/a11y.spec.js --grep "components-dialog"

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const previewDir = resolve(__dirname, '..', '..', 'preview');

const pages = readdirSync(previewDir)
  .filter(f => f.startsWith('components-') && f.endsWith('.html'))
  .sort();

for (const file of pages) {
  test(`${file} — axe WCAG 2.1 AA`, async ({ page }) => {
    await page.goto(`/preview/${file}`, { waitUntil: 'load' });

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    const violations = results.violations.map(v => ({
      id: v.id,
      impact: v.impact,
      help: v.help,
      nodes: v.nodes.length,
    }));
    expect(violations, `axe violations on ${file}`).toEqual([]);
  });
}
