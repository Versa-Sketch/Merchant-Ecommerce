import type { ICustomersService } from './index';
import type { customerFixtures } from './index.fixture';
export class CustomersApiService implements ICustomersService {
  async fetchCustomers(): Promise<typeof customerFixtures> { throw new Error('Not implemented'); }
}
