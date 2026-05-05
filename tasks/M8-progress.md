# M8 progress checkpoint — VitePress docs + 1.0 launch

> **Purpose:** if this session ends mid-flight (token exhaustion, disconnect),
> a fresh agent can resume by reading this file alone. Update this file at
> every commit boundary.

**Branch:** `claude/schedule-m8-delay-Huo2o`
**Started:** 2026-05-05
**Acceptance gate (CLAUDE.md M8 row):**
- `npm view @brut/ui` resolves
- jsdelivr URL resolves
- site deployed
- `dist/components.json` enumerates all components (already true post-M7)

---

## Decisions to make BEFORE publish (do not skip)

These are blocking for the acceptance gate and require human input. The agent
should NOT decide them unilaterally.

1. **Package name on npm.** Current `package.json` says `"name": "brut"`. The
   M8 acceptance gate text says `npm view @brut/ui resolves`. These disagree.
   - Option A — keep `brut` (single, unscoped). Acceptance gate becomes
     `npm view brut resolves`. Risk: `brut` may already be taken on npm.
   - Option B — rename to `@brut/ui` (scoped). Requires creating the `@brut`
     org on npm and updating every internal reference (`package.json`, README,
     CDN URL examples, `@brut/mcp` already uses the scope so this is more
     consistent).
   - **Recommendation:** B. The MCP package already uses `@brut/mcp`; aligning
     to `@brut/ui` makes the family cohesive.
   - **Status:** DECIDED — `@brut/ui` (user approved 2026-05-05). Applied to
     CDN URL examples in `docs-site/get-started.md`. `package.json` rename
     happens in row 8.

2. **Site host.** The acceptance gate says "site deployed". Options:
   - GitHub Pages from `docs-site/.vitepress/dist/` via Actions workflow
     (simplest; `unal-inanli.github.io/brut-ui` URL).
   - Custom domain (`brut.dev` etc.) — requires DNS the agent can't touch.
   - **Recommendation:** GH Pages first, custom domain later.
   - **Status:** DECIDED — GitHub Pages (user approved 2026-05-05). Workflow
     scaffolds in row 7, gated to `workflow_dispatch` so it stays disabled
     until the user enables Pages in repo settings.

3. **Fate of `site/`.** Existing `site/*.html` is a hand-built marketing site
   that overlaps with what `docs-site/` will become.
   - Option A — delete `site/` once `docs-site/` reaches parity.
   - Option B — keep `site/` as legacy / quick reference until 1.1.
   - **Recommendation:** A, but only after `docs-site/` smokes clean. Until
     then, leave `site/` untouched — it still loads `dist/brut.css` and
     proves the bundle works.
   - **Status:** DECIDED — A, delete after parity (user approved 2026-05-05).
     Removal happens at the end of M8, in a separate commit, only after
     `docs-site/` smokes clean end-to-end.

---

## Plan — atomic commits, each independently shippable

Each row is a single commit. After each, run `pnpm build`, push to remote.
If session dies: a fresh agent reads this file, sees which checkboxes are
ticked, picks up the next unchecked row.

| # | Commit message prefix | What it lands | Verify |
|---|---|---|---|
| 0 | ✅ `docs(m8): checkpoint plan` | This file. | file exists, pushed |
| 1 | ✅ `chore(m8): scaffold docs-site/ with VitePress` | `docs-site/package.json`, `docs-site/.vitepress/config.ts`, `docs-site/.vitepress/theme/`, `docs-site/index.md`, root `pnpm-workspace.yaml` updated | `pnpm --filter @brut/docs-site build` succeeds, emits `docs-site/.vitepress/dist/` (12.7 KB index.html + assets) |
| 2 | ✅ `docs(m8): port landing + get-started from site/` | `docs-site/index.md` (hero), `docs-site/get-started.md` (install + CDN URLs) | pages render, all links resolve |
| 3 | ✅ `docs(m8): port changelog + add 1.0.0 entry` | `docs-site/changelog.md`, root `CHANGELOG.md` (new) | renders; 1.0.0 section present |
| 4 | `docs(m8): components index + iframe previews` | `docs-site/components/index.md`, one MD per component embedding `<iframe src="/preview/components-<name>.html">` | every component page renders, iframe loads |
| 5 | `docs(m8): examples page` | `docs-site/examples.md` linking `demos/*.html` | renders, demo links work |
| 6 | `docs(m8): manifest schema reference` | `docs-site/reference/manifest.md` (port from `docs/manifest-schema.md`) | renders |
| 7 | `chore(m8): GitHub Pages deploy workflow (disabled)` | `.github/workflows/docs-deploy.yml` with `workflow_dispatch` only | YAML lints |
| 8 | `chore(m8): bump version to 1.0.0 + align package name` | `package.json` (name decision applied), `packages/mcp/package.json` peerDep bump if needed | `pnpm build` still works |
| 9 | (USER) `npm publish` + enable Pages workflow | external action by user | acceptance gate met |

---

## Surface inventory — what needs porting

**Existing source pages (port to MD):**
- `site/index.html` (646 lines) → `docs-site/index.md` (VitePress home layout + custom hero block)
- `site/get-started.html` (457 lines) → `docs-site/get-started.md`
- `site/components.html` (1094 lines) → `docs-site/components/index.md` + per-component pages
- `site/examples.html` (339 lines) → `docs-site/examples.md`
- `site/changelog.html` (311 lines) → `docs-site/changelog.md`
- `docs/index.html` (135 KB, the giant single-page docs) → split into
  `docs-site/components/<name>.md` (one per component) + `docs-site/tokens.md`

**Component pages needed** (from `preview/` listing — 53 total):
accordion, alerts, avatars, badges, breadcrumbs, buttons, cards, carousel,
combobox, date, dialog, drawer, dropzone, empty, file, footer, form-layouts,
forms, grid, inputs, layout, menu, modal (etc — full list in `preview/`).

**Fixtures kept as-is:** `preview/*.html`, `demos/*.html`. Per CLAUDE.md M8
row: "preview/ retained as fixtures". The docs-site iframes them.

---

## Constraints recap (paste-from-CLAUDE.md, do not delete)

- **Zero-dep carve-out applies.** `docs-site/` is a sibling package with its
  own `package.json`. Adding VitePress + Vue here is allowed; the runtime
  `brut` package stays zero-dep.
- **Vanilla output principle stands.** VitePress is build-time only. The
  generated static site loads `dist/brut.css` and `dist/brut.js` like any
  consumer would.
- **Don't hand-edit `dist/`.**
- **`preview/` is canonical fixtures.** Don't move or rewrite preview pages
  — iframe them from docs-site.

---

## Resume protocol (for a fresh agent)

1. Read this file top-to-bottom.
2. `git log --oneline -20` — confirm which rows above are committed.
3. Pick the first unchecked row. Do ONLY that row.
4. After committing, update this file (tick the row, update "Status" lines if
   a decision was made), commit the doc update separately.
5. `git push -u origin claude/schedule-m8-delay-Huo2o`.
6. Stop. Hand back to the user with a 2-line status.

**Do not** batch multiple rows into one commit. Token resilience requires
small, frequent commits.

---

## Status log (most recent at top)

- 2026-05-05 — Row 3: root `CHANGELOG.md` written (Keep-a-Changelog format)
  with 1.0.0 (M1–M8 summary) and 0.1.0 entries. `docs-site/changelog.md`
  uses VitePress `<!--@include: ../CHANGELOG.md{3,}-->` so the file is single
  sourced — npm renders root CHANGELOG.md, VitePress renders the included
  copy.
- 2026-05-05 — Row 2: get-started.md ported. Includes CDN install (jsDelivr +
  unpkg, both pinned to `@brut/ui@1`), npm install, download, three onboarding
  examples (button/switch/field), token override pattern, smoke-test snippet.
  Three blocking decisions resolved (`@brut/ui`, GH Pages, delete site/ after
  parity).
- 2026-05-05 — Row 1: docs-site/ scaffolded with VitePress 1.6.4. Build passes
  (3.4 s). Other top-level pages (get-started, components, examples, changelog,
  reference/manifest) are placeholder MD with pointers to which row fills them.
  VitePress base path defaults to `/brut-ui/` (override with `VITE_BASE`).
- 2026-05-05 — Row 0: checkpoint doc written and pushed.
