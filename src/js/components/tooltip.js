/* tooltip — flat ink bubble shown on hover/focus of a trigger.
   Markup:
     <button class="brut-btn" data-brut="tooltip"
             data-brut-tip="Saved at 12:04"
             data-brut-tip-side="top">SAVE</button>
   The bubble is a separate <div class="brut-tooltip"> appended to <body>
   on show and removed on hide. Side is top|bottom|left|right (top default).
   Esc removes any visible tip; aria-describedby links trigger to bubble id. */
(function () {
  if (!window.Brut) return;

  var tipSeq = 0;

  var SIDES = ['top', 'bottom', 'left', 'right'];

  function position(tip, trigger, preferredSide) {
    if (SIDES.indexOf(preferredSide) === -1) preferredSide = 'top';
    var gap = 8;
    // Flip the side first, before reading rects again, so the bubble's
    // CURRENT size (already in the DOM) drives the fit decision.
    var side = Brut.flipSide(trigger, tip, preferredSide, gap);
    // Keep the visual arrow/styling consistent with the actual side.
    for (var i = 0; i < SIDES.length; i++) {
      tip.classList.remove('brut-tooltip--' + SIDES[i]);
    }
    tip.classList.add('brut-tooltip--' + side);
    var r = trigger.getBoundingClientRect();
    var sx = window.pageXOffset || document.documentElement.scrollLeft;
    var sy = window.pageYOffset || document.documentElement.scrollTop;
    var tw = tip.offsetWidth;
    var th = tip.offsetHeight;
    var top = 0, left = 0;
    switch (side) {
      case 'bottom':
        top  = r.bottom + sy + gap;
        left = r.left   + sx + (r.width  - tw) / 2;
        break;
      case 'left':
        top  = r.top    + sy + (r.height - th) / 2;
        left = r.left   + sx - tw - gap;
        break;
      case 'right':
        top  = r.top    + sy + (r.height - th) / 2;
        left = r.right  + sx + gap;
        break;
      case 'top':
      default:
        top  = r.top    + sy - th - gap;
        left = r.left   + sx + (r.width  - tw) / 2;
        break;
    }
    tip.style.top  = Math.round(top)  + 'px';
    tip.style.left = Math.round(left) + 'px';
  }

  // Detect touch-primary at init time. We snapshot .matches once rather than
  // attaching a `change` listener so init stays leak-free (per #181).
  var touchPrimaryMql = (typeof window.matchMedia === 'function')
    ? window.matchMedia('(hover: none) and (pointer: coarse)')
    : null;

  Brut.register('tooltip', {
    selector: '[data-brut="tooltip"]',
    init: function (el) {
      if (el.tagName === 'BUTTON') el.setAttribute('type', 'button');
      if (!el.hasAttribute('aria-haspopup')) el.setAttribute('aria-haspopup', 'true');

      var tip = null;
      var touchPrimary = !!(touchPrimaryMql && touchPrimaryMql.matches);

      // On touch-primary devices, screen readers benefit from an explicit
      // expanded affordance since the tooltip is now interactive (tap to pin).
      if (touchPrimary) el.setAttribute('aria-expanded', 'false');

      function show() {
        if (tip) return;
        var text = el.getAttribute('data-brut-tip') || '';
        if (!text) return;
        var side = el.getAttribute('data-brut-tip-side') || 'top';
        tip = document.createElement('div');
        tip.className = 'brut-tooltip brut-tooltip--' + side;
        tip.setAttribute('role', 'tooltip');
        tip.id = 'brut-tooltip-' + (++tipSeq);
        tip.textContent = text;
        document.body.appendChild(tip);
        el.setAttribute('aria-describedby', tip.id);
        if (touchPrimary) el.setAttribute('aria-expanded', 'true');
        position(tip, el, side);
      }
      function hide() {
        if (!tip) return;
        if (tip.parentNode) tip.parentNode.removeChild(tip);
        el.removeAttribute('aria-describedby');
        if (touchPrimary) el.setAttribute('aria-expanded', 'false');
        tip = null;
      }
      function toggle() {
        if (tip) hide(); else show();
      }

      el.addEventListener('mouseenter', show);
      el.addEventListener('mouseleave', hide);
      el.addEventListener('focus', show);
      el.addEventListener('blur', hide);

      // Touch-primary fallback: tap-to-pin (WCAG 2.1 SC 1.4.13).
      // Hybrid devices keep the hover/focus path above; the click handler
      // only mounts on touch-primary so desktop double-fire doesn't happen.
      if (touchPrimary) {
        el.addEventListener('click', function (e) {
          e.preventDefault();
          toggle();
        });
        // Outside-tap dismissal — scoped to the trigger's lifetime so
        // the listener no-ops once the host element is detached (mirrors
        // the existing keydown Esc handler pattern).
        document.addEventListener('pointerdown', function (e) {
          if (!el.isConnected) return;
          if (!tip) return;
          var target = e.target;
          if (el.contains(target)) return;
          if (tip.contains(target)) return;
          hide();
        });
      }

      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') hide();
      });
    }
  });
})();
