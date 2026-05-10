export default {
  name: 'field',
  description: 'Form-field wrapper that mirrors .brut-field--invalid / .brut-field--valid modifier classes onto the child input as aria-invalid so screen readers announce validation state.',
  useCases: ['form validation', 'inline error messaging', 'success state', 'accessible field wrapper', 'WCAG 4.1.2'],
  kind: 'interactive',
  status: 'stable',
  class: '.brut-field',
  selector: '[data-brut="field"]',
  modifiers: ['--invalid', '--valid'],
  dataAttributes: [],
  events: [],
  formState: { hiddenInput: false },
  a11y: {
    role: '',
    keyboard: [],
    aria: ['aria-invalid (mirrored from .brut-field--invalid)'],
    notes: 'A global MutationObserver watches every .brut-field wrapper for class changes and sets aria-invalid="true" on the first descendant input/select/textarea when --invalid is present. The data-brut="field" hook is optional — the wrapper class alone triggers the observer.',
  },
  examples: [
    {
      title: 'Invalid state — error message + aria-invalid',
      html: '<div class="brut-field brut-field--invalid">\n  <label class="brut-field__label" for="email">Email</label>\n  <input id="email" class="brut-input" type="email" value="not-an-email">\n  <span class="brut-field__error">Invalid email address.</span>\n</div>',
    },
    {
      title: 'Valid state — success message',
      html: '<div class="brut-field brut-field--valid">\n  <label class="brut-field__label" for="username">Username</label>\n  <input id="username" class="brut-input" type="text" value="ada-lovelace">\n  <span class="brut-field__success">Username is available.</span>\n</div>',
    },
  ],
  responsive: {
    shape: 'static',
    notes: 'Wrapper is layout-neutral; no responsive flip.',
  },
};
