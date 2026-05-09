/* otp — one-cell-per-digit input with auto-advance + paste support.
   Markup (cells generated automatically when missing):
     <div class="brut-otp" data-brut="otp" data-brut-len="6" data-brut-name="code"></div>
   Or pre-populate cells:
     <div class="brut-otp" data-brut="otp" data-brut-name="code">
       <input class="brut-otp__cell" maxlength="1" inputmode="numeric">
       … six cells …
     </div>
   A hidden <input type="hidden" name="code"> is created to carry the
   joined value. Fires brut:change on every edit, brut:complete when full. */
(function () {
  if (!window.Brut) return;
  Brut.register('otp', {
    selector: '[data-brut="otp"]',
    init: function (el) {
      var len = parseInt(el.getAttribute('data-brut-len'), 10) || 6;
      var name = el.getAttribute('data-brut-name') || 'otp';

      // Consumer can override autocomplete via data-brut-autocomplete on the wrapper.
      // When set to 'off', no autocomplete attribute is applied at all.
      var acOverride = el.getAttribute('data-brut-autocomplete');
      var acOff = acOverride === 'off';
      var acValue = acOverride && !acOff ? acOverride : 'one-time-code';

      var hidden = el.querySelector('input[type="hidden"]');
      if (!hidden) {
        hidden = document.createElement('input');
        hidden.type = 'hidden';
        hidden.name = name;
        el.appendChild(hidden);
      }

      var cells = el.querySelectorAll('.brut-otp__cell');
      if (cells.length === 0) {
        for (var i = 0; i < len; i++) {
          var c = document.createElement('input');
          c.className = 'brut-otp__cell';
          c.maxLength = 1;
          el.insertBefore(c, hidden);
        }
        cells = el.querySelectorAll('.brut-otp__cell');
      }

      // Apply mobile-keyboard + SMS-autofill defaults to every cell.
      // Guards ensure consumer-set values always win.
      cells.forEach(function (cell) {
        if (!cell.hasAttribute('inputmode')) cell.setAttribute('inputmode', 'numeric');
        if (!acOff && !cell.hasAttribute('autocomplete')) cell.setAttribute('autocomplete', acValue);
      });

      var labelNoun = el.getAttribute('data-brut-label-cell') || 'Digit';
      cells.forEach(function (cell, idx) {
        if (!cell.hasAttribute('aria-label')) {
          cell.setAttribute('aria-label', labelNoun + ' ' + (idx + 1) + ' of ' + cells.length);
        }
      });

      var status = document.createElement('span');
      status.setAttribute('aria-live', 'polite');
      status.setAttribute('aria-atomic', 'true');
      status.style.cssText = 'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0;';
      el.appendChild(status);

      function gather() {
        var v = '';
        cells.forEach(function (c) { v += c.value || ''; });
        hidden.value = v;
        el.dispatchEvent(new CustomEvent('brut:change', { detail: { value: v } }));
        if (v.length === cells.length) {
          status.textContent = 'Code complete';
          el.dispatchEvent(new CustomEvent('brut:complete', { detail: { value: v } }));
        }
      }

      cells.forEach(function (cell, i) {
        cell.addEventListener('input', function () {
          cell.value = (cell.value || '').replace(/\D/g, '').slice(0, 1);
          if (cell.value && cells[i + 1]) cells[i + 1].focus();
          gather();
        });
        cell.addEventListener('keydown', function (e) {
          if (e.key === 'Backspace' && !cell.value && cells[i - 1]) cells[i - 1].focus();
          if (e.key === 'ArrowLeft'  && cells[i - 1]) cells[i - 1].focus();
          if (e.key === 'ArrowRight' && cells[i + 1]) cells[i + 1].focus();
        });
        cell.addEventListener('paste', function (e) {
          var data = (e.clipboardData || window.clipboardData);
          if (!data) return;
          var text = data.getData('text').replace(/\D/g, '');
          if (!text) return;
          e.preventDefault();
          var k;
          for (k = 0; k < cells.length - i && k < text.length; k++) {
            cells[i + k].value = text.charAt(k);
          }
          var next = Math.min(i + text.length, cells.length - 1);
          cells[next].focus();
          gather();
        });
      });

      var form = el.closest('form');
      if (form) {
        form.addEventListener('reset', function () {
          if (!el.isConnected) return;
          setTimeout(gather, 0);
        });
      }
    }
  });
})();
