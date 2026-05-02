# T07 — Replace literal spacing pixel values with `--sp-*` tokens in `components.css`

**Severity:** POLISH
**Effort:** M (mechanical, but ~40 sites)
**Touches:** `src/components.css` only

## Why
AGENTS.md hard rule: "No hardcoded design values in components. If you reach for a hex, px, or rem that isn't a token, add a token first." Many `padding`, `margin`, `gap`, `top/left/right/bottom` declarations use literals that already have an exact token in `src/tokens.css`.

## Spacing tokens already defined (from `src/tokens.css`)
```
--sp-1:  4px      --sp-2:  8px      --sp-3: 12px      --sp-4: 16px
--sp-5: 20px      --sp-6: 24px      --sp-8: 32px      --sp-10: 40px
--sp-12: 48px     --sp-16: 64px     --sp-20: 80px
```

## Goal
Replace every literal pixel value in `padding`, `margin`, `gap`, `top`, `right`, `bottom`, `left`, `inset`, and `translate` declarations whose value matches an `--sp-*` token, with the corresponding `var(--sp-N)`. Leave non-matching values alone (those go to T09).

## In scope
- Pure spacing properties only.
- Multi-value shorthand: replace each component independently. Example: `padding: 4px 8px` → `padding: var(--sp-1) var(--sp-2)`.

## Out of scope (do NOT change in this task)
- `width`, `height`, `min-*`, `max-*`, `font-size` — those are component-specific dimensions or typography (T08, T09).
- Values inside `clamp(...)`, `calc(...)`, `var(...)` defaults — leave alone.
- Values inside `linear-gradient` or `box-shadow` — those are non-spacing.
- Values that don't match a token (e.g. `padding: 6px 10px` — 10 is not in the scale; defer to T09).

## Steps
1. `grep -nE "(padding|margin|gap|top|right|bottom|left|inset):" src/components.css` — work the list top to bottom.
2. For each declaration, decide: does every literal map to an `--sp-*` token? If yes, replace; if no, skip and note in `TOKENIZATION-DEFER.md` (create alongside this task).
3. Do not touch any other properties.

## Constraints (from AGENTS.md)
- Use only tokens from `src/tokens.css` (`var(--ink)`, `var(--sp-3)`, …) — never hardcode hex/px/rgb.
- Do not edit `dist/`. Rebuild with `npm run build`.

## Verify
```bash
bash build.sh
# Confirm visual no-regression by diffing the final dist/brut.css for non-spacing changes:
git diff src/components.css | grep -E "^[+-].*padding|^[+-].*margin|^[+-].*gap" | head -40
```
Open `docs/index.html` and 3 random `preview/components-*.html`. Spot-check buttons, cards, alerts, forms — spacing must look identical to before.

## Done when
- Build green.
- `git diff` shows only spacing-related lines changed (no width/height/font-size/color drift).
- Visual smoke test passes.
- `TOKENIZATION-DEFER.md` lists any spacing values that don't map to a token.
