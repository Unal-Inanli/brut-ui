export default {
  name: 'topnav',
  description: 'Sticky page header whose only behavior is the mobile burger toggle for the link list; outside-click and Escape close it.',
  useCases: ['marketing site header', 'docs site chrome', 'app shell top bar', 'mobile-friendly navigation', 'product landing nav'],
  kind: 'interactive',
  class: '.brut-topnav',
  selector: '[data-brut="topnav"]',
  modifiers: [
    { name: '--open', description: 'Applied while the mobile link drawer is expanded' },
  ],
  dataAttributes: [
    { name: 'data-brut-label-menu', description: 'Override for the burger button aria-label; falls back to "Toggle menu"' },
  ],
  events: [
    { name: 'brut:open',  detail: {} },
    { name: 'brut:close', detail: {} },
  ],
  formState: { hiddenInput: false, name: 'Navigation chrome — no form value' },
  a11y: {
    role: 'banner (via <header>)',
    keyboard: ['Tab to burger', 'Enter / Space to toggle', 'Escape to close'],
    aria: ['aria-expanded (on burger)', 'aria-controls (on burger)', 'aria-label (on burger)'],
    notes: 'Burger element is .brut-topnav__burger; auto-typed as type="button". Clicks outside the header or pressing Escape close the open menu. Clicking any .brut-topnav__link also closes (mobile UX).',
  },
  examples: [
    {
      title: 'Brand + links + CTA',
      html: '<header class="brut-topnav" data-brut="topnav">\n  <div class="brut-topnav__inner">\n    <a class="brut-topnav__brand" href="/">\n      <span class="brut-topnav__mark">B</span>\n      <span>BRUT&nbsp;UI</span>\n    </a>\n    <nav class="brut-topnav__links">\n      <a class="brut-topnav__link brut-topnav__link--active" href="#">Docs</a>\n      <a class="brut-topnav__link" href="#">Components</a>\n      <a class="brut-topnav__link" href="#">Demos</a>\n    </nav>\n    <a class="brut-btn brut-btn--primary brut-btn--sm brut-topnav__cta" href="#">Read the docs</a>\n    <button class="brut-topnav__burger" aria-label="Menu">≡</button>\n  </div>\n</header>',
    },
    {
      title: 'Minimal — brand and burger only',
      html: '<header class="brut-topnav" data-brut="topnav">\n  <div class="brut-topnav__inner">\n    <a class="brut-topnav__brand" href="/">BRUT</a>\n    <nav class="brut-topnav__links">\n      <a class="brut-topnav__link" href="#">Home</a>\n      <a class="brut-topnav__link" href="#">About</a>\n    </nav>\n    <button class="brut-topnav__burger" aria-label="Menu">≡</button>\n  </div>\n</header>',
    },
  ],
  responsive: {
    shape: 'disclosure-toggle',
    breakpoint: 'md',
    notes: 'Burger-toggled menu below md; horizontal nav at md and above.',
  },
};
