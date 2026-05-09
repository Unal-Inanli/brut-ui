/* BRUT — JavaScript runtime
   ---------------------------------------------------------------
   This file is the entry point of the dist/brut.js bundle.
   Every component in src/js/components/<name>.js calls
   Brut.register(name, { selector, init }). On DOMContentLoaded
   (and again whenever Brut.init(root) is called) every registered
   selector is queried inside `root` and its init() runs once per
   matching element. Re-init is a no-op via the `__brutInit` flag
   stamped on each element, so it is safe to call Brut.init() any
   time markup is added to the DOM.

   Public API:
     Brut.register(name, { selector, init })  — declare a component
     Brut.init(root = document)               — wire components
     Brut.ready(fn)                           — DOM-ready helper
     Brut.theme(name?)                        — get/set active theme

   Conventions for component authors — see AGENTS.md "JavaScript
   components" section. Briefly:
     - Keep one component per file.
     - Hook on a data-brut="<name>" attribute, never on class names.
     - Use only standard DOM APIs. No deps, no polyfills.
     - Be idempotent. Always type="button" any <button> you wire.
     - Mirror state to a hidden <input> so the form posts cleanly.
     - Dispatch a CustomEvent("brut:change", { detail }) on change.
*/
(function (global) {
  'use strict';

  var registered = [];
  var INIT_FLAG = '__brutInit';

  function register(name, opts) {
    if (!name || !opts || !opts.selector || typeof opts.init !== 'function') {
      throw new Error('[brut] register(name, { selector, init }) — bad args for ' + name);
    }
    registered.push({ name: name, selector: opts.selector, init: opts.init });
  }

  function init(root) {
    root = root || document;
    for (var i = 0; i < registered.length; i++) {
      var c = registered[i];
      var nodes = root.querySelectorAll(c.selector);
      for (var j = 0; j < nodes.length; j++) {
        var el = nodes[j];
        if (el[INIT_FLAG] && el[INIT_FLAG][c.name]) continue;
        el[INIT_FLAG] = el[INIT_FLAG] || {};
        el[INIT_FLAG][c.name] = true;
        try {
          c.init(el);
        } catch (e) {
          if (global.console && console.error) {
            console.error('[brut] ' + c.name + ' init failed:', e, el);
          }
        }
      }
    }
  }

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      fn();
    }
  }

  var THEME_KEY = 'brut-theme';
  var DEFAULT_THEME = 'brutalist';

  function theme(name) {
    if (typeof name === 'string') {
      document.documentElement.setAttribute('data-theme', name);
      try { localStorage.setItem(THEME_KEY, name); } catch (e) { /* noop */ }
      return name;
    }
    return document.documentElement.getAttribute('data-theme') || DEFAULT_THEME;
  }

  function restoreTheme() {
    try {
      var saved = localStorage.getItem(THEME_KEY);
      if (saved) document.documentElement.setAttribute('data-theme', saved);
    } catch (e) { /* noop */ }
  }

  var Brut = global.Brut = global.Brut || {};
  Brut.register = register;
  Brut.init = init;
  Brut.ready = ready;
  Brut.theme = theme;
  Brut._components = registered;
  Brut.version = __BRUT_VERSION__;

  // Shared body scroll-lock with reference counting so nested/stacked
  // overlays (dialog, drawer, …) only restore the body's overflow once
  // the LAST overlay closes. acquire() on open, release() on close.
  Brut.scrollLock = (function () {
    var count = 0;
    var prevOverflow = '';
    return {
      acquire: function () {
        if (count === 0) {
          prevOverflow = document.body.style.overflow;
          document.body.style.overflow = 'hidden';
        }
        count++;
      },
      release: function () {
        if (count === 0) return;
        count--;
        if (count === 0) document.body.style.overflow = prevOverflow;
      },
    };
  })();

  // Shared focus trap for modal-style overlays (dialog, drawer, …).
  // activate(root) moves focus into root, cycles Tab/Shift+Tab within it,
  // and returns { release } which restores focus to the previously focused
  // element. WAI-ARIA Modal Dialog Pattern (WCAG 2.1.2). Per-instance —
  // call activate() on open and release() on close.
  Brut.focusTrap = (function () {
    var FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), [contenteditable]';
    function focusables(root) {
      return Array.prototype.slice.call(root.querySelectorAll(FOCUSABLE))
        .filter(function (n) { return n.offsetParent !== null || n === document.activeElement; });
    }
    return {
      activate: function (root) {
        var prev = document.activeElement;
        var addedTabindex = false;
        if (!root.hasAttribute('tabindex')) {
          root.setAttribute('tabindex', '-1');
          addedTabindex = true;
        }
        var list = focusables(root);
        (list[0] || root).focus();
        function onKey(e) {
          if (e.key !== 'Tab') return;
          var current = focusables(root);
          if (!current.length) { e.preventDefault(); root.focus(); return; }
          var first = current[0], last = current[current.length - 1];
          if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
          else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
        root.addEventListener('keydown', onKey);
        return {
          release: function () {
            root.removeEventListener('keydown', onKey);
            if (addedTabindex) root.removeAttribute('tabindex');
            if (prev && typeof prev.focus === 'function') prev.focus();
          },
        };
      },
    };
  })();

  // Restore persisted theme as early as possible to avoid flash
  restoreTheme();

  // Auto-init. We must run AFTER every component IIFE further down in the
  // bundle has had a chance to call register(). When the DOM is still
  // loading, DOMContentLoaded gives us that — those listeners fire after
  // the current script finishes parsing. When the DOM is already parsed
  // (defer / dynamic injection / late-loaded script), we'd otherwise run
  // synchronously, before the component files in this same bundle execute.
  // Schedule via setTimeout(0) so we always run on the next macrotask,
  // by which time the rest of the bundle has finished registering.
  ready(function () { setTimeout(function () { init(document); }, 0); });
})(typeof window !== 'undefined' ? window : this);
