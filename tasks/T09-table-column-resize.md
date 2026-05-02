# T09 — table-column-resize

You are unit **9 of 20** in a parallel batch building an advanced table component for a vanilla HTML/CSS/JS UI kit.

## Overall goal

Build out an advanced data-table with vast features. Each unit is one decorator on top of the existing `<table class="brut-table">`. Your unit is independent — you do **NOT** modify [src/js/components/table.js](../src/js/components/table.js) or the existing `.brut-table*` CSS block at [src/components.css:380-438](../src/components.css).

## Your unit — pointer-drag column resize (CSS + JS)

Adds a vertical drag handle on the right edge of every header cell. Pointer-drag widens or narrows the column. Persisted as inline `width:` on a matching `<col>` element inside a `<colgroup>`. Min width 60px (in token-spacing terms: roughly `--sp-12`+1 — but we set min via JS `Math.max`). Snap to 4px grid for stability.

**Hook**: `data-brut="table-resize"` on a `<table>`. The table must have `<colgroup><col>…</colgroup>` matching its column count (the worker generates `<col>` elements at init if the host markup omits them).

**Classes to introduce:**

- `.brut-table--resizable` — modifier on `<table>` enabling visual cues (cursor: col-resize on handle, indicator stripe on hover)
- `.brut-table__resizer` — the grab handle (8px wide, full header height, positioned absolute right of `<th>`, transparent until hover, ink when dragging)

## Files to create

1. **CSS append** — banner `TABLE — COLUMN RESIZE` in [src/components.css](../src/components.css):
   - `.brut-table--resizable thead th { position: relative; }` (only inside this modifier)
   - `.brut-table__resizer { position: absolute; top: 0; right: 0; width: var(--sp-2); height: 100%; cursor: col-resize; user-select: none; }`
   - `.brut-table__resizer:hover { background: var(--concrete-300); }`
   - `.brut-table__resizer--active { background: var(--ink); }`
   - `.brut-table--resizable { table-layout: fixed; }` — required so column widths are honored.

2. **JS** — new file `src/js/components/table-resize.js`:
   ```js
   (function () {
     Brut.register('table-resize', {
       selector: '[data-brut="table-resize"]',
       init: function (table) {
         table.classList.add('brut-table--resizable');
         var ths = Array.prototype.slice.call(table.querySelectorAll('thead th'));
         // Ensure colgroup
         var colgroup = table.querySelector('colgroup');
         if (!colgroup) {
           colgroup = document.createElement('colgroup');
           ths.forEach(function () { colgroup.appendChild(document.createElement('col')); });
           table.insertBefore(colgroup, table.firstChild);
         }
         var cols = Array.prototype.slice.call(colgroup.querySelectorAll('col'));

         ths.forEach(function (th, i) {
           var col = cols[i];
           if (!col) return;
           // Initialize width from the rendered cell so first drag has a starting point
           if (!col.style.width) col.style.width = th.offsetWidth + 'px';

           var handle = document.createElement('span');
           handle.className = 'brut-table__resizer';
           handle.setAttribute('aria-hidden', 'true');
           th.appendChild(handle);

           var startX = 0, startW = 0;
           function snap(v) { return Math.round(v / 4) * 4; }
           function onMove(e) {
             var dx = (e.clientX || (e.touches && e.touches[0].clientX) || 0) - startX;
             var w = Math.max(60, snap(startW + dx));
             col.style.width = w + 'px';
           }
           function onUp() {
             handle.classList.remove('brut-table__resizer--active');
             window.removeEventListener('pointermove', onMove);
             window.removeEventListener('pointerup', onUp);
             table.dispatchEvent(new CustomEvent('brut:change', {
               detail: { source: 'resize', index: i, width: parseInt(col.style.width, 10) },
               bubbles: true
             }));
           }
           handle.addEventListener('pointerdown', function (e) {
             e.preventDefault();
             startX = e.clientX;
             startW = col.offsetWidth || parseInt(col.style.width, 10) || th.offsetWidth;
             handle.classList.add('brut-table__resizer--active');
             window.addEventListener('pointermove', onMove);
             window.addEventListener('pointerup', onUp);
           });
         });
       }
     });
   })();
   ```

3. **Preview** — `preview/components-table-resize.html`. A 5-column table with `data-brut="table-resize"`. Show that dragging each column header's right edge widens/narrows that column.

4. **Docs append** — sidebar `<a href="#table-resize">Table — Column Resize</a>` + `<section id="table-resize">` with `<h2>`, lead, live preview, snippet.

## Hard constraints (paste-verbatim from AGENTS.md)

- No JS frameworks, JSX, transpilers, preprocessors, new deps.
- **No hex / px / rem outside [src/tokens.css](../src/tokens.css).**
  - The 60px min and 4px snap grid are dynamic JS values, not CSS values, so they're fine. Inline `style="width:Xpx"` is set by JS at runtime — also fine.
- No gradients, `rgba()` shadows, blurred shadows.
- No rounded corners beyond `--r-0..3`.
- No animation longer than 140ms.
- Borders are 4px ink (`--bw-3`); 3px small (`--bw-2`).

## JavaScript rules

- Single IIFE. Register via `Brut.register('table-resize', { selector: '[data-brut="table-resize"]', init })`.
- Hook on `data-brut="table-resize"` — never on a class.
- No imports, requires, or CDN.
- Use `pointerdown` / `pointermove` / `pointerup` (not mousedown — works for touch + pen).
- Dispatch `CustomEvent('brut:change', { detail: { source: 'resize', index, width }, bubbles: true })` on drag end.

## Cross-unit convention

Decorator components find their target table via `data-brut-table="<table-id>"`, except table-scoped decorators (this one) attach directly to the `<table>`. Columns can be identified by their index. The `<colgroup>` is generated if missing.

## Tokens available

Color: `--ink`, `--paper`, `--paper-2`, `--bone`, `--concrete-50..500`, `--primary*`, `--pop-*`, `--success*`, `--warning*`, `--danger*`, `--info*` • Type: `--font-display/sans/mono`, `--fs-xs..6xl`, `--lh-*`, `--tracking-*`, `--fw-*`, `--num-tabular` • Border: `--bw-1..5` • Radius: `--r-0..3` • Shadow: `--shadow-xs..2xl` • Spacing: `--sp-1..20` • Motion: `--ease-snap`, `--ease-instant`, `--dur-fast/base/slow`

## E2E test recipe

1. **Build**: `bash build.sh` — exit 0; `dist/brut.css`/`dist/brut.js` non-zero.
2. **Constraint greps**:
   - `grep -nE "rgba\\(|linear-gradient|radial-gradient" src/components.css`
   - `grep -rE "import .* from |require\\(|React|jsx|text/babel" src/ docs/ preview/`
   - Your appended CSS only: no untokenized hex/px/rem.
3. **Browser smoke** via `claude-in-chrome`:
   - Navigate to `file://<ABS>/preview/components-table-resize.html`.
   - Use `mcp__Claude_in_Chrome__javascript_tool` to simulate a pointer-drag on a header's resize handle: synthesize `pointerdown`, `pointermove` (delta +80px), `pointerup`. Confirm the matching `<col>` width grew by ~80 (snapped to 4).
   - `read_console_messages` — no errors.
4. **Screenshot** preview after manual resize; embed path in PR.

## Worker instructions (verbatim)

After you finish implementing the change:

1. **Simplify** — Invoke the `Skill` tool with `skill: "simplify"`.
2. **Run unit tests** — No test suite. `bash build.sh` exit 0 + non-zero dist/* + constraint greps.
3. **Test end-to-end** — Follow the e2e recipe above.
4. **Commit and push** — Commit (`feat(table-resize): pointer-drag column resize`), push, `gh pr create`.
5. **Report** — End with `PR: <url>` (or `PR: none — <reason>`).
