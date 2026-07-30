/* =================================================================
   ПАХЛАВОН — Вакансии: данные по умолчанию + хранилище
   Единый источник для публичного раздела «Карьера» и админ-панели.

   ⚠ Хранилище — localStorage (демо/витрина для статического сайта).
   На проде заменить на серверный API / CMS (см. README).
   ================================================================= */
(function () {
  var VAC_KEY = "pahlavon-vacancies";
  var APP_KEY = "pahlavon-applications";

  /* Сид-вакансии. type — ключ в careers.employmentTypes; location/salary —
     язык-нейтральные строки; title/desc — локализованы (ru/tg/en). */
  window.DEFAULT_VACANCIES = [
    {
      id: "v-guard", type: "shift", location: "Душанбе", salary: "",
      title: { ru: "Охранник", tg: "Муҳофиз", en: "Security Guard" },
      desc: {
        ru: "Несение службы на объекте: контроль доступа, патрулирование, реагирование на инциденты. Требуется ответственность, дисциплина, физическая подготовка.",
        tg: "Адои хидмат дар объект: назорати дастрасӣ, посбонӣ, вокуниш ба ҳодисаҳо. Масъулият, интизом ва омодагии ҷисмонӣ лозим аст.",
        en: "On-site duty: access control, patrols and incident response. Responsibility, discipline and physical fitness required.",
      },
    },
    {
      id: "v-operator", type: "shift", location: "Душанбе", salary: "",
      title: { ru: "Оператор пульта мониторинга", tg: "Оператори пулти мониторинг", en: "Control Room Operator" },
      desc: {
        ru: "Круглосуточный мониторинг объектов, обработка тревог, координация группы быстрого реагирования. Внимательность и стрессоустойчивость.",
        tg: "Мониторинги шабонарӯзии объектҳо, коркарди изтироб, ҳамоҳангсозии гурӯҳи вокуниши зуд. Диққат ва устуворӣ ба фишор.",
        en: "24/7 site monitoring, alarm handling and coordination of the rapid-response team. Attention to detail and resilience under pressure.",
      },
    },
    {
      id: "v-installer", type: "full", location: "Душанбе", salary: "",
      title: { ru: "Монтажник систем видеонаблюдения", tg: "Технику насби системаҳои видеонозорат", en: "CCTV Installation Technician" },
      desc: {
        ru: "Монтаж и настройка видеонаблюдения, СКУД и пожарной сигнализации. Опыт работы с низковольтными системами приветствуется.",
        tg: "Насб ва танзими видеонозорат, СКУД ва сигнализатсияи сӯхтор. Таҷриба бо системаҳои пастшиддат афзалият дорад.",
        en: "Installation and configuration of CCTV, access control and fire alarms. Experience with low-voltage systems is a plus.",
      },
    },
  ];

  function read(key, fallback) {
    try { var v = JSON.parse(localStorage.getItem(key)); return Array.isArray(v) ? v : fallback; }
    catch (e) { return fallback; }
  }
  function write(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); return true; } catch (e) { return false; }
  }

  /* --- Миграция закешированных вакансий ---------------------------------
     Браузер, где вакансии когда-то сохраняли из админки, продолжает
     отдавать старую копию: с суммами зарплат и закрытой вакансией
     «Менеджер по продажам». Правим только эти два поля у наших штатных
     вакансий — вакансии, добавленные заказчиком вручную, не трогаем. */
  var MIGRATION_KEY = "pahlavon-vacancies-migrated";
  var RETIRED_IDS = ["v-sales"];
  function migrate() {
    try {
      if (localStorage.getItem(MIGRATION_KEY)) return;
      var saved = localStorage.getItem(VAC_KEY);
      if (saved !== null) {
        var seeded = window.DEFAULT_VACANCIES.map(function (v) { return v.id; });
        var list = read(VAC_KEY, []).filter(function (v) { return RETIRED_IDS.indexOf(v.id) === -1; });
        list.forEach(function (v) { if (seeded.indexOf(v.id) !== -1) v.salary = ""; });
        write(VAC_KEY, list);
      }
      localStorage.setItem(MIGRATION_KEY, "1");
    } catch (e) {}
  }
  migrate();

  window.VacancyStore = {
    /* Вакансии: админ-сохранённые или дефолтные */
    all: function () {
      var saved = localStorage.getItem(VAC_KEY);
      if (saved === null) return window.DEFAULT_VACANCIES.slice();
      return read(VAC_KEY, window.DEFAULT_VACANCIES.slice());
    },
    save: function (list) { return write(VAC_KEY, list); },
    resetDefaults: function () { try { localStorage.removeItem(VAC_KEY); } catch (e) {} },

    /* Отклики на вакансии */
    applications: function () { return read(APP_KEY, []); },
    addApplication: function (app) {
      var list = read(APP_KEY, []);
      list.unshift(app);
      return write(APP_KEY, list);
    },
    deleteApplication: function (id) {
      write(APP_KEY, read(APP_KEY, []).filter(function (a) { return a.id !== id; }));
    },
    clearApplications: function () { write(APP_KEY, []); },

    newId: function () { return "id-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 7); },
  };
})();
