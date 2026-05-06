/**
 * @sprtn/mcp smoke tests.
 *
 * Verifies each tool handler works end-to-end against the real manifest at
 * `dist/components.json`. The tests invoke handlers directly (no stdio
 * transport) and pass the context object { manifest, root } per the handler
 * signature.
 *
 * PREREQUISITE: `pnpm build` must have been run from the repo root so that
 * `dist/components.json` exists. The tests do not regenerate it.
 */
import { describe, it, expect, beforeAll, beforeEach, afterEach } from 'vitest';
import { readFileSync, mkdirSync, writeFileSync, cpSync, rmSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

import { handler as listComponents } from '../src/tools/list_components.js';
import { handler as getComponent } from '../src/tools/get_component.js';
import { handler as listThemes } from '../src/tools/list_themes.js';
import { handler as listTokens } from '../src/tools/list_tokens.js';
import { handler as updateToken } from '../src/tools/update_token.js';
import { handler as addToken } from '../src/tools/add_token.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '../../..');
const manifestPath = resolve(root, 'dist/components.json');

let context;
beforeAll(() => {
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  context = { manifest, root };
});

describe('list_components', () => {
  it('returns at least 35 entries with the required shape', async () => {
    const result = await listComponents({}, context);
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
    const result = await listComponents({ kind: 'interactive' }, context);
    expect(result.length).toBeGreaterThanOrEqual(35);
    expect(result.every((c) => c.kind === 'interactive')).toBe(true);
  });

  it('filters to static components (only statics, length > 0)', async () => {
    const result = await listComponents({ kind: 'static' }, context);
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((c) => c.kind === 'static')).toBe(true);
  });
});

describe('get_component', () => {
  it('returns a fully populated entry for "switch"', async () => {
    const entry = await getComponent({ name: 'switch' }, context);
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
    const entry = await getComponent({ name: 'carousel' }, context);
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
      getComponent({ name: 'nope-not-real' }, context),
    ).rejects.toThrow(/Unknown component/i);
  });
});

describe('list_themes', () => {
  it('returns the three default themes', async () => {
    const themes = await listThemes({}, context);
    expect(Array.isArray(themes)).toBe(true);
    expect(themes).toEqual(expect.arrayContaining(['brutalist', 'corporate', 'minimal']));
  });
});

describe('round-trip every interactive component', () => {
  it('every interactive entry resolves with a non-empty description', async () => {
    const interactives = (context.manifest.components ?? []).filter(
      (c) => c.kind === 'interactive',
    );
    expect(interactives.length).toBeGreaterThanOrEqual(35);
    for (const c of interactives) {
      const entry = await getComponent({ name: c.name }, context);
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

// ---------------------------------------------------------------------------
// Token tools — list_tokens reads from real source; update/add use temp copies
// ---------------------------------------------------------------------------

describe('list_tokens', () => {
  it('returns all 3 layers when no filter is specified', async () => {
    const result = await listTokens({}, context);
    expect(result.layers).toHaveLength(3);
    expect(result.layers.map((l) => l.layer)).toEqual(['primitives', 'semantic', 'intent']);
  });

  it('filters to a single layer', async () => {
    const result = await listTokens({ layer: 'primitives' }, context);
    expect(result.layers).toHaveLength(1);
    expect(result.layers[0].layer).toBe('primitives');
    expect(result.layers[0].categories.length).toBeGreaterThan(0);
  });

  it('filters by category', async () => {
    const result = await listTokens({ layer: 'primitives', category: 'COLOR' }, context);
    const layer = result.layers[0];
    for (const cat of layer.categories) {
      expect(cat.name.toLowerCase()).toContain('color');
    }
  });

  it('each token has name, value, and comment fields', async () => {
    const result = await listTokens({ layer: 'primitives', category: 'COLOR' }, context);
    const tokens = result.layers[0].categories[0].tokens;
    expect(tokens.length).toBeGreaterThan(0);
    for (const t of tokens) {
      expect(t).toHaveProperty('name');
      expect(t).toHaveProperty('value');
      expect(t).toHaveProperty('comment');
      expect(t.name).toMatch(/^--/);
    }
  });
});

describe('update_token', () => {
  let tmpRoot;

  beforeEach(() => {
    tmpRoot = resolve(tmpdir(), `brut-test-${Date.now()}`);
    const tmpTokens = resolve(tmpRoot, 'src/tokens');
    mkdirSync(tmpTokens, { recursive: true });
    cpSync(resolve(root, 'src/tokens/01-primitives.css'), resolve(tmpTokens, '01-primitives.css'));
    cpSync(resolve(root, 'src/tokens/02-semantic.css'), resolve(tmpTokens, '02-semantic.css'));
    cpSync(resolve(root, 'src/tokens/03-intent.css'), resolve(tmpTokens, '03-intent.css'));
  });

  afterEach(() => {
    rmSync(tmpRoot, { recursive: true, force: true });
  });

  it('updates --primary and returns old/new values', async () => {
    const tmpCtx = { manifest: context.manifest, root: tmpRoot };
    const result = await updateToken({ token: '--primary', value: '#FF0000' }, tmpCtx);
    expect(result.oldValue).toBe('#FFD23F');
    expect(result.newValue).toBe('#FF0000');
    expect(result.layer).toBe('primitives');
    expect(result.category).toBe('COLOR');

    const updated = readFileSync(resolve(tmpRoot, 'src/tokens/01-primitives.css'), 'utf8');
    expect(updated).toContain('--primary:');
    expect(updated).toContain('#FF0000');
    expect(updated).not.toContain('#FFD23F;');
  });

  it('preserves inline comments after update', async () => {
    const tmpCtx = { manifest: context.manifest, root: tmpRoot };
    await updateToken({ token: '--ink', value: '#111111' }, tmpCtx);
    const updated = readFileSync(resolve(tmpRoot, 'src/tokens/01-primitives.css'), 'utf8');
    expect(updated).toContain('#111111');
    expect(updated).toContain('/* every border');
  });

  it('throws for a nonexistent token', async () => {
    const tmpCtx = { manifest: context.manifest, root: tmpRoot };
    await expect(
      updateToken({ token: '--nope-fake', value: 'red' }, tmpCtx),
    ).rejects.toThrow(/Unknown token/i);
  });

  it('throws for an invalid token name', async () => {
    const tmpCtx = { manifest: context.manifest, root: tmpRoot };
    await expect(
      updateToken({ token: 'no-dashes', value: 'red' }, tmpCtx),
    ).rejects.toThrow(/Invalid token name/i);
  });
});

describe('add_token', () => {
  let tmpRoot;

  beforeEach(() => {
    tmpRoot = resolve(tmpdir(), `brut-test-${Date.now()}`);
    const tmpTokens = resolve(tmpRoot, 'src/tokens');
    mkdirSync(tmpTokens, { recursive: true });
    cpSync(resolve(root, 'src/tokens/01-primitives.css'), resolve(tmpTokens, '01-primitives.css'));
    cpSync(resolve(root, 'src/tokens/02-semantic.css'), resolve(tmpTokens, '02-semantic.css'));
    cpSync(resolve(root, 'src/tokens/03-intent.css'), resolve(tmpTokens, '03-intent.css'));
  });

  afterEach(() => {
    rmSync(tmpRoot, { recursive: true, force: true });
  });

  it('adds a new token to the COLOR category', async () => {
    const tmpCtx = { manifest: context.manifest, root: tmpRoot };
    const result = await addToken(
      { token: '--pop-teal', value: '#2EE0C8', layer: 'primitives', category: 'COLOR', comment: 'teal pop accent' },
      tmpCtx,
    );
    expect(result.token).toBe('--pop-teal');
    expect(result.layer).toBe('primitives');

    const updated = readFileSync(resolve(tmpRoot, 'src/tokens/01-primitives.css'), 'utf8');
    expect(updated).toContain('--pop-teal: #2EE0C8;');
    expect(updated).toContain('/* teal pop accent */');
  });

  it('throws when adding a duplicate token', async () => {
    const tmpCtx = { manifest: context.manifest, root: tmpRoot };
    await expect(
      addToken({ token: '--primary', value: '#000', layer: 'primitives', category: 'COLOR' }, tmpCtx),
    ).rejects.toThrow(/already exists/i);
  });

  it('throws when category is missing', async () => {
    const tmpCtx = { manifest: context.manifest, root: tmpRoot };
    await expect(
      addToken({ token: '--new-token', value: '#000', layer: 'primitives' }, tmpCtx),
    ).rejects.toThrow(/category/i);
  });
});
