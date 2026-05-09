/* switch — visual toggle synced to an inner <input type="checkbox">.
   Markup:
     <label class="brut-switch" data-brut="switch">
       <input type="checkbox" hidden>
       <span class="brut-switch__knob"></span>
     </label>
   The hidden checkbox is the source of truth — it posts with the form. */
(function () {
  if (!window.Brut) return;
  Brut.register('switch', {
    selector: '[data-brut="switch"]',
    init: function (el) {
      var input = el.querySelector('input[type="checkbox"]');

      function sync() {
        var on = input ? input.checked : el.classList.contains('brut-switch--on');
        el.classList.toggle('brut-switch--on', on);
        el.setAttribute('aria-checked', on ? 'true' : 'false');
      }

      if (!el.hasAttribute('role'))     el.setAttribute('role', 'switch');
      if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0');

      function emit() {
        el.dispatchEvent(new CustomEvent('brut:change', {
          detail: { value: el.classList.contains('brut-switch--on') }
        }));
      }

      el.addEventListener('click', function (e) {
        if (e.target === input) return;
        // Suppress native <label> activation so we don't toggle twice.
        e.preventDefault();
        if (input) {
          input.checked = !input.checked;
          input.dispatchEvent(new Event('change', { bubbles: true }));
        } else {
          el.classList.toggle('brut-switch--on');
          sync();
          emit();
        }
      });

      el.addEventListener('keydown', function (e) {
        if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); el.click(); }
      });

      if (input) input.addEventListener('change', function () { sync(); emit(); });

      var form = el.closest('form');
      if (form) {
        form.addEventListener('reset', function () {
          if (!el.isConnected) return;
          setTimeout(sync, 0);
        });
      }

      sync();
    }
  });
})();
