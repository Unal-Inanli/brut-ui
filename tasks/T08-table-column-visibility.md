# T08 — table-column-visibility

You are unit **8 of 20** in a parallel batch building an advanced table component for a vanilla HTML/CSS/JS UI kit.

## Overall goal

Build out an advanced data-table with vast features. Each unit is one decorator on top of the existing `<table class="brut-table">`. Your unit is independent — you do **NOT** modify [src/js/components/table.js](../src/js/components/table.js) or the existing `.brut-table*` CSS block at [src/components.css:380-438](../src/components.css).

## Your unit — column show/hide menu (CSS + JS)

A "Columns" button that opens a menu listing every column in the target table. Each menu item is a checkbox; toggling hides/shows that column.

**Hook**: `data-brut="table-columns"` on a `<button>` (or wrapper). Reuses [src/js/components/menu.js](../src/js/components/menu.js) for the dropdown shell.

**Linked table**: `data-brut-table="<table-id>"`.

**How columns are identified:**

- Each `<th>` and matching `<td>` carry `data-col="<key>"`.
- The button's component reads all `<th data-col="…">` from the linked table to enumerate columns.

**Classes to introduce:**

- `.brut-table-columns-btn` — the trigger button (uses `.brut-btn` style + small grid icon `⊞` or text "Columns")
- `.brut-table-columns-menu__item` — one menu item (checkbox + column label)
- A generic CSS rule that, when a column is hidden, sets `display: none` on its cells via attribute selector: `.brut-table[data-col-hidden~="<key>"] [data-col="<key>"] { display: none; }` — implemented by the JS toggling `data-col-hidden` (space-separated keys) on the `<table>`.

## Files to create

1. **CSS append** — banner `TABLE — COLUMN VISIBILITY` in [src/components.css](../src/components.css). Add the trigger button style, the menu item layout (label flex + checkbox), and the attribute-selector hiding rule above. The hide rule must apply to **all** cells that share the key (header + every `<td>`).

2. **JS** — new file `src/js/components/table-columns.js`:
   ```js
   (function () {
     Brut.register('table-columns', {
       selector: '[data-brut="table-columns"]',
       init: function (el) {
         var tableId = el.getAttribute('data-brut-table');
         var table = tableId ? document.getElementById(tableId) : null;
         if (!table) return;
         var name = el.getAttribute('data-brut-name') || 'visible_cols';

         var hidden = el.parentNode.querySelector('input[type="hidden"][data-brut-cols-state]');
         if (!hidden) {
           hidden = document.createElement('input');
           hidden.type = 'hidden';
           hidden.setAttribute('data-brut-cols-state', '');
           hidden.name = name;
           el.parentNode.insertBefore(hidden, el.nextSibling);
         }

         var ths = Array.prototype.slice.call(table.querySelectorAll('thead th[data-col]'));
         var menuId = 'brut-cols-menu-' + Math.random().toString(36).slice(2, 9);
         el.setAttribute('type', 'button');
         el.setAttribute('data-brut-menu-open', menuId);

         var menu = document.createElement('div');
         menu.className = 'brut-menu';
         menu.setAttribute('data-brut', 'menu');
         menu.id = menuId;
         menu.setAttribute('role', 'menu');

         var hiddenCols = {};

         function apply() {
           var hideList = Object.keys(hiddenCols).filter(function (k) { return hiddenCols[k]; });
           if (hideList.length) table.setAttribute('data-col-hidden', hideList.join(' '));
           else table.removeAttribute('data-col-hidden');
           var visible = ths.map(function (h) { return h.getAttribute('data-col'); }).filter(function (k) { return !hiddenCols[k]; });
           hidden.value = visible.join(',');
           el.dispatchEvent(new CustomEvent('brut:change', { detail: { visible: visible }, bubbles: true }));
         }

         ths.forEach(function (th) {
           var key = th.getAttribute('data-col');
           var label = th.getAttribute('data-brut-col-label') || (th.textContent || key).trim();
           var item = document.createElement('label');
           item.className = 'brut-menu__item brut-table-columns-menu__item';
           item.setAttribute('role', 'menuitemcheckbox');
           var cb = document.createElement('input');
           cb.type = 'checkbox';
           cb.checked = true;
           cb.addEventListener('change', function () {
             hiddenCols[key] = !cb.checked;
             item.setAttribute('aria-checked', cb.checked ? 'true' : 'false');
             apply();
           });
           item.appendChild(cb);
           var span = document.createElement('span');
           span.textContent = label;
           item.appendChild(span);
           menu.appendChild(item);
         });

         el.parentNode.insertBefore(menu, el.nextSibling);
         apply();
       }
     });
   })();
   ```

3. **Preview** — `preview/components-table-columns.html`. A 6-column table `id="demo"` with `data-col` on every `<th>` and matching `<td>`. A `<button data-brut="table-columns" data-brut-table="demo">Columns</button>`. Show toggling each column.

4. **Docs append** — sidebar `<a href="#table-columns">Table — Columns</a>` + `<section id="table-columns">` with `<h2>`, lead, live preview, snippet.

## Hard constraints (paste-verbatim from AGENTS.md)

- No JS frameworks, JSX, transpilers, preprocessors, new deps.
- **No hex / px / rem outside [src/tokens.css](../src/tokens.css).**
- No gradients, `rgba()` shadows, blurred shadows.
- No rounded corners beyond `--r-0..3`.
- No animation longer than 140ms.
- Borders are 4px ink (`--bw-3`); 3px small (`--bw-2`).

## JavaScript rules

- Single IIFE. Register via `Brut.register('table-columns', { selector: '[data-brut="table-columns"]', init })`.
- Hook on `data-brut="table-columns"` — never on a class.
- No imports, requires, or CDN.
- Wired buttons get `setAttribute('type','button')`.
- Mirror visible columns to a hidden `<input>` (read `data-brut-name`; default `visible_cols`).
- Dispatch `CustomEvent('brut:change', { detail: { visible }, bubbles: true })` on every change.
- **Reuse [src/js/components/menu.js](../src/js/components/menu.js)** — emit a `<div class="brut-menu" data-brut="menu" id="…">` and link the trigger via `[data-brut-menu-open="<id>"]`. Do NOT reimplement menu logic.

## Cross-unit convention

Decorator components find their target table via `data-brut-table="<table-id>"`. Columns are keyed by `data-col="<key>"` on every cell (`<th>` and `<td>`). Hiding works via a single `data-col-hidden` attribute on `<table>` (space-separated keys) plus a CSS attribute selector — additive composition with no JS-side mutation of cells.

## Tokens available

Color: `--ink`, `--paper`, `--paper-2`, `--bone`, `--concrete-50..500`, `--primary*`, `--pop-*`, `--success*`, `--warning*`, `--danger*`, `--info*` • Type: `--font-display/sans/mono`, `--fs-xs..6xl`, `--lh-*`, `--tracking-*`, `--fw-*`, `--num-tabular` • Border: `--bw-1..5` • Radius: `--r-0..3` • Shadow: `--shadow-xs..2xl` • Spacing: `--sp-1..20` • Motion: `--ease-snap`, `--ease-instant`, `--dur-fast/base/slow`

## E2E test recipe

1. **Build**: `bash build.sh` — exit 0; `dist/brut.css`/`dist/brut.js` non-zero.
2. **Constraint greps**:
   - `grep -nE "rgba\\(|linear-gradient|radial-gradient" src/components.css`
   - `grep -rE "import .* from |require\\(|React|jsx|text/babel" src/ docs/ preview/`
   - Your appended CSS only: no untokenized hex/px/rem.
3. **Browser smoke** via `claude-in-chrome`:
   - Navigate to `file://<ABS>/preview/components-table-columns.html`.
   - Click the "Columns" button; confirm menu opens with one checkbox per column.
   - Uncheck one column; confirm that column's header AND every body cell of that column hide.
   - `read_console_messages` — no errors.
   - Hidden input value: `mcp__Claude_in_Chrome__javascript_tool`: confirm `document.querySelector('[data-brut-cols-state]').value` matches visible keys.
4. **Screenshot** preview (one column hidden); embed path in PR.

## Worker instructions (verbatim)

After you finish implementing the change:

1. **Simplify** — Invoke the `Skill` tool with `skill: "simplify"`.
2. **Run unit tests** — No test suite. `bash build.sh` exit 0 + non-zero dist/* + constraint greps.
3. **Test end-to-end** — Follow the e2e recipe above.
4. **Commit and push** — Commit (`feat(table-columns): show/hide columns via menu`), push, `gh pr create`.
5. **Report** — End with `PR: <url>` (or `PR: none — <reason>`).
