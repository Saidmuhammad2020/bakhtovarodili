/* =================================================================
   ПАХЛАВОН — Шаблон страницы отдельной услуги
   Один скрипт обслуживает все 8 страниц услуг: конкретная услуга
   определяется атрибутом data-service на <body> (video/access/fire/
   monitoring/guard/gps/service/events).
   ================================================================= */
(function () {
  "use strict";
  var KEY = document.body.getAttribute("data-service");

  var ICONS = {
    video: '<path d="M2 7l8 5-8 5V7z"/><rect x="10" y="5" width="12" height="14" rx="2"/>',
    access: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0"/>',
    fire: '<path d="M12 2s5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 1-3s3 2 4-7z"/>',
    monitoring: '<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/>',
    guard: '<path d="M12 2l8 4v6c0 5-8 10-8 10S4 17 4 12V6z"/>',
    gps: '<circle cx="12" cy="10" r="3"/><path d="M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11z"/>',
    service: '<circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.4-2.3 1a7 7 0 0 0-1.7-1l-.3-2.5h-4l-.3 2.5a7 7 0 0 0-1.7 1l-2.3-1-2 3.4 2 1.5a7 7 0 0 0 0 2l-2 1.5 2 3.4 2.3-1a7 7 0 0 0 1.7 1l.3 2.5h4l.3-2.5a7 7 0 0 0 1.7-1l2.3 1 2-3.4-2-1.5a7 7 0 0 0 .1-1z"/>',
    events: '<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20a6 6 0 0 1 12 0M14 20a5 5 0 0 1 7 0"/>',
  };
  var HREF = {
    video: "service-video.html", access: "service-access.html", fire: "service-fire.html",
    monitoring: "service-monitoring.html", guard: "service-guard.html", gps: "service-gps.html",
    service: "service-maintenance.html", events: "service-events.html",
  };
  var CHECK_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg>';

  function renderDetail(t) {
    var p = t("services.pages." + KEY);
    var teaser = t("services.items." + KEY);

    document.getElementById("svcIcon").innerHTML = ICONS[KEY];
    document.getElementById("svcCrumb").textContent = teaser.title;
    document.getElementById("svcLabel").textContent = teaser.sub;
    document.getElementById("svcTitle").textContent = p.hero.title;
    document.getElementById("svcSubtitle").textContent = p.hero.subtitle;
    document.getElementById("svcAnim").innerHTML = window.SERVICE_ANIMS[KEY]();

    // Что это и зачем
    document.getElementById("introTitle").textContent = p.intro.title;
    document.getElementById("introLead").textContent = p.intro.lead;
    document.getElementById("introGrid").innerHTML = p.intro.items.map(function (it) {
      return '<div class="feature reveal"><svg class="feature__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="9"/></svg>' +
        "<h3>" + it.title + "</h3><p>" + it.desc + "</p></div>";
    }).join("");

    // Как это работает
    document.getElementById("capTitle").textContent = p.capabilities.title;
    document.getElementById("capLead").textContent = p.capabilities.lead;
    document.getElementById("capList").innerHTML = p.capabilities.items.map(function (it, i) {
      return '<div class="capability reveal"><div class="capability__num">' + (i + 1) + "</div><div><h3>" + it.title + "</h3><p>" + it.desc + "</p></div></div>";
    }).join("");

    // Оборудование
    document.getElementById("eqTitle").textContent = p.equipment.title;
    document.getElementById("eqLead").textContent = p.equipment.lead;
    document.getElementById("eqGrid").innerHTML = p.equipment.items.map(function (it) {
      return '<div class="equipment-card reveal"><svg class="equipment-card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M9 9h6v6H9z"/></svg>' +
        "<h3>" + it.title + "</h3><p>" + it.desc + "</p></div>";
    }).join("");

    // Применение
    document.getElementById("appliedTitle").textContent = p.applied.title;
    document.getElementById("objectsTitle").textContent = p.applied.objectsTitle;
    document.getElementById("objectsList").innerHTML = p.applied.objects.map(function (o) { return "<li>" + o + "</li>"; }).join("");
    document.getElementById("benefitsTitle").textContent = p.applied.benefitsTitle;
    document.getElementById("benefitsList").innerHTML = p.applied.benefits.map(function (b) { return "<li>" + b + "</li>"; }).join("");

    // Итог
    document.getElementById("summaryTitle").textContent = p.summary.title;
    document.getElementById("summaryList").innerHTML = p.summary.items.map(function (s) {
      return '<li><span class="check">' + CHECK_SVG + "</span><span>" + s + "</span></li>";
    }).join("");

    // Другие услуги
    document.getElementById("relatedTitle").textContent = t("services.relatedTitle");
    var allKeys = ["video", "access", "fire", "monitoring", "guard", "gps", "service", "events"];
    var others = allKeys.filter(function (k) { return k !== KEY; });
    // детерминированный, но «перемешанный» выбор трёх других услуг
    var seed = allKeys.indexOf(KEY);
    var picks = [others[seed % others.length], others[(seed + 2) % others.length], others[(seed + 4) % others.length]];
    document.getElementById("relatedGrid").innerHTML = picks.map(function (k) {
      var rt = t("services.items." + k);
      return '<a class="related-card reveal" href="' + HREF[k] + '">' +
        '<svg class="related-card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' + ICONS[k] + "</svg>" +
        "<h3>" + rt.title + "</h3><span>" + t("common.more") + " →</span></a>";
    }).join("");
  }

  Common.boot(renderDetail, "services.pages." + KEY + ".meta");
})();
