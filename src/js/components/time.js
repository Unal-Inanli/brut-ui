/* time — text field + popover hour/minute steppers.
   Markup:
     <div class="brut-time" data-brut="time" data-brut-name="meet" data-brut-mode="24">
       <input class="brut-input brut-time__field" type="text" readonly placeholder="HH:MM" />
       <input type="hidden" />
     </div>
   data-brut-mode="24" (default) | "12". Output is always HH:MM (24h ISO)
   in both visible field and hidden mirror. Dispatches brut:change. */
(function () {
  if (!window.Brut) return;

  function pad2(n) { return n < 10 ? '0' + n : '' + n; }
  function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }

  Brut.register('time', {
    selector: '[data-brut="time"]',
    init: function (el) {
      var field = el.querySelector('.brut-time__field') || el.querySelector('input[type="text"], input[type="time"], input:not([type])');
      if (!field) return;

      var hidden = el.querySelector('input[type="hidden"]');
      if (!hidden && el.getAttribute('data-brut-name')) {
        hidden = document.createElement('input');
        hidden.type = 'hidden';
        hidden.name = el.getAttribute('data-brut-name');
        el.appendChild(hidden);
      }

      var mode = el.getAttribute('data-brut-mode') === '12' ? 12 : 24;
      var minStep = parseInt(el.getAttribute('data-brut-minute-step'), 10) || 1;

      // State (always stored as 0-23 / 0-59)
      var hour = 9, minute = 0;
      var initial = (field.value || (hidden && hidden.value) || '').match(/^(\d{1,2}):(\d{2})$/);
      if (initial) {
        hour = clamp(parseInt(initial[1], 10), 0, 23);
        minute = clamp(parseInt(initial[2], 10), 0, 59);
      }

      // Build popover scaffolding
      var pop = el.querySelector('.brut-time__pop');
      if (!pop) {
        pop = document.createElement('div');
        pop.className = 'brut-time__pop';
        el.appendChild(pop);
      }
      pop.innerHTML = '';

      var row = document.createElement('div');
      row.className = 'brut-time__row';
      pop.appendChild(row);

      function getHourDisplay() {
        if (mode === 24) return hour;
        var h = hour % 12;
        return h === 0 ? 12 : h;
      }
      function setHourFromDisplay(v) {
        if (mode === 24) {
          hour = ((v % 24) + 24) % 24;
        } else {
          var pm = hour >= 12;
          var d = ((v - 1) % 12 + 12) % 12 + 1; // 1..12
          var h24 = (d % 12) + (pm ? 12 : 0);
          hour = h24;
        }
      }
      function getMinute() { return minute; }
      function setMinute(v) {
        var step = minStep;
        if (step <= 1) {
          minute = ((v % 60) + 60) % 60;
        } else {
          var n = ((Math.round(v / step) * step) % 60 + 60) % 60;
          minute = n;
        }
      }

      function buildCol(label, getter, setter) {
        var col = document.createElement('div');
        col.className = 'brut-time__col';

        var lbl = document.createElement('span');
        lbl.className = 'brut-time__col-label';
        lbl.textContent = label;
        col.appendChild(lbl);

        var stepper = document.createElement('div');
        stepper.className = 'brut-stepper';

        var down = document.createElement('button');
        down.className = 'brut-stepper__btn';
        down.setAttribute('type', 'button');
        down.setAttribute('aria-label', label + ' down');
        down.textContent = '−';

        var input = document.createElement('input');
        input.className = 'brut-stepper__input';
        input.type = 'text';
        input.setAttribute('inputmode', 'numeric');
        input.setAttribute('aria-label', label);

        var up = document.createElement('button');
        up.className = 'brut-stepper__btn';
        up.setAttribute('type', 'button');
        up.setAttribute('aria-label', label + ' up');
        up.textContent = '+';

        stepper.appendChild(down);
        stepper.appendChild(input);
        stepper.appendChild(up);
        col.appendChild(stepper);

        function refresh() { input.value = pad2(getter()); }

        down.addEventListener('click', function () { setter(getter() - 1); refresh(); sync(); });
        up.addEventListener('click',   function () { setter(getter() + 1); refresh(); sync(); });
        input.addEventListener('change', function () {
          var n = parseInt(input.value, 10);
          if (!isNaN(n)) setter(n);
          refresh();
          sync();
        });
        input.addEventListener('keydown', function (e) {
          if (e.key === 'ArrowUp')   { e.preventDefault(); setter(getter() + 1); refresh(); sync(); }
          if (e.key === 'ArrowDown') { e.preventDefault(); setter(getter() - 1); refresh(); sync(); }
        });

        return { node: col, refresh: refresh, input: input };
      }

      var hourCtrl = buildCol('HOUR', getHourDisplay, setHourFromDisplay);
      row.appendChild(hourCtrl.node);

      var sepEl = document.createElement('span');
      sepEl.className = 'brut-time__sep';
      sepEl.textContent = ':';
      row.appendChild(sepEl);

      var minuteCtrl = buildCol('MIN', getMinute, setMinute);
      row.appendChild(minuteCtrl.node);

      // 12/24 — when 12-hour, show AM/PM segmented under the row.
      var amBtn = null, pmBtn = null;
      if (mode === 12) {
        var meridSeg = document.createElement('div');
        meridSeg.className = 'brut-segmented brut-time__meridian';
        amBtn = document.createElement('button');
        amBtn.className = 'brut-segmented__btn';
        amBtn.setAttribute('type', 'button');
        amBtn.textContent = 'AM';
        pmBtn = document.createElement('button');
        pmBtn.className = 'brut-segmented__btn';
        pmBtn.setAttribute('type', 'button');
        pmBtn.textContent = 'PM';
        meridSeg.appendChild(amBtn);
        meridSeg.appendChild(pmBtn);
        pop.appendChild(meridSeg);

        function setMerid(pm) {
          if (pm && hour < 12) hour += 12;
          if (!pm && hour >= 12) hour -= 12;
          amBtn.classList.toggle('brut-segmented__btn--on', !pm);
          pmBtn.classList.toggle('brut-segmented__btn--on',  pm);
          hourCtrl.refresh();
          sync();
        }
        amBtn.addEventListener('click', function () { setMerid(false); });
        pmBtn.addEventListener('click', function () { setMerid(true);  });

        amBtn.classList.toggle('brut-segmented__btn--on', hour < 12);
        pmBtn.classList.toggle('brut-segmented__btn--on', hour >= 12);
      }

      function fmt() { return pad2(hour) + ':' + pad2(minute); }

      function sync() {
        var s = fmt();
        field.value = s;
        if (hidden) hidden.value = s;
        el.dispatchEvent(new CustomEvent('brut:change', { detail: { value: s, hour: hour, minute: minute } }));
      }

      function open() {
        if (el.classList.contains('brut-time--open')) return;
        var m = (field.value || '').match(/^(\d{1,2}):(\d{2})$/);
        if (m) {
          hour = clamp(parseInt(m[1], 10), 0, 23);
          minute = clamp(parseInt(m[2], 10), 0, 59);
        }
        hourCtrl.refresh();
        minuteCtrl.refresh();
        if (amBtn && pmBtn) {
          amBtn.classList.toggle('brut-segmented__btn--on', hour < 12);
          pmBtn.classList.toggle('brut-segmented__btn--on', hour >= 12);
        }
        el.classList.add('brut-time--open');
        field.setAttribute('aria-expanded', 'true');
      }
      function close() {
        el.classList.remove('brut-time--open');
        field.setAttribute('aria-expanded', 'false');
      }

      field.setAttribute('role', 'combobox');
      field.setAttribute('aria-haspopup', 'dialog');
      field.setAttribute('aria-expanded', 'false');
      if (!field.getAttribute('placeholder')) field.setAttribute('placeholder', 'HH:MM');

      field.addEventListener('focus', open);
      field.addEventListener('click', open);
      field.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') close();
        else if (e.key === 'ArrowDown' || e.key === 'Enter') { e.preventDefault(); open(); }
      });

      document.addEventListener('mousedown', function (e) {
        if (!el.contains(e.target)) close();
      });

      // Initial paint
      hourCtrl.refresh();
      minuteCtrl.refresh();
      if (!field.value) field.value = fmt();
      if (hidden && !hidden.value) hidden.value = fmt();
    }
  });
})();
