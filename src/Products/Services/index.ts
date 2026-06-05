import type { productFixtures } from './index.fixture';

export interface IProductsService {
  fetchProducts(): Promise<typeof productFixtures>;
}
