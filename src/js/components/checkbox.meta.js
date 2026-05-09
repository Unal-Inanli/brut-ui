export default {
  name: 'checkbox',
  description: 'Visual checkbox label whose checked state is mirrored by an inner hidden <input type="checkbox">.',
  useCases: ['form consent', 'multi-select filter list', 'task completion toggle', 'settings toggles', 'table row selection'],
  kind: 'interactive',
  status: 'stable',
  class: '.brut-checkbox',
  selector: '[data-brut="checkbox"]',
  modifiers: ['--on'],
  dataAttributes: [],
  events: [
    { name: 'brut:change', detail: { value: 'boolean (current checked state)', checked: 'boolean (current checked state)' } },
  ],
  formState: { hiddenInput: true, name: 'Wraps a real <input type="checkbox" hidden> which carries name/value for native form submission' },
  a11y: {
    role: 'checkbox',
    keyboard: ['Space', 'Enter'],
    aria: ['aria-checked'],
    notes: 'Suppresses the native <label> click so the inner input toggles exactly once. Works without an inner input by toggling the .brut-checkbox--on class directly.',
  },
  examples: [
    {
      title: 'Checked and unchecked',
      html: '<label class="brut-checkbox" data-brut="checkbox"><input type="checkbox" hidden checked/></label>\n<label class="brut-checkbox" data-brut="checkbox"><input type="checkbox" hidden/></label>',
    },
    {
      title: 'With form name',
      html: '<label class="brut-checkbox" data-brut="checkbox">\n  <input type="checkbox" name="agree" value="yes" hidden/>\n</label>',
    },
  ],
  responsive: {
    shape: 'static',
    notes: 'Form control; lays out with its parent at any tier.',
  },
};
