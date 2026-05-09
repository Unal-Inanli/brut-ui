/* radio — visual radio synced to an inner hidden <input type="radio">.
   Group via the radio input's `name` attribute, or by setting
   data-brut-name="<group>" on each radio when no input is present.
   Markup:
     <label class="brut-radio" data-brut="radio">
       <input type="radio" name="size" value="md" hidden>
     </label> */
(function () {
  if (!window.Brut) return;
  Brut.register('radio', {
    selector: '[data-brut="radio"]',
    init: function (el) {
      var input = el.querySelector('input[type="radio"]');
      var groupName = el.getAttribute('data-brut-name') || (input && input.name);

      function sync() {
        var on = input ? input.checked : el.classList.contains('brut-radio--on');
        el.classList.toggle('brut-radio--on', on);
        el.setAttribute('aria-checked', on ? 'true' : 'false');
      }

      if (!el.hasAttribute('role'))     el.setAttribute('role', 'radio');
      if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0');

      el.addEventListener('click', function (e) {
        if (e.target === input) return;
        if (input) {
          input.checked = true;
          input.dispatchEvent(new Event('change', { bubbles: true }));
        } else if (groupName) {
          var siblings = document.querySelectorAll(
            '[data-brut="radio"][data-brut-name="' + groupName + '"]'
          );
          for (var i = 0; i < siblings.length; i++) {
            siblings[i].classList.remove('brut-radio--on');
            siblings[i].setAttribute('aria-checked', 'false');
          }
          el.classList.add('brut-radio--on');
          el.setAttribute('aria-checked', 'true');
        }
        sync();
        el.dispatchEvent(new CustomEvent('brut:change', {
          detail: { value: input ? input.value : el.getAttribute('data-value') }
        }));
      });

      el.addEventListener('keydown', function (e) {
        if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); el.click(); }
      });

      if (input) {
        // Sync siblings when any radio in the group changes (via labels, etc).
        document.addEventListener('change', function (e) {
          if (e.target && e.target.type === 'radio' && e.target.name === input.name) sync();
        });
      }

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
