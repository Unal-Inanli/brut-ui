/* table — sortable headers + select-all behavior for data tables.
   Markup:
     <table class="brut-table" data-brut="table">
       <thead class="brut-table__head">
         <tr class="brut-table__row">
           <th class="brut-table__cell">
             <span class="brut-checkbox" data-brut-select-all></span>
           </th>
           <th class="brut-table__cell brut-table__cell--sortable" data-sort-key="name">Name</th>
           <th class="brut-table__cell brut-table__cell--sortable brut-table__cell--num" data-sort-key="qty">Qty</th>
         </tr>
       </thead>
       <tbody>
         <tr class="brut-table__row">
           <td class="brut-table__cell">
             <label class="brut-checkbox" data-brut-row-select><input type="checkbox" hidden></label>
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
   Empty-state: opt-in. If the table contains a child element with
   [data-brut-role="empty-state"], it is shown when tbody has no visible
   rows and hidden otherwise (the table itself is also toggled).
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
      var thDir = isThis ? dir : 'none';
      h.classList.toggle('brut-table__cell--sorted',      isThis && dir === 'ascending');
      h.classList.toggle('brut-table__cell--sorted-desc', isThis && dir === 'descending');
      h.setAttribute('aria-sort', thDir);
      h.setAttribute('data-sort-direction', thDir);
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

      // Empty-state wiring (opt-in).
      // If the table contains a [data-brut-role="empty-state"] child, toggle
      // it (and the <table>) based on the count of visible tbody rows.
      // A row counts as visible when it does NOT have the `hidden` attribute.
      var emptyEl = el.querySelector('[data-brut-role="empty-state"]');
      function syncEmpty() {
        if (!emptyEl || !tbody) return;
        var rows = tbody.children;
        var visible = 0;
        for (var i = 0; i < rows.length; i++) {
          if (!rows[i].hasAttribute('hidden')) visible++;
        }
        if (visible === 0) {
          emptyEl.hidden = false;
          el.hidden = true;
        } else {
          emptyEl.hidden = true;
          el.hidden = false;
        }
      }

      // MutationObserver watches tbody childList so consumers can mutate rows
      // freely (append, remove, innerHTML rewrite) without calling a refresh API.
      // Disconnect when el leaves the document — same defensive pattern as #91.
      if (emptyEl && tbody && typeof MutationObserver === 'function') {
        var mo = new MutationObserver(function () {
          if (!el.isConnected) { mo.disconnect(); return; }
          syncEmpty();
        });
        mo.observe(tbody, { childList: true, attributes: true, subtree: true, attributeFilter: ['hidden'] });
      }

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
            var direction = current === 'ascending' ? 'descending' : 'ascending';
            sortBy(el, key, direction);
            syncEmpty();
            el.dispatchEvent(new CustomEvent('brut:sort', {
              bubbles: true,
              detail: { key: key, direction: direction, value: { key: key, direction: direction } }
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
          row.classList.toggle('brut-checkbox--on', checked);
          row.setAttribute('aria-checked', checked ? 'true' : 'false');
        }

        function applyAll(checked) {
          var rows = el.querySelectorAll('[data-brut-row-select]');
          for (var j = 0; j < rows.length; j++) setRowChecked(rows[j], checked);
        }

        function isOn() {
          if (selectAllInput) return selectAllInput.checked;
          return selectAll.classList.contains('brut-checkbox--on');
        }

        function syncHeader(on) {
          if (selectAllInput) selectAllInput.checked = on;
          selectAll.classList.toggle('brut-checkbox--on', on);
          selectAll.setAttribute('aria-checked', on ? 'true' : 'false');
        }

        selectAll.addEventListener('click', function (e) {
          if (e.target === selectAllInput) return;
          var next = !isOn();
          syncHeader(next);
          applyAll(next);
          syncEmpty();
          el.dispatchEvent(new CustomEvent('brut:change', {
            detail: { value: next, selectAll: true }
          }));
        });
        selectAll.addEventListener('keydown', function (e) {
          if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); selectAll.click(); }
        });

        if (!selectAll.hasAttribute('role'))     selectAll.setAttribute('role', 'checkbox');
        if (!selectAll.hasAttribute('tabindex')) selectAll.setAttribute('tabindex', '0');
        syncHeader(isOn());
      }

      // Pagination integration. If a child (or sibling) [data-brut="pagination"]
      // exists, delegate paging UI to it and just slice rows on brut:change.
      // No pagination element ⇒ behavior is byte-identical to before.
      var pager = el.querySelector('[data-brut="pagination"]');
      if (!pager && el.parentElement) pager = el.parentElement.querySelector('[data-brut="pagination"]');
      if (pager && tbody) {
        var allRows = Array.prototype.slice.call(tbody.querySelectorAll('tr'));
        if (!pager.hasAttribute('data-total'))     pager.setAttribute('data-total', String(allRows.length));
        if (!pager.hasAttribute('data-page-size')) pager.setAttribute('data-page-size', String(allRows.length || 1));

        function applyPage(page, pageSize) {
          var rows = Array.prototype.slice.call(tbody.querySelectorAll('tr'));
          var start = (page - 1) * pageSize;
          var end   = start + pageSize;
          for (var i = 0; i < rows.length; i++) {
            rows[i].hidden = (i < start || i >= end);
          }
        }

        pager.addEventListener('brut:change', function (e) {
          if (!e.target || !e.target.matches || !e.target.matches('[data-brut="pagination"]')) return;
          var d = e.detail || {};
          if (typeof d.page === 'number' && typeof d.pageSize === 'number') applyPage(d.page, d.pageSize);
        });

        var initPage     = parseInt(pager.getAttribute('data-page'), 10) || 1;
        var initPageSize = parseInt(pager.getAttribute('data-page-size'), 10) || allRows.length || 1;
        applyPage(initPage, initPageSize);
      }

      // Initial render — runs after pagination has set its initial hidden flags.
      syncEmpty();
    }
  });
})();
