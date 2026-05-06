// Static component metadata registry.
// Provides descriptions, usage guidance, and examples for CSS-only components
// that lack individual .meta.js files. Consumed by the Vite plugin to enrich
// the manifest, which the MCP server exposes to AI agents.

const entries = [
  {
    name: 'body',
    description: 'Base body-text typography class that sets font-family, font-size (base scale), line-height, and a 70ch max-width for comfortable reading measure.',
    useCases: ['paragraph text', 'article body copy', 'card description text', 'form help text', 'content blocks'],
    htmlElements: ['p', 'div', 'article', 'span'],
    modifiers: [],
    notes: 'This is a TYPOGRAPHY class for inline/block text containers — NOT for the HTML <body> element. Apply it to <p>, <div>, or <article> elements that hold body copy. The <body> tag itself does not need any BRUT class.',
    examples: [
      {
        title: 'Paragraph text',
        html: '<p class="brut-body">Your paragraph content here. The 70ch max-width ensures comfortable reading measure without needing a wrapper.</p>',
      },
      {
        title: 'Card description',
        html: '<div class="brut-card">\n  <h3 class="brut-h3">Title</h3>\n  <p class="brut-body">Description text styled at base size with optimal line length.</p>\n</div>',
      },
    ],
  },
  {
    name: 'display',
    description: 'Hero/poster headline typography with fluid responsive sizing, uppercase transform, and tight line-height. Available ONLY as numbered variants — there is no base .brut-display class.',
    useCases: ['hero headline', 'landing page title', 'poster text', 'full-bleed section title', 'splash screen heading'],
    htmlElements: ['h1', 'h2', 'div', 'span'],
    modifiers: [
      { name: '--1', description: 'Largest scale — clamp(4xl, 11vw, 6xl), line-height 0.9' },
      { name: '--2', description: 'Medium scale — clamp(3xl, 8vw, 5xl), line-height 0.92' },
      { name: '--3', description: 'Smallest scale — clamp(sp-10, 6vw, 4xl), line-height 0.95' },
    ],
    notes: 'There is NO standalone .brut-display class. You MUST use a numbered variant: .brut-display-1, .brut-display-2, or .brut-display-3. Using .brut-display alone will have no effect.',
    examples: [
      {
        title: 'Hero headline (largest)',
        html: '<h1 class="brut-display-1">BUILD SOMETHING BRUTAL</h1>',
      },
      {
        title: 'Section title (medium)',
        html: '<h2 class="brut-display-2">OUR FEATURES</h2>',
      },
      {
        title: 'Subsection title (smallest)',
        html: '<h2 class="brut-display-3">GET STARTED</h2>',
      },
    ],
  },
  {
    name: 'container',
    description: 'Centered content wrapper with horizontal padding and a configurable max-width. Centers itself with auto margins.',
    useCases: ['page content wrapper', 'section inner wrapper', 'constrained layout area', 'responsive content column'],
    htmlElements: ['div', 'main', 'section'],
    modifiers: [
      { name: '--sm', description: 'Small max-width (--container-sm)' },
      { name: '--md', description: 'Medium max-width (--container-md)' },
      { name: '--lg', description: 'Large max-width (--container-w), the default' },
      { name: '--xl', description: 'Extra-large max-width (--container-xl)' },
      { name: '--full', description: 'No max-width constraint (full bleed)' },
    ],
    notes: 'The base .brut-container has a default max-width. Use modifiers to override. Nesting containers is valid for narrowing content within a wider section.',
    examples: [
      {
        title: 'Default page wrapper',
        html: '<main class="brut-container">\n  <h1 class="brut-h1">Page Title</h1>\n  <p class="brut-body">Content constrained to readable width.</p>\n</main>',
      },
      {
        title: 'Narrow content area',
        html: '<div class="brut-container--sm">\n  <p class="brut-body">Narrow column for focused reading.</p>\n</div>',
      },
    ],
  },
  {
    name: 'section',
    description: 'Full-width page section with vertical padding and a bottom border. Use modifiers for background color themes and spacing adjustments.',
    useCases: ['page section', 'landing page block', 'content band', 'colored background region', 'hero area wrapper'],
    htmlElements: ['section', 'div'],
    modifiers: [
      { name: '--tight', description: 'Reduced vertical padding (sp-8)' },
      { name: '--loose', description: 'Increased vertical padding (sp-20)' },
      { name: '--flush', description: 'No bottom border' },
      { name: '--paper', description: 'Paper background color' },
      { name: '--paper-2', description: 'Secondary paper background' },
      { name: '--bone', description: 'Bone/cream background' },
      { name: '--ink', description: 'Dark background with light text' },
      { name: '--primary', description: 'Primary accent background' },
      { name: '--lime', description: 'Pop-lime accent background' },
      { name: '--pink', description: 'Pop-pink accent background' },
    ],
    notes: 'Sections are full-width by default. Nest a .brut-container inside to constrain content width. Combine background modifiers with --tight or --loose for spacing control.',
    examples: [
      {
        title: 'Hero section with dark background',
        html: '<section class="brut-section brut-section--ink brut-section--loose">\n  <div class="brut-container">\n    <h1 class="brut-display-1">HERO TITLE</h1>\n  </div>\n</section>',
      },
      {
        title: 'Alternating content sections',
        html: '<section class="brut-section">\n  <div class="brut-container">Default section</div>\n</section>\n<section class="brut-section brut-section--bone">\n  <div class="brut-container">Alternate background</div>\n</section>',
      },
    ],
  },
  {
    name: 'stack',
    description: 'Vertical flex layout with configurable gap between children. The primary primitive for vertical spacing between elements.',
    useCases: ['vertical list of elements', 'form field groups', 'card content layout', 'sidebar content', 'stacked sections'],
    htmlElements: ['div', 'section', 'form', 'fieldset', 'article'],
    modifiers: [
      { name: '--xs', description: 'Extra-small gap (sp-1 / 4px)' },
      { name: '--sm', description: 'Small gap (sp-2 / 8px)' },
      { name: '--md', description: 'Medium gap (sp-4 / 16px)' },
      { name: '--lg', description: 'Large gap (sp-6 / 24px)' },
      { name: '--xl', description: 'Extra-large gap (sp-10 / 40px)' },
      { name: '--2xl', description: 'Double extra-large gap (sp-16 / 64px)' },
    ],
    notes: 'The base .brut-stack uses the default gap token (--sp-4). Children are laid out in a column with flex-direction: column. For horizontal layout, use .brut-cluster instead.',
    examples: [
      {
        title: 'Form fields',
        html: '<form class="brut-stack brut-stack--md">\n  <div class="brut-field">\n    <label class="brut-label">Name</label>\n    <input class="brut-input">\n  </div>\n  <div class="brut-field">\n    <label class="brut-label">Email</label>\n    <input class="brut-input" type="email">\n  </div>\n  <button class="brut-btn" type="submit">Submit</button>\n</form>',
      },
      {
        title: 'Page content sections',
        html: '<div class="brut-stack brut-stack--xl">\n  <section>First block</section>\n  <section>Second block</section>\n  <section>Third block</section>\n</div>',
      },
    ],
  },
  {
    name: 'cluster',
    description: 'Horizontal flex layout with wrapping and configurable gap. The primary primitive for inline/horizontal grouping of elements.',
    useCases: ['button groups', 'tag lists', 'navigation links', 'icon + text pairs', 'toolbar items', 'horizontally centered content'],
    htmlElements: ['div', 'nav', 'ul', 'footer'],
    modifiers: [
      { name: '--xs', description: 'Extra-small gap (sp-1)' },
      { name: '--sm', description: 'Small gap (sp-2)' },
      { name: '--md', description: 'Medium gap (sp-3)' },
      { name: '--lg', description: 'Large gap (sp-4)' },
      { name: '--xl', description: 'Extra-large gap (sp-6)' },
      { name: '--end', description: 'Align items to flex-end (right)' },
      { name: '--center', description: 'Center items horizontally (justify-content: center)' },
      { name: '--between', description: 'Space items evenly (justify-content: space-between)' },
    ],
    notes: 'Use .brut-cluster--center to horizontally center a group of items. For centering a single block of content on the page, prefer .brut-container (auto margins) or the utility classes .d-flex + .justify-content-center + .align-items-center.',
    examples: [
      {
        title: 'Button group',
        html: '<div class="brut-cluster brut-cluster--md">\n  <button class="brut-btn">Save</button>\n  <button class="brut-btn brut-btn--ink">Cancel</button>\n</div>',
      },
      {
        title: 'Centered content',
        html: '<div class="brut-cluster brut-cluster--center">\n  <button class="brut-btn brut-btn--primary">Get Started</button>\n</div>',
      },
      {
        title: 'Space-between layout',
        html: '<div class="brut-cluster brut-cluster--between">\n  <span>Left content</span>\n  <span>Right content</span>\n</div>',
      },
    ],
  },
  {
    name: 'grid',
    description: 'CSS Grid layout with equal-width columns. Requires a column-count modifier to define the grid structure.',
    useCases: ['card grid', 'feature columns', 'image gallery', 'dashboard panels', 'multi-column content'],
    htmlElements: ['div', 'section', 'ul'],
    modifiers: [
      { name: '--2', description: '2-column grid' },
      { name: '--3', description: '3-column grid' },
      { name: '--4', description: '4-column grid' },
      { name: '--6', description: '6-column grid' },
      { name: '--tight', description: 'Reduced gap (sp-2)' },
      { name: '--loose', description: 'Increased gap (sp-10)' },
    ],
    notes: 'The base .brut-grid sets display: grid with a default gap but NO column template. You MUST add a column modifier (--2, --3, --4, or --6) to define the layout. For a responsive 12-column system, use .brut-row with .brut-col-* children instead.',
    examples: [
      {
        title: '3-column card grid',
        html: '<div class="brut-grid brut-grid--3">\n  <div class="brut-card">Card 1</div>\n  <div class="brut-card">Card 2</div>\n  <div class="brut-card">Card 3</div>\n</div>',
      },
      {
        title: '2-column tight layout',
        html: '<div class="brut-grid brut-grid--2 brut-grid--tight">\n  <div>Left</div>\n  <div>Right</div>\n</div>',
      },
    ],
  },
  {
    name: 'btn',
    description: 'Brutalist button with thick border, shadow, and hover lift effect. Works on button, anchor, and input elements.',
    useCases: ['form submit', 'call to action', 'navigation link styled as button', 'dialog trigger', 'toolbar action'],
    htmlElements: ['button', 'a', 'input[type="button"]', 'input[type="submit"]'],
    modifiers: [
      { name: '--primary', description: 'Primary accent background color' },
      { name: '--ink', description: 'Dark background with light text' },
      { name: '--pink', description: 'Pop-pink accent background' },
      { name: '--lime', description: 'Pop-lime accent background' },
      { name: '--sm', description: 'Small size — reduced padding and font size' },
      { name: '--lg', description: 'Large size — increased padding and font size' },
    ],
    notes: 'The base .brut-btn uses bone background with ink text. Color modifiers override only the background. Size modifiers override padding, font-size, and border-width. Combine freely: .brut-btn .brut-btn--primary .brut-btn--lg.',
    examples: [
      {
        title: 'Primary action button',
        html: '<button class="brut-btn brut-btn--primary">Get Started</button>',
      },
      {
        title: 'Button group with variants',
        html: '<div class="brut-cluster brut-cluster--md">\n  <button class="brut-btn brut-btn--primary brut-btn--lg">Submit</button>\n  <button class="brut-btn brut-btn--sm">Cancel</button>\n</div>',
      },
      {
        title: 'Link styled as button',
        html: '<a href="/docs" class="brut-btn brut-btn--ink">Read Docs</a>',
      },
    ],
  },
  {
    name: 'card',
    description: 'Bordered content container with background, shadow, and padding. A general-purpose surface for grouping related content.',
    useCases: ['content card', 'product tile', 'feature highlight', 'settings panel', 'info block'],
    htmlElements: ['div', 'article', 'aside', 'li'],
    modifiers: [],
    notes: 'Cards have no header/body/footer sub-elements built in. Compose with .brut-stack for vertical spacing inside, or nest headings and body text directly. Cards are block-level by default.',
    examples: [
      {
        title: 'Basic content card',
        html: '<div class="brut-card">\n  <h3 class="brut-h3">Feature Title</h3>\n  <p class="brut-body">Feature description text goes here.</p>\n  <button class="brut-btn brut-btn--sm">Learn More</button>\n</div>',
      },
      {
        title: 'Card in a grid',
        html: '<div class="brut-grid brut-grid--3">\n  <article class="brut-card">\n    <h3 class="brut-h3">One</h3>\n    <p class="brut-body">Description.</p>\n  </article>\n  <article class="brut-card">\n    <h3 class="brut-h3">Two</h3>\n    <p class="brut-body">Description.</p>\n  </article>\n</div>',
      },
    ],
  },
  {
    name: 'alert',
    description: 'Notification banner with icon slot and semantic color variants for success, warning, error, and info states.',
    useCases: ['form validation message', 'system notification', 'success confirmation', 'error message', 'info callout'],
    htmlElements: ['div', 'aside'],
    modifiers: [
      { name: '--ok', description: 'Success state — green background' },
      { name: '--warn', description: 'Warning state — amber background' },
      { name: '--err', description: 'Error state — red background' },
      { name: '--info', description: 'Informational state — blue background' },
    ],
    notes: 'Use the .brut-alert__icon child element for the icon slot. Without a status modifier, the alert uses the default bone background. Always include a modifier to convey meaning.',
    examples: [
      {
        title: 'Success alert',
        html: '<div class="brut-alert brut-alert--ok">\n  <div class="brut-alert__icon">✓</div>\n  <div>Operation completed successfully.</div>\n</div>',
      },
      {
        title: 'Error alert',
        html: '<div class="brut-alert brut-alert--err">\n  <div class="brut-alert__icon">!</div>\n  <div>Something went wrong. Please try again.</div>\n</div>',
      },
    ],
  },
];

export const STATIC_META = new Map(entries.map(e => [e.name, e]));
