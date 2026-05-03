/* table-filter — global text filter for a brut-table.
   Filters tbody rows by combined visible cell text.
   Case-insensitive; AND across whitespace-separated tokens.
   Markup:
     <div class="brut-table-filter" data-brut="table-filter" data-brut-table="<table-id>">
       <label class="brut-field__label" for="q">Search</label>
       <input id="q" class="brut-input" type="search" placeholder="Filter rows…">
       <span class="brut-table-filter__count"></span>
     </div> */
(function () {
  Brut.register('table-filter', {
    selector: '[data-brut="table-filter"]',
    init: function (el) {
      var tableId = el.getAttribute('data-brut-table');
      var table = tableId ? document.getElementById(tableId) : null;
      if (!table) return;
      var input = el.querySelector('input');
      if (!input) return;
      var name = el.getAttribute('data-brut-name') || 'q';
      var hidden = el.querySelector('input[type="hidden"][data-brut-filter-state]');
      if (!hidden) {
        hidden = document.createElement('input');
        hidden.type = 'hidden';
        hidden.setAttribute('data-brut-filter-state', '');
        hidden.name = name;
        el.appendChild(hidden);
      }
      var countEl = el.querySelector('.brut-table-filter__count');

      function apply() {
        var q = input.value.trim().toLowerCase();
        var tokens = q ? q.split(/\s+/) : [];
        var rows = table.querySelectorAll('tbody tr');
        var visible = 0, total = rows.length;
        rows.forEach(function (r) {
          if (r.hasAttribute('data-brut-row-expansion')) return; // skip expansion rows from unit T11
          var text = (r.textContent || '').toLowerCase();
          var match = tokens.every(function (t) { return text.indexOf(t) !== -1; });
          if (match) {
            r.removeAttribute('data-brut-filter-hidden');
            // Only un-hide if no OTHER decorator hid it
            if (r.getAttribute('data-brut-hidden-by') === 'filter') {
              r.removeAttribute('data-brut-hidden-by');
              r.removeAttribute('hidden');
            } else if (!r.hasAttribute('data-brut-hidden-by')) {
              r.removeAttribute('hidden');
            }
            visible++;
          } else {
            r.setAttribute('data-brut-filter-hidden', '');
            r.setAttribute('data-brut-hidden-by', 'filter');
            r.setAttribute('hidden', '');
          }
        });
        hidden.value = q;
        if (countEl) countEl.textContent = visible + ' of ' + total;
        el.dispatchEvent(new CustomEvent('brut:change', { detail: { value: q, visible: visible, total: total }, bubbles: true }));
        // Notify table listeners (pagination etc.) to re-render
        table.dispatchEvent(new CustomEvent('brut:change', { detail: { source: 'filter' }, bubbles: true }));
      }

      input.addEventListener('input', apply);
      apply();
    }
  });
})();
