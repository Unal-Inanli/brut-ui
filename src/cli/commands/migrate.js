import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { resolve, extname } from 'node:path';

const RULES = [
  // Migration rules are added as tokens/classes are renamed between versions.
  // { from: '--old-token', to: '--new-token', version: '0.3.0' },
];

function walk(dir, exts, results = []) {
  for (const entry of readdirSync(dir)) {
    if (['node_modules', 'dist', '.git', '.claude'].includes(entry)) continue;
    const full = resolve(dir, entry);
    if (statSync(full).isDirectory()) { walk(full, exts, results); continue; }
    if (exts.includes(extname(full))) results.push(full);
  }
  return results;
}

export default function migrate(args) {
  const dryRun = args.includes('--dry-run');
  const root = process.cwd();

  if (!RULES.length) {
    console.log('No migration rules to apply. Your project is up to date.');
    return;
  }

  const files = walk(root, ['.html', '.css', '.js', '.jsx', '.tsx', '.vue', '.svelte']);
  let totalChanges = 0;

  for (const file of files) {
    let content = readFileSync(file, 'utf8');
    let changed = false;

    for (const rule of RULES) {
      if (content.includes(rule.from)) {
        content = content.replaceAll(rule.from, rule.to);
        changed = true;
        totalChanges++;
        const rel = file.replace(root + '/', '');
        console.log(`  ${rel}: ${rule.from} → ${rule.to}`);
      }
    }

    if (changed && !dryRun) writeFileSync(file, content);
  }

  if (totalChanges === 0) {
    console.log('No deprecated patterns found.');
  } else if (dryRun) {
    console.log(`\nFound ${totalChanges} change(s). Run without --dry-run to apply.`);
  } else {
    console.log(`\nApplied ${totalChanges} migration(s).`);
  }
}
