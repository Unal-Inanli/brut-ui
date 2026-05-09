// Doctor: validates a brut workspace.
// Failure-level checks (exit 1): UNKNOWN_CLASS, HARDCODED_COLOR, HARDCODED_PX, MISSING_JS.
// Warning-level checks (exit 0): MISSING_META — interactive component lacks a sidecar .meta.js;
//                                SURFACE_COVERAGE_GAP — manifest ↔ preview ↔ docs three-surface
//                                drift; DOCS_SECTION_SHAPE — docs/index.html section deviates from
//                                canonical shape; SNIPPET_PREVIEW_DRIFT — modifier set in a docs
//                                section's rendered preview disagrees with its escaped snippet.
// Informational checks (exit 0): META_DRIFT — meta declares modifiers/events/selector that
//                                drift from the runtime JS or components.css.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { resolve, extname, relative } from 'node:path';
import { pathToFileURL } from 'node:url';
import { defineConfig, KNOWN_COMPONENTS, INTERACTIVE_COMPONENTS } from '../../config/define.js';
import { RESPONSIVE_SHAPES } from '../../config/vite-plugin.js';

const WARNING_TYPES = new Set([
  'MISSING_META',
  'SURFACE_COVERAGE_GAP',
  'DOCS_SECTION_SHAPE',
  'SNIPPET_PREVIEW_DRIFT',
  // Responsive rollout (RR1) — landed as warnings during backfill (RR2–RR4).
  // Promote RESPONSIVE_META_MISSING + VIEWPORT_META_MISSING to failure once
  // backfill is complete.
  'RESPONSIVE_META_MISSING',
  'RESPONSIVE_SHAPE_INVALID',
  'RESPONSIVE_BREAKPOINT_INVALID',
  'VIEWPORT_META_MISSING',
  'BREAKPOINT_NON_TIER',
  'MAX_WIDTH_AT_TIER',
  'UNGUARDED_LAYOUT_DIM',
]);
const INFO_TYPES = new Set(['META_DRIFT', 'CLASS_ROOT_EXCEPTION', 'EXAMPLE_DRIFT']);

const RESPONSIVE_SHAPE_SET = new Set(RESPONSIVE_SHAPES);
const RESPONSIVE_BREAKPOINT_SET = new Set(['sm', 'md', 'lg']);

// Numeric breakpoint tier values — any media query value outside this set is
// non-tier drift. Tracked as numbers for fast equality.
const TIER_VALUES = new Set([640, 768, 1024]);

// Layout-dimension tokens consumed by absolute/fixed overlays whose value is >=320px.
// On absolutely-positioned elements, `max-width: 360px` can still overflow when the
// trigger sits near the viewport edge — so these MUST wrap with min(token, calc(100vw - …))
// or be paired with a tier media query. Centered wrapper tokens (--container-*) are NOT
// in this set because `max-width` on a block-level container is always a safe ceiling
// at narrow viewports.
const GUARDED_LAYOUT_TOKENS = new Set([
  '--drawer-w', '--dialog-max-w', '--popover-max-w',
]);

// Manifest names whose docs id / preview basename uses an irregular plural.
// Regular plurals (+s, +es) are auto-derived; only list exceptions here.
const PLURAL_ALIASES = {
  btn:            ['buttons'],
  crumbs:         ['breadcrumbs'],
  switch:         ['toggles'],
};

// Docs section ids that legitimately do not map to a single manifest component
// — foundations, install/build, validation umbrella, layout/form aggregations,
// and table sub-pages that document brut-table modifiers (sticky, responsive)
// rather than separate components.
const FOUNDATION_DOCS_IDS = new Set([
  'borders', 'build', 'color', 'colors', 'install', 'shadows', 'spacing',
  'typography', 'typography-primitives', 'utilities', 'validation',
  'field', 'fieldset', 'form-layouts', 'grid-12col', 'input-group',
  'layout-container', 'layout-grid', 'layout-misc', 'layout-section',
  'layout-spacer', 'layout-stack',
  'table-sticky', 'table-responsive',
]);

// preview/components-<basename>.html files that intentionally bundle multiple
// components (composite previews) or document a brut-table modifier pattern
// rather than a standalone component.
const COMPOSITE_PREVIEW_BASENAMES = new Set([
  'forms', 'form-layouts', 'grid', 'layout', 'modal',
  'table-responsive', 'table-sticky',
]);

// Manifest components whose docs are intentionally aggregated under umbrella
// sections (typography, typography-primitives, layout-*) — not expected to have
// their own preview page or top-level docs section.
const AGGREGATED_PRIMITIVES = new Set([
  // typography primitives
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'lead', 'prose', 'quote', 'small',
  'mono', 'kbd', 'code', 'label', 'link', 'overline', 'caption', 'display',
  'body', 'pre', 'list',
  // layout primitives
  'container', 'col', 'row', 'stack', 'cluster', 'bar', 'hero', 'section',
  'aspect', 'divider', 'notice', 'stat',
  // BEM sub-elements documented inline in their parent's section
  'counter', // .brut-field__counter — sub-element of brut-field
  // composed-primitive aggregations (documented inside an umbrella section)
  'avatar-group', // documented inside the "avatars" section
  'grid',         // documented inside the "layout-grid" section
  // host/utility components without standalone demos
  'theme-switcher', 'toast-host',
]);

// Components whose CSS class root intentionally diverges from the
// `.brut-<name>` convention. Each entry must declare the exact class
// string and a reason; doctor emits CLASS_ROOT_EXCEPTION (info) for
// these and CLASS_ROOT_DRIFT (failure) for any other divergence.
const KNOWN_CLASS_ROOT_EXCEPTIONS = {
  'counter':       { class: '.brut-field__counter',     reason: 'Sub-element of .brut-field (BEM); see ARCHITECTURE.md D4' },
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
  const viewportMetaRe = /<meta\s+name=["']viewport["']\s+content=["']([^"']+)["']/i;
  const RESPONSIVE_HTML_DIRS = new Set(['preview', 'docs', 'demos', 'site']);
  for (const file of htmlFiles) {
    const content = readFileSync(file, 'utf8');
    const rel = relative(root, file);
    if (dataPrefixRe.test(content)) {
      const hasJS = scriptJsRe.test(content) || scriptEsmRe.test(content);
      if (!hasJS) {
        issues.push({
          type: 'MISSING_JS',
          file: rel,
          message: `Uses data-${prefix} attributes but does not include ${prefix}.js`,
        });
      }
    }

    // VIEWPORT_META_MISSING — full HTML pages under preview/docs/demos/site must
    // declare a width=device-width viewport meta and must not disable zoom. Skip
    // partials/fragments (no <html element) and dirs outside the rollout scope.
    const topDir = rel.split('/')[0];
    if (RESPONSIVE_HTML_DIRS.has(topDir) && /<html[\s>]/i.test(content)) {
      const m = viewportMetaRe.exec(content);
      if (!m) {
        issues.push({
          type: 'VIEWPORT_META_MISSING',
          file: rel,
          message: 'No <meta name="viewport"> — mobile browsers fall back to ~980px and zoom out',
        });
      } else {
        const c = m[1];
        if (!/width\s*=\s*device-width/i.test(c)) {
          issues.push({
            type: 'VIEWPORT_META_MISSING',
            file: rel,
            message: `Viewport meta lacks width=device-width (got "${c}")`,
          });
        } else if (/user-scalable\s*=\s*no|maximum-scale\s*=\s*1(?:\.0)?\b/i.test(c)) {
          issues.push({
            type: 'VIEWPORT_META_MISSING',
            file: rel,
            message: 'Viewport meta disables zoom (WCAG 1.4.4 violation)',
          });
        }
      }
    }
  }

  // BREAKPOINT_NON_TIER + MAX_WIDTH_AT_TIER — every @media query in CSS files
  // and inside <style> blocks must use a tier value (640/768/1024 px or the
  // sub-tier .98 sentinel). max-width values that exactly equal a tier are
  // flagged separately because they collide with the corresponding min-width
  // tier at the boundary pixel (768px max + 768px min both fire at 768).
  const TIER_PX = new Set([640, 768, 1024]);
  const SUB_TIER_PX = new Set([639.98, 767.98, 1023.98]);
  function pushMediaIssues(content, file, baseLine) {
    const mediaRe = /@media\s*([^{]+)\{/g;
    const widthRe = /\((min|max)-width\s*:\s*(\d+(?:\.\d+)?)px\)/g;
    for (const mm of content.matchAll(mediaRe)) {
      const condition = mm[1];
      const lineNumber = baseLine + (content.slice(0, mm.index).match(/\n/g) || []).length + 1;
      for (const wm of condition.matchAll(widthRe)) {
        const dir = wm[1];
        const px = parseFloat(wm[2]);
        const isTier = TIER_PX.has(px);
        const isSubTier = SUB_TIER_PX.has(px);
        if (dir === 'max' && isTier) {
          issues.push({
            type: 'MAX_WIDTH_AT_TIER',
            file: `${file}:${lineNumber}`,
            message: `(max-width: ${wm[2]}px) collides with tier boundary — use (max-width: ${px - 0.02}px) or invert to mobile-first`,
          });
        }
        if (!isTier && !isSubTier) {
          issues.push({
            type: 'BREAKPOINT_NON_TIER',
            file: `${file}:${lineNumber}`,
            message: `(${dir}-width: ${wm[2]}px) — use a tier value (640/768/1024) or sub-tier sentinel (639.98/767.98/1023.98)`,
          });
        }
      }
    }
  }
  for (const file of cssFiles) {
    const rel = relative(root, file);
    if (rel.startsWith('src/tokens') || rel.startsWith('src/themes') || rel.startsWith('node_modules')) continue;
    pushMediaIssues(readFileSync(file, 'utf8'), rel, 0);
  }
  for (const file of htmlFiles) {
    const rel = relative(root, file);
    const content = readFileSync(file, 'utf8');
    const styleRe = /<style\b[^>]*>([\s\S]*?)<\/style>/gi;
    for (const sm of content.matchAll(styleRe)) {
      const before = content.slice(0, sm.index);
      const baseLine = (before.match(/\n/g) || []).length;
      pushMediaIssues(sm[1], rel, baseLine);
    }
  }

  // UNGUARDED_LAYOUT_DIM — any consumption of a layout-dimension token whose
  // value is >=320px (containers, drawer, dialog, popover) must be wrapped in
  // min(token, …) or sit inside a tier media query. The walk strips @media
  // bodies first (replacing them with whitespace to preserve line numbers)
  // then scans the residual for width/max-width/min-width usage of the tokens.
  function stripMediaBlocks(css) {
    let out = '';
    let i = 0;
    while (i < css.length) {
      const idx = css.indexOf('@media', i);
      if (idx < 0) { out += css.slice(i); break; }
      out += css.slice(i, idx);
      const open = css.indexOf('{', idx);
      if (open < 0) { out += css.slice(idx); break; }
      let depth = 1;
      let j = open + 1;
      while (j < css.length && depth > 0) {
        if (css[j] === '{') depth++;
        else if (css[j] === '}') depth--;
        j++;
      }
      const block = css.slice(idx, j);
      out += block.replace(/[^\n]/g, ' ');
      i = j;
    }
    return out;
  }
  const componentsCssPathForGuard = resolve(root, 'src/components.css');
  if (existsSync(componentsCssPathForGuard)) {
    const css = readFileSync(componentsCssPathForGuard, 'utf8');
    const stripped = stripMediaBlocks(css);
    const lines = stripped.split('\n');
    const dimRe = /\b(width|max-width|min-width|height|max-height|min-height)\s*:\s*([^;]+);/g;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      if (trimmed.startsWith('/*') || trimmed.startsWith('*')) continue;
      if (/^\s*--[a-z]/.test(line)) continue;
      for (const dm of line.matchAll(dimRe)) {
        const value = dm[2];
        for (const tok of GUARDED_LAYOUT_TOKENS) {
          if (!value.includes(`var(${tok})`)) continue;
          if (/min\s*\(/.test(value)) continue;
          issues.push({
            type: 'UNGUARDED_LAYOUT_DIM',
            file: `src/components.css:${i + 1}`,
            message: `${dm[1]}: var(${tok}) used outside @media and without min() guard — narrow viewports may overflow`,
          });
        }
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

      // Responsive check: interactive components must declare a responsive shape
      // from the canonical 9-shape glossary (see docs/responsive-shapes.md).
      // breakpoint is optional but, when present, must be sm|md|lg.
      const r = entry.responsive;
      if (!r || typeof r !== 'object' || Array.isArray(r)) {
        issues.push({
          type: 'RESPONSIVE_META_MISSING',
          file: metaRel,
          message: `Interactive component lacks responsive: declare one of {${RESPONSIVE_SHAPES.join(', ')}} — see docs/responsive-shapes.md`,
        });
      } else {
        if (typeof r.shape !== 'string' || !RESPONSIVE_SHAPE_SET.has(r.shape)) {
          issues.push({
            type: 'RESPONSIVE_SHAPE_INVALID',
            file: metaRel,
            message: `responsive.shape "${r.shape}" not one of {${RESPONSIVE_SHAPES.join(', ')}}`,
          });
        }
        if (r.breakpoint !== undefined && !RESPONSIVE_BREAKPOINT_SET.has(r.breakpoint)) {
          issues.push({
            type: 'RESPONSIVE_BREAKPOINT_INVALID',
            file: metaRel,
            message: `responsive.breakpoint "${r.breakpoint}" not one of {sm, md, lg}`,
          });
        }
      }
    }

    // INVARIANT_DRIFT: every interactive component must also be in KNOWN_COMPONENTS.
    // Pre-M7 a real bug of this kind (combobox) went
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

  // SURFACE_COVERAGE_GAP — every manifest component should have a class block,
  // a preview page (preview/components-<name>.html), and a docs section
  // (<section class="docs-section" id="<name>">) — modulo allowlists for
  // foundations, composites, and primitives aggregated under umbrella sections.
  // Inverse: orphan docs sections / preview files are also flagged.
  // Only runs in a brut workspace (manifest + docs + preview must all exist).
  const manifestPath = resolve(root, 'dist/components.json');
  const docsIndexPath = resolve(root, 'docs/index.html');
  const previewDir = resolve(root, 'preview');
  if (existsSync(manifestPath) && existsSync(docsIndexPath) && existsSync(previewDir)) {
    let manifest = null;
    try {
      manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
    } catch {
      // malformed manifest is reported elsewhere (check-manifest.js); skip silently
    }
    if (manifest && Array.isArray(manifest.components)) {
      const docsHtml = readFileSync(docsIndexPath, 'utf8');
      const docsSectionRe = /<section\s+class="docs-section"\s+id="([^"]+)"/g;
      const docsSectionIds = new Set();
      for (const m of docsHtml.matchAll(docsSectionRe)) docsSectionIds.add(m[1]);

      const previewBasenames = new Set();
      for (const f of readdirSync(previewDir)) {
        const m = /^components-([a-z][a-z0-9-]*)\.html$/.exec(f);
        if (m) previewBasenames.add(m[1]);
      }

      const candidatesFor = (name) => {
        const out = [name, `${name}s`, `${name}es`];
        if (PLURAL_ALIASES[name]) out.push(...PLURAL_ALIASES[name]);
        return out;
      };

      const matchedDocsIds = new Set();
      const matchedPreviewBasenames = new Set();

      for (const entry of manifest.components) {
        if (!entry || typeof entry.name !== 'string') continue;
        const name = entry.name;
        if (AGGREGATED_PRIMITIVES.has(name)) continue;

        const cands = candidatesFor(name);
        let docsHit = null;
        let previewHit = null;
        for (const c of cands) {
          if (!docsHit && docsSectionIds.has(c)) docsHit = c;
          if (!previewHit && previewBasenames.has(c)) previewHit = c;
        }
        if (docsHit) matchedDocsIds.add(docsHit);
        if (previewHit) matchedPreviewBasenames.add(previewHit);

        if (!docsHit) {
          issues.push({
            type: 'SURFACE_COVERAGE_GAP',
            file: 'docs/index.html',
            message: `Component "${name}" has class+manifest but no docs section (expected one of: ${cands.join(', ')})`,
          });
        }
        if (!previewHit) {
          issues.push({
            type: 'SURFACE_COVERAGE_GAP',
            file: `preview/components-${name}.html`,
            message: `Component "${name}" has class+manifest but no preview page (expected one of: ${cands.map(c => `components-${c}.html`).join(', ')})`,
          });
        }
      }

      // Orphan docs sections (id not matched by any manifest component, not in foundation allowlist)
      for (const id of docsSectionIds) {
        if (matchedDocsIds.has(id)) continue;
        if (FOUNDATION_DOCS_IDS.has(id)) continue;
        issues.push({
          type: 'SURFACE_COVERAGE_GAP',
          file: 'docs/index.html',
          message: `Docs section "${id}" matches no manifest component (add to manifest or to FOUNDATION_DOCS_IDS allowlist)`,
        });
      }

      // Orphan preview files (basename not matched, not in composite allowlist)
      for (const basename of previewBasenames) {
        if (matchedPreviewBasenames.has(basename)) continue;
        if (COMPOSITE_PREVIEW_BASENAMES.has(basename)) continue;
        issues.push({
          type: 'SURFACE_COVERAGE_GAP',
          file: `preview/components-${basename}.html`,
          message: `Preview "${basename}" matches no manifest component (add to manifest or to COMPOSITE_PREVIEW_BASENAMES allowlist)`,
        });
      }

      // DOCS_SECTION_SHAPE — every docs section should have <h2>, <p class="lead">,
      // at least one <div class="docs-preview">, and at least one <pre class="docs-snippet">.
      // Multi-preview / multi-snippet sections are allowed: pedagogical "docs-block"
      // wrapped previews (e.g. progress) and paired (preview, snippet) examples
      // separated by <h3> sub-headings (e.g. pagination) are both legitimate.
      // Foundation sections are exempt entirely.
      const sectionBodyRe = /<section\s+class="docs-section"\s+id="([^"]+)"[^>]*>([\s\S]*?)<\/section>/g;
      for (const m of docsHtml.matchAll(sectionBodyRe)) {
        const id = m[1];
        const body = m[2];
        if (FOUNDATION_DOCS_IDS.has(id)) continue;
        const missing = [];
        if (!/<h2[\s>]/.test(body)) missing.push('<h2>');
        if (!/<p\s+class="lead"/.test(body)) missing.push('<p class="lead">');
        const previewCount = (body.match(/<div\s+class="docs-preview(?:\s|")/g) || []).length;
        if (previewCount === 0) missing.push('<div class="docs-preview">');
        const snippetCount = (body.match(/<pre\s+class="docs-snippet"/g) || []).length;
        if (snippetCount === 0) missing.push('<pre class="docs-snippet">');
        if (missing.length > 0) {
          issues.push({
            type: 'DOCS_SECTION_SHAPE',
            file: 'docs/index.html',
            message: `Section "${id}" is missing/non-canonical: ${missing.join(', ')}`,
          });
        }
      }

      // SNIPPET_PREVIEW_DRIFT — the set of `.brut-<root>--<modifier>` fragments
      // inside each section's <div class="docs-preview"> must equal the set
      // inside its <pre class="docs-snippet"> (after HTML-decoding). The check is
      // scoped to the section's OWN component root (derived from the section id
      // and its singularizations / aliases) — incidental modifiers on nested
      // helper components (e.g. a brut-btn--sm trigger inside a popover demo)
      // are intentionally ignored. This is the core "Buttons preview shows 7
      // variants, snippet shows 5" pain.
      const decodeEntities = (s) => s
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&amp;/g, '&');
      const sectionRoots = (id) => {
        const cands = new Set([id]);
        if (id.endsWith('es')) cands.add(id.slice(0, -2));
        if (id.endsWith('s')) cands.add(id.slice(0, -1));
        for (const [singular, plurals] of Object.entries(PLURAL_ALIASES)) {
          if (plurals.includes(id)) cands.add(singular);
        }
        return [...cands];
      };
      const collectScopedModifiers = (chunk, roots) => {
        const set = new Set();
        for (const root of roots) {
          const escaped = root.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
          const re = new RegExp(`\\b${prefix}-${escaped}--([a-z][a-z0-9-]*)`, 'g');
          for (const mm of chunk.matchAll(re)) set.add(`${root}--${mm[1]}`);
        }
        return set;
      };
      // Multi-preview/multi-snippet sections are unioned: any modifier shown
      // anywhere in the section's previews must appear somewhere in the section's
      // snippets (and vice versa).
      const allPreviewsRe = /<div\s+class="docs-preview[^"]*"[^>]*>([\s\S]*?)(?=<pre\s+class="docs-snippet"|<h3[\s>]|<\/section>|<div\s+class="docs-block")/g;
      const allSnippetsRe = /<pre\s+class="docs-snippet"[^>]*>([\s\S]*?)<\/pre>/g;
      for (const m of docsHtml.matchAll(sectionBodyRe)) {
        const id = m[1];
        const body = m[2];
        if (FOUNDATION_DOCS_IDS.has(id)) continue;
        const roots = sectionRoots(id);
        const previewMods = new Set();
        const snippetMods = new Set();
        for (const pm of body.matchAll(allPreviewsRe)) {
          for (const v of collectScopedModifiers(pm[1], roots)) previewMods.add(v);
        }
        for (const sm of body.matchAll(allSnippetsRe)) {
          for (const v of collectScopedModifiers(decodeEntities(sm[1]), roots)) snippetMods.add(v);
        }
        if (previewMods.size === 0 && snippetMods.size === 0) continue;
        const onlyPreview = [...previewMods].filter(x => !snippetMods.has(x));
        const onlySnippet = [...snippetMods].filter(x => !previewMods.has(x));
        if (onlyPreview.length === 0 && onlySnippet.length === 0) continue;
        const parts = [];
        if (onlyPreview.length) parts.push(`preview-only: ${onlyPreview.map(x => `--${x.split('--')[1]}`).join(', ')}`);
        if (onlySnippet.length) parts.push(`snippet-only: ${onlySnippet.map(x => `--${x.split('--')[1]}`).join(', ')}`);
        issues.push({
          type: 'SNIPPET_PREVIEW_DRIFT',
          file: 'docs/index.html',
          message: `Section "${id}" preview/snippet modifier sets differ — ${parts.join('; ')}`,
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
