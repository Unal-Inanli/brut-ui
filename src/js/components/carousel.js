/* carousel — single-track carousel with prev/next, dots, keyboard,
   autoplay (pause-on-hover/focus/visibility), infinite loop, and
   pointer-driven swipe.

   Markup:
     <div class="brut-carousel" data-brut="carousel"
          data-current="0" data-autoplay="5000" data-loop>
       <div class="brut-carousel__viewport">
         <div class="brut-carousel__track">
           <div class="brut-carousel__slide"> … </div>
           <div class="brut-carousel__slide"> … </div>
           <div class="brut-carousel__slide"> … </div>
         </div>
       </div>
       <div class="brut-carousel__nav">
         <button class="brut-carousel__btn brut-carousel__btn--prev"
                 aria-label="Previous slide">‹</button>
         <button class="brut-carousel__btn brut-carousel__btn--next"
                 aria-label="Next slide">›</button>
       </div>
       <div class="brut-carousel__dots" role="tablist"></div>
     </div>

   data-current  initial slide index (default 0)
   data-autoplay milliseconds between auto-advances (absent or 0 = off)
   data-loop     boolean attr; when present, prev/next wrap

   Dispatches `brut:change` with detail.value = active index. */
(function () {
  if (!window.Brut) return;
  Brut.register('carousel', {
    selector: '[data-brut="carousel"]',
    init: function (el) {
      var viewport = el.querySelector('.brut-carousel__viewport');
      var track    = el.querySelector('.brut-carousel__track');
      var dotsBox  = el.querySelector('.brut-carousel__dots');
      var prevBtn  = el.querySelector('.brut-carousel__btn--prev');
      var nextBtn  = el.querySelector('.brut-carousel__btn--next');
      if (!viewport || !track) return;

      var slides = Array.prototype.slice.call(
        track.querySelectorAll('.brut-carousel__slide')
      );
      if (slides.length === 0) return;

      var loop      = el.hasAttribute('data-loop');
      var autoplay  = parseInt(el.getAttribute('data-autoplay'), 10) || 0;
      var current   = parseInt(el.getAttribute('data-current'), 10) || 0;
      if (current < 0) current = 0;
      if (current >= slides.length) current = slides.length - 1;

      // a11y wiring on the root.
      if (!el.hasAttribute('role'))                 el.setAttribute('role', 'region');
      if (!el.hasAttribute('aria-roledescription')) el.setAttribute('aria-roledescription', 'carousel');
      if (!el.hasAttribute('tabindex'))             el.setAttribute('tabindex', '0');

      // Visually-hidden live region announces only the position
      // ("Slide N of M") on change — never the slide content itself.
      // Skip if the consumer already wired aria-live on the root.
      var status = null;
      if (!el.hasAttribute('aria-live')) {
        status = document.createElement('span');
        status.className = 'brut-carousel__status';
        status.setAttribute('aria-live', 'polite');
        status.setAttribute('aria-atomic', 'true');
        status.style.cssText = 'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;';
        el.appendChild(status);
      }

      // Wired buttons must be type="button".
      if (prevBtn && prevBtn.tagName === 'BUTTON') prevBtn.setAttribute('type', 'button');
      if (nextBtn && nextBtn.tagName === 'BUTTON') nextBtn.setAttribute('type', 'button');

      // Build dots — one per slide.
      var dots = [];
      if (dotsBox) {
        dotsBox.innerHTML = '';
        if (!dotsBox.hasAttribute('role')) dotsBox.setAttribute('role', 'tablist');
        for (var i = 0; i < slides.length; i++) {
          var dot = document.createElement('button');
          dot.setAttribute('type', 'button');
          dot.setAttribute('role', 'tab');
          dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
          dot.className = 'brut-carousel__dot';
          dot.setAttribute('data-index', String(i));
          dotsBox.appendChild(dot);
          dots.push(dot);
        }
      }

      function isRTL() {
        return (document.dir || document.documentElement.dir) === 'rtl';
      }

      function applyTransform(offsetPx) {
        // CSS owns the transition timing; JS only sets the transform.
        var w = viewport.clientWidth;
        var x = -current * w + (offsetPx || 0);
        track.style.transform = 'translateX(' + x + 'px)';
      }

      function updateUI() {
        for (var i = 0; i < dots.length; i++) {
          if (i === current) {
            dots[i].setAttribute('aria-current', 'true');
            dots[i].classList.add('brut-carousel__dot--on');
          } else {
            dots[i].removeAttribute('aria-current');
            dots[i].classList.remove('brut-carousel__dot--on');
          }
        }
        if (!loop) {
          if (prevBtn) prevBtn.disabled = current <= 0;
          if (nextBtn) nextBtn.disabled = current >= slides.length - 1;
        } else {
          if (prevBtn) prevBtn.disabled = false;
          if (nextBtn) nextBtn.disabled = false;
        }
        el.setAttribute('data-current', String(current));
      }

      function goTo(index) {
        var last = slides.length - 1;
        if (loop) {
          if (index < 0)    index = last;
          if (index > last) index = 0;
        } else {
          if (index < 0)    index = 0;
          if (index > last) index = last;
        }
        if (index === current) {
          applyTransform(0);
          updateUI();
          return;
        }
        current = index;
        applyTransform(0);
        updateUI();
        if (status) status.textContent = 'Slide ' + (current + 1) + ' of ' + slides.length;
        el.dispatchEvent(new CustomEvent('brut:change', { detail: { value: current } }));
      }

      function next() { goTo(current + 1); }
      function prev() { goTo(current - 1); }

      // Click handlers.
      if (prevBtn) {
        prevBtn.addEventListener('click', function onPrevClick(e) {
          e.preventDefault();
          prev();
        });
      }
      if (nextBtn) {
        nextBtn.addEventListener('click', function onNextClick(e) {
          e.preventDefault();
          next();
        });
      }
      if (dotsBox) {
        dotsBox.addEventListener('click', function onDotClick(e) {
          var t = e.target;
          if (!t || !t.classList || !t.classList.contains('brut-carousel__dot')) return;
          var idx = parseInt(t.getAttribute('data-index'), 10);
          if (!isNaN(idx)) goTo(idx);
        });
      }

      // Keyboard on root.
      el.addEventListener('keydown', function onKeydown(e) {
        switch (e.key) {
          case 'ArrowRight':
            e.preventDefault();
            if (isRTL()) prev(); else next();
            break;
          case 'ArrowLeft':
            e.preventDefault();
            if (isRTL()) next(); else prev();
            break;
          case 'Home':
            e.preventDefault();
            goTo(0);
            break;
          case 'End':
            e.preventDefault();
            goTo(slides.length - 1);
            break;
          default: return;
        }
      });

      // -- Autoplay ----------------------------------------------------------
      var timer = null;
      var paused = false;
      var reduced = false;
      try {
        reduced = window.matchMedia &&
          window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      } catch (e) { reduced = false; }

      function startAuto() {
        if (!autoplay || autoplay <= 0) return;
        if (reduced) return;
        if (paused) return;
        stopAuto();
        timer = setInterval(function onTick() { next(); }, autoplay);
      }
      function stopAuto() {
        if (timer) { clearInterval(timer); timer = null; }
      }
      function pauseAuto()  { paused = true;  stopAuto(); }
      function resumeAuto() { paused = false; startAuto(); }

      if (autoplay > 0 && !reduced) {
        el.addEventListener('mouseenter', pauseAuto);
        el.addEventListener('mouseleave', resumeAuto);
        el.addEventListener('focusin',  pauseAuto);
        el.addEventListener('focusout', resumeAuto);
        document.addEventListener('visibilitychange', function onVis() {
          if (document.hidden) pauseAuto(); else resumeAuto();
        });
      }

      // -- Pointer / swipe ---------------------------------------------------
      var dragging = false;
      var startX = 0;
      var startT = 0;
      var deltaX = 0;
      var activePointerId = null;
      var prevUserSelect = '';
      var SWIPE_RATIO = 0.30;     // 30% of viewport width
      var VELOCITY_THRESH = 0.5;  // px per ms

      function onPointerDown(e) {
        // Only primary button for mouse.
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        dragging = true;
        activePointerId = e.pointerId;
        startX = e.clientX;
        startT = (typeof performance !== 'undefined' && performance.now)
          ? performance.now() : Date.now();
        deltaX = 0;
        prevUserSelect = track.style.userSelect || '';
        track.style.userSelect = 'none';
        try { viewport.setPointerCapture(e.pointerId); } catch (err) { /* noop */ }
        pauseAuto();
      }

      function onPointerMove(e) {
        if (!dragging || e.pointerId !== activePointerId) return;
        deltaX = e.clientX - startX;
        applyTransform(deltaX);
      }

      function endDrag(e) {
        if (!dragging) return;
        if (e && e.pointerId !== activePointerId && e.pointerId !== undefined) return;
        dragging = false;
        var w = viewport.clientWidth || 1;
        var now = (typeof performance !== 'undefined' && performance.now)
          ? performance.now() : Date.now();
        var dt = Math.max(1, now - startT);
        var velocity = Math.abs(deltaX) / dt;
        var ratio = Math.abs(deltaX) / w;

        try { viewport.releasePointerCapture(activePointerId); } catch (err) { /* noop */ }
        track.style.userSelect = prevUserSelect;
        activePointerId = null;

        if (ratio > SWIPE_RATIO || velocity > VELOCITY_THRESH) {
          if (deltaX < 0) next(); else prev();
        } else {
          // snap back to current
          applyTransform(0);
        }
        deltaX = 0;
        // Resume only if not paused by hover/focus state.
        if (!el.matches(':hover') && !el.contains(document.activeElement)) {
          resumeAuto();
        }
      }

      viewport.addEventListener('pointerdown', onPointerDown);
      viewport.addEventListener('pointermove', onPointerMove);
      viewport.addEventListener('pointerup', endDrag);
      viewport.addEventListener('pointercancel', endDrag);

      // Re-position on resize so translateX matches new viewport width.
      window.addEventListener('resize', function onResize() {
        if (!dragging) applyTransform(0);
      });

      // Initial paint.
      updateUI();
      applyTransform(0);
      startAuto();
    }
  });
})();
