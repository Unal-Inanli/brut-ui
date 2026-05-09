export default {
  name: 'radio',
  description: 'Visual radio control synced to an inner hidden <input type="radio">, grouped by name, with Space/Enter activation.',
  useCases: ['size picker', 'plan selector', 'one-of-N option', 'survey question', 'shipping method'],
  kind: 'interactive',
  status: 'stable',
  class: '.brut-radio',
  selector: '[data-brut="radio"]',
  modifiers: [
    { name: '.brut-radio--on', description: 'Checked visual state (toggled in sync with the underlying input)' },
  ],
  dataAttributes: [
    { name: 'data-brut-name', values: 'string', description: 'Optional group name when there is no inner radio input; siblings sharing this name behave as one group' },
    { name: 'data-value',     values: 'string', description: 'Value emitted in brut:change when there is no inner radio input' },
  ],
  events: [
    { name: 'brut:change', detail: { value: 'string (selected radio value)' } },
  ],
  formState: { hiddenInput: false, name: 'submits via the wrapped native <input type="radio">' },
  a11y: {
    role: 'radio',
    keyboard: ['Space', 'Enter'],
    aria: ['aria-checked'],
    notes: 'role="radio" and tabindex="0" are set on init. Native <input type="radio"> change events keep all siblings in the same group visually in sync, so labels, click, and form reset all behave correctly.',
  },
  examples: [
    {
      title: 'Size group',
      html: '<label class="brut-radio brut-radio--on" data-brut="radio">\n  <input type="radio" name="size" value="md" hidden checked/>\n</label>\n<label class="brut-radio" data-brut="radio">\n  <input type="radio" name="size" value="lg" hidden/>\n</label>',
    },
  ],
  responsive: {
    shape: 'static',
    notes: 'Form control; lays out with its parent at any tier.',
  },
};
