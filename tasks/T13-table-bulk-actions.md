# T13 — table-bulk-actions

You are unit **13 of 20** in a parallel batch building an advanced table component for a vanilla HTML/CSS/JS UI kit.

## Overall goal

Build out an advanced data-table with vast features. Each unit is one decorator on top of the existing `<table class="brut-table">`. Your unit is independent — you do **NOT** modify [src/js/components/table.js](../src/js/components/table.js) or the existing `.brut-table*` CSS block at [src/components.css:380-438](../src/components.css).

## Your unit — bulk actions toolbar (CSS + JS)

A toolbar that becomes visible when one or more rows are selected. Listens for select-state changes from the existing `[data-brut="table"]` (`brut:change` events with `selectAll`) and from individual row checkboxes (`[data-brut-row-select]`). Shows the count + a button group ("Delete", "Export", "Archive"). Each button dispatches `brut:bulk` `{ action, count, rows }` for page-level wiring.

**Hook**: `data-brut="table-bulk"` on a wrapper element.

**Linked table**: `data-brut-table="<table-id>"`.

**Classes to introduce:**

- `.brut-table-bulk` — the toolbar shell (ink border, paper bg, `--shadow-md`, padding `--sp-3` `--sp-4`)
- `.brut-table-bulk--shown` — modifier that reveals the toolbar (default: `display: none` when no rows selected; toggle via class). No fade — instant show.
- `.brut-table-bulk__count` — the "3 selected" label (display font, fs-sm, uppercase)
- `.brut-table-bulk__actions` — the right-side button group

## Files to create

1. **CSS append** — banner `TABLE — BULK ACTIONS` in [src/components.css](../src/components.css). Style the toolbar (flex row, gap `--sp-3`), the count label (display font), and `--shown` (`display: flex`). Default is `display: none`.

2. **JS** — new file `src/js/components/table-bulk.js`:
   ```js
   (function () {
     Brut.register('table-bulk', {
       selector: '[data-brut="table-bulk"]',
       init: function (el) {
         var tableId = el.getAttribute('data-brut-table');
         var table = tableId ? document.getElementById(tableId) : null;
         if (!table) return;
         var name = el.getAttribute('data-brut-name') || 'selected';
         var hidden = el.querySelector('input[type="hidden"][data-brut-bulk-state]');
         if (!hidden) {
           hidden = document.createElement('input');
           hidden.type = 'hidden';
           hidden.setAttribute('data-brut-bulk-state', '');
           hidden.name = name;
           el.appendChild(hidden);
         }
         var countEl = el.querySelector('.brut-table-bulk__count');

         function selectedRows() {
           return Array.prototype.slice.call(table.querySelectorAll('tbody tr'))
             .filter(function (tr) {
               var cb = tr.querySelector('[data-brut-row-select] input[type="checkbox"], input[type="checkbox"][data-brut-row-select]');
               if (!cb) return false;
               // Some rows wrap the checkbox in a .brut-cb container; the source of truth is the input
               return cb.checked;
             });
         }

         function update() {
           var rows = selectedRows();
           var count = rows.length;
           if (count > 0) el.classList.add('brut-table-bulk--shown');
           else el.classList.remove('brut-table-bulk--shown');
           if (countEl) countEl.textContent = count + ' selected';
           var keys = rows.map(function (r) { return r.getAttribute('data-row-key') || r.rowIndex; });
           hidden.value = keys.join(',');
           el.dispatchEvent(new CustomEvent('brut:change', { detail: { count: count, rows: rows }, bubbles: true }));
         }

         // Listen on the table for changes from existing table.js (select-all) AND any row-checkbox change
         table.addEventListener('change', function (e) {
           if (e.target && (e.target.matches('[data-brut-row-select]') || e.target.closest('[data-brut-row-select]'))) update();
         });
         table.addEventListener('brut:change', function () { update(); });

         // Wire bulk action buttons
         var actions = el.querySelectorAll('[data-brut-bulk-action]');
         actions.forEach(function (b) {
           b.setAttribute('type', 'button');
           b.addEventListener('click', function () {
             var rows = selectedRows();
             el.dispatchEvent(new CustomEvent('brut:bulk', {
               detail: { action: b.getAttribute('data-brut-bulk-action'), count: rows.length, rows: rows },
               bubbles: true
             }));
           });
         });

         update();
       }
     });
   })();
   ```

3. **Preview** — `preview/components-table-bulk.html`. A `[data-brut="table"]` table with row checkboxes and a toolbar:
   ```html
   <div class="brut-table-bulk" data-brut="table-bulk" data-brut-table="demo">
     <span class="brut-table-bulk__count">0 selected</span>
     <div class="brut-table-bulk__actions">
       <button class="brut-btn" data-brut-bulk-action="delete">Delete</button>
       <button class="brut-btn" data-brut-bulk-action="export">Export</button>
       <button class="brut-btn" data-brut-bulk-action="archive">Archive</button>
     </div>
   </div>
   ```
   Below the table, a `<output>` listens for `brut:bulk` and logs `{ action, count }`.

4. **Docs append** — sidebar `<a href="#table-bulk">Table — Bulk Actions</a>` + `<section id="table-bulk">` with `<h2>`, lead, live preview, snippet.

## Hard constraints (paste-verbatim from AGENTS.md)

- No JS frameworks, JSX, transpilers, preprocessors, new deps.
- **No hex / px / rem outside [src/tokens.css](../src/tokens.css).**
- No gradients, `rgba()` shadows, blurred shadows.
- No rounded corners beyond `--r-0..3`.
- No animation longer than 140ms.
- Borders are 4px ink (`--bw-3`); 3px small (`--bw-2`).

## JavaScript rules

- Single IIFE. Register via `Brut.register('table-bulk', { selector: '[data-brut="table-bulk"]', init })`.
- Hook on `data-brut="table-bulk"` — never on a class.
- No imports, requires, or CDN.
- Wired buttons get `setAttribute('type','button')`.
- Mirror selected row keys (comma-joined) to a hidden `<input>` (read `data-brut-name`; default `selected`).
- Dispatch `CustomEvent('brut:change', { detail: { count, rows }, bubbles: true })` on every selection update.
- Dispatch `CustomEvent('brut:bulk', { detail: { action, count, rows }, bubbles: true })` when an action button is clicked.

## Cross-unit convention

Decorator components find their target table via `data-brut-table="<table-id>"`. The bulk toolbar listens to the existing `data-brut="table"` component's `brut:change` events plus native `change` events on row checkboxes — it does NOT reimplement selection logic.

## Tokens available

Color: `--ink`, `--paper`, `--paper-2`, `--bone`, `--concrete-50..500`, `--primary*`, `--pop-*`, `--success*`, `--warning*`, `--danger*`, `--info*` • Type: `--font-display/sans/mono`, `--fs-xs..6xl`, `--lh-*`, `--tracking-*`, `--fw-*`, `--num-tabular` • Border: `--bw-1..5` • Radius: `--r-0..3` • Shadow: `--shadow-xs..2xl` • Spacing: `--sp-1..20` • Motion: `--ease-snap`, `--ease-instant`, `--dur-fast/base/slow`

## E2E test recipe

1. **Build**: `bash build.sh` — exit 0; `dist/brut.css`/`dist/brut.js` non-zero.
2. **Constraint greps**:
   - `grep -nE "rgba\\(|linear-gradient|radial-gradient" src/components.css`
   - `grep -rE "import .* from |require\\(|React|jsx|text/babel" src/ docs/ preview/`
   - Your appended CSS only: no untokenized hex/px/rem.
3. **Browser smoke** via `claude-in-chrome`:
   - Navigate to `file://<ABS>/preview/components-table-bulk.html`.
   - Confirm the toolbar is hidden initially (no rows selected).
   - Check 2 row checkboxes; confirm the toolbar appears and count says "2 selected".
   - Click the "Delete" action; confirm the `<output>` shows `delete (count: 2)`.
   - Uncheck both rows; confirm the toolbar hides again.
   - `read_console_messages` — no errors.
4. **Screenshot** preview with rows selected + toolbar visible; embed path in PR.

## Worker instructions (verbatim)

After you finish implementing the change:

1. **Simplify** — Invoke the `Skill` tool with `skill: "simplify"`.
2. **Run unit tests** — No test suite. `bash build.sh` exit 0 + non-zero dist/* + constraint greps.
3. **Test end-to-end** — Follow the e2e recipe above.
4. **Commit and push** — Commit (`feat(table-bulk): bulk-actions toolbar on selection`), push, `gh pr create`.
5. **Report** — End with `PR: <url>` (or `PR: none — <reason>`).
