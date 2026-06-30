/* =================================================================
   ПАХЛАВОН — Страница «О компании»
   ================================================================= */
(function () {
  "use strict";
  function renderAbout(t) {
    document.getElementById("aboutCounters").innerHTML = t("about.counters").map(function (c) {
      return '<div class="counter"><div class="num" data-count="' + c.num + '">' + c.num + '</div><div class="cap">' + c.cap + "</div></div>";
    }).join("");
    document.getElementById("valuesGrid").innerHTML = t("about.values.items").map(function (v) {
      return '<div class="value-card reveal"><svg class="value-card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l8 4v6c0 5-8 10-8 10S4 17 4 12V6z"/><path d="M9 12l2 2 4-4"/></svg>' +
        "<h3>" + v.title + "</h3><p>" + v.desc + "</p></div>";
    }).join("");
  }
  Common.boot(renderAbout, "about.meta");
})();
