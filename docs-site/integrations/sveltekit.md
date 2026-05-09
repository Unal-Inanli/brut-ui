---
title: SvelteKit
---

# Use BRUT with SvelteKit

Import the CSS once in `+layout.svelte`. Use `.brut-*` classes in any
component. SvelteKit handles the rest.

## TL;DR

```bash
npm install @sprtn/ui
```

```svelte
<!-- src/routes/+layout.svelte -->
<script>
  import '@sprtn/ui/css'
  import { onMount } from 'svelte'
  onMount(() => import('@sprtn/ui'))
</script>

<slot />
```

The dynamic `import('@sprtn/ui')` inside `onMount` ensures the
runtime only loads on the client.

## Full walkthrough

### 1. Install

```bash
npm install @sprtn/ui
```

### 2. Import in the root layout

```svelte
<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import '@sprtn/ui/css'
  import { onMount } from 'svelte'

  onMount(() => {
    import('@sprtn/ui')
  })
</script>

<slot />
```

The CSS import is universal (server + client). The JS import is
client-only because the runtime touches `document` and
`addEventListener('DOMContentLoaded', …)`.

### 3. Use components

```svelte
<!-- src/routes/+page.svelte -->
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
```

## Page transitions

When SvelteKit swaps routes, existing `data-brut` elements stay
initialized — but new ones in the incoming page need to be wired up.
Add an `afterNavigate` hook:

```svelte
<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import '@sprtn/ui/css'
  import { afterNavigate } from '$app/navigation'
  import { onMount } from 'svelte'

  onMount(() => {
    import('@sprtn/ui').then(() => {
      afterNavigate(() => {
        ;(window as any).Brut?.init(document.body)
      })
    })
  })
</script>
```

`Brut.init` is idempotent — calling it on already-initialized elements
is a no-op.

## Component-level state and BRUT

BRUT's interactive components mirror state to a hidden `<input>` and
dispatch a `brut:change` custom event. Listen for the event in
Svelte:

```svelte
<label class="brut-switch" data-brut="switch" on:brut:change={handleChange}>
  <input type="checkbox" name="notify" hidden />
  <span class="brut-switch__knob" />
</label>

<script>
  function handleChange(e) {
    console.log('switch is now', e.detail.value)
  }
</script>
```

The hidden input also serializes correctly with SvelteKit form
actions — no extra wiring needed.

## Customizing tokens

Add a global stylesheet to `src/app.css` and import it after BRUT:

```svelte
<!-- src/routes/+layout.svelte -->
<script>
  import '@sprtn/ui/css'
  import '../app.css'   // load AFTER brut.css
</script>
```

```css
/* src/app.css */
:root {
  --primary: #FF6B9D;
}
```
