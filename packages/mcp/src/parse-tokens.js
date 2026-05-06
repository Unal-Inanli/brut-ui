import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

export const TOKEN_LAYERS = [
  { file: '01-primitives.css', layer: 'primitives', description: 'Raw hex colors, px values, font stacks, motion values.' },
  { file: '02-semantic.css',   layer: 'semantic',   description: 'Role-based aliases referencing primitives. The layer themes override.' },
  { file: '03-intent.css',     layer: 'intent',     description: 'Component-specific sizing and layout. No hex values.' },
];

const SECTION_RE = /^\s*\/\*\s*-{5,}\s*(.+?)\s*-{5,}\s*\*\//;
const TOKEN_RE = /^(\s*)(--[\w-]+):\s*(.+?)\s*;\s*(?:\/\*\s*(.*?)\s*\*\/)?\s*$/;

export function parseTokenFile(css) {
  const lines = css.split('\n');
  const tokens = [];
  let category = 'UNCATEGORIZED';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const sectionMatch = line.match(SECTION_RE);
    if (sectionMatch) {
      category = sectionMatch[1].trim();
      continue;
    }
    const tokenMatch = line.match(TOKEN_RE);
    if (tokenMatch) {
      tokens.push({
        name: tokenMatch[2],
        value: tokenMatch[3],
        comment: tokenMatch[4] ?? null,
        category,
        line: i + 1,
      });
    }
  }
  return tokens;
}

export function serializeTokenUpdate(css, tokenName, newValue) {
  const lines = css.split('\n');
  const escaped = tokenName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`^(\\s*${escaped}:\\s*)(.+?)(\\s*;\\s*(?:\\/\\*.+?\\*\\/)?\\s*)$`);

  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(re);
    if (m) {
      lines[i] = m[1] + newValue + m[3];
      return lines.join('\n');
    }
  }
  throw new Error(`Token not found: ${tokenName}`);
}

export function serializeTokenInsert(css, tokenName, value, category, comment) {
  const lines = css.split('\n');
  let insertIdx = -1;
  let inCategory = false;

  for (let i = 0; i < lines.length; i++) {
    const sectionMatch = lines[i].match(SECTION_RE);
    if (sectionMatch) {
      if (inCategory) break;
      if (sectionMatch[1].trim().toUpperCase() === category.toUpperCase()) {
        inCategory = true;
      }
      continue;
    }
    if (inCategory && TOKEN_RE.test(lines[i])) {
      insertIdx = i;
    }
  }

  if (!inCategory) {
    const available = [];
    for (const line of lines) {
      const m = line.match(SECTION_RE);
      if (m) available.push(m[1].trim());
    }
    throw new Error(`Category "${category}" not found. Available: ${available.join(', ')}`);
  }

  let newLine = `  ${tokenName}: ${value};`;
  if (comment) newLine += `  /* ${comment} */`;

  if (insertIdx === -1) {
    for (let i = 0; i < lines.length; i++) {
      const m = lines[i].match(SECTION_RE);
      if (m && m[1].trim().toUpperCase() === category.toUpperCase()) {
        insertIdx = i;
        break;
      }
    }
  }

  lines.splice(insertIdx + 1, 0, newLine);
  return lines.join('\n');
}

export function tokenFilePath(root, layerFile) {
  return resolve(root, 'src/tokens', layerFile);
}

export async function readTokenLayer(root, layerFile) {
  const path = tokenFilePath(root, layerFile);
  return readFile(path, 'utf8');
}

export async function writeTokenLayer(root, layerFile, content) {
  const path = tokenFilePath(root, layerFile);
  return writeFile(path, content, 'utf8');
}
