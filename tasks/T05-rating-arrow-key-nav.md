# T05 — Add arrow-key navigation to `rating.js`

**Severity:** A11Y
**Effort:** XS
**Touches:** `src/js/components/rating.js` (single file)

## Why
S6 scan: 0 keydown handlers. Star ratings should let keyboard users move the rating up/down without clicking.

## Goal
ArrowRight/ArrowUp → increase rating by 1 (cap at max). ArrowLeft/ArrowDown → decrease (floor at 0). Home → 0. End → max.

## Steps
1. Read `rating.js`. Find the existing set-rating function.
2. Add a `keydown` listener on the wrapper. Handle the keys above. `event.preventDefault()` for handled keys.
3. The wrapper itself should be focusable (`tabindex="0"`); set it in `init` if not already.
4. Set `role="slider"`, `aria-valuenow`, `aria-valuemin="0"`, `aria-valuemax="<max>"`, and update `aria-valuenow` inside the set function.
5. Confirm `brut:change` fires for keyboard updates.

## Constraints (from AGENTS.md)
- No animations longer than 140ms.
- Set `role`, `tabindex`, `aria-*` where appropriate.
- Mirror state to a hidden `<input>`.

## Verify
```bash
bash build.sh
```
Open the rating preview, Tab into the rating, press arrow keys — visual stars update, hidden input updates.

## Done when
- Build green; keyboard works; only `rating.js` changed.
