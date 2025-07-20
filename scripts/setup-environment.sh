#!/bin/bash

# Environment Setup Script
# Автоматизирует создание и настройку окружений

set -e

echo "🔧 Environment Setup Assistant"
echo "==============================="

# Функция для генерации секрета
generate_secret() {
  openssl rand -base64 32
}

# Функция для создания .env файла
create_env_file() {
  local env_name=$1
  local env_file=$2
  local db_url=$3
  local nextauth_url=$4
  local app_env=$5

  echo "📝 Creating $env_file..."
  
  cat > "$env_file" << EOF
# Database
DATABASE_URL="$db_url"

# NextAuth
NEXTAUTH_SECRET="$(generate_secret)"
NEXTAUTH_URL="$nextauth_url"

# App Environment
NEXT_PUBLIC_APP_ENV="$app_env"
NODE_ENV="$app_env"
EOF

  echo "✅ $env_file created successfully"
}

# Меню выбора
echo "What would you like to set up?"
echo "1. Development environment (.env.development)"
echo "2. Staging environment (.env.staging)"
echo "3. Production environment (.env)"
echo "4. All environments"
read -p "Choose option (1-4): " choice

case $choice in
  1)
    echo "🛠️  Setting up Development environment..."
    read -p "Enter Docker PostgreSQL URL (default: postgresql://postgres:password@localhost:5432/gymfuel): " dev_db_url
    dev_db_url=${dev_db_url:-"postgresql://postgres:password@localhost:5432/gymfuel"}
    create_env_file "development" ".env.development" "$dev_db_url" "http://localhost:3000" "development"
    ;;
  
  2)
    echo "🎭 Setting up Staging environment..."
    read -p "Enter Neon staging database URL: " staging_db_url
    read -p "Enter staging domain (e.g., gymfuel-staging.vercel.app): " staging_domain
    create_env_file "staging" ".env.staging" "$staging_db_url" "https://$staging_domain" "staging"
    ;;
  
  3)
    echo "🚀 Setting up Production environment..."
    read -p "Enter Neon production database URL: " prod_db_url
    read -p "Enter production domain (e.g., gymfuel.vercel.app): " prod_domain
    create_env_file "production" ".env" "$prod_db_url" "https://$prod_domain" "production"
    ;;
  
  4)
    echo "🌍 Setting up ALL environments..."
    
    # Development
    echo "--- Development ---"
    read -p "Enter Docker PostgreSQL URL (default: postgresql://postgres:password@localhost:5432/gymfuel): " dev_db_url
    dev_db_url=${dev_db_url:-"postgresql://postgres:password@localhost:5432/gymfuel"}
    create_env_file "development" ".env.development" "$dev_db_url" "http://localhost:3000" "development"
    
    # Staging
    echo "--- Staging ---"
    read -p "Enter Neon staging database URL: " staging_db_url
    read -p "Enter staging domain: " staging_domain
    create_env_file "staging" ".env.staging" "$staging_db_url" "https://$staging_domain" "staging"
    
    # Production
    echo "--- Production ---"
    read -p "Enter Neon production database URL: " prod_db_url
    read -p "Enter production domain: " prod_domain
    create_env_file "production" ".env" "$prod_db_url" "https://$prod_domain" "production"
    ;;
  
  *)
    echo "❌ Invalid option"
    exit 1
    ;;
esac

echo ""
echo "🎉 Environment setup completed!"
echo ""
echo "📋 Next steps:"
echo "1. Review the created .env files"
echo "2. Update Vercel environment variables"
echo "3. Run database migrations: npm run db:migrate:[env]"
echo "4. Deploy: npm run deploy:staging or npm run deploy:prod" 