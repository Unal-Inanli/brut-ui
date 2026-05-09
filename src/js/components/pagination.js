/* pagination — page navigation with prev/next, numbered buttons,
   first/last anchors, and ellipsis gaps for large page counts.

   Markup:
     <nav class="brut-pagination" data-brut="pagination"
          data-total="200" data-page-size="20" data-page="1">
       <!-- buttons rendered by JS -->
     </nav>

   data-total         total items in the dataset (required, > 0)
   data-page-size     items per page (required, > 0)
   data-page          current page, 1-based (default 1)
   data-sibling-count pages on each side of current (default 1)

   Dispatches `brut:change` with detail = { page, pageSize, total }. */
(function () {
  if (!window.Brut) return;
  Brut.register('pagination', {
    selector: '[data-brut="pagination"]',
    init: function (el) {
      var total    = parseInt(el.getAttribute('data-total'), 10);
      var pageSize = parseInt(el.getAttribute('data-page-size'), 10);
      var page     = parseInt(el.getAttribute('data-page'), 10) || 1;
      var siblings = parseInt(el.getAttribute('data-sibling-count'), 10);
      if (isNaN(siblings) || siblings < 0) siblings = 1;
      if (!total || total <= 0 || !pageSize || pageSize <= 0) return;

      var totalPages = Math.max(1, Math.ceil(total / pageSize));
      if (page < 1) page = 1;
      if (page > totalPages) page = totalPages;

      if (!el.hasAttribute('role'))       el.setAttribute('role', 'navigation');
      if (!el.hasAttribute('aria-label')) el.setAttribute('aria-label', 'Pagination');

      function pagesToShow() {
        // Always include 1 and totalPages, plus current ± siblings.
        // Insert gap markers (null) when consecutive items jump.
        var set = {};
        set[1] = true;
        set[totalPages] = true;
        for (var p = page - siblings; p <= page + siblings; p++) {
          if (p >= 1 && p <= totalPages) set[p] = true;
        }
        var nums = Object.keys(set).map(function (k) { return parseInt(k, 10); });
        nums.sort(function (a, b) { return a - b; });
        var out = [];
        for (var i = 0; i < nums.length; i++) {
          if (i > 0 && nums[i] - nums[i - 1] > 1) out.push(null);
          out.push(nums[i]);
        }
        return out;
      }

      function makeBtn(label, ariaLabel, targetPage, extraClass, isActive, isDisabled) {
        var b = document.createElement('button');
        b.setAttribute('type', 'button');
        b.className = 'brut-pagination__btn' + (extraClass ? ' ' + extraClass : '');
        b.textContent = label;
        if (ariaLabel) b.setAttribute('aria-label', ariaLabel);
        if (targetPage != null) b.setAttribute('data-page', String(targetPage));
        if (isActive) b.setAttribute('aria-current', 'page');
        if (isDisabled) b.disabled = true;
        return b;
      }

      function render() {
        el.setAttribute('data-page', String(page));
        while (el.firstChild) el.removeChild(el.firstChild);

        el.appendChild(makeBtn('‹', 'Previous page', page - 1,
          'brut-pagination__btn--prev', false, page <= 1));

        var items = pagesToShow();
        for (var i = 0; i < items.length; i++) {
          var n = items[i];
          if (n === null) {
            var gap = document.createElement('span');
            gap.className = 'brut-pagination__gap';
            gap.setAttribute('aria-hidden', 'true');
            gap.textContent = '…';
            el.appendChild(gap);
          } else {
            el.appendChild(makeBtn(String(n), 'Page ' + n, n,
              n === page ? 'brut-pagination__btn--active' : '', n === page, false));
          }
        }

        el.appendChild(makeBtn('›', 'Next page', page + 1,
          'brut-pagination__btn--next', false, page >= totalPages));
      }

      function goTo(target) {
        if (target < 1) target = 1;
        if (target > totalPages) target = totalPages;
        if (target === page) return;
        page = target;
        render();
        el.dispatchEvent(new CustomEvent('brut:change', {
          detail: { value: page, page: page, pageSize: pageSize, total: total }
        }));
      }

      el.addEventListener('click', function (e) {
        var t = e.target;
        if (!t || !t.getAttribute) return;
        var btn = t.closest ? t.closest('[data-page]') : null;
        if (!btn || !el.contains(btn)) return;
        if (btn.disabled) return;
        var n = parseInt(btn.getAttribute('data-page'), 10);
        if (!isNaN(n)) goTo(n);
      });

      el.addEventListener('keydown', function (e) {
        switch (e.key) {
          case 'ArrowLeft':  e.preventDefault(); goTo(page - 1); break;
          case 'ArrowRight': e.preventDefault(); goTo(page + 1); break;
          case 'Home':       e.preventDefault(); goTo(1); break;
          case 'End':        e.preventDefault(); goTo(totalPages); break;
          default: return;
        }
      });

      render();
    }
  });
})();
