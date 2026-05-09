export default {
  name: 'multiselect',
  description: 'Combobox-style field that holds chips for selected values with type-to-filter, keyboard toggle, and Backspace removal.',
  useCases: ['skill picker', 'tag picker', 'category filter', 'recipient list', 'faceted search'],
  kind: 'interactive',
  status: 'beta',
  class: '.brut-multiselect',
  selector: '[data-brut="multiselect"]',
  modifiers: [
    { name: '.brut-multiselect--open',          description: 'Applied while the option list is visible' },
    { name: '.brut-multiselect__opt--selected', description: 'Marks an option as currently chosen (toggled internally)' },
  ],
  dataAttributes: [
    { name: 'data-brut-name', values: 'string (default "values")',  description: 'name attribute used on the generated hidden inputs (one per selected value)' },
    { name: 'data-value',     values: 'string',                      description: 'On each .brut-multiselect__opt, the value submitted when selected' },
    { name: 'data-selected',  values: 'boolean attribute',           description: 'On a .brut-multiselect__opt, marks it as pre-selected on init' },
  ],
  events: [
    { name: 'brut:change', detail: { value: 'string[] (selected values)' } },
  ],
  formState: { hiddenInput: true, name: 'one <input type="hidden" name="<data-brut-name>"> per selected value, marked with data-brut-mirror="1"' },
  a11y: {
    role: 'combobox (input) + listbox (list) + option (items)',
    keyboard: ['Backspace (remove last chip when input empty)', 'Enter (toggle first visible match)', 'Escape (close)'],
    aria: ['aria-autocomplete="list"', 'aria-expanded', 'aria-multiselectable="true"', 'aria-selected on options'],
    notes: 'Click outside closes the list. Filtering hides non-matching options and shows the .brut-multiselect__empty fallback when no options match.',
  },
  examples: [
    {
      title: 'Empty multiselect',
      html: '<div class="brut-multiselect" data-brut="multiselect" data-brut-name="skills">\n  <div class="brut-multiselect__field">\n    <input class="brut-multiselect__input" placeholder="Pick skills…" />\n  </div>\n  <ul class="brut-multiselect__list">\n    <li class="brut-multiselect__opt" data-value="ux">UX</li>\n    <li class="brut-multiselect__opt" data-value="css">CSS</li>\n    <li class="brut-multiselect__opt" data-value="js">JavaScript</li>\n    <li class="brut-multiselect__empty">No matches.</li>\n  </ul>\n</div>',
    },
    {
      title: 'Pre-selected options',
      html: '<div class="brut-multiselect" data-brut="multiselect" data-brut-name="tags">\n  <div class="brut-multiselect__field">\n    <input class="brut-multiselect__input" placeholder="Add a tag…" />\n  </div>\n  <ul class="brut-multiselect__list">\n    <li class="brut-multiselect__opt" data-value="news"  data-selected>News</li>\n    <li class="brut-multiselect__opt" data-value="press" data-selected>Press</li>\n    <li class="brut-multiselect__opt" data-value="brand">Brand</li>\n    <li class="brut-multiselect__empty">No matches.</li>\n  </ul>\n</div>',
    },
  ],
  responsive: {
    shape: 'bottom-sheet',
    breakpoint: 'sm',
    notes: 'Dropdown docks to bottom edge on phones; anchored to control at sm and above.',
  },
};
