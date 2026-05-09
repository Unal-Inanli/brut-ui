export default {
  name: 'dialog',
  description: 'Modal dialog wired to external open triggers with optional scrim, escape-to-close, and any [data-brut-close] inside.',
  useCases: ['delete confirmation', 'keyboard shortcut help', 'login prompt', 'settings modal', 'destructive action confirmation'],
  kind: 'interactive',
  status: 'stable',
  class: '.brut-dialog',
  selector: '[data-brut="dialog"]',
  modifiers: [],
  dataAttributes: [
    { name: 'data-brut-scrim', values: 'id of a .brut-scrim element', description: 'Optional sibling scrim toggled in lockstep with the dialog' },
    { name: 'data-brut-open', values: 'id of a [data-brut="dialog"] (on a trigger)', description: 'Click target that opens the dialog with the matching id' },
    { name: 'data-brut-close', values: 'boolean attribute (on a child)', description: 'Marks any element inside the dialog as a close trigger' },
    { name: 'data-brut-dialog-title', values: 'boolean attribute (on a child)', description: 'Optional override marking the element to wire as aria-labelledby when no h1–h6 is present in .brut-dialog__head' },
  ],
  events: [
    { name: 'brut:open', detail: { value: 'undefined' } },
    { name: 'brut:close', detail: { value: 'undefined' } },
  ],
  formState: { hiddenInput: false },
  a11y: {
    role: 'dialog',
    keyboard: ['Escape', 'Tab', 'Shift+Tab'],
    aria: ['aria-modal="true"', 'aria-labelledby'],
    notes: 'Toggles the [hidden] attribute rather than display:none, and toggles aria-modal="true" in lockstep with open/close. On init, if the dialog has neither aria-labelledby nor aria-label, the component wires aria-labelledby to the first heading (h1–h6 or [data-brut-dialog-title]) inside .brut-dialog__head, auto-assigning an id when needed. Scrim closes only on direct click (not on bubbling from inner content). Body scroll is locked while the dialog is open via Brut.scrollLock (reference-counted so nested overlays unlock only when the last one closes). On open, focus moves into the dialog (first focusable child, or the dialog itself if none) and Tab/Shift+Tab cycle within it via Brut.focusTrap; on close, focus returns to the element that triggered the open. The dialog id is required — components without an id are skipped.',
  },
  examples: [
    {
      title: 'Confirm dialog with scrim',
      html: '<button class="brut-btn" data-brut-open="dlg-confirm">Open confirm</button>\n<div class="brut-scrim" id="dlg-confirm-scrim" hidden></div>\n<div class="brut-dialog" id="dlg-confirm" data-brut="dialog" data-brut-scrim="dlg-confirm-scrim" hidden role="dialog" aria-modal="true" aria-labelledby="dlg-confirm-title">\n  <div class="brut-dialog__head">\n    <span id="dlg-confirm-title">DELETE PROJECT?</span>\n    <button class="brut-dialog__x" data-brut-close>×</button>\n  </div>\n  <div class="brut-dialog__body">\n    This nukes <strong>project-alpha</strong> and all its history.\n  </div>\n  <div class="brut-dialog__foot">\n    <button class="brut-btn" data-brut-close>Cancel</button>\n    <button class="brut-btn brut-btn--ink" data-brut-close>Yes, delete</button>\n  </div>\n</div>',
    },
  ],
  responsive: {
    shape: 'fullscreen-modal',
    breakpoint: 'sm',
    notes: 'Edge-to-edge sheet on phones; centered modal at sm and above.',
  },
};
