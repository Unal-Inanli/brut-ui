# T19 — table-responsive

You are unit **19 of 20** in a parallel batch building an advanced table component for a vanilla HTML/CSS/JS UI kit.

## Overall goal

Build out an advanced data-table with vast features. Each unit is one decorator on top of the existing `<table class="brut-table">`. Your unit is independent — you do **NOT** modify [src/js/components/table.js](../src/js/components/table.js) or the existing `.brut-table*` CSS block at [src/components.css:380-438](../src/components.css).

## Your unit — responsive stacked-card layout (pure CSS)

Below ~640px viewport width (or container width if `@container` is supported), `.brut-table--responsive` collapses each row into a stacked card: `<thead>` hides; each `<tr>` becomes a block; each `<td>` displays its column label as a leading line. Columns provide the label via `data-brut-col-label="…"` on the `<td>`.

**No JS file.** Pure CSS — uses `display: block` for `<tr>` and `<td>`, plus the `data-brut-col-label` attribute pseudo-element for the label.

**Classes to introduce:**

- `.brut-table--responsive` — modifier on `<table>`

**Cell label convention**: every `<td class="brut-table__cell">` carries `data-brut-col-label="<label>"`. The CSS reads the attribute via `attr()` and renders it before the cell content.

## Files to create

1. **CSS append** — banner `TABLE — RESPONSIVE` in [src/components.css](../src/components.css). Use a media query at `max-width: 640px`:
   ```css
   @media (max-width: 640px) {
     .brut-table--responsive thead { display: none; }
     .brut-table--responsive,
     .brut-table--responsive tbody,
     .brut-table--responsive tr,
     .brut-table--responsive td { display: block; width: 100%; }
     .brut-table--responsive tr {
       border: var(--bw-3) solid var(--ink);
       box-shadow: var(--shadow-sm);
       background: var(--paper);
       margin-bottom: var(--sp-3);
     }
     .brut-table--responsive td {
       padding: var(--sp-3) var(--sp-4);
       border: 0;
       border-top: var(--bw-1) solid var(--concrete-200);
     }
     .brut-table--responsive td:first-child { border-top: 0; }
     .brut-table--responsive td::before {
       content: attr(data-brut-col-label) ":\\00a0";
       font-family: var(--font-display);
       font-size: var(--fs-xs);
       text-transform: uppercase;
       letter-spacing: var(--tracking-wide);
       color: var(--concrete-400);
       display: inline-block;
       margin-right: var(--sp-2);
     }
   }
   ```
   The `\00a0` is a non-breaking space; valid CSS. No `px` outside this 640 breakpoint — and the breakpoint value `640px` is a viewport size used in a media query, not a design token; the kit's existing media queries follow the same pattern (check [src/components.css](../src/components.css) for any existing `@media` rules to confirm). If the kit defines a token for breakpoints (`--bp-sm` etc.), use that instead — search [src/tokens.css](../src/tokens.css) first.

2. **Preview** — `preview/components-table-responsive.html`. A `.brut-table.brut-table--responsive` with 8 rows; every `<td>` has `data-brut-col-label="…"`. Show that resizing the viewport below 640px collapses rows into cards (use the chrome MCP `resize_window` to verify).

3. **Docs append** — sidebar `<a href="#table-responsive">Table — Responsive</a>` + `<section id="table-responsive">` with `<h2>`, lead, live preview, snippet.

## Hard constraints (paste-verbatim from AGENTS.md)

- No JS frameworks, JSX, transpilers, preprocessors, new deps.
- **No hex / px / rem outside [src/tokens.css](../src/tokens.css).** The 640px in the `@media` query is a viewport breakpoint — check [src/tokens.css](../src/tokens.css) for an existing `--bp-sm` style token first. If the kit doesn't ship breakpoint tokens, the bare `640px` in a media query is the precedent across the codebase (verify by `grep -n "@media" src/components.css`); proceed with the bare value but flag in your PR description.
- No gradients, `rgba()` shadows, blurred shadows.
- No rounded corners beyond `--r-0..3`.
- No animation longer than 140ms.
- Borders are 4px ink (`--bw-3`); 3px small (`--bw-2`).

## Tokens available

Color: `--ink`, `--paper`, `--paper-2`, `--bone`, `--concrete-50..500`, `--primary*`, `--pop-*`, `--success*`, `--warning*`, `--danger*`, `--info*` • Type: `--font-display/sans/mono`, `--fs-xs..6xl`, `--lh-*`, `--tracking-*`, `--fw-*`, `--num-tabular` • Border: `--bw-1..5` • Radius: `--r-0..3` • Shadow: `--shadow-xs..2xl` • Spacing: `--sp-1..20` • Motion: `--ease-snap`, `--ease-instant`, `--dur-fast/base/slow`

## E2E test recipe

1. **Build**: `bash build.sh` — exit 0; `dist/brut.css` non-zero.
2. **Constraint greps**:
   - `grep -nE "rgba\\(|linear-gradient|radial-gradient" src/components.css`
   - `grep -rE "import .* from |require\\(|React|jsx|text/babel" src/ docs/ preview/`
   - Your appended CSS only: no untokenized hex/px/rem **outside the @media query** (the breakpoint is the only allowed bare px).
3. **Browser smoke** via `claude-in-chrome`:
   - Navigate to `file://<ABS>/preview/components-table-responsive.html`.
   - At default viewport, confirm normal table layout via `read_page`.
   - Use `mcp__Claude_in_Chrome__resize_window` (or `mcp__Claude_in_Chrome__javascript_tool` to set window size) to drop viewport below 640px.
   - Re-read; confirm `<thead>` hides, rows are stacked cards, and each cell shows its label prefix.
   - `read_console_messages` — no errors.
4. **Screenshot** preview at narrow width; embed path in PR.

## Worker instructions (verbatim)

After you finish implementing the change:

1. **Simplify** — Invoke the `Skill` tool with `skill: "simplify"`.
2. **Run unit tests** — No test suite. `bash build.sh` exit 0 + non-zero dist/* + constraint greps.
3. **Test end-to-end** — Follow the e2e recipe above.
4. **Commit and push** — Commit (`feat(table-responsive): stacked-card layout below 640px`), push, `gh pr create`.
5. **Report** — End with `PR: <url>` (or `PR: none — <reason>`).
