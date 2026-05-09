---
title: Responsive shapes
---

# Responsive shapes

The canonical glossary of how every BRUT component behaves across
viewport tiers. Each interactive component declares **exactly one**
shape in its `<name>.meta.js` sidecar; doctor refuses missing or
drifted declarations. Static components may declare `static` to make
the assertion explicit.

<!--@include: ../../docs/responsive-shapes.md{5,}-->

---

## Sources

- **Markdown reference:** [`docs/responsive-shapes.md`](https://github.com/Unal-Inanli/brut-ui/blob/main/docs/responsive-shapes.md) (the source of this page)
- **Validator:** [`src/config/vite-plugin.js`](https://github.com/Unal-Inanli/brut-ui/blob/main/src/config/vite-plugin.js) — enforces the shape vocabulary at build time
- **Doctor codes:** [`src/cli/commands/doctor.js`](https://github.com/Unal-Inanli/brut-ui/blob/main/src/cli/commands/doctor.js) — `RESPONSIVE_META_MISSING`, `RESPONSIVE_SHAPE_INVALID`, and friends
