# T04 — Add keyboard increment/decrement to `stepper.js`

**Severity:** A11Y
**Effort:** XS
**Touches:** `src/js/components/stepper.js` (single file)

## Why
S6 scan: 0 keydown handlers, 0 aria attributes. Native `<input type="number">` already handles ArrowUp/Down — but BRUT's stepper wraps a number input with custom `-`/`+` buttons. Confirm the inner input still receives Up/Down behaviour, OR add it on the wrapper if not.

## Goal
On ArrowUp/PageUp inside the stepper input → call the same increment function the `+` button calls. ArrowDown/PageDown → decrement. Respect `min`/`max`/`step` attributes already on the input.

## Steps
1. Read `stepper.js`. Find the `+` and `-` click handlers.
2. Extract the inc/dec logic into named functions if not already.
3. Add `keydown` handler on the inner `<input>`. Switch on `event.key`: `ArrowUp` → inc, `ArrowDown` → dec, `PageUp` → inc by `step*10` (cap at max), `PageDown` → dec by `step*10` (floor at min). `event.preventDefault()` for handled keys.
4. Add `aria-valuenow`, `aria-valuemin`, `aria-valuemax` to the wrapper element and update them inside the inc/dec function.
5. Set `role="spinbutton"` on the wrapper.

## Constraints (from AGENTS.md)
- Idempotent init.
- Set `role`, `tabindex`, `aria-*` where appropriate; runtime won't add these for you.
- No new deps.

## Verify
```bash
bash build.sh
```
Open `preview/components-forms.html`. Tab into a stepper, press Up/Down/PageUp/PageDown — value changes and clamps at min/max. Hidden input value reflects state.

## Done when
- Build green; stepper responds to keyboard; min/max respected.
