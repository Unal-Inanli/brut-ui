export default {
  name: 'segmented',
  description: 'Exclusive choice button group that behaves like a horizontal radio set, with roving tabindex and arrow-key navigation.',
  useCases: ['view mode switcher (day / week / month)', 'unit toggle', 'filter scope picker', 'compact one-of-N selector', 'chart granularity control'],
  kind: 'interactive',
  class: '.brut-segmented',
  selector: '[data-brut="segmented"]',
  modifiers: [
    { name: '.brut-segmented__btn--on', description: 'Active state applied to the currently selected segment button' },
  ],
  dataAttributes: [
    { name: 'data-brut-name', values: 'string', description: 'Form name; when set, a hidden input is auto-created and synced to the active segment' },
    { name: 'data-value',     values: 'string', description: 'Per-button value; falls back to the button\'s text content when omitted' },
  ],
  events: [
    { name: 'brut:change', detail: { value: 'string (data-value of the selected segment, or its text content)' } },
  ],
  formState: { hiddenInput: true, name: 'hidden input created automatically when data-brut-name is set' },
  a11y: {
    role: 'tablist with role="tab" on each segment',
    keyboard: ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'],
    aria: ['aria-selected (per segment)', 'tabindex (roving)'],
    notes: 'Arrow keys wrap at both ends. Roving tabindex keeps exactly one segment focusable; activation moves focus to the new segment.',
  },
  examples: [
    {
      title: 'Default — three segments',
      html: '<div class="brut-segmented" data-brut="segmented">\n  <button class="brut-segmented__btn brut-segmented__btn--on" data-value="day">DAY</button>\n  <button class="brut-segmented__btn" data-value="week">WEEK</button>\n  <button class="brut-segmented__btn" data-value="month">MONTH</button>\n</div>',
    },
    {
      title: 'Form-bound (mirrors to a hidden input)',
      html: '<div class="brut-segmented" data-brut="segmented" data-brut-name="range">\n  <button class="brut-segmented__btn brut-segmented__btn--on" data-value="7d">7D</button>\n  <button class="brut-segmented__btn" data-value="30d">30D</button>\n  <button class="brut-segmented__btn" data-value="90d">90D</button>\n</div>',
    },
  ],
};
