// Test harness — loads the built dist/brut.js into the happy-dom test window.
// Components are IIFEs that call Brut.register on a global window.Brut. The
// bundle's auto-init runs once on the (already-fired) DOMContentLoaded, so
// after mounting test markup we call Brut.init(document) ourselves.

import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..', '..');
const bundlePath = resolve(repoRoot, 'dist/brut.js');

let loaded = false;

export function loadBrut() {
  if (loaded) return;
  if (!existsSync(bundlePath)) {
    throw new Error(`dist/brut.js not found at ${bundlePath}. Run \`pnpm build\` before \`pnpm test\`.`);
  }
  const code = readFileSync(bundlePath, 'utf8');
  // The bundle starts with `var Brut = (function() {...})()` and component
  // IIFEs inside reference `Brut.register(...)` as a free variable that
  // expects to resolve to `window.Brut`. With `new Function(code)` that var
  // would become function-local and shadow window.Brut. Indirect eval (0, eval)
  // runs the code in the global scope so `var Brut` lands as a global property
  // — same semantics as a `<script>` tag in the browser.
  (0, eval)(code);
  loaded = true;
}

export function mount(html) {
  document.body.innerHTML = html;
  window.Brut.init(document);
  return document.body.firstElementChild;
}

export function fireKey(el, key) {
  const ev = new window.KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
  el.dispatchEvent(ev);
  return ev;
}

export function captureEvent(el, name) {
  const events = [];
  el.addEventListener(name, (e) => events.push(e));
  return events;
}
