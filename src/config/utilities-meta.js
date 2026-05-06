// Utility class category registry.
// Exposes the full set of utility classes grouped by concern so the MCP server
// can help agents discover layout, spacing, and styling utilities alongside
// component classes. Emitted into components.json as the top-level `utilities` array.

export const UTILITY_CATEGORIES = [
  {
    category: 'display',
    description: 'Control the CSS display property of an element.',
    classes: ['d-none', 'd-block', 'd-inline', 'd-inline-block', 'd-flex', 'd-inline-flex', 'd-grid'],
    responsive: true,
    breakpoints: ['sm', 'md', 'lg'],
    pattern: 'd-{bp}-{value}',
  },
  {
    category: 'flex-direction',
    description: 'Set flex container direction and wrap behavior.',
    classes: ['flex-row', 'flex-column', 'flex-row-reverse', 'flex-column-reverse', 'flex-wrap', 'flex-nowrap'],
    responsive: true,
    breakpoints: ['sm', 'md', 'lg'],
    pattern: 'flex-{bp}-{value}',
  },
  {
    category: 'justify-content',
    description: 'Horizontal alignment of flex or grid children along the main axis.',
    classes: ['justify-content-start', 'justify-content-end', 'justify-content-center', 'justify-content-between', 'justify-content-around', 'justify-content-evenly'],
    responsive: true,
    breakpoints: ['sm', 'md', 'lg'],
    pattern: 'justify-content-{bp}-{value}',
  },
  {
    category: 'align-items',
    description: 'Vertical alignment of flex or grid children along the cross axis.',
    classes: ['align-items-start', 'align-items-end', 'align-items-center', 'align-items-stretch', 'align-items-baseline'],
    responsive: true,
    breakpoints: ['sm', 'md', 'lg'],
    pattern: 'align-items-{bp}-{value}',
  },
  {
    category: 'align-self',
    description: 'Override the parent align-items value for a single flex child.',
    classes: ['align-self-start', 'align-self-end', 'align-self-center', 'align-self-stretch'],
    responsive: false,
  },
  {
    category: 'flex',
    description: 'Flex grow, shrink, fill, and order utilities.',
    classes: ['flex-grow-0', 'flex-grow-1', 'flex-shrink-0', 'flex-shrink-1', 'flex-fill', 'order-0', 'order-1', 'order-2', 'order-3', 'order-4', 'order-5', 'order-first', 'order-last'],
    responsive: false,
  },
  {
    category: 'gap',
    description: 'Set gap between flex/grid children. Scale: 0=0, 1=4px, 2=8px, 3=12px, 4=16px, 5=24px, 6=32px.',
    classes: ['gap-0', 'gap-1', 'gap-2', 'gap-3', 'gap-4', 'gap-5', 'gap-6', 'row-gap-0', 'row-gap-1', 'row-gap-2', 'row-gap-3', 'row-gap-4', 'row-gap-5', 'column-gap-0', 'column-gap-1', 'column-gap-2', 'column-gap-3', 'column-gap-4', 'column-gap-5'],
    responsive: true,
    breakpoints: ['sm', 'md', 'lg'],
    pattern: 'gap-{bp}-{value}',
  },
  {
    category: 'margin',
    description: 'Set margin on all sides or individual edges. Scale: 0=0, 1=4px, 2=8px, 3=12px, 4=16px, 5=24px, 6=32px, 8=48px. Supports auto.',
    classes: ['m-0', 'm-1', 'm-2', 'm-3', 'm-4', 'm-5', 'm-6', 'm-8', 'm-auto', 'mt-0', 'mt-1', 'mt-2', 'mt-3', 'mt-4', 'mt-5', 'mt-6', 'mt-8', 'mt-auto', 'mr-0', 'mr-1', 'mr-2', 'mr-3', 'mr-4', 'mr-5', 'mr-6', 'mr-8', 'mr-auto', 'mb-0', 'mb-1', 'mb-2', 'mb-3', 'mb-4', 'mb-5', 'mb-6', 'mb-8', 'mb-auto', 'ml-0', 'ml-1', 'ml-2', 'ml-3', 'ml-4', 'ml-5', 'ml-6', 'ml-8', 'ml-auto', 'mx-0', 'mx-1', 'mx-2', 'mx-3', 'mx-4', 'mx-5', 'mx-6', 'mx-8', 'mx-auto', 'my-0', 'my-1', 'my-2', 'my-3', 'my-4', 'my-5', 'my-6', 'my-8', 'my-auto'],
    responsive: true,
    breakpoints: ['sm', 'md', 'lg'],
    pattern: '{prop}-{bp}-{value}',
  },
  {
    category: 'padding',
    description: 'Set padding on all sides or individual edges. Same scale as margin.',
    classes: ['p-0', 'p-1', 'p-2', 'p-3', 'p-4', 'p-5', 'p-6', 'p-8', 'pt-0', 'pt-1', 'pt-2', 'pt-3', 'pt-4', 'pt-5', 'pt-6', 'pt-8', 'pr-0', 'pr-1', 'pr-2', 'pr-3', 'pr-4', 'pr-5', 'pr-6', 'pr-8', 'pb-0', 'pb-1', 'pb-2', 'pb-3', 'pb-4', 'pb-5', 'pb-6', 'pb-8', 'pl-0', 'pl-1', 'pl-2', 'pl-3', 'pl-4', 'pl-5', 'pl-6', 'pl-8', 'px-0', 'px-1', 'px-2', 'px-3', 'px-4', 'px-5', 'px-6', 'px-8', 'py-0', 'py-1', 'py-2', 'py-3', 'py-4', 'py-5', 'py-6', 'py-8'],
    responsive: true,
    breakpoints: ['sm', 'md', 'lg'],
    pattern: '{prop}-{bp}-{value}',
  },
  {
    category: 'text',
    description: 'Text alignment, transform, wrapping, and truncation.',
    classes: ['text-start', 'text-end', 'text-center', 'text-nowrap', 'text-truncate', 'text-break', 'text-uppercase', 'text-lowercase', 'text-capitalize'],
    responsive: true,
    breakpoints: ['sm', 'md', 'lg'],
    pattern: 'text-{bp}-{value}',
    notes: 'Only text-start, text-center, and text-end have responsive variants.',
  },
  {
    category: 'font-weight',
    description: 'Control font weight.',
    classes: ['fw-normal', 'fw-medium', 'fw-semibold', 'fw-bold'],
    responsive: false,
  },
  {
    category: 'font-size',
    description: 'Override font size using the type scale.',
    classes: ['fs-sm', 'fs-base', 'fs-md', 'fs-lg', 'fs-xl'],
    responsive: false,
  },
  {
    category: 'line-height',
    description: 'Override line-height.',
    classes: ['lh-tight', 'lh-snug', 'lh-normal', 'lh-loose'],
    responsive: false,
  },
  {
    category: 'font-family',
    description: 'Override font family.',
    classes: ['font-sans', 'font-mono', 'font-display'],
    responsive: false,
  },
  {
    category: 'sizing',
    description: 'Width, height, and viewport sizing utilities.',
    classes: ['w-25', 'w-50', 'w-75', 'w-100', 'w-auto', 'h-25', 'h-50', 'h-75', 'h-100', 'h-auto', 'mw-100', 'mh-100', 'min-vw-100', 'min-vh-100', 'vw-100', 'vh-100'],
    responsive: false,
  },
  {
    category: 'visibility',
    description: 'Control element visibility without affecting layout.',
    classes: ['visible', 'invisible', 'visually-hidden'],
    responsive: false,
    notes: 'visually-hidden keeps the element in the accessibility tree but hides it visually.',
  },
  {
    category: 'position',
    description: 'Set CSS position and edge offsets.',
    classes: ['position-static', 'position-relative', 'position-absolute', 'position-fixed', 'position-sticky', 'top-0', 'top-50', 'top-100', 'bottom-0', 'bottom-50', 'bottom-100', 'start-0', 'start-50', 'start-100', 'end-0', 'end-50', 'end-100'],
    responsive: false,
  },
  {
    category: 'overflow',
    description: 'Control how content overflows its container.',
    classes: ['overflow-auto', 'overflow-hidden', 'overflow-visible', 'overflow-scroll'],
    responsive: false,
  },
  {
    category: 'color',
    description: 'Text and background color utilities using design tokens.',
    classes: ['text-ink', 'text-paper', 'text-muted', 'text-success', 'text-warning', 'text-danger', 'text-info', 'text-primary', 'bg-paper', 'bg-paper-2', 'bg-bone', 'bg-ink', 'bg-primary', 'bg-success', 'bg-warning', 'bg-danger', 'bg-info'],
    responsive: false,
  },
  {
    category: 'border',
    description: 'Add or remove borders using the ink color at bw-3 weight.',
    classes: ['border', 'border-0', 'border-top', 'border-bottom', 'border-start', 'border-end'],
    responsive: false,
  },
  {
    category: 'misc',
    description: 'Border-radius, shadows, cursor, and interaction utilities.',
    classes: ['rounded-0', 'rounded-1', 'rounded-2', 'rounded-3', 'shadow-none', 'cursor-pointer', 'user-select-none', 'pe-none', 'pe-auto'],
    responsive: false,
  },
];

export const BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
};
