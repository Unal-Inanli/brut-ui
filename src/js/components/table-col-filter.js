(function () {
  Brut.register('table-col-filter', {
    selector: '[data-brut="table-col-filter"]',
    init: function (th) {
      var table = th.closest('table');
      if (!table) return;
      var key = th.getAttribute('data-brut-col-key');
      if (!key) return;
      var headers = Array.prototype.slice.call(table.querySelectorAll('thead th'));
      var colIndex = headers.indexOf(th);
      if (colIndex < 0) return;
      var name = th.getAttribute('data-brut-name') || ('col_' + key);

      var hidden = th.querySelector('input[type="hidden"][data-brut-col-filter-state]');
      if (!hidden) {
        hidden = document.createElement('input');
        hidden.type = 'hidden';
        hidden.setAttribute('data-brut-col-filter-state', '');
        hidden.name = name;
        th.appendChild(hidden);
      }

      var btn = document.createElement('button');
      btn.setAttribute('type', 'button');
      btn.className = 'brut-table-col-filter__btn';
      btn.textContent = '▾';
      var popId = 'brut-col-filter-' + Math.random().toString(36).slice(2, 9);
      btn.setAttribute('data-brut-popover-open', popId);
      th.appendChild(btn);

      var pop = document.createElement('div');
      pop.className = 'brut-popover brut-table-col-filter-pop';
      pop.setAttribute('data-brut', 'popover');
      pop.id = popId;
      pop.setAttribute('hidden', '');

      var values = [];
      var bodyCells = table.querySelectorAll('tbody tr td:nth-child(' + (colIndex + 1) + ')');
      var seen = {};
      bodyCells.forEach(function (td) {
        var v = (td.textContent || '').trim();
        if (!seen.hasOwnProperty(v)) { seen[v] = 0; values.push(v); }
        seen[v]++;
      });
      values.sort();

      var active = {};
      values.forEach(function (v) {
        var item = document.createElement('label');
        item.className = 'brut-table-col-filter-pop__item';
        var cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.checked = true;
        active[v] = true;
        cb.addEventListener('change', function () {
          active[v] = cb.checked;
          apply();
        });
        item.appendChild(cb);
        var text = document.createElement('span');
        text.textContent = v + ' (' + seen[v] + ')';
        item.appendChild(text);
        pop.appendChild(item);
      });
      th.appendChild(pop);

      // Re-init popover so its click wiring picks up the newly inserted element
      Brut.init(th);

      function apply() {
        var keys = Object.keys(active);
        var anyDeselected = keys.some(function (k) { return !active[k]; });
        var checked = keys.filter(function (k) { return active[k]; });
        var rows = table.querySelectorAll('tbody tr');
        rows.forEach(function (r) {
          if (r.hasAttribute('data-brut-row-expansion')) return;
          var cell = r.children[colIndex];
          if (!cell) return;
          var v = (cell.textContent || '').trim();
          var match = active[v] !== false;
          if (match) {
            if (r.getAttribute('data-brut-hidden-by') === ('col_' + key)) {
              r.removeAttribute('data-brut-hidden-by');
              r.removeAttribute('hidden');
            } else if (!r.hasAttribute('data-brut-hidden-by')) {
              r.removeAttribute('hidden');
            }
          } else {
            r.setAttribute('data-brut-hidden-by', 'col_' + key);
            r.setAttribute('hidden', '');
          }
        });
        th.classList.toggle('brut-table-col-filter--active', anyDeselected);
        hidden.value = checked.join(',');
        th.dispatchEvent(new CustomEvent('brut:change', {
          detail: { key: key, active: checked },
          bubbles: true
        }));
        table.dispatchEvent(new CustomEvent('brut:change', { detail: { source: 'col-filter', key: key }, bubbles: true }));
      }
    }
  });
})();
