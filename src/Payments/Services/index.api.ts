import type { IPaymentsService } from './index';
import type { payoutFixtures } from './index.fixture';
export class PaymentsApiService implements IPaymentsService {
  async fetchPayouts(): Promise<typeof payoutFixtures> { throw new Error('Not implemented'); }
}
