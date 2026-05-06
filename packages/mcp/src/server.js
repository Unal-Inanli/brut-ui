#!/usr/bin/env node
/**
 * @sprtn/mcp — Model Context Protocol server for the BRUT UI kit.
 *
 * Exposes three tools (list_components, get_component, list_themes) over stdio
 * so that AI agents (Claude Code, Claude Desktop, Cursor, etc.) can scaffold
 * BRUT pages without crawling the source.
 *
 * The manifest is resolved lazily at startup via `import.meta.resolve('@sprtn/ui/manifest')`
 * — this works because the consumer installs `@sprtn/ui` alongside `@sprtn/mcp` and
 * the root `@sprtn/ui` package's `exports['./manifest']` field points to its
 * `dist/components.json`. The manifest is read once and held in memory; it is
 * not re-read on every tool call.
 */

import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import * as listComponents from './tools/list_components.js';
import * as getComponent from './tools/get_component.js';
import * as listThemes from './tools/list_themes.js';
import * as listUtilities from './tools/list_utilities.js';
import * as suggestComponent from './tools/suggest_component.js';
import * as listTokens from './tools/list_tokens.js';
import * as updateToken from './tools/update_token.js';
import * as addToken from './tools/add_token.js';

const TOOLS = [listComponents, getComponent, listThemes, listUtilities, suggestComponent, listTokens, updateToken, addToken];

async function loadManifest() {
  // Resolve relative to this server file so it works whether installed as a
  // workspace dep, a published package, or run via `npx -y @sprtn/mcp`.
  const url = await import.meta.resolve('@sprtn/ui/manifest');
  const manifestPath = fileURLToPath(url);
  const raw = await readFile(manifestPath, 'utf8');
  const root = resolve(dirname(manifestPath), '..');
  return { manifest: JSON.parse(raw), root };
}

function toToolDescriptor(tool) {
  return {
    name: tool.name,
    description: tool.description,
    inputSchema: tool.inputSchema,
  };
}

async function main() {
  // Fast-path help so `brut-mcp --help` doesn't hang on stdio.
  const argv = process.argv.slice(2);
  if (argv.includes('--help') || argv.includes('-h')) {
    process.stdout.write(
      [
        'brut-mcp — Model Context Protocol server for the BRUT UI kit.',
        '',
        'Usage:',
        '  brut-mcp                 Run the stdio MCP server (used by MCP clients).',
        '  brut-mcp --help          Show this help.',
        '  brut-mcp --version       Print the package version.',
        '',
        'Tools exposed: list_components, get_component, list_themes, list_tokens, update_token, add_token.',
        'Manifest is resolved from the peer `brut` package via `brut/manifest`.',
        '',
      ].join('\n'),
    );
    return;
  }
  if (argv.includes('--version') || argv.includes('-v')) {
    process.stdout.write('0.3.0\n');
    return;
  }

  const { manifest, root } = await loadManifest();
  const context = { manifest, root };

  const server = new Server(
    { name: 'brut', version: '0.3.0' },
    { capabilities: { tools: {} } },
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: TOOLS.map(toToolDescriptor),
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    const tool = TOOLS.find((t) => t.name === name);
    if (!tool) {
      return {
        isError: true,
        content: [{ type: 'text', text: `Unknown tool: ${name}` }],
      };
    }
    try {
      const result = await tool.handler(args ?? {}, context);
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    } catch (err) {
      return {
        isError: true,
        content: [
          { type: 'text', text: err instanceof Error ? err.message : String(err) },
        ],
      };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  process.stderr.write(`[brut-mcp] fatal: ${err?.stack ?? err}\n`);
  process.exit(1);
});
