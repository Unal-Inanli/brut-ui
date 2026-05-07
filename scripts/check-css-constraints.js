#!/usr/bin/env node
// Static lint for src/components.css covering the BRUT visual constraints
// that `brut doctor` does not catch:
//   - no raw rgba() in components (tokens own --scrim-bg/--scrim-bg-soft)
//   - no linear-gradient/radial-gradient unless explicitly sanctioned
//   - no transition durations greater than 140ms
//   - no border-radius pixel values greater than 12px outside --radius-pill
//
// Exits 0 when clean, 1 with a finding list otherwise. Zero deps.

import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..');
const cssPath = resolve(repoRoot, 'src/components.css');
const primitivesPath = resolve(repoRoot, 'src/tokens/01-primitives.css');

if (!existsSync(cssPath)) {
  console.error(`Not found: ${cssPath}`);
  process.exit(1);
}

const lines = readFileSync(cssPath, 'utf8').split('\n');

const durationTokens = new Map();
if (existsSync(primitivesPath)) {
  const tokenRe = /^\s*(--[a-z0-9-]+):\s*([0-9.]+)(ms|s)\s*;/i;
  for (const line of readFileSync(primitivesPath, 'utf8').split('\n')) {
    const m = line.match(tokenRe);
    if (m) {
      const ms = m[3].toLowerCase() === 's' ? Number(m[2]) * 1000 : Number(m[2]);
      durationTokens.set(m[1], ms);
    }
  }
}

const findings = [];
const add = (line, kind, message) => findings.push({ line, kind, message });

// Accepts either "Sanctioned exception" (canonical, e.g. line 1398) or
// "sanctioned use of" (the scrim block at line 2630). The window is joined
// before matching so phrases that wrap onto a second comment line still count.
const sanctionedNear = (idx) => {
  const start = Math.max(0, idx - 6);
  const window = lines.slice(start, idx).join(' ');
  return /sanctioned\s+(exception|use\s+of)/i.test(window);
};

const TRANSITION_CAP_MS = 140;

const parseDurations = (value) => {
  const out = [];
  for (const raw of value.matchAll(/([0-9.]+)(ms|s)\b/gi)) {
    const ms = raw[2].toLowerCase() === 's' ? Number(raw[1]) * 1000 : Number(raw[1]);
    out.push({ ms, text: raw[0] });
  }
  for (const ref of value.matchAll(/var\((--[a-z0-9-]+)/gi)) {
    if (durationTokens.has(ref[1])) {
      out.push({ ms: durationTokens.get(ref[1]), text: `var(${ref[1]})` });
    }
  }
  return out;
};

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const lineNo = i + 1;

  // 1. raw rgba — never in components.css
  if (/\brgba\s*\(/i.test(line)) {
    add(lineNo, 'RAW_RGBA', `raw rgba() — use --scrim-bg / --scrim-bg-soft tokens instead`);
  }

  // 2. gradients — require a Sanctioned exception comment within 5 lines above
  if (/\b(linear|radial|conic|repeating-linear|repeating-radial)-gradient\s*\(/i.test(line)) {
    if (!sanctionedNear(i)) {
      add(lineNo, 'GRADIENT', `gradient without "Sanctioned exception" comment within 5 lines above`);
    }
  }

  // 3. transition durations > 140ms (skip if declaration has a sanctioned comment)
  const transitionMatch = line.match(/(?:^|\s)(transition(?:-duration)?)\s*:\s*([^;]*)/i);
  if (transitionMatch && !sanctionedNear(i)) {
    let value = transitionMatch[2];
    // multi-line transitions: greedily collect continuation lines until ;
    let j = i;
    while (j + 1 < lines.length && !/;/.test(value)) {
      j += 1;
      value += ' ' + lines[j];
    }
    for (const dur of parseDurations(value)) {
      if (dur.ms > TRANSITION_CAP_MS) {
        add(lineNo, 'SLOW_TRANSITION', `transition duration ${dur.text} (${dur.ms}ms) exceeds 140ms cap`);
      }
    }
  }

  // 4. border-radius pixel values > 12px outside --radius-pill
  const radiusMatch = line.match(/(?:^|\s)border-radius\s*:\s*([^;]+);?/i);
  if (radiusMatch) {
    const value = radiusMatch[1];
    if (!/var\(--radius-pill/.test(value)) {
      for (const px of value.matchAll(/([0-9.]+)px\b/g)) {
        if (Number(px[1]) > 12) {
          add(lineNo, 'LARGE_RADIUS', `border-radius ${px[0]} exceeds 12px (use --radius-pill for pill shapes)`);
        }
      }
    }
  }
}

console.log(`CSS constraint check: ${cssPath}`);
if (findings.length === 0) {
  console.log(`PASS — 0 findings.`);
  process.exit(0);
}

for (const f of findings) {
  console.log(`src/components.css:${f.line} — ${f.kind} — ${f.message}`);
}
console.log(`FAIL — ${findings.length} finding(s).`);
process.exit(1);
