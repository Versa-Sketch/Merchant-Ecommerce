import type { adjustmentFixtures, alertFixtures } from './index.fixture';
export interface IInventoryService {
  fetchAdjustments(): Promise<typeof adjustmentFixtures>;
  fetchAlerts(): Promise<typeof alertFixtures>;
}
