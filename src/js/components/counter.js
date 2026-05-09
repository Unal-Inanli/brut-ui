/* counter — character count for a paired input or textarea.
   Markup:
     <textarea id="bio" class="brut-textarea" maxlength="120"></textarea>
     <span class="brut-field__counter" data-brut="counter" data-brut-for="bio"></span>
   The maxlength attribute on the target is honored if present.
   Override with data-brut-max="<n>" on the counter element. */
(function () {
  if (!window.Brut) return;
  Brut.register('counter', {
    selector: '[data-brut="counter"]',
    init: function (el) {
      var target = document.getElementById(el.getAttribute('data-brut-for'));
      if (!target) return;
      var attrMax = parseInt(target.getAttribute('maxlength'), 10);
      var dataMax = parseInt(el.getAttribute('data-brut-max'), 10);
      var max = isFinite(attrMax) ? attrMax : (isFinite(dataMax) ? dataMax : 0);

      function refresh() {
        var n = (target.value || '').length;
        el.textContent = max ? (n + ' / ' + max) : String(n);
        var over = max ? (n > max) : false;
        if (max) el.classList.toggle('brut-field__counter--over', over);
        el.dispatchEvent(new CustomEvent('brut:change', {
          bubbles: true,
          detail: { value: n, max: max, over: over }
        }));
      }

      target.addEventListener('input',  refresh);
      target.addEventListener('change', refresh);
      refresh();
    }
  });
})();
