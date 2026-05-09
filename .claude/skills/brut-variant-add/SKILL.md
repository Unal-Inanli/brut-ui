---
name: brut-variant-add
description: Add a modifier variant to an existing BRUT component (e.g., --brand button, --lg switch). Ensures 4-surface sync across CSS, preview, docs, and manifest. Use when the user asks to "add a --X variant", "add a large Y", "add color variants for Z".
---

# brut-variant-add

Adds a `.brut-<component>--<variant>` modifier to an existing component, keeping all 4 surfaces in sync: CSS, preview page, docs section, and manifest metadata.

## When to use

- User says: "add a --brand button", "add a large switch", "add color variants for badge", "add a --outline card".
- A new visual or behavioral variant is needed for an existing component.

## When NOT to use

- Creating an entirely new component — use `brut-component-add`.
- Rewriting a docs section without CSS changes — use `brut-section-rewrite`.
- The variant requires a new design token that doesn't exist yet — add the token first (Workflow E / `brut-token-rename`), then come back to this skill.

## Inputs

- **Component name** (e.g., `btn`, `badge`, `switch`)
- **Variant name** (e.g., `brand`, `lg`, `outline`)
- Optionally: the visual intent (color, size, shape, behavior)

## Phase 1 — Scope (before any edits)

1. **Read the component's CSS block** in `src/components.css`. Find `.brut-<component>` and all existing `--<modifier>` selectors. Understand the component's intent tokens (e.g., `--btn-bg`, `--btn-fg`, `--btn-border-w`).
2. **Decide variant type:**
   - **Pure CSS variant** — overrides existing intent tokens only, no new tokens needed.
   - **Theme-extending variant** — needs a new intent token. If so, add it to `src/tokens/` (appropriate layer) FIRST.
3. **Check if the variant already exists.** `grep "\.brut-<component>--<variant>" src/components.css` — if it returns results, the variant exists; update rather than duplicate.

## Phase 2 — Edits (4 surfaces, sequential)

### Surface 1: CSS
- **File:** `src/components.css`
- **Action:** Add `.brut-<component>--<variant>` selector block immediately after the existing modifiers for this component.
- **Rules:** Override only the relevant intent tokens. NEVER hardcode color/px/rem values — if a primitive is needed, route through a new intent token added to `src/tokens/` first. Keep the modifier block minimal.
- **Verify:** `grep "\.brut-<component>--<variant>" src/components.css` returns the new selector.

### Surface 2: Preview page
- **File:** `preview/components-<component>.html`
- **Action:** Add an example of the new variant to the preview page, alongside existing variants.
- **Rules:** Place after the last existing variant. Include a label or heading indicating the variant name.
- **Verify:** File contains the new modifier class.

### Surface 3: Docs section
- **File:** `docs/index.html`
- **Action:** Add the variant to both the `<div class="docs-preview">` and the `<pre class="docs-snippet">` in the component's section.
- **Rules:** Preview and snippet must match exactly (SNIPPET_PREVIEW_DRIFT). Escape HTML entities in the snippet.
- **Verify:** Both preview div and snippet pre contain the new modifier.

### Surface 4: Manifest metadata (interactive components only)
- **File:** `src/js/components/<component>.meta.js` (interactive) or `src/config/static-meta.js` (static)
- **Action:** Append to the `modifiers` array: `{ name: '--<variant>', description: '<What it does>' }`.
- **Verify:** The modifiers array contains the new entry.

## Verification

```bash
# 1. Build
pnpm build

# 2. Check all 4 surfaces have the variant
grep "\.brut-<component>--<variant>" src/components.css
grep "brut-<component>--<variant>" preview/components-<component>.html
grep "brut-<component>--<variant>" docs/index.html

# 3. Doctor — no drift warnings for this component
npx brut doctor 2>&1 | grep -i "<component>"

# 4. Visual: removing the modifier class returns default appearance
```

Open the preview page in a browser. Confirm the variant renders distinctly from the base, and removing the modifier class restores default appearance pixel-for-pixel.

## Hard rules

- Never hardcode values in the variant — always route through tokens.
- Preview div and snippet pre must match (prevents SNIPPET_PREVIEW_DRIFT).
- Never remove or alter existing variants — only add.
- One variant per invocation. For multiple variants, run the skill multiple times.
- Class naming is BEM-flat: `.brut-<component>--<variant>`, never nested.
