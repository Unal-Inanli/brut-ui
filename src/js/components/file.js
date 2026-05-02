/* file — wraps a hidden <input type="file"> + visible button + filename.
   Markup:
     <label class="brut-file" data-brut="file">
       <input type="file" name="upload">
       <span class="brut-file__btn">CHOOSE FILE</span>
       <span class="brut-file__name">No file selected</span>
     </label>
   Updates the .brut-file__name label as the selection changes. */
(function () {
  if (!window.Brut) return;
  Brut.register('file', {
    selector: '[data-brut="file"]',
    init: function (el) {
      var input = el.querySelector('input[type="file"]');
      var name  = el.querySelector('.brut-file__name');
      if (!input) return;

      function refresh() {
        if (!name) return;
        if (input.files && input.files.length) {
          name.textContent = input.files.length === 1
            ? input.files[0].name
            : input.files.length + ' files';
        } else {
          name.textContent = 'No file selected';
        }
      }

      input.addEventListener('change', function () {
        refresh();
        el.dispatchEvent(new CustomEvent('brut:change', {
          detail: { files: input.files }
        }));
      });
      refresh();
    }
  });
})();
