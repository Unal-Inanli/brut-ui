export default {
  name: 'otp',
  description: 'One-time-code input rendered as one cell per digit with auto-advance, paste-fill, and Backspace/Arrow navigation.',
  useCases: ['email verification', '2FA code', 'SMS one-time password', 'PIN entry', 'magic-link confirm'],
  kind: 'interactive',
  class: '.brut-otp',
  selector: '[data-brut="otp"]',
  modifiers: [],
  dataAttributes: [
    { name: 'data-brut-len',  values: 'integer (default 6)', description: 'Number of cells to auto-generate when none are present' },
    { name: 'data-brut-name', values: 'string (default "otp")', description: 'name attribute on the hidden input that mirrors the joined value' },
    { name: 'data-brut-label-cell', values: 'string (default "Digit")', description: 'i18n override for the per-cell aria-label noun (e.g. "Ziffer" → "Ziffer 1 of 6")' },
    { name: 'data-brut-autocomplete', values: 'string (default "one-time-code") | "off"', description: 'Override the per-cell autocomplete value; "off" suppresses the attribute entirely' },
  ],
  events: [
    { name: 'brut:change',   detail: { value: 'string (joined digits so far)' } },
    { name: 'brut:complete', detail: { value: 'string (full code, fires when all cells are filled)' } },
  ],
  formState: { hiddenInput: true, name: 'auto-created <input type="hidden" name="<data-brut-name>"> with the joined value' },
  a11y: {
    role: null,
    keyboard: ['ArrowLeft', 'ArrowRight', 'Backspace', 'Paste'],
    aria: ['aria-label (per cell)', 'aria-live (status region)'],
    notes: 'At init, every cell receives inputmode="numeric" and autocomplete="one-time-code" by default (guarded so consumer-set values win); set data-brut-autocomplete on the wrapper to override the autocomplete value, or "off" to suppress it. Together these surface the numeric keypad and the iOS SMS one-time-code autofill shortcut. Non-digit keystrokes are stripped. Pasting a longer string fills cells left-to-right from the focused cell. Each cell gets aria-label="Digit N of M" (override the noun via data-brut-label-cell). A visually-hidden aria-live="polite" region announces "Code complete" when all cells are filled, in sync with the brut:complete dispatch.',
  },
  examples: [
    {
      title: '6-digit, auto-generated cells',
      html: '<div class="brut-otp" data-brut="otp" data-brut-len="6" data-brut-name="code"></div>',
    },
    {
      title: '4-digit PIN',
      html: '<div class="brut-otp" data-brut="otp" data-brut-len="4" data-brut-name="pin"></div>',
    },
    {
      title: 'Pre-populated cells',
      html: '<div class="brut-otp" data-brut="otp" data-brut-name="partial">\n  <input class="brut-otp__cell" maxlength="1" inputmode="numeric" value="4">\n  <input class="brut-otp__cell" maxlength="1" inputmode="numeric" value="2">\n  <input class="brut-otp__cell" maxlength="1" inputmode="numeric">\n  <input class="brut-otp__cell" maxlength="1" inputmode="numeric">\n  <input class="brut-otp__cell" maxlength="1" inputmode="numeric">\n  <input class="brut-otp__cell" maxlength="1" inputmode="numeric">\n</div>',
    },
  ],
  responsive: {
    shape: 'static',
    notes: 'Cell row keeps width across tiers within its container.',
  },
};
