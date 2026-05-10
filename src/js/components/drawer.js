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
  var titleCounter = 0;
  Brut.register('drawer', {
    selector: '[data-brut="drawer"]',
    init: function (el) {
      if (!el.id) return;

      var side = el.getAttribute('data-brut-side') || 'right';
      var sideClass = 'brut-drawer--' + side;
      if (!el.classList.contains(sideClass)) el.classList.add(sideClass);

      // Drawer is a modal dialog. Mirror dialog.js so screen readers announce
      // it as such even when consumers copy markup that omits these attrs.
      if (!el.hasAttribute('role')) el.setAttribute('role', 'dialog');
      if (!el.hasAttribute('aria-modal')) el.setAttribute('aria-modal', 'true');

      var scrimId = el.getAttribute('data-brut-scrim');
      var scrim = scrimId ? document.getElementById(scrimId) : null;

      if (!el.hasAttribute('aria-labelledby') && !el.hasAttribute('aria-label')) {
        var head = el.querySelector('.brut-drawer__head');
        var heading = (head && head.querySelector('h1, h2, h3, h4, h5, h6, [data-brut-drawer-title]'))
          || el.querySelector('h1, h2, h3, h4, h5, h6, [data-brut-drawer-title]');
        if (heading) {
          if (!heading.id) heading.id = 'brut-drawer-title-' + (++titleCounter);
          el.setAttribute('aria-labelledby', heading.id);
        }
      }

      var trap = null;
      var lastTrigger = null;

      function open(trigger) {
        if (!el.hasAttribute('hidden') && el.classList.contains('brut-drawer--open')) return;
        lastTrigger = trigger || lastTrigger;
        el.removeAttribute('hidden');
        if (scrim) scrim.removeAttribute('hidden');
        // Force layout so the transition runs from the closed transform.
        void el.offsetWidth;
        el.classList.add('brut-drawer--open');
        if (Brut.scrollLock) Brut.scrollLock.acquire();
        if (Brut.focusTrap) trap = Brut.focusTrap.activate(el);
        el.dispatchEvent(new CustomEvent('brut:open'));
      }
      function close() {
        if (el.hasAttribute('hidden')) return;
        if (trap) { trap.release(); trap = null; }
        el.classList.remove('brut-drawer--open');
        el.setAttribute('hidden', '');
        if (scrim) scrim.setAttribute('hidden', '');
        if (Brut.scrollLock) Brut.scrollLock.release();
        el.dispatchEvent(new CustomEvent('brut:close'));
        // Restore focus to the element that opened the drawer so keyboard
        // users keep their place. Mirrors dialog.js's pattern.
        if (lastTrigger && lastTrigger.isConnected) {
          try { lastTrigger.focus(); } catch (e) {}
        }
      }

      document.querySelectorAll('[data-brut-open="' + el.id + '"]').forEach(function (t) {
        if (t.tagName === 'BUTTON') t.setAttribute('type', 'button');
        t.addEventListener('click', function (e) { e.preventDefault(); open(t); });
      });

      el.querySelectorAll('[data-brut-close], .brut-drawer__x').forEach(function (t) {
        if (t.tagName === 'BUTTON') t.setAttribute('type', 'button');
        t.addEventListener('click', function (e) { e.preventDefault(); close(); });
      });

      document.addEventListener('keydown', function (e) {
        if (!el.isConnected) return;
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
