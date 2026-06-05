import type { IInventoryService } from './index';
import type { adjustmentFixtures, alertFixtures } from './index.fixture';
export class InventoryApiService implements IInventoryService {
  async fetchAdjustments(): Promise<typeof adjustmentFixtures> { throw new Error('Not implemented'); }
  async fetchAlerts(): Promise<typeof alertFixtures> { throw new Error('Not implemented'); }
}
