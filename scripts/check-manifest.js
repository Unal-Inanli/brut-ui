#!/usr/bin/env node
// Deterministic gate: assert dist/components.json contains complete metadata
// for every interactive component listed in src/config/define.js.
// Exit 0 on PASS, 1 on FAIL (or missing/unparseable manifest).

import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { INTERACTIVE_COMPONENTS } from '../src/config/define.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..');
const manifestPath = resolve(repoRoot, 'dist/components.json');

if (!existsSync(manifestPath)) {
  console.error(`Manifest not found at ${manifestPath}. Run pnpm build first.`);
  process.exit(1);
}

let manifest;
try {
  manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
} catch (err) {
  console.error(`Failed to parse ${manifestPath}: ${err.message}. Run pnpm build first.`);
  process.exit(1);
}

if (!manifest || !Array.isArray(manifest.components)) {
  console.error(`Manifest at ${manifestPath} has no components array. Run pnpm build first.`);
  process.exit(1);
}

const prefix = typeof manifest.prefix === 'string' && manifest.prefix.length > 0 ? manifest.prefix : 'brut';
const byName = new Map();
for (const entry of manifest.components) {
  if (entry && typeof entry.name === 'string') byName.set(entry.name, entry);
}

const failures = [];
const fail = (component, field, reason) => {
  failures.push({ component, field, reason });
};

const isNonEmptyString = v => typeof v === 'string' && v.length > 0;

function validateInteractive(name, entry) {
  if (!entry) {
    fail(name, '(entry)', 'not present in manifest.components');
    return;
  }

  // name
  if (!isNonEmptyString(entry.name)) {
    fail(name, 'name', 'missing or not a non-empty string');
  } else if (entry.name !== name) {
    fail(name, 'name', `value "${entry.name}" does not match lookup name`);
  }

  // description
  if (!isNonEmptyString(entry.description)) {
    fail(name, 'description', 'missing or not a non-empty string');
  }

  // useCases
  if (!Array.isArray(entry.useCases) || entry.useCases.length < 1) {
    fail(name, 'useCases', 'must be an array with at least 1 entry');
  } else if (!entry.useCases.every(isNonEmptyString)) {
    fail(name, 'useCases', 'all entries must be non-empty strings');
  }

  // kind
  if (entry.kind !== 'interactive') {
    fail(name, 'kind', `expected "interactive", got ${JSON.stringify(entry.kind)}`);
  }

  // class
  const expectedClassRoot = `.${prefix}-`;
  if (!isNonEmptyString(entry.class)) {
    fail(name, 'class', 'missing or not a non-empty string');
  } else if (!entry.class.startsWith(expectedClassRoot)) {
    fail(name, 'class', `expected to start with "${expectedClassRoot}", got "${entry.class}"`);
  }

  // selector
  const expectedSelector = `[data-${prefix}="${name}"]`;
  if (!isNonEmptyString(entry.selector)) {
    fail(name, 'selector', 'missing or not a non-empty string');
  } else if (entry.selector !== expectedSelector) {
    fail(name, 'selector', `expected "${expectedSelector}", got "${entry.selector}"`);
  }

  // modifiers
  if (!Array.isArray(entry.modifiers)) {
    fail(name, 'modifiers', 'must be an array (may be empty)');
  }

  // dataAttributes
  if (!Array.isArray(entry.dataAttributes)) {
    fail(name, 'dataAttributes', 'must be an array (may be empty)');
  } else {
    entry.dataAttributes.forEach((da, i) => {
      if (!da || typeof da !== 'object') {
        fail(name, `dataAttributes[${i}]`, 'must be an object');
        return;
      }
      if (!isNonEmptyString(da.name)) fail(name, `dataAttributes[${i}].name`, 'missing or not a non-empty string');
      if (!('values' in da)) fail(name, `dataAttributes[${i}].values`, 'missing');
      if (!('description' in da)) fail(name, `dataAttributes[${i}].description`, 'missing');
    });
  }

  // events
  if (!Array.isArray(entry.events)) {
    fail(name, 'events', 'must be an array (may be empty)');
  }

  // formState
  if (!entry.formState || typeof entry.formState !== 'object' || Array.isArray(entry.formState)) {
    fail(name, 'formState', 'must be an object with at least { hiddenInput: bool }');
  } else if (typeof entry.formState.hiddenInput !== 'boolean') {
    fail(name, 'formState.hiddenInput', 'must be a boolean');
  }

  // a11y
  if (!entry.a11y || typeof entry.a11y !== 'object' || Array.isArray(entry.a11y)) {
    fail(name, 'a11y', 'must be an object with at least { keyboard: array }');
  } else if (!Array.isArray(entry.a11y.keyboard)) {
    fail(name, 'a11y.keyboard', 'must be an array');
  }

  // examples
  if (!Array.isArray(entry.examples) || entry.examples.length < 1) {
    fail(name, 'examples', 'must be an array with at least 1 entry');
  } else {
    entry.examples.forEach((ex, i) => {
      if (!ex || typeof ex !== 'object') {
        fail(name, `examples[${i}]`, 'must be an object');
        return;
      }
      if (!isNonEmptyString(ex.title)) {
        fail(name, `examples[${i}].title`, 'missing or not a non-empty string');
      }
      if (!isNonEmptyString(ex.html)) {
        fail(name, `examples[${i}].html`, 'missing or not a non-empty string');
      } else if (!ex.html.startsWith('<')) {
        fail(name, `examples[${i}].html`, 'must start with "<"');
      }
    });
  }
}

for (const name of INTERACTIVE_COMPONENTS) {
  validateInteractive(name, byName.get(name));
}

const interactiveCount = INTERACTIVE_COMPONENTS.length;
const staticCount = manifest.components.filter(c => c && c.kind !== 'interactive').length;
const failedComponents = new Set(failures.map(f => f.component));

console.log(`Manifest: ${manifestPath}`);
console.log(`Static components (informational): ${staticCount}`);

if (failures.length === 0) {
  console.log(`Manifest check: PASS — ${interactiveCount} interactive components, all complete.`);
  process.exit(0);
}

for (const f of failures) {
  console.log(`${f.component}: ${f.field} — ${f.reason}`);
}
console.log(`Manifest check: FAIL — ${failures.length} failures across ${failedComponents.size} components.`);
process.exit(1);
