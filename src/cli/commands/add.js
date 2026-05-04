import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { KNOWN_COMPONENTS } from '../../config/define.js';

export default function add(args) {
  if (!args.length) {
    console.log('Usage: brut add <component> [component...]');
    console.log(`\nAvailable: ${KNOWN_COMPONENTS.join(', ')}`);
    return;
  }

  const unknown = args.filter(a => !a.startsWith('-') && !KNOWN_COMPONENTS.includes(a));
  if (unknown.length) {
    console.error(`Unknown component(s): ${unknown.join(', ')}`);
    console.log(`Available: ${KNOWN_COMPONENTS.join(', ')}`);
    process.exit(1);
  }

  const names = args.filter(a => !a.startsWith('-'));
  const configPath = resolve(process.cwd(), 'brut.config.js');
  if (!existsSync(configPath)) {
    console.error('No brut.config.js found. Run "brut init" first.');
    process.exit(1);
  }

  let content = readFileSync(configPath, 'utf8');

  if (content.includes("// components: 'all'")) {
    content = content.replace(
      "// components: 'all'",
      `components: ${JSON.stringify(names)}`
    );
  } else if (content.includes("components: 'all'")) {
    content = content.replace(
      "components: 'all'",
      `components: ${JSON.stringify(names)}`
    );
  } else {
    const match = content.match(/components:\s*\[([^\]]*)\]/);
    if (match) {
      const existing = match[1].match(/'[^']+'|"[^"]+"/g)?.map(s => s.slice(1, -1)) || [];
      const merged = [...new Set([...existing, ...names])];
      content = content.replace(/components:\s*\[[^\]]*\]/, `components: ${JSON.stringify(merged)}`);
    } else {
      content = content.replace('defineConfig({', `defineConfig({\n  components: ${JSON.stringify(names)},`);
    }
  }

  writeFileSync(configPath, content);
  console.log(`Added: ${names.join(', ')}`);
}
