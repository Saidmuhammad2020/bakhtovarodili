/* =================================================================
   ПАХЛАВОН — Страница «Услуги» (обзор всех 8 услуг)
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
  window.SERVICE_HREF = {
    video: "service-video.html", access: "service-access.html", fire: "service-fire.html",
    monitoring: "service-monitoring.html", guard: "service-guard.html", gps: "service-gps.html",
    service: "service-maintenance.html", events: "service-events.html",
  };

  function renderServices(t) {
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
            '<a href="' + window.SERVICE_HREF[k] + '" class="btn btn--ghost btn--sm">' + t("common.more") + "</a>" +
            '<a href="contacts.html" class="btn btn--primary btn--sm">' + t("common.request") + "</a>" +
          "</div>" +
        "</div></article>";
    }).join("");
    grid.querySelectorAll("[data-anim]").forEach(function (el) {
      var fn = window.SERVICE_ANIMS[el.getAttribute("data-anim")];
      if (fn) el.innerHTML = fn();
    });
  }

  Common.boot(renderServices, "services");
})();
