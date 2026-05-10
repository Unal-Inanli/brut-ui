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

  // Module-scope routing so the document keydown listener registers exactly
  // once per module load, not once per init(el) call (#181).
  var closeByEl = new WeakMap();

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    document.querySelectorAll('[data-brut="topnav"]').forEach(function (el) {
      if (!el.isConnected) return;
      var c = closeByEl.get(el);
      if (c) c();
    });
  });

  Brut.register('topnav', {
    selector: '[data-brut="topnav"]',
    init: function (el) {
      var burger = el.querySelector('.brut-topnav__burger');
      if (!burger) return;

      if (burger.tagName === 'BUTTON') burger.setAttribute('type', 'button');
      if (!burger.hasAttribute('aria-expanded')) burger.setAttribute('aria-expanded', 'false');
      if (!burger.hasAttribute('aria-label'))    burger.setAttribute('aria-label', el.getAttribute('data-brut-label-menu') || 'Toggle menu');

      var links = el.querySelector('.brut-topnav__links');
      if (links && !links.id) links.id = 'brut-topnav-nav';
      if (links) burger.setAttribute('aria-controls', links.id);

      function isOpen() { return el.classList.contains('brut-topnav--open'); }
      function setOpen(open) {
        el.classList.toggle('brut-topnav--open', open);
        burger.setAttribute('aria-expanded', open ? 'true' : 'false');
        el.dispatchEvent(new CustomEvent(open ? 'brut:open' : 'brut:close'));
      }
      function close() { if (isOpen()) setOpen(false); }
      closeByEl.set(el, close);

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

      // Close menu when a link is clicked (mobile UX).
      el.querySelectorAll('.brut-topnav__link').forEach(function (a) {
        a.addEventListener('click', function () {
          if (isOpen()) setOpen(false);
        });
      });
    }
  });
})();
