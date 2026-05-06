#!/usr/bin/env node
// Run by the `prepare` lifecycle hook after `pnpm install`.
// Prints a one-line reminder for first-time contributors. No-ops in CI
// and after the first successful bootstrap (when dist/components.json exists).

import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..');

if (process.env.CI) process.exit(0);
if (existsSync(resolve(repoRoot, 'dist', 'components.json'))) process.exit(0);

console.log('\nFirst-time setup: run `pnpm bootstrap` to build, validate, and prime the MCP server.\n');
