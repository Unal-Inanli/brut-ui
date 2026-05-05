# @brut/mcp

A [Model Context Protocol](https://modelcontextprotocol.io) server for the
[BRUT UI](https://github.com/your-org/brut-ui) kit. It exposes the BRUT
component manifest to AI agents (Claude Code, Claude Desktop, Cursor, …) so
they can scaffold BRUT pages without crawling the source.

The server reads the manifest from the peer `brut` package's
`brut/manifest` export (`dist/components.json`) — bumping `brut` propagates
new components to the agent immediately, no rebuild of `@brut/mcp` required.

## Install

```bash
npm install -D brut @brut/mcp
```

`@brut/mcp` declares `brut` as a peer dependency, so it must be installed
alongside it.

## Wire into an MCP client

### Claude Code (`.mcp.json` in the repo root, or `~/.claude.json`)

```json
{
  "mcpServers": {
    "brut": {
      "command": "npx",
      "args": ["-y", "@brut/mcp"]
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
      "args": ["-y", "@brut/mcp"]
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
      "args": ["-y", "@brut/mcp"]
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

Use `list_components` to discover what's available, `get_component` to fetch
the snippets and props for a specific component, and `list_themes` to surface
the runtime `data-theme` switcher options.

## CLI

```bash
brut-mcp           # run the stdio server (used by MCP clients)
brut-mcp --help    # show help
brut-mcp --version # print the @brut/mcp version
```

## License

MIT — see the BRUT UI repo for the full license text.
