export default {
  name: 'dropzone',
  description: 'Drag-and-drop file region wrapping a hidden <input type="file">, with click-to-browse, keyboard activation, and a drag-over state class.',
  useCases: ['image upload', 'document attachment', 'asset import', 'avatar picker', 'bulk file upload form'],
  kind: 'interactive',
  status: 'stable',
  class: '.brut-dropzone',
  selector: '[data-brut="dropzone"]',
  modifiers: ['--drag'],
  dataAttributes: [],
  events: [
    { name: 'brut:change', detail: { value: 'FileList (the input.files reference after assignment)', files: 'FileList (the input.files reference after assignment)' } },
  ],
  formState: { hiddenInput: false, name: 'Wraps a real <input type="file"> — its name attribute carries the upload field on form submission' },
  a11y: {
    role: 'button',
    keyboard: ['Enter', 'Space'],
    aria: ['aria-label (auto-set from .brut-dropzone__hint text or "Choose files")'],
    notes: 'Sets role="button" and tabindex="0" if absent. Programmatic FileList assignment uses a DataTransfer to satisfy browsers that reject direct .files writes; the inner input also fires a native change event.',
  },
  examples: [
    {
      title: 'Single file',
      html: '<label class="brut-dropzone" data-brut="dropzone">\n  <input type="file" name="upload">\n  <span class="brut-dropzone__hint">Drop a file here.</span>\n  <span class="brut-dropzone__sub">Or click to browse.</span>\n</label>',
    },
    {
      title: 'Multiple files with accept filter',
      html: '<label class="brut-dropzone" data-brut="dropzone">\n  <input type="file" name="assets" multiple accept="image/*,.pdf">\n  <span class="brut-dropzone__hint">Drop images or PDFs here.</span>\n  <span class="brut-dropzone__sub">Or click to browse. Multiple allowed.</span>\n</label>',
    },
  ],
  responsive: {
    shape: 'static',
    notes: 'Drop target sizes to its container at any tier.',
  },
};
