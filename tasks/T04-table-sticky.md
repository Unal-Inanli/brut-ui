# T04 — table-sticky

You are unit **4 of 20** in a parallel batch building an advanced table component for a vanilla HTML/CSS/JS UI kit.

## Overall goal

Build out an advanced data-table with vast features. Each unit is one decorator on top of the existing `<table class="brut-table">`. Your unit is independent — you do **NOT** modify [src/js/components/table.js](../src/js/components/table.js) or the existing `.brut-table*` CSS block at [src/components.css:380-438](../src/components.css).

## Your unit — sticky header & first column (pure CSS)

A scroll wrapper + two modifiers that pin the table header and/or first column when scrolling. Uses `position: sticky` only — no JS.

**Classes to introduce:**

- `.brut-table-wrap` — overflow scroll wrapper. Sets `overflow: auto`, max-height via inline style or `--brut-table-max-h` custom property, ink border, `--shadow-md`.
- `.brut-table--sticky-head` — modifier on `<table>`. Makes `<thead>` `<th>` cells `position: sticky; top: 0; z-index: 2;` with the existing ink background preserved.
- `.brut-table--sticky-col` — pins the **first** `<td>`/`<th>` in each row (`position: sticky; left: 0; z-index: 1;`). Combined with `--sticky-head`, the top-left cell needs `z-index: 3`.

**No JS file.** Pure CSS.

## Files to create

1. **CSS append** — banner `TABLE — STICKY` in [src/components.css](../src/components.css):
   - `.brut-table-wrap { overflow: auto; border: var(--bw-3) solid var(--ink); box-shadow: var(--shadow-md); background: var(--paper); }`
   - When `.brut-table-wrap` contains a `.brut-table`, the table loses its own border (use a descendant selector to set `border: 0` only inside the wrap so non-wrapped tables stay bordered).
   - `.brut-table--sticky-head thead th { position: sticky; top: 0; z-index: 2; }`
   - `.brut-table--sticky-col td:first-child, .brut-table--sticky-col th:first-child { position: sticky; left: 0; z-index: 1; background: var(--paper-2); }`
   - For combined sticky-head + sticky-col, top-left cell: `.brut-table--sticky-head.brut-table--sticky-col thead th:first-child { z-index: 3; }`
   - The sticky cells need an opaque background and a 4px ink right/bottom border so content underneath doesn't bleed through.

2. **Preview** — `preview/components-table-sticky.html`. Three variants in scroll wrappers (each with inline `style="max-height: 40vh;"` on `.brut-table-wrap`):
   - sticky-head only (tall, narrow)
   - sticky-col only (wide, short, many columns)
   - both (tall + wide, scroll in both directions)

3. **Docs append** — sidebar `<a href="#table-sticky">Table — Sticky</a>` + `<section id="table-sticky">` with `<h2>`, lead, live preview (a wrapped table you can scroll inside the docs preview), snippet.

## Hard constraints (paste-verbatim from AGENTS.md)

- No JS frameworks, JSX, transpilers, preprocessors, new deps.
- **No hex / px / rem outside [src/tokens.css](../src/tokens.css).**
- No gradients, `rgba()` shadows, blurred shadows. Hard offset only.
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
   - Navigate to `file://<ABS>/preview/components-table-sticky.html`.
   - Use `mcp__Claude_in_Chrome__javascript_tool` to scroll the wrapper: `document.querySelector('.brut-table-wrap').scrollTop = 200;`
   - `read_page` — confirm `<thead>` cells stay visible at top (and/or first column at left).
   - `read_console_messages` — no errors.
   - Also load `file://<ABS>/docs/index.html#table-sticky`.
4. **Screenshot** the scrolled-state preview; embed path in PR.

## Worker instructions (verbatim)

After you finish implementing the change:

1. **Simplify** — Invoke the `Skill` tool with `skill: "simplify"`.
2. **Run unit tests** — No test suite. `bash build.sh` exit 0 + non-zero dist/* + constraint greps.
3. **Test end-to-end** — Follow the e2e recipe above.
4. **Commit and push** — Commit (`feat(table-sticky): add sticky-head and sticky-col modifiers`), push, `gh pr create`.
5. **Report** — End with `PR: <url>` (or `PR: none — <reason>`).
