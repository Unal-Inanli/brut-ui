/* multiselect — chips inside a combobox-style field.
   Markup:
     <div class="brut-multiselect" data-brut="multiselect" data-brut-name="skills">
       <div class="brut-multiselect__field">
         <input class="brut-multiselect__input" placeholder="Pick skills…" />
       </div>
       <ul class="brut-multiselect__list">
         <li class="brut-multiselect__opt" data-value="ux">UX</li>
         <li class="brut-multiselect__opt" data-value="css">CSS</li>
         <li class="brut-multiselect__empty">No matches.</li>
       </ul>
     </div>
   Maintains a Set of selected values. Click an option to toggle.
   Mirrors as one <input type="hidden" name="<n>"> per selected value.
   Dispatches brut:change with { values: [...] }. */
(function () {
  if (!window.Brut) return;

  Brut.register('multiselect', {
    selector: '[data-brut="multiselect"]',
    init: function (el) {
      var fieldShell = el.querySelector('.brut-multiselect__field');
      var input = el.querySelector('.brut-multiselect__input');
      var list  = el.querySelector('.brut-multiselect__list');
      if (!fieldShell || !input || !list) return;

      var name = el.getAttribute('data-brut-name') || 'values';
      var emptyEl = list.querySelector('.brut-multiselect__empty');
      var opts = Array.prototype.slice.call(list.querySelectorAll('.brut-multiselect__opt'));

      // Pre-selected options (data-selected attr) seed the Set.
      var selected = Object.create(null);
      opts.forEach(function (o) {
        if (o.hasAttribute('data-selected')) selected[o.getAttribute('data-value') || o.textContent.trim()] = labelOf(o);
      });

      function labelOf(o) { return (o.textContent || '').trim(); }
      function valueOf(o) { return o.getAttribute('data-value') || labelOf(o); }

      function open()  { el.classList.add('brut-multiselect--open');    input.setAttribute('aria-expanded', 'true'); }
      function close() { el.classList.remove('brut-multiselect--open'); input.setAttribute('aria-expanded', 'false'); }

      function syncHidden() {
        // Remove old hidden inputs we created
        Array.prototype.slice.call(el.querySelectorAll('input[type="hidden"][data-brut-mirror="1"]')).forEach(function (n) { n.remove(); });
        Object.keys(selected).forEach(function (v) {
          var h = document.createElement('input');
          h.type = 'hidden';
          h.name = name;
          h.value = v;
          h.setAttribute('data-brut-mirror', '1');
          el.appendChild(h);
        });
      }

      function renderChips() {
        // Wipe existing chips
        Array.prototype.slice.call(fieldShell.querySelectorAll('.brut-multiselect__chip')).forEach(function (c) { c.remove(); });
        var keys = Object.keys(selected);
        keys.forEach(function (v) {
          var chip = document.createElement('span');
          chip.className = 'brut-tag brut-multiselect__chip';
          chip.setAttribute('data-value', v);
          chip.appendChild(document.createTextNode(selected[v] + ' '));
          var x = document.createElement('button');
          x.className = 'brut-tag__x';
          x.setAttribute('type', 'button');
          x.setAttribute('aria-label', 'Remove ' + selected[v]);
          x.textContent = '×';
          x.addEventListener('mousedown', function (ev) { ev.preventDefault(); });
          x.addEventListener('click', function (ev) {
            ev.stopPropagation();
            remove(v);
          });
          chip.appendChild(x);
          fieldShell.insertBefore(chip, input);
        });
      }

      function renderOpts() {
        opts.forEach(function (o) {
          var v = valueOf(o);
          o.classList.toggle('brut-multiselect__opt--selected', !!selected[v]);
          o.setAttribute('aria-selected', selected[v] ? 'true' : 'false');
        });
      }

      function emit() {
        el.dispatchEvent(new CustomEvent('brut:change', { detail: { value: Object.keys(selected) } }));
      }

      function add(o) {
        var v = valueOf(o);
        if (selected[v]) return;
        selected[v] = labelOf(o);
        renderChips();
        renderOpts();
        syncHidden();
        emit();
      }
      function remove(v) {
        if (!selected[v]) return;
        delete selected[v];
        renderChips();
        renderOpts();
        syncHidden();
        emit();
        input.focus();
      }
      function toggle(o) {
        var v = valueOf(o);
        if (selected[v]) remove(v); else add(o);
      }

      function filter() {
        var q = (input.value || '').toLowerCase();
        var any = false;
        opts.forEach(function (o) {
          var match = labelOf(o).toLowerCase().indexOf(q) !== -1;
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
      list.setAttribute('aria-multiselectable', 'true');
      opts.forEach(function (o) { o.setAttribute('role', 'option'); });

      input.addEventListener('focus', open);
      input.addEventListener('input', filter);
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Backspace' && !input.value) {
          var keys = Object.keys(selected);
          if (keys.length) remove(keys[keys.length - 1]);
        } else if (e.key === 'Escape') {
          close();
        } else if (e.key === 'Enter') {
          var first = opts.filter(function (o) { return o.style.display !== 'none'; })[0];
          if (first) { e.preventDefault(); toggle(first); input.value = ''; filter(); }
        }
      });

      opts.forEach(function (o) {
        o.addEventListener('mousedown', function (e) { e.preventDefault(); toggle(o); input.focus(); });
      });

      fieldShell.addEventListener('click', function (e) {
        if (e.target === fieldShell) input.focus();
      });

      document.addEventListener('mousedown', function (e) { if (!el.contains(e.target)) close(); });

      // Initial paint
      renderChips();
      renderOpts();
      syncHidden();
    }
  });
})();
