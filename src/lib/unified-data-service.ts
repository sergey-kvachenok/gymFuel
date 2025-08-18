import { unifiedOfflineDb } from './unified-offline-db';
import { Product, Consumption, NutritionGoals } from '../types/api';
import { logger } from './logger';
import { errorRecoveryManager } from './error-recovery';
import { errorFeedbackManager } from './error-feedback';

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
    const operationId = logger.startOperation('createProduct', 'products', productData.userId);
    const startTime = Date.now();

    try {
      logger.logDbOperation(
        'createProduct',
        'products',
        'Starting product creation',
        productData,
        productData.userId,
      );

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

      logger.debug(
        'DATABASE',
        'createProduct',
        'Adding product to database',
        unifiedProduct,
        productData.userId,
        'products',
      );

      const id = await errorRecoveryManager.executeWithRecovery(
        () => unifiedOfflineDb.products.add(unifiedProduct as UnifiedProduct),
        'database',
        {
          operation: 'createProduct',
          tableName: 'products',
          userId: productData.userId,
          data: unifiedProduct,
        },
      );

      logger.logDbOperation(
        'createProduct',
        'products',
        'Product added successfully',
        { id },
        productData.userId,
        id,
      );

      const product = await errorRecoveryManager.executeWithRecovery(
        () => unifiedOfflineDb.products.get(id),
        'database',
        {
          operation: 'createProduct',
          tableName: 'products',
          userId: productData.userId,
          recordId: id,
        },
      );

      if (!product) {
        const error = new Error('Failed to create product');
        logger.logErrorOperation(
          'createProduct',
          'Failed to retrieve created product',
          error,
          { id },
          productData.userId,
          'products',
          id,
        );
        throw error;
      }

      const duration = Date.now() - startTime;
      logger.endOperation(
        operationId,
        'createProduct',
        duration,
        'products',
        productData.userId,
        1,
      );
      logger.logDbOperation(
        'createProduct',
        'products',
        'Product created successfully',
        { id, product },
        productData.userId,
        id,
        duration,
      );

      // Add success feedback
      errorFeedbackManager.addSuccessFeedback(
        'Product Created',
        `Successfully created "${product.name}"`,
        {
          autoDismiss: 3000,
        },
      );

      return product;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.endOperation(operationId, 'createProduct', duration, 'products', productData.userId);
      logger.logErrorOperation(
        'createProduct',
        'Product creation failed',
        error as Error,
        productData,
        productData.userId,
        'products',
      );

      // Add user feedback for the error
      errorFeedbackManager.addErrorFeedback(
        {
          operation: 'createProduct',
          tableName: 'products',
          userId: productData.userId,
          data: productData,
          error: error as Error,
        },
        {
          autoDismiss: 8000, // Auto-dismiss after 8 seconds
          action: {
            label: 'Try Again',
            onClick: () => {
              // This would typically trigger a retry mechanism
              console.log('Retry createProduct operation');
            },
          },
        },
      );

      throw error;
    }
  }

  /**
   * Get all products for a user
   */
  async getProducts(userId: number): Promise<UnifiedProduct[]> {
    const operationId = logger.startOperation('getProducts', 'products', userId);
    const startTime = Date.now();

    try {
      logger.logDbOperation(
        'getProducts',
        'products',
        'Starting products retrieval',
        { userId },
        userId,
      );

      const products = await errorRecoveryManager.executeWithRecovery(
        () => unifiedOfflineDb.products.where('userId').equals(userId).toArray(),
        'database',
        {
          operation: 'getProducts',
          tableName: 'products',
          userId,
        },
      );

      const duration = Date.now() - startTime;
      logger.endOperation(
        operationId,
        'getProducts',
        duration,
        'products',
        userId,
        products.length,
      );
      logger.logDbOperation(
        'getProducts',
        'products',
        'Products retrieved successfully',
        { count: products.length },
        userId,
        undefined,
        duration,
      );

      return products;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.endOperation(operationId, 'getProducts', duration, 'products', userId);
      logger.logErrorOperation(
        'getProducts',
        'Products retrieval failed',
        error as Error,
        { userId },
        userId,
        'products',
      );
      throw error;
    }
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
    const operationId = logger.startOperation('updateProduct', 'products');
    const startTime = Date.now();

    try {
      logger.logDbOperation(
        'updateProduct',
        'products',
        'Starting product update',
        { id, updates },
        undefined,
        id,
      );

      const existingProduct = await errorRecoveryManager.executeWithRecovery(
        () => unifiedOfflineDb.products.get(id),
        'database',
        {
          operation: 'updateProduct',
          tableName: 'products',
          recordId: id,
        },
      );
      if (!existingProduct) {
        const error = new Error(`Product with id ${id} not found`);
        logger.logErrorOperation(
          'updateProduct',
          'Product not found for update',
          error,
          { id },
          undefined,
          'products',
          id,
        );
        throw error;
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

      logger.debug(
        'DATABASE',
        'updateProduct',
        'Updating product in database',
        updateData,
        existingProduct.userId,
        'products',
        id,
      );

      await errorRecoveryManager.executeWithRecovery(
        () => unifiedOfflineDb.products.update(id, updateData),
        'database',
        {
          operation: 'updateProduct',
          tableName: 'products',
          userId: existingProduct.userId,
          recordId: id,
          data: updateData,
        },
      );

      logger.logDbOperation(
        'updateProduct',
        'products',
        'Product updated successfully',
        { id },
        existingProduct.userId,
        id,
      );

      const updatedProduct = await errorRecoveryManager.executeWithRecovery(
        () => unifiedOfflineDb.products.get(id),
        'database',
        {
          operation: 'updateProduct',
          tableName: 'products',
          userId: existingProduct.userId,
          recordId: id,
        },
      );

      const duration = Date.now() - startTime;
      logger.endOperation(
        operationId,
        'updateProduct',
        duration,
        'products',
        existingProduct.userId,
        1,
      );
      logger.logDbOperation(
        'updateProduct',
        'products',
        'Product update completed',
        { id, updatedProduct },
        existingProduct.userId,
        id,
        duration,
      );

      // Add success feedback
      errorFeedbackManager.addSuccessFeedback(
        'Product Updated',
        `Successfully updated "${updatedProduct?.name || 'product'}"`,
        {
          autoDismiss: 3000,
        },
      );

      return updatedProduct;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.endOperation(operationId, 'updateProduct', duration, 'products');
      logger.logErrorOperation(
        'updateProduct',
        'Product update failed',
        error as Error,
        { id, updates },
        undefined,
        'products',
        id,
      );

      // Add user feedback for the error
      errorFeedbackManager.addErrorFeedback(
        {
          operation: 'updateProduct',
          tableName: 'products',
          recordId: id,
          data: { id, updates },
          error: error as Error,
        },
        {
          autoDismiss: 8000,
          action: {
            label: 'Try Again',
            onClick: () => {
              console.log('Retry updateProduct operation');
            },
          },
        },
      );

      throw error;
    }
  }

  /**
   * Delete a product
   */
  async deleteProduct(id: number): Promise<void> {
    const operationId = logger.startOperation('deleteProduct', 'products');
    const startTime = Date.now();

    try {
      logger.logDbOperation(
        'deleteProduct',
        'products',
        'Starting product deletion',
        { id },
        undefined,
        id,
      );

      const product = await errorRecoveryManager.executeWithRecovery(
        () => unifiedOfflineDb.products.get(id),
        'database',
        {
          operation: 'deleteProduct',
          tableName: 'products',
          recordId: id,
        },
      );
      if (!product) {
        const error = new Error(`Product with id ${id} not found`);
        logger.logErrorOperation(
          'deleteProduct',
          'Product not found for deletion',
          error,
          { id },
          undefined,
          'products',
          id,
        );
        throw error;
      }

      logger.debug(
        'DATABASE',
        'deleteProduct',
        'Deleting product from database',
        { id },
        product.userId,
        'products',
        id,
      );

      await errorRecoveryManager.executeWithRecovery(
        () => unifiedOfflineDb.products.delete(id),
        'database',
        {
          operation: 'deleteProduct',
          tableName: 'products',
          userId: product.userId,
          recordId: id,
        },
      );

      const duration = Date.now() - startTime;
      logger.endOperation(operationId, 'deleteProduct', duration, 'products', product.userId, 1);
      logger.logDbOperation(
        'deleteProduct',
        'products',
        'Product deleted successfully',
        { id },
        product.userId,
        id,
        duration,
      );

      // Add success feedback
      errorFeedbackManager.addSuccessFeedback(
        'Product Deleted',
        `Successfully deleted "${product.name}"`,
        {
          autoDismiss: 3000,
        },
      );
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.endOperation(operationId, 'deleteProduct', duration, 'products');
      logger.logErrorOperation(
        'deleteProduct',
        'Product deletion failed',
        error as Error,
        { id },
        undefined,
        'products',
        id,
      );

      // Add user feedback for the error
      errorFeedbackManager.addErrorFeedback(
        {
          operation: 'deleteProduct',
          tableName: 'products',
          recordId: id,
          data: { id },
          error: error as Error,
        },
        {
          autoDismiss: 8000,
          action: {
            label: 'Try Again',
            onClick: () => {
              console.log('Retry deleteProduct operation');
            },
          },
        },
      );

      throw error;
    }
  }

  /**
   * Create a new consumption record
   */
  async createConsumption(
    consumptionData: Omit<Consumption, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<UnifiedConsumption> {
    const operationId = logger.startOperation(
      'createConsumption',
      'consumptions',
      consumptionData.userId,
    );
    const startTime = Date.now();

    try {
      logger.logDbOperation(
        'createConsumption',
        'consumptions',
        'Starting consumption creation',
        consumptionData,
        consumptionData.userId,
      );

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

      logger.debug(
        'DATABASE',
        'createConsumption',
        'Adding consumption to database',
        unifiedConsumption,
        consumptionData.userId,
        'consumptions',
      );

      const id = await errorRecoveryManager.executeWithRecovery(
        () => unifiedOfflineDb.consumptions.add(unifiedConsumption as UnifiedConsumption),
        'database',
        {
          operation: 'createConsumption',
          tableName: 'consumptions',
          userId: consumptionData.userId,
          data: unifiedConsumption,
        },
      );

      logger.logDbOperation(
        'createConsumption',
        'consumptions',
        'Consumption added successfully',
        { id },
        consumptionData.userId,
        id,
      );

      const consumption = await errorRecoveryManager.executeWithRecovery(
        () => unifiedOfflineDb.consumptions.get(id),
        'database',
        {
          operation: 'createConsumption',
          tableName: 'consumptions',
          userId: consumptionData.userId,
          recordId: id,
        },
      );

      if (!consumption) {
        const error = new Error('Failed to create consumption');
        logger.logErrorOperation(
          'createConsumption',
          'Failed to retrieve created consumption',
          error,
          { id },
          consumptionData.userId,
          'consumptions',
          id,
        );
        throw error;
      }

      const duration = Date.now() - startTime;
      logger.endOperation(
        operationId,
        'createConsumption',
        duration,
        'consumptions',
        consumptionData.userId,
        1,
      );
      logger.logDbOperation(
        'createConsumption',
        'consumptions',
        'Consumption created successfully',
        { id, consumption },
        consumptionData.userId,
        id,
        duration,
      );

      // Add success feedback
      errorFeedbackManager.addSuccessFeedback(
        'Consumption Added',
        `Successfully added consumption for ${consumptionData.amount} servings`,
        {
          autoDismiss: 3000,
        },
      );

      return consumption;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.endOperation(
        operationId,
        'createConsumption',
        duration,
        'consumptions',
        consumptionData.userId,
      );
      logger.logErrorOperation(
        'createConsumption',
        'Consumption creation failed',
        error as Error,
        consumptionData,
        consumptionData.userId,
        'consumptions',
      );

      // Add user feedback for the error
      errorFeedbackManager.addErrorFeedback(
        {
          operation: 'createConsumption',
          tableName: 'consumptions',
          userId: consumptionData.userId,
          data: consumptionData,
          error: error as Error,
        },
        {
          autoDismiss: 8000,
          action: {
            label: 'Try Again',
            onClick: () => {
              console.log('Retry createConsumption operation');
            },
          },
        },
      );

      throw error;
    }
  }

  /**
   * Get consumptions by date range for a user
   */
  async getConsumptionsByDateRange(
    userId: number,
    startDate: Date,
    endDate: Date,
  ): Promise<UnifiedConsumption[]> {
    console.log('🔍 getConsumptionsByDateRange called with:', {
      userId,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });

    const allConsumptions = await unifiedOfflineDb.consumptions
      .where('userId')
      .equals(userId)
      .toArray();

    console.log('📊 All consumptions for user:', allConsumptions.length);

    const filteredConsumptions = allConsumptions.filter((consumption) => {
      const consumptionDate = new Date(consumption.date);
      const isInRange = consumptionDate >= startDate && consumptionDate <= endDate;

      console.log('📅 Consumption date check:', {
        consumptionId: consumption.id,
        consumptionDate: consumptionDate.toISOString(),
        isInRange,
      });

      return isInRange;
    });

    console.log('✅ Filtered consumptions:', filteredConsumptions.length);
    return filteredConsumptions;
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
    const operationId = logger.startOperation('markAsSynced', tableName);
    const startTime = Date.now();

    try {
      logger.logSyncOperation(
        'markAsSynced',
        'Starting sync mark operation',
        { tableName, id },
        undefined,
        tableName,
        id,
      );

      const table = this.getTable(tableName);
      if (!table) {
        const error = new Error(`Unknown table: ${tableName}`);
        logger.logErrorOperation(
          'markAsSynced',
          'Unknown table for sync mark',
          error,
          { tableName, id },
          undefined,
          tableName,
          id,
        );
        throw error;
      }

      logger.debug(
        'SYNC',
        'markAsSynced',
        'Marking item as synced',
        { tableName, id },
        undefined,
        tableName,
        id,
      );

      if (tableName === 'products') {
        await errorRecoveryManager.executeWithRecovery(
          () =>
            (table as typeof unifiedOfflineDb.products).update(id, {
              _synced: true,
              _syncTimestamp: new Date(),
              _syncError: null,
            }),
          'sync',
          {
            operation: 'markAsSynced',
            tableName,
            recordId: id,
          },
        );
      } else if (tableName === 'consumptions') {
        await errorRecoveryManager.executeWithRecovery(
          () =>
            (table as typeof unifiedOfflineDb.consumptions).update(id, {
              _synced: true,
              _syncTimestamp: new Date(),
              _syncError: null,
            }),
          'sync',
          {
            operation: 'markAsSynced',
            tableName,
            recordId: id,
          },
        );
      } else if (tableName === 'nutritionGoals') {
        await errorRecoveryManager.executeWithRecovery(
          () =>
            (table as typeof unifiedOfflineDb.nutritionGoals).update(id, {
              _synced: true,
              _syncTimestamp: new Date(),
              _syncError: null,
            }),
          'sync',
          {
            operation: 'markAsSynced',
            tableName,
            recordId: id,
          },
        );
      }

      const duration = Date.now() - startTime;
      logger.endOperation(operationId, 'markAsSynced', duration, tableName);
      logger.logSyncOperation(
        'markAsSynced',
        'Item marked as synced successfully',
        { tableName, id, duration },
        undefined,
        tableName,
        id,
      );
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.endOperation(operationId, 'markAsSynced', duration, tableName);
      logger.logErrorOperation(
        'markAsSynced',
        'Failed to mark item as synced',
        error as Error,
        { tableName, id },
        undefined,
        tableName,
        id,
      );
      throw error;
    }
  }

  /**
   * Mark an item as having a sync error
   */
  async markAsSyncError(tableName: string, id: number, error: Error): Promise<void> {
    const operationId = logger.startOperation('markAsSyncError', tableName);
    const startTime = Date.now();

    try {
      logger.logSyncOperation(
        'markAsSyncError',
        'Starting sync error mark operation',
        { tableName, id, error: error.message },
        undefined,
        tableName,
        id,
      );

      const table = this.getTable(tableName);
      if (!table) {
        const tableError = new Error(`Unknown table: ${tableName}`);
        logger.logErrorOperation(
          'markAsSyncError',
          'Unknown table for sync error mark',
          tableError,
          { tableName, id },
          undefined,
          tableName,
          id,
        );
        throw tableError;
      }

      logger.debug(
        'SYNC',
        'markAsSyncError',
        'Marking item as sync error',
        { tableName, id, error: error.message },
        undefined,
        tableName,
        id,
      );

      if (tableName === 'products') {
        await errorRecoveryManager.executeWithRecovery(
          () =>
            (table as typeof unifiedOfflineDb.products).update(id, {
              _synced: false,
              _syncError: error.message,
            }),
          'sync',
          {
            operation: 'markAsSyncError',
            tableName,
            recordId: id,
            data: { error: error.message },
          },
        );
      } else if (tableName === 'consumptions') {
        await errorRecoveryManager.executeWithRecovery(
          () =>
            (table as typeof unifiedOfflineDb.consumptions).update(id, {
              _synced: false,
              _syncError: error.message,
            }),
          'sync',
          {
            operation: 'markAsSyncError',
            tableName,
            recordId: id,
            data: { error: error.message },
          },
        );
      } else if (tableName === 'nutritionGoals') {
        await errorRecoveryManager.executeWithRecovery(
          () =>
            (table as typeof unifiedOfflineDb.nutritionGoals).update(id, {
              _synced: false,
              _syncError: error.message,
            }),
          'sync',
          {
            operation: 'markAsSyncError',
            tableName,
            recordId: id,
            data: { error: error.message },
          },
        );
      }

      const duration = Date.now() - startTime;
      logger.endOperation(operationId, 'markAsSyncError', duration, tableName);
      logger.logSyncOperation(
        'markAsSyncError',
        'Item marked as sync error successfully',
        { tableName, id, error: error.message },
        undefined,
        tableName,
        id,
      );
    } catch (tableError) {
      const duration = Date.now() - startTime;
      logger.endOperation(operationId, 'markAsSyncError', duration, tableName);
      logger.logErrorOperation(
        'markAsSyncError',
        'Failed to mark item as sync error',
        tableError as Error,
        { tableName, id, originalError: error.message },
        undefined,
        tableName,
        id,
      );
      throw tableError;
    }
  }

  /**
   * Get all unsynced items for a user
   */
  async getUnsyncedItems(tableName: string, userId: number): Promise<SyncableItem[]> {
    if (tableName === 'products') {
      return await unifiedOfflineDb.products
        .where('userId')
        .equals(userId)
        .filter((item: UnifiedProduct) => !item._synced)
        .toArray();
    } else if (tableName === 'consumptions') {
      return await unifiedOfflineDb.consumptions
        .where('userId')
        .equals(userId)
        .filter((item: UnifiedConsumption) => !item._synced)
        .toArray();
    } else if (tableName === 'nutritionGoals') {
      return await unifiedOfflineDb.nutritionGoals
        .where('userId')
        .equals(userId)
        .filter((item: UnifiedNutritionGoals) => !item._synced)
        .toArray();
    }
    throw new Error(`Unknown table: ${tableName}`);
  }

  /**
   * Validate data integrity for a product
   */
  private validateProductIntegrity(product: UnifiedProduct): boolean {
    return (
      !!product.name &&
      product.name.trim().length > 0 &&
      product.calories >= 0 &&
      product.protein >= 0 &&
      product.carbs >= 0 &&
      product.fat >= 0 &&
      product.userId > 0 &&
      product._version > 0
    );
  }

  /**
   * Repair product data integrity
   */
  private repairProductIntegrity(product: UnifiedProduct): UnifiedProduct {
    const repaired = { ...product };

    // Fix missing or invalid name
    if (!repaired.name || repaired.name.trim().length === 0) {
      repaired.name = 'Unknown Product';
    }

    // Fix negative values
    repaired.calories = Math.max(0, repaired.calories || 0);
    repaired.protein = Math.max(0, repaired.protein || 0);
    repaired.carbs = Math.max(0, repaired.carbs || 0);
    repaired.fat = Math.max(0, repaired.fat || 0);

    // Fix invalid userId
    if (!repaired.userId || repaired.userId <= 0) {
      repaired.userId = 1; // Default user ID
    }

    // Fix invalid version
    if (!repaired._version || repaired._version <= 0) {
      repaired._version = 1;
    }

    // Ensure timestamps exist
    if (!repaired.createdAt) {
      repaired.createdAt = new Date();
    }
    if (!repaired.updatedAt) {
      repaired.updatedAt = new Date();
    }
    if (!repaired._lastModified) {
      repaired._lastModified = new Date();
    }

    return repaired;
  }

  /**
   * Validate data integrity for a consumption record
   */
  private validateConsumptionIntegrity(consumption: UnifiedConsumption): boolean {
    return (
      consumption.productId > 0 &&
      consumption.amount > 0 &&
      consumption.userId > 0 &&
      consumption._version > 0 &&
      consumption.date instanceof Date &&
      !isNaN(consumption.date.getTime())
    );
  }

  /**
   * Repair consumption data integrity
   */
  private repairConsumptionIntegrity(consumption: UnifiedConsumption): UnifiedConsumption {
    const repaired = { ...consumption };

    // Fix invalid productId
    if (!repaired.productId || repaired.productId <= 0) {
      repaired.productId = 1; // Default product ID
    }

    // Fix invalid amount
    if (!repaired.amount || repaired.amount <= 0) {
      repaired.amount = 1;
    }

    // Fix invalid userId
    if (!repaired.userId || repaired.userId <= 0) {
      repaired.userId = 1; // Default user ID
    }

    // Fix invalid version
    if (!repaired._version || repaired._version <= 0) {
      repaired._version = 1;
    }

    // Fix invalid date
    if (!repaired.date || !(repaired.date instanceof Date) || isNaN(repaired.date.getTime())) {
      repaired.date = new Date();
    }

    // Ensure timestamps exist
    if (!repaired.createdAt) {
      repaired.createdAt = new Date();
    }
    if (!repaired.updatedAt) {
      repaired.updatedAt = new Date();
    }
    if (!repaired._lastModified) {
      repaired._lastModified = new Date();
    }

    return repaired;
  }

  /**
   * Validate and repair data integrity for all records
   */
  async validateAndRepairDataIntegrity(): Promise<{
    products: { validated: number; repaired: number; errors: number };
    consumptions: { validated: number; repaired: number; errors: number };
  }> {
    const stats = {
      products: { validated: 0, repaired: 0, errors: 0 },
      consumptions: { validated: 0, repaired: 0, errors: 0 },
    };

    try {
      // Validate and repair products
      const allProducts = await unifiedOfflineDb.products.toArray();
      for (const product of allProducts) {
        stats.products.validated++;

        if (!this.validateProductIntegrity(product)) {
          try {
            const repairedProduct = this.repairProductIntegrity(product);
            await errorRecoveryManager.executeWithRecovery(
              () => unifiedOfflineDb.products.update(product.id, repairedProduct),
              'database',
              {
                operation: 'repairProductIntegrity',
                tableName: 'products',
                userId: product.userId,
                recordId: product.id,
                data: repairedProduct,
              },
            );
            stats.products.repaired++;

            logger.info(
              'RECOVERY',
              'validateAndRepairDataIntegrity',
              'Product data integrity repaired',
              { productId: product.id, userId: product.userId },
            );
          } catch (error) {
            stats.products.errors++;
            logger.error(
              'RECOVERY',
              'validateAndRepairDataIntegrity',
              'Failed to repair product data integrity',
              error as Error,
              { productId: product.id, userId: product.userId },
            );
          }
        }
      }

      // Validate and repair consumptions
      const allConsumptions = await unifiedOfflineDb.consumptions.toArray();
      for (const consumption of allConsumptions) {
        stats.consumptions.validated++;

        if (!this.validateConsumptionIntegrity(consumption)) {
          try {
            const repairedConsumption = this.repairConsumptionIntegrity(consumption);
            await errorRecoveryManager.executeWithRecovery(
              () => unifiedOfflineDb.consumptions.update(consumption.id, repairedConsumption),
              'database',
              {
                operation: 'repairConsumptionIntegrity',
                tableName: 'consumptions',
                userId: consumption.userId,
                recordId: consumption.id,
                data: repairedConsumption,
              },
            );
            stats.consumptions.repaired++;

            logger.info(
              'RECOVERY',
              'validateAndRepairDataIntegrity',
              'Consumption data integrity repaired',
              { consumptionId: consumption.id, userId: consumption.userId },
            );
          } catch (error) {
            stats.consumptions.errors++;
            logger.error(
              'RECOVERY',
              'validateAndRepairDataIntegrity',
              'Failed to repair consumption data integrity',
              error as Error,
              { consumptionId: consumption.id, userId: consumption.userId },
            );
          }
        }
      }

      logger.info(
        'RECOVERY',
        'validateAndRepairDataIntegrity',
        'Data integrity validation and repair completed',
        stats,
      );

      return stats;
    } catch (error) {
      logger.error(
        'RECOVERY',
        'validateAndRepairDataIntegrity',
        'Data integrity validation and repair failed',
        error as Error,
      );
      throw error;
    }
  }

  /**
   * Get all items with sync errors for a user
   */
  async getItemsWithSyncErrors(tableName: string, userId: number): Promise<SyncableItem[]> {
    if (tableName === 'products') {
      return await unifiedOfflineDb.products
        .where('userId')
        .equals(userId)
        .filter((item: UnifiedProduct) => item._syncError !== null)
        .toArray();
    } else if (tableName === 'consumptions') {
      return await unifiedOfflineDb.consumptions
        .where('userId')
        .equals(userId)
        .filter((item: UnifiedConsumption) => item._syncError !== null)
        .toArray();
    } else if (tableName === 'nutritionGoals') {
      return await unifiedOfflineDb.nutritionGoals
        .where('userId')
        .equals(userId)
        .filter((item: UnifiedNutritionGoals) => item._syncError !== null)
        .toArray();
    }
    throw new Error(`Unknown table: ${tableName}`);
  }

  /**
   * Clear sync errors for an item
   */
  async clearSyncError(tableName: string, id: number): Promise<void> {
    const table = this.getTable(tableName);
    if (!table) {
      throw new Error(`Unknown table: ${tableName}`);
    }

    if (tableName === 'products') {
      await (table as typeof unifiedOfflineDb.products).update(id, {
        _syncError: null,
      });
    } else if (tableName === 'consumptions') {
      await (table as typeof unifiedOfflineDb.consumptions).update(id, {
        _syncError: null,
      });
    } else if (tableName === 'nutritionGoals') {
      await (table as typeof unifiedOfflineDb.nutritionGoals).update(id, {
        _syncError: null,
      });
    }
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
    const results = await unifiedOfflineDb.products.bulkGet(ids);
    return results.filter((item): item is UnifiedProduct => item !== undefined);
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

    const results = await Promise.all(updatePromises);
    return results.filter((item): item is UnifiedProduct => item !== undefined);
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

    const ids = await unifiedOfflineDb.consumptions.bulkAdd(
      unifiedConsumptions as UnifiedConsumption[],
    );
    const results = await unifiedOfflineDb.consumptions.bulkGet(ids);
    return results.filter((item): item is UnifiedConsumption => item !== undefined);
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
