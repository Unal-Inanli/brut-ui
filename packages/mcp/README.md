# @sprtn/mcp

A [Model Context Protocol](https://modelcontextprotocol.io) server for the
[BRUT UI](https://github.com/your-org/brut-ui) kit. It exposes the BRUT
component manifest to AI agents (Claude Code, Claude Desktop, Cursor, …) so
they can scaffold BRUT pages without crawling the source.

The server reads the manifest from the peer `@sprtn/ui` package's
`@sprtn/ui/manifest` export (`dist/components.json`) — bumping `@sprtn/ui`
propagates new components to the agent immediately, no rebuild of
`@sprtn/mcp` required.

## Install

```bash
npm install -D @sprtn/ui @sprtn/mcp
```

`@sprtn/mcp` declares `@sprtn/ui` as a peer dependency, so it must be installed
alongside it.

## Wire into an MCP client

### Claude Code (`.mcp.json` in the repo root, or `~/.claude.json`)

```json
{
  "mcpServers": {
    "brut": {
      "command": "npx",
      "args": ["-y", "@sprtn/mcp"]
    }
  }
}
```

### Claude Desktop (`claude_desktop_config.json`)

```json
{
  "mcpServers": {
    "brut": {
      "command": "npx",
      "args": ["-y", "@sprtn/mcp"]
    }
  }
}
```

### Cursor (`.cursor/mcp.json`)

```json
{
  "mcpServers": {
    "brut": {
      "command": "npx",
      "args": ["-y", "@sprtn/mcp"]
    }
  }
}
```

Restart the client; the `brut` server should appear in its MCP tool list.

## Tools

| Tool | Arguments | Returns |
|---|---|---|
| `list_components` | `{ kind?: 'interactive' \| 'static' }` | Array of `{ name, kind, description, class }` for every component (optionally filtered by kind). |
| `get_component` | `{ name: string }` *(required)* | Full manifest entry for the named component — class, selector, modifiers, data-attributes, events, form-state, a11y, examples. Throws `Unknown component: <name>` if not found. |
| `list_themes` | `{}` | Array of built-in theme names (`['brutalist', 'corporate', 'minimal']`). |
| `list_tokens` | `{ layer?: 'primitives' \| 'semantic' \| 'intent', category?: string }` | All design tokens grouped by layer and category. Each token includes name, value, and inline comment. |
| `update_token` | `{ token: string, value: string }` *(both required)* | Updates an existing token's value in its source CSS file. Returns `{ token, layer, category, oldValue, newValue, warning }`. |
| `add_token` | `{ token: string, value: string, layer: string, category?: string, comment?: string }` | Adds a new token to the specified layer and category section. Throws if the token already exists. |

### Read-only tools

Use `list_components` to discover what's available, `get_component` to fetch
the snippets and props for a specific component, and `list_themes` to surface
the runtime `data-theme` switcher options.

### Token editing tools

Use `list_tokens` to discover available design tokens, `update_token` to modify
an existing token (e.g. change the primary accent color), and `add_token` to
introduce new tokens. Changes are written directly to the source CSS files under
`src/tokens/` and take effect after a rebuild.

## CLI

```bash
brut-mcp           # run the stdio server (used by MCP clients)
brut-mcp --help    # show help
brut-mcp --version # print the @sprtn/mcp version
```

## License

MIT — see the BRUT UI repo for the full license text.
