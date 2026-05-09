/* dialog — show/hide for .brut-dialog. Pair with optional .brut-scrim sibling.
   Markup:
     <button data-brut-open="confirm">DELETE</button>
     <div class="brut-scrim" id="confirm-scrim" hidden></div>
     <div class="brut-dialog" id="confirm" data-brut="dialog" data-brut-scrim="confirm-scrim" hidden role="dialog">
       <div class="brut-dialog__head">
         <span>CONFIRM</span>
         <button class="brut-dialog__x" data-brut-close>×</button>
       </div>
       …
     </div>
   Triggers on [data-brut-open="<id>"] open the dialog. Inside the
   dialog, .brut-dialog__x or any [data-brut-close] closes it.
   Escape closes any open dialog; clicking the scrim closes it. */
(function () {
  if (!window.Brut) return;
  var titleCounter = 0;
  Brut.register('dialog', {
    selector: '[data-brut="dialog"]',
    init: function (el) {
      if (!el.id) return;
      var scrimId = el.getAttribute('data-brut-scrim');
      var scrim = scrimId ? document.getElementById(scrimId) : null;

      if (!el.hasAttribute('aria-labelledby') && !el.hasAttribute('aria-label')) {
        var head = el.querySelector('.brut-dialog__head');
        var heading = (head && head.querySelector('h1, h2, h3, h4, h5, h6, [data-brut-dialog-title]'))
          || el.querySelector('h1, h2, h3, h4, h5, h6, [data-brut-dialog-title]');
        if (heading) {
          if (!heading.id) heading.id = 'brut-dialog-title-' + (++titleCounter);
          el.setAttribute('aria-labelledby', heading.id);
        }
      }

      function open() {
        el.removeAttribute('hidden');
        el.setAttribute('aria-modal', 'true');
        if (scrim) scrim.removeAttribute('hidden');
        el.dispatchEvent(new CustomEvent('brut:open'));
      }
      function close() {
        el.setAttribute('hidden', '');
        el.removeAttribute('aria-modal');
        if (scrim) scrim.setAttribute('hidden', '');
        el.dispatchEvent(new CustomEvent('brut:close'));
      }

      document.querySelectorAll('[data-brut-open="' + el.id + '"]').forEach(function (t) {
        t.addEventListener('click', function (e) { e.preventDefault(); open(); });
      });

      el.querySelectorAll('[data-brut-close], .brut-dialog__x').forEach(function (t) {
        if (t.tagName === 'BUTTON') t.setAttribute('type', 'button');
        t.addEventListener('click', function (e) { e.preventDefault(); close(); });
      });

      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && !el.hasAttribute('hidden')) close();
      });

      if (scrim) {
        scrim.addEventListener('click', function (e) {
          if (e.target === scrim) close();
        });
      }
    }
  });
})();
