# CLAUDE.md — Agentic operations playbook

> **Read these first, then come back here:** [AGENTS.md](AGENTS.md) (conventions, hard constraints, build), [SKILL.md](SKILL.md) (class & token reference), [README.md](README.md) (philosophy), [ARCHITECTURE.md](ARCHITECTURE.md) (post-M7 design rationale, debt, and convention violations to be aware of). This file does **not** repeat them — it tells an orchestrator how to break work into atomic, delegable tasks.

> **Encoding principles** (lifted from ARCHITECTURE.md — internalize these):
> 1. **Doctor encodes every hard constraint.** A constraint that exists only in docs is a bug, not a constraint. New rules land with their `brut doctor` check, not just a doc bullet.
> 2. **Manifest is canonical; source is fallback.** When tooling needs a component's shape, query `dist/components.json` (or `@sprtn/mcp`). Source crawls are the fallback.
> 3. **Conventions are predictions, not aesthetics.** `Class root === data-brut hook` exists so agents can predict markup; each violation costs prediction accuracy. Treat violations as bugs unless explicitly grandfathered in ARCHITECTURE.md §D4.
> 4. **Single source of truth, derived views.** Parallel arrays (e.g., `KNOWN_COMPONENTS` and `INTERACTIVE_COMPONENTS` in `define.js`) are smells. If two lists must agree, derive one from the other.

## Project shape (1-screen mental model)

- Vanilla HTML/CSS/JS UI kit. **No** frameworks, transpilers, preprocessors, deps.
- Edit `src/`, never `dist/`. Build = `npm run build` (concat only).
- `src/tokens/` → CSS variables (3 layers: primitives, semantic, intent + base styles). `src/components.css` → `.brut-*` classes. `src/js/core.js` + `src/js/components/<name>.js` → optional runtime per component.
- Every JS component is a single IIFE registered with `Brut.register(name, { selector: '[data-brut="<name>"]', init })`.
- Each component has 3 surfaces that must stay in sync: **CSS class block**, **`preview/components-<name>.html`**, **section in `docs/index.html`**.

## Hard constraints (orchestrator-level guardrails)

Reject any subtask that would: add a dependency, introduce JSX/React/jQuery/Alpine/htmx, add a build-time tool, hardcode a color/px/rem outside `src/tokens/`, use raw `rgba()` (use `--scrim-bg` / `--scrim-bg-soft` tokens instead), introduce gradients (the checkmark glyph is the sole sanctioned exception until the SVG sprite ships), introduce a *transition* longer than 140ms (loader *animations* may exceed; comment the carve-out), use rounded corners beyond input/tag radii, hardcode z-index integers (use `--z-*` tokens), introduce a media query at a non-tier value (use 640/768/1024 px or sub-tier sentinel 639.98/767.98/1023.98), use `(max-width: 640|768|1024 px)` for a tier boundary (collides with the corresponding min-width tier), hardcode a width ≥ 320px without a `min()` guard or paired media variant, add an interactive component without a `responsive` declaration in its meta sidecar, ship a preview/docs/demos/site HTML page without `<meta name="viewport" content="width=device-width, initial-scale=1">`, or hand-edit `dist/`. Class roots must match the `data-brut` hook name (`.brut-checkbox`, never `.brut-cb`). See [AGENTS.md §Hard constraints](AGENTS.md) and [AGENTS.md §Responsive constraints](AGENTS.md) for the full lists. **Package carve-out:** the zero-dependency rule applies to the runtime `brut` package and the source under `src/`. Standalone packages under `packages/*` (e.g., `@sprtn/mcp`) may declare their own dependencies in their own `package.json`. The spirit — consumers using `brut` never install a bundler or framework — is permanent.

> **Note for milestone work:** the "no build-time tool" and "no dependency" constraints above are scheduled to relax at milestone **M3** (Vite migration) and milestone **M6** (config + CLI). They remain in force for any task NOT explicitly tagged with one of those milestones. The *spirit* — consumer never installs a bundler, runtime stays framework-free — is permanent. See "1.0 Roadmap" below.

---

## 1.0 Roadmap

BRUT is mid-evolution from a hand-built kit to a publishable, themeable, configurable, AI-native framework. The locked direction is **modern toolchain inside, vanilla output outside** — Vite drives the build but consumers still drop in a script tag. See memory entries `project_brut_philosophy`, `project_brut_build`, `project_brut_themes`, `project_brut_config`, `project_brut_ai_surfaces`, `project_brut_versioning` for the locked decisions and rationale behind each.

| # | Milestone | Goal | Acceptance gate |
|---|---|---|---|
| **M1** | Token cleanup | Wrap 152 hardcoded px/% in `components.css` with intent tokens | Workflow B S1 returns zero findings; preview pages render unchanged |
| **M2** | 3-layer token reorg | Split `tokens.css` into `src/tokens/{01-primitives,02-semantic,03-intent,index}.css` | No hex in `03-intent.css`; build bytes stable |
| **M3** | Vite migration | Replace `bash build.sh` with `vite build`; emit same `dist/` contract + ESM entry | `pnpm build` produces matching bundles; `pnpm dev` HMR works |
| **M4** | Themes (3 default) | Runtime `[data-theme]` swap with `brutalist` (default) + `corporate` + `minimal` | Attribute swap flips visuals across every preview page |
| **M5** | Utilities + Bootstrap CSS parity | `src/utilities.css` (mt-3, d-flex, …) + 12-col grid + validation states + responsive navbar + progress + breadcrumb refresh | All new components have 4 surfaces in sync; tree-shake test passes |
| **M6** | Configuration + CLI | `brut.config.js` Vite plugin + `npx brut init/add/theme/migrate/doctor/build` | `prefix: 'ui'` rename produces zero `brut-` substrings; `doctor` flags planted issues |
| **M7** | Manifest + MCP + JS parity | `dist/components.json` + `@sprtn/mcp` server + carousel/pagination-JS/breadcrumb-JS/navbar-JS | MCP `list_components` enumerates; agent test scaffolds working page via MCP only |
| **M8** | VitePress docs + 1.0 launch | New `docs-site/` (`preview/` retained as fixtures); npm publish; CDN URLs documented | `npm view @sprtn/ui` resolves; jsdelivr URL resolves; site deployed |

When picking up a milestone, read the milestone's row, the relevant memory entries, and Workflows C–G below. Don't widen scope — milestones are independently shippable on purpose.

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
6. **Never delegate verification.** Run `pnpm build` and the grep checks yourself; only delegate the work that produced the diff.

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
| 0 | Add tokens (only if new design values are required) | general-purpose | `src/tokens/` (appropriate layer file) | — | grep new var name appears once in the layer file |
| 1 | Add CSS class block under the matching banner | general-purpose | `src/components.css` | 0 | `grep -n "\.brut-<name>" src/components.css` returns the new block; no hex/px/rem outside tokens |
| 2 | Add JS module (interactive only) | general-purpose | `src/js/components/<name>.js` | — | file is a single IIFE, registers on `data-brut="<name>"`, no imports, no external libs |
| 3 | Add sidecar `<name>.meta.js` (interactive only) | general-purpose | `src/js/components/<name>.meta.js` | 2 | `node -e "import('./src/js/components/<name>.meta.js').then(m=>{const e=m.default;if(!e.name||!e.description||!e.useCases?.length||!e.kind||!e.class||!e.examples?.length)throw 0;console.log('ok')})"` prints `ok`; `pnpm build` emits no validateMetaEntry warnings for this component |
| 4 | Create preview page | general-purpose | `preview/components-<name>.html` | 1, 2 | links `../dist/brut.css` (and `../dist/brut.js` if interactive); renders every variant |
| 5 | Add docs section | general-purpose | `docs/index.html` | 1, 2 | sidebar anchor + `<section class="docs-section" id="<name>">` with live preview and escaped `<pre class="docs-snippet">` |
| 6 | Build | (self) | `dist/brut.css`, `dist/brut.js` | 1–5 | `pnpm build` exits 0; both files non-zero bytes |
| 7 | Browser verify | (self) | — | 6 | open `docs/index.html` and `preview/components-<name>.html`; no 404s, no console errors; JS components respond to click + Space/Enter; hidden input reflects state |

**Subagent brief template (copy verbatim, fill `{…}`):**
```
Goal: {one sentence}.
Edit only: {single file path}.
Read for reference: AGENTS.md (sections “How to add a new component” and “JavaScript components”), SKILL.md, and {analogue file path}.
Constraints: no new deps, no frameworks, no transpilers, no hardcoded colors/px/rem (use tokens from src/tokens/), no animations >140ms, no rgba shadows, no gradients, no rounded corners beyond existing radii.
Output: the diff only. Do not run the build. Do not edit any other file.
Verify locally before reporting done: {grep or syntax check that proves the change landed}.
```

For interactive components, a sidecar `src/js/components/<name>.meta.js` is also required and must mirror `src/js/components/carousel.meta.js` exactly (field order, schema, naming).

### Phase 3 — Final gate (orchestrator runs)
```bash
pnpm build
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
| S1 | Untokenized values in CSS | `grep -nE "#[0-9a-fA-F]{3,8}\|[0-9]+px\|[0-9.]+rem" src/components.css` then exclude lines whose value matches a token in `src/tokens/` | `src/components.css` |
| S2 | Forbidden visual patterns | grep for `linear-gradient`, `radial-gradient`, `rgba(` (in components.css — must be ZERO; the only sanctioned use lives in `--scrim-bg`/`--scrim-bg-soft` in `src/tokens/02-semantic.css`), `border-radius:` (flag values >12px outside `--radius-pill`), transitions >140ms, `ease-out`/`ease-in-out` durations >140ms. Loader `animation` durations are exempt — flag only those without a `Sanctioned exception` comment nearby. | `src/components.css`, `src/tokens/` |
| S3 | Dead/duplicate classes | for each `.brut-*` selector in `src/components.css`, grep `preview/`, `docs/index.html`, `demos/`, `README.md` — flag classes with 0 references | `src/components.css` + all consumers |
| S4 | Convention drift in JS | for each `src/js/components/*.js` confirm: single IIFE, registers on `data-brut="<name>"`, sets `type="button"` on wired buttons, dispatches `brut:change` with `event.detail.value` always present, mirrors to a hidden input (or relies on a real form input like stepper/password), no `import`/`require`/CDN. Flag any dispatch missing `value` in `detail`. | `src/js/components/*.js` |
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
pnpm build
grep -rE "ui_kits|jsx|text/babel|React|require\(|import .* from " src/ docs/ preview/ AGENTS.md SKILL.md README.md
wc -c dist/brut.css dist/brut.js
```
Plus browser smoke: `docs/index.html` and any `preview/*.html` for components touched.

---

## Workflow C — Add a theme

**Trigger:** "make a `<name>` theme", "scaffold theme X", "I want a [vibe] aesthetic".

**Activates after M4.** Until M4 lands, themes have no infrastructure to slot into.

### Phase 1 — Scope (no delegation)
- Read `src/themes/brutalist.css` (the default) for the full list of overridable semantic tokens.
- Decide which semantic tokens diverge for this theme (color accent, shadow style, border widths, radii). Reuse the rest.
- If a needed override has no semantic token yet, **stop** and run Workflow E to add the token first. Do not patch primitives.

### Phase 2 — Atomic tasks

| # | Task | Subagent | Files | Verify |
|---|---|---|---|---|
| 1 | Create `src/themes/<name>.css` with `[data-theme="<name>"] { … }` overriding only divergent semantic tokens | general-purpose | `src/themes/<name>.css` | file is single selector block; no primitive token names appear |
| 2 | Add the theme to docs-site switcher | general-purpose | `docs-site/.vitepress/config.ts` (or equivalent) | switcher renders the new option |
| 3 | Add the theme to manifest's `themes[]` field | general-purpose | manifest emitter config | rebuild emits manifest containing the theme |
| 4 | Add a docs page describing the vibe + a snapshot under each top-level component | general-purpose | `docs-site/themes/<name>.md` | live preview renders |

### Phase 3 — Gate
```bash
pnpm build
grep -E "color-(yellow|blue|pink|lime|orange|purple|mint)|--paper|--ink" src/themes/<name>.css   # must be empty — no primitives
```
Visual diff: every preview page renders correctly under `<html data-theme="<name>">`.

---

## Workflow D — Add a utility class set

**Trigger:** "add spacing utilities", "add display utilities", "extend utilities.css".

**Activates after M5.**

### Phase 1 — Scope
- Identify the scale token driving this set (`--sp-*` for spacing, `--fs-*` for type, `--bp-*` for breakpoints).
- Decide responsive variants: `sm` / `md` / `lg` only. Never add `xs`/`xl`/`2xl` without a documented need.

### Phase 2 — Atomic tasks
1. Append the utility set to `src/utilities.css` under a banner.
2. Generate responsive variants via the Vite plugin's utility helper (or by hand for one-off sets).
3. Document under "Utilities" in `docs-site/`.
4. Add to manifest's `utilities` section if applicable.

### Phase 3 — Gate
- Regex match against expected count: `grep -cE "^\.[a-z]+-(0|1|2|3|4|5)\b" src/utilities.css`.
- Tree-shake test: build with `config.utilities: false` → utilities absent from `dist/brut.css`.

---

## Workflow E — Bump a token without breaking consumers

**Trigger:** "rename `--btn-bg`", "deprecate token X", "the token name doesn't match the new convention".

### Phase 1 — Scope
- Grep for the token across `src/`, `dist/`, `themes/`, `docs/`, `docs-site/`, `preview/`, `README.md`. Report all references.
- Classify: rename only (same value, new name) or semantic shift (different value, new name). The latter is always major.

### Phase 2 — Atomic tasks
1. Add the new token in the appropriate layer (semantic or intent).
2. Make the old token an alias: `--old-name: var(--new-name);` in the same layer, with a comment `/* @deprecated since 1.x, remove in 2.0 */`.
3. Update CHANGELOG with the rename and the removal version.
4. Add a migrate rule to `npx brut migrate` so consumer projects auto-rewrite.
5. Update all in-repo consumers to the new name (bulk find/replace, then rebuild).

### Phase 3 — Gate
- Build passes. Both `var(--old-name)` and `var(--new-name)` resolve to the same value.
- `npx brut doctor --token-deprecations` warns about the old name.
- The alias has a removal-version comment.

---

## Workflow F — Add a component variant

**Trigger:** "add a `--brand` button", "add a `large` switch", "add color variants for badge".

### Phase 1 — Scope
- Decide: pure CSS variant (no new tokens) or theme-extending variant (new intent tokens)?
- Identify the parent component's intent tokens that the variant patches (`--btn-bg`, `--btn-fg`, `--btn-border-w`, …).

### Phase 2 — Atomic tasks
1. Add the variant to `src/components.css` as `.brut-<component>--<variant>` overriding only the relevant intent tokens. NEVER hardcode values; if a primitive is needed, route through a new intent token.
2. Update the component's manifest entry — append to `modifiers[]`.
3. Add the variant to the preview page and the docs section.
4. If the variant fits a config-time pattern (e.g. brand colors), document it in `brut.config.js` reference under `variants.<component>`.

### Phase 3 — Gate
- Manifest contains the new modifier.
- Preview page renders the variant.
- Removing the modifier class returns the component to default appearance pixel-for-pixel.

---

## Workflow G — Generate or refresh a component's `.meta.js`

**Trigger:** new component lands without a `.meta.js`, or a component's events / data-attributes / modifiers / examples changed and the metadata is stale.

**Activates after M7.** Before M7, no manifest infrastructure existed.

### Phase 1 — Scope (no delegation)
Read three files for the target component:
- `src/js/components/<name>.js` — events fired, data attributes read, keyboard handled, aria set.
- `src/components.css` `.brut-<name>` block — modifiers (look for `.brut-<name>--*`).
- `preview/components-<name>.html` — canonical example markup.

### Phase 2 — Author or update `<name>.meta.js`
Single atomic task. Mirror `src/js/components/carousel.meta.js` exactly — field order, schema, naming. Required fields: `name`, `description`, `useCases` (≥1), `kind`, `class`, `examples` (≥1). All other fields populated from real source reads.

Validation rules (paste-quoted from `src/config/vite-plugin.js`'s `validateMetaEntry`):
- `description`: one concrete sentence, present tense, third person.
- `useCases`: 3–5 short noun phrases describing real consumer scenarios.
- `examples`: copy-pasteable markup snippets, each `{ title, html }`.
- `formState.hiddenInput`: true for components mirroring to a hidden form input; false otherwise.

### Phase 3 — Gate
1. `pnpm build` — emits the full entry into `dist/components.json` (not the 4-field stub).
2. `node scripts/check-manifest.js` — exits 0 for this component.
3. `npx brut doctor` — no `MISSING_META` or `META_DRIFT` warning for this component.
4. The entry's class and selector are byte-identical to the runtime contract.

---

## Workflow H — Add or refine a component's responsive shape

**Trigger:** "make `<name>` responsive", "add a mobile pattern to `<name>`", "the `<name>` overflows at 320px", "declare `<name>`'s responsive shape", `npx brut doctor` reports `RESPONSIVE_META_MISSING` or `RESPONSIVE_SHAPE_INVALID`.

### Phase 1 — Scope (no delegation)
1. Pick the canonical shape from the nine in [docs/responsive-shapes.md](docs/responsive-shapes.md). Don't invent a tenth — if none fit, that's an architecture decision; pause and ask.
2. Pick the tier at which the shape engages: `sm` (640px), `md` (768px), or `lg` (1024px). Most flips are at `sm`. Disclosure-style nav uses `md`.
3. Identify the analogue. State the file path so subagents copy the shape:
   - `fullscreen-modal` → `dialog` (after RR3.1)
   - `bottom-sheet` → `popover`/`menu` (after RR3.3/RR3.4 land the shared positioner)
   - `horizontal-scroll` → `tabs` (after RR3.10)
   - `ellipsis-collapse` → existing `.brut-crumbs--responsive` rule
   - `disclosure-toggle` → `topnav` (after RR2.4 mobile-first refactor)
   - `stack` → `.brut-row` 12-col grid stack rule
   - `wrap` → `.brut-tag-input` wrap pattern
   - `hover-fallback` → `tooltip` (after RR3.5)
   - `static` → no analogue needed; just declare
4. Confirm no new tokens are required. If the flip needs a new layout dimension, run Workflow E (token bump) first.

### Phase 2 — Atomic tasks

| # | Task | Subagent | Files written | Verify |
|---|---|---|---|---|
| 1 | Add the responsive CSS rule(s) to the component's class block | general-purpose | `src/components.css` | doctor `BREAKPOINT_NON_TIER` and `MAX_WIDTH_AT_TIER` are 0 for the new rule; renders correctly at the tier boundary |
| 2 | If the shape needs JS (`bottom-sheet` positioner branch, `disclosure-toggle` toggle helper, `hover-fallback` pointer listener), edit the component JS — DO NOT introduce a new resize/scroll listener pattern; reuse the shared positioner / disclosure helper | general-purpose | `src/js/components/<name>.js` | no new global listeners; touch + keyboard both work |
| 3 | Update the preview page to demonstrate the responsive variant — viewport-meta is already required; add a frame at the relevant width so reviewers can see the flip | general-purpose | `preview/components-<name>.html` | renders correctly at 320, 375, 640, 768, 1024 |
| 4 | Update the docs section to note the shape — typically a one-line callout near the top of the section | general-purpose | `docs/index.html` | section renders; new shape callout visible |
| 5 | Declare `responsive: { shape, breakpoint, notes }` in the meta sidecar | general-purpose | `src/js/components/<name>.meta.js` | `node scripts/check-manifest.js` exits 0; `npx brut doctor` shows no `RESPONSIVE_META_MISSING` or `*_INVALID` for this component |
| 6 | Build | (self) | `dist/brut.css`, `dist/brut.js`, `dist/components.json` | `pnpm build` exits 0; manifest entry includes the new `responsive` block |
| 7 | Visual harness | (self) | `tests/visual/<name>.spec.js` (extend if exists; create otherwise — model on existing specs) | `pnpm test:visual` passes at 320, 375, 640, 768, 1024, 1440 — no horizontal scroll, every interactive surface ≥ 44×44, declared shape matches DOM evidence |

### Phase 3 — Final gate (orchestrator runs)
```bash
pnpm build
node scripts/check-manifest.js
npx brut doctor                       # zero RESPONSIVE_* / VIEWPORT_META_MISSING / BREAKPOINT_NON_TIER for this component
pnpm test:visual                      # passes at all six tested viewports
grep -nE "@media\s*\([^)]*(max|min)-width:\s*[0-9.]+px" src/components.css | grep -vE "(640|768|1024|639\.98|767\.98|1023\.98)px"   # must be empty
```

Then open `preview/components-<name>.html` in a browser and exercise the flip with devtools responsive at 320/375/640/768/1024.

### Subagent brief template (Workflow H)
```
Goal: {one sentence}. Apply responsive shape `{shape}` at tier `{tier}` to `{component}`.
Edit only: {single file path}.
Read for reference: AGENTS.md §Responsive constraints, docs/responsive-shapes.md, and {analogue file path}.
Constraints (paste-quoted): mobile-first, three tiers only (sm/md/lg via --bp-*), min-width at boundaries (use sub-tier .98 sentinel for "below" overrides), 44px touch-target floor (--touch-min), guard layout dims ≥320px with min() or media variant, no new global resize/scroll listeners.
Output: the diff only. Do not run the build. Do not edit any other file.
Verify locally before reporting done: {grep or syntax check that proves the change landed}.
```

---

## Token-saving rules for delegation

- Pass **paths**, not file contents — subagents read what they need.
- Pass the **2–4 constraint lines** that apply, not all of AGENTS.md.
- Cap subagent reports at 200 words for scans, "diff only" for edits.
- One concern per subtask: if you write `and` in the goal, split it.
- Never re-run a scan you already ran this session — pass the prior finding list forward.
