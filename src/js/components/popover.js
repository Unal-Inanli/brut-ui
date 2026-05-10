/* popover — anchored card opened by a trigger.
   Markup:
     <button class="brut-btn" data-brut-popover-open="filters">FILTERS</button>
     <div class="brut-popover" id="filters" data-brut="popover" hidden>
       <div class="brut-popover__head">
         <span>Filters</span>
         <button class="brut-popover__x" data-brut-close type="button">×</button>
       </div>
       <div class="brut-popover__body">…</div>
     </div>
   Click trigger to open. Click outside / Esc / [data-brut-close] closes.
   Position is computed under the trigger via getBoundingClientRect(). */
(function () {
  if (!window.Brut) return;
  var idCounter = 0;
  var closeByEl = new WeakMap();

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    document.querySelectorAll('[data-brut="popover"]:not([hidden])').forEach(function (el) {
      if (!el.isConnected) return;
      var c = closeByEl.get(el);
      if (c) c();
    });
  });

  Brut.register('popover', {
    selector: '[data-brut="popover"]',
    init: function (el) {
      if (!el.id) el.id = 'brut-popover-' + (++idCounter);

      var triggers = document.querySelectorAll('[data-brut-popover-open="' + el.id + '"]');
      var lastTrigger = null;

      var SIDES = ['top', 'bottom', 'left', 'right'];
      var currentSide = null;

      function applySideClass(side) {
        if (currentSide === side) return;
        if (currentSide) el.classList.remove('brut-popover--' + currentSide);
        el.classList.add('brut-popover--' + side);
        currentSide = side;
      }

      function position() {
        if (!lastTrigger) return;
        var preferredSide = el.getAttribute('data-position') || 'bottom';
        if (SIDES.indexOf(preferredSide) === -1) preferredSide = 'bottom';
        var gap = 8;
        // flipSide reads the bubble's current size, so make sure layout is
        // available. The element may have just been un-hidden; offsetHeight
        // forces a layout if needed.
        var side = Brut.flipSide(lastTrigger, el, preferredSide, gap);
        var r = lastTrigger.getBoundingClientRect();
        var sx = window.pageXOffset || document.documentElement.scrollLeft;
        var sy = window.pageYOffset || document.documentElement.scrollTop;
        var bH = el.offsetHeight;
        var bW = el.offsetWidth;
        var top = 0, left = 0;
        switch (side) {
          case 'top':
            top  = r.top    + sy - bH - gap;
            left = r.left   + sx;
            break;
          case 'left':
            top  = r.top    + sy;
            left = r.left   + sx - bW - gap;
            break;
          case 'right':
            top  = r.top    + sy;
            left = r.right  + sx + gap;
            break;
          case 'bottom':
          default:
            top  = r.bottom + sy + gap;
            left = r.left   + sx;
            break;
        }
        el.style.position = 'absolute';
        el.style.top  = Math.round(top)  + 'px';
        el.style.left = Math.round(left) + 'px';
        applySideClass(side);
      }

      function open(trigger) {
        lastTrigger = trigger || lastTrigger;
        el.removeAttribute('hidden');
        if (lastTrigger) lastTrigger.setAttribute('aria-expanded', 'true');
        position();
        el.dispatchEvent(new CustomEvent('brut:open', { bubbles: true, detail: { value: true } }));
      }
      function close() {
        if (el.hasAttribute('hidden')) return;
        el.setAttribute('hidden', '');
        if (lastTrigger) lastTrigger.setAttribute('aria-expanded', 'false');
        if (lastTrigger) {
          try { lastTrigger.focus(); } catch (e) { /* ignore */ }
        }
        el.dispatchEvent(new CustomEvent('brut:close', { bubbles: true, detail: { value: false } }));
      }
      closeByEl.set(el, close);

      triggers.forEach(function (t) {
        if (t.tagName === 'BUTTON') t.setAttribute('type', 'button');
        if (!t.hasAttribute('aria-haspopup')) t.setAttribute('aria-haspopup', 'true');
        if (!t.hasAttribute('aria-expanded')) t.setAttribute('aria-expanded', 'false');
        if (!t.hasAttribute('aria-controls')) t.setAttribute('aria-controls', el.id);
        t.addEventListener('click', function (e) {
          e.preventDefault();
          if (el.hasAttribute('hidden')) open(t); else close();
        });
      });

      el.querySelectorAll('[data-brut-close], .brut-popover__x').forEach(function (t) {
        if (t.tagName === 'BUTTON') t.setAttribute('type', 'button');
        t.addEventListener('click', function (e) { e.preventDefault(); close(); });
      });

      document.addEventListener('click', function (e) {
        if (!el.isConnected) return;
        if (el.hasAttribute('hidden')) return;
        if (el.contains(e.target)) return;
        for (var i = 0; i < triggers.length; i++) {
          if (triggers[i].contains(e.target)) return;
        }
        close();
      });

      window.addEventListener('resize', function () {
        if (!el.isConnected) return;
        if (!el.hasAttribute('hidden')) position();
      });
      window.addEventListener('scroll', function () {
        if (!el.isConnected) return;
        if (!el.hasAttribute('hidden')) position();
      }, { capture: true, passive: true });
    }
  });
})();
