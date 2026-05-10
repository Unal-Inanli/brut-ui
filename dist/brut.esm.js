//#region src/js/core.js
(function(global) {
	"use strict";
	var registered = [];
	var INIT_FLAG = "__brutInit";
	function register(name, opts) {
		if (!name || !opts || !opts.selector || typeof opts.init !== "function") throw new Error("[brut] register(name, { selector, init }) — bad args for " + name);
		registered.push({
			name,
			selector: opts.selector,
			init: opts.init
		});
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
					if (global.console && console.error) console.error("[brut] " + c.name + " init failed:", e, el);
				}
			}
		}
	}
	function ready(fn) {
		if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn, { once: true });
		else fn();
	}
	var THEME_KEY = "brut-theme";
	var DEFAULT_THEME = "brutalist";
	function theme(name) {
		if (typeof name === "string") {
			document.documentElement.setAttribute("data-theme", name);
			try {
				localStorage.setItem(THEME_KEY, name);
			} catch (e) {}
			return name;
		}
		return document.documentElement.getAttribute("data-theme") || DEFAULT_THEME;
	}
	function restoreTheme() {
		try {
			var saved = localStorage.getItem(THEME_KEY);
			if (saved) document.documentElement.setAttribute("data-theme", saved);
		} catch (e) {}
	}
	var Brut = global.Brut = global.Brut || {};
	Brut.register = register;
	Brut.init = init;
	Brut.ready = ready;
	Brut.theme = theme;
	Brut._components = registered;
	Brut.version = "1.3.2";
	Brut.scrollLock = (function() {
		var count = 0;
		var prevOverflow = "";
		return {
			acquire: function() {
				if (count === 0) {
					prevOverflow = document.body.style.overflow;
					document.body.style.overflow = "hidden";
				}
				count++;
			},
			release: function() {
				if (count === 0) return;
				count--;
				if (count === 0) document.body.style.overflow = prevOverflow;
			}
		};
	})();
	Brut.focusTrap = (function() {
		var FOCUSABLE = "button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex=\"-1\"]), [contenteditable]";
		function focusables(root) {
			return Array.prototype.slice.call(root.querySelectorAll(FOCUSABLE)).filter(function(n) {
				return n.offsetParent !== null || n === document.activeElement;
			});
		}
		return { activate: function(root) {
			var prev = document.activeElement;
			var addedTabindex = false;
			if (!root.hasAttribute("tabindex")) {
				root.setAttribute("tabindex", "-1");
				addedTabindex = true;
			}
			(focusables(root)[0] || root).focus();
			function onKey(e) {
				if (e.key !== "Tab") return;
				var current = focusables(root);
				if (!current.length) {
					e.preventDefault();
					root.focus();
					return;
				}
				var first = current[0], last = current[current.length - 1];
				if (e.shiftKey && document.activeElement === first) {
					e.preventDefault();
					last.focus();
				} else if (!e.shiftKey && document.activeElement === last) {
					e.preventDefault();
					first.focus();
				}
			}
			root.addEventListener("keydown", onKey);
			return { release: function() {
				root.removeEventListener("keydown", onKey);
				if (addedTabindex) root.removeAttribute("tabindex");
				if (prev && typeof prev.focus === "function") prev.focus();
			} };
		} };
	})();
	Brut.flipSide = function(trigger, bubble, preferredSide, gap) {
		if (!trigger || !bubble) return preferredSide;
		gap = gap || 8;
		var r = trigger.getBoundingClientRect();
		var bH = bubble.offsetHeight;
		var bW = bubble.offsetWidth;
		var side = preferredSide;
		if (side === "top" && r.top < bH + gap) side = "bottom";
		if (side === "bottom" && window.innerHeight - r.bottom < bH + gap) side = "top";
		if (side === "left" && r.left < bW + gap) side = "right";
		if (side === "right" && window.innerWidth - r.right < bW + gap) side = "left";
		return side;
	};
	restoreTheme();
	ready(function() {
		setTimeout(function() {
			init(document);
		}, 0);
	});
})(typeof window !== "undefined" ? window : void 0);
//#endregion
//#region src/js/components/accordion.js
(function() {
	if (!window.Brut) return;
	var headIdCounter = 0;
	var bodyIdCounter = 0;
	Brut.register("accordion", {
		selector: "[data-brut=\"accordion\"]",
		init: function(el) {
			var allowMulti = el.hasAttribute("data-brut-allow-multi");
			var items = el.querySelectorAll(".brut-accordion__item");
			if (!items.length) return;
			var heads = [];
			items.forEach(function(item) {
				var head = item.querySelector(".brut-accordion__head");
				var body = item.querySelector(".brut-accordion__body");
				if (!head) return;
				if (head.tagName === "BUTTON") head.setAttribute("type", "button");
				if (!head.hasAttribute("tabindex") && head.tagName !== "BUTTON") head.setAttribute("tabindex", "0");
				if (!head.id) head.id = "brut-accordion-" + ++headIdCounter;
				var isOpen = item.classList.contains("brut-accordion__item--open");
				head.setAttribute("aria-expanded", isOpen ? "true" : "false");
				if (body && !body.id) body.id = "brut-acc-body-" + ++bodyIdCounter;
				if (body) {
					head.setAttribute("aria-controls", body.id);
					if (!body.hasAttribute("role")) body.setAttribute("role", "region");
					if (!body.hasAttribute("aria-labelledby")) body.setAttribute("aria-labelledby", head.id);
				}
				heads.push({
					item,
					head,
					body
				});
			});
			function setOpen(record, open) {
				record.item.classList.toggle("brut-accordion__item--open", open);
				record.head.setAttribute("aria-expanded", open ? "true" : "false");
				record.item.dispatchEvent(new CustomEvent("brut:change", {
					bubbles: true,
					detail: {
						value: open,
						open
					}
				}));
				record.item.dispatchEvent(new CustomEvent(open ? "brut:open" : "brut:close", {
					bubbles: true,
					detail: { value: open }
				}));
			}
			function toggle(record) {
				var open = !record.item.classList.contains("brut-accordion__item--open");
				if (open && !allowMulti) heads.forEach(function(other) {
					if (other !== record && other.item.classList.contains("brut-accordion__item--open")) setOpen(other, false);
				});
				setOpen(record, open);
			}
			heads.forEach(function(record) {
				record.head.addEventListener("click", function(e) {
					e.preventDefault();
					toggle(record);
				});
				record.head.addEventListener("keydown", function(e) {
					if (e.key === " " || e.key === "Enter") {
						e.preventDefault();
						toggle(record);
					}
				});
			});
		}
	});
})();
//#endregion
//#region src/js/components/carousel.js
(function() {
	if (!window.Brut) return;
	Brut.register("carousel", {
		selector: "[data-brut=\"carousel\"]",
		init: function(el) {
			var viewport = el.querySelector(".brut-carousel__viewport");
			var track = el.querySelector(".brut-carousel__track");
			var dotsBox = el.querySelector(".brut-carousel__dots");
			var prevBtn = el.querySelector(".brut-carousel__btn--prev");
			var nextBtn = el.querySelector(".brut-carousel__btn--next");
			if (!viewport || !track) return;
			var slides = Array.prototype.slice.call(track.querySelectorAll(".brut-carousel__slide"));
			if (slides.length === 0) return;
			var loop = el.hasAttribute("data-loop");
			var autoplay = parseInt(el.getAttribute("data-autoplay"), 10) || 0;
			var current = parseInt(el.getAttribute("data-current"), 10) || 0;
			if (current < 0) current = 0;
			if (current >= slides.length) current = slides.length - 1;
			if (!el.hasAttribute("role")) el.setAttribute("role", "region");
			if (!el.hasAttribute("aria-roledescription")) el.setAttribute("aria-roledescription", "carousel");
			if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "0");
			var status = null;
			if (!el.hasAttribute("aria-live")) {
				status = document.createElement("span");
				status.className = "brut-carousel__status";
				status.setAttribute("aria-live", "polite");
				status.setAttribute("aria-atomic", "true");
				status.style.cssText = "position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;";
				el.appendChild(status);
			}
			if (prevBtn && prevBtn.tagName === "BUTTON") prevBtn.setAttribute("type", "button");
			if (nextBtn && nextBtn.tagName === "BUTTON") nextBtn.setAttribute("type", "button");
			var dots = [];
			if (dotsBox) {
				dotsBox.innerHTML = "";
				if (!dotsBox.hasAttribute("role")) dotsBox.setAttribute("role", "tablist");
				for (var i = 0; i < slides.length; i++) {
					var dot = document.createElement("button");
					dot.setAttribute("type", "button");
					dot.setAttribute("role", "tab");
					dot.setAttribute("aria-label", "Go to slide " + (i + 1));
					dot.className = "brut-carousel__dot";
					dot.setAttribute("data-index", String(i));
					dotsBox.appendChild(dot);
					dots.push(dot);
				}
			}
			function isRTL() {
				return (document.dir || document.documentElement.dir) === "rtl";
			}
			function applyTransform(offsetPx) {
				var w = viewport.clientWidth;
				var x = -current * w + (offsetPx || 0);
				track.style.transform = "translateX(" + x + "px)";
			}
			function updateUI() {
				for (var i = 0; i < dots.length; i++) if (i === current) {
					dots[i].setAttribute("aria-current", "true");
					dots[i].classList.add("brut-carousel__dot--on");
				} else {
					dots[i].removeAttribute("aria-current");
					dots[i].classList.remove("brut-carousel__dot--on");
				}
				if (!loop) {
					if (prevBtn) prevBtn.disabled = current <= 0;
					if (nextBtn) nextBtn.disabled = current >= slides.length - 1;
				} else {
					if (prevBtn) prevBtn.disabled = false;
					if (nextBtn) nextBtn.disabled = false;
				}
				el.setAttribute("data-current", String(current));
			}
			function goTo(index) {
				var last = slides.length - 1;
				if (loop) {
					if (index < 0) index = last;
					if (index > last) index = 0;
				} else {
					if (index < 0) index = 0;
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
				if (status) status.textContent = "Slide " + (current + 1) + " of " + slides.length;
				el.dispatchEvent(new CustomEvent("brut:change", { detail: { value: current } }));
			}
			function next() {
				goTo(current + 1);
			}
			function prev() {
				goTo(current - 1);
			}
			if (prevBtn) prevBtn.addEventListener("click", function onPrevClick(e) {
				e.preventDefault();
				prev();
			});
			if (nextBtn) nextBtn.addEventListener("click", function onNextClick(e) {
				e.preventDefault();
				next();
			});
			if (dotsBox) dotsBox.addEventListener("click", function onDotClick(e) {
				var t = e.target;
				if (!t || !t.classList || !t.classList.contains("brut-carousel__dot")) return;
				var idx = parseInt(t.getAttribute("data-index"), 10);
				if (!isNaN(idx)) goTo(idx);
			});
			el.addEventListener("keydown", function onKeydown(e) {
				switch (e.key) {
					case "ArrowRight":
						e.preventDefault();
						if (isRTL()) prev();
						else next();
						break;
					case "ArrowLeft":
						e.preventDefault();
						if (isRTL()) next();
						else prev();
						break;
					case "Home":
						e.preventDefault();
						goTo(0);
						break;
					case "End":
						e.preventDefault();
						goTo(slides.length - 1);
						break;
					default: return;
				}
			});
			var timer = null;
			var paused = false;
			var userPaused = false;
			var reduced = false;
			try {
				reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
			} catch (e) {
				reduced = false;
			}
			function startAuto() {
				if (!autoplay || autoplay <= 0) return;
				if (reduced) return;
				if (paused) return;
				stopAuto();
				timer = setInterval(function onTick() {
					next();
				}, autoplay);
			}
			function stopAuto() {
				if (timer) {
					clearInterval(timer);
					timer = null;
				}
			}
			function pauseAuto() {
				paused = true;
				stopAuto();
			}
			function resumeAuto() {
				if (userPaused) return;
				paused = false;
				startAuto();
			}
			var pauseBtn = null;
			if (autoplay > 0 && !reduced) {
				pauseBtn = document.createElement("button");
				pauseBtn.type = "button";
				pauseBtn.className = "brut-carousel__pause";
				pauseBtn.setAttribute("aria-pressed", "false");
				pauseBtn.setAttribute("aria-label", "Pause carousel");
				pauseBtn.textContent = "⏸";
				pauseBtn.addEventListener("click", function onPauseClick() {
					if (pauseBtn.getAttribute("aria-pressed") === "true") {
						pauseBtn.setAttribute("aria-pressed", "false");
						pauseBtn.setAttribute("aria-label", "Pause carousel");
						pauseBtn.textContent = "⏸";
						userPaused = false;
						resumeAuto();
					} else {
						pauseBtn.setAttribute("aria-pressed", "true");
						pauseBtn.setAttribute("aria-label", "Resume carousel");
						pauseBtn.textContent = "▶";
						userPaused = true;
						pauseAuto();
					}
				});
				el.appendChild(pauseBtn);
			}
			if (autoplay > 0 && !reduced) {
				el.addEventListener("mouseenter", pauseAuto);
				el.addEventListener("mouseleave", resumeAuto);
				el.addEventListener("focusin", pauseAuto);
				el.addEventListener("focusout", resumeAuto);
				document.addEventListener("visibilitychange", function onVis() {
					if (document.hidden) pauseAuto();
					else resumeAuto();
				});
			}
			var dragging = false;
			var startX = 0;
			var startT = 0;
			var deltaX = 0;
			var activePointerId = null;
			var prevUserSelect = "";
			var SWIPE_RATIO = .3;
			var VELOCITY_THRESH = .5;
			function onPointerDown(e) {
				if (e.pointerType === "mouse" && e.button !== 0) return;
				dragging = true;
				activePointerId = e.pointerId;
				startX = e.clientX;
				startT = typeof performance !== "undefined" && performance.now ? performance.now() : Date.now();
				deltaX = 0;
				prevUserSelect = track.style.userSelect || "";
				track.style.userSelect = "none";
				try {
					viewport.setPointerCapture(e.pointerId);
				} catch (err) {}
				pauseAuto();
			}
			function onPointerMove(e) {
				if (!dragging || e.pointerId !== activePointerId) return;
				deltaX = e.clientX - startX;
				applyTransform(deltaX);
			}
			function endDrag(e) {
				if (!dragging) return;
				if (e && e.pointerId !== activePointerId && e.pointerId !== void 0) return;
				dragging = false;
				var w = viewport.clientWidth || 1;
				var now = typeof performance !== "undefined" && performance.now ? performance.now() : Date.now();
				var dt = Math.max(1, now - startT);
				var velocity = Math.abs(deltaX) / dt;
				var ratio = Math.abs(deltaX) / w;
				try {
					viewport.releasePointerCapture(activePointerId);
				} catch (err) {}
				track.style.userSelect = prevUserSelect;
				activePointerId = null;
				if (ratio > SWIPE_RATIO || velocity > VELOCITY_THRESH) if (deltaX < 0) next();
				else prev();
				else applyTransform(0);
				deltaX = 0;
				if (!el.matches(":hover") && !el.contains(document.activeElement)) resumeAuto();
			}
			viewport.addEventListener("pointerdown", onPointerDown);
			viewport.addEventListener("pointermove", onPointerMove);
			viewport.addEventListener("pointerup", endDrag);
			viewport.addEventListener("pointercancel", endDrag);
			window.addEventListener("resize", function onResize() {
				if (!dragging) applyTransform(0);
			});
			updateUI();
			applyTransform(0);
			startAuto();
		}
	});
})();
//#endregion
//#region src/js/components/checkbox.js
(function() {
	if (!window.Brut) return;
	Brut.register("checkbox", {
		selector: "[data-brut=\"checkbox\"]",
		init: function(el) {
			var input = el.querySelector("input[type=\"checkbox\"]");
			function sync() {
				var on = input ? input.checked : el.classList.contains("brut-checkbox--on");
				el.classList.toggle("brut-checkbox--on", on);
				el.setAttribute("aria-checked", on ? "true" : "false");
			}
			if (!el.hasAttribute("role")) el.setAttribute("role", "checkbox");
			if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "0");
			function emit() {
				var on = el.classList.contains("brut-checkbox--on");
				el.dispatchEvent(new CustomEvent("brut:change", { detail: {
					value: on,
					checked: on
				} }));
			}
			el.addEventListener("click", function(e) {
				if (e.target === input) return;
				e.preventDefault();
				if (input) {
					input.checked = !input.checked;
					input.dispatchEvent(new Event("change", { bubbles: true }));
				} else {
					el.classList.toggle("brut-checkbox--on");
					sync();
					emit();
				}
			});
			el.addEventListener("keydown", function(e) {
				if (e.key === " " || e.key === "Enter") {
					e.preventDefault();
					el.click();
				}
			});
			if (input) input.addEventListener("change", function() {
				sync();
				emit();
			});
			var form = el.closest("form");
			if (form) form.addEventListener("reset", function() {
				if (!el.isConnected) return;
				setTimeout(sync, 0);
			});
			sync();
		}
	});
})();
//#endregion
//#region src/js/components/combobox.js
(function() {
	if (!window.Brut) return;
	var rootCounter = 0;
	Brut.register("combobox", {
		selector: "[data-brut=\"combobox\"]",
		init: function(el) {
			var input = el.querySelector("input[type=\"text\"], input[type=\"search\"], input:not([type])");
			var list = el.querySelector(".brut-combobox__list");
			if (!input || !list) return;
			var rootSeq = ++rootCounter;
			var hidden = el.querySelector("input[type=\"hidden\"]");
			if (!hidden && el.getAttribute("data-brut-name")) {
				hidden = document.createElement("input");
				hidden.type = "hidden";
				hidden.name = el.getAttribute("data-brut-name");
				el.appendChild(hidden);
			}
			var opts = Array.prototype.slice.call(list.querySelectorAll(".brut-combobox__opt"));
			var emptyEl = list.querySelector(".brut-combobox__empty");
			var activeIdx = -1;
			if (!list.id) list.id = "brut-combobox-" + rootSeq + "-list";
			opts.forEach(function(o, i) {
				if (!o.id) o.id = "brut-combobox-" + rootSeq + "-opt-" + i;
			});
			var status = null;
			if (!el.querySelector("[aria-live]")) {
				status = document.createElement("span");
				status.className = "brut-combobox__status";
				status.setAttribute("aria-live", "polite");
				status.setAttribute("aria-atomic", "true");
				status.style.cssText = "position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;";
				el.appendChild(status);
			}
			function onScroll() {
				if (!el.isConnected) return;
				close();
			}
			function open() {
				el.classList.add("brut-combobox--open");
				input.setAttribute("aria-expanded", "true");
				document.addEventListener("scroll", onScroll, {
					capture: true,
					passive: true
				});
			}
			function close() {
				el.classList.remove("brut-combobox--open");
				input.setAttribute("aria-expanded", "false");
				input.removeAttribute("aria-activedescendant");
				setActive(-1);
				document.removeEventListener("scroll", onScroll, { capture: true });
			}
			function setActive(i) {
				opts.forEach(function(o, j) {
					o.setAttribute("aria-selected", i === j ? "true" : "false");
				});
				activeIdx = i;
				if (i >= 0 && opts[i]) {
					opts[i].scrollIntoView({ block: "nearest" });
					input.setAttribute("aria-activedescendant", opts[i].id);
				} else input.removeAttribute("aria-activedescendant");
			}
			function visibleOpts() {
				return opts.filter(function(o) {
					return o.style.display !== "none";
				});
			}
			function clearValue() {
				if (hidden) hidden.value = "";
				el.dispatchEvent(new CustomEvent("brut:change", {
					bubbles: true,
					detail: {
						value: "",
						label: ""
					}
				}));
			}
			function matchesOption(text) {
				var t = (text || "").trim().toLowerCase();
				if (!t) return false;
				for (var i = 0; i < opts.length; i++) if (opts[i].textContent.trim().toLowerCase() === t) return true;
				return false;
			}
			function pick(opt) {
				if (!opt) return;
				input.value = opt.textContent.trim();
				if (hidden) hidden.value = opt.getAttribute("data-value") || opt.textContent.trim();
				el.dispatchEvent(new CustomEvent("brut:change", {
					bubbles: true,
					detail: {
						value: hidden ? hidden.value : input.value,
						label: input.value
					}
				}));
				close();
			}
			function filter() {
				var raw = input.value || "";
				var q = raw.toLowerCase();
				var any = false;
				var visibleCount = 0;
				opts.forEach(function(o) {
					var match = o.textContent.toLowerCase().indexOf(q) !== -1;
					o.style.display = match ? "" : "none";
					if (match) {
						any = true;
						visibleCount++;
					}
				});
				if (emptyEl) emptyEl.style.display = any ? "none" : "block";
				if (status) status.textContent = visibleCount === 0 ? "No results" : visibleCount === 1 ? "1 result" : visibleCount + " results";
				if (raw.trim() === "" && hidden && hidden.value !== "") clearValue();
				else el.dispatchEvent(new CustomEvent("brut:change", {
					bubbles: true,
					detail: {
						value: hidden ? hidden.value : input.value,
						label: input.value,
						visible: visibleCount
					}
				}));
				open();
			}
			if (!input.hasAttribute("role")) input.setAttribute("role", "combobox");
			if (!input.hasAttribute("aria-autocomplete")) input.setAttribute("aria-autocomplete", "list");
			input.setAttribute("aria-expanded", "false");
			if (!input.hasAttribute("aria-controls")) input.setAttribute("aria-controls", list.id);
			list.setAttribute("role", "listbox");
			opts.forEach(function(o) {
				o.setAttribute("role", "option");
			});
			var debounceMs = parseInt(el.getAttribute("data-brut-debounce"), 10);
			if (isNaN(debounceMs) || debounceMs < 0) debounceMs = 0;
			var debounceTimer = null;
			function runDebounced(fn) {
				if (debounceMs === 0) {
					fn();
					return;
				}
				if (debounceTimer) clearTimeout(debounceTimer);
				debounceTimer = setTimeout(function() {
					debounceTimer = null;
					fn();
				}, debounceMs);
			}
			input.addEventListener("focus", open);
			input.addEventListener("input", function() {
				runDebounced(filter);
			});
			input.addEventListener("blur", function() {
				if (!matchesOption(input.value) && hidden && hidden.value !== "") clearValue();
			});
			input.addEventListener("keydown", function(e) {
				var v = visibleOpts();
				if (!v.length && e.key !== "Escape") return;
				var current = opts[activeIdx];
				var idxInVisible = v.indexOf(current);
				if (e.key === "ArrowDown") {
					e.preventDefault();
					var n = v[(idxInVisible + 1 + v.length) % v.length] || v[0];
					setActive(opts.indexOf(n));
					open();
				} else if (e.key === "ArrowUp") {
					e.preventDefault();
					var p = v[(idxInVisible - 1 + v.length) % v.length] || v[v.length - 1];
					setActive(opts.indexOf(p));
					open();
				} else if (e.key === "Enter") {
					if (el.classList.contains("brut-combobox--open")) {
						e.preventDefault();
						pick(current || v[0]);
					}
				} else if (e.key === "Escape") close();
			});
			opts.forEach(function(o, i) {
				o.addEventListener("mouseenter", function() {
					setActive(i);
				});
				o.addEventListener("mousedown", function(e) {
					e.preventDefault();
					pick(o);
				});
			});
			document.addEventListener("click", function(e) {
				if (!el.contains(e.target)) close();
			});
			var form = el.closest("form");
			if (form) form.addEventListener("reset", function() {
				if (!el.isConnected) return;
				setTimeout(function() {
					close();
					if (hidden && hidden.value) {
						var match = null;
						for (var i = 0; i < opts.length; i++) if ((opts[i].getAttribute("data-value") || opts[i].textContent.trim()) === hidden.value) {
							match = opts[i];
							break;
						}
						input.value = match ? match.textContent.trim() : "";
					} else input.value = "";
					opts.forEach(function(o) {
						o.style.display = "";
					});
					if (emptyEl) emptyEl.style.display = "none";
				}, 0);
			});
		}
	});
})();
//#endregion
//#region src/js/components/copy.js
(function() {
	if (!window.Brut) return;
	Brut.register("copy", {
		selector: "[data-brut=\"copy\"]",
		init: function(el) {
			var btn = el.querySelector(".brut-copy__btn");
			if (!btn) return;
			var valueEl = el.querySelector(".brut-copy__value");
			if (btn.getAttribute("type") !== "button") btn.setAttribute("type", "button");
			var labelCopy = el.getAttribute("data-brut-label-copy") || "COPY";
			if (!btn.textContent || !btn.textContent.trim()) btn.textContent = labelCopy;
			var live = document.createElement("span");
			live.setAttribute("aria-live", "polite");
			live.setAttribute("aria-atomic", "true");
			live.className = "brut-copy__live";
			live.style.position = "absolute";
			live.style.width = "1px";
			live.style.height = "1px";
			live.style.padding = "0";
			live.style.margin = "-1px";
			live.style.overflow = "hidden";
			live.style.clip = "rect(0,0,0,0)";
			live.style.whiteSpace = "nowrap";
			live.style.border = "0";
			el.appendChild(live);
			function readValue() {
				if (valueEl && valueEl.textContent != null && valueEl.textContent.length) return valueEl.textContent;
				return el.getAttribute("data-brut-value") || "";
			}
			function legacyCopy(text) {
				try {
					var ta = document.createElement("textarea");
					ta.value = text;
					ta.setAttribute("readonly", "");
					ta.style.position = "absolute";
					ta.style.left = "-9999px";
					ta.style.top = "0";
					document.body.appendChild(ta);
					ta.select();
					var ok = false;
					try {
						ok = document.execCommand("copy");
					} catch (_) {
						ok = false;
					}
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
				var copiedLabel = el.getAttribute("data-brut-label-copied") || "COPIED";
				var announceLabel = el.getAttribute("data-brut-label-announce") || "Copied to clipboard";
				btn.textContent = copiedLabel;
				live.textContent = announceLabel;
				if (resetTimer) clearTimeout(resetTimer);
				resetTimer = setTimeout(function() {
					if (!el.isConnected) return;
					btn.textContent = original;
					live.textContent = "";
					resetTimer = null;
				}, 1500);
				el.dispatchEvent(new CustomEvent("brut:change", {
					bubbles: true,
					detail: { value }
				}));
			}
			btn.addEventListener("click", function() {
				var text = readValue();
				if (window.navigator && navigator.clipboard && typeof navigator.clipboard.writeText === "function") navigator.clipboard.writeText(text).then(function() {
					announce(text);
				}, function() {
					if (legacyCopy(text)) announce(text);
				});
				else if (legacyCopy(text)) announce(text);
			});
		}
	});
})();
//#endregion
//#region src/js/components/counter.js
(function() {
	if (!window.Brut) return;
	Brut.register("counter", {
		selector: "[data-brut=\"counter\"]",
		init: function(el) {
			var target = document.getElementById(el.getAttribute("data-brut-for"));
			if (!target) return;
			if (!el.hasAttribute("aria-live")) el.setAttribute("aria-live", "polite");
			if (!el.hasAttribute("aria-atomic")) el.setAttribute("aria-atomic", "true");
			var attrMax = parseInt(target.getAttribute("maxlength"), 10);
			var dataMax = parseInt(el.getAttribute("data-brut-max"), 10);
			var max = isFinite(attrMax) ? attrMax : isFinite(dataMax) ? dataMax : 0;
			function refresh() {
				var n = (target.value || "").length;
				el.textContent = max ? n + " / " + max : String(n);
				var over = max ? n > max : false;
				if (max) el.classList.toggle("brut-counter--over", over);
				el.dispatchEvent(new CustomEvent("brut:change", {
					bubbles: true,
					detail: {
						value: n,
						max,
						over
					}
				}));
			}
			target.addEventListener("input", refresh);
			target.addEventListener("change", refresh);
			var form = target.closest("form");
			if (form) form.addEventListener("reset", function() {
				if (!el.isConnected) return;
				setTimeout(refresh, 0);
			});
			refresh();
		}
	});
})();
//#endregion
//#region src/js/components/date.js
(function() {
	if (!window.Brut) return;
	var DOW = [
		"MO",
		"TU",
		"WE",
		"TH",
		"FR",
		"SA",
		"SU"
	];
	var MONTHS = [
		"JAN",
		"FEB",
		"MAR",
		"APR",
		"MAY",
		"JUN",
		"JUL",
		"AUG",
		"SEP",
		"OCT",
		"NOV",
		"DEC"
	];
	function pad2(n) {
		return n < 10 ? "0" + n : "" + n;
	}
	function iso(d) {
		return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate());
	}
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
		return a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
	}
	function startOfMonth(d) {
		return new Date(d.getFullYear(), d.getMonth(), 1);
	}
	function dowMon(d) {
		return (d.getDay() + 6) % 7;
	}
	Brut.register("date", {
		selector: "[data-brut=\"date\"]",
		init: function(el) {
			var field = el.querySelector(".brut-date__field") || el.querySelector("input[type=\"text\"], input[type=\"date\"], input:not([type])");
			if (!field) return;
			function parseISODate(s) {
				if (!s) return null;
				var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
				if (!m) return null;
				var d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
				return isNaN(d.getTime()) ? null : d;
			}
			var minDate = parseISODate(el.getAttribute("data-brut-min"));
			var maxDate = parseISODate(el.getAttribute("data-brut-max"));
			function inRange(d) {
				if (minDate && d < minDate) return false;
				if (maxDate && d > maxDate) return false;
				return true;
			}
			if (minDate) field.setAttribute("min", el.getAttribute("data-brut-min"));
			if (maxDate) field.setAttribute("max", el.getAttribute("data-brut-max"));
			el.querySelectorAll("input[type=\"number\"], .brut-date__year, .brut-date__month, .brut-date__day").forEach(function(seg) {
				if (!seg.hasAttribute("inputmode")) seg.setAttribute("inputmode", "numeric");
			});
			var hidden = el.querySelector("input[type=\"hidden\"]");
			if (!hidden && el.getAttribute("data-brut-name")) {
				hidden = document.createElement("input");
				hidden.type = "hidden";
				hidden.name = el.getAttribute("data-brut-name");
				el.appendChild(hidden);
			}
			var today = /* @__PURE__ */ new Date();
			today.setHours(0, 0, 0, 0);
			var initial = parseISO(field.value) || parseISO(hidden && hidden.value);
			var selected = initial;
			var view = startOfMonth(initial || today);
			var focusDay = new Date((selected || today).getTime());
			var pop = el.querySelector(".brut-date__pop");
			if (!pop) {
				pop = document.createElement("div");
				pop.className = "brut-date__pop";
				el.appendChild(pop);
			}
			pop.innerHTML = "";
			var head = document.createElement("div");
			head.className = "brut-date__head";
			var prevBtn = document.createElement("button");
			prevBtn.className = "brut-date__nav-btn";
			prevBtn.setAttribute("type", "button");
			prevBtn.setAttribute("aria-label", "Previous month");
			prevBtn.textContent = "‹";
			var title = document.createElement("span");
			title.className = "brut-date__title";
			var nextBtn = document.createElement("button");
			nextBtn.className = "brut-date__nav-btn";
			nextBtn.setAttribute("type", "button");
			nextBtn.setAttribute("aria-label", "Next month");
			nextBtn.textContent = "›";
			head.appendChild(prevBtn);
			head.appendChild(title);
			head.appendChild(nextBtn);
			pop.appendChild(head);
			var dows = document.createElement("div");
			dows.className = "brut-date__dows";
			DOW.forEach(function(name) {
				var s = document.createElement("span");
				s.className = "brut-date__dow";
				s.textContent = name;
				dows.appendChild(s);
			});
			pop.appendChild(dows);
			var grid = document.createElement("div");
			grid.className = "brut-date__grid";
			grid.setAttribute("role", "grid");
			pop.appendChild(grid);
			function render() {
				title.textContent = MONTHS[view.getMonth()] + " " + view.getFullYear();
				grid.innerHTML = "";
				var first = startOfMonth(view);
				var startCell = new Date(first.getTime());
				startCell.setDate(first.getDate() - dowMon(first));
				for (var i = 0; i < 42; i++) {
					var d = new Date(startCell.getTime());
					d.setDate(startCell.getDate() + i);
					var btn = document.createElement("button");
					btn.className = "brut-date__day";
					btn.setAttribute("type", "button");
					btn.setAttribute("role", "gridcell");
					btn.textContent = d.getDate();
					btn.setAttribute("data-iso", iso(d));
					if (d.getMonth() !== view.getMonth()) btn.classList.add("brut-date__day--out");
					if (sameYMD(d, today)) btn.classList.add("brut-date__day--today");
					if (sameYMD(d, selected)) btn.classList.add("brut-date__day--selected");
					if (!inRange(d)) {
						btn.disabled = true;
						btn.classList.add("brut-date__day--disabled");
					}
					if (sameYMD(d, focusDay)) btn.setAttribute("tabindex", "0");
					else btn.setAttribute("tabindex", "-1");
					btn.addEventListener("click", function(ev) {
						commit(parseISO(ev.currentTarget.getAttribute("data-iso")));
					});
					btn.addEventListener("keydown", onKey);
					grid.appendChild(btn);
				}
			}
			function focusActive() {
				var node = grid.querySelector("[tabindex=\"0\"]");
				if (node && document.activeElement && pop.contains(document.activeElement)) node.focus();
			}
			function move(days) {
				var d = new Date(focusDay.getTime());
				d.setDate(d.getDate() + days);
				focusDay = d;
				if (d.getMonth() !== view.getMonth() || d.getFullYear() !== view.getFullYear()) view = startOfMonth(d);
				render();
				var node = grid.querySelector("[data-iso=\"" + iso(focusDay) + "\"]");
				if (node) node.focus();
			}
			function onKey(e) {
				if (e.key === "ArrowLeft") {
					e.preventDefault();
					move(-1);
				} else if (e.key === "ArrowRight") {
					e.preventDefault();
					move(1);
				} else if (e.key === "ArrowUp") {
					e.preventDefault();
					move(-7);
				} else if (e.key === "ArrowDown") {
					e.preventDefault();
					move(7);
				} else if (e.key === "Enter") {
					e.preventDefault();
					commit(new Date(focusDay.getTime()));
				} else if (e.key === "Escape") {
					e.preventDefault();
					close();
					field.focus();
				} else if (e.key === "PageUp") {
					e.preventDefault();
					shiftMonth(-1);
				} else if (e.key === "PageDown") {
					e.preventDefault();
					shiftMonth(1);
				}
			}
			function shiftMonth(delta) {
				view = new Date(view.getFullYear(), view.getMonth() + delta, 1);
				var dim = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
				var day = Math.min(focusDay.getDate(), dim);
				focusDay = new Date(view.getFullYear(), view.getMonth(), day);
				render();
				focusActive();
			}
			var skipNextOpen = false;
			function commit(d) {
				if (!d) return;
				if (!inRange(d)) return;
				selected = d;
				focusDay = new Date(d.getTime());
				view = startOfMonth(d);
				var s = iso(d);
				field.value = s;
				if (hidden) hidden.value = s;
				render();
				el.dispatchEvent(new CustomEvent("brut:change", { detail: { value: s } }));
				close();
				skipNextOpen = true;
				field.focus();
			}
			function open() {
				if (skipNextOpen) {
					skipNextOpen = false;
					return;
				}
				if (el.classList.contains("brut-date--open")) return;
				var cur = parseISO(field.value) || selected || today;
				focusDay = new Date(cur.getTime());
				if (cur.getMonth() !== view.getMonth() || cur.getFullYear() !== view.getFullYear()) view = startOfMonth(cur);
				el.classList.add("brut-date--open");
				field.setAttribute("aria-expanded", "true");
				render();
				setTimeout(function() {
					var node = grid.querySelector("[tabindex=\"0\"]");
					if (node) node.focus();
				}, 0);
			}
			function close() {
				el.classList.remove("brut-date--open");
				field.setAttribute("aria-expanded", "false");
			}
			field.setAttribute("role", "combobox");
			field.setAttribute("aria-haspopup", "dialog");
			field.setAttribute("aria-expanded", "false");
			if (!field.getAttribute("placeholder")) field.setAttribute("placeholder", "YYYY-MM-DD");
			field.addEventListener("focus", open);
			field.addEventListener("click", open);
			field.addEventListener("keydown", function(e) {
				if (e.key === "ArrowDown" || e.key === "Enter") {
					e.preventDefault();
					open();
				} else if (e.key === "Escape") close();
			});
			field.addEventListener("change", function() {
				var p = parseISO(field.value);
				if (p) {
					selected = p;
					view = startOfMonth(p);
					focusDay = new Date(p.getTime());
					if (hidden) hidden.value = iso(p);
				}
			});
			prevBtn.addEventListener("click", function() {
				shiftMonth(-1);
			});
			nextBtn.addEventListener("click", function() {
				shiftMonth(1);
			});
			document.addEventListener("mousedown", function(e) {
				if (!el.contains(e.target)) close();
			});
			if (selected && hidden && !hidden.value) hidden.value = iso(selected);
			render();
		}
	});
})();
//#endregion
//#region src/js/components/dialog.js
(function() {
	if (!window.Brut) return;
	var titleCounter = 0;
	var closeByEl = /* @__PURE__ */ new WeakMap();
	document.addEventListener("keydown", function(e) {
		if (e.key !== "Escape") return;
		document.querySelectorAll("[data-brut=\"dialog\"]:not([hidden])").forEach(function(el) {
			if (!el.isConnected) return;
			var c = closeByEl.get(el);
			if (c) c();
		});
	});
	Brut.register("dialog", {
		selector: "[data-brut=\"dialog\"]",
		init: function(el) {
			if (!el.id) return;
			var scrimId = el.getAttribute("data-brut-scrim");
			var scrim = scrimId ? document.getElementById(scrimId) : null;
			if (!el.hasAttribute("aria-labelledby") && !el.hasAttribute("aria-label")) {
				var head = el.querySelector(".brut-dialog__head");
				var heading = head && head.querySelector("h1, h2, h3, h4, h5, h6, [data-brut-dialog-title]") || el.querySelector("h1, h2, h3, h4, h5, h6, [data-brut-dialog-title]");
				if (heading) {
					if (!heading.id) heading.id = "brut-dialog-title-" + ++titleCounter;
					el.setAttribute("aria-labelledby", heading.id);
				}
			}
			var trap = null;
			function open() {
				if (!el.hasAttribute("hidden")) return;
				el.removeAttribute("hidden");
				el.setAttribute("aria-modal", "true");
				Array.prototype.filter.call(document.body.children, function(child) {
					return child !== el && !child.classList.contains("brut-scrim");
				}).forEach(function(child) {
					child.inert = true;
				});
				if (scrim) scrim.removeAttribute("hidden");
				if (Brut.scrollLock) Brut.scrollLock.acquire();
				if (Brut.focusTrap) trap = Brut.focusTrap.activate(el);
				el.dispatchEvent(new CustomEvent("brut:open"));
			}
			function close() {
				if (el.hasAttribute("hidden")) return;
				if (trap) {
					trap.release();
					trap = null;
				}
				el.setAttribute("hidden", "");
				el.removeAttribute("aria-modal");
				Array.prototype.forEach.call(document.body.children, function(child) {
					if (child !== el) child.inert = false;
				});
				if (scrim) scrim.setAttribute("hidden", "");
				if (Brut.scrollLock) Brut.scrollLock.release();
				el.dispatchEvent(new CustomEvent("brut:close"));
			}
			closeByEl.set(el, close);
			document.querySelectorAll("[data-brut-open=\"" + el.id + "\"]").forEach(function(t) {
				t.addEventListener("click", function(e) {
					e.preventDefault();
					open();
				});
			});
			el.querySelectorAll("[data-brut-close], .brut-dialog__x").forEach(function(t) {
				if (t.tagName === "BUTTON") t.setAttribute("type", "button");
				t.addEventListener("click", function(e) {
					e.preventDefault();
					close();
				});
			});
			if (scrim) scrim.addEventListener("click", function(e) {
				if (e.target === scrim) close();
			});
		}
	});
})();
//#endregion
//#region src/js/components/drawer.js
(function() {
	if (!window.Brut) return;
	var titleCounter = 0;
	var closeByEl = /* @__PURE__ */ new WeakMap();
	document.addEventListener("keydown", function(e) {
		if (e.key !== "Escape") return;
		document.querySelectorAll("[data-brut=\"drawer\"]:not([hidden])").forEach(function(el) {
			if (!el.isConnected) return;
			var c = closeByEl.get(el);
			if (c) c();
		});
	});
	Brut.register("drawer", {
		selector: "[data-brut=\"drawer\"]",
		init: function(el) {
			if (!el.id) return;
			var sideClass = "brut-drawer--" + (el.getAttribute("data-brut-side") || "right");
			if (!el.classList.contains(sideClass)) el.classList.add(sideClass);
			if (!el.hasAttribute("role")) el.setAttribute("role", "dialog");
			var scrimId = el.getAttribute("data-brut-scrim");
			var scrim = scrimId ? document.getElementById(scrimId) : null;
			if (!el.hasAttribute("aria-labelledby") && !el.hasAttribute("aria-label")) {
				var head = el.querySelector(".brut-drawer__head");
				var heading = head && head.querySelector("h1, h2, h3, h4, h5, h6, [data-brut-drawer-title]") || el.querySelector("h1, h2, h3, h4, h5, h6, [data-brut-drawer-title]");
				if (heading) {
					if (!heading.id) heading.id = "brut-drawer-title-" + ++titleCounter;
					el.setAttribute("aria-labelledby", heading.id);
				}
			}
			var trap = null;
			var lastTrigger = null;
			function open(trigger) {
				if (!el.hasAttribute("hidden") && el.classList.contains("brut-drawer--open")) return;
				lastTrigger = trigger || lastTrigger;
				el.removeAttribute("hidden");
				el.setAttribute("aria-modal", "true");
				Array.prototype.filter.call(document.body.children, function(child) {
					return child !== el && !child.classList.contains("brut-scrim");
				}).forEach(function(child) {
					child.inert = true;
				});
				if (scrim) scrim.removeAttribute("hidden");
				el.offsetWidth;
				el.classList.add("brut-drawer--open");
				if (Brut.scrollLock) Brut.scrollLock.acquire();
				if (Brut.focusTrap) trap = Brut.focusTrap.activate(el);
				el.dispatchEvent(new CustomEvent("brut:open"));
			}
			function close() {
				if (el.hasAttribute("hidden")) return;
				if (trap) {
					trap.release();
					trap = null;
				}
				el.classList.remove("brut-drawer--open");
				el.setAttribute("hidden", "");
				el.removeAttribute("aria-modal");
				Array.prototype.forEach.call(document.body.children, function(child) {
					if (child !== el) child.inert = false;
				});
				if (scrim) scrim.setAttribute("hidden", "");
				if (Brut.scrollLock) Brut.scrollLock.release();
				el.dispatchEvent(new CustomEvent("brut:close"));
				if (lastTrigger && lastTrigger.isConnected) try {
					lastTrigger.focus();
				} catch (e) {}
			}
			closeByEl.set(el, close);
			document.querySelectorAll("[data-brut-open=\"" + el.id + "\"]").forEach(function(t) {
				if (t.tagName === "BUTTON") t.setAttribute("type", "button");
				t.addEventListener("click", function(e) {
					e.preventDefault();
					open(t);
				});
			});
			el.querySelectorAll("[data-brut-close], .brut-drawer__x").forEach(function(t) {
				if (t.tagName === "BUTTON") t.setAttribute("type", "button");
				t.addEventListener("click", function(e) {
					e.preventDefault();
					close();
				});
			});
			if (scrim) scrim.addEventListener("click", function(e) {
				if (e.target === scrim) close();
			});
		}
	});
})();
//#endregion
//#region src/js/components/dropzone.js
(function() {
	if (!window.Brut) return;
	Brut.register("dropzone", {
		selector: "[data-brut=\"dropzone\"]",
		init: function(el) {
			var input = el.querySelector("input[type=\"file\"]");
			if (!input) return;
			function setFiles(fileList) {
				try {
					var dt = new DataTransfer();
					for (var i = 0; i < fileList.length; i++) dt.items.add(fileList[i]);
					input.files = dt.files;
				} catch (e) {
					input.files = fileList;
				}
				input.dispatchEvent(new Event("change", { bubbles: true }));
				el.dispatchEvent(new CustomEvent("brut:change", { detail: {
					value: input.files,
					files: input.files
				} }));
			}
			el.addEventListener("click", function(e) {
				if (e.target !== input) input.click();
			});
			if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "0");
			if (!el.hasAttribute("role")) el.setAttribute("role", "button");
			if (!el.hasAttribute("aria-label")) {
				var hint = el.querySelector(".brut-dropzone__hint");
				el.setAttribute("aria-label", hint && hint.textContent.trim() || "Choose files");
			}
			el.addEventListener("keydown", function(e) {
				if (e.key !== "Enter" && e.key !== " ") return;
				e.preventDefault();
				input.click();
			});
			["dragenter", "dragover"].forEach(function(ev) {
				el.addEventListener(ev, function(e) {
					e.preventDefault();
					e.stopPropagation();
					el.classList.add("brut-dropzone--drag");
				});
			});
			["dragleave", "drop"].forEach(function(ev) {
				el.addEventListener(ev, function(e) {
					e.preventDefault();
					e.stopPropagation();
					el.classList.remove("brut-dropzone--drag");
				});
			});
			el.addEventListener("drop", function(e) {
				if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) setFiles(e.dataTransfer.files);
			});
		}
	});
})();
//#endregion
//#region src/js/components/field.js
(function() {
	if (!window.Brut) return;
	function syncAriaInvalid(field) {
		if (!field || !field.classList || !field.classList.contains("brut-field")) return;
		var input = field.querySelector("input, select, textarea");
		if (!input) return;
		if (field.classList.contains("brut-field--invalid")) input.setAttribute("aria-invalid", "true");
		else input.removeAttribute("aria-invalid");
	}
	var observer = new MutationObserver(function(records) {
		for (var i = 0; i < records.length; i++) {
			var r = records[i];
			if (r.type === "attributes" && r.attributeName === "class") syncAriaInvalid(r.target);
		}
	});
	function start() {
		var fields = document.querySelectorAll(".brut-field");
		for (var i = 0; i < fields.length; i++) syncAriaInvalid(fields[i]);
		observer.observe(document.body, {
			subtree: true,
			attributes: true,
			attributeFilter: ["class"]
		});
	}
	if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
	else start();
	Brut.register("field", {
		selector: "[data-brut=\"field\"]",
		init: function() {}
	});
})();
//#endregion
//#region src/js/components/file.js
(function() {
	if (!window.Brut) return;
	var SR_CSS = "position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0;";
	var uid = 0;
	Brut.register("file", {
		selector: "[data-brut=\"file\"]",
		init: function(el) {
			var input = el.querySelector("input[type=\"file\"]");
			var name = el.querySelector(".brut-file__name");
			if (!input) return;
			var live = document.createElement("span");
			live.setAttribute("aria-live", "polite");
			live.setAttribute("aria-atomic", "true");
			live.style.cssText = SR_CSS;
			el.appendChild(live);
			var hintText = el.getAttribute("data-brut-accept-label");
			if (!hintText) {
				var accept = input.getAttribute("accept");
				if (accept) hintText = "Accepted: " + accept;
			}
			if (hintText) {
				var desc = document.createElement("span");
				var descId = "brut-file-desc-" + ++uid;
				desc.id = descId;
				desc.textContent = hintText;
				desc.style.cssText = SR_CSS;
				el.appendChild(desc);
				input.setAttribute("aria-describedby", descId);
			}
			function refresh() {
				if (!name) return;
				if (input.files && input.files.length) name.textContent = input.files.length === 1 ? input.files[0].name : input.files.length + " files";
				else name.textContent = "No file selected";
			}
			function announce() {
				var files = input.files;
				if (!files || !files.length) return;
				if (files.length === 1) live.textContent = "Selected file: " + files[0].name;
				else live.textContent = "Selected " + files.length + " files: " + Array.from(files).map(function(f) {
					return f.name;
				}).join(", ");
			}
			input.addEventListener("change", function() {
				refresh();
				announce();
				el.dispatchEvent(new CustomEvent("brut:change", { detail: {
					value: input.files,
					files: input.files
				} }));
			});
			refresh();
		}
	});
})();
//#endregion
//#region src/js/components/menu.js
(function() {
	if (!window.Brut) return;
	var closeByEl = /* @__PURE__ */ new WeakMap();
	document.addEventListener("keydown", function(e) {
		if (e.key !== "Escape") return;
		document.querySelectorAll("[data-brut=\"menu\"]:not([hidden])").forEach(function(el) {
			if (!el.isConnected) return;
			var c = closeByEl.get(el);
			if (c) c();
		});
	});
	Brut.register("menu", {
		selector: "[data-brut=\"menu\"]",
		init: function(el) {
			if (!el.id) return;
			var triggers = document.querySelectorAll("[data-brut-menu-open=\"" + el.id + "\"]");
			var lastTrigger = null;
			if (!el.hasAttribute("role")) el.setAttribute("role", "menu");
			function items() {
				return el.querySelectorAll(".brut-menu__item");
			}
			var initialItems = el.querySelectorAll(".brut-menu__item");
			for (var ii = 0; ii < initialItems.length; ii++) {
				var item = initialItems[ii];
				if (!item.hasAttribute("role")) item.setAttribute("role", "menuitem");
				if (item.hasAttribute("disabled")) item.setAttribute("aria-disabled", "true");
			}
			var seps = el.querySelectorAll("hr");
			for (var si = 0; si < seps.length; si++) if (!seps[si].hasAttribute("role")) seps[si].setAttribute("role", "separator");
			function position() {
				if (!lastTrigger) return;
				var r = lastTrigger.getBoundingClientRect();
				var gap = 6;
				el.style.position = "fixed";
				el.style.top = Math.round(r.bottom + gap) + "px";
				el.style.left = Math.round(r.left) + "px";
			}
			function open(trigger) {
				lastTrigger = trigger || lastTrigger;
				el.removeAttribute("hidden");
				position();
				if (lastTrigger) lastTrigger.setAttribute("aria-expanded", "true");
				var first = el.querySelector(".brut-menu__item");
				if (first) try {
					first.focus();
				} catch (e) {}
				el.dispatchEvent(new CustomEvent("brut:open"));
			}
			function close() {
				if (el.hasAttribute("hidden")) return;
				el.setAttribute("hidden", "");
				triggers.forEach(function(t) {
					t.setAttribute("aria-expanded", "false");
				});
				el.dispatchEvent(new CustomEvent("brut:close"));
			}
			function closeAndRestoreFocus() {
				if (el.hasAttribute("hidden")) return;
				close();
				if (lastTrigger) try {
					lastTrigger.focus();
				} catch (err) {}
			}
			closeByEl.set(el, closeAndRestoreFocus);
			triggers.forEach(function(t) {
				if (t.tagName === "BUTTON") t.setAttribute("type", "button");
				t.setAttribute("aria-haspopup", "menu");
				t.setAttribute("aria-expanded", "false");
				t.addEventListener("click", function(e) {
					e.preventDefault();
					if (el.hasAttribute("hidden")) open(t);
					else close();
				});
			});
			el.addEventListener("click", function(e) {
				var node = e.target;
				while (node && node !== el) {
					if (node.classList && node.classList.contains("brut-menu__item")) {
						close();
						return;
					}
					node = node.parentNode;
				}
			});
			el.addEventListener("keydown", function(e) {
				var list = items();
				if (!list.length) return;
				var idx = -1;
				for (var i = 0; i < list.length; i++) if (list[i] === document.activeElement) {
					idx = i;
					break;
				}
				if (e.key === "ArrowDown") {
					e.preventDefault();
					var next = list[(idx + 1 + list.length) % list.length];
					if (next) next.focus();
				} else if (e.key === "ArrowUp") {
					e.preventDefault();
					var prev = list[(idx - 1 + list.length) % list.length];
					if (prev) prev.focus();
				} else if (e.key === "Home") {
					e.preventDefault();
					list[0].focus();
				} else if (e.key === "End") {
					e.preventDefault();
					list[list.length - 1].focus();
				}
			});
			document.addEventListener("click", function(e) {
				if (!el.isConnected) return;
				if (el.hasAttribute("hidden")) return;
				if (el.contains(e.target)) return;
				for (var i = 0; i < triggers.length; i++) if (triggers[i].contains(e.target)) return;
				close();
			});
			window.addEventListener("resize", function() {
				if (!el.isConnected) return;
				if (!el.hasAttribute("hidden")) position();
			});
			window.addEventListener("scroll", function() {
				if (!el.isConnected) return;
				if (!el.hasAttribute("hidden")) position();
			}, {
				capture: true,
				passive: true
			});
		}
	});
})();
//#endregion
//#region src/js/components/multiselect.js
(function() {
	if (!window.Brut) return;
	var rootCounter = 0;
	Brut.register("multiselect", {
		selector: "[data-brut=\"multiselect\"]",
		init: function(el) {
			var fieldShell = el.querySelector(".brut-multiselect__field");
			var input = el.querySelector(".brut-multiselect__input");
			var list = el.querySelector(".brut-multiselect__list");
			if (!fieldShell || !input || !list) return;
			var rootSeq = ++rootCounter;
			var name = el.getAttribute("data-brut-name") || "values";
			var emptyEl = list.querySelector(".brut-multiselect__empty");
			var opts = Array.prototype.slice.call(list.querySelectorAll(".brut-multiselect__opt"));
			var activeIdx = -1;
			if (!list.id) list.id = "brut-multiselect-" + rootSeq + "-list";
			opts.forEach(function(o, i) {
				if (!o.id) o.id = "brut-multiselect-" + rootSeq + "-opt-" + i;
			});
			var status = null;
			if (!el.querySelector("[aria-live]")) {
				status = document.createElement("span");
				status.className = "brut-multiselect__status";
				status.setAttribute("aria-live", "polite");
				status.setAttribute("aria-atomic", "true");
				status.style.cssText = "position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;";
				el.appendChild(status);
			}
			var selected = Object.create(null);
			opts.forEach(function(o) {
				if (o.hasAttribute("data-selected")) selected[o.getAttribute("data-value") || o.textContent.trim()] = labelOf(o);
			});
			function labelOf(o) {
				return (o.textContent || "").trim();
			}
			function valueOf(o) {
				return o.getAttribute("data-value") || labelOf(o);
			}
			function open() {
				el.classList.add("brut-multiselect--open");
				input.setAttribute("aria-expanded", "true");
				if (activeIdx < 0) setActive(firstVisibleIdx());
			}
			function close() {
				el.classList.remove("brut-multiselect--open");
				input.setAttribute("aria-expanded", "false");
				input.removeAttribute("aria-activedescendant");
				activeIdx = -1;
			}
			function visibleOpts() {
				return opts.filter(function(o) {
					return o.style.display !== "none";
				});
			}
			function firstVisibleIdx() {
				for (var i = 0; i < opts.length; i++) if (opts[i].style.display !== "none") return i;
				return -1;
			}
			function setActive(i) {
				opts.forEach(function(o, j) {
					o.classList.toggle("brut-multiselect__opt--active", i === j);
				});
				activeIdx = i;
				if (i >= 0 && opts[i] && opts[i].style.display !== "none") {
					opts[i].scrollIntoView({ block: "nearest" });
					input.setAttribute("aria-activedescendant", opts[i].id);
				} else input.removeAttribute("aria-activedescendant");
			}
			function syncHidden() {
				Array.prototype.slice.call(el.querySelectorAll("input[type=\"hidden\"][data-brut-mirror=\"1\"]")).forEach(function(n) {
					n.remove();
				});
				Object.keys(selected).forEach(function(v) {
					var h = document.createElement("input");
					h.type = "hidden";
					h.name = name;
					h.value = v;
					h.setAttribute("data-brut-mirror", "1");
					el.appendChild(h);
				});
			}
			function renderChips() {
				Array.prototype.slice.call(fieldShell.querySelectorAll(".brut-multiselect__chip")).forEach(function(c) {
					c.remove();
				});
				Object.keys(selected).forEach(function(v) {
					var chip = document.createElement("span");
					chip.className = "brut-tag brut-multiselect__chip";
					chip.setAttribute("data-value", v);
					chip.appendChild(document.createTextNode(selected[v] + " "));
					var x = document.createElement("button");
					x.className = "brut-tag__x";
					x.setAttribute("type", "button");
					x.setAttribute("aria-label", "Remove " + selected[v]);
					x.textContent = "×";
					x.addEventListener("mousedown", function(ev) {
						ev.preventDefault();
					});
					x.addEventListener("click", function(ev) {
						ev.stopPropagation();
						remove(v);
					});
					chip.appendChild(x);
					fieldShell.insertBefore(chip, input);
				});
			}
			function renderOpts() {
				opts.forEach(function(o) {
					var v = valueOf(o);
					o.classList.toggle("brut-multiselect__opt--selected", !!selected[v]);
					o.setAttribute("aria-selected", selected[v] ? "true" : "false");
				});
			}
			function emit() {
				el.dispatchEvent(new CustomEvent("brut:change", { detail: { value: Object.keys(selected) } }));
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
				if (selected[v]) remove(v);
				else add(o);
			}
			function filter() {
				var q = (input.value || "").toLowerCase();
				var any = false;
				var visibleCount = 0;
				opts.forEach(function(o) {
					var match = labelOf(o).toLowerCase().indexOf(q) !== -1;
					o.style.display = match ? "" : "none";
					if (match) {
						any = true;
						visibleCount++;
					}
				});
				if (emptyEl) emptyEl.style.display = any ? "none" : "block";
				if (status) status.textContent = visibleCount === 0 ? "No results" : visibleCount === 1 ? "1 result" : visibleCount + " results";
				open();
			}
			input.setAttribute("role", "combobox");
			input.setAttribute("aria-autocomplete", "list");
			input.setAttribute("aria-expanded", "false");
			list.setAttribute("role", "listbox");
			list.setAttribute("aria-multiselectable", "true");
			opts.forEach(function(o) {
				o.setAttribute("role", "option");
			});
			input.addEventListener("focus", open);
			input.addEventListener("input", filter);
			input.addEventListener("keydown", function(e) {
				var v = visibleOpts();
				if (e.key === "Backspace" && !input.value) {
					var keys = Object.keys(selected);
					if (keys.length) remove(keys[keys.length - 1]);
				} else if (e.key === "Escape") close();
				else if (e.key === "ArrowDown") {
					if (!v.length) return;
					e.preventDefault();
					var current = opts[activeIdx];
					var next = v[(v.indexOf(current) + 1 + v.length) % v.length] || v[0];
					setActive(opts.indexOf(next));
					open();
				} else if (e.key === "ArrowUp") {
					if (!v.length) return;
					e.preventDefault();
					var currentUp = opts[activeIdx];
					var prev = v[(v.indexOf(currentUp) - 1 + v.length) % v.length] || v[v.length - 1];
					setActive(opts.indexOf(prev));
					open();
				} else if (e.key === "Enter") {
					var pick = activeIdx >= 0 && opts[activeIdx] && opts[activeIdx].style.display !== "none" ? opts[activeIdx] : v[0];
					if (pick) {
						e.preventDefault();
						toggle(pick);
						input.value = "";
						filter();
					}
				}
			});
			opts.forEach(function(o, i) {
				o.addEventListener("mouseenter", function() {
					setActive(i);
				});
				o.addEventListener("mousedown", function(e) {
					e.preventDefault();
					toggle(o);
					input.focus();
				});
			});
			fieldShell.addEventListener("click", function(e) {
				if (e.target === fieldShell) input.focus();
			});
			document.addEventListener("mousedown", function(e) {
				if (!el.contains(e.target)) close();
			});
			var form = el.closest("form");
			if (form) form.addEventListener("reset", function() {
				if (!el.isConnected) return;
				setTimeout(function() {
					Object.keys(selected).forEach(function(k) {
						delete selected[k];
					});
					input.value = "";
					renderChips();
					renderOpts();
					syncHidden();
					opts.forEach(function(o) {
						o.style.display = "";
					});
					if (emptyEl) emptyEl.style.display = "none";
					close();
				}, 0);
			});
			renderChips();
			renderOpts();
			syncHidden();
		}
	});
})();
//#endregion
//#region src/js/components/otp.js
(function() {
	if (!window.Brut) return;
	Brut.register("otp", {
		selector: "[data-brut=\"otp\"]",
		init: function(el) {
			var len = parseInt(el.getAttribute("data-brut-len"), 10) || 6;
			var name = el.getAttribute("data-brut-name") || "otp";
			var acOverride = el.getAttribute("data-brut-autocomplete");
			var acOff = acOverride === "off";
			var acValue = acOverride && !acOff ? acOverride : "one-time-code";
			var hidden = el.querySelector("input[type=\"hidden\"]");
			if (!hidden) {
				hidden = document.createElement("input");
				hidden.type = "hidden";
				hidden.name = name;
				el.appendChild(hidden);
			}
			var cells = el.querySelectorAll(".brut-otp__cell");
			if (cells.length === 0) {
				for (var i = 0; i < len; i++) {
					var c = document.createElement("input");
					c.className = "brut-otp__cell";
					c.maxLength = 1;
					el.insertBefore(c, hidden);
				}
				cells = el.querySelectorAll(".brut-otp__cell");
			}
			cells.forEach(function(cell) {
				if (!cell.hasAttribute("inputmode")) cell.setAttribute("inputmode", "numeric");
				if (!acOff && !cell.hasAttribute("autocomplete")) cell.setAttribute("autocomplete", acValue);
			});
			var labelNoun = el.getAttribute("data-brut-label-cell") || "Digit";
			cells.forEach(function(cell, idx) {
				if (!cell.hasAttribute("aria-label")) cell.setAttribute("aria-label", labelNoun + " " + (idx + 1) + " of " + cells.length);
			});
			var status = document.createElement("span");
			status.setAttribute("aria-live", "polite");
			status.setAttribute("aria-atomic", "true");
			status.style.cssText = "position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0;";
			el.appendChild(status);
			function gather() {
				var v = "";
				cells.forEach(function(c) {
					v += c.value || "";
				});
				hidden.value = v;
				el.dispatchEvent(new CustomEvent("brut:change", { detail: { value: v } }));
				if (v.length === cells.length) {
					status.textContent = "Code complete";
					el.dispatchEvent(new CustomEvent("brut:complete", { detail: { value: v } }));
				}
			}
			cells.forEach(function(cell, i) {
				cell.addEventListener("input", function() {
					cell.value = (cell.value || "").replace(/\D/g, "").slice(0, 1);
					if (cell.value && cells[i + 1]) cells[i + 1].focus();
					gather();
				});
				cell.addEventListener("keydown", function(e) {
					if (e.key === "Backspace" && !cell.value && cells[i - 1]) cells[i - 1].focus();
					if (e.key === "ArrowLeft" && cells[i - 1]) cells[i - 1].focus();
					if (e.key === "ArrowRight" && cells[i + 1]) cells[i + 1].focus();
				});
				cell.addEventListener("paste", function(e) {
					var data = e.clipboardData || window.clipboardData;
					if (!data) return;
					var text = data.getData("text").replace(/\D/g, "");
					if (!text) return;
					e.preventDefault();
					var k;
					for (k = 0; k < cells.length - i && k < text.length; k++) cells[i + k].value = text.charAt(k);
					var next = Math.min(i + text.length, cells.length - 1);
					cells[next].focus();
					gather();
				});
			});
			var form = el.closest("form");
			if (form) form.addEventListener("reset", function() {
				if (!el.isConnected) return;
				setTimeout(gather, 0);
			});
		}
	});
})();
//#endregion
//#region src/js/components/pagination.js
(function() {
	if (!window.Brut) return;
	Brut.register("pagination", {
		selector: "[data-brut=\"pagination\"]",
		init: function(el) {
			var total = parseInt(el.getAttribute("data-total"), 10);
			var pageSize = parseInt(el.getAttribute("data-page-size"), 10);
			var page = parseInt(el.getAttribute("data-page"), 10) || 1;
			var siblings = parseInt(el.getAttribute("data-sibling-count"), 10);
			if (isNaN(siblings) || siblings < 0) siblings = 1;
			if (!total || total <= 0 || !pageSize || pageSize <= 0) return;
			var totalPages = Math.max(1, Math.ceil(total / pageSize));
			if (page < 1) page = 1;
			if (page > totalPages) page = totalPages;
			if (!el.hasAttribute("role")) el.setAttribute("role", "navigation");
			if (!el.hasAttribute("aria-label")) el.setAttribute("aria-label", "Pagination");
			var pageSizesAttr = el.getAttribute("data-page-sizes");
			var pageSizeSelect = null;
			var pageSizeLabel = null;
			if (pageSizesAttr) {
				var sizes = pageSizesAttr.split(",").map(function(s) {
					return parseInt(s, 10);
				}).filter(function(n) {
					return !isNaN(n) && n > 0;
				});
				sizes.sort(function(a, b) {
					return a - b;
				});
				if (sizes.indexOf(pageSize) === -1) {
					sizes.unshift(pageSize);
					sizes.sort(function(a, b) {
						return a - b;
					});
				}
				var labelText = el.getAttribute("data-brut-label-page-size") || "Per page:";
				pageSizeLabel = document.createElement("label");
				pageSizeLabel.className = "brut-pagination__page-size";
				pageSizeLabel.appendChild(document.createTextNode(labelText + " "));
				pageSizeSelect = document.createElement("select");
				pageSizeSelect.className = "brut-select";
				for (var si = 0; si < sizes.length; si++) {
					var opt = document.createElement("option");
					opt.value = String(sizes[si]);
					opt.textContent = String(sizes[si]);
					if (sizes[si] === pageSize) opt.selected = true;
					pageSizeSelect.appendChild(opt);
				}
				pageSizeLabel.appendChild(pageSizeSelect);
				pageSizeSelect.addEventListener("change", function() {
					var newSize = parseInt(pageSizeSelect.value, 10);
					if (isNaN(newSize) || newSize <= 0) return;
					pageSize = newSize;
					totalPages = Math.max(1, Math.ceil(total / pageSize));
					page = 1;
					el.setAttribute("data-page-size", String(pageSize));
					render();
					el.dispatchEvent(new CustomEvent("brut:change", { detail: {
						value: page,
						page,
						pageSize,
						total
					} }));
				});
			}
			function pagesToShow() {
				var set = {};
				set[1] = true;
				set[totalPages] = true;
				for (var p = page - siblings; p <= page + siblings; p++) if (p >= 1 && p <= totalPages) set[p] = true;
				var nums = Object.keys(set).map(function(k) {
					return parseInt(k, 10);
				});
				nums.sort(function(a, b) {
					return a - b;
				});
				var out = [];
				for (var i = 0; i < nums.length; i++) {
					if (i > 0 && nums[i] - nums[i - 1] > 1) out.push(null);
					out.push(nums[i]);
				}
				return out;
			}
			function makeBtn(label, ariaLabel, targetPage, extraClass, isActive, isDisabled) {
				var b = document.createElement("button");
				b.setAttribute("type", "button");
				b.className = "brut-pagination__btn" + (extraClass ? " " + extraClass : "");
				b.textContent = label;
				if (ariaLabel) b.setAttribute("aria-label", ariaLabel);
				if (targetPage != null) b.setAttribute("data-page", String(targetPage));
				if (isActive) b.setAttribute("aria-current", "page");
				if (isDisabled) b.disabled = true;
				return b;
			}
			function render() {
				el.setAttribute("data-page", String(page));
				while (el.firstChild) el.removeChild(el.firstChild);
				el.appendChild(makeBtn("‹", "Previous page", page - 1, "brut-pagination__btn--prev", false, page <= 1));
				var items = pagesToShow();
				for (var i = 0; i < items.length; i++) {
					var n = items[i];
					if (n === null) {
						var gap = document.createElement("span");
						gap.className = "brut-pagination__gap";
						gap.setAttribute("aria-hidden", "true");
						gap.textContent = "…";
						el.appendChild(gap);
					} else el.appendChild(makeBtn(String(n), "Page " + n, n, n === page ? "brut-pagination__btn--active" : "", n === page, false));
				}
				el.appendChild(makeBtn("›", "Next page", page + 1, "brut-pagination__btn--next", false, page >= totalPages));
				if (pageSizeLabel) el.appendChild(pageSizeLabel);
			}
			function goTo(target) {
				if (target < 1) target = 1;
				if (target > totalPages) target = totalPages;
				if (target === page) return;
				page = target;
				render();
				el.dispatchEvent(new CustomEvent("brut:change", { detail: {
					value: page,
					page,
					pageSize,
					total
				} }));
			}
			el.addEventListener("click", function(e) {
				var t = e.target;
				if (!t || !t.getAttribute) return;
				var btn = t.closest ? t.closest("[data-page]") : null;
				if (!btn || !el.contains(btn)) return;
				if (btn.disabled) return;
				var n = parseInt(btn.getAttribute("data-page"), 10);
				if (!isNaN(n)) goTo(n);
			});
			el.addEventListener("keydown", function(e) {
				switch (e.key) {
					case "ArrowLeft":
						e.preventDefault();
						goTo(page - 1);
						break;
					case "ArrowRight":
						e.preventDefault();
						goTo(page + 1);
						break;
					case "Home":
						e.preventDefault();
						goTo(1);
						break;
					case "End":
						e.preventDefault();
						goTo(totalPages);
						break;
					default: return;
				}
			});
			render();
		}
	});
})();
//#endregion
//#region src/js/components/password.js
(function() {
	if (!window.Brut) return;
	var idCounter = 0;
	Brut.register("password", {
		selector: "[data-brut=\"password\"]",
		init: function(el) {
			var input = el.querySelector("input");
			var btn = el.querySelector(".brut-password__toggle");
			if (!input || !btn) return;
			var acOverride = el.getAttribute("data-brut-autocomplete");
			if (acOverride !== "off" && !input.hasAttribute("autocomplete")) input.setAttribute("autocomplete", acOverride || "current-password");
			if (!input.id) input.id = "brut-password-" + ++idCounter;
			btn.setAttribute("type", "button");
			btn.setAttribute("aria-pressed", "false");
			btn.setAttribute("aria-controls", input.id);
			btn.textContent = input.type === "password" ? "SHOW" : "HIDE";
			btn.setAttribute("aria-label", input.type === "password" ? "Show password" : "Hide password");
			btn.addEventListener("click", function() {
				var hidden = input.type === "password";
				input.type = hidden ? "text" : "password";
				btn.textContent = hidden ? "HIDE" : "SHOW";
				btn.setAttribute("aria-pressed", hidden ? "true" : "false");
				btn.setAttribute("aria-label", hidden ? "Hide password" : "Show password");
			});
		}
	});
})();
//#endregion
//#region src/js/components/popover.js
(function() {
	if (!window.Brut) return;
	var idCounter = 0;
	var closeByEl = /* @__PURE__ */ new WeakMap();
	document.addEventListener("keydown", function(e) {
		if (e.key !== "Escape") return;
		document.querySelectorAll("[data-brut=\"popover\"]:not([hidden])").forEach(function(el) {
			if (!el.isConnected) return;
			var c = closeByEl.get(el);
			if (c) c();
		});
	});
	Brut.register("popover", {
		selector: "[data-brut=\"popover\"]",
		init: function(el) {
			if (!el.id) el.id = "brut-popover-" + ++idCounter;
			var triggers = document.querySelectorAll("[data-brut-popover-open=\"" + el.id + "\"]");
			var lastTrigger = null;
			var SIDES = [
				"top",
				"bottom",
				"left",
				"right"
			];
			var currentSide = null;
			function applySideClass(side) {
				if (currentSide === side) return;
				if (currentSide) el.classList.remove("brut-popover--" + currentSide);
				el.classList.add("brut-popover--" + side);
				currentSide = side;
			}
			function position() {
				if (!lastTrigger) return;
				var preferredSide = el.getAttribute("data-position") || "bottom";
				if (SIDES.indexOf(preferredSide) === -1) preferredSide = "bottom";
				var gap = 8;
				var side = Brut.flipSide(lastTrigger, el, preferredSide, gap);
				var r = lastTrigger.getBoundingClientRect();
				var bH = el.offsetHeight;
				var bW = el.offsetWidth;
				var top = 0, left = 0;
				switch (side) {
					case "top":
						top = r.top - bH - gap;
						left = r.left;
						break;
					case "left":
						top = r.top;
						left = r.left - bW - gap;
						break;
					case "right":
						top = r.top;
						left = r.right + gap;
						break;
					default:
						top = r.bottom + gap;
						left = r.left;
						break;
				}
				el.style.position = "fixed";
				el.style.top = Math.round(top) + "px";
				el.style.left = Math.round(left) + "px";
				applySideClass(side);
			}
			function open(trigger) {
				lastTrigger = trigger || lastTrigger;
				el.removeAttribute("hidden");
				if (lastTrigger) lastTrigger.setAttribute("aria-expanded", "true");
				position();
				el.dispatchEvent(new CustomEvent("brut:open", {
					bubbles: true,
					detail: { value: true }
				}));
			}
			function close() {
				if (el.hasAttribute("hidden")) return;
				el.setAttribute("hidden", "");
				if (lastTrigger) lastTrigger.setAttribute("aria-expanded", "false");
				if (lastTrigger) try {
					lastTrigger.focus();
				} catch (e) {}
				el.dispatchEvent(new CustomEvent("brut:close", {
					bubbles: true,
					detail: { value: false }
				}));
			}
			closeByEl.set(el, close);
			triggers.forEach(function(t) {
				if (t.tagName === "BUTTON") t.setAttribute("type", "button");
				if (!t.hasAttribute("aria-haspopup")) t.setAttribute("aria-haspopup", "true");
				if (!t.hasAttribute("aria-expanded")) t.setAttribute("aria-expanded", "false");
				if (!t.hasAttribute("aria-controls")) t.setAttribute("aria-controls", el.id);
				t.addEventListener("click", function(e) {
					e.preventDefault();
					if (el.hasAttribute("hidden")) open(t);
					else close();
				});
			});
			el.querySelectorAll("[data-brut-close], .brut-popover__x").forEach(function(t) {
				if (t.tagName === "BUTTON") t.setAttribute("type", "button");
				t.addEventListener("click", function(e) {
					e.preventDefault();
					close();
				});
			});
			document.addEventListener("click", function(e) {
				if (!el.isConnected) return;
				if (el.hasAttribute("hidden")) return;
				if (el.contains(e.target)) return;
				for (var i = 0; i < triggers.length; i++) if (triggers[i].contains(e.target)) return;
				close();
			});
			window.addEventListener("resize", function() {
				if (!el.isConnected) return;
				if (!el.hasAttribute("hidden")) position();
			});
			window.addEventListener("scroll", function() {
				if (!el.isConnected) return;
				if (!el.hasAttribute("hidden")) position();
			}, {
				capture: true,
				passive: true
			});
		}
	});
})();
//#endregion
//#region src/js/components/progress.js
(function() {
	if (!window.Brut) return;
	Brut.register("progress", {
		selector: "[data-brut=\"progress\"]",
		init: function(el) {
			var label = el.querySelector(".brut-progress__label");
			var initial = parseFloat(el.getAttribute("data-brut-value")) || 0;
			var current = initial;
			function setValue(v) {
				v = Math.max(0, Math.min(100, parseFloat(v) || 0));
				current = v;
				el.style.setProperty("--progress", v);
				el.setAttribute("data-brut-value", v);
				el.setAttribute("aria-valuenow", Math.round(v));
				if (label) label.textContent = Math.round(v) + "%";
				el.dispatchEvent(new CustomEvent("brut:change", {
					bubbles: true,
					detail: { value: v }
				}));
			}
			function getValue() {
				return current;
			}
			el.setAttribute("role", "progressbar");
			el.setAttribute("aria-valuemin", "0");
			el.setAttribute("aria-valuemax", "100");
			setValue(initial);
			el.brutProgress = {
				setValue,
				getValue
			};
		}
	});
})();
//#endregion
//#region src/js/components/radio.js
(function() {
	if (!window.Brut) return;
	Brut.register("radio", {
		selector: "[data-brut=\"radio\"]",
		init: function(el) {
			var input = el.querySelector("input[type=\"radio\"]");
			var groupName = el.getAttribute("data-brut-name") || input && input.name;
			function sync() {
				var on = input ? input.checked : el.classList.contains("brut-radio--on");
				el.classList.toggle("brut-radio--on", on);
				el.setAttribute("aria-checked", on ? "true" : "false");
			}
			if (!el.hasAttribute("role")) el.setAttribute("role", "radio");
			if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "0");
			el.addEventListener("click", function(e) {
				if (e.target === input) return;
				if (input) {
					input.checked = true;
					input.dispatchEvent(new Event("change", { bubbles: true }));
				} else if (groupName) {
					var siblings = document.querySelectorAll("[data-brut=\"radio\"][data-brut-name=\"" + groupName + "\"]");
					for (var i = 0; i < siblings.length; i++) {
						siblings[i].classList.remove("brut-radio--on");
						siblings[i].setAttribute("aria-checked", "false");
					}
					el.classList.add("brut-radio--on");
					el.setAttribute("aria-checked", "true");
				}
				sync();
				el.dispatchEvent(new CustomEvent("brut:change", { detail: { value: input ? input.value : el.getAttribute("data-value") } }));
			});
			el.addEventListener("keydown", function(e) {
				if (e.key === " " || e.key === "Enter") {
					e.preventDefault();
					el.click();
				}
			});
			if (input) document.addEventListener("change", function(e) {
				if (e.target && e.target.type === "radio" && e.target.name === input.name) sync();
			});
			var form = el.closest("form");
			if (form) form.addEventListener("reset", function() {
				if (!el.isConnected) return;
				setTimeout(sync, 0);
			});
			sync();
		}
	});
})();
//#endregion
//#region src/js/components/range-dual.js
(function() {
	if (!window.Brut) return;
	function clamp(v, lo, hi) {
		return v < lo ? lo : v > hi ? hi : v;
	}
	Brut.register("range-dual", {
		selector: "[data-brut=\"range-dual\"]",
		init: function(el) {
			var min = parseFloat(el.getAttribute("data-brut-min")) || 0;
			var max = parseFloat(el.getAttribute("data-brut-max"));
			if (isNaN(max)) max = 100;
			var step = parseFloat(el.getAttribute("data-brut-step")) || 1;
			var vMin = parseFloat(el.getAttribute("data-brut-value-min"));
			var vMax = parseFloat(el.getAttribute("data-brut-value-max"));
			if (isNaN(vMin)) vMin = min;
			if (isNaN(vMax)) vMax = max;
			var nameMin = el.getAttribute("data-brut-name-min");
			var nameMax = el.getAttribute("data-brut-name-max");
			var prefix = el.getAttribute("data-brut-prefix") || "";
			var suffix = el.getAttribute("data-brut-suffix") || "";
			var track = el.querySelector(".brut-range-dual__track");
			if (!track) {
				track = document.createElement("div");
				track.className = "brut-range-dual__track";
				el.appendChild(track);
			} else track.innerHTML = "";
			var fill = document.createElement("div");
			fill.className = "brut-range-dual__fill";
			track.appendChild(fill);
			var thumbMin = el.querySelector(".brut-range-dual__thumb:not(.brut-range-dual__thumb--max)");
			if (!thumbMin) {
				thumbMin = document.createElement("button");
				thumbMin.className = "brut-range-dual__thumb";
				el.appendChild(thumbMin);
			}
			if (!thumbMin.hasAttribute("type")) thumbMin.setAttribute("type", "button");
			thumbMin.setAttribute("role", "slider");
			thumbMin.setAttribute("aria-label", "Minimum");
			var thumbMax = el.querySelector(".brut-range-dual__thumb--max");
			if (!thumbMax) {
				thumbMax = document.createElement("button");
				thumbMax.className = "brut-range-dual__thumb brut-range-dual__thumb--max";
				el.appendChild(thumbMax);
			}
			if (!thumbMax.hasAttribute("type")) thumbMax.setAttribute("type", "button");
			thumbMax.setAttribute("role", "slider");
			thumbMax.setAttribute("aria-label", "Maximum");
			var hMin = null, hMax = null;
			if (nameMin) {
				hMin = el.querySelector("input[type=\"hidden\"][data-brut-role=\"min\"]");
				if (!hMin) {
					hMin = document.createElement("input");
					hMin.type = "hidden";
					hMin.setAttribute("data-brut-role", "min");
					hMin.name = nameMin;
					el.appendChild(hMin);
				}
			}
			if (nameMax) {
				hMax = el.querySelector("input[type=\"hidden\"][data-brut-role=\"max\"]");
				if (!hMax) {
					hMax = document.createElement("input");
					hMax.type = "hidden";
					hMax.setAttribute("data-brut-role", "max");
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
			function pct(v) {
				return (v - min) / (max - min) * 100;
			}
			function render() {
				var pMin = pct(vMin);
				var pMax = pct(vMax);
				thumbMin.style.left = pMin + "%";
				thumbMax.style.left = pMax + "%";
				fill.style.left = pMin + "%";
				fill.style.width = pMax - pMin + "%";
				thumbMin.setAttribute("aria-valuemin", String(min));
				thumbMin.setAttribute("aria-valuemax", String(vMax));
				thumbMin.setAttribute("aria-valuenow", String(vMin));
				thumbMin.setAttribute("aria-valuetext", prefix + String(vMin) + suffix);
				thumbMax.setAttribute("aria-valuemin", String(vMin));
				thumbMax.setAttribute("aria-valuemax", String(max));
				thumbMax.setAttribute("aria-valuenow", String(vMax));
				thumbMax.setAttribute("aria-valuetext", prefix + String(vMax) + suffix);
				if (hMin) hMin.value = String(vMin);
				if (hMax) hMax.value = String(vMax);
			}
			function emit() {
				el.dispatchEvent(new CustomEvent("brut:change", { detail: { value: {
					min: vMin,
					max: vMax
				} } }));
			}
			function setMin(v) {
				var nv = clamp(snap(v), min, vMax);
				if (nv !== vMin) {
					vMin = nv;
					render();
					emit();
				}
			}
			function setMax(v) {
				var nv = clamp(snap(v), vMin, max);
				if (nv !== vMax) {
					vMax = nv;
					render();
					emit();
				}
			}
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
					if (typeof x !== "number" && ev.touches && ev.touches[0]) x = ev.touches[0].clientX;
					if (typeof x !== "number") return;
					var v = valueFromClientX(x);
					if (isMax) setMax(v);
					else setMin(v);
				}
				function onUp() {
					document.removeEventListener("pointermove", onMove);
					document.removeEventListener("pointerup", onUp);
					document.removeEventListener("pointercancel", onUp);
				}
				document.addEventListener("pointermove", onMove);
				document.addEventListener("pointerup", onUp);
				document.addEventListener("pointercancel", onUp);
			}
			thumbMin.addEventListener("pointerdown", function(e) {
				startDrag(thumbMin, false, e);
			});
			thumbMax.addEventListener("pointerdown", function(e) {
				startDrag(thumbMax, true, e);
			});
			function keys(thumb, isMax) {
				thumb.addEventListener("keydown", function(e) {
					var bump = 0;
					if (e.key === "ArrowLeft" || e.key === "ArrowDown") bump = -step;
					else if (e.key === "ArrowRight" || e.key === "ArrowUp") bump = step;
					else if (e.key === "PageDown") bump = -step * 10;
					else if (e.key === "PageUp") bump = step * 10;
					else if (e.key === "Home") {
						e.preventDefault();
						if (isMax) setMax(vMin);
						else setMin(min);
						return;
					} else if (e.key === "End") {
						e.preventDefault();
						if (isMax) setMax(max);
						else setMin(vMax);
						return;
					}
					if (bump !== 0) {
						e.preventDefault();
						if (isMax) setMax(vMax + bump);
						else setMin(vMin + bump);
					}
				});
			}
			keys(thumbMin, false);
			keys(thumbMax, true);
			track.addEventListener("pointerdown", function(e) {
				if (e.target !== track && e.target !== fill) return;
				var v = valueFromClientX(e.clientX);
				if (Math.abs(v - vMin) <= Math.abs(v - vMax)) {
					setMin(v);
					startDrag(thumbMin, false, e);
				} else {
					setMax(v);
					startDrag(thumbMax, true, e);
				}
			});
			vMin = snap(vMin);
			vMax = snap(vMax);
			if (vMin > vMax) {
				var t = vMin;
				vMin = vMax;
				vMax = t;
			}
			render();
			var initialMin = vMin;
			var initialMax = vMax;
			var form = el.closest("form");
			if (form) form.addEventListener("reset", function() {
				if (!el.isConnected) return;
				setTimeout(function() {
					vMin = initialMin;
					vMax = initialMax;
					render();
				}, 0);
			});
		}
	});
})();
//#endregion
//#region src/js/components/rating.js
(function() {
	if (!window.Brut) return;
	Brut.register("rating", {
		selector: "[data-brut=\"rating\"]",
		init: function(el) {
			var stars = el.querySelectorAll(".brut-rating__star");
			if (!stars.length) return;
			var max = stars.length;
			var hidden = el.querySelector("input[type=\"hidden\"]");
			if (!hidden && el.getAttribute("data-brut-name")) {
				hidden = document.createElement("input");
				hidden.type = "hidden";
				hidden.name = el.getAttribute("data-brut-name");
				el.appendChild(hidden);
			}
			var initial = parseInt(hidden && hidden.value || el.getAttribute("data-brut-value") || "0", 10);
			var current = isFinite(initial) ? initial : 0;
			if (hidden) hidden.value = String(current);
			el.setAttribute("role", "radiogroup");
			if (!el.hasAttribute("aria-label") && !el.hasAttribute("aria-labelledby")) el.setAttribute("aria-label", "Rating");
			var labelStar = el.getAttribute("data-brut-label-star");
			function starLabel(i) {
				var n = i + 1;
				if (labelStar) return n + " " + labelStar;
				return n + " star" + (n === 1 ? "" : "s");
			}
			function paint(n) {
				stars.forEach(function(s, i) {
					s.classList.toggle("brut-rating__star--on", i < n);
					s.setAttribute("aria-checked", i + 1 === n ? "true" : "false");
				});
			}
			function updateTabindex(focusIndex) {
				stars.forEach(function(s, i) {
					s.setAttribute("tabindex", i === focusIndex ? "0" : "-1");
				});
			}
			function focusedIndex() {
				for (var i = 0; i < stars.length; i++) if (stars[i].getAttribute("tabindex") === "0") return i;
				return current > 0 ? current - 1 : 0;
			}
			function set(n) {
				n = Math.max(0, Math.min(max, n));
				current = n;
				if (hidden) {
					hidden.value = String(current);
					hidden.dispatchEvent(new Event("change", { bubbles: true }));
				}
				paint(current);
				updateTabindex(current > 0 ? current - 1 : 0);
				el.dispatchEvent(new CustomEvent("brut:change", { detail: { value: current } }));
			}
			stars.forEach(function(star, i) {
				star.setAttribute("type", "button");
				if (!star.hasAttribute("role")) star.setAttribute("role", "radio");
				if (!star.hasAttribute("aria-label")) star.setAttribute("aria-label", starLabel(i));
				star.addEventListener("mouseenter", function() {
					paint(i + 1);
				});
				star.addEventListener("focus", function() {
					paint(i + 1);
				});
				star.addEventListener("click", function() {
					set(current === i + 1 ? 0 : i + 1);
				});
				star.addEventListener("keydown", function(e) {
					var idx = i;
					var nextIdx = null;
					switch (e.key) {
						case "ArrowRight":
						case "ArrowDown":
							nextIdx = (idx + 1) % max;
							break;
						case "ArrowLeft":
						case "ArrowUp":
							nextIdx = (idx - 1 + max) % max;
							break;
						case "Home":
							nextIdx = 0;
							break;
						case "End":
							nextIdx = max - 1;
							break;
						default: return;
					}
					e.preventDefault();
					set(nextIdx + 1);
					updateTabindex(nextIdx);
					stars[nextIdx].focus();
				});
			});
			updateTabindex(current > 0 ? current - 1 : 0);
			el.addEventListener("keydown", function(e) {
				if (e.target !== el) return;
				var idx = focusedIndex();
				var nextIdx = null;
				switch (e.key) {
					case "ArrowRight":
					case "ArrowDown":
						nextIdx = (idx + 1) % max;
						break;
					case "ArrowLeft":
					case "ArrowUp":
						nextIdx = (idx - 1 + max) % max;
						break;
					case "Home":
						nextIdx = 0;
						break;
					case "End":
						nextIdx = max - 1;
						break;
					default: return;
				}
				e.preventDefault();
				set(nextIdx + 1);
				updateTabindex(nextIdx);
				stars[nextIdx].focus();
			});
			el.addEventListener("mouseleave", function() {
				paint(current);
			});
			el.addEventListener("focusout", function() {
				paint(current);
			});
			var form = el.closest("form");
			if (form) form.addEventListener("reset", function() {
				if (!el.isConnected) return;
				setTimeout(function() {
					current = Math.max(0, Math.min(max, isFinite(initial) ? initial : 0));
					if (hidden) hidden.value = String(current);
					paint(current);
					updateTabindex(current > 0 ? current - 1 : 0);
				}, 0);
			});
			paint(current);
		}
	});
})();
//#endregion
//#region src/js/components/search.js
(function() {
	if (!window.Brut) return;
	Brut.register("search", {
		selector: "[data-brut=\"search\"]",
		init: function(el) {
			var input = el.querySelector("input");
			var btn = el.querySelector(".brut-search__clear");
			if (!input) return;
			if (!el.hasAttribute("role")) el.setAttribute("role", "search");
			if (!(input.hasAttribute("aria-label") || input.hasAttribute("aria-labelledby") || input.id && document.querySelector("label[for=\"" + input.id + "\"]"))) input.setAttribute("aria-label", "Search");
			function refresh() {
				el.classList.toggle("brut-search--has-value", !!input.value);
			}
			function emit() {
				el.dispatchEvent(new CustomEvent("brut:change", {
					bubbles: true,
					detail: { value: input.value }
				}));
			}
			var debounceMs = parseInt(el.getAttribute("data-brut-debounce"), 10);
			if (isNaN(debounceMs) || debounceMs < 0) debounceMs = 0;
			var debounceTimer = null;
			function runDebounced(fn) {
				if (debounceMs === 0) {
					fn();
					return;
				}
				if (debounceTimer) clearTimeout(debounceTimer);
				debounceTimer = setTimeout(function() {
					debounceTimer = null;
					fn();
				}, debounceMs);
			}
			input.addEventListener("input", function() {
				runDebounced(function() {
					refresh();
					emit();
				});
			});
			if (btn) {
				btn.setAttribute("type", "button");
				btn.addEventListener("click", function() {
					input.value = "";
					input.focus();
					refresh();
					emit();
				});
			}
			refresh();
		}
	});
})();
//#endregion
//#region src/js/components/segmented.js
(function() {
	if (!window.Brut) return;
	Brut.register("segmented", {
		selector: "[data-brut=\"segmented\"]",
		init: function(el) {
			var name = el.getAttribute("data-brut-name");
			var hidden = el.querySelector("input[type=\"hidden\"]");
			if (name && !hidden) {
				hidden = document.createElement("input");
				hidden.type = "hidden";
				hidden.name = name;
				el.appendChild(hidden);
			}
			el.setAttribute("role", "tablist");
			var btns = Array.prototype.slice.call(el.querySelectorAll(".brut-segmented__btn"));
			function select(btn, focusIt) {
				btns.forEach(function(b) {
					var on = b === btn;
					b.classList.toggle("brut-segmented__btn--on", on);
					b.setAttribute("aria-selected", on ? "true" : "false");
					b.setAttribute("tabindex", on ? "0" : "-1");
				});
				var value = btn.getAttribute("data-value") || btn.textContent.trim();
				if (hidden) hidden.value = value;
				if (focusIt) btn.focus();
				el.dispatchEvent(new CustomEvent("brut:change", { detail: { value } }));
			}
			btns.forEach(function(btn) {
				btn.setAttribute("type", "button");
				btn.setAttribute("role", "tab");
				btn.addEventListener("click", function() {
					select(btn);
				});
			});
			el.addEventListener("keydown", function(e) {
				var t = e.target;
				if (!t || !t.classList || !t.classList.contains("brut-segmented__btn")) return;
				var i = btns.indexOf(t);
				if (i < 0) return;
				var next = null;
				switch (e.key) {
					case "ArrowLeft":
					case "ArrowUp":
						next = btns[(i - 1 + btns.length) % btns.length];
						break;
					case "ArrowRight":
					case "ArrowDown":
						next = btns[(i + 1) % btns.length];
						break;
					case "Home":
						next = btns[0];
						break;
					case "End":
						next = btns[btns.length - 1];
						break;
					default: return;
				}
				e.preventDefault();
				select(next, true);
			});
			var initial = el.querySelector(".brut-segmented__btn--on") || btns[0];
			if (initial) {
				btns.forEach(function(b) {
					b.setAttribute("tabindex", b === initial ? "0" : "-1");
					b.setAttribute("aria-selected", b === initial ? "true" : "false");
				});
				if (hidden && !hidden.value) hidden.value = initial.getAttribute("data-value") || initial.textContent.trim();
			}
			var form = el.closest("form");
			if (form && initial) form.addEventListener("reset", function() {
				if (!el.isConnected) return;
				setTimeout(function() {
					select(initial);
				}, 0);
			});
		}
	});
})();
//#endregion
//#region src/js/components/sidebar.js
(function() {
	if (!window.Brut) return;
	Brut.register("sidebar", {
		selector: "[data-brut=\"sidebar\"]",
		init: function(el) {
			el.querySelectorAll("button.brut-sidebar__group-title").forEach(function(btn) {
				btn.setAttribute("type", "button");
				var group = btn.closest(".brut-sidebar__group");
				if (!group) return;
				var initiallyClosed = group.classList.contains("brut-sidebar__group--closed");
				btn.setAttribute("aria-expanded", initiallyClosed ? "false" : "true");
				btn.addEventListener("click", function(e) {
					e.preventDefault();
					var willClose = !group.classList.contains("brut-sidebar__group--closed");
					group.classList.toggle("brut-sidebar__group--closed", willClose);
					btn.setAttribute("aria-expanded", willClose ? "false" : "true");
					var open = !willClose;
					el.dispatchEvent(new CustomEvent("brut:change", { detail: {
						value: open,
						group,
						closed: willClose
					} }));
					el.dispatchEvent(new CustomEvent(open ? "brut:open" : "brut:close", { detail: {
						value: open,
						group
					} }));
				});
			});
		}
	});
})();
//#endregion
//#region src/js/components/stepper.js
(function() {
	if (!window.Brut) return;
	Brut.register("stepper", {
		selector: "[data-brut=\"stepper\"]",
		init: function(el) {
			var input = el.querySelector("input");
			if (!input) return;
			if (!input.hasAttribute("inputmode")) {
				var stepAttr = input.getAttribute("step") || "";
				input.setAttribute("inputmode", stepAttr.indexOf(".") !== -1 ? "decimal" : "numeric");
			}
			function read(attr, fallback) {
				var v = input.getAttribute(attr);
				return v === null || v === "" ? fallback : parseFloat(v);
			}
			function syncAria() {
				el.setAttribute("aria-valuenow", input.value);
			}
			var programmatic = false;
			function emitChange() {
				el.dispatchEvent(new CustomEvent("brut:change", {
					detail: { value: Number(input.value) },
					bubbles: true
				}));
			}
			function clampAndDispatch(v) {
				var step = read("step", 1) || 1;
				var min = read("min", -Infinity);
				var max = read("max", Infinity);
				v = Math.min(max, Math.max(min, v));
				if (isFinite(min)) v = min + Math.round((v - min) / step) * step;
				v = parseFloat(v.toFixed(10));
				input.value = v;
				syncAria();
				programmatic = true;
				input.dispatchEvent(new Event("input", { bubbles: true }));
				input.dispatchEvent(new Event("change", { bubbles: true }));
				programmatic = false;
				emitChange();
			}
			function bump(mult) {
				var step = read("step", 1) || 1;
				var v = parseFloat(input.value);
				if (isNaN(v)) v = read("min", 0);
				clampAndDispatch(v + mult * step);
			}
			el.querySelectorAll(".brut-stepper__btn").forEach(function(b, i) {
				b.setAttribute("type", "button");
				var dirAttr = b.getAttribute("data-brut-step");
				var dir = dirAttr === "down" ? -1 : dirAttr === "up" ? 1 : i === 0 ? -1 : 1;
				b.addEventListener("click", function() {
					bump(dir);
				});
			});
			el.setAttribute("role", "spinbutton");
			var minAttr = input.getAttribute("min");
			var maxAttr = input.getAttribute("max");
			if (minAttr !== null) el.setAttribute("aria-valuemin", minAttr);
			if (maxAttr !== null) el.setAttribute("aria-valuemax", maxAttr);
			syncAria();
			input.addEventListener("input", syncAria);
			input.addEventListener("change", function() {
				if (programmatic) return;
				emitChange();
			});
			input.addEventListener("keydown", function(e) {
				var mult = 0;
				switch (e.key) {
					case "ArrowUp":
						mult = 1;
						break;
					case "ArrowDown":
						mult = -1;
						break;
					case "PageUp":
						mult = 10;
						break;
					case "PageDown":
						mult = -10;
						break;
					default: return;
				}
				e.preventDefault();
				bump(mult);
			});
			var form = el.closest("form");
			if (form) form.addEventListener("reset", function() {
				if (!el.isConnected) return;
				setTimeout(syncAria, 0);
			});
		}
	});
})();
//#endregion
//#region src/js/components/switch.js
(function() {
	if (!window.Brut) return;
	Brut.register("switch", {
		selector: "[data-brut=\"switch\"]",
		init: function(el) {
			var input = el.querySelector("input[type=\"checkbox\"]");
			function sync() {
				var on = input ? input.checked : el.classList.contains("brut-switch--on");
				el.classList.toggle("brut-switch--on", on);
				el.setAttribute("aria-checked", on ? "true" : "false");
			}
			if (!el.hasAttribute("role")) el.setAttribute("role", "switch");
			if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "0");
			function emit() {
				el.dispatchEvent(new CustomEvent("brut:change", { detail: { value: el.classList.contains("brut-switch--on") } }));
			}
			el.addEventListener("click", function(e) {
				if (e.target === input) return;
				e.preventDefault();
				if (input) {
					input.checked = !input.checked;
					input.dispatchEvent(new Event("change", { bubbles: true }));
				} else {
					el.classList.toggle("brut-switch--on");
					sync();
					emit();
				}
			});
			el.addEventListener("keydown", function(e) {
				if (e.key === " " || e.key === "Enter") {
					e.preventDefault();
					el.click();
				}
			});
			if (input) input.addEventListener("change", function() {
				sync();
				emit();
			});
			var form = el.closest("form");
			if (form) form.addEventListener("reset", function() {
				if (!el.isConnected) return;
				setTimeout(sync, 0);
			});
			sync();
		}
	});
})();
//#endregion
//#region src/js/components/table.js
(function() {
	if (!window.Brut) return;
	function compare(a, b, dir) {
		var na = parseFloat(a), nb = parseFloat(b);
		var bothNumeric = !isNaN(na) && !isNaN(nb) && String(na) === String(a).trim() && String(nb) === String(b).trim();
		var cmp;
		if (bothNumeric) cmp = na - nb;
		else cmp = String(a).localeCompare(String(b), void 0, {
			numeric: true,
			sensitivity: "base"
		});
		return dir === "descending" ? -cmp : cmp;
	}
	function sortBy(table, key, dir) {
		var thead = table.querySelector("thead");
		var tbody = table.querySelector("tbody");
		if (!tbody) return;
		var headers = thead ? thead.querySelectorAll(".brut-table__cell--sortable") : [];
		var sortIndex = -1;
		for (var i = 0; i < headers.length; i++) {
			var h = headers[i];
			var isThis = h.getAttribute("data-sort-key") === key;
			var thDir = isThis ? dir : "none";
			h.classList.toggle("brut-table__cell--sorted", isThis && dir === "ascending");
			h.classList.toggle("brut-table__cell--sorted-desc", isThis && dir === "descending");
			h.setAttribute("aria-sort", thDir);
			h.setAttribute("data-sort-direction", thDir);
		}
		var headerCells = thead ? thead.querySelectorAll(".brut-table__cell") : [];
		for (var k = 0; k < headerCells.length; k++) if (headerCells[k].getAttribute("data-sort-key") === key) {
			sortIndex = k;
			break;
		}
		var rows = Array.prototype.slice.call(tbody.querySelectorAll("tr"));
		rows.sort(function(ra, rb) {
			var ca = ra.children[sortIndex];
			var cb = rb.children[sortIndex];
			return compare(ca ? ca.getAttribute("data-sort-value") !== null ? ca.getAttribute("data-sort-value") : (ca.textContent || "").trim() : "", cb ? cb.getAttribute("data-sort-value") !== null ? cb.getAttribute("data-sort-value") : (cb.textContent || "").trim() : "", dir);
		});
		rows.forEach(function(r) {
			tbody.appendChild(r);
		});
	}
	Brut.register("table", {
		selector: "[data-brut=\"table\"]",
		init: function(el) {
			var thead = el.querySelector("thead");
			var tbody = el.querySelector("tbody");
			if (!thead) return;
			var emptyEl = el.querySelector("[data-brut-role=\"empty-state\"]");
			function syncEmpty() {
				if (!emptyEl || !tbody) return;
				var rows = tbody.children;
				var visible = 0;
				for (var i = 0; i < rows.length; i++) if (!rows[i].hasAttribute("hidden")) visible++;
				if (visible === 0) {
					emptyEl.hidden = false;
					el.hidden = true;
				} else {
					emptyEl.hidden = true;
					el.hidden = false;
				}
			}
			if (emptyEl && tbody && typeof MutationObserver === "function") {
				var mo = new MutationObserver(function() {
					if (!el.isConnected) {
						mo.disconnect();
						return;
					}
					syncEmpty();
				});
				mo.observe(tbody, {
					childList: true,
					attributes: true,
					subtree: true,
					attributeFilter: ["hidden"]
				});
			}
			var sortables = thead.querySelectorAll(".brut-table__cell--sortable");
			for (var i = 0; i < sortables.length; i++) (function(h) {
				if (!h.hasAttribute("aria-sort")) h.setAttribute("aria-sort", "none");
				if (!h.hasAttribute("role")) h.setAttribute("role", "columnheader");
				if (!h.hasAttribute("tabindex")) h.setAttribute("tabindex", "0");
				function trigger() {
					var key = h.getAttribute("data-sort-key");
					if (!key) return;
					var direction = h.getAttribute("aria-sort") === "ascending" ? "descending" : "ascending";
					sortBy(el, key, direction);
					syncEmpty();
					el.dispatchEvent(new CustomEvent("brut:sort", {
						bubbles: true,
						detail: {
							key,
							direction,
							value: {
								key,
								direction
							}
						}
					}));
				}
				h.addEventListener("click", trigger);
				h.addEventListener("keydown", function(e) {
					if (e.key === " " || e.key === "Enter") {
						e.preventDefault();
						trigger();
					}
				});
			})(sortables[i]);
			var selectAll = el.querySelector("[data-brut-select-all]");
			if (selectAll) {
				if (selectAll.tagName === "BUTTON") selectAll.setAttribute("type", "button");
				var selectAllInput = selectAll.querySelector("input[type=\"checkbox\"]");
				function setRowChecked(row, checked) {
					var input = row.querySelector("input[type=\"checkbox\"]");
					if (input) {
						if (input.checked !== checked) {
							input.checked = checked;
							input.dispatchEvent(new Event("change", { bubbles: true }));
						}
					}
					row.classList.toggle("brut-checkbox--on", checked);
					row.setAttribute("aria-checked", checked ? "true" : "false");
				}
				function applyAll(checked) {
					var rows = el.querySelectorAll("[data-brut-row-select]");
					for (var j = 0; j < rows.length; j++) setRowChecked(rows[j], checked);
				}
				function isOn() {
					if (selectAllInput) return selectAllInput.checked;
					return selectAll.classList.contains("brut-checkbox--on");
				}
				function syncHeader(on) {
					if (selectAllInput) selectAllInput.checked = on;
					selectAll.classList.toggle("brut-checkbox--on", on);
					selectAll.setAttribute("aria-checked", on ? "true" : "false");
				}
				selectAll.addEventListener("click", function(e) {
					if (e.target === selectAllInput) return;
					var next = !isOn();
					syncHeader(next);
					applyAll(next);
					syncEmpty();
					el.dispatchEvent(new CustomEvent("brut:change", { detail: {
						value: next,
						selectAll: true
					} }));
				});
				selectAll.addEventListener("keydown", function(e) {
					if (e.key === " " || e.key === "Enter") {
						e.preventDefault();
						selectAll.click();
					}
				});
				if (!selectAll.hasAttribute("role")) selectAll.setAttribute("role", "checkbox");
				if (!selectAll.hasAttribute("tabindex")) selectAll.setAttribute("tabindex", "0");
				syncHeader(isOn());
			}
			var pager = el.querySelector("[data-brut=\"pagination\"]");
			if (!pager && el.parentElement) pager = el.parentElement.querySelector("[data-brut=\"pagination\"]");
			if (pager && tbody) {
				var allRows = Array.prototype.slice.call(tbody.querySelectorAll("tr"));
				if (!pager.hasAttribute("data-total")) pager.setAttribute("data-total", String(allRows.length));
				if (!pager.hasAttribute("data-page-size")) pager.setAttribute("data-page-size", String(allRows.length || 1));
				function applyPage(page, pageSize) {
					var rows = Array.prototype.slice.call(tbody.querySelectorAll("tr"));
					var start = (page - 1) * pageSize;
					var end = start + pageSize;
					for (var i = 0; i < rows.length; i++) rows[i].hidden = i < start || i >= end;
				}
				pager.addEventListener("brut:change", function(e) {
					if (!e.target || !e.target.matches || !e.target.matches("[data-brut=\"pagination\"]")) return;
					var d = e.detail || {};
					if (typeof d.page === "number" && typeof d.pageSize === "number") applyPage(d.page, d.pageSize);
				});
				applyPage(parseInt(pager.getAttribute("data-page"), 10) || 1, parseInt(pager.getAttribute("data-page-size"), 10) || allRows.length || 1);
			}
			syncEmpty();
		}
	});
})();
//#endregion
//#region src/js/components/tabs.js
(function() {
	if (!window.Brut) return;
	var tabIdCounter = 0;
	var panelIdCounter = 0;
	Brut.register("tabs", {
		selector: "[data-brut=\"tabs\"]",
		init: function(el) {
			var rootSel = el.getAttribute("data-brut-panels");
			var panelRoot = rootSel ? document.querySelector(rootSel) : el.parentElement;
			var panels = {};
			if (panelRoot) panelRoot.querySelectorAll("[data-brut-panel]").forEach(function(p) {
				panels[p.getAttribute("data-brut-panel")] = p;
				p.setAttribute("role", "tabpanel");
				if (!p.id) p.id = "brut-tabpanel-" + ++panelIdCounter;
			});
			el.setAttribute("role", "tablist");
			function tabs() {
				return Array.prototype.slice.call(el.querySelectorAll(".brut-tab"));
			}
			function activate(btn, focusIt) {
				tabs().forEach(function(b) {
					var on = b === btn;
					b.classList.toggle("brut-tab--on", on);
					b.setAttribute("aria-selected", on ? "true" : "false");
					b.setAttribute("tabindex", on ? "0" : "-1");
				});
				var key = btn.getAttribute("data-brut-tab");
				Object.keys(panels).forEach(function(k) {
					panels[k].hidden = k !== key;
				});
				if (focusIt) btn.focus();
				el.dispatchEvent(new CustomEvent("brut:change", { detail: { value: key } }));
			}
			tabs().forEach(function(btn) {
				btn.setAttribute("type", "button");
				btn.setAttribute("role", "tab");
				if (!btn.id) btn.id = "brut-tab-" + ++tabIdCounter;
				var p = panels[btn.getAttribute("data-brut-tab")];
				if (p) {
					p.setAttribute("aria-labelledby", btn.id);
					btn.setAttribute("aria-controls", p.id);
				}
				btn.addEventListener("click", function() {
					activate(btn);
				});
			});
			el.addEventListener("keydown", function(e) {
				var t = e.target;
				if (!t || !t.classList || !t.classList.contains("brut-tab")) return;
				var all = tabs();
				var i = all.indexOf(t);
				if (i < 0) return;
				var next = null;
				switch (e.key) {
					case "ArrowLeft":
						next = all[(i - 1 + all.length) % all.length];
						break;
					case "ArrowRight":
						next = all[(i + 1) % all.length];
						break;
					case "Home":
						next = all[0];
						break;
					case "End":
						next = all[all.length - 1];
						break;
					default: return;
				}
				e.preventDefault();
				activate(next, true);
			});
			var initial = el.querySelector(".brut-tab--on") || el.querySelector(".brut-tab");
			if (initial) activate(initial);
		}
	});
})();
//#endregion
//#region src/js/components/tag-input.js
(function() {
	if (!window.Brut) return;
	Brut.register("tag-input", {
		selector: "[data-brut=\"tag-input\"]",
		init: function(el) {
			var field = el.querySelector(".brut-tag-input__field");
			if (!field) return;
			var hidden = el.querySelector("input[type=\"hidden\"]");
			if (!hidden) {
				hidden = document.createElement("input");
				hidden.type = "hidden";
				hidden.name = el.getAttribute("data-brut-name") || "tags";
				el.appendChild(hidden);
			}
			if (!field.hasAttribute("aria-label") && !field.hasAttribute("aria-labelledby")) {
				var labelText = el.getAttribute("data-brut-label") || "Tags";
				field.setAttribute("aria-label", labelText);
			}
			var live = document.createElement("span");
			live.setAttribute("aria-live", "polite");
			live.setAttribute("aria-atomic", "true");
			live.style.cssText = "position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0;";
			el.appendChild(live);
			function announce(msg) {
				live.textContent = msg;
				setTimeout(function() {
					live.textContent = "";
				}, 1e3);
			}
			function values() {
				var out = [];
				el.querySelectorAll(".brut-tag").forEach(function(t) {
					var v = t.getAttribute("data-value");
					if (!v) v = (t.textContent || "").replace("×", "").trim();
					if (v) out.push(v);
				});
				return out;
			}
			function sync() {
				var current = values();
				hidden.value = current.join(",");
				el.dispatchEvent(new CustomEvent("brut:change", { detail: {
					value: current,
					tags: current
				} }));
			}
			function tagValueOf(node) {
				var v = node && node.getAttribute && node.getAttribute("data-value");
				if (!v && node) v = (node.textContent || "").replace("×", "").trim();
				return v || "";
			}
			function bindClose(btn) {
				if (!btn.hasAttribute("type")) btn.setAttribute("type", "button");
				var parentTag = btn.parentElement;
				var tagValue = tagValueOf(parentTag);
				if (tagValue) btn.setAttribute("aria-label", "Remove " + tagValue);
				btn.addEventListener("click", function(e) {
					e.stopPropagation();
					var removedValue = tagValueOf(btn.parentElement);
					if (btn.parentElement) btn.parentElement.remove();
					if (removedValue) announce("Tag " + removedValue + " removed");
					sync();
					field.focus();
				});
			}
			function addTag(text) {
				text = (text || "").trim();
				if (!text) return;
				if (values().indexOf(text) !== -1) return;
				var tag = document.createElement("span");
				tag.className = "brut-tag";
				tag.setAttribute("data-value", text);
				tag.appendChild(document.createTextNode(text + " "));
				var x = document.createElement("button");
				x.className = "brut-tag__x";
				x.textContent = "×";
				x.setAttribute("aria-label", "Remove " + text);
				tag.appendChild(x);
				bindClose(x);
				el.insertBefore(tag, field);
				announce("Tag " + text + " added");
				sync();
			}
			field.addEventListener("keydown", function(e) {
				if (e.key === "Enter" || e.key === ",") {
					e.preventDefault();
					addTag(field.value);
					field.value = "";
				} else if (e.key === "Backspace" && !field.value) {
					var existing = el.querySelectorAll(".brut-tag");
					if (existing.length) {
						var last = existing[existing.length - 1];
						var removedValue = tagValueOf(last);
						last.remove();
						if (removedValue) announce("Tag " + removedValue + " removed");
						sync();
					}
				}
			});
			field.addEventListener("blur", function() {
				if (field.value.trim()) {
					addTag(field.value);
					field.value = "";
				}
			});
			el.querySelectorAll(".brut-tag .brut-tag__x").forEach(bindClose);
			el.addEventListener("click", function(e) {
				if (e.target === el) field.focus();
			});
			var form = el.closest("form");
			if (form) form.addEventListener("reset", function() {
				if (!el.isConnected) return;
				setTimeout(function() {
					el.querySelectorAll(".brut-tag").forEach(function(t) {
						t.remove();
					});
					field.value = "";
					sync();
				}, 0);
			});
			sync();
		}
	});
})();
//#endregion
//#region src/js/components/theme-switcher.js
(function() {
	if (!window.Brut) return;
	Brut.register("theme-switcher", {
		selector: "[data-brut=\"theme-switcher\"]",
		init: function(el) {
			var themes = (el.getAttribute("data-brut-themes") || "brutalist,corporate,minimal").split(",").map(function(s) {
				return s.trim();
			});
			el.setAttribute("role", "radiogroup");
			el.setAttribute("aria-label", "Theme");
			el.classList.add("brut-theme-switcher");
			var btns = [];
			function select(btn, focusIt) {
				var value = btn.getAttribute("data-value");
				btns.forEach(function(b) {
					var on = b === btn;
					b.classList.toggle("brut-theme-switcher__btn--on", on);
					b.setAttribute("aria-checked", on ? "true" : "false");
					b.setAttribute("tabindex", on ? "0" : "-1");
				});
				Brut.theme(value);
				if (focusIt) btn.focus();
				el.dispatchEvent(new CustomEvent("brut:change", { detail: { value } }));
			}
			themes.forEach(function(name) {
				var btn = document.createElement("button");
				btn.type = "button";
				btn.className = "brut-theme-switcher__btn";
				btn.setAttribute("role", "radio");
				btn.setAttribute("data-value", name);
				btn.textContent = name.charAt(0).toUpperCase() + name.slice(1);
				btn.addEventListener("click", function() {
					select(btn);
				});
				el.appendChild(btn);
				btns.push(btn);
			});
			el.addEventListener("keydown", function(e) {
				var t = e.target;
				if (!t || !t.classList.contains("brut-theme-switcher__btn")) return;
				var i = btns.indexOf(t);
				if (i < 0) return;
				var next = null;
				switch (e.key) {
					case "ArrowLeft":
					case "ArrowUp":
						next = btns[(i - 1 + btns.length) % btns.length];
						break;
					case "ArrowRight":
					case "ArrowDown":
						next = btns[(i + 1) % btns.length];
						break;
					case "Home":
						next = btns[0];
						break;
					case "End":
						next = btns[btns.length - 1];
						break;
					default: return;
				}
				e.preventDefault();
				select(next, true);
			});
			var current = Brut.theme();
			var initial = el.querySelector("[data-value=\"" + current + "\"]") || btns[0];
			if (initial) btns.forEach(function(b) {
				var on = b === initial;
				b.classList.toggle("brut-theme-switcher__btn--on", on);
				b.setAttribute("aria-checked", on ? "true" : "false");
				b.setAttribute("tabindex", on ? "0" : "-1");
			});
		}
	});
})();
//#endregion
//#region src/js/components/time.js
(function() {
	if (!window.Brut) return;
	function pad2(n) {
		return n < 10 ? "0" + n : "" + n;
	}
	function clamp(v, lo, hi) {
		return v < lo ? lo : v > hi ? hi : v;
	}
	Brut.register("time", {
		selector: "[data-brut=\"time\"]",
		init: function(el) {
			var field = el.querySelector(".brut-time__field") || el.querySelector("input[type=\"text\"], input[type=\"time\"], input:not([type])");
			if (!field) return;
			var hidden = el.querySelector("input[type=\"hidden\"]");
			if (!hidden && el.getAttribute("data-brut-name")) {
				hidden = document.createElement("input");
				hidden.type = "hidden";
				hidden.name = el.getAttribute("data-brut-name");
				el.appendChild(hidden);
			}
			var mode = el.getAttribute("data-brut-mode") === "12" ? 12 : 24;
			var minStep = parseInt(el.getAttribute("data-brut-minute-step"), 10) || 1;
			var hour = 9, minute = 0;
			var initial = (field.value || hidden && hidden.value || "").match(/^(\d{1,2}):(\d{2})$/);
			if (initial) {
				hour = clamp(parseInt(initial[1], 10), 0, 23);
				minute = clamp(parseInt(initial[2], 10), 0, 59);
			}
			var pop = el.querySelector(".brut-time__pop");
			if (!pop) {
				pop = document.createElement("div");
				pop.className = "brut-time__pop";
				el.appendChild(pop);
			}
			pop.innerHTML = "";
			var row = document.createElement("div");
			row.className = "brut-time__row";
			pop.appendChild(row);
			function getHourDisplay() {
				if (mode === 24) return hour;
				var h = hour % 12;
				return h === 0 ? 12 : h;
			}
			function setHourFromDisplay(v) {
				if (mode === 24) hour = (v % 24 + 24) % 24;
				else {
					var pm = hour >= 12;
					hour = (((v - 1) % 12 + 12) % 12 + 1) % 12 + (pm ? 12 : 0);
				}
			}
			function getMinute() {
				return minute;
			}
			function setMinute(v) {
				var step = minStep;
				if (step <= 1) minute = (v % 60 + 60) % 60;
				else minute = (Math.round(v / step) * step % 60 + 60) % 60;
			}
			function buildCol(label, getter, setter) {
				var col = document.createElement("div");
				col.className = "brut-time__col";
				var lbl = document.createElement("span");
				lbl.className = "brut-time__col-label";
				lbl.textContent = label;
				col.appendChild(lbl);
				var stepper = document.createElement("div");
				stepper.className = "brut-stepper";
				var down = document.createElement("button");
				down.className = "brut-stepper__btn";
				down.setAttribute("type", "button");
				down.setAttribute("aria-label", label + " down");
				down.textContent = "−";
				var input = document.createElement("input");
				input.className = "brut-stepper__input";
				input.type = "text";
				input.setAttribute("inputmode", "numeric");
				input.setAttribute("aria-label", label);
				var up = document.createElement("button");
				up.className = "brut-stepper__btn";
				up.setAttribute("type", "button");
				up.setAttribute("aria-label", label + " up");
				up.textContent = "+";
				stepper.appendChild(down);
				stepper.appendChild(input);
				stepper.appendChild(up);
				col.appendChild(stepper);
				function refresh() {
					input.value = pad2(getter());
				}
				down.addEventListener("click", function() {
					setter(getter() - 1);
					refresh();
					sync();
				});
				up.addEventListener("click", function() {
					setter(getter() + 1);
					refresh();
					sync();
				});
				input.addEventListener("change", function() {
					var n = parseInt(input.value, 10);
					if (!isNaN(n)) setter(n);
					refresh();
					sync();
				});
				input.addEventListener("keydown", function(e) {
					if (e.key === "ArrowUp") {
						e.preventDefault();
						setter(getter() + 1);
						refresh();
						sync();
					}
					if (e.key === "ArrowDown") {
						e.preventDefault();
						setter(getter() - 1);
						refresh();
						sync();
					}
				});
				return {
					node: col,
					refresh,
					input
				};
			}
			var hourCtrl = buildCol("HOUR", getHourDisplay, setHourFromDisplay);
			row.appendChild(hourCtrl.node);
			var sepEl = document.createElement("span");
			sepEl.className = "brut-time__sep";
			sepEl.textContent = ":";
			row.appendChild(sepEl);
			var minuteCtrl = buildCol("MIN", getMinute, setMinute);
			row.appendChild(minuteCtrl.node);
			var amBtn = null, pmBtn = null;
			if (mode === 12) {
				var meridSeg = document.createElement("div");
				meridSeg.className = "brut-segmented brut-time__meridian";
				amBtn = document.createElement("button");
				amBtn.className = "brut-segmented__btn";
				amBtn.setAttribute("type", "button");
				amBtn.textContent = "AM";
				pmBtn = document.createElement("button");
				pmBtn.className = "brut-segmented__btn";
				pmBtn.setAttribute("type", "button");
				pmBtn.textContent = "PM";
				meridSeg.appendChild(amBtn);
				meridSeg.appendChild(pmBtn);
				pop.appendChild(meridSeg);
				function setMerid(pm) {
					if (pm && hour < 12) hour += 12;
					if (!pm && hour >= 12) hour -= 12;
					amBtn.classList.toggle("brut-segmented__btn--on", !pm);
					pmBtn.classList.toggle("brut-segmented__btn--on", pm);
					hourCtrl.refresh();
					sync();
				}
				amBtn.addEventListener("click", function() {
					setMerid(false);
				});
				pmBtn.addEventListener("click", function() {
					setMerid(true);
				});
				amBtn.classList.toggle("brut-segmented__btn--on", hour < 12);
				pmBtn.classList.toggle("brut-segmented__btn--on", hour >= 12);
			}
			function fmt() {
				return pad2(hour) + ":" + pad2(minute);
			}
			function sync() {
				var s = fmt();
				field.value = s;
				if (hidden) hidden.value = s;
				el.dispatchEvent(new CustomEvent("brut:change", { detail: {
					value: s,
					hour,
					minute
				} }));
			}
			function open() {
				if (el.classList.contains("brut-time--open")) return;
				var m = (field.value || "").match(/^(\d{1,2}):(\d{2})$/);
				if (m) {
					hour = clamp(parseInt(m[1], 10), 0, 23);
					minute = clamp(parseInt(m[2], 10), 0, 59);
				}
				hourCtrl.refresh();
				minuteCtrl.refresh();
				if (amBtn && pmBtn) {
					amBtn.classList.toggle("brut-segmented__btn--on", hour < 12);
					pmBtn.classList.toggle("brut-segmented__btn--on", hour >= 12);
				}
				el.classList.add("brut-time--open");
				field.setAttribute("aria-expanded", "true");
			}
			function close() {
				el.classList.remove("brut-time--open");
				field.setAttribute("aria-expanded", "false");
			}
			field.setAttribute("role", "combobox");
			field.setAttribute("aria-haspopup", "dialog");
			field.setAttribute("aria-expanded", "false");
			if (!field.getAttribute("placeholder")) field.setAttribute("placeholder", "HH:MM");
			field.addEventListener("focus", open);
			field.addEventListener("click", open);
			field.addEventListener("keydown", function(e) {
				if (e.key === "Escape") close();
				else if (e.key === "ArrowDown" || e.key === "Enter") {
					e.preventDefault();
					open();
				}
			});
			document.addEventListener("mousedown", function(e) {
				if (!el.contains(e.target)) close();
			});
			hourCtrl.refresh();
			minuteCtrl.refresh();
			if (!field.value) field.value = fmt();
			if (hidden && !hidden.value) hidden.value = fmt();
			var initialHour = hour, initialMinute = minute;
			var form = el.closest("form");
			if (form) form.addEventListener("reset", function() {
				if (!el.isConnected) return;
				setTimeout(function() {
					hour = initialHour;
					minute = initialMinute;
					var s = fmt();
					field.value = s;
					if (hidden) hidden.value = s;
					hourCtrl.refresh();
					minuteCtrl.refresh();
					if (amBtn && pmBtn) {
						amBtn.classList.toggle("brut-segmented__btn--on", hour < 12);
						pmBtn.classList.toggle("brut-segmented__btn--on", hour >= 12);
					}
				}, 0);
			});
		}
	});
})();
//#endregion
//#region src/js/components/toast-host.js
(function() {
	if (!window.Brut) return;
	var ICONS = {
		ok: "✓",
		warn: "!",
		err: "✕",
		info: "i"
	};
	function ensureHost(hostSel) {
		var host;
		if (hostSel) {
			host = typeof hostSel === "string" ? document.querySelector(hostSel) : hostSel;
			if (host) return host;
		}
		host = document.querySelector("[data-brut=\"toast-host\"]");
		if (host) return host;
		host = document.createElement("div");
		host.className = "brut-toast-host brut-toast-host--top-right";
		host.setAttribute("data-brut", "toast-host");
		document.body.appendChild(host);
		return host;
	}
	function makeToast(opts) {
		opts = opts || {};
		var kind = opts.kind || "info";
		var message = opts.message == null ? "" : String(opts.message);
		var timeout = typeof opts.timeout === "number" ? opts.timeout : 4e3;
		var host = ensureHost(opts.host);
		var t = document.createElement("div");
		t.className = "brut-toast brut-toast--" + kind;
		t.setAttribute("role", kind === "err" || kind === "warn" ? "alert" : "status");
		t.setAttribute("aria-live", kind === "err" || kind === "warn" ? "assertive" : "polite");
		var icon = document.createElement("div");
		icon.className = "brut-toast__icon";
		icon.textContent = ICONS[kind] || ICONS.info;
		var msg = document.createElement("div");
		msg.className = "brut-toast__msg";
		msg.textContent = message;
		var x = document.createElement("button");
		x.className = "brut-toast__x";
		x.setAttribute("type", "button");
		x.setAttribute("aria-label", "Dismiss");
		x.textContent = "✕";
		t.appendChild(icon);
		t.appendChild(msg);
		t.appendChild(x);
		host.appendChild(t);
		var closed = false;
		function close() {
			if (closed) return;
			closed = true;
			t.classList.add("brut-toast--leaving");
			var done = function() {
				if (t.parentNode) t.parentNode.removeChild(t);
			};
			var tid = setTimeout(done, 160);
			t.addEventListener("transitionend", function() {
				clearTimeout(tid);
				done();
			}, { once: true });
			t.dispatchEvent(new CustomEvent("brut:close", { bubbles: true }));
		}
		x.addEventListener("click", function(e) {
			e.preventDefault();
			close();
		});
		if (timeout > 0) setTimeout(close, timeout);
		return {
			el: t,
			close
		};
	}
	window.Brut.toast = function(opts) {
		return makeToast(opts);
	};
	Brut.register("toast-host", {
		selector: "[data-brut=\"toast-host\"]",
		init: function(el) {
			if (el && !el.classList.contains("brut-toast-host")) el.classList.add("brut-toast-host");
		}
	});
})();
//#endregion
//#region src/js/components/tooltip.js
(function() {
	if (!window.Brut) return;
	var tipSeq = 0;
	var SIDES = [
		"top",
		"bottom",
		"left",
		"right"
	];
	function position(tip, trigger, preferredSide) {
		if (SIDES.indexOf(preferredSide) === -1) preferredSide = "top";
		var gap = 8;
		var side = Brut.flipSide(trigger, tip, preferredSide, gap);
		for (var i = 0; i < SIDES.length; i++) tip.classList.remove("brut-tooltip--" + SIDES[i]);
		tip.classList.add("brut-tooltip--" + side);
		var r = trigger.getBoundingClientRect();
		var sx = window.pageXOffset || document.documentElement.scrollLeft;
		var sy = window.pageYOffset || document.documentElement.scrollTop;
		var tw = tip.offsetWidth;
		var th = tip.offsetHeight;
		var top = 0, left = 0;
		switch (side) {
			case "bottom":
				top = r.bottom + sy + gap;
				left = r.left + sx + (r.width - tw) / 2;
				break;
			case "left":
				top = r.top + sy + (r.height - th) / 2;
				left = r.left + sx - tw - gap;
				break;
			case "right":
				top = r.top + sy + (r.height - th) / 2;
				left = r.right + sx + gap;
				break;
			default:
				top = r.top + sy - th - gap;
				left = r.left + sx + (r.width - tw) / 2;
				break;
		}
		tip.style.top = Math.round(top) + "px";
		tip.style.left = Math.round(left) + "px";
	}
	var touchPrimaryMql = typeof window.matchMedia === "function" ? window.matchMedia("(hover: none) and (pointer: coarse)") : null;
	var hideByEl = /* @__PURE__ */ new WeakMap();
	var triggers = [];
	function eachTrigger(fn) {
		for (var i = 0; i < triggers.length; i++) {
			var el = triggers[i];
			if (!el.isConnected) continue;
			var rec = hideByEl.get(el);
			if (rec) fn(el, rec);
		}
	}
	document.addEventListener("keydown", function(e) {
		if (e.key !== "Escape") return;
		eachTrigger(function(el, rec) {
			rec.hide();
		});
	});
	document.addEventListener("pointerdown", function(e) {
		eachTrigger(function(el, rec) {
			if (!rec.isPinned()) return;
			var tip = rec.getTip();
			if (!tip) return;
			var target = e.target;
			if (el.contains(target)) return;
			if (tip.contains(target)) return;
			rec.hide();
		});
	});
	Brut.register("tooltip", {
		selector: "[data-brut=\"tooltip\"]",
		init: function(el) {
			if (el.tagName === "BUTTON") el.setAttribute("type", "button");
			if (!el.hasAttribute("aria-haspopup")) el.setAttribute("aria-haspopup", "true");
			var tip = null;
			var touchPrimary = !!(touchPrimaryMql && touchPrimaryMql.matches);
			if (touchPrimary) el.setAttribute("aria-expanded", "false");
			function show() {
				if (tip) return;
				var text = el.getAttribute("data-brut-tip") || "";
				if (!text) return;
				var side = el.getAttribute("data-brut-tip-side") || "top";
				tip = document.createElement("div");
				tip.className = "brut-tooltip brut-tooltip--" + side;
				tip.setAttribute("role", "tooltip");
				tip.id = "brut-tooltip-" + ++tipSeq;
				tip.textContent = text;
				document.body.appendChild(tip);
				el.setAttribute("aria-describedby", tip.id);
				if (touchPrimary) el.setAttribute("aria-expanded", "true");
				position(tip, el, side);
			}
			function hide() {
				if (!tip) return;
				if (tip.parentNode) tip.parentNode.removeChild(tip);
				el.removeAttribute("aria-describedby");
				if (touchPrimary) el.setAttribute("aria-expanded", "false");
				tip = null;
			}
			function toggle() {
				if (tip) hide();
				else show();
			}
			el.addEventListener("mouseenter", show);
			el.addEventListener("mouseleave", hide);
			el.addEventListener("focus", show);
			el.addEventListener("blur", hide);
			if (touchPrimary) el.addEventListener("click", function(e) {
				e.preventDefault();
				toggle();
			});
			hideByEl.set(el, {
				hide,
				isPinned: function() {
					return touchPrimary && !!tip;
				},
				getTip: function() {
					return tip;
				}
			});
			triggers.push(el);
		}
	});
})();
//#endregion
//#region src/js/components/topnav.js
(function() {
	if (!window.Brut) return;
	var closeByEl = /* @__PURE__ */ new WeakMap();
	document.addEventListener("keydown", function(e) {
		if (e.key !== "Escape") return;
		document.querySelectorAll("[data-brut=\"topnav\"]").forEach(function(el) {
			if (!el.isConnected) return;
			var c = closeByEl.get(el);
			if (c) c();
		});
	});
	Brut.register("topnav", {
		selector: "[data-brut=\"topnav\"]",
		init: function(el) {
			var burger = el.querySelector(".brut-topnav__burger");
			if (!burger) return;
			if (burger.tagName === "BUTTON") burger.setAttribute("type", "button");
			if (!burger.hasAttribute("aria-expanded")) burger.setAttribute("aria-expanded", "false");
			if (!burger.hasAttribute("aria-label")) burger.setAttribute("aria-label", el.getAttribute("data-brut-label-menu") || "Toggle menu");
			var links = el.querySelector(".brut-topnav__links");
			if (links && !links.id) links.id = "brut-topnav-nav";
			if (links) burger.setAttribute("aria-controls", links.id);
			function isOpen() {
				return el.classList.contains("brut-topnav--open");
			}
			function setOpen(open) {
				el.classList.toggle("brut-topnav--open", open);
				burger.setAttribute("aria-expanded", open ? "true" : "false");
				el.dispatchEvent(new CustomEvent(open ? "brut:open" : "brut:close"));
			}
			function close() {
				if (isOpen()) setOpen(false);
			}
			closeByEl.set(el, close);
			burger.addEventListener("click", function(e) {
				e.preventDefault();
				e.stopPropagation();
				setOpen(!isOpen());
			});
			document.addEventListener("click", function(e) {
				if (!isOpen()) return;
				if (el.contains(e.target)) return;
				setOpen(false);
			});
			el.querySelectorAll(".brut-topnav__link").forEach(function(a) {
				a.addEventListener("click", function() {
					if (isOpen()) setOpen(false);
				});
			});
		}
	});
})();
//#endregion
//#region src/main.js
var main_default = window.Brut;
//#endregion
export { main_default as default };
