// Snapshots the SHAPE of dist/components.json — the keys present on each
// component entry, plus the global counts. Catches accidental schema
// changes (a field renamed, a new top-level key added, an entry dropped)
// without snapshotting the full content (which would churn on every
// description tweak).
//
// To intentionally accept a schema change, run: pnpm test -- -u

import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const manifestPath = resolve(__dirname, '..', '..', 'dist', 'components.json');

describe('dist/components.json schema snapshot', () => {
  it('manifest exists', () => {
    expect(existsSync(manifestPath)).toBe(true);
  });

  it('top-level keys are stable', () => {
    const m = JSON.parse(readFileSync(manifestPath, 'utf8'));
    expect(Object.keys(m).sort()).toMatchSnapshot();
  });

  it('component entry shape is stable per kind', () => {
    const m = JSON.parse(readFileSync(manifestPath, 'utf8'));
    const shape = { interactive: new Set(), static: new Set() };
    for (const c of m.components) {
      const kind = c.kind === 'interactive' ? 'interactive' : 'static';
      Object.keys(c).forEach(k => shape[kind].add(k));
    }
    expect({
      interactive: Array.from(shape.interactive).sort(),
      static: Array.from(shape.static).sort(),
    }).toMatchSnapshot();
  });

  it('component counts are stable (interactive vs static)', () => {
    const m = JSON.parse(readFileSync(manifestPath, 'utf8'));
    const counts = {
      interactive: m.components.filter(c => c.kind === 'interactive').length,
      static: m.components.filter(c => c.kind !== 'interactive').length,
    };
    expect(counts).toMatchSnapshot();
  });
});
