import { resolve } from 'node:path';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { defineConfig, KNOWN_COMPONENTS, INTERACTIVE_COMPONENTS, KNOWN_THEMES } from './define.js';

function renamePrefix(code, from, to) {
  return code
    .replaceAll(from + '-', to + '-')
    .replaceAll('data-' + from, 'data-' + to)
    .replaceAll(from + ':', to + ':');
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

function generateManifest(cfg, version) {
  return {
    $schema: 'https://brut.dev/schema/components.json',
    version,
    prefix: cfg.prefix,
    themes: KNOWN_THEMES,
    components: KNOWN_COMPONENTS.map(name => ({
      name,
      class: `.${cfg.prefix}-${name}`,
      selector: INTERACTIVE_COMPONENTS.includes(name)
        ? `[data-${cfg.prefix}="${name}"]`
        : null,
      kind: INTERACTIVE_COMPONENTS.includes(name) ? 'interactive' : 'static',
    })),
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
      cfg = inlineConfig
        ? defineConfig(inlineConfig)
        : await loadConfigFile(resolved.root);
    },

    transform(code, id) {
      if (cfg.prefix === 'brut') return;
      if (id.endsWith('.css') || (id.endsWith('.js') && code.includes('brut-'))) {
        return { code: renamePrefix(code, 'brut', cfg.prefix), map: null };
      }
    },

    generateBundle(_, bundle) {
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

      const { override, extend } = cfg.tokens;
      const hasOverrides = Object.keys(override).length > 0;
      const hasExtensions = Object.keys(extend).length > 0;
      const hasVariants = Object.keys(cfg.variants).length > 0;

      if (hasOverrides || hasExtensions || hasVariants) {
        for (const asset of Object.values(bundle)) {
          if (asset.type !== 'asset' || !asset.fileName.endsWith('.css')) continue;
          let src = typeof asset.source === 'string' ? asset.source : new TextDecoder().decode(asset.source);
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
          asset.source = src + '\n' + extra;
        }
      }

      if (cfg.output.manifest) {
        this.emitFile({
          type: 'asset',
          fileName: 'components.json',
          source: JSON.stringify(generateManifest(cfg, pkgVersion), null, 2),
        });
      }
    },
  };
}
