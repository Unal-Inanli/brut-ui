/* segmented — exclusive choice group on .brut-seg / .brut-seg__btn.
   Markup:
     <div class="brut-seg" data-brut="segmented">
       <button class="brut-seg__btn brut-seg__btn--on" data-value="day">DAY</button>
       <button class="brut-seg__btn" data-value="week">WEEK</button>
     </div>
   Mirror to a form by setting data-brut-name="<input-name>" on the wrapper —
   a hidden <input type="hidden"> is created automatically.

   Keyboard (roving tabindex):
     ArrowLeft / ArrowUp    — previous (wrap)
     ArrowRight / ArrowDown — next (wrap)
     Home / End             — first / last */
(function () {
  if (!window.Brut) return;
  Brut.register('segmented', {
    selector: '[data-brut="segmented"]',
    init: function (el) {
      var name = el.getAttribute('data-brut-name');
      var hidden = el.querySelector('input[type="hidden"]');
      if (name && !hidden) {
        hidden = document.createElement('input');
        hidden.type = 'hidden';
        hidden.name = name;
        el.appendChild(hidden);
      }

      el.setAttribute('role', 'tablist');

      var btns = Array.prototype.slice.call(el.querySelectorAll('.brut-seg__btn'));

      function select(btn, focusIt) {
        btns.forEach(function (b) {
          var on = b === btn;
          b.classList.toggle('brut-seg__btn--on', on);
          b.setAttribute('aria-selected', on ? 'true' : 'false');
          b.setAttribute('tabindex', on ? '0' : '-1');
        });
        var value = btn.getAttribute('data-value') || btn.textContent.trim();
        if (hidden) hidden.value = value;
        if (focusIt) btn.focus();
        el.dispatchEvent(new CustomEvent('brut:change', { detail: { value: value } }));
      }

      btns.forEach(function (btn) {
        btn.setAttribute('type', 'button');
        btn.setAttribute('role', 'tab');
        btn.addEventListener('click', function () { select(btn); });
      });

      el.addEventListener('keydown', function (e) {
        var t = e.target;
        if (!t || !t.classList || !t.classList.contains('brut-seg__btn')) return;
        var i = btns.indexOf(t);
        if (i < 0) return;
        var next = null;
        switch (e.key) {
          case 'ArrowLeft':
          case 'ArrowUp':    next = btns[(i - 1 + btns.length) % btns.length]; break;
          case 'ArrowRight':
          case 'ArrowDown':  next = btns[(i + 1) % btns.length]; break;
          case 'Home':       next = btns[0]; break;
          case 'End':        next = btns[btns.length - 1]; break;
          default: return;
        }
        e.preventDefault();
        select(next, true);
      });

      var initial = el.querySelector('.brut-seg__btn--on') || btns[0];
      if (initial) {
        // Set roving tabindex on initial render without firing brut:change.
        btns.forEach(function (b) {
          b.setAttribute('tabindex', b === initial ? '0' : '-1');
          b.setAttribute('aria-selected', b === initial ? 'true' : 'false');
        });
        if (hidden && !hidden.value) {
          hidden.value = initial.getAttribute('data-value') || initial.textContent.trim();
        }
      }
    }
  });
})();
