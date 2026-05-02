# Advanced Table — task batch

20 self-contained units that build out an advanced data-table component on top of the existing `[data-brut="table"]` (which already does click-to-sort + select-all).

## How to hand off

Each `T##-*.md` file is **self-contained** — pass it verbatim to a subagent (or paste into a fresh chat). No file depends on another file landing first. Workers should be spawned in their own git worktree off `master` and produce a single PR each.

```
# example handoff — one worker per unit
cat tasks/T05-table-pagination.md   # full brief
# spawn an agent with that as its prompt; isolation: worktree, run in background
```

Each task ends with the same "worker instructions" block — simplify, build, e2e via chrome MCP, push, `gh pr create`, report `PR: <url>`.

## Strategy

- **Existing `table.js` is never edited.** Every unit creates a NEW JS module on its own `data-brut="…"` hook, or is pure CSS.
- **Existing `.brut-table*` block at [src/components.css:380-438](../src/components.css) is never edited.** Every unit appends a NEW banner block to the END of that file.
- **Cross-unit linkage**: decorator components find their target table via `data-brut-table="<table-id>"`. The `<table>` carries `id="<table-id>"`. No worker-to-worker coupling.
- **Merge conflicts** are expected only in `src/components.css` (append-only, easy 3-way merge) and `docs/index.html` (sidebar + section appends). Both resolve by accepting both blocks.

## Units

| # | File | Hook / classes | JS? |
|---|---|---|---|
| 1 | [T01-table-toolbar.md](T01-table-toolbar.md) | `.brut-table-toolbar` | — |
| 2 | [T02-table-caption.md](T02-table-caption.md) | `.brut-table__caption` | — |
| 3 | [T03-table-density.md](T03-table-density.md) | `data-brut="table-density"` | yes |
| 4 | [T04-table-sticky.md](T04-table-sticky.md) | `.brut-table-wrap`, `--sticky-head`, `--sticky-col` | — |
| 5 | [T05-table-pagination.md](T05-table-pagination.md) | `data-brut="table-pagination"` | yes |
| 6 | [T06-table-global-filter.md](T06-table-global-filter.md) | `data-brut="table-filter"` | yes |
| 7 | [T07-table-column-filter.md](T07-table-column-filter.md) | `data-brut="table-col-filter"` | yes |
| 8 | [T08-table-column-visibility.md](T08-table-column-visibility.md) | `data-brut="table-columns"` | yes |
| 9 | [T09-table-column-resize.md](T09-table-column-resize.md) | `data-brut="table-resize"` | yes |
| 10 | [T10-table-column-reorder.md](T10-table-column-reorder.md) | `data-brut="table-reorder"` | yes |
| 11 | [T11-table-row-expand.md](T11-table-row-expand.md) | `data-brut="table-row-expand"` | yes |
| 12 | [T12-table-row-actions.md](T12-table-row-actions.md) | `[data-brut-row-actions]` | yes |
| 13 | [T13-table-bulk-actions.md](T13-table-bulk-actions.md) | `data-brut="table-bulk"` | yes |
| 14 | [T14-table-empty.md](T14-table-empty.md) | `.brut-table__empty` | — |
| 15 | [T15-table-loading.md](T15-table-loading.md) | `.brut-table--loading`, `.brut-table__skel` | — |
| 16 | [T16-table-totals.md](T16-table-totals.md) | `.brut-table__foot`, `--sticky-foot` | — |
| 17 | [T17-table-inline-edit.md](T17-table-inline-edit.md) | `data-brut="table-edit"` | yes |
| 18 | [T18-table-export.md](T18-table-export.md) | `data-brut="table-export"` | yes |
| 19 | [T19-table-responsive.md](T19-table-responsive.md) | `.brut-table--responsive` | — |
| 20 | [T20-table-keyboard-nav.md](T20-table-keyboard-nav.md) | `data-brut="table-keys"` | yes |

## Reference (read, don't modify)

- [AGENTS.md](../AGENTS.md) — hard constraints, JS conventions
- [SKILL.md](../SKILL.md) — tokens
- [src/tokens.css](../src/tokens.css) — full token catalog
- [src/components.css:380-438](../src/components.css) — existing `.brut-table` block
- [src/js/components/table.js](../src/js/components/table.js) — existing sort + select-all
- [src/js/core.js](../src/js/core.js) — `Brut.register` API
- [src/js/components/menu.js](../src/js/components/menu.js), [popover.js](../src/js/components/popover.js), [dialog.js](../src/js/components/dialog.js) — reusable for filters / row-actions
- [preview/components-table.html](../preview/components-table.html) — existing preview shape
- [docs/index.html](../docs/index.html) — existing docs section + sidebar pattern
