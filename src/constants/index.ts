import { ProductSearchOptions } from '@/types/api';

export const INITIAL_SEARCH_OPTIONS: ProductSearchOptions = {
  query: '',
  limit: 100,
  orderBy: 'createdAt',
  orderDirection: 'desc',
};
