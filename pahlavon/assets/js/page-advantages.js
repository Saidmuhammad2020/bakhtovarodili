/* =================================================================
   ПАХЛАВОН — Страница «Преимущества»
   ================================================================= */
(function () {
  "use strict";
  function renderAdvantages(t) {
    document.getElementById("featureGrid").innerHTML = t("advantages.items").map(function (a) {
      return '<div class="feature reveal"><svg class="feature__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l8 4v6c0 5-8 10-8 10S4 17 4 12V6z"/><path d="M9 12l2 2 4-4"/></svg>' +
        "<h3>" + a.t + "</h3><p>" + a.d + "</p></div>";
    }).join("");
    document.getElementById("statsRow").innerHTML = t("hero.stats").map(function (s) {
      return '<div class="stat-card"><div class="num">' + s.num + '</div><div class="cap">' + s.cap + "</div></div>";
    }).join("");
  }
  Common.boot(renderAdvantages, "advantages.meta");
})();
