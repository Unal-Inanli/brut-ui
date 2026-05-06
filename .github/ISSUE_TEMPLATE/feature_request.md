---
name: Feature request
about: Propose a new capability for the kit (not a new component — see component_request)
title: 'feat: '
labels: ['enhancement', 'triage']
assignees: ''
---

## Problem

<!-- One paragraph. What can't you do today, and why does it matter? -->

## Proposed solution

<!-- One paragraph. The shape of the API or behavior you'd want. -->

## Have you checked the manifest?

<!--
Run: `cat node_modules/@sprtn/ui/dist/components.json | jq 'keys'`
or browse: https://unal-inanli.github.io/brut-ui/components/

Confirm the capability isn't already there under a different name.
-->

- [ ] I checked `dist/components.json` and the components index.
- [ ] What I want isn't already shipping.

## Hard-constraint check

The kit refuses to break its own rules. If your proposal needs any
of these, explain why it's worth a carve-out:

- [ ] New runtime dependency
- [ ] Gradient or soft shadow
- [ ] Transition longer than 140ms
- [ ] Border radius beyond input/tag radii
- [ ] Class root that doesn't match its `data-brut` hook
- [ ] None of the above (preferred)

## Alternatives you considered

<!-- Optional. What approaches did you reject and why? -->

## Anything else?

<!-- Mockups, code sketches, links to similar APIs in other libraries. -->
