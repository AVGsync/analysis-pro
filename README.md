# Analysis Pro

Analysis Pro — веб-приложение для анализа продаж, управления ассортиментом и прогнозирования спроса.

Проект состоит из:

- `backend` — REST API на Go: авторизация, профиль пользователя, детализация продаж, прогнозы, рекомендации и экспорт CSV/XML.
- `frontend` — React/Vite SPA, отдаётся через Nginx в Docker.
- `postgres` — основная база данных.
- `postgres-migrate` — контейнер для применения SQL-миграций.
- `swagger` — служебный контейнер для генерации Swagger-документации.

Подробное описание API не дублируется в README. Включите debug-режим и откройте Swagger UI: `http://localhost:8080/swagger`.

## Требования

- Docker
- Docker Compose
- Make

Для запуска без Docker дополнительно нужны:

- Go
- Node.js 20+
- npm
- PostgreSQL

## Переменные окружения

Создайте файл `.env` в корне проекта.

Пример:

```env
# main service
BIND_ADDR=8080
DEBUG=true
JWT_SECRET=change_me_to_long_random_secret
TTL_ACCESS_TOKEN=3600
LOG_LEVEL=info

# database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=analysis
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
```

Переменные:

- `BIND_ADDR` — порт backend-сервера. Для Docker Compose используйте `8080`.
- `DEBUG` — включает debug-режим backend.
- `JWT_SECRET` — секрет для подписи JWT. В production обязательно заменить на длинное случайное значение.
- `TTL_ACCESS_TOKEN` — время жизни JWT access token в секундах.
- `LOG_LEVEL` — уровень логов, если `DEBUG=false`: `debug`, `info`, `warn`, `error`.
- `POSTGRES_USER` — пользователь PostgreSQL.
- `POSTGRES_PASSWORD` — пароль PostgreSQL.
- `POSTGRES_DB` — имя базы данных.
- `POSTGRES_HOST` — хост PostgreSQL. Локально без Docker обычно `localhost`; внутри Docker Compose backend получает `db`.
- `POSTGRES_PORT` — порт PostgreSQL.

## Debug-режим

Включение:

```env
DEBUG=true
```

Что включает:

- уровень логирования backend принудительно становится `debug`;
- появляется Swagger UI: `http://localhost:8080/swagger`;
- JSON спецификация Swagger доступна по `http://localhost:8080/swagger/doc.json`.

Отключение:

```env
DEBUG=false
```

Что меняется:

- Swagger UI и `/swagger/*` не регистрируются;
- уровень логов берётся из `LOG_LEVEL`;
- авторизация продолжает работать через HttpOnly cookie `token`.

## Запуск через Docker Compose

1. Создайте `.env`.

2. Соберите и поднимите сервисы:

```bash
docker compose up -d --build
```

3. Примените миграции:

```bash
make migrate-up
```

4. Откройте приложение:

```text
http://localhost
```

Полезные адреса:

- frontend: `http://localhost`
- backend health check: `http://localhost:8080/api/ping`
- Swagger UI при `DEBUG=true`: `http://localhost:8080/swagger`

Остановка:

```bash
docker compose down
```

Остановка с удалением volumes:

```bash
docker compose down -v
```

## Миграции

Создать новую миграцию:

```bash
make migrate-create seq=my_change
```

Применить миграции:

```bash
make migrate-up
```

Откатить миграции:

```bash
make migrate-down
```

Файлы миграций лежат в `backend/migrations`.

## Swagger

Swagger UI включается только при `DEBUG=true`.

Сгенерировать документацию заново:

```bash
make swagger-gen
```

После генерации обновляются:

- `backend/docs/docs.go`
- `backend/docs/swagger.json`
- `backend/docs/swagger.yaml`


