export default {
  name: 'combobox',
  description: 'Searchable single-select with a text input that filters a static option list and a hidden input mirror for form submission.',
  useCases: ['country picker', 'tag-free single-tag selection', 'framework chooser', 'autocomplete dropdown', 'searchable enum field'],
  kind: 'interactive',
  class: '.brut-combobox',
  selector: '[data-brut="combobox"]',
  modifiers: ['--open'],
  dataAttributes: [
    { name: 'data-brut-name', values: 'string', description: 'Name for the auto-injected hidden input when one is not supplied in markup' },
    { name: 'data-value', values: 'string (on each .brut-combobox__opt)', description: 'Value written to the hidden input when this option is picked; falls back to option text content' },
  ],
  events: [
    { name: 'brut:change', detail: { value: 'string (selected option value, or "" when cleared)', label: 'string (selected option label, or "" when cleared)' }, bubbles: true, notes: 'Fires on selection, on text-field clear, and on blur when the current text matches no option label.' },
  ],
  formState: { hiddenInput: true, name: 'Hidden input is created automatically when data-brut-name is set; otherwise consumer supplies <input type="hidden">' },
  a11y: {
    role: 'combobox (on the text input); listbox (on the list); option (on each item)',
    keyboard: ['ArrowDown', 'ArrowUp', 'Enter', 'Escape'],
    aria: ['aria-autocomplete="list"', 'aria-expanded', 'aria-selected (on options)'],
    notes: 'The dropdown closes on Escape, outside-click, or any ancestor scroll. Filter is a case-insensitive substring match on option text. The .brut-combobox__empty element is shown when no options match. Clearing the visible text field clears the hidden input and dispatches brut:change with empty value/label, so the form never submits a stale selection. Blurring the input while the text does not match any option label clears the hidden input the same way (simple "clear" semantics — the last valid selection is not restored).',
  },
  examples: [
    {
      title: 'Empty city picker',
      html: '<div class="brut-combobox" data-brut="combobox" data-brut-name="city">\n  <input class="brut-input" type="text" placeholder="Search city…">\n  <input type="hidden" name="city">\n  <ul class="brut-combobox__list">\n    <li class="brut-combobox__opt" data-value="nyc">New York</li>\n    <li class="brut-combobox__opt" data-value="ber">Berlin</li>\n    <li class="brut-combobox__opt" data-value="lon">London</li>\n    <li class="brut-combobox__opt" data-value="tok">Tokyo</li>\n    <li class="brut-combobox__empty">No matches.</li>\n  </ul>\n</div>',
    },
    {
      title: 'Pre-filled value',
      html: '<div class="brut-combobox" data-brut="combobox" data-brut-name="framework">\n  <input class="brut-input" type="text" value="Vanilla JS" placeholder="Search…">\n  <input type="hidden" name="framework" value="vanilla">\n  <ul class="brut-combobox__list">\n    <li class="brut-combobox__opt" data-value="vanilla">Vanilla JS</li>\n    <li class="brut-combobox__opt" data-value="svelte">Svelte</li>\n    <li class="brut-combobox__opt" data-value="solid">Solid</li>\n    <li class="brut-combobox__opt" data-value="lit">Lit</li>\n    <li class="brut-combobox__empty">No matches.</li>\n  </ul>\n</div>',
    },
  ],
  responsive: {
    shape: 'bottom-sheet',
    breakpoint: 'sm',
    notes: 'Listbox docks to bottom edge on phones; anchored below input at sm and above.',
  },
};
