/* sidebar — vertical app nav. JS is optional; only powers
   collapsible groups when the group title is a <button>.
   Markup:
     <aside class="brut-sidebar" data-brut="sidebar">
       <a class="brut-sidebar__brand" href="/">BRAND</a>
       <div class="brut-sidebar__group">
         <button class="brut-sidebar__group-title">Main</button>
         <a class="brut-sidebar__item brut-sidebar__item--active" href="…">Dashboard</a>
         <a class="brut-sidebar__item" href="…">Projects</a>
       </div>
     </aside>
   Click on a <button class="brut-sidebar__group-title"> toggles
   `.brut-sidebar__group--closed` on the parent group. Static <h3>
   (or any non-button) titles render the same but never collapse.
*/
(function () {
  if (!window.Brut) return;
  Brut.register('sidebar', {
    selector: '[data-brut="sidebar"]',
    init: function (el) {
      var titles = el.querySelectorAll('button.brut-sidebar__group-title');
      titles.forEach(function (btn) {
        btn.setAttribute('type', 'button');
        var group = btn.closest('.brut-sidebar__group');
        if (!group) return;
        var initiallyClosed = group.classList.contains('brut-sidebar__group--closed');
        btn.setAttribute('aria-expanded', initiallyClosed ? 'false' : 'true');
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          var willClose = !group.classList.contains('brut-sidebar__group--closed');
          group.classList.toggle('brut-sidebar__group--closed', willClose);
          btn.setAttribute('aria-expanded', willClose ? 'false' : 'true');
          var open = !willClose;
          el.dispatchEvent(new CustomEvent('brut:change', {
            detail: { value: open, group: group, closed: willClose }
          }));
          el.dispatchEvent(new CustomEvent(open ? 'brut:open' : 'brut:close', {
            detail: { value: open, group: group }
          }));
        });
      });
    }
  });
})();
