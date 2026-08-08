# Task Tracker

Личный таск-трекер: статусы, важность/срочность, категории, ответственный, срок — с цветовой индикацией.

## Стек

- Next.js 16 (App Router) — фронт + API в одном приложении
- Drizzle ORM + SQLite — БД без внешнего сервера
- Docker + Caddy — деплой с автоматическим HTTPS

## Локальный запуск (разработка)

```bash
npm install
mkdir -p data
node scripts/migrate.js   # применяет миграции к data/tasks.db
npm run dev
```

Открыть http://localhost:3000. Без APP_USER/APP_PASSWORD в .env авторизация отключена — удобно для разработки.

## Деплой на сервер

### 1. Подготовка сервера

Понадобится любая VM в облаке (Yandex Cloud, AWS Lightsail, GCP e2-micro — самый дешёвый tier достаточен) с установленным Docker и Docker Compose:

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
# перелогиниться, чтобы группа применилась
```

### 2. Домен

Купи домен (или используй поддомен) и направь A-запись на IP сервера. Caddy сам получит SSL-сертификат по этому домену через Let's Encrypt — для этого домен должен резолвиться на сервер ДО запуска.

### 3. Файрвол

Открой на сервере только нужные порты:

```bash
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP (нужен для получения сертификата)
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

### 4. Копирование проекта на сервер

```bash
# с локальной машины
scp -r task-tracker/ user@your-server-ip:/home/user/
# или через git, если положишь проект в свой репозиторий
```

### 5. Настройка окружения

На сервере, в папке проекта:

```bash
cp .env.example .env
nano .env
```

Заполни:
```
APP_USER=твой_логин
APP_PASSWORD=надёжный_пароль
DOMAIN=tasks.твой-домен.ru
```

### 6. Запуск

```bash
docker compose up -d --build
```

Первый запуск займёт пару минут — соберётся образ и Caddy получит сертификат. Проверить логи:

```bash
docker compose logs -f
```

Готово — приложение доступно по `https://tasks.твой-домен.ru`, попросит логин/пароль (Basic Auth).

### 7. Обновление после изменений в коде

```bash
git pull   # если используешь git
docker compose up -d --build
```

Данные (SQLite-база) хранятся в Docker volume `task_data` и переживают пересборку.

### 8. Бэкапы

База — один файл SQLite внутри volume. Простой бэкап:

```bash
docker compose exec app cp /app/data/tasks.db /app/data/backup-$(date +%F).db
docker cp $(docker compose ps -q app):/app/data/backup-$(date +%F).db ./backups/
```

Можно повесить это в cron раз в день.

### 9. (Опционально) Автодеплой через GitHub Actions

Если положишь проект в приватный репозиторий, можно настроить: пуш в `main` → SSH на сервер → `git pull && docker compose up -d --build`. Спроси отдельно, если понадобится — соберу workflow-файл.

## Структура проекта

```
app/                    — страницы и API-роуты (Next.js App Router)
  api/tasks/             — CRUD задач
  api/categories/        — CRUD категорий
components/             — React-компоненты (таблица, форма, бейджи)
lib/db/                 — схема БД и подключение (Drizzle)
lib/constants.ts        — статусы, уровни важности/срочности, цвета
drizzle/                — SQL-миграции
scripts/migrate.js      — применение миграций в рантайме контейнера
Dockerfile              — сборка образа приложения
docker-compose.yml      — app + Caddy (reverse proxy с HTTPS)
Caddyfile                — конфиг Caddy
proxy.ts                — Basic Auth middleware
```
