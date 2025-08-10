import Dexie, { Table } from 'dexie';

import { Product, Consumption, NutritionGoals } from '../types/api';

export interface SyncQueueItem {
  id?: number;
  tableName: string;
  operation: 'create' | 'update' | 'delete';
  recordId: number;
  data?: unknown;
  timestamp: Date;
  userId: number;
}

/**
 * Dexie database class for offline storage
 * Handles products, consumption records, nutrition goals, and sync queue
 */
export class OfflineDatabase extends Dexie {
  products!: Table<Product>;
  consumptions!: Table<Consumption>;
  nutritionGoals!: Table<NutritionGoals>;
  syncQueue!: Table<SyncQueueItem>;

  constructor() {
    super('GymFuelOfflineDB');

    // Define schema version 1
    this.version(1).stores({
      products: '&id, userId, name, createdAt, updatedAt',
      consumptions: '&id, userId, productId, date, createdAt, updatedAt',
      nutritionGoals: '&id, userId, createdAt, updatedAt',
      syncQueue: '++id, tableName, operation, recordId, timestamp, userId',
    });

    // Add hooks for automatic timestamping
    this.products.hook('creating', (_primKey, obj) => {
      const now = new Date();
      (obj as Product).createdAt = now;
      (obj as Product).updatedAt = now;
    });

    this.products.hook('updating', (modifications) => {
      (modifications as Partial<Product>).updatedAt = new Date();
    });

    this.consumptions.hook('creating', (_primKey, obj) => {
      const now = new Date();
      (obj as Consumption).createdAt = now;
      (obj as Consumption).updatedAt = now;
    });

    this.consumptions.hook('updating', (modifications) => {
      (modifications as Partial<Consumption>).updatedAt = new Date();
    });

    this.nutritionGoals.hook('creating', (_primKey, obj) => {
      const now = new Date();
      (obj as NutritionGoals).createdAt = now;
      (obj as NutritionGoals).updatedAt = now;
    });

    this.nutritionGoals.hook('updating', (modifications) => {
      (modifications as Partial<NutritionGoals>).updatedAt = new Date();
    });
  }
}

// Export singleton instance
export const offlineDb = new OfflineDatabase();
