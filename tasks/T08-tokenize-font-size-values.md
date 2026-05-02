# T08 — Replace literal `font-size` pixel values with `--fs-*` tokens in `components.css`

**Severity:** POLISH
**Effort:** S (~15 sites)
**Touches:** `src/components.css` only

## Why
Same hard rule as T07 — typography sizes belong in `tokens.css`. Multiple component blocks declare `font-size: 14px` etc. directly, but every common size already has a token.

## Font-size tokens already defined (from `src/tokens.css`)
```
--fs-xs:   12px      --fs-sm:   14px      --fs-base: 16px      --fs-md:   18px
--fs-lg:   22px      --fs-xl:   28px      --fs-2xl:  36px      --fs-3xl:  48px
--fs-4xl:  64px      --fs-5xl:  88px      --fs-6xl:  128px
```

## Goal
Replace every `font-size: <Npx>` declaration in `src/components.css` whose value exactly matches a token, with `font-size: var(--fs-X)`. Leave non-matching values (e.g. `11px`, `15px`) alone — those go to T09.

## In scope
- `font-size: <Npx>` — only direct declarations.
- Inside shorthand `font:`, leave alone (different parser; out of scope).
- Inside `clamp(<min>, ..., <max>)` for fluid type — replace `min` and `max` if both map to tokens; otherwise skip the whole `clamp` and note in defer file.

## Steps
1. `grep -nE "font-size:" src/components.css`.
2. For each line, replace where the value matches a token; skip otherwise.
3. Add any non-matching value to `TOKENIZATION-DEFER.md` (shared with T07).

## Constraints (from AGENTS.md)
- Use only tokens from `src/tokens.css`.
- Do not edit `dist/`.

## Verify
```bash
bash build.sh
# All font-size lines in components.css should now use either var(--fs-*) or clamp(...) — no bare px.
grep -nE "font-size:[^;]*[0-9]+px" src/components.css | grep -v "var(--fs"
```
The grep should return only `clamp(...)` lines (acceptable) or be empty.

Open `docs/index.html`. Type sizes must look identical to before.

## Done when
- Build green; bare `font-size: Npx` removed (or only inside accepted `clamp`); visual no-regression.
