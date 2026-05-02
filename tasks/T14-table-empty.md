# T14 — table-empty

You are unit **14 of 20** in a parallel batch building an advanced table component for a vanilla HTML/CSS/JS UI kit.

## Overall goal

Build out an advanced data-table with vast features. Each unit is one decorator on top of the existing `<table class="brut-table">`. Your unit is independent — you do **NOT** modify [src/js/components/table.js](../src/js/components/table.js) or the existing `.brut-table*` CSS block at [src/components.css:380-438](../src/components.css).

## Your unit — empty state row (pure CSS)

A single `<tr class="brut-table__empty">` placed inside `<tbody>` whose one `<td>` spans all columns and shows a "no results" message. Visually matches the kit's existing `.brut-empty` voice: display-font headline, body subtext, optional small action.

**Classes to introduce:**

- `.brut-table__empty` — the row class (the cell within spans all columns via `colspan`)
- `.brut-table__empty-cell` — the spanning cell (centered text, paper-2 bg, `--sp-12` `--sp-6` padding)
- `.brut-table__empty-title` — display font, `--fs-xl`, uppercase, ink color
- `.brut-table__empty-body` — sans, `--fs-sm`, `--concrete-400`

**Visibility convention** (no JS): the empty row is always present in markup but hidden by default via the standard `hidden` HTML attribute; the page or an upstream decorator un-hides it when `<tbody>` has no other visible rows.

**No JS file.** Pure CSS + structure.

## Files to create

1. **CSS append** — banner `TABLE — EMPTY` in [src/components.css](../src/components.css). Implement the four classes above using only tokens. Add a hard ink top border `--bw-3` to the empty cell so it visually closes the table.

2. **Preview** — `preview/components-table-empty.html`. Two variants:
   - A table with a visible empty row (`<tr class="brut-table__empty"><td class="brut-table__empty-cell" colspan="4"><div class="brut-table__empty-title">No results</div><div class="brut-table__empty-body">Try widening your filters or clear the search.</div><button class="brut-btn">Clear filters</button></td></tr>`)
   - A table with normal rows + a hidden empty row (`hidden` attr) that you can toggle visible via a button (small inline `<script>` in the preview only — no new component).

3. **Docs append** — sidebar `<a href="#table-empty">Table — Empty</a>` + `<section id="table-empty">` with `<h2>`, lead, live preview, snippet.

## Hard constraints (paste-verbatim from AGENTS.md)

- No JS frameworks, JSX, transpilers, preprocessors, new deps.
- **No hex / px / rem outside [src/tokens.css](../src/tokens.css).**
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
   - Your appended CSS only: no untokenized hex/px/rem.
3. **Browser smoke** via `claude-in-chrome`:
   - Navigate to `file://<ABS>/preview/components-table-empty.html`.
   - `read_page` — confirm the empty-state title + body + button render in variant 1.
   - In variant 2, click "Show empty" (inline script) and confirm the empty row reveals.
   - `read_console_messages` — no errors.
4. **Screenshot** preview; embed path in PR.

## Worker instructions (verbatim)

After you finish implementing the change:

1. **Simplify** — Invoke the `Skill` tool with `skill: "simplify"`.
2. **Run unit tests** — No test suite. `bash build.sh` exit 0 + non-zero dist/* + constraint greps.
3. **Test end-to-end** — Follow the e2e recipe above.
4. **Commit and push** — Commit (`feat(table-empty): empty-state row`), push, `gh pr create`.
5. **Report** — End with `PR: <url>` (or `PR: none — <reason>`).
