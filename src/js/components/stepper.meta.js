export default {
  name: 'stepper',
  description: 'Numeric input flanked by minus / plus buttons; reads min, max, and step from the inner <input type="number"> and clamps to the step grid.',
  useCases: ['quantity selector', 'guest / passenger count', 'unit count in checkout', 'configurable numeric setting', 'paginated page size'],
  kind: 'interactive',
  class: '.brut-stepper',
  selector: '[data-brut="stepper"]',
  modifiers: [],
  dataAttributes: [
    { name: 'data-brut-step', values: '"up" | "down"', description: 'Direction hint on each button; falls back to first-button=down, second-button=up when omitted' },
  ],
  events: [
    { name: 'brut:change', detail: { value: 'number (current input value, parsed)' } },
  ],
  formState: { hiddenInput: false, name: 'the inner <input type="number"> is the canonical form value (no separate hidden input)' },
  a11y: {
    role: 'spinbutton (on the wrapper)',
    keyboard: ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown'],
    aria: ['aria-valuenow', 'aria-valuemin', 'aria-valuemax'],
    notes: 'PageUp / PageDown move by 10× step. Programmatic input updates suppress duplicate brut:change emissions while still bubbling native input/change. Out-of-range typed values are clamped and snapped to the step grid relative to min.',
  },
  examples: [
    {
      title: 'Default — 0 to 99, step 1',
      html: '<div class="brut-stepper" data-brut="stepper">\n  <button class="brut-stepper__btn" data-brut-step="down">−</button>\n  <input class="brut-stepper__input" type="number" min="0" max="99" step="1" value="0">\n  <button class="brut-stepper__btn" data-brut-step="up">+</button>\n</div>',
    },
    {
      title: 'Coarse step (5) over 0–100',
      html: '<div class="brut-stepper" data-brut="stepper">\n  <button class="brut-stepper__btn" data-brut-step="down">−</button>\n  <input class="brut-stepper__input" type="number" min="0" max="100" step="5" value="25">\n  <button class="brut-stepper__btn" data-brut-step="up">+</button>\n</div>',
    },
    {
      title: 'Decimal step',
      html: '<div class="brut-stepper" data-brut="stepper">\n  <button class="brut-stepper__btn" data-brut-step="down">−</button>\n  <input class="brut-stepper__input" type="number" min="0" max="5" step="0.1" value="1.0">\n  <button class="brut-stepper__btn" data-brut-step="up">+</button>\n</div>',
    },
  ],
};
