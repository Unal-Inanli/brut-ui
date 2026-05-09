export default {
  name: 'password',
  description: 'Password input with a SHOW/HIDE toggle button that flips the input type between password and text.',
  useCases: ['login form', 'sign-up form', 'change-password field', 'confirm-password field', 'API key entry'],
  kind: 'interactive',
  class: '.brut-password',
  selector: '[data-brut="password"]',
  modifiers: [],
  dataAttributes: [],
  events: [],
  formState: { hiddenInput: false, name: 'submits via the wrapped native <input> (type flips between "password" and "text")' },
  a11y: {
    role: null,
    keyboard: ['Tab', 'Space', 'Enter (on toggle button)'],
    aria: ['aria-label on toggle ("Show password" / "Hide password")', 'aria-pressed on toggle'],
    notes: 'Toggle button is forced to type="button" so it never submits the surrounding form. Label text and aria attributes update in sync with the visibility state.',
  },
  examples: [
    {
      title: 'Default (hidden)',
      html: '<div class="brut-password" data-brut="password">\n  <input class="brut-input" type="password" name="password" placeholder="Enter password…">\n  <button class="brut-password__toggle">SHOW</button>\n</div>',
    },
    {
      title: 'With initial value',
      html: '<div class="brut-password" data-brut="password">\n  <input class="brut-input" type="password" name="current" value="hunter2secret">\n  <button class="brut-password__toggle">SHOW</button>\n</div>',
    },
  ],
  responsive: {
    shape: 'static',
    notes: 'Form input; no viewport flip.',
  },
};
