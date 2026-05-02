(function () {
  Brut.register('table-row-actions', {
    selector: '[data-brut-row-actions]',
    init: function (btn) {
      btn.setAttribute('type', 'button');
      var menuId = btn.getAttribute('data-brut-row-actions');
      if (!menuId) return;
      btn.setAttribute('data-brut-menu-open', menuId);

      var menu = document.getElementById(menuId);

      // Record which button most recently opened the menu so the click
      // handler knows which row to attach to the dispatched event.
      function markAnchor() {
        if (menu) menu.__brutAnchor = btn;
      }

      btn.addEventListener('click', markAnchor);
      btn.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') markAnchor();
      });

      if (menu && !menu.__brutRowActionsWired) {
        menu.__brutRowActionsWired = true;
        menu.addEventListener('click', function (e) {
          var item = e.target.closest('[data-brut-action]');
          if (!item) return;
          var anchor = menu.__brutAnchor || btn;
          anchor.dispatchEvent(new CustomEvent('brut:row-action', {
            detail: { action: item.getAttribute('data-brut-action'), row: anchor.closest('tr') },
            bubbles: true
          }));
        });
      }
    }
  });
})();
