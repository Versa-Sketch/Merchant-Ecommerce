import type { IDashboardService } from './index';
import type { insightFixtures } from './index.fixture';
export class DashboardApiService implements IDashboardService {
  async fetchInsights(): Promise<typeof insightFixtures> { throw new Error('Not implemented'); }
}
