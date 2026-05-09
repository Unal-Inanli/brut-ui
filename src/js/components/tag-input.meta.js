export default {
  name: 'tag-input',
  description: 'Chip-entry field. Enter or comma commits a tag, Backspace at empty input removes the last, and each chip has an x button to delete itself.',
  useCases: ['email recipients', 'topic tagging', 'skills picker', 'label editor on issue trackers', 'keyword filter input'],
  kind: 'interactive',
  class: '.brut-tag-input',
  selector: '[data-brut="tag-input"]',
  modifiers: [],
  dataAttributes: [
    { name: 'data-brut-name', values: 'string (default "tags")', description: 'Name attribute for the auto-created hidden input that mirrors comma-joined tag values' },
    { name: 'data-value',     values: 'string',                  description: 'Set on each .brut-tag chip to provide the canonical tag value; falls back to chip textContent' },
  ],
  events: [
    { name: 'brut:change', detail: { value: 'string[] (current tag values)', tags: 'string[] (current tag values)' } },
  ],
  formState: { hiddenInput: true, name: 'Auto-creates <input type="hidden"> with comma-joined values; name is data-brut-name or "tags"' },
  a11y: {
    role: 'group (implicit via wrapping element)',
    keyboard: ['Enter (commit)', ',', 'Backspace (when input empty, removes last)'],
    aria: [],
    notes: 'Duplicate values are silently rejected. On blur with non-empty input the pending value is committed. Clicking the wrapper outside the field focuses the field.',
  },
  examples: [
    {
      title: 'Empty field',
      html: '<div class="brut-field" style="max-width:520px;">\n  <label class="brut-field__label">Topics</label>\n  <div class="brut-tag-input" data-brut="tag-input" data-brut-name="topics">\n    <input class="brut-tag-input__field" placeholder="Add a topic…">\n  </div>\n  <span class="brut-field__hint">Press Enter or comma to add.</span>\n</div>',
    },
    {
      title: 'Pre-populated chips',
      html: '<div class="brut-tag-input" data-brut="tag-input" data-brut-name="skills">\n  <span class="brut-tag" data-value="css">CSS <button class="brut-tag__x">×</button></span>\n  <span class="brut-tag" data-value="js">JavaScript <button class="brut-tag__x">×</button></span>\n  <span class="brut-tag" data-value="ux">UX <button class="brut-tag__x">×</button></span>\n  <input class="brut-tag-input__field" placeholder="Add a skill…">\n</div>',
    },
    {
      title: 'Many tags with custom name',
      html: '<div class="brut-tag-input" data-brut="tag-input" data-brut-name="labels">\n  <span class="brut-tag" data-value="bug">bug <button class="brut-tag__x">×</button></span>\n  <span class="brut-tag" data-value="feature">feature <button class="brut-tag__x">×</button></span>\n  <span class="brut-tag" data-value="docs">docs <button class="brut-tag__x">×</button></span>\n  <input class="brut-tag-input__field" placeholder="Add a label…">\n</div>',
    },
  ],
};
