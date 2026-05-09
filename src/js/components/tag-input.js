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

      // Accessible name for the text input — honor existing aria-* first,
      // then data-brut-label, then default to 'Tags'. Mirrors the i18n
      // pattern used by menu's data-brut-label-menu fix.
      if (!field.hasAttribute('aria-label') && !field.hasAttribute('aria-labelledby')) {
        var labelText = el.getAttribute('data-brut-label') || 'Tags';
        field.setAttribute('aria-label', labelText);
      }

      // Visually-hidden polite live region for add/remove announcements.
      var live = document.createElement('span');
      live.setAttribute('aria-live', 'polite');
      live.setAttribute('aria-atomic', 'true');
      live.style.cssText = 'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0;';
      el.appendChild(live);

      function announce(msg) {
        live.textContent = msg;
        setTimeout(function () { live.textContent = ''; }, 1000);
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

      function tagValueOf(node) {
        var v = node && node.getAttribute && node.getAttribute('data-value');
        if (!v && node) v = (node.textContent || '').replace('×', '').trim();
        return v || '';
      }

      function bindClose(btn) {
        if (!btn.hasAttribute('type')) btn.setAttribute('type', 'button');
        var parentTag = btn.parentElement;
        var tagValue = tagValueOf(parentTag);
        if (tagValue) btn.setAttribute('aria-label', 'Remove ' + tagValue);
        btn.addEventListener('click', function (e) {
          e.stopPropagation();
          var removedValue = tagValueOf(btn.parentElement);
          if (btn.parentElement) btn.parentElement.remove();
          if (removedValue) announce('Tag ' + removedValue + ' removed');
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
        x.setAttribute('aria-label', 'Remove ' + text);
        tag.appendChild(x);
        bindClose(x);

        el.insertBefore(tag, field);
        announce('Tag ' + text + ' added');
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
            var last = existing[existing.length - 1];
            var removedValue = tagValueOf(last);
            last.remove();
            if (removedValue) announce('Tag ' + removedValue + ' removed');
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

      var form = el.closest('form');
      if (form) {
        form.addEventListener('reset', function () {
          if (!el.isConnected) return;
          setTimeout(function () {
            // No native input to mirror — clear all chips and the field.
            el.querySelectorAll('.brut-tag').forEach(function (t) { t.remove(); });
            field.value = '';
            sync();
          }, 0);
        });
      }

      sync();
    }
  });
})();
