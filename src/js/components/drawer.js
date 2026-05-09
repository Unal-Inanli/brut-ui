/* drawer — side sheet that slides in from any edge.
   Markup:
     <button data-brut-open="cart">CART</button>
     <div class="brut-scrim" id="cart-scrim" hidden></div>
     <div class="brut-drawer brut-drawer--right" id="cart"
          data-brut="drawer" data-brut-side="right"
          data-brut-scrim="cart-scrim" hidden role="dialog">
       <div class="brut-drawer__head">
         <span>CART</span>
         <button class="brut-drawer__x" data-brut-close>×</button>
       </div>
       <div class="brut-drawer__body">…</div>
     </div>
   Triggers on [data-brut-open="<id>"] open the drawer. .brut-drawer__x
   or any [data-brut-close] inside closes it. Esc closes the drawer; the
   scrim closes on outside click. The CSS transform direction is driven
   by the .brut-drawer--<side> class; .brut-drawer--open commits the
   open transform. Dispatches brut:open / brut:close. */
(function () {
  if (!window.Brut) return;
  Brut.register('drawer', {
    selector: '[data-brut="drawer"]',
    init: function (el) {
      if (!el.id) return;

      var side = el.getAttribute('data-brut-side') || 'right';
      var sideClass = 'brut-drawer--' + side;
      if (!el.classList.contains(sideClass)) el.classList.add(sideClass);

      var scrimId = el.getAttribute('data-brut-scrim');
      var scrim = scrimId ? document.getElementById(scrimId) : null;

      function open() {
        if (!el.hasAttribute('hidden') && el.classList.contains('brut-drawer--open')) return;
        el.removeAttribute('hidden');
        if (scrim) scrim.removeAttribute('hidden');
        // Force layout so the transition runs from the closed transform.
        void el.offsetWidth;
        el.classList.add('brut-drawer--open');
        if (Brut.scrollLock) Brut.scrollLock.acquire();
        el.dispatchEvent(new CustomEvent('brut:open'));
      }
      function close() {
        if (el.hasAttribute('hidden')) return;
        el.classList.remove('brut-drawer--open');
        el.setAttribute('hidden', '');
        if (scrim) scrim.setAttribute('hidden', '');
        if (Brut.scrollLock) Brut.scrollLock.release();
        el.dispatchEvent(new CustomEvent('brut:close'));
      }

      document.querySelectorAll('[data-brut-open="' + el.id + '"]').forEach(function (t) {
        if (t.tagName === 'BUTTON') t.setAttribute('type', 'button');
        t.addEventListener('click', function (e) { e.preventDefault(); open(); });
      });

      el.querySelectorAll('[data-brut-close], .brut-drawer__x').forEach(function (t) {
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
