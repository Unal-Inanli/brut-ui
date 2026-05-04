#!/usr/bin/env node
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const { run } = await import(resolve(__dirname, '..', 'src', 'cli', 'index.js'));
run(process.argv.slice(2));
