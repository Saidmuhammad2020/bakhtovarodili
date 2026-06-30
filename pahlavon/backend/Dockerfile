# Бэкенд «Пахлавон» — без внешних зависимостей (только встроенные модули Node 22+)
FROM node:22-alpine

WORKDIR /app
COPY package.json server.js ./

# Данные SQLite храним в томе /data
ENV DB_PATH=/data/pahlavon.db
ENV PORT=8787
VOLUME ["/data"]
EXPOSE 8787

CMD ["node", "--experimental-sqlite", "server.js"]
