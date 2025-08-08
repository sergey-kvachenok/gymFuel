'use client';
import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useNetworkStatus } from './use-network-status';
import { offlineStorage } from '@/lib/offline/storage';
import { trpcClient } from '@/lib/trpc-client';
import type { OfflineConsumption } from '@/lib/db/indexeddb';
import type { CreateConsumptionInput, UpdateConsumptionInput } from '@/types/api';

interface UseOfflineConsumptionParams {
  date?: string;
}

export const useOfflineConsumption = (params?: UseOfflineConsumptionParams) => {
  const { data: session, status } = useSession();
  const isOnline = useNetworkStatus();
  
  // Fallback for offline: try to get cached userId from localStorage
  let userId = session?.user ? parseInt((session.user as { id: string }).id) : 0;
  if (userId === 0 && !isOnline) {
    const cachedUserId = localStorage.getItem('cachedUserId');
    if (cachedUserId) {
      userId = parseInt(cachedUserId);
      console.log('Using cached userId for offline consumption:', userId);
    }
  } else if (userId > 0 && isOnline) {
    // Cache userId when online for offline use
    localStorage.setItem('cachedUserId', userId.toString());
  }
  
  const [data, setData] = useState<OfflineConsumption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetchData = useCallback(async () => {
    if (!userId || userId <= 0) return;
    
    setIsLoading(true);
    try {
      if (isOnline) {
        const queryParams = params?.date ? { date: params.date } : {};
        const result = await trpcClient.consumption.getByDate.query(queryParams);
        
        const offlineConsumptions: OfflineConsumption[] = result.map(consumption => ({
          ...consumption,
          date: new Date(consumption.createdAt), // Use createdAt as the consumption date
          updatedAt: new Date(),
          synced: true
        }));
        
        // Cache the data to IndexedDB for offline access
        try {
          await offlineStorage.syncConsumption(userId, offlineConsumptions);
        } catch (cacheError) {
          console.warn('Failed to cache consumptions to IndexedDB:', cacheError);
        }
        
        setData(offlineConsumptions);
        setError(null);
      } else {
        const result = params?.date 
          ? await offlineStorage.getConsumptionByDate(userId, new Date(params.date))
          : await offlineStorage.getConsumption(userId);
        
        setData(result);
        setError(null);
      }
    } catch (err) {
      console.warn('Primary data fetch failed:', err);
      
      // Always try to fallback to offline data, regardless of online status
      try {
        const offlineResult = params?.date 
          ? await offlineStorage.getConsumptionByDate(userId, new Date(params.date))
          : await offlineStorage.getConsumption(userId);
        
        console.log('Using cached data as fallback:', offlineResult.length, 'items');
        setData(offlineResult);
        setError(null); // Clear error since we have fallback data
      } catch (offlineErr) {
        console.error('Both online and offline fetch failed:', offlineErr);
        setError(offlineErr as Error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [userId, isOnline, params?.date]);

  useEffect(() => {
    console.log('useOfflineConsumption effect:', { status, userId, isOnline, session, params });
    
    if (status === 'loading') {
      setIsLoading(true);
      return;
    }
    
    // Only fail authentication if we're online AND don't have cached userId
    if (status === 'unauthenticated' && isOnline && userId === 0) {
      setIsLoading(false);
      setError(new Error('User not authenticated'));
      return;
    }
    
    // When offline or online with cached userId, don't fail on unauthenticated status if we have cached userId  
    if (status === 'unauthenticated' && userId === 0) {
      setIsLoading(false);
      setError(new Error('No cached user data available'));
      return;
    }
    
    if (userId > 0) {
      refetchData();
    } else {
      console.log('No valid userId, setting empty consumption data');
      setIsLoading(false);
      setData([]);
      setError(new Error('No valid user ID'));
    }
  }, [userId, isOnline, status, session, refetchData]);

  // Mutation functions
  const createConsumption = useCallback(async (input: CreateConsumptionInput) => {
    if (!userId) {
      throw new Error('User not authenticated');
    }

    try {
      if (isOnline) {
        console.log('Creating consumption online:', input);
        const result = await trpcClient.consumption.create.mutate(input);
        
        // Cache the result to IndexedDB
        const offlineConsumption = {
          ...result,
          date: new Date(result.createdAt),
          updatedAt: new Date(result.createdAt),
          synced: true
        };
        // Cache the consumption data by syncing it
        await offlineStorage.syncConsumption(userId, [offlineConsumption]);
        
        refetchData();
        return result;
      } else {
        console.log('Creating consumption offline:', input);
        const result = await offlineStorage.createConsumption(userId, input);
        refetchData();
        return result;
      }
    } catch (error) {
      console.error('Failed to create consumption:', error);
      
      if (isOnline) {
        try {
          console.log('Online creation failed, falling back to offline');
          const result = await offlineStorage.createConsumption(userId, input);
            refetchData();
          return result;
        } catch (offlineError) {
          throw offlineError;
        }
      } else {
        throw error;
      }
    }
  }, [userId, isOnline, refetchData]);

  const updateConsumption = useCallback(async (input: UpdateConsumptionInput) => {
    if (!userId) {
      throw new Error('User not authenticated');
    }

    try {
      if (isOnline) {
        console.log('Updating consumption online:', input);
        const result = await trpcClient.consumption.update.mutate(input);
        
        const offlineConsumption = {
          ...result,
          date: new Date(result.createdAt),
          updatedAt: new Date(result.createdAt),
          synced: true
        };
        // Cache the consumption data by syncing it
        await offlineStorage.syncConsumption(userId, [offlineConsumption]);
        
        refetchData();
        return result;
      } else {
        console.log('Updating consumption offline:', input);
        const result = await offlineStorage.updateConsumption(userId, input);
        refetchData();
        return result;
      }
    } catch (error) {
      console.error('Failed to update consumption:', error);
      
      if (isOnline) {
        try {
          console.log('Online update failed, falling back to offline');
          const result = await offlineStorage.updateConsumption(userId, input);
            refetchData();
          return result;
        } catch (offlineError) {
          throw offlineError;
        }
      } else {
        throw error;
      }
    }
  }, [userId, isOnline, refetchData]);

  const deleteConsumption = useCallback(async (id: number) => {
    if (!userId) {
      throw new Error('User not authenticated');
    }

    try {
      if (isOnline) {
        console.log('Deleting consumption online:', id);
        await trpcClient.consumption.delete.mutate({ id });
        await offlineStorage.deleteConsumption(userId, id);
        
        refetchData();
      } else {
        console.log('Deleting consumption offline:', id);
        await offlineStorage.deleteConsumption(userId, id);
        refetchData();
      }
    } catch (error) {
      console.error('Failed to delete consumption:', error);
      
      if (isOnline) {
        try {
          console.log('Online deletion failed, falling back to offline');
          await offlineStorage.deleteConsumption(userId, id);
            refetchData();
        } catch (offlineError) {
          throw offlineError;
        }
      } else {
        throw error;
      }
    }
  }, [userId, isOnline, refetchData]);

  return { 
    data, 
    isLoading, 
    error,
    createConsumption,
    updateConsumption,
    deleteConsumption,
    refetch: refetchData
  };
};

export const useOfflineDailyStats = (params?: { date?: string }) => {
  const { data: session, status } = useSession();
  const isOnline = useNetworkStatus();
  
  // Fallback for offline: try to get cached userId from localStorage
  let userId = session?.user ? parseInt((session.user as { id: string }).id) : 0;
  if (userId === 0 && !isOnline) {
    const cachedUserId = localStorage.getItem('cachedUserId');
    if (cachedUserId) {
      userId = parseInt(cachedUserId);
    }
  } else if (userId > 0 && isOnline) {
    // Cache userId when online for offline use
    localStorage.setItem('cachedUserId', userId.toString());
  }
  
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetchStats = useCallback(async () => {
    if (!userId || userId <= 0) return;
    
    setIsLoading(true);
    try {
      if (isOnline) {
        const queryParams = params?.date ? { date: params.date } : {};
        const result = await trpcClient.consumption.getDailyStats.query(queryParams);
        setData(result);
        setError(null);
      } else {
        const offlineResult = await offlineStorage.getDailyStats(userId, params?.date);
        setData(offlineResult);
        setError(null);
      }
    } catch (err) {
      console.warn('Daily stats fetch failed:', err);
      
      // Always try to fallback to offline data
      try {
        const offlineResult = await offlineStorage.getDailyStats(userId, params?.date);
        console.log('Using cached daily stats as fallback:', offlineResult);
        setData(offlineResult);
        setError(null); // Clear error since we have fallback data
      } catch (offlineErr) {  
        console.error('Both online and offline daily stats fetch failed:', offlineErr);
        setError(offlineErr as Error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [userId, isOnline, params?.date]);

  useEffect(() => {
    console.log('useOfflineDailyStats effect:', { status, userId, isOnline, session, params });
    
    if (status === 'loading') {
      setIsLoading(true);
      return;
    }
    
    // Only fail authentication if we're online AND don't have cached userId
    if (status === 'unauthenticated' && isOnline && userId === 0) {
      setIsLoading(false);
      setError(new Error('User not authenticated'));
      return;
    }
    
    // When offline or online with cached userId, don't fail on unauthenticated status if we have cached userId  
    if (status === 'unauthenticated' && userId === 0) {
      setIsLoading(false);
      setError(new Error('No cached user data available'));
      return;
    }
    
    if (userId > 0) {
      refetchStats();
    } else {
      console.log('No valid userId, setting empty daily stats');
      setIsLoading(false);
      setData(null);
      setError(new Error('No valid user ID'));
    }
  }, [userId, isOnline, status, session, refetchStats]);

  return { data, isLoading, error, refetch: refetchStats };
};

export const useOfflineHistory = (params?: { days?: number }) => {
  const { data: session, status } = useSession();
  const isOnline = useNetworkStatus();
  
  let userId = session?.user ? parseInt((session.user as { id: string }).id) : 0;
  if (userId === 0 && !isOnline) {
    const cachedUserId = localStorage.getItem('cachedUserId');
    if (cachedUserId) {
      userId = parseInt(cachedUserId);
    }
  } else if (userId > 0 && isOnline) {
    localStorage.setItem('cachedUserId', userId.toString());
  }
  
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetchHistory = useCallback(async () => {
    if (!userId || userId <= 0) return;
    
    setIsLoading(true);
    try {
      if (isOnline) {
        const queryParams = params?.days ? { days: params.days } : { days: 30 };
        const result = await trpcClient.consumption.getHistory.query(queryParams);
        setData(result);
        setError(null);
      } else {
        // Generate offline history from last X days using existing getDailyStats
        const days = params?.days || 30;
        const historyData = [];
        
        console.log(`🔍 Generating offline history for ${days} days`);
        
        for (let i = 0; i < days; i++) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          
          try {
            const stats = await offlineStorage.getDailyStats(userId, dateStr);
            console.log(`📅 ${dateStr}: ${stats.consumptionsCount} consumptions, ${stats.totalCalories} calories`);
            
            if (stats.consumptionsCount > 0) {
              historyData.push(stats);
            }
          } catch (err) {
            // Skip days with errors
            console.warn(`Failed to get stats for ${dateStr}:`, err);
          }
        }
        
        console.log(`📊 Total history days with data: ${historyData.length}`);
        setData(historyData);
        setError(null);
      }
    } catch (err) {
      console.warn('History fetch failed:', err);
      
      // Always try to fallback to offline data
      try {
        const days = params?.days || 30;
        const historyData = [];
        
        for (let i = 0; i < days; i++) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          
          try {
            const stats = await offlineStorage.getDailyStats(userId, dateStr);
            if (stats.consumptionsCount > 0) {
              historyData.push(stats);
            }
          } catch (err) {
            console.warn(`Failed to get stats for ${dateStr}:`, err);
          }
        }
        
        console.log('Using cached history as fallback:', historyData.length, 'days');
        setData(historyData);
        setError(null); // Clear error since we have fallback data
      } catch (offlineErr) {
        console.error('Both online and offline history fetch failed:', offlineErr);
        setError(offlineErr as Error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [userId, isOnline, params?.days]);

  useEffect(() => {
    if (status === 'loading') {
      setIsLoading(true);
      return;
    }
    
    // Only fail authentication if we're online AND don't have cached userId
    if (status === 'unauthenticated' && isOnline && userId === 0) {
      setIsLoading(false);
      setError(new Error('User not authenticated'));
      return;
    }
    
    // When offline or online with cached userId, don't fail on unauthenticated status if we have cached userId  
    if (status === 'unauthenticated' && userId === 0) {
      setIsLoading(false);
      setError(new Error('No cached user data available'));
      return;
    }
    
    if (userId > 0) {
      refetchHistory();
    } else {
      setIsLoading(false);
      setData([]);
      setError(new Error('No valid user ID'));
    }
  }, [userId, isOnline, status, session, refetchHistory]);

  return { data, isLoading, error, refetch: refetchHistory };
};