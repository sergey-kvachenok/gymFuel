import { offlineDb, SyncQueueItem } from './offline-db';
import { Product, Consumption, NutritionGoals } from '../types/api';

/**
 * Data abstraction layer that routes operations to IndexedDB when offline
 * and manages sync queue for offline operations
 */
export class OfflineDataService {
  /**
   * Add an operation to the sync queue
   */
  private async addToSyncQueue(
    tableName: string,
    operation: 'create' | 'update' | 'delete',
    recordId: number,
    data?: unknown,
    userId?: number,
  ): Promise<void> {
    const syncItem: SyncQueueItem = {
      tableName,
      operation,
      recordId,
      data,
      timestamp: new Date(),
      userId: userId || 0, // TODO: Get from auth context
    };

    await offlineDb.syncQueue.add(syncItem);
  }

  /**
   * Get all pending sync operations
   */
  async getPendingSyncOperations(): Promise<SyncQueueItem[]> {
    return await offlineDb.syncQueue.orderBy('timestamp').toArray();
  }

  // === PRODUCT OPERATIONS ===

  /**
   * Create a product offline
   */
  async createProduct(
    productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Product> {
    const id = await offlineDb.products.add(productData as Product);
    const product = await offlineDb.products.get(id);

    if (product) {
      await this.addToSyncQueue('products', 'create', product.id, product, productData.userId);
    }

    return product!;
  }

  /**
   * Update a product offline
   */
  async updateProduct(id: number, updates: Partial<Product>): Promise<Product | undefined> {
    await offlineDb.products.update(id, updates);
    const product = await offlineDb.products.get(id);

    if (product) {
      await this.addToSyncQueue('products', 'update', id, product, product.userId);
    }

    return product;
  }

  /**
   * Delete a product offline
   */
  async deleteProduct(id: number): Promise<void> {
    const product = await offlineDb.products.get(id);

    if (product) {
      await offlineDb.products.delete(id);
      await this.addToSyncQueue('products', 'delete', id, null, product.userId);
    }
  }

  /**
   * Get all products for a user
   */
  async getProducts(userId: number): Promise<Product[]> {
    return await offlineDb.products.where('userId').equals(userId).toArray();
  }

  /**
   * Get a single product
   */
  async getProduct(id: number): Promise<Product | undefined> {
    return await offlineDb.products.get(id);
  }

  // === CONSUMPTION OPERATIONS ===

  /**
   * Create a consumption record offline
   */
  async createConsumption(
    consumptionData: Omit<Consumption, 'id' | 'createdAt' | 'updatedAt' | 'product'>,
  ): Promise<Consumption> {
    const id = await offlineDb.consumptions.add(consumptionData as Consumption);
    const consumption = await offlineDb.consumptions.get(id);

    if (consumption) {
      await this.addToSyncQueue(
        'consumptions',
        'create',
        consumption.id,
        consumption,
        consumptionData.userId,
      );
    }

    return consumption!;
  }

  /**
   * Update a consumption record offline
   */
  async updateConsumption(
    id: number,
    updates: Partial<Consumption>,
  ): Promise<Consumption | undefined> {
    await offlineDb.consumptions.update(id, updates);
    const consumption = await offlineDb.consumptions.get(id);

    if (consumption) {
      await this.addToSyncQueue('consumptions', 'update', id, consumption, consumption.userId);
    }

    return consumption;
  }

  /**
   * Delete a consumption record offline
   */
  async deleteConsumption(id: number): Promise<void> {
    const consumption = await offlineDb.consumptions.get(id);

    if (consumption) {
      await offlineDb.consumptions.delete(id);
      await this.addToSyncQueue('consumptions', 'delete', id, null, consumption.userId);
    }
  }

  /**
   * Get consumptions for a user by date range
   */
  async getConsumptions(userId: number, startDate?: Date, endDate?: Date): Promise<Consumption[]> {
    let query = offlineDb.consumptions.where('userId').equals(userId);

    if (startDate && endDate) {
      query = query.and((item) => item.date >= startDate && item.date <= endDate);
    }

    return await query.toArray();
  }

  // === NUTRITION GOALS OPERATIONS ===

  /**
   * Create or update nutrition goals offline
   */
  async upsertNutritionGoals(
    goalsData: Omit<NutritionGoals, 'createdAt' | 'updatedAt'>,
  ): Promise<NutritionGoals> {
    const existing = await offlineDb.nutritionGoals
      .where('userId')
      .equals(goalsData.userId)
      .first();

    if (existing) {
      await offlineDb.nutritionGoals.update(existing.id, goalsData);
      const updated = await offlineDb.nutritionGoals.get(existing.id);

      if (updated) {
        await this.addToSyncQueue(
          'nutritionGoals',
          'update',
          existing.id,
          updated,
          goalsData.userId,
        );
      }

      return updated!;
    } else {
      const id = await offlineDb.nutritionGoals.add(goalsData as NutritionGoals);
      const goals = await offlineDb.nutritionGoals.get(id);

      if (goals) {
        await this.addToSyncQueue('nutritionGoals', 'create', goals.id, goals, goalsData.userId);
      }

      return goals!;
    }
  }

  /**
   * Get nutrition goals for a user
   */
  async getNutritionGoals(userId: number): Promise<NutritionGoals | undefined> {
    return await offlineDb.nutritionGoals.where('userId').equals(userId).first();
  }

  // === SYNC QUEUE OPERATIONS ===

  /**
   * Get the current count of items in the sync queue for a user
   */
  async getSyncQueueCount(userId?: number): Promise<number> {
    if (userId) {
      return await offlineDb.syncQueue.where('userId').equals(userId).count();
    }
    return await offlineDb.syncQueue.count();
  }

  /**
   * Get all sync queue items for a user
   */
  async getSyncQueueItems(userId: number): Promise<SyncQueueItem[]> {
    return await offlineDb.syncQueue.where('userId').equals(userId).sortBy('timestamp');
  }

  /**
   * Clear all sync queue items for a user
   */
  async clearSyncQueue(userId: number): Promise<void> {
    await offlineDb.syncQueue.where('userId').equals(userId).delete();
  }
}

// Export singleton instance
export const offlineDataService = new OfflineDataService();
