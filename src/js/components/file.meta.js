export default {
  name: 'file',
  description: 'File picker that wraps a hidden <input type="file"> with a visible button and live filename label.',
  useCases: ['avatar upload', 'resume upload', 'attachment picker', 'image import', 'document submission'],
  kind: 'interactive',
  status: 'stable',
  class: '.brut-file',
  selector: '[data-brut="file"]',
  modifiers: [],
  dataAttributes: [
    { name: 'data-brut-accept-label', description: 'Optional human-readable hint describing accepted file types or constraints (e.g. "PNG or JPG, up to 5MB"). Rendered into a visually-hidden description element and wired to the input via aria-describedby. Falls back to a generic "Accepted: <accept>" derived from the native accept attribute when omitted.' },
  ],
  events: [
    { name: 'brut:change', detail: { value: 'FileList (the selected files)', files: 'FileList (the selected files)' } },
  ],
  formState: { hiddenInput: false, name: 'submits via the wrapped native <input type="file">' },
  a11y: {
    role: null,
    keyboard: ['Tab', 'Space', 'Enter'],
    aria: ['aria-live (polite, on selection announcement region)', 'aria-describedby (on input, points at the hidden accept-label hint)'],
    notes: 'Uses a real <label> wrapping the native file input, so click, focus, and keyboard activation are inherited from the browser. The visible button is purely decorative. On init, the component appends a visually-hidden aria-live="polite" region that announces the selected filename(s) after each change. If data-brut-accept-label is set on the wrapper (or the input has an accept attribute), a visually-hidden description is appended and referenced via aria-describedby so screen reader users can discover the file-type constraint before opening the picker.',
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
