(function () {
  Brut.register('table-keys', {
    selector: '[data-brut="table-keys"]',
    init: function (table) {
      table.classList.add('brut-table--keys');

      function visibleCells(tr) {
        return Array.prototype.slice.call(tr.children).filter(function (td) {
          return td.offsetParent !== null && !td.hasAttribute('hidden');
        });
      }
      function visibleRows() {
        return Array.prototype.slice.call(table.querySelectorAll('tbody tr')).filter(function (tr) {
          return !tr.hasAttribute('hidden') && !tr.hasAttribute('data-brut-row-expansion');
        });
      }

      function ensureFocusable(cell) {
        if (cell && !cell.hasAttribute('tabindex')) cell.setAttribute('tabindex', '0');
      }

      var seedRow = visibleRows()[0];
      if (seedRow) {
        var seedCell = visibleCells(seedRow)[0];
        ensureFocusable(seedCell);
      }

      table.addEventListener('keydown', function (e) {
        var cell = e.target.closest('td, th');
        if (!cell || !table.contains(cell)) return;
        var row = cell.parentElement;
        var rows = visibleRows();
        var rowIndex = rows.indexOf(row);
        var cells = visibleCells(row);
        var cellIndex = cells.indexOf(cell);

        function moveTo(r, c) {
          if (!r) return;
          var rc = visibleCells(r);
          var target = rc[Math.max(0, Math.min(rc.length - 1, c))];
          if (target) { ensureFocusable(target); target.focus(); e.preventDefault(); }
        }

        switch (e.key) {
          case 'ArrowRight': moveTo(row, cellIndex + 1); break;
          case 'ArrowLeft':  moveTo(row, cellIndex - 1); break;
          case 'ArrowDown':
            if (rowIndex >= 0) moveTo(rows[rowIndex + 1], cellIndex);
            break;
          case 'ArrowUp':
            if (rowIndex >= 0) moveTo(rows[rowIndex - 1], cellIndex);
            break;
          case 'Home': moveTo(row, 0); break;
          case 'End':  moveTo(row, cells.length - 1); break;
          case 'PageUp':   moveTo(rows[0], cellIndex); break;
          case 'PageDown': moveTo(rows[rows.length - 1], cellIndex); break;
          default: return;
        }
      });
    }
  });
})();
