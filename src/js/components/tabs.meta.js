export default {
  name: 'tabs',
  description: 'One-of-N panel switcher: clicking or arrow-keying a tab reveals the panel whose data-brut-panel matches the tab\'s data-brut-tab.',
  useCases: ['settings sections', 'product detail subviews', 'log/console panels', 'docs subsections', 'wizard or report views'],
  kind: 'interactive',
  class: '.brut-tabs',
  selector: '[data-brut="tabs"]',
  modifiers: [
    { name: '.brut-tab--on', description: 'Active state on the currently selected tab button' },
  ],
  dataAttributes: [
    { name: 'data-brut-tab',    values: 'string', description: 'Per-tab key; matched against panels\' data-brut-panel' },
    { name: 'data-brut-panel',  values: 'string', description: 'Per-panel key; the panel whose key matches the active tab is shown, others receive the hidden attribute' },
    { name: 'data-brut-panels', values: 'CSS selector', description: 'Optional root in which to look up panels; defaults to the tablist\'s parent element' },
  ],
  events: [
    { name: 'brut:change', detail: { value: 'string (data-brut-tab of the active tab)' } },
  ],
  formState: { hiddenInput: false },
  a11y: {
    role: 'tablist with role="tab" on each trigger',
    keyboard: ['ArrowLeft', 'ArrowRight', 'Home', 'End'],
    aria: ['aria-selected (per tab)', 'tabindex (roving)'],
    notes: 'WAI-ARIA tabs pattern with roving tabindex and arrow-key wrap. Panels are hidden via the native [hidden] attribute, so they are removed from layout and the accessibility tree.',
  },
  examples: [
    {
      title: 'Default — three tabs, sibling panels',
      html: '<div class="brut-tabs" data-brut="tabs">\n  <button class="brut-tab brut-tab--on" data-brut-tab="overview">OVERVIEW</button>\n  <button class="brut-tab" data-brut-tab="specs">SPECS</button>\n  <button class="brut-tab" data-brut-tab="reviews">REVIEWS</button>\n</div>\n<div data-brut-panel="overview">Overview content</div>\n<div data-brut-panel="specs" hidden>Specs content</div>\n<div data-brut-panel="reviews" hidden>Reviews content</div>',
    },
    {
      title: 'Panels scoped via data-brut-panels',
      html: '<div class="brut-tabs" data-brut="tabs" data-brut-panels="#detail-panels">\n  <button class="brut-tab brut-tab--on" data-brut-tab="info">INFO</button>\n  <button class="brut-tab" data-brut-tab="logs">LOGS</button>\n</div>\n<div id="detail-panels">\n  <section data-brut-panel="info">Info</section>\n  <section data-brut-panel="logs" hidden>Logs</section>\n</div>',
    },
  ],
};
