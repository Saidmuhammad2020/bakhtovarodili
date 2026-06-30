# Бэкенд «Пахлавон»

Лёгкий сервер для сайта и админ-панели: **без внешних зависимостей**,
только встроенные модули Node.js 22+ (`node:http`, `node:sqlite`, `node:crypto`).

## Что умеет

- Реальная аутентификация админки: пароль → подписанный HMAC-токен (сессия).
- Хранение в SQLite: контент сайта, контактные настройки, вакансии, отклики.
- REST-API с CORS для статического фронтенда (GitHub Pages / pahlavon.tj).

После запуска сервера контент/вакансии/отклики хранятся **на сервере** и
видны всем посетителям и на всех устройствах (а не в localStorage одного
браузера, как в офлайн-режиме).

## Запуск локально

```bash
cd backend
cp .env.example .env        # задайте ADMIN_PASSWORD и AUTH_SECRET
npm start                   # = node --experimental-sqlite server.js
# сервер на http://localhost:8787
```

> Нужен **Node.js ≥ 22.5** (встроенный `node:sqlite`). Флаг
> `--experimental-sqlite` уже прописан в `npm start`.

## Подключение фронтенда

1. Запустите сервер и откройте к нему доступ по HTTPS (домен, напр.
   `https://api.pahlavon.tj`).
2. В админке сайта: вкладка **«Контакты и бренд» → «Сервер (бэкенд)»** —
   впишите адрес API и нажмите «Сохранить адрес», затем «Проверить
   соединение».
3. Войдите заново — теперь админка работает через сервер, а сайт
   подтягивает контент с него.

В проде задайте `ALLOWED_ORIGIN` = домену сайта (напр.
`https://www.pahlavon.tj`) вместо `*`.

## Деплой

### Docker (любой VPS / хостинг)
```bash
cd backend
docker build -t pahlavon-backend .
docker run -d -p 8787:8787 \
  -e ADMIN_PASSWORD='ваш-пароль' \
  -e AUTH_SECRET='длинная-случайная-строка' \
  -e ALLOWED_ORIGIN='https://www.pahlavon.tj' \
  -v pahlavon-data:/data \
  --name pahlavon pahlavon-backend
```

### Render / Railway / Fly.io и т.п.
- Build command: *(не нужен)*
- Start command: `node --experimental-sqlite server.js`
- Переменные окружения: `ADMIN_PASSWORD`, `AUTH_SECRET`, `ALLOWED_ORIGIN`,
  и **persistent disk**, смонтированный, например, в `/data`, с
  `DB_PATH=/data/pahlavon.db` (иначе база сбрасывается при передеплое).

### systemd (VPS без Docker)
```ini
# /etc/systemd/system/pahlavon.service
[Service]
WorkingDirectory=/opt/pahlavon/backend
ExecStart=/usr/bin/node --experimental-sqlite server.js
Environment=ADMIN_PASSWORD=... AUTH_SECRET=... ALLOWED_ORIGIN=https://www.pahlavon.tj DB_PATH=/opt/pahlavon/backend/pahlavon.db
Restart=always
[Install]
WantedBy=multi-user.target
```
Затем поставьте перед ним Nginx/Caddy с HTTPS.

## API (кратко)

| Метод | Путь | Доступ | Назначение |
|---|---|---|---|
| GET | `/api/health` | public | проверка живости |
| GET | `/api/site` | public | `{content, settings, vacancies}` для сайта |
| GET | `/api/vacancies` | public | список вакансий |
| POST | `/api/applications` | public | отправка отклика |
| POST | `/api/login` | public | пароль → `{token}` |
| GET | `/api/verify` | token | проверка токена |
| PUT | `/api/content` | token | сохранить оверрайды текста |
| PUT | `/api/settings` | token | сохранить контакты/бренд |
| PUT | `/api/vacancies` | token | заменить список вакансий |
| GET | `/api/applications` | token | список откликов |
| DELETE | `/api/applications/:id` | token | удалить отклик |
| DELETE | `/api/applications` | token | очистить отклики |

Токен передаётся заголовком `Authorization: Bearer <token>`.

## Безопасность

- Меняйте `ADMIN_PASSWORD` и задавайте надёжный `AUTH_SECRET`.
- Запускайте только за HTTPS (Nginx/Caddy/хостинг-прокси).
- Бэкап — это просто файл `*.db` (SQLite).
- При необходимости добавьте rate-limit на `/api/login` и `/api/applications`
  на уровне прокси.
