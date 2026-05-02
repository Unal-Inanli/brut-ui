# T07 — table-column-filter

You are unit **7 of 20** in a parallel batch building an advanced table component for a vanilla HTML/CSS/JS UI kit.

## Overall goal

Build out an advanced data-table with vast features. Each unit is one decorator on top of the existing `<table class="brut-table">`. Your unit is independent — you do **NOT** modify [src/js/components/table.js](../src/js/components/table.js) or the existing `.brut-table*` CSS block at [src/components.css:380-438](../src/components.css).

## Your unit — per-column filter (CSS + JS)

Adds a small filter button to header cells. Clicking opens a popover with a checkbox list of unique column values; checking subsets reveals matching rows. Multiple column filters AND together. Header gets a visible `--filtered` indicator (small ink bar) when active.

**Hook**: `data-brut="table-col-filter"` on a `<th>` cell. The cell's column is identified by `data-brut-col-key="<key>"`.

**Linked table**: walk `el.closest('table')` — no separate id needed.

**Classes to introduce:**

- `.brut-table-col-filter__btn` — small icon button inside the `<th>` (filter funnel character `⚲` or simple `▾`)
- `.brut-table-col-filter--active` modifier on the `<th>` — shows the indicator bar
- `.brut-table-col-filter-pop` — popover content style (list of checkboxes, scrollable)
- `.brut-table-col-filter-pop__item` — one row in the popover (checkbox + label + count)

**Reuse**: the existing `popover.js` ([src/js/components/popover.js](../src/js/components/popover.js)) — instantiate a popover via id linking. Each filter button creates (or links to) a `<div class="brut-popover" data-brut="popover" id="…">` sibling.

## Files to create

1. **CSS append** — banner `TABLE — COLUMN FILTER` in [src/components.css](../src/components.css). Style the small icon button (3px ink border, `--shadow-xs`, `--sp-1` padding, `--fs-xs`), the active indicator (a 3px ink bar across the bottom of the header), and the popover content layout (max-height with scroll, ink dividers between items, `--sp-2` `--sp-3` padding per item, `--fs-sm` font).

2. **JS** — new file `src/js/components/table-col-filter.js`:
   ```js
   (function () {
     Brut.register('table-col-filter', {
       selector: '[data-brut="table-col-filter"]',
       init: function (th) {
         var table = th.closest('table');
         if (!table) return;
         var key = th.getAttribute('data-brut-col-key');
         if (!key) return;
         // Resolve column index by walking <th>s
         var headers = Array.prototype.slice.call(table.querySelectorAll('thead th'));
         var colIndex = headers.indexOf(th);
         if (colIndex < 0) return;
         var name = th.getAttribute('data-brut-name') || ('col_' + key);

         // hidden input with comma-joined active values
         var hidden = th.querySelector('input[type="hidden"][data-brut-col-filter-state]');
         if (!hidden) {
           hidden = document.createElement('input');
           hidden.type = 'hidden';
           hidden.setAttribute('data-brut-col-filter-state', '');
           hidden.name = name;
           th.appendChild(hidden);
         }

         // Build button + popover anchor
         var btn = document.createElement('button');
         btn.setAttribute('type', 'button');
         btn.className = 'brut-table-col-filter__btn';
         btn.textContent = '▾';
         var popId = 'brut-col-filter-' + Math.random().toString(36).slice(2, 9);
         btn.setAttribute('data-brut-popover-open', popId);
         th.appendChild(btn);

         // Build popover
         var pop = document.createElement('div');
         pop.className = 'brut-popover brut-table-col-filter-pop';
         pop.setAttribute('data-brut', 'popover');
         pop.id = popId;

         // Collect unique values from this column
         var values = [];
         var bodyCells = table.querySelectorAll('tbody tr td:nth-child(' + (colIndex + 1) + ')');
         var seen = {};
         bodyCells.forEach(function (td) {
           var v = (td.textContent || '').trim();
           if (!seen.hasOwnProperty(v)) { seen[v] = 0; values.push(v); }
           seen[v]++;
         });
         values.sort();

         var active = {};
         values.forEach(function (v) {
           var item = document.createElement('label');
           item.className = 'brut-table-col-filter-pop__item';
           var cb = document.createElement('input');
           cb.type = 'checkbox';
           cb.checked = true;
           active[v] = true;
           cb.addEventListener('change', function () {
             active[v] = cb.checked;
             apply();
           });
           item.appendChild(cb);
           var text = document.createElement('span');
           text.textContent = v + ' (' + seen[v] + ')';
           item.appendChild(text);
           pop.appendChild(item);
         });
         th.appendChild(pop);

         function apply() {
           var rows = table.querySelectorAll('tbody tr');
           var anyDeselected = Object.keys(active).some(function (k) { return !active[k]; });
           rows.forEach(function (r) {
             if (r.hasAttribute('data-brut-row-expansion')) return;
             var cell = r.children[colIndex];
             if (!cell) return;
             var v = (cell.textContent || '').trim();
             var match = active[v] !== false;
             if (match) {
               if (r.getAttribute('data-brut-hidden-by') === ('col_' + key)) {
                 r.removeAttribute('data-brut-hidden-by');
                 r.removeAttribute('hidden');
               } else if (!r.hasAttribute('data-brut-hidden-by')) {
                 r.removeAttribute('hidden');
               }
             } else {
               r.setAttribute('data-brut-hidden-by', 'col_' + key);
               r.setAttribute('hidden', '');
             }
           });
           th.classList.toggle('brut-table-col-filter--active', anyDeselected);
           hidden.value = Object.keys(active).filter(function (k) { return active[k]; }).join(',');
           th.dispatchEvent(new CustomEvent('brut:change', {
             detail: { key: key, active: Object.keys(active).filter(function (k) { return active[k]; }) },
             bubbles: true
           }));
           table.dispatchEvent(new CustomEvent('brut:change', { detail: { source: 'col-filter', key: key }, bubbles: true }));
         }
       }
     });
   })();
   ```

3. **Preview** — `preview/components-table-col-filter.html`. A 12-row table where two `<th>` carry `data-brut="table-col-filter"` `data-brut-col-key="status"` etc. Show clicking the funnel button opens a popover, unchecking reduces visible rows.

4. **Docs append** — sidebar `<a href="#table-col-filter">Table — Column Filter</a>` + `<section id="table-col-filter">` with `<h2>`, lead, live preview, snippet.

## Hard constraints (paste-verbatim from AGENTS.md)

- No JS frameworks, JSX, transpilers, preprocessors, new deps.
- **No hex / px / rem outside [src/tokens.css](../src/tokens.css).**
- No gradients, `rgba()` shadows, blurred shadows.
- No rounded corners beyond `--r-0..3`.
- No animation longer than 140ms.
- Borders are 4px ink (`--bw-3`); 3px small (`--bw-2`).

## JavaScript rules

- Single IIFE. Register via `Brut.register('table-col-filter', { selector: '[data-brut="table-col-filter"]', init })`.
- Hook on `data-brut="table-col-filter"` — never on a class.
- No imports, requires, or CDN.
- Wired buttons get `setAttribute('type','button')`.
- Mirror active values to a hidden `<input>` (read `data-brut-name`; default `col_<key>`).
- Dispatch `CustomEvent('brut:change', { detail: { key, active }, bubbles: true })` on every change.
- **Reuse [src/js/components/popover.js](../src/js/components/popover.js)** — emit a `<div class="brut-popover" data-brut="popover" id="…">` and a trigger with `[data-brut-popover-open="<id>"]`. Do NOT reimplement popover logic. After appending the popover to the DOM, call `Brut.init()` if it exists, or rely on the runtime's MutationObserver if it auto-detects (check `src/js/core.js`).

## Cross-unit convention

Decorator components find their target table via `data-brut-table="<table-id>"`, except `<th>`-scoped decorators (this one) walk `el.closest('table')`. Use the `hidden` HTML attribute on `<tr>` and tag with `data-brut-hidden-by="<source>"` so multiple decorators compose without clobbering each other.

## Tokens available

Color: `--ink`, `--paper`, `--paper-2`, `--bone`, `--concrete-50..500`, `--primary*`, `--pop-*`, `--success*`, `--warning*`, `--danger*`, `--info*` • Type: `--font-display/sans/mono`, `--fs-xs..6xl`, `--lh-*`, `--tracking-*`, `--fw-*`, `--num-tabular` • Border: `--bw-1..5` • Radius: `--r-0..3` • Shadow: `--shadow-xs..2xl` • Spacing: `--sp-1..20` • Motion: `--ease-snap`, `--ease-instant`, `--dur-fast/base/slow`

## E2E test recipe

1. **Build**: `bash build.sh` — exit 0; `dist/brut.css`/`dist/brut.js` non-zero.
2. **Constraint greps**:
   - `grep -nE "rgba\\(|linear-gradient|radial-gradient" src/components.css`
   - `grep -rE "import .* from |require\\(|React|jsx|text/babel" src/ docs/ preview/`
   - Your appended CSS only: no untokenized hex/px/rem.
3. **Browser smoke** via `claude-in-chrome`:
   - Navigate to `file://<ABS>/preview/components-table-col-filter.html`.
   - Click the funnel `▾` button on the "status" column header (find via `mcp__Claude_in_Chrome__find`).
   - Re-read page; confirm popover appears with checkboxes for each unique value.
   - Uncheck one value; confirm matching rows disappear and the header shows the active indicator.
   - `read_console_messages` — no errors.
4. **Screenshot** preview (popover open with one checkbox unchecked); embed path in PR.

## Worker instructions (verbatim)

After you finish implementing the change:

1. **Simplify** — Invoke the `Skill` tool with `skill: "simplify"`.
2. **Run unit tests** — No test suite. `bash build.sh` exit 0 + non-zero dist/* + constraint greps.
3. **Test end-to-end** — Follow the e2e recipe above.
4. **Commit and push** — Commit (`feat(table-col-filter): per-column filter via popover`), push, `gh pr create`.
5. **Report** — End with `PR: <url>` (or `PR: none — <reason>`).
