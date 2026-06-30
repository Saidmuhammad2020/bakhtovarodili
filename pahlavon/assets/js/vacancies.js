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
      id: "v-guard", type: "shift", location: "Душанбе", salary: "3000–4500 TJS",
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
      id: "v-installer", type: "full", location: "Душанбе", salary: "4000–7000 TJS",
      title: { ru: "Монтажник систем видеонаблюдения", tg: "Технику насби системаҳои видеонозорат", en: "CCTV Installation Technician" },
      desc: {
        ru: "Монтаж и настройка видеонаблюдения, СКУД и пожарной сигнализации. Опыт работы с низковольтными системами приветствуется.",
        tg: "Насб ва танзими видеонозорат, СКУД ва сигнализатсияи сӯхтор. Таҷриба бо системаҳои пастшиддат афзалият дорад.",
        en: "Installation and configuration of CCTV, access control and fire alarms. Experience with low-voltage systems is a plus.",
      },
    },
    {
      id: "v-sales", type: "full", location: "Душанбе", salary: "",
      title: { ru: "Менеджер по продажам", tg: "Менеҷери фурӯш", en: "Sales Manager" },
      desc: {
        ru: "Работа с входящими заявками, выезд на аудит, подготовка коммерческих предложений. Грамотная речь, ориентация на результат.",
        tg: "Кор бо дархостҳои воридотӣ, баромад ба аудит, тайёр кардани пешниҳодҳои тиҷоратӣ. Нутқи дуруст, нигаронидашуда ба натиҷа.",
        en: "Handling inbound requests, on-site audits and preparing commercial proposals. Articulate, results-oriented.",
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
