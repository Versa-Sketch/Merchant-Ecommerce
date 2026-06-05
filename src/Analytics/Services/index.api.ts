import type { IAnalyticsService } from './index';
import type { analyticsFixtures } from './index.fixture';
export class AnalyticsApiService implements IAnalyticsService {
  async fetchAnalytics(): Promise<typeof analyticsFixtures> { throw new Error('Not implemented'); }
}
