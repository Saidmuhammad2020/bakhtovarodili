/* =================================================================
   ПАХЛАВОН — Бэкенд админ-панели и сайта
   Без внешних зависимостей: только встроенные модули Node 22+
   (node:http, node:sqlite, node:crypto).

   Возможности:
   • Реальная аутентификация (пароль → подписанный HMAC-токен).
   • Хранение в SQLite: контент, настройки, вакансии, отклики.
   • CORS для статического фронтенда (GitHub Pages / pahlavon.tj).

   Запуск:  node --experimental-sqlite server.js
   Конфиг — через переменные окружения (см. ниже и .env.example).
   ================================================================= */
"use strict";

const http = require("node:http");
const crypto = require("node:crypto");
const { DatabaseSync } = require("node:sqlite");

/* ---------------- Конфигурация ---------------- */
const PORT = parseInt(process.env.PORT || "8787", 10);
const DB_PATH = process.env.DB_PATH || "./pahlavon.db";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "pahlavon2024";
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "*"; // напр. https://www.pahlavon.tj
const TOKEN_TTL = parseInt(process.env.TOKEN_TTL || "43200", 10); // секунд (12 ч)
const MAX_BODY = 1024 * 1024; // 1 МБ

let AUTH_SECRET = process.env.AUTH_SECRET;
if (!AUTH_SECRET) {
  AUTH_SECRET = crypto.randomBytes(32).toString("hex");
  console.warn("⚠ AUTH_SECRET не задан — сгенерирован временный (токены сбросятся при перезапуске). Задайте AUTH_SECRET в проде.");
}

/* ---------------- База данных ---------------- */
const db = new DatabaseSync(DB_PATH);
db.exec(`
  CREATE TABLE IF NOT EXISTS kv (key TEXT PRIMARY KEY, value TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS applications (id TEXT PRIMARY KEY, ts INTEGER NOT NULL, data TEXT NOT NULL);
`);
const kvGet = db.prepare("SELECT value FROM kv WHERE key = ?");
const kvSet = db.prepare("INSERT INTO kv(key, value) VALUES(?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value");
const appsAll = db.prepare("SELECT data FROM applications ORDER BY ts DESC");
const appIns = db.prepare("INSERT INTO applications(id, ts, data) VALUES(?, ?, ?)");
const appDel = db.prepare("DELETE FROM applications WHERE id = ?");
const appClear = db.prepare("DELETE FROM applications");

function getKV(key, fallback) {
  const row = kvGet.get(key);
  if (!row) return fallback;
  try { return JSON.parse(row.value); } catch (e) { return fallback; }
}
function setKV(key, val) { kvSet.run(key, JSON.stringify(val)); }

/* ---------------- Аутентификация (HMAC-токен) ---------------- */
const b64 = (buf) => Buffer.from(buf).toString("base64url");
function sign(payloadB64) {
  return crypto.createHmac("sha256", AUTH_SECRET).update(payloadB64).digest("base64url");
}
function issueToken() {
  const payload = b64(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + TOKEN_TTL }));
  return payload + "." + sign(payload);
}
function verifyToken(token) {
  if (!token || token.indexOf(".") < 0) return false;
  const [payload, sig] = token.split(".");
  const expected = sign(payload);
  if (sig.length !== expected.length) return false;
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return false;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString());
    return data.exp && data.exp > Math.floor(Date.now() / 1000);
  } catch (e) { return false; }
}
function checkPassword(pw) {
  const a = crypto.createHash("sha256").update(String(pw)).digest();
  const b = crypto.createHash("sha256").update(ADMIN_PASSWORD).digest();
  return crypto.timingSafeEqual(a, b);
}
function isAuthed(req) {
  const h = req.headers["authorization"] || "";
  const m = h.match(/^Bearer\s+(.+)$/i);
  return m ? verifyToken(m[1]) : false;
}

/* ---------------- HTTP-хелперы ---------------- */
function setCORS(res) {
  res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Max-Age", "86400");
}
function send(res, code, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(code, { "Content-Type": "application/json; charset=utf-8" });
  res.end(body);
}
function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = "", size = 0;
    req.on("data", (c) => {
      size += c.length;
      if (size > MAX_BODY) { reject(new Error("body too large")); req.destroy(); return; }
      data += c;
    });
    req.on("end", () => { try { resolve(data ? JSON.parse(data) : {}); } catch (e) { reject(e); } });
    req.on("error", reject);
  });
}

/* ---------------- Маршруты ---------------- */
const server = http.createServer(async (req, res) => {
  setCORS(res);
  if (req.method === "OPTIONS") { res.writeHead(204); res.end(); return; }

  const url = new URL(req.url, "http://localhost");
  const path = url.pathname.replace(/\/+$/, "") || "/";
  const auth = () => isAuthed(req);

  try {
    /* ---- Публичные ---- */
    if (req.method === "GET" && path === "/api/health") return send(res, 200, { ok: true });

    if (req.method === "GET" && path === "/api/site") {
      return send(res, 200, {
        content: getKV("content", {}),
        settings: getKV("settings", {}),
        vacancies: getKV("vacancies", null),
      });
    }
    if (req.method === "GET" && path === "/api/vacancies") {
      return send(res, 200, getKV("vacancies", null));
    }
    if (req.method === "POST" && path === "/api/applications") {
      const body = await readBody(req);
      const a = body && body.application ? body.application : body;
      if (!a || !a.name || !a.phone) return send(res, 400, { error: "name and phone required" });
      const rec = {
        id: a.id || ("id-" + Date.now().toString(36) + "-" + crypto.randomBytes(3).toString("hex")),
        ts: a.ts || Date.now(),
        type: a.type || "vacancy",
        position: String(a.position || "—").slice(0, 200),
        name: String(a.name).slice(0, 200),
        phone: String(a.phone).slice(0, 60),
        message: String(a.message || "").slice(0, 4000),
        lang: a.lang || "ru",
        status: "new",
      };
      appIns.run(rec.id, rec.ts, JSON.stringify(rec));
      return send(res, 201, { ok: true, id: rec.id });
    }

    /* ---- Авторизация ---- */
    if (req.method === "POST" && path === "/api/login") {
      const body = await readBody(req);
      if (checkPassword(body.password)) return send(res, 200, { token: issueToken(), expiresIn: TOKEN_TTL });
      return send(res, 401, { error: "invalid password" });
    }
    if (req.method === "GET" && path === "/api/verify") {
      return send(res, auth() ? 200 : 401, { ok: auth() });
    }

    /* ---- Защищённые (нужен токен) ---- */
    if (path === "/api/content" && req.method === "PUT") {
      if (!auth()) return send(res, 401, { error: "unauthorized" });
      const body = await readBody(req);
      setKV("content", body.content || body || {});
      return send(res, 200, { ok: true });
    }
    if (path === "/api/settings" && req.method === "PUT") {
      if (!auth()) return send(res, 401, { error: "unauthorized" });
      const body = await readBody(req);
      setKV("settings", body.settings || body || {});
      return send(res, 200, { ok: true });
    }
    if (path === "/api/vacancies" && req.method === "PUT") {
      if (!auth()) return send(res, 401, { error: "unauthorized" });
      const body = await readBody(req);
      const list = Array.isArray(body) ? body : body.vacancies;
      if (!Array.isArray(list)) return send(res, 400, { error: "array required" });
      setKV("vacancies", list);
      return send(res, 200, { ok: true });
    }
    if (path === "/api/applications" && req.method === "GET") {
      if (!auth()) return send(res, 401, { error: "unauthorized" });
      return send(res, 200, appsAll.all().map((r) => JSON.parse(r.data)));
    }
    if (path === "/api/applications" && req.method === "DELETE") {
      if (!auth()) return send(res, 401, { error: "unauthorized" });
      appClear.run();
      return send(res, 200, { ok: true });
    }
    const delMatch = path.match(/^\/api\/applications\/([^/]+)$/);
    if (delMatch && req.method === "DELETE") {
      if (!auth()) return send(res, 401, { error: "unauthorized" });
      appDel.run(decodeURIComponent(delMatch[1]));
      return send(res, 200, { ok: true });
    }

    send(res, 404, { error: "not found" });
  } catch (err) {
    send(res, err.message === "body too large" ? 413 : 400, { error: err.message || "bad request" });
  }
});

server.listen(PORT, () => {
  console.log(`Pahlavon backend → http://localhost:${PORT}  (CORS: ${ALLOWED_ORIGIN}, DB: ${DB_PATH})`);
});
