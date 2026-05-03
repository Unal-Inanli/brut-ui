(function () {
  if (!window.Brut) return;
  Brut.register('theme-switcher', {
    selector: '[data-brut="theme-switcher"]',
    init: function (el) {
      var themes = (el.getAttribute('data-brut-themes') || 'brutalist,corporate,minimal')
        .split(',').map(function (s) { return s.trim(); });

      el.setAttribute('role', 'radiogroup');
      el.setAttribute('aria-label', 'Theme');
      el.classList.add('brut-theme-switcher');

      var btns = [];

      function select(btn, focusIt) {
        var value = btn.getAttribute('data-value');
        btns.forEach(function (b) {
          var on = b === btn;
          b.classList.toggle('brut-theme-switcher__btn--on', on);
          b.setAttribute('aria-checked', on ? 'true' : 'false');
          b.setAttribute('tabindex', on ? '0' : '-1');
        });
        Brut.theme(value);
        if (focusIt) btn.focus();
        el.dispatchEvent(new CustomEvent('brut:change', { detail: { value: value } }));
      }

      themes.forEach(function (name) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'brut-theme-switcher__btn';
        btn.setAttribute('role', 'radio');
        btn.setAttribute('data-value', name);
        btn.textContent = name.charAt(0).toUpperCase() + name.slice(1);
        btn.addEventListener('click', function () { select(btn); });
        el.appendChild(btn);
        btns.push(btn);
      });

      el.addEventListener('keydown', function (e) {
        var t = e.target;
        if (!t || !t.classList.contains('brut-theme-switcher__btn')) return;
        var i = btns.indexOf(t);
        if (i < 0) return;
        var next = null;
        switch (e.key) {
          case 'ArrowLeft':
          case 'ArrowUp':    next = btns[(i - 1 + btns.length) % btns.length]; break;
          case 'ArrowRight':
          case 'ArrowDown':  next = btns[(i + 1) % btns.length]; break;
          case 'Home':       next = btns[0]; break;
          case 'End':        next = btns[btns.length - 1]; break;
          default: return;
        }
        e.preventDefault();
        select(next, true);
      });

      var current = Brut.theme();
      var initial = el.querySelector('[data-value="' + current + '"]') || btns[0];
      if (initial) {
        btns.forEach(function (b) {
          var on = b === initial;
          b.classList.toggle('brut-theme-switcher__btn--on', on);
          b.setAttribute('aria-checked', on ? 'true' : 'false');
          b.setAttribute('tabindex', on ? '0' : '-1');
        });
      }
    }
  });
})();
