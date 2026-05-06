#!/usr/bin/env node
// One-command contributor onboarding: builds dist/, runs doctor, primes the MCP server.
// Run via `pnpm bootstrap` after `pnpm install`.

import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..');

const REQUIRED_NODE_MAJOR = 20;

function fail(message) {
  console.error(`\nbootstrap: ${message}`);
  process.exit(1);
}

function step(label) {
  console.log(`\n→ ${label}`);
}

// 1. Node version check.
const nodeMajor = Number(process.versions.node.split('.')[0]);
if (Number.isNaN(nodeMajor) || nodeMajor < REQUIRED_NODE_MAJOR) {
  fail(
    `Node ${REQUIRED_NODE_MAJOR}+ required, you have ${process.versions.node}.\n` +
      `        .nvmrc is set — run \`nvm use\` if you have nvm, or upgrade Node.`,
  );
}

// 2. .mcp.json sanity check.
if (!existsSync(resolve(repoRoot, '.mcp.json'))) {
  fail(
    `.mcp.json is missing from the repo root.\n` +
      `        It should be committed — restore it with \`git checkout HEAD -- .mcp.json\`.`,
  );
}

// 3. pnpm build.
step('Building dist/ (vite build)');
const build = spawnSync('pnpm', ['build'], {
  cwd: repoRoot,
  stdio: 'inherit',
  shell: process.platform === 'win32',
});
if (build.status !== 0) {
  if (build.error && build.error.code === 'ENOENT') {
    fail(
      `pnpm not found on PATH.\n` +
        `        If Corepack is enabled (Node 20+ ships it), run \`corepack enable\`.\n` +
        `        Otherwise install pnpm: https://pnpm.io/installation`,
    );
  }
  fail(`pnpm build failed (exit ${build.status}). See output above.`);
}

// 4. brut doctor — informational. The push gate is `npx brut doctor` per
// CONTRIBUTING.md "Verify before you push"; bootstrap just surfaces state.
step('Running brut doctor (informational)');
const doctor = spawnSync('node', ['bin/brut.js', 'doctor'], {
  cwd: repoRoot,
  stdio: 'inherit',
});
const doctorClean = doctor.status === 0;

// 5. Success block.
console.log(
  [
    '',
    'Done. Bootstrap complete.',
    '',
    doctorClean
      ? 'Doctor: clean.'
      : 'Doctor flagged issues above — review them, but they may be pre-existing\n' +
        '(see ARCHITECTURE.md and the M1 milestone in CLAUDE.md). The push gate is\n' +
        '`npx brut doctor` passing, not bootstrap.',
    '',
    'Next steps:',
    '  • Restart Claude Code so it picks up .mcp.json (the brut MCP server)',
    '  • Run `pnpm dev` to start the dev server with HMR',
    '  • Open preview/components-*.html in your browser',
    '',
    'See CONTRIBUTING.md "The four surfaces" before editing components.',
    '',
  ].join('\n'),
);
