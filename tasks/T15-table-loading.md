# T15 — table-loading

You are unit **15 of 20** in a parallel batch building an advanced table component for a vanilla HTML/CSS/JS UI kit.

## Overall goal

Build out an advanced data-table with vast features. Each unit is one decorator on top of the existing `<table class="brut-table">`. Your unit is independent — you do **NOT** modify [src/js/components/table.js](../src/js/components/table.js) or the existing `.brut-table*` CSS block at [src/components.css:380-438](../src/components.css).

## Your unit — loading skeleton (pure CSS)

Skeleton placeholder rows for the table while data loads. No fade, no spin — just an instant ink-bar shimmer that snaps using `--ease-instant` (steps), so it doesn't violate the kit's "no smooth animation" voice.

**Classes to introduce:**

- `.brut-table--loading` — modifier on `<table>` (host applies it while loading)
- `.brut-table__skel-row` — a placeholder `<tr>` (host emits N of these inside `<tbody>`)
- `.brut-table__skel` — a placeholder bar element inside cells (height = `--sp-3`, ink fill, occupies a fraction of the cell width)
- A keyframe animation that toggles the ink bar between `--concrete-200` and `--concrete-300` in 80ms steps (no smooth interpolation):

```css
@keyframes brut-table-skel {
  0%   { background: var(--concrete-200); }
  50%  { background: var(--concrete-300); }
  100% { background: var(--concrete-200); }
}
.brut-table__skel {
  display: block;
  height: var(--sp-3);
  background: var(--concrete-200);
  animation: brut-table-skel var(--dur-base) var(--ease-instant) infinite;
}
```

**No JS file.** Pure CSS.

## Files to create

1. **CSS append** — banner `TABLE — LOADING` in [src/components.css](../src/components.css). Define the keyframe + classes. Skeleton bars vary in width via inline `style="width: 40%"` (host's choice) — the class itself sets a sensible default of 70%.

2. **Preview** — `preview/components-table-loading.html`. Two variants:
   - A `.brut-table.brut-table--loading` with 6 placeholder rows (`<tr class="brut-table__skel-row">`) where each cell contains a `<span class="brut-table__skel" style="width: …%"></span>`.
   - A toggle button (inline script) that swaps `--loading` ↔ real rows, demonstrating the swap is instant.

3. **Docs append** — sidebar `<a href="#table-loading">Table — Loading</a>` + `<section id="table-loading">` with `<h2>`, lead, live preview, snippet.

## Hard constraints (paste-verbatim from AGENTS.md)

- No JS frameworks, JSX, transpilers, preprocessors, new deps.
- **No hex / px / rem outside [src/tokens.css](../src/tokens.css).** The inline `style="width: …%"` percentages are layout data, not visual tokens — fine.
- No gradients, `rgba()` shadows, blurred shadows.
- No rounded corners beyond `--r-0..3`.
- **No animation longer than 140ms.** The keyframe duration is `--dur-base` (140ms). The shimmer is rapid by design.
- Use `--ease-instant` (`steps(1, end)`) so the animation snaps between two states — this matches the kit's "no smooth ease" rule.
- Borders are 4px ink (`--bw-3`); 3px small (`--bw-2`).

## Tokens available

Color: `--ink`, `--paper`, `--paper-2`, `--bone`, `--concrete-50..500`, `--primary*`, `--pop-*`, `--success*`, `--warning*`, `--danger*`, `--info*` • Type: `--font-display/sans/mono`, `--fs-xs..6xl`, `--lh-*`, `--tracking-*`, `--fw-*`, `--num-tabular` • Border: `--bw-1..5` • Radius: `--r-0..3` • Shadow: `--shadow-xs..2xl` • Spacing: `--sp-1..20` • Motion: `--ease-snap`, `--ease-instant`, `--dur-fast/base/slow`

## E2E test recipe

1. **Build**: `bash build.sh` — exit 0; `dist/brut.css` non-zero.
2. **Constraint greps**:
   - `grep -nE "rgba\\(|linear-gradient|radial-gradient" src/components.css`
   - `grep -rE "import .* from |require\\(|React|jsx|text/babel" src/ docs/ preview/`
   - Your appended CSS only: no untokenized hex/px/rem.
3. **Browser smoke** via `claude-in-chrome`:
   - Navigate to `file://<ABS>/preview/components-table-loading.html`.
   - `read_page` — confirm 6 skeleton rows render with bars of varying widths.
   - Click the toggle button; confirm the table swaps to real rows instantly.
   - `read_console_messages` — no errors.
4. **Screenshot** preview in loading state; embed path in PR.

## Worker instructions (verbatim)

After you finish implementing the change:

1. **Simplify** — Invoke the `Skill` tool with `skill: "simplify"`.
2. **Run unit tests** — No test suite. `bash build.sh` exit 0 + non-zero dist/* + constraint greps.
3. **Test end-to-end** — Follow the e2e recipe above.
4. **Commit and push** — Commit (`feat(table-loading): skeleton placeholder rows`), push, `gh pr create`.
5. **Report** — End with `PR: <url>` (or `PR: none — <reason>`).
