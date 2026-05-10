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

      // a11y landmark + accessible name. Both guarded so consumer overrides win.
      if (!el.hasAttribute('role')) el.setAttribute('role', 'search');
      var hasLabel = input.hasAttribute('aria-label') ||
                     input.hasAttribute('aria-labelledby') ||
                     (input.id && document.querySelector('label[for="' + input.id + '"]'));
      if (!hasLabel) input.setAttribute('aria-label', 'Search');

      function refresh() { el.classList.toggle('brut-search--has-value', !!input.value); }
      function emit() {
        el.dispatchEvent(new CustomEvent('brut:change', { bubbles: true, detail: { value: input.value } }));
      }

      // Opt-in debounce: data-brut-debounce="<ms>" wraps the typing path only.
      // Absent / 0 / invalid → immediate (byte-identical to pre-#137 behaviour).
      var debounceMs = parseInt(el.getAttribute('data-brut-debounce'), 10);
      if (isNaN(debounceMs) || debounceMs < 0) debounceMs = 0;
      var debounceTimer = null;
      function runDebounced(fn) {
        if (debounceMs === 0) { fn(); return; }
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(function () { debounceTimer = null; fn(); }, debounceMs);
      }

      input.addEventListener('input', function () { runDebounced(function () { refresh(); emit(); }); });
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
