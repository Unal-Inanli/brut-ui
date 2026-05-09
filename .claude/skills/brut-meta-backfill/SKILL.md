---
name: brut-meta-backfill
description: Generate or refresh a component's .meta.js sidecar file from its source (JS, CSS, preview HTML). Use when `npx brut doctor` reports MISSING_META or META_DRIFT, when a component's events/attributes/modifiers changed and metadata is stale, or when the user asks to "backfill X meta", "generate meta for X", "refresh X metadata".
---

# brut-meta-backfill

Creates or updates a single `src/js/components/<name>.meta.js` sidecar file by reading the component's actual source. The meta file is consumed by the Vite plugin to populate `dist/components.json` (the manifest).

## When to use

- User says: "backfill the X meta", "generate meta for X", "refresh X metadata", "fix the X meta.js".
- `npx brut doctor` emits `MISSING_META` or `META_DRIFT` for a component.
- A component's JS was updated (new events, data attributes, modifiers) and the meta needs to reflect reality.

## When NOT to use

- Static (CSS-only) components — those live in `src/config/static-meta.js`, not individual `.meta.js` files.
- Bulk backfill of all components at once — run this skill one component at a time so each is verified independently.

## Inputs

One **component name** (kebab-case, e.g., `carousel`, `tag-input`, `combobox`).

## Procedure

1. **Read the component's JS source.** Open `src/js/components/<name>.js`. Extract:
   - Events dispatched (grep for `dispatchEvent`, `new CustomEvent`, `brut:change`). Note the `detail` shape.
   - Data attributes read (grep for `dataset.`, `getAttribute('data-`). Note names, value types, defaults.
   - Keyboard handling (grep for `keydown`, `keyup`, `Key`, `ArrowLeft`, `Space`, `Enter`).
   - ARIA attributes set (grep for `role`, `aria-`).
   - Hidden input mirroring (grep for `hidden`, `type="hidden"`, `input`).
   - The `Brut.register(name, { selector })` call — extract the exact selector string.

2. **Read the component's CSS block.** Open `src/components.css`, find the `.brut-<name>` block. Extract:
   - Modifiers: any `.brut-<name>--<modifier>` selectors. Note their visual effect.
   - BEM children: any `.brut-<name>__<part>` selectors.

3. **Read the preview page.** Open `preview/components-<name>.html`. Extract:
   - Example markup for each variant shown. These become the `examples` array entries.
   - Each example needs a `title` (short noun phrase) and `html` (copy-pasteable markup string).

4. **Read the canonical template.** Open `src/js/components/carousel.meta.js` for exact field order and shape. The new meta file must mirror this structure precisely.

5. **Write the meta file.** Create or overwrite `src/js/components/<name>.meta.js` with:

   ```js
   export default {
     name: '<name>',
     description: '<One concrete sentence, present tense, third person. Describes what the component does.>',
     useCases: [/* 3-5 short noun phrases describing real consumer scenarios */],
     kind: 'interactive',
     class: '.brut-<name>',
     selector: '[data-brut="<name>"]',
     modifiers: [
       // { name: '--modifier', description: 'What it does' }
     ],
     dataAttributes: [
       // { name: 'data-x', values: 'type (default val)', description: 'What it controls' }
     ],
     events: [
       // { name: 'brut:change', detail: { value: 'type description' } }
     ],
     formState: { hiddenInput: true/false },
     a11y: {
       role: '...',
       keyboard: ['Key1', 'Key2'],
       aria: ['aria-x', 'aria-y'],
       notes: 'Brief accessibility notes.',
     },
     examples: [
       // { title: 'Variant name', html: '<div class="brut-<name>" data-brut="<name>">...</div>' }
     ],
   };
   ```

   **Field rules:**
   - `description`: one concrete sentence, present tense, third person. Not marketing copy.
   - `useCases`: 3–5 short noun phrases describing real consumer scenarios.
   - `examples`: copy-pasteable markup snippets from the preview page, each `{ title, html }`. Minimum 1.
   - `formState.hiddenInput`: true if the component mirrors state to a hidden `<input>`; false otherwise.
   - `modifiers`: empty array `[]` if no modifiers exist. Never omit the field.
   - All data must come from actual source reads — never invent attributes, events, or markup.

## Verification

Run these in order:

```bash
# 1. Syntax check
node -e "import('./src/js/components/<name>.meta.js').then(m=>{const e=m.default;if(!e.name||!e.description||!e.useCases?.length||!e.kind||!e.class||!e.examples?.length)throw 0;console.log('ok')})"

# 2. Build — meta gets emitted into manifest
pnpm build

# 3. Doctor — no warnings for this component
npx brut doctor 2>&1 | grep -i "<name>"
```

The syntax check must print `ok`. The build must exit 0. The doctor grep must return zero `MISSING_META` or `META_DRIFT` lines for this component.

## Hard rules

- Never invent data. Every field value must trace back to a line in the JS source, CSS, or preview HTML.
- Never edit the JS source, CSS, or preview page from this skill — only the `.meta.js` file.
- Never edit `src/config/static-meta.js` — that's for CSS-only components.
- Mirror `carousel.meta.js` field order exactly.
- One component per invocation.
