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
    description: 'Empty-state placeholder with shape slot, title, body, and optional action button — for zero-data screens.',
    useCases: ['no search results', 'empty inbox', 'unconfigured feature', 'first-time-user state', 'empty table rows'],
    htmlElements: ['div', 'section'],
    modifiers: [],
    notes: 'Compose with brut-empty__shape, brut-empty__title, brut-empty__body, and brut-empty__action wrapping a .brut-btn for the primary action.',
    examples: [
      {
        title: 'No-results empty state',
        html: '<div class="brut-empty">\n  <div class="brut-empty__shape"></div>\n  <h3 class="brut-h2 brut-empty__title">Nothing here yet</h3>\n  <p class="brut-body brut-empty__body">Try a different filter or add your first item.</p>\n  <div class="brut-empty__action">\n    <button class="brut-btn brut-btn--primary" type="button">Add item</button>\n  </div>\n</div>',
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
  {
    name: 'divider',
    description: 'Horizontal rule that draws a thick ink line between sections — registered as a static component but the CSS class block is not yet implemented in src/components.css; the closest in-tree equivalent is the rule pattern documented at the RULE banner (line 2671).',
    useCases: ['section break inside a card', 'visual separator between list groups', 'thematic break between paragraphs', 'between toolbar segments'],
    htmlElements: ['hr', 'div'],
    modifiers: [],
    notes: 'Component is declared in src/config/define.js with kind:"static" but has no .brut-divider selector in src/components.css and no preview/docs surface. Use a plain <hr> with the existing RULE styling, or treat this as an outstanding component-debt item until the class block lands. Examples below assume the conventional shape and will work once the class is added.',
    examples: [
      {
        title: 'Horizontal rule between sections',
        html: '<section>First section content.</section>\n<hr class="brut-divider">\n<section>Second section content.</section>',
      },
    ],
  },
  {
    name: 'hero',
    description: 'Full-bleed hero banner with display headline, lead copy, and call-to-action — registered as a static component but the CSS class block is not yet implemented in src/components.css.',
    useCases: ['landing page hero', 'marketing splash', 'top-of-page banner', 'product launch announcement'],
    htmlElements: ['section', 'header', 'div'],
    modifiers: [],
    notes: 'Component is declared in src/config/define.js with kind:"static" but has no .brut-hero selector in src/components.css and no preview/docs surface. Compose a hero today with .brut-section--ink + .brut-section--loose + .brut-container + .brut-display-1 + .brut-lead. Treat the .brut-hero class as outstanding component-debt.',
    examples: [
      {
        title: 'Hero composed from existing primitives (current pattern)',
        html: '<section class="brut-section brut-section--ink brut-section--loose">\n  <div class="brut-container">\n    <h1 class="brut-display-1">SHIP SOMETHING BRUTAL</h1>\n    <p class="brut-lead">A vanilla UI kit for builders who like edges sharp and corners square.</p>\n    <a class="brut-btn brut-btn--primary brut-btn--lg" href="/get-started">Get started</a>\n  </div>\n</section>',
      },
    ],
  },
  {
    name: 'mono',
    description: 'Inline monospace run for code-flavored text inside body copy — registered as a static component but the CSS class block is not yet implemented in src/components.css.',
    useCases: ['inline file path in prose', 'short identifier in body text', 'CLI flag mention', 'shortcut spelled in copy'],
    htmlElements: ['span', 'code'],
    modifiers: [],
    notes: 'Component is declared in src/config/define.js with kind:"static" but has no .brut-mono selector in src/components.css. The font-family token (--font-mono) is used by .brut-code, .brut-pre, and .brut-kbd; for inline code styling today prefer .brut-code. preview/type-mono.html is a typography demo, not a usage page for .brut-mono. Treat this as outstanding component-debt.',
    examples: [
      {
        title: 'Monospace run inside body copy (intended pattern)',
        html: '<p class="brut-body">Edit the file at <span class="brut-mono">src/config/define.js</span> to register a new component.</p>',
      },
    ],
  },
  {
    name: 'notice',
    description: 'Banner-style call-out for advisory or contextual messaging — registered as a static component but the CSS class block is not yet implemented in src/components.css; functionally similar to .brut-alert.',
    useCases: ['inline page-top advisory', 'soft system reminder', 'policy or terms callout', 'doc page tip block'],
    htmlElements: ['div', 'aside'],
    modifiers: [],
    notes: 'Component is declared in src/config/define.js with kind:"static" but has no .brut-notice selector in src/components.css and no preview/docs surface. Use .brut-alert (with --info, --warn, --ok, --err) for any banner-style messaging today. Treat .brut-notice as outstanding component-debt.',
    examples: [
      {
        title: 'Use .brut-alert today (current substitute)',
        html: '<div class="brut-alert brut-alert--info">\n  <div class="brut-alert__icon">i</div>\n  <div>Heads up — scheduled maintenance starts at 02:00 UTC.</div>\n</div>',
      },
    ],
  },
  {
    name: 'overline',
    description: 'Eyebrow label rendered above a heading — sans font, extra-small, bold, uppercase, widest tracking, muted concrete-400 color, zero margin.',
    useCases: ['category label above a hero headline', 'section eyebrow', 'card kicker', 'breadcrumb-style group label'],
    htmlElements: ['p', 'span', 'div', 'h6'],
    modifiers: [],
    notes: 'Differs from .brut-h6 — .brut-overline is muted (concrete-400) and used as a kicker above a larger heading; .brut-h6 is the smallest in-flow heading proper. Pair an overline directly above an .brut-h1 or .brut-display-* for the classic eyebrow lockup.',
    examples: [
      {
        title: 'Eyebrow above a section title',
        html: '<p class="brut-overline">Pricing</p>\n<h2 class="brut-h2">Simple plans for any team</h2>',
      },
      {
        title: 'Card kicker',
        html: '<article class="brut-card">\n  <p class="brut-overline">New</p>\n  <h3 class="brut-h3">Workflows v2</h3>\n  <p class="brut-body">Now with conditional steps.</p>\n</article>',
      },
    ],
  },
  {
    name: 'pre',
    description: 'Block-level preformatted code panel — monospace, ink background with paper text, sm size, thick ink border, sm shadow, scroll-on-overflow.',
    useCases: ['multi-line code sample in docs', 'JSON/YAML payload display', 'CLI session transcript', 'config-file snippet'],
    htmlElements: ['pre'],
    modifiers: [],
    notes: 'Token-color hooks are available for inline syntax highlight: .tok-comment (concrete-300), .tok-keyword (pop-pink), .tok-string (pop-lime), .tok-num (primary). Wrap highlighted runs in <span class="tok-*"> inside the <pre>.',
    examples: [
      {
        title: 'Code block',
        html: '<pre class="brut-pre"><code>npm install\nnpm run build</code></pre>',
      },
      {
        title: 'Code block with token highlighting',
        html: '<pre class="brut-pre"><span class="tok-comment">// Snap, never ease.</span>\n<span class="tok-keyword">const</span> ease = <span class="tok-string">\'cubic-bezier(.2,.8,.2,1)\'</span>;\n<span class="tok-keyword">const</span> duration = <span class="tok-num">140</span>;</pre>',
      },
    ],
  },
  {
    name: 'prose',
    description: 'Long-form readable text container — sans, base size, normal line-height, 70ch measure — auto-spaces direct children with a sp-3h gap and tightens spacing around nested headings, lists, and inline code.',
    useCases: ['blog post body', 'docs article body', 'rendered markdown wrapper', 'long-form content region'],
    htmlElements: ['article', 'div', 'main', 'section'],
    modifiers: [],
    notes: 'Owl-style spacing (".brut-prose > * + *") only targets DIRECT children, so put each paragraph, heading, and list directly inside the container. Nested h2/h3 get extra top margin (sp-8 / sp-6) for clear section breaks. Inline <code> inside .brut-prose picks up the .brut-code styling automatically.',
    examples: [
      {
        title: 'Article body',
        html: '<article class="brut-prose">\n  <h1 class="brut-h1">Welcome</h1>\n  <p>The first paragraph sits flush with the heading above it.</p>\n  <h2>Subsection</h2>\n  <p>Subsequent children get vertical rhythm automatically.</p>\n  <ul>\n    <li>List items inherit padding</li>\n    <li>Inline <code>code</code> picks up panel styling</li>\n  </ul>\n</article>',
      },
    ],
  },
  {
    name: 'quote',
    description: 'Pull-out quote with a left ink rule — sans, md size, normal line-height, no italic, sp-1h vertical / sp-4 horizontal padding, zero margin.',
    useCases: ['inline pull quote in an article', 'testimonial inside a card', 'reviewer comment', 'highlight from a longer passage'],
    htmlElements: ['blockquote', 'div'],
    modifiers: [],
    notes: 'Use .brut-pull-quote (separate class) for the larger display-weight pull-out with thick top + bottom rules. .brut-quote stays inline-friendly inside body copy.',
    examples: [
      {
        title: 'Inline blockquote',
        html: '<blockquote class="brut-quote">Concrete is honest about what it is.</blockquote>',
      },
      {
        title: 'Testimonial in a card',
        html: '<article class="brut-card">\n  <blockquote class="brut-quote">The fastest UI kit our team has shipped against.</blockquote>\n  <p class="brut-caption">— Jane Doe, Lead Engineer</p>\n</article>',
      },
    ],
  },
  {
    name: 'range',
    description: 'Restyled native single-thumb slider — bone-fill track with thick ink border and sp-icon primary-fill thumb. Wraps a real <input type="range"> for native value, keyboard, and form submission.',
    useCases: ['volume / brightness slider', 'numeric value picker', 'filter weight control', 'preference percentage input'],
    htmlElements: ['input[type="range"]'],
    modifiers: [],
    notes: 'Apply the class directly to the <input type="range"> element. Stepped behavior comes from the standard step="" attribute. For two-thumb min/max selection, use .brut-range-dual (interactive component, separate JS module).',
    examples: [
      {
        title: 'Default range slider',
        html: '<input class="brut-range" type="range" min="0" max="100" value="50">',
      },
      {
        title: 'Stepped slider with label',
        html: '<label class="brut-label" for="volume">Volume</label>\n<input id="volume" class="brut-range" type="range" min="0" max="10" step="1" value="7">',
      },
    ],
  },
  {
    name: 'select',
    description: 'Restyled native dropdown — bone fill, thick ink border, xs shadow, hard ink chevron drawn with two linear-gradients (sanctioned exception per AGENTS.md). 100% width, focus ring flips background to primary-soft.',
    useCases: ['form single-select', 'sort/filter dropdown', 'toolbar option picker', 'settings choice field'],
    htmlElements: ['select'],
    modifiers: [],
    notes: 'Width is 100% by default — wrap inside a sized parent or grid cell to constrain. Validation states are driven natively via :user-invalid / :user-valid (and the [aria-invalid="true"] attribute). For a searchable rich select with custom rendering, use .brut-combobox or .brut-multiselect (interactive components).',
    examples: [
      {
        title: 'Default select',
        html: '<select class="brut-select">\n  <option value="">Choose a planet…</option>\n  <option>Mercury</option>\n  <option>Venus</option>\n  <option>Earth</option>\n</select>',
      },
      {
        title: 'Select with optgroups',
        html: '<select class="brut-select">\n  <optgroup label="Inner">\n    <option>Mercury</option>\n    <option>Venus</option>\n  </optgroup>\n  <optgroup label="Outer">\n    <option>Jupiter</option>\n    <option>Saturn</option>\n  </optgroup>\n</select>',
      },
    ],
  },
  {
    name: 'skeleton',
    description: 'Loading placeholder block with concrete-100 fill, thin ink border, and a hard ink stripe sweep that loops every 800ms (sanctioned loader animation). Pair sizing modifiers to match the content shape being substituted.',
    useCases: ['async card placeholder', 'image-loading shim', 'list-row placeholder', 'avatar placeholder', 'table-row stand-in'],
    htmlElements: ['span', 'div'],
    modifiers: [
      { name: '--text', height: '1em width:100%', description: '1em-tall full-width line for substituting a row of text' },
      { name: '--block', description: 'Fixed-height block (--skeleton-h) for substituting a card hero or image' },
      { name: '--circle', description: 'Square sp-12 box for substituting an avatar' },
    ],
    notes: 'The shimmer animation is a sanctioned exception to the 140ms transition cap because it is an animation loop, not a transition. Honors prefers-reduced-motion via the reduce-motion media block in components.css.',
    examples: [
      {
        title: 'Text-line skeletons',
        html: '<div class="brut-stack brut-stack--xs">\n  <span class="brut-skeleton brut-skeleton--text" style="width: 80%;"></span>\n  <span class="brut-skeleton brut-skeleton--text" style="width: 95%;"></span>\n  <span class="brut-skeleton brut-skeleton--text" style="width: 60%;"></span>\n</div>',
      },
      {
        title: 'Card-loading placeholder',
        html: '<div class="brut-card">\n  <div class="brut-skeleton brut-skeleton--block" style="height: 120px; margin-bottom: 16px;"></div>\n  <span class="brut-skeleton brut-skeleton--text" style="width: 70%;"></span>\n</div>',
      },
    ],
  },
  {
    name: 'spinner',
    description: 'Square loading indicator — thick ink border with the top edge in primary, rotating 360deg every 600ms (sanctioned loader animation). No border-radius — stays brutalist.',
    useCases: ['inline button loading state', 'async data fetch indicator', 'page-level loading spinner', 'background-task busy state'],
    htmlElements: ['span', 'div'],
    modifiers: [
      { name: '--sm', description: 'sp-6 box with bw-2 border — for inline button or text use' },
      { name: '--md', description: 'sp-8 box with bw-3 border — the default size' },
      { name: '--lg', description: 'sp-12 box with bw-3 border — for page-level loading states' },
    ],
    notes: 'The 600ms rotation is a sanctioned exception to the 140ms transition cap because it is an animation loop, not a transition. Honors prefers-reduced-motion via the reduce-motion media block in components.css. For determinate progress, use .brut-progress instead.',
    examples: [
      {
        title: 'Spinner inside a loading button',
        html: '<button class="brut-btn" type="button" disabled>\n  <span class="brut-spinner brut-spinner--sm" style="vertical-align: middle; margin-right: 8px;"></span>\n  SAVING\n</button>',
      },
      {
        title: 'Inline with status text',
        html: '<div class="brut-cluster brut-cluster--sm">\n  <span class="brut-spinner brut-spinner--sm"></span>\n  <span class="brut-body">Loading…</span>\n</div>',
      },
    ],
  },
  {
    name: 'stat',
    description: 'Number-and-label statistic display block — registered as a static component but the CSS class block is not yet implemented in src/components.css; the closest in-tree equivalent is the existing .brut-num figure class (line 277).',
    useCases: ['dashboard KPI tile', 'metric in a marketing page', 'inline figure with label', 'reporting summary block'],
    htmlElements: ['div', 'article'],
    modifiers: [],
    notes: 'Component is declared in src/config/define.js with kind:"static" but has no .brut-stat selector in src/components.css and no preview/docs surface. Compose a stat today with .brut-num for the figure plus .brut-overline or .brut-label for the caption. Treat .brut-stat as outstanding component-debt.',
    examples: [
      {
        title: 'Stat composed from existing primitives (current pattern)',
        html: '<div>\n  <p class="brut-num">12,480</p>\n  <p class="brut-overline">Active users</p>\n</div>',
      },
    ],
  },
];

export const STATIC_META = new Map(entries.map(e => [e.name, e]));
