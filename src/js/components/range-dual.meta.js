export default {
  name: 'range-dual',
  description: 'Two-thumb range slider that emits a min/max pair, with pointer drag, click-to-jump on the track, and keyboard nudging.',
  useCases: ['price filter', 'budget range', 'date or year window', 'numeric histogram filter', 'duration bracket'],
  kind: 'interactive',
  class: '.brut-range-dual',
  selector: '[data-brut="range-dual"]',
  modifiers: [],
  dataAttributes: [
    { name: 'data-brut-min',        values: 'number (default 0)',   description: 'Lower bound of the slider' },
    { name: 'data-brut-max',        values: 'number (default 100)', description: 'Upper bound of the slider' },
    { name: 'data-brut-step',       values: 'number (default 1)',   description: 'Snap increment for thumbs and keyboard' },
    { name: 'data-brut-value-min',  values: 'number',               description: 'Initial position of the lower thumb' },
    { name: 'data-brut-value-max',  values: 'number',               description: 'Initial position of the upper thumb' },
    { name: 'data-brut-name-min',   values: 'string',               description: 'Form name for the auto-created hidden input mirroring the lower value' },
    { name: 'data-brut-name-max',   values: 'string',               description: 'Form name for the auto-created hidden input mirroring the upper value' },
  ],
  events: [
    { name: 'brut:change', detail: { value: '{ min: number, max: number }' } },
  ],
  formState: { hiddenInput: true, name: 'two hidden inputs created when data-brut-name-min / data-brut-name-max are set' },
  a11y: {
    role: 'slider (one per thumb)',
    keyboard: ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End'],
    aria: ['aria-label (per thumb)', 'aria-valuemin', 'aria-valuemax', 'aria-valuenow'],
    notes: 'The lower thumb is clamped at the upper thumb and vice versa via aria-valuemin/aria-valuemax. PageUp/PageDown move by 10× step. Home/End collapse to the opposite thumb or to min/max.',
  },
  examples: [
    {
      title: 'Default — 0 to 100, step 1',
      html: '<div class="brut-range-dual"\n     data-brut="range-dual"\n     data-brut-min="0" data-brut-max="100" data-brut-step="1"\n     data-brut-value-min="20" data-brut-value-max="80"\n     data-brut-name-min="price_min" data-brut-name-max="price_max"></div>',
    },
    {
      title: 'Coarse step (5) over a wider range',
      html: '<div class="brut-range-dual"\n     data-brut="range-dual"\n     data-brut-min="0" data-brut-max="500" data-brut-step="5"\n     data-brut-value-min="100" data-brut-value-max="350"\n     data-brut-name-min="budget_min" data-brut-name-max="budget_max"></div>',
    },
    {
      title: 'Year window',
      html: '<div class="brut-range-dual"\n     data-brut="range-dual"\n     data-brut-min="2000" data-brut-max="2026" data-brut-step="1"\n     data-brut-value-min="2010" data-brut-value-max="2020"\n     data-brut-name-min="year_min" data-brut-name-max="year_max"></div>',
    },
  ],
  responsive: {
    shape: 'static',
    notes: 'Slider track stretches to its container at any tier.',
  },
};
