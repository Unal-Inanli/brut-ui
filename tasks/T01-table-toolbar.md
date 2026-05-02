# T01 — table-toolbar

You are unit **1 of 20** in a parallel batch building an advanced table component for a vanilla HTML/CSS/JS UI kit.

## Overall goal

Build out an advanced data-table with vast features (pagination, filtering, column ops, row expand, bulk actions, etc.). Each unit is one decorator on top of the existing `<table class="brut-table">`. Your unit is independent — you do **NOT** modify [src/js/components/table.js](../src/js/components/table.js) or the existing `.brut-table*` CSS block at [src/components.css:380-438](../src/components.css).

## Your unit — table toolbar (pure CSS)

A horizontal shell that sits **above** a table. Holds three slots: title (left), search/filters (middle), action buttons (right). Hard ink border, hard offset shadow, matches the existing brutalist visual language.

**Classes to introduce:**

- `.brut-table-toolbar` — wrapper (flex row)
- `.brut-table-toolbar__title` — left slot (display font label + optional `<span>` count)
- `.brut-table-toolbar__search` — middle slot (flex 1, holds an input)
- `.brut-table-toolbar__actions` — right slot (button group)
- `.brut-table-toolbar--bare` — modifier without border/shadow (when toolbar sits inside a card)

**No JS file.** Pure CSS + structure.

## Files to create

1. **CSS append** — append a new banner block to the END of [src/components.css](../src/components.css):
   ```
   /* ============================================================
      TABLE — TOOLBAR
   ============================================================ */
   .brut-table-toolbar { … }
   .brut-table-toolbar__title { … }
   .brut-table-toolbar__search { … }
   .brut-table-toolbar__actions { … }
   .brut-table-toolbar--bare { … }
   ```
   Use only tokens from [src/tokens.css](../src/tokens.css). The toolbar should sit flush against the top of the table (no gap), with a bottom border that meets the table's top border. Ink border 4px (`--bw-3`), offset shadow `--shadow-sm`, paper background, padding `--sp-3` `--sp-4`.

2. **Preview** — new file `preview/components-table-toolbar.html`. Boilerplate:
   ```html
   <!doctype html>
   <html><head><meta charset="utf-8"/>
   <title>Table — Toolbar</title>
   <link rel="stylesheet" href="../dist/brut.css"/>
   <script src="../dist/brut.js" defer></script></head>
   <body style="padding: var(--sp-6);">
     <h1>Table — Toolbar</h1>
     <!-- 3 variants: full toolbar, title-only, bare modifier -->
   </body></html>
   ```
   Render: (a) full toolbar with title "Customers (1,284)", a `.brut-input` search field, two `.brut-btn` action buttons; (b) title-only (just `.brut-table-toolbar__title`); (c) `--bare` variant.

3. **Docs append** — append to [docs/index.html](../docs/index.html):
   - Sidebar entry under the "Components" group: `<a href="#table-toolbar">Table — Toolbar</a>`
   - Section:
     ```html
     <section class="docs-section" id="table-toolbar">
       <h2>Table — Toolbar</h2>
       <p class="lead">Header row that sits above a <code>.brut-table</code>. Three slots: title, search, actions.</p>
       <div class="docs-preview"><!-- live render of full toolbar + table below it --></div>
       <pre class="docs-snippet">&lt;div class="brut-table-toolbar"&gt; … &lt;/div&gt;</pre>
     </section>
     ```

## Hard constraints (paste-verbatim from AGENTS.md)

- No JS frameworks. No React, Vue, Svelte, jQuery, Alpine, htmx, etc.
- No JSX, no transpilers, no preprocessors.
- No new dependencies. Do not edit `package.json`.
- **No hex / px / rem outside [src/tokens.css](../src/tokens.css)**. Use only existing tokens. If you genuinely need a new token, STOP and ask — do not invent.
- No gradients. No `rgba()` shadows. No blurred shadows. Shadows are hard offset only: `Xpx Ypx 0 0 var(--ink)` — use `--shadow-xs..2xl`.
- No rounded corners beyond `--r-0..3` (8px max).
- No animation longer than 140ms. Snap, don't ease — `transition: … var(--dur-fast) var(--ease-snap)`.
- Borders are 4px ink (`--bw-3`); 3px small (`--bw-2`); 6-8px hero only (`--bw-4..5`).

## Tokens available (use these, do not invent values)

- **Color**: `--ink`, `--paper`, `--paper-2`, `--bone`, `--concrete-50..500`, `--primary`, `--primary-soft`, `--primary-deep`, `--pop-pink`, `--pop-lime`, `--pop-blue`, `--pop-orange`, `--pop-purple`, `--pop-mint`, `--success`, `--success-bg`, `--warning`, `--warning-bg`, `--danger`, `--danger-bg`, `--info`, `--info-bg`
- **Type**: `--font-display`, `--font-sans`, `--font-mono`; `--fs-xs..6xl`; `--lh-tight/snug/normal/loose`; `--tracking-tightest..widest`; `--fw-regular/medium/semibold/bold/display`; `--num-tabular`
- **Border**: `--bw-1..5`
- **Radius**: `--r-0..3`
- **Shadow**: `--shadow-xs..2xl`
- **Spacing**: `--sp-1..20`
- **Motion**: `--ease-snap`, `--ease-instant`; `--dur-fast`, `--dur-base`, `--dur-slow`

## E2E test recipe

1. **Build**: `bash build.sh` — must exit 0; `dist/brut.css` and `dist/brut.js` non-zero bytes.
2. **Constraint greps** — must each return empty (other than allowed token references):
   - `grep -nE "rgba\\(|linear-gradient|radial-gradient" src/components.css`
   - `grep -rE "import .* from |require\\(|React|jsx|text/babel" src/ docs/ preview/`
   - In your appended CSS banner only: confirm no `#[0-9a-f]{3,8}`, no bare `[0-9]+px`, no bare `[0-9.]+rem`.
3. **Browser smoke** via the `claude-in-chrome` MCP:
   - `mcp__Claude_in_Chrome__list_connected_browsers` — confirm a browser is connected. If none, install/connect once and retry; otherwise document the skip.
   - `mcp__Claude_in_Chrome__navigate` to `file://<ABS_WORKTREE_PATH>/preview/components-table-toolbar.html`
   - `mcp__Claude_in_Chrome__read_page` — confirm the 3 variants render with title text, search input, and action buttons visible.
   - `mcp__Claude_in_Chrome__read_console_messages` — must show **no errors**.
   - Also navigate to `file://<ABS_WORKTREE_PATH>/docs/index.html#table-toolbar` and confirm the new docs section renders.
4. **Screenshot** the preview page and embed the path in the PR description.

If `claude-in-chrome` is unavailable, fall back to `python3 -m http.server` + `curl` to confirm assets serve (no 404 on `../dist/brut.css`); note the skip in the PR description.

## Worker instructions (verbatim)

After you finish implementing the change:

1. **Simplify** — Invoke the `Skill` tool with `skill: "simplify"` to review and clean up your changes.
2. **Run unit tests** — There is no test suite in this repo. Substitute: run `bash build.sh` and confirm exit 0 + non-zero `dist/brut.css` / `dist/brut.js`. Run the constraint greps from the e2e recipe.
3. **Test end-to-end** — Follow the e2e recipe above. Use the `claude-in-chrome` MCP to open your new preview file and read the console.
4. **Commit and push** — Commit all changes with a clear message (`feat(table-toolbar): add toolbar shell above tables`), push the branch, and create a PR with `gh pr create`. Use a descriptive title.
5. **Report** — End with a single line: `PR: <url>` so the coordinator can track it. If no PR was created, end with `PR: none — <reason>`.
