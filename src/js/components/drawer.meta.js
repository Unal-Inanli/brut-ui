export default {
  name: 'drawer',
  description: 'Side sheet that slides in from any edge, opened by external triggers with optional scrim and escape-to-close.',
  useCases: ['cart panel', 'mobile navigation', 'filter panel', 'detail inspector', 'notifications drawer'],
  kind: 'interactive',
  class: '.brut-drawer',
  selector: '[data-brut="drawer"]',
  modifiers: ['--right', '--left', '--top', '--bottom', '--open'],
  dataAttributes: [
    { name: 'data-brut-side', values: '"right" | "left" | "top" | "bottom" (default "right")', description: 'Edge the drawer slides from; auto-applied as a .brut-drawer--<side> class if missing' },
    { name: 'data-brut-scrim', values: 'id of a .brut-scrim element', description: 'Optional sibling scrim toggled in lockstep with the drawer' },
    { name: 'data-brut-open', values: 'id of a [data-brut="drawer"] (on a trigger)', description: 'Click target that opens the drawer with the matching id' },
    { name: 'data-brut-close', values: 'boolean attribute (on a child)', description: 'Marks any element inside the drawer as a close trigger' },
  ],
  events: [
    { name: 'brut:open', detail: { value: 'undefined' } },
    { name: 'brut:close', detail: { value: 'undefined' } },
  ],
  formState: { hiddenInput: false },
  a11y: {
    role: 'dialog',
    keyboard: ['Escape'],
    aria: ['aria-label (consumer-supplied)'],
    notes: 'Forces a layout flush before adding --open so the slide transition runs from the closed transform. The drawer id is required — components without an id are skipped.',
  },
  examples: [
    {
      title: 'Right drawer',
      html: '<button class="brut-btn brut-btn--primary" type="button" data-brut-open="dr-right">RIGHT DRAWER</button>\n<div class="brut-scrim" id="dr-right-scrim" hidden></div>\n<div class="brut-drawer" id="dr-right" data-brut="drawer" data-brut-side="right" data-brut-scrim="dr-right-scrim" hidden role="dialog" aria-label="Right drawer">\n  <div class="brut-drawer__head">\n    <span>RIGHT DRAWER</span>\n    <button class="brut-drawer__x" data-brut-close type="button" aria-label="Close">&times;</button>\n  </div>\n  <div class="brut-drawer__body">\n    <p>This drawer slides in from the right edge.</p>\n  </div>\n</div>',
    },
    {
      title: 'Bottom sheet',
      html: '<button class="brut-btn" type="button" data-brut-open="dr-bottom">BOTTOM DRAWER</button>\n<div class="brut-scrim" id="dr-bottom-scrim" hidden></div>\n<div class="brut-drawer" id="dr-bottom" data-brut="drawer" data-brut-side="bottom" data-brut-scrim="dr-bottom-scrim" hidden role="dialog" aria-label="Bottom drawer">\n  <div class="brut-drawer__head">\n    <span>BOTTOM DRAWER</span>\n    <button class="brut-drawer__x" data-brut-close type="button" aria-label="Close">&times;</button>\n  </div>\n  <div class="brut-drawer__body">\n    <p>Bottom drawer is full-width and clamped to 80vh.</p>\n  </div>\n</div>',
    },
  ],
  responsive: {
    shape: 'bottom-sheet',
    breakpoint: 'sm',
    notes: 'Left/right drawers re-anchor to bottom edge on phones; anchored side at sm and above.',
  },
};
