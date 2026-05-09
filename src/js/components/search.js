/* search — input with × clear button. Hides clear when value is empty.
   Markup:
     <div class="brut-search" data-brut="search">
       <input class="brut-input" type="search" placeholder="Search…">
       <button class="brut-search__clear" aria-label="Clear">×</button>
     </div> */
(function () {
  if (!window.Brut) return;
  Brut.register('search', {
    selector: '[data-brut="search"]',
    init: function (el) {
      var input = el.querySelector('input');
      var btn   = el.querySelector('.brut-search__clear');
      if (!input) return;

      function refresh() { el.classList.toggle('brut-search--has-value', !!input.value); }
      function emit() {
        el.dispatchEvent(new CustomEvent('brut:change', { bubbles: true, detail: { value: input.value } }));
      }

      input.addEventListener('input', function () { refresh(); emit(); });
      if (btn) {
        btn.setAttribute('type', 'button');
        btn.addEventListener('click', function () {
          input.value = '';
          input.focus();
          refresh();
          emit();
        });
      }
      refresh();
    }
  });
})();
