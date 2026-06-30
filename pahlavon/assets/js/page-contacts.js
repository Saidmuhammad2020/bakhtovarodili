/* =================================================================
   ПАХЛАВОН — Страница «Контакты»
   Форма заявки на аудит с валидацией, маской телефона и honeypot.
   ================================================================= */
(function () {
  "use strict";

  function renderContacts(t) {
    var fsel = document.getElementById("fType");
    fsel.innerHTML = t("contacts.form.typeOptions").map(function (x, i) {
      return '<option value="' + (i ? x : "") + '"' + (i ? "" : " disabled selected") + ">" + x + "</option>";
    }).join("");
  }

  var form = document.getElementById("auditForm");
  var phone = document.getElementById("fPhone");
  Common.attachPhoneMask(phone);

  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    var ok = true;
    var name = document.getElementById("fName");
    if (!name.value.trim()) { Common.setErr("fName", true); ok = false; } else Common.setErr("fName", false);
    var digits = phone.value.replace(/\D/g, "");
    if (digits.length < 12) { Common.setErr("fPhone", true); ok = false; } else Common.setErr("fPhone", false);
    var consent = document.getElementById("fConsent");
    if (!consent.checked) { Common.setErr("fConsent", true); ok = false; } else Common.setErr("fConsent", false);
    if (form.querySelector('[name="company"]').value) return; // honeypot
    if (!ok) return;

    var msg = "Заявка с сайта pahlavon.tj%0A" +
      "Имя: " + encodeURIComponent(name.value) + "%0A" +
      "Телефон: " + encodeURIComponent(phone.value) + "%0A" +
      "Услуга: " + encodeURIComponent(document.getElementById("fType").value || "—") + "%0A" +
      "Комментарий: " + encodeURIComponent(document.getElementById("fComment").value || "—");

    var application = {
      id: (window.VacancyStore ? window.VacancyStore.newId() : "id-" + Date.now()),
      ts: Date.now(), type: "audit",
      position: document.getElementById("fType").value || "—",
      name: name.value.trim(), phone: phone.value,
      message: document.getElementById("fComment").value || "",
      lang: Common.state.lang, status: "new",
    };
    if (window.PahlavonAPI && window.PahlavonAPI.enabled()) {
      window.PahlavonAPI.postApplication(application).catch(function () {
        if (window.VacancyStore) window.VacancyStore.addApplication(application);
      });
    } else if (window.VacancyStore) {
      window.VacancyStore.addApplication(application);
    }

    form.style.display = "none";
    document.getElementById("formSuccess").classList.add("show");
    window.open("https://t.me/pahlavonagency?text=" + msg, "_blank");
  });

  Common.boot(renderContacts, "contacts.meta");

  // Если пришли по якорю #audit-form (например, кнопка в шапке), прокрутить и сфокусировать форму
  if (location.hash === "#audit-form") {
    setTimeout(function () {
      var el = document.getElementById("audit-form");
      if (el) { el.scrollIntoView({ behavior: Common.reduced ? "auto" : "smooth", block: "start" }); }
    }, 300);
  }
})();
