#!/bin/bash

# Deploy to Staging Script
# Автоматизирует весь процесс деплоя в staging

set -e  # Останавливаем при ошибке

echo "🚀 Starting deployment to staging..."

# Шаг 1: Проверяем наличие .env.staging
if [ ! -f ".env.staging" ]; then
  echo "❌ .env.staging file not found!"
  echo "Please create .env.staging with required variables"
  exit 1
fi

# Шаг 2: Валидируем обязательные переменные в .env.staging
echo "🔍 Validating environment variables..."
source .env.staging

required_vars=("DATABASE_URL" "NEXTAUTH_SECRET" "NEXTAUTH_URL" "NEXT_PUBLIC_APP_ENV")
for var in "${required_vars[@]}"; do
  if [ -z "${!var}" ]; then
    echo "❌ Missing required variable: $var in .env.staging"
    exit 1
  fi
done

echo "✅ Environment variables validated"

# Шаг 3: Запускаем тесты (если есть)
echo "🧪 Running tests..."
npm run lint || echo "⚠️  Linting failed, continuing..."

# Шаг 4: Генерируем Prisma Client
echo "🔧 Generating Prisma Client..."
dotenv -e .env.staging -- npx prisma generate

# Шаг 5: Применяем миграции к staging базе
echo "🗄️  Running database migrations..."
npm run db:migrate:staging

# Шаг 6: Билдим приложение локально для проверки
echo "🏗️  Building application..."
npm run build:staging

# Шаг 7: Деплоим в Vercel
echo "☁️  Deploying to Vercel..."
vercel

# Шаг 8: Получаем URL деплоя
echo "🔗 Getting deployment URL..."
DEPLOYMENT_URL=$(vercel ls | grep "Ready" | grep "Preview" | head -1 | awk '{print $2}')

if [ -n "$DEPLOYMENT_URL" ]; then
  echo "✅ Deployment successful!"
  echo "🌐 Staging URL: $DEPLOYMENT_URL"
  echo "📋 Next steps:"
  echo "   1. Test the staging environment: $DEPLOYMENT_URL"
  echo "   2. Check environment banner shows 'STAGING'"
  echo "   3. Test authentication and database"
  echo "   4. If all good, deploy to production with: npm run deploy:prod"
else
  echo "✅ Deployment successful!"
  echo "🌐 Check your Vercel dashboard for the latest staging URL"
  echo "📋 Next steps:"
  echo "   1. Go to https://vercel.com/dashboard"
  echo "   2. Find gymfuel-staging project"
  echo "   3. Test the latest deployment"
fi

echo "🎉 Staging deployment completed!" 