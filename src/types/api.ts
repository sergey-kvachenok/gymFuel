export interface Product {
  id: number;
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  userId: number;
  createdAt: Date;
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

export interface ProductSearchOptions {
  query?: string;
  limit?: number;
  orderBy?: 'name' | 'createdAt';
  orderDirection?: 'asc' | 'desc';
}
