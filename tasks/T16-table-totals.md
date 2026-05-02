# T16 — table-totals

You are unit **16 of 20** in a parallel batch building an advanced table component for a vanilla HTML/CSS/JS UI kit.

## Overall goal

Build out an advanced data-table with vast features. Each unit is one decorator on top of the existing `<table class="brut-table">`. Your unit is independent — you do **NOT** modify [src/js/components/table.js](../src/js/components/table.js) or the existing `.brut-table*` CSS block at [src/components.css:380-438](../src/components.css).

## Your unit — totals footer (pure CSS)

Style for `<tfoot>` rows that show column totals (sum, average, count). Visually mirrors `<thead>` weight: ink top border, slightly heavier weight, optional sticky-bottom modifier so totals stay visible while scrolling long tables.

**Classes to introduce:**

- `.brut-table__foot` — applied to `<tfoot>` (or to a `<tr>` inside `<tfoot>` if you want per-row scoping). Use `--bw-3` ink top border, `--paper-2` background, display font, uppercase, `--fs-xs`, `--tracking-wide`.
- `.brut-table__foot .brut-table__cell` — heavier weight (`--fw-bold`) and tabular numerals (`--num-tabular`)
- `.brut-table--sticky-foot` — modifier on `<table>` that sticks `<tfoot>` to the bottom (`position: sticky; bottom: 0;`). Cells inside need an opaque background so scrolling content doesn't bleed through.

**No JS file.** Pure CSS.

## Files to create

1. **CSS append** — banner `TABLE — TOTALS` in [src/components.css](../src/components.css). Implement the three classes above using only tokens. Add a 4px ink top border to `<tfoot>` cells. The sticky variant uses `position: sticky; bottom: 0; z-index: 1;` plus `background: var(--paper-2);` on `<td>` and `<th>` inside `<tfoot>`.

2. **Preview** — `preview/components-table-totals.html`. Three variants:
   - Static `<tfoot>` with sum row (e.g., "Total: $4,827").
   - Sticky `<tfoot>` inside a `.brut-table-wrap` (use `style="max-height: 40vh"` if T04 hasn't landed yet — fallback to inline overflow:auto wrapper).
   - Multi-row `<tfoot>` (sum, average, count).

3. **Docs append** — sidebar `<a href="#table-totals">Table — Totals</a>` + `<section id="table-totals">` with `<h2>`, lead, live preview, snippet.

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
   - Navigate to `file://<ABS>/preview/components-table-totals.html`.
   - `read_page` — confirm `<tfoot>` totals render in display font with ink top border.
   - In the sticky variant, scroll the wrapper (`mcp__Claude_in_Chrome__javascript_tool`: `document.querySelector('.brut-table-wrap').scrollTop = 200;`); confirm `<tfoot>` stays pinned to bottom.
   - `read_console_messages` — no errors.
4. **Screenshot** preview; embed path in PR.

## Worker instructions (verbatim)

After you finish implementing the change:

1. **Simplify** — Invoke the `Skill` tool with `skill: "simplify"`.
2. **Run unit tests** — No test suite. `bash build.sh` exit 0 + non-zero dist/* + constraint greps.
3. **Test end-to-end** — Follow the e2e recipe above.
4. **Commit and push** — Commit (`feat(table-totals): footer totals + sticky-foot`), push, `gh pr create`.
5. **Report** — End with `PR: <url>` (or `PR: none — <reason>`).
