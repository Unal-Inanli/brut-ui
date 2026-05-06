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

  // examples.md iframes ./demos/*.html — those files live at the repo
  // root and are served as static assets by GitHub Pages. They don't
  // resolve to VitePress routes, so the link checker would fail the
  // build. Scope the bypass tightly to /demos/ paths only.
  ignoreDeadLinks: [/^\.\/demos\//],

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
      { text: 'Integrations', link: '/integrations/' },
      { text: 'Examples', link: '/examples' },
      {
        text: 'Foundations',
        items: [
          { text: 'Visual', link: '/foundations/visual' },
          { text: 'Voice', link: '/foundations/voice' },
          { text: 'Iconography', link: '/foundations/iconography' },
          { text: 'Fonts', link: '/foundations/fonts' },
        ],
      },
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
      '/integrations/': [
        {
          text: 'Integrations',
          items: [
            { text: 'Overview', link: '/integrations/' },
            { text: 'Vite', link: '/integrations/vite' },
            { text: 'Plain HTML', link: '/integrations/plain-html' },
            { text: 'Next.js', link: '/integrations/nextjs' },
            { text: 'Astro', link: '/integrations/astro' },
            { text: 'SvelteKit', link: '/integrations/sveltekit' },
            { text: 'Nuxt', link: '/integrations/nuxt' },
          ],
        },
      ],
      '/foundations/': [
        {
          text: 'Foundations',
          items: [
            { text: 'Visual', link: '/foundations/visual' },
            { text: 'Voice', link: '/foundations/voice' },
            { text: 'Iconography', link: '/foundations/iconography' },
            { text: 'Fonts', link: '/foundations/fonts' },
          ],
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
