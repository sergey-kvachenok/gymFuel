import { unifiedOfflineDb } from './unified-offline-db';
import { Product, Consumption, NutritionGoals } from '../types/api';

export interface SyncableItem {
  _synced: boolean;
  _syncTimestamp: Date | null;
  _syncError: string | null;
  _lastModified: Date;
  _version: number;
}

export interface UnifiedProduct extends Product, SyncableItem {}
export interface UnifiedConsumption extends Consumption, SyncableItem {}
export interface UnifiedNutritionGoals extends NutritionGoals, SyncableItem {}

/**
 * Unified data service that handles all CRUD operations
 * with IndexedDB as the primary data store
 */
export class UnifiedDataService {
  private static instance: UnifiedDataService | null = null;

  static getInstance(): UnifiedDataService {
    if (!UnifiedDataService.instance) {
      UnifiedDataService.instance = new UnifiedDataService();
    }
    return UnifiedDataService.instance;
  }
  /**
   * Create a new product
   */
  async createProduct(
    productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<UnifiedProduct> {
    const now = new Date();
    const unifiedProduct: Omit<UnifiedProduct, 'id'> = {
      ...productData,
      createdAt: now,
      updatedAt: now,
      _synced: false,
      _syncTimestamp: null,
      _syncError: null,
      _lastModified: now,
      _version: 1,
    };

    const id = await unifiedOfflineDb.products.add(unifiedProduct as UnifiedProduct);
    const product = await unifiedOfflineDb.products.get(id);

    if (!product) {
      throw new Error('Failed to create product');
    }

    return product;
  }

  /**
   * Get all products for a user
   */
  async getProducts(userId: number): Promise<UnifiedProduct[]> {
    return await unifiedOfflineDb.products.where('userId').equals(userId).toArray();
  }

  /**
   * Get products with lazy loading support
   */
  async getProductsLazy(
    userId: number,
    options: {
      page: number;
      pageSize: number;
      search?: string;
      orderBy?: 'name' | 'createdAt' | 'updatedAt';
      orderDirection?: 'asc' | 'desc';
    },
  ): Promise<{
    products: UnifiedProduct[];
    total: number;
    hasMore: boolean;
    page: number;
    pageSize: number;
  }> {
    const { page, pageSize, search, orderDirection = 'asc' } = options;
    const offset = page * pageSize;

    // Get total count
    let totalQuery = unifiedOfflineDb.products.where('userId').equals(userId);
    if (search) {
      totalQuery = totalQuery.filter((product) =>
        product.name.toLowerCase().includes(search.toLowerCase()),
      );
    }
    const total = await totalQuery.count();

    // Get paginated results
    const products = await unifiedOfflineDb.getProductsByUser(userId.toString(), {
      limit: pageSize,
      offset,
      search,
      orderDirection,
    });

    return {
      products,
      total,
      hasMore: offset + pageSize < total,
      page,
      pageSize,
    };
  }

  /**
   * Get a product by ID
   */
  async getProduct(id: number): Promise<UnifiedProduct | undefined> {
    return await unifiedOfflineDb.products.get(id);
  }

  /**
   * Update a product
   */
  async updateProduct(id: number, updates: Partial<Product>): Promise<UnifiedProduct | undefined> {
    const existingProduct = await unifiedOfflineDb.products.get(id);
    if (!existingProduct) {
      throw new Error(`Product with id ${id} not found`);
    }

    const now = new Date();
    const updateData: Partial<UnifiedProduct> = {
      ...updates,
      updatedAt: now,
      _synced: false,
      _syncTimestamp: null,
      _syncError: null,
      _lastModified: now,
      _version: existingProduct._version + 1,
    };

    await unifiedOfflineDb.products.update(id, updateData);
    return await unifiedOfflineDb.products.get(id);
  }

  /**
   * Delete a product
   */
  async deleteProduct(id: number): Promise<void> {
    const product = await unifiedOfflineDb.products.get(id);
    if (!product) {
      throw new Error(`Product with id ${id} not found`);
    }

    await unifiedOfflineDb.products.delete(id);
  }

  /**
   * Create a new consumption record
   */
  async createConsumption(
    consumptionData: Omit<Consumption, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<UnifiedConsumption> {
    const now = new Date();
    const unifiedConsumption: Omit<UnifiedConsumption, 'id'> = {
      ...consumptionData,
      createdAt: now,
      updatedAt: now,
      _synced: false,
      _syncTimestamp: null,
      _syncError: null,
      _lastModified: now,
      _version: 1,
    };

    const id = await unifiedOfflineDb.consumptions.add(unifiedConsumption as UnifiedConsumption);
    const consumption = await unifiedOfflineDb.consumptions.get(id);

    if (!consumption) {
      throw new Error('Failed to create consumption');
    }

    return consumption;
  }

  /**
   * Get consumptions by date range for a user
   */
  async getConsumptionsByDateRange(
    userId: number,
    startDate: Date,
    endDate: Date,
  ): Promise<UnifiedConsumption[]> {
    return await unifiedOfflineDb.consumptions
      .where('userId')
      .equals(userId)
      .filter((consumption) => {
        const consumptionDate = new Date(consumption.date);
        return consumptionDate >= startDate && consumptionDate <= endDate;
      })
      .toArray();
  }

  /**
   * Get consumptions for a specific date
   */
  async getConsumptionsByDate(userId: number, date: Date): Promise<UnifiedConsumption[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await this.getConsumptionsByDateRange(userId, startOfDay, endOfDay);
  }

  /**
   * Update a consumption record
   */
  async updateConsumption(
    id: number,
    updates: Partial<Consumption>,
  ): Promise<UnifiedConsumption | undefined> {
    const existingConsumption = await unifiedOfflineDb.consumptions.get(id);
    if (!existingConsumption) {
      throw new Error(`Consumption with id ${id} not found`);
    }

    const now = new Date();
    const updateData: Partial<UnifiedConsumption> = {
      ...updates,
      updatedAt: now,
      _synced: false,
      _syncTimestamp: null,
      _syncError: null,
      _lastModified: now,
      _version: existingConsumption._version + 1,
    };

    await unifiedOfflineDb.consumptions.update(id, updateData);
    return await unifiedOfflineDb.consumptions.get(id);
  }

  /**
   * Delete a consumption record
   */
  async deleteConsumption(id: number): Promise<void> {
    const consumption = await unifiedOfflineDb.consumptions.get(id);
    if (!consumption) {
      throw new Error(`Consumption with id ${id} not found`);
    }

    await unifiedOfflineDb.consumptions.delete(id);
  }

  /**
   * Create nutrition goals for a user
   */
  async createNutritionGoals(
    goalsData: Omit<NutritionGoals, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<UnifiedNutritionGoals> {
    const now = new Date();
    const unifiedGoals: Omit<UnifiedNutritionGoals, 'id'> = {
      ...goalsData,
      createdAt: now,
      updatedAt: now,
      _synced: false,
      _syncTimestamp: null,
      _syncError: null,
      _lastModified: now,
      _version: 1,
    };

    const id = await unifiedOfflineDb.nutritionGoals.add(unifiedGoals as UnifiedNutritionGoals);
    const goals = await unifiedOfflineDb.nutritionGoals.get(id);

    if (!goals) {
      throw new Error('Failed to create nutrition goals');
    }

    return goals;
  }

  /**
   * Get nutrition goals for a user
   */
  async getNutritionGoals(userId: number): Promise<UnifiedNutritionGoals | undefined> {
    return await unifiedOfflineDb.nutritionGoals.where('userId').equals(userId).first();
  }

  /**
   * Update nutrition goals
   */
  async updateNutritionGoals(
    id: number,
    updates: Partial<NutritionGoals>,
  ): Promise<UnifiedNutritionGoals | undefined> {
    const existingGoals = await unifiedOfflineDb.nutritionGoals.get(id);
    if (!existingGoals) {
      throw new Error(`Nutrition goals with id ${id} not found`);
    }

    const now = new Date();
    const updateData: Partial<UnifiedNutritionGoals> = {
      ...updates,
      updatedAt: now,
      _synced: false,
      _syncTimestamp: null,
      _syncError: null,
      _lastModified: now,
      _version: existingGoals._version + 1,
    };

    await unifiedOfflineDb.nutritionGoals.update(id, updateData);
    return await unifiedOfflineDb.nutritionGoals.get(id);
  }

  /**
   * Delete nutrition goals
   */
  async deleteNutritionGoals(id: number): Promise<void> {
    const goals = await unifiedOfflineDb.nutritionGoals.get(id);
    if (!goals) {
      throw new Error(`Nutrition goals with id ${id} not found`);
    }

    await unifiedOfflineDb.nutritionGoals.delete(id);
  }

  // === SYNC STATUS MANAGEMENT ===

  /**
   * Mark an item as successfully synced
   */
  async markAsSynced(tableName: string, id: number): Promise<void> {
    const table = this.getTable(tableName);
    if (!table) {
      throw new Error(`Unknown table: ${tableName}`);
    }

    await table.update(id, {
      _synced: true,
      _syncTimestamp: new Date(),
      _syncError: null,
    });
  }

  /**
   * Mark an item as having a sync error
   */
  async markAsSyncError(tableName: string, id: number, error: Error): Promise<void> {
    const table = this.getTable(tableName);
    if (!table) {
      throw new Error(`Unknown table: ${tableName}`);
    }

    await table.update(id, {
      _synced: false,
      _syncError: error.message,
    });
  }

  /**
   * Get all unsynced items for a user
   */
  async getUnsyncedItems(tableName: string, userId: number): Promise<SyncableItem[]> {
    const table = this.getTable(tableName);
    if (!table) {
      throw new Error(`Unknown table: ${tableName}`);
    }

    return await table
      .where('userId')
      .equals(userId)
      .filter((item) => !item._synced)
      .toArray();
  }

  /**
   * Get all items with sync errors for a user
   */
  async getItemsWithSyncErrors(tableName: string, userId: number): Promise<SyncableItem[]> {
    const table = this.getTable(tableName);
    if (!table) {
      throw new Error(`Unknown table: ${tableName}`);
    }

    return await table
      .where('userId')
      .equals(userId)
      .filter((item) => item._syncError !== null)
      .toArray();
  }

  /**
   * Clear sync errors for an item
   */
  async clearSyncError(tableName: string, id: number): Promise<void> {
    const table = this.getTable(tableName);
    if (!table) {
      throw new Error(`Unknown table: ${tableName}`);
    }

    await table.update(id, {
      _syncError: null,
    });
  }

  // === CONFLICT RESOLUTION ===

  /**
   * Resolve conflicts using last write wins strategy
   */
  resolveConflict<T extends SyncableItem>(localItem: T, serverItem: T): T {
    if (localItem._lastModified > serverItem._lastModified) {
      return localItem;
    } else {
      return serverItem;
    }
  }

  // === BATCH OPERATIONS ===

  /**
   * Batch create multiple products
   */
  async batchCreateProducts(
    productsData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>[],
  ): Promise<UnifiedProduct[]> {
    const now = new Date();
    const unifiedProducts: Omit<UnifiedProduct, 'id'>[] = productsData.map((productData) => ({
      ...productData,
      createdAt: now,
      updatedAt: now,
      _synced: false,
      _syncTimestamp: null,
      _syncError: null,
      _lastModified: now,
      _version: 1,
    }));

    const ids = await unifiedOfflineDb.products.bulkAdd(unifiedProducts as UnifiedProduct[]);
    return await unifiedOfflineDb.products.bulkGet(ids);
  }

  /**
   * Batch update multiple products
   */
  async batchUpdateProducts(
    updates: Array<{ id: number; updates: Partial<Product> }>,
  ): Promise<UnifiedProduct[]> {
    const now = new Date();
    const updatePromises = updates.map(async ({ id, updates: updateData }) => {
      const existingProduct = await unifiedOfflineDb.products.get(id);
      if (!existingProduct) {
        throw new Error(`Product with id ${id} not found`);
      }

      const unifiedUpdates: Partial<UnifiedProduct> = {
        ...updateData,
        updatedAt: now,
        _synced: false,
        _syncTimestamp: null,
        _syncError: null,
        _lastModified: now,
        _version: existingProduct._version + 1,
      };

      await unifiedOfflineDb.products.update(id, unifiedUpdates);
      return await unifiedOfflineDb.products.get(id);
    });

    return await Promise.all(updatePromises);
  }

  /**
   * Batch create multiple consumptions
   */
  async batchCreateConsumptions(
    consumptionsData: Omit<Consumption, 'id' | 'createdAt' | 'updatedAt'>[],
  ): Promise<UnifiedConsumption[]> {
    const now = new Date();
    const unifiedConsumptions: Omit<UnifiedConsumption, 'id'>[] = consumptionsData.map(
      (consumptionData) => ({
        ...consumptionData,
        createdAt: now,
        updatedAt: now,
        _synced: false,
        _syncTimestamp: null,
        _syncError: null,
        _lastModified: now,
        _version: 1,
      }),
    );

    const ids = await unifiedOfflineDb.consumptions.bulkPut(unifiedConsumptions);
    return await unifiedOfflineDb.consumptions.bulkGet(ids);
  }

  /**
   * Get all unsynced items across all tables for a user
   */
  async getAllUnsyncedItems(userId: number): Promise<{
    products: UnifiedProduct[];
    consumptions: UnifiedConsumption[];
    nutritionGoals: UnifiedNutritionGoals[];
  }> {
    const [products, consumptions, nutritionGoals] = await Promise.all([
      this.getUnsyncedItems('products', userId) as Promise<UnifiedProduct[]>,
      this.getUnsyncedItems('consumptions', userId) as Promise<UnifiedConsumption[]>,
      this.getUnsyncedItems('nutritionGoals', userId) as Promise<UnifiedNutritionGoals[]>,
    ]);

    return { products, consumptions, nutritionGoals };
  }

  // === PRIVATE HELPER METHODS ===

  private getTable(tableName: string) {
    switch (tableName) {
      case 'products':
        return unifiedOfflineDb.products;
      case 'consumptions':
        return unifiedOfflineDb.consumptions;
      case 'nutritionGoals':
        return unifiedOfflineDb.nutritionGoals;
      default:
        return null;
    }
  }
}
