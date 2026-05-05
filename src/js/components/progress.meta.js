export default {
  name: 'progress',
  description: 'Determinate or indeterminate horizontal progress bar driven by a CSS --progress variable, with a JS API for live updates.',
  useCases: ['file upload progress', 'multi-step form completion', 'background job status', 'media buffering', 'onboarding completion'],
  kind: 'interactive',
  class: '.brut-progress',
  selector: '[data-brut="progress"]',
  modifiers: [
    { name: '.brut-progress--sm',            description: 'Smaller bar height' },
    { name: '.brut-progress--lg',            description: 'Larger bar height' },
    { name: '.brut-progress--success',       description: 'Success color fill' },
    { name: '.brut-progress--danger',        description: 'Danger color fill' },
    { name: '.brut-progress--info',          description: 'Info color fill' },
    { name: '.brut-progress--warning',       description: 'Warning color fill' },
    { name: '.brut-progress--indeterminate', description: 'Animated indeterminate stripe (no value)' },
  ],
  dataAttributes: [
    { name: 'data-brut-value', values: 'number 0–100 (default 0)', description: 'Initial progress value; mirrored to aria-valuenow and the --progress CSS variable' },
  ],
  events: [
    { name: 'brut:change', detail: { value: 'number 0–100 (current value, bubbles)' } },
  ],
  formState: { hiddenInput: false },
  a11y: {
    role: 'progressbar',
    keyboard: [],
    aria: ['aria-valuemin="0"', 'aria-valuemax="100"', 'aria-valuenow (kept in sync with current value)', 'aria-label (author-supplied)'],
    notes: 'role and aria-valuemin/max are set on init. Use el.brutProgress.setValue(n) and el.brutProgress.getValue() for programmatic updates. The optional .brut-progress__label text is updated to the rounded percentage on every setValue.',
  },
  examples: [
    {
      title: 'Static determinate (CSS-only via --progress)',
      html: '<div class="brut-progress" style="--progress: 50" aria-label="50%">\n  <div class="brut-progress__bar"></div>\n</div>',
    },
    {
      title: 'JS-driven with label',
      html: '<div class="brut-progress brut-progress--lg" data-brut="progress" data-brut-value="40" aria-label="Progress">\n  <div class="brut-progress__bar"></div>\n  <span class="brut-progress__label"></span>\n</div>',
    },
    {
      title: 'Indeterminate',
      html: '<div class="brut-progress brut-progress--indeterminate" aria-label="Loading…">\n  <div class="brut-progress__bar"></div>\n</div>',
    },
  ],
};
