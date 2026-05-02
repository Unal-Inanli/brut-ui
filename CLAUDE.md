# CLAUDE.md — Agentic operations playbook

> **Read these first, then come back here:** [AGENTS.md](AGENTS.md) (conventions, hard constraints, build), [SKILL.md](SKILL.md) (class & token reference), [README.md](README.md) (philosophy). This file does **not** repeat them — it tells an orchestrator how to break work into atomic, delegable tasks.

## Project shape (1-screen mental model)

- Vanilla HTML/CSS/JS UI kit. **No** frameworks, transpilers, preprocessors, deps.
- Edit `src/`, never `dist/`. Build = `npm run build` (concat only).
- `src/tokens.css` → CSS variables. `src/components.css` → `.brut-*` classes. `src/js/core.js` + `src/js/components/<name>.js` → optional runtime per component.
- Every JS component is a single IIFE registered with `Brut.register(name, { selector: '[data-brut="<name>"]', init })`.
- Each component has 3 surfaces that must stay in sync: **CSS class block**, **`preview/components-<name>.html`**, **section in `docs/index.html`**.

## Hard constraints (orchestrator-level guardrails)

Reject any subtask that would: add a dependency, introduce JSX/React/jQuery/Alpine/htmx, add a build-time tool, hardcode a color/px/rem outside `tokens.css`, use `rgba()` shadows, gradients, rounded corners beyond input/tag radii, ease longer than 140ms, or hand-edit `dist/`. See [AGENTS.md §Hard constraints](AGENTS.md) for the full list.

---

## Orchestration rules

1. **Atomic = single file, single concern, verifiable in isolation.** If a task touches 3 files, split it into 3 subtasks with explicit dependencies.
2. **Each subtask brief must include:** goal (1 line), input files (paths), output files (paths), exact verification command, and the relevant constraint excerpts from AGENTS.md (do not link — paste the 2–4 lines that apply).
3. **Parallelize when independent.** CSS, preview HTML, and docs section for a *new* component can all start once the JS file exists; for an *existing* component, refining CSS and refining JS are parallel until verification.
4. **Serial gates:** (a) tokens before classes that reference them, (b) JS file before preview/docs that mount the component, (c) build before any browser verification.
5. **Subagent choice:**
   - `Explore` — locate a class/token/usage, list preview files referencing X, find untokenized values. Read-only.
   - `general-purpose` — multi-file changes that need coordinated edits.
   - `Plan` — only if the request is ambiguous about which workflow applies.
6. **Never delegate verification.** Run `bash build.sh` and the grep checks yourself; only delegate the work that produced the diff.

---

## Workflow A — Generate a new component

**Trigger:** "add a `<name>` component", "build a `<name>`", or any request that introduces a new `.brut-<name>` class or `data-brut="<name>"` hook.

### Phase 1 — Scope (no delegation)
Decide before fanning out:
- Is this **static** (CSS-only) or **interactive** (needs JS)? Interactive = state, keyboard, hidden input mirror.
- Closest existing analogue. State the analogue file path so subagents copy its shape (`switch.js` for boolean, `combobox.js` for searchable select, `tag-input.js` for collection, `dialog.js` for open/close, `stepper.js` for numeric, `segmented.js`/`tabs.js` for one-of-N).
- New tokens needed? If yes → **Task 0** below; otherwise skip it.

### Phase 2 — Atomic tasks

| # | Task | Subagent | Files written | Depends on | Verify |
|---|---|---|---|---|---|
| 0 | Add tokens (only if new design values are required) | general-purpose | `src/tokens.css` | — | grep new var name appears once in `tokens.css` |
| 1 | Add CSS class block under the matching banner | general-purpose | `src/components.css` | 0 | `grep -n "\.brut-<name>" src/components.css` returns the new block; no hex/px/rem outside tokens |
| 2 | Add JS module (interactive only) | general-purpose | `src/js/components/<name>.js` | — | file is a single IIFE, registers on `data-brut="<name>"`, no imports, no external libs |
| 3 | Create preview page | general-purpose | `preview/components-<name>.html` | 1, 2 | links `../dist/brut.css` (and `../dist/brut.js` if interactive); renders every variant |
| 4 | Add docs section | general-purpose | `docs/index.html` | 1, 2 | sidebar anchor + `<section class="docs-section" id="<name>">` with live preview and escaped `<pre class="docs-snippet">` |
| 5 | Build | (self) | `dist/brut.css`, `dist/brut.js` | 1–4 | `bash build.sh` exits 0; both files non-zero bytes |
| 6 | Browser verify | (self) | — | 5 | open `docs/index.html` and `preview/components-<name>.html`; no 404s, no console errors; JS components respond to click + Space/Enter; hidden input reflects state |

**Subagent brief template (copy verbatim, fill `{…}`):**
```
Goal: {one sentence}.
Edit only: {single file path}.
Read for reference: AGENTS.md (sections “How to add a new component” and “JavaScript components”), SKILL.md, and {analogue file path}.
Constraints: no new deps, no frameworks, no transpilers, no hardcoded colors/px/rem (use tokens from src/tokens.css), no animations >140ms, no rgba shadows, no gradients, no rounded corners beyond existing radii.
Output: the diff only. Do not run the build. Do not edit any other file.
Verify locally before reporting done: {grep or syntax check that proves the change landed}.
```

### Phase 3 — Final gate (orchestrator runs)
```bash
bash build.sh
grep -rE "ui_kits|jsx|text/babel|React|require\(|import .* from " src/ docs/ preview/ AGENTS.md SKILL.md README.md   # must be empty
```
Then open `docs/index.html` + the new preview page in a browser.

---

## Workflow B — Scan & optimize

**Trigger:** "find improvements", "optimize", "audit", "clean up", "what can we tighten".

This workflow is **read-heavy first, write-narrow second**. Do not let subagents make sweeping edits — collect findings, deduplicate, then delegate one fix per atomic task.

### Phase 1 — Parallel scans (all `Explore` subagents, run in one message)

Each scan returns a list of `path:line — finding — proposed fix`. No edits.

| # | Scan | Command/heuristic | Files |
|---|---|---|---|
| S1 | Untokenized values in CSS | `grep -nE "#[0-9a-fA-F]{3,8}\|[0-9]+px\|[0-9.]+rem" src/components.css` then exclude lines whose value matches a token in `src/tokens.css` | `src/components.css` |
| S2 | Forbidden visual patterns | grep for `linear-gradient`, `radial-gradient`, `rgba(`, `border-radius:` (flag values >12px outside `--radius-pill`), transitions >140ms, `ease-out`/`ease-in-out` durations >140ms | `src/components.css`, `src/tokens.css` |
| S3 | Dead/duplicate classes | for each `.brut-*` selector in `src/components.css`, grep `preview/`, `docs/index.html`, `demos/`, `README.md` — flag classes with 0 references | `src/components.css` + all consumers |
| S4 | Convention drift in JS | for each `src/js/components/*.js` confirm: single IIFE, registers on `data-brut="<name>"`, sets `type="button"` on wired buttons, dispatches `brut:change`, mirrors to hidden input, no `import`/`require`/CDN | `src/js/components/*.js` |
| S5 | Sync drift between surfaces | for every `.brut-<name>` in `components.css`, confirm `preview/components-<name>.html` exists AND there is a `<section id="<name>">` in `docs/index.html`; flag mismatches | `src/components.css`, `preview/`, `docs/index.html` |
| S6 | Accessibility gaps in JS components | grep each component for `role=`, `tabindex`, `aria-*`, `keydown`/Space/Enter handling — flag missing | `src/js/components/*.js` |
| S7 | Bundle hygiene | report `wc -c dist/brut.css dist/brut.js` and flag any duplicated rule blocks (same selector defined twice in `components.css`) | `src/components.css` |
| S8 | Demo/preview bitrot | open each `preview/*.html` and `demos/*.html` headers — flag those linking paths that no longer exist or referencing removed classes (cross-reference S3) | `preview/`, `demos/` |

**Scan-subagent brief template:**
```
Goal: produce a finding list — do not edit any file.
Scope: {files/dirs}.
Heuristic: {exact grep or rule}.
Output format: one line per finding as `path:line — issue — proposed fix (≤15 words)`. Group by severity: BLOCK (violates a hard constraint), DRIFT (surfaces out of sync), POLISH (style/dedup).
Hard constraint reference: {paste the 2–4 relevant lines from AGENTS.md}.
Stop after listing findings. Do not propose code.
```

### Phase 2 — Triage (orchestrator, no delegation)
- Merge findings, drop duplicates, sort: BLOCK → DRIFT → POLISH.
- Convert each finding into an atomic task = one file, one fix, one verification.
- **Reject** any task that would touch >1 file or require new tokens without explicit user approval.

### Phase 3 — Fan-out fixes (one subagent per atomic task, parallelize independents)

Use the same subagent brief template as Workflow A, with two additions:
- `Existing finding: {path:line — issue}` so the agent knows the *why*.
- `Do not refactor adjacent code, even if it looks improvable. Open a separate finding instead.`

### Phase 4 — Final gate (orchestrator)
```bash
bash build.sh
grep -rE "ui_kits|jsx|text/babel|React|require\(|import .* from " src/ docs/ preview/ AGENTS.md SKILL.md README.md
wc -c dist/brut.css dist/brut.js
```
Plus browser smoke: `docs/index.html` and any `preview/*.html` for components touched.

---

## Token-saving rules for delegation

- Pass **paths**, not file contents — subagents read what they need.
- Pass the **2–4 constraint lines** that apply, not all of AGENTS.md.
- Cap subagent reports at 200 words for scans, "diff only" for edits.
- One concern per subtask: if you write `and` in the goal, split it.
- Never re-run a scan you already ran this session — pass the prior finding list forward.
