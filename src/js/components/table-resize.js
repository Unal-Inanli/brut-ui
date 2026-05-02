/* table-resize — pointer-drag column resize for data tables.
   Markup:
     <table class="brut-table" data-brut="table-resize">
       <thead class="brut-table__head">
         <tr class="brut-table__row">
           <th class="brut-table__cell">Name</th>
           ...
         </tr>
       </thead>
       ...
     </table>
   On init, adds .brut-table--resizable to the table, injects a
   <colgroup> if absent, and appends a .brut-table__resizer handle
   to each <th>. Dragging a handle writes inline width: on the
   matching <col>, snapping to a 4px grid with 60px minimum.
   Fires brut:change with { source:'resize', index, width } on release.
*/
(function () {
  if (!window.Brut) return;

  function snap(v) { return Math.round(v / 4) * 4; }

  Brut.register('table-resize', {
    selector: '[data-brut="table-resize"]',
    init: function (table) {
      table.classList.add('brut-table--resizable');
      var ths = Array.prototype.slice.call(table.querySelectorAll('thead th'));
      var colgroup = table.querySelector('colgroup');
      if (!colgroup) {
        colgroup = document.createElement('colgroup');
        ths.forEach(function () { colgroup.appendChild(document.createElement('col')); });
        table.insertBefore(colgroup, table.firstChild);
      }
      var cols = Array.prototype.slice.call(colgroup.querySelectorAll('col'));

      ths.forEach(function (th, i) {
        var col = cols[i];
        if (!col) return;
        // Initialize width from the rendered cell so first drag has a starting point
        if (!col.style.width) col.style.width = th.offsetWidth + 'px';

        var handle = document.createElement('span');
        handle.className = 'brut-table__resizer';
        handle.setAttribute('aria-hidden', 'true');
        th.appendChild(handle);

        var startX = 0, startW = 0;
        function onMove(e) {
          var w = Math.max(60, snap(startW + (e.clientX - startX)));
          col.style.width = w + 'px';
        }
        function onUp() {
          handle.classList.remove('brut-table__resizer--active');
          window.removeEventListener('pointermove', onMove);
          window.removeEventListener('pointerup', onUp);
          table.dispatchEvent(new CustomEvent('brut:change', {
            detail: { source: 'resize', index: i, width: parseInt(col.style.width, 10) },
            bubbles: true
          }));
        }
        handle.addEventListener('pointerdown', function (e) {
          e.preventDefault();
          startX = e.clientX;
          startW = col.offsetWidth || parseInt(col.style.width, 10) || th.offsetWidth;
          handle.classList.add('brut-table__resizer--active');
          window.addEventListener('pointermove', onMove);
          window.addEventListener('pointerup', onUp);
        });
      });
    }
  });
})();
