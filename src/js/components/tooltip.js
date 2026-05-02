/* tooltip — flat ink bubble shown on hover/focus of a trigger.
   Markup:
     <button class="brut-btn" data-brut="tooltip"
             data-brut-tip="Saved at 12:04"
             data-brut-tip-side="top">SAVE</button>
   The bubble is a separate <div class="brut-tip"> appended to <body>
   on show and removed on hide. Side is top|bottom|left|right (top default).
   Esc removes any visible tip; aria-describedby links trigger to bubble id. */
(function () {
  if (!window.Brut) return;

  var tipSeq = 0;

  function position(tip, trigger, side) {
    var r = trigger.getBoundingClientRect();
    var sx = window.pageXOffset || document.documentElement.scrollLeft;
    var sy = window.pageYOffset || document.documentElement.scrollTop;
    var tw = tip.offsetWidth;
    var th = tip.offsetHeight;
    var gap = 8;
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

  Brut.register('tooltip', {
    selector: '[data-brut="tooltip"]',
    init: function (el) {
      if (el.tagName === 'BUTTON') el.setAttribute('type', 'button');

      var tip = null;

      function show() {
        if (tip) return;
        var text = el.getAttribute('data-brut-tip') || '';
        if (!text) return;
        var side = el.getAttribute('data-brut-tip-side') || 'top';
        tip = document.createElement('div');
        tip.className = 'brut-tip brut-tip--' + side;
        tip.setAttribute('role', 'tooltip');
        tip.id = 'brut-tip-' + (++tipSeq);
        tip.textContent = text;
        document.body.appendChild(tip);
        el.setAttribute('aria-describedby', tip.id);
        position(tip, el, side);
      }
      function hide() {
        if (!tip) return;
        if (tip.parentNode) tip.parentNode.removeChild(tip);
        el.removeAttribute('aria-describedby');
        tip = null;
      }

      el.addEventListener('mouseenter', show);
      el.addEventListener('mouseleave', hide);
      el.addEventListener('focus', show);
      el.addEventListener('blur', hide);

      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') hide();
      });
    }
  });
})();
