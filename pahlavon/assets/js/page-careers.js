/* =================================================================
   ПАХЛАВОН — Страница «Карьера»
   Список вакансий + модальное окно отклика (с сохранением в
   VacancyStore/PahlavonAPI, видно в админ-панели).
   ================================================================= */
(function () {
  "use strict";
  var lastLang = "ru";

  function vacField(v, key, lang) { var f = v[key] || {}; return f[lang] || f.ru || ""; }

  function renderCareers(t, lang) {
    lastLang = lang;
    var list = (window.VacancyStore ? window.VacancyStore.all() : []);
    document.getElementById("careersCount").textContent = list.length;
    var grid = document.getElementById("careersGrid");
    if (!list.length) {
      grid.innerHTML = '<div class="careers-empty">' + t("careers.empty") + "</div>";
    } else {
      grid.innerHTML = list.map(function (v, i) {
        var typeLabel = t("careers.employmentTypes." + v.type) || v.type;
        var salary = v.salary || t("careers.salaryNegotiable");
        return '<article class="vacancy reveal">' +
          '<div class="vacancy__meta">' +
            '<span class="tag tag--accent">' + typeLabel + "</span>" +
            (v.location ? '<span class="tag">' + v.location + "</span>" : "") +
            '<span class="tag">' + salary + "</span>" +
          "</div>" +
          "<h3>" + vacField(v, "title", lang) + "</h3>" +
          '<p class="vacancy__desc">' + vacField(v, "desc", lang) + "</p>" +
          '<button class="btn btn--primary btn--sm" data-idx="' + i + '">' + t("careers.applyBtn") + "</button>" +
          "</article>";
      }).join("");
      grid.querySelectorAll("[data-idx]").forEach(function (b) {
        b.addEventListener("click", function () { openApply(vacField(list[+b.getAttribute("data-idx")], "title", lastLang)); });
      });
    }

    document.getElementById("cultureGrid").innerHTML = t("careers.culture.items").map(function (c) {
      return '<div class="culture-card reveal"><svg class="culture-card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="9"/></svg>' +
        "<h3>" + c.title + "</h3><p>" + c.desc + "</p></div>";
    }).join("");
  }

  /* ---------- Модальное окно отклика ---------- */
  var applyModal = document.getElementById("applyModal");
  var applyForm = document.getElementById("applyForm");
  var aPhone = document.getElementById("aPhone");
  Common.attachPhoneMask(aPhone);

  function openApply(position) {
    applyForm.reset();
    applyForm.style.display = "";
    document.getElementById("applySuccess").classList.remove("show");
    document.getElementById("aPosition").value = position || "";
    ["aName", "aPhone", "aConsent"].forEach(function (id) { Common.setErr(id, false); });
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
  applyModal.querySelectorAll("[data-close]").forEach(function (el) { el.addEventListener("click", closeApply); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && applyModal.classList.contains("open")) closeApply(); });
  document.getElementById("sendResumeBtn").addEventListener("click", function () { openApply(""); });

  applyForm.addEventListener("submit", function (ev) {
    ev.preventDefault();
    var ok = true;
    var name = document.getElementById("aName");
    if (!name.value.trim()) { Common.setErr("aName", true); ok = false; } else Common.setErr("aName", false);
    if (aPhone.value.replace(/\D/g, "").length < 12) { Common.setErr("aPhone", true); ok = false; } else Common.setErr("aPhone", false);
    var consent = document.getElementById("aConsent");
    if (!consent.checked) { Common.setErr("aConsent", true); ok = false; } else Common.setErr("aConsent", false);
    if (!ok) return;

    var position = document.getElementById("aPosition").value;
    var msgText = document.getElementById("aMessage").value;
    var application = {
      id: (window.VacancyStore ? window.VacancyStore.newId() : "id-" + Date.now()),
      ts: Date.now(), type: "vacancy",
      position: position || "—", name: name.value.trim(), phone: aPhone.value,
      message: msgText, lang: Common.state.lang, status: "new",
    };
    if (window.PahlavonAPI && window.PahlavonAPI.enabled()) {
      window.PahlavonAPI.postApplication(application).catch(function () {
        if (window.VacancyStore) window.VacancyStore.addApplication(application);
      });
    } else if (window.VacancyStore) {
      window.VacancyStore.addApplication(application);
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

  Common.boot(renderCareers, "careers.meta");
})();
