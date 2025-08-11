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
    if (!userId) {
      throw new Error('userId is required for sync queue operations');
    }

    const syncItem: SyncQueueItem = {
      tableName,
      operation,
      recordId,
      data,
      timestamp: new Date(),
      userId,
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
    const products = await offlineDb.products.where('userId').equals(userId).toArray();

    return products;
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
    // Generate a temporary negative ID for offline records
    // Use a more deterministic approach to prevent hydration issues
    const tempId = -(Date.now() + Math.floor(Math.random() * 1000));

    // Create consumption object without the product field for IndexedDB storage
    const consumptionForStorage = {
      ...consumptionData,
      id: tempId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Type assertion to match IndexedDB schema (which doesn't include the product field)
    const id = await offlineDb.consumptions.add(consumptionForStorage as unknown as Consumption);
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

    // Return the consumption with a minimal product object for compatibility
    const consumptionWithProduct = {
      ...consumption,
      product: {
        id: consumptionData.productId,
        name: 'Unknown Product',
        calories: 0,
        protein: 0,
        fat: 0,
        carbs: 0,
        userId: consumptionData.userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Product,
    } as Consumption;

    return consumptionWithProduct;
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

  // === SERVER DATA CACHING OPERATIONS ===

  /**
   * Cache server products to IndexedDB (without adding to sync queue)
   */
  async cacheServerProducts(products: Product[]): Promise<void> {
    for (const product of products) {
      await offlineDb.products.put(product);
    }
  }

  /**
   * Cache server consumptions to IndexedDB (without adding to sync queue)
   */
  async cacheServerConsumptions(consumptions: Consumption[]): Promise<void> {
    for (const consumption of consumptions) {
      await offlineDb.consumptions.put(consumption);
    }
  }

  /**
   * Cache server nutrition goals to IndexedDB (without adding to sync queue)
   */
  async cacheServerNutritionGoals(goals: NutritionGoals): Promise<void> {
    await offlineDb.nutritionGoals.put(goals);
  }

  /**
   * Get offline changes (items with pending sync operations)
   */
  async getOfflineChanges(
    tableName: string,
    userId: number,
  ): Promise<
    Array<{ id: number; _deleted?: boolean; _modified?: boolean; [key: string]: unknown }>
  > {
    const syncItems = await this.getSyncQueueItems(userId);
    const tableChanges = syncItems.filter((item) => item.tableName === tableName);

    const changes: Array<{
      id: number;
      _deleted?: boolean;
      _modified?: boolean;
      [key: string]: unknown;
    }> = [];
    for (const syncItem of tableChanges) {
      if (syncItem.operation === 'delete') {
        // For deletions, we need to track the ID to exclude from results
        changes.push({ id: syncItem.recordId, _deleted: true });
      } else if (syncItem.data) {
        // For create/update, use the data from sync queue
        changes.push({ ...(syncItem.data as Record<string, unknown>), _modified: true } as {
          id: number;
          _deleted?: boolean;
          _modified?: boolean;
          [key: string]: unknown;
        });
      }
    }

    return changes;
  }

  /**
   * Get products with offline changes merged
   */
  async getProductsWithOfflineChanges(userId: number): Promise<Product[]> {
    const serverProducts = await this.getProducts(userId);
    const offlineChanges = await this.getOfflineChanges('products', userId);

    // Create a map of offline changes
    const changesMap = new Map();
    const deletedIds = new Set();

    for (const change of offlineChanges) {
      if (change._deleted) {
        deletedIds.add(change.id);
      } else {
        changesMap.set(change.id, change);
      }
    }

    // Merge server data with offline changes
    const mergedProducts = serverProducts
      .filter((product) => !deletedIds.has(product.id)) // Remove deleted items
      .map((product) => changesMap.get(product.id) || product); // Apply offline changes

    // Add new products from offline changes
    for (const change of offlineChanges) {
      if (!change._deleted && !serverProducts.find((p) => p.id === change.id)) {
        mergedProducts.push(change);
      }
    }

    return mergedProducts;
  }

  /**
   * Get consumptions with offline changes merged
   */
  async getConsumptionsWithOfflineChanges(
    userId: number,
    startDate?: Date,
    endDate?: Date,
  ): Promise<Consumption[]> {
    const serverConsumptions = await this.getConsumptions(userId, startDate, endDate);
    const offlineChanges = await this.getOfflineChanges('consumptions', userId);

    // Create a map of offline changes
    const changesMap = new Map();
    const deletedIds = new Set();

    for (const change of offlineChanges) {
      if (change._deleted) {
        deletedIds.add(change.id);
      } else {
        changesMap.set(change.id, change);
      }
    }

    // Merge server data with offline changes
    const mergedConsumptions = serverConsumptions
      .filter((consumption) => !deletedIds.has(consumption.id)) // Remove deleted items
      .map((consumption) => changesMap.get(consumption.id) || consumption); // Apply offline changes

    // Add new consumptions from offline changes
    for (const change of offlineChanges) {
      if (!change._deleted && !serverConsumptions.find((c) => c.id === change.id)) {
        mergedConsumptions.push(change);
      }
    }

    return mergedConsumptions;
  }

  /**
   * Get nutrition goals with offline changes merged
   */
  async getNutritionGoalsWithOfflineChanges(userId: number): Promise<NutritionGoals | undefined> {
    const serverGoals = await this.getNutritionGoals(userId);
    const offlineChanges = await this.getOfflineChanges('nutritionGoals', userId);

    if (offlineChanges.length > 0) {
      // Return the most recent offline change
      return offlineChanges[offlineChanges.length - 1] as unknown as NutritionGoals;
    }

    return serverGoals;
  }
}

// Export singleton instance
export const offlineDataService = new OfflineDataService();
