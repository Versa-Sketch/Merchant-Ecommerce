import type { orderFixtures } from './index.fixture';

export interface IOrdersService {
  fetchOrders(): Promise<typeof orderFixtures>;
}
