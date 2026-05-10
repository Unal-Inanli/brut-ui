/* field — mirrors .brut-field--invalid / .brut-field--valid modifier classes
   onto the child input as aria-invalid="true" so screen readers announce
   validation state. A global MutationObserver watches every .brut-field
   wrapper for class changes regardless of data-brut opt-in.
   Markup:
     <div class="brut-field brut-field--invalid">
       <label class="brut-field__label">Email</label>
       <input class="brut-input" type="email">
       <span class="brut-field__error">Invalid email address.</span>
     </div>
   When --invalid is added/removed, aria-invalid="true" is set/removed on the
   first descendant input | select | textarea. */
(function () {
  if (!window.Brut) return;

  function syncAriaInvalid(field) {
    if (!field || !field.classList || !field.classList.contains('brut-field')) return;
    var input = field.querySelector('input, select, textarea');
    if (!input) return;
    var invalid = field.classList.contains('brut-field--invalid');
    if (invalid) input.setAttribute('aria-invalid', 'true');
    else input.removeAttribute('aria-invalid');
  }

  var observer = new MutationObserver(function (records) {
    for (var i = 0; i < records.length; i++) {
      var r = records[i];
      if (r.type === 'attributes' && r.attributeName === 'class') {
        syncAriaInvalid(r.target);
      }
    }
  });

  function start() {
    var fields = document.querySelectorAll('.brut-field');
    for (var i = 0; i < fields.length; i++) syncAriaInvalid(fields[i]);
    observer.observe(document.body, {
      subtree: true,
      attributes: true,
      attributeFilter: ['class'],
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }

  Brut.register('field', {
    selector: '[data-brut="field"]',
    init: function () { /* observer is global; per-element init is a no-op */ },
  });
})();
