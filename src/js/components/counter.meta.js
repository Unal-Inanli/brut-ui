export default {
  name: 'counter',
  description: 'Live character counter that mirrors the length of a paired input or textarea and flags overflow.',
  useCases: ['textarea character limit', 'tweet-style composer', 'bio field', 'comment box helper', 'SMS message length hint'],
  kind: 'interactive',
  class: '.brut-field__counter',
  selector: '[data-brut="counter"]',
  modifiers: ['--over'],
  dataAttributes: [
    { name: 'data-brut-for', values: 'id of an <input> or <textarea>', description: 'Required — id of the element whose value length is counted' },
    { name: 'data-brut-max', values: 'integer', description: 'Optional fallback maximum when the target has no maxlength attribute' },
  ],
  events: [
    { name: 'brut:change', detail: { value: 'integer (current character count)', max: 'integer (0 when no max is set)', over: 'boolean (true when value > max and max is set)' } },
  ],
  formState: { hiddenInput: false },
  a11y: {
    keyboard: [],
    notes: 'Read-only indicator; not focusable. Pair the target input with an aria-describedby pointing at the counter element if the count should be announced.',
  },
  examples: [
    {
      title: 'Textarea with maxlength',
      html: '<label class="brut-field__label" for="bio">Bio</label>\n<textarea id="bio" class="brut-textarea" maxlength="120">Make it loud.</textarea>\n<span class="brut-field__counter" data-brut="counter" data-brut-for="bio"></span>',
    },
    {
      title: 'Override max via data attribute',
      html: '<input id="title" class="brut-input" type="text">\n<span class="brut-field__counter" data-brut="counter" data-brut-for="title" data-brut-max="60"></span>',
    },
  ],
  responsive: {
    shape: 'static',
    notes: 'Inline character/word count; no responsive flip.',
  },
};
