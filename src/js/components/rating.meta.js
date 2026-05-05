export default {
  name: 'rating',
  description: 'Row of 1–N star buttons that records an integer score, with hover preview, click-to-toggle, and full keyboard control.',
  useCases: ['product rating', 'review score', 'feedback survey', 'satisfaction prompt', 'quality scoring'],
  kind: 'interactive',
  class: '.brut-rating',
  selector: '[data-brut="rating"]',
  modifiers: [
    { name: '.brut-rating__star--on', description: 'Filled state applied to stars at or below the current value' },
  ],
  dataAttributes: [
    { name: 'data-brut-name',  values: 'string', description: 'Form name; when set, a hidden input is auto-created and synced' },
    { name: 'data-brut-value', values: 'integer (default 0)', description: 'Initial score; clamped to 0..N where N is the star count' },
  ],
  events: [
    { name: 'brut:change', detail: { value: 'integer (current score, 0..N)' } },
  ],
  formState: { hiddenInput: true, name: 'hidden input created automatically when data-brut-name is set' },
  a11y: {
    role: 'slider (wrapper) with role="radio" on each star',
    keyboard: ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'],
    aria: ['aria-valuemin', 'aria-valuemax', 'aria-valuenow', 'aria-checked (per star)'],
    notes: 'Wrapper is the focusable target with tabindex="0". Hover and focus on individual stars preview the score; mouseleave/focusout repaint the locked value. Clicking the active star clears the score (toggle to 0).',
  },
  examples: [
    {
      title: 'Empty (no selection)',
      html: '<div class="brut-rating" data-brut="rating" data-brut-name="score" data-brut-value="0">\n  <button class="brut-rating__star"></button>\n  <button class="brut-rating__star"></button>\n  <button class="brut-rating__star"></button>\n  <button class="brut-rating__star"></button>\n  <button class="brut-rating__star"></button>\n</div>',
    },
    {
      title: 'Pre-selected (3 of 5)',
      html: '<div class="brut-rating" data-brut="rating" data-brut-name="quality" data-brut-value="3">\n  <button class="brut-rating__star"></button>\n  <button class="brut-rating__star"></button>\n  <button class="brut-rating__star"></button>\n  <button class="brut-rating__star"></button>\n  <button class="brut-rating__star"></button>\n</div>',
    },
  ],
};
