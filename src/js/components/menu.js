/* menu — context / overflow menu.
   Markup:
     <button class="brut-btn" data-brut-menu-open="row-actions">⋯</button>
     <div class="brut-menu" id="row-actions" data-brut="menu" hidden>
       <button class="brut-menu__item" type="button">Edit</button>
       <button class="brut-menu__item" type="button">Duplicate</button>
       <hr class="brut-menu__sep"/>
       <button class="brut-menu__item brut-menu__item--danger" type="button">Delete</button>
     </div>
   Click trigger to open. Click outside / Esc / item click closes.
   Arrow keys move focus among items. Position is computed under the
   trigger via getBoundingClientRect(). Dispatches brut:open / brut:close. */
(function () {
  if (!window.Brut) return;
  Brut.register('menu', {
    selector: '[data-brut="menu"]',
    init: function (el) {
      if (!el.id) return;

      var triggers = document.querySelectorAll('[data-brut-menu-open="' + el.id + '"]');
      var lastTrigger = null;

      if (!el.hasAttribute('role')) el.setAttribute('role', 'menu');

      function items() {
        return el.querySelectorAll('.brut-menu__item');
      }

      // Assign WAI-ARIA Menu pattern roles to children.
      var initialItems = el.querySelectorAll('.brut-menu__item');
      for (var ii = 0; ii < initialItems.length; ii++) {
        var item = initialItems[ii];
        if (!item.hasAttribute('role')) item.setAttribute('role', 'menuitem');
        if (item.hasAttribute('disabled')) item.setAttribute('aria-disabled', 'true');
      }
      var seps = el.querySelectorAll('hr');
      for (var si = 0; si < seps.length; si++) {
        if (!seps[si].hasAttribute('role')) seps[si].setAttribute('role', 'separator');
      }

      function position() {
        if (!lastTrigger) return;
        var r = lastTrigger.getBoundingClientRect();
        var sx = window.pageXOffset || document.documentElement.scrollLeft;
        var sy = window.pageYOffset || document.documentElement.scrollTop;
        var gap = 6;
        el.style.position = 'absolute';
        el.style.top  = Math.round(r.bottom + sy + gap) + 'px';
        el.style.left = Math.round(r.left   + sx) + 'px';
      }

      function open(trigger) {
        lastTrigger = trigger || lastTrigger;
        el.removeAttribute('hidden');
        position();
        if (lastTrigger) lastTrigger.setAttribute('aria-expanded', 'true');
        var first = el.querySelector('.brut-menu__item');
        if (first) {
          try { first.focus(); } catch (e) { /* ignore */ }
        }
        el.dispatchEvent(new CustomEvent('brut:open'));
      }
      function close() {
        if (el.hasAttribute('hidden')) return;
        el.setAttribute('hidden', '');
        triggers.forEach(function (t) { t.setAttribute('aria-expanded', 'false'); });
        el.dispatchEvent(new CustomEvent('brut:close'));
      }

      triggers.forEach(function (t) {
        if (t.tagName === 'BUTTON') t.setAttribute('type', 'button');
        t.setAttribute('aria-haspopup', 'menu');
        t.setAttribute('aria-expanded', 'false');
        t.addEventListener('click', function (e) {
          e.preventDefault();
          if (el.hasAttribute('hidden')) open(t); else close();
        });
      });

      // Item click closes the menu.
      el.addEventListener('click', function (e) {
        var node = e.target;
        while (node && node !== el) {
          if (node.classList && node.classList.contains('brut-menu__item')) {
            close();
            return;
          }
          node = node.parentNode;
        }
      });

      // Arrow-key focus navigation.
      el.addEventListener('keydown', function (e) {
        var list = items();
        if (!list.length) return;
        var idx = -1;
        for (var i = 0; i < list.length; i++) {
          if (list[i] === document.activeElement) { idx = i; break; }
        }
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          var next = list[(idx + 1 + list.length) % list.length];
          if (next) next.focus();
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          var prev = list[(idx - 1 + list.length) % list.length];
          if (prev) prev.focus();
        } else if (e.key === 'Home') {
          e.preventDefault();
          list[0].focus();
        } else if (e.key === 'End') {
          e.preventDefault();
          list[list.length - 1].focus();
        }
      });

      document.addEventListener('keydown', function (e) {
        if (!el.isConnected) return;
        if (e.key === 'Escape' && !el.hasAttribute('hidden')) {
          close();
          if (lastTrigger) {
            try { lastTrigger.focus(); } catch (err) { /* ignore */ }
          }
        }
      });

      document.addEventListener('click', function (e) {
        if (!el.isConnected) return;
        if (el.hasAttribute('hidden')) return;
        if (el.contains(e.target)) return;
        for (var i = 0; i < triggers.length; i++) {
          if (triggers[i].contains(e.target)) return;
        }
        close();
      });

      window.addEventListener('resize', function () {
        if (!el.isConnected) return;
        if (!el.hasAttribute('hidden')) position();
      });
      window.addEventListener('scroll', function () {
        if (!el.isConnected) return;
        if (!el.hasAttribute('hidden')) position();
      }, { capture: true, passive: true });
    }
  });
})();
