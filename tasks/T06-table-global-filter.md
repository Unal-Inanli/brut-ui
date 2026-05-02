# T06 — table-global-filter

You are unit **6 of 20** in a parallel batch building an advanced table component for a vanilla HTML/CSS/JS UI kit.

## Overall goal

Build out an advanced data-table with vast features. Each unit is one decorator on top of the existing `<table class="brut-table">`. Your unit is independent — you do **NOT** modify [src/js/components/table.js](../src/js/components/table.js) or the existing `.brut-table*` CSS block at [src/components.css:380-438](../src/components.css).

## Your unit — global text filter (CSS + JS)

A text input that filters `<tbody>` rows of a target table by combined visible cell text. Case-insensitive, AND across whitespace-separated tokens. Uses the `hidden` HTML attribute on `<tr>` so other decorators (pagination, column-filter) compose cleanly.

**Hook**: `data-brut="table-filter"` on a wrapper element that contains an `<input type="search">`.

**Linked table**: `data-brut-table="<table-id>"`.

**Classes to introduce:**

- `.brut-table-filter` — wrapper (single-line, label + input + count)
- `.brut-table-filter__count` — "12 of 47" running total

## Files to create

1. **CSS append** — banner `TABLE — GLOBAL FILTER` in [src/components.css](../src/components.css). Style is minimal — input itself reuses `.brut-input`. The wrapper is flex row with gap `--sp-3`. Count uses `--font-mono`, `--fs-sm`, `--concrete-400`.

2. **JS** — new file `src/js/components/table-filter.js`:
   ```js
   (function () {
     Brut.register('table-filter', {
       selector: '[data-brut="table-filter"]',
       init: function (el) {
         var tableId = el.getAttribute('data-brut-table');
         var table = tableId ? document.getElementById(tableId) : null;
         if (!table) return;
         var input = el.querySelector('input');
         if (!input) return;
         var name = el.getAttribute('data-brut-name') || 'q';
         var hidden = el.querySelector('input[type="hidden"][data-brut-filter-state]');
         if (!hidden) {
           hidden = document.createElement('input');
           hidden.type = 'hidden';
           hidden.setAttribute('data-brut-filter-state', '');
           hidden.name = name;
           el.appendChild(hidden);
         }
         var countEl = el.querySelector('.brut-table-filter__count');

         function apply() {
           var q = input.value.trim().toLowerCase();
           var tokens = q ? q.split(/\s+/) : [];
           var rows = table.querySelectorAll('tbody tr');
           var visible = 0, total = rows.length;
           rows.forEach(function (r) {
             if (r.hasAttribute('data-brut-row-expansion')) return; // skip expansion rows from unit T11
             var text = (r.textContent || '').toLowerCase();
             var match = tokens.every(function (t) { return text.indexOf(t) !== -1; });
             if (match) {
               r.removeAttribute('data-brut-filter-hidden');
               // Only un-hide if no OTHER decorator hid it
               if (r.getAttribute('data-brut-hidden-by') === 'filter') {
                 r.removeAttribute('data-brut-hidden-by');
                 r.removeAttribute('hidden');
               } else if (!r.hasAttribute('data-brut-hidden-by')) {
                 r.removeAttribute('hidden');
               }
               visible++;
             } else {
               r.setAttribute('data-brut-filter-hidden', '');
               r.setAttribute('data-brut-hidden-by', 'filter');
               r.setAttribute('hidden', '');
             }
           });
           hidden.value = q;
           if (countEl) countEl.textContent = visible + ' of ' + total;
           el.dispatchEvent(new CustomEvent('brut:change', { detail: { query: q, visible: visible, total: total }, bubbles: true }));
           // Notify table listeners (pagination etc.) to re-render
           table.dispatchEvent(new CustomEvent('brut:change', { detail: { source: 'filter' }, bubbles: true }));
         }

         input.addEventListener('input', apply);
         apply();
       }
     });
   })();
   ```

3. **Preview** — `preview/components-table-filter.html`. A 15-row table `id="demo"` and a `<div class="brut-table-filter" data-brut="table-filter" data-brut-table="demo">…</div>` containing a search input + `<span class="brut-table-filter__count">`. Show typing filters rows live.

4. **Docs append** — sidebar `<a href="#table-global-filter">Table — Global Filter</a>` + `<section id="table-global-filter">` with `<h2>`, lead, live preview, snippet.

## Hard constraints (paste-verbatim from AGENTS.md)

- No JS frameworks, JSX, transpilers, preprocessors, new deps.
- **No hex / px / rem outside [src/tokens.css](../src/tokens.css).**
- No gradients, `rgba()` shadows, blurred shadows.
- No rounded corners beyond `--r-0..3`.
- No animation longer than 140ms.
- Borders are 4px ink (`--bw-3`); 3px small (`--bw-2`).

## JavaScript rules

- Single IIFE. Register via `Brut.register('table-filter', { selector: '[data-brut="table-filter"]', init })`.
- Hook on `data-brut="table-filter"` — never on a class.
- No imports, requires, or CDN.
- Mirror current query to a hidden `<input>` (read `data-brut-name`; default `q`).
- Dispatch `CustomEvent('brut:change', { detail: { query, visible, total }, bubbles: true })` on every input change.

## Cross-unit convention

Decorator components find their target table via `data-brut-table="<table-id>"`. Use the `hidden` HTML attribute on `<tr>` to hide rows so other decorators (pagination, column-filter) compose. Mark which decorator hid a row via `data-brut-hidden-by="filter"` so on un-match you only un-hide rows you owned.

## Tokens available

Color: `--ink`, `--paper`, `--paper-2`, `--bone`, `--concrete-50..500`, `--primary*`, `--pop-*`, `--success*`, `--warning*`, `--danger*`, `--info*` • Type: `--font-display/sans/mono`, `--fs-xs..6xl`, `--lh-*`, `--tracking-*`, `--fw-*`, `--num-tabular` • Border: `--bw-1..5` • Radius: `--r-0..3` • Shadow: `--shadow-xs..2xl` • Spacing: `--sp-1..20` • Motion: `--ease-snap`, `--ease-instant`, `--dur-fast/base/slow`

## E2E test recipe

1. **Build**: `bash build.sh` — exit 0; `dist/brut.css`/`dist/brut.js` non-zero.
2. **Constraint greps**:
   - `grep -nE "rgba\\(|linear-gradient|radial-gradient" src/components.css`
   - `grep -rE "import .* from |require\\(|React|jsx|text/babel" src/ docs/ preview/`
   - Your appended CSS only: no untokenized hex/px/rem.
3. **Browser smoke** via `claude-in-chrome`:
   - Navigate to `file://<ABS>/preview/components-table-filter.html`.
   - `read_page` — confirm all 15 rows visible.
   - Type via `mcp__Claude_in_Chrome__form_input` into the search input; re-read; confirm rows narrow to matches.
   - Confirm count updates.
   - `read_console_messages` — no errors.
   - Hidden input value: `mcp__Claude_in_Chrome__javascript_tool`: `document.querySelector('[data-brut="table-filter"] input[type=hidden]').value`.
4. **Screenshot** preview; embed path in PR.

## Worker instructions (verbatim)

After you finish implementing the change:

1. **Simplify** — Invoke the `Skill` tool with `skill: "simplify"`.
2. **Run unit tests** — No test suite. `bash build.sh` exit 0 + non-zero dist/* + constraint greps.
3. **Test end-to-end** — Follow the e2e recipe above.
4. **Commit and push** — Commit (`feat(table-filter): add global text filter`), push, `gh pr create`.
5. **Report** — End with `PR: <url>` (or `PR: none — <reason>`).
