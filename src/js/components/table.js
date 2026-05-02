/* table — sortable headers + select-all behavior for data tables.
   Markup:
     <table class="brut-table" data-brut="table">
       <thead class="brut-table__head">
         <tr class="brut-table__row">
           <th class="brut-table__cell">
             <span class="brut-cb" data-brut-select-all></span>
           </th>
           <th class="brut-table__cell brut-table__cell--sortable" data-sort-key="name">Name</th>
           <th class="brut-table__cell brut-table__cell--sortable brut-table__cell--num" data-sort-key="qty">Qty</th>
         </tr>
       </thead>
       <tbody>
         <tr class="brut-table__row">
           <td class="brut-table__cell">
             <label class="brut-cb" data-brut-row-select><input type="checkbox" hidden></label>
           </td>
           <td class="brut-table__cell" data-sort-value="alpha">Alpha</td>
           <td class="brut-table__cell brut-table__cell--num" data-sort-value="3">3</td>
         </tr>
       </tbody>
     </table>
   Sort: click a --sortable header to toggle asc/desc by data-sort-key.
   Each row cell with matching data-sort-key supplies a data-sort-value.
   Numeric values sort numerically; otherwise string-locale sort.
   Select-all: the [data-brut-select-all] header element toggles every
   [data-brut-row-select] in the same table.
*/
(function () {
  if (!window.Brut) return;

  function compare(a, b, dir) {
    var na = parseFloat(a), nb = parseFloat(b);
    var bothNumeric = !isNaN(na) && !isNaN(nb) && String(na) === String(a).trim() && String(nb) === String(b).trim();
    var cmp;
    if (bothNumeric) {
      cmp = na - nb;
    } else {
      cmp = String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' });
    }
    return dir === 'descending' ? -cmp : cmp;
  }

  function sortBy(table, key, dir) {
    var thead = table.querySelector('thead');
    var tbody = table.querySelector('tbody');
    if (!tbody) return;

    var headers = thead ? thead.querySelectorAll('.brut-table__cell--sortable') : [];
    var sortIndex = -1;
    for (var i = 0; i < headers.length; i++) {
      var h = headers[i];
      var isThis = h.getAttribute('data-sort-key') === key;
      h.classList.toggle('brut-table__cell--sorted',      isThis && dir === 'ascending');
      h.classList.toggle('brut-table__cell--sorted-desc', isThis && dir === 'descending');
      h.setAttribute('aria-sort', isThis ? dir : 'none');
    }

    // Find the column index for this key by matching the header position.
    var headerCells = thead ? thead.querySelectorAll('.brut-table__cell') : [];
    for (var k = 0; k < headerCells.length; k++) {
      if (headerCells[k].getAttribute('data-sort-key') === key) { sortIndex = k; break; }
    }

    var rows = Array.prototype.slice.call(tbody.querySelectorAll('tr'));
    rows.sort(function (ra, rb) {
      var ca = ra.children[sortIndex];
      var cb = rb.children[sortIndex];
      var va = ca ? (ca.getAttribute('data-sort-value') !== null ? ca.getAttribute('data-sort-value') : (ca.textContent || '').trim()) : '';
      var vb = cb ? (cb.getAttribute('data-sort-value') !== null ? cb.getAttribute('data-sort-value') : (cb.textContent || '').trim()) : '';
      return compare(va, vb, dir);
    });
    rows.forEach(function (r) { tbody.appendChild(r); });
  }

  Brut.register('table', {
    selector: '[data-brut="table"]',
    init: function (el) {
      var thead = el.querySelector('thead');
      var tbody = el.querySelector('tbody');
      if (!thead) return;

      // Sortable header wiring.
      var sortables = thead.querySelectorAll('.brut-table__cell--sortable');
      for (var i = 0; i < sortables.length; i++) {
        (function (h) {
          if (!h.hasAttribute('aria-sort')) h.setAttribute('aria-sort', 'none');
          if (!h.hasAttribute('role'))      h.setAttribute('role', 'columnheader');
          if (!h.hasAttribute('tabindex'))  h.setAttribute('tabindex', '0');

          function trigger() {
            var key = h.getAttribute('data-sort-key');
            if (!key) return;
            var current = h.getAttribute('aria-sort');
            var dir = current === 'ascending' ? 'descending' : 'ascending';
            sortBy(el, key, dir);
            el.dispatchEvent(new CustomEvent('brut:change', {
              detail: { key: key, dir: dir }
            }));
          }

          h.addEventListener('click', trigger);
          h.addEventListener('keydown', function (e) {
            if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); trigger(); }
          });
        })(sortables[i]);
      }

      // Select-all wiring.
      var selectAll = el.querySelector('[data-brut-select-all]');
      if (selectAll) {
        if (selectAll.tagName === 'BUTTON') selectAll.setAttribute('type', 'button');
        var selectAllInput = selectAll.querySelector('input[type="checkbox"]');

        function setRowChecked(row, checked) {
          var input = row.querySelector('input[type="checkbox"]');
          if (input) {
            if (input.checked !== checked) {
              input.checked = checked;
              input.dispatchEvent(new Event('change', { bubbles: true }));
            }
          }
          row.classList.toggle('brut-cb--on', checked);
          row.setAttribute('aria-checked', checked ? 'true' : 'false');
        }

        function applyAll(checked) {
          var rows = el.querySelectorAll('[data-brut-row-select]');
          for (var j = 0; j < rows.length; j++) setRowChecked(rows[j], checked);
        }

        function isOn() {
          if (selectAllInput) return selectAllInput.checked;
          return selectAll.classList.contains('brut-cb--on');
        }

        function syncHeader(on) {
          if (selectAllInput) selectAllInput.checked = on;
          selectAll.classList.toggle('brut-cb--on', on);
          selectAll.setAttribute('aria-checked', on ? 'true' : 'false');
        }

        selectAll.addEventListener('click', function (e) {
          if (e.target === selectAllInput) return;
          var next = !isOn();
          syncHeader(next);
          applyAll(next);
          el.dispatchEvent(new CustomEvent('brut:change', {
            detail: { selectAll: next }
          }));
        });
        selectAll.addEventListener('keydown', function (e) {
          if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); selectAll.click(); }
        });

        if (!selectAll.hasAttribute('role'))     selectAll.setAttribute('role', 'checkbox');
        if (!selectAll.hasAttribute('tabindex')) selectAll.setAttribute('tabindex', '0');
        syncHeader(isOn());
      }
    }
  });
})();
