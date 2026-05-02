/* table-density — 3-state segmented toggle (compact / regular / comfy)
   that swaps a density modifier on a target <table>.

   Markup:
     <div class="brut-table-density" data-brut="table-density"
          data-brut-table="<table-id>" data-brut-default="regular">
       <button class="brut-table-density__btn" data-density="compact">Compact</button>
       <button class="brut-table-density__btn" data-density="regular">Regular</button>
       <button class="brut-table-density__btn" data-density="comfy">Comfy</button>
     </div>

   State is mirrored to a hidden <input>. Mirror name comes from
   data-brut-name (default: "density"). Dispatches brut:change on
   every committed change.

   Keyboard: Space / Enter activate the focused button (native for
   type="button"). Arrow navigation follows brut-seg convention. */
(function () {
  if (!window.Brut) return;
  Brut.register('table-density', {
    selector: '[data-brut="table-density"]',
    init: function (el) {
      var tableId = el.getAttribute('data-brut-table');
      var table = tableId ? document.getElementById(tableId) : null;
      if (!table) return;
      var name = el.getAttribute('data-brut-name') || 'density';

      var hidden = el.querySelector('input[type="hidden"][data-brut-density-state]');
      if (!hidden) {
        hidden = document.createElement('input');
        hidden.type = 'hidden';
        hidden.setAttribute('data-brut-density-state', '');
        hidden.name = name;
        el.appendChild(hidden);
      }

      var btns = Array.prototype.slice.call(el.querySelectorAll('[data-density]'));

      function apply(value) {
        table.classList.remove('brut-table--compact', 'brut-table--comfy');
        if (value === 'compact') table.classList.add('brut-table--compact');
        else if (value === 'comfy') table.classList.add('brut-table--comfy');
        btns.forEach(function (b) {
          var active = b.getAttribute('data-density') === value;
          b.classList.toggle('brut-table-density__btn--active', active);
          b.setAttribute('aria-pressed', active ? 'true' : 'false');
          b.setAttribute('tabindex', active ? '0' : '-1');
        });
        hidden.value = value;
        el.dispatchEvent(new CustomEvent('brut:change', { detail: { value: value }, bubbles: true }));
      }

      btns.forEach(function (b) {
        b.setAttribute('type', 'button');
        b.addEventListener('click', function () { apply(b.getAttribute('data-density')); });
      });

      el.addEventListener('keydown', function (e) {
        var i = btns.indexOf(e.target);
        if (i < 0) return;
        var next = null;
        switch (e.key) {
          case 'ArrowLeft':
          case 'ArrowUp':   next = btns[(i - 1 + btns.length) % btns.length]; break;
          case 'ArrowRight':
          case 'ArrowDown': next = btns[(i + 1) % btns.length]; break;
          case 'Home':      next = btns[0]; break;
          case 'End':       next = btns[btns.length - 1]; break;
          default: return;
        }
        e.preventDefault();
        apply(next.getAttribute('data-density'));
        next.focus();
      });

      var initial = el.getAttribute('data-brut-default') || 'regular';
      apply(initial);
    }
  });
})();
