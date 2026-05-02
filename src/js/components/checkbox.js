/* checkbox — visual checkbox synced to an inner hidden <input type="checkbox">.
   Markup:
     <label class="brut-cb" data-brut="checkbox">
       <input type="checkbox" hidden>
     </label>
   The hidden checkbox is the source of truth. */
(function () {
  if (!window.Brut) return;
  Brut.register('checkbox', {
    selector: '[data-brut="checkbox"]',
    init: function (el) {
      var input = el.querySelector('input[type="checkbox"]');

      function sync() {
        var on = input ? input.checked : el.classList.contains('brut-cb--on');
        el.classList.toggle('brut-cb--on', on);
        el.setAttribute('aria-checked', on ? 'true' : 'false');
      }

      if (!el.hasAttribute('role'))     el.setAttribute('role', 'checkbox');
      if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0');

      function emit() {
        el.dispatchEvent(new CustomEvent('brut:change', {
          detail: { checked: el.classList.contains('brut-cb--on') }
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
          el.classList.toggle('brut-cb--on');
          sync();
          emit();
        }
      });

      el.addEventListener('keydown', function (e) {
        if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); el.click(); }
      });

      if (input) input.addEventListener('change', function () { sync(); emit(); });
      sync();
    }
  });
})();
