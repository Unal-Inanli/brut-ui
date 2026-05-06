import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const CONFIG_TEMPLATE = `import { defineConfig } from '@sprtn/ui/config';

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

const MCP_SERVER_ENTRY = {
  command: 'npx',
  args: ['-y', '@sprtn/mcp'],
};

function writeBrutConfig(force) {
  const target = resolve(process.cwd(), 'brut.config.js');
  const existed = existsSync(target);
  if (existed && !force) {
    console.log('skipped:  brut.config.js (already exists — pass --force to overwrite)');
    return;
  }
  writeFileSync(target, CONFIG_TEMPLATE);
  console.log(`${existed ? 'updated' : 'created'}:  brut.config.js`);
}

function writeMcpConfig(force) {
  const target = resolve(process.cwd(), '.mcp.json');

  if (!existsSync(target)) {
    const fresh = { mcpServers: { brut: MCP_SERVER_ENTRY } };
    writeFileSync(target, JSON.stringify(fresh, null, 2) + '\n');
    console.log('created:  .mcp.json with `brut` MCP server');
    return;
  }

  let existing;
  try {
    existing = JSON.parse(readFileSync(target, 'utf8'));
  } catch (err) {
    console.log(`warning:  .mcp.json exists but is not valid JSON: ${err.message}`);
    console.log('          Fix it manually, then add the brut entry:');
    console.log(`          ${JSON.stringify({ brut: MCP_SERVER_ENTRY })}`);
    return;
  }

  existing.mcpServers =
    existing.mcpServers && typeof existing.mcpServers === 'object' ? existing.mcpServers : {};

  if (existing.mcpServers.brut && !force) {
    console.log('skipped:  .mcp.json (already configures `brut` — pass --force to overwrite)');
    return;
  }

  const otherServers = Object.keys(existing.mcpServers).filter(k => k !== 'brut').length;
  existing.mcpServers.brut = MCP_SERVER_ENTRY;
  writeFileSync(target, JSON.stringify(existing, null, 2) + '\n');
  console.log(
    otherServers > 0
      ? 'updated:  .mcp.json — added `brut` server (other servers preserved)'
      : 'updated:  .mcp.json with `brut` MCP server',
  );
}

function printNextSteps({ wroteMcp, wroteConfig }) {
  const lines = ['', 'Next steps:'];

  if (wroteMcp) {
    lines.push(
      '  1. Install the MCP server so AI agents can query the component manifest:',
      '       npm install -D @sprtn/mcp',
      '  2. Restart your editor (Claude Code, Cursor, Claude Desktop) to load .mcp.json.',
    );
  }

  lines.push(
    `  ${wroteMcp ? '3' : '1'}. Pull in the styles in your HTML or app entry:`,
    '       <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@sprtn/ui@1/dist/brut.css">',
    '     or, with a bundler:',
    "       import '@sprtn/ui/css'",
    `  ${wroteMcp ? '4' : '2'}. Browse components: https://unal-inanli.github.io/brut-ui/components/`,
    '',
  );

  console.log(lines.join('\n'));
}

export default function init(args) {
  const force = args.includes('--force');
  const skipConfig = args.includes('--no-config');
  const skipMcp = args.includes('--no-mcp');

  if (skipConfig && skipMcp) {
    console.log('Nothing to do — both --no-config and --no-mcp passed.');
    return;
  }

  if (!skipConfig) writeBrutConfig(force);
  if (!skipMcp) writeMcpConfig(force);

  printNextSteps({ wroteConfig: !skipConfig, wroteMcp: !skipMcp });
}
