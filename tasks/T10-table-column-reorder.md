# T10 — table-column-reorder

You are unit **10 of 20** in a parallel batch building an advanced table component for a vanilla HTML/CSS/JS UI kit.

## Overall goal

Build out an advanced data-table with vast features. Each unit is one decorator on top of the existing `<table class="brut-table">`. Your unit is independent — you do **NOT** modify [src/js/components/table.js](../src/js/components/table.js) or the existing `.brut-table*` CSS block at [src/components.css:380-438](../src/components.css).

## Your unit — drag-to-reorder columns (CSS + JS)

Drag a header to reorder columns. Native HTML5 drag-and-drop. Reorders the `<th>`, the matching `<col>` in `<colgroup>`, and every body row's matching `<td>`. Drop indicator is a 4px vertical ink bar between columns.

**Hook**: `data-brut="table-reorder"` on a `<table>`. Each `<th>` to be reorderable should carry `draggable="true"` (the JS sets this).

**Classes to introduce:**

- `.brut-table--reorderable` — modifier on `<table>` enabling drag cursor on headers
- `.brut-table__th--dragging` — applied to the dragged `<th>` (lower opacity via opacity-token; if no opacity token, use a light bone bg)
- `.brut-table__drop-indicator` — 4px vertical ink bar; positioned absolute inside `thead`

## Files to create

1. **CSS append** — banner `TABLE — COLUMN REORDER` in [src/components.css](../src/components.css):
   - `.brut-table--reorderable thead { position: relative; }`
   - `.brut-table--reorderable thead th { cursor: grab; }`
   - `.brut-table--reorderable thead th:active { cursor: grabbing; }`
   - `.brut-table__th--dragging { background: var(--concrete-100); }`
   - `.brut-table__drop-indicator { position: absolute; top: 0; height: 100%; width: var(--bw-3); background: var(--ink); pointer-events: none; }`

2. **JS** — new file `src/js/components/table-reorder.js`:
   ```js
   (function () {
     Brut.register('table-reorder', {
       selector: '[data-brut="table-reorder"]',
       init: function (table) {
         table.classList.add('brut-table--reorderable');
         var thead = table.querySelector('thead');
         if (!thead) return;
         var ths = Array.prototype.slice.call(thead.querySelectorAll('th'));
         var indicator = document.createElement('div');
         indicator.className = 'brut-table__drop-indicator';
         indicator.style.display = 'none';
         thead.appendChild(indicator);

         var dragIndex = -1;

         function moveColumn(from, to) {
           if (from === to) return;
           var colgroup = table.querySelector('colgroup');
           function moveChild(parent, fromIdx, toIdx) {
             var children = parent.children;
             var node = children[fromIdx];
             var ref = children[toIdx];
             if (!node || !ref) return;
             if (fromIdx < toIdx) parent.insertBefore(node, ref.nextSibling);
             else parent.insertBefore(node, ref);
           }
           if (colgroup) moveChild(colgroup, from, to);
           moveChild(thead.querySelector('tr'), from, to);
           Array.prototype.forEach.call(table.querySelectorAll('tbody tr'), function (tr) {
             moveChild(tr, from, to);
           });
           var keys = Array.prototype.slice.call(thead.querySelectorAll('th')).map(function (h) { return h.getAttribute('data-col') || ''; });
           table.dispatchEvent(new CustomEvent('brut:change', { detail: { source: 'reorder', order: keys }, bubbles: true }));
         }

         ths.forEach(function (th, i) {
           th.setAttribute('draggable', 'true');
           th.addEventListener('dragstart', function (e) {
             dragIndex = Array.prototype.indexOf.call(thead.querySelectorAll('th'), th);
             th.classList.add('brut-table__th--dragging');
             if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move';
           });
           th.addEventListener('dragover', function (e) {
             e.preventDefault();
             var rect = th.getBoundingClientRect();
             var theadRect = thead.getBoundingClientRect();
             var midpoint = rect.left + rect.width / 2;
             var x = e.clientX < midpoint ? rect.left : rect.right;
             indicator.style.left = (x - theadRect.left) + 'px';
             indicator.style.display = 'block';
           });
           th.addEventListener('drop', function (e) {
             e.preventDefault();
             var rect = th.getBoundingClientRect();
             var midpoint = rect.left + rect.width / 2;
             var dropIndex = Array.prototype.indexOf.call(thead.querySelectorAll('th'), th);
             if (e.clientX > midpoint) dropIndex++;
             // Adjust if moving forward (target index shifts after removing source)
             if (dragIndex < dropIndex) dropIndex--;
             moveColumn(dragIndex, dropIndex);
             indicator.style.display = 'none';
           });
           th.addEventListener('dragend', function () {
             th.classList.remove('brut-table__th--dragging');
             indicator.style.display = 'none';
             dragIndex = -1;
           });
         });
       }
     });
   })();
   ```

3. **Preview** — `preview/components-table-reorder.html`. A 5-column table with `data-brut="table-reorder"`. Each `<th>` carries `data-col="<key>"`. Show that dragging headers reorders columns.

4. **Docs append** — sidebar `<a href="#table-reorder">Table — Column Reorder</a>` + `<section id="table-reorder">` with `<h2>`, lead, live preview, snippet.

## Hard constraints (paste-verbatim from AGENTS.md)

- No JS frameworks, JSX, transpilers, preprocessors, new deps.
- **No hex / px / rem outside [src/tokens.css](../src/tokens.css).** Inline `style="left: Xpx"` for the indicator is JS-runtime data, not a static CSS value — fine.
- No gradients, `rgba()` shadows, blurred shadows.
- No rounded corners beyond `--r-0..3`.
- No animation longer than 140ms.
- Borders are 4px ink (`--bw-3`); 3px small (`--bw-2`).

## JavaScript rules

- Single IIFE. Register via `Brut.register('table-reorder', { selector: '[data-brut="table-reorder"]', init })`.
- Hook on `data-brut="table-reorder"` — never on a class.
- No imports, requires, or CDN.
- Use HTML5 drag events (`dragstart`, `dragover`, `drop`, `dragend`).
- Dispatch `CustomEvent('brut:change', { detail: { source: 'reorder', order }, bubbles: true })` on every reorder commit (`order` = array of `data-col` keys in the new order).

## Cross-unit convention

Decorator components find their target table via `data-brut-table="<table-id>"`, except table-scoped decorators (this one) attach directly to the `<table>`. Reordering preserves any `<colgroup>` generated by T09 (column-resize), so the two units compose cleanly.

## Tokens available

Color: `--ink`, `--paper`, `--paper-2`, `--bone`, `--concrete-50..500`, `--primary*`, `--pop-*`, `--success*`, `--warning*`, `--danger*`, `--info*` • Type: `--font-display/sans/mono`, `--fs-xs..6xl`, `--lh-*`, `--tracking-*`, `--fw-*`, `--num-tabular` • Border: `--bw-1..5` • Radius: `--r-0..3` • Shadow: `--shadow-xs..2xl` • Spacing: `--sp-1..20` • Motion: `--ease-snap`, `--ease-instant`, `--dur-fast/base/slow`

## E2E test recipe

1. **Build**: `bash build.sh` — exit 0; `dist/brut.css`/`dist/brut.js` non-zero.
2. **Constraint greps**:
   - `grep -nE "rgba\\(|linear-gradient|radial-gradient" src/components.css`
   - `grep -rE "import .* from |require\\(|React|jsx|text/babel" src/ docs/ preview/`
   - Your appended CSS only: no untokenized hex/px/rem.
3. **Browser smoke** via `claude-in-chrome`:
   - Navigate to `file://<ABS>/preview/components-table-reorder.html`.
   - Synthesize a drag via `mcp__Claude_in_Chrome__javascript_tool`: dispatch `dragstart` on `<th data-col="name">`, `dragover` on `<th data-col="email">`, `drop` on `<th data-col="email">`, `dragend`. Confirm column order changes (read `data-col` of each th).
   - `read_console_messages` — no errors.
4. **Screenshot** preview after reorder; embed path in PR.

## Worker instructions (verbatim)

After you finish implementing the change:

1. **Simplify** — Invoke the `Skill` tool with `skill: "simplify"`.
2. **Run unit tests** — No test suite. `bash build.sh` exit 0 + non-zero dist/* + constraint greps.
3. **Test end-to-end** — Follow the e2e recipe above.
4. **Commit and push** — Commit (`feat(table-reorder): drag-to-reorder columns`), push, `gh pr create`.
5. **Report** — End with `PR: <url>` (or `PR: none — <reason>`).
