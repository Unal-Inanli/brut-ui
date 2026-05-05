var Brut = (function() {
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
		Brut.version = "0.2.0";
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
					var isOpen = item.classList.contains("brut-accordion__item--open");
					head.setAttribute("aria-expanded", isOpen ? "true" : "false");
					if (body && !body.id) body.id = "brut-acc-" + Math.random().toString(36).slice(2, 9);
					if (body) head.setAttribute("aria-controls", body.id);
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
						detail: { open }
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
				track.setAttribute("aria-live", "polite");
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
					paused = false;
					startAuto();
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
					el.dispatchEvent(new CustomEvent("brut:change", { detail: { checked: el.classList.contains("brut-checkbox--on") } }));
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
				sync();
			}
		});
	})();
	//#endregion
	//#region src/js/components/combobox.js
	(function() {
		if (!window.Brut) return;
		Brut.register("combobox", {
			selector: "[data-brut=\"combobox\"]",
			init: function(el) {
				var input = el.querySelector("input[type=\"text\"], input[type=\"search\"], input:not([type])");
				var list = el.querySelector(".brut-combobox__list");
				if (!input || !list) return;
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
				function open() {
					el.classList.add("brut-combobox--open");
					input.setAttribute("aria-expanded", "true");
				}
				function close() {
					el.classList.remove("brut-combobox--open");
					input.setAttribute("aria-expanded", "false");
					setActive(-1);
				}
				function setActive(i) {
					opts.forEach(function(o, j) {
						o.setAttribute("aria-selected", i === j ? "true" : "false");
					});
					activeIdx = i;
					if (i >= 0 && opts[i]) opts[i].scrollIntoView({ block: "nearest" });
				}
				function visibleOpts() {
					return opts.filter(function(o) {
						return o.style.display !== "none";
					});
				}
				function pick(opt) {
					if (!opt) return;
					input.value = opt.textContent.trim();
					if (hidden) hidden.value = opt.getAttribute("data-value") || opt.textContent.trim();
					el.dispatchEvent(new CustomEvent("brut:change", { detail: {
						value: hidden ? hidden.value : input.value,
						label: input.value
					} }));
					close();
				}
				function filter() {
					var q = (input.value || "").toLowerCase();
					var any = false;
					opts.forEach(function(o) {
						var match = o.textContent.toLowerCase().indexOf(q) !== -1;
						o.style.display = match ? "" : "none";
						if (match) any = true;
					});
					if (emptyEl) emptyEl.style.display = any ? "none" : "block";
					open();
				}
				input.setAttribute("role", "combobox");
				input.setAttribute("aria-autocomplete", "list");
				input.setAttribute("aria-expanded", "false");
				list.setAttribute("role", "listbox");
				opts.forEach(function(o) {
					o.setAttribute("role", "option");
				});
				input.addEventListener("focus", open);
				input.addEventListener("input", filter);
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
				var attrMax = parseInt(target.getAttribute("maxlength"), 10);
				var dataMax = parseInt(el.getAttribute("data-brut-max"), 10);
				var max = isFinite(attrMax) ? attrMax : isFinite(dataMax) ? dataMax : 0;
				function refresh() {
					var n = (target.value || "").length;
					el.textContent = max ? n + " / " + max : String(n);
					if (max) el.classList.toggle("brut-field__counter--over", n > max);
				}
				target.addEventListener("input", refresh);
				target.addEventListener("change", refresh);
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
		Brut.register("dialog", {
			selector: "[data-brut=\"dialog\"]",
			init: function(el) {
				if (!el.id) return;
				var scrimId = el.getAttribute("data-brut-scrim");
				var scrim = scrimId ? document.getElementById(scrimId) : null;
				function open() {
					el.removeAttribute("hidden");
					if (scrim) scrim.removeAttribute("hidden");
					el.dispatchEvent(new CustomEvent("brut:open"));
				}
				function close() {
					el.setAttribute("hidden", "");
					if (scrim) scrim.setAttribute("hidden", "");
					el.dispatchEvent(new CustomEvent("brut:close"));
				}
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
				document.addEventListener("keydown", function(e) {
					if (e.key === "Escape" && !el.hasAttribute("hidden")) close();
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
		Brut.register("drawer", {
			selector: "[data-brut=\"drawer\"]",
			init: function(el) {
				if (!el.id) return;
				var sideClass = "brut-drawer--" + (el.getAttribute("data-brut-side") || "right");
				if (!el.classList.contains(sideClass)) el.classList.add(sideClass);
				var scrimId = el.getAttribute("data-brut-scrim");
				var scrim = scrimId ? document.getElementById(scrimId) : null;
				function open() {
					if (!el.hasAttribute("hidden") && el.classList.contains("brut-drawer--open")) return;
					el.removeAttribute("hidden");
					if (scrim) scrim.removeAttribute("hidden");
					el.offsetWidth;
					el.classList.add("brut-drawer--open");
					el.dispatchEvent(new CustomEvent("brut:open"));
				}
				function close() {
					if (el.hasAttribute("hidden")) return;
					el.classList.remove("brut-drawer--open");
					el.setAttribute("hidden", "");
					if (scrim) scrim.setAttribute("hidden", "");
					el.dispatchEvent(new CustomEvent("brut:close"));
				}
				document.querySelectorAll("[data-brut-open=\"" + el.id + "\"]").forEach(function(t) {
					if (t.tagName === "BUTTON") t.setAttribute("type", "button");
					t.addEventListener("click", function(e) {
						e.preventDefault();
						open();
					});
				});
				el.querySelectorAll("[data-brut-close], .brut-drawer__x").forEach(function(t) {
					if (t.tagName === "BUTTON") t.setAttribute("type", "button");
					t.addEventListener("click", function(e) {
						e.preventDefault();
						close();
					});
				});
				document.addEventListener("keydown", function(e) {
					if (e.key === "Escape" && !el.hasAttribute("hidden")) close();
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
					el.dispatchEvent(new CustomEvent("brut:change", { detail: { files: input.files } }));
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
	//#region src/js/components/file.js
	(function() {
		if (!window.Brut) return;
		Brut.register("file", {
			selector: "[data-brut=\"file\"]",
			init: function(el) {
				var input = el.querySelector("input[type=\"file\"]");
				var name = el.querySelector(".brut-file__name");
				if (!input) return;
				function refresh() {
					if (!name) return;
					if (input.files && input.files.length) name.textContent = input.files.length === 1 ? input.files[0].name : input.files.length + " files";
					else name.textContent = "No file selected";
				}
				input.addEventListener("change", function() {
					refresh();
					el.dispatchEvent(new CustomEvent("brut:change", { detail: { files: input.files } }));
				});
				refresh();
			}
		});
	})();
	//#endregion
	//#region src/js/components/menu.js
	(function() {
		if (!window.Brut) return;
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
				function position() {
					if (!lastTrigger) return;
					var r = lastTrigger.getBoundingClientRect();
					var sx = window.pageXOffset || document.documentElement.scrollLeft;
					var sy = window.pageYOffset || document.documentElement.scrollTop;
					var gap = 6;
					el.style.position = "absolute";
					el.style.top = Math.round(r.bottom + sy + gap) + "px";
					el.style.left = Math.round(r.left + sx) + "px";
				}
				function open(trigger) {
					lastTrigger = trigger || lastTrigger;
					el.removeAttribute("hidden");
					position();
					var first = el.querySelector(".brut-menu__item");
					if (first) try {
						first.focus();
					} catch (e) {}
					el.dispatchEvent(new CustomEvent("brut:open"));
				}
				function close() {
					if (el.hasAttribute("hidden")) return;
					el.setAttribute("hidden", "");
					el.dispatchEvent(new CustomEvent("brut:close"));
				}
				triggers.forEach(function(t) {
					if (t.tagName === "BUTTON") t.setAttribute("type", "button");
					t.setAttribute("aria-haspopup", "menu");
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
				document.addEventListener("keydown", function(e) {
					if (e.key === "Escape" && !el.hasAttribute("hidden")) {
						close();
						if (lastTrigger) try {
							lastTrigger.focus();
						} catch (err) {}
					}
				});
				document.addEventListener("click", function(e) {
					if (el.hasAttribute("hidden")) return;
					if (el.contains(e.target)) return;
					for (var i = 0; i < triggers.length; i++) if (triggers[i].contains(e.target)) return;
					close();
				});
				window.addEventListener("resize", function() {
					if (!el.hasAttribute("hidden")) position();
				});
				window.addEventListener("scroll", function() {
					if (!el.hasAttribute("hidden")) position();
				}, true);
			}
		});
	})();
	//#endregion
	//#region src/js/components/multiselect.js
	(function() {
		if (!window.Brut) return;
		Brut.register("multiselect", {
			selector: "[data-brut=\"multiselect\"]",
			init: function(el) {
				var fieldShell = el.querySelector(".brut-multiselect__field");
				var input = el.querySelector(".brut-multiselect__input");
				var list = el.querySelector(".brut-multiselect__list");
				if (!fieldShell || !input || !list) return;
				var name = el.getAttribute("data-brut-name") || "values";
				var emptyEl = list.querySelector(".brut-multiselect__empty");
				var opts = Array.prototype.slice.call(list.querySelectorAll(".brut-multiselect__opt"));
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
				}
				function close() {
					el.classList.remove("brut-multiselect--open");
					input.setAttribute("aria-expanded", "false");
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
					opts.forEach(function(o) {
						var match = labelOf(o).toLowerCase().indexOf(q) !== -1;
						o.style.display = match ? "" : "none";
						if (match) any = true;
					});
					if (emptyEl) emptyEl.style.display = any ? "none" : "block";
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
					if (e.key === "Backspace" && !input.value) {
						var keys = Object.keys(selected);
						if (keys.length) remove(keys[keys.length - 1]);
					} else if (e.key === "Escape") close();
					else if (e.key === "Enter") {
						var first = opts.filter(function(o) {
							return o.style.display !== "none";
						})[0];
						if (first) {
							e.preventDefault();
							toggle(first);
							input.value = "";
							filter();
						}
					}
				});
				opts.forEach(function(o) {
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
						c.inputMode = "numeric";
						c.autocomplete = "one-time-code";
						el.insertBefore(c, hidden);
					}
					cells = el.querySelectorAll(".brut-otp__cell");
				}
				function gather() {
					var v = "";
					cells.forEach(function(c) {
						v += c.value || "";
					});
					hidden.value = v;
					el.dispatchEvent(new CustomEvent("brut:change", { detail: { value: v } }));
					if (v.length === cells.length) el.dispatchEvent(new CustomEvent("brut:complete", { detail: { value: v } }));
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
				}
				function goTo(target) {
					if (target < 1) target = 1;
					if (target > totalPages) target = totalPages;
					if (target === page) return;
					page = target;
					render();
					el.dispatchEvent(new CustomEvent("brut:change", { detail: {
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
		Brut.register("password", {
			selector: "[data-brut=\"password\"]",
			init: function(el) {
				var input = el.querySelector("input");
				var btn = el.querySelector(".brut-password__toggle");
				if (!input || !btn) return;
				btn.setAttribute("type", "button");
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
		Brut.register("popover", {
			selector: "[data-brut=\"popover\"]",
			init: function(el) {
				if (!el.id) return;
				var triggers = document.querySelectorAll("[data-brut-popover-open=\"" + el.id + "\"]");
				var lastTrigger = null;
				function position() {
					if (!lastTrigger) return;
					var r = lastTrigger.getBoundingClientRect();
					var sx = window.pageXOffset || document.documentElement.scrollLeft;
					var sy = window.pageYOffset || document.documentElement.scrollTop;
					var gap = 8;
					el.style.position = "absolute";
					el.style.top = Math.round(r.bottom + sy + gap) + "px";
					el.style.left = Math.round(r.left + sx) + "px";
				}
				function open(trigger) {
					lastTrigger = trigger || lastTrigger;
					el.removeAttribute("hidden");
					position();
					el.dispatchEvent(new CustomEvent("brut:open"));
				}
				function close() {
					if (el.hasAttribute("hidden")) return;
					el.setAttribute("hidden", "");
					el.dispatchEvent(new CustomEvent("brut:close"));
				}
				triggers.forEach(function(t) {
					if (t.tagName === "BUTTON") t.setAttribute("type", "button");
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
				document.addEventListener("keydown", function(e) {
					if (e.key === "Escape" && !el.hasAttribute("hidden")) close();
				});
				document.addEventListener("click", function(e) {
					if (el.hasAttribute("hidden")) return;
					if (el.contains(e.target)) return;
					for (var i = 0; i < triggers.length; i++) if (triggers[i].contains(e.target)) return;
					close();
				});
				window.addEventListener("resize", function() {
					if (!el.hasAttribute("hidden")) position();
				});
				window.addEventListener("scroll", function() {
					if (!el.hasAttribute("hidden")) position();
				}, true);
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
				thumbMin.setAttribute("type", "button");
				thumbMin.setAttribute("role", "slider");
				thumbMin.setAttribute("aria-label", "Minimum");
				var thumbMax = el.querySelector(".brut-range-dual__thumb--max");
				if (!thumbMax) {
					thumbMax = document.createElement("button");
					thumbMax.className = "brut-range-dual__thumb brut-range-dual__thumb--max";
					el.appendChild(thumbMax);
				}
				thumbMax.setAttribute("type", "button");
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
					thumbMax.setAttribute("aria-valuemin", String(vMin));
					thumbMax.setAttribute("aria-valuemax", String(max));
					thumbMax.setAttribute("aria-valuenow", String(vMax));
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
				el.setAttribute("role", "slider");
				el.setAttribute("aria-valuemin", "0");
				el.setAttribute("aria-valuemax", String(max));
				if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "0");
				function paint(n) {
					stars.forEach(function(s, i) {
						s.classList.toggle("brut-rating__star--on", i < n);
						s.setAttribute("aria-checked", i + 1 === n ? "true" : "false");
					});
					el.setAttribute("aria-valuenow", String(n));
				}
				function set(n) {
					n = Math.max(0, Math.min(max, n));
					current = n;
					if (hidden) {
						hidden.value = String(current);
						hidden.dispatchEvent(new Event("change", { bubbles: true }));
					}
					paint(current);
					el.dispatchEvent(new CustomEvent("brut:change", { detail: { value: current } }));
				}
				stars.forEach(function(star, i) {
					star.setAttribute("type", "button");
					star.setAttribute("role", "radio");
					star.addEventListener("mouseenter", function() {
						paint(i + 1);
					});
					star.addEventListener("focus", function() {
						paint(i + 1);
					});
					star.addEventListener("click", function() {
						set(current === i + 1 ? 0 : i + 1);
					});
				});
				el.addEventListener("keydown", function(e) {
					var next = null;
					switch (e.key) {
						case "ArrowRight":
						case "ArrowUp":
							next = current + 1;
							break;
						case "ArrowLeft":
						case "ArrowDown":
							next = current - 1;
							break;
						case "Home":
							next = 0;
							break;
						case "End":
							next = max;
							break;
						default: return;
					}
					e.preventDefault();
					set(next);
				});
				el.addEventListener("mouseleave", function() {
					paint(current);
				});
				el.addEventListener("focusout", function() {
					paint(current);
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
				function refresh() {
					el.classList.toggle("brut-search--has-value", !!input.value);
				}
				input.addEventListener("input", refresh);
				if (btn) {
					btn.setAttribute("type", "button");
					btn.addEventListener("click", function() {
						input.value = "";
						input.dispatchEvent(new Event("input", { bubbles: true }));
						input.dispatchEvent(new Event("change", { bubbles: true }));
						input.focus();
						refresh();
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
						el.dispatchEvent(new CustomEvent("brut:change", { detail: {
							group,
							closed: willClose
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
				sync();
			}
		});
	})();
	//#endregion
	//#region src/js/components/table-columns.js
	(function() {
		if (!window.Brut) return;
		Brut.register("table-columns", {
			selector: "[data-brut=\"table-columns\"]",
			init: function(el) {
				var tableId = el.getAttribute("data-brut-table");
				var table = tableId ? document.getElementById(tableId) : null;
				if (!table) return;
				var name = el.getAttribute("data-brut-name") || "visible_cols";
				var hidden = el.parentNode.querySelector("input[type=\"hidden\"][data-brut-cols-state]");
				if (!hidden) {
					hidden = document.createElement("input");
					hidden.type = "hidden";
					hidden.setAttribute("data-brut-cols-state", "");
					hidden.name = name;
					el.parentNode.insertBefore(hidden, el.nextSibling);
				}
				var ths = Array.prototype.slice.call(table.querySelectorAll("thead th[data-col]"));
				var menuId = "brut-cols-menu-" + Math.random().toString(36).slice(2, 9);
				el.setAttribute("type", "button");
				el.setAttribute("data-brut-menu-open", menuId);
				var styleEl = document.createElement("style");
				styleEl.textContent = ths.map(function(th) {
					var safe = th.getAttribute("data-col").replace(/["\\]/g, "\\$&");
					return ".brut-table[data-col-hidden~=\"" + safe + "\"] [data-col=\"" + safe + "\"] { display: none; }";
				}).join("\n");
				document.head.appendChild(styleEl);
				var menu = document.createElement("div");
				menu.className = "brut-menu";
				menu.setAttribute("data-brut", "menu");
				menu.id = menuId;
				menu.setAttribute("role", "menu");
				var hiddenCols = {};
				function apply() {
					var hideList = Object.keys(hiddenCols).filter(function(k) {
						return hiddenCols[k];
					});
					if (hideList.length) table.setAttribute("data-col-hidden", hideList.join(" "));
					else table.removeAttribute("data-col-hidden");
					var visible = ths.map(function(h) {
						return h.getAttribute("data-col");
					}).filter(function(k) {
						return !hiddenCols[k];
					});
					hidden.value = visible.join(",");
					el.dispatchEvent(new CustomEvent("brut:change", {
						detail: { visible },
						bubbles: true
					}));
				}
				ths.forEach(function(th) {
					var key = th.getAttribute("data-col");
					var label = th.getAttribute("data-brut-col-label") || (th.textContent || key).trim();
					var item = document.createElement("label");
					item.className = "brut-menu__item brut-table-columns-menu__item";
					item.setAttribute("role", "menuitemcheckbox");
					item.setAttribute("aria-checked", "true");
					var cb = document.createElement("input");
					cb.type = "checkbox";
					cb.checked = true;
					cb.addEventListener("change", function() {
						hiddenCols[key] = !cb.checked;
						item.setAttribute("aria-checked", cb.checked ? "true" : "false");
						apply();
					});
					item.appendChild(cb);
					var span = document.createElement("span");
					span.textContent = label;
					item.appendChild(span);
					menu.appendChild(item);
				});
				el.parentNode.insertBefore(menu, el.nextSibling);
				Brut.init(el.parentNode);
				apply();
			}
		});
	})();
	//#endregion
	//#region src/js/components/table-filter.js
	(function() {
		Brut.register("table-filter", {
			selector: "[data-brut=\"table-filter\"]",
			init: function(el) {
				var tableId = el.getAttribute("data-brut-table");
				var table = tableId ? document.getElementById(tableId) : null;
				if (!table) return;
				var input = el.querySelector("input");
				if (!input) return;
				var name = el.getAttribute("data-brut-name") || "q";
				var hidden = el.querySelector("input[type=\"hidden\"][data-brut-filter-state]");
				if (!hidden) {
					hidden = document.createElement("input");
					hidden.type = "hidden";
					hidden.setAttribute("data-brut-filter-state", "");
					hidden.name = name;
					el.appendChild(hidden);
				}
				var countEl = el.querySelector(".brut-table-filter__count");
				function apply() {
					var q = input.value.trim().toLowerCase();
					var tokens = q ? q.split(/\s+/) : [];
					var rows = table.querySelectorAll("tbody tr");
					var visible = 0, total = rows.length;
					rows.forEach(function(r) {
						if (r.hasAttribute("data-brut-row-expansion")) return;
						var text = (r.textContent || "").toLowerCase();
						if (tokens.every(function(t) {
							return text.indexOf(t) !== -1;
						})) {
							r.removeAttribute("data-brut-filter-hidden");
							if (r.getAttribute("data-brut-hidden-by") === "filter") {
								r.removeAttribute("data-brut-hidden-by");
								r.removeAttribute("hidden");
							} else if (!r.hasAttribute("data-brut-hidden-by")) r.removeAttribute("hidden");
							visible++;
						} else {
							r.setAttribute("data-brut-filter-hidden", "");
							r.setAttribute("data-brut-hidden-by", "filter");
							r.setAttribute("hidden", "");
						}
					});
					hidden.value = q;
					if (countEl) countEl.textContent = visible + " of " + total;
					el.dispatchEvent(new CustomEvent("brut:change", {
						detail: {
							value: q,
							visible,
							total
						},
						bubbles: true
					}));
					table.dispatchEvent(new CustomEvent("brut:change", {
						detail: { source: "filter" },
						bubbles: true
					}));
				}
				input.addEventListener("input", apply);
				apply();
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
				h.classList.toggle("brut-table__cell--sorted", isThis && dir === "ascending");
				h.classList.toggle("brut-table__cell--sorted-desc", isThis && dir === "descending");
				h.setAttribute("aria-sort", isThis ? dir : "none");
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
				var sortables = thead.querySelectorAll(".brut-table__cell--sortable");
				for (var i = 0; i < sortables.length; i++) (function(h) {
					if (!h.hasAttribute("aria-sort")) h.setAttribute("aria-sort", "none");
					if (!h.hasAttribute("role")) h.setAttribute("role", "columnheader");
					if (!h.hasAttribute("tabindex")) h.setAttribute("tabindex", "0");
					function trigger() {
						var key = h.getAttribute("data-sort-key");
						if (!key) return;
						var dir = h.getAttribute("aria-sort") === "ascending" ? "descending" : "ascending";
						sortBy(el, key, dir);
						el.dispatchEvent(new CustomEvent("brut:change", { detail: {
							value: key,
							key,
							dir
						} }));
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
			}
		});
	})();
	//#endregion
	//#region src/js/components/tabs.js
	(function() {
		if (!window.Brut) return;
		Brut.register("tabs", {
			selector: "[data-brut=\"tabs\"]",
			init: function(el) {
				var rootSel = el.getAttribute("data-brut-panels");
				var panelRoot = rootSel ? document.querySelector(rootSel) : el.parentElement;
				var panels = {};
				if (panelRoot) panelRoot.querySelectorAll("[data-brut-panel]").forEach(function(p) {
					panels[p.getAttribute("data-brut-panel")] = p;
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
					hidden.value = values().join(",");
					el.dispatchEvent(new CustomEvent("brut:change", { detail: { tags: values() } }));
				}
				function bindClose(btn) {
					btn.setAttribute("type", "button");
					btn.addEventListener("click", function(e) {
						e.stopPropagation();
						if (btn.parentElement) btn.parentElement.remove();
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
					bindClose(x);
					tag.appendChild(x);
					el.insertBefore(tag, field);
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
							existing[existing.length - 1].remove();
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
		function position(tip, trigger, side) {
			var r = trigger.getBoundingClientRect();
			var sx = window.pageXOffset || document.documentElement.scrollLeft;
			var sy = window.pageYOffset || document.documentElement.scrollTop;
			var tw = tip.offsetWidth;
			var th = tip.offsetHeight;
			var gap = 8;
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
		Brut.register("tooltip", {
			selector: "[data-brut=\"tooltip\"]",
			init: function(el) {
				if (el.tagName === "BUTTON") el.setAttribute("type", "button");
				var tip = null;
				function show() {
					if (tip) return;
					var text = el.getAttribute("data-brut-tip") || "";
					if (!text) return;
					var side = el.getAttribute("data-brut-tip-side") || "top";
					tip = document.createElement("div");
					tip.className = "brut-tip brut-tip--" + side;
					tip.setAttribute("role", "tooltip");
					tip.id = "brut-tip-" + ++tipSeq;
					tip.textContent = text;
					document.body.appendChild(tip);
					el.setAttribute("aria-describedby", tip.id);
					position(tip, el, side);
				}
				function hide() {
					if (!tip) return;
					if (tip.parentNode) tip.parentNode.removeChild(tip);
					el.removeAttribute("aria-describedby");
					tip = null;
				}
				el.addEventListener("mouseenter", show);
				el.addEventListener("mouseleave", hide);
				el.addEventListener("focus", show);
				el.addEventListener("blur", hide);
				document.addEventListener("keydown", function(e) {
					if (e.key === "Escape") hide();
				});
			}
		});
	})();
	//#endregion
	//#region src/js/components/topnav.js
	(function() {
		if (!window.Brut) return;
		Brut.register("topnav", {
			selector: "[data-brut=\"topnav\"]",
			init: function(el) {
				var burger = el.querySelector(".brut-topnav__burger");
				if (!burger) return;
				if (burger.tagName === "BUTTON") burger.setAttribute("type", "button");
				if (!burger.hasAttribute("aria-expanded")) burger.setAttribute("aria-expanded", "false");
				if (!burger.hasAttribute("aria-label")) burger.setAttribute("aria-label", "Toggle menu");
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
				document.addEventListener("keydown", function(e) {
					if (e.key === "Escape" && isOpen()) setOpen(false);
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
	return window.Brut;
})();
