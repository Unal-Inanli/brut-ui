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
  var SR_CSS = 'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0;';
  var uid = 0;
  Brut.register('file', {
    selector: '[data-brut="file"]',
    init: function (el) {
      var input = el.querySelector('input[type="file"]');
      var name  = el.querySelector('.brut-file__name');
      if (!input) return;

      // Visually-hidden polite live region for AT announcements on selection.
      var live = document.createElement('span');
      live.setAttribute('aria-live', 'polite');
      live.setAttribute('aria-atomic', 'true');
      live.style.cssText = SR_CSS;
      el.appendChild(live);

      // aria-describedby hint: prefer data-brut-accept-label, fall back to deriving from `accept`.
      var hintText = el.getAttribute('data-brut-accept-label');
      if (!hintText) {
        var accept = input.getAttribute('accept');
        if (accept) hintText = 'Accepted: ' + accept;
      }
      if (hintText) {
        var desc = document.createElement('span');
        var descId = 'brut-file-desc-' + (++uid);
        desc.id = descId;
        desc.textContent = hintText;
        desc.style.cssText = SR_CSS;
        el.appendChild(desc);
        input.setAttribute('aria-describedby', descId);
      }

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

      function announce() {
        var files = input.files;
        if (!files || !files.length) return;
        if (files.length === 1) {
          live.textContent = 'Selected file: ' + files[0].name;
        } else {
          live.textContent = 'Selected ' + files.length + ' files: ' +
            Array.from(files).map(function (f) { return f.name; }).join(', ');
        }
      }

      input.addEventListener('change', function () {
        refresh();
        announce();
        el.dispatchEvent(new CustomEvent('brut:change', {
          detail: { value: input.files, files: input.files }
        }));
      });
      refresh();
    }
  });
})();
