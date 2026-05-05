export default {
  name: 'table-columns',
  description: 'Column-visibility menu for a brut-table; injects a checkbox menu and toggles column display via a data attribute.',
  useCases: ['hide noisy columns', 'tailor table density', 'user-customizable reports', 'admin grids with many fields'],
  kind: 'interactive',
  class: '.brut-table-columns-btn',
  selector: '[data-brut="table-columns"]',
  modifiers: [],
  dataAttributes: [
    { name: 'data-brut-table',     values: 'id of target <table>', description: 'ID of the .brut-table this control governs' },
    { name: 'data-brut-name',      values: 'string (default "visible_cols")', description: 'name attribute for the generated hidden input mirroring the visible columns CSV' },
    { name: 'data-col',            values: 'string',               description: 'Required on every th and td of the target table; identifies the column for hide/show' },
    { name: 'data-brut-col-label', values: 'string',               description: 'Optional override for the menu item label (defaults to th text content)' },
    { name: 'data-col-hidden',     values: 'space-separated keys', description: 'Written to the table by the component; matches the injected attribute-selector CSS rules that hide cells' },
  ],
  events: [
    { name: 'brut:change', detail: { visible: 'array of visible column keys' } },
  ],
  formState: { hiddenInput: true, name: 'Generated hidden input carries data-brut-cols-state and a comma-separated list of visible column keys' },
  a11y: {
    role: 'menu (on the generated dropdown)',
    keyboard: ['Space', 'Enter', 'Escape'],
    aria: ['role="menu"', 'role="menuitemcheckbox" on each item', 'aria-checked on each item'],
    notes: 'Reuses the brut-menu component for open/close and keyboard navigation; runs Brut.init on the parent so the dynamically inserted menu wires itself up.',
  },
  examples: [
    {
      title: 'Toolbar button governing a table',
      html: '<div class="toolbar">\n  <button class="brut-btn brut-btn--sm brut-table-columns-btn"\n          data-brut="table-columns"\n          data-brut-table="people"\n          data-brut-name="visible_cols">&#x229E; COLUMNS</button>\n</div>\n<table id="people" class="brut-table brut-table--striped">\n  <thead class="brut-table__head">\n    <tr class="brut-table__row">\n      <th class="brut-table__cell" data-col="name">Name</th>\n      <th class="brut-table__cell" data-col="role">Role</th>\n      <th class="brut-table__cell" data-col="email">Email</th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr class="brut-table__row">\n      <td class="brut-table__cell" data-col="name">Alice</td>\n      <td class="brut-table__cell" data-col="role">Designer</td>\n      <td class="brut-table__cell" data-col="email">alice@example.com</td>\n    </tr>\n  </tbody>\n</table>',
    },
    {
      title: 'Custom menu labels',
      html: '<button class="brut-btn brut-btn--sm brut-table-columns-btn"\n        data-brut="table-columns" data-brut-table="orders">COLUMNS</button>\n<table id="orders" class="brut-table">\n  <thead class="brut-table__head">\n    <tr class="brut-table__row">\n      <th class="brut-table__cell" data-col="id" data-brut-col-label="Order #">ID</th>\n      <th class="brut-table__cell" data-col="total" data-brut-col-label="Total ($)">Total</th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr class="brut-table__row">\n      <td class="brut-table__cell" data-col="id">A-001</td>\n      <td class="brut-table__cell" data-col="total">42.00</td>\n    </tr>\n  </tbody>\n</table>',
    },
  ],
};
