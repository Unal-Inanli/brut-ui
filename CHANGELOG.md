# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] — 2026-05-07

### Added

- **One-command contributor onboarding.** `pnpm bootstrap` runs the
  Node-version check, builds `dist/` (so `dist/components.json` exists for
  the MCP server), and runs `npx brut doctor` for a clean baseline.
  Implementation in `scripts/bootstrap.js`.
- **Post-install reminder.** `pnpm install` now nudges first-time
  contributors toward `pnpm bootstrap` via the `prepare` lifecycle hook
  (`scripts/post-install-notice.js`). No-ops in CI and after the first
  successful build.

### Documentation

- README "Contributing" surfaces the `pnpm bootstrap` one-liner so new
  contributors hit it on the main entry path.
- CONTRIBUTING "Verify before you push" uses `pnpm build` for consistency
  with the rest of the page.

## [1.1.0] — 2026-05-06

### Added

- **MCP utility & suggestion tools.** `@sprtn/mcp` ships `list_utilities`,
  `suggest_component`, `list_tokens`, `update_token`, and `add_token`, plus
  richer static metadata for components that don't emit their own
  `.meta.js`. Backed by two new modules in `@sprtn/ui`:
  `src/config/static-meta.js` and `src/config/utilities-meta.js`, both
  consumed by the manifest emitter.
- **Manifest enrichment.** `dist/components.json` now includes utility-class
  metadata and an expanded static surface for non-interactive components.
  `dist/manifest-schema.json` updated to match.
- **Contributing guide.** New `CONTRIBUTING.md` plus issue templates under
  `.github/ISSUE_TEMPLATE/` (bug report, component request, feature
  request, config).

### Changed

- **README rewritten** for human-first install. Three install paths
  (`<script>`, `npm`, `npx brut init`), an integration map, and a quick
  "first build" walkthrough. The script-tag / zero-build adoption story
  remains the recommended on-ramp.
- **Vite plugin** (`src/config/vite-plugin.js`) wires the new static and
  utility metadata into the manifest output.

### Documentation

- New integration guides under `docs-site/integrations/`: Astro, Next.js,
  Nuxt, plain HTML, SvelteKit, Vite.
- New foundations pages under `docs-site/foundations/`: fonts, iconography,
  visual, voice.

## [1.0.1] — 2026-05-05

### Fixed

- `npx brut build` no longer fails with `Cannot resolve entry module
  src/main.js` in a freshly initialized consumer project. The CLI's `build`
  command was resolving the Vite library entry from `process.cwd()` instead
  of the installed `@sprtn/ui` package, so projects that contained only a
  `brut.config.js` (the sole file `brut init` scaffolds) had no entry to
  bundle. The entry now resolves from the package directory.

## [1.0.0] — 2026-05-05

The first stable release. The package name moves from `brut` to `@sprtn/ui`
to align with `@sprtn/mcp`. The runtime contract — drop `brut.css` and
`brut.js` into a page, write `.brut-*` classes — is unchanged.

### Added

- **Build system migrated to Vite** (M3). `bash build.sh` is now a thin shim
  over `vite build`. `pnpm dev` provides HMR for the preview pages.
- **3-layer token system** (M1, M2). Tokens split into
  `src/tokens/01-primitives.css`, `02-semantic.css`, `03-intent.css` so
  themes override only what they need.
- **Configuration via `brut.config.js`** (M6). A Vite plugin reads project
  config, supports class-prefix renaming and per-component opt-out, and
  emits an aligned manifest.
- **`npx brut` CLI** (M6). `init`, `add`, `theme`, `migrate`, `doctor`, and
  `build` subcommands. `doctor` enforces the kit's hard constraints as
  executable checks rather than prose.
- **Manifest + schema** (M7). `dist/components.json` enumerates every
  component, its modifiers, events, hidden-input contract, and
  copy-pasteable examples. Backed by `dist/manifest-schema.json` (JSON
  Schema 2020-12).
- **`@sprtn/mcp` server** (M7). MCP tools (`list_components`,
  `get_component`, `search_examples`, `validate_markup`) consume the
  manifest so AI agents can scaffold pages without crawling source.
- **Sidecar metadata files** (M7). Each interactive component now has a
  `<name>.meta.js` describing its surface, validated by the Vite plugin.
- **Carousel + pagination JS** (M7). Closes the JS-parity gap for the two
  components that previously needed runtime support but lacked it.
- **VitePress documentation site** (M8). New `docs-site/` package — built
  from Markdown, themed with the kit's own CSS, deployed to GitHub Pages.
  `preview/*.html` is retained as canonical fixtures and is iframed by
  per-component pages.
- **CDN distribution documented** (M8). Pinnable URLs on jsDelivr and unpkg
  for both `dist/brut.css` and `dist/brut.js`.

### Changed

- **Package name: `brut` → `@sprtn/ui`.** Imports become
  `import '@sprtn/ui/css'` and `import '@sprtn/ui'`. The `exports` map and
  bin entry are unchanged.
- **`@sprtn/mcp` peerDependency** updated to `@sprtn/ui ^1.0.0`.

### Removed

- The legacy hand-built `site/` directory has been replaced by `docs-site/`.

## [0.1.0] — 2026-05-03

Initial release. Vanilla HTML+CSS+JS UI kit. Two flat files,
zero dependencies.

### Added

- **150+ components** across Forms, Interactive, Layout, Display,
  Typography, and Tables.
- **Form controls:** `input`, `textarea`, `select`, `checkbox`, `radio`,
  `switch`, `stepper`, `range`, `range-dual`, `otp`, `tag-input`, `file`,
  `dropzone`, `rating`, `combobox`, `multiselect`, `password`, `date`,
  `time`, `color`, `search`.
- **Interactive components:** `accordion`, `dialog`, `drawer`, `menu`,
  `popover`, `tabs`, `toast`, `tooltip`, `sidebar`.
- **Layout primitives:** `stack`, `cluster`, `bar`, `grid`, `split`,
  `section`, `container`, `field`, `fieldset`, `topnav`, `footer`.
- **Display components:** `badge`, `alert`, `card`, `tag`, `avatar`,
  `avatar-group`, `skeleton`, `spinner`, `empty`, `breadcrumbs`,
  `pagination`, `rows`.
- **Typography:** full type scale from `display-1` through `caption`,
  plus `eyebrow`, `kicker`, `overline`, `code`, `pre`, `kbd`, `mark`,
  `quote`, `prose`.
- **Tables:** `table`, `table-wrap`, `table-toolbar`, `table-filter`,
  `table-columns` with sticky head and sticky column support.
- **80+ CSS variables** for color, typography, spacing, shadows, borders,
  and motion.
- **Hard-edge shadow system:** 6 sizes from `--shadow-xs` (2px) to
  `--shadow-2xl` (16px), never blurred.
- **6 pop colors** — pink, lime, blue, orange, purple, mint — plus
  semantic signal colors.
- **Snap motion tokens:** `--dur-fast` 80ms, `--dur-base` 140ms,
  `--ease-snap` cubic-bezier.
- **Three font families:** Archivo Black (display), Space Grotesk (UI),
  JetBrains Mono (code).
- **4px base spacing grid** from `--sp-1` (4px) to `--sp-20` (80px).
- **JS runtime:** 32 interactive components auto-initialized via
  `data-brut`. All dispatch `brut:change` / `brut:complete` events,
  mirror state to a hidden input, support keyboard navigation, and
  initialize idempotently.

[1.0.0]: https://github.com/Unal-Inanli/brut-ui/releases/tag/v1.0.0
[0.1.0]: https://github.com/Unal-Inanli/brut-ui/releases/tag/v0.1.0
