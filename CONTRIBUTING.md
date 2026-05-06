# Contributing to BRUT

Thanks for showing up. BRUT is a small kit with strict rules — read
this page once before you open a PR and you'll save yourself a round
of review.

For AI-orchestrated contributions, [`AGENTS.md`](./AGENTS.md) is the
authoritative recipe and [`CLAUDE.md`](./CLAUDE.md) is the
orchestration playbook. This page covers what a *human* contributor
needs to know.

---

## What this project is

BRUT is a vanilla HTML / CSS / JS UI kit. **No frameworks. No
preprocessors. No runtime dependencies.** It ships as one CSS file
(`dist/brut.css`) and one optional JS runtime (`dist/brut.js`).

The build (Vite, since 1.0) is internal — consumers never run it.
They drop in a `<link>` tag or `npm install @sprtn/ui` and write
`.brut-*` markup. That contract is permanent.

---

## Prerequisites

- **Node ≥20.** A `.nvmrc` is committed — run `nvm use` if you have nvm.
- **pnpm.** This repo is a pnpm workspace; `npm` and `yarn` won't resolve
  `workspace:*` references. The `packageManager` field is pinned, so
  Corepack (bundled with Node 20+) will fetch the right pnpm version
  automatically. If `pnpm` isn't found, run `corepack enable` once.
- A modern browser for testing.

If you only want to *use* the kit, you don't need Node at all — see
the [install docs](https://unal-inanli.github.io/brut-ui/get-started).

---

## Local setup

```bash
git clone https://github.com/Unal-Inanli/brut-ui.git
cd brut-ui
pnpm install
pnpm bootstrap        # builds dist/, runs doctor, primes the MCP server
```

`pnpm bootstrap` runs `pnpm build` (so `dist/components.json` exists for
the MCP server) and `npx brut doctor` (so you catch convention drift
before pushing). After bootstrap, **restart Claude Code** so it loads
`.mcp.json` and registers the local `brut` MCP server — Claude can then
query the component manifest directly without crawling source.

Then:

```bash
pnpm dev              # starts Vite with HMR on the preview pages
pnpm preview          # serve the built dist/ (rarely needed)
```

Open any file under `preview/` in your browser to see a single
component in isolation. Open `docs/index.html` for the full Bootstrap-
style component reference.

Working in a `git worktree`? Each worktree needs its own `pnpm install`
and `pnpm bootstrap` because `node_modules/` is per-worktree.

---

## The four surfaces

Every component touches **four surfaces**. They must stay in sync. A
PR that updates one without the others will be asked to circle back.

| Surface | File | What you write |
| --- | --- | --- |
| **Styling** | `src/components.css` | The `.brut-<name>` class block, composed entirely from tokens. |
| **Behavior** | `src/js/components/<name>.js` | A single IIFE registering on `[data-brut="<name>"]`. Skip this for static-only components. |
| **Metadata** | `src/js/components/<name>.meta.js` | Sidecar describing the component's surface for `dist/components.json`. Skip for static. |
| **Preview** | `preview/components-<name>.html` | A standalone page that renders every variant. Loads `../dist/brut.css` (and `../dist/brut.js` if interactive). |
| **Docs** | `docs/index.html` | A `<section>` with a live preview and an HTML-escaped snippet, plus a sidebar anchor. |

For a new component, that's roughly 5 file edits. The full recipe is
in [`AGENTS.md`](./AGENTS.md) under "How to add a new component."

---

## Hard constraints

These are not preferences. PRs that violate any of them will be
returned for changes. The kit's character is the constraints — if you
relax them, you no longer have BRUT.

- **No new runtime dependencies.** The `brut` runtime stays
  framework-free and dependency-free. Standalone packages under
  `packages/*` may declare their own deps.
- **No frameworks.** No JSX, React, Vue, jQuery, Alpine, htmx in the
  runtime or in component files.
- **No hardcoded values outside `src/tokens/`.** Every color, spacing,
  border, shadow, radius, motion duration, and z-index must reference
  a token. Reach for a hex or a px? Add a token first.
- **No soft shadows, no raw transparency.** The kit's shadows are
  always pure ink with 0 blur. There is one sanctioned use of
  transparency tokens — `--scrim-bg` and `--scrim-bg-soft` for modal
  scrims — use those tokens rather than a hand-written transparent
  color.
- **No gradients.** The checkmark glyph is the sole exception until
  the SVG sprite ships.
- **No transitions over 140ms.** Loader animations may exceed; comment
  the carve-out where you make it.
- **No rounded corners beyond input and tag radii.** Pills (999px)
  are allowed only for tags and status dots.
- **Class roots must match the `data-brut` hook.** `.brut-checkbox`
  pairs with `data-brut="checkbox"`. Never abbreviate to `.brut-cb`.
  Agents predict markup from this convention — every violation costs
  prediction accuracy.
- **No hand-edits to `dist/`.** `dist/` is build output. Edit `src/`,
  rebuild.
- **No build-time tools added.** Vite is the only sanctioned tool and
  it stays internal.

The full constraint list lives in
[`AGENTS.md`](./AGENTS.md#hard-constraints).

---

## Verify before you push

Run all of these locally. CI runs them too — fail there and you wait.

```bash
pnpm build                                         # must exit 0

grep -rE "ui_kits|jsx|text/babel|React|require\(|import .* from " src/ docs/ preview/
# must print nothing — confirms no framework leakage

npx brut doctor                                    # must pass with 0 errors
```

`brut doctor` is the executable form of the hard constraints. If it
flags something, fix the underlying issue rather than working around
the check.

For visual verification, open `docs/index.html` and your component's
`preview/` page in a browser. Confirm:

- No console errors.
- No 404s in the network tab.
- For interactive components: click + Space + Enter all activate the
  component.
- The hidden `<input>` (if applicable) reflects the component's
  state on submit.

---

## Opening a PR

1. **Branch from `master`.** Use a descriptive name:
   `feat/component-toast`, `fix/switch-keyboard`, `docs/vite-guide`.
2. **One concern per PR.** A new component, a single bug fix, or a
   single doc update. PRs that mix surfaces are harder to review.
3. **Rebuild and commit `dist/`.** Yes, the built files are committed
   so consumers can use the repo URL with jsDelivr. CI will fail if
   `dist/` is out of date.
4. **Write a description that says *why*.** The diff says what.
5. **Reference an issue** if one exists. If not, that's fine — small
   contributions don't need an issue first.

A reviewer will check:

- The four surfaces are in sync.
- Tokens are used everywhere; no hardcoded hex/px/rem.
- `npx brut doctor` passes.
- Visuals match the [foundations](./README.md#documentation) — hard
  shadows, snap motion, no soft anything.
- Voice and copy match the [voice
  rules](https://unal-inanli.github.io/brut-ui/foundations/voice).

---

## Reporting bugs and asking for components

Use the GitHub issue templates — they prompt for the information
reviewers actually need.

- **Bug?** Use the `bug:` template.
- **New feature?** Use the `feat:` template. Hard-constraint check is
  required so we don't waste review time discussing whether a soft
  shadow is OK (it isn't).
- **New component?** Use the `component:` template. Name a closest
  existing analogue (`switch.js` for boolean, `combobox.js` for
  searchable select, `tag-input.js` for collection, …) so the
  reviewer can predict what your file will look like.

---

## Code of conduct

Be honest. Be direct. Don't be a tool *to* people. The kit's voice is
mouthy; the project's culture is not.

---

## Where to read more

- [`README.md`](./README.md) — install, usage, mental model.
- [`AGENTS.md`](./AGENTS.md) — full component-authoring recipe and
  hard-constraint catalog. Written for AI agents but readable.
- [`CLAUDE.md`](./CLAUDE.md) — orchestration playbook for multi-step
  AI workflows. Skip this unless you're orchestrating agents.
- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — post-1.0 design rationale,
  known debt, convention violations to be aware of.
- [`SKILL.md`](./SKILL.md) — class and token reference for AI tools
  (Claude Code skill manifest).
- [Documentation site](https://unal-inanli.github.io/brut-ui/) — the
  user-facing docs.
