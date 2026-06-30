/* =================================================================
   ПАХЛАВОН — Логика сайта
   i18n · темы · рендеринг · анимации по вьюпорту · формы · калькулятор
   ================================================================= */
(function () {
  "use strict";

  var LANGS = ["tg", "ru", "en"];
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var state = { lang: window.__initLang || "ru" };

  /* ---------- доступ к ключу "a.b.c" ---------- */
  function get(obj, path) {
    return path.split(".").reduce(function (o, k) { return o && o[k] !== undefined ? o[k] : undefined; }, obj);
  }
  function t(path) {
    var v = get(window.LOCALES[state.lang], path);
    if (v === undefined) v = get(window.LOCALES.ru, path); // fallback на русский (ТЗ §4.2)
    return v;
  }

  /* ================= РЕНДЕРИНГ ДИНАМИЧЕСКИХ СЕКЦИЙ ================= */
  var SERVICE_KEYS = ["video", "access", "fire", "monitoring", "guard", "gps", "service", "events"];
  var SERVICE_ICONS = {
    video: '<path d="M2 7l8 5-8 5V7z"/><rect x="10" y="5" width="12" height="14" rx="2"/>',
    access: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0"/>',
    fire: '<path d="M12 2s5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 1-3s3 2 4-7z"/>',
    monitoring: '<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/>',
    guard: '<path d="M12 2l8 4v6c0 5-8 10-8 10S4 17 4 12V6z"/>',
    gps: '<circle cx="12" cy="10" r="3"/><path d="M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11z"/>',
    service: '<circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.4-2.3 1a7 7 0 0 0-1.7-1l-.3-2.5h-4l-.3 2.5a7 7 0 0 0-1.7 1l-2.3-1-2 3.4 2 1.5a7 7 0 0 0 0 2l-2 1.5 2 3.4 2.3-1a7 7 0 0 0 1.7 1l.3 2.5h4l.3-2.5a7 7 0 0 0 1.7-1l2.3 1 2-3.4-2-1.5a7 7 0 0 0 .1-1z"/>',
    events: '<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20a6 6 0 0 1 12 0M14 20a5 5 0 0 1 7 0"/>',
  };

  function renderServices() {
    var grid = document.getElementById("servicesGrid");
    grid.innerHTML = SERVICE_KEYS.map(function (k) {
      var s = t("services.items." + k);
      var feats = s.features.map(function (f) { return "<li>" + f + "</li>"; }).join("");
      return '<article class="service-card reveal" data-svc="' + k + '">' +
        '<div class="service-anim" data-anim="' + k + '"></div>' +
        '<div class="service-card__body">' +
          '<svg class="service-card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' + SERVICE_ICONS[k] + '</svg>' +
          "<h3>" + s.title + "</h3>" +
          '<div class="service-card__sub">' + s.sub + "</div>" +
          '<p class="service-card__desc">' + s.desc + "</p>" +
          '<ul class="service-features">' + feats + "</ul>" +
          '<div class="service-card__actions">' +
            '<a href="#contacts" class="btn btn--primary btn--sm">' + t("common.request") + "</a>" +
          "</div>" +
        "</div></article>";
    }).join("");
    // вставляем SVG-анимации
    grid.querySelectorAll("[data-anim]").forEach(function (el) {
      var fn = window.SERVICE_ANIMS[el.getAttribute("data-anim")];
      if (fn) el.innerHTML = fn();
    });
  }

  function renderHeroStats() {
    document.getElementById("heroStats").innerHTML = t("hero.stats").map(function (s) {
      return '<div class="stat"><div class="num">' + s.num + '</div><div class="cap">' + s.cap + "</div></div>";
    }).join("");
  }
  function renderCounters() {
    document.getElementById("aboutCounters").innerHTML = t("about.counters").map(function (c) {
      return '<div class="counter"><div class="num" data-count="' + c.num + '">' + c.num + '</div><div class="cap">' + c.cap + "</div></div>";
    }).join("");
  }
  function renderFeatures() {
    document.getElementById("featureGrid").innerHTML = t("advantages.items").map(function (a) {
      return '<div class="feature reveal"><svg class="feature__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l8 4v6c0 5-8 10-8 10S4 17 4 12V6z"/><path d="M9 12l2 2 4-4"/></svg>' +
        "<h3>" + a.t + "</h3><p>" + a.d + "</p></div>";
    }).join("");
  }
  function renderProcess() {
    document.getElementById("processTimeline").innerHTML = t("process.steps").map(function (s, i) {
      return '<div class="step reveal"><div class="step__num">' + (i + 1) + "</div><h3>" + s.t + "</h3><p>" + s.d + "</p></div>";
    }).join("");
  }
  function renderCases() {
    var swatch = ["#2E2E2E", "#3a3a3a", "#262626", "#333", "#2a2a2a", "#383838"];
    document.getElementById("casesGrid").innerHTML = t("cases.items").map(function (c, i) {
      return '<div class="case reveal">' +
        '<svg viewBox="0 0 200 150" preserveAspectRatio="xMidYMid slice"><rect width="200" height="150" fill="' + swatch[i % 6] + '"/>' +
        '<path d="M40 4 L74 62 L6 62 Z" fill="var(--accent)" opacity=".12"/><path d="M160 88 L194 146 L126 146 Z" fill="var(--accent)" opacity=".08"/>' +
        '<path d="M100 50 l9 18 20 3 -14 14 3 20 -18 -9 -18 9 3 -20 -14 -14 20 -3Z" fill="var(--accent)" opacity=".35"/></svg>' +
        '<div class="case__tag"><b>' + c.t + "</b><span>" + c.d + "</span></div></div>";
    }).join("");
  }
  function renderReviews() {
    document.getElementById("reviewsList").innerHTML = t("reviews.items").map(function (r) {
      var initial = r.name.charAt(0);
      return '<div class="review reveal"><div class="review__stars">★★★★★</div><p>«' + r.text + '»</p>' +
        '<div class="review__author"><div class="review__avatar">' + initial + "</div><div><b>" + r.name + "</b><span>" + r.role + "</span></div></div></div>";
    }).join("");
  }
  function renderFaq() {
    document.getElementById("faqList").innerHTML = t("faq.items").map(function (f, i) {
      return '<div class="faq-item reveal"><button class="faq-q" aria-expanded="false" aria-controls="faqa' + i + '">' + f.q + "</button>" +
        '<div class="faq-a" id="faqa' + i + '" role="region"><div>' + f.a + "</div></div></div>";
    }).join("");
    bindFaq();
  }
  function renderCalc() {
    var sel = document.getElementById("calcType");
    sel.innerHTML = t("calc.types").map(function (x, i) { return '<option value="' + i + '">' + x + "</option>"; }).join("");
    var fsel = document.getElementById("fType");
    fsel.innerHTML = t("contacts.form.typeOptions").map(function (x, i) { return '<option value="' + (i ? x : "") + '"' + (i ? "" : " disabled selected") + ">" + x + "</option>"; }).join("");
  }

  /* ---------- Вакансии / Карьера ---------- */
  function vacField(v, key) { var f = v[key] || {}; return f[state.lang] || f.ru || ""; }
  function renderCareers() {
    var grid = document.getElementById("careersGrid");
    if (!grid) return;
    var list = (window.VacancyStore ? window.VacancyStore.all() : []);
    document.getElementById("careersCount").textContent = list.length;
    if (!list.length) {
      grid.innerHTML = '<div class="careers-empty">' + t("careers.empty") + "</div>";
      return;
    }
    grid.innerHTML = list.map(function (v, i) {
      var typeLabel = t("careers.employmentTypes." + v.type) || v.type;
      var salary = v.salary || t("careers.salaryNegotiable");
      return '<article class="vacancy reveal">' +
        '<div class="vacancy__meta">' +
          '<span class="tag tag--accent">' + typeLabel + "</span>" +
          (v.location ? '<span class="tag">' + v.location + "</span>" : "") +
          '<span class="tag">' + salary + "</span>" +
        "</div>" +
        "<h3>" + vacField(v, "title") + "</h3>" +
        '<p class="vacancy__desc">' + vacField(v, "desc") + "</p>" +
        '<button class="btn btn--primary btn--sm" data-idx="' + i + '">' + t("careers.applyBtn") + "</button>" +
        "</article>";
    }).join("");
    grid.querySelectorAll("[data-idx]").forEach(function (b) {
      b.addEventListener("click", function () { openApply(vacField(list[+b.getAttribute("data-idx")], "title")); });
    });
  }

  /* ================= ПРИМЕНЕНИЕ ПЕРЕВОДОВ К РАЗМЕТКЕ ================= */
  function applyStatic() {
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var v = t(el.getAttribute("data-i18n"));
      if (typeof v === "string") el.textContent = v;
    });
    document.querySelectorAll("[data-i18n-html]").forEach(function (el) {
      var v = t(el.getAttribute("data-i18n-html"));
      if (typeof v === "string") el.innerHTML = v;
    });
    // meta / lang / hreflang
    document.title = t("meta.title");
    setMeta("description", t("meta.description"));
    document.documentElement.setAttribute("lang", state.lang);
  }
  function setMeta(name, val) {
    var m = document.querySelector('meta[name="' + name + '"]');
    if (m) m.setAttribute("content", val);
  }

  /* ---------- Контактные/брендовые настройки (управляются из админки) ---------- */
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

  function renderAll() {
    renderServices(); renderHeroStats(); renderCounters(); renderFeatures();
    renderProcess(); renderCases(); renderReviews(); renderFaq(); renderCalc();
    renderCareers();
    applyStatic();
    applySettings();
    updateCalc();
    observeReveal();
  }

  /* ================= ПЕРЕКЛЮЧАТЕЛЬ ЯЗЫКА (ТЗ §4.5) ================= */
  function setLang(lang) {
    if (!LANGS.includes(lang)) lang = "ru";
    state.lang = lang;
    try { localStorage.setItem("pahlavon-lang", lang); } catch (e) {}
    document.querySelectorAll(".lang button").forEach(function (b) {
      b.setAttribute("aria-pressed", b.getAttribute("data-lang") === lang ? "true" : "false");
    });
    renderAll(); // переключение не меняет раздел (ТЗ §4.5)
  }
  document.querySelectorAll(".lang button").forEach(function (b) {
    b.addEventListener("click", function () { setLang(b.getAttribute("data-lang")); });
  });

  /* ================= ТЕМА (ТЗ §6.1) ================= */
  document.getElementById("themeToggle").addEventListener("click", function () {
    var cur = document.documentElement.getAttribute("data-theme");
    var next = cur === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try { localStorage.setItem("pahlavon-theme", next); } catch (e) {}
    setMeta("theme-color", next === "dark" ? "#1A1A1A" : "#F7F3E8");
  });

  /* ================= ЛОГОТИП / ЭМБЛЕМА / ПАТТЕРН ================= */
  document.getElementById("logo").innerHTML = window.PAHLAVON_LOGO();
  document.getElementById("footerLogo").innerHTML = window.PAHLAVON_LOGO();
  document.getElementById("aboutEmblem").innerHTML = window.PAHLAVON_EMBLEM();
  var heroP = window.HERO_PATTERN();
  if (reduced) heroP = heroP.replace(/<animateTransform[^>]*\/>/g, ""); // reduced-motion: без дрейфа
  document.getElementById("heroPattern").innerHTML = heroP;

  /* ================= ШАПКА: скролл + бургер ================= */
  var header = document.getElementById("header");
  var toTop = document.getElementById("toTop");
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle("scrolled", y > 30);
    toTop.classList.toggle("show", y > 600);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  toTop.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" }); });

  var menu = document.getElementById("mobileMenu");
  function setMenu(open) {
    menu.classList.toggle("open", open);
    menu.setAttribute("aria-hidden", open ? "false" : "true");
    document.getElementById("burger").setAttribute("aria-expanded", open ? "true" : "false");
    document.body.style.overflow = open ? "hidden" : "";
  }
  document.getElementById("burger").addEventListener("click", function () { setMenu(true); });
  document.getElementById("menuClose").addEventListener("click", function () { setMenu(false); });
  menu.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });

  /* ================= FAQ-аккордеон (ТЗ §8.9) ================= */
  function bindFaq() {
    document.querySelectorAll(".faq-q").forEach(function (q) {
      q.addEventListener("click", function () {
        var open = q.getAttribute("aria-expanded") === "true";
        q.setAttribute("aria-expanded", open ? "false" : "true");
        var a = document.getElementById(q.getAttribute("aria-controls"));
        a.style.maxHeight = open ? "0" : a.scrollHeight + "px";
      });
    });
  }

  /* ================= КАЛЬКУЛЯТОР ПОТЕРЬ (ТЗ §6.4) ================= */
  var calcLoss = document.getElementById("calcLoss");
  var calcType = document.getElementById("calcType");
  // множители риска по типу объекта
  var TYPE_MULT = [1.4, 1.1, 1.6, 0.8];
  function fmt(n) { return Math.round(n).toLocaleString("ru-RU").replace(/,/g, " "); }
  function updateCalc() {
    var base = +calcLoss.value;
    var mult = TYPE_MULT[+calcType.value] || 1;
    document.getElementById("calcLossVal").textContent = fmt(base);
    animateCount(document.getElementById("calcResult"), base * 12 * mult);
  }
  calcLoss.addEventListener("input", updateCalc);
  calcType.addEventListener("change", updateCalc);

  /* ================= СЧЁТЧИКИ (count-up, ТЗ §8.3) ================= */
  function animateCount(el, target) {
    if (reduced) { el.textContent = fmt(target); return; }
    var start = parseInt((el.textContent || "0").replace(/\s/g, "")) || 0;
    var t0 = performance.now(), dur = 700;
    function step(now) {
      var p = Math.min(1, (now - t0) / dur);
      el.textContent = fmt(start + (target - start) * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ================= ПОЯВЛЕНИЕ + ЗАПУСК АНИМАЦИЙ (ТЗ §7, §11) ================= */
  var io;
  function observeReveal() {
    if (io) io.disconnect();
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) {
          e.target.classList.remove("anim-on"); // пауза вне экрана (ТЗ §11)
          return;
        }
        e.target.classList.add("in");
        var svc = e.target.querySelector(".service-anim svg") || (e.target.classList.contains("svc") ? e.target : null);
        e.target.querySelectorAll(".svc").forEach(function (s) { s.classList.add("anim-on"); });
        // count-up для блока «О компании»
        e.target.querySelectorAll("[data-count]").forEach(function (c) {
          var m = c.getAttribute("data-count").match(/\d+/);
          if (m) { var suf = c.getAttribute("data-count").replace(/\d+/, ""); var to = +m[0];
            (function (node, val, sfx) {
              if (reduced) return;
              var t0 = performance.now();
              function st(now) { var p = Math.min(1, (now - t0) / 900); node.textContent = Math.round(val * p) + sfx; if (p < 1) requestAnimationFrame(st); }
              node.textContent = "0" + sfx; requestAnimationFrame(st);
            })(c, to, suf);
          }
        });
      });
    }, { threshold: 0.18 });
    document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });
  }

  /* ================= ФОРМА ЗАЯВКИ (ТЗ §9.1) ================= */
  // Переиспользуемая маска телефона +992
  function attachPhoneMask(el) {
    el.addEventListener("input", function () {
      var d = el.value.replace(/\D/g, "");
      if (d.startsWith("992")) d = d.slice(3);
      d = d.slice(0, 9);
      var out = "+992";
      if (d.length) out += " " + d.slice(0, 3);
      if (d.length > 3) out += " " + d.slice(3, 5);
      if (d.length > 5) out += " " + d.slice(5, 7);
      if (d.length > 7) out += " " + d.slice(7, 9);
      el.value = out;
    });
  }
  function setErr(id, on) { document.getElementById(id).closest(".field").classList.toggle("field--error", on); }

  var form = document.getElementById("auditForm");
  var phone = document.getElementById("fPhone");
  attachPhoneMask(phone);

  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    var ok = true;
    var name = document.getElementById("fName");
    if (!name.value.trim()) { setErr("fName", true); ok = false; } else setErr("fName", false);
    var digits = phone.value.replace(/\D/g, "");
    if (digits.length < 12) { setErr("fPhone", true); ok = false; } else setErr("fPhone", false);
    var consent = document.getElementById("fConsent");
    if (!consent.checked) { setErr("fConsent", true); ok = false; } else setErr("fConsent", false);
    // honeypot: если заполнено — тихо игнорируем (бот)
    if (form.querySelector('[name="company"]').value) return;
    if (!ok) return;

    // Демо-отправка: формируем сообщение и открываем Telegram/почту.
    // На проде заменить на серверный роут → e-mail (sales@pahlavon.tj) и/или Telegram Bot API (ТЗ §9.1).
    var msg = "Заявка с сайта pahlavon.tj%0A" +
      "Имя: " + encodeURIComponent(name.value) + "%0A" +
      "Телефон: " + encodeURIComponent(phone.value) + "%0A" +
      "Услуга: " + encodeURIComponent(document.getElementById("fType").value || "—") + "%0A" +
      "Комментарий: " + encodeURIComponent(document.getElementById("fComment").value || "—");
    form.style.display = "none";
    document.getElementById("formSuccess").classList.add("show");
    // ненавязчиво предлагаем отправить в Telegram
    window.open("https://t.me/pahlavonagency?text=" + msg, "_blank");
  });

  /* ================= ОТКЛИК НА ВАКАНСИЮ (модальное окно) ================= */
  var applyModal = document.getElementById("applyModal");
  var applyForm = document.getElementById("applyForm");
  var aPhone = document.getElementById("aPhone");
  attachPhoneMask(aPhone);

  function openApply(position) {
    applyForm.reset();
    applyForm.style.display = "";
    document.getElementById("applySuccess").classList.remove("show");
    document.getElementById("aPosition").value = position || "";
    ["aName", "aPhone", "aConsent"].forEach(function (id) { setErr(id, false); });
    applyModal.classList.add("open");
    applyModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    setTimeout(function () { document.getElementById("aName").focus(); }, 60);
  }
  function closeApply() {
    applyModal.classList.remove("open");
    applyModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }
  window.openApply = openApply;

  applyModal.querySelectorAll("[data-close]").forEach(function (el) { el.addEventListener("click", closeApply); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && applyModal.classList.contains("open")) closeApply(); });
  var resumeBtn = document.getElementById("sendResumeBtn");
  if (resumeBtn) resumeBtn.addEventListener("click", function () { openApply(""); });

  applyForm.addEventListener("submit", function (ev) {
    ev.preventDefault();
    var ok = true;
    var name = document.getElementById("aName");
    if (!name.value.trim()) { setErr("aName", true); ok = false; } else setErr("aName", false);
    if (aPhone.value.replace(/\D/g, "").length < 12) { setErr("aPhone", true); ok = false; } else setErr("aPhone", false);
    var consent = document.getElementById("aConsent");
    if (!consent.checked) { setErr("aConsent", true); ok = false; } else setErr("aConsent", false);
    if (!ok) return;

    var position = document.getElementById("aPosition").value;
    var msgText = document.getElementById("aMessage").value;
    // Сохраняем отклик локально — его видно в админ-панели (admin.html).
    // На проде заменить на серверный API (см. README).
    if (window.VacancyStore) {
      window.VacancyStore.addApplication({
        id: window.VacancyStore.newId(),
        ts: Date.now(),
        type: "vacancy",
        position: position || "—",
        name: name.value.trim(),
        phone: aPhone.value,
        message: msgText,
        lang: state.lang,
        status: "new",
      });
    }
    applyForm.style.display = "none";
    document.getElementById("applySuccess").classList.add("show");

    var tg = "Отклик на вакансию (pahlavon.tj)%0A" +
      "Должность: " + encodeURIComponent(position || "—") + "%0A" +
      "Имя: " + encodeURIComponent(name.value) + "%0A" +
      "Телефон: " + encodeURIComponent(aPhone.value) + "%0A" +
      "О себе: " + encodeURIComponent(msgText || "—");
    window.open("https://t.me/pahlavonagency?text=" + tg, "_blank");
  });

  /* ================= ГОД В ПОДВАЛЕ ================= */
  document.getElementById("year").textContent = new Date().getFullYear();

  /* ================= СТАРТ ================= */
  setLang(state.lang);
})();
