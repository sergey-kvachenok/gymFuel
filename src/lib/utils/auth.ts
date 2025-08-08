import { Session } from 'next-auth';

// Get userId with offline fallback
export const getUserIdWithFallback = (session: Session | null, isOnline: boolean): number => {
  let userId = session?.user ? parseInt((session.user as { id: string }).id) : 0;
  
  // Check if we're in browser environment
  if (typeof window !== 'undefined') {
    if (userId === 0 && !isOnline) {
      const cachedUserId = localStorage.getItem('cachedUserId');
      if (cachedUserId) {
        userId = parseInt(cachedUserId);
      }
    } else if (userId > 0 && isOnline) {
      localStorage.setItem('cachedUserId', userId.toString());
    }
  }
  
  return userId;
};

// Cache userId for offline use
export const cacheUserId = (session: Session | null): void => {
  if (typeof window !== 'undefined' && session?.user) {
    const userId = (session.user as { id: string }).id;
    localStorage.setItem('cachedUserId', userId);
  }
};