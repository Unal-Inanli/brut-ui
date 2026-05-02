# T02 — table-caption

You are unit **2 of 20** in a parallel batch building an advanced table component for a vanilla HTML/CSS/JS UI kit.

## Overall goal

Build out an advanced data-table with vast features (pagination, filtering, column ops, row expand, bulk actions, etc.). Each unit is one decorator on top of the existing `<table class="brut-table">`. Your unit is independent — you do **NOT** modify [src/js/components/table.js](../src/js/components/table.js) or the existing `.brut-table*` CSS block at [src/components.css:380-438](../src/components.css).

## Your unit — table caption (pure CSS)

A title row that lives **inside** the table, above `<thead>` (or via the standard HTML `<caption>` element). Renders the table title using the display font + xs uppercase, with optional subtitle line.

**Classes to introduce:**

- `.brut-table__caption` — applies to a `<caption>` element or a top `<tr>` cell that spans all columns
- `.brut-table__caption-title` — main title (display font, uppercase, fs-lg)
- `.brut-table__caption-subtitle` — secondary line (sans, fs-sm, concrete-400 color)
- `.brut-table__caption--center` — modifier centers text instead of left-aligning

**No JS file.** Pure CSS.

## Files to create

1. **CSS append** — append a new banner block to the END of [src/components.css](../src/components.css):
   ```
   /* ============================================================
      TABLE — CAPTION
   ============================================================ */
   .brut-table__caption { … }
   .brut-table__caption-title { … }
   .brut-table__caption-subtitle { … }
   .brut-table__caption--center { … }
   ```
   Use only tokens. The caption must look like a brutalist title block: ink bottom border (`--bw-3`), paper background, padding `--sp-4` `--sp-5`. Title uses `--font-display`, `--fs-lg`, `--tracking-wide`. Subtitle uses `--font-sans`, `--fs-sm`, color `--concrete-400`. The native `<caption>` defaults to `caption-side: top` so this works as-is.

2. **Preview** — new file `preview/components-table-caption.html`. Boilerplate:
   ```html
   <!doctype html>
   <html><head><meta charset="utf-8"/>
   <title>Table — Caption</title>
   <link rel="stylesheet" href="../dist/brut.css"/>
   <script src="../dist/brut.js" defer></script></head>
   <body style="padding: var(--sp-6);">
     <h1>Table — Caption</h1>
     <!-- 3 variants: title only, title + subtitle, centered -->
   </body></html>
   ```

3. **Docs append** — append to [docs/index.html](../docs/index.html):
   - Sidebar entry: `<a href="#table-caption">Table — Caption</a>`
   - Section `<section class="docs-section" id="table-caption">` with `<h2>`, `<p class="lead">`, `<div class="docs-preview">`, and `<pre class="docs-snippet">` showing the HTML pattern with `<caption class="brut-table__caption">`.

## Hard constraints (paste-verbatim from AGENTS.md)

- No JS frameworks, JSX, transpilers, preprocessors, new deps.
- **No hex / px / rem outside [src/tokens.css](../src/tokens.css).**
- No gradients, `rgba()` shadows, blurred shadows. Shadows: hard offset only.
- No rounded corners beyond `--r-0..3`.
- No animation longer than 140ms. Snap, don't ease.
- Borders are 4px ink (`--bw-3`); 3px small (`--bw-2`).

## Tokens available

- **Color**: `--ink`, `--paper`, `--paper-2`, `--bone`, `--concrete-50..500`, `--primary*`, `--pop-*`, `--success*`, `--warning*`, `--danger*`, `--info*`
- **Type**: `--font-display`, `--font-sans`, `--font-mono`; `--fs-xs..6xl`; `--lh-tight/snug/normal/loose`; `--tracking-tightest..widest`; `--fw-regular/medium/semibold/bold/display`; `--num-tabular`
- **Border**: `--bw-1..5`  •  **Radius**: `--r-0..3`  •  **Shadow**: `--shadow-xs..2xl`  •  **Spacing**: `--sp-1..20`  •  **Motion**: `--ease-snap`, `--dur-fast`, `--dur-base`, `--dur-slow`

## E2E test recipe

1. **Build**: `bash build.sh` — must exit 0; `dist/brut.css` and `dist/brut.js` non-zero bytes.
2. **Constraint greps**:
   - `grep -nE "rgba\\(|linear-gradient|radial-gradient" src/components.css`
   - `grep -rE "import .* from |require\\(|React|jsx|text/babel" src/ docs/ preview/`
   - In your appended CSS banner only: confirm no untokenized hex/px/rem.
3. **Browser smoke** via the `claude-in-chrome` MCP:
   - Confirm a connected browser; navigate to `file://<ABS_WORKTREE_PATH>/preview/components-table-caption.html`.
   - `mcp__Claude_in_Chrome__read_page` — confirm 3 variants render with caption text visible.
   - `mcp__Claude_in_Chrome__read_console_messages` — must show **no errors**.
   - Also navigate to `file://<ABS_WORKTREE_PATH>/docs/index.html#table-caption`.
4. **Screenshot** the preview page and embed the path in the PR description.

If `claude-in-chrome` is unavailable, fall back to a static server + curl; note the skip.

## Worker instructions (verbatim)

After you finish implementing the change:

1. **Simplify** — Invoke the `Skill` tool with `skill: "simplify"`.
2. **Run unit tests** — No test suite. Substitute: `bash build.sh` exit 0 + non-zero dist/* + constraint greps.
3. **Test end-to-end** — Follow the e2e recipe above via `claude-in-chrome`.
4. **Commit and push** — Commit (`feat(table-caption): add caption row inside tables`), push, `gh pr create`.
5. **Report** — End with `PR: <url>` (or `PR: none — <reason>`).
