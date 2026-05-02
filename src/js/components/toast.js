/* toast — non-blocking transient notifications.
   Markup (host):
     <div class="brut-toast-host brut-toast-host--top-right" data-brut="toast-host"></div>
   Public API:
     Brut.toast({ kind: 'ok'|'warn'|'err'|'info', message, timeout: 4000, host: '#id' })
   Each toast dispatches `brut:close` on dismiss.
   The host itself is registered so nothing has to be wired up by hand —
   ensure-host logic in Brut.toast() will create one on demand if missing.
*/
(function () {
  if (!window.Brut) return;

  var ICONS = { ok: '✓', warn: '!', err: '✕', info: 'i' };

  function ensureHost(hostSel) {
    var host;
    if (hostSel) {
      host = typeof hostSel === 'string' ? document.querySelector(hostSel) : hostSel;
      if (host) return host;
    }
    host = document.querySelector('[data-brut="toast-host"]');
    if (host) return host;
    host = document.createElement('div');
    host.className = 'brut-toast-host brut-toast-host--top-right';
    host.setAttribute('data-brut', 'toast-host');
    document.body.appendChild(host);
    return host;
  }

  function makeToast(opts) {
    opts = opts || {};
    var kind = opts.kind || 'info';
    var message = opts.message == null ? '' : String(opts.message);
    var timeout = typeof opts.timeout === 'number' ? opts.timeout : 4000;
    var host = ensureHost(opts.host);

    var t = document.createElement('div');
    t.className = 'brut-toast brut-toast--' + kind;
    t.setAttribute('role', kind === 'err' || kind === 'warn' ? 'alert' : 'status');
    t.setAttribute('aria-live', kind === 'err' || kind === 'warn' ? 'assertive' : 'polite');

    var icon = document.createElement('div');
    icon.className = 'brut-toast__icon';
    icon.textContent = ICONS[kind] || ICONS.info;

    var msg = document.createElement('div');
    msg.className = 'brut-toast__msg';
    msg.textContent = message;

    var x = document.createElement('button');
    x.className = 'brut-toast__x';
    x.setAttribute('type', 'button');
    x.setAttribute('aria-label', 'Dismiss');
    x.textContent = '✕';

    t.appendChild(icon);
    t.appendChild(msg);
    t.appendChild(x);
    host.appendChild(t);

    var closed = false;
    function close() {
      if (closed) return;
      closed = true;
      t.classList.add('brut-toast--leaving');
      var done = function () {
        if (t.parentNode) t.parentNode.removeChild(t);
      };
      var tid = setTimeout(done, 160);
      t.addEventListener('transitionend', function () { clearTimeout(tid); done(); }, { once: true });
      t.dispatchEvent(new CustomEvent('brut:close', { bubbles: true }));
    }

    x.addEventListener('click', function (e) { e.preventDefault(); close(); });

    if (timeout > 0) {
      setTimeout(close, timeout);
    }

    return { el: t, close: close };
  }

  // Attach the public factory to window.Brut.
  window.Brut.toast = function (opts) { return makeToast(opts); };

  // Register the host so Brut.init runs on it (nothing to wire today,
  // but reserves the selector for future enhancements like clear-all).
  Brut.register('toast-host', {
    selector: '[data-brut="toast-host"]',
    init: function (el) {
      // no-op; toasts append directly to the host via Brut.toast()
      if (el && !el.classList.contains('brut-toast-host')) {
        el.classList.add('brut-toast-host');
      }
    }
  });
})();
