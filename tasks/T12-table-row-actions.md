# T12 — table-row-actions

You are unit **12 of 20** in a parallel batch building an advanced table component for a vanilla HTML/CSS/JS UI kit.

## Overall goal

Build out an advanced data-table with vast features. Each unit is one decorator on top of the existing `<table class="brut-table">`. Your unit is independent — you do **NOT** modify [src/js/components/table.js](../src/js/components/table.js) or the existing `.brut-table*` CSS block at [src/components.css:380-438](../src/components.css).

## Your unit — per-row action menu (CSS + JS)

Each row gets a small kebab `≡` button in its last cell. Clicking opens a shared menu (one menu, anchored differently per row) listing actions like "Edit", "Duplicate", "Delete". Selecting an action dispatches `brut:row-action` `{ action, row }` so the page can wire concrete behavior.

**Hook**: `data-brut-row-actions="<menu-id>"` on a `<button>` placed in any cell of the row. The matching `<div class="brut-menu" data-brut="menu" id="<menu-id>">` is shared across all rows.

**Classes to introduce:**

- `.brut-table__row-actions-btn` — the kebab button (24×24, ink border, `--shadow-xs`). Reuses `.brut-btn` style if convenient, or its own minimal style.

## Files to create

1. **CSS append** — banner `TABLE — ROW ACTIONS` in [src/components.css](../src/components.css). Style the kebab button — small, square, ink border `--bw-2`, `--shadow-xs`, paper bg, hover lifts up-and-left (existing language). The menu reuses `.brut-menu` from the kit.

2. **JS** — new file `src/js/components/table-row-actions.js`:
   ```js
   (function () {
     Brut.register('table-row-actions', {
       selector: '[data-brut-row-actions]',
       init: function (btn) {
         btn.setAttribute('type', 'button');
         var menuId = btn.getAttribute('data-brut-row-actions');
         if (!menuId) return;
         // Reuse menu.js — link the trigger
         btn.setAttribute('data-brut-menu-open', menuId);

         var row = btn.closest('tr');

         var menu = document.getElementById(menuId);
         if (menu) {
           // Wire each menu item once (idempotent via a flag)
           if (!menu.__brutRowActionsWired) {
             menu.__brutRowActionsWired = true;
             menu.addEventListener('click', function (e) {
               var item = e.target.closest('[data-brut-action]');
               if (!item) return;
               var action = item.getAttribute('data-brut-action');
               // The row that triggered the menu is whichever row's button most recently received focus.
               // The menu component should set this on open; we read it from the menu's anchor.
               var anchor = menu.__brutAnchor || btn;
               var anchorRow = anchor.closest('tr');
               anchor.dispatchEvent(new CustomEvent('brut:row-action', {
                 detail: { action: action, row: anchorRow },
                 bubbles: true
               }));
             });
           }
         }

         btn.addEventListener('click', function () {
           if (menu) menu.__brutAnchor = btn;
         }, true);

         // Optional: announce row context on open (for screen readers)
         btn.addEventListener('keydown', function (e) {
           if (e.key === 'Enter' || e.key === ' ') {
             if (menu) menu.__brutAnchor = btn;
           }
         });
       }
     });
   })();
   ```

3. **Preview** — `preview/components-table-row-actions.html`. A 6-row table; each row has a final `<td>` containing `<button data-brut-row-actions="row-menu">≡</button>`. A single shared menu:
   ```html
   <div class="brut-menu" data-brut="menu" id="row-menu">
     <button class="brut-menu__item" data-brut-action="edit">Edit</button>
     <button class="brut-menu__item" data-brut-action="duplicate">Duplicate</button>
     <button class="brut-menu__item" data-brut-action="delete">Delete</button>
   </div>
   ```
   Add a small `<output>` below the table that listens for `brut:row-action` and prints the action + row index. This proves the wiring works.

4. **Docs append** — sidebar `<a href="#table-row-actions">Table — Row Actions</a>` + `<section id="table-row-actions">` with `<h2>`, lead, live preview, snippet.

## Hard constraints (paste-verbatim from AGENTS.md)

- No JS frameworks, JSX, transpilers, preprocessors, new deps.
- **No hex / px / rem outside [src/tokens.css](../src/tokens.css).**
- No gradients, `rgba()` shadows, blurred shadows.
- No rounded corners beyond `--r-0..3`.
- No animation longer than 140ms.
- Borders are 4px ink (`--bw-3`); 3px small (`--bw-2`).

## JavaScript rules

- Single IIFE. Register via `Brut.register('table-row-actions', { selector: '[data-brut-row-actions]', init })`.
- Hook on the **attribute** `data-brut-row-actions` (with a value = the menu id). Never on a class.
- No imports, requires, or CDN.
- Wired buttons get `setAttribute('type','button')`.
- Dispatch `CustomEvent('brut:row-action', { detail: { action, row }, bubbles: true })` from the **anchor button** that opened the menu, when an item is clicked.
- **Reuse [src/js/components/menu.js](../src/js/components/menu.js)** — emit `[data-brut-menu-open="<id>"]` on the trigger and read items by `[data-brut-action="<name>"]`. Do NOT reimplement menu logic.

## Cross-unit convention

Decorator components find their target table via `data-brut-table="<table-id>"`, except row-scoped decorators (this one) attach to a `<button>` inside a `<tr>` and walk `closest('tr')` to find the row.

## Tokens available

Color: `--ink`, `--paper`, `--paper-2`, `--bone`, `--concrete-50..500`, `--primary*`, `--pop-*`, `--success*`, `--warning*`, `--danger*`, `--info*` • Type: `--font-display/sans/mono`, `--fs-xs..6xl`, `--lh-*`, `--tracking-*`, `--fw-*`, `--num-tabular` • Border: `--bw-1..5` • Radius: `--r-0..3` • Shadow: `--shadow-xs..2xl` • Spacing: `--sp-1..20` • Motion: `--ease-snap`, `--ease-instant`, `--dur-fast/base/slow`

## E2E test recipe

1. **Build**: `bash build.sh` — exit 0; `dist/brut.css`/`dist/brut.js` non-zero.
2. **Constraint greps**:
   - `grep -nE "rgba\\(|linear-gradient|radial-gradient" src/components.css`
   - `grep -rE "import .* from |require\\(|React|jsx|text/babel" src/ docs/ preview/`
   - Your appended CSS only: no untokenized hex/px/rem.
3. **Browser smoke** via `claude-in-chrome`:
   - Navigate to `file://<ABS>/preview/components-table-row-actions.html`.
   - Click the kebab button on row 3; confirm the shared menu opens.
   - Click "Edit"; confirm the page's `<output>` shows `edit (row 3)`.
   - `read_console_messages` — no errors.
4. **Screenshot** preview with menu open; embed path in PR.

## Worker instructions (verbatim)

After you finish implementing the change:

1. **Simplify** — Invoke the `Skill` tool with `skill: "simplify"`.
2. **Run unit tests** — No test suite. `bash build.sh` exit 0 + non-zero dist/* + constraint greps.
3. **Test end-to-end** — Follow the e2e recipe above.
4. **Commit and push** — Commit (`feat(table-row-actions): per-row action menu`), push, `gh pr create`.
5. **Report** — End with `PR: <url>` (or `PR: none — <reason>`).
