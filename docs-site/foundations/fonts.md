# Fonts

The kit ships with three font families loaded from Google Fonts. They
are **all substitutes** — chosen because no licensed font files were
provided when the system was built.

| Role | Font in use | Source | Replace with? |
| --- | --- | --- | --- |
| Display | **Archivo Black** | Google Fonts | A true industrial grotesk would be louder (e.g. PP Neue Machina, Space Mono Bold, or a custom display) |
| Body / UI | **Space Grotesk** | Google Fonts | Could swap for a more idiosyncratic grotesk (e.g. PP Neue Montreal, Söhne) |
| Mono | **JetBrains Mono** | Google Fonts | Solid default — no urgent need to replace |

## Swapping the fonts

If you have webfont files (`.woff2` / `.ttf`) for any of these roles,
drop them into a `fonts/` directory in your project and override the
font tokens in your own stylesheet:

```css
/* your-theme.css — load AFTER brut.css */
@font-face {
  font-family: 'Your Display';
  src: url('/fonts/your-display.woff2') format('woff2');
  font-display: swap;
}

:root {
  --font-display: 'Your Display', sans-serif;
  --font-body:    'Your Body',    sans-serif;
  --font-mono:    'Your Mono',    monospace;
}
```

That's the entire integration. No rebuild, no source patch.

## Why three families?

The display / body contrast is the entire personality. Strip the
display face and the kit collapses into another grotesk-on-paper
template. Strip the body and headlines lose their punch.

If you only have budget for one webfont, keep **display**. The body
font can fall back to the system stack (`-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`)
without losing the kit's character.

## Loading from Google Fonts

The default `src/tokens/01-primitives.css` imports all three families
from the Google Fonts CDN. This violates the spirit of the
zero-dependency rule for offline / privacy-strict deployments — if
that matters to you, self-host the `.woff2` files and replace the
`@import` with `@font-face` rules pointing at your own assets.
