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
      { name: '--danger', description: 'Destructive action — danger background, paper text; hover inverts to light tint' },
      { name: '--outline', description: 'Ghost / outline — transparent fill with ink border; hover inverts to ink on paper' },
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
    name: 'badge',
    description: 'Compact inline label with semantic color variants for status, count, or category indicators.',
    useCases: ['status indicator', 'count or numeric tag', 'category label', 'inline tag', 'metadata pill'],
    htmlElements: ['span', 'small', 'div'],
    modifiers: [
      { name: '--ok', description: 'Success state — green background' },
      { name: '--warn', description: 'Warning state — amber background' },
      { name: '--err', description: 'Error state — red background' },
      { name: '--info', description: 'Informational state — blue background' },
    ],
    notes: 'Inline by default. Use semantic modifiers for status badges; default badge uses bone background for neutral counts or categories. Pair with text content or numbers — keep content short.',
    examples: [
      {
        title: 'Status badge inline with text',
        html: '<p>Build status: <span class="brut-badge brut-badge--ok">PASSING</span></p>',
      },
      {
        title: 'Notification count badge',
        html: '<button class="brut-btn">Inbox <span class="brut-badge brut-badge--err">3</span></button>',
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
  {
    name: 'textarea',
    description: 'Multi-line text input with the same brutalist border, focus ring, and validation states as brut-input.',
    useCases: ['comment field', 'message body', 'description input', 'multi-line free-text', 'code paste area'],
    htmlElements: ['textarea'],
    modifiers: [
      { name: '--sm', description: 'Small size — reduced padding and font size' },
      { name: '--lg', description: 'Large size — increased padding and font size' },
      { name: '--err', description: 'Error state — red border accent' },
      { name: '--ok', description: 'Success state — green border accent' },
    ],
    notes: 'Always set a rows attribute or a height for predictable sizing. Validation state modifiers are also driven natively via :user-invalid / :user-valid.',
    examples: [
      {
        title: 'Default textarea',
        html: '<textarea class="brut-textarea" rows="4" placeholder="Type a message..."></textarea>',
      },
      {
        title: 'Error state',
        html: '<textarea class="brut-textarea brut-textarea--err" rows="4">Required.</textarea>',
      },
    ],
  },
  {
    name: 'toast',
    description: 'Transient banner notification with icon slot, semantic color variants, and dismiss affordance — auto-removed by the toast host.',
    useCases: ['transient success message', 'undo prompt', 'background-task completion', 'soft error', 'system info'],
    htmlElements: ['div'],
    modifiers: [
      { name: '--ok', description: 'Success state — green background' },
      { name: '--warn', description: 'Warning state — amber background' },
      { name: '--err', description: 'Error state — red background' },
      { name: '--info', description: 'Informational state — blue background' },
      { name: '--leaving', description: 'Exit state — fades to opacity 0; used by the toast host during teardown' },
    ],
    notes: 'Toasts mount inside a brut-toast-host container that handles stacking and auto-dismiss timers. The --leaving modifier is applied programmatically and should not appear in static markup.',
    examples: [
      {
        title: 'Success toast',
        html: '<div class="brut-toast brut-toast--ok">\n  <div class="brut-toast__icon">✓</div>\n  <div class="brut-toast__msg"><strong>Saved.</strong> Your changes are live.</div>\n</div>',
      },
    ],
  },
  {
    name: 'tag',
    description: 'Removable inline pill for filters, selections, or category labels — with semantic and accent color variants.',
    useCases: ['active filter chip', 'selected category', 'inline metadata', 'taxonomy label', 'token in a filter bar'],
    htmlElements: ['span', 'button', 'a'],
    modifiers: [
      { name: '--ink', description: 'Dark background with light text' },
      { name: '--lime', description: 'Pop-lime accent background' },
      { name: '--pink', description: 'Pop-pink accent background' },
      { name: '--blue', description: 'Pop-blue accent background — light text' },
      { name: '--ok', description: 'Success state — green background' },
      { name: '--warn', description: 'Warning state — amber background' },
      { name: '--err', description: 'Error state — red background — light text' },
      { name: '--info', description: 'Informational state — blue background — light text' },
    ],
    notes: 'Tags are inline and content-sized. Use semantic modifiers for status pills; accent modifiers (ink/lime/pink/blue) for category or filter chips. Combine with brut-tag-input for chip-entry fields.',
    examples: [
      {
        title: 'Filter chip',
        html: '<span class="brut-tag brut-tag--lime">draft</span>',
      },
      {
        title: 'Status pill',
        html: '<span class="brut-tag brut-tag--ok">verified</span>',
      },
    ],
  },
  {
    name: 'avatar-group',
    description: 'Overlapping stack of brut-avatar elements for compact roster display, with an optional trailing overflow count.',
    useCases: ['team roster', 'shared-with list', 'attendee preview', 'collaborator stack'],
    htmlElements: ['span', 'div'],
    modifiers: [],
    notes: 'Wrap a row of brut-avatar children. Append a brut-avatar with brut-avatar-group__more to show the overflow count (+N).',
    examples: [
      {
        title: 'Roster with overflow count',
        html: '<span class="brut-avatar-group">\n  <span class="brut-avatar" style="background: var(--pop-pink);">JM</span>\n  <span class="brut-avatar" style="background: var(--pop-lime);">AD</span>\n  <span class="brut-avatar brut-avatar-group__more">+8</span>\n</span>',
      },
    ],
  },
  {
    name: 'crumbs',
    description: 'Hard-edged breadcrumb path navigation — ordered list with link, separator, and current-item slots.',
    useCases: ['page path', 'navigation hierarchy', 'site location indicator', 'wizard step trail'],
    htmlElements: ['ol', 'nav'],
    modifiers: [
      { name: '--sm', description: 'Small size — reduced padding and font size' },
    ],
    notes: 'Use ol > li.brut-crumbs__item with brut-crumbs__link, brut-crumbs__sep, and brut-crumbs__current sub-elements. Mark the current page with aria-current="page" on the last item.',
    examples: [
      {
        title: 'Three-level breadcrumb',
        html: '<ol class="brut-crumbs">\n  <li class="brut-crumbs__item"><a class="brut-crumbs__link" href="/">Home</a></li>\n  <li class="brut-crumbs__sep">/</li>\n  <li class="brut-crumbs__item"><a class="brut-crumbs__link" href="/settings">Settings</a></li>\n  <li class="brut-crumbs__sep">/</li>\n  <li class="brut-crumbs__item brut-crumbs__current" aria-current="page">Profile</li>\n</ol>',
      },
    ],
  },
  {
    name: 'empty',
    description: 'Empty-state placeholder with icon slot, title, body, and optional action button — for zero-data screens.',
    useCases: ['no search results', 'empty inbox', 'unconfigured feature', 'first-time-user state'],
    htmlElements: ['div', 'section'],
    modifiers: [],
    notes: 'Compose with brut-empty__icon, brut-empty__title, brut-empty__body, and an optional .brut-btn for the primary action.',
    examples: [
      {
        title: 'No-results empty state',
        html: '<div class="brut-empty">\n  <div class="brut-empty__icon">∅</div>\n  <h3 class="brut-empty__title">Nothing here yet</h3>\n  <p class="brut-empty__body">Try a different filter or add your first item.</p>\n  <button class="brut-btn brut-btn--primary">Add item</button>\n</div>',
      },
    ],
  },
  {
    name: 'rows',
    description: 'Settings-style list with leading slot, title and subtitle main, and trailing slot — for users, options, or configurable items.',
    useCases: ['settings list', 'user/team list', 'notification preferences', 'feature toggles list'],
    htmlElements: ['ul', 'ol'],
    modifiers: [
      { name: '--bordered', description: 'Outer ink frame with row dividers' },
      { name: '--clickable', description: 'Highlights rows on hover for actionable lists' },
    ],
    notes: 'Each li.brut-rows__item contains a brut-rows__lead, brut-rows__main (with __title and __sub), and brut-rows__trail. Use --bordered + --clickable together for tappable settings rows.',
    examples: [
      {
        title: 'Bordered settings row',
        html: '<ul class="brut-rows brut-rows--bordered">\n  <li class="brut-rows__item">\n    <span class="brut-rows__lead"><span class="brut-avatar">JD</span></span>\n    <div class="brut-rows__main">\n      <span class="brut-rows__title">Jane Doe</span>\n      <span class="brut-rows__sub">jane@example.com</span>\n    </div>\n    <span class="brut-rows__trail"><span class="brut-badge brut-badge--ok">OK</span></span>\n  </li>\n</ul>',
      },
    ],
  },
  {
    name: 'row',
    description: 'Bootstrap-parity 12-column grid row container — flex parent that holds .brut-col children with gap and gutter modifiers.',
    useCases: ['12-column form layout', 'product grid row', 'dashboard widget row', 'nav segment row'],
    htmlElements: ['div'],
    modifiers: [
      { name: '--tight', description: 'Tight gap (--sp-2) between columns' },
      { name: '--loose', description: 'Loose gap (--sp-10) between columns' },
      { name: '--no-gutter', description: 'Zero gap — flush columns' },
    ],
    notes: 'Pair with .brut-col / .brut-col--N child columns. Use brut-grid for non-12-column layouts.',
    examples: [
      {
        title: 'Two-column row',
        html: '<div class="brut-row">\n  <div class="brut-col brut-col--6">Left</div>\n  <div class="brut-col brut-col--6">Right</div>\n</div>',
      },
    ],
  },
  {
    name: 'aspect',
    description: 'Fixed aspect-ratio media frame with ink border that crops img, video, or iframe children to cover the box.',
    useCases: ['image thumbnail', 'video embed wrapper', 'media tile', 'gallery cell', 'oEmbed container'],
    examples: [
      {
        title: 'Square image tile',
        html: '<div class="brut-aspect brut-aspect--square">\n  <img src="/cover.jpg" alt="Cover">\n</div>',
      },
      {
        title: '16:9 video embed',
        html: '<div class="brut-aspect brut-aspect--video">\n  <iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ" allowfullscreen></iframe>\n</div>',
      },
    ],
  },
  {
    name: 'avatar',
    description: 'Square ink-bordered identity tile sized for a single user, displaying initials, a portrait, or an icon.',
    useCases: ['user profile mark', 'comment author', 'roster cell', 'team member tile', 'mention chip'],
    examples: [
      {
        title: 'Initials avatar',
        html: '<span class="brut-avatar">JD</span>',
      },
      {
        title: 'Image avatar',
        html: '<span class="brut-avatar"><img src="/users/jane.jpg" alt="Jane"></span>',
      },
    ],
  },
  {
    name: 'bar',
    description: 'Wrapping flex strip that pushes children to opposite ends with space-between for header, toolbar, or footer rows.',
    useCases: ['page header strip', 'CTA banner row', 'toolbar with leading title and trailing actions', 'card footer row'],
    examples: [
      {
        title: 'Header bar with title and action',
        html: '<div class="brut-bar">\n  <h2 class="brut-h2">Dashboard</h2>\n  <button class="brut-btn brut-btn--primary">New</button>\n</div>',
      },
    ],
  },
  {
    name: 'caption',
    description: 'Extra-small muted text in concrete-400 for image captions, table footnotes, or inline metadata.',
    useCases: ['image caption', 'table footnote', 'form helper text', 'metadata line', 'timestamp label'],
    examples: [
      {
        title: 'Figure caption',
        html: '<figure>\n  <img src="/cover.jpg" alt="Cover">\n  <figcaption class="brut-caption">Photo by R. Kray, 2026</figcaption>\n</figure>',
      },
    ],
  },
  {
    name: 'code',
    description: 'Inline monospace span with paper-2 background and thin ink border for short code fragments inside running text.',
    useCases: ['inline code reference', 'API name in prose', 'shortcut key spelled out', 'CLI flag in docs'],
    examples: [
      {
        title: 'Inline code in body copy',
        html: '<p class="brut-body">Run <code class="brut-code">npm install</code> before building.</p>',
      },
    ],
  },
  {
    name: 'col',
    description: 'Single-column child for the 12-column .brut-row grid; -N variants span N of 12 with sm/md/lg overrides.',
    useCases: ['12-column form field', 'half-width card', 'sidebar plus main split', 'responsive grid cell'],
    htmlElements: ['div'],
    modifiers: [
      { name: '-1 through -12', description: 'Span N of 12 columns at all viewports' },
      { name: '-sm-N', description: 'Span N columns at ≥640px' },
      { name: '-md-N', description: 'Span N columns at ≥768px' },
      { name: '-lg-N', description: 'Span N columns at ≥1024px' },
      { name: '-offset-N', description: 'Start at column N+1 (offset by N)' },
    ],
    notes: 'Below 640px, columns inside a .brut-row collapse to full-width unless the parent has .brut-row--no-stack. Use .brut-col-sm-N / .brut-col-md-N / .brut-col-lg-N for tier-aware widths.',
    examples: [
      {
        title: 'Three equal columns',
        html: '<div class="brut-row">\n  <div class="brut-col-4">A</div>\n  <div class="brut-col-4">B</div>\n  <div class="brut-col-4">C</div>\n</div>',
      },
      {
        title: 'Responsive sidebar + main',
        html: '<div class="brut-row">\n  <aside class="brut-col-12 brut-col-md-3">Sidebar</aside>\n  <main class="brut-col-12 brut-col-md-9">Main</main>\n</div>',
      },
    ],
  },
  {
    name: 'footer',
    description: 'Inverted ink-on-paper page footer slab with brand mark, link list, and legal text laid out on a wrapping inner row.',
    useCases: ['site footer', 'legal and copyright strip', 'global navigation footer', 'app shell bottom slab'],
    htmlElements: ['footer'],
    modifiers: [],
    notes: 'Compose with .brut-footer__inner for the centered max-width wrapper; .brut-footer__brand for the lockup; .brut-footer__links + .brut-footer__link for nav; .brut-footer__legal for copyright text.',
    examples: [
      {
        title: 'Site footer with brand, links, legal',
        html: '<footer class="brut-footer">\n  <div class="brut-footer__inner">\n    <a class="brut-footer__brand" href="/"><span>BRUT UI</span></a>\n    <nav class="brut-footer__links">\n      <a class="brut-footer__link" href="/docs">Docs</a>\n      <a class="brut-footer__link" href="/github">GitHub</a>\n    </nav>\n    <span class="brut-footer__legal">&copy; 2026 MIT</span>\n  </div>\n</footer>',
      },
    ],
  },
  {
    name: 'h1',
    description: 'Largest in-flow heading — display font, 3xl size, uppercase, tight tracking, zero margin.',
    useCases: ['page title', 'article headline', 'top-of-section heading', 'card title for hero card'],
    htmlElements: ['h1', 'div'],
    examples: [
      {
        title: 'Page heading',
        html: '<h1 class="brut-h1">Dashboard</h1>',
      },
    ],
  },
  {
    name: 'h2',
    description: 'Second-level heading — display font, 2xl size, uppercase, tight tracking, zero margin.',
    useCases: ['section heading', 'card title', 'modal title', 'group label above a stack'],
    htmlElements: ['h2', 'div'],
    examples: [
      {
        title: 'Section heading',
        html: '<h2 class="brut-h2">Recent Activity</h2>',
      },
    ],
  },
  {
    name: 'h3',
    description: 'Third-level heading — sans font, xl size, bold weight, snug line-height, zero margin.',
    useCases: ['sub-section heading', 'card subhead', 'list group label', 'feature block title'],
    htmlElements: ['h3', 'div'],
    examples: [
      {
        title: 'Card subhead',
        html: '<h3 class="brut-h3">Open Pull Requests</h3>',
      },
    ],
  },
  {
    name: 'h4',
    description: 'Fourth-level heading — sans font, lg size, bold weight, snug line-height, zero margin.',
    useCases: ['nested subsection title', 'sidebar group heading', 'minor card heading'],
    htmlElements: ['h4', 'div'],
    examples: [
      {
        title: 'Nested heading',
        html: '<h4 class="brut-h4">Filter options</h4>',
      },
    ],
  },
  {
    name: 'h5',
    description: 'Fifth-level heading — sans font, md size, bold weight, snug line-height, zero margin.',
    useCases: ['compact subhead', 'sidebar item heading', 'list section divider', 'menu group label'],
    htmlElements: ['h5', 'div'],
    examples: [
      {
        title: 'Sidebar group heading',
        html: '<h5 class="brut-h5">Team</h5>',
      },
    ],
  },
  {
    name: 'h6',
    description: 'Smallest heading — sans font, sm size, bold, uppercase, wide tracking — used as a chunky eyebrow label.',
    useCases: ['eyebrow heading', 'micro section label', 'meta heading', 'form fieldset legend'],
    htmlElements: ['h6', 'legend', 'div'],
    examples: [
      {
        title: 'Eyebrow label',
        html: '<h6 class="brut-h6">Account settings</h6>',
      },
    ],
  },
  {
    name: 'input',
    description: 'Brutalist single-line text input with bone fill, thick ink border, focus ring that flips background to primary-soft.',
    useCases: ['form text field', 'email input', 'search box', 'login field', 'inline editor'],
    htmlElements: ['input'],
    modifiers: [
      { name: '--sm', description: 'Small size — reduced padding and font size' },
      { name: '--lg', description: 'Large size — increased padding and font size' },
      { name: '--err', description: 'Error state — danger border and background' },
      { name: '--ok', description: 'Success state — green border accent' },
    ],
    notes: 'Width is 100% by default — wrap inside a sized parent or grid cell to constrain. Validation modifiers also resolve via :user-invalid / :user-valid for native form validation.',
    examples: [
      {
        title: 'Default input with label',
        html: '<label class="brut-label" for="email">Email</label>\n<input id="email" class="brut-input" type="email" placeholder="you@example.com">',
      },
      {
        title: 'Error state',
        html: '<input class="brut-input brut-input--err" value="not-an-email">',
      },
    ],
  },
  {
    name: 'kbd',
    description: 'Inline keycap glyph — bone fill, thin ink border, subtle drop shadow — for keyboard shortcuts in body or docs.',
    useCases: ['keyboard shortcut hint', 'help text key reference', 'documentation hotkey', 'cheatsheet key'],
    htmlElements: ['kbd', 'span'],
    examples: [
      {
        title: 'Shortcut in prose',
        html: '<p class="brut-body">Press <kbd class="brut-kbd">Ctrl</kbd> + <kbd class="brut-kbd">K</kbd> to open the command palette.</p>',
      },
    ],
  },
  {
    name: 'label',
    description: 'Display-font field label — extra-small, uppercase, wide tracking — paired above an input or select.',
    useCases: ['form field label', 'fieldset caption', 'switch / checkbox label', 'small column header'],
    htmlElements: ['label', 'span'],
    examples: [
      {
        title: 'Label above input',
        html: '<label class="brut-label" for="name">Full name</label>\n<input id="name" class="brut-input">',
      },
    ],
  },
  {
    name: 'lead',
    description: 'Lead paragraph — sans at lg size with normal line-height and a 60ch measure — for the intro under a headline.',
    useCases: ['article opening paragraph', 'hero subhead', 'landing page intro', 'feature description blurb'],
    htmlElements: ['p', 'div'],
    examples: [
      {
        title: 'Article intro',
        html: '<h1 class="brut-h1">Manifesto</h1>\n<p class="brut-lead">A concrete kit for builders who like edges to be edges and corners to be square.</p>',
      },
    ],
  },
  {
    name: 'link',
    description: 'Inline ink anchor with thick underline that fills with primary on hover and inverts to deep primary on active.',
    useCases: ['inline body link', 'docs cross-reference', 'footnote anchor', 'breadcrumb tail link'],
    htmlElements: ['a'],
    examples: [
      {
        title: 'Inline link',
        html: '<p class="brut-body">Read the <a class="brut-link" href="/docs">documentation</a> for details.</p>',
      },
    ],
  },
  {
    name: 'list',
    description: 'Sans-serif list with square bullets and indented padding; .brut-list--ord switches to decimal numbering.',
    useCases: ['feature bullet list', 'checklist items', 'numbered steps', 'sidebar nav list'],
    htmlElements: ['ul', 'ol'],
    modifiers: [
      { name: '--ord', description: 'Decimal numbering instead of square bullets — pair with <ol>' },
    ],
    examples: [
      {
        title: 'Bulleted list',
        html: '<ul class="brut-list">\n  <li>First item</li>\n  <li>Second item</li>\n  <li>Third item</li>\n</ul>',
      },
      {
        title: 'Ordered list',
        html: '<ol class="brut-list brut-list--ord">\n  <li>Install the package</li>\n  <li>Link the stylesheet</li>\n  <li>Drop in the script</li>\n</ol>',
      },
    ],
  },
  {
    name: 'small',
    description: 'Sans-serif body copy at sm size with an 80ch reading measure for fine print, helper text, or footnotes.',
    useCases: ['fine print', 'helper text under inputs', 'disclaimer paragraph', 'metadata line under a card'],
    htmlElements: ['small', 'p', 'span'],
    examples: [
      {
        title: 'Form helper text',
        html: '<input class="brut-input" type="password">\n<small class="brut-small">At least 12 characters with one symbol.</small>',
      },
    ],
  },
];

export const STATIC_META = new Map(entries.map(e => [e.name, e]));
