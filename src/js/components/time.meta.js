export default {
  name: 'time',
  description: 'Text-field combobox with a popover hour/minute stepper; emits HH:MM (24-hour ISO) with optional 12-hour AM/PM display and minute snapping.',
  useCases: ['meeting time picker', 'event scheduling form', 'doors-open input', 'reservation slot selector', 'availability range bound'],
  kind: 'interactive',
  status: 'stable',
  class: '.brut-time',
  selector: '[data-brut="time"]',
  modifiers: [
    { name: '--open', description: 'Applied while the popover is visible' },
  ],
  dataAttributes: [
    { name: 'data-brut-name',         values: 'string',                description: 'Name for the hidden input mirror; if absent, no hidden input is auto-created' },
    { name: 'data-brut-mode',         values: '"24" (default) | "12"', description: 'Display mode for the hour stepper; output is always 24-hour HH:MM' },
    { name: 'data-brut-minute-step',  values: 'integer (default 1)',   description: 'Minute snap interval; values not on the grid are rounded to the nearest step' },
  ],
  events: [
    { name: 'brut:change', detail: { value: 'string (HH:MM, 24-hour)', hour: 'integer 0-23', minute: 'integer 0-59' } },
  ],
  formState: { hiddenInput: true, name: 'Hidden input inside the wrapper carries HH:MM; auto-created when data-brut-name is set, otherwise an existing <input type="hidden"> is reused' },
  a11y: {
    role: 'combobox (on the visible field)',
    keyboard: ['ArrowDown / Enter (open)', 'Escape (close)', 'ArrowUp / ArrowDown (on stepper inputs)'],
    aria: ['role="combobox"', 'aria-haspopup="dialog"', 'aria-expanded', 'aria-label="HOUR"', 'aria-label="MIN"', 'aria-label on stepper buttons'],
    notes: 'Outside-click closes the popover. The visible field is readonly; values are committed via the steppers. In 12-hour mode an AM/PM segmented control toggles below the row.',
  },
  examples: [
    {
      title: '24-hour, populated',
      html: '<div class="brut-field">\n  <label class="brut-field__label">Meeting</label>\n  <div class="brut-time" data-brut="time" data-brut-name="meet">\n    <input class="brut-input brut-time__field" type="text" readonly value="09:30" />\n    <input type="hidden" />\n  </div>\n</div>',
    },
    {
      title: '12-hour with AM/PM',
      html: '<div class="brut-time" data-brut="time" data-brut-name="doors" data-brut-mode="12">\n  <input class="brut-input brut-time__field" type="text" readonly value="19:00" />\n  <input type="hidden" />\n</div>',
    },
    {
      title: '15-minute snap',
      html: '<div class="brut-time" data-brut="time" data-brut-name="slot" data-brut-minute-step="15">\n  <input class="brut-input brut-time__field" type="text" readonly value="14:00" />\n  <input type="hidden" />\n</div>',
    },
  ],
  responsive: {
    shape: 'bottom-sheet',
    breakpoint: 'sm',
    notes: 'Time picker docks to bottom edge on phones; anchored at sm and above.',
  },
};
