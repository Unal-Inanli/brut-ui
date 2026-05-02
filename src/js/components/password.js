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
      btn.setAttribute('type', 'button');
      btn.textContent = input.type === 'password' ? 'SHOW' : 'HIDE';
      btn.addEventListener('click', function () {
        var hidden = input.type === 'password';
        input.type = hidden ? 'text' : 'password';
        btn.textContent = hidden ? 'HIDE' : 'SHOW';
        btn.setAttribute('aria-pressed', hidden ? 'true' : 'false');
      });
    }
  });
})();
