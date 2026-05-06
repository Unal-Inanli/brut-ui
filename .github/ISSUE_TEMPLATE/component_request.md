---
name: Component request
about: Ask for a new component (or a missing variant of an existing one)
title: 'component: '
labels: ['component', 'triage']
assignees: ''
---

## Component name

<!-- e.g. "toast", "drawer", "popover-with-arrow" -->

## Closest existing analogue

<!--
Which existing component is structurally closest? Pick from:

- switch.js        — boolean on/off
- checkbox.js      — boolean tri-state
- radio.js         — one-of-N choice
- segmented.js     — one-of-N visual chooser
- tabs.js          — one-of-N panel chooser
- combobox.js      — searchable select
- multiselect.js   — multi-choice
- stepper.js       — numeric increment
- tag-input.js     — collection input
- otp.js           — fixed-length token input
- file.js          — file picker
- dropzone.js      — file drop area
- dialog.js        — modal open/close
- drawer.js        — sliding panel
- accordion.js     — collapse/expand
- carousel.js      — paged horizontal scroll

Naming the analogue helps the reviewer predict what your file should look like.
-->

## Visual reference

<!--
A screenshot, mockup, or link. Doesn't have to be polished — a hand
sketch is fine. We'll redraw it in the kit's voice (hard shadows,
4px ink borders, snap motion).
-->

## States the component must support

<!-- e.g. default, hover, focus, disabled, loading, error, success -->

- [ ] default
- [ ] hover
- [ ] focus
- [ ] disabled
- [ ] error
- [ ] success
- [ ] loading
- [ ] (other) ___________

## Form-state behavior

- [ ] Mirrors its value to a hidden `<input>` so `<form>` submission picks it up.
- [ ] Doesn't carry value (it's a visual or container component).

If it carries value:

- **Hidden input `name` attribute:** <!-- e.g. notify -->
- **Value type:** <!-- string | number | boolean | array<string> | object -->

## Keyboard interaction

<!--
Which keys activate or navigate the component? Use the same vocabulary
as MDN ("Space toggles", "Arrow Up moves the active option up by one").
-->

## Accessibility expectations

- **Role:** <!-- e.g. switch, tab, dialog -->
- **`aria-*` attributes:** <!-- e.g. aria-checked, aria-selected -->
- **Screen reader behavior:** <!-- one sentence -->

## Anything else?

<!-- Edge cases, real-world prior art, why this isn't already covered by an existing component. -->
