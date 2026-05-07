---
name: brut-section-rewrite
description: Rewrite a docs/index.html section in canonical BRUT shape, sourced from dist/components.json. Use when the user asks to "rewrite the X docs section", "fix the X docs section", "regenerate X in docs/index.html", or when `npx brut doctor` reports DOCS_SECTION_SHAPE or SNIPPET_PREVIEW_DRIFT for a single component.
---

# brut-section-rewrite

Rewrites one `<section class="docs-section" id="<docs-id>">` in `docs/index.html` to match BRUT's canonical shape, with content sourced from the manifest and the preview page. The manifest description is authoritative for the lead paragraph — never invent copy.

## When to use

- User says: "rewrite the X docs section", "fix the X docs", "regenerate the X section", "make X canonical".
- `npx brut doctor` emits `DOCS_SECTION_SHAPE` or `SNIPPET_PREVIEW_DRIFT` for a single component and the user wants it fixed.

## When NOT to use

- Foundation sections (`colors`, `spacing`, `typography`, `typography-primitives`, `borders`, `shadows`, `utilities`, `validation`, `field`, `fieldset`, `form-layouts`, `grid-12col`, `input-group`, `install`, `build`, `layout-*`). These are exempt from canonical shape.
- Adding new sections — use the component-add workflow.
- Bulk rewrites across the whole page — run this skill section-by-section so each one is verified.

## Inputs

One **component name**. The user may say it in plural form (e.g. "buttons"); resolve the manifest entry by trying the name as given, plus singularizations: strip trailing `s` or `es`, plus the irregular alias `buttons → btn`, `toggles → switch`. The docs section id is the user's name as given (typically plural).

## Procedure

1. **Resolve manifest entry.** Read `dist/components.json`. Find `entry = components.find(c => c.name === <singular>)`. If `entry.description` is missing or empty, **STOP** and tell the user: "manifest entry for `<singular>` has no description — backfill it before rewriting (e.g., add to the meta.js or fix in src/config/vite-plugin.js)". Never invent copy.
2. **Read canonical preview.** Open `preview/components-<docs-id>.html`. Identify the variants (each `.brut-<class>--<modifier>` element). Note the parent tag (`button`, `span`, `div`, etc.) and any required structural children (e.g., alerts have `<div class="brut-alert__icon">`).
3. **Rewrite the section in `docs/index.html`** to exactly:
   ```
   <section class="docs-section" id="<docs-id>">
     <h2>{Title Case of docs-id}</h2>
     <p class="lead">{entry.description}</p>
     <div class="docs-preview">
       {one element per variant from the preview page, including the unmodified base}
     </div>
     <pre class="docs-snippet">{HTML-escaped, identical variant set}</pre>
   </section>
   ```
   Keep the indentation that surrounds the existing section (typically 6 spaces). Escape `<` `>` `"` `&` in the snippet.
4. **Variant set must match between preview div and snippet pre**, or `SNIPPET_PREVIEW_DRIFT` will fire again. Include the base (unmodified) variant first, then each modifier in the order the preview page declares them.
5. **Run verification (mandatory before reporting done).**

## Verification

```bash
pnpm build
npx brut doctor 2>&1 | grep -E "DOCS_SECTION_SHAPE|SNIPPET_PREVIEW_DRIFT" | grep '"<docs-id>"'
```

That grep must return zero lines. If anything still fires for `<docs-id>`, fix and re-run — don't report done.

Then visual + smoke:

```bash
pnpm test:smoke 2>&1 | tail -5
```

Smoke must pass. If a baseline shifted intentionally because of the rewrite, regenerate via `pnpm test:visual:update` (only after manual visual review).

Finally, open `docs/index.html#<docs-id>` in a browser and confirm: heading reads correctly, lead paragraph is one sentence from the manifest, preview shows every variant the page intends, snippet copy-pastes 1:1.

## Hard rules

- Never invent the lead paragraph. Source from `entry.description`.
- Never reduce the variant set in the snippet vs. the preview. The snippet is what the user copy-pastes; it must reflect the full set.
- Never edit `dist/components.json` from this skill — if the manifest is missing data, stop and tell the user.
- Never touch foundation sections (see "When NOT to use").
- One section per invocation. Don't batch.
