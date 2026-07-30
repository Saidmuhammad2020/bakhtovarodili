/* =================================================================
   ПАХЛАВОН — Страница «Карьера»
   Список вакансий; отклик идёт напрямую в Telegram HR-менеджера
   (аккаунт задаётся в админке, «Контакты и бренд» → telegramHr).
   ================================================================= */
(function () {
  "use strict";

  function vacField(v, key, lang) { var f = v[key] || {}; return f[lang] || f.ru || ""; }

  /* Ссылка на Telegram HR с предзаполненным текстом отклика. */
  function tgApplyLink(position) {
    var s = (window.SettingsStore ? window.SettingsStore.all() : {});
    var handle = (s.telegramHr || s.telegram || "").replace(/^@/, "");
    var text = position
      ? "Здравствуйте! Хочу откликнуться на вакансию: " + position
      : "Здравствуйте! Хочу отправить резюме в «Пахлавон».";
    return "https://t.me/" + handle + "?text=" + encodeURIComponent(text);
  }

  function renderCareers(t, lang) {
    var list = (window.VacancyStore ? window.VacancyStore.all() : []);
    document.getElementById("careersCount").textContent = list.length;
    var grid = document.getElementById("careersGrid");
    if (!list.length) {
      grid.innerHTML = '<div class="careers-empty">' + t("careers.empty") + "</div>";
    } else {
      grid.innerHTML = list.map(function (v) {
        var typeLabel = t("careers.employmentTypes." + v.type) || v.type;
        var title = vacField(v, "title", lang);
        return '<article class="vacancy reveal">' +
          '<div class="vacancy__meta">' +
            '<span class="tag tag--accent">' + typeLabel + "</span>" +
            (v.location ? '<span class="tag">' + v.location + "</span>" : "") +
            /* Оплата показывается, только если она явно указана в админке */
            (v.salary ? '<span class="tag">' + v.salary + "</span>" : "") +
          "</div>" +
          "<h3>" + title + "</h3>" +
          '<p class="vacancy__desc">' + vacField(v, "desc", lang) + "</p>" +
          '<a class="btn btn--primary btn--sm" target="_blank" rel="noopener" href="' +
            tgApplyLink(title) + '">' + t("careers.applyBtn") + "</a>" +
          "</article>";
      }).join("");
    }

    var resumeBtn = document.getElementById("sendResumeBtn");
    if (resumeBtn) resumeBtn.setAttribute("href", tgApplyLink(""));

    document.getElementById("cultureGrid").innerHTML = t("careers.culture.items").map(function (c) {
      return '<div class="culture-card reveal"><svg class="culture-card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="9"/></svg>' +
        "<h3>" + c.title + "</h3><p>" + c.desc + "</p></div>";
    }).join("");
  }

  Common.boot(renderCareers, "careers.meta");
})();
