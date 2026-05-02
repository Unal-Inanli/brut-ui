(function () {
  Brut.register('table-row-expand', {
    selector: '[data-brut="table-row-expand"]',
    init: function (tr) {
      var firstCell = tr.children[0];
      if (!firstCell) return;
      var detailRef = tr.getAttribute('data-brut-row-detail');
      var template = detailRef ? document.getElementById(detailRef) : tr.querySelector('template[data-brut-row-detail]');
      if (!template) return;

      var chevron = document.createElement('button');
      chevron.setAttribute('type', 'button');
      chevron.className = 'brut-table__chevron';
      chevron.setAttribute('aria-expanded', 'false');
      chevron.setAttribute('aria-label', 'Expand row');
      chevron.textContent = '▸';
      firstCell.insertBefore(chevron, firstCell.firstChild);

      var open = false;
      var detailRow = null;
      var colspan = tr.children.length;

      function build() {
        var node = template.content ? template.content.cloneNode(true) : template.cloneNode(true).children[0] || template;
        detailRow = document.createElement('tr');
        detailRow.className = 'brut-table__expansion';
        detailRow.setAttribute('data-brut-row-expansion', '');
        var td = document.createElement('td');
        td.className = 'brut-table__expansion-cell';
        td.colSpan = colspan;
        td.appendChild(node);
        detailRow.appendChild(td);
        tr.parentNode.insertBefore(detailRow, tr.nextSibling);
      }

      function toggle() {
        open = !open;
        tr.classList.toggle('brut-table__row--expanded', open);
        chevron.setAttribute('aria-expanded', open ? 'true' : 'false');
        chevron.textContent = open ? '▾' : '▸';
        if (open) {
          if (!detailRow) build();
          else detailRow.removeAttribute('hidden');
        } else if (detailRow) {
          detailRow.setAttribute('hidden', '');
        }
        tr.dispatchEvent(new CustomEvent('brut:change', { detail: { expanded: open }, bubbles: true }));
      }

      chevron.addEventListener('click', toggle);
      chevron.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
      });
    }
  });
})();
