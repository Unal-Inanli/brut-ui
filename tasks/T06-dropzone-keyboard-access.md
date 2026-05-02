# T06 — Make `dropzone.js` keyboard-accessible

**Severity:** A11Y
**Effort:** XS
**Touches:** `src/js/components/dropzone.js` (single file)

## Why
S6 scan: 0 a11y attributes, 0 key handlers. The dropzone wraps a hidden file input; pointer users can click to open the picker, but keyboard users can't reach or trigger it.

## Goal
The dropzone element becomes a keyboard-operable trigger. Tab focuses it; Enter or Space opens the file picker (clicks the hidden input).

## Steps
1. Read `dropzone.js`. Find where the hidden `<input type="file">` is referenced and where its click is triggered (today: only via the drop event or a visible button).
2. In `init`, set on the wrapper element: `tabindex="0"`, `role="button"`, `aria-label` derived from existing visible label text (or fall back to "Choose files").
3. Add `keydown` handler: on `Enter` or `' '` (Space), `event.preventDefault()` and call the same code path that the click handler uses to open the picker.
4. Ensure the focus ring matches existing focus styles (the BRUT focus shadow / outline already applies via CSS — confirm visually; do not add new CSS in this task).

## Constraints (from AGENTS.md)
- Fail soft: if required child elements are missing, return early.
- No CSS changes in this task — JS only.
- Idempotent init.

## Verify
```bash
bash build.sh
```
Open `preview/components-inputs.html` (or wherever dropzone appears). Tab to dropzone — visible focus ring; press Enter then Space — file picker opens both times.

## Done when
- Build green; keyboard opens picker; only `dropzone.js` changed.
