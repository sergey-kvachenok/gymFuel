import { indexedDBService, OfflineProduct, OfflineConsumption, OfflineGoal, SyncOperation } from '@/lib/db/indexeddb';
import { CreateProductInput, UpdateProductInput, CreateConsumptionInput, UpdateConsumptionInput } from '@/types/api';
import { IFormData } from '@/app/(protected)/goals/types';

class OfflineStorageService {
  private isInitialized = false;

  async init(): Promise<void> {
    if (!this.isInitialized) {
      await indexedDBService.init();
      this.isInitialized = true;
    }
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.init();
    }
  }

  // Products
  async getProducts(userId: number): Promise<OfflineProduct[]> {
    await this.ensureInitialized();
    return indexedDBService.getProducts(userId);
  }

  async createProduct(userId: number, input: CreateProductInput): Promise<OfflineProduct> {
    await this.ensureInitialized();
    
    const product: Omit<OfflineProduct, 'id'> = {
      ...input,
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
      synced: false,
    };

    const savedProduct = await indexedDBService.addProduct(product);
    
    // Add to sync queue
    await this.addSyncOperation({
      type: 'CREATE',
      entity: 'product',
      data: input,
      timestamp: new Date(),
      userId,
    });

    return savedProduct;
  }

  async updateProduct(userId: number, input: UpdateProductInput): Promise<OfflineProduct> {
    await this.ensureInitialized();
    
    const existingProducts = await indexedDBService.getProducts(userId);
    const existing = existingProducts.find(p => p.id === input.id);
    
    if (!existing) {
      throw new Error('Product not found');
    }

    const updatedProduct: OfflineProduct = {
      ...existing,
      ...input,
      updatedAt: new Date(),
      synced: false,
    };

    const savedProduct = await indexedDBService.updateProduct(updatedProduct);
    
    // Add to sync queue
    await this.addSyncOperation({
      type: 'UPDATE',
      entity: 'product',
      entityId: input.id,
      data: input,
      timestamp: new Date(),
      userId,
    });

    return savedProduct;
  }

  async deleteProduct(userId: number, id: number): Promise<void> {
    await this.ensureInitialized();
    
    await indexedDBService.deleteProduct(id);
    
    // Add to sync queue
    await this.addSyncOperation({
      type: 'DELETE',
      entity: 'product',
      entityId: id,
      data: { id },
      timestamp: new Date(),
      userId,
    });
  }

  async syncProducts(userId: number, products: OfflineProduct[]): Promise<void> {
    await this.ensureInitialized();
    
    // Cache all products using put (insert or update)
    for (const product of products) {
      try {
        await indexedDBService.saveProduct(product);
        console.log('Successfully cached product:', product.name);
      } catch (error) {
        console.warn('Failed to cache product:', product.name, error);
      }
    }
  }

  // Consumption
  async getConsumption(userId: number): Promise<OfflineConsumption[]> {
    await this.ensureInitialized();
    return indexedDBService.getConsumption(userId);
  }

  async getConsumptionByDate(userId: number, date: Date): Promise<OfflineConsumption[]> {
    await this.ensureInitialized();
    return indexedDBService.getConsumptionByDate(userId, date);
  }

  async createConsumption(userId: number, input: CreateConsumptionInput): Promise<OfflineConsumption> {
    await this.ensureInitialized();
    
    // Get product data for offline consumption
    const products = await indexedDBService.getProducts(userId);
    const product = products.find(p => p.id === input.productId);
    
    if (!product) {
      throw new Error('Product not found');
    }

    const consumption: Omit<OfflineConsumption, 'id'> = {
      ...input,
      userId,
      date: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      synced: false,
      product,
    };

    const savedConsumption = await indexedDBService.addConsumption(consumption);
    
    // Add to sync queue
    await this.addSyncOperation({
      type: 'CREATE',
      entity: 'consumption',
      data: input,
      timestamp: new Date(),
      userId,
    });

    return savedConsumption;
  }

  async updateConsumption(userId: number, input: UpdateConsumptionInput): Promise<OfflineConsumption> {
    await this.ensureInitialized();
    
    const existingConsumptions = await indexedDBService.getConsumption(userId);
    const existing = existingConsumptions.find(c => c.id === input.id);
    
    if (!existing) {
      throw new Error('Consumption not found');
    }

    const updatedConsumption: OfflineConsumption = {
      ...existing,
      amount: input.amount,
      updatedAt: new Date(),
      synced: false,
    };

    const savedConsumption = await indexedDBService.updateConsumption(updatedConsumption);
    
    // Add to sync queue
    await this.addSyncOperation({
      type: 'UPDATE',
      entity: 'consumption',
      entityId: input.id,
      data: input,
      timestamp: new Date(),
      userId,
    });

    return savedConsumption;
  }

  async deleteConsumption(userId: number, id: number): Promise<void> {
    await this.ensureInitialized();
    
    await indexedDBService.deleteConsumption(id);
    
    // Add to sync queue
    await this.addSyncOperation({
      type: 'DELETE',
      entity: 'consumption',
      entityId: id,
      data: { id },
      timestamp: new Date(),
      userId,
    });
  }

  async syncConsumption(_userId: number, consumption: OfflineConsumption[]): Promise<void> {
    await this.ensureInitialized();
    
    // Cache all consumption using put (insert or update)
    for (const item of consumption) {
      try {
        await indexedDBService.saveConsumption(item);
        console.log('Successfully cached consumption item:', item.id);
      } catch (error) {
        console.warn('Failed to cache consumption:', item.id, error);
      }
    }
  }

  // Goals
  async getGoals(userId: number): Promise<OfflineGoal[]> {
    await this.ensureInitialized();
    return indexedDBService.getGoals(userId);
  }

  async createGoal(userId: number, input: IFormData): Promise<OfflineGoal> {
    await this.ensureInitialized();
    
    const goal: Omit<OfflineGoal, 'id'> = {
      ...input,
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
      synced: false,
    };

    const savedGoal = await indexedDBService.addGoal(goal);
    
    // Add to sync queue
    await this.addSyncOperation({
      type: 'CREATE',
      entity: 'goal',
      data: input,
      timestamp: new Date(),
      userId,
    });

    return savedGoal;
  }

  async updateGoal(userId: number, id: number, input: IFormData): Promise<OfflineGoal> {
    await this.ensureInitialized();
    
    const existingGoals = await indexedDBService.getGoals(userId);
    const existing = existingGoals.find(g => g.id === id);
    
    if (!existing) {
      throw new Error('Goal not found');
    }

    const updatedGoal: OfflineGoal = {
      ...existing,
      ...input,
      updatedAt: new Date(),
      synced: false,
    };

    const savedGoal = await indexedDBService.updateGoal(updatedGoal);
    
    // Add to sync queue
    await this.addSyncOperation({
      type: 'UPDATE',
      entity: 'goal',
      entityId: id,
      data: input,
      timestamp: new Date(),
      userId,
    });

    return savedGoal;
  }

  // Sync operations
  private async addSyncOperation(operation: Omit<SyncOperation, 'id'>): Promise<SyncOperation> {
    return indexedDBService.addSyncOperation(operation);
  }

  async getSyncOperations(userId: number): Promise<SyncOperation[]> {
    await this.ensureInitialized();
    return indexedDBService.getSyncOperations(userId);
  }

  async clearSyncOperations(userId: number): Promise<void> {
    await this.ensureInitialized();
    return indexedDBService.clearSyncOperations(userId);
  }

  async deleteSyncOperation(id: number): Promise<void> {
    await this.ensureInitialized();
    return indexedDBService.deleteSyncOperation(id);
  }

  // Daily stats calculation (offline version)
  async getDailyStats(userId: number, date?: string) {
    await this.ensureInitialized();
    
    const targetDate = date ? new Date(date) : new Date();
    const consumptions = await this.getConsumptionByDate(userId, targetDate);
    
    console.log(`📊 getDailyStats for ${targetDate.toISOString().split('T')[0]}: found ${consumptions.length} consumptions`);

    const stats = consumptions.reduce(
      (acc, consumption) => {
        const ratio = consumption.amount / 100;
        acc.totalCalories += consumption.product.calories * ratio;
        acc.totalProtein += consumption.product.protein * ratio;
        acc.totalFat += consumption.product.fat * ratio;
        acc.totalCarbs += consumption.product.carbs * ratio;
        acc.consumptionsCount += 1;
        return acc;
      },
      {
        date: targetDate.toISOString().split('T')[0],
        totalCalories: 0,
        totalProtein: 0,
        totalFat: 0,
        totalCarbs: 0,
        consumptionsCount: 0,
      },
    );

    return stats;
  }
}

export const offlineStorage = new OfflineStorageService();