(function () {
  Brut.register('table-pagination', {
    selector: '[data-brut="table-pagination"]',
    init: function (el) {
      var tableId = el.getAttribute('data-brut-table');
      var table = tableId ? document.getElementById(tableId) : null;
      if (!table) return;
      var pageSize = Math.max(1, parseInt(el.getAttribute('data-brut-page-size') || '10', 10));
      var name = el.getAttribute('data-brut-name') || 'page';
      var hidden = el.querySelector('input[type="hidden"][data-brut-pager-state]');
      if (!hidden) {
        hidden = document.createElement('input');
        hidden.type = 'hidden';
        hidden.setAttribute('data-brut-pager-state', '');
        hidden.name = name;
        el.appendChild(hidden);
      }
      var current = 1;

      function makeBtn(label, page, active, total) {
        var b = document.createElement('button');
        b.setAttribute('type', 'button');
        b.className = 'brut-pager__btn' + (active ? ' brut-pager__btn--active' : '');
        b.textContent = label;
        b.addEventListener('click', function () {
          if (page >= 1 && page <= total) { current = page; render(); }
        });
        return b;
      }

      function makeGap() {
        var s = document.createElement('span');
        s.className = 'brut-pager__gap';
        s.textContent = '…';
        return s;
      }

      function render() {
        // Single DOM query — used for both hide logic and totalPages calculation
        var allRows = Array.prototype.slice.call(table.querySelectorAll('tbody tr'));

        // Reset prior pager-driven hides; respect other hides set by callers
        allRows.forEach(function (r) { r.removeAttribute('data-brut-pager-hidden'); });

        // Rows not hidden by other decorators (convention: they use the `hidden` attr)
        var pool = allRows.filter(function (r) { return !r.hasAttribute('hidden'); });
        var total = Math.max(1, Math.ceil(pool.length / pageSize));
        if (current > total) current = total;

        pool.forEach(function (r, i) {
          if (Math.floor(i / pageSize) + 1 !== current) {
            r.setAttribute('data-brut-pager-hidden', '');
            r.setAttribute('hidden', '');
          }
        });

        // Render buttons
        var btnHost = el.querySelector('[data-brut-pager-buttons]');
        if (!btnHost) {
          btnHost = document.createElement('div');
          btnHost.setAttribute('data-brut-pager-buttons', '');
          el.appendChild(btnHost);
        }
        btnHost.innerHTML = '';

        function pageBtn(p) { btnHost.appendChild(makeBtn(String(p), p, p === current, total)); }

        var prev = makeBtn('‹', current - 1, false, total);
        prev.classList.add('brut-pager__btn--prev');
        if (current === 1) prev.disabled = true;
        btnHost.appendChild(prev);

        pageBtn(1);
        if (current > 3) btnHost.appendChild(makeGap());
        for (var p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) pageBtn(p);
        if (current < total - 2) btnHost.appendChild(makeGap());
        if (total > 1) pageBtn(total);

        var next = makeBtn('›', current + 1, false, total);
        next.classList.add('brut-pager__btn--next');
        if (current === total) next.disabled = true;
        btnHost.appendChild(next);

        hidden.value = String(current);
        el.dispatchEvent(new CustomEvent('brut:change', { detail: { page: current, totalPages: total }, bubbles: true }));
      }

      render();
      // Re-render when other decorators change row visibility
      table.addEventListener('brut:change', function () { render(); });
    }
  });
})();
