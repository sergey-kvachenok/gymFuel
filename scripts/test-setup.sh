#!/bin/bash

# Test Setup Script
# This script sets up the test environment with isolated database

set -e

echo "🧪 Setting up test environment..."

# Load test environment variables (ignore comments)
export $(grep -v '^#' test.env | xargs)

# Stop any existing test database
echo "🛑 Stopping existing test database..."
docker-compose -f docker-compose.test.yml down -v 2>/dev/null || true

# Start test database
echo "🚀 Starting test database..."
docker-compose -f docker-compose.test.yml up -d test-db

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
until docker-compose -f docker-compose.test.yml exec -T test-db pg_isready -U $POSTGRES_USER -d $POSTGRES_DB; do
  echo "Database not ready yet, waiting..."
  sleep 2
done

echo "✅ Database is ready!"

# Run database migrations
echo "🔄 Running database migrations..."
npx prisma migrate deploy

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Ensure test users are created
echo "👥 Creating test users..."
docker-compose -f docker-compose.test.yml exec -T test-db psql -U $POSTGRES_USER -d $POSTGRES_DB -f /docker-entrypoint-initdb.d/init-test-db.sql

echo "✅ Test environment setup complete!"
echo "📊 Test database running on port $DB_PORT"
echo "🔗 DATABASE_URL: $DATABASE_URL"
