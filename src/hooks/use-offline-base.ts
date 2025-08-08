import { useSession } from 'next-auth/react';
import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useNetworkStatus } from './use-network-status';
import { getUserIdWithFallback, getCachedUserId, cacheUserId } from '@/lib/utils/auth';

export const useOfflineBase = <T>(defaultOfflineState: T) => {
  const { data: session, status } = useSession();
  const isOnline = useNetworkStatus();
  const wasOfflineRef = useRef(false);

  const userId = useMemo(() => getUserIdWithFallback(session, isOnline), [session, isOnline]);
  const [offlineData, setOfflineData] = useState<T>(defaultOfflineState);
  const [isLoadingOffline, setIsLoadingOffline] = useState(false);

  // Cache userId for offline use when session is available
  useEffect(() => {
    cacheUserId(session);
  }, [session]);

  const isUnauthorized = useMemo(() => status === 'loading' || (userId <= 0 && isOnline), [status, userId, isOnline]);

  const checkAuth = useCallback(() => {
    if (isUnauthorized) {
      throw new Error('User not authenticated');
    }
  }, [isUnauthorized]);

  const tRPCEnabled = useMemo(() => isOnline && 
    (!!session?.user || !!getCachedUserId()), [isOnline, session?.user]);

  return {
    // Session & auth
    session,
    status,
    isUnauthorized,
    checkAuth,
    
    // Network & user
    isOnline,
    wasOfflineRef,
    userId,
    
    // Offline data state
    offlineData,
    setOfflineData,
    isLoadingOffline,
    setIsLoadingOffline,
    
    // tRPC config
    tRPCEnabled,
  };
};