/* topnav — sticky page header. Only JS is the mobile burger toggle.
   Markup:
     <header class="brut-topnav" data-brut="topnav">
       <div class="brut-topnav__inner">
         <a class="brut-topnav__brand" href="/"> … </a>
         <nav class="brut-topnav__links"> … </nav>
         <a class="brut-btn brut-btn--primary brut-btn--sm brut-topnav__cta" href="…">CTA</a>
         <button class="brut-topnav__burger" aria-label="Menu">≡</button>
       </div>
     </header>
   Burger toggles `.brut-topnav--open`. Click outside / Esc closes.
*/
(function () {
  if (!window.Brut) return;
  Brut.register('topnav', {
    selector: '[data-brut="topnav"]',
    init: function (el) {
      var burger = el.querySelector('.brut-topnav__burger');
      if (!burger) return;

      if (burger.tagName === 'BUTTON') burger.setAttribute('type', 'button');
      if (!burger.hasAttribute('aria-expanded')) burger.setAttribute('aria-expanded', 'false');
      if (!burger.hasAttribute('aria-label'))    burger.setAttribute('aria-label', 'Toggle menu');

      function isOpen() { return el.classList.contains('brut-topnav--open'); }
      function setOpen(open) {
        el.classList.toggle('brut-topnav--open', open);
        burger.setAttribute('aria-expanded', open ? 'true' : 'false');
        el.dispatchEvent(new CustomEvent(open ? 'brut:open' : 'brut:close'));
      }

      burger.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        setOpen(!isOpen());
      });

      document.addEventListener('click', function (e) {
        if (!isOpen()) return;
        if (el.contains(e.target)) return;
        setOpen(false);
      });

      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && isOpen()) setOpen(false);
      });

      // Close menu when a link is clicked (mobile UX).
      el.querySelectorAll('.brut-topnav__link').forEach(function (a) {
        a.addEventListener('click', function () {
          if (isOpen()) setOpen(false);
        });
      });
    }
  });
})();
