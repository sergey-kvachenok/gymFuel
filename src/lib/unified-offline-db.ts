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

    // Define schema version 11 with sync fields and optimized indexes
    this.version(11).stores({
      products: '&id, userId, name, createdAt, updatedAt, _synced, _lastModified, _version',
      consumptions:
        '&id, userId, productId, date, createdAt, updatedAt, _synced, _lastModified, _version',
      nutritionGoals: '&id, userId, createdAt, updatedAt, _synced, _lastModified, _version',
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
