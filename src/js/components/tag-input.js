/* tag-input — chip-entry field. Adds tag on Enter or comma; removes
   tag on Backspace at empty field, or via the per-tag × button.
   Markup:
     <div class="brut-tag-input" data-brut="tag-input" data-brut-name="tags">
       <span class="brut-tag" data-value="ux">UX <button class="brut-tag__x">×</button></span>
       <input class="brut-tag-input__field" placeholder="Add a tag…">
     </div>
   A hidden <input type="hidden" name="tags"> is created with the
   comma-joined values. Fires brut:change on every change. */
(function () {
  if (!window.Brut) return;
  Brut.register('tag-input', {
    selector: '[data-brut="tag-input"]',
    init: function (el) {
      var field = el.querySelector('.brut-tag-input__field');
      if (!field) return;
      var hidden = el.querySelector('input[type="hidden"]');
      if (!hidden) {
        hidden = document.createElement('input');
        hidden.type = 'hidden';
        hidden.name = el.getAttribute('data-brut-name') || 'tags';
        el.appendChild(hidden);
      }

      function values() {
        var out = [];
        el.querySelectorAll('.brut-tag').forEach(function (t) {
          var v = t.getAttribute('data-value');
          if (!v) v = (t.textContent || '').replace('×', '').trim();
          if (v) out.push(v);
        });
        return out;
      }

      function sync() {
        var current = values();
        hidden.value = current.join(',');
        el.dispatchEvent(new CustomEvent('brut:change', { detail: { value: current, tags: current } }));
      }

      function bindClose(btn) {
        btn.setAttribute('type', 'button');
        btn.addEventListener('click', function (e) {
          e.stopPropagation();
          if (btn.parentElement) btn.parentElement.remove();
          sync();
          field.focus();
        });
      }

      function addTag(text) {
        text = (text || '').trim();
        if (!text) return;
        if (values().indexOf(text) !== -1) return;

        var tag = document.createElement('span');
        tag.className = 'brut-tag';
        tag.setAttribute('data-value', text);
        tag.appendChild(document.createTextNode(text + ' '));

        var x = document.createElement('button');
        x.className = 'brut-tag__x';
        x.textContent = '×';
        bindClose(x);
        tag.appendChild(x);

        el.insertBefore(tag, field);
        sync();
      }

      field.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ',') {
          e.preventDefault();
          addTag(field.value);
          field.value = '';
        } else if (e.key === 'Backspace' && !field.value) {
          var existing = el.querySelectorAll('.brut-tag');
          if (existing.length) {
            existing[existing.length - 1].remove();
            sync();
          }
        }
      });

      field.addEventListener('blur', function () {
        if (field.value.trim()) {
          addTag(field.value);
          field.value = '';
        }
      });

      el.querySelectorAll('.brut-tag .brut-tag__x').forEach(bindClose);
      el.addEventListener('click', function (e) {
        if (e.target === el) field.focus();
      });

      sync();
    }
  });
})();
