/* tabs — show/hide panels matched by data-brut-tab / data-brut-panel.
   Markup:
     <div class="brut-tabs" data-brut="tabs">
       <button class="brut-tab brut-tab--on" data-brut-tab="overview">OVERVIEW</button>
       <button class="brut-tab" data-brut-tab="logs">LOGS</button>
     </div>
     <div data-brut-panel="overview">…</div>
     <div data-brut-panel="logs" hidden>…</div>
   By default panels are looked up in the tablist's parent. Pass a
   selector via data-brut-panels="#some-root" to scope elsewhere.

   Keyboard (WAI-ARIA tabs pattern, roving tabindex):
     ArrowLeft / ArrowRight  — focus & activate prev / next (wrap)
     Home / End              — focus & activate first / last */
(function () {
  if (!window.Brut) return;
  var tabIdCounter = 0;
  var panelIdCounter = 0;
  Brut.register('tabs', {
    selector: '[data-brut="tabs"]',
    init: function (el) {
      var rootSel = el.getAttribute('data-brut-panels');
      var panelRoot = rootSel ? document.querySelector(rootSel) : el.parentElement;
      var panels = {};
      if (panelRoot) {
        panelRoot.querySelectorAll('[data-brut-panel]').forEach(function (p) {
          panels[p.getAttribute('data-brut-panel')] = p;
          p.setAttribute('role', 'tabpanel');
          if (!p.id) p.id = 'brut-tabpanel-' + (++panelIdCounter);
        });
      }

      el.setAttribute('role', 'tablist');

      function tabs() {
        return Array.prototype.slice.call(el.querySelectorAll('.brut-tab'));
      }

      function activate(btn, focusIt) {
        var all = tabs();
        all.forEach(function (b) {
          var on = b === btn;
          b.classList.toggle('brut-tab--on', on);
          b.setAttribute('aria-selected', on ? 'true' : 'false');
          b.setAttribute('tabindex', on ? '0' : '-1');
        });
        var key = btn.getAttribute('data-brut-tab');
        Object.keys(panels).forEach(function (k) { panels[k].hidden = k !== key; });
        if (focusIt) btn.focus();
        el.dispatchEvent(new CustomEvent('brut:change', { detail: { value: key } }));
      }

      tabs().forEach(function (btn) {
        btn.setAttribute('type', 'button');
        btn.setAttribute('role', 'tab');
        if (!btn.id) btn.id = 'brut-tab-' + (++tabIdCounter);
        var key = btn.getAttribute('data-brut-tab');
        var p = panels[key];
        if (p) {
          p.setAttribute('aria-labelledby', btn.id);
          btn.setAttribute('aria-controls', p.id);
        }
        btn.addEventListener('click', function () { activate(btn); });
      });

      el.addEventListener('keydown', function (e) {
        var t = e.target;
        if (!t || !t.classList || !t.classList.contains('brut-tab')) return;
        var all = tabs();
        var i = all.indexOf(t);
        if (i < 0) return;
        var next = null;
        switch (e.key) {
          case 'ArrowLeft':  next = all[(i - 1 + all.length) % all.length]; break;
          case 'ArrowRight': next = all[(i + 1) % all.length]; break;
          case 'Home':       next = all[0]; break;
          case 'End':        next = all[all.length - 1]; break;
          default: return;
        }
        e.preventDefault();
        activate(next, true);
      });

      var initial = el.querySelector('.brut-tab--on') || el.querySelector('.brut-tab');
      if (initial) activate(initial);
    }
  });
})();
