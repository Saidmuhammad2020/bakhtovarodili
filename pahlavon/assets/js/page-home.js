/* =================================================================
   ПАХЛАВОН — Главная страница (компактный хаб со ссылками на полные
   страницы услуг/о нас/преимуществ/кейсов/карьеры/контактов)
   ================================================================= */
(function () {
  "use strict";
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
  var SERVICE_HREF = {
    video: "service-video.html", access: "service-access.html", fire: "service-fire.html",
    monitoring: "service-monitoring.html", guard: "service-guard.html", gps: "service-gps.html",
    service: "service-maintenance.html", events: "service-events.html",
  };

  function renderServices(t) {
    var grid = document.getElementById("servicesGrid");
    grid.innerHTML = SERVICE_KEYS.map(function (k) {
      var s = t("services.items." + k);
      return '<article class="service-card reveal" data-svc="' + k + '">' +
        '<div class="service-anim" data-anim="' + k + '"></div>' +
        '<div class="service-card__body">' +
          '<svg class="service-card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' + SERVICE_ICONS[k] + '</svg>' +
          "<h3>" + s.title + "</h3>" +
          '<div class="service-card__sub">' + s.sub + "</div>" +
          '<p class="service-card__desc">' + s.desc + "</p>" +
          '<div class="service-card__actions">' +
            '<a href="' + SERVICE_HREF[k] + '" class="btn btn--ghost btn--sm">' + t("common.more") + "</a>" +
            '<a href="contacts.html" class="btn btn--primary btn--sm">' + t("common.request") + "</a>" +
          "</div>" +
        "</div></article>";
    }).join("");
    grid.querySelectorAll("[data-anim]").forEach(function (el) {
      var fn = window.SERVICE_ANIMS[el.getAttribute("data-anim")];
      if (fn) el.innerHTML = fn();
    });
  }

  function renderHeroStats(t) {
    document.getElementById("heroStats").innerHTML = t("hero.stats").map(function (s) {
      return '<div class="stat-card"><div class="num">' + s.num + '</div><div class="cap">' + s.cap + "</div></div>";
    }).join("");
  }
  function renderCounters(t) {
    document.getElementById("aboutCounters").innerHTML = t("about.counters").map(function (c) {
      return '<div class="counter"><div class="num" data-count="' + c.num + '">' + c.num + '</div><div class="cap">' + c.cap + "</div></div>";
    }).join("");
  }
  function renderFeatures(t) {
    document.getElementById("featureGrid").innerHTML = t("advantages.items").map(function (a) {
      return '<div class="feature reveal"><svg class="feature__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l8 4v6c0 5-8 10-8 10S4 17 4 12V6z"/><path d="M9 12l2 2 4-4"/></svg>' +
        "<h3>" + a.t + "</h3><p>" + a.d + "</p></div>";
    }).join("");
  }
  function renderProcess(t) {
    document.getElementById("processTimeline").innerHTML = t("process.steps").map(function (s, i) {
      return '<div class="step reveal"><div class="step__num">' + (i + 1) + "</div><h3>" + s.t + "</h3><p>" + s.d + "</p></div>";
    }).join("");
  }
  function renderCases(t) {
    var swatch = ["#2E2E2E", "#3a3a3a", "#262626", "#333", "#2a2a2a", "#383838"];
    document.getElementById("casesGrid").innerHTML = t("cases.items").map(function (c, i) {
      return '<div class="case reveal">' +
        '<svg viewBox="0 0 200 150" preserveAspectRatio="xMidYMid slice"><rect width="200" height="150" fill="' + swatch[i % 6] + '"/>' +
        '<path d="M40 4 L74 62 L6 62 Z" fill="var(--accent)" opacity=".12"/><path d="M160 88 L194 146 L126 146 Z" fill="var(--accent)" opacity=".08"/>' +
        '<path d="M100 50 l9 18 20 3 -14 14 3 20 -18 -9 -18 9 3 -20 -14 -14 20 -3Z" fill="var(--accent)" opacity=".35"/></svg>' +
        '<div class="case__tag"><b>' + c.t + "</b><span>" + c.d + "</span></div></div>";
    }).join("");
  }
  function renderReviews(t) {
    document.getElementById("reviewsList").innerHTML = t("reviews.items").map(function (r) {
      var initial = r.name.charAt(0);
      return '<div class="review reveal"><div class="review__stars">★★★★★</div><p>«' + r.text + '»</p>' +
        '<div class="review__author"><div class="review__avatar">' + initial + "</div><div><b>" + r.name + "</b><span>" + r.role + "</span></div></div></div>";
    }).join("");
  }
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
  function renderFaq(t) {
    document.getElementById("faqList").innerHTML = t("faq.items").map(function (f, i) {
      return '<div class="faq-item reveal"><button class="faq-q" aria-expanded="false" aria-controls="faqa' + i + '">' + f.q + "</button>" +
        '<div class="faq-a" id="faqa' + i + '" role="region"><div>' + f.a + "</div></div></div>";
    }).join("");
    bindFaq();
  }

  var TYPE_MULT = [1.4, 1.1, 1.6, 0.8];
  function setupCalc(t) {
    var calcLoss = document.getElementById("calcLoss");
    var calcType = document.getElementById("calcType");
    calcType.innerHTML = t("calc.types").map(function (x, i) { return '<option value="' + i + '">' + x + "</option>"; }).join("");
    function update() {
      var base = +calcLoss.value;
      var mult = TYPE_MULT[+calcType.value] || 1;
      document.getElementById("calcLossVal").textContent = Common.fmt(base);
      Common.animateCount(document.getElementById("calcResult"), base * 12 * mult);
    }
    calcLoss.oninput = update;
    calcType.onchange = update;
    update();
  }

  function renderHome(t) {
    renderServices(t);
    renderHeroStats(t);
    renderCounters(t);
    renderFeatures(t);
    renderProcess(t);
    renderCases(t);
    renderReviews(t);
    renderFaq(t);
    setupCalc(t);

    var heroP = window.HERO_PATTERN();
    if (Common.reduced) heroP = heroP.replace(/<animateTransform[^>]*\/>/g, "");
    document.getElementById("heroPattern").innerHTML = heroP;
  }

  Common.boot(renderHome, "meta");
})();
