import { offlineStorage } from './storage';
import { SyncOperation } from '@/lib/db/indexeddb';
import { CreateProductInput, UpdateProductInput, CreateConsumptionInput, UpdateConsumptionInput, Product, Consumption } from '@/types/api';
import { IFormData } from '@/app/(protected)/goals/types';
import type { AppRouter } from '@/lib/routers';
import type { TRPCClient } from '@trpc/client';

export class SyncService {
  private isSyncing = false;

  async syncToServer(userId: number, trpcClient: TRPCClient<AppRouter>): Promise<{ success: number; failed: number }> {
    if (this.isSyncing) {
      console.warn('Sync already in progress');
      return { success: 0, failed: 0 };
    }

    this.isSyncing = true;
    let successCount = 0;
    let failedCount = 0;

    try {
      const operations = await offlineStorage.getSyncOperations(userId);
      const sortedOperations = operations.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

      console.log(`Starting sync of ${sortedOperations.length} operations`);

      for (const operation of sortedOperations) {
        try {
          await this.syncOperation(operation, trpcClient);
          await offlineStorage.deleteSyncOperation(operation.id!);
          successCount++;
          console.log(`Synced operation ${operation.id}:`, operation);
        } catch (error) {
          console.error(`Failed to sync operation ${operation.id}:`, error);
          failedCount++;
        }
      }

      console.log(`Sync completed: ${successCount} success, ${failedCount} failed`);
      return { success: successCount, failed: failedCount };
    } finally {
      this.isSyncing = false;
    }
  }

  private async syncOperation(operation: SyncOperation, trpcClient: TRPCClient<AppRouter>): Promise<void> {
    const { type, entity, entityId, data } = operation;

    switch (entity) {
      case 'product':
        await this.syncProductOperation(type, entityId, data as CreateProductInput | UpdateProductInput | { id: number }, trpcClient);
        break;
      case 'consumption':
        await this.syncConsumptionOperation(type, entityId, data as CreateConsumptionInput | UpdateConsumptionInput | { id: number }, trpcClient);
        break;
      case 'goal':
        await this.syncGoalOperation(type, entityId, data as IFormData | { id: number }, trpcClient);
        break;
      default:
        throw new Error(`Unknown entity type: ${entity}`);
    }
  }

  private async syncProductOperation(
    type: SyncOperation['type'],
    entityId: number | undefined,
    data: CreateProductInput | UpdateProductInput | { id: number },
    trpcClient: TRPCClient<AppRouter>
  ): Promise<void> {
    const client = trpcClient as unknown as {
      product: {
        create: { mutate: (data: CreateProductInput) => Promise<Product> };
        update: { mutate: (data: UpdateProductInput) => Promise<Product> };
        delete: { mutate: (data: { id: number }) => Promise<Product> };
      };
    };

    switch (type) {
      case 'CREATE':
        await client.product.create.mutate(data as CreateProductInput);
        break;
      case 'UPDATE':
        await client.product.update.mutate(data as UpdateProductInput);
        break;
      case 'DELETE':
        await client.product.delete.mutate({ id: entityId! });
        break;
    }
  }

  private async syncConsumptionOperation(
    type: SyncOperation['type'],
    entityId: number | undefined,
    data: CreateConsumptionInput | UpdateConsumptionInput | { id: number },
    trpcClient: TRPCClient<AppRouter>
  ): Promise<void> {
    const client = trpcClient as unknown as {
      consumption: {
        create: { mutate: (data: CreateConsumptionInput) => Promise<Consumption> };
        update: { mutate: (data: UpdateConsumptionInput) => Promise<Consumption> };
        delete: { mutate: (data: { id: number }) => Promise<Consumption> };
      };
    };

    switch (type) {
      case 'CREATE':
        await client.consumption.create.mutate(data as CreateConsumptionInput);
        break;
      case 'UPDATE':
        await client.consumption.update.mutate(data as UpdateConsumptionInput);
        break;
      case 'DELETE':
        await client.consumption.delete.mutate({ id: entityId! });
        break;
    }
  }

  private async syncGoalOperation(
    type: SyncOperation['type'],
    _entityId: number | undefined,
    data: IFormData | { id: number },
    trpcClient: TRPCClient<AppRouter>
  ): Promise<void> {
    const client = trpcClient as unknown as {
      goals: {
        upsert: { mutate: (data: IFormData) => Promise<unknown> };
        delete: { mutate: () => Promise<unknown> };
      };
    };

    switch (type) {
      case 'CREATE':
      case 'UPDATE':
        await client.goals.upsert.mutate(data as IFormData);
        break;
      case 'DELETE':
        await client.goals.delete.mutate();
        break;
    }
  }

  getIsSyncing(): boolean {
    return this.isSyncing;
  }
}

export const syncService = new SyncService();