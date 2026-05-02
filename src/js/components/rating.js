/* rating — star row (or any glyph row).
   Markup:
     <div class="brut-rating" data-brut="rating" data-brut-name="quality" data-brut-value="3">
       <button class="brut-rating__star"></button>
       <button class="brut-rating__star"></button>
       <button class="brut-rating__star"></button>
       <button class="brut-rating__star"></button>
       <button class="brut-rating__star"></button>
     </div>
   A hidden <input type="hidden" name="…"> is created automatically
   when data-brut-name is set. Hover previews the score; click locks it.

   Keyboard (on the wrapper):
     ArrowRight / ArrowUp   — +1 (cap at max)
     ArrowLeft  / ArrowDown — −1 (floor at 0)
     Home                   — 0
     End                    — max */
(function () {
  if (!window.Brut) return;
  Brut.register('rating', {
    selector: '[data-brut="rating"]',
    init: function (el) {
      var stars = el.querySelectorAll('.brut-rating__star');
      if (!stars.length) return;
      var max = stars.length;

      var hidden = el.querySelector('input[type="hidden"]');
      if (!hidden && el.getAttribute('data-brut-name')) {
        hidden = document.createElement('input');
        hidden.type = 'hidden';
        hidden.name = el.getAttribute('data-brut-name');
        el.appendChild(hidden);
      }

      var initial = parseInt((hidden && hidden.value) || el.getAttribute('data-brut-value') || '0', 10);
      var current = isFinite(initial) ? initial : 0;
      if (hidden) hidden.value = String(current);

      // Wrapper a11y: slider, focusable.
      el.setAttribute('role', 'slider');
      el.setAttribute('aria-valuemin', '0');
      el.setAttribute('aria-valuemax', String(max));
      if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0');

      function paint(n) {
        stars.forEach(function (s, i) {
          s.classList.toggle('brut-rating__star--on', i < n);
          s.setAttribute('aria-checked', i + 1 === n ? 'true' : 'false');
        });
        el.setAttribute('aria-valuenow', String(n));
      }

      function set(n) {
        n = Math.max(0, Math.min(max, n));
        current = n;
        if (hidden) {
          hidden.value = String(current);
          hidden.dispatchEvent(new Event('change', { bubbles: true }));
        }
        paint(current);
        el.dispatchEvent(new CustomEvent('brut:change', { detail: { value: current } }));
      }

      stars.forEach(function (star, i) {
        star.setAttribute('type', 'button');
        star.setAttribute('role', 'radio');
        star.addEventListener('mouseenter', function () { paint(i + 1); });
        star.addEventListener('focus',      function () { paint(i + 1); });
        star.addEventListener('click', function () {
          set(current === i + 1 ? 0 : i + 1);
        });
      });

      el.addEventListener('keydown', function (e) {
        var next = null;
        switch (e.key) {
          case 'ArrowRight':
          case 'ArrowUp':    next = current + 1; break;
          case 'ArrowLeft':
          case 'ArrowDown':  next = current - 1; break;
          case 'Home':       next = 0; break;
          case 'End':        next = max; break;
          default: return;
        }
        e.preventDefault();
        set(next);
      });

      el.addEventListener('mouseleave', function () { paint(current); });
      el.addEventListener('focusout',   function () { paint(current); });
      paint(current);
    }
  });
})();
