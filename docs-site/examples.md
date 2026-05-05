# Examples

Full-page templates and demo compositions, all built with BRUT.
Each demo is a single HTML file — no framework, no build step. View source
to copy markup into your own project.

## Landing page

A marketing landing page with hero, feature grid, install strip, marquee,
and CTA. Uses `.brut-display-2`, `.brut-card`, `.brut-btn`, layout
primitives, and a sprinkle of bespoke marquee CSS.

<iframe
  class="brut-preview-frame"
  src="./demos/landing.html"
  loading="lazy"
  style="height: 720px;"
  title="Landing demo"
></iframe>

[Open in new tab →](./demos/landing.html) ·
[View source on GitHub](https://github.com/Unal-Inanli/brut-ui/blob/main/demos/landing.html)

## Login form

A focused single-purpose form. Demonstrates field composition,
validation hints, the password component, and a divider primitive
between social login and email login.

<iframe
  class="brut-preview-frame"
  src="./demos/login.html"
  loading="lazy"
  style="height: 720px;"
  title="Login demo"
></iframe>

[Open in new tab →](./demos/login.html) ·
[View source on GitHub](https://github.com/Unal-Inanli/brut-ui/blob/main/demos/login.html)

## Dashboard

An admin dashboard layout with sidebar, topnav, stat tiles, table
toolbar, and a paginated data table. Pulls together most of the layout
and table primitives in a single composition.

<iframe
  class="brut-preview-frame"
  src="./demos/dashboard.html"
  loading="lazy"
  style="height: 720px;"
  title="Dashboard demo"
></iframe>

[Open in new tab →](./demos/dashboard.html) ·
[View source on GitHub](https://github.com/Unal-Inanli/brut-ui/blob/main/demos/dashboard.html)

---

## Build your own

Every component on the [components](/components/) pages is a copy-pasteable
fixture. Compose them inside any layout primitive
([stack](/components/layout), [cluster](/components/layout),
[grid](/components/grid), [bar](/components/layout)) and you'll get the
hard-edged composition that BRUT is named for.

The `dist/components.json` manifest lists every component's modifiers
and copy-pasteable example markup, so AI agents and codegen tools can
scaffold pages without crawling source.
