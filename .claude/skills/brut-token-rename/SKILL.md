---
name: brut-token-rename
description: Safely rename or deprecate a CSS design token without breaking consumers. Creates an alias, updates all in-repo references, adds a migrate rule, and documents in CHANGELOG. Use when the user asks to "rename --X", "deprecate token X", "the token name doesn't match the convention".
---

# brut-token-rename

Renames or deprecates a CSS custom property (design token) with a backwards-compatible alias and a documented migration path. Follows CLAUDE.md Workflow E.

## When to use

- User says: "rename `--btn-bg`", "deprecate token X", "the token name doesn't match the convention".
- A token name needs to change to match the 3-layer naming convention.
- A semantic/intent token is being consolidated or split.

## When NOT to use

- Adding a brand-new token (no old name to alias) — just add it directly to the appropriate layer file.
- Removing a token entirely with no replacement — that's a breaking change requiring user discussion first.
- Renaming a primitive token — primitives are rarely renamed; discuss with user before proceeding.

## Inputs

- **Old token name** (e.g., `--btn-bg`)
- **New token name** (e.g., `--btn-surface`)
- Optionally: whether this is a rename-only (same value, new name) or semantic shift (different value, new name)

## Phase 1 — Impact assessment (read-only)

1. **Find all references.** Grep the old token name across:
   ```bash
   grep -rn "var(--old-name)" src/ dist/ preview/ docs/ demos/ README.md
   ```
   Report the count and file list.

2. **Classify the change:**
   - **Rename only** (same value, new name) — minor version bump
   - **Semantic shift** (different value, new name) — major version bump, requires user confirmation before proceeding

3. **Identify the token's layer.** Which file does it live in?
   - `src/tokens/01-primitives.css` — primitives (rare to rename)
   - `src/tokens/02-semantic.css` — semantic tokens
   - `src/tokens/03-intent.css` — intent/component tokens
   - `src/tokens.css` — legacy single-file (pre-M2)

Report findings to the user before proceeding to edits.

## Phase 2 — Edits (sequential)

### Step 1: Add the new token
- **File:** The appropriate layer file in `src/tokens/`
- **Action:** Add `--new-name: <value>;` in the correct section.
- **Verify:** `grep "\\-\\-new-name" src/tokens/` returns the new definition.

### Step 2: Create the backwards-compatible alias
- **File:** Same layer file
- **Action:** Change the old token to: `--old-name: var(--new-name); /* @deprecated since X.Y, remove in Z.0 */`
- **Rules:** The alias must resolve to the exact same computed value. The deprecation comment must include both the "since" version and the "remove in" version.
- **Verify:** Both `var(--old-name)` and `var(--new-name)` resolve to the same value.

### Step 3: Update all in-repo consumers
- **Files:** All files found in Phase 1
- **Action:** Replace `var(--old-name)` with `var(--new-name)` across `src/`, `preview/`, `docs/`, `demos/`.
- **Rules:** Do NOT update `dist/` — that's rebuilt. Do NOT update the alias line itself (it must keep `--old-name`).
- **Verify:** `grep -rn "var(--old-name)" src/ preview/ docs/ demos/` returns only the alias line.

### Step 4: Update CHANGELOG
- **File:** `CHANGELOG.md`
- **Action:** Add an entry under the current version section documenting the rename and the removal version.
- **Format:** `- **Renamed:** \`--old-name\` → \`--new-name\`. Old name aliased; will be removed in X.0.`

### Step 5: Add migrate rule (if CLI exists)
- **File:** Migrate command config (check `src/cli/commands/migrate.js` or equivalent)
- **Action:** Add a rule that auto-rewrites `var(--old-name)` → `var(--new-name)` in consumer projects.
- **Skip if:** The migrate command doesn't exist yet (pre-M6).

## Verification

```bash
# 1. Build
pnpm build

# 2. Both tokens resolve
grep -n "\\-\\-old-name" src/tokens/
grep -n "\\-\\-new-name" src/tokens/

# 3. Only the alias still references the old name
grep -rn "var(--old-name)" src/ preview/ docs/ demos/
# Should return only the alias line in tokens

# 4. Doctor check (if token deprecation check exists)
npx brut doctor 2>&1 | grep -i "deprecat"
```

## Hard rules

- Never delete the old token in the same release — always alias first.
- The alias must have a `@deprecated since X.Y, remove in Z.0` comment.
- Rename-only = minor bump. Semantic shift = major bump. Classify before editing.
- Never update `dist/` manually — rebuild after edits.
- One token rename per invocation. Chained renames (A→B→C) are separate invocations.
- Report impact assessment to the user before making any edits.
