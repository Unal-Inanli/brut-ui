/* date — text field + popover calendar with keyboard nav.
   Markup:
     <div class="brut-date" data-brut="date" data-brut-name="due">
       <input class="brut-input brut-date__field" type="text" readonly placeholder="YYYY-MM-DD" />
       <input type="hidden" />
     </div>
   Selecting a day writes ISO `YYYY-MM-DD` into the visible field and the
   hidden mirror, then dispatches brut:change with { value }.
   Native Date only — no deps. */
(function () {
  if (!window.Brut) return;

  var DOW = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];
  var MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
                'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

  function pad2(n) { return n < 10 ? '0' + n : '' + n; }
  function iso(d) { return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); }
  function parseISO(s) {
    if (!s) return null;
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s.trim());
    if (!m) return null;
    var y = +m[1], mo = +m[2] - 1, da = +m[3];
    var d = new Date(y, mo, da);
    if (d.getFullYear() !== y || d.getMonth() !== mo || d.getDate() !== da) return null;
    return d;
  }
  function sameYMD(a, b) {
    return a && b
      && a.getFullYear() === b.getFullYear()
      && a.getMonth()    === b.getMonth()
      && a.getDate()     === b.getDate();
  }
  function startOfMonth(d) { return new Date(d.getFullYear(), d.getMonth(), 1); }
  // Monday=0 ... Sunday=6
  function dowMon(d) { return (d.getDay() + 6) % 7; }

  Brut.register('date', {
    selector: '[data-brut="date"]',
    init: function (el) {
      var field = el.querySelector('.brut-date__field') || el.querySelector('input[type="text"], input[type="date"], input:not([type])');
      if (!field) return;

      // Hidden mirror
      var hidden = el.querySelector('input[type="hidden"]');
      if (!hidden && el.getAttribute('data-brut-name')) {
        hidden = document.createElement('input');
        hidden.type = 'hidden';
        hidden.name = el.getAttribute('data-brut-name');
        el.appendChild(hidden);
      }

      // State
      var today = new Date();
      today.setHours(0, 0, 0, 0);

      var initial = parseISO(field.value) || parseISO(hidden && hidden.value);
      var selected = initial; // Date or null
      var view = startOfMonth(initial || today);
      var focusDay = new Date((selected || today).getTime());

      // Build popover scaffolding
      var pop = el.querySelector('.brut-date__pop');
      if (!pop) {
        pop = document.createElement('div');
        pop.className = 'brut-date__pop';
        el.appendChild(pop);
      }
      pop.innerHTML = '';

      var head = document.createElement('div');
      head.className = 'brut-date__head';
      var prevBtn = document.createElement('button');
      prevBtn.className = 'brut-date__nav-btn';
      prevBtn.setAttribute('type', 'button');
      prevBtn.setAttribute('aria-label', 'Previous month');
      prevBtn.textContent = '‹';
      var title = document.createElement('span');
      title.className = 'brut-date__title';
      var nextBtn = document.createElement('button');
      nextBtn.className = 'brut-date__nav-btn';
      nextBtn.setAttribute('type', 'button');
      nextBtn.setAttribute('aria-label', 'Next month');
      nextBtn.textContent = '›';
      head.appendChild(prevBtn);
      head.appendChild(title);
      head.appendChild(nextBtn);
      pop.appendChild(head);

      var dows = document.createElement('div');
      dows.className = 'brut-date__dows';
      DOW.forEach(function (name) {
        var s = document.createElement('span');
        s.className = 'brut-date__dow';
        s.textContent = name;
        dows.appendChild(s);
      });
      pop.appendChild(dows);

      var grid = document.createElement('div');
      grid.className = 'brut-date__grid';
      grid.setAttribute('role', 'grid');
      pop.appendChild(grid);

      function render() {
        title.textContent = MONTHS[view.getMonth()] + ' ' + view.getFullYear();
        grid.innerHTML = '';
        var first = startOfMonth(view);
        var startCell = new Date(first.getTime());
        startCell.setDate(first.getDate() - dowMon(first));
        // Always 6 weeks = 42 cells.
        for (var i = 0; i < 42; i++) {
          var d = new Date(startCell.getTime());
          d.setDate(startCell.getDate() + i);
          var btn = document.createElement('button');
          btn.className = 'brut-date__day';
          btn.setAttribute('type', 'button');
          btn.setAttribute('role', 'gridcell');
          btn.textContent = d.getDate();
          btn.setAttribute('data-iso', iso(d));
          if (d.getMonth() !== view.getMonth()) btn.classList.add('brut-date__day--out');
          if (sameYMD(d, today))    btn.classList.add('brut-date__day--today');
          if (sameYMD(d, selected)) btn.classList.add('brut-date__day--selected');
          if (sameYMD(d, focusDay)) btn.setAttribute('tabindex', '0'); else btn.setAttribute('tabindex', '-1');
          btn.addEventListener('click', function (ev) {
            commit(parseISO(ev.currentTarget.getAttribute('data-iso')));
          });
          btn.addEventListener('keydown', onKey);
          grid.appendChild(btn);
        }
      }

      function focusActive() {
        var node = grid.querySelector('[tabindex="0"]');
        if (node && document.activeElement && pop.contains(document.activeElement)) {
          node.focus();
        }
      }

      function move(days) {
        var d = new Date(focusDay.getTime());
        d.setDate(d.getDate() + days);
        focusDay = d;
        // If we crossed into another month, reset view.
        if (d.getMonth() !== view.getMonth() || d.getFullYear() !== view.getFullYear()) {
          view = startOfMonth(d);
        }
        render();
        var node = grid.querySelector('[data-iso="' + iso(focusDay) + '"]');
        if (node) node.focus();
      }

      function onKey(e) {
        if (e.key === 'ArrowLeft')  { e.preventDefault(); move(-1); }
        else if (e.key === 'ArrowRight') { e.preventDefault(); move(1); }
        else if (e.key === 'ArrowUp')    { e.preventDefault(); move(-7); }
        else if (e.key === 'ArrowDown')  { e.preventDefault(); move(7); }
        else if (e.key === 'Enter')      { e.preventDefault(); commit(new Date(focusDay.getTime())); }
        else if (e.key === 'Escape')     { e.preventDefault(); close(); field.focus(); }
        else if (e.key === 'PageUp')     { e.preventDefault(); shiftMonth(-1); }
        else if (e.key === 'PageDown')   { e.preventDefault(); shiftMonth(1); }
      }

      function shiftMonth(delta) {
        view = new Date(view.getFullYear(), view.getMonth() + delta, 1);
        // Keep focusDay's day-of-month, clamped.
        var dim = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
        var day = Math.min(focusDay.getDate(), dim);
        focusDay = new Date(view.getFullYear(), view.getMonth(), day);
        render();
        focusActive();
      }

      var skipNextOpen = false;

      function commit(d) {
        if (!d) return;
        selected = d;
        focusDay = new Date(d.getTime());
        view = startOfMonth(d);
        var s = iso(d);
        field.value = s;
        if (hidden) hidden.value = s;
        render();
        el.dispatchEvent(new CustomEvent('brut:change', { detail: { value: s } }));
        close();
        skipNextOpen = true;
        field.focus();
      }

      function open() {
        if (skipNextOpen) { skipNextOpen = false; return; }
        if (el.classList.contains('brut-date--open')) return;
        // Re-anchor view + focusDay to current value if any.
        var cur = parseISO(field.value) || selected || today;
        focusDay = new Date(cur.getTime());
        if (cur.getMonth() !== view.getMonth() || cur.getFullYear() !== view.getFullYear()) {
          view = startOfMonth(cur);
        }
        el.classList.add('brut-date--open');
        field.setAttribute('aria-expanded', 'true');
        render();
        // Defer focus to next tick so click handlers don't immediately blur.
        setTimeout(function () {
          var node = grid.querySelector('[tabindex="0"]');
          if (node) node.focus();
        }, 0);
      }

      function close() {
        el.classList.remove('brut-date--open');
        field.setAttribute('aria-expanded', 'false');
      }

      // Wire field
      field.setAttribute('role', 'combobox');
      field.setAttribute('aria-haspopup', 'dialog');
      field.setAttribute('aria-expanded', 'false');
      if (!field.getAttribute('placeholder')) field.setAttribute('placeholder', 'YYYY-MM-DD');
      field.addEventListener('focus', open);
      field.addEventListener('click', open);
      field.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowDown' || e.key === 'Enter') {
          e.preventDefault();
          open();
        } else if (e.key === 'Escape') {
          close();
        }
      });
      field.addEventListener('change', function () {
        var p = parseISO(field.value);
        if (p) {
          selected = p;
          view = startOfMonth(p);
          focusDay = new Date(p.getTime());
          if (hidden) hidden.value = iso(p);
        }
      });

      prevBtn.addEventListener('click', function () { shiftMonth(-1); });
      nextBtn.addEventListener('click', function () { shiftMonth(1); });

      // Outside click closes.
      document.addEventListener('mousedown', function (e) {
        if (!el.contains(e.target)) close();
      });

      // Initial mirror sync if value pre-filled.
      if (selected && hidden && !hidden.value) hidden.value = iso(selected);

      render();
    }
  });
})();
