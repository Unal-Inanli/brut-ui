# T01 — Rename `toast.js` to match its registered component name

**Severity:** DRIFT
**Effort:** S (one rename + rebuild)
**Touches:** `src/js/components/toast.js` → `src/js/components/toast-host.js`

## Why
AGENTS.md convention: "Filename is the component name." `src/js/components/toast.js:88` calls `Brut.register('toast-host', …)`, and `preview/components-toast.html:46` mounts via `data-brut="toast-host"`. The filename is the only thing out of step.

## Goal
Rename the file so its name matches the registered name. No code change inside the file. Bundle order stays alphabetical (`toast-host.js` still sorts after `toast`-prefixed peers — there are none).

## Steps
1. `git mv src/js/components/toast.js src/js/components/toast-host.js` (or `mv` if not staging).
2. `npm run build`.
3. Verify the runtime still works: open `preview/components-toast.html`, click each demo trigger; toasts must appear and dismiss.

## Constraints (from AGENTS.md)
- One component per file. Filename is the component name.
- Hook on `data-brut="<name>"`. Class names are visual; data attributes are behavioral.

## Verify
```bash
bash build.sh
test -f src/js/components/toast-host.js && ! test -f src/js/components/toast.js && echo OK
grep -n "Brut.register('toast-host'" src/js/components/toast-host.js
```

## Done when
- File renamed, build green, preview page still triggers toasts on click.
- No other file edited.
