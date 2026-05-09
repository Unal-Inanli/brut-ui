# Migration guide

> Practical upgrade notes for `@sprtn/ui` consumers. Each section lists renamed
> classes, removed components, and breaking event-shape changes between
> releases. Pair this with `CHANGELOG.md` for the full release narrative.

## How to use this guide

1. Identify the version you upgraded **from** in your `package.json`.
2. Read every section between that version and your target version.
3. Apply the find-and-replace tables to your codebase. Where automated, the
   `npx brut migrate` command handles the rename in-place (M6 milestone work).

## 1.x

### Package rename (1.0.0)

The npm package name moved from `brut` to `@sprtn/ui` at the 1.0.0 cut,
aligning with the `@sprtn/mcp` server. The runtime contract is unchanged —
drop `brut.css` and `brut.js` into a page and write `.brut-*` classes as
before. Only your `package.json` dependency entry and any `import` paths
need updating:

| Old import                | New import                |
|---------------------------|---------------------------|
| `import 'brut/css'`       | `import '@sprtn/ui/css'`  |
| `import 'brut'`            | `import '@sprtn/ui'`      |

### Class renames (1.0.0)

Pagination renamed from the legacy `pager` shorthand to its full noun so the
class root matches the `data-brut="pagination"` hook (see
`ARCHITECTURE.md §D4` for why class root === hook is load-bearing).

| Old class             | New class                | Notes |
|-----------------------|--------------------------|-------|
| `.brut-pager`         | `.brut-pagination`       | Renamed for hook/class parity. |
| `.brut-pager__btn`    | `.brut-pagination__btn`  | Sub-element follows the root rename. |
| `data-brut="pager"`   | `data-brut="pagination"` | Update both the class and the hook. |

### Removed components (1.3.1)

Three table sub-components were dropped because they encoded
application-level concerns rather than UI primitives. The core
`.brut-table` component is unchanged.

| Old class               | Replacement |
|-------------------------|-------------|
| `.brut-table-toolbar`   | Compose your own toolbar above the table — typically a `.brut-bar` wrapping `.brut-input`, `.brut-select`, and action buttons. Toolbar layout is application-specific. |
| `.brut-table-filter`    | Compose `.brut-input` (search) or `.brut-select` (column filter) above the table; wire it to your data source directly. |
| `.brut-table-columns`   | No replacement — column visibility is a data-grid concern, not a UI-kit one. Build it from `.brut-checkbox` + `.brut-popover` if you need it. |

### Event contract changes (1.x)

| Component | Change | Action |
|-----------|--------|--------|
| `table`   | Sort changes split off from `brut:change` onto a dedicated `brut:sort` event. `brut:change` is now selection-only. | Subscribe to `brut:sort` for sort changes; keep `brut:change` listeners for row selection only. |
| `accordion` | `brut:open` / `brut:close` now dispatched alongside the existing `brut:change` on each toggled item. | Optional — consumers can switch to the semantic events for parity with `dialog` / `drawer` / `menu` / `popover`. The `brut:change` event is unchanged. |

### Build pipeline (1.0.0)

`bash build.sh` is now a thin shim over `vite build`, and `pnpm dev` provides
HMR for the preview pages. Consumers using the prebuilt `dist/brut.css` and
`dist/brut.js` files are unaffected. Contributors building from source should
switch to `pnpm build`.

### Tokens reorganized (1.0.0)

`src/tokens.css` was split into three layers:

- `src/tokens/01-primitives.css` — raw color, type, and spacing values.
- `src/tokens/02-semantic.css` — named roles (`--paper`, `--ink`, `--accent-*`).
- `src/tokens/03-intent.css` — component-scoped tokens (`--btn-bg`, `--input-border`, …).

The CSS variable names are unchanged. If you authored a custom theme by
overriding individual variables, no action is needed. If you forked
`tokens.css` wholesale, re-fork from the new layered files.

## Pending (proposed for the next minor)

The following renames are documented in `ARCHITECTURE.md §D4` but have not
yet shipped. They will appear in this guide when the rename lands; consumers
adopting the new name now will receive an automatic alias for one minor
release after the rename.

| Pending class              | Direction              | Reason |
|----------------------------|------------------------|--------|
| `.brut-tip`                | → `.brut-tooltip`      | Class root should match the `data-brut="tooltip"` hook. |
| `.brut-field__counter`     | → `.brut-counter`      | Counter is registered as `data-brut="counter"` but lives under a BEM sub-element class; hook/class parity demands a top-level root. |

## Automated migration

`npx brut migrate` (M6 CLI work) will scan a consumer codebase and rewrite
known renames in-place. Run it with `--dry-run` first to preview changes:

```sh
npx brut migrate --dry-run
npx brut migrate
```

The migrate command reads from the same rename table as this document, so
keeping it open during an upgrade pass is rarely necessary — but the tables
above remain authoritative for manual edits and code review.

## Reporting an undocumented breaking change

Open an issue with the `migration` label including:

1. Version you upgraded from and to.
2. The exact class / event / attribute that changed.
3. Whether your code referenced the old or new shape.

We backfill these into the matching version's section.
