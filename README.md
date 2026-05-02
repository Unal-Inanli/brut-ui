# BRUT — A Neo-Brutalist UI Kit

> Build it like you mean it.

BRUT is a neo-brutalist component library. Hard borders. Hard offset shadows. Loud color. No gradients, no soft drop-shadows, no rounded-corner-with-left-accent-stripe cliché. Every screen looks like it was made on purpose.

The kit ships as **two flat bundles**: `dist/brut.css` for the visual system, and `dist/brut.js` — a tiny vanilla-JS runtime — for the interactive form components (switch, checkbox, radio, segmented, tabs, stepper, password toggle, search clear, OTP, tag input, combobox, file picker, dropzone, character counter, rating, dialog). Static visual components and CSS-only form controls (textarea, select, range, color, fieldset, …) need no script.

This project is generated from scratch — no codebase, Figma, or attached materials were provided. Everything here is original visual direction, ready to be torn apart and iterated on.

---

## Index

| Path | What it is |
| --- | --- |
| `src/tokens.css` | Design tokens — colors, type, spacing, shadows, borders, motion |
| `src/components.css` | Component + layout classes — `.brut-btn`, `.brut-card`, `.brut-input`, … plus layout primitives `.brut-container`, `.brut-section`, `.brut-stack`, `.brut-cluster`, `.brut-bar`, `.brut-grid`, `.brut-split`, `.brut-rule`, `.brut-aspect`, `.brut-scrim`, `.brut-shape` |
| `src/js/core.js` | Runtime — `Brut.register`, `Brut.init`, `Brut.ready`. Auto-inits on `DOMContentLoaded`. |
| `src/js/components/*.js` | One file per JS-bound component. Hooks on `data-brut="<name>"`. |
| `dist/brut.css` | Built CSS bundle — `tokens.css` + `components.css` concatenated. **Always ship this.** |
| `dist/brut.js` | Built JS bundle — `core.js` + every `components/*.js`. **Ship this when you use any `data-brut="…"` component.** |
| `build.sh` / `package.json` | Trivial concatenation build. Run `npm run build` or `bash build.sh`. |
| `docs/index.html` | Static Bootstrap-style docs page — every class with a live preview and copy-paste HTML snippet. Open it directly in a browser. |
| `preview/*.html` | Standalone per-component demo pages. Each loads the dist bundles it needs. |
| `assets/logo.svg`, `assets/monogram.svg` | Brand marks |
| `demos/` | Full-page compositions (`landing.html`, `login.html`, `index.html`) showing the kit in real layouts. Drop new demo pages here. |
| `AGENTS.md` | Instructions for AI agents working in this repo. The authoritative recipe for adding/refining components. |
| `TODO.md` | Queued component work — toast, topnav, table, drawer, accordion, etc. Each entry is a self-contained spec for hand-off. |
| `SKILL.md` | Agent skill manifest for **Claude Code** — drop this folder into Claude Code as `~/.claude/skills/brut/`. |
| `.opencode/skills/brutalist/SKILL.md` | Same skill, **OpenCode** flavor (different frontmatter format). Keep both in sync when updating component lists or rules. |

---

## CONTENT FUNDAMENTALS

**Voice:** confident, second-person, slightly mouthy. We talk to builders, not users. Imperative verbs. Short sentences. Periods.

**Tone:** Honest > clever. Direct > polite. The product is a tool — talk like a tool.

**Casing:** Display headlines = ALL CAPS. UI labels (buttons, tabs, badges) = ALL CAPS, tight letterspacing. Body copy = sentence case. Never title case.

**Punctuation:** Full stops at the end of headlines. ("UI THAT PUNCHES BACK.") Em-dashes are fine. Avoid exclamation points unless ironic. Numerals over spelled-out numbers.

**I vs you:** "You" is the reader. "We" is the team behind BRUT. Avoid "I" outside personal blog posts.

**Emoji:** No. Use icons or unicode glyphs (★ ↑ ↓ → ✕ ✓ •) when needed. They render with the same hard-edged feeling.

**Examples that match:**
- ✅ "Ship loud. Ship today."
- ✅ "9 colors. 0 gradients."
- ✅ "Snap, never ease."
- ✅ "Cannot be undone. You'll be fine."
- ❌ "Welcome to your dashboard! 👋"
- ❌ "Let's get you started on your journey 🚀"
- ❌ "Discover the power of BRUT's amazing components"

---

## VISUAL FOUNDATIONS

**Colors:** Pure black ink (`#000`) on warm paper (`#FAF7F0`) is the baseline. Highlighter yellow (`#FFD23F`) is the primary action color — it appears on every primary button, every focus state, every "this is the important one" moment. Six pop accents (pink, lime, blue, orange, purple, mint) are used sparingly for category and emphasis. Neutrals are warm "concrete" greys, never cool blue-grey.

**Type:** Three families. **Archivo Black** for display (uppercase, tight tracking, used at 36px+). **Space Grotesk** for body and UI (400/500/700). **JetBrains Mono** for code and tabular data. No serif. The display/body contrast is the entire personality.

**Spacing:** 4px base. Generous outer margins, tight inner gutters. Sections are separated by 4px ink rules, not whitespace alone.

**Backgrounds:** Mostly flat paper or ink. **No gradients ever.** No images as decoration in components. Hero sections use offset solid-color shapes (rectangles rotated a few degrees, with their own border + shadow) as decoration. Repeating diagonal-stripe patterns are allowed for scrims/disabled states.

**Animation:** Snap, don't ease. 80–140ms transitions. Press states **translate** the element down-and-right (toward the shadow); they do not fade or scale. No bounces, no springs. `cubic-bezier(0.2, 0.8, 0.2, 1)` is the house easing.

**Hover states:** Element lifts up-and-left by 2px, shadow grows from 4px to 6px. The "page" stays still. (For ghost buttons: invert — fill with ink, text becomes paper.)

**Press states:** Element translates down-and-right by 2px, shadow collapses to 0. The button looks "stamped."

**Borders:** Default `4px solid #000`. Smaller controls drop to 3px. Ultra-large hero shapes go to 6–8px. Border color is **always** ink — colored borders are reserved for error states.

**Shadows:** Hard-edged offset only. Six steps: 2/4/6/8/12/16px, all with 0 blur, all in pure ink. No `rgba()` shadows ever. No inner shadows. The shadow IS the elevation system.

**Corner radii:** 0 by default. 2–4px allowed for inputs and small chips when the design calls for slight softening. Pills (999px) allowed for tags and status dots only.

**Cards:** Border + offset shadow. Padding 16–24px. No internal dividers — sections are separated by border-tops in the same 3–4px ink. Cards never use background images.

**Imagery vibe:** When photography is added (not in this base kit), it should be high-contrast, slightly warm, optionally duotoned with a pop accent. Never soft, never grainy filters, never pastel.

**Transparency / blur:** Avoid. The aesthetic is opaque and physical. The one allowed use of transparency: a striped scrim behind modals (45° lines at 6% opacity).

**Layout rules:** Asymmetry is encouraged. Negative space is structural. Section breaks are honest (a 4px line, not a fade-out). Fixed headers are fine but must have a hard bottom border — no floating-with-blur. Compose pages with the layout primitives in `src/components.css`: `.brut-container` for max-width, `.brut-section` for full-bleed bands (it ships the 4px ink bottom rule by default — opt out with `--flush`), `.brut-stack`/`.brut-cluster`/`.brut-bar` for one-axis flow, `.brut-grid`/`.brut-split` for two. `.brut-shape` drops rotated offset rectangles into hero sections; `.brut-scrim` is the only sanctioned use of transparency in the kit.

**Density:** Medium. Generous, but not airy. Buttons feel hand-sized; tap targets are 44px minimum.

---

## ICONOGRAPHY

**Status:** **Placeholder until we ship an in-kit SVG sprite** (planned — see `TODO.md` Tier 6.1). The kit's hard rule is *zero external dependencies*, so loading an icon library from a CDN is **not** part of the supported install path. Today, components that need a glyph use unicode or a locally-defined SVG.

**Visual spec (the rules the future sprite will conform to):** stroke-based, 24px viewBox, 2.5px stroke weight, square caps, miter joins, `currentColor`, no fills, no rounded caps. This matches the chunky, hand-built feeling. Anything you draw to this spec will slot in alongside the kit's existing visuals.

**Today, in your own pages:** if you need icons before the sprite ships, either inline SVGs you draw to the spec above or use a third-party set as **a private project decision** — the kit itself won't pull anything in. `preview/brand-icons.html` has hand-rolled examples in the right visual language.

**Unicode:** Allowed for arrows (→ ← ↑ ↓), stars (★), bullets (•), checks (✓ ✕). They render at the body font's stroke weight and look right.

**Emoji:** **Never.** Emoji break the visual system — they're soft, colored, gradiented, and round.

---

## FONT SUBSTITUTIONS — please review

I used Google Fonts as the source for all three families because no font files were provided. **All three are substitutes.**

| Role | Font in use | Source | Replace with? |
| --- | --- | --- | --- |
| Display | **Archivo Black** | Google Fonts | A true industrial grotesk would be louder (e.g. PP Neue Machina, Space Mono Bold, or a custom display) |
| Body / UI | **Space Grotesk** | Google Fonts | Could swap for a more idiosyncratic grotesk (e.g. PP Neue Montreal, Söhne) |
| Mono | **JetBrains Mono** | Google Fonts | Solid default — no urgent need to replace |

**👉 If you have webfont files (`.woff2` / `.ttf`) for any of these roles, drop them into `fonts/` and update `src/tokens.css` — currently it imports from Google Fonts CDN.**

---

## How to use

Drop the CSS bundle into any HTML page. Add the JS bundle if you use any interactive form component (anything with a `data-brut="…"` attribute).

```html
<link rel="stylesheet" href="dist/brut.css">
<script src="dist/brut.js" defer></script>  <!-- only if you use a data-brut="…" component -->

<button class="brut-btn brut-btn--primary">SHIP IT.</button>
```

A simple form using both static and interactive components:

```html
<form class="brut-form">
  <div class="brut-field">
    <label class="brut-field__label" for="email">Email</label>
    <input id="email" class="brut-input" type="email" />
  </div>
  <label class="brut-switch" data-brut="switch">
    <input type="checkbox" name="notify" hidden>
    <span class="brut-switch__knob"></span>
  </label>
  <div class="brut-stepper" data-brut="stepper">
    <button class="brut-stepper__btn" data-brut-step="down">−</button>
    <input class="brut-stepper__input" type="number" name="qty" min="0" value="1">
    <button class="brut-stepper__btn" data-brut-step="up">+</button>
  </div>
</form>
```

All `data-brut="…"` components auto-init on `DOMContentLoaded`. For markup added later (modal contents, dynamically rendered lists), call `Brut.init(rootElement)` after insertion. Re-init is a no-op.

Tokens are exposed as CSS variables, so you can compose your own elements without touching the kit:

```html
<button style="
  font-family: var(--font-display);
  background: var(--primary);
  border: var(--bw-3) solid var(--ink);
  box-shadow: var(--shadow-sm);
  padding: var(--sp-3) var(--sp-5);
  text-transform: uppercase;
">Click me</button>
```

## Build

The library is a flat concatenation: tokens + components into `dist/brut.css`, runtime + components into `dist/brut.js`.

```bash
npm run build      # or: bash build.sh
```

This produces `dist/brut.css` and `dist/brut.js`. Re-run after any edit under `src/`.

## Project layout

```
src/                  # source — edit these
  tokens.css          # design tokens (colors, type, spacing, shadows, borders, motion)
  components.css      # component classes + layout primitives
  js/
    core.js           # Brut runtime (registry + init + ready)
    components/*.js   # one file per JS-bound component
dist/                 # built bundles — DO NOT edit by hand
  brut.css            # tokens + components, in order
  brut.js             # core + every components/*.js, in order
docs/index.html       # static docs page (loads dist/brut.css and dist/brut.js)
preview/*.html        # per-component playground demos
demos/                # full-page compositions (landing, login, …) built from kit components
assets/               # brand marks
build.sh              # build script
package.json          # exposes `npm run build`
AGENTS.md             # authoritative recipe for AI agents adding/refining components
TODO.md               # queued component work — one self-contained spec per entry
SKILL.md              # Claude Code skill manifest
.opencode/skills/brutalist/SKILL.md   # OpenCode flavor of the same skill (keep in sync)
```

## Authoring new components

See `AGENTS.md` for the full standard. The short version:

1. **Visual styling → `src/components.css`**, using only tokens.
2. **Interactive behavior → `src/js/components/<name>.js`**, registered with `Brut.register('<name>', { selector: '[data-brut="<name>"]', init })`. Hook on `data-brut="<name>"`, never on a class. Mirror state to a hidden `<input>` so forms post cleanly. Dispatch `CustomEvent('brut:change', { detail })` on change. No frameworks, no transpilers, no dependencies.
3. **Preview → `preview/components-<name>.html`**, **docs → new section in `docs/index.html`** with a live preview and a `<pre class="docs-snippet">` snippet.
4. **Build → `npm run build`**, then open the docs page and verify.

---

## Caveats

- **From-scratch system.** No real product, codebase, or brand brief was attached. Everything is one designer's interpretation of "neo-brutalism."
- **All fonts are substitutes** (see above).
- **No icon set ships with the kit yet** — see TODO.md Tier 6.1 for the planned in-kit SVG sprite. Loading a third-party set from a CDN is *not* part of the supported install path (the kit's hard rule is zero external deps).
- **No real product copy.** All sample text is placeholder.
- **No dark mode yet.** A "dark paper" reverse mode is the obvious next step.
