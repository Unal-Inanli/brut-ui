export default {
  name: 'pagination',
  description: 'Page navigation with prev/next, numbered buttons, first/last anchors, and ellipsis gaps for large page counts.',
  useCases: ['paginated table rows', 'search result pages', 'blog/article archives', 'data grid navigation', 'image gallery paging'],
  kind: 'interactive',
  class: '.brut-pagination',
  selector: '[data-brut="pagination"]',
  modifiers: [],
  dataAttributes: [
    { name: 'data-total',                  values: 'integer (required, > 0)',          description: 'Total number of items in the dataset' },
    { name: 'data-page-size',              values: 'integer (required, > 0)',          description: 'Number of items shown per page' },
    { name: 'data-page',                   values: 'integer (default 1)',              description: 'Current 1-based page; clamped to total page count' },
    { name: 'data-sibling-count',          values: 'integer (default 1)',              description: 'Pages shown on each side of the current page before collapsing into an ellipsis' },
    { name: 'data-page-sizes',             values: 'comma-separated integers, e.g. "10,25,50,100"', description: 'When present, renders a `.brut-select` page-size picker. The current page-size is auto-included if missing from the list. Omit the attribute to keep existing markup unchanged.' },
    { name: 'data-brut-label-page-size',   values: 'string (default "Per page:")',     description: 'Label text for the page-size selector; provided for i18n.' },
  ],
  events: [
    { name: 'brut:change', detail: { value: 'integer (new current page)', page: 'integer (new current page)', pageSize: 'integer', total: 'integer' }, notes: 'Fires on page-button clicks and on page-size selector changes. When the page size changes, `page` resets to 1 and `pageSize` carries the new value; the detail shape is unchanged.' },
  ],
  formState: { hiddenInput: false },
  a11y: {
    role: 'navigation',
    keyboard: ['ArrowLeft', 'ArrowRight', 'Home', 'End'],
    aria: ['aria-current', 'aria-label'],
    notes: 'Root gets role="navigation" and aria-label="Pagination" if absent. Active page button carries aria-current="page". Prev/next buttons are disabled at the edges. Ellipsis gaps are aria-hidden so screen readers skip them.',
  },
  examples: [
    {
      title: 'Default — 10 pages of 20',
      html: '<nav class="brut-pagination" data-brut="pagination" data-total="200" data-page-size="20" data-page="1"></nav>',
    },
    {
      title: 'Mid-range with siblings collapsed',
      html: '<nav class="brut-pagination" data-brut="pagination" data-total="500" data-page-size="25" data-page="10" data-sibling-count="1"></nav>',
    },
    {
      title: 'Wider sibling window',
      html: '<nav class="brut-pagination" data-brut="pagination" data-total="1000" data-page-size="50" data-page="7" data-sibling-count="2"></nav>',
    },
  ],
  responsive: {
    shape: 'ellipsis-collapse',
    breakpoint: 'sm',
    notes: 'Middle pages collapse to an ellipsis on phones; full row visible at sm and above.',
  },
};
