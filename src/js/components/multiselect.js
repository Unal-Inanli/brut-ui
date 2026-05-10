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

  var rootCounter = 0;

  Brut.register('multiselect', {
    selector: '[data-brut="multiselect"]',
    init: function (el) {
      var fieldShell = el.querySelector('.brut-multiselect__field');
      var input = el.querySelector('.brut-multiselect__input');
      var list  = el.querySelector('.brut-multiselect__list');
      if (!fieldShell || !input || !list) return;

      var rootSeq = ++rootCounter;

      var name = el.getAttribute('data-brut-name') || 'values';
      var emptyEl = list.querySelector('.brut-multiselect__empty');
      var opts = Array.prototype.slice.call(list.querySelectorAll('.brut-multiselect__opt'));
      var activeIdx = -1;

      // Assign deterministic ids so aria-activedescendant can point at options.
      if (!list.id) list.id = 'brut-multiselect-' + rootSeq + '-list';
      opts.forEach(function (o, i) {
        if (!o.id) o.id = 'brut-multiselect-' + rootSeq + '-opt-' + i;
      });

      // Visually-hidden status region announces the filtered count to screen readers.
      // Consumer-override-guard: skip if an aria-live region is already present.
      var status = null;
      if (!el.querySelector('[aria-live]')) {
        status = document.createElement('span');
        status.className = 'brut-multiselect__status';
        status.setAttribute('aria-live', 'polite');
        status.setAttribute('aria-atomic', 'true');
        status.style.cssText = 'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;';
        el.appendChild(status);
      }

      // Pre-selected options (data-selected attr) seed the Set.
      var selected = Object.create(null);
      opts.forEach(function (o) {
        if (o.hasAttribute('data-selected')) selected[o.getAttribute('data-value') || o.textContent.trim()] = labelOf(o);
      });

      function labelOf(o) { return (o.textContent || '').trim(); }
      function valueOf(o) { return o.getAttribute('data-value') || labelOf(o); }

      function open()  {
        el.classList.add('brut-multiselect--open');
        input.setAttribute('aria-expanded', 'true');
        if (activeIdx < 0) setActive(firstVisibleIdx());
      }
      function close() {
        el.classList.remove('brut-multiselect--open');
        input.setAttribute('aria-expanded', 'false');
        input.removeAttribute('aria-activedescendant');
        activeIdx = -1;
      }

      function visibleOpts() {
        return opts.filter(function (o) { return o.style.display !== 'none'; });
      }
      function firstVisibleIdx() {
        for (var i = 0; i < opts.length; i++) {
          if (opts[i].style.display !== 'none') return i;
        }
        return -1;
      }
      function setActive(i) {
        // aria-selected on options reflects selection state, not highlight,
        // because multiselect lets multiple options be selected at once.
        // Highlight is communicated via aria-activedescendant + a CSS hook.
        opts.forEach(function (o, j) {
          o.classList.toggle('brut-multiselect__opt--active', i === j);
        });
        activeIdx = i;
        if (i >= 0 && opts[i] && opts[i].style.display !== 'none') {
          opts[i].scrollIntoView({ block: 'nearest' });
          input.setAttribute('aria-activedescendant', opts[i].id);
        } else {
          input.removeAttribute('aria-activedescendant');
        }
      }

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
        var visibleCount = 0;
        opts.forEach(function (o) {
          var match = labelOf(o).toLowerCase().indexOf(q) !== -1;
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
        var v = visibleOpts();
        if (e.key === 'Backspace' && !input.value) {
          var keys = Object.keys(selected);
          if (keys.length) remove(keys[keys.length - 1]);
        } else if (e.key === 'Escape') {
          close();
        } else if (e.key === 'ArrowDown') {
          if (!v.length) return;
          e.preventDefault();
          var current = opts[activeIdx];
          var idxInVisible = v.indexOf(current);
          var next = v[(idxInVisible + 1 + v.length) % v.length] || v[0];
          setActive(opts.indexOf(next));
          open();
        } else if (e.key === 'ArrowUp') {
          if (!v.length) return;
          e.preventDefault();
          var currentUp = opts[activeIdx];
          var idxInVisibleUp = v.indexOf(currentUp);
          var prev = v[(idxInVisibleUp - 1 + v.length) % v.length] || v[v.length - 1];
          setActive(opts.indexOf(prev));
          open();
        } else if (e.key === 'Enter') {
          // Pick the highlighted option (activeIdx); fall back to first visible.
          var pick = (activeIdx >= 0 && opts[activeIdx] && opts[activeIdx].style.display !== 'none')
            ? opts[activeIdx]
            : v[0];
          if (pick) { e.preventDefault(); toggle(pick); input.value = ''; filter(); }
        }
      });

      opts.forEach(function (o, i) {
        o.addEventListener('mouseenter', function () { setActive(i); });
        o.addEventListener('mousedown', function (e) { e.preventDefault(); toggle(o); input.focus(); });
      });

      fieldShell.addEventListener('click', function (e) {
        if (e.target === fieldShell) input.focus();
      });

      document.addEventListener('mousedown', function (e) { if (!el.contains(e.target)) close(); });

      var form = el.closest('form');
      if (form) {
        form.addEventListener('reset', function () {
          if (!el.isConnected) return;
          setTimeout(function () {
            // No single native input to mirror — deselect all.
            Object.keys(selected).forEach(function (k) { delete selected[k]; });
            input.value = '';
            renderChips();
            renderOpts();
            syncHidden();
            // Reset filter visibility so the list is whole next open.
            opts.forEach(function (o) { o.style.display = ''; });
            if (emptyEl) emptyEl.style.display = 'none';
            close();
          }, 0);
        });
      }

      // Initial paint
      renderChips();
      renderOpts();
      syncHidden();
    }
  });
})();
