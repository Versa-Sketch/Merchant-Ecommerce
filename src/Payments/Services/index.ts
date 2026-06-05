import type { payoutFixtures } from './index.fixture';
export interface IPaymentsService { fetchPayouts(): Promise<typeof payoutFixtures>; }
