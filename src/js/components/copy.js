/* copy — copy-to-clipboard wrapper around a value + button.
   Markup:
     <div class="brut-copy" data-brut="copy">
       <code class="brut-copy__value">sk-proj-abc123xyz</code>
       <button type="button" class="brut-btn brut-btn--sm brut-copy__btn">COPY</button>
     </div>
   The value is read from .brut-copy__value's textContent, or — if absent —
   from el.getAttribute('data-brut-value'). Button label is preserved if
   already set; otherwise data-brut-label-copy (default 'COPY') is used.
   On copy success the button briefly shows data-brut-label-copied
   (default 'COPIED'), an aria-live region announces the result, and
   brut:change fires with detail.value === the copied text. */
(function () {
  if (!window.Brut) return;
  Brut.register('copy', {
    selector: '[data-brut="copy"]',
    init: function (el) {
      var btn = el.querySelector('.brut-copy__btn');
      if (!btn) return;

      var valueEl = el.querySelector('.brut-copy__value');

      // Force type="button" so the toggle never submits a surrounding form.
      if (btn.getAttribute('type') !== 'button') btn.setAttribute('type', 'button');

      // Seed default label without clobbering consumer-supplied text.
      var labelCopy = el.getAttribute('data-brut-label-copy') || 'COPY';
      if (!btn.textContent || !btn.textContent.trim()) {
        btn.textContent = labelCopy;
      }

      // Append a single visually-hidden aria-live region for screen readers.
      var live = document.createElement('span');
      live.setAttribute('aria-live', 'polite');
      live.setAttribute('aria-atomic', 'true');
      live.className = 'brut-copy__live';
      // Inline visually-hidden styles — kit has no shared sr-only class today.
      live.style.position = 'absolute';
      live.style.width = '1px';
      live.style.height = '1px';
      live.style.padding = '0';
      live.style.margin = '-1px';
      live.style.overflow = 'hidden';
      live.style.clip = 'rect(0,0,0,0)';
      live.style.whiteSpace = 'nowrap';
      live.style.border = '0';
      el.appendChild(live);

      function readValue() {
        if (valueEl && valueEl.textContent != null && valueEl.textContent.length) {
          return valueEl.textContent;
        }
        return el.getAttribute('data-brut-value') || '';
      }

      function legacyCopy(text) {
        try {
          var ta = document.createElement('textarea');
          ta.value = text;
          ta.setAttribute('readonly', '');
          ta.style.position = 'absolute';
          ta.style.left = '-9999px';
          ta.style.top = '0';
          document.body.appendChild(ta);
          ta.select();
          var ok = false;
          try { ok = document.execCommand('copy'); } catch (_) { ok = false; }
          document.body.removeChild(ta);
          return ok;
        } catch (_) {
          return false;
        }
      }

      var resetTimer = null;

      function announce(value) {
        if (!el.isConnected) return;
        var original = btn.textContent;
        var copiedLabel = el.getAttribute('data-brut-label-copied') || 'COPIED';
        var announceLabel = el.getAttribute('data-brut-label-announce') || 'Copied to clipboard';

        btn.textContent = copiedLabel;
        live.textContent = announceLabel;

        if (resetTimer) clearTimeout(resetTimer);
        resetTimer = setTimeout(function () {
          if (!el.isConnected) return;
          btn.textContent = original;
          live.textContent = '';
          resetTimer = null;
        }, 1500);

        el.dispatchEvent(new CustomEvent('brut:change', {
          bubbles: true,
          detail: { value: value }
        }));
      }

      btn.addEventListener('click', function () {
        var text = readValue();
        if (window.navigator && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
          navigator.clipboard.writeText(text).then(function () {
            announce(text);
          }, function () {
            // Promise rejected — fall back to execCommand. Best-effort: if the
            // legacy path also fails we stay silent rather than throwing.
            if (legacyCopy(text)) announce(text);
          });
        } else {
          if (legacyCopy(text)) announce(text);
        }
      });
    }
  });
})();
