/* =================================================================
   ПАХЛАВОН — Страница «Кейсы и объекты»
   ================================================================= */
(function () {
  "use strict";
  function renderCases(t) {
    var swatch = ["#2E2E2E", "#3a3a3a", "#262626", "#333", "#2a2a2a", "#383838"];
    document.getElementById("casesGrid").innerHTML = t("cases.items").map(function (c, i) {
      return '<div class="case reveal" style="aspect-ratio:auto;display:flex;flex-direction:column">' +
        '<svg viewBox="0 0 200 110" preserveAspectRatio="xMidYMid slice" style="aspect-ratio:200/110"><rect width="200" height="110" fill="' + swatch[i % 6] + '"/>' +
        '<path d="M40 4 L74 62 L6 62 Z" fill="var(--accent)" opacity=".12"/><path d="M160 60 L194 110 L126 110 Z" fill="var(--accent)" opacity=".08"/>' +
        '<path d="M100 30 l9 18 20 3 -14 14 3 20 -18 -9 -18 9 3 -20 -14 -14 20 -3Z" fill="var(--accent)" opacity=".35"/></svg>' +
        '<div style="padding:1.4rem;flex:1;display:flex;flex-direction:column">' +
          "<b style=\"font-size:1.1rem\">" + c.t + "</b>" +
          '<span style="color:var(--accent-text);font-size:.85rem;font-weight:700;margin:.4rem 0 .8rem">' + c.d + "</span>" +
          '<p style="color:var(--text-muted);font-size:.92rem;margin:0">' + (c.text || "") + "</p>" +
        "</div></div>";
    }).join("");
  }
  Common.boot(renderCases, "cases.meta");
})();
