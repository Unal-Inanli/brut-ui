import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import './brut-bridge.css'

// Load the kit's compiled CSS so live snippets in docs render with real
// brut styles. `dist/brut.css` is built by the root `pnpm build`.
import '../../../dist/brut.css'

export default {
  extends: DefaultTheme,
} satisfies Theme
