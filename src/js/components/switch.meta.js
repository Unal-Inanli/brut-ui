export default {
  name: 'switch',
  description: 'Boolean toggle backed by a hidden <input type="checkbox"> that posts with the surrounding form; click and Space/Enter both flip state.',
  useCases: ['settings toggle', 'feature flag', 'notification opt-in', 'dark mode switch', 'inline form boolean'],
  kind: 'interactive',
  class: '.brut-switch',
  selector: '[data-brut="switch"]',
  modifiers: [
    { name: '.brut-switch--on', description: 'On state; mirrors the inner checkbox\'s checked property' },
  ],
  dataAttributes: [],
  events: [
    { name: 'brut:change', detail: { value: 'boolean (true when on)' } },
  ],
  formState: { hiddenInput: true, name: 'inner <input type="checkbox" hidden> is the source of truth and posts with the form' },
  a11y: {
    role: 'switch',
    keyboard: ['Space', 'Enter'],
    aria: ['aria-checked'],
    notes: 'The wrapper is a <label> but its native click-forwards to the inner checkbox is intercepted to prevent double-toggling. Native checkbox change events also fire, so existing form handlers continue to work.',
  },
  examples: [
    {
      title: 'Default — off',
      html: '<label class="brut-switch" data-brut="switch">\n  <input type="checkbox" hidden>\n  <span class="brut-switch__knob"></span>\n</label>',
    },
    {
      title: 'Default — on',
      html: '<label class="brut-switch brut-switch--on" data-brut="switch">\n  <input type="checkbox" checked hidden>\n  <span class="brut-switch__knob"></span>\n</label>',
    },
    {
      title: 'Form-bound with name',
      html: '<label class="brut-switch" data-brut="switch">\n  <input type="checkbox" name="notifications" hidden>\n  <span class="brut-switch__knob"></span>\n</label>',
    },
  ],
  responsive: {
    shape: 'static',
    notes: 'Form control; no viewport flip.',
  },
};
