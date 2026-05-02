/* popover — anchored card opened by a trigger.
   Markup:
     <button class="brut-btn" data-brut-popover-open="filters">FILTERS</button>
     <div class="brut-popover" id="filters" data-brut="popover" hidden>
       <div class="brut-popover__head">
         <span>Filters</span>
         <button class="brut-popover__x" data-brut-close type="button">×</button>
       </div>
       <div class="brut-popover__body">…</div>
     </div>
   Click trigger to open. Click outside / Esc / [data-brut-close] closes.
   Position is computed under the trigger via getBoundingClientRect(). */
(function () {
  if (!window.Brut) return;
  Brut.register('popover', {
    selector: '[data-brut="popover"]',
    init: function (el) {
      if (!el.id) return;

      var triggers = document.querySelectorAll('[data-brut-popover-open="' + el.id + '"]');
      var lastTrigger = null;

      function position() {
        if (!lastTrigger) return;
        var r = lastTrigger.getBoundingClientRect();
        var sx = window.pageXOffset || document.documentElement.scrollLeft;
        var sy = window.pageYOffset || document.documentElement.scrollTop;
        var gap = 8;
        el.style.position = 'absolute';
        el.style.top  = Math.round(r.bottom + sy + gap) + 'px';
        el.style.left = Math.round(r.left   + sx) + 'px';
      }

      function open(trigger) {
        lastTrigger = trigger || lastTrigger;
        el.removeAttribute('hidden');
        position();
        el.dispatchEvent(new CustomEvent('brut:open'));
      }
      function close() {
        if (el.hasAttribute('hidden')) return;
        el.setAttribute('hidden', '');
        el.dispatchEvent(new CustomEvent('brut:close'));
      }

      triggers.forEach(function (t) {
        if (t.tagName === 'BUTTON') t.setAttribute('type', 'button');
        t.addEventListener('click', function (e) {
          e.preventDefault();
          if (el.hasAttribute('hidden')) open(t); else close();
        });
      });

      el.querySelectorAll('[data-brut-close], .brut-popover__x').forEach(function (t) {
        if (t.tagName === 'BUTTON') t.setAttribute('type', 'button');
        t.addEventListener('click', function (e) { e.preventDefault(); close(); });
      });

      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && !el.hasAttribute('hidden')) close();
      });

      document.addEventListener('click', function (e) {
        if (el.hasAttribute('hidden')) return;
        if (el.contains(e.target)) return;
        for (var i = 0; i < triggers.length; i++) {
          if (triggers[i].contains(e.target)) return;
        }
        close();
      });

      window.addEventListener('resize', function () {
        if (!el.hasAttribute('hidden')) position();
      });
      window.addEventListener('scroll', function () {
        if (!el.hasAttribute('hidden')) position();
      }, true);
    }
  });
})();
