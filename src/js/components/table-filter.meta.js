export default {
  name: 'table-filter',
  description: 'Global text filter for a brut-table; hides tbody rows whose combined text fails to match every whitespace-separated token (AND, case-insensitive).',
  useCases: ['quick search above a table', 'large list narrowing', 'admin grids', 'reports with lots of rows'],
  kind: 'interactive',
  class: '.brut-table-filter',
  selector: '[data-brut="table-filter"]',
  modifiers: [],
  dataAttributes: [
    { name: 'data-brut-table',         values: 'id of target <table>', description: 'ID of the .brut-table whose rows are filtered' },
    { name: 'data-brut-name',          values: 'string (default "q")', description: 'name attribute for the generated hidden input mirroring the query' },
    { name: 'data-brut-filter-hidden', values: 'boolean attribute',    description: 'Written to a row by the component when it is hidden by the current filter' },
    { name: 'data-brut-hidden-by',     values: '"filter"',             description: 'Sentinel marking which decorator hid the row, so other decorators can coexist without clobbering each other' },
    { name: 'data-brut-row-expansion', values: 'boolean attribute',    description: 'On a row: opt out of being filtered (used by row expansion patterns)' },
  ],
  events: [
    { name: 'brut:change', detail: { value: 'string (lowercased query)', visible: 'integer (matching row count)', total: 'integer (total rows)' } },
    { name: 'brut:change', detail: { source: '"filter" (re-dispatched on the table to notify pagination etc.)' } },
  ],
  formState: { hiddenInput: true, name: 'Generated hidden input carries data-brut-filter-state and the current query string' },
  a11y: {
    role: 'search (via type=search input)',
    keyboard: [],
    aria: ['Standard label/input pairing via brut-field__label'],
    notes: 'Filter runs on every input event; expansion rows (data-brut-row-expansion) are skipped. Updates a .brut-table-filter__count element with "X of Y" if present.',
  },
  examples: [
    {
      title: 'Search box above a table',
      html: '<div class="brut-table-filter" data-brut="table-filter" data-brut-table="people">\n  <label class="brut-field__label" for="q-people">Search</label>\n  <input id="q-people" class="brut-input" type="search" placeholder="Filter rows…" autocomplete="off"/>\n  <span class="brut-table-filter__count"></span>\n</div>\n<table id="people" class="brut-table brut-table--striped">\n  <thead class="brut-table__head">\n    <tr class="brut-table__row">\n      <th class="brut-table__cell">Name</th>\n      <th class="brut-table__cell">Role</th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr class="brut-table__row"><td class="brut-table__cell">Alice Chen</td><td class="brut-table__cell">Designer</td></tr>\n    <tr class="brut-table__row"><td class="brut-table__cell">Bob Marsh</td><td class="brut-table__cell">Engineer</td></tr>\n  </tbody>\n</table>',
    },
    {
      title: 'Custom hidden-input name',
      html: '<div class="brut-table-filter" data-brut="table-filter" data-brut-table="orders" data-brut-name="order_q">\n  <input class="brut-input" type="search" placeholder="Filter orders…"/>\n  <span class="brut-table-filter__count"></span>\n</div>',
    },
  ],
};
