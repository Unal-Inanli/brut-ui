# Tokenization defer log — pixel literals not tokenized by T07/T08

Generated: 2026-05-02 — after T07 (spacing → `--sp-*`) and T08 (font-size → `--fs-*`) were applied to `src/components.css`. This file lists every remaining bare `px`/`rem` literal in spacing- or sizing-related properties, so a follow-up pass can decide: add a token, snap to a near-token, or accept as a documented exception.

## Buckets
- **NEW** — value recurs ≥ 2 times or has clear semantic meaning → **add a token**.
- **SNAP** — within ~2 px of a token → **reuse with note** that visual will shift slightly.
- **EXCEPTION** — one-off geometry, no semantic name → keep literal, add inline `/* sanctioned */` comment.

## Findings (grouped by component)

### Display / Prose typography
| line | property | literal | bucket | proposed token / reuse | note |
|---|---|---|---|---|---|
| 31  | font-size (clamp min) | 40px | NEW    | `--fs-display-3-min: 40px` (or new `--fs-2xl-alt`) | only display-3; could SNAP to existing `--fs-3xl` (48) or new dedicated token |
| 305 | margin-top  | 14px | SNAP→ NEW | `--sp-3-5: 14px` | `.brut-prose > * + *` rhythm; recurs at l.1824, l.273 |
| 306 | margin-top  | 32px | (already maps to `--sp-8`)  | — | T07 should have caught this — re-check pass |
| 307 | margin-top  | 24px | (already maps to `--sp-6`)  | — | T07 should have caught this — re-check pass |
| 263 | margin-top  | 4px  | (already maps to `--sp-1`) | — | T07 missed (regex skipped multi-decl line); polish in next pass |

### Buttons / form inputs (recurring 6/10/14 px micro-paddings)
| line | property | literal | bucket | proposed token / reuse | note |
|---|---|---|---|---|---|
| 202 | padding | 1px 6px   | EXCEPTION | — | `.brut-kbd` micro-padding |
| 210 | padding | 2px 6px   | EXCEPTION | — | `.brut-pre` inline |
| 313 | padding | 1px 6px   | EXCEPTION | — | `.brut-mark` |
| 282 | padding | 1px 4px   | EXCEPTION | — | `.brut-num` (already replaced 4 → `var(--sp-1)` ; the `1px` stays) |
| 352 | padding | 5px 10px  | NEW       | `--sp-2-5: 10px` | recurs heavily in btn--xs/inputs |
| 399 | padding | 10px 14px | NEW       | `--sp-2-5: 10px`, `--sp-3-5: 14px` | alert variants — repeats at 404, 1315 |
| 404 | padding | 10px 14px | NEW       | (same)                  | duplicate site |
| 419 | padding-right | 28px | NEW   | `--sp-7: 28px` | input + chevron padding; not in current scale |
| 1315| padding | 10px 14px | NEW       | (same)                  | toast |
| 638 | padding | 6px 10px  | NEW       | `--sp-1-5: 6px`, `--sp-2-5: 10px` | combobox token, recurs across forms |
| 1078| padding | … 10px    | NEW       | (same)                   | input--sm |
| 249 | padding-left | 30px | EXCEPTION | — | `.brut-list` glyph offset (visual nicety) |
| 1396| padding-right| 64px | already `--sp-16` candidate | snap | matches `--sp-16` exactly — fix in next pass |
| 1415| padding-right| 38px | NEW    | `--sp-9-5: 38px` or SNAP→`--sp-10` (40) | search icon offset |

### Switch / radio / checkbox knob & ring sizes
| line | property | literal | bucket | proposed |
|---|---|---|---|---|
| 506 | width: 56px; height: 30px | switch track | NEW | `--switch-w: 56px`, `--switch-h: 30px` |
| 515 | top/left: 2px              | switch knob inset | NEW | `--switch-inset: 2px` |
| 516 | width/height: 20px         | switch knob | NEW | `--switch-knob: 20px` |
| 520 | left: 28px                 | switch knob shifted | derived | `calc(--switch-w - --switch-knob - 2*inset)` or token |
| 524 | width/height: 22px         | radio/checkbox box | NEW | `--control-box: 22px` (used 8+ times: l.611, 680, 908, 976, 1189, 1233, 1241, 1420) |
| 547 | width/height: 36px         | swatch / avatar tier-1 | NEW | `--control-md: 36px` (l.1758, 1862, 1894 height variant, 2103, 2104) |
| 599 | width/height: 28px         | medium control | NEW | `--control-sm: 28px` (l.1725) |
| 871 | width/height: 44px         | hit-area minimum | NEW | `--hit-area: 44px` (recurs at 1329) |

### Avatars / icons
| line | property | literal | bucket | proposed |
|---|---|---|---|---|
| 721 | height: 96px | avatar-xl | NEW | `--avatar-xl: 96px` |
| 725 | width: 48px / height: 48px | avatar-lg | could SNAP→`--sp-12` (48) | semantic alias preferred: `--avatar-lg` |
| 732 | width/height: 32px | avatar-md | SNAP→`--sp-8` | semantic alias: `--avatar-md` |
| 759 | width/height: 56px | avatar / dropzone icon | NEW | `--avatar-2xl: 56px` |
| 1370| width: 36px | file thumb | (see `--control-md`) | reuse |
| 1388| width: 56px | password reveal | reuse `--avatar-2xl` |

### Layout / containers
| line | property | literal | bucket | proposed |
|---|---|---|---|---|
| 1843| max-width: 1200px | NEW | `--container-lg: 1200px` (also at 2016, 2155, 2160) |
| 2158| max-width: 720px  | NEW | `--container-sm: 720px` |
| 2159| max-width: 960px  | NEW | `--container-md: 960px` |
| 2161| max-width: 1440px | NEW | `--container-xl: 1440px` |
| 2244| width: 220px      | NEW | `--split-side: 220px` (l.587, 652) |
| 1706| width: 280px      | EXCEPTION | popover default |
| 1928| width: 240px      | EXCEPTION | drawer min |
| 1843| max-width: 1200px | NEW | container token (see above) |
| 1905| @media (max-width: 760px) | EXCEPTION | breakpoint — propose `--bp-md: 760px` if more breakpoints emerge |

### Popover / dropdown rails
| line | property | literal | bucket | proposed |
|---|---|---|---|---|
| 1522, 1593, 1699, 1792 | top: calc(100% + 4px) | NEW | `--rail-gap: 4px` (= existing `--sp-1`) — could rewrite as `var(--sp-1)` |
| 1457, 1577, 1740, 1755 | gap: 2px / 6px | EXCEPTION/NEW | propose `--sp-0-5: 2px`, `--sp-1-5: 6px` |
| 1527, 1598 | max-height: 240px | NEW | `--menu-max-h: 240px` |
| 1252 | height: 26px | EXCEPTION | OTP slot |
| 1212/1219/1225/1261 | height: 14px | NEW | `--icon-sm: 14px` |
| 1779 | height: 3px | EXCEPTION | tab indicator |

### Pagination / counter / range
| line | property | literal | bucket | proposed |
|---|---|---|---|---|
| 992  | min-width: 200px | EXCEPTION | breadcrumb collapse |
| 1151 | min-height: 88px | NEW | `--textarea-min-h: 88px` |
| 1280/1281 | width/height: 18px | NEW | `--icon-md: 18px` |
| 1628 | width: 10px | EXCEPTION | range track inset |
| 2135 | min-width: 24px | SNAP→`--sp-6` | reuse |
| 2308/2309 | width/height: 120px | NEW | `--shape-lg: 120px` |
| 2324–2327 | top/right/bottom/left: ±24px | already `--sp-6` | rewrite as `var(--sp-6)` (negatives kept literal — out of T07 scope) |

### Negative offsets (out of T07 scope, but worth flagging)
| line | property | literal | bucket | note |
|---|---|---|---|---|
| 811  | margin-right: -4px  | EXCEPTION | use `calc(var(--sp-1) * -1)` |
| 885  | margin-left: -10px  | NEW       | introduce `--sp-2-5: 10px`, then negate |
| 1237 | margin-top: -7px    | EXCEPTION | half-token tweak |
| 1282 | margin-left: -9px   | EXCEPTION | half-token tweak |
| 2324–2327 | top/right/etc.: -24px | reuse | `calc(var(--sp-6) * -1)` |

### Bare font-size literals (skipped by T08 because no exact token match)
| line | size | proposed |
|---|---|---|
| 349, 483, 1051, 1064, 1459 | 11px | NEW `--fs-2xs: 11px` (5 sites — clear case) |
| 489, 1140, 1161, 1387 | 15px | SNAP→ `--fs-base` (16) **OR** NEW `--fs-base-1: 15px`; recurs 4× |
| 806, 1127, 1548, 1633 | 13px | SNAP→ `--fs-sm` (14) **OR** NEW `--fs-2sm: 13px`; recurs 4× |
| 1404, 1745, 1815 | 10px | NEW `--fs-3xs: 10px` |

## Proposed new tokens (consolidated)

### Spacing (extends `--sp-*` half-step scale)
- `--sp-0-5: 2px`     — pagination chevron gap, dropdown rail gap
- `--sp-1-5: 6px`     — combobox padding, list-glyph offset
- `--sp-2-5: 10px`    — micro button/input padding (5+ sites)
- `--sp-3-5: 14px`    — alert/toast padding y, prose rhythm
- `--sp-7:  28px`     — input + trailing icon padding
- `--sp-9-5: 38px`    — search icon padding

### Typography
- `--fs-3xs: 10px`    — micro labels, badges
- `--fs-2xs: 11px`    — tiny captions (5 sites)
- `--fs-2sm: 13px`    — between-step body small (4 sites)
- `--fs-base-1: 15px` — input/menu body (4 sites)

### Component geometry (semantic aliases)
- `--switch-w: 56px`, `--switch-h: 30px`, `--switch-knob: 20px`, `--switch-inset: 2px`
- `--control-box: 22px` — radio/checkbox/star unified (8+ sites)
- `--control-sm: 28px`, `--control-md: 36px`
- `--avatar-md: 32px`, `--avatar-lg: 48px`, `--avatar-xl: 96px`, `--avatar-2xl: 56px`
- `--hit-area: 44px` — minimum touch target (WCAG)
- `--icon-sm: 14px`, `--icon-md: 18px`
- `--container-sm: 720px`, `--container-md: 960px`, `--container-lg: 1200px`, `--container-xl: 1440px`
- `--split-side: 220px`
- `--menu-max-h: 240px`
- `--textarea-min-h: 88px`
- `--rail-gap: 4px` (alias for `--sp-1` in popover/menu positioning)
- `--shape-lg: 120px`

## Notes for the human review

- **High-confidence "add token" wins** (highest occurrence count): `--control-box: 22px` (8+ sites), `--control-md: 36px` (5 sites), `--fs-2xs: 11px` (5 sites), `--container-lg: 1200px` (4 sites), `--sp-2-5: 10px` (5 sites).
- **Recheck T07 missed sites**: lines 263, 305, 306, 307, 1396, 2324–2327 contain values that DO map to existing `--sp-*` tokens but were skipped by T07 because they sit on multi-declaration single lines or were preceded by a `-`. A simple follow-up pass can clean these up.
- **Negative spacing**: T07 explicitly skipped negatives. Proposal: introduce `calc(var(--sp-N) * -1)` rewrites in the same follow-up.
- **No source files were edited by this audit task.**
