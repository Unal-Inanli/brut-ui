export default {
  name: 'search',
  description: 'Text input wrapper with a clear (×) button that appears only when the field has a value and resets the input on click.',
  useCases: ['site search field', 'list filter input', 'command palette trigger', 'inline lookup', 'table toolbar search'],
  kind: 'interactive',
  class: '.brut-search',
  selector: '[data-brut="search"]',
  modifiers: [
    { name: '.brut-search--has-value', description: 'Toggled on the wrapper while the input is non-empty; reveals the clear button' },
  ],
  dataAttributes: [],
  events: [
    { name: 'brut:change', detail: { value: 'string (current input value)' } },
  ],
  formState: { hiddenInput: false, name: 'the inner <input type="search"> is the canonical form value' },
  a11y: {
    role: 'native search input',
    keyboard: ['standard text input keys'],
    aria: ['aria-label (on the clear button)'],
    notes: 'Clearing the input refocuses it so typing can continue uninterrupted.',
  },
  examples: [
    {
      title: 'Empty',
      html: '<div class="brut-search" data-brut="search">\n  <input class="brut-input" type="search" placeholder="Search…">\n  <button class="brut-search__clear" aria-label="Clear">×</button>\n</div>',
    },
    {
      title: 'Pre-filled (clear button visible)',
      html: '<div class="brut-search" data-brut="search">\n  <input class="brut-input" type="search" value="button" placeholder="Search…">\n  <button class="brut-search__clear" aria-label="Clear">×</button>\n</div>',
    },
  ],
  responsive: {
    shape: 'static',
    notes: 'Form input; no viewport flip.',
  },
};
