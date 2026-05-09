/* password — input with SHOW/HIDE toggle.
   Markup:
     <div class="brut-password" data-brut="password">
       <input class="brut-input" type="password" value="••••">
       <button class="brut-password__toggle">SHOW</button>
     </div> */
(function () {
  if (!window.Brut) return;
  Brut.register('password', {
    selector: '[data-brut="password"]',
    init: function (el) {
      var input = el.querySelector('input');
      var btn   = el.querySelector('.brut-password__toggle');
      if (!input || !btn) return;

      // Help password managers recognise the field. Consumer can override via
      // data-brut-autocomplete on the wrapper; 'off' opts out entirely.
      var acOverride = el.getAttribute('data-brut-autocomplete');
      if (acOverride !== 'off' && !input.hasAttribute('autocomplete')) {
        input.setAttribute('autocomplete', acOverride || 'current-password');
      }

      btn.setAttribute('type', 'button');
      btn.textContent = input.type === 'password' ? 'SHOW' : 'HIDE';
      btn.setAttribute('aria-label', input.type === 'password' ? 'Show password' : 'Hide password');
      btn.addEventListener('click', function () {
        var hidden = input.type === 'password';
        input.type = hidden ? 'text' : 'password';
        btn.textContent = hidden ? 'HIDE' : 'SHOW';
        btn.setAttribute('aria-pressed', hidden ? 'true' : 'false');
        btn.setAttribute('aria-label', hidden ? 'Hide password' : 'Show password');
      });
    }
  });
})();
