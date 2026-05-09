export default {
  name: 'table',
  description: 'Data table with click-to-sort headers, header select-all checkbox, and per-row select checkboxes.',
  useCases: ['admin dashboards', 'inventory lists', 'user management grids', 'analytics reports', 'spreadsheet-like data'],
  kind: 'interactive',
  status: 'stable',
  class: '.brut-table',
  selector: '[data-brut="table"]',
  modifiers: [
    { name: '--striped',      description: 'Zebra-striped tbody rows' },
    { name: '--bordered',     description: 'Vertical separators between cells' },
    { name: '--compact',      description: 'Tighter cell padding' },
    { name: '--responsive',   description: 'Below the small breakpoint, stack rows as cards (requires data-brut-col-label on each td)' },
    { name: '--sticky-head',  description: 'thead remains visible while tbody scrolls' },
    { name: '--sticky-col',   description: 'First column remains visible during horizontal scroll' },
  ],
  dataAttributes: [
    { name: 'data-sort-key',         values: 'string',        description: 'On a th.brut-table__cell--sortable: identifier for the sortable column' },
    { name: 'data-sort-value',       values: 'string|number', description: 'On a td: explicit value used for sorting (falls back to text content)' },
    { name: 'data-sort-direction',   values: '"ascending" | "descending" | "none"', description: 'On a sortable th: written by the JS after each sort to reflect the active direction (every other sortable th gets "none")' },
    { name: 'data-brut-select-all',  values: 'boolean attribute', description: 'On a header element: toggles every [data-brut-row-select] in the table' },
    { name: 'data-brut-row-select',  values: 'boolean attribute', description: 'On a tbody row checkbox: marks the row as selectable by the header toggle' },
    { name: 'data-brut-col-label',   values: 'string',        description: 'On a td (responsive mode): label prefix shown before the cell value when stacked' },
    { name: 'data-brut-role',        values: '"empty-state"', description: 'On a child element: opt-in empty-state slot. Auto-shown when tbody has zero visible rows; the table itself is hidden in that state. A MutationObserver on tbody re-syncs after row additions/removals; consumers do not need to call a refresh API.' },
  ],
  events: [
    { name: 'brut:change', detail: { value: 'boolean (select-all on/off state)', selectAll: 'true (only on select-all toggle)' } },
    { name: 'brut:sort',   detail: { value: '{ key, direction }', key: 'string', direction: '"ascending" | "descending" | "none"' } },
  ],
  formState: { hiddenInput: false, name: 'Row checkboxes own their own form state; the table itself does not mirror to a hidden input' },
  a11y: {
    role: 'table (native)',
    keyboard: ['Space', 'Enter'],
    aria: ['aria-sort (on sortable th: none|ascending|descending)', 'role="columnheader"', 'role="checkbox" (on select-all)', 'aria-checked (on select-all and rows)'],
    notes: 'Sortable headers are tabindex=0, activated by Space or Enter. Numeric values sort numerically; otherwise locale-aware case-insensitive string sort. Select-all syncs every row checkbox and dispatches a real change event on the underlying input. Auto empty-state: when a [data-brut-role="empty-state"] child is present, it is automatically revealed (and the table hidden) whenever tbody has no visible rows; a MutationObserver keeps this in sync as rows are added or removed.',
  },
  examples: [
    {
      title: 'Default — static',
      html: '<table class="brut-table">\n  <thead class="brut-table__head">\n    <tr class="brut-table__row">\n      <th class="brut-table__cell">Name</th>\n      <th class="brut-table__cell">Role</th>\n      <th class="brut-table__cell brut-table__cell--num">Items</th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr class="brut-table__row"><td class="brut-table__cell">Alice</td><td class="brut-table__cell">Designer</td><td class="brut-table__cell brut-table__cell--num">14</td></tr>\n    <tr class="brut-table__row"><td class="brut-table__cell">Bob</td><td class="brut-table__cell">Engineer</td><td class="brut-table__cell brut-table__cell--num">7</td></tr>\n  </tbody>\n</table>',
    },
    {
      title: 'Sortable + select-all',
      html: '<table class="brut-table brut-table--striped" data-brut="table">\n  <thead class="brut-table__head">\n    <tr class="brut-table__row">\n      <th class="brut-table__cell"><span class="brut-checkbox" data-brut-select-all></span></th>\n      <th class="brut-table__cell brut-table__cell--sortable" data-sort-key="name">Name</th>\n      <th class="brut-table__cell brut-table__cell--sortable brut-table__cell--num" data-sort-key="qty">Qty</th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr class="brut-table__row">\n      <td class="brut-table__cell"><label class="brut-checkbox" data-brut-row-select><input type="checkbox" hidden></label></td>\n      <td class="brut-table__cell" data-sort-value="alice">Alice</td>\n      <td class="brut-table__cell brut-table__cell--num" data-sort-value="14">14</td>\n    </tr>\n    <tr class="brut-table__row">\n      <td class="brut-table__cell"><label class="brut-checkbox" data-brut-row-select><input type="checkbox" hidden></label></td>\n      <td class="brut-table__cell" data-sort-value="bob">Bob</td>\n      <td class="brut-table__cell brut-table__cell--num" data-sort-value="7">7</td>\n    </tr>\n  </tbody>\n</table>',
    },
    {
      title: 'Compact + bordered',
      html: '<table class="brut-table brut-table--compact brut-table--bordered">\n  <thead class="brut-table__head">\n    <tr class="brut-table__row">\n      <th class="brut-table__cell">SKU</th>\n      <th class="brut-table__cell">Title</th>\n      <th class="brut-table__cell brut-table__cell--num">Stock</th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr class="brut-table__row"><td class="brut-table__cell">A-001</td><td class="brut-table__cell">Bone-white tee</td><td class="brut-table__cell brut-table__cell--num">122</td></tr>\n  </tbody>\n</table>',
    },
  ],
  responsive: {
    shape: 'horizontal-scroll',
    breakpoint: 'md',
    notes: 'Wide tables scroll horizontally below md; expanded layout at md and above.',
  },
};
