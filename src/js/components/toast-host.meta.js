export default {
  name: 'toast-host',
  description: 'Container that anchors transient .brut-toast notifications spawned by the imperative Brut.toast() API; auto-creates itself if absent.',
  useCases: ['save-success notifications', 'background-job status', 'form validation flash messages', 'undo prompts', 'non-blocking error banners'],
  kind: 'interactive',
  class: '.brut-toast-host',
  selector: '[data-brut="toast-host"]',
  modifiers: [
    { name: '--top-right',    description: 'Anchor host to the top-right corner of the viewport (default)' },
    { name: '--top-left',     description: 'Anchor host to the top-left corner of the viewport' },
    { name: '--bottom-right', description: 'Anchor host to the bottom-right corner of the viewport' },
    { name: '--bottom-left',  description: 'Anchor host to the bottom-left corner of the viewport' },
  ],
  dataAttributes: [],
  events: [
    { name: 'brut:close', detail: {} },
  ],
  formState: { hiddenInput: false, name: 'No form value; the host renders ephemeral notifications' },
  a11y: {
    role: 'status / alert (per toast: "alert" for err and warn, "status" otherwise)',
    keyboard: ['click the toast x button to dismiss'],
    aria: ['role="status" or role="alert" (per toast)', 'aria-live="polite" or "assertive" (per toast)', 'aria-label="Dismiss" on the close button'],
    notes: 'Toasts are spawned imperatively via Brut.toast({ kind, message, timeout, host }) where kind is "ok" | "warn" | "err" | "info". Each toast bubbles brut:close on dismissal. If no host element exists when Brut.toast() is called, one is appended to <body> automatically.',
  },
  examples: [
    {
      title: 'Top-right host (default)',
      html: '<div class="brut-toast-host brut-toast-host--top-right" data-brut="toast-host"></div>',
    },
    {
      title: 'Bottom-left host',
      html: '<div class="brut-toast-host brut-toast-host--bottom-left" data-brut="toast-host"></div>',
    },
    {
      title: 'Programmatic spawn (after host is present)',
      html: '<div class="brut-toast-host brut-toast-host--top-right" data-brut="toast-host"></div>\n<button class="brut-btn" type="button"\n        onclick="Brut.toast({ kind: \'ok\', message: \'Saved!\', timeout: 4000 })">SAVE</button>',
    },
  ],
};
