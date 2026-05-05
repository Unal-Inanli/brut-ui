import { resolve, dirname } from 'node:path';
import { existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { defineConfig } from '../../config/define.js';

const PACKAGE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const PACKAGE_ENTRY = resolve(PACKAGE_ROOT, 'src/main.js');

export default async function build(args) {
  let vite;
  try {
    vite = await import('vite');
  } catch {
    console.error('Vite is required for "brut build". Install it: npm install -D vite');
    process.exit(1);
  }

  let cfg = defineConfig({});
  try {
    const configPath = resolve(process.cwd(), 'brut.config.js');
    if (existsSync(configPath)) {
      const mod = await import(pathToFileURL(configPath).href);
      cfg = defineConfig(mod.default || mod);
    }
  } catch { /* use defaults */ }

  const { default: brutPlugin } = await import('../../config/vite-plugin.js');

  await vite.build({
    root: process.cwd(),
    plugins: [brutPlugin(cfg)],
    build: {
      lib: {
        entry: PACKAGE_ENTRY,
        name: 'Brut',
        formats: ['iife', 'es'],
        fileName: (format) => format === 'iife' ? `${cfg.prefix}.js` : `${cfg.prefix}.esm.js`,
        cssFileName: cfg.prefix,
      },
      outDir: cfg.output.dir,
      emptyOutDir: true,
      minify: cfg.output.minify === false ? false : undefined,
    },
  });

  console.log('Build complete.');
}
