/* table-reorder — drag-to-reorder columns via HTML5 drag-and-drop.
   Markup:
     <table class="brut-table" data-brut="table-reorder">
       <colgroup><col data-col="name"><col data-col="email">...</colgroup>
       <thead>
         <tr>
           <th data-col="name">Name</th>
           <th data-col="email">Email</th>
           ...
         </tr>
       </thead>
       <tbody>...</tbody>
     </table>
   The component adds .brut-table--reorderable to the table, sets draggable="true"
   on every <th>, shows a 4px drop indicator, and reorders <col>, <th>, and <td>
   columns on drop. Emits brut:change { source: 'reorder', order } on each commit.
*/
(function () {
  if (!window.Brut) return;
  Brut.register('table-reorder', {
    selector: '[data-brut="table-reorder"]',
    init: function (table) {
      table.classList.add('brut-table--reorderable');
      var thead = table.querySelector('thead');
      if (!thead) return;
      var ths = Array.prototype.slice.call(thead.querySelectorAll('th'));
      var colgroup = table.querySelector('colgroup');
      var indicator = document.createElement('div');
      indicator.className = 'brut-table__drop-indicator';
      indicator.style.display = 'none';
      thead.appendChild(indicator);

      var dragIndex = -1;

      function moveColumn(from, to) {
        if (from === to) return;
        function moveChild(parent, fromIdx, toIdx) {
          var children = parent.children;
          var node = children[fromIdx];
          var ref = children[toIdx];
          if (!node || !ref) return;
          if (fromIdx < toIdx) parent.insertBefore(node, ref.nextSibling);
          else parent.insertBefore(node, ref);
        }
        if (colgroup) moveChild(colgroup, from, to);
        moveChild(thead.querySelector('tr'), from, to);
        Array.prototype.forEach.call(table.querySelectorAll('tbody tr'), function (tr) {
          moveChild(tr, from, to);
        });
        var keys = Array.prototype.slice.call(thead.querySelectorAll('th')).map(function (h) { return h.getAttribute('data-col') || ''; });
        table.dispatchEvent(new CustomEvent('brut:change', { detail: { source: 'reorder', order: keys }, bubbles: true }));
      }

      ths.forEach(function (th) {
        th.setAttribute('draggable', 'true');
        th.addEventListener('dragstart', function (e) {
          dragIndex = Array.prototype.indexOf.call(thead.querySelectorAll('th'), th);
          th.classList.add('brut-table__th--dragging');
          if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move';
        });
        th.addEventListener('dragover', function (e) {
          e.preventDefault();
          var rect = th.getBoundingClientRect();
          var theadRect = thead.getBoundingClientRect();
          var midpoint = rect.left + rect.width / 2;
          var x = e.clientX < midpoint ? rect.left : rect.right;
          indicator.style.left = (x - theadRect.left) + 'px';
          indicator.style.display = 'block';
        });
        th.addEventListener('drop', function (e) {
          e.preventDefault();
          var rect = th.getBoundingClientRect();
          var midpoint = rect.left + rect.width / 2;
          var dropIndex = Array.prototype.indexOf.call(thead.querySelectorAll('th'), th);
          if (e.clientX > midpoint) dropIndex++;
          // Adjust if moving forward (target index shifts after removing source)
          if (dragIndex < dropIndex) dropIndex--;
          moveColumn(dragIndex, dropIndex);
          indicator.style.display = 'none';
        });
        th.addEventListener('dragend', function () {
          th.classList.remove('brut-table__th--dragging');
          indicator.style.display = 'none';
          dragIndex = -1;
        });
      });
    }
  });
})();
