# T11 — table-row-expand

You are unit **11 of 20** in a parallel batch building an advanced table component for a vanilla HTML/CSS/JS UI kit.

## Overall goal

Build out an advanced data-table with vast features. Each unit is one decorator on top of the existing `<table class="brut-table">`. Your unit is independent — you do **NOT** modify [src/js/components/table.js](../src/js/components/table.js) or the existing `.brut-table*` CSS block at [src/components.css:380-438](../src/components.css).

## Your unit — expandable rows (CSS + JS)

Each expandable row has a chevron in its first cell. Click toggles a sibling `<tr>` immediately below whose single cell spans all columns and shows the expansion content (provided as a `<template>` referenced by id, or as a child element with `data-brut-row-detail`).

**Hook**: `data-brut="table-row-expand"` on a `<tr>`. The expansion content is found via `data-brut-row-detail="<id-of-template>"` or as a child `<template data-brut-row-detail>`.

**Classes to introduce:**

- `.brut-table__chevron` — the chevron button (small, no border, just `▸` text rotating to `▾`). Set `transition: transform var(--dur-base) var(--ease-snap);` and `transform: rotate(0)` → `rotate(90deg)` when row is expanded.
- `.brut-table__row--expanded` — modifier on the parent row when its detail is open.
- `.brut-table__expansion` — the inserted detail row (`<tr>`).
- `.brut-table__expansion-cell` — the single `<td>` that spans all columns (uses `colspan` set in JS).

## Files to create

1. **CSS append** — banner `TABLE — ROW EXPAND` in [src/components.css](../src/components.css). Style the chevron button (24×24, ink color, no bg, `--fs-sm`), the expansion row (paper-2 background, ink top border `--bw-1`, padding `--sp-4` `--sp-5` for the inner cell). Animate chevron rotation only — no fade on the row.

2. **JS** — new file `src/js/components/table-row-expand.js`:
   ```js
   (function () {
     Brut.register('table-row-expand', {
       selector: '[data-brut="table-row-expand"]',
       init: function (tr) {
         var firstCell = tr.children[0];
         if (!firstCell) return;
         var detailRef = tr.getAttribute('data-brut-row-detail');
         var template = detailRef ? document.getElementById(detailRef) : tr.querySelector('template[data-brut-row-detail]');
         if (!template) return;

         var chevron = document.createElement('button');
         chevron.setAttribute('type', 'button');
         chevron.className = 'brut-table__chevron';
         chevron.setAttribute('aria-expanded', 'false');
         chevron.setAttribute('aria-label', 'Expand row');
         chevron.textContent = '▸';
         firstCell.insertBefore(chevron, firstCell.firstChild);

         var open = false;
         var detailRow = null;
         var colspan = tr.children.length;

         function build() {
           var node = template.content ? template.content.cloneNode(true) : template.cloneNode(true).children[0] || template;
           detailRow = document.createElement('tr');
           detailRow.className = 'brut-table__expansion';
           detailRow.setAttribute('data-brut-row-expansion', '');
           var td = document.createElement('td');
           td.className = 'brut-table__expansion-cell';
           td.colSpan = colspan;
           td.appendChild(node);
           detailRow.appendChild(td);
           tr.parentNode.insertBefore(detailRow, tr.nextSibling);
         }

         function toggle() {
           open = !open;
           tr.classList.toggle('brut-table__row--expanded', open);
           chevron.setAttribute('aria-expanded', open ? 'true' : 'false');
           chevron.textContent = open ? '▾' : '▸';
           if (open) {
             if (!detailRow) build();
             else detailRow.removeAttribute('hidden');
           } else if (detailRow) {
             detailRow.setAttribute('hidden', '');
           }
           tr.dispatchEvent(new CustomEvent('brut:change', { detail: { expanded: open }, bubbles: true }));
         }

         chevron.addEventListener('click', toggle);
         chevron.addEventListener('keydown', function (e) {
           if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
         });
       }
     });
   })();
   ```

3. **Preview** — `preview/components-table-row-expand.html`. A 6-row table where each row has `data-brut="table-row-expand"` and `data-brut-row-detail="row-N-tpl"`, with corresponding `<template id="row-N-tpl">` blocks containing arbitrary detail content (a `<dl>`, a small chart placeholder, etc.).

4. **Docs append** — sidebar `<a href="#table-row-expand">Table — Row Expand</a>` + `<section id="table-row-expand">` with `<h2>`, lead, live preview, snippet.

## Hard constraints (paste-verbatim from AGENTS.md)

- No JS frameworks, JSX, transpilers, preprocessors, new deps.
- **No hex / px / rem outside [src/tokens.css](../src/tokens.css).**
- No gradients, `rgba()` shadows, blurred shadows.
- No rounded corners beyond `--r-0..3`.
- No animation longer than 140ms (the chevron rotation must use `--dur-base` 140ms max).
- Borders are 4px ink (`--bw-3`); 3px small (`--bw-2`); 2px `--bw-1` for the expansion row top divider.

## JavaScript rules

- Single IIFE. Register via `Brut.register('table-row-expand', { selector: '[data-brut="table-row-expand"]', init })`.
- Hook on `data-brut="table-row-expand"` — never on a class.
- No imports, requires, or CDN.
- Wired buttons get `setAttribute('type','button')`.
- Dispatch `CustomEvent('brut:change', { detail: { expanded }, bubbles: true })` on every toggle.
- Keyboard support: Enter and Space toggle the row.

## Cross-unit convention

Decorator components find their target table via `data-brut-table="<table-id>"`, except row-scoped decorators (this one) attach to the `<tr>` directly. The detail row carries `data-brut-row-expansion` so other decorators (filter, pagination) can skip it.

## Tokens available

Color: `--ink`, `--paper`, `--paper-2`, `--bone`, `--concrete-50..500`, `--primary*`, `--pop-*`, `--success*`, `--warning*`, `--danger*`, `--info*` • Type: `--font-display/sans/mono`, `--fs-xs..6xl`, `--lh-*`, `--tracking-*`, `--fw-*`, `--num-tabular` • Border: `--bw-1..5` • Radius: `--r-0..3` • Shadow: `--shadow-xs..2xl` • Spacing: `--sp-1..20` • Motion: `--ease-snap`, `--ease-instant`, `--dur-fast/base/slow`

## E2E test recipe

1. **Build**: `bash build.sh` — exit 0; `dist/brut.css`/`dist/brut.js` non-zero.
2. **Constraint greps**:
   - `grep -nE "rgba\\(|linear-gradient|radial-gradient" src/components.css`
   - `grep -rE "import .* from |require\\(|React|jsx|text/babel" src/ docs/ preview/`
   - Your appended CSS only: no untokenized hex/px/rem.
3. **Browser smoke** via `claude-in-chrome`:
   - Navigate to `file://<ABS>/preview/components-table-row-expand.html`.
   - Click the chevron in the first row. Confirm the expansion `<tr>` appears below with detail content.
   - Click again; confirm it collapses.
   - Press Enter on a chevron after focusing it (`mcp__Claude_in_Chrome__javascript_tool`: focus + dispatch keydown). Confirm toggle works.
   - `read_console_messages` — no errors.
4. **Screenshot** preview with one row expanded; embed path in PR.

## Worker instructions (verbatim)

After you finish implementing the change:

1. **Simplify** — Invoke the `Skill` tool with `skill: "simplify"`.
2. **Run unit tests** — No test suite. `bash build.sh` exit 0 + non-zero dist/* + constraint greps.
3. **Test end-to-end** — Follow the e2e recipe above.
4. **Commit and push** — Commit (`feat(table-row-expand): expandable detail rows`), push, `gh pr create`.
5. **Report** — End with `PR: <url>` (or `PR: none — <reason>`).
