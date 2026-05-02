# T20 — table-keyboard-nav

You are unit **20 of 20** in a parallel batch building an advanced table component for a vanilla HTML/CSS/JS UI kit.

## Overall goal

Build out an advanced data-table with vast features. Each unit is one decorator on top of the existing `<table class="brut-table">`. Your unit is independent — you do **NOT** modify [src/js/components/table.js](../src/js/components/table.js) or the existing `.brut-table*` CSS block at [src/components.css:380-438](../src/components.css).

## Your unit — cell-level keyboard navigation (CSS + JS)

Arrow keys move focus between cells. Home/End jump to row start/end. PgUp/PgDn jump to first/last row of the body. Cells are made focusable lazily: the JS only adds `tabindex="0"` to cells the first time they receive focus (or on init for a single seed cell). Visual focus uses an offset shadow + ink ring.

**Hook**: `data-brut="table-keys"` on a `<table>`.

**Classes to introduce:**

- `.brut-table--keys` — modifier on `<table>` (added by JS at init) enabling the focused-cell visual style
- `.brut-table__cell:focus` — focus visual: `outline: var(--bw-2) solid var(--ink); outline-offset: -var(--bw-2);` and slight lift via `box-shadow: var(--shadow-xs) inset` (or just an outline if simpler).

## Files to create

1. **CSS append** — banner `TABLE — KEYBOARD NAV` in [src/components.css](../src/components.css). Add the focus visual scoped under `.brut-table--keys` so it doesn't leak into the existing table style. Use only tokens.

2. **JS** — new file `src/js/components/table-keys.js`:
   ```js
   (function () {
     Brut.register('table-keys', {
       selector: '[data-brut="table-keys"]',
       init: function (table) {
         table.classList.add('brut-table--keys');

         function visibleCells(tr) {
           return Array.prototype.slice.call(tr.children).filter(function (td) {
             return td.offsetParent !== null && !td.hasAttribute('hidden');
           });
         }
         function visibleRows() {
           return Array.prototype.slice.call(table.querySelectorAll('tbody tr')).filter(function (tr) {
             return !tr.hasAttribute('hidden') && !tr.hasAttribute('data-brut-row-expansion');
           });
         }

         function ensureFocusable(cell) {
           if (cell && !cell.hasAttribute('tabindex')) cell.setAttribute('tabindex', '0');
         }

         // Seed: make the first body cell focusable
         var seedRow = visibleRows()[0];
         if (seedRow) {
           var seedCell = visibleCells(seedRow)[0];
           ensureFocusable(seedCell);
         }

         table.addEventListener('keydown', function (e) {
           var cell = e.target.closest('td, th');
           if (!cell || !table.contains(cell)) return;
           var row = cell.parentElement;
           var rows = visibleRows();
           var rowIndex = rows.indexOf(row);
           var cells = visibleCells(row);
           var cellIndex = cells.indexOf(cell);

           function moveTo(r, c) {
             if (!r) return;
             var rc = visibleCells(r);
             var target = rc[Math.max(0, Math.min(rc.length - 1, c))];
             if (target) { ensureFocusable(target); target.focus(); e.preventDefault(); }
           }

           switch (e.key) {
             case 'ArrowRight': moveTo(row, cellIndex + 1); break;
             case 'ArrowLeft':  moveTo(row, cellIndex - 1); break;
             case 'ArrowDown':
               if (rowIndex >= 0) moveTo(rows[rowIndex + 1], cellIndex);
               break;
             case 'ArrowUp':
               if (rowIndex >= 0) moveTo(rows[rowIndex - 1], cellIndex);
               break;
             case 'Home': moveTo(row, 0); break;
             case 'End':  moveTo(row, cells.length - 1); break;
             case 'PageUp':   moveTo(rows[0], cellIndex); break;
             case 'PageDown': moveTo(rows[rows.length - 1], cellIndex); break;
             default: return;
           }
         });
       }
     });
   })();
   ```

3. **Preview** — `preview/components-table-keyboard.html`. A 6-row, 5-column table with `data-brut="table-keys"`. Add a small instructions block ("Click any cell, then use arrows / Home / End / PgUp / PgDn"). Show via instructions that focus moves between cells.

4. **Docs append** — sidebar `<a href="#table-keys">Table — Keyboard Nav</a>` + `<section id="table-keys">` with `<h2>`, lead, live preview, snippet.

## Hard constraints (paste-verbatim from AGENTS.md)

- No JS frameworks, JSX, transpilers, preprocessors, new deps.
- **No hex / px / rem outside [src/tokens.css](../src/tokens.css).**
- No gradients, `rgba()` shadows, blurred shadows.
- No rounded corners beyond `--r-0..3`.
- No animation longer than 140ms.
- Borders are 4px ink (`--bw-3`); 3px small (`--bw-2`).

## JavaScript rules

- Single IIFE. Register via `Brut.register('table-keys', { selector: '[data-brut="table-keys"]', init })`.
- Hook on `data-brut="table-keys"` — never on a class.
- No imports, requires, or CDN.
- Add `tabindex="0"` lazily to cells (only the seed cell on init; others on first focus via the moveTo helper).
- This unit does NOT need to mirror state to a hidden input (no committed state).
- This unit does NOT need to dispatch `brut:change` (no committed state).

## Cross-unit convention

Decorator components find their target table via `data-brut-table="<table-id>"`, except table-scoped decorators (this one) attach directly to the `<table>`. Keyboard nav respects `hidden` rows (filter/pagination) and skips `data-brut-row-expansion` rows.

## Tokens available

Color: `--ink`, `--paper`, `--paper-2`, `--bone`, `--concrete-50..500`, `--primary*`, `--pop-*`, `--success*`, `--warning*`, `--danger*`, `--info*` • Type: `--font-display/sans/mono`, `--fs-xs..6xl`, `--lh-*`, `--tracking-*`, `--fw-*`, `--num-tabular` • Border: `--bw-1..5` • Radius: `--r-0..3` • Shadow: `--shadow-xs..2xl` • Spacing: `--sp-1..20` • Motion: `--ease-snap`, `--ease-instant`, `--dur-fast/base/slow`

## E2E test recipe

1. **Build**: `bash build.sh` — exit 0; `dist/brut.css`/`dist/brut.js` non-zero.
2. **Constraint greps**:
   - `grep -nE "rgba\\(|linear-gradient|radial-gradient" src/components.css`
   - `grep -rE "import .* from |require\\(|React|jsx|text/babel" src/ docs/ preview/`
   - Your appended CSS only: no untokenized hex/px/rem.
3. **Browser smoke** via `claude-in-chrome`:
   - Navigate to `file://<ABS>/preview/components-table-keyboard.html`.
   - Focus the seed cell via `mcp__Claude_in_Chrome__javascript_tool`: `document.querySelector('tbody tr td').focus();`
   - Dispatch ArrowRight; read `document.activeElement` — confirm it's the next cell in the same row.
   - Dispatch ArrowDown; confirm it's the cell directly below.
   - Dispatch End; confirm it's the last cell of the row.
   - Dispatch PageDown; confirm it's a cell in the last row.
   - `read_console_messages` — no errors.
4. **Screenshot** preview with a focus ring visible on a cell; embed path in PR.

## Worker instructions (verbatim)

After you finish implementing the change:

1. **Simplify** — Invoke the `Skill` tool with `skill: "simplify"`.
2. **Run unit tests** — No test suite. `bash build.sh` exit 0 + non-zero dist/* + constraint greps.
3. **Test end-to-end** — Follow the e2e recipe above.
4. **Commit and push** — Commit (`feat(table-keys): cell-level keyboard navigation`), push, `gh pr create`.
5. **Report** — End with `PR: <url>` (or `PR: none — <reason>`).
