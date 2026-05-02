/* segmented — exclusive choice group on .brut-seg / .brut-seg__btn.
   Markup:
     <div class="brut-seg" data-brut="segmented">
       <button class="brut-seg__btn brut-seg__btn--on" data-value="day">DAY</button>
       <button class="brut-seg__btn" data-value="week">WEEK</button>
     </div>
   Mirror to a form by setting data-brut-name="<input-name>" on the wrapper —
   a hidden <input type="hidden"> is created automatically. */
(function () {
  if (!window.Brut) return;
  Brut.register('segmented', {
    selector: '[data-brut="segmented"]',
    init: function (el) {
      var name = el.getAttribute('data-brut-name');
      var hidden = el.querySelector('input[type="hidden"]');
      if (name && !hidden) {
        hidden = document.createElement('input');
        hidden.type = 'hidden';
        hidden.name = name;
        el.appendChild(hidden);
      }

      el.setAttribute('role', 'tablist');

      var btns = el.querySelectorAll('.brut-seg__btn');
      btns.forEach(function (btn) {
        btn.setAttribute('type', 'button');
        btn.setAttribute('role', 'tab');
        btn.addEventListener('click', function () {
          btns.forEach(function (b) {
            b.classList.remove('brut-seg__btn--on');
            b.setAttribute('aria-selected', 'false');
          });
          btn.classList.add('brut-seg__btn--on');
          btn.setAttribute('aria-selected', 'true');

          var value = btn.getAttribute('data-value') || btn.textContent.trim();
          if (hidden) hidden.value = value;
          el.dispatchEvent(new CustomEvent('brut:change', { detail: { value: value } }));
        });
      });

      var initial = el.querySelector('.brut-seg__btn--on');
      if (initial && hidden && !hidden.value) {
        hidden.value = initial.getAttribute('data-value') || initial.textContent.trim();
      }
    }
  });
})();
