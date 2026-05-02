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
