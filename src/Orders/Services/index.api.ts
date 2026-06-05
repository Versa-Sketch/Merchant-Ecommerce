import type { IOrdersService } from './index';
import type { orderFixtures } from './index.fixture';

export class OrdersApiService implements IOrdersService {
  async fetchOrders(): Promise<typeof orderFixtures> {
    throw new Error('Not implemented');
  }
}
