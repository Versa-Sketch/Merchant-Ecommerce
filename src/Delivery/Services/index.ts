import type { deliveryPartnerFixtures } from './index.fixture';
export interface IDeliveryService { fetchPartners(): Promise<typeof deliveryPartnerFixtures>; }
