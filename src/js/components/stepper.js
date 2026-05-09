/* stepper — number input with -/+ buttons.
   Markup:
     <div class="brut-stepper" data-brut="stepper">
       <button class="brut-stepper__btn" data-brut-step="down">−</button>
       <input class="brut-stepper__input" type="number" min="0" max="99" step="1" value="0">
       <button class="brut-stepper__btn" data-brut-step="up">+</button>
     </div>
   Reads min / max / step from the inner input.

   Keyboard (on the inner input):
     ArrowUp / ArrowDown — ±step
     PageUp / PageDown   — ±step×10 */
(function () {
  if (!window.Brut) return;
  Brut.register('stepper', {
    selector: '[data-brut="stepper"]',
    init: function (el) {
      var input = el.querySelector('input');
      if (!input) return;

      function read(attr, fallback) {
        var v = input.getAttribute(attr);
        return v === null || v === '' ? fallback : parseFloat(v);
      }

      function syncAria() {
        el.setAttribute('aria-valuenow', input.value);
      }

      var programmatic = false;

      function emitChange() {
        el.dispatchEvent(new CustomEvent('brut:change', {
          detail: { value: Number(input.value) },
          bubbles: true
        }));
      }

      function clampAndDispatch(v) {
        var step = read('step', 1) || 1;
        var min  = read('min', -Infinity);
        var max  = read('max',  Infinity);
        v = Math.min(max, Math.max(min, v));
        // Snap to step grid relative to min when min is finite.
        if (isFinite(min)) v = min + Math.round((v - min) / step) * step;
        // Clean float fuzz.
        v = parseFloat(v.toFixed(10));
        input.value = v;
        syncAria();
        programmatic = true;
        input.dispatchEvent(new Event('input',  { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
        programmatic = false;
        emitChange();
      }

      function bump(mult) {
        var step = read('step', 1) || 1;
        var v = parseFloat(input.value);
        if (isNaN(v)) v = read('min', 0);
        clampAndDispatch(v + mult * step);
      }

      var btns = el.querySelectorAll('.brut-stepper__btn');
      btns.forEach(function (b, i) {
        b.setAttribute('type', 'button');
        var dirAttr = b.getAttribute('data-brut-step');
        var dir = dirAttr === 'down' ? -1
                : dirAttr === 'up'   ?  1
                : (i === 0 ? -1 : 1);
        b.addEventListener('click', function () { bump(dir); });
      });

      // ARIA: spinbutton wrapper with current/min/max.
      el.setAttribute('role', 'spinbutton');
      var minAttr = input.getAttribute('min');
      var maxAttr = input.getAttribute('max');
      if (minAttr !== null) el.setAttribute('aria-valuemin', minAttr);
      if (maxAttr !== null) el.setAttribute('aria-valuemax', maxAttr);
      syncAria();
      input.addEventListener('input', syncAria);
      input.addEventListener('change', function () {
        if (programmatic) return;
        emitChange();
      });

      input.addEventListener('keydown', function (e) {
        var mult = 0;
        switch (e.key) {
          case 'ArrowUp':   mult =  1;  break;
          case 'ArrowDown': mult = -1;  break;
          case 'PageUp':    mult =  10; break;
          case 'PageDown':  mult = -10; break;
          default: return;
        }
        e.preventDefault();
        bump(mult);
      });

      var form = el.closest('form');
      if (form) {
        form.addEventListener('reset', function () {
          if (!el.isConnected) return;
          setTimeout(syncAria, 0);
        });
      }
    }
  });
})();
