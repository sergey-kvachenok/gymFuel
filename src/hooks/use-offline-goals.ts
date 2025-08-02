'use client';
import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useNetworkStatus } from './use-network-status';
import { offlineStorage } from '@/lib/offline/storage';
import { trpcClient } from '@/lib/trpc-client';
import { useOfflineUtils } from './use-offline-utils';
import type { OfflineGoal } from '@/lib/db/indexeddb';
import type { IFormData } from '@/app/(protected)/goals/types';

export const useOfflineGoals = () => {
  const { data: session, status } = useSession();
  const isOnline = useNetworkStatus();
  const utils = useOfflineUtils();
  
  // Fallback for offline: try to get cached userId from localStorage
  let userId = session?.user ? parseInt((session.user as { id: string }).id) : 0;
  if (userId === 0 && !isOnline) {
    const cachedUserId = localStorage.getItem('cachedUserId');
    if (cachedUserId) {
      userId = parseInt(cachedUserId);
      console.log('Using cached userId for offline goals:', userId);
    }
  } else if (userId > 0 && isOnline) {
    // Cache userId when online for offline use
    localStorage.setItem('cachedUserId', userId.toString());
  }
  
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetchGoals = useCallback(async () => {
    if (!userId || userId <= 0) return;
    
    setIsLoading(true);
    try {
      if (isOnline) {
        const result = await trpcClient.goals.get.query();
        setData(result);
        setError(null);
      } else {
        const offlineResult = await offlineStorage.getGoals(userId);
        // Use the latest goal if multiple exist
        const latestGoal = offlineResult.length > 0 ? offlineResult[offlineResult.length - 1] : null;
        setData(latestGoal);
        setError(null);
      }
    } catch (err) {
      console.warn('Goals fetch failed:', err);
      
      // Always try to fallback to offline data
      try {
        const offlineResult = await offlineStorage.getGoals(userId);
        const latestGoal = offlineResult.length > 0 ? offlineResult[offlineResult.length - 1] : null;
        console.log('Using cached goals as fallback:', latestGoal);
        setData(latestGoal);
        setError(null); // Clear error since we have fallback data
      } catch (offlineErr) {
        console.error('Both online and offline goals fetch failed:', offlineErr);
        setError(offlineErr as Error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [userId, isOnline]);

  useEffect(() => {
    console.log('useOfflineGoals effect:', { status, userId, isOnline, session });
    
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
      refetchGoals();
    } else {
      console.log('No valid userId, setting empty goals data');
      setIsLoading(false);
      setData(null);
      setError(new Error('No valid user ID'));
    }
  }, [userId, isOnline, status, session, refetchGoals]);

  // Mutation functions
  const upsertGoal = useCallback(async (input: IFormData) => {
    if (!userId) {
      throw new Error('User not authenticated');
    }

    try {
      if (isOnline) {
        console.log('Upserting goal online:', input);
        const result = await trpcClient.goals.upsert.mutate(input);
        
        utils.goal.getAll.invalidate();
        refetchGoals();
        return result;
      } else {
        console.log('Upserting goal offline:', input);
        // For offline, try to update existing goal or create new one
        const existingGoals = await offlineStorage.getGoals(userId);
        if (existingGoals.length > 0) {
          const latestGoal = existingGoals[existingGoals.length - 1];
          const result = await offlineStorage.updateGoal(userId, latestGoal.id!, input);
          utils.goal.getAll.invalidate();
          refetchGoals();
          return result;
        } else {
          const result = await offlineStorage.createGoal(userId, input);
          utils.goal.getAll.invalidate();
          refetchGoals();
          return result;
        }
      }
    } catch (error) {
      console.error('Failed to upsert goal:', error);
      
      if (isOnline) {
        try {
          console.log('Online upsert failed, falling back to offline');
          const existingGoals = await offlineStorage.getGoals(userId);
          if (existingGoals.length > 0) {
            const latestGoal = existingGoals[existingGoals.length - 1];
            const result = await offlineStorage.updateGoal(userId, latestGoal.id!, input);
            utils.goal.getAll.invalidate();
            refetchGoals();
            return result;
          } else {
            const result = await offlineStorage.createGoal(userId, input);
            utils.goal.getAll.invalidate();
            refetchGoals();
            return result;
          }
        } catch (offlineError) {
          throw offlineError;
        }
      } else {
        throw error;
      }
    }
  }, [userId, isOnline, utils, refetchGoals]);

  return { 
    data, 
    isLoading, 
    error,
    upsertGoal,
    refetch: refetchGoals
  };
};