---
name: A11y / WCAG report
about: Report an accessibility violation against WCAG 2.1
title: 'A11Y: '
labels: a11y
---

## WCAG criterion

<!-- e.g. 1.3.1 (Info and Relationships, Level A), 2.1.1 (Keyboard, Level A), 4.1.2 (Name, Role, Value, Level A). Cite criterion + level. -->

## Severity

- [ ] Level A (must fix — blocks users)
- [ ] Level AA (should fix — common-case violations)
- [ ] Level AAA (polish)

## Component / surface

<!-- Component name (e.g. dialog, multiselect) and which surface (CSS, JS, preview, docs). -->

## Reproduction

```bash
# AT + browser
NVDA 2024.1 + Chrome 124, macOS / Windows
```

1. Navigate to …
2. Press …
3. Observe …

## Expected announcement / behaviour

<!-- What the screen reader / keyboard / contrast checker should report. -->

## Actual announcement / behaviour

<!-- What it actually reports. -->

## Suggested fix

<!-- Optional. ARIA attribute changes, focus management, contrast adjustments, keyboard handler additions, etc. -->

## Related

<!-- Link relevant issues, ARIA APG patterns, WAI-ARIA spec sections. -->
