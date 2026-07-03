/* =================================================================
   ПАХЛАВОН — Страница «Кейсы и объекты»
   Иллюстрации кейсов — тематические SVG (камера, щит, наблюдение,
   дом, GPS, здание) вместо абстрактных плейсхолдеров: связаны с тем,
   чем мы занимаемся. Само-содержащиеся (работают через file://),
   цвет иконки берётся из бренд-переменной --accent, реагирует на тему.
   ================================================================= */
(function () {
  "use strict";

  /* Линейные иконки по тематике услуги (stroke = бренд-акцент). */
  var ICONS = [
    /* 0 — видеонаблюдение / камера */
    '<rect x="74" y="43" width="30" height="17" rx="3"/>' +
      '<path d="M104 47 l14 -5 v17 l-14 -5"/>' +
      '<line x1="82" y1="60" x2="82" y2="70"/><line x1="75" y1="70" x2="91" y2="70"/>',
    /* 1 — физическая охрана / щит */
    '<path d="M100 32 l17 6 v11 c0 13 -9 21 -17 25 c-8 -4 -17 -12 -17 -25 v-11 z"/>' +
      '<path d="M91 53 l6 6 13 -13"/>',
    /* 2 — наблюдение / «глаз» */
    '<path d="M72 52 q28 -23 56 0 q-28 23 -56 0 z"/>' +
      '<circle cx="100" cy="52" r="8"/><circle cx="100" cy="52" r="2.5" fill="var(--accent)"/>',
    /* 3 — частный дом + тревога */
    '<path d="M80 55 l20 -17 20 17"/>' +
      '<path d="M85 53 v21 h30 v-21"/>' +
      '<rect x="95" y="62" width="10" height="12" rx="1"/>',
    /* 4 — GPS-мониторинг транспорта */
    '<path d="M100 34 a13 13 0 0 1 13 13 c0 10 -13 23 -13 23 c0 0 -13 -13 -13 -23 a13 13 0 0 1 13 -13 z"/>' +
      '<circle cx="100" cy="47" r="5"/>',
    /* 5 — бизнес-центр / здание */
    '<rect x="80" y="36" width="24" height="40" rx="1"/>' +
      '<rect x="104" y="48" width="16" height="28" rx="1"/>' +
      '<line x1="86" y1="44" x2="98" y2="44"/><line x1="86" y1="52" x2="98" y2="52"/>' +
      '<line x1="86" y1="60" x2="98" y2="60"/><line x1="109" y1="56" x2="115" y2="56"/>' +
      '<line x1="109" y1="64" x2="115" y2="64"/>',
  ];

  function scene(i) {
    var g = "cg" + i;
    return '<svg viewBox="0 0 200 110" preserveAspectRatio="xMidYMid slice" style="aspect-ratio:200/110" aria-hidden="true">' +
      '<defs>' +
        '<linearGradient id="' + g + '" x1="0" y1="0" x2="0" y2="1">' +
          '<stop offset="0" stop-color="#26262a"/><stop offset="1" stop-color="#171719"/>' +
        '</linearGradient>' +
        '<radialGradient id="' + g + 'r" cx="0.82" cy="0.12" r="0.95">' +
          '<stop offset="0" stop-color="var(--accent)" stop-opacity=".22"/>' +
          '<stop offset="1" stop-color="var(--accent)" stop-opacity="0"/>' +
        '</radialGradient>' +
      '</defs>' +
      '<rect width="200" height="110" fill="url(#' + g + ')"/>' +
      '<rect width="200" height="110" fill="url(#' + g + 'r)"/>' +
      /* мягкие радар-дуги вместо треугольников */
      '<g fill="none" stroke="var(--accent)" stroke-width="1" opacity=".14">' +
        '<circle cx="150" cy="18" r="40"/><circle cx="150" cy="18" r="62"/>' +
      '</g>' +
      '<g fill="none" stroke="var(--accent)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" opacity=".9">' +
        ICONS[i % ICONS.length] +
      '</g>' +
    '</svg>';
  }

  function renderCases(t) {
    document.getElementById("casesGrid").innerHTML = t("cases.items").map(function (c, i) {
      return '<div class="case reveal" style="aspect-ratio:auto;display:flex;flex-direction:column">' +
        scene(i) +
        '<div style="padding:1.4rem;flex:1;display:flex;flex-direction:column">' +
          "<b style=\"font-size:1.1rem\">" + c.t + "</b>" +
          '<span style="color:var(--accent-text);font-size:.85rem;font-weight:700;margin:.4rem 0 .8rem">' + c.d + "</span>" +
          '<p style="color:var(--text-muted);font-size:.92rem;margin:0">' + (c.text || "") + "</p>" +
        "</div></div>";
    }).join("");
  }
  Common.boot(renderCases, "cases.meta");
})();
