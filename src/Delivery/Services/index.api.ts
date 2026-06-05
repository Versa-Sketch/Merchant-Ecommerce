import type { IDeliveryService } from './index';
import type { deliveryPartnerFixtures } from './index.fixture';
export class DeliveryApiService implements IDeliveryService {
  async fetchPartners(): Promise<typeof deliveryPartnerFixtures> { throw new Error('Not implemented'); }
}
