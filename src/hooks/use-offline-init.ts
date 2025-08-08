'use client';
import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { offlineStorage } from '@/lib/offline/storage';

export const useOfflineInit = () => {
  const { data: session, status } = useSession();
  const userId = session?.user ? parseInt((session.user as { id: string }).id) : 0;

  useEffect(() => {
    const initOfflineStorage = async () => {
      if (status === 'loading') return;
      if (userId > 0) {
        try {
          await offlineStorage.init();
          console.log('Offline storage initialized');
        } catch (error) {
          console.error('Failed to initialize offline storage:', error);
        }
      }
    };

    initOfflineStorage();
  }, [userId, status]);
};