# T02 — Add arrow-key navigation to `tabs.js`

**Severity:** A11Y
**Effort:** S
**Touches:** `src/js/components/tabs.js` (single file)

## Why
S6 scan: `tabs.js` has 0 keydown handlers. WAI-ARIA tabs pattern requires Left/Right (or Up/Down for vertical) to move focus between tabs, plus Home/End to jump to first/last. Click-only tabs are inaccessible to keyboard users.

## Goal
Inside the existing IIFE, add a single `keydown` listener on the tab list. Implement: ArrowLeft/ArrowRight to move focus to prev/next tab and activate it; Home/End to jump to first/last; wrap at the ends.

## Steps
1. Read the current `tabs.js` end-to-end. Find where tab buttons are wired.
2. Add `keydown` handler that runs only when `event.target` is a `.brut-tab`. Switch on `event.key`:
   - `ArrowLeft` → focus & activate previous tab (wrap to last).
   - `ArrowRight` → focus & activate next (wrap to first).
   - `Home` → first tab.
   - `End` → last tab.
   - `event.preventDefault()` for handled keys only.
3. Reuse the existing activation function (the one the click handler calls) — do not duplicate logic.
4. Ensure each `.brut-tab` button has `tabindex="0"` on the active tab, `tabindex="-1"` on the others, so Tab moves *out* of the group rather than through every tab (roving tabindex pattern). Update tabindex inside the activation function so it stays correct after every change.
5. Dispatch the existing `brut:change` event from the activation function (already happens — confirm it fires for keyboard activations too).

## Constraints (from AGENTS.md)
- Idempotent init. Don't bind global listeners on every init.
- Keyboard support: respond to Space and Enter on focusable elements; set `role`, `tabindex`, `aria-checked`/`aria-selected`/`aria-expanded` where appropriate.
- No new deps, no frameworks, plain DOM only.

## Verify
```bash
bash build.sh
```
Open `preview/components-tabs.html`. Tab into the tab list, press Right/Left/Home/End — focus moves and the matching panel shows. Press Tab again — focus leaves the group (does not iterate every tab).

## Done when
- Build green.
- Keyboard navigation works as specified in a browser.
- No other file touched.
