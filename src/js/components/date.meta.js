export default {
  name: 'date',
  description: 'Text field paired with a popover calendar; selecting a day writes ISO YYYY-MM-DD into the visible field and a hidden mirror.',
  useCases: ['due date picker', 'birthday field', 'reservation date', 'event scheduling', 'expiry date input'],
  kind: 'interactive',
  class: '.brut-date',
  selector: '[data-brut="date"]',
  modifiers: ['--open'],
  dataAttributes: [
    { name: 'data-brut-name', values: 'string', description: 'Name for the auto-injected hidden input when one is not supplied in markup' },
  ],
  events: [
    { name: 'brut:change', detail: { value: 'string (ISO YYYY-MM-DD)' } },
  ],
  formState: { hiddenInput: true, name: 'Hidden input is created automatically when data-brut-name is set; otherwise consumer supplies <input type="hidden">' },
  a11y: {
    role: 'combobox (on the field); grid (on the day grid); gridcell (on each day)',
    keyboard: ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Enter', 'Escape', 'PageUp', 'PageDown'],
    aria: ['aria-haspopup="dialog"', 'aria-expanded', 'aria-label (on prev/next nav buttons)'],
    notes: 'Week starts on Monday. Outside-month days are rendered but visually muted via --out. Outside-click closes the popover. PageUp/PageDown shift the visible month and clamp the focused day to the new month\'s last day.',
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
};
