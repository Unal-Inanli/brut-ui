---
name: brut-audit
description: Run a full scan of the BRUT codebase across 8 dimensions (untokenized values, forbidden patterns, dead classes, JS convention drift, surface sync, a11y gaps, bundle hygiene, preview bitrot). Produces a triaged finding list sorted BLOCK > DRIFT > POLISH. Read-only — does not edit files. Use when the user asks to "audit", "scan", "what needs fixing", "find improvements", "clean up".
---

# brut-audit

Runs Workflow B's 8 parallel scans and produces a deduplicated, triaged finding list. This skill is **read-only** — it reports findings but does not edit any files. Fixes are separate tasks.

## When to use

- User says: "audit", "scan", "what needs fixing", "find improvements", "optimize", "clean up", "what can we tighten".
- Before a milestone gate to check for regressions.
- After a batch of component adds/edits to catch drift.

## When NOT to use

- To fix findings — this skill only reports. Create follow-up tasks from the finding list.
- For a single-component check — `npx brut doctor` is faster for targeted checks.

## Inputs

None required. Optionally the user can scope to a subset of scans (e.g., "just run the CSS audit", "check JS conventions only").

## Procedure

Run all 8 scans. Each scan produces findings in the format:
```
path:line — issue — proposed fix (<=15 words)
```

### S1: Untokenized values in CSS
```bash
grep -nE "#[0-9a-fA-F]{3,8}|[0-9]+px|[0-9.]+rem" src/components.css
```
Cross-reference each match against token values in `src/tokens/`. Flag lines where the literal value does NOT correspond to an existing token.

### S2: Forbidden visual patterns
Grep `src/components.css` and `src/tokens/` for:
- `linear-gradient`, `radial-gradient` (must be ZERO in components.css)
- `rgba(` in components.css (must be ZERO — only sanctioned in `--scrim-bg`/`--scrim-bg-soft` in `src/tokens/02-semantic.css`)
- `border-radius:` values >12px outside `--radius-pill`
- Transitions >140ms (check `transition:` and `transition-duration:` values)
- `ease-out` / `ease-in-out` on durations >140ms
- Exempt: loader `animation` durations with a `Sanctioned exception` comment nearby

### S3: Dead/duplicate classes
For each `.brut-*` selector in `src/components.css`, grep `preview/`, `docs/index.html`, `demos/`, `README.md`. Flag classes with 0 references outside `components.css` itself.

### S4: Convention drift in JS
For each `src/js/components/*.js`, confirm:
- Single IIFE structure
- Registers on `data-brut="<name>"`
- Sets `type="button"` on wired buttons
- Dispatches `brut:change` with `event.detail.value` always present
- Mirrors to a hidden input (or uses a real form input like stepper/password)
- No `import`, `require()`, or CDN references
Flag any dispatch missing `value` in `detail`.

### S5: Sync drift between surfaces
For every `.brut-<name>` root selector in `components.css`:
- Check `preview/components-<name>.html` exists
- Check `docs/index.html` has `<section id="<name>">`
Flag mismatches in either direction (class exists but surface missing, or surface exists but class missing).

### S6: Accessibility gaps in JS components
For each `src/js/components/*.js`, grep for:
- `role=` assignments
- `tabindex` management
- `aria-*` attribute setting
- `keydown` / `keyup` / Space / Enter handling
Flag components missing any of these categories.

### S7: Bundle hygiene
```bash
wc -c dist/brut.css dist/brut.js
```
Flag any duplicated rule blocks (same selector defined twice in `components.css`).

### S8: Demo/preview bitrot
Check each `preview/*.html` and `demos/*.html`:
- Verify linked paths (`../dist/brut.css`, `../dist/brut.js`) exist
- Verify referenced `.brut-*` classes exist in `src/components.css`
Cross-reference with S3 dead class findings.

## Output format

After running all scans, merge findings, drop duplicates, and sort by severity:

```
## BLOCK (violates a hard constraint)
- path:line — issue — proposed fix

## DRIFT (surfaces out of sync)
- path:line — issue — proposed fix

## POLISH (style/dedup/cleanup)
- path:line — issue — proposed fix

## Summary
- X BLOCK findings, Y DRIFT findings, Z POLISH findings
- Bundle size: CSS XX KB, JS YY KB
```

## Hard rules

- Do not edit any file. This skill is read-only.
- Report every finding, even if minor. Let the user triage.
- Do not propose fixes longer than 15 words per finding.
- Group findings by severity, not by scan number.
- One audit per invocation. Don't skip scans unless the user explicitly scoped the request.
