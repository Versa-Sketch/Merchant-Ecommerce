import type { customerFixtures } from './index.fixture';
export interface ICustomersService { fetchCustomers(): Promise<typeof customerFixtures>; }
