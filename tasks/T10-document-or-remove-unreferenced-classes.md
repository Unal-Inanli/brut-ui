# T10 — Decide: document or remove the 13 unreferenced typography/utility classes

**Severity:** POLISH (decision task — produces a recommendation, may or may not edit code)
**Effort:** S–M depending on outcome
**Touches:** `docs/index.html` and/or `src/components.css` (whichever the decision picks)

## Why
S3 scan found 13 `.brut-*` class roots defined in `src/components.css` with **zero** references in `preview/`, `docs/index.html`, `demos/`, or `README.md`. They are either undocumented (real value, just not shown) or dead (delete them and shrink the bundle).

## The 13
| Class | Defined at | Likely role |
|---|---|---|
| `.brut-h4` | components.css:64 | typography |
| `.brut-h5` | components.css:71 | typography |
| `.brut-h6` | components.css:78 | typography |
| `.brut-overline` | components.css:140 | typography |
| `.brut-kbd` | components.css:205 | inline code/key marker |
| `.brut-pre` | components.css:216 | code block |
| `.brut-list` | components.css:234 | list reset/style |
| `.brut-drop-cap` | components.css:266 | typography |
| `.brut-mark` | components.css:279 | inline highlight |
| `.brut-num` | components.css:288 | tabular numerals |
| `.brut-prose` | components.css:299 | long-form wrapper |
| `.brut-label` | components.css:481 | form label |
| `.brut-spacer` | components.css:2331 | layout primitive |

## Goal
For each class, decide one of:
- **DOCUMENT** — add a row/section to `docs/index.html` showing usage and a `<pre>` snippet.
- **DELETE** — remove the CSS block from `src/components.css`.

Most of these are real foundational primitives (especially `.brut-prose`, `.brut-list`, `.brut-spacer`, `.brut-h4`–`.brut-h6`) and should probably be documented, not deleted. But some (`.brut-drop-cap`, `.brut-num`) may not be worth keeping if no consumer wants them.

## Steps
1. For each class, read its CSS block to understand intent.
2. Cross-check `SKILL.md` and `README.md` — if a class appears there it is intentionally part of the public API and **must be documented**, not deleted.
3. Write a recommendation table to `tasks/T10-RECOMMENDATIONS.md`:
   ```
   | class | recommendation | rationale | location to add (if document) |
   ```
4. **Pause and confirm with the user before deleting anything.** Document additions can proceed.
5. For each DOCUMENT class: add a sidebar anchor under the matching `<h2>` group in `docs/index.html`, plus a `<section class="docs-section" id="<name>">` with a live preview and an escaped `<pre class="docs-snippet">` (follow the pattern of an existing typography section).
6. For each DELETE class (after user OK): remove the CSS block — and only that block.
7. `npm run build`.

## Constraints (from AGENTS.md)
- Three surfaces stay in sync: CSS, preview, docs.
- For a documented class, the docs section needs sidebar anchor + section + live preview + escaped snippet.

## Verify
```bash
bash build.sh
# After: every class kept in components.css must appear in docs/index.html OR README.md.
for c in brut-h4 brut-h5 brut-h6 brut-overline brut-kbd brut-pre brut-list brut-drop-cap brut-mark brut-num brut-prose brut-label brut-spacer; do
  in_css=$(grep -c "\.$c" src/components.css)
  in_docs=$(grep -c "$c" docs/index.html README.md SKILL.md)
  echo "$c  css=$in_css  consumer=$in_docs"
done
```
Every kept class should have `consumer >= 1`.

## Done when
- `tasks/T10-RECOMMENDATIONS.md` exists with one row per class.
- Doc additions merged for "DOCUMENT" classes.
- Deletions performed only after user confirmation; build green either way.
