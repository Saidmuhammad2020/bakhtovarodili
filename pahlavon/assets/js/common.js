/* =================================================================
   ПАХЛАВОН — Общий загрузчик для всех страниц сайта
   Тема, язык, шапка/меню/FAB, контактные настройки, синхронизация
   с сервером, scroll-reveal и анимации услуг по вьюпорту.

   Подключать ПОСЛЕ i18n.js, content.js, api.js, animations.js.
   Каждая страница вызывает Common.boot(renderPage, metaPath) в своём
   собственном скрипте (renderPage получает (t, lang) и заполняет
   динамические блоки страницы).
   ================================================================= */
window.Common = (function () {
  "use strict";

  var LANGS = ["tg", "ru", "en"];
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var state = { lang: window.__initLang || "ru" };
  var io = null;
  var renderPageFn = null;
  var metaPath = null;

  function get(obj, path) {
    return path.split(".").reduce(function (o, k) { return o && o[k] !== undefined ? o[k] : undefined; }, obj);
  }
  function t(path) {
    var v = get(window.LOCALES[state.lang], path);
    if (v === undefined) v = get(window.LOCALES.ru, path);
    return v;
  }
  function setMeta(name, val) {
    var m = document.querySelector('meta[name="' + name + '"]') || document.querySelector('meta[property="' + name + '"]');
    if (m) m.setAttribute("content", val);
  }

  /* ---------- Применение переводов к статической разметке ---------- */
  function applyStatic() {
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var v = t(el.getAttribute("data-i18n"));
      if (typeof v === "string") el.textContent = v;
    });
    document.querySelectorAll("[data-i18n-html]").forEach(function (el) {
      var v = t(el.getAttribute("data-i18n-html"));
      if (typeof v === "string") el.innerHTML = v;
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach(function (el) {
      var v = t(el.getAttribute("data-i18n-placeholder"));
      if (typeof v === "string") el.setAttribute("placeholder", v);
    });
    if (metaPath) {
      var title = t(metaPath + ".title");
      var desc = t(metaPath + ".description");
      if (title) document.title = title;
      if (desc) setMeta("description", desc);
    }
    document.documentElement.setAttribute("lang", state.lang);
    setNavCurrent();
  }

  function setNavCurrent() {
    var here = location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".nav a, .mobile-menu a").forEach(function (a) {
      var href = (a.getAttribute("href") || "").split("/").pop();
      if (href === here) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
  }

  /* ---------- Контактные/брендовые настройки ---------- */
  function applySettings() {
    if (!window.SettingsStore) return;
    var s = window.SettingsStore.all();
    function each(sel, fn) { document.querySelectorAll(sel).forEach(fn); }
    each('[data-contact="phone"]', function (a) { a.href = "tel:" + s.phone; });
    each('[data-contact-text="phone"]', function (a) { a.textContent = s.phoneDisplay; });
    each('[data-contact="email"]', function (a) { a.href = "mailto:" + s.email; });
    each('[data-contact-text="email"]', function (a) { a.textContent = s.email; });
    each('[data-contact="telegram"]', function (a) { a.href = "https://t.me/" + s.telegram; });
    each('[data-contact-text="telegram"]', function (a) { a.textContent = "@" + s.telegram; });
    each('[data-contact="whatsapp"]', function (a) { a.href = "https://wa.me/" + s.whatsapp; });
    each('[data-contact="instagram"]', function (a) { a.href = "https://instagram.com/" + s.instagram; });
    each('[data-contact-text="instagram"]', function (a) { a.textContent = "@" + s.instagram; });
  }

  /* ---------- Атмосферный фон: декоративные радар-кольца ---------- */
  function injectAtmosphereRings() {
    var box = document.querySelector(".atmosphere__rings");
    if (!box) return;
    var rings = [70, 110, 150, 185].map(function (r) {
      return '<circle cx="200" cy="200" r="' + r + '" />';
    }).join("");
    box.innerHTML = '<svg viewBox="0 0 400 400" aria-hidden="true">' + rings + "</svg>";
  }

  /* ---------- Полная перерисовка при смене языка/контента ---------- */
  function applyAll() {
    applyStatic();
    applySettings();
    if (renderPageFn) renderPageFn(t, state.lang);
    observeReveal();
  }

  /* ---------- Переключатель языка ---------- */
  function setLang(lang) {
    if (LANGS.indexOf(lang) === -1) lang = "ru";
    state.lang = lang;
    try { localStorage.setItem("pahlavon-lang", lang); } catch (e) {}
    document.querySelectorAll(".lang button").forEach(function (b) {
      b.setAttribute("aria-pressed", b.getAttribute("data-lang") === lang ? "true" : "false");
    });
    applyAll();
  }

  /* ---------- Тема ---------- */
  function initTheme() {
    var btn = document.getElementById("themeToggle");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var cur = document.documentElement.getAttribute("data-theme");
      var next = cur === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      try { localStorage.setItem("pahlavon-theme", next); } catch (e) {}
      setMeta("theme-color", next === "dark" ? "#1A1A1A" : "#F7F3E8");
    });
  }

  /* ---------- Шапка: скролл + бургер + to-top ---------- */
  function initChrome() {
    var header = document.getElementById("header");
    var toTop = document.getElementById("toTop");
    function onScroll() {
      var y = window.scrollY;
      if (header) header.classList.toggle("scrolled", y > 30);
      if (toTop) toTop.classList.toggle("show", y > 600);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    if (toTop) toTop.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" }); });

    var menu = document.getElementById("mobileMenu");
    var burger = document.getElementById("burger");
    var menuClose = document.getElementById("menuClose");
    function setMenu(open) {
      if (!menu) return;
      menu.classList.toggle("open", open);
      menu.setAttribute("aria-hidden", open ? "false" : "true");
      if (burger) burger.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.style.overflow = open ? "hidden" : "";
    }
    if (burger) burger.addEventListener("click", function () { setMenu(true); });
    if (menuClose) menuClose.addEventListener("click", function () { setMenu(false); });
    if (menu) menu.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
  }

  /* ---------- Scroll-reveal + запуск SVG-анимаций услуг ---------- */
  function observeReveal() {
    if (io) io.disconnect();
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) {
          e.target.classList.remove("anim-on");
          return;
        }
        e.target.classList.add("in");
        e.target.querySelectorAll(".svc").forEach(function (s) { s.classList.add("anim-on"); });
        e.target.querySelectorAll("[data-count]").forEach(function (c) {
          var m = c.getAttribute("data-count").match(/\d+/);
          if (!m) return;
          var suf = c.getAttribute("data-count").replace(/\d+/, "");
          var to = +m[0];
          if (c.getAttribute("data-counted") === "1") return;
          c.setAttribute("data-counted", "1");
          if (reduced) { c.textContent = to + suf; return; }
          var t0 = performance.now();
          function st(now) { var p = Math.min(1, (now - t0) / 900); c.textContent = Math.round(to * p) + suf; if (p < 1) requestAnimationFrame(st); }
          c.textContent = "0" + suf; requestAnimationFrame(st);
        });
      });
    }, { threshold: 0.18 });
    document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });
  }

  function fmt(n) { return Math.round(n).toLocaleString("ru-RU").replace(/,/g, " "); }
  function animateCount(el, target) {
    if (reduced) { el.textContent = fmt(target); return; }
    var start = parseInt((el.textContent || "0").replace(/\s/g, ""), 10) || 0;
    var t0 = performance.now(), dur = 700;
    function step(now) {
      var p = Math.min(1, (now - t0) / dur);
      el.textContent = fmt(start + (target - start) * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ---------- Маска телефона +992 ---------- */
  function attachPhoneMask(el) {
    el.addEventListener("input", function () {
      var d = el.value.replace(/\D/g, "");
      if (d.indexOf("992") === 0) d = d.slice(3);
      d = d.slice(0, 9);
      var out = "+992";
      if (d.length) out += " " + d.slice(0, 3);
      if (d.length > 3) out += " " + d.slice(3, 5);
      if (d.length > 5) out += " " + d.slice(5, 7);
      if (d.length > 7) out += " " + d.slice(7, 9);
      el.value = out;
    });
  }
  function setErr(id, on) { var el = document.getElementById(id); if (el) el.closest(".field").classList.toggle("field--error", on); }

  /* ---------- Запуск ---------- */
  function boot(renderFn, meta) {
    renderPageFn = renderFn || null;
    metaPath = meta || null;

    document.querySelectorAll(".lang button").forEach(function (b) {
      b.addEventListener("click", function () { setLang(b.getAttribute("data-lang")); });
    });
    initTheme();
    initChrome();
    injectAtmosphereRings();

    document.getElementById("year") && (document.getElementById("year").textContent = new Date().getFullYear());

    setLang(state.lang);

    if (window.PahlavonAPI && window.PahlavonAPI.enabled()) {
      window.PahlavonAPI.syncDown().then(function () {
        if (window.ContentStore && window.ContentStore.reapply) window.ContentStore.reapply();
        applyAll();
      }).catch(function () {});
    }
  }

  return {
    t: t, get: get, state: state, boot: boot, applyAll: applyAll,
    observeReveal: observeReveal, animateCount: animateCount, fmt: fmt,
    attachPhoneMask: attachPhoneMask, setErr: setErr, reduced: reduced,
  };
})();
