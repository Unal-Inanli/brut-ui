# Architecture review — post-M7

> Written by a principal engineer immediately after shipping M7 (manifest + MCP + JS parity). The review is structural — it does not re-litigate decisions already made, but flags drift, compounding debt, and the next 1–2 architectural moves the kit needs before 1.0.

## Read this before changing anything load-bearing

If you're a contributor, an agent, or a downstream consumer reviewing the kit, **the most important properties to preserve are the constraints, not the components**. Components churn; constraints define what BRUT *is*. Three of them carry the design:

1. **Class root === `data-brut` hook.** Every interactive component has class root `.brut-<name>` and selector `[data-brut="<name>"]`. This is what makes BRUT predictable for agents — given the manifest, an LLM can synthesize markup with zero guesses.
2. **Runtime ships zero dependencies.** `brut.js` is a single IIFE with no imports. Consumers can audit it in 10 minutes. The toolchain may be modern (Vite, MCP-SDK in the side package) but the runtime stays vanilla.
3. **Manifest is canonical.** Agents query `dist/components.json` (via `@brut/mcp` or directly). Source crawls are the fallback, not the path. This compounds: every component shipped with full metadata makes the next agent task cheaper.

Each of these is encoded in tooling (`brut doctor`) where possible. Where they aren't, drift sneaks in. Section *Convention violations on disk* enumerates the current drift.

---

## What is structurally sound

These properties make the kit grow well; preserve them as constraints, not aesthetics.

### Three-layer token system (`src/tokens/{01-primitives,02-semantic,03-intent}.css`)
Primitives are values. Semantic tokens are roles. Intent tokens are component-scoped overrides. The boundaries are mechanically enforced — `02-semantic.css` references primitives, `03-intent.css` references semantic, never the other way. Themes (M4) override only semantic. This is the right shape for a long-lived kit; resist temptation to flatten it.

### Doctor as constraint executor
`src/cli/commands/doctor.js` encodes hard constraints as runnable checks. Hex colors, hardcoded px, missing JS, missing meta, manifest drift — every documented rule that can be expressed as a grep is. This is the right pattern. **Every new constraint should land with a doctor check, not just a doc bullet.** Drift between docs and reality is BRUT's #1 architectural risk; doctor is the antidote.

### Sidecar `<name>.meta.js` (chosen during M7)
Better than the originally-spec'd frontmatter comment block. Plain JS module: zero parsing, lintable, IDE-friendly, refactor-safe. Will look obviously-correct in two years. Worth keeping even as the field set evolves.

### `Brut.register(name, { selector, init })` registration pattern
Single shape across all interactives. New component authors copy `topnav.js` (60 lines) or `tabs.js`, follow the pattern, ship. No registration framework, no DI container, no plugin system to learn. The simplicity is the architecture.

### Vanilla output, modern toolchain
Vite drives builds; consumers drop in a script tag. The constraint ("consumers never install a bundler") is permanent and defensible; the toolchain ("we use Vite") can change without breaking that promise. M3 nailed this trade.

---

## Architectural debt — what will compound

Each item: observation → current impact → recommended action → severity.

### D1. Two-tier registry in `define.js` is a smell

`KNOWN_COMPONENTS` (84 entries) and `INTERACTIVE_COMPONENTS` (35 entries) are parallel arrays where the latter should be a subset of the former. Before M7, three components (`combobox`, `table-columns`, `table-filter`) were in `INTERACTIVE_COMPONENTS` but missing from `KNOWN_COMPONENTS` — an invariant violation that nothing detected. The fix was a manual edit.

**Impact:** silent drift; manifest entries silently dropped. A component flagged interactive but absent from `KNOWN_COMPONENTS` is invisible to the manifest emitter.
**Recommendation:** collapse to a single source of truth — an array of component descriptors `[{ name: 'switch', kind: 'interactive', cssRoot: '.brut-switch' }]`. Derive `KNOWN_COMPONENTS` and `INTERACTIVE_COMPONENTS` as views. Add a doctor check `INTERACTIVE_COMPONENTS ⊆ KNOWN_COMPONENTS` regardless.
**Severity:** medium. Caught us once; will catch us again.

### D2. The vite plugin does too many jobs

`src/config/vite-plugin.js` (194 lines) handles: prefix renaming, variant CSS generation, manifest emission with sidecar loading, chunk reordering for the core IIFE, schema validation. Five concerns, one file. Adding a sixth (token manifest, expected post-M7) will push it past comfort.

**Impact:** any change risks every other concern. Test surface is the plugin lifecycle, not the individual transforms. Diffs become big.
**Recommendation:** split into composable plugins — `prefix-rename-plugin`, `manifest-emit-plugin`, `variant-css-plugin`, `chunk-reorder-plugin`. Compose in `vite.config.js`. Each independently testable.
**Severity:** medium. Not urgent; do during M8 if `get_token` lands.

### D3. The static-stub problem

49 of 84 components in the M7 manifest carry only the 4-field stub (`name, class, selector, kind`). When an agent calls `get_component('h1')`, it gets back almost nothing — no description, no examples, no usage hints. The "manifest as canonical contract" claim is half-true today.

**Impact:** agents fall back to source crawls for static components, exactly the failure mode M7 was supposed to eliminate.
**Recommendation:** post-M7 sub-milestone (call it M7.1) backfilling the 49 statics. Most need only a description, useCases, and one example. Cost: ~1 day with parallel subagents, same pattern as M7 batches.
**Severity:** high for the AI-native promise. M8 1.0 should not ship without this.

### D4. Convention violations on disk

Three interactive components today have a class root that does NOT match their `data-brut` hook (auto-detected via `c.class !== '.brut-' + c.name`):

| Component | Declared class | Hook | Cause |
|---|---|---|---|
| counter | `.brut-field__counter` | `data-brut="counter"` | Counter is a sub-element of `.brut-field`, modeled as BEM |
| table-columns | `.brut-table-columns-btn` | `data-brut="table-columns"` | Trigger button is the labeled element, not the menu |
| tooltip | `.brut-tip` | `data-brut="tooltip"` | Pre-convention naming |

Plus the `.brut-pager` → `.brut-pagination` rename from M7 didn't touch `demos/*.html`, leaving 201 doctor `UNKNOWN_CLASS` findings as ambient noise.

**Impact:** the central agent-prediction property — "given component name, infer class root" — is 91% accurate (32/35), not 100%. Three components require source reads to use correctly. Worse, the doctor's own META_DRIFT check uses `.brut-<name>` to derive expected modifier selectors, so it false-flags counter and tooltip modifiers.
**Recommendation:** decide per component: rename the CSS root (breaking change, but cheap with `npx brut migrate`), or add a doctor allowlist that documents the exception. Don't leave them as silent drift.
**Severity:** high. Either rename or formalize.

### D5. Examples in the manifest are unfreshed strings

Each `.meta.js` includes `examples: [{ title, html }]`. The HTML is a literal string. When a class renames or a data attribute changes, examples silently rot. M7's pagination CSS rename (`pager` → `pagination`) almost broke the manifest examples; we caught it because the same agent updated both.

**Impact:** manifest claims to be canonical, but its examples can lag the runtime by months without anyone noticing.
**Recommendation:** doctor check that every class name appearing in `example.html` exists in the source CSS, AND that the example's `data-brut` hook matches the entry's `name`. Cheap to implement. ~30 lines in `doctor.js`.
**Severity:** medium-high. Easy to fix; preventing rot pays compound interest.

### D6. Workspace layout is asymmetric

`pnpm-workspace.yaml` lists `packages/*`, but the root `brut` package lives at the repo root, not under `packages/`. This means:
- pnpm CLI flags like `--filter brut` work, but `--filter ./packages/*` does not include the root.
- Cross-package `workspace:*` resolution is fine for `@brut/mcp`, but documentation around "the BRUT package vs. the BRUT workspace" gets ambiguous.
- A future second sibling (e.g. `@brut/themes`, `@brut/config-schema`) will need to decide its parent.

**Impact:** mostly cosmetic today, but the standard pnpm layout is to put everything under `packages/*`. Migration cost grows with each new package added.
**Recommendation:** before M8, decide: either move root code under `packages/ui/` (one-time disruption, breaks all relative paths in docs/preview) or accept the two-tier layout permanently and document it. Don't keep punting.
**Severity:** low now, medium by M8.

### D7. Hard-constraint enforcement is asymmetric

Some hard constraints are doctor-enforced; others live only in docs:

| Constraint | Doctor check | Doc only |
|---|---|---|
| No hex outside tokens | ✅ HARDCODED_COLOR | — |
| No px outside tokens | ✅ HARDCODED_PX | — |
| Missing JS for `data-brut` markup | ✅ MISSING_JS | — |
| Missing `.meta.js` for interactives | ✅ MISSING_META | — |
| Class root === `data-brut` hook | ❌ | CLAUDE.md, AGENTS.md |
| No imports in component JS | ❌ | AGENTS.md |
| Transitions ≤140ms | ⚠️ Workflow B scan, not doctor | — |
| No `rgba()` in components.css | ⚠️ Workflow B scan, not doctor | — |
| `INTERACTIVE_COMPONENTS ⊆ KNOWN_COMPONENTS` | ❌ | implicit |

The constraints that *aren't* doctor-encoded are the ones that drift (D4, D1).

**Recommendation:** **every documented hard constraint must be a doctor check or it doesn't exist.** Promote Workflow B scans into doctor (or document why they can't be — slowness, false positives). Bring "class root === hook" and "INTERACTIVE ⊆ KNOWN" into doctor as new check types.
**Severity:** high-conceptual. This is the principle that distinguishes a maintained kit from a documented one.

### D8. Examples field conflates three audiences

Each `examples[*].html` serves three readers simultaneously: a human reading docs, an MCP agent synthesizing markup, and an LLM doing few-shot prediction. Their needs differ:

- Humans want context (a heading, surrounding markup, intent).
- Agents want minimal valid invocation.
- LLMs want diverse variants for pattern induction.

Today everything is one field, so we compromise. Carousel ships 3 examples; switch ships 2; some statics will ship 0.

**Impact:** today's compromise is fine; at scale it becomes either "examples are too long for agents" or "examples are too sparse for docs." Either failure mode is silent.
**Recommendation:** if M8 sees pressure on this, split into `examples` (docs-grade, rich) and `agent_examples` (terse, deterministic) with a doctor check that agent_examples are minimally complete. Don't pre-emptively split.
**Severity:** low today; flagged for awareness.

### D9. CSS file is monolithic

`src/components.css` is 2868 lines, 552 class roots, 125 kB. No code-splitting. The vite-plugin's `cfg.components` flag enables tree-shaking by class name (M5/M6), but it's opt-in and operates on the full bundle.

**Impact:** at current size, fine. At 2× (post-M5 utilities, post-M7.1 statics with examples), the dev-feedback loop on component edits will start to drag. Vite HMR picks up CSS edits cheaply, but full builds take 250-300ms today; growth is roughly linear.
**Recommendation:** when builds cross ~600ms or the file crosses 5000 lines, split per-component (`src/components/<name>.css`) and concat in the vite plugin. Don't refactor preemptively.
**Severity:** low. Watch the build-time metric.

### D10. Demo bitrot is unmanaged

`demos/*.html` files reference legacy classes (`.brut-pager`, `.brut-cb`, `.brut-eyebrow`, `.brut-display-3`, `.brut-pull-quote`, etc.) that aren't in `KNOWN_COMPONENTS`. Doctor flags them as 201 `UNKNOWN_CLASS` issues per run. The current treatment is to ignore the noise.

**Impact:** doctor's signal-to-noise ratio is poor; new contributors learn to skip the warnings, which is the opposite of what the tool exists for.
**Recommendation:** one of three paths, pick now:
1. Migrate demos to current conventions (1-2 days, parallel agents).
2. Move demos under `test/fixtures/` and exclude from doctor scans (1 hour).
3. Add `demos/` to a doctor allowlist with explicit `// drift expected` comments.
Recommendation: option 2, then option 1 over time.
**Severity:** medium. Damage to the doctor signal is the real cost.

---

## Encoding principles to add to the playbook

Lift these into CLAUDE.md / AGENTS.md so future contributors and agents share the framing:

1. **Doctor encodes every hard constraint.** A constraint that exists only in docs is a bug, not a constraint. New rules land with their check.
2. **Manifest is canonical; source is fallback.** When a tool needs to discover a component's shape, it queries the manifest. If the manifest is wrong, fix the meta file — don't paper over with source-crawl logic.
3. **Conventions are predictions, not aesthetics.** "Class root === `data-brut` hook" exists so agents can predict markup. Each violation costs prediction accuracy, which costs every downstream consumer. Treat violations as bugs unless explicitly grandfathered.
4. **Single source of truth, derived views.** Parallel arrays (D1) are smells. If two lists must agree, derive one from the other.
5. **Plugins decompose along concerns, not along files.** Every Vite-plugin lifecycle hook is a separate concern. Don't pile.

## Recommended next-quarter work, prioritized

| # | Item | Effort | Impact |
|---|---|---|---|
| 1 | Backfill 49 static `.meta.js` (D3) | 1 day, parallel | high — completes the canonical-manifest promise |
| 2 | Doctor: class-root === hook check + INTERACTIVE ⊆ KNOWN check (D7, D1) | 2 hours | high — prevents recurrence of M7 drift |
| 3 | Resolve the 3 known violations (D4) — rename or formalize | 0.5 day | high — restores 100% prediction accuracy |
| 4 | Doctor: example HTML class+hook validation (D5) | 0.5 day | medium-high |
| 5 | Workspace layout decision (D6) | 1 day if migrating, 1 hour if documenting | medium |
| 6 | Demo migration or move (D10) | 1-2 days or 1 hour | medium — restores doctor signal |
| 7 | Plugin split (D2) | 1 day | medium |
| 8 | Define.js single-source refactor (D1, structural fix) | 0.5 day | medium |
| 9 | Token manifest + `get_token` MCP tool (deferred from M7) | 1-2 days | medium |
| 10 | Examples-format split (D8) | only if pressure surfaces | speculative |

Items 2 + 3 + 4 are a one-PR follow-up that locks in M7's gains. Items 1 + 9 are M8 prerequisites.
