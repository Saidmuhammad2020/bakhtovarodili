/* =================================================================
   ПАХЛАВОН — Клиент бэкенда
   Если задан адрес API (localStorage "pahlavon-api-base"), сайт и
   админка работают через сервер. Если адрес не задан или сервер
   недоступен — используется офлайн-режим на localStorage (как раньше).

   Подключать ПОСЛЕ content.js / vacancies.js и ДО app.js / admin.js.
   ================================================================= */
window.PahlavonAPI = (function () {
  var BKEY = "pahlavon-api-base";
  var TKEY = "pahlavon-api-token";

  function base() { try { return (localStorage.getItem(BKEY) || "").replace(/\/+$/, ""); } catch (e) { return ""; } }
  function setBase(u) { try { localStorage.setItem(BKEY, (u || "").trim().replace(/\/+$/, "")); } catch (e) {} }
  function enabled() { return !!base(); }
  function token() { try { return localStorage.getItem(TKEY) || ""; } catch (e) { return ""; } }
  function setToken(t) { try { if (t) localStorage.setItem(TKEY, t); else localStorage.removeItem(TKEY); } catch (e) {} }

  async function req(method, path, body, authed) {
    var headers = {};
    if (body !== undefined) headers["Content-Type"] = "application/json";
    if (authed) headers["Authorization"] = "Bearer " + token();
    var res = await fetch(base() + path, {
      method: method, headers: headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) { var e = new Error("HTTP " + res.status); e.status = res.status; throw e; }
    var ct = res.headers.get("content-type") || "";
    return ct.indexOf("json") >= 0 ? res.json() : res.text();
  }

  return {
    base: base, setBase: setBase, enabled: enabled, token: token, setToken: setToken,

    login: async function (pw) { var r = await req("POST", "/api/login", { password: pw }); setToken(r.token); return r; },
    logout: function () { setToken(""); },
    verify: async function () { try { await req("GET", "/api/verify", undefined, true); return true; } catch (e) { return false; } },
    health: function () { return req("GET", "/api/health"); },

    getSite: function () { return req("GET", "/api/site"); },
    putContent: function (overrides) { return req("PUT", "/api/content", { content: overrides }, true); },
    putSettings: function (settings) { return req("PUT", "/api/settings", { settings: settings }, true); },
    getVacancies: function () { return req("GET", "/api/vacancies"); },
    putVacancies: function (list) { return req("PUT", "/api/vacancies", list, true); },
    getApplications: function () { return req("GET", "/api/applications", undefined, true); },
    postApplication: function (a) { return req("POST", "/api/applications", { application: a }); },
    deleteApplication: function (id) { return req("DELETE", "/api/applications/" + encodeURIComponent(id), undefined, true); },
    clearApplications: function () { return req("DELETE", "/api/applications", undefined, true); },

    /* Загрузить состояние с сервера в localStorage-кэш (его читают синхронные сторы) */
    syncDown: async function () {
      var site = await this.getSite();
      try {
        localStorage.setItem("pahlavon-content", JSON.stringify(site.content || {}));
        localStorage.setItem("pahlavon-settings", JSON.stringify(site.settings || {}));
        if (site.vacancies == null) localStorage.removeItem("pahlavon-vacancies");
        else localStorage.setItem("pahlavon-vacancies", JSON.stringify(site.vacancies));
      } catch (e) {}
      return site;
    },
  };
})();
