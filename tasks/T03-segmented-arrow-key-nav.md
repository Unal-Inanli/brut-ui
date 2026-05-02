# T03 — Add arrow-key navigation to `segmented.js`

**Severity:** A11Y
**Effort:** S
**Touches:** `src/js/components/segmented.js` (single file)

## Why
S6 scan: 0 keydown handlers. A segmented control is a one-of-N choice group — same WAI-ARIA pattern as tabs/radio. Without arrow keys, keyboard users must Tab through every option.

## Goal
Add Left/Right (and Up/Down for completeness) to move the selection between `.brut-seg__btn` buttons, with wrap. Home/End to jump to first/last.

## Steps
1. Read `segmented.js`. Identify the existing select function called on click.
2. Add a `keydown` handler on the `.brut-seg` container. On `ArrowLeft`/`ArrowUp` → select previous; `ArrowRight`/`ArrowDown` → select next; `Home`/`End` → first/last. Wrap.
3. After selection, focus the newly active button (`btn.focus()`) so the user can keep navigating.
4. Apply roving tabindex: active button `tabindex="0"`, others `tabindex="-1"`. Update inside the select function so click and keyboard stay consistent.
5. Confirm `brut:change` fires for keyboard activations too.

## Constraints (from AGENTS.md)
- Always `setAttribute('type', 'button')` on any `<button>` you wire.
- Keyboard support: set `role`, `tabindex`, `aria-checked`/`aria-selected` where appropriate.
- Mirror state to a hidden `<input>`. The hidden input is the source of truth.

## Verify
```bash
bash build.sh
```
Open `preview/components-buttons.html` (or wherever segmented appears). Tab into the segmented control; arrow keys move selection; hidden input updates each time.

## Done when
- Build green.
- Browser test passes; only `segmented.js` changed.
