/* tabs — show/hide panels matched by data-brut-tab / data-brut-panel.
   Markup:
     <div class="brut-tabs" data-brut="tabs">
       <button class="brut-tab brut-tab--on" data-brut-tab="overview">OVERVIEW</button>
       <button class="brut-tab" data-brut-tab="logs">LOGS</button>
     </div>
     <div data-brut-panel="overview">…</div>
     <div data-brut-panel="logs" hidden>…</div>
   By default panels are looked up in the tablist's parent. Pass a
   selector via data-brut-panels="#some-root" to scope elsewhere. */
(function () {
  if (!window.Brut) return;
  Brut.register('tabs', {
    selector: '[data-brut="tabs"]',
    init: function (el) {
      var rootSel = el.getAttribute('data-brut-panels');
      var panelRoot = rootSel ? document.querySelector(rootSel) : el.parentElement;
      var panels = {};
      if (panelRoot) {
        panelRoot.querySelectorAll('[data-brut-panel]').forEach(function (p) {
          panels[p.getAttribute('data-brut-panel')] = p;
        });
      }

      function activate(btn) {
        el.querySelectorAll('.brut-tab').forEach(function (b) {
          b.classList.remove('brut-tab--on');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('brut-tab--on');
        btn.setAttribute('aria-selected', 'true');
        var key = btn.getAttribute('data-brut-tab');
        Object.keys(panels).forEach(function (k) { panels[k].hidden = k !== key; });
        el.dispatchEvent(new CustomEvent('brut:change', { detail: { value: key } }));
      }

      el.querySelectorAll('.brut-tab').forEach(function (btn) {
        btn.setAttribute('type', 'button');
        btn.setAttribute('role', 'tab');
        btn.addEventListener('click', function () { activate(btn); });
      });

      var initial = el.querySelector('.brut-tab--on') || el.querySelector('.brut-tab');
      if (initial) activate(initial);
    }
  });
})();
