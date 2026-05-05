// Doctor: validates a brut workspace.
// Failure-level checks (exit 1): UNKNOWN_CLASS, HARDCODED_COLOR, HARDCODED_PX, MISSING_JS.
// Warning-level checks (exit 0): MISSING_META — interactive component lacks a sidecar .meta.js.
// Informational checks (exit 0): META_DRIFT — meta declares modifiers/events/selector that
//                                drift from the runtime JS or components.css.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { resolve, extname, relative } from 'node:path';
import { pathToFileURL } from 'node:url';
import { defineConfig, KNOWN_COMPONENTS, INTERACTIVE_COMPONENTS } from '../../config/define.js';

const WARNING_TYPES = new Set(['MISSING_META']);
const INFO_TYPES = new Set(['META_DRIFT', 'CLASS_ROOT_EXCEPTION', 'EXAMPLE_DRIFT']);

// Components whose CSS class root intentionally diverges from the
// `.brut-<name>` convention. Each entry must declare the exact class
// string and a reason; doctor emits CLASS_ROOT_EXCEPTION (info) for
// these and CLASS_ROOT_DRIFT (failure) for any other divergence.
const KNOWN_CLASS_ROOT_EXCEPTIONS = {
  'counter':       { class: '.brut-field__counter',     reason: 'Sub-element of .brut-field (BEM); see ARCHITECTURE.md D4' },
  'table-columns': { class: '.brut-table-columns-btn',  reason: 'Trigger button is the labeled element; see ARCHITECTURE.md D4' },
  'tooltip':       { class: '.brut-tip',                reason: 'Pre-convention naming; see ARCHITECTURE.md D4' },
};

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

  // MISSING_META + META_DRIFT — only meaningful inside a brut workspace
  // (the one with src/js/components/). Skip silently when run elsewhere
  // so consumers running `npx brut doctor` don't get noise about brut's
  // own components.
  const componentsDir = resolve(root, 'src/js/components');
  if (existsSync(componentsDir)) {
    const componentsCssPath = resolve(root, 'src/components.css');
    const componentsCss = existsSync(componentsCssPath)
      ? readFileSync(componentsCssPath, 'utf8')
      : '';

    for (const name of INTERACTIVE_COMPONENTS) {
      const metaPath = resolve(componentsDir, `${name}.meta.js`);
      const jsPath = resolve(componentsDir, `${name}.js`);
      const metaRel = `src/js/components/${name}.meta.js`;

      if (!existsSync(metaPath)) {
        issues.push({
          type: 'MISSING_META',
          file: metaRel,
          message: `Interactive component ${name} has no sidecar .meta.js (M7 deliverable)`,
        });
        continue;
      }

      let entry;
      try {
        const mod = await import(pathToFileURL(metaPath).href);
        entry = mod.default;
      } catch {
        continue; // import errors are flagged elsewhere; don't double-report
      }
      if (!entry || typeof entry !== 'object') continue;

      // Drift check 1: modifiers declared in meta but missing from components.css
      if (Array.isArray(entry.modifiers)) {
        for (const modRaw of entry.modifiers) {
          const mod = typeof modRaw === 'string'
            ? modRaw
            : (modRaw && typeof modRaw === 'object' ? modRaw.name : null);
          if (!mod || typeof mod !== 'string') continue;
          if (!mod.startsWith('--')) continue; // skip BEM elements / non-modifier entries
          const selector = `.${prefix}-${name}${mod}`;
          if (!componentsCss.includes(selector)) {
            issues.push({
              type: 'META_DRIFT',
              file: metaRel,
              message: `Modifier "${mod}" declared in meta but no "${selector}" rule in components.css`,
            });
          }
        }
      }

      // Drift check 2: events declared in meta but never dispatched in JS
      if (Array.isArray(entry.events) && existsSync(jsPath)) {
        const jsSrc = readFileSync(jsPath, 'utf8');
        for (const ev of entry.events) {
          const evName = ev && typeof ev === 'object' ? ev.name : null;
          if (!evName || typeof evName !== 'string') continue;
          if (!jsSrc.includes(`'${evName}'`) && !jsSrc.includes(`"${evName}"`) && !jsSrc.includes(`\`${evName}\``)) {
            issues.push({
              type: 'META_DRIFT',
              file: metaRel,
              message: `Event "${evName}" declared in meta but not dispatched in ${name}.js`,
            });
          }
        }
      }

      // Drift check 3: interactive components must use the data-<prefix> hook
      const expectedSelector = `[data-${prefix}="${name}"]`;
      if (typeof entry.selector === 'string' && entry.selector !== expectedSelector) {
        issues.push({
          type: 'META_DRIFT',
          file: metaRel,
          message: `Selector "${entry.selector}" should be "${expectedSelector}" for interactive components`,
        });
      }
    }

    // INVARIANT_DRIFT: every interactive component must also be in KNOWN_COMPONENTS.
    // Pre-M7 a real bug of this kind (combobox/table-columns/table-filter) went
    // undetected — never let it recur silently.
    const knownSet = new Set(KNOWN_COMPONENTS);
    for (const name of INTERACTIVE_COMPONENTS) {
      if (!knownSet.has(name)) {
        issues.push({
          type: 'INVARIANT_DRIFT',
          file: 'src/config/define.js',
          message: `${name} is interactive but missing from KNOWN_COMPONENTS`,
        });
      }
    }

    // CLASS_ROOT_DRIFT / CLASS_ROOT_EXCEPTION: enforce class root === .brut-<name>
    // (with allowlist for grandfathered exceptions). EXAMPLE_DRIFT: every brut-*
    // class in an example's HTML must have a matching rule in components.css, and
    // every data-brut hook must equal the entry's name.
    const knownClassRoots = new Set();
    {
      const re = new RegExp(`\\.${prefix}-([a-z][a-z0-9_-]*)`, 'g');
      for (const m of componentsCss.matchAll(re)) knownClassRoots.add(m[1]);
    }
    for (const name of INTERACTIVE_COMPONENTS) {
      const metaPath = resolve(componentsDir, `${name}.meta.js`);
      const metaRel = `src/js/components/${name}.meta.js`;
      if (!existsSync(metaPath)) continue;
      let entry;
      try {
        const mod = await import(pathToFileURL(metaPath).href);
        entry = mod.default;
      } catch { continue; }
      if (!entry || typeof entry !== 'object') continue;

      // Class-root convention check
      if (typeof entry.class === 'string') {
        const expectedClass = `.${prefix}-${name}`;
        if (entry.class !== expectedClass) {
          const allow = KNOWN_CLASS_ROOT_EXCEPTIONS[name];
          if (allow && allow.class === entry.class) {
            issues.push({
              type: 'CLASS_ROOT_EXCEPTION',
              file: metaRel,
              message: `${name} uses ${entry.class} (allowlisted: ${allow.reason})`,
            });
          } else {
            issues.push({
              type: 'CLASS_ROOT_DRIFT',
              file: metaRel,
              message: `class "${entry.class}" does not match convention "${expectedClass}" — rename or add to KNOWN_CLASS_ROOT_EXCEPTIONS`,
            });
          }
        }
      }

      // Example-HTML drift check
      if (Array.isArray(entry.examples)) {
        const classRe = /class="([^"]+)"/g;
        const hookRe = new RegExp(`data-${prefix}="([^"]+)"`, 'g');
        for (const ex of entry.examples) {
          if (!ex || typeof ex.html !== 'string') continue;
          const title = typeof ex.title === 'string' ? ex.title : '(untitled)';
          const seenTokens = new Set();
          for (const m of ex.html.matchAll(classRe)) {
            for (const tok of m[1].split(/\s+/)) {
              if (!tok.startsWith(`${prefix}-`)) continue;
              const root = tok.slice(prefix.length + 1);
              if (seenTokens.has(root)) continue;
              seenTokens.add(root);
              if (!knownClassRoots.has(root)) {
                issues.push({
                  type: 'EXAMPLE_DRIFT',
                  file: metaRel,
                  message: `example "${title}" references unknown class .${prefix}-${root}`,
                });
              }
            }
          }
          // The example must include the component's own data-brut hook somewhere.
          // Other hooks (e.g. a wrapping topnav around a theme-switcher demo) are fine.
          const hooks = Array.from(ex.html.matchAll(hookRe), m => m[1]);
          if (hooks.length > 0 && !hooks.includes(name)) {
            issues.push({
              type: 'EXAMPLE_DRIFT',
              file: metaRel,
              message: `example "${title}" has data-${prefix}="${hooks.join('", "')}" but no data-${prefix}="${name}"`,
            });
          }
        }
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
    const tag = WARNING_TYPES.has(type) ? ' [warning]' : INFO_TYPES.has(type) ? ' [info]' : '';
    console.log(`\n${type}${tag} (${items.length}):`);
    for (const item of items.slice(0, 20)) {
      console.log(`  ${item.file} — ${item.message}`);
    }
    if (items.length > 20) console.log(`  ... and ${items.length - 20} more`);
  }

  const failures = issues.filter(i => !WARNING_TYPES.has(i.type) && !INFO_TYPES.has(i.type));
  console.log(`\n${issues.length} issue(s) found (${failures.length} failure-level).`);
  if (failures.length > 0) process.exit(1);
}
