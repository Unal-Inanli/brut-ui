---
name: Drift / surface-sync report
about: Report a surface-sync mismatch surfaced by `npx brut doctor` or Workflow B
title: 'DRIFT: '
labels: drift
---

## Severity (Workflow B classification)

- [ ] BLOCK (violates a hard constraint — e.g. UNTOKENIZED_VALUE, FORBIDDEN_PATTERN)
- [ ] DRIFT (surfaces out of sync — e.g. MISSING_META, DOCS_SECTION_SHAPE)
- [ ] POLISH (style / dedup / dead-class)

## Component(s)

<!-- e.g. brut-crumbs, brut-tooltip. -->

## Surface(s) out of sync

- [ ] CSS (`src/components.css`)
- [ ] JS (`src/js/components/<name>.js`)
- [ ] Preview (`preview/components-<name>.html`)
- [ ] Docs (`docs/index.html` section)
- [ ] Meta (`src/js/components/<name>.meta.js` or `src/config/static-meta.js`)

## Doctor finding code

<!-- e.g. MISSING_META, DOCS_SECTION_SHAPE, SNIPPET_PREVIEW_DRIFT, RESPONSIVE_META_MISSING. Run `npx brut doctor` for the full code list. -->

## Reproduction

```bash
npx brut doctor
# or
grep -nE "<your pattern>" src/components.css
```

## Expected vs. actual

<!-- One sentence each. -->

## Suggested fix

<!-- Optional. Workflow A (new component), Workflow B (audit + atomic fix), Workflow E (token rename), Workflow G (meta backfill), or a one-line correction. -->
