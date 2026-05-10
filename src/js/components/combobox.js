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
  var rootCounter = 0;
  Brut.register('combobox', {
    selector: '[data-brut="combobox"]',
    init: function (el) {
      var input = el.querySelector('input[type="text"], input[type="search"], input:not([type])');
      var list  = el.querySelector('.brut-combobox__list');
      if (!input || !list) return;

      var rootSeq = ++rootCounter;

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

      // Assign deterministic ids so aria-activedescendant can point at options.
      if (!list.id) list.id = 'brut-combobox-' + rootSeq + '-list';
      opts.forEach(function (o, i) {
        if (!o.id) o.id = 'brut-combobox-' + rootSeq + '-opt-' + i;
      });

      // Visually-hidden status region announces the filtered count to screen readers.
      // Consumer-override-guard: skip if an aria-live region is already present.
      var status = null;
      if (!el.querySelector('[aria-live]')) {
        status = document.createElement('span');
        status.className = 'brut-combobox__status';
        status.setAttribute('aria-live', 'polite');
        status.setAttribute('aria-atomic', 'true');
        status.style.cssText = 'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;';
        el.appendChild(status);
      }

      function onScroll() {
        if (!el.isConnected) return;
        close();
      }

      function open() {
        el.classList.add('brut-combobox--open');
        input.setAttribute('aria-expanded', 'true');
        document.addEventListener('scroll', onScroll, { capture: true, passive: true });
      }
      function close() {
        el.classList.remove('brut-combobox--open');
        input.setAttribute('aria-expanded', 'false');
        input.removeAttribute('aria-activedescendant');
        setActive(-1);
        document.removeEventListener('scroll', onScroll, { capture: true });
      }

      function setActive(i) {
        opts.forEach(function (o, j) { o.setAttribute('aria-selected', i === j ? 'true' : 'false'); });
        activeIdx = i;
        if (i >= 0 && opts[i]) {
          opts[i].scrollIntoView({ block: 'nearest' });
          input.setAttribute('aria-activedescendant', opts[i].id);
        } else {
          input.removeAttribute('aria-activedescendant');
        }
      }

      function visibleOpts() {
        return opts.filter(function (o) { return o.style.display !== 'none'; });
      }

      function clearValue() {
        if (hidden) hidden.value = '';
        el.dispatchEvent(new CustomEvent('brut:change', {
          bubbles: true,
          detail: { value: '', label: '' }
        }));
      }

      function matchesOption(text) {
        var t = (text || '').trim().toLowerCase();
        if (!t) return false;
        for (var i = 0; i < opts.length; i++) {
          if (opts[i].textContent.trim().toLowerCase() === t) return true;
        }
        return false;
      }

      function pick(opt) {
        if (!opt) return;
        input.value = opt.textContent.trim();
        if (hidden) hidden.value = opt.getAttribute('data-value') || opt.textContent.trim();
        el.dispatchEvent(new CustomEvent('brut:change', {
          bubbles: true,
          detail: { value: hidden ? hidden.value : input.value, label: input.value }
        }));
        close();
      }

      function filter() {
        var raw = input.value || '';
        var q = raw.toLowerCase();
        var any = false;
        var visibleCount = 0;
        opts.forEach(function (o) {
          var match = o.textContent.toLowerCase().indexOf(q) !== -1;
          o.style.display = match ? '' : 'none';
          if (match) { any = true; visibleCount++; }
        });
        if (emptyEl) emptyEl.style.display = any ? 'none' : 'block';
        // Announce filtered count to screen readers via the polite live region.
        if (status) {
          status.textContent = visibleCount === 0
            ? 'No results'
            : (visibleCount === 1 ? '1 result' : visibleCount + ' results');
        }
        // Clearing the visible field clears the hidden value so the form
        // never submits a stale selection. clearValue() emits its own
        // brut:change; otherwise emit one here surfacing the visible count.
        if (raw.trim() === '' && hidden && hidden.value !== '') {
          clearValue();
        } else {
          el.dispatchEvent(new CustomEvent('brut:change', {
            bubbles: true,
            detail: {
              value: hidden ? hidden.value : input.value,
              label: input.value,
              visible: visibleCount
            }
          }));
        }
        open();
      }

      // Consumer-override-guard for config-style aria attributes. State attrs
      // (aria-expanded, aria-activedescendant) stay under runtime control.
      if (!input.hasAttribute('role')) input.setAttribute('role', 'combobox');
      if (!input.hasAttribute('aria-autocomplete')) input.setAttribute('aria-autocomplete', 'list');
      input.setAttribute('aria-expanded', 'false');
      if (!input.hasAttribute('aria-controls')) input.setAttribute('aria-controls', list.id);
      list.setAttribute('role', 'listbox');
      opts.forEach(function (o) { o.setAttribute('role', 'option'); });

      // Opt-in debounce: data-brut-debounce="<ms>" wraps the typing/filter path only.
      // Selection (pick) and blur-clear stay immediate. Absent / 0 / invalid →
      // immediate (byte-identical to pre-#137 behaviour).
      var debounceMs = parseInt(el.getAttribute('data-brut-debounce'), 10);
      if (isNaN(debounceMs) || debounceMs < 0) debounceMs = 0;
      var debounceTimer = null;
      function runDebounced(fn) {
        if (debounceMs === 0) { fn(); return; }
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(function () { debounceTimer = null; fn(); }, debounceMs);
      }

      input.addEventListener('focus', open);
      input.addEventListener('input', function () { runDebounced(filter); });
      input.addEventListener('blur', function () {
        // If the visible text doesn't match any option label, clear the
        // hidden value rather than keep a stale selection. Simple "clear"
        // semantics — we do not restore the last valid pick.
        if (!matchesOption(input.value) && hidden && hidden.value !== '') {
          clearValue();
        }
      });
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

      var form = el.closest('form');
      if (form) {
        form.addEventListener('reset', function () {
          if (!el.isConnected) return;
          setTimeout(function () {
            // Mirror the now-reset hidden input back into the visible field.
            // If hidden has a value, find the matching option label; otherwise clear.
            close();
            if (hidden && hidden.value) {
              var match = null;
              for (var i = 0; i < opts.length; i++) {
                var v = opts[i].getAttribute('data-value') || opts[i].textContent.trim();
                if (v === hidden.value) { match = opts[i]; break; }
              }
              input.value = match ? match.textContent.trim() : '';
            } else {
              input.value = '';
            }
            // Reset filter visibility so the list is whole next open.
            opts.forEach(function (o) { o.style.display = ''; });
            if (emptyEl) emptyEl.style.display = 'none';
          }, 0);
        });
      }
    }
  });
})();
