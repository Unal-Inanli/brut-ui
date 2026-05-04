import { writeFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { KNOWN_THEMES } from '../../config/define.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

function themeTemplate(name) {
  const title = name.charAt(0).toUpperCase() + name.slice(1);
  return `/* ============================================
   BRUT — Theme: ${title}
   Custom theme. Override semantic tokens only —
   never primitives, never intent.
   ============================================ */

[data-theme="${name}"] {
  /* ---------- COLOR ---------- */
  --ink:          #000000;
  --paper:        #FFFFFF;
  --primary:      #FFD23F;
  --primary-soft: #FFE680;
  --primary-deep: #E0B400;

  /* ---------- SEMANTIC ---------- */
  --bg-1:        var(--paper);
  --bg-2:        #F5F5F5;
  --fg-1:        var(--ink);
  --border:      var(--ink);
  --accent:      var(--primary);
  --accent-soft: var(--primary-soft);
  --accent-deep: var(--primary-deep);

  /* ---------- SHADOW ---------- */
  --shadow-sm:  4px 4px 0 0 var(--ink);
  --shadow-md:  6px 6px 0 0 var(--ink);
  --shadow-lg:  8px 8px 0 0 var(--ink);

  /* ---------- SHAPE ---------- */
  --bw-3: 4px;
  --r-0:  0px;
}
`;
}

export default function theme(args) {
  const sub = args[0];

  if (sub === 'list') {
    console.log('Built-in themes:');
    for (const t of KNOWN_THEMES) console.log(`  ${t}`);
    try {
      const themesDir = resolve(__dirname, '../../../themes');
      if (existsSync(themesDir)) {
        const custom = readdirSync(themesDir)
          .filter(f => f.endsWith('.css') && f !== 'index.css')
          .map(f => f.replace('.css', ''))
          .filter(t => !KNOWN_THEMES.includes(t));
        if (custom.length) {
          console.log('\nCustom themes:');
          for (const t of custom) console.log(`  ${t}`);
        }
      }
    } catch { /* no themes dir */ }
    return;
  }

  if (sub === 'new') {
    const name = args[1];
    if (!name) {
      console.error('Usage: brut theme new <name>');
      process.exit(1);
    }
    const target = resolve(process.cwd(), `${name}.theme.css`);
    if (existsSync(target) && !args.includes('--force')) {
      console.log(`${name}.theme.css already exists. Use --force to overwrite.`);
      return;
    }
    writeFileSync(target, themeTemplate(name));
    console.log(`Created ${name}.theme.css`);
    return;
  }

  console.log('Usage: brut theme <new|list>');
}
