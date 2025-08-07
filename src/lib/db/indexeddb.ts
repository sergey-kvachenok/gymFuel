import {
  Product,
  Consumption,
  CreateProductInput,
  UpdateProductInput,
  CreateConsumptionInput,
  UpdateConsumptionInput,
  EditableItem,
} from '@/types/api';
import { IFormData } from '@/app/(protected)/goals/types';

export interface OfflineProduct extends Product, EditableItem {
  synced?: boolean;
  updatedAt: Date;
}

export interface OfflineConsumption extends Consumption, EditableItem {
  synced?: boolean;
  updatedAt: Date;
  date: Date;
  product: Product & { [key: string]: unknown };
}

export interface OfflineGoal extends IFormData {
  id?: number;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
  synced?: boolean;
}

export interface SyncOperation {
  id?: number;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  entity: 'product' | 'consumption' | 'goal';
  entityId?: number;
  data:
    | CreateProductInput
    | UpdateProductInput
    | CreateConsumptionInput
    | UpdateConsumptionInput
    | IFormData
    | { id: number };
  timestamp: Date;
  userId: number;
}

class IndexedDBService {
  private dbName = 'GymFuelDb';
  private version = 2;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log('Initializing IndexedDB:', this.dbName, 'version:', this.version);
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        console.error('IndexedDB initialization failed:', request.error);
        reject(request.error);
      };
      request.onsuccess = () => {
        this.db = request.result;
        console.log('IndexedDB initialized successfully');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        console.log('IndexedDB upgrade needed');
        const db = (event.target as IDBOpenDBRequest).result;

        // Products store
        if (!db.objectStoreNames.contains('products')) {
          console.log('Creating products store');
          const productStore = db.createObjectStore('products', {
            keyPath: 'id',
            autoIncrement: false, // Changed to false since we're using API IDs
          });
          productStore.createIndex('userId', 'userId', { unique: false });
        }

        // Consumption store
        if (!db.objectStoreNames.contains('consumption')) {
          console.log('Creating consumption store');
          const consumptionStore = db.createObjectStore('consumption', {
            keyPath: 'id',
            autoIncrement: false, // Changed to false since we're using API IDs
          });
          consumptionStore.createIndex('userId', 'userId', { unique: false });
        }

        // Goals store
        if (!db.objectStoreNames.contains('goals')) {
          console.log('Creating goals store');
          const goalsStore = db.createObjectStore('goals', {
            keyPath: 'id',
            autoIncrement: true, // Keep true for goals since they're created locally
          });
          goalsStore.createIndex('userId', 'userId', { unique: false });
        }

        // Sync operations store
        if (!db.objectStoreNames.contains('syncOperations')) {
          console.log('Creating syncOperations store');
          const syncStore = db.createObjectStore('syncOperations', {
            keyPath: 'id',
            autoIncrement: true, // Keep true for sync operations since they're created locally
          });
          syncStore.createIndex('userId', 'userId', { unique: false });
        }
      };
    });
  }

  private getStore(storeName: string, mode: IDBTransactionMode = 'readonly') {
    if (!this.db) throw new Error('Database not initialized');
    const transaction = this.db.transaction([storeName], mode);
    return transaction.objectStore(storeName);
  }

  // Products operations
  async getProducts(userId: number): Promise<OfflineProduct[]> {
    const store = this.getStore('products');
    const index = store.index('userId');

    return new Promise((resolve, reject) => {
      console.log('Getting products from IndexedDB for userId:', userId);
      const request = index.getAll(userId);
      request.onsuccess = () => {
        console.log('Retrieved products from IndexedDB:', request.result);
        resolve(request.result);
      };
      request.onerror = () => {
        console.error('Failed to get products from IndexedDB:', request.error);
        reject(request.error);
      };
    });
  }

  async addProduct(product: Omit<OfflineProduct, 'id'>): Promise<OfflineProduct> {
    const store = this.getStore('products', 'readwrite');

    return new Promise((resolve, reject) => {
      const request = store.add(product);
      request.onsuccess = () => {
        resolve({ ...product, id: request.result as number } as OfflineProduct);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Method to save products with existing IDs (from API)
  async saveProduct(product: OfflineProduct): Promise<OfflineProduct> {
    const store = this.getStore('products', 'readwrite');

    return new Promise((resolve, reject) => {
      const request = store.put(product);
      request.onsuccess = () => {
        resolve(product);
      };
      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async updateProduct(product: OfflineProduct): Promise<OfflineProduct> {
    const store = this.getStore('products', 'readwrite');

    return new Promise((resolve, reject) => {
      const request = store.put(product);
      request.onsuccess = () => resolve(product);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteProduct(id: number): Promise<void> {
    const store = this.getStore('products', 'readwrite');

    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Consumption operations
  async getConsumption(userId: number): Promise<OfflineConsumption[]> {
    const store = this.getStore('consumption');
    const index = store.index('userId');

    return new Promise((resolve, reject) => {
      const request = index.getAll(userId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getConsumptionByDate(userId: number, date: Date): Promise<OfflineConsumption[]> {
    const store = this.getStore('consumption');
    const index = store.index('userId');

    return new Promise((resolve, reject) => {
      const request = index.getAll(userId);
      request.onsuccess = () => {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const filtered = request.result.filter((consumption: OfflineConsumption) => {
          const consumptionDate = new Date(consumption.date);
          return consumptionDate >= startOfDay && consumptionDate <= endOfDay;
        });

        resolve(filtered);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async addConsumption(consumption: Omit<OfflineConsumption, 'id'>): Promise<OfflineConsumption> {
    const store = this.getStore('consumption', 'readwrite');

    return new Promise((resolve, reject) => {
      const request = store.add(consumption);
      request.onsuccess = () => {
        resolve({ ...consumption, id: request.result as number } as OfflineConsumption);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Method to save consumption with existing IDs (from API)
  async saveConsumption(consumption: OfflineConsumption): Promise<OfflineConsumption> {
    const store = this.getStore('consumption', 'readwrite');

    return new Promise((resolve, reject) => {
      const request = store.put(consumption);
      request.onsuccess = () => resolve(consumption);
      request.onerror = () => reject(request.error);
    });
  }

  async updateConsumption(consumption: OfflineConsumption): Promise<OfflineConsumption> {
    const store = this.getStore('consumption', 'readwrite');

    return new Promise((resolve, reject) => {
      const request = store.put(consumption);
      request.onsuccess = () => resolve(consumption);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteConsumption(id: number): Promise<void> {
    const store = this.getStore('consumption', 'readwrite');

    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Goals operations
  async getGoals(userId: number): Promise<OfflineGoal[]> {
    const store = this.getStore('goals');
    const index = store.index('userId');

    return new Promise((resolve, reject) => {
      const request = index.getAll(userId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async addGoal(goal: Omit<OfflineGoal, 'id'>): Promise<OfflineGoal> {
    const store = this.getStore('goals', 'readwrite');

    return new Promise((resolve, reject) => {
      const request = store.add(goal);
      request.onsuccess = () => {
        resolve({ ...goal, id: request.result as number } as OfflineGoal);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async updateGoal(goal: OfflineGoal): Promise<OfflineGoal> {
    const store = this.getStore('goals', 'readwrite');

    return new Promise((resolve, reject) => {
      const request = store.put(goal);
      request.onsuccess = () => resolve(goal);
      request.onerror = () => reject(request.error);
    });
  }

  // Sync operations
  async addSyncOperation(operation: Omit<SyncOperation, 'id'>): Promise<SyncOperation> {
    const store = this.getStore('syncOperations', 'readwrite');

    return new Promise((resolve, reject) => {
      const request = store.add(operation);
      request.onsuccess = () => {
        resolve({ ...operation, id: request.result as number } as SyncOperation);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getSyncOperations(userId: number): Promise<SyncOperation[]> {
    const store = this.getStore('syncOperations');
    const index = store.index('userId');

    return new Promise((resolve, reject) => {
      const request = index.getAll(userId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteSyncOperation(id: number): Promise<void> {
    const store = this.getStore('syncOperations', 'readwrite');

    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clearSyncOperations(userId: number): Promise<void> {
    const store = this.getStore('syncOperations', 'readwrite');
    const index = store.index('userId');

    return new Promise((resolve, reject) => {
      const request = index.getAll(userId);
      request.onsuccess = () => {
        const operations = request.result;
        const deletePromises = operations.map((op: SyncOperation) => {
          return new Promise<void>((deleteResolve, deleteReject) => {
            const deleteRequest = store.delete(op.id!);
            deleteRequest.onsuccess = () => deleteResolve();
            deleteRequest.onerror = () => deleteReject(deleteRequest.error);
          });
        });

        Promise.all(deletePromises)
          .then(() => resolve())
          .catch(reject);
      };
      request.onerror = () => reject(request.error);
    });
  }
}

export const indexedDBService = new IndexedDBService();
