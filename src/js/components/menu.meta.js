export default {
  name: 'menu',
  description: 'Trigger-anchored dropdown menu with click-outside, Escape, and arrow-key focus navigation.',
  useCases: ['row actions', 'overflow menu', 'user account menu', 'context actions', 'kebab menu'],
  kind: 'interactive',
  class: '.brut-menu',
  selector: '[data-brut="menu"]',
  modifiers: [
    { name: '.brut-menu__item--danger', description: 'Destructive action style for an item (e.g. Delete, Sign out)' },
  ],
  dataAttributes: [
    { name: 'data-brut-menu-open', values: 'id of the target .brut-menu', description: 'Placed on a trigger element; clicking it toggles the matching menu' },
  ],
  events: [
    { name: 'brut:open',  detail: {} },
    { name: 'brut:close', detail: {} },
  ],
  formState: { hiddenInput: false },
  a11y: {
    role: 'menu',
    keyboard: ['ArrowDown', 'ArrowUp', 'Home', 'End', 'Escape'],
    aria: ['aria-haspopup="menu" (auto-set on trigger)'],
    notes: 'Trigger gets type="button" and aria-haspopup automatically. Escape closes the menu and returns focus to the trigger. Clicking any .brut-menu__item closes the menu. Position recomputes on resize and scroll.',
  },
  examples: [
    {
      title: 'Row actions menu',
      html: '<button class="brut-btn brut-btn--primary" type="button" data-brut-menu-open="m-actions">ACTIONS</button>\n<div class="brut-menu" id="m-actions" data-brut="menu" hidden>\n  <button class="brut-menu__item" type="button">Edit</button>\n  <button class="brut-menu__item" type="button">Duplicate</button>\n  <button class="brut-menu__item" type="button">Share</button>\n  <hr class="brut-menu__sep"/>\n  <button class="brut-menu__item brut-menu__item--danger" type="button">Delete</button>\n</div>',
    },
    {
      title: 'Overflow menu with link items',
      html: '<button class="brut-btn" type="button" data-brut-menu-open="m-links" aria-label="More">…</button>\n<div class="brut-menu" id="m-links" data-brut="menu" hidden>\n  <a class="brut-menu__item" href="#">Profile</a>\n  <a class="brut-menu__item" href="#">Settings</a>\n  <a class="brut-menu__item" href="#">Help</a>\n  <hr class="brut-menu__sep"/>\n  <a class="brut-menu__item brut-menu__item--danger" href="#">Sign out</a>\n</div>',
    },
  ],
  responsive: {
    shape: 'bottom-sheet',
    breakpoint: 'sm',
    notes: 'Anchored menu docks to bottom edge on phones; anchored to trigger at sm and above.',
  },
};
