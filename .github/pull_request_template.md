## What changed

<!-- one or two sentences, the WHY behind the change -->

## Type
- [ ] Bug fix
- [ ] New component
- [ ] Component variant
- [ ] Token change
- [ ] Docs / preview only
- [ ] Refactor / chore

## Surface sync checklist (component changes only)
- [ ] `src/components.css` updated
- [ ] `preview/components-<name>.html` updated
- [ ] `docs/index.html` section updated
- [ ] `<name>.meta.js` sidecar updated (interactive components)

## Constraints verified
- [ ] No hardcoded colors / px / rem outside `src/tokens/`
- [ ] No new runtime dependencies
- [ ] No transitions > 140ms (non-loader)
- [ ] No raw `rgba(...)` (use `--scrim-bg` / `--scrim-bg-soft`)
- [ ] `pnpm build` exits 0
- [ ] `npx brut doctor` reports 0 new findings

## Test plan

<!-- bullet list of what was manually verified, e.g. browser smoke, keyboard nav, axe scan -->

## Related issues / PRs

<!-- e.g. Closes #123 -->
