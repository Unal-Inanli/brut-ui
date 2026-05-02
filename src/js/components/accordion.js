/* accordion — stacked disclosure panels.
   Markup:
     <div class="brut-accordion" data-brut="accordion">
       <div class="brut-accordion__item">
         <button class="brut-accordion__head">
           <span>SECTION ONE</span>
           <span class="brut-accordion__icon" aria-hidden="true"></span>
         </button>
         <div class="brut-accordion__body">…</div>
       </div>
       …
     </div>
   Click on .brut-accordion__head toggles the parent --open class.
   Without data-brut-allow-multi, opening one closes the others.
   Sets aria-expanded on heads. Space + Enter activate. Dispatches
   brut:change with { open: bool } on each toggled item. */
(function () {
  if (!window.Brut) return;
  Brut.register('accordion', {
    selector: '[data-brut="accordion"]',
    init: function (el) {
      var allowMulti = el.hasAttribute('data-brut-allow-multi');
      var items = el.querySelectorAll('.brut-accordion__item');
      if (!items.length) return;

      var heads = [];
      items.forEach(function (item) {
        var head = item.querySelector('.brut-accordion__head');
        var body = item.querySelector('.brut-accordion__body');
        if (!head) return;

        if (head.tagName === 'BUTTON') head.setAttribute('type', 'button');
        if (!head.hasAttribute('tabindex') && head.tagName !== 'BUTTON') {
          head.setAttribute('tabindex', '0');
        }

        var isOpen = item.classList.contains('brut-accordion__item--open');
        head.setAttribute('aria-expanded', isOpen ? 'true' : 'false');

        if (body && !body.id) {
          body.id = 'brut-acc-' + Math.random().toString(36).slice(2, 9);
        }
        if (body) head.setAttribute('aria-controls', body.id);

        heads.push({ item: item, head: head, body: body });
      });

      function setOpen(record, open) {
        record.item.classList.toggle('brut-accordion__item--open', open);
        record.head.setAttribute('aria-expanded', open ? 'true' : 'false');
        record.item.dispatchEvent(new CustomEvent('brut:change', {
          bubbles: true,
          detail: { open: open }
        }));
      }

      function toggle(record) {
        var open = !record.item.classList.contains('brut-accordion__item--open');
        if (open && !allowMulti) {
          heads.forEach(function (other) {
            if (other !== record && other.item.classList.contains('brut-accordion__item--open')) {
              setOpen(other, false);
            }
          });
        }
        setOpen(record, open);
      }

      heads.forEach(function (record) {
        record.head.addEventListener('click', function (e) {
          e.preventDefault();
          toggle(record);
        });
        record.head.addEventListener('keydown', function (e) {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            toggle(record);
          }
        });
      });
    }
  });
})();
