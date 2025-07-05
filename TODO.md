# GymFuel — TODO & Progress

## 1. Инициализация проекта

- [x] Next.js 15 (TypeScript, App Router)
- [x] Tailwind CSS 4.1 (без postcss.config.js)
- [x] Prettier и ESLint (конфиги настроены)
- [x] docker-compose.yml для PostgreSQL (локальная база)
- [x] Prisma инициализирована (prisma/schema.prisma, .env — прописать строку подключения вручную)

## 2. Следующие шаги

- [ ] В .env прописать:
      DATABASE_URL="postgresql://gymfuel:gymfuel@localhost:5432/gymfuel"
- [ ] Описать модели в prisma/schema.prisma:
  - User
  - Product
  - Consumption
- [ ] Провести миграцию:
      npx prisma migrate dev --name init
- [ ] Проверить подключение к базе (например, через Prisma Studio: npx prisma studio)
- [ ] Дальнейшая настройка (tRPC, Auth.js, страницы и т.д.)

---

Если потребуется продолжить — просто открой этот файл и напиши, на чём остановились!
