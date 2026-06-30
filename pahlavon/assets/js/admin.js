/* =================================================================
   ПАХЛАВОН — Админ-панель
   Управление вакансиями (CRUD) и просмотр откликов.

   ⚠ ВАЖНО: это клиентская демо-панель для статического сайта.
   • Вход проверяется в браузере — это НЕ настоящая защита.
   • Данные хранятся в localStorage этого браузера.
   На проде заменить на серверную аутентификацию и API/CMS (см. README).
   ================================================================= */
(function () {
  "use strict";

  // Демо-пароль. На проде убрать и проверять на сервере.
  var ADMIN_PASSWORD = "pahlavon2024";
  var AUTH_KEY = "pahlavon-admin-auth";

  var $ = function (id) { return document.getElementById(id); };
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  var TYPE_LABELS = { full: "Полная занятость", part: "Частичная занятость", shift: "Сменный график", remote: "Удалённо" };
  var LANG_NAMES = { ru: "RU", tg: "TJ", en: "EN" };

  /* Включён ли серверный режим */
  function API() { return window.PahlavonAPI && window.PahlavonAPI.enabled(); }
  function apiErr(e) { alert("Ошибка сервера: " + ((e && e.message) || e)); }

  /* ---------- Эмблемы ---------- */
  if (window.PAHLAVON_EMBLEM) {
    $("loginEmblem").outerHTML = window.PAHLAVON_EMBLEM().replace("<svg ", '<svg class="emb" ');
    $("headEmblem").outerHTML = window.PAHLAVON_EMBLEM().replace("<svg ", '<svg id="headEmblem" style="width:30px;height:30px" ');
  }

  /* ---------- Тема ---------- */
  $("themeToggle").addEventListener("click", function () {
    var cur = document.documentElement.getAttribute("data-theme");
    var next = cur === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try { localStorage.setItem("pahlavon-theme", next); } catch (e) {}
  });

  /* ================= ВХОД ================= */
  function isAuthed() { try { return sessionStorage.getItem(AUTH_KEY) === "1"; } catch (e) { return false; } }
  async function showApp() {
    $("loginView").hidden = true;
    $("adminView").hidden = false;
    if (API()) {
      try {
        await window.PahlavonAPI.syncDown();
        if (window.ContentStore && window.ContentStore.reapply) window.ContentStore.reapply();
      } catch (e) {}
    }
    renderVacList();
    renderAppList();
    buildContentEditor();
  }
  function showLogin() { $("loginView").hidden = false; $("adminView").hidden = true; }

  function loginOk() { try { sessionStorage.setItem(AUTH_KEY, "1"); } catch (e) {} $("pwdErr").style.display = "none"; showApp(); }
  function loginFail() { $("pwdErr").style.display = "block"; $("pwd").closest(".field").classList.add("field--error"); }

  $("loginForm").addEventListener("submit", function (e) {
    e.preventDefault();
    if (API()) {
      window.PahlavonAPI.login($("pwd").value).then(loginOk).catch(loginFail);
    } else if ($("pwd").value === ADMIN_PASSWORD) {
      loginOk();
    } else {
      loginFail();
    }
  });
  $("logoutBtn").addEventListener("click", function () {
    try { sessionStorage.removeItem(AUTH_KEY); } catch (e) {}
    if (API()) window.PahlavonAPI.logout();
    showLogin();
  });

  /* ================= ВКЛАДКИ ================= */
  var TABS = { content: ["tabContent", "panelContent"], vac: ["tabVac", "panelVac"], app: ["tabApp", "panelApp"], settings: ["tabSettings", "panelSettings"] };
  function selectTab(which) {
    Object.keys(TABS).forEach(function (k) {
      var sel = k === which;
      $(TABS[k][0]).setAttribute("aria-selected", sel ? "true" : "false");
      $(TABS[k][1]).hidden = !sel;
    });
    if (which === "content") buildContentEditor();
    if (which === "settings") loadSettings();
  }
  $("tabContent").addEventListener("click", function () { selectTab("content"); });
  $("tabVac").addEventListener("click", function () { selectTab("vac"); });
  $("tabApp").addEventListener("click", function () { selectTab("app"); });
  $("tabSettings").addEventListener("click", function () { selectTab("settings"); });

  /* ================= ВАКАНСИИ ================= */
  function renderVacList() {
    var list = window.VacancyStore.all();
    var box = $("vacList");
    if (!list.length) { box.innerHTML = '<div class="empty">Вакансий пока нет. Нажмите «Добавить вакансию».</div>'; return; }
    box.innerHTML = list.map(function (v, i) {
      var title = (v.title && (v.title.ru || v.title.en || v.title.tg)) || "(без названия)";
      var salary = v.salary || "по договорённости";
      return '<div class="vac-row">' +
        '<div class="grow">' +
          "<h4>" + esc(title) + "</h4>" +
          '<div class="meta">' + esc(TYPE_LABELS[v.type] || v.type) + " · " + esc(v.location || "—") + " · " + esc(salary) + "</div>" +
        "</div>" +
        '<div class="row-actions">' +
          '<button class="btn btn--ghost btn--sm" data-edit="' + i + '">Изменить</button>' +
          '<button class="btn btn--ghost btn--sm" data-del="' + i + '">Удалить</button>' +
        "</div>" +
      "</div>";
    }).join("");
    box.querySelectorAll("[data-edit]").forEach(function (b) { b.addEventListener("click", function () { openVac(+b.getAttribute("data-edit")); }); });
    box.querySelectorAll("[data-del]").forEach(function (b) { b.addEventListener("click", function () { delVac(+b.getAttribute("data-del")); }); });
  }

  function delVac(i) {
    var list = window.VacancyStore.all();
    if (!list[i]) return;
    var title = (list[i].title && list[i].title.ru) || "вакансию";
    if (!confirm("Удалить «" + title + "»?")) return;
    list.splice(i, 1);
    window.VacancyStore.save(list);
    if (API()) window.PahlavonAPI.putVacancies(list).catch(apiErr);
    renderVacList();
  }

  $("resetVacBtn").addEventListener("click", function () {
    if (!confirm("Сбросить список вакансий к стандартному набору? Ваши изменения будут потеряны.")) return;
    window.VacancyStore.resetDefaults();
    if (API()) window.PahlavonAPI.putVacancies(window.DEFAULT_VACANCIES).catch(apiErr);
    renderVacList();
  });

  /* ---- Редактор вакансии ---- */
  var vacModal = $("vacModal");
  var editIndex = -1;

  function openVac(i) {
    editIndex = (typeof i === "number") ? i : -1;
    var v = editIndex >= 0 ? window.VacancyStore.all()[editIndex] : null;
    $("vacModalTitle").textContent = v ? "Изменить вакансию" : "Новая вакансия";
    $("vType").value = (v && v.type) || "full";
    $("vLocation").value = (v && v.location) || "";
    $("vSalary").value = (v && v.salary) || "";
    ["ru", "tg", "en"].forEach(function (l) {
      $("vTitle_" + l).value = (v && v.title && v.title[l]) || "";
      $("vDesc_" + l).value = (v && v.desc && v.desc[l]) || "";
    });
    $("vTitle_ru").closest(".field").classList.remove("field--error");
    selectLangPane("ru");
    vacModal.classList.add("open");
    vacModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
  function closeVac() {
    vacModal.classList.remove("open");
    vacModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }
  vacModal.querySelectorAll("[data-vclose]").forEach(function (el) { el.addEventListener("click", closeVac); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && vacModal.classList.contains("open")) closeVac(); });
  $("addVacBtn").addEventListener("click", function () { openVac(-1); });

  function selectLangPane(lang) {
    document.querySelectorAll(".lang-tab").forEach(function (t) { t.setAttribute("aria-selected", t.getAttribute("data-lpane") === lang ? "true" : "false"); });
    document.querySelectorAll(".lang-pane").forEach(function (p) { p.hidden = p.getAttribute("data-lp") !== lang; });
  }
  document.querySelectorAll(".lang-tab").forEach(function (t) { t.addEventListener("click", function () { selectLangPane(t.getAttribute("data-lpane")); }); });

  $("vacForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var titleRu = $("vTitle_ru").value.trim();
    if (!titleRu) {
      $("vTitle_ru").closest(".field").classList.add("field--error");
      selectLangPane("ru");
      return;
    }
    var record = {
      id: (editIndex >= 0 && window.VacancyStore.all()[editIndex].id) || window.VacancyStore.newId(),
      type: $("vType").value,
      location: $("vLocation").value.trim(),
      salary: $("vSalary").value.trim(),
      title: { ru: titleRu, tg: $("vTitle_tg").value.trim(), en: $("vTitle_en").value.trim() },
      desc: { ru: $("vDesc_ru").value.trim(), tg: $("vDesc_tg").value.trim(), en: $("vDesc_en").value.trim() },
    };
    var list = window.VacancyStore.all();
    if (editIndex >= 0) list[editIndex] = record; else list.push(record);
    window.VacancyStore.save(list);
    if (API()) window.PahlavonAPI.putVacancies(list).catch(apiErr);
    closeVac();
    renderVacList();
  });

  /* ================= ОТКЛИКИ ================= */
  var lastApps = [];
  function renderAppList() {
    if (API()) {
      window.PahlavonAPI.getApplications().then(renderApps).catch(function () { renderApps(window.VacancyStore.applications()); });
    } else {
      renderApps(window.VacancyStore.applications());
    }
  }
  function renderApps(apps) {
    lastApps = apps;
    $("appCount").textContent = "Всего откликов: " + apps.length;
    var badge = $("appBadge");
    badge.textContent = apps.length;
    badge.style.display = apps.length ? "inline-block" : "none";
    var box = $("appList");
    if (!apps.length) { box.innerHTML = '<div class="empty">Откликов пока нет. Они появятся здесь после отправки формы на странице «Карьера».</div>'; return; }
    box.innerHTML = apps.map(function (a) {
      var when = new Date(a.ts).toLocaleString("ru-RU");
      var digits = String(a.phone || "").replace(/\D/g, "");
      return '<div class="app-card">' +
        '<div class="top">' +
          '<div><span class="name">' + esc(a.name) + "</span> · <a href=\"tel:+" + digits + '">' + esc(a.phone) + "</a></div>" +
          '<span class="when">' + esc(when) + " · " + esc(LANG_NAMES[a.lang] || a.lang || "") + "</span>" +
        "</div>" +
        '<div class="pos">' + esc(a.position || "—") + "</div>" +
        (a.message ? '<div class="msg">' + esc(a.message) + "</div>" : "") +
        '<div class="row-actions" style="margin-top:.8rem">' +
          '<a class="btn btn--ghost btn--sm" target="_blank" href="https://t.me/pahlavonagency">Telegram</a>' +
          '<button class="btn btn--ghost btn--sm" data-delapp="' + esc(a.id) + '">Удалить</button>' +
        "</div>" +
      "</div>";
    }).join("");
    box.querySelectorAll("[data-delapp]").forEach(function (b) {
      b.addEventListener("click", function () {
        if (!confirm("Удалить отклик?")) return;
        var id = b.getAttribute("data-delapp");
        if (API()) window.PahlavonAPI.deleteApplication(id).then(renderAppList).catch(apiErr);
        else { window.VacancyStore.deleteApplication(id); renderAppList(); }
      });
    });
  }

  $("clearAppBtn").addEventListener("click", function () {
    if (!confirm("Удалить все отклики безвозвратно?")) return;
    if (API()) window.PahlavonAPI.clearApplications().then(renderAppList).catch(apiErr);
    else { window.VacancyStore.clearApplications(); renderAppList(); }
  });

  function download(filename, text, mime) {
    var blob = new Blob([text], { type: mime || "text/plain;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 500);
  }

  $("exportJsonBtn").addEventListener("click", function () {
    download("pahlavon-applications.json", JSON.stringify(lastApps, null, 2), "application/json");
  });

  $("exportCsvBtn").addEventListener("click", function () {
    var apps = lastApps;
    var head = ["Дата", "Имя", "Телефон", "Должность", "Язык", "Сообщение"];
    function cell(s) { return '"' + String(s == null ? "" : s).replace(/"/g, '""') + '"'; }
    var rows = apps.map(function (a) {
      return [new Date(a.ts).toLocaleString("ru-RU"), a.name, a.phone, a.position, a.lang, a.message].map(cell).join(",");
    });
    download("pahlavon-applications.csv", "﻿" + head.map(cell).join(",") + "\n" + rows.join("\n"), "text/csv;charset=utf-8");
  });

  /* ================= КОНТЕНТ САЙТА ================= */
  var EDIT_LANG = "ru";
  var SECTION_NAMES = {
    meta: "SEO / мета-теги", nav: "Навигация", common: "Общие кнопки",
    hero: "Главный экран (Hero)", services: "Услуги", about: "О компании",
    advantages: "Преимущества", process: "Как мы работаем", cases: "Кейсы",
    partners: "Партнёры", reviews: "Отзывы", calc: "Калькулятор потерь",
    faq: "Вопросы и ответы (FAQ)", cta: "Призыв к действию (CTA)",
    careers: "Карьера / Вакансии", contacts: "Контакты и форма",
    footer: "Подвал", fab: "Плавающие кнопки связи",
  };

  function walkLeaves(baseNode, effNode, prefix, cb) {
    if (typeof baseNode === "string") {
      cb(prefix, baseNode, typeof effNode === "string" ? effNode : baseNode);
    } else if (Array.isArray(baseNode)) {
      baseNode.forEach(function (v, i) { walkLeaves(v, effNode ? effNode[i] : undefined, prefix + "." + i, cb); });
    } else if (baseNode && typeof baseNode === "object") {
      Object.keys(baseNode).forEach(function (k) { walkLeaves(baseNode[k], effNode ? effNode[k] : undefined, prefix ? prefix + "." + k : k, cb); });
    }
  }

  function fieldRow(path, val, baseVal) {
    var long = val.length > 60 || /\n/.test(val);
    var changed = val !== baseVal;
    var ctrl = long
      ? '<textarea data-path="' + esc(path) + '">' + esc(val) + "</textarea>"
      : '<input type="text" data-path="' + esc(path) + '" value="' + esc(val) + '">';
    return '<div class="crow' + (changed ? " changed" : "") + '"><label>' + esc(path) + "</label>" + ctrl + "</div>";
  }

  function buildContentEditor() {
    var lang = EDIT_LANG;
    var base = window.BASE_LOCALES[lang];
    var eff = window.LOCALES[lang];
    var html = "";
    Object.keys(base).forEach(function (section) {
      var rows = "", count = 0;
      walkLeaves(base[section], eff[section], section, function (path, baseVal, effVal) {
        rows += fieldRow(path, effVal, baseVal); count++;
      });
      html += '<details class="csec"><summary>' + esc(SECTION_NAMES[section] || section) +
        '<span class="cnt">' + count + " полей</span></summary><div class=\"cfields\">" + rows + "</div></details>";
    });
    $("contentEditor").innerHTML = html;
    $("contentEditor").querySelectorAll("[data-path]").forEach(function (el) {
      el.addEventListener("input", function () {
        var baseVal = window.ContentStore.getPath(base, el.getAttribute("data-path"));
        el.closest(".crow").classList.toggle("changed", el.value !== String(baseVal));
      });
    });
  }

  function saveContent() {
    var lang = EDIT_LANG;
    var base = window.BASE_LOCALES[lang];
    var ov = window.ContentStore.overrides();
    var changed = {};
    $("contentEditor").querySelectorAll("[data-path]").forEach(function (el) {
      var path = el.getAttribute("data-path");
      var baseVal = window.ContentStore.getPath(base, path);
      if (el.value !== String(baseVal)) changed[path] = el.value;
    });
    ov[lang] = changed;
    window.ContentStore.save(ov);
    window.ContentStore.apply();
    if (API()) {
      window.PahlavonAPI.putContent(ov)
        .then(function () { alert("Контент сохранён на сервере (" + lang.toUpperCase() + "). Изменения видны всем посетителям."); })
        .catch(apiErr);
    } else {
      alert("Контент сохранён (" + lang.toUpperCase() + "). Обновите вкладку с сайтом, чтобы увидеть изменения.");
    }
  }

  document.querySelectorAll(".clang").forEach(function (b) {
    b.addEventListener("click", function () {
      EDIT_LANG = b.getAttribute("data-clang");
      document.querySelectorAll(".clang").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      buildContentEditor();
    });
  });
  $("contentSave").addEventListener("click", saveContent);
  $("contentSave2").addEventListener("click", saveContent);
  $("contentExpand").addEventListener("click", function () {
    var open = this.getAttribute("data-open") === "1";
    document.querySelectorAll(".csec").forEach(function (d) { d.open = !open; });
    this.setAttribute("data-open", open ? "0" : "1");
    this.textContent = open ? "Развернуть всё" : "Свернуть всё";
  });
  $("contentReset").addEventListener("click", function () {
    if (!confirm("Сбросить весь текст для языка " + EDIT_LANG.toUpperCase() + " к стандартному?")) return;
    window.ContentStore.resetLang(EDIT_LANG);
    window.LOCALES[EDIT_LANG] = JSON.parse(JSON.stringify(window.BASE_LOCALES[EDIT_LANG]));
    window.ContentStore.apply();
    buildContentEditor();
  });

  /* ================= КОНТАКТЫ И БРЕНД ================= */
  function loadSettings() {
    var s = window.SettingsStore.all();
    $("setPhone").value = s.phone; $("setPhoneDisplay").value = s.phoneDisplay;
    $("setEmail").value = s.email; $("setTelegram").value = s.telegram;
    $("setWhatsapp").value = s.whatsapp; $("setInstagram").value = s.instagram;
    loadApiCfg();
  }
  $("settingsForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var s = {
      phone: $("setPhone").value.trim(),
      phoneDisplay: $("setPhoneDisplay").value.trim(),
      email: $("setEmail").value.trim(),
      telegram: $("setTelegram").value.trim().replace(/^@/, ""),
      whatsapp: $("setWhatsapp").value.replace(/\D/g, ""),
      instagram: $("setInstagram").value.trim().replace(/^@/, ""),
    };
    window.SettingsStore.save(s);
    if (API()) window.PahlavonAPI.putSettings(s).then(function () { alert("Настройки сохранены на сервере."); }).catch(apiErr);
    else alert("Настройки сохранены. Обновите вкладку с сайтом, чтобы увидеть изменения.");
  });
  $("settingsReset").addEventListener("click", function () {
    if (!confirm("Сбросить контакты к стандартным?")) return;
    window.SettingsStore.reset(); loadSettings();
  });

  /* ================= API: конфигурация сервера ================= */
  function updateApiStatus(msg, ok) {
    var el = $("apiStatus");
    if (!el) return;
    if (msg !== undefined) { el.textContent = msg; el.style.color = ok ? "var(--ok)" : "var(--danger)"; return; }
    el.textContent = API() ? "● серверный режим" : "○ офлайн-режим (localStorage)";
    el.style.color = API() ? "var(--ok)" : "var(--text-subtle)";
  }
  function loadApiCfg() { $("setApiBase").value = window.PahlavonAPI.base(); updateApiStatus(); }
  $("apiSave").addEventListener("click", function () {
    window.PahlavonAPI.setBase($("setApiBase").value);
    updateApiStatus();
    alert("Адрес сервера сохранён. Если включили сервер впервые — выйдите и войдите снова.");
  });
  $("apiCheck").addEventListener("click", function () {
    window.PahlavonAPI.setBase($("setApiBase").value);
    updateApiStatus("проверяем…");
    window.PahlavonAPI.health()
      .then(function () { updateApiStatus("✓ соединение есть", true); })
      .catch(function () { updateApiStatus("✗ сервер недоступен", false); });
  });

  /* ================= СТАРТ ================= */
  (async function start() {
    loadApiCfg();
    if (API()) {
      if (window.PahlavonAPI.token() && (await window.PahlavonAPI.verify())) showApp();
      else showLogin();
    } else {
      if (isAuthed()) showApp(); else showLogin();
    }
  })();
})();
