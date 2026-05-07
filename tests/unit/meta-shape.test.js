// Validates that every src/js/components/<name>.meta.js file has the shape
// the build pipeline (`validateMetaEntry` in src/config/vite-plugin.js) and
// the post-build manifest gate (scripts/check-manifest.js) expect.
//
// Catches drift the moment a component author forgets a field, without
// needing a full build first.

import { describe, it, expect } from 'vitest';
import { readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const componentsDir = resolve(__dirname, '..', '..', 'src', 'js', 'components');

const metaFiles = readdirSync(componentsDir)
  .filter(f => f.endsWith('.meta.js'))
  .sort();

const isNonEmptyString = v => typeof v === 'string' && v.length > 0;

describe('component meta sidecars', () => {
  it('each interactive component has at least one meta sidecar', () => {
    expect(metaFiles.length).toBeGreaterThan(0);
  });

  describe.each(metaFiles)('%s', (file) => {
    const componentName = file.replace(/\.meta\.js$/, '');
    let meta;

    it('loads as an ESM module with a default export', async () => {
      const mod = await import(resolve(componentsDir, file));
      meta = mod.default;
      expect(meta).toBeTruthy();
      expect(typeof meta).toBe('object');
    });

    it('has the required field shape', async () => {
      const mod = await import(resolve(componentsDir, file));
      meta = mod.default;

      expect(isNonEmptyString(meta.name)).toBe(true);
      expect(meta.name).toBe(componentName);

      expect(isNonEmptyString(meta.description)).toBe(true);

      expect(Array.isArray(meta.useCases)).toBe(true);
      expect(meta.useCases.length).toBeGreaterThan(0);
      expect(meta.useCases.every(isNonEmptyString)).toBe(true);

      expect(meta.kind).toBe('interactive');

      expect(isNonEmptyString(meta.class)).toBe(true);
      expect(meta.class.startsWith('.brut-')).toBe(true);

      expect(Array.isArray(meta.examples)).toBe(true);
      expect(meta.examples.length).toBeGreaterThan(0);
      for (const ex of meta.examples) {
        expect(isNonEmptyString(ex.title)).toBe(true);
        expect(isNonEmptyString(ex.html)).toBe(true);
        expect(ex.html.startsWith('<')).toBe(true);
      }
    });

    it('declares a sane formState when present', async () => {
      const mod = await import(resolve(componentsDir, file));
      meta = mod.default;
      if ('formState' in meta) {
        expect(typeof meta.formState).toBe('object');
        expect(typeof meta.formState.hiddenInput).toBe('boolean');
      }
    });
  });
});
