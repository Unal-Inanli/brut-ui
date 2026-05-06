# Use BRUT with Next.js

Works with both the App Router (`app/`) and Pages Router (`pages/`).
The visual CSS imports anywhere; the interactive JS runtime needs to
run on the client because it auto-inits on `DOMContentLoaded`.

## TL;DR — App Router

```bash
npm install @sprtn/ui
```

```tsx
// app/layout.tsx
import '@sprtn/ui/css'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <script src="https://cdn.jsdelivr.net/npm/@sprtn/ui@1/dist/brut.js" defer />
      </body>
    </html>
  )
}
```

You can also import the JS runtime from a client component (see below).

## TL;DR — Pages Router

```js
// pages/_app.js
import '@sprtn/ui/css'
import '@sprtn/ui'

export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />
}
```

The JS import only runs on the client because Next.js evaluates
`_app.js` in both environments but the BRUT runtime no-ops on the
server (no `document`).

---

## App Router — full walkthrough

### 1. Install

```bash
npm install @sprtn/ui
```

### 2. Import the global CSS

Global stylesheets in App Router can only be imported from
`app/layout.tsx` (or any other file in `app/` that's imported by the
root layout).

```tsx
// app/layout.tsx
import '@sprtn/ui/css'
import './globals.css'   // your own styles, AFTER brut.css

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
```

### 3. Wire up the interactive JS

Two choices:

**Option A — script tag in the root layout (simplest):**

```tsx
<body>
  {children}
  <script
    src="https://cdn.jsdelivr.net/npm/@sprtn/ui@1/dist/brut.js"
    defer
  />
</body>
```

**Option B — client component (if you bundle everything yourself):**

```tsx
// app/components/BrutRuntime.tsx
'use client'
import '@sprtn/ui'
export default function BrutRuntime() { return null }
```

```tsx
// app/layout.tsx
import BrutRuntime from './components/BrutRuntime'
// …
<body>
  {children}
  <BrutRuntime />
</body>
```

The `'use client'` directive matters — `data-brut` auto-init queries
the DOM, which only exists on the client.

### 4. Use a component

```tsx
// app/page.tsx
export default function Page() {
  return (
    <main className="brut-section">
      <button type="button" className="brut-btn brut-btn--primary">
        SHIP IT.
      </button>

      <label className="brut-switch" data-brut="switch">
        <input type="checkbox" hidden />
        <span className="brut-switch__knob" />
      </label>
    </main>
  )
}
```

Note: `class` becomes `className` in JSX, but the `data-brut`
attribute stays as-is.

## Server components and BRUT

Static visuals (button, card, badge, alert, layout primitives) work in
server components — they're just HTML classes. Interactive components
(`data-brut="…"`) render fine on the server but only become
interactive once the client runtime loads.

## Dynamically inserted content

If you mount markup after the initial render (e.g., a modal that
loads on demand), call `Brut.init(rootElement)` to wire up any new
`data-brut` elements.

```tsx
'use client'
import { useEffect, useRef } from 'react'

export default function Modal({ open }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (open && ref.current) (window as any).Brut?.init(ref.current)
  }, [open])
  return <div ref={ref}>{/* … */}</div>
}
```

## Hydration

BRUT's runtime mutates the DOM (adds attributes, focuses inputs,
mirrors state to hidden inputs). React doesn't know about these
mutations, so they happen *after* hydration completes. You shouldn't
see hydration mismatch warnings — but if you do, suppress them with
`suppressHydrationWarning` on the `<html>` element.
