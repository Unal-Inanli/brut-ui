import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { resolve, extname, relative } from 'node:path';
import { pathToFileURL } from 'node:url';
import { defineConfig, KNOWN_COMPONENTS } from '../../config/define.js';

function walk(dir, exts, results = []) {
  for (const entry of readdirSync(dir)) {
    if (['node_modules', 'dist', '.git', '.claude'].includes(entry)) continue;
    const full = resolve(dir, entry);
    if (statSync(full).isDirectory()) { walk(full, exts, results); continue; }
    if (exts.includes(extname(full))) results.push(full);
  }
  return results;
}

async function loadConfig() {
  try {
    const configPath = resolve(process.cwd(), 'brut.config.js');
    if (!existsSync(configPath)) return defineConfig({});
    const mod = await import(pathToFileURL(configPath).href);
    return defineConfig(mod.default || mod);
  } catch {
    return defineConfig({});
  }
}

export default async function doctor(args) {
  const root = process.cwd();
  const scanDir = args.find(a => !a.startsWith('-')) || root;
  const cfg = await loadConfig();
  const prefix = cfg.prefix;
  const issues = [];

  const htmlFiles = walk(resolve(root, scanDir), ['.html']);
  const cssFiles = walk(resolve(root, scanDir), ['.css']);

  const knownRoots = new Set(KNOWN_COMPONENTS);
  const cssSelectorRe = new RegExp(`\\.${prefix}-([a-z][a-z0-9-]*)`, 'g');
  const htmlClassRe = new RegExp(`(?:class|className)\\s*=\\s*["'][^"']*?\\b${prefix}-([a-z][a-z0-9-]*)`, 'g');

  for (const file of [...htmlFiles, ...cssFiles]) {
    const content = readFileSync(file, 'utf8');
    const seen = new Set();
    const isHTML = file.endsWith('.html');
    const regexes = isHTML ? [cssSelectorRe, htmlClassRe] : [cssSelectorRe];
    for (const re of regexes) { re.lastIndex = 0; }
    for (const re of regexes) for (const match of content.matchAll(re)) {
      const full = match[1];
      const componentRoot = full.split('--')[0].split('__')[0];
      if (knownRoots.has(componentRoot)) continue;
      const key = `${file}:${componentRoot}`;
      if (seen.has(key)) continue;
      seen.add(key);
      issues.push({
        type: 'UNKNOWN_CLASS',
        file: relative(root, file),
        message: `Unknown component root "${componentRoot}" in .${prefix}-${full}`,
      });
    }
  }

  const hexRe = /#[0-9a-fA-F]{3,8}\b/g;
  for (const file of cssFiles) {
    const rel = relative(root, file);
    if (rel.startsWith('src/tokens') || rel.startsWith('src/themes')) continue;
    const lines = readFileSync(file, 'utf8').split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.trim().startsWith('/*') || line.trim().startsWith('*')) continue;
      if (/^\s*--[a-z]/.test(line)) continue;
      for (const match of line.matchAll(hexRe)) {
        issues.push({
          type: 'HARDCODED_COLOR',
          file: `${rel}:${i + 1}`,
          message: `Hardcoded color ${match[0]} — use a design token`,
        });
      }
    }
  }

  const pxRe = /:\s*(\d+)px/g;
  for (const file of cssFiles) {
    const rel = relative(root, file);
    if (rel.startsWith('src/tokens') || rel.startsWith('src/themes')) continue;
    const lines = readFileSync(file, 'utf8').split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.trim().startsWith('/*') || line.trim().startsWith('*')) continue;
      if (/^\s*--[a-z]/.test(line)) continue;
      for (const match of line.matchAll(pxRe)) {
        if (['0', '1', '2'].includes(match[1])) continue;
        issues.push({
          type: 'HARDCODED_PX',
          file: `${rel}:${i + 1}`,
          message: `Hardcoded ${match[1]}px — use a spacing/size token`,
        });
      }
    }
  }

  const dataPrefixRe = new RegExp(`data-${prefix}=`);
  const scriptJsRe = new RegExp(`<script[^>]+${prefix}(\\.min)?\\.js`);
  const scriptEsmRe = new RegExp(`<script[^>]+${prefix}\\.esm\\.js`);
  for (const file of htmlFiles) {
    const content = readFileSync(file, 'utf8');
    if (dataPrefixRe.test(content)) {
      const hasJS = scriptJsRe.test(content) || scriptEsmRe.test(content);
      if (!hasJS) {
        issues.push({
          type: 'MISSING_JS',
          file: relative(root, file),
          message: `Uses data-${prefix} attributes but does not include ${prefix}.js`,
        });
      }
    }
  }

  if (!issues.length) {
    console.log('No issues found.');
    return;
  }

  const grouped = {};
  for (const issue of issues) {
    grouped[issue.type] = grouped[issue.type] || [];
    grouped[issue.type].push(issue);
  }

  for (const [type, items] of Object.entries(grouped)) {
    console.log(`\n${type} (${items.length}):`);
    for (const item of items.slice(0, 20)) {
      console.log(`  ${item.file} — ${item.message}`);
    }
    if (items.length > 20) console.log(`  ... and ${items.length - 20} more`);
  }

  console.log(`\n${issues.length} issue(s) found.`);
  process.exit(1);
}
