# T03 — table-density

You are unit **3 of 20** in a parallel batch building an advanced table component for a vanilla HTML/CSS/JS UI kit.

## Overall goal

Build out an advanced data-table with vast features. Each unit is one decorator on top of the existing `<table class="brut-table">`. Your unit is independent — you do **NOT** modify [src/js/components/table.js](../src/js/components/table.js) or the existing `.brut-table*` CSS block at [src/components.css:380-438](../src/components.css).

## Your unit — density toggle (CSS + JS)

A 3-state segmented toggle that swaps the density modifier on a target table: **compact** / **regular** / **comfy**. The kit already has `.brut-table--compact`; this unit adds `.brut-table--comfy` and the toggle component.

**Hook**: `data-brut="table-density"` on the toggle wrapper.

**Linked table**: read `data-brut-table="<table-id>"` from the toggle; the matching `<table>` carries `id="<table-id>"`.

**Classes to introduce:**

- `.brut-table-density` — toggle wrapper (segmented button group, ink border + offset shadow)
- `.brut-table-density__btn` — one of three buttons
- `.brut-table-density__btn--active` — current selection (paper-2 bg + inset)
- `.brut-table--comfy` — new modifier on `.brut-table` that increases cell padding to `--sp-4` `--sp-5` (existing `--compact` is `--sp-1` `--sp-3`; default is `--sp-2` `--sp-4`)

## Files to create

1. **CSS append** — banner `TABLE — DENSITY` in [src/components.css](../src/components.css). Style the segmented buttons (3px ink internal dividers between buttons, `--shadow-xs`, `--dur-fast` `--ease-snap` transitions on active) and add `.brut-table--comfy .brut-table__cell { padding: var(--sp-4) var(--sp-5); }`.

2. **JS** — new file `src/js/components/table-density.js`:
   ```js
   (function () {
     Brut.register('table-density', {
       selector: '[data-brut="table-density"]',
       init: function (el) {
         var tableId = el.getAttribute('data-brut-table');
         var table = tableId ? document.getElementById(tableId) : null;
         if (!table) return;
         var name = el.getAttribute('data-brut-name') || 'density';
         // ensure hidden input
         var hidden = el.querySelector('input[type="hidden"][data-brut-density-state]');
         if (!hidden) {
           hidden = document.createElement('input');
           hidden.type = 'hidden';
           hidden.setAttribute('data-brut-density-state', '');
           hidden.name = name;
           el.appendChild(hidden);
         }
         var btns = el.querySelectorAll('[data-density]');
         function apply(value) {
           table.classList.remove('brut-table--compact', 'brut-table--comfy');
           if (value === 'compact') table.classList.add('brut-table--compact');
           else if (value === 'comfy') table.classList.add('brut-table--comfy');
           btns.forEach(function (b) {
             var active = b.getAttribute('data-density') === value;
             b.classList.toggle('brut-table-density__btn--active', active);
             b.setAttribute('aria-pressed', active ? 'true' : 'false');
           });
           hidden.value = value;
           el.dispatchEvent(new CustomEvent('brut:change', { detail: { value: value }, bubbles: true }));
         }
         btns.forEach(function (b) {
           b.setAttribute('type', 'button');
           b.addEventListener('click', function () { apply(b.getAttribute('data-density')); });
         });
         var initial = el.getAttribute('data-brut-default') || 'regular';
         apply(initial);
       }
     });
   })();
   ```

3. **Preview** — `preview/components-table-density.html`. Render a table with `id="demo"` and a `<div data-brut="table-density" data-brut-table="demo" data-brut-default="regular">` toolbar with three buttons (`data-density="compact"`, `regular`, `comfy`). Show that clicking each visually changes the table's row height.

4. **Docs append** — sidebar `<a href="#table-density">Table — Density</a>` + `<section id="table-density">` with `<h2>`, lead, live preview, snippet.

## Hard constraints (paste-verbatim from AGENTS.md)

- No JS frameworks, JSX, transpilers, preprocessors, new deps.
- **No hex / px / rem outside [src/tokens.css](../src/tokens.css).**
- No gradients, `rgba()` shadows, blurred shadows. Hard offset only.
- No rounded corners beyond `--r-0..3`.
- No animation longer than 140ms. Snap, don't ease.
- Borders are 4px ink (`--bw-3`); 3px small (`--bw-2`).

## JavaScript rules

- Single IIFE. Register on `data-brut="table-density"` via `Brut.register`.
- Hook on `data-brut="table-density"` — never on a class.
- No imports, requires, or CDN links.
- Wired `<button>` elements get `setAttribute('type','button')`.
- Mirror state to a hidden `<input>` (read `data-brut-name`; default `density`). Create the input if it doesn't exist.
- Dispatch `CustomEvent('brut:change', { detail: { value }, bubbles: true })` on every committed change.

## Cross-unit convention

Decorator components find their target table via `data-brut-table="<table-id>"`. The decorated `<table>` carries `id="<table-id>"`. Read the id, query `document.getElementById(id)`, and operate on it.

## Tokens available

Color: `--ink`, `--paper`, `--paper-2`, `--bone`, `--concrete-50..500`, `--primary*`, `--pop-*`, `--success*`, `--warning*`, `--danger*`, `--info*` • Type: `--font-display/sans/mono`, `--fs-xs..6xl`, `--lh-*`, `--tracking-*`, `--fw-*`, `--num-tabular` • Border: `--bw-1..5` • Radius: `--r-0..3` • Shadow: `--shadow-xs..2xl` • Spacing: `--sp-1..20` • Motion: `--ease-snap`, `--ease-instant`, `--dur-fast/base/slow`

## E2E test recipe

1. **Build**: `bash build.sh` — exit 0; `dist/brut.css` and `dist/brut.js` non-zero.
2. **Constraint greps**:
   - `grep -nE "rgba\\(|linear-gradient|radial-gradient" src/components.css`
   - `grep -rE "import .* from |require\\(|React|jsx|text/babel" src/ docs/ preview/`
   - Your appended CSS only: no untokenized hex/px/rem.
3. **Browser smoke** via `claude-in-chrome`:
   - Navigate to `file://<ABS>/preview/components-table-density.html`.
   - `read_page` — verify the three buttons + table render.
   - Click each density button (via `find` + `computer`); re-read page; confirm the table's class changes (compact ↔ regular ↔ comfy) and visual row height differs.
   - `read_console_messages` — no errors.
   - Verify hidden input under the toggle has the latest value (use `mcp__Claude_in_Chrome__javascript_tool`: `document.querySelector('[data-brut="table-density"] input[type=hidden]').value`).
   - Also load `file://<ABS>/docs/index.html#table-density`.
4. **Screenshot** preview; embed path in PR.

Fall back to static server + curl if chrome MCP unavailable; note skip.

## Worker instructions (verbatim)

After you finish implementing the change:

1. **Simplify** — Invoke the `Skill` tool with `skill: "simplify"`.
2. **Run unit tests** — No test suite. Substitute: `bash build.sh` exit 0 + non-zero dist/* + constraint greps.
3. **Test end-to-end** — Follow the e2e recipe above via `claude-in-chrome`.
4. **Commit and push** — Commit (`feat(table-density): add density toggle`), push, `gh pr create`.
5. **Report** — End with `PR: <url>` (or `PR: none — <reason>`).
