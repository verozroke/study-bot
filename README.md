# 📦 BI Education HR Bot — Telegram бот для HR и педагогов в компании BI Education

BI Education HR Bot — это Telegram-бот, предназначенный для поддержки учителей и HR-команды. Он помогает:
- отправлять благодарности,
- делиться достижениями,
- использовать ИИ для помощи в трудных диалогах (медиатор),
- обрабатывать голосовые сообщения,
- и интегрируется с Telegram-группами и топиками.

## 🧠 Используемые технологии

- Node.js / TypeScript
- Telegraf — Telegram Bot Framework
- Prisma ORM — работа с PostgreSQL
- Google Gemini API — генерация текста и транскрипция голосовых сообщений
- Docker — удобное окружение для запуска и разработки

## ⚙️ Команды для запуска и разработки

npm run dev
# Запуск бота в режиме разработки (ts-node)

npm run start
# Запуск собранного бота

npm run build
# Компиляция TypeScript в JavaScript

npx prisma migrate dev
# Применить миграции

npx prisma format
# Отформатировать схему Prisma

npx prisma db push
# Протолкнуть схему в базу без миграций

npx prisma generate
# Сгенерировать Prisma Client

docker-compose up -d
# Запуск PostgreSQL и прочих сервисов

docker-compose down -d
# Остановка всех Docker-сервисов

## 🔐 Переменные окружения

В проекте есть файл .env.example с образцами всех необходимых переменных.

DATABASE_URL="postgresql://USERNAME:PASSWORD@localhost:PORT/DB_NAME?schema=public"
BOT_TOKEN="TELEGRAM_BOT_TOKEN_FROM_BOTFATHER"
ADMIN_SECRET="YOUR_PASSWORD"
CHANNEL_SECRET="YOUR_PASSWORD"
GEMINI_API_KEY="GEMINI_API_KEY"

## 🛠 Основной функционал

/rahmetiki — отправка благодарностей в группу с топиком
/setadmin <password> — назначить администратора
/setchannel <password> <ссылка на группу> <название топика> — установка группы и топика
🏆 Поделиться достижением — пошаговый сценарий с фото, описанием и предпросмотром
🤖 Медиатор — ИИ-помощник для учителей в сложных коммуникациях

## 📂 Структура проекта

src/
├── commands/           — команды /setadmin, /setchannel и др.
├── scenes/             — WizardScene сценарии (достижения, медиатор)
├── utils/              — вспомогательные модули (transcribeVoice, prompt и т.д.)
├── types/              — пользовательские типы (MyContext)

## 📌 Примечание

Бот может отправлять сообщения в треды Telegram-групп. Для этого используется groupId и messageThreadId, указанные через команду /setchannel.

Разработано с ❤️ для образовательных команд.
