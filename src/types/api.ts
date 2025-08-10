export interface Product {
  id: number;
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateProductInput = Pick<Product, 'name' | 'calories' | 'protein' | 'fat' | 'carbs'>;

export type UpdateProductInput = CreateProductInput & { id: number };

export interface DeleteProductInput {
  id: number;
}

export interface Consumption {
  id: number;
  amount: number;
  createdAt: Date;
  updatedAt: Date;
  date: Date;
  productId: number;
  userId: number;
  product: Product;
}

export type CreateConsumptionInput = Pick<Consumption, 'productId' | 'amount'>;

export interface UpdateConsumptionInput {
  id: number;
  amount: number;
}

export interface DeleteConsumptionInput {
  id: number;
}

export interface NutritionGoals {
  id: number;
  userId: number;
  dailyCalories: number;
  dailyProtein: number;
  dailyFat: number;
  dailyCarbs: number;
  goalType: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MutationResult<T> {
  data?: T;
  error?: string;
}

export interface EditableItem {
  id: number;
  [key: string]: unknown;
}

export interface ProductItem extends EditableItem {
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  userId: number;
  createdAt: Date;
}

export interface ConsumptionItem extends EditableItem {
  amount: number;
  createdAt: Date;
  productId: number;
  userId: number;
  product: ProductItem;
}

export interface EditData {
  [key: string]: string | number;
}

export interface MutationData {
  id: number;
  [key: string]: unknown;
}

export interface ApiMutation<TInput, TOutput> {
  mutate: (input: TInput) => void;
  isPending: boolean;
  data?: TOutput;
  error?: Error;
}

export interface EditableListMutation<TInput> {
  mutate: (data: TInput) => void;
  isPending: boolean;
  onSuccess?: () => void;
}

export interface OfflineChange<T> {
  id: number;
  _deleted?: boolean;
  _modified?: boolean;
  data?: T;
}

export interface OfflineChangeWithData<T> extends OfflineChange<T> {
  [key: string]: unknown;
}

export type OfflineChanges<T> = OfflineChange<T>[];
