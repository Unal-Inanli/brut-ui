/* table-edit — click a <td data-brut="table-edit"> to edit inline.
   Enter commits, Escape cancels. Mirrors to a hidden input named
   cell_<rowKey>_<colKey> (or data-brut-name). Updates data-sort-value
   on commit so other sort decorators see fresh values.
*/
(function () {
  if (!window.Brut) return;
  Brut.register('table-edit', {
    selector: '[data-brut="table-edit"]',
    init: function (cell) {
      var row = cell.closest('tr');
      var rowKey = row && row.getAttribute('data-row-key') || '';
      var colKey = cell.getAttribute('data-col') || '';
      var name = cell.getAttribute('data-brut-name') || ('cell_' + rowKey + '_' + colKey);
      var hidden = cell.querySelector('input[type="hidden"][data-brut-edit-state]');
      if (!hidden) {
        hidden = document.createElement('input');
        hidden.type = 'hidden';
        hidden.setAttribute('data-brut-edit-state', '');
        hidden.name = name;
        hidden.value = (cell.textContent || '').trim();
        cell.appendChild(hidden);
      }

      var optionsAttr = cell.getAttribute('data-brut-edit-options');
      var options = optionsAttr ? optionsAttr.split(',').map(function (s) { return s.trim(); }) : null;

      function startEdit() {
        if (cell.classList.contains('brut-table-edit--editing')) return;
        var prev = hidden.value;
        cell.classList.add('brut-table-edit--editing');

        var children = Array.prototype.slice.call(cell.childNodes).filter(function (n) {
          return !(n.nodeType === 1 && n === hidden);
        });
        children.forEach(function (n) { cell.removeChild(n); });

        var input;
        if (options) {
          input = document.createElement('select');
          options.forEach(function (o) {
            var opt = document.createElement('option');
            opt.value = o;
            opt.textContent = o;
            if (o === prev) opt.selected = true;
            input.appendChild(opt);
          });
        } else {
          input = document.createElement('input');
          input.type = 'text';
          input.value = prev;
        }
        input.className = 'brut-table-edit__input';
        cell.insertBefore(input, hidden);
        input.focus();
        if (input.select) input.select();

        var done = false;
        function commit(value) {
          if (done) return;
          done = true;
          hidden.value = value;
          cell.setAttribute('data-sort-value', value);
          cleanup();
          cell.appendChild(document.createTextNode(value));
          cell.dispatchEvent(new CustomEvent('brut:change', {
            detail: { rowKey: rowKey, colKey: colKey, value: value, prev: prev },
            bubbles: true
          }));
        }
        function cancel() {
          if (done) return;
          done = true;
          cleanup();
          cell.appendChild(document.createTextNode(prev));
        }
        function cleanup() {
          cell.classList.remove('brut-table-edit--editing');
          if (input.parentNode) input.parentNode.removeChild(input);
        }
        input.addEventListener('keydown', function (e) {
          if (e.key === 'Enter') { e.preventDefault(); commit(input.value); }
          else if (e.key === 'Escape') { e.preventDefault(); cancel(); }
        });
        input.addEventListener('blur', function () { commit(input.value); });
      }

      cell.addEventListener('click', function (e) {
        if (e.target === hidden) return;
        startEdit();
      });
      cell.setAttribute('tabindex', '0');
      cell.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); startEdit(); }
      });
    }
  });
})();
