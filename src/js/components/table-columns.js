/* table-columns — column show/hide menu for .brut-table.
   Add data-brut="table-columns" data-brut-table="<id>" to a <button>.
   Every <th> and <td> must carry data-col="<key>".
   Injects per-key CSS attribute-selector rules; hides cells by writing
   data-col-hidden="key1 key2 …" on the <table>. */
(function () {
  if (!window.Brut) return;
  Brut.register('table-columns', {
    selector: '[data-brut="table-columns"]',
    init: function (el) {
      var tableId = el.getAttribute('data-brut-table');
      var table = tableId ? document.getElementById(tableId) : null;
      if (!table) return;
      var name = el.getAttribute('data-brut-name') || 'visible_cols';

      var hidden = el.parentNode.querySelector('input[type="hidden"][data-brut-cols-state]');
      if (!hidden) {
        hidden = document.createElement('input');
        hidden.type = 'hidden';
        hidden.setAttribute('data-brut-cols-state', '');
        hidden.name = name;
        el.parentNode.insertBefore(hidden, el.nextSibling);
      }

      var ths = Array.prototype.slice.call(table.querySelectorAll('thead th[data-col]'));
      var menuId = 'brut-cols-menu-' + Math.random().toString(36).slice(2, 9);
      el.setAttribute('type', 'button');
      el.setAttribute('data-brut-menu-open', menuId);

      /* Inject one CSS rule per column key so hiding is pure CSS, no cell mutation. */
      var styleEl = document.createElement('style');
      styleEl.textContent = ths.map(function (th) {
        var safe = th.getAttribute('data-col').replace(/["\\]/g, '\\$&');
        return '.brut-table[data-col-hidden~="' + safe + '"] [data-col="' + safe + '"] { display: none; }';
      }).join('\n');
      document.head.appendChild(styleEl);

      var menu = document.createElement('div');
      menu.className = 'brut-menu';
      menu.setAttribute('data-brut', 'menu');
      menu.id = menuId;
      menu.setAttribute('role', 'menu');

      var hiddenCols = {};

      function apply() {
        var hideList = Object.keys(hiddenCols).filter(function (k) { return hiddenCols[k]; });
        if (hideList.length) table.setAttribute('data-col-hidden', hideList.join(' '));
        else table.removeAttribute('data-col-hidden');
        var visible = ths.map(function (h) { return h.getAttribute('data-col'); }).filter(function (k) { return !hiddenCols[k]; });
        hidden.value = visible.join(',');
        el.dispatchEvent(new CustomEvent('brut:change', { detail: { visible: visible }, bubbles: true }));
      }

      ths.forEach(function (th) {
        var key = th.getAttribute('data-col');
        var label = th.getAttribute('data-brut-col-label') || (th.textContent || key).trim();
        var item = document.createElement('label');
        item.className = 'brut-menu__item brut-table-columns-menu__item';
        item.setAttribute('role', 'menuitemcheckbox');
        item.setAttribute('aria-checked', 'true');
        var cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.checked = true;
        cb.addEventListener('change', function () {
          hiddenCols[key] = !cb.checked;
          item.setAttribute('aria-checked', cb.checked ? 'true' : 'false');
          apply();
        });
        item.appendChild(cb);
        var span = document.createElement('span');
        span.textContent = label;
        item.appendChild(span);
        menu.appendChild(item);
      });

      el.parentNode.insertBefore(menu, el.nextSibling);

      /* menu.js wires the menu element only on Brut.init — re-run on the parent so
         the dynamically inserted menu div gets picked up by menu.js. */
      Brut.init(el.parentNode);

      apply();
    }
  });
})();
