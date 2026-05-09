/* dropzone — drag-and-drop file region. Wraps a hidden <input type="file">.
   Markup:
     <label class="brut-dropzone" data-brut="dropzone">
       <input type="file" name="upload" multiple>
       <span class="brut-dropzone__hint">Drop files here.</span>
       <span class="brut-dropzone__sub">Or click to browse.</span>
     </label>
   Toggles .brut-dropzone--drag during drag-over, assigns dropped
   files to the input, and dispatches brut:change. */
(function () {
  if (!window.Brut) return;
  Brut.register('dropzone', {
    selector: '[data-brut="dropzone"]',
    init: function (el) {
      var input = el.querySelector('input[type="file"]');
      if (!input) return;

      // Some browsers reject programmatic FileList assignment unless via DataTransfer.
      function setFiles(fileList) {
        try {
          var dt = new DataTransfer();
          for (var i = 0; i < fileList.length; i++) dt.items.add(fileList[i]);
          input.files = dt.files;
        } catch (e) {
          input.files = fileList;
        }
        input.dispatchEvent(new Event('change', { bubbles: true }));
        el.dispatchEvent(new CustomEvent('brut:change', { detail: { value: input.files, files: input.files } }));
      }

      el.addEventListener('click', function (e) {
        if (e.target !== input) input.click();
      });

      // Keyboard access: focusable, button-like.
      if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0');
      if (!el.hasAttribute('role'))     el.setAttribute('role', 'button');
      if (!el.hasAttribute('aria-label')) {
        var hint = el.querySelector('.brut-dropzone__hint');
        el.setAttribute('aria-label', (hint && hint.textContent.trim()) || 'Choose files');
      }
      el.addEventListener('keydown', function (e) {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault();
        input.click();
      });

      ['dragenter', 'dragover'].forEach(function (ev) {
        el.addEventListener(ev, function (e) {
          e.preventDefault(); e.stopPropagation();
          el.classList.add('brut-dropzone--drag');
        });
      });
      ['dragleave', 'drop'].forEach(function (ev) {
        el.addEventListener(ev, function (e) {
          e.preventDefault(); e.stopPropagation();
          el.classList.remove('brut-dropzone--drag');
        });
      });
      el.addEventListener('drop', function (e) {
        if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) {
          setFiles(e.dataTransfer.files);
        }
      });
    }
  });
})();
