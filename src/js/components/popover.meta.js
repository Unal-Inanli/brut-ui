export default {
  name: 'popover',
  description: 'Trigger-anchored card with optional head bar, dismissed by click-outside, Escape, or any [data-brut-close] inside.',
  useCases: ['filter panel', 'inline help', 'quick-edit form', 'detail card', 'tooltip-style content'],
  kind: 'interactive',
  class: '.brut-popover',
  selector: '[data-brut="popover"]',
  modifiers: [],
  dataAttributes: [
    { name: 'data-brut-popover-open', values: 'id of the target .brut-popover', description: 'On a trigger element; clicking it toggles the matching popover' },
    { name: 'data-brut-close',         values: 'boolean attribute',              description: 'On any element inside the popover; clicking it closes the popover' },
  ],
  events: [
    { name: 'brut:open',  detail: {} },
    { name: 'brut:close', detail: {} },
  ],
  formState: { hiddenInput: false },
  a11y: {
    role: 'dialog',
    keyboard: ['Escape (close)'],
    aria: ['role="dialog"', 'aria-haspopup="dialog"', 'aria-expanded', 'aria-controls', 'aria-label on .brut-popover__x close button'],
    notes: 'Trigger gets type="button" automatically and is wired with aria-haspopup="dialog", aria-expanded, and aria-controls pointing at the popover id (auto-generated if missing). The popover element gets role="dialog" unless the consumer set a different role. Click outside or pressing Escape closes the popover. Position recomputes on window resize and capture-phase scroll so it stays anchored to the trigger.',
  },
  examples: [
    {
      title: 'Trigger + popover with head',
      html: '<button class="brut-btn brut-btn--primary" type="button" data-brut-popover-open="po-filters">FILTERS</button>\n<div class="brut-popover" id="po-filters" data-brut="popover" hidden>\n  <div class="brut-popover__head">\n    <span>Filters</span>\n    <button class="brut-popover__x" type="button" data-brut-close aria-label="Close">&times;</button>\n  </div>\n  <div class="brut-popover__body">\n    <label class="brut-checkbox"><input type="checkbox"/><span>Active</span></label>\n    <label class="brut-checkbox"><input type="checkbox"/><span>Archived</span></label>\n    <label class="brut-checkbox"><input type="checkbox"/><span>Pending</span></label>\n  </div>\n</div>',
    },
    {
      title: 'Plain body, no head',
      html: '<button class="brut-btn" type="button" data-brut-popover-open="po-info">WHAT IS THIS?</button>\n<div class="brut-popover" id="po-info" data-brut="popover" hidden>\n  <div class="brut-popover__body">\n    A popover is a small anchored card. Click the trigger again, click outside, or press Esc to close.\n  </div>\n</div>',
    },
  ],
  responsive: {
    shape: 'bottom-sheet',
    breakpoint: 'sm',
    notes: 'Bottom-sheet on phones; anchored to trigger at sm and above.',
  },
};
