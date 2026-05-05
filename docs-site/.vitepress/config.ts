import { defineConfig } from 'vitepress'
import { componentsSidebar } from './components-sidebar'

// VitePress config for the BRUT docs site.
// The site loads dist/brut.css the same way an external consumer would —
// see .vitepress/theme/index.ts for how it's imported.
export default defineConfig({
  title: 'BRUT',
  description: 'Neo-brutalist UI kit. Vanilla HTML + CSS + JS. Hard shadows, no fades.',
  lang: 'en-US',
  cleanUrls: true,
  lastUpdated: true,

  // Site is intended to be served at the repo's GitHub Pages path.
  // Override at build time with VITE_BASE if deploying to a custom domain.
  base: process.env.VITE_BASE ?? '/brut-ui/',

  head: [
    ['link', { rel: 'icon', href: '/favicon.svg' }],
    ['meta', { name: 'theme-color', content: '#0a0a0a' }],
  ],

  themeConfig: {
    siteTitle: 'BRUT',
    nav: [
      { text: 'Get started', link: '/get-started' },
      { text: 'Components', link: '/components/' },
      { text: 'Examples', link: '/examples' },
      { text: 'Changelog', link: '/changelog' },
      {
        text: 'Reference',
        items: [
          { text: 'Manifest schema', link: '/reference/manifest' },
        ],
      },
    ],

    sidebar: {
      '/components/': [
        {
          text: 'Components',
          items: componentsSidebar,
        },
      ],
      '/reference/': [
        {
          text: 'Reference',
          items: [
            { text: 'Manifest schema', link: '/reference/manifest' },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/Unal-Inanli/brut-ui' },
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2026 BRUT contributors',
    },

    search: {
      provider: 'local',
    },
  },

  // Don't crawl preview/ as content — it's iframed in.
  srcExclude: ['**/README.md', '**/AGENTS.md'],
})
