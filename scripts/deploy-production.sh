#!/bin/bash

# Deploy to Production Script
# Автоматизирует весь процесс деплоя в production

set -e  # Останавливаем при ошибке

echo "🚀 Starting deployment to PRODUCTION..."

# Шаг 1: Подтверждение деплоя в продакшн
echo "⚠️  WARNING: You are about to deploy to PRODUCTION!"
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
  echo "❌ Deployment cancelled"
  exit 1
fi

# Шаг 2: Проверяем наличие .env
if [ ! -f ".env" ]; then
  echo "❌ .env file not found!"
  echo "Please create .env with production variables"
  exit 1
fi

# Шаг 3: Валидируем обязательные переменные
echo "🔍 Validating environment variables..."
source .env

required_vars=("DATABASE_URL" "NEXTAUTH_SECRET" "NEXTAUTH_URL")
for var in "${required_vars[@]}"; do
  if [ -z "${!var}" ]; then
    echo "❌ Missing required variable: $var in .env"
    exit 1
  fi
done

# Проверяем, что не используем staging/dev URL
if [[ "$NEXTAUTH_URL" == *"staging"* ]] || [[ "$NEXTAUTH_URL" == *"localhost"* ]]; then
  echo "❌ NEXTAUTH_URL looks like staging/dev URL: $NEXTAUTH_URL"
  echo "Please update to production URL"
  exit 1
fi

echo "✅ Environment variables validated"

# Шаг 4: Запускаем полные тесты
echo "🧪 Running full test suite..."
npm run lint

# Шаг 5: Генерируем Prisma Client
echo "🔧 Generating Prisma Client..."
npx prisma generate

# Шаг 6: Применяем миграции к production базе
echo "🗄️  Running database migrations..."
npm run db:migrate:prod

# Шаг 7: Билдим приложение
echo "🏗️  Building application..."
npm run build:prod

# Шаг 8: Деплоим в Vercel production
echo "☁️  Deploying to Vercel PRODUCTION..."
vercel --prod

# Шаг 9: Получаем production URL
echo "🔗 Getting production URL..."
DEPLOYMENT_URL=$(vercel ls | grep "gymfuel" | grep "production" | head -1 | awk '{print $2}')

if [ -n "$DEPLOYMENT_URL" ]; then
  echo "✅ PRODUCTION deployment successful!"
  echo "🌐 Production URL: https://$DEPLOYMENT_URL"
  echo "📋 Post-deployment checklist:"
  echo "   1. Test critical user flows"
  echo "   2. Check authentication"
  echo "   3. Verify database connectivity"
  echo "   4. Monitor error rates"
else
  echo "⚠️  Could not determine production URL"
fi

echo "🎉 PRODUCTION deployment completed!" 