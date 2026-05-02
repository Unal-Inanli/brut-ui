/* table-bulk — bulk-actions toolbar for data tables.
   Markup:
     <div class="brut-table-bulk" data-brut="table-bulk" data-brut-table="my-table" data-brut-name="selected">
       <span class="brut-table-bulk__count">0 selected</span>
       <div class="brut-table-bulk__actions">
         <button class="brut-btn" data-brut-bulk-action="delete">Delete</button>
         <button class="brut-btn" data-brut-bulk-action="export">Export</button>
       </div>
     </div>
   The toolbar becomes visible (--shown) whenever one or more tbody rows are
   checked. It listens to native `change` events from row checkboxes AND
   `brut:change` events from the existing table.js (select-all).
   Each action button dispatches `brut:bulk { action, count, rows }`.
   Selected row keys (data-row-key or rowIndex) are mirrored to a hidden input.
*/
(function () {
  Brut.register('table-bulk', {
    selector: '[data-brut="table-bulk"]',
    init: function (el) {
      var tableId = el.getAttribute('data-brut-table');
      var table = tableId ? document.getElementById(tableId) : null;
      if (!table) return;
      var name = el.getAttribute('data-brut-name') || 'selected';
      var hidden = el.querySelector('input[type="hidden"][data-brut-bulk-state]');
      if (!hidden) {
        hidden = document.createElement('input');
        hidden.type = 'hidden';
        hidden.setAttribute('data-brut-bulk-state', '');
        hidden.name = name;
        el.appendChild(hidden);
      }
      var countEl = el.querySelector('.brut-table-bulk__count');
      var lastCount = -1;

      function selectedRows() {
        return Array.prototype.slice.call(table.querySelectorAll('tbody tr'))
          .filter(function (tr) {
            var cb = tr.querySelector('[data-brut-row-select] input[type="checkbox"], input[type="checkbox"][data-brut-row-select]');
            if (!cb) return false;
            // Some rows wrap the checkbox in a .brut-cb container; the source of truth is the input
            return cb.checked;
          });
      }

      function update() {
        var rows = selectedRows();
        var count = rows.length;
        if (count === lastCount) return;
        lastCount = count;
        el.classList.toggle('brut-table-bulk--shown', count > 0);
        if (countEl) countEl.textContent = count + ' selected';
        var keys = rows.map(function (r) { return r.getAttribute('data-row-key') || r.rowIndex; });
        hidden.value = keys.join(',');
        el.dispatchEvent(new CustomEvent('brut:change', { detail: { count: count, rows: rows }, bubbles: true }));
      }

      table.addEventListener('change', function (e) {
        if (e.target.matches('[data-brut-row-select]') || e.target.closest('[data-brut-row-select]')) update();
      });
      table.addEventListener('brut:change', function () { update(); });

      var actions = el.querySelectorAll('[data-brut-bulk-action]');
      actions.forEach(function (b) {
        b.setAttribute('type', 'button');
        b.addEventListener('click', function () {
          var rows = selectedRows();
          el.dispatchEvent(new CustomEvent('brut:bulk', {
            detail: { action: b.getAttribute('data-brut-bulk-action'), count: rows.length, rows: rows },
            bubbles: true
          }));
        });
      });

      update();
    }
  });
})();
