import { writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const TEMPLATE = `import { defineConfig } from 'brut/config';

export default defineConfig({
  // Rename the 'brut-' class prefix (e.g. 'ui' produces .ui-btn, data-ui="switch")
  // prefix: 'brut',

  // Include all components, or list specific ones for tree-shaking
  // components: 'all',

  // Default theme applied at build time
  // theme: 'brutalist',

  // Override existing design tokens or add new ones
  // tokens: {
  //   override: { '--primary': '#FF0000' },
  //   extend:   { '--brand': '#007AFF' },
  // },

  // Add component variants via intent-token overrides
  // variants: {
  //   btn: { brand: { '--btn-bg': 'var(--brand)', '--btn-fg': '#fff' } },
  // },

  // Output options
  // output: { dir: 'dist', minify: true, manifest: true },
});
`;

export default function init(args) {
  const target = resolve(process.cwd(), 'brut.config.js');
  if (existsSync(target) && !args.includes('--force')) {
    console.log('brut.config.js already exists. Use --force to overwrite.');
    return;
  }
  writeFileSync(target, TEMPLATE);
  console.log('Created brut.config.js');
}
