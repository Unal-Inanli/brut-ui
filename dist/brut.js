/*!
 * BRUT v0.2.0 — runtime
 * Built 2026-05-02T19:53:44Z
 * Bundle: src/js/core.js + src/js/components/*.js
 */

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

  var Brut = global.Brut = global.Brut || {};
  Brut.register = register;
  Brut.init = init;
  Brut.ready = ready;
  Brut._components = registered;
  Brut.version = '0.2.0';

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


/* --- accordion.js --- */
/* accordion — stacked disclosure panels.
   Markup:
     <div class="brut-accordion" data-brut="accordion">
       <div class="brut-accordion__item">
         <button class="brut-accordion__head">
           <span>SECTION ONE</span>
           <span class="brut-accordion__icon" aria-hidden="true"></span>
         </button>
         <div class="brut-accordion__body">…</div>
       </div>
       …
     </div>
   Click on .brut-accordion__head toggles the parent --open class.
   Without data-brut-allow-multi, opening one closes the others.
   Sets aria-expanded on heads. Space + Enter activate. Dispatches
   brut:change with { open: bool } on each toggled item. */
(function () {
  if (!window.Brut) return;
  Brut.register('accordion', {
    selector: '[data-brut="accordion"]',
    init: function (el) {
      var allowMulti = el.hasAttribute('data-brut-allow-multi');
      var items = el.querySelectorAll('.brut-accordion__item');
      if (!items.length) return;

      var heads = [];
      items.forEach(function (item) {
        var head = item.querySelector('.brut-accordion__head');
        var body = item.querySelector('.brut-accordion__body');
        if (!head) return;

        if (head.tagName === 'BUTTON') head.setAttribute('type', 'button');
        if (!head.hasAttribute('tabindex') && head.tagName !== 'BUTTON') {
          head.setAttribute('tabindex', '0');
        }

        var isOpen = item.classList.contains('brut-accordion__item--open');
        head.setAttribute('aria-expanded', isOpen ? 'true' : 'false');

        if (body && !body.id) {
          body.id = 'brut-acc-' + Math.random().toString(36).slice(2, 9);
        }
        if (body) head.setAttribute('aria-controls', body.id);

        heads.push({ item: item, head: head, body: body });
      });

      function setOpen(record, open) {
        record.item.classList.toggle('brut-accordion__item--open', open);
        record.head.setAttribute('aria-expanded', open ? 'true' : 'false');
        record.item.dispatchEvent(new CustomEvent('brut:change', {
          bubbles: true,
          detail: { open: open }
        }));
      }

      function toggle(record) {
        var open = !record.item.classList.contains('brut-accordion__item--open');
        if (open && !allowMulti) {
          heads.forEach(function (other) {
            if (other !== record && other.item.classList.contains('brut-accordion__item--open')) {
              setOpen(other, false);
            }
          });
        }
        setOpen(record, open);
      }

      heads.forEach(function (record) {
        record.head.addEventListener('click', function (e) {
          e.preventDefault();
          toggle(record);
        });
        record.head.addEventListener('keydown', function (e) {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            toggle(record);
          }
        });
      });
    }
  });
})();


/* --- checkbox.js --- */
/* checkbox — visual checkbox synced to an inner hidden <input type="checkbox">.
   Markup:
     <label class="brut-cb" data-brut="checkbox">
       <input type="checkbox" hidden>
     </label>
   The hidden checkbox is the source of truth. */
(function () {
  if (!window.Brut) return;
  Brut.register('checkbox', {
    selector: '[data-brut="checkbox"]',
    init: function (el) {
      var input = el.querySelector('input[type="checkbox"]');

      function sync() {
        var on = input ? input.checked : el.classList.contains('brut-cb--on');
        el.classList.toggle('brut-cb--on', on);
        el.setAttribute('aria-checked', on ? 'true' : 'false');
      }

      if (!el.hasAttribute('role'))     el.setAttribute('role', 'checkbox');
      if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0');

      function emit() {
        el.dispatchEvent(new CustomEvent('brut:change', {
          detail: { checked: el.classList.contains('brut-cb--on') }
        }));
      }

      el.addEventListener('click', function (e) {
        if (e.target === input) return;
        // Suppress native <label> activation so we don't toggle twice.
        e.preventDefault();
        if (input) {
          input.checked = !input.checked;
          input.dispatchEvent(new Event('change', { bubbles: true }));
        } else {
          el.classList.toggle('brut-cb--on');
          sync();
          emit();
        }
      });

      el.addEventListener('keydown', function (e) {
        if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); el.click(); }
      });

      if (input) input.addEventListener('change', function () { sync(); emit(); });
      sync();
    }
  });
})();


/* --- combobox.js --- */
/* combobox — searchable single-select.
   Markup:
     <div class="brut-combobox" data-brut="combobox" data-brut-name="city">
       <input class="brut-input" type="text" placeholder="City…">
       <input type="hidden" name="city">
       <ul class="brut-combobox__list">
         <li class="brut-combobox__opt" data-value="nyc">New York</li>
         <li class="brut-combobox__opt" data-value="ber">Berlin</li>
         <li class="brut-combobox__empty">No matches.</li>
       </ul>
     </div>
   The visible <input> is the search field; the hidden <input> carries
   the selected option's data-value (or text). Picking emits brut:change. */
(function () {
  if (!window.Brut) return;
  Brut.register('combobox', {
    selector: '[data-brut="combobox"]',
    init: function (el) {
      var input = el.querySelector('input[type="text"], input[type="search"], input:not([type])');
      var list  = el.querySelector('.brut-combobox__list');
      if (!input || !list) return;

      var hidden = el.querySelector('input[type="hidden"]');
      if (!hidden && el.getAttribute('data-brut-name')) {
        hidden = document.createElement('input');
        hidden.type = 'hidden';
        hidden.name = el.getAttribute('data-brut-name');
        el.appendChild(hidden);
      }

      var opts = Array.prototype.slice.call(list.querySelectorAll('.brut-combobox__opt'));
      var emptyEl = list.querySelector('.brut-combobox__empty');
      var activeIdx = -1;

      function open()  { el.classList.add('brut-combobox--open');    input.setAttribute('aria-expanded', 'true'); }
      function close() { el.classList.remove('brut-combobox--open'); input.setAttribute('aria-expanded', 'false'); setActive(-1); }

      function setActive(i) {
        opts.forEach(function (o, j) { o.setAttribute('aria-selected', i === j ? 'true' : 'false'); });
        activeIdx = i;
        if (i >= 0 && opts[i]) opts[i].scrollIntoView({ block: 'nearest' });
      }

      function visibleOpts() {
        return opts.filter(function (o) { return o.style.display !== 'none'; });
      }

      function pick(opt) {
        if (!opt) return;
        input.value = opt.textContent.trim();
        if (hidden) hidden.value = opt.getAttribute('data-value') || opt.textContent.trim();
        el.dispatchEvent(new CustomEvent('brut:change', {
          detail: { value: hidden ? hidden.value : input.value, label: input.value }
        }));
        close();
      }

      function filter() {
        var q = (input.value || '').toLowerCase();
        var any = false;
        opts.forEach(function (o) {
          var match = o.textContent.toLowerCase().indexOf(q) !== -1;
          o.style.display = match ? '' : 'none';
          if (match) any = true;
        });
        if (emptyEl) emptyEl.style.display = any ? 'none' : 'block';
        open();
      }

      input.setAttribute('role', 'combobox');
      input.setAttribute('aria-autocomplete', 'list');
      input.setAttribute('aria-expanded', 'false');
      list.setAttribute('role', 'listbox');
      opts.forEach(function (o) { o.setAttribute('role', 'option'); });

      input.addEventListener('focus', open);
      input.addEventListener('input', filter);
      input.addEventListener('keydown', function (e) {
        var v = visibleOpts();
        if (!v.length && e.key !== 'Escape') return;
        var current = opts[activeIdx];
        var idxInVisible = v.indexOf(current);

        if (e.key === 'ArrowDown') {
          e.preventDefault();
          var n = v[(idxInVisible + 1 + v.length) % v.length] || v[0];
          setActive(opts.indexOf(n));
          open();
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          var p = v[(idxInVisible - 1 + v.length) % v.length] || v[v.length - 1];
          setActive(opts.indexOf(p));
          open();
        } else if (e.key === 'Enter') {
          if (el.classList.contains('brut-combobox--open')) {
            e.preventDefault();
            pick(current || v[0]);
          }
        } else if (e.key === 'Escape') {
          close();
        }
      });

      opts.forEach(function (o, i) {
        o.addEventListener('mouseenter', function () { setActive(i); });
        o.addEventListener('mousedown', function (e) { e.preventDefault(); pick(o); });
      });

      document.addEventListener('click', function (e) { if (!el.contains(e.target)) close(); });
    }
  });
})();


/* --- counter.js --- */
/* counter — character count for a paired input or textarea.
   Markup:
     <textarea id="bio" class="brut-textarea" maxlength="120"></textarea>
     <span class="brut-field__counter" data-brut="counter" data-brut-for="bio"></span>
   The maxlength attribute on the target is honored if present.
   Override with data-brut-max="<n>" on the counter element. */
(function () {
  if (!window.Brut) return;
  Brut.register('counter', {
    selector: '[data-brut="counter"]',
    init: function (el) {
      var target = document.getElementById(el.getAttribute('data-brut-for'));
      if (!target) return;
      var attrMax = parseInt(target.getAttribute('maxlength'), 10);
      var dataMax = parseInt(el.getAttribute('data-brut-max'), 10);
      var max = isFinite(attrMax) ? attrMax : (isFinite(dataMax) ? dataMax : 0);

      function refresh() {
        var n = (target.value || '').length;
        el.textContent = max ? (n + ' / ' + max) : String(n);
        if (max) el.classList.toggle('brut-field__counter--over', n > max);
      }

      target.addEventListener('input',  refresh);
      target.addEventListener('change', refresh);
      refresh();
    }
  });
})();


/* --- date.js --- */
/* date — text field + popover calendar with keyboard nav.
   Markup:
     <div class="brut-date" data-brut="date" data-brut-name="due">
       <input class="brut-input brut-date__field" type="text" readonly placeholder="YYYY-MM-DD" />
       <input type="hidden" />
     </div>
   Selecting a day writes ISO `YYYY-MM-DD` into the visible field and the
   hidden mirror, then dispatches brut:change with { value }.
   Native Date only — no deps. */
(function () {
  if (!window.Brut) return;

  var DOW = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];
  var MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
                'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

  function pad2(n) { return n < 10 ? '0' + n : '' + n; }
  function iso(d) { return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); }
  function parseISO(s) {
    if (!s) return null;
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s.trim());
    if (!m) return null;
    var y = +m[1], mo = +m[2] - 1, da = +m[3];
    var d = new Date(y, mo, da);
    if (d.getFullYear() !== y || d.getMonth() !== mo || d.getDate() !== da) return null;
    return d;
  }
  function sameYMD(a, b) {
    return a && b
      && a.getFullYear() === b.getFullYear()
      && a.getMonth()    === b.getMonth()
      && a.getDate()     === b.getDate();
  }
  function startOfMonth(d) { return new Date(d.getFullYear(), d.getMonth(), 1); }
  // Monday=0 ... Sunday=6
  function dowMon(d) { return (d.getDay() + 6) % 7; }

  Brut.register('date', {
    selector: '[data-brut="date"]',
    init: function (el) {
      var field = el.querySelector('.brut-date__field') || el.querySelector('input[type="text"], input[type="date"], input:not([type])');
      if (!field) return;

      // Hidden mirror
      var hidden = el.querySelector('input[type="hidden"]');
      if (!hidden && el.getAttribute('data-brut-name')) {
        hidden = document.createElement('input');
        hidden.type = 'hidden';
        hidden.name = el.getAttribute('data-brut-name');
        el.appendChild(hidden);
      }

      // State
      var today = new Date();
      today.setHours(0, 0, 0, 0);

      var initial = parseISO(field.value) || parseISO(hidden && hidden.value);
      var selected = initial; // Date or null
      var view = startOfMonth(initial || today);
      var focusDay = new Date((selected || today).getTime());

      // Build popover scaffolding
      var pop = el.querySelector('.brut-date__pop');
      if (!pop) {
        pop = document.createElement('div');
        pop.className = 'brut-date__pop';
        el.appendChild(pop);
      }
      pop.innerHTML = '';

      var head = document.createElement('div');
      head.className = 'brut-date__head';
      var prevBtn = document.createElement('button');
      prevBtn.className = 'brut-date__nav-btn';
      prevBtn.setAttribute('type', 'button');
      prevBtn.setAttribute('aria-label', 'Previous month');
      prevBtn.textContent = '‹';
      var title = document.createElement('span');
      title.className = 'brut-date__title';
      var nextBtn = document.createElement('button');
      nextBtn.className = 'brut-date__nav-btn';
      nextBtn.setAttribute('type', 'button');
      nextBtn.setAttribute('aria-label', 'Next month');
      nextBtn.textContent = '›';
      head.appendChild(prevBtn);
      head.appendChild(title);
      head.appendChild(nextBtn);
      pop.appendChild(head);

      var dows = document.createElement('div');
      dows.className = 'brut-date__dows';
      DOW.forEach(function (name) {
        var s = document.createElement('span');
        s.className = 'brut-date__dow';
        s.textContent = name;
        dows.appendChild(s);
      });
      pop.appendChild(dows);

      var grid = document.createElement('div');
      grid.className = 'brut-date__grid';
      grid.setAttribute('role', 'grid');
      pop.appendChild(grid);

      function render() {
        title.textContent = MONTHS[view.getMonth()] + ' ' + view.getFullYear();
        grid.innerHTML = '';
        var first = startOfMonth(view);
        var startCell = new Date(first.getTime());
        startCell.setDate(first.getDate() - dowMon(first));
        // Always 6 weeks = 42 cells.
        for (var i = 0; i < 42; i++) {
          var d = new Date(startCell.getTime());
          d.setDate(startCell.getDate() + i);
          var btn = document.createElement('button');
          btn.className = 'brut-date__day';
          btn.setAttribute('type', 'button');
          btn.setAttribute('role', 'gridcell');
          btn.textContent = d.getDate();
          btn.setAttribute('data-iso', iso(d));
          if (d.getMonth() !== view.getMonth()) btn.classList.add('brut-date__day--out');
          if (sameYMD(d, today))    btn.classList.add('brut-date__day--today');
          if (sameYMD(d, selected)) btn.classList.add('brut-date__day--selected');
          if (sameYMD(d, focusDay)) btn.setAttribute('tabindex', '0'); else btn.setAttribute('tabindex', '-1');
          btn.addEventListener('click', function (ev) {
            commit(parseISO(ev.currentTarget.getAttribute('data-iso')));
          });
          btn.addEventListener('keydown', onKey);
          grid.appendChild(btn);
        }
      }

      function focusActive() {
        var node = grid.querySelector('[tabindex="0"]');
        if (node && document.activeElement && pop.contains(document.activeElement)) {
          node.focus();
        }
      }

      function move(days) {
        var d = new Date(focusDay.getTime());
        d.setDate(d.getDate() + days);
        focusDay = d;
        // If we crossed into another month, reset view.
        if (d.getMonth() !== view.getMonth() || d.getFullYear() !== view.getFullYear()) {
          view = startOfMonth(d);
        }
        render();
        var node = grid.querySelector('[data-iso="' + iso(focusDay) + '"]');
        if (node) node.focus();
      }

      function onKey(e) {
        if (e.key === 'ArrowLeft')  { e.preventDefault(); move(-1); }
        else if (e.key === 'ArrowRight') { e.preventDefault(); move(1); }
        else if (e.key === 'ArrowUp')    { e.preventDefault(); move(-7); }
        else if (e.key === 'ArrowDown')  { e.preventDefault(); move(7); }
        else if (e.key === 'Enter')      { e.preventDefault(); commit(new Date(focusDay.getTime())); }
        else if (e.key === 'Escape')     { e.preventDefault(); close(); field.focus(); }
        else if (e.key === 'PageUp')     { e.preventDefault(); shiftMonth(-1); }
        else if (e.key === 'PageDown')   { e.preventDefault(); shiftMonth(1); }
      }

      function shiftMonth(delta) {
        view = new Date(view.getFullYear(), view.getMonth() + delta, 1);
        // Keep focusDay's day-of-month, clamped.
        var dim = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
        var day = Math.min(focusDay.getDate(), dim);
        focusDay = new Date(view.getFullYear(), view.getMonth(), day);
        render();
        focusActive();
      }

      var skipNextOpen = false;

      function commit(d) {
        if (!d) return;
        selected = d;
        focusDay = new Date(d.getTime());
        view = startOfMonth(d);
        var s = iso(d);
        field.value = s;
        if (hidden) hidden.value = s;
        render();
        el.dispatchEvent(new CustomEvent('brut:change', { detail: { value: s } }));
        close();
        skipNextOpen = true;
        field.focus();
      }

      function open() {
        if (skipNextOpen) { skipNextOpen = false; return; }
        if (el.classList.contains('brut-date--open')) return;
        // Re-anchor view + focusDay to current value if any.
        var cur = parseISO(field.value) || selected || today;
        focusDay = new Date(cur.getTime());
        if (cur.getMonth() !== view.getMonth() || cur.getFullYear() !== view.getFullYear()) {
          view = startOfMonth(cur);
        }
        el.classList.add('brut-date--open');
        field.setAttribute('aria-expanded', 'true');
        render();
        // Defer focus to next tick so click handlers don't immediately blur.
        setTimeout(function () {
          var node = grid.querySelector('[tabindex="0"]');
          if (node) node.focus();
        }, 0);
      }

      function close() {
        el.classList.remove('brut-date--open');
        field.setAttribute('aria-expanded', 'false');
      }

      // Wire field
      field.setAttribute('role', 'combobox');
      field.setAttribute('aria-haspopup', 'dialog');
      field.setAttribute('aria-expanded', 'false');
      if (!field.getAttribute('placeholder')) field.setAttribute('placeholder', 'YYYY-MM-DD');
      field.addEventListener('focus', open);
      field.addEventListener('click', open);
      field.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowDown' || e.key === 'Enter') {
          e.preventDefault();
          open();
        } else if (e.key === 'Escape') {
          close();
        }
      });
      field.addEventListener('change', function () {
        var p = parseISO(field.value);
        if (p) {
          selected = p;
          view = startOfMonth(p);
          focusDay = new Date(p.getTime());
          if (hidden) hidden.value = iso(p);
        }
      });

      prevBtn.addEventListener('click', function () { shiftMonth(-1); });
      nextBtn.addEventListener('click', function () { shiftMonth(1); });

      // Outside click closes.
      document.addEventListener('mousedown', function (e) {
        if (!el.contains(e.target)) close();
      });

      // Initial mirror sync if value pre-filled.
      if (selected && hidden && !hidden.value) hidden.value = iso(selected);

      render();
    }
  });
})();


/* --- dialog.js --- */
/* dialog — show/hide for .brut-dialog. Pair with optional .brut-scrim sibling.
   Markup:
     <button data-brut-open="confirm">DELETE</button>
     <div class="brut-scrim" id="confirm-scrim" hidden></div>
     <div class="brut-dialog" id="confirm" data-brut="dialog" data-brut-scrim="confirm-scrim" hidden role="dialog">
       <div class="brut-dialog__head">
         <span>CONFIRM</span>
         <button class="brut-dialog__x" data-brut-close>×</button>
       </div>
       …
     </div>
   Triggers on [data-brut-open="<id>"] open the dialog. Inside the
   dialog, .brut-dialog__x or any [data-brut-close] closes it.
   Escape closes any open dialog; clicking the scrim closes it. */
(function () {
  if (!window.Brut) return;
  Brut.register('dialog', {
    selector: '[data-brut="dialog"]',
    init: function (el) {
      if (!el.id) return;
      var scrimId = el.getAttribute('data-brut-scrim');
      var scrim = scrimId ? document.getElementById(scrimId) : null;

      function open() {
        el.removeAttribute('hidden');
        if (scrim) scrim.removeAttribute('hidden');
        el.dispatchEvent(new CustomEvent('brut:open'));
      }
      function close() {
        el.setAttribute('hidden', '');
        if (scrim) scrim.setAttribute('hidden', '');
        el.dispatchEvent(new CustomEvent('brut:close'));
      }

      document.querySelectorAll('[data-brut-open="' + el.id + '"]').forEach(function (t) {
        t.addEventListener('click', function (e) { e.preventDefault(); open(); });
      });

      el.querySelectorAll('[data-brut-close], .brut-dialog__x').forEach(function (t) {
        if (t.tagName === 'BUTTON') t.setAttribute('type', 'button');
        t.addEventListener('click', function (e) { e.preventDefault(); close(); });
      });

      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && !el.hasAttribute('hidden')) close();
      });

      if (scrim) {
        scrim.addEventListener('click', function (e) {
          if (e.target === scrim) close();
        });
      }
    }
  });
})();


/* --- drawer.js --- */
/* drawer — side sheet that slides in from any edge.
   Markup:
     <button data-brut-open="cart">CART</button>
     <div class="brut-scrim" id="cart-scrim" hidden></div>
     <div class="brut-drawer brut-drawer--right" id="cart"
          data-brut="drawer" data-brut-side="right"
          data-brut-scrim="cart-scrim" hidden role="dialog">
       <div class="brut-drawer__head">
         <span>CART</span>
         <button class="brut-drawer__x" data-brut-close>×</button>
       </div>
       <div class="brut-drawer__body">…</div>
     </div>
   Triggers on [data-brut-open="<id>"] open the drawer. .brut-drawer__x
   or any [data-brut-close] inside closes it. Esc closes the drawer; the
   scrim closes on outside click. The CSS transform direction is driven
   by the .brut-drawer--<side> class; .brut-drawer--open commits the
   open transform. Dispatches brut:open / brut:close. */
(function () {
  if (!window.Brut) return;
  Brut.register('drawer', {
    selector: '[data-brut="drawer"]',
    init: function (el) {
      if (!el.id) return;

      var side = el.getAttribute('data-brut-side') || 'right';
      var sideClass = 'brut-drawer--' + side;
      if (!el.classList.contains(sideClass)) el.classList.add(sideClass);

      var scrimId = el.getAttribute('data-brut-scrim');
      var scrim = scrimId ? document.getElementById(scrimId) : null;

      function open() {
        if (!el.hasAttribute('hidden') && el.classList.contains('brut-drawer--open')) return;
        el.removeAttribute('hidden');
        if (scrim) scrim.removeAttribute('hidden');
        // Force layout so the transition runs from the closed transform.
        void el.offsetWidth;
        el.classList.add('brut-drawer--open');
        el.dispatchEvent(new CustomEvent('brut:open'));
      }
      function close() {
        if (el.hasAttribute('hidden')) return;
        el.classList.remove('brut-drawer--open');
        el.setAttribute('hidden', '');
        if (scrim) scrim.setAttribute('hidden', '');
        el.dispatchEvent(new CustomEvent('brut:close'));
      }

      document.querySelectorAll('[data-brut-open="' + el.id + '"]').forEach(function (t) {
        if (t.tagName === 'BUTTON') t.setAttribute('type', 'button');
        t.addEventListener('click', function (e) { e.preventDefault(); open(); });
      });

      el.querySelectorAll('[data-brut-close], .brut-drawer__x').forEach(function (t) {
        if (t.tagName === 'BUTTON') t.setAttribute('type', 'button');
        t.addEventListener('click', function (e) { e.preventDefault(); close(); });
      });

      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && !el.hasAttribute('hidden')) close();
      });

      if (scrim) {
        scrim.addEventListener('click', function (e) {
          if (e.target === scrim) close();
        });
      }
    }
  });
})();


/* --- dropzone.js --- */
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
        el.dispatchEvent(new CustomEvent('brut:change', { detail: { files: input.files } }));
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


/* --- file.js --- */
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


/* --- menu.js --- */
/* menu — context / overflow menu.
   Markup:
     <button class="brut-btn" data-brut-menu-open="row-actions">⋯</button>
     <div class="brut-menu" id="row-actions" data-brut="menu" hidden>
       <button class="brut-menu__item" type="button">Edit</button>
       <button class="brut-menu__item" type="button">Duplicate</button>
       <hr class="brut-menu__sep"/>
       <button class="brut-menu__item brut-menu__item--danger" type="button">Delete</button>
     </div>
   Click trigger to open. Click outside / Esc / item click closes.
   Arrow keys move focus among items. Position is computed under the
   trigger via getBoundingClientRect(). Dispatches brut:open / brut:close. */
(function () {
  if (!window.Brut) return;
  Brut.register('menu', {
    selector: '[data-brut="menu"]',
    init: function (el) {
      if (!el.id) return;

      var triggers = document.querySelectorAll('[data-brut-menu-open="' + el.id + '"]');
      var lastTrigger = null;

      if (!el.hasAttribute('role')) el.setAttribute('role', 'menu');

      function items() {
        return el.querySelectorAll('.brut-menu__item');
      }

      function position() {
        if (!lastTrigger) return;
        var r = lastTrigger.getBoundingClientRect();
        var sx = window.pageXOffset || document.documentElement.scrollLeft;
        var sy = window.pageYOffset || document.documentElement.scrollTop;
        var gap = 6;
        el.style.position = 'absolute';
        el.style.top  = Math.round(r.bottom + sy + gap) + 'px';
        el.style.left = Math.round(r.left   + sx) + 'px';
      }

      function open(trigger) {
        lastTrigger = trigger || lastTrigger;
        el.removeAttribute('hidden');
        position();
        var first = el.querySelector('.brut-menu__item');
        if (first) {
          try { first.focus(); } catch (e) { /* ignore */ }
        }
        el.dispatchEvent(new CustomEvent('brut:open'));
      }
      function close() {
        if (el.hasAttribute('hidden')) return;
        el.setAttribute('hidden', '');
        el.dispatchEvent(new CustomEvent('brut:close'));
      }

      triggers.forEach(function (t) {
        if (t.tagName === 'BUTTON') t.setAttribute('type', 'button');
        t.setAttribute('aria-haspopup', 'menu');
        t.addEventListener('click', function (e) {
          e.preventDefault();
          if (el.hasAttribute('hidden')) open(t); else close();
        });
      });

      // Item click closes the menu.
      el.addEventListener('click', function (e) {
        var node = e.target;
        while (node && node !== el) {
          if (node.classList && node.classList.contains('brut-menu__item')) {
            close();
            return;
          }
          node = node.parentNode;
        }
      });

      // Arrow-key focus navigation.
      el.addEventListener('keydown', function (e) {
        var list = items();
        if (!list.length) return;
        var idx = -1;
        for (var i = 0; i < list.length; i++) {
          if (list[i] === document.activeElement) { idx = i; break; }
        }
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          var next = list[(idx + 1 + list.length) % list.length];
          if (next) next.focus();
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          var prev = list[(idx - 1 + list.length) % list.length];
          if (prev) prev.focus();
        } else if (e.key === 'Home') {
          e.preventDefault();
          list[0].focus();
        } else if (e.key === 'End') {
          e.preventDefault();
          list[list.length - 1].focus();
        }
      });

      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && !el.hasAttribute('hidden')) {
          close();
          if (lastTrigger) {
            try { lastTrigger.focus(); } catch (err) { /* ignore */ }
          }
        }
      });

      document.addEventListener('click', function (e) {
        if (el.hasAttribute('hidden')) return;
        if (el.contains(e.target)) return;
        for (var i = 0; i < triggers.length; i++) {
          if (triggers[i].contains(e.target)) return;
        }
        close();
      });

      window.addEventListener('resize', function () {
        if (!el.hasAttribute('hidden')) position();
      });
      window.addEventListener('scroll', function () {
        if (!el.hasAttribute('hidden')) position();
      }, true);
    }
  });
})();


/* --- multiselect.js --- */
/* multiselect — chips inside a combobox-style field.
   Markup:
     <div class="brut-multiselect" data-brut="multiselect" data-brut-name="skills">
       <div class="brut-multiselect__field">
         <input class="brut-multiselect__input" placeholder="Pick skills…" />
       </div>
       <ul class="brut-multiselect__list">
         <li class="brut-multiselect__opt" data-value="ux">UX</li>
         <li class="brut-multiselect__opt" data-value="css">CSS</li>
         <li class="brut-multiselect__empty">No matches.</li>
       </ul>
     </div>
   Maintains a Set of selected values. Click an option to toggle.
   Mirrors as one <input type="hidden" name="<n>"> per selected value.
   Dispatches brut:change with { values: [...] }. */
(function () {
  if (!window.Brut) return;

  Brut.register('multiselect', {
    selector: '[data-brut="multiselect"]',
    init: function (el) {
      var fieldShell = el.querySelector('.brut-multiselect__field');
      var input = el.querySelector('.brut-multiselect__input');
      var list  = el.querySelector('.brut-multiselect__list');
      if (!fieldShell || !input || !list) return;

      var name = el.getAttribute('data-brut-name') || 'values';
      var emptyEl = list.querySelector('.brut-multiselect__empty');
      var opts = Array.prototype.slice.call(list.querySelectorAll('.brut-multiselect__opt'));

      // Pre-selected options (data-selected attr) seed the Set.
      var selected = Object.create(null);
      opts.forEach(function (o) {
        if (o.hasAttribute('data-selected')) selected[o.getAttribute('data-value') || o.textContent.trim()] = labelOf(o);
      });

      function labelOf(o) { return (o.textContent || '').trim(); }
      function valueOf(o) { return o.getAttribute('data-value') || labelOf(o); }

      function open()  { el.classList.add('brut-multiselect--open');    input.setAttribute('aria-expanded', 'true'); }
      function close() { el.classList.remove('brut-multiselect--open'); input.setAttribute('aria-expanded', 'false'); }

      function syncHidden() {
        // Remove old hidden inputs we created
        Array.prototype.slice.call(el.querySelectorAll('input[type="hidden"][data-brut-mirror="1"]')).forEach(function (n) { n.remove(); });
        Object.keys(selected).forEach(function (v) {
          var h = document.createElement('input');
          h.type = 'hidden';
          h.name = name;
          h.value = v;
          h.setAttribute('data-brut-mirror', '1');
          el.appendChild(h);
        });
      }

      function renderChips() {
        // Wipe existing chips
        Array.prototype.slice.call(fieldShell.querySelectorAll('.brut-multiselect__chip')).forEach(function (c) { c.remove(); });
        var keys = Object.keys(selected);
        keys.forEach(function (v) {
          var chip = document.createElement('span');
          chip.className = 'brut-tag brut-multiselect__chip';
          chip.setAttribute('data-value', v);
          chip.appendChild(document.createTextNode(selected[v] + ' '));
          var x = document.createElement('button');
          x.className = 'brut-tag__x';
          x.setAttribute('type', 'button');
          x.setAttribute('aria-label', 'Remove ' + selected[v]);
          x.textContent = '×';
          x.addEventListener('mousedown', function (ev) { ev.preventDefault(); });
          x.addEventListener('click', function (ev) {
            ev.stopPropagation();
            remove(v);
          });
          chip.appendChild(x);
          fieldShell.insertBefore(chip, input);
        });
      }

      function renderOpts() {
        opts.forEach(function (o) {
          var v = valueOf(o);
          o.classList.toggle('brut-multiselect__opt--selected', !!selected[v]);
          o.setAttribute('aria-selected', selected[v] ? 'true' : 'false');
        });
      }

      function emit() {
        el.dispatchEvent(new CustomEvent('brut:change', { detail: { values: Object.keys(selected) } }));
      }

      function add(o) {
        var v = valueOf(o);
        if (selected[v]) return;
        selected[v] = labelOf(o);
        renderChips();
        renderOpts();
        syncHidden();
        emit();
      }
      function remove(v) {
        if (!selected[v]) return;
        delete selected[v];
        renderChips();
        renderOpts();
        syncHidden();
        emit();
        input.focus();
      }
      function toggle(o) {
        var v = valueOf(o);
        if (selected[v]) remove(v); else add(o);
      }

      function filter() {
        var q = (input.value || '').toLowerCase();
        var any = false;
        opts.forEach(function (o) {
          var match = labelOf(o).toLowerCase().indexOf(q) !== -1;
          o.style.display = match ? '' : 'none';
          if (match) any = true;
        });
        if (emptyEl) emptyEl.style.display = any ? 'none' : 'block';
        open();
      }

      input.setAttribute('role', 'combobox');
      input.setAttribute('aria-autocomplete', 'list');
      input.setAttribute('aria-expanded', 'false');
      list.setAttribute('role', 'listbox');
      list.setAttribute('aria-multiselectable', 'true');
      opts.forEach(function (o) { o.setAttribute('role', 'option'); });

      input.addEventListener('focus', open);
      input.addEventListener('input', filter);
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Backspace' && !input.value) {
          var keys = Object.keys(selected);
          if (keys.length) remove(keys[keys.length - 1]);
        } else if (e.key === 'Escape') {
          close();
        } else if (e.key === 'Enter') {
          var first = opts.filter(function (o) { return o.style.display !== 'none'; })[0];
          if (first) { e.preventDefault(); toggle(first); input.value = ''; filter(); }
        }
      });

      opts.forEach(function (o) {
        o.addEventListener('mousedown', function (e) { e.preventDefault(); toggle(o); input.focus(); });
      });

      fieldShell.addEventListener('click', function (e) {
        if (e.target === fieldShell) input.focus();
      });

      document.addEventListener('mousedown', function (e) { if (!el.contains(e.target)) close(); });

      // Initial paint
      renderChips();
      renderOpts();
      syncHidden();
    }
  });
})();


/* --- otp.js --- */
/* otp — one-cell-per-digit input with auto-advance + paste support.
   Markup (cells generated automatically when missing):
     <div class="brut-otp" data-brut="otp" data-brut-len="6" data-brut-name="code"></div>
   Or pre-populate cells:
     <div class="brut-otp" data-brut="otp" data-brut-name="code">
       <input class="brut-otp__cell" maxlength="1" inputmode="numeric">
       … six cells …
     </div>
   A hidden <input type="hidden" name="code"> is created to carry the
   joined value. Fires brut:change on every edit, brut:complete when full. */
(function () {
  if (!window.Brut) return;
  Brut.register('otp', {
    selector: '[data-brut="otp"]',
    init: function (el) {
      var len = parseInt(el.getAttribute('data-brut-len'), 10) || 6;
      var name = el.getAttribute('data-brut-name') || 'otp';

      var hidden = el.querySelector('input[type="hidden"]');
      if (!hidden) {
        hidden = document.createElement('input');
        hidden.type = 'hidden';
        hidden.name = name;
        el.appendChild(hidden);
      }

      var cells = el.querySelectorAll('.brut-otp__cell');
      if (cells.length === 0) {
        for (var i = 0; i < len; i++) {
          var c = document.createElement('input');
          c.className = 'brut-otp__cell';
          c.maxLength = 1;
          c.inputMode = 'numeric';
          c.autocomplete = 'one-time-code';
          el.insertBefore(c, hidden);
        }
        cells = el.querySelectorAll('.brut-otp__cell');
      }

      function gather() {
        var v = '';
        cells.forEach(function (c) { v += c.value || ''; });
        hidden.value = v;
        el.dispatchEvent(new CustomEvent('brut:change', { detail: { value: v } }));
        if (v.length === cells.length) {
          el.dispatchEvent(new CustomEvent('brut:complete', { detail: { value: v } }));
        }
      }

      cells.forEach(function (cell, i) {
        cell.addEventListener('input', function () {
          cell.value = (cell.value || '').replace(/\D/g, '').slice(0, 1);
          if (cell.value && cells[i + 1]) cells[i + 1].focus();
          gather();
        });
        cell.addEventListener('keydown', function (e) {
          if (e.key === 'Backspace' && !cell.value && cells[i - 1]) cells[i - 1].focus();
          if (e.key === 'ArrowLeft'  && cells[i - 1]) cells[i - 1].focus();
          if (e.key === 'ArrowRight' && cells[i + 1]) cells[i + 1].focus();
        });
        cell.addEventListener('paste', function (e) {
          var data = (e.clipboardData || window.clipboardData);
          if (!data) return;
          var text = data.getData('text').replace(/\D/g, '');
          if (!text) return;
          e.preventDefault();
          var k;
          for (k = 0; k < cells.length - i && k < text.length; k++) {
            cells[i + k].value = text.charAt(k);
          }
          var next = Math.min(i + text.length, cells.length - 1);
          cells[next].focus();
          gather();
        });
      });
    }
  });
})();


/* --- password.js --- */
/* password — input with SHOW/HIDE toggle.
   Markup:
     <div class="brut-password" data-brut="password">
       <input class="brut-input" type="password" value="••••">
       <button class="brut-password__toggle">SHOW</button>
     </div> */
(function () {
  if (!window.Brut) return;
  Brut.register('password', {
    selector: '[data-brut="password"]',
    init: function (el) {
      var input = el.querySelector('input');
      var btn   = el.querySelector('.brut-password__toggle');
      if (!input || !btn) return;
      btn.setAttribute('type', 'button');
      btn.textContent = input.type === 'password' ? 'SHOW' : 'HIDE';
      btn.addEventListener('click', function () {
        var hidden = input.type === 'password';
        input.type = hidden ? 'text' : 'password';
        btn.textContent = hidden ? 'HIDE' : 'SHOW';
        btn.setAttribute('aria-pressed', hidden ? 'true' : 'false');
      });
    }
  });
})();


/* --- popover.js --- */
/* popover — anchored card opened by a trigger.
   Markup:
     <button class="brut-btn" data-brut-popover-open="filters">FILTERS</button>
     <div class="brut-popover" id="filters" data-brut="popover" hidden>
       <div class="brut-popover__head">
         <span>Filters</span>
         <button class="brut-popover__x" data-brut-close type="button">×</button>
       </div>
       <div class="brut-popover__body">…</div>
     </div>
   Click trigger to open. Click outside / Esc / [data-brut-close] closes.
   Position is computed under the trigger via getBoundingClientRect(). */
(function () {
  if (!window.Brut) return;
  Brut.register('popover', {
    selector: '[data-brut="popover"]',
    init: function (el) {
      if (!el.id) return;

      var triggers = document.querySelectorAll('[data-brut-popover-open="' + el.id + '"]');
      var lastTrigger = null;

      function position() {
        if (!lastTrigger) return;
        var r = lastTrigger.getBoundingClientRect();
        var sx = window.pageXOffset || document.documentElement.scrollLeft;
        var sy = window.pageYOffset || document.documentElement.scrollTop;
        var gap = 8;
        el.style.position = 'absolute';
        el.style.top  = Math.round(r.bottom + sy + gap) + 'px';
        el.style.left = Math.round(r.left   + sx) + 'px';
      }

      function open(trigger) {
        lastTrigger = trigger || lastTrigger;
        el.removeAttribute('hidden');
        position();
        el.dispatchEvent(new CustomEvent('brut:open'));
      }
      function close() {
        if (el.hasAttribute('hidden')) return;
        el.setAttribute('hidden', '');
        el.dispatchEvent(new CustomEvent('brut:close'));
      }

      triggers.forEach(function (t) {
        if (t.tagName === 'BUTTON') t.setAttribute('type', 'button');
        t.addEventListener('click', function (e) {
          e.preventDefault();
          if (el.hasAttribute('hidden')) open(t); else close();
        });
      });

      el.querySelectorAll('[data-brut-close], .brut-popover__x').forEach(function (t) {
        if (t.tagName === 'BUTTON') t.setAttribute('type', 'button');
        t.addEventListener('click', function (e) { e.preventDefault(); close(); });
      });

      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && !el.hasAttribute('hidden')) close();
      });

      document.addEventListener('click', function (e) {
        if (el.hasAttribute('hidden')) return;
        if (el.contains(e.target)) return;
        for (var i = 0; i < triggers.length; i++) {
          if (triggers[i].contains(e.target)) return;
        }
        close();
      });

      window.addEventListener('resize', function () {
        if (!el.hasAttribute('hidden')) position();
      });
      window.addEventListener('scroll', function () {
        if (!el.hasAttribute('hidden')) position();
      }, true);
    }
  });
})();


/* --- radio.js --- */
/* radio — visual radio synced to an inner hidden <input type="radio">.
   Group via the radio input's `name` attribute, or by setting
   data-brut-name="<group>" on each radio when no input is present.
   Markup:
     <label class="brut-radio" data-brut="radio">
       <input type="radio" name="size" value="md" hidden>
     </label> */
(function () {
  if (!window.Brut) return;
  Brut.register('radio', {
    selector: '[data-brut="radio"]',
    init: function (el) {
      var input = el.querySelector('input[type="radio"]');
      var groupName = el.getAttribute('data-brut-name') || (input && input.name);

      function sync() {
        var on = input ? input.checked : el.classList.contains('brut-radio--on');
        el.classList.toggle('brut-radio--on', on);
        el.setAttribute('aria-checked', on ? 'true' : 'false');
      }

      if (!el.hasAttribute('role'))     el.setAttribute('role', 'radio');
      if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0');

      el.addEventListener('click', function (e) {
        if (e.target === input) return;
        if (input) {
          input.checked = true;
          input.dispatchEvent(new Event('change', { bubbles: true }));
        } else if (groupName) {
          var siblings = document.querySelectorAll(
            '[data-brut="radio"][data-brut-name="' + groupName + '"]'
          );
          for (var i = 0; i < siblings.length; i++) {
            siblings[i].classList.remove('brut-radio--on');
            siblings[i].setAttribute('aria-checked', 'false');
          }
          el.classList.add('brut-radio--on');
          el.setAttribute('aria-checked', 'true');
        }
        sync();
        el.dispatchEvent(new CustomEvent('brut:change', {
          detail: { value: input ? input.value : el.getAttribute('data-value') }
        }));
      });

      el.addEventListener('keydown', function (e) {
        if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); el.click(); }
      });

      if (input) {
        // Sync siblings when any radio in the group changes (via labels, etc).
        document.addEventListener('change', function (e) {
          if (e.target && e.target.type === 'radio' && e.target.name === input.name) sync();
        });
      }
      sync();
    }
  });
})();


/* --- range-dual.js --- */
/* range-dual — two-thumb range slider.
   Markup:
     <div class="brut-range-dual" data-brut="range-dual"
          data-brut-min="0" data-brut-max="100" data-brut-step="1"
          data-brut-value-min="20" data-brut-value-max="80"
          data-brut-name-min="price_min" data-brut-name-max="price_max">
     </div>
   Builds the track, fill, and two thumbs internally. Mirrors min/max to
   two hidden inputs. Pointer-down on a thumb installs document-level
   move/up listeners; arrow keys nudge by step. Dispatches brut:change. */
(function () {
  if (!window.Brut) return;

  function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }

  Brut.register('range-dual', {
    selector: '[data-brut="range-dual"]',
    init: function (el) {
      var min  = parseFloat(el.getAttribute('data-brut-min'))  || 0;
      var max  = parseFloat(el.getAttribute('data-brut-max'));
      if (isNaN(max)) max = 100;
      var step = parseFloat(el.getAttribute('data-brut-step')) || 1;

      var vMin = parseFloat(el.getAttribute('data-brut-value-min'));
      var vMax = parseFloat(el.getAttribute('data-brut-value-max'));
      if (isNaN(vMin)) vMin = min;
      if (isNaN(vMax)) vMax = max;

      var nameMin = el.getAttribute('data-brut-name-min');
      var nameMax = el.getAttribute('data-brut-name-max');

      // Build internal DOM if not present.
      var track = el.querySelector('.brut-range-dual__track');
      if (!track) {
        track = document.createElement('div');
        track.className = 'brut-range-dual__track';
        el.appendChild(track);
      } else {
        track.innerHTML = '';
      }
      var fill = document.createElement('div');
      fill.className = 'brut-range-dual__fill';
      track.appendChild(fill);

      var thumbMin = el.querySelector('.brut-range-dual__thumb:not(.brut-range-dual__thumb--max)');
      if (!thumbMin) {
        thumbMin = document.createElement('button');
        thumbMin.className = 'brut-range-dual__thumb';
        el.appendChild(thumbMin);
      }
      thumbMin.setAttribute('type', 'button');
      thumbMin.setAttribute('role', 'slider');
      thumbMin.setAttribute('aria-label', 'Minimum');

      var thumbMax = el.querySelector('.brut-range-dual__thumb--max');
      if (!thumbMax) {
        thumbMax = document.createElement('button');
        thumbMax.className = 'brut-range-dual__thumb brut-range-dual__thumb--max';
        el.appendChild(thumbMax);
      }
      thumbMax.setAttribute('type', 'button');
      thumbMax.setAttribute('role', 'slider');
      thumbMax.setAttribute('aria-label', 'Maximum');

      // Hidden mirrors
      var hMin = null, hMax = null;
      if (nameMin) {
        hMin = el.querySelector('input[type="hidden"][data-brut-role="min"]');
        if (!hMin) {
          hMin = document.createElement('input');
          hMin.type = 'hidden';
          hMin.setAttribute('data-brut-role', 'min');
          hMin.name = nameMin;
          el.appendChild(hMin);
        }
      }
      if (nameMax) {
        hMax = el.querySelector('input[type="hidden"][data-brut-role="max"]');
        if (!hMax) {
          hMax = document.createElement('input');
          hMax.type = 'hidden';
          hMax.setAttribute('data-brut-role', 'max');
          hMax.name = nameMax;
          el.appendChild(hMax);
        }
      }

      function snap(v) {
        v = clamp(v, min, max);
        if (step > 0 && isFinite(min)) {
          v = min + Math.round((v - min) / step) * step;
          v = parseFloat(v.toFixed(10));
        }
        return clamp(v, min, max);
      }

      function pct(v) { return ((v - min) / (max - min)) * 100; }

      function render() {
        var pMin = pct(vMin);
        var pMax = pct(vMax);
        thumbMin.style.left = pMin + '%';
        thumbMax.style.left = pMax + '%';
        fill.style.left  = pMin + '%';
        fill.style.width = (pMax - pMin) + '%';
        thumbMin.setAttribute('aria-valuemin', String(min));
        thumbMin.setAttribute('aria-valuemax', String(vMax));
        thumbMin.setAttribute('aria-valuenow', String(vMin));
        thumbMax.setAttribute('aria-valuemin', String(vMin));
        thumbMax.setAttribute('aria-valuemax', String(max));
        thumbMax.setAttribute('aria-valuenow', String(vMax));
        if (hMin) hMin.value = String(vMin);
        if (hMax) hMax.value = String(vMax);
      }

      function emit() {
        el.dispatchEvent(new CustomEvent('brut:change', { detail: { min: vMin, max: vMax } }));
      }

      function setMin(v) { var nv = clamp(snap(v), min, vMax); if (nv !== vMin) { vMin = nv; render(); emit(); } }
      function setMax(v) { var nv = clamp(snap(v), vMin, max); if (nv !== vMax) { vMax = nv; render(); emit(); } }

      function valueFromClientX(clientX) {
        var rect = track.getBoundingClientRect();
        var ratio = (clientX - rect.left) / rect.width;
        ratio = clamp(ratio, 0, 1);
        return min + ratio * (max - min);
      }

      function startDrag(thumb, isMax, e) {
        e.preventDefault();
        thumb.focus();
        function onMove(ev) {
          var x = ev.clientX;
          if (typeof x !== 'number' && ev.touches && ev.touches[0]) x = ev.touches[0].clientX;
          if (typeof x !== 'number') return;
          var v = valueFromClientX(x);
          if (isMax) setMax(v); else setMin(v);
        }
        function onUp() {
          document.removeEventListener('pointermove', onMove);
          document.removeEventListener('pointerup',   onUp);
          document.removeEventListener('pointercancel', onUp);
        }
        document.addEventListener('pointermove', onMove);
        document.addEventListener('pointerup',   onUp);
        document.addEventListener('pointercancel', onUp);
      }

      thumbMin.addEventListener('pointerdown', function (e) { startDrag(thumbMin, false, e); });
      thumbMax.addEventListener('pointerdown', function (e) { startDrag(thumbMax, true,  e); });

      function keys(thumb, isMax) {
        thumb.addEventListener('keydown', function (e) {
          var bump = 0;
          if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') bump = -step;
          else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') bump = step;
          else if (e.key === 'PageDown') bump = -step * 10;
          else if (e.key === 'PageUp')   bump =  step * 10;
          else if (e.key === 'Home') { e.preventDefault(); if (isMax) setMax(vMin); else setMin(min); return; }
          else if (e.key === 'End')  { e.preventDefault(); if (isMax) setMax(max); else setMin(vMax); return; }
          if (bump !== 0) {
            e.preventDefault();
            if (isMax) setMax(vMax + bump); else setMin(vMin + bump);
          }
        });
      }
      keys(thumbMin, false);
      keys(thumbMax, true);

      // Click on track moves the closer thumb.
      track.addEventListener('pointerdown', function (e) {
        if (e.target !== track && e.target !== fill) return;
        var v = valueFromClientX(e.clientX);
        var dMin = Math.abs(v - vMin), dMax = Math.abs(v - vMax);
        if (dMin <= dMax) { setMin(v); startDrag(thumbMin, false, e); }
        else              { setMax(v); startDrag(thumbMax, true,  e); }
      });

      // Snap initial values + paint
      vMin = snap(vMin);
      vMax = snap(vMax);
      if (vMin > vMax) { var t = vMin; vMin = vMax; vMax = t; }
      render();
    }
  });
})();


/* --- rating.js --- */
/* rating — star row (or any glyph row).
   Markup:
     <div class="brut-rating" data-brut="rating" data-brut-name="quality" data-brut-value="3">
       <button class="brut-rating__star"></button>
       <button class="brut-rating__star"></button>
       <button class="brut-rating__star"></button>
       <button class="brut-rating__star"></button>
       <button class="brut-rating__star"></button>
     </div>
   A hidden <input type="hidden" name="…"> is created automatically
   when data-brut-name is set. Hover previews the score; click locks it.

   Keyboard (on the wrapper):
     ArrowRight / ArrowUp   — +1 (cap at max)
     ArrowLeft  / ArrowDown — −1 (floor at 0)
     Home                   — 0
     End                    — max */
(function () {
  if (!window.Brut) return;
  Brut.register('rating', {
    selector: '[data-brut="rating"]',
    init: function (el) {
      var stars = el.querySelectorAll('.brut-rating__star');
      if (!stars.length) return;
      var max = stars.length;

      var hidden = el.querySelector('input[type="hidden"]');
      if (!hidden && el.getAttribute('data-brut-name')) {
        hidden = document.createElement('input');
        hidden.type = 'hidden';
        hidden.name = el.getAttribute('data-brut-name');
        el.appendChild(hidden);
      }

      var initial = parseInt((hidden && hidden.value) || el.getAttribute('data-brut-value') || '0', 10);
      var current = isFinite(initial) ? initial : 0;
      if (hidden) hidden.value = String(current);

      // Wrapper a11y: slider, focusable.
      el.setAttribute('role', 'slider');
      el.setAttribute('aria-valuemin', '0');
      el.setAttribute('aria-valuemax', String(max));
      if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0');

      function paint(n) {
        stars.forEach(function (s, i) {
          s.classList.toggle('brut-rating__star--on', i < n);
          s.setAttribute('aria-checked', i + 1 === n ? 'true' : 'false');
        });
        el.setAttribute('aria-valuenow', String(n));
      }

      function set(n) {
        n = Math.max(0, Math.min(max, n));
        current = n;
        if (hidden) {
          hidden.value = String(current);
          hidden.dispatchEvent(new Event('change', { bubbles: true }));
        }
        paint(current);
        el.dispatchEvent(new CustomEvent('brut:change', { detail: { value: current } }));
      }

      stars.forEach(function (star, i) {
        star.setAttribute('type', 'button');
        star.setAttribute('role', 'radio');
        star.addEventListener('mouseenter', function () { paint(i + 1); });
        star.addEventListener('focus',      function () { paint(i + 1); });
        star.addEventListener('click', function () {
          set(current === i + 1 ? 0 : i + 1);
        });
      });

      el.addEventListener('keydown', function (e) {
        var next = null;
        switch (e.key) {
          case 'ArrowRight':
          case 'ArrowUp':    next = current + 1; break;
          case 'ArrowLeft':
          case 'ArrowDown':  next = current - 1; break;
          case 'Home':       next = 0; break;
          case 'End':        next = max; break;
          default: return;
        }
        e.preventDefault();
        set(next);
      });

      el.addEventListener('mouseleave', function () { paint(current); });
      el.addEventListener('focusout',   function () { paint(current); });
      paint(current);
    }
  });
})();


/* --- search.js --- */
/* search — input with × clear button. Hides clear when value is empty.
   Markup:
     <div class="brut-search" data-brut="search">
       <input class="brut-input" type="search" placeholder="Search…">
       <button class="brut-search__clear" aria-label="Clear">×</button>
     </div> */
(function () {
  if (!window.Brut) return;
  Brut.register('search', {
    selector: '[data-brut="search"]',
    init: function (el) {
      var input = el.querySelector('input');
      var btn   = el.querySelector('.brut-search__clear');
      if (!input) return;

      function refresh() { el.classList.toggle('brut-search--has-value', !!input.value); }

      input.addEventListener('input', refresh);
      if (btn) {
        btn.setAttribute('type', 'button');
        btn.addEventListener('click', function () {
          input.value = '';
          input.dispatchEvent(new Event('input',  { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
          input.focus();
          refresh();
        });
      }
      refresh();
    }
  });
})();


/* --- segmented.js --- */
/* segmented — exclusive choice group on .brut-seg / .brut-seg__btn.
   Markup:
     <div class="brut-seg" data-brut="segmented">
       <button class="brut-seg__btn brut-seg__btn--on" data-value="day">DAY</button>
       <button class="brut-seg__btn" data-value="week">WEEK</button>
     </div>
   Mirror to a form by setting data-brut-name="<input-name>" on the wrapper —
   a hidden <input type="hidden"> is created automatically.

   Keyboard (roving tabindex):
     ArrowLeft / ArrowUp    — previous (wrap)
     ArrowRight / ArrowDown — next (wrap)
     Home / End             — first / last */
(function () {
  if (!window.Brut) return;
  Brut.register('segmented', {
    selector: '[data-brut="segmented"]',
    init: function (el) {
      var name = el.getAttribute('data-brut-name');
      var hidden = el.querySelector('input[type="hidden"]');
      if (name && !hidden) {
        hidden = document.createElement('input');
        hidden.type = 'hidden';
        hidden.name = name;
        el.appendChild(hidden);
      }

      el.setAttribute('role', 'tablist');

      var btns = Array.prototype.slice.call(el.querySelectorAll('.brut-seg__btn'));

      function select(btn, focusIt) {
        btns.forEach(function (b) {
          var on = b === btn;
          b.classList.toggle('brut-seg__btn--on', on);
          b.setAttribute('aria-selected', on ? 'true' : 'false');
          b.setAttribute('tabindex', on ? '0' : '-1');
        });
        var value = btn.getAttribute('data-value') || btn.textContent.trim();
        if (hidden) hidden.value = value;
        if (focusIt) btn.focus();
        el.dispatchEvent(new CustomEvent('brut:change', { detail: { value: value } }));
      }

      btns.forEach(function (btn) {
        btn.setAttribute('type', 'button');
        btn.setAttribute('role', 'tab');
        btn.addEventListener('click', function () { select(btn); });
      });

      el.addEventListener('keydown', function (e) {
        var t = e.target;
        if (!t || !t.classList || !t.classList.contains('brut-seg__btn')) return;
        var i = btns.indexOf(t);
        if (i < 0) return;
        var next = null;
        switch (e.key) {
          case 'ArrowLeft':
          case 'ArrowUp':    next = btns[(i - 1 + btns.length) % btns.length]; break;
          case 'ArrowRight':
          case 'ArrowDown':  next = btns[(i + 1) % btns.length]; break;
          case 'Home':       next = btns[0]; break;
          case 'End':        next = btns[btns.length - 1]; break;
          default: return;
        }
        e.preventDefault();
        select(next, true);
      });

      var initial = el.querySelector('.brut-seg__btn--on') || btns[0];
      if (initial) {
        // Set roving tabindex on initial render without firing brut:change.
        btns.forEach(function (b) {
          b.setAttribute('tabindex', b === initial ? '0' : '-1');
          b.setAttribute('aria-selected', b === initial ? 'true' : 'false');
        });
        if (hidden && !hidden.value) {
          hidden.value = initial.getAttribute('data-value') || initial.textContent.trim();
        }
      }
    }
  });
})();


/* --- sidebar.js --- */
/* sidebar — vertical app nav. JS is optional; only powers
   collapsible groups when the group title is a <button>.
   Markup:
     <aside class="brut-sidebar" data-brut="sidebar">
       <a class="brut-sidebar__brand" href="/">BRAND</a>
       <div class="brut-sidebar__group">
         <button class="brut-sidebar__group-title">Main</button>
         <a class="brut-sidebar__item brut-sidebar__item--active" href="…">Dashboard</a>
         <a class="brut-sidebar__item" href="…">Projects</a>
       </div>
     </aside>
   Click on a <button class="brut-sidebar__group-title"> toggles
   `.brut-sidebar__group--closed` on the parent group. Static <h3>
   (or any non-button) titles render the same but never collapse.
*/
(function () {
  if (!window.Brut) return;
  Brut.register('sidebar', {
    selector: '[data-brut="sidebar"]',
    init: function (el) {
      var titles = el.querySelectorAll('button.brut-sidebar__group-title');
      titles.forEach(function (btn) {
        btn.setAttribute('type', 'button');
        var group = btn.closest('.brut-sidebar__group');
        if (!group) return;
        var initiallyClosed = group.classList.contains('brut-sidebar__group--closed');
        btn.setAttribute('aria-expanded', initiallyClosed ? 'false' : 'true');
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          var willClose = !group.classList.contains('brut-sidebar__group--closed');
          group.classList.toggle('brut-sidebar__group--closed', willClose);
          btn.setAttribute('aria-expanded', willClose ? 'false' : 'true');
          el.dispatchEvent(new CustomEvent('brut:change', {
            detail: { group: group, closed: willClose }
          }));
        });
      });
    }
  });
})();


/* --- stepper.js --- */
/* stepper — number input with -/+ buttons.
   Markup:
     <div class="brut-stepper" data-brut="stepper">
       <button class="brut-stepper__btn" data-brut-step="down">−</button>
       <input class="brut-stepper__input" type="number" min="0" max="99" step="1" value="0">
       <button class="brut-stepper__btn" data-brut-step="up">+</button>
     </div>
   Reads min / max / step from the inner input.

   Keyboard (on the inner input):
     ArrowUp / ArrowDown — ±step
     PageUp / PageDown   — ±step×10 */
(function () {
  if (!window.Brut) return;
  Brut.register('stepper', {
    selector: '[data-brut="stepper"]',
    init: function (el) {
      var input = el.querySelector('input');
      if (!input) return;

      function read(attr, fallback) {
        var v = input.getAttribute(attr);
        return v === null || v === '' ? fallback : parseFloat(v);
      }

      function syncAria() {
        el.setAttribute('aria-valuenow', input.value);
      }

      function clampAndDispatch(v) {
        var step = read('step', 1) || 1;
        var min  = read('min', -Infinity);
        var max  = read('max',  Infinity);
        v = Math.min(max, Math.max(min, v));
        // Snap to step grid relative to min when min is finite.
        if (isFinite(min)) v = min + Math.round((v - min) / step) * step;
        // Clean float fuzz.
        v = parseFloat(v.toFixed(10));
        input.value = v;
        syncAria();
        input.dispatchEvent(new Event('input',  { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }

      function bump(mult) {
        var step = read('step', 1) || 1;
        var v = parseFloat(input.value);
        if (isNaN(v)) v = read('min', 0);
        clampAndDispatch(v + mult * step);
      }

      var btns = el.querySelectorAll('.brut-stepper__btn');
      btns.forEach(function (b, i) {
        b.setAttribute('type', 'button');
        var dirAttr = b.getAttribute('data-brut-step');
        var dir = dirAttr === 'down' ? -1
                : dirAttr === 'up'   ?  1
                : (i === 0 ? -1 : 1);
        b.addEventListener('click', function () { bump(dir); });
      });

      // ARIA: spinbutton wrapper with current/min/max.
      el.setAttribute('role', 'spinbutton');
      var minAttr = input.getAttribute('min');
      var maxAttr = input.getAttribute('max');
      if (minAttr !== null) el.setAttribute('aria-valuemin', minAttr);
      if (maxAttr !== null) el.setAttribute('aria-valuemax', maxAttr);
      syncAria();
      input.addEventListener('input', syncAria);

      input.addEventListener('keydown', function (e) {
        var mult = 0;
        switch (e.key) {
          case 'ArrowUp':   mult =  1;  break;
          case 'ArrowDown': mult = -1;  break;
          case 'PageUp':    mult =  10; break;
          case 'PageDown':  mult = -10; break;
          default: return;
        }
        e.preventDefault();
        bump(mult);
      });
    }
  });
})();


/* --- switch.js --- */
/* switch — visual toggle synced to an inner <input type="checkbox">.
   Markup:
     <label class="brut-switch" data-brut="switch">
       <input type="checkbox" hidden>
       <span class="brut-switch__knob"></span>
     </label>
   The hidden checkbox is the source of truth — it posts with the form. */
(function () {
  if (!window.Brut) return;
  Brut.register('switch', {
    selector: '[data-brut="switch"]',
    init: function (el) {
      var input = el.querySelector('input[type="checkbox"]');

      function sync() {
        var on = input ? input.checked : el.classList.contains('brut-switch--on');
        el.classList.toggle('brut-switch--on', on);
        el.setAttribute('aria-checked', on ? 'true' : 'false');
      }

      if (!el.hasAttribute('role'))     el.setAttribute('role', 'switch');
      if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0');

      function emit() {
        el.dispatchEvent(new CustomEvent('brut:change', {
          detail: { checked: el.classList.contains('brut-switch--on') }
        }));
      }

      el.addEventListener('click', function (e) {
        if (e.target === input) return;
        // Suppress native <label> activation so we don't toggle twice.
        e.preventDefault();
        if (input) {
          input.checked = !input.checked;
          input.dispatchEvent(new Event('change', { bubbles: true }));
        } else {
          el.classList.toggle('brut-switch--on');
          sync();
          emit();
        }
      });

      el.addEventListener('keydown', function (e) {
        if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); el.click(); }
      });

      if (input) input.addEventListener('change', function () { sync(); emit(); });
      sync();
    }
  });
})();


/* --- table-reorder.js --- */
/* table-reorder — drag-to-reorder columns via HTML5 drag-and-drop.
   Markup:
     <table class="brut-table" data-brut="table-reorder">
       <colgroup><col data-col="name"><col data-col="email">...</colgroup>
       <thead>
         <tr>
           <th data-col="name">Name</th>
           <th data-col="email">Email</th>
           ...
         </tr>
       </thead>
       <tbody>...</tbody>
     </table>
   The component adds .brut-table--reorderable to the table, sets draggable="true"
   on every <th>, shows a 4px drop indicator, and reorders <col>, <th>, and <td>
   columns on drop. Emits brut:change { source: 'reorder', order } on each commit.
*/
(function () {
  if (!window.Brut) return;
  Brut.register('table-reorder', {
    selector: '[data-brut="table-reorder"]',
    init: function (table) {
      table.classList.add('brut-table--reorderable');
      var thead = table.querySelector('thead');
      if (!thead) return;
      var ths = Array.prototype.slice.call(thead.querySelectorAll('th'));
      var colgroup = table.querySelector('colgroup');
      var indicator = document.createElement('div');
      indicator.className = 'brut-table__drop-indicator';
      indicator.style.display = 'none';
      thead.appendChild(indicator);

      var dragIndex = -1;

      function moveColumn(from, to) {
        if (from === to) return;
        function moveChild(parent, fromIdx, toIdx) {
          var children = parent.children;
          var node = children[fromIdx];
          var ref = children[toIdx];
          if (!node || !ref) return;
          if (fromIdx < toIdx) parent.insertBefore(node, ref.nextSibling);
          else parent.insertBefore(node, ref);
        }
        if (colgroup) moveChild(colgroup, from, to);
        moveChild(thead.querySelector('tr'), from, to);
        Array.prototype.forEach.call(table.querySelectorAll('tbody tr'), function (tr) {
          moveChild(tr, from, to);
        });
        var keys = Array.prototype.slice.call(thead.querySelectorAll('th')).map(function (h) { return h.getAttribute('data-col') || ''; });
        table.dispatchEvent(new CustomEvent('brut:change', { detail: { source: 'reorder', order: keys }, bubbles: true }));
      }

      ths.forEach(function (th) {
        th.setAttribute('draggable', 'true');
        th.addEventListener('dragstart', function (e) {
          dragIndex = Array.prototype.indexOf.call(thead.querySelectorAll('th'), th);
          th.classList.add('brut-table__th--dragging');
          if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move';
        });
        th.addEventListener('dragover', function (e) {
          e.preventDefault();
          var rect = th.getBoundingClientRect();
          var theadRect = thead.getBoundingClientRect();
          var midpoint = rect.left + rect.width / 2;
          var x = e.clientX < midpoint ? rect.left : rect.right;
          indicator.style.left = (x - theadRect.left) + 'px';
          indicator.style.display = 'block';
        });
        th.addEventListener('drop', function (e) {
          e.preventDefault();
          var rect = th.getBoundingClientRect();
          var midpoint = rect.left + rect.width / 2;
          var dropIndex = Array.prototype.indexOf.call(thead.querySelectorAll('th'), th);
          if (e.clientX > midpoint) dropIndex++;
          // Adjust if moving forward (target index shifts after removing source)
          if (dragIndex < dropIndex) dropIndex--;
          moveColumn(dragIndex, dropIndex);
          indicator.style.display = 'none';
        });
        th.addEventListener('dragend', function () {
          th.classList.remove('brut-table__th--dragging');
          indicator.style.display = 'none';
          dragIndex = -1;
        });
      });
    }
  });
})();


/* --- table.js --- */
/* table — sortable headers + select-all behavior for data tables.
   Markup:
     <table class="brut-table" data-brut="table">
       <thead class="brut-table__head">
         <tr class="brut-table__row">
           <th class="brut-table__cell">
             <span class="brut-cb" data-brut-select-all></span>
           </th>
           <th class="brut-table__cell brut-table__cell--sortable" data-sort-key="name">Name</th>
           <th class="brut-table__cell brut-table__cell--sortable brut-table__cell--num" data-sort-key="qty">Qty</th>
         </tr>
       </thead>
       <tbody>
         <tr class="brut-table__row">
           <td class="brut-table__cell">
             <label class="brut-cb" data-brut-row-select><input type="checkbox" hidden></label>
           </td>
           <td class="brut-table__cell" data-sort-value="alpha">Alpha</td>
           <td class="brut-table__cell brut-table__cell--num" data-sort-value="3">3</td>
         </tr>
       </tbody>
     </table>
   Sort: click a --sortable header to toggle asc/desc by data-sort-key.
   Each row cell with matching data-sort-key supplies a data-sort-value.
   Numeric values sort numerically; otherwise string-locale sort.
   Select-all: the [data-brut-select-all] header element toggles every
   [data-brut-row-select] in the same table.
*/
(function () {
  if (!window.Brut) return;

  function compare(a, b, dir) {
    var na = parseFloat(a), nb = parseFloat(b);
    var bothNumeric = !isNaN(na) && !isNaN(nb) && String(na) === String(a).trim() && String(nb) === String(b).trim();
    var cmp;
    if (bothNumeric) {
      cmp = na - nb;
    } else {
      cmp = String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' });
    }
    return dir === 'descending' ? -cmp : cmp;
  }

  function sortBy(table, key, dir) {
    var thead = table.querySelector('thead');
    var tbody = table.querySelector('tbody');
    if (!tbody) return;

    var headers = thead ? thead.querySelectorAll('.brut-table__cell--sortable') : [];
    var sortIndex = -1;
    for (var i = 0; i < headers.length; i++) {
      var h = headers[i];
      var isThis = h.getAttribute('data-sort-key') === key;
      h.classList.toggle('brut-table__cell--sorted',      isThis && dir === 'ascending');
      h.classList.toggle('brut-table__cell--sorted-desc', isThis && dir === 'descending');
      h.setAttribute('aria-sort', isThis ? dir : 'none');
    }

    // Find the column index for this key by matching the header position.
    var headerCells = thead ? thead.querySelectorAll('.brut-table__cell') : [];
    for (var k = 0; k < headerCells.length; k++) {
      if (headerCells[k].getAttribute('data-sort-key') === key) { sortIndex = k; break; }
    }

    var rows = Array.prototype.slice.call(tbody.querySelectorAll('tr'));
    rows.sort(function (ra, rb) {
      var ca = ra.children[sortIndex];
      var cb = rb.children[sortIndex];
      var va = ca ? (ca.getAttribute('data-sort-value') !== null ? ca.getAttribute('data-sort-value') : (ca.textContent || '').trim()) : '';
      var vb = cb ? (cb.getAttribute('data-sort-value') !== null ? cb.getAttribute('data-sort-value') : (cb.textContent || '').trim()) : '';
      return compare(va, vb, dir);
    });
    rows.forEach(function (r) { tbody.appendChild(r); });
  }

  Brut.register('table', {
    selector: '[data-brut="table"]',
    init: function (el) {
      var thead = el.querySelector('thead');
      var tbody = el.querySelector('tbody');
      if (!thead) return;

      // Sortable header wiring.
      var sortables = thead.querySelectorAll('.brut-table__cell--sortable');
      for (var i = 0; i < sortables.length; i++) {
        (function (h) {
          if (!h.hasAttribute('aria-sort')) h.setAttribute('aria-sort', 'none');
          if (!h.hasAttribute('role'))      h.setAttribute('role', 'columnheader');
          if (!h.hasAttribute('tabindex'))  h.setAttribute('tabindex', '0');

          function trigger() {
            var key = h.getAttribute('data-sort-key');
            if (!key) return;
            var current = h.getAttribute('aria-sort');
            var dir = current === 'ascending' ? 'descending' : 'ascending';
            sortBy(el, key, dir);
            el.dispatchEvent(new CustomEvent('brut:change', {
              detail: { key: key, dir: dir }
            }));
          }

          h.addEventListener('click', trigger);
          h.addEventListener('keydown', function (e) {
            if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); trigger(); }
          });
        })(sortables[i]);
      }

      // Select-all wiring.
      var selectAll = el.querySelector('[data-brut-select-all]');
      if (selectAll) {
        if (selectAll.tagName === 'BUTTON') selectAll.setAttribute('type', 'button');
        var selectAllInput = selectAll.querySelector('input[type="checkbox"]');

        function setRowChecked(row, checked) {
          var input = row.querySelector('input[type="checkbox"]');
          if (input) {
            if (input.checked !== checked) {
              input.checked = checked;
              input.dispatchEvent(new Event('change', { bubbles: true }));
            }
          }
          row.classList.toggle('brut-cb--on', checked);
          row.setAttribute('aria-checked', checked ? 'true' : 'false');
        }

        function applyAll(checked) {
          var rows = el.querySelectorAll('[data-brut-row-select]');
          for (var j = 0; j < rows.length; j++) setRowChecked(rows[j], checked);
        }

        function isOn() {
          if (selectAllInput) return selectAllInput.checked;
          return selectAll.classList.contains('brut-cb--on');
        }

        function syncHeader(on) {
          if (selectAllInput) selectAllInput.checked = on;
          selectAll.classList.toggle('brut-cb--on', on);
          selectAll.setAttribute('aria-checked', on ? 'true' : 'false');
        }

        selectAll.addEventListener('click', function (e) {
          if (e.target === selectAllInput) return;
          var next = !isOn();
          syncHeader(next);
          applyAll(next);
          el.dispatchEvent(new CustomEvent('brut:change', {
            detail: { selectAll: next }
          }));
        });
        selectAll.addEventListener('keydown', function (e) {
          if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); selectAll.click(); }
        });

        if (!selectAll.hasAttribute('role'))     selectAll.setAttribute('role', 'checkbox');
        if (!selectAll.hasAttribute('tabindex')) selectAll.setAttribute('tabindex', '0');
        syncHeader(isOn());
      }
    }
  });
})();


/* --- tabs.js --- */
/* tabs — show/hide panels matched by data-brut-tab / data-brut-panel.
   Markup:
     <div class="brut-tabs" data-brut="tabs">
       <button class="brut-tab brut-tab--on" data-brut-tab="overview">OVERVIEW</button>
       <button class="brut-tab" data-brut-tab="logs">LOGS</button>
     </div>
     <div data-brut-panel="overview">…</div>
     <div data-brut-panel="logs" hidden>…</div>
   By default panels are looked up in the tablist's parent. Pass a
   selector via data-brut-panels="#some-root" to scope elsewhere.

   Keyboard (WAI-ARIA tabs pattern, roving tabindex):
     ArrowLeft / ArrowRight  — focus & activate prev / next (wrap)
     Home / End              — focus & activate first / last */
(function () {
  if (!window.Brut) return;
  Brut.register('tabs', {
    selector: '[data-brut="tabs"]',
    init: function (el) {
      var rootSel = el.getAttribute('data-brut-panels');
      var panelRoot = rootSel ? document.querySelector(rootSel) : el.parentElement;
      var panels = {};
      if (panelRoot) {
        panelRoot.querySelectorAll('[data-brut-panel]').forEach(function (p) {
          panels[p.getAttribute('data-brut-panel')] = p;
        });
      }

      el.setAttribute('role', 'tablist');

      function tabs() {
        return Array.prototype.slice.call(el.querySelectorAll('.brut-tab'));
      }

      function activate(btn, focusIt) {
        var all = tabs();
        all.forEach(function (b) {
          var on = b === btn;
          b.classList.toggle('brut-tab--on', on);
          b.setAttribute('aria-selected', on ? 'true' : 'false');
          b.setAttribute('tabindex', on ? '0' : '-1');
        });
        var key = btn.getAttribute('data-brut-tab');
        Object.keys(panels).forEach(function (k) { panels[k].hidden = k !== key; });
        if (focusIt) btn.focus();
        el.dispatchEvent(new CustomEvent('brut:change', { detail: { value: key } }));
      }

      tabs().forEach(function (btn) {
        btn.setAttribute('type', 'button');
        btn.setAttribute('role', 'tab');
        btn.addEventListener('click', function () { activate(btn); });
      });

      el.addEventListener('keydown', function (e) {
        var t = e.target;
        if (!t || !t.classList || !t.classList.contains('brut-tab')) return;
        var all = tabs();
        var i = all.indexOf(t);
        if (i < 0) return;
        var next = null;
        switch (e.key) {
          case 'ArrowLeft':  next = all[(i - 1 + all.length) % all.length]; break;
          case 'ArrowRight': next = all[(i + 1) % all.length]; break;
          case 'Home':       next = all[0]; break;
          case 'End':        next = all[all.length - 1]; break;
          default: return;
        }
        e.preventDefault();
        activate(next, true);
      });

      var initial = el.querySelector('.brut-tab--on') || el.querySelector('.brut-tab');
      if (initial) activate(initial);
    }
  });
})();


/* --- tag-input.js --- */
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
        hidden.value = values().join(',');
        el.dispatchEvent(new CustomEvent('brut:change', { detail: { tags: values() } }));
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


/* --- time.js --- */
/* time — text field + popover hour/minute steppers.
   Markup:
     <div class="brut-time" data-brut="time" data-brut-name="meet" data-brut-mode="24">
       <input class="brut-input brut-time__field" type="text" readonly placeholder="HH:MM" />
       <input type="hidden" />
     </div>
   data-brut-mode="24" (default) | "12". Output is always HH:MM (24h ISO)
   in both visible field and hidden mirror. Dispatches brut:change. */
(function () {
  if (!window.Brut) return;

  function pad2(n) { return n < 10 ? '0' + n : '' + n; }
  function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }

  Brut.register('time', {
    selector: '[data-brut="time"]',
    init: function (el) {
      var field = el.querySelector('.brut-time__field') || el.querySelector('input[type="text"], input[type="time"], input:not([type])');
      if (!field) return;

      var hidden = el.querySelector('input[type="hidden"]');
      if (!hidden && el.getAttribute('data-brut-name')) {
        hidden = document.createElement('input');
        hidden.type = 'hidden';
        hidden.name = el.getAttribute('data-brut-name');
        el.appendChild(hidden);
      }

      var mode = el.getAttribute('data-brut-mode') === '12' ? 12 : 24;
      var minStep = parseInt(el.getAttribute('data-brut-minute-step'), 10) || 1;

      // State (always stored as 0-23 / 0-59)
      var hour = 9, minute = 0;
      var initial = (field.value || (hidden && hidden.value) || '').match(/^(\d{1,2}):(\d{2})$/);
      if (initial) {
        hour = clamp(parseInt(initial[1], 10), 0, 23);
        minute = clamp(parseInt(initial[2], 10), 0, 59);
      }

      // Build popover scaffolding
      var pop = el.querySelector('.brut-time__pop');
      if (!pop) {
        pop = document.createElement('div');
        pop.className = 'brut-time__pop';
        el.appendChild(pop);
      }
      pop.innerHTML = '';

      var row = document.createElement('div');
      row.className = 'brut-time__row';
      pop.appendChild(row);

      function getHourDisplay() {
        if (mode === 24) return hour;
        var h = hour % 12;
        return h === 0 ? 12 : h;
      }
      function setHourFromDisplay(v) {
        if (mode === 24) {
          hour = ((v % 24) + 24) % 24;
        } else {
          var pm = hour >= 12;
          var d = ((v - 1) % 12 + 12) % 12 + 1; // 1..12
          var h24 = (d % 12) + (pm ? 12 : 0);
          hour = h24;
        }
      }
      function getMinute() { return minute; }
      function setMinute(v) {
        var step = minStep;
        if (step <= 1) {
          minute = ((v % 60) + 60) % 60;
        } else {
          var n = ((Math.round(v / step) * step) % 60 + 60) % 60;
          minute = n;
        }
      }

      function buildCol(label, getter, setter) {
        var col = document.createElement('div');
        col.className = 'brut-time__col';

        var lbl = document.createElement('span');
        lbl.className = 'brut-time__col-label';
        lbl.textContent = label;
        col.appendChild(lbl);

        var stepper = document.createElement('div');
        stepper.className = 'brut-stepper';

        var down = document.createElement('button');
        down.className = 'brut-stepper__btn';
        down.setAttribute('type', 'button');
        down.setAttribute('aria-label', label + ' down');
        down.textContent = '−';

        var input = document.createElement('input');
        input.className = 'brut-stepper__input';
        input.type = 'text';
        input.setAttribute('inputmode', 'numeric');
        input.setAttribute('aria-label', label);

        var up = document.createElement('button');
        up.className = 'brut-stepper__btn';
        up.setAttribute('type', 'button');
        up.setAttribute('aria-label', label + ' up');
        up.textContent = '+';

        stepper.appendChild(down);
        stepper.appendChild(input);
        stepper.appendChild(up);
        col.appendChild(stepper);

        function refresh() { input.value = pad2(getter()); }

        down.addEventListener('click', function () { setter(getter() - 1); refresh(); sync(); });
        up.addEventListener('click',   function () { setter(getter() + 1); refresh(); sync(); });
        input.addEventListener('change', function () {
          var n = parseInt(input.value, 10);
          if (!isNaN(n)) setter(n);
          refresh();
          sync();
        });
        input.addEventListener('keydown', function (e) {
          if (e.key === 'ArrowUp')   { e.preventDefault(); setter(getter() + 1); refresh(); sync(); }
          if (e.key === 'ArrowDown') { e.preventDefault(); setter(getter() - 1); refresh(); sync(); }
        });

        return { node: col, refresh: refresh, input: input };
      }

      var hourCtrl = buildCol('HOUR', getHourDisplay, setHourFromDisplay);
      row.appendChild(hourCtrl.node);

      var sepEl = document.createElement('span');
      sepEl.className = 'brut-time__sep';
      sepEl.textContent = ':';
      row.appendChild(sepEl);

      var minuteCtrl = buildCol('MIN', getMinute, setMinute);
      row.appendChild(minuteCtrl.node);

      // 12/24 — when 12-hour, show AM/PM segmented under the row.
      var amBtn = null, pmBtn = null;
      if (mode === 12) {
        var meridSeg = document.createElement('div');
        meridSeg.className = 'brut-seg brut-time__meridian';
        amBtn = document.createElement('button');
        amBtn.className = 'brut-seg__btn';
        amBtn.setAttribute('type', 'button');
        amBtn.textContent = 'AM';
        pmBtn = document.createElement('button');
        pmBtn.className = 'brut-seg__btn';
        pmBtn.setAttribute('type', 'button');
        pmBtn.textContent = 'PM';
        meridSeg.appendChild(amBtn);
        meridSeg.appendChild(pmBtn);
        pop.appendChild(meridSeg);

        function setMerid(pm) {
          if (pm && hour < 12) hour += 12;
          if (!pm && hour >= 12) hour -= 12;
          amBtn.classList.toggle('brut-seg__btn--on', !pm);
          pmBtn.classList.toggle('brut-seg__btn--on',  pm);
          hourCtrl.refresh();
          sync();
        }
        amBtn.addEventListener('click', function () { setMerid(false); });
        pmBtn.addEventListener('click', function () { setMerid(true);  });

        amBtn.classList.toggle('brut-seg__btn--on', hour < 12);
        pmBtn.classList.toggle('brut-seg__btn--on', hour >= 12);
      }

      function fmt() { return pad2(hour) + ':' + pad2(minute); }

      function sync() {
        var s = fmt();
        field.value = s;
        if (hidden) hidden.value = s;
        el.dispatchEvent(new CustomEvent('brut:change', { detail: { value: s, hour: hour, minute: minute } }));
      }

      function open() {
        if (el.classList.contains('brut-time--open')) return;
        var m = (field.value || '').match(/^(\d{1,2}):(\d{2})$/);
        if (m) {
          hour = clamp(parseInt(m[1], 10), 0, 23);
          minute = clamp(parseInt(m[2], 10), 0, 59);
        }
        hourCtrl.refresh();
        minuteCtrl.refresh();
        if (amBtn && pmBtn) {
          amBtn.classList.toggle('brut-seg__btn--on', hour < 12);
          pmBtn.classList.toggle('brut-seg__btn--on', hour >= 12);
        }
        el.classList.add('brut-time--open');
        field.setAttribute('aria-expanded', 'true');
      }
      function close() {
        el.classList.remove('brut-time--open');
        field.setAttribute('aria-expanded', 'false');
      }

      field.setAttribute('role', 'combobox');
      field.setAttribute('aria-haspopup', 'dialog');
      field.setAttribute('aria-expanded', 'false');
      if (!field.getAttribute('placeholder')) field.setAttribute('placeholder', 'HH:MM');

      field.addEventListener('focus', open);
      field.addEventListener('click', open);
      field.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') close();
        else if (e.key === 'ArrowDown' || e.key === 'Enter') { e.preventDefault(); open(); }
      });

      document.addEventListener('mousedown', function (e) {
        if (!el.contains(e.target)) close();
      });

      // Initial paint
      hourCtrl.refresh();
      minuteCtrl.refresh();
      if (!field.value) field.value = fmt();
      if (hidden && !hidden.value) hidden.value = fmt();
    }
  });
})();


/* --- toast-host.js --- */
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


/* --- tooltip.js --- */
/* tooltip — flat ink bubble shown on hover/focus of a trigger.
   Markup:
     <button class="brut-btn" data-brut="tooltip"
             data-brut-tip="Saved at 12:04"
             data-brut-tip-side="top">SAVE</button>
   The bubble is a separate <div class="brut-tip"> appended to <body>
   on show and removed on hide. Side is top|bottom|left|right (top default).
   Esc removes any visible tip; aria-describedby links trigger to bubble id. */
(function () {
  if (!window.Brut) return;

  var tipSeq = 0;

  function position(tip, trigger, side) {
    var r = trigger.getBoundingClientRect();
    var sx = window.pageXOffset || document.documentElement.scrollLeft;
    var sy = window.pageYOffset || document.documentElement.scrollTop;
    var tw = tip.offsetWidth;
    var th = tip.offsetHeight;
    var gap = 8;
    var top = 0, left = 0;
    switch (side) {
      case 'bottom':
        top  = r.bottom + sy + gap;
        left = r.left   + sx + (r.width  - tw) / 2;
        break;
      case 'left':
        top  = r.top    + sy + (r.height - th) / 2;
        left = r.left   + sx - tw - gap;
        break;
      case 'right':
        top  = r.top    + sy + (r.height - th) / 2;
        left = r.right  + sx + gap;
        break;
      case 'top':
      default:
        top  = r.top    + sy - th - gap;
        left = r.left   + sx + (r.width  - tw) / 2;
        break;
    }
    tip.style.top  = Math.round(top)  + 'px';
    tip.style.left = Math.round(left) + 'px';
  }

  Brut.register('tooltip', {
    selector: '[data-brut="tooltip"]',
    init: function (el) {
      if (el.tagName === 'BUTTON') el.setAttribute('type', 'button');

      var tip = null;

      function show() {
        if (tip) return;
        var text = el.getAttribute('data-brut-tip') || '';
        if (!text) return;
        var side = el.getAttribute('data-brut-tip-side') || 'top';
        tip = document.createElement('div');
        tip.className = 'brut-tip brut-tip--' + side;
        tip.setAttribute('role', 'tooltip');
        tip.id = 'brut-tip-' + (++tipSeq);
        tip.textContent = text;
        document.body.appendChild(tip);
        el.setAttribute('aria-describedby', tip.id);
        position(tip, el, side);
      }
      function hide() {
        if (!tip) return;
        if (tip.parentNode) tip.parentNode.removeChild(tip);
        el.removeAttribute('aria-describedby');
        tip = null;
      }

      el.addEventListener('mouseenter', show);
      el.addEventListener('mouseleave', hide);
      el.addEventListener('focus', show);
      el.addEventListener('blur', hide);

      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') hide();
      });
    }
  });
})();


/* --- topnav.js --- */
/* topnav — sticky page header. Only JS is the mobile burger toggle.
   Markup:
     <header class="brut-topnav" data-brut="topnav">
       <div class="brut-topnav__inner">
         <a class="brut-topnav__brand" href="/"> … </a>
         <nav class="brut-topnav__links"> … </nav>
         <a class="brut-btn brut-btn--primary brut-btn--sm brut-topnav__cta" href="…">CTA</a>
         <button class="brut-topnav__burger" aria-label="Menu">≡</button>
       </div>
     </header>
   Burger toggles `.brut-topnav--open`. Click outside / Esc closes.
*/
(function () {
  if (!window.Brut) return;
  Brut.register('topnav', {
    selector: '[data-brut="topnav"]',
    init: function (el) {
      var burger = el.querySelector('.brut-topnav__burger');
      if (!burger) return;

      if (burger.tagName === 'BUTTON') burger.setAttribute('type', 'button');
      if (!burger.hasAttribute('aria-expanded')) burger.setAttribute('aria-expanded', 'false');
      if (!burger.hasAttribute('aria-label'))    burger.setAttribute('aria-label', 'Toggle menu');

      function isOpen() { return el.classList.contains('brut-topnav--open'); }
      function setOpen(open) {
        el.classList.toggle('brut-topnav--open', open);
        burger.setAttribute('aria-expanded', open ? 'true' : 'false');
        el.dispatchEvent(new CustomEvent(open ? 'brut:open' : 'brut:close'));
      }

      burger.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        setOpen(!isOpen());
      });

      document.addEventListener('click', function (e) {
        if (!isOpen()) return;
        if (el.contains(e.target)) return;
        setOpen(false);
      });

      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && isOpen()) setOpen(false);
      });

      // Close menu when a link is clicked (mobile UX).
      el.querySelectorAll('.brut-topnav__link').forEach(function (a) {
        a.addEventListener('click', function () {
          if (isOpen()) setOpen(false);
        });
      });
    }
  });
})();

