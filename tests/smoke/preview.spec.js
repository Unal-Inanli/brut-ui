// Hard-gate smoke: every preview page must load with no console errors,
// no page errors, and no 4xx/5xx network responses. Failures here are
// unambiguous bugs in the kit or the preview fixture's wiring.
//
// Accessibility scans live in tests/smoke/a11y.spec.js and are run as a
// report-only step in CI until the existing preview fixtures finish a
// baseline cleanup (notable known-baseline issues: missing <html lang="en">,
// missing <h1> on some pages — see ARCHITECTURE.md follow-ups).

import { test, expect } from '@playwright/test';
import { readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const previewDir = resolve(__dirname, '..', '..', 'preview');

const pages = readdirSync(previewDir)
  .filter(f => f.startsWith('components-') && f.endsWith('.html'))
  .sort();

for (const file of pages) {
  test(`${file} — no console errors and no 4xx/5xx`, async ({ page }) => {
    const consoleErrors = [];
    const failedRequests = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('response', resp => {
      if (resp.status() >= 400) failedRequests.push(`${resp.status()} ${resp.url()}`);
    });
    page.on('pageerror', err => consoleErrors.push(`pageerror: ${err.message}`));

    await page.goto(`/preview/${file}`, { waitUntil: 'load' });

    expect(consoleErrors, `console errors on ${file}`).toEqual([]);
    expect(failedRequests, `failed requests on ${file}`).toEqual([]);
  });
}
