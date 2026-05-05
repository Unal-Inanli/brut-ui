/**
 * @sprtn/mcp smoke tests.
 *
 * Verifies each tool handler works end-to-end against the real manifest at
 * `dist/components.json`. The tests invoke handlers directly (no stdio
 * transport) and pass the loaded manifest explicitly per the existing
 * `(args, manifest)` signature.
 *
 * PREREQUISITE: `pnpm build` must have been run from the repo root so that
 * `dist/components.json` exists. The tests do not regenerate it.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { handler as listComponents } from '../src/tools/list_components.js';
import { handler as getComponent } from '../src/tools/get_component.js';
import { handler as listThemes } from '../src/tools/list_themes.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const manifestPath = resolve(__dirname, '../../../dist/components.json');

let manifest;
beforeAll(() => {
  manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
});

describe('list_components', () => {
  it('returns at least 35 entries with the required shape', async () => {
    const result = await listComponents({}, manifest);
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThanOrEqual(35);
    for (const entry of result) {
      expect(entry).toEqual(
        expect.objectContaining({
          name: expect.any(String),
          kind: expect.any(String),
          class: expect.any(String),
        }),
      );
      expect('description' in entry).toBe(true);
    }
  });

  it('filters to interactive components (>= 35)', async () => {
    const result = await listComponents({ kind: 'interactive' }, manifest);
    expect(result.length).toBeGreaterThanOrEqual(35);
    expect(result.every((c) => c.kind === 'interactive')).toBe(true);
  });

  it('filters to static components (only statics, length > 0)', async () => {
    const result = await listComponents({ kind: 'static' }, manifest);
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((c) => c.kind === 'static')).toBe(true);
  });
});

describe('get_component', () => {
  it('returns a fully populated entry for "switch"', async () => {
    const entry = await getComponent({ name: 'switch' }, manifest);
    expect(entry.kind).toBe('interactive');
    expect(entry.class).toBe('.brut-switch');
    expect(entry.selector).toBe('[data-brut="switch"]');
    expect(typeof entry.description).toBe('string');
    expect(entry.description.length).toBeGreaterThan(0);
    expect(Array.isArray(entry.useCases)).toBe(true);
    expect(entry.useCases.length).toBeGreaterThanOrEqual(1);
    expect(Array.isArray(entry.examples)).toBe(true);
    expect(entry.examples.length).toBeGreaterThanOrEqual(1);
  });

  it('returns a populated entry for "carousel" with at least 3 examples', async () => {
    const entry = await getComponent({ name: 'carousel' }, manifest);
    expect(entry.kind).toBe('interactive');
    expect(entry.class).toBe('.brut-carousel');
    expect(entry.selector).toBe('[data-brut="carousel"]');
    expect(typeof entry.description).toBe('string');
    expect(entry.description.length).toBeGreaterThan(0);
    expect(Array.isArray(entry.useCases)).toBe(true);
    expect(entry.useCases.length).toBeGreaterThanOrEqual(1);
    expect(Array.isArray(entry.examples)).toBe(true);
    expect(entry.examples.length).toBeGreaterThanOrEqual(3);
  });

  it('throws (or surfaces an error) for an unknown component', async () => {
    await expect(
      getComponent({ name: 'nope-not-real' }, manifest),
    ).rejects.toThrow(/Unknown component/i);
  });
});

describe('list_themes', () => {
  it('returns the three default themes', async () => {
    const themes = await listThemes({}, manifest);
    expect(Array.isArray(themes)).toBe(true);
    expect(themes).toEqual(expect.arrayContaining(['brutalist', 'corporate', 'minimal']));
  });
});

describe('round-trip every interactive component', () => {
  it('every interactive entry resolves with a non-empty description', async () => {
    const interactives = (manifest.components ?? []).filter(
      (c) => c.kind === 'interactive',
    );
    expect(interactives.length).toBeGreaterThanOrEqual(35);
    for (const c of interactives) {
      const entry = await getComponent({ name: c.name }, manifest);
      expect(entry, `entry for ${c.name}`).toBeDefined();
      expect(typeof entry.description, `description type for ${c.name}`).toBe(
        'string',
      );
      expect(
        entry.description.length,
        `description length for ${c.name}`,
      ).toBeGreaterThan(0);
    }
  });
});
