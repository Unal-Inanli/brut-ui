# T18 — table-export

You are unit **18 of 20** in a parallel batch building an advanced table component for a vanilla HTML/CSS/JS UI kit.

## Overall goal

Build out an advanced data-table with vast features. Each unit is one decorator on top of the existing `<table class="brut-table">`. Your unit is independent — you do **NOT** modify [src/js/components/table.js](../src/js/components/table.js) or the existing `.brut-table*` CSS block at [src/components.css:380-438](../src/components.css).

## Your unit — CSV / JSON export (CSS + JS)

A button (or menu) that builds a CSV (or JSON) string from the **visible** rows of a target table and triggers a browser download via `Blob` + a temporary `<a download>`. Respects rows hidden by other decorators (filter, pagination) — only exports what the user can currently see.

**Hook**: `data-brut="table-export"` on a `<button>`.

**Linked table**: `data-brut-table="<table-id>"`.

**Format**: `data-brut-format="csv"` (default) or `data-brut-format="json"`.

**Filename**: `data-brut-filename="<base>"` — defaults to `<table-id>-<yyyymmdd>.<csv|json>`.

**Classes to introduce:**

- `.brut-table-export-btn` — minor styling; mostly reuses `.brut-btn`. If you create the class, scope it tightly (small icon hint via `::before` content `↓`).

## Files to create

1. **CSS append** — banner `TABLE — EXPORT` in [src/components.css](../src/components.css). Minimal — just any class additions you introduce. Most styling is reused from `.brut-btn`.

2. **JS** — new file `src/js/components/table-export.js`:
   ```js
   (function () {
     function escapeCsv(v) {
       if (v == null) return '';
       var s = String(v);
       if (s.indexOf('"') !== -1 || s.indexOf(',') !== -1 || s.indexOf('\n') !== -1) {
         return '"' + s.replace(/"/g, '""') + '"';
       }
       return s;
     }
     function todayStamp() {
       var d = new Date();
       function pad(n) { return n < 10 ? '0' + n : '' + n; }
       return d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate());
     }
     Brut.register('table-export', {
       selector: '[data-brut="table-export"]',
       init: function (btn) {
         btn.setAttribute('type', 'button');
         var tableId = btn.getAttribute('data-brut-table');
         var table = tableId ? document.getElementById(tableId) : null;
         if (!table) return;
         var format = (btn.getAttribute('data-brut-format') || 'csv').toLowerCase();
         var base = btn.getAttribute('data-brut-filename') || (tableId + '-' + todayStamp());

         function build() {
           var headers = Array.prototype.slice.call(table.querySelectorAll('thead th'))
             .filter(function (th) { return th.offsetParent !== null; }) // skip column-hidden headers
             .map(function (th) { return (th.getAttribute('data-brut-col-label') || th.textContent || '').trim(); });
           var rows = Array.prototype.slice.call(table.querySelectorAll('tbody tr'))
             .filter(function (tr) { return !tr.hasAttribute('hidden') && !tr.hasAttribute('data-brut-row-expansion'); })
             .map(function (tr) {
               return Array.prototype.slice.call(tr.children)
                 .filter(function (td) { return td.offsetParent !== null; })
                 .map(function (td) {
                   // Prefer hidden inputs (committed inline-edit values) when present
                   var hi = td.querySelector('input[type="hidden"][data-brut-edit-state]');
                   if (hi) return hi.value;
                   return (td.textContent || '').trim();
                 });
             });
           if (format === 'json') {
             var arr = rows.map(function (r) {
               var obj = {};
               headers.forEach(function (h, i) { obj[h] = r[i]; });
               return obj;
             });
             return { mime: 'application/json', body: JSON.stringify(arr, null, 2), ext: 'json' };
           } else {
             var csv = [headers.map(escapeCsv).join(',')]
               .concat(rows.map(function (r) { return r.map(escapeCsv).join(','); }))
               .join('\n');
             return { mime: 'text/csv', body: csv, ext: 'csv' };
           }
         }

         btn.addEventListener('click', function () {
           var out = build();
           var blob = new Blob([out.body], { type: out.mime });
           var url = URL.createObjectURL(blob);
           var a = document.createElement('a');
           a.href = url;
           a.download = base + '.' + out.ext;
           document.body.appendChild(a);
           a.click();
           document.body.removeChild(a);
           setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
           btn.dispatchEvent(new CustomEvent('brut:change', {
             detail: { format: format, rowCount: out.body.split('\n').length - 1 },
             bubbles: true
           }));
         });
       }
     });
   })();
   ```

3. **Preview** — `preview/components-table-export.html`. A 12-row table `id="demo"` and three buttons:
   - `<button data-brut="table-export" data-brut-table="demo">Export CSV</button>`
   - `<button data-brut="table-export" data-brut-table="demo" data-brut-format="json">Export JSON</button>`
   - `<button data-brut="table-export" data-brut-table="demo" data-brut-filename="custom-name">Export (custom name)</button>`

   Optional: include a `<details><summary>Last export preview</summary><pre id="last"></pre></details>` block whose `<pre>` is filled by an inline listener for `brut:change` (just for demo).

4. **Docs append** — sidebar `<a href="#table-export">Table — Export</a>` + `<section id="table-export">` with `<h2>`, lead, live preview, snippet.

## Hard constraints (paste-verbatim from AGENTS.md)

- No JS frameworks, JSX, transpilers, preprocessors, new deps.
- **No hex / px / rem outside [src/tokens.css](../src/tokens.css).**
- No gradients, `rgba()` shadows, blurred shadows.
- No rounded corners beyond `--r-0..3`.
- No animation longer than 140ms.
- Borders are 4px ink (`--bw-3`); 3px small (`--bw-2`).

## JavaScript rules

- Single IIFE. Register via `Brut.register('table-export', { selector: '[data-brut="table-export"]', init })`.
- Hook on `data-brut="table-export"` — never on a class.
- No imports, requires, or CDN.
- Wired buttons get `setAttribute('type','button')`.
- Dispatch `CustomEvent('brut:change', { detail: { format, rowCount }, bubbles: true })` after a successful export.
- Use only built-in `Blob`, `URL.createObjectURL`, and an in-memory `<a download>` for the download. Do NOT use a CSV/JSON library.

## Cross-unit convention

Decorator components find their target table via `data-brut-table="<table-id>"`. Export reads only **visible** rows (skips `hidden` rows from filter/pagination + skips `data-brut-row-expansion` rows from row-expand) and only **visible** columns (skips `display:none` cells from column-visibility). It also prefers hidden inline-edit values when present.

## Tokens available

Color: `--ink`, `--paper`, `--paper-2`, `--bone`, `--concrete-50..500`, `--primary*`, `--pop-*`, `--success*`, `--warning*`, `--danger*`, `--info*` • Type: `--font-display/sans/mono`, `--fs-xs..6xl`, `--lh-*`, `--tracking-*`, `--fw-*`, `--num-tabular` • Border: `--bw-1..5` • Radius: `--r-0..3` • Shadow: `--shadow-xs..2xl` • Spacing: `--sp-1..20` • Motion: `--ease-snap`, `--ease-instant`, `--dur-fast/base/slow`

## E2E test recipe

1. **Build**: `bash build.sh` — exit 0; `dist/brut.css`/`dist/brut.js` non-zero.
2. **Constraint greps**:
   - `grep -nE "rgba\\(|linear-gradient|radial-gradient" src/components.css`
   - `grep -rE "import .* from |require\\(|React|jsx|text/babel" src/ docs/ preview/`
   - Your appended CSS only: no untokenized hex/px/rem.
3. **Browser smoke** via `claude-in-chrome`:
   - Navigate to `file://<ABS>/preview/components-table-export.html`.
   - Use `mcp__Claude_in_Chrome__javascript_tool` to monkey-patch `URL.createObjectURL` and capture the Blob: `var captured; URL.createObjectURL = function(b) { captured = b; return 'blob:test'; };`
   - Click the "Export CSV" button.
   - Read `captured.text()` (returns a Promise) and confirm the CSV starts with the column headers and includes a row from the table.
   - Repeat for JSON; confirm the body parses to an array of objects with the right keys.
   - `read_console_messages` — no errors.
4. **Screenshot** preview; embed path in PR.

## Worker instructions (verbatim)

After you finish implementing the change:

1. **Simplify** — Invoke the `Skill` tool with `skill: "simplify"`.
2. **Run unit tests** — No test suite. `bash build.sh` exit 0 + non-zero dist/* + constraint greps.
3. **Test end-to-end** — Follow the e2e recipe above.
4. **Commit and push** — Commit (`feat(table-export): CSV/JSON export of visible rows`), push, `gh pr create`.
5. **Report** — End with `PR: <url>` (or `PR: none — <reason>`).
