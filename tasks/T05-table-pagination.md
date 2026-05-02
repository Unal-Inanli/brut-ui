# T05 — table-pagination

You are unit **5 of 20** in a parallel batch building an advanced table component for a vanilla HTML/CSS/JS UI kit.

## Overall goal

Build out an advanced data-table with vast features. Each unit is one decorator on top of the existing `<table class="brut-table">`. Your unit is independent — you do **NOT** modify [src/js/components/table.js](../src/js/components/table.js) or the existing `.brut-table*` CSS block at [src/components.css:380-438](../src/components.css).

## Your unit — pagination (CSS + JS)

Wire the existing CSS-only `.brut-pager` shell to a target `<table>` so it slices `<tbody>` rows by page size and renders page-jump buttons.

**Hook**: `data-brut="table-pagination"` on a `<nav class="brut-pager" data-brut="table-pagination" data-brut-table="<id>" data-brut-page-size="10">…</nav>`.

**Existing classes you reuse**: `.brut-pager`, `.brut-pager__btn`, `.brut-pager__btn--active`, `.brut-pager__gap`. Do **not** redefine these.

**Classes to introduce (only if needed):**

- `.brut-pager__btn--prev`, `.brut-pager__btn--next` — modifiers for prev/next arrows (icon hint via `::before`/`::after` from existing token system; `‹` and `›` characters are fine since the kit allows characters in CSS content)
- `.brut-pager__info` — optional "1–10 of 47" label

## Files to create

1. **CSS append** — banner `TABLE — PAGINATION (extensions)` in [src/components.css](../src/components.css). Add ONLY the new modifiers above (`--prev`, `--next`, `__info`). Keep additions minimal.

2. **JS** — new file `src/js/components/table-pagination.js`:
   ```js
   (function () {
     Brut.register('table-pagination', {
       selector: '[data-brut="table-pagination"]',
       init: function (el) {
         var tableId = el.getAttribute('data-brut-table');
         var table = tableId ? document.getElementById(tableId) : null;
         if (!table) return;
         var pageSize = Math.max(1, parseInt(el.getAttribute('data-brut-page-size') || '10', 10));
         var name = el.getAttribute('data-brut-name') || 'page';
         var hidden = el.querySelector('input[type="hidden"][data-brut-pager-state]');
         if (!hidden) {
           hidden = document.createElement('input');
           hidden.type = 'hidden';
           hidden.setAttribute('data-brut-pager-state', '');
           hidden.name = name;
           el.appendChild(hidden);
         }
         var rows = function () {
           // Re-query on every render — other decorators may add/hide rows
           return Array.prototype.slice.call(table.querySelectorAll('tbody tr'));
         };
         var current = 1;
         function totalPages() {
           var visibleRows = rows().filter(function (r) { return !r.hasAttribute('data-brut-pager-hidden'); });
           return Math.max(1, Math.ceil(visibleRows.length / pageSize));
         }
         function render() {
           var total = totalPages();
           if (current > total) current = total;
           var allRows = rows();
           // Reset prior pager-driven hides; respect other hides set by callers
           allRows.forEach(function (r) { r.removeAttribute('data-brut-pager-hidden'); });
           // Determine which rows count as visible (not hidden by other decorators)
           // Convention: other decorators set the `hidden` HTML attribute when filtering.
           var pool = allRows.filter(function (r) { return !r.hasAttribute('hidden'); });
           pool.forEach(function (r, i) {
             var page = Math.floor(i / pageSize) + 1;
             if (page !== current) {
               r.setAttribute('data-brut-pager-hidden', '');
               r.setAttribute('hidden', '');
             } else {
               r.removeAttribute('data-brut-pager-hidden');
               // Only un-hide if WE are the ones who hid it (presence of attr means us)
             }
           });
           // Render buttons
           var btnHost = el.querySelector('[data-brut-pager-buttons]');
           if (!btnHost) {
             btnHost = document.createElement('div');
             btnHost.setAttribute('data-brut-pager-buttons', '');
             el.appendChild(btnHost);
           }
           btnHost.innerHTML = '';
           function btn(label, page, active) {
             var b = document.createElement('button');
             b.setAttribute('type', 'button');
             b.className = 'brut-pager__btn' + (active ? ' brut-pager__btn--active' : '');
             b.textContent = label;
             b.addEventListener('click', function () { if (page >= 1 && page <= total) { current = page; render(); } });
             return b;
           }
           function gap() {
             var s = document.createElement('span');
             s.className = 'brut-pager__gap';
             s.textContent = '…';
             return s;
           }
           // prev
           var prev = btn('‹', current - 1, false);
           prev.classList.add('brut-pager__btn--prev');
           if (current === 1) prev.disabled = true;
           btnHost.appendChild(prev);
           // page numbers (1, …, current-1, current, current+1, …, total)
           function pageBtn(p) { btnHost.appendChild(btn(String(p), p, p === current)); }
           pageBtn(1);
           if (current > 3) btnHost.appendChild(gap());
           for (var p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) pageBtn(p);
           if (current < total - 2) btnHost.appendChild(gap());
           if (total > 1) pageBtn(total);
           // next
           var next = btn('›', current + 1, false);
           next.classList.add('brut-pager__btn--next');
           if (current === total) next.disabled = true;
           btnHost.appendChild(next);
           hidden.value = String(current);
           el.dispatchEvent(new CustomEvent('brut:change', { detail: { page: current, totalPages: total }, bubbles: true }));
         }
         render();
         // Re-render when other decorators change row visibility
         table.addEventListener('brut:change', function () { render(); });
       }
     });
   })();
   ```

3. **Preview** — `preview/components-table-pagination.html`. A 25-row table `id="demo"` + `<nav class="brut-pager" data-brut="table-pagination" data-brut-table="demo" data-brut-page-size="10">`. Show page navigation working.

4. **Docs append** — sidebar `<a href="#table-pagination">` + `<section id="table-pagination">` with `<h2>`, lead, live preview, snippet.

## Hard constraints (paste-verbatim from AGENTS.md)

- No JS frameworks, JSX, transpilers, preprocessors, new deps.
- **No hex / px / rem outside [src/tokens.css](../src/tokens.css).**
- No gradients, `rgba()` shadows, blurred shadows.
- No rounded corners beyond `--r-0..3`.
- No animation longer than 140ms.
- Borders are 4px ink (`--bw-3`); 3px small (`--bw-2`).

## JavaScript rules

- Single IIFE. Register on `data-brut="table-pagination"` via `Brut.register`.
- Hook on `data-brut="table-pagination"` — never on a class.
- No imports, requires, or CDN.
- All wired `<button>` elements get `setAttribute('type','button')`.
- Mirror current page to a hidden `<input>` (read `data-brut-name`; default `page`).
- Dispatch `CustomEvent('brut:change', { detail: { page, totalPages }, bubbles: true })` on every page change.

## Cross-unit convention

Decorator components find their target table via `data-brut-table="<table-id>"`. The decorated `<table>` carries `id="<table-id>"`. The pagination renderer respects rows already hidden by other decorators (filters), so it composes cleanly with units T06/T07.

## Tokens available

Color: `--ink`, `--paper`, `--paper-2`, `--bone`, `--concrete-50..500`, `--primary*`, `--pop-*`, `--success*`, `--warning*`, `--danger*`, `--info*` • Type: `--font-display/sans/mono`, `--fs-xs..6xl`, `--lh-*`, `--tracking-*`, `--fw-*`, `--num-tabular` • Border: `--bw-1..5` • Radius: `--r-0..3` • Shadow: `--shadow-xs..2xl` • Spacing: `--sp-1..20` • Motion: `--ease-snap`, `--ease-instant`, `--dur-fast/base/slow`

## E2E test recipe

1. **Build**: `bash build.sh` — exit 0; `dist/brut.css`/`dist/brut.js` non-zero.
2. **Constraint greps**:
   - `grep -nE "rgba\\(|linear-gradient|radial-gradient" src/components.css`
   - `grep -rE "import .* from |require\\(|React|jsx|text/babel" src/ docs/ preview/`
   - Your appended CSS only: no untokenized hex/px/rem.
3. **Browser smoke** via `claude-in-chrome`:
   - Navigate to `file://<ABS>/preview/components-table-pagination.html`.
   - `read_page` — confirm 10 rows visible initially.
   - Click page 2 (find via `mcp__Claude_in_Chrome__find` text "2"); re-read; confirm next 10 rows visible.
   - Click `›` (next); confirm advancing.
   - `read_console_messages` — no errors.
   - Verify hidden input value: `mcp__Claude_in_Chrome__javascript_tool`: `document.querySelector('[data-brut="table-pagination"] input[type=hidden]').value`.
   - Also load `docs/index.html#table-pagination`.
4. **Screenshot** preview; embed path in PR.

## Worker instructions (verbatim)

After you finish implementing the change:

1. **Simplify** — Invoke the `Skill` tool with `skill: "simplify"`.
2. **Run unit tests** — No test suite. `bash build.sh` exit 0 + non-zero dist/* + constraint greps.
3. **Test end-to-end** — Follow the e2e recipe above.
4. **Commit and push** — Commit (`feat(table-pagination): wire pager to table tbody`), push, `gh pr create`.
5. **Report** — End with `PR: <url>` (or `PR: none — <reason>`).
