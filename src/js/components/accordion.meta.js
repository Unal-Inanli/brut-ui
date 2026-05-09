export default {
  name: 'accordion',
  description: 'Stacked disclosure panels that expand and collapse on click or keyboard, with optional multi-open mode. Each toggled item dispatches both brut:change (state-machine) and brut:open/brut:close (semantic disclosure) for compatibility with both consumer patterns.',
  useCases: ['FAQ section', 'shipping and returns details', 'settings panels', 'sidebar nav groups', 'product specifications'],
  kind: 'interactive',
  status: 'stable',
  class: '.brut-accordion',
  selector: '[data-brut="accordion"]',
  modifiers: [],
  dataAttributes: [
    { name: 'data-brut-allow-multi', values: 'boolean attribute', description: 'When present, multiple items can stay open at once; otherwise opening one closes the others' },
  ],
  events: [
    { name: 'brut:change', detail: { value: 'boolean (new open state of the toggled item)', open: 'boolean (new state of the toggled item)' } },
    { name: 'brut:open', detail: { value: 'true' } },
    { name: 'brut:close', detail: { value: 'false' } },
  ],
  formState: { hiddenInput: false },
  a11y: {
    keyboard: ['Enter', 'Space'],
    aria: ['aria-expanded (on each head)', 'aria-controls (on head, points to body id)', 'role="region" (on panel)', 'aria-labelledby (on panel → trigger id)'],
    notes: 'Heads default to <button type="button"> and receive a sequential auto-generated id (brut-accordion-<n>) when none is set, so panels can reference them via aria-labelledby. Bodies receive a sequential auto-generated id (brut-acc-body-<n>) when none is set, plus role="region" and aria-labelledby pointing to the head id (consumer-supplied attributes are preserved). IDs are assigned via deterministic counters rather than Math.random so SSR-hydrated frameworks (Next.js, Astro, Nuxt, SvelteKit) match server and client output. aria-controls and aria-labelledby are always wired at init whenever a body is present, so screen readers can navigate trigger ↔ panel even when consumers omit ids. Each toggled item dispatches both brut:change (state-machine, with detail.value and detail.open) and brut:open/brut:close (semantic disclosure, with detail.value as the new open boolean) so consumers can subscribe to either pattern. All three events bubble from the toggled item, not the accordion root.',
  },
  examples: [
    {
      title: 'Default — single-open',
      html: '<div class="brut-accordion" data-brut="accordion">\n  <div class="brut-accordion__item brut-accordion__item--open">\n    <button class="brut-accordion__head" type="button">\n      <span>SHIPPING</span>\n      <span class="brut-accordion__icon" aria-hidden="true"></span>\n    </button>\n    <div class="brut-accordion__body">Ships in 2-3 business days.</div>\n  </div>\n  <div class="brut-accordion__item">\n    <button class="brut-accordion__head" type="button">\n      <span>RETURNS</span>\n      <span class="brut-accordion__icon" aria-hidden="true"></span>\n    </button>\n    <div class="brut-accordion__body">30-day return window.</div>\n  </div>\n</div>',
    },
    {
      title: 'Allow multiple open',
      html: '<div class="brut-accordion" data-brut="accordion" data-brut-allow-multi>\n  <div class="brut-accordion__item brut-accordion__item--open">\n    <button class="brut-accordion__head" type="button">\n      <span>ONE</span>\n      <span class="brut-accordion__icon" aria-hidden="true"></span>\n    </button>\n    <div class="brut-accordion__body">First panel body.</div>\n  </div>\n  <div class="brut-accordion__item brut-accordion__item--open">\n    <button class="brut-accordion__head" type="button">\n      <span>TWO</span>\n      <span class="brut-accordion__icon" aria-hidden="true"></span>\n    </button>\n    <div class="brut-accordion__body">Second panel body.</div>\n  </div>\n</div>',
    },
  ],
  responsive: {
    shape: 'static',
    notes: 'Disclosure is shape-invariant; no viewport flip.',
  },
};
