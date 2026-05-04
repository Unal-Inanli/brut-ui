import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const COMMANDS = {
  init:    () => import('./commands/init.js'),
  add:     () => import('./commands/add.js'),
  theme:   () => import('./commands/theme.js'),
  migrate: () => import('./commands/migrate.js'),
  doctor:  () => import('./commands/doctor.js'),
  build:   () => import('./commands/build.js'),
};

export async function run(args) {
  const cmd = args[0];

  if (!cmd || cmd === '--help' || cmd === '-h') {
    printHelp();
    return;
  }

  if (cmd === '--version' || cmd === '-v') {
    const pkg = JSON.parse(readFileSync(resolve(__dirname, '../../package.json'), 'utf8'));
    console.log(pkg.version);
    return;
  }

  const loader = COMMANDS[cmd];
  if (!loader) {
    console.error(`Unknown command: ${cmd}\nRun "brut --help" for available commands.`);
    process.exit(1);
  }

  const mod = await loader();
  await mod.default(args.slice(1));
}

function printHelp() {
  console.log(`
brut — BRUT UI Kit CLI

Usage: brut <command> [options]

Commands:
  init       Scaffold a brut.config.js in the current directory
  add        Add components to your config  (brut add btn card)
  theme      Manage themes                  (brut theme new|list)
  migrate    Apply migration rules for deprecated tokens/classes
  doctor     Scan project for common issues
  build      Build with brut.config.js

Options:
  -h, --help     Show this help
  -v, --version  Show version
`);
}
