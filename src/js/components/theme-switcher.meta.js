export default {
  name: 'theme-switcher',
  description: 'Radio group that flips the active theme via Brut.theme(); writes [data-theme] on the document root and persists the choice.',
  useCases: ['site-wide theme toggle in header', 'demo-page theme picker', 'storybook-style preview toolbar', 'docs page chrome', 'app settings panel'],
  kind: 'interactive',
  class: '.brut-theme-switcher',
  selector: '[data-brut="theme-switcher"]',
  modifiers: [
    { name: '__btn--on', description: 'Applied to the currently selected theme button (paired with aria-checked="true")' },
  ],
  dataAttributes: [
    { name: 'data-brut-themes', values: 'comma-separated names (default "brutalist,corporate,minimal")', description: 'Theme list to render as buttons; each becomes a radio with that data-value' },
    { name: 'data-value',       values: 'string (written by JS on each generated button)',                description: 'Theme name carried by each rendered button' },
  ],
  events: [
    { name: 'brut:change', detail: { value: 'string (selected theme name)' } },
  ],
  formState: { hiddenInput: false, name: 'Theme is applied via Brut.theme() and document-root [data-theme]; no form value' },
  a11y: {
    role: 'radiogroup',
    keyboard: ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'],
    aria: ['role="radiogroup"', 'aria-label="Theme"', 'role="radio" (on each button)', 'aria-checked', 'roving tabindex'],
    notes: 'Empty <div data-brut="theme-switcher"></div> is enough — the script generates the buttons. Initial selection mirrors Brut.theme(); arrow keys cycle and immediately apply the focused theme.',
  },
  examples: [
    {
      title: 'Default three-way switcher',
      html: '<div data-brut="theme-switcher"></div>',
    },
    {
      title: 'Custom theme list',
      html: '<div data-brut="theme-switcher" data-brut-themes="brutalist,minimal"></div>',
    },
    {
      title: 'Inside a topnav',
      html: '<header class="brut-topnav" data-brut="topnav">\n  <div class="brut-topnav__inner">\n    <a class="brut-topnav__brand" href="/">BRUT</a>\n    <div data-brut="theme-switcher" style="margin-left:auto;"></div>\n  </div>\n</header>',
    },
  ],
  responsive: {
    shape: 'static',
    notes: 'Inline control; no viewport flip.',
  },
};
