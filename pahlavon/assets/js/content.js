/* =================================================================
   ПАХЛАВОН — Хранилище контента и настроек сайта
   Позволяет админ-панели управлять ВСЕМ текстом сайта и контактами.

   • BASE_LOCALES — нетронутые тексты по умолчанию (снимок до оверрайдов).
   • ContentStore — оверрайды текста по ключам, на каждый язык.
   • SettingsStore — контактные/брендовые данные (телефон, почта, соцсети).

   ⚠ Хранилище — localStorage (демо для статического сайта).
   На проде заменить на серверный API / CMS (см. README).
   Должен подключаться ПОСЛЕ i18n.js и ДО app.js / admin.js.
   ================================================================= */
(function () {
  var CKEY = "pahlavon-content";
  var SKEY = "pahlavon-settings";

  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function readObj(k) {
    try { var v = JSON.parse(localStorage.getItem(k)); return v && typeof v === "object" ? v : {}; }
    catch (e) { return {}; }
  }
  function writeObj(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }

  function getPath(obj, path) {
    return path.split(".").reduce(function (o, k) { return o && o[k] !== undefined ? o[k] : undefined; }, obj);
  }
  function setPath(obj, path, val) {
    var ks = path.split("."), o = obj;
    for (var i = 0; i < ks.length - 1; i++) {
      var k = ks[i];
      if (o[k] == null || typeof o[k] !== "object") o[k] = /^\d+$/.test(ks[i + 1]) ? [] : {};
      o = o[k];
    }
    o[ks[ks.length - 1]] = val;
  }

  /* Снимок исходных текстов ДО применения оверрайдов */
  window.BASE_LOCALES = clone(window.LOCALES);

  window.ContentStore = {
    getPath: getPath,
    setPath: setPath,
    base: function () { return window.BASE_LOCALES; },
    overrides: function () { return readObj(CKEY); },
    save: function (o) { return writeObj(CKEY, o); },
    resetLang: function (lang) { var o = readObj(CKEY); delete o[lang]; writeObj(CKEY, o); },
    resetAll: function () { try { localStorage.removeItem(CKEY); } catch (e) {} },
    /* Применить оверрайды поверх window.LOCALES */
    apply: function () {
      var ov = readObj(CKEY);
      ["ru", "tg", "en"].forEach(function (l) {
        if (!ov[l] || !window.LOCALES[l]) return;
        Object.keys(ov[l]).forEach(function (p) { setPath(window.LOCALES[l], p, ov[l][p]); });
      });
    },
    /* Сбросить LOCALES к эталону и применить оверрайды заново (после синка с сервером) */
    reapply: function () {
      ["ru", "tg", "en"].forEach(function (l) {
        if (window.BASE_LOCALES[l]) window.LOCALES[l] = clone(window.BASE_LOCALES[l]);
      });
      this.apply();
    },
  };

  window.DEFAULT_SETTINGS = {
    phone: "+992981113363",
    phoneDisplay: "(+992) 98-111-3363",
    email: "sales@pahlavon.tj",
    telegram: "pahlavonagency",
    /* Отдельный Telegram для откликов на вакансии (HR) — на него ведёт
       кнопка «Откликнуться» в разделе «Карьера». */
    telegramHr: "malikasvanova",
    whatsapp: "992981113363",
    instagram: "pahlavon_security",
  };

  window.SettingsStore = {
    all: function () { return Object.assign({}, window.DEFAULT_SETTINGS, readObj(SKEY)); },
    save: function (s) { return writeObj(SKEY, s); },
    reset: function () { try { localStorage.removeItem(SKEY); } catch (e) {} },
  };

  /* Применяем сохранённый контент сразу при загрузке любой страницы */
  window.ContentStore.apply();
})();
