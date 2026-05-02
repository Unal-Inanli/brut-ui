/* stepper — number input with -/+ buttons.
   Markup:
     <div class="brut-stepper" data-brut="stepper">
       <button class="brut-stepper__btn" data-brut-step="down">−</button>
       <input class="brut-stepper__input" type="number" min="0" max="99" step="1" value="0">
       <button class="brut-stepper__btn" data-brut-step="up">+</button>
     </div>
   Reads min / max / step from the inner input. */
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
        input.dispatchEvent(new Event('input',  { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }

      function bump(dir) {
        var step = read('step', 1) || 1;
        var v = parseFloat(input.value);
        if (isNaN(v)) v = read('min', 0);
        clampAndDispatch(v + dir * step);
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
    }
  });
})();
