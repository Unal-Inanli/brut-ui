export default {
  name: 'tooltip',
  description: 'Hover/focus-triggered ink bubble appended to <body> on show and removed on hide; positioned on one of four sides relative to the trigger.',
  useCases: ['button hint text', 'icon-only control labeling', 'truncated text on hover', 'form field helper hints', 'keyboard-shortcut reveal'],
  kind: 'interactive',
  class: '.brut-tip',
  selector: '[data-brut="tooltip"]',
  modifiers: [
    { name: '--top',    description: 'Bubble positioned above the trigger (default)' },
    { name: '--bottom', description: 'Bubble positioned below the trigger' },
    { name: '--left',   description: 'Bubble positioned to the left of the trigger' },
    { name: '--right',  description: 'Bubble positioned to the right of the trigger' },
  ],
  dataAttributes: [
    { name: 'data-brut-tip',      values: 'string',                                description: 'Required. The tooltip text shown in the bubble' },
    { name: 'data-brut-tip-side', values: '"top" (default) | "bottom" | "left" | "right"', description: 'Side of the trigger on which to render the bubble' },
  ],
  events: [],
  formState: { hiddenInput: false, name: 'Display-only — no form value' },
  a11y: {
    role: 'tooltip (on the bubble)',
    keyboard: ['focus to show', 'blur to hide', 'Escape to dismiss'],
    aria: ['role="tooltip"', 'aria-describedby (set on trigger while bubble is visible)'],
    notes: 'Trigger can be any element; if it is a <button> the script forces type="button". Bubble is created on show and removed on hide; only one bubble per trigger. Position is computed from getBoundingClientRect with an 8px gap. Position auto-flips to the opposite side when the preferred side would clip at the viewport edge.',
  },
  examples: [
    {
      title: 'Default top tooltip on a button',
      html: '<button class="brut-btn brut-btn--primary" type="button"\n        data-brut="tooltip" data-brut-tip="Saved at 12:04">SAVE</button>',
    },
    {
      title: 'Four sides',
      html: '<div class="row">\n  <button class="brut-btn" type="button" data-brut="tooltip" data-brut-tip="Top tooltip" data-brut-tip-side="top">TOP</button>\n  <button class="brut-btn" type="button" data-brut="tooltip" data-brut-tip="Bottom tooltip" data-brut-tip-side="bottom">BOTTOM</button>\n  <button class="brut-btn" type="button" data-brut="tooltip" data-brut-tip="Left tooltip" data-brut-tip-side="left">LEFT</button>\n  <button class="brut-btn" type="button" data-brut="tooltip" data-brut-tip="Right tooltip" data-brut-tip-side="right">RIGHT</button>\n</div>',
    },
    {
      title: 'On a focusable input',
      html: '<input class="brut-input" type="text" placeholder="Email"\n       data-brut="tooltip"\n       data-brut-tip="We never share email"\n       data-brut-tip-side="bottom" />',
    },
  ],
  responsive: {
    shape: 'hover-fallback',
    breakpoint: 'sm',
    notes: 'Hover-on-pointer; tap-to-pin on coarse pointer / phones.',
  },
};
