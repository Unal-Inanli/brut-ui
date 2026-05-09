---
title: Visual
---

# Visual foundations

The rules every BRUT screen obeys. These are encoded in the kit's
tokens — you get them for free as long as you compose with `.brut-*`
classes and `var(--*)` references. Reach for a hex or a hardcoded px
and you're fighting the system.

## Colors

Pure black ink (`#000`) on warm paper (`#FAF7F0`) is the baseline.
Highlighter yellow (`#FFD23F`) is the primary action color — it
appears on every primary button, every focus state, every "this is
the important one" moment. Six pop accents (pink, lime, blue, orange,
purple, mint) are used sparingly for category and emphasis. Neutrals
are warm "concrete" greys, never cool blue-grey.

## Type

Three families. **Archivo Black** for display (uppercase, tight
tracking, used at 36px+). **Space Grotesk** for body and UI
(400/500/700). **JetBrains Mono** for code and tabular data. No serif.
The display/body contrast is the entire personality.

## Spacing

4px base. Generous outer margins, tight inner gutters. Sections are
separated by 4px ink rules, not whitespace alone.

## Backgrounds

Mostly flat paper or ink. **No gradients ever.** No images as
decoration in components. Hero sections use offset solid-color shapes
(rectangles rotated a few degrees, with their own border + shadow) as
decoration. Repeating diagonal-stripe patterns are allowed for
scrims and disabled states.

## Animation

Snap, don't ease. 80–140ms transitions. Press states **translate** the
element down-and-right (toward the shadow); they do not fade or scale.
No bounces, no springs. `cubic-bezier(0.2, 0.8, 0.2, 1)` is the house
easing.

## Hover states

Element lifts up-and-left by 2px, shadow grows from 4px to 6px. The
"page" stays still. (For ghost buttons: invert — fill with ink, text
becomes paper.)

## Press states

Element translates down-and-right by 2px, shadow collapses to 0. The
button looks "stamped."

## Borders

Default `4px solid #000`. Smaller controls drop to 3px. Ultra-large
hero shapes go to 6–8px. Border color is **always** ink — colored
borders are reserved for error states.

## Shadows

Hard-edged offset only. Six steps: 2/4/6/8/12/16px, all with 0 blur,
all in pure ink. No soft shadows ever. No inner shadows. The shadow
**is** the elevation system.

## Corner radii

0 by default. 2–4px allowed for inputs and small chips when the
design calls for slight softening. Pills (999px) allowed for tags and
status dots only.

## Cards

Border + offset shadow. Padding 16–24px. No internal dividers —
sections are separated by border-tops in the same 3–4px ink. Cards
never use background images.

## Imagery vibe

When photography is added (not in this base kit), it should be
high-contrast, slightly warm, optionally duotoned with a pop accent.
Never soft, never grainy filters, never pastel.

## Transparency / blur

Avoid. The aesthetic is opaque and physical. The one allowed use of
transparency: a striped scrim behind modals (45° lines at 6%
opacity).

## Layout rules

Asymmetry is encouraged. Negative space is structural. Section breaks
are honest (a 4px line, not a fade-out). Fixed headers are fine but
must have a hard bottom border — no floating-with-blur. Compose pages
with the layout primitives in `components.css`:

- `.brut-container` for max-width
- `.brut-section` for full-bleed bands (ships the 4px ink bottom rule
  by default — opt out with `--flush`)
- `.brut-stack`, `.brut-cluster`, `.brut-bar` for one-axis flow
- `.brut-grid`, `.brut-split` for two-axis layout
- `.brut-shape` drops rotated offset rectangles into hero sections
- `.brut-scrim` is the only sanctioned use of transparency in the kit

## Density

Medium. Generous, but not airy. Buttons feel hand-sized; tap targets
are 44px minimum.

## What this means in practice

Everything looks like it was made on purpose. The kit refuses to
disappear into your page — it asserts a point of view. If you need
softer, fade-y, brand-friendly visuals, BRUT isn't the right kit. If
you want hard-edged screens that feel built rather than decorated,
this is the system.
