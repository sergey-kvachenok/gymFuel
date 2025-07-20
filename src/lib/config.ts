// Environment configuration
export const APP_ENV = process.env.NEXT_PUBLIC_APP_ENV || 'development';
export const NODE_ENV = process.env.NODE_ENV || 'development';

export const isDevelopment = APP_ENV === 'development';
export const isStaging = APP_ENV === 'staging';
export const isProduction = APP_ENV === 'production';

// App configuration based on environment
export const config = {
  app: {
    name: 'GymFuel',
    version: '1.0.0',
    environment: APP_ENV,
  },

  database: {
    // Prisma will use DATABASE_URL from environment
    connectionPooling: isProduction,
  },

  auth: {
    // NextAuth will use NEXTAUTH_SECRET and NEXTAUTH_URL from environment
    sessionMaxAge: isProduction ? 7 * 24 * 60 * 60 : 24 * 60 * 60, // 7 days in prod, 1 day in dev
  },

  features: {
    // Feature flags based on environment
    analytics: isProduction,
    debugMode: isDevelopment,
    showEnvironmentBanner: !isProduction,
  },

  api: {
    // API configuration
    timeout: isProduction ? 10000 : 30000, // 10s in prod, 30s in dev
    retries: isProduction ? 3 : 1,
  },

  ui: {
    // UI configuration
    showDevTools: isDevelopment,
    enableHotReload: isDevelopment,
  },
};

// Environment-specific URLs (fallbacks if not in env)
export const getBaseUrl = () => {
  if (typeof window !== 'undefined') return '';

  // Server-side URL detection
  if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;

  return 'http://localhost:3000';
};

// Logging configuration
export const logger = {
  level: isDevelopment ? 'debug' : isStaging ? 'info' : 'warn',
  enabled: !isProduction,
};

// Export environment info for debugging
export const envInfo = {
  APP_ENV,
  NODE_ENV,
  isDevelopment,
  isStaging,
  isProduction,
  baseUrl: getBaseUrl(),
};
