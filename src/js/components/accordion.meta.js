export default {
  name: 'accordion',
  description: 'Stacked disclosure panels that expand and collapse on click or keyboard, with optional multi-open mode.',
  useCases: ['FAQ section', 'shipping and returns details', 'settings panels', 'sidebar nav groups', 'product specifications'],
  kind: 'interactive',
  class: '.brut-accordion',
  selector: '[data-brut="accordion"]',
  modifiers: [],
  dataAttributes: [
    { name: 'data-brut-allow-multi', values: 'boolean attribute', description: 'When present, multiple items can stay open at once; otherwise opening one closes the others' },
  ],
  events: [
    { name: 'brut:change', detail: { open: 'boolean (new state of the toggled item)' } },
  ],
  formState: { hiddenInput: false },
  a11y: {
    keyboard: ['Enter', 'Space'],
    aria: ['aria-expanded (on each head)', 'aria-controls (on head, points to body id)'],
    notes: 'Heads default to <button type="button">. Bodies receive an auto-generated id when none is set. The brut:change event bubbles from the toggled item, not the accordion root.',
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
};
