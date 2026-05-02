/* combobox — searchable single-select.
   Markup:
     <div class="brut-combobox" data-brut="combobox" data-brut-name="city">
       <input class="brut-input" type="text" placeholder="City…">
       <input type="hidden" name="city">
       <ul class="brut-combobox__list">
         <li class="brut-combobox__opt" data-value="nyc">New York</li>
         <li class="brut-combobox__opt" data-value="ber">Berlin</li>
         <li class="brut-combobox__empty">No matches.</li>
       </ul>
     </div>
   The visible <input> is the search field; the hidden <input> carries
   the selected option's data-value (or text). Picking emits brut:change. */
(function () {
  if (!window.Brut) return;
  Brut.register('combobox', {
    selector: '[data-brut="combobox"]',
    init: function (el) {
      var input = el.querySelector('input[type="text"], input[type="search"], input:not([type])');
      var list  = el.querySelector('.brut-combobox__list');
      if (!input || !list) return;

      var hidden = el.querySelector('input[type="hidden"]');
      if (!hidden && el.getAttribute('data-brut-name')) {
        hidden = document.createElement('input');
        hidden.type = 'hidden';
        hidden.name = el.getAttribute('data-brut-name');
        el.appendChild(hidden);
      }

      var opts = Array.prototype.slice.call(list.querySelectorAll('.brut-combobox__opt'));
      var emptyEl = list.querySelector('.brut-combobox__empty');
      var activeIdx = -1;

      function open()  { el.classList.add('brut-combobox--open');    input.setAttribute('aria-expanded', 'true'); }
      function close() { el.classList.remove('brut-combobox--open'); input.setAttribute('aria-expanded', 'false'); setActive(-1); }

      function setActive(i) {
        opts.forEach(function (o, j) { o.setAttribute('aria-selected', i === j ? 'true' : 'false'); });
        activeIdx = i;
        if (i >= 0 && opts[i]) opts[i].scrollIntoView({ block: 'nearest' });
      }

      function visibleOpts() {
        return opts.filter(function (o) { return o.style.display !== 'none'; });
      }

      function pick(opt) {
        if (!opt) return;
        input.value = opt.textContent.trim();
        if (hidden) hidden.value = opt.getAttribute('data-value') || opt.textContent.trim();
        el.dispatchEvent(new CustomEvent('brut:change', {
          detail: { value: hidden ? hidden.value : input.value, label: input.value }
        }));
        close();
      }

      function filter() {
        var q = (input.value || '').toLowerCase();
        var any = false;
        opts.forEach(function (o) {
          var match = o.textContent.toLowerCase().indexOf(q) !== -1;
          o.style.display = match ? '' : 'none';
          if (match) any = true;
        });
        if (emptyEl) emptyEl.style.display = any ? 'none' : 'block';
        open();
      }

      input.setAttribute('role', 'combobox');
      input.setAttribute('aria-autocomplete', 'list');
      input.setAttribute('aria-expanded', 'false');
      list.setAttribute('role', 'listbox');
      opts.forEach(function (o) { o.setAttribute('role', 'option'); });

      input.addEventListener('focus', open);
      input.addEventListener('input', filter);
      input.addEventListener('keydown', function (e) {
        var v = visibleOpts();
        if (!v.length && e.key !== 'Escape') return;
        var current = opts[activeIdx];
        var idxInVisible = v.indexOf(current);

        if (e.key === 'ArrowDown') {
          e.preventDefault();
          var n = v[(idxInVisible + 1 + v.length) % v.length] || v[0];
          setActive(opts.indexOf(n));
          open();
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          var p = v[(idxInVisible - 1 + v.length) % v.length] || v[v.length - 1];
          setActive(opts.indexOf(p));
          open();
        } else if (e.key === 'Enter') {
          if (el.classList.contains('brut-combobox--open')) {
            e.preventDefault();
            pick(current || v[0]);
          }
        } else if (e.key === 'Escape') {
          close();
        }
      });

      opts.forEach(function (o, i) {
        o.addEventListener('mouseenter', function () { setActive(i); });
        o.addEventListener('mousedown', function (e) { e.preventDefault(); pick(o); });
      });

      document.addEventListener('click', function (e) { if (!el.contains(e.target)) close(); });
    }
  });
})();
