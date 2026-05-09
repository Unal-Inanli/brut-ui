export default {
  name: 'sidebar',
  description: 'Vertical app navigation rail with optional collapsible groups; clicking a button-typed group title toggles its closed state.',
  useCases: ['app shell navigation', 'admin dashboard rail', 'settings nav', 'docs site index', 'workspace switcher'],
  kind: 'interactive',
  class: '.brut-sidebar',
  selector: '[data-brut="sidebar"]',
  modifiers: [
    { name: '.brut-sidebar__group--closed', description: 'Hides the items beneath a group title and flips the title indicator to "+"' },
    { name: '.brut-sidebar__item--active',  description: 'Marks the current page link inside the rail' },
  ],
  dataAttributes: [],
  events: [
    { name: 'brut:change', detail: { value: 'boolean (true when the toggled group is open)', group: 'HTMLElement (the toggled group)', closed: 'boolean (new closed state of the group)' } },
  ],
  formState: { hiddenInput: false },
  a11y: {
    role: 'native landmark (<aside>)',
    keyboard: ['Enter / Space (on a group title button)'],
    aria: ['aria-expanded (on collapsible group title buttons)'],
    notes: 'Only group titles authored as <button> become collapsible; <h3> or other elements render the same chrome but stay static. Initial closed state is read from the .brut-sidebar__group--closed class on mount.',
  },
  examples: [
    {
      title: 'Two groups + one collapsed group',
      html: '<aside class="brut-sidebar" data-brut="sidebar">\n  <a class="brut-sidebar__brand" href="#">BRUT</a>\n  <div class="brut-sidebar__group">\n    <button class="brut-sidebar__group-title" type="button">Main</button>\n    <a class="brut-sidebar__item brut-sidebar__item--active" href="#">Dashboard</a>\n    <a class="brut-sidebar__item" href="#">Projects</a>\n    <a class="brut-sidebar__item" href="#">Inbox</a>\n  </div>\n  <div class="brut-sidebar__group brut-sidebar__group--closed">\n    <button class="brut-sidebar__group-title" type="button">Archived</button>\n    <a class="brut-sidebar__item" href="#">Old project</a>\n  </div>\n</aside>',
    },
  ],
  responsive: {
    shape: 'disclosure-toggle',
    breakpoint: 'md',
    notes: 'Hidden behind a toggle button below md; visible inline at md and above.',
  },
};
