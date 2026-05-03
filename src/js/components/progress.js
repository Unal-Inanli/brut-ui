/* progress — determinate/indeterminate horizontal bar.
   Markup:
     <div class="brut-progress" data-brut="progress" data-brut-value="0"
          role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
       <div class="brut-progress__bar"></div>
       <span class="brut-progress__label"></span>  <!-- optional -->
     </div>

   API:
     el.brutProgress.setValue(n)   — set 0–100
     el.brutProgress.getValue()    — returns current numeric value

   Events:
     brut:change { value: n }      — fires after every setValue call */
(function () {
  if (!window.Brut) return;
  Brut.register('progress', {
    selector: '[data-brut="progress"]',
    init: function (el) {
      var label = el.querySelector('.brut-progress__label');
      var initial = parseFloat(el.getAttribute('data-brut-value')) || 0;
      var current = initial;

      function setValue(v) {
        v = Math.max(0, Math.min(100, parseFloat(v) || 0));
        current = v;
        el.style.setProperty('--progress', v);
        el.setAttribute('data-brut-value', v);
        el.setAttribute('aria-valuenow', Math.round(v));
        if (label) label.textContent = Math.round(v) + '%';
        el.dispatchEvent(new CustomEvent('brut:change', {
          bubbles: true,
          detail: { value: v }
        }));
      }

      function getValue() {
        return current;
      }

      // ARIA setup
      el.setAttribute('role', 'progressbar');
      el.setAttribute('aria-valuemin', '0');
      el.setAttribute('aria-valuemax', '100');

      setValue(initial);
      el.brutProgress = { setValue: setValue, getValue: getValue };
    }
  });
})();
