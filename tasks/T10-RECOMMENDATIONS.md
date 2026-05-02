# T10 — Recommendations for the 13 unreferenced classes

Generated 2026-05-02. Cross-checked against `SKILL.md`, `README.md`, `docs/index.html`, and `preview/`.

| class | recommendation | rationale | docs location |
|---|---|---|---|
| `.brut-h4` | DOCUMENT | Public API per `SKILL.md` §Typography (`.brut-h1`–`.brut-h6` listed as a range). Matches existing `.brut-h1`–`.brut-h3` family. | `#typography-primitives` |
| `.brut-h5` | DOCUMENT | Same as above. | `#typography-primitives` |
| `.brut-h6` | DOCUMENT | Listed in `SKILL.md` typography range. | `#typography-primitives` |
| `.brut-overline` | DOCUMENT | Listed in `SKILL.md` typography. Tracking-loose uppercase label — useful primitive. | `#typography-primitives` |
| `.brut-kbd` | DOCUMENT | Listed in `SKILL.md` typography. Inline keyboard-key marker. | `#typography-primitives` |
| `.brut-pre` | DOCUMENT | Listed in `SKILL.md` typography. Code block. | `#typography-primitives` |
| `.brut-list` | DOCUMENT | Listed in `SKILL.md` typography (with `--ord`/`--check` modifiers). Foundational list reset. | `#typography-primitives` |
| `.brut-drop-cap` | DOCUMENT | Listed in `SKILL.md` typography. Editorial flourish. | `#typography-primitives` |
| `.brut-mark` | DOCUMENT | Inline highlight — sibling of `.brut-highlight` already documented. Even though absent from `SKILL.md`, the naming and CSS make intent clear; safer to surface than to delete silently. | `#typography-primitives` |
| `.brut-num` | DOCUMENT | Listed in `SKILL.md` typography. Tabular numerals — distinct utility. | `#typography-primitives` |
| `.brut-prose` | DOCUMENT | Listed in `SKILL.md` typography. Long-form rhythm wrapper — high value. | `#typography-primitives` |
| `.brut-label` | DOCUMENT | Listed in `SKILL.md` Inputs. Form label primitive. | `#typography-primitives` |
| `.brut-spacer` | DOCUMENT | Listed in `SKILL.md` Layout primitives. | `#layout-spacer` |

## Decision summary
**All 13 classes recommended for DOCUMENT.** None recommended for DELETE — every class is referenced as public API in `SKILL.md` (or, for `.brut-mark`, is a clear semantic peer of an already-documented primitive). Deleting any would break downstream consumers who follow `SKILL.md` as the canonical class list.

## What this PR adds
- Two new documentation anchors and sections in `docs/index.html`:
  1. **Typography primitives** (`#typography-primitives`) — covers `.brut-h4`, `.brut-h5`, `.brut-h6`, `.brut-overline`, `.brut-kbd`, `.brut-pre`, `.brut-list`, `.brut-drop-cap`, `.brut-mark`, `.brut-num`, `.brut-prose`, `.brut-label`.
  2. **Spacer** (`#layout-spacer`) — covers `.brut-spacer`.

No CSS deletions. No changes to `src/components.css`.
