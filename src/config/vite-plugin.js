import { resolve } from 'node:path';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { defineConfig, KNOWN_COMPONENTS, INTERACTIVE_COMPONENTS, KNOWN_THEMES } from './define.js';
import { STATIC_META } from './static-meta.js';
import { UTILITY_CATEGORIES, BREAKPOINTS } from './utilities-meta.js';

function renamePrefix(code, from, to) {
  return code
    .replaceAll(from + '-', to + '-')
    .replaceAll('data-' + from, 'data-' + to)
    .replaceAll(from + ':', to + ':');
}

const REQUIRED_META_FIELDS = ['name', 'description', 'useCases', 'kind', 'class', 'examples'];

async function loadMetaFiles(root) {
  const dir = resolve(root, 'src/js/components');
  const map = new Map();
  if (!existsSync(dir)) return map;
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return map;
  }
  for (const file of entries) {
    if (!file.endsWith('.meta.js')) continue;
    const name = file.slice(0, -'.meta.js'.length);
    const filePath = resolve(dir, file);
    try {
      const mod = await import(pathToFileURL(filePath).href);
      const entry = mod.default;
      if (entry && typeof entry === 'object') {
        map.set(name, entry);
      }
    } catch {
      /* skip files that fail to import; doctor will flag separately */
    }
  }
  return map;
}

function validateMetaEntry(entry, ctx) {
  const missing = [];
  for (const field of REQUIRED_META_FIELDS) {
    const value = entry[field];
    if (value === undefined || value === null) {
      missing.push(field);
      continue;
    }
    if ((field === 'useCases' || field === 'examples') && (!Array.isArray(value) || value.length < 1)) {
      missing.push(field);
    }
  }
  if (missing.length > 0 && ctx && typeof ctx.warn === 'function') {
    ctx.warn(`[brut] ${entry.name || '(unnamed)'}.meta.js missing required field(s): ${missing.join(', ')}`);
  }
}

function applyPrefixToMeta(entry, prefix) {
  if (prefix === 'brut') return entry;
  const out = { ...entry };
  if (typeof entry.class === 'string') {
    out.class = renamePrefix(entry.class, 'brut', prefix);
  }
  if (typeof entry.selector === 'string') {
    out.selector = renamePrefix(entry.selector, 'brut', prefix);
  }
  return out;
}

function generateVariantCSS(variants, prefix) {
  let css = '';
  for (const [component, mods] of Object.entries(variants)) {
    for (const [mod, tokens] of Object.entries(mods)) {
      const props = Object.entries(tokens).map(([k, v]) => `  ${k}: ${v};`).join('\n');
      css += `.${prefix}-${component}--${mod} {\n${props}\n}\n`;
    }
  }
  return css;
}

function buildOverrideCSS(cfg) {
  const { override, extend } = cfg.tokens;
  const hasOverrides = Object.keys(override).length > 0;
  const hasExtensions = Object.keys(extend).length > 0;
  const hasVariants = Object.keys(cfg.variants).length > 0;
  if (!hasOverrides && !hasExtensions && !hasVariants) return '';
  let extra = '';
  if (hasOverrides) {
    extra += `:root {\n${Object.entries(override).map(([k, v]) => `  ${k}: ${v};`).join('\n')}\n}\n`;
  }
  if (hasExtensions) {
    extra += `:root {\n${Object.entries(extend).map(([k, v]) => `  ${k}: ${v};`).join('\n')}\n}\n`;
  }
  if (hasVariants) {
    extra += generateVariantCSS(cfg.variants, cfg.prefix);
  }
  return extra;
}

function isBrutEntryCSS(id) {
  const normalized = id.replace(/\\/g, '/');
  return normalized.endsWith('/src/main.css') || normalized.endsWith('/dist/brut.css');
}

async function generateManifest(cfg, version, root, ctx) {
  const metaMap = await loadMetaFiles(root);
  const components = KNOWN_COMPONENTS.map(name => {
    const meta = metaMap.get(name);
    if (meta) {
      validateMetaEntry(meta, ctx);
      return applyPrefixToMeta(meta, cfg.prefix);
    }
    const staticMeta = STATIC_META.get(name);
    if (staticMeta) {
      return applyPrefixToMeta({
        ...staticMeta,
        kind: 'static',
        class: `.${cfg.prefix}-${name}`,
        selector: null,
      }, cfg.prefix);
    }
    return {
      name,
      class: `.${cfg.prefix}-${name}`,
      selector: INTERACTIVE_COMPONENTS.includes(name)
        ? `[data-${cfg.prefix}="${name}"]`
        : null,
      kind: INTERACTIVE_COMPONENTS.includes(name) ? 'interactive' : 'static',
    };
  });
  return {
    $schema: 'https://brut.dev/schema/components-v1.json',
    version,
    prefix: cfg.prefix,
    themes: KNOWN_THEMES,
    components,
    utilities: UTILITY_CATEGORIES,
    breakpoints: BREAKPOINTS,
  };
}

async function loadConfigFile(root) {
  try {
    const configPath = resolve(root, 'brut.config.js');
    const mod = await import(pathToFileURL(configPath).href);
    return defineConfig(mod.default || mod);
  } catch {
    return defineConfig({});
  }
}

export default function brutPlugin(inlineConfig) {
  let cfg;
  let pkgVersion = '0.0.0';
  let projectRoot = process.cwd();

  return {
    name: 'brut',

    config(viteConfig) {
      const root = viteConfig.root || process.cwd();
      try {
        pkgVersion = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')).version || '0.0.0';
      } catch { /* no package.json */ }
      return { define: { __BRUT_VERSION__: JSON.stringify(pkgVersion) } };
    },

    async configResolved(resolved) {
      projectRoot = resolved.root || process.cwd();
      cfg = inlineConfig
        ? defineConfig(inlineConfig)
        : await loadConfigFile(resolved.root);
    },

    transform(code, id) {
      const isCSS = id.endsWith('.css');
      const isJS = id.endsWith('.js') && code.includes('brut-');
      if (!isCSS && !isJS) return;

      let result = code;

      if (cfg.prefix !== 'brut') {
        result = renamePrefix(result, 'brut', cfg.prefix);
      }

      if (isCSS && isBrutEntryCSS(id)) {
        const extra = buildOverrideCSS(cfg);
        if (extra) result += '\n' + extra;
      }

      if (result !== code) {
        return { code: result, map: null };
      }
    },

    async generateBundle(_, bundle) {
      for (const chunk of Object.values(bundle)) {
        if (chunk.type !== 'chunk') continue;
        const coreRe = /(\t?\/\/#region src\/js\/core\.js\n[\s\S]*?\n\t?\/\/#endregion\n)/;
        const match = chunk.code.match(coreRe);
        if (!match) continue;
        const core = match[1];
        const without = chunk.code.replace(core, '');
        const first = without.search(/\t?\/\/#region/);
        if (first === -1) continue;
        chunk.code = without.slice(0, first) + core + without.slice(first);
      }

      if (cfg.output.manifest) {
        const manifest = await generateManifest(cfg, pkgVersion, projectRoot, this);
        this.emitFile({
          type: 'asset',
          fileName: 'components.json',
          source: JSON.stringify(manifest, null, 2),
        });

        // Re-emit the JSON Schema alongside the manifest (the source lives in
        // docs/ because emptyOutDir clears dist/; agents and validators reading
        // dist/components.json can fetch dist/manifest-schema.json from the same dir).
        try {
          const schemaPath = resolve(projectRoot, 'docs/manifest-schema.json');
          if (existsSync(schemaPath)) {
            this.emitFile({
              type: 'asset',
              fileName: 'manifest-schema.json',
              source: readFileSync(schemaPath, 'utf8'),
            });
          }
        } catch { /* schema source missing is non-fatal */ }
      }
    },
  };
}
