---
title: Iconography
---

# Iconography

## Status

**Placeholder until we ship an in-kit SVG sprite.** The kit's hard
rule is *zero external dependencies*, so loading an icon library from
a CDN is **not** part of the supported install path. Today,
components that need a glyph use unicode or a locally-defined SVG.

## Visual spec (the rules the future sprite will conform to)

- Stroke-based (no fills)
- 24px viewBox
- 2.5px stroke weight
- Square caps
- Miter joins
- `currentColor` (never hardcoded)
- No rounded caps

This matches the chunky, hand-built feeling. Anything you draw to
this spec will slot in alongside the kit's existing visuals.

## Today, in your own pages

If you need icons before the sprite ships, either:

1. **Inline SVGs** you draw to the spec above, or
2. **A third-party set** as **a private project decision** — the kit
   itself won't pull anything in.

`preview/brand-icons.html` has hand-rolled examples in the right
visual language. Copy the patterns there.

## Unicode

Allowed for arrows (→ ← ↑ ↓), stars (★), bullets (•), checks (✓ ✕).
They render at the body font's stroke weight and look right.

## Emoji

**Never.** Emoji break the visual system — they're soft, colored,
gradiented, and round. The voice page lays out the same rule for
copy.
