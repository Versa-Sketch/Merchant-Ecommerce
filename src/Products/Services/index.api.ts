import type { IProductsService } from './index';
import type { productFixtures } from './index.fixture';

export class ProductsApiService implements IProductsService {
  async fetchProducts(): Promise<typeof productFixtures> {
    throw new Error('Not implemented');
  }
}
