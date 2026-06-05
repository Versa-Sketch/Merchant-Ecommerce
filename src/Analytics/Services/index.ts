import type { analyticsFixtures } from './index.fixture';
export interface IAnalyticsService { fetchAnalytics(): Promise<typeof analyticsFixtures>; }
