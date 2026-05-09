---
title: Nuxt
---

# Use BRUT with Nuxt

Add the stylesheet to Nuxt's `css` array. Register the JS runtime as
a client-only plugin. Done.

## TL;DR

```bash
npm install @sprtn/ui
```

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  css: ['@sprtn/ui/css'],
})
```

```ts
// plugins/brut.client.ts
import '@sprtn/ui'
```

The `.client.ts` suffix tells Nuxt to only run this plugin in the
browser — the BRUT runtime needs `document`, which doesn't exist
during SSR.

## Full walkthrough

### 1. Install

```bash
npm install @sprtn/ui
```

### 2. Register the CSS

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  css: [
    '@sprtn/ui/css',
    '~/assets/css/tokens.css',  // your overrides, AFTER brut.css
  ],
})
```

Nuxt loads these stylesheets in order on every page.

### 3. Register the JS runtime

Create `plugins/brut.client.ts`:

```ts
// plugins/brut.client.ts
import '@sprtn/ui'
```

Nuxt auto-registers any file in `plugins/`. The `.client.ts` suffix
restricts this one to the browser bundle.

### 4. Use components in pages

```vue
<!-- pages/index.vue -->
<template>
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
</template>
```

## Re-initialize after route changes

Nuxt's client-side router replaces the page contents without a full
reload. Existing initialized components stay wired; new ones need
`Brut.init()`:

```ts
// plugins/brut.client.ts
import '@sprtn/ui'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('page:finish', () => {
    ;(window as any).Brut?.init(document.body)
  })
})
```

`Brut.init` is idempotent — calling it on an already-initialized
element is a no-op.

## Listening to BRUT events in Vue

```vue
<template>
  <label class="brut-switch" data-brut="switch" @brut:change="onChange">
    <input type="checkbox" name="notify" hidden />
    <span class="brut-switch__knob" />
  </label>
</template>

<script setup>
function onChange(e) {
  console.log('switch is now', e.detail.value)
}
</script>
```

The hidden input also serializes with Nuxt's `useFetch` form bodies
— no manual wiring needed.

## Customizing tokens

```css
/* assets/css/tokens.css */
:root {
  --primary: #FF6B9D;
  --shadow-md: 6px 6px 0 0 #FF6B9D;
}
```

Make sure this file is listed **after** `@sprtn/ui/css` in
`nuxt.config.ts` so your overrides win.
