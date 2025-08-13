import Dexie, { Table } from 'dexie';
import { Product, Consumption, NutritionGoals } from '../types/api';
import { SyncableItem } from './unified-data-service';

export interface UnifiedProduct extends Product, SyncableItem {}
export interface UnifiedConsumption extends Consumption, SyncableItem {}
export interface UnifiedNutritionGoals extends NutritionGoals, SyncableItem {}

/**
 * Unified Dexie database class for offline storage
 * Version 11 includes sync fields for all tables
 */
export class UnifiedOfflineDatabase extends Dexie {
  products!: Table<UnifiedProduct>;
  consumptions!: Table<UnifiedConsumption>;
  nutritionGoals!: Table<UnifiedNutritionGoals>;

  constructor() {
    super('GymFuelUnifiedDB');

    // Define schema version 12 with enhanced performance indexes
    this.version(12).stores({
      products:
        '&id, userId, name, createdAt, updatedAt, _synced, _lastModified, _version, [userId+name], [userId+_synced]',
      consumptions:
        '&id, userId, productId, date, createdAt, updatedAt, _synced, _lastModified, _version, [userId+date], [userId+productId], [userId+_synced]',
      nutritionGoals:
        '&id, userId, createdAt, updatedAt, _synced, _lastModified, _version, [userId+_synced]',
    });

    // Add hooks for automatic timestamping and sync field management
    this.setupHooks();
  }

  private setupHooks() {
    // Product hooks
    this.products.hook('creating', (_primKey, obj) => {
      const now = new Date();
      (obj as UnifiedProduct).createdAt = now;
      (obj as UnifiedProduct).updatedAt = now;
      (obj as UnifiedProduct)._synced = false;
      (obj as UnifiedProduct)._syncTimestamp = null;
      (obj as UnifiedProduct)._syncError = null;
      (obj as UnifiedProduct)._lastModified = now;
      (obj as UnifiedProduct)._version = 1;
    });

    this.products.hook('updating', (modifications) => {
      const now = new Date();
      (modifications as Partial<UnifiedProduct>).updatedAt = now;
      (modifications as Partial<UnifiedProduct>)._synced = false;
      (modifications as Partial<UnifiedProduct>)._syncTimestamp = null;
      (modifications as Partial<UnifiedProduct>)._syncError = null;
      (modifications as Partial<UnifiedProduct>)._lastModified = now;
    });

    // Consumption hooks
    this.consumptions.hook('creating', (_primKey, obj) => {
      const now = new Date();
      (obj as UnifiedConsumption).createdAt = now;
      (obj as UnifiedConsumption).updatedAt = now;
      (obj as UnifiedConsumption)._synced = false;
      (obj as UnifiedConsumption)._syncTimestamp = null;
      (obj as UnifiedConsumption)._syncError = null;
      (obj as UnifiedConsumption)._lastModified = now;
      (obj as UnifiedConsumption)._version = 1;
    });

    this.consumptions.hook('updating', (modifications) => {
      const now = new Date();
      (modifications as Partial<UnifiedConsumption>).updatedAt = now;
      (modifications as Partial<UnifiedConsumption>)._synced = false;
      (modifications as Partial<UnifiedConsumption>)._syncTimestamp = null;
      (modifications as Partial<UnifiedConsumption>)._syncError = null;
      (modifications as Partial<UnifiedConsumption>)._lastModified = now;
    });

    // Nutrition Goals hooks
    this.nutritionGoals.hook('creating', (_primKey, obj) => {
      const now = new Date();
      (obj as UnifiedNutritionGoals).createdAt = now;
      (obj as UnifiedNutritionGoals).updatedAt = now;
      (obj as UnifiedNutritionGoals)._synced = false;
      (obj as UnifiedNutritionGoals)._syncTimestamp = null;
      (obj as UnifiedNutritionGoals)._syncError = null;
      (obj as UnifiedNutritionGoals)._lastModified = now;
      (obj as UnifiedNutritionGoals)._version = 1;
    });

    this.nutritionGoals.hook('updating', (modifications) => {
      const now = new Date();
      (modifications as Partial<UnifiedNutritionGoals>).updatedAt = now;
      (modifications as Partial<UnifiedNutritionGoals>)._synced = false;
      (modifications as Partial<UnifiedNutritionGoals>)._syncTimestamp = null;
      (modifications as Partial<UnifiedNutritionGoals>)._syncError = null;
      (modifications as Partial<UnifiedNutritionGoals>)._lastModified = now;
    });
  }

  /**
   * Optimized query methods for better performance
   */

  /**
   * Get products by user with optimized query
   */
  async getProductsByUser(
    userId: string,
    options?: {
      limit?: number;
      offset?: number;
      search?: string;
      orderDirection?: 'asc' | 'desc';
    },
  ) {
    const { limit = 50, offset = 0, search, orderDirection = 'asc' } = options || {};

    const query = this.products.where('userId').equals(userId);

    if (search) {
      const results = await query
        .filter((product) => product.name.toLowerCase().includes(search.toLowerCase()))
        .toArray();

      return orderDirection === 'desc'
        ? results.reverse().slice(offset, offset + limit)
        : results.slice(offset, offset + limit);
    }

    const results = await query.toArray();
    return orderDirection === 'desc'
      ? results.reverse().slice(offset, offset + limit)
      : results.slice(offset, offset + limit);
  }

  /**
   * Get consumptions by user and date range with optimized query
   */
  async getConsumptionsByUserAndDateRange(
    userId: string,
    startDate: Date,
    endDate: Date,
    options?: {
      limit?: number;
      offset?: number;
      includeProduct?: boolean;
    },
  ) {
    const { limit = 100, offset = 0, includeProduct = false } = options || {};

    const consumptions = await this.consumptions
      .where('userId')
      .equals(userId)
      .and((consumption) => consumption.date >= startDate && consumption.date <= endDate)
      .reverse()
      .offset(offset)
      .limit(limit)
      .toArray();

    if (includeProduct) {
      // Batch load products for better performance
      const productIds = [...new Set(consumptions.map((c) => c.productId))];
      const products = await this.products.where('id').anyOf(productIds).toArray();

      const productMap = new Map(products.map((p) => [p.id, p]));

      return consumptions.map((consumption) => ({
        ...consumption,
        product: productMap.get(consumption.productId),
      }));
    }

    return consumptions;
  }

  /**
   * Get unsynced items with optimized query
   */
  async getUnsyncedItems(
    userId: string,
    tableName: 'products' | 'consumptions' | 'nutritionGoals',
  ) {
    const table = this[tableName];
    return await table
      .where('userId')
      .equals(userId)
      .and((item) => !item._synced)
      .toArray();
  }

  /**
   * Bulk operations for better performance
   */
  async bulkAddProducts(products: Omit<UnifiedProduct, 'id'>[]) {
    return await this.products.bulkAdd(products as UnifiedProduct[]);
  }

  async bulkAddConsumptions(consumptions: Omit<UnifiedConsumption, 'id'>[]) {
    return await this.consumptions.bulkAdd(consumptions as UnifiedConsumption[]);
  }

  async bulkUpdateProducts(products: UnifiedProduct[]) {
    return await this.products.bulkPut(products);
  }

  async bulkUpdateConsumptions(consumptions: UnifiedConsumption[]) {
    return await this.consumptions.bulkPut(consumptions);
  }

  /**
   * Cleanup old data for memory management
   */
  async cleanupOldData(userId: string, daysToKeep: number = 90) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    // Clean up old consumptions
    const oldConsumptions = await this.consumptions
      .where('userId')
      .equals(userId)
      .and((consumption) => consumption.date < cutoffDate)
      .toArray();

    if (oldConsumptions.length > 0) {
      await this.consumptions.bulkDelete(oldConsumptions.map((c) => c.id));
      console.log(`Cleaned up ${oldConsumptions.length} old consumptions`);
    }
  }

  /**
   * Get database statistics for monitoring
   */
  async getDatabaseStats(userId: string) {
    const [productCount, consumptionCount, goalsCount] = await Promise.all([
      this.products.where('userId').equals(userId).count(),
      this.consumptions.where('userId').equals(userId).count(),
      this.nutritionGoals.where('userId').equals(userId).count(),
    ]);

    return {
      products: productCount,
      consumptions: consumptionCount,
      goals: goalsCount,
      total: productCount + consumptionCount + goalsCount,
    };
  }

  /**
   * Migrate data from old schema to new unified schema
   */
  async migrateFromOldSchema() {
    try {
      // Check if old database exists
      const oldDbName = 'GymFuelOfflineDB';
      const oldDbExists = await Dexie.exists(oldDbName);

      if (!oldDbExists) {
        console.log('No old database found, skipping migration');
        return;
      }

      // Open old database
      const oldDb = new Dexie(oldDbName);
      await oldDb.open();

      // Migrate products
      if (oldDb.table('products')) {
        const oldProducts = await oldDb.table('products').toArray();
        for (const product of oldProducts) {
          const unifiedProduct: UnifiedProduct = {
            ...product,
            _synced: true, // Mark as synced since they were in the old DB
            _syncTimestamp: new Date(),
            _syncError: null,
            _lastModified: product.updatedAt || product.createdAt,
            _version: 1,
          };
          await this.products.put(unifiedProduct);
        }
      }

      // Migrate consumptions
      if (oldDb.table('consumptions')) {
        const oldConsumptions = await oldDb.table('consumptions').toArray();
        for (const consumption of oldConsumptions) {
          const unifiedConsumption: UnifiedConsumption = {
            ...consumption,
            _synced: true,
            _syncTimestamp: new Date(),
            _syncError: null,
            _lastModified: consumption.updatedAt || consumption.createdAt,
            _version: 1,
          };
          await this.consumptions.put(unifiedConsumption);
        }
      }

      // Migrate nutrition goals
      if (oldDb.table('nutritionGoals')) {
        const oldGoals = await oldDb.table('nutritionGoals').toArray();
        for (const goals of oldGoals) {
          const unifiedGoals: UnifiedNutritionGoals = {
            ...goals,
            _synced: true,
            _syncTimestamp: new Date(),
            _syncError: null,
            _lastModified: goals.updatedAt || goals.createdAt,
            _version: 1,
          };
          await this.nutritionGoals.put(unifiedGoals);
        }
      }

      // Close old database
      await oldDb.close();

      // Delete old database
      await Dexie.delete(oldDbName);

      console.log('Migration completed successfully');
    } catch (error) {
      console.error('Migration failed:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const unifiedOfflineDb = new UnifiedOfflineDatabase();
