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

   ARIA: container is a radiogroup; each star is a radio with roving
   tabindex (only one star is in the tab order at a time).

   Keyboard (on the radiogroup / focused star):
     ArrowRight / ArrowDown — next star (wraps)
     ArrowLeft  / ArrowUp   — previous star (wraps)
     Home                   — first star
     End                    — last star */
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

      // Wrapper a11y: radiogroup with an accessible name. Don't override a
      // consumer-supplied label.
      el.setAttribute('role', 'radiogroup');
      if (!el.hasAttribute('aria-label') && !el.hasAttribute('aria-labelledby')) {
        el.setAttribute('aria-label', 'Rating');
      }

      var labelStar = el.getAttribute('data-brut-label-star');

      function starLabel(i) {
        var n = i + 1;
        if (labelStar) return n + ' ' + labelStar;
        return n + ' star' + (n === 1 ? '' : 's');
      }

      function paint(n) {
        stars.forEach(function (s, i) {
          s.classList.toggle('brut-rating__star--on', i < n);
          s.setAttribute('aria-checked', i + 1 === n ? 'true' : 'false');
        });
      }

      function updateTabindex(focusIndex) {
        stars.forEach(function (s, i) {
          s.setAttribute('tabindex', i === focusIndex ? '0' : '-1');
        });
      }

      function focusedIndex() {
        // Roving tabindex pointer: the star currently in the tab order.
        for (var i = 0; i < stars.length; i++) {
          if (stars[i].getAttribute('tabindex') === '0') return i;
        }
        return current > 0 ? current - 1 : 0;
      }

      function set(n) {
        n = Math.max(0, Math.min(max, n));
        current = n;
        if (hidden) {
          hidden.value = String(current);
          hidden.dispatchEvent(new Event('change', { bubbles: true }));
        }
        paint(current);
        // Keep the tab stop on the active star (or first star when cleared).
        updateTabindex(current > 0 ? current - 1 : 0);
        el.dispatchEvent(new CustomEvent('brut:change', { detail: { value: current } }));
      }

      stars.forEach(function (star, i) {
        star.setAttribute('type', 'button');
        if (!star.hasAttribute('role')) star.setAttribute('role', 'radio');
        if (!star.hasAttribute('aria-label')) star.setAttribute('aria-label', starLabel(i));
        star.addEventListener('mouseenter', function () { paint(i + 1); });
        star.addEventListener('focus',      function () { paint(i + 1); });
        star.addEventListener('click', function () {
          set(current === i + 1 ? 0 : i + 1);
        });
        star.addEventListener('keydown', function (e) {
          var idx = i;
          var nextIdx = null;
          switch (e.key) {
            case 'ArrowRight':
            case 'ArrowDown':
              nextIdx = (idx + 1) % max;
              break;
            case 'ArrowLeft':
            case 'ArrowUp':
              nextIdx = (idx - 1 + max) % max;
              break;
            case 'Home':
              nextIdx = 0;
              break;
            case 'End':
              nextIdx = max - 1;
              break;
            default:
              return;
          }
          e.preventDefault();
          set(nextIdx + 1);
          updateTabindex(nextIdx);
          stars[nextIdx].focus();
        });
      });

      // Roving tabindex: place the single tab stop on the current star, or
      // the first star if nothing is selected.
      updateTabindex(current > 0 ? current - 1 : 0);

      // Wrapper-level fallback: if the radiogroup itself receives a key
      // (e.g. focus is on the container before any roving has happened),
      // route arrows to the appropriate star.
      el.addEventListener('keydown', function (e) {
        if (e.target !== el) return;
        var idx = focusedIndex();
        var nextIdx = null;
        switch (e.key) {
          case 'ArrowRight':
          case 'ArrowDown':  nextIdx = (idx + 1) % max; break;
          case 'ArrowLeft':
          case 'ArrowUp':    nextIdx = (idx - 1 + max) % max; break;
          case 'Home':       nextIdx = 0; break;
          case 'End':        nextIdx = max - 1; break;
          default: return;
        }
        e.preventDefault();
        set(nextIdx + 1);
        updateTabindex(nextIdx);
        stars[nextIdx].focus();
      });

      el.addEventListener('mouseleave', function () { paint(current); });
      el.addEventListener('focusout',   function () { paint(current); });

      var form = el.closest('form');
      if (form) {
        form.addEventListener('reset', function () {
          if (!el.isConnected) return;
          setTimeout(function () {
            // No native input drives state — restore the initial value.
            var n = isFinite(initial) ? initial : 0;
            current = Math.max(0, Math.min(max, n));
            if (hidden) hidden.value = String(current);
            paint(current);
            updateTabindex(current > 0 ? current - 1 : 0);
          }, 0);
        });
      }

      paint(current);
    }
  });
})();
