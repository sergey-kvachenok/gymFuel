# 🚀 Deployment Guide

## 📋 Quick Start

### 🔧 First Time Setup

```bash
# 1. Setup all environments interactively
npm run setup:env

# 2. Review created .env files
# 3. Add environment variables to Vercel projects
# 4. Run migrations for each environment
```

### 🎯 Deploy to Staging

```bash
npm run deploy:staging
```

### 🚀 Deploy to Production

```bash
npm run deploy:prod
```

## 🌍 Environment Configuration

### Development (.env.development)

- **Database**: Local Docker PostgreSQL
- **URL**: http://localhost:3000
- **Purpose**: Local development

### Staging (.env.staging)

- **Database**: Neon PostgreSQL (staging)
- **URL**: https://gymfuel-staging.vercel.app
- **Purpose**: Testing before production

### Production (.env)

- **Database**: Neon PostgreSQL (production)
- **URL**: https://gymfuel.vercel.app
- **Purpose**: Live application

## 🤖 Automated Scripts

### 📝 Environment Setup

```bash
npm run setup:env
```

**What it does:**

- Interactive environment setup
- Generates unique NEXTAUTH_SECRET for each env
- Creates .env files with proper structure
- Provides guidance for next steps

### 🎭 Staging Deployment

```bash
npm run deploy:staging
```

**What it does:**

- ✅ Validates .env.staging variables
- 🧪 Runs linting
- 🔧 Generates Prisma client
- 🗄️ Applies database migrations
- 🏗️ Builds application
- ☁️ Deploys to Vercel
- 📊 Shows deployment URL

### 🚀 Production Deployment

```bash
npm run deploy:prod
```

**What it does:**

- ⚠️ Requires confirmation
- ✅ Validates production variables
- 🔒 Security checks (prevents staging URLs)
- 🧪 Runs full test suite
- 🔧 Generates Prisma client
- 🗄️ Applies database migrations
- 🏗️ Builds application
- ☁️ Deploys to Vercel production
- 📋 Post-deployment checklist

## 🔐 Environment Variables

### Required for all environments:

- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - Unique secret for JWT signing
- `NEXTAUTH_URL` - Full application URL
- `NEXT_PUBLIC_APP_ENV` - Environment identifier

### Vercel Configuration:

1. Go to Vercel Dashboard
2. Select your project
3. Settings → Environment Variables
4. Add variables for each environment

## 🗄️ Database Management

### Migrations

```bash
# Development
npm run db:migrate:dev

# Staging
npm run db:migrate:staging

# Production
npm run db:migrate:prod
```

### Database Studio

```bash
# Development
npm run db:studio:dev

# Staging
npm run db:studio:staging

# Production
npm run db:studio:prod
```

## 🔍 Deployment Workflow

### 1. Development

```bash
# Start local development
npm run dev

# Make changes
# Test locally
```

### 2. Staging Deployment

```bash
# Deploy to staging
npm run deploy:staging

# Test staging environment
# Verify all features work
```

### 3. Production Deployment

```bash
# Deploy to production (after staging approval)
npm run deploy:prod

# Monitor production
# Run smoke tests
```

## 🐛 Troubleshooting

### Build Errors

- **Prisma Client**: Run `npm run db:generate`
- **Environment Variables**: Check .env files
- **Missing Dependencies**: Run `npm install`

### Database Issues

- **Migration Errors**: Check database connection
- **Schema Changes**: Create new migration with `npx prisma migrate dev`

### Vercel Deployment

- **Environment Variables**: Ensure all required vars are set
- **Build Failures**: Check build logs in Vercel dashboard

## 📊 Monitoring

### After Deployment Check:

- [ ] Application loads successfully
- [ ] Authentication works
- [ ] Database connectivity
- [ ] API endpoints respond
- [ ] Environment banner shows correct environment

## 🔄 CI/CD Pipeline

The repository includes GitHub Actions workflow in `.github/workflows/deploy.yml` for automated deployments:

- **Push to `develop`** → Auto-deploy to staging
- **Push to `main`** → Auto-deploy to production
- **Pull Requests** → Preview deployments

## 📞 Support

If you encounter issues:

1. Check the deployment logs
2. Verify environment variables
3. Test database connectivity
4. Review Vercel function logs
