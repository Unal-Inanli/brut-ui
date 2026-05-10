export default {
  name: 'carousel',
  description: 'Single-track slide carousel with prev/next, dots, keyboard, autoplay, optional loop, and pointer-driven swipe.',
  useCases: ['image gallery', 'feature showcase', 'testimonial rotator', 'onboarding screens', 'product highlights'],
  kind: 'interactive',
  status: 'stable',
  class: '.brut-carousel',
  selector: '[data-brut="carousel"]',
  modifiers: [],
  dataAttributes: [
    { name: 'data-current',  values: 'integer (default 0)',           description: 'Initial slide index; clamped to slide count' },
    { name: 'data-autoplay', values: 'integer ms (omit or 0 to disable)', description: 'Autoplay interval in milliseconds' },
    { name: 'data-loop',     values: 'boolean attribute',              description: 'When present, prev/next wrap at edges instead of clamping' },
  ],
  events: [
    { name: 'brut:change', detail: { value: 'integer (current slide index)' } },
  ],
  formState: { hiddenInput: false },
  a11y: {
    role: 'region',
    roledescription: 'carousel',
    keyboard: ['ArrowLeft', 'ArrowRight', 'Home', 'End'],
    aria: [
      'aria-roledescription',
      'aria-live (on track)',
      'aria-current (on active dot)',
      { name: 'aria-pressed', notes: 'on the rendered .brut-carousel__pause button — toggles between false (autoplay running) and true (paused).' },
    ],
    notes: 'Autoplay respects prefers-reduced-motion and pauses on hover, focus, and tab visibility change. Arrow keys are RTL-aware. Renders a visible .brut-carousel__pause button satisfying WCAG 2.2.2 when data-autoplay is set and user has no prefers-reduced-motion preference.',
  },
  examples: [
    {
      title: 'Default — clamp at edges',
      html: '<div class="brut-carousel" data-brut="carousel" data-current="0">\n  <div class="brut-carousel__viewport">\n    <div class="brut-carousel__track">\n      <div class="brut-carousel__slide">Slide 1</div>\n      <div class="brut-carousel__slide">Slide 2</div>\n      <div class="brut-carousel__slide">Slide 3</div>\n    </div>\n  </div>\n  <div class="brut-carousel__nav">\n    <button class="brut-carousel__btn brut-carousel__btn--prev" aria-label="Previous slide"></button>\n    <button class="brut-carousel__btn brut-carousel__btn--next" aria-label="Next slide"></button>\n  </div>\n  <div class="brut-carousel__dots" role="tablist"></div>\n</div>',
    },
    {
      title: 'Autoplay + loop',
      html: '<div class="brut-carousel" data-brut="carousel" data-autoplay="5000" data-loop>\n  <div class="brut-carousel__viewport">\n    <div class="brut-carousel__track">\n      <div class="brut-carousel__slide">Slide 1</div>\n      <div class="brut-carousel__slide">Slide 2</div>\n      <div class="brut-carousel__slide">Slide 3</div>\n    </div>\n  </div>\n  <div class="brut-carousel__nav">\n    <button class="brut-carousel__btn brut-carousel__btn--prev" aria-label="Previous slide"></button>\n    <button class="brut-carousel__btn brut-carousel__btn--next" aria-label="Next slide"></button>\n  </div>\n  <div class="brut-carousel__dots" role="tablist"></div>\n</div>',
    },
    {
      title: 'Image content',
      html: '<div class="brut-carousel" data-brut="carousel" data-current="0">\n  <div class="brut-carousel__viewport">\n    <div class="brut-carousel__track">\n      <div class="brut-carousel__slide"><img src="/img/1.jpg" alt="First"></div>\n      <div class="brut-carousel__slide"><img src="/img/2.jpg" alt="Second"></div>\n      <div class="brut-carousel__slide"><img src="/img/3.jpg" alt="Third"></div>\n    </div>\n  </div>\n  <div class="brut-carousel__nav">\n    <button class="brut-carousel__btn brut-carousel__btn--prev" aria-label="Previous slide"></button>\n    <button class="brut-carousel__btn brut-carousel__btn--next" aria-label="Next slide"></button>\n  </div>\n  <div class="brut-carousel__dots" role="tablist"></div>\n</div>',
    },
  ],
  responsive: {
    shape: 'static',
    notes: 'Track sized to viewport at any tier; no layout flip.',
  },
};
