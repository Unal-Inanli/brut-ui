# T09 — Audit & propose tokens for the remaining pixel literals in `components.css`

**Severity:** POLISH (analysis task, no code changes)
**Effort:** M
**Touches:** writes `tasks/TOKENIZATION-DEFER.md` only — no source edits

## Why
After T07 + T08, `components.css` will still contain pixel literals that don't map to existing tokens — e.g. `width: 56px; height: 30px` on the switch knob, `padding: 6px 10px` on inputs, `font-size: 11px`/`15px`. These need a human decision: add a token, reuse an existing one with a slight visual change, or accept the literal as a sanctioned exception with a comment.

## Goal
Produce a markdown report classifying every remaining literal into one of three buckets, with a recommendation for each. **No CSS or token edits in this task.**

## Buckets
1. **Add new token** — value recurs ≥2 times or has clear semantic meaning (e.g. switch knob, alert icon).
2. **Snap to existing token** — value is within ~2px of a token; recommend reuse with note that the visual will shift slightly.
3. **Accept as exception** — one-off geometry, no semantic name, document inline.

## Steps
1. After T07+T08 are merged (or use a worktree where they are): `grep -nE "(padding|margin|gap|width|height|min-|max-|top|right|bottom|left|inset|font-size):" src/components.css | grep -E "[0-9]+(\.[0-9]+)?(px|rem)" | grep -v "var(--"`.
2. For each remaining literal, decide bucket and write a row in `tasks/TOKENIZATION-DEFER.md`:
   ```
   | line | property | literal | bucket | proposed token name / reuse | note |
   ```
3. Group by component for easier review.
4. At the bottom of the report, list **proposed new tokens** with name, value, and a one-line use case. Hand back to the human for token approval before any CSS edits.

## Constraints (from AGENTS.md)
- "If you reach for a hex, px, or rem that isn't a token, add a token first."
- Token names follow the existing pattern (`--sp-N`, `--fs-XX`, `--shadow-XX`, `--bw-N`, `--radius-XX`, `--dur-*`, `--ease-*`).

## Verify
```bash
test -f tasks/TOKENIZATION-DEFER.md && wc -l tasks/TOKENIZATION-DEFER.md
```
Report has at least the table, one row per remaining literal, and a "Proposed new tokens" section.

## Done when
- `tasks/TOKENIZATION-DEFER.md` exists; every remaining literal accounted for; no source files changed.
