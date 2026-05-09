export default {
  name: 'copy',
  description: 'Inline value + button pair that copies the value to the clipboard, flashes a confirmation label, and announces the action to assistive tech.',
  useCases: ['API key reveal', 'share URL', 'install command snippet', 'token / hash display', 'invoice or order ID'],
  kind: 'interactive',
  status: 'experimental',
  class: '.brut-copy',
  selector: '[data-brut="copy"]',
  modifiers: [],
  dataAttributes: [
    { name: 'data-brut-value',          values: 'string',                                 description: 'Optional override for the value to copy when no .brut-copy__value child is present (or when its text is empty)' },
    { name: 'data-brut-label-copy',     values: 'string (default "COPY")',                description: 'Initial button label, applied when the button has no text content yet' },
    { name: 'data-brut-label-copied',   values: 'string (default "COPIED")',              description: 'Transient button label shown for 1500ms after a successful copy' },
    { name: 'data-brut-label-announce', values: 'string (default "Copied to clipboard")', description: 'Text written into the visually-hidden aria-live region after a successful copy' },
  ],
  events: [
    { name: 'brut:change', detail: { value: 'string (the text just written to the clipboard)' } },
  ],
  formState: { hiddenInput: false },
  a11y: {
    role: null,
    keyboard: ['Tab', 'Space', 'Enter (on copy button)'],
    aria: ['aria-live="polite" on an internal .brut-copy__live region announcing "Copied to clipboard"'],
    notes: 'Copy button is forced to type="button" so it never submits a surrounding form. A visually-hidden aria-live region is appended at init and updated on each successful copy. The transient label flip and live-region announcement both clear after 1500ms; cleanup is guarded by el.isConnected so a detach-before-timer never throws.',
  },
  examples: [
    {
      title: 'Simple token',
      html: '<div class="brut-copy" data-brut="copy">\n  <code class="brut-copy__value">sk-proj-abc123xyz</code>\n  <button type="button" class="brut-btn brut-btn--sm brut-copy__btn">COPY</button>\n</div>',
    },
    {
      title: 'Multiline value via data-brut-value',
      html: '<div class="brut-copy" data-brut="copy" data-brut-value="npm install @sprtn/ui\nnpx brut init">\n  <code class="brut-copy__value">npm install @sprtn/ui &amp; npx brut init</code>\n  <button type="button" class="brut-btn brut-btn--sm brut-copy__btn">COPY</button>\n</div>',
    },
    {
      title: 'Localized labels',
      html: '<div class="brut-copy" data-brut="copy" data-brut-label-copy="COPIER" data-brut-label-copied="COPIE" data-brut-label-announce="Copie dans le presse-papiers">\n  <code class="brut-copy__value">https://exemple.fr/abc</code>\n  <button type="button" class="brut-btn brut-btn--sm brut-copy__btn"></button>\n</div>',
    },
    {
      title: 'Value override (display vs. copied text differ)',
      html: '<div class="brut-copy" data-brut="copy" data-brut-value="0xDEADBEEFCAFEBABE0123456789ABCDEF">\n  <code class="brut-copy__value">0xDEAD…CDEF</code>\n  <button type="button" class="brut-btn brut-btn--sm brut-copy__btn">COPY</button>\n</div>',
    },
  ],
  responsive: {
    shape: 'static',
    notes: 'Inline value + button pair; sized to its content at every tier — no layout flip.',
  },
};
