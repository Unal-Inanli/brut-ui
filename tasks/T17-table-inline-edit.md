# T17 — table-inline-edit

You are unit **17 of 20** in a parallel batch building an advanced table component for a vanilla HTML/CSS/JS UI kit.

## Overall goal

Build out an advanced data-table with vast features. Each unit is one decorator on top of the existing `<table class="brut-table">`. Your unit is independent — you do **NOT** modify [src/js/components/table.js](../src/js/components/table.js) or the existing `.brut-table*` CSS block at [src/components.css:380-438](../src/components.css).

## Your unit — click-to-edit cells (CSS + JS)

Click a cell marked `data-brut="table-edit"` to swap its text for an `<input>` (or `<select>` if `data-brut-edit-options="…"` is provided as a comma-separated list). Enter commits, Escape cancels. Updates `data-sort-value` so any sort decorator stays correct. Mirrors latest committed value to a hidden input named `cell_<rowKey>_<colKey>` (or `data-brut-name`).

**Hook**: `data-brut="table-edit"` on a `<td>`. The cell carries `data-col="<colKey>"` (already required by other column-aware units). The row carries `data-row-key="<rowKey>"`.

**Classes to introduce:**

- `.brut-table-edit--editing` — modifier on the cell while it's in edit mode (paper-2 bg, ink ring via `box-shadow: inset 0 0 0 var(--bw-2) var(--ink);`).
- `.brut-table-edit__input` — the inserted `<input>` / `<select>` (full-cell width, ink border, no shadow, `--fs-sm`).

## Files to create

1. **CSS append** — banner `TABLE — INLINE EDIT` in [src/components.css](../src/components.css). Style the editing cell + input. Cursor on idle cells is `text` (or `pointer`) to invite editing. On hover, paper-2 bg.

2. **JS** — new file `src/js/components/table-edit.js`:
   ```js
   (function () {
     Brut.register('table-edit', {
       selector: '[data-brut="table-edit"]',
       init: function (cell) {
         var row = cell.closest('tr');
         var rowKey = row && row.getAttribute('data-row-key') || '';
         var colKey = cell.getAttribute('data-col') || '';
         var name = cell.getAttribute('data-brut-name') || ('cell_' + rowKey + '_' + colKey);
         var hidden = cell.querySelector('input[type="hidden"][data-brut-edit-state]');
         if (!hidden) {
           hidden = document.createElement('input');
           hidden.type = 'hidden';
           hidden.setAttribute('data-brut-edit-state', '');
           hidden.name = name;
           hidden.value = (cell.textContent || '').trim();
           cell.appendChild(hidden);
         }

         var optionsAttr = cell.getAttribute('data-brut-edit-options');
         var options = optionsAttr ? optionsAttr.split(',').map(function (s) { return s.trim(); }) : null;

         function startEdit() {
           if (cell.classList.contains('brut-table-edit--editing')) return;
           var prev = hidden.value;
           cell.classList.add('brut-table-edit--editing');

           // Hide existing text content (keep hidden input intact)
           var children = Array.prototype.slice.call(cell.childNodes).filter(function (n) {
             return !(n.nodeType === 1 && n === hidden);
           });
           children.forEach(function (n) { cell.removeChild(n); });

           var input;
           if (options) {
             input = document.createElement('select');
             options.forEach(function (o) {
               var opt = document.createElement('option');
               opt.value = o;
               opt.textContent = o;
               if (o === prev) opt.selected = true;
               input.appendChild(opt);
             });
           } else {
             input = document.createElement('input');
             input.type = 'text';
             input.value = prev;
           }
           input.className = 'brut-table-edit__input';
           cell.insertBefore(input, hidden);
           input.focus();
           if (input.select) input.select();

           function commit(value) {
             hidden.value = value;
             cell.setAttribute('data-sort-value', value);
             cleanup();
             cell.appendChild(document.createTextNode(value));
             cell.dispatchEvent(new CustomEvent('brut:change', {
               detail: { rowKey: rowKey, colKey: colKey, value: value, prev: prev },
               bubbles: true
             }));
           }
           function cancel() {
             cleanup();
             cell.appendChild(document.createTextNode(prev));
           }
           function cleanup() {
             cell.classList.remove('brut-table-edit--editing');
             if (input.parentNode) input.parentNode.removeChild(input);
           }
           input.addEventListener('keydown', function (e) {
             if (e.key === 'Enter') { e.preventDefault(); commit(input.value); }
             else if (e.key === 'Escape') { e.preventDefault(); cancel(); }
           });
           input.addEventListener('blur', function () { commit(input.value); });
         }

         cell.addEventListener('click', function (e) {
           if (e.target === hidden) return;
           startEdit();
         });
         cell.setAttribute('tabindex', '0');
         cell.addEventListener('keydown', function (e) {
           if (e.key === 'Enter') { e.preventDefault(); startEdit(); }
         });
       }
     });
   })();
   ```

3. **Preview** — `preview/components-table-inline-edit.html`. A 6-row table where some `<td>` cells carry `data-brut="table-edit"`. Mix free-text and select cells (one column with `data-brut-edit-options="active,paused,archived"`). Show that clicking a cell swaps to an input, Enter commits, Escape cancels, hidden inputs accumulate.

4. **Docs append** — sidebar `<a href="#table-edit">Table — Inline Edit</a>` + `<section id="table-edit">` with `<h2>`, lead, live preview, snippet.

## Hard constraints (paste-verbatim from AGENTS.md)

- No JS frameworks, JSX, transpilers, preprocessors, new deps.
- **No hex / px / rem outside [src/tokens.css](../src/tokens.css).**
- No gradients, `rgba()` shadows, blurred shadows.
- No rounded corners beyond `--r-0..3`.
- No animation longer than 140ms.
- Borders are 4px ink (`--bw-3`); 3px small (`--bw-2`).

## JavaScript rules

- Single IIFE. Register via `Brut.register('table-edit', { selector: '[data-brut="table-edit"]', init })`.
- Hook on `data-brut="table-edit"` — never on a class.
- No imports, requires, or CDN.
- Mirror committed value to a hidden `<input>` (read `data-brut-name`; default `cell_<rowKey>_<colKey>`).
- Update `data-sort-value` on commit so the existing sort component sees fresh values.
- Dispatch `CustomEvent('brut:change', { detail: { rowKey, colKey, value, prev }, bubbles: true })` on commit.
- Support keyboard activation: Enter on a focused cell starts edit; Enter inside the input commits; Escape cancels.

## Cross-unit convention

Decorator components find their target table via `data-brut-table="<table-id>"`, except cell-scoped decorators (this one) attach to the `<td>` directly. Rows are keyed by `data-row-key`; columns by `data-col`. Hidden inputs follow `cell_<rowKey>_<colKey>` so multiple edited cells post cleanly with the surrounding form.

## Tokens available

Color: `--ink`, `--paper`, `--paper-2`, `--bone`, `--concrete-50..500`, `--primary*`, `--pop-*`, `--success*`, `--warning*`, `--danger*`, `--info*` • Type: `--font-display/sans/mono`, `--fs-xs..6xl`, `--lh-*`, `--tracking-*`, `--fw-*`, `--num-tabular` • Border: `--bw-1..5` • Radius: `--r-0..3` • Shadow: `--shadow-xs..2xl` • Spacing: `--sp-1..20` • Motion: `--ease-snap`, `--ease-instant`, `--dur-fast/base/slow`

## E2E test recipe

1. **Build**: `bash build.sh` — exit 0; `dist/brut.css`/`dist/brut.js` non-zero.
2. **Constraint greps**:
   - `grep -nE "rgba\\(|linear-gradient|radial-gradient" src/components.css`
   - `grep -rE "import .* from |require\\(|React|jsx|text/babel" src/ docs/ preview/`
   - Your appended CSS only: no untokenized hex/px/rem.
3. **Browser smoke** via `claude-in-chrome`:
   - Navigate to `file://<ABS>/preview/components-table-inline-edit.html`.
   - Click an editable text cell; confirm an `<input>` appears with the previous value.
   - Type a new value; press Enter (`mcp__Claude_in_Chrome__form_input` + dispatch `keydown`); confirm the cell text updates and the matching hidden input value matches.
   - Click another cell; press Escape; confirm the original value is restored.
   - Click a select cell; confirm a `<select>` appears with the right options.
   - `read_console_messages` — no errors.
4. **Screenshot** preview mid-edit; embed path in PR.

## Worker instructions (verbatim)

After you finish implementing the change:

1. **Simplify** — Invoke the `Skill` tool with `skill: "simplify"`.
2. **Run unit tests** — No test suite. `bash build.sh` exit 0 + non-zero dist/* + constraint greps.
3. **Test end-to-end** — Follow the e2e recipe above.
4. **Commit and push** — Commit (`feat(table-edit): click-to-edit cells`), push, `gh pr create`.
5. **Report** — End with `PR: <url>` (or `PR: none — <reason>`).
