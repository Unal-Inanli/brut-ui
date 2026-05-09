export default {
  name: 'file',
  description: 'File picker that wraps a hidden <input type="file"> with a visible button and live filename label.',
  useCases: ['avatar upload', 'resume upload', 'attachment picker', 'image import', 'document submission'],
  kind: 'interactive',
  class: '.brut-file',
  selector: '[data-brut="file"]',
  modifiers: [],
  dataAttributes: [],
  events: [
    { name: 'brut:change', detail: { value: 'FileList (the selected files)', files: 'FileList (the selected files)' } },
  ],
  formState: { hiddenInput: false, name: 'submits via the wrapped native <input type="file">' },
  a11y: {
    role: null,
    keyboard: ['Tab', 'Space', 'Enter'],
    aria: [],
    notes: 'Uses a real <label> wrapping the native file input, so click, focus, and keyboard activation are inherited from the browser. The visible button is purely decorative.',
  },
  examples: [
    {
      title: 'Single file',
      html: '<label class="brut-file" data-brut="file">\n  <input type="file" name="avatar" accept="image/*">\n  <span class="brut-file__btn">CHOOSE FILE</span>\n  <span class="brut-file__name">No file selected</span>\n</label>',
    },
    {
      title: 'Multiple files',
      html: '<label class="brut-file" data-brut="file">\n  <input type="file" name="attachments" multiple>\n  <span class="brut-file__btn">CHOOSE FILES</span>\n  <span class="brut-file__name">No file selected</span>\n</label>',
    },
  ],
  responsive: {
    shape: 'static',
    notes: 'Form file picker; no viewport flip.',
  },
};
