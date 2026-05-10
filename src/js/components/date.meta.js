export default {
  name: 'date',
  description: 'Text field paired with a popover calendar; selecting a day writes ISO YYYY-MM-DD into the visible field and a hidden mirror.',
  useCases: ['due date picker', 'birthday field', 'reservation date', 'event scheduling', 'expiry date input'],
  kind: 'interactive',
  status: 'beta',
  class: '.brut-date',
  selector: '[data-brut="date"]',
  modifiers: ['--open'],
  dataAttributes: [
    { name: 'data-brut-name', values: 'string', description: 'Name for the auto-injected hidden input when one is not supplied in markup' },
    { name: 'data-brut-min', values: 'ISO date string (YYYY-MM-DD), or empty for unconstrained', description: 'Earliest selectable date. Days before this are disabled.' },
    { name: 'data-brut-max', values: 'ISO date string (YYYY-MM-DD), or empty for unconstrained', description: 'Latest selectable date. Days after this are disabled.' },
  ],
  events: [
    { name: 'brut:change', detail: { value: 'string (ISO YYYY-MM-DD)' } },
  ],
  formState: { hiddenInput: true, name: 'Hidden input is created automatically when data-brut-name is set; otherwise consumer supplies <input type="hidden">' },
  a11y: {
    role: 'combobox (on the field); grid (on the day grid); gridcell (on each day)',
    keyboard: ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Enter', 'Escape', 'PageUp', 'PageDown'],
    aria: ['aria-haspopup="dialog"', 'aria-expanded', 'aria-label (on prev/next nav buttons)'],
    notes: 'Week starts on Monday. Outside-month days are rendered but visually muted via --out. Outside-click closes the popover. PageUp/PageDown shift the visible month and clamp the focused day to the new month\'s last day. At init, any descendant numeric segment inputs (input[type="number"], .brut-date__year, .brut-date__month, .brut-date__day) receive inputmode="numeric" by default — guarded so consumer-set values win — so touch keyboards open in numeric mode.',
  },
  examples: [
    {
      title: 'Empty due date',
      html: '<div class="brut-date" data-brut="date" data-brut-name="due">\n  <input class="brut-input brut-date__field" type="text" readonly placeholder="YYYY-MM-DD" />\n  <input type="hidden" />\n</div>',
    },
    {
      title: 'Pre-filled value',
      html: '<div class="brut-date" data-brut="date" data-brut-name="start">\n  <input class="brut-input brut-date__field" type="text" readonly value="2026-05-15" />\n  <input type="hidden" />\n</div>',
    },
  ],
  responsive: {
    shape: 'bottom-sheet',
    breakpoint: 'sm',
    notes: 'Calendar popover docks to bottom edge on phones; anchored at sm and above.',
  },
};
