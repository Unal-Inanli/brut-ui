# Use BRUT with Astro

Astro is a near-perfect fit for BRUT — both ship as much static HTML
as possible. Import the CSS once in a layout, drop the JS runtime in
the same layout, and write `.brut-*` markup in any `.astro`,
`.mdx`, or framework component.

## TL;DR

```bash
npm install @sprtn/ui
```

```astro
---
// src/layouts/BaseLayout.astro
import '@sprtn/ui/css'
---
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>{Astro.props.title}</title>
  </head>
  <body>
    <slot />
    <script>
      import '@sprtn/ui'
    </script>
  </body>
</html>
```

Use `<BaseLayout>` to wrap any page. The kit's CSS and JS load once
per navigation.

## Full walkthrough

### 1. Install

```bash
npm install @sprtn/ui
```

### 2. Make a base layout

```astro
---
// src/layouts/BaseLayout.astro
import '@sprtn/ui/css'

interface Props { title?: string }
const { title = 'My BRUT site' } = Astro.props
---
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
  </head>
  <body>
    <slot />
    <script>
      import '@sprtn/ui'
    </script>
  </body>
</html>
```

The bare `<script>` tag without `is:inline` tells Astro to bundle the
`import '@sprtn/ui'` line. Astro hoists the script to the document
level, so the runtime initializes once per page navigation.

### 3. Write a page

```astro
---
// src/pages/index.astro
import BaseLayout from '../layouts/BaseLayout.astro'
---
<BaseLayout title="Home">
  <main class="brut-container brut-section">
    <h1 class="brut-display-1">SHIP IT.</h1>

    <button type="button" class="brut-btn brut-btn--primary">
      Get loud
    </button>

    <label class="brut-switch" data-brut="switch">
      <input type="checkbox" hidden />
      <span class="brut-switch__knob" />
    </label>
  </main>
</BaseLayout>
```

That's the entire integration.

## Inside framework components (React, Vue, Svelte islands)

Use `client:load` (or `client:idle` / `client:visible`) for any
component that needs the BRUT JS runtime to wire up its
`data-brut` elements.

```astro
---
import MyReactForm from '../components/MyReactForm.tsx'
---
<MyReactForm client:load />
```

The runtime initializes at the document level, so the markup inside
the island gets picked up automatically once the island hydrates.

## View transitions

If you use Astro's view transitions, the runtime needs to re-init
after each navigation. Add this to your base layout:

```astro
<script>
  document.addEventListener('astro:page-load', () => {
    (window as any).Brut?.init(document.body)
  })
</script>
```

## Customizing tokens

Use a global stylesheet imported after `@sprtn/ui/css`:

```astro
---
// src/layouts/BaseLayout.astro
import '@sprtn/ui/css'
import '../styles/tokens.css'   // load AFTER brut.css
---
```

```css
/* src/styles/tokens.css */
:root {
  --primary: #FF6B9D;
}
```
