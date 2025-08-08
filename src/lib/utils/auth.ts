import { Session } from 'next-auth';

// Helper function to get cached user ID from cookie (client-side only for hooks)
export const getCachedUserId = (): string | null => {
  if (typeof document !== 'undefined') {
    const cookieValue = document.cookie
      .split(';')
      .find(cookie => cookie.trim().startsWith('cachedUserId='))
      ?.split('=')[1];
    return cookieValue || null;
  }
  return null;
};

// Cache userId for offline use as a cookie (client-side)
export const cacheUserId = (session: Session | null): void => {
  if (typeof document !== 'undefined' && session?.user) {
    const userId = (session.user as { id: string }).id;
    document.cookie = `cachedUserId=${userId}; path=/; max-age=${30 * 24 * 60 * 60}; samesite=lax`;
  }
};

export const getUserIdWithFallback = (session: Session | null, isOnline: boolean): number => {
  // Primary: get from session when available
  if (session?.user) {
    const userId = parseInt((session.user as { id: string }).id);
    return userId;
  }

  // Fallback: get from cookie when offline (works in SSR too)
  if (!isOnline) {
    const cachedUserId = getCachedUserId();
    if (cachedUserId) {
      return parseInt(cachedUserId);
    }
  }

  return 0;
};
